# The Source Taster – External Presentation Design

**Date:** 2025-07-25
**Status:** Draft
**Author:** Jeff Nawroth

## 1. Brand Message Architecture

### 1.1 Elevator Pitch (1 Satz, alle Kanäle)

The Source Taster is a browser extension that automatically extracts academic
references, searches 5 databases, and detects AI-hallucinated sources — with
100% hallucination detection in under 3 seconds per reference.

### 1.2 Core Value Proposition (3 Sätze)

1. **Problem** — AI tools like ChatGPT fabricate up to 40% of their references.
   These hallucinated sources look real but don't exist.
2. **Solution** — The Source Taster extracts references from text or PDFs,
   cross-references them against 5 academic databases simultaneously, and shows
   you exactly which sources are real and which aren't.
3. **Proof** — Validated in a controlled Master's thesis study with 425
   references: 93% APA exact match rate, 100% hallucination detection.

### 1.3 Three Messaging Pillars

| Pillar                         | Landing                        | Docs                               | Store                            | GitHub                     |
| ------------------------------ | ------------------------------ | ---------------------------------- | -------------------------------- | -------------------------- |
| 🔬 Scientifically validated    | Hero stats, Evaluation section | Matching/Scoring page, Data Models | "Validated in a Master's thesis" | README badges, thesis link |
| ⚡ Fast & automated            | How it works, Features         | Development setup, API Overview    | "<3 seconds per reference"       | Quick Start                |
| 🔒 Open source & privacy-first | Pricing (Free forever), FAQ    | Self-hosting docs, Architecture    | No vendor lock-in                | MIT License, security info |

### 1.4 Target Audiences per Channel

| Channel          | Primary Audience                                                  | Tone                             |
| ---------------- | ----------------------------------------------------------------- | -------------------------------- |
| Landing Page     | Students, PhD candidates, researchers, university decision-makers | Problem-oriented, activating     |
| Docs             | Developers, self-hosters, technical evaluators                    | Precise, academically-technical  |
| Chrome Web Store | Browser users on shopping journeys                                | Benefit-driven, metric-heavy     |
| Firefox Add-on   | Privacy-conscious users                                           | Privacy-focused, OSS-emphasized  |
| GitHub           | Developers, contributors                                          | Technical, open-source community |

### 1.5 Brand Voice Guidelines

- **Tone:** Confident but not arrogant. Backed by data, not hype.
- **Language:** Active voice. Prefer verbs over nouns ("extract references" not
  "reference extraction").
- **Metrics:** Always cite specific numbers (93%, 100%, <3s). Never say "high
  accuracy" without quantification.
- **Open Source:** Mention early. It's a trust signal, not a secondary feature.
- **Academic audience:** Respect their intelligence. Don't oversimplify. Do
  provide transparent methodology.

## 2. Channel Content Matrix

### 2.1 Text Inventory (Current State)

| Text / Content         | Landing  | Docs           | Chrome Store    | Firefox Store | GitHub         |
| ---------------------- | -------- | -------------- | --------------- | ------------- | -------------- |
| Hero headline          | ✅       | ✅ (different) | ❌              | ❌            | ✅ (README)    |
| Feature descriptions   | ✅       | ✅ (different) | ❌              | ❌            | ✅ (different) |
| How it works           | ✅       | ❌             | ❌              | ❌            | ❌             |
| Evaluation metrics     | ✅       | ✅ (scattered) | ❌              | ❌            | ✅ (README)    |
| Install instructions   | ✅       | ✅             | ✅ (1 sentence) | ❌            | ✅             |
| Screenshots            | ❌       | ❌             | ❌              | ❌            | ❌             |
| Full store description | ❌       | ❌             | ❌              | ❌            | ❌             |
| Privacy notes          | ✅ (FAQ) | ❌             | ❌              | ❌            | ❌             |
| Pricing                | ✅       | ❌             | ❌              | ❌            | ❌             |

### 2.2 Text Assignment per Channel

**Landing Page (sourcetaster.app)**

- Hero, Problem, Features, How It Works, Evaluation, Tech Details,
  Social Proof, Pricing, FAQ, Install, Footer
- Source: `apps/landing/src/data/en.ts` + `de.ts` (centralized per language)

