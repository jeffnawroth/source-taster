# #110 combined DPA staging — 2 November 2026

This is staging evidence, not root integration or release acceptance. The original
[DPA handoff](110-dpa.md) remains the description of the delivered feature and its
legal/operational limits. GitHub #110/#70 and ADR-0021 were read; neither issue was
changed.

## Sources and ancestry

- Public staging branch: `t3/stage-public-private-110-merges`, in the T3 worktree
  ending `t3-723344f8`.
- Public merge `7bed9e76b173088f88f1b108ea641331ff3eb5cb` preserves both
  `0108a0174d4d5899e2937b9db83bf21e63f45e13` and completed DPA source
  `61107f293e5248ab9299591200f46168b4fcdbf1` as parents.
- Merge `be52efc3d854a8b1737cec0a030edba11c9c6235` includes the latest published
  integration `c0cb0baf99302b759440524b9d0deb47751d43a6`.
- Tested public source: `338419aff5009babb77342eef8a61d527020b142`, including
  stream fix `58a4d3c276d559583356e134fe31f16a833917af` and client tsconfig
  formatting. The final handoff commit changes documentation only.
- Companion private staging branch: `t3/110-dpa-staging-nov2`, in the existing
  prepared SOURCE110 worktree. Tested source merge:
  `a035962d6f73e6944a27fae173c60ea405cf1f65`, preserving completed DPA
  `b8baefad6119dd7bade2ed41424a466d187e67ed` and latest committed private
  integration `63952462cb70bc2c8ce17fdcc464d7c17fd564b1` as parents.

Public source merged without conflicts. Private conflicts were resolved in source:
retain Account language alongside Operator relations, both sets of legal and
Operator models, both delivery/sweep hooks, and both DE/EN catalogs. No generated
file was used as the source of a conflict resolution. Contract/OpenAPI, Prisma
and catalog outputs were regenerated.

## Integration regression fixed test-first

The existing real two-program extension suite exposed a surviving web session's
SSE stream closing when the extension signed out here. Holding a genuine web
authorization reply across that logout's newer Owner fence makes the failure
deterministic: expected `open`, received `ended`.

The stream now retries one complete cycle after a 403, publishing nothing from
the rejected decision. The retry resolves current authority again and repeats
the original Owner, History and publication checks. Persistent denial closes the
stream; expired credentials and transport failures still fail closed. Request,
download and worker guards are unchanged. No resource-ownership assertion or
default gate was removed or bypassed. The signed-out extension stream closes,
while the independently authorized web stream and token renewal continue.

`nov2-dpa-stream-red.log` records the deterministic failure before the fix;
`nov2-dpa-stream-green.log` records 1 passing selected case afterwards. The full
extension suite subsequently passes 4/4, including actual service dump/restore.

## Commands and evidence

Logs are durable, ignored files beneath this worktree's
`.tmp/spec-70-orchestration/nov2-dpa-*`; private logs are beneath the same relative
directory in SOURCE110. The brief requested root logs, but the user's explicit
no-root-writes boundary takes precedence. No root files were written.

Run from this public staging worktree with:

```sh
export SOURCE_TASTER_SERVICE_WORKTREE=/Users/jeffnawroth/Developer/st-worktrees/source-taster-service-110
export DATABASE_ADMIN_URL=postgres://postgres:postgres@127.0.0.1:5461/postgres
export DATABASE_TEST_URL=postgres://verification_test:verification_test@127.0.0.1:5461/source_taster_test
export SOURCE_TASTER_TEST_API_PORT=5601
export SOURCE_TASTER_TEST_SERVICE_PORT=5602
export SOURCE_TASTER_TEST_POSTGRES_CONTAINER=st110-dpa-staging-nov2-pg
export SOURCE_TASTER_DOCUMENT_IMAGE=sha256:a36fa02bdeea666e023b219e6bafa4f020833cd703ca1e1e069623cb7a061707

pnpm --filter @source-taster/server exec vitest run --config dpa.vitest.config.ts
pnpm --filter @source-taster/web exec playwright test --config dpa.playwright.config.ts
pnpm --filter @source-taster/extension exec playwright test --config dpa.playwright.config.ts
pnpm --filter @source-taster/server exec vitest run --config account.vitest.config.ts
pnpm --filter @source-taster/server exec vitest run --config extension.vitest.config.ts
pnpm --filter @source-taster/server exec vitest run --config quota.vitest.config.ts
pnpm --filter @source-taster/server exec vitest run --config history.vitest.config.ts -t 'History is off|worker History entitlement refresh'
SOURCE_TASTER_TEST_LIFECYCLE_PORT=5602 pnpm --filter @source-taster/server test test/lifecycle-recovery.test.ts
```

| Check | Result | Log suffix after `nov2-dpa-` |
| --- | --- | --- |
| Real two-program DPA API / stale authority / retained download | 1/1 | `both-api-final.log` |
| Real two-program web, EN/DE × Free/paid | 4/4 | `web-final.log` |
| Real two-program native Chromium panel, EN/DE × Free/paid | 4/4 | `native-final.log` |
| Real two-program Account | 2/2 | `both-account-final.log` |
| Real two-program extension, streams and real restore | 4/4 | `both-extension-final.log` |
| Real two-program Quota | 8/8 | `both-quota-final.log` |
| Selected public History checks | 2 passed, 18 unselected | `history-focused-final.log` |
| Public lifecycle HTTP/SSE/worker regression | 11/11 | `lifecycle-final.log` |
| Private Operator API regression | 12/12 | private `private-operator.log` |

The DPA suites use real PostgreSQL and both actual programs; email is captured at
the external transport. Native downloads and browser restart are real. The
Account/Quota regression fixtures additionally use existing recorded external
Data source responses. The selected History suite uses its existing simulated
service HTTP adapter and is **not** additional both-program acceptance.

