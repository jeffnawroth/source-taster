# ADR-0004: Boundaries, Evals & Final Validation (Phase 2C)

> Status: Accepted
> Date: 2026-08-19

## Context

Master-prompt §41 (runtime isolation), §43 (network egress), §45 (stop conditions), §46 (human oversight), §49 (rollback), §28–30/§39/§40 (memory + context), §54 (SWE), §73/§74 (final validation) require explicit mechanization. Phases 2A/2B delivered roster + methods; 2C makes the boundaries and validation explicit and adds formal evaluation coverage. Spec `docs/superpowers/specs/2026-08-18-ai-operating-system-phase2.md` §8–§13.

## Decision

- AGENTS.md gains: runtime-isolation statement (§41 — isolated workspace + restricted runtime, NO OS sandboxing claim), approved-domain policy (§43, governance text since flat per-agent deny/ask/allow is all OpenCode 1.18.18 supports), context/cost discipline (§39), stop conditions (§45), human-oversight table (§46), rollback path (§49), SWE note (§54), updated roles/commands/skills inventory.
- MCP supply-chain audit documented (`docs/superpowers/specs/2026-08-18-mcp-supply-chain-audit.md`): 6 servers justified (context7, github, penpot, exa, playwright, chrome-devtools); filesystem MCP with root `$HOME` flagged (§42) — recommendation: scope to workspace or disable; global-config change is a user decision (§53), none made from the repo.
- Eval suite expanded from 5 to 17 scenarios (§34) covering §22/§23/§24–26/§37/§41/§43/§45/§9/§14/§29/§39; existing 5 re-run and stayed PASS.
- §73/§74 final-validation checklists executed as the last step (results recorded in handoff).

## Alternatives

- **OS-level sandboxing**: rejected — not verifiable in this environment; §41 forbids claiming unverified sandboxing.
- **Technical domain allowlist via config**: rejected — OpenCode 1.18.18 has no domain filter; policy text is the honest mechanism.
- **Deferring the MCP audit**: rejected — §37/§58 require supply-chain assessment; the finding must be on record.

## Consequences

- AGENTS.md is now the policy-complete control plane (governance + boundaries + rollback).
- Eval suite covers the full mechanized surface; failures after this phase indicate regressions.
- Filesystem-MCP `$HOME` finding remains open until the user decides (global config).
- Rollback: `git revert` of this phase's commits + opencode restart.