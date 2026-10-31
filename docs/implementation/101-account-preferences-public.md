# #101 Account Preferences — public phase

Implemented under user-invoked implement-spec #70 on
`t3/public-account-preferences`, worktree
`/Users/jeffnawroth/.t3/worktrees/source-taster/t3-27ba91b0`.
Started clean at public integration `512e457`, containing #97/#98 sign-in and #85
Guest Preferences. ADR-0001, ADR-0013, ADR-0016 and ADR-0023 govern this work.
No private code, predecessor code, shared-root changes, nested agents, pushes,
PR changes or issue closure are included.

**Only the PUBLIC phase is implemented. Entire #101 remains incomplete** until
private Account persistence/registration/mail implementation and real
both-program tests pass. The external private HTTP fixture is deliberately
in-memory and proves client behavior only. It is not Account storage, actual
mail-language delivery or cross-program synchronization qualification.

## Behavior

- Dual-licensed service contracts/clients add cookie-only web and cookie-free
  opaque-bearer extension GET/PATCH Preferences endpoints. PATCH is nonempty,
  strict and partial, with closed language/style writes; reads allow a removed
  style for the APA fallback notice. Confirmation carries current client
  Preferences for new-Account registration only; existing Accounts must ignore
  them. Private endpoint/storage semantics are handed off separately.
- A shared web/panel adapter loads Account values on open/refocus/visibility
  return, applies language and document language immediately, serializes this
  client's writes, and fences late replies by session, per-field edit versions
  and ordered reads. Refocus waits for pending writes. It adds no push channel.
  Preferences update without remounting or resetting unfinished Check input.
- Signed-in edits go only to Account PATCH, never Guest storage. On sign-out or
  detected session end the **last displayed values** are copied to that host's
  local Guest store. Expired verification requests remain denied, including
  after Reset/reconnect; local Preference continuity does not restore authority.
  Failed synchronization is visible and offers an authoritative reload.
- Web origin and extension-local Guest stores remain independent, without
  browser sync, Guest-ID binding or Check content. Tokens stay in memory; #98's
  opaque extension credential stays confined to its existing trusted local port.
  Extension sign-in remains disabled by default; no missing backend is enabled.
- The public contract-common style/locale list is canonical for both API style
  schemas and UI options. Server build verifies its pinned renderer-asset map
  against this list. Language never changes style/locale. Existing suggestions,
  report and RTF use the same Preference and server renderer; evidence, Verdict,
  Score, fields and revisions remain unchanged. No export-only style or new
  theme/onboarding feature is added.

## TDD and checks before integration merge

Used the #70-confirmed transport HTTP and Playwright seams. The TDD skill was
applied without requesting an already-confirmed seam again. Local logs are in
this worktree's `.tmp/101/`; they contain new evidence, not recovered old logs.

| Slice | Observed red | Green |
| --- | --- | --- |
| Typed transport | `transport-red.log`: `web.preferences is not a function` | `transport-green.log`: 1/1 |
| Account lifecycle | `lifecycle-red.log`: expected DE, received Guest EN | `lifecycle-green.log`: 1/1 |
| Undefined-only PATCH | `undefined-patch-red2.log`: promise resolved instead of rejected | `transport-final.log`: 2/2 transport cases |
| Existing expiry regression | `account-regressions.log`: old expected store omitted new Guest copy | `account-regressions-final.log`: 16/16 |

Expanded browser cases cover current Preferences at confirmation, existing
Account authority, partial writes, independent Guest stores, immediate language,
refocus/reload, unknown-style notice, unfinished-input retention, rapid writes,
out-of-order reads, outage/retry, expiry copy and late replies after sign-out.
The real Chromium side panel and actual web app exercise both directions of
refocus/update against the external private HTTP fixture. The #98 suite also
covers native Firefox, cookie/bearer separation, memory tokens, permission/
Owner checks, expiry/reset/reconnect, storage failure, browser restart and the
incomplete-backend gate. Its fixture expectations were extended for Preferences;
its verification API and PostgreSQL remain real. Port overrides were added to
that harness so assigned 4801/4802/5381 can be used without occupying #98 defaults.

`render-export.log`: 18/18 existing HTTP/SSE/download cases in
`corrections.test.ts` and `exports.test.ts` passed with real PostgreSQL and
web/worker processes; recorded Data sources are replaced at their HTTP edge.
This includes all eleven rendered styles, RTF, immutable snapshots and exports.
Owned PostgreSQL: container `st101-public-27ba91b0`, PostgreSQL 17 Alpine, local
5481; each harness owns disposable databases/roles. Other resources were untouched.

The first native Preferences run failed because its test profile argument was
missing; the fixed harness passed. One expanded run used an incorrect retry
label, and a transient expiry assertion matched two alert elements; corrected
assertions then passed. A test run overlapped an edit and produced a development
HMR hook-order error; fresh stable-source runs passed. Two attempted test runs
collided with this task's still-running API on 4802 (`lifecycle-final.log`,
`undefined-patch-red.log`); they were rerun serially. These are recorded failures,
not passing test evidence. Static checks also caught typed fixture parsing and
new test-directory inclusion; both were corrected.

## Private phase and limits

[Exact private endpoint/storage/registration/mail requirements and real acceptance
matrix](101-private-preferences-handoff.md) are part of this handoff. Parent must
repin published contracts only after integration/publication and schedule private
work after #99's exclusive workspace is released. No private access was used to
prepare this public contract.

