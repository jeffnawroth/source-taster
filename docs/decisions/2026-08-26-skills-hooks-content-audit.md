# ADR-0022: Skills, Hooks & Security — Content-Driven Re-Evaluation

> Status: proposed
> Date: 2026-08-26
> Amends: ADR-0021 (extends `guard-bash.mjs` and the skill set it established;
> does not reverse any of its architecture)

## Context

ADR-0021 fixed this repository's AI-setup *architecture* (enforced human
gates via a `PreToolUse` hook, single-sourced skills, invariant-based
governance checks) but evaluated external candidate projects largely by
category and name overlap — "we already have UI skills" was treated as a
sufficient reason to reject `nextlevelbuilder/ui-ux-pro-max-skill`.

That standard was explicitly rejected as insufficient. The mandate for this
round: compare actual content, depth, and quality against what exists here,
for every candidate — never accept "we already have something similar" or
"this was already proposed" as a reason on its own. Three research passes
fetched and read real file content (via `gh api`, not READMEs) against
mattpocock/skills (34 skills), the UI/UX ecosystem (ui-ux-pro-max-skill,
awesome-design-md, anthropics/skills, the `ui-skills` MCP, and this
repository's own 8 user-level UI skills), and the mechanism-level internals
of ECC and gstack (actual hook scripts, not marketing copy). A fourth pass
pressure-tested the resulting design against the live state of
`guard-bash.mjs` and caught three real defects before any code was written
(see "Design corrections," below) — most notably that the originally-planned
secret-scan implementation would have broken `check-governance.mjs`'s direct
import of `evaluate()`, and that `git commit -a` would have silently defeated
a naive `--cached`-only diff scan.

## Decision

### Content reversed one prior rejection, confirmed another with stronger evidence

**`nextlevelbuilder/ui-ux-pro-max-skill` — added, reversing ADR-0021's
rejection.** The prior round rejected it on the grounds that this repository
already had UI skills. Reading its actual content (not its README) shows
that grounds was wrong: 18-role color palettes with WCAG-adjustment notes,
Vue-3.5-specific and Astro-specific stack guidance verified current as of
2026-08-13, a real BM25 search engine over the data rather than a thin JSON
list, self-contained (Python stdlib only, no network calls — confirmed by
reading its dependency manifest, not asserted from the README), MIT-licensed,
121,259 stars (re-verified directly via `gh api`, not scraped). None of this
project's 9 skills *generates* new token/color/typography systems for a
greenfield surface — `create-design-md` only extracts from what already
exists; `improve-ui`/`baseline-ui` only audit what already exists. That is a
real, previously unfilled gap.

Not auto-installed, for a different reason than the prior rejection: it is a
large third-party plugin (bundled data plus Python execution) and a
user-level, not project-scoped, install — a genuine supply-chain decision
under this repository's own `security-engineering` skill, and outside a
single session's mandate regardless of trust level. Recommended, verified
install (confirmed against the repo's actual `.claude-plugin/marketplace.json`,
not assumed):

```
claude plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill
claude plugin install ui-ux-pro-max@ui-ux-pro-max-skill
```

(Marketplace id `ui-ux-pro-max-skill`, plugin name `ui-ux-pro-max`, version
2.13.0 at verification time — read directly from the manifest, not the
README.)

**`VoltAgent/awesome-design-md` — rejected, with much stronger evidence than
the prior round had.** Its own Stripe-clone file's YAML frontmatter reads
`description: An inspired interpretation of Stripi's design language` — a
self-admitted reconstruction, with no source citation and no lint/export
validation. This repository's `create-design-md` skill enforces a mandatory
3-proof gate (`Observation, Basis, Consequence` plus `npx @google/design.md
lint`/`export`) that would *reject* exactly this kind of file. Confirmed
strictly better on content, not merely "similar" by name.

**Anthropic's `frontend-design` skill (idea, not the file) — adopted as
original content.** Its brainstorm → plan → critique-for-genericness → build
→ critique-again loop, and its explicit naming of the three common
AI-generated visual defaults to avoid, exists nowhere in this repository's
prior skill set (all prior UI skills are audit/extraction, not ideation).
`anthropics/skills` has no detected open-source license (`license: none` via
the GitHub API), so the file itself is not vendored — a fresh skill was
authored capturing the same mechanism in this project's own words, scoped to
its actual stack (Vue3/Vuetify, Astro).

### mattpocock/skills — 6 items adopted (content-justified), the rest declined honestly

Adopted, each because the research confirmed no existing content covers it:
TDD seam discipline and 3 named anti-patterns, a hypothesis-first bug
diagnosis procedure, the deletion test for judging abstraction load-bearing,
merge-conflict resolution (never `--abort`, trace intent to source), the
expand-migrate-contract pattern for wide mechanical refactors, and a 12-item
Fowler smell checklist (trimmed to 6 items relevant to this TS/Vue stack,
plus a "name the concrete cost" qualifier, after the pressure-test flagged
the full list as likely to crowd out reviewer judgment rather than sharpen
it). These landed as two new skills (`engineering-craft` for authoring-time
craft, `debugging-and-recovery` for recovery-from-broken-state — split
because the original single "engineering-craft" grouping mixed two
single-concern skills into one broad one) plus additions to both `reviewer`
agent files and `target-state-first`.

Declined, stated by actual reason rather than blanket "redundant":

- `wayfinder`, `triage`, `to-spec` — genuine, well-built mechanisms, but they
  require issue-tracker-with-label-conventions infrastructure this repository
  doesn't have. An infrastructure dependency, not a quality judgment.
- `research`, `implement` — redundant with `claude-mem:make-plan`/`do` and
  this repository's existing research-source policy; no independent content.
- `teach`, `wait-what`, `claude-handoff` — not applicable: a personal-tutoring
  skill, a `CONTEXT.md`-convention dependency this repo doesn't use, and a
  Claude Code `--bg`-launch dependency, respectively.

### Hook enhancements — closing gaps found by reading ECC's actual hook source, not its marketing

Two real bypasses of the existing `--no-verify` intent, both confirmed
present in this exact repository's dependency (`simple-git-hooks`) and git
itself, were added to `.claude/hooks/guard-bash.mjs`'s `DENY`/`DENY_WHOLE`
lists: `git … core.hooksPath=…` (all three forms — inline `-c`, local
`git config`, `--global` — share the literal string, so one pattern catches
all three) and `SKIP_SIMPLE_GIT_HOOKS=1` (a real, working bypass in this
repo's own `node_modules/simple-git-hooks`, confirmed by reading its source).
A destructive-SQL pattern was added for this project's actual database
(`DROP TABLE/DATABASE/SCHEMA`, `TRUNCATE` via `psql`/`pgcli`;
`drizzle-kit drop`), whole-command-scoped so it can't fire on `rg "DROP
TABLE"` or reading a migration file.

A staged-diff secret scan was added: when `evaluate()` already returns `ask`
for a `git commit`, `main()` additionally reads `git diff --cached` (or
`git diff HEAD` when `-a`/`-am` is detected — `--cached` alone would miss
those) and escalates to `deny` if a high-confidence secret shape is found
(this project's own `srt_live_` prefix, plus the actual BYOK providers named
in `AGENTS.md`: GitHub, AWS, Anthropic, Google). The scan is a separately
exported pure function (`scanStagedSecrets`), not inlined into `evaluate()`,
because `check-governance.mjs` imports and calls `evaluate()` directly in
~120 CI checks — shelling out from inside it would make static CI checks
depend on git working-tree state, a design flaw the pressure-test pass caught
before implementation. Any internal failure in the scan leaves the existing
`ask` decision untouched rather than falling through to silent allow, so this
can never regress below current behavior.

All of the above verified end-to-end in a scratch git repository (not just as
unit-test fixtures): a staged secret was denied via `--cached`; the same
secret, staged only via a tracked-file modification and committed with `-a`,
was still caught via the `diff HEAD` fallback; `SKIP_SIMPLE_GIT_HOOKS=1 git
commit` was denied (and, live during this test, this session's own guard
correctly intercepted the test author's own attempt to type that exact bypass
string in a Bash command — the strongest possible evidence the pattern
works); `rg "DROP TABLE"` and reading a migration file were confirmed *not*
denied, ruling out the obvious false-positive class.

### `ask` does not pause in an auto-accepting session — discovered during verification, corrected during implementation

> **Superseded by ADR-0023.** The mechanism this section infers from one
> live test is now confirmed directly from official Claude Code docs
> (fetched 2026-08-27), and the `deny` escalation this section describes is
> reversed: bare `git push` moved back to `ask`, backed by a new
> settings.json content-matching rule instead. Kept here as history, not
> current policy — see ADR-0023 §1–2.

ADR-0021 documented as an open question whether `ask` actually produces an
interactive pause, with a stated fallback: if it doesn't, move `git push` to
`deny`. `deny` was confirmed blocking unconditionally this round, including
under this very session's own auto-accepting permission mode (`rm -rf`,
`SKIP_SIMPLE_GIT_HOOKS=1`, and a `node` command naming a `.env` path were all
denied live, mid-session, not in a test harness). A deliberately non-mutating
`git commit --dry-run` was then run directly through the live harness (not
simulated) and executed immediately with no prompt.

That result is weaker evidence than the `deny` findings and should not be
overstated: the same session also had a second, independent gate active (the
harness's own auto-mode classifier, observed separately blocking an unrelated
command with its own denial message). A clean pass through *both* layers only
shows the composite didn't stop the command — it does not isolate hook-`ask`
as the specific mechanism that resolved to allow, the way the repeated `deny`
observations do isolate the hook. The documented resolution order
(`hooks → deny → ask → mode → allow`) makes "ask resolves through session
mode, not halting the way deny does" the likely explanation, but this round
treats it as inference from one confounded test, not a settled fact.

Acted on regardless of the confound, per the pre-written contingency and on
the merits: plain `git push` moved from `ask` to `deny` in `guard-bash.mjs`,
`guard-bash.test.mjs`, and `check-governance.mjs`'s `guardCases`. A gate that
might not hold in the exact configuration used in this repository isn't a
gate for the highest-consequence command against a public repository — the
uncertainty about *why* argues for the stronger primitive, not against
acting. `git commit`, `git merge`, docker, install, and migration remain
`ask` — deliberately not escalated, since they are lower-consequence and
reversible before the equivalent of a push, and escalating every `ask` gate
to `deny` would remove the distinction between "pause for confirmation" and
"block outright" this hook exists to preserve; their real-world protection
level is correspondingly left as unverified, not asserted as "conditional on
interactive mode." This is the clearest instance in this round of the
content-driven principle applied to this repository's *own* prior work, not
just external candidates: a documented-but-untested assumption was tested,
found not to hold as previously assumed, and corrected — with the residual
uncertainty about the exact causal layer stated plainly rather than folded
into a clean-sounding "confirmed" claim.

One further consequence follows from `deny` being unconditional: it fires at
the hook layer, before permission-mode resolution, and has no documented
interactive override. That means once `git push` is `deny`, the human using
this session likely cannot push through Claude Code either — not just an
autonomous agent — only from a separate terminal, or by editing the pattern
in `guard-bash.mjs`. This was **not** tested with a real push (the only way
to confirm it live is the exact action the gate exists to prevent), so it is
recorded as a predicted, unverified operational consequence for the user to
be aware of, not a tested fact.

### Stop-hook `verify-gate` — deferred, not implemented, and not merely "too complex"

> **Re-examined in ADR-0023**, which re-opened this specifically to test
> whether it was now buildable rather than deferring by default. Reconfirmed
> deferred there, on sharper and more falsifiable grounds (two undocumented
> hook-schema facts plus a structural trigger-condition flaw plus redundancy
> with the pre-commit hook and CI) — not a reversal of this section's
> reasoning, an extension of it.

gstack's `gstack-verify-gate` (a Stop hook blocking turn-end until a declared
test command passes) was investigated as a mechanism, independent of
adopting gstack itself. Claude Code's official hooks documentation, fetched
directly rather than assumed, confirms the `Stop` event has no
`stop_hook_active` field and no built-in loop-prevention counter. A naive
port risks hanging a session indefinitely with no self-recovery if the check
keeps failing. gstack's own version is safe only because it requires a
human-approved trust ledger (`sha256` of a declared command, invalidated on
any edit) — infrastructure this repository doesn't have. Implementing the
blocking behavior without that safety infrastructure would be reckless
speed, not caution.

