# First-wave review fix pass

Implements the parent disposition in `st-notes/first-wave-review.md` on
`t3/fix-implementation-review`. Started from integration `ea550fb`, then merged
local website `feat/115-static-website` at
`fa558adb167c734026dd7d42a5ef74792cb39374` without resetting its work. Integration
was verified as an ancestor. No integration branch or PR is changed by this pass.

The already approved test seams are real-PostgreSQL HTTP/SSE, browser end-to-end,
and captured SMTP in the private repository. No predecessor or heldout corpus was
read. No real recipient, unrelated container, or port 8000/4567 was used.

## Review responses

- **Catalog labels:** all shared help/contact/legal link labels and the navigation
  accessible name now come from the DE/EN Paraglide catalog, using the supplied
  interface language explicitly. Existing browser language-switch checks cover it.
- **Broken default destinations:** the local Vite server uses the same static
  hosting boundary for built, marked website drafts, on loopback. The browser
  regression now clicks all six links in each language, observes the new tab,
  checks language, heading and draft marker, then closes it. Before the fix it
  opened the SPA fallback instead. `pnpm build` is the documented prerequisite.
  A qualified separate website origin remains configurable for production and
  future extension consumers. No domain or seller identity is invented.
- **Reconnect help/claims:** both languages now describe automatic reconnect and
  Last-Event-ID resume while the page stays open, permanent client-error behavior,
  and the actual cancellation/reload/History limits. Claim evidence links the
  transport client and SSE tests. Website browser coverage checks both texts;
  existing dropped-stream browser and ordered/replay HTTP tests are retained.
- **Check limit:** creation enforces `SOURCE_TASTER_REFERENCE_LIMIT` before
  persistence/enqueue, returning a Problem with the actual limit. The regression
  first returned 201 for 1001 References; it now returns 400. Additional HTTP
  coverage proves an Operator-configured limit of two. The placeholder Check
  still counts nonempty lines; parser preview uses recognized References.
- **Shared transport:** the dual-licensed contract client now provides Check and
  Structuring requests, schema validation and a common `ApiError` carrying an
  optional validated Problem. The app shares one localization mapping. A browser
  regression first showed connection copy for non-JSON HTTP errors; both actions
  now show safe localized server-failure copy. Network errors remain distinct.
  Built JavaScript, declarations and OpenAPI are regenerated and committed.
- **TypeScript tooling:** website inventory is now strict TypeScript and included
  in root script typechecking/linting. This is a type-only conversion: traversal,
  retained native/bundled/platform entries, metadata requests, prerequisites,
  qualification wording and advisory coverage are unchanged. It was not rerun to
  regenerate the parent's inventory or qualify website dependencies.
- **Local standards:** website environment selection is in `loadConfig`; draft
  production refusal is shared; language/legal IDs/review shape are shared;
  publication CLI is separated from the imported runtime gate. The preview handler
  no longer shadows `fetch`. API ownership includes versioned, health and internal
  paths, covered over HTTP. Long Astro route/component expressions are split into
  readable blocks. Website source headers follow the existing AGPL license.
  German information content consistently calls References `Referenzen`.
- **Parser fixture breadth:** the original style fixtures had only one or two
  entries. A separately authored synthetic bibliography varies author names,
  multiple authors, Unicode, year suffixes, article values and book layouts across
  all four styles, with independently transcribed CSL values and a literal title
  span. It passed without parser changes after correcting a hand-counted expected
  offset (the parser's span was correct). No production quality target is inferred.

## Decisions retained and limits

The private readiness SPA and opt-in internal diagnostic are intentional observable
infrastructure seams and are retained. Private changes and provenance evidence are
in that repository's `docs/review-fix-pass.md`; the tested full-SHA MIT contract pin
is unchanged. Later authentication, commerce and seven business mail types remain
outside this fix pass.

No new parser heuristics were added: the varied examples did not substantiate a
rule defect, and speculative sentence/author guesses would conflict with the
requirement to leave uncertain fields empty. Existing grammar limits and the
separate line-based Check remain explicit in `72-parser.md`.

Security/publication gates remain **closed**. The parent's investigation of 73
upstream-lock website audit findings, prereleases and native/WASM license/source
obligations is separate. This pass changes no audit coverage, suppressions,
exceptions, dependency versions or publication approvals. Passing installed npm
license checks is not native/bundled website dependency clearance. Legal drafts,
real domain/support/seller configuration, human translations, manual accessibility
and later product functionality remain unqualified.

## Validation (Node 24.14.0, PostgreSQL 18, Chromium)

- `pnpm install --frozen-lockfile`, build, typecheck, lint and catalog completeness
  passed. Workspace-only dependency links were added for shared i18n/hosting;
  no external dependency version changed.
- `SOURCE_TASTER_TEST_API_PORT=34171 SOURCE_TASTER_TEST_WEBSITE_PORT=34173 pnpm test`:
  **35 HTTP/SSE tests passed**, with unique database/role fixtures.
- App Playwright on API/web ports 34172/34174: **14 passed**, including link
  navigation, dropped stream reconnect, DE/EN Preferences/Structuring and axe.
- Website Playwright on port 34175: **13 passed**, including search, privacy,
  accessibility, legal versions and publication refusal after the Astro cleanup.
- `pnpm audit:licenses`: 529 installed package licenses, 67 runtime packages;
  no website dependency/security clearance asserted.
- `git diff --check` passed. The integration ref is merged again before handoff.

Red/green logs and complete command outputs are retained outside both repositories
in `/Users/jeffnawroth/Developer/st-notes/fix-pass-2026-10-26/`.
