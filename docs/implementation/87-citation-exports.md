# Citation exports (#87)

Implements #87 for #70, following ADR-0005, ADR-0011, ADR-0016 and the #86
handoff. Prepared branch: `t3/issue-87-export-controls`; worktree:
`/Users/jeffnawroth/.t3/worktrees/source-taster/t3-dc036305`.
Initial integration tip/ancestor: `b3c086356ec93875be457d51041a340b63dc790a`.

## Behavior and boundaries

`POST /v2/checks/{checkId}/export` downloads CSL-JSON or traditional UTF-8
BibTeX. Both web and extension use the same DE/EN workspace controls and typed
transport client. Format, citation style and the selected corrections are shown
before download. Original mode means current committed canonical fields,
including saved user edits; selected-corrections mode replaces only explicitly
selected eligible suggestions. Drafts are never used. Citation style formats the
suggestion preview; the machine-readable formats retain bibliographic fields.

CSL-JSON retains the immutable original input in `custom.originalText`, ordered
names, identifiers, article numbers and date precision (ISO dates become standard
date-parts; other dates retain their literal). BibTeX regenerates only supported
canonical fields, preserves imported citation keys from the unchanged original
record, keeps corporate authors/name particles and escapes TeX special characters
without transliterating Unicode. Generated keys are stable and collision checked.
Traditional `school` and `institution` fields retain thesis/report publishers.
Unsupported imported fields are not written back with potentially stale values;
they remain retrievable in the original input, including CSL-JSON provenance.

`ReferenceExporter` is an owned server port with two adapters. RIS is only a future
adapter seam: no RIS implementation, route value, package or UI option was added.
No new dependency, transport license exception or source/scoring setting exists.

## Evidence and authority

Exports are read-only projections: no field revision, original text, result,
Manual override, verification request, reservation or debit is written. Existing
lease-expiry behavior on an authorized read is unchanged. The authorized store
snapshot includes committed fields even for running/cancelled/failed slots;
removed-status slots are omitted. Suggestions require the identity-established
Candidate from #86, with its existing valid-cited-page rule. A completed result
must match the slot's current generation and revision.

Bibliography previews return an opaque SHA-256 token bound to the immutable
result ID and its evidence. Export choices require that token. A different result
(including an identical later run), stale token, unknown slot, duplicate selection
or ineligible suggestion cannot silently apply. Client selections remain in memory
and are compared with the current outcome and token; no Check content or choices
enter local/extension storage. Reset/unmount aborts pending citation downloads.

Downloads use the existing current `check:read` authority and Owner-scoped store
read. Authority is checked before headers and again under the durable Owner guard
while writing the body. Responses are attachments with `no-store` and `nosniff`;
there is no server export file/cache or sharing URL. The typed client forwards
current credentials and client identity and supports request abortion.

The small lifecycle overlap is `ownerSnapshot`/`exportSnapshot` in `checks/store.ts`:
all ordinary read/cancel/renew operations still delegate through the same path.
When integrating #83 retention/History restrictions, keep those restrictions in
this shared authorized snapshot path so downloads inherit them. Field-revision
and membership implementations must continue to expose the current `structured`
projection and removed membership here; export never selects fields from a
historical Verdict as the original/current Reference. No schema migration is added.

## TDD evidence

Tests use the seams already confirmed in #70; no internal mocks or database
assertions were introduced. Disposable PostgreSQL, real web/worker processes,
recorded Data source fixtures and the actual private-service authority exercise
HTTP, SSE and download behavior. Browser checks exercise the actual shared UI.

Observed red/green slices:

- CSL-JSON download: expected 200, received 404 before endpoint implementation;
  passed after the authorized snapshot and CSL adapter were added.
- Selected corrections: missing result token failed before result binding;
  corrected export, retained page 12, original export and stale/foreign selection
  rejection passed afterward. The recorded Source has January 2009 precision;
  an initial year-only expected value was corrected to that fixture's full date.
- BibTeX: expected 200, received 500 with no adapter; UTF-8, TeX escaping, citation
  key, corporate author and canonical-field assertions passed after implementation.
- Workspace: the English browser case reached its suggestion, then timed out on
  the absent Export References controls; both DE/EN cases passed after controls.
- Thesis/report metadata: `school = {Test University}` was absent (publisher was
  used); passed after mapping to traditional school/institution fields.
- Unknown CSL type `constructor`: public HTTP returned an inherited JavaScript
  constructor as the entry type instead of misc; corrected with own-key lookup.

## Validation and limits

Final command results and integration check are recorded below before handoff.

