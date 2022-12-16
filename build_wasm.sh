if [ -z "$1" ]
  then
    echo "No path to Boost include dir supplied"
    exit 1
fi

emcc -I vendor/sdf-glyph-foundry/include/ \
		 -I $1 \
		 -I vendor/protozero/include \
		 -s USE_FREETYPE=1 \
		 -s EXPORTED_RUNTIME_METHODS=[ccall] \
		 -s EXPORTED_FUNCTIONS=[_generate_glyph_buffer,_free_glyph_buffer,_create_fontstack,_free_fontstack,_fontstack_name,_glyph_buffer_data,_glyph_buffer_size,_fontstack_add_face] \
		 -s ALLOW_MEMORY_GROWTH=1 \
		 -o app/public/sdfglyph.js \
		 -Wno-enum-constexpr-conversion \
		 main.cpp
