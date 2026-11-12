# Locally hosted interface fonts

Unmodified upstream TrueType binaries, retrieved 11 November 2026 from
`google/fonts` at `5bb28733cec313b63fbd415b574b5ae35c8aa8b8`.
Each exact source URL and SHA-256 is in [provenance.json](provenance.json).
No Google Fonts stylesheet or external font request runs in the product.

Atkinson Hyperlegible **Next** is the variable 200–800 family, normal and italic.
Copyright 2020–2024 The Atkinson Hyperlegible Next Project Authors
(https://github.com/googlefonts/atkinson-hyperlegible-next).
Its actual [OFL](atkinsonhyperlegiblenext/OFL.txt) does not declare the old
Atkinson Hyperlegible family's reserved names; do not substitute that licence.

IBM Plex Mono contains unmodified normal Regular/Medium/SemiBold and Italic
static faces. Copyright © 2017 IBM Corp. with Reserved Font Name **Plex**.
See its complete [OFL](ibmplexmono/OFL.txt). Both families use SIL OFL-1.1,
separately from the UI's AGPL licence and the design tokens' dual licence.

`src/fonts.css` bundles these owned assets through Vite; `font-assets.ts` carries
both complete notices and provenance into web and extension builds. These files
are public UI assets, never part of the value-only token package. The variable
Next files serve browser UI; the PDF renderer's static-face/fallback and PDF/UA
qualification remain in #105. No font modification, re-licensing, private UI
sharing or general brand-distribution approval is implied.
