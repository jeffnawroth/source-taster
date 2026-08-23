# ADR-0020: `bootstrap-sha` Does Not Bound History When a Release Tag Exists

> Status: accepted
> Date: 2026-08-23

## Context

ADR-0019 adopted release-please and pinned `bootstrap-sha` to `0afab560` (the
`chore(release): v3.0.0` commit) to stop release-please from re-collecting the
entire commit history — the known consequence of the unreachable tags recorded
in ADR-0013.

**That reasoning was wrong, and the first run proved it.** On the very first
push to `main` after adoption, release-please opened
`chore(main): release 4.0.0` — a major bump derived from
`feat(api)!: remove observability, tracing and logging entirely`, a commit that
was already released in `v3.0.0` — with a changelog spanning roughly 200
historical commits.

The offending commit is *older* than the configured `bootstrap-sha`, so the
option plainly had no effect.

### Why the option did not apply

From `src/manifest.ts` in release-please:

```ts
const needsBootstrap = releasesFound < expectedReleases;
...
if (this.lastReleaseSha && this.lastReleaseSha === commit.sha) {
  break;                                   // unconditional
} else if (needsBootstrap && commit.sha === this.bootstrapSha) {
  break;                                   // only when nothing was found
} else if (!needsBootstrap && releaseCommitsFound >= expectedShas) {
  break;                                   // stop at the last release's SHA
}
```

`bootstrap-sha` is consulted **only when release-please found no release at
all**. It did find one: `backfillReleasesFromTags` located the `v3.0.0` GitHub
release, so `releasesFound == expectedReleases` and `needsBootstrap` was
`false`.

The walk therefore fell through to the third branch — stop once the last
release's commit SHA is seen. That SHA is `582b1d6e`, the pre-squash commit on
the abandoned `chore/release-v3.0.0` branch, **which is not reachable from
`main`**. The iterator never encountered it and walked to the root of history.

This is the third defect caused by the unreachable tags from ADR-0013, after the
bump-range bug (ADR-0013 itself) and the `v2.1.2...v3.0.0` compare link in
`CHANGELOG.md`. ADR-0019 fixes the cause going forward — new tags are created on
`main` — but the pre-existing tags still poison the first run.

## Decision

Replace `bootstrap-sha` with `last-release-sha` in `release-please-config.json`:

```diff
-  "bootstrap-sha": "0afab560dea3475da11c095c30257122745ced19",
+  "last-release-sha": "0afab560dea3475da11c095c30257122745ced19",
```

`last-release-sha` is checked unconditionally, before the `needsBootstrap`
branch, so it bounds the walk regardless of what `backfillReleasesFromTags`
found. `0afab560` is the squash result on `main` and is genuinely reachable.

The release PR `chore(main): release 4.0.0` is **closed, not merged**. Merging it
would have published a bogus major version and deployed it to production.

## Alternatives

- **Delete or re-point the `v3.0.0` tag** so `backfillReleasesFromTags` cannot
  find an unreachable SHA. Rejected, consistent with ADR-0013: force-pushing
  published tags breaks existing clones, and deleting a published release
  discards its artifacts.
- **`skip-github-release` for one run.** Rejected: it suppresses the symptom for
  a single run and leaves the range computation wrong.
- **Set `release-as: 3.0.1` once.** Rejected: it fixes the version number but
  still writes a changelog containing ~200 already-released commits.
- **Lower `commit-search-depth`.** Rejected as a blunt instrument — it bounds the
  walk by commit count rather than by the actual release boundary, and would
  silently truncate a legitimately large release.

## Consequences

- The next release-please run bounds its range at `0afab560`. Only commits after
  the `v3.0.0` release are considered.
- Since every commit after that boundary is currently `ci:`, no version bump
  qualifies and no release PR should exist. Its disappearance is the
  verification that this fix worked.
- `last-release-sha` becomes inert once the first release-please release lands:
  the walk will then stop at that release's SHA, which *is* reachable from
  `main`, before ever reaching the configured value. It should be removed in a
  follow-up rather than left as permanent configuration that no longer describes
  reality.
- ADR-0019 is not edited. Its `bootstrap-sha` rationale is wrong and stays on the
  record; this ADR supersedes that specific decision, matching how ADR-0013
  corrected ADR-0012.
