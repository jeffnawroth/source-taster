# #137: Semantic Scholar journal attestations

Implements [#137](https://github.com/jeffnawroth/source-taster/issues/137), part of
#70, on `t3/semantic-scholar-source-intake` in
`/Users/jeffnawroth/.t3/worktrees/source-taster/t3-e2982db4`.

The clean starting HEAD was exactly the local integration tip,
`1e14d63dfa85d19ce6a98e2713a5aa480bc4b10f`; no reset was needed. Work stayed in
this prepared worktree. No nested agents, integration-checkout edits, pushes,
PRs, ticket mutations, live Data source requests or predecessor access were involved.

## Behavior and attribution

Semantic Scholar's shared field selection now requests `publicationVenue` for
search, batch lookup and the existing single-record lookup. The adapter already
preserves the complete received record as `RetrievedCandidate.raw`. This carries
all `publicationVenue.alternate_names` into #76's existing ADR-0018 comparison;
no alias is discarded by selecting a single CSL short title. The API exposes
the matching journal attestation on the Candidate's field comparison.

The new synthetic journal witnesses match the second received alias, with
Semantic Scholar as the sole attestation source. Search and batch each stop
after identification, with no abbreviation-only request. Missing or null
`publicationVenue` leaves the abbreviation unscored, with `no-attestation`, and
renormalizes the remaining weights without a penalty.

The Search strategy advances from `article-search-78-4` to
`article-search-78-5`. Journal rules advance from `journal-76-1` to
`journal-76-2`, changing the rules hash as well. The runtime now uses the exported
journal-rules version in its Scoring rules version instead of duplicating the
literal. Existing immutable results retain their stored versions. The
`article-verdict-78-2` derivation rules, NLM snapshot and comparison arithmetic
are unchanged. No public schema change or generated artifact edit is needed.

## Test-first evidence

The TDD skill and the pre-agreed #70 seam were used: published `/v2` create,
GET and ordered SSE contracts, real disposable PostgreSQL databases and roles,
real web/worker processes, and external HTTP fixtures only at adapter edges.
All new payloads are invented regression witnesses, not recordings.

1. Added the search witness before implementation. The fake Graph API includes
   the venue only when the request selects it. The HTTP/SSE result failed with
   journal `score: null`, `not-determinable`, `no-attestation` and no attestations.
   Adding the requested field made that same test pass.
2. Added stored-result version expectations after the first green run. The
   witness failed on the old `journal-76-1` version; advancing the search/journal
   versions made it pass.
3. Added batch and missing/null regression guards after that shared-field fix.
   These passed on their first run and are characterization/regression evidence,
   not separate red-to-green claims.

Exact red/green commands (run from the worktree root):

```sh
SOURCE_TASTER_TEST_API_PORT=4301 SOURCE_TASTER_TEST_ARTICLE_PORT=4302 pnpm --filter @source-taster/server exec vitest run test/article-sources.test.ts -t 'attested only by Semantic Scholar search'
```

The four runs are recorded in `/tmp/source-taster-70/137-search-red.log`
(exit 1, expected field failure), `137-search-green.log` (exit 0, 1 passed),
`137-version-red.log` (exit 1, expected version failure), and
`137-version-green.log` (exit 0, 1 passed). Core was rebuilt before the version
green run with `pnpm --filter @source-taster/core build` (exit 0).

```sh
SOURCE_TASTER_TEST_API_PORT=4301 SOURCE_TASTER_TEST_ARTICLE_PORT=4302 pnpm --filter @source-taster/server exec vitest run test/article-sources.test.ts -t 'Semantic Scholar.*publicationVenue'
```

Result: exit 0, **6 passed**, 26 unrelated tests filtered out
(`/tmp/source-taster-70/137-venue-regression.log`). Ports 4301/4302 were used;
browser port 5331 was reserved but unnecessary for this server-only change.

## Validation

Environment: Node 24.14.0, pnpm 12.15.0, macOS arm64. The initial focused runs
used shared OrbStack PostgreSQL on localhost:5433. Final regression validation
uses an owned PostgreSQL 18 container (`st137-journal-pg`, dynamically allocated
loopback port 32769). Each harness owns and tears down its databases and roles.
PostgreSQL test files run serially to limit connection pressure.

Setup, all exit 0:

```sh
pnpm install --frozen-lockfile
pnpm --filter @source-taster/core --filter @source-taster/contract-common --filter @source-taster/contract-internal --filter @source-taster/contract-service --filter @source-taster/contract-verification build
pnpm --filter @source-taster/server generate
```

Static and generated-contract checks, all exit 0:

```sh
pnpm --filter @source-taster/core --filter @source-taster/contract-verification --filter @source-taster/server typecheck
pnpm exec eslint apps/server/src/sources/semanticscholar.ts apps/server/src/checks/verification-runtime.ts apps/server/test/article-sources.test.ts apps/server/test/bibliographic.test.ts packages/core/src/bibliographic.ts packages/core/src/journal-abbreviations.ts
pnpm exec prettier --check apps/server/src/sources/semanticscholar.ts apps/server/src/checks/verification-runtime.ts apps/server/test/article-sources.test.ts apps/server/test/bibliographic.test.ts packages/core/src/bibliographic.ts packages/core/src/journal-abbreviations.ts
pnpm --filter @source-taster/contract-verification build
git diff --exit-code -- packages/contract-verification/dist packages/contract-verification/openapi.json packages/contract-verification/openapi-v2.json
git diff --check
```

Typechecking passes for core, verification contracts and server. ESLint and
Prettier pass for every modified TypeScript file. Rebuilding verification
contracts reproduces all 38 tracked `dist` files and both OpenAPI artifacts.
Logs: `/tmp/source-taster-70/137-{install,build-initial,core-build,typecheck,eslint,prettier,contract-build}.log`.

The shared-database combined regression attempt failed (38 passed, 6 failed,
1 unhandled error), with invalid snapshot responses, unexpected fixture requests
and a timeout. A reduced three-case run passed. A second full article run failed
(23 passed, 9 failed) when the existing restart/batching test timed out and
subsequent requests lost their server. These attempts are preserved in
`137-api-regression.log`, `137-diagnosis.log` and `137-api-regression-retry.log`.
They are not counted as passing validation. A snapshot HTTP-status assertion
was retained to make future contract failures diagnostic instead of reporting
only a schema parse failure. No product workaround was added for those failures.

An isolated database was then started with:

```sh
docker run --detach --name st137-journal-pg --publish 127.0.0.1::5432 --env POSTGRES_PASSWORD=postgres postgres:18
docker port st137-journal-pg 5432/tcp
```

The allocated address was `127.0.0.1:32769`; substitute the newly reported port
when repeating the commands. These credentials belong only to the disposable
local fixture database.

```sh
DATABASE_ADMIN_URL=postgres://postgres:postgres@127.0.0.1:32769/postgres DATABASE_TEST_URL=postgres://verification_test:verification_test@127.0.0.1:32769/source_taster_test SOURCE_TASTER_TEST_API_PORT=4301 SOURCE_TASTER_TEST_ARTICLE_PORT=4302 SOURCE_TASTER_TEST_JOURNAL_PORT=4302 pnpm --filter @source-taster/server exec vitest run test/article-sources.test.ts test/journal-abbreviations.test.ts --reporter verbose
```

Result: exit 0, **44 passed** in two files (32 article-source cases and 12
journal-abbreviation cases), no failed/skipped tests or unhandled errors,
135.12 seconds. Log: `/tmp/source-taster-70/137-api-isolated.log`.
The shared-run failures did not reproduce with the isolated database; their
underlying cause was not established, so this does not claim a product fix for
them.

```sh
DATABASE_ADMIN_URL=postgres://postgres:postgres@127.0.0.1:32769/postgres DATABASE_TEST_URL=postgres://verification_test:verification_test@127.0.0.1:32769/source_taster_test SOURCE_TASTER_TEST_API_PORT=4301 SOURCE_TASTER_TEST_BIBLIOGRAPHIC_PORT=4302 pnpm --filter @source-taster/server exec vitest run test/bibliographic.test.ts -t 'compares received PMCID'
```

Result: exit 0, **4 passed**, 57 unrelated tests filtered out, 8.37 seconds.
This validates the updated Search strategy version on the existing received-ID
route. Log: `/tmp/source-taster-70/137-version-regression.log`.

The owned container is removed after validation with
`docker rm --force --volumes st137-journal-pg`. No shared database/container
or unrelated process is stopped.

## Limitations and qualification

#136 remains human-owned and open: no live Semantic Scholar recording,
commercial-use permission, fixture-storage permission or source qualification is
claimed. All new Semantic Scholar responses are synthetic. No calibration,
Reference test set, performance/load, source activation or release qualification
was performed. The uncalibrated versions and existing activation/release gates
remain in force. Browser/native-client and private-service suites were not run;
this change adds no client behavior or cross-program contract.
