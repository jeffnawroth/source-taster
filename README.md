# Source Taster

Development preview for [#70](https://github.com/jeffnawroth/source-taster/issues/70). Paste author-date References, create a Check through the verification API, and follow results over replayable SSE. With explicit `SOURCE_TASTER_DOI_PREVIEW=uncalibrated`, the DOI tracer ([#74](https://github.com/jeffnawroth/source-taster/issues/74)) resolves DOIs through the neutral doi.org Handle API, retrieves Crossref Candidates, and persists field Scores, identity evidence and a Verdict. The UI shows icon, color and text with DE/EN explanations and both raw field values. **This is an uncalibrated local development preview, not qualified for release or decisions.** Other checking routes remain Status **Not checked**. The separate **Structure References** action previews deterministic Structuring for APA, Harvard, Chicago author-date and MLA ([#72](https://github.com/jeffnawroth/source-taster/issues/72)).

## Run locally

**Just want to look around?** `pnpm dev:local` starts the whole offline preview (PostgreSQL in Docker, API, worker, web app, fake data sources) with one command; see [docs/local-preview.md](docs/local-preview.md). The manual steps below are for development.

Use Node 24 LTS (`.nvmrc`, the ADR-0002 fallback until Node 26 becomes LTS and is qualified) and pnpm 12.15.0. PostgreSQL 18 listens on **5433**. Existing containers on 8000 and 4567 are unrelated.

The full workspace build includes controlled native website tools and supports **macOS arm64** and **Linux amd64 GNU**. Install a host C/C++ compiler, linker and platform SDK first (Xcode Command Line Tools on macOS; GCC/G++ and the development headers on Linux). The fetch step downloads checksum-pinned sources and build tools, including a local Rust toolchain under `.tmp/pagefind/tools`; it does not use or change a global Rust installation. See the [controlled website build instructions](apps/website/qualification/controlled/README.md) for the recipe and qualification limits.

```sh
pnpm install --frozen-lockfile
pnpm pagefind:fetch
pnpm pagefind:build
pnpm pagefind:verify
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

Open the Vite URL (default port 5173). After `pnpm build`, Vite serves the marked website draft at `/docs/`, `/de/` and `/en/`, so the default help/legal links work locally. Vite binds loopback and production draft serving remains blocked. Vite proxies `/v1` to port 3100; set `SOURCE_TASTER_API_URL` to change the development target. Production builds are in `apps/web/dist` and `apps/server/dist`; run `start:web` and `start:worker` and serve the SPA with a same-origin `/v1` proxy. Both server processes must use the same database URL. `db:setup` provisions a dedicated verification role and the `verification` / `verification_boss` schemas; the app role has no database-wide CREATE privilege. No Redis is needed.

Standalone is an **explicit** `SOURCE_TASTER_MODE=standalone` choice. It supplies one local Owner, every permission and no Quota (`quota: null`). Missing and unknown modes refuse startup. Hosted authority is implemented, but deployable hosted startup remains closed until #94 supplies an eligible exact measurement; it never falls back to standalone. See the [Guest authority handoff](docs/implementation/96-guest-authority.md) for the source-only both-program harness and hosted web bootstrap.

## Workspace and contracts

- `apps/server`: Hono web process, pg-boss worker, Prisma schema and real PostgreSQL contract tests.
- `apps/web`: React/Vite, TanStack Router/Query, Tailwind and browser tests.
- `packages/core`: owned, deterministic Structuring rules behind an application-owned port (AGPL only).
- `packages/ui`: shared React Aria primitives.
- `packages/i18n`: DE/EN catalogs compiled by Paraglide; the message-format plugin is an exact-pinned local build dependency. No runtime translation service or analytics.
- `packages/contract-common`, `packages/contract-verification`: dual-licensed transport contracts, without implementation imports.

The schemas, OpenAPI route declarations, generated `openapi.json` and fetch SSE client are the published seam. See [the contract README](packages/contract-verification/README.md) for the commit-pinned **git dependency**, with no registry publishing and no service-side vendored source. Contract build artifacts are intentionally committed so Node can import JavaScript directly after a git install. All other code is AGPL-3.0-or-later.

A Check and its per-Reference jobs commit together. Immutable result content and ordered event commit together, with per-Check locking and retry-safe updates. LISTEN/NOTIFY wakes each web process; streams read the durable log and use sequence IDs for replay. Disconnecting a stream does not cancel its Check. The full snapshot is `GET /v1/checks/{id}`; reconnect with `Last-Event-ID` at `/events`. Queue payloads and operational logs contain no Reference content. Adapter requests send only identifiers and, for a bounded foreign-DOI probe, bibliographic fields to their responsible source. Search evidence and Candidates remain Check content. The browser holds Check content only in memory; only the selected interface language is stored locally.

## Structuring preview

`POST /v1/structurings` accepts `{ "text": "…" }` and returns a `StructuringResponse`: recognized References with exact original text, CSL fields and field provenance, plus rejected text and no-References guidance. Source spans are half-open UTF-16 offsets into the unmodified request text. Values remain as written; normalized identifiers are separate. Every Reference records parser path/version. Uncertain fields remain absent.

The preview is stateless and consumes no Quota. `SOURCE_TASTER_REFERENCE_LIMIT` is an Operator-configurable positive integer, initially 1,000, counted after Structuring. Over-limit requests return Problem Details with the applicable `limit`; input is never truncated. The web app presents fields and collapsible rejected text in DE/EN.

This endpoint deliberately leaves the existing `/v1/checks` placeholder contract and paste-and-watch behavior intact. A preview does not create Reference slots or start search. Connecting canonical Structuring to durable Check execution belongs to the later lifecycle/search slices. Preferences remain separate (#85). See [implementation scope and validation](docs/implementation/72-parser.md).

## Book route preview

Version 2 book and chapter Checks use the ISBN catalogs and bibliographic route
of [#79](https://github.com/jeffnawroth/source-taster/issues/79). Alongside the DOI
and bibliographic preview flags, explicitly enable
`SOURCE_TASTER_OPENLIBRARY_ENABLED=true`, `SOURCE_TASTER_GOOGLEBOOKS_ENABLED=true`
and `SOURCE_TASTER_OPENALEX_ENABLED=true` in both server processes. See
[the implementation and fixture qualification](docs/implementation/79-books.md)
for routing, edition ambiguity and the outstanding rights-cleared private catalog
recordings. Catalog budgets, timeouts and failure handling follow the shared
ADR-0007 search operating settings (`SOURCE_TASTER_SEARCH_SETTINGS`, see
[#78](docs/implementation/78-article-sources.md)). The existing
development/activation gates apply.

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

CI runs those checks on PostgreSQL 18 and Chromium, plus an offline OSV dependency scan on change and daily. See [dependency policy](docs/dependency-policy.md) for scope, license exceptions and remaining launch qualification. Check cancellation/leases and Guest current authority are implemented. The full release/native-browser matrix, Quota/abuse controls, content-retention sweeps and full source checking remain later work. The DOI tracer is uncalibrated; production activation and `pnpm --filter @source-taster/server build:release` refuse it until #94 qualification.

For DOI development, set `SOURCE_TASTER_DOI_PREVIEW=uncalibrated` for both server
processes. The API then binds loopback; `NODE_ENV=production` refuses this profile.
Tests use only local fixture HTTP servers and disposable PostgreSQL roles.
`POST /v1/checks` also accepts `{references:[{originalText,fields}]}` for explicit
CSL fields with user provenance; it never pretends those fields were parsed from
text. Invalid/unrecognized text must be reviewed in Structuring before checking.
See [the DOI handoff](docs/implementation/74-doi-tracer.md) for exact tracer limits
and the #81/#96 composition seams. Hosted mode and website publication stay closed.

The [#96 Guest authority handoff](docs/implementation/96-guest-authority.md)
documents identity storage, five-minute tokens, current request/output/worker
authorization, versioned invalidation, exact transport pins and remaining gates.
Run `pnpm --filter @source-taster/server test:authority` and
`pnpm --filter @source-taster/web test:guest` with
`SOURCE_TASTER_SERVICE_WORKTREE` pointing at an explicitly prepared private
worktree. These additional real-process tests do not replace the normal pipeline
or provide calibration/native-extension/launch qualification.
