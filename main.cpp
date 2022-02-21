#include "mapbox/glyph_foundry.hpp"
#include "mapbox/glyph_foundry_impl.hpp"
#include <protozero/pbf_writer.hpp>

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

string do_range(FT_Face face, unsigned start, unsigned end) {
    string fontstack_data;
    protozero::pbf_writer fontstack{fontstack_data};

    fontstack.add_string(1,"");
    fontstack.add_string(2,to_string(start) + "-" + to_string(end)); 

    for (unsigned x = start; x <= end; x++) {
        FT_ULong char_code = x;
        do_codepoint(fontstack,face, x);
    }

    string glyphs_data;
    protozero::pbf_writer glyphs{glyphs_data};
    glyphs.add_message(1,fontstack_data);
    return fontstack_data;
}

extern "C" {
    int generate_range(const FT_Byte *base, FT_Long data_size, uint32_t start_codepoint, char *result_ptr) {
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

        const double scale_factor = 1.0;
        double size = 24 * scale_factor;
        FT_Set_Char_Size(face, 0, static_cast<FT_F26Dot6>(size * (1 << 6)), 0, 0);

        string result = do_range(face,start_codepoint,start_codepoint+255);
        result.copy(result_ptr,result.size());
        FT_Done_Face(face);
        FT_Done_FreeType(library);
        return result.size();
    }
}