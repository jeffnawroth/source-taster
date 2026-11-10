# Prototype asset provenance

## Mark and public checking snapshot

`glyphs.js` is the public project's chosen logo/glyph sprite from #194, commit `f6db1f512255bd404428212ade37abf5ea26f4a3`, branch `prototype/194-structure`. Its mark is derived from the accepted #191 identity. The generated SVG masters retain its geometry, with the optical cut used up to 32 px and a stronger small monochrome outline. All four logo colour stops are converted to explicit sRGB; the highlight is gamut-mapped as recorded in `gamut-mapping.json`.

`checking-snapshot.html` is the actual public #194 D snapshot, taken from the #198 offline adaptation at commit `b6dfa14909b7ec8ed4f8a7057d4bc0ea94f14022`. It has embedded local fonts, defaults to D/calm/compact strip a, hides review chrome and leaves history to the parent. #199 adapts only the screenshot presentation: neutral evidence-track/field indicators per #195, the ordinary author label per #192, the mapped logo colours and removal of the old mark glow. No checking behavior or fixture evidence is added or altered. Captures are design examples, not product release or quality evidence. No private service code/data or customer documents are included.

The logo/wordmark are brand artwork, outside the shared code-package license; this prototype makes no new license grant for the mark. Their later distribution and notices must preserve the accepted #189 boundary. The research, code and brand license scopes are distinct.

## Fonts

Unmodified static TTFs copied from the public #197 prototype, with upstream OFL 1.1 notices. The standalone gallery also embeds those notices in its data. Font licensing is unaffected by the mark's separate scope.

- Atkinson-Regular.ttf: https://raw.githubusercontent.com/googlefonts/atkinson-hyperlegible-next/7925f50f649b3813257faf2f4c0b381011f434f1/fonts/ttf/AtkinsonHyperlegibleNext-Regular.ttf
- Atkinson-Bold.ttf: https://raw.githubusercontent.com/googlefonts/atkinson-hyperlegible-next/7925f50f649b3813257faf2f4c0b381011f434f1/fonts/ttf/AtkinsonHyperlegibleNext-Bold.ttf
- Atkinson-OFL.txt: https://raw.githubusercontent.com/googlefonts/atkinson-hyperlegible-next/7925f50f649b3813257faf2f4c0b381011f434f1/OFL.txt
- PlexMono-Regular.ttf: https://raw.githubusercontent.com/google/fonts/5bb28733cec313b63fbd415b574b5ae35c8aa8b8/ofl/ibmplexmono/IBMPlexMono-Regular.ttf
- Plex-OFL.txt: https://raw.githubusercontent.com/google/fonts/5bb28733cec313b63fbd415b574b5ae35c8aa8b8/ofl/ibmplexmono/OFL.txt
