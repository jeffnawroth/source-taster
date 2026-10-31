# #102 sensitive Account actions: public phase and private handoff

Ticket #102 (umbrella #70): change the email address and delete the Account with
fresh proof. This document records what the **public** phase built, what it
deliberately does **not** prove, the exact contract the **private** phase must
implement, and the real both-program acceptance that is still required.

**#102 is not complete.** Fresh proof, replacement-address verification, session
revocation, the eight-year billing hold and the trigger for Owner tombstoning
live in the private Account service. Nothing in this phase proves them. Both UIs
are gated off by default, so a deployment without the private phase cannot show
these actions.

Relevant decisions: ADR-0003 (deletion order and tombstones), ADR-0004
(subscription at deletion), ADR-0009 (Quota/billing retention), ADR-0013
(Account, fresh proof, deletion), ADR-0015 (existence-neutral answers), ADR-0019
(sign-in-code mail confirms the new address, security notice to the old one).

## What the public phase delivers

| Area                                                             | Where                                                                                                                                                |
| ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Verification program deletes an Owner (the public half of ADR-0003) | `DELETE /internal/owners/{ownerId}` in `apps/server/src/authority/hosted.ts`; `deleteOwner` in `apps/server/src/checks/store.ts`; migration `20261031030000_owner_tombstones` |
| Contract for the five service calls, web and extension           | `packages/contract-service` (`routes.ts`, `index.ts`, `client.ts`); `packages/contract-internal` (`OwnerDeletionParams`, `OwnerDeletionAck`, `deleteOwner` route) |
| Typed failures for the UI                                        | `sensitiveFailure()` in `packages/contract-service/src/client.ts`                                                                                    |
| Shared web + extension UI                                        | `packages/ui/src/sensitive-account-actions.tsx`, wired through `web-account-workspace.tsx`; DE/EN `sensitive_*` messages                             |
| Gates (default off)                                              | web: `VITE_SOURCE_TASTER_SENSITIVE_ACCOUNT_ACTIONS=enabled`; extension build: `SOURCE_TASTER_EXTENSION_SENSITIVE_ACCOUNT_ACTIONS=enabled` (requires hosted mode and Account sign-in) |
| Extension local state                                            | `apps/extension/src/account-session.ts`: deletion (`deleted` or `in-progress`) removes the stored session credential                                |

### The verification program's Owner deletion

- Caller: only the private service, with a `service+jwt` assertion bound to
  purpose `owner-deletion`, method `DELETE`, path `/internal/owners/{ownerId}`,
  audience/issuer, empty body hash and `exp = iat + 30`. A user access token, an
  assertion of another purpose/path/method, or an unsigned call is `401`.
- One transaction under the exclusive store lock: insert the tombstone
  (`verification.owner_tombstones`, Owner ID and time only) and purge every
  non-deleted Check of the Owner through the existing `purgeLocked` path. That
  path writes the release settlement intents for unfinished slots, deletes
  events/slots/results, nulls the document and deletes queued jobs. Quota
  settlement, content keys and leases are not bypassed.
- Response `200 {ownerId, tombstoned: true}`; repeating the call is a no-op.
- The authority check inside `hostedAuthority.run()` refuses a tombstoned Owner
  **even when the private service still answers `allowed: true`**, so streams,
  reads, creates, queued jobs and in-flight work stop on the next authority
  recheck, within the five-minute access-token lifetime at the latest. In-flight
  work cannot publish a late result.
- The sweep also purges any content of a tombstoned Owner, so content that comes
  back with a restore is removed again before it is served. The private service
  must replay deletions after a restore (see below).
- Nothing is written about History: there is no History backend, and neither the
  tombstone, the ack nor the UI text claims one.

## Private-phase requirements

All paths exist twice: web under `/v1/account/...` (session cookie, `HttpOnly`,
credentials included) and extension under `/v1/extension/account/...` (extension
session credential as `Authorization: Bearer`, no cookies). All bodies are
strict JSON; all answers are the usual `{data, quota}` envelope or
`application/problem+json` with `code` and `i18nKey`. No code, proof or token
appears in any URL.

