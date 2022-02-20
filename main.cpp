#include <iostream>
// #include <fstream>
#include "mapbox/glyph_foundry.hpp"
#include "mapbox/glyph_foundry_impl.hpp"

using namespace std;

void do_codepoint(FT_Face face, FT_ULong char_code) {
//     for (auto &face : faces) {
        FT_UInt char_index = FT_Get_Char_Index(face, char_code);

        if (!char_index) {
            return;
        }

        sdf_glyph_foundry::glyph_info glyph;
        glyph.glyph_index = char_index;
        sdf_glyph_foundry::RenderSDF(glyph, 24, 3, 0.25, face);

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
}

void do_range(FT_Face face, unsigned start, unsigned end) {
    // llmr::glyphs::glyphs glyphs;

    // llmr::glyphs::fontstack* mutable_fontstack = glyphs.add_stacks();
    // mutable_fontstack->set_name(""); // this is not used yet
    // mutable_fontstack->set_range(to_string(start) + "-" + to_string(end));

    for (unsigned x = start; x <= end; x++) {
        FT_ULong char_code = x;
        do_codepoint(face, x);
    }

    // ofstream myfile;
    // myfile.open(output_dir + "/" + to_string(start) + "-" + to_string(end) + ".pbf");
    // glyphs.SerializeToOstream(&myfile);
    // myfile.close();
}

extern "C" {
    int read_face(const FT_Byte *base, FT_Long data_size, char *result_ptr) {
        cout << "Hello from Function" << endl;

        FT_Library library = nullptr;
        FT_Error error = FT_Init_FreeType(&library);
        FT_Face face = 0;
        FT_Error face_error = FT_New_Memory_Face(library, base, data_size, 0, &face);
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

        const double scale_factor = 1.0;
        double size = 24 * scale_factor;
        FT_Set_Char_Size(face, 0, static_cast<FT_F26Dot6>(size * (1 << 6)), 0, 0);

        for (unsigned i = 0; i < 65536; i+= 256) {
            cout << i << " " << i + 255 << endl;
            do_range(face,i,i+255);
        }



        std::string foo = face->family_name;
        foo.copy(result_ptr,foo.size());
        FT_Done_Face(face);
        FT_Done_FreeType(library);

        return foo.size();
    }
}





int main(int argc, char * argv[]) 
{






}