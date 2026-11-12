# #216 — Integrated visual and accessibility regression evidence

Public implementation on `implement/216-regression-evidence`, built under the
TDD workflow. The tree under test contains `59f4f85`, the #212 review fix
`b588c9c` and the `implement/design-remaining` tip `d472612` (merge commit
`7ba3545`). Sources: ADR-0027, `docs/design/{styleguide,components,tokens}.md`,
`packages/design-tokens` (`validation.json`), and the existing suites listed in
the coverage map. This manifest records what the automated evidence shows and
what it does not. **It makes no claim of WCAG, EN 301 549, BFSG or any other
conformance.** Automated checks find regressions; they do not replace the manual
and native gates in section 6.

## 1. Status

| Item                                       | State                                                                                                |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| Rendered web regression suite              | Delivered, passing on the merged tree (section 3).                                                   |
| Hosted Guest and Account state suite       | Delivered, passing against the real verification API, worker and PostgreSQL.                         |
| Website regression suite                   | Delivered, passing.                                                                                  |
| CI wiring                                  | Delivered: new `web-suites` step; `apps/server/test/operations/ci-workflow.test.mjs` asserts it.     |
| Final-baseline gate (`b588c9c` in history) | Met: `git merge-base --is-ancestor b588c9c HEAD` succeeds on the merged tree.                        |
| **Public/private primitive drift check**   | **OPEN.** Blocked by private styled primitives, `source-taster-service#29`. Nothing here claims it.  |
| Manual and native gates                    | OPEN by design; handed to #217 (section 6).                                                          |

No screenshot baselines are committed. The suites assert on measured pixels,
computed styles, roles, request logs and database rows, so there is nothing to
re-baseline when the visual design legitimately changes within the token gate.

## 2. How the rendered measurements work

The numerical token gate (`pnpm --filter @source-taster/design-tokens check`,
158 gated pairs, tightest 3.26:1) checks resolved colours. It cannot see what a
browser actually paints over glass, a moving backdrop, anti-aliasing or a
fallback. `apps/web/e2e/support/rendered.ts` therefore measures pixels:

1. Screenshot the element as painted.
2. Hide only that element's own paint (`color: transparent` for text,
   `opacity: 0` for shapes and under forced colours, which ignores author
   `color: transparent`) and screenshot it again. This second capture is the
   real backdrop, including blurred content scrolled under a glass surface.
