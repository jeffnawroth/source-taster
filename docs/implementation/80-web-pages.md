# Web reachability and Internet Archive evidence (#80)

Implementation for #70 on `t3/complete-issue-80`, in the orchestrator-prepared
worktree `/Users/jeffnawroth/.t3/worktrees/source-taster/t3-20a4fa4c`.
Resumed the preserved `t3/0f36de3d` checkpoint
`1bd7f2f5f6a5009a911b3bc22fc42e60a8c9d81e` by fast-forward merge. No saved
changes were discarded and no worktree was created. The checkpoint already
contained integrated #87 at `e950acbe95917ebae310040c8a0031fb1b8472ad`.

## Behavior

The Version 2 uncalibrated bibliographic preview routes web References through
owned URL and Internet Archive adapters. A supplied DOI takes the existing
mandatory DOI path first. Outside-coverage CSL types receive Not verifiable with
`outside-coverage` before DOI or URL requests. Version 1 remains frozen.

A matching live URL/title establishes identity. Redirects retain their observed
targets. A definitive 404/410 and a verified archive capture of the original URL
with a matching title produce Exists, with deviations; original input, dead URL,
capture URL and timestamp remain visible. Availability metadata alone cannot
establish archive identity. Only a definitive dead original and a completed empty
archive lookup produce Not found. Missing title, wrong capture, soft-404, blocked
request, timeout, safety refusal and incomplete mandatory DOI verification remain
Not verifiable. DOI identity/conflicts retain their precedence and evidence.

HTTP retrieval validates every destination and all DNS answers, pins the approved
address to a fresh socket, rejects embedded credentials and internal/private
addresses, allows only HTTP/HTTPS, limits redirects to five, and bounds both wire
and decompressed bodies to 5 MiB. Request timers include body completion; redirects
and retries share the Reference deadline. Only bounded observations survive, not
HTML bodies, cookies or headers. The common PostgreSQL budgets, retry settings,
dispatch/commit authority and cancellation seams remain in use. URL and Internet
Archive enablement/settings enter the Search strategy version; changed Verdict
rules have a new Scoring rules version.

The shared workspace renders observations, identity, archive links, missing
evidence and failure explanations in DE/EN for both web and extension. Contract
schemas, generated JavaScript/declarations and OpenAPI are committed together;
public transport retains `AGPL-3.0-or-later OR MIT`. No dependency or license
exception was added. No generated file was hand-merged.

## TDD evidence

The pre-agreed #70 HTTP/SSE and Playwright seams were used with disposable real
PostgreSQL and external HTTP fixtures. The preserved logs under
`/tmp/source-taster-70/` record these actual red/green slices:

| Slice | Observed red | Green evidence |
| --- | --- | --- |
| Live identity | Not verifiable instead of Correct | `80-green-live.log` |
| Archive identity | Not verifiable instead of Exists, with deviations | `80-green-archive.log` |
| Completed negative | Not verifiable instead of Not found | `80-green-negative.log` |
| Private destination | One external request instead of zero | `80-green-private.log` |
| DOI precedence and URL follow-up | Not verifiable instead of Correct | `80-green-doi.log`, `80-green-doi-url.log` |
| HTML entity decoding | Encoded title instead of decoded title | `80-green-title.log` |
| Disabled-source observations | Missing Internet Archive disabled observation | Final 62-case web suite |
| Declared charset | Not verifiable instead of Correct | Final 62-case web suite |
| DE/EN archive presentation | Missing expected visible archive explanation | `80-green-browser.log` |

Corresponding `80-red-*.log` files preserve the failures. On resumption, these
finished slices were not repeated as new TDD work. The added native Chromium
regression exercises the already-implemented shared presentation: both clients
send structured CSL through the published HTTP boundary because the current
free-text form has no CSL type selector. No domain or persistence mock is used.

## Validation on the resumed branch

All commands below ran in this worktree on 2026-10-30. PostgreSQL suites were
serial, with owned disposable databases/roles; no broad suite or unrelated
process/database cleanup was run. Logs in `/tmp/source-taster-70/` are local
execution evidence, not release receipts or private recorded fixtures.

