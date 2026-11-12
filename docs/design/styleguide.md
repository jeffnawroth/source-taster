# Source Taster styleguide

This is the consolidated design and implementation entry point for [#181](https://github.com/jeffnawroth/source-taster/issues/181). Its visual directions and the joint [ADR-0027](../adr/0027-design-system.md) were accepted by the owner on 10 November 2026 in [#206](https://github.com/jeffnawroth/source-taster/issues/206#issuecomment-6770556807). It is a product specification, not an implementation or conformance claim.

## Read in this order

| Need | Authoritative document |
| --- | --- |
| Ownership, permitted sharing, bounded exceptions | [ADR-0027](../adr/0027-design-system.md), including the accepted refinements to ADR-0001/0002/0003/0016 |
| Role values, text/spacing/shape/motion, glass and numerical contrast | [tokens.md](tokens.md) and its reproducible check seed |
| Component anatomy, state, keyboard behaviour and responsive rules | [components.md](components.md) |
| Human-facing language | [voice-and-tone.md](voice-and-tone.md); backend/domain identifiers remain governed by GLOSSARY.md |
| Public website and documentation | [website-and-documentation.md](website-and-documentation.md) |
| Email medium mapping and Verification report | [email-and-pdf.md](email-and-pdf.md); full transactional templates remain private |
| Brand master/export applications | [brand-assets.md](brand-assets.md), [official requirements](../research/brand-asset-requirements.md) |
| Conflicting/stale source details | [reconciliations.md](reconciliations.md) |
| Immutable decisions, specs and prototype evidence | [sources.md](sources.md) |
| Work sequence and acceptance evidence | [implementation-plan.md](implementation-plan.md) |

The accepted lifecycle/security/legal ADRs outrank prototypes. This guide and reconciliations give current design precedence; the detailed documents own their values and anatomy. Older screenshots are references for the chosen structure, not permission to restore removed tokens, copy or behaviour. No private implementation is copied into this public packet.

## One product

Source Taster is a calm professional workspace for examining academic References with evidence. The product helps a human decide; it does not pronounce misconduct or promise certainty beyond its evidence. Warmth comes from readable type, clear language and generous working space.

Use Atkinson Hyperlegible Next for the interface and IBM Plex Mono at 0.94em for identifiers/evidence metadata. Use the nine steps in the token spec, with a 15 px body. Panel and web share text sizes; save narrow space through layout and spacing. Host fonts locally; PDF uses static TTFs and Noto fallback, while transactional email uses native fallbacks. Do not ship the prototypes' external fonts or fabricated UI.

Use neutral opaque `bg`, `surface` and `surface-sunken` for work. Cobalt accent identifies the primary action, selection, links and running progress. Each view has at most one primary action. Danger colour is used at the destructive confirmation, not as a permanent alarm. Feedback colours have their narrowly specified form/Quota/toast uses; they do not decorate Reference evidence.

Verdict colour appears only in its glyph. Every glyph has a distinct silhouette plus a neutral readable label: circle/check, diamond/difference, linked-ring hexagon, broken-bar rounded square, magnifier/cross, dashed question ring. Status has its own neutral icon/dashed treatment, with running in accent; it is not a seventh Verdict. Counts, filters and reports use the current effective result, with manual provenance and historical system results kept clear.

Glass belongs only on the top bar, sticky strip, Toast, web detail header and command palette. Use `surface` if transparency/blur is unavailable or reduced. The accepted thin rim is an edge, not a licence for a decorative colour field. No ambient glows, scenery, Verdict-tinted cards, button gradients or hero ring. The logo's own gradient remains asset artwork.

## Interaction and accessibility

Use the shared primitives before composing surface layouts. Default controls are 36 px, compact controls 28 px; every target is at least 24×24 px. Labels/errors/buttons wrap without losing meaning. Icon-only controls have an accessible name and matching tooltip. Focus is a 2 px role-coloured outline with a 2 px offset and a system-colour alternative. Disabled/loading controls explain availability and keep stable width.

Keyboard and assistive-technology behaviour are part of the component interface. Modal dialogs trap and restore focus, Esc dismisses where safe, and destructive confirmation starts on the safe action. The desktop detail is non-modal. Feed navigation uses the specified GridList model and stable slot identity; streaming updates existing slots/appends new ones without sorting or moving focus. Back restores the filter, scroll and relevant focused item.

Below 700 px, the compact sticky strip is one row of glyph/count filters, separate Status count and menu, plus a 2 px progress bar. The summary sentence moves above the feed. Only this strip may suppress visible Verdict labels; accessible names/tooltips, a labelled active-filter chip and Show all labels preserve meaning. Do not generalize glyph-only meaning to cards, History, PDF or ordinary menus.

Progress announcements are bounded meaningful changes rather than every event. Action-bearing toasts never expire automatically; other toasts pause their five-second timeout on hover/focus, with at most three shown. The Tooltip/Spinner timings, form-control details, overlay widths and table breakpoint inherited from #195 are implementation defaults to validate, not new business policy. Motion is CSS-native with a direct final-state fallback and no movement under reduced motion.

## Surface composition

| Surface | Selected composition | Continuity requirement |
| --- | --- | --- |
| Web checking | D, streamed feed + sticky strip; push detail | Stable Check/result identity and one input-to-evidence workflow |
| Extension | Same components, compact strip; full detail + Back | Same functionality subject to existing extension/web exceptions; no embedded purchase UI |
| Account/ordering | KA full pages/stepper with KC Plan/Quota hierarchy | Account popover opens pages; open client retains its Check context without exporting Reference content to the private service |
| Operator | OC actionable inbox and work area | Content-free metadata, explicit permissions/fresh proof, stable pending/outcome operation references |
| Website | A product-first home, C question-led docs index, A article navigation | Same brand/static recipes, honest availability, public help/legal access and language-preserving links |
| Transactional email | A event/action-first single column | Opaque sRGB, native fonts, HTML/plain-text pairs and existing content/authority limits |
| Verification report | C overview + numbered records and aligned fields | Actual authorized snapshot, vector marks, per-result provenance, semantic PDF structure |
| Store / social | A product series / B typographic link previews | Approved optical marks and truthful actual-product captures before publication |

The Account/Operator details live only in the private repository's `docs/design/private-surfaces.md`; the public #196 resolution records the selected composition. Private transactional specifications likewise stay private. No cross-repository component import or Check-content bridge is implied by visual continuity.

## Copy, scope and state

German uses Sie, Befund, Prüfung, Kontingent and Prüfpaket. English uses sentence case and ordinary lower-case domain nouns in prose; canonical labels keep their agreed spelling. Use brief labels/toasts, explanatory Verdict/dialog text and next-step-first actionable errors. A Verdict is not evidence of deception. Unknown evidence stays unknown; do not convert technical outages or partial checks into Not found.

Copy never invents a capability or changes an amount/deadline/consent. A previously debited slot is not charged again; a previously unbilled slot incurs its first debit only under ADR-0005's actual rule. Do not promise every retry is free. Reviewed/versioned legal texts and fixed statutory button wording are not freely rewritten to fit the voice.

Apply to fields is the accepted ADR-0027 draft-only convenience. It creates only a draft, from proven structured values, with no save/check/debit before Save and re-check. Copy and transient export selection stay distinct. An existing dirty draft needs deliberate replacement; a stale result cannot supply a new draft. Immutable input and prior result/revision evidence remain intact.

Preserve ADR-0003 mode semantics: hosted service failures fail closed, while explicit standalone mode has no Guest/Account/Plan/Quota/purchase service UI. Visual continuity is not permission to fabricate entitlement state or downgrade an outage into Guest mode.

Design both appearances and System-default CSS. Persistent manual Theme choice retains its should status; the launcher may invoke existing commands/routes without becoming a new full-text application search. The catalogue is not authorization to implement other should/deferred features. Prototype paid-account/deferred-start fixtures and in-memory DPA operations are not business implementations.

## Delivering and checking the design

The open token package exposes CSS plus resolved/backdrop-composited constants, without runtime dependencies or component/brand/font code. The private service consumes the MIT branch by the same full SHA as the contracts only under the accepted licensing/review path. Each repository hosts fonts and owns primitives; compare their first implementations for drift.

Use the [implementation plan](implementation-plan.md) rather than porting prototype code. Numerical token checks, source specimen counts and screenshots are design evidence. Actual components need DE/EN, long text, meaningful invalid/empty/loading/error states, wide/360 px and 320 px reflow, zoom, keyboard, announcements, greyscale, reduced settings, forced colours, rendered contrast and native-browser verification. Human screen-reader/Safari and email/PDF-specific gates remain explicit. Publication still depends on actual qualified functions, reviewed legal information and the existing release process.
