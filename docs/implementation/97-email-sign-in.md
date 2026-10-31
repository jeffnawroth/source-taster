# #97 Email-code sign-in implementation (public half)

Branch `t3/session-http500-diagnosis` starts at `d81ef18` on
`spec/70-launch-integration` (#80/#83/#87 and the approved #80
implementation/activation split). It carries the checkpointed Codex slices
(`90bd67b`, `7f6799e`, `1a7a533`), the completion commit `94abe8a` and merges of
the integration tip at `bc45191` (#89) and `920e5d0` (#88). The proprietary
half lives on private branch `t3/97-email-sign-in`. Implemented under
implement-spec #70 with the TDD skill, against #70's confirmed real-PostgreSQL
HTTP/SSE and browser seams. No predecessor, issue mutation, push, PR,
deployment, activation (#114, blocked by #140) or human qualification
(#116/#136/#138) is part of this work.

## Behavior

- **Service contract** (`packages/contract-service`): `POST
  /v1/sign-in/challenges`, `POST /v1/sign-in/confirm`, `POST /v1/sign-out`
  (here or everywhere), `GET /v1/session`, `POST /v1/session/activity` and
  `POST /v1/account-tokens`. Session reads, activity and token issuance declare
  401 and a retryable 503 Problem.
- **Internal contract** (`packages/contract-internal`): `POST
  /internal/account-authority`, the Account counterpart of
  `/internal/guest-authority`, with the same strict signed request assertion
  (purpose `account-authority`).
- **Verification authority** (`apps/server/src/authority`): access tokens are
  a discriminated union of Guest and Account claims. An Account token
  (`purpose: "account-access"`, five-minute lifetime) binds actor, Owner and
  session and is checked against the service's current Account authority.
  Session logout invalidates through the existing versioned Owner fence and
  drain.
- **Web** (`packages/ui/src/web-account-workspace.tsx`, `apps/web`): DE/EN
  email-code sign-in, keyboard confirmation, resend after the waiting period,
  reload-stable sessions, sign-out here/everywhere, and the notice that Guest
  Checks and Guest Quota are not transferred. No token or code is kept in web
  storage. The session cookie is host-only `Secure`, `HttpOnly` and
  `SameSite=Strict`. A non-401 session failure shows "Sign-in is temporarily
  unavailable" with a retry action.
- **Both-program harness** (`apps/server/test/support/both-programs.ts`):
  optional `accounts` configuration, fixed ports 3501/3502 for Account runs,
  local mail capture and `signIn()`. If setup fails, the harness now drops its
  own database and roles before rethrowing.

## TDD evidence

Logs are in `/tmp/source-taster-70/` and are not committed.

| Slice | Red | Green |
|---|---|---|
| Account sign-in (private) | `97-account-red.log`: `expected 404 to be 200` | `97-account-green.log`: 1/1 |
| Session lifecycle (private) | `97-sessions-red.log`: `expected 404 to be 200` | `97-sessions-green.log`: 2/2 |
| Send/guess budgets (private) | `97-budget-red.log`: `expected 200 to be 429` | `97-budget-green.log`: 4/4 |
| Both-program Account authority | `97-both-red.log`: `expected 401 to be 201` | `97-both-green.log`: 2/2 |
| Browser sign-in | `97-browser-red.log`: sign-in control not found | `97-browser-green.log`: 2/2 |
| DB exhaustion is 503, not 500 (private) | `97-claude-red-db-exhaustion.log`: `expected [ 200, 500, 500, 500 ] to include 503` | `97-claude-green-db-exhaustion.log`: passed |
| Codes rest only as a keyed hash (private) | characterization, green on first run (`97-claude-at-rest.log`). A mutation that keeps the pending code after delivery fails it as intended (`97-claude-at-rest-mutation.log`). The source was restored. | 6/6 private suite |
| 503 only where the contract declares it (private) | `97-claude-red-undeclared-503.log`: an undeclared local diagnostic route answered `expected 503 to be 500` | `97-claude-green-undeclared-503.log`: passed |

## `/v1/session` HTTP 500 diagnosis

**Reproduction.** `97-browser-reproduction.log` and `97-browser-diagnostic*.log`
show the failure. After a reload, the dev web app (React StrictMode runs the
session effect twice) sent two concurrent `GET /v1/session`. One returned 200
and the other 500, and the UI showed "Sign-in is temporarily unavailable".
Earlier repeats in the same runs failed during fixture migration with
"remaining connection slots are reserved for roles with the SUPERUSER
attribute".

We tested three competing hypotheses with a temporary, uncommitted test
(`97-claude-diag-h1h3.log`). It used only the fixture's own disposable role and
connections, and its logging recorded only the error shape, never content.

| Hypothesis | Result | Evidence |
|---|---|---|
| H1: PostgreSQL connection-slot exhaustion surfaces as 500 | **Confirmed** | We limited the fixture's own role to its held backends. Sequential requests returned 200 and 200. Concurrent requests returned `[200,500,500]`, each a "too many connections" error. This matches the trace. |
| H2: fixture cleanup leaks consume shared slots | **Partially confirmed** | Normal teardown left no database, role or backend. A failed `bothPrograms` setup did leak its database and roles. Fixed in `94abe8a`. |
| H3: an Account/session lifecycle race in the handler | **Refuted** | With connection headroom, 10 rounds of 8 concurrent session, activity and token requests returned 80/80 200s. The handler is read-only. |

**Fix.** The service now answers database connectivity failures with the
retryable 503 `authority-unavailable` Problem instead of an internal 500, but
only on operations whose service or internal contract declares 503. The scope is
derived from the contract routes, so no undeclared status leaks. Red/green tests
cover both halves. The verification server already fails closed on any non-OK
authority response, so a 503 from the internal authority is handled the same as
a 500 was. The web
client's handling (unavailable state plus retry, guarded against stale
responses) was already correct and is unchanged.

**Not fixed: the environmental cause.** Each service process holds about 14
backends on the shared PostgreSQL, which allows 100 connections. Pool sizing is unchanged, so parallel both-program suites can
still exhaust slots. They now answer 503 rather than 500.

## Validation (final, after merging `920e5d0`)

| Check | Log | Result |
|---|---|---|
| Install, i18n/core/contract builds, `prisma generate`, server build | `97-claude-merge2-build.log` | exit 0. Regenerated contract dist and OpenAPI have no diff against the merged tree. |
| Typecheck and lint: contract-verification, contract-service, contract-internal, server, ui, web; Prettier on the conflict files | `97-claude-merge2-types-lint.log` | exit 0 |
| `pnpm i18n:check` | `97-claude-merge2-i18n.log` | exit 0 |
| Public Account contract (`account.vitest.config.ts`) | `97-claude-merge2-public-account.log` | 2/2 |
| Guest both-program regression (`guest.vitest.config.ts`), because the harness changed | `97-claude-merge2-guest.log` | 33/33 |
| Account browser (`account.playwright.config.ts`, `--repeat-each 2`) | `97-claude-merge2-browser.log` | 4/4 |
| Private typecheck against the merged contracts | `97-claude-merge2-private-types.log` | exit 0 |
| Full private server suite (serial) | `97-claude-private-full-final.log` | 21/21 |
| Private ESLint, Prettier, typecheck and i18n check | `97-claude-private-lint-final.log` | exit 0 |
| Cross-program rerun after the last private fix: Account contract, Guest regression, Account browser | `97-claude-final2-public-account.log`, `97-claude-final2-guest.log`, `97-claude-final2-browser.log` | 2/2, 33/33, 4/4 |

PostgreSQL suites ran serially against the shared server on ports 3501, 3502
and 5274.

**Failures during validation.** The first guest regression run
(`97-claude-guest-regression.log`) had 32 passing tests and 1 failing.
"reachable authority and valid Guests cannot activate the deployable
unmeasured hosted program" failed with `dist/web.js: expected 1 to be 78`,
because the fresh worktree had no public `apps/server/dist`. After `pnpm build`
it passed (`97-claude-guest-hosted-retry.log`), and the full suite later
passed 33/33. The merge with `920e5d0` had source conflicts in
`packages/i18n/messages/{de,en}.json` (both sides only added keys, so both were
kept) and in one `check-workspace.tsx` import line (combined). Generated files
were not hand-merged; they were regenerated.

The first full private suite run (`97-claude-private-full.log`) had 20 passing
and 1 failing with `ECONNREFUSED 127.0.0.1:3502`. A rerun was green, but we
diagnosed it instead of accepting the rerun. A temporary repeat test
(`97-claude-diag-econnrefused.log`) found one first request in ten refused
immediately after the ready signal. Every later request succeeded, and the child
process logged no errors. That ruled out a crash and confirmed that readiness was
signalled before `listen` completed. The service start now resolves only after
it accepts connections. 30 repeats then had no refusals
(`97-claude-diag-econnrefused-green.log`).

## Limitations and caveats

- **Open release gate.** The Better Auth 1.7.14 exact pin (Prisma adapter,
  telemetry off, behind an owned port) is approved for implementation. Its
  transitive `kysely ^0.28`, `@better-auth/utils 0.5.1` and `rou3 0.9.2` remain
  an **open** ADR-0013 "Selected release" gate. No qualification is claimed and
  no exception is granted.
- **Spec deviation: code at rest.** Delivered sign-in codes rest only as a
  keyed hash. Until delivery, and after a failed delivery, the service holds the
  pending code encrypted for its mail outbox and clears it once the code is sent.
  Details are in the private validation record.
- **Shared PostgreSQL footprint.** See the diagnosis above. Two
  `guest96_*` databases and `v96`/`s96` roles from an unknown owner remain on the
  shared server. They were left untouched.
- **Pagefind.** The website dist preview used by the web dev server needed the
  controlled Pagefind cache. It was cloned from an earlier worktree's
  `.tmp/pagefind` and passed `pnpm pagefind:verify`.
- **Dev double request.** StrictMode's double session effect is expected in dev
  only. Production builds send one request.
- **Activation.** Account activation, hosted origins, mail-provider custody and
  key custody remain #114/#140 and human release work.

## Contract pins for the merger

Private commits keep the published pin. The cross-program runs used only
uncommitted `node_modules` overrides for `contract-service` and
`contract-internal` that pointed at this worktree. After the public integration
branch with this work is pushed, replace
`bfd3edeb79866e26f7e6057712322031bc692fbc` with that pushed full SHA in all
three private locations, then refresh the private lockfile:

- `apps/server/package.json` lines 24 to 26: contract-internal, contract-service
  and contract-verification.
- `apps/web/package.json` line 14: contract-service.
- `scripts/evidence.ts` line 4: `contractCommit`.

```text
github:jeffnawroth/source-taster#<pushed-public-sha>&path:packages/contract-service
github:jeffnawroth/source-taster#<pushed-public-sha>&path:packages/contract-internal
github:jeffnawroth/source-taster#<pushed-public-sha>&path:packages/contract-verification
```

## Integration-branch merge (31 October 2026)

Merged into `spec/70-launch-integration` as `1e14d63` after #84. The only
conflicts were additive DE/EN message keys (manual-override and `auth_*` keys
both kept). Generated contract files were regenerated, not hand-merged, and
reproduce with an empty `git status`. No dependency or lockfile change. Public
validation on this tip is recorded in
[84-manual-overrides.md](84-manual-overrides.md#integration-branch-merge-31-october-2026-with-97).

The private half now lives on its integration branch and pins all contract
consumers to the pushed public SHA `1e14d63dfa85d19ce6a98e2713a5aa480bc4b10f`.
It builds and typechecks (server and web) against that contract, and its
private suite passes. Cross-program runs from this checkout at `1e14d63`:

| Check | Log | Result |
|---|---|---|
| Account contract (`account.vitest.config.ts`) | `84-97-both-account-contract-rerun.log` | 2/2 |
| Guest regression (`guest.vitest.config.ts`) | `84-97-both-guest-rerun.log` | 33/33 |
| Account browser (`account.playwright.config.ts`, `--repeat-each 2`) | `84-97-both-account-browser-rerun.log` | 4/4 |

The first attempt hit shared PostgreSQL connection exhaustion while another
implementer's suites held about 35 connections: account 1/2, guest 5/33, and
2 browser runs failed with "remaining connection slots are reserved"
(`84-97-both-*.log` without `-rerun`). The failed setups left the harness's
own service processes running, and those held their 12 disposable databases
open. Only those processes, databases and roles were removed. The two older
`guest96_*` databases from an unknown owner are untouched. This repeats the
pool-footprint caveat above. Also, the harness does not stop child processes
when setup fails under connection exhaustion; that remains open.

The ADR-0013 "Selected release" gate for Better Auth transitives stays open.