- `SOURCE_TASTER_TEST_API_PORT=3201 SOURCE_TASTER_TEST_WEB_PORT=3202 pnpm --filter @source-taster/server test test/web-pages.test.ts`:
  **62 passed**, 33.04 s (`80-codex-web.log`). Covers SSE/snapshot agreement,
  live/archive/negative/incomplete outcomes, DOI precedence, all enumerated
  uncovered types, redirects, private IP forms, wire/decompression limits,
  timeouts, encoding and disabled-source evidence.
- `SOURCE_TASTER_E2E_API_PORT=3201 SOURCE_TASTER_E2E_WEB_PORT=5271 SOURCE_TASTER_E2E_WEB_FIXTURES=true pnpm --filter @source-taster/extension exec playwright test e2e/web-pages.spec.ts`:
  **2 passed**, 22.0 s (`80-codex-native-final.log`). Real native Chromium side
  panel and web, DE/EN, identical rendered evidence after observation-time
  normalization, expected archive links/provenance, axe and no Reference content
  in extension storage. The saved web-only archive cases also passed in both
  languages (`80-resume-browser.log`, 13.1 s).
- `SOURCE_TASTER_TEST_API_PORT=3201 SOURCE_TASTER_TEST_DOI_PORT=3202 SOURCE_TASTER_TEST_LIFECYCLE_PROCESS_PORT=3202 SOURCE_TASTER_TEST_EXPORTS_PORT=3202 pnpm --filter @source-taster/server test test/doi.test.ts test/lifecycle.test.ts test/exports.test.ts`:
  **35 DOI + 2 lifecycle passed**; export startup failed because PostgreSQL
  reported its remaining connection slots were reserved for superusers
  (`80-codex-regressions.log`). The six export tests did not run in that attempt.
- `SOURCE_TASTER_TEST_API_PORT=3201 SOURCE_TASTER_TEST_EXPORTS_PORT=3202 pnpm --filter @source-taster/server test test/exports.test.ts`:
  **6 passed**, 6.02 s on the narrow rerun (`80-codex-exports-final.log`).
- `pnpm typecheck`: **20 successful tasks**, including the root scripts and
  controlled website build (`80-codex-typecheck-final.log`). All 11 workspaces'
  direct typechecks also passed (`80-codex-direct-typecheck.log`).
- `pnpm lint`: **20 successful tasks**, root scripts and full Prettier check
  passed (`80-codex-workspace-lint.log`). `pnpm i18n:check` passed with **237
  DE/EN messages** and complete paired website content (`80-codex-i18n.log`).
- Direct server, web and extension builds passed, including both Chromium and
  Firefox extension targets (`80-codex-{server,web,extension}-build.log`).
  The public contract was regenerated from source (`80-codex-contract.log`);
  generated artifacts have no drift from the saved implementation.
- `pnpm pagefind:verify` and `pnpm --filter @source-taster/website build` passed
  (`80-codex-pagefind.log`, `80-codex-website.log`). The missing ignored cache was
  restored by a private copy of the integration checkout's controlled Pagefind
  cache, then verified against all source fingerprints, recipe and artifact
  hashes. No gate was bypassed. The initial root typecheck failed on the absent
  cache (`80-codex-typecheck.log`); the completed rerun above passed.
- `pnpm --filter @source-taster/server release:check` still refused with underlying
  exit **78**, explicitly requiring ADR-0006/0025 and #94 qualification
  (`80-codex-release-refusal.log`). This is expected refusal evidence, not a
  passing release check.

The first native run failed before tests because a contract rebuild briefly
removed a generated import (`80-codex-native.log`). After completing builds,
the clean native rerun above passed. No application failure was suppressed.
Prior focused source regressions remain in the saved logs: 61 bibliographic,
26 article-source, 24 book, 76 comparison and 12 journal tests passed. Those
finished suites were read rather than repeated under shared database pressure.

## Acceptance and integration limitations

