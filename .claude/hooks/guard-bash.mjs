#!/usr/bin/env node
/**
 * PreToolUse guard for the Bash tool.
 *
 * Purpose: turn this repository's human-gate policy (AGENTS.md, "Human gates")
 * from prose into an actual runtime control. Until this hook existed, every
 * gate on commit/push/migrate/docker/install/release was instruction-level
 * only — the runtime adapter documented that as its single largest limitation.
 *
 * Contract (verified against Claude Code 2.1.243):
 *   stdin  — PreToolUse event JSON; the command is at `.tool_input.command`
 *   stdout — {"hookSpecificOutput":{"hookEventName":"PreToolUse",
 *             "permissionDecision":"allow"|"deny"|"ask"|"defer",
 *             "permissionDecisionReason":string}}
 *   exit 0 with no stdout — no decision; normal permission flow continues.
 *
 * Deliberately NOT an allowlist: `.claude/settings.json` already allowlists the
 * safe verified commands. This hook only ever *adds* friction, so a pattern
 * miss degrades to the existing permission flow rather than to a bypass.
 *
 * Node (not bash+jq) because `node >= 22` is a declared engine of this
 * repository while `jq` is not guaranteed to be installed.
 */

import { execFileSync } from 'node:child_process'

// Global flags git accepts before a subcommand (`git -C <path> push`,
// `git --no-pager log`, `git -c key=val commit`) — tolerated so patterns
// still match the subcommand itself, not just its bare form. Applied only to
// patterns that identify *which command is being invoked*: `segments()`
// (below) already strips leading env-assignments/sudo/env/nice/time/command/
// exec, so a genuine invocation's segment really does start with `git`, and
// anchoring to that start (rather than an unanchored `\bgit\s+push\b`
// substring match) is what stops a segment like `echo "...git push..."` or
// `grep "git push" file` from misfiring — confirmed live: both denied a
// read-only diagnostic command during this repo's own 2026-08-27 audit.
const GIT_FLAGS = String.raw`(?:-C\s+\S+\s+|--no-pager\s+|-c\s+\S+\s+)*`

