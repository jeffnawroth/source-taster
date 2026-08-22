# ADR-0010: AI-OS v1.0 Hardening — Control-Plane Ownership, MCP Pinning, Secret Boundary

> Status: accepted
> Date: 2026-08-22

## Context

The AI operating system reached feature completeness with the Claude Code
runtime adapter (ADR-0008) and its MCP setup (ADR-0009). An industry-standard
audit conducted on 2026-08-22 compared the setup against current practice
(the AGENTS.md convention, Anthropic's Claude Code guidance, the OWASP Top 10
for Agentic Applications 2026, OWASP/CSA MCP security guidance, and OpenSSF
Scorecard). The audit found the architecture and governance discipline sound
and, in several respects, ahead of common practice — but identified a
recurring pattern: several controls exist as **declared policy without an
implementing mechanism**.

Three of those gaps are closed here. They share one property that makes them
appropriate for a single decision: each converts an existing, already-agreed
CORE requirement from prose into something a machine or a platform enforces.
None of them changes the CORE model, adds a runtime, or introduces a new
framework.

1. **No ownership boundary on the control plane.** CORE §47 requires that
   changes to roles, instructions, permissions, skills, tool integrations, and
   governance rules be reviewable; CORE §48 forbids an agent from widening its
   own authority. Both were enforced only by `permissions.ask` inside each
   runtime — that is, by the very control plane they protect. Nothing existed
   at the platform layer. The repository has two human collaborators
   (`jeffnawroth`, `ErenC61`), so an ownership boundary is meaningful rather
   than a formality.

2. **MCP servers loaded from mutable references.** `.mcp.json` invoked
   `npx -y @playwright/mcp@latest` — resolving to the newest published release
   on every launch — and `crystaldba/postgres-mcp` with no tag, resolving to
   `:latest`. Current MCP security guidance is explicit that a server approved
   on the basis of its initial tool descriptions is no longer the same server
   after an update, and that tool descriptions are the injection surface
   (tool poisoning is structurally indirect prompt injection). Claude Code's
   per-server approval gate is a *first-connection* control; it does not
   re-fire when the underlying package changes. ADR-0009 recorded `@latest` as
   a fact but reached no decision on it.

3. **The agent secret boundary was narrower than the repository's own.**
   `.claude/settings.json` denied `Read(.env)` and `Read(apps/api/.env)`, while
   `.gitignore` (lines 75–80) treats `.env`, `.env.local`, `.env.development.local`,
   `.env.test.local`, and `.env.production.local` as secrets at any depth. Any
   `.env` added in a new workspace would have been readable by default.

A fourth, related gap: `.claude/settings.local.json` — which carries
per-developer permission grants and the list of enabled MCP servers — was
ignored only through the maintainer's personal global git configuration
(`~/.config/git/ignore`), not through the repository. That protection does not
travel to any other checkout.

## Decision

### 1. CODEOWNERS for the AI control plane

`.github/CODEOWNERS` is created and assigns `@jeffnawroth` as owner of:
`AGENTS.md`, `CLAUDE.md`, `.github/copilot-instructions.md`, `.claude/`,
`.opencode/`, `opencode.json`, `.mcp.json`, `docs/ai-os/`, `docs/decisions/`,
`evaluation/ai-system/`, and `.github/CODEOWNERS` itself.

`opencode.json` and `CLAUDE.md` are included although the audit listed only
`.opencode/**` and `AGENTS.md`: protecting a runtime's directory while leaving
its root configuration file unowned would be an incoherent boundary.

No default (`*`) owner is declared. Ordinary application changes under
`apps/**` and `packages/**` are deliberately not gated by this file; they are
already covered by the design gate (`permissions.ask`) inside both runtimes.

**Branch protection is deliberately not changed by this ADR.**
`require_code_owner_reviews` remains `false`. With `enforce_admins: true` and a
single owner for every control-plane path, enabling it would make the
maintainer unable to merge their own control-plane pull requests. CODEOWNERS
therefore acts today as an ownership map and an automatic reviewer request —
real, but advisory. Enabling the blocking flag is a separate decision that
should follow the appointment of a second control-plane owner.