Native Zotero reimport and private export-fixture qualification, native Safari and
Firefox/ESR acceptance, the full 50-Reference release parity set, human translation
review, security/accessibility qualification and Quality gates remain the #70
qualification work. The tests use public/synthetic witnesses and make no release,
measured-quality or native Zotero-acceptance claim. Other open launch tickets are
not represented as completed by this change.

The root Turbo typecheck wrapper also forces a static-site build, which fails in
this prepared worktree because `.tmp/pagefind/fetched.json` is absent. Every
workspace's direct typecheck runs separately. Browser tests reuse a copy of the
unchanged integration checkout's `apps/website/dist-preview` artifact; no website
publication/build gate was relaxed or fabricated. The initial browser setup failed
on the absent artifact before that copy. An early browser rerun overlapped a Turbo
contract rebuild and lost a generated import temporarily; its clean rerun passed.

Final validation (2026-10-30):

- `SOURCE_TASTER_TEST_API_PORT=3186 SOURCE_TASTER_TEST_EXPORTS_PORT=3187 pnpm --filter @source-taster/server exec vitest run test/exports.test.ts test/lifecycle.test.ts`: **8 passed** (6 export, 2 lifecycle), 8.41 s.
- `SOURCE_TASTER_TEST_API_PORT=3186 pnpm --filter @source-taster/server exec vitest run test/exports.test.ts test/corrections.test.ts`: **14 passed** at the earlier three-export-case stage, including all **11 correction** regressions. The expanded export suite passed in the final command above.
- `SOURCE_TASTER_SERVICE_WORKTREE=/Users/jeffnawroth/Developer/Repositories/source-taster-service pnpm --filter @source-taster/server exec vitest run --config guest.vitest.config.ts -t 'citation downloads'`: **2 passed**, 31 unrelated cases skipped. Checks missing identity (401), foreign Owner (404), allowed content (200), revocation before headers (403), and revoked publication after headers (body aborted with no Reference content).
- `SOURCE_TASTER_E2E_API_PORT=3188 SOURCE_TASTER_E2E_WEB_PORT=5187 pnpm --filter @source-taster/web exec playwright test e2e/exports.spec.ts e2e/corrections.spec.ts`: **5 passed**, 31.5 s. Both formats/modes in DE/EN, immutable provenance, existing rich bibliography behavior and axe checks.
- `SOURCE_TASTER_E2E_API_PORT=3189 SOURCE_TASTER_E2E_WEB_PORT=5189 pnpm --filter @source-taster/extension exec playwright test -g 'native panel renders a Correction|native panel downloads'`: **2 passed**, 15.8 s. Real Chromium side-panel downloads were observed through browser download events and read from a test-owned directory; selections/content never appeared in extension storage; axe passed.
- `pnpm -r --if-present run typecheck`: all **11 workspaces passed**. `pnpm exec eslint .`, `pnpm exec prettier --check .`, `pnpm -r --if-present run i18n:check` (221 DE/EN messages), and `git diff --check` passed.
- Direct `pnpm --filter @source-taster/server build`, web build and extension build all passed, including Chromium and Firefox extension outputs. The contract build regenerated the transport declarations/JavaScript and Version 2 OpenAPI document. New generated transport artifacts are committed alongside their sources.

Broader-run limitation: `SOURCE_TASTER_TEST_API_PORT=3186 pnpm --filter @source-taster/server exec vitest run` was interrupted rather than claimed green. Its existing 61-case bibliographic suite reported four 20-second timeouts (five-slot query allocation, known DOI without index metadata, one-/two-identifier remaining allocation). During this run, a parallel extra fixture startup hit PostgreSQL's connection limit. To contain resource pressure, the broad run and only its known web/worker processes were stopped, and its two remaining owned databases/roles were removed. All four affected cases then passed serially in **27.14 s** with:

`SOURCE_TASTER_TEST_API_PORT=3186 SOURCE_TASTER_TEST_BIBLIOGRAPHIC_PORT=3190 pnpm --filter @source-taster/server exec vitest run test/bibliographic.test.ts -t 'shares five evaluated unique slots|does not call a known existent DOI|allocates the remaining bibliographic slots after [12] '`

There is no claim that this interrupted full-suite run passed. No unrelated process/database was terminated and no shared PostgreSQL setting was changed.

Final integration verification: `git merge --no-edit spec/70-launch-integration`
returned **Already up to date** at `b3c086356ec93875be457d51041a340b63dc790a`;
`git merge-base --is-ancestor spec/70-launch-integration HEAD` passed. No integration
conflict occurred. The prepared branch is committed with a clean worktree; nothing
was pushed, no PR was opened, and no ticket was closed.
