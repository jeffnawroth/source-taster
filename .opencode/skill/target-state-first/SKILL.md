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

## Approval status (§46/§70)

- Any plan/design artifact or ADR draft this workflow produces is written with `Status: proposed` — never `Status: accepted`. The status is not a self-assessment.
- `accepted` is set only in the same commit that follows an explicit human approval in conversation, reusing the existing commit human-gate (AGENTS.md) instead of a new approval mechanism.
- Do not start implementing application code (`apps/**`, `packages/**`) against a `proposed` artifact.
