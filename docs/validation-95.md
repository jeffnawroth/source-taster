# Issue #95: public contract evidence

The isolated branch started clean at integration commit
`9df3b8befd977ceb3fc3bfb205d27134ec14f45a`. It adds only dual-licensed
`contract-service` / `contract-internal` transport skeletons, their built JS,
declarations and OpenAPI, plus distribution documentation and artifact checks.
The private program is independently authored in `jeffnawroth/source-taster-service`;
no private implementation, UI catalog or template is committed here.

The service status contract grants no authentication, permissions or Quota. The
internal diagnostic accepts a language and idempotency key, never a recipient,
mail body or verification content. It is loopback-only and disabled by default in
the private implementation. Auth and signed entitlement/Quota routes remain for
subsequent tickets. See [contract boundary](private-service-contracts.md).

Validation on 26 October 2026:

- Frozen pnpm install, full typecheck, ESLint/Prettier, catalog check and build pass.
- Existing real-PG HTTP/SSE tests pass after merging the local integration tip.
- All 10 existing Chromium tests pass, including DE/EN, axe and Guest Preferences.
  The default API port was occupied by another worktree; this run used the
  existing `SOURCE_TASTER_E2E_API_PORT=3312` and
  `SOURCE_TASTER_E2E_WEB_PORT=5312` overrides without disturbing that process.
- Both new contract packages rebuild deterministically; CI checks their committed
  artifacts, and generated OpenAPI is excluded from prose formatting as with the
  existing verification contract.
- The open repository's license gate passes (388 installed packages, 67 runtime).
- The private repository installs all three contracts from the pushed full-SHA
  Git subdirectory selector, selecting MIT, with exports resolving to built JS
  and declarations. Its own HTTP tests parse the service/internal responses and
  capture SMTP against real PostgreSQL. Private implementation evidence is kept
  in that repository.

No predecessor code, shared database/container configuration or ports 8000/4567
were touched. The parent owns integration and review; no open-repository PR is
created by this ticket branch. Legal and production qualification remain human
or subsequent-ticket gates.
