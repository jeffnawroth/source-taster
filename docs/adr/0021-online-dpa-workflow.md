---
status: accepted
---

# Conclude versioned DPAs in both clients and separate contract evidence from processing content

The client accepted this design on 25 October 2026 in [Online data processing agreement workflow](https://github.com/jeffnawroth/source-taster/issues/56), through [F1–F3](https://github.com/jeffnawroth/source-taster/issues/56#issuecomment-6398035770), [F4–F6](https://github.com/jeffnawroth/source-taster/issues/56#issuecomment-6398137006), [F7–F9](https://github.com/jeffnawroth/source-taster/issues/56#issuecomment-6398186637), [F10–F12](https://github.com/jeffnawroth/source-taster/issues/56#issuecomment-6398214694) and [F13](https://github.com/jeffnawroth/source-taster/issues/56#issuecomment-6398253018). Provide a versioned online data processing agreement (DPA) and exact-packet download, without introducing deferred organizations. Keep private contractual metadata separate from verification content, with current authority, explicit acceptance and traceable changes.

The approved baseline remains [requirements v3.3](../requirements-specification.md), especially FA-UEB-22 and FA-GLE-01/02. The [primary-source findings](https://github.com/jeffnawroth/source-taster/blob/be9290790d8dce6582ba31f48edc1fdd01d293a0/docs/research/online-dpa-workflow.md) support planning, not legal execution approval. This ADR selects a product/data workflow; it is not final contract wording, classification of the actual parties, an implemented acceptance/signature service or a requirements amendment.

## Contracting party, Account and availability

Confirmed Accounts using the service for business can conclude and download a DPA on **Free and paid Plans**, in both web app and extension. Use equivalent authenticated private-service operations; FA-GLE-02 contains no web-only DPA exception. Do not turn the workflow into a paid upgrade or silently classify it as deferred organization administration. UI placement must preserve ADR-0001/0013's private account-management boundary rather than importing private implementation into the open verification backend.

At launch, each Account has **one current DPA contracting-party association**. Different independent businesses use separate Accounts. Collect only needed legal/business name, address and the acting authorized representative; require confirmation at conclusion. Preserve the existing Account ID, personal Owner, Plan, Quota and Check ownership. This creates no organization Owner, seats, membership, shared History or new institutional role.

A Contracting party is distinct from the person signing in and from the Owner holding Quota/content. An invoice, VAT ID, institutional domain or self-declared representative name does not establish signing authority or permit Account transfer. Legal review determines the actual controller/processor/subprocessor roles and appropriate agreement variant. Business use alone does not mean every operation is processing on behalf; Account administration, billing, security and support require their own role/purpose analysis.

Keep the relevant business-processing/agreement relationship traceable using minimized identifiers and version references, without copying References or documents into the private service. Later party/version changes must not retrospectively reassign historical evidence or authorize access to another party's processing. A correction, succession or different legal entity needs the legally qualified procedure below; it is not a profile-edit shortcut around the one-current-party model.

## Reviewed, immutable agreement packet

Offer DE/EN agreement material and all associated annexes for inspection before conclusion. Bind one packet version to the exact DPA, processing description, technical/organizational measures (TOMs), subprocessor arrangements and other required annex versions. The customer can later download the **exact concluded packet**, not merely the latest public legal-page links.

The packet must describe actual subject matter, duration, nature/purpose, data/data-subject categories, instructions and the applicable confidentiality, assistance, security, audit, subprocessor and end-of-processing arrangements. A generic business checkbox or a list of document titles is not evidence of completeness. Counsel must qualify permitted processing/sensitive-data scope, actual suppliers/transfer safeguards and both parties' commitments; do not inspect customer Check content in the private backend to fill legal annexes.

Generic approved legal information can follow [ADR-0020](0020-website-documentation-help.md). Personalized packets and acceptance evidence belong to the private service's legal/business records. Preserve all retained versions and their applicable language; review which language is binding. Selecting DE/EN does not silently translate or replace an earlier concluded version.

FA-UEB-22 requires a download, not a new PDF generator. Qualify the downloadable complete packet/acceptance representation as part of the legal/template/accessibility evidence. This ADR does not extend ADR-0017's open Verification report adapter or PDF-only maturity exception into proprietary business-document code, select a signature/conversion SaaS or license a new renderer. Document output choices must respect ADR-0001/0002 and the retained exact-version requirement.

## Deliberate conclusion and evidence

The customer reviews party details and the complete packet, explicitly attests representative authority, then invokes **Conclude agreement**. Require renewed sign-in proof **no older than five minutes**, tied to the session/action and exact packet/party revision. Preserve current permissions and Account isolation on every protected read/write/download; fresh mailbox control is not a legal finding about business authority.

The server validates current authority and the still-offered packet, then atomically records conclusion once. A stable operation ID/idempotency key and recoverable status prevent duplicate agreements or mail after double-click, timeout, reconnect or restore. A client redirect/button state is not proof of completion; a stale packet or conflicting party edit must not silently conclude a different agreement.

Keep an immutable agreement record while retained: agreement ID, Contracting party/representative snapshot, acting Account, conclusion time, language, exact document/annex versions and acceptance event. Later profile/email changes preserve stable IDs and do not rewrite this evidence. Store no raw IP, sign-in code, session secret or verification payload in the record/audit.

No external signature provider is initially selected. Article 28 permits electronic form, but counsel must approve actual execution, applicable/agreed form, representation evidence and binding commitment by **both** sides. If the proposed click-through cannot meet those requirements, return the concrete change before launch; do not claim a hash, an authenticated session or this ADR is legal sign-off.

## Changes and customer notices

Corrections are traceable new records/addenda, not overwrites. A different Contracting party is an explicit legal event and must not change Account/Owner rights or Quota automatically. Legally material agreement changes are presented as a new version for explicit acceptance; previous packets and completion records remain accessible within retention. Counsel determines which edits require a new conclusion and the effective-date procedure.

Plan **general written subprocessor authorization** with a named list, active advance notice and a chance to object. Map actual customer-processing suppliers/roles/chains; the broader FA-UEB-13 register is not automatically the DPA annex. EU storage/transfer safeguards do not promise the deferred FA-UEB-14 EU-only organization mode.

Show intended supplier additions/replacements in the Account and send the approved transactional notice. A passive web-page update is insufficient. Record affected party/agreement, notice/version, intended effective date, delivery state and objections. The notice period, authorized recipients, failed-delivery treatment and consequences of objection require reviewed contractual terms; no universal day count or automatic silence-as-consent rule is invented here.

Keep objections as open cases. **Do not use the affected supplier for that customer until contractual prerequisites are resolved.** Enforce this at the service permission/dispatch boundary, not only in the UI. If a configuration needs that supplier, hold the affected new operations rather than fabricate evidence, silently bill Not verifiable, change provider routing or activate an unmeasured reserve. Preserve current authorization/cancellation, completed-Verdict billing and mandatory source/quality gates. No per-customer expert/provider picker is introduced.

The qualified procedure must cover queued/running work, concurrent notice/acceptance changes and restore. A hold must not accidentally suspend unrelated permitted reads, retained legal-record retrieval or the public statutory cancellation route. Demonstrate how the actual selected global configuration can honor the restriction; if it cannot, return the architecture/contract trade-off before use rather than promise unsupported isolation or an unavailable alternative supplier.

## Two explicit transactional mail additions

Extend [ADR-0019](0019-transactional-email-catalog.md)'s closed inventory only by:

1. **DPA conclusion receipt:** agreement ID/version and link to the concluded packet in the Account, using the selected agreement language. The packet remains retrievable in the product if email fails.
2. **Intended subprocessor-change notice:** the scoped change, relevant agreement/notice reference and the reviewed route/time for objection. Apply the reviewed recipient/delivery/effectiveness rules before relying on it.

Both use the private service's existing transactional outbox, per-business-event idempotency, sender/privacy rules and DE/EN templates; no marketing/tracking or verification content. Links convey no bearer authority. A successful SMTP attempt alone is not evidence that contractual notification prerequisites were met. DPA receipt language is an explicit exception to ADR-0019's default Account-language rule; other message-language rules remain unless the legal notice requires a reviewed qualification.

These messages create no withdrawal receipt, newsletter or deferred completion/Quota mail. The separate pending withdrawal-function amendment remains pending. Support-assisted return/retrieval cases do not silently authorize further automated mail types.

## Retention and access after block/deletion

DPA packets, conclusion evidence and change notices have their **own legally confirmed retention/deletion schedule**, separated from invoice retention, the twelve-month administrative audit and thirty-day security events. Determine purpose, lawful basis, duration/expiry, review and mailbox/backup treatment before launch; there is no automatic eight-year DPA period or indefinite legal-claims exception. Immutable while retained does not mean undeletable personal data forever.

Account deletion keeps existing live verification deletion/tombstone/backup rules intact. Necessary legal evidence is retained separately with restricted access and minimized identifiers; it cannot extend History or restore erased Checks. A paid Plan ending is not by itself proof that all business processing ended, since Free business use is permitted; qualify the actual service/processing-end event.

For a blocked/deleted Account, a separate support procedure verifies identity **and contractual entitlement** before delivering only still-retained legal records. Never reactivate ordinary sign-in, restore erased verification content or transfer an Account based on company/profile/invoice knowledge. A new representative does not automatically inherit another person's Account/History. Existing rights-fulfilment safeguards can inform this route, but agreement retrieval is not the same purpose as personal-data access or contractual data return.

## End-of-processing return or deletion

The customer can instruct **deletion** or **return followed by deletion** through a documented support case. Record the choice, covered processing/agreement scope, entitled recipient and authority verification. Preserve the ability to communicate/change the instruction through the qualified process before the service ends; counsel must approve its actual timing and end-of-processing operation.

Return only data actually retained and covered by that customer's DPA. The verification program delivers verification content directly to the verified entitled recipient; the Operator may coordinate/status-track the case, never preview the content or route it through the private backend. Reuse [ADR-0014](0014-operator-administration.md)'s recipient-only delivery safeguards where applicable with a **distinct contractual purpose**, authorization and scope. Do not infer rights to every Account's data from business details or equate this with downloading the agreement or making a GDPR data-subject request.

Do not pull deferred general self-service export FA-KTO-05 forward. The customer instruction is support-mediated. The fulfilment protocol must complete in time for the existing deletion deadline, including short-lived content without History; an export/delivery grant never extends that deadline. Return no erased data from backups and create no private content archive. Status/confirmation metadata stays separate from payloads; current authority, holds, expiry and deletion are checked through delivery.

Reconcile actual return scope/completeness, instruction timing, queues/manual response capacity, failed delivery, deletion confirmation and backup expiry in the legal and deployment acceptance evidence. A narrow citation export alone is not a complete contractual return. If the proposed process cannot fulfill the reviewed duty within unchanged retention, reopen that concrete conflict before launch rather than accepting an impossible promise or silently changing v3.3.

## Evidence and consequences

Before launch demonstrate:

- A confirmed business-use Free Account and a paid Account inspect, conclude and download the exact packet in **both clients**, with DE/EN and keyboard/screen-reader behavior, without organization features or payment.
- Fresh-proof, wrong-Account/party, representative-data, stale-version, replay/concurrent update, timeout and restore cases preserve one authoritative completion and immutable evidence. A downloaded current page cannot replace the retained concluded version.
- Both new mail types use the closed catalog/outbox correctly, expose no verification content or bearer credential and preserve product retrieval when delivery fails. Prove the reviewed advance-notice/objection conditions, not merely an email send counter.
- A supplier objection/hold prevents affected dispatch under actual configuration, including queued/running/restored work, without unmeasured fallback, false negative evidence, duplicate billing or unintended loss of unrelated rights.
- Legal-record corrections/expiry and blocked/deleted-record retrieval preserve party history and purpose-limited access without Account resurrection. Confirm the final separate legal-data retention schedule and provider/support/backup map.
- Exercise scoped contractual return/deletion, including the shortest remaining content lifetime, incomplete/failed delivery and a different party's request. Verify payloads never appear in Operator UI/private backend/mail/logs and fixed deletion rules still hold.

Specialist review must explicitly include DPA content/processing roles, binding parties/representation/form, governing language, instructions/assistance/audits, supplier authorization/notices/objections, transfers, retention and return/deletion. FA-UEB-23's enumerated list does not itself name every DPA issue; FA-UEB-22 remains an independent must requirement. Record this additional handoff rather than claiming a completed or universally sufficient legal assessment.

This adds private legal/business records, purpose-bound support cases and two transactional templates on the existing stack. It selects no paid signature vendor, contract-PDF engine, new organization model, retention exception or implementation backlog. Final technical-concept traceability must map these evidence gates to FA-UEB-22, both-client parity and the existing privacy/auth/Operator boundaries. All required legal/deployment evidence remains to be obtained.

## Rejected alternatives

- A paid-only or web-only DPA, or using the DPA as an implicit organization/Owner migration.
- Replacing old agreement/party records through profile edits or assuming email authentication establishes company authority.
- Passive subprocessor-list publication, ignoring an objection, or treating a different unmeasured route as automatically permitted.
- Invoice-derived eight-year DPA retention, ordinary Account resurrection for records, or Operator inspection of contractual-return payloads.
- Promising indefinite exports/recovery, promoting general self-service export or treating downloaded DPA text as return of processed customer data.