**Deferred with a written spec**, so a future session can implement this
deliberately rather than rediscover the same risk: a safe version needs (1) a
session-scoped attempt counter persisted to a temp file keyed by
`session_id`, (2) a hard ceiling (~2 blocks) before forced allow, and (3) an
explicit human opt-in/trust step before any declared verify command runs
automatically.

### Security — `~/.config/opencode/opencode.json` (user-level, outside this repository's version control)

This project's own `opencode.json` already scopes its `filesystem` MCP entry
to `{env:PWD}`, confirmed by reading the resolved configuration — so this
repository's own exposure from the global home-rooted entry was already
mitigated before this round; the fixes below mainly protect the user's other
projects.

Applied (safe, reversible, no external coordination — confirmed via `ls ~`
that the user has no development directories outside `~/Developer`):
`chrome-devtools-mcp` pinned to `1.8.0`, `@playwright/mcp` pinned to
`0.0.79` (current published versions, verified via `npm view`); the
`filesystem` MCP root narrowed from `/Users/jeffnawroth` to
`/Users/jeffnawroth/Developer`; file permissions tightened to `600` (was
`644`).

**Not applied — blocked on the user**: moving the GitHub PAT, Context7 API
key, and Penpot bearer token to `${VAR}` references. Rotating each credential
can only happen at its issuing service. Swapping the JSON to env-var syntax
*before* those variables are actually set would break OpenCode's MCP
authentication across every project the user has — a functional regression
worse than the interim disclosure risk. Writing `export` lines into
`~/.zshrc` unilaterally is a high-blast-radius edit to global shell
configuration affecting every terminal session, which needs explicit
confirmation rather than silent action.

