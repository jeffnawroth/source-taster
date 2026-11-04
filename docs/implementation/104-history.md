# #104 — opt-in History (public implementation)

Implements the public verification program, web app and native extension side of
#104 under #70. Started clean on `t3/check-history-retention`, worktree
`/Users/jeffnawroth/.t3/worktrees/source-taster/t3-1ad7931d`, at integration
`457c3f2cd202d93c998c45320a4715490f30b34b` (`git log -1`: #103 merge).
Read issues #104/#70, the domain glossary, ADR-0004/0005/0012/0013/0016/0023
and the #91/#99/#101/#102/#84/#90 handoffs. Used the requested TDD skill and
already-authorized HTTP, Playwright web and real native-panel seams. No agents,
private checkout, root-checkout edits, real providers, pushes, PRs or issue
mutations were used.

## Behavior and persistence

- History is an explicit revocable Account consent, stored in the verification
  program against the stable personal Owner and Account IDs. Guests and
  standalone installations have no Account History control or access. Earlier
  ended transient Checks are never adopted when consent is enabled.
- The first end stores a consented v2 Check, fixes its deadline from that end
  (30 days Free, 90 days paid), and atomically rewraps all content under a fresh
  per-entry AES-GCM key in logged `verification.history_keys`. This includes the
  document/Bibliography selection, removed slots, original/imported input,
  field revisions, results, Candidates/evidence, overrides and replay events.
  Subsequent content writes use the same entry key. Upgrades and Re-checks never
  move the end or deletion date. A monotonic storage ordinal breaks equal-clock
  ties, so the last five are ordered by storage, not random Check UUIDs.
- Nonconsented and Guest content retains #91's daily UNLOGGED transient keys,
  rollover, fixed 24-hour deadline, missing-key failure and startup/recurring
  deletion sweeps. Operator exports still omit UNLOGGED data. A retained
  History backup can restore its entry keys; its content remains ciphertext.
- Free keeps five usable Checks younger than 30 days. Storing a new Free entry
  deletes the oldest usable Free-stored entry, or locks a displaced paid entry.
  A downgrade itself only locks overflow/older entries, including entries
  originally stored on Free. Upgrade unlocks surviving entries up to their
  original deadlines. Locked entries expose date/count metadata and deletion,
  without their label, original input, exports or replay.
- History listing, Open, mutations, exports and SSE publication use the existing
  Owner/current-authority and Check lifetime fences. History lists are rebuilt
  under the publication guard, preventing an in-flight response from publishing
  labels after deletion/revocation. Clock expiry is checked at publication too.
- Open loads the same Check and does not reserve Quota. A billed-slot Re-check
  uses the existing durable, content-free Verdict settlement intent to recognize
  prior billing even though result JSON is encrypted; it works at zero Quota.
- Restart copies nonremoved slots' current structured revisions, immutable
  original input/imported provenance and document selection into a new Check.
  It copies no results or overrides. It reserves through `billedCreate`, uses new
  Check/slot IDs for normal debit settlement, supports the existing first-N
  choice, revalidates the source after reservation, releases on failure, and
  refuses an empty bibliography. The old Check stays unchanged.
- Entry deletion, revocation and Account/Owner deletion remove content, entry
  keys, replay and queued jobs using #91/#102's purge/tombstone path. Revocation
  also disables future retention. Late workers retain the existing attempt and
  deletion fences. Deletion/revocation require current Account authority but do
  not depend on Quota availability; entry-deletion responses contain metadata
  only (refresh History to reload usable labels). Raw extraction remains stateless.
- Shared DE/EN web/panel controls show the policy, searchable title/original
  label/date/ID, count and fixed deletion date; separate Open and new billable
  Restart; lock/Plan notice; and explicit deletion/revocation warnings. Content
  and search state stay in memory. Existing host sign-in gates remain unchanged.

Migration: `20261101000000_history`. Contract transport remains dual-licensed;
implementation remains AGPL. All four contract packages/OpenAPI are regenerated
with their package scripts; no generated artifact is hand-merged.

## Exact private follow-up — required before paid History acceptance

No private implementation or real both-program acceptance is claimed. Repin the
private service to the final public contracts/SHA and implement the following in
its existing Quota snapshot/reservation views. No verification content crosses
this seam:

```json
{
  "features": ["check", "extended-history"],
  "history": {
    "extendedUntil": "2026-12-01T00:00:00.000Z",
    "authorityVersion": 2
  }
}
```

1. Derive `extended-history` and `history.extendedUntil` exclusively from the
   union of currently valid activated grants whose purchased feature scope
   includes extended History, including qualifying Check packs. The timestamp
   is when that union ceases to provide the feature (the latest expiry among
   those active qualifying grants). A zero remaining balance does not revoke
   features. Pending/unpaid/future/refunded/withdrawn grants confer nothing.
   Do not infer the feature from balance, price, grant count or a client Plan.
2. Always include `history` for Account snapshots and reservation responses.
   Free uses `extendedUntil: null`. `authorityVersion` is a positive monotonic
   Owner authority version from the same consistent read as the grant decision;
   advance it on entitlement changes, especially downgrade/refund/withdrawal.
   Couple reductions to the existing signed durable Owner-authority invalidation
   protocol and durably retry it. The public cache rejects replies older than
   its stored version or invalidation fence; it also checks the bounded timestamp
   against the injected clock. Storage and publication also consult the durable
   invalidation fence directly, so an earlier reply cannot publish paid content
   after downgrade acknowledgement. Missing `history` fails closed to Free retention.
   No local paid Plan or independent entitlement catalog was added.
3. The public API refreshes this bounded view outside store transactions and
   Owner guards, before Account requests and worker result commits. The service
   must preserve existing current authority, signed purpose/path/body binding,
   Owner/Account binding and no-content rules. A stale paid snapshot must never
   override a newer downgrade; return a fresh version on subsequent reads.
4. Continue using the existing reserve/settle/release journal for restarts. A
   restart is a new Check, and each nonremoved slot is new billable work; statuses
   release rather than debit. Opening and billed-slot Re-checks remain free.
   Test low/zero balance and concurrent starts against the real journal.
5. Account deletion must continue durably calling signed
   `DELETE /internal/owners/{ownerId}` before removing the Account and replay
   tombstones after restore. The public endpoint now removes History consent,
   retained content and entry keys too. Do not create a second private content
   store or put History consent/content into client Preferences.

Required real both-program acceptance: Account same-Owner web/panel retention;
Free/Pro/Check-pack grants and expiry/downgrade/refund; fixed 30/90-day lifetimes
with both clocks; out-of-order snapshots/invalidation; zero-balance free Open and
Re-check; restart reserve/debit/release, partial and parallel starts; entry/revoke/
Account deletion and late work; restore with current tombstones, blocks, consent
and grant reconciliation before serving. The public fake models this contract
at its HTTP edge and is not that proof.

## TDD evidence

Local evidence is in this worktree's ignored `.tmp/104/` directory.

| Slice | Observed red | Green |
| --- | --- | --- |
| Opt in / retain / delete through HTTP | `red-http-ready.log`: History route 404 | `green-http-1.log` |
| Signed downgrade during held publication | `red-downgrade-publication.log`: stale paid publication stayed unlocked | `green-downgrade-publication.log` |
| Equal-clock storage order | `red-storage-order.log`: UUID order evicted the wrong entry | `green-storage-order.log` |
| DE/EN web controls | `red-web.log`: missing Enable History | `green-web-1.log`, `web-expanded.log` |
| Downgrade a displaced Free-stored entry | `red-downgrade-free-ready.log`: 5 entries instead of 6 | `green-downgrade-free.log` |
| Free same-slot Re-check at zero Quota | `red-free-recheck-ready.log`: 402 instead of 200 | `green-free-recheck.log` |
| Revoke while History list is in flight | `red-publication.log`: revoked label still published | `green-publication-2.log` |
| Empty restart after removal / first-N | `red-empty-restart.log`: empty Check created (201) | `green-empty-restart.log` |
| Deletion/revocation during a Quota outage | `red-delete-outage.log`: deletion returned 503 | `green-delete-outage.log` |
| Out-of-order paid snapshot after downgrade | `red-stale-grant.log`: older reply unlocked entry | `green-stale-grant-2.log` |

Additional clock, provenance/override, ownership, Account deletion and genuine
pg_dump/restore cases extend these slices. Native DE/EN parity passed in
`native-2.log`; it was added after the shared UI and is parity evidence, not a
separate product red. Initial native driver clicks raced a disabled control;
waiting for its accessible enabled state fixed the driver. Other failed runs
record missing initial builds, stale generated internal contracts, a missing
fixture Problem field, a port collision, typed-test cleanup and one short worker
poll timeout. These are not product-red claims. Final validation below supersedes
earlier runs.

## Reproduction and final validation

Node 24.14.0 / pnpm 12.15.0. Owned PostgreSQL 18 container
`st104-history-pg`; Docker assigned localhost **32774**, with each suite owning
its databases/roles. App ports are **5501/5502/5441**, serial. PostgreSQL initially
used 5441 for HTTP-only slices, then was recreated on a Docker-assigned port to
free 5441 for the web browser. Only this task's containers were stopped.

```sh
docker run -d --rm --name st104-history-pg -e POSTGRES_PASSWORD=postgres \
  -p 127.0.0.1::5432 postgres:18
docker port st104-history-pg
# This run received 32774; substitute the assigned port on a repeat run.
export DATABASE_ADMIN_URL=postgres://postgres:postgres@127.0.0.1:32774/postgres
export DATABASE_TEST_URL=postgres://verification_test:verification_test@127.0.0.1:32774/source_taster_test
export SOURCE_TASTER_TEST_API_PORT=5501
export SOURCE_TASTER_TEST_SERVICE_PORT=5502
export SOURCE_TASTER_TEST_LIFECYCLE_PORT=5502
export SOURCE_TASTER_TEST_RESTORED_PORT=5441
export SOURCE_TASTER_DOCUMENT_IMAGE=sha256:a36fa02bdeea666e023b219e6bafa4f020833cd703ca1e1e069623cb7a061707
pnpm install --frozen-lockfile
pnpm --filter @source-taster/core build
pnpm --filter @source-taster/i18n build
pnpm --filter @source-taster/server generate
pnpm --filter @source-taster/contract-common build
pnpm --filter @source-taster/contract-internal build
pnpm --filter @source-taster/contract-service build
pnpm --filter @source-taster/contract-verification build
pnpm --filter @source-taster/server test:history
pnpm --filter @source-taster/web test:history
pnpm --filter @source-taster/extension test:native-history
```

The History HTTP suite owns its real services and therefore has a dedicated
Vitest config without the unrelated default global service. Web uses the same
Vite React/Tailwind plugins/API proxy as #102's browser fixture, without requiring
a Pagefind website preview. Native uses the real Chromium build and side panel.

The final merged-source sweep and cleanup are recorded below.

## Limits

Paid History remains dependent on the private changes above. Synthetic Account,
Quota and DOI fixtures do not prove private storage, journal settlement, current
grant/invalidation behavior, real mail or any provider's behavior. No private
checkout was read or changed. History's backed-up keys require ADR-0012's maximum
14-day backup retention and authoritative deletion-tombstone replay before
traffic after restore, in addition to startup sweeps. A backup taken before a
later deletion must not be admitted without that later tombstone overlay.

No full monorepo/real both-program suite, Firefox/Safari/OS/AT qualification,
production backup/isolation/recovery/load measurement, calibration, source
activation or release qualification is claimed. Human #116/#136/#138/#140 and
all existing Quality/security/legal/release gates remain open and unchanged.


## Final integration and results

Fetched and merged `origin/spec/70-launch-integration` at
`5cce0e2fdb609c4bc78f4ca7c8cd6337d5ad505b` (merge `b58e33b`). Source conflicts
were the additive `.gitignore` entries and workspace props: both History and the
integration's post-Account-deletion deferred Quota read were preserved. There
were no generated conflicts; all four contract packages were rebuilt. Subsequent
fetch/merge calls after the final code commits reported already up to date, and
`git merge-base --is-ancestor origin/spec/70-launch-integration HEAD` passed.
The final tested code is `21db1895a2b1cd139565c555fe798451a0fb2739`; the final
handoff-only commit is reported with the completed task.

The full final serial pass after the storage-order and publication-fence fixes:

| Scope | Result | Local evidence |
| --- | --- | --- |
| History HTTP / real PostgreSQL / injected clock / genuine operator backup and restore | **17/17** | `final-history-3.log` |
| Retention, revisions, manual overrides, exports, Bibliography selection, document uploads and lifecycle regressions | **66/66**, nine files | `final-http-regressions-3.log` |
| Real web app Chromium, DE/EN flow and locked-entry deletion | **3/3**, including axe | `final-web-history-2.log` |
| Real native Chromium extension panel, DE/EN | **2/2**, including axe and no content in extension storage | `final-native-history-2.log` |
| Eight affected package source typechecks and lints | passed; server rechecked after the final server-only changes | `final-types.log`, `final-lint.log` and final server tool output |
| DE/EN i18n | **439** messages; website text parity also passed | `final-i18n-2.log` |
| Contract rebuild reproduction | **60** artifacts byte-for-byte identical | `generated-builds.log`, `generated-reproduction.json` |
| Web and Chromium/Firefox extension builds | passed; existing bundle-size advisories remain | `final-web-build.log`, `final-extension-build.log` |
| Full repository Prettier and whitespace | passed | `final-prettier.log`, `git diff --check` |

Exact final regression command, after exporting the variables above:

```sh
export SOURCE_TASTER_TEST_REVISIONS_PORT=5502
export SOURCE_TASTER_TEST_EXPORTS_PORT=5502
export SOURCE_TASTER_TEST_OVERRIDES_PORT=5502
export SOURCE_TASTER_TEST_LIFECYCLE_PROCESS_PORT=5502
pnpm --filter @source-taster/server test:history
pnpm --filter @source-taster/server exec vitest run --fileParallelism=false \
  test/retention.test.ts test/revision-lifecycle.test.ts \
  test/reference-revisions.test.ts test/manual-overrides.test.ts \
  test/exports.test.ts test/bibliography-selection.test.ts \
  test/documents.test.ts test/lifecycle.test.ts test/lifecycle-recovery.test.ts
pnpm --filter @source-taster/web test:history
pnpm --filter @source-taster/extension test:native-history
```

Typecheck/lint scope: `server`, `ui`, `web`, `extension`, `contract-common`,
`contract-internal`, `contract-service`, `contract-verification`, each via its
existing `pnpm --filter @source-taster/<package> typecheck` / `lint` script.
Also ran `pnpm i18n:check`, `pnpm exec prettier --check .`, web/extension `build`
and the four contract `build` scripts. No dependency was added by #104; the
integration merge brought its own minimatch override/lockfile changes.

**Build limitation:** `pnpm --filter @source-taster/server build` fails with
TS6059 because `src/quality/release.ts` imports `scripts/load/release.ts`, which
imports `scripts/load/analysis.ts`, outside the build's `rootDir: src`
(`final-server-build.log`). All four files/configurations are unchanged from
merged integration (`git diff origin/spec/70-launch-integration --
apps/server/src/quality/release.ts apps/server/scripts/load/release.ts
apps/server/scripts/load/analysis.ts apps/server/tsconfig.build.json` is empty).
The accidental adjacent `.js` outputs from that failed compiler invocation were
removed. This unrelated build configuration was not changed or bypassed. Source
typechecking and the source-process HTTP/browser suites pass; a successful
production server build is not claimed. No full Turbo/website build, private
suite or qualification gate was run.

Stopped only the owned `st104-history-pg` container after all suites; its `--rm`
cleanup removed it. Test harnesses closed their services, native profiles,
extractor/backup containers and disposable databases. The shared PostgreSQL
instance and other implementers' resources were untouched. No push, PR, issue
closure or private/root checkout change occurred. Human #116/#136/#138/#140
remain open. The private grant/version and real both-program follow-up above is
still required.
