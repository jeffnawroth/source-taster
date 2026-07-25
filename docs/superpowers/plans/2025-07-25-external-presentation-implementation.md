# External Presentation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the approved Content Kit across all external channels — Landing Page, Docs, Chrome Web Store, Firefox Add-on, GitHub README — for consistent brand messaging.

**Architecture:** Store descriptions live as standalone markdown files in `apps/store-descriptions/`. Landing Page copy is centralized in `apps/landing/src/data/en.ts` + `de.ts`. Docs meta lives in VitePress config. Extension manifest holds the Chrome Web Store short description.

**Tech Stack:** TypeScript, Astro, VitePress, JSON (manifest)

## Global Constraints

- Product name always capitalized: "The Source Taster" (never "SourceTaster", "source-taster", "TST")
- Metrics always specified: "93% APA exact match rate" (never "93% accuracy")
- Action sequence: "Extract → Search → Match → Classify" (consistent across all channels)
- Databases listed as: OpenAlex, Crossref, Semantic Scholar, Europe PMC, arXiv
- Feature names must be identical across Landing, Docs, and Store
- Extension description in manifest.json max ~132 chars
- All markdown columns must have heading in German docs tables

---

### Task 1: Create Store Description Files

**Files:**
- Create: `apps/store-descriptions/chrome.md`
- Create: `apps/store-descriptions/firefox.md`

**Interfaces:**
- Consumes: spec section 3.1 and 3.2
- Produces: canonical store copy for Chrome Web Store and Firefox Add-on

- [ ] **Step 1: Write Chrome Web Store description**

```markdown
# The Source Taster — Chrome Web Store Listing

## Name (132 chars max)
The Source Taster – Detect AI-Hallucinated Academic References

## Short Description (80 chars max)
Automated academic reference verification. 100% hallucination detection.

## Full Description

📋 WHAT IS THE SOURCE TASTER?

AI tools like ChatGPT fabricate up to 40% of their academic references. These hallucinated sources look real but don't exist in any database. The Source Taster is a browser extension that automatically extracts references, searches 5 academic databases, and shows you exactly which sources are real — in under 3 seconds per reference.

🔧 KEY FEATURES

• AI-Powered Extraction — Parse references from text or PDFs using AnyStyle or your preferred LLM (OpenAI, Anthropic, Google, DeepSeek).
• 5-Database Search — Simultaneously query OpenAlex, Crossref, Semantic Scholar, Europe PMC, and arXiv with smart early termination.
• Transparent Scoring — Weighted field-by-field comparison. See exactly which fields matched and why.
• PDF Import — Drag-and-drop PDFs. Full text is parsed, all embedded references extracted automatically.
• Batch Verification — Check entire reference lists at once.
• Privacy-First — Stateless extension. API keys encrypted with AES-256-GCM. No telemetry.

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

Note: Basic DOI-based verification works without any API key. AI-powered extraction requires a key from OpenAI, Anthropic, Google, or DeepSeek.
```

- [ ] **Step 2: Write Firefox Add-on description**

