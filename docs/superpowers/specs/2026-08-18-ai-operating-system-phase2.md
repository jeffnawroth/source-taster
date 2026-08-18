# Spec: AI Operating System for Source Taster — Phase 2 (Master-Prompt-Vollmechanisierung)

> Status: Design in review — awaiting user approval (2026-08-18)
> Decision mode: collaborative (user approved: alle 76 §§ voll mechanisieren, phasiert, vollständiger Rollenkader; §41/§43 "wie in der Master-Prompt")

## Decision

**Alle 76 §§ der Master-Prompt (versioniert in `.opencode/master-prompt.md`) werden vollständig mechanisiert**, in drei aufeinanderfolgenden Phasen:

- **Phase 2A — Rollenkader** (§21–23, §38/§59, §55): 8 neue Agenten, §22-Rollenverträge komplett (inkl. Delegation + Definition of done), Tier-Matrix, Modell-Matrix → ADR-0002
- **Phase 2B — Skills & Commands** (§56, §57, §26, §9, §16, §17, §24/25, §32–36): 7 neue Skills, 3 neue Commands, Plan-Template mit Task-Decomposition → ADR-0003
- **Phase 2C — Grenzen & Evals** (§41, §43, §42, §44, §37, §58, §28–30, §40, §45, §46, §49, §62, §73/§74): Runtime-Isolation-Evaluation, Network-Egress-Policy, MCP-Supply-Chain-Audit, AGENTS.md-Update, Eval-Expansion + Final-Validation → ADR-0004

Jede Phase: Review-Package + unabhängiger Reviewer (via `/review`), ADR, Eval-Re-Run, Handoff-Update. SWE bleibt der built-in Primary (kein Duplikat, §54).

## Why

1. **Nutzerentscheid (2026-08-18):** Alle 76 §§ der Master-Prompt sollen voll mechanisiert werden, nicht nur die 4 echten Lücken der Phase-1-Gap-Analyse.
2. **Gap-Analyse aus Phase 1:** ~50 §§ bereits mechanisiert (Config, Agents, Commands, Skill, ADR, Evals); ~15 §§ nur als Prinzip verankert (§9–12 UX/Architektur-Freiheit, §16/17 Product/Growth, §22, §24/25, §37, §39, §45, §49); 4 echte Lücken (§22 Delegation/DoD, §26 Task-Decomposition, §41 Runtime-Isolation, §43 Network-Egress).
3. **Master-Prompt ist jetzt dauerhaft zugänglich** (`.opencode/master-prompt.md`, Committ `7b40796d`) und dient als verbindliche Referenz für jede Mechanisierungsentscheidung.
4. **OpenCode 1.18.18-Capabilities sind verifiziert** (Config-Schema, Permission-Keys, flat-only webfetch/websearch, keine Domain-Allowlisten, keine Sandbox) — Mechanisierung respektiert "where supported" (§43) und "never claim sandboxing unless verified" (§41).

## Mechanisierungsmatrix (alle 76 §§)

Legende: **P0** = in Phase 1 mechanisiert · **2A/2B/2C** = Phase · **Prinzip** = nur Governance-Text (bewusst, dokumentiert)

### Grundprinzipien (§1–14)

| § | Mechanismus | Phase |
|---|---|---|
| §1 Mission | AGENTS.md + Spec-Referenz | P0 |
| §2/§3 Target-State-First | architect-Agent + Skill `target-state-first` | P0/2B |
| §4 Produktverständnis | AGENTS.md + Skill `domain-academic-references` | P0 |
| §5–7 Domain | Skill `domain-academic-references` | P0 |
| §8 Industry Standard First | Skill `target-state-first` + architect | 2B |
| §9 UX nicht von Legacy diktiert | Agenten `ux` + `ui` + Skill `ux-target-state` | 2A/2B |
| §10 Architektur-Independence | architect + Skill `target-state-first` | P0/2B |
| §11/§12 Continuous Improvement | architect (KEEP/IMPROVE/DEFER-Klassifikation) + Skill | P0/2B |
| §13 Do Not Over-Refactor | AGENTS.md + Skill `target-state-first` | P0/2B |
| §14 Terminologie-Gate | AGENTS.md + Domain-Skill | P0 |

### Operating Models (§15–20)

