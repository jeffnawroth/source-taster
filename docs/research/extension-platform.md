# Research: browser extension platform

- Ticket: [Browser extension platform (#9)](https://github.com/jeffnawroth/source-taster/issues/9), input to [Tech stack (#26)](https://github.com/jeffnawroth/source-taster/issues/26) and #21
- Research date: 2026-10-24. Primary sources were retrieved on this date; browser/framework support was researched, not exercised in installed browsers.
- Baseline: [requirements specification v3.1](../requirements-specification.md) and [GLOSSARY.md](../../GLOSSARY.md)
- Sibling research: [Current TypeScript stack (#25)](https://github.com/jeffnawroth/source-taster/blob/f980ddeff22dfb497dde58c768c5a4639a839558/docs/research/current-typescript-stack.md), section 7 lists the points handed to this ticket. They are answered in section 12.
- Status: **constraints and recommendations only.** The client makes the final decision in #26. Nothing here is scaffolded.

## How to read this document

- **Verified** means the claim comes from a primary source linked next to it: browser vendor documentation, MDN and its browser-compat-data (BCD), store policies, the npm registry, a vendor release page or a GitHub repository of the tool.
- **Opinion** means the author's assessment. It is always labeled.
- **Unknown** means it could not be verified with primary sources in this pass. Most unknowns need a short prototype, not more reading.
- BCD rows are cited from the raw JSON files in `mdn/browser-compat-data` (`webextensions/api/<name>.json`, `webextensions/manifest/<key>.json`). BCD marks Edge and Opera as `"mirror"` of Chrome for many extension APIs. A mirror value is derived, not tested, so it is **not** used here as evidence that Opera or Edge support an API.

The decision-relevant result is a **two-family native extension**, not a universal sidebar API: Chromium `sidePanel` and Firefox `sidebarAction`, with one locally bundled UI behind them (sections 3–5). The stable build shortlist is **plain Vite packaging or Extension.js**, subject to client choice and a production-build check (7). Native-browser validation remains necessary for Brave/Opera behavior, selection fidelity and authentication (10). Store reviews make synchronous installed-client rollout unprovable; the client should clarify release parity and exceptional selection surfaces without silently relaxing the specification (9/11).

## 1 Requirements in scope

| ID | What it asks of the extension |
|---|---|
| FA-KON-04 (must) | The extension appears as a side panel next to the open page. Acceptance: "In all supported browsers, the extension icon opens the side panel." |
| FA-KON-05 (deferred) | Side panel or popup as a user choice. Trigger includes "a target browser without a side panel" (section 19). |
| FA-ERF-03 (must) | Context menu entry "Check selected text" for selected text. It opens the side panel and takes over the selection as input, "on any web page". |
| FA-ERF-04 (should) | Context menu entry "Open side panel" while the panel is closed; disabled while it is open. |
| FA-KTO-03 (must) | One account applies in extension and web app; the extension shows the same plan and history. |
| FA-KTO-02 (must) | Passwordless sign-in by e-mail one-time code or link. |
| FA-GLE-01 to FA-GLE-05 | Same functionality/defaults/verdicts (must); consistent terminology/workflow and new features under the same version (should). |
| FA-ERW-04 (must) | Extension and web app use only the versioned API. |
| FA-UEB-01, FA-KON-01 | German and English; interface language switchable, default browser language. |
| 14.6 | Chrome, Edge, Brave and Opera (Chromium-based), plus Firefox, each in the two latest major versions, plus the current Firefox ESR. AGPL-3.0 for the extension. The OS/desktop scope and interpretation of Brave release lines need clarification (section 11). |

## 2 Browser version snapshot (verified, 2026-10-24)

| Browser | Sampled release window on the research date | Engine | Source |
|---|---|---|---|
| Chrome | 157 (stable, rolling out 2026-10-22) and 156 | Chromium 157 / 156 | [Chromium Dash stable releases](https://chromiumdash.appspot.com/fetch_releases?channel=Stable&platform=Windows&num=3) |
| Edge | 156 (156.0.4314.42, 2026-10-24) and 155 | Exact engine patch not separately checked | [Edge update API](https://edgeupdates.microsoft.com/api/products) |
| Brave | 1.98.60 (2026-10-21) | Chromium 156.0.8078.48 | [Brave v1.98.60](https://github.com/brave/brave-browser/releases/tag/v1.98.60) |
| Opera | 138 (2026-10-20) and 137 | 138: Chromium **154.0.8037.99**; 136: Chromium 152.0.7977.120 | [Opera 138 Stable](https://blogs.opera.com/desktop/2026/10/opera-138-stable/), [Opera 136 Stable](https://blogs.opera.com/desktop/2026/09/opera-136-stable/) |
| Firefox | 158.0.1 and 157 | Gecko | [Mozilla product-details](https://product-details.mozilla.org/1.0/firefox_versions.json) |
| Firefox ESR | **153.5.1esr**; additionally **115.43.1esr** is still published | Gecko | same |

The current versions above were retrieved from the cited vendor feeds/pages. The adjacent N-1 major numbers are release-matrix slots; they are not a record of tested binaries. Brave's second release line is deliberately left unresolved pending the definition in section 11.

Implications:

- The sampled current Chrome and Brave builds, and Opera 136, exceed Chromium 148. The Edge feed identifies product version 156; its precise bundled engine patch was not separately retrieved. This supports investigating native Promise-based APIs without a polyfill, but it does **not** verify each browser's N-1 engine or product-level API behavior. Recompute the browser/engine matrix at acceptance rather than inferring support from Chromium ancestry.
- Mozilla still publishes an ESR 115 line next to ESR 153 ([product-details](https://product-details.mozilla.org/1.0/firefox_versions.json)). Section 14.6 says "the current ESR", which is unambiguous only if it means the newest ESR line (see section 11).

## 3 Side panel (FA-KON-04)

### 3.1 Chromium: `chrome.sidePanel`

Verified ([Chrome sidePanel reference](https://developer.chrome.com/docs/extensions/reference/api/sidePanel)):

- Available from Chrome 114, Manifest V3 only. Needs the `"sidePanel"` permission and the manifest key `side_panel.default_path`.
- `sidePanel.setPanelBehavior({ openPanelOnActionClick: true })` makes the toolbar icon toggle the panel (default `false`). This is the direct way to meet the FA-KON-04 acceptance criterion.
- `sidePanel.open()` exists from Chrome 116 and "may only be called in response to a user action". A context menu click is listed as a valid user action, and the page's own example calls it from `contextMenus.onClicked`. It opens per window (`windowId`) or per tab (`tabId`).
- `sidePanel.close()` from Chrome 141. `onOpened` from Chrome 141, `onClosed` from Chrome 142. `getLayout()` (left or right) from Chrome 140. From Chrome 145, `close({tabId})` rejects when only the global panel is open.
- The panel path must be a local resource in the extension package (`setOptions`).

Product availability per browser:

| Browser | Status | Evidence |
|---|---|---|
| Chrome | Supported (114+) | [Chrome reference](https://developer.chrome.com/docs/extensions/reference/api/sidePanel) |
| Edge | Supported. Edge documents `chrome.sidePanel` as its "sidebar" API with the same manifest key and permission; the panel can also be opened from the toolbar icon's own right-click menu. Known issue: the sidebar is not shown again automatically when switching back to a tab where it was open ([MicrosoftEdge-Extensions #142](https://github.com/microsoft/MicrosoftEdge-Extensions/issues/142)). | [Edge: Develop an extension for the sidebar](https://learn.microsoft.com/en-us/microsoft-edge/extensions/developer-guide/sidebar) (updated 2026-06-12) |
| Brave | Vendor tracker evidence of implementation, with UI gaps; current acceptance remains untested. A historical sidePanel bug is closed as completed. An issue that Brave's own sidebar has no UI to activate side-panel extensions is **still open** (only via the toolbar's extension menu). No first-party Brave reference documenting its per-method API contract was found in this pass. | [brave-browser #32132](https://github.com/brave/brave-browser/issues/32132), [brave-browser #31334](https://github.com/brave/brave-browser/issues/31334) |
| Opera | Announced as "support for the chrome.sidePanel API, which lets extensions render their own side panels" in **Opera 136** (2026-09-17). The post states no limits, position or platforms. Opera also has its own older `sidebar_action` API (Opera 30+). | [Opera 136 Stable](https://blogs.opera.com/desktop/2026/09/opera-136-stable/), [Opera sidebar action API](https://help.opera.com/en/extensions/sidebar-action-api/) |
| Firefox | **Not supported** (`sidePanel` and `side_panel`: `version_added: false`) | BCD [sidePanel.json](https://github.com/mdn/browser-compat-data/blob/main/webextensions/api/sidePanel.json), [side_panel.json](https://github.com/mdn/browser-compat-data/blob/main/webextensions/manifest/side_panel.json) |

Unknown:

- Whether Opera 137/138 support `open()`, `onOpened`/`onClosed` and `setPanelBehavior` like Chrome, and where the panel appears. The vendor announcement begins at Opera 136, which is below the sampled 137/138 window. This is not per-method certification. Needs a manual test.
- Whether Brave's `onOpened`/`onClosed` events fire with Brave's custom sidebar. Needs a manual test.

### 3.2 Firefox: `sidebar_action` / `sidebarAction`

Verified (BCD [sidebarAction.json](https://github.com/mdn/browser-compat-data/blob/main/webextensions/api/sidebarAction.json), [sidebar_action.json](https://github.com/mdn/browser-compat-data/blob/main/webextensions/manifest/sidebar_action.json)):

- Firefox desktop supports the manifest key `sidebar_action` (`default_panel`, `default_title`, `default_icon`, `open_at_install` from 62) since Firefox 54. Firefox for Android has no sidebar.
- `sidebarAction.open()` and `close()` since 57, `isOpen()` since 59, `toggle()` since 73. No open/close events exist in Firefox.
- `sidebarAction.open()` can only be called from inside the handler for a user action. MDN's example opens it from `menus.onClicked` ([MDN sidebarAction.open](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/sidebarAction/open)).
- Chrome, Edge and Safari do not implement `sidebarAction` (BCD).

Consequence (verified by the two tables): no single side panel API spans all target browsers. The extension needs `side_panel` + `sidePanel` for Chromium and `sidebar_action` + `sidebarAction` for Firefox, with the same panel page behind both.

## 4 Context menu for selected text (FA-ERF-03, FA-ERF-04)

Verified:

- Chrome: `contextMenus` permission; context type `"selection"`; titles may contain `%s` for the selected text; `OnClickData.selectionText` is "the text for the context selection, if any", with no documented length or format limit; `update()` can set `enabled` ([Chrome contextMenus](https://developer.chrome.com/docs/extensions/reference/api/contextMenus)).
- Firefox: the API is `menus` (permission `menus`); `contextMenus` is kept as an alias "so you can use contextMenus to write code that works in Firefox and also in other browsers" ([MDN menus](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/menus)). With non-persistent background pages and in Chrome, items are created in `runtime.onInstalled` (same page).
- `menus.onShown` and `menus.refresh()` exist only in Firefox (60+); Chrome has neither (BCD [menus.json](https://github.com/mdn/browser-compat-data/blob/main/webextensions/api/menus.json)).

Derived constraints for FA-ERF-04 (disable "Open side panel" while open):

- Chromium: track `sidePanel.onOpened` (141) and `onClosed` (142) and call `contextMenus.update(id, { enabled })`. Panel state can be per window or per tab, so the menu state must follow the same scope.
- Firefox: no events; use `menus.onShown` → `sidebarAction.isOpen({windowId})` → `menus.update` → `menus.refresh()`.

Unknown (prototype items):

- Whether `selectionText` keeps line breaks of a multi-line selection in each browser. A selected bibliography has many lines, and losing line breaks would hurt structuring (section 6 of the requirements). A possible fallback on permitted page/frame types is to read `window.getSelection()` through `scripting.executeScript`, which needs a host permission or `activeTab` (section 5.4); input/textarea selections require their own handling, so this is not a universal recovery path.
- Whether there is a length cap on `selectionText` in either engine.

Opinion (to be confirmed by a prototype): invoke `sidePanel.open()` / `sidebarAction.open()` at the start of the click handler, before any `await`, so the user-action context is not lost. This timing restriction is explicit for Firefox in [MDN User actions](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/User_actions); the functions still return Promises. Hand the selection to the panel through `storage.session` (Chrome 102+, Firefox 115+, BCD [storage.json](https://github.com/mdn/browser-compat-data/blob/main/webextensions/api/storage.json)), rather than relying solely on a one-off message, because the panel page may not have loaded yet when the menu handler runs. Use a per-window request ID and acknowledgement, listen for storage changes as well as reading pending input, handle rapid clicks, and erase consumed input. This is a proposed handoff protocol, not verified implementation.

## 5 Manifest V3 constraints

### 5.1 Background context

Verified (BCD [background.json](https://github.com/mdn/browser-compat-data/blob/main/webextensions/manifest/background.json)):

- `background.service_worker`: Chrome 88+, **Firefox: not supported**.
- `background.scripts` (event page): Firefox 48+; Chrome only in Manifest V2.
- Firefox 136+ supports `background.preferred_environment`.

A combined MV3 background declaration is documented: include both `scripts` and `service_worker`. Chrome 121+ ignores `scripts`; Firefox 121+ starts its event page despite `service_worker`. [MDN background](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/background) gives this cross-browser example. Separate browser manifests remain the simpler proposal for differing sidebar keys, permissions and store metadata; background declarations alone do not force them. Firefox MV3 event pages are non-persistent too; register event listeners at top level and recover state from storage.

Chrome extension service worker lifecycle ([Chrome: service worker lifecycle](https://developer.chrome.com/docs/extensions/develop/concepts/service-workers/lifecycle)):

- Terminated after 30 seconds of inactivity; events and extension API calls reset the timer (API calls since Chrome 110).
- Terminated when a single request takes longer than 5 minutes, or when a `fetch()` response takes more than 30 seconds to arrive.
- Global variables are lost on shutdown; state belongs in `storage`.

Opinion: do not rely on a service worker remaining alive for a Check or progress stream (FA-SUC-07, FA-UEB-42); the lifecycle includes exceptions, such as active WebSockets, but those are not a general persistence guarantee. The side panel is a normal extension page and lives while it is open.

### 5.2 Content security policy and remote code

Verified:

- Chrome MV3 default `extension_pages` CSP is `script-src 'self'; object-src 'self';`; the minimum that cannot be relaxed is `script-src 'self' 'wasm-unsafe-eval'; object-src 'self';`. `'unsafe-eval'` is rejected at install ([Chrome manifest CSP](https://developer.chrome.com/docs/extensions/reference/manifest/content-security-policy)).
- Firefox supports `content_security_policy.extension_pages` since 72; `sandbox` CSP only since Firefox **154**, i.e. not in ESR 153 (BCD [content_security_policy.json](https://github.com/mdn/browser-compat-data/blob/main/webextensions/manifest/content_security_policy.json)). The supported ESR is below that sandbox-CSP version; avoid depending on sandboxed remote-code exceptions. A framework's older blanket statement about Firefox sandboxing is not a current browser-support authority.
- Chrome Web Store: "the full functionality of an extension must be easily discernible from its submitted code"; no `<script>` pointing outside the package, no `eval` of fetched strings, no interpreter for fetched commands. Allowed: loading data, remote configuration for feature flags if all logic is in the package, syncing account data with a server; code in iframes and sandboxed pages is exempt but must still be discernible ([CWS MV3 requirements](https://developer.chrome.com/docs/webstore/program-policies/mv3-requirements)).
- Firefox Add-ons (AMO): "Add-ons must be self-contained and not load remote code for execution" (policy 4.2). Minified or bundled code is allowed, but Mozilla must receive the source before those steps plus reproducible build instructions; obfuscation is not allowed (policy 3.1) ([Add-on policies](https://extensionworkshop.com/documentation/publish/add-on-policies/), updated 2026-04-30).

Consequence for UI sharing: the shared React UI must be **bundled into the extension package**. Fetching JSON from the API is fine. Loading the hosted web app's JavaScript into the extension is not.

### 5.3 Namespace and polyfill

Verified:

- "From Chrome 148, all Chrome Extension APIs are available under the `browser` namespace"; `runtime.onMessage` listeners may return a Promise; webextension-polyfill "becomes a no-op on Chrome 148 and later" ([Chrome: browser namespace](https://developer.chrome.com/docs/extensions/develop/concepts/browser-namespace)).
- `mozilla/webextension-polyfill` is **archived**; its README says it "has served its purpose, and will not receive any further updates" ([repository](https://github.com/mozilla/webextension-polyfill)). npm latest is still 0.12.0 from 2024-05-14 ([registry](https://registry.npmjs.org/webextension-polyfill)).
- The sampled current builds and Opera 136 exceed Chromium 148 (section 2). Whether each of them exposes `browser` like Chrome is **not documented** by those vendors; it is inherited Chromium code, but needs a smoke test.

### 5.4 Permissions

Verified:

- `host_permissions` is MV3-only (Chrome 88, Firefox 109). Users can grant or revoke host permissions at any time, so "most browsers treat host_permissions as optional". Since Firefox 127, they are shown in the install prompt, but new host permissions in an update are not shown. Extensions should check with `permissions.contains` and request with `permissions.request` ([MDN host_permissions](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/host_permissions)).
- `optional_host_permissions`: Chrome 102, Firefox 128 (BCD [optional_host_permissions.json](https://github.com/mdn/browser-compat-data/blob/main/webextensions/manifest/optional_host_permissions.json)).

Minimal permission set implied by the requirements (opinion): `sidePanel` (Chromium), `contextMenus`/`menus`, `storage`, a host permission for the Source Taster API origin only, and possibly `activeTab` + `scripting` for the selection fallback in section 4. No `<all_urls>` host permission is needed for FA-ERF-03, because `selectionText` arrives in the click event.

### 5.5 Firefox data collection consent

Verified ([Firefox built-in data consent](https://extensionworkshop.com/documentation/develop/firefox-builtin-data-consent/), BCD [browser_specific_settings.json](https://github.com/mdn/browser-compat-data/blob/main/webextensions/manifest/browser_specific_settings.json), MDN [`permissions.request()`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/permissions/request), [`permissions.getAll()`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/permissions/getAll), [`permissions.onRemoved`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/permissions/onRemoved)):

- "From November 3, 2025, all new extensions must adopt the Firefox built-in data collection consent system", declared in `browser_specific_settings.gecko.data_collection_permissions` (Firefox desktop 140+, Firefox for Android 142+).
- Personal data types such as `personallyIdentifyingInfo` and `authenticationInfo` need explicit opt-in; `websiteContent` is eligible for implicit consent; `technicalAndInteraction` (which includes extension usage and settings data) can only be declared as `optional`.
- Optional data collection is not granted by default. The extension requests it at runtime with `permissions.request({ data_collection: [...] })`, which must run inside a user-action handler. `permissions.getAll()` reports the granted types under `data_collection`, and `permissions.onAdded` / `permissions.onRemoved` fire when permissions are granted or removed. MDN does not say which user interfaces cause that, and shows the `data_collection` payload of those events only in examples; see "Locally observed" below for what was and was not seen.
- Mozilla's page says the user "can turn this optional data collection on or off in `about:addons`" (the *Permissions and data* section), and, for `technicalAndInteraction`, that "this choice is available in the optional settings section of the extension installation prompt" and the user can turn the permission on or off during the installation flow. The page says "choice", not "toggle" or "checkbox". The grant can therefore exist before the panel first asks, so the panel asks the browser for the granted state at load instead of assuming it is absent.
- Older Firefox needs a custom consent flow, or `strict_min_version` 140.

**Release calendar** (re-read 2026-11-05 from [Mozilla product details](https://product-details.mozilla.org/1.0/firefox_versions.json) and the [whattrainisitnow release schedule](https://whattrainisitnow.com/api/release/schedule/?version=release)): the current release is Firefox 159 (159.0 on 2026-10-27, 159.0.1 current), the newest ESR line is 153 (153.6.0esr), and Firefox 160 is in beta (160.0b5). ADR-0002 defines "current ESR" as the newest ESR line and excludes ESR 115, so 140 is below both the current release and the newest ESR.

**Current declaration** (`apps/extension/extension-config.ts`, Firefox manifest only; Chromium has no equivalent key, and its manifest is unchanged):

```json
"gecko": {
  "strict_min_version": "140.0",
  "data_collection_permissions": {
    "required": ["authenticationInfo", "personallyIdentifyingInfo", "websiteContent"],
    "optional": ["technicalAndInteraction"]
  }
}
```

`apps/extension/manifest.test.ts` asserts this object exactly, so any extra, missing or moved entry fails.

Decisions (product owner, issue #162):

1. **Minimum version 140.** `strict_min_version` is `140.0`, the first desktop version with the key, so every supported Firefox shows the built-in prompt and no custom consent flow is needed. Firefox 128–139 is no longer supported. There is no `gecko_android` entry.
2. **Preference sync is gated on the optional `technicalAndInteraction` grant.** Mozilla counts extension settings under that type. On the Firefox build, Account Preferences are sent to or read from the service only while the permission is granted. The Account section shows a visible "Allow Preferences sync" control; its click handler calls `permissions.request()` in the same turn as the click. The panel renders at once and treats the grant as absent until `permissions.getAll()` answers, so a lookup that never settles cannot block it and nothing syncs in the meantime. Without the grant, language and citation style stay in the browser, and sign-in sends no `preferences` (the grant is read when the sign-in is confirmed, not at render). Revoking the permission stops syncing at once, writes the Preferences the panel was displaying to local storage (ADR-0023's rule for session end) and keeps later edits local; a later grant applies the Account's values. ADR-0023 records this in its 5 November 2026 amendment. The revocation copy happens only while a panel is open; a grant withdrawn in the add-on settings with no panel open is not observed (the panel then opens on its older local values). The Chromium build is unchanged and always syncs. The gate sits behind one seam (`firefoxPreferenceSyncConsent` in `apps/extension/src/platform.ts`) that tests fake, and the build-time target constant removes it from the Chromium bundle (asserted in `manifest.test.ts`).
3. **Document uploads declare no further type.** A file the user picks in the Check workspace is not content visible on a website: Mozilla describes `websiteContent` as covering "anything visible on a website" ([data types](https://extensionworkshop.com/documentation/develop/firefox-builtin-data-consent/)). The listed types are examples ("includes, but isn't limited to"), and the page gives no rule for data that fits none of them; none of the listed types names a user-chosen file. Uploads happen only on an explicit user action (choosing a file and pressing the upload button). No new type is declared. This reasoning is recorded so it can be revisited at store review.
4. **The static `required` list also covers standalone and Guest use.** The declaration is the same for every Firefox build and session, including builds without sign-in and Guest sessions. Mozilla's pages do not say whether a declaration may be broader than what one session transmits. They say the extension "must accurately state the data collection practices in the extension manifest" (policy 6.2.1) and "must limit data transmission to what is necessary for functionality" ([Add-on policies](https://extensionworkshop.com/documentation/publish/add-on-policies/)). Reading a static declaration as covering what the extension can transmit across all its modes, with one build for every session, is the product owner's reading in #162 and is to be confirmed at store review; in my assessment (opinion), an under-declaration is not defensible under either sentence.

What each declared type covers:

- `websiteContent`: the text the user selects or submits for checking. Uploaded documents are not mapped to any declared type (decision 3).
- `authenticationInfo` and `personallyIdentifyingInfo`: the e-mail address and one-time code for Account sign-in. Mozilla's table lists usernames and account registration under `authenticationInfo` and contact details under `personallyIdentifyingInfo`; the sign-in e-mail address is classified as contact details. (Mozilla lists e-mails as message content under `personalCommunications`, which does not describe a sign-in address.)
- Required, not optional: Mozilla describes required data as data users "must accept … to use the extension; they cannot opt out". Guest Checks work without sign-in, so a later optional design for the sign-in types is possible but is a separate product decision.
- `technicalAndInteraction` (optional): Account Preferences, the only extension settings sent to the service.
- Not declared: `browsingActivity` (the background forwards only `selectionText`, not the page URL or title).

**Locally observed** (Firefox Developer Edition 160.0b4, macOS, 2026-11-05; driven by `apps/extension/e2e-account/consent-native.spec.ts`, not taken from documentation):

- A trusted click on the sidebar control opens the browser's own prompt ("… requests additional data collection … technical and interaction data") with Allow and Deny. The click satisfied the user-action requirement.
- Allow stores the grant and the panel then reads the Account's Preferences; Deny leaves the grant unset, sends no Preferences request and keeps the control available. A fresh profile starts without the grant.
- Withdrawing the grant was driven from chrome-privileged script through Firefox's permission store (`ExtensionPermissions.remove`, passing the extension as the event emitter). The open panel switched back to local-only, and a reopened panel read the permission as not granted and sent no Preferences request. The add-on settings page itself was not driven, and it was not confirmed that it uses this path. A removal from the store without the emitter also switched the open panel, but a reopened panel still read the permission as granted; that is a hazard if Firefox ever revokes through a path that does not update the extension's live permissions.
- Not observed: the exact payload of `permissions.onRemoved` for a data collection withdrawal. The seam does not depend on it: when the payload does not name `technicalAndInteraction` it re-reads `permissions.getAll()`.

**Known consequence (product-owner follow-up).** On a later grant the Account's values apply (ADR-0023). An existing Account that signs in without the grant keeps its stored values, and a later grant makes the panel show them in place of the local choice. A new registration without the grant sends no Preferences, so the service decides what the new Account holds, and a later grant shows that instead of the local choice. Whether to offer "send my current Preferences" at grant time is not decided here.

This is a manifest declaration and a runtime gate only. It makes no claim that the extension is accepted by, listed on or eligible for addons.mozilla.org.

Sources: [Firefox built-in data consent](https://extensionworkshop.com/documentation/develop/firefox-builtin-data-consent/), [Add-on policies](https://extensionworkshop.com/documentation/publish/add-on-policies/), [MDN browser_specific_settings](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/browser_specific_settings), [MDN permissions.request()](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/permissions/request), [MDN permissions.getAll()](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/permissions/getAll), [MDN permissions.onRemoved](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/permissions/onRemoved), BCD [browser_specific_settings.json](https://github.com/mdn/browser-compat-data/blob/main/webextensions/manifest/browser_specific_settings.json), [Mozilla product details](https://product-details.mozilla.org/1.0/firefox_versions.json), [whattrainisitnow](https://whattrainisitnow.com/).

Consequence: Source Taster sends selected page text and the e-mail address for sign-in. AMO policy 6.2.2.1 requires explicit opt-in for personal data ([Add-on policies](https://extensionworkshop.com/documentation/publish/add-on-policies/)). This touches the privacy policy work under FA-UEB-21. **Policy qualification:** section 6.2.2.1 is the custom/older-Firefox path; for Firefox 140+ the applicable built-in path is policy 6.2.1 and the manifest taxonomy. A type eligible for implicit consent is not blanket approval for every transmission. Selected website content, authentication and Preferences are declared above; uploads are covered by decision 3 and are to be revisited at store review; optional analytics must remain separately consented (FA-UEB-15).

## 6 Authentication and progress from the extension (FA-KTO-02, FA-KTO-03, FA-ERW-04)

Verified:

- Extension pages and service workers can make privileged cross-origin requests to hosts covered by host permissions; content scripts remain subject to the page's same-origin/CORS rules even with host permissions ([Chrome: network requests](https://developer.chrome.com/docs/extensions/develop/concepts/network-requests)).
- Chrome treats extension-initiated requests as same-site for cookie purposes **only if the extension has host permission** for the target, since Chrome 79; some cases from web frames on extension pages behave differently since Chrome 80 ([Chromium SameSite FAQ](https://chromium.org/updates/same-site/faq)).
- Firefox: `moz-extension:` URLs cannot be a partition key, so iframes in extension documents use unpartitioned storage ([MDN cookies API](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/cookies)). MDN does not document how cookies on `fetch` from extension pages are classified.
- `externally_connectable` (a web page messaging the extension directly) exists in Chrome, **not in Firefox** (BCD [externally_connectable.json](https://github.com/mdn/browser-compat-data/blob/main/webextensions/manifest/externally_connectable.json), [bug 1319168](https://bugzil.la/1319168)).
- `identity.launchWebAuthFlow` exists in Chrome 29+, Firefox 53+ and Opera 60+ (BCD [identity.json](https://github.com/mdn/browser-compat-data/blob/main/webextensions/api/identity.json)).
- The sibling research verified that `EventSource` accepts only `withCredentials` and cannot send an `Authorization` header ([current TypeScript stack, 3.8](https://github.com/jeffnawroth/source-taster/blob/f980ddeff22dfb497dde58c768c5a4639a839558/docs/research/current-typescript-stack.md)).

Unknown:

- Whether a session cookie of the API origin is reliably sent on `fetch`/`EventSource` from the side panel in **Firefox**, and in Brave with its stricter cookie defaults. Needs a prototype per browser.

Opinion:

- Candidate: use a **bearer session token** for the extension, sent as `Authorization` header, subject to #11's security design. Read check progress with a `fetch`-based SSE reader **in the side panel page**, not in the service worker. This avoids depending on cookie classification for that transport; native-browser verification is still required.
- The simplest candidate sign-in path requiring no identity bridge is the **one-time code typed into the side panel** (FA-KTO-02). A magic link opens a web page; handing its session to the extension needs either `externally_connectable` (not Firefox), a content script on the web app's origin, or `identity.launchWebAuthFlow`. This belongs to #11.
- FA-KTO-03 requires the same account data in both, not a shared browser session. Separate sign-in in extension and web app appears compatible with the stated acceptance criterion; this is an interpretation to confirm in #11, not an approved account-experience decision.

## 7 Build frameworks and tooling (verified versions, npm registry, 2026-10-24)

| Package | Latest | Published | License | Bundler | Firefox | Notes | Source |
|---|---|---|---|---|---|---|---|
| `wxt` | **0.21.4** | 2026-08-11 | MIT | Vite (peer `^6.3.4 \|\| ^7 \|\| ^8.0.0-0`), Node ≥ 22 | Yes; a `sidepanel` entrypoint becomes `side_panel` for Chrome and `sidebar_action` for Firefox | Pre-1.0; "Roadmap to v1.0" issue open since 2024-08; repository unarchived and pushed on the research date (maintenance signals, not a support guarantee) | [registry](https://registry.npmjs.org/wxt), [entrypoints](https://wxt.dev/guide/essentials/entrypoints.html), [roadmap #920](https://github.com/wxt-dev/wxt/issues/920) |
| `plasmo` | 0.90.5 | 2025-05-17 | MIT | Parcel | Yes | Pre-1.0; no npm release for 17 months; release cadence does not meet the preferred maintenance profile | [registry](https://registry.npmjs.org/plasmo), [repo](https://github.com/PlasmoHQ/plasmo), [targets](https://docs.plasmo.com/framework/workflows/build) |
| `@crxjs/vite-plugin` | 3.0.0 | 2026-09-24 | MIT | Vite (peer `^3 … ^8`) | Not documented; README says "Modern Chrome extension development" | npm has 3.0.0, but the newest visible GitHub release is `vite-plugin-v2.7.0` (2026-06-19): release-correspondence gap | [registry](https://registry.npmjs.org/@crxjs/vite-plugin), [README](https://github.com/crxjs/chrome-extension-tools/tree/main/packages/vite-plugin), [releases](https://github.com/crxjs/chrome-extension-tools/releases) |
| `vite-plugin-web-extension` | 4.5.1 | 2026-04-06 | MIT | Vite | see section 7.1 | Maintainer recommends WXT for new projects and plans maintenance mode; see 7.1 | [registry](https://registry.npmjs.org/vite-plugin-web-extension) |
| `extension` (Extension.js) | 4.1.35 | 2026-10-22 | MIT | **Rspack** (`@rspack/core` in `extension-develop`) | Yes (Chrome, Edge, Firefox, Safari listed) | Stable major; different bundler/config from Vite; shared UI source remains possible | [registry](https://registry.npmjs.org/extension-develop), [README](https://github.com/extension-js/extension.js) |
| `web-ext` | 10.8.0 | 2026-10-15 | MPL-2.0 | — | Mozilla's CLI to run, lint, sign Firefox add-ons | | [registry](https://registry.npmjs.org/web-ext) |
| `@wxt-dev/browser` | 0.3.6 | 2026-10-22 | MIT | — | Runtime API access plus types | See [package README](https://github.com/wxt-dev/wxt/blob/main/packages/browser/README.md); not type-only | [registry](https://registry.npmjs.org/@wxt-dev/browser) |
| `@types/chrome` | 0.3.6 | 2026-10-21 | MIT | — | Chrome API types | | [registry](https://registry.npmjs.org/@types/chrome) |
| `webextension-polyfill` | 0.12.0 | 2024-05-14 | MPL-2.0 | — | Archived (section 5.3) | | [registry](https://registry.npmjs.org/webextension-polyfill) |

Corrections to the sibling research (section 7 of the TypeScript stack document): WXT 0.21.4 and Plasmo 0.90.5 are confirmed pre-1.0. `webextension-polyfill` is not only stale but archived and unnecessary for the documented Chrome 148+ baseline (derivative-browser native APIs still need checking). CRXJS 3.0.0 exists on npm but no matching release was visible in the repository releases endpoint and its README documents Chrome. This is an evidence gap, not proof that the npm artifact is illegitimate.

### 7.1 What qualifies under the existing maturity rule?

Verified:

- The [vite-plugin-web-extension README](https://github.com/aklinker1/vite-plugin-web-extension/blob/main/README.md) says it will be deprecated in favor of WXT, recommends WXT for new projects, and says new features/fixes are not being added to the older plugin. Its 4.5.1 version number therefore does not establish suitability for a new long-lived product.
- [Extension.js](https://github.com/extension-js/extension.js) documents TypeScript, React/Vue/Svelte/Preact, MV3 adapters for Chrome/Edge/Firefox/Safari, custom Chromium/Gecko executable paths, production ZIPs, and source ZIPs. Its [v4.1.35 release](https://github.com/extension-js/extension.js/releases/tag/v4.1.35) is dated 2026-10-22 and is not marked prerelease. The published [`extension-develop` package](https://registry.npmjs.org/extension-develop/4.1.35) uses Rspack 2.2.3 and declares Node `>=22.12`; the [`extension` CLI](https://registry.npmjs.org/extension/4.1.35) has the same Node floor. The repository's `--polyfill` flag is optional; a dependency on the archived polyfill still exists in tooling metadata. This is not evidence that every production bundle includes it.
- WXT's [sidepanel entrypoint documentation](https://wxt.dev/guide/essentials/entrypoints.html#sidepanel) explicitly distinguishes Chrome `side_panel` and Firefox `sidebar_action`. Its [browser targeting](https://wxt.dev/guide/essentials/target-different-browsers.html) supports separate targets. The open [v1 roadmap](https://github.com/wxt-dev/wxt/issues/920) still calls 0.x a prerelease phase. It is maintained, but remains outside the map's no-pre-1.0-core rule if the product is structured around its entrypoints/storage/modules.
- Plain [Vite production builds](https://vite.dev/guide/build.html) support multiple HTML entrypoints and `base: './'` for relative asset URLs. The registry currently reports **Vite 8.3.5**, published 2026-10-21, MIT, Node `^20.19.0 || >=22.12.0` ([registry](https://registry.npmjs.org/vite)). That is newer than the sibling's Vite snapshot. Vite alone does not generate extension manifests, package stores, or solve browser API differences.

Assessment, not a selection:

| Approach | Fit under the current bar | Tradeoff / evidence still needed |
|---|---|---|
| Plain Vite + explicit manifest generation + native API adapter + `web-ext` | Candidate without an extension-specific framework core; TypeScript and UI reuse remain straightforward | Own a small build layer: bundle background code separately, copy manifests/locales/assets, use stable entry filenames, ZIP deterministically. Verify a production build, not only HMR. |
| Extension.js 4.1.35 | Candidate stable cross-browser framework with recent release activity | Different build config from the proposed web Vite stack; inspect generated Firefox/Chromium manifests, CSP and emitted dependencies, reproducibility, shared workspace imports and native panel behavior. README support is not acceptance evidence. |
| WXT 0.21.4 | Technically attractive and actively maintained, but outside the current core maturity rule | Reconsider only after stable 1.x or an explicit client-approved exception. Do not relabel it “only a build tool” while coupling application source to its abstractions. |
| Plasmo 0.90.5 | Outside maturity rule and weak release freshness | Its published dependency metadata pins TypeScript 5.8.2 and Parcel 2.9.3. Compatibility with the sibling's newer compiler approach has not been established. |
| CRXJS 3.0.0 | Possible Chromium build helper, not a verified cross-browser answer | A separate Firefox pipeline/adapter remains necessary; npm/repository release correspondence and Firefox behavior need verification before adoption. |
| vite-plugin-web-extension 4.5.1 | Reject for a new core build dependency on present maintainer guidance | Stable numbering does not offset the stated migration/maintenance direction. |

Opinion: shortlist **the explicit Vite build and Extension.js** for #26. Compare the maintenance cost of the small owned build with the convenience and dependency surface of the framework; either still needs the same platform adapter and native-browser tests. No runtime or framework is selected by this research. Node 26 is **Current**, with LTS scheduled for 2026-10-28 ([Node release schedule](https://github.com/nodejs/Release/blob/main/schedule.json)); the shortlisted tools' declared engine ranges include Node 24/26, but no build was run here to establish package compatibility. Choose an already-supported LTS build environment or verify Node 26 after LTS, rather than describing it as LTS today.

### 7.2 Types and licenses

Verified license texts: [Vite MIT](https://github.com/vitejs/vite/blob/main/LICENSE), [Extension.js MIT](https://github.com/extension-js/extension.js/blob/main/LICENSE), [WXT MIT](https://github.com/wxt-dev/wxt/blob/main/LICENSE), [Plasmo MIT](https://github.com/PlasmoHQ/plasmo/blob/main/LICENSE), [vite-plugin-web-extension MIT](https://github.com/aklinker1/vite-plugin-web-extension/blob/main/LICENSE), [CRXJS plugin MIT](https://github.com/crxjs/chrome-extension-tools/blob/main/packages/vite-plugin/LICENSE), and [web-ext MPL-2.0](https://github.com/mozilla/web-ext/blob/master/LICENSE). The FSF [license list](https://www.gnu.org/licenses/license-list.en.html) classifies MIT/Expat as GPL-compatible and explains MPL-2.0's secondary-license conditions. These top-level licenses reveal no obvious AGPL-3.0 blocker; this is not a complete transitive-license audit or legal opinion. `web-ext` is a development/signing tool, not code that needs to ship in the panel.

Opinion: keep vendor API types at the adapter boundary and export small application-owned TypeScript interfaces. A 0.x **type declaration** package such as `@types/chrome` need not structure the product's runtime or build framework; its package version is not the browser API version. The client should confirm this interpretation of “core” in #26. Native types also do not make `sidePanel` exist in Firefox or certify Opera support. Do not silently introduce `@wxt-dev/browser` as the cross-browser runtime core while excluding WXT on maturity grounds.

## 8 Shared UI, language and platform boundary

Verified constraints: the panel can load a packaged extension HTML page and APIs (section 3); code must be locally packaged (5.2); business functions must go through the same versioned API (FA-ERW-04). These allow common UI source regardless of whether the API uses the sibling's proposed Hono/PostgreSQL stack. None of those server choices is required by the extension APIs.

Candidate organization (opinion):

- Share client-only TypeScript components, input/result workflows, styles, translations, validation, response/error types and API client source. Compile them independently into the web app and extension. The browser adapter owns panel opening, selection handoff, extension storage, external navigation and session transport. Web-specific routes own checkout and administration links (FA-GLE-02). Avoid importing server-only code, web-cookie assumptions or a Node runtime into the panel.
- Use a packaged top-level panel page, not an iframe of the hosted web app as the primary implementation. An iframe would make authentication, framing policy, focus, store review and remotely loaded code harder to reason about. An injected DOM sidebar has host-permission, CSS, accessibility and restricted-page problems; it does not automatically satisfy the native icon-opening acceptance criterion of FA-KON-04.
- Share responsive components, but verify them at real panel widths and resize limits, with keyboard navigation, focus after context-menu capture, screen readers, zoom, long German labels and system contrast modes (FA-UEB-04). The 360-pixel smartphone target in FA-UEB-05 concerns the web app and is not a guaranteed native panel width.
- Bundle executable code, CSS, fonts and translations into each extension release. Build-time compilation is compatible with MV3; runtime template compilation using `eval`, CDN scripts and development HMR permissions must not reach production. If setting a restrictive `connect-src`, include the API origin explicitly ([Chrome network/CSP guidance](https://developer.chrome.com/docs/extensions/develop/concepts/network-requests)). Remote API JSON, quota configuration and settings are data; never turn API responses into an interpreter for downloaded application logic.

Localization has two surfaces. [Chrome i18n](https://developer.chrome.com/docs/extensions/reference/api/i18n) and [Firefox internationalization](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Internationalization) document `_locales/<locale>/messages.json`, `default_locale`, manifest `__MSG_name__` placeholders, `getMessage` and browser UI language APIs. These cover extension metadata and can cover menu text. The app also needs a **user-switchable** language for FA-KON-01, which is distinct from the browser's current UI locale. Generate manifest/menu messages and the shared UI catalogs from one reviewed source, or enforce key coverage between them. Recreate/update menu titles when the app language changes; a localized manifest name does not prove the in-panel language switch works. The eventual i18n library can be Paraglide, i18next or another approved choice; no specific one is imposed here.

### 8.1 Selection, persistence and permissions proposal

The required selected-text flow can start without injecting into every visited page: the native menu delivers `selectionText`. Treat it as untrusted text, never HTML. [Chrome contextMenus](https://developer.chrome.com/docs/extensions/reference/api/contextMenus) says menus can appear in documents/frames including `file://` and `chrome://`; this does **not** guarantee that every privileged page/viewer exposes a usable native text selection.

If direct text is insufficient, a one-shot `activeTab` + `scripting.executeScript` fallback is possible on allowed pages ([Chrome activeTab](https://developer.chrome.com/docs/extensions/develop/concepts/activeTab), [scripting](https://developer.chrome.com/docs/extensions/reference/api/scripting)). Context menu invocation grants `activeTab`; this permission does not bypass protected origins. [MDN content-script restrictions](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Content_scripts) exclude browser UI, extension pages, reader view and the PDF viewer and enumerate protected vendor domains. This restriction applies to an **injection fallback**; it is not proof that native context-menu selection fails on those same pages. Test each route separately. Cross-origin frames, input/textarea selections, rich editors, PDFs and web editors such as Google Docs need their own selection tests; a canvas-based editor may not expose a DOM text selection at all. Dedicated Word/Google Docs add-ins remain deferred under FA-ORG-22.

For FA-ERF-04, Chrome's open/close events can update menu state, but `contextMenus.update` changes the extension's menu item, not an automatically isolated per-window state. Recompute on window/tab activation and panel lifecycle changes, restore after background restart, and test multiple windows. Firefox's `menus.onShown` + `sidebarAction.isOpen` provides a more direct per-display hook. Optional events in Chromium derivatives must be feature-detected; a panel-page connection can be investigated as a fallback, not assumed to be an authoritative native visibility signal. This is a should requirement; record a deviation if it cannot reliably disable the menu.

[Chrome storage](https://developer.chrome.com/docs/extensions/reference/api/storage) describes `storage.session` as in-memory, cleared on reload/update/restart, by default inaccessible to content scripts; `storage.local` defaults to a 10 MB limit and is exposed to content scripts unless its access level is narrowed. [MDN storage](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/storage) warns extension storage is not encrypted; it distinguishes local from browser-synchronized data. BCD records Firefox `storage.session` from 115, but **not** `storage.session.setAccessLevel` ([storage BCD](https://github.com/mdn/browser-compat-data/blob/main/webextensions/api/storage.json)). Do not call Chrome-only access-level APIs unconditionally.

Candidate rules: keep pending selections in session memory with acknowledgement/expiry, remove them on reset and consumption, and keep raw documents out of local/sync storage. The 20 MB file limit (FA-ERF-12) already exceeds Chrome's default 10 MB local-storage quota; a file input/upload should use `File`/`Blob` and the API, not encode entire uploads in `storage.local`. Clear non-history content within FA-UEB-10's limit even if the browser remains open. Choose local storage for only the necessary opaque identifiers/settings, with explicit expiry and security treatment; browser `storage.sync` would send content or tokens to an additional vendor and cannot be presumed EU-resident. Review how FA-UEB-13 applies to the user's own device separately from operator storage (section 11).

### 8.2 Authentication and stream design boundaries

The token flow in section 6 is a candidate, not a guarantee that local bearer-token persistence is safe. Prefer short-lived access credentials in session memory; decide persistent/rotating refresh credentials, idle expiry, revocation, logout and account deletion with #11 and the ASVS assessment (FA-UEB-46). Extension storage is not an encrypted vault. Do not use `storage.sync` for credentials. Limit message senders and methods; a content script must not become a general authenticated network proxy ([Chrome security example](https://developer.chrome.com/docs/extensions/develop/concepts/network-requests)). No AI/provider/payment secret belongs in the shipped extension.

A one-time e-mail **code** can be submitted directly from the packaged panel to the account API and is explicitly allowed by FA-KTO-02. It avoids assuming that a magic link opened in the mail client's chosen browser reaches the installing extension. A link-based bridge needs a deliberately designed one-time, state-bound exchange. [Chrome identity](https://developer.chrome.com/docs/extensions/reference/api/identity) and [Firefox launchWebAuthFlow](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/identity/launchWebAuthFlow) provide redirect-based auth flows; use per-store extension IDs/redirect URLs and verify each derivative, rather than assuming one URL serves all packages. `identity` is additional permission/surface, not needed for the basic code flow. `externally_connectable` cannot be the common browser bridge because Firefox lacks it. An own-origin content script is another candidate, with narrowly scoped permissions and strict origin/message validation.

For cookies, a host permission does not prove identical cookie/container/privacy behavior in every browser. Even in Chrome's documented SameSite exception, cross-origin `fetch` must deliberately choose credentials behavior. Test Firefox containers/private mode, Brave defaults, cookie-blocking and expiry if cookies remain a candidate. Sharing an **account** through the API is separate from automatically sharing a browser **session**.

[EventSource's standard constructor](https://html.spec.whatwg.org/multipage/server-sent-events.html#the-eventsource-interface) exposes a URL and `withCredentials`, not arbitrary request headers. Candidate: a fetch-based SSE reader in the panel can attach an Authorization header. It must implement reconnect/backoff, event IDs or a fresh state snapshot, token expiry and error handling; it does not inherit `EventSource` reconnection automatically. Reopening the panel should read authoritative Check state through the API. Cancelling the stream/closing the panel is not equivalent to the FA-SUC-08 cancellation request, which must preserve finished verdicts and quota accounting. Do not put bearer tokens into stream URLs.

No durable background-Check feature is added by this proposal: FA-ERF-09 remains deferred. Server state independent of a UI process is a candidate technical mechanism; what closure/reopen does to an in-progress Check, including quota, still needs a product decision. A service worker keeping a stream alive cannot be used as a browser-independent substitute for that decision.

## 9 Distribution and release constraints

### 9.1 Browser product and store are separate choices

| Target | Verified distribution facts | Consequence / unknown |
|---|---|---|
| Chrome | Normal user distribution uses the Chrome Web Store; self-hosting is restricted on Windows/macOS outside enterprise policy ([installation distribution](https://developer.chrome.com/docs/extensions/how-to/distribute/install-extensions)). Publishing requires a developer account and a one-time registration fee ([registration](https://developer.chrome.com/docs/webstore/register)). | Do not base general-user rollout on unpacked developer mode. The fetched registration page confirms the fee exists but does not state its amount; no fee amount is assumed. |
| Edge | Microsoft documents publishing through Edge Add-ons/Partner Center, certification and disclosure requirements ([publish](https://learn.microsoft.com/en-us/microsoft-edge/extensions/publish/publish-extension)); [registration](https://learn.microsoft.com/en-us/microsoft-edge/extensions/publish/create-dev-account) explicitly has no registration fee. [Porting guidance](https://learn.microsoft.com/en-us/microsoft-edge/extensions/developer-guide/port-chrome-extension) describes Chrome API/manifest compatibility checks. | A separate listing/package/extension ID may be wanted for discoverability; Chromium compatibility alone does not validate the Edge sidebar. Company-account verification can take days to weeks. No account was created. |
| Brave | Brave says it supports most Chrome Web Store extensions and describes installation from that store ([vendor guide](https://brave.com/learn/installing-chrome-extensions/)). | A separate Brave store pipeline is not required by that documented route. Test Brave's own panel UI and privacy defaults. The support.brave.com/app help URLs returned HTTP 403; this claim instead uses the accessible first-party guide and tracker. |
| Opera | Opera documents an add-ons catalog and moderator review ([publishing guidelines](https://dev.opera.com/extensions/publishing-guidelines/)); its [user help](https://help.opera.com/en/latest/customization/#extensions) also describes installing Chrome extensions through an “Install Chrome extensions” add-on. | The help may lag the actual current install UI; verify the route on 137/138 before promising a one-click Chrome Web Store installation. A dedicated Opera listing is an alternative, not an automatic requirement. Panel API availability is independently documented only from Opera 136 (section 3). |
| Firefox / ESR | Mozilla signing is required for ordinary release/beta installation whether listed on AMO or self-distributed. Unlisted distribution still undergoes validation and can be manually reviewed. ESR can disable signing in a preference, but that is not an appropriate consumer installation assumption ([signing/distribution](https://extensionworkshop.com/documentation/publish/signing-and-distribution-overview/)). | Produce a Firefox-specific signed XPI with a stable Gecko ID, consent metadata and source/build instructions. AMO signing is a release dependency even if the file is self-hosted. |

The platform's embedded user experience is not selected by the store: a Chrome Web Store package installed in Brave or Opera still runs in that browser's panel product. An older Opera `sidebar_action` implementation is not proof of Firefox-compatible `sidebarAction.open()` semantics. Prefer the newly documented `sidePanel` route for current Opera as a candidate, with a native test; do not mix both manifest sidebar systems without validation.

### 9.2 Review timing and FA-GLE-01 to FA-GLE-05

Verified publication behavior:

- [Chrome review process](https://developer.chrome.com/docs/webstore/review-process): new items **and updates** are reviewed; usually days, sometimes weeks; broad permissions and hard-to-review code may increase time. [Deferred publishing](https://developer.chrome.com/docs/webstore/publish) allows holding an approved submission for up to **30 days** before it reverts to draft/re-review.
- [Edge publishing](https://learn.microsoft.com/en-us/microsoft-edge/extensions/publish/publish-extension): certification can take up to **seven business days**, then the extension is published. This documentation is an operational estimate, not a contractual deadline.
- [Mozilla signing](https://extensionworkshop.com/documentation/publish/signing-and-distribution-overview/): automated validation/signing/publication can take up to **24 hours**, or longer if selected for manual review; subsequent reviews can reject/block versions. [AMO submission](https://extensionworkshop.com/documentation/publish/submitting-an-add-on/) describes source upload and choosing how to distribute. No guaranteed coordination window with other stores is established here.
- [Opera publishing](https://dev.opera.com/extensions/publishing-guidelines/) describes moderator review and publication after criteria are satisfied; no maximum review time is stated in that guide.
- [Chrome manifest versions](https://developer.chrome.com/docs/extensions/reference/manifest/version) use one to four numeric components, each 0–65535; automatic updates compare numeric versions. `version_name` is a display string, not update ordering. A newer published version does not mean every installed user has already updated.

Inference: these are independent queues and user update schedules, so literal simultaneous feature availability in every installed extension and the web cannot be guaranteed through ordinary releases. FA-GLE-05 is **should**, and its actual acceptance criterion is matching new-feature release-note version numbers, not an explicit wall-clock deadline. FA-GLE-01/02 remain **must**; review lag does not authorize serving a permanently reduced extension.

Candidate release design: build all clients from one release commit with one product version, submit packages before exposing a new shared feature, use Chrome's staged publication where useful, and keep API responses compatible with previously installed clients. For already-bundled features, an API capability/feature gate can coordinate activation after the supported packages are available; the store policy allows configuration when all logic is packaged (5.2). A gate cannot deliver missing executable code. Decide whether a lagging client receives the old compatible workflow or an upgrade notice; avoid assuming that forcing an update would preserve all must functions. These are choices for #21/#26, not decisions made here.

### 9.3 Privacy, reproducibility, licensing and cost boundary

Verified: the [Chrome privacy FAQ](https://developer.chrome.com/docs/webstore/program-policies/user-data-faq) addresses privacy policy/disclosure and Limited Use; [Edge publishing](https://learn.microsoft.com/en-us/microsoft-edge/extensions/publish/publish-extension) requires a privacy policy when personal information is accessed, transmitted or collected. [AMO policy](https://extensionworkshop.com/documentation/publish/add-on-policies/) requires necessary permissions, self-contained code and reproducible source/build instructions, and rejects build environments no longer supported by maintainers. Collecting selected website text and account information must be described, even when only sent to Source Taster's own API. Guest support is a useful reviewer path, but paid-only functionality must also be reviewable with appropriate test instructions; no user documents or production credentials need to be uploaded as part of this investigation.

Candidate release evidence: retain the exact lockfile, source commit, supported Node/package-manager versions, clean build instructions and resulting browser-specific package checksums. Inspect the **production** ZIP/XPI for remote code, debug endpoints, source secrets and overbroad permissions. Store IDs, extension origins and auth redirect configuration belong in release configuration; use stable production IDs and separate development/test identities where appropriate. Browser packages can share a product version while having distinct IDs and signing.

Opera's [publishing guidelines](https://dev.opera.com/extensions/publishing-guidelines/) state a default CC BY-NC-ND license if a separate EULA is not supplied. That default is unsuitable for an extension intended to be AGPL-3.0 under section 14.6: explicitly supply the correct license and have the distribution terms checked under FA-UEB-23. Merely selecting a build framework's MIT license does not establish the product's open-core boundary (#12).

The open-source build tools examined here do not require a hosted service for local compilation. No paid build/publish service, browser account, infrastructure or processing provider was selected. Browser stores distribute software; they are not a proposed destination for checked documents. Store registration/review documentation is not a data-processing agreement or an SLA for Source Taster's API. Hosting DPAs, EU storage and the 99.5% product-availability design remain inputs to #10/#22; store-review estimates must not be presented as contractual availability guarantees. Current vendor terms, operator identity/trader disclosures and final transitive licenses still need the required launch review.

## 10 Validation needed before platform acceptance

This research did **not** install browsers, build an extension, provision services or test account flows. The following is the evidence plan implied by the verified constraints, not a completed test report or an implementation backlog.

### 10.1 Tool coverage

- [Playwright extension documentation](https://playwright.dev/docs/chrome-extensions) supports extensions only in **Chromium persistent contexts**. It recommends its bundled Chromium because branded Chrome and Edge removed required side-loading flags. This can cover packaged panel UI, API mocks and service-worker lifecycle behavior. Navigating straight to `panel.html` tests the document, **not** whether the real toolbar or selection menu opens the native panel.
- Mozilla's [`web-ext`](https://extensionworkshop.com/documentation/develop/getting-started-with-web-ext/) can lint/run Firefox extensions with a chosen Firefox executable; pin an actual ESR executable separately. `web-ext lint` validates packages, not browser behavior or accessibility. It is not a full replacement for end-to-end tests.
- [Selenium's current Firefox JS source documentation](https://www.selenium.dev/selenium/docs/api/javascript/firefox.js.html) exposes Firefox-specific context and add-on commands; it marks `installAddon` deprecated in favor of `installWebExtension`. This is a candidate TypeScript-compatible automation route through selenium-webdriver/geckodriver. Verify its supported install/context commands against **both** current Firefox and ESR before choosing a harness; a method in current client source does not establish ESR protocol support. Native chrome interaction remains fragile and may need manual acceptance.
- Web-app Playwright Firefox/WebKit tests do not certify a Firefox extension or real Safari. Manual/native-browser verification is still required for the supported branded extension browsers. Browser automation that only opens a panel URL cannot cover native menus, signing prompts, built-in data consent or sidebar layout.

### 10.2 Release acceptance matrix

Test Chrome N/N-1, Edge N/N-1, Opera N/N-1, Brave's agreed two feature release lines, Firefox N/N-1 and the agreed current ESR. Refresh N at the time of release; do not freeze the 2026-10-24 snapshot forever. Record browser version, engine version, OS, extension ID, package checksum, source/product/API version, permission state and result. Choose OS coverage explicitly rather than assuming one Chromium test is enough.

| Area | Evidence required in the real target browsers | Requirement / reason |
|---|---|---|
| Icon and panel | Fresh install, pin/unpin, icon click without `action.default_popup`, menu opening, page navigation, tab/window switches, another native sidebar, resize, close/reopen; Edge known issue and Brave/Opera UI behavior specifically | FA-KON-04; both API implementation and browser chrome must work |
| Selection capture | Single/multiple references; line breaks, Unicode/German text, long selections up to accepted input limits, input/textarea, contenteditable, same/cross-origin frames, PDF viewer, browser pages/protected vendor pages, file URLs, canvas/editor; compare native selection payload with permitted fallback | FA-ERF-03, FA-ERF-01/12; documentation gives no completeness/line-break guarantee |
| Handoff and lifecycle | Cold panel, unloaded/restarted background, repeated clicks before load, two windows with different selections, update/restart while pending, reset and permission revocation | No dropped/misrouted text; no reliance on a background global; FA-ERF-11, FA-UEB-10 |
| Optional menu state | Native/user-initiated close, tab/window activation and background restart; no disable state leaking between windows | FA-ERF-04 (should) |
| API / account | Guest check without registration, e-mail code, expired/revoked token, logout, same plan/history/settings as web, checkout/admin navigation back to web; optional cookie experiment under Firefox containers, private mode and Brave defaults | FA-KTO-01/02/03/40, FA-GLE-01/02, FA-ERW-04 |
| Progress and cancellation | First verdict and completion targets, interrupted stream/reconnect with no duplicated quota, closing/reopening UI under agreed semantics, cancellation retaining finished verdicts, offline/rate-limit/expired-session errors | FA-SUC-07/08, 9.5, FA-UEB-40 to 43; a stream disconnect is not a cancel |
| Full parity | File import at 20 MB and 1,000-reference limit, field correction, comparison/detail views, history consent/deletion, clipboard, CSL-JSON/BibTeX export, accessible PDF verification report; 50-reference identical-score/defaults test | FA-GLE-01/03; side panel cannot become a reduced companion while the web does the rest |
| Language / accessibility | German/English catalog coverage, menu relabel on language switch, keyboard/screen-reader flow, narrow panel, zoom, accessible progress and error announcements, result comparison layout, copy/download controls | FA-KON-01, FA-UEB-01/04, FA-ERG-11/14/20 |
| Distribution / privacy | Signed/store-like package, source-reproducible production build, Firefox consent grant/refusal and update prompts, restricted API-host permission, no remote executable assets, guest data expiry and no cloud-sync credentials/content | 5.2/5.5, FA-UEB-10 to 15/21/23/46, section 14.6 |

Missing API behavior in Brave/Opera is a go/no-go **validation** item for the chosen candidate. A missing must capability must return to the client; neither a silent popup nor silently dropping a target browser is authorized. If a target truly lacks a side panel, section 19's FA-KON-05 trigger is reached, but FA-EIN-02 still requires client reassessment before implementing deferred popup functionality.

## 11 Candidate clarifications and decisions for the client

**No requirement has been changed, and no platform/framework/account architecture is approved by this report.** Some entries below may only need an acceptance interpretation; an actual scope change requires the client's new specification version.

| IDs / constraint | Newly precise question | Candidate clarification or amendment, only if the client agrees |
|---|---|---|
| FA-KON-04, section 14.6 | Is extension support desktop-only, and which Windows/macOS/Linux versions are required? | State desktop/OS scope explicitly. Desktop sidebar APIs do not establish mobile extension support; Firefox Android has no `sidebarAction`. |
| Section 14.6 | Does “current Firefox ESR” mean the newest main ESR line (153.5.1esr now), or also the separately published 115 line for older OSs? What counts as Brave's “two latest major versions” while its product version remains 1.x? | Define newest ESR line and two Brave **feature** release lines, or deliberately include the older ESR with its consent/API limitations. A Firefox minimum of 140 is only acceptable under the former interpretation. |
| FA-ERF-03, FA-KON-04, FA-KON-05 | Does “any web page” include protected browser/store pages, embedded browser PDF viewers, local files, canvas editors and cross-origin frames? What happens if there is no accessible native selection? | Enumerate accepted surface types and explicit exceptional messaging/copy/upload paths where the browser forbids capture. This would narrow the literal acceptance wording if universal capture cannot be delivered; it is not assumed here. A popup fallback requires separate reassessment of the deferred requirement. |
| FA-GLE-01/02 (must), FA-GLE-05 (should) | Is common release-note/product version sufficient while independent stores and installed clients roll forward asynchronously? What service does an older extension receive while the web advances? | Agree on coordinated release readiness, compatible old-client behavior and a defined availability window. Do not silently convert full parity into “web-only until review finishes.” |
| FA-KTO-03, FA-KON general settings, FA-KTO-15 | Is the same account/plan/history after separate sign-in sufficient, or is automatic web-to-extension session handoff expected? Must guests share one identifier/settings/quota between the web and extension in the same browser? | Confirm API-backed account equality versus automatic session linking. Distinct security origins do not give an automatic common guest identifier; a deliberate linking mechanism would need design if one quota across both surfaces is intended. |
| FA-UEB-10/11/13/15, FA-KTO-02 | Does EU storage constrain only operator/service-provider storage or also the user's own local extension state? How long may auth/settings/guest state persist, and how is consent separated from transmitting selected text? | Explicitly distinguish ephemeral local working state, necessary auth/settings and consented server history. Do not use browser cloud sync as an implicit EU-storage solution or treat Firefox installation consent as history/analytics consent. |
| FA-SUC-08, FA-ERF-09 (deferred), FA-UEB-42 | On closing the side panel, should a foreground Check cancel, remain retrievable when reopened, or require the later background-Check feature? | Specify lifecycle/accounting semantics. Notification and long-running background product behavior remain deferred unless reassessed. |
| Map's stable/no-pre-1.0-core rule, section 14.6 licenses | Choose the explicit Vite build or evaluate Extension.js first? Do pre-1.0 type-only packages count as core? | Keep WXT/Plasmo excluded as structural frameworks under the present rule; allow an explicit interpretation for declarations. Approve neither a pre-1.0 core exception nor a framework just through this research. |

Technical choices now concrete enough for #21/#26: global per-window versus tab-specific panel state; typed native API adapter and its browser detection; Vite-owned packaging versus Extension.js; e-mail code/session transport with #11; source reproducibility and browser/OS acceptance coverage; coordinated store release policy. Those are downstream decisions, not new requirements adopted here.

## 12 Answer to the ticket and sibling handoff

Verified conclusion: the required **native sidebar and selected-text menu are available as documented capabilities**, but through two API families. Chrome and Edge explicitly document `sidePanel.open` from context menus and icon opening. Firefox/ESR have `sidebarAction` with user-action constraints and an event-page background rather than a service worker. Opera 136 explicitly introduced `chrome.sidePanel`; Brave's own tracker evidences implementation. The last two still require native product testing for each required method and launch flow; Chromium BCD mirroring cannot certify them. No single framework removes these differences.

Recommended decision shortlist (opinion): **bundled shared TypeScript UI + browser adapter**, with **plain Vite packaging or Extension.js 4** evaluated under the unchanged maturity rule; common versioned API for business behavior; an e-mail code/token candidate to avoid relying on cross-browser cookie sharing; panel-owned progress connection with state recovery rather than a permanently alive background process. Keep WXT as a future candidate after 1.0 or an explicit exception, and do not select Plasmo or the migrating Vite plugin as the present structural core. All recommendations await client approval.

Answers to [the sibling #25 handoff at f980ddeff22dfb497dde58c768c5a4639a839558](https://github.com/jeffnawroth/source-taster/blob/f980ddeff22dfb497dde58c768c5a4639a839558/docs/research/current-typescript-stack.md#7-constraints-for-the-browser-extension-platform-research-9):

1. **Framework maturity:** section 7 narrows the stable shortlist and records WXT/Plasmo exclusions, CRXJS scope/evidence gaps and the older Vite plugin's maintenance direction.
2. **Cross-browser API layer:** native `browser` exists in Chrome 148+; the Mozilla polyfill is archived. Validate native namespace/Promise behavior in derivatives; keep explicit `sidePanel`/`sidebarAction` adapters rather than assuming a namespace unifies capabilities.
3. **Side panel and ESR:** sections 2–4 give current release/API evidence and the ESR115 ambiguity; current newest ESR has the Firefox sidebar and built-in consent minimum.
4. **UI sharing/MV3:** section 8 supports compiled shared client source with locally bundled code/assets. It does not allow loading the deployed web app's executable bundle remotely.
5. **Auth and SSE:** sections 6/8.2 explain cookies as unproven across all targets, token transport as a candidate, and fetch-based SSE recovery/security responsibilities. The Hono/Node server recommendation is not a browser constraint.
6. **Tests:** section 10 distinguishes Chromium Playwright, Firefox/ESR `web-ext` plus a candidate Selenium/geckodriver harness, and indispensable native branded-browser acceptance.
7. **Localization:** section 8 distinguishes manifest/browser locale from the user-selected app language and proposes one translation source with menu relabeling.

Research completeness: the documentation investigation is complete enough to inform the later platform decision. Unknowns are explicitly delimited to client interpretations, production-build/license verification and empirical native-browser/auth/selection tests; **none is claimed to have passed**. The supplied English v3.1 specification remains unchanged. The predecessor project was not accessed.
