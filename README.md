# font-maker

The easiest way to turn your custom fonts into files compatible with [MapLibre GL](https://maplibre.org) (and Mapbox GL too).

For other prepared fonts, look at [maplibre/demotiles/font](https://github.com/maplibre/demotiles/tree/gh-pages/font) instead.

For an example of using font-maker on the command line to cover as much of Unicode as possible, see the [protomaps/basemaps-assets](https://github.com/protomaps/basemaps-assets) repository.

## Usage

* Go to the web app at [maplibre.org/font-maker/](https://maplibre.org/font-maker/) and select your file.

* Wait for the progress bar to complete and download your ZIP containing all ranges for the font. 

## Installation

You don't need to install anything to create SDF fonts, just use the page above. 

For command line usage and developing, see [CONTRIBUTING.md](CONTRIBUTING.md)

## Caveats

If the MapLibre renderer does not find a matching codepoint in the current font, it will skip display of that character.

See @wipfli's [Text Rendering in MapLibre guide](https://github.com/wipfli/about-text-rendering-in-maplibre) for details on the drawbacks of mapping 1 codepoint to 1 glyph.

### CJK (Chinese, Japanese, Korean) text

The `font-maker` demo app has [local ideographs](https://maplibre.org/maplibre-gl-js-docs/example/local-ideographs/) enabled which is the default for most MapLibre applications. Generated fonts that include CJK ranges will display system default fonts instead of generated fonts.

### CTL (Complex Text Layout) scripts

Certain scripts cannot be rendered in MapLibre GL, affecting at least these languages:

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

## Discussion

Join the #maplibre slack channel at OSMUS: get an invite at https://slack.openstreetmap.us/
