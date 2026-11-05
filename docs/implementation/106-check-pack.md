# #106 Check-pack implementation and acceptance — 2 November 2026

## History and program boundary

Public branch `t3/complete-issue-106-commerce` in
`/Users/jeffnawroth/.t3/worktrees/source-taster/t3-1661c6d1` preserves saved
`8405a6e` and integration `c0cb0baf99302b759440524b9d0deb47751d43a6`
through merge `c19073b`. Private branch `t3/106-check-pack` in
`/Users/jeffnawroth/Developer/st-worktrees/source-taster-service-106` preserves
saved `484e90f` and integration `63952462cb70bc2c8ce17fdcc464d7c17fd564b1`
through merge `01ccacd`. Private implementation commit: `25eb768`.

The public program owns only dual-licensed transport contracts, purchase links
and verification/client acceptance. The private service owns the catalog,
Order page, billing, legal evidence, Stripe adapter, invoice archive and mail.
The public merge retains both the report and commerce translations. Regenerating
the report transport from source in `adf1679` adds the missing `check-pack` grant
to its generated declarations; no generated file was hand-edited.

## Acceptance coverage

- Versioned catalog entries supply price, Quota, validity and features. Orders
  retain exact catalog, billing and legal snapshots when the catalog changes.
- The private DE/EN Order page shows exact configured terms and withdrawal text,
  a gross VAT-inclusive total next to the obligation-to-pay button, required
  terms acceptance, and a separate initially unticked immediate-start consent.
- Only an authenticated current web session with an allowed Origin can order.
  Strict input contracts reject client prices/payment/grant fields. Provider
  customer and hosted payment creation have stable Order idempotency keys.
- A success redirect grants nothing. The signature-checked durable inbox reads
  back the paid invoice and stored Checkout association and validates amounts.
  Invoice business identity and event delivery are separately deduplicated.
- Consent activates on confirmed payment; otherwise activation waits until the
  fourteen-day withdrawal period ends. Full validity starts at Activation.
  Expired packs stop contributing Quota/features. Free remains alongside packs;
  real journal reservations consume the earliest-expiring grant first.
- Binding Order evidence and archived PDF/structured invoices reject mutation,
  deletion and truncation. Invoice access requires the current owning web
  session and stops after eight full calendar years following the invoice year.
- Order and purchase/invoice notifications use the durable private outbox,
  localized multipart mail, exact legal snapshots and the archived PDF attached.
  Failed mail stays queued and the confirmation remains available in the product.
- Reconciliation discovers lost events through stored Checkouts and queues each
  invoice durably. An unpaid invoice or unavailable Checkout cannot stop recovery
  of other paid purchases. Existing per-invoice backoff remains in force.
- #111 now displays the latest locally recorded Check-pack Order payment state
  (`none`, `awaiting-payment`, `paid`, `expired`); commerce disabled stays
  `unavailable`. This is not a live Stripe availability assertion. Its protected
  response contains no billing address, legal packet or verification content.
- The extension's Plan/purchase entry opens the safe private web Order page in
  a new tab with `noopener noreferrer`, without forwarding an extension token or
  making commerce requests in the panel. The web uses its independent session.

## Reproducible local evidence

Current logs live in
`/Users/jeffnawroth/Developer/Repositories/source-taster/.tmp/spec-70-orchestration/106-nov2-*`.
Historical `/tmp/st106-*` names from earlier handoffs are not new evidence.
The pre-existing assigned `st106b-pg` PostgreSQL 18 instance on 5441 was reused;
API/service ports were 5501/5502 and the Order browser used 5503. Fixtures create
and remove their own databases, roles, temporary configurations and browsers.
No unknown container was removed and shared PostgreSQL 5433 was not used.

Test-first cycles at the already approved seams:

- `legal-red-focused.log` fails because the service role can overwrite legal
  evidence; `legal-green.log` passes after the immutable-evidence migration.
- `operator-red.log` sees `unavailable` where a configured shop must report no
  Order; `operator-green.log` passes after commerce/#111 composition.