```markdown
# The Source Taster — Firefox Add-on Listing

## Name (132 chars max)
The Source Taster – Detect AI-Hallucinated Academic References

## Short Description (80 chars max)
Automated academic reference verification. 100% hallucination detection.

## Full Description

📋 WHAT IS THE SOURCE TASTER?

AI tools like ChatGPT fabricate up to 40% of their academic references. These hallucinated sources look real but don't exist in any database. The Source Taster is a browser extension that automatically extracts references, searches 5 academic databases, and shows you exactly which sources are real — in under 3 seconds per reference.

Unlike proprietary tools, The Source Taster is fully open source (MIT) and self-hostable — no vendor lock-in, no data leaves your control.

🔧 KEY FEATURES

• AI-Powered Extraction — Parse references from text or PDFs using AnyStyle or your preferred LLM (OpenAI, Anthropic, Google, DeepSeek).
• 5-Database Search — Simultaneously query OpenAlex, Crossref, Semantic Scholar, Europe PMC, and arXiv with smart early termination.
• Transparent Scoring — Weighted field-by-field comparison. See exactly which fields matched and why.
• PDF Import — Drag-and-drop PDFs. Full text is parsed, all embedded references extracted automatically.
• Batch Verification — Check entire reference lists at once.
• Privacy-First — Stateless extension. API keys encrypted with AES-256-GCM. No telemetry.

📊 VALIDATED RESULTS

Validated in a controlled Master's thesis study at the University of Siegen:
• 93% APA exact match rate — average score of 99.11% across genuine references
• 100% hallucination detection — every fake source correctly identified
• <3 seconds per reference — full pipeline: extraction, search, scoring

🔒 OPEN SOURCE & PRIVACY

• MIT License — free forever, self-hostable
• No vendor lock-in — run your own API server
• Stateless — no reference data stored locally
• Encrypted API keys — AES-256-GCM, never exposed to your browser
• No telemetry, no analytics, no tracking

🌐 SUPPORTED DATA SOURCES

• OpenAlex • Crossref • Semantic Scholar • Europe PMC • arXiv

Note: Basic DOI-based verification works without any API key. AI-powered extraction requires a key from OpenAI, Anthropic, Google, or DeepSeek.
```

- [ ] **Step 3: Verify**

Run: `ls apps/store-descriptions/`
Expected: `chrome.md` and `firefox.md` exist

- [ ] **Step 4: Commit**

```bash
git add apps/store-descriptions/
git commit -m "feat: add Chrome Web Store and Firefox Add-on description copy"
```

---

### Task 2: Update Extension Manifest Description

**Files:**
- Modify: `apps/extension/extension/manifest.json:5`

**Interfaces:**
- Consumes: spec section 3.1 short description
- Produces: aligned Chrome Web Store listing metadata

This updates the `description` field in manifest.json to match the new short description exactly.

- [ ] **Step 1: Edit manifest.json description**

In `apps/extension/extension/manifest.json`, line 5:
```
- "description": "Browser extension for automated academic reference verification. Extract, search 5 databases, and detect AI-hallucinated sources — 93% APA match rate, 100% hallucination detection.",
+ "description": "Automated academic reference verification. Extract, search 5 databases, detect AI-hallucinated sources — 93% APA match rate, 100% hallucination detection.",
```

- [ ] **Step 2: Verify**

Run: `rg '"description"' apps/extension/extension/manifest.json`
Expected: new shorter description

- [ ] **Step 3: Commit**

```bash
git add apps/extension/extension/manifest.json
git commit -m "chore: align extension manifest description with content kit"
```

---

### Task 3: Update Landing Page EN Copy

**Files:**
- Modify: `apps/landing/src/data/en.ts`

**Interfaces:**
- Consumes: spec sections 3.3 (hero optimization) and 4 (terminology)
- Produces: consistent English copy on sourcetaster.app/en/

Changes:
1. Hero title: more action-oriented
2. Feature names: make consistent with spec terminology
3. Terminology audit: replace any non-glossary terms

- [ ] **Step 1: Update English hero copy**

In `apps/landing/src/data/en.ts`, lines 17-18:
```
- title: 'Verify academic references – detect AI hallucinations',
- sub: 'Extract, search, and validate academic references in seconds. The browser extension that reliably distinguishes real sources from AI-fabricated ones.',
+ title: 'The browser extension that catches AI-hallucinated references',
+ sub: 'Extract, search, and validate academic references in seconds. The Source Taster reliably distinguishes real sources from AI-fabricated ones — 93% APA match rate, 100% hallucination detection.',
```

- [ ] **Step 2: Update English feature names for consistency**

