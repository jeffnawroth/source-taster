# Notices for the Verification report adapter (ADR-0017, #105)

This is a technical inventory read from the installed packages; the unattributed-decoder point was confirmed in the installed fontkit `dist` files and matches the qualification research. It is not a legal review and not a license-qualification receipt; the launch legal review of ADR-0002 still applies.

## Executed engine graph (production, `@source-taster/server`)

| Package            | Version         | Declared license                  | Standalone license file in the package                                                        |
| ------------------ | --------------- | --------------------------------- | --------------------------------------------------------------------------------------------- |
| pdfkit             | 0.20.2          | MIT                               | `LICENSE`                                                                                     |
| fontkit            | 2.0.4           | MIT                               | **none**                                                                                      |
| restructure        | 3.0.2           | MIT                               | `LICENSE`                                                                                     |
| brotli             | 1.3.3           | MIT                               | **none**; `dec/*.js` carry "Copyright 2013 Google Inc." headers naming the Apache License 2.0 |
| tiny-inflate       | 1.0.3           | MIT                               | `LICENSE`                                                                                     |
| dfa                | 1.2.0           | MIT                               | **none**                                                                                      |
| clone              | 2.1.2           | MIT                               | `LICENSE`                                                                                     |
| unicode-properties | 1.4.1           | MIT                               | `LICENSE`                                                                                     |
| unicode-trie       | 2.0.0           | MIT                               | `LICENSE`                                                                                     |
| linebreak          | 1.1.0           | MIT                               | `LICENSE`                                                                                     |
| png-js             | 2.0.0           | none declared; MIT `LICENSE` file | `LICENSE`                                                                                     |
| base64-js          | 0.0.8 and 1.5.1 | MIT                               | `LICENSE.MIT` (0.0.8)                                                                         |
| @swc/helpers       | 0.5.23          | Apache-2.0                        | `LICENSE`                                                                                     |
| fflate             | 0.8.3           | MIT                               | `LICENSE` (installed; not reached on the report path)                                         |
| pako               | 0.2.9           | MIT                               | `LICENSE` (installed through unicode-trie; not reached)                                       |

`pnpm audit:licenses` accepts all of these without a new exception.

## Items ADR-0017 asks to reconcile

- **Brotli Apache headers.** The npm package declares MIT, but its decoder sources are derived from Google's Brotli reference decoder and carry Apache License 2.0 headers. The Apache-2.0 text and the Google copyright notice must travel with any distribution. The decoder is only reached for WOFF2 fonts; the report embeds TrueType fonts only.
- **Missing standalone license files.** fontkit, brotli and dfa declare MIT in `package.json` only. The upstream license texts must be retrieved from their repositories for distribution notices.
- **Decoder provenance in fontkit.** fontkit's published builds (`dist/module.mjs`, `dist/browser.cjs`, from `src/utils.js`) embed a base64 decoder commented "Based on ... base64-arraybuffer. MIT license." The copied upstream version or commit is not attributed (the qualification research, `docs/research/pdfkit-dependency-qualification.md` on `research/pdfkit-dependency-qualification-20261025`, records the same gap). An exact ancestry of everything bundled in fontkit is therefore not proven. Separately, fontkit's Arabic, Indic and Hangul shapers state that they were ported from or based on HarfBuzz; the report fonts cover Latin, Greek and Cyrillic, so those shapers are not exercised by supported content. Neither point was resolved here; both remain legal-review inputs, not a finding of infringement.
- **png-js** has no `license` field in its `package.json`; it ships an MIT `LICENSE` file.

## Embedded fonts

`fonts/NotoSans-{Regular,Bold,Italic}.ttf` are Noto Sans, licensed under the SIL Open Font License 1.1 (`fonts/OFL.txt`). The fonts are embedded as subsets in generated PDFs and copied unchanged by `scripts/citation-assets.ts`. The OFL permits embedding in documents; the fonts are not sold on their own.

## CI-only check tool

veraPDF 1.30.3 (GPL-3.0-or-later OR MPL-2.0) validates the generated sample PDFs in CI as a separate process. It is not a dependency, is not bundled and does not appear in this inventory's production graph. See `docs/dependency-policy.md`.
