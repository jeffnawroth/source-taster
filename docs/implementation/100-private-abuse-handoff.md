# #100 private-service phase: implementation and acceptance still required

Status: **pending**. The PUBLIC phase does not complete #100 or the abuse-control
acceptance of #70. The private workspace remains exclusively owned by #99 and was
neither read nor edited. Implement this phase after that workspace is released.
Keep hosted activation closed and #100 open until the real service and both-program
checks below pass. Read ADR-0003, ADR-0015, the #96/#97 authority handoffs, #98's
private-session handoff and #99's Quota protocol together.

## Exact transport and accounting ownership

Consume the parent's reviewed, published **full integration SHA** for every private
contract consumer, including internal/service/verification packages and evidence
pins. The public dual-licensed source, generated JS/declarations and OpenAPI are
under `packages/contract-{common,internal,service,verification}`. Regenerate private
lockfiles/builds after repinning; no private pin was changed in this phase.

Both internal operations are POST with JSON and an independently signed program
assertion, using the existing verification internal key, `typ: service+jwt`, the
configured verification issuer/service audience, `purpose: abuse-entrance`, POST
method, exact path, SHA-256 of the exact request body, random `jti`, and the existing
30-second assertion lifetime. Reuse the established peer-key custody/rotation and
clock rules. Access tokens, session credentials and Guest capabilities cannot
replace program assertions. The adapter uses a two-second deadline, refuses
redirects, bounds response streaming to 64 KiB and performs no automatic retry.

- `POST /internal/abuse/policy`, body `{}`: return `AbusePolicy` directly, without an
  envelope. Fields: `version`, `cacheMs`, `public`, `shared`. Each budget set has
  `principal: { [planId]: {limit, windowMs} }`, `guest`, `allGuests`, `origin`.
  The last three have the same `{limit, windowMs}` shape. Limits are positive
  integers up to 1,000,000,000; windows are 1,000..86,400,000 ms; cache lifetime is
  1..30,000 ms. Each set must contain at least one Plan and all its principal Plan
  windows must be equal: changing Plan changes the ceiling, never the counter.
  Those defensive bounds are protocol limits, not qualified operating settings.
  The Operator maintains the actual values. Never send hash secrets in this body.
- `POST /internal/abuse/entrances`, body `AbuseEntrance`: `requestId` UUID,
  `program: "verification"`, `policyVersion`, nullable `principal`, and `origins`.
  A principal has opaque UUID `ownerId`, `actorId` and either BOTH `guestId` and
  `guestContextId`, or `sessionId`. Validate the binding using current service
  authority, not an asserted client Plan. Missing/invalid access credentials reach
  this boundary as `principal: null`; use a neutral Guest policy for them. Do not
  disclose whether an email/Account exists. Origin contexts contain `windowMs`,
  epoch-ms `windowStart`, `keyId`, and a 64-character lowercase HMAC-SHA256 `hash`;
  one context per distinct public/shared origin window, at most two.
- Return `AbuseDecision` directly: `{allowed: true, policyVersion, planId}` or
  `{allowed: false, policyVersion, planId, retryAt}`. The Plan is current service
  policy, including on denial; null principals also need a configured neutral
  Plan ID. Denial `retryAt` is an ISO UTC time strictly in the future and at most
  24 hours ahead, the latest deadline among exceeded **shared** budgets. The
  public adapter combines it with its own deadlines. Unknown Plan, stale policy,
  unavailable accounting or malformed decisions deny with 503; never invent an
  allowance or fall back to an old decision. Do not cache decisions.

`public` means verification-only PostgreSQL counters shared across verification
instances. **`shared` means ONE service-owned ledger for the union of both
programs' entrances.** Implement all shared dimensions in one atomic PostgreSQL
transaction, using the same ledger for a private entrance's local call and a
signed public entrance's internal call. The wire `program` literal identifies the
external verification caller; private entrance code calls this same ledger with
its own service provenance. Never call the HTTP front-door limiter recursively
from `/internal/abuse/*`, and never label two separate per-program counters global.
No cross-schema access is allowed.

Count each entrance attempt against every applicable dimension, even if another
dimension denies it. Identity/Plan comes from current service state; principal
uses the stable actor/Account, Guest uses the browser-held Guest ID, and all Guests
uses one shared subject, including unauthenticated bootstrap. Count neither
reference quantities nor worker progress as entrance requests. Public accounting
occurs after a valid service decision, including a service denial; policy/transport
failures remain denied without a fabricated local accounting result. Public
invalid credentials are additionally counted as a neutral unauthenticated attempt;
normal protected-route authentication/current authority still runs afterward.

Durably deduplicate public `requestId` within the same transaction as the shared
increments and decision; a network retry must not double-charge or get a different
allowance. Retain no deduplication/accounting record beyond its fixed purpose
expiry, at most 24 hours. The public adapter currently sends each ID only once.
Reject stale versions with 503. Plan changes retain counts. Changing window widths
or prefix/key schedules must use an activation/drain fence covering outstanding
windows; a policy-version change must not create empty replacement counters.
These are entrance budgets independent of #99 Quota and ADR-0007 source permits.

## Trusted ingress, rotation, retention and restore

