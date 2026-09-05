---
name: target-state-first
description: Target-state-first thinking — establish the ideal end state before the existing implementation; industry-standard-first, KEEP/IMPROVE/DEFER classification, evidence classes, scope discipline. Use when designing features, architecture, or UX, or when a legacy/constraint analysis is needed.
---

# Target-State-First

Canonical method: `docs/ai-os/core/principles.md` and `operating-model.md`.

## Core rule
Always establish the ideal target state FIRST (user/business outcome → product/domain context → current best practice → ideal target), then analyze the existing system as a constraint — never as the baseline (§2/§3).

## Workflow
1. **Outcome first** — what must the user be able to do? (not: what does the system currently do?)
2. **Industry standard** — what is the current best practice for this? Name the standard (§8)
3. **Ideal target** — design the target state ignoring the legacy implementation (§10)
4. **Existing state** — inventory what exists, as evidence only
5. **Gap** — target − existing = change surface; classify each gap item:
   - KEEP — already target-aligned
   - KEEP WITH CONSTRAINT — correct but limited by a documented constraint
   - IMPROVE NOW — small, high-value change
   - MODERNIZE FIRST — prerequisite modernization required
   - DEFER — not worth the change cost now (§11/§12)
6. **Scope discipline** — recommend the minimal change set that reaches the target; do not over-refactor (§13)

## Evidence classes (§35/§36)
Label every claim with its evidence class:
- **Verified** — observed in repo/APIs/tests, reproducible
- **Inferred** — reasoned from verified evidence
- **Assumed** — unverified; must be flagged as assumption

## Deliverable shape
Target state, existing state, gap table (KEEP/IMPROVE/DEFER), change impact, recommended approach, ADR draft when requested.

## Live glossary discipline (§6/§14)
When a new term appears mid-session — in a user message, a file, or your own draft — check it against `AGENTS.md`'s canonical terminology before adopting it. If it diverges from a canonical term, propose the canonical one instead of silently letting the drift stand; don't wait for a dedicated terminology pass. This is a live check during ordinary work, not a separate audit step.

## When an ADR is actually required (§70)
Write an ADR only when a decision is **all three** of: hard to reverse, surprising to a future reader, and a real trade-off (a choice that gives up something to get something). A decision that is merely non-trivial, or reversible, or unsurprising to anyone who reads the code, does not need one — that's how ADRs stay evidence instead of noise.

## Approval status (§46/§70)
- Any plan/design artifact or ADR draft this workflow produces is written with `Status: proposed` — never `Status: accepted`. The status is not a self-assessment.
- `accepted` is set only in the same commit that follows an explicit human approval in conversation, reusing the existing commit human-gate (AGENTS.md) instead of a new approval mechanism.
- **Do not start implementing application code (`apps/**`, `packages/**`) against a `proposed` artifact.** This is a judgment gate, not a permission rule: the repository deliberately stopped ask-gating every edit under `apps/**`/`packages/**`, because prompting on each of hundreds of routine edits bought friction rather than safety and never actually verified that a design artifact existed (see `docs/decisions/2026-08-25-ai-setup-modernization.md`). The discipline is yours to keep — the commit gate is the enforced backstop.
