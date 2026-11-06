# Source Taster: identity prototype, round 2 (shared brief)

You are building **one** throwaway, high-fidelity prototype of a visual identity direction for Source Taster. Three other agents are building sibling directions in parallel. The product owner compares all four and picks one, or a mix. This is a design exploration: no production code, no tests, no GitHub issue or PR activity, no git commits. Do not read or reference the repository `jeffnawroth/source-taster-legacy`.

## The product
Source Taster checks whether bibliographic references exist and are cited correctly. The user pastes a reference list or uploads a document. Each reference is matched against data sources (Crossref, OpenAlex, DNB, Semantic Scholar, the Internet Archive …) and gets one of six **Verdicts**:

| Verdict (DE label) | EN | Colour family | Meaning |
|---|---|---|---|
| Korrekt | Correct | green | Exists and is cited correctly |
| Existiert, mit Abweichungen | Exists, with deviations | yellow/amber | Exists, but fields deviate (year, title, pages …). A correction is offered |
| Gemischte Referenz | Mixed citation | red | Combines parts of different works, a typical AI pattern |
| DOI-Konflikt | DOI conflict | red | The DOI does not exist or belongs to another work |
| Nicht gefunden | Not found | red | Completed searches found nothing; presumably invented, check manually |
| Nicht verifizierbar | Not verifiable | grey | No statement possible (outside coverage, sources failed). Shown honestly, never as a failure |

Hard rules:
- A verdict is **never colour alone**. Each one needs a distinct glyph shape and a text label, and all six must stay distinguishable in greyscale. The three reds need three different glyph shapes.
- A verdict is never presented as proof of deception.

Surfaces: a web app, and a browser-extension **side panel about 360 px wide**. The same components must work in both.

## Brand positioning (decided)
- **Audience:** a professional tool for individual academic users, namely researchers, reviewers and lecturers, and students who should feel taken seriously by it.
- **Promise:** evidence-based verification, calm and with evidence.
- **Attributes:** precise, calm, trustworthy, transparent, crafted.
- **Personality:** the tool-like precision of Linear and Raycast, with a touch of warmth.
- **Name:** "Taster" (tasting, sampling) appears only as a subtle nod, in the mark or wordmark.
- **Amended after round 1:** *calm in the work surfaces, bold in the signature moments.* Light, glow, depth and glass are allowed as material. **No AI-hype look:** no rainbow borders, sparkle icons, "magic" wording or fake typing.

## Why round 2 exists
Round 1 restyled the old list/detail/table layout in three sober palettes. The owner said none of it feels like a 2026 app. They then saw a moodboard and said "That is what I call modern". Open it in a browser and study it:
`/Users/jeffnawroth/Developer/Repositories/source-taster/.claude/worktrees/agent-a2ab7cac8af095e58/apps/web/prototype/identity/vibes.html`

Round-1 screenshots, to see what NOT to repeat: `/tmp/st-191-shots/`

The agreed mix that every direction builds on:
1. **Luminous Dark** character, as in Linear and Raycast: near-black surfaces, crisp 1 px borders, subtle radial glows and light, monospace details for DOIs and sources. It also needs an **equally strong light mode**.
2. A **Bento summary** as the signature moment after a Check: big numbers, a ring or bar, tiles of different sizes, understood in one second.
3. The **canvas flow** for intake and the running Check: a central "Literaturliste einfügen …" field instead of form pages, then a **streamed results feed**. Each reference resolves in place and shows an **evidence trail** as evidence arrives, for example "Crossref ✓ DOI gefunden · Titel stimmt · Jahr weicht ab (2019 → 2020)". There is no fake letter-by-letter typing. Rows never reorder, and focus is never stolen.
4. **Liquid Glass only as a material for floating layers**: the command bar (⌘K), popovers, sheets and toasts. Work surfaces are never glass.
5. Bold editorial type is not for the app. (It is reserved for the website.)

Rethink layout and structure freely. Do not reproduce the round-1 list/detail table.

