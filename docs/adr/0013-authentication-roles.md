---
status: accepted
---

# Keep the Account stable behind email-code sign-in and enforce current authorization beyond token validity

The client accepted this decision on 25 October 2026 in [Authentication and roles](https://github.com/jeffnawroth/source-taster/issues/23), through [F1–F3](https://github.com/jeffnawroth/source-taster/issues/23#issuecomment-6395740353), [F4–F6](https://github.com/jeffnawroth/source-taster/issues/23#issuecomment-6395773943) and [F7–F9](https://github.com/jeffnawroth/source-taster/issues/23#issuecomment-6395822527). Use Better Auth in the private service, an email-code flow shared by registration/sign-in, independent web and extension sessions, and a stable application Account that survives changes of sign-in method. This fits the selected TypeScript/EU database/mail deployment, at the cost of owning authentication maintenance and making protected reads depend on the service as well as writes.

The baseline at acceptance was the approved [requirements specification v3.2](https://github.com/jeffnawroth/source-taster/blob/0b0900653d2b23961975439774ba0ce67267b929/docs/requirements-specification.md); the current approved [version 3.3](../requirements-specification.md) adds the Operator interface amendment recorded in ADR-0014. This authentication decision is not a production implementation, completed security assessment or requirements amendment. The [passwordless research](https://github.com/jeffnawroth/source-taster/blob/6501551713e812b6f1f0de7eb977d6953365d005/docs/research/passwordless-auth.md) is the dated capability evidence; exact versions, deployment behavior and licenses still need qualification. Existing Account/Owner, billing, deletion and Check lifecycle rules remain [ADR-0004](0004-owner-plan-quota.md) and [ADR-0005](0005-check-reference-lifecycle.md).

## Foundation and data boundary

- **Private service.** Better Auth runs in the private TypeScript service on Scalingo Paris and uses its existing PostgreSQL schema/role. No separate managed identity platform or identity-server deployment is selected. Exact stable library, adapter and plugin versions must pass the license, advisory and transitive-dependency rules of [ADR-0002](0002-tech-stack.md); this ADR does not clear a particular release.
- **Mail.** Send through the provider-neutral mail interface using Scaleway TEM, not a new auth vendor's mail service. The Operator owns credentials, authenticated sender configuration, deliverability, security updates and outage handling. Regional storage/processing, mail logs, backups and support access belong in the FA-UEB-13 register under [ADR-0012](0012-hosting-operations.md).
- **Stable application identity.** Keep the application Account ID and personal Owner independent of Better Auth/provider subjects. Map each external identity by its provider/issuer and subject to one Account. Better Auth's own provider-account records are not the application's Account or Owner. Quota, Plan and History keep their existing Owner keys when methods change.
- **Confirmation and concurrency.** Successful email confirmation establishes the Account's usable identity and exactly one personal Owner. Unconfirmed records cannot obtain Account Quota; they have only Guest capabilities. Concurrent confirmations/sign-ins must not create duplicate Accounts, personal Owners or grants. Pending library user/challenge records are not proof of a confirmed Account.
- **UI and contracts.** Bundled sign-in controls remain in the open web app and extension; account-management and Operator surfaces remain private. Expose transport types through the narrow dual-licensed contract seam, not private identity implementation code. The verification program receives opaque IDs, current authorization and tokens, never mailbox credentials or identity-store access.

## Email-code flow

Registration and subsequent sign-in use the same email-code flow. Initial operating settings are:

| Setting | Initial policy |
| --- | --- |
| Code | Six digits; one use |
| Challenge lifetime | Five minutes |
| Failed entries | Three exhaust the challenge |
| Resend interval | At least 60 seconds |
| Replacement | New code supersedes the prior code |
| Storage | Hashed code; no plaintext code in the database or operational logs |

Bind verification to the initiating sign-in transaction and its client. Successful verification consumes the challenge atomically; expiry, replay and concurrent use cannot create another valid session. Delayed mail carrying a superseded code does not revive it. Code paste/autofill, keyboard/screen-reader use and DE/EN messages/emails are part of acceptance. Full enumeration resistance, guessing/send-volume controls and cross-origin protections are assigned to [Security and abuse protection](https://github.com/jeffnawroth/source-taster/issues/40), not implicitly solved by the three-attempt limit.

The numeric code/expiry/resend/session limits are configurable initial operating values, not new specification Initial values or a relaxation of security acceptance. A release must qualify the actual adapter's hashing, transaction, challenge-consumption and send/retry behavior rather than assuming library defaults are safe.

## Sessions and API access tokens

Web and extension sign in separately to the same Account and can remain signed in concurrently. There is no automatic cross-client session handoff. This satisfies FA-KTO-03 after sign-in; it does not merge Guest identities or transfer Guest Checks on registration.

- **Session lifetime.** Survive browser restart, with a server-enforced absolute maximum of 30 days and expiry after seven days without use. Renewal cannot reset the absolute creation time. Inactivity refers to user use, not a background refresh loop keeping an abandoned session alive. Expiry requires a new email code.
- **Web transport.** A host-scoped `Secure`, `HttpOnly` session cookie authenticates requests to the private service. Qualify its SameSite, exact-origin CORS/credential and CSRF configuration against the chosen deployment. A cookie on the service is not a cookie-authentication bypass at the verification API.
- **Extension transport.** The extension uses its own opaque service session credential through the supported bearer-session interface. Persist it only in extension-local storage, without browser sync or web-page/content-script access; expose it only to trusted extension contexts. This storage is not guaranteed encrypted. No private client secret or privileged service key is shipped in the extension.
- **Five-minute access-token layer.** The service issues its own short-lived verification-API access tokens, as [ADR-0003](0003-system-architecture.md) already requires. Obtain/renew these from a current service session; keep them in client memory. Better Auth's bearer session credential is a long-lived session credential, not the five-minute API JWT and not evidence of a rotating-refresh-token design.
- **Binding and validation.** Tokens identify the actor, selected Owner and originating session/principal, with the intended issuer/audience and expiry. The verification API validates signature/algorithm/issuer/audience/expiry via the service JWKS, then asks the service for current session, Account, Owner and permission state. A successful online decision cannot revive an expired token. Clients renew and reconnect/replay SSE using the existing event sequence; tokens never go in event URLs or logs.
- **No cached authority.** Every protected request, including reads, checks current authorization with the service. The service uses authoritative session/block state; cookie-only/stateless session caching must not bypass that check. Neither a still-signed JWT nor stale role/Plan claims are sufficient. Session invalidation, Account blocking, Owner blocking and permission removal override remaining JWT lifetime. A failed status check denies protected access. Existing online Quota checks/reservations still apply to entitlement-relevant actions.
- **Guest path.** Preserve per-environment random Guest IDs, signed five-minute Guest tokens and current Guest authorization through the same service boundary. Guests are not newly registered Better Auth users and do not acquire Account Quota. The per-origin and Guest-total limits remain ADR-0003/0004 and the security decision's responsibility.

The online check refines ADR-0003: it originally mandated online entitlement checks for starting Structuring/Checks/Re-checks/reports while leaving ordinary JWT verification local. Local JWKS validation remains; online session/authorization status is now additionally required for all protected operations. Measure its extra latency and availability dependency in the existing performance/load gates. No latency target is waived by this decision.

## Logout, streams and worker authorization

Provide **sign out here** and **sign out everywhere**. Revoke the corresponding server sessions; removing a local credential alone is insufficient. Sign-out does not delete the Account, block the Owner, end the Plan or refund Quota. Other authorized sessions remain independent.

A stream is not permanently authorized by its opening request. Before further protected content output, including replay/snapshots and downloadable responses, recheck current authority; stop output when it is revoked or cannot be checked. Close the affected stream and stop renewing that client's lease. On reconnect, require valid current credentials and perform the normal Owner/permission checks before replay.

For already accepted work, distinguish the original client session from the continuing Account/Owner authority. Workers check the acting Account, Owner permissions and Check cancellation state before starting queued work and before publishing further results; they do not keep a client's long-lived session secret. Ordinary sign-out removes that client's stream/lease access and follows ADR-0005's lease-expiry rules. It does not silently cancel an Owner's other authorized client activity. Account/Owner blocking cancels the affected running Checks; deletion additionally removes content and writes tombstones. Release unfinished reservations and discard late results under ADR-0004/0005. Previously completed Verdicts keep their billing.

Authorization failures and block/cancel/delete races must be exercised at worker start, upstream dispatch, result commit and event delivery. Already transmitted bytes or dispatched external calls cannot be recalled; late content must not become newly readable after blocking/deletion. The implementation must serialize destructive state changes with its result/output checks rather than treating a previous token validation as permanent permission.

## Roles and Owner isolation

The private service maps roles to named permissions; the client never grants authority. Protected functions enforce the permission and resource's Owner, not just the existence of a signed-in Account.

| Principal | Authority |
| --- | --- |
| Guest | Its own Guest context and permitted free features/Quota; no Account purchases or other Owners' content |
| Confirmed user | Its own personal Owner, Plan/Quota/History according to current entitlements and consent |
| Operator | Only explicitly granted Operator functions; the role is not a blanket right to arbitrary verification content |
| Future organization member | A membership to a selected organization Owner, with its own role/permissions; personal Owner/Plan/History remain separate |

Grant/revoke Operator rights only through an explicitly authorized, audited operational action, never registration, an email domain or client claims. Role changes must not remain effective through stale tokens. Critical Operator actions require fresh proof. The Operator mailbox must use a second factor at its mail provider; this is an operational prerequisite, not implementation of deferred product MFA. The exact bootstrap, grant/revoke and break-glass procedures are recorded in [ADR-0014](0014-operator-administration.md), from [Operator administration and workflows](https://github.com/jeffnawroth/source-taster/issues/24). The client selected a small launch web interface and explicitly approved the consolidated specification v3.3 amendment on 25 October 2026; v3.3 is now the approved baseline.

The reported-wrong-Verdict endpoint remains a specifically permissioned, consent-bound preparation hook (FA-ERG-15/FA-BTR-08). Its future browser accesses the verification API directly; the private backend never receives Reference content. Membership/role changes later must not expose personal History to an institution or block an entire organization Owner merely because one Account is blocked.

## Sensitive actions, email changes and future identity linking

Account deletion, email changes, linking a method and critical Operator actions require renewed proof of control **no older than five minutes**, bound to the requesting session/action. A 30-day session alone is not fresh proof. Reauthentication does not silently prolong the absolute session lifetime.

For email changes, verify the existing Account access and the new address before replacing the login address; reject collisions instead of merging paid Accounts/Owners. Preserve the Account/Owner IDs. A support request, invoice or knowledge of personal details alone cannot transfer an Account. If no confirmed route remains, recover access to the mailbox first. Mailbox compromise or reassignment remains a risk of email-only sign-in: proof of current mailbox control is not proof of the same natural person. This decision does not claim that an email-only system can distinguish a later mailbox holder. Product MFA remains deferred under FA-KTO-06 and its security-assessment trigger.

For adding Google/Microsoft or a university identity later:

1. Reauthenticate the existing Account through a confirmed route.
2. Authenticate the new external identity and explicitly link it after proof of both accesses.
3. Require uniqueness of the provider/issuer/subject mapping; stop on an identity already bound elsewhere.
4. Keep the same Account, personal Owner, Plan and History. Configure implicit email-based linking off. Matching email alone never silently merges Accounts. An existing same-email Account is linked after the safe confirmation flow, satisfying the deferred FA-KTO-08 result without trusting an unverified email claim.

A missing/different institutional email does not require changing the application Account: link from the already authenticated Account using the stable issuer/subject. Joining an organization adds membership to the existing Account, as ADR-0004 defines. Implementing Google/Microsoft, SAML, eduGAIN admission, institution discovery and organization administration remains deferred. FA-ERW-05 launch preparation is the identity mapping/permission seam and these described scenarios. On the FA-ORG-07 trigger, prove an actual test-federation login, metadata trust/rollover, stable subject and no-email/collision cases; a generic SAML plugin is not that proof.

## Outages, deletion and restore

- **Mail unavailable.** Existing valid sessions remain usable while the service/status check works; new email sign-ins and fresh-proof operations wait for working mail. Show a technical failure and retry guidance; an undelivered code does not confirm email or issue a session. Respect expiry/replacement rules for delayed deliveries.
- **Service/status unavailable.** Deny protected access, new token issuance and further protected content output. Do not downgrade a signed-in operation into a different Guest context. Prevent unauthorized work from starting; internal failures follow the technical Status/lease/cancellation rules, not billed Not verifiable (which concerns Data sources). Already completed Verdicts remain completed/billed. Public information and the sign-in-independent statutory cancellation route keep their existing separate scope.
- **Self-delete.** Require fresh proof, show the existing subscription/remaining-Quota and blocked-billing-retention notices, then run ADR-0004/0009's subscription and deletion sequence. Block access while durable retries complete; confirmed verification deletion writes the Owner tombstone before Account removal. Remove identity/session records and stop further access; a library delete hook alone is not the cross-program protocol. Billing retention stays separately governed by the approved requirements and payment decision.
- **Restore.** Before traffic, reapply deletion tombstones, Account/Owner blocks and retention sweeps; complete the existing reconciliation gates. Invalidate all pre-restore sessions and sign-in challenges across both clients, so a backup cannot revive a revoked session or consumed code. Existing JWTs must fail the current session/status check. Require fresh sign-in; preserve surviving Account/Owner identity and legitimate Plan/History. The invalidation mechanism must cover database sessions, cached credentials and signed tokens, not merely clear browser cookies.

## Acceptance evidence before launch

This ADR selects a design; the following are evidence gates, not completed tests or an implementation backlog:

- **Selected release:** exact stable Better Auth/adapter/plugins, Node.js/runtime/database compatibility, dependency licenses/advisories, controlled defaults and transaction behavior. Do not smuggle a pre-1.0 structural dependency into the accepted stack.
- **Email and confirmation:** new/existing Account, concurrent sign-ins, no Account Quota before confirmation, hashed storage, expired/superseded/replayed codes, three wrong entries, delayed/failed mail, enumeration/send-volume protections and working production TEM sender configuration. Measure mail acceptance/session verification on ADR-0012's own availability surface.
- **Native clients:** web and each supported Chromium/Firefox panel environment, including release browser coverage, independent concurrent sessions with equal Account/Plan/History, browser restart, extension update/panel closure, protected storage, cookie/CORS behavior, token renewal/reconnect/replay and logout scopes. Keep authentication material out of content scripts, ordinary page storage, URLs, sync, logs and crash reports. Verify DE/EN and keyboard/screen-reader use.
- **Expiry and revocation:** server clocks, absolute/idle expiry, renewal races, session stealing/revocation, removed Operator permission, cross-Owner access attempts, stale JWTs, SSE output/replay after logout/block/delete, queued and in-flight work, and service partitions. Couple these to the existing 50-Check and latency tests; the added online checks are not free capacity.
- **Continuity/recovery:** preserve one Account/personal Owner when attaching a simulated new method, reject same-email/unverified-claim and existing-subject collisions, check email change and fresh proof, and refuse invoice-only takeover. A simulated identity seam demonstrates launch preparation, not passed live Google/Microsoft or eduGAIN acceptance.
- **Restore/data map:** restore with revoked sessions, consumed codes and deleted/blocked Accounts; prove all prior credentials fail before traffic returns, tombstones/blocks survive and no duplicate Account/Owner appears. Include identity, security/mail logs, backups, support/control-plane and recipient delivery in the provider/data-location review. No verification content is sent in auth emails/logs.

## Consequences and handoff

- **More current authority, more coupling.** Every protected read/output now depends on service authorization. Performance and service outages are measured together; there is no long-lived offline-JWT read fallback.
- **Operational responsibility.** Using the existing service/database/mail avoids a separate managed-auth deployment, but does not outsource patching, mail reliability, secure linking or recovery.
- **Interpretations, not amendments:** FA-KTO-03 means Account equality after separate sign-in, not automatic session handoff; deferred FA-KTO-08 same-email linkage includes proof of both accesses; FA-ERW-05 is preparation rather than live university federation; deferred FA-KTO-06 is not pulled forward by mailbox-provider MFA. The authentication decision did not amend requirements v3.2. No additional change-request candidate is identified.
- **[Operator administration and workflows](https://github.com/jeffnawroth/source-taster/issues/24):** explicit audited role bootstrap/grant/revoke, fresh-proof critical commands, service-side permissions and session revocation; evidence-based support without invoice-only recovery; restore-wide credential invalidation, mailbox second factor/deputy access and auth entries in the provider register.
- **[Security and abuse protection](https://github.com/jeffnawroth/source-taster/issues/40):** OTP/send-volume/enumeration controls, session-secret protection, cookie/CORS/CSRF/trusted-origin configuration, sensitive-action freshness, ownership/linking races, stream/worker revocation and continuous dependency assessment. The chosen email-only mailbox-control risk and extension-local storage trade-off are explicit inputs to the ASVS review.

## Considered options

- **Managed Supabase/Auth0:** remain researched alternatives, but add a service, regional/contractual verification and vendor identity/session constraints to a deployment that already has a private EU TypeScript service, database and mail path. Selection can be revisited without changing application Account/Owner IDs; external identity mappings still require a migration.
- **Automatic web-to-extension handoff:** unnecessary for FA-KTO-03, adds browser callback/credential-transfer complexity; select independent sign-in instead.
- **Email equality as automatic identity merge:** does not prove control of the existing Account and risks collisions/takeover.
- **JWT validity as sole read authority:** permits revoked access until expiry; select current per-request authorization despite extra service calls.
- **Support recovery based on invoices or profile knowledge:** insufficient proof to transfer private History/Quota.
- **Restoring valid sessions/challenges from backups:** can revive revoked credentials and one-use codes; require global invalidation and fresh sign-in after restore.
