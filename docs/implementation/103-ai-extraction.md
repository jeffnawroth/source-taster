# #103: AI extraction for paid Plans with grounding, marking and parser fallback

Implements [#103](https://github.com/jeffnawroth/source-taster/issues/103),
part of #70. Public program only. No pushes, PRs, ticket mutations, live
provider requests, private checkout edits or predecessor access were involved.

Read first: [ADR-0010](../adr/0010-ai-provider-model.md)
(EU-only zero-retention path, measurement eligibility), ADR-0011, ADR-0015,
ADR-0006, `GLOSSARY.md`, and the #94 quality gate (`apps/server/src/quality/`).

## Status of this branch

Two authors. The first implementer (Codex) committed `524016c` on
`t3/ai-extraction-grounding` and stopped on a usage limit. This session merged
it into the integration tip `4d4255a`, resolved the conflicts, reviewed it
against the acceptance criteria, ran the suites and added two missing tests and
one fix (listed below). **Red evidence for `524016c`'s own tests was not
reproduced** in this session. That work arrived already green; I re-ran it and
used mutations (below) to show the tests can fail.

## What exists

- **One provider path.** `ExtractionPort` (`apps/server/src/ai/port.ts`) is the
  replaceable adapter edge. `bedrock.ts` is the initial EU transport: fixed
  `eu-central-1` endpoints, `redirect: "error"`, a server-held short-lived
  bearer credential (no BYOK, no client secret), a retention check that must
  report `mode: none` before every inference, strict bounded output schema,
  180 s timeout joined with the caller's cancellation signal. No region or
  provider fallback. It is a transport, not model selection or qualification.
- **Grounding.** `ai/structuring.ts` accepts a field only when the provider's
  exact UTF-16 span slices to exactly the claimed value inside the original
  Reference. Anything else becomes an `ai.proposals` entry (`ungrounded`) and is
  never written to `csl`. Search and scoring read only the Check reference
  `fields`, so a proposal cannot reach them.
- **Marking.** `ai.changedFields`, per-field `provenance: "ai"` and the
  `ai-can-be-wrong` notice travel in the contract (`contract-verification/src/ai.ts`)
  and render in `packages/ui/src/ai-provenance.tsx` (web and native share it,
  DE/EN).
- **Adoption.** Only a user field revision (`POST …/revisions`) can put a
  proposal into `fields`; revision 1 stays the immutable AI evidence.
- **Retry and fallback.** Chunks (`configuration.chunkSize`) that fail, time
  out, return invalid offsets or overlapping spans are retried once, then
  structured by the deterministic parser with a visible per-passage fallback
  notice that preserves the exact passage.
- **Eligibility.** Guest: parser, reason `guest`, upgrade offer. Owner without
  `ai-extraction` in the current feature scope: parser, `feature-unavailable`,
  upgrade offer. Eligible Owner but adapter missing or out of bounds:
  `configuration-unavailable`, no upgrade offer, no dispatch. Authority is read
  fresh before dispatch, before publishing a preview and before Check/edit
  creation; an authority failure is `forbidden`/unavailable, never a silent
  parser fallback. Structuring consumes no Quota; only normal billable work
  after the signed preview reserves.
- **Preview receipts.** `ai/receipt.ts` signs the reviewed extraction (text,
  regions, result, expiry, principal) with an in-memory HMAC key so the service
  keeps no manuscript cache. Creating a Check or applying a selection edit
  verifies the receipt and re-checks eligibility; tampered previews are rejected.
- **Activation (ADR-0010).** `ai/activation.ts` enables the adapter in the web
  process only when `SOURCE_TASTER_AI_EXTRACTION` names a live-mode adapter with
  a valid EU/zero-retention declaration **and** the #94 release check passes for
  exactly that adapter, configuration and clean code version. Synthetic-mode
  adapters can never activate. Logs carry only
  `{"code":"ai-configuration-unavailable"}`.
- **One measurement implementation.** The #94 modules moved to
  `apps/server/src/quality/`; `scripts/quality/*.ts` re-export them, so the
  Operator import paths are unchanged and the runtime and the gate share one
  code path.

## Changes made in this session

1. `git merge t3/ai-extraction-grounding` into `4d4255a`. Conflicts:
   `tsconfig.json`, i18n JSON, `check-workspace.tsx`, `reference-actions.tsx`,
   `app.ts`, `web.ts` (both sides kept); `scripts/quality/{configuration,release}.ts`
   (took the re-export side and carried the integration's #117 additions,
   `readConfigurationFile` and the required `loadReport` of `checkRelease`, into
   `src/quality/`).
2. **Fix:** `activation.ts` did not pass `loadReport` to `checkRelease` after
   #117 made it required. Red: `tsc` error TS2741 at `src/ai/activation.ts:30`.
   Green: it now passes `SOURCE_TASTER_LOAD_REPORT`; `tsc` is clean.
   **Behaviour consequence:** AI activation now also needs a passing #117
   fifty-Check replay report. A deployment that sets
   `SOURCE_TASTER_AI_EXTRACTION` without `SOURCE_TASTER_LOAD_REPORT` stays off.
3. **New test, AC "excluded from search and scoring":** the last test in
   `apps/server/test/ai-extraction.test.ts` runs a real worker process against
   fixture sources, creates a Check from a preview with an ungrounded DOI
   proposal, asserts the sources never saw that DOI and the DOI is not in
   `fields`/`results`, then adopts it by a user revision with recheck and asserts
   the sources now see it (positive control).
4. **New test file** `apps/server/test/ai-activation.test.ts` (5 tests): unset →
   off; synthetic-mode never activates; live adapter without the measured
   configuration → off, no warmup; live adapter with a refused release check
   (uncalibrated, no measurements, no load report) → off, no warmup; unloadable
   adapter → only the fixed content-free diagnostic.
5. Test ports made configurable so the suites run on exclusive ports:
   `ai-extraction.test.ts` (`SOURCE_TASTER_TEST_SERVICE_PORT`, was fixed 5002),
   the native spec (`SOURCE_TASTER_E2E_AI_API_PORT` /
   `SOURCE_TASTER_E2E_AI_WEBSITE_PORT`, defaults unchanged) and a
   `test:native-ai` script.

## Red/green evidence

| Check | Red | Green |
| ----- | --- | ----- |
| `activation.ts` after #117 | `tsc -p apps/server/tsconfig.json`: TS2741 `loadReport` missing | clean `tsc` |
| Search/scoring exclusion test | mutation: `ground()` also `Object.assign`s an ungrounded field into `csl` → the new test fails (`expected '10.5555/INVENTED' to be undefined`), as do 3 existing grounding tests | restored → 19/19 |
| Activation refusal test | mutation: ignore `release.releasable` → "refuses a live adapter whose release check fails" fails (`expected {model…} to be undefined`) | restored → 5/5 |
| Inherited `524016c` tests | **not reproduced**, delivered green | re-run green, below |

Both mutations were reverted; `git diff` of `src/ai/` shows only the intended
`loadReport` line.

## Commands and results

Environment: own PostgreSQL 18 container `st70-ai103-d2f868a5` on
`127.0.0.1:5351`; ports 4501/4502. Logs in `.tmp/spec-70-orchestration/103-*.log`.

```sh
export DATABASE_TEST_URL=postgres://verification_test:verification_test@localhost:5351/source_taster_test
export DATABASE_ADMIN_URL=postgres://postgres:postgres@localhost:5351/postgres
export SOURCE_TASTER_TEST_API_PORT=4501 SOURCE_TASTER_TEST_SERVICE_PORT=4502
export SOURCE_TASTER_DOCUMENT_IMAGE=sha256:a36fa02bdeea666e023b219e6bafa4f020833cd703ca1e1e069623cb7a061707
cd apps/server
pnpm exec vitest run test/ai-extraction.test.ts test/ai-activation.test.ts   # 19/19 and 5/5
pnpm exec vitest run test/documents.test.ts test/bibliography-selection.test.ts test/documents-isolation.test.ts   # with the image
pnpm exec vitest run test/structuring.test.ts test/imports.test.ts test/checks.test.ts test/reference-revisions.test.ts test/revision-lifecycle.test.ts test/manual-overrides.test.ts test/corrections.test.ts test/retention.test.ts test/snapshot.test.ts test/lifecycle.test.ts test/batch.test.ts test/exports.test.ts test/comparison.test.ts test/check-events.test.ts test/sse-compatibility.test.ts   # 227/227 incl. the above
pnpm exec vitest run test/quality-gate.test.ts test/quality-release.test.ts test/quality-cli.test.ts test/quality-calibration.test.ts test/quality-targets.test.ts test/quality-dataset.test.ts test/load-release.test.ts
pnpm exec vitest run --config abuse.vitest.config.ts   # 14/14
cd ../web
export SOURCE_TASTER_E2E_API_PORT=4501 SOURCE_TASTER_E2E_WEB_PORT=4502
pnpm exec playwright test e2e/ai-extraction.spec.ts      # 6/6 (en + de)
pnpm exec playwright test                                 # 87/87
pnpm exec playwright test --config bibliographic.playwright.config.ts   # 22/22
pnpm exec playwright test --config abuse.playwright.config.ts           # 4/4
cd ../extension
SOURCE_TASTER_E2E_AI_API_PORT=4501 SOURCE_TASTER_E2E_AI_WEBSITE_PORT=4502 pnpm run test:native-ai   # 4/4
pnpm run test:native                                      # 18/18
```

Also: `tsc` clean in core, contract-verification, ui, i18n, server, web and
extension; `eslint` clean in the same packages; `prettier --check .` clean;
`pnpm --filter @source-taster/i18n i18n:check` validated 418 messages in DE and
EN; `pnpm --filter @source-taster/contract-verification build` regenerates
`dist/**` and `openapi-v2.json` with no diff (nothing hand-merged).

The first focused server run without `SOURCE_TASTER_DOCUMENT_IMAGE` failed 11
document-upload tests with 503. That is the documented fail-closed behaviour of
#89 when the extractor image is unset (see `84-manual-overrides.md`), not a
regression; with the image all pass.

## Environment prerequisites

- `SOURCE_TASTER_DOCUMENT_IMAGE=sha256:a36fa02b…7061707` for the document suites.
- The web and native suites need the controlled Pagefind build and the website
  build (`pnpm pagefind:fetch && pnpm pagefind:build`, then
  `pnpm --filter @source-taster/website build`); the first compiles Rust and is
  slow.

## Honest limits

- **All AI fixtures are synthetic and written by hand at the adapter edge.**
  The acceptance criterion says "recorded AI fixtures"; none are recorded
  provider output and none are approved recordings. The Bedrock adapter is
  exercised only against a synthetic HTTP fake (`quality-gate.test.ts`). Live
  provider behaviour is untested.
- **No model is selected, qualified or activated.** ADR-0010 measurement
  eligibility, private dataset, provider and legal qualification remain open
  (#114, human tickets #116/#136/#138/#140 stay open). Synthetic success is not
  evidence. The synthetic adapter configuration cannot activate in the web
  process, and a live one also needs a calibrated build, a passing #94
  measurement and a #117 load report; the runtime is still `uncalibrated`, so
  the positive activation path is **unreachable and untested** here.
- Contract suites that need the prepared private program (`quota`, `guest`,
  `account`, `owner-deletion`; `SOURCE_TASTER_SERVICE_WORKTREE`) and the web
  `quota`/`guest`/`account`/`sensitive` Playwright configs were not run; no
  private checkout was used.
- Preview receipts use a per-process random HMAC key. With more than one web
  instance a preview signed by one instance fails verification on another
  (`invalid-request`); deploy single-instance or share a key (private-side
  decision).
- No performance targets or budgets were changed. The AC about the uncertainty
  notice, the Guest/Free reason and upgrade offer, one retry then visible parser
  fallback and embedded References are covered by `ai-extraction.test.ts` and
  the DE/EN web and native specs; "upgrade offer" is a message only, no checkout
  is invented.

## Private-side follow-up

- Set `SOURCE_TASTER_LOAD_REPORT` next to `SOURCE_TASTER_AI_EXTRACTION`,
  `SOURCE_TASTER_QUALITY_CONFIGURATION`, `SOURCE_TASTER_QUALITY_EXTRACTION` and
  `SOURCE_TASTER_QUALITY_ROOT`, or AI stays off by design.
- Grant/revoke the `ai-extraction` feature in the quota snapshot `features` list
  (the public side only reads it) and surface the upgrade path there.
- Provision the short-lived Bedrock bearer credential server-side only and run
  the provider/legal qualification (#116/#136/#138/#140) before any activation.
- Decide receipt-key sharing for multi-instance web deployments.
- The previous implementer's PostgreSQL container `st70-ai103-7373c17a` (and
  worktree `t3-7373c17a`) still exist; I did not touch them.
