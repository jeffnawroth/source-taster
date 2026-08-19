# Handoff — AI Operating System Phase 2A

Updated: 2026-08-19

## Objective
Mechanize the complete role roster of the master prompt (all 76 §§) in three phases. Phase 2A: full §21 roster (12 agents), §22 contracts (9 sections), tier matrix (§23/§55), R-tier network deny (§43).

## Current State
Phase 2A implementation complete; validation and phase review gate in progress.

## Completed Work
- Agents (12 total, 1 primary + 11 subagents): 4 existing completed to 9-section §22 contracts with R-tier `webfetch/websearch: deny` (architect, reviewer, security-reviewer); qa T-tier unchanged permissions; 8 new agents created verbatim from plan: pm, researcher, ux, ui, data, growth (D tier: edit allow, bash deny, task allow, web ask) + devops, docs (T tier: edit allow, bash ask, task allow, web ask)
- Model pins (§38/§59): R tier = openai/gpt-5.5; pm/devops/docs = openai/gpt-5.4-mini; researcher/ux/ui/data/growth = opencode/deepseek-v4-flash-free; swe/qa inherit session default
- SWE = built-in primary, no duplicate agent; contract lives in AGENTS.md (§54)
- ADR-0002 `docs/decisions/2026-08-18-ai-operating-system-phase2a.md` + README index row
- Commits on `feat-ai-operating-system-phase2a`: 59df4c68 (plan fix), 344d0a8a (contracts), 28d93f24 (pm/researcher/ux/ui), 77da7888 (data/growth), 54d6cd5c (devops/docs); ADR+README+handoff pending commit

## Remaining Work
- Commit ADR-0002 + README index + this handoff (Task 5 Step 7)
- Task 6 phase review gate: /check gates, /ai-eval (5 existing scenarios must stay PASS), review package, independent reviewer dispatch
- Phase 2B: skills (7 new: target-state-first, product-operating-model, growth-operating-model, ux-target-state, security-engineering, delegation-and-trust, boundaries-and-runtime) + commands (/product, /design, /release) + plan-template Task-Decomposition (§26)
- Phase 2C: AGENTS.md updates, eval expansion (12 new scenarios), §73/§74 validation, final merge

## Important Decisions
- Full roster as subagents only — primary agents can bypass agent-level denies (verified OpenCode 1.18.18 limitation); recorded in ADR-0002
- R tier read-only AND network-denied (§43 "where supported")
- Worktree env note: `apps/extension/src/auto-imports.d.ts` is gitignored/generated — fresh worktrees need `pnpm --filter @source-taster/extension build:web` before typecheck (CI does build before typecheck; local pre-commit hook does not)

## Open Questions
None blocking.

## Known Constraints
- opencode config is loaded at startup — restart required after config changes
- Model IDs are runtime-specific; verify via `opencode models`
- Worktree install needs the generated auto-imports.d.ts for extension typecheck

## Risks
- Low: pure config change; no app code touched

## Verification Status
- opencode debug config: loads without error
- agent discovery: all 12 agents found (`opencode agent list`: architect, data, devops, docs, growth, pm, qa, researcher, reviewer, security-reviewer, ui, ux + built-ins)
- Permission-weakening diff vs phase-1 baseline (6a985d9f..HEAD): no removals; R tier only gained denies
- /check headless: pending (Task 6)
- /ai-eval scenarios: pending (Task 6)

## Next Recommended Action
Complete Task 6 review gate (commit ADR/handoff, run /check + /ai-eval, dispatch independent reviewer), then write phase 2B plan.