#define BOOST_NO_CXX98_FUNCTION_BASE
// workaround unary_function in boost::geometry
#include "mapbox/glyph_foundry.hpp"
#include "mapbox/glyph_foundry_impl.hpp"
#include <protozero/pbf_writer.hpp>

#ifndef EMSCRIPTEN
#include "ghc/filesystem.hpp"
#include "cxxopts.hpp"
#endif
#include <iostream>

using namespace std;

void do_codepoint(protozero::pbf_writer &parent, FT_Face face, FT_ULong char_code) {
        FT_UInt char_index = FT_Get_Char_Index(face, char_code);

        if (!char_index) {
            return;
        }

        sdf_glyph_foundry::glyph_info glyph;
        glyph.glyph_index = char_index;
        sdf_glyph_foundry::RenderSDF(glyph, 24, 3, 0.25, face);

        string glyph_data;
        protozero::pbf_writer glyph_message{glyph_data};

        // direct type conversions, no need for checking or casting
        glyph_message.add_uint32(3,glyph.width);
        glyph_message.add_uint32(4,glyph.height);
        glyph_message.add_sint32(5,glyph.left);

        // conversions requiring checks, for safety and correctness

        // shortening conversion
        if (char_code > numeric_limits<FT_ULong>::max()) {
            throw runtime_error("Invalid value for char_code: too large");
        } else {
            glyph_message.add_uint32(1,static_cast<uint32_t>(char_code));
        }

        // double to int
        double top = static_cast<double>(glyph.top) - glyph.ascender;
        if (top < numeric_limits<int32_t>::min() || top > numeric_limits<int32_t>::max()) {
            throw runtime_error("Invalid value for glyph.top-glyph.ascender");
        } else {
            glyph_message.add_sint32(6,static_cast<int32_t>(top));
        }

        // double to uint
        if (glyph.advance < numeric_limits<uint32_t>::min() || glyph.advance > numeric_limits<uint32_t>::max()) {
            throw runtime_error("Invalid value for glyph.top-glyph.ascender");
        } else {
            glyph_message.add_uint32(7,static_cast<uint32_t>(glyph.advance));
        }

        if (glyph.width > 0) {
            glyph_message.add_bytes(2,glyph.bitmap);
        }
        parent.add_message(3,glyph_data);
}

string do_range(FT_Face face, char *name, unsigned start, unsigned end) {
    string fontstack_data;
    {
        protozero::pbf_writer fontstack{fontstack_data};

        fontstack.add_string(1,name);
        fontstack.add_string(2,to_string(start) + "-" + to_string(end)); 

        for (unsigned x = start; x <= end; x++) {
            FT_ULong char_code = x;
            do_codepoint(fontstack,face, x);
        }
    }

    string glyphs_data;
    {
        protozero::pbf_writer glyphs{glyphs_data};
        glyphs.add_message(1,fontstack_data);
    }
    return glyphs_data;
}

struct fontstack {
    FT_Library library;
    FT_Face face;
    char *name;
};

struct glyph_buffer {
    char *data;
    uint32_t size;
};

extern "C" {
    fontstack *create_fontstack(const FT_Byte *base, FT_Long data_size) {
        fontstack *f = (fontstack *)malloc(sizeof(fontstack));
        FT_Library library = nullptr;
        FT_Error error = FT_Init_FreeType(&library);
        FT_Face face = 0;
        FT_Error face_error = FT_New_Memory_Face(library, base, data_size, 0, &face);
        if (face_error) {
            throw runtime_error("Could not open font face");
        }
        if (face->num_faces > 1) {
            throw runtime_error("file has multiple faces; cowardly exiting");
        }
        if (!face->family_name) {
            throw runtime_error("face does not have family name");
        }

        std::string combined_name = std::string(face->family_name) + " " + std::string(face->style_name);
        char *fname = (char *)malloc(combined_name.size() * sizeof(char));
        strcpy(fname,combined_name.c_str());
        f->name = fname;


        const double scale_factor = 1.0;
        double size = 24 * scale_factor;
        FT_Set_Char_Size(face, 0, static_cast<FT_F26Dot6>(size * (1 << 6)), 0, 0);
        f->library = library;
        f->face = face;
        return f;
    }

    void free_fontstack(fontstack *f) {
        FT_Done_Face(f->face);
        FT_Done_FreeType(f->library);
        free(f);
    }

    char *fontstack_name(fontstack *f) {
        return f->name;
    }

    glyph_buffer *generate_glyph_buffer(fontstack *f, uint32_t start_codepoint) {
        string result = do_range(f->face,f->name,start_codepoint,start_codepoint+255);

        glyph_buffer *g = (glyph_buffer *)malloc(sizeof(glyph_buffer));
        char *result_ptr = (char *)malloc(result.size());
        result.copy(result_ptr,result.size());
        g->data = result_ptr;
        g->size = result.size();
        return g;
    }

    char *glyph_buffer_data(glyph_buffer *g) {
        return g->data;
    }

    uint32_t glyph_buffer_size(glyph_buffer *g) {
        return g->size;
    }

    void free_glyph_buffer(glyph_buffer *g) {
        free(g->data);
        free(g);
    }
}

#ifndef EMSCRIPTEN
int main(int argc, char *argv[])
{
    cxxopts::Options cmd_options("maplibre-font-maker", "Create font PBFs.");
    cmd_options.add_options()
        ("output", "Output directory", cxxopts::value<string>())
        ("fonts", "Input fonts TTF or OTF", cxxopts::value<vector<string>>())
    ;
    cmd_options.parse_positional({"output","fonts"});
    auto result = cmd_options.parse(argc, argv);
    if (result.count("output") == 0 || result.count("fonts") == 0) {
        cout << "usage: maplibre-font-maker OUTPUT_DIR INPUT_FONT [INPUT_FONT2 ...]" << endl;
        exit(1);
    }
    auto output_dir = result["output"].as<string>();
    auto fonts = result["fonts"].as<vector<string>>();

    if (ghc::filesystem::exists(output_dir)) {
        cout << "ERROR: output directory " << output_dir << " exists." << endl;
        exit(1);
    }
    if (ghc::filesystem::exists(output_dir)) ghc::filesystem::remove_all(output_dir);
    ghc::filesystem::create_directory(output_dir);

    std::ifstream file(fonts[0], std::ios::binary | std::ios::ate);
    std::streamsize size = file.tellg();
    file.seekg(0, std::ios::beg);

    std::vector<char> buffer(size);
    file.read(buffer.data(), size);

    fontstack *f = create_fontstack((FT_Byte *)buffer.data(),size);

    std::string fname{fontstack_name(f)};

    ghc::filesystem::create_directory(output_dir + "/" + fname);

    for (int i = 0; i < 65536; i += 256) {
        glyph_buffer *g = generate_glyph_buffer(f,i);
        char *data = glyph_buffer_data(g);
        uint32_t buffer_size = glyph_buffer_size(g);

        ofstream output;
        std::string outname = output_dir + "/" + fname + "/" + to_string(i) + "-" + to_string(i+255) + ".pbf";
        output.open(outname);
        output.write(data,buffer_size);
        output.close();

        std::cout << "Wrote " << outname << std::endl;

        free_glyph_buffer(g);
    }

    free_fontstack(f);

    return 0;
}
#endif