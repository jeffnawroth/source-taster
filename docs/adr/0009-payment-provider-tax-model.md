---
status: accepted
---

# Sell directly through Stripe and keep Order, consent, cancellation and tax evidence in Source Taster

The client accepted this decision on 25 October 2026 in [Payment provider and tax model](https://github.com/jeffnawroth/source-taster/issues/18). It builds on the evidence in [Payment provider capabilities](https://github.com/jeffnawroth/source-taster/issues/6), at research commit [`92fa0f4`](https://github.com/jeffnawroth/source-taster/blob/92fa0f4820afca5e832eb0a9e0969edb5bb8fa33/docs/research/payment-provider-capabilities.md). It fills the payment seams of [ADR-0003](0003-system-architecture.md) and [ADR-0004](0004-owner-plan-quota.md).

- The Operator is the seller (direct merchant). Stripe processes payments, subscriptions and invoices.
- Source Taster owns everything that the consumer-protection, tax and recovery rules depend on:
  - the Order;
  - FA-KTO-23 consent;
  - the FA-KTO-27 cancellation route;
  - the price catalog;
  - tax evidence;
  - an invoice archive.

This keeps a direct seller's control over invoices and later institutional purchases at about half the fees of a merchant of record. It also means a provider switch never touches the legal records. The cost is retained VAT duties, an e-invoicing integration and a few pages that must be built.

The baseline is the approved [requirements specification v3.2](../requirements-specification.md). This ADR approves no requirement change. Interpretations and change-request candidates are listed under Consequences.

## Seller model and provider

- **Direct merchant, not merchant of record.**
  - Neither Paddle nor FastSpring evidences EN 16931 invoices.
  - As the legal seller, a merchant of record cannot have a separate e-invoicing service added for its invoices.
  - So both fail FA-ERW-06, a must requirement, under any reading.
- **Stripe** with Payments, Billing and Invoicing is the selected provider. Pro is the only recurring Plan at launch, so FA-KTO-26 plan changes reduce to subscribing and cancelling. Stripe adds:
  - payment retries;
  - a hosted payment-method update;
  - subscription events;
  - tax calculation ready for FA-KTO-34;
  - a structured purchase-order field;
  - invoice payment by bank transfer with automatic matching for the deferred FA-KTO-29;
  - SEPA Direct Debit for the deferred FA-KTO-33.
- **Mollie is the named fallback.** It has slightly lower fees and better EU invoicing evidence. Against it:
  - it has no subscription-status webhooks;
  - retries shift charge dates, which conflicts with ADR-0004's grants keyed on the provider period;
  - it carries the purchase order only as a PDF memo.

  Mollie becomes the provider only if the EN 16931 gate below fails for Stripe.
- **Stripe Tax is switched on with FA-KTO-34, not at launch.** Until then a single German rate applies. On the research basket of €1,800 per month, Stripe without Tax costs about €5 per month more than Mollie.

## FA-ERW-06 and e-invoicing

- **Reading.** "The payment provider supports" includes the provider together with a named, contracted e-invoicing integration. Billit is Stripe's named partner.
  - EN 16931 capability is proven at selection.
  - XRechnung validation belongs to the acceptance of FA-KTO-25 when its trigger occurs.
- **Pre-launch gate.** The documented selection decision must contain:
  - a sample invoice with a purchase-order number in the structured field (BuyerReference or order reference) that passes an EN 16931 validator;
  - the named integration with its DPA and its per-document and monthly cost;
  - its behavior for recipients without Peppol.

  If the gate fails, Mollie is qualified the same way.
- **Purchase on invoice** uses Stripe invoices with bank-transfer payment and automatic matching. It is prepared, not offered, until FA-KTO-29 is triggered.

## Order, consent and payment entry

- **Order page (FA-KTO-22).** Source Taster's own page concludes the contract. It shows:
  - the gross price;
  - the separate, unticked FA-KTO-23 consent with the acknowledgment of losing the withdrawal right;
  - the FA-UEB-20 terms acceptance;
  - the button "zahlungspflichtig bestellen".

  The hosted Stripe step afterwards only collects the payment means. No provider label or price placement is relied on.
- **Order.**
  - Every purchase starts from a server-created Order.
  - The Order is bound to the Owner and to immutable versions of the catalog entry, the consent text and the terms.
  - Amounts are validated on the server.
  - The browser's success redirect proves nothing.
  - An Order whose payment fails or is abandoned expires and is never granted.
- **Consent record (FA-KTO-23).**
  - Consent is Source Taster's own versioned record: text version, time and Order.
  - It is the activation gate of ADR-0004.
  - Source Taster sends the confirmation e-mail with the consent and the withdrawal instructions itself.
  - No provider checkout field is relied on.
- **Activation with consent at ordering.** Activation is immediate: Pro is charged and its first period starts at the order, and a Check pack's Quota and validity start at the order.
- **Activation without consent.** This answers the billing-date question that ADR-0004 left open.
  - **Pro.** At ordering, the payment means is stored with SCA but not charged.
    - The first charge and the first Pro period start at activation: when the withdrawal period ends, or earlier on later consent.
    - A withdrawal before activation charges nothing.
    - The provider period stays identical to the Pro grant period.
    - A failed first charge follows ADR-0004's failed-renewal path.
  - **Check pack.** It is charged at ordering, because a card authorization cannot be held for the withdrawal period.
    - Quota and validity start at activation.
    - A withdrawal is refunded in full.
- **SCA (FA-KTO-21).** Acceptance uses a test card that forces a 3-D Secure challenge on a pack purchase and on storing the payment means when Pro is ordered. The later first Pro charge and renewals run off-session and need not be challenged. Exemptions and issuer decisions are the bank's.
- **Payment methods.** Cards and PayPal for both offerings. PayPal for one-time and recurring payments must be enabled on the actual account before launch.

## Cancellation

- **FA-KTO-27 is Source Taster's own public route** for every provider:
  - the button "Verträge hier kündigen";
  - the page "jetzt kündigen";
  - contract identification that does not depend on a login;
  - no retention offers or surveys.
- Source Taster sends the immediate text-form receipt with the time of receipt and the contract end.
- It then schedules the cancellation at Stripe for the end of the paid period, and reconciles if Stripe is unreachable.
- Stripe's customer portal is used only as an extra for payment-method updates and invoices. Its cancellation feature is not the statutory route.

## Data boundary and location

- **Minimization (FA-UEB-12, FA-UEB-16).** Stripe receives only what payment and invoicing need:
  - opaque Owner and Order IDs;
  - e-mail address;
  - billing address;
  - country;
  - VAT ID.

  References, documents, Verification reports and AI prompts never go to Stripe. Card data never touches Source Taster.
- **FA-UEB-13 reading.**
  - Source Taster's own records stay in its EU database and storage: Orders, consent, cancellation receipts, tax evidence and the invoice archive.
  - Stripe and the e-invoicing integration are entered in the service-provider register with location, role (processor or independent controller) and transfer safeguards.
  - EU-only storage at the provider is not a selection condition.

## Catalog, invoices and tax evidence

- **Catalog (FA-KTO-10, FA-KTO-20).**
  - Source Taster's versioned catalog is the source of truth for Plans and Check packs: gross price, Quota and validity.
  - Every Order references one immutable catalog version.
  - Stripe prices are created from the catalog, never edited independently.
  - A new pack therefore needs no release.
- **Invoices (FA-KTO-24, FA-BTR-06).**
  - Stripe numbers and issues the invoices.
  - Source Taster archives each invoice's PDF and structured data in its own EU storage. That copy serves the account invoice list and the accounting export.
  - The retention of FA-KTO-04 therefore survives a provider switch or provider-side deletion.
- **Tax evidence per purchase.** From the first purchase, every Order keeps a snapshot of:
  - billing country;
  - the payment means' country as reported by Stripe;
  - for businesses, the VIES validation result and time;
  - tax rate, net, tax and gross amounts;
  - the Stripe object IDs.

  IP addresses are not stored. Switching to destination VAT is therefore calculation logic, not a data migration.
- **VAT trigger (FA-EIN-03, section 19).** The monthly review measures the legally relevant quantity:
  - net sales to consumers in other EU countries;
  - in the current and in the preceding calendar year;
  - including the Operator's other qualifying sales.

  €8,000 starts building FA-KTO-34. FA-KTO-34 must be live before €10,000 is reached, because destination VAT applies from the sale that crosses the threshold.

## Payment events and reconciliation

These extend ADR-0004's business-object keys and reconciliation.

- **Webhooks.**
  - Incoming webhooks are signature-checked and stored durably before acknowledgment, then processed from a queue.
  - Both the event identity and its business effect are deduplicated: one paid invoice grants one period or pack.
  - Authoritative state is read back from Stripe where order matters.
- **Grants.**
  - Nothing is granted on invoice creation, on an open payment or on a pending SEPA mandate.
  - Outbound charge, subscription and refund calls carry idempotency keys.
- **Reconciliation.**
  - The periodic and post-restore reconciliation of ADR-0004 also compares Orders, invoices, archive copies, consent records and cancellation receipts with Stripe.
  - It suppresses duplicate grants, e-mails and charges before paid actions reopen (FA-UEB-45).

## Considered options

- **Paddle Billing as merchant of record**, rejected: it has no EN 16931 evidence (FA-ERW-06), it charges about 10.6 % in USD, the seller to German buyers is UK-based, and its customer data sits with controllers outside the EU.
- **FastSpring as merchant of record**, rejected for the same FA-ERW-06 gap. It also has quote-only pricing, no invoice checkout for auto-renewing subscriptions and an unclear German-buyer seller.
- **Stripe invoices alone, without an e-invoicing integration**, rejected because Stripe evidences no EN 16931 output itself (FA-ERW-06).
- **Mollie as primary**, rejected in favor of Stripe's subscription events, retries and structured purchase-order field. It is kept as the named fallback.
- **Provider-hosted order and cancellation screens**, rejected: none evidences the exact FA-KTO-22 button and price placement, and portal cancellation does not satisfy FA-KTO-27.
- **Charging Pro at ordering when activation is delayed**, rejected because the provider period would no longer equal the Pro grant period.
- **Stripe Tax from launch**, rejected until FA-KTO-34 is triggered.
- **Provider catalog or provider invoice storage as the only record**, rejected because Operator edits, retention and a provider switch need Source Taster's own versions and copies.

## Consequences

- **Pre-launch gates:**
  - an EN 16931 sample invoice with a structured purchase-order number and a named integration (Mollie if Stripe fails);
  - PayPal one-time and recurring enabled on the actual Stripe account;
  - the actual legal entity, EUR settlement and account approval.
- **Legal review** (FA-UEB-23):
  - the two-step flow of own order page then hosted payment;
  - delayed activation and the first-charge rule;
  - withdrawal for an ongoing Pro subscription after consent;
  - cancellation identification without login.
- **Tax advisor** (FA-KTO-24):
  - the tax logic;
  - the location evidence and the conflict rule between billing and payment country;
  - reverse charge for EU businesses with a VAT ID;
  - the threshold measurement including the preceding year and other sales;
  - the retention schedule for archived invoices.
- **Requirements interpretations and change-request candidates** (none approved; recorded on the map):
  - FA-ERW-06: "provider supports" includes a named integration, with EN 16931 at selection and XRechnung at FA-KTO-25 acceptance;
  - FA-KTO-21: the SCA acceptance reading above;
  - FA-KTO-26: with Pro as the only recurring Plan at launch, "upgrade, downgrade" is accepted as subscribing to and cancelling Pro;
  - FA-UEB-13: payment data held by providers is governed by the service-provider register;
  - section 19 and FA-KTO-34: the trigger measures net cross-border consumer sales in the current or preceding year, and FA-KTO-34 must be live before the threshold;
  - FA-KTO-04: OSS records need 10 years against the 8 years in FA-KTO-04, once OSS is used;
  - FA-KTO-23: withdrawal semantics for an ongoing subscription.
- **Handed-off interfaces:**
  - [Operator tools without a dedicated interface](https://github.com/jeffnawroth/source-taster/issues/24):
    - catalog editing and versioning;
    - refunds;
    - invoice corrections;
    - the monthly VAT-trigger report;
    - cancellation-receipt and reconciliation exceptions;
    - the FA-BTR-06 export from the invoice archive and tax snapshots.
  - [Hosting and operations](https://github.com/jeffnawroth/source-taster/issues/22):
    - EU storage and backup of the invoice archive;
    - the durable webhook inbox;
    - post-restore payment reconciliation;
    - Stripe and the e-invoicing integration in the service-provider register.
  - [Authentication and roles](https://github.com/jeffnawroth/source-taster/issues/23):
    - the opaque Owner ID is the customer reference at Stripe;
    - ordering requires a signed-in Account, because ADR-0004 gives a Guest no purchases;
    - the cancellation route must work without signing in.
