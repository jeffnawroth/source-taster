# C revised: Source Taster "Glass", round 4

This is a throwaway design prototype. `index.html` is a single file. It loads its fonts from Google Fonts, and everything else is inline.

## How to open it

Open `index.html` in a browser. A small dev bar at the bottom-left switches:

- the theme (light/dark)
- the width (web, or a 360 px panel)
- greyscale
- the language (DE/EN)
- the brand sheet

You can also use URL parameters. Examples:

- `?s=summary&theme=dark&w=360&lang=en`
- `?s=detail&ref=3&acc=1`
- `?cmd=1`
- `?grey=1`

The flow is: intake → running → summary → filter (click a tile) → detail → accept the correction. ⌘K opens the command bar from anywhere. ←/→ step through the references on the detail view.

## What changed and why

### The owner's asks

- **The correction shows as a tracked change in the user's own reference.** Below the header, the detail view now shows a "Korrektur in Ihrer Referenz" card. It contains the user's own citation in their citation style (APA 7). The deviating year, title and pages show as struck old text next to inserted new text. Two actions follow:
  - **"Korrektur übernehmen"** (⌘↵). The struck text fades out, the card morphs into "Ihre Referenz, korrigiert" through a local View Transition, and the inserted text stays marked. A toast offers **Rückgängig**, and focus moves to it.
  - **Kopieren.** It copies the corrected reference.

  The verdict does not change on accept. An inline note says why: the check stays traceable. A "Korrigiert" tag follows the reference into the summary row and the detail header.
- **The field-by-field comparison stays, and now names its witnesses.** A new "Belegt durch" column lists, for each field, the sources that confirm the best-match value (Crossref ✓ · OpenAlex ✓ · …). A deviating row is tagged "≠ weicht ab", and the differing characters carry an amber wavy underline. A legend under the tracked change names the backing sources ("2020: from the best match, backed by Crossref and OpenAlex").
- **The summary leads with one calm sentence.** "Drei von acht Referenzen stimmen." It is built from the data in both languages: number words, list joins, verdict glyphs inline. The rest of the paragraph explains the other five without alarm. The red group is captioned "Befunde, keine Beweise", and a footer line repeats that a verdict is not proof of deception.
- **A pinch of A's boldness, only in the summary hero.**
  - The glass hero holds a 128 px Atkinson 800 numeral inside a segmented ring.
  - The ring segments grow on a spring and the number counts up.
  - Everything else keeps C's calm intake and airy cards.

### Craft and signature moments

- **Spring motion.** Two `linear()` springs (`--spring`, `--spring-soft`) plus a plain ease-out for exits. The brand sheet plots all three curves.
  - Verdict chips pop in as each check resolves in the running view. Evidence trails write in line by line.
  - A summary row morphs into the detail header and back (`view-transition-name: ref-card`).
- **Living glass, but only on floating layers.** These are:
  - the top bar
  - the summary hero
  - the command bar
  - toasts
  - the pager

  Each has a slowly drifting light field (`@property` animated) and a refraction rim. The light follows the pointer subtly. Cards stay opaque surfaces.
- **Tiles are questions.** Clicking a tile filters the reference list. If the filtered rows sit below the fold, they scroll into view. The active tile gets an "aktiv" mark and a solid outline.
- **`prefers-reduced-motion` and `?still=1`** remove every animation, transition, drift and count-up. The final state renders directly.

### Mark, wordmark, app icon

- **The mark** is a closing quotation mark made of two drops. The first drop is solid: the reference. The second is glass and half-filled: the sample still being tasted. Read together, it says "the citation ends, the check begins".
- **Variants:**
  - a 16 px optical cut: no rim or sheen, heavier drops, and the second drop solid at lower opacity, so it survives as a favicon
  - mono: the second drop becomes an outline, with no transparency
  - knockout, for use on the accent colour
- **The app icon (128/64/32)** shows the mark as a lit glass object on a deep cobalt field.
- **The wordmark** is "Source **Taster**" with "Taster" in the accent. It comes in light, dark and mono.
- **The brand sheet** (dev bar → Marke) shows:
  - all of the above at 128/64/32/16
  - an in-context browser tab and toolbar strip
  - OKLCH tokens with contrast ratios measured live
  - a type specimen with a confusable-glyph line, weights and verdict chips
  - the motion curves

