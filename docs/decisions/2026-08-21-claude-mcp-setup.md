# ADR-0009: Claude Code MCP Setup — Context7, Playwright, PostgreSQL, Penpot

> Status: accepted
> Date: 2026-08-21

## Context

- ADR-0008 adopted Claude Code as a third AI-OS runtime adapter but deliberately
  did not create `.mcp.json`, reasoning specifically about the OpenCode
  `filesystem` MCP server: Claude's native `Read`/`Write`/`Edit`/`Glob`/`Grep`
  tools already cover that purpose, so porting it would add supply-chain
  surface (CORE §37/§58) with no functional gain. That reasoning was never
  extended to any other OpenCode MCP server.
- OpenCode has seven MCP servers configured globally
  (`~/.config/opencode/opencode.json`, outside this repository):
  `chrome-devtools`, `context7`, `exa`, `filesystem`, `github`, `penpot`,
  `playwright`. The goal for Claude Code is explicitly **not** a 1:1 port —
  each candidate must clear an independent bar: does it close a real
  capability gap native Claude Code tools don't already cover, for a concrete,
  existing step in this project's workflow?
- The global OpenCode config was read (read-only, outside the repo) to verify
  real server configurations rather than inventing them. It confirmed:
  - `context7` and `playwright` use the expected official upstream servers
    (`https://mcp.context7.com/mcp`; `npx @playwright/mcp@latest`).
  - `penpot` points at `https://design.penpot.app/mcp/stream?userToken=<key>`
    — Penpot's own official, hosted Cloud MCP endpoint (verified against
    `help.penpot.app/mcp/`), **not** the archived, self-hosted
    `penpot/penpot-mcp` GitHub project (now folded into `penpot/penpot`'s
    `/mcp` directory) that this repository's prior audit had assumed.
  - `filesystem` is globally rooted at the user's entire home directory
    (`/Users/jeffnawroth`), not scoped to any project — a live confirmation of
    the over-broad-root risk this repository's own prior MCP supply-chain
    audit (`docs/superpowers/specs/2026-08-18-mcp-supply-chain-audit.md`) had
    already flagged for the `filesystem` server. No repository-side action
    follows from this (it is the user's global config, a user decision), but
    it further supports not adopting `filesystem` for Claude sessions.
  - No secrets, keys, or tokens from that global config were copied into this
    repository or into any Claude configuration file.
- PostgreSQL was newly evaluated for this project (it was not present in
  OpenCode's config at all): a real, central project component
  (`docker-compose.yml`, Drizzle ORM, `apps/api/src/db/`), with a concrete use
  case (debugging, schema inspection, read queries during implementation and
  checks) that native Claude Code tools cannot address.

## Decision

Adopt exactly four project-scoped MCP servers for Claude Code, committed in
`.mcp.json` at the repository root, containing only `${VAR}`-style environment
variable references — never literal credentials:

1. **`context7`** — `upstash/context7`'s official remote server
   (`https://mcp.context7.com/mcp`), for version-accurate library/framework
   documentation. Started **without** an API key: the server works
   anonymously (a key only raises rate limits, per its own documentation);
   `mcp.context7.com` is already an approved research domain in `AGENTS.md`.
2. **`playwright`** — Microsoft's official `@playwright/mcp` server, run
   locally via `npx -y @playwright/mcp@latest` (stdio, no credentials), for
   programmatic, CI-style browser automation distinct from the interactive
   `claude-in-chrome` integration.
3. **`postgres`** — `crystaldba/postgres-mcp` (actively maintained; the
   original `@modelcontextprotocol/server-postgres` reference server is
   archived/unmaintained), run via `docker run … --access-mode=restricted`,
   which rejects write/DDL statements at the SQL-parser level. The
   `DATABASE_URI` env var it receives is deliberately named `MCP_POSTGRES_URI`
   in `.mcp.json`, distinct from the API's own `DATABASE_URL`, and is intended
   to hold a **dedicated, read-only** database role's connection string (see
   Security below), not the application's read-write role.
4. **`penpot`** — Penpot's own official, hosted Cloud MCP endpoint
   (`https://design.penpot.app/mcp/stream?userToken=${PENPOT_MCP_KEY}`),
   giving Claude read access to the project's actual Penpot designs — the
   only way to ground design-related work in the real design system instead
   of an invented one.

Four OpenCode MCP servers were evaluated independently and **rejected** for
Claude Code:

- **`filesystem`** — Claude's built-in `Read`/`Write`/`Edit`/`Glob`/`Grep`
  already provide full functional parity, scoped to the working directory
  (`--add-dir` to widen); confirmed further by OpenCode's own global instance
  being scoped to the entire home directory, a broader root than this project
  would accept even if ported.
- **`github`** — the `gh` CLI via `Bash` is already this repository's
  established, documented GitHub access path (issues, PRs, repo, Actions); a
  GitHub MCP would duplicate it with a second, separately-scoped credential
  and no functional gain.
- **`exa`** — native `WebSearch`/`WebFetch` already cover general web
  research; Exa's differentiation (semantic/agent-oriented search) is a
  quality difference, not a capability gap.
- **`chrome-devtools`** — the native `claude-in-chrome` integration already
  covers this adapter's current browser-verification needs (clicks, console
  logs, screenshots); no concrete workflow step today needs
  `chrome-devtools-mcp`'s deeper DevTools-protocol features (performance
  tracing, low-level network inspection).

