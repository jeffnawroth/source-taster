# #106 Check pack purchase

The public branch starts at `6faa4db0cd7eec58fd865d5adce03f0adbd63da8`
(the prepared integration worktree). Commerce implementation and its Order page
remain in `source-taster-service`, under ADR-0001. Only transport contracts,
client links and both-program acceptance live here.

## Contracts and clients

- `contract-service`: versioned Check-pack catalog and localized legal packet;
  binding Order request; own Orders with durable confirmation, payment and
  Activation status; authenticated archived-invoice PDF download. The Order
  request has an operation key, catalog/legal versions, required terms acceptance,
  separate immediate-start choice and billing details. Clients cannot supply a
  price, Quota amount, payment state or grant.
- `contract-common`: Quota grant display adds `check-pack`. Internal and
  verification artifacts were regenerated using their package build scripts.
- Hosted web and extension hosts provide `/order?language=de|en` on the private
  service. The shared Quota and AI upgrade offers use this destination. The
  extension opens a web tab and sends no extension credential to that page;
  purchasing uses the independent web session.
- The shared Account controls include a DE/EN Plans/Check-packs link, even before
  the Quota warning threshold. No provider code, private UI or commerce domain
  implementation is bundled into the extension or public web app.

## Private integration

Use private worktree
`/Users/jeffnawroth/Developer/st-worktrees/source-taster-service-106`, branch
`t3/106-check-pack`. The service extends the existing `quota_catalog` with priced
Check-pack versions and creates grants/credit entries in the existing Owner
Quota journal. There is no second balance.

The private worker drains a durable signature-verified webhook inbox, reads back
paid invoices and their association with stored Checkouts, archives PDF and
structured invoice data, and activates grants once per Stripe invoice. A
success redirect does not grant anything. Without immediate-start consent,
Activation waits until the 14-day withdrawal period has ended; the pack's full
validity starts at Activation. Order/purchase mail uses a durable outbox, the
SMTP port and an attached archived invoice PDF. The private handoff describes
configuration, retry/reconciliation behavior and remaining limits.

Private tests use uncommitted workspace overrides pointing at this public
worktree's contract packages. Do not commit those overrides. After this public
commit is published, replace the commit segment in these private pins with the
public handoff commit SHA (reported by the implementation agent):

- `apps/server/package.json`: `@source-taster/contract-internal`,
  `@source-taster/contract-service`, `@source-taster/contract-verification`.
- `apps/web/package.json`: `@source-taster/contract-service`.
- `scripts/evidence.ts`: `contractCommit`.
- Regenerate `pnpm-lock.yaml`. No implementation package crosses the boundary.

## Local evidence

Logs: `/tmp/st106-*` on the implementation machine. Own PostgreSQL 18 container
`st106-commerce-pg`, port 5451; application ports 5601/5602. Fixtures create and
remove only their own databases/roles. The container is removed after validation.

- `st106-commerce-red1.log`: catalog HTTP 404 before implementation.
- `st106-commerce-red2.log`: a lost webhook left Quota at 400 instead of 700;
  `st106-commerce-green2.log` passes after Checkout reconciliation.
- `st106-browser-red.log`: missing Order page; `st106-browser-green.log`: DE/EN
  binding-page behavior and axe checks pass.
- `st106-commerce-life.log`: private API lifecycle regressions (4 tests).
- `st106-both-commerce.log`: both real programs; paid pack appears in the
  verification Quota API, then a real Check consumes one Reference through the
  existing settlement protocol. This test is part of `test:quota`.
- `st106-extension-link.log`: native Chromium panel opens the web Order page
  without sending an extension credential or calling commerce APIs in-panel.

Final integration-tip regression results are recorded below before handoff.
The extra lifecycle and extension-forwarding tests were added after the first
implementation, so their initial green runs are regression evidence, not
additional red/green cycles.

## Limits

Business VAT-ID validation, reverse charge and the EN 16931 integration belong
to #109; Operator catalog editing belongs to #112. This slice stores the supplied
VAT ID and explicitly records that VIES validation has not occurred. Its test
price is fixture data, not a chosen commercial price. Legal packets and the
merchant's inclusive German tax-rate ID must be configured in the private
service; no default legal copy or sellable catalog row is installed.

The tests use the local fake's pinned Stripe REST/webhook protocol fixtures.
They do not perform live Stripe, PayPal, issuer/SCA or SMTP interactions.
