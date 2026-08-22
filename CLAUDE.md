@AGENTS.md

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Academic reference verification: browser extension (Vue 3, MV3) + web app + Hono API. Extracts references from text/PDFs, searches 5 academic databases, and scores matches deterministically to detect AI-hallucinated citations.

## Commands

```bash
corepack enable pnpm      # first-time setup
pnpm install
pnpm build:types          # build @source-taster/types — do this before typecheck/dev after touching schemas
pnpm dev                  # types + parallel dev servers (extension, web, docs, landing); API runs but AnyStyle parsing is unavailable
pnpm dev:docker           # same, plus starts the anystyle service in Docker — needed for reference parsing
pnpm build                # build all workspaces
pnpm typecheck            # workspace-wide, parallel
pnpm lint                 # ESLint (Antfu config), workspace-wide, parallel
pnpm test                 # Vitest, workspace-wide, parallel
```

Per-workspace (use when iterating on one app):

```bash
pnpm --filter @source-taster/api dev            # API only, tsx watch, http://localhost:8000
pnpm --filter @source-taster/api test            # vitest run
pnpm --filter @source-taster/api db:migrate      # Drizzle migration
pnpm --filter @source-taster/extension dev       # Chromium build with HMR
pnpm --filter @source-taster/extension dev-firefox
pnpm --filter @source-taster/web dev             # web app (SPA at sourcetaster.com/app)
```

Single test file: `pnpm --filter @source-taster/api exec vitest run path/to/file.test.ts` (same pattern for `web`/`extension`; add `-t "name"` to filter by test name).

Pre-commit hook (`simple-git-hooks`) runs `pnpm build:types && pnpm typecheck && pnpm lint-staged` automatically — don't skip it.

Before considering a change done, run the relevant subset of `pnpm lint && pnpm typecheck && pnpm test`.

## Architecture

```
Browser Extension (Vue 3 + Vuetify, MV3)  ─┐
Web App (Vue 3 SPA, sourcetaster.com/app) ─┼─ fetch + X-Client-Id ─▶  API (Hono on Node 20+)
                                            ┘                          │
                                                     ┌──────────────────┼───────────────────┐
                                                     ▼                  ▼                    ▼
                                          AnyStyle Server (Ruby)   5 databases          AI Providers
                                          tokenize → CSL          (OpenAlex, Crossref,  (OpenAI/Anthropic/
                                                                   Semantic Scholar,     Google/DeepSeek)
                                                                   Europe PMC, arXiv)
```

`packages/types` (Zod schemas) is the single source of truth for API contracts, imported by both API and frontends — **when you change a schema there, run `pnpm build:types` before the consuming workspace will see the update.**

### Workspace layout (pnpm monorepo)

- `apps/api` — Hono 4, Drizzle ORM, Postgres 16, Zod 4
- `apps/web` — Vue 3 SPA, Vuetify, Pinia, vue-i18n
- `apps/extension` — Vue 3 + Vuetify, MV3, dual Chrome/Firefox build (separate Vite bundles for popup/side panel, background, content script)
- `apps/landing` — Astro static site (bilingual EN/DE)
- `apps/docs` — VitePress (EN + DE) — see `apps/docs/architecture.md`, `data-models.md`, `matching-scoring.md`, `api.md` for deep dives
- `packages/types` — shared Zod schemas / TS types
- `evaluation/` — standalone Node evaluation scripts + reference corpora (Master's thesis validation)

### API request flow (`apps/api/src`)

Routers → controllers, one router file per resource, mounted under `/v1/*` in `src/index.ts`:

- `/v1/extract` → `extractionRouter` → LLM-based extraction into CSL-JSON (`ReferenceExtractionCoordinator`)
- `/v1/search[/:database]` → `searchRouter` → `SearchCoordinator` + one provider class per database (`src/services/search/providers/`)
- `/v1/match` → `matchingRouter` → `DeterministicEngine.matchReference` (field-by-field scoring, no LLM)
- `/v1/anystyle/*` → `anystyleRouter` → bridges to the AnyStyle Ruby service (parse/convert-to-csl)
- `/v1/user/*` → `userRouter` → BYOK secrets management

Every controller parses input with Zod schemas from `@source-taster/types`. `registerOnError()` normalizes all errors to `{ success:false, error, message }`; never return raw/unwrapped data from a controller. Middleware order in `index.ts` matters: requestId → security headers → body limit → CORS → health (unprotected) → API-key auth → rate limit → `X-Client-Id` requirement (only for `/v1/user/*` and `/v1/extract`) → routes.

### Matching engine

`apps/api/src/services/matching/engines/deterministicEngine.ts` computes `overall = Σ(fieldScore × weight) / Σ(weight)` per candidate. Default field weights: title 30, author 25, issued 15, container-title 15, DOI 10, volume 3, page 2. Values are normalized first (`NormalizationService`, a fixed pipeline of ~10 rules — typography → characters → URLs → identifiers → umlauts → accents → unicode → punctuation → whitespace → lowercase), then compared with field-specific heuristics (author initials, structured dates, page-range overlap, container-title variants, Damerau-Levenshtein similarity). Score thresholds (85/50) drive both the UI color coding and early-termination across databases (`useVerification.performVerificationWithEarlyTermination` on the frontend). See `apps/docs/matching-scoring.md` for the full breakdown.

### Extension internals (`apps/extension/src`)

- `env.ts` — API base URL/config; `logic/storage.ts` — persists `clientId` and settings via `useWebExtensionStorage`; always attach `X-Client-Id` from storage on protected calls
- `services/*Service.ts` — one per API resource (extraction, matching, search, anystyle, user), all going through `services/http.ts` which interprets the `{success,data,error,message}` envelope
- `popup/`, `sidepanel/`, `options/` — MV3 surfaces, sharing `logic/` and `components/`
- Manifest is generated by `scripts/prepare.ts`; edit there (not a static `manifest.json`) to change permissions/pages
- Extension and web app are bilingual — new UI strings need both `src/locales/en.json` and `de.json`

## Claude Code

The canonical place for Claude Code's capability and evidence status (technically enforced vs. instruction-level vs. not supported) is `docs/ai-os/runtimes/claude/implementation.md` — this section only points to it and adds no policy of its own.
