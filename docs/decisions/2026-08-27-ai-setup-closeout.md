# ADR-0023: AI Setup Round-3 Closeout — Push-Gate Redesign, Doc Citations, Stop-Hook Re-Deferral, Frontend-Design Activation

> Status: proposed
> Date: 2026-08-27
> Amends: ADR-0022 (closes the items it left open; does not reverse its architecture)

## Context

ADR-0022 (2026-08-26) delivered a content-driven skill/hook audit but left several items explicitly open: whether the guard hook's `ask` decision actually pauses execution (answered with a hedge, not a citation), a `git push` gate escalated to an unconditional `deny` without checking whether that also blocks the human, a deliberately deferred Stop-hook verify-gate, and an inert `frontend-design` skill with no `DESIGN.md` to activate it. The user authorized closing every one of these autonomously, re-opening any prior decision (including ADR-0021's and ADR-0022's own) on content grounds, and running a full adversarial content audit of the whole setup before a final, non-whitewashed report.

## Decision

### 1. `git push` gate redesigned — `deny` → `ask` + a settings.json content rule, not just re-verified

Official Claude Code docs, fetched directly (`code.claude.com/docs/en/permissions`, `/permission-modes`), resolve the ADR-0022 `ask`/`deny` ambiguity with exact citations rather than one ambiguous live test:

