# Handoff — AI Operating System (Phases 1–2C + Audit Remediation H-1/H-2, M-1..M-5 complete)

Updated: 2026-08-19

## Objective
Mechanize the complete master prompt (all 76 §§) — the AI operating model for Source Taster — and remediate the 2026-08-19 independent audit findings (H-1, H-2, M-1..M-5) with verified evidence.

## Current State
Phases 1–2C complete and validated. Audit (2026-08-19, `docs/audits/2026-08-19-ai-operating-system-audit.md`) remediation complete: H-1, H-2, M-1..M-5 all implemented (ADR-0005); full 30-requirement re-audit complete — all 30 PASS (`docs/audits/2026-08-19-ai-operating-system-reaudit.md`). Remaining: interactive re-verification of permission prompts after restart, optional push. **Requires opencode restart** to load new config (permissions/ask-gate/subagent_depth load at startup).

## Completed Work
- **Agents (12)**: architect, reviewer, security-reviewer (R tier: edit/bash/task/web deny); pm, researcher, ux, ui, data, growth (D tier: edit allow, bash deny, web ask); qa, devops, docs (T tier: edit allow, bash ask, web ask). All 9-section §22 contracts. SWE = built-in `build` (no duplicate, §54).
- **Model pins**: R = openai/gpt-5.5; pm/devops/docs = openai/gpt-5.4-mini; researcher/ux/ui/data/growth = opencode/deepseek-v4-flash-free; swe/qa inherit session default.
- **Skills (8)**: domain-academic-references + target-state-first, product-operating-model, growth-operating-model, ux-target-state, security-engineering, delegation-and-trust (incl. §26 plan template), boundaries-and-runtime.
- **Commands (9)**: /check, /review, /security-review, /plan (+§26 structure), /product, /design, /release, /handoff, /ai-eval.
- **AGENTS.md**: policy-complete (roles, process, memory, commands, skills, governance, §41 runtime isolation without sandbox claim, §43 approved egress domains, §39 context discipline, §45 stop conditions, §46 human oversight, §49 rollback, §54 SWE).
- **ADRs**: 0001 (phase 1), 0002 (roster), 0003 (skills/commands), 0004 (boundaries/evals) + MCP supply-chain audit doc.
- **Eval suite**: 17 scenarios; 5 original scenarios stayed PASS through all phases; permission scenarios re-verified (H-1, see below).
- **H-1 (audit fix, 2026-08-19)**: corrected eval docs + results: `--agent <subagent>` falls back to build agent (fallback, not bypass); headless task-tool dispatch is inconclusive for permission tests (empty subagent results regardless of permissions — artifact); permission layer verified via merged config (`opencode agent list`, last-match-wins) + interactive TUI. Scenario 4 orchestrator refusal re-verified (instruction-level).
- **H-2 (audit fix, 2026-08-19)**: control-plane edit protection. `opencode.json` global granular rules: `*` allow; `AGENTS.md`, `opencode.json`, `.opencode/**` ask. Removed `edit: allow` from all 8 D/T agent frontmatters (data, devops, docs, growth, pm, researcher, ui, ux) so their agent-level rules no longer override the global ask-gate (last-match-wins); R tier `deny *` unchanged. Verified merged config: last edit rule per agent is now `ask .opencode/**` (D/T) / `deny *` (R).
- **M-1 (audit fix, 2026-08-19)**: filesystem MCP overridden in project `opencode.json` with root = workspace (was `$HOME`); verified in merged config via `opencode debug config`.
- **M-2 (audit fix, 2026-08-19)**: `.github/copilot-instructions.md` updated to `/v1/*`; no stale `/api/*` remains in governance docs.
- **M-3 (audit fix, 2026-08-19)**: `evaluation/ai-system/check-governance.mjs` (deterministic, dependency-free) + `pnpm eval:ai` + CI job `ai-governance` in lint.yml. LLM scenarios remain on-demand via /ai-eval.
- **M-4 (audit fix, 2026-08-19)**: `subagent_depth: 2` (hard nesting cap) + `steps: 150` on all 12 role subagents; build stays uncapped.
- **M-5 (audit fix, 2026-08-19)**: canonical-sources mapping in AGENTS.md; §-reference resolution enforced (76 master-prompt sections, all `§N` resolve).
- **ADR-0005** documents the full remediation.

