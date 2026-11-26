# #257 (Q05): lawyer review packet and the improved legal drafts

Part of #70. This is the agent part of the legal review that Q05 in the [technical concept](../technical-concept.md) requires. It does two things: it brings the eight legal drafts to a state a specialist can review, and it collects every question that only a lawyer can answer, with the withdrawal function first. It is not legal advice. Every text stays `"status": "draft"` with `approval: null`, and no review in `apps/website/publication.json` is set.

## What changed in the repository

| Change                                                                                                                                  | Why                                                                                          |
| --------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| New version `draft-2026-11-20.1` for `legal-notice`, `privacy`, `terms` and `withdrawal`, in `de` and `en` (8 files).                    | The privacy draft covered the information site only (finding F-1 in [#253](253-provider-register.md)). |
| `apps/website/publication.json` points every document at the new version.                                                               | Version files are immutable, so a new version is the only way to change the text.             |
| `draft-2026-10-26.1` is kept unchanged and stays addressable.                                                                           | Earlier references to it must keep working.                                                  |
| `apps/website/e2e/design.spec.ts` and `website.spec.ts` name the new version.                                                           | Both tests pin the current version string.                                                   |

Not changed: `reviews.*` (all `null`), `domain`, `supportAddress` and the seller fields (all `null`). The publication gate (`pnpm --filter @source-taster/website publication:check`) therefore still refuses to publish, which is intended. No seller, address, price, register number or provider contract was invented. Every such value is a bracketed placeholder in the text.

## How the drafts answer the #253 findings

| Finding | Where it is answered                                                                                                      |
| ------- | ------------------------------------------------------------------------------------------------------------------------- |
| F-1     | Privacy is restructured into controller, scope, site, Guest, Account, extension, data sources, AI, hosting, backups, purchase, support, retention, rights and transfers. |
| F-2     | A data-source paragraph names the recipients, what they receive, their country, and that they are independent recipients, not processors. |
| F-3     | Hosting names Scalingo, Scaleway and Better Stack as placeholders with locations, and states the 24 h and 30 day periods. The text does not say that no IP address is processed. |
| F-4     | An AI paragraph states the requirements (EU, no training, no storage) and keeps the provider as a placeholder (#159).      |
| F-5     | A purchase paragraph covers the payment provider, e-invoicing placeholder, e-mail and the 8-year invoice retention.        |
| F-6     | A backup paragraph states 6-hourly exports, 312 h lock and 14 days, and marks the erasure interaction for review.          |
| F-7     | A retention overview paragraph lists every period.                                                                         |
| F-8     | Site, web app and extension storage are stated separately.                                                                 |
| F-9     | Support keeps the 12 month rule and adds a mailbox placeholder.                                                            |
| F-10    | A rights paragraph and placeholders for controller, officer and authority.                                                 |
| F-11    | The withdrawal draft states honestly that the withdrawal function does not exist yet (question 1).                         |

One fact from the code that the draft does not need to hedge: the abuse limiter in `apps/server/src/abuse/origin.ts` stores a keyed hash of a truncated address prefix per time window, not a raw IP address. The privacy text says only "counters", so the reviewer decides whether that wording needs to be stricter or can be more specific.

## Primary-source check

Checked on 2026-11-20.

| Statement relied on                                                                                                           | Source read                                                                  | Result                                                                                         |
| ----------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| § 356a BGB: a "Vertrag widerrufen" function (or an equally clear label) on the online interface, available through the whole withdrawal period; the consumer gives or confirms name, contract identification and the electronic means for the receipt; a second function (for example "Widerruf bestätigen") submits it; the trader sends a receipt on a durable medium without delay, with the content, date and time of receipt; a withdrawal sent through the function counts as received in time. | gesetze-im-internet.de, § 356a BGB (read as a summary of its five paragraphs) | Confirmed.                                                                                      |
| Art. 246a § 1 (2) EGBGB requires the withdrawal information to cover, where it applies, the existence and placement of the § 356a function. | gesetze-im-internet.de, EGBGB (text search of the full page)                | Confirmed. The withdrawal text must say so once the function exists.                           |
| § 312k BGB: button "Verträge hier kündigen", confirmation page, final button "jetzt kündigen", immediate text-form receipt with time and end date. | gesetze-im-internet.de, § 312k BGB                                           | Confirmed. This matches FA-KTO-27 in ADR-0009.                                                 |
| § 5 (1) DDG: items 1 to 8 (name and address, fast electronic contact, authority, register, profession, VAT ID, liquidation, media). | gesetze-im-internet.de, § 5 DDG                                              | Confirmed. The notice follows items 1 to 6.                                                    |
| § 36 VSBG: duty to state willingness to take part in consumer arbitration, with a size exemption for the first item only.      | gesetze-im-internet.de, § 36 VSBG                                            | Confirmed. The notice has a placeholder statement.                                             |
| The EU online dispute resolution platform was discontinued: Regulation (EU) 2024/3228 repeals Regulation (EU) No 524/2013 from 20 July 2025. | Search results summarising the regulation and Commission notices (secondary) | Consistent across sources. The EUR-Lex text was not retrievable with the tooling used, so the lawyer should confirm. The notice contains no link. |
| Directive (EU) 2023/2673 adds Article 11a to Directive 2011/83/EU, transposition by 19 December 2025, application from 19 June 2026. | Law-firm and compliance-vendor summaries (secondary). EUR-Lex was not retrievable. | Consistent across sources, not read in the primary text. § 356a BGB itself was read in the primary text. |

## Questions for the lawyer, in order

### 1. The online withdrawal function (change-request candidate C05)

The facts. § 356a BGB is law since 19 June 2026 ([ADR-0019](../adr/0019-transactional-email-catalog.md#withdrawal-function-change-request-candidate)). The requirements specification v3.3 does not contain the function, so nothing implements it. [ADR-0019](../adr/0019-transactional-email-catalog.md) reserves only the receipt e-mail. The cancellation route of FA-KTO-27 (§ 312k BGB) is a different route and does not satisfy § 356a. Only the client can adopt the function, through a new specification version.

Questions:

1. Does § 356a BGB apply to each offering: Pro, a Check pack, and any contract where the consent at ordering later makes the right lapse? How long must the function stay available for a contract whose service has started with consent?
2. Is a function that lives in the private purchase service, reachable from the public site and from the signed-in web app, enough? Must it work without a login, as the cancellation route does?
3. Is the data the function may ask for limited to name, contract identification and the receipt channel, so that the Account e-mail and an Order number are the proper identifiers?
4. What must the receipt say beyond content, date and time, and may it be the e-mail reserved in ADR-0019?
5. Please confirm that the withdrawal text must mention the existence and placement of the function (Art. 246a § 1 (2) EGBGB) and give the wording.

Engineering position: adopt it before launch. The agent does not decide this and the drafts do not claim the function exists.

### 2. Withdrawal instructions and model form

The draft follows the structure of the statutory model: the fourteen-day right, how to exercise it, consequences, the payment for a service that started during the period, and the model form. Questions: is the wording acceptable for a service contract with digital delivery, and which exact model text (Anlage 1 and Anlage 2 to Art. 246a EGBGB) must be copied? Which variant covers Pro that is charged only at activation (ADR-0009), and which covers a Check pack charged at ordering and refunded in full on withdrawal before activation?

### 3. Consent, early start and loss of the right

ADR-0004 and ADR-0009 make an immediate start depend on a separate, unticked consent with an acknowledgment of the effect on the withdrawal right. Is the planned consent text, which Source Taster stores as a versioned record bound to the Order, legally sufficient, and when exactly does the right lapse for a recurring Pro subscription, a Check pack and AI extraction that has been used? The draft terms and instructions leave the wording to the reviewer.

### 4. Legal notice

Is the e-mail address alone a sufficient fast electronic contact? Is there a supervisory authority or regulated profession? What is the right statement under § 36 VSBG, and does the size exemption apply? Does one notice serve the site, web app, extension, API and purchase pages?

### 5. Privacy information

- Roles and legal bases for each activity: Account and Quota (contract), security events and limiter counters (legitimate interest), invoices (legal obligation), support, and AI extraction.
- Are the independent data sources (table 4 of [#253](253-provider-register.md)) recipients that must be named, and what transfer safeguard applies to each in the United States and the United Kingdom?
- Is an AI provider that receives Reference text a processor, and what must its contract state?
- How does Art. 17 GDPR meet a 312 hour Object Lock export, and is a 14 day backup statement enough?
- Which statements are needed for the cookie, the Guest browser storage and the extension storage, and does the Firefox manifest declaration need to appear in the text?
- Is the keyed hash of a truncated address prefix in the abuse limiter personal data, and does the text need to say so?
- Does keeping invoices for 8 years after Account deletion need a separate legal basis statement?

### 6. Terms

Liability and warranty clauses, the clause on changing quotas and scope (ADR-0004 FA-KTO-10), the lapse of the paid remaining term on Account deletion without a pro-rata refund (marked "needs legal review" in ADR-0004), business customers if they are served, governing law, jurisdiction and the dispute-resolution statement.

### 7. Licences (from [#254](254-licence-inventory.md))

1. Does a server that combines AGPL-3.0-or-later citeproc-js with first-party code require an AGPL §13 offer to every remote user even though the owner holds the copyright in the first-party code? Is a link to the source of the running build, shown in the web app, the extension and the website, a sufficient "prominent offer" (#270)?
2. For the extension, which §6 route do the project and the browser stores allow? Is §6(d) together with the store listing text sufficient?
3. Resolved by #280 (2026-11-26), no longer a question. The website now ships Pagefind 1.6.0, whose browser WASM uses `hifijson` 0.5.0 (MIT) instead of the GPL-3.0 `pagefind_microjson`, so no GPL-3.0 §6 offer for the WASM is needed. The original question was whether the Pagefind source package was a sufficient GPL-3.0 §6 offer while Pagefind 1.5.2 was shipped, and whether the manifest-versus-header mismatch mattered (#225).
4. Is it correct that the private service, which depends only on the dual-licensed contract packages under MIT, is not a work based on the AGPL program?
5. Does the missing CLA make the MIT branch of the contract and token packages unsafe to rely on until #207 is resolved?

## Materials to hand over

- This note and the eight `draft-2026-11-20.1` files.
- [#253 register](253-provider-register.md) of providers, locations and transfers, with findings F-1 to F-11.
- [#254 licence inventory](254-licence-inventory.md).
- [ADR-0004](../adr/0004-owner-plan-quota.md), [ADR-0009](../adr/0009-payment-provider-tax-model.md), [ADR-0012](../adr/0012-hosting-operations.md), [ADR-0019](../adr/0019-transactional-email-catalog.md) and [ADR-0020](../adr/0020-website-documentation-help.md).

## What stays with a human

- Choosing and instructing the lawyer, and receiving their answers. No provider, lawyer or person was contacted for this note.
- Supplying the seller identity, domain, support address, prices and provider contracts that the placeholders stand for.
- Deciding whether to adopt the withdrawal function (question 1) through a new specification version.
- Setting `status: approved`, the approval record and `reviews.legal` after the review. Until then the publication gate stays closed.
- A human translation review of the German and English drafts (`reviews.translation`).