- A hook `"deny"` blocks in every mode including `bypassPermissions` ("Deny rules block in every mode, including bypassPermissions") — unconditional, confirmed.
- A hook `"ask"` "forces a prompt" — but in `auto` mode (this session's own mode), "a classifier reviews actions instead of you" for anything that would otherwise prompt, so hook-`ask` is satisfied by classifier review, not a human dialog, specifically in that mode.
- A **settings.json content-matching `ask` rule** (`Bash(git push *)`) is different: it "falls back to a permission prompt" and is listed under "Actions no mode auto-approves" — never classifier-substituted, in any mode, and confirmed to fail *closed* under `dontAsk`.

ADR-0022's `deny` escalation solved the original gap (a push with zero human visibility in an auto-accepting session) but had a side effect never checked: `deny` fires before permission-mode resolution and has no documented interactive override, so it likely also blocked the human's own ability to approve a push through the agent — silently promoting `git push` from AGENTS.md's "requires human approval" tier to the stricter "human-only" tier reserved for `release`.

**Fix, applied**: bare `git push` moved back to `ASK` in `.claude/hooks/guard-bash.mjs`; `"Bash(git push *)"` added to `.claude/settings.json`'s `permissions.ask` (the actual binding guarantee now). Force-push, `--delete`, refspec branch deletion, protected-branch deletion, `--no-verify`, `core.hooksPath` stay `DENY` — genuinely irreversible, deliberately no override.

**Regression found and fixed**: `sudo git push` falls through the settings.json rule — Claude Code's Bash-rule wrapper-strip list is `timeout`/`time`/`nice`/`nohup`/`stdbuf`/`command`/`builtin`/`noglob`, not `sudo`. Added `/\bsudo\s+(?:\S+\s+)*git\s+push\b/` as a new `DENY_WHOLE` entry — kept unconditional, since this is the one shape the new design can't otherwise reach.

### 2. A live false positive, found by accident, led to anchoring every command-position pattern

A read-only diagnostic Bash command containing `echo "=== guard-bash.mjs DENY array (git push related) ==="` was denied outright — `segments()` split it into its own segment, and the unanchored pattern `/\bgit\s+push\b/` matched the substring inside the echoed string, not an actual invocation. A Plan-agent pressure-test reproduced this class four times live in the same session (`curl|sh` inside an echo, `SKIP_SIMPLE_GIT_HOOKS=1` inside an echo, `git push` inside an echo, `gh release create` inside a `grep`).

**Fix**: patterns that identify *which command is being invoked* (git/gh/docker/pnpm verbs — force-push, reset --hard, rebase/filter-branch/filter-repo, push --delete, refspec deletion, protected-branch deletion, --no-verify, gh release, gh workflow run, git commit, git merge, gh pr merge/create, docker, pnpm/npm/yarn/bun install, pnpm deploy) are now anchored to segment-start, tolerant of common git global flags (`-C <path>`, `--no-pager`, `-c k=v`) between the verb and subcommand — `segments()` already strips leading env-assignments/sudo/env/nice/time/command/exec, so a genuine invocation's segment really does start with the verb.

**Deliberately left unanchored** (confirmed correct by the pressure-test): `.env`, `.keystore`, `MASTER_KEY`/`KEY_DERIVATION_SALT`, `rm -rf`, `chmod 777`, `core.hooksPath` — these must catch a dangerous token wherever it appears (`cat`, `node -e`, `find -exec`, a `-c` flag value), not only at segment-start; anchoring these would narrow real protection, not just reduce false positives. `db:migrate`/`drizzle-kit`'s ASK pattern also stays unanchored — this repo genuinely invokes it through `pnpm exec drizzle-kit …`/`pnpm --filter … db:migrate`, where the trigger token isn't the segment's first word. `DENY_WHOLE` entries (`curl|sh`, `SKIP_SIMPLE_GIT_HOOKS=1`, the new sudo-push entry) can't be anchored at all — the danger is the whole-command composition — and keep the same false-positive tradeoff on prose/echo/grep text as before, accepted as cheap relative to under-blocking a real instance.

All fixes initially verified via a 41-case scratch test (every anchored pattern's coverage traced through `segments()` for six invocation shapes: bare, with args, `-C`-prefixed, `--no-pager`-prefixed, env-prefixed, sudo-prefixed, and compound `&&`) plus a real scratch-git-repo end-to-end run through the actual hook process, not just the imported function.

**A genuine coverage regression survived that 41-case suite** — caught by an independent cold review pass, not self-discovered. None of the 41 cases, none of the pressure-test's six traced shapes, and none of the 17 test blocks that existed at that point included a leading grouping character: `(git push --force)` and `{ sudo git push; }` both returned `null` (allowed) instead of `deny`. Root cause: `segments()`'s split regex removes a *closing* `)` (a split delimiter) but never strips an opening `(`/`{`, so the resulting segment was `(git push --force`, which the newly-anchored `^git\s+…` pattern no longer matched — the anchoring fix that closed one false-positive class silently opened a false-negative one on the single most catastrophic pattern this hook owns.

**Fixed**: `segments()` (and a new `rawSegments()`, sharing the same split step via `splitCommands()`) now strips a leading `[({]+\s*` before the env/sudo strip, re-covering every anchored pattern at once rather than patching force-push specifically. The `sudo git push` check was also redesigned in the same pass: it started this round as a `DENY_WHOLE` (whole-raw-string) pattern, which — separately flagged by the same review — would misfire across a `&&` boundary (`echo "avoid sudo here" && git push` contains both trigger words but is just a plain push); it is now a dedicated per-raw-segment check (`rawSegments`/`SUDO_PUSH`) instead, so it only fires when `sudo` and `git push` are the same actual command, and no longer lives in `DENY_WHOLE` at all. Three new test blocks (a dedicated grouping-character test, a dedicated sudo-vs-`&&` test, and the accepted-limitation test below) plus two new `check-governance.mjs` `guardCases` cover both fixes — `guard-bash.test.mjs` now has 20 test blocks (up from 17 earlier this round), `guardCases` now has 24 (up from 22). A `sh -c "git push --force"` case is recorded as an accepted, documented limitation (a quoted sub-command handed to another interpreter is invisible to a regex-based guard) rather than left as an implied gap.

### 3. Stop-hook verify-gate — reconsidered a second time, reconfirmed deferred, on sharper grounds

ADR-0022 deferred this citing missing infrastructure in general terms. This round explicitly re-opened it — not to defer by default, but to test whether a self-built, trust-ledger-free design (no arbitrary hook-executed "declared" command at all, eliminating gstack's biggest risk category by construction) was now buildable: a `PostToolUse` hook sets a session-scoped "dirty" flag on mutating tool calls, cleared by a recognized verify command (`pnpm lint/typecheck/test/eval:ai`), with `Stop` gating on the flag plus a hard attempt ceiling.

A Plan-agent pressure-test found this design depends on two facts that are genuinely **undocumented** in Claude Code's current hooks reference, not merely unconfirmed:

1. Whether `session_id` is shared or distinct for a subagent versus its parent session — a real risk given this repo's own subagent use (a subagent's edit could dirty the parent's flag, or vice versa).
2. The exact `tool_response` shape on `PostToolUse` for a Bash call — whether success/failure is exposed at all.

Independent of those two gaps, the design has a structural flaw: **reverting a change is itself an `Edit`**, so undoing something re-dirties the flag and re-triggers the gate on the very next turn, even though the user's intent was to reduce state, not add unverified state. A 2-attempt ceiling caps the nuisance but doesn't fix the underlying mismatch — nothing in the design distinguishes "finished a coding task without verifying" from "edited a file three turns ago and moved on." And the safety property this would add (uncommitted code got linted/tested) is already guaranteed at a better-timed layer: the pre-commit hook already runs `build:types && typecheck && lint-staged`, and CI runs the full suite. Gating at turn-end duplicates that check mid-conversation, before the user has decided the work is done, without a correspondingly new safety gain.

**Decision: reconfirmed deferred**, on this specific combination — undocumented mechanics plus a structural trigger-condition flaw plus redundancy with an already-better-timed check — not "still too complex" repeated unchanged from ADR-0022. If revisited, the concrete unblocking step is an empirical probe of `session_id` behavior across a parent/subagent pair, in isolation, before any other part of the design is built.

### 4. `frontend-design` activated for `apps/landing`

Long-term value judgment, not present-day-`DESIGN.md`-absence judgment: this project has real, actively-designed public surfaces (the landing page was redesigned in Penpot this week, per session memory), so a design-token pipeline has clear standing value regardless of today's state. Ran the user-level `create-design-md` skill in repository mode against `apps/landing/src/styles/global.css` — a real, named custom-property system (16 colors across 5 scales, one shared font-family token, one shared corner-radius token, two shared shadow levels, a dark-theme override block) with no invented values. Export target `dtcg` (no Tailwind in this workspace). Validated per the skill's own mandatory gate: `npx @google/design.md lint` — 0 errors (1 advisory warning: no canonical `primary`-named color role, left as-is rather than renaming the source's own `p`/`t`/`g`/`a` names into invented semantic roles not evidenced by usage); `npx @google/design.md export --format dtcg` — all three populated categories (`color`, `rounded`, `typography`) emit correctly. No `fontSize`/`weight`/`lineHeight` scale or `spacing` category is recorded — none exists as a named, shared token in source (components use one-off literal sizes), and inventing one from scattered literals is exactly what the skill's evidence discipline forbids.

`frontend-design`'s SKILL.md updated to reflect this: activated for the landing page, still pending for the Vuetify-based extension/web app.

### 5. `ui-ux-pro-max-skill` installed, not just recommended

Re-verified this session (not carried over from ADR-0022): still MIT, not archived, 121,447 stars, pushed within the last day. Installed via `claude plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill` then `claude plugin install ui-ux-pro-max@ui-ux-pro-max-skill`, confirmed enabled via `claude plugin list` (version 2.13.0, scope: user). A user-level, reversible (`claude plugin uninstall`), credential-free plugin install — squarely inside the local configuration the user gave free rein over, and the user explicitly authorized installing it this round if it delivered real value.

### 6. Content audit — concrete findings, not a restated checklist

- **OpenCode has no `read` permission category** — confirmed by inspecting the resolved config schema: only `bash`, `edit`, `external_directory` exist. No equivalent of Claude Code's `Read(.keystore/**)`/`Read(**/.env)` deny rules for OpenCode's native Read tool. Documented in `docs/ai-os/runtimes/opencode/implementation.md` as a likely genuine OpenCode capability gap (no `read` key to configure), not a missed configuration line — OpenCode's blanket `bash: {"*": "ask"}` still covers `cat .env`, so the gap is specific to the native Read tool, not total.
- **Self-inflicted secret exposure, disclosed rather than omitted**: running `opencode debug config` to inspect that resolved schema printed the full merged config — including the plaintext GitHub PAT, Context7 key, and Penpot bearer token already present in `~/.config/opencode/opencode.json` — into this session's own tool output and local transcript. This doesn't change what already existed in that file, but it is a real, new, secondary exposure this round caused. No further command that could print resolved secrets ran for the remainder of this task. No secret value appears in this document or in the final report to the user.
- Reviewer agents (`reviewer.md`, both runtimes): confirmed genuine parity — identical Mission/Responsibilities/two-lens framing/6-item smell list, differences limited to expected runtime-specific frontmatter.
- All 9 skills re-read fresh: no redundancy found between the four ADR-0022 additions or against the pre-existing five; each keeps a tight, non-overlapping scope with explicit "not this skill" cross-references.
- `.opencode/memory/handoff-penpot-ui-redesign.md` reconfirmed as live, tracked, in-progress project documentation (committed via PR #282) — not dead configuration, left untouched.
- `check-governance.mjs` reconfirmed free of hardcoded count assertions (`guardCases` grew from 19 to 24 across this round's two edits without any check needing a matching literal-count update) — the scalability principle from ADR-0021/ADR-0022 holds.
- mattpocock/skills re-checked: `pushed_at` 2026-08-24, before ADR-0022's review — no new content exists to re-evaluate; its per-skill verdicts stand, re-confirmed rather than silently carried over. `anthropics/skills` re-checked: still `license: null` — the no-vendoring decision for `frontend-design` stands.

### 7. Security — `~/.config/opencode/opencode.json` re-verified, credential migration prepared but not applied

Re-verified directly (structural check, secret values masked in output rather than printed — learning from the §6 disclosure above): `filesystem` MCP root still narrowed to `/Users/jeffnawroth/Developer`, `chrome-devtools-mcp` still pinned to `1.8.0`, `@playwright/mcp` still pinned to `0.0.79`, file mode still `600`. All three ADR-0022 fixes hold; no regression.

The three plaintext credentials (GitHub PAT, Context7 API key, Penpot bearer token) are still not touched — rotating them requires the user's action at each issuing service, and swapping the JSON to `${VAR}` syntax before those variables exist would break OpenCode's MCP auth across every project the user has. Prepared, not applied, so the user has a copy-pasteable target the moment they've rotated and exported the variables:

```jsonc
// mcp.github.headers.Authorization
"Authorization": "Bearer ${GITHUB_MCP_TOKEN}"
// mcp.context7.headers.Authorization
"Authorization": "Bearer ${CONTEXT7_API_KEY}"
// mcp.penpot.url — replace the userToken query value
"url": "https://design.penpot.app/mcp/stream?userToken=${PENPOT_MCP_KEY}"
```

This exactly mirrors this project's own `.mcp.json` pattern (`${CONTEXT7_API_KEY}`, `${PENPOT_MCP_KEY}`) — a proven-working shape in this same ecosystem, not a new one. Rotation order (highest blast-radius first): GitHub PAT, then Context7 key, then Penpot token — see ADR-0022 for the exact per-credential steps. No `~/.zshrc` or other global shell configuration was touched.

## Alternatives considered and rejected

Covered inline above per item. No new whole-project alternative was introduced this round; ECC/gstack/agency-agents as complete systems remain rejected for the reason ADR-0021 already gave.

## Consequences

- `guard-bash.mjs`: `DENY` entries anchored (7 command-position patterns + the unanchored `core.hooksPath`), `ASK` entries anchored (6 of 7 — `db:migrate`/`drizzle-kit` deliberately not), bare `git push` moved `DENY` → `ASK`, a new dedicated per-raw-segment check for `sudo git push` (not `DENY_WHOLE` — redesigned mid-round after the `&&`-boundary false positive was found), and `segments()`/`rawSegments()` now strip a leading grouping character after the force-push-in-parens regression was caught and fixed. `guard-bash.test.mjs` grew from 16 (start of this round) to 20 test blocks; `check-governance.mjs`'s `guardCases` grew from 19 to 24.
- `.claude/settings.json` gained one new `permissions.ask` entry: `Bash(git push *)`.
- A genuine `DESIGN.md` exists for one surface (`apps/landing`), validated, not a placeholder.
- `ui-ux-pro-max-skill` is installed and enabled (user scope), not merely documented as recommended.
- Three documentation files (`implementation.md` for both runtimes, `boundaries-and-runtime`) now cite official Claude Code docs directly for the ask/deny mechanism rather than inferring it from one confounded live test.
- The Stop-hook verify-gate remains unimplemented, now for a more specific and falsifiable reason than "no infrastructure."

## Residual risks

- Behavior of hook-`ask` in `default`/Manual permission mode remains genuinely untested this session (only `auto` mode was exercised).
- Whether a hook-`ask` and a matching settings.json `ask` rule on the same command produce one prompt or two is not directly confirmed by the docs read this round — worth watching on the first real `git push` under the new configuration.
- `DENY_WHOLE` patterns (`curl|sh`, `SKIP_SIMPLE_GIT_HOOKS=1`, the new sudo-push entry) keep the same false-positive exposure on prose/echo/grep text as before — accepted, not fixed, since anchoring them would create real bypasses.
- OpenCode's native Read tool has no per-path deny primitive — a runtime capability gap, not a configuration fix available to this repository.
- Three plaintext credentials remain in `~/.config/opencode/opencode.json`, pending user-initiated rotation (unchanged from ADR-0022); this round's `opencode debug config` run added a secondary, local-only exposure of those same values into this session's transcript.
