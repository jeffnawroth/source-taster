# #109 — business VAT, immutable tax evidence and Account invoices

This source handoff implements #109 under #70 using ADR-0009, ADR-0019,
ADR-0021, requirements v3.4 and the technical concept/traceability Q05/Q09
boundaries. It does not approve tax rules, a supplier contract, EN16931 production
capability, deployment or release. Read the private `docs/validation-109.md` and
`docs/evidence/109-business-tax-invoices.json` for exact commands and results.

## Implemented behavior

- Before an own binding Check-pack or monthly Pro Order, a business can validate
  its VAT ID. The replaceable private VIES REST adapter binds normalized VAT ID,
  ISO billing country, attempt identity, local time, expiry, provider result and
  original response. Invalid, unavailable, mismatched, superseded, expired and
  foreign-Owner proofs cannot authorize a purchase. A later request supersedes
  earlier requests even if the earlier provider response arrives last. Order
  acceptance and validation completion serialize with current Account authority.
- Explicit versioned tax policy supplies country/business rules, rate, Stripe
  tax-rate identity and allowed payment-country evidence. No reverse-charge,
  exemption, country-conflict rule or sellable rate is inferred. Unsupported
  policy/capability blocks new Orders. The default has no commercial policy.
- Each Order copies accepted country/VAT/provider/policy evidence into an
  immutable purchase snapshot. Paid Check packs additionally bind actual payment
  country, rate identity, net/tax/gross and provider object IDs. Pro stores the
  equivalent paid evidence separately in each immutable invoice, alongside each
  period's catalog evidence. Changed catalog, billing settings or later validation
  cannot rewrite accepted evidence. A renewal with an incompatible rate is
  refused pending qualified handling; no tax fallback is invented.
- Stripe issues/numbers the commercial invoice. The selected Stripe–Billit
  integration must generate its structured counterpart and map the own Order
  reference. The production-capable adapter locates the Billit invoice by Stripe
  invoice number, checks the own reference, retrieves its successful outgoing UBL
  file through the documented Billit API, verifies customer country/VAT and money,
  then runs actual Saxon against hash-pinned official EN16931 Schematron rules.
  It never fabricates a production XML invoice or treats a PDF as structured data.
- Exact UBL bytes, digest, Billit file/order IDs, validator/rules/report hashes,
  qualification reference, issue date and actual gross amount accompany the
  existing immutable PDF/structured archive. Provider outages or failed rules
  leave durable inbox work retryable and grant nothing prematurely. Archive,
  invoice-ID business effect, paid Quota and outbox commit atomically. Existing
  delayed Activation, full usable Check-pack validity, Pro periods, cancellation,
  deletion fences and idempotency remain in place.
- The shared DE/EN Account UI lists and downloads retained invoices in web and
  native extension. Every request uses the current own session/Owner; IDs are not
  credentials. Both PDF and UBL downloads come from the private archive, including
  during provider outages. Server cursor pagination and the transport retain
  access beyond the first 100 invoices. A removed Account control cannot publish
  an in-flight invoice download after it unmounts. Legacy archive entries expose
  only formats actually retained and no invented issue timestamp.
- Both private purchase pages have DE/EN VAT progress, valid, invalid and
  unavailable states. Changing country/VAT invalidates the local proof; the
  service independently checks it at ordering. Purchases/Plan management remain
  web-only; extension forwarding carries no credential. Invoice access is native
  as well as web. No verification content crosses the license/program boundary.

## Supplier and conformance limits

The adapter integrates the actual documented Billit retrieval protocol; automated
acceptance uses only synthetic external payment/VIES/Billit endpoints and captured
mail, real PostgreSQL, both actual programs and actual validator executables.
The synthetic fixture is independently authored and passes the official rules;
it is not a real Billit invoice or supplier qualification.

Validation performed is EN16931 UBL Schematron 1.3.17 with Saxon-HE 10.9. It does
not include UBL XSD, XRechnung/national CIUS, full Peppol validation, legal seller
review or a live supplier/merchant test. The mandatory pre-launch PO sample,
correct seller, DPA, fees, non-Peppol delivery/file availability, integration
mapping, OAuth operation and tax-advisor review stay open. In particular Billit
only documents retrieval of a successfully sent network file here; this is no
claim that an unregistered recipient path is qualified. There is no Mollie,
PDF-only, unvalidated-VAT or guessed-rate fallback. Deployment must provide and
qualify the external JVM/rules toolchain and their licenses; no EUPL rule source
or Saxon code is imported into either application source tree.

Eight full calendar years after the invoice year remain restricted legal
retention, independent of Account deletion. Short-lived unused VAT attempts
expire immediately for purchase eligibility and are swept on commerce maintenance;
accepted evidence remains only with legal/business records. No raw IP or
short-lived abuse-counter material is used as country evidence. #113 must build
its separately authorized legal/DSR/accounting adapter over this archive; ordinary
Account endpoints do not grant post-deletion/support access or private database
access to the verification program.

