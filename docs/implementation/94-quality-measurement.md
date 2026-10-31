# #94 — private replay measurement and Development-set calibration

Implements [#94](https://github.com/jeffnawroth/source-taster/issues/94), part of
#70, against ADR-0006/0007/0010/0025. The saved implementation checkpoint
`eb0aeeb2d4233be4131f0db67f10e823ad4bc057` was merged into the prepared
`t3/quality-measurement-implementation` worktree without discarding its TDD slices.
This handoff describes implementation behavior, not a qualified configuration.

## Operator entry points

Run from `apps/server`, after a frozen install, the core/contract builds and
`pnpm generate`. The runner provisions and removes a fresh owned PostgreSQL
database and role for every session. Supply `DATABASE_ADMIN_URL` and
`DATABASE_TEST_URL` for a disposable PostgreSQL instance; it never measures
against an existing application database. A grid search restarts its own real
web/worker processes between points, retaining only that session's database.

```sh
pnpm quality:gate calibrate --root /private/datasets \
  --grid /private/grid.json --configuration /private/development.json \
  --extraction /private/extraction.mjs --port 4202

pnpm quality:gate measure --root /private/datasets \
  --configuration /private/measured.json \
  --extraction /private/extraction.mjs --port 4202
```

Omit `--extraction` for a parser-only diagnostic configuration. `--configuration`
is required for measurement and optional for calibration. Both commands print a
JSON result naming the written private artifact; provisioning also emits Prisma
diagnostics. The artifact itself is the machine-readable interface. Bad command
syntax exits 64. A completed failed measurement or a calibration selecting no
point exits 78. Infrastructure/input errors exit unsuccessfully. Nothing is
published or uploaded.

A configuration file accepts only `enabledSources`, optional `searchSettings`
and, for measurement, `calibrationRecord` (relative to that configuration file).
Sources are `url`, `internetarchive`, `openalex`, `europepmc`, `semanticscholar`,
`arxiv`, `openlibrary`, `googlebooks`; DOI handling/Crossref are implicit.
Parameters are taken from the calibration record's selected point, never from an
independent threshold override in this file. The record's AI identity, sources
and search settings must match, and its exact bytes enter the measurement by
SHA-256. A calibration invocation cannot itself name a calibration record.

The grid is `{ "axes": { "overallScore": [85000000, 90000000] } }`, for example.
Those numbers illustrate the input format only; they are not approved values.
Only ADR-0025's twelve declared free parameters are accepted, and every grid
point is checked against the owned comparison profile's constraints. Values use
that profile's units (thresholds in millionths of a percentage point). Fixed
rules, year weight, normalization and field weights cannot become grid axes.

## Private dataset contract

Only schemas and generated synthetic witnesses live in this repository.
The Operator supplies a separate private versioned repository containing:

```text
reference-test-set/{manifest,records,fixtures}.json
development-set/{manifest,records,fixtures}.json
measurement-logs/<reference-version>/<configuration-id>.json
calibration/<development-version>/<search-id>.json
```

`manifest.json` has `kind` matching its directory and a safe version identifier
containing letters, digits, dots, underscores or hyphens, beginning with a letter
or digit. `records.json` is an array of unique IDs, raw `input`, `style`,
`language`, `sourceType`, `class`, `acceptedIdentifiers`, expected CSL fields,
optional fixed falsified `expectedVerdict`/mutation/generator, and reviewer
provenance. The schema accepts incomplete synthetic records for diagnosis;
missing expected fields never earn a Structuring hit. Human ground-truth review,
generation provenance, rights and absence of user content remain corpus
qualification obligations, not facts this loader can infer.

`fixtures.json` contains `recordedAt` and `entries`. Each entry names its source,
HTTP method, exact path/query, optional exact POST request body, status, headers,
body, recorded `delayMs` and license. Sources include `doi.org`, `crossref`, all
bibliographic adapters and `web`. Query order is canonicalized; request bodies
remain exact. Every adapter origin is replaced by a loopback listener. An
unrecorded request returns 503 and invalidates the run, never a synthetic empty
or negative answer. Recorded latency exercises the real clock and PostgreSQL
rate limiter. This is replay evidence, not live load acceptance.

Private locations are resolved through symlinks and refused in this public
checkout or another linked checkout sharing its Git directory. Writes check the
resolved output directory too. Dataset manifest/record bytes and fixture bytes
are hashed separately, so changing a frozen set under the same version cannot
reuse an eligible measurement. Log and calibration files use write-once creation;
an existing identity is refused before measurement work and never overwritten.

## Measurement and calibration behavior

The real verification HTTP API is the seam: the parser structures each record,
and checks submit those fields to the real web/worker processes. With AI, the
adapter is invoked separately for all records in each of three AI passes; Data
source responses alone are replayed. Persistent technical Structuring failures
are retained as failed outcomes after one retry. Source-failure grey/Status
outcomes are rerun once and invalidate the run if they persist. No record leaves
a denominator. A mis-split real-correct Reference counts as a false alarm.

Correctness requires Correct plus an accepted Best-match identifier, on
real-correct APA records. False alarms cover all real-correct styles. Detection
covers invented/falsified records without Correct; entirely invented Detection
requires a red Verdict. Shares use the exact integer target rule; Wilson 95%
intervals are informational. Per-language/source-type/style values and section
19 triggers are logged, as are class-specific regression differences.

All extracted CSL arrays are retained per record/run. FA-STR-02 compares every
expected field, including absence of invented extra fields, after NFC,
whitespace and dash normalization. Each of the eleven styles needs at least
90% exact records in every AI run; parser Structuring values are informational.
Reference-test-set composition floors remain separate hard gate conditions.

Calibration opens only `development-set`; its test deliberately makes
`reference-test-set` unreadable. Structuring is held fixed across grid points,
and each point runs the actual verification service with its parameters.
Selection uses only the four §14.4 targets, maximizing the exact minimum margin,
with ties going to the first declared grid point. The record retains the grid,
all outcomes/results, observed Scoring rules/Search strategy versions and the
selection. A selected diagnostic point does not change the runtime's calibration
state or grant permission to release it.

## AI and release boundaries

An extraction module exports `{ model, configuration?, extract(input) }`, where
`extract` returns CSL arrays. The optional configuration declares `mode`,
`providerPath`, pinned `modelId`, `region`, `promptVersion`, `schemaVersion`,
`sampling`, a determinism rationale, `chunkSize`, EU-only
`processingAndStorageCountries`, `zeroRetention: true` and a private
`qualificationRecord` reference. Its model must agree with the port's model.
An explicit malformed/non-EU declaration is refused before calling the adapter.
Absent or synthetic declarations remain diagnostic and cannot qualify a release.
The full declaration belongs to measurement and calibration identity: changing
a prompt, sampling setting, chunk size or region is a new configuration.

This validates an Operator declaration; it does not establish a supplier's legal
approval or prove an adapter really calls that provider. Actual provider
selection/adapters and independently checked private approval evidence remain
the AI/activation work. No live provider was contacted in this implementation.

For release CI, use the guarded entry point, not the ordinary development build:

```sh
SOURCE_TASTER_QUALITY_ROOT=/private/datasets \
SOURCE_TASTER_QUALITY_CONFIGURATION=/private/measured.json \
SOURCE_TASTER_QUALITY_EXTRACTION=/private/extraction.mjs \
pnpm --filter @source-taster/server build:release
```

`release:check` derives SHA/working-tree state and runtime calibration from code,
resolves the requested configuration, and recomputes targets, Structuring and
validity from logged outcomes against the frozen private set. A log's own
`decision`, target summaries or `valid: true` cannot promote failed outcomes.
Dirty measurements remain ineligible even after the tree becomes clean. Invalid
JSON is an ineligible log. Different parameters, enabled sources, search settings,
AI identity, corpus bytes, fixtures or code version cannot reuse a log. Missing
inputs/evidence fail closed with exit 78, so the chained release build stops.

The runtime deliberately still reports `uncalibrated` from
`src/checks/scoring-calibration.ts`; an environment variable or a calibration JSON
cannot promote it. #114 must freeze genuinely calibrated runtime values and use
the exact-configuration check for activation, alongside the other release gates.
The reusable check's explicit configuration input is also that handoff seam.
Normal `build` remains available for development. No deployment/CI publication
workflow, provider approval, source activation or release was performed here.

## TDD and validation

Confirmed #70 seams were retained: Quality gate runner and public Operator CLI,
real HTTP/service/PostgreSQL, fixtures/fakes only at external Data source and AI
edges. The checkpoint's completed slices were preserved. Earlier
`/tmp/source-taster-70` logs disappeared during interruption and are not presented
as newly executed checks.

New evidence lives under
`/Users/jeffnawroth/Developer/Repositories/source-taster/.tmp/spec-70-orchestration/`.
Fresh red/green pairs cover retained/exact Structuring fields, per-style release
refusal, malformed logs, absent live EU AI evidence, exact configuration binding,
dirty measurement refusal, persistent extraction failure, mis-split false alarms,
frozen corpus identity, linked-checkout privacy and safe dataset versions. Each
`94-<slice>-red.log` records the actual failure before the corresponding fix;
`94-<slice>-green.log` (or the named combined green run) records its check.

Pre-merge validation: `94-quality-pre-merge.log`, 65 tests in seven focused
quality suites; `94-typecheck-pre-merge.log` and `94-lint-pre-merge.log`, both
passed. The two later privacy regressions have separate fresh red/green logs.
Final integrated checks and exact commands are recorded below after the merge.

### Final integrated checks

Merged integration `246f449` as `f7b6d57`, then its final composition fix
`901b22d` as `dbc78f2`, without conflicts. The latter is the source tree used for
the final Quality gate suite. `git merge-base --is-ancestor
spec/70-launch-integration HEAD` passed. #94 changes no transport schema or
private-service dependency pin; the parent owns integration publication/pinning.

Fresh disposable PostgreSQL 18 container `source-taster-quality-94-codex` used
loopback port 55494; API/global fixture 4201 and serial auxiliary services 4202.
The 5321 browser allocation was unused because this ticket has no client-only
changes. The test prefix was:

```sh
export DATABASE_ADMIN_URL=postgres://postgres:postgres@127.0.0.1:55494/postgres
export DATABASE_TEST_URL=postgres://verification_test:verification_test@127.0.0.1:55494/source_taster_test
export SOURCE_TASTER_TEST_API_PORT=4201
export SOURCE_TASTER_TEST_BIBLIOGRAPHIC_PORT=4202
export SOURCE_TASTER_TEST_DOI_PORT=4202
```

Executed checks:

```sh
pnpm install --frozen-lockfile
pnpm --filter @source-taster/core build
pnpm --filter @source-taster/contract-verification build
pnpm --filter @source-taster/server generate
git diff --exit-code -- packages/contract-verification/dist \
  packages/contract-verification/openapi.json \
  packages/contract-verification/openapi-v2.json

pnpm --filter @source-taster/server exec vitest run \
  test/quality-calibration.test.ts test/quality-cli.test.ts \
  test/quality-dataset.test.ts test/quality-gate.test.ts \
  test/quality-release.test.ts test/quality-replay.test.ts \
  test/quality-targets.test.ts test/bibliographic.test.ts test/doi.test.ts

# After merging 901b22d: repeat just the seven quality suites above.
pnpm --filter @source-taster/server typecheck
pnpm --filter @source-taster/server lint
pnpm --filter @source-taster/server build
pnpm exec prettier --check .
git diff --check
```

Results: **164/164 tests in nine suites** passed on the first integrated tree
(`94-quality-integrated-final.log`, 285.82 s, serial rate-limited HTTP cases).
After the final integration advance, **68/68 tests in seven quality suites**
passed (`94-quality-latest-integration.log`, 39.08 s). These include a real
measurement CLI invocation that preserves its failed log and exits 78, and a
calibration CLI invocation that preserves its no-selection record and exits 78.
There were no failed cases in either combined run.

Frozen install, core/contract builds and Prisma generation passed; generated
transport files remained unchanged. Server typecheck, lint and build passed
again after the latest merge (`94-typecheck-latest-integration.log`,
`94-lint-latest-integration.log`, `94-build-latest-integration.log`). Whole-repo
formatting passed (`94-format-final.log`), followed by a final handoff-format
check. No dependency changes required an advisory/rights exception; no dependency
audit or website/browser qualification is claimed by these checks.

With all `SOURCE_TASTER_QUALITY_*` inputs unset, the direct
`node apps/server/scripts/release-check.ts` returned **78**, including from a
clean tree (`94-release-refusal-clean.log`).
`pnpm --filter @source-taster/server build:release` stopped at that guard
(`94-release-build-refusal-final.log`; pnpm's outer process returned 1 and
reported the child's exit 78). Its build step did not execute. This is local
release-command evidence, not a successful release or CI run.

Owned test databases/roles were removed by the harness. The dedicated container
and its disposable volume were removed after validation; no unknown/shared
database, process or container was removed. Cleanup evidence is
`94-disposable-cleanup.log` in the same coordination directory.

## Qualification limits

Synthetic harness tests are neither a Reference test set nor a Development set,
provider approval, real calibration or released quality evidence. No private
corpus or licensed recording was supplied or copied into public artifacts. Human
corpus review/collection, three real EU-only AI passes, source permissions and
approved recordings (#140), live drift/performance/load, parity/formal client
acceptance, legal/security/deployment evidence (#116/#136/#138) and #114 activation
remain required. Fixture license strings and an AI qualification reference cannot
establish those facts. CI availability previously depended on GitHub billing;
these local checks do not claim a GitHub Actions run or completion of #70.