Real Account storage/restart/deletion/export, transactional mail, actual
both-program Preferences, concurrent database writes and private session policy
remain pending. Word/LibreOffice/Zotero acceptance, real supported browser/OS/AT
qualification, human security/legal review, Better Auth transitive clearance,
Quality/source/release gates and CI remain separate. Local fixture evidence does
not satisfy those gates. No activation or full-ticket completion is claimed.

Final merged-tip validation is recorded below.

## Latest integration merge and final evidence

Committed implementation `a4461f0` and merged public integration
`56f251f520792f3e3e808b30c1b598f325f9b47a` (#99 public Quota) as
`dfec6b516ede4ada351130872e8335ecd4a0259b`. `512e457` remains an ancestor.
The only manual conflict resolution combined additive DE/EN message keys; source
interfaces combined cleanly. All four contract packages were regenerated from
the combined source, including the conflicted OpenAPI and auto-merged outputs.
No generated output was hand-merged. Private code/workspaces remained untouched.

The first merged #98 run passed 15/16 and failed its stream case before a Check
was displayed (`merged-account.log`). Using the diagnosing-bugs skill, ranked
missing Quota HTTP responses, response-shape drift and session remounting. The
isolated HTTP probe `merged-stream-diagnosis.log` showed creation expected 201,
received **503**: #99 now requires Quota reservation, while this pre-existing
external private-service fixture returned 404 for that endpoint. Added synthetic
snapshot/reservation responses **only at the external private HTTP edge** and a
persistent 201 assertion before stream checks; the isolated case then passed in
`merged-stream-green.log`. This is fixture maintenance, not real Quota journal or
both-program acceptance, and changes no production enforcement.

A final TDD slice covers an already-expired sign-out response:
`logout-expiry-red.log` lacked the expiry announcement/Guest copy; the shared
controls now signal session end on 401/403 while keeping verification denied.
The full Preference suite passes that behavior. Delayed-response assertions now
wait for response delivery before asserting the retained values. Temporarily
removing the read/edit guards made that case fail with stale DE replacing EN
(`stale-read-mutation-red.log`); restoring the exact original source, confirmed
with `cmp` and an empty source diff, passed (`stale-read-restored-green.log`).
No mutation or diagnostic logging remains in production source.

Final checks use Node 24.14.0, pnpm 12.15.0, Playwright 1.64.1 and Vitest 5.0.5.
All test commands run serially. PostgreSQL URLs target only the owned container
on 5481; account harness overrides are API=4801, service=4802, web=5381.

| Command / scope | Final local evidence |
| --- | --- |
| `pnpm --filter @source-taster/extension exec playwright test --config account.playwright.config.ts` with the three `SOURCE_TASTER_ACCOUNT_TEST_*_PORT` overrides | `final-merged-account.log` |
| `pnpm --filter @source-taster/extension exec playwright test --config preferences.playwright.config.ts` | `final-merged-preferences.log` |
| `pnpm --filter @source-taster/server exec vitest run test/corrections.test.ts test/exports.test.ts` with `SOURCE_TASTER_TEST_API_PORT=4801`, `SOURCE_TASTER_TEST_CORRECTIONS_PORT=4802` | `final-merged-render-export.log` |
| Direct package `typecheck` and `lint`: contract-common/service/verification/internal, ui, web, extension, server; scripts TypeScript | `merged-static.log`, `merged-scripts-types.log`; later ui/extension delta in `final-delta-static.log` |
| i18n and full Prettier | `merged-i18n.log` (366 DE/EN messages), `merged-format.log` |

Final result counts, artifact reproduction, builds and owned-resource cleanup
are appended after completion. No local check is CI evidence.

Completed on the merged source, including the final expiry fix:

- **43/43 focused cases pass:** 16 Account/transport, 9 Preferences/browser,
  18 rendering/export HTTP/SSE/download. See the three `final-merged-*.log` files.
- All eight affected package typechecks/lints, scripts typecheck, 366-message
  i18n check and full Prettier passed; final ui/extension delta checks also passed.
- All four contract builds, verification server build (including canonical
  style/locale validation), web build and Chromium/Firefox extension builds pass
  (`merged-builds-and-generation.log`). Only the usual extension bundle-size
  advisory remains; no bundle-size budget was altered.
- All **58 tracked generated artifacts** reproduce byte-for-byte from combined
  source (`generated-reproduction.log`). `git diff --check` passes.
- Removed only owned container `st101-public-27ba91b0` and its anonymous volume
  (`owned-postgres-cleanup.log`). Harness processes and temporary browser builds
  were closed by their teardown. Shared resources remain untouched.

Private/both-program Preferences and mail/storage acceptance remain pending as
listed above and in the exact private handoff. No CI or release qualification,
full-suite pass, actual Account persistence or complete #101 acceptance is claimed.

Clean-tree release guard also remains closed: direct
`node apps/server/scripts/release-check.ts` exits **78**, refusing the uncalibrated
configuration and missing Measured configuration/location
(`final-release-direct.log`). The pnpm lifecycle wrapper reports the same child
exit 78 but itself returns 1 (`final-release-refusal.log`); this is expected
refusal, not a successful release check. No gate was enabled or weakened.
