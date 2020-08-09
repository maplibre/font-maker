# sdf-glyph-tool

## Usage

    creates 0-255.pbf, 255-511.pbf, etc. in the "Noto" output directory.
    sdf-glyph Noto Noto-unhinted/NotoSans-Regular.ttf

## Installation

Requires freetype and protobuf to be installed on your system.
 
    git submodule init
    cmake .
    make

