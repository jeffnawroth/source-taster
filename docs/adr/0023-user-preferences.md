---
status: accepted
---

# Keep Preferences authoritative on the Account and local per client for Guests

The client accepted this design on 26 October 2026 in [User preferences across Account and Guest clients](https://github.com/jeffnawroth/source-taster/issues/61), through [F1–F7](https://github.com/jeffnawroth/source-taster/issues/61#issuecomment-6408473624). Section 10 requires settings stored in the Account, or in the browser without an Account, that apply equally in the extension and the web app. FA-KON-01 requires a browser-language default and immediate DE/EN switching; FA-KON-03 requires a preferred citation style that appears in suggestions and export. This trades cross-client Guest synchronization for separate Guest contexts and no extra bridge between web page and extension.

The approved baseline remains [requirements v3.3](../requirements-specification.md). This is an accepted design. It is not a requirements amendment: the client explicitly accepted the Guest reading of "apply equally" below as an interpretation of section 10. [ADR-0004](0004-owner-plan-quota.md)'s per-environment Guest IDs, [ADR-0011](0011-non-ai-structuring.md)'s pinned style/locale manifest, [ADR-0013](0013-authentication-roles.md)'s separate client sessions, [ADR-0016](0016-results-presentation-workflow.md)'s results workflow and [ADR-0019](0019-transactional-email-catalog.md)'s Account language remain the foundations.

## Preference set

At launch the Preferences are the **interface language** (DE or EN) and the **preferred citation style** (one of the eleven styles of the pinned manifest; default APA). Both are closed lists, validated on write. If a later manifest version removes a stored style, the client falls back to APA and shows a notice. Preferences never contain Check content.

## Account preferences

- **Authority:** for a signed-in user the Account holds the Preferences. It is the same Account language that ADR-0019 uses for e-mail; this ADR adds the preferred citation style beside it.
- **Writes:** a change in either client writes to the Account immediately through the private service under current authorization. Concurrent changes resolve per field: the last write wins, with no conflict dialog.
- **Reads:** each signed-in client applies the stored values when it opens and when it regains focus. There is no real-time push channel; a second client concurrently signed in picks up a change on its next opening or refocus.
- **Lifecycle:** Preferences belong to the Account. They are deleted with it and included where Account data is provided to the user.

## Guest preferences

- **Per client environment:** the web app stores Guest Preferences in its own origin's browser storage; the extension stores them in extension-local storage without browser sync. The two are never synchronized and are not keyed to, or sent with, the Guest ID.
- **Meaning of "apply equally":** both clients offer the same options with the same defaults and the same effects. Equal values across web and extension are not guaranteed for Guests, because the two environments cannot share storage (ADR-0004).
- **Consent:** storing a user-requested setting is necessary for the requested function and needs no consent banner. The privacy notice names it. Confirm this in the existing legal review rather than treating it as passed.

## First-use language and switching

Without a stored preference, each client selects the first supported language in the browser's language list (`de*` → DE, `en*` → EN) and otherwise English. For example, a browser listing French, German and English starts in German. A switch takes effect immediately without reload, updates the document language for assistive technology and is persisted (Account when signed in, otherwise locally). The interface language never changes the citation style or its pinned locale. The public website keeps ADR-0020's URL-based language selection.

## Registration, sign-in and sign-out

- **Registration:** the new Account takes the registering client's current Preferences.
- **Sign-in to an existing Account:** the Account values apply. Local Guest values are not merged into the Account.
- **While signed in:** changes go only to the Account.
- **Sign-out or session end:** the client copies the last displayed values into its local Guest Preferences, so the interface does not change abruptly.

This keeps ADR-0013's separate sessions and ADR-0005's rule that Guest Checks never move to the Owner. Preferences carry no Check or Quota.

## Citation style on results, report and export

- **Re-rendering:** a new preferred style re-renders Correction suggestions in the current Check and in History on the server from the stored Source data. Verdict, Score, fields, revisions and stored results are unchanged.
- **One style setting:** the Verification report and every export use the current preferred style. The export dialog shows the style and edits the same Preference; there is no separate one-off export style.
- **Formatted bibliography:** add a "Formatted bibliography" download as RTF in the preferred style. It has the same content as the CSL-JSON/BibTeX export: current committed fields, removed slots omitted, selected eligible suggestions applied (ADR-0016). It is rendered by the existing server citeproc-js facade. CSL-JSON and BibTeX stay style-neutral data under FA-ERG-30, so the RTF download is how the selected style appears in the export (FA-KON-03).

## Should seams

- **Theme (FA-KON-02):** joins the same Preference set and rules later, default System.
- **Onboarding (FA-KON-30):** the "seen" marker stays local per client environment, also when signed in, and is not stored on the Account.

Both remain **should**; this records the seam only.

## Acceptance evidence

- FA-KON-01 in both clients: German-first browser starts in DE, other-first lists resolve to the first supported language or English; switching is immediate, persisted and sets the document language; the citation style and its locale are unchanged.
- Account behaviour: a change in one client is applied in the other on opening/refocus; concurrent changes end with the last write; invalid values are rejected; a removed style falls back to APA with a notice; Account deletion removes the Preferences.
- Guest behaviour: web and extension keep separate local Preferences across restart without Guest-ID binding, sync or Check content; the privacy notice discloses the storage.
- Transitions: registration adopts client values, sign-in applies Account values without merging Guest values, sign-out and session expiry keep the last displayed values.
- FA-KON-03: suggestions in the current Check and History, the Verification report and the Formatted bibliography follow the selected style without changing Verdicts; the RTF download for each of the eleven styles opens correctly in Microsoft Word and LibreOffice Writer; CSL-JSON/BibTeX still import into Zotero.

## Considered options

- **Account authoritative, Guest local per client environment (chosen):** matches the separate Guest contexts, needs no extra transport and keeps one rule for both clients.
- **Bridge Guest Preferences between web page and extension:** keeps Guest values equal, but needs a messaging channel that differs between Chromium and Firefox and couples the separate Guest contexts. Rejected.
- **Real-time push of Account changes:** instant updates in a concurrently open client, at the cost of a long-lived channel. Rejected as unnecessary for two settings.
- **Count only the PDF Verification report as the styled export:** no new download, but a narrower reading of FA-KON-03. Rejected in favour of the RTF Formatted bibliography.
- **One-off export style beside the Preference:** more flexibility, but a second style state to explain and test. Rejected.

## Consequences

- One small Account Preference record and one local Preference store per client, shared through the UI packages.
- One additional export format (RTF) on the existing renderer; its qualification is part of the export test matrix.
- Guests using both clients may see different Preferences in each; this is accepted behaviour, not a defect.

Handed-off interfaces:

- **Implementation:** Preference read/write API on the private service, client Preference store adapter (web origin storage, extension-local storage), browser-language negotiation, server re-rendering of suggestions, and the RTF Formatted bibliography export.
- **[Final technical-concept synthesis and requirements traceability](https://github.com/jeffnawroth/source-taster/issues/60):** close G01 and update the FA-KON-01, FA-KON-03, FA-ERG-30 and section 10 rows.
- **Legal review:** confirm the consent-free local storage of Preferences and its privacy-notice wording.

## Amendment (5 November 2026, #162)

Decided by the product owner (delegated authority), as a refinement for the Firefox extension. It does not change the Preference set, the web app, the Chromium extension or the Guest rules.

Mozilla files "extension usage and settings data" under the data collection type `technicalAndInteraction`, which an extension may declare only as optional ([#162](https://github.com/jeffnawroth/source-taster/issues/162); platform note `docs/research/extension-platform.md` §5.5). In the Firefox extension, Account Preferences therefore sync only while the user holds that optional data collection grant. This qualifies the "Writes" and "Reads" bullets above for Firefox only:

- **Without the grant:** Preferences stay local, also while signed in. The extension neither reads them from nor writes them to the service, and registration or sign-in sends no Preferences. A change is stored in the local Guest Preferences.
- **Obtaining the grant:** a visible control in the signed-in Account section requests it from a user action. A refusal leaves everything local.
- **Withdrawal:** if the user withdraws the grant while a panel is open, including from the browser's add-on settings, syncing stops at once. The client keeps the values it was displaying and stores them as its local Preferences, as for sign-out and session end above, so the interface does not change. A withdrawal made while no panel is open needs no event: while the grant holds, the client keeps the local Preferences equal to the Account values it displays (read, edited or confirmed by the service), so the next panel opens on what the user last saw and stays local. Nothing is written to the local store without the grant, and nothing is sent to the service. The cost is that the device holds a copy of the signed-in Account's Preferences. Account deletion (#102) forgets that copy too. A stored marker records that the local Preferences are a mirrored Account copy; deletion then clears them and the next panel starts from the defaults, as a fresh Guest, because the mirror had already replaced any pre-sign-in Guest values. Sign-out and session end clear the marker, since the values then become this device's own Guest Preferences. Local values the mirror never wrote stay as they were (#174).
- **Later grant:** the existing sign-in rule applies. The Account's stored values are applied; local values are not merged into the Account.

Chromium and the web app are unchanged: they always sync while signed in. An existing Account that signs in without the grant keeps its stored values, and a new registration without the grant sends none; whether to offer "send my current Preferences" at grant time remains undecided.
