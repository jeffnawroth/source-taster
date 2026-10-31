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
