---
status: accepted
---

# Provide a small private Operator web administration with auditable actions and recipient-only data-subject delivery

The client accepted this decision on 25 October 2026 in [Operator administration and workflows](https://github.com/jeffnawroth/source-taster/issues/24), rejecting terminal-only routine administration as insufficiently user-friendly. Provide a small private web administration for the required Operator actions, reusing the private service UI and provider administration. This makes daily support and configuration usable while retaining API-enforced permissions, content separation and measured-configuration gates.

The accepted rounds are [launch scope](https://github.com/jeffnawroth/source-taster/issues/24#issuecomment-6395969643), [F2–F4](https://github.com/jeffnawroth/source-taster/issues/24#issuecomment-6395999375), [F5–F7](https://github.com/jeffnawroth/source-taster/issues/24#issuecomment-6396026423) and [F8–F10](https://github.com/jeffnawroth/source-taster/issues/24#issuecomment-6396068235). The client explicitly approved the consolidated **requirements v3.3** on 25 October 2026: it brings the basic interface forward in sections 13/19 and clarifies Operator-arranged, recipient-only data exports. Version 3.3 supersedes v3.2 as the approved baseline. This ADR is planning, not an implemented interface, completed legal review, export, money movement or provisioned Operator credential. Other research-derived amendment candidates remain separate.

## Launch surface and ownership

Build within the private React/React Aria/Tailwind web app already allowed by [ADR-0001](0001-open-core-boundary.md) and [ADR-0003](0003-system-architecture.md). All actions use protected service APIs and the current session/permission checks of [ADR-0013](0013-authentication-roles.md). Do not expose a generic database editor or give the private backend access to verification tables/content.

| Area | Launch scope |
| --- | --- |
| Accounts | Email search; stable Account/Owner identification; Plan, consumption, payment status; block/unblock, Quota credits and temporary Pro |
| Catalog and settings | Versioned prices, Quota, validity, feature scope and Initial values; per-Plan/Guest-total/per-origin limits and relevant settings |
| Measured configurations | Passed evidence, currently eligible configuration/reserve selection and guarded activation |
| Exports | Selected-period accounting export and Operator-arranged data-subject requests |
| Activity | Action receipts/status, provider/reconciliation cases, audit entries and due review tasks |

Stripe remains the payment/refund administration; hosting/monitoring keep their own provider surfaces. Source Taster's catalog remains authoritative: create Stripe prices from it, never independently edit provider prices. The interface links to the matching provider object without copying payment-card data or verification content. Existing reports/counters can be read in Cockpit; this does not pull advanced FA-BTR-09 analytics forward.

All product UI/messages follow existing DE/EN and accessibility requirements. The launch interface does not pull vouchers, organizations/API keys, self-service data-export initiation, or the consent-bound wrong-Verdict UI forward. Their existing obligations/triggers remain unchanged. Ordinary administration never exposes Reference titles, files, raw text, Candidates or History content; the existing reported-copy permission remains only its separately scoped architectural hook.

[ADR-0022](0022-reported-wrong-verdict-policy.md) records that hook's accepted purpose, exact diagnostic projection, Guest/Owner associations, 90-day maximum and earlier deletion rules. A future separately authorized Operator browser reads and handles retained reported copies directly in the verification program; private administration/audits stay content-free. Handling notes share the copy's deadline, and closure changes neither the original Verdict nor Quota. No tracker/repository/email/remote-analysis content archive or new launch reporting obligation is introduced.

## Versioned configuration and safe actions

Use **Draft → validation → activation**. Show exact differences, effective dates, affected scope and validation failures before activation. Persist immutable versions/activation records so the active catalog/configuration and the version used by an Order or result can be recovered. Concurrent changes must not silently overwrite another approved edit.

- Catalog changes obey [ADR-0004](0004-owner-plan-quota.md)/[ADR-0009](0009-payment-provider-tax-model.md): new purchases and next applicable periods use the new version; existing bought/running terms retain theirs. Credits and temporary Pro grants take effect immediately under the existing grant rules. Initial values change through the service without a software release.
- AI/parser/style/scoring/search configurations are selected as complete **Measured configurations**, with the exact passed evidence required by ADR-0006/0007/0010/0011. Continued dependency/provider eligibility, credentials/rights and code compatibility still apply; an old passed run is not permission to activate an incompatible or retired configuration. No user-facing raw-model picker bypasses the gates.
- Quota, request limits and source budgets remain distinct. Enforce the per-Plan, per-client Guest, Guest-total and per-origin controls; clients receive the existing continuation time/Retry-After response. If a setting can affect evidence/Verdicts, its change follows the measured-configuration gate. Turning off a mandatory source is not a coverage waiver.

Before a credit, block or temporary Pro action, show Account/Owner, effect and expiry where relevant; require explicit confirmation and a controlled reason/case reference. Critical changes require renewed proof no older than five minutes. Server-side validation and current permissions remain mandatory even if the UI previously enabled a button.

Each command has a stable operation ID and a recoverable status. After disconnect, retrieve status or retry the same operation; do not issue a fresh credit/refund solely because the first response was lost. Keep status deduplication aligned with the business journal/provider object even when the general audit's display-retention period ends. Configuration activation, billing effects and cross-program blocks use durable processing and explicit pending/failed states rather than showing success before confirmation.

The audit records actor ID, time, target ID, effect/version references, result and controlled reason or case reference. Do not copy verification content, raw account-search queries, codes, tokens, keys or arbitrary customer text into it. Corrections append entries; the administration cannot overwrite previous entries. General administrative audit retention starts at **12 months**; billing evidence/catalog/order/journal material follows its applicable separate schedule. Legal review must confirm the final retention allocation and minimization before launch. This is an operating policy, not an eight-year retention rule for all telemetry.

## Account, payment and reconciliation workflows

Account search returns the Account's personal Owner, current Plan/grants, consumption/available Quota, payment/subscription state and relevant provider links. A future organization membership does not change personal ownership or authorize access to another Owner.

- **Credit:** add an idempotent Operator grant with explicit amount/validity (ADR-0004 default 30 days); do not edit past debits or mark an invoice paid. A goodwill credit is labelled goodwill.
- **Temporary Pro:** show the period and resulting features/Quota; activate the existing grant that ends automatically without a charge. Keep the paid subscription independent.
- **Block/unblock:** enforce ADR-0004/0013 immediately, including current reads/streams and cancellation of affected running Checks. Show that subscription/grant periods keep running; a block is not subscription cancellation. Unblocking restores eligibility only for rights still valid; it does not resurrect cancelled Checks or expired grants.
- **Refund:** initiate in Stripe, then reconcile Source Taster's Order/grant/archive state. Apply the existing rule withdrawing unused refunded grant remainder, without reclaiming consumed Quota or duplicating an independent goodwill credit. Withdrawal/refund legal gates in ADR-0009 remain unchanged.
- **Invoice correction:** use the provider's correction/credit-note workflow, retain the original and correction documents/structured data and reconcile the archive. Do not overwrite the original invoice snapshot or rewrite historical tax evidence.
- **Cases:** pending cancellations/receipts, refund/chargeback state, missing archive files and grant/payment discrepancies appear in Activity with the authoritative provider IDs and a recoverable status. Open the matching provider transaction or request an idempotent reconciliation. Close only after the expected external/internal effects are confirmed. A successful browser redirect or manual retry is not payment proof.

Preserve durable webhook inboxes, provider signature checks, deduplication by event **and** business effect, and source-state read-back where ordering matters. Reconciliation compares Orders, invoices, consent, cancellation receipts, archive copies, grants and reservations as ADR-0004/0009 require. Surplus grants need an explicit reviewed correction, not silent journal mutation. The statutory cancellation route stays independent of sign-in and queues provider work when Stripe is unavailable; its time-of-receipt evidence and receipt must not disappear behind the provider-case workflow.

## Two export workflows

### Accounting and tax advice (FA-BTR-06)

The Operator chooses a period and downloads invoice/payment data, invoices and structured records from Source Taster's own archive/tax snapshots. Include country, tax rate, net/tax/gross/currency and country totals, with correction/refund records linked to originals. Use machine-readable tabular/structured output plus the retained invoice files; do not substitute a live Stripe-only export or silently omit an incomplete archive. Show completeness/reconciliation status and preserve historical catalog/tax values rather than recalculating them from current settings. The quarter export must reconcile with its individual invoices and country totals.

### Data-subject request (FA-BTR-11)

The Operator initiates a request, records identity-verification outcome, follows its one-month response deadline and sees progress/delivery. Only the verified entitled recipient receives the full machine-readable data package and invoice files. Ordinary Operator authority can arrange fulfilment but cannot download or preview verification content. This does not introduce the deferred FA-KTO-05 self-service initiation.

Use a purpose-bound **24-hour retrieval authorization** after identity verification. A notification contains no export content or bearer credential; possession of a request identifier alone is not authority. The recipient must satisfy the request's access check; normal signup/account recovery cannot be impersonated by an Operator-created export. When a grant expires, controlled re-verification/reissue does not require altering the Account's Plan/Quota.

Keep the program boundary intact: the private service supplies its own Account/billing records; the verification program supplies the entitled recipient's retained verification/History data directly to the recipient's authenticated browser/download path. A manifest/status can cross the service boundary, never the verification payload. Assemble or clearly label the parts as one fulfilled export delivery without routing plaintext History through the private backend. Include retained originals/revisions/results and unsupported fields where present; this is the complete data-subject scope, not the narrower current-Reference citation export of ADR-0005.

Blocked/deleted Accounts can still have retained data subject to access rights. Handle these through a separately verified, purpose-limited fulfilment route that never restores normal Account access, purchases or general History permissions. Available established proof can be used; if proof is missing, keep the case awaiting verification under the documented privacy procedure, never transfer access based on invoices/profile knowledge alone. Track and respond to the case deadline rather than silently granting content to meet it. The legal review must qualify exceptional identity/representative handling and the retention/delivery allocation; it is not performed here.

Export fulfilment is not paywalled by Plan/Quota or locked-History presentation rules. Export only data actually retained; do not restore erased data from backups or suspend ordinary deletion deadlines for an export. The 24-hour authorization is a maximum retrieval window, not permission to extend a Check's shorter remaining lifetime. If packaging requires temporary content, it must obey the existing verification-side deletion/encryption rules and must not create a new private-service archive. Revocation, pending deletion and expiry must be rechecked during delivery. Store completion/audit metadata separately from the export content.

### DPA support cases: distinct purposes

[ADR-0021](0021-online-dpa-workflow.md) adds subprocessor-objection cases, verified retrieval of retained contract records after block/deletion, and customer-instructed contractual return/deletion. Track legal/business status and authority without transferring Accounts or exposing verification content. Contractual return may reuse recipient-only transport safeguards, but has its own agreement scope and entitlement; it is not automatically a data-subject export. Complete it before existing deletion deadlines, never extend retention or restore erased data. No general self-service export or ordinary Operator preview is introduced. Actual notice/objection, return timing and retention require legal/deployment qualification.

## Emergency controls and recovery

Provide clearly scoped controls to pause **new Checks** or **new purchases**, and to cancel affected running Checks where necessary. Name what is paused; do not silently pause the public statutory cancellation route. Apply the existing Check cancellation, reservation release and previously completed-Verdict billing rules; a pause does not fabricate no-match evidence or rewrite results.

Switch back only to a still-compatible/eligible configuration with the required passed evidence. Emergency stopping is not permission to activate unmeasured AI, thresholds or search budgets, evade supplier limits, or waive mandatory coverage. Record actor/reason/status; make pending propagation explicit and confirm the enforcement points. Downtime still counts under ADR-0012's measurement; neither the pause button nor a smaller budget proves capacity/compliance.

Restore and provider disaster operations remain the already accepted runbook/provider procedures, not a generic production database-edit or key-display screen. The web administration may expose run status/evidence and controlled reconciliation/traffic-release checks. Before traffic, replay deletion/block state and sweeps, invalidate prior sessions/challenges and complete reconciliation under ADR-0012/0013. The break-glass route must work when normal web sign-in is unavailable; it cannot depend solely on that same broken page.

## Initial Operator and subsequent authority

A one-time setup page grants the first Operator role only to the **predesignated Account**, after fresh sign-in proof and a separate setup code from the password manager. Predesignation is trusted deployment configuration, not a user-editable claim. Bind and atomically consume the one-time authorization, then close the setup path. Never place the setup secret in URLs/logs or allow an arbitrary Account to claim the first role. A restart or old backup must not reopen a completed bootstrap; include completion/replay protection in the restore protocol.

Subsequent Operator grant/revoke uses the web administration, current explicit permissions, fresh proof, confirmation and audit. No role is self-granted through registration or email domain. Avoid removal of the last effective ordinary access without a verified recovery path. For loss of all normal access, use the existing named deputy's sealed, logged break-glass procedure; no direct business-data store intervention or hidden permanent web backdoor is introduced. The setup code authorizes role establishment; it is not a new general user login method or implementation of deferred product MFA. Mailbox-provider MFA remains ADR-0013's operating prerequisite.

## Recurring review tasks

Activity includes a due date, outcome and evidence reference for:

- monthly VAT-trigger review (FA-EIN-03), showing net qualifying consumer sales for the current and preceding calendar years under ADR-0009's existing decision, including relevant other Operator sales entered/imported with provenance;
- quarterly review of the other section 19 triggers;
- provider-register review at each release, including authentication/mail, backups/support/control plane and the chosen AI path/reserve.

Missing external sales, country evidence or archive records yield **incomplete**, never a reassuring below-threshold result. Link the €8,000 preparation warning and the requirement that FA-KTO-34 be ready before the legally relevant threshold under the existing payment decision. This task/report does not itself approve the separate VAT/OSS/retention amendment candidates, turn Stripe Tax on at launch or replace tax advice. Store who reviewed which data/period and what follow-up is required. This ADR describes product review tasks; it does not create a recurring agent scheduler or perform a compliance review.

## Acceptance evidence and consequences

The consolidated design requires proof before launch, not just buttons in a prototype:

- Use the web administration to satisfy FA-BTR-01–06/11 without SQL or generic database tooling; show correct permissions/Owner selection, no verification-content exposure and DE/EN/keyboard/screen-reader behavior.
- Validate catalog effective dates, immutable Order terms and per-Plan/Guest/origin limits with their continuation time. Prove credits/temporary Pro are immediate and expire correctly; block/unblock does not change billing periods.
- Exercise wrong target, concurrent edit, stale confirmation, denied role/freshness, duplicate click, timeout/status recovery, repeated provider event and restore. The same business action must not book twice or show premature success.
- Attempt activating incompatible/unmeasured/retired AI or search configurations; prove enforcement on the server, not only UI filtering. Check emergency pause/stop/reserve paths, cancellation/late results and real load impact.
- Reconcile a quarter export with invoices, country/tax snapshots and corrections; exercise incomplete archives/provider outages and the review task's missing external-sales data.
- Fulfil a test data-subject request with full retained Account/History/invoice data, including locked-History and purpose-limited blocked/deleted cases; prove a different Owner and ordinary Operator cannot retrieve verification content. Test expiry, deletion, recipient verification and absence of content in the service backend/audit/mail.
- Verify one-time bootstrap cannot be claimed by another Account, replayed, reenabled by restart/restore or bypassed through client claims; demonstrate the named deputy's logged recovery path without direct business-database edits.
- Verify the audit append-only interface, controlled reasons, redaction, expiry and separate financial retention. Legal/privacy review must confirm exceptional rights handling and final retention before launch.

The implementation cost is a small private UI and controlled workflows rather than terminal-only operation; it reuses the selected stack/infrastructure. Runtime implementation, provider provisioning, live exports and actual legal/tax/security tests remain outside this planning decision.

**Handoffs:** [Security and abuse protection](https://github.com/jeffnawroth/source-taster/issues/40) receives bootstrap/recovery, fresh authority, recipient-only export and audit/redaction/retention controls for its assessment. Later privacy/legal and final-concept traceability work must include the data-subject purpose boundary and evidence matrix. Hosting/restore and payment procedures remain ADR-0012/0009, now surfaced through this UI where appropriate.

## Rejected alternatives

- **Terminal-only daily administration:** rejected by the client as insufficiently user-friendly.
- **Generic database administration/low-code table editing:** bypasses business validation, permissions and the content boundary.
- **Stripe as the entire Operator surface:** cannot supply Source Taster's own grants, blocks, measured configurations or full data-subject fulfilment.
- **Bringing every support/analytics/organization feature forward:** exceeds the accepted basic launch scope.
- **Operator preview of full data-subject packages:** conflicts with the verification-content restriction; select recipient-only delivery.
- **Emergency gate bypass or manual paid-status edits:** creates unmeasured Verdict behavior and unreconcilable entitlements.