| Call                           | Request                                                       | Success data                                              |
| ------------------------------ | ------------------------------------------------------------- | --------------------------------------------------------- |
| `POST …/fresh-proof/challenges` | `{action: "email-change" \| "account-deletion", language}`    | `{challengeId, action, expiresIn ≤ 300, resendAfter}`     |
| `POST …/fresh-proof/confirm`    | `{challengeId, code}` (six digits)                            | `{action, expiresAt, expiresIn ≤ 300}`                    |
| `POST …/email-change/challenges` | `{newEmail, language}`                                       | `{challengeId, expiresIn, resendAfter}` (same for every address) |
| `POST …/email-change/confirm`   | `{challengeId, code}`                                         | the updated `AccountSession` (same Account and Owner IDs) |
| `POST …/deletion`               | `{billingRetentionAcknowledged: true, billingRetentionYears: 8}` | `{status: "deleted" \| "in-progress"}`                 |

### Fresh proof (ADR-0013)

- An email code to the current address, valid for at most five minutes, bound to
  **the requesting session and the single action**. The proof is server-side
  state; the browser never receives a token for it. A proof for one action does
  not authorize the other, and is consumed by the action it was issued for.
- The email-change and deletion calls re-check the proof on every call. The UI
  clock is only a display.
- Failure statuses the client maps (anything else is "unknown", never success):

| Situation                                              | Status | `code`                                  | Client meaning               |
| ------------------------------------------------------ | ------ | --------------------------------------- | ---------------------------- |
| No/stale proof for this session and action             | 403    | `fresh-proof-required`                  | back to the proof step       |
| Wrong, expired or reused proof code                    | 400    | `fresh-proof-invalid`                   | stay on the code field       |
| Too many wrong codes                                   | 429    | `fresh-proof-exhausted`                 | ask for a new code later     |
| Wrong replacement code, or address cannot be used      | 400    | `email-change-invalid`                  | identical for both causes    |
| Throttled                                              | 429    | `rate-limited`                          | wait                         |
| Session gone/revoked                                   | 401    | `unauthenticated`                       | session ended                |
| Other denial                                           | 403    | any other                               | session ended                |
| Temporary dependency failure                           | 503    | any                                     | nothing changed, try again   |
| Not implemented                                        | 404/501 | –                                      | "not available yet"; UI hides the actions |

A wrong or expired **code** must never be `401`: `401` means "your session is
gone" and signs the user out locally.

### Email change

- Needs a fresh `email-change` proof. The replacement address gets its own
  code (ADR-0019: the sign-in-code mail also confirms the new address). The
  Account changes only after **both** the current-address proof and the
  replacement code succeed.
- Reject collisions with another Account **without revealing them**: the
  challenge answer is the same for every address; an unusable address just never
  receives a code, and the confirm call fails with `email-change-invalid` like a
  wrong code (ADR-0015).
- Account ID and Owner ID never change. Whether other sessions are revoked on
  email change is a private decision; the public UI keeps the current session.
- Send the security notice to the **previous** address (ADR-0019). The public
  phase does not send mail.

### Account deletion

