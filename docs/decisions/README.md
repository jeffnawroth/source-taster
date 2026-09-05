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
| ADR-0010 | 2026-08-22 | AI-OS v1.0 Hardening — Control-Plane Ownership, MCP Pinning, Secret Boundary |
| ADR-0011 | 2026-08-22 | Favorites — Disposal of the Workflow Test Feature |
| ADR-0012 | 2026-08-22 | Release Pipeline Correctness — Version Bump Semantics and Deploy Build Cache |
| ADR-0013 | 2026-08-22 | Release Bump Range — Release Tags Are Not Reachable from `main` |
| ADR-0014 | 2026-08-22 | The pnpm Store Cache Mount Never Worked — Wrong Target Path |
| ADR-0015 | 2026-08-22 | Build Images in CI, Not on the Production Host |
| ADR-0016 | 2026-08-22 | CI Supply-Chain Hardening — SHA-Pinned Actions and a Permissions Floor |
| ADR-0017 | 2026-08-22 | Observability Footprint — Proposal to Remove cAdvisor and Pin the Stack (**proposed**) |
| ADR-0018 | 2026-08-22 | Remove Observability, Tracing and Logging Entirely (supersedes ADR-0017) |
| ADR-0019 | 2026-08-23 | Ship from the Release Commit — Adopt release-please (bootstrap-sha decision superseded by ADR-0020) |
| ADR-0020 | 2026-08-23 | `bootstrap-sha` Does Not Bound History When a Release Tag Exists |
| ADR-0021 | 2026-08-25 | AI Setup Modernization — Enforced Gates, Single-Sourced Skills, Invariant-Based Governance (**proposed**) |
| ADR-0022 | 2026-08-26 | Skills, Hooks & Security — Content-Driven Re-Evaluation (**proposed**; several items closed by ADR-0023) |
| ADR-0023 | 2026-08-27 | AI Setup Round-3 Closeout — Push-Gate Redesign, Doc Citations, Stop-Hook Re-Deferral, Frontend-Design Activation (**proposed**) |

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
