# Typefaces for Source Taster (#184, map #181)

Question: which UI sans (and optionally a mono) suits a 2026 product and is licensed and technically usable for self-hosting on the web, bundling in the extension, and embedding in the tagged PDF made with PDFKit (ADR-0017)?

Scope and honesty: this is research, not a decision. Font files were downloaded from the upstream releases named below and measured with fontTools and fontkit on 6 Nov 2026. Nothing here is a legal opinion, a PDF/UA claim or a visual judgement; legibility at small sizes is **not** measured and needs the identity prototypes. Candidates were chosen from well-known OFL families; this is not an exhaustive survey of all fonts.

## Answer in brief

1. All five candidates are SIL OFL 1.1 and may be self-hosted, bundled and embedded. Embedding in a PDF (full or subset) is explicitly outside the OFL's modification and redistribution restrictions [FAQ].
2. **For the PDF, use static TTFs, not variable fonts.** On the ADR-0017 route (pdfkit 0.20.2, fontkit 2.0.4, restructure 3.0.2) a variable font used as-is gives one weight for every `Regular`/`Bold` registration, and a `getVariation()` instance crashes at `doc.end()` with `First argument to DataView constructor must be an ArrayBuffer` (reproduced with both the CJS and the Node ESM fontkit entry). Web and extension can still use variable WOFF2; the PDF adapter ships separate static faces, as it does today with Noto Sans.
3. **Coverage decides the PDF fallback cost.** `pdf.ts` throws `unsupported-character` unless every code point exists in every embedded face. Geist and Atkinson lack Greek (Atkinson also Cyrillic and Vietnamese); Inter and IBM Plex Sans cover Latin, Greek and Cyrillic. Noto Sans (already shipped) covers all of them, so a primary face plus Noto as a fallback is feasible but needs fallback-run support in the adapter, which today has none.
4. Status marks (check, cross) must not depend on font glyphs: U+2713/U+2717 are missing from Geist, Plex and Atkinson, and Noto Sans lacks U+2192, U+2713, U+2717 too (Inter has them). Use icons or text for FA-ERG-03.

## Shortlist

| | Geist 1.9.2 | Inter 4.1 | IBM Plex Sans 3.005 | Atkinson Hyperlegible Next 2.001 | Noto Sans 2.015 (baseline, already in repo) |
|---|---|---|---|---|---|
| Licence | OFL-1.1, no RFN declared | OFL-1.1, no RFN declared | OFL-1.1, **RFN "Plex"** | OFL-1.1, no RFN declared | OFL-1.1 |
| Variable file | yes, `wght` 100-900 (VF 169 KB TTF, 69 KB WOFF2) | yes, `opsz` 14-32 and `wght` 100-900 (880 KB TTF, 352 KB WOFF2) | separate package `@ibm/plex-sans-variable@0.2.0` (pre-1.0, not evaluated); the `plex-sans@1.1.0` release is static only | yes, `wght` 200-800 (115 KB TTF) | no (static) |
| Static TTF (PDF) | yes, 126 KB Regular | from the VF via instancer, or `Inter.ttc` (13 MB, not tested with PDFKit) | yes, 200 KB Regular | yes, 65 KB Regular | yes, 826 KB Regular |
| Latin Extended, German | yes (also Vietnamese) | yes | yes | yes, but no Vietnamese | yes |
| Greek / Cyrillic | Cyrillic yes, **Greek no** | both | both | **neither** | both |
| Tabular figures `tnum` | yes (measured: 1111 and 8888 both 2400 units wide) | yes | figures tabular by default (equal widths without a feature) | yes (`tnum` equalises) | yes, `tnum` present; default digits already equal |
| Other features | `ss01`-`ss11`, `case`, `frac`, `liga` | `cv01`-`cv14`, `ss01`-`ss08`, `calt`, `zero`, `case` | `ss01`-`ss06`, `zero`, `liga`, `onum`/`lnum` | `case`, `frac` only | `onum`, `lnum`, `zero` |
| Glyphs | 975 | 2,937 | 1,019 | 392 | 4,515 |
| Latin+Ext WOFF2 subset (variable where available) | 40 KB (VF), 27 KB (Regular) | 157 KB (VF with opsz; opsz not pinned, so an unfair comparison) | 26 KB Regular, 27 KB Bold | 39 KB (VF), 20 KB (Regular) | 54 KB (Regular) |
| Width of 5 German UI strings, em | 103.1 | 107.4 | 101.3 | 99.4 | 107.5 |
| x-height / cap-height per em | 0.530 / 0.710 | 0.546 / 0.728 | 0.516 / 0.698 | 0.496 / 0.668 | 0.536 / 0.714 |
| Mono sibling | Geist Mono (OFL, VF, same coverage gaps, `tnum` n/a as it is monospaced) | none official | IBM Plex Mono (and a pre-1.0 variable package) | none | Noto Sans Mono |

