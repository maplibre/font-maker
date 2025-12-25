#define BOOST_NO_CXX98_FUNCTION_BASE
// workaround unary_function in boost::geometry
#include <cstdint>
#include "mapbox/glyph_foundry.hpp"
#include "mapbox/glyph_foundry_impl.hpp"
#include <protozero/pbf_writer.hpp>

#ifndef EMSCRIPTEN
#include "ghc/filesystem.hpp"

// allow font filenames with commas
#define CXXOPTS_VECTOR_DELIMITER '\0'
#include "cxxopts.hpp"
#endif
#include <iostream>
#include <hb.h>
#include <hb-ft.h>

using namespace std;

FT_UInt get_glyph_index(hb_font_t *hb_font, hb_buffer_t *buffer, FT_ULong char_code, bool top_to_bottom) {
    FT_UInt result = 0;
    uint32_t utf32_char = static_cast<uint32_t>(char_code);
    hb_buffer_clear_contents(buffer);
    hb_buffer_add_utf32(buffer, &utf32_char, 1, 0, 1);
    if (top_to_bottom) {
        hb_buffer_set_direction(buffer, HB_DIRECTION_TTB);
    }
    hb_buffer_guess_segment_properties(buffer);
    hb_shape(hb_font, buffer, nullptr, 0);
    unsigned int glyph_count;
    hb_glyph_info_t *glyph_info = hb_buffer_get_glyph_infos(buffer, &glyph_count);
    if (glyph_count > 0) {
        result = glyph_info[0].codepoint;
    }
    return result;
}


FT_UInt get_glyph_index(const std::string &font_path, FT_ULong char_code, bool top_to_bottom) {
    FT_UInt result = 0;
    FT_Library ft_library;
    if (FT_Init_FreeType(&ft_library)) {
        std::cerr << "Failed to initialize FreeType library." << std::endl;
        return result;
    }
    FT_Face face;
    if (FT_New_Face(ft_library, font_path.c_str(), 0, &face)) {
        std::cerr << "Failed to load font: " << font_path << std::endl;
        FT_Done_FreeType(ft_library);
        return result;
    }
    hb_font_t *hb_font = hb_ft_font_create(face, nullptr);
    hb_buffer_t *buffer = hb_buffer_create();

    result = get_glyph_index(hb_font, buffer, char_code, top_to_bottom);

    hb_buffer_destroy(buffer);
    hb_font_destroy(hb_font);
    FT_Done_Face(face);
    FT_Done_FreeType(ft_library);
    return result;
}



void do_codepoint(protozero::pbf_writer &parent, std::vector<hb_font_t*> hb_fonts, hb_buffer_t *hb_buffer, FT_ULong char_code) {

    for (auto hb_font : hb_fonts) {
        bool top_to_bottom = true;
        FT_UInt glyph_index = get_glyph_index(hb_font, hb_buffer, char_code, top_to_bottom);
        // FT_UInt char_index = 0; //get_glyph_index(face, char_code, false);
        FT_Face face = hb_ft_font_get_face(hb_font);
        if (glyph_index > 0) {
            sdf_glyph_foundry::glyph_info glyph;
            glyph.glyph_index = glyph_index;
            sdf_glyph_foundry::RenderSDF(glyph, 24, 3, 0.25, face);

            string glyph_data;
            protozero::pbf_writer glyph_message{glyph_data};

            // direct type conversions, no need for checking or casting
            glyph_message.add_uint32(3, glyph.width);
            glyph_message.add_uint32(4, glyph.height);
            glyph_message.add_sint32(5, glyph.left);

            // conversions requiring checks, for safety and correctness

            // shortening conversion
            if (char_code > numeric_limits<uint32_t>::max()) {
                throw runtime_error("Invalid value for char_code: too large");
            } else {
                glyph_message.add_uint32(1, static_cast<uint32_t>(char_code));
            }

            // node-fontnik uses glyph.top - glyph.ascender, assuming that the baseline
            // will be based on the ascender. However, Mapbox/MapLibre shaping assumes
            // a baseline calibrated on DIN Pro w/ ascender of ~25 at 24pt
            int32_t top = glyph.top - 25;
            if (top < numeric_limits<int32_t>::min() || top > numeric_limits<int32_t>::max()) {
                throw runtime_error("Invalid value for glyph.top-25");
            } else {
                glyph_message.add_sint32(6, top);
            }

            // double to uint
            if (glyph.advance < numeric_limits<uint32_t>::min() || glyph.advance > numeric_limits<uint32_t>::max()) {
                throw runtime_error("Invalid value for glyph.top-glyph.ascender");
            } else {
                glyph_message.add_uint32(7, static_cast<uint32_t>(glyph.advance));
            }

            if (glyph.width > 0) {
                glyph_message.add_bytes(2, glyph.bitmap);
            }
            parent.add_message(3, glyph_data);
            return;
        }
    }
}

string do_range(std::vector<hb_font_t*> hb_fonts, hb_buffer_t *hb_buffer, std::string name, unsigned start, unsigned end) {
    string fontstack_data;
    {
        protozero::pbf_writer fontstack{fontstack_data};

        fontstack.add_string(1, name);
        fontstack.add_string(2, to_string(start) + "-" + to_string(end)); 

        for (unsigned x = start; x <= end; x++) {
            FT_ULong char_code = x;
            do_codepoint(fontstack, hb_fonts, hb_buffer, x);
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
    std::vector<FT_Face> *faces;
    std::vector<hb_font_t *> *hb_fonts;
    hb_buffer_t *hb_buffer;
    std::vector<char *> *data;
    std::set<std::string> *seen_face_names;
    std::string *name;
    bool auto_name;
};

struct glyph_buffer {
    char *data;
    uint32_t size;
};

extern "C" {
    fontstack *create_fontstack(const char *name) {
        fontstack *f = (fontstack *)malloc(sizeof(fontstack));
        f->faces = new std::vector<FT_Face>;
        f->hb_fonts = new std::vector<hb_font_t *>;
        f->hb_buffer = hb_buffer_create();
        f->data = new std::vector<char *>;
        f->seen_face_names = new std::set<std::string>;

        if (name != nullptr) {
            f->name = new std::string(name);
            f->auto_name = false;
        } else {
            f->name = new std::string;
            f->auto_name = true;
        }

        FT_Library library = nullptr;
        FT_Error error = FT_Init_FreeType(&library);

        f->library = library;
        return f;
    }

    void fontstack_add_face(fontstack *f, FT_Byte *base, FT_Long data_size) {
        FT_Face face = 0;
        FT_Error face_error = FT_New_Memory_Face(f->library, base, data_size, 0, &face);
        if (face_error) {
            throw runtime_error("Could not open font face");
        }
        if (face->num_faces > 1) {
            throw runtime_error("file has multiple faces; cowardly exiting");
        }
        if (!face->family_name) {
            throw runtime_error("face does not have family name");
        }
        const double scale_factor = 1.0;
        double size = 24 * scale_factor;
        FT_Set_Char_Size(face, 0, static_cast<FT_F26Dot6>(size * (1 << 6)), 0, 0);
        f->faces->push_back(face);
        f->hb_fonts->push_back(hb_ft_font_create(face, nullptr));

        if (f->auto_name) {
            std::string combined_name = std::string(face->family_name);
            if (face->style_name != NULL) {
                combined_name += " " + std::string(face->style_name);
            }

            if (f->seen_face_names->count(combined_name) == 0) {
                if (f->seen_face_names->size() > 0) {
                  *f->name += ",";
                }
                *f->name += combined_name;
                f->seen_face_names->insert(combined_name);
            }
        }
    }

    void free_fontstack(fontstack *f) {
        hb_buffer_destroy(f->hb_buffer);

        for (auto hb_font : *f->hb_fonts) {
            hb_font_destroy(hb_font);
        }
        for (auto fc : *f->faces) {
            FT_Done_Face(fc);
        }
        for (auto d : *f->data) {
            free(d);
        }
        FT_Done_FreeType(f->library);
        delete f->faces;
        delete f->name;
        delete f->seen_face_names;
        free(f);
    }

    char *fontstack_name(fontstack *f) {
        char *fname = (char *)malloc((f->name->size() + 1) * sizeof(char));
        strcpy(fname, f->name->c_str());
        return fname;
    }

    glyph_buffer *generate_glyph_buffer(fontstack *f, uint32_t start_codepoint) {
        string result = do_range(*f->hb_fonts, f->hb_buffer, *f->name, start_codepoint, start_codepoint + 255);

        glyph_buffer *g = (glyph_buffer *)malloc(sizeof(glyph_buffer));
        char *result_ptr = (char *)malloc(result.size());
        result.copy(result_ptr, result.size());
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
    // cout << get_glyph_index("NotoSansJP-Regular.ttf", 0x30FC, false) << endl;
    // return;

    cxxopts::Options cmd_options("font-maker", "Create font PBFs from TTFs or OTFs.");
    cmd_options.add_options()
        ("output", "Output directory (to be created, must not already exist)", cxxopts::value<string>())
        ("fonts", "Input font(s) (as TTF or OTF)", cxxopts::value<vector<string>>())
        ("name", "Override output fontstack name", cxxopts::value<string>())
        ("help", "Print usage")
    ;
    cmd_options.positional_help("--output OUTPUT_DIR --fonts FONT1 FONT1 --name FONTSTACK_NAME");
    cmd_options.parse_positional({"output","fonts"});
    auto result = cmd_options.parse(argc, argv);
    if (result.count("help"))
    {
      cout << cmd_options.help() << endl;
      exit(0);
    }
    if (result.count("output") == 0 || result.count("fonts") == 0) {
        cout << cmd_options.help() << endl;
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

    fontstack *f = create_fontstack(result["name"].as<string>().c_str());

    for (auto const &font : fonts) {
        std::ifstream file(font, std::ios::binary | std::ios::ate);
        std::streamsize size = file.tellg();
        file.seekg(0, std::ios::beg);

        char * buffer = (char *)malloc(size);
        f->data->push_back(buffer);
        file.read(buffer, size);
        std::cout << "Adding " << font << std::endl;
        fontstack_add_face(f, (FT_Byte *)buffer,size);
    }

    std::string fname{fontstack_name(f)};

    ghc::filesystem::create_directory(output_dir + "/" + fname);

    for (int i = 0; i < 65536; i += 256) {
        glyph_buffer *g = generate_glyph_buffer(f, i);
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
