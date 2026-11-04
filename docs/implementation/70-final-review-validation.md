# Final #70 implementation validation receipt

Implementation commits:

- Public: `c5a6eb9d8efda5f20c1f82a777ad27db76627167`.
- Private: `ce8db71b492d3921b035594da56b43d2cad9175f`.

The accompanying handoff commits add this receipt and wording clarifications only. Final clean handoff heads are recorded in the parent's local `fixes/handoff.json` and the implementation agent's final message; a commit cannot contain its own SHA.

## Findings and checks

All paths below are relative to the public integration's `.tmp/spec-70-orchestration/final-review/fixes/`.

| Finding | Evidence |
| --- | --- |
| Grounded AI Reference retention | `ai-red.log` fails on missing Reference; `ai-green.log` passes all 21 extraction tests, including grounding, invalid output and fallback behavior. |
| Full temporary Pro scope | `pro-red.log` fails the API scope; `pro-green.log` and `private-final-regressions.log` pass scope and expiry. |
| Delayed purchase language | `mail-red.log` fails the expected German subject. The test capture was extended to retain actual HTML rather than stripping it. `private-final-regressions.log` passes subject, HTML, localized summary and unchanged legal evidence after an Account Preference update. |
| Recoverable limiter authority | `limiter-red.log` records the original missing configuration capability; `limiter-green.log` and final private regression run prove one-hour recovery with preserved 24-hour origin consumption, exhaustion at the original limit and refusal for missing/corrupt state. Existing shared-budget concurrency is green. |
| Refund/chargeback fencing | `refund-red.log` fails on retained paid capacity. Final private suite passes consumed-slot preservation, duplicate refund processing and lost chargeback discovery before activation; `authority-subscription-green.log` covers refunded Pro. `early-refund-green.log` additionally proves invoice retention/archive when refund precedes paid notification. |
| Exact durable invoice archive | `archive-no-delivery-red.log` is an explicit delivery-disabled sensitivity check, not an original baseline red run. Final private suite passes exact PDF/UBL byte comparison against downloads, COMPLIANCE retention, outage/restart/retry and subscription delivery. The pre-existing TRUNCATE protection assertion now accepts PostgreSQL's earlier foreign-key refusal as well as the append-only trigger; no destructive operation is allowed. |
| Operator activation completion | Both existing activation paths pass in the final private suite, including proof expiry, idempotency, stale/concurrent operations and audits. |
| Sensitive Account UI ownership | `account-browser-final.log`: five real Chromium web tests pass, including both real programs plus independent private web page for DE/EN email change/deletion. `private-account-catalog-green.log` repeats the two affected real-program cases after private catalog generation. `extension-link-browser.log`: two native extension fixture/gate cases pass. `native-both-account-link.log`: the native extension case against both real programs also passes. |
| Hosted report seam | `reports-green.log`: both pack and subscription cases pass using real programs/PostgreSQL, actual report job/PDF download, unchanged Quota API snapshot and revoked-session download refusal. Initial expectation of 401 was corrected to the contract's actual 403 denial; authorization was not relaxed. |

`private-final-regressions.log`: **51 tests pass** across abuse, Operator, commerce and subscription suites. The subsequent early-refund regression passes separately. Initial parallel validation exhausted the owned PostgreSQL connection limit; serial reruns exposed and fixed an avoidable pool wait in legacy same-database limiter composition. Final suite is green. No result from the failed runs is presented as qualification.

Affected public UI/server/web/extension and private server/web/operator-contract typechecks pass. Changed-code ESLint, format checks, both-program catalogs and public/private application builds pass. Normal Vite bundle-size warnings remain; thresholds were not changed. Private Prisma and Paraglide output were regenerated from sources. Logs include `public-final-types.log`, `private-last-types.log`, `private-extra-types.log`, `public-last-lint.log`, `private-final-lint.log`, `public-format-check.log`, `private-format-check.log`, `public-build.log`, `private-build.log` and `private-last-web-build.log`.

