# #162: Gate Firefox Preferences sync on optional data collection consent

Follow-up to the Firefox data collection declaration (#155). The decisions, the
Mozilla sources and the locally observed browser behaviour are in
`docs/research/extension-platform.md` §5.5. [ADR-0023](../adr/0023-user-preferences.md)
carries the matching amendment of 5 November 2026. This note records what was
built, what the tests show and what was not run.

## Decisions

- **Minimum version 140** and an optional `technicalAndInteraction` declaration in
  the Firefox manifest only. Chromium's manifest is unchanged.
- **Preferences sync needs the grant.** In the Firefox build, Account Preferences
  are read from and written to the service only while the browser reports the
  `technicalAndInteraction` data collection permission as granted. Without it,
  Preferences stay local and sign-in sends none.
- **No waiting on the browser.** The panel renders at once. The consent seam
  starts as "not granted" and learns the grant when `permissions.getAll()`
  answers; if that never happens, sync simply stays off. Grants, withdrawals and
  lookups take a ticket so a stale lookup cannot overwrite a newer event.
- **Withdrawal keeps what the user sees.** When the grant is withdrawn while
  signed in, the displayed (Account-sourced) Preferences are written to local
  storage, following ADR-0023's rule for sign-out and session end. A later grant
  applies the Account's values under the existing sign-in rule.
- **Live consent at sign-in.** Confirming a sign-in reads the grant at that moment,
  not from the last render.
- **Consent is an object, not a special case.** `PreferenceSyncConsent` has a
  `requiresGrant` flag. `alwaysGranted` is the default, so the web app and the
  Chromium extension take the same code path with no consent branches. Only the
  Firefox seam sets `requiresGrant`, which is what shows the control.
- **Uploads and standalone/Guest use** declare no further type and keep the static
  `required` list (decisions 3 and 4 in §5.5, with their sources and limits).
- **German register.** The catalog addresses the user with Sie (about 100 forms
  against 9 du forms, counted case-sensitively), so the five new strings use Sie.
  The existing du strings (`auth_*`, quota, DPA) are an earlier inconsistency left
  as is.

## What changed

- `apps/extension`: manifest declaration and `strict_min_version`, the build-time
  target constant, `firefoxPreferenceSyncConsent` in `src/platform.ts` (one
  helper for `onAdded`/`onRemoved`, no unused `removeListener` members,
  `data_collection` entries typed with Mozilla's taxonomy), and the panel
  composition.
- `packages/ui`: `PreferenceSyncConsent` and `alwaysGranted` in
  `account-preferences.ts` (new `./account-preferences` export), the gated hook,
  the "Allow Preferences sync" control and the live read at sign-in.
- `packages/i18n`: five strings in EN and DE.
- Docs: §5.5, the ADR-0023 amendment and this note.

## Tests and evidence

All runs are local, on one Apple-silicon macOS laptop, against the shipped Firefox
panel bundle. They are not CI results.

- **Unit** (`pnpm --filter @source-taster/extension test`, 15 passed): the seam
  against a fake `permissions` object (granted, denied, failed, revoked, grant
  from outside the panel, other data type, unsubscribe), plus: usable at once
  with a lookup that never answers, a late answer updating the state, and a late
  lookup not overwriting a newer grant or withdrawal. Manifest tests cover the
  exact `gecko` object and the unchanged Chromium manifest with no
  `data_collection` code in its bundle.
- **Fake `browser` namespace** (`e2e-account/consent.spec.ts`, 11 passed): the real
  Firefox bundle on a loopback page with the data collection permission and the
  private session service faked at their edges. It covers no grant, denied,
  granted from the visible control (the request happens during a live user
  activation), an existing grant, withdrawal, sign-in with and without the grant,
  and the four cases added in this round (below).
- **Native Firefox Developer Edition 160.0b4** (`consent-native.spec.ts`, 2 passed):
  the real sidebar, the real prompt and the browser's permission store. The
  withdrawal is driven through the permission store from chrome-privileged
  script, not through the add-on settings page; see §5.5 "Locally observed".
- **Public account suite** (`panel`, `preferences-transport`, `sensitive-transport`,
  `transport`, `consent`; 34 passed) against a throwaway `postgres:18` container
  on its own port, which was removed afterwards.
- Extension and UI typecheck, lint, `pnpm i18n:check` and prettier pass.

Test-first for this round: the four new `consent.spec.ts` cases were run against
the source before the fix and all failed. They are the lookup that never answers
(the panel did not render), the late lookup answer, the withdrawal with no later
edit (nothing was stored locally) and the sign-in confirmed in the same turn as a
withdrawal (the request carried Preferences). The new unit cases failed because
the seam returned a promise. The earlier suites were green before and after.

## Not run

- `sensitive-panel.spec.ts` and the other suites that need the private service.
- The add-on settings page as the way a grant is withdrawn, and the exact
  `permissions.onRemoved` payload for a data collection withdrawal (the seam does
  not depend on it).
- Firefox ESR, Firefox 140 itself, and Firefox for Android.
- The new consent specs are not in `.github/workflows/ci.yml`; this change did not
  edit CI.

## Not claimed

No result here is an AMO acceptance, listing or eligibility claim, a store
review outcome, release evidence or a qualification of the extension. Whether a
static declaration broader than one session's transmissions is accepted is left
to store review (§5.5, decision 4).
