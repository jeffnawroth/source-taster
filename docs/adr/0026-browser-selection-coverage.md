---
status: accepted
---

# Take over only the browser's native selection payload and bound FA-ERF-03 to surfaces with a browser selection menu

The client accepted this design on 26 October 2026 in [Browser selection coverage on restricted surfaces](https://github.com/jeffnawroth/source-taster/issues/64), through [F1–F4](https://github.com/jeffnawroth/source-taster/issues/64#issuecomment-6409941266). [ADR-0002](0002-tech-stack.md), [ADR-0003](0003-system-architecture.md) and [ADR-0016](0016-results-presentation-workflow.md) chose the owned side-panel adapter over Chromium `sidePanel` and Firefox `sidebarAction`, the browser matrix and the context-menu intake without auto-start. They left open which surfaces actually deliver a selection. The FA-ERF-03 acceptance criterion of v3.3 said "any web page"; no browser lets an extension read a selection on every surface. This trades the literal "any web page" for a contract the browser can actually honour, with no injected scripts and no host permissions.

The client explicitly approved the consolidated **requirements v3.4** on 26 October 2026. It changes only the FA-ERF-03 acceptance criterion; the requirement text is unchanged. Version 3.4 supersedes v3.3 as the approved baseline. This is an accepted design. It is not an implemented extension or a browser qualification run: the facts below are derived from current browser documentation and source code, and nothing was tested in a browser.

## Browser facts

| Surface | Native `selectionText` in the menu click | Reading `getSelection()` by script injection |
| --- | --- | --- |
| Ordinary pages, form fields, contenteditable | yes | yes, top origin only under `activeTab` |
| Same- and cross-origin frames | yes | cross-origin frames not reachable under `activeTab` |
| Built-in PDF viewers (Chromium, Firefox pdf.js) | yes | no |
| `file://` pages, Reader View, browser pages, web stores | yes, where the browser shows the menu | no |
| Canvas-based editors (e.g. Google Docs) | no browser selection, own context menu | no |
| Password fields | no | no |
| Private windows without extension permission | no menu entry | no |

- **Truncation:** Firefox caps `selectionText` at 16,384 characters. Chromium does not truncate.
- **Line breaks:** Firefox keeps them. Current Chromium source suggests they are kept, but older reports say otherwise, so this is a release qualification case.
- **Opening the panel:** Chrome 116+, Edge and Opera (native `sidePanel` since 135.0.5973.123) open the panel through `sidePanel.open()` from `contextMenus.onClicked`. Firefox opens it through `sidebarAction.open()` from `menus.onClicked`. Both calls require the user gesture and must happen before any `await`. Brave's runtime behaviour is unconfirmed.
- **Menu visibility:** without `documentUrlPatterns`, the selection entry appears on built-in PDF viewers, browser pages and Reader View wherever the browser shows its context menu.

Sources: [Chrome contextMenus](https://developer.chrome.com/docs/extensions/reference/api/contextMenus), [Chrome sidePanel](https://developer.chrome.com/docs/extensions/reference/api/sidePanel), [MDN sidebarAction.open](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/sidebarAction/open), [Firefox ext-menus.js](https://searchfox.org/mozilla-central/source/browser/components/extensions/parent/ext-menus.js), [Firefox SelectionUtils](https://raw.githubusercontent.com/mozilla-firefox/firefox/main/toolkit/modules/SelectionUtils.sys.mjs), [Chromium context_menu_helpers.cc](https://chromium.googlesource.com/chromium/src/+/main/chrome/browser/extensions/context_menu_helpers.cc), [Chromium side_panel_api.cc](https://chromium.googlesource.com/chromium/src/+/main/chrome/browser/extensions/api/side_panel/side_panel_api.cc), [Chromium active_tab_permission_granter.cc](https://chromium.googlesource.com/chromium/src/+/main/extensions/browser/permissions/active_tab_permission_granter.cc), [Opera 135 changelog](https://blogs.opera.com/desktop/changelog-for-135/), [Brave issue 31334](https://github.com/brave/brave-browser/issues/31334). Current versions at decision time: Chrome 157, Firefox 158, Firefox ESR 153.

## Text source

Take only the native `selectionText` delivered with the menu click. The extension injects no script and requests neither the `scripting` permission nor host permissions for selection intake. The text stays local in the side panel until the user starts the Check ([ADR-0016](0016-results-presentation-workflow.md)); nothing is sent or stored before that.

**Pre-approved contingency:** if release qualification shows that Chromium drops line breaks from `selectionText`, add `activeTab` and `scripting` and read `getSelection()` only in the clicked frame, and only where injection is possible. Everywhere else the native text stays. `activeTab` is a per-click grant, not a general permission broadening; no other permission fallback is approved.

## Menu registration

Register the "Check selected text" entry with contexts `["selection"]` and no `documentUrlPatterns`. It then appears wherever the browser offers its context menu for a selection, including built-in PDF viewers, Reader View, `file://` pages and browser pages. FA-ERF-04's "Open side panel" entry is unaffected.

## Supported selection contract (FA-ERF-03, v3.4)

> Selected text appears as input in the side panel after the entry is chosen, on any web page where the browser offers its context menu for the selection, including PDFs in the browser's built-in viewer, frames and form fields. Excluded are pages that replace the browser's context menu or render text without a browser selection (e.g. canvas-based editors), password fields, and private windows in which the user has not allowed the extension.

Help and the side panel point to copy and paste for the excluded surfaces.

## Intake behaviour

```text
on(menu click)
  open side panel synchronously        // before any await
  put selectionText into the input field
  if a draft was not yet sent: replace it, offer one-step Undo
  if a Check is running or finished: keep it reachable
  if selectionText is empty: notice "No selection was taken over – please copy and paste"
  if Firefox and length == 16,384: notice "The selection may have been shortened – paste the text or upload a file for longer lists"
  never start a Check automatically
```

Product text remains DE/EN; the notices above are the English wording. If a target browser cannot open a side panel, the existing FA-KON-05 trigger applies; this decision approves no popup fallback.

## Acceptance evidence

- The release checklist of [ADR-0003](0003-system-architecture.md) gains cases for line breaks, both built-in PDF viewers, same- and cross-origin frames, form fields, the Firefox 16,384-character cap and Brave's panel opening.
- Each case shows the side panel opening with the selected text in the input field and no Check started.
- An empty selection and a capped Firefox selection show their notices.
- A canvas-based editor, a password field and a private window without extension permission show no taken-over text; help points to copy and paste.
- The extension manifest requests no `scripting` and no host permission, unless the line-break contingency has been triggered by a recorded qualification result.

## Considered options

- **Native `selectionText`, entry wherever the browser shows it, bounded acceptance criterion (chosen):** no injected code, no host permissions, widest real coverage including PDF viewers; an honest contract.
- **Script injection with `getSelection()` everywhere:** keeps line breaks and has no length cap, but fails on PDF viewers, browser pages, stores and cross-origin frames and needs `scripting` permissions. Rejected as the primary path; kept only as the line-break contingency.
- **Broad host permissions:** reach more frames, but trigger permission warnings and still miss PDF viewers and browser pages. Rejected.
- **Keep "any web page" unchanged:** not achievable on canvas editors, password fields or disallowed private windows, so the criterion could never pass. Rejected.
- **Restrict the entry to ordinary pages with `documentUrlPatterns`:** hides the entry exactly where native payloads still work. Rejected.

## Consequences

- Selection intake needs no permission beyond `contextMenus`/`menus` and the side-panel API; the store review stays small.
- Selections above 16,384 characters on Firefox must go through paste or file upload.
- Pages with their own context menus remain copy-and-paste only.

Handed-off interfaces:

- **Implementation:** the menu registration, the synchronous panel opening in the owned adapter, the intake into the input field with Undo and the two notices.
- **Release validation ([ADR-0003](0003-system-architecture.md)):** the checklist cases above, including the Chromium line-break check that decides the contingency.
- **[Final technical-concept synthesis and requirements traceability](https://github.com/jeffnawroth/source-taster/issues/60):** close G04, update the FA-ERF-03 row to v3.4 and move the baseline references to v3.4.
