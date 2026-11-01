# #98 extension sign-in: private-service phase (public side)

Status: **private phase implemented and validated locally; #98 not accepted.**
This file records the public half of the private phase. The private
implementation and its evidence are in the private repository's
`docs/validation-98.md` (branch `t3/98-private-extension-sessions-wip`).
Requirements remain in `98-private-session-handoff.md`. No qualification,
deployment, store or Firefox release claim is made.

## What changed on the public side

- Both-program harness (`apps/server/test/support/both-programs.ts`): extension
  origins, account policy, service restart with offline restore step, the held
  authority trap and captured mail.
- `apps/server/test/extension.contract.ts` (config `extension.vitest.config.ts`):
  four real tests against the real private service and PostgreSQL:
  1. captured-mail extension and cookie clients share Owner, Quota and Checks;
     sign-out here revokes only that session; refusal of held reads, downloads
     and streams; worker run; sign-out everywhere across both clients;
  2. an actual `pg_dump` / `psql` restore with a rotated external epoch cannot
     revive revoked sessions or stale JWTs;
  3. JWT expiry, logout/renewal race and a real service partition fail closed;
  4. (new) with a live SSE stream on each client, sign-out here ends only that
     client's stream; the other stream, token renewal and reads continue.
- `apps/extension/e2e-private/session.spec.ts` (config
  `private.playwright.config.ts`, now in the extension tsconfig/eslint scope):
  native Chromium DE/EN and Firefox against the real service with captured mail.
- Ports moved to the assigned 5001 (Firefox proxy) / 5002 (verification API).

## Validation (serial; own PostgreSQL 17.11 container on 5401)

Run against the private branch with the public integration tip packages linked
over the private pins (uncommitted override). Environment:
`DATABASE_ADMIN_URL`, `DATABASE_TEST_URL`, `SOURCE_TASTER_SERVICE_WORKTREE`,
`SOURCE_TASTER_TEST_POSTGRES_CONTAINER`, `SOURCE_TASTER_TEST_API_PORT=5002`.
Public packages were installed first (`pnpm install --frozen-lockfile`). The
filtered `pnpm turbo run build --filter=@source-taster/server...` exited 1 on the
website's Pagefind step; it still built the dependencies the tests needed, and
`pnpm --filter @source-taster/server build` built the compiled-entry test target.
The website build is not part of this evidence.

Durable logs (parent root `.tmp/spec-70-orchestration/`):
`98-private-final-public-{extension,account,guest,quota}.log`,
`98-private-final-private-{typecheck,eslint,account,guest,isolation,quota,service,extension}.log`,
`98-private-final-native-private.{log,json}` (the JSON holds the browser
annotations) and `98-private-final-native-account.log`.

| Command | Result |
| --- | --- |
| `apps/server`: vitest `extension.vitest.config.ts` | 4/4 |
| `account.vitest.config.ts` | 2/2 |
| `guest.vitest.config.ts` | 33/33 |
| `quota.vitest.config.ts` | 8/8 |
| `apps/extension`: `private.playwright.config.ts` | 3/3 (Chromium 156.0.8078.4 DE+EN, Firefox 160.0 EN) |
| `account.playwright.config.ts` (public fixture, NOT private evidence) | 25/25 |
| eslint / tsc / prettier on changed files | clean |

Failures found and resolved while running: the private signing-key failure was a
500 (fixed privately); an early native confirm returned 400 because the private
pin predates the `preferences` field of the confirm request (needs the repin);
and a first run of the stale test ports. The Firefox run required stubbing one
request (see below).

## Pins for the merger

Private must repin to a published public integration commit at or after
4d4255a (contains the #101 confirm `preferences` field). Lines to change in the
private repository:

- `apps/server/package.json` 24, 25, 26 (contract-internal, contract-service,
  contract-verification)
- `apps/web/package.json` 14 (contract-service)
- `scripts/evidence.ts` `contractCommit`
- regenerate `pnpm-lock.yaml`

This public branch changes no contract package, so the SHA is the published
integration tip after the merger pushes this branch.

## Limits

- Firefox sends no `Origin` on GET. The client's post-sign-in
  `GET /v1/extension/preferences` (#101) is therefore refused by the private
  service and the shared client treats 403 as an expired session. The Firefox spec
  proxy answers that single read 404 as a labelled stand-in. #101 private must
  add that route to the originless-GET profile and the stand-in must then go.
- Firefox dynamic origins stay a manual allowlist of one observed origin; this
  is not deployment qualification. Chromium uses an unpacked build allowlisted
  by its observed ID.
- Not covered: other browser releases, ESR, OS or assistive technology matrices;
  Firefox in DE; keyboard paste of the code; extension update; real providers.
- `SOURCE_TASTER_EXTENSION_ACCOUNT_SIGN_IN=enabled` must stay disabled until the
  parent decides after qualification. ADR-0013's Better Auth pre-1.0 transitives
  gate stays open.
