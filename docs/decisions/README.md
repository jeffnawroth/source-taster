# Architecture Decision Records

Project AI/architecture memory convention (English). Superseded docs remain — never edit or delete history.

## Index

| ADR | Date | Title |
|---|---|---|
| ADR-0001 | 2026-08-18 | AI Operating System — Phase 1 Setup |
| ADR-0002 | 2026-08-18 | Full Role Roster for the AI Operating Model (Phase 2A) |
| ADR-0003 | 2026-08-19 | Skills & Commands for the AI Operating Model (Phase 2B) |

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