## What to build
One self-contained `index.html` (inline CSS and JS, vanilla or a tiny inline framework). For fonts, link Google Fonts but **only** from this shortlist, all OFL: **Geist / Geist Mono, Inter, IBM Plex Sans / Plex Mono, Atkinson Hyperlegible Next**. Pick what suits your direction. No other external resources.

It must contain:
- **App shell:** a new **mark and wordmark** as inline SVG, crafted at 2026 quality (this is the brand, so put effort here), minimal navigation (Prüfen, Verlauf, Konto), and a ⌘K command bar as a glass layer.
- **Four states**, walkable through a small stepper or auto-play:
  1. **Intake:** an empty, inviting state with the central paste field and a file drop.
  2. **Running Check:** 8 references streaming in and resolving one by one (~0.7 s apart), with their evidence trails.
  3. **Bento summary:** "3 von 8 korrekt" style, with counts per verdict as filter entry points.
  4. **Reference detail:** the deviation reference, showing a field-by-field comparison of "Ihre Referenz" vs. "Bester Treffer" with deviations marked (not colour-only), a copyable correction suggestion, and the data sources consulted.
- **Toggles,** floating and obviously not part of the design: theme light/dark, **width web (~1280 px) / panel (360 px)**, greyscale (`filter: grayscale(1)`), and DE/EN for the main labels if cheap (DE is the default).
- **A brand sheet** section or overlay: the mark in sizes (16, 32, 128 px), the palette as OKLCH tokens (neutrals, a brand accent, the six verdicts in light and dark), and a type specimen.

Data: use 8 realistic German-context references covering all six verdicts. For example: Luhmann, N. (1984) Soziale Systeme (Korrekt); Wilkinson et al. (2016) The FAIR Guiding Principles… (Korrekt); Mayer, T. (2019) Digitale Lehre in der Hochschulbildung, Zeitschrift für Hochschulentwicklung 14(3), 45–62, doi:10.3217/zfhe-14-03/04, whose best match has year 2020, title "Digitale Hochschullehre: Formate und Wirkungen" and pages 45–61 (Abweichungen); Schmidt & Weber (2017) Lernen mit Medien im Zeitalter der Digitalisierung (Gemischt); Krüger (2021) Datenschutz im digitalen Klassenzimmer (DOI-Konflikt); Hoffmann (2022) Resilienz durch Kollaboration: Eine Studie an deutschen Universitäten (Nicht gefunden); Bundesministerium (2023) Digitalisierung in der Bildung: Bericht zur Lage (Nicht verifizierbar, outside coverage); and one more Korrekt.

## Quality bar
- It must make the owner say "wow, that is 2026". Polish, depth, motion with springy `linear()` easing, view transitions where useful, and attention to detail. Study the moodboard's Luminous Dark and Bento tiles.
- **Accessibility still binds:** WCAG 2.2 AA contrast (4.5:1 text, 3:1 non-text and glyphs), including on glows and glass. `prefers-reduced-motion` renders everything static. Targets are at least 24×24 px.
- German strings run long. The 360 px panel must look **designed**, not squeezed.
- The brand accent must not collide with the verdict colours, so avoid green, amber or red as the accent.

## Deliverables
Write everything to your own folder: `/tmp/st-191-round2/<your-slug>/`
- `index.html`
- `shots/`: PNG screenshots taken with Playwright (Chromium). Playwright is available in the repo at `/Users/jeffnawroth/Developer/Repositories/source-taster`; for example, run a small script with `node` from a scratch folder that imports `playwright` from that repo's `node_modules`, or use `npx playwright`. Capture all four states at web width in dark and light, all four at 360 px in dark, the summary in greyscale, the brand sheet, and the command bar open. Name them `<state>-<width>-<theme>.png`.
- `NOTES.md`: the direction's idea in 3–5 lines, the font and accent chosen, the contrast pairs you checked and their ratios, and any compromise.

Final message: your slug, the absolute path to index.html, and the NOTES.md content.
