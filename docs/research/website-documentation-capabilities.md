# Website and documentation: focused capability check

Retrieved **2026-10-25**. This checks accepted planning decision [#54, F1–F11][decision]; it does not reopen it.
Baseline: approved [requirements v3.3](../requirements-specification.md), [GLOSSARY](../../GLOSSARY.md),
[ADR-0002](../adr/0002-tech-stack.md), [0012](../adr/0012-hosting-operations.md),
[0013](../adr/0013-authentication-roles.md), [0014](../adr/0014-operator-administration.md),
[0015](../adr/0015-security-abuse-protection.md) and [0019](../adr/0019-transactional-email-catalog.md).
Only primary documents, published metadata and selected release-source files were inspected.
No dependencies were installed, site/search built, deployment provisioned or accessibility tests run.
No predecessor repository or local copy was inspected. No legal qualification is performed here.

## Versions, licenses and maturity evidence

- Registry `latest` at retrieval: **Astro 7.4.2**, **Pagefind 1.5.2**, **Docusaurus core 3.10.2**.
  These are exact patch snapshots of F2's accepted 7.4/1.5/3.10 lines, not production pins. [A1], [P1], [D1]
- Each declares **MIT**. This is top-level license evidence, not clearance of bundled/transitive code,
  fonts, notices, binaries or the complete AGPL-compatible distribution under §14.6/FA-UEB-23. [A1], [P1], [D1]
- Astro 7.4.2 declares Node **>=22.23.4**, npm >=9.6.5 and pnpm >=7.1.0; Docusaurus 3.10.2
  declares Node >=20.0. Pagefind's npm wrapper declares platform-specific optional binaries at 1.5.2.
  These declarations do not prove Node 26/24, pnpm 12, TypeScript 7 or CI/runtime compatibility. [A1], [P1], [D1]
- **Concrete Astro structural blockers:** its direct declarations include `@astrojs/compiler-rs ^0.5.1`,
  `@astrojs/markdown-satteri 0.4.5` and `@astrojs/internal-helpers 0.13.0`.
  The published `dist/core/compile/compile.js` imports the compiler's `transform`/`preprocessStyles`;
  `dist/core/config/schemas/base.js` imports Satteri and the internal Markdown helper.
  These participate in the build/configuration, so calling Astro 7.x mature does not clear ADR-0002. [A1], [A2]
- Other declared 0.x dependencies include `fontace ~0.4.1`, `magicast ^0.5.5`, `tinyglobby ^0.2.17`,
  `tinyps ^0.5.0`, `verkit ^0.5.0`, `piccolore ^0.1.3` and `am-i-vibing ^0.5.0`;
  optional `sharp ^0.35.4` and prerelease `get-tsconfig 5.0.0-beta.6` also need qualification.
  This is a direct-declaration sample, not an exhaustive resolved graph or proof of every execution path. [A1]
- **Concrete Pagefind bundled/build blockers:** v1.5.2's native CLI manifest/lock include `wax 0.7.0`,
  `unicode-normalization 0.1.25`, `minifier 0.3.6` and `twelf 0.15.0`.
  Its separate `pagefind_web/Cargo.lock` records `wasm-bindgen 0.2.117`, `bit-set 0.10.0`,
  `pagefind_microjson 0.1.4` and `write-json 0.1.4`, also declared by the WASM crate.
  `pagefind/src/output/mod.rs` embeds vendor WASM/JS into generated search assets.
  The npm wrapper's lack of ordinary JS dependencies therefore does not establish a 0.x-free tool. [P1], [P2]
- The tagged Rust source/locks establish dependency concerns, not binary-to-source reproducibility,
  full feature/target reachability, advisory status or reconciled license notices for the shipped binaries. [P2]
- **Docusaurus remains the accepted conditional fallback.** 3.10.2 directly declares `eval ^0.1.8`;
  its larger build/plugin graph is not cleared by its 3.x version. No fallback activation is implied. [D1]
- ADR-0002 covers runtime, build and structural components, not just top-level packages or JavaScript.
  No new 0.x exception is established here. [ADR-0017](../adr/0017-accessible-pdf-reports.md)'s existing
  narrow PDFKit/Verification report exception does not cover website or search dependencies.

## Static placement, search and resource boundaries

- Astro documents `output: 'static'` as the default, prerendering pages unless they opt out.
  `public/` assets are copied untouched; local fonts, images and other resources are supported.
  A wholly prerendered build needs static serving, not an Astro production rendering service. [A3], [A4]
- Pagefind runs **after** static generation over the emitted HTML directory and writes a `pagefind/`
  search bundle containing browser dependencies and indexes. Its CLI is native Rust, optionally launched
  by the npm wrapper; browser search uses bundled JS/WASM. No production search service is required.
  The documented `--serve` flag starts a preview server; it is not a deployment requirement. [P1], [P2], [P3], [P4]
- Pagefind indexes languages independently using `<html lang>` and loads the current page's language
  index in the browser. German and English have UI translations and stemming support.
  This capability does not prove this site's language attributes, DE/EN page parity, search relevance,
  deep links or accessibility; F6's CI parity check and FA-UEB-01 sample remain required. [P5]
- Index only intended public documentation. Static search indexes/excerpts are public artifacts;
  they must never contain Account data, private drafts, Check content or support correspondence. ([P4]; local boundary)
- F3's `apps/website`, apex `/de/` and `/en/`, documentation under `/docs/`, and web app at
  `app.<domain>` are accepted placement assumptions. The precise language-specific documentation URLs,
  asset/search base paths, virtual-host routing, TLS, cache behavior and fallback/error routes remain untested.
- F9's bare-apex browser-language redirect needs explicit request-time host logic or local browser logic.
  Astro's static redirect map alone cannot negotiate a request's language; without an adapter it emits
  a meta refresh and does not support HTTP status codes. Qualify actual routing/cache behavior. [A3]
- F1 requires **no third-party resources**, including fonts, scripts, embeds and CDNs. Local assets make
  this possible, but a generator cannot certify the final network behavior. Review templates, CSS URLs,
  embeds, search bundles and injected hosting features; serve JS/WASM/indexes from the own site.
- Docusaurus emits static files to `build/`, but its official Algolia search integration queries Algolia
  directly from the browser. It cannot be adopted unchanged within F1; local search/integration still
  needs its own dependency, resource and accessibility qualification. ([D2], deployment/search chapters)
- Astro declares `@astrojs/telemetry 3.4.1`. Build-tool telemetry/configuration must be reviewed separately
  from deployed-site tracking; this dependency alone proves neither browser tracking nor its absence. [A1]
- Reuse of the existing Scalingo web container is F3's design. **No extra cost** remains an incremental
  capacity/cost assumption, not a provider quote or measured result; ADR-0012/0015 hosting gates remain.
- F5's mailbox.org Standard example supports custom domains. The public private-user price is €3/month
  equivalent **with €36 annual payment**, versus €4 with monthly payment; business pricing is separate.
  Suitability, contract/DPA, EU storage/backups/support and actual billing need qualification. [M1]

## BFSG: statutory facts, not client-specific legal signoff

- Official [§2 no.17 BFSG][B2] defines a Kleinstunternehmen as employing **fewer than ten persons**
  **and** either annual turnover **at most €2 million** **or** annual balance-sheet total **at most €2 million**.
  The employment condition is combined with an alternative financial condition, not two cumulative caps.
- Official [§3(3) BFSG][B3] says §3(1) does not apply to microenterprises offering/providing **services**.
  This is not a blanket exemption for products or every obligation in the statute.
- [§1 BFSG][B1] separately defines material/personal/time scope, including specified consumer services
  and electronic-commerce services. Losing microenterprise status does not alone establish applicability
  to this client. F11's categorical “growth beyond the thresholds makes the BFSG mandatory” is too broad
  as a statutory factual claim; retain FA-UEB-23 qualification of actual scope and enterprise status.
- FA-UEB-04's WCAG 2.2 AA requirement and F11's voluntary statement remain accepted independently.
  The §19/FA-UEB-06 audit trigger is a local planning rule, not a substitute for the statutory definition.
  Playwright/axe cannot supply the required keyboard/screen-reader self-assessment by themselves.
  Verified package snapshots: `@playwright/test 1.64.0` **Apache-2.0**, Node >=20;
  `@axe-core/playwright 4.14.0` **MPL-2.0**, Node >=22.12.0, depends on `axe-core ~4.14.0`.
  Their full graphs, licenses and real accessibility results remain unqualified. [T1], [T2]

## Own business data, consent and support content

- **Local accepted boundary:** F1 permits FA-BTR-09 figures and FA-EIN-03 trigger reviews from existing
  business records (Accounts, purchases, Checks and costs), without launching product analytics.
  Define periods/denominators and reconcile counters to raw business records; missing evidence stays
  incomplete. This does not pull advanced FA-BTR-09 scope forward beyond ADR-0014.
- FA-UEB-15 still requires consent before product analytics, and forbids checked-Reference content in
  events. Adding behavioral tracking events, click/session funnels or a later analytics tool requires a new decision and
  consent. “Own data,” first-party hosting or no cookies is not itself a GDPR legal determination.
- ADR-0015's minimized security/limiter records and ADR-0012's content-free operational telemetry keep
  their purposes/retention; they are not an unconsented product-analytics event stream.
- F1's no-banner position assumes no nonessential storage/tracking. ADR-0013's host-scoped Secure,
  HttpOnly sign-in cookie belongs to the private service; the public static site need not set it.
  F9 carries language in URLs without a preference cookie. Real cookie scope/storage/network behavior
  and legal qualification remain gates, not facts established by this research.
- F5/F10 authorize a contact mailbox and a proposed 12-month correspondence schedule, subject to
  legal review and separate ADR-0009 billing/claims retention. **They create no support-mail-content
  exception** to FA-UEB-12/13, §13's Operator content restriction or the private-service boundary.
  Ordinary support should use Account/business metadata; do not solicit or forward References/documents.
  Accidental content, mailbox logs/backups/access and deletion need a qualified handling procedure.
  FA-ERG-15's explicitly consented wrong-Verdict route remains separately scoped; ordinary email is
  not that route. ADR-0019's outgoing transactional mail stays content-free and without tracking.

## Primary sources

All sources retrieved 2026-10-25. Registry tags and unversioned docs are snapshots; release archives
were inspected in memory without executing code. Astro/Docusaurus docs hosts returned HTTP 403;
Astro docs were read from official repository sources, Docusaurus docs from its tagged archive.

[decision]: https://github.com/jeffnawroth/source-taster/issues/54
[A1]: https://registry.npmjs.org/astro
[A2]: https://registry.npmjs.org/astro/-/astro-7.4.2.tgz
[A3]: https://raw.githubusercontent.com/withastro/docs/main/src/content/docs/en/reference/configuration-reference.mdx
[A4]: https://raw.githubusercontent.com/withastro/docs/main/src/content/docs/en/basics/project-structure.mdx
[P1]: https://registry.npmjs.org/pagefind
[P2]: https://codeload.github.com/Pagefind/pagefind/tar.gz/refs/tags/v1.5.2
[P3]: https://pagefind.app/docs/
[P4]: https://pagefind.app/docs/running-pagefind/
[P5]: https://pagefind.app/docs/multilingual/
[D1]: https://registry.npmjs.org/@docusaurus/core
[D2]: https://codeload.github.com/facebook/docusaurus/tar.gz/refs/tags/v3.10.2
[B1]: https://www.gesetze-im-internet.de/bfsg/__1.html
[B2]: https://www.gesetze-im-internet.de/bfsg/__2.html
[B3]: https://www.gesetze-im-internet.de/bfsg/__3.html
[T1]: https://registry.npmjs.org/@playwright/test/1.64.0
[T2]: https://registry.npmjs.org/@axe-core/playwright/4.14.0
[M1]: https://mailbox.org/en/prices/
