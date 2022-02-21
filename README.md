# sdf-glyph-tool

Generates Signed Distance Field fonts for use in MapLibre GL, Mapbox GL, etc.

Simply upload a font and convert; it runs 100% client-side via WebAssembly.

There is as little code here as possible, most of it is taken from [node-fontnik](https://github.com/mapbox/node-fontnik).

## Usage

Go to the web app at [protomaps.github.io/sdf-glyph-tool/](https://protomaps.github.io/sdf-glyph-tool/) and select your file. Wait for the progress bar toc complete and download your ZIP.

## Installation

Requires emsdk, freetype and boost to be on your system.
 
    git submodule init
    ./build.sh

## Variants

By specifying a font file you can control which variants are used for these scripts:

* Cyriac (Eastern/Western/Estrangela)
* Han (kr/hk/cn/tw/jp/vn)
