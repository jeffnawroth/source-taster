# #99 Owner Quota, launch Plans and Quota preview (public half)

Branch `t3/owner-quota-settlement` starts at `246f449` on
`spec/70-launch-integration` (#91, #90, #93 and #137 already integrated). The
proprietary half lives on private branch `t3/99-owner-quota`, composed on the
integrated private tip `e01910d` (which contains #97). Implemented under
implement-spec #70 with the TDD skill, against #70's confirmed real-PostgreSQL
HTTP/SSE and browser seams. No predecessor, issue mutation, push, PR,
deployment, activation (#114, blocked by #140) or human qualification is part of
this work.

## Behavior

- **Journal and grants (private).** Every Quota movement is an append-only
  journal entry per Owner (credit, reserve, debit, release, expiry, forgive,
  correction). Balances are derived, never stored, never negative. Guest 20/day
  and Free 100/month are Operator-changeable catalog rows (`quota_catalog`);
  a changed Plan applies from the next period, credits take effect at once.
  Grants are consumed earliest-expiry first (ties: base Plan before credits);
  the feature scope is the union of the currently valid grants. Periods are
  Berlin calendar day (Guest) and Berlin calendar month (Free).
- **Protocol (`packages/contract-internal`).** `POST /internal/quota/{snapshot,
  reserve,settle,release}`, signed like every other internal call (purpose
  `quota`). Requests and responses carry only opaque Owner/actor/Check IDs,
  slot positions, counts, permissions and balances. No verification payload
  crosses the seam and neither program reads the other's schema.
- **Reserve / commit / release per Reference slot (public).** The hosted
  authority provides a `QuotaPort`. Every billable path reserves before the
  work starts, with the service call made outside the Owner fence and outside
  any store transaction: v1 and v2 Check creation, Re-check of a slot that has
  no Verdict yet, field edits with `recheck`, adding References and selecting
  more of a Bibliography. Re-checking an already billed slot never reserves and
  works at zero balance. The store verifies the reservation inside its own
  transaction; a stale plan is retried once, then `reference-conflict`.
- **Settlement.** Verdicts (including Not verifiable) debit one slot exactly
  once; Statuses, failures, cancellation and lease expiry release. Delivery is a
  durable pull: `SettlementIntent.deliveredAt` plus a drain in the worker's
  sweep. The service honors settle/release for any Owner, including revoked or
  blocked ones; reserve and snapshot fail closed under current authority.
- **Start preview.** `POST /v2/checks?maxReferences=N` starts only the first N
  References in input order; the rest end with Status `not-checked`, are never
  billed and never run. Without the cap an insufficient balance answers `402`
  `quota-insufficient` with `available` and `required`.
- **Visibility.** `GET /v2/quota` and the envelope `quota` slot of every
  successful hosted v2 response carry consumed, remaining, granted, reserved,
  the grants, the feature union and the warning level (`none`, `eighty`,
  `exhausted`).
- **Clients (`packages/ui`).** `quota.ts` (pure plan logic shared by web and
  extension panel), `quota-panel.tsx` (meter, choice) and `check-workspace.tsx`.
  The balance is read when the workspace mounts, so the meter (count, consumed,
  remaining) is visible before the first start. The host mounts the workspace
  only once the identity is settled: an Account reads with its Account token; a
  Guest reads only after the session answered "no session", which is the
  legitimate point to mint the Guest token. While the Account session is
  pending, failed or revoked nothing reads Quota and nothing mints a Guest; the
  transport refuses that itself. Until the read answers the user sees "Loading
  your Quota…"; a failed read shows "Quota is currently unavailable" and never
  a number. A hosted start re-reads the balance and does not start if that read
  fails (fail closed). Before the automatic start the user sees
  count and expected consumption; when
  the balance does not cover the input the Check does not start and the user
  chooses "Check first N" or upgrade. The meter is always visible and warns at
  80 % and 100 % with an upgrade offer (a link when the host passes
  `upgradeUrl`, text otherwise). DE/EN messages cover every string.
- **Unconfirmed Accounts.** An Account and its personal Owner exist only after
  the e-mail is confirmed. A pending sign-in challenge confers nothing, so the
  person keeps the Guest 20/day. Free 100/month is granted to the personal
  Owner created at confirmation; nothing transfers from the Guest.

## ADR-0003 deviation

ADR-0003 only requires a `quota` slot in each response. This ticket fills it
with a service snapshot (display only). A failed snapshot is reported as
`{ "status": "unavailable" }`, a new `QuotaSlot` variant in `contract-common`,
never as `not-implemented` and never with an invented balance and adds `GET /v2/quota` so a client can read the
balance without starting work. The slot never decides enforcement.

## TDD evidence

Logs live in `/Users/jeffnawroth/Developer/Repositories/source-taster/.tmp/spec-70-orchestration/`
and are not committed.

| Slice | Red | Green |
|---|---|---|
| Private journal, grants, routes | `99-private-red-1.log` (quota routes unavailable; see the private validation notes for the symlink caveat) | `99-private-run-6.log`: 10/10; re-run on the merged public contracts `99-private-run-merged.log`: 10/10 |
| Both-program contract (`test/quota.contract.ts`) | `99-public-quota-red-mutation-1.log`: with the reserve call removed from `billedCreate`, 4 of 7 fail (insufficient balance, parallel oversell, cancel release, lease-expiry release) | `99-public-quota-run-2.log` 7/7; merged tree `99-public-quota-merged.log` 7/7 |
| Existing hosted contracts | `99-public-authority-run-1.log`: 2 failed (dist unbuilt; a 24-reference fairness test now exceeds Guest 20/day) | `99-public-authority-run-2.log`, merged tree `99-public-authority-merged.log`: 33/33 |
| Account contract | n/a | `99-public-account-run-1.log`, merged `99-public-account-merged.log`: 2/2 |
| Standalone suite | n/a | `99-public-unit-merged-2.log`: 580 passed, 1 failed (pre-existing flake, see below) |
| Browser Quota (`e2e-quota`) | `99-browser-quota-run-1…3.log` (harness, port and timing problems) | `99-browser-quota-run-4.log`, merged tree `99-browser-quota-merged.log`: 4/4 |

## Validation

All runs use an owned PostgreSQL 18 container and ports 4401/4402/5341, serial,
on the tree after merging `spec/70-launch-integration` (`192272a`, no source
conflicts; contract `dist/` and OpenAPI regenerated with `pnpm build` in the four
contract packages and `packages/i18n`). The source-branch runs are kept as
historical evidence in the logs named in the TDD table.

### Integration merge (#99 into `spec/70-launch-integration`)

Merge `56f251f` (public #99 `0a1feb0`, no conflicts). The before-first-Start gap
was closed test-first in the integration tree: the new `e2e-quota` cases (20/20
for a new Guest before any start, a returning Guest's 18, an Account's 100/100
without any Guest token, a pending Account session that reads nothing, a
refused Guest and an unreachable service that both show "unavailable") were red
against the lazy read (`99m-browser-quota-red.log`, 8 red) and green after the mount
read (`99m-browser-quota-green-2.log`). The server case "a failed snapshot is
reported as unavailable" passes in `99m-server-quota-1.log` (no separate red log
was kept for it).

Final serial sweep after the last source edit (`.tmp/spec-70-orchestration/99m-sweep.sh`,
logs `99m-final-*.log`):

| Suite | Result |
|---|---|
| `apps/server pnpm test:quota` | 8/8 |
| `apps/server pnpm test:authority` | 33/33 |
| Account contract (`account.vitest.config.ts`) | 2/2 |
| `apps/server pnpm test` (standalone) | 580 passed, 1 failed (`article-fairness`, diagnosed and fixed below) |
| `apps/web pnpm test:quota` | 9/9 |
| `apps/web pnpm test:guest` | 5/5 |
| `apps/web pnpm test:e2e` | 81/81 and bibliographic 22/22 |
| `apps/extension pnpm test:native-account` | 15/15 |
| `apps/extension pnpm test:native-guest` | 14/14 |
| `apps/extension pnpm test:native` | 18/18 |
| `apps/extension pnpm test:native-selection` | 14/14 |

`eslint` (scripts and every package via turbo) and `prettier --check .` are
clean (`99m-lint.log`). `pnpm typecheck` is clean, `prisma validate` passes, and
a repeated contract build gives byte-identical output (`99mr-static.log`). The
unqualified `release:check` still refuses with exit 78
(`99mr-release-check.log`). Native Firefox was not run.

**Fairness diagnosis.** `article-fairness > alternates between Owners…` failed
in 4 of 5 isolated runs (`99mr-fairness-loop-1.log`). Logging the dispatch
order with the Check IDs (`99mr-fairness-loop-2.log`) showed that Owner
alternation always held, but owner-a's Checks started in ascending Check-ID
order. The service runs on a frozen test clock, so the four Checks share
one `created_at`, and the dispatch query's last tie-break (`c.id`, a random
UUID) decided. That made the case a fixture fault, not a scheduler fault. The
test now advances the clock by 1 ms after each creation, as real successive
requests would. With that change the case passed 6/6 (`99mr-fairness-loop-3.log`).
The sibling `caps running References per Check` had the same tie (`[61, 51]`,
3 of 6) and got the same tick: 8/8 for both cases (`99mr-fairness-loop-4.log`).
The assertions are unchanged. As a mutation check, removing the Owner key from
the dispatch order turns the case red with Check-only round robin
`11,21,31,12,…` (`99mr-fairness-mutation-red.log`). Production behaviour:
Checks created within the same millisecond still tie on the random ID. Owner
alternation does not depend on this.

**Test adjustments caused by the mount read, and why they are not weaker.**

- #98 extension Account specs (`e2e-account/panel.spec.ts`): the fake service
  now answers the signed `/internal/quota/*` protocol (schema-validated
  `extensionFixtureQuota`). "Nothing before sign-in" assertions are now taken
  from a mark set after sign-in, because a signed-out panel is legitimately a
  Guest that reads its Quota. The no-Guest-token-for-Accounts, single Account
  token and no-other-storage assertions are unchanged.
- Native Guest specs (`e2e-guest/guest.spec.ts`): the harness enables Accounts
  (a launch service answers "no session" instead of `GET /v1/session` 404).
  Token expiry is set before the panel opens, because the load-time read
  already takes the token. The renewal case reads the moved
  `/v2/structurings`. A revoked Guest or one without Check permission is now
  refused at its first hosted request (structuring preview or the fail-closed
  Quota read) instead of at `POST /v2/checks`. The assertion is "403 on the
  first hosted request and no Check created", plus the unchanged alert,
  same-Guest-ID and no-results checks. Issuance counts became "every issuance
  is the same Guest ID and client", since the load-time read adds an attempt.
- Web (`e2e/*`): the structuring summary is `role="status"` named "Recognized
  References", and the Check status is named by its "Your Check" title.
  Specs select the named status (`e2e/check-status.ts`). The lifecycle stub
  follows structurings to `/v2`. A 320 px / 200 % reflow overflow in the
  structuring field grid was fixed in the UI.
- Web Guest (`e2e-guest`): the harness enables Accounts. The concurrent-tabs
  case registers its listener before navigation.

`GET /v2/quota` needs Check-creation permission, so a Guest without it cannot
read the balance. That is fail-closed: the meter shows "unavailable".

`apps/website/dist-preview` disappeared during the merge runs (cause unknown,
untracked). It was copied untracked from the read-only #99 source worktree
(`t3-431d8cca`, website sources identical) and is not committed.

## Limitations and caveats

- The settlement drain stops at the first failing item per pass, so one
  permanently failing settlement can delay later ones (head-of-line). It retries
  with backoff and never drops an intent.
- The 2 h reservation cap runs from reservation creation, not from lease
  extensions. A crash between a billed change's reserve and its commit keeps the
  reservation until the cap, because every attempt uses a fresh change key.
- The Operator `correction` journal kind exists at schema level only; credit and
  Plan change are implemented operations.
- The upgrade offer is a link only when the host supplies `upgradeUrl`; no
  checkout exists yet, so the web host passes none. The warning and choice texts
  still name the upgrade (DE and EN), so the offer is textual until a checkout
  exists.
- Reading the balance on mount means a first-time web visitor (resolved as
  Guest) gets a persisted Guest ID and a Guest context on page load, before any
  start. That is the Guest identity the Check would create anyway; its retention
  falls under the existing data-protection/legal qualification gate.
- The envelope Quota is a best-effort display; a failed snapshot shows
  `unavailable` rather than failing an already finished request. `GET
  /v2/quota` fails closed with `503`.
- Committed contract pins in the private repository are not moved to an
  unreachable SHA; see the handoff for the exact pin to use after the public
  push.
