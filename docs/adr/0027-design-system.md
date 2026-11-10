---
status: proposed
---

# Build one calm product identity with shared tokens and independently owned components

The owner selected the identity and surface structures in [design map #181](https://github.com/jeffnawroth/source-taster/issues/181), after comparing the prototypes in #191–#199. Consolidate those decisions into one [styleguide](../design/styleguide.md), share only project-owned design tokens across the open/private repositories, and implement each surface against its existing business interfaces. This gives checking, Account, Operator, public information, email and PDF a coherent identity without distributing open verification components into the proprietary service.

This ADR is the **proposed joint acceptance packet** under [#206](https://github.com/jeffnawroth/source-taster/issues/206). The individual visual choices are accepted; this record and its explicit refinements below await final owner acceptance. It neither merges the prototypes nor claims implemented, qualified or published output. The current requirements baseline remains v3.4. No must/should/deferred obligation is promoted by the component catalogue or a prototype control.

## Identity, foundation and composition

- Keep React Aria Components 1.x and Tailwind CSS 4 under ADR-0002. Copy and restyle the official RAC Tailwind starter as project-owned primitives; it is not a runtime dependency. Use the selected stable styling helpers and locally bundled Lucide generic icons from #188. Pin and qualify exact versions at implementation; this packet does not update dependencies.
- Use Atkinson Hyperlegible Next and IBM Plex Mono, locally hosted. The PDF uses static TTFs with the Noto fallback; email uses dependable native font fallbacks. The two-drop quotation mark is brand artwork; the six Verdict glyphs are distinct project-owned SVG shapes with readable labels.
- Use semantic sRGB-safe roles, a 15 px body scale, the same text steps for panel and web, 36/28 px controls and targets at least 24×24 px. Ordinary working surfaces are opaque and neutral. Verdict colour appears only in its glyph; labels, cards, counters, field evidence and tracked-change previews stay neutral. Accent identifies actions/selection; feedback colours have the limited non-result uses in the styleguide.
- Glass is limited to TopBar, sticky SummaryStrip, Toast, the web detail header and CommandPalette. Keep two variants (`glass`, `glass-overlay`) with an opaque `surface` fallback. No broad colour fields, background glow, button gradients or Verdict tints. The glass edge treatment and logo artwork are not decorative page gradients.
- Use #194 D **Feed + sticky strip** for the shared checking workspace. Detail is a non-modal push drawer at sufficient width and a full view with Back when narrow. Below 700 px only the compact strip may omit visible Verdict labels: retain glyph, count, accessible name, tooltip, labelled active filter and a way to reveal all labels.
- Use #196 **KA with KC's combined Plan/Quota hierarchy** for full Account pages and a full-page ordering stepper, and **OC** for the Operator inbox/work area. The Account popover remains an entry point. Preserve Check context in the open client without carrying Reference content into private pages.
- Use #197 **email A** and **PDF C**, #198 **website A with C's question-led documentation index**, and #199 **store imagery A, social previews B, shared icon family**. Medium and surface details remain in their linked specifications. A design example never proves a released capability.

## Token contract and repository ownership

The proposed ADR-0001/0003 refinements below apply the exact wording agreed in [#189](https://github.com/jeffnawroth/source-taster/issues/189#issuecomment-6703601977):

> **ADR-0001, “Narrow contract exception”, new sentence:** Project-owned design tokens are also available under `AGPL-3.0-or-later OR MIT`. These are the named colour, type, spacing, shape, elevation and motion values, expressed as CSS custom properties and as constants derived from them. The token package contains no components, no behaviour, no logo, wordmark, glyph or font files, and depends on no AGPL-only package.
>
> **ADR-0001, “UI separation”, addition:** Each program builds its own UI components; they share only the design tokens. The logo and wordmark are brand assets outside every code licence.
>
> **ADR-0003, “Contract packages”, addition:** The design-token package is distributed the same way, pinned to the same reviewed commit SHA as the contracts. The service selects the MIT licence branch.

The package is `packages/design-tokens`, exposed as `@source-taster/design-tokens`: committed generated `theme.css`, resolved sRGB constants and backdrop-specific opaque constants for email/PDF. It has no runtime dependencies. Culori is an open-repository development dependency only. Generation and the contrast gate run in the open repository; private programs consume reviewed outputs by full SHA, bumping all public Git dependencies together. Verify update tooling rather than assuming Dependabot understands those pins.

Public primitives/domain components stay in `@source-taster/ui`; static website recipes must have a React-free import path. Private primitives are independently implemented from the starter/spec and never import `@source-taster/ui` or `@source-taster/i18n`. Private-only component tokens may derive from shared roles, but may not override shared semantic values. Compare primitive implementations after the first private implementation before reconsidering the sharing model.

The existing FA-UEB-23 review must examine actual CSS/constants distribution, design-contribution/agent-output rights and CLA coverage, brand-notice wording, and program communication. This ADR's acceptance is not that legal review. If it rejects token sharing, return the concrete finding; #189's fallback C is independent re-derivation plus drift checking, not silent copying or an automatically selected implementation.

## Narrow refinements included in this acceptance

**Unstable Toast API.** Permit only `UNSTABLE_Toast` and `UNSTABLE_ToastRegion` from an exact-pinned stable RAC release behind one project-owned wrapper. No other code imports them. Re-test keyboard/live-region behaviour on each upgrade; remove the unstable shim when stable exports exist. This is a bounded unstable-export exception, not permission for a prerelease library, another unstable export or a new pre-1.0 core dependency. ADR-0002 otherwise stands.

**Apply a Correction suggestion to a draft.** Add **Apply to fields** as a convenience beside Copy and Use for export. On explicit invocation, copy only eligible proven structured suggestion values into an editable draft bound to the selected current result/revision. Nothing is saved, searched, debited or treated as verified at this point. Discard restores the committed view. Only explicit **Save and re-check** commits a user-provenance revision and requests that slot's Re-check through the existing interface. Never parse formatted suggestion text to invent structured fields, overwrite immutable input, silently replace an existing dirty draft, or apply stale/unknown fields. If authoritative structured values are unavailable, keep the existing edit/copy/export actions and explain the unavailable convenience. This refines ADR-0016's interaction, not its lifecycle, evidence or billing rules. A previously unbilled slot can still incur its first debit on a Verdict.

**Neutral tracked-change roles.** Resolve the #193/#195 source mismatch by giving `correction-insert-bg` and `correction-insert-line` the existing neutral deletion-role values in both modes, keeping the public names. Strike versus underline and explicit inserted/deleted accessible text carry the distinction. Regenerated tables and the 158-pair gate describe these actual composited values. This is a presentation reconciliation, not a field or suggestion-policy change.

## Scope, authority and delivery

Both light/dark appearances and System-default CSS are designed. A durable manual Theme preference remains the ADR-0023 should seam; it is not a launch blocker introduced here. Likewise the launcher may expose existing actions/navigation but does not promote a new application search service. Context-menu intake, reconnect, History, consent, eligibility, billing, cancellation, DPA, Operator proof and data boundaries remain under their accepted ADRs. No prototype fixture or UI placement grants authority.

The [reconciliation record](../design/reconciliations.md) distinguishes source corrections from pending approval and implementation defaults. Legal/versioned copy, no-analytics/public-content-only search, token/brand rights, reported-wrong-Verdict ownership, exact Check/result snapshots and native acceptance gates remain in force. Keep private specifications and templates private. The [implementation plan](../design/implementation-plan.md) gives each slice a repository, dependencies, evidence and review gate; it reuses #105 for PDF instead of creating a competing implementation.

Before launch, verify actual built outputs: DE/EN, wide/narrow, keyboard and focus restoration, meaningful announcements, 200% zoom and 320 px reflow, greyscale, forced colours, reduced motion/transparency, rendered contrast including glass, supported native browsers and human screen-reader use. Email/client and tagged-PDF checks remain medium-specific. Prototype counts and the numerical token gate are useful source evidence, not production accessibility or release certification.

## Alternatives and consequences

The prototype process rejected a new component framework, a shared proprietary/open component package, new visual identities per surface, cramped Account sheets, the full single-page Account, and decorative glow/colour fields. Independent private primitives cost a small amount of duplicated styling, in exchange for a narrow transportable contract and explicit ownership. Token-name removal/rename is breaking and requires coordinated consumers; colour value changes still require regression/contrast review. The final specifications take precedence over stale prototype copy, fixture behaviour and historical seed descriptions.
