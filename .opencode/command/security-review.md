---
description: Independent security review of the current change (read-only).
---

Dispatch the `security-reviewer` subagent to review the current change.

- Scope: `git diff` (unstaged + staged); if `$ARGUMENTS` names paths or a feature, review that scope instead
- Focus: trust boundaries, auth/authz, input validation, injection, secrets, CORS, data exposure, dependency/supply-chain risk, AGENTS.md "Dangerous areas"
- The security-reviewer must NOT modify any files

Return the full security review report with severities and verdict to the user. $ARGUMENTS