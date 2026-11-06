# luminous-claude — Source Taster, "Luminous" (dark-first)

**Open:** `/tmp/st-191-round2/luminous-claude/index.html` (self-contained; the only external request is the Google Fonts stylesheet for IBM Plex).
URL params: `state=intake|running|summary|detail|brand`, `theme=dark|light`, `width=web|panel`, `grey=1`, `cmd=1`, `lang=de|en`, `at=<seconds>` (freezes the run clock), `clean=1` (hides the prototype dock). The dock at the bottom has the theme / width / greyscale / DE-EN toggles and state stepping. ⌘K or Ctrl+K opens the command bar.

## The idea
1. Light comes out of the content, not the chrome: near-black blue-grey surfaces, 1px hairlines, and a single azure "probe light" that appears only where the product is looking — the mark's lens bead, the progress line while a check runs, the focus ring, the hero ring.
2. The Bento summary is the signature moment: one oversized "3 von 8 korrekt" beside a verdict ring, then one tile per verdict, each a filter entry point into the list.
3. Verdicts are shape first, colour second: six glyph silhouettes plus a neutral text label, so nothing relies on hue and nothing reads as an accusation (summary and detail both say a verdict is a hint, not proof).
4. Light mode is its own token set (cool paper canvas, white surfaces, deeper verdict hues, a pale aurora instead of glow), not an inversion.

## Font and accent
- **IBM Plex Sans** 400/500/600 (UI, display) + **IBM Plex Mono** 400/500 (IDs, DOIs, source names, small-caps labels). The sans/mono pair share proportions, so trails like `Crossref ✓ DOI gefunden` stay coherent.
- **Accent: azure, OKLCH hue 232–236 in dark** (text/glow `0.80 0.13 232`, fill `0.74 0.14 236`, ink on fill `0.16 0.03 250`) **and hue 252 in light** (`0.50 0.17 252`, white ink). Not green, amber or red, and clear of every verdict hue.

## Verdicts: shape + label (hue is secondary)
| Verdict | Silhouette | Dark | Light |
|---|---|---|---|
| Korrekt | filled circle + tick | `0.82 0.17 155` | `0.52 0.13 155` |
| Existiert, mit Abweichungen | diamond + "≈" | `0.85 0.15 85` | `0.56 0.12 72` |
| Gemischte Referenz | hexagon + "Y" | `0.75 0.17 355` | `0.52 0.18 355` |
| DOI-Konflikt | triangle + "!" | `0.72 0.18 25` | `0.52 0.19 25` |
| Nicht gefunden | rounded square + "×" | `0.75 0.16 48` | `0.54 0.15 48` |
| Nicht verifizierbar | dashed circle + "?" | `0.74 0.012 265` | `0.50 0.02 262` |

The three red/orange verdicts (triangle / rounded square / hexagon) are separable by silhouette alone; see `shots/summary-web-dark-grey.webp` (greyscale applied to the app, glyphs and labels still distinct). The bento ring is colour-coded but each segment also carries its glyph as a "satellite" marker.

## Contrast pairs (WCAG 2.x ratios, measured on the rendered page)
Measured by `src/measure.mjs`: it resolves the live CSS tokens and the real chip backgrounds in Chromium, so it reflects what ships (including browser gamut clamping), not a side model.

| Pair | Dark | Light |
|---|---|---|
| text / canvas | 17.87 | 16.69 |
| text / surface | 16.73 | 18.12 |
| muted / canvas · surface | 8.69 · 8.14 | 7.14 · 7.75 |
| faint / canvas · surface | 5.94 · 5.56 | 5.50 · 5.97 |
| accent (text) / canvas · surface | 10.96 · 10.26 | 5.53 · 6.00 |
| ink on accent fill | 8.59 | 6.00 |