In `apps/landing/src/data/en.ts`, lines 43-48:
```
- { icon: '🤖', title: 'Extract references from anywhere', ... },
- { icon: '🌐', title: 'Search across 5 academic databases', ... },
- { icon: '📊', title: 'See exactly how each match scores', ... },
- { icon: '📄', title: 'Import & analyze PDFs', ... },
- { icon: '⚡', title: 'Batch-verify multiple references', ... },
- { icon: '🔐', title: 'Your API keys stay encrypted', ... },
+ { icon: '🤖', title: 'AI-Powered Extraction', desc: 'Parse references from text or PDFs into structured CSL-JSON using AnyStyle or your preferred LLM — including OpenAI, Anthropic, Google, and DeepSeek. Supports batch extraction of entire bibliographies.', color: '#4e2e92' },
+ { icon: '🌐', title: '5-Database Search', desc: 'Simultaneously query OpenAlex, Crossref, Semantic Scholar, Europe PMC, and arXiv. Smart early termination finds high-confidence matches faster.', color: '#1f6b7c' },
+ { icon: '📊', title: 'Transparent Scoring', desc: 'Weighted field-by-field comparison with Levenshtein-Damerau distance. Every decision is transparent — you see which fields matched and by how much.', color: '#c9952e' },
+ { icon: '📄', title: 'PDF Import', desc: 'Drag-and-drop PDF files directly into the extension. Full text is parsed and all embedded references are extracted automatically.', color: '#6b4db8' },
+ { icon: '⚡', title: 'Batch Verification', desc: 'Check entire reference lists at once. Average processing time is under 3 seconds per source — including extraction, search, and scoring.', color: '#45a3b5' },
+ { icon: '🔐', title: 'Privacy-First', desc: 'Stateless extension with AES-256-GCM encrypted API keys stored in the backend. No telemetry, no analytics. Your data stays yours.', color: '#2d7a31' },
```

- [ ] **Step 3: Verify**

Run: `pnpm --filter @source-taster/landing build`
Expected: Build succeeds, no TypeScript errors

- [ ] **Step 4: Commit**

```bash
git add apps/landing/src/data/en.ts
git commit -m "feat: update landing page EN copy to match content kit"
```

---

### Task 4: Update Landing Page DE Copy

**Files:**
- Modify: `apps/landing/src/data/de.ts`

**Interfaces:**
- Consumes: Task 3 patterns, spec section 3.3 German hero
- Produces: consistent German copy on sourcetaster.app/

Mirrors Task 3 for German. Feature names become German equivalents, hero follows same structure.

- [ ] **Step 1: Update German hero copy**

In `apps/landing/src/data/de.ts`, lines 17-18:
```
- title: 'Referenzen automatisch verifizieren – KI-Halluzinationen erkennen',
- sub: 'Extrahiere, durchsuche und verifiziere akademische Quellen in Sekunden. Die Browser-Erweiterung, die zuverlässig echte von KI-erfundenen Referenzen unterscheidet.',
+ title: 'Browser-Erweiterung erkennt KI-halluzinierte Referenzen',
+ sub: 'Extrahiere, durchsuche und verifiziere akademische Quellen in Sekunden. The Source Taster unterscheidet zuverlässig echte von KI-erfundenen Referenzen — 93 % APA-Trefferquote, 100 % Halluzinationserkennung.',
```

- [ ] **Step 2: Update German feature names for consistency**

