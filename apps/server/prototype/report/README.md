# #197 PDF design exploration

Throwaway candidates on `prototype/197-email-report`, not a production renderer change. The question is how the accepted calm Glass identity carries onto a readable, tagged paper report. All three layouts use the same colours, static typefaces, vector Verdict glyphs, fictional snapshot and content order.

- **A — Working report:** neutral bounded Reference sections, a two-column summary and the app's grouping rhythm.
- **B — Reading edition:** a single-column summary and open, continuous Reference sections with quiet margin rules.
- **C — Record sheet:** compact labelled rows, left/right field alignment and horizontal separators.

Open `prototype-197-report.html` directly. It embeds the actual rendered pages and downloadable PDF bytes, so no server, external font, image service or adjacent checkout is needed to review it. Switch A/B/C, DE/EN, page and greyscale. The PDF itself stays a light, opaque print document.

Six PDFs are in `output/pdf/`, each five pages. They show an intermediate snapshot with every Verdict, four separate Statuses, a manual Verdict alongside the unchanged system Verdict, per-Reference Scoring rules and a Correction suggestion preview. Reference text is not translated with the UI. Cyrillic sample text exercises the Noto fallback.

## Build

Use the repository's existing PDFKit 0.20.2 installation:

```sh
node apps/server/prototype/report/render.mjs
```

The optional first argument is another checkout's `apps/server` directory with the existing dependencies installed. No production files or dependency manifests are modified by this prototype. `build-gallery.mjs` packages the independent page renders in `output/previews/` and the structure-check record into the shareable gallery. The captured branch contains the finished gallery.

Fonts are unmodified static upstream Atkinson Hyperlegible Next and IBM Plex Mono TTFs, plus the existing report's Noto Sans fallback. Sources and OFL licences live in `assets/`. `mapping.mjs` records the opaque sRGB mappings and named compositing backdrops in `mapping.json`.

## Verification and limits

All 30 pages were rendered independently with PDF.js 6.4.299 and a local canvas, then visually inspected through page sheets and representative full-size pages. PDF.js found the heading/section/link structure; the PDF catalog marks the documents as tagged; all six include the original Cyrillic text, a document title, and the expected ten Reference sections. Page furniture and glyphs are Artifacts; their adjacent text carries the meaning.

The review gallery provides rendered pixels from those PDFs, not a separate HTML report imitation. Its controls and the PDF download were checked in a local browser. The mapping is still a design proposal until the owner chooses a layout.

These checks are not a PDF/UA claim or a screen-reader acceptance. The manual Windows/macOS review, production font/resource qualification, current authority/expiry behavior and other ADR-0017 gates remain implementation work. The simulated snapshot is explicitly fictional. Private transactional email specimens live only in the private repository, on the same branch name.