### 2. MCP version and digest pinning

`.mcp.json` pins the two locally-executed servers:

- `@playwright/mcp@latest` → `@playwright/mcp@0.0.79`. npm forbids
  republishing an existing version, so a version specifier is immutable.
- `crystaldba/postgres-mcp` → `crystaldba/postgres-mcp:0.3.0@sha256:dbbd346860d29f1543e991f30f3284bf4ab5f096d049ecc3426528f20b1b6e6b`.
  The tag alone is insufficient: Docker tags are mutable and can be re-pushed.
  The digest is the multi-architecture manifest digest, so it resolves on both
  amd64 and arm64. The tag is retained alongside it for human readability.

`context7` and `penpot` are remote HTTP endpoints. Their implementation is
controlled server-side and **cannot be pinned from this repository** — this is
recorded as residual risk below, not silently omitted.

**Update process (binding for future changes).** An MCP server version is
raised only by an explicit, human-approved change to `.mcp.json`, and never as
an incidental side effect of another task. Each raise requires: the reason for
updating; a review of the new version's tool descriptions and declared
permissions against the previous version (the tool-poisoning surface); and an
update to this ADR or a superseding one. An agent must not raise a pin to
resolve a failure — that would be self-granted authority under CORE §48.

### 3. Secret-boundary alignment

`.claude/settings.json` `permissions.deny` is extended to mirror `.gitignore`'s
secret definition at any depth — `**/.env`, `**/.env.local`, `**/.env.*.local`
— plus prophylactic private-key and certificate patterns (`**/*.pem`,
`**/*.key`, `**/*.p12`, `**/*.pfx`; no such file exists in the repository
today). `Read(.keystore/**)`, `Read(.env)`, and `Read(apps/api/.env)` are
retained verbatim because the Claude adapter and ADR-0009 cite them as
evidence.

The rule is deliberately **not** `Read(**/.env*)`. That pattern would also
block four legitimately readable, secret-free tracked files:
`apps/api/.env.example` (documentation, placeholder values only) and
`apps/extension/.env.production`, `apps/extension/src/.env.development`,
`apps/extension/src/.env.production` (each containing only
`VITE_API_BASE_URL`). Blocking them would impose friction with no security
gain, contrary to CORE §46.

### 4. Local-override containment

`.gitignore` now ignores `.claude/settings.local.json` in-repository, so the
protection no longer depends on any individual developer's global git
configuration. No equivalent entry is added for OpenCode: it has no
`settings.local.json` convention, and ignoring a file that cannot exist would
be speculative clutter rather than a control.

### 5. Static enforcement of all of the above

`evaluation/ai-system/check-governance.mjs` gains section `[7]` with six
assertions: no `@latest` in `.mcp.json`; every locally-executed MCP server
carries a version or digest; the required deny rules are present; the
blanket `Read(**/.env*)` rule is *absent*; CODEOWNERS covers every
control-plane path; and `.gitignore` contains the local-override rule. Each
assertion was negative-tested — the control was removed, the check observed to
fail, and the control restored — so none is decorative.

## Alternatives

- **Enable `require_code_owner_reviews` immediately.** Rejected: with one owner
  and `enforce_admins: true` it would deadlock the maintainer's own
  control-plane pull requests. Deferred to a second owner, not to a later date.
- **A `PreToolUse` hook enforcing the human gates (commit/push/migrate/docker/
  install/release).** The audit ranked this the largest single gap and it
  remains true. Rejected *for this ADR*: a hook intercepts every Bash call and
  interacts with the existing verified-command allowlist, so it needs its own
  design and decision record rather than inclusion in a hardening pass.
  Explicitly deferred, not dismissed.
- **Digest-pinning `@playwright/mcp` as well.** Rejected as disproportionate:
  npm version specifiers are already immutable, so the digest would add
  maintenance cost for no additional guarantee.
