<p align="center">
  <img src="apps/landing/public/favicon.svg" width="64" alt="The Source Taster" />
</p>

<h1 align="center">The Source Taster</h1>

<p align="center">
  <b>Browser extension + web app + API for automated academic reference verification.</b><br>
  Extract references, search 5 databases, and detect AI-hallucinated sources — 93% APA match rate, 100% hallucination detection, <3 seconds per reference.
</p>

<p align="center">
  <a href="https://chromewebstore.google.com/detail/the-source-taster/leggmjghcbdfilhfkgnllhnhhbalpanp">Chrome Web Store</a> ·
  <a href="https://github.com/jeffnawroth/source-taster/releases">Firefox Add-on</a> ·
  <a href="https://sourcetaster.com">Landing Page</a> ·
  <a href="https://sourcetaster.github.io/source-taster/">Documentation</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/license-MIT-blue" alt="MIT" />
  <img src="https://img.shields.io/badge/chrome-≥114-brightgreen" alt="Chrome" />
  <img src="https://img.shields.io/badge/firefox-≥121-orange" alt="Firefox" />
  <img src="https://img.shields.io/badge/node-≥20-339933" alt="Node" />
</p>

---

> **AI hallucinates fake references.** ChatGPT and other LLMs generate up to 40% fabricated citations. The Source Taster catches them — verified in a Master's thesis with **93% APA exact match rate** and **100% hallucination detection**.

## Features

- **🤖 AI-Powered Extraction** — Parse references from text or PDFs into structured CSL-JSON using AnyStyle or your preferred LLM (OpenAI, Anthropic, Google, DeepSeek). Supports batch extraction of entire bibliographies.
- **🌐 5-Database Search** — Simultaneously query OpenAlex, Crossref, Semantic Scholar, Europe PMC, and arXiv with smart early termination.
- **📊 Transparent Scoring** — Weighted field-by-field comparison using Levenshtein-Damerau distance. See exactly which fields matched and why.
- **📄 PDF Import** — Drag-and-drop PDFs. Full text is parsed and all embedded references are extracted automatically.
- **⚡ Batch Verification** — Check entire reference lists at once. Average <3 seconds per source.
- **🔐 Privacy-First** — Stateless extension. API keys encrypted with AES-256-GCM. No telemetry.

## Quick Install

| Browser                       | Link                                                                                                            |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Online (ohne Installation)    | [Web App](https://sourcetaster.com/app) — Paste & Verify im Browser                                             |
| Chrome / Edge / Brave / Opera | [Chrome Web Store](https://chromewebstore.google.com/detail/the-source-taster/leggmjghcbdfilhfkgnllhnhhbalpanp) |
| Firefox                       | [GitHub Releases](https://github.com/jeffnawroth/source-taster/releases) (XPI)                                  |

No API key required for basic DOI-based verification. LLM features need a key from OpenAI, Anthropic, Google, or DeepSeek.

## Quick Start (Development)

```bash
# Install pnpm (if not installed)
corepack enable pnpm

# Clone & install
git clone https://github.com/jeffnawroth/source-taster.git
cd source-taster
pnpm install

# Build shared types
pnpm --filter @source-taster/types build

# Start everything in parallel
pnpm dev
```

See the [development docs](apps/docs/development.md) for detailed setup, including API configuration and browser extension loading.

## Architecture

```
Browser Extension (Vue 3 + Vuetify)
  ↕ HTTP / JSON
API (Hono on Node.js 20)
  ↕ Fetch
OpenAlex · Crossref · Semantic Scholar · Europe PMC · arXiv
AnyStyle Server · AI Providers (OpenAI / Anthropic / Google / DeepSeek)
```

Shared Zod schemas in `packages/types` guarantee runtime parity between frontend and backend.

## Project Structure

```
apps/
  extension/    Vue 3 browser extension (Chrome + Firefox)
  api/          Hono API server
  docs/         VitePress documentation site
  landing/      Astro marketing site
packages/
  types/        Shared Zod schemas & TypeScript types
```

## API Overview

| Method            | Path                           | Description                                                    |
| ----------------- | ------------------------------ | -------------------------------------------------------------- |
| `POST`            | `/v1/extract`                  | AI extraction with Zod-validated output                        |
| `POST`            | `/v1/search/:database`         | Search OpenAlex, Crossref, Semantic Scholar, Europe PMC, arXiv |
| `POST`            | `/v1/match`                    | Deterministic scoring against candidates                       |
| `POST`            | `/v1/anystyle/parse`           | Tokenize references via AnyStyle                               |
| `POST`            | `/v1/anystyle/convert-to-csl`  | Convert tokens to CSL-JSON                                     |
| `POST/GET/DELETE` | `/v1/user/ai-secrets`          | Manage encrypted user API keys                                 |

Full reference: [API docs](apps/docs/api.md)

## Validation & Quality

- **97.2% F1-score** on APA references (Master's thesis evaluation, n=425 survey, curated test sets)
- **100%** synthetic hallucination detection rate
- ESLint (Antfu config) + simple-git-hooks + lint-staged
- TypeScript strict mode across all packages
- Zod runtime validation on all API contracts

## Documentation

| Topic                     | Link                                                                         |
| ------------------------- | ---------------------------------------------------------------------------- |
| Overview & goals          | [EN](apps/docs/intro.md) · [DE](apps/docs/de/intro.md)                       |
| Architecture              | [EN](apps/docs/architecture.md)                                              |
| Development setup         | [EN](apps/docs/development.md) · [DE](apps/docs/de/development.md)           |
| API reference             | [EN](apps/docs/api.md) · [DE](apps/docs/de/api.md)                           |
| Extension build & release | [EN](apps/docs/extension.md) · [DE](apps/docs/de/extension.md)               |
| Data models & schemas     | [EN](apps/docs/data-models.md) · [DE](apps/docs/de/data-models.md)           |
| Matching & scoring        | [EN](apps/docs/matching-scoring.md) · [DE](apps/docs/de/matching-scoring.md) |
| Changelog                 | [EN](apps/docs/changelog.md) · [DE](apps/docs/de/changelog.md)               |

## License

[MIT](LICENSE) © Jeff Nawroth

---

<p align="center">
  <sub>Built as a Master's thesis at the University of Siegen · Nawroth & Cicek (2025)</sub>
</p>
