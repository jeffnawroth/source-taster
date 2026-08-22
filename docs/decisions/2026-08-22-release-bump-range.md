# ADR-0013: Release Bump Range — Release Tags Are Not Reachable from `main`

> Status: accepted
> Date: 2026-08-22

## Context

ADR-0012 repaired the minor-version-bump selector in `release.yml`, which had
been structurally unable to match. That fix was correct in isolation and
immediately produced a wrong result: the next release bumped `2.1.39 → 2.2.0`
instead of the predicted `2.1.40`.

ADR-0012's Consequences section predicted `v2.1.40`. **That prediction was
wrong**, and it was wrong because the ADR did not verify the other input to the
same expression — the commit range.

### The unverified input

`release.yml` computed the range from `git describe --tags --abbrev=0`. That
returns the most recent tag *reachable from HEAD*. Measured on 2026-08-22:

| Tag | Commit | Reachable from `main`? |
|---|---|---|
| `v2.1.36` | `f9fb8173` | **no** |
| `v2.1.37` | `e6a70fc5` | **no** |
| `v2.1.38` | `56a8a265` | **no** |
| `v2.1.39` | `44ebd04b` | **no** |

`git describe --tags --abbrev=0 main` returned **`v2.1.2`** — a range of **178
commits** spanning months, while the released version was `v2.1.39`.

The cause is ordering inside the release job. `git tag -f "v$VERSION"` runs
*before* `gh pr create`, so the tag is placed on the local, pre-squash commit.
The pull request is then squash-merged, which produces a **different** commit on
`main`. The tag is left pointing at the abandoned release branch, and no release
tag since `v2.1.2` is an ancestor of `main`.

### Why this went unnoticed

The two defects masked each other. With the minor selector unable to match, the
oversized range was harmless — every release resolved to a patch bump regardless
of how many commits it spanned. Repairing the selector removed the mask, and the
178-commit range immediately matched `feat:` commits that had already shipped in
`2.1.3`–`2.1.39`.

## Decision

### 1. Derive the range from the previous release commit, not from tags

```diff
-LAST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "v0.0.0")
+LAST_RELEASE=$(git log --format="%H" --grep="^chore(release):" --max-count=1 || true)
+RANGE="${LAST_RELEASE:+$LAST_RELEASE..}HEAD"
```

`chore(release):` commits are the squash-merge results, so they are genuinely on
`main` and are a reliable boundary. The `${VAR:+...}` form degrades to plain
`HEAD` if no release commit exists yet, so a fresh repository still works.

The release job never runs on a `chore(release):` commit — the job's own `if:`
guard excludes it — so the grep always finds the *previous* release, never the
current one.

Verified against real data before adoption: the new expression yields the
`v2.2.0` commit as boundary and a patch bump for the commits that follow it;
the old expression yields `v2.1.2` and a 178-commit range.

### 2. `v2.2.0` stands

The release is published with both extension artifacts and the version is
monotonically greater than its predecessor. Deleting a published release and
its assets would be a larger harm than the version jump, and version numbers
carry no requirement beyond monotonicity. The next release is `2.2.1`.

### 3. The dangling tags are left in place

Tags `v2.1.3`–`v2.2.0` continue to point at commits on abandoned release
branches. They no longer affect versioning after decision 1. Re-pointing them
would require force-pushing published tags, which breaks any clone that has
already fetched them.

**Known limitation, recorded rather than fixed:** `git describe` on `main`
remains misleading, and `git log v2.2.0..main` does not mean "changes since the
last release". Anyone needing that should use the `chore(release):` commits.
Fixing it properly means tagging after the merge, which requires a second
workflow triggered by the release push — a restructure of a production,
human-authorized-only workflow, and disproportionate to the remaining impact.

## Alternatives

- **Tag after the merge (second workflow).** Rejected for now as
  disproportionate — see the limitation above. This is the correct root fix if
  `git describe` accuracy ever becomes load-bearing.
- **Revert ADR-0012's minor-bump fix and stay patch-only.** Rejected: it would
  restore a state where a code branch cannot execute, and would hide the range
  defect again rather than resolve it.
- **Force-push the existing tags onto their `main` counterparts.** Rejected:
  rewriting published tags breaks existing clones, and the mapping from a
  pre-squash commit to its squash result is not mechanically derivable for all
  37 versions.
- **Roll back `v2.2.0`.** Rejected: the artifacts are published and may already
  have been fetched.

## Consequences

- Version bumps are computed over the commits actually released since the last
  release, so the class of defect that produced `2.2.0` cannot recur.
- The next release is `2.2.1`; a release containing a `feat:` commit yields
  `2.3.0`.
- ADR-0012 keeps its `v2.1.40` prediction as written. It is wrong, and this
  record is the correction — per `docs/decisions/README.md`, superseded content
  remains rather than being edited.
- **Process lesson, worth stating:** ADR-0012 changed one input of an expression
  and predicted the outcome without checking the other input. Running
  `git describe --tags --abbrev=0 main` once would have exposed the defect
  before the change shipped. A prediction in an ADR is a claim and needs the
  same evidence as any other.
