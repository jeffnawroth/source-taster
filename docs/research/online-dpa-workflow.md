# Online DPA workflow: factual planning evidence

Researched **25 October 2026** for [decision #56](https://github.com/jeffnawroth/source-taster/issues/56).
Baseline: main `486375239a24c11a1f669b3c2f118c2c224d29ab`, approved requirements **v3.3**. Planning evidence only:
no client decision, legal drafting, entity classification, execution approval, provider selection or completed legal review.

## Legal roles and availability

- Article 28 applies to personal data processed **on behalf of a controller**, using processors providing sufficient guarantees.
  Business status alone does not establish that relationship: roles depend on actual processing activities, not contractual
  labels. [GDPR, Article 28(1), (3)][G]; [EDPB, paragraphs 12, 26–29][E].
- Determine roles separately for verification, Account administration, billing, security and support. A customer might itself
  be a processor, requiring a corresponding subprocessing arrangement. [EDPB, 75–83, 151–160][E]. A DPA does not supply the
  controller's underlying processing legal basis. [GDPR, Article 6][G].
- FA-UEB-22 requires business customers to conclude and download a DPA online without a paid-Plan limitation. The parent proposal
  of availability for confirmed Accounts with business use, including Free, fits that wording; it does not classify every such
  Account as needing a DPA. Neither VAT ID, invoice details nor an institutional email domain establishes representative
  authority. Actual parties and authority remain unqualified. [requirements][R]; [ADR-0013][A13].

## Electronic form, signatures and proof: limits

- Article 28(3) requires a contract or other legal act binding the processor to the controller. Article 28(9) requires writing
  **including electronic form**. Neither provision specifies a qualified electronic signature (QES), paid signature provider or
  particular acceptance technology. [GDPR][G].
- The EDPB nevertheless recommends including the necessary signatures in accordance with applicable law to avoid disputes about
  whether the agreement is in force. A written agreement can sit within a broader contract, with its Article 28 elements clearly
  identified. [E, paragraphs 100–104][E].
- eIDAS Article 25, as explained by the Commission, protects electronic signatures from rejection solely because they are
  electronic/non-qualified; QES has handwritten-signature equivalence. That does **not** establish every checkbox's attribution,
  authority or contract validity. [eSignature FAQ][S].
- German [BGB §126a][Ba] concerns replacing a statutory written form and requires QES in that setting; [§126b][Bb] defines text
  form, while [§127][Bc] concerns agreed form. These are distinct rules, not grounds to import a universal QES duty into Article
  28(9) or to declare every click sufficient.
- A deliberate acceptance tied to authenticated identity and a preserved, downloadable exact packet is a candidate evidence
  design. Counsel must qualify offer/acceptance, both parties' commitment, representative authority, applicable law, agreed form
  and evidential sufficiency before launch. Authentication or a hash alone proves neither legal authority nor valid execution.
  [E, 101–103][E].

## Required processing detail and reviewed packet

- Article 28(3) requires subject matter, duration, nature and purpose of processing, personal-data types, data-subject
  categories, and the controller's rights and obligations. The agreement must address documented instructions (including
  transfers), confidentiality, Article 32 security, subprocessors, rights assistance, Articles 32–36 assistance, end-of-service
  deletion/return, compliance information/audits and notice of unlawful instructions. [G, Article 28(3)(a)–(h)][G].
- Repeating GDPR wording is insufficient: describe the actual operations and concrete security and assistance arrangements. The
  EDPB expects specific data categories, duration or determining criteria, and measures that let the controller assess
  appropriateness. [E, 112–115, 126–127][E].
- For this product, qualification must cover submitted texts/documents/References, parsing and AI extraction where used, Data
  source requests, History choices, deletion and backup behavior. Determine permitted data/data-subject categories,
  sensitive-data handling, instruction channels and limits; do not fabricate these from a generic “business customer” checkbox.
  [requirements][R]; [EDPB guidance][E].
- The proposed versioned packet of DPA + technical/organizational measures (TOMs) + subprocessor annex fits these duties
  **if concrete processing details are included**; document names alone do not establish completeness. [GDPR][G]; [EDPB][E].
- Commission Decision **2021/915** supplies optional Article 28 controller/processor clauses. Its Annex I identifies parties,
  contacts and signatures; Annex II describes processing; Annex III specifies TOMs; Annex IV lists subprocessors for specific
  authorization. General authorization also needs an agreed list. Preserve its prescribed text if relying on the standard
  clauses, completing permitted choices/annexes; do not silently relabel an edited template as those clauses. These are not the
  international-transfer SCCs in **2021/914**, and do not themselves satisfy Chapter V transfer duties. [C, recital 10; clauses
  1–2, 7.7–7.8 and annexes][C].
