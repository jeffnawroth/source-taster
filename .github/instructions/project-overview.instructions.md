---
applyTo: '**'
---

# Copilot Instructions for Source Taster

## Project Overview

- **Source Taster** is a browser extension (Vue 3 + TypeScript + Vuetify) and backend (Hono.js + TypeScript) for verifying academic sources, extracting metadata, and matching references using AI (OpenAI API).
- The project is a monorepo managed with pnpm workspaces. Key packages: `apps/extension` (browser extension), `apps/api` (backend API), `packages/types` (shared types), `packages/eslint-config` (shared lint config).

## Architecture & Data Flow

- **Frontend (apps/extension):**
  - Vue 3 Composition API, Vuetify, Pinia, vue-i18n for localization.
  - UI is split into panels: popup, options, sidepanel, with shared logic in `src/logic/` and `src/components/`.
  - User settings (theme, language, extraction mode, field weights) are persisted via `useWebExtensionStorage` composable.
  - Extraction and matching requests are sent to the backend API (`/api/extract`, `/api/match`).
- **Backend (apps/api):**
  - Hono.js server, modular routes in `src/routes/`, controllers in `src/controllers/`, services in `src/services/`.
  - Extraction and matching logic is in `ReferenceExtractionService` and `BaseMatchingService`.
  - AI integration via `OpenAIService` (see `ai/aiServiceFactory.ts`).
  - All types are shared via `@source-taster/types`.

## Developer Workflows

- **Install:** `pnpm install` (root)
- **Dev (all):** `pnpm dev` (runs all apps in parallel)
- **Dev (extension):** `pnpm --filter @source-taster/extension dev`
- **Dev (api):** `pnpm --filter @source-taster/api dev` (API at http://localhost:8000)
- **Build:** `pnpm build` (all apps)
- **Lint:** `pnpm lint` (all apps)
- **Test:** `pnpm test` (if tests exist)
- **Extension build:** See `apps/extension/package.json` for browser-specific scripts (e.g. `dev-firefox`, `pack:zip`).

## Project-Specific Patterns

- **Extraction Modes:** Unified as `strict`, `balanced`, `tolerant`, `custom` (see `ExtractionMode` in `@source-taster/types`).
- **Settings Storage:** Use `useWebExtensionStorage` for all persistent user settings in the extension.
- **Localization:** All user-facing strings must use `vue-i18n` with nested keys in `src/locales/`.
- **Type Safety:** All API payloads and settings are strongly typed and shared via `@source-taster/types`.
- **AI Integration:** All AI calls go through `OpenAIService` (backend), configured via environment variables.
- **Component Structure:** Prefer composition API, organize logic in `src/logic/`, UI in `src/components/`.
- **API Routing:** Add new endpoints via Hono routers in `src/routes/`, controllers in `src/controllers/`.

## Integration Points

- **External APIs:** Crossref, OpenAI, Europe PMC, Semantic Scholar, OpenAlex (see `src/services/databases/`).
- **Extension <-> API:** All extraction/matching is done via HTTP POST to the backend API.
- **Shared Types:** Always import types from `@source-taster/types` for consistency.

## Examples

- **Add a new extraction mode:** Update `ExtractionMode` enum in `@source-taster/types`, add logic in both frontend (settings UI) and backend (instruction generation).
- **Add a new metadata field:** Update types in `@source-taster/types`, add to extraction/matching logic, update UI and localization.

## Conventions

- Use `pnpm` for all scripts.
- All new user-facing text must be localized.
- Keep extraction/matching logic in backend services, not in the frontend.
- Use composition API and Pinia for state management in Vue.
- All persistent settings must use the storage composable.

---

If anything is unclear or missing, please provide feedback or examples to improve these instructions.
