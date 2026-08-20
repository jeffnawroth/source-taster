# AGENTS.md — Source Taster

## Project
Academic reference verification. Browser extension (Vue 3, MV3) + web app + Hono API. Extracts references from text/PDFs, searches 5 academic databases, and scores matches deterministically to detect AI-hallucinated citations.

## Canonical terminology
- **reference** — bibliographic entry (raw text) to be verified
- **source** — a verifiable published work
- **hallucination** — AI-fabricated citation (the core problem)
- **extraction** — parsing unstructured text into structured CSL-JSON (AnyStyle or LLM: OpenAI/Anthropic/Google/DeepSeek)
- **matching / verification** — deterministic scoring; thresholds: ≥85 success, 50–84 warning, <50 suspect
- **5 databases** — OpenAlex, Crossref, Semantic Scholar, Europe PMC, arXiv
- **BYOK** — bring-your-own AI provider key (AES-256-GCM encrypted in keystore)
- **X-Client-Id** — anonymous browser identity (UUID v4); **X-API-Key** — `srt_live_` B2B key (only SHA-256 hash stored)
- **API namespace**: `/v1/*` (never `/api/*`)

## Workspace layout (pnpm monorepo)
- `apps/api` — Hono 4, Drizzle ORM, Postgres 16, Zod 4, pino, OpenTelemetry
- `apps/web` — Vue 3 SPA, Vuetify, Pinia, vue-i18n (web workspace at `sourcetaster.com/app`)
- `apps/extension` — Vue 3 + Vuetify, MV3, dual Chrome/Firefox build
- `apps/landing` — Astro static site (bilingual EN/DE)
- `apps/docs` — VitePress (EN + DE)
- `packages/types` — shared Zod schemas / TS types: single source of truth for API contracts
- `evaluation/` — standalone Node evaluation scripts + reference corpora

## Canonical commands (root)
- `pnpm dev` — builds types, then parallel dev servers (`pnpm dev:docker` also starts anystyle)
- `pnpm build` / `pnpm build:api` / `pnpm build:extension` / `pnpm build:landing`
- `pnpm typecheck` / `pnpm lint` / `pnpm test` (Vitest)
- DB migration: `pnpm --filter @source-taster/api db:migrate`
- Pre-commit hook: `build:types && typecheck && lint-staged` (eslint --fix)

## Verification expectations
- Before claiming a change done: run the relevant subset of `pnpm lint && pnpm typecheck && pnpm test`.
- Contracts live in `packages/types`; changing a schema requires rebuilding types before API/web/extension consume it.
- Extension and web are bilingual (de + en locales) — new UI strings need both.

## Dangerous areas (do not touch without explicit authorization)
- `.keystore/` — encrypted user AI keys; never log or expose `MASTER_KEY`, `KEY_DERIVATION_SALT`, or keystore contents
- `.env` files and any API keys — never commit, never log
- Release pipeline `.github/workflows/release.yml` — auto-releases and deploys to production via docker compose; human-authorized only
- Docker Compose observability stack and production CORS allowlist
- `masterarbeit_nawroth_cicek.md` — thesis document, read-only
- `png-exports/` — generated artifacts, not source

## AI operating system
- **CORE**: `docs/ai-os/core/` is the sole runtime-neutral AI-OS authority. The preserved 76-section map and runtime-adapter contract are in `docs/ai-os/ARCHITECTURE.md`.
- **Runtime adapters**: OpenCode mechanics and evidence are canonical in `docs/ai-os/runtimes/opencode/implementation.md`; Copilot limitations are canonical in `docs/ai-os/runtimes/copilot/implementation.md`. Runtime adapters and their derived artifacts implement the CORE without redefining it.

## Project-specific safety constraints
- **Research sources**: approved domains are `openalex.org`, `doi.org`, `crossref.org`, `api.semanticscholar.org`, `europepmc.org`, `ebi.ac.uk`, `arxiv.org`, `github.com`, `mcp.context7.com`, `sourcetaster.com`, and `opencode.ai`. Runtime enforcement status is recorded by the active runtime adapter.
- **Human gates**: commit, push, migrate, docker, install, and release require human approval; release is human-only. The pre-commit hook runs `build:types && typecheck && lint-staged`.

## Canonical sources
- `docs/ai-os/core/` — normative AI-OS principles, operating model, evaluation, and governance.
- This file — Source Taster project/domain policy and terminology.
- `docs/ai-os/runtimes/*/implementation.md` — runtime implementation status and limitations.
- Runtime artifacts — derived implementations, including `.opencode/agent/*.md`, `.opencode/skill/*/SKILL.md`, and `.opencode/command/*.md`.
- `evaluation/ai-system/check-governance.mjs` — static governance checks; `evaluation/ai-system/eval-scenarios.md` — LLM evaluation scenarios.
- `.opencode/memory/` — live state and historical results, never policy; `docs/decisions/` and `docs/audits/` — historical evidence.
