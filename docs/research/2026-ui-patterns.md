# What a state-of-the-art product UI looks like in 2026 — issue #182

Research retrieved **6 November 2026** for [#182](https://github.com/jeffnawroth/source-taster/issues/182), part of [map #181](https://github.com/jeffnawroth/source-taster/issues/181). Feeds the brand positioning and the identity prototypes.
Planning evidence only: no prototype, screenshot capture, accessibility test or licence review was performed. The predecessor repository was not consulted.

## Method and evidence quality

Claims are tagged:

- **[P]** read on a first-party page (product site, changelog, engineering/design blog, design-system docs, spec) during this research.
- **[S]** secondary or inferred. Treated as hypothesis only.
- **[G]** gap: no primary source found. Not a finding.

Screenshots were not captured (no browser session). Each pattern links to the page that shows the product itself; the identity prototypes should capture their own references.

**Limits.** Arc and Notion published no first-party design write-up that I could retrieve, so their sections are mostly [G]/[S]. Linear, Raycast and Vercel Geist are well covered. Competitor result UIs are partly covered from vendor pages and help text; several competitor product pages were behind 404/403 or marketing-only. The 2026 Linear refresh and Raycast v2 are described by their own posts, so they are the strongest "2026" signal here.

## Short answer

A 2026 product UI is **quiet, content-first, dense but breathable, and token-driven**:

1. **Neutral, warm-leaning greys carry the structure; colour is rationed for meaning.** Few borders, soft dividers, dimmed chrome, content area brightest.
2. **One workhorse variable sans (Inter / Geist class), one mono, tabular figures, a small numbered type scale** centred on 13–14 px for app text.
3. **Colours defined in a perceptual space (OKLCH/LCH), generated from very few inputs (base, accent, contrast), light and dark as first-class twins.**
4. **A stable shell**: dim sidebar or narrow rail + clear header/view controls, consistent across all views; keyboard-first with a command surface.
5. **Motion is functional and short**, with reduced-motion fallbacks; glass/blur is an accent, not the base.
6. **Competitors in the citation domain mostly present verification as flat lists with coloured status; none is a polished 2026 product UI** — the gap Source Taster can occupy is a calm, evidence-first, accessible-by-design results view.

## Pattern catalogue

### 1. Colour

| Pattern | Evidence | Implication for Source Taster |
| --- | --- | --- |
| **Perceptual colour space for themes.** Linear moved its theme generator to LCH ("perceptually uniform", same lightness looks equally light), used for surfaces, elevation levels (background, panels, dialogs, modals) and now the built-in light/dark themes. [P] [Linear: how we redesigned the UI](https://linear.app/now/how-we-redesigned-the-linear-ui) | Generate the whole palette, including verdict colours, in OKLCH so green/yellow/red/grey have matched lightness and pass contrast by construction. |
| **Theme = few inputs.** Each Linear theme is base colour, accent colour, contrast, replacing 98 variables. A contrast variable yields very high-contrast themes for accessibility. [P] same post | Tokens: base, accent, contrast, plus fixed semantic verdict hues. A high-contrast variant is cheap to offer. |
| **Neutral/warm greys, less blue.** Linear's March 2026 refresh moved defaults "from a cool, blue-ish palette toward a warmer gray", warning that too warm turns muddy; tuned hue/chroma/lightness per token in a dev-toolbar colour tool. [P] [Behind the latest design refresh](https://linear.app/now/behind-the-latest-design-refresh), [changelog 2026-03-12](https://linear.app/changelog/2026-03-12-ui-refresh) | Leave brand colour small; keep the neutral ramp slightly warm or truly neutral; do not default to "SaaS blue". |
| **Numbered 10-step role scale.** Vercel Geist: scales 100–1000 where 100/200/300 = component background default/hover/active, 400/500/600 = border default/hover/active, 700/800 = high-contrast background, 900/1000 = secondary/primary text and icons. Two background values only (use background-1 almost always). 10 scales: backgrounds, gray, gray-alpha, blue, red, amber, green, teal, purple, pink. P3 on supporting displays. [P] [Geist colors](https://vercel.com/geist/colors) | Strong model for the token spec: steps are roles, not shades. Geist's red/amber/green map onto the required verdict red/yellow/green; add grey. |
| **Alpha vs solid.** Solid gray borders by default; alpha only where an edge must blend; avoid overlapping alpha borders; transparent shadows avoid grey halos. [P] same page | Rule for the token doc. |
| **Wide gamut and modern CSS colour.** Tailwind v4's default palette is OKLCH/P3; tokens in `@theme` are emitted as CSS variables; `color-mix()` generates opacity variants. [P] [Tailwind v4](https://tailwindcss.com/blog/tailwindcss-v4). `light-dark()` is Baseline 2024 (newly available) and needs `color-scheme: light dark`. [P] [MDN light-dark()](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/light-dark) | The current stack (Tailwind 4) already delivers the technique; no stack change is needed for colour. |
| **Colour rationed for state, icons toned down.** Linear removed coloured team-icon backgrounds and reduced icon count. [P] Behind the latest design refresh | Colour should mean "verdict" or "primary action"; avoid decorative colour. This also helps FA-ERG-03. |

### 2. Typography

| Pattern | Evidence | Implication |
| --- | --- | --- |
| **Inter as UI workhorse, with display cut for headings.** Linear: Inter Display for headings "to add more expression", regular Inter for body. [P] How we redesigned the Linear UI. Inter 4: variable weight 100–900, text vs display optical designs, `tnum` tabular figures, `ss02` disambiguation (I/l/1), `zero`, OFL 1.1. [P] [Inter](https://rsms.me/inter/) | Candidate, self-hostable, OFL (check against ADR-0017 for PDF embedding). Tabular and disambiguated figures matter for DOIs and years. |
| **Geist Sans/Mono family.** Foundations list Geist Sans and Geist Mono; assets also Geist Serif and Pixel. [P] [Geist intro](https://vercel.com/geist/introduction). Fonts are OFL-1.1, on npm (`geist`) and Google Fonts. [P] [vercel/geist-font](https://github.com/vercel/geist-font) | Second candidate. Both are legitimate; the choice is a brand decision for #183-class tickets, not a capability gap. |
| **Small numbered type scale with role classes.** Geist: Headings (72…14), Labels (single line: 20/18/16/14/13/12, plus mono variants), Copy (multi-line: 24…13), Buttons (16/14/12); each class pins size, line-height, letter-spacing, weight; a `strong` modifier. Label 14 and Copy 14 are the most used; 13 for secondary/space-constrained; 12 for tertiary in busy views; tabular figures for numbers at 13. [P] [Geist typography](https://vercel.com/geist/typography) | App text 13–14 px with distinct label (single-line) and copy (multi-line) roles is the proven density for narrow panels. Cap heading sizes in the side panel. |
| **Mono for identifiers.** Geist has mono label/copy variants for inline code. [P] same page | DOIs, ISBNs, identifiers in mono (check against longer German strings and wrapping). |

German length: none of the products studied publishes localisation guidance [G]; treat it as a Source Taster-specific prototype test.

### 3. Density, borders and chrome

- **Dim the chrome, let content win.** Linear made navigation sidebars "a few notches dimmer": "Don't compete for attention you haven't earned". [P] Behind the latest design refresh
- **Fewer, softer dividers.** Borders had "quietly proliferated"; the refresh removed many, softened contrast and rounded edges: "Structure should be felt not seen." [P] same
- **Compact tabs with rounded corners, icon-only where possible.** [P] same
- **Fewer, smaller icons; redrawn icon set.** [P] same and [changelog](https://linear.app/changelog/2026-03-12-ui-refresh)
- **Consistent headers, navigation and view controls across all views** (projects, issues, reviews, docs). [P] changelog
- **Alignment as a craft rule.** Linear aligned labels, icons and buttons in sidebar/tabs horizontally and vertically, tested layouts "from very condensed to more spacious", and made navigation chrome removable for web vs Electron. [P] How we redesigned the Linear UI
- **Materials preset.** Geist offers presets for radii, fills, strokes, shadows, and treats the grid as part of identity. [P] Geist intro

Implication: define radius/stroke/shadow as a small preset set; default to hairline, low-contrast separators; one dim neutral surface for lists, brighter surface for the selected detail.

### 4. Layout and app shell

- Persistent sidebar + content + (optional) detail is the shared shell of Linear and Raycast's AI Chat sidebar (projects grouping chats, auto-archive). [P] [Raycast v2 manual](https://manual.raycast.com/new-in-v2)
- **Compact mode** as a first-class variant: Raycast v2 ships a compact window that "strips ... back even more to the essentials". [P] same
- **User-adjustable grids** for visual lists (columns chosen by user). [P] same
- **Tags/organisation to make hundreds of items manageable.** [P] [The New Raycast](https://www.raycast.com/blog/the-new-raycast)
- **Container queries are now built in** (Tailwind v4 `@container`, `@sm:` etc.), the right primitive for one component serving both the wide web workspace and the narrow side panel. [P] Tailwind v4

Fit with [ADR-0016](adr/0016-results-presentation-workflow.md): the list/detail split at width, detail replacing list in the side panel with Back, and filter chips that are the six verdict counts already align with the 2026 shell pattern. What ADR-0016 does not yet say (candidates for the design-system ADR): a dimmed list surface vs bright detail, a compact density option, and persistent header/view controls.

Arc: its signature (vertical sidebar replacing the tab strip, colour-coded Spaces) is documented only in secondary coverage [S] (e.g. [Wikipedia](https://en.wikipedia.org/wiki/Arc_(web_browser)), [Thurrott on Dia](https://www.thurrott.com/cloud/web-browsers/322287/the-browser-company-explains-its-vision-for-dia)); no first-party design write-up retrieved [G]. The transferable idea (context-grouped navigation with a collapsible rail) is already covered by the Linear/Raycast sources. Notion: only third-party descriptions (Inter-based "Notion Sans", restrained type) [S]; no first-party design source retrieved [G]. A Notion design post exists on notion.com (page design rules applied more consistently) but did not give usable specifics.

### 5. Interaction: keyboard first, command surfaces

- Raycast v2 rebuilt its own UI components because off-the-shelf ones were not built for keyboard-first power-user workflows. [S: search-result summary of the [technical deep dive](https://www.raycast.com/blog/a-technical-deep-dive-into-the-new-raycast), not read in full] Its hotkey recorder supports `fn` alone and left/right modifiers; Quick AI is "open, type, press Tab". [P] The New Raycast
- Linear's refresh added a preference for Enter vs Cmd/Ctrl+Enter to send comments. [P] changelog
- WCAG 2.2 SC 2.5.8 (AA): pointer targets at least 24×24 CSS px, or spacing so a 24 px circle around each does not overlap another; exceptions for inline text links etc. [P] [W3C Understanding 2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html). This binds the dense 13 px rows in the side panel: row hit areas and icon buttons must meet it.

Implication: keyboard model for the Reference list (arrow/enter/back, filter toggles) is a differentiator that is compatible with React Aria Components, which targets exactly this. Not evaluated here.

### 6. Motion

- Raycast: Liquid Glass applied sparingly "in tasteful ways to enhance the functional nature of a launcher"; the redesign is meant to "sit naturally inside macOS Tahoe while preserving the professional feel". [P] The New Raycast
- Modern CSS makes enter animations and navigation transitions declarative: Tailwind v4 wraps `@starting-style`, exposes `--ease-*` tokens; the View Transitions module covers same- and cross-document transitions (`@view-transition`, `view-transition-name`). [P] Tailwind v4, [MDN view transitions](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/View_transitions)
- MDN's page gave no reduced-motion guidance in the portion read; the standard practice (disable the transition animations under `prefers-reduced-motion: reduce`, skip `startViewTransition`) is general knowledge [S]. WCAG 2.2 AA does not require it by itself, but the map's motion principles should include it.

Principle candidates (prototype and test, not claimed as product evidence): motion communicates state change (row status updating in place, detail replacing list), 100–200 ms, no motion on automatic streaming updates that would move focus (matches ADR-0016: no auto-reorder, no focus stealing).

### 7. Light and dark mode

- Linear's built-in light and dark themes come from the same generator, and text/neutral icons were darkened in light and lightened in dark mode for content contrast. [P] How we redesigned the Linear UI
- `light-dark()` plus `color-scheme: light dark` follows the OS with one declaration; forced `light`/`dark` handles the Preferences override (ADR-0023). [P] MDN
- Geist's colours page did not describe dark-mode handling [G] on the page read, but its step roles (100 background … 1000 text) are mode-agnostic by design.

Implication: token architecture = role-based steps with two mappings; verdict colours need separate light and dark values, checked in greyscale (FA-ERG-03).

### 8. How the look is achieved (technique summary)

1. Role-based colour tokens in OKLCH, a handful of inputs, generated scales (Linear, Geist, Tailwind 4).
2. CSS custom properties as the contract (`@theme`), `light-dark()`/`color-scheme`, `color-mix()` for alpha.
3. Variable fonts, self-hosted, optical-size cuts and tabular figures (Inter 4; Geist).
4. Small number of materials (radius, stroke, shadow) and consistent chrome components.
5. Container queries for one component in two shells.
6. Tooling to tune colours visually (Linear's dev-toolbar colour tool feeding Figma tokens). [P]

None of these require leaving React Aria Components + Tailwind 4 (ADR-0002); the evidence supports **keeping the stack** and treating the design system as a token and component-spec layer on it. This is a reading of the sources, not a stack test.

## Domain competitors: how verification and citation results are presented

| Product | What it presents | Good | Weak / unknown |
| --- | --- | --- | --- |
| **Scite** | Smart Citations classify how later papers "supported, challenged, or discussed" a paper; tallies, badge anywhere via browser extension; Reference Check lists retracted/editorial-notice/contrasted references and shows the citing text beside how others cited the work. [P] [scite.ai](https://scite.ai/); [S] [Reference Check overview](https://medium.com/scite/reference-check-an-easy-way-to-check-the-reliability-of-your-references-b2afcd64abc6) (page not fetchable; summarised via search) | Evidence in context (the sentence, not just a label); each AI claim links to the exact sentence in the source paper. [P] Counts/tally as scannable summary. | Scite's own help says reference detection depends on format, DOI and PDF and "will nearly always miss a few"; no-DOI items (news, policy) don't appear. [S via search summary of help]. It answers a different question (how a work was cited), not "does this reference exist". Badge colour semantics: [G]. |
| **Zotero** | Retracted items flagged in the list, warning at the top of the item pane with details and links, banner, citation-time warning and a Retracted Items folder (original feature). [S] [forum announcement](https://forums.zotero.org/discussion/comment/333666) and [University of Melbourne summary](https://blogs.unimelb.edu.au/researcher-library/?p=3790); the official support page returned 404 [G] | Warning is attached to the item at the point of use (list flag plus detail banner plus on citing); Source Taster's retraction support in ADR-0016 follows the same shape. | Depends on DOI/PMID and the Retraction Watch data pipeline latency; false positives reported on corrections. [S] Not a "does it exist" checker. |
| **Recite** | Checks in-text citations against the reference list (APA), no AI, Crossref integration. Three sections: In Text References, Reference List, Annotated Article; filters "Show only issues", "Show possible citations", year and author filters; "Found in document", "Not found in document", "1 + 1 possible matches"; inline year colouring green exact / orange possible / red none; single-column or split view; 'Adjust' to fix wrongly merged/split entries. [P] [Recite product tour](https://www.reciteworks.com/product-tour); [S] [FAQ summary via search](https://reciteworks.com/faq) | Three-level match (exact / possible / none) with a "possible" filter mirrors uncertainty honestly; manual correction of parsing errors; split view; "show only issues" filter. | Colour is the primary carrier of status in the annotated article (not a11y-safe alone). Different problem (internal consistency, not external existence). Reviews of older versions call it cumbersome. [S] [Walden Writing Center review](https://waldenwritingcenter.blogspot.com/2016/12/a-writing-center-review-recite.html) |
| **Citely** | Checks each citation against Crossref, PubMed, arXiv, OpenAlex, Semantic Scholar; flags "chimera citations, fabricated DOIs, temporal drift". [P] [citely.ai](https://citely.ai/) Statuses reported by third parties: Verified, Verified with Warnings, mismatch, not_found. [S] [Sourcely review](https://www.sourcely.net/resources/ai-citation-checkers-catch-broken-fake-misused-references), [MCP listing](https://www.mcpbundles.com/skills/citely-mcp-548751004a) | The same field-by-field evidence model as Source Taster (DOI, title, author, year, venue). A middle state ("with warnings") for minor deviations such as abbreviated journal names. | Report UI, colours and exact status definitions: [G] (help centre not retrievable). Treat as unverified. A `not_found` that does not distinguish "does not exist" from "not in these databases" would be a trust risk. Source Taster's "Not verifiable" vs "Not found" split is the sharper design. |

### What competitors teach for the results view

1. **Three-state certainty is normal; two-state is a trap.** Recite (exact/possible/none) and Citely ("with warnings") both add a middle tier. ADR-0016's six verdicts are richer; the UI must keep the middle tiers visually distinct beyond colour.
2. **Status by colour alone is the industry default and the accessibility failure to avoid** (Recite's red/orange/green year colouring). Source Taster's FA-ERG-03 (icon + text + colour, greyscale-distinguishable) is a genuine differentiator; make it visible in the brand.
3. **Show evidence next to the claim** (Scite: the citing sentence; Recite: hover details, "open in context"). ADR-0016's side-by-side reference vs best match is the equivalent; 2026 treatment is mainly in typography and diff marking, not new structure.
4. **Filters that isolate problems** ("show only issues", "possible" filter) correspond to ADR-0016's six verdict-count filters.
5. **Warnings travel with the item** (Zotero: list flag, detail banner, at citation time). Applies to retraction and to unverifiable references in exports/PDF.
6. **Honest limits are stated in help, not in the result** (Scite). Source Taster already mandates "How the check works" and "a Verdict is not proof of deception"; keep it adjacent to the list.
7. **None of the four competitors shows a modern, token-driven, dark-mode-ready product UI in the sources retrieved**; Citely's and Recite's pages are marketing or utilitarian. [S/G] This is an observation about available evidence, not a market survey.

## Implications for downstream tickets

- **Brand positioning (#190 and neighbours):** "Calm, evidence-first, accessible" is differentiated against competitors that lean on colour-only status; product-UI reference class is Linear/Geist/Raycast.
- **Identity prototypes:** compare at least two neutral-ramp temperatures (neutral vs slightly warm) and two type pairings (Inter/Inter Display vs Geist Sans/Geist Mono) in the real narrow side panel with German strings, in light, dark and greyscale.
- **Tokens:** role-based 10-step scales, OKLCH-generated, verdict hues with separate light/dark values, check 24×24 targets, 4.5:1 text and 3:1 non-text contrast (WCAG 2.2 AA; ratio values are standard criteria, not read in this session).
- **Stack (ADR-0002):** nothing found argues for leaving React Aria Components + Tailwind 4; the techniques above are CSS-level and available. Not a test of fit.
- **Motion:** short, functional; no animation that moves focus or reorders streaming rows; honour `prefers-reduced-motion`.
- **Fonts and licences (ADR-0017):** Inter and Geist are OFL-1.1 per their own repositories/sites; whether OFL satisfies web + extension + PDF embedding is for the ADR-0017 review, not decided here.

## Open gaps (not resolved)

- No first-party design sources retrieved for **Arc** (or Dia) and **Notion**. If these matter for positioning, ask for a targeted follow-up or use hands-on screenshots in the prototype.
- **Scite** badge colour semantics and Reference Check result layout, **Citely** and **Recite** (per-status) exact UI, and the official **Zotero** retraction documentation were not retrievable as first-party pages.
- **Geist** dark-mode token handling and contrast ratios are not stated on the pages read.
- Raycast technical deep dive and the Raycast "A fresh look and feel" post were identified but not read in full.
- No screenshots were captured; the catalogue links to sources only.

## Sources

- Linear: [How we redesigned the Linear UI](https://linear.app/now/how-we-redesigned-the-linear-ui) · [Behind the latest design refresh](https://linear.app/now/behind-the-latest-design-refresh) · [Changelog 2026-03-12 UI refresh](https://linear.app/changelog/2026-03-12-ui-refresh)
- Raycast: [The New Raycast](https://www.raycast.com/blog/the-new-raycast) · [New in Raycast v2](https://manual.raycast.com/new-in-v2) · [Technical deep dive](https://www.raycast.com/blog/a-technical-deep-dive-into-the-new-raycast)
- Vercel Geist: [Introduction](https://vercel.com/geist/introduction) · [Colors](https://vercel.com/geist/colors) · [Typography](https://vercel.com/geist/typography) · [geist-font](https://github.com/vercel/geist-font)
- Type: [Inter](https://rsms.me/inter/)
- Platform: [Tailwind CSS v4](https://tailwindcss.com/blog/tailwindcss-v4) · [MDN light-dark()](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/light-dark) · [MDN View transitions](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/View_transitions) · [WCAG 2.2 SC 2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)
- Competitors: [Scite](https://scite.ai/) · [Recite product tour](https://www.reciteworks.com/product-tour) · [Citely](https://citely.ai/) · secondary: listed inline
