# ADR-0008: Claude Code as a Third AI-OS Runtime Adapter

> Status: accepted
> Date: 2026-08-21

## Context

- Two runtime adapters exist today: OpenCode (technically-enforced permission
  engine, 12 agents / 8 skills / 9 commands, governance-checked) and GitHub
  Copilot (explicitly instruction-level only, no checked-in permission
  configuration).
- `docs/ai-os/ARCHITECTURE.md`'s Authority Model requires every adapter to
  implement the CORE without redefining it, and its Adapter Contract requires
  every adapter to distinguish technically-enforced controls from
  instruction-level policy for each requirement it addresses.
- Claude Code is already used as an interactive coding runtime in this
  repository (`claude --version` → 2.1.237) but has no adapter artifacts yet —
  only a generic `CLAUDE.md` produced by `/init`, not yet aligned with the
  AI-OS or with `AGENTS.md`.
- A capability analysis ("Claude Runtime Adapter Proposal") and a validated,
  file-by-file implementation plan established, with explicit evidence
  classes, which Claude Code mechanisms are technically enforced versus
  instruction-level versus unsupported.

Baseline evidence retained before this decision:

- `git diff --stat HEAD` against `AGENTS.md`, `docs/ai-os/**`, `.opencode/**`,
  `opencode.json`, `evaluation/ai-system/**`, and the Copilot files is empty —
  no drift since the prior runtime-agnostic AI-OS work (ADR-0006).
- `docs/ai-os/ARCHITECTURE.md`'s 76-section canonical map reserves §51–63
  specifically for the OpenCode adapter, a historical-preservation decision
  from ADR-0006, not a template every future adapter repeats. The Copilot
  adapter (`docs/ai-os/runtimes/copilot/`) already establishes the precedent
  of a numbered-section-free adapter: a capability-status table, a "Required
  Behavior" section, and a "Limitations" section.
- Official Claude Code documentation confirms: CLAUDE.md content is delivered
  as context, not enforced configuration; there is no native `AGENTS.md`
  support (the documented bridge is an `@AGENTS.md` import); custom
  `.claude/commands/*.md` files have been merged into skills
  (`.claude/commands/x.md` and `.claude/skills/x/SKILL.md` are equivalent);
  subagent `tools`/`disallowedTools` removal is unaffected by the parent
  session's permission mode, while a subagent's own `permissionMode` is
  overridden whenever the parent session runs `bypassPermissions`,
  `acceptEdits`, or `auto`.

## Decision

Adopt Claude Code as a third AI-OS runtime adapter, implementing the existing
CORE and `AGENTS.md` without redefining either, in this shape:

- The adapter is documented in `docs/ai-os/runtimes/claude/` (`README.md` +
  `implementation.md`), **shaped like the Copilot adapter** — a
  capability-status table distinguishing technically-enforced from
  instruction-level controls, a "Required Behavior" section, and a
  "Limitations" section — rather than claiming new numbered sections in
  `docs/ai-os/ARCHITECTURE.md`. §51–63 remain OpenCode's; a third adapter does
  not need its own numbered block to satisfy the Adapter Contract, and minting
  one would require an undiscussed renumbering decision this ADR does not
  make.
- `CLAUDE.md` is reorganized around an `@AGENTS.md` import rather than
  restating project/domain policy independently, so `AGENTS.md` remains the
  one file a human edits for Source Taster project/domain policy.
- OpenCode's 12 role agents map to **2** Claude subagents: `reviewer` and
  `security-reviewer`, both using hard `disallowedTools` removal
  (`Edit`/`Write`/`NotebookEdit`/`Bash`/`Agent`/`WebFetch`/`WebSearch`) for a
  technically-enforced, parent-mode-independent read-only guarantee — the
  property that specifically justifies subagent isolation for these two roles
  (independent review, CORE §33).
- `architect` is **deliberately not** promoted to a subagent by this decision.
  Its target-state-first / change-impact / ADR-draft methodology is carried by
  the `target-state-first` skill instead. Promoting it to an isolated subagent
  remains a small, additive option if isolated or parallel dispatch is later
  needed in practice — it is deferred, not rejected.
- The remaining 9 OpenCode agent roles (`pm`, `ux`, `ui`, `qa`, `data`,
  `growth`, `docs`, `devops`, `researcher`) get **no bespoke Claude files**.
  Three (`pm`, `ux`, `growth`) are already covered by the corresponding ported
  skill (`product-operating-model`, `ux-target-state`,
  `growth-operating-model`); the other six had no OpenCode skill counterpart
  either and existed specifically to give OpenCode's flatter default agent a
  forced persona and authority tier — Claude Code's native contextual skill
  retrieval plus `AGENTS.md` covers the same ground without a dedicated file.
