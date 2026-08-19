# ADR-0002: Full Role Roster for the AI Operating Model (Phase 2A)

> Status: accepted
> Date: 2026-08-18

## Context

Master-prompt §21 defines the target role architecture (PM, research, UX, UI, SWE, architect, QA, security, DevOps, data, growth, docs, reviewer). Phase 1 delivered 4 role agents and deferred the rest. The user approved full mechanization of all 76 master-prompt sections (spec `docs/superpowers/specs/2026-08-18-ai-operating-system-phase2.md`), starting with the complete role roster. §22 requires all roles to carry a 9-section contract (Mission, Responsibilities, Non-responsibilities, Inputs, Outputs, Permissions, Delegation, Escalation, Definition of done).

## Decision

- Add 8 new subagents: `pm`, `researcher`, `ux`, `ui`, `data`, `growth` (D tier: edit allow, bash deny, task allow, web ask) and `devops`, `docs` (T tier: edit allow, bash ask, task allow, web ask).
- Complete the §22 contract on the existing 4 agents (`architect`, `reviewer`, `security-reviewer`, `qa`) and add `webfetch/websearch: deny` to the R tier (read-only, no network — master prompt §43, "where supported").
- SWE remains the built-in primary agent — no duplicate agent (§54: don't duplicate capabilities OpenCode already provides); the SWE contract lives in AGENTS.md.
- Model strategy (§38/§59): R tier = `openai/gpt-5.5`; pm/devops/docs = `openai/gpt-5.4-mini`; researcher/ux/ui/data/growth = `opencode/deepseek-v4-flash-free`; swe/qa inherit session default. Pins are replaceable config, not architecture (§63).
- Tier matrix enforces §23 (Identity ≠ Authority): D-tier roles write documents but have no shell; all write roles delegate only with minimal context (§24).

## Alternatives

- **Full roster as primary agents**: rejected — headless `opencode run --agent <subagent>` falls back to the default build agent in OpenCode 1.18.18 (verified 2026-08-19), so role agents must run as subagents dispatched via the task tool, where their permission layer is enforced; subagent mode keeps permission enforcement.
- **One omnibus "product" agent**: rejected — violates §21 role separation and §33 evaluator independence; review quality would degrade.
- **No new agents, principle-only**: rejected by user decision — full mechanization required.

## Consequences

- 12 agents total (1 primary + 11 subagents); config surface grows by 8 files.
- Reviewers and architect are now also network-denied — no web access in evaluation roles.
- D-tier agents can write spec/design files directly — orchestrator must validate their outputs (§24).
- Commands `/product`, `/design`, `/release` (phase 2B) will consume these agents.
- Rollback: `git revert` of this phase's commits + opencode restart.