**VitePress Docs (sourcetaster.github.io/source-taster/)**

- Hero (different audience), Intro, Architecture, API, Data Models,
  Matching/Scoring, Extension Build, Development, Changelog
- Source: `apps/docs/*.md` + `de/*.md`
- Primary audience: users who already decided to use the tool

**Chrome Web Store**

- Name (132 chars), Short Description (80 chars), Full Description (4000 chars)
- 5 × 1280×800 screenshots, 1 × 440×280 promotional tile
- Source: `store-description.md` (to be created), `manifest.json` (name + short desc)

**Firefox Add-on**

- Name, Description, Privacy Policy URL, Screenshots
- Source: analogous to Chrome

**GitHub README**

- Short tagline, feature bullets, quick start, architecture, API overview,
  validation metrics, documentation links, license
- Source: `README.md` (already exists, needs consolidation with Content Kit)

### 2.3 Language Strategy

| Channel          | Language(s)                                         |
| ---------------- | --------------------------------------------------- |
| Landing Page     | DE (default) + EN (/en/)                            |
| Docs             | DE + EN (parallel)                                  |
| Chrome Web Store | EN (primary), DE (optional via Google Play Console) |
| Firefox Add-on   | EN (primary)                                        |
| GitHub README    | EN                                                  |

## 3. Content Templates

### 3.1 Chrome Web Store

**Name (132 chars max):**
The Source Taster – Detect AI-Hallucinated Academic References

**Short Description (80 chars max):**
Automated academic reference verification. 100% hallucination detection.

**Full Description Structure (~2000 chars):**

```
📋 WHAT IS THE SOURCE TASTER?

AI tools like ChatGPT fabricate up to 40% of their academic references.
These hallucinated sources look real but don't exist in any database.
The Source Taster is a browser extension that automatically extracts
references, searches 5 academic databases, and shows you exactly which
sources are real — in under 3 seconds per reference.

🔧 KEY FEATURES

• AI-Powered Extraction — Parse references from text or PDFs using
  AnyStyle or your preferred LLM (OpenAI, Anthropic, Google, DeepSeek).
• 5-Database Search — Simultaneously query OpenAlex, Crossref, Semantic
  Scholar, Europe PMC, and arXiv with smart early termination.
• Transparent Scoring — Weighted field-by-field comparison. See exactly
  which fields matched and why.
• PDF Import — Drag-and-drop PDFs. Full text is parsed, all embedded
  references extracted automatically.
• Batch Verification — Check entire reference lists at once.
• Privacy-First — Stateless extension. API keys encrypted with
  AES-256-GCM. No telemetry.

📊 VALIDATED RESULTS

Validated in a controlled Master's thesis study at the University of Siegen:
• 93% APA exact match rate — average score of 99.11% across genuine references
• 100% hallucination detection — every fake source correctly identified
• <3 seconds per reference — full pipeline: extraction, search, scoring

🔒 OPEN SOURCE & PRIVACY

• MIT License — free forever, self-hostable
• Stateless — no reference data stored locally
• Encrypted API keys — AES-256-GCM, never exposed to your browser
• No telemetry, no analytics, no tracking

🌐 SUPPORTED DATA SOURCES

• OpenAlex • Crossref • Semantic Scholar • Europe PMC • arXiv

Note: Basic DOI-based verification works without any API key.
AI-powered extraction requires a key from OpenAI, Anthropic, Google,
or DeepSeek.
```

**Screenshots (5 × 1280×800):**

1. Side panel — empty state with paste/upload prompt
2. Reference extraction — paste text, showing parsed result
3. Search results — match with score breakdown per field
4. Batch verification — multiple references with status indicators
5. PDF import — drag-and-drop PDF with extracted references list

**Promotional Tile (440×280):**
Logo + "93% match rate · 100% hallucination detection"

### 3.2 Firefox Add-on

Same structure as Chrome, with these adaptations:

- **Privacy emphasis:** "No vendor lock-in — fully self-hostable under MIT license"
- **Firefox-specific:** Mention side panel support / Firefox compatibility
- **No browser-specific features** that only work in Chrome

### 3.3 Landing Page — Copy Optimization

**Hero (current ⇒ proposed):**

