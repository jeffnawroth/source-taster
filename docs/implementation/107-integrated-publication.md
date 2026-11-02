# #107 published integration — 2 November 2026

The exact completed sources were integrated by fast-forward: public
`3a0b39b99cc28739433380c8183c763cb729eb28` and private
`bcf5620e0ee9dd8dfd458bf3853ededceed82492`. Prior published public
`164e3cbc358e706ee91de0cf66159e117e320e11` and private
`c08dbff70975b1ba54240077460a48caa981389b`, saved #106 history, DPA #110,
commerce #106 and Account phases #100–102 remain ancestors. No implementation
conflict or integration code correction was needed. No source workspace was
edited and no local override file was copied.

Public transport was pushed first and PR 139 linked immediately. GitHub's branch
and commit API confirmed the published SHA. All five private locations now pin
that exact reachable commit: server internal/service/verification, web service,
and `scripts/evidence.ts`. Ordinary `pnpm install --no-frozen-lockfile` regenerated
the lock; frozen installation passed. The lock diff is exactly the old-to-new SHA
replacement, with no registry graph or workspace-policy change. All installed
package files match published Git bytes: 10 internal, 20 service, 52 verification,
and 20 web service files (102 comparisons). No workspace overrides are present.

## Final acceptance

- Private complete suite: **97/97**, including final current-email correction,
  subscription/commerce, DPA, Account language/Preferences, authority and outbox.
- Both actual programs Quota/commerce: **10/10**.
- Both actual programs authority/SSE/deletion: **33/33**.
- Actual DE/EN commerce management browser and axe: **4/4**.
- Actual signed-in native Chromium forwarding: **1/1**, with no credential in
  navigation and no extension commerce call.
- Public affected server/web/extension/UI/contracts and private server/web
  typechecks, focused public lint/full private lint, DE/EN completeness and builds
  pass. Prisma and catalogs were generated normally. Four public contract trees
  regenerate byte-for-byte; private generation adds no tracked output changes.
- Controlled Pagefind verifies normally. Release guard retains expected **exit 78**
  (`no-load-report`, `uncalibrated`, `no-measured-configuration`,
  `no-measurement-location`).

The real PostgreSQL/HTTP/download/captured-mail/payment-adapter tests cover
catalog Pro 1,000, earliest-expiry and base-Plan equal-expiry allocation, feature
union, immutable initial and renewal catalog/legal records, out-of-order and
idempotent reconciliation, full calendar periods from delayed activation, no
unpaid grace, durable cancellation during provider outage, paid-period end and
reconciliation, current Account email/language, and the provider fence before
Account deletion. Current authority/SSE and independent session behavior are
preserved. Only payment/mail/time at the declared external seams are synthetic.

The source's historical **96/96** and later **12/12** evidence remain distinct;
31 historical log hashes were verified. The new **97/97** is an independently
executed final integrated suite against published pins. All requested functional checks passed. An additional raw generated-tree comparison
failed because shared Turbo cache restored a catalog README with the source
checkout's absolute path. A diagnostic cached build proved only `README.md`
differed; runtime files were identical. Ordinary local regeneration followed by
repeated full raw-byte comparisons passes for both Prisma and catalog trees. The
failed comparison and diagnostic remain in evidence; cache policy is unchanged.
One setup-only invocation used unavailable `python` (exit 127) before execution;
rerun with `python3` passed. No gate was weakened.

Exact commands, environment, log SHA-256/byte counts, pin-package file hashes,
ancestry and cleanup are in [the publication evidence](../evidence/107-integrated-publication.json).
Durable logs are rooted at `.tmp/spec-70-orchestration/107-integrated-*` in the
public repository. Test fixtures clean their own databases/processes/profiles;
the task-owned PostgreSQL container on 55711 was verified by full ID, observed
with zero other client backends, then removed. Owned ports 5701/5702/5703/5471
and 55711 are free. Unrelated resources, including active #109, were untouched.

## Remaining gates and ownership

- Local integration acceptance is distinct from GitHub CI; both PRs stay draft and issues stay open.
- Synthetic Stripe and captured mail prove only the stated adapter behavior. Live Stripe/PayPal, recurring issuer/SCA, merchant configuration, real delivery and legally qualified provider retries remain gates.
- Legal/DPA/retention/contract wording, VAT/tax/EN 16931 and deployment qualification remain gates. Immutable retained records are preserved; fixtures do not qualify legal effects.
- Better Auth remains 1.7.14. Inherited minimatch 10.2.6 advisory remains; 11.0.1 is outside current parent 10.x ranges. No override, waiver or forced major update.
- Selected/dependency/security, allSelected/source rights, calibration/Measured activation, load, Q01-Q11 browser, deployment and release-78 gates remain.
- No #108 anonymous statutory cancellation or #109 tax/e-invoice work is included. The enabled five-hour retry job and active #109 workspace/resources were untouched.

The publication does not merge or mark either draft PR ready. CI/reviews are
reported separately at handoff; local passes are not CI passes. No issue was
closed, no gate waived, no nested agent/Claude used and no retry job changed.
Exclusive public-root and private-INTEGRATION ownership is released for the
parent's next #108 work while #109 continues independently.
