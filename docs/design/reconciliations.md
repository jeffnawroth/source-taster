# Design-source reconciliation

Prepared for #206 / proposed ADR-0027. This makes source precedence explicit rather than silently treating prototype behaviour as accepted product policy.

| Source mismatch or open point | Consolidated treatment | Status |
| --- | --- | --- |
| #189 token-only distribution widens ADR-0001/0003's transport-only exception | Exact agreed amendment is included in the ADR packet; only values/CSS/constants cross, no components/behaviour/brands/fonts; legal questions remain separate | Joint ADR acceptance pending; FA-UEB-23 is not passed |
| #195 uses unstable RAC Toast exports on an otherwise stable foundation | One exact-pinned wrapper owns only the two named unstable exports, with upgrade tests and an exit at stable exports | Bounded exception included for joint acceptance |
| #195 CorrectionActions is explicitly pending client; ADR-0016 currently offers edit/copy/export separately | Apply proven values to a revision-bound draft; explicit Save and re-check alone commits/runs; never overwrite input or infer values from formatted text | Explicit convenience refinement included for joint acceptance |
| #195 calls tracked changes neutral, but #193 seed still has cobalt insertion values | Keep role names, use the existing neutral deletion background/line values, regenerate values and gate the actual alpha composite | Proposed presentational reconciliation; 158 pairs pass |
| #192 voice shorthand promises every same-slot Re-check is free | Qualify against ADR-0005/0016: no second debit for a debited slot; a previously unbilled slot can incur its first debit on a Verdict | Existing billing policy preserved; no new decision |
| Earlier #194/195 Account popover can be mistaken for the working area | Keep the entry popover; #196 KA full pages and stepper own substantive Account work | Later accepted #196 choice prevails |
| #191 originally proposed glow, colour fields, hero and large display text | Apply #194/195 removals, two glass variants, nine type steps, glyph-only Verdict colour | Accepted later refinement; historical source remains pinned |
| #181 visual scope includes light/dark, while ADR-0023 keeps Theme a should | Build both role sets and System-default CSS; preserve the durable selector/storage seam without a new launch must | No promotion of requirements |
| ⌘K prototype has broad simulated search | Use the launcher for existing actions/navigation; do not add a new data/search feature from a mock command | Existing scope preserved |
| #195 lists drafted timings, widths, zero-counter state, Meter/form details and announcement batching | Treat them as implementation defaults; verify effective semantics/focus/contrast against the detailed spec and actual content | Routine defaults, not independently accepted business rules |
| Proto stores are in memory and include deferred activation, consent bookkeeping, DPA reload and operation fixtures | Use production interfaces, authoritative dates/consent/current entitlements and stable operation references; never port fixture state transitions | Existing business ADRs prevail |
| #197 PDF prototype shows a complete visual report; #105 remains open with PDF/UA identification intentionally unset | Add the selected C layout to #105; keep its existing PDF/UA non-claim and human/output checks; do not create a duplicate PDF engine ticket | Existing acceptance is not changed |
| Website prototype content/FAQ can describe a different DOI availability than the current qualified build | Reconcile claims against actual release evidence; local documentation search never indexes private content or sends queries | Release-content work, not new feature availability |
| #199 has AMO source/deployment uncertainty and unverified current X guidance | Preserve candidate dimensions and re-check the actual uploader/consumer before publication | Qualification, not an unresolved visual choice |
| Private code/specs exist alongside public review sources | Keep full Account/Operator and transactional specifications in the private repository; public packet contains accepted public decisions and source pointers only | Repository boundary preserved |

The seed checks are not production gates. No original source branch is rewritten, no private implementation is declassified, and no requirement priority or legal approval is inferred from owner acceptance of a visual prototype.
