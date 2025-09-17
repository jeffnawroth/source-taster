# The Source Taster

Source Taster is a monorepo that combines a browser extension, a Hono-based API, and shared TypeScript packages to automate the extraction, search, and verification of academic references.

## Highlights

- AI-assisted reference extraction with configurable CSL fields and strict Zod validation shared between backend and extension.
- Multi-stage lookup across OpenAlex, Crossref, Semantic Scholar, Europe PMC, and arXiv with prioritisation and optional early termination.
- Deterministic matching pipeline with weighted field configurations, normalisation rules, and score visualisation in the UI.
- AnyStyle integration to tokenise references, edit labels manually, and convert them into CSL-JSON before matching.
- Browser extension with context-menu import, PDF parsing (unpdf), and popup/side panel modes for Chrome and Firefox.
- Encrypted storage of user-provided API keys in the backend keystore (AES-256-GCM) plus simple-git-hooks for clean commits.

## Architecture at a Glance

The workspace consists of `apps/extension` (Vue 3 + Vuetify), `apps/api` (Hono on Node 20), `apps/docs` (VitePress), and `packages/types` for shared types and schemas. High-level details live in [apps/docs/en/architecture.md](apps/docs/en/architecture.md).

```mermaid
flowchart LR
  subgraph Browser
    UI[Extension UI<br/>Popup & Sidepanel]
    Storage[WebExtension Storage<br/>clientId & Settings]
  end
  UI -->|X-Client-Id, JSON| API[(Source Taster API)]
  API -->|/api/anystyle| AnyStyle[(AnyStyle Server)]
  API -->|Fetch| External[(OpenAlex\nCrossref\nSemantic Scholar\nEurope PMC\narXiv)]
  API -->|Responses| UI
  UI -.->|Normalisation & Matching Settings| Types[@source-taster/types]
```

## Quick Start

1. **Prerequisites**
   - Node.js 20 (see `apps/api/Dockerfile`).
   - pnpm (via `corepack enable pnpm`).
2. **Install dependencies**
   ```bash
   pnpm install
   ```
3. **Configure the API**
   ```bash
   cp apps/api/.env.example apps/api/.env
   # Provide OPENAI_API_KEY, MASTER_KEY, and other required secrets
   ```
4. **Build shared types once**
   ```bash
   pnpm --filter @source-taster/types build
   ```
5. **Start the services** – see the next section for individual commands.

## Local Development

- **All apps in parallel**: `pnpm dev`
- **API (Hono + tsx watch)**: `pnpm --filter @source-taster/api dev`
- **Extension (Chromium)**: `pnpm --filter @source-taster/extension dev`
- **Extension (Firefox)**: `pnpm --filter @source-taster/extension dev-firefox`
- **VitePress docs**: `pnpm --filter @source-taster/docs dev`
- **Linting**: `pnpm lint`
- **Extension type check**: `pnpm --filter @source-taster/extension typecheck`
- **Types watch mode**: `pnpm --filter @source-taster/types dev`

The extension dev scripts emit a build under `apps/extension/extension`. Load it via `chrome://extensions` (Load unpacked) or `about:debugging#/runtime/this-firefox`. The API expects an `X-Client-Id` header (see `apps/extension/src/logic/storage.ts`).

## Configuration

Core environment variables (see `apps/api/.env.example`):

| Variable                                                | Purpose                                                                  |
| ------------------------------------------------------- | ------------------------------------------------------------------------ |
| `AI_PROVIDER`, `OPENAI_MODEL`                           | Default AI provider/model (`openai`, `anthropic`, `google`, `deepseek`). |
| `OPENAI_API_KEY`                                        | Dev fallback for AI calls when the user did not save a key yet.          |
| `ALLOWED_EXTENSION_IDS`                                 | Production CORS whitelist for Chrome/Firefox extension IDs.              |
| `SEMANTIC_SCHOLAR_API_KEY`                              | Recommended API token for Semantic Scholar.                              |
| `CROSSREF_MAILTO`, `OPENALEX_MAILTO`, `EUROPEPMC_EMAIL` | “Polite pool” email addresses for better rate limits.                    |
| `MASTER_KEY`, `KEY_DERIVATION_SALT`, `KEYSTORE_DIR`     | AES-256-GCM keystore configuration (one `.keystore` folder per server).  |
| `ANYSTYLE_SERVER_URL`                                   | Ruby AnyStyle server URL (default `http://localhost:4567`).              |
| `PORT`                                                  | API port (defaults to 8000).                                             |

