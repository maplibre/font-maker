emcc -I vendor/sdf-glyph-foundry/include/ \
		 -I /opt/local/include \
		 -I vendor/protozero/include \
		 -s USE_FREETYPE=1 \
		 -s EXPORTED_RUNTIME_METHODS=[ccall,cwrap] \
		 -s EXPORTED_FUNCTIONS=_generate_range \
		 -o sdfglyph.js \
		 main.cpp