- OpenCode's 8 skills map to **8** Claude skills (`.claude/skills/*/SKILL.md`),
  ported near-1:1 by content, since `SKILL.md` is the closest structural match
  between the two runtimes.
- OpenCode's 9 commands map to **0** separate Claude command files. Claude
  Code has merged its custom-command mechanism into skills; building 9
  command-shaped skills now would only match OpenCode's artifact count for its
  own sake. Command-equivalent skills (most likely candidates: `check`,
  `review`, `security-review`) are deferred until a concrete session need
  arises.
- `.claude/commands/` is intentionally not created — the mechanism it would use
  is the same as `.claude/skills/`, so a separate commands directory adds a
  redundant, legacy-only path with no new capability.
- `.mcp.json` is intentionally not created — Claude Code's built-in
  `Read`/`Write`/`Edit`/`Glob`/`Grep` tools already scope to the working
  directory (widened only via `--add-dir`), so porting OpenCode's
  workspace-scoped filesystem MCP server would add supply-chain surface (CORE
  §37/§58) with no functional gain.
- The existing OpenCode adapter (`.opencode/**`, `opencode.json`,
  `docs/ai-os/runtimes/opencode/**`) and the existing Copilot adapter
  (`.github/copilot-instructions.md`, `.github/COPILOT_ADAPTER.md`,
  `docs/ai-os/runtimes/copilot/**`) remain unchanged by this decision — adding
  a third runtime does not alter the first two.
- `docs/ai-os/core/**` remains the sole normative AI-OS source and
  `AGENTS.md` remains the sole Source Taster project-policy source; this
  decision only adds an implementation of both for a new runtime.

This ADR records the decision only. Implementation proceeds in the phased
sequence set out in the Claude Runtime Adapter Implementation Plan (adapter
documentation, `CLAUDE.md` integration, `.claude/settings.json`, the two
subagents, the eight skills, governance-checker extension, then acceptance
testing), with each phase independently reviewed and human-approved before the
next begins.

## Alternatives

- **Mirror OpenCode's artifact counts 1:1** (12 agents, 8 skills, 9 commands):
  rejected. Claude Code's mechanisms don't require it — most of OpenCode's
  role agents exist to compensate for a flatter default agent, and Claude
  Code's contextual skill retrieval already covers that need; matching counts
  for their own sake would add runtime-specific artifacts without a
  governance or capability reason.
- **Give the Claude adapter its own numbered section block appended after the
  existing 76 sections** in `docs/ai-os/ARCHITECTURE.md`: rejected. §51–63 were assigned to
  OpenCode specifically to preserve the original monolithic master-prompt's
  section identifiers (ADR-0006); a third adapter inventing new numbers is an
  undiscussed CORE-adjacent change this decision does not make, and the
  Copilot adapter already demonstrates a numbered-section-free adapter
  satisfies the Adapter Contract.
- **Treat `CLAUDE.md` as an independent project-policy source for Claude
  sessions, separate from `AGENTS.md`**: rejected. This would create a second,
  divergence-prone copy of project/domain policy, contrary to CORE §40
  (Context Architecture: avoid duplication) and the Adapter Contract's
  prohibition on adapters or their artifacts becoming competing governance
  sources.
- **Add a filesystem MCP server matching OpenCode's**: rejected. Claude Code's
  native file tools already provide the equivalent boundary; adding the MCP
  server would be an unjustified supply-chain addition.
- **Keep `.claude/commands/` alongside `.claude/skills/` for parity with
  OpenCode's separate agent/skill/command split**: rejected. Claude Code has
  already merged the two mechanisms; keeping a separate commands directory
  would maintain a legacy path with no capability the skill mechanism doesn't
  already provide.

## Consequences

- A concrete, phased implementation plan (adapter docs → `CLAUDE.md` →
  `.claude/settings.json` → subagents → skills → governance-checker extension
  → acceptance tests) can now proceed under this decision, each phase
  independently reviewable and human-approved.
- `evaluation/ai-system/check-governance.mjs` will need additive
  Claude-specific checks in a later phase; this ADR does not itself change the
  checker.
- `docs/ai-os/ARCHITECTURE.md`'s Source Boundaries table will need one new row
  pointing at the Claude implementation doc in a later phase; the 76-section
  canonical map itself is not altered by this decision.
- Two governance gaps specific to Claude Code are accepted as known
  limitations to be documented honestly in the Claude adapter rather than
  resolved by weakening the CORE: no configured network-domain allowlist
  (the same limitation OpenCode already has) and Claude's autonomous,
  unreviewed auto-memory mechanism (to be mitigated procedurally, by disabling
  it at the project level in a later phase, not by a CORE change).
- OpenCode and Copilot behavior, configuration, and adapter documentation are
  unaffected by this decision.
