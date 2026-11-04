# #113 accounting and recipient-only data-subject exports

> Historical source-only handoff. Its oversized-export refusal is superseded by [the integrated handoff](113-integrated-exports.md).

## Scope and source ownership

Implementation for #113 under #70, ADR-0014/0015/0021 and the 3 November brief.
Public checkout: `/Users/jeffnawroth/.t3/worktrees/source-taster/t3-f173dced`,
branch `t3/accounting-dsr-delivery`, based on published
`2bf6c1892cd9a716aaf4d88d96fd25cdeb3541b3`.
Private checkout: `/Users/jeffnawroth/Developer/st-worktrees/source-taster-service-106`,
branch `t3/113-accounting-dsr-nov3`, based on published
`4037025b833fdfbcd00d45a72bb03244325eea30`.
The final source also merges committed #112 integration tips public
`13f8681cca0080a8117df9c43e36148db01cdb86` and private
`d617245d48b7b3e5ae0f79cde6db8d1cece74733`. No dirty #112 files were read or copied.
The earlier #108 branch and `f95d936daa7209179076ff5ca2a20962b5148449`
history remain preserved and are ancestors of this private source.

Saved implementation checkpoints are public `cc854be` and
`09e0cda1cdc7f1be2cae64c0e8b0a3e3a0edd5cc`, private `d5be891` and
`819e72fcf9602bf47b0a685ab61cb188b9256507`. A final receipt correction follows
those checkpoints: serving a response does not claim the recipient received it.
Final source and handoff commit IDs are recorded in the delivery report.

Only these two assigned checkouts were edited. No predecessor was inspected,
no shell worktree or nested agent was created, no #112 dirty source was copied,
and no root/private integration, main or SOURCE100–102/110 files were edited.
No push, PR, issue change, activation or scheduler change was made. The existing
five-hour job remains untouched.

## Accounting behavior

The authorized Operator selects a UTC, half-open invoice-issue-date period
(`from <= issuedAt < until`), up to 366 days. The command requires
`exports:write`, an exact operation ID, controlled reason and session-bound
fresh proof no older than five minutes. The same operation recovers its selected
immutable invoice IDs and generation time; changed parameters conflict.

`POST /v1/operator/accounting` returns JSON with original archived PDF/UBL bytes
encoded as base64, SHA-256 file hashes, retained structured records and validation
provenance, invoice/payment identifiers and timestamps, country, retained tax rate,
net/tax/gross minor-unit integers, currency and country/currency totals. JSON avoids
CSV formula execution and quoting ambiguities. Totals use BigInt arithmetic and
are serialized as decimal strings; different currencies are never combined.

New invoices retain accounting facts alongside the already immutable archive.
Pre-113 invoices use only their retained provider invoice, tax evidence and exact
Order/period catalog snapshot. No current catalog or current tax lookup supplies
historical evidence. Missing facts, files, undated invoices and unreconciled archive
events produce an explicit incomplete result; available incomplete documents are
still identified and included. Pending events are conservatively flagged even
when their eventual invoice date cannot yet be established.

Country totals are invoice-date net turnover, with tax and gross alongside it.
Payment rows identify the archived paid-invoice evidence separately; they are not
a provider payout/fees/settlement ledger or a legal revenue-recognition opinion.
Retained cancellation business-object references are included. The initial refund
workflow supplies no refund business objects: the output explicitly says so and
invents no refund, credit note, negative invoice or legal/tax treatment. Later
correction/refund workflows must retain and link their own immutable evidence.

## Data-subject workflow and boundary

1. The Operator initiates `POST /v1/operator/data-subject` with Account ID,
   operation ID, controlled reason and exact fresh proof. The service derives
   the stable Owner from current Account/deletion records. No recipient email,
   Owner override or payload is accepted in the Operator command.
2. Status exposes identifiers, a calendar-month response deadline and the two
   delivery states. The notification has neither content nor a bearer credential.
   The identifier alone authorizes nothing; there is no self-service initiation.
3. An ordinary recipient presents a fresh current Account session matching both
   Account and Owner, then proves access to the established verified mailbox with
   a separate five-minute code bound to that browser transaction and session.
   Three attempts, shared address/hour budgets and replacement/replay fences apply.
4. The successful recipient receives an opaque, purpose-limited retrieval grant
   for at most 24 hours. It is returned only to the recipient, kept in browser
   memory and sent in Authorization headers, never in a URL or notification.
5. Each actual program delivers its own JSON attachment directly. The private
   program exports Account/Preferences, profile/identity and session metadata,
   Quota, Orders/periods/subscriptions, retained invoice files/tax evidence,
   billing/legal/DPA records and applicable support/audit data. It excludes active
   credentials, codes, password/token fields, keys, outboxes and payment capability
   URLs. The verification program exports its retained Account-bound Check and
   History content, originals, revisions/provenance, immutable results, Manual
   overrides, events, retained reports and relevant metadata. Guest material and
   other Accounts/Owners are excluded. Locked presentation does not paywall DSR.
