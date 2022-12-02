cmake_minimum_required (VERSION 3.10)
set(CMAKE_C_COMPILER "/usr/bin/clang")
set(CMAKE_CXX_COMPILER "/usr/bin/clang++")
project(font-maker)
set(CMAKE_CXX_FLAGS_RELEASE "-O3")
set(CMAKE_CXX_FLAGS_DEBUG "-DDEBUG -g")

find_package(Boost 1.73 REQUIRED)
find_package(Freetype REQUIRED)

include_directories(vendor/cxxopts/include)
include_directories(vendor/filesystem/include)
include_directories(vendor/sdf-glyph-foundry/include)
include_directories(vendor/protozero/include)
include_directories(${Boost_INCLUDE_DIRS})
include_directories(${FREETYPE_INCLUDE_DIRS})

add_executable(font-maker main.cpp)
target_link_libraries(font-maker ${FREETYPE_LIBRARIES})

set_property(TARGET font-maker PROPERTY CXX_STANDARD 17)
