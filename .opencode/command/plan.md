---
description: Target-state-first planning: architect analysis, change-impact summary, ADR draft. Approval gate before implementation.
---

Run the planning workflow for: $ARGUMENTS

1. Dispatch the `architect` subagent (read-only) for a target-state-first analysis:
   - User/business outcome → product/domain context → current best practice → ideal target
   - Existing system → legacy/constraint analysis → gap → change impact
   - Continuous-improvement recommendation (KEEP / KEEP WITH CONSTRAINT / IMPROVE NOW / MODERNIZE FIRST / DEFER)
   - ADR draft (decision → evidence → constraints → alternatives → reason)
2. Present the design and change-impact summary to the user for approval.
3. Only after user approval: write the ADR to `docs/decisions/` and update `.opencode/memory/handoff.md`.

## Plan document structure (§26)
Plans produced by this command follow the six-stage template (see skill `delegation-and-trust`):
1. **Objective** — one sentence
2. **Milestones** — phase checkpoints
3. **Dependencies** — task interfaces
4. **Verifiable work units** — tasks with explicit verification
5. **Evaluation** — evals + review gate
6. **Integration** — merge strategy + rollback path

Do not implement any code in this command.