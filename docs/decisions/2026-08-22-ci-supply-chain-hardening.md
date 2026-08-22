# ADR-0016: CI Supply-Chain Hardening — SHA-Pinned Actions and a Permissions Floor

> Status: accepted
> Date: 2026-08-22

## Context

The 2026-08-22 industry-standard audit raised two OpenSSF Scorecard findings:
F-6 (`Token-Permissions` — workflows declared no `permissions:` block) and F-7
(`Pinned-Dependencies` — every action was referenced by a mutable tag). Both
were deferred twice that day, each time with the reasoning that CI supply chain
is a different risk domain from the AI control plane and deserved its own
decision.

**That reasoning stopped being true when ADR-0015 shipped.** The `publish-images`
job introduced there holds `packages: write` and pushes container images that
the production host pulls automatically on every deploy. Four of its actions
were referenced by mutable tags:

```
actions/checkout@v4              docker/login-action@v3
docker/setup-buildx-action@v3    docker/build-push-action@v6
```

A compromised or repointed tag on any of them is a direct path from a
third-party repository to executing code in production. Before ADR-0015 a
compromised action could at most tamper with a build on the host; now it can
place a backdoored image into the registry that production trusts. This is the
scenario CSA documented in 2026 for AI-assisted CI, and this repository built
the bridge itself.

Measured state before this change:

| Workflow | `permissions:` | Actions pinned |
|---|---|---|
| `ci.yml` | none | 0 of 14 |
| `lint.yml` | none | 0 of 5 |
| `debug-chrome-status.yml` | none | 0 of 2 |
| `release.yml` | job-level only (`release`, `publish-images`) | 0 of 12 |

`release.yml`'s two unscoped jobs — `quality` and `deploy` — inherited the
repository default, and `deploy` is the job holding the production SSH
credentials.

## Decision

### 1. Every action is pinned to a commit SHA

All 33 `uses:` references across the four workflows now carry a 40-character
commit SHA with the tag retained as a trailing comment:

```yaml
- uses: actions/checkout@11d5960a326750d5838078e36cf38b85af677262 # v4
```

The comment is not decoration — Dependabot rewrites the SHA and the comment
together, so the pin stays both immutable and readable.

**One resolution detail that matters:** `pnpm/action-setup@v4` is an *annotated*
tag. `repos/:owner/:repo/git/ref/tags/v4` returns the tag object's SHA, not the
commit's; using it in `uses:` fails. It must be dereferenced through
`repos/:owner/:repo/git/tags/:sha`. Seven of the eight actions use lightweight
tags where the first lookup is already the commit. The planning step for this
change recorded the wrong SHA for exactly this reason, and re-resolving before
committing is what caught it.

### 2. A least-privilege permissions floor in every workflow

`ci.yml`, `lint.yml`, and `debug-chrome-status.yml` gain top-level
`permissions: contents: read` — no job in them needs more than checkout and
pnpm.

`release.yml` gains the same floor. Its job-level blocks override it where more
is genuinely required (`release`: `contents: write` + `pull-requests: write`;
`publish-images`: `packages: write`), while `quality` and `deploy` drop to
read-only. The `deploy` job holding production SSH secrets no longer carries a
writable repository token it never used.

### 3. Dependabot for `github-actions`

`.github/dependabot.yml`, monthly, `github-actions` only. A pin that is never
updated becomes its own risk — it freezes an action at a version that may later
be found vulnerable. Dependabot keeps the SHAs current without reintroducing
mutable references.

**Deliberately not npm.** An npm ecosystem entry across eight pnpm workspaces
would produce a pull-request volume that needs its own decision. Audit finding
F-8 (no dependency-update mechanism for npm) therefore remains open and is not
claimed as closed here.

### 4. Static enforcement

`evaluation/ai-system/check-governance.mjs` section `[7]` gains four assertions:
every `uses:` carries a 40-hex SHA; every workflow declares a top-level
`permissions:`; `.github/dependabot.yml` exists; and it configures the
`github-actions` ecosystem.

All four were negative-tested. Two findings came out of that:

- The first attempt at the pin test used a `sed` expression that silently did
  not modify the file, so the assertion appeared not to fail when in fact it was
  never exercised. Re-run with a mutation that was verified to apply, it fails
  correctly.
- The dependabot assertion originally used `includes('github-actions')` and
  passed against an npm-only config, because the file's own comment contains the
  word. It now matches the `package-ecosystem:` directive itself.

The second was a real defect in the check, found only because a negative test
that "passed" was treated as suspicious rather than as confirmation.

## Alternatives

- **Pin only the `publish-images` actions.** Rejected: `deploy` runs
  `appleboy/ssh-action` with production credentials and `release` runs
  `softprops/action-gh-release` with `contents: write`. Both are on the same
  path to production, and a partial pin invites the question of which half is
  protected.
- **Use `permissions: {}` as the floor instead of `contents: read`.** Rejected:
  every job here checks out the repository, so `{}` would need `contents: read`
  re-added per job — more places to get wrong for no additional restriction.
- **Adopt OpenSSF Scorecard as a workflow.** Reasonable and not rejected on
  merit, but it reports on controls rather than implementing them. The two
  checks it would have flagged are now closed and asserted locally by
  `check-governance.mjs`, which already gates merges.
- **Defer again until F-1 (PreToolUse hooks) is done.** Rejected: F-1 concerns
  the AI control plane and does not touch the registry path that ADR-0015
  opened.

## Consequences

- The path from a third-party action to a production container image now
  requires compromising a specific commit, not a movable tag.
- Action updates arrive as reviewable Dependabot pull requests subject to the
  five required status checks, rather than silently at the next workflow run.
- F-6 and F-7 from the 2026-08-22 audit are closed. F-8 remains open by choice.
- The pins will go stale if Dependabot pull requests are ignored. That is a
  process dependency this decision accepts and names rather than assumes away.
