---
title: Overview
outline: deep
---

# Overview

**AI hallucinates fake references.** ChatGPT and other LLMs generate up to 40% fabricated citations. The Source Taster catches them — validated in a Master's thesis at the University of Siegen.

The system helps students and researchers verify bibliographic references in seconds. It extracts references from text or PDFs, searches them across 5 academic databases, and scores each match transparently — field by field.

## Key Metrics

- **93%** APA exact match rate
- **100%** hallucination detection on synthetic fakes
- **&lt;3 seconds** average verification time per reference
- **97.2%** F1-score on curated test sets (n=425 survey + automated benchmarks)

## How It Works

1. **Import** — Paste text, upload a PDF, or right-click a bibliography on any page.
2. **Extract** — AI parses unstructured references into structured CSL-JSON (title, authors, DOI, year, etc.).
3. **Search** — Each reference is queried against OpenAlex, Crossref, Semantic Scholar, Europe PMC, and arXiv.
4. **Match** — Deterministic scoring compares extracted data with database candidates. Results show a colour-coded per-field breakdown.
5. **Verify** — Green means verified. Red means suspect. You know instantly which sources are trustworthy.

## Architecture

The system consists of three main building blocks:

- **Browser extension (`apps/extension`)** — Vue 3 application with Vuetify that imports references (text, PDF, context menu), performs AI-assisted extraction, and visualises verified matches.
- **API (`apps/api`)** — Hono server on Node.js 20 that orchestrates AI extraction, AnyStyle parsing, database searches, and deterministic matching.
- **Shared types (`packages/types`)** — Zod schemas and TypeScript definitions for CSL-JSON, API contracts, matching configuration, and UI defaults. Both the extension and API consume them.

## Extension Highlights

- Import via context menu ("Check bibliography"), PDF upload, or manual text paste.
- AI extraction with configurable CSL fields taken from shared defaults.
- AnyStyle-powered token labelling and manual correction before converting to CSL.
- Database search with user-defined priorities and optional early termination for high scores.
- Field-level match visualisation with colour-coded scores directly inside the UI.

## API Highlights

- `/v1/extract` — AI extraction with `response_format=json_schema` and automatic fallback to `json_object`.
- `/v1/search/:database` — provider-specific search with DOI/identifier shortcuts and query heuristics.
- `/v1/match` — deterministic matching with normalisation and similarity heuristics.
- `/v1/anystyle/*` — proxy to a Ruby AnyStyle server for tokenisation and CSL conversion.
- `/v1/user/ai-secrets` — store, inspect, and delete user keys (scoped by `X-Client-Id`).

A full flow from extraction to matching is illustrated in [Architecture](architecture.md).
