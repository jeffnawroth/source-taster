# #259: browser-store listings and submission packages

Part of #70. This note prepares the first submission of the browser extension
(`apps/extension`) to the Chrome Web Store, Firefox Add-ons (AMO) and Microsoft
Edge Add-ons. It holds the listing texts, the permission and privacy
disclosures, the screenshot mapping, the reproducible build and the per-store
checklist. Everything an agent can do is done. What is left needs an account, a
fee, a signature, a decision about a real origin or the final submit, and is
marked **Owner** below. Nothing here creates an account, uploads a file or
contacts a store.

It is an engineering input, not legal advice. The privacy statements are built
from `docs/implementation/253-provider-register.md` (#253) and from the code,
and stay a draft for the legal review in #257.

## 1. What is ready and what is not

| Part                                  | State                                                                                                                                                       |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Version                               | `0.1.0`, one source: `apps/extension/package.json`. The manifest, the `client` string of every Check and the zip names read it.                              |
| Release build                         | `pnpm --filter @source-taster/extension release` writes one zip per target, `SHA256SUMS` and `release.json` to `apps/extension/dist/release`.                 |
| AMO source package                    | `pnpm --filter @source-taster/extension release:source`, plus `apps/extension/store/README-AMO-REVIEWERS.md`.                                                  |
| Listing texts EN and DE               | Section 3. The manifest description and name come from `apps/extension/store-listing.ts` and a test keeps this note equal to it.                              |
| Permission justifications             | Section 4.                                                                                                                                                  |
| Privacy disclosures                   | Section 5.                                                                                                                                                  |
| Screenshots, tiles and logos          | Section 6, all from `packages/release-imagery/exports` and `packages/brand/exports`.                                                                         |
| Source offer                          | Listing text and the source package are ready. The in-extension link is #270, still open.                                                                    |
| Accounts, fees, real origins, submit  | **Owner.** Section 8.                                                                                                                                       |

The extension is a development preview: its comparison rules are uncalibrated
and no public service exists yet (see `skeleton_notice`, #222). Every text
below says so. A submission only makes sense once the owner has a live API origin
(#116, #258). The release script refuses to build a store package without one.

## 2. Versioning and release builds

`apps/extension/package.json` carries `0.1.0`. The first store submission
should use it; later submissions raise it (every store rejects an equal or
lower version). Chrome and Edge accept one to four dot-separated integers,
Firefox accepts the same form. `0.1.0` is valid for all three.

The store channel is a second build beside the development build
(`SOURCE_TASTER_EXTENSION_CHANNEL=store`, set by the release script only):

- `manifest.json` uses `__MSG_extensionName__` and `__MSG_extensionDescription__`
  with `default_locale` `en` and `_locales/en`, `_locales/de`. Edge reads the
  languages of a package from these.
- Firefox gets the permanent add-on ID `{052624ed-a1ee-4aea-9c15-6630ffbef314}`.
  The development build keeps its own ID, so a development install never shares
  storage with the store add-on.
- The API, website and service origins are required, public HTTPS and never a
  development default. No `127.0.0.1` or `localhost` can reach a store package,
  and a test checks that in the built files.
- No source maps and no secrets are written. The build reads six public
  variables and nothing else from the environment.

```sh
pnpm install --frozen-lockfile
pnpm exec turbo run build --filter='@source-taster/extension^...'
export SOURCE_TASTER_EXTENSION_API_URL=https://<api origin>      # Owner
export SOURCE_TASTER_EXTENSION_WEBSITE_URL=https://<website>     # Owner
# hosted build only: _SERVICE_URL, _MODE=hosted, _ACCOUNT_SIGN_IN=enabled
pnpm --filter @source-taster/extension release          # both zips
pnpm --filter @source-taster/extension release:source   # AMO source package, clean HEAD only
```

`pnpm --filter @source-taster/extension release:rehearsal` builds both packages with
reserved `.invalid` hosts and writes `*-rehearsal.zip` files (add
`node scripts/release.ts source --rehearsal` for a rehearsal source package, which
needs a clean git checkout). Use it to check the
toolchain. A rehearsal package cannot be uploaded by mistake: its API host never
resolves, and a real run rejects reserved hosts.

Output for `0.1.0`:

| File                                         | Goes to                                                |
| -------------------------------------------- | ------------------------------------------------------ |
| `source-taster-0.1.0-chromium.zip`           | Chrome Web Store and Microsoft Edge Add-ons            |
| `source-taster-0.1.0-firefox.zip`            | AMO                                                    |
| `source-taster-0.1.0-source.zip`             | AMO, "source code" upload                              |
| `SHA256SUMS`, `release.json`                 | Kept with the submission record (hash of every file)   |

Zips are deterministic: sorted entries, one fixed timestamp, fixed compression.
Two builds of the same commit and the same inputs give the same bytes. The
repository test builds both targets twice and compares them.

## 3. Listing texts

Product vocabulary follows `GLOSSARY.md`: Reference, Check, Verdict, Evidence.
The tone is plain. No superlatives and no claim of accuracy. The development
preview notice stays in the first sentence.

### 3.1 Name and manifest description

Name: `Source Taster` (EN and DE).

Manifest description, at most 132 characters (Chrome limit, `store-listing.ts`
enforces it). This is also the Chrome and Edge short description.

EN:

```text
Development preview: checks whether references point to existing sources and shows a Verdict for each, with its evidence.
```

DE:

```text
Entwicklungsvorschau: prüft, ob Referenzen auf existierende Quellen verweisen, und zeigt je Referenz einen Befund mit Belegen.
```

AMO "Summary" (up to 250 characters) takes the same text.

### 3.2 Long description, EN

```text
Source Taster checks whether the references in a text point to sources that exist, and shows one Verdict for each Reference together with the Evidence behind it.

This is a development preview. Its comparison rules are not calibrated, some source types cannot yet be fully checked, and no public service is available yet.

How it works
- Paste references into the side panel, or select text on a page and choose "Check selected text" from the context menu.
- Each Reference is compared with sources such as OpenAlex and Crossref. The panel shows a Verdict per Reference, for example Correct, Exists, with deviations, or DOI conflict. Each Verdict is shown with a symbol and a label and lists the fields that matched or differed.
- A Verdict states what the comparison found. It does not state that a Reference is true, and it does not replace reading the source.

What leaves your browser
- The text of the References you check is sent to the Source Taster service. The service contacts the data sources it needs with fields of the Reference, such as title, author names, year and identifiers.
- If you sign in, your e-mail address and a session credential are used. Preferences sync across browsers only if you allow it (Firefox asks separately).
- The extension has no analytics, no advertising and loads no remote code.

The extension asks for access to one address only: the Source Taster API. It reads no page unless you select text and choose the menu entry.

Source code
Source Taster is free software under the AGPL-3.0-or-later. The source of this exact version is at https://github.com/jeffnawroth/source-taster (tag extension-v0.1.0).
```

### 3.3 Long description, DE

```text
Source Taster prüft, ob die Referenzen in einem Text auf Quellen verweisen, die existieren, und zeigt je Referenz einen Befund zusammen mit den Belegen dafür.

Dies ist eine Entwicklungsvorschau. Die Vergleichsregeln sind nicht kalibriert, manche Quellenarten lassen sich noch nicht vollständig prüfen, und ein öffentlicher Dienst ist noch nicht verfügbar.

So funktioniert es
- Fügen Sie Referenzen in den Seitenbereich ein oder markieren Sie Text auf einer Seite und wählen Sie im Kontextmenü "Ausgewählten Text prüfen".
- Jede Referenz wird mit Quellen wie OpenAlex und Crossref verglichen. Der Seitenbereich zeigt je Referenz einen Befund, zum Beispiel Korrekt, Existiert, mit Abweichungen oder DOI-Konflikt. Jeder Befund trägt ein Symbol und eine Beschriftung und nennt die Felder, die übereinstimmten oder abwichen.
- Ein Befund sagt, was der Vergleich ergeben hat. Er sagt nicht, dass eine Referenz wahr ist, und ersetzt nicht das Lesen der Quelle.

Was Ihren Browser verlässt
- Der Text der Referenzen, die Sie prüfen, wird an den Source-Taster-Dienst gesendet. Der Dienst fragt die nötigen Datenquellen mit Angaben der Referenz ab, etwa Titel, Autorennamen, Jahr und Kennungen.
- Wenn Sie sich anmelden, werden Ihre E-Mail-Adresse und ein Sitzungsnachweis verwendet. Einstellungen werden nur zwischen Browsern abgeglichen, wenn Sie das erlauben (Firefox fragt gesondert).
- Die Erweiterung enthält keine Analyse, keine Werbung und lädt keinen Fremdcode.

Die Erweiterung fragt nur Zugriff auf eine Adresse an: die Source-Taster-API. Sie liest keine Seite, außer Sie markieren Text und wählen den Menüeintrag.

Quellcode
Source Taster ist freie Software unter der AGPL-3.0-or-later. Der Quellcode genau dieser Version liegt unter https://github.com/jeffnawroth/source-taster (Tag extension-v0.1.0).
```

The menu entry and the Verdict names above are the strings in
`packages/i18n/messages` (`selection_menu`, and the Verdict labels shown in
the release imagery). If a message changes, change the listing with it.

### 3.4 Category and search terms

| Store | Value                                                                                                                                           | Basis                                                                                               |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| AMO   | Category `Search Tools` (`search-tools`). Fallback `Other` (`other`). Tags: `references`, `citations`, `bibliography`, `research`.               | Slugs read from `https://addons.mozilla.org/api/v5/addons/categories/` on 2026-11-27.                |
| Chrome | **Owner confirms** in the dashboard. Proposal: `Tools` or `Education`, and `English`/`Deutsch` listing languages.                              | `developer.chrome.com/docs/webstore/category` returned 404 on 2026-11-27; the dashboard lists the values. |
| Edge  | **Owner confirms** in Partner Center. Proposal: `Productivity` or `Education`.                                                                   | Microsoft does not document the list; Partner Center shows it.                                       |

Edge search terms (up to 7 terms, 21 words, 30 characters each):
`reference check`, `citation check`, `bibliography`, `source verification`, `DOI`, `Crossref`, `OpenAlex`.

Edge needs a description of 250 to 10,000 characters. The long descriptions
above have about 1,500 characters.

### 3.5 Source offer in the listing

The long descriptions end with the source offer: the licence and the repository
with the tag of the exact version. Per #254 and #270 the offer under AGPL-3.0
section 6(d) is a designated place next to the object code. A store listing is
that place for people who find the extension there. The Mozilla source upload
(section 7.3) is a review requirement and does not replace it.

**Owner:** create the tag `extension-v0.1.0` on the commit that was built
before submitting, so the link works. The in-extension link to the source,
reachable by keyboard, is #270 and is still open. The licence question is #257.

## 4. Permission justifications

Derived from the generated manifest (`apps/extension/extension-config.ts`) and
the code that uses each entry. There is no content script, no `activeTab`, no
`tabs`, no `scripting` and no `<all_urls>`.

| Manifest entry                              | Targets          | What it is used for                                                                                                                                                                                                                   | Code                                       |
| ------------------------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| `sidePanel`                                 | Chromium         | Shows the Source Taster panel beside the page. Opened by the toolbar button and by the context menu entry. Firefox uses `sidebar_action`, which needs no permission.                                                                  | `src/background.ts` (`sidePanel.open`, `setPanelBehavior`) |
| `storage`                                   | Chromium, Firefox | Keeps Preferences (language, citation style, appearance), the Guest identity and the sign-in session credential in extension-local storage. The credential store is restricted to trusted extension contexts (`TRUSTED_CONTEXTS`).    | `src/panel.tsx`, `src/account-session.ts`  |
| `contextMenus` (Chromium), `menus` (Firefox) | Chromium, Firefox | Adds one entry, "Check selected text", shown only when text is selected. The selection is passed to the panel and held in memory for 30 seconds. It is not written to storage.                                                       | `src/background.ts`                        |
| `host_permissions`: `https://<api origin>/*` | Chromium, Firefox | Lets the panel call the Source Taster API (Checks, sign-in, Preferences). One origin, chosen at build time. The service must also list the extension origin in its CORS allow-list (**Owner**, in the private service repository).   | `extension-config.ts`                      |
| `content_security_policy.extension_pages`   | Chromium, Firefox | `script-src 'self'; object-src 'self'`. No inline script, no `eval`, no remote script.                                                                                                                                                 | `extension-config.ts`                      |
| `data_collection_permissions`               | Firefox          | Required: `authenticationInfo`, `personallyIdentifyingInfo`, `websiteContent`. Optional: `technicalAndInteraction` (Preferences sync). Details in section 5.3.                                                                          | `docs/implementation/162-firefox-data-consent.md` |

Chrome's single-purpose statement (dashboard field):

> Source Taster checks whether the references in a text point to existing
> sources and shows a Verdict with its Evidence for each Reference.

## 5. Privacy disclosures

Built from the provider register (#253). **Contract status of every provider is
`none signed`.** The register says the privacy text must call providers
"placeholder", not final, until the owner has signed. The disclosures below
therefore describe data flows and categories and name the recipient classes.
The named processors are candidates until #116 and #257 close.

### 5.1 Data the extension handles

| Data                                              | Why                                     | Leaves the browser?                                   | Where it goes                                         |
| ------------------------------------------------- | --------------------------------------- | ----------------------------------------------------- | ----------------------------------------------------- |
| Text of the References the user pastes or selects  | The Check                               | Yes, on each Check                                    | The Source Taster API, then the data sources (5.2)    |
| E-mail address and sign-in code                    | Account sign-in (hosted build)          | Yes, only when the user signs in                      | The Source Taster API; the mail provider sends the code |
| Session credential                                 | Keeps the user signed in                | Sent to the API with requests                         | Stored in extension-local storage                     |
| Preferences (language, citation style, appearance) | Same settings across browsers           | Only for a signed-in user, and in Firefox only after the user grants `technicalAndInteraction` | The Source Taster API, otherwise local only |
| Guest identity                                     | Quota and History for a Guest           | Yes                                                   | The Source Taster API                                 |
| Selection from the context menu                    | Hand text to the panel                  | No                                                    | Memory, 30 seconds                                    |

No browsing history, no page content other than the selected text, no
location, no health or financial data, no analytics identifiers and no
advertising data are collected. The extension loads no remote code, and does
not sell or transfer data for purposes unrelated to the Check.

### 5.2 Recipients and retention (from the register)

- **Operator infrastructure** (register rows 1 to 6): hosting and database in
  Paris, France; encrypted backups in France; transactional mail in France;
  telemetry in France; availability probes with a provider whose location is not
  yet confirmed. All candidates, contract `none signed`.
- **Data sources queried by the service** (rows 17 to 27): OpenAlex, Crossref,
  Europe PMC, Semantic Scholar, arXiv, doi.org, Open Library, Google Books,
  Internet Archive, and any web host a Reference cites. They are independent
  recipients. What each receives: title, author names, year and identifiers
  (identifier only for arXiv and doi.org; the cited URL for web pages and the
  Internet Archive). Several are in the United States and the United Kingdom, so
  the privacy text needs a transfer statement from the lawyer (#257, finding F-2).
- **AI extraction** (rows 13 to 15, paid Plans only): sends Reference text to an
  AI provider that is not selected yet (#159). The listing must not name one.
  Criteria: EU only, no training, no storage.
- **Retention** (findings F-3, F-6, F-7 of the register): no stored text for a
  Guest without History after at most 24 hours; History 30 days (Free) or 90
  days (paid); limiter counters at most 24 hours; security events 30 days;
  database exports 312 hours and History or Account data in backups at most 14
  days; billing data 8 years.

The register states that the privacy drafts do not yet cover the extension
(F-1, F-2, F-8). The privacy policy URL that the stores require therefore waits
for #257.

### 5.3 What each store asks

**Chrome Web Store, "Privacy practices" tab.** Declare these data types as
collected: _Personally identifiable information_ (e-mail address),
_Authentication information_ (sign-in code and session credential) and _Website
content_ (the text of References). Do not declare health, financial, location,
personal communications, web history or user activity. Certify that the data is
used only for the single purpose above, is not sold, is not used for creditworthiness
or lending, and is transferred only to provide the Check. Remote code: _No_.
Each permission above has its justification text in section 4. A privacy policy
URL is required: **Owner**, from #257.

**Firefox AMO.** The manifest already carries `data_collection_permissions`
(required `authenticationInfo`, `personallyIdentifyingInfo`, `websiteContent`;
optional `technicalAndInteraction`), which AMO shows in the install prompt and on
the listing. `strict_min_version` is `140.0` because earlier Firefox versions do
not know the key. A privacy policy is required when the add-on collects data: **Owner**.
Do not tick "Android" on the first upload: the side panel is not tested on
Firefox for Android.

**Microsoft Edge Add-ons.** Partner Center asks for a privacy policy URL and for
whether the extension accesses personal information. Answer as for Chrome. The
Chromium zip is used as is. Edge has not been run in this work (see section 9).

## 6. Screenshots, tiles and logos

All images exist in `packages/release-imagery/exports` (#223) and
`packages/brand/exports`. They show the accepted design only: no gradient, no
invented interface, and each captured screen carries the development-preview
notice. `manifest.json` in the imagery folder records the SHA-256 of each file,
the alt text in EN and DE and which claims the image supports.
**`releaseQualified` is `false`** in that manifest: the captures come from the
fixture, not from a calibrated release. Upload them for the preview listing only,
and regenerate them (`pnpm --filter @source-taster/release-imagery build`) when a
qualified release exists.

| Slot                                   | Files                                                                                                           | Size                          |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| Chrome screenshots (1 to 5), EN        | `cws-en-1-workspace.png`, `cws-en-2-overview.png`, `cws-en-3-evidence.png`                                       | 1280 × 800                    |
| Chrome screenshots, DE                 | `cws-de-1-workspace.png`, `cws-de-2-overview.png`, `cws-de-3-evidence.png`                                       | 1280 × 800                    |
| Chrome small promo tile                | `promo-small-440x280.png`                                                                                       | 440 × 280                     |
| Chrome marquee promo tile (optional)   | `promo-marquee-1400x560.png`                                                                                    | 1400 × 560                    |
| Chrome store icon                      | `packages/brand/exports/store-cws-128.png`                                                                      | 128 × 128                     |
| AMO screenshots, EN and DE             | `amo-{en,de}-{1-workspace,2-overview,3-evidence}.png`                                                           | 1280 × 960                    |
| AMO icon (also in the package)         | `packages/brand/exports/store-amo-128.png`                                                                      | 128 × 128                     |
| Edge screenshots (up to 6)             | The Chrome files, one set per language                                                                          | 1280 × 800                    |
| Edge small promo tile                  | `promo-small-440x280.png`                                                                                       | 440 × 280                     |
| Edge logo                              | `packages/brand/exports/store-edge-300.png`                                                                     | 300 × 300                     |

The files under `social-*` and `x-*` are not store assets. The two promo tiles do
not carry the preview notice (`devPreviewNotice.carried` is `false`); they are
optional, so omit them if the owner wants every image to carry it.

## 7. Per-store checklist

Legend: **Agent** = prepared in this pull request. **Owner** = only the owner
can do it.

### 7.1 Chrome Web Store

1. **Owner:** create the developer account and pay the one-time registration fee;
   verify the account.
2. **Owner:** decide the real API and website origin (#258, #116) and build with
   them (section 2).
3. **Agent:** `source-taster-0.1.0-chromium.zip` and the listing, permission and
   privacy text above.
4. **Owner:** create the item. The first upload fixes the extension ID. Add the ID
   to the service's CORS allow-list. Chrome signs the package; no signing key is
   kept in this repository.
5. **Owner:** fill the Store listing tab (sections 3 and 6), the Privacy practices
   tab (4 and 5.3) and the distribution settings; choose the category; add the privacy policy URL (#257).
6. **Owner:** press "Submit for review". Choose staged or deferred publishing if wanted.

### 7.2 Microsoft Edge Add-ons

1. **Owner:** register in Partner Center (free) and enrol in the Microsoft Edge program.
2. **Agent:** use the same `source-taster-0.1.0-chromium.zip`. The `_locales` and `default_locale` let Partner Center detect English and German.
3. **Owner:** upload the zip, set availability and markets, choose the category,
   add the search terms and the privacy policy URL.
4. **Owner:** add the notes for certification: how to try the extension and that
   the service is a development preview. Provide a test account if the hosted build needs one.
5. **Owner:** submit. **Check first** that the side panel opens in a current Edge
   (not verified here, section 9).

### 7.3 Firefox AMO

1. **Owner:** create or sign in to the account at addons.mozilla.org.
2. **Owner:** confirm or change the add-on ID `{052624ed-a1ee-4aea-9c15-6630ffbef314}`
   **before** the first upload. After the first upload it is effectively
   permanent, and a development-time ID must not be reused.
3. **Agent:** `source-taster-0.1.0-firefox.zip` (the exact file AMO signs and serves).
4. **Agent:** `source-taster-0.1.0-source.zip` with `README-AMO-REVIEWERS.md` and
   `BUILD-INPUTS.env` at its root. Reviewers rebuild on Ubuntu 24.04 with Node
   24.14.0 and npm 11.9.0 and compare the result with the uploaded package.
5. **Owner:** upload the Firefox zip, choose the distribution channel, say that the
   add-on's code is minified or bundled when the form asks, and upload the source zip
   (the form wording is Mozilla's and may change).
6. **Owner:** paste the reviewer notes (7.4), fill the listing (sections 3 and 6),
   choose the category and the privacy policy.
7. **Owner:** submit. AMO signs the add-on on approval. Signing keys and API credentials
   stay with Mozilla; none belong in the repository. Use `web-ext sign` only with
   credentials kept outside the repository, and only if the owner wants a self-hosted channel.

### 7.4 Reviewer notes (AMO and, if asked, Chrome and Edge)

- The source package builds the add-on with two commands after `pnpm install`.
  `README-AMO-REVIEWERS.md` has the exact list.
- The build only bundles and minifies with Vite. Nothing is obfuscated and
  nothing is fetched at run time.
- `web-ext lint` (a one-off `pnpm dlx web-ext lint` on the rehearsal Firefox
  package, 2026-11-27) reports 0 errors and 4 warnings. All four are expected:
  - `UNSAFE_VAR_ASSIGNMENT` twice, `innerHTML` in `assets/panel-*.js`: both
    sites are library code. React DOM handles `dangerouslySetInnerHTML` and creates a
    `<script>` probe element; React Aria's live announcer clears its log with
    `innerHTML = ""`. First-party code in `apps/extension/src` and `packages/ui/src`
    never uses `innerHTML` or `dangerouslySetInnerHTML` (checked with grep).
  - `DANGEROUS_EVAL`, the `Function` constructor: a `try { return Function("") }`
    feature probe in the bundled validation library. It runs no dynamic code, and
    the extension-page CSP (`script-src 'self'`) forbids string evaluation anyway.
  - `KEY_FIREFOX_ANDROID_UNSUPPORTED_BY_MIN_VERSION`: `strict_min_version`
    `140.0` is below Firefox for Android 142, the first Android version that
    knows `data_collection_permissions`. Another reason to leave Android unticked.
- To test the add-on a reviewer needs a reachable API origin. The service is a
  development preview with no public deployment; **Owner:** give the reviewers
  a test origin and, if the build is hosted, a test Account.

## 8. Owner-only steps in one list

- Developer accounts and fees for the three stores (Chrome registration fee;
  Edge and AMO are free).
- A live API origin, a website origin, and the Account service decision
  (#116, #258). The release script cannot build without them.
- Per-store extension IDs (Chrome, Edge) and the allow-list for them in the private service.
- The permanent Gecko ID decision.
- The privacy policy URL (#257) and the lawyer review of section 5.
- The `extension-v0.1.0` tag, and the in-extension source link (#270).
- Choosing categories in the Chrome and Edge dashboards.
- Test origin and test Account for reviewers.
- The final submit in each store, and any store-side signing.

## 9. Known gaps and what was not verified

- Reproducibility was verified on macOS arm64 and on Ubuntu 24.04 arm64 (section 10).
  x86-64 Linux was not run.
- The panel has not been run in Edge. The Chromium zip is the one used for Chrome
  and uses the `sidePanel` API; whether Edge honours it was not tested.
  **Owner:** open the Chromium build in Edge before submitting there. If it fails,
  file an issue for an Edge-specific fallback.
- Firefox for Android is untested; leave it unticked.
- The numbers in section 10 are for rehearsal packages, which use `.invalid`
  hosts, so a real build has different hashes.
- The imagery is not release-qualified (section 6).
- No store was contacted. Categories for Chrome and Edge are proposals.

## 10. Evidence

Local, macOS, Node 24.14.0. `pnpm --filter @source-taster/extension release:rehearsal`
twice gave identical SHA-256 sums for both zips. The repository test
(`apps/extension/scripts/release.test.ts`) repeats the check with real Vite
builds and asserts the manifest, the locales, the version, the Gecko ID and the
absence of loopback addresses and source maps.

Source package round trip, same machine: `release:source` (rehearsal) was extracted
into an empty directory under `/tmp`, then `pnpm install --frozen-lockfile`, the
`turbo run build --filter='@source-taster/extension^...'` step and the release
build from the README ran there. Both the Firefox zip and the Chromium zip had
the same SHA-256 as the build in the repository checkout. The same round trip ran
in a fresh `ubuntu:24.04` container (arm64, Node 24.14.0 from nodejs.org, npm
11.9.0, pnpm 12.15.0) and gave the same SHA-256 for both zips again. That is the
AMO reviewers' default environment, so the source package is complete, the build
does not depend on the checkout, and the Firefox zip reproduces byte for byte
on both macOS and Ubuntu. Not run: x86-64 Linux and Windows.

## 11. Sources

Checked on 2026-11-27.

- Chrome: [prepare to publish](https://developer.chrome.com/docs/webstore/prepare),
  [listing tab](https://developer.chrome.com/docs/webstore/cws-dashboard-listing),
  [privacy practices tab](https://developer.chrome.com/docs/webstore/cws-dashboard-privacy),
  [user data FAQ](https://developer.chrome.com/docs/webstore/program-policies/user-data-faq),
  [best practices](https://developer.chrome.com/docs/webstore/best-practices),
  [manifest `description`](https://developer.chrome.com/docs/extensions/reference/manifest/description),
  [manifest `version`](https://developer.chrome.com/docs/extensions/reference/manifest/version).
- Firefox: [submitting an add-on](https://extensionworkshop.com/documentation/publish/submitting-an-add-on/),
  [source code submission](https://extensionworkshop.com/documentation/publish/source-code-submission/),
  [add-on policies](https://extensionworkshop.com/documentation/publish/add-on-policies/),
  [create an appealing listing](https://extensionworkshop.com/documentation/publish/create-an-appealing-listing/),
  [extensions and the add-on ID](https://extensionworkshop.com/documentation/develop/extensions-and-the-add-on-id/),
  [build a secure extension](https://extensionworkshop.com/documentation/develop/build-a-secure-extension/),
  [AMO categories API](https://addons.mozilla.org/api/v5/addons/categories/).
- Edge: [publish an extension](https://learn.microsoft.com/en-us/microsoft-edge/extensions/publish/publish-extension).