1. Require a fresh `account-deletion` proof and the exact acknowledgement body
   above (the literals are in the contract; the UI cannot send the request
   without the notice's checkbox).
2. Show/hold the subscription notice (ADR-0004). The public UI shows content,
   eight-year billing-retention and remaining-Quota notices only; the
   subscription notice and any payment cancellation are private/payment work.
3. Run the ADR-0004/0009 sequence. Billing/legal records already retained are
   blocked from other use and kept eight years; they are **not** deleted.
4. Call `DELETE /internal/owners/{ownerId}` on the verification program with the
   `owner-deletion` assertion and durably retry until it acknowledges. The
   tombstone must exist **before** the Account row is removed (ADR-0013).
5. Revoke all sessions of the Account (web and extension). While deletion is
   retrying, answer `{status: "in-progress"}` (HTTP 200) and block Account
   access; the clients then drop the local Account state and **do not** mint or
   fall back to a Guest identity. Answer `{status: "deleted"}` only when the
   Account is gone and all sessions are revoked.
6. A deletion that fails before any irreversible step answers `503` and changes
   nothing; the client keeps the session and all state.
7. Keep an append-only list of deleted Owner IDs and replay
   `DELETE /internal/owners/{id}` for all of them after a restore (ADR-0003).
8. Web cookie POSTs need Origin/CSRF protection; the public phase relies on
   `SameSite=Strict` and does not prove it.

### Guest after deletion

The client behaves like after sign-out: an already-existing Guest identity is
left untouched, nothing from the Account is copied to it (no content, Quota or
grants), and no new Guest identity is minted by the deletion itself. Guest
Checks and Guest Quota are never transferred to the Account either (existing
ADR). **Open point for the parent:** if "do not restore Guest content or grants
on Account removal" should also forbid showing an *existing* Guest identity's own
content afterwards, the clients need an extra reset; the current behavior
follows the sign-out precedent.

## Real both-program acceptance still required

Run against the real private service and real verification program (no fakes at
the HTTP edge), web and extension:

1. Fresh proof: a request without proof is refused; a proof older than five
   minutes is refused (time travel on the service clock); a proof for
   `email-change` does not authorize deletion and vice versa; a proof of another
   session does not work; wrong codes exhaust at the documented limit.
2. Email change: both codes required; a taken address is indistinguishable from
   an unreachable one; Account/Owner IDs and existing Checks remain; the old
   address gets the security notice; old address no longer signs in, new one
   does.
3. Deletion: the notice text (eight years, remaining Quota) is accurate against
   the real retention records; subscription notice per ADR-0004; the retained
   billing records survive; all sessions on web and extension end; an open
   Check stream and a queued/running job stop within the access-token lifetime;
   the content is gone from the real database and a restored backup is purged
   again; the tombstone exists before the Account row disappears; a failure
   between steps retries durably and shows "in-progress" meanwhile; no Guest
   identity is created by the deletion.
4. Licensing: no private code depends on public verification implementation;
   only the transport packages cross.

## Public-phase evidence

Logs are under the root `.tmp/spec-70-orchestration/102-*`.

| Slice                         | Test                                                                                                    | Red                                              | Green                                  |
| ----------------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------ | -------------------------------------- |
| Verification Owner deletion   | `apps/server/test/owner-deletion.contract.ts` (5 tests, real web/worker + PostgreSQL, fake service at the HTTP edge) | `102-owner-deletion-red.log`: 5/5 fail with 404 | `102-owner-deletion-green2.log`: 5/5   |
| Mutation: tombstone check removed from `run()` | same file                                                                              | `102-owner-deletion-mutant.log`: 3 fail          | restored                               |
| Contract and client transport | `apps/extension/e2e-account/sensitive-transport.spec.ts` (5 tests)                                      | written with the contract                        | `102-sensitive-transport.log`          |
| Web UI (EN/DE) in Chromium    | `apps/web/e2e-sensitive/sensitive.spec.ts` (14 tests)                                                   | UI written before this spec; mutation check below | `102-web-sensitive.log`: 14/14        |
| Mutation: acknowledgement gate removed | same file                                                                                      | `102-web-sensitive-mutant.log`: 2 fail           | restored                               |
| Extension panel               | `apps/extension/e2e-account/sensitive-panel.spec.ts` (4 tests)                                          | –                                                | `102-extension-panel.log`: 4/4         |

Honest limits of the evidence:

- The web and extension specs were written after the UI, not before it; the
  server slice and the transport contract were test-first.
- `apps/server/test/support/sensitive-service.ts` is a fake of the private
  service at its HTTP edge. It models the documented contract; it proves nothing
  about the private implementation (proof binding, clocks, mail, revocation,
  billing, the tombstoning trigger).
- The web specs start Vite with `apps/web/e2e-sensitive/vite.config.ts`, the
  app's plugins and proxy without the local information-site preview, because
  that preview needs a Pagefind-built website that cannot be built here
  (`apps/website` build: "A current controlled Pagefind source build is
  required"). The Vite and test ports are chosen free at runtime except 4901
  and 4902.
- Not run: `apps/server` `test:authority` (`guest.contract.ts`) needs the private
  worktree (`SOURCE_TASTER_SERVICE_WORKTREE`) and is both-program; not touched
  by this phase beyond the shared `mountInternalRoutes`, which the public suites
  above exercise.
- The whole extension Account suite (`pnpm test:native-account`) passed 23 of 24.
  The one failure, `panel.spec.ts` "Account streams reconnect with memory
  tokens…", fails identically on the untouched base `56f251f`
  (`102-extension-streams-baseline.log`): that spec's fake service has no
  `/internal/quota/*` handler, so Check creation never starts after the Quota
  merge. It is not caused by #102 and was not changed here.
- Repo-wide `pnpm typecheck` cannot complete in this checkout because the
  website build needs a Pagefind source build; per-package `typecheck` and
  `lint` for ui, i18n, server, extension, web, contract-service and
  contract-internal pass, and `prettier --check .` and `pnpm i18n:check` pass.
