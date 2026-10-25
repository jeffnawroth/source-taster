---
status: accepted
---

# Send a closed set of transactional e-mails from the private service, and keep every product text in per-program DE/EN catalogs

The client accepted this design on 25 October 2026 in [Transactional e-mails and message catalog](https://github.com/jeffnawroth/source-taster/issues/51), through [F1–F10](https://github.com/jeffnawroth/source-taster/issues/51#issuecomment-6397486113).

FA-KTO-50 requires e-mails in the Account's language for sign-in, purchase with invoice, failed payment and cancellation. FA-KTO-23 and FA-KTO-27 require e-mailed confirmations of consent and cancellation. FA-KTO-52 restricts non-essential e-mail. FA-UEB-01 requires every product text in German and English. [ADR-0012](0012-hosting-operations.md) already chose Scaleway TEM behind a provider-neutral SMTP interface, and [ADR-0002](0002-tech-stack.md) already chose Paraglide JS 2. This ADR decides which e-mails exist at launch, who sends them, how they are built, delivered and localized, and how translation completeness is proven.

The approved baseline remains [requirements v3.3](../requirements-specification.md). The authentication rules of [ADR-0013](0013-authentication-roles.md), the order, consent, cancellation and invoice rules of [ADR-0009](0009-payment-provider-tax-model.md), the failed-renewal rule of [ADR-0004](0004-owner-plan-quota.md), the presentation rules of [ADR-0016](0016-results-presentation-workflow.md) and the report rules of [ADR-0017](0017-accessible-pdf-reports.md) still apply. This is an accepted design. It is not a requirements amendment, final message text, or a completed legal review.

## Launch inventory

The mail module accepts only these message types:

1. **Sign-in code** for registration and sign-in (FA-KTO-02). The same message confirms a new address on an e-mail change, and the previous address receives a short security notice (ADR-0013).
2. **Order confirmation** for every Order. It contains the FA-KTO-23 consent if given, the withdrawal instructions and the version of the terms accepted.
3. **Purchase with invoice** for every paid invoice, including each Pro renewal.
4. **Failed payment**, including a failed first charge at activation (ADR-0004, ADR-0009).
5. **Cancellation receipt** with the time of receipt and the contract end (FA-KTO-27).
6. **DPA conclusion receipt** with agreement ID/version and a protected link to the concluded packet, under [ADR-0021](0021-online-dpa-workflow.md).
7. **Intended subprocessor-change notice** with the reviewed change/objection information, under ADR-0021. Its contractual notice conditions are not established merely by SMTP success.

ADR-0021 explicitly extends the original five-type inventory by these two DPA types; other unlisted types remain disallowed. Both use the existing private outbox and minimal metadata boundary, never verification content or bearer download credentials.

The **withdrawal receipt** is reserved in the catalog, but not active, until the client decides on the change-request candidate below.

Deferred e-mails arrive only with their triggers:

- background-Check completion (FA-ERF-09);
- quota thresholds (FA-KTO-53);
- the renewal reminder (FA-KTO-51);
- the trial notice (FA-KTO-30).

The legal content of the order confirmation, cancellation receipt and withdrawal receipt is set by the FA-UEB-23 review. ADR-0021 additionally requires specialist qualification of the DPA receipt and subprocessor notice/recipient/delivery rules; this is not a completed legal assessment or a claim that FA-UEB-23's enumerated list already names them.

## Withdrawal function (change-request candidate)

Since 19 June 2026, § 356a BGB, which implements Directive (EU) 2023/2673, has required a "Vertrag widerrufen" function for contracts concluded online. The trader must send a receipt confirmation on a durable medium with the content, date and time of the withdrawal. Only the consumer's name, the contract and the confirmation channel may be requested. Requirements v3.3 does not contain this function. Sources: [Noerr on the implementing act](https://www.noerr.com/de/insights/umsetzungsgesetz-zum-widerrufsbutton-veroeffentlicht) and [IHK Schwerin](https://www.ihk.de/schwerin/standort-westmecklenburg/handel-und-stadtentwicklung/widerrufsbutton-im-e-commerce-ab-19-06-2026-7049948).

It is recorded on the decision map as a change-request candidate. Only the client can adopt it, through a new specification version, and adopting it before launch is recommended. This ADR only reserves the receipt e-mail, so that adding it needs no restructuring.

## Ownership and route

- **Private service only:** Accounts, Orders, consent, cancellation and invoices live in the private service, so it sends all launch e-mails. It uses one mail module over the provider-neutral SMTP interface to TEM.
- **Open verification program:** sends no e-mail. A later completion mail would reach the service as an event without Check content.
- **Stripe:** its customer e-mails are disabled: receipts, dunning and invoice e-mails. Source Taster sends its own DE/EN purchase e-mail with the invoice PDF from its own archive attached (ADR-0009). Stripe renders the invoice PDF in the Account language.

## Templates and content

- **Owned templates:** typed TypeScript template functions, with no rendering dependency. Each e-mail has two parts:
  - plain text;
  - simple, accessible HTML: single column, `lang` attribute, real text instead of images, sufficient contrast.
- **Fallback:** React Email (`@react-email/components` 1.0.12) is the fallback if layouts outgrow the owned templates.
- **Minimal content:** only minimal Account metadata, as ADR-0012 requires. E-mails never contain References, document names or Check content.
- **No tracking:** no open or click tracking and no external images. Links point only to Source Taster's own domain.
- **Code privacy:** the sign-in code appears only in the body, not in the subject line, so that it stays out of lock-screen previews.

## Language

- **Account language:** the Account stores DE or EN. It is set from the interface language at registration, follows every interface-language switch while signed in, and is visible in the settings.
- **Exceptions:**
  - A sign-in code uses the language of the requesting interface, because an Account may not exist yet.
  - A cancellation receipt requested without sign-in uses the language of the cancellation page.
  - A DPA conclusion receipt uses the selected agreement language (ADR-0021).
- **Default:** every other e-mail uses the Account language.

## Delivery

- **Outbox:** each e-mail is written to a PostgreSQL outbox in the same transaction as its business event, such as an Order, payment event or cancellation. A per-event idempotency key prevents duplicate e-mails, including after a restore and reconciliation (ADR-0009).
- **Retries:** a worker sends with exponential backoff. A sign-in code is not sent after it has expired or been superseded, and the code limits of [ADR-0015](0015-security-abuse-protection.md) still apply.
- **Bounces:** TEM suppression is honoured, and an undeliverable address shows a notice in the Account. Legally required confirmations are also always available in the product: on the confirmation screen or in the Account. Delivery failure therefore never removes the only copy.
- **Sender identity:** a dedicated sending subdomain with SPF, DKIM and DMARC, and a monitored support address as Reply-To.
- **Mail outage:** follows ADR-0013. Existing sessions stay usable, and new sign-ins wait for working mail.

## Non-essential e-mail

No non-essential e-mail exists at launch. Because the mail module accepts only the closed list of transactional types, a newsletter cannot be sent by accident. A future non-essential type may be added only together with:

- a consent record;
- RFC 8058 one-click unsubscribe that takes effect immediately (FA-KTO-52).

## Message catalog and FA-UEB-01

- **Per-program catalogs:** one Paraglide catalog per program, each in DE and EN.
  - The open verification program holds interface texts, messages, ADR-0016 errors and notices, and Verification report texts.
  - The private service holds the account and billing interface and all e-mails.
- **Completeness gate:** CI fails on any message that is missing or empty in either language.
- **Legal texts:** terms, withdrawal instructions and consent texts are versioned documents under ADR-0009, not catalog strings.
- **Evidence:**
  - the automated completeness check;
  - a recorded sample of 50 texts per language across interface, messages, Verification report, e-mails and invoice, with reviewer, date and build.
- **Scope:** [ADR-0020](0020-website-documentation-help.md) includes website/documentation page completeness and their texts in the FA-UEB-01 evidence. Private/open catalog ownership remains unchanged.

## Acceptance evidence

- Each of the seven selected launch e-mail types is produced in DE and EN in the test, with plain-text and HTML parts. The original FA-KTO-50 acceptance and ADR-0021's DPA receipt/notice evidence remain distinct.
- The order confirmation contains the consent and withdrawal instructions (FA-KTO-23). The cancellation receipt contains the receipt time and contract end and is sent immediately (FA-KTO-27).
- Replayed events and a simulated restore produce no duplicate e-mails. An expired code is never sent.
- A suppressed address shows the Account notice, and the confirmation is still available in the product.
- No non-essential message type can be sent.
- The production sender passes SPF, DKIM and DMARC alignment.
- FA-UEB-01: the CI completeness check passes, and the recorded 50-text sample per language finds no missing translation.

## Considered options

- **Owned templates sent from the private service (chosen):** no extra dependency, one voice and one language rule. Content and delivery stay under Source Taster's control.
- **React Email or MJML:** both are stable and richer, but add a dependency that the selected simple e-mails do not need.
- **Stripe customer e-mails for receipts, invoices and dunning:** less work, but they duplicate our e-mails, follow Stripe's own wording and language handling, and cannot carry the consent and withdrawal content.
- **Sending e-mails from both programs:** would spread SMTP credentials and Account data into the open verification program without need.
- **Sending directly without an outbox:** simpler, but risks lost or duplicated legal confirmations on crashes, retries and restores.
- **One shared catalog for both programs:** would put private texts into the open program, or the reverse, across the ADR-0001 boundary.

## Consequences

- **TEM volume:** at launch volume, the 300 included mails per month should suffice. Each renewal adds one invoice e-mail per subscriber. The TEM Scale upgrade still follows its ADR-0012 trigger.
- **Stripe configuration:** customer e-mails are disabled in the Stripe account, and the invoice locale is set from the Account language. Both belong on the release checklist.
- **Change-request candidate:** the § 356a BGB withdrawal function waits for the client's decision on a specification amendment.
- **Handed-off interfaces:**
  - Final technical-concept synthesis and traceability: map the original five e-mails, the two ADR-0021 additions, the reserved withdrawal receipt and the FA-UEB-01 evidence to their requirements.
  - FA-UEB-23 legal review: sets the legal content of the order confirmation, cancellation receipt and withdrawal receipt.
  - [Website, documentation, help and analytics](https://github.com/jeffnawroth/source-taster/issues/54), [ADR-0020](0020-website-documentation-help.md): website/documentation texts join FA-UEB-01 evidence; support Reply-To and the versioned legal-page footer destinations are defined there. Any future newsletter uses the non-essential gate above.
