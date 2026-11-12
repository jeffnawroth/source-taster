# Separate the open product from the proprietary service

The client accepted this decision on 24 October 2026 in [Open-core boundary and repository structure](https://github.com/jeffnawroth/source-taster/issues/12), following section 14.6 of the [requirements specification](../requirements-specification.md). Use two repositories and independently runnable programs, with a documented API and distinct data responsibilities, to separate the open verification product from proprietary commercial functions. This makes the intended ownership and contribution boundaries explicit, at the cost of coordinating contracts and releases across repositories.

## Accepted boundary

- **`source-taster`:** verification core, extension, web app and shared domain models. Original project code uses `AGPL-3.0-or-later`. Verification features remain open even when access to them is sold, including AI extraction and Verification reports.
- **Private service repository:** accounts, authorization, hosted Quota enforcement, billing, organization and Operator functions. The proposed name is `source-taster-service`. These implementations remain proprietary.
- **Program and data separation:** verification processing belongs to the open program; account, entitlement, Quota and payment responsibilities belong to the private service. Communicate through documented APIs without importing internal AGPL implementations into proprietary code. Exact persistence layouts, deployment topology and API mechanics belong to the subsequent model and architecture decisions.
- **Narrow contract exception:** project-owned public API schemas, transport-only data types and associated client code are available under `AGPL-3.0-or-later OR MIT`. This preserves AGPL availability while permitting use by the private service. Internal domain implementations, parsers and scoring rules are outside this exception. Generated code and templates require their own rights check; a generated client does not inherit permission to redistribute an unrelated runtime dependency.
- **UI separation:** verification views, sign-in elements, Plan/Quota displays and API integration are open. Account-management, checkout, organization-administration and Operator web pages are private. Purchasing and administration paths in the extension lead to those web pages as required by FA-GLE-02. Authentication transport and account/session policy remain separate decisions.
- **Standalone developer use:** the open product must support local Reference checks without the private account/billing service, using the developer's own required data-source access. This does not add a supported on-premises offering or permit bypassing hosted authorization/Quota enforcement.

## Contributions and commercial licensing

Keep commercial licensing of original project code and accepted contributions possible. A complete edition free of third-party copyleft obligations is not a launch requirement; later commercial offerings may need replacement components or separate permissions.

Use a legally reviewed, non-exclusive Contributor License Agreement granting the additional licensing rights without copyright assignment. Record contributor consent and any necessary employer authority before merging external contributions; a DCO alone is insufficient for the intended additional grant. This decision does not create a signed agreement or supply missing upstream permissions.

Third-party code, fonts, models, dictionaries, styles and locales retain their applicable grants, notices and provenance. In particular, citeproc-js's AGPLv3+ option and official CSL assets' CC BY-SA 3.0 terms cannot be erased by a project CLA or relabeled through the contract exception. The [artifact-specific research](https://github.com/jeffnawroth/source-taster/issues/8) informs the later dependency selection and audit.

## Publication and verification gates

Publish the open repository after the license/contribution framework and intended public files have been checked, no later than the first public test operation. Repository creation and the explicit visibility-change step are subsequent execution work; this ADR does not perform them.

Before distribution/public operation, prepare the applicable source offer and release-corresponding source/build material, license and attribution records, and exact contract/dependency versions. Coordinate compatible releases without exposing private code or credentials. The architecture/release decisions must specify the mechanics; this ADR grants no exception to applicable source obligations.

The required FA-UEB-23 legal review must assess the actual program communication, imports, shared contracts, UI distribution, third-party rights and CLA wording. Repository/process/HTTP separation alone does not establish legal independence. If the concrete implementation cannot preserve the accepted boundary, return the choice to the client before proceeding. No legal review, library clearance, framework/provider choice or requirements amendment is claimed by this ADR.

## Accepted design-system refinement — ADR-0027

Accepted by the owner on 10 November 2026 in [#206](https://github.com/jeffnawroth/source-taster/issues/206#issuecomment-6770556807). This addition is effective as the narrow refinement specified in ADR-0027. The exact wording was agreed in #189. Existing legal/source/CLA gates remain.

**Addition to “Narrow contract exception”:** Project-owned design tokens are also available under `AGPL-3.0-or-later OR MIT`. These are the named colour, type, spacing, shape, elevation and motion values, expressed as CSS custom properties and as constants derived from them. The token package contains no components, no behaviour, no logo, wordmark, glyph or font files, and depends on no AGPL-only package.

**Addition to “UI separation”:** Each program builds its own UI components; they share only the design tokens. The logo and wordmark are brand assets outside every code licence.

See [ADR-0027](0027-design-system.md) for package shape, limited scope, unchanged review gates and fallback C.