3. Decode both PNGs inside the page (`createImageBitmap`, no `fetch`, so it
   works under the website's strict `connect-src`).
4. Pixels equal to the element's computed colour (tolerance 8) and different
   from the backdrop pixel (more than 2 per channel) are the fully painted
   ones; anti-aliased edges are not claimed. The lowest WCAG ratio of those
   pixels against the backdrop is the result.
5. Thresholds: text at least 4.5:1, non-text (glyphs, focus outline) at least
   3:1.

**Negative controls.** The measurement is only evidence if it can fail. Two
tests deliberately paint `rgb(226 228 234)` text over a light surface (web) or
the website heading and require the measurement to fall below 4.5. A third
control injects the shipped `.st-spinner` and proves the reduced-motion probe
sees it running when motion is allowed.

**Greyscale.** `html { filter: grayscale(1) }` is applied, each of the six
Verdict glyphs is captured against its own backdrop and reduced to a 24x24
mask. Pairwise intersection-over-union must stay below 0.85, so the six
silhouettes remain distinguishable without colour. Visible labels stay neutral
text; the label assertion is the accessible-name and text check in the same
test.

## 3. Coverage map

Every acceptance criterion of #216, the test that carries it, and how to rerun
it. "Existing" suites predate #216 and are cited rather than duplicated.

| Criterion                                                                         | Evidence                                                                                                                                                                                                                                                                                  |
| --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Rendered contrast beyond the numerical gate, opaque and glass, text and non-text  | `apps/web/e2e/regression-rendered.spec.ts`: sticky Summary strip and top bar text and Verdict glyphs over scrolled content, English and German, light and dark, `backdrop-filter` asserted active; reduced-transparency opaque fallback (4); focus outline (2); forced colours (en, de). |
| Greyscale Verdict shape and label distinction                                     | Same spec: six silhouettes, light and dark.                                                                                                                                                                                                                                               |
| German and English                                                                | Every rendered, reflow, forced-colour, announcement and website test runs in both languages.                                                                                                                                                                                              |
| Light and dark                                                                    | Rendered contrast, greyscale and website contrast run in both schemes.                                                                                                                                                                                                                    |
| Wide, 360 px and 320 px reflow                                                    | Reflow matrix in the rendered spec (20 cases: wide 1100, 360, 320, 640x360 and 320x256 viewports x language x scheme; no horizontal overflow, axe clean). Website: existing `accessibility.spec.ts` axe plus `scrollWidth` at 320 and 1280 for every built route.                                          |
| 200% zoom and enlarged text                                                       | Web: reflow matrix at the viewport widths that 200% and 400% produce. Website: `regression.spec.ts`, root font size 200% at 640 and 320 px, asserted computed 32 px, no horizontal scroll, search reachable and inside the viewport.                                                      |
| Keyboard operation and focus return                                               | Web: existing `lifecycle.spec.ts` (Cancel by Enter), `checking-shell.spec.ts`, plus the focus outline contrast test. Website: existing `design.spec.ts` search focus return; `regression.spec.ts` forced-colour Escape returns focus to the trigger.                                         |
| Announcements are bounded                                                         | Rendered spec: live-region log during an 8-Reference check, deduplicated per leaf region: at most six progress announcements, counts only move forward, the finished count (8) is announced, no announcement dumps a whole region; English and German. Existing `packages/ui` Toast contract tests.                                                                                                                        |
| Forced colours                                                                    | Rendered spec (painted text and shapes under `forced-colors: active`, English and German); website focus indicator and dialog edge.                                                                                                                                                       |
| Reduced motion and reduced transparency                                           | Rendered spec: pending spinner becomes a pulse, no `st-spin`, with an animating control; opaque `surface` under reduced transparency. Website: no running animation with `prefers-reduced-motion`.                                                                                        |
| Pending, failure, retry and expiry against the real API; Guest and authenticated  | `apps/web/e2e-regression/states.spec.ts` (section 4).                                                                                                                                                                                                                                     |
| Retained IDs and revisions; no duplicate effects                                  | Same spec: Check ID from request paths, slot identity `check:position:revision` from PostgreSQL, request counts, Quota calls.                                                                                                                                                             |
| No persistent Check content storage                                               | Same spec: `localStorage`, `sessionStorage`, IndexedDB contents, Cache Storage, service workers, cookies and page cookies scanned for the Reference text, DOI and `eyJ` after each state.                                                                                                  |
| Website local search, error and empty states                                      | Existing `design.spec.ts`, `search-resilience.spec.ts`, `accessibility.spec.ts` (failure, loading, empty, found), plus `regression.spec.ts` search contrast in both schemes.                                                                                                              |
| Exact legal routes                                                                | Existing `website.spec.ts` ("every information page has a translated counterpart and versioned legal drafts") and `design.spec.ts` ("exact legal draft").                                                                                                                                  |
| No tracking or external resource activity                                         | Existing `privacy.spec.ts` (static and runtime); `regression.spec.ts` records every request origin through a search journey: only the site origin, no cookie, no storage, no IndexedDB database.                                                                                          |
| Native extension panel                                                            | Existing suites under `apps/extension/e2e*` (panel, Firefox sidebar, consent, selection). Not duplicated; the OS-native parts are manual (section 6).                                                                                                                                      |
| Primitives in three engines                                                       | Existing `packages/ui/test/primitives.spec.ts`.                                                                                                                                                                                                                                           |
| Public/private primitive drift check                                              | **OPEN**, see section 5.                                                                                                                                                                                                                                                                  |

## 4. Hosted Guest and Account state suite

`apps/web/e2e-regression/states.spec.ts`, run by
`apps/web/regression.playwright.config.ts`. It starts the real verification
web process, the worker and PostgreSQL through `startAccountApi`
(`apps/server/test/support/account-api.ts`) and serves the web app in hosted
mode. The private service is only its established HTTP edge: Guest and Account
tokens, authority and Quota answers come from the same fake edge the existing
hosted shell suite uses. This is public-client contract evidence. It is not
proof against the private service and not both-program proof.

`account-api.ts` gained a Guest token signer (`newGuest`, `guestToken`) with
the strict claims the verification API validates (`purpose: guest-access`,
`exp - iat = 300`).

Every state runs twice, once as a Guest and once as an authenticated Account:

- **Completed Check.** Exactly one `POST /v2/checks`, one Quota reserve and one
  settle, one check and one slot row for the Owner; nothing persisted in the
  browser; a reload shows an empty field.
- **Failed start and retry.** The text stays; no check exists and no Quota is
  reserved after the failure; the retry produces one Check with one reserve and
  one settle (two `POST /v2/checks` in total, one Check ID).
- **Pending, then Cancel.** The Check is held genuinely pending by holding the
  client's `bibliography` requests (zero results, not ended). Cancel posts once
  to the same Check ID, the grid shows Cancelled, the slot identity is
  unchanged, the entered text is kept and Quota is settled or released exactly
  once after the worker starts.
- **Lease expiry.** Advancing the API clock past the lease ends the same Check
  in place with the announced "connection was not renewed in time" message and a
  Cancelled Reference. No second Check, no alert, same slot identity, Quota
  settled once.
- **Access-token expiry.** Browser and API clocks are advanced together. The
  expired token is renewed exactly once (Guest: a second Guest token; Account: a
  second account token) and the next Check runs once, with no alert.

Ordering: the worker is started lazily and then stays up. The Cancel test
therefore runs first so that it can prove settlement only begins when a worker
exists.

## 5. Open: public/private primitive drift

The drift check compares the public `@source-taster/ui` primitive layer with the
private styled primitives. The private primitives are tracked by
`source-taster-service#29` and are not available to this public work. Per
`AGENTS.md` the private repository is untouched and private evidence stays
private. The check is not stubbed, mocked or simulated: the acceptance criterion
stays open until #29 lands and the comparison can run against both.

## 6. Manual and native gates for #217

Automated Chromium cannot show these. They stay open and belong to #217.

- Human screen-reader sessions (VoiceOver, NVDA, JAWS, TalkBack): reading
  order, Verdict naming, live-region phrasing and verbosity.
- Native Firefox and Safari/WebKit rendering of the same flows; this suite is
  Chromium only. The existing browser-project switch in `apps/web/browser-projects.ts`
  covers other engines for older suites, which is not the same as these
  assertions.
- Real browser zoom (200% and 400%) and OS text scaling. The suites emulate zoom
  with CSS viewport width and root font size.
- Real forced-colours and contrast modes (Windows contrast themes, macOS
  Increase Contrast) and real reduced-transparency settings. The suites emulate
  them through the DevTools protocol.
- Native extension panel and sidebar in the shipped Chromium, Edge, Firefox and
  Safari builds, and the operating system context menu.
- Email and PDF-specific accessibility (tagged PDF, PDF/UA tooling beyond the
  existing `pdfua` job, mail client rendering).
- Translation review of German and English strings by a speaker.
- Legal review of the notices and the draft legal texts, and the release gate.
- Colour-vision and low-vision judgement by people; the greyscale test shows
  distinguishable shapes, not that they are understood.

## 7. Reproducing the evidence

Run from the repository root on a clean tree. Pick free ports in 8100-8299;
other agents may run Playwright at the same time. The values below are the ones
used for the recorded run.

```sh
pnpm install --frozen-lockfile
pnpm pagefind:fetch && pnpm pagefind:build && pnpm pagefind:verify
pnpm typecheck && pnpm lint && pnpm exec prettier --check .
node --test apps/server/test/operations/ci-workflow.test.mjs
export DATABASE_ADMIN_URL=postgres://postgres:postgres@localhost:5433/postgres
export DATABASE_TEST_URL=postgres://verification_test:fixture@localhost:5433/owned
export SOURCE_TASTER_DOCUMENT_IMAGE="$(cat /tmp/source-taster-design-document-image-id)" # id of the locally built document image, as in docs/implementation/211-checking-shell.md
export SOURCE_TASTER_E2E_WEB_PORT=8140 SOURCE_TASTER_E2E_API_PORT=8141
export SOURCE_TASTER_TEST_API_PORT=8150 SOURCE_TASTER_TEST_SERVICE_PORT=8151
export SOURCE_TASTER_REGRESSION_WEB_PORT=8160 SOURCE_TASTER_WEBSITE_E2E_PORT=8170
(cd apps/web && pnpm exec playwright test)                                     # includes regression-rendered.spec.ts
(cd apps/web && pnpm exec playwright test --config regression.playwright.config.ts)
(cd apps/website && pnpm exec playwright test)                                 # includes regression.spec.ts
```

Do not wrap Playwright in `timeout`: the harness starts child servers and a
killed parent leaves them listening.

Versions of the recorded run: Node 24.14.0, pnpm 12.15.0, Playwright 1.64.1
(Chromium), PostgreSQL on `localhost:5433` (CI uses `postgres:18`), macOS (arm64).
CI runs the same commands on `ubuntu-24.04`: the rendered spec in the `e2e`
job, the hosted suite in `web-suites`, the website suite in `e2e` through
turbo.

## 8. Results of the recorded run

Tree under test: merge `7ba3545` (parent `d283592` and `implement/design-remaining`
tip `d472612`). `git merge-base --is-ancestor b588c9c HEAD` succeeded before
the run. Ports 8140/8141, 8150/8151, 8160 and 8170.

| Check                                                            | Result                      |
| ---------------------------------------------------------------- | --------------------------- |
| `pagefind:fetch`, `pagefind:build`, `pagefind:verify`            | passed                      |
| `pnpm typecheck` (24 packages)                                   | passed                      |
| `pnpm lint` (24 packages)                                        | passed                      |
| `prettier --check .`                                             | passed                      |
| `ci-workflow.test.mjs`                                           | 13 of 13 passed             |
| Web default config (includes `regression-rendered.spec.ts`, 38) | 160 passed, 0 failed (11.9m) |
| Hosted regression config (`states.spec.ts`)                      | 10 passed, 0 failed (33.6s) |
| Website suite (includes `regression.spec.ts`, 15)                | 134 passed, 0 failed (1.0m) |

Not rerun for this manifest: the web `bibliographic` and `report` configs and
the hosted shell suite (they are untouched by #216 and run in CI), and the
extension suites under `apps/extension/e2e*`.

## 9. Limits of this evidence

- Chromium only. Pixel measurements depend on the engine's text rendering and
  were taken on macOS; Linux CI renders glyph edges differently, which is why
  only fully painted pixels are claimed and thresholds sit at the WCAG floors,
  not above them.
- Only fully painted pixels are measured. Thin, heavily anti-aliased strokes
  can contribute few or no pixels; each measured element must yield more than
  five painted pixels or the test fails.
- Glass is measured over the content the tests scroll beneath it, not over every
  possible page.
- Emulated media features and zoom are not the same as the operating system's.
- The hosted suite uses a fake private-service edge and a controlled clock.
- Passing automated tests does not demonstrate accessibility for people. The
  manual gates in section 6 remain.
