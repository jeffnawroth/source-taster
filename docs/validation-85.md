# Issue #85 implementation evidence

Validated locally on 2026-10-26 on `t3/guest-preferences`, based on integration `spec/70-launch-product` at `9df3b8b`. Two delegated implementation starts failed before making changes with provider HTTP 429; the parent completed the work in the original isolated worktree.

## Behavior

- Guest interface language follows the first supported entry in the browser language list, otherwise English. DE/EN and the eleven citation styles are closed, validated lists; APA is the default. The style metadata retains ADR-0011's fixed per-style locales independently of interface language.
- Language and citation style persist in the web origin's local storage. Switching changes text and document language immediately without reload, preserving input and ongoing Checks. A removed/invalid saved style falls back to APA with a translated notice.
- The shared UI package exposes an asynchronous Preference storage port for the later extension-local adapter. The current web adapter gracefully handles disabled or malformed storage. Only the closed Preference set is written, without Guest IDs, Owner IDs or Check content; the skeleton's prior saved language is read during migration.
- Theme exists only as the System slot. The separate local onboarding-seen marker has read/write hooks; no theme controls or onboarding flow were added. Account persistence/transitions and result rendering remain later tickets.

## Validation

The first new browser test failed because the preferred citation style control did not exist. After implementation, all **10 Chromium browser tests** pass: the previous DE/EN paste-and-watch/axe and reconnect scenarios, independent language/style persistence across reload, four browser language lists, translated removed-style fallback, and operation with disabled storage. The DE/EN stream tests change both settings while the Check runs and retain the same Check. The preference page also passes axe's WCAG 2/2.1/2.2 A/AA checks.

Typecheck, lint/formatting, DE/EN catalog completeness and production builds pass. All **14 real PostgreSQL HTTP/SSE regression tests** also pass. No dependencies were added; the #71 dependency inventory remains unchanged.

The e2e harness now accepts optional API/web ports so isolated worktrees can test concurrently without sharing processes; defaults remain 3102/5174. This run used 3152/5254 and unique per-run test databases/roles, preserving unrelated containers. The generated inlang README is excluded from formatting, like other generated localization artifacts.

## Remaining scope

The actual extension adapter and browser-native persistence are qualified with #92, Account Preferences with #101, and style rendering/export with #86 and related tickets. These are browser storage Preferences in explicit standalone mode until hosted Guest authority exists. The privacy notice and legal review remain pre-launch qualification; browser tests do not establish a legal consent determination.
