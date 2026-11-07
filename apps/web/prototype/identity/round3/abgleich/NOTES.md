# Abgleich (matching) — concept notes

## Concept in 3 lines
1. Every reference is decomposed into 7 fields (Autor:in, Jahr, Titel, Quelle, Band/Heft, Seiten, DOI). Each field is a "stem" that either reaches the matched work (solid baseline), kinks (deviates), runs dashed to another work (outlined baseline), or ends open (searched, no hit).
2. In the list, that pattern is a 112 px **fingerprint** per row. The verdict is the name of the pattern: full comb = Korrekt, kinked stems = Abweichungen, one dashed stem to another work = Gemischte Referenz / DOI-Konflikt, open ends = Nicht gefunden, dotted rings = Nicht verifizierbar.
3. Mayer opens into the same picture at full size: user token → connector (straight = equal, notched amber = deviates) → best-match value → source columns (CR OA DNB S2 IA, cobalt = evidence), then the correction. At 360 px the same picture becomes a two-rail ladder (Ihre Angabe | Treffer) with diagonal rungs for deviations and source pills under each rung.

## Why it is specific to Source Taster
The field × source agreement *is* the product act. The fingerprint cannot be relabelled to "deployments": its stems are bibliographic fields, its baselines are works, its evidence columns are Crossref/OpenAlex/DNB/etc. The list needs no dashboard: the right-hand column of fingerprints is the overview. Wrong parts of a reference are visible as geometry (kink, dashed stem, open end), not only as a badge.

## Weakest point
- The fingerprint needs the "So lesen" key and the A J T Q H S D header; without them it is cryptic on first sight. Hover titles help only on web, not in the side panel.
- Books/reports have 4 stems, articles 7, so "fully matched" looks different (Luhmann vs Wilkinson). Absent fields are tiny dots, which is honest but visually uneven.
- At 1x, Nicht verifizierbar (dotted rings + dotted baseline) vs. "not provided" dots is subtle; the dotted baseline and the `?` glyph carry the difference.
- Only the Mayer detail is built; other rows would need their own variant (e.g. Mixed with two works side by side).
- Source evidence is per field, so the detail panel is dense on web; it is a lookup surface, not a scan surface.

## Deviations from the style baseline
- Cobalt is reserved for source evidence (dots/lines in the detail, primary action) so it never competes with verdict colours.
- Verdict *text* uses darker `-ink` variants (>= 4.5:1); strokes and glyphs use lighter variants (>= 3:1). Amber glyph carries a dark inner mark, not white.
- Added an ink-coloured baseline bar in the fingerprint for the matched work. No glass, glow, Bento or rings. Radii are smaller (14 px ledger) than the glass direction.
- Glyph shapes: circle ✓ (Korrekt), rounded square ≈ (Abweichungen), split diamond (Gemischt), triangle ≠ (DOI-Konflikt), hexagon ∅ (Nicht gefunden), dashed circle ? (Nicht verifizierbar).
- Dark mode not built.

## Facts invented beyond the brief
- OpenAlex has no Band/Heft for Mayer (hollow dot); DNB, Semantic Scholar, Internet Archive were not queried for Mayer.
- DNB is the confirming source for Döring (and Luhmann, via ISBN as in the brief).
- Wilkinson's 160018 is treated as matching the Seiten field.
- Schmidt/Krüger/Hoffmann/BMBF evidence texts are my wording; Krüger shows no hit for the reference itself apart from the DOI belonging to another work.
- Only the Mayer chevron and the verdict filter chips are functional; other rows are static. The toggle switches the frame width; the layout reacts via container queries, so it also works at a real 360 px viewport (checked: no horizontal overflow).

## Files
`index.html` (`?clean&only=moment` hides the toggle and the intake frame), `shots/moment-web.webp`, `moment-360.webp`, `moment-web-grey.webp`, `intake-to-moment.webp`.
