# #82 shared Check workspace

## Scope and ancestry

This implements [#82](https://github.com/jeffnawroth/source-taster/issues/82)
under the explicitly invoked implement-spec workflow and TDD skill. The provided
T3 checkout is `/Users/jeffnawroth/.t3/worktrees/source-taster/t3-61e5e397`, branch
`t3/implement-issue-82`. Starting HEAD and integration tip were exactly
`7d1487caf6df45d53aa87d6cbcef0561f850e57c`. The initial worktree was clean and
`git merge-base --is-ancestor 7d1487caf6df45d53aa87d6cbcef0561f850e57c HEAD`
passed before implementation. This includes reviewed #75/#77 and the final
`article-verdict-77-9` corrections documented in
[77-review-corrections.md](77-review-corrections.md).

Work is confined to this checkout. No children, predecessor access, root
integration edits, private-service changes, PR/issue operations, deployment or
publication are included. Parent owns independent Standards/Spec review and
integration. #92 and other #70 tickets are not implemented here.

## Shared workflow and host boundary

`@source-taster/ui/check-workspace` exports the complete AGPL `CheckWorkspace`:
paste, Structuring preview, Preferences controls, Check creation, current snapshot,
SSE/replay, client lease acknowledgement, cancellation, Reset and result navigation.
The former web-only workflow and result/Structuring components now live together
in `packages/ui`; `apps/web/src/main.tsx` only bootstraps host capabilities and
mounts that module. There is no panel-specific workflow, second state model or
second lifecycle implementation.

A host supplies:

- `initial`: validated Preferences plus the removed-style fallback notice;
- `preferenceStorage`: the explicit per-client Preference adapter;
- `transport`: the existing `/v2` client options (`baseUrl`, credential supplier,
  client version and optional fetch capability);
- `siteUrl`: the optional qualified public-information origin.

The web bootstrap selects hosted versus standalone mode and supplies the existing
web Guest identity adapter. A panel can mount the same component unchanged with
its own identity, storage and transport capabilities. Initialize the shared i18n
runtime before mounting, keep the transport capability stable for the mounted
context, import `@source-taster/ui/workspace.css`, and include `packages/ui/src`
in the host's Tailwind sources, as the web host does. A new identity context must
not reuse another principal's mounted Check. Actual extension composition and
native/parity qualification remain #92; this repository has no extension client
at this baseline, and none is invented for #82.

Check content, selected slots, filters, scroll positions and credentials stay in
memory. Only existing validated language/style/theme Preferences and the existing
random Guest ID use host storage. No access token, Check snapshot, input, Candidate
or result is added to local/session storage. The shared UI remains AGPL; the
narrow MIT transport exception is unchanged. The only dependency addition is a
workspace link from UI to the already-used verification contract. No external
package, version or policy is changed. React Hooks lint now covers shared UI too.

## Result behavior

The summary shows recognized Reference count and current completion progress.
All six Verdict counts are buttons with explicit pressed state; they filter the
same input-order list. Running, cancelled, failed and not checked have separate
counts. Summary counts inspect only each slot's current outcome, never Candidates
or earlier results. An empty filter has an explicit explanation.

Streaming updates existing slot-keyed rows without sorting or focusing them.
Selection is a Reference slot, not an outcome or a Candidate. Wide layout shows
list/detail together. Narrow layout replaces the list with detail; Back retains
the filter, restores the list scroll position and page position, and returns
keyboard focus to the selected row. Detail focus changes only after explicit
navigation. Controls, table cells and long input/identifier values wrap at narrow
widths and enlarged text.

Detail begins with the exact server Verdict and localized server-reason
explanations. It retains immutable original input. A semantic table presents each
Reference field beside the recorded Best match field. Server Field scores and
full-agreement flags mark deviations; missing, excluded, unweighted,
not-determinable and resource-limited comparisons keep their separate meanings.
Unknown evidence is neither agreement nor zero. Reference fields remain available
when no Best match exists, with unknown Best match cells and an explicit identity
limitation. No Source or comparison result is manufactured.

The Best match is found **only by the server's `bestMatchId`**. A sufficiently
evidenced representative later in a stable equal-Score display remains selected.
Candidate order is the server's descending internal Score order, including its
stable ties; two-decimal display formatting never ranks Candidates or establishes
identity. All Candidates, scores, field comparisons, Data sources, record IDs,
origins, slots, identifier provenance, search evidence and stored rule versions
remain reachable in the expandable evidence view. Source links are constrained
to recognized DOI HTTPS links or validated OpenAlex record URLs, open a new tab,
and use `noopener noreferrer`. Candidate/input strings render as text. Retraction
remains independent and explicitly names the Best match.

How the check works is a direct keyboard-operable disclosure beside the list in
DE/EN. It says explicitly: a Verdict is not proof of deception; a human decides.
It explains Score, unknown evidence, incomplete verification, Source identity and
independent retraction without presenting the development build as calibrated.

Existing paste, stateless `/v1/structurings`, Preferences, cancellation uncertainty,
Reset generation fences, lease expiry, reconnect/replay and hosted authority are
retained. No Quota display, manual override, export, History, field-edit or new
Re-check UI is invented. The baseline public client does not expose a Re-check
operation; this extraction does not create one or render historical evidence as a
current result. All existing server lifecycle behavior remains under its existing
regression suites. The app uses `/v2` for Checks. All verification algorithms,
parameters, approved author ties, source limits, deadlines, authority fences and
frozen `/v1` transports are unchanged.

## TDD witnesses

The approved seams were actual browser UI against real API/worker/PostgreSQL and
the actual private-peer source-only hosted Guest harness. Only external
provider/time/transport fixtures are used. New assertions observe DOM behavior;
none query application tables, queues, private functions, internal calls or logs.
The synthetic provider fixtures are development witnesses, not calibration data.

One behavior slice was implemented at a time. Local transcripts are under
`.tmp/st82/`:

| Slice | RED | GREEN |
| --- | --- | --- |
| Recognized count, progress, six filters and separate Statuses | `01-summary-red-ready.log`: missing Check summary | `01-summary-green.log`: 1 passed |
| Stable streaming selection and wide/narrow navigation | `02-navigation-red.log`: no selectable Reference rows | `02-navigation-green.log`: 2 passed including summary |
| Side-by-side fields and narrow enlarged-text reflow | `03-comparison-red.log`: missing comparison table, DE/EN | `03-comparison-green-reflow.log`: 2 passed |
| Direct keyboard help with human-decision explanation | `04-help-red.log`: missing help control, DE/EN | `04-help-green.log`: 6 passed including prior slices and axe |
| Reference fields without a Best match | `06-no-best-red.log`: table absent, DE/EN | `06-no-best-green.log`: 2 passed |

The first browser attempt (`01-summary-red.log`) stopped at missing controlled
website preview setup; it is **not** a product RED. The first comparison GREEN
attempt (`03-comparison-green.log`) exposed horizontal overflow at 320 CSS pixels
and 200% text; the subsequent implementation corrected control sizing and reflow.
Initial test labels were aligned with the existing catalog before GREEN. Scoped
lint caught a missing `api` effect dependency and an unused screenshot argument;
both were corrected. No timeout, lease, rate or threshold was relaxed.

Further real-browser regressions cover mixed asynchronous completion order,
unchanged focused rows, selected detail across events, active-filter Back with
nonzero scroll and keyboard restoration, positive filters across all six
Verdicts, safe Source popup behavior, missing fields, server-selected tied Best
match, and three Candidates displayed at the independent expected 100.00%,
64.29% and 21.43%. The tied and ranked DE/EN witnesses first passed together in
`05-candidates.log` (4 cases). Existing evidence tests now target the dedicated
Reference detail and expandable evidence rather than treating the entire list,
summary and detail as one occurrence. Existing assertions are retained.

## Build prerequisites and dependency qualification

Node 24.14.0 / pnpm 12.15.0, macOS arm64. `pnpm install --frozen-lockfile` and
Prisma generation passed. Baseline server/core/web/contract builds and artifact
freshness checks ran before browser work.

The matching #77 controlled Pagefind cache was copied into this checkout and
verified before the first browser slice. A partial-artifact copy lacked
`fetched.json` and was rejected; the complete source/tool cache then verified.
The necessary UI workspace dependency changed the lockfile's receipt-bound hash.
The full build correctly refused the earlier receipt rather than accepting it
across that change (`build-full.log`, `types-full.log`). The controlled recipe,
website content, native sources and versions themselves are unchanged.

The unchanged commands `pnpm pagefind:fetch`, `pnpm pagefind:build`,
`pnpm pagefind:verify` then ran successfully against the **current** lockfile in
this checkout (`pagefind-{fetch,build,verify}-current.log`). `pnpm build` passed
all 11 tasks (`build-full-current.log`), followed by byte-identical committed
transport artifacts (`artifacts-current.log`). This is fresh build evidence,
not a redating or extension of earlier human/legal/source-rights qualifications.

`pnpm audit:licenses` passed: 526 installed packages, 68 runtime packages
(`licenses.log`). The copied OSV-Scanner binary was verified as the qualified
2.7.0 darwin-arm64 SHA-256
`d4926ef8da134332543be276dff157e4c170f99ad91fc48e89448a8816bdf70b`.
After `bash scripts/refresh-advisories.sh`, the exact command
`OSV_SCANNER_BIN=.tmp/st82/tools/osv-scanner pnpm audit:dependencies` passed
(`security.log`): 2,746 occurrences, 687 lock packages, 1,169 expected native and
bundled occurrences, 82 retained findings with existing dispositions, zero
blocking findings and zero license issues. npm database Last-Modified was
28 October 2026 18:33:25 GMT; crates.io was 28 October 2026 09:02:50 GMT.
Legal review remains pending and publication blocked. Current receipts remain
under `.tmp/pagefind/` and `.tmp/audit/`; no approval is inferred from a scanner.

The first broad browser pass (`web-full.log`) retained 42 passing cases and
reported six failures: four default axe checks exposed a visible/accessibility
name mismatch on the new row button, one Cancel assertion matched both list and
detail, and the DOI-conflict provider fixture omitted the required matching
Handle and HTTP 404. Visible button text now supplies its accessible name; the
Cancel test observes the named Reference list, and the external provider fixture
uses a valid nonexistent-Handle response. No server evidence rule was weakened.

Visual QA also found that overflow-only checks permitted single-character columns
under combined 320-pixel reflow and 200% text. `07-readable-reflow-red.log` added
an independent minimum usable cell-width witness and failed in DE/EN. The shared
table now uses a field row-group header over two adjacent Reference/Best match
value columns, preserving semantic relationships while giving values room to
wrap. Narrow outer padding is bounded in CSS pixels. The expanded WCAG tags
include 2.1 A and 2.2 A as well as AA. `07-readable-reflow-green.log` passed all
22 focused DOI/lifecycle/workspace cases. Wide, narrow and enlarged-text images
are retained in the final browser output. A repository-formatting refusal on the
new article test was corrected before the broad retry.

The first full article stage in `web-final.log` passed the 12 existing cases and
the two no-Best-match cases, but its four new Candidate cases also counted the
Original input heading. Their locator is now scoped to the evidence disclosure;
Candidate count, exact order/Score and later tied Best match assertions are all
retained. `09-lint.log` and `09-types.log` cover this test-only correction. The
final article rerun is recorded separately, without rerunning the unchanged
48-case normal stage.

## Runtime execution environment

Owned PostgreSQL 18.6 container `st82-workspace-pg-20261028-61e5` uses loopback
55482. Tests create/drop their own databases and restricted roles. Local test
commands use `DATABASE_ADMIN_URL` and `DATABASE_TEST_URL` pointing only there;
provisioner credentials are not passed to application processes. Normal and
article browser stages run sequentially with
`SOURCE_TASTER_E2E_WEB_PORT=54821 SOURCE_TASTER_E2E_API_PORT=54822`.
Server suites use `SOURCE_TASTER_TEST_API_PORT=54823`; specialized harnesses
retain their owned/OS-assigned test ports. Runtime suites run serially.

Authority/Guest commands additionally select
`SOURCE_TASTER_SERVICE_WORKTREE=/Users/jeffnawroth/Developer/Repositories/source-taster-service`.
The actual peer is read-only at
`cc316900eedde83c5e21f23383d3fa4c940937c9`, with unchanged private contract pin
`bfd3edeb79866e26f7e6057712322031bc692fbc`. Its worktree was clean before use.
Ports 8000/4567, other worktrees, `.claude`, containers and services are untouched.

Final validation, reconciliation and owned-resource cleanup are recorded below. Calibration, production/hosted activation, measured release,
publication, broader live/load, human WCAG/ASVS/legal review and native-browser
qualification remain closed. Automated axe checks establish only their tested
Chromium DE/EN scope; they do not replace those gates.

## Final executed validation

Commands run from this worktree, with the owned environment above. The final
normal browser stage and the corrected article rerun are separate serial runs;
no failed checkpoint is substituted for either passing result.

| Command / check | Result | Transcript in `.tmp/st82/` |
| --- | --- | --- |
| `pnpm typecheck` | 19 tasks passed | `types-final.log` |
| `pnpm lint` | 19 tasks and repository formatting passed | `lint-final.log` |
| `pnpm i18n:check` | 181 paired app messages; unchanged website catalogs | `catalog-final.log` |
| `pnpm build` | 11 tasks passed at the rebuilt-receipt checkpoint | `build-full-current.log` |
| `pnpm --filter @source-taster/web build` | Final UI build passed after reflow corrections | `build-final.log` |
| Rebuilt committed contract JS/declarations/OpenAPI | No artifact differences | `artifacts-final.log` |
| Non-v2 transport inventory against `d1b7aac` | All 70 tracked files byte-identical | `legacy-transport-inventory.json` |
| `pnpm --filter @source-taster/web test:e2e` normal stage | **48 passed** (38 existing + 10 workspace) | `web-final.log` |
| `pnpm --filter @source-taster/web exec playwright test --config bibliographic.playwright.config.ts` | **18 passed** (12 existing + 6 workspace) | `article-final.log` |
| `pnpm --filter @source-taster/server test` | **224 passed / 12 files** | `server-full.log` |
| `pnpm --filter @source-taster/server test:authority` | **31 passed**, actual private peer | `authority-full.log` |
| `pnpm --filter @source-taster/web test:guest` | **5 passed**, source-only actual hosted Guest harness | `guest-full.log` |
| `node apps/server/scripts/release-check.ts` | Expected source-gated refusal, **exit 78** | `release-refusal.log` |

The browser evidence includes full applicable WCAG 2.0/2.1/2.2 A/AA axe tags in
the new accessibility cases, keyboard selection/Back/help, DE/EN, 320-pixel
reflow, 200% text, and wide/narrow comparison images. Normal and article browser
stages, HTTP/SSE, authority and Guest suites are never run concurrently. The
server port overrides were API 54823, limit 54824, website 54825, comparison
54826, DOI 54827 and lifecycle 54828; baseline specialized fixtures also own
54181 and 54777 while running. No service occupied those ports before the run.

The original 80-file transport inventory included the expected v2 changes since
`d1b7aac`; the frozen-scope inventory explicitly excludes v2 filenames and checks
all 70 remaining files. All transport files, including v2, also remain identical
to this task's required `7d1487c` baseline. Core, server implementation,
migrations, controlled website scripts and website content are byte-unchanged
from that baseline.


## Reconciliation, cleanup and handoff

`git fetch origin spec/70-shared-workspace-extension` selected remote integration
`7d1487caf6df45d53aa87d6cbcef0561f850e57c`, identical to the latest local branch.
Both `git merge --no-edit spec/70-shared-workspace-extension` and
`git merge --no-edit FETCH_HEAD` in this implementation branch returned
**Already up to date**. The required base is an ancestor; root integration was
not changed. Fetch/merge transcripts are `fetch-integration.log`,
`merge-local-integration.log` and `merge-remote-integration.log`.

After all suites completed, `docker stop st82-workspace-pg-20261028-61e5` and
`docker rm st82-workspace-pg-20261028-61e5` succeeded. An earlier forced-removal
command was refused by automatic tool review before execution; graceful stop
and removal completed without bypassing that refusal. `resource-cleanup.json`
confirms the owned container is absent and no listeners remain on 55482,
54821–54828, 54181 or 54777. Test-owned processes/databases/roles were closed by
the harnesses. The private peer is still clean at `cc316900...`, its pin is
unchanged, and unrelated resources/ports 8000 and 4567 were not touched. Ignored
build caches and evidence are retained locally for review.

Local owner-only receipts/transcripts are in `.tmp/st82/`, with controlled native
and advisory receipts in `.tmp/pagefind/` and `.tmp/audit/`. The handoff archive
`.tmp/st82-evidence.tar.gz` includes logs, public checksums, cleanup/ancestry
receipts and synthetic comparison images; it excludes provisioning scripts,
credentials, keys and tool binaries. This document and the returned Git HEAD
identify the reviewable implementation. Independent Standards/Spec review and
merger remain the parent's work.

No #82 implementation gap is known at the approved seams. Actual extension reuse
and parity (#92), native supported browsers, broader human accessibility/security
and translation review, live-provider/capacity/load acceptance, calibration,
production/hosted activation, legal approval and publication are **not passed**
by this delivery. Earlier unchanged-website qualification records retain their
original dated scope; this task rebuilt/verified current controlled artifacts and
reran relevant app/public-information access, not the separate 92-case website
browser suite or every pipeline tamper/reproduction control. No quality or
publication gate was opened.