Verdict glyph colour on surface / on canvas (non-text, needs 3:1) and the verdict label (neutral text on the verdict's 12% tint chip, needs 4.5:1):

| Verdict | Dark glyph (surf / canvas) | Dark label | Light glyph (surf / canvas) | Light label |
|---|---|---|---|---|
| Korrekt | 11.49 / 12.28 | 13.95 | 5.16 / 4.75 | 11.55 |
| Existiert, mit Abw. | 11.73 / 12.54 | 13.85 | 4.76 / 4.38 | 11.65 |
| Gemischte Referenz | 7.77 / 8.30 | 14.49 | 6.10 / 5.62 | 11.40 |
| DOI-Konflikt | 6.90 / 7.37 | 14.54 | 6.08 / 5.60 | 11.46 |
| Nicht gefunden | 8.01 / 8.56 | 14.38 | 5.38 / 4.95 | 11.60 |
| Nicht verifizierbar | 8.14 / 8.70 | 14.38 | 5.97 / 5.50 | 11.42 |

Glyph inner marks (`--ink`) on the verdict fill: 7.05–12.0 dark, 4.76–6.10 light. Lowest value anywhere in the table is 4.38 (light "Existiert" glyph on the canvas), still above the 3:1 non-text minimum, and every text pair is ≥ 5.5. Label text on chips is neutral (`--text` in dark, `oklch(0.30 0.04 262)` in light), never verdict-hued.

## Verified
- Interactive flow with real motion (no reduced-motion), in DE and EN: intake → Prüfen → 8 refs stream roughly 0.7–1.2 s apart → "Ergebnis ansehen" → bento → DOI-Konflikt tile filters the list to 1 (and back to 8) → Mayer row → Kopieren copies the corrected reference (clipboard read back) → back to summary. No page errors, no `undefined`/`NaN`; in EN the only German on screen is the journal title in the sample data.
- Every interactive target is ≥ 24×24 CSS px at 1280 and 360 on intake, running, summary and with the command bar open, **with the prototype dock visible** (the dock is included in that audit).
- `prefers-reduced-motion`: no count-up, no beam, no view transition, run clock frozen at 4.0 s (rows 1–5 done, 6 mid-trail, 7–8 queued) instead of streaming. No horizontal scroll at 360.
- Glass (backdrop blur) is used only on the ⌘K bar and toasts.

## Shots (`shots/`, Chromium, reduced motion, DPR 2)
`<state>-web-<dark|light>.webp` and `<state>-360-<dark|light>.webp` for intake, running, summary, detail; `summary-web-dark-grey.webp` (+ `summary-360-dark-grey.webp`); `brand-web-dark.webp`, `brand-web-light.webp`; `cmd-web-dark.webp` (+ `cmd-web-light.webp`, `cmd-360-dark.webp`). Extras: `*-360-*-full.webp` (full-height scrolls), `running-web-dark-toolbar.webp` (dock visible), `summary-web-dark-panelmode.webp` (360 layout on a wide screen).

## Compromises / honest gaps
- The SVG wordmark is live `<text>` in IBM Plex Sans, so it depends on the webfont (falls back to a system sans). Outline it for production.
- The Mayer trail says "Titel weicht ab", not "Titel stimmt": the Mayer case in the brief has a title deviation, so the literal sample wording would contradict the compare view.
- In greyscale the ring *segments* are close in lightness; the satellite glyphs and tile labels carry the meaning there, not the ring itself.
- Only the Mayer reference has a hand-written detail; the other rows open a generic detail built from their data.
- Some dark-mode verdict hues (mixed, DOI, miss) sit at or beyond the sRGB edge and are clamped by the browser; the ratios above are measured after clamping.
- Light-mode "Existiert" glyph on the canvas is 4.38:1: fine for a non-text mark but the tightest value, so don't lighten that hue further.
- Not tested in Safari or Firefox; `linear()` easing, container queries and `color-mix(in oklab)` need a current engine. Fonts load from Google Fonts at runtime (self-host in production).
- Floating-glass hierarchy is deliberately restrained; there is no real upload, history or account content behind the nav items (they toast "… ist nicht Teil dieses Prototyps").
