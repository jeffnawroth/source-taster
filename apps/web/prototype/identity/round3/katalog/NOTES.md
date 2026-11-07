# Katalog (slug: `katalog`)

## Concept in 3 lines
1. Every reference is a **catalogue card** (shelf mark `R03`, title, author line, mono DOI). Behind it lies the **best match as a second card**. The offset *is* the result: exactly behind = correct, offset = something deviates, empty dashed slot = nothing found, no card = no statement possible.
2. The opened Mayer case shows both cards side by side, the match card raised behind the front card. Only the deviating characters are marked (`20`**`19`**/`20`**`20`**, `45–6`**`2`**/`45–6`**`1`**, the title tail), everything that agrees stays quiet. Below it sits the correction as a follow-up card `R03b`.
3. "How did my list do" is answered without a dashboard: one prose headline, a tab register of eight edge tabs (shape + number, one per card, sticky, links to the card), and the verdict tab on each card (shape + label). Counts appear only as a caption column in the key.

## What makes it specific to Source Taster
- The data model is literally "your reference vs. best match". The two-card stack is that comparison, not a metaphor pasted on. Swap "references" for "deployments" and the stack no longer makes sense.
- Luhmann's Zettelkasten is used structurally: follow-up cards carry letters (`R03a` = best match, `R03b` = correction, `R04a`/`R04b` = the two works a mixed reference was drawn from, `R05a` = the work the DOI belongs to).
- Mono is used only for shelf marks, DOIs and source names, so evidence reads as catalogue data.
- Verdict wording never accuses ("Dieser DOI führt zu einem anderen Werk", "Das ist kein Fehler" for the grey one, "Sie entscheiden. Auch Datenquellen können Fehler enthalten").
- Data is exactly the 8 given. I added no sources, dates or ISBNs that the brief does not name (e.g. R08 only says "Deckungsgleich mit dem besten Treffer").

## Hard rules
- Six distinct silhouettes: circle ✓ (Korrekt), triangle ! (Abweichungen), diamond (Gemischte), square × (DOI-Konflikt), hexagon – (Nicht gefunden), dashed circle ? (Nicht verifizierbar). Verified in the greyscale shot (`moment-web-grey.webp`).
- Contrast measured: tab label ink on tint 8.0 to 9.3:1; glyph fill on its tint 3.3 to 6.5:1 (≥ 3:1); mono/secondary ink 6.4:1; white on cobalt 6.3:1.
- Register tabs at 360: ≈ 38 × 46 px (min 24 × 24). They carry only glyph + number, so shape-to-label is provided by the **"Schlüssel zu den Reitern" key directly above the strip**, plus `title`/`aria-label` on each tab. Each card also carries a full-label tab.

## Weakest point
- Two-card stack works at 1280 because the card behind has room to peek out. **At 360 it degrades to a single card with an offset shadow layer and per-field "Ihre Angabe / Treffer" lines.** The comparison stays legible, but the signature "card behind" is only a hint there (and in the compact cards of the list, where the offset is 8 px).
- The offset code (aligned / offset / dashed slot) is a learned convention and needs the three-line "So lesen Sie die Karten" key. Without it, the stacking is decoration.
- The list is longer than a dashboard would be (about 1900 px of cards at web). The register is what keeps it scannable; I did not test a 50-reference list.
- Row-for-row alignment in the opened case depends on explicit grid rows; a field that wraps long (title) grows both cards, which is fine, but a third source would need a third card.

## Deviations from the style baseline
- No blue glow in the page background and no glass; flat `--bg`, white surfaces. The concept needs crisp edges.
- Corner radius 8 px (cards) instead of the baseline's large radii; hero is left-aligned (editorial/collection-site feel) instead of centred.
- Semantic verdict colours are the baseline's, with darker "ink" variants for text on tints.
- Atkinson Hyperlegible Next + IBM Plex Mono (Google Fonts) and cobalt `oklch(0.5 0.2 264)` unchanged. No dark mode, per the brief.

## Files
`index.html` (use `?shot` to hide the width toggle and unstick the register, `?frame=intake` for the intake → cards frame), `shots/moment-web.webp`, `moment-360.webp`, `moment-web-grey.webp`, `moment-360-grey.webp`, `intake-to-moment.webp`.