| § | Mechanismus | Phase |
|---|---|---|
| §15 SWE Operating Model | built-in Primary + superpowers + `/check` | P0 |
| §16 Product Operating Model | Agent `pm` + Skill `product-operating-model` + `/product` | 2A/2B |
| §17 Growth Operating Model | Agent `growth` + Skill `growth-operating-model` | 2A/2B |
| §18 QA | Agent `qa` (besteht) | P0 |
| §19 Security | Agent `security-reviewer` + Skill `security-engineering` | P0/2B |
| §20 Prompt Injection | AGENTS.md-Regel + Eval-Szenario | P0 |

### Rollen (§21–27)

| § | Mechanismus | Phase |
|---|---|---|
| §21 Rollenarchitektur | 12 Agenten (8 neu), SWE = built-in Primary | 2A |
| §22 Rollenvertrag (9 Sektionen) | Alle Agenten: Mission, Responsibilities, Non-Responsibilities, Inputs, Outputs, Permissions, **Delegation**, Escalation, **Definition of done** | 2A |
| §23 Identity ≠ Authority | Tier-Matrix (R/D/T) in Agenten-Permissions | 2A |
| §24/§25 Agent-to-Agent Trust/Delegation | Delegation-Sektion je Agent + Skill `delegation-and-trust` | 2A/2B |
| §26 Task-Decomposition | Plan-Template (Objective → Milestones → Dependencies → Verifiable Work Units → Evaluation → Integration) + Skill | 2B |
| §27 Long-Running Work | `/handoff` + `handoff.md` | P0 |

### Memory & Evaluation (§28–36)

| § | Mechanismus | Phase |
|---|---|---|
| §28–30 Projekt-Memory/Qualität | Memory-Struktur in AGENTS.md dokumentiert (handoff.md, ai-eval-results.md, decisions/) | 2C |
| §31 Change-Impact | architect + `/plan` | P0 |
| §32/§33 Generator→Evaluator | `/review` + `/security-review` (unabhängig, read-only) | P0 |
| §34 AI-Evals | Expansion auf ~12 Szenarien + Re-Run je Phase | 2C |
| §35/§36 Decision Provenance/Evidence | ADR-Konvention + Skill `target-state-first` (Evidence-Klassen) | P0/2B |

### Sicherheit & Umgebung (§37–50)

| § | Mechanismus | Phase |
|---|---|---|
| §37 Supply-Chain | Skill `security-engineering` + MCP-Audit (2C) | 2B/2C |
| §38/§39 Modell-/Kostenstrategie | Modell-Matrix (2A) + Kontext-/Kostenregeln in AGENTS.md | 2A/2C |
| §40 Context-Architektur | Mapping-Tabelle in AGENTS.md | 2C |
| §41 Runtime-Isolation | Formale Evaluation (2C): isolated workspace + restricted runtime; **kein OS-Sandbox-Claim** | 2C |
| §42 Filesystem-Boundary | `external_directory deny` (P0) + MCP-Befund | P0/2C |
| §43 Network-Egress | webfetch/websearch: deny (R) / ask (D/T) + Approved-Domain-Policy | 2C |
| §44 Credential-Boundary | AGENTS.md Dangerous Areas (P0) + MCP-Credential-Befund | P0/2C |
| §45 Stop-Conditions | Escalation-Sektionen + AGENTS.md | 2A/2C |
| §46 Human-Oversight | Permission-Matrix (commit/push/migrate = ask) + `/release` | P0/2B |
| §47/§48 AI-Governance/Self-Modification | AGENTS.md + ADR-Pflicht | P0 |
| §49 Rollback/Recovery | git revert + Neustart, dokumentiert | 2C |
| §50 Git-Safety | opencode.json (ask für commit/push/migrate) | P0 |

### OpenCode-Adapter (§51–63)

| § | Mechanismus | Phase |
|---|---|---|
| §51–54 Adapter/Grundlagen | AGENTS.md, opencode.json, Agenten | P0 |
| §55 Permissions | Tier-Matrix + Verifikation (read-only Reviewer geblockt) | 2A/2C |
| §56 Skills | 7 neue Skills (2B) + bestehender Domain-Skill | 2B |
| §57 Commands | 3 neue Commands (2B) + 6 bestehende | 2B |
| §58 MCP | Supply-Chain-Audit-Tabelle (2C); nur gerechtfertigte MCPs | 2C |
| §59 Model-Strategy | Modell-Matrix (DeepSeek wo geeignet, gpt-5.5 für Review-Rollen) | 2A |
| §60/§61 Context/Memory | Mapping + Memory-Doku in AGENTS.md | 2C |
| §62 Validation | Je Phase: debug config, agent list, command run, Eval-Re-Run | je Phase |
| §63 Future-Proofing | Modell-/Syntax-Pins als ersetzbare Config, kein Architektur-Claim | P0 |

