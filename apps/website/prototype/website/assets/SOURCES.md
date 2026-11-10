# Prototype font provenance

Unmodified static TTFs from the upstream repositories, with their OFL 1.1 licences. Copied from the public #197 prototype. Website implementation qualification remains under ADR-0020.

- Atkinson-Regular.ttf: https://raw.githubusercontent.com/googlefonts/atkinson-hyperlegible-next/7925f50f649b3813257faf2f4c0b381011f434f1/fonts/ttf/AtkinsonHyperlegibleNext-Regular.ttf
- Atkinson-Bold.ttf: https://raw.githubusercontent.com/googlefonts/atkinson-hyperlegible-next/7925f50f649b3813257faf2f4c0b381011f434f1/fonts/ttf/AtkinsonHyperlegibleNext-Bold.ttf
- Atkinson-OFL.txt: https://raw.githubusercontent.com/googlefonts/atkinson-hyperlegible-next/7925f50f649b3813257faf2f4c0b381011f434f1/OFL.txt
- PlexMono-Regular.ttf: https://raw.githubusercontent.com/google/fonts/5bb28733cec313b63fbd415b574b5ae35c8aa8b8/ofl/ibmplexmono/IBMPlexMono-Regular.ttf
- Plex-OFL.txt: https://raw.githubusercontent.com/google/fonts/5bb28733cec313b63fbd415b574b5ae35c8aa8b8/ofl/ibmplexmono/OFL.txt


`glyphs.js` and `checking-194.html` come from public branch `prototype/194-structure`, commit `f6db1f512255bd404428212ade37abf5ea26f4a3`. The checking snapshot defaults to D with calm styling and compact strip a; this adaptation removes remote fonts and srcdoc history writes, hides its review controls, and updates the German display term to Befund. The build embeds the local fonts. The source snapshot is inert until inserted into the parent preview. No private service code or data is included.
