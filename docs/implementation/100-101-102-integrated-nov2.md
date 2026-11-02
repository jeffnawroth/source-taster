# Integrated #100 / #101 / #102 publication — 2 November 2026

The completed sources are integrated into both `spec/70-launch-integration`
branches. Public source `ce94cb958994a3f445168c9e12a25d790963ec7c` and private
source `702d681d8bc8d33ab79b017b11aa7f258622065e` were fast-forwarded without
conflicts. They preserve public `1152dfaa929083896ac6741d36122c807e00b2a8`, private
`6537c7c525c391a43d7b55be0a33f0c25ee04c83` and the saved phase/DPA/commerce
histories. The source workspaces were read only and remain clean at their exact
tips. This integration makes no subscription implementation claim.

## Transport and installation

The public delta from `1152dfaa` contains only tests, test configuration, fixtures
and handoff evidence. All four transport package trees, including source,
licenses, declarations, JavaScript and OpenAPI artifacts, remain identical.
Ordinary and frozen private installs pass without links or overrides. All five
manifest/evidence pins retain the already published, reachable
`1152dfaa929083896ac6741d36122c807e00b2a8`. Four installed package instances
(server internal/service/verification and web service) match all 102 expected
published files byte for byte. Lockfile, registry dependency graph, workspace
policy and Better Auth `1.7.14` are unchanged. Publishing test/document commits
does not require a transport repin.

## Integrated acceptance

All runs below execute from the owned public root and private INTEGRATION tree,
with actual private implementation and isolated PostgreSQL 18 roles/schemas on
loopback `55711`. Fixed app ports are `5701/5702/5703`; remaining browser fixture
listeners use their own free loopback ports. No shared `5433` resources or another
task's ports were used. Durable logs are at root
`.tmp/spec-70-orchestration/private-phases-integrated-nov2-*`.

- Both-program atomic abuse entrance dimensions: **4/4**.
- Real sensitive Account deletion, held worker/SSE/download fences and consented
  History/re-registration isolation: **2/2**.
- Both-program Quota and commerce Activation/settlement: **9/9**.
- Web sensitive actions: **17/17**.
- Web/native Preferences lifecycle with real Account storage: **9/9**.
- Native Account/session/transport/sensitive regressions: **27/27**.
- Native real Quota, captured-mail deletion, DE/EN Account/Preferences/restart and
  Firefox: **5/5**.
- Final complete private server suite: **85/85**, run once serially after the
  focused integration checks. No integrated test failed; no regression fix or
  retry was needed.

Aggregate public/private build, typecheck, lint and i18n checks pass. Prisma
clients regenerate and both schemas validate. Aggregate tasks may reuse valid
Turbo cache entries; all server and Playwright runs above execute directly.
Controlled Pagefind uses the existing normally fetched/built cache, verified
through the normal command. Explicit contract/catalog regeneration and tracked
artifact comparisons are recorded in the evidence; no output was hand merged.
No unrelated full public suite or load sweep was run.

Data source/payment adapters are synthetic and mail uses captured/failing test
transports. Client late/error/revoked-response injections exercise client races;
they do not stand in for private Account storage or current authority. These
checks are implementation evidence, not provider, SMTP, ingress or browser
qualification.

Historical failures remain historical: before commerce the private full suite
was **72/73** (the mail-failure fixture expected 200 rather than fail-closed 503).
After commerce it was **83/85** (invoice trigger and captured-mail selection).
The merged capture schema later omitted the recipient field. The supplied
sources corrected those failures, with their own final focused **55/55** record.
This integration adds a distinct final full **85/85** record and does not relabel
old failures or old local-override runs as passing final-pin evidence.

## Preserved behavior

Account Preferences and mail share authoritative Account language. Migration
keeps established DPA language; sign-in does not overwrite an existing Account
with Guest values. DPA receipt language remains the accepted packet language;
proof language follows Account language. Proof is bound to session and purpose,
and queued authentication mail is fenced after revocation, deletion, block or
expiry. Retained legal mail has its own delivery purpose.

Sensitive deletion keeps the eight-year billing acknowledgement, durable Owner
intent, verification deletion acknowledgement/retry, History/content removal,
SSE/late-output/dispatch fences and operational Quota erasure. Immutable invoices,
Orders and DPA records retain their independent purposes. The append-only trigger
exception remains limited to operational Quota tables. Late payment processing
cannot recreate a deleted Owner's grant or falsely claim Activation. Live paid
Activation retains its full validity from actual Activation.

Deletion forgets Preferences; sign-out/session end copies the last displayed
values to that client's Guest store. Neither transfers Account content or grants.
There is no premature Guest fallback. After deletion Guest Quota is read lazily
on first Start; the extension keeps its Guest ID and can reuse a still-valid
independent Guest token. Abuse entrance accounting remains independent of billing
Quota and per-source budgets.

## Remaining gates and publication

The private dependency gate remains blocked by **minimatch 10.2.6 /
GHSA-g3hv-75wg-m249**. The first patch, **11.0.1**, is outside the current parents'
10.x ranges; no forced-major override or exception was added. Better Auth stays
exactly **1.7.14** with its Selected transitive qualification gate open.
The direct clean release guard still exits **78** for missing eligible Measured
configuration/load/calibration evidence (the pnpm wrapper returns 1).

All source/provider-rights, legal/tax/security, calibration/Measured configuration,
load, Q01–Q11, supported-browser/assistive-technology and deployment gates remain.
Local automation does not establish trusted ingress/IPv4/IPv6/key/clock/log,
purge-outage, backup/WAL/PITR or restore qualification. Independent migration
checksum reconciliation remains a deployment gate; no unknown installed database
was changed. Legal retention never extends verification retention. DSR/export,
verified legal retrieval, support delivery and contractual return remain with
owning workflow #113 and are not newly implemented by #102.

Publication targets remain draft PRs
[public #139](https://github.com/jeffnawroth/source-taster/pull/139) and
[private #9](https://github.com/jeffnawroth/source-taster-service/pull/9).
Each push is immediately followed by a T3 PR link. Local acceptance above is
separate from GitHub CI: prior public `1152dfaa` had dependencies successful and
checks in progress; prior private `6537c7c` had checks successful and dependencies
failed. Exact pre-publication snapshots are retained in the evidence. New-head
CI status belongs to the final publication receipt, not to these local results.
No ready-for-review transition, issue closure, activation or gate waiver occurs.

Only the owned labelled PostgreSQL container is removed after the final tests;
its exact identity and empty fixture-database/port checks are recorded in cleanup
receipts. Source workspaces and unrelated resources remain untouched. The
user-enabled five-hour retry job is untouched; no scheduling changes were made.
Exclusive root/private INTEGRATION ownership is released with the final clean,
published handoff. No nested agents or Claude were used.

Evidence: [checks](../evidence/100-101-102-integrated-nov2/checks.json), [installed contracts](../evidence/100-101-102-integrated-nov2/installed-contracts.json), [cleanup](../evidence/100-101-102-integrated-nov2/cleanup.json).
