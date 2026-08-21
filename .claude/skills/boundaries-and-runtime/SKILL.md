---
name: boundaries-and-runtime
description: Runtime boundaries — isolation policy, network egress domains, credential and filesystem rules, human oversight, stop conditions. Use when executing plans, making network requests, handling credentials, or deciding when to stop.
---

# Boundaries & Runtime

Canonical principles: `docs/ai-os/core/governance-and-audit.md`; the details
below describe the current Source Taster Claude Code implementation.

## Runtime isolation (§41)
- No repo-committed isolated-workspace policy is configured for Claude sessions in this repository; Claude's default filesystem scope is the working directory, widened only via `--add-dir`. Subagents may individually request `isolation: worktree` (a documented Claude Code mechanism), but `reviewer`/`security-reviewer` do not use it — hard tool removal is their isolation.
- NO OS sandboxing is claimed — this repo does not verify sandboxed agent execution for Claude sessions (§41: never claim sandboxing unless verified)

## Network egress (§43)
Approved research domains are listed in `AGENTS.md` ("Research sources"); Claude Code has no configured network-domain allowlist mechanism, the same limitation the OpenCode adapter already documents for itself:
- Anything else: ask before fetching; if access is denied, stop (§45)
- Note: this list is governance, not a technical filter — no `.claude/settings.json` rule can encode a domain allowlist

## Credentials & filesystem (§42)
- Secrets (`.keystore/`, `.env`, API keys) are never read for reporting, never logged, never committed
- `.claude/settings.json` denies `Read(.keystore/**)`, `Read(.env)`, `Read(apps/api/.env)` — a `Read` deny rule also blocks `Edit`/`Write` on the same path, so these paths cannot be created or overwritten either
- MCP servers with overbroad roots must be reported to the user (no MCP servers are configured in this repository's Claude settings)

## Human oversight (§46)
- commit/push/migrate/docker/release = human-gated by project policy (`AGENTS.md`); release = human-only. This is currently policy-level for Claude sessions: `.claude/settings.json` ask-gates control-plane file edits (`AGENTS.md`/`CLAUDE.md`/`docs/ai-os/**`/`.claude/**`) but does not yet have an explicit, mode-independent rule for these specific shell commands — see Limitations in `docs/ai-os/runtimes/claude/implementation.md`
- Stop conditions (§45): conflicting requirements, missing critical information, or permission-denied actions → STOP and report; never guess, never ratchet permissions