const DENY = [
  // --- History rewriting and irreversible git state -------------------------
  // Anchored to segment-start (see GIT_FLAGS above) — these must identify an
  // actual git invocation, not any segment that merely contains the phrase.
  [new RegExp(String.raw`^git\s+${GIT_FLAGS}push\b[^\n]*\s(?:--force|-f)(?:\s|$)`), 'force-push rewrites published history'],
  [new RegExp(String.raw`^git\s+${GIT_FLAGS}reset\s+[^\n]*--hard`), '`git reset --hard` discards uncommitted work irreversibly'],
  [new RegExp(String.raw`^git\s+${GIT_FLAGS}(?:rebase|filter-branch|filter-repo)\b`), 'history rewriting requires a human at the keyboard'],
  [new RegExp(String.raw`^git\s+${GIT_FLAGS}push\b[^\n]*\s--delete\b`), 'remote branch deletion is irreversible'],
  [new RegExp(String.raw`^git\s+${GIT_FLAGS}push\b[^\n]*\s:[\w./-]+`), 'refspec-style remote branch deletion is irreversible'],
  [new RegExp(String.raw`^git\s+${GIT_FLAGS}branch\s+-[dD]\b[^\n]*\b(?:main|dev)\b`), 'deleting a protected branch'],
  [new RegExp(String.raw`^git\s+${GIT_FLAGS}(?:commit|push)\b[^\n]*\s(?:--no-verify|-n)(?:\s|$)`), 'bypasses the pre-commit quality gate'],
  // Not anchored on purpose: `core.hooksPath` must be caught wherever it
  // appears in a git invocation (e.g. as a `-c` value mid-command), not only
  // at segment-start — anchoring here would narrow real coverage.
  [/\bgit\b[\s\S]*\bcore\.hooksPath\b/, 'redirects git hooks, bypassing the pre-commit quality gate'],
  // Bare `git push` moved back to ASK-tier 2026-08-27 (see ASK below) — a new
  // settings.json content-matching ask rule (`Bash(git push *)`) is the real
  // guarantee now (falls back to a genuine human prompt in every mode, never
  // classifier-substituted — see boundaries-and-runtime for the citations).
  // `sudo git push` is the one shape that rule can't reach: Claude Code's
  // Bash-rule wrapper-strip list is `timeout`/`time`/`nice`/`nohup`/`stdbuf`/
  // `command`/`builtin`/`noglob`, not `sudo` — so a settings ask rule for
  // `Bash(git push *)` does not match `sudo git push`, even though this
  // hook's own `segments()` does strip `sudo` (giving hook-`ask`, which is
  // not a guaranteed pause). Kept unconditional deny, below `evaluate()`
  // (`rawSegments`/`SUDO_PUSH`) — a per-raw-segment check, not `DENY_WHOLE`,
  // so it can't misfire across a `&&` boundary onto an unrelated plain push.

  // --- Release is human-only (AGENTS.md) -----------------------------------
  [new RegExp(String.raw`^gh\s+release\s+(?:create|delete|edit|upload)\b`), 'release is human-only per AGENTS.md'],
  [new RegExp(String.raw`^gh\s+workflow\s+run\b`), 'dispatching a workflow can deploy or publish'],

  // --- Secrets -------------------------------------------------------------
  // `.claude/settings.json` denies Read/Edit/Write on these paths, but
  // permission rules are per-tool: a `Read(**/.env)` deny does nothing about
  // `cat apps/api/.env`. This closes that hole for the Bash tool. `.env.example`
  // is tracked and secret-free, so it stays readable.
  [/\.keystore\b/, 'the keystore holds encrypted user AI keys and is never touched by an agent'],
  // Match `.env` only as a *path segment*. The lookbehind must reject a
  // preceding word character too, or `process.env.HOME` in an ordinary node
  // one-liner trips the guard — a false positive that blocks routine scripting.
  [/(?<![\w.])\.env(?!\.example\b)\b/, 'this touches a .env file — including first-run setup like `cp .env.example .env`, which is deliberately a human action; run it yourself outside the agent session'],
  [/\b(?:MASTER_KEY|KEY_DERIVATION_SALT)\b/, 'referencing a secret material name'],

  // --- Catastrophic filesystem --------------------------------------------
  [/\brm\s+(?:-[a-zA-Z]*\s+)*-?[a-zA-Z]*[rR][a-zA-Z]*f|(?:\brm\s+(?:-[a-zA-Z]*\s+)*-?[a-zA-Z]*f[a-zA-Z]*[rR])/, 'recursive force-delete'],
  [/\bchmod\s+(?:-R\s+)?777\b/, 'world-writable permissions'],
]

/**
 * Patterns whose danger *is* the composition, so they must be matched against
 * the raw command — splitting `curl … | sh` into segments destroys exactly the
 * evidence that makes it dangerous.
 */
const DENY_WHOLE = [
  [/\b(?:curl|wget)\b[^\n]*\|\s*(?:sudo\s+)?(?:ba|z|k|fi)?sh\b/, 'piping a network download into a shell'],
  // `segments()` strips leading env assignments so `pnpm lint` still matches
  // the allowlist after `FOO=bar pnpm lint` — the same stripping would hide
  // `SKIP_SIMPLE_GIT_HOOKS=1 git commit …` from per-segment matching, so this
  // must see the raw, unstripped command.
  [/\bSKIP_SIMPLE_GIT_HOOKS\s*=\s*1\b/, 'disables the pre-commit hook for this shell invocation'],
  // Whole-command, not per-segment: a per-segment `DROP TABLE` match would
  // also deny `rg "DROP TABLE" apps/api/drizzle` or reading a migration file.
  // Known accepted gap: `psql -f drop.sql` / `psql < file.sql` isn't
  // detectable here — file content isn't visible in the command string.
  [/\b(?:psql|pgcli)\b[\s\S]*\b(?:DROP\s+(?:TABLE|DATABASE|SCHEMA)\b|TRUNCATE\b)/i, 'destructive SQL against the Postgres database'],
  [/\bdrizzle-kit\s+drop\b/, 'drizzle-kit drop deletes migration state'],
  // `sudo git push` is deliberately NOT here: a whole-raw-string DENY_WHOLE
  // pattern would misfire across a `&&` boundary (e.g. `echo "avoid sudo
  // here" && git push` contains both words but is just a plain push). It's
  // instead a dedicated per-raw-segment check (`rawSegments`/`SUDO_PUSH`,
  // below `evaluate()`) so it only fires when `sudo` and `git push` are the
  // same actual command.
]

