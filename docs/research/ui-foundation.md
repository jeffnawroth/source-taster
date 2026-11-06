# UI foundation: is React Aria Components + Tailwind CSS 4 still the best choice?

Ticket: [#183](https://github.com/jeffnawroth/source-taster/issues/183), part of the map [#181](https://github.com/jeffnawroth/source-taster/issues/181). Research date: 2026-11-06. Input to the design-system ADR; amending ADR-0002 is **not** recommended.

## Recommendation

**Keep React Aria Components (RAC) 1.x with Tailwind CSS 4.** No candidate is clearly better against ADR-0002's bar, and one prominent alternative (React Spectrum S2) fails the extension constraint outright.

Migration cost of keeping: none. Cost of switching: low in code today (see "Current usage") but it buys no capability the project lacks, and it re-opens a client-accepted ADR.

What to do instead of switching, for the downstream design-system tickets:

1. Treat RAC as the behavior and accessibility layer only, and own the visual layer: a token set (CSS custom properties through Tailwind 4 `@theme`) plus a small set of project-owned styled components.
2. Start those components from the official **React Aria Tailwind starter** (copy-in source, installable with the shadcn CLI), not from a third-party kit. This gives the "pre-styled kit" experience without adding a dependency.
3. Add `tailwindcss-react-aria-components` (state variants such as `pressed:` and `selected:`) when the first styled component lands.

## Current usage (migration cost baseline)

Read from this repository at `5c7d140` and from `jeffnawroth/source-taster-service` via `gh api`.

| Place | RAC usage | Styling |
|---|---|---|
| `packages/ui` (`package.json`: `react-aria-components` 1.22.1) | One re-export in `src/index.tsx`: `Button`, `Label`, `Text`, `TextArea`, `TextField`. About 8 `<Button` and 1 `<TextField` uses across ~6,000 lines of `src/*.tsx`/`src/workspace.css`. | Inline Tailwind utility strings (about 300 `className` sites), e.g. `rounded border border-slate-600 px-3 py-2`, plus a hand-written `workspace.css` with hard-coded hex colors. No design tokens yet. |
| `apps/web`, `apps/extension` | No direct RAC import. `style.css` (20 lines each) does `@import "tailwindcss"` and `@import "@source-taster/ui/workspace.css"`; both build with Vite 8.3.5 and `@tailwindcss/vite`. | Same. |
| `source-taster-service/apps/web` (private) | `Button` and `Heading` only (seen in `operator.tsx`, `catalog-editor.tsx`, `order.tsx`). Tailwind 4.3.3. | Tailwind. |

Consequence: the UI is a thin layer over RAC today. The visual "dated and hard to scan" problem noted in #181 is a styling and layout problem, not a foundation problem. Almost all design-system work is greenfield whichever foundation is chosen, so a foundation switch would not rescue existing work and would not remove any existing work either.

## The bar (ADR-0002 and #181)

No pre-1.0 core, TypeScript 7 compatibility, WCAG 2.2 AA, a local bundle with no remote code for the extension, AGPL-3.0 compatibility, light and dark theming, maintenance health, and fit for a narrow (side panel) layout and German string lengths.

## Findings per candidate

Versions and dates are from the npm registry and GitHub releases as of 2026-11-06.

### React Aria Components 1.x + Tailwind CSS 4 (incumbent)

- **Version and health.** `react-aria-components` 1.22.1, last published 2026-10-09; 1.22.0 released 2026-10-09, 1.21.0 on 2026-09-04, 1.20.0 on 2026-07-31 (roughly monthly minor releases; GitHub releases of `adobe/react-spectrum`). The repo had a push on 2026-11-06, 100 commits between 2026-09-25 and 2026-11-05 from 32 distinct authors, is not archived. License Apache-2.0. Latest release notes list no breaking changes ([v1.22.0 notes](https://react-aria.adobe.com/releases/v1-22-0)).
- **Bar.** Stable 1.x, so it meets the no-pre-1.0 rule. Apache-2.0 code can be combined into an AGPL-3.0 work, and `docs/dependency-policy.md` already allows Apache-2.0 with notices. The package is style-free, ships no remote fonts or scripts, and bundles locally. The package declares `sideEffects` and offers per-component subpath imports (`react-aria-components/Select`, shown in the [getting-started page](https://react-aria.adobe.com/getting-started)), which helps extension bundle size.
- **Accessibility.** The docs state semantics and keyboard behavior follow the WAI-ARIA Authoring Practices, with 30+ localized string sets, 13 calendar systems and RTL ([react-aria.adobe.com](https://react-aria.adobe.com/)). The page does not claim WCAG 2.2 AA conformance; that claim stays with the project's own axe and manual audits (FA-UEB-04), as for every candidate below.
- **Styling.** Style-free. Per-state data attributes (`data-pressed`, `data-selected`, and so on), render props and stable default class names. The official [Tailwind starter](https://github.com/adobe/react-spectrum/tree/main/starters/tailwind) uses `tailwindcss` 4, `tailwind-variants` and `tailwindcss-react-aria-components` 2. A vanilla CSS starter (`starters/docs`) also exists. Both can be installed with the shadcn CLI per the getting-started page. Caveat: the Tailwind starter's `package.json` pins `react-aria-components` `^1.14.0`, so verify it against 1.22 when copying.
- **Breadth.** 50+ components including DatePicker, Calendar, Table, virtualized collections, drag and drop, and (new in 1.22.0) Sheet. Date and locale handling is the strongest of all candidates and matters for DE/EN and for citation metadata forms.
- **TypeScript 7.** Types ship as `.d.ts`. The repo's own checks already run TypeScript 7.0.2 (`@typescript/native` in the root `package.json`) with RAC 1.22.1 in `packages/ui`. This research did not execute that typecheck (no installed dependencies in the research worktree), so treat TS 7 as "no known issue, confirmed by the existing CI typecheck" rather than independently verified.
- **Risk.** Single corporate sponsor (Adobe). Mitigated by Apache-2.0, a large contributor base and the fact that RAC is the base of Adobe's own design system, so Adobe needs it maintained.

### React Spectrum S2 (`@react-spectrum/s2`)

- **Version and health.** 1.8.2 (npm), stable since 1.0.0 on 2025-12-16, released in lockstep with RAC through 1.8.0 on 2026-10-08 ([release notes](https://react-spectrum.adobe.com/releases/index.html)). Apache-2.0.
- **Disqualifier for the extension: remote fonts and scripts.** The S2 `Provider` renders `<Fonts />`, which preloads Adobe Clean from `https://use.typekit.net/...` and, for CJK locales, injects a `https://use.typekit.net/<id>.js` script ([`Fonts.tsx`](https://github.com/adobe/react-spectrum/blob/main/packages/@react-spectrum/s2/src/Fonts.tsx), [`Provider.tsx`](https://github.com/adobe/react-spectrum/blob/main/packages/@react-spectrum/s2/src/Provider.tsx)). That conflicts with "nothing executable is loaded remotely" (ADR-0002), the GDPR self-hosting rule in #181, and font-licence constraints (ADR-0017). Unbundling Adobe Clean is not something the project can do on its own account. I did not find a documented supported way to disable or replace the font loading; that would be a patch of a vendor component.
- **Theming is closed.** The docs state the `styles` prop on Spectrum components accepts only layout, spacing, sizing and positioning, and "other styles such as colors and internal padding cannot be customized" ([styling guide](https://github.com/adobe/react-spectrum/blob/main/packages/dev/s2-docs/pages/s2/styling.mdx)). A Source Taster brand identity (#182) and the four verdict colors (FA-ERG-03) would sit outside it. S2 looks like Adobe, and that is the point of the system.
- **Build coupling.** Requires the Parcel-style `style` macro through `unplugin-parcel-macros` in Vite, a manual chunk rule and lightningcss minification ([getting-started, Vite tab](https://github.com/adobe/react-spectrum/blob/main/packages/dev/s2-docs/pages/s2/getting-started.mdx)). It is documented and stable, but it is an extra build plugin to qualify under the dependency policy, and it does not combine with Tailwind as the styling language for the app.
- **Verdict.** Excluded. Its S2-specific parts do not meet the extension bar and cannot carry a custom brand. RAC itself, which S2 is built on, remains available.

### shadcn/ui on Base UI or Radix

- **What it is.** Not a dependency: a CLI that copies component source into the repo, with Tailwind styling ([shadcn changelog](https://ui.shadcn.com/docs/changelog)). Repo `shadcn-ui/ui` is MIT and active (pushed 2026-11-06); the `shadcn` CLI is at 4.23.0. The changelog shows Base UI documentation from January 2026 and Base UI as the default from July 2026. It also lists React Aria entries from July 2026 (the excerpt gave only titles), so the same CLI can now deliver React Aria based components too, and RAC's own docs offer a shadcn install path.
- **Base UI.** `@base-ui/react` 1.9.0 (MIT, last published 2026-10-09), stable since 1.0.0 on 2025-12-11, monthly releases, 37 unstyled components, `CSPProvider`, a11y fixes in most releases ([release page](https://base-ui.com/react/overview/releases)). The old `@base-ui-components/react` package is stuck at `1.0.0-rc.0`: a naming trap, make sure any kit imports `@base-ui/react`. Backed by MUI. The mui/base-ui repo had pushes on 2026-11-06.
- **Radix.** `radix-ui` 1.8.1 (MIT, 2026-10-14). The repository's last push is 2026-10-14, a slower cadence than the others, and the shadcn default has moved to Base UI, so Radix is the weakest choice for a new build.
- **Gaps compared with RAC.** No date picker, calendar or table in Base UI's component list (not found on its releases page), and no equivalent of RAC's localized date, number and collection infrastructure. shadcn fills the gap with other libraries per component (for example a date picker built on `react-day-picker`), so the result is several upstreams, not one. The project will probably need date input for metadata correction forms, a disabled-state-heavy form UI and virtualized lists of check results, where RAC is stronger.
- **Strengths.** The copy-in model means the project owns the code; styling is already Tailwind; the community and agent familiarity are the largest. Both Base UI and RAC meet the extension bar.
- **Verdict.** A credible equal on the bar, not clearly better. It was already considered and rejected in ADR-0002 ("Considered options: UI"). Nothing found in this pass changes the reasons: it would trade one stable primitive layer for another, plus an extra per-component dependency tail. The project can still borrow shadcn-style *patterns* (tokens, registry layout) on top of RAC.

### Others (skimmed, not recommended)

Versions from the npm registry on 2026-11-06.

| Candidate | Version | Note |
|---|---|---|
| Ark UI (`@ark-ui/react`) | 5.40.0, MIT | Headless, active. Zag.js based; no advantage over RAC for this project. Park UI's Tailwind plugin was last published 2024-03-06 (stale). |
| Ariakit (`@ariakit/react`) | 0.4.42, MIT | Pre-1.0, so excluded by "no pre-1.0 core". |
| Mantine (`@mantine/core`) | 9.7.5, MIT | Complete and active, but ships its own CSS system and look. Conflicts with Tailwind-first, bespoke brand and a narrow side panel. |
| HeroUI (`@heroui/react`) | 3.2.7, Apache-2.0 | Opinionated styled kit, built on React Aria. Adds a dependency and a look the project must then fight; the same RAC foundation is available directly. |
| Chakra UI (`@chakra-ui/react`) | 3.38.0, MIT | CSS-in-JS runtime lineage and its own system; not aligned with Tailwind 4. |
| React Aria hooks (`react-aria`) | 3.53.1, Apache-2.0 | Lower-level hooks from the same project. Useful only if a RAC component cannot be styled. |

Not exhaustively evaluated: Mantine, HeroUI and Chakra were judged by registry metadata and positioning only, not by reading their source. None changes the conclusion because each adds a competing visual system on top of a primitive layer the project already has.

## Tailwind CSS 4

`tailwindcss` 4.3.5 (MIT, published 2026-11-06). The repo pins 4.3.4 (extension, web) and the service app 4.3.3. The Vite plugin route (`@tailwindcss/vite`) is already in use and works with Vite 8.3. No contrary evidence was found, and nothing here required deeper verification. One recommendation: define design tokens with `@theme` CSS variables so light/dark and the verdict colors (FA-ERG-03) are single-sourced across the web app, the side panel and the private web app, and so the fixed hex values in `workspace.css` can go.

## Answers to the ticket's checklist

| Criterion | RAC 1.x + Tailwind 4 | S2 | shadcn + Base UI |
|---|---|---|---|
| No pre-1.0 core | Pass (1.22.1) | Pass (1.8.2) | Pass (Base UI 1.9.0; shadcn is copy-in source) |
| TypeScript 7 | No known issue; repo typechecks on 7.0.2 | Not examined | Not examined |
| WCAG 2.2 AA | Strong base; conformance claimed by neither, project audits | Same | Same |
| Local bundle, no remote code | Pass | **Fail** (Typekit fonts and script in `Provider`) | Pass |
| AGPL compatibility | Apache-2.0, allowed by policy | Apache-2.0 | MIT |
| Light and dark, custom brand | Free (tokens) | Light/dark yes, **colors not customizable** | Free (tokens) |
| Maintenance health | Monthly releases, 32 authors in 100 commits | Same team | Active; Base UI monthly, Radix slower |
| Date, calendar, table, i18n | Built in | Built in | Partial, other libraries needed |

## Caveats and what was not verified

- WCAG 2.2 AA conformance was not tested for any library. Only the vendors' own statements were read. The project's axe and manual audits decide.
- TypeScript 7 compatibility for S2 and Base UI was not examined. For RAC it rests on the existing repository typecheck, which was not re-run here.
- The Base UI date/calendar/table gap comes from its releases page and navigation, not from a search of every package it might document separately.
- Bundle-size numbers for the extension were not measured. A short build measurement of the side panel with RAC subpath imports is a sensible first check when the design-system implementation starts.
- shadcn's React Aria entries appeared only as titles in the changelog excerpt; their content was not read.
- No mention of the predecessor repository was needed or made.

## Sources

- ADR-0002, `docs/dependency-policy.md`, `packages/ui`, `apps/web`, `apps/extension` in this repository
- `jeffnawroth/source-taster-service`, `apps/web` (read through `gh api`)
- npm registry metadata (`npm view`), 2026-11-06
- GitHub releases, commits and source for `adobe/react-spectrum`, `mui/base-ui`, `shadcn-ui/ui`, `radix-ui/primitives`
- <https://react-aria.adobe.com/> and its [v1.22.0 notes](https://react-aria.adobe.com/releases/v1-22-0)
- <https://react-spectrum.adobe.com/releases/index.html>
- <https://base-ui.com/react/overview/releases>
- <https://ui.shadcn.com/docs/changelog>
