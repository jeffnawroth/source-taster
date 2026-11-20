# #254 (Q10): licence inventory, program-combination assessment and source offer

Part of #70. This is the engineering input to the launch licence review that [ADR-0001](../adr/0001-open-core-boundary.md), [ADR-0002](../adr/0002-tech-stack.md) (FA-UEB-23) and [ADR-0020](../adr/0020-website-documentation-help.md) require. It records what is shipped, under which licence, which obligation follows, and where the repository does not yet meet it. It is not legal advice. Every legal conclusion below is marked **pending lawyer confirmation (#257)**.

## How this was made

- Source: `origin/main` at `0536aa6`. The private service repository was read only to see which public packages it consumes (`package.json`, lockfile and imports). Nothing from it is reproduced.
- Inventory: `pnpm audit:licenses` (`scripts/licenses.ts`) reviewed 568 installed packages, 108 of them runtime. The per-app closures come from `pnpm --filter <app> list --prod --depth Infinity --json`, joined to that inventory. Native and WASM components of the website build come from `apps/website/qualification/evidence/macos-arm64/browser-distribution.json` and `docs/research/115-native-license-terms.md`.
- Quoted licence text is from the repository's own `LICENSE` (AGPL-3.0) and from the FSF's published GPL-3.0 text. `pagefind_microjson` 0.1.4 was downloaded from crates.io (`.crate` SHA-256 `8f97aa64cde14e78d6274c473f36cec98d401f0b583282055e953d2df907e210`, equal to the repository evidence) and its manifest, `LICENCE` file and source header were read.
- Pagefind v1.5.2 and v1.6.0 `pagefind_web/Cargo.toml` were read from the upstream tags. Mozilla's source-submission rules were read at extensionworkshop.com ("Source code submission").

## Result in one table

