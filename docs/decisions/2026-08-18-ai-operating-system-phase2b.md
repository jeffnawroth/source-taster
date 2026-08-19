# ADR-0003: Skills & Commands for the AI Operating Model (Phase 2B)

> Status: Accepted
> Date: 2026-08-19

## Context

Master-prompt §56 requires a skill registry for recurring reasoning patterns; §57 requires only useful commands (no invented ones); §26 requires task decomposition in plans. Phase 2A delivered the role roster; 2B mechanizes the working methods those roles use. Spec `docs/superpowers/specs/2026-08-18-ai-operating-system-phase2.md` §5–§7 defines 7 skills, 3 commands, and the plan template.

## Decision

- Add 7 skills to `.opencode/skill/`: `target-state-first` (§2/3/8/10–14), `product-operating-model` (§4/7/16), `growth-operating-model` (§17), `ux-target-state` (§9), `security-engineering` (§19/20/37), `delegation-and-trust` (§24–27 incl. the six-stage §26 plan template), `boundaries-and-runtime` (§41–44/46: isolation policy, approved egress domains, credential rules, stop conditions, human oversight).
- Add 3 commands: `/product` (dispatches `pm`, approval gate), `/design` (dispatches `ux`+`ui`, approval gate), `/release` (read-only checklist, never executes — §50/§71).
- Extend `/plan` output with the §26 six-stage structure (Objective → Milestones → Dependencies → Verifiable Work Units → Evaluation → Integration).
- `/test` deliberately NOT added — already covered by `/check` (§57: do not invent commands).
- Skills are advisory process content, not permission overrides: no skill may weaken tier permissions or governance.

## Alternatives

- **Skills as code/plugins**: rejected — OpenCode skills (markdown) are the supported mechanism; plugins would add runtime complexity without benefit (§56).
- **Single mega-skill**: rejected — violates §56's per-pattern registry and would dilute relevance signals.
- **`/release` executing releases**: rejected — release is human-only (§46/§50); the command is a checklist.

## Consequences

- 8 skills + 9 commands discoverable; `/product` and `/design` route through D-tier agents with approval gates.
- Skills encode the master-prompt methods as reusable process knowledge; they must be reviewed if master-prompt changes.
- Rollback: `git revert` of this phase's commits + opencode restart.