- EN: "Verify academic references – detect AI hallucinations"
  ⇒ "The browser extension that catches AI-hallucinated references"
- DE: "Referenzen automatisch verifizieren – KI-Halluzinationen erkennen"
  ⇒ "Browserextension für automatische Quellenprüfung – erkennt KI-Halluzinationen"

**Stats placement:** Move "93% · 100% · <3s · 5+ DBs" directly below the hero
headline (currently they're in a separate stats row slightly lower).

**Feature naming (make consistent with Docs and Store):**

- Landing "Extract references from anywhere" → Docs: same name
- Landing "Search across 5 academic databases" → Docs: same name
- Landing "See exactly how each match scores" → Docs: same
- Landing "Import & analyze PDFs" → Docs: same
- Landing "Batch-verify multiple references" → Docs: same
- Landing "Your API keys stay encrypted" → Docs: same

### 3.4 Docs — Structural Optimization

**Hero rewrite (EN):**

- Current: "Automated academic reference verification"
- Proposed: "The Source Taster — Technical Documentation"
- Subtitle: "Setting up, configuring, self-hosting, and extending the
  open-source academic reference verification platform."

**Navigation restructure:**

```
Getting Started
  ├── Installation (Extension)
  ├── API Configuration
  └── Quick Start Guide

Self-Hosting
  ├── Docker Setup
  ├── Configuration
  └── Maintenance

Development
  ├── Architecture
  ├── Project Structure
  ├── Building & Testing
  └── Contributing

Reference
  ├── API Endpoints
  ├── Data Models & Schemas
  ├── Matching & Scoring Algorithm
  └── Extension Build & Release
```

**Add to Docs (identified gaps):**

- "For Students" page ✅ (exists at `students.md`)
- "For Reviewers" page ✅ (exists at `reviewers.md`)
- Privacy/Security section (currently only in Landing FAQ)
- Self-hosting guide (needs expansion from current `development.md`)

## 4. Terminology Glossary

| Term            | Use consistently                                        | Do not use                              |
| --------------- | ------------------------------------------------------- | --------------------------------------- |
| Product name    | The Source Taster                                       | SourceTaster, source-taster, TST        |
| Extension       | Browser extension                                       | Add-on, plugin (except Firefox context) |
| Core value      | Hallucination detection                                 | Fake detection, citation checking       |
| Metric          | 93% APA exact match rate                                | 93% accuracy (ambiguous)                |
| Action sequence | Extract → Search → Match → Classify                     | Inconsistent step names                 |
| Databases       | OpenAlex, Crossref, Semantic Scholar, Europe PMC, arXiv | "academic databases" (too vague)        |
| License         | MIT License, free and open source                       | free software, FOSS (inconsistent)      |
| User key        | API key                                                 | Token, secret key                       |
| Verification    | Reference verification                                  | Source checking, citation validation    |
| AI extraction   | AI-powered extraction                                   | LLM extraction, smart parsing           |

## 5. Content Source of Truth

All canonical copy text lives in one place:

| Asset                          | Location                                                            |
| ------------------------------ | ------------------------------------------------------------------- |
| Brand Message Architecture     | `docs/superpowers/specs/2025-07-25-external-presentation-design.md` |
| Store descriptions             | `apps/store-descriptions/chrome.md` + `firefox.md`                  |
| Landing page data (EN)         | `apps/landing/src/data/en.ts`                                       |
| Landing page data (DE)         | `apps/landing/src/data/de.ts`                                       |
| Docs content                   | `apps/docs/*.md` + `de/*.md`                                        |
| README                         | `README.md`                                                         |
| Extension manifest description | `apps/extension/extension/manifest.json`                            |

To update copy, always start with the Brand Message Architecture, then
propagate changes to each channel's source file.

## 6. Open Questions / Future Work

- [ ] Create actual screenshots for Chrome Web Store (5 × 1280×800)
- [ ] Create promotional tile (440×280)
- [ ] Firefox Add-on store submission (currently GitHub Releases only)
- [ ] Blog posts / launch content (Phase 3 per roadmap)
- [ ] Social media templates (Phase 2 per roadmap)
- [ ] CONTRIBUTING.md for GitHub
- [ ] Privacy policy page for Firefox Add-on requirement
