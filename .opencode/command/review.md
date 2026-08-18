---
description: Independent engineering review of the current change (read-only).
---

Dispatch the `reviewer` subagent to independently review the current change.

- Scope: `git diff` (unstaged + staged); if `$ARGUMENTS` names specific paths or a feature, review that scope instead
- Requirements: the task description from this session, or `$ARGUMENTS`
- Evaluate: correctness, edge/negative/authorization cases, test quality, target-state alignment, scope discipline, terminology (AGENTS.md)
- The reviewer must NOT modify any files

Return the full review report with findings and verdict to the user. $ARGUMENTS