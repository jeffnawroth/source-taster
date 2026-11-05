# #112 Operator catalog, Initial values and request limits

Implementation source: public branch `t3/operator-curated-catalog-orders` in
`/Users/jeffnawroth/.t3/worktrees/source-taster/t3-314dc72d`; private branch
`t3/112-operator-catalog-limits-nov3` in the exclusively reassigned existing
`/Users/jeffnawroth/Developer/st-worktrees/source-taster-service-100-102` checkout.
The private implementation and its detailed validation are in `docs/validation-112.md`
in that repository. This public record contains no proprietary implementation.

## Delivery and boundaries

The private Operator web administration supplies curated forms for Guest/Free/Pro
and Check-pack Quotas, paid EUR prices, validity, supported feature scope, Free
History count/days, paid History days, Reference count/upload admission limits,
and separate verification/shared request budgets. It provides immutable drafts,
validation, before/after review, a future effective date, controlled reason,
current `catalog:write` permission, command-bound fresh proof, atomic activation,
idempotent operation receipts, reload recovery and the existing twelve-month audit.
It exposes neither database tables nor deployment secrets or verification content.

Every activated version atomically appends its Plan rows. Orders retain their
immutable row version, price/features/validity and legal/tax snapshots; the new
rows link back to the complete catalog version. Existing grants, invoices and
paid periods are not rewritten. New purchases reject superseded offers; renewal
selection uses the version effective at the period start. The payment adapter
prepares the next recurring price with no proration or billing-anchor change,
using a recoverable catalog key and append-only preparation evidence. Invoice
read-back/amount/tax/archive checks remain mandatory.

The public changes are verification implementation plus dual-licensed transport:

- Optional History settings/version accompany the signed Quota snapshot. Web and
  worker persist monotonic settings with consent/authority metadata. New History
  deadlines use those settings; existing deadlines stay fixed. A separate paid
  flag replaces the old assumption that exactly 30 days identifies Free storage.
- Optional admission settings accompany the existing signed abuse policy. Each
  verification request consumes the bounded policy cache in its own async context;
  upload/Reference limits cannot exceed the program's configured isolation ceiling.
- Private policy reads select the effective immutable catalog version. The one
  shared ledger, verification counters, current Plan derivation, key material,
  fixed expiry and origin-window pins remain in place. Lower caps use live counts.
  A window-width change uses the existing 24-hour activation fence, persisted
  across restarts. Stale versions and outages deny business requests.

Guest/Free grants change at the next applicable Berlin calendar period; bought
terms stay with their original Order. Features remain the union of valid grants,
and consumption keeps earliest-expiry allocation. Paid feature eligibility is not
source/model qualification. Mandatory base capabilities and Plan identity cannot
be removed through optional feature toggles.