- The Commission says SCC use requires binding commitment, completed annexes and signed Annex I; signature formalization is left
  to governing national contract law. This is a useful template route for legal review, not a selected contract or approval of
  unsigned clickthrough. [Q, page 6][Q].

## Subprocessors and changes

- Article 28(2) requires prior specific or general written authorization. With general authorization, inform the controller of
  intended additions/replacements and give an opportunity to object. Under Article 28(4), impose the same applicable
  data-protection obligations downstream; the initial processor remains fully liable to the controller for their performance.
  [GDPR][G].
- Merely publishing an occasionally updated list is insufficient: the processor must actively flag intended changes. Specify
  communication, reasonable advance time and objection consequences; the sources do not prescribe a universal number of notice
  days. Specific authorization is not granted by silence; under general authorization silence can count within the agreed
  procedure. [E, 128 and footnote 54, 152–160][E]; [C, clause 7.7][C].
- EDPB Opinion 22/2024 expects identities throughout the processing chain to be readily available and proactively kept current,
  including names, addresses and contacts. Its September 2026 summary reiterates this; depth of guarantees verification depends
  on risk, while identity availability does not. No blanket duty to inspect every downstream contract follows. [O, 22, 31–32,
  48, 69][O]; [EDPB summary][H].
- The FA-UEB-13 provider register includes different legal roles and purposes; it is not automatically the customer-processing
  subprocessor annex. Map relevant actual suppliers/processing chains and transfer safeguards, including support/remote access
  and backups. EU storage is not an EU-only processing commitment; FA-UEB-14 remains deferred. [ADR-0009][A9]; [ADR-0012][A12];
  [requirements][R].

## Deletion, return and separate legal evidence

- At the end of processing services, Article 28(3)(g) requires deletion or return **at the controller's choice**, plus deletion
  of copies unless Union/Member State law requires storage. Specify the instruction procedure; the EDPB contemplates changing
  that choice before service ends and secure deletion with confirmation. A DPA download is not a return of processed customer
  data. [GDPR][G]; [E, paragraphs 139–142][E]. Resolve how these duties fit actual expiry, backup and deletion mechanics.
- DPA party/acceptance evidence containing personal data needs a documented purpose, Article 6 basis, minimization and bounded
  retention under Article 5. Article 17(3)(b)/(e) can limit erasure where necessary for statutory duties or legal claims; the
  exception is not itself an Article 6 basis or permission for indefinite storage. A representative is not necessarily
  personally the contracting party for Article 6(1)(b). No final basis or period is determined here. [GDPR][G].
- Neither Article 28 nor Articles 5/6/17 prescribe an automatic **eight-year DPA retention period**. FA-KTO-04's billing rule
  and ADR-0012's invoice Object Lock do not classify DPA evidence as invoices. Allocate contract evidence, audit, notifications
  and verification content separately; immutability while retained does not remove deletion duties or permit retaining erased
  History. [requirements][R]; [ADR-0012][A12].

## Local architecture implications and unresolved choices

- Account signs in; each confirmed Account has exactly one personal Owner at launch. Private legal and business metadata and
  versioned packet/acceptance records can be Account-linked without changing Plan, Quota or Check ownership. Legal-party
  identity distinct from Owner, with a recorded authorized representative, does not itself require organization seats,
  membership, billing roles or federation. This is compatibility analysis, not an accepted domain-model amendment.
  [ADR-0001][A1]; [ADR-0004][A4]; [ADR-0013][A13].
- Public generic legal material can follow ADR-0020; personalized packets/acceptances remain private. Preserve accepted
  language, exact DPA/processing/TOM/subprocessor versions, party/representative snapshot, actor Account, time and acceptance
  event; show current and historical applicability without rewriting earlier acceptance. Determine governing language and
  update/reacceptance rules legally. These are evidence candidates extending ADR-0009's pattern, not already implemented fields.
  [ADR-0009][A9]; [ADR-0020][A20].
- FA-GLE-01 applies to section 14, including FA-UEB-22. FA-GLE-02 lists web exceptions but no DPA exception. Both clients need
  equivalent conclusion/download acceptance evidence; extension-to-web DPA handoff must not be silently treated as an already
  approved purchasing exception. [requirements][R].
- ADR-0013 requires current server authorization and Account/Owner isolation. Its five-minute fresh proof pattern is relevant to
  proposed acceptance/representative changes, but does not already name DPA acceptance as an action. Fresh mailbox control does
  not prove business signing authority. Email changes preserve stable IDs; representative correction must not rewrite historical
  party evidence or transfer an Account merely from business details. [ADR-0013][A13].
- ADR-0019's closed launch mail catalog contains no DPA receipt or subprocessor-change message. Adding one needs an explicit
  catalog/design reconciliation; non-marketing necessity does not make an unlisted type authorized. Article 28 does not
  universally mandate email: qualify active notice, recipient, failed delivery, advance timing and proof; avoid reliance on
  passive website changes. Use the private outbox/minimal metadata boundary, with no References, document names, Check content
  or export bearer credentials in mail. [ADR-0019][A19]; [ADR-0012][A12]; [ADR-0014][A14]; [E, 128][E].
