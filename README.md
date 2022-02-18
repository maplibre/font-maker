# sdf-glyph-tool

There is as little code here as possible, most of it is taken from [node-fontnik](https://github.com/mapbox/node-fontnik).

## Usage

    creates 0-255.pbf, 255-511.pbf, etc. in the "Noto" output directory.
    sdf-glyph Noto Noto-unhinted/NotoSans-Regular.ttf

## Installation

Requires freetype and protobuf version 3 to be installed on your system.
 
    git submodule init
    cmake .
    make
    protoc glyphs.proto --cpp_out=.

## Variants

By specifying a font file you can control which variants are used for these scripts:

* Cyriac (Eastern/Western/Estrangela)
* Han (kr/hk/cn/tw/jp/vn)
