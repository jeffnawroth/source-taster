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
  Before the automatic start the user sees count and expected consumption; when
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
with a service snapshot (display only, degrades to `not-implemented` if the
service is unreachable) and adds `GET /v2/quota` so a client can read the
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
contract packages and `packages/i18n`).

- `tsc --noEmit` clean: server, ui, web, extension. `eslint` clean: server,
  ui, web, extension. `prettier --check .` clean. `i18n:check`: 365 messages
  in DE and EN.
- `pnpm test:quota` (apps/server): 7/7.
- `pnpm test:authority` (apps/server): 33/33.
- Account contract (`account.vitest.config.ts`): 2/2.
- `pnpm vitest run` (apps/server, standalone, no Quota): 580 passed, 1 failed.
  The failure is `article-fairness > alternates between Owners before
  alternating between one Owner's Checks`. It also fails on the unmodified base
  `246f449` (`99-public-fairness-baseline.log`); the sibling test `caps running
  References per Check` is timing dependent (1 of 3 isolated reruns failed).
  Standalone mode has no Quota port, so the settlement drain is inert there.
- `pnpm test:quota` (apps/web, Playwright chromium with axe, DE text): 4/4.

Not re-run in this ticket: `apps/web test:guest` (fails on the base too in the
non-accounts harness: `GET /v1/session` is a 404 there, so the sign-in gate
shows "Sign-in is temporarily unavailable"), the native extension specs and the
website/pagefind build (needs the controlled Pagefind source; the
`apps/website/dist-preview` artifact was copied from the root checkout for the
website test only and is not committed).

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
  checkout exists yet, so the web host passes none.
- The envelope Quota is a best-effort display; a failed snapshot shows
  `not-implemented` rather than failing an already finished request.
- Committed contract pins in the private repository are not moved to an
  unreachable SHA; see the handoff for the exact pin to use after the public
  push.
