# #213 — Product-first website and question-led documentation

## Basis and delivered behavior

The isolated branch `t3/product-first-website` initially matched required base
`55275f49179ac0a2dc832f19ac407161f5202fb4`; ancestry was verified before edits.
It subsequently merged `d5c33ce` (#210 assertion follow-up) and `7dd3d0d` (#207
research/notice/provenance). Partial work survived both scheduled continuations
and was checkpointed at `ad8d72a`. The final integration merge `135987a` includes
`1da017b` (#209 pending-width test timing) and the current tip `3b480eb00e2fbcb2d2f2ad285e0b9c71e84c15a0`
(public #105 PDF integration). No predecessor, private source or other worktree
was used.

Read #213 and its comments/native dependencies through `gh`; #206/#209/#210
are closed. Implementation follows accepted ADR-0020/0027, the styleguide,
website specification, static component recipes, tokens and voice guide, within
the explicitly invoked implement-spec/TDD workflows and approved public seams.

- Home uses the product-first split with a labelled synthetic Reference and the
  actual `ReferenceOutcomeSummary` Not checked markup, rendered synchronously at
  build time with locale restoration. It runs no Check and claims no source
  existence, available public service or qualified release.
- The docs index asks questions leading to the existing guides. Articles retain
  their content, with persistent desktop chapters/reading/contents and a native
  chapter disclosure on phones. Public routes, same-page DE/EN switching, skip
  link, help/FAQ/contact/accessibility and configured cancellation handoff remain.
- The common header opens local Pagefind in a modal search dialog. Loading,
  result counts, empty/error/retry states are translated. Esc dismisses, focus
  wraps and returns, and late results cannot replace newer input. A fresh module
  instance retries poisoned module/index/WASM/fragment loads without putting
  user text in URLs. Closing clears the transient query.
- Button/Link/Badge/Banner/Kbd use `@source-taster/ui/recipes`. Tailwind 4.3.4's
  pure JavaScript compiler emits the finite static class set. No React runtime,
  client island, prototype runtime, iframe/state bridge or native CSS tool is
  added. Colors/type use semantic roles and local typography.
- All four exact legal drafts link to their immutable version and language
  counterpart. Legal JSON and business/security/consent/billing/storage policy
  are unchanged. No support address/domain, qualified feature or brand asset is
  invented or activated.
- The three existing Pagefind source landings now use the Astro shell. The
  controlled delivery tool still owns the actual archive, notices and bound
  source/object manifest; the website restores only its own static landing HTML.
  Complete UI/font grants are also delivered via a translated footer link.
- Publication fingerprints now include the new public assets and actual shared
  recipe/token/product/catalog inputs. This retains the existing byte-bound
  review policy; it adds no approval, native exception or rights clearance.

Website-local font provenance, hashes, complete OFL grants and conversion details
are in `apps/website/public/fonts/README.md`. Atkinson retains its full variable
coverage and declares no Reserved Font Name in its notice. Plex uses the exact
unmodified upstream IBM WOFF2, preserving its RFN and complete notice. No shared
UI font assets were added; #211's separate future integration can deduplicate
these public assets against its actual chosen files.

## Observed red → green evidence

Tests cross the agreed built-site/actual Pagefind/public output seams, with
independent expected routes, labels, grants and version rules. No internal
collaborator or search-engine stand-in is mocked.

| Observed red | Result after implementation |
| --- | --- |
| No labelled product example | DE/EN home → question → guide → contents target passes |
| No common-header search | Real module failure/retry/loading/empty and keyboard activation pass |
| Search input consumed Esc | Dismissal clears input and restores the trigger |
| Missing narrow chapter disclosure | Native keyboard chapter navigation passes in both languages/modes |
| No immutable-version link | Four legal documents × DE/EN retain exact paragraphs/version counterparts |
| Source landing lost common navigation/theme | DE/EN light/dark 320px source-to-search journey passes |
| Font/shared-input edits retained the publication fingerprint | CLI negative controls invalidate every tested input and restore original bytes |
| No distributed interface notice | Complete Apache/MIT/ISC/OFL grants are publicly downloadable |
| Native modal boundary could hand focus to browser chrome | Explicit first/last control loop passes forced-color/reduced-setting cases |

Actual entry/WASM/fragment abort-and-retry cases pass in DE/EN. Delayed fragment
responses cannot overwrite a newer empty search. Tests verify same-language
expected guide routes, query-free requests, same-origin resources, zero cookies,
local/session storage, IndexedDB, CacheStorage and service-worker registrations.
The full retained privacy suite rejects remote resources/embeds, React runtime
and client islands. Actual Pagefind source/WASM object downloads remain hash-bound.

## Final validation

- `SOURCE_TASTER_WEBSITE_E2E_PORT=53213 pnpm --filter @source-taster/website test:e2e`:
  **116 Chromium tests pass** after the final integration merge, including every
  original website assertion.
  Search assertions now open the visible dialog and retain language, destination,
  privacy and output checks. No deadline or outcome check was weakened.
- All emitted index-page routes pass existing 320/1280px axe/reflow checks.
  Additional DE/EN light/dark home/index/article cases cover 24 rendered
  combinations with loaded local fonts. Source landings, no-JavaScript chapter
  access, reduced motion/transparency, forced colors and modal focus are covered.
  Rendered captures were inspected for desktop home and narrow dark article.
- `pnpm --filter @source-taster/website build`: passes with the controlled native
  receipt/trace, actual DE/EN Pagefind indexes and corresponding-source delivery.
  `pnpm pagefind:verify` passes; no native dependency gate or policy was changed.
  After the integration Lockfile/catalog update, frozen installation, catalog
  generation and controlled fetch/build/site-build were rerun before the full
  116-case suite. The receipt therefore binds the merged Lockfile.
- `pnpm i18n:check`: passes, with 551 messages per public catalog, 10 paired
  information pages, 4 paired legal documents, 45 site UI texts and 8 source
  access texts. Guide questions and section-heading completeness are checked.
- Website typecheck, ESLint, Prettier and `git diff --check` pass.
  `pnpm audit:licenses` passes: 570 installed package licenses, 108 runtime packages.
- `pnpm --filter @source-taster/website publication:check`: **expected rejection**
  for the unselected HTTPS domain/support address/seller details, eight approved
  legal versions and current legal/claims/dependency/accessibility/translation
  reviews. Browser tests also confirm publication builds/servers reject drafts.

## Remaining qualification gates

### Direct-build integration follow-up

The first Linux dependency job invoked the website build directly on a clean
checkout and exposed its new build-rendered product's missing generated i18n
runtime. The website script now generates its public catalog dependency before
starting the guarded Astro build, independently of Turbo's dependency ordering.
The native guard, source receipts and publication refusal are unchanged.

The main integration worktree has since passed controlled Pagefind fetch, build
and verify. A direct website-only build with the generated product catalog
directory removed regenerated it and passed the full controlled build, real
DE/EN indexing and hash-bound source/notice delivery. No stale generated runtime
or another worktree's receipt was used. The original generated directory was
kept as a temporary rollback until this check succeeded.

No known #213 implementation gap remains. Chromium automation is not human
screen-reader review, native browser-chrome zoom, Safari/Firefox qualification,
translation approval, legal review or deployment/release acceptance. Those
existing gates remain, together with actual capability/provider qualification.
#207 is still open: Claude/Codex owner provenance is not specialist clearance.
Brand packaging #214 and private token activation remain blocked and untouched.
The site stays a local preview; no PR, push, issue closure or production release
is part of this handoff. Backend/private fixtures, document uploads and PDF tests
were unnecessary for this website-only change and were not run.
