---
title: Development
outline: deep
---

# Development

## Prerequisites

- Node.js 20 (LTS). Dockerfiles use `node:20-bookworm-slim`.
- pnpm (for example `corepack enable pnpm`).
- Optional: Docker & Docker Compose for API + AnyStyle + docs.

## Installation & Bootstrap

```bash
pnpm install
cp apps/api/.env.example apps/api/.env
# Provide secrets such as OPENAI_API_KEY, MASTER_KEY, and additional API credentials.
pnpm --filter @source-taster/types build
```

### Workspace Commands

| Package                    | Dev                                          | Build                                          | Notes                                                                               |
| -------------------------- | -------------------------------------------- | ---------------------------------------------- | ----------------------------------------------------------------------------------- |
| `@source-taster/types`     | `pnpm --filter @source-taster/types dev`     | `pnpm --filter @source-taster/types build`     | Emits `dist/` for all consumers.                                                    |
| `@source-taster/api`       | `pnpm --filter @source-taster/api dev`       | `pnpm --filter @source-taster/api build`       | Start production build via `pnpm --filter @source-taster/api start` (reads `.env`). |
| `@source-taster/extension` | `pnpm --filter @source-taster/extension dev` | `pnpm --filter @source-taster/extension build` | Firefox mode `dev-firefox`, packaging via `pack:*`.                                 |
| `@source-taster/docs`      | `pnpm --filter @source-taster/docs dev`      | `pnpm --filter @source-taster/docs build`      | Preview with `pnpm --filter @source-taster/docs preview`.                           |
| Root                       | `pnpm dev`                                   | `pnpm build`                                   | Lint: `pnpm lint`; deployment handled by GitHub workflow `deploy.yml`.              |

## Workflow

1. **Update shared types** whenever schemas change: edit `packages/types/src`, then build or watch.
2. **Start the API**: `pnpm --filter @source-taster/api dev` (tsx watch + `.env`).
3. **Develop the extension**: `pnpm --filter @source-taster/extension dev` and load the build output via the browser dev tools.
4. **Edit docs**: `pnpm --filter @source-taster/docs dev` for live preview.
5. **Run lint hooks**: simple-git-hooks executes `pnpm lint-staged` (ESLint `--fix`) before commits.

## Environment Variables

- `.env` inside `apps/api` hosts sensitive keys. In development only `OPENAI_API_KEY` is required; production relies on user-provided keys stored through the API.
- The API aborts startup without `MASTER_KEY` and `KEY_DERIVATION_SALT` (`crypto.ts`).
- Set `ALLOWED_EXTENSION_IDS` in production to restrict CORS to known extension IDs.
- `ANYSTYLE_SERVER_URL` defaults to the compose service (`http://anystyle:4567`).

## Testing & Quality

- **Lint**: `pnpm lint` (ESLint 9 + `@antfu/eslint-config`).
- **TypeScript**: extension via `pnpm --filter @source-taster/extension typecheck`, API via `pnpm --filter @source-taster/api build`.
- **TODO:** Add automated API/UI tests (e.g. Vitest for services, Playwright for the extension).

## Troubleshooting

- **“Missing X-Client-Id”**: the header is injected only when the extension (and the `clientId` storage entry) is active. Provide a UUID manually for Postman/curl tests.
- **“AnyStyle unreachable”**: check `docker compose up anystyle` or adapt `ANYSTYLE_SERVER_URL` (`apps/api/src/services/anystyleProvider.ts`).
- **AI falls back to `json_object`**: `BaseAIProvider` downgrades when the provider lacks `json_schema` support (e.g. Google AI); warnings explain the fallback.
- **Rate-limit warnings**: OpenAlex/Crossref log warnings when polite-pool mailto headers are missing—set them in `.env`.
- **Firefox side panel menu missing**: background script initialises context menus on `browser.runtime.onInstalled`. Reload the temporary add-on (`about:debugging` → “Reload”).

## Docker Compose

```bash
docker compose up --build
# Services: api (8000), anystyle (4567), docs (8080)
```

- The API service reads `apps/api/.env` (do not commit secrets).
- The keystore mounts to `./.keystore`.

## Release Processes

- **Extension**: `pnpm --filter @source-taster/extension pack:zip` (Chrome Web Store upload), `pack:xpi` (Firefox).
- **API**: Build via `apps/api/Dockerfile`, run `node apps/api/dist/index.js`.
- **Docs**: Nginx image from `apps/docs/Dockerfile`.
- GitHub workflow `release.yml` generates a changelog using `changelogithub` whenever a `v*` tag is pushed.

## Open Items

- **TODO:** Add CONTRIBUTING/CODE_OF_CONDUCT once the contribution model is defined.
- **TODO:** Extend CI with integration tests for search and matching providers.