6. Both programs recheck current authority during generation/delivery. The open
   program asks the service through the minimal dual-licensed, signed
   `/internal/data-subject-authority` transport. Purpose, method, exact path, body,
   issuer/audience, expiry and replay are checked. Only IDs/authority/status cross
   this boundary. No verification payload, preview, proxy, archive or AGPL
   implementation import enters the private program.
7. After consuming a part's complete response body, the recipient calls that
   program's `POST /v1/data-subject/:id/received`. The web UI does this after
   receiving the Blob. Current authority is checked again. Receipts are idempotent;
   only both recipient-confirmed parts make the case delivered. Merely generating
   headers, serving bytes or receiving SMTP acknowledgement is not that receipt.

Both download names are fixed, with JSON content type, no-store, no-referrer and
nosniff. There is no persistent temporary export artifact. The verification codec,
Owner/purge guards and original Check/report deadlines continue to govern reads;
exporting cannot extend History, legal retention, grants or backup keys. A Check
can expire before the 24-hour grant. Deleted content is not restored from backups.

## Exceptional identity and retained legal retrieval

A blocked/deleted Account does not regain normal sessions, Quota, purchases or
History access. Without independent proof the case stays awaiting verification.
`SERVICE_RIGHTS_REVIEWS` is a deployment-controlled privacy-procedure input, never
an Operator API or arbitrary email field. Its JSON array entries contain:
`requestId`, `accountId`, `ownerId`, `recipient`, `language` (`de`/`en`),
`verifiedAt`, `expiresAt`, `evidenceReference` (controlled opaque reference) and
`epoch` (the current external Account authority epoch). A review covers no more
than 24 hours. Every use rereads and validates it; removing/expiring/rotating it
revokes exceptional access. The recipient still proves mailbox access through the
separate bound challenge. A different live Account session cannot substitute for
that reviewed Account/Owner, including after re-registration.

A trusted privacy reviewer must establish identity/entitlement independently and
retain the referenced evidence in the qualified privacy procedure. Invoice/profile
knowledge alone is insufficient. Application Operators cannot manufacture that
input through the UI. Verification method/outcome/reference, case and delivery
metadata are audited without codes or verification content. The actual reviewer,
file ownership/access, identity standards, representation and support response
capacity require legal/security/deployment qualification; the file is not itself
proof that a human review occurred.

This implements retained personal/legal records retrieval for the data subject,
including a deleted Account's lawful invoice/DPA evidence. DPA contractual return
or a different representative's agreement entitlement remains a distinct
ADR-0021 purpose and is not silently authorized by this DSR grant. Nothing
extends the owning legal retention schedules or establishes a new eight-year DPA
retention rule.

Restore must rotate the external Account/Operator epochs, preserve deletion and
bootstrap completion fences, replay deletion/block state and finish ordinary
sweeps/reconciliation before traffic. Old DSR grants are bound to the old epoch
and fail closed. Ordinary re-registration creates a new Account/Owner and cannot
inherit the old grant or records.

## Evidence and reproducible commands

All evidence is source-linked using the private implementation in SOURCE106 and
uncommitted links to this public checkout. It is not acceptance of final published
contract pins. Logs are in this checkout's ignored `.tmp/spec-70-orchestration/113-*`.
Only owned PostgreSQL 18 `st113-owned-pg` on loopback 55421 and actual program ports
5501/5503 were used; captured mail and synthetic external providers replaced only
external ports. Both-program schemas have separate restricted roles, not cross-
schema application access. No shared 5433 or #112 ports were used.

The final serial commands are:

```sh
SOURCE_TASTER_113_EVIDENCE="$PWD/.tmp/spec-70-orchestration" SOURCE_TASTER_SERVICE_WORKTREE=/Users/jeffnawroth/Developer/st-worktrees/source-taster-service-106 DATABASE_ADMIN_URL=postgres://postgres:postgres@127.0.0.1:55421/postgres SOURCE_TASTER_TEST_API_PORT=5501 SOURCE_TASTER_TEST_SERVICE_PORT=5503 pnpm --filter @source-taster/server exec vitest run --config rights.vitest.config.ts

DATABASE_ADMIN_URL=postgres://postgres:postgres@127.0.0.1:55421/postgres SOURCE_TASTER_TEST_SERVICE_PORT=5503 pnpm --dir /Users/jeffnawroth/Developer/st-worktrees/source-taster-service-106   --filter @source-taster-service/server exec vitest run   test/exports.test.ts test/accounting-period.test.ts   test/rights-security.test.ts test/operator.test.ts

# Same public fixture environment as the first command:
pnpm --filter @source-taster/web exec playwright test --config rights.playwright.config.ts
```

