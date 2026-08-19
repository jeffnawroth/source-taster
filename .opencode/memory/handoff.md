# Handoff — AI Operating System Phase 2B

Updated: 2026-08-19

## Objective
Mechanize the complete master prompt (all 76 §§) in three phases. Phase 2B: §56 skills (7 new), §57 commands (3 new), §26 plan-template Task-Decomposition — the working methods for the 2A role roster.

## Current State
Phase 2B implementation complete; ADR-0003 + validation + handoff committed; phase review gate in progress.

## Completed Work
- 7 new skills in `.opencode/skill/` (8 total incl. domain-academic-references): `target-state-first` (§2/3/8/10–14, KEEP/IMPROVE/DEFER, evidence classes), `product-operating-model` (§4/7/16), `growth-operating-model` (§17, facts vs. assumptions), `ux-target-state` (§9, backend adaptation over UX degradation), `security-engineering` (§19/20/37, threat modeling, injection defense, supply chain), `delegation-and-trust` (§24–27, delegation rules + six-stage §26 plan template), `boundaries-and-runtime` (§41–44/46, isolation policy, approved egress domains, credential rules, stop conditions)
- 3 new commands in `.opencode/command/` (9 total): `/product` (dispatches `pm`, approval gate), `/design` (dispatches `ux`+`ui`, approval gate), `/release` (read-only checklist, never executes)
- `/plan` extended with the §26 six-stage structure (Objective → Milestones → Dependencies → Verifiable Work Units → Evaluation → Integration)
- `/test` deliberately NOT added — covered by `/check` (§57)
- ADR-0003 `docs/decisions/2026-08-18-ai-operating-system-phase2b.md` + README index row
- Commits on `feat-ai-operating-system-phase2b`: d83d4647 (7 skills), 346f9c89 (3 commands + plan template), 6c55992b (ADR-0003 + README + handoff), e7f41ef1 (eval re-run)

## Remaining Work
- Task 4 phase review gate: eval suite re-run (5 scenarios must stay PASS), review package, independent review
- Phase 2C: AGENTS.md updates (approved-domain policy, runtime-isolation statement, memory structure, context rules, stop conditions, human oversight, rollback, SWE note), MCP audit doc (filesystem `$HOME` root finding → user decision), eval expansion to ~12 scenarios, §73/§74 final validation, final merge

## Important Decisions
- Skills are advisory process content, NOT permission overrides — no skill weakens tier permissions or governance (verified: no permission-line changes in 2B diff)
- `/release` is a checklist only; release stays human-only (§46/§50)
- Worktree env note: `apps/extension/src/auto-imports.d.ts` is gitignored/generated — fresh worktrees need `pnpm --filter @source-taster/extension build:web` before typecheck (CI does build before typecheck; local pre-commit hook does not)

## Open Questions
None blocking.

## Known Constraints
- opencode config is loaded at startup — restart required after config changes
- Model IDs are runtime-specific; verify via `opencode models`
- Worktree install needs the generated auto-imports.d.ts for extension typecheck
- Headless `opencode run` auto-rejects bash permission requests — command smoke tests show checklist output but not bash execution

## Risks
- Low: pure config change; no app code touched

## Verification Status
- opencode debug config: loads without error
- Skill discovery: 8 skills present (`ls .opencode/skill/`), all with frontmatter
- Command discovery: 9 commands present (`ls .opencode/command/`)
- /release smoke test: checklist output produced (bash auto-rejected in headless mode, expected)
- Permission diff (main..HEAD): no permission-line changes
- /check headless: pending (Task 4)
- /ai-eval scenarios: pending (Task 4)

## Next Recommended Action
Complete Task 4 review gate (commit ADR-0003/handoff, run eval suite, independent review, merge 2B), then write phase 2C plan (AGENTS.md + boundaries + evals).