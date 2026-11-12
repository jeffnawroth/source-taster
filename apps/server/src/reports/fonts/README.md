# Local Verification report fonts

The production PDFKit adapter embeds unmodified static TrueType inputs as
subsets. The server build copies this directory, including full upstream OFL
notices, unchanged. Fonts are independent upstream OFL grants; they are not
part of the design-token package, the brand reservation or a new code licence.
No fonts are fetched at generation time.

Retrieved 11 November 2026 from these immutable upstream sources:

- Atkinson Hyperlegible Next 2.001: `googlefonts/atkinson-hyperlegible-next` at
  `7925f50f649b3813257faf2f4c0b381011f434f1`,
  `fonts/ttf/AtkinsonHyperlegibleNext-{Regular,Bold,Italic}.ttf` and `OFL.txt`.
  [Pinned directory](https://github.com/googlefonts/atkinson-hyperlegible-next/tree/7925f50f649b3813257faf2f4c0b381011f434f1/fonts/ttf).
  Copyright 2020-2024 The Atkinson Hyperlegible Next Project Authors.
  Full notice: `Atkinson-OFL.txt` (no Reserved Font Name declaration).
- IBM Plex Mono 2.3: `google/fonts` distribution at
  `5bb28733cec313b63fbd415b574b5ae35c8aa8b8`,
  `ofl/ibmplexmono/IBMPlexMono-Regular.ttf` and `OFL.txt`.
  [Pinned directory](https://github.com/google/fonts/tree/5bb28733cec313b63fbd415b574b5ae35c8aa8b8/ofl/ibmplexmono).
  Copyright 2017 IBM Corp., Reserved Font Name "Plex".
  Full notice: `Plex-OFL.txt`.
- Existing Noto Sans 2.015 Regular/Bold/Italic remain unchanged, with their
  embedded grants and full `OFL.txt` (Copyright 2022 The Noto Project Authors).
  They entered this repository at `5bc1d1ea194138c69dd278738aaf3076b422613f`.
  Their original acquisition URL/version is not established. The upstream
  comparison in `docs/research/207-design-rights-review.md` is explicitly not
  an exact-byte source match. Do not invent one.

`manifest.json` records SHA-256 hashes of every actual variant and full notice.
The packaged-asset check compares the production build with these pinned bytes.
See also `../NOTICE.md` for the separate engine/legal qualification inventory.