On 31 October 2026 the client explicitly approved #80's implementation with
synthetic tests and required approved recordings before source activation.
This amends the original implementation acceptance criterion. The public fixtures
remain synthetic; no rights-cleared private recordings/dataset checkout were
supplied. The fixture README documents acquisition/storage requirements for the
original page, availability response and verified capture.
[Issue #140](https://github.com/jeffnawroth/source-taster/issues/140) tracks those
recordings and their successful private replay, and natively blocks activation
ticket #114. This decision grants no source activation or Internet Archive/content
storage or redistribution rights.

Calibration, frozen private-set Quality gates, live source/load evidence, native
Safari/Firefox/ESR qualification, the 50-Reference parity set, translation review
and security/accessibility/legal qualification remain open #70 work. The native
Chromium/axe checks are regression evidence only. DNS rebinding/mixed-answer and
deployment resource enforcement still need the security qualification; the
loopback fixture adapter does not establish those production guarantees.

The uncalibrated profile remains development-only. The source fixture override is
loopback-only and refused in production. Release/qualification, website
publication, source-rights and dependency gates remain intact. No private-service
contract pin needs changing for this ticket.

Integration overlaps are the verification composition, bibliographic DOI route,
Search settings, shared outcome presentation and generated Version 2 contract.
When later contracts conflict, resolve source and regenerate the contract build;
never merge generated declarations/OpenAPI by hand. No pushes, PR creation or
ticket closure were performed.

Final integration synchronization: `git merge --no-edit spec/70-launch-integration`
returned **Already up to date** at
`e950acbe95917ebae310040c8a0031fb1b8472ad`;
`git merge-base --is-ancestor spec/70-launch-integration HEAD` passed. No source
or generated-file conflict occurred. `git diff --check` and the regenerated
contract drift check passed.


## Integration with field revisions (#83)

The #80 implementation was merged into `spec/70-launch-integration` after #83
at `8cdc7697ed3ccb10eb9d5b37920b162c6dc2b56c`. The source implementation tip
was `2f0b428afb1d43336cc2945436445f310c765a90`. Translation conflicts were
resolved by retaining both sets of DE/EN entries. The lifecycle test now accepts
both existing `SOURCE_TASTER_TEST_LIFECYCLE_PROCESS_PORT` and
`SOURCE_TASTER_TEST_CONCURRENT_PORT` overrides, preferring the former when both
are supplied. No application behavior change was needed. Conflicting generated
contract declarations were replaced by a full source regeneration rather than
hand-merged.

Merge verification on 30 October 2026:

- Core and i18n builds, Prisma generation, and contract/server/UI typechecks passed.
- `SOURCE_TASTER_TEST_API_PORT=3701 SOURCE_TASTER_TEST_WEB_PORT=3702 SOURCE_TASTER_TEST_REVISIONS_PORT=3702 SOURCE_TASTER_TEST_EXPORTS_PORT=3702 pnpm --filter @source-taster/server exec vitest run test/web-pages.test.ts test/reference-revisions.test.ts test/exports.test.ts --fileParallelism=false`:
  **74 passed across three files**, in 44.76 seconds. This includes current-field
  export, removed-slot and revision-bound evidence behavior together with the web
  route, outside-coverage/DOI precedence and URL/archive safety regressions.
  Local log: `/tmp/source-taster-70/80-merge-api.log`. Real disposable PostgreSQL
  databases/roles were used serially; no unrelated resources were stopped.
- Regenerating the public transport a second time reproduced every generated
  JavaScript/declaration and both OpenAPI documents byte-for-byte.
- Prettier and ESLint passed for the conflict-resolved lifecycle test; both merged
  catalogs passed formatting. `git diff --check` passed.

These integration checks replay the documented synthetic adapter fixtures only.
The client's 31 October implementation/activation split accepts this evidence
for #80 implementation; approved private recordings and replay remain mandatory
before source activation under #140/#114. Neither the merge nor that decision
claims fixture-storage permission, source activation, calibration, a passed
Quality gate or release qualification.
