---
status: accepted
---

# Serve a bilingual static information site with local help/search and no launch product analytics

The client accepted this design on 25 October 2026 in [Website, documentation, help and analytics](https://github.com/jeffnawroth/source-taster/issues/54), through [F1–F8](https://github.com/jeffnawroth/source-taster/issues/54#issuecomment-6397614603) and [F9–F11](https://github.com/jeffnawroth/source-taster/issues/54#issuecomment-6397628520). Use a small static website/documentation build, reuse the existing open-program hosting and provide direct legal/help/contact links from every interface. Omit product analytics at launch. This avoids another running service, an external search provider and tracking infrastructure while keeping the information offering aligned with the actual product.

The approved baseline remains [requirements v3.3](../requirements-specification.md). This records the accepted design, not a requirements amendment, implemented website, purchased domain/mailbox, cleared dependency graph, completed legal review or passed accessibility assessment. The public/private boundary and existing hosting, legal, security and message policies remain ADR-0001/0002/0009/0012/0015/0019. No should/deferred feature is brought forward merely because a page can describe it.

**Open technical conflict:** the [focused primary-source findings](https://github.com/jeffnawroth/source-taster/blob/2e47781e1e21fdfc32dcfaf7e9d5018ab02ceb65/docs/research/website-documentation-capabilities.md) establish structural/bundled 0.x dependencies in the accepted Astro/Pagefind route and a 0.x dependency in Docusaurus. F2 selected the tools but did not approve an exception to ADR-0002. Their adoption therefore remains blocked pending a concrete client decision; this draft must not be treated as approval to use those excluded dependencies.

## Site, search and placement

- **Build:** Astro **7.4** for a static site in `apps/website` in the open repository. Do not use Starlight 0.42: its pre-1.0 status conflicts with ADR-0002. Docusaurus **3.10** is the accepted fallback, subject to the same qualification; it is not an automatically cleared replacement.
- **Search:** Pagefind **1.5** for a locally hosted documentation index/UI. Ship its required assets locally; no external search endpoint receives queries. Native build binaries, bundled client code/WASM and transitive dependencies belong in the toolchain/license/security inventory, not an implicit new production service.
- **Version qualification:** these are selected release lines, not a qualified lockfile. Pin exact versions during setup and prove the complete runtime/build/bundled graph, licenses, advisories and actual Node/TypeScript compatibility under ADR-0002/0015. Omitting Starlight alone does not establish that Astro/Pagefind or the fallback has no structural 0.x dependency. This ADR grants no new maturity exception; unresolved blockers return for a concrete decision rather than inheriting ADR-0017's PDF-only exception.
- **Hosting:** serve the static build from the open verification program's existing Scalingo web container. No separate website host/container is selected. The intended saving is no separate hosting subscription; the existing container's domain/TLS/routing, bandwidth/resource capacity and effect on availability still require qualification. The original hosting estimates do not guarantee zero incremental operating cost. Preserve ADR-0012's capacity triggers and infrastructure ceiling.
- **Domains:** website on the apex with `/de/` and `/en/`, documentation beneath `/docs/` with corresponding DE/EN pages, web app on `app.<domain>`. The actual domain remains unselected. Keep page identities and language counterparts explicit so help can deep-link reliably; no language cookie is needed.

The evidence snapshot is Astro **7.4.2**, Pagefind **1.5.2** and Docusaurus **3.10.2**. Astro's executed compiler/Markdown/configuration paths include `@astrojs/compiler-rs` 0.5.x, `@astrojs/markdown-satteri` 0.4.5 and `@astrojs/internal-helpers` 0.13.0. Pagefind's native/WASM locks contain structural 0.x components, including `wax` 0.7.0 and `wasm-bindgen` 0.2.117. Docusaurus declares `eval` 0.1.x. Astro also declares a prerelease `get-tsconfig` version requiring separate resolution. These are documented blockers, not an exhaustive production graph or a vulnerability finding. The research has installed/built none of them.

**Proposed F12, not yet accepted:** permit a purpose-limited maturity exception for reviewed 0.x dependencies of the static website build and bundled local documentation search. Require a complete pinned inventory (including native/WASM/bundled code), supported maintenance and compatibility evidence, licenses/notices, the existing advisory/release gates, and tested site/search behavior before use. Do not exempt prerelease versions automatically, accept unknown graph entries, activate a new production service or extend the exception to verification, authentication, billing or other project tooling. If a blocker outside that scope remains, return the concrete dependency/version choice rather than silently widening the exception. ADR-0002 is unchanged until the client accepts this proposal or selects another route.

The static build contains public site/documentation/legal content only, never customer References, History, support correspondence, private datasets, secrets or private-service code. Keep indexes and caches public-content-only. Serving static files from the verification program does not widen the private backend's content access. The external status page remains the separately accepted ADR-0012 service, reached by a normal link rather than a tracking embed.

## Language entry and completeness

At the bare apex, select `/de/` for a German browser language and `/en/` otherwise. Explicit language URLs retain their selected language; every page has a visible switch to the corresponding page in the other language. Language is carried by the URL, not persisted in a cookie. App/extension help links use their current interface language and target the appropriate document directly.

Implement and qualify language negotiation in the existing host or local entry logic. A static redirect file alone cannot inspect a request's language; test actual redirect/status/cache behavior and preserve explicitly selected language paths. This adds no Astro production renderer.

Every website/documentation page exists in both languages. CI fails when a counterpart is missing; route presence alone is not evidence that body text, navigation, search controls, error/empty states and metadata are translated. Keep local search language-aware and accessible. Website and documentation texts join [ADR-0019's](0019-transactional-email-catalog.md) recorded FA-UEB-01 sample of 50 texts per language and completeness evidence.

Use the existing per-program localization boundary: public site content belongs to the open repository, while private Account/billing/mail catalogs remain private. Legal documents stay versioned documents under ADR-0009, not ordinary mutable translation strings. No untranslated silent fallback is a passed DE/EN completeness check.

## Legal information and feature claims

Publish the Impressum, terms, privacy policy and withdrawal instructions in DE and EN as versioned public documents. Each is directly reachable from the web app, extension panel menu (opening a tab), Operator administration and every e-mail footer. No sign-in is required merely to read legal/help information. Preserve ADR-0009's exact accepted terms/consent versions and durable purchase records; replacing a current website page does not rewrite what an Order accepted.

The FA-UEB-23 review supplies/qualifies legal wording, binding-language treatment and any required statutory workflow. This site decision does not approve the separate withdrawal-function, tax/OSS or retention amendment candidates. Legal links are not substitutes for the existing sign-in-independent statutory cancellation route or pending legal review.

For FA-EIN-01, maintain an internal requirement-ID reference for each feature claim in website/documentation content. Before launch and each release, record a comparison against the actual accepted/released feature state and acceptance evidence. Do not expose requirement IDs as product navigation. Features still disabled behind a flag are not advertised as available; committed code, an ADR or a target value is not proof of a shipped capability or passed measurement.

## Help, FAQ and support

Each interface has a **Help** entry opening documentation in its current language, deep-linked where useful. Include FAQ and the direct [ADR-0016](0016-results-presentation-workflow.md) **How the check works** explanation: Verdicts are not proof of deception, and a human makes the decision. Document actual error/retry, Quota, History/consent/expiry and report behavior without promising deferred functionality. Help remains reachable in one click under FA-UEB-02.

Use **`support@<domain>`**, also the monitored Reply-To from ADR-0019. An EU mailbox provider is required in the FA-UEB-13 register, covering storage, backups and support/control-plane access. Mailbox.org Standard at roughly €3/month was an example, not a selected/purchased provider or a verified total-cost quote. Final domain, mailbox service/terms and sender configuration are setup/qualification work.

No contact form, chat widget or ticket service is selected for launch. The Operator can correlate an ordinary support request through the existing Account search; knowing an address, invoice or profile is not proof for Account takeover or export access. Keep ADR-0013/0014's verification and permissions intact. Contact/help links must not automatically attach current Check text, titles, documents, session credentials or search queries. This does not promote the consent-bound reported-wrong-Verdict UI or create a new verification-content path into the private backend/mailbox.

Support conversations are initially deleted **12 months after their last message**. A specific message required for billing or legal claims follows its applicable separate ADR-0009/legal retention allocation; this is not a blanket eight-year rule for all support mail or an indefinite litigation exception. The privacy policy discloses the practice and FA-UEB-23 confirms the final periods, allocation, mailbox backup behavior and minimization. Unsolicited sensitive content must not become an automatic copied archive in the private service or operational telemetry.

## No launch product analytics

Do not collect product-analytics events, enable an analytics SDK or display a cookie/analytics-consent banner at launch. The website/documentation loads no third-party fonts, scripts, embeds, CDN assets or search service; bundle required resources locally. Normal external hyperlinks and explicitly opened help/status/legal destinations are not permission for background third-party resource requests.

Public information pages do not need sign-in. The accepted necessary sign-in-session cookie, where authentication is used, retains ADR-0013's host-scoped settings; do not widen it across the apex/subdomains just to personalize the public site. F1's cookie exception is not permission for additional tracking storage. Verify the actual build, response cookies, local storage and network behavior rather than assuming static generation proves absence of tracking. Legal/privacy review still qualifies the actual storage/access practices.

Retain required content-free operational/security measurements and FA-EIN-03 monthly VAT/quarterly trigger reviews under ADR-0012/0014/0015. Business records such as Accounts, purchases, consumption totals and costs can supply the relevant operational calculations without adding pageview/session/funnel tracking. Do not treat every reuse of business data as automatically outside analytics/privacy obligations; document purpose, minimization and legal basis, and reassess if a proposed metric becomes product analytics under FA-UEB-15.

FA-BTR-09 remains **should**; this decision does not pull its advanced dashboard or reported-wrong-Verdict rate into the basic launch interface. Future product analytics is a new decision requiring consent before collection and no Reference content under FA-UEB-15. Existing business-data availability is not permission to bypass that gate.

## Measurement publication and accessibility statement

Do not publish quality measurement results at launch under the accepted F8 scope. Keep machine-readable measurement logs per version/configuration so later publication can be added without restructuring. Retain FA-UEB-31/32's obligations: before publication, the Reference test set grows to at least **1,000 real References, ten citation styles and 300 invented/falsified References**. The 1,000-real threshold alone is not the whole condition. This is preparation for a should feature, not a new launch gate requiring publication.

Later publication uses approved aggregate/version evidence, never the private evaluation corpus, licensed raw fixtures or customer content. Trace published claims to the exact measurement and do not imply certification from an internal test log.

Publish a short voluntary accessibility statement based on the actual FA-UEB-04 self-assessment, with the support contact for reporting barriers. It must describe the demonstrated state honestly, including known limitations; the ADR is not evidence of conformance. Website, documentation and search remain subject to **WCAG 2.2 AA** regardless of a possible legal exemption.

The client's working assumption is a microenterprise services exemption, to be checked under [BFSG §2](https://www.gesetze-im-internet.de/bfsg/__2.html) and [§3](https://www.gesetze-im-internet.de/bfsg/__3.html). The definition uses fewer than ten employees and annual turnover or balance-sheet total at most €2 million. Whether the actual entity/offering qualifies, what duties apply and what changes on growth are FA-UEB-23 questions, not an established legal conclusion here. Reassess eligibility/scope when circumstances change; do not equate this with or replace the separate FA-UEB-06 independent-audit trigger.

## Evidence before launch and release

| Requirement / accepted policy | Required evidence |
| --- | --- |
| FA-UEB-01, F6/F9 | DE/EN route/content completeness, same-page language switch, correct language entry/deep links and recorded 50-text samples |
| FA-UEB-02/20, F4/F5 | Direct help/FAQ/contact and all four legal documents from web, extension and Operator surfaces; accessible e-mail footer links |
| FA-UEB-04, F2/F11 | Playwright/axe plus manual keyboard and screen-reader assessment of actual website/docs/search/language/error states; truthful statement |
| FA-UEB-15, F1 | No product-analytics events, third-party embedded resources, extra cookies/storage or query disclosure in the built/deployed site |
| FA-EIN-01, F7 | Internal claim-to-requirement mapping and recorded comparison with released capabilities/acceptance log before launch and each release |
| FA-EIN-03, F1/F8 | Operational trigger-review inputs and versioned machine-readable measurement logs without content exposure or promoted publication/dashboard scope |
| ADR-0002/0012/0015 | Qualified full dependency/tool/binary graph, actual static routing/TLS/container capacity, advisories/licenses and security settings |
| F5/F10/F11, FA-UEB-23 | Mailbox/provider register, retention/deletion/backup procedure and legal review of content, accessibility-law scope and final privacy allocation |

These are future evidence obligations. No site build, dependency qualification, DNS/TLS setup, consent/legal review or browser/accessibility test has been performed by this decision.

## Consequences and handoffs

The public information build and its local search add a build/dependency inventory and release-content checks, without selecting an additional running website/search/analytics service. Shared-container cost/capacity and the mailbox/provider remain unqualified until setup. The mandatory maturity, license, privacy, security and accessibility gates remain enforceable; no pre-1.0 or legal exception is inferred from this selection.

[ADR-0019](0019-transactional-email-catalog.md) receives website/documentation coverage in FA-UEB-01 evidence and the support Reply-To/legal-footer destinations. ADR-0014 retains trigger reviews and support Account search; it receives no new advanced analytics or content-reading permission. Final technical-concept synthesis must trace site/help/legal links, release claims, no-analytics evidence and the support/accessibility legal-review handoffs. The online DPA workflow and reported-copy retention remain separate open decisions.

## Rejected alternatives

- Launch product analytics, external search, CDN fonts or embedded third-party widgets without a separately approved consent/provider decision.
- Starlight 0.x, or assuming a ≥1.0 top-level version automatically clears bundled/transitive structural dependencies.
- A new website hosting subscription, contact form, chat or ticket system before the accepted small information offering requires one.
- Advertising disabled/unmeasured features, publishing a private corpus, or treating the microenterprise assumption as a WCAG waiver/legal sign-off.
