# ADR-0005: Audit Remediation — Eval Integrity, Control-Plane Protection, Eval Gate, Recursion Caps, Canonical Sources

> Status: accepted
> Date: 2026-08-19

## Context

The independent audit (`docs/audits/2026-08-19-ai-operating-system-audit.md`) found:

- **H-1**: scenarios 4/7/10 were executed via `opencode run --agent <subagent>`, which OpenCode 1.18.18 resolves as a **fallback to the default build agent** — not a test of the role agents' permission layer. Additionally, headless task-tool dispatch was found to return **empty subagent results regardless of permissions** (a headless-CLI artifact), so behavioral permission claims must not rest on it.
- **H-2**: `AGENTS.md`, `opencode.json`, `.opencode/**` were technically editable by D/T-tier agents — their frontmatter `edit: allow` was merged **after** the global rules (last-match-wins), defeating any ask-gate.
- **M-1**: filesystem MCP had root `$HOME` (overbroad, §42).
- **M-2**: `.github/copilot-instructions.md` still documented the pre-`/v1` API layout.
- **M-3**: the eval suite was manual only; nothing gated AI-control-plane changes.
- **M-4**: no technical recursion/step caps on agents; §25/§39 instruction-level only.
- **M-5**: master prompt / AGENTS.md / skills / agent contracts restated the same §-numbered principles with no sync check.

## Decision

1. **H-1 — evidence integrity**: permission scenarios (4/7/10) are verified via **merged config** (`opencode agent list` / `opencode debug config`, deterministic, last-match-wins) plus interactive-TUI prompts; scenario 4 additionally verifies orchestrator-level refusal of self-escalation dispatches. All docs claiming headless behavioral proof of the permission layer were corrected (eval-scenarios.md, ai-eval-results.md, /ai-eval command, handoff, ADR-0002).
2. **H-2 — control-plane ask-gate**: `opencode.json` declares granular edit rules (`*`: allow; `AGENTS.md`, `opencode.json`, `.opencode/**`: ask). The `edit: allow` shorthand was **removed from all 8 D/T agent frontmatters** so they inherit the global rules; R tier keeps `edit: deny *`. Authorized governance changes remain possible via the ask-gate.
3. **M-1 — filesystem MCP scoped**: project `opencode.json` overrides the filesystem MCP with root = repository workspace (merged config verified).
4. **M-2 — single instruction source**: `copilot-instructions.md` updated to `/v1/*`; governance docs no longer contain stale `/api/*` references (regression-checked).
5. **M-3 — eval gate**: `evaluation/ai-system/check-governance.mjs` (dependency-free, deterministic) + `pnpm eval:ai`; CI job `ai-governance` in lint.yml. LLM scenarios stay on-demand via `/ai-eval` (headless subagent dispatch is unreliable — see H-1).
6. **M-4 — technical recursion/iteration caps**: `subagent_depth: 2` (hard nesting cap; default 1 would break the documented D-tier delegation chains) and `steps: 150` on all 12 role subagents. Primary `build` stays uncapped (long development sessions).
7. **M-5 — canonical sources**: AGENTS.md declares one canonical source per information class (master prompt = numbered principles; AGENTS.md = repo policy/terminology; skills = how-to; agents = role contracts; commands = procedures; memory = state). `check-governance.mjs` enforces §-reference resolution (every `§N` must resolve to a `# N.` section of the 76-§ master prompt), control-plane protection, recursion caps, `/v1/*` namespace.

## Alternatives

- **H-2**: full `deny` on control-plane files — rejected: would block legitimate user-authorized governance maintenance; ask-gate preserves it.
- **H-1**: keep task-tool dispatch as the documented permission test — rejected after the empty-result artifact was reproduced for both allowed writes and tool-free replies.
- **M-4**: `subagent_depth: 1` (default) — rejected: D-tier contracts document delegation (e.g. ux → ui, build → role → role); depth 2 is the minimal hard cap preserving documented delegation.
- **M-3**: hook-based eval gate on every commit — rejected as excessive; deterministic checks run in CI, LLM scenarios remain human-triggered.

## Consequences

- Permission-layer evidence is now honest: config-level (deterministic) + interactive prompts; no headless behavioral overclaims.
- Control-plane self-modification by agents is technically gated (ask) for all tiers; legit maintenance still possible.
- Regression protection: any future re-introduction of `edit: allow` shorthand, `/api/*` references, missing steps caps, or unresolved § refs fails CI.
- Restart required to load new config (permissions/config load at startup).