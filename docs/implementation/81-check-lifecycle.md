# #81 Check lifecycle handoff

Implementation branch: `t3/check-lifecycle`, worktree
`/Users/jeffnawroth/.t3/worktrees/source-taster/t3-bdb5e06e`.
The clean starting commit was integration `spec/70-doi-and-guests` at
`8b156fa8b618fac94aea5a52feccbc458099000f`, containing #74 `fa4a77a`.
This implements #81 under the explicitly invoked implement-spec workflow and
TDD skill, using the already approved real-PostgreSQL HTTP/SSE and browser seams.
Parent owns integration and final Standards/Spec review. No PR or issue mutation,
private repository, predecessor, calibration dataset or adjacent feature was used.

## Behavior and boundaries

The existing pg-boss Reference deliveries wake a durable PostgreSQL dispatcher;
their payload IDs are scheduling hints, never execution authority. Admission takes
one shared scheduler lock, chooses the eligible Check with the oldest dispatch
turn, and claims its next stable slot. The turn is durable across processes.
A Check has at most ten claimed References, including References waiting for
source permits. Each process has twenty bounded consumers so another Check can
make progress while ten References of one Check wait. This does not establish
fifty-Check throughput or live supplier capacity.

The integrated #74 DOI/core/composition path is used. Sequential Data source
progression within each Reference, shared PG pacing, public Crossref limits
(one concurrent request, five singleton requests/s, one search/s), and common
Retry-After cooldown remain in force. Concurrent initialization now uses native
PostgreSQL conflict handling: the old empty-update ORM upsert could race and
produce an internal failure on first simultaneous provider use. Requests and
budget waits check aborts; source dispatch offers a current-authority composition
hook for #96. A source response arriving after its deadline cannot become positive
or negative DOI evidence. It produces incomplete evidence instead.

Every immutable Verdict records `/lifecycle-1` in the Search strategy version and
records admission, claim, lease and retry settings beside #74's source/rules
configuration. The uncalibrated scoring profile and all existing evidence remain
unchanged. Original input is immutable. Field revision 1 and an attempt generation
are persisted with each new result; correction/Re-check UI is separate scope.

Three clocks have separate effects:

- The whole-Check **client lease** initially lasts 75 seconds, configurable through
  `SOURCE_TASTER_CLIENT_LEASE_MS`. Create and a fresh authorized stream attachment
  establish/renew it once. The contract advertises `leaseRenewAfterMs` (one third
  of the duration); the active client explicitly acknowledges through
  `POST /v1/checks/{id}/lease`. Server heartbeats/output alone cannot renew it.
  Any other authorized live workspace can continue acknowledging the shared lease.
  Disconnect is not cancellation. Expiry cancels all unfinished slots together.
- The **worker execution claim** initially lasts 45 seconds, configurable through
  `SOURCE_TASTER_WORKER_CLAIM_MS` with a 31-second minimum. Expired claims fence
  their old generation and recover, bounded to three attempts. Exhaustion is
  internal Status failed, never a Verdict. Queue redelivery is not a client lease.
- The **source deadline** remains 30 seconds from first execution, including the
  development scheduling delay. Recovery retains that first start time. Source
  waits/timeouts/deadlines produce incomplete evidence/Not verifiable rather than
  internal failure or Check cancellation.

Workers sweep independently of Reference handlers; the web process also sweeps.
Abort probes save I/O. Correctness comes from the Check transaction lock plus
matching live generation/revision, unexpired claim, unexpired client lease and
eligible Check/slot at publication. A duplicate, superseded worker or late result
cannot append another outcome or overwrite finished evidence.

`POST /v1/checks/{id}/cancel` is idempotent and Owner-scoped, with a distinct
`check:cancel` permission. Renewal uses `check:renew`; reads retain `check:read`.
Cancellation/expiry serialize with result publication, retain committed Verdicts
and other terminal outcomes, append cancelled Statuses for unfinished slots, and
record an immutable end time/reason. An ended Check cannot be revived by a stale
renewal. Every terminal slot transition also commits an idempotent, content-free
settlement intent (`verdict` or `release`) in the same database transaction.
**#99 must implement the real reservation/journal/reconciliation consumer.**
These intents are neither fabricated debits nor balances; Status is free.