> **Note:** `/api/extract` fails without a valid `OPENAI_API_KEY`. The extension stores user keys via `/api/user/ai-secrets`, encrypted on the server.

## Build & Release

- **Full workspace build**: `pnpm build`
- **API production build**:
  ```bash
  pnpm build:api
  node --experimental-specifier-resolution=node --env-file=apps/api/.env apps/api/dist/index.js
  ```
  Alternatively: `docker compose up api --build` (spins up the AnyStyle container as well).
- **Extension packaging**:
  - Chromium ZIP: `pnpm --filter @source-taster/extension pack:zip`
  - CRX (local signing): `pnpm --filter @source-taster/extension pack:crx`
  - Firefox XPI: `pnpm --filter @source-taster/extension pack:xpi`
- **Static docs build**: `pnpm --filter @source-taster/docs build` or `docker compose up docs --build`.

Release automation (GitHub Actions) is described in [apps/docs/en/extension.md](apps/docs/en/extension.md) and [apps/docs/en/development.md](apps/docs/en/development.md).

## API Snapshot

| Method            | Path                           | Auth          | Description                                                               |
| ----------------- | ------------------------------ | ------------- | ------------------------------------------------------------------------- |
| `POST`            | `/api/extract`                 | `X-Client-Id` | AI extraction of references (LLM + Zod validation).                       |
| `POST`            | `/api/search/:database`        | optional      | Searches `openalex`, `crossref`, `semanticscholar`, `europepmc`, `arxiv`. |
| `POST`            | `/api/match`                   | optional      | Deterministic evaluation of candidates versus one reference.              |
| `POST`            | `/api/anystyle/parse`          | optional      | Tokenises references through AnyStyle.                                    |
| `POST`            | `/api/anystyle/convert-to-csl` | optional      | Converts AnyStyle tokens into CSL-JSON.                                   |
| `POST/GET/DELETE` | `/api/user/ai-secrets`         | `X-Client-Id` | Stores, reads, and deletes encrypted user AI keys.                        |

Minimal dev example:

```bash
curl -X POST http://localhost:8000/api/extract \
  -H 'Content-Type: application/json' \
  -H 'X-Client-Id: 00000000-0000-4000-8000-000000000001' \
  -d '{
    "text": "Smith, J. (2024). Example Article. Journal, 12(3), 45-67. https://doi.org/10.1000/example",
    "extractionSettings": { "extractionConfig": { "variables": ["title", "author", "issued", "DOI"] } },
    "aiSettings": { "provider": "openai", "model": "gpt-4.1" }
  }'
```

A full reference of schemas, error codes, and provider nuances is documented in [apps/docs/en/api.md](apps/docs/en/api.md).

## Quality Assurance

- ESLint (Antfu config) via `pnpm lint` and enforced with simple-git-hooks + lint-staged.
- Type checks for the extension (`pnpm --filter @source-taster/extension typecheck`) and API (`pnpm --filter @source-taster/api build`).
- Zod schemas from `@source-taster/types` guarantee runtime parity between backend and frontend.
- **TODO:** Add automated integration/E2E tests for extraction, search, and matching flows.

## Documentation

- [apps/docs/en/intro.md](apps/docs/en/intro.md) – overview & goals
- [apps/docs/en/architecture.md](apps/docs/en/architecture.md) – component & sequence diagrams
- [apps/docs/en/development.md](apps/docs/en/development.md) – setup, scripts, troubleshooting
- [apps/docs/en/api.md](apps/docs/en/api.md) – endpoints, examples, errors
- [apps/docs/en/extension.md](apps/docs/en/extension.md) – build, load, manifest
- [apps/docs/en/data-models.md](apps/docs/en/data-models.md) – CSL models, schemas, defaults
- [apps/docs/en/matching-scoring.md](apps/docs/en/matching-scoring.md) – normalisation, heuristics, thresholds
- [apps/docs/en/changelog.md](apps/docs/en/changelog.md) – change history
- [apps/docs/en/migration.md](apps/docs/en/migration.md) – breaking changes & TODOs

Equivalent German pages live under `apps/docs/de/`.

## License

[MIT](LICENSE)
