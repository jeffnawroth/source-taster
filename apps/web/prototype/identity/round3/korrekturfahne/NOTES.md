# Korrekturfahne (galley proof): `korrekturfahne`

## Concept in 3 lines
1. The user's reference list stays the document: typeset as a real bibliography (hanging indents, italics for journal and book titles), not rebuilt into cards. The check marks it up like an editor (Lektor) marks a galley.
2. Verdicts are **Korrekturzeichen** in a left rail (✓ Haken, ∧ Einfügezeichen, ⇄ Umstellen, slashed circle derived from the Tilgungszeichen, ? Autorenanfrage, dotted circle = Stet), each with its label. Evidence is a **marginal note** per reference ("Crossref · DOI gefunden · bester Treffer").
3. Deviations are **tracked changes inside the user's own text** (2019 struck, 2020 inserted; title and pages likewise), with letter refs a/b/c matching balloons in the margin. Each has Übernehmen / Verwerfen (it works in the file), plus "Alle übernehmen" and a copyable corrected reference. The summary is one prose sentence plus a colophon line. The legend of the marks doubles as the filter.

## Specific to Source Taster
- Product-specific because it is built from what the product *is*: a reference list that is being proofread. Swap "references" for "deployments" and it breaks (hanging indents, struck/inserted citation fields, a Korrekturzeichen legend).
- Inline markup differs by *form*, not colour: strike + insert for deviations, wavy underline on the borrowed title (Gemischt), circled DOI (DOI-Konflikt), trailing mark for the two "no statement" verdicts.
- The three reds are three shapes: ⇄ / slashed circle / ?. Greyscale shot confirms all six glyphs stay distinct.
- "Accept the correction" is literally accepting a tracked change; the verdict itself never changes.
- Wording avoids implying deception ("Möglicherweise wurde sie falsch übernommen"; "eine Grenze der Prüfung, keine Aussage über die Referenz").
- 360 px: no table to collapse. The margin splits deliberately: glyph + number stay in a 52 px left rail, the verdict label moves *above* the reference text, and the evidence drops *below* as a footnote behind a short rule (like a real footnote). Implemented with `@container`, so the in-page Web/Panel toggle behaves the same as a real 360 viewport.

## Weakest point
- Margin notes are the evidence layer. For a long list (80+ references) the margin repeats "Korrekt …" 60 times and the "calm" gets noisy. It needs collapse-by-default for Korrekt rows and a "show only what needs attention" mode. The legend filter only dims, it does not collapse.
- At 360 the Mayer case is tall (text, corrected version, evidence, three balloons stacked); the changes list wants to be a bottom sheet in the panel.
- Strike/insert inside hanging-indent running text with long titles gets visually dense (title b); the balloon repeats it, which is redundant on web.
- The deleatur-derived glyph (slashed circle) reads close to a generic "prohibited" sign; it is a deliberate loss of proofreading purity for legibility.
- The corrected version keeps the user's `doi:` as typed in the marked text but shows the `https://doi.org/` form in the correction (as in the brief); that normalisation is not itself shown as a change.

## Deviation from the style baseline
- Light theme, Atkinson Hyperlegible Next + IBM Plex Mono, cobalt `oklch(0.5 0.2 264)` as in the intake. Added: italic cuts of Atkinson (reference titles) and darker verdict inks (all ≥ 4.5:1) because the amber and green of the earlier round were too light for text. No glass, no glow beyond the faint top wash from the intake.
- Left-aligned editorial head instead of the intake's centred head, since this is a document, not an entry point.

Files: `index.html` (toggle bottom right), `shots/moment-web.webp`, `moment-360.webp`, `moment-web-grey.webp`, `intake-to-moment.webp`.
