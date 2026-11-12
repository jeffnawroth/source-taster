# Website and documentation: fidelity gaps against the accepted #198 S prototype

Tracks [#213](https://github.com/jeffnawroth/source-taster/issues/213), which was reopened because the built site
does not match the accepted #198 S prototype. This file is written before the rework starts. It records, for every S
page and element, the built state at tip `cdbb3eb`, the target and the files that change. It is updated at the end with
the intentional differences that remain.

- **Visual spec:** `apps/website/prototype/website/prototype-198.html` at commit `b6dfa14909b7ec8ed4f8a7057d4bc0ea94f14022`,
  opened with `?variant=S&page=<id>&theme=light|dark&lang=en|de&frame=web|360`. The top review bar and bottom variant
  switcher are review chrome, not design.
- **Behavioural spec:** [`website-and-documentation.md`](../website-and-documentation.md),
  [`voice-and-tone.md`](../voice-and-tone.md), ADR-0020, ADR-0027 and `GLOSSARY.md`.
- **Oracle:** `pnpm --filter @source-taster/web fidelity --url <preview> --only site-`, which renders every `site-*`
  state of the prototype next to the built preview (web 1280 and 360 px, light and dark).

Files below are relative to `apps/website/` unless a path says otherwise.

## Decisions that apply to every page

| #   | Question                                           | Decision                                                                                                                                                                                                                                                                                                                                                                                                            |
| --- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| D1  | Theme contract                                     | `packages/design-tokens/theme.css` keys every role off `:root[data-theme="light" \| "dark"]` and falls back to `prefers-color-scheme` when the attribute is absent. The website uses the same attribute on `<html>`, never writes it into the served HTML, and the toggle sets it from script. Without script the system theme applies and the toggle stays `hidden`, so there is no dead button.                    |
| D2  | Theme persistence                                  | Not persisted. ADR-0020 §F1 and the privacy e2e specs assert that the built site writes nothing to `localStorage` or `sessionStorage` and sets no cookie. A toggle choice therefore lasts for the page view only and the next page follows the system theme again. This is an intentional difference from a persisted toggle; it is recorded here, not tracked as a defect.                                          |
| D3  | Palette                                            | No prototype hex values in website CSS. Every prototype variable maps to a semantic `--st-*` role (table below). Residual colour deltas are listed under "Intentional differences" after the loop, and suspected token errors are recorded, never fixed in `packages/design-tokens`.                                                                                                                                  |
| D4  | `app-demo` page and "Open app design" link         | Not built. The prototype's `app-demo` page embeds design D with a "sample data · not a checking service" badge. It is a review aid. `website-and-documentation.md` and `claims.json` define no such page, and the spec forbids inferring a launched checking path from a design example. The sample Check card keeps its "not a real check" label and carries no link to an app. Intentional difference.             |
| D5  | Sample Check card copy                             | The accepted prototype label "Design example · not a real Check result" replaces the built "Illustrative example · not a live check" only where the content source allows it. Every new string is added in German and English together and is checked against `claims.json` and `publication:check`. The card remains the static server render of `ReferenceOutcomeSummary`, so no React runtime ships.                 |
| D6  | Verdict glyphs                                     | Reuse `VerdictGlyph` from `packages/ui/src/outcome-badges.tsx` through the same build-time static render that `ProductExample.astro` already uses. No inline SVG copies.                                                                                                                                                                                                                                            |
| D7  | Preview notice                                     | The spec requires the honest development-availability wording to stay. S places it in the footer line ("Local preview · Content draft v0.1 · Not approved for publication. No sign-in required."), and on article pages as the `.note` "Development preview · This guide describes the local version.". The built top banner is removed and both places follow S. The wording and the draft flags are unchanged.   |
| D8  | Recipes                                            | `buttonRecipe` has sizes `md` (min-h-9) and `sm` and no icon size. The round icon button is built in website CSS from `--st-*` tokens. Every new recipe class used in a page is added to the compiled class list in `astro.config.mjs`.                                                                                                                                                                              |
| D9  | No-JS behaviour                                    | Content, navigation, language switch, FAQ disclosures, chapter disclosure and the mobile menu work without script (`<details>` or plain links). Search needs script: its buttons stay `hidden` without it (see I3). The theme toggle needs script and is hidden without it.                                                                                                                        |
| D10 | Copy                                               | Prototype and content source share the pages' titles, summaries and paragraphs, because the prototype is compiled from `src/content.ts`. Prototype-only strings (eyebrows, "Read more", question titles, dev-preview note, tagline, theme label) are added to `src/content.ts` with the prototype's German and English wording. Where a prototype string conflicts with the spec the spec wins and it is recorded.  |
| D11 | German vocabulary                                  | The prototype applies `voice()` (Urteil → Befund) to non-legal copy. The built content already follows `voice-and-tone.md`; the legal documents stay unchanged.                                                                                                                                                                                                                                                       |

### Palette mapping

| Prototype variable | Light     | Dark      | `--st-*` role                  | Note                                                                |
| ------------------ | --------- | --------- | ------------------------------ | ------------------------------------------------------------------- |
| `--bg`             | `#f5f8fd` | `#080b12` | `--st-bg`                      | Page background                                                     |
| `--surface`        | `#fff`    | `#11151e` | `--st-surface`                 | Header, cards                                                       |
| `--sunken`         | `#f0f4fb` | `#0c1017` | `--st-surface-sunken`          | Notes, code, sunken panels                                          |
| `--text`           | `#0e1626` | `#f4f5f8` | `--st-text`                    |                                                                     |
| `--secondary-text` | `#374053` | `#c3c7cf` | `--st-text-secondary`          |                                                                     |
| `--muted-text`     | `#535b6c` | `#9da2ac` | `--st-text-muted`              |                                                                     |
| `--accent`         | `#2456d3` | `#8bb4fe` | `--st-accent`                  | Focus ring uses `--st-focus-ring`                                   |
| `--link`           | `#214bc9` | `#9bbeff` | `--st-accent-text`             |                                                                     |
| `--on-accent`      | `#fff`    | `#070e21` | `--st-on-accent`               |                                                                     |
| `--line`           | `#d4d7db` | `#414650` | `--st-border-strong`           | Token is an alpha tint, so the flat value differs slightly          |
| `--soft-line`      | `#e6e7ea` | `#292d37` | `--st-border`                  | Same, alpha tint                                                    |
| `--correct`        | `#018c46` | `#56dc85` | `--st-verdict-correct-mark`    | Through `VerdictGlyph`                                              |
| `--deviations`     | `#b26f06` | `#f4bf3f` | `--st-verdict-deviations-mark` | Through `VerdictGlyph`                                              |
| `--unverifiable`   | `#626978` | `#9ea5b2` | `--st-verdict-not-verifiable-mark` | Through `VerdictGlyph`                                          |

The prototype stage wrapper (`.site{padding-bottom:80px;border-radius:16px;overflow:clip}` and `body{background:transparent}`)
belongs to the review frame and is not ported. The built page uses the document as its frame.

## Shell

### Header (all pages)

- **Built:** no logo mark, text nav links with underline, a text "Search documentation" button, a language link that
  reads "English", no theme control, no mobile menu.
- **Target (S):** 76 px row on `--st-surface` with a bottom hairline; brand link (32 px mark plus "Source Taster",
  17 px bold, -0.02em); nav "Documentation", "FAQ", "Contact" as 13.5 px bold links in `--st-text-secondary`, no underline,
  36 px high, the current page in link colour with underline; utilities: round 36 px search icon button, ghost pill
  "EN"/"DE" language switch, round 36 px theme toggle (moon in light, swatch in dark, label "Switch color scheme" /
  "Farbschema wechseln"), a round menu button below 760 px that opens a nav with the same three links. Below 1000 px the
  third nav link is hidden, below 760 px the nav is replaced by the menu, below 500 px the row is 68 px with a 15 px
  brand, 26 px mark and tighter utilities.
- **Files:** `src/components/Page.astro`, `src/style.css`, `src/content.ts` (menu, theme and language labels),
  `astro.config.mjs` (recipe list), small theme script in `Page.astro`.

### Footer (all pages)

- **Built:** a plain link list with the licence and cancellation links and the draft line in a banner above the page.
- **Target (S):** top row with "Source Taster" and the tagline "Belege prüfen. Bewusst entscheiden." / "Examine
  evidence. Make informed decisions.", the three primary links to its right; a legal row (notice, terms, privacy,
  withdrawal, accessibility, cancellation where configured, search licences and source); the line "Local preview ·
  Content draft v0.1 · Not approved for publication. No sign-in required."
