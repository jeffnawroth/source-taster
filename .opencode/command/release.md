---
description: Read-only release checklist — gates, dangerous areas, human authorization (§50/§71). Never executes a release.
---

Canonical oversight and release-safety principles:
`docs/ai-os/core/governance-and-audit.md`.

Run the read-only release checklist for: $ARGUMENTS

1. Verify gates: `pnpm lint`, `pnpm typecheck`, `pnpm test` all green (per `/check` results)
2. Verify dangerous areas untouched: `.keystore/`, `.env`, release pipeline `.github/workflows/release.yml`, docker-compose observability stack, production CORS allowlist
3. Verify human authorization recorded (release = human-only, §46/§50)
4. Report checklist pass/fail per item to the user.

This command NEVER executes a release — it is a checklist only.