## History and publication

The existing public T3 checkout/branch `t3/e5c6cd1d` starts at published
`164e3cbc358e706ee91de0cf66159e117e320e11`. The exclusively assigned existing private
checkout starts on unique branch `t3/109-business-tax-invoices-nov2` from published
`c08dbff70975b1ba54240077460a48caa981389b`, preserving `702d681` and completed
100–102 history. Public merge `72e418d` includes committed integration `3a0b39b`;
private merge `a6248f8` includes committed integration `bcf5620`. The later
published tips `2775228f3d7606e3b6151d12a693e3094694fb88` and
`e9a39fde6837e5c6ccb649680b798365af4f549e` are merged through `b441a08`
and `64d0dba`, including the published `3a0b39b` transport pins. No active SOURCE106,
root/private integration checkout, predecessor or other source checkout was edited.
No nested agent, shell worktree, push, PR, issue mutation or activation was used.
The five-hour retry job was not changed.

The parent must publish the resulting public history before private repinning.
All five committed private transport/evidence pins remain published
`3a0b39b99cc28739433380c8183c763cb729eb28`: server's three transport dependencies,
web's service dependency and `scripts/evidence.ts`. Then regenerate the normal
private lockfile, prove frozen installation and compare installed generated
contract bytes. Only the two uncommitted private development override files point
at this assigned public worktree. No unpublished SHA or local path is committed.

All Selected/Better Auth 1.7.14, inherited minimatch/dependency, calibration,
source/load/security/legal/tax/provider/deployment/native-browser and release-78
gates remain. Passing local tests or a narrow npm advisory report closes none of
them. The exact validation and cleanup receipt is recorded below.


## Final handoff — 3 November 2026

Implementation source bytes are public
`b441a0881e830da7df928458cdba183397e8ef57` and private
`7dffa34726824c43fc9a878e73066489b189aed8`. Subsequent handoff commits add only
validation documents and evidence. Latest committed integration tips were checked
again and both merges report “Already up to date.” All four transport packages
were regenerated normally; their tracked artifacts have no source diff.

Retained acceptance, with precise source boundaries and log SHA-256 values in
[the evidence receipt](../evidence/109-business-tax-invoices.json):

- Full private suite: **104/104** before the final legacy-list edge correction.
  Post-publication commerce/subscription/deletion regressions: **34/34**.
- Final business-tax suite: **8/8**, including initial and recurring invoices,
  provider/rate/country failures, supersession, recovery, ownership and the legacy
  period-price correction. No full 105-test run is claimed.
- Both actual programs' Quota/commerce: **10/10**. Actual DE/EN Check-pack/Pro
  purchase → Account list → PDF/XML browser flows: **4/4**, with axe checks.
- Private DE/EN Order/Plan browser tests: **6/6**. Native invoice/forwarding:
  **2/2**; native forwarding against both actual programs: **1/1**.
- Public/private aggregate typecheck, lint/format, i18n and build pass. Controlled
  Pagefind fetch/build/verify pass. Private npm licenses pass; the narrow
  production npm advisory report has no advisories, without closing inherited
  qualification/dependency gates.

The legacy correction reads an existing recurring invoice's retained period
catalog when newer metadata is absent; it never replaces that period's price
with its initial Order price and never backfills immutable evidence.

Public source is clean after the handoff commit. Private application source is
clean except the two explicitly retained development override files; their
committed/development hashes and installed generated-byte comparisons are in the
receipt. The #109-owned PostgreSQL 18 container `st109-owned-pg` on 55811 was
stopped and removed; no other container was removed. Test-created databases,
roles, programs and browsers were cleaned by their fixtures. Ignored controlled
Pagefind and external-validator caches remain for reproduction. The five-hour
retry job was untouched.

Exceptions are preserved, not counted as acceptance: one disclosed live VIES
discovery call used only synthetic invalid `DE000000000`; an initial private
browser setup omitted its explicit PostgreSQL URL and both localhost:5433
connections were refused, with no shared-database connection or mutation.
Earlier setup/fixture/artifact-race failures remain in the durable logs. Accepted
runs use local external-provider fixtures and the task-owned database only.

## Integrated publication — 3 November 2026

Exact public source `1db784def38d7b77720afd66672016203f9220dc` and private source
`42fb5697868f7248cbc6adb757e5a24853cf4466` were merged with normal
history-preserving merges into the exclusively owned public root and private
INTEGRATION. All saved and current ancestors — #107 subscriptions/retained period
catalogs, #106 Orders, #100–102 Account/legal retention, DPA #110 and the private
phases — remain ancestors. No live provider query, issue mutation,
ready-for-review transition, qualification waiver or scheduling mutation occurred.

### Reachable transport and exact installation