Snapshots take the same Check lock across the parent/slot/result reads. They
return a consistent `lastEventSeq` and Check-bound `lastEventCursor`. Clients opt into Check-bound SSE IDs with `{checkId}:{seq}` as Last-Event-ID
(`{checkId}:0` starts full replay). Numeric Last-Event-ID and numeric output IDs
remain compatible with existing `/v1` consumers; absent cursors use numeric IDs. Malformed, future and foreign cursors are rejected. Durable replay
is paged at 100 events, ordered, subscribe-before-query, and drains through the
terminal sequence before closing. Clients validate Check identity, cursor and
contiguous sequences and ignore already applied frames. Generated JS,
declarations and OpenAPI accompany the dual-licensed transport/client changes.
The review correction restores additive-only `/v1` compatibility (ADR-0003).
Numeric cursors remain scoped to the currently authorized Check in the URL;
new clients use bound cursors to detect accidental cross-Check reuse.

The DE/EN workspace keeps stable slot order, source/queued/checking progress,
terminal Status versus Verdict, and overall completed/total progress. A polite
summary announces completion without replaying all evidence on every source
frame. Cancel preserves results; Reset clears input, previews, results and errors
with one action and returns focus to the input. Reset requests cancellation and
never deletes retained Check content/History. Workspace generations fence async
create, Structuring, stream, renewal and cancellation responses. A late create is
cancelled instead of resurrecting the workspace. Unconfirmed cancellation reports
uncertainty and stops this workspace's renewal; another workspace can still keep
the Check alive. Check content stays in memory, outside browser persistence.

Hosted configuration still refuses startup. Worker dispatch/source/commit hooks
prepare #96 without implementing JWTs, Guest identity, online hosted authority or
private service policy. No auth, extension, quota, comparison, full-search or
History feature is claimed. Existing retention-policy implementation belongs to
its separate scope; the end timestamp added here is its lifecycle seam.

## Validation

Environment: macOS arm64, Node 24.14.0, pnpm 12.15.0, PostgreSQL 18 on 5433,
Chromium. Services owned unique disposable databases/roles. Task HTTP/browser
ports were 54180–54186 (plus existing independently owned regression ports and
OS-assigned fixture ports). Ports 8000/4567 and unrelated containers/files were
untouched. Clock control is test-only IPC into real web/worker processes; no test
queries application tables or queue state or asserts internal calls/logs.
Provider pacing uses PostgreSQL wall time; its edge observations use bounded real
waits. Client leases, claims and source deadline transitions use controlled clocks.

Commands were run from this worktree root; `.tmp/*.log` holds local run output.

| Command | Result |
| --- | --- |
| `pnpm --filter @source-taster/server generate` | Passed; migration and generated Prisma client |
| `SOURCE_TASTER_TEST_API_PORT=54180 SOURCE_TASTER_TEST_WEBSITE_PORT=54186 pnpm --filter @source-taster/server exec vitest run` | 80 passed across eight files |
| `SOURCE_TASTER_TEST_API_PORT=54180 pnpm --filter @source-taster/server exec vitest run test/lifecycle-recovery.test.ts -t 'configured maximum'` | Passed; 1,000-slot create/cancel/repeated cancel against real PG |
| `SOURCE_TASTER_E2E_API_PORT=54183 SOURCE_TASTER_E2E_WEB_PORT=54184 pnpm --filter @source-taster/web exec playwright test` | 22 passed, including six lifecycle cases and DE/EN axe |
| `SOURCE_TASTER_WEBSITE_E2E_PORT=54185 pnpm --filter @source-taster/website exec playwright test` | 92 passed, including DE/EN axe, local search, source/notices and publication refusal |
| `pnpm pagefind:fetch && pnpm pagefind:build && pnpm pagefind:verify` | Passed; checksum-verified #74 cache reused only as an optimization, source/tools revalidated and rebuilt in this worktree |
| `pnpm build`, then `pnpm typecheck`, then `pnpm lint`, then `pnpm i18n:check` | All passed; 127 DE/EN app messages and complete website catalogs; sequential controlled website/source-delivery pipeline |
| `pnpm audit:licenses` | Passed: 526 installed licenses, 68 runtime packages |
| `pnpm --filter @source-taster/contract-verification build` plus SHA-256 comparison of every dist file and OpenAPI before/after | Identical rebuild; current generated JS/declarations/OpenAPI |
| `pnpm --filter @source-taster/server build:release` | Expected refusal; guard exit 78 because the profile is uncalibrated |
| `git diff --check` and handoff Prettier check | Passed |