- `reconcile-red.log` fails when the first unpaid invoice aborts reconciliation;
  `reconcile-green.log` passes with durable per-invoice processing.

Commands run from the matching repository root (all log basenames below carry
prefix `106-nov2-`). Private database commands use
`DATABASE_ADMIN_URL=postgres://postgres:postgres@127.0.0.1:5441/postgres`
and `SOURCE_TASTER_TEST_SERVICE_PORT=5502`:

- `pnpm --filter @source-taster-service/server exec vitest run`: **62/62**, eight
  files (`private-server-final.log`), including ten commerce tests, current
  authority, Quota, Operator and real captured-SMTP regressions.
- `SOURCE_TASTER_TEST_COMMERCE_WEB_PORT=5503 pnpm --filter
  @source-taster-service/web exec playwright test --config
  commerce.playwright.config.ts`: **2/2**, DE/EN plus axe (`order-browser.log`).
- Private `pnpm typecheck`, `pnpm lint`, `pnpm build`, `pnpm i18n:check`: pass
  (`private-typecheck.log`, `private-lint.log`, `private-build.log`,
  `private-i18n.log`).
- Public direct `tsc -p tsconfig.json` and package lint for server, web, extension,
  UI and affected contracts pass; DE/EN completeness, Prettier, server/web and
  both extension-target builds pass (`public-*-focused.log`, `public-lint.log`,
  `public-i18n.log`, `public-format.log`, `core-build.log`, `public-web-build.log`,
  `public-extension-build.log`).
- Direct `node apps/server/scripts/release-check.ts` refuses with **exit 78**
  (`release-direct.log`): missing eligible measurement, calibration and real-load
  evidence. This is the intended release gate, not acceptance of a release.

The first public server build lacked the core build artifacts; building core
first corrected it. The root public `pnpm typecheck` cannot complete in this
fresh checkout without the controlled Pagefind source build; its log records
that missing prerequisite. The affected packages were checked directly. An
initial private `pnpm ... test -- ...` invocation did not filter Vitest and was
interrupted; overlapping attempts are superseded by the successful serial
62-test run. No interrupted run is counted as a pass.

## Publication pins and limits

The private committed transport/evidence pins, after the final integration merge,
are at published `36aea2a7b04a20426b5081790827b4e63b88d3c5`. Development uses intentionally
uncommitted `pnpm-workspace.yaml` and lockfile overrides, now pointing only at
this public worktree. They must remain local. These local tests do not prove
that the committed private pins contain the new commerce contracts.

The parent must publish this public branch before repinning the three server
transport dependencies, web service dependency and `scripts/evidence.ts`, then
regenerate the private lockfile without local overrides and verify a frozen
installation. Never pin an unreachable SHA. No push, PR or issue mutation was
performed here.

Stripe fixtures are synthetic regressions against the pinned 2024-06-20 protocol,
not recorded merchant-account captures. Card/PayPal fields and a 3DS request are
verified locally; actual PayPal enablement, forced issuer challenge, merchant
approval and real provider/mail delivery remain qualification work. No actual
payment or external mail was sent. The fixture EUR 11.90 price is not a chosen
commercial price; no sellable default catalog or legal packet is seeded.

Legal/tax review, Q01–Q11, EN 16931, the Better Auth Selected-release gate,
dependency/security/source-rights checks, calibration and real-load gates remain.
#107/#108/#109 are not implemented here; VAT ID validation/reverse charge,
refund/Withdrawal/later-consent workflows, subscriptions and accounting export
remain their explicit follow-up seams. SMTP acceptance before a receipt commit
can still resend a stable Message-ID after a crash. Expired invoice deletion
requires a future restricted maintenance procedure; no application delete route
is enabled. Retained Orders likewise require a reviewed retention policy.


## Acceptance before the final integration merge

The same PostgreSQL 5441 instance and API/service ports 5501/5502 were used
serially. For public real both-program runs, export these exact values:

