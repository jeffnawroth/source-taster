# Design-system implementation plan

Prepared under [#206](https://github.com/jeffnawroth/source-taster/issues/206), destination of [design map #181](https://github.com/jeffnawroth/source-taster/issues/181). The [ADR](../adr/0027-design-system.md) is proposed; individual visual choices are accepted. **Do not begin the production redesign until #206 records final ADR acceptance.** Issues are fully scoped for agents or explicitly human-owned, with native blocking dependencies. Read an issue's actual live dependencies before claiming it.

No prototype runtime is merged. Production work uses existing business/authority interfaces, preserves requirement priorities and includes concrete validation. All new public implementation slices are children of launch issue #70; the map's synthesis child is #206, not an implementation epic that stays open until every surface ships. Full private briefs/specs/evidence remain private.

## Acceptance and sequencing

1. Owner accepts ADR-0027 and the explicit ADR-0001/0002/0003/0016 refinements. The exact token-sharing wording, bounded Toast export wrapper, suggestion-to-draft convenience and neutral insertion-role reconciliation are visible in the packet. Then close #206 to release the design gate.
2. Build the token interface and align public copy; complete the specialist token/brand rights review in parallel. The legal review is not waived by owner design acceptance and still blocks private consumption/brand-distribution work.
3. Build public primitives and static website recipes. PDF work reuses #105 and may proceed on its token/copy prerequisites without waiting for React composition.
4. Build the shared checking shell, website, independently owned private primitives and brand packaging on their stated prerequisites.
5. Complete detail/edit/export, private Account/order and Operator, and email; prepare truthful selected imagery and automated integration evidence.
6. Complete human/native/assistive/email/PDF qualification against the actual built commits. Existing business, content, legal and release gates still apply.

## Public work

| Issue | Slice | Driver | Blocking prerequisites |
| --- | --- | --- | --- |
| [source-taster#207](https://github.com/jeffnawroth/source-taster/issues/207) | Review token sharing, design contributions and the brand notice | Human | [source-taster#206](https://github.com/jeffnawroth/source-taster/issues/206) |
| [source-taster#208](https://github.com/jeffnawroth/source-taster/issues/208) | Build the value-only design-token package and contrast gate | Agent | [source-taster#206](https://github.com/jeffnawroth/source-taster/issues/206) |
| [source-taster#209](https://github.com/jeffnawroth/source-taster/issues/209) | Build styled RAC primitives and React-free website recipes | Agent | [source-taster#206](https://github.com/jeffnawroth/source-taster/issues/206), [source-taster#208](https://github.com/jeffnawroth/source-taster/issues/208) |
| [source-taster#210](https://github.com/jeffnawroth/source-taster/issues/210) | Align public product copy and assertions with the DE/EN voice guide | Agent | [source-taster#206](https://github.com/jeffnawroth/source-taster/issues/206) |
| [source-taster#211](https://github.com/jeffnawroth/source-taster/issues/211) | Implement the shared feed, compact strip and checking shell | Agent | [source-taster#206](https://github.com/jeffnawroth/source-taster/issues/206), [source-taster#209](https://github.com/jeffnawroth/source-taster/issues/209), [source-taster#210](https://github.com/jeffnawroth/source-taster/issues/210) |
| [source-taster#212](https://github.com/jeffnawroth/source-taster/issues/212) | Implement Reference detail and the explicit suggestion-to-draft workflow | Agent | [source-taster#206](https://github.com/jeffnawroth/source-taster/issues/206), [source-taster#211](https://github.com/jeffnawroth/source-taster/issues/211) |
| [source-taster#213](https://github.com/jeffnawroth/source-taster/issues/213) | Apply website A and the question-led documentation index | Agent | [source-taster#206](https://github.com/jeffnawroth/source-taster/issues/206), [source-taster#209](https://github.com/jeffnawroth/source-taster/issues/209), [source-taster#210](https://github.com/jeffnawroth/source-taster/issues/210) |
| [source-taster#214](https://github.com/jeffnawroth/source-taster/issues/214) | Integrate sRGB brand masters and browser icon packaging | Agent | [source-taster#206](https://github.com/jeffnawroth/source-taster/issues/206), [source-taster#208](https://github.com/jeffnawroth/source-taster/issues/208), [source-taster#207](https://github.com/jeffnawroth/source-taster/issues/207) |
| [source-taster#215](https://github.com/jeffnawroth/source-taster/issues/215) | Prepare truthful A-store and B-social release imagery | Agent | [source-taster#206](https://github.com/jeffnawroth/source-taster/issues/206), [source-taster#212](https://github.com/jeffnawroth/source-taster/issues/212), [source-taster#213](https://github.com/jeffnawroth/source-taster/issues/213), [source-taster#214](https://github.com/jeffnawroth/source-taster/issues/214) |
| [source-taster#216](https://github.com/jeffnawroth/source-taster/issues/216) | Add integrated visual and accessibility regression evidence | Agent | [source-taster#206](https://github.com/jeffnawroth/source-taster/issues/206), [source-taster#212](https://github.com/jeffnawroth/source-taster/issues/212), [source-taster#213](https://github.com/jeffnawroth/source-taster/issues/213), [source-taster#214](https://github.com/jeffnawroth/source-taster/issues/214), [source-taster-service#29](https://github.com/jeffnawroth/source-taster-service/issues/29) |
| [source-taster#217](https://github.com/jeffnawroth/source-taster/issues/217) | Complete human and native-browser acceptance of the built design | Human | [source-taster#206](https://github.com/jeffnawroth/source-taster/issues/206), [source-taster#216](https://github.com/jeffnawroth/source-taster/issues/216), [source-taster#105](https://github.com/jeffnawroth/source-taster/issues/105), [source-taster-service#30](https://github.com/jeffnawroth/source-taster-service/issues/30), [source-taster-service#31](https://github.com/jeffnawroth/source-taster-service/issues/31), [source-taster-service#32](https://github.com/jeffnawroth/source-taster-service/issues/32) |
| [source-taster#105](https://github.com/jeffnawroth/source-taster/issues/105) | Existing accessible Verification report: apply PDF C and medium mapping | Agent | [source-taster#206](https://github.com/jeffnawroth/source-taster/issues/206), [source-taster#208](https://github.com/jeffnawroth/source-taster/issues/208), [source-taster#210](https://github.com/jeffnawroth/source-taster/issues/210) |

#105 remains the single PDF implementation/qualification issue. Its prior evidence, remaining human checks and deliberate omission of PDF/UA identification stay intact. The design addition does not assert conformance or create another engine/renderer project.

## Private work

These public scopes were already selected in #196/#197. Links target private issues; detailed briefs and business/template evidence require private-repository access.

| Issue | Slice | Driver | Blocking prerequisites |
| --- | --- | --- | --- |
| [source-taster-service#29](https://github.com/jeffnawroth/source-taster-service/issues/29) | Build private styled primitives on the reviewed token contract | Agent | [source-taster#206](https://github.com/jeffnawroth/source-taster/issues/206), [source-taster#208](https://github.com/jeffnawroth/source-taster/issues/208), [source-taster#209](https://github.com/jeffnawroth/source-taster/issues/209), [source-taster#207](https://github.com/jeffnawroth/source-taster/issues/207) |
| [source-taster-service#30](https://github.com/jeffnawroth/source-taster-service/issues/30) | Implement full Account pages and ordering with the accepted Plan/Quota hierarchy | Agent | [source-taster#206](https://github.com/jeffnawroth/source-taster/issues/206), [source-taster-service#29](https://github.com/jeffnawroth/source-taster-service/issues/29), [source-taster#211](https://github.com/jeffnawroth/source-taster/issues/211) |
| [source-taster-service#31](https://github.com/jeffnawroth/source-taster-service/issues/31) | Implement the content-free OC Operator inbox and work area | Agent | [source-taster#206](https://github.com/jeffnawroth/source-taster/issues/206), [source-taster-service#29](https://github.com/jeffnawroth/source-taster-service/issues/29) |
| [source-taster-service#32](https://github.com/jeffnawroth/source-taster-service/issues/32) | Apply app-like transactional email layout and align private message copy | Agent | [source-taster#206](https://github.com/jeffnawroth/source-taster/issues/206), [source-taster-service#29](https://github.com/jeffnawroth/source-taster-service/issues/29), [source-taster#210](https://github.com/jeffnawroth/source-taster/issues/210) |

## Evidence contracts and boundaries

Every issue names its source specifications, affected files/areas, acceptance criteria and actual validation. Foundation evidence checks generated contents/values/imports; UI evidence crosses real client/API seams; website uses actual local Pagefind; PDF and email retain their own semantic/output/client gates. Automation is not human screen-reader/native Safari qualification. Keep private evidence in the private repository.

The licensing/brand review and human/native acceptance use `ready-for-human`; implementation work uses `ready-for-agent` plus the actual native blockers. The public #206 acceptance gate applies to every design slice. Do not infer readiness from the label alone. Existing launch work not changed by the redesign (for example Quota enforcement, source qualification and deployment) keeps its existing scope and blockers.

Both appearances, local resources and responsive design are implementation requirements here. Durable Theme preference storage remains a should seam, and the launcher remains an interface to existing actions/navigation. Optional Edge/PWA/Safari asset candidates stay optional. No registry, analytics, new application search, paid-feature promise, legal text rewrite or private verification-content bridge is introduced.

The final release record must trace the selected visual direction, actual capability claims, component/token versions, supported browser/client checks and any remaining findings. Until those gates pass, prototype counts and prepared store images remain design evidence rather than a launch claim.
