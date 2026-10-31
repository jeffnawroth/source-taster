# #101 private Account Preferences handoff

This is a **public-only implementation handoff**, not storage/mail/sync acceptance.
#101 remains incomplete. No private checkout was read or changed; #99 exclusively
owns that workspace. Parent must schedule the private phase after it is released.
ADR-0023 governs the transitions, including its explicit sign-out/session-end rule
(copy the last displayed values to Guest storage). The issue's shorter wording
must not be used to restore older pre-sign-in values.

## Public contract to implement

Repin the service and all contract consumers to the final published public SHA
reported by the parent, including its lockfile and evidence pin. Regenerate,
never hand-merge generated contracts. New project-owned transport declarations
remain `AGPL-3.0-or-later OR MIT`; UI/lifecycle implementations remain AGPL.

| Operation | Web cookie endpoint | Extension opaque-bearer endpoint |
| --- | --- | --- |
| Read | `GET /v1/preferences` | `GET /v1/extension/preferences` |
| Partial update | `PATCH /v1/preferences` | `PATCH /v1/extension/preferences` |

Success uses the existing envelope with `data: { language: "de" | "en",
citationStyle: string }` and the existing Quota slot (never grant Quota here).
PATCH input is strict, nonempty, and contains only `language` and/or
`citationStyle`. Write language is DE/EN; write style is one of the eleven closed
identifiers in `contract-common`'s style/locale manifest. No theme, onboarding,
Guest ID, Owner override or Check content is accepted. Reads permit an old,
removed style string so the client can use APA and show the translated notice.
They do not silently rewrite that stored value on read. A user-selected valid
style clears the notice and writes the selected style.

Declare/return RFC 9457 Problems: 400 invalid input, 401 missing/expired session,
403 current authority denied, 429 limit, 503 unavailable. Apply exact trusted
origin/CSRF policy, response CORS, `Vary: Origin`, and `Cache-Control: no-store`
on successes and Problems. PATCH must be included in preflight allow methods.
Web authenticates only by its host-scoped Secure HttpOnly cookie. Extension
routes omit cookies, consume only the independent extension session bearer and
must reject web cookies, transaction secrets and verification-API JWTs. Web
routes reject extension credentials. Preserve #97/#98 qualified-origin gates;
this change adds no extension host or scripting permission.

## Private persistence and registration

- Store both fields on the stable **Account**, not the personal Owner, session,
  Guest, browser or verification database. The language is **the same field used
  for Account transactional mail** (ADR-0019), not a second mail-language setting.
- Validate closed values before writes. Atomically update **only supplied
  columns**, under current session/Account authorization. Two clients updating
  different fields must retain both writes. Same-field conflicts use the last
  committed write. Do not read/merge/replace a whole stale Preference record.
  Return the authoritative post-write values; no push channel is needed.
- New `preferences` on both web and extension sign-in confirmation is optional
  for compatibility with older callers. Current public clients always send their
  **current** language/style at confirmation, including changes since requesting
  a code. Adopt it atomically **only when creating a new Account**. Existing
  Account confirmation must ignore it completely; do not merge Guest values.
  Old callers need the challenge's negotiated language and APA for creation;
  migrate existing Accounts with their existing authoritative mail language and
  APA. Do not reset an existing Account's language to the challenge language.
- Bind creation/initialization to the consumed challenge and same transaction
  that establishes the unique Account/personal Owner. Concurrent registration,
  resend, replay and late replies cannot duplicate or reset Preferences.
- Existing-Account sign-in code mail uses its Account language. New registration
  mail uses the initiating client's negotiated language before an Account exists;
  subsequent mail uses the Account language from creation/current preference.
  Qualify outbox scheduling/retry semantics explicitly: choose current Account
  language at message materialization, retain that rendered message consistently
  across delivery retries, and never create a separate mutable mail preference.
- Include Preferences in Account data export and delete them with the Account.
  Preserve tombstones/restore fences so deleted Accounts/sessions cannot revive.
  No Check content, local onboarding marker or Guest identifier belongs here.
- Reads/refocus and background token renewal do not extend idle session expiry.
  Foreground settings activity keeps the existing activity policy and absolute
  limit. Current authority, block/delete/revoke/restore and service outages must
  fail closed. An Account operation must never retry as Guest.

## Public lifecycle supplied

Both hosts use one shared adapter: read at Account opening and on window focus or
visible-document return; send partial writes immediately; keep language/document
language immediate. Local writes serialize to preserve their order. Session and
per-field edit versions plus ordered reads fence late replies. Refocus waits for
pending writes. Unknown styles display APA with notice. Only Guest changes and
sign-out/session-end copies use the host's Guest store. Web origin and trusted
extension-local stores stay separate; no browser sync or Guest-ID binding.
Access tokens stay in memory; extension session credentials retain #98 storage.
Preference changes re-render the existing suggestions/report/RTF paths from
stored evidence; they never change Verdicts, Scores, field revisions or results.
Export and main workspace share one style setting; machine-readable exports stay
style-neutral. No theme/onboarding feature or persistent Check content is added.

## Required real acceptance before accepting all of #101

Use #70's confirmed HTTP/SSE/download seam with **real PostgreSQL and the actual
private service**, captured mail transport, and external provider/time fixtures.
Use actual web and native extension clients for client-only behavior. The public
in-memory HTTP fixture is not real Account persistence, mail or synchronization.
Run focused serial suites on owned resources and record exact SHAs/commands.

1. New registration from each client adopts its current values; delayed code,
   changed Preferences after code request, concurrent confirmation and replay
   preserve one Account/Owner and correct initialized fields. Existing-Account
   sign-in in both directions applies saved values and leaves them unmerged.
2. Sign in independent web/extension sessions to one Account. Change either field
   from each client and verify the other on reopen/refocus, browser restart and
   actual service restart. No real-time push is expected. Exercise concurrent
   different-field writes, same-field last commit, and delayed/reversed replies;
   preserve unrelated fields, current input and evidence.
3. Reject empty/unknown-field/invalid-language/style PATCHes through real HTTP;
   demonstrate a migrated removed style falls back to APA with notice. Validate
   canonical eleven-style locale mapping, language/style independence and
   immediate DE/EN document language in both clients.
4. Sign out here/everywhere, expire idle/absolute sessions, revoke/block/delete,
   partition service/JWKS and restore old session backups. Copy **last displayed**
   values into each client's own Guest store on session end without restoring old
   values. Late reads/writes cannot change Guest/another Account or revive tokens.
   Reconnect/reset/retry must never downgrade a failed Account operation to Guest.
5. Through real captured mail, verify new-registration negotiation, existing
   sign-in mail and every active transactional mail type after changing the
   Account language from either client, including outbox retry/concurrent changes.
   Prove a second language field was not introduced through API behavior.
6. Observe Account data export includes Preferences and deletion removes them;
   surviving sessions/restore cannot read them. Guest IDs, Check content and
   onboarding markers must not be attached to Account Preferences or mail.
7. With actual stored current/History Checks, change all eleven styles and inspect
   suggestions, Verification report and RTF downloads. Compare immutable evidence,
   Verdicts, Scores, committed fields/revisions and originals before/after. Export
   style edits must change the same Preference. Qualify RTF in Word/LibreOffice and
   CSL-JSON/BibTeX in Zotero under existing release/browser gates.
8. Re-run #85 Guest isolation, #97 cookie and #98 bearer/security/expiry tests,
   typecheck/build both programs and regenerate matching artifacts after repin.
   Preserve disabled incomplete-backend/release/source gates until private and
   both-program acceptance actually pass. Parent owns activation and issue closure.