- **Must keep:** the interface-licence link (`uiLicenses`, `/third-party/ui/NOTICE.txt`) and the optional cancellation link.
  S has no row for the interface licence, so it joins the legal row. Recorded as an intentional addition.
- **Files:** `src/components/Page.astro`, `src/style.css`, `src/content.ts`.

## Pages

### Home (`site-home`)

- **Built:** a text-only hero with the static example in a bordered panel, then the old explore grid.
- **Target (S):** two-column hero. Left: eyebrow "Academic References" (mono, 11 px caps), h1 (40 px), lead (20 px,
  secondary text), actions (primary pill "How the Check works →" and a link "Limitations"), hero note. Right: the
  `.example` card: top bar (mark, command field "Paste References …", user icon), label, Check strip ("Sample Check · 3
  References" with the Correct, With deviations and Not verifiable counts), one reference block with a "Exists, with
  deviations" label, title, authors and year, meta line, footer "Verdict + fields + evidence" without the app link (D4).
  Below: section "Understand before you decide" with three numbered columns (01 to 03, title, summary, "Read more →"),
  then "The limits are part of the picture" with a paragraph and "Read the documentation". Below 760 px the hero is one
  column.
- **Files:** `src/pages/[...route].astro`, `src/components/ProductExample.astro`, `src/style.css`, `src/content.ts`.

### Documentation index (`site-index`)

- **Built:** bordered cards in one panel plus the search button above them.
- **Target (S):** eyebrow "Help without sign-in", h1, lead, scope sentence, pill search button with icon, a two-column
  question list (36 px number, question as h3, summary, arrow) with hairlines between rows, `max-width:940px`, then the
  public-information note. One column below 500 px. The five questions are the prototype's.
- **Files:** `src/pages/[...route].astro`, `src/guide-navigation.ts`, `src/style.css`, `src/content.ts`.

### Documentation article (`site-how-the-check-works`)

- **Built:** a chapter list above a long article with a different heading scale and no table of contents.
- **Target (S):** three-column grid (210 px chapter nav, article up to 720 px, 150 px on-this-page list) with a 36 px
  gap; breadcrumbs "Home / Documentation / title"; eyebrow "Guide · 01 / 05"; h1; lead; the `.note` "Development
  preview · This guide describes the local version."; sections with h2 headings from the prototype; a pager with the
  previous and next chapter. At or below 1000 px the table of contents is dropped, at or below 760 px the nav becomes a
  "Choose a chapter" disclosure above the article.
- **Files:** `src/pages/[...route].astro`, `src/components/Chapters.astro`, `src/guide-navigation.ts`,
  `src/style.css`, `src/content.ts`.

### FAQ, contact, accessibility and other simple pages

- **Built:** the shared article template.
- **Target (S):** `.simple` layout: breadcrumbs, h1, lead, FAQ as `details` disclosures (question as the summary),
  contact and accessibility as paragraph stacks, then the actions "Documentation" (pill) and "Limitations" (link).
- **Files:** `src/pages/[...route].astro`, `src/style.css`, `src/content.ts`.

### Legal pages

- **Built:** the draft banner above the legal text.
- **Target (S):** breadcrumbs, h1, a `.note` with the pending status and version, the lead, then the text. The legal
  text, its version and the "draft" status are unchanged and are not transformed.
- **Files:** `src/pages/[...route].astro`, `src/legal.ts` (labels only), `src/style.css`.

### Source access and cancellation

- **Built:** a plain page.
- **Target (S):** `.simple` layout with the h1 and a link back to the documentation. The prototype text on
  source-access states that the prototype uses a different search engine; the built page keeps its accurate Pagefind
  statement and the corresponding-source delivery (ADR-0020, licence obligations). Intentional difference.
- **Files:** `src/pages/[...route].astro`, `src/source-access.ts`, `src/style.css`.

### Search

- **Built:** an inline panel with a text button.
- **Target (S):** a dialog opened from the header search icon or the index search button, with a search field, a
  primary "Search" pill, the privacy help text, and the live results region with the loading, failure, empty and
  results states. Queries stay in memory and nothing is sent.
- **Files:** `src/components/Search.astro`, `src/style.css`.

## Test and harness changes

- Behavioural e2e assertions stay as they are: notices, privacy, search resilience, publication inputs and accessibility.
  Only assertions that encode the old visual structure change.
- `apps/web/scripts/design-fidelity.ts` gains FAQ, contact, legal and search states. States are only added, never
  removed or weakened.
- No website screenshot baselines exist under `apps/website/e2e`, so the #216 baselines are untouched. They belong
  to the web app and are not regenerated.

## Intentional differences

Status after the fidelity loop: every `site-*` sheet (home, index, how-the-check-works, faq, contact, legal-notice, search
and the open mobile menu; web and 360 px; light and dark) matches the prototype in layout, type scale, spacing and colour
role. What remains differs on purpose.

| #   | Difference                                          | Reason                                                                                                                                                                                                                                                  |
| --- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| I1  | No theme persistence (D2)                           | ADR-0020 and the privacy specs forbid storage; the choice lasts for the page view.                                                                                                                                                                      |
| I2  | No `app-demo` page, no "Open app design" link (D4)  | Review aid of the prototype, not a spec page. The menu and the example card omit the link.                                                                                                                                                              |
| I3  | Search is a dialog only (D9 amended)                | There is no search page. Without script the search buttons stay `hidden` and the guide links are the way in; the e2e suite asserts this at 320 px. Script reveals the header icon and the index button and opens the dialog.                              |
| I4  | Example card label (D5 amended)                     | Kept "Illustrative example · not a live check" / "Beispielansicht · keine laufende Prüfung" from the content source and its e2e specs instead of the prototype's "Design example · not a real Check result".                                            |
| I5  | English headings and questions in lowercase style   | `voice-and-tone.md` sets sentence case for English. Questions and headings come from `content.ts` and `guide-navigation.ts` ("What does a verdict tell me?", "Structuring references"); the prototype capitalises some of them. The spec wins (D10).     |
| I6  | FAQ question 2 is a plain statement                 | The content source has the answer but no question; the prototype's "Does a Verdict establish misconduct?" is not invented. Tracked in #230.                                                                                                             |
| I7  | Mobile menu is a `<details>` disclosure             | Works without script. Opens the same three links as the prototype overlay. Focus and Esc follow the native disclosure behaviour.                                                                                                                         |
| I8  | Language link name                                  | Visible "DE"/"EN" plus visually hidden "Deutsch"/"English" ("DE Deutsch"). The prototype's `aria-label` "This page in German" does not contain the visible text (WCAG 2.5.3, axe `label-content-name-mismatch`).                                         |
| I9  | Footer additions                                    | "Interface licenses and notices" stays in the legal row. The cancellation link renders only when `SOURCE_TASTER_CANCELLATION_SERVICE_ORIGIN` is set; the fidelity build sets a loopback origin so the row matches the prototype.                        |
| I10 | Preview notice in the footer line                   | Follows S (D7). The wording and the draft flags are unchanged.                                                                                                                                                                                         |
| I11 | Legal note links the version                        | The version in the note links to the immutable version page (prototype: plain mono text), so readers can cite the exact draft. Status and text are unchanged.                                                                                           |
| I12 | Search dialog without the visible "Esc" hint        | The close button is named "Close search"; Esc still closes. A visible key hint inside a button name breaks label-in-name.                                                                                                                              |
| I13 | Search backdrop                                     | Built from `--st-prim-neutral-50` at 48% to match the prototype. See "Suspected token errors".                                                                                                                                                          |
| I14 | Copy deltas                                         | German "Bitte senden Sie" vs "Senden Sie", a few headings and summaries follow the content source. Source-access text keeps the accurate Pagefind statement and the corresponding-source delivery.                                                      |
| I15 | Colour deltas                                       | Alpha-tint tokens for borders and a few state surfaces differ from the prototype's flat hex by a few levels. No token values changed.                                                                                                                     |
| I16 | `aria-current` only on the exact page               | As in the prototype: "Documentation" is current on the index only, not on article pages.                                                                                                                                                               |

## Suspected token errors

- `--st-scrim` (light) resolves to 20% alpha; the prototype's search backdrop is 48%. Tracked in #231. The website builds the
  backdrop locally and does not change `packages/design-tokens`.