| #   | Topic                                                           | Result                                                                                                                                                                                                          | Action                           |
| --- | --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| 1   | Runtime dependencies of the shipped clients                     | Permissive only (MIT, Apache-2.0, ISC, BSD-2-Clause, 0BSD, Unlicense). No copyleft in the web app or extension bundles.                                                                                         | none                             |
| 2   | Server-only copyleft: citeproc-js, BiblioJSON                   | citeproc-js is elected under AGPL-3.0-or-later. BiblioJSON is LGPL-3.0, an unmodified separate package. Both are compatible with the AGPL server.                                                               | lawyer confirms (#257)           |
| 3   | Browser WASM of the website search contains a GPL-3.0-only crate | `pagefind_microjson` 0.1.4. Compatible with AGPL-3.0-or-later through GPL-3.0 §13 and AGPL-3.0 §13. A corresponding-source offer already exists. Removable by Pagefind v1.6.0 (`hifijson`, MIT).                  | #225 (upgrade), lawyer (#257)    |
| 4   | Source offer for the AGPL programs                              | Does not exist for the web app, the API and the extension. The website has a link only inside `NOTICE.txt`.                                                                                                     | #270                             |
| 5   | Third-party notices in web and extension builds                 | Fonts, Lucide and the Adobe starter travel. The 44 and 33 production-closure npm packages (a superset of what is bundled) have no notice file.                                                                                                             | #271                             |
| 6   | Public program and private service                              | The private service consumes only the three dual-licensed contract packages, by pinned Git SHA. No import of AGPL-only code was found.                                                                           | lawyer confirms (#257)           |
| 7   | Contributor rights for the dual-licensed packages               | No CLA text exists in the tree. Commits come from the owner, an agent harness identity and Dependabot. Covered by #207.                                                                                         | #207 (not changed here)          |
| 8   | Brand artwork                                                   | Draft notice, specialist review pending.                                                                                                                                                                        | #207 (not changed here)          |

## 1. What ships, and under which licence

| Artifact                                              | Project licence                                                          | How it reaches users                                                                          |
| ----------------------------------------------------- | ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| Verification server (`apps/server`)                   | AGPL-3.0-or-later                                                        | Runs on the operator's host; users interact over the network. Not conveyed as a copy.        |
| Web app (`apps/web`, `packages/ui`)                   | AGPL-3.0-or-later                                                        | JavaScript served by the server to each browser. This is conveying object code.               |
| Browser extension (`apps/extension`)                  | AGPL-3.0-or-later                                                        | Zip packages in the browser stores. Conveying object code.                                    |
| Information website (`apps/website`)                  | AGPL-3.0-or-later                                                        | Static files served to each browser, including the search WASM.                               |
| Contract packages (`contract-common`, `-internal`, `-service`, `-verification`) | AGPL-3.0-or-later OR MIT, each with `LICENSE-AGPL` and `LICENSE-MIT`     | Source packages, consumed by the private service as Git subdirectory dependencies.            |
| Design tokens (`packages/design-tokens`)              | AGPL-3.0-or-later OR MIT for the values only                             | CSS custom properties and constants. No components, no fonts, no glyphs.                      |
| Brand artwork (`packages/brand`)                      | Draft notice only. Generator and tests are AGPL-3.0-or-later.            | Favicons and extension icons.                                                                 |

Every first-party source file carries `SPDX-License-Identifier: AGPL-3.0-or-later`. The contract packages and the token package carry the dual expression.

## 2. Third-party components by artifact

### Web app and extension bundles

Counted from the pnpm production closure of each app, joined to `pnpm audit:licenses`:

| App       | Packages | MIT | Apache-2.0 | ISC | BSD-2-Clause | 0BSD | Unlicense |
| --------- | -------: | --: | ---------: | --: | -----------: | ---: | --------: |
| Web       |       44 |  25 |          8 |   2 |            1 |    1 |         1 |
| Extension |       33 |  15 |          8 |   2 |            1 |    1 |         0 |

The remaining entries in each closure are workspace packages. The closure is wider than the bundle: it includes `hono` and `zod` through the contract packages. The Apache-2.0 packages are `react-aria`, `react-aria-components`, `react-stately`, `@internationalized/{date,number,string}`, `@react-types/shared` and `@swc/helpers`. Apache-2.0 is compatible with AGPL-3.0 (the GNU project lists it as compatible with GPLv3). `lucide-react` is ISC with Feather-derived MIT parts, and both notices are kept in `packages/ui/notices/lucide-LICENSE`.

Adapted source: the primitive anatomy comes from Adobe's React Aria Tailwind starter (Apache-2.0, snapshot `d1b6f73f…`), with the licence in `packages/ui/notices/react-spectrum-LICENSE` and the changes listed in `packages/ui/NOTICE.md`. Apache-2.0 §4 asks for the licence copy, change notices and retained notices. The first two are present.

Fonts (SIL OFL-1.1, served unmodified): Atkinson Hyperlegible Next and IBM Plex Mono in `packages/ui/public/fonts` and `apps/website/public/fonts`. `packages/ui/public/fonts/provenance.json` pins them, and the build copies the OFL texts to `notices/fonts/`.

### Server (production graph, 108 runtime packages repository-wide)

| Component                         | Licence                                                    | Use and obligation                                                                                                                                                                   |
| --------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `citeproc` 2.4.63 (citeproc-js)   | npm metadata `CPAL-1.0 OR AGPL-1.0`; the package's `LICENSE` grants AGPL-3.0-or-later | The project elects AGPL-3.0-or-later (`apps/server/src/citations/assets/NOTICE.md`). Network use of the combined server brings AGPL §13 into play, see section 4.                  |
| `bibliojson` 4.1.0                | LGPL-3.0                                                   | Unmodified, separate Node package, replaceable, server only (`apps/server/src/imports/NOTICE.md`). Server copies must keep its notices and licence.                                   |
| `jszip` 3.10.2                    | MIT OR GPL-3.0-or-later                                    | MIT elected. Its dependency `pako` 1.0.11 is MIT AND Zlib: both notices are needed wherever it is conveyed.                                                                           |
| `pdfkit` 0.20.2 and its graph     | MIT, Apache-2.0 headers in `brotli`                        | Listed with missing standalone licence files in `apps/server/src/reports/NOTICE.md`. Open reconciliation items stay there.                                                            |
| `pdfjs-dist`, `saxes`, `hono`, `pg`, `pg-boss`, `zod`, Prisma | MIT, Apache-2.0 or ISC                       | Permissive. Notices apply to any copy of the server image.                                                                                                                            |

Data and assets in the server:

| Asset                                       | Licence and obligation                                                                                                                                                                                                              |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 11 CSL styles and 3 locale files            | CC BY-SA 3.0, unmodified, attribution kept in each file's `<info>` block, commit-pinned (`NOTICE.md`). ShareAlike attaches to adaptations only. The renderer output is not an adaptation of a style file.                           |
| Report fonts (Atkinson, IBM Plex Mono, Noto Sans) | SIL OFL-1.1, embedded as subsets in generated PDFs. Full notices in `apps/server/src/reports/fonts/`.                                                                                                                 |
| NLM journal snapshot                        | NLM terms: attribution, currency notice, no implied endorsement (`packages/core/src/data/NOTICE.md`). The product text must show them whenever NLM data is used.                                                                     |
| Report validator veraPDF 1.30.3             | GPL-3.0-or-later OR MPL-2.0. CI only, separate process, not bundled.                                                                                                                                                                |

### Website (static)

The npm runtime set is empty (`apps/website/package.json` has no dependencies). Build-only tools with weak copyleft are allowed by `docs/dependency-policy.md` and never ship: `lightningcss` and `axe-core` (MPL-2.0), `elkjs` (EPL-2.0), `caniuse-lite` (CC-BY-4.0). What the website does ship:

- Pagefind 1.5.2 JavaScript and WASM (section 6), built by the controlled recipe in `apps/website/qualification/controlled/`.
- Fonts and `third-party/ui/NOTICE.txt`, which collects the Source Taster UI provenance, brand draft notice, Adobe, Lucide, `tailwindcss`, `tailwind-variants`, `react`, `react-dom` and the two font notices.
- Static recipes compiled from `packages/ui`.

### Not clearable by engineering

- Brand artwork: `packages/brand/NOTICE.md` is a draft with open placeholders and says it creates no grant. Specialist review in #207 is the gate.
- Contributions: ADR-0001 requires a non-exclusive CLA, and `docs/research/207-design-rights-review.md` records that the tree has no CLA text, contribution schedule or consent register. Git history shows commits by the owner, by an agent harness identity and by Dependabot. The dual licence of the contract and token packages depends on the owner holding or having licensed those contributions. #207 owns this.

## 3. Program combination: public program and private service

ADR-0001 draws the line: verification stays in the public AGPL program, Accounts, Quota, Orders and billing stay in a proprietary service, and the two meet only at transport contracts.

Observed from the private repository's manifest and lockfile (read only):

- It depends on exactly three public packages: `@source-taster/contract-service`, `contract-internal` and `contract-verification`, as Git subdirectory dependencies pinned to a full commit SHA (`9b54726b…`, `path:packages/…`). ADR-0003 chose this over a registry.
- It does not depend on `core`, `ui`, `i18n`, `server`, `website`, `brand` or `design-tokens`.
- The three packages and `contract-common` carry the dual expression and `LICENSE-AGPL` and `LICENSE-MIT`. Their own dependencies are MIT packages only.
- The private repository declares itself proprietary and has no public licence.

Reading, **pending lawyer confirmation (#257)**:

1. The private service takes the MIT branch of the contract packages. That is what the dual licence is for. It does not link, include or import any AGPL-only file, so the AGPL does not extend to it.
2. The two programs also share data and calls over HTTP with signed tokens. They do not share an address space. That supports treating them as separate programs communicating at arm's length, which is the premise of ADR-0001.
3. The dual licence needs every contribution to the packages to be licensable under MIT by the owner. See "Contributions" above.
4. `design-tokens` and `ui` are outside the private service for now. Private use of tokens is gated by #207 (ADR-0027). Private components are independently built.

Open check for the lawyer: that the `public-contracts` CI job (which exists in `.github/workflows/ci.yml`) is enough evidence that no AGPL-only module enters the contract packages. This note did not re-audit that job's assertions.

## 4. Source offer: what AGPL-3.0 requires and what exists

Quoted from the repository's `LICENSE` (AGPL-3.0):

> **§13.** Notwithstanding any other provision of this License, if you modify the Program, your modified version must prominently offer all users interacting with it remotely through a computer network (if your version supports such interaction) an opportunity to receive the Corresponding Source of your version by providing access to the Corresponding Source from a network server at no charge, through some standard or customary means of facilitating copying of software. […]
>
> **§6(d).** Convey the object code by offering access from a designated place (gratis or for a charge), and offer equivalent access to the Corresponding Source in the same way through the same place at no further charge. […] provided you maintain clear directions next to the object code saying where to find the Corresponding Source.

Points, **pending lawyer confirmation (#257)**:

- **The owner as licensor.** §13 binds a licensee who modifies a Program. The owner holds the copyright in the project code and gives no licence to themselves. They are, however, a licensee of citeproc-js (AGPL-3.0-or-later, section 2) and run it inside the server. If the server counts as a work based on citeproc-js, §13 applies to the server as a whole, and every remote user must be offered its Corresponding Source. The conservative position, and the one this note recommends, is to offer the source of the whole running build to every user.
- **Web app and extension.** The web app's JavaScript is conveyed to each browser, and the extension is conveyed through stores. Both are object code, so §6 applies independently of §13. The simplest mechanism is §6(d): a clear link, next to the object code's own surface, to the source of that exact build.
- **Mozilla.** Add-on review requires submitted source and build instructions when code is bundled or minified, rebuilt by reviewers on Ubuntu 24.04 ARM64 with Node 24.14.0 and npm 11.9.0 by default, with lockfile, and no differences allowed in the rebuilt output. The page says nothing about open-source licensing. The submission is therefore a review requirement and is not the licence's source offer.

What exists today:

| Surface           | Source offer present?                                                                                                                                         |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Web app           | No link to source or licence. No third-party notice file.                                                                                                     |
| API               | No `source` or licence discovery. The server is the thing users interact with remotely.                                                                       |
| Extension         | No link in the UI. The build carries the font, Lucide, Adobe and brand notices only.                                                                          |
| Website           | Footer links `/third-party/ui/NOTICE.txt`, which states the project source URL and licence. Pagefind has its own source page with a corresponding-source archive. |

Follow-ups: **#270** (source link for web app, extension, website, and a documented Firefox source submission) and **#271** (generated bundle-level notices and a CI gate).

## 5. Server-side copyleft: citeproc-js and BiblioJSON

- **citeproc-js.** The package's npm metadata says `AGPL-1.0`, which is wrong. Its `LICENSE` grants AGPL version 3 or later alongside the CPAL option. The project elects AGPL-3.0-or-later and records why in `NOTICE.md`. Same-licence combination with the AGPL server needs no further permission. See the §13 point above.
- **BiblioJSON.** LGPL-3.0 is GPL-3.0 plus extra permissions, so a combination with an AGPL-3.0-or-later server is allowed (the library keeps its own terms and the server keeps AGPL). Recipients must be able to replace the library, which the unmodified separate package allows. Any distribution of the server image must carry the library's licence and source. This holds only while the library is unmodified.

## 6. Pagefind and `pagefind_microjson` (GPL-3.0-only)

### Facts

- The website search is a controlled source build of Pagefind **1.5.2** (MIT). Its `pagefind_web` crate depends on `pagefind_microjson` 0.1.4. The crate's manifest says `GPL-3.0-only`. Its `LICENCE` file is the GPL-3.0 text. Its one source file `src/lib.rs` carries a header granting "version 3 of the License, or (at your option) any later version". Manifest and header disagree. This note treats the crate as GPL-3.0-only, which is the narrower reading.
- That crate is compiled into the WASM that visitors download (`pagefind/{de,en}/wasm.*.pagefind`). `browser-distribution.json` records `licenses.microjson: GPL-3.0-only` and `legalReview: pending; no publication approval`.
- The build already ships a corresponding-source offer: `third-party/pagefind/` with a landing page per language, a `corresponding-source.tar.gz` (SHA-256 `930f9a55561b9d32d8a3a440ad74416895b7ec1e5b3bb8cf193bb17b0ed12ebf`), build scripts, a manifest of object and source hashes and the notices. The build fails closed if it is missing.
- Pagefind **v1.6.0** (published 2026-11-01) replaces the crate in `pagefind_web/Cargo.toml` with `hifijson` 0.5 (`default-features = false`, feature `alloc`). `hifijson` 0.5.1 is MIT on crates.io. Version 1.5.2 had `pagefind_microjson = "0.1.4"`. I read these two manifests at the upstream tags and did not rebuild.

### Licence analysis, pending lawyer confirmation (#257)

GPL-3.0 §13, from the FSF text:

> Notwithstanding any other provision of this License, you have permission to link or combine any covered work with a work licensed under version 3 of the GNU Affero General Public License into a single combined work, and to convey the resulting work. The terms of this License will continue to apply to the part which is the covered work, but the special requirements of the GNU Affero General Public License, section 13, concerning interaction through a network will apply to the combination as such.

AGPL-3.0 §13, second paragraph, from the repository `LICENSE`:

> Notwithstanding any other provision of this License, you have permission to link or combine any covered work with a work licensed under version 3 of the GNU General Public License into a single combined work, and to convey the resulting work. The terms of this License will continue to apply to the part which is the covered work, but the work with which it is combined will remain governed by version 3 of the GNU General Public License.

Reading:

1. **Compatibility.** The project is AGPL-3.0-or-later and may elect version 3, so both sections permit combining it with a GPL-3.0-only work. A "GPL-3.0-only" crate is no obstacle to AGPL-3.0 combinations. The obstacle that GPL-3.0-only has against other licences (for example GPLv2) does not arise.
2. **What follows.** The WASM that contains the GPL part is conveyed to visitors, so GPL-3.0 §6 applies to it: the Corresponding Source for that object code, including the build scripts, must be offered. The existing source page and archive are designed for that. The "single combined work" language also means the combined WASM is governed by GPL-3.0 as to the GPL part, with AGPL §13 on the combination as such.
3. **Boundary.** The WASM is loaded by Pagefind's own worker, which is MIT. The website's own AGPL JavaScript calls it through the Pagefind API. Whether this makes the whole website one combined work, or the search a separate component, is the lawyer's call. Under §13 of both licences, either answer stays within the licences' permissions, because they allow the combination. The website being static and AGPL-3.0-or-later fits both.
4. **Completeness of the offer.** The offer is only as good as the archive. The archive must contain everything needed to rebuild the shipped bytes, including the exact toolchain pins and patches. `pnpm pagefind:verify` binds the shipped objects to the build receipt, and the qualification controls rebuild the WASM objects from the delivered archive. That is strong evidence, and the lawyer should review the offer text and the notice package, since no human has approved either yet.
5. **Manifest and header mismatch.** If the header's "or later" is effective, no practical difference arises for this project. The mismatch should be mentioned in the notice package so no reader assumes the narrower reading.

### Options

| Option                                                       | Effect                                                                                                                          | Cost and risk                                                                                                                                                         | Verdict            |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| A. Upgrade the controlled build to Pagefind 1.6.0 (#225)     | Removes `pagefind_microjson` from the browser WASM, so the website ships no GPL crate. `hifijson` is MIT.                         | Needs the full requalification already scoped in #225: re-pin provenance and locks, rebuild, regenerate evidence, requalify new crates. #225 also resolves the Dependabot alerts. | **Recommended**    |
| B. Keep 1.5.2 and accept the combination with notice and source | Legally supported by the two §13 paragraphs. The source offer already exists.                                                   | Keeps GPL-3.0 obligations on the WASM and depends on the lawyer's review of the offer. Keeps the 22 upstream-lock alerts.                                              | Fallback           |
| C. Ask upstream to relicense or replace the crate            | Same end state as A for 1.5.x users.                                                                                            | Upstream already replaced it in 1.6.0, so there is nothing left to ask.                                                                                              | Not needed         |
| D. Patch the crate out in the controlled build               | Removes the GPL component from 1.5.2.                                                                                           | A custom JSON parser in a security-sensitive build, a permanent fork to maintain.                                                                                    | Rejected           |

A comment with these facts is on #225 so the 1.6.0 evaluation carries an explicit acceptance criterion: no `pagefind_microjson` in any `wasm32` closure and every new crate licence-qualified. Until it lands, the website's publication gate (`reviews.dependencies` and the legal review in `apps/website/publication.json`) stays closed. This note does not change it.

## 7. Questions for the lawyer packet (#257)

1. Does a server that combines AGPL-3.0-or-later citeproc-js with first-party code require an AGPL §13 offer to every remote user even though the owner holds the copyright in the first-party code? Is a link to the source of the running build, shown in the web app, the extension and the website, a sufficient "prominent offer"?
2. For the extension, which §6 route do the project and the browser stores allow? Is §6(d) (a designated place with clear directions next to the object code) sufficient together with the store listing text?
3. Is the Pagefind source package (landing page, `corresponding-source.tar.gz`, manifest, notices) a sufficient GPL-3.0 §6 offer for the WASM, while Pagefind 1.5.2 is shipped? Is the `GPL-3.0-only` manifest versus "or later" header mismatch relevant?
4. Is it correct that the private service, which depends only on the dual-licensed contract packages under MIT, is not a work based on the AGPL program?
5. Does the missing CLA make the MIT branch of the contract and token packages unsafe to rely on until #207 is resolved, and which contributions does that cover?

## 8. What stays with a human

- The lawyer's confirmation of every reading above (#257).
- The rights review of brand artwork, contributions and fonts (#207).
- Owner acceptance of the source-offer design once #270 and #271 are built.
- The decision to ship the website before or after the Pagefind upgrade (#225).

## 9. Reproduce

```sh
pnpm install --frozen-lockfile
pnpm audit:licenses                       # writes .tmp/audit/licenses.json
pnpm --filter @source-taster/web list --prod --depth Infinity --json
pnpm --filter @source-taster/extension list --prod --depth Infinity --json
```

For the Pagefind crate: download `https://static.crates.io/crates/pagefind_microjson/pagefind_microjson-0.1.4.crate` and compare its SHA-256 with `apps/website/qualification/evidence/macos-arm64/browser-distribution.json`.
