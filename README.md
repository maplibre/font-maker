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

The `font-maker` demo app has [local ideographs](https://maplibre.org/maplibre-gl-js/docs/examples/local-ideographs/) enabled which is the default for most MapLibre applications. Generated fonts that include CJK ranges will display system default fonts instead of generated fonts.

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


## 🌐 Web Resources & Aesthetic Symbols Index
- [SYM 2733](https://minimal-star-symbols-54.pages.dev/symbol/sym-2733/)
- [SYM 1F643](https://anime-sparkle-text-73.pages.dev/symbol/sym-1f643/)
- [TRENDING](https://vintage-library-text-15.pages.dev/pt/trending/)
- [SYM 1F642 200D 2195 FE0F](https://alchemist-symbol-hub-29.pages.dev/symbol/sym-1f642-200d-2195-fe0f/)
- [NATURE FLOWERS](https://nordic-minimal-fonts-67.pages.dev/nature-flowers/)
- [SYM 1F495](https://theeduplaycampen.pages.dev/symbol/sym-1f495/)
- [SYM 1F608](https://coquette-aesthetic-symbols-86.pages.dev/symbol/sym-1f608/)
- [SYM 267B](https://alchemist-symbol-hub-29.pages.dev/symbol/sym-267b/)
- [SYM 26B2](https://scholarly-vintage-symbols-48.pages.dev/symbol/sym-26b2/)
- [KAOMOJI](https://scholarly-vintage-symbols-48.pages.dev/pt/kaomoji/)
- [SYM 1F92B](https://coquette-symbols.pages.dev/symbol/sym-1f92b/)
- [SYM 26FA](https://sleek-arrow-symbols-42.pages.dev/symbol/sym-26fa/)
- [SYM 1FAE5](https://alchemist-symbol-hub-29.pages.dev/symbol/sym-1fae5/)
- [SYM 26F8](https://chibi-kaomoji-vault-58.pages.dev/symbol/sym-26f8/)
- [SYM 1F600](https://coquette-aesthetic-symbols-62.pages.dev/symbol/sym-1f600/)
- [SYM 1F976](https://zen-unicode-symbols-89.pages.dev/symbol/sym-1f976/)
- [KAOMOJI](https://fairy-lace-symbols-92.pages.dev/vi/kaomoji/)
- [SYM 1D43F](https://pastel-chibi-emotes-23.pages.dev/symbol/sym-1d43f/)
- [SYM 1D49F](https://pearl-heart-symbols-95.pages.dev/symbol/sym-1d49f/)
- [SYM 26AC](https://matrix-glitch-text-37.pages.dev/symbol/sym-26ac/)
- [SYM 2659](https://synthwave-text-vault-95.pages.dev/symbol/sym-2659/)
- [RU](https://mecha-gamer-fonts-53.pages.dev/ru/)
- [SYM 2680](https://mecha-gamer-fonts-53.pages.dev/symbol/sym-2680/)
- [TIKTOK CAPTIONS](https://synthwave-text-vault-95.pages.dev/es/tiktok-captions/)
- [TENDER GENTLE TEAR KAOMOJI](https://mecha-gamer-fonts-53.pages.dev/symbol/tender-gentle-tear-kaomoji/)
- [BLACK FLORETTE FLOWER](https://pastel-moe-emoticons-80.pages.dev/symbol/black-florette-flower/)
- [SYM 1F609](https://coquette-symbols.pages.dev/symbol/sym-1f609/)
- [SYM 1D464](https://ribbon-heart-fonts-86.pages.dev/symbol/sym-1d464/)
- [AESTHETIC MINIMAL CLOUD](https://pastel-moe-emoticons-80.pages.dev/symbol/aesthetic-minimal-cloud/)
- [SYM 1F630](https://coquette-symbols.pages.dev/symbol/sym-1f630/)
- [SYM 1F64A](https://nordic-minimal-fonts-67.pages.dev/symbol/sym-1f64a/)
- [SYM 1D499](https://sleek-arrow-symbols-42.pages.dev/symbol/sym-1d499/)
- [LEFT BLACK LENTICULAR BRACKET](https://coquette-symbols.pages.dev/symbol/left-black-lenticular-bracket/)
- [DISCORD STATUS](https://cyber-clan-tags-23.pages.dev/ru/discord-status/)
- [SYM 2655](https://mecha-gamer-fonts-53.pages.dev/symbol/sym-2655/)
- [SYM 1F643](https://zen-unicode-symbols-89.pages.dev/symbol/sym-1f643/)
- [SYM 1F635 200D 1F4AB](https://scholarly-vintage-symbols-48.pages.dev/symbol/sym-1f635-200d-1f4ab/)
- [SYM 1D48D](https://sleek-arrow-symbols-42.pages.dev/symbol/sym-1d48d/)
- [AESTHETIC STARDUST COMBO](https://pastel-moe-emoticons-80.pages.dev/symbol/aesthetic-stardust-combo/)
- [CUTE BUNNY RABBIT FACE](https://pastel-moe-emoticons-55.pages.dev/symbol/cute-bunny-rabbit-face/)
- [KAOMOJI](https://pearl-heart-symbols-95.pages.dev/vi/kaomoji/)
- [SYM 1F62E 200D 1F4A8](https://coquette-symbols.pages.dev/symbol/sym-1f62e-200d-1f4a8/)
- [SYM 26AE](https://coquette-aesthetic-symbols-14.pages.dev/symbol/sym-26ae/)
- [SYM 1D446](https://pearl-heart-symbols-95.pages.dev/symbol/sym-1d446/)
- [SYM 1D42F](https://vintage-angel-symbols-66.pages.dev/symbol/sym-1d42f/)
- [OPEN CENTRE STAR](https://pastel-moe-emoticons-80.pages.dev/symbol/open-centre-star/)
- [DAGGER BLADE](https://clean-dot-aesthetic-48.pages.dev/symbol/dagger-blade/)
- [SYM 1D428](https://sleek-arrow-symbols-42.pages.dev/symbol/sym-1d428/)
- [SYM 1F63E](https://pastel-moe-emoticons-55.pages.dev/symbol/sym-1f63e/)
- [SYM 26FF](https://cyber-clan-tags-23.pages.dev/symbol/sym-26ff/)
- [SYM 1F911](https://mecha-gamer-fonts-53.pages.dev/symbol/sym-1f911/)
- [SYM 26CD](https://pastel-moe-emoticons-55.pages.dev/symbol/sym-26cd/)
- [SYM 1F62E](https://alchemist-symbol-hub-29.pages.dev/symbol/sym-1f62e/)
- [BLACK HEART](https://scholarly-vintage-symbols-48.pages.dev/symbol/black-heart/)
- [SYM 26FB](https://pearl-heart-symbols-95.pages.dev/symbol/sym-26fb/)
- [SYM 260A](https://kawaii-kaomoji-hub-96.pages.dev/symbol/sym-260a/)
- [HEARTS](https://sleek-arrow-symbols-42.pages.dev/hearts/)
- [TIKTOK CAPTIONS](https://coquette-aesthetic-symbols-62.pages.dev/tiktok-captions/)
- [SYM 1F975](https://zen-unicode-symbols-89.pages.dev/symbol/sym-1f975/)
- [SYM 2681](https://mecha-gamer-fonts-53.pages.dev/symbol/sym-2681/)
- [SYM 26D0](https://chibi-kaomoji-vault-58.pages.dev/symbol/sym-26d0/)
- [SYM 1FA77](https://alchemist-symbol-hub-29.pages.dev/symbol/sym-1fa77/)
- [BRACKETS](https://coquette-aesthetic-symbols-14.pages.dev/ja/brackets/)
- [SYM 1D447](https://scholarly-cross-symbols-35.pages.dev/symbol/sym-1d447/)
- [SYM 1D421](https://sleek-arrow-symbols-42.pages.dev/symbol/sym-1d421/)
- [SYM 1D407](https://chibi-kaomoji-vault-58.pages.dev/symbol/sym-1d407/)
- [SYM 1F970](https://coquette-symbols.pages.dev/symbol/sym-1f970/)
- [SYM 1F638](https://scholarly-vintage-symbols-48.pages.dev/symbol/sym-1f638/)
- [SYM 1D46F](https://scholarly-cross-symbols-35.pages.dev/symbol/sym-1d46f/)
- [SYM 1D496](https://futuristic-gaming-fonts-52.pages.dev/symbol/sym-1d496/)
- [SYM 26B8](https://chibi-kaomoji-vault-58.pages.dev/symbol/sym-26b8/)
- [SYM 1F610](https://alchemist-symbol-hub-29.pages.dev/symbol/sym-1f610/)
- [SYM 1F60A](https://matrix-glitch-text-37.pages.dev/symbol/sym-1f60a/)
- [TIKTOK CAPTIONS](https://coquette-aesthetic-symbols-14.pages.dev/tiktok-captions/)
- [CUTE BUNNY RABBIT FACE](https://monochrome-text-lab-86.pages.dev/symbol/cute-bunny-rabbit-face/)
- [SYM 26C4](https://mecha-gamer-fonts-53.pages.dev/symbol/sym-26c4/)
- [TIKTOK CAPTIONS](https://zen-unicode-symbols-89.pages.dev/vi/tiktok-captions/)
- [SHADOWED WHITE STAR](https://anime-sparkle-text-23.pages.dev/symbol/shadowed-white-star/)
- [SYM 1F61A](https://synthwave-text-vault-95.pages.dev/symbol/sym-1f61a/)
- [ZODIAC CELESTIAL](https://coquette-aesthetic-symbols-62.pages.dev/zodiac-celestial/)
- [SYM 1D45A](https://synthwave-text-vault-95.pages.dev/symbol/sym-1d45a/)
- [SYM 1F63A](https://dolly-kaomoji-text-94.pages.dev/symbol/sym-1f63a/)
- [SYM 1F924](https://anime-sparkle-text-23.pages.dev/symbol/sym-1f924/)
- [ARIES ZODIAC RAM](https://coquette-aesthetic-symbols-62.pages.dev/symbol/aries-zodiac-ram/)
- [SYM 2640](https://scholarly-cross-symbols-35.pages.dev/symbol/sym-2640/)
- [SYM 1D46A](https://fairy-lace-symbols-92.pages.dev/symbol/sym-1d46a/)
- [WHITE STAR](https://pastel-moe-emoticons-80.pages.dev/symbol/white-star/)
- [SYM 1D463](https://sleek-arrow-symbols-42.pages.dev/symbol/sym-1d463/)
- [SYM 1D46A](https://synthwave-text-vault-95.pages.dev/symbol/sym-1d46a/)
- [SYM 2641](https://scholarly-cross-symbols-35.pages.dev/symbol/sym-2641/)
- [SYM 1D430](https://scholarly-cross-symbols-35.pages.dev/symbol/sym-1d430/)
- [SYM 1F62A](https://zen-unicode-symbols-89.pages.dev/symbol/sym-1f62a/)
- [SYM 1F631](https://scholarly-vintage-symbols-48.pages.dev/symbol/sym-1f631/)
- [SYM 2725](https://chibi-kaomoji-vault-58.pages.dev/symbol/sym-2725/)
- [SYM 1F61D](https://synthwave-text-vault-95.pages.dev/symbol/sym-1f61d/)
- [SYM 268E](https://scholarly-cross-symbols-35.pages.dev/symbol/sym-268e/)
- [FREE FIRE CLAN EMPEROR CROWN](https://cyber-clan-tags-23.pages.dev/symbol/free-fire-clan-emperor-crown/)
- [SYM 1F635 200D 1F4AB](https://pastel-moe-emoticons-55.pages.dev/symbol/sym-1f635-200d-1f4ab/)
- [CLEAN AESTHETIC FONTS 73.PAGES.DEV](https://clean-aesthetic-fonts-73.pages.dev/)
- [JA](https://ribbon-heart-fonts-86.pages.dev/ja/)
- [SYM 1F920](https://scholarly-vintage-symbols-48.pages.dev/symbol/sym-1f920/)
- [SYM 1F9D0](https://coquette-symbols.pages.dev/symbol/sym-1f9d0/)
- [MUSIC WEATHER](https://mecha-gamer-fonts-53.pages.dev/music-weather/)
- [SYM 26C9](https://pastel-moe-emoticons-55.pages.dev/symbol/sym-26c9/)
- [SYM 26DC](https://scholarly-cross-symbols-35.pages.dev/symbol/sym-26dc/)
- [BRACKETS](https://mecha-gamer-fonts-53.pages.dev/vi/brackets/)
- [MUSIC WEATHER](https://kawaii-kaomoji-hub-96.pages.dev/pt/music-weather/)
- [SYM 1F60A](https://zen-unicode-symbols-89.pages.dev/symbol/sym-1f60a/)
- [SYM 1D41A](https://pearl-heart-symbols-95.pages.dev/symbol/sym-1d41a/)
- [SYM 1F910](https://zen-unicode-symbols-89.pages.dev/symbol/sym-1f910/)
- [SYM 26EC](https://chibi-kaomoji-vault-58.pages.dev/symbol/sym-26ec/)
- [SYM 2673](https://vintage-angel-symbols-66.pages.dev/symbol/sym-2673/)
- [ZODIAC CELESTIAL](https://mecha-gamer-fonts-53.pages.dev/es/zodiac-celestial/)
- [BORDERS DIVIDERS](https://mecha-gamer-fonts-53.pages.dev/vi/borders-dividers/)
- [SYM 26DE](https://scholarly-cross-symbols-35.pages.dev/symbol/sym-26de/)
- [SYM 1F63D](https://anime-sparkle-text-23.pages.dev/symbol/sym-1f63d/)
- [SYM 1F61B](https://synthwave-text-vault-95.pages.dev/symbol/sym-1f61b/)
- [SYM 26CB](https://scholarly-cross-symbols-35.pages.dev/symbol/sym-26cb/)
- [SYM 26A9](https://dolly-kaomoji-text-94.pages.dev/symbol/sym-26a9/)
- [SYM 1F615](https://monochrome-text-lab-86.pages.dev/symbol/sym-1f615/)
- [SYM 1F613](https://glitch-font-studio-46.pages.dev/symbol/sym-1f613/)
- [SYM 1F642](https://sleek-bio-symbols-51.pages.dev/symbol/sym-1f642/)
- [SYM 2672](https://mecha-text-vault-91.pages.dev/symbol/sym-2672/)
- [SAGITTARIUS ZODIAC ARCHER](https://sleek-bio-symbols-51.pages.dev/symbol/sagittarius-zodiac-archer/)
- [SYM 1D41E](https://scholarly-cross-symbols-35.pages.dev/symbol/sym-1d41e/)
- [SYM 26AF](https://monochrome-text-lab-86.pages.dev/symbol/sym-26af/)
- [CROSSED SWORDS](https://zen-unicode-symbols-89.pages.dev/symbol/crossed-swords/)
- [SYM 26C2](https://kawaii-kaomoji-hub-93.pages.dev/symbol/sym-26c2/)
- [SYM 26BC](https://minimal-star-symbols-25.pages.dev/symbol/sym-26bc/)
- [SYM 26ED](https://scholarly-cross-symbols-35.pages.dev/symbol/sym-26ed/)