Public evidence covers held simultaneous resolver requests and out-of-order
completion; stable positions; repeated cancel preserving a committed Verdict;
late output rejection; Owner/permission boundaries; disconnect/reconnect and a
second live attachment; expiry without client acknowledgements; SIGKILL recovery;
SIGSTOP/supersession/late-worker fencing; bounded crash exhaustion; two-worker
admission cap and another eligible Check progressing; Crossref shared permits and
cooldown; incomplete source evidence versus internal failed Status; source
responses after deadline; snapshot/cancel races and replay across pages; invalid,
future and actual foreign cursors; DE/EN keyboard/axe; Reset during delayed create
and Structuring; late old stream frames; unconfirmed Cancel; server evidence
remaining after Reset; and the earlier DOI, Preferences and website regressions.
The short 1.5-second browser-test lease with 3-second worker execution exercises
real periodic client acknowledgement, not just the initial attachment.

Red evidence included non-overlapping adapter requests, missing cancel route,
late negative DOI evidence becoming DOI conflict, server output perpetuating a
paused client's lease, missing Reset on the baseline client, and failed Cancel
continuing lease renewal. Each corresponding behavior now passes. A browser
fixture initially supplied a DOI-only continuation line; replacing it with a full
second Reference corrected the fixture without changing Structuring. Early runs
without the required website artifact failed. A direct website build also collided
with an implicit dependent build launched by root typecheck; the dependent build
completed successfully, and all final Turbo/build commands were then sequenced.
These failures are not counted as passing evidence.

## Limits and parent handoff

This is development behavior and regression evidence, **not release, activation,
security, legal, supplier, performance or WCAG/native-browser qualification**.
No calibration, fake measurement, held-out dataset or production escape hatch was
added. #94's exact-configuration Quality gate and the live/replay load obligations
remain open. Automated Chromium/axe does not replace human accessibility review,
Safari/native extension acceptance or the fifty-Check capacity exercise. Provider
terms/rights and the qualified dependency exceptions/publication gate persist.
The lockfile, dependency graph, controlled recipe and exception policy are
unchanged; no new advisory qualification is claimed for #81.

The settlement consumer (#99), hosted current-authority implementation (#96),
retention/History policy, extension and remaining search/comparison slices remain
outside this delivery. Parent should review the dispatcher/wakeup design, the new
cursor shape and client acknowledgements at the Standards/Spec stage. The final
response supplies the exact clean commit SHA and integration-merge result.

Final complete runs passed **80 server tests, 22 application browser tests and
92 website tests**. Root build/typecheck/lint/catalog checks passed in sequence;
licenses passed and the transport artifact rebuild was identical. The development
web build retains Vite's existing large-chunk advisory; it is not a build failure
or a performance qualification. No unresolved functional #81 acceptance gap was
identified in these seams; the qualification and adjacent-slice limits above stay
open.

Before committing, the latest local integration tip was still
`8b156fa8b618fac94aea5a52feccbc458099000f`. The required
`git merge --no-edit spec/70-doi-and-guests` reported Already up to date. The final
response records the exact implementation SHA; no integration branch was edited.
