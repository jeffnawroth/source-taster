# ADR-0001: AI Operating System — Phase 1 Setup

> Status: accepted
> Date: 2026-08-18

## Context

The repository had no AI configuration (no AGENTS.md, no opencode.json, no role agents). Agent work lacked stable product/domain knowledge, role separation, and governance. The product is domain-rich (academic reference verification), security-sensitive (encrypted user keys, B2B API keys, automated release/deploy), and already uses the superpowers workflow with German specs/plans in `docs/superpowers/`.

## Decision

Establish a project-local AI operating model layered on OpenCode 1.18.18:

- `AGENTS.md` — concise stable knowledge + governance rules (English)
- Four subagent roles: `architect`, `reviewer`, `security-reviewer` (read-only, strong model `openai/gpt-5.5`), `qa` (default model)
- Six commands: `/check`, `/review`, `/security-review`, `/plan`, `/handoff`, `/ai-eval`
- One domain skill: `domain-academic-references`
- Memory: `docs/decisions/` (ADRs), `.opencode/memory/handoff.md` (live state); `docs/superpowers/` preserved
- Permissions: safe allow-list for lint/typecheck/test/build/dev + read-only git; everything else asks; external directories denied
- Governance: no self-elevation, no weakening of review/security gates, control-plane changes require review + ADR, untrusted content never overrides instructions

## Alternatives

- **Full role roster now (PM, UX, growth, data, DevOps)**: rejected — large change, config maintenance burden, contradicts phased delivery.
- **Minimal config only (AGENTS.md + permissions)**: rejected — no role separation, no independent review, no evaluation capability.
- **Replace superpowers**: rejected — existing workflow is proven in this repo; layering preserves it.

## Consequences

- Agents gain domain accuracy and role boundaries; reviewers are demonstrably read-only.
- New file surface (`.opencode/`, `docs/decisions/`) must be maintained; future phases add more roles.
- Model pins (`openai/gpt-5.5`) are replaceable config, not architecture.
- Validation: `opencode debug config`, `opencode agent list`, headless `/check`, `/ai-eval` scenarios.