### Dark mode

- Dark mode is tuned separately, not inverted. It has its own:
  - ink ramp
  - verdict hues (lifted chroma and lightness)
  - insert and strike tokens
  - glass base
- The command-bar glass in dark mode uses a calmer, near-monochrome field. The earlier violet/teal field read as "AI product".

### Gaps fixed

- **Evidence trails are now in EN.** Every trail line, source label, field-comparison row and summary sentence has an English version. A scan of the EN UI found no German strings except proper names: authors, titles and a German publisher.
- **The correction highlight is not green.** Insertions use cobalt: a soft accent wash with a 2 px accent underline. Deletions are a neutral grey strike. Green appears only on "Korrekt".
- **The pager dock no longer covers content.** The detail pager is a strip of verdict glyphs with ←/→ buttons in the breadcrumb row at the top. It no longer floats as a dock. The scroll area reserves bottom space for toasts.
- **No dead air in the panel hero.** The ring shrinks to 116 px with a 54 px numeral, and legend labels wrap instead of truncating.
- **Panel layout bugs found while walking the flow:**
  - Comparison cells had lost their padding and borders, because a `display: contents` row ate the selector.
  - Highlighted values were splitting into separate grid items.
  - The brand sheet overflowed at 360 px because of `1fr` minimums.

## Font and accent

- **Atkinson Hyperlegible Next** (400–800) for the UI. It was designed for low-vision legibility, and it keeps I/l/1, O/0 and rn/m distinct. That matters when a user compares author names and page ranges letter by letter.
- **IBM Plex Mono** (400–600) for DOIs, page ranges, URLs, sources and timings. It gives evidence a "recorded" voice that is distinct from the prose.
- **Accent: cobalt, hue ≈264.** It is not green, amber or red, so it never competes with a verdict.

  | Theme | accent | accent-text | on-accent |
  |---|---|---|---|
  | Light | `oklch(0.5 0.2 264)` | `oklch(0.47 0.2 265)` | white |
  | Dark | `oklch(0.77 0.13 262)` | `oklch(0.8 0.12 262)` | `oklch(0.17 0.04 265)` |

## Verdicts

Every verdict is shown as a glyph plus a text label, never colour alone. The three reds have three different glyph shapes:

| Verdict | Glyph |
|---|---|
| Gemischt (mixed) | hexagon with linked rings |
| DOI-Konflikt (DOI conflict) | rounded square with a broken bar |
| Nicht gefunden (not found) | magnifier with × |

Greyscale mode (`?grey=1`, see `shots/summary-web-light-greyscale.webp`) shows that every state stays distinguishable.

## Measured contrast (WCAG 2.2)

**Method.** Playwright renders each element and makes its text transparent. It then captures the real pixels behind the text, including glass over the drifting field. The computed text colour is composited over every sampled pixel, and the ratio is computed per pixel. The tables report the **median** ratio, which is the actual background. The 2nd-percentile values that fall lower all trace back to non-text pixels inside the box: chip borders, the insert underline, the button's rounded corners, or a wrapped inline box overlapping neighbouring text.

Text (needs ≥ 4.5:1):

| Pair | Light | Dark |
|---|---|---|
| Lede sentence on bg | 9.76 | 11.61 |
| Lede eyebrow (ink-3) | 6.39 | 7.68 |
| Hero eyebrow **on glass** | 8.93 | 9.17 |
| Ring label **on glass** | 16.11 | 15.54 |
| Legend label **on glass** (worst pixel) | 16.49 | 15.55 |
| Tile names (mono, ink-3) | 6.82 | 7.13 |
| Row author / index (mono) | 6.82 | 7.13 |
| Disclaimer line | 6.40 | 7.68 |
| Primary button (white on cobalt / dark ink on light cobalt) | 5.99 | 9.14 |
| Struck old value (del-ink) | 7.47 | 8.51 |
| Inserted value on insert wash | 13.80 | 12.60 |
| Comparison header | 6.82 | 7.13 |
| "Deviates" tag | 14.12 | 11.72 |
| Source-backed pill | 9.42 | 11.24 |
| "Korrigiert" tag (accent-text on accent-soft) | 6.43 | 7.95 |
| "Applied" badge | 5.98 | 6.96 |
| Running: ref meta | 6.82 | 7.13 |
| Running: pending chip label | 10.39 | 10.78 |
| Intake: drop-zone subline | 6.63 | 7.42 |
| Command bar group label **on glass** | 7.04 | 9.84 |
| Command bar shortcut **on glass** | 6.08 | 8.08 |
| Command bar footer **on glass** (worst pixel) | 6.56 | 7.69 |
| Toast text **on glass** (worst pixel) | 15.61 | 13.29 |

