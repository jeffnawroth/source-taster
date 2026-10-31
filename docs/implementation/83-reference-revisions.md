# Issue #83 — field revisions and single-Reference Re-checks

Implements FA-STR-10/11/12 under ADR-0005 and ADR-0016. The confirmed seams from #70 are HTTP/SSE with real disposable PostgreSQL and fixture HTTP adapters, plus Playwright for client behavior. No private data, provider activation, scoring thresholds or qualification gates changed.

## Delivered behavior

- A stable slot retains its immutable original text and original structured snapshot, including source span. Every saved field draft appends a numbered user revision. The first revision and every earlier result remain readable in the v2 snapshot.
- Each immutable result has an ID, generation and field revision. A current running Status supersedes the historical Verdict; saving without a run shows not checked for the new fields. Results retain their original scoring/search configuration.
- `POST /v2/checks/{id}/references/{slot}/revisions` accepts `expectedRevision`, committed CSL `fields`, optional `authorsTruncated`, and `recheck`. Saving and requesting the run are one locked transaction.
- `POST /v2/checks/{id}/references/{slot}/recheck` runs only that slot without inventing a field revision. Queue admission allocates a fresh generation, including cancellation before worker claim. Worker generation/revision/claim fences reject late output.
- `quotaEffect: free-recheck` explicitly marks a slot with an earlier Verdict. A never-billed slot remains `new-work` until its first Verdict; failed/cancelled/not-checked Statuses do not turn it into a free billed slot. Existing durable settlement intents remain the #99 handoff: this ticket creates no balances or fictitious debits.
- `POST /v2/checks/{id}/references` applies a previewed add/remove request with `expectedEventSeq`. Structural editing is rejected while any slot runs. Removal is a tombstone, never slot reuse or a refund. Added References get increasing slot IDs and start as new work. Snapshots and bibliography projection omit removed slots. CSL-JSON, BibTeX and formatted bibliography exports use the current committed fields even when they have not yet been Re-checked; old suggestions are ineligible after an edit.
- Ended Checks stay ended while slots run. Renewal, cancellation, authority invalidation, worker recovery and SSE track active slots independently. Re-check completion never rewrites the original end time/reason. An ended event closes each completed batch of current slot work.
- v2 content access/mutation rejects the fixed temporary deadline with `check-expired` (410). `SOURCE_TASTER_CONTENT_RETENTION_MS` defaults to 24 hours from the original end, or creation for a never-ended Check. Re-checks do not extend it. Retention deletion remains #91's work and consented History remains #104's work.
- Owner/current `check:create` authority guards every mutation and publication; reads/streams retain current `check:read` authority. A stale revision, stale list cursor or disallowed active run returns 409 rather than silently applying a draft.
- The shared web/extension workspace separates teal field corrections and Re-check controls from the amber Reference-list editor. Edits stay local until Save; list membership requires a count/consumption preview. Both clients show original input, field provenance/revisions, historical results and applicable Quota semantics in DE/EN. All Check content remains in memory.

## Integration handoff

The frozen v1 schemas and numeric SSE protocol remain readable. v2 adds snapshot metadata and full slot metadata to Reference events; `removed: true` removes a slot, and a new slot event appends it in input order. Consumers must use `reference.fields` for current committed fields, not the newest historical result's `reference.csl`. `reference.results` is newest-generation first; `reference.revisions` is oldest-revision first. Results can belong to an earlier revision while the current slot is not checked/running. This is especially relevant to concurrent export work #87 and later Manual override/report work.

Transport source and generated JavaScript/declarations/OpenAPI retain the dual-license headers. Migration `20261030010000_reference_revisions` adds removal tombstones and append-only field snapshots and backfills existing structured slots. Queue/settlement identity stays Check + slot + generation; #99 must enforce its once-per-slot journal debit.

## Validation

Actual red/green logs are retained locally under `/tmp/source-taster-70/83-*.log`. The API slices first failed for missing revision/list routes (404), then a non-running requested Re-check, the missing fixed expiry (200 instead of 410), and cancellation of a queued Re-check (500 from reusing the prior result generation). Each was implemented and rerun green. The first browser launch was blocked by missing controlled website build inputs; after the repository's pinned fetch/build, the pre-change UI was replayed to verify the missing Edit fields action fails, then the new UI ran against real HTTP/SSE.

### Codex continuation (30 October 2026)

Resumed in `/Users/jeffnawroth/.t3/worktrees/source-taster/t3-aa3685be` on
`t3/issue-83-implementation`. Merged saved branch `t3/3d99f468` at
`e492f13af421cd79e127c6610ac6a4f82e208535` into the prepared worktree; this was a
fast-forward with no conflicts. The saved branch already includes #87. Merged
`spec/70-launch-integration` again before completion: already up to date at
`e950acbe95917ebae310040c8a0031fb1b8472ad`; ancestry check passed. No worktree
creation, reset, push, PR or issue closure was performed.

The saved unfinished export/expiry regressions passed on resume. One additional
HTTP/download regression exposed formatted bibliography using immutable original
text after Save fields only, rather than the committed revision. The red run
received `My immutable Reference as written (2008), page 12` instead of a
bibliography containing `Edited by the user`. Rendering now reads current
`reference.fields`; the same test passes. Evidence:
`/tmp/source-taster-70/83-codex-red-formatted-revision.log` and
`83-codex-green-formatted-revision.log`.

