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

The private committed transport/evidence pins remain at the published
`39f1409939cc950f9ce7874183a8d69567024ba9`. Development uses intentionally
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


## Final cross-program and client checks

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

A final fetch still reports public integration
`c0cb0baf99302b759440524b9d0deb47751d43a6` and private integration
`63952462cb70bc2c8ce17fdcc464d7c17fd564b1`; both are already ancestors.
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