- **Tag-only pin for `postgres-mcp` (`:0.3.0`).** Rejected: it stops automatic
  updates but not a malicious or accidental re-push of the tag.
- **Workflow `permissions:` blocks and SHA-pinning of GitHub Actions**
  (audit findings F-6, F-7). Rejected for this ADR: this is CI supply-chain
  hardening, a different risk domain from the AI control plane, and the highest-
  value target (`release.yml`) holds production deployment credentials and is
  human-only under `AGENTS.md`. It warrants its own decision record.
- **Adding `ai-governance` to `ci.yml` for the `dev` branch** (audit finding
  F-4). Rejected on evidence: `dev` is 130 commits behind `main` with its last
  commit on 2026-07-26; real integration runs through pull requests into
  `main`. The actual gap is different and is recorded under Consequences.

## Consequences

- Control-plane changes now have a declared human owner and generate an
  automatic review request. This is platform-level and survives any change to,
  or bypass of, a runtime's own permission configuration.
- MCP servers no longer change underneath an approved configuration. The cost
  is that updates are now a deliberate, human act — which is the intent.
- `crystaldba/postgres-mcp:0.3.0` was last published on 2025-05-16, over a year
  before this decision. Per CORE §37 this is a maintenance signal on a
  supply-chain component and should be re-evaluated when the `sourcetaster_ro`
  role work from ADR-0009 is picked up.
- **Residual risk, unchanged:** `context7` and `penpot` are remote endpoints
  whose implementation can change without any local signal. No mechanism in
  this repository detects or prevents that. Penpot additionally still has no
  read-only scoping (ADR-0009).
- **Branch protection is tightened in two steps, deliberately.** Before this
  decision, `main` declared `required_status_checks.contexts: []` — no status
  check, including `ai-governance`, blocked a merge. Step one, applied with this
  ADR, makes `lint`, `typecheck`, `build`, and `test` required. Step two adds
  `ai-governance` once it has been observed running on a release pull request.

  The split exists because of how releases reach `main`. `release.yml` does not
  push to `main`: it creates a `chore/release-vX` branch, opens a pull request,
  and calls `gh pr merge --squash` seconds later. Any required check that is
  still queued at that moment makes the merge fail. The four checks in step one
  already run on every pull request today, including release pull requests, so
  their timing behavior is observable from existing history; `ai-governance`
  runs only via `lint.yml` on `pull_request` → `main` and has never been
  exercised against the release job's merge timing. This ADR therefore also
  adds an `ai-governance` job to `ci.yml`, so the check runs on pushes to
  `main` and `dev` as well as on pull requests, giving it coverage before it
  becomes blocking.

  The two `--force` pushes in `release.yml` were reviewed as part of this
  decision and are **not** changed: `git push origin --tags --force` republishes
  a moved tag (`git tag -f`), and `git push origin "$BRANCH" --force` overwrites
  a possibly-stale release branch so the job is idempotent on re-run. Neither
  targets `main`, so `allow_force_pushes: false` on `main` is unaffected.

  **This follow-up materialized immediately and has been resolved.** The first
  release run after the four checks became required (`v2.1.39`, run
  32583696469) failed at the `Create release PR` step with
  `GraphQL: 4 of 4 required status checks are expected. (mergePullRequest)` —
  `gh pr merge` executed 1.5 seconds after `gh pr create`, before the checks
  were even registered. With explicit human approval, `release.yml` now calls
  `gh pr merge --auto --squash`, which hands the merge to GitHub to perform
  once the checks pass. This required enabling `allow_auto_merge` on the
  repository, which was off; `--auto` fails without it.

  The failed run's artifacts (tag `v2.1.39`, branch `chore/release-v2.1.39`,
  PR #248) were removed after verifying nothing referenced them: the tagged
  commit was not an ancestor of `main`, and no GitHub release existed for it.
  `v2.1.39` is regenerated by the first release run after this fix, which also
  serves as the end-to-end proof that `--auto` resolves the interaction.
- ADR-0009's MCP configuration is superseded on the pinning question only. Its
  server selection, security model, and rejected alternatives remain in force.
