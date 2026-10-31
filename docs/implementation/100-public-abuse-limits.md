# #100 public verification entrance limits

This is the PUBLIC implementation phase of #100 under #70. It is not full #100
acceptance. The private policy/combined-accounting service and real both-program
evidence remain required in [the exact private handoff](100-private-abuse-handoff.md).
No private checkout was read/edited/created, and no push, PR, issue closure or nested
agent was used. The branch descends from required integration
`dc39bbeab3da55bc410ad866be65f5ee724318b9` and merges integration
`512e4572d2b7473d6d6a40dc27923a2d891fc92a` (including the disabled #98 public phase).

## Implemented behavior

The hosted verification composition installs an entrance middleware before body
validation on `/v1` and `/v2`, including unknown routes, unauthenticated attempts,
reads, downloads and SSE connections. Health, website and signed `/internal`
callbacks are outside this business entrance. Standalone remains the explicit
single-local-Owner mode; it does not silently become hosted. Hosted startup still
refuses activation without qualified measured-configuration evidence. The new
composition also requires the signed service transport and explicit origin key
configuration; unavailable private endpoints cannot yield an allowance.

The Operator policy transport caches settings per instance for its declared
lifetime, bounded to 30 seconds, with single-flight refresh and no stale fallback.
Every entrance requires a fresh signed service accounting/Plan decision. The
private service owns the combined ledger; public PostgreSQL counters implement
only verification-wide budgets. Separate public/private counters are never claimed
to be global. The public transaction counts every applicable local dimension even
on an eventual 429, including when the service has already denied the attempt.

Local dimensions are stable principal actor under current Plan, browser-held Guest
ID independently of renewable authority context, all Guests (including neutral
unauthenticated attempts), and keyed/truncated network origin. Counter keys omit
Plan ID/policy version, preserve attempts across Plan ceiling changes, and saturate
only above the greatest permitted ceiling. All Plans share a principal window;
inconsistent settings fail closed instead of resetting usage on a Plan change.
Atomic PostgreSQL upserts in a stable dimension order prevent concurrent public
instances from admitting above the configured fixed-window allowance.

Only the trusted socket peer enters origin derivation; arbitrary forwarding and
HTTP Origin headers have no influence. Host bits are zeroed before HMAC-SHA256.
Window-pinned key selection and durable configuration pins preserve live origin
allowances across rotation; missing/replaced active material fails closed. Prefix
widths, key schedules and budget values are explicit operating settings requiring
qualification. /24, /56 and the short windows in synthetic tests are not product
recommendations or qualification evidence.

`EntranceLimitProblem` is a typed 429 with stable `abuse-limit` code,
`problem_abuse_limit` key, ISO UTC `retryAt`, no-store response and whole-second,
rounded-up `Retry-After`. The latest exceeded public/shared deadline wins. Shared
DE/EN workspace and action controls show the continuation time; the main workspace
renders semantic `<time datetime>`, including retained SSE failures. The existing
SSE reader stops on 429, with no automatic hot retry or duplicated frames.

Neither source permits nor reference Quota is replaced/charged by these counters.
Existing current-authority checks before effects, output and stream frames remain.
Unknown/unavailable identity is not a grant; there is no Account lookup endpoint,
fingerprinting or network-based permanent Account suspension in this phase.

Counters/pins have fixed window-end expiry no later than 24 hours; increments and
denials never extend it. Startup/one-second maintenance purges expired rows and
failed maintenance closes admission until recovery. Routine database exports omit
both tables' data. Physical-deletion timing during outages and safe restoration of
lost live allowances require the deployment/private admission fence documented in
the handoff. No hard real-time outage deletion or restored-ledger readiness is
claimed from the public tests.

## TDD and validation

The agreed seams were #70 HTTP/SSE, real PostgreSQL, external adapter edges and
Playwright clients. Tests do not assert table layouts or mock internal domain
collaborators. The source-only fixture composes two independent API/limiter/authority
instances and connection pools behind one owned HTTP listener, real check store,
pg-boss/events and PostgreSQL. The unavailable private HTTP edge supplies synthetic
signed-access/current-authority/policy/accounting responses and verifies the new
program assertions' signature, purpose, issuer, audience, path/method and body
binding. It does not implement/prove the private domain or combined ledger.

Observed red cases and fixes (logs in worktree-local `.tmp/100/`):

- `red-principal.log`: 12 of 12 concurrent requests admitted against allowance two;
  `green-principal.log` admits two and denies ten with an exact deadline.
- `red-invalid.log`: invalid/missing credentials escaped origin accounting;
  `green-invalid.log` closes the new-Guest bypass while protected routes retain 401.
- `red-guest-id.log`: renewed authority context reset the Guest allowance;
  `green-guest-id.log` uses the signed, stable Guest ID.
- `red-combined.log`: the shared-denial Plan/attempt contract was incomplete;
  `green-combined.log` counts the denied entrance and never caches the decision.
- `red-plan.log`: downgrading a Plan reduced a saturated counter and re-upgrading
  admitted another request; `green-plan.log` preserves the attempt count.
- `red-plan-windows.log`: inconsistent Plan window lengths were accepted;
  `public-final.log` rejects settings that would create a Plan-switch reset.
- `red-client.log`: both languages displayed a generic error for a real API 429;
  `green-client.log` and `client-postmerge.log` show DE/EN continuation in the web
  app and actual native Chromium extension side panel.
- `red-backup.log`: a real database export archived the synthetic Guest accounting
  identifier; `green-backup.log` proves the production export flags exclude it.

Initial setup also needed generated core/Prisma/transport prerequisites. An explicit
Prettier call on SQL reported no SQL parser; SQL was left as SQL and the supported
source/whole-tree formatting checks were used. An intermediate contract build
correctly rejected duplicate 429 properties inherited by v2 routes; source was
fixed and every committed transport/OpenAPI artifact regenerated, not hand-merged.
Server lint initially caught an unsafe Hono binding and a promise-returning Node
HTTP callback; both were corrected before the final checks.

Owned resources: PostgreSQL 18 container `st100-public-a5e7dde3` on loopback 5471,
unique per-case databases/roles, API 4701, private HTTP fixture 4702, browser 5371.
DB suites run serially; no shared 5433 server, global setting, unknown role/database
or unrelated resource was changed. Test results are under ignored `.tmp/100/`, not
committed `test-results-abuse` output.

Commands use `DATABASE_ADMIN_URL` and `DATABASE_TEST_URL` pointing at that owned
container. The primary focused invocation is
`pnpm --filter @source-taster/server exec vitest run --config abuse.vitest.config.ts`;
clients use
`pnpm --filter @source-taster/web exec playwright test --config abuse.playwright.config.ts`.

Final results and limits are recorded below after the integrated checks complete.
