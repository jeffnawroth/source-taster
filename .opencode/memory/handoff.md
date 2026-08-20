# Handoff — Runtime-Agnostic AI-OS Migration

Updated: 2026-08-19

## Objective

Separate the Source Taster AI Operating System into a runtime-neutral CORE,
project/domain policy, and runtime adapters without weakening the existing
OpenCode controls.

## Current State

Migration complete and statically validated. `docs/ai-os/core/` is the sole
normative AI-OS source; the OpenCode and Copilot adapters document implementation
and limitations. `.opencode/bootstrap.md` is a bootstrap only. Existing
OpenCode configuration remains unchanged.

## Completed Work

- Added ADR-0006 with baseline evidence and the control-plane decision.
- Added a 76-section canonical migration map and four runtime-neutral CORE
  documents.
- Added OpenCode and Copilot adapters with explicit enforcement-status tables.
- Converted the OpenCode master prompt and Copilot pointer into non-normative
  discovery artifacts.
- Preserved project/domain authority in `AGENTS.md` and corrected active README
  API paths to `/v1/*`.
- Added static source-graph, portability, skill-enumeration, reference, and
  active-document namespace checks.
- Verified lint, typecheck, tests, static governance checks, `pnpm eval:ai`,
  and discovery of all 12 OpenCode subagents.

## Remaining Work

- Restart OpenCode before relying on the changed bootstrap in a new session.
- Perform interactive TUI verification of control-plane ask prompts, R-tier
  denials, and skill/command discovery. Headless subagent dispatch remains
  inconclusive for permission behavior.

## Important Decisions

- The CORE owns sections 1-50 and 64-76 except evaluation sections 31-36 and
  73-74; the OpenCode adapter owns sections 51-63.
- Runtime isolation, filesystem, network, credential, human-oversight, and
  rollback rules are runtime-neutral requirements. Adapters state their actual
  enforcement level.
- Copilot is documented as instruction-level where this repository has no
  evidenced technical enforcement.
- Historical ADRs, audits, plans, and AI-evaluation results remain evidence and
  are not rewritten as current policy.

## Known Constraints

- OpenCode 1.18.18 has no `skill list` or `command list` CLI command; verify
  those through the interactive runtime and repository artifacts.
- The approved-domain list is governance policy, not a technical domain filter.
- No OS sandboxing is claimed; isolation is an isolated workspace and restricted
  runtime process.

## Risks

- Low: this migration changes governance documentation and static validation,
  not application code or the OpenCode permission/model configuration.

## Verification Status

- `pnpm lint`: PASS
- `pnpm typecheck`: PASS
- `pnpm test`: PASS
- `node evaluation/ai-system/check-governance.mjs`: PASS
- `pnpm eval:ai`: PASS
- `opencode agent list`: 12 project subagents discovered

## Next Recommended Action

Perform the interactive OpenCode verification after restart, then review and
commit the migration through the human-gated control-plane workflow.
