# glass-claude-2: "Glass", light-first (Lagune)

## Idea
- A bright, airy base with a slowly drifting colour field (azure, cyan, periwinkle and one low-chroma sand blob). The field is faintly visible on the base and **gets its depth and saturation through floating glass** (blur 26 px, saturate 1.7): the dock, the ⌘K palette, toasts, the brand sheet and the summary hero. Work surfaces (feed rows, tiles, comparison table) stay opaque, hairline-edged and calm.
- The summary hero is the lift: a glass plate over a coloured "aura" holds "3 von 8 korrekt" in Light 300 and a **ring of 8 arcs, each tipped with a verdict glyph bead**. The ring doubles as legend and filter. Bento tiles beside and under it carry the per-verdict counts and the sources tally.
- Choices that differ from a plain sidebar app: a floating pill **dock** (⌘K, new check, copy report; icon-only tab bar in the panel). The evidence trail is a reserved 2-line column inside each row, so rows never reorder or jump. Mono is used for DOIs, sources and fields.
- Mark: a tasting-spoon bowl that is also a **lens**, with a white check inside it and a cyan→lagoon→deep gradient, as if light fell through glass. At 16 px the glint and edge line are dropped.
- Everything is driven by one JS token object (light/dark) that also feeds the brand sheet. Container queries make the 360 px toggle and a real 360 px viewport share the same code.

## Font and accent
- **IBM Plex Sans** (300 for figures, 400/500 text, 600 brand) and **IBM Plex Mono**.
- Accent **"Lagune"** (azure/teal-blue, hue 235): `oklch(0.50 0.13 235)` light, `oklch(0.80 0.12 225)` dark. It is clear of green, amber and red.

## Verdict encoding (never colour alone)
Korrekt = circle + check · Abweichungen = diamond + ≠ · Gemischt = triangle + split mark · DOI-Konflikt = rounded square + ✕ · Nicht gefunden = hexagon + slash · Nicht verifizierbar = dashed ring + dots. All six are distinct in `summary-web-greyscale.webp`, and each carries a text label. Field deviations use ≠ + wavy underline + text, not tint alone.

## Contrast (WCAG 2.x ratio, computed from OKLCH → sRGB; scripts in `_tools/tokens.mjs`, `_tools/glass.mjs`)
Minimum 4.5 for text, 3 for glyphs and non-text.

| Pair | Light | Dark |
|---|---|---|
| ink / surface | 17.1 | 15.6 |
| muted / surface | 7.6 | 8.2 |
| faint / surface · faint / bg | 5.9 · 5.5 | 6.1 · 6.7 |
| muted / bg | 7.2 | 9.1 |
| accent text / surface · / bg | 5.6 · 5.3 | 9.7 · 10.7 |
| button text on accent fill | 5.7 (white) | 10.0 (dark ink) |
| accent focus ring / surface | 5.6 | 9.7 |
| Verdict label on surface (six) | 7.5 – 8.0 | 8.8 – 11.0 |
| Verdict label on its 14 % tint (six) | 6.1 – 6.7 | 6.9 – 8.3 |
| Verdict glyph fill on surface: ok · diff · mixed · doi · miss · unk | 4.3 · 4.0 · 5.3 · 5.6 · 5.4 · 4.6 | 9.3 · 9.9 · 6.5 · 6.4 · 6.6 · 7.1 |
| Glyph fill on its own 11 % chip tint (lowest = diff) | 3.5 – 4.6 | 5.6 – 8.0 |
| Glyph fill on its 14 % tile tint (lowest = diff) | 3.4 – 4.4 | 5.3 – 7.5 |
| Inner glyph mark on fill (lowest = ok, diff) | 4.4 – 5.7 | 6.7 – 10.3 |
| Hero ink / muted on 50 % white glass over azure blob | 13.7 / 6.1 | n/a |
| Hero ink / muted on worst blob (.75/.12/235) | 11.8 / 5.3 | n/a |
| Hero ink / muted on dark glass over indigo aura | n/a | 9.7 / 5.1 |
| ⌘K ink / muted / accent on 86 % white glass over blue blob | 15.6 / 7.0 / 5.1 | n/a |
| ⌘K ink / muted on 88 % dark glass over blue blob | n/a | 13.0 / 6.8 |
| ⌘K muted on dark glass over a white backdrop | n/a | 5.0 |
| ⌘K selected row: ink · accent bar vs. row fill | 12.7 · 4.2 | 7.7 · 4.7 |
| Lead headline (large text, ≥3) accent on azure field | 3.6 | n/a |

The light amber diamond was changed during the checks (fill L .66 → .60) because it measured 2.8 on its own tint.

## Compromises
- Two synthetic worst cases still fail in my checker: light ⌘K accent text over a **pure black** backdrop (4.1) and dark hero text over a **white page** (the hero never sits there). I raised ⌘K glass opacity (light .86, dark .88), so it is more opaque than the purest Liquid Glass look.
- Decorative card hairlines are ~1.4:1 against the surface. They are not the only identification of anything. State indicators don't depend on them: the current tab is accent text + semi-bold + raised pill, the selected ⌘K row has an accent bar (≥4.2) + tint, and filter chips are labelled with shape + count.
- Target size: all interactive elements measured ≥24×24 px at 1280 and 360 (Playwright audit, after animations settle; `_tools/targets.mjs`).
- The glass dock overlaps the bottom of the feed by design; feeds have 150 px bottom padding so the last row can scroll clear.
- Verlauf and Konto are stubs. DE/EN covers the main labels only; evidence-trail strings are German only. The file drop is a visual stub (no parsing).
- The mark reads slightly like a magnifier at first glance; the bowl-and-handle proportions are the spoon nod.
- The prototype tray (stepper, theme, width, greyscale, language, Marke, ⌘K, hide) is chrome and not part of the design; `tray=0` hides it.
- Under `prefers-reduced-motion` the colour field, ring draw-in, springs and the running timeline are static end states (`reduced-summary-web-light.webp`). The Running shot freezes the timeline at step 5 (`step=5&auto=0`).

## Opening a state directly
`index.html#s=intake|running|summary|detail&theme=light|dark&w=web|panel&gs=1&lang=en&k=1&sheet=1&tray=0`
