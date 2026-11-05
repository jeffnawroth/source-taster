# #100 / #101 / #102: completed private-phase source handoff

This handoff supplements the original public-only handoffs for
[#100](100-private-abuse-handoff.md), [#101](101-private-preferences-handoff.md)
and [#102](102-sensitive-account-actions.md). It records implementation evidence,
not deployment, legal qualification, issue closure or activation. The companion
private record is `docs/validation-100-101-102.md` in source100-102.

## Preserved sources and publication

Work is confined to public worktree `t3-f22ae732`, branch
`t3/finish-private-phases-100-102`, and private source100-102, branch
`t3/100-102-private`. No legacy predecessor, integration working tree, source106,
subscription source, nested agent, Claude, push, PR or issue write is involved.
The user-enabled five-hour job was not changed.

Public merge `d68657d` preserves saved `0d6c984` (including `56e5410`) and
published DPA integration `36aea2a`. Merge `2bd663a` incorporates published
commerce integration `1152dfaa929083896ac6741d36122c807e00b2a8` without replacing
history. Private merge `7416c79` preserves source `5d28e91`, `f73dd56` and private
DPA `f9429e3`; the later source merges preserve commerce publication
`6537c7c525c391a43d7b55be0a33f0c25ee04c83`. The private handoff lists exact tips.
Subscription is not integrated.

All five private transport/evidence pins now use actual published `1152dfaa`.
Normal and frozen installs succeed with no local links/overrides. A fresh
comparison verifies 102 installed files, including licenses, declarations, JS,
OpenAPI and package manifests, against that commit. The brief-lived local
workspace/lock override was removed after publication and is preserved only in
untracked orchestration logs. There is no unreachable private pin or parent
publication prerequisite for the current transport.

## What the real private implementation supplies

- **#100:** one atomic PostgreSQL entrance ledger shared by the private and
  verification APIs. Current authority selects the Plan; principal, Guest ID,
  all-Guest and trusted-peer network dimensions count attempts, including denied
  attempts. Signed peer assertions, replay refusal, request deduplication, stable
  fixed windows, live configuration pins, bounded purpose expiry, maintenance
  closure and restore/width-change drain preserve allowances. This ledger is
  independent of billing Quota and Data source permits. Concurrent both-program
  tests now cover all four dimensions and observe unchanged billing Quota.
- **#101:** partial writes update only supplied Account columns under current
  authorization; new registration alone adopts Guest values. Existing sign-in
  ignores Guest values. Both native clients and web refocus/restart use the same
  stored language/style. The old lifecycle fixture's in-memory Preference store
  is replaced by actual private HTTP/PostgreSQL persistence. Delayed/error/revoked
  replies and an old removed-style response are deliberately injected only at the
  transport edge to exercise client races; those injections are not private
  authority evidence. Native Chromium separately proves actual web/extension
  credentials, persistence and two-way changes in DE/EN. Native Firefox now reads
  real Preferences; its old route stand-in is gone.
- **#102:** real captured-mail codes bind fresh proof to the current session and
  exact action, expire within five minutes, and cannot substitute for DPA proof.
  Replacement email preserves Account/Owner identity and detaches the old address.
  Deletion records durable Owner intent, fences/revokes sessions and work, sends
  the signed purpose/path/method-bound verification deletion, removes operational
  content/History/Preferences and retries acknowledgement across restart.
  Retained DPA packets/agreements/notices/objections and immutable commerce Orders
  and invoice evidence have independent purposes and do not cascade away.

Integration fixes keep one authoritative Account language. DPA proof and supplier
notices use it; DPA receipts use the accepted packet language. A queued DPA proof
is refused after session/Account revocation, block, deletion or expiry, including
a restart. Retained legal mail has a separate delivery purpose. Pending DPA proof
operations are purged with authentication state. The Quota deletion trigger now
limits its erasure exception to operational Quota tables; it cannot weaken invoice
immutability. Late paid-pack processing cannot recreate a deleted Owner's grants
or claim a new Activation; the full validity of a live paid pack still begins at
actual Activation, as in #106.

## Client transitions retained

ADR-0023 sign-out/session end copies the last displayed Preferences to that
client's Guest store. Account deletion instead forgets them. Neither transition
moves Check content or grants to Guest. Late replies cannot change another
identity. After successful deletion neither host reads Guest Quota nor requests
an automatic identity on mount; the first Start reads Quota lazily. The extension
keeps its existing Guest ID and may reuse its still-valid independent Guest token.
A plain page reload remains an ordinary Guest visit, as previously decided.
The eight-year billing-retention acknowledgement remains mandatory before deletion.

## Validation and exact evidence

The approved seams are real PostgreSQL HTTP, SSE, downloads, captured/failing
mail transport and actual browser clients. Only external adapters, clocks and
explicit client race/failure transport responses are fixtures. Program roles and
schemas remain separate. No real provider, payment key or SMTP account is used.

Owned PostgreSQL is `st100-102-nov2-codex-pg`, container
`137b2e23c48e4736f9e6a35598cef533a3f7817861f347700828295bbea82d1a`, labelled
`source-taster.owner=nov2-private-phases-codex`, on loopback 5492. Existing
unlabelled 5491 and other tasks' containers/ports were left untouched. Application
ports are 4901/4902; browser fixtures also allocate their own free loopback ports.
Logs are durable under the root `.tmp/spec-70-orchestration/private-phases-nov2-*`.
The final evidence manifest records commands, test boundaries, failures, digests
and cleanup. Earlier missing `/tmp` logs are not used as acceptance evidence.

| Check | Actual result | Log suffix |
| --- | --- | --- |
| Final private Preferences/commerce/Quota/sensitive/abuse/DPA/Operator HTTP suites | 55/55 | `private-focused-final` |
| Real both-program shared entrance dimensions | 4/4 | `server-abuse-both-pinned` |
| Real sensitive deletion, held work/SSE and consented History/re-registration | 2/2 | `sensitive-history-final` |
| Both-program Quota plus commerce Activation/settlement | 9/9 | `server-quota-pinned` |
| Web sensitive actions (real private case plus explicit client fault fixtures) | 17/17 | `web-sensitive-pinned` |
| Web/native Preference lifecycle with real storage and explicit race injections | 9/9 | `preferences-pinned` |
| Native Account/transport/sensitive client regressions | 27/27 | `native-account-pinned` |
| Native real Quota, captured-mail deletion, DE/EN Account/Preferences and Firefox | 5/5 | `native-private-pinned` |
| Earlier real Guest authority (including SSE/late output) | 33/33 | `server-guest` |
| Earlier real Account API; web Account; web Quota | 2/2; 2/2; 9/9 | `server-account`, `web-account`, `web-quota` |
| Earlier real session/dump-restore and DPA API | 4/4; 1/1 | `server-extension-final`, `server-dpa-final` |
| Earlier private readiness browser; DE/EN web/native DPA | 1/1; 4/4; 4/4 | `private-web`, `web-dpa`, `native-dpa` |

The first eight rows use ordinary installed published `1152dfaa` contracts. Earlier
rows retain their original source/install boundary: Guest/Account runs precede
later DPA/commerce corrections; DPA/session/browser runs used the temporary local
contracts before the published install. The installed contract comparison proves
identical transport bytes, but those earlier runs are not relabelled as final-pin
reruns. Private full-suite boundaries and failures are recorded below and in the
manifest. No unrelated blanket rerun or final full-suite success is inferred.

Aggregate public typecheck/lint/i18n/build, private aggregate typecheck/lint/build/i18n pass. Both programs regenerate Prisma/catalogs normally.
Public contract rebuilds leave tracked artifacts unchanged. Public website build
uses a normally fetched, built and verified controlled Pagefind. Normal/frozen
private installs and 102 published-byte comparisons pass with no override.


The server shared-ledger tests observe exactly the configured successful
allowances under concurrent callers, deterministic typed 429/retry deadlines,
private CORS and no-store, restart persistence and no Quota consumption. The
verification API retains its existing same-origin web proxy / privileged native
extension transport; this work invents no public cross-origin allowlist.
The sensitive test opens real SSE, holds a worker's old allow at the network seam,
deletes by captured-mail proof, then observes stream closure, stale read/download/
History refusal and no Data source dispatch. Browser tests observe lazy Quota,
last-displayed sign-out values, deletion forgetting and separate Guest identity.

Red/green records include `dpa-red3` (revoked queued proof still sent),
`dpa-language-red` (agreement language incorrectly selected for proof), and the
post-commerce full private run (invoice trigger references a Quota-only column).
Corrections are covered by captured mail and the existing archive regression.
The initial saved-suite runs also exposed fixture errors: missing test database
URL, wrong download method/path, stale region/alert locators, cached Guest-token
expectations and a detached-but-still-open native panel. These are preserved in
the logs and corrected without weakening the product requirements. A captured
mail fixture merge omitted its recipient field; the final helper selects the
code by recipient while preserving commerce attachments.

## Boundaries and gates

Automated fixture evidence does not qualify ingress peer preservation, access-log
minimization, actual IPv4/IPv6 deployment, clock/key custody and rolling rotation,
purge outage bounds, managed backups/WAL/PITR or restore operations. Hosted
activation stays closed until those settings/procedures are qualified. Fixed
purpose expiry is not a physical-purge guarantee during an outage.

The eight-year billing archive notice is implemented; actual legal/tax retention,
restricted legal retrieval after Account deletion, legal holds and contractual
return/support workflows still require their owning workflow and human review.
No verification retention is extended for legal purposes. Account data-subject
export/support delivery is not newly implemented by this phase. Future mail types
and subscription are not claimed. RTF Word/LibreOffice, Zotero, Safari/Firefox ESR,
assistive technology and supported-browser qualification remain separate gates.
Migration rollout/checksum reconciliation for databases that previously applied
independent slice migrations remains a deployment qualification; tests provision
isolated databases and do not modify an installation.

All source/provider-rights, calibration/Measured-configuration, load, security,
legal/tax, browser, deployment and Q01–Q11 gates remain. Better Auth stays exactly
1.7.14 with its Selected transitive release gate open. The private minimatch
10.2.6 advisory remains blocking: patched 11.0.1 exceeds the current parents'
10.x ranges; no forced-major override or exception is introduced. The clean
release guard still refuses with exit 78. This source handoff authorizes no
activation, release, issue closure or qualification promotion.

## Final source tips and cleanup

Public implementation/test tip is `a6adb0257a8414e3684c7cedbfc5b4ffb427ebbf`;
private implementation/fixture tip is `1b2d0f85d114a619096b34d51e3ae97ab31b89c2`.
The following handoff-only commits add the reports/evidence. Both contain the latest
published integration tips above. No source contract changed in this phase, so
its test/report commits need no new private transport pin. Both trees are handed
back clean with no local override.

The exact labelled container above was removed after final tests. Five leftover
fixture databases from aborted/failed setup runs were contained in that owned
container and removed with it. Ports 5492/4901/4902 have no listeners; unrelated
containers and resources remain untouched. See the private cleanup receipt and
[phase check evidence](../evidence/100-101-102/checks.json).

The companion private handoff commit is `702d681d8bc8d33ab79b017b11aa7f258622065e`.

## Integrated publication — 2 November 2026

The completed sources were integrated into both `spec/70-launch-integration`
branches: public source `ce94cb958994a3f445168c9e12a25d790963ec7c` and private
source `702d681d8bc8d33ab79b017b11aa7f258622065e` were fast-forwarded without
conflicts. They preserve public `1152dfaa929083896ac6741d36122c807e00b2a8`,
private `6537c7c525c391a43d7b55be0a33f0c25ee04c83` and the saved phase/DPA/
commerce histories. The source workspaces were read only and stayed clean. This
integration makes no subscription implementation claim.

### Transport and installation

The public delta from `1152dfaa` contains only tests, test configuration, fixtures
and handoff evidence. All four transport package trees, including source, licenses,
declarations, JavaScript and OpenAPI artifacts, remain identical. Ordinary and
frozen private installs pass without links or overrides. All five manifest/evidence
pins retain the already published, reachable `1152dfaa929083896ac6741d36122c807e00b2a8`.
Four installed package instances (server internal/service/verification and web
service) match all 102 expected published files byte for byte. Lockfile, registry
dependency graph, workspace policy and Better Auth `1.7.14` are unchanged.
Publishing test/document commits does not require a transport repin.

### Integrated acceptance

All runs execute from the owned public root and private INTEGRATION tree, with the
actual private implementation and isolated PostgreSQL 18 roles/schemas. No shared
resources or another task's ports were used.

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
  focused integration checks. No integrated test failed; no regression fix or retry
  was needed.

Aggregate public/private build, typecheck, lint and i18n checks pass. Prisma clients
regenerate and both schemas validate. Aggregate tasks may reuse valid Turbo cache
entries; all server and Playwright runs above execute directly. Controlled Pagefind
uses the existing normally fetched/built cache, verified through the normal command.
Explicit contract/catalog regeneration and tracked artifact comparisons are recorded
in the evidence; no output was hand merged. No unrelated full public suite or load
sweep was run.

Data source/payment adapters are synthetic and mail uses captured/failing test
transports. Client late/error/revoked-response injections exercise client races;
they do not stand in for private Account storage or current authority. These checks
are implementation evidence, not provider, SMTP, ingress or browser qualification.

Historical failures remain historical: before commerce the private full suite was
**72/73** (the mail-failure fixture expected 200 rather than fail-closed 503). After
commerce it was **83/85** (invoice trigger and captured-mail selection). The merged
capture schema later omitted the recipient field. The supplied sources corrected
those failures, with their own final focused **55/55** record. The integration adds
a distinct final full **85/85** record and does not relabel old failures or old
local-override runs as passing final-pin evidence.

### Preserved behavior

Account Preferences and mail share authoritative Account language. Migration keeps
established DPA language; sign-in does not overwrite an existing Account with Guest
values. DPA receipt language remains the accepted packet language; proof language
follows Account language. Proof is bound to session and purpose, and queued
authentication mail is fenced after revocation, deletion, block or expiry. Retained
legal mail has its own delivery purpose.

Sensitive deletion keeps the eight-year billing acknowledgement, durable Owner
intent, verification deletion acknowledgement/retry, History/content removal,
SSE/late-output/dispatch fences and operational Quota erasure. Immutable invoices,
Orders and DPA records retain their independent purposes. The append-only trigger
exception remains limited to operational Quota tables. Late payment processing
cannot recreate a deleted Owner's grant or falsely claim Activation. Live paid
Activation retains its full validity from actual Activation.

Deletion forgets Preferences; sign-out/session end copies the last displayed values
to that client's Guest store. Neither transfers Account content or grants. There is
no premature Guest fallback. After deletion Guest Quota is read lazily on first
Start; the extension keeps its Guest ID and can reuse a still-valid independent
Guest token. Abuse entrance accounting remains independent of billing Quota and
per-source budgets.

### Remaining gates and publication

The private dependency gate remains blocked by **minimatch 10.2.6 /
GHSA-g3hv-75wg-m249**. The first patch, **11.0.1**, is outside the current parents'
10.x ranges; no forced-major override or exception was added. Better Auth stays
exactly **1.7.14** with its Selected transitive qualification gate open. The direct
clean release guard still exits **78** for missing eligible Measured
configuration/load/calibration evidence (the pnpm wrapper returns 1).

All source/provider-rights, legal/tax/security, calibration/Measured configuration,
load, Q01–Q11, supported-browser/assistive-technology and deployment gates remain.
Local automation does not establish trusted ingress/IPv4/IPv6/key/clock/log,
purge-outage, backup/WAL/PITR or restore qualification. Independent migration
checksum reconciliation remains a deployment gate; no unknown installed database was
changed. Legal retention never extends verification retention. DSR/export, verified
legal retrieval, support delivery and contractual return remain with owning
workflow #113 and are not newly implemented by #102.

Publication targets remain draft PRs
[public #139](https://github.com/jeffnawroth/source-taster/pull/139) and
[private #9](https://github.com/jeffnawroth/source-taster-service/pull/9). Local
acceptance above is separate from GitHub CI: prior public `1152dfaa` had
dependencies successful and checks in progress; prior private `6537c7c` had checks
successful and dependencies failed. New-head CI status belongs to the final
publication receipt, not to these local results. No ready-for-review transition,
issue closure, activation or gate waiver occurs.

Evidence: [checks](../evidence/100-101-102-integrated-nov2/checks.json),
[installed contracts](../evidence/100-101-102-integrated-nov2/installed-contracts.json),
[cleanup](../evidence/100-101-102-integrated-nov2/cleanup.json).