Final HTTP evidence: `113-final-both.log` **3/3**, including Guest exclusion,
shorter content expiry, receipt ordering/retries, retained locked data,
revisions/results/Manual overrides, deletion and re-registration isolation.
`113-final-private-focused.log` **20/20** covers accounting, identity, signed
protocol, code/outbox/expiry/restore and Operator regressions. Locked History's
flag is imported fixture state; this does not claim the separate private #104
paid-History entitlement handoff has been qualified.

DE/EN Chromium uses the actual private built UI and both programs through
synthetic HTTPS-to-loopback fixture forwarding, with keyboard downloads,
recipient receipt waits, observable file bytes and axe checks. No browser security
feature was disabled. `113-final-browser-receipts.log` records **2/2** before the #112 merge.
Final merged-source acceptance is recorded separately below.
Real Safari/Firefox/assistive-technology/deployment browser qualification remains.

Build/typecheck/lint/i18n pass in both programs. Normal Pagefind fetch/build and
hash-bound verification passed. The final affected public server build and
private UI/server checks are under `113-resume-*` / `113-final-private-*`.
`113-artifact-reproduction.json` records **59/59** contract/OpenAPI files unchanged
on rebuild. No generated artifact was hand merged. A source-linked private frozen
install passed. The direct release check continues to exit **78**.

Red/green and failed runs are retained honestly: initial accounting/DSR/public
routes failed 404 before implementation; a period test caught undated/pending
archive omissions; a pre-113 fixture required retained-evidence reconstruction;
recipient re-registration exposed a review-scope denial gap; receipt red proved
premature status. All have subsequent focused greens. Early dependency builds
failed before the new checkout's dependencies/core existed; public contract route
import and lint/type issues were corrected. Early browser failures were an exact
language locator, mailbox-notification timing, and HTTPS-to-loopback address-space
protection, corrected in fixture composition without disabling security. The final
receipt browser test initially pressed Enter while the next button was disabled;
it now waits for completed receipts. One private run collided with the browser's
5503 port. The earlier full private **121/121** run overlapped aggregate public
artifact generation; it remains historical regression evidence, not the final
serial source-linked acceptance. No broad blind rerun replaced these distinctions.

## Pins, rollout and remaining gates

Apply private migration `20261103000000_operator_exports` before this code. Existing
Operators acquire `exports:write` through the existing fresh-proof Operator grant
workflow; it is not self-granted by signup or an email domain. Configure the
recipient-facing HTTPS `verificationPublicOrigin` when internal verification
transport and public browser origins differ. Configure and qualify exceptional
identity review and restore epochs separately.

The initial five pins were `367f62447d4cd0dff11a367f41af788c7f474cb0`.
The merged #112 integration updates all five private public-contract/evidence pins
to published `13f8681cca0080a8117df9c43e36148db01cdb86`; this is still the
pre-113 transport and does not establish final published-pin DSR acceptance. Before a published-pin acceptance run,
publish/integrate a descendant containing this source's internal transport,
verification download/receipt contracts, package exports, generated JS/declarations
and both OpenAPI documents, then repin all five private locations to that one
reachable published commit and regenerate its lock/evidence through normal tools.
Do not commit a local path or unreachable source SHA. Existing development overrides
are explicitly uncommitted; their original bytes/patch and final hashes are receipted
in the companion private handoff.

Exports fail explicitly rather than truncate when exceeding the current delivery
bounds: 32 MB JSON per program, 24 MB retained invoice binary bytes, 1,000 retained
Checks/invoices (10,000 Check metadata entries), or the accounting period bound.
Generation uses existing bounded transactions; there is no automatic large-case
splitter. Large-case fulfilment capacity and completion within the unchanged
shortest retention deadline must be qualified before launch; an oversize case
remains unfulfilled and cannot be called delivered or given longer retention.

These are implementation and fixture results, not legal/tax/security/provider,
identity-review, accessibility, final published-pin, deployment or restore approval.
All Selected/Better Auth **1.7.14**, minimatch/dependency, source/provider rights,
calibration/Measured configuration/load and Q01–Q11 gates remain. No gate was waived.
Whole-spec review/cleanup and #114/#116 remain downstream; this does not complete #70.

## Committed #112 integration reconciliation

The integration refs advanced during the resumed task. The first merge attempt
safely refused uncommitted receipt/UI/generated changes. Those changes were
committed (`c8f6aaf` public, `70b9e04` private), and the current workspace/lock
bytes and binary patch were saved to `113-pre-integration-overrides/` before
restoring only those two tracked override files for the merge.