const ASK = [
  // The AGENTS.md human gates: commit, push, migrate, docker, install, release
  [new RegExp(String.raw`^git\s+${GIT_FLAGS}commit\b`), 'commit is human-gated (AGENTS.md)'],
  [new RegExp(String.raw`^git\s+${GIT_FLAGS}merge\b`), 'merge is human-gated (AGENTS.md)'],
  // Bare push, moved back from DENY 2026-08-27: an unconditional deny also
  // removed the human's own ability to approve a push through this session,
  // silently promoting push from AGENTS.md's "requires human approval" tier
  // to the stricter "human-only" tier reserved for release — not what the
  // security goal called for. The actual guarantee now lives in
  // `.claude/settings.json`'s `Bash(git push *)` ask rule (a content-matching
  // rule falls back to a real human prompt in every permission mode,
  // including `auto` — never substituted by the classifier, unlike this
  // hook's own `ask`, which "forces a prompt" that `auto` mode fulfills via
  // classifier review instead of a human). This hook's own `ask` here is
  // secondary/informational; the settings.json rule is the binding one.
  [new RegExp(String.raw`^git\s+${GIT_FLAGS}push\b`), 'push is human-gated (AGENTS.md) — this repository is public; see the settings.json `Bash(git push *)` ask rule for the actual guarantee'],
  [new RegExp(String.raw`^gh\s+pr\s+(?:merge|create)\b`), 'opening or merging a PR is an outward-facing action'],
  [new RegExp(String.raw`^docker(?:\s+compose)?\s+(?:up|down|build|run|push|exec)\b`), 'docker is human-gated (AGENTS.md)'],
  [new RegExp(String.raw`^(?:pnpm|npm|yarn|bun)\s+(?:install|add|update|upgrade|remove|i)\b`), 'dependency install is human-gated (AGENTS.md)'],
  // Not anchored on purpose: `db:migrate` and `drizzle-kit`'s subcommand are
  // frequently invoked through a wrapper this repo actually uses
  // (`pnpm exec drizzle-kit …`, `pnpm --filter @source-taster/api db:migrate`)
  // where the trigger token is not the segment's first word — anchoring to
  // segment-start would silently drop real coverage, unlike the git/gh/
  // docker/install patterns above where the verb genuinely is always first.
  [/\bdb:migrate\b|\bdrizzle-kit\s+(?:push|migrate|drop)\b/, 'database migration is human-gated (AGENTS.md)'],
  [new RegExp(String.raw`^pnpm\s+(?:run\s+)?deploy\b`), 'deploy is human-gated (AGENTS.md)'],
]

/**
 * Split a shell command into the individual commands it will actually run, so
 * that `pnpm lint && git push` is judged on `git push` too rather than passing
 * because it starts with an allowlisted verb. The split regex only removes a
 * *closing* `)` (and `$(`), never an opening `(` or `{` — those are stripped
 * separately, before the env/sudo strip, so `(git push --force)` and
 * `{ sudo git push; }` both unwind to a segment the anchored patterns below
 * can actually match. Found live 2026-08-27: without this, the 2026-08-27
 * anchoring fix silently dropped coverage on every parenthesized/braced
 * command, including force-push — caught by an independent cold review, not
 * by the 41-case test suite the anchoring fix itself shipped with.
 */