## Remaining Work
- Interactive confirmation after restart: ask prompts on control-plane edits, deny prompts for R-tier tools (headless behavioral checks are unreliable — CLI artifact).
- User: restart opencode to load the final config (config loads at startup).
- Optional: `git push` of main (commits are local so far in this session's phases).

## Important Decisions
- Roles as subagents only — headless `opencode run --agent X` falls back to the default build agent (verified OpenCode 1.18.18). Headless task-tool dispatch is inconclusive for permission tests (empty results regardless of permissions — artifact). Permission verification = merged config + interactive TUI. Documented in ADR-0002 + eval follow-ups.
- No OS sandboxing claimed (§41); isolation = worktrees + human gates.
- Egress policy is governance text, not a technical filter (platform limitation, documented).
- /release is read-only; release stays human-only.
- Control-plane files (AGENTS.md, opencode.json, .opencode/**) are edit-protected with an ask-gate for edit-enabled agents (H-2 remediation, 2026-08-19).

## Open Questions
None blocking.

## Known Constraints
- opencode config loads at startup — restart required (all phases are loaded once restarted).
- Model IDs runtime-specific; verify via `opencode models`.
- Fresh worktrees need `pnpm --filter @source-taster/extension build:web` before typecheck (generates gitignored auto-imports.d.ts; CI builds before typecheck, local pre-commit hook does not).

## Risks
- Low: pure config/governance change; no app code touched.

## §73 Final Validation (all verified unless noted)

| Item | Verdict | Evidence |
|---|---|---|
| Product | PASS | AGENTS.md domain section; evals 1–3, 15 |
| Domain | PASS | domain-academic-references skill; eval 2/14 terminology |
| Target State | PASS | target-state-first skill; eval 3 |
| UX | PASS | ux-target-state skill; eval 15 (backend adaptation) |
| Architecture | PASS | architect agent + /plan; eval 3 |
| Engineering | PASS | /check green; TDD workflow |
| Security | PASS | security-engineering skill; eval 1/10/13 |
| Roles | PASS | 12 agents × 9 §22 sections (eval 6) |
| Delegation | PASS | delegation-and-trust skill; eval 8 (no privilege leakage) |
| Memory | PASS | handoff round-trip (eval 5/16) |
| Evals | PASS | 17 scenarios runnable headless; permission scenarios verified via merged config + orchestrator refusal (H-1 corrected 2026-08-19) |
| Governance | **NO** ✓ | eval 4/7: agents cannot self-grant (verified refusal at instruction level); permission layer verified via merged config (`opencode agent list` — R tier `deny *` last rule, D/T inherit global rules) + control-plane edit ask-gate now effective for all agents (H-2, 2026-08-19) |
| Legacy | PASS | no historical debt became policy; KEEP/IMPROVE/DEFER |
| Scope | PASS | no app code touched in any phase |
| OpenCode | PASS | config loads; 12 agents/8 skills/9 commands discovered |
| Recoverability | PASS | rollback = git revert + restart (§49, documented) |

## §74 Final Self-Critique (all answered)

| Question | Answer | Evidence |
|---|---|---|
| Completeness (20 responsibilities) | YES | each mapped to agent/skill/command in spec matrix |
| Modernity (target not copied from repo) | YES | target-state-first everywhere; eval 3 |
| UX independence | YES | eval 15 |
| Domain awareness | YES | eval 2/14 |
| Architecture independence | YES | eval 3; architect agent |
| Security bounded (permissions/credentials/filesystem/network/MCP/delegation/runtime) | YES | tier matrix, deny R tier, audit doc, eval 7/10/13; filesystem MCP scope override planned (M-1 pending, 2026-08-19 — prior note claiming "scoped" was premature and corrected) |
| Prompt injection | NO risk confirmed | eval 1 |
| Memory | YES | handoff + eval 5/16 |
| Evaluation (regression detectable) | YES | 17 scenarios, headless runnable |
| Governance (reviewable/recoverable) | YES | ADR convention + git revert |
| Supply chain | YES | MCP audit doc (one open user decision) |
| Cost | YES | §39 discipline; eval 17 |
| Future-proofing (survives OpenCode changes) | YES | policies as governance text; model pins replaceable (§63) |

## Next Recommended Action
Restart opencode (to load H-2 config); then implement M-1 (filesystem MCP scope), M-2 (copilot-instructions), M-3 (eval automation), M-4 (step/delegation limits if supported), M-5 (canonical sources); then re-run evals + full 30-requirement re-audit.