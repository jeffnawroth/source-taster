# Accepted design integration

Implementation of the accepted [design packet](../design/styleguide.md) under
launch #70, on `implement/design-remaining`, in
[PR #220](https://github.com/jeffnawroth/source-taster/pull/220).
The public comparison baseline is `5c7d140` (main when integration began).
No prototype runtime is promoted. Full private specifications and evidence stay
private.

## Integrated implementation

| Issue | Result | Evidence |
| --- | --- | --- |
| #208 | Value-only token package; implementation issue closed | [Token contract and contrast gate](208-design-tokens.md) |
| #209 | Owned primitives and static recipes; implementation issue closed | [Primitive evidence](209-ui-primitives.md) |
| #210 | Public DE/EN voice; implementation issue closed | [Copy and integration regressions](210-voice.md) |
| #211 | Shared streamed feed, compact strip, navigation and locally packaged fonts; implementation issue closed | [Real Web/Hosted/native panel evidence](211-checking-shell.md) |
| #213 | Product-first website and question-led documentation | [116 real-site Chromium cases and source-bound build](213-website.md) |
| #105 | PDF C design and publication-entitlement revalidation; qualification issue remains open | [Actual generated-output evidence](105-design-record-sheet.md) |
| #207 | Concrete automated rights research and retained complete Lucide/Feather text; specialist gate remains open | [Primary-source review and owner-supplied provenance](../research/207-design-rights-review.md) |

The website integration commit is `1b79be12d07a818c857ceefc6b0349f9f4f0d988`;
the PDF integration commit is `3b480eb00e2fbcb2d2f2ad285e0b9c71e84c15a0`.
These include the original foundation histories. Existing #218/#219 remain
review sources for those preserved commits; no unrelated PR was merged or
closed by this work.

## Work and actual gates still pending

#211 is integrated at `665fc890ede18b9f7e2f14c91860d9ae70baa6c9` and closed as
an implementation dependency. #212 detail and suggestion-to-draft implementation
is next on this base; no completion is claimed for it yet.

#207's value-only boundary and express MIT permission were concretely inspected,
but the required specialist review and complete authority/brand distribution
evidence remain unestablished. The owner's statement that everything was made
with Claude and Codex is recorded without inventing account/contract facts or
third-party grants. #214 and private #29 remain blocked by #207; #215/#216,
private #30–#32 and #217 retain their downstream dependencies. No private token
consumption, brand distribution, fallback selection or publication is activated.

#105 retains human screen-reader/viewer, actual hosted paid-path, rights and
deployment-resource qualifications. Its deliberate PDF/UA identification
non-claim is unchanged. #217 still requires the actual native/assistive/client
work named in its ticket; automation does not satisfy it.

## Integration validation to finish

The merged website's own worktree passed the exact controlled source build,
receipt and 116 browser cases. The main integration worktree has since rebuilt
and verified its controlled Pagefind receipt and passed a direct website-only
build without pre-existing generated product catalogs. Confirm the receipt
still matches the final integrated inputs before final validation. #211 added
the now-transitive rendered outcome-badge source to the website publication
fingerprint and verified its invalidation control.

The current CI database also reports `RUSTSEC-2026-0486` for the actually selected
`rustix` 1.1.4 native build dependency. [#221](https://github.com/jeffnawroth/source-taster/issues/221)
tracks updating the controlled graph to the published fixed version without a
scan/native-policy waiver. A prior server same-slot completion wait passed all
five cases locally without code/timeout changes, and all four server shards
passed in the following full CI run. No assertion was weakened. The CI suite
inventory and remaining Account-popover navigation assumptions found by that
run have targeted passing integration evidence in the #211 record.

Final integrated checks and the two-axis Standards/Spec review remain pending.
There is no release, deployment, conformance or specialist clearance claim.