DE/EN browser coverage now also demonstrates Discard draft, Save fields only,
Not checked with historical evidence, an RTF download of the committed fields,
and a separate same-slot Re-check without another field revision. The native
Chromium side panel exercises separate Save/Re-check controls and membership
preview/application in both languages. Existing web coverage retains atomic
Save and re-check, immutable input, accessible narrow layouts and historical
results; API coverage verifies that a second slot remains unchanged.

Validation used Node 24.14.0, pnpm 12.15.0 and real disposable PostgreSQL on
`:5433`. Database suites ran serially with owned databases/roles; the global API
used port 3301, auxiliary services used 3302 and Vite used 5272. The two new
revision suites now accept `SOURCE_TASTER_TEST_REVISIONS_PORT` for this allocation.
No unrelated process/database was stopped or altered.

| Validation | Result / local evidence |
| --- | --- |
| Frozen install; core/transport builds; Prisma generation | Pass (`83-codex-install.log`, `83-codex-core-build.log`, `83-codex-contract-build.log`, `83-codex-prisma.log`) |
| Saved unfinished export/expiry tests | 11 passed (`83-codex-checkpoint-seams.log`) |
| `vitest run test/reference-revisions.test.ts test/revision-lifecycle.test.ts test/recheck-replay.test.ts test/exports.test.ts test/lifecycle.test.ts test/corrections.test.ts test/sse-compatibility.test.ts` | 29 passed across six suites; lifecycle suite startup failed under shared PostgreSQL connection pressure (`83-codex-api-final.log`) |
| `vitest run test/lifecycle.test.ts` isolated retry | 2 passed (`83-codex-lifecycle-isolated.log`); all 31 tests in the selected seven suites passed across these runs |
| Web Playwright `revisions.spec.ts exports.spec.ts` | 6 passed, DE/EN (`83-codex-web-baseline.log`) |
| Web Playwright `revision-save-only.spec.ts` | 2 passed, DE/EN (`83-codex-web-save-only.log`) |
| Extension Playwright `revisions.spec.ts` | 2 passed in the real Chromium side panel, DE/EN (`83-codex-native-panel.log`) |
| `pnpm typecheck`, `pnpm lint`, `pnpm i18n:check` | Pass, including repository formatting (`83-codex-workspace-typecheck.log`, `83-codex-workspace-lint.log`, `83-codex-i18n-check.log`) |
| `pnpm --filter @source-taster/server build` | Pass (`83-codex-server-build.log`) |
| Controlled website recipe/artifacts and preview build | Prior saved build was copied into this worktree, independently verified with `pnpm pagefind:verify`, then the website was rebuilt through its normal guarded preview script; no gate bypass (`83-codex-controlled-verify.log`, `83-codex-website-build.log`) |
| Generated transport/OpenAPI rebuild | Reproducible, no diff after regeneration; dual-license headers retained |
| Server `release:check` | Refuses uncalibrated rules, exit 78 as expected (`83-codex-release-gate.log`) |
| Website `publication:check` | Refuses missing legal/domain/support/approval inputs as expected (`83-codex-publication-gate.log`) |
| `git diff --check` | Pass |

All evidence names above are relative to `/tmp/source-taster-70/`. Initial test
startup lacked a local core build and was rerun after building it. One early
browser attempt was interrupted and is not counted. No failed infrastructure
attempt is claimed as passing evidence. No broad concurrent database suite or
full qualification run was performed.

For reproducible API runs, set `SOURCE_TASTER_TEST_API_PORT=3301` and set the
selected fixture overrides to 3302: `SOURCE_TASTER_TEST_REVISIONS_PORT`,
`SOURCE_TASTER_TEST_EXPORTS_PORT`, `SOURCE_TASTER_TEST_LIFECYCLE_PORT`,
`SOURCE_TASTER_TEST_CONCURRENT_PORT`, `SOURCE_TASTER_TEST_CORRECTIONS_PORT`.
Run the listed Vitest command via `pnpm --filter @source-taster/server exec`.
For each browser suite, use `SOURCE_TASTER_E2E_API_PORT=3301` and
`SOURCE_TASTER_E2E_WEB_PORT=5272`, via the corresponding web/extension package's
`exec playwright test` command. Do not overlap API and browser database runs.

### Integration caveats

- #99 must consume the existing durable settlement intents and enforce its
  once-per-Check/slot journal debit. `free-recheck` is a published API classification,
  not evidence of an implemented Quota balance. A never-billed slot stays new work.
- #84 must attach overrides to immutable result IDs, display them with the original
  system Verdict and reset their effective layer on Re-check. Older result IDs,
  field revisions and Scoring rules versions remain available for that work.
- #91 owns actual temporary-content deletion/queue cleanup; this ticket rejects
  expired v2 reads, streams, mutations, formatting and downloads. #104 must add
  consented History policy before using the new workflow on retained History.
  Re-checks/additions must continue to preserve the original fixed deadline.
- Consumers of v2 SSE must handle full current slot metadata, removed-slot events,
  additions and multiple ended events on the same Check. The watcher must replay
  through the stream's current snapshot cursor before treating an old ended event
  as final. The frozen previous v1 client remains covered by the compatibility test.
- Migration and transport artifacts are committed. No dependencies or committed
  contract pins changed; selected-release legal/dependency and provider gates remain
  open under their existing qualification tickets. No production configuration was
  released or activated.

## Limits retained

Quota journal enforcement belongs to #99. Temporary-content deletion belongs to #91 and consented History to #104; this ticket enforces the current temporary expiry for the new workflow. Manual overrides belong to #84. Native Firefox/ESR, Safari, Q01/Q02 accessibility qualification, real provider permissions and Quality gates remain outstanding; automated Chromium/axe checks do not claim those gates passed. No release configuration is activated.