```sh
export DATABASE_ADMIN_URL=postgres://postgres:postgres@127.0.0.1:5441/postgres
export SOURCE_TASTER_TEST_API_PORT=5501
export SOURCE_TASTER_TEST_SERVICE_PORT=5502
export SOURCE_TASTER_SERVICE_WORKTREE=/Users/jeffnawroth/Developer/st-worktrees/source-taster-service-106
pnpm --filter @source-taster/server exec vitest run --config quota.vitest.config.ts
pnpm --filter @source-taster/server exec vitest run --config guest.vitest.config.ts
```

- `106-nov2-both-quota-commerce.log`: **9/9**, two files, both real programs.
  The paid pack becomes visible at the verification Quota API; a real Check
  consumes one Reference through the existing settlement journal.
- `106-nov2-both-authority.log`: **33/33**, real signed assertions, current
  authority, permission/key rotation, worker fencing, protected output and SSE
  regressions. The deployable unmeasured hosted program still refuses activation.
- `106-nov2-commerce-final.log`: **11/11** private commerce cases. This reruns
  all ten commerce cases from the 62-test server pass plus the final test-only
  regression for stale legal/catalog versions, rejected client payment fields
  and abandoned Order expiry. The extra regression required no production change
  and is not claimed as an additional red/green cycle.
- `106-nov2-native-forwarding-green.log`: **1/1**, actual unpacked native
  Chromium panel opens the safe web Order page with no extension credential.
  The first attempt (`native-forwarding.log`) stopped at fixture setup because
  the explicit PostgreSQL URLs were omitted; it is not a product failure or a
  passing test. The corrected command from the public root was:

```sh
DATABASE_ADMIN_URL=postgres://postgres:postgres@127.0.0.1:5441/postgres \
DATABASE_TEST_URL=postgres://st106_native:st106_fixture_only@127.0.0.1:5441/st106_native \
SOURCE_TASTER_ACCOUNT_TEST_API_PORT=5501 \
SOURCE_TASTER_ACCOUNT_TEST_SERVICE_PORT=5502 \
SOURCE_TASTER_ACCOUNT_TEST_WEB_PORT=5503 \
pnpm --filter @source-taster/extension exec playwright test --config account.playwright.config.ts --grep 'purchasing and Plan entries'
```

The native fixture derives unique database/role names from that test URL and
removes them. Its password is local synthetic fixture data only.

All four contract trees reproduce without changes after
`pnpm --filter './packages/contract-*' build`
(`106-nov2-contract-reproducibility.log`). Final private typecheck and lint
also pass after the final test addition (`private-typecheck-final.log`,
`private-lint-final.log`, both with the `106-nov2-` prefix).

At the earlier validation boundary, the fetched public integration was
`c0cb0baf99302b759440524b9d0deb47751d43a6` and the private integration was
`63952462cb70bc2c8ce17fdcc464d7c17fd564b1`; both remain ancestors.
All saved history remains. No root/integration source worktree was edited.
The temporary merge-preservation stash was removed after restoring the two
intentional local override files; unrelated shared-repository stashes remain.


The private Operator browser checks also pass **2/2**
(`106-nov2-operator-browser.log`), including DE/EN fresh-proof credit and lost
response recovery, using this command from the private root:

```sh
DATABASE_ADMIN_URL=postgres://postgres:postgres@127.0.0.1:5441/postgres \
SOURCE_TASTER_TEST_SERVICE_PORT=5502 SERVICE_E2E_PORT=5503 \
pnpm --filter @source-taster-service/web exec playwright test --config operator.playwright.config.ts
```

The pre-existing private dependency advisory noted by the integration handoff
(`minimatch@10.2.6`, GHSA-g3hv-75wg-m249 / CVE-2026-118764) remains an open
dependency gate. No dependency exception or production-readiness claim is made.
No new PostgreSQL container was created. Test-owned processes, browsers and
fixture resources were stopped by their cleanup; the pre-existing assigned
`st106b-pg` is left running, and unknown older resources are left untouched.


