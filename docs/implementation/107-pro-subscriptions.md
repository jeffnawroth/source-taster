# #107 — monthly Pro, Plan changes and authenticated cancellation

This implements GitHub #107 under #70. Authority: requirements v3.4
FA-KTO-20/23/26/28/50, ADR-0001, ADR-0004, ADR-0009 and ADR-0019.
The accepted upgrade is subscribing to Pro; the only downgrade is cancellation.
There is no proration, annual interval, trial, carry-over or grace entitlement.
The initial 1,000 References is fixture/catalog data, never a quota constant in
commerce implementation. No sellable price or legally approved packet is seeded.

## Program boundary

Public code contains the dual-licensed subscription API schemas/routes/generated
artifacts, the public Quota `pro` grant kind, and safe web-management forwarding.
Private SOURCE106 owns Orders, provider calls, subscription state, immutable
period evidence, invoice PDFs, legal packets, grants, mail and the management UI.
Private code imports no public verification implementation. References and Check
content never enter payment or mail calls.

`/plan` is the private DE/EN web entry and management page. `/order` remains the
Check-pack entry, linked from `/plan`. Public web and native panel links open
`/plan?language=…`; native links use `noopener noreferrer` and forward no bearer
credential. Purchases and Plan changes remain web-only. Management remains
available through the current web session when paid Quota has expired or payment
has failed. This is not #108's anonymous statutory cancellation route.

## Commerce behavior

- The existing own Order records immutable catalog, price, terms, withdrawal and
  separate consent before collecting payment details. A success redirect grants
  nothing. Current catalog/legal versions and idempotency payloads are checked.
- Pro collects payment means through setup Checkout. With immediate consent it
  starts billing after successful setup; otherwise the first charge waits until
  the 14-day withdrawal deadline or separately recorded later consent. A late
  worker starts a full provider calendar period at actual billing activation.
  Cancellation before activation creates no subscription charge.
- Source Taster creates a monthly, indefinitely recurring provider subscription,
  without a fixed number of renewals. Authenticated cancellation records the
  receipt/end durably and independently of provider availability, then retries
  provider scheduling at period end. It cannot create another term after that end.
- Provider objects are read back and bound to the owned subscription and invoice
  inventory. An invoice must match price/tax, the monthly billing anchor and a
  non-overlapping period. Its invoice ID, not webhook delivery, keys the grant.
- Initial invoices retain the ordered catalog version; renewals select the
  effective period catalog even when delivered before the initial invoice. Each
  period has immutable catalog evidence and the existing restricted invoice
  archive. Missing events reconcile; repeated events/restarts do not grant twice.
- Pro replaces remaining Free Quota. Packs and other grants remain intact;
  earliest expiry wins, with the base Pro grant winning equal-expiry ties.
  Features remain the union of valid grants. Paid-period expiry returns a full
  catalog Free grant for the rest of the Berlin calendar month, without proration.
- Unpaid invoices create no grant or grace. Failed-payment mail uses current
  `Account.language`, with a durable per-invoice outbox key. Purchase mail attaches
  each archived invoice. Cancellation mail includes receipt time and contract end.
  Billing notices follow the current confirmed Account address. Order-mail prose
  uses current Account language while agreed legal text remains
  exactly as recorded. SMTP crash-after-acceptance can resend a stable Message-ID;
  this is not an exactly-once external delivery claim.
- Operator #111 receives narrow actual subscription payment states, without
  exposing billing/legal or verification content. Account deletion confirms
  immediate provider termination before tombstoning and blocks on provider outage.
  The existing Account-language
  records are reused; #101 remains authoritative for Preferences.

## Checkouts, publication and gates

Public source: `t3/pro-subscriptions-plan-changes-cancel`,
`/Users/jeffnawroth/.t3/worktrees/source-taster/t3-09a90f9c`.
Private source: `t3/107-pro-subscriptions`,
`/Users/jeffnawroth/Developer/st-worktrees/source-taster-service-106`.
Public baseline is published `1152dfaa929083896ac6741d36122c807e00b2a8`;
private baseline is published `6537c7c525c391a43d7b55be0a33f0c25ee04c83`.
Latest merged published integration: public
`164e3cbc358e706ee91de0cf66159e117e320e11` and private
`c08dbff70975b1ba54240077460a48caa981389b`, including Account-authoritative
language/Preferences, shared proof budgets, DPA proof revocation and immutable
legal records. The original private #106 tip `1f2c7f3` remains in ancestry. No worktree was
created in the shell, no source/root integration checkout was modified, and no
push, PR, issue mutation, nested agent or real provider/mail call was performed.

The five committed private transport/evidence pins remain at published
`1152dfaa929083896ac6741d36122c807e00b2a8`. #107 contracts use ONLY uncommitted
private workspace/lock overrides pointing to the assigned public checkout.
The parent must publish this public history, then repin the server's three
transport dependencies, the web service dependency and `scripts/evidence.ts`,
regenerate a normal private lockfile, prove frozen installation and verify
installed contract bytes. An unpublished source SHA must never become a pin.

Original SOURCE106 override bytes and its binary patch are preserved under
`.tmp/spec-70-orchestration/107-overrides-original/` in the parent repository.
The receipt and final development override hashes are in private validation.

All configuration/default activation, Selected/Better Auth 1.7.14, dependency
(including the inherited minimatch advisory), source/load/calibration, human
legal/tax, provider, deployment and release-78 gates remain. Synthetic Stripe
fixtures do not qualify live Stripe/PayPal, SCA, issuer challenges, merchant
settings, invoice tax/EN 16931, actual email delivery or legal wording. #108,
#109 and later reviewed withdrawal/refund workflows remain separate extensions.

## Validation

Exact commands, log hashes, tested source boundaries and final integration pair
are recorded in `docs/evidence/107-pro-subscriptions.json` and private
`docs/validation-107.md`. Logs live in the parent repository's
`.tmp/spec-70-orchestration/107-*`. Red failures are retained as red evidence;
setup failures and superseded fixture attempts are not counted as acceptance.

Final local acceptance on that merged pair:

- Private full suite: **96/96**, followed by **12/12** focused subscription cases
  after the current-email correction. No full 97-test run is claimed.
- Both-program Quota/commerce: **10/10**; current authority/SSE/deletion: **33/33**.
- DE/EN commerce browser: **4/4**, including actual-service subscription management
  and axe; actual signed-in native Chromium forwarding: **1/1**.
- Affected typecheck, lint, builds, DE/EN completeness and contract reproducibility
  pass. The release guard retains its expected **exit 78** refusal.

Public implementation/test boundary: `4949e23d410c475608c2b0911aaf7db06c7b3a34`.
Private implementation boundary: `1f69c8ba6e60bd9d78a31c88c75163c63d19ac24`.
Subsequent commits contain handoff/evidence only. The owned PostgreSQL container
on 55421 was removed after verifying its original ID and zero client backends;
5501/5502/5503/5442 have no listeners. Unrelated resources were preserved.
