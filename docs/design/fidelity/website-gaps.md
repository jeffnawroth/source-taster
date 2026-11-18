# Website fidelity against the accepted #198 S prototype

Current reconciliation for [#213](https://github.com/jeffnawroth/source-taster/issues/213), 17 November 2026. This replaces the pre-rework gap list at `cdbb3eb`. The current result is **152 selected, 152 completed, 152 passed, zero failures** in the website matrix. This is measured website coverage, not final integrated acceptance under [#216](https://github.com/jeffnawroth/source-taster/issues/216).

## Oracle and preserved evidence

- Original source: [`apps/website/prototype/website/prototype-198.html` at `b6dfa14909b7ec8ed4f8a7057d4bc0ea94f14022`](https://github.com/jeffnawroth/source-taster/blob/b6dfa14909b7ec8ed4f8a7057d4bc0ea94f14022/apps/website/prototype/website/prototype-198.html), variant S, independently selected EN/DE, light/dark and web/360.
- Behavioral requirements: [website specification](../website-and-documentation.md), [voice guide](../voice-and-tone.md), ADR-0020, ADR-0027 and the root glossary.
- Preserved local [results.json](../../../apps/web/test-results/design-fidelity-website/results.json) and [native-size comparison sheet](../../../apps/web/test-results/design-fidelity-website/index.html). These generated artifacts remain local; no asset upload is part of this reconciliation.
- Driver: `apps/web/scripts/design-fidelity.ts`; website probes, asset checks and explicit amendments: `apps/web/scripts/design-fidelity/media.ts`. See [measured gate](measured-gate.md) for the common policy.

The preserved JSON pins the original source commit above and reports tolerances of 1 px geometry, 0.5 px computed lengths, channel difference 16 and changed-pixel ratio 0.01. Every website state passes with matching image dimensions and no masks. The largest changed-pixel ratio is **0.008995549904640814 (0.899555%)**, for `site-search-360-dark-en`. Passing allows the stated residual pixel differences; it does not mean pixel identity.

The JSON deliberately has `complete: false`: this was a selected website run. It cannot close the full public/private, app/report/media and accessibility gate. No browser or server was run for this documentation reconciliation; the measurements are the preserved app-agent evidence.

## Measured matrix

| Family | Dimensions | States |
| --- | --- | ---: |
| Home, documentation index, all five guides (how the check works, structuring, preferences, errors and retry, availability), FAQ, contact, four legal pages, accessibility | 14 pages × EN/DE × light/dark × 1280/360 px | 112 |
| Header search hover and keyboard focus | 2 interactions × the same eight combinations | 16 |
| First FAQ disclosure expanded | Eight combinations | 8 |
| Search dialog open from documentation | Eight combinations | 8 |
| Mobile chapter disclosure expanded | EN/DE × light/dark × 360 px | 4 |
| Mobile navigation expanded | EN/DE × light/dark × 360 px | 4 |
| **Total** | | **152** |

The dialog capture is its initial open state. Real Pagefind loading, results, empty, failure/retry, query privacy, focus trapping/return and Escape dismissal are exercised by the website behavioral suites, particularly `e2e/design.spec.ts`, `e2e/search-resilience.spec.ts` and `e2e/access-settings.spec.ts`; they are not additional states in this visual total. Existing behavioral tests were inspected, not rerun in this docs-only task.

## Current implementation crosswalk

Paths below are relative to `apps/website/`.

| Surface | Current behavior and source |
| --- | --- |
| Header | `src/components/Page.astro`, `src/style.css`: brand mark/name, desktop links, search icon, EN/DE link, theme icon and narrow menu. `aria-current` marks the exact page. |
| Home | `Page.astro`, `ProductExample.astro`, `src/content.ts`: split hero, three numbered guides and limits section. The illustrative card uses the shared `VerdictGlyph` at build time, three synthetic counts and the sample Reference. It no longer renders `ReferenceOutcomeSummary` in the Not checked state. No Check runs and no React runtime ships. |
| Documentation | `Page.astro`, `Chapters.astro`, `src/guide-navigation.ts`: numbered question list, desktop chapters/article/contents, narrow chapter disclosure and pager. All five guide pages are measured. |
| FAQ/simple/legal | `Page.astro`, `src/content.ts`, `src/legal.ts`: four FAQ disclosures, simple-page stacks, and legal draft/version notes. The second FAQ question is present in both languages ([#230 resolution](https://github.com/jeffnawroth/source-taster/issues/230#issuecomment-6961639347)). Exact immutable legal text and version routing remain required. |
| Footer | `Page.astro`: tagline, primary navigation, legal/source/interface-license links and truthful local-preview line. Cancellation appears only with an actual configured origin. |
| Search | `Search.astro`, `src/search.ts`, `src/style.css`: local Pagefind dialog, icon close control, initial prompt and actual loading/results/error/retry behavior. No visible Esc key hint is required by the pinned dialog. |
| No JavaScript | Navigation, language links, FAQ/chapter/mobile disclosures and content remain native links or details. Search/theme controls remain hidden; documentation provides a noscript explanation. |
| Appearance/privacy | `src/theme.ts`: page-local theme choice, initial system theme and no website preference storage. The owner’s persistent appearance amendment applies to the app/extension; the preferences guide explicitly distinguishes page-local website settings. |

## Explicit content and product amendments

The source renderer, component geometry and visual rules remain the oracle. `normalizeWebsiteFixture` records changed source fields with `path`, `reason`, `before` and `after` in each result. These are explicit amendments to the source fixture, not authority to silently redefine the visual specification:

| Amendment | Scope and evidence |
| --- | --- |
| Voice/glossary | English sentence case and German Befund wording in titles, questions, chapters, sample labels and guide copy. Source elements/styles remain intact. |
| Truthful preview and example copy | Current development/qualification wording and “Illustrative example · not a live check” / “Beispielansicht · keine laufende Prüfung”. No launched checking-service claim is introduced. |
| Owner’s 17 November preferences amendment | Preferences guide summary/paragraphs and index summary describe language, citation style and appearance, Account/Guest lifecycle, styled suggestions/PDF/RTF and page-local website settings. The harness logs this separately as an owner amendment; it is not a data-only cosmetic normalization. |
| Legal/source destinations | Footer links reflect required interface notices and the actually configured cancellation endpoint. The preserved run omits cancellation because its built footer has no configured endpoint; no loopback endpoint is invented to force a match. Immutable-version links remain real links. |
| Review-only app destination | The prototype’s mobile `app-demo` link is removed from the comparison with an explicit `navigation.review-only` record. No public route or “Open app design” link is promised by the website specification. |

The harness also removes external review chrome and the source stage’s decorative radius/bottom padding, loads local typefaces and composites the transparent review host with the source website background. Each website state preserves an unaligned `.source.png` before content amendments, then `.prototype.png`, `.built.png` and `.diff.png`. The unaligned capture still excludes review chrome. No website state masks text or changes source component CSS to fit the product.

Native `<details>` mobile navigation and accessible language-link names (`DE Deutsch` / `EN English`) are semantic implementation choices. They are not missing visual features. The source’s icon close control, footer preview placement and exact-page current navigation are implemented, so they are not remaining intentional differences. Residual color differences are bounded by the measured pixel policy, not accepted through an unmeasured blanket exception.

## Search backdrop: two accepted source treatments (#231)

There is no shared-token error here. The two original accepted artifacts specify different treatments:

| Accepted source | Exact source treatment | Current implementation |
| --- | --- | --- |
| [#194 D at `f6db1f512255bd404428212ade37abf5ea26f4a3`](https://github.com/jeffnawroth/source-taster/blob/f6db1f512255bd404428212ade37abf5ea26f4a3/apps/web/prototype/structure/prototype-194.html) | `--st-scrim: oklch(0.3 0.05 265 / 0.2)` in light; `oklch(0.05 0.01 265 / 0.55)` in dark; `.v-D .scrim` uses `var(--st-scrim)` | Shared `packages/design-tokens/theme.css` retains those theme-specific values. |
| Original #198 S at the pin above | `dialog::backdrop{background:rgb(8 11 18/.48)}` with no theme override | `src/style.css`: `dialog[data-search]::backdrop { background: rgb(8 11 18 / 0.48); }`, exact in both themes. |

The earlier proposal to change shared scrim confused these source treatments. [#231 is resolved by this distinction](https://github.com/jeffnawroth/source-taster/issues/231#issuecomment-6961643543). The website no longer uses the old neutral-token mix; neither the shared scrim nor the currently passing website styles needs alteration.

## Remaining scope and gates

No measured website mismatch remains in the 152-state matrix. The stale German guide-question expectation in `apps/website/e2e/design.spec.ts` has been corrected to the accepted “Was bedeuten die Befunde?”. Its behavioral browser rerun is still pending before #213 closes; the source change alone is not a passing result. It is [tracked under #213](https://github.com/jeffnawroth/source-taster/issues/213#issuecomment-6961644576). Source-access/download landings, cancellation handoff, immutable legal-version routes, 404/redirect behavior, actual search-result/error transitions, all FAQ answers expanded, native-browser zoom and assistive-technology use are not all represented by this visual matrix. Existing behavioral/source/license/publication checks remain necessary; the historical implementation evidence is in [213-website.md](../../implementation/213-website.md). The configured cancellation footer still needs qualification in its actual publication environment.

[#216](https://github.com/jeffnawroth/source-taster/issues/216) remains open for the root agent’s final integrated gate, including rendered contrast, 320px reflow/200% zoom, forced colors/reduced settings, keyboard/announcements, app/private/media coverage and reproducible source/version evidence. Human translation/legal/brand/native/accessibility and release qualifications remain separate. No assets are uploaded and no release approval follows from this website pass.
