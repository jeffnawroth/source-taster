# ADR-0021: AI Setup Modernization — Enforced Gates, Single-Sourced Skills, Invariant-Based Governance

> Status: proposed
> Date: 2026-08-25
> Amends: ADR-0008 (agent/skill mapping), ADR-0009 (drops the `postgres` MCP
> server), ADR-0010 (replaces the `apps/**`/`packages/**` design gate)

## Context

A full review of the AI setup was commissioned with an explicit instruction not
to treat the existing state as the target architecture. The setup at review
time was roughly 3,600 lines of configuration and documentation across three
runtime adapters, and it had four structural problems.

**1. The permission model was inverted.** `.claude/settings.json` ask-gated
`Edit`/`Write` on `apps/**` and `packages/**` — every routine application edit
raised a prompt. Meanwhile the genuinely dangerous operations that `AGENTS.md`
declares human-gated (commit, push, migrate, docker, install, release) had **no
technical control at all**; the Claude adapter documented this as its single
largest limitation. Friction sat on the safe common case and prose sat on the
dangerous one. The `apps/**` gate also never verified what it purported to
protect: it prompted on every edit regardless of whether a design artifact
existed, so it measured impatience, not approval.

**2. Skills were duplicated and had silently diverged.** Eight skills existed
twice, in `.claude/skills/` and `.opencode/skill/`. `opencode debug skill`
showed OpenCode resolving the name collisions **arbitrarily** — five from the
OpenCode tree and three from the Claude tree — so OpenCode sessions were
receiving skill bodies that described Claude Code's `disallowedTools` and
`.claude/settings.json` as their own mechanism. This was a live correctness
defect, not just redundancy.

**3. Governance checks policed prose shape.** `check-governance.mjs` asserted
that exactly 76 sections existed exactly once, that there were exactly 12 agent
files with exactly 9 `##` headings each, exactly 8 skills, and exactly 9
commands. None of these ever caught a defect; all of them made ordinary
editorial change break CI and made structural improvement require editing the
checker first. The checker had become a lock on the setup rather than a test of
it.

**4. Role personas outnumbered authority boundaries.** Twelve OpenCode agents
existed, of which nine (`pm`, `ux`, `ui`, `qa`, `data`, `growth`, `docs`,
`devops`, `researcher`) encoded a job title rather than a permission tier —
precisely what CORE §21 warns against. The Claude adapter had already reasoned
its way to 2 agents for the same repository and documented why.

Eleven candidate projects were researched (ECC, mattpocock/skills,
andrej-karpathy-skills, agency-agents, anthropics/skills, ui-ux-pro-max,
gstack, firecrawl, awesome-design-md, graphify, caveman). All are active and
well-starred. **None was adopted** — see Alternatives.

## Decision

### Enforce the human gates instead of describing them

Add `.claude/hooks/guard-bash.mjs`, a `PreToolUse` hook on `Bash`. It returns
`permissionDecision: "ask"` for the `AGENTS.md` human gates and `"deny"` for
irreversible operations (force-push, history rewrite, `reset --hard`, remote
branch deletion, `gh release`, `gh workflow run`, `--no-verify`, pipe-to-shell,
recursive force-delete). Verified against Claude Code 2.1.243, whose valid
decisions are `allow | deny | ask | defer`.

Three properties make this safe:

- It is **additive**. The hook only ever adds friction, so a pattern miss
  degrades to the existing permission flow, never to a bypass.
- It **judges every segment** of a compound command, so `pnpm lint && git push`
  is gated on the push.
- It **closes a per-tool gap**: permission rules are per-tool, so
  `Read(**/.env)` does nothing about `cat .env`. The hook denies shell access
  to secret paths while leaving `.env.example` readable.

It is not a shell parser and does not claim to be; an obfuscated command can
evade it. It raises the floor, it is not a sandbox.

### Remove the friction that bought nothing

Drop the `ask` rules on `Edit`/`Write` for `apps/**` and `packages/**` in both
`.claude/settings.json` and `opencode.json`. The design-gate *intent* moves to
where it can be applied with judgment — the `target-state-first` skill — with
the commit gate as the enforced backstop.

### Single-source the skills

Delete `.opencode/skill/`. OpenCode natively scans `.claude/skills/` (verified
with `opencode debug skill`), so one tree serves both runtimes. Skill bodies
become runtime-neutral about *mechanism* and defer to the adapter documents for
it, so neither runtime is told about the other's config keys.

Consolidate 8 skills to 5: `delegation-and-trust` merges into
`boundaries-and-runtime` (both describe how the agent system operates safely),
and `product-operating-model` + `ux-target-state` + `growth-operating-model`
merge into `product-and-ux`. Net: 16 files → 5.

### Test invariants, not prose

Rewrite `check-governance.mjs` to assert only what would be a real defect if
broken: secret deny rules, control-plane ask rules, the guard hook's registration
**and its actual decisions**, MCP pinning and absence of literal credentials,
workflow SHA pinning and permissions floors, CODEOWNERS coverage, skill-name
uniqueness and frontmatter/directory agreement, `§N` citations resolving, CORE
runtime-portability, and the `/v1/*` namespace. 278 checks → 117, with strictly
more real coverage: the guard-decision assertion is new, and 10 dedicated
regression tests now run in CI.

