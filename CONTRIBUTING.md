# Building

If you want to compile the WebAssembly components from scratch, you'll need the following:

* The [Emscripten SDK](https://emscripten.org/docs/getting_started/downloads.html) installed and activated on your machine (`emcc` on your path)
* A [boost](https://www.boost.org) installation on your machine

Clone this repository and all submodules with `git clone --recursive`

Use `./build.sh PATH_TO_INCLUDE_DIR` to build the WASM output, where `PATH_TO_INCLUDE_DIR` is the directory of your local Boost install.