The editable Initial values are the launch values in FA-KTO-15/FA-UEB-11 and the
admission values in FA-ERF-12. Search candidate budgets, timeouts, concurrency,
parser/AI paths, scoring and other outcome-changing settings remain governed by
complete measured-configuration, rights, quality and load qualification (#114).
This slice adds no activation bypass or generic settings editor. Deferred trial,
organization and other deferred Initial values are not activated.

Statutory cancellation retains #108's exact POST intake exception from Account,
Quota, shared business limits and their recovery state; trusted-origin, body/schema
bounds and durable deduplication remain. The exception was not widened to catalog,
purchases, account management or verification.

## Source ancestry and publication handoff

Public started at published `592b74970998804477016f6c53775fcda66542bb`;
private started on a new branch at published
`7c76642bbd1ab99351e9d0c909b202ce69bdc425`. The old private
`t3/109-business-tax-invoices-nov2` branch and
`42fb5697868f7248cbc6adb757e5a24853cf4466` history remain reachable.
Both sources include the latest published #108 integration tips:

- Public `2bf6c1892cd9a716aaf4d88d96fd25cdeb3541b3`.
- Private `4037025b833fdfbcd00d45a72bb03244325eea30`.

Public transport commit to publish before repinning private:
`e72fd1da4b44194405c7960f2b81fdb109b40f13`. It contains the #112 transport
and regenerated #108 contracts and descends from the published public integration.
All five committed private pins still deliberately use reachable, published
`367f62447d4cd0dff11a367f41af788c7f474cb0`. After publishing the #112 transport (or a reviewed integration descendant containing it),
update the three server contract dependencies, web service-contract dependency,
`scripts/evidence.ts` and lockfile together. No unpublished SHA or local path was
committed to package dependencies. The private source requires the new #112
transport for its positive build/tests; its two intentional local override files
supply that transport until publication. Canonical published-pin normal/frozen
installation is a dependency-install check, not a claim that old transport types
satisfy the new implementation.

## Validation and reproducibility

All evidence is retained under this public checkout's ignored
`.tmp/spec-70-orchestration/112-*`. Tests use owned PostgreSQL 18 container
`st112-owned-pg`, port 55811, and only generated test databases/roles. Final tests
use verification ports 5801/5802, service 5803 and browser 5483. Early focused
runs used service 5802. External payment, VIES, invoice-provider, DOI and mail
systems are loopback fixtures/captured adapters. EN 16931 validation executes the
existing hash-pinned Saxon/official rules; no real provider was called.

Meaningful red controls: missing catalog API (404); unchanged History deadline
(30 rather than 12 days); two References accepted despite a one-Reference policy;
missing provider renewal-price preparation; and a held renewal-provider request
blocking statutory intake. The last case was corrected with a separate renewal
serialization lock and a post-IO cancellation/version recheck. The real cancellation
API then returns while the provider remains held; catalog sync cannot undo its
state or broaden its HTTP exception. The Reference-limit test initially
expected HTTP 413; it was corrected to the existing contract's HTTP 400 without
changing the rejection behavior. Environment-only failed setup attempts are not
counted as behavioral red evidence. Cache/drain/permission expansion tests were
added after implementation; not every assertion had an independent red run.

Final verification:

| Check | Result | Retained log |
| --- | --- | --- |
| Private aggregate, including cancellation/renewal overlap | 117/117, 16 files | `112-private-aggregate-closing.log` |
| Public actual Quota/commerce/catalog programs | 11/11 | `112-public-quota-final.log` |
| Public History | 21/21 | `112-public-history-final.log` |
| Public abuse/cache/origin limits | 15/15 | `112-public-abuse-final.log` |
| Both-program Guest authority | 33/33 | `112-public-guest-final.log` |
| Operator DE/EN Chromium | 4/4 | `112-browser-closing.log` |
| Public aggregate typecheck/build/lint/format/i18n | pass | `112-public-*-final.log` |
| Private typecheck/build/ESLint/format/i18n | pass | `112-private-*-closing*.log` and static logs |
| Prisma, both message trees, four transport packages/OpenAPI | byte-for-byte identical | `112-reproduction.log` |
| Controlled Pagefind source cache | verified; normal website build passes | `112-pagefind-verify.log`, `112-public-build-final.log` |

Public affected suites total 80 tests. The private/browser rows use the new
transport through the receipted local override, not old published types. The
Pagefind cache was independently cloned into this worktree from the existing
controlled cache and verified against the current recipe/source/artifact hashes;
this is not a claim of a fresh native compiler build.

Relevant commands:

```sh
# Recreate the removed owned test PostgreSQL only when this name/port are free.
docker run --name st112-owned-pg --label source-taster.task=112 -e POSTGRES_PASSWORD=postgres -p 127.0.0.1:55811:5432 -d postgres:18
export DATABASE_ADMIN_URL=postgres://postgres:postgres@127.0.0.1:55811/postgres
export DATABASE_TEST_URL=postgres://verification_test:verification_test@127.0.0.1:55811/source_taster_test
export SOURCE_TASTER_SERVICE_WORKTREE=/Users/jeffnawroth/Developer/st-worktrees/source-taster-service-100-102
export SOURCE_TASTER_TEST_API_PORT=5801
export SOURCE_TASTER_TEST_SERVICE_PORT=5803
export SERVICE_TEST_EN16931_CONFIG=/Users/jeffnawroth/Developer/st-worktrees/source-taster-service-100-102/.tmp/en16931/validator.json
# Use the assigned prepared private source with its receipted #112 overrides.
pnpm -C "$SOURCE_TASTER_SERVICE_WORKTREE" --filter @source-taster-service/server test
SERVICE_E2E_PORT=5483 pnpm -C "$SOURCE_TASTER_SERVICE_WORKTREE" --filter @source-taster-service/web exec playwright test --config operator.playwright.config.ts
# Run from the public source checkout, serially.
pnpm --filter @source-taster/server exec vitest run --config quota.vitest.config.ts
pnpm --filter @source-taster/server exec vitest run --config history.vitest.config.ts
pnpm --filter @source-taster/server exec vitest run --config abuse.vitest.config.ts
pnpm --filter @source-taster/server exec vitest run --config guest.vitest.config.ts
```

The both-program fixture is explicitly source-only: it composes real signed
hosted adapters, persistence and HTTP consumers with development verification.
It produces no calibrated measurement or deployable hosted gate receipt. Existing
public hosted failures and private advisory findings remain unresolved.

## Override receipts and remaining gates

The original #109 dirty bytes/patch were backed up before switching branches:
`.tmp/spec-70-orchestration/112-override-backup/receipt.json`.
Original workspace SHA-256:
`ca30cd73bcd14332e075d69883754207dad96f28b4c435174a53231824473771`;
original lockfile SHA-256:
`a40cca4e44fef131e587d549828af1e7c1d002f25a49951b2ee9df606e859fb4`.
Subsequent #112 override snapshots/patches are also retained before integration
merges. Final local override SHA-256 values:

- Workspace: `21b3f0a31cb8c80c72454588efcc3cb66d07f46519c7509787fa03db6053cddb`.
- Lockfile: `158dc0cc3c48897eab91ce8194b95545d3d5132bf33217f67c575b25df7e8d80`.

`112-final-source-receipt.json` records the source heads, ancestry, original-byte
verification and intentional override state. `112-closed-evidence.json` hashes
48 closed, allow-listed evidence files; its SHA-256 is
`3006324a38f30f1b7e61fc77f21295e9731d0424f2bf81bb9d8c49f1eb0b62ed`.
The manifest excludes itself and later documentation commits. The owned
`st112-owned-pg` container and anonymous volume were removed after validation
(`112-owned-cleanup.json`). No test process remains; logs, the independent
controlled Pagefind cache and the pre-existing validator cache remain for reproduction.
The public source is committed clean; private dirt is restricted to the two
receipted local transport override files.

No push, PR, issue edit/closure, production activation, nested agent, Claude,
shell worktree or protected-source write was performed. #113 remains separate.
The user-enabled five-hour job was not changed. Selected dependency, Better Auth
1.7.14/minimatch, release #78, browser/security/accessibility, legal/tax/provider,
source-rights, calibration/quality/load, hosting and deployment gates remain open
where already open. Source tests do not qualify a real price-change notice,
merchant/provider account, live recurring payment, tax rule or production cache
rollout. Final #70 review and cleanup remain separate.

## Integrated publication and handoff

The exclusive public-root/private-INTEGRATION merger integrated exact public
`6f0758f3943800c7e8f3dad427f662c0e9ec0e41` and private
`29d7c008c95cc0a0ab5e4aad35236aa05008d2f2` without conflicts. Both sources include
the preceding published integration tips `2bf6c1892cd9a716aaf4d88d96fd25cdeb3541b3`
and `4037025b833fdfbcd00d45a72bb03244325eea30`; merge ancestry and the saved private
#109 history remain reachable. No dirty source-workspace override was copied.
Product implementation/schema bytes are unchanged from the exact sources; only
public fixture port controls and private pin/lock/evidence references differ.
Curated catalog notice and renewable-period behavior therefore retain their
validated source implementation. Transport ancestor
`e72fd1da4b44194405c7960f2b81fdb109b40f13` is included.

Public `13f8681cca0080a8117df9c43e36148db01cdb86` was pushed and verified at the
actual remote branch before repinning. All five private pins use this reachable
integrated SHA: three server contract dependencies, the web service-contract
dependency and `scripts/evidence.ts`. Later handoff-only public commits leave this
transport unchanged. Tested private code/pin head:
`d617245d48b7b3e5ae0f79cde6db8d1cece74733`.

Normal and frozen private installs pass without overrides or local paths. The
ordinary lockfile equals the exact source lockfile with only the public SHA
substitution; the registry dependency graph and workspace policy are unchanged
(lockfile SHA-256 `e638345faf5928072f3d7d7fb3b630c1db8a32f4f8a508d033d3d13b1f24056e`).
Installed public-package file sets and bytes match the published Git objects
exactly: **10 internal, 20 service, 52 verification and 20 web-service files (102
installed instances)**, including package manifests and license files. The private
license check passes for 389 installed packages / 109 runtime packages and retains
the three MIT dual-license selections. No AGPL implementation was imported into the
proprietary program.

### Actual integrated checks

| Check                                                                    | Result                  |
| ------------------------------------------------------------------------ | ----------------------- |
| Private full server suite                                                | 117/117, 16 files       |
| Private catalog and statutory cancellation focus                         | 10/10                   |
| Both actual programs: Quota/commerce/catalog                             | 11/11                   |
| Public History                                                           | 21/21                   |
| Public abuse/cache/origin limits                                         | 15/15                   |
| Both-program current Guest authority                                     | 33/33                   |
| Operator DE/EN Chromium                                                  | 4/4                     |
| Public/private aggregate typecheck, lint/format, i18n and build          | pass                    |
| Normal/frozen private install and installed package bytes                | pass, no overrides      |
| Both Prisma clients, both message trees, four transport packages/OpenAPI | byte-for-byte identical |
| Controlled Pagefind prerequisites / normal public website build          | pass                    |

These are fresh checks against the integrated pair and actual published transport;
source-only override runs are historical evidence. Turbo reused unchanged valid
results where the aggregate logs say cached. The current recipe/source/artifact
controlled Pagefind cache verifies; no native fallback or fresh compiler-build claim
was substituted. All 48 closed source-evidence files also match their original
hashes (source manifest SHA-256
`3006324a38f30f1b7e61fc77f21295e9731d0424f2bf81bb9d8c49f1eb0b62ed`).

The new catalog fixture honors the existing configurable API/service ports and a
second-API port setting, retaining the source defaults; this is fixture portability
only. No product regression fix or new behavioral red/green cycle was required.

The first full reproduction comparison failed only because shared Turbo output
restored a generated Paraglide README with the source checkout's absolute path.
Substituting that exact source path reproduces its original SHA-256. Direct local
generation is stable; the complete before/after repeat includes the README and
passes. No artifact was excluded, hand-edited or relabeled as reproduced. The
initial failure and diagnostic remain in the closed evidence.

### Preserved behavior

Catalog changes append immutable complete versions and Plan rows. Existing Order
terms, running grants, prices, tax snapshots, PDF and UBL invoice archive bytes
remain unchanged; new purchases and next applicable periods use effective terms.
Future scheduled effective dates survive a subsequent review. Renewal preparation
keeps the billing anchor, requests no proration and has append-only recovery
keys/evidence; provider price/tax binding and real notice qualification remain.
Fresh operation-bound proof, current `catalog:write` permission, controlled reason,
idempotent receipt/status recovery and twelve-month audit remain enforced.

The affected suites preserve live counts across policy/Plan/window/key changes. The
real paired catalog test edits bounded policy/Initial values through Operator HTTP,
reaches two actual verification instances within the cache period, denies on
existing live counts, restarts both programs, observes Guest/Free next-period grants
and completes the injected 24-hour durable width-change drain. Admission and History
settings reach actual consumers; existing retention deadlines are not extended.
Outages fail closed.

Statutory #108 POST cancellation intake retains its narrow independence from
Account, Quota, combined business limits and recovery. The held renewal-provider IO
regression returns a cancellation receipt while IO remains held; renewal preparation
cannot reverse cancellation. Origin/body/schema/deduplication guards remain. No
broader unauthenticated bypass was added. Catalog editing does not qualify any
source/model or bypass outcome-changing #114 activation gates.

### Boundaries and unresolved gates

The real signed hosted adapters are composed with **source-only development
verification**. They produce no calibrated measurement or deployable hosted
qualification receipt. The production loader's gates remain intact. Local acceptance
is distinct from GitHub hosted CI and Q01–Q11 qualification.

Inherited public CI at `2bf6c18` had **673/677** server tests passing: a
superseded-worker timeout, maximum-Check cancellation returning 500 and two
report-lifecycle cases staying generating. Inherited private CI at `4037025` passed
checks and failed the dependency gate on one advisory. Both failed-run logs are
retained. Previously recorded hosted-start qualification blockers remain; this
acceptance clears none of them. No unrelated broad public/load suite was blindly
rerun.

Better Auth remains 1.7.14; minimatch 10.2.6 advisory GHSA-g3hv-75wg-m249 /
CVE-2026-118764 remains blocking, with no forced 11.0.1 override or waiver. All
Selected/dependency, source/rights, complete compatible Measured configuration,
calibration/Quality gate/load, security, legal/tax, provider/merchant/price-change
notices, native browser/accessibility, deployment, restore and release #78 gates
remain where already open. Chromium/axe fixtures are not native browser,
screen-reader or full deployment qualification.

All external payment, VIES, Billit, DOI and mail behavior is fixture/captured
adapter traffic. Actual hash-pinned Saxon-HE 10.9 / official EN16931 UBL Schematron
1.3.17 executes under the receipted JVM. This is no UBL XSD, national
CIUS/XRechnung, full Peppol, real-seller invoice or tax/legal qualification. No live
provider or merchant call, issue mutation/closure, gate waiver or #113 WIP merge
occurred. No merge, ready-for-review or issue closure is claimed.

The [committed evidence summary](112-integrated-evidence.json) records source
ancestry, tested heads, exact five pins/package digests, checks, failures, gates and
the cleanup receipt; its recorded `changedPaths` name this section's former
standalone note, `112-integrated-publication.md`, as it existed at that integration
head. The closed allow-listed manifest hashes 81 files and excludes itself, the
append-only result ledger and later publication/handoff status (SHA-256
`f5f746ffd9880ef1612046c333a8435e05a2242b22de80de1bbbf58534713765`).
