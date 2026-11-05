# #91 — transient Check content retention

Implements [#91](https://github.com/jeffnawroth/source-taster/issues/91), part of
#70, against ADR-0005/0012/0015. No History consent/storage feature (#104) or
hosting qualification (#116) is claimed.

## Integration and migration

The prepared worktree was clean and based on local integration
`1e14d63dfa85d19ce6a98e2713a5aa480bc4b10f`. Merged `t3/2a66a7b8`
(WIP `5bd17d590cbba8c433c5ca4fe9bb6aec81a68aae`) without conflicts.
The retention migration `20261031000000_content_retention` sorts after the
integration migrations, including `20261030020000_manual_overrides`.

The migration deliberately removes pre-migration plaintext transient content,
retaining content-free Check tombstones and unfinished release intents. It does
not copy plaintext into a backed-up migration key store. It also removes the old
manual-verdict enum constraint because that column now contains authenticated
ciphertext. Validation ran migrations only against owned disposable databases;
no existing development or production database was migrated or swept.

## Behavior

- Never-started Checks expire from creation. A started Check expires from its
  first end; lease expiry uses the lease deadline rather than detection time.
  A still-running Check does not expire merely because creation was a day ago.
- Re-checks, field revisions, list edits, manual judgments, lease renewal and
  reconnect do not change the first end or fixed content deadline.
- Deletion cascades through removed and current References, imported raw records,
  field revisions, every result/Candidate/search log and manual judgment, plus
  ordered replay events. Pending queue deliveries are removed. Running workers
  fail the existing attempt/expiry fence and cannot recreate deleted content.
- Content-free tombstones and durable verdict/release settlement intents remain
  for #99. Purging lost-key content does not require decrypting it or inventing
  an outcome, refund or Quota debit.
- v2 reads, edits, replay, suggestions and export downloads return `410
  check-expired`; frozen v1 returns its existing `404`. Foreign Owners still get
  `404`. Response bodies, individual SSE events and downloads check lifetime
  again at publication, under the Check lock and existing current-authority guard.
- Web startup and worker admission await recovery. Recurring maintenance sweeps
  expired/lost content and destroys expired daily keys. Publication denies at the
  deadline even between maintenance ticks.

## Encryption and backups

One persistence codec covers original text, canonical structured input (including
imported provenance), field revisions, result evidence, event payloads and manual
verdicts. It uses AES-256-GCM, fresh 96-bit nonces and authenticated model/field
identifiers. It has no plaintext decode fallback. Keys exist in a PostgreSQL
UNLOGGED table; no environment key or backed-up key table is substituted.

Key windows use UTC days. During the last minute of a day, maintenance rewraps
live content under the next day's key, and all new writes use that key. Old keys
are deleted at the next maintenance tick after the window ends; decryption also
checks the clock, so expired keys cannot authorize reads while waiting for that
tick. If a crash, failover or suspension loses a key or misses the rewrap window,
recovery removes the affected Check content before serving it. Loss is fail
closed, rather than a plaintext fallback or an extended key lifetime.

`apps/server/scripts/export-database.ts` / `db:export` provides the operator dump
boundary with mandatory `--no-unlogged-table-data --no-owner --no-privileges`.
It streams custom-format output, refuses an interactive stdout and suppresses
potentially content-bearing pg_dump diagnostics. Supply `DATABASE_URL` securely
and pipe stdout into the deployment's public-key encryption/upload pipeline;
this command alone does not provision that pipeline, Object Lock or scheduling.
The real PostgreSQL backup tests share those mandatory export flags. Their
explicit full-data positive controls are test-only and are never operator exports.
Temporary dumps stay in private temporary directories and are removed after use;
failures clean up owned resources without echoing dump/restore SQL.

#89's raw upload/extraction boundary remains stateless: there is no persistent
raw upload staging store to delete transactionally. This implementation adds
none. Recognition/import responses remain transient until Check creation, whose
Reference content and initial events commit in the existing database transaction.
There are no persistent rendered/download artifacts in these implemented paths;
future report storage must use the same Check deadline.

## TDD evidence

Confirmed seams: published HTTP/SSE/download contracts, real disposable PostgreSQL,
real web/worker processes, injectable clocks, and genuine pg_dump/psql at the
external database adapter edge. No internal-layout assertions or mocked store
collaborators were added.

Earlier implementer evidence remains in `/tmp/source-taster-70/91-claude-*.log`.
Resumed vertical slices (logs under `/tmp/source-taster-70/`):

1. `91-codex-red-deletion.log`: full post-deadline dump still contained the
   sentinel. `91-codex-green-deletion.log`: 3/3 passed after startup recovery.
2. `91-codex-red-encryption.log`: operator dump contained plaintext.
   `91-codex-green-encryption.log`: 4/4 passed, including an unreadable genuine
   restore without transient keys and a readable full-data positive control.
3. `91-codex-deadline-mutations.log`: a Check ending five seconds after creation
   remains downloadable at creation+24h, then expires at end+24h despite edits,
   Re-checks and membership changes.
4. `91-codex-daily-key-loss.log`: continuous rollover retains a live Check;
   restoring an expired key fails closed before traffic.
5. `91-codex-regression.log`: 42 passed, 5 manual-override cases failed because
   the existing SQL enum constraint rejected ciphertext. The migration fix is
   covered by `91-codex-green-overrides.log`: 6/6 passed.
6. `91-codex-late-work.log`: a live replay closes at expiry; late held source work,
   recovered workers and suggestion requests cannot resurrect the Check.
7. `91-codex-red-running-deadline.log`: still-running Check incorrectly returned
   410 at creation+24h. `91-codex-green-running-deadline.log` passes: first end
   starts its lifetime even after a run longer than a day.

Focused commands use this prefix (the matching red/green log records the exact
`-t` selector described above):

```sh
SOURCE_TASTER_TEST_API_PORT=4102 \
SOURCE_TASTER_TEST_LIFECYCLE_PORT=4101 \
SOURCE_TASTER_TEST_RESTORED_PORT=5311 \
pnpm --filter @source-taster/server test test/retention.test.ts
```

## Final validation

Executed from this worktree, with only disposable databases/roles:

```sh
pnpm install --frozen-lockfile
pnpm --filter @source-taster/server generate
SOURCE_TASTER_TEST_API_PORT=4102 \
SOURCE_TASTER_TEST_LIFECYCLE_PORT=4101 \
SOURCE_TASTER_TEST_RESTORED_PORT=5311 \
SOURCE_TASTER_TEST_REVISIONS_PORT=4101 \
SOURCE_TASTER_TEST_EXPORTS_PORT=4101 \
SOURCE_TASTER_TEST_OVERRIDES_PORT=4101 \
SOURCE_TASTER_TEST_IMPORTS_PORT=4101 \
SOURCE_TASTER_TEST_LIFECYCLE_PROCESS_PORT=4101 \
pnpm --filter @source-taster/server test \
  test/retention.test.ts test/revision-lifecycle.test.ts \
  test/reference-revisions.test.ts test/manual-overrides.test.ts \
  test/exports.test.ts test/imports.test.ts test/lifecycle.test.ts \
  test/lifecycle-recovery.test.ts test/recheck-replay.test.ts \
  test/sse-compatibility.test.ts test/check-events.test.ts
pnpm exec tsc -p scripts/tsconfig.json
pnpm -r --if-present typecheck
pnpm exec eslint scripts
pnpm -r --if-present lint
pnpm exec prettier --check .
pnpm --filter @source-taster/server build
pnpm i18n:check
git diff --check
```

Results: **62/62 tests passed in 11 suites**, including eight retention cases;
all workspace source typechecks/lints passed; formatting and whitespace checks
passed; server build passed; i18n validated 331 messages in DE/EN. Final evidence:
`91-codex-final-http.log`, `91-codex-workspace-typecheck.log`,
`91-codex-workspace-lint.log`, `91-codex-prettier.log`,
`91-codex-server-build.log`, `91-codex-i18n.log` under the temporary evidence
directory. No browser tests were added: this ticket changes server persistence,
expiry and transport contracts, not client-only behavior.

Reproducibility check (passed: **40 artifacts byte-for-byte identical**):

```sh
python3 - <<'PYCODE'
from pathlib import Path
import hashlib, subprocess
root = Path('packages/contract-verification')
paths = sorted(p for p in (root / 'dist').rglob('*') if p.is_file()) + [
    root / 'openapi.json', root / 'openapi-v2.json'
]
def hashes():
    return {str(p): hashlib.sha256(p.read_bytes()).hexdigest() for p in paths}
before = hashes()
subprocess.run(['pnpm', '--filter', '@source-taster/contract-verification', 'build'], check=True)
assert before == hashes()
print(len(paths), 'generated artifacts reproduce byte for byte')
PYCODE
```

`pnpm typecheck`, `pnpm lint`, and the initial dependency-wide build stopped at
the website's enforced prerequisite: "A current controlled Pagefind source build
is required". This prepared worktree has no current controlled Pagefind build.
No recipe, receipt, gate or website artifact was bypassed/forged. The direct
workspace source checks above all pass; a complete Turbo build remains limited
by that unrelated local prerequisite. Logs: `91-codex-final-typecheck.log`,
`91-codex-final-lint.log`, `91-codex-build-deps.log`.

The final `git merge spec/70-launch-integration` and
`git merge-base --is-ancestor spec/70-launch-integration HEAD` confirm inclusion
of the latest local integration tip. No integration conflicts occurred.

## Qualification limits

Synthetic fixtures establish implementation behavior only. Scalingo's actual
UNLOGGED/WAL/PITR/replica/snapshot behavior, disabled scheduled logical backups,
key-table-empty restore evidence, encrypted six-hourly Object Lock exports,
cold-fallback operation and measured recovery/performance remain #116 and the
existing launch qualification. If snapshots retain keys, ADR-0012 still requires
the separate no-backup-store decision before launch. No fallback store was chosen.

Global maintenance fencing/rollover is implemented for the selected small-stage
architecture; deployment-scale performance and the live fifty-Check protocol are
not claimed. History, reports and later content-bearing artifact stores must
integrate this lifetime fence rather than extend transient deadlines. All source,
calibration, Quality, security and release gates (#114, #136, #138, #140 included)
remain intact. No source activation, release qualification or completion of #70
is claimed.

## Shared-root integration continuation

See [the combined integration handoff](70-launch-integration-log.md#launch-integration-90-93-and-137-with-91) for the
#90/#91 retention composition, selected-text draft compatibility, scoped #80
browser-fixture default, current validation and unchanged qualification gates.
Earlier temporary logs named above disappeared during the interruption; new
continuation evidence lives in `.tmp/spec-70-orchestration/` in the integration
checkout.