Public merge completed automatically. All four transport packages were then
rebuilt from merged source, replacing the need to trust auto-merged generated
files. Private conflicts were resolved in source by preserving both catalog and
export commands/permissions, both translated catalogs/activity labels, and both
service compositions. Fresh proof now uses one permission helper for catalog,
Operator-role, support and export actions. Private merge commit is `7c4aaac`.
The incoming published pins/lock were committed as integration supplied them;
only own-public development overrides were reapplied afterwards, uncommitted.
No generated files were hand merged and no local link/unreachable pin was committed.

Because the committed merge changes catalog contracts, immutable period pricing,
Operator permissions/UI and Check settings, final validation includes those exact
affected seams in addition to #113's already passing source acceptance. This is
not a claim of #112 activation, paid-History qualification or whole-spec completion.

## Final merged-source acceptance and cleanup

Tested implementation heads (handoff commits add documentation/evidence only):

- Public: `e4df8f3ccf56c15a9b4de4d1fe651dd7715160e1`.
- Private: `043df519ea3952cb5bb44892d16b22ad92f131fe`.

All final tests ran serially after merged-source artifact generation:

| Check | Result | Evidence log |
| --- | --- | --- |
| Both actual programs: retained DSR, scope, expiry, deletion, receipts | 3/3 | `113-merged-both.log` |
| Both-program catalog/Initial-value propagation | 1/1 | `113-merged-catalog.log` |
| Private exports/accounting/rights/Operator/catalog-commerce | 24/24, 5 files | `113-merged-private-focused.log` |
| Final built UI: actual two-program DE/EN recipient downloads, receipts, keyboard, axe | 2/2 | `113-dsr-browser-accepted.log` |
| Integrated Operator/catalog/Initial values, credits and lost-response recovery | 4/4 | `113-operator-browser-accepted.log` |
| Both aggregate builds, typechecks, lints and i18n | Pass | `113-merged-{public,private}-*.log` |
| Final private UI build/typecheck/lint and DE/EN catalog check | Pass | `113-operator-status-*.log`, `113-final-i18n-accepted.log` |
| Four transport packages: regeneration/reproduction | 79/79 identical | `113-merged-artifact-reproduction.json` |
| Private source-linked frozen install | Pass | `113-merged-private-frozen.log` |

The integrated browser run initially found ambiguous status/recovery locators
introduced by the export panel. The main feedback now has the unique translated
“Action status” name and delivery recovery has its own contextual label. The old
Action field retains its own name. The corrected four-case run passes; failed
runs remain under `113-merged-operator-browser*.log`. Ephemeral synthetic fixture
credential header values in retained failure logs were redacted; raw failure
traces were removed with owned browser output. Production credentials were never
used or logged.

The extra merged checks use the same owned PG/program environment shown above,
plus these narrow selectors:

```sh
pnpm --filter @source-taster/server exec vitest run \
  --config quota.vitest.config.ts test/catalog.contract.ts
# Private HTTP command above, adding test/catalog-commerce.test.ts.
# Private browser, from SOURCE106 with the owned PG environment:
SERVICE_E2E_PORT=5442 pnpm --filter @source-taster-service/web exec \
  playwright test --config operator.playwright.config.ts
```

The labelled `st113-owned-pg` container and its anonymous volume were removed only
after all tests stopped. Application ports 5501, 5503 and 5442 had no listeners;
26 owned fixture/output paths were removed. No unrelated container, database,
role, port, worktree or scheduler was touched. Original/pre-integration override
backups, logs and the controlled Pagefind cache are retained.

Final uncommitted override SHA-256 receipts:

- `pnpm-workspace.yaml`: `43bad5f776a2b7f01a828fa3a73d9b68652f628090775ade2b1796cb828922f1`.
- `pnpm-lock.yaml`: `dc8fde32425323ee75cbe295388eff9b1e419df2ce631fad4d72e3880e8e05b0`.

The public evidence receipts are [source/overrides](../evidence/113-source-receipt.json)
and [owned cleanup](../evidence/113-cleanup.json). They distinguish source-linked
acceptance from final published pins. They contain no export payload or credential.

## Final published #112 tip merge

Before handoff, merged the newer published integration tips public
`c74b1a1208d06a155352e3ec5e56be685da59a5a` and private
`f3f9a5bb8d28ff889df7c500e27ba5e027fa3794` into these assigned source branches.
The exact delta from the already tested `13f8681` / `d617245` integration is
#112 documentation/evidence only. No runtime, transport, migration, renewal
effective-date, Operator contract or cache-drain behavior changed, so no unrelated
blanket test rerun was performed. All five private pins remain the published
`13f8681cca0080a8117df9c43e36148db01cdb86`. #112 publication/local acceptance does
not repair hosted qualification, CI/advisory failures or other retained gates.
The #114 implementer's SOURCE100–102 was neither read nor edited. Catalog
administration permission remains distinct from `exports:write` and independent
recipient Account/Owner proof; it does not become DSR content authority.
