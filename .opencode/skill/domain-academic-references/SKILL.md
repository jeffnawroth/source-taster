---
name: domain-academic-references
description: Domain knowledge for academic reference verification — CSL-JSON structure, APA matching semantics, normalization rules, the 5-database search model, and scoring thresholds. Use when working on extraction, search, matching, scoring, or hallucination detection.
---

# Domain: Academic Reference Verification

## Workflow
1. **Import** — paste text, drag-and-drop PDF (client-side parsing via `unpdf`), or extension context menu
2. **Extraction** — parse raw reference text into structured CSL-JSON via AnyStyle (Ruby, deterministic) or an LLM (OpenAI/Anthropic/Google/DeepSeek, OpenAI-compatible)
3. **Search** — query the 5 databases per reference (DOI/identifier shortcut first, then query heuristics; early termination when score ≥95)
4. **Match** — deterministic field-by-field scoring (no AI in scoring)
5. **Verify** — result thresholds: **≥85 success (green), 50–84 warning (amber), <50 suspect/hallucination (red)**

## CSL-JSON (the canonical item format)
- Variables used by matching: `title`, `author`, `issued`, `DOI`, `container-title`, `volume`, `page`, `type`
- Schema lives in `packages/types/src/app/csl.ts` (Zod) — single source of truth

## Matching semantics
- **Normalization order** (10 steps, documented in `apps/docs/matching-scoring.md`): `normalize-typography`, `normalize-umlauts`, `normalize-accents`, `match-author-initials`, `match-structured-dates`, `match-page-range-overlap`, `match-container-title-variants`, etc.
- Scores are weighted per field; `overallScore` 0–100; `fieldDetails` shows per-field match reasons
- Matching modes: `strict`, `balanced` (default), `custom`
- DeterministicEngine in `apps/api/src/services/matching/` — never use an LLM for scoring

## Search model
- Providers: OpenAlex, Crossref, Semantic Scholar, Europe PMC, arXiv (`apps/api/src/services/search/`)
- Identifier lookups: DOI, arXiv ID, PMID, PMCID, ISSN
- Polite pool: Crossref/OpenAlex courtesy `mailto` headers

## Terminology
- **reference** = raw bibliographic entry to verify; **source** = verified published work
- **hallucination** = AI-fabricated citation; catching these is the product's core value
- Never call an API "endpoint" without the `/v1/` prefix in this codebase

## Privacy model
- BYOK: users supply their own AI provider keys → encrypted AES-256-GCM, stored in keystore files (never plaintext, never logged)
- Stateless extension; no telemetry; API keys only for B2B clients (`X-API-Key: srt_live_…`)

## Evaluation corpus
- `evaluation/references/*.txt` — APA/MLA/Chicago reference sets; `raw-references.fake-apa.txt` for hallucination tests
- Product claims (from thesis): 93% APA exact match, 100% hallucination detection, <3 s per reference