### Security / permission model

- **No secrets in the repository.** `.mcp.json` contains only `${VAR}`
  references; actual values live exclusively in each developer's local shell
  environment, never committed, never logged.
- **Technically enforced approval.** Claude Code requires interactive,
  per-server approval for project-scoped `.mcp.json` servers before first
  connection (`⏸ Pending approval` in `claude mcp list`/`claude mcp get`),
  independent of permission mode — a real, additional technically-enforced
  control this adapter did not have before.
- **PostgreSQL** gets two independent restrictions: `--access-mode=restricted`
  at the tool level (blocks INSERT/UPDATE/DELETE/DDL at the parser level) plus
  a dedicated read-only database role (`sourcetaster_ro`) at the database
  level. Creating that role is a database-schema change and is human-gated
  per `AGENTS.md`; this ADR ships the proposed SQL for manual execution, it is
  not run by Claude.
- **Penpot has no technical read-only scoping.** Penpot issues one MCP key
  per account with full read/write capability — there is no read-only key
  variant, and Claude and OpenCode necessarily share the same key (Penpot
  allows only one active key per account; regenerating one revokes the
  other). This is a **deliberately accepted residual risk**, not a gap this
  ADR conceals: the mitigation today is instruction-level only (start with
  read prompts), pending the separate Design → Human Approval → Implementation
  workflow decision, which is explicitly out of scope for this ADR.
- **`context7`/`playwright`** are low-risk by construction: pure
  documentation retrieval and data-access-free browser automation
  respectively.
- No new `.claude/settings.json` rules were required — none of the four
  servers expose an action that needs a new `allow`/`ask`/`deny` rule beyond
  the protections already built into the servers themselves.

### Relationship to ADR-0008

ADR-0008 is **not rewritten**. Its `.mcp.json` statement was reasoned
specifically through the `filesystem` server and remains correct for that
server. This ADR does not reverse that reasoning — `filesystem` is
independently re-evaluated here and rejected again, for the same underlying
reason plus new evidence (the confirmed home-directory root). This ADR adds
what ADR-0008 explicitly left for later: an evaluation of the other OpenCode
MCP servers and PostgreSQL, on their own merits.

## Alternatives

- **Mirror OpenCode's seven MCP servers 1:1**: rejected. Contradicts the
  explicit goal of a curated, project-specific MCP set; `filesystem`,
  `github`, `exa`, and `chrome-devtools` each have a native Claude Code
  equivalent that already covers today's concrete workflow, so porting them
  would only add supply-chain surface (CORE §37) without capability gain.
- **Configure no MCP servers at all**, extending ADR-0008's original
  `filesystem` reasoning to every server: rejected. Context7, Playwright,
  PostgreSQL, and Penpot each close a real, verified capability gap (versioned
  library docs, programmatic browser automation, database access, design-data
  access) that no native Claude Code tool provides.
- **Adopt only a subset of the four** (e.g. skip Penpot until the design
  workflow is defined): considered, but rejected for this step — Penpot as a
  read-access design *data source* is independently useful now (the design
  workflow / approval-gate question is a separate, later decision this ADR
  does not make; see Consequences).
- **Reuse the application's existing `DATABASE_URL`/role for the PostgreSQL
  MCP** instead of a dedicated role: rejected as the primary approach.
  Read-write application credentials for an AI-assisted debugging tool
  violate least privilege (CORE §42/§44); `--access-mode=restricted` alone is
  kept as a second-layer mitigation while the dedicated role is set up.

## Consequences

- Claude Code sessions gain: version-accurate library/framework documentation
  (Context7), programmatic/CI-style browser automation (Playwright),
  controlled read access to the PostgreSQL database (subject to the manual
  role setup below), and read access to the project's real Penpot designs.
- Four new external MCP dependencies are introduced, each with its own
  update/maintenance and trust surface (CORE §37): `upstash/context7`
  (remote, Upstash-operated), `microsoft/playwright-mcp` (local, npm-fetched
  on each run via `@latest`), `crystaldba/postgres-mcp` (local, Docker image,
  `crystaldba`-maintained), and Penpot's own hosted MCP endpoint (remote,
  Penpot-operated).
- Until the dedicated `sourcetaster_ro` PostgreSQL role is created (a manual,
  human-gated step this ADR does not execute), the `postgres` MCP server has
  no working `MCP_POSTGRES_URI` and will not connect — `--access-mode=restricted`
  is not a substitute for that role, only a second layer once it exists.
- The Penpot MCP's lack of read-only scoping is a standing, documented risk
  until the separate Design → Human Approval → Implementation workflow
  decision (explicitly not made by this ADR) defines a process-level
  mitigation.
- `docs/ai-os/runtimes/claude/implementation.md` and
  `.claude/skills/boundaries-and-runtime/SKILL.md` are updated alongside this
  ADR to stop claiming no MCP servers exist for Claude sessions, and to
  describe the four servers' actual scope and residual risks accurately.
- ADR-0008, ADR-0003, and ADR-0007 are unaffected and unmodified by this
  decision.