Private focused DPA/Account/extension/Quota evidence is 32/32 across four files.
It includes atomic concurrent operation replay, session/action-bound fresh proof,
wrong Account/session/Origin, immutable packet versions and exact downloaded
bytes through restart, failed receipt retry, notice/objection/review holds, shared
proof budgets and the receipt-language/Account-notice-language distinction.
The private companion handoff contains its commands and further checks.

Source checks run here:

```sh
pnpm install --frozen-lockfile
pnpm --filter @source-taster/contract-internal build
pnpm --filter @source-taster/contract-service build
pnpm --filter @source-taster/contract-verification build
pnpm --filter @source-taster/i18n generate
pnpm --filter @source-taster/server generate
pnpm --filter @source-taster/server typecheck
pnpm --filter @source-taster/ui typecheck
pnpm --filter @source-taster/web typecheck
pnpm --filter @source-taster/extension typecheck
pnpm exec eslint scripts apps/server apps/web apps/extension packages/contract-service packages/contract-internal packages/contract-verification packages/ui packages/i18n/scripts
pnpm exec prettier --check .
pnpm i18n:check
pnpm --filter @source-taster/server build
pnpm --filter @source-taster/extension build
pnpm --filter @source-taster/web build
```

Affected type checks, ESLint, formatting, 525-message DE/EN completeness, server,
web and Chromium/Firefox extension builds pass. Contract regeneration produces
no tracked artifact differences; complete before/after inventories and SHA-256
digests match for all 1,134 contract/OpenAPI/catalog files (`regenerate.log`,
`generated-{before,after}.json`). After the stream change, server typecheck,
ESLint, formatting and build were rerun (`stream-{typecheck,lint,build}.log`).

## Failures and limits retained

- Public aggregate `pnpm typecheck` stops at the website's enforced controlled
  Pagefind build: this fresh staging worktree has no `.tmp/pagefind/fetched.json`.
  See `typecheck.log`. No root build artifacts were copied and no source gate
  was bypassed. Aggregate lint/build were not subsequently claimed to pass;
  the affected-package checks above are the successful evidence.
- The first private focused run passed 31/32; a concurrent contract build removed
  the linked `dist` during one service startup (`ERR_MODULE_NOT_FOUND`). The
  serial rerun passes 32/32. Do not regenerate linked contracts during real tests.
- The first extension regression command omitted the required owned-container
  variable, so restore refused to run. With that variable, restore passes and the
  independent stream failure remained reproducible until fixed.
- The first selected History command omitted `DATABASE_TEST_URL`; both selected
  cases refused setup. The corrected command above passes. No assertion was
  weakened to repair an environment failure.
- The parent's full public run remains **676 passed / 1 failed** historical
  evidence; its later targeted lifecycle run is 11/11. This stage does not turn
  those records into an all-green full-suite or release claim.
- Private CI's `minimatch@10.2.6` advisory **GHSA-g3hv-75wg-m249** remains open,
  with no exception. This stage did not repair or waive it.
- DPA fixture packets are placeholder legal text, not a human-approved packet.
  Qualified legal text, actual supplier activation and queued/running/restored
  work procedures, separate retention/expiry, blocked/deleted legal retrieval,
  contractual return/deletion and release-browser/assistive-technology review
  remain as in ADR-0021 and the source handoffs. No private verification content
  was introduced into public code or service legal evidence.
- The private integration still lacks #101's authoritative Account Preferences
  API. DPA access works; existing synchronization warnings remain. Reconcile the
  minimal language initialization with that future persistence. Receipts retain
  the agreement-language exception; supplier notices use Account language.
- No full website/document corpus, live AI/calibration, legal, security, load,
  Selected dependency or launch qualification is claimed. Default gates and
  all source/quality thresholds remain unchanged.

## Parent integration and pins

All DPA acceptance here uses the private worktree's **uncommitted local contract
links to this staging worktree**. Committed private dependencies/evidence remain
at published `39f1409939cc950f9ce7874183a8d69567024ba9`. That pin already covers
the unchanged transport used by the server-only `c0cb0ba` integration; no repin is
needed merely for that commit.

The new DPA transport requires a later real repin: integrate this public stage
with the other stages, regenerate and publish the chosen public commit, then
update the private server's three public contract dependencies, the private web
contract-service dependency and `scripts/evidence.ts`'s `contractCommit` to that
reachable final SHA. Regenerate the ordinary lockfile without local overrides,
verify normal/frozen installation and installed transport, then rerun the real
two-program DPA/API/web/native and relevant regressions on the integrated pair.
Do not commit a local path or unreachable staging SHA as a published dependency.

Only the instructed public worktree and private SOURCE110 were modified. No
subagents, worktree creation, push, PR/issue mutation, legacy inspection or edits
to another task's resource occurred. The owned PostgreSQL resource and final
cleanup evidence are recorded in the companion private handoff.

## Owned resource cleanup

The stage created PostgreSQL 18 container `st110-dpa-staging-nov2-pg`, ID
`de8e7c999e7a72e64bf70b93041e2774a0cac8c709a6dcc5727afec9fcb596a1`,
with label `source-taster.owner=nov2-dpa-staging-723344f8`, on free loopback
port 5461. API/service tests used 5601/5602; the isolated private Operator suite
used free 5482. The owner label was verified before removing that container.
`nov2-dpa-cleanup.log` confirms removal and no listeners on 5461, 5601, 5602 or
5482. Test-owned browsers/processes were closed by the successful fixtures.
Other tasks' processes, containers, databases and the enabled repetition job
were untouched.
