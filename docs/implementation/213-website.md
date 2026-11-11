# #213 — Product-first website and question-led documentation

## Basis and scope

The prepared isolated branch `t3/product-first-website` initially matched required
integration commit `55275f49179ac0a2dc832f19ac407161f5202fb4` exactly. Before edits,
ancestry was verified. After the user-scheduled continuation, the clean branch
fast-forwarded to the current local `implement/design-remaining` tip `d5c33ce`,
including the #210 assertion follow-up.

Read issue #213, its body/comments and native dependencies through `gh`;
#206/#209/#210 are closed. Sources are AGENTS.md, GLOSSARY.md,
docs/agents/issue-tracker.md, accepted ADR-0020/0027, the consolidated styleguide,
components static recipes, tokens, voice guide and website design. The explicit
implement-spec and TDD workflows apply within the assigned implementation role.
No predecessor or private repository is needed or read.

The agreed public test seam is the built static website and its actual local
Pagefind distribution. Tests use real routes, browser interactions, output,
requests and storage. Separate release/legal/rights/native gates remain intact;
#214 brand packaging is outside this ticket.

## Validation record

The first built-site journey failed on the absent labelled illustrative figure
before the layout implementation. It now passes in DE and EN: homepage → docs
question → matching article → in-page contents target, including the active
chapter link. Original information/legal paragraphs are retained.

The product example synchronously renders the existing
`ReferenceOutcomeSummary` at build time with an explicitly synthetic Reference
and the actual Not checked Status. It performs no Check, makes no source-existence
claim and ships no React hydration/runtime. No prototype runtime, iframe, state
bridge or unapproved brand asset is used.

Button/Link/Badge/Banner/Kbd classes come from `@source-taster/ui/recipes`.
Tailwind 4.3.4's pure JavaScript compiler emits the finite recipe class set;
no native CSS scanner/compiler or native allowlist is added. The controlled
Astro/Rolldown/Pagefind source build, receipt checks and notice/source package
remain in use. Website-local WOFF2 files have pinned upstream provenance,
conversion details, SHA-256 hashes and complete OFL notices in `public/fonts/`.

Remaining targeted validation is recorded below before the finished commit.

## Checkpoint after integration continuation

The existing partial changes were preserved and `7dd3d0d` was merged without
conflict. The #207 evidence and owner provenance record do not constitute
specialist clearance; no brand distribution or private token activation occurs.

Observed red → green cycles additionally cover:

- Search absent from the common header → DE/EN dialog, actual failed Pagefind
  module/retry/loading/empty results, keyboard result activation and focus return.
  A real regression exposed search-input Esc handling; explicit dialog dismissal
  now handles it consistently. Query text enters neither request URLs nor storage.
- Missing narrow chapter disclosure → native keyboard-operated chapter navigation
  in DE/EN light/dark. The six-case design run passed, including 24 rendered
  home/index/article combinations at 320/1280 px, reduced motion, loaded local
  typography, font responses and axe checks.
- Missing immutable-version link → all four legal drafts in both languages link
  to `draft-2026-10-26.1`, keep their paragraphs and switch version counterparts.
  The legal draft files are unchanged; Contact invents no working address.
- Standalone source landing lacked common navigation/theme → the Astro shell now
  wraps all three existing source landing routes. Its focused DE/EN light/dark
  narrow journey passes with real search and existing download destinations.
  The native delivery tool still generates and verifies the actual archive,
  notices and source/object manifest. The host restores only its static landing
  HTML after delivery; native tool/dependency gates are unchanged.

Website build, website typecheck and content completeness checks pass at this
checkpoint. Full regression, additional search-asset failure cases and final
publication evidence remain pending; this checkpoint is not completion or release
qualification.
