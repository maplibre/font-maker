# font-maker

The easiest way to turn your custom fonts into files compatible with [MapLibre GL](https://maplibre.org) (and Mapbox GL too).

For other prepared fonts, look at [maplibre/demotiles/font](https://github.com/maplibre/demotiles/tree/gh-pages/font) instead.

## Usage

* Go to the web app at [maplibre.org/font-maker/](https://maplibre.org/font-maker/) and select your file.

* Wait for the progress bar to complete and download your ZIP containing all ranges for the font. 

## Installation

You don't need to install anything to create SDF fonts, just use the page above. 

For command line usage and developing, see [CONTRIBUTING.md](CONTRIBUTING.md)

## Caveats

Certain scripts cannot be rendered in MapLibre GL, including, but not limited to:

* Burmese: OSM tag `name:my`
* Hindi `name:hi`
* Marathi `name:mr`
* Gujarati `name:gu`
* Punjabi `name:pa`, `name:pnb`
* Assamese `name:as`
* Bengali `name:bn`
* Oriya `name:or`
* Telugu `name:te`
* Kannada `name:kn`
* Tamil `name:ta`
* Malayalam `name:ml`

Labels using these scripts have been excluded from the sample capital cities dataset.

## Variants

By specifying a font file you can control which variants are used for these scripts:

* Cyriac (Eastern/Western/Estrangela)
* Han (kr/hk/cn/tw/jp/vn)

## Discussion

Join the #maplibre slack channel at OSMUS: get an invite at https://slack.openstreetmap.us/
