---
title: Overview
outline: deep
---

# Overview

Source Taster helps students and researchers verify bibliographic references quickly. The system packs three main building blocks:

- **Browser extension (`apps/extension`)** – a Vue 3 application with Vuetify that imports references (text, PDF, context menu), performs AI-assisted extraction, and visualises verified matches.
- **API (`apps/api`)** – a Hono server on Node.js 20 that orchestrates AI extraction, AnyStyle parsing, database searches (OpenAlex, Crossref, Semantic Scholar, Europe PMC, arXiv), and deterministic matching.
- **Shared types (`packages/types`)** – Zod schemas and TypeScript definitions for CSL-JSON, API contracts, matching configuration, and UI defaults. Both the extension and API consume them.

A VitePress site (`apps/docs`) provides the documentation you are reading right now; the Markdown content lives in `apps/docs/en` and `apps/docs/de`.

## Goals & Benefits

- **Reliability** – Every incoming payload is validated via Zod (for example `ApiExtractRequestSchema`, `ApiMatchRequestSchema`). Errors are converted to consistent JSON responses by `registerOnError` in Hono.
- **Traceability** – Matching results include per-field scores that surface in the UI, see [Matching & Scoring](matching-scoring.md).
- **Extensibility** – AI providers are abstracted (`ApiAIProviderSchema`, `AIProviderFactory`), and you can add more search providers behind dedicated service classes.
- **Privacy** – User API keys are encrypted with AES-256-GCM and stored in a key-file storage (`apps/api/src/secrets/keystore.ts`).

## Extension Highlights

- Import via context menu (“Check bibliography”), PDF upload, or manual text paste.
- AI extraction with configurable CSL fields taken from shared defaults.
- AnyStyle-powered token labelling and manual correction before converting to CSL.
- Database search with user-defined priorities and optional early termination for high scores.
- Field-level match visualisation with colour-coded scores directly inside the UI.

## API Highlights

- `/api/extract` – AI extraction with `response_format=json_schema` and automatic fallback to `json_object`.
- `/api/search/:database` – provider-specific search with DOI/identifier shortcuts and query heuristics.
- `/api/match` – deterministic matching with normalisation and similarity heuristics.
- `/api/anystyle/*` – proxy to a Ruby AnyStyle server for tokenisation and CSL conversion.
- `/api/user/ai-secrets` – store, inspect, and delete user keys (scoped by `X-Client-Id`).

A full flow from extraction to matching is illustrated in [Architecture](architecture.md).
