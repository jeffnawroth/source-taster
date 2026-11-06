# Sharing a design system between `source-taster` and `source-taster-service`

Research snapshot: 2026-11-06. Answers wayfinder ticket [#186](https://github.com/jeffnawroth/source-taster/issues/186) (map [#181](https://github.com/jeffnawroth/source-taster/issues/181)). This is research. It is not a decision, not an ADR and not a qualification receipt. The branch carrying it is never merged.

**Legal caveat.** Nothing here is legal advice. The licence readings below are an engineer's reading of primary texts, used to rank options. Every legal point is a question for the specialist-lawyer review required by FA-UEB-23 and [ADR-0001](../adr/0001-open-core-boundary.md), not a conclusion. Where a claim is an inference rather than a quoted source, it is marked **(inference)**.

## Answer in brief

1. **Tokens can cross the boundary the way the contracts already do.** Put them in one new package in the open repository, licensed `AGPL-3.0-or-later OR MIT`, and install it in the private repository as a SHA-pinned git dependency with a subdirectory path. That is exactly how `@source-taster/contract-service` is consumed today. No registry, no shared workspace and no vendored copy is needed.
2. **That needs a small amendment to ADR-0001.** The accepted exception covers "project-owned public API schemas, transport-only data types and associated client code". A token package is none of these. It needs a client decision to widen the exception, and it must be inside the FA-UEB-23 review.
3. **Components should not cross yet.** Styled React components are ordinary implementation code. They are the item most likely to be contested in the legal review, and they carry the most coupling. Keep them separate until the component inventory (a later ticket on the map) shows which primitives are genuinely generic. If the review clears the token package, a second package of self-contained primitives can follow under the same mechanism.
4. **Emails need resolved values, not CSS variables.** The private service's mail HTML is currently a bare `<p>`. A generated TypeScript module of plain sRGB values in the token package is enough for emails.
5. **Copying "tokens only" is not a way around the licence question.** A copy of AGPL files placed in a proprietary repository is still a use of those files. It is clean only if the files are also available under MIT, or if the private side re-derives its values independently from a published spec **(inference)**.

## What exists today

| Fact | Source |
|---|---|
| ADR-0002: "There is no workspace shared between the open and the proprietary repository." Contract-first across repositories, contract packages licensed `AGPL-3.0-or-later OR MIT`. | [ADR-0002](../adr/0002-tech-stack.md) |
| ADR-0001's exception covers public API schemas, transport-only types and associated client code. "Internal domain implementations, parsers and scoring rules are outside this exception." Verification views, sign-in elements and Plan/Quota displays are open. Account-management, checkout, organization-administration and Operator pages are private. | [ADR-0001](../adr/0001-open-core-boundary.md) |
| FA-UEB-23 requires a specialist lawyer's review report of terms, privacy policy, purchase process and licence before market launch. ADR-0001 adds that it must assess "program communication, imports, shared contracts, UI distribution, third-party rights and CLA wording" and that "Repository/process/HTTP separation alone does not establish legal independence." | [requirements specification](../requirements-specification.md) (FA-UEB-23, section 14.6), ADR-0001 |
| `packages/contract-service` carries `"license": "AGPL-3.0-or-later OR MIT"`, ships `LICENSE-AGPL` and `LICENSE-MIT` in `files`, exports committed built JS, declarations and `openapi.json`, and is marked `"private": true` (never published to a registry). | `packages/contract-service/package.json` |
| Documented distribution rule: install via `github:jeffnawroth/source-taster#<full-commit-sha>&path:packages/contract-service`. "No registry, local path, workspace sharing or vendored transport copy is used." The SHA is recorded in the private lockfile. | [private-service-contracts.md](../private-service-contracts.md) |
| The private `apps/web` depends on `"@source-taster/contract-service": "github:jeffnawroth/source-taster#d50b0ac2...&path:packages/contract-service"`, plus `react-aria-components` 1.22.1, `tailwindcss` 4.3.3 and `@tailwindcss/vite`. It is `"license": "UNLICENSED"`. | `jeffnawroth/source-taster-service`, `apps/web/package.json` (read via `gh api`) |
| The private `apps/web/src/style.css` is about ten lines: `@import "tailwindcss";`, a body colour and font, and a focus outline. There are no tokens and no component styles yet. | same repo, `apps/web/src/style.css` |
| The private mail path builds HTML as `<!doctype html><html lang="..."><body><p>${text}</p></body></html>` with strings from the private i18n package. No styling. | same repo, `apps/server/src/mail.ts`; `email.ts` holds only address and key helpers |
| The open `@source-taster/ui` is `AGPL-3.0-or-later` only, built on `react-aria-components`, and depends on `@source-taster/i18n` and the contract packages. The open web app already does `@import "@source-taster/ui/workspace.css"` after `@import "tailwindcss"`, resolved through the package `exports` map. | `packages/ui/package.json`, `apps/web/src/style.css` in this repo |

Consequence: the private side has no design layer to migrate. The sharing mechanism can be chosen before anything is built on either side.

## Licence facts and what they imply

Primary sources: the [AGPL-3.0 text](https://www.gnu.org/licenses/agpl-3.0.txt), the [FSF GPL FAQ](https://www.gnu.org/licenses/gpl-faq.html), and npm's [`license` field documentation](https://docs.npmjs.com/cli/v11/configuring-npm/package-json#license). The FAQ is written for the GPL. The AGPL is the GPL with section 13 added, so reading it across is an analogy **(inference)**.

- **A copyright holder may release the same code under several licences in parallel.** FAQ `#HeardOtherLicense`: "The GNU GPL does not give users permission to attach other licenses to the program. But the copyright holder for a program can release it under several different licenses in parallel. One of them may be the GNU GPL." The AGPL itself agrees: section 5(c) "gives no permission to license the work in any other way, but it does not invalidate such permission if you have separately received it." This is why `AGPL OR MIT` works only for code whose every contributor has granted MIT-compatible rights, which is what the ADR-0001 CLA is for.
- **Proprietary code cannot incorporate GPL-covered code.** FAQ `#GPLInProprietarySystem`: "You cannot incorporate GPL-covered software in a proprietary system." It may be distributed alongside if "the free and nonfree programs communicate at arms length, that they are not combined in a way that would make them effectively a single program."
- **Linking makes a combination.** FAQ `#IfLibraryIsGPL`: for a GPL library, "the terms of the GPL apply to the entire combination." A package of CSS or components imported at build time into the private bundle is the same shape as a library **(inference)**, which is why it must be MIT-available to be imported at all.
- **Separate programs versus one program.** FAQ `#MereAggregation` and `#GPLPlugins` say the line depends on the mechanism and the semantics of the communication, "a legal question, which ultimately judges will decide." Nothing in the FAQ treats a design system as a special case.
- **npm expresses this licence as an SPDX expression.** The `license` field takes `"(ISC OR GPL-3.0)"`-style expressions, and `UNLICENSED` is for packages where no right is granted. This matches the contract packages and the private repository's own `UNLICENSED`.

Implications for a design system **(inference, for the review)**:

- **Token values are data the products already publish.** The CSS ships to every browser in both products. Secrecy is not the reason to keep them out of the exception. The only question is whether the private repository may include them. Licensing the token package `AGPL OR MIT` answers it in the same way as the contracts.
- **Components are code.** They can import, extend and be extended. They also bring in the question of what they depend on. A dual-licensed component package may depend only on things that can sit under MIT, which excludes `@source-taster/ui`, `@source-taster/i18n` and anything else that is AGPL-only. `react-aria-components` is a third-party dependency under its own licence and is consumed by both repositories directly.
- **Brand assets are not covered by a code licence.** An MIT grant of the token package would not make sense for the logo or product name. ADR-0001 notes that fonts, styles and locales "retain their applicable grants, notices and provenance". Keep the logo, wordmark and fonts out of the dual-licensed package, and let each repository self-host fonts under the font's own licence (ADR-0017's constraint).
- **Authorship of agent-made identity directions.** The map says agents create the identity directions. Whether such output is protectable, and whether the CLA can grant rights in it, is a question for the review. No source was consulted here **(open question)**.

## Technical facts

- **Tailwind 4 theme sharing is built for this.** From the [Tailwind theme docs](https://tailwindcss.com/docs/theme): "Since theme variables are defined in CSS, sharing them across projects is just a matter of throwing them into their own CSS file that you can import in each project." The page continues: "You can put shared theme variables like this in their own package in monorepo setups or even publish them to NPM and import them just like any other third-party CSS files." Its example is `@import "tailwindcss"; @import "../brand/theme.css";` with a `@theme { --*: initial; ... }` block in the shared file.
- **Theme variables become plain CSS variables.** "All of your theme variables are turned into regular CSS variables when you compile your CSS." `@theme static` forces all variables into the output, and `@theme inline` is needed when a theme variable references another variable. Semantic tokens that switch for dark mode (`--color-surface: var(--surface)`) need `inline`.
- **Theme variables must be top level.** "Theme variables are also required to be defined top-level and not nested under other selectors or media queries." Dark-mode values therefore live in ordinary `:root` / selector rules next to the `@theme` block, not inside it.
- **Components in a dependency are not scanned by default.** The [source-detection docs](https://tailwindcss.com/docs/detecting-classes-in-source-files) list `node_modules`, `.gitignore`d files and CSS files as ignored, and say to register such a library with `@source "../node_modules/<package>"`. A shared component package that uses Tailwind classes would force each consumer to add this line, or the package would have to ship compiled CSS. A token-only package has no such problem.
- **Git dependencies with a subdirectory are supported by pnpm.** The [pnpm package-sources page](https://pnpm.io/package-sources) documents `#<commit>`, `#semver:<range>` (which selects from the repository's tags) and `&path:/subdir`, and says a git dependency that ships sources must be prepared (dependencies installed, build script run) before install. The contract packages avoid this by committing built output. A CSS-only token package needs no build at all. A TSX component package would need committed build output like the contracts **(inference)**.
- **`#semver:` reads repository tags.** In a repository with several packages, tags are per repository, so per-package semver ranges would need a tag convention **(inference)**. The SHA pin avoids this and is what the contracts use. Whether Dependabot raises update pull requests for SHA-pinned git dependencies was not verified from the docs consulted; check before relying on it.
- **GitHub Packages is not a free pass.** The [GitHub npm registry docs](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry) say a token is needed "to publish, install, and delete private, internal, and public packages", classic personal access tokens only, scope must match the owning account, and new packages default to private. This adds credential handling to both repositories' CI.
- **Email clients do not reliably support CSS variables.** [caniemail](https://www.caniemail.com/features/css-variables/) lists Gmail, Fastmail and Mail.ru as "Partial. The var() function is supported, but not the variable declaration." (tested 25 Feb 2020, so possibly stale). Tailwind's own output depends on variable declarations, so emails should receive resolved values **(inference)**.
- **Token interchange format.** The [Design Tokens Community Group format](https://www.designtokens.org/tr/drafts/format/) is a Community Group report, "not a W3C Standard nor ... on the W3C Standards Track". The latest published version is 2025.10 and the page is a 2026-09-08 draft marked "Do not attempt to implement this version". A JSON token source in that format is optional and low-risk if kept as a build input, but the shipped contract should be the CSS file.

## Options compared

| | A. Token package, dual-licensed, git SHA | B. Tokens plus base components, dual-licensed, git SHA | C. Copy tokens, components separate | D. Registry (npm or GitHub Packages) |
|---|---|---|---|---|
| What crosses | One `theme.css`, optional DTCG JSON, generated TS constants for email | Option A plus self-contained styled primitives | Values duplicated by script or by hand | Either A or B, published |
| ADR-0001 change | Widen the exception to design tokens | Widen it to UI primitives. Larger step: UI code is not in the exception's list (schemas, transport types, client code), and whether primitives count as excluded implementation is undecided **(inference)** | None if values are independently re-derived from a published spec. Otherwise the same widening as A | Same as A or B, and a publication decision on top |
| FA-UEB-23 load | Small: data files, no behaviour, no imports | Larger: code, dependency closure, CLA coverage of every contributor | Smaller only if truly independent. A literal copy of AGPL files has the same issue as A, without the grant **(inference)** | As A or B |
| Consistency | Names and values identical in both repos | Behaviour and look identical | Drifts unless a check compares copies | As A or B |
| Release coordination | Bump the SHA in the private lockfile. No build step | Same, plus committed build output and a `@source` line per consumer | None built in. Needs a drift check | Real semver and ranges. Needs registry tokens in CI, and publication cadence |
| Fits ADR-0002 | Yes. Same mechanism as the contracts | Yes, but the package must not depend on any AGPL-only package | Yes, but contradicts the spirit of the "no vendored copy" rule written for contracts | Contradicts the documented "no registry" rule for contracts. Would need a reason |
| Private web consumes | `@import "@source-taster/design-tokens/theme.css"` after `@import "tailwindcss"` | Same, plus component imports and `@source` | Local copy of the CSS | Same as A or B |
| Emails consume | Generated constants module | Same | Local constants | Same |
| Main risk | Low. Needs a naming and change policy | Legal contest over code. Hard to undo once consumed | Silent divergence and unclear licence position | Credential and publication overhead for a 0.0.0 package |

## Recommendation (for the decision ticket, not a decision)

**Go with option A now. Decide on B only after the component inventory and the legal review.**

Shape of the package **(proposal)**:

- `packages/design-tokens` in the open repository. `"license": "AGPL-3.0-or-later OR MIT"`, with `LICENSE-AGPL` and `LICENSE-MIT` and a `files` list, mirroring `contract-service`. No third-party dependencies, so the maturity rule has nothing to apply to.
- Contents: `theme.css` with an `@theme` block holding the primitive scales and the semantic tokens (surface, text, border, focus, verdict foreground and background pairs for green, yellow, red and grey), the dark-mode values as ordinary rules, and the type, spacing, radius, elevation and motion tokens. A generated `email.ts` with the same values resolved to sRGB. An optional DTCG JSON source if the tooling chosen later wants one.
- Excluded: logo and wordmark files, fonts, and any text that is not token metadata. Fonts are installed by each repository from the font's own distribution under its own licence.
- Consumption: the open apps import it from the workspace. The private web app installs it as `github:jeffnawroth/source-taster#<full-commit-sha>&path:packages/design-tokens`, the same line style as the contract, then imports `theme.css` in `style.css`. The private mail builder imports the constants.
- Stability contract: token names are the public interface, so a rename or removal is breaking and a value change is not. The verdict-colour pairs (FA-ERG-03) and their contrast checks (FA-UEB-04) are tested in the open repository, so the private side inherits them without re-testing the values.
- Release step: merge to the open repository, then bump the SHA in a pull request in the private repository. The contract packages already run this loop (the private lockfile records the SHA).

Why not B first:

- ADR-0001 deliberately splits UI by function. Generic primitives (button, field, dialog) arguably sit on the open side of "sign-in elements and Plan/Quota displays", but the Account, checkout and Operator pages are private, and the line for shared primitives is not drawn in the ADR.
- A component package must not import `@source-taster/ui` or `@source-taster/i18n`, so it would be a split of the existing UI layer, not a move. That is a refactor the component-inventory ticket should size first.
- It adds a `@source` line, a build artefact and a dependency closure to the review.

Why not C: it does not remove the licence question for AGPL files, and it creates drift between two repositories that the map wants to look like one product. C is acceptable only as a fallback if the review declines the widened exception, with the private side re-implementing from the styleguide that is published in the open repository **(inference)**.

Why not D: nothing needs semver ranges yet, and the contract packages already show that a SHA pin works. Revisit if the number of consumers or release cadence grows.

## Open questions for the review and the client

1. **Client:** will the exception in ADR-0001 be widened to design tokens, and later, if at all, to base UI primitives?
2. **FA-UEB-23 review:** is a CSS and constants package under `AGPL-3.0-or-later OR MIT`, installed by commit SHA into the proprietary web app and mail builder, within the intended boundary?
3. **FA-UEB-23 review:** does the CLA wording cover design contributions, including output produced by agents?
4. **Release:** does Dependabot or the existing CI check keep SHA-pinned git dependencies current? Not verified here.
5. **Typography ticket:** font files are excluded from the package, so the choice only needs to name a licence that allows web, extension and PDF embedding in both repositories.
