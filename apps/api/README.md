# Source Taster API

Hono server on Node.js 22 that powers the [Source Taster](https://github.com/jeffnawroth/source-taster) browser extension.

## Quick Start

```bash
pnpm install
pnpm dev
```

The API starts on `http://localhost:8000`.

## Configuration

Copy `.env.example` to `.env` and configure at minimum:

| Variable          | Description                                |
| ----------------- | ------------------------------------------ |
| `OPENAI_API_KEY`  | Required for `/api/extract`                |
| `CROSSREF_MAILTO` | Polite pool email for Crossref rate limits |

See [apps/docs/api.md](../docs/api.md) for a full reference of all endpoints, schemas, and error codes.

## Production

```bash
pnpm build
node --experimental-specifier-resolution=node --env-file=apps/api/.env apps/api/dist/index.js
```

Or via Docker:

```bash
docker compose up api --build
```

This also starts the AnyStyle Ruby server as a sidecar.