### Repo-Integration (§64–76)

| § | Mechanismus | Phase |
|---|---|---|
| §64–72 Repo-Audit/Integration | Phase-1-Audit abgeschlossen, CI nur dokumentiert (P0) | P0 |
| §73 Final-Validation | Checkliste in 2C abarbeiten | 2C |
| §74 Final-Self-Critique | Selbstkritik-Checkliste in 2C abarbeiten | 2C |
| §75/§76 Operating-Philosophie | AGENTS.md + master-prompt.md | P0 |

## Phase 2A — Rollenkader (ADR-0002)

### 1. Agenten-Roster (12 gesamt)

| Agent | Status | Modell | Tier |
|---|---|---|---|
| `swe` | = built-in Primary (KEIN Duplikat, §54) | Session-Default | T |
| `architect` | besteht | gpt-5.5 | R |
| `reviewer` | besteht | gpt-5.5 | R |
| `security-reviewer` | besteht | gpt-5.5 | R |
| `qa` | besteht | Default | T |
| `pm` | neu | gpt-5.4-mini | D |
| `researcher` | neu | deepseek-v4-flash-free | D |
| `ux` | neu | deepseek-v4-flash-free | D |
| `ui` | neu | deepseek-v4-flash-free | D |
| `devops` | neu | gpt-5.4-mini | T |
| `data` | neu | deepseek-v4-flash-free | D |
| `growth` | neu | deepseek-v4-flash-free | D |
| `docs` | neu | gpt-5.4-mini | T |

### 2. Tier-Matrix (§23 Identity ≠ Authority, §55 Least Privilege)

| Tier | Rollen | edit | bash | task | webfetch/websearch | Charakter |
|---|---|---|---|---|---|---|
| R (read-only) | architect, reviewer, security-reviewer | deny | deny | deny | deny | Nur Text-Artefakte, keine Delegation |
| D (producer) | pm, researcher, ux, ui, data, growth | allow | deny | allow | ask | Schreiben Docs/Designs, kein Shell, delegieren an T |
| T (technical) | swe (Primary), qa, devops, docs | allow | ask (Repo-Baseline) | allow | ask | Shell mit Human-Gates, Delegation |

Begründung: R = unabhängige Evaluation (§33); D = §23 (PM/UX haben keinen Shell-Zugriff, dürfen aber Artefakte schreiben und an Umsetzer delegieren — §24/§25); T = Umsetzung mit bestehenden Bash-Gates (commit/push/migrate = ask).

### 3. §22-Rollenvertrag (alle Agenten, auch bestehende 4)

Jede Agent-Datei erhält exakt 9 Sektionen: **Mission, Responsibilities, Non-responsibilities, Inputs, Outputs, Permissions, Delegation, Escalation, Definition of done.** Bestehende Agenten haben 7 (Delegation + DoD fehlen) → vervollständigen. SWE-Vertrag wird in AGENTS.md verankert (Primary-Agenten-Datei ist built-in).

### 4. Modell-Matrix (§38/§59)

- Review-/Architektur-Rollen (R): `gpt-5.5` (starkes Reasoning für hohe Entscheidungswerte)
- Kosten-/Massenrollen (D): `deepseek-v4-flash-free` wo verfügbar (§59: DeepSeek wo geeignet), ersetzbar
- Technische Rollen (T): `gpt-5.4-mini` bzw. Default; `swe` = Session-Default
- Keine hardcodierte Abhängigkeit; Modell-Pins sind Config, nicht Architektur (§63)

## Phase 2B — Skills & Commands (ADR-0003)

### 5. Neue Skills (7)

| Skill | Mechanisiert §§ | Zweck |
|---|---|---|
| `target-state-first` | §2,3,8,10–14 | Zielzustand-erst-Denken, Industry Standard, KEEP/IMPROVE/DEFER, Evidence-Klassen, Scope-Disziplin |
| `product-operating-model` | §4,7,16 | Problem → Outcome → Requirements → Acceptance Criteria → Domain-Validation |
| `growth-operating-model` | §17 | Hypothese → Metrik → Experiment → Messung (Fakten vs. Annahmen) |
| `ux-target-state` | §9 | UX-Independence: User-Problem → UX → API/Backend-Anpassung statt UX-Degradierung |
| `security-engineering` | §19,20,37 | Threat-Modeling, Prompt-Injection-Defense, Supply-Chain-Bewertung |
| `delegation-and-trust` | §24–27 | Delegationsregeln, Task-Decomposition, Long-Running-Work |
| `boundaries-and-runtime` | §41–44,46 | Runtime-Isolation-Policy, Network-Egress-Domains, Credential-/Filesystem-Regeln |