- Legal records still retained after Account deletion need a restricted retrieval/rights procedure, separate from normal sign-in
  or restored History. Existing recipient-only data-subject fulfilment does not authorize any claimed business representative,
  ordinary Operator or different Owner to download verification content. Qualify retained party/acceptance personal data for
  FA-BTR-11 delivery; DPA contract retrieval and data export remain distinct. [ADR-0013][A13]; [ADR-0014][A14].

## Launch qualification gates, not completed approvals

1. Specialist legal review: actual entities/roles and processing scope; representative authority and evidence; binding DE/EN
   packet, execution/form, applicable law, instructions/audits/assistance, subprocessor authorization/notice/objection, transfer
   safeguards, deletion/return and retention. Include the DPA explicitly in the FA-UEB-23 handoff; that requirement's enumerated
   review list does not itself name the DPA. FA-UEB-22 remains an independent must requirement. [requirements][R].
2. Evidence in **both clients**: a confirmed business-use Account, including Free, concludes online and downloads exactly the
   accepted packet; exercise wrong Account/Owner, stale authority, replay/concurrent version changes, email/representative
   changes and current/historical versions.
3. Qualify active subprocessor notice and objection before use, delivery failures and closed-catalog reconciliation; prove legal
   mail/downloads expose no verification payload or cross-Owner records.
4. Reconcile end-of-service choice, expiry/deletion/backups, surviving legal evidence and recipient-only access without reviving
   deleted content. Record test date/build and final requirements traceability.

Minimal independent party metadata, a reviewed packet and Free availability present no inherent conflict. Unresolved tensions:
web-only DPA shortcuts, unlisted legal emails, missing processing detail and invoice-derived retention. None is approved here.

## Primary sources and baseline references

All external sources accessed 2026-10-25. EUR-Lex returned empty HTTP 202 responses in this environment; GDPR text was checked
in BfDI's official March 2026 reproduction, and 2021/915 materials in the Commission's published English Word package. eIDAS
Article 25 was checked through the Commission FAQ.

[G]: https://www.bfdi.bund.de/SharedDocs/Downloads/DE/Broschueren/INFO1.pdf?__blob=publicationFile "BfDI: GDPR text, Articles 5/6 pp. 148–150, 17 pp. 162–163, 28 pp. 171–173; EUR-Lex CELEX 32016R0679"
[E]: https://www.edpb.europa.eu/system/files/documents/2023-10/EDPB_guidelines_202007_controllerprocessor_final_en.pdf "EDPB Guidelines 07/2020, v2.1, 20 September 2022 corrections"
[C]: https://commission.europa.eu/publications/standard-contractual-clauses-controllers-and-processors-eueea_en "Commission 2021/915 publication, decision and annex Word downloads; EUR-Lex CELEX 32021D0915"
[Q]: https://commission.europa.eu/document/download/b9d3d16b-9003-45e7-acef-409562b4bf8b_en?filename=questions_answers_on_sccs_en.pdf "Commission SCC questions and answers, pp. 4–6"
[S]: https://ec.europa.eu/digital-building-blocks/sites/spaces/DIGITAL/pages/880312429/eSignature+FAQ "Commission eSignature FAQ: legal effects, eIDAS Article 25"
[Ba]: https://www.gesetze-im-internet.de/bgb/__126a.html "BGB §126a: statutory electronic form"
[Bb]: https://www.gesetze-im-internet.de/bgb/__126b.html "BGB §126b: text form"
[Bc]: https://www.gesetze-im-internet.de/bgb/__127.html "BGB §127: agreed form"
[O]: https://www.edpb.europa.eu/system/files/documents/2024-10/edpb_opinion_202422_relianceonprocessors-sub-processors_en.pdf "EDPB Opinion 22/2024, adopted 7 October 2024"
[H]: https://www.edpb.europa.eu/system/files/2026-09/edpb-guidelines-at-a-glance-230926-processing-chains_en.pdf "EDPB processing-chain responsibilities at a glance, September 2026; simplified overview"
[R]: ../requirements-specification.md "Approved requirements v3.3, especially FA-GLE-01/02 and FA-UEB-13/14/22/23"
[A1]: ../adr/0001-open-core-boundary.md
[A4]: ../adr/0004-owner-plan-quota.md
[A9]: ../adr/0009-payment-provider-tax-model.md
[A12]: ../adr/0012-hosting-operations.md
[A13]: ../adr/0013-authentication-roles.md
[A14]: ../adr/0014-operator-administration.md
[A19]: ../adr/0019-transactional-email-catalog.md
[A20]: ../adr/0020-website-documentation-help.md
