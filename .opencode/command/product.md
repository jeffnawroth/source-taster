---
description: Product workflow — problem → outcome → requirements → acceptance criteria, dispatching the pm subagent. Approval gate before implementation.
---

Canonical product method: `docs/ai-os/core/operating-model.md`.

Run the product workflow for: $ARGUMENTS

1. Dispatch the `pm` subagent (D tier, edit allow) with minimal context:
   - Problem statement (one sentence, domain-validated)
   - Outcome (measurable)
   - Requirements with traceability to the problem
   - Acceptance criteria (Given/When/Then per requirement)
   - Domain validation against AGENTS.md terminology and the CSL-JSON/matching model
2. Present problem → outcome → requirements → acceptance criteria to the user for approval.
3. Only after approval: write the outcome to `.opencode/memory/handoff.md` (objective section) and offer the follow-up (`/plan` for architecture).

Do not implement code in this command.
