# Launch integration: #90, #93 and #137 with #91

Continues the interrupted integration in the shared root on
`spec/70-launch-integration`. #91 was already merged at `939510a` and was not
merged again. The following separate local merge commits are retained:

- `6fa1593`: #90, bibliography selection (`c910d93`).
- `9ff98af`: #93, native selected-text intake (`f78ddb0`).
- `246f449`: #137, Semantic Scholar journal attestations (`dadcea3`).

## Compatibility changes

The #90 HTTP conflict preserves invalid-selection errors, expired-content errors
and frozen-v1 behavior. Selection preview and edit responses use the Check's
publication lifetime guard. #93's UI conflict preserves the bibliography editor,
upload/library intake, Account controls and native selection notices/Undo. Its
excluded-surface guidance has a separate DE/EN message key from bibliography
editing help. #137 merged without conflicts and retains its attributed journal
aliases and stored search/scoring versions.

The integration fixes extend #91's AES-GCM codec to the complete stored
bibliography document, including unselected text and selected regions. Daily
rollover rewraps it, and startup recovery detects missing/expired document keys.
Purging locks the row without decrypting unavailable content, deletes the
document along with References/events, and preserves the content-free tombstone.
The codec passes Prisma's database-null marker through rather than encrypting
it. No persistent raw upload store was added. Migration order remains #84's
manual overrides, #91's content retention, then #90's bibliography selection.

Native selected text clears a prepared bibliography draft and its Reference
limit notice. Undo restores the document, moved regions, limit notice and prior
intake state. Boundary edits clear obsolete Undo. Intake itself starts no Check.

The bibliographic-web and native-panel Playwright configurations enable their
synthetic web-page fixtures when `SOURCE_TASTER_E2E_WEB_FIXTURES` is unset;
explicit `false` opts out. The main web suite retains its DOI-only harness.
Production source and qualification gates are unchanged.

## Current validation evidence

The earlier `/tmp/source-taster-70` logs disappeared during the interruption.
They are historical reported evidence only. New logs for this continuation live
in `.tmp/spec-70-orchestration/` in the integration checkout. No missing log is
counted as a current run.

The existing #70 seams remain HTTP/SSE/download contracts with real PostgreSQL,
external adapter-edge fixtures and Playwright client/native-panel behavior.
Current red/green evidence:

- `integration-retention-resume.log`: the saved regression failed because an
  encrypted value remained in the post-expiry dump. `integration-retention-green.log`
  passes after database-null handling: no plaintext document in operator exports,
  keyless restore fails closed, daily rollover preserves the exact document and
  regions, and expiry leaves no encrypted document in the backup artifact.
- `integration-selection-red.log`: selected text could not replace a prepared
  bibliography draft. `integration-selection-green.log` passes with moved
  regions restored by Undo, no Check creation and no axe violations.
- `integration-web-fixture-red.log`: the existing English web-page case failed
  to show its expected archive Verdict with the flag unset.
  An initial shared-harness default passed both DE/EN cases but activated
  bibliographic verification in the main web suite: `integration-web.log`
  records the resulting selection timing failures. The final fix scopes the
  default flag to the two configurations containing #80 cases; subsequent
  final-config runs are recorded below.

Tests use an owned disposable PostgreSQL 18 container,
`st70-integration-codex-pg`, with a dynamically allocated loopback port (32768 in
this run). Only its databases/roles/container are disposable here. API/auxiliary/
browser ports are 3701/3702/5281; retention restores use 5282 and native intake's
cross-origin fixture uses 5283. Uploads use the exact existing image
`sha256:a36fa02bdeea666e023b219e6bafa4f020833cd703ca1e1e069623cb7a061707`.

The reproducible environment prefix is saved locally as
`.tmp/spec-70-orchestration/integration-env.sh`. It selects the owned database,
ports and extraction image and unsets `SOURCE_TASTER_E2E_WEB_FIXTURES`.
Focused HTTP commands (run serially after sourcing that prefix):

```sh
pnpm --filter @source-taster/server exec vitest run \
  test/retention.test.ts test/bibliography-selection.test.ts \
  test/documents.test.ts test/documents-limits.test.ts \
  test/reference-revisions.test.ts test/exports.test.ts \
  test/manual-overrides.test.ts test/imports.test.ts \
  test/revision-lifecycle.test.ts test/article-sources.test.ts \
  test/journal-abbreviations.test.ts
pnpm --filter @source-taster/server exec vitest run \
  test/bibliographic.test.ts test/web-pages.test.ts \
  -t 'compares received PMCID|Operator-disabled web Data sources'
```

Results: **117/117 passed in 11 suites** (`integration-http.log`), then
**5/5 selected cases passed** (`integration-version-gates.log`; 118 unrelated
cases filtered out). The latter includes versioned received-PMCID behavior and
Operator-disabled web-source behavior.

Static checks passed:

```sh
pnpm --filter @source-taster/server generate
pnpm --filter @source-taster/server exec prisma validate
pnpm exec tsc -p scripts/tsconfig.json
pnpm -r --if-present typecheck
pnpm exec eslint scripts
pnpm -r --if-present lint
pnpm i18n:check
pnpm audit:licenses
```

Logs are `integration-prisma.log`, `integration-prisma-validate.log`,
`integration-{scripts,workspace}-{typecheck,lint}.log`, `integration-i18n.log`
and `integration-licenses.log`. DE/EN parity covers **351 messages**; the license
check covers **547 installed / 89 runtime packages**. A first lint pass rejected
an unnecessary type assertion in the new rewrap; removing it and rerunning
workspace lint passed.

The combined contract build and a second rebuild reproduce **40 artifacts**
byte for byte, including both OpenAPI files; the tracked generated diff is empty
(`integration-generated-{build,reproduction}.log` and
`integration-generated-before.json`). No generated artifact was hand-merged.

Final browser commands, all with the fixture flag unset and executed serially:

```sh
pnpm --filter @source-taster/web exec playwright test \
  e2e/bibliography-selection.spec.ts e2e/documents.spec.ts e2e/imports.spec.ts \
  e2e/revisions.spec.ts e2e/manual-overrides.spec.ts
pnpm --filter @source-taster/web exec playwright test \
  --config bibliographic.playwright.config.ts e2e-bibliographic/web-pages.spec.ts
pnpm --filter @source-taster/extension test:native-selection
pnpm --filter @source-taster/extension exec playwright test \
  e2e/bibliography-selection.spec.ts e2e/documents.spec.ts e2e/web-pages.spec.ts
```

| Run | Result | Current log |
| --- | --- | --- |
| Web selection, upload, import/export, revision and Manual override paths | 21/21 passed | `integration-web-final.log` |
| Web-page archive evidence, DE/EN | 2/2 passed | `integration-web-fixture-final.log` |
| Native selection intake, Undo, storage, active/completed Check preservation and Firefox cap/PDF viewer | 14/14 passed | `integration-native-selection-final.log` |
| Native Chromium selection/upload and web-page parity, DE/EN | 6/6 passed | `integration-native-final.log` |

These are **43 distinct passing browser cases**, including all four original
#80 web/native cases with the default configuration. The newly added prepared
bibliography Undo case also checks axe accessibility. Existing cases retain
their accessibility and privacy assertions.

Build checks also passed, using local fixture URLs only:

```sh
pnpm --filter @source-taster/server build
SOURCE_TASTER_API_URL=http://127.0.0.1:3702 pnpm --filter @source-taster/web build
SOURCE_TASTER_EXTENSION_API_URL=http://127.0.0.1:3702 \
SOURCE_TASTER_EXTENSION_WEBSITE_URL=http://127.0.0.1:5281 \
pnpm --filter @source-taster/extension build
```

Logs: `integration-server-build.log`, `integration-web-build.log` and
`integration-extension-build.log`; the extension build includes Chromium and
Firefox. Whole-repository Prettier and `git diff --check` passed
(`integration-prettier-final.log`). After all database/browser runs, the owned
PostgreSQL container was stopped and automatically removed; shared resources
were left untouched (`integration-cleanup.log`).

`node apps/server/scripts/release-check.ts` still refuses with exit **78**:
calibration/ADR-0006/0025/#94 qualification is required
(`integration-release-refusal.log`). The full Turbo/repository test suite,
website production build, vulnerability audit, private-service and both-program
suites were not run in this focused integration pass.

## Boundaries and parent handoff

No pushes, PR changes, issue changes, new worktrees, delegation or private-repo
mutations were performed. #94 is concurrent, remains excluded from this checkout,
and must merge this final integration tip before its handoff.

The private integration remains pinned to public `1e14d63`. Its actually imported
service/internal contract sources have not changed since that pin. The public
verification contract gained optional document/selection transport and 410
responses, but the private service currently imports neither that contract nor
its changed entrypoints. No private re-pin is required for these runtime paths.
A future private consumer of the new verification schemas must re-pin its
`@source-taster/contract-verification` dependency and lockfile to a reachable
published integration commit; this task does not publish or change that pin.

Synthetic regressions do not qualify deployment/backups (#116), Semantic Scholar
rights/recordings (#136), book sources (#138), approved web recordings (#140 →
#114), calibration/Quality gates, browser coverage or release. The Better Auth
Selected release gate remains open. Local checks are not GitHub CI evidence;
CI was previously billing-blocked. No completion of the overall #70 is claimed.
