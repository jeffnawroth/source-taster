---
name: boundaries-and-runtime
description: Runtime boundaries — isolation policy, network egress domains, credential and filesystem rules, human oversight, stop conditions. Use when executing plans, making network requests, handling credentials, or deciding when to stop.
---

# Boundaries & Runtime

## Runtime isolation (§41)
- Policy: **isolated workspace** (git worktree) for plan execution + **restricted runtime** (human gates for commit/push/migrate/docker/pnpm install)
- NO OS sandboxing is claimed — this repo does not sandbox agent execution (§41: never claim sandboxing unless verified)

## Network egress (§43)
Approved domains for research activities (web access is `ask`/`deny` per tier):
`openalex.org`, `doi.org`, `crossref.org`, `api.semanticscholar.org`, `europepmc.org`, `ebi.ac.uk`, `arxiv.org`, `github.com`, `mcp.context7.com`, `sourcetaster.com`, `opencode.ai`
- Anything else: ask before fetching; if access is denied, stop (§45)
- Note: OpenCode 1.18.18 supports only flat deny/ask/allow per agent — this list is governance, not a technical filter

## Credentials & filesystem (§42)
- Secrets (`.keystore/`, `.env`, API keys) are never read for reporting, never logged, never committed
- File writes stay inside the workspace; `external_directory` access is gated (ask)
- MCP servers with overbroad roots must be reported to the user (global config = user decision)

## Human oversight (§46)
- commit/push/migrate/docker/release = human-gated (ask); release = human-only
- Stop conditions (§45): conflicting requirements, missing critical information, or permission-denied actions → STOP and report; never guess, never ratchet permissions