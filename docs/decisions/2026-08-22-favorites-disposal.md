# ADR-0011: Favorites — Disposal of the Workflow Test Feature

> Status: accepted
> Date: 2026-08-22

## Context

During the build-out of the AI operating system, a "Favorites" feature —
client-side persistence of verified sources — was designed and partially
implemented on a working branch. Its purpose was not the product: it was a
vehicle for exercising the design-gate mechanism (`proposed → explicit human
approval → accepted`) end to end on a realistic feature, rather than on a toy
example.

That exercise succeeded and its evidence is preserved: eval scenario 18 covers
design-gate enforcement, and the design gate itself is in force in both
runtimes (`apps/**` and `packages/**` are ask-gated in `.claude/settings.json`
and `opencode.json`).

Commit `391898ae` records the outcome for the feature itself:

> The Favorites feature itself was a disposable test used only to exercise this
> workflow and is deliberately not part of this or any commit.

`main` reflects that outcome consistently: no favorites code exists under
`apps/**` or `packages/**`, and `docs/decisions/README.md` notes that the
number ADR-0007 stays reserved and is not to be reused.

What `main` does not yet record is the forward-looking half of the decision —
that Favorites is out of product scope, and what would be required to change
that. Without it, a future contributor could reasonably read the absence of
code as an unfinished task rather than as a decision. This record closes that
gap.

## Decision

Favorites is not part of the Source Taster product.

1. **Favorites was a workflow test.** It existed to validate the design gate,
   not to ship. The validation is complete.
2. **The implementation is discarded.** No favorites code is to be added to
   `apps/**` or `packages/**`, and no favorites module is to be created in
   `packages/types`.
3. **The decision is against integration**, not merely a postponement. The
   feature is not on the roadmap and no follow-up work is implied by its
   absence.
4. **Reintroduction requires a new decision.** Should client-side persistence
   of verified sources be wanted later, it must go through the normal product
   path — problem, outcome, requirements, design gate, human approval — and be
   recorded in a new ADR that supersedes this one. Reviving prior branch work
   is not a substitute for that.

The design-gate convention that Favorites was used to validate stays in force
and is now exercised by ordinary work.

## Alternatives

- **Record nothing and rely on the commit message.** Rejected: `docs/decisions/`
  is the repository's stated architectural memory (CORE §35, §70). A decision
  discoverable only by reading `git log` is not durable memory — the
  2026-08-22 industry-standard audit found exactly this gap when reading the
  decision records alone.
- **Leave the feature as an open backlog item.** Rejected: it was never a
  product requirement. Carrying it as backlog would misrepresent its origin and
  invite someone to "finish" a test fixture.
- **Restore the branch work and ship it.** Rejected: the feature has no
  validated user problem behind it. It was chosen for the workflow test because
  it was self-contained, not because it was wanted.

## Consequences

- `docs/decisions/` now states the product position on Favorites, not only the
  fact of its absence.
- The evidence that the design gate functions end to end is preserved and is
  unaffected by the feature's disposal — that was the point of the exercise.
- Any future work in this area starts from a new decision record, so the
  reasoning is re-examined rather than inherited from a test fixture.
- No code, test, or configuration change results from this record; it is a
  documentation-integrity decision only.