Origin is a truncated **trusted network peer IP prefix**, never the HTTP `Origin`
header. Public code currently accepts only Node's socket peer address, normalizes
IPv4-mapped peers and truncates IPv4/IPv6 in memory. It ignores `Forwarded`,
`X-Forwarded-For` and `X-Real-IP`. Qualify a source-preserving ingress arrangement;
a reverse proxy's own address is not proof of individual client origin. Any future
proxy metadata adapter needs an authenticated, explicitly restricted ingress trust
boundary and deployment tests before activation. Do not trust a header merely
because of its name. Qualify edge/provider access logs too: no plain IP storage or
logging is authorized by this feature.

Both programs must share the Operator's prefix settings, origin window definitions
and scheduled origin-hash key material so the same network maps to the SAME shared
counter. These are separate hash secrets, not a replacement for the distinct
asymmetric program-signing keys. Keep them in restricted Operator-owned files,
never clients, contract responses, logs or diagnostics. No fingerprinting or
permanent Account suspension based on shared networks is added.

Public `SOURCE_TASTER_ABUSE_ORIGIN_CONFIG` names JSON with explicit `ipv4Prefix`,
`ipv6Prefix` and `keys: [{id, secret, from, until}]`. `secret` is 32 random bytes
encoded as 64 lowercase hex characters; `from`/`until` are epoch ms. Prefixes must
actually truncate (IPv4 1..31 bits, IPv6 1..127 bits). There are no product defaults.
The synthetic tests' /24, /56 and short rotation intervals are NOT qualified values.
The HMAC input is exactly
`windowMs/windowStart/family/prefixBits/truncatedAddressHex`, where family is 4 or
6 and the truncated address has zeroed host bits (4 or 16 bytes, lowercase hex).
Select exactly one key by `from <= windowStart < until`, not by current request
time. Keep old material until every window selecting it has expired (potentially
up to the largest window after `until`); missing/overlapping selections fail closed.
Coordinate rolling deployments. Public durable window pins reject a changed key
ID/secret or prefix configuration during a live window; the service needs the same
protection across its private and public callers, not a rotation reset.

Counters use fixed UTC epoch windows. Their deadline is the window end, never
extended on increment or denial; the maximum window/deadline is 24 hours. Public
maintenance deletes expired counters and pins at startup and on a one-second
interval, and refuses admission following a maintenance failure until recovery.
This is logical expiry plus background deletion, not proof of a hard real-time
physical-deletion bound during process/DB outages. Qualify and monitor deployment
purge/downtime handling against the 24-hour maximum before launch; neither an
outage nor 30-day security-event retention extends this accounting purpose.

The public database-export command explicitly excludes both tables' data, preventing
long-lived backups from archiving Guest/network counters. Consequently **a restore,
empty replacement database or loss of ledger data must not silently restore live
allowances**. Before any hosted reactivation, the service must fence the restored
verification deployment until all possibly lost public windows have drained (up to
24 hours), or supply a reviewed accounting-preserving recovery protocol. Apply the
same rule to private/shared ledger restore and its deduplication state. This restore
fence is a required private/deployment follow-up. Qualify managed backups, replicas
and WAL/PITR retention too: excluding a routine export does not establish deletion
from provider-managed recovery material. The public hosted loader remains closed and the current tests do not prove such a fence. Existing authority deletion
fences, content encryption/expiry, cancellation and Quota reconciliation remain.

## Required real both-program evidence

Run actual verification and private web/worker processes with separate runtime
roles/schemas, owned PostgreSQL, real signed trust and current authority. Replace
only permitted external providers at their adapter edges. Required cases:

1. Concurrent public AND private requests share exactly each configured principal,
   Guest, all-Guest and origin allowance. Exercise multiple instances/restarts,
   atomic multi-dimension decisions, deduplication/replay and unknown/stale policies.
2. New Guest IDs, cleared client storage, Guest renewal/rebinding, sign-in/sign-out,
   Account/Plan changes and simultaneous DE/EN web/panel requests do not reset the
   relevant aggregate budgets. Bootstrap and unknown/existing Account requests keep
   the same outward behavior; do not disable sign-in-independent cancellation.
3. Observe typed `429`, `Retry-After = max(1, ceil((retryAt-now)/1000))`, latest
   exceeded deadline, exact expiry and DE/EN continuation messages in both clients,
   including SSE admission/reconnect. Existing streams retain current authority
   checks; heartbeats are not new entrance requests or Quota charges.
4. Spoof all forwarding headers, exercise actual IPv4/IPv6 ingress prefixes,
   shared-network users, coordinated key/prefix rollover and missing/removed keys.
   Observe no plain IP/content/credential in persisted/exported/logged material and
   no live allowance reset, fingerprinting or permanent network-based suspension.
5. Policy/accounting/JWKS outages, malformed/oversized responses, wrong-purpose or
   replayed assertions, stale roles/sessions and revocation still fail closed.
   A policy cache is not cached authority. Quota and source budgets remain separate.
6. Advance clocks through the maximum expiry; prove physical purge, backup/restore
   admission fencing, key retirement and recovered deduplication/accounting. Verify
   deployment purge alerts, clock synchronization, ingress/log minimization and
   qualified settings. Public fake-edge evidence cannot satisfy these cases.

Preserve #94's measured-configuration release/activation gate, #140's private
original-page/Internet Archive recordings and source-activation gate, and the
existing #136/#138/#116, Better Auth, legal/security/privacy/browser/load and human
qualification requirements. No source activation or launch approval is implied.
