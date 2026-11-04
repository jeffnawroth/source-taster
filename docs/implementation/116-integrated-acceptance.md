# #116 and completed CI source integration — 4 November 2026

This receipt covers code, normal local tests and the human handoff only. Actual cloud acceptance for #116 remains incomplete. It does not qualify #70, activate a Measured configuration, close an issue, change a job or authorize a deployment. The parent owns the subsequent whole-spec two-axis review, fixes and launch acceptance.

## Exact ancestry and transport

History-preserving merges integrated public #116 `0571e2cc412b2a063c3824debada26f0a4886ad8`, private #116 `8b19c7e626f49eb682f082b0901e1f783c74ac0f`, then the completed public CI source `577ea841c29cffbafcc8f854c876436a6447aa2e`. Both previously published bases remain ancestors: public `28056f575cb165f7d511c268a5d16036c98b3efd`, private `13021cdd52342a24f0b3ff414a1991f266e99889`. The #113/#114 pair is preserved. No source workspace, preserved override, private main or predecessor was read for implementation or written. Only the specifically requested source handoffs were read outside the two integration worktrees.

Tested implementation heads are public `4db04c2a368f4ddb29100e88ac00a215bc774c2d` and private `ea944c642c392be9124d6b9539426a4e8669f3f1`; the final commits add handoff evidence only. Publication heads and remote/clean/check/review snapshots are retained in the ignored `116-integrated-published-handoff.json` and returned with [public PR #139](https://github.com/jeffnawroth/source-taster/pull/139) / [private PR #9](https://github.com/jeffnawroth/source-taster-service/pull/9). Both remain drafts.

#116 and the CI source add no shared transport. All four complete contract package trees match published `d50b0ac24273515e5f291de58aa29d7856f99475`; all **78 tracked generated transport/OpenAPI outputs** reproduce unchanged. All **five** canonical private references, their lock resolutions and `scripts/evidence.ts` retain that pin. All **106 installed package files** across the four consumer instances match the pin byte for byte, including package/license assets. The private lock, workspace policy and dependency graph remain unchanged from the published integration base; Better Auth stays 1.7.14. There are no local overrides or workspace links.

## Combined local verification

Both repositories passed normal `pnpm install` and `pnpm install --frozen-lockfile` without overrides, then Prisma/catalog generation, aggregate `pnpm typecheck`, `pnpm lint`, `pnpm i18n:check` and `pnpm build`. Controlled `pnpm pagefind:fetch`, `pagefind:build`, `pagefind:verify` and both installed-package license checks passed. The external hash-pinned EN16931 JVM/rules setup passed locally with Java 27.0.1; supplier, runtime, tax and legal qualification remain human.

| Actual command group | Result | Log prefix `116-integrated-` |
| --- | --- | --- |
| Both programs, `node --test --test-concurrency=1 apps/server/test/operations/*.test.mjs` | 5 public + 5 private passed | `public-operations.log`, `private-operations.log` |
| CI cancellation/report/lifecycle/retention/revision/events/fairness complete files | 45 passed, 10 files, no skips | `public-ci-regressions-final.log` |
| Quality CLI/release/gate/load-release, AI activation/extraction, revision/lifecycle complete files | 79 passed, 8 files, no skips; overlaps the previous group | `public-quality-ai-lifecycle.log` |
| Full v1/v2 runtime OpenAPI document comparison | 1 passed; other cases unselected by `-t`, none disabled | `public-openapi.log` |
| Private complete server suite | 128 passed, 19 files, no skips | `private-suite-final.log` |
| Actual paired configuration HTTP | 2 passed | `paired-configurations.log` |
| Actual paired recipient DSR/privacy/streaming HTTP | 7 passed | `paired-dsr.log` |
| Actual retained History/expiry HTTP | 21 passed | `public-history.log` |
| Chromium DE/EN maintenance display and withdrawal | 2 passed | `maintenance-browser.log` |

The CI source's 93 distinct focused cases are covered by the 45-case group, the 47 quality/load guards within the 79-case group, and the OpenAPI comparison. Do not add overlapping groups into an inflated distinct total. Maximum cancellation still exercises 1,000 References, v1/v2 ordered SSE and idempotency over controlled PostgreSQL latency under the unchanged five-second transaction deadline. Slow-report cases still invoke the real bounded renderer after a 1,500 ms composition delay and observe within the existing ten-second report window. No blanket skip, retry, production timeout, fairness assertion or qualification gate changed. This is local validation; the older hosted fairness-order failure remains unreproduced and new hosted CI is not inferred from local passes.

The normal regeneration comparison covers **1,903 identical files**: both Prisma clients and full message trees, all four contract dist/OpenAPI trees and **102 private compiled server/web files**. Direct commands, before/after SHA-256 manifests and the summary are retained. The first comparison differed only in the public generated Paraglide README's cached absolute project path. Normal generation refreshed that ignored metadata; a complete repeated comparison, including the README, matched without exclusions or hand edits.

Canonical private packaging and extraction passed, preserving real Git identity `ea944c642c392be9124d6b9539426a4e8669f3f1`, a clean index and the built platform check. Archive SHA-256 was `28aaae99a85fb0e34df6da149eda0ce135aa1b372240738f997a3c8cd264f837`; the owned archive and extraction were removed. This is a local artifact regression, not Linux/Scalingo qualification. The public publication package still refuses with **78**. Ordinary release and each unconfigured deployment preflight also refuse with **78**. No successful release/publication/approval receipt was synthesized.

The fresh canonical private dependency scan covers **519 npm + 3 Git = 522** locked packages and still refuses on exactly **GHSA-g3hv-75wg-m249**. An earlier scan correctly refused stale evidence; it is retained as a failure, not counted as a pass. Fresh public/production eligibility is not implied by installed license checks. Selected/minimatch, Better Auth, source rights, #138/#140/#136 recorded replay, calibrated frozen Quality/live load, provider/EU zero-retention, isolation, browser, security, legal and tax gates all remain mandatory.

## Workflow audit before push

Both deployment YAML files expose **only `workflow_dispatch`**, name the independent `scalingo-paris-verification` / `scalingo-paris-service` environments, require fresh successful exact-SHA CI including dependencies, signed exact-code/config approvals and existing release/registry/provider/source/load gates, and refuse missing inputs before any provider command. Ordinary CI has no real cloud deployment command. The GitHub environment APIs returned **no provisioned environments in either repository**; declared environment names are not evidence of configured protection rules. The human must create/restrict/review them and provision missing secrets/variables before any manual dispatch. No environment, secret or workflow was dispatched or configured here. Existing cron triggers are unchanged. Ordinary CI contains only the incoming #116 operations-test addition; the five-hour job is untouched.

## Retained operations and human ownership

| Area | Integrated local preparation | Remaining human acceptance / owner |
| --- | --- | --- |
| Runtime/deployment | Separate program artifacts and web/worker entrypoints; exact code/config/source/registry approval refusals | Operator + deputy: Scalingo/Clever Cloud Paris apps, PG18 roles/schemas, buildpack/CLI hashes, actual OS-enforced extraction and cost qualification; protected environments and real qualified deployment |
| Encrypted exports | Bounded six-hour-ready PG export, AES-GCM + offline RSA-3072 public-key custody; daily keys, abuse/session/DSR snapshot material excluded; versioned COMPLIANCE Object Lock, encrypted-byte readback and complete marker | Operator + deputy: actual Scaleway buckets/writer permissions, physical/policy lifecycle tail at most 14 days including orphan/version/delete-marker tails, offline custody/rotation and six-hour missing-success monitoring; managed WAL/PITR/key absence remains unqualified |
| Isolated restore | Empty named targets only, refusal/non-overwrite and traffic fences; auth/abuse/Operator/DSR/configuration epochs, retained History/legal/grants/deadlines and newer tombstone/block reconciliation handoff | Operator + deputy: both real cloud restore paths, deletion/expiry replay, accounting/payment/mail reconciliation and exact #114 registry/evidence revalidation before traffic; actual RPO <=24 h and RTO <=8 h from disruption. A 24 h counter-loss drain can fail the 8 h RTO; retain the fence and report qualification failure unless separately reviewed accounting-preserving recovery is proven |
| Status/mail/maintenance | Loopback-only content-free outage/recovery/heartbeat adapter, readiness, validated >=48 h DE/EN notice and withdrawal | Operator + deputy: independent Better Stack page/recipients/actual synthetic queue/SSE/result/cancel and sign-in/mail probes, TEM sender/DNS/deliverability, Cockpit, matching product/status distribution and actual public maintenance announcement |
| Launch acceptance | All gates preserved; restored active pointers/approvals never grant eligibility | Human reviewers + parent merger: current hosted CI and advisory remediation, exact quality/calibration/load/source/provider/browser/security/legal/tax acceptance, then whole-spec two-axis review/fixes/cleanup and final launch decision |

No actual Scalingo/Clever Cloud deploy/provision, S3, SMTP, alert, public status update, DNS, secret change, paid resource, live calibration/load qualification or RPO/RTO qualification occurred. The independent export tests replace only external S3/status edges with loopback fixtures. The proprietary service receives no verification payload or AGPL implementation import.

## Owned environment, retained failures and cleanup

Node 24.14.0 / pnpm 12.15.0; the exclusively owned labelled PostgreSQL 18 container used 127.0.0.1:55711. Public API 5701, lifecycle 5702, private/fake-service 5703, separate public lifecycle 5704, restored 5705, reports 5706, bibliographic 5707, isolated Quality/AI fixture 5708, browser 5471. The unmodified operations fixtures also used their source-defined 5501/5502/5503 and ephemeral loopback edges. Actual paired tests point only to private INTEGRATION, with explicit owned DSR fixture evidence and the real hash-pinned validator toolchain.

The initial concurrent run mistakenly assigned public lifecycle and private Account fixtures to 5703. It produced two public HTTP 404s and one private setup `EADDRINUSE`, not a journal mutation failure. Isolated diagnostics passed; the runner was corrected to separate public lifecycle to 5704, and both full affected groups passed again. These failures are retained. No production or test source changed to repair this orchestration error.

The machine-readable [integration evidence](../evidence/116-integrated-preparation.json) retains exact command arrays, log hashes, source ancestry, pin bytes, workflow audit, artifact identity, refusal/failure evidence and owned cleanup. Logs and full manifests remain under the root ignored `.tmp/spec-70-orchestration/116-integrated-*`. Only the verified owned PG container/anonymous volume, DSR fixture directory and packaging files were removed; assigned ports have no listeners. Two failed-run fixture databases and roles remained in that owned instance and were removed with its volume; no unknown database was targeted. No unknown resource, source checkout/override, shared 5433/global database, issue, gate or job was changed.

Exclusive public-root/private-INTEGRATION ownership is released after clean publication. #116 human cloud acceptance and the parent's whole-spec final review/fixes/cleanup remain downstream; neither is marked complete by this handoff.
