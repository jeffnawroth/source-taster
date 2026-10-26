# Source Taster

Walking skeleton for [#71](https://github.com/jeffnawroth/source-taster/issues/71), part of [#70](https://github.com/jeffnawroth/source-taster/issues/70). Paste a Reference, create a Check through the verification API, and watch the worker advance its Status over replayable SSE. **No Structuring, search or verification happens yet.** The placeholder finishes with Status **Not checked**, never a Verdict.

## Run locally

Use Node 24 LTS (`.nvmrc`, the ADR-0002 fallback until Node 26 becomes LTS and is qualified) and pnpm 12.15.0. PostgreSQL 18 listens on **5433**. Existing containers on 8000 and 4567 are unrelated.

```sh
pnpm install --frozen-lockfile
pnpm build
# Start this service only if PostgreSQL is not already available on 5433:
docker compose up -d postgres
cp .env.example .env
```

Load `.env` in each terminal before running a process (`set -a; source .env; set +a` in bash/zsh). The file contains local development credentials only; supply deployment secrets through the environment.

```sh
pnpm db:setup
pnpm --filter @source-taster/server web
# In another terminal with the same environment:
pnpm --filter @source-taster/server worker
# In a third terminal:
pnpm --filter @source-taster/web dev
```

Open the Vite URL (default port 5173). Vite proxies `/v1` to port 3100; set `SOURCE_TASTER_API_URL` to change the development target. Production builds are in `apps/web/dist` and `apps/server/dist`; run `start:web` and `start:worker` and serve the SPA with a same-origin `/v1` proxy. Both server processes must use the same database URL. `db:setup` provisions a dedicated verification role and the `verification` / `verification_boss` schemas; the app role has no database-wide CREATE privilege. No Redis is needed.

Standalone is an **explicit** `SOURCE_TASTER_MODE=standalone` choice. It supplies one local Owner, every permission and no Quota (`quota: null`). Missing, unknown and hosted mode refuse startup. Hosted authorization and service connectivity are later slices; this build cannot accidentally grant standalone access to a hosted deployment.

## Workspace and contracts

- `apps/server`: Hono web process, pg-boss worker, Prisma schema and real PostgreSQL contract tests.
- `apps/web`: React/Vite, TanStack Router/Query, Tailwind and browser tests.
- `packages/ui`: shared React Aria primitives.
- `packages/i18n`: DE/EN catalogs compiled by Paraglide; the message-format plugin is an exact-pinned local build dependency. No runtime translation service or analytics.
- `packages/contract-common`, `packages/contract-verification`: dual-licensed transport contracts, without implementation imports.

The schemas, OpenAPI route declarations, generated `openapi.json` and fetch SSE client are the published seam. See [the contract README](packages/contract-verification/README.md) for the commit-pinned **git dependency**, with no registry publishing and no service-side vendored source. Contract build artifacts are intentionally committed so Node can import JavaScript directly after a git install. All other code is AGPL-3.0-or-later.

A Check and its per-Reference jobs commit together. Result Status and ordered event commit together, with per-Check locking and retry-safe updates. LISTEN/NOTIFY wakes each web process; streams read the durable log and use sequence IDs for replay. Disconnecting a stream does not cancel its Check. The full snapshot is `GET /v1/checks/{id}`; reconnect with `Last-Event-ID` at `/events`. No Reference content is placed in URLs, queue payloads or operational logs. The browser holds Check content only in memory; only the selected interface language is stored locally.

## Validation

```sh
pnpm typecheck
pnpm lint
pnpm i18n:check
pnpm build
pnpm test
pnpm --filter @source-taster/web exec playwright install chromium
pnpm test:e2e
pnpm audit:licenses
bash scripts/refresh-advisories.sh
OSV_SCANNER_BIN=/path/to/osv-scanner-2.7.0 pnpm audit:dependencies
```

Tests create a random **database and role per run**, migrate them, run separate web and worker processes, and remove only those owned resources on teardown. They use the admin URL from `.env.example` by default. Override `DATABASE_ADMIN_URL` and `DATABASE_TEST_URL` for another PostgreSQL instance; the latter supplies host/password while the harness generates isolated names. Contract tests use port 3101; browser tests use 3102 and 5174. Do not run two copies on the same ports. Assertions use only HTTP/SSE schemas and browser behavior, with axe on the input and finished page in DE and EN.

CI runs those checks on PostgreSQL 18 and Chromium, plus an offline OSV dependency scan on change and daily. See [dependency policy](docs/dependency-policy.md) for scope, license exceptions and remaining launch qualification. The full release/browser matrix, hosted service, cancellation/leases, content-retention sweeps and real checking are later tickets, not claims made by this skeleton.