Public transport `ba42c6e82937241277c1653e800be944b7e0b932` was published to PR
#139 and linked. Git remote and the GitHub commit API prove reachability before
repinning. All five private locations (server internal/service/verification, web
service and `scripts/evidence.ts`) use that exact commit. Normal lock generation and
normal/frozen installs passed without overrides or development links. All **102**
packaged files across the four installed consumers match that commit byte for byte
(10/20/52/20). Workspace policy and registry graph are unchanged; Better Auth stays
1.7.14.

### Actual integrated validation

Tested application bytes: public `ba42c6e82937241277c1653e800be944b7e0b932`, private
`8e00e8771535547bee99c821d61d6e592600d6a5`. Final publication commits add only
English handoffs and evidence; no application or transport byte changes follow
acceptance. Commands, environment, source ancestry, installed hashes, toolchain
hashes, log SHA-256 values and cleanup are in
[the integrated receipt](../evidence/109-integrated-publication.json).

- Public/private typecheck, lint/format, i18n and build pass. Public controlled
  Pagefind fetch/build/verify pass. Four transport packages regenerate without
  tracked differences; local Prisma/catalog repeat generation is identical.
- Focused private tax/commerce/subscription/deletion: **35/35**, including all **8**
  final business-tax cases. Complete final private suite: **105/105**. The source's
  earlier **104/104** is retained at its earlier pre-legacy-fix boundary; it is not
  relabeled as a final-source test.
- Both actual programs, Quota/commerce: **10/10**; real authority/SSE/deletion:
  **33/33**. These use the repinned private installation and real PostgreSQL.
- Actual DE/EN Check-pack and Pro purchase → Account invoice list → PDF/XML browser
  downloads and axe checks: **4/4**. Private DE/EN Order/Plan browser: **6/6**.
  Native invoice/download/forwarding: **2/2** (real native extension, verification
  and PostgreSQL with a synthetic private HTTP edge). Additional native safe
  forwarding against both actual programs: **1/1**.
- Actual Saxon-HE 10.9 executes hash-pinned official EN16931 UBL Schematron 1.3.17.
  Java version and all JAR/rules ZIP/stylesheet hashes are receipted. The private
  npm-license inventory passes (389 installed/109 runtime packages), without
  approving external JVM/rules distribution or deployment licenses.
- Direct release guard still refuses with **78**: no eligible Measured
  configuration, load report, calibration or measurement location.

The accepted HTTP/download seams cover VAT proof/country/rate binding before the
Order/payment, immutable accepted evidence, provider outage recovery,
reconciliation/idempotency, current Account/Owner and revoked-session fences, exact
archived XML/PDF retrieval, recurring period catalog selection and the legacy
retained-period price. Eight-year invoice legal retention stays separate from
verification retention and Account deletion; deletion does not erase the statutory
archive or extend verification retention. #113's restricted legal/DSR/accounting
retrieval/export workflow is not implemented by these Account routes.

### Failed runs and limits

The first generated-artifact check failed on a catalog README restored by the shared
Turbo cache: it contained absolute documentation paths from the source checkout. A
controlled cached-build comparison proved that only README differed; executable
catalog bytes were identical. Both local generators then ran normally, repeated
output matched exactly, and artifacts stayed frozen throughout acceptance. The
failure and diagnostic are retained rather than counted as acceptance. No
hand-edited generated output or new application fix was required.

The pnpm-wrapped release invocation returns 1 while reporting child exit 78; the
direct invocation independently records actual exit 78. Neither is a passed release
gate. Earlier source-disclosed VIES discovery/shared-5433 setup and source
artifact/browser setup failures remain historical exceptions, not acceptance; none
was repeated here. Previous hosted public CI failed on formatting already corrected
in the exact source; previous private dependency CI was blocked by the minimatch
advisory. Hosted PR status is reported separately from local acceptance.

- EN16931 UBL Schematron 1.3.17 with Saxon-HE 10.9 only; no UBL XSD, XRechnung/national CIUS, full Peppol, live supplier/merchant, tax, legal or delivery qualification.
- Billit retrieval uses documented protocol and independently authored synthetic fixtures, not a real merchant invoice or correct-seller PO sample. The supplier contract/DPA/fees, Stripe mapping, non-Peppol file availability/delivery, OAuth lifecycle and tax-advisor evidence/conflict/reverse-charge/retention review remain open.
- External EUPL rules/JVM/Saxon licensing and deployment qualification remain gates. No rule/JVM source is imported into application modules.
- All Selected/Better Auth 1.7.14, minimatch/dependency, mandatory source activation/rights, load, calibration/Quality gate, security, legal/tax/provider, browser/accessibility, deployment and release gates remain. minimatch 10.2.6 has no approved compatible 10.x fix; no forced-major waiver.
- No issue closure, ready-for-review transition, qualification waiver, fallback provider, PDF-only invoice, unvalidated VAT or guessed rate is authorized. #108 remains separate; #113 legal/DSR/export retrieval remains separate.
