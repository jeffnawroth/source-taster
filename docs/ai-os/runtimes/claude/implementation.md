# Claude Code Implementation

The canonical Claude Code adapter for the AI-OS CORE (`../../core/`) and Source
Taster project policy (`AGENTS.md`). It does not redefine either.

Every row below separates three things that are routinely conflated:

1. **Mechanism** — what the runtime can do, independent of this repository.
2. **Evidence class** — `ENFORCED` (the runtime blocks it), `INSTRUCTION-LEVEL`
   (context the model tries to follow), or `NOT SUPPORTED`.
3. **Status here** — what this repository has actually configured.

Verified against Claude Code 2.1.243.

## Capability status

| Core area | Mechanism | Evidence class | Status here |
|---|---|---|---|
| Project/domain policy | `@AGENTS.md` import at the top of `CLAUDE.md` | **INSTRUCTION-LEVEL** — Claude Code's own docs call this "context, not enforced configuration" | Configured. `CLAUDE.md`'s first line is `@AGENTS.md`; asserted by the governance checker |
| Control-plane protection | `.claude/settings.json` `permissions.{allow,ask,deny}`, resolved in order hooks → deny → ask → mode → allow | **ENFORCED** for rules resolving to `deny` or `ask` | Configured. `ask` on `AGENTS.md`, `CLAUDE.md`, `docs/ai-os/**`, `.claude/**`, `.opencode/**`, `opencode.json`, `.mcp.json`, `.github/workflows/**`, `CODEOWNERS` |
| **Human approval gates** | `PreToolUse` hook returning `permissionDecision: "ask"` / `"deny"` **plus** a settings.json content-matching `ask` rule | **ENFORCED, with two distinct strengths** — confirmed against official docs (`code.claude.com/docs/en/permissions#extend-permissions-with-hooks`, `.../permission-modes#eliminate-prompts-with-auto-mode`, `.../permission-modes#actions-no-mode-auto-approves`, fetched directly 2026-08-27), not inferred from a single live test. A hook `deny` is unconditional in every mode including `bypassPermissions` (doc-quoted: "Deny rules block in every mode, including bypassPermissions"; also verified live, repeatedly). A hook `ask` "forces a prompt" — but in `auto` mode, "a classifier reviews actions instead of you" for anything that would otherwise prompt, so hook-`ask` is satisfied by classifier review, not a human dialog, specifically in that mode. A **settings.json content-matching `ask` rule** (e.g. `Bash(git push *)`) is different and stronger: it "falls back to a permission prompt" and is explicitly listed under "Actions no mode auto-approves" — never classifier-substituted, in any mode, and confirmed to fail *closed* (not open) under `dontAsk` mode | Configured. `.claude/hooks/guard-bash.mjs` denies force-push, history rewrite, `reset --hard`, remote branch deletion, `gh release`, `gh workflow run`, pipe-to-shell, recursive force-delete, `--no-verify`, git-hooks bypasses (`core.hooksPath`, `SKIP_SIMPLE_GIT_HOOKS=1`), destructive SQL against Postgres, `sudo git push` (the one shape a settings ask-rule's wrapper-strip list can't reach), and a staged-diff secret scan escalating a gated commit from `ask` to `deny`. Bare `git push` is hook-`ask` **plus** a settings.json `Bash(git push *)` ask rule (the actual binding guarantee — added 2026-08-27, replacing a 2026-08-26 unconditional-deny escalation that also blocked the human's own ability to approve a push through the agent, which the security goal never called for). `git commit`/`git merge`/docker/install/migrate/deploy remain hook-`ask` only — real protection under those specifically requires an interactive/confirming session mode, or an equivalent settings.json content rule if that guarantee is ever needed for one of them too. 20 regression test blocks in `guard-bash.test.mjs` (up from 10) plus scratch-repo end-to-end tests exercising the git integration and the anchoring fix directly, run by CI and `pnpm eval:ai` |
| Secret boundary | `permissions.deny` on file tools **plus** the Bash guard | **ENFORCED** on both paths | Configured. Deny rules cover `.keystore/**`, `.env` variants, `*.pem/key/p12/pfx`; the guard closes the per-tool gap where `Read(**/.env)` does nothing about `cat .env`, and additionally scans a gated commit's staged diff for high-confidence secret shapes (this project's own key prefix plus its actual BYOK providers) before letting it through as `ask`. `.env.example` stays readable on purpose |
| Independent review | `.claude/agents/*.md` `disallowedTools` | **ENFORCED** — structural tool removal, unaffected by the parent session's permission mode | Configured. `reviewer` and `security-reviewer` have `Edit`/`Write`/`NotebookEdit`/`Bash`/`Agent`/`WebFetch`/`WebSearch` removed. `reviewer` additionally carries a scoped 6-item smell checklist and an explicit two-lens (spec vs. engineering-standards) review framing (2026-08-26) |
| Specialist knowledge | `.claude/skills/*/SKILL.md` | **INSTRUCTION-LEVEL** — skill bodies are context | Configured. Nine skills, single-sourced (OpenCode reads the same directory, confirmed via `opencode debug skill`) |
| MCP server approval | Project `.mcp.json` servers need explicit per-server approval on first connection | **ENFORCED** | Configured. Three servers: `context7`, `playwright` (pinned `@0.0.79`), `penpot` |
| Filesystem scope | cwd by default, widened only via `--add-dir` | **ENFORCED** for the boundary; **not OS isolation** | Baseline runtime behavior, narrowed by the deny rules above |
| Network egress allowlist | none exists | **NOT SUPPORTED** | `AGENTS.md`'s approved-domain list is policy only, on every runtime here |
| Delegation depth cap | `CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH` (default 3) | **ENFORCED**, but host/environment configuration | Not committed by this repository — unlike OpenCode's `subagent_depth`, this cannot live in version control |
| Auto-memory containment | `autoMemoryEnabled: false` | **ENFORCED** | Configured |
| Control-plane ownership | `.github/CODEOWNERS` | **PROCESS-LEVEL** — requests review, does not block merge (`require_code_owner_reviews` is off; a single owner plus `enforce_admins` would deadlock the maintainer's own PRs) | Configured, coverage asserted by the checker |
| Governance regression gate | `check-governance.mjs` + `guard-bash.test.mjs` in CI | **ENFORCED** deterministic CI evidence | Configured. 37 distinct `check()` assertions across 6 categories (some run once per skill/agent/workflow file, producing more output lines than assertion classes — cite the category count, not the line count) + 20 test blocks in `guard-bash.test.mjs` covering 24 `guardCases` decision checks, dependency-free |

## The `@AGENTS.md` model

Claude Code reads `CLAUDE.md`, not `AGENTS.md`. A single `@AGENTS.md` import at
the top of `CLAUDE.md` expands the project policy into every session, so
`AGENTS.md` stays the one file a human edits and `CLAUDE.md` keeps only
Claude-specific notes. The bridge depends on that import line surviving — the
checker asserts it.

**`CLAUDE.md` and skill bodies are never enforcement**, however they are
written. Every enforcement claim in this document traces to
`.claude/settings.json`, a hook, or `disallowedTools` — never to prose.

## Deliberate absences

- **`.claude/commands/`** — Claude Code merged commands into skills; a
  parallel directory would duplicate the mechanism for no capability.
- **A `PostToolUse` formatting hook** — the `simple-git-hooks` pre-commit hook
  already runs `lint-staged`. Adding ESLint to every single edit would tax
  every write for feedback that arrives at commit time anyway.
- **`filesystem`, `github`, `exa`, `chrome-devtools` MCP servers** — the
  built-in file tools are already cwd-scoped, `gh` via Bash is the established
  GitHub path, and native `WebSearch`/`WebFetch` plus `context7` cover
  research. Each would add a credential or a broader root for no new capability.
- **A `postgres` MCP server** — was configured but disabled in local settings
  and never pointed at the read-only role its ADR specified. Removed as dead
  configuration rather than left as a decorative entry; the ADR retains the
  setup SQL if it is ever wanted.
- **A `Stop`-hook verify-gate** (block turn-end until tests pass, the pattern
  gstack calls `verify-gate`) — investigated twice (2026-08-26, 2026-08-27)
  and deliberately not implemented either time, on different grounds each
  time (not "still too complex" repeated unchanged — see Limitations below
  for the current, more specific reasoning; ADR-0022 and ADR-0023 record both
  passes).

## Limitations

These are properties of the runtime, not pending work:

- **No network-egress allowlist exists.** The approved-domain list is policy.
- **No OS-level sandboxing is claimed.** The filesystem boundary is a
  permission boundary, not a container or VM.
- **The subagent depth cap is environment configuration**, so it cannot be
  committed here the way OpenCode's can.
- **Headless (`-p`) runs silently ignore an unparseable settings file** —
  verified first-hand. A headless run succeeding is not evidence that settings
  loaded.
- **The Bash guard is pattern-based.** It is an additive deny/ask layer over
  the existing allowlist, so a pattern miss degrades to the normal permission
  flow rather than to a bypass — but it is not a shell parser, and a
  sufficiently obfuscated command can evade it. It raises the floor; it is not
  a sandbox.
- **The guard fails open by design.** A crash inside it prints
  `guard-bash: FAILED OPEN` to stderr and exits 0, so a broken guard cannot
  break every Bash call. `check-governance.mjs` syntax-checks both hook files
  in CI, and a broken file fails the checker (which imports the guard) and
  `node --test` — both verified by deliberately corrupting the file. The
  residual gap is a runtime crash on a specific input, which is noisy but not
  blocking.
- **A hook `ask` decision is satisfied by classifier review, not a human
  dialog, in `auto` permission mode — doc-confirmed, not just inferred from
  one test.** Official docs (2026-08-27, cited above): a `PreToolUse` hook
  `ask` "forces a prompt," and in `auto` mode "a classifier reviews actions
  instead of you" for anything that would otherwise prompt. A 2026-08-26 live
  test (`git commit --dry-run` executing with no pause under this session's
  own auto-accepting mode) is consistent with this and was the original
  trigger for investigating it, but that test alone was confounded — a
  second, independent-seeming gate (the harness's auto-mode classifier) was
  also active — and an earlier version of this document overstated the
  finding as "confirmed" on that basis alone. The doc citations resolve the
  mechanism directly: the classifier the test's `ask` decision routed through
  *is* the documented `auto`-mode substitution path, not an unrelated
  interfering layer. What remains genuinely untested: behavior in
  `default`/Manual mode, never exercised this session, and whether a second
  hook-`ask`/settings-`ask` double-prompt occurs when both fire on the same
  command (low risk per the docs' ordering, not directly confirmed).
- **A settings.json content-matching `ask` rule is the guarantee to reach
  for when a hook-`ask` isn't enough — used for `git push`, not yet applied
  elsewhere.** Doc-confirmed: such a rule "falls back to a permission
  prompt" and is listed under "Actions no mode auto-approves," so it holds
  even in `auto` mode and fails closed (denies, doesn't silently allow) under
  `dontAsk`. `deny` still blocks in every mode including `bypassPermissions`,
  with no documented interactive override — so once a command is hook-`deny`,
  the human operating this session likely cannot approve it through the
  agent either, only from a separate terminal or by editing the pattern.
  This is why `git push` moved from an unconditional `deny` (2026-08-26,
  ADR-0022) back to `ask` plus the new settings rule (2026-08-27, ADR-0023):
  the deny escalation solved the original safety gap by removing the human's
  own approval path too, which the security goal never required. `sudo git
  push` is the one shape the settings rule can't reach (`sudo` isn't in
  Claude Code's Bash-rule wrapper-strip list) and stays hook-`deny`.
- **The Bash guard's command-position patterns are anchored to segment-start
  as of 2026-08-27, after a live false positive.** A read-only diagnostic
  command containing the text `git push` inside an `echo` string was denied
  outright — the pre-anchoring pattern matched the substring anywhere in the
  segment, not just an actual invocation. Patterns identifying *which
  command is being invoked* (git/gh/docker/pnpm verbs) are now anchored;
  patterns that must catch a dangerous *token* regardless of position
  (`.env`, `.keystore`, secret-material names, `rm -rf`, `chmod 777`,
  `core.hooksPath`) deliberately stay unanchored, and so keep the same
  false-positive exposure on prose/echo/grep text as before — an accepted
  tradeoff, not an oversight, since under-blocking a real instance of these
  is worse than over-blocking a rare diagnostic string. `DENY_WHOLE` entries
  (`curl|sh`, `SKIP_SIMPLE_GIT_HOOKS=1`) can't be anchored at all — the
  danger is the whole-command composition, not a fixed position — and keep
  the same tradeoff for the same reason.
- **`penpot` has no read-only scoping.** Penpot issues one full read/write key
  per account. Documented residual risk.
- **No `Stop`-hook loop-prevention primitive exists, and two further facts
  needed to build a self-contained replacement are undocumented, not just
  unbuilt.** Verified directly against Claude Code's official hooks
  documentation (2026-08-26, re-confirmed 2026-08-27): the `Stop` event has
  no `stop_hook_active` field and no built-in attempt counter. A 2026-08-27
  design pass explored a self-built, trust-ledger-free alternative (a
  session-scoped "dirty" flag set by mutating tool calls, cleared by a
  recognized verify command, gating `Stop` with a hard attempt ceiling) —
  reconsidered specifically to test whether the missing primitive was now
  buildable, not deferred by default. Two facts the design depends on turned
  out to be genuinely undocumented in the current hooks reference, not merely
  unconfirmed: whether `session_id` is shared or distinct for a subagent
  versus its parent session (a real risk given this repo's own subagent use —
  a subagent's edit could dirty the parent's flag or vice versa), and the
  exact `tool_response` shape on `PostToolUse` for a Bash call (whether
  success/failure is exposed at all). On top of that, the design's own
  trigger condition has a structural flaw independent of those two facts:
  reverting a change is itself an `Edit`, so undoing something re-dirties the
  flag and re-triggers the gate on the very next turn, even though the
  user's intent was to reduce state, not add unverified state — a 2-attempt
  ceiling doesn't fix this, it just caps the nuisance. And the safety
  property this would add (uncommitted code got linted/tested) is already
  guaranteed at commit time by the existing pre-commit hook
  (`build:types && typecheck && lint-staged`) and by CI — gating at
  turn-end duplicates that check at a worse-timed layer (mid-conversation,
  before the user has decided the work is done) without a correspondingly
  new safety gain. Reconfirmed deferred on this specific combination of
  reasons — undocumented mechanics plus a structural trigger-condition flaw
  plus redundancy with an already-better-timed check — not "still too
  complex" repeated unchanged. If revisited, the concrete unblocking step is
  an empirical probe of `session_id` behavior across a parent/subagent pair,
  in isolation, before any other part of the design is built. See ADR-0022
  and ADR-0023 for both passes.
- **The staged-secret scan is high-confidence-shape-only, not an entropy
  heuristic.** It will not catch a secret in a shape not on its known-prefix
  list, and cannot see file content passed to a command rather than typed
  inline (e.g. `psql -f drop.sql`'s file contents, or a secret committed via
  `psql < file.sql`).