The width test used five German strings (for example "Literaturverzeichnis hinzufügen und Zitierstil auswählen") at one font size; lower is narrower. The spread is about 8%, so in a narrow side panel Atkinson, Plex and Geist save a few percent over Inter and Noto. Treat it as a tie-breaker, not a reason.

### Geist (Vercel)

- **For:** closest to the Vercel/Linear look in the reference list; small (27 KB subset per static weight, 40 KB variable); real `tnum`; ships a monospace sibling; maintained (release v1.9.2 on 6 Nov 2026).
- **Against:** no Greek. A reference title with alpha or beta hits the PDF guard unless a fallback exists. Missing check marks. Very new release, so any age rule on dependencies applies if consumed through npm (`geist@1.9.2` was published the same day; the GitHub release zip is the alternative).
- **PDF:** static TTFs embed fine in PDFKit and round-trip text correctly (below).

### Inter (Rasmus Andersson)

- **For:** broadest coverage of the shortlist (Latin, Greek, Cyrillic, Vietnamese, arrows and check marks), the richest OpenType set (`tnum`, `zero`, `case`, `cv*`), an `opsz` axis that tunes small text (14) versus display (32), a long track record in UI. Safest primary face if a fallback is to be avoided.
- **Against:** the largest web payload (full VF WOFF2 352 KB; pin `opsz` and subset to approach 40-100 KB, not measured). Last upstream release v4.1 is from Nov 2024 (repo last push 19 Nov 2024), so it is stable rather than moving. The upstream README advises against the Google Fonts copy; use the upstream release. Widest strings of the shortlist (next to Noto).
- **PDF:** use static instances. `varLib.instancer` produced static TTFs (342 KB each) that embed and render in PDFKit, but they keep the family name "InterVariable", and provenance is lost versus upstream's own static files. Upstream's `Inter.ttc` holds the statics (13 MB); PDFKit accepts a TTC postscript name as the third argument of `registerFont`, but that was **not** tested here.

### IBM Plex Sans (IBM)

- **For:** Latin, Greek, Cyrillic; tabular digits by default, which suits counts and years; compact; strong character; maintained monorepo (pushed 4 Nov 2026); static TTFs and WOFF2 ready-made, including IBM's own unmodified split files.
- **Against:** the Reserved Font Name "Plex". Subsetting for a web font is "modification" (FAQ 2.6), and a Modified Version may not use the RFN (FAQ 5.3), so a self-subset must be renamed. To keep the name, ship IBM's unmodified WOFF2 files (unchanged data except compression, FAQ 2.2.1). Also: no variable font in the main release (the separate variable package is 0.2.0), `✗` missing, and a quieter "corporate" character than Geist or Inter.
- **PDF:** embedding is exempt from the RFN restriction (FAQ 1.12), so PDFKit's subset embedding is fine. Text round-trips (below).

### Atkinson Hyperlegible Next (Braille Institute / Google Fonts)

