# Local cross-browser run — 4 November 2026

Local source investigation on `test/cross-browser-local`, based on `main` at
`0ff6751`. It is **not** hosted CI, **not** browser qualification and **not** a
release claim. No qualification, release-eligibility or maturity status in
docs or code is changed; Firefox, Safari and assistive technology stay "not
qualified". Nothing is pushed. The predecessor is outside this work.

"WebKit" below is **Playwright's WebKit build, which is not Safari**. A pass
there is evidence about the engine's behaviour on this suite, not about Safari
the product (its release train, its extensions, VoiceOver, iOS).

## What the spec asks for

`docs/requirements-specification.md`, section on platforms:

- The web app "must run without installation in the two latest major versions of
  Chrome, Edge, Firefox and Safari; the acceptance tests are run in all browsers
  listed."
- The extension "must work in Chromium-based browsers … and in Firefox, in each
  case in the two latest major versions; for Firefox additionally in the current
  ESR." Safari is not an extension target.
- FA-UEB-04: WCAG 2.2 AA, "automated check, test with keyboard and screen reader".

## Setup

- Web app e2e: `apps/web/playwright.config.ts` (`e2e/`, 91 tests per browser) and
  `apps/web/bibliographic.playwright.config.ts` (`e2e-bibliographic/`, 22). Both
  run under `pnpm test:e2e`. Website a11y/privacy/site e2e:
  `apps/website/playwright.config.ts` (92 tests).
- Extension: `apps/extension` builds `dist/chromium` and `dist/firefox` from one
  Vite config; native Chromium and Firefox suites are separate configs.
- Playwright 1.64.1, Chromium 1248 (revision), WebKit 27.2 (revision 2370),
  Firefox 157.0 (revision 1555). PostgreSQL 18 in a dedicated container.

## Change: opt-in cross-browser projects

`SOURCE_TASTER_E2E_CROSS_BROWSER=true` adds Firefox and WebKit projects. Run:

```sh
pnpm --filter @source-taster/web test:e2e:cross-browser
# website: SOURCE_TASTER_E2E_CROSS_BROWSER=true pnpm --filter @source-taster/website test:e2e
# one engine: ... pnpm exec playwright test --project=webkit
```

CI is **unchanged**. Without the variable `playwright test --list` shows only
`[chromium]` (91 + 22 web, 92 website). CI pins `playwright install --with-deps
chromium` and a 60-minute budget per job. Locally, Chromium plus WebKit took 12.7
minutes for the main suite and 5.6 for the bibliographic suite (Chromium alone
was not timed), and Firefox cannot be shown to pass reliably (below), so none
is added to CI.
`apps/server/test/operations/ci-workflow.test.mjs` passes (10/10).

## Results (local, one run each)

| Suite | Chromium | WebKit (Playwright) | Firefox |
| --- | --- | --- | --- |
| web `e2e/` | 91/91 | 91/91 after the fix below (88 in the first run, the 3 failures re-run after the fix) | not run |
| web `e2e-bibliographic/` | 22/22 | 22/22 | not run |
| website `e2e/` | 92/92 | 92/92 | not run |

Not run on any engine: the other web configs (guest, quota, account, history,
report, rights, sensitive, abuse, dpa) are outside `test:e2e`; the extension
native suites.

**Firefox: not run, blocked in this environment.** Playwright's Firefox 157
(revision 1555) exits immediately with "Could not find profile folder" even with
a profile directory that exists; the previous revision (1497) starts but never
completes the automation handshake (`RenderCompositorSWGL` graphics error). The
first full run therefore failed all 91 Firefox tests in under a millisecond each,
at browser launch, before any product code ran. Those are not product failures
and are not reported as such. The cause was not isolated; it was observed only
under a sandboxed agent shell, not in a plain terminal. A human should run the
Firefox projects locally before drawing any conclusion.

## Failures and fixes

Three WebKit failures, one cause, **a test-harness limit, not a product bug**:

- `corrections.spec.ts` called `context.grantPermissions(["clipboard-read",
  "clipboard-write"])`; Playwright's WebKit rejects `clipboard-write` as unknown,
  and it cannot read the clipboard back from the page.
- Fix: grant permissions and read the clipboard back only on Chromium. On the
  other engines the specs assert the visible outcome of the same copy gesture
  (the `role="status"` "Copied."/"Kopiert."), which renders only after
  `navigator.clipboard.write`/`writeText` resolves; a rejection shows the
  copy-failed message. The first test previously never asserted the status; it now
  does on every engine. The Chromium path is otherwise unchanged and still reads
  the clipboard content and the `text/html` flavour.
- The product's Promise-valued `ClipboardItem` copy path (written for Safari's
  gesture rules) works on WebKit: the status assertions pass. This does not show
  that real Safari copies the same way.

**No product bug was found**, so there is no product fix. Test-first did not
apply: the harness failure was the failing test, and the spec change is the fix.

## Accessibility (automated, axe)

The repo already uses `@axe-core/playwright` (WCAG 2.0/2.1/2.2 A and AA tags):

- 15 of 21 web `e2e/` specs and 3 of 3 `e2e-bibliographic/` specs run axe on the
  loaded workspace; all pass on Chromium and on WebKit (included in the counts above).
- `apps/website/e2e/accessibility.spec.ts` runs axe on every built page at 320 px
  and 1280 px plus the not-found and search states: all pass on both engines.
- The extension's axe checks live in native Chromium specs only; they were not run
  here and no Firefox equivalent exists.
- axe finds a subset of WCAG failures. It is not keyboard, zoom or screen reader
  testing and not a conformance claim.

## Extension in Firefox

`pnpm --filter @source-taster/extension build` already emits
`dist/firefox` (MV3, `background.scripts`, `sidebar_action`, gecko id,
`strict_min_version` 128.0, `host_permissions` without a port). A one-off
`web-ext@10.8.0 lint -s apps/extension/dist/firefox` reports **0 errors, 4
warnings**:

- `MISSING_DATA_COLLECTION_PERMISSIONS`: the manifest has no
  `data_collection_permissions` declaration. Declaring which data categories the
  extension transmits (reference text goes to the Check API) is a privacy
  decision, so it is **not** changed here. Needed before any Firefox store
  submission.
- `UNSAFE_VAR_ASSIGNMENT` ×2 (`innerHTML`) and `DANGEROUS_EVAL`: all in the bundled
  library code. `innerHTML` is React DOM internals and an aria-live clear;
  `Function("")` is a Zod JIT feature test inside try/catch, so it degrades safely
  under the `script-src 'self'` policy. Only the built bundle was inspected, not
  the product source for other dynamic-HTML paths.

`web-ext` and its linter are **not added** as a dependency: both are MPL-2.0, and
`docs/dependency-policy.md` limits MPL tooling to explicitly named development
packages, so adding one is a policy change. Nothing was added to
`package.json` or the lockfile. Loading the package into a real Firefox is covered
by the existing `test:native-firefox` (it drives the installed Firefox Developer
Edition over WebDriver BiDi with native input). It was **not run** here.

## Needs a human

- Run the Firefox projects (`test:e2e:cross-browser --project=firefox`) in a plain
  terminal and triage the result.
- Real Safari (current and previous major), including its clipboard behaviour,
  on macOS; iOS Safari is a separate matter.
- Real screen readers and keyboard/zoom review (VoiceOver, NVDA, JAWS, Orca, TalkBack),
  as FA-UEB-04 requires. None was exercised.
- Extension on real Firefox ESR and the two latest majors (`test:native-firefox`),
  plus Edge, Brave and Opera; and the `data_collection_permissions` decision.
- Any qualification or release decision.
