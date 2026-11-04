# #117: Performance and load harness for the launch targets

Implements [#117](https://github.com/jeffnawroth/source-taster/issues/117), part
of #70, on `t3/public-program-load-harness` in
`/Users/jeffnawroth/.t3/worktrees/source-taster/t3-8ece6347`. Public program
only. No pushes, PRs, ticket mutations, live Data source requests, private
service edits or predecessor access were involved.

Read first: [ADR-0007](../adr/0007-search-strategy-latency.md) (replay must
exercise clock, waiting and limiter; fifty-Check replay every release, live
acceptance separate), [ADR-0012](../adr/0012-hosting-operations.md) and the
FA-UEB-40–43 rows in `docs/requirements-traceability.md`.

## What exists

```sh
DATABASE_ADMIN_URL=postgres://… pnpm --filter @source-taster/server load:test [options]
pnpm --filter @source-taster/server test:load      # harness regression tests
```

The CLI (`apps/server/scripts/load-test.ts`, library in `scripts/load/`)
provisions an owned database and role, starts a replay server on one loopback
port (default 4502), starts the real `src/web.ts` (default port 4501) and one or
more real `src/worker.ts` processes, and starts N Checks at once through
`POST /v2/checks`. Each Check is followed over SSE with
`Last-Event-ID: <id>:0`, its lease is renewed, and every time is a monotonic
`performance.now()` receipt time. The report is JSON (`--report`, validated by
the `LoadReport` zod schema), and the exit code is:

| Code | Meaning |
| ---- | ------- |
| 0 | All five launch measurements taken and met |
| 1 | A target missed or evidence invalid (also a `--release` pass that cannot qualify) |
| 3 | Reduced scope, nothing missed (never a pass) |
| 78 | Configuration or usage error |

Only Data source answers and their latencies are replayed, at the adapters'
HTTP edge. Latency is waited for real, so the adapters' 3 s timeout, the PG
source budgets, retries, the 30 s Reference deadline and the Check round-robin
all run unmodified. Source base URLs must be bare origins, so one replay port
serves every source; requests are routed by path and query shape.

## Targets and measurements

The five targets are constants in `src/load/analysis.ts` (`TARGETS`) and no
option changes them: mean per findable Reference ≤ 3 s (FA-UEB-40), mean per
Reference that cannot be found ≤ 15 s (FA-UEB-41), longest first Verdict per
Check ≤ 10 s and longest 100-Reference list ≤ 180 s (FA-UEB-42), and peak
overlap of Checks ≥ 50 (FA-UEB-43). The worst Check decides the FA-UEB-42
targets. The list target is measured only for lists of 100 References.

Evidence-validity gates fail the run instead of excluding data: unmatched
replay requests, a Check not ending `completed` (lease expiry, cancellation,
lost stream, run deadline), an unfinished Reference, a findable Reference
without a `correct` or `exists-with-deviations` Verdict from complete evidence,
and a not-findable Reference that is not `not-found` or whose evidence has any
`unavailable` source (a fast outage, `rate-budget`, `deadline` or `timeout` is
not a completed negative search; FA-UEB-41).

A target missed at a reduced scope still fails (more load cannot make it
faster). A reduced scope can never pass; it reports `incomplete`.

### Duration basis (open spec question)

FA-UEB-40/41 say the clock starts at auto-start with queue wait included. The
gating default, `check-start`, takes that literally: every Reference's duration
runs from the start of its Check. ADR-0007 also allows only ten active
References per Check, so in a 100-Reference list the mean from Check start is
about 5.5 × the per-Reference duration. A 3 s mean then needs roughly 0.55 s per
Reference. That is demanding rather than impossible, but it is a real tension
between the per-Check pacing and the 3 s mean that the requirements owner
should confirm.

`slot-eligible` (the clock starts when the Reference could first run: Check
start for the first ten, the end of the Check's own earlier Reference
afterwards) is a diagnostic only. Both means are always in the report
(`diagnostics.*.meanFromCheckStartMs`, `meanSlotEligibleMs`) with the queue and
execution split. A run measured with `slot-eligible` never qualifies. It is a
lever for diagnosis, not a redefinition of the requirement.

## Qualification and provenance

`qualifying` is true only for a `passed` outcome with all of: authorized
recorded evidence (digest and authorization metadata), an identified clean code
version (`codeVersion` from git), operating settings that are either the shipped
defaults or taken from a named reviewed configuration file (see
[Release path](#release-path-and-configuration-binding-completion)), a
placeholder delay of at least the service default (500 ms), and the
`check-start` basis. `--settings`, `--placeholder-delay-ms` and
`--duration-basis` exist for diagnosis; with `--release` they are refused
(exit 78), synthetic evidence is refused, and a pass that cannot qualify exits 1.

Recorded replay reads one JSON file from a private location
(`--recording` or `SOURCE_TASTER_LOAD_RECORDING`): `authorization`, exact
request-keyed `entries` (status, headers, body, `latencyMs`) and a `workload`.
The report holds the file's sha256 digest, the authorization string, counts and
timings only, never Reference text or request URLs. Nothing private is
committed.

**No authorized load recordings exist in this environment.** I checked
`current.md`, `issue-117.json`, `issue-70.json`, issue #117's comments
(none) and the environment for `SOURCE_TASTER_LOAD_RECORDING`. Therefore every
run here uses the built-in synthetic latency witness (150 ms findable, 300 ms
not-findable, invented titles). Such a report is `synthetic-witness`,
`qualifying: false`, and says so in `limitations`. Replay is regression
evidence; live fifty-Check acceptance (FA-UEB-43) is separate and still open,
and so are the existing #140/#114, #138/#136/#116 and Better Auth release gates.

## Test-first evidence

TDD seams (already confirmed in #70): published `/v2` HTTP/SSE, real PostgreSQL,
real web/worker processes, replay only at the adapters' HTTP edge, and the pure
measurement seam. Logs are in
`/Users/jeffnawroth/Developer/Repositories/source-taster/.tmp/spec-70-orchestration/`.

1. Analysis: `test/load-analysis.test.ts` first failed at import
   (`117-analysis-red.log`), then passed (`117-analysis-green.log`). It covers
   each target's hand-worked threshold, the pass path, scope, the validity
   gates, provenance, configuration disclosure, queue/execution split, both
   duration bases, outcome counts and the exit codes.
2. Replay edge: `test/load-replay.test.ts` red (`117-replay-red.log`) then green
   (`117-replay-green.log`): real waited latency, a latency past the request
   timeout stays a timeout, 429/Retry-After and 503 replay, unmatched requests
   counted, request classification, key canonicalization, recording validation.
3. Qualification guards: the test that eased settings, delay or basis cannot
   qualify failed first (`117-qualifying-red.log`), then passed.
4. End to end: `test/load-run.load.ts` runs the real CLI. Six findable
   References against an OpenAlex budget of one send per 1.5 s give a mean of at
   least 3.75 s whatever else the system adds; the run exits 1, writes a valid
   report with FA-UEB-40 `missed`, no unmatched requests and no invalid
   evidence. It passed on its first run, so I proved it can fail with a
   mutation: `exitCodeFor` always returning 0 made it fail with
   `expected +0 to be 1` and 13 analysis tests fail
   (`117-e2e-mutation-red.log`), reverted afterwards (`117-e2e-green.log`).
   It is therefore a characterization test with mutation evidence, not a
   red-to-green slice.
5. Regression guards added after their implementation (passing first run, not
   red-to-green): a reduced-scope miss still fails; unfinished Checks count as
   concurrent at the run deadline (this one was red first, found by the
   aborted 50×100 run reporting a peak of 0).

Final load-harness suite on the merged tree: 3 files, 48 tests passed
(`117-merge-load-suite.log`), plus `tsc`, ESLint and Prettier on the touched
files (`117-merge-quality.log`).

## Bounded real runs (synthetic, shipped defaults)

Shipped defaults, `check-start` basis unless noted, one web and one worker
process (`workerConcurrency` 20), placeholder delay 500 ms, invented lists with
20 % not-findable, PostgreSQL 18 in an owned container.

**50 Checks × 3 References** (150 References, about 150 s;
`117-real-50x3-defaults.log`, slot-eligible basis, earlier build): 50 Checks
overlapped (FA-UEB-43 measured 50 and met), but findable mean 41.9 s, not-findable
mean 120.8 s and slowest first Verdict 59.2 s. Exit 1. Reasons recorded:
`rate-budget` 166, `deadline` 60, `after-source-failure` 250, `timeout` 2;
45 of 100 findable References ended Not verifiable.

**50 Checks × 100 References** (launch scope, bounded to 540 s;
`117-final-50x100-defaults.log` and `117-final-50x100-defaults-report.json`,
542 s wall time, exit 1): all 50 Checks overlapped (peak 50, met), but only 565
findable and 104 not-findable References finished before the harness stopped
(of 5000). Mean from Check start 268.9 s / 301.3 s (slot-eligible 242.0 s /
288.1 s); 3 Checks had no Verdict at all and the median first Verdict was 29.5 s.
`rate-budget` 624, `deadline` 205, `after-source-failure` 964, `timeout` 1. Of the finished
findable References, 240 ended Not verifiable and 100 of 104 not-findable ones
did not end Not found. Targets for the first Verdict and the list stayed
`not-measured` because Checks did not finish. Invalid evidence in the report:
`check-not-completed` 50, `reference-unfinished` 4331,
`findable-not-identified` 240, `not-findable-search-incomplete` 100,
`client-failure` 50 (the 50 Checks were cut off by the run deadline); both mean
targets were also missed.

An earlier build of the same run (`117-real-50x100-defaults.log`, slot-eligible
basis) failed the same way and reported peak concurrency 0 for Checks that were
still running; that was a harness bug, fixed with a test.

These results are an honest finding about the shipped development defaults, not
a regression: OpenAlex runs at 1 request/s with one connection, Crossref
searches at 1/s, and `maxWaitMs` is 10 s. 5000 References need at least ~5000
OpenAlex sends, so about 5000 s on OpenAlex alone, against a 180 s target (ADR-0007 puts the required completion rate for 50 × 100 References in 180 s at about 27.8 References/s). The
documented defaults deliberately keep the slower #74/#77 development values
(see `packages/core/src/search-settings.ts`). A launch run needs the
provider-compliant allowances ADR-0007 assumes, recorded latencies, and
configuration that the Operator sets and qualifies. I did not change any
default, budget or target to obtain a pass, and I did not run a loosened
configuration to produce a pass claim.

### Resolved by the completion: `--release` binds to the reviewed configuration

The source pinned `--release` to the shipped defaults, which cannot meet the
targets (arithmetic above). ADR-0007 answers the question: Operator budgets are
"part of the measured configuration" with "no blanket exemption", and changes
need the Quality gate and the rate-limited load checks before activation.
Option (b) is therefore the documented one; it is implemented below. No default,
budget or target was changed, and nothing here says that any configuration is
qualified.

### Exact limits

- CI: `pnpm test` runs the pure harness and guard tests (`test/load-*.test.ts`)
  and a bounded CI step runs `test/load-run.load.ts` against real processes with
  synthetic latency witnesses (see below). The fifty-Check recorded replay is not
  a CI job: it needs private recordings and runs in the guarded release flow.
  No release/publication workflow exists in the repository yet, so nothing
  automatically invokes `pnpm load:release` followed by `pnpm build:release`.
  All validation here is local, not CI evidence.
- Not run: a full 50×100 to completion (impossible within the budget above; the
  bounded run stops at 540 s), a recorded run, any live run, multi-worker runs,
  a run on the ADR-0012 single-container topology.
- Timing is client receipt time on loopback, including SSE delivery. Harness
  CPU shares the host with the services and database, so capacity is not
  measured.
- The synthetic witness resolves a findable Reference at the first OpenAlex
  query; other sources return empty shapes. Only OpenAlex, Crossref and Europe
  PMC are enabled in the harness.
- No source cache exists; nothing about cache effects is measured.
- A development scheduling delay of 500 ms (`SOURCE_TASTER_PLACEHOLDER_DELAY_MS`
  default) is included and disclosed in every report.

## Other notes for the integrator

- No public contract, OpenAPI or generated output changed, so there is nothing
  to regenerate and no private-repo repin. The only files outside
  `apps/server/scripts/load*`, `test/load-*` and `load.vitest.config.ts` are two
  scripts in `apps/server/package.json` and this document.
- `pnpm build` on the merged tree fails in `@source-taster/website` with "A
  current controlled Pagefind source build is required". That is an existing
  release gate from the website work, not from this ticket; CI runs
  `pnpm pagefind:build` and `pnpm pagefind:verify` before `pnpm build`, which I
  did not run or bypass; the contract and
  core packages build, and the server tests run.
- Pre-existing and unrelated: `test/article-fairness.test.ts` "caps running
  References per Check at the configured setting" failed intermittently on the
  starting HEAD with the dispatch order `[61, 51]` instead of `[51, 61]` (a race
  between workers); I did not change it.
- Ports used: 4501 (API), 4502 (replay edge); the browser port 5351 was not
  needed.

## Release path and configuration binding (completion)

Completes the "fifty-Check replay on every release" requirement (ADR-0007,
FA-UEB-43) on top of the committed `b56c757` harness (merged unchanged: its 48
regression cases and the failed synthetic launch-scale reports above stay as
evidence) and the [#94 exact-configuration guard](94-quality-measurement.md).

### Operator sequence

```sh
export SOURCE_TASTER_QUALITY_ROOT=/private/datasets
export SOURCE_TASTER_QUALITY_CONFIGURATION=/private/measured.json
export SOURCE_TASTER_QUALITY_EXTRACTION=/private/extraction.mjs
export SOURCE_TASTER_LOAD_RECORDING=/private/load-recording.json
export SOURCE_TASTER_LOAD_REPORT=/private/load-report.json
export DATABASE_ADMIN_URL=postgres://… # disposable PostgreSQL only

pnpm --filter @source-taster/server load:release   # replay, writes the report
pnpm --filter @source-taster/server build:release  # guard (exit 78) then build
```

- `load:release` is `load-test --release`. It requires authorized recordings, a
  reviewed configuration (`--configuration`, defaulting to the same
  `SOURCE_TASTER_QUALITY_CONFIGURATION` file the Quality gate receives) and a
  report location (`--report`, defaulting to `SOURCE_TASTER_LOAD_REPORT`);
  anything missing, any eased option (`--settings`, `--duration-basis`,
  `--placeholder-delay-ms` below 500) or a configuration enabling a Data source
  the harness does not replay exits 78 before any process starts. A pass that
  cannot qualify (synthetic, unidentified or modified code) exits 1.
- The configuration file is the #94 format (`enabledSources`, optional
  `searchSettings` patch). The replay starts the real processes with exactly
  that patch, and the report records the effective settings, the optional
  sources, the file's SHA-256 (`configuration.reviewed.digest`) and the clean
  git `codeVersion`. A diagnostic `--configuration` run works without
  `--release`.
- `release:check` (so `build:release`, which stops at it before building) now
  requires the load report as well. `checkLoadReplay`
  (`src/load/release.ts`) refuses with exit 78 and a named reason when:
  the report is missing/unreadable/invalid (`no-load-report`,
  `load-report-unreadable`, `invalid-load-report`); evidence is synthetic or
  unauthorized (`load-synthetic-evidence`); evidence is invalid or a Check did
  not complete (`load-invalid-evidence`, `load-check-not-completed`); fewer
  than 50 Checks or lists below 100 References (`load-scope-reduced`); the
  clock is not `check-start` or the scheduling delay is below 500 ms
  (`load-duration-basis`, `load-placeholder-delay`); a target limit was changed
  or removed (`load-target-changed:<id>`), a measurement misses its limit or
  disagrees with the report's own Checks/diagnostics
  (`load-target-missed:<id>`, `load-target-inconsistent:<id>`); the report is not
  for this exact clean code version (`load-code-version-mismatch`); or the
  effective settings or optional sources differ from the production
  configuration the Quality gate is measuring (`load-configuration-mismatch`,
  `load-sources-mismatch`, `load-configuration-invalid`). The report's own
  `qualifying`, `outcome` and target `status` are never read.
- A report for the shipped defaults only satisfies a release whose production
  configuration is exactly the defaults; a changed Operator budget needs its own
  replay (and its own Quality measurement). The guard does not make any
  configuration qualified; it makes the absence of a matching replay fatal.

### Decisions taken from accepted documents

- **Binding:** ADR-0007 (Shared budgets, scheduling and deadlines): budgets,
  timeouts, deadlines and concurrency that can affect evidence "are part of the
  measured configuration" and need the Quality gate and rate-limited load checks
  "before activating changes; there is no blanket exemption". ADR-0006/0025 and
  the #94 guard supply the exact-configuration mechanism, so the replay uses the
  same file and the guard compares effective settings and sources by value.
- **Clock:** the literal Check-start clock remains the only qualifying basis
  (traceability FA-UEB-40/41: "queue wait included"; ADR-0007: queue time "cannot
  be excluded from FA-UEB-42/43 evidence"). Unchanged.
- **Targets, budgets, defaults:** untouched. The shipped defaults still differ
  from ADR-0007's initial caps (documented in
  `packages/core/src/search-settings.ts`); only a reviewed configuration file can
  qualify different values.

### Precise remaining ambiguities (for the requirements/operations owner)

1. **FA-UEB-40/41 clock with the ten-active cap.** ADR-0007's ten active
   References per Check make a 100-Reference list's mean from Check start about
   5.5 × the per-Reference execution time, so a 3 s mean needs about 0.55 s per
   Reference. The text says "queue wait included"; whether the per-Check
   pacing queue counts for the *per-Reference* means (rather than only for
   FA-UEB-42/43) is not stated. The harness keeps the literal reading and reports
   both means; I did not choose the alternative.
2. **Development scheduling delay.** Qualifying runs require the service's
   500 ms `SOURCE_TASTER_PLACEHOLDER_DELAY_MS`, as before. No accepted document
   says whether that delay exists in production; it is not part of the #94
   configuration file, so the guard cannot bind it. If production removes it, the
   replay is conservative; if the Operator can change it, it needs a decision on
   where it is versioned.
3. **Source coverage.** The harness enables and replays only OpenAlex and Europe
   PMC next to Crossref/doi.org. A production configuration that enables any
   other optional source (Semantic Scholar, arXiv, Open Library, Google Books,
   URL, Internet Archive) is refused by both the CLI and the guard
   (`load-sources-mismatch`) rather than measured partially. Whether the launch
   configuration may omit those sources is a #114/launch-scope decision; if not,
   the harness needs request classification and recordings for them.

### Tests (TDD record)

New logs under
`/Users/jeffnawroth/Developer/Repositories/source-taster/.tmp/spec-70-orchestration/`
(`117r-*`):

1. Report binding fields: red `117r-analysis-binding-red.log` (2 failing), green
   `117r-analysis-binding-green.log`. Existing `input()` helper now carries a
   clean code version and sources; two cases cover unidentified/dirty code and
   reviewed-versus-ad-hoc settings.
2. Release guard: `test/load-release.test.ts`, red at the missing module
   (`117r-release-guard-red.log`), green with 10 cases
   (`117r-release-guard-green.log`): pass path, missing/malformed report,
   synthetic or unauthorized evidence despite a `qualifying: true` claim, reduced
   scope, recomputed targets, loosened/removed targets, invalid evidence,
   unfinished Checks, eased clock/delay, code version, exact configuration and
   source set.
3. Composition with #94: red `117r-release-compose-red.log` (2 failing), green
   `117r-release-compose-green.log` (16/16 in `quality-release.test.ts`). Every
   existing release case now supplies a passing replay of the same configuration;
   a release without, with a synthetic or with a mismatched replay is refused
   while the Quality gate reasons are still reported; `release-check.ts` exits
   78 naming `no-load-report`/`load-report-unreadable`.
4. CLI binding: `test/load-run.load.ts` red `117r-cli-binding-red.log` (3
   failing, one by running an unbound `--release` for its 30 s timeout; its
   leftover processes were mine and were stopped), green
   `117r-cli-binding-green.log` (6/6): missing configuration/report, shared
   `SOURCE_TASTER_QUALITY_CONFIGURATION`, unreplayed sources, conflicting
   `--settings`, invalid patch, and a real-process run that applies the reviewed
   patch and records digest, sources, settings and git SHA.

Final checks (PostgreSQL 18 container `st117-release-pg`, owned, port 55117; API
4501 and replay edge 4502; the 5351 browser port was not needed): the load suite
**63/63** in 4 files (`117r-final-load-suite.log`; was 48 + 15 new), the
three quality suites using `checkRelease` or the CLI **30/30**
(`117r-final-quality.log`), server typecheck, ESLint and build, whole-repo
Prettier. `release-check.ts` and `build:release` with no inputs exit 78 and name
`no-load-report` (`117r-release-refusal.log`, `117r-build-release-refusal.log`);
the build step does not run. No 50×100 run was repeated: the code that decides
launch-scale performance did not change, so the earlier failed 50×3 and bounded
50×100 reports above stand as the only measured launch-scale evidence.

### CI

`ci.yml` gains one bounded step, `test/load-run.load.ts` against the job's
PostgreSQL service (about 20 s, synthetic latency witnesses only); the pure
tests already run in `pnpm test`. No release/publication workflow was invented.
A future release workflow must run `load:release` then `build:release` with the
private inputs from its protected environment.

### Still outstanding (not implemented here, not claimed)

- **Recorded launch qualification:** a rights-cleared latency recording and a
  `load:release` pass on it (#140/#114; no recording exists in this
  environment). Until then no report can qualify.
- **Live acceptance:** live EU-region FA-UEB-40/41/42 sets and the live
  fifty-Check provider-compliant test (FA-UEB-43, ADR-0007 F20).
- **Capacity:** the shipped development budgets cannot meet 50 × 100 in 180 s
  (OpenAlex alone at 1 req/s); a reviewed production configuration with
  provider-compliant allowances must be chosen and qualified by both gates.
- **Harness scope:** replay of the remaining route sources (ambiguity 3), host
  CPU/memory/connection measurement and the ADR-0012 single-container topology,
  multi-worker runs.
- **Release automation:** a protected release workflow invoking the sequence.

### Integration merge validation

Merged `spec/70-launch-integration` at `56f251f` (which contains `512e457`)
without conflicts as `a032247`. After a frozen install, core/contract builds and
Prisma generation the tracked generated contract artifacts were unchanged. On the
merged tree: server typecheck, ESLint and build, the load suite **63/63** and the
three quality suites **30/30** (logs `117r-merge-*.log`), whole-repo Prettier and
`git diff --check` passed, and `release-check.ts` with no inputs still exits 78.
No browser, private-service or full server suites were run; this local evidence
is not CI. The owned PostgreSQL container `st117-release-pg` was stopped after
validation.