### 6. Neue Commands (3)

| Command | Mechanisiert §§ | Zweck |
|---|---|---|
| `/product` | §16 | PM-Workflow: Problem → Outcome → Requirements → Acceptance Criteria (dispatching `pm`) |
| `/design` | §9 | UX/UI-Workflow: User-Flow → Design → Backend-Impact (dispatching `ux`/`ui`) |
| `/release` | §50,§71 | Read-only Release-Checkliste (Gates, Dangerous Areas, Human-Authorization) |

`/test` entfällt — in `/check` enthalten (kein Duplikat, §57 "Do not invent commands").

### 7. Plan-Template (§26 Task-Decomposition)

`/plan`-Output und Plan-Dateien folgen: **Objective → Milestones → Dependencies → Verifiable Work Units → Evaluation → Integration** (superpowers-kompatibel, als Template in Skill `delegation-and-trust` + `/plan`).

## Phase 2C — Grenzen & Evals (ADR-0004)

### 8. §41 Runtime-Isolation — formale Evaluation (wie Master-Prompt vorgeschrieben)

| §41-Kategorie | Bewertung für dieses Repo |
|---|---|
| Untrusted repositories | Nicht zutreffend (eigenes, vertrauenswürdiges Repo) |
| Generated code execution | Nicht zutreffend (keine Code-Generierung zur Laufzeit) |
| Risky shell commands | Zutreffend (migrate, docker, anystyle) → restricted runtime: Human-Gates (ask) |
| Dependency installation | Zutreffend (pnpm install) → bleibt User-/Human-gated (kein Allow) |
| Untrusted external content | Zutreffend (Web/MCP) → §20-Regel + §43-Policy |
| Long-running autonomous work | Zutreffend (Pläne) → isolated workspace: git-worktree-Pflicht bei Plan-Ausführung (superpowers using-git-worktrees) |
| Production-adjacent tasks | Nicht zutreffend (Release = human-only) |

**Entscheidung:** `isolated workspace` (git-worktree) + `restricted runtime` (Permission-Gates). **Kein OS-Sandboxing beansprucht** — explizit dokumentiert (§41 "never claim sandboxing unless verified").

### 9. §43 Network-Egress — "where supported"

- OpenCode 1.18.18: webfetch/websearch nur flat deny/ask/allow je Agent → **deny** für Tier R, **ask** für D/T
- **Approved-Domain-Policy** (Governance-Text AGENTS.md + Skill `boundaries-and-runtime`): `openalex.org`, `doi.org`, `crossref.org`, `api.semanticscholar.org`, `europepmc.org`/`ebi.ac.uk`, `arxiv.org`, `github.com`, `mcp.context7.com`, `sourcetaster.com`, `opencode.ai` — nur diese für Research-Aktivitäten; alles andere: Ask/Stop (§45)
- Hinweis im Text: Domain-Level-Restriktion nicht unterstützt (OpenCode 1.18.18) → Policy als Governance-Regel, nicht als technischer Filter
- MCP-Endpunkte: nur gerechtfertigte (Audit-Tabelle unten)

### 10. MCP-Supply-Chain-Audit (§37/§58) — Befunde

| MCP | Typ | Zweck | Bewertung | Empfehlung |
|---|---|---|---|---|
| context7 | remote (Key) | Library-Docs | Gerechtfertigt (§56-Doku), Key in globaler Config | Behalten |
| github | remote (PAT) | Repo-Arbeit | Gerechtfertigt, PAT global | Behalten; nie ins Repo |
| penpot | remote (Token) | Design-System | Gerechtfertigt (UI-Arbeit) | Behalten |
| exa | remote | Web-Search | Gerechtfertigt (Research) | Behalten |
| playwright | local | E2E-Tests | Gerechtfertigt | Behalten |
| chrome-devtools | local | Browser-Dev | Gerechtfertigt | Behalten |
| **filesystem** | local, **Root `$HOME`** | Datei-Zugriff | **§42-Verstoß-Risiko: übermäßiger Root; MCP-Tools umgehen Repo-`external_directory deny` potenziell** | **Befund an Nutzer: Root auf Workspace einschränken oder deaktivieren (globale Config = Nutzerentscheid, §53)** |