Cleanup also identified three databases orphaned by the interrupted initial
commands: `st_service_f67ab29a4bf243d791828ed7ba7539c3`,
`st_service_e7f91162a6c844929ee0b42f1f1977e7` and
`st_service_e6d7b8810fa24dda9571da2b66f983a5`. Their PostgreSQL directory birth
times were 04:26:19/04:26:54/04:26:55 UTC on 2 November, inside those attempts;
all other remaining databases predated this run. After verifying no active
connections, those three databases and their corresponding `service_…` roles
were dropped. Older databases were preserved. Ports 5501/5502/5503 are free.


## Latest committed integration merge (supersedes earlier tips/pins)

A final fetch discovered newly published public integration
`36aea2a7b04a20426b5081790827b4e63b88d3c5`. Merge `5ccc7ac` preserves that
entire DPA client history together with the saved #106 history, keeping both
commerce and DPA exports/routes/messages and regenerating contract artifacts
from source. The first combined test exposed a real pair mismatch:
`dpaAccountUrl` from the public fixture was rejected by the older private
configuration (`106-nov2-latest-both-quota-commerce.log`: 7 pass / 2 fail).
No schema check or fixture assertion was relaxed.

The newer **local committed private integration** was already at
`164d18ae0af2d54d13a95db996673105ae11c412`, while its remote-tracking ref
still pointed at `6395246`. Merge `b83830b` incorporates that matching DPA
implementation into the assigned private branch, retaining both Prisma model
sets, both service mounts, and both language catalogs. It also inherits the
already published `36aea2a` dependency/evidence pins. Those committed pins
still lack #106 commerce additions; publication and a subsequent private repin
remain mandatory. The uncommitted development overrides are preserved and
continue to link only the assigned public worktree.

All four merged public contract trees rebuild without further changes
(`106-nov2-latest-contract-reproducibility.log`). Direct affected public
typechecks, lint, formatting and DE/EN completeness pass. A build initially
overlapped contract regeneration and lost a generated client during resolution;
`106-nov2-latest-public-build.log` records that failed attempt. The serial
server/web/Chromium/Firefox rebuild passes
(`106-nov2-latest-public-build-serial.log`). The latest combined private
`pnpm typecheck`, `pnpm lint`, `pnpm build` and `pnpm i18n:check` pass
(`106-nov2-combined-private-{types,lint,build,i18n}.log`). Earlier server and
browser results remain historical evidence; the repeated acceptance on this
merged pair is recorded below.


## Acceptance on the published DPA integration pair

The local private integration's subsequent evidence-only commit
`f9429e38aa19088a7874ea59cf794b59697804a8` is also merged, through `8b4df85`;
no Account, Operator, DPA or commerce implementation changed in that addition.
The user independently confirmed public `36aea2a` and private `f9429e3` as the
published integration pair. The inherited five private pins use published
`36aea2a`; the parent's normal/frozen installation and byte-verification evidence
is preserved in its DPA handoff. Our #106 development still uses local overrides
because these published pins do not contain the commerce contract additions.

Repeated serial acceptance on the merged pair:

- `106-nov2-combined-private-server.log`: **70/70**, nine files (all private
  server seams, including eleven commerce regressions and preserved DPA cases).
- `106-nov2-combined-both-quota-commerce.log`: **9/9**, both real programs.
- `106-nov2-combined-both-authority.log`: **33/33**, both real programs,
  including the newly integrated surviving-stream authorization fence.

These commands use the exact same owned PostgreSQL/port/worktree variables
shown above. No unrelated DPA browser/qualification suite is claimed or rerun.
The later Activation-only correction and its focused revalidation follow below;
the 70-test result is not relabeled as a new 71-test full run.


## Final Activation correction and focused acceptance

Private `2c1786d59997c96bb23b525bc5f76576c97c247a` fixes a final worker-outage
edge: a pack paid without immediate-start consent could be activated on day 21
but backdated to scheduled day 14, losing seven usable days. The new HTTP test
fails on that shortened expiry (`106-nov2-activation-red.log`). Activation now
records its actual execution time and gives the full catalog validity from that
time. The original scheduled deadline remains immutable evidence. The Order API
shows actual Activation after activation, and the scheduled date while pending.

- `106-nov2-activation-green-commerce.log`: **12/12**, all private commerce
  cases after the correction, including this red/green regression.
