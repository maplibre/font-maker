emcc -I vendor/sdf-glyph-foundry/include/ \
		 -I $1 \
		 -I vendor/protozero/include \
		 -s USE_FREETYPE=1 \
		 -s EXPORTED_RUNTIME_METHODS=[ccall,cwrap] \
		 -s EXPORTED_FUNCTIONS=[_generate_range] \
		 -o js/sdfglyph.js \
		 -Wno-enum-constexpr-conversion \
		 main.cpp