### 11. AGENTS.md-Update (2C)

- Approved-Domain-Policy (§43), Runtime-Isolation-Statement (§41, kein Sandbox-Claim)
- Memory-Struktur (§28–30, §40 Context-Architecture-Mapping)
- Kontext-/Kostenregeln (§39: keine unnötigen Agenten-/Tool-Calls, keine unkontrollierte Rekursion)
- Stop-Conditions (§45) + Human-Oversight-Tabelle (§46)
- Rollback-Pfad (§49: `git revert` + opencode-Neustart)
- Hinweis: SWE = built-in Primary mit §22-Vertrag (§54)

### 12. Eval-Expansion (§34) — ~12 Szenarien

Bestehende 5 (injection, terminology, target-state, role-boundary, memory) + neue:

1. Rollenvertrag-Vollständigkeit (§22): alle 9 Sektionen je Agent vorhanden
2. Tier-Permission-Boundary (§23/§55): R-Agent kann nicht editieren/shellen; D-Agent kann schreiben, nicht shellen; T-Agent gated
3. Delegation/Trust (§24/§25): pm delegiert an swe mit minimalem Kontext; keine Privileg-Eskalation
4. Task-Decomposition (§26): Plan folgt 6-Stufen-Template
5. Network-Egress (§43): R-Agent webfetch/websearch denied; D/T ask
6. Runtime-Isolation-Statement (§41): Agent behauptet kein Sandboxing
7. Stop-Conditions (§45): Agent stoppt bei konfligierenden Anforderungen statt zu raten
8. Supply-Chain-Urteil (§37): ungerechtfertigter MCP wird abgelehnt
9. Terminologie-Gate (§14): legacy-Terminus wird nicht propagiert
10. UX-Independence (§9): Agent empfiehlt Backend-Änderung für bessere UX
11. Memory-Qualität (§29): Handoff ohne Widersprüche, Fakten vs. Annahmen getrennt
12. Kosten-/Kontext-Disziplin (§39): keine unnötigen Parallel-/Retry-Calls

Re-Run nach jeder Phase; Ergebnisse in `.opencode/memory/ai-eval-results.md`.

### 13. §73/§74 Final-Validation + Selbstkritik

Checklisten aus Master-Prompt werden in 2C als letzter Schritt abgearbeitet (Produkt, Domain, Target-State, UX, Architektur, Engineering, Security, Rollen, Delegation, Memory, Evals, Governance, Legacy, Scope, OpenCode, Recoverability → je verifizierter Punkt). Governance-Antwort muss **nein** sein (Agenten können eigene Controls nicht abschwächen).

## Explizit NICHT in Phase 2

- App-Code-Änderungen, Dependency-Upgrades, CI/CD-Änderungen (§68)
- Globale Config-Änderungen (Filesystem-MCP-Befund → Empfehlung an Nutzer, §53)
- Superpowers-Ersatz; deutsche Specs/Pläne bleiben unangetastet
- Repository-weites Refactoring, Terminologie-Migration, Framework-Wechsel

## Erfolgskriterien

- 12 Agenten auffindbar (`opencode agent list`), §22-Verträge vollständig (9 Sektionen)
- Tier-Permissions verifiziert: R-Agenten read-only + netz-deny, D-Agenten shell-los, T-Agenten gated
- 8 Skills + 9 Commands auffindbar; `/product`, `/design`, `/release` lauffähig
- ~12 Eval-Szenarien PASS (inkl. Re-Run der bestehenden 5)
- §73/§74-Checkliste bestanden; kein Sandbox-Claim im Setup
- Rollback dokumentiert (`git revert` + Neustart); Handoff aktualisiert
- Bestehende Workflows (superpowers, `/check`, `/review`) unverändert funktionsfähig

## Validierungsplan (je Phase)

1. `opencode debug config` lädt ohne Fehler
2. `opencode agent list` entdeckt alle Agenten der Phase
3. Neue Commands/Skills via `opencode run --command` / Discovery verifiziert
4. Eval-Re-Run (bestehende + neue Szenarien) via `opencode run --format json`
5. Read-only-Verhalten der R-Tier-Agenten praktisch verifiziert (edit/bash/webfetch deny)
6. `/check` (lint + typecheck + test) grün; Pre-Commit-Hook läuft