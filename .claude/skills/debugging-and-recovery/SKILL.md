---
name: debugging-and-recovery
description: Recovering from a broken state — a hypothesis-first bug diagnosis procedure, merge-conflict resolution that preserves both sides' intent, and the expand-migrate-contract pattern for wide mechanical refactors. Use when debugging a failure, resolving a merge conflict, or running a large mechanical change across many files.
---

# Debugging & Recovery

Not this skill — for writing new code well from the start, see
`engineering-craft`.

## Bug diagnosis

1. **Build a tight, reproducible feedback loop first.** Before forming any
   hypothesis, get to a state where you can trigger the bug on demand in
   seconds, not minutes. This is the highest-leverage step and the one most
   often skipped.
2. **Reproduce and minimize.** Strip the reproduction down to the smallest
   input that still triggers it.
3. **Generate 3–5 falsifiable, ranked hypotheses before testing any of
   them.** Write them down first — don't test-and-hope your way to an
   explanation one guess at a time. Rank by plausibility, then test the top
   one.
4. **Instrument with tagged debug output** (e.g. a distinctive marker you can
   grep and remove later) rather than guessing blind.
5. **Fix at the correct seam** — the boundary where the bug actually
   originates, not the first place the symptom is visible.
6. **Add a regression test, then clean up** every temporary log/marker added
   during diagnosis before considering the fix done.

## Merge-conflict resolution

- **Never `--abort`** as a way to avoid resolving a conflict — that discards
  the reason the merge was needed in the first place.
- For each conflicting hunk, trace its intent to its source (the commit
  message, the PR, the issue it addressed) before deciding how to resolve it.
- Resolve **preserving both intents** where they don't genuinely conflict —
  a textual conflict is not always a semantic one.
- Verify with typecheck/lint/test before committing the resolution; a conflict
  that "resolves" cleanly but breaks the build is not actually resolved.

## Wide mechanical refactors

For a change with wide blast radius but low semantic risk (e.g. renaming a
widely-used type, changing a shared function's signature) — don't force it
into one giant vertical slice. Use **expand → migrate → contract**:

1. **Expand** — add the new shape alongside the old one; both work.
2. **Migrate in batches** — move callers over incrementally, verifying after
   each batch.
3. **Contract** — remove the old shape only once every caller has migrated.

This keeps every intermediate state shippable, unlike a single all-at-once
change that leaves the codebase broken until it's entirely finished.