### Reduce the agent and command surface

OpenCode agents 12 → 3 (the read-only tier: `architect`, `reviewer`,
`security-reviewer`). Commands 9 → 4 (`check`, `plan`, `review`,
`security-review`); `ai-eval` duplicated `pnpm eval:ai`, `handoff` is superseded
by cross-session memory tooling, and `release` invited an agent into a
human-only operation.

## Alternatives considered and rejected

**Adopt ECC, gstack, agency-agents, or mattpocock/skills.** All are active and
credible. All are rejected for the same reason: they are *complete operating
systems* (ECC: 68 agents / 286 skills / 94 commands; agency-agents: 230+
agents; gstack: 23 skills plus binaries and its own browser). This repository
already has a coherent operating model that the maintainer wrote and
understands. Installing a second one would create exactly the redundancy,
rule conflict, and unowned surface area the review was asked to eliminate. The
*ideas* worth taking — runtime hooks as enforcement, a verify gate in CI — were
implemented directly, in ~140 lines that are readable and testable, rather than
imported as a dependency.

**caveman.** The skill half is harmless; the value is in the proxy, which
terminates and rewrites all provider traffic. That is a severe supply-chain and
confidentiality position for a BYOK product handling user API keys, under BSL
until 2030. Rejected on the trust boundary alone.

**graphify.** Genuinely interesting (deterministic tree-sitter code graph, local
extraction, `EXTRACTED` vs `INFERRED` edge labelling). Rejected as premature:
this is a ~6-workspace monorepo where `rg` and the existing structure docs
answer navigation questions today. Worth revisiting if the codebase doubles.

**firecrawl.** Overlaps native `WebSearch`/`WebFetch` plus `context7`, and adds
a hosted service and another credential. No identified gap.

**ui-ux-pro-max, awesome-design-md, anthropics/skills.** Already covered: the
user-level install has 8 UI skills, the `ui-skills` MCP, `create-design-md`, and
the Penpot MCP against real project designs. Adding more design guidance would
compete with what is there, not extend it.

**andrej-karpathy-skills.** A third-party `CLAUDE.md` of four coding principles
("simplicity first", "surgical changes"). Good advice, already covered by CORE
§12/§13 and `target-state-first`. Adding it would be a fifth voice saying the
same thing.

**Deleting the OpenCode runtime entirely.** Considered, and rejected on
evidence: OpenCode 1.18.22 is installed, its session database and logs were
written two days before this review, and its logs reference this project
extensively. It is a live tool, not an artifact.

**Deleting the CORE documents.** Considered. Rejected: they are read-on-demand,
not auto-loaded, so they cost maintenance rather than context, and they encode
the maintainer's actual engineering philosophy. The 148-line section *map* in
`ARCHITECTURE.md` was deleted instead — it duplicated every heading for no
benefit and was the thing the checker was policing.

## Consequences

- The human gates are enforced for the first time, and a regression in them
  fails CI rather than being discovered in production.
- Routine coding no longer prompts on every edit. This is a deliberate trade:
  less friction, and the design-gate discipline now depends on judgment plus the
  commit gate rather than on a prompt that did not verify anything.
- OpenCode sessions stop receiving Claude-specific skill content.
- Editing documentation no longer breaks CI, so the setup can evolve without an
  amendment to its own checker.
- Nine agent files and five commands are gone. If a specific role's prompt is
  missed in practice, restoring one is a small additive change — git history is
  the rollback path.
- **First-run environment setup is now a manual step.** The guard denies any
  Bash command touching a `.env` path, `cp .env.example .env` included, and
  `deny` has no approval path by design. This is intentional for a BYOK product
  whose `.env` files hold provider credentials, but it means an agent cannot
  bootstrap a fresh checkout's environment — the developer runs that one command
  themselves. The guard's message says so explicitly rather than reading as a
  malfunction.
- The `.env` and `.keystore` deny rules were extended to `Edit`/`Write`, not
  just `Read`. The previous adapter asserted that a `Read` deny implies the
  others; that was an inherited claim, never verified here, and permission rules
  are per-tool. The explicit rules cost nothing if the implication held and
  close a real hole if it did not.

## Residual risks

- The Bash guard is pattern-based; an obfuscated command can evade it.
- `penpot` MCP has no read-only scoping (Penpot issues one full read/write key
  per account). Unchanged by this ADR.
- Remote MCP endpoints (`context7`, `penpot`) cannot be pinned from this
  repository.
- **User-level exposure outside this repository, reported not remediated**:
  `~/.config/opencode/opencode.json` contains three plaintext long-lived
  credentials (a GitHub PAT, a Context7 API key, a Penpot token) and registers a
  `filesystem` MCP rooted at the entire home directory, plus two `@latest`
  servers. Any OpenCode session in any project can read that file. This
  repository's project config narrows `filesystem` for *this* project only. The
  credentials should be rotated and moved to environment variables; that is the
  user's machine, not this repository's control plane, so it is flagged rather
  than changed.