- **For:** designed for low-vision legibility, which supports FA-UEB-04's intent; the narrowest German strings; smallest files; variable and static builds; seven weights with italics.
- **Against:** only 392 glyphs: **no Greek, Cyrillic or Vietnamese**, no arrows or check marks. Only two OpenType features beyond `kern` (`case`, `frac`, plus `tnum`/`pnum`). Distinctive letterforms (unusual `l`, `I`, `1`, `0`) look less "neutral" than Inter or Geist; whether that suits the brand is a prototype question. Released Nov 2024; the repository's pushed date is June 2025.
- **PDF:** embeds fine; literal U+FB01/U+FB02 (fi/fl presentation forms) and any non-Latin script have no glyphs, so the guard rejects them. Needs the same Noto fallback as Geist, in more cases.

### Noto Sans (baseline, no new work)

- Already embedded (Regular, Bold, Italic) and listed in the server's notice; broadest coverage; heavy (826 KB per face; 54 KB subset for web). Neutral to the point of looking dated, which is the visual complaint of #181. Keep it as the **PDF fallback face** in any combination above.

### Rejected or deferred

- **System UI stack (`system-ui`)**: cannot be embedded in the PDF, differs per OS, and the extension-bundled, GDPR-friendly self-hosting aim argues for shipping a font. Possible only as a web fallback in the CSS stack.
- **Google Fonts hosted copies**: GDPR (external request) and, for Inter, outdated and feature-stripped per upstream. Self-host from the upstream release or an npm mirror.
- **Proprietary families (Söhne, Graphik and similar):** not in scope; none can be bundled without a purchase and a licence that covers extension distribution and PDF embedding.

## Licence analysis (primary text)

All five licence files were read: they are SIL OFL 1.1 with copyright lines "The Geist Project Authors" (2026), "The Inter Project Authors" (2016), "IBM Corp. with Reserved Font Name 'Plex'" (2017), "The Atkinson Hyperlegible Next Project Authors" (2020-2024) and "The Noto Project Authors" (2022). The `fsType` embedding flag is 0 (installable) in every file measured.

What the OFL FAQ says for each use [FAQ]:

- **PDF embedding:** "either in full or a subset. The restrictions regarding font modification and redistribution do not apply" (1.12). Embedding does not change the licence of the document (1.13). A font embedded in a document or bundled within a program may be distributed without the licence text (1.10).
- **Web fonts and extension bundles:** these are distribution, so the copyright statement, licence notice and licence text must ship with the package (1.20); fonts may be bundled with software under any licence (1.2, 1.4), including the project's AGPL/MIT code, as long as the fonts keep the OFL.
- **Converting to WOFF2:** allowed without renaming only if the data is unchanged except for compression (2.2.1); many converters change data and then output a Modified Version (2.2.2).
- **Subsetting or removing features:** "considered modification" (2.6, 2.5). A Modified Version must not use a Reserved Font Name (5.3, 3.8). This only bites fonts that declare an RFN: of the shortlist, **IBM Plex Sans**. Geist, Inter, Atkinson and Noto declare none in their copyright lines, so subsetting is free of the renaming rule (the OFL still requires the licence and notice with the subset).
- **Practical requirement for the repository:** vendored files keep their `OFL.txt` next to them (the server already does this for Noto in `apps/server/src/reports/fonts/OFL.txt` and `NOTICE.md`), and the extension and website bundles need the same notice. The OFL also forbids selling the font on its own (condition 1); bundling in a product is fine.

## PDFKit and PDF/UA findings

Measured with pdfkit 0.20.2 and fontkit 2.0.4 (restructure 3.0.2, the version in `pnpm-lock.yaml`), Node 24.14.