The primary button uses a gradient, so a median reading could hide a lighter stop. Each stop was checked on its own. In light mode, white text on the lightest stop `oklch(0.55 0.2 263)` is **5.03:1**, and on the darkest stop `oklch(0.47 0.2 266)` it is 7.23:1. In dark mode the ink stays between 7.57:1 and 11.22:1. That makes the light primary button's top edge the tightest text pair, followed by the light "Applied" badge at 5.98:1.

Non-text: verdict glyph colours against the card surface (needs ≥ 3:1). Verdict colours are used only for glyphs and tints, never as text colour.

| Glyph | Light | Dark |
|---|---|---|
| Korrekt `--ok` | 4.34 | 10.41 |
| Mit Abweichungen `--diff` | **4.06** (tightest) | 10.76 |
| Gemischt `--mixed` | 5.66 | 7.12 |
| DOI-Konflikt `--doi` | 5.61 | 6.57 |
| Nicht gefunden `--miss` | 7.51 | 5.75 |
| Nicht verifizierbar `--unk` | 5.51 | 7.37 |
| Insert underline `--ins-line` | 6.27 | 9.61 |

Against the page background, light `--diff` is 3.82:1, which is still above 3:1.

## Other checks run

**Reduced motion.** Tested with Playwright's `reducedMotion: 'reduce'` and without `still=1`:

- `document.getAnimations()` is empty on summary, detail, intake and during a live run;
- the ring numeral renders its final value immediately;
- accepting a correction runs with no animation and no View Transition.

**Interactive targets.** Every button, link, option and input is at least 24×24 px:

- across all states
- at both widths
- in DE and EN

**Smoke run.** It covers:

- 11 states × 2 widths × 2 themes
- console errors
- horizontal overflow

There are no console errors and no horizontal overflow in any combination.

**Live walk.** The scripted walk ran in light and dark at both web and 360 px:

- paste the example
- start the check
- the completion toast appears
- the summary sentence shows
- filter by "Mit Abweichungen"
- open ref 03
- accept the correction
- → to the next reference
- back to the summary, where the row shows "Korrigiert" and the filter is kept
- ⌘K → "Hoff" → Enter opens Hoffmann

All four combinations passed with no errors.

## Compromises

- **Light `--diff` amber has the least margin.** It reaches 4.06:1 for glyphs. A darker amber drifts towards brown and starts to read as a fourth red in greyscale. Amber is never used for text, so I kept it.
- **Accepting does not re-run the check.** The verdict stays "Existiert, mit Abweichungen" after accept, which is honest about what was verified. A real product might offer "Erneut prüfen".
- **Rows that are still waiting reserve space for their evidence trail** in the running view. This avoids layout shift as results arrive, at the cost of some empty space early in the run.
- **The toast can overlap content at 360 px.** It floats over the bottom edge of the scroll area. The area has 72 px of bottom padding, so content can always be scrolled clear, but the toast is not docked.
- **The glass drift and pointer-light are decoration.** They are fully disabled under reduced motion. A real build should budget `backdrop-filter` carefully in a 360 px extension panel.
- **Fonts come from Google Fonts.** Until they load, the layout uses the system fallback. Screenshots wait for `document.fonts.ready`.

## Files

- `index.html`: the prototype
- `shots/`: Playwright Chromium at DPR 2, named `<state>-<width>-<theme>.webp`:
  - intake, running, summary and detail × web/360 × light/dark
  - `summary-web-light-greyscale.webp`
  - `brand-web-light.webp` and `brand-web-dark.webp`
  - `cmdbar-web-light.webp` and `cmdbar-web-dark.webp`
  - extras: `detail-accepted-web-light.webp`, `detail-accepted-360-dark.webp` and `summary-web-light-en.webp`