In `apps/landing/src/data/de.ts`, lines 43-48:
```
- { icon: '🤖', title: 'Referenzen aus Text & PDF extrahieren', ... },
- { icon: '🌐', title: '5 akademische Datenbanken durchsuchen', ... },
- { icon: '📊', title: 'Nachvollziehbares Scoring', ... },
- { icon: '📄', title: 'PDFs importieren & analysieren', ... },
- { icon: '⚡', title: 'Batch-Prüfung mehrerer Referenzen', ... },
- { icon: '🔐', title: 'Verschlüsselte API-Keys', ... },
+ { icon: '🤖', title: 'KI-gestützte Extraktion', desc: 'Extrahiere Referenzen aus Text oder PDF in strukturiertes CSL-JSON mit AnyStyle oder deinem bevorzugten LLM — OpenAI, Anthropic, Google, DeepSeek. Ganze Literaturverzeichnisse mit einem Klick.', color: '#4e2e92' },
+ { icon: '🌐', title: '5-Datenbanken-Suche', desc: 'Durchsuche OpenAlex, Crossref, Semantic Scholar, Europe PMC und arXiv gleichzeitig. Intelligente Früherkennung findet hochkonfidente Treffer schneller.', color: '#1f6b7c' },
+ { icon: '📊', title: 'Transparentes Scoring', desc: 'Gewichteter Feldvergleich mit Levenshtein-Damerau-Distanz. Jede Entscheidung ist transparent — du siehst genau, welche Felder wie gut übereinstimmen.', color: '#c9952e' },
+ { icon: '📄', title: 'PDF-Import', desc: 'Ziehe PDF-Dokumente direkt in die Extension. Der Volltext wird geparst und alle enthaltenen Referenzen automatisch extrahiert.', color: '#6b4db8' },
+ { icon: '⚡', title: 'Batch-Verifikation', desc: 'Prüfe ganze Literaturlisten auf einmal. Die durchschnittliche Verarbeitungszeit liegt unter 3 Sekunden pro Quelle — inklusive Extraktion, Suche und Scoring.', color: '#45a3b5' },
+ { icon: '🔐', title: 'Datenschutz first', desc: 'Zustandslose Extension mit AES-256-GCM-verschlüsselten API-Keys im Backend. Kein Telemetrie, kein Tracking. Deine Daten gehören dir.', color: '#2d7a31' },
```

- [ ] **Step 3: Verify**