- **Static TTF faces embed and subset:** Geist, Plex, Atkinson, Inter-static and Noto each produced a PDF with `Marked: true`, catalog `Lang: de-DE`, and distinct subset fonts for Regular and Bold. A 2-line German sample takes 12-19 KB.
- **Variable font as-is:** registering the VF bytes for both `Regular` and `Bold` gives one font object (pdfkit sees the same font twice), so Bold is not bold: a 6 KB PDF with one font dictionary pair. No error is raised, so this is a silent failure.
- **Variable instance via `fontkit.create(bytes).getVariation({wght})`:** throws at `doc.end()` (`First argument to DataView constructor must be an ArrayBuffer`, from restructure's encoder via `TTFSubset`'s variation re-encode path) for both Geist VF and Inter VF. Same result with the CJS and the Node ESM fontkit entry. That is "reproduced here, root cause not isolated" and is a candidate bug to report upstream; do not build on it.
- **Text extraction:** `pypdf` recovers the German sample from all five PDFs, including ligature-forming ASCII ("offizielle", "Pflichtfelder", "Waffeln", "Auflage", `fi`/`fl` through `liga` in Geist and Plex) and diacritics (ÄÖÜäöüß, ł ő č, € and quotation marks). Two limits: literal U+FB01 and U+FB02 inputs come back as `fi`/`fl` or as blanks depending on the font (Atkinson and Inter-static have no glyph for them and extract empty), and an extraction check is not a screen-reader test. A real PDF/UA/veraPDF run on a font-specific report is still needed and has not been done (the project's existing veraPDF job covers the report layout, not each font).
- **Font-name collision hazard:** PDFKit treats two registered fonts as the same when checksum and name records are equal. Instanced statics derived from one VF may keep a shared family name; keep unique PostScript names if instancing is ever used.

## What this does not settle

- Visual quality at 12-14 px in the 320-400 px side panel and on Windows/macOS/Android text rendering; compare in the prototypes.
- Latin-only subset size for Inter when `opsz` is pinned; the 157 KB figure includes the axis.
- Whether the npm packages (`geist`, `@fontsource*`) are acceptable as dependencies under ADR-0002 and `docs/dependency-policy.md`; that policy has no font-specific rule, and the existing precedent is a vendored file plus a `NOTICE.md`. Vendoring from the tagged upstream release avoids the dependency question; npm mirrors (`@fontsource-variable/inter` 5.3.0, `geist` 1.9.2) exist if wanted.
- The `Inter.ttc` route and `@ibm/plex-sans-variable@0.2.0` were not exercised.

## Sources

[FAQ]: https://openfontlicense.org/ofl-faq/ (entries 1.2, 1.4, 1.10-1.13, 1.20, 2.2, 2.5, 2.6, 3.8, 5.3)
[OFL]: https://openfontlicense.org/ (licence text 1.1; also `OFL.txt` in each release below)
[GEIST]: https://github.com/vercel/geist-font/releases/tag/v1.9.2 (tag object `ef2597cfc42f4797676df105517ccc0a1cfa6569`; asset `geist-font-v1.9.2.zip`)
[INTER]: https://github.com/rsms/inter/releases/tag/v4.1 (tag `e3a3d4c57d5ecc01453a575621882a384c1995a3`; asset `Inter-4.1.zip`); README: https://github.com/rsms/inter#readme
[PLEX]: https://github.com/IBM/plex/releases/tag/%40ibm%2Fplex-sans%401.1.0 (tag `036e2d2a727bd6a378f69b7cde8d8dd20c472dae`); variable package: https://github.com/IBM/plex/releases/tag/%40ibm%2Fplex-sans-variable%400.2.0
[ATK]: https://github.com/googlefonts/atkinson-hyperlegible-next/tree/7925f50f649b3813257faf2f4c0b381011f434f1/fonts (commit on `main` at measurement time; v2.001, changelog "20 November 2024")
[NOTO]: https://github.com/notofonts/latin-greek-cyrillic (as vendored in `apps/server/src/reports/fonts/`)
[PDFKIT]: https://registry.npmjs.org/pdfkit/0.20.2 and `js/pdfkit.node.mjs` in that tarball (embedded fonts via `fontkit.create`, `isEqualFont`)
[FONTKIT]: https://registry.npmjs.org/fontkit/2.0.4 (`getVariation`, `TTFSubset` variation path)
[ADR17]: ../adr/0017-accessible-pdf-reports.md ; [PDF]: `apps/server/src/reports/pdf.ts` (glyph-coverage guard, `registerFont`)
[DEP]: ../dependency-policy.md (no font-specific rule; PDF engine section)
