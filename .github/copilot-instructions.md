# Source Taster — Copilot instructions

Monorepo overview

- pnpm workspaces with three main parts:
  - apps/extension: Vue 3 + Vite + Vuetify web extension (popup, sidepanel, options)
  - apps/api: Hono.js TypeScript API server (extraction, search, matching, AnyStyle)
  - packages/types: Shared TS types and zod schemas published as @source-taster/types

Dev/build workflows

- Install: pnpm install (at repo root)
- Run all in dev: pnpm dev (API on http://localhost:8000, extension Vite dev server)
- API only: pnpm --filter @source-taster/api dev
- Extension only: pnpm --filter @source-taster/extension dev (see package.json for dev-firefox, pack:zip, etc.)
- Build all: pnpm build • Lint all: pnpm lint

Backend (apps/api)

- Entry: src/index.ts mounts Hono routers under /api/\* and listens on PORT or 8000.
- Routers and controllers:
  - /api/extract → extractionRouter → extractionController.extractReferences
  - /api/match → matchingRouter → matchingController.matchReference
  - /api/search[/:database] → searchRouter → searchController.searchAllDatabases|searchSingleDatabase
  - /api/anystyle/\* → anystyleRouter → AnystyleController.{parse,convertToCSL,trainModel}
- Request validation: Every controller parses with zod schemas from @source-taster/types (e.g., ApiExtractRequestSchema).
- Error contract: registerOnError() serializes errors as { success:false, error, message } and maps Zod to 400 and HTTPException codes.
- Auth/identity: withClientId middleware requires header X-Client-Id (UUID v4) for /api/user/\* and /api/extract; controllers read c.get('userId').
- CORS: In development allows all origins; in production, restricts to configured extension IDs via ALLOWED_EXTENSION_IDS.
- AI provider: AIProviderFactory creates OpenAI-compatible extraction provider; in dev, falls back to OPENAI_API_KEY if no per-user key is stored.
- Search providers: src/services/search/providers/\* (Crossref, Europe PMC, Semantic Scholar, OpenAlex, arXiv).
- AnyStyle: anystyleProvider bridges to the AnyStyle service; see routes under /api/anystyle.

Frontend extension (apps/extension)

- API config: src/env.ts defines baseUrl (VITE_API_BASE_URL default http://localhost:8000) and endpoint paths.
- HTTP helper: src/services/http.ts returns ApiResult<T> by interpreting the standard {success,data,error,message} shape and HTTP errors.
- Services:
  - src/services/extractionService.ts calls POST /api/extract with X-Client-Id
  - src/services/matchingService.ts, searchService.ts, anystyleService.ts, userService.ts follow same pattern
- Client identity and settings: src/logic/storage.ts persists clientId, settings via useWebExtensionStorage. Always include X-Client-Id from storage when calling protected endpoints.
- UI structure: popup/, sidepanel/, options/ with shared logic under src/logic and components/; localization in src/locales/; state via Pinia.

Shared types (packages/types)

- Import payloads and schemas from @source-taster/types (e.g., ApiSearchRequestSchema, ApiMatchRequestSchema). Use these in both server and extension to keep contracts in sync.

Add/update features — concrete patterns

- New API endpoint: create router in apps/api/src/routes, controller in src/controllers; validate with zod schema from packages/types; mount in src/index.ts. On the extension, add a service in src/services and a key in API_CONFIG if needed; call via apiCall with X-Client-Id when required.
- New search provider: add provider under apps/api/src/services/search/providers and register it in searchCoordinator.
- New user setting: declare default in @source-taster/types (DEFAULT_UI_SETTINGS) and persist via useWebExtensionStorage in src/logic/storage.ts; localize labels in src/locales.

Gotchas

- The API relies on the success-flagged JSON contract; do not return raw data from controllers—wrap and validate with the shared zod response schemas.
- In development, OPENAI_API_KEY can be used as a fallback for extraction if no per-user key is stored; in production, user secrets must be saved via /api/user/ai-secrets.
- Some endpoints (e.g., /api/extract, /api/user/\*) will 401/400 without a valid X-Client-Id.

Key files

- apps/api/src/index.ts, routes/_, controllers/_, errors/registerOnError.ts, middleware/{clientId,cors}.ts
- apps/extension/src/env.ts, services/_, logic/storage.ts, locales/_
- packages/types/src/\*_/_ (API contracts and schemas)

If any workflow or convention here seems off, point me to the file, and I’ll tighten the guidance.