Recommended rotation order (highest blast-radius first) and the exact steps
for the user:

1. **GitHub PAT** (`github_pat_…`, under `mcp.github.headers.Authorization`)
   — revoke at github.com/settings/tokens, generate a replacement scoped to
   only what OpenCode's GitHub MCP actually needs, then set
   `export GITHUB_MCP_TOKEN="<new token>"` in the shell profile and change
   the JSON's `Authorization` value to `"Bearer ${GITHUB_MCP_TOKEN}"`.
2. **Context7 API key** (`ctx7sk-…`) — regenerate at the Context7 dashboard,
   `export CONTEXT7_API_KEY="<new key>"`, same substitution pattern (this
   project's own `.mcp.json` already uses exactly this pattern for
   `context7`, so it's a proven-working shape, not a new one).
3. **Penpot bearer token** — regenerate in Penpot account settings,
   `export PENPOT_MCP_KEY="<new token>"`, substitute into the `url` query
   parameter.

## Alternatives considered and rejected

Covered inline above per item, since the entire point of this round was
per-item content justification rather than a blanket verdict. No additional
whole-project alternatives were introduced beyond what ADR-0021 already
evaluated (ECC, gstack, agency-agents as complete systems remain rejected for
the reason stated there — installing a rival operating system would recreate
the redundancy this whole effort exists to eliminate).

## Consequences

- Skills: 5 → 9. Every addition traces to a content gap verified by reading
  actual files, not by category. `check-governance.mjs`'s skill-discovery
  check (dynamic, no hardcoded count) confirms all 9 pass frontmatter/
  directory-name/uniqueness validation, and `opencode debug skill` confirms
  OpenCode resolves all 9 from the single `.claude/skills/` tree.
- `guard-bash.mjs` grew from 14 DENY / 1 DENY_WHOLE / 8 ASK patterns to 16 / 4
  / 7 (DENY +2: `core.hooksPath`, and plain `git push` moved in from ASK per
  the live-pause finding below; DENY_WHOLE +3: `SKIP_SIMPLE_GIT_HOOKS`,
  destructive SQL, `drizzle-kit drop`; ASK −1: `git push` moved out), plus one
  new exported pure function (`scanStagedSecrets`). Regression tests grew from
  10 test blocks to 16, plus 5 additional end-to-end scratch-repo tests not
  expressible as pure-function fixtures. `check-governance.mjs`'s
  `guardCases` grew from 12 to 19.
- A real, previously undiscovered enforcement gap is closed: this
  repository's own dependency (`simple-git-hooks`) has a documented
  `SKIP_SIMPLE_GIT_HOOKS=1` bypass, which was not accounted for anywhere in
  ADR-0021's hook design.
- The reviewer agents (both runtimes) gained a scoped smell checklist and an
  explicit two-lens framing; this is a prompt change only, not a permission
  or tool change.
- User-level OpenCode configuration is measurably safer (two pinned
  versions, a narrower filesystem root, tightened file permissions) but still
  carries three plaintext credentials pending user-initiated rotation.
- ADR-0021's open question about whether `ask` actually pauses moved from
  untested to observed-but-confounded, not to resolved: one live test showed
  no pause in an auto-accepting session, but a second independent gate (the
  harness's own classifier) was active in that same session, so the exact
  causal layer is inferred, not isolated. `git push` is now `deny` regardless
  of that uncertainty, since a possibly-non-holding gate on the
  highest-consequence command was the wrong risk to carry either way.
  `git commit`/`git merge`/docker/install/migrate remain `ask`, with their
  real-world protection level left explicitly unverified rather than
  asserted as "conditional on interactive mode."
- `deny`'s unconditional nature likely also blocks the human pushing through
  this session, not only an autonomous agent — a predicted, untested
  consequence of moving `git push` to `deny` that the user should be aware of
  before expecting to push interactively via Claude Code.

## Residual risks

- The staged-secret scan is pattern-based and high-confidence-only by design
  (no entropy heuristic) — it will not catch a secret in a shape not on its
  list, and it cannot see `psql -f file.sql`-style file content.
- The Bash guard as a whole remains pattern-based, not a shell parser; a
  sufficiently obfuscated command can still evade it (unchanged limitation
  from ADR-0021).
- The Stop-hook verify-gate remains unimplemented; a session's uncommitted
  changes are not blocked from ending the turn even if tests are failing.
- `git commit`, `git merge`, docker, dependency install, and migration remain
  `ask`-tier, which this round confirmed is not an effective gate in an
  auto-accepting session — only interactive/confirming sessions get real
  protection from them. Only `git push` was escalated to `deny`; the others
  were deliberately left as `ask` (see "What NOT to do," `ask` section above)
  rather than escalated wholesale.
- Three plaintext credentials remain in `~/.config/opencode/opencode.json`
  pending user rotation.
- Whether `git push` being `deny` also blocks the human (not only the agent)
  from pushing through this session is inferred from the resolution order,
  not tested — confirming it live would require the exact push the gate
  exists to prevent. If the user needs to push through Claude Code, this
  should be confirmed once deliberately rather than assumed.