`release-gate-refusal.log`: release refuses with **exit 78**, listing no load report, uncalibrated configuration, no measured configuration and no measurement location. Quality/load/calibration, source #138/#140/#136, EU/provider/legal, Selected dependencies and private minimatch gates remain required. No cloud provisioning, real RPO/RTO drill, provider approval or human acceptance was performed.

## Handoff constraints

No public transport source changed and all five private transport pins remain `d50b0ac24273515e5f291de58aa29d7856f99475`. No workspace/lock override or unpublished pin was introduced. No transport publication/repin is required for these application corrections. Coordinate private `/account` deployment before enabling public management links and apply the new private migrations.

The independent limiter authority is a code capability requiring human hosting/architecture acceptance against ADR-0012's original one-instance topology, fresh durable evidence across primary region/account loss, EU/legal/cost review and the actual recovery drill. It is not a claim that a second production instance is approved or provisioned. Missing evidence remains a refusal. The invoice bucket must likewise be separately provisioned and qualified with versioning and eight-year COMPLIANCE holds, distinct from 13-day backups. These are preserved gates, not waivers.

The only external test resource was owned Docker container `st70-final-fixes-pg` (`87e61881b7591f80808d131a86930119a333016c7ac1b542a1d25008941a6ce4`), bound to loopback port 32777. Per-test databases/roles were owned and disposable; final container cleanup is receipted in `fixes/cleanup.json`. Shared/unknown port 5433 resources were not touched. No pushes, nested agents, PR/issue writes, scheduled-job changes or actual cloud/mail/provider actions occurred.

## Correction-review residuals

The separate correction reviews confirmed the initial fixes and found four distinct private residuals (language was reported by both axes). The parent corrected these directly on the same integration checkouts:

- Due Check-pack Activation excludes reversed invoices before the 100-Order batch limit, ordered by due time and ID. Immutable Order/reversal evidence remains unchanged; the transaction still rechecks the reversal fence. The API/Quota regression seeds a deterministic full reversed backlog and proves the next valid paid Order receives its 300 Quota. `residuals/activation-red.log` fails on remaining 100 instead of 400; `activation-green.log` passes. The complete commerce suite passes **17/17** in `commerce-regressions.log` on a separate owned port. An initial runner port collision is documented in `commerce-port-collision-note.md`.
- The private Account page loads authoritative Preferences, refreshes on focus, and persists explicit language switches through the existing Preferences API. Failed writes are visible and do not claim a saved language. The existing citation style is preserved by the language-only PATCH.
- The deletion summary is tagged with its Account ID, cleared on identity changes and failed reads, and hidden unless it belongs to the current Account. Proof/form state also resets when identity changes. Four DE/EN real-program Chromium cases cover persistent language, refocus, failed writes, successful management/deletion, and a second Account whose summary fails: no previous Quota is shown and deletion stays disabled. `language-red.log` and `identity-red.log` capture the two original browser failures; `account-browser-green.log` passes **4/4**.
- New signed Abuse assertions are inserted in the same independent authority database that sweeps their expiry. Active assertions left in the primary database remain rejected during cutover; expired legacy primary rows are swept too. The API regression simulates omitted ephemeral primary rows and proves an already consumed assertion cannot be replayed. `replay-red.log` receives 200 instead of 401 before the correction; `replay-green.log` passes the full Abuse suite **7/7**. This is local recovery evidence, not a cloud durability/RTO qualification.

Residual logs are under the public integration `.tmp/spec-70-orchestration/final-review/residuals/`. Affected private server/web typechecks and changed-file public/private ESLint pass. Source formatting and diff checks pass. No transport, dependency, migration, pin, legal/provider/quality/load/Selected gate or scheduled job was changed by these residual corrections. Only the owned PostgreSQL container `st70-review-residual-pg` was used; shared/unknown resources were not touched. Local checks do not replace hosted CI, human limiter architecture acceptance, Object Lock provisioning or actual recovery drills.
