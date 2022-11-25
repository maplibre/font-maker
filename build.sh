if [ -z "$1" ]
  then
    echo "No path to Boost include dir supplied"
    exit 1
fi

emcc -I vendor/sdf-glyph-foundry/include/ \
		 -I $1 \
		 -I vendor/protozero/include \
		 -s USE_FREETYPE=1 \
		 -s EXPORTED_RUNTIME_METHODS=[ccall,cwrap] \
		 -s EXPORTED_FUNCTIONS=[_generate_range] \
		 -o dist/sdfglyph.js \
		 -Wno-enum-constexpr-conversion \
		 main.cpp