Run: `pnpm --filter @source-taster/landing build`
Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
git add apps/landing/src/data/de.ts
git commit -m "feat: update landing page DE copy to match content kit"
```

---

### Task 5: Update Docs Description

**Files:**
- Modify: `apps/docs/.vitepress/config.mts`

**Interfaces:**
- Consumes: spec section 3.4 (Docs optimization)
- Produces: aligned metadata on sourcetaster.github.io/source-taster/

Updates the VitePress site description to match the content kit's terminology and adds the metrics prominently.

- [ ] **Step 1: Update Docs description (EN)**

In `apps/docs/.vitepress/config.mts`, line 68:
```
- description: 'Browser extension and API for automated academic reference verification. Extract, search, and validate sources across 5 databases. 93% APA match rate, 100% hallucination detection.',
+ description: 'Technical documentation for The Source Taster — open-source browser extension and API for automated academic reference verification. 93% APA match rate, 100% hallucination detection.',
```

- [ ] **Step 2: Update Docs description (DE, root locale)**

Line 92:
```
- description: 'Browser extension and API for automated academic reference verification. Extract, search, and validate sources across 5 databases. 93% APA match rate, 100% hallucination detection.',
+ description: 'Technical documentation for The Source Taster — open-source browser extension and API for automated academic reference verification. 93% APA match rate, 100% hallucination detection.',
```

- [ ] **Step 3: Update Docs description (DE locale)**

Line 108:
```
- description: 'Browser-Erweiterung und API zur automatisierten Prüfung akademischer Referenzen. Extrahiere, suche und validiere Quellen in 5 Datenbanken. 93 % APA-Trefferquote, 100 % Halluzinationserkennung.',
+ description: 'Technische Dokumentation für The Source Taster — quelloffene Browser-Erweiterung und API zur automatisierten Prüfung akademischer Referenzen. 93 % APA-Trefferquote, 100 % Halluzinationserkennung.',
```

- [ ] **Step 4: Verify**

Run: `pnpm --filter @source-taster/docs build`
Expected: Build succeeds

- [ ] **Step 5: Commit**

```bash
git add apps/docs/.vitepress/config.mts
git commit -m "docs: align VitePress description with content kit"
```

---

### Task 6: Align README with Content Kit

**Files:**
- Modify: `README.md`

**Interfaces:**
- Consumes: spec sections 1.1 (elevator pitch), 1.2 (CVP), 4 (terminology)
- Produces: consistent GitHub project overview

The README is already close. Key changes:
- Feature names to match spec (line 33-38)
- Hero description to match spec elevator pitch (line 8-9)
- Terminology audit

- [ ] **Step 1: Update README tagline**

In `README.md`, line 8:
```
- <b>Browser extension + API for automated academic reference verification.</b><br>Extract references, search 5 databases, and detect AI-hallucinated sources — in under 3 seconds per reference.
+ <b>Browser extension + API for automated academic reference verification.</b><br>Extract references, search 5 databases, and detect AI-hallucinated sources — 93% APA match rate, 100% hallucination detection, <3 seconds per reference.
```

- [ ] **Step 2: Update README feature names (lines 33-38)**

```
- - **🤖 AI-Powered Extraction** — Parse references from text or PDFs into structured CSL-JSON using AnyStyle or your preferred LLM (OpenAI, Anthropic, Google, DeepSeek).
- - **🌐 5-Database Lookup** — Simultaneously search OpenAlex, Crossref, Semantic Scholar, Europe PMC, and arXiv with smart early termination.
- - **📊 Transparent Scoring** — Weighted field-by-field comparison using Levenshtein-Damerau distance. See exactly why a reference matched or didn't.
- - **📄 PDF Import** — Drag-and-drop PDFs. The full text is parsed and all embedded references are automatically extracted.
- - **⚡ Batch Verification** — Check entire reference lists at once. Average <3 seconds per source.
- - **🔐 Privacy-First** — Stateless extension. API keys encrypted with AES-256-GCM. No telemetry.
+ - **🤖 AI-Powered Extraction** — Parse references from text or PDFs into structured CSL-JSON using AnyStyle or your preferred LLM (OpenAI, Anthropic, Google, DeepSeek). Supports batch extraction of entire bibliographies.
+ - **🌐 5-Database Search** — Simultaneously query OpenAlex, Crossref, Semantic Scholar, Europe PMC, and arXiv with smart early termination.
+ - **📊 Transparent Scoring** — Weighted field-by-field comparison using Levenshtein-Damerau distance. See exactly which fields matched and why.
+ - **📄 PDF Import** — Drag-and-drop PDFs. Full text is parsed and all embedded references are extracted automatically.
+ - **⚡ Batch Verification** — Check entire reference lists at once. Average <3 seconds per source.
+ - **🔐 Privacy-First** — Stateless extension. API keys encrypted with AES-256-GCM. No telemetry.
```

- [ ] **Step 3: Verify**

Run: `pnpm build:landing && pnpm build:docs`
Expected: Both build successfully

- [ ] **Step 4: Commit**

```bash
git add README.md
git commit -m "docs: align README with content kit terminology"
```

---

### Task 7: Terminology Audit (Cross-Codebase)

**Files:**
- Modify: various (search-based)

**Interfaces:**
- Consumes: spec section 4 (terminology glossary)
- Produces: consistent terminology across all source files

Search the codebase for non-conforming terminology and fix instances.

- [ ] **Step 1: Search for banned terms**

Run:
```bash
rg -i 'source.?taster|source-taster|TST' --include='*.ts' --include='*.json' --include='*.md' --include='*.astro' --include='*.vue' apps/ docs/ README.md | rg -v 'node_modules|dist|\.git'
```

Manually verify each match — only fix cases where "SourceTaster" or "source-taster" is used as a product name (not as a package name or file path).

- [ ] **Step 2: Search for "99.11%" — ensure this is only in eval section**

Run: `rg '99.11' apps/`
Expected: only in `apps/landing/src/data/en.ts` eval section

- [ ] **Step 3: Search for inconsistent metric phrasing**

Run: `rg 'accuracy' apps/ docs/ --include='*.md' --include='*.ts' --include='*.astro'`
Replace any bare "accuracy" with specific metric like "93% APA exact match rate"

- [ ] **Step 4: Commit changes if any**

```bash
git add -A
git commit -m "chore: fix terminology inconsistencies per content kit glossary"
```
