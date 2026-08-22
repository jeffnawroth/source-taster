# Architecture Decision Records

Project AI/architecture memory convention (English). Superseded docs remain — never edit or delete history.

## Index

| ADR | Date | Title |
|---|---|---|
| ADR-0001 | 2026-08-18 | AI Operating System — Phase 1 Setup |
| ADR-0002 | 2026-08-18 | Full Role Roster for the AI Operating Model (Phase 2A) |
| ADR-0003 | 2026-08-19 | Skills & Commands for the AI Operating Model (Phase 2B) |
| ADR-0004 | 2026-08-19 | Boundaries, Evals & Final Validation (Phase 2C) |
| ADR-0005 | 2026-08-19 | Audit Remediation — Eval Integrity, Control-Plane Protection, Eval Gate, Recursion Caps, Canonical Sources |
| ADR-0006 | 2026-08-19 | Runtime-Agnostic AI-OS |
| ADR-0008 | 2026-08-21 | Claude Code as a Third AI-OS Runtime Adapter |
| ADR-0009 | 2026-08-21 | Claude Code MCP Setup — Context7, Playwright, PostgreSQL, Penpot |

ADR-0007 (Client-Side Favorites — Single-Chain Identity Keys) is intentionally absent.
Favorites was a disposable test feature used only to exercise the AI-assisted workflow;
its decision record was never integrated into `main`. The number stays reserved so it is
not reused.

## Template

```markdown
# ADR-NNNN: <Title>

> Status: <proposed | accepted | superseded by ADR-XXXX>
> Date: <YYYY-MM-DD>

## Context
<The problem, forces, and constraints that require a decision.>

## Decision
<What was decided, in imperative, concrete terms.>

## Alternatives
<What else was considered and why it was rejected.>

## Consequences
<What this decision enables and what it costs.>
```

## Rules
- One decision per record; filename `YYYY-MM-DD-<topic>.md` (sequential ADR numbers)
- Decision → Evidence → Constraints → Alternatives → Reason
- Only record decisions that matter (architecture, security, domain, UX, dependencies, trade-offs)
- German decision records for product specs live in `docs/superpowers/specs/` — this directory is for cross-cutting AI/engineering decisions
