#include <fcntl.h> 
#include <iostream>
#include <fstream>
#include "mapbox/glyph_foundry.hpp"
#include "mapbox/glyph_foundry_impl.hpp"
#include "cxxopts.hpp"
// #include "ghc/filesystem.hpp"
// #include "glyphs.pb.h"

using namespace std;

extern "C" {
    int read_face(const FT_Byte *base, FT_Long size, char *result_ptr) {
        cout << "Hello from Function" << endl;

        FT_Library library = nullptr;
        FT_Error error = FT_Init_FreeType(&library);
        FT_Face face = 0;
        FT_Error face_error = FT_New_Memory_Face(library, base, size, 0, &face);
        cout << "Loaded" << endl;
        if (face_error) {
            throw runtime_error("Could not open font face");
        }
        if (face->num_faces > 1) {
            throw runtime_error("file has multiple faces; cowardly exiting");
        }
        if (!face->family_name) {
            throw runtime_error("face does not have family name");
        }
        std::string foo = face->family_name;
        foo.copy(result_ptr,foo.size());
        return foo.size();
    }
}

// void do_codepoint(vector<FT_Face> &faces, llmr::glyphs::fontstack* mutable_fontstack, FT_ULong char_code) {
//     for (auto &face : faces) {
//         FT_UInt char_index = FT_Get_Char_Index(face, char_code);

//         if (!char_index) {
//             continue;
//         }

//         sdf_glyph_foundry::glyph_info glyph;
//         glyph.glyph_index = char_index;
//         sdf_glyph_foundry::RenderSDF(glyph, 24, 3, 0.25, face);

//         // Add glyph to fontstack.
//         llmr::glyphs::glyph* mutable_glyph = mutable_fontstack->add_glyphs();

//         // direct type conversions, no need for checking or casting
//         mutable_glyph->set_width(glyph.width);
//         mutable_glyph->set_height(glyph.height);
//         mutable_glyph->set_left(glyph.left);

//         // conversions requiring checks, for safety and correctness

//         // shortening conversion
//         if (char_code > numeric_limits<FT_ULong>::max()) {
//             throw runtime_error("Invalid value for char_code: too large");
//         } else {
//             mutable_glyph->set_id(static_cast<uint32_t>(char_code));
//         }

//         // double to int
//         double top = static_cast<double>(glyph.top) - glyph.ascender;
//         if (top < numeric_limits<int32_t>::min() || top > numeric_limits<int32_t>::max()) {
//             throw runtime_error("Invalid value for glyph.top-glyph.ascender");
//         } else {
//             mutable_glyph->set_top(static_cast<int32_t>(top));
//         }

//         // double to uint
//         if (glyph.advance < numeric_limits<uint32_t>::min() || glyph.advance > numeric_limits<uint32_t>::max()) {
//             throw runtime_error("Invalid value for glyph.top-glyph.ascender");
//         } else {
//             mutable_glyph->set_advance(static_cast<uint32_t>(glyph.advance));
//         }

//         if (glyph.width > 0) {
//             mutable_glyph->set_bitmap(glyph.bitmap);
//         }
//         return;
//     }
// }

void do_range(vector<FT_Face> &faces, const string &output_dir, unsigned start, unsigned end) {
    // llmr::glyphs::glyphs glyphs;

    // llmr::glyphs::fontstack* mutable_fontstack = glyphs.add_stacks();
    // mutable_fontstack->set_name(""); // this is not used yet
    // mutable_fontstack->set_range(to_string(start) + "-" + to_string(end));

    // for (unsigned x = start; x <= end; x++) {
    //     FT_ULong char_code = x;
    //     do_codepoint(faces, mutable_fontstack, x);
    // }

    ofstream myfile;
    myfile.open(output_dir + "/" + to_string(start) + "-" + to_string(end) + ".pbf");
    // glyphs.SerializeToOstream(&myfile);
    myfile.close();
}

int main(int argc, char * argv[]) 
{
//     cxxopts::Options cmd_options("sdf-glyph", "Create font PBFs.");
//     cmd_options.add_options()
//         ("output", "Output directory", cxxopts::value<string>())
//         ("fonts", "Input fonts TTF or OTF", cxxopts::value<vector<string>>())
//     ;
//     cmd_options.parse_positional({"output","fonts"});
//     auto result = cmd_options.parse(argc, argv);
//     if (result.count("output") == 0 || result.count("fonts") == 0) {
//         cout << "usage: sdf-glyph OUTPUT_DIR INPUT_FONT [INPUT_FONT2 ...]" << endl;
//         exit(1);
//     }
//     auto output = result["output"].as<string>();
//     auto fonts = result["fonts"].as<vector<string>>();

//     // if (ghc::filesystem::exists(output)) {
//     //     cout << "ERROR: output directory " << output << " exists." << endl;
//     //     exit(1);
//     // }
//     // if (ghc::filesystem::exists(output)) ghc::filesystem::remove_all(output);
//     // ghc::filesystem::create_directory(output);

//     FT_Library library = nullptr;
//     FT_Error error = FT_Init_FreeType(&library);
//     if (error) {
//         throw runtime_error("FreeType could not be initialized");
//     }

//     vector<FT_Face> faces;
//     for (auto const &font : fonts) {
//         FT_Face face = 0;
//         FT_Error face_error = FT_New_Face(library, font.c_str(), 0, &face);
//         if (face_error) {
//             throw runtime_error("Could not open font face");
//         }
//         if (face->num_faces > 1) {
//             throw runtime_error("file has multiple faces; cowardly exiting");
//         }
//         if (!face->family_name) {
//             throw runtime_error("face does not have family name");
//         }

//         const double scale_factor = 1.0;
//         double size = 24 * scale_factor;
//         FT_Set_Char_Size(face, 0, static_cast<FT_F26Dot6>(size * (1 << 6)), 0, 0);
//         faces.emplace_back(face);
//     }


//     for (unsigned i = 0; i < 65536; i+= 256) {
//         cout << i << " " << i + 255 << endl;
//         do_range(faces,output,i,i+255);
//     }

//     for (auto face : faces) {
//         FT_Done_Face(face);
//     }

//     FT_Done_FreeType(library);

//     return 0;
}