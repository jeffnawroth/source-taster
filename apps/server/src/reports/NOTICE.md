# Notices for the Verification report adapter (ADR-0017, #105)

This is a technical inventory read from the installed packages. It is not a legal review and not a license-qualification receipt; the launch legal review of ADR-0002 still applies.

## Executed engine graph (production, `@source-taster/server`)

| Package            | Version         | Declared license | Standalone license file in the package                                                        |
| ------------------ | --------------- | ---------------- | --------------------------------------------------------------------------------------------- |
| pdfkit             | 0.20.2          | MIT              | `LICENSE`                                                                                     |
| fontkit            | 2.0.4           | MIT              | **none**                                                                                      |
| restructure        | 3.0.2           | MIT              | `LICENSE`                                                                                     |
| brotli             | 1.3.3           | MIT              | **none**; `dec/*.js` carry "Copyright 2013 Google Inc." headers naming the Apache License 2.0 |
| tiny-inflate       | 1.0.3           | MIT              | `LICENSE`                                                                                     |
| dfa                | 1.2.0           | MIT              | **none**                                                                                      |
| clone              | 2.1.2           | MIT              | `LICENSE`                                                                                     |
| unicode-properties | 1.4.1           | MIT              | `LICENSE`                                                                                     |
| unicode-trie       | 2.0.0           | MIT              | `LICENSE`                                                                                     |
| linebreak          | 1.1.0           | MIT              | `LICENSE`                                                                                     |
| png-js             | 2.0.0           | MIT              | `LICENSE`                                                                                     |
| base64-js          | 0.0.8 and 1.5.1 | MIT              | `LICENSE.MIT` (0.0.8)                                                                         |
| @swc/helpers       | 0.5.23          | Apache-2.0       | `LICENSE`                                                                                     |
| fflate             | 0.8.3           | MIT              | `LICENSE` (installed; not reached on the report path)                                         |
| pako               | 0.2.9           | MIT              | `LICENSE` (installed through unicode-trie; not reached)                                       |

`pnpm audit:licenses` accepts all of these without a new exception.

## Items ADR-0017 asks to reconcile

- **Brotli Apache headers.** The npm package declares MIT, but its decoder sources are derived from Google's Brotli reference decoder and carry Apache License 2.0 headers. The Apache-2.0 text and the Google copyright notice must travel with any distribution. The decoder is only reached for WOFF2 fonts; the report embeds TrueType fonts only.
- **Missing standalone license files.** fontkit, brotli and dfa declare MIT in `package.json` only. The upstream license texts must be retrieved from their repositories for distribution notices.
- **Decoder provenance in fontkit.** fontkit's complex-script shapers (Arabic, Indic, Hangul) state that they were ported from or based on HarfBuzz. The report fonts cover Latin, Greek and Cyrillic, so those shapers are not exercised by supported content. The exact upstream license of each ported source was not traced here and remains a legal-review item.

## Embedded fonts

`fonts/NotoSans-{Regular,Bold,Italic}.ttf` are Noto Sans, licensed under the SIL Open Font License 1.1 (`fonts/OFL.txt`). The fonts are embedded as subsets in generated PDFs and copied unchanged by `scripts/citation-assets.ts`. The OFL permits embedding in documents; the fonts are not sold on their own.