// Shared by segments() and rawSegments(): split into individual commands,
// trim, and strip a leading grouping character (`(`/`{`) so a parenthesized
// or braced command still exposes its real first word to the anchored
// patterns below.
function splitCommands(command) {
  return String(command ?? '')
    .split(/\$\(|\)|`|&&|\|\||[;\n|]/)
    .map(s => s.trim())
    .map(s => s.replace(/^[({]+\s*/, '').trim())
    .filter(Boolean)
}

export function segments(command) {
  return splitCommands(command)
    // strip leading env assignments (FOO=bar cmd) and privilege prefixes
    .map(s => s.replace(/^(?:(?:\w+=\S*|sudo|env|nice|time|command|exec)\s+)+/, '').trim())
    .filter(Boolean)
}

// Same split/paren-strip as segments(), but keeps `sudo` intact — needed to
// detect `sudo git push` specifically as its own segment (not the whole raw
// string, which would misfire across `&&` on e.g.
// `echo "avoid sudo here" && git push`). segments() strips `sudo` so
// `sudo docker compose up` still reaches the ASK pattern; that same stripping
// would make a sudo-prefixed push indistinguishable from a bare one, which is
// exactly the shape this exists to catch.
const rawSegments = splitCommands
const SUDO_PUSH = /^sudo\s+(?:\S+\s+)*git\s+push\b/

/** Returns {decision, reason} | null. Deny wins over ask. */
export function evaluate(command) {
  const raw = String(command ?? '')
  const parts = segments(command)
  for (const [pattern, reason] of DENY_WHOLE) {
    if (pattern.test(raw))
      return { decision: 'deny', reason }
  }
  for (const seg of rawSegments(command)) {
    if (SUDO_PUSH.test(seg)) {
      return {
        decision: 'deny',
        reason: 'sudo git push bypasses the settings.json content-matching ask rule (sudo is not in the wrapper-strip list), so this stays an unconditional deny',
      }
    }
  }
  for (const [pattern, reason] of DENY) {
    if (parts.some(p => pattern.test(p)))
      return { decision: 'deny', reason }
  }
  for (const [pattern, reason] of ASK) {
    if (parts.some(p => pattern.test(p)))
      return { decision: 'ask', reason }
  }
  return null
}

// Prefixes reflect this project's actual BYOK providers (AGENTS.md: OpenAI,
// Anthropic, Google, DeepSeek) plus this project's own API-key shape, not a
// generic secret-scanner list. High-confidence shapes only — deliberately not
// a Shannon-entropy heuristic, which needs a real corpus to tune safely.
const SECRET_LINE_PATTERNS = [
  [/srt_live_\w{16,}/, 'Source Taster live API key (srt_live_)'],
  [/\bghp_\w{36}\b/, 'GitHub personal access token (ghp_)'],
  [/\bgithub_pat_\w{20,}\b/, 'GitHub fine-grained PAT (github_pat_)'],
  [/\bAKIA[0-9A-Z]{16}\b/, 'AWS access key ID (AKIA)'],
  [/\bsk-ant-api03-[\w-]{20,}\b/, 'Anthropic API key (sk-ant-api03-)'],
  [/\bAIza[\w-]{35}\b/, 'Google API key (AIza)'],
  [/-----BEGIN(?: RSA| EC| OPENSSH)? PRIVATE KEY-----/, 'PEM private key header'],
]
const PLACEHOLDER = /process\.env\.|\$\{|<[a-z_]+>|REPLACE_ME|YOUR_|xxx|\.\.\.|\bexample\b/i

/**
 * Pure: diff text in, hit out. Deliberately separate from `evaluate()` — that
 * function is imported and called directly by `check-governance.mjs` in ~120
 * CI checks, so it must never shell out or depend on git working-tree state.
 * Checked per *added line*, not per whole diff: a `.env.example` hunk earlier
 * in the same commit must not immunize a real secret elsewhere in it.
 */
export function scanStagedSecrets(diffText) {
  let file = null
  for (const line of String(diffText ?? '').split('\n')) {
    const header = line.match(/^\+\+\+ b\/(.+)$/)
    if (header) {
      file = header[1]
      continue
    }
    if (!line.startsWith('+') || line.startsWith('+++') || PLACEHOLDER.test(line))
      continue
    for (const [pattern, label] of SECRET_LINE_PATTERNS) {
      if (pattern.test(line))
        return { label, file: file ?? '(unknown file)' }
    }
  }
  return null
}

async function main() {
  let raw = ''
  for await (const chunk of process.stdin) raw += chunk

  let command
  try {
    command = JSON.parse(raw)?.tool_input?.command
  }
  catch {
    // Unparseable event: stay silent so the normal permission flow decides.
    // A guard that crashes closed on malformed input would break every Bash call.
    process.exit(0)
  }

  // Fail open, but never silently. This guard is additive over the existing
  // permission flow, so a crash must not break every Bash call — but a guard
  // that has stopped guarding is exactly the thing you need to be told about.
  // (Learned the hard way: an earlier diagnostic threw inside the parse block
  // and the guard went quiet with exit 0 for several calls before anyone
  // noticed. `check-governance.mjs` now also syntax-checks this file in CI.)
  let verdict
  try {
    verdict = evaluate(command)
  }
  catch (error) {
    process.stderr.write(`guard-bash: FAILED OPEN — ${error?.message ?? error}\n`)
    process.exit(0)
  }

  // Staged-secret scan: only runs once a commit is already `ask`-gated, so any
  // failure here can only leave that `ask` in place — it can never regress to
  // silent allow. `-a`/`-am` stage tracked modifications at commit time, which
  // `--cached` never sees, so those use `diff HEAD` instead.
  if (verdict?.decision === 'ask') {
    const parts = segments(command)
    const commitSeg = parts.find(p => /\bgit\s+commit\b/.test(p))
    if (commitSeg) {
      try {
        // Letters excluding 'a' on both sides of the required 'a' — removes
        // the character-class overlap that causes super-linear backtracking
        // in the more obvious `[a-zA-Z]*a[a-zA-Z]*` shape, with identical
        // matching behavior for realistic git flag combinations (-a, -am, -ma).
        const usesDashA = /(?:\s|^)-[b-zB-Z]*a[b-zB-Z]*(?:\s|$)|--all\b/.test(commitSeg)
        const diff = execFileSync('git',
          ['--no-pager', 'diff', ...(usesDashA ? ['HEAD'] : ['--cached']), '--no-color', '--no-ext-diff', '-U0'],
          { cwd: process.env.CLAUDE_PROJECT_DIR ?? process.cwd(), timeout: 5000, maxBuffer: 32e6, encoding: 'utf8' })
        const hit = scanStagedSecrets(diff)
        if (hit) {
          verdict = { decision: 'deny', reason: `staged diff matches ${hit.label} in ${hit.file} — remove it or use a placeholder before committing` }
        }
      }
      catch (error) {
        process.stderr.write(`guard-bash: staged-secret scan failed (${error?.message ?? error}) — leaving as ask\n`)
        // verdict is untouched here on purpose (still 'ask').
      }
    }
  }

  if (!verdict) process.exit(0)

  process.stdout.write(`${JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: verdict.decision,
      permissionDecisionReason: `${verdict.reason}. Confirm explicitly if this is intended.`,
    },
  })}\n`)
}

// Only run the I/O path when executed directly, so the test can import the
// pure functions above without the process hanging on stdin.
if (import.meta.url === `file://${process.argv[1]}`) await main()