- `106-nov2-final-both-commerce.log`: **1/1**, real both-program paid purchase
  and Check settlement after the correction, using:
  `pnpm --filter @source-taster/server exec vitest run --config quota.vitest.config.ts test/commerce.contract.ts`
  with the same PostgreSQL/worktree/port environment above.
- Final private typecheck and build pass (`106-nov2-final-private-types.log`,
  `106-nov2-final-private-build.log`). A first final lint found only the newly
  extended handoff's formatting; the formatted final lint is recorded separately.

The final correction touches only private commerce Activation/view behavior.
The earlier 70-test full private run, nine-test Quota/commerce run and 33-test
current-authority run are retained as the integration evidence; only the
affected commerce suite and actual both-program purchase were repeated after
that correction. No unperformed full 71-test run is claimed.


Final client revalidation after the correction passes: native Chromium forwarding
**1/1**, DE/EN Order page plus axe **2/2**, Operator browser **2/2**. Logs:
`106-nov2-final-native-forwarding.log`, `106-nov2-final-order-browser.log`,
`106-nov2-final-operator-browser.log`. The commands/environments are the same
as those shown above. `docs/evidence/106-check-pack-nov2.json` commits exact
commands, integration/implementation boundaries, actual test counts, log sizes
and SHA-256 digests, including all four red-before-green failures. It explicitly
distinguishes the full-suite boundary from the final focused revalidation.

## Public integration publication — 2 November 2026

Public integration fast-forwarded the published DPA head
`36aea2a7b04a20426b5081790827b4e63b88d3c5` to the exact completed #106 source
`1e5e6fca3180ca5d9e5c987ff491ef220ff02ad7`. The publication commit added only a
handoff and check evidence. All saved source history and the current DPA and
surviving-session SSE fence remain ancestors. There were no conflicts,
source-workspace writes or copied private overrides.

The public program retains only transport, client forwarding and verification
acceptance. Catalog, binding Orders, provider reconciliation, immutable legal and
invoice evidence, actual Activation and mail stay in the private service. All twelve
historical evidence-log hashes were verified; their results retain their original
boundaries, including the 70-test full run before the final Activation correction.

Publication checks: the integration root passed frozen installation, Prisma/catalog
generation, all four contract rebuilds, tracked artifact reproducibility,
controlled Pagefind verification, aggregate typecheck, lint/formatting, DE/EN
completeness and build (verification server, web app and Chromium/Firefox targets).
[Exact commands, exits and log digests](../evidence/106-integration/public-checks.json)
are local evidence, not a claim of GitHub CI success. The already controlled
Pagefind installation verifies normally; no fetch/build bypass was introduced.
Direct `node apps/server/scripts/release-check.ts` still refuses with exit **78**:
no load report, uncalibrated scoring, no Measured configuration and no measurement
location. This is the preserved release gate.

Private publication boundary: the history-preserving public head was published on
[PR #139](https://github.com/jeffnawroth/source-taster/pull/139) and had to be
confirmed remotely reachable before use as a private pin. Private integration
fast-forwarded `f9429e3` to exact completed `1f2c7f33b70b8e44a07beadffaa7b7e40340bf12`.
The next phase had to change all five transport/evidence pins to the actual public
publication SHA, regenerate the ordinary lockfile with no overrides, pass
normal/frozen installs and compare installed package bytes against that commit. The
private integrated handoff in PR #9 records that final pair and the focused real
commerce/Quota/current-authority and client checks; this public pre-publication
record does not preclaim them.

Gates: the known minimatch 10.2.6 advisory GHSA-g3hv-75wg-m249 stays blocking;
patched 11.0.1 lies outside the current parents' declared 10.x ranges. No
forced-major override or exception is approved. Better Auth 1.7.14 and its Selected
transitive gate remain. Legal/tax, actual payment/mail provider, source rights,
security, calibration, real load, browser qualification, deployment and Q01–Q11
gates stay open. Synthetic Stripe fixtures and narrower browser regressions are not
merchant or release qualification. #107/#108/#109 are not implemented here. No
issue closure, ready-for-review or release claim is made.
