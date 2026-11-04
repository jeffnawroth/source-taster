# Public CI regressions — 4 November 2026

Focused implementation on `t3/fix-public-ci-regressions`, based on published public
`28056f575cb165f7d511c268a5d16036c98b3efd`. This is local source validation, not
hosted CI qualification or the final #70 whole-spec review. No release, Quality,
load, calibration, provider, source approval, rights, Selected or production
activation gate is waived. No private source, dependency, job, issue or PR is
changed; nothing is pushed. The predecessor is outside this investigation.

## Completed hosted evidence

Downloaded completed failed-job logs with `gh run view --log-failed`:

| Run | Head | Observed result |
| --- | --- | --- |
| [41775234932](https://github.com/jeffnawroth/source-taster/actions/runs/41775234932) | `d50b0ac24273515e5f291de58aa29d7856f99475` | 679 passed, four failed: OpenAPI comparison, maximum Check cancellation (500), two report lifecycle polls (`generating`) |
| [41683390600](https://github.com/jeffnawroth/source-taster/actions/runs/41683390600) | `7b2c0644cf37ba00a83d7db11f3bfdb68249a146` | 672 passed, those four failures plus concurrent article-fairness request order `[61, 51]` versus `[51, 61]` |
| [41633238132](https://github.com/jeffnawroth/source-taster/actions/runs/41633238132) | `c74b1a1208d06a155352e3ec5e56be685da59a5a` | 674 passed, maximum cancellation and both report lifecycle failures |

[41798367252](https://github.com/jeffnawroth/source-taster/actions/runs/41798367252)
on `28056f5` was in progress at the initial read. It was not polled or watched.
No hosted pass is claimed. Detailed local logs, advisory JSON and completed-run
metadata are ignored under this checkout's `.tmp/spec-70-orchestration/ci-nov4-*`.

## Feedback loop and ranked diagnosis

Approved seams: real PostgreSQL, HTTP/SSE/download, report generation adapter and
measurement/release commands. Tests do not replace internal stores, write fake
qualified configurations, call real providers or regenerate linked contracts.

The initial focused command was:

```sh
pnpm --filter @source-taster/server exec vitest run \
  test/bibliographic.test.ts test/lifecycle-recovery.test.ts \
  test/report-lifecycle.test.ts \
  -t 'publishes separate OpenAPI|configured maximum Check|serves a report|outlive its Check'
```

After ordinary frozen installation, Prisma generation and core/i18n builds, this
reproduced the exact OpenAPI diff and passed the other three cases. The first
attempt before building core was an environment/setup failure, not product red.

Ranked falsifiable hypotheses, recorded before probing:

1. Runtime documents omit delivery routes registered only after document capture;
   registering their existing schemas before capture should remove the exact diff.
2. Per-slot cancellation exceeds Prisma's five-second transaction deadline with
   slower PostgreSQL; controlled transport latency should reproduce HTTP 500.
3. Valid asynchronous PDF work exceeds the one-second default report poll;
   delaying actual rendering should reproduce `generating` without a report fault.
4. Concurrent HTTP arrival order causes the older fairness assertion failure;
   repetition might reproduce a reversed order while the per-Check cap still holds.

### OpenAPI

The runtime document is captured in `createApp`; hosted delivery is mounted later.
The committed generator already includes its two published `/v1/data-subject`
routes in both majors. Register those same schemas before runtime document
capture. Delivery handlers and hosted-only authorization remain unchanged.
The existing HTTP comparison failed before this change and passed afterwards for
both complete documents. No generated contract/OpenAPI bytes change.

### Maximum-size cancellation

Move the existing maximum-Check assertion into a dedicated real HTTP/SSE test,
retain its 1,000 References and idempotency checks, and add v2 plus a transport-only
PostgreSQL proxy. Provision/create without delay, then delay database responses by
1 ms during cancellation. No SQL, application response or transaction deadline is
mocked. The original loop returns 500 at **5,010 ms**, with temporary allow-listed
Prisma code **P2028**, reproducing transaction expiry twice. This establishes a
local cause for the matching symptom; the hosted job did not capture that error
code, so its exact cause is not retrospectively proven.

A proposed 30-second lifecycle window also expired under this probe and was
rejected. No timeout increase remains. Batch slot updates, immutable result inserts,
settlement intents and ordered event inserts under the existing Check lock and
five-second transaction deadline. Preserve generation increments, result revision/
configuration identities, complete v2 event References, and one final Check event.
PostgreSQL notifications remain wakeups; the durable ordered event log is authority.

The content codec now encrypts `createMany` rows using the same per-field AES-GCM
codec and current transient/History key selection. History lookup caching lasts
only for that batch, never across retention-changing operations. No raw plaintext
bulk insertion bypass is introduced. Existing individual result writes are unchanged.

Measured green cancellation responses with the same proxy: **2,405 ms (v1)** and
**2,178 ms (v2)**. Both tests then consume and verify all 1,000 ordered cancellation
SSE updates and repeat cancellation to verify the immutable snapshot. Timings are
local observations, not load qualification. Temporary diagnostics are removed.

### Report lifecycle

The original tests use `expect.poll`'s **1,000 ms** default, while the neighboring
report suite already observes completion for ten seconds. Introduce an injectable
report-generation adapter at the worker composition boundary. The controlled test
composition waits 1,500 ms and then invokes the real resource-limited PDF generator;
real dispatch/publication checks, storage, HTTP polling and download remain in use.
Both unchanged polls fail specifically at `generating` before changing their window.

Only these two report-completion polls now observe for **10,000 ms**. Both pass with
the deliberately slower real renderer, then verify the 15-minute file expiry or
shorter Check deadline. Production's 120-second rendering limit, memory/output
limits, failure states and retention/authority fences are unchanged. No ready flag,
fake PDF, retry wrapper or skipped test replaces real publication. This reproduces
the timing failure class; no trace proves how long the original hosted render took.

### Older fairness finding

Eight unchanged local executions of the cap test passed. The temporary repetition
was removed. No causal attribution, production change or relaxed assertion is
claimed for the earlier hosted `[61, 51]` ordering failure. It remains unreproduced
and should be revisited if a new hosted run reports it.

## Private advisory (read-only)

Read the committed private `docs/dependency-blocker-110-minimatch.md` and checked
the current registry/advisory once. minimatch latest is now **11.0.4**, but newest
10.x remains **10.2.6**. Current parent declarations remain incompatible with the
advisory's first patched **11.0.1**: ESLint 10.14.0 requires `^10.2.6`, config-array
0.23.5 requires `^10.2.4`, and typescript-estree 8.72.1 requires `^10.2.2`.
[GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249) still marks
`<11.0.1` affected. A new 11.x release does not satisfy those ranges.

No compatible remediation is available within the authorized policy. The private
advisory gate remains blocked. No forced major, waiver, lock churn, Node requirement,
Selected change or Better Auth change is introduced. Private fixtures were not
needed: the existing SOURCE100–102 checkout, overrides, backup bytes and history
were left untouched; no private branch or companion commit is created.

## Validation, ancestry and cleanup

Local environment: Node 24.14.0, pnpm 12.15.0, PostgreSQL 18 in task-labelled
container `source-taster-ci-nov4-f1728cf8`, loopback port 55811. Commands use:

```sh
export DATABASE_ADMIN_URL=postgres://postgres:postgres@127.0.0.1:55811/postgres
export DATABASE_TEST_URL=postgres://verification_test:verification_test@127.0.0.1:55811/source_taster_test
export SOURCE_TASTER_TEST_API_PORT=5801
export SOURCE_TASTER_TEST_LIFECYCLE_PORT=5802
export SOURCE_TASTER_TEST_BIBLIOGRAPHIC_PORT=5803
export SOURCE_TASTER_TEST_RESTORED_PORT=5804
```

These are disposable loopback fixture credentials, not deployed secrets.

| Verification | Result | Log suffix (`ci-nov4-`) |
| --- | --- | --- |
| Maximum cancellation, report lifetime, lifecycle/recovery, revision lifecycle, retention, bibliographic lifecycle, Check events | 35 passed, 8 files | `regressions.log` |
| Quality CLI, quality release, quality gate, load release guards | 47 passed, 4 files | `gates.log` |
| Actual report/PDF/download suite and article fairness | 10 passed, 2 files | `reports-fairness.log` |
| Full v1/v2 OpenAPI HTTP document comparison | 1 passed | `openapi-final.log` |
| Server typecheck/lint/build | Passed | `server-typecheck-final.log`, `server-lint-final.log`, `server-build.log` |
| DE/EN i18n checks | Passed | `i18n-check.log` |

That is **93 distinct passing tests**. The earlier two maximum-size timing cases
and eight temporary fairness repetitions are overlapping observations, not added
to that total. Focused `-t` invocations naturally report unselected cases; no test
is disabled or skipped in the source, and the three complete groups above have
zero skipped tests.

Commands for the complete groups:

```sh
pnpm --filter @source-taster/server exec vitest run \
  test/cancel-maximum.test.ts test/report-lifecycle.test.ts \
  test/lifecycle-recovery.test.ts test/lifecycle.test.ts \
  test/revision-lifecycle.test.ts test/retention.test.ts \
  test/bibliographic-lifecycle.test.ts test/check-events.test.ts
pnpm --filter @source-taster/server exec vitest run \
  test/quality-cli.test.ts test/quality-release.test.ts \
  test/quality-gate.test.ts test/load-release.test.ts
pnpm --filter @source-taster/server exec vitest run \
  test/reports.test.ts test/article-fairness.test.ts
```

The gate group used free owned alternate ports 5805/5806; the report suite also
used its free owned 5101 listener. No shared 5433 service or another task's ports
were changed. Each fixture owns and drops its own database and role.

The initial aggregate typecheck refusal for an unfinished controlled Pagefind build
is a setup boundary, not a bypass or product regression.


Final aggregate `pnpm build`, `pnpm typecheck`, `pnpm lint` and `pnpm i18n:check`
passed. Normal `pnpm pagefind:fetch`, `pnpm pagefind:build` and
`pnpm pagefind:verify` passed on aarch64 Darwin. Direct
`pnpm --filter '@source-taster/contract-*' build` followed by `git diff --exit-code`
reproduced all **78 tracked contract/OpenAPI outputs** without drift. No transport
pin changed. The source-only release command refused with exit **78**, including
missing load, calibration, measurement location and eligible configuration.

The public integration ref and published remote ref still equal the base
`28056f575cb165f7d511c268a5d16036c98b3efd`; it is already an ancestor. There is no
new public integration commit to merge. The private source remains at
`8f5e132bc2146e8aa64a65e20a36c442249bbc15` with only its existing workspace/lock
overrides dirty. No private changes require an integration merge.

Cleanup: the task label `source-taster.task=ci-nov4-f1728cf8` was verified on
container `1d53085a1618891207e36a49b41fbb474b88240c8956f179c4581f954ac41bbe`.
It contained **zero fixture databases and zero fixture roles** before removal with
`docker rm -f -v`. No listeners remained on 55811, 5801–5806 or 5101. No unknown
container, database, listener, source checkout or override backup was removed.
The controlled Pagefind cache and ignored diagnostic logs are retained. No
temporary debug instrumentation or disabled test remains in source.

Remaining boundaries: new hosted validation is the parent publisher's task;
the earlier fairness ordering failure remains unreproduced; the private minimatch
gate is still blocked. Real measured Quality/calibration/frozen-dataset evidence,
scoped load acceptance, provider/EU/zero-retention approval, applicable #138/#140/
#136 source rights and replay evidence, Selected/Better Auth, legal/security,
release and independent #116 deployment qualification remain required. No long
50×100 replay, provider/mail/cloud call, browser qualification, production
activation, issue closure, push, PR, scheduler or five-hour-job change occurred.
The final whole-spec review follows integration separately.

Selected evidence SHA-256 (all paths relative to the ignored log directory):

| Log | SHA-256 |
| --- | --- |
| `ci-nov4-d50-failed.log` | `624dcf749db8320ef4782f6cdb7492fcd0ab9cf9a7b59d772bc54f26db1f16c2` |
| `ci-nov4-7b2-failed.log` | `5ded2b448c35272f9b6a037e12a61075f0da245ca36a1be56df476ac9a1304ff` |
| `ci-nov4-c74-failed.log` | `56b655381a894dc968bd07ed323a16b7604b050342328f516f13ff7094934a13` |
| `ci-nov4-focused-red.log` | `1f6c6943af40badbba74031f05b0f55e681264adeaa84ca6bc2052f05837a550` |
| `ci-nov4-cancel-final-red.log` | `4bc52185bee31b3faa8ce4d4105333cf67b14b79d81ffbf0692eab1f69585f64` |
| `ci-nov4-cancel-measure-green.log` | `fe349aa18a37812ca1856d8c4f0024d66b8f9b61ac66eec7dc3266b2c6f92301` |
| `ci-nov4-report-generating-red.log` | `a2317b450796dafc25e90c2fc230d18a9d5a855becb09ed52067779c2304998f` |
| `ci-nov4-regressions.log` | `6b4905294df4ca1bee7be451f80e049b825c19b1952e797c9dd09cbf58c99ae5` |
| `ci-nov4-gates.log` | `b3c2ded5f4f8a2ef831298832f1c1a9e5fa96508f9007f9f653f85eecbdd4bc0` |
| `ci-nov4-reports-fairness.log` | `9e57b3fdd3a4573afdd550012252e333a9b37c6ee37ca3890ebd15693a027e18` |
| `ci-nov4-openapi-final.log` | `4ee824b0f99152108e176e926b498462bdb7623fd60a268598af9699ef8e01b5` |
| `ci-nov4-build.log` | `2fc4207a237c018773d1c135d94bf5f362a47bbc0ab362cc77af001fc3064422` |
| `ci-nov4-typecheck-final.log` | `f46cefecdc9c86beda1daef0425a066a50ef4d64638dc15bf943fa0d44607c94` |
| `ci-nov4-lint-final.log` | `90019578de4e80df0506fa8e703cbc72cd9771000208a4c22548dec6ad190023` |
| `ci-nov4-contract-reproduction.log` | `359d1101f4db06dc39aba9841108d3d98b1e6d9ff599dec0944b052ca61360d5` |
