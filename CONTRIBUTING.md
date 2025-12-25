# Contributing

## Local development

The WASM outputs `sdfglyph.js` and `sdfglyph.wasm` are not committed to git. To develop the web app locally download the compiled ones from GitHub pages:

* [sdfglyph.js](https://maplibre.org/font-maker/sdfglyph.js)
* [sdfglyph.wasm](https://maplibre.org/font-maker/sdfglyph.wasm)

## Building WASM

If you want to compile the WebAssembly components from scratch, you'll need the following:

* The [Emscripten SDK](https://emscripten.org/docs/getting_started/downloads.html) installed and activated on your machine (`emcc` on your path)
* A [boost](https://www.boost.org) installation on your machine

Clone this repository and all submodules with `git clone --recursive`

Use `./build_wasm.sh PATH_TO_INCLUDE_DIR` to build the WASM output, where `PATH_TO_INCLUDE_DIR` is the directory of your local Boost install. example: `./build_wasm.sh /opt/local/include`

## Building command line

```
cmake .
make
```