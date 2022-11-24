# sdf-glyph-tool

Generates Signed Distance Field fonts for use in MapLibre GL, Mapbox GL, etc.

Simply upload a font and convert; it runs 100% client-side via WebAssembly.

There is as little code here as possible, most of it is taken from [node-fontnik](https://github.com/mapbox/node-fontnik).

## Usage

Go to the web app at [protomaps.github.io/sdf-glyph-tool/](https://protomaps.github.io/sdf-glyph-tool/) and select your file. Wait for the progress bar to complete and download your ZIP.

## Installation

You don't need to install anything to create SDF fonts, just use the page above. 

If you want to compile the WebAssembly components from scratch, you'll need the following:

* The [Emscripten SDK](https://emscripten.org/docs/getting_started/downloads.html) installed and activated on your machine (`emcc` on your path)
* A [boost](https://www.boost.org) installation on your machine

Clone this repository and all submodules with `git clone --recursive`

Use `./build.sh PATH_TO_INCLUDE_DIR` to build the WASM output, where `PATH_TO_INCLUDE_DIR` is the directory of your local Boost install.

## Variants

By specifying a font file you can control which variants are used for these scripts:

* Cyriac (Eastern/Western/Estrangela)
* Han (kr/hk/cn/tw/jp/vn)

## TODO
* Combine multiple font files
