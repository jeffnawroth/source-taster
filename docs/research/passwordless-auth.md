# Research: passwordless authentication options

- Ticket: [Passwordless authentication options (#11)](https://github.com/jeffnawroth/source-taster/issues/11); decision map: [#4](https://github.com/jeffnawroth/source-taster/issues/4).
- Research date: **2026-10-24**. Evidence is a dated snapshot, not a service contract or a passed integration test.
- Baseline: the supplied English [requirements specification v3.1](../requirements-specification.md), unchanged, and [GLOSSARY.md](../../GLOSSARY.md).
- Status: research for later client decisions. No provider, authentication design, role or Owner model is approved here. No infrastructure or accounts were provisioned.

## Scope and evidence standard

This report compares stable TypeScript-compatible managed and self-hosted authentication options for FA-KTO-02/03/04/40 and FA-ERW-05, with launch preparation for deferred FA-KTO-08 and FA-ORG-07. **Verified** statements cite primary documentation, published packages, source, pricing or contracts; **assessment** marks recommendations; **gap** marks unverified behavior, eligibility or contractual coverage. A protocol checkbox is not evidence of price, EU storage or federation membership.

Existing evidence is reused rather than re-investigated: [extension platform at 91a13933cff59ef5437cf0311c6f3aa032f667e3](https://github.com/jeffnawroth/source-taster/blob/91a13933cff59ef5437cf0311c6f3aa032f667e3/docs/research/extension-platform.md), especially sections 6, 8 and 11; [TypeScript stack recommendation at f980ddeff22dfb497dde58c768c5a4639a839558](https://github.com/jeffnawroth/source-taster/blob/f980ddeff22dfb497dde58c768c5a4639a839558/docs/research/current-typescript-stack.md). The UI must be bundled locally for native Chromium panels and Firefox sidebars. Cross-browser cookie sharing is unproven; typed email codes, extension-scoped tokens and fetch-based SSE are candidates. The stack document is a recommendation, not an approved stack.

FA-KTO-03 accepts the same plan/history **after sign-in**. Whether signing in on one surface must automatically sign in the other remains a client interpretation. Guest identifier/quota sharing is also unresolved. Neither behavior is silently added to the requirements.

## 1 Answer and shortlist (assessment)

Several options can satisfy email-only registration/sign-in and a common account across both clients. None supplies Source Taster's plan/history, deletion cascade or Owner semantics merely by authenticating someone. **Keep an application account stable while adding or replacing authentication identities.** That makes FA-ERW-05 feasible even where a vendor cannot merge every kind of identity. This is a candidate design constraint for #21/#26, not a completed account/role/Owner design.

Recommended shortlist for the client:

1. **Supabase Auth, managed in a specific EU member-state region**, if low operations and a reasonably small launch bill dominate. Email codes are first-class; future Google/Microsoft are documented. The important limitation is that **SAML users cannot participate in Supabase identity linking**. Preserve an application-level identity mapping and prove the future university-linking scenario before treating this as a long-term fit.
2. **Better Auth 1.x in Source Taster's EU-hosted TypeScript backend**, if control over identities, storage and session transport dominates. It avoids a separate identity-server deployment and MAU charges for the MIT library, but the operator owns security configuration, patching, abuse controls, mail delivery and recovery. SAML/OIDC plugins are protocol capabilities, not eduGAIN operation.
3. **Auth0 with an EU tenant**, if mature managed identity capabilities justify its feature/MAU pricing and contract work. Email OTP, multiple applications, external providers and explicit linking are documented. Obtain an actual quote for linking, future enterprise connections and the selected EU data scope; the inexpensive/free launch plan does not establish future SAML cost.

**SuperTokens** is a credible fourth candidate, especially for its explicit cookie/header session support, but identity linking is a paid feature even when self-hosted. **ZITADEL** is an interesting managed EU/self-hosted broker with strong federation interfaces, but email OTP being available as a challenge/second factor is insufficient proof of FA-KTO-02 as the sole first factor. **Keycloak** is a mature federation server, but the stock documented passwordless route is WebAuthn; an email-first authenticator requires additional component evidence and operations. Do not introduce either as a supposedly complete email-only launch solution on the evidence gathered here.

### Capability comparison

“Account continuity” means an app account can remain unchanged; it does not promise automatic shared browser sessions. EU entries describe available deployment choices, subject to section 4's contract gaps.

| Option | Email-only code/link | Identity continuity and future methods | Deployment / operating burden | Primary evidence |
|---|---|---|---|---|
| Supabase Auth | Built-in code or magic link; automatic signup configurable | Automatic same-email OAuth linking; manual linking labeled **beta**; **SAML excluded from linking**. Google/Azure providers; separate app mapping needed for SAML continuity | Managed EU region: low identity-service ops; self-hosted Go Auth/Postgres: more ops and not TypeScript internals | [email][sup-email], [linking][sup-link], [SAML][sup-saml], [regions][sup-region] |
| Better Auth | Email OTP and magic-link plugins; send-email implementation supplied by app | User plus multiple provider-account rows; verified-email implicit linking configurable; explicit linking; Google/Microsoft; SAML/OIDC plugin | TypeScript library in own EU backend/DB: no separate IdP server, but operator owns authentication operation | [OTP][ba-otp], [magic link][ba-magic], [accounts][ba-account], [SSO][ba-sso] |
| Auth0 | Passwordless email OTP, signup on first successful code; magic-link flow has separate UX constraints | Identities separate by default; explicit account linking; social and SAML enterprise connections | Managed EU tenant: low server ops; feature gates, external service and contract dependencies | [OTP][a0-otp], [linking][a0-link], [connections][a0-enterprise], [regions][a0-region] |
| SuperTokens | Passwordless email OTP/magic links | Primary user plus recipe identities; paid linking; social and current SAML recipe | Managed or self-hosted Core + app SDK + DB; own email provider; medium self-host ops | [passwordless][st-email], [linking][st-link], [SAML][st-saml], [prices][st-price] |
| ZITADEL | OTP-email challenge exists; policy lists email OTP under second factors. Supported email-only hosted registration/login **not established** | Multiple external identities per user; Google/Entra and SAML/OIDC brokering; linked-login routing caveat | Cloud advertises EU separately from Switzerland; self-hosted Go/Postgres; separate identity system | [challenge source][zit-challenge], [policy source][zit-policy], [linking][zit-link], [brokering][zit-broker] |
| Keycloak | Stock docs establish WebAuthn passwordless and email verification/reset, not a stock email-code/link-only authenticator | Identity brokering, linking, Google/Microsoft and SAML/OIDC; configurable first-broker-login flow | Self-hosted Java server + database, upgrades, keys, email and HA; high solo-operator burden | [server administration][kc-admin], [production deployment][kc-prod] |

Managed service internals need not be TypeScript to integrate with a TypeScript application. If “TypeScript end-to-end” also prohibits operating non-TypeScript infrastructure, explicitly exclude self-hosted Go/Java identity servers; Better Auth remains the closest application-owned fit. This report assumes the fixed constraint governs application code and typed client/API integration, pending client interpretation.

## 2 Release, licensing and price evidence

**Verified snapshot, 2026-10-24:** package versions/dates are publisher metadata from the linked npm registries; server versions/dates are GitHub release records. Stable version numbers establish eligibility under the no-pre-1.0 rule, not security or a support SLA. Pin chosen versions, check compatible SDK/server pairs and advisories, and recheck prices at selection.

| Component | Current observed release | License evidence and implication |
|---|---|---|
| Better Auth | `better-auth` **1.7.12**, 2026-10-20; [release](https://github.com/better-auth/better-auth/releases/tag/v1.7.12), [registry](https://registry.npmjs.org/better-auth) | [MIT at release](https://github.com/better-auth/better-auth/blob/v1.7.12/LICENSE.md). The separate `@better-auth/sso` plugin is also **1.7.12**, 2026-10-20, MIT publisher metadata ([registry](https://registry.npmjs.org/@better-auth/sso)); verify its exact dependency licenses and advisories before adopting it. |
| Supabase | `@supabase/supabase-js` **2.118.0**, 2026-10-15; [registry](https://registry.npmjs.org/@supabase/supabase-js). Auth server **v2.197.0**, 2026-09-09; [release](https://github.com/supabase/auth/releases/tag/v2.197.0) | JS publisher metadata and [Auth license](https://github.com/supabase/auth/blob/v2.197.0/LICENSE) are MIT. Hosted deployment version is provider-operated, not proven by the GitHub latest tag. |
| Auth0 | `@auth0/auth0-spa-js` **2.29.0**, 2026-10-21; [registry](https://registry.npmjs.org/@auth0/auth0-spa-js) | SDK MIT metadata; hosted service proprietary/commercial. The SDK license does not grant a right to self-host Auth0. |
| SuperTokens | `supertokens-node` **24.0.4**, 2026-10-21; [registry](https://registry.npmjs.org/supertokens-node). Core **v12.4.1**, 2026-10-23; [release](https://github.com/supertokens/supertokens-core/releases/tag/v12.4.1) | SDK Apache-2.0 metadata; [Core license at release](https://github.com/supertokens/supertokens-core/blob/v12.4.1/LICENSE.md) licenses code outside `ee/` under Apache-2.0 and separates enterprise content. [Pricing][st-price] explicitly separates free open-source core features from paid linking, MFA and organization features. Check the selected Core image/version and paid-feature license, not only the Node SDK. |
| ZITADEL | **v4.20.0**, 2026-10-22; [release](https://github.com/zitadel/zitadel/releases/tag/v4.20.0). `@zitadel/client` **1.3.1**, 2025-07-28; [registry](https://registry.npmjs.org/@zitadel/client) | Current server [AGPL-3.0](https://github.com/zitadel/zitadel/blob/v4.20.0/LICENSE); client MIT metadata. Do not reuse old “Apache-2.0 ZITADEL” assumptions. Commercial license offered in pricing. The newer “Zitadel Next” site banner says **Alpha** and is excluded as a core option. |
| Keycloak | Server **26.8.1**, 2026-10-13; [release](https://github.com/keycloak/keycloak/releases/tag/26.8.1). `keycloak-js` **26.2.4**, 2026-04-22; [registry](https://registry.npmjs.org/keycloak-js) | Server [Apache-2.0](https://github.com/keycloak/keycloak/blob/26.8.1/LICENSE.txt), JS Apache-2.0 metadata. Core/server maturity does not confer maturity on an unrelated email-authenticator extension. |

MIT and Apache-2.0 are compatible with an AGPLv3 work; the [FSF license list](https://www.gnu.org/licenses/license-list.en.html) describes the underlying GPLv3 compatibility. ZITADEL is itself AGPL. Separately hosted copyleft infrastructure and proprietary account code require boundary review under section 14.6/#12; this is not a legal conclusion about linking or a waiver of FA-UEB-23. Service agreements, branding restrictions and paid plugin licenses are separate from SDK compatibility.

### Public prices, USD, excluding tax, mail and the rest of the application

| Option | Observed public pricing | Decision implication / gap |
|---|---|---|
| Supabase | [Pricing][sup-price]: Free 50,000 MAU; Pro starts **$25/month**, 100,000 MAU included, then **$0.00325/MAU**. SAML on paid plans: 50 SSO MAU included, then **$0.015/SSO MAU**; other project/compute/storage/add-on charges apply | A low-cost managed candidate; a whole Supabase project is bought even if only Auth is used. Check minimum compute, environments, session controls and SSO billing definitions; don't equate SSO price with eduGAIN support. |
| Better Auth library | [MIT][ba-license], no per-user library fee | Pay EU API/database hosting, mail, monitoring, security response and operator time. Optional commercial products are not required by the cited OSS plugins and are not costed here. |
| Auth0 | [B2C pricing page][a0-price] at 500 paid-plan MAU: Free up to **25,000 MAU**; Essentials **$35/month**; Professional **$240/month**. Free currently lists one enterprise connection; paid B2C cards warn that continuing enterprise connections/self-service SSO/SCIM requires B2B | Not a reliable university-login budget. Linking availability explicitly depends on plan/agreement. Get a dated quote for the actual B2B/SSO/linking feature combination, MAU, custom domain, logs and environments. |
| SuperTokens | [Pricing][st-price]: managed base **$0.02/MAU**, free below 5,000 MAU; OSS self-hosted base free without MAU limit. Linking **$0.005/MAU**, **$100/month minimum** shown for both deployment modes | Future continuity can introduce a material paid license. Clarify exact feature billing, tenancy/SAML entitlement and the result when a license/subscription expires; “self-hosted” does not mean every feature is free. |
| ZITADEL | [Pricing][zit-price]: Free 100 daily active users, 3 IdPs; Pro **$100/month**, “25'000 Daily Active Users per month” and 3 IdPs included; enterprise custom | The billing unit wording is not ordinary MAU; confirm counting and extra-IdP charges. Page displays multiple uptime figures; no specific SLA is inferred. Commercial self-hosted support/license requires quote. |
| Keycloak | Apache-2.0 server license, no OSS MAU fee | EU infrastructure, mail, backup/restore, patching and any support contract remain real costs. No managed Keycloak vendor/DPA has been evaluated here. |

**Screened out under the maturity rule:** Auth.js `@auth/core` is **0.41.3** (2026-07-20; [registry](https://registry.npmjs.org/@auth/core)), even if it offers useful email adapters. No pre-1.0 core exception is assumed. A beta **feature** inside a stable service (e.g. Supabase manual linking) still deserves explicit risk review; a stable core version is not blanket approval for beta features.

## 3 Provider-specific preparation and limitations

### Supabase

**Verified:** `signInWithOtp` sends a magic link by default; the email template's `{{ .Token }}` instead yields a six-digit code, verified with `verifyOtp`. New users are created by default unless `shouldCreateUser` is false. Both paths have a documented default one-hour expiry and 60-second request interval; expiry is configurable. These are vendor defaults, not recommended Source Taster security settings. The initial response has no signed-in session: grant account quota only after successful verification (FA-KTO-40). [Email flow][sup-email]

Supabase automatically links matching-email OAuth identities, with protections against unconfirmed identities; manual different-email linking is labeled beta. **SAML accounts are excluded from both automatic and manual linking**, and the SAML guide warns that SSO identities can be distinct even with the same email. A future university identity may therefore need a separate provider subject mapped to the existing Source Taster account, following proof of control; never let an SSO login silently create another paid account/history. Azure/Microsoft provider configuration is separate from SAML configuration. [Identity linking][sup-link], [SAML][sup-saml], [Microsoft provider][sup-ms]

Sessions use a short-lived JWT plus single-use rotating refresh tokens, with documented reuse exceptions. Default sessions are indefinite absent configured limits; some timeout/session controls require paid plans. Revoking refresh ability does not make an already issued JWT immediately unusable at a resource server that only checks its signature/expiry. Supabase's session guidance warns against very short JWT lifetimes and suggests most apps use one hour; a different Source Taster policy requires validation. The JS SDK's browser-accessible-token design is different from a server-held BFF session. [Sessions][sup-session]

**Assessment:** strong low-ops launch candidate, provided the versioned API resolves provider identity to a stable application account and enforces deletion/role/quota state itself. Do not choose “one active session per user” if both surfaces must stay signed in concurrently. Self-hosting Auth is possible but transfers database migrations, key rotation, abuse limits, SMTP and uptime to the operator; it removes much of the managed-service advantage.

### Better Auth

**Verified:** the OTP plugin supports sign-in with automatic signup, configurable expiry (default 300 seconds), attempt limit (default 3) and OTP storage transformation. **Default OTP storage is plain text**; hashing/encryption options are documented. The app supplies `sendVerificationOTP`; magic links similarly require app-supplied email delivery. [OTP][ba-otp], [magic link][ba-magic]

A user and their provider accounts are separate records. Implicit same-email linking depends on the provider's verified-email assertion or a configured trusted provider; explicitly trusting an unverified-email provider increases takeover risk. `disableImplicitLinking` and manual linking exist. Google and Microsoft integrations are documented. The SSO plugin accepts SAML/OIDC connections and signed SAML NameID identity, with detailed trust/metadata validation; it does not document eduGAIN membership, aggregate-metadata operation or national federation admission. [Accounts][ba-account], [Google][ba-google], [Microsoft][ba-ms], [SSO][ba-sso]

The bearer plugin can expose a session token as `set-auth-token` and authenticate an Authorization header; it is **the session credential**, not automatically a separate short-lived access-token/rotating-refresh pair. Database sessions default to a seven-day sliding expiry with daily update; explicit revoke-one/others/all APIs exist. Cookie caching/stateless modes can delay observing revocation, so their revocation semantics need an explicit review. The bearer documentation's localStorage example is not a reason to store production extension credentials in ordinary web-page localStorage. [Bearer][ba-bearer], [sessions][ba-session]

**Assessment:** best self-operated TypeScript shortlist entry. Prefer database-backed session checks for immediate app revocation; explicitly configure OTP hashing, throttling, trusted origins, expiry/freshness and email verification. A signed token is still a bearer credential if stolen. Review the exact selected adapter/plugin release and transaction behavior, rather than assuming all adapters roll back a failed email or deletion operation identically.

### Auth0

**Verified:** email OTP creates a profile on the email connection at first successful use; only the latest issued code/link is accepted, codes are one-use, default expiry is three minutes, and three failed inputs require a new code. Language-dependent email templates are supported. [OTP][a0-otp]

Identities are separate by default. Auth0's linking documentation explicitly recommends authenticating **both** identities before manual or automatic linking, preserves the primary user ID, and does not automatically merge secondary metadata. Availability depends on the plan/agreement. Social and enterprise connections are documented; enterprise SAML is not a federation-membership promise. [Linking][a0-link], [enterprise][a0-enterprise]

Refresh-token rotation/reuse detection is documented. For an extension, use a supported public-client flow without a client secret in the package; a hosted redirect/PKCE route needs a browser-specific callback proof. An embedded email-code API route must be evaluated for connection/client/grant eligibility and credential handling; the existence of a passwordless API does not certify every SDK/embedded-extension combination. [Rotation][a0-rotation], [OAuth security BCP][oauth-bcp]

**Assessment:** mature managed comparator with an established linking API. Obtain a quote and the selected tenant's data-flow evidence. Verify DE/EN hosted UI and email, exact production email-provider setup, API limits and account-recovery flow. Any vendor-specific `user_id` remains an external identity reference rather than the database key for plan/history ownership.

### SuperTokens, ZITADEL and Keycloak

**SuperTokens — verified:** passwordless and social recipes, linking into primary users, header-based sessions, access/refresh session security and user deletion APIs are documented. Current SAML documentation uses a **SAML recipe**; do not assume old BoxyHQ/Jackson tutorials describe the current architecture. Linking is separately paid; assess its restrictions before assuming automatic linking on a matching email. Header transport still requires protecting persisted refresh credentials and correctly configuring frontend interceptors. [Passwordless][st-email], [linking][st-link], [header sessions][st-header], [security][st-security], [user actions][st-users], [SAML][st-saml]

**ZITADEL — verified/gap:** v4.20.0 has an OTP-email session challenge and custom login API, but its policy enum classifies email OTP as a second factor. This research did not prove a supported, complete email-only first-factor registration plus OIDC login using the stock UI. A custom session API flow is not automatically proof that the OIDC login requirements are satisfied. Treat a proposed custom login or external email-OTP broker as a separate design/maintenance burden requiring a demonstrated flow. Linked external identities are supported; the cited account-linking guide says entering an existing linked username routes to the external IdP rather than offering a local/IdP choice, with fallback on external failure. Verify that behavior for the chosen UI and policy before promising a user-selectable fallback. [Challenge][zit-challenge], [policy][zit-policy], [linking][zit-link]

ZITADEL's self-deletion API requires a specific permission and changes the user to a deleted state; docs say sessions/tokens are revoked and deletion remains auditable through events. Offline JWT verification still needs the resource server's own revocation policy. Application data and event/log erasure are separate questions. [Self-deletion][zit-delete]

**Keycloak — verified/gap:** the server administration guide documents identity brokering, configurable existing-account linking, email verification/reset, SMTP, user self-deletion when enabled and WebAuthn passwordless. It does not establish a built-in email OTP/magic-link-only login method. No third-party email authenticator was validated here against stable-release, active-maintenance, license and security requirements; custom Java providers increase upgrade coupling. A managed Keycloak offering could reduce operations, but its contract, EU locations, mail and support have not been evaluated. [Administration][kc-admin], [production guidance][kc-prod]

## 4 EU storage, processing and subprocessors

FA-UEB-13 requires **EU storage** of account/verification data and safeguards for providers outside the EU. An SCC is a transfer safeguard, not permission to replace that storage requirement with US storage. FA-UEB-14's EU-only **processing** is deferred; selecting an EU database today does not prove that future option. UK, Switzerland and Norway are not EU member states. No chosen provider's contractual compliance is certified by this research.

| Candidate / evidence | Verified storage or contract statement | Gap before selection |
|---|---|---|
| Supabase [regions][sup-region], [DPA][sup-dpa], [2026-10-12 subprocessors PDF][sup-sub] | Exact Frankfurt, Ireland, Paris and Stockholm regions exist. Docs warn generic “Europe” can include London/Zurich. DPA §6.1 provides directed regional storage/primary processing with exceptions; §12 incorporates SCCs. Subprocessor list includes AWS, Cloudflare, Google, US support entities, Postmark, Sentry, Braintrust and other tooling | Choose a **specific EU region**, not “Europe.” Obtain scope for auth DB, backups, authentication/audit logs, observability, support exports and CDN data. A vendor address/country in the subprocessor list does not itself identify the physical data center. Determine which tools actually receive end-user data, versus operator/dashboard data. |
| Auth0 [tenant localities][a0-region], [DPA][a0-dpa], [2026-05 subprocessors PDF, Auth0 table][a0-sub] | Public-cloud EU locality is offered. Auth0 table lists AWS with EU selection, MongoDB/Aiven in the selected hosting region; Datadog/business analytics and Salesforce/support in USA, Snowflake in Germany, SendGrid email in USA; Cloudflare CDN processing described as global. DPA incorporates SCCs and gives execution instructions | Match the DPA contracting entity, selected product/plan and signed acceptance. Establish whether user identifiers, IPs, email and logs are stored outside EU in ancillary services; external SMTP selection does not by itself remove every listed vendor. EU locality alone cannot close FA-UEB-13 or promise FA-UEB-14. |
| Better Auth on own EU infrastructure [library][ba-license], [sessions][ba-session] | A library does not mandate a hosted identity vendor. Auth records/session DB can be deployed with the app in the chosen EU region | No bundled DPA or hosting guarantee. Use #10/#22's actual host/database contracts and subprocessor register; include DB replicas/backups, app logs, email delivery, error monitoring and support. Disable optional telemetry/integrations unless their data flow is assessed. |
| SuperTokens [DPA][st-dpa], [self-hosting][st-self] | Public DPA §6.1 says primary processing operations take place in the **United States** and provides transfer safeguards; it is not an EU-residency commitment. Self-hosting permits operator-selected infrastructure | Managed EU storage, backups, logs and exact subprocessors were not verified. Require a service-specific EU commitment before shortlisting managed use under FA-UEB-13; do not treat the generic DPA as sufficient. Self-hosted paid-license/telemetry flows also need review. |
| ZITADEL [pricing][zit-price], [DPA][zit-dpa], [subprocessor page][zit-sub] | Pricing separately offers EU, US, Switzerland and Australia. DPA permits processing outside Switzerland/EU/EEA with safeguards; public subprocessor page points to a trust center instead of listing entities | EU location must be selected and confirmed, including backups, event/audit storage, support, notification providers and telemetry. Full currently applicable subprocessors and default email route were not established from the public page. Switzerland is not a substitute for EU storage. |
| Self-hosted Keycloak [production][kc-prod] | Operator chooses the server/database location | Not a managed EU contract. Hosting/database/backup/email DPAs, support access and HA are the operator's responsibility; no external host was selected. |

**Assessment:** launch EU storage is plausible for Supabase/Auth0 with explicit regional and ancillary-data evidence, and controllable with Better Auth on the chosen EU infrastructure. None is proven here to deliver processing exclusively within the EU. Do not send references, documents, Check titles or verification reports into an authentication profile, mail template, auth log or support ticket. Authentication needs only minimal identifiers/security events; verification content stays behind Source Taster's API (FA-UEB-12/13/15).

## 5 Transactional email is a separate production dependency

**Verified:** Supabase's default mail server is for development, restricted to team addresses, currently two messages/hour, and has no delivery SLA; custom SMTP is required for production. Auth0's built-in provider is also non-production (no custom templates/from address; ten messages/minute). Better Auth expects a supplied send function. ZITADEL's production checklist recommends replacing its default provider with production SMTP, and supports generic SMTP/HTTP notification providers. [Supabase SMTP][sup-smtp], [Auth0 SMTP][a0-smtp], [Better Auth OTP][ba-otp], [ZITADEL checklist][zit-production], [notifications][zit-notify]

Credible mail routes to compare once the hosting choice is known:

- **Amazon SES in an explicit EU region:** the [regional guide][ses-region] explains separate regional endpoints, credentials, sending quotas, identity verification and sandbox removal. [Pricing][ses-price] lists **$0.10/1,000 outbound messages à la carte**; the newer default Essentials plan is **$0.16/1,000** at 0–10 million/month, with Pro/Enterprise rates and monthly charges above that. New accounts/unused account-region combinations default to Essentials from 2026-07-21; switching to à la carte is documented. Data and optional-feature charges apply; verify the selected plan rather than assuming the older headline rate. The [AWS DPA][aws-dpa] allows selecting regions but retains service/law exceptions; the [subprocessor register][aws-sub] and [SES data-protection guide][ses-security] still need the selected-path review. SES defaults to opportunistic TLS to recipient servers; require TLS if the delivery policy demands it, accepting delivery failures where a recipient cannot negotiate it. Low unit price trades against AWS setup, sandbox eligibility, reputation and bounce handling.
- **Brevo:** an alternative managed SMTP service named in Supabase's documentation. Its [privacy policy][brevo-policy] expressly describes transfers including the US and India, and its [terms/DPA][brevo-dpa] need assessment for the selected transactional service and retention. EU corporate origin is not evidence of EU-only storage/processing. Exact transactional-plan price, storage region, content/log retention and applicable subprocessors remain unverified here; it is a candidate, not an approved EU mail route.

**Candidate operating requirements, to agree in #22/#23:** one sending domain with SPF/DKIM/DMARC; German/English plain-text plus accessible HTML templates; localized code expiry and resend errors; minimal message content; no tracking pixels/click rewriting on auth links; TLS submission; bounce/suppression handling; redacted delivery logs; documented retention/deletion; monitoring latency and deliverability without logging codes. Configure per-origin, per-address and per-challenge attempt/resend limits as needed for launch abuse limits, with accessible generic responses that avoid account enumeration. This does not approve the later CAPTCHA/disposable-address features in FA-KTO-41 to 43.

Email remains a mailbox-based possession check: a stolen mailbox or phished code can compromise the account. FA-KTO-06 remains deferred; preserve an enrollment/step-up hook for a later second factor without silently making MFA a launch requirement. Test delayed/out-of-order messages, mail scanners, expired/reused/wrong codes, suppression and provider outage. No deliverability or latency test was executed here.

## 6 Web and extension sessions: alternatives to decide

The completed extension research establishes locally bundled panel UI, native browser differences and Firefox's lack of `externally_connectable`. It **does not** prove shared cookies under Firefox/ESR, Brave privacy defaults, containers/private browsing or every supported browser version. Reuse that boundary rather than treating a web SDK's successful demo as extension acceptance.

### Transport alternatives

| Candidate | Benefit | Security and verification work |
|---|---|---|
| First-party web session cookie; try credentialed extension requests to the API | Server can keep provider refresh tokens off client JavaScript; web and extension might reuse a session | Empirically verify cookie/SameSite/partitioning and host permissions per target. Use Secure, HttpOnly, narrowly scoped cookies; deliberate SameSite policy; CSRF token and/or strong Origin/Fetch-Metadata policy for mutations. Reject unsafe cross-origin requests. CORS/host permission is not authorization. HttpOnly prevents reading the cookie, not authenticated actions by XSS. |
| First-party web cookie plus a **separate extension session** obtained by entering an email code in the panel | Same application account without depending on shared-cookie behavior; API Authorization header works with fetch/SSE | Provider/server must support code exchange and chosen header session. Protect stored bearer credentials; explicitly design extension-scoped credentials, renewal and revocation. Stock Better Auth bearer and Supabase sessions do not automatically have every proposed scope/lifetime property. |
| Hosted web login + explicit one-use handoff to the extension | Reuses a managed login UI and later social/SAML flows | Use browser identity redirect flow where validated, or a narrowly scoped content-script bridge on Source Taster's origin. No Firefox web-page-to-extension `externally_connectable`. Bind handoff to initiating extension, nonce/state, approved redirect and PKCE where applicable. Exchange a short-lived, single-use code server-side; do not copy refresh/access tokens in a URL or page message. Validate extension IDs and development/production callbacks. |

Security basis: [OWASP session guidance][owasp-session], [CSRF guidance][owasp-csrf], [OAuth 2.0 Security BCP, RFC 9700][oauth-bcp]. These are proposed controls, not implemented or tested behavior. Browser APIs and cookie uncertainty are cited in the immutable extension report above.

### Token lifecycle and storage

**Candidate policy for #23, not a chosen lifetime:** keep access credentials short-lived (e.g. 5–15 minutes where supported and validated), with a separately bounded renewal window and absolute maximum (e.g. days/weeks chosen for UX/risk). Supabase's own documented lifetime guidance may lead to a longer JWT plus a server-side active-account/session check. Database-backed opaque sessions can instead enforce expiry/revocation on every request without a JWT/refresh pair. Avoid inventing a refresh mechanism around a vendor that already provides one; specify which layer owns it.

If renewal credentials persist, rotate where supported, handle replay detection and serialize concurrent refreshes across panels/workers. Explain behavior on browser restart, offline use, update, expired code/session and session theft. Log out current surface versus revoke every surface must be distinct choices. An absolute and an idle timeout need server enforcement; client timers are insufficient. Removing local credentials alone does not revoke their server authority.

For an extension, keep access tokens in memory where feasible and consider extension `storage.session` for a browser-session credential. Persisting a renewal secret in extension-local storage improves restart UX but remains a theft risk: [MDN warns extension storage is not encrypted][mdn-storage]. [Chrome storage docs][chrome-storage] distinguish local/session/sync and access controls. Do not put credentials in browser cloud-sync storage, a content script, the web page's localStorage, logs, URLs, analytics or crash reports. Restrict storage access to trusted extension contexts where supported. An encryption key bundled with the extension does not protect a secret from an attacker who can read both. Decide whether restart requires sign-in or persistent renewal; neither is fixed by FA-KTO-03.

Validate provider tokens at the API with issuer, audience, signature/algorithm and expiry checks; **an ID token is not an API access token**. Use authorization state from the application for current account deletion, role, quota and ownership; don't accept stale plan/role JWT claims as the only enforcement. Define maximum revocation delay at each resource server. For immediate deletion/unavailability requirements, an API-side active-account/session gate is needed even if an issued JWT remains cryptographically valid. Never ship service-role/admin keys or OAuth client secrets in extension code.

### Email-code and magic-link hazards

A code typed in the initiating panel avoids a browser handoff and works even when mail is opened on another device. Protect the exchange with attempt limits, expiry, one-use consumption, challenge binding and resend rules. Decide whether only the latest code is valid and test delayed deliveries. Avoid unlimited guessing or different success/error timing that reveals registered addresses. Link the session only after proof, then gate quota on confirmed email.

A magic link normally opens a web page, possibly in a different browser/device. Supabase documents a PKCE/token-hash callback variant; Auth0's magic-link page says the transaction must start and finish in the same browser and that magic links are not supported by Universal Login. Those are provider-specific constraints, not universal email-link behavior. [Supabase][sup-email], [Auth0 magic links][a0-magic]

No reviewed source proves that a clicked magic link automatically authenticates a closed/restarted panel across all target browsers. If automatic handoff is wanted, design expiry, transaction binding, user confirmation, replay rejection and cancellation. Avoid forwarding the full provider session through a content-script bridge. Mail security scanners can follow links; verify consumption behavior and consider a landing page requiring deliberate confirmation before consuming the one-use credential. Email-link authentication must not unexpectedly sign another browser/user into the requester's account (login CSRF/session swapping).

For progress, keep `fetch`-based SSE a candidate when Authorization headers are needed. Authenticate/re-authorize reconnects; don't place bearer tokens in query strings. Specify whether an open stream is closed on expiry, deletion or revocation, and how the panel resumes after renewal without duplicate quota use. Streaming connection loss is not itself Check cancellation. These are #21/#23 decisions, not proof of the deferred background-Check feature.

## 7 Identity, application account and future organization continuity

**Assessment for #23/#13/#21:** preserve the following separation conceptually without deciding the final schema or Owner/role model:

- A **provider identity** is an authentication authority plus its stable subject (e.g. OIDC issuer/subject, provider tenant/subject, or SAML IdP entity ID plus the stable subject and relevant qualifiers). A bare email address is a mutable contact/claim, not a universal primary key.
- A **Source Taster account** stays stable when a person adds/removes a login method or changes email. One or more proven provider identities resolve to it. Provider “user/account/organization” terminology is not the product's domain model.
- **Owner** remains the glossary's person-at-launch/later-organization assignment for quota, plan and stored Checks. Authentication does not determine entitlement or replace #13's Owner model. **Operator** permissions remain a later role decision; a cloud-console administrator is not automatically a product Operator.

This separation is motivated by verified provider behavior: Supabase excludes SAML identity linking; Auth0 keeps separate identities until linked and may discard secondary metadata; Better Auth distinguishes user/provider-account records; ZITADEL has resource-owner organizations as well as identity links. It avoids coupling plan/history keys to a login provider's deletion or ID format. It is not a promise that switching vendors needs no **identity mapping migration**; FA-ERW-05 asks that existing application accounts remain unchanged, not that third-party subject namespaces never change.

Prepare now for the following future scenarios; do not implement their deferred UI/features merely because hooks are needed:

1. **Google/Microsoft (FA-KTO-08):** add the provider identity to the existing account after a safe linking ceremony. The requirement's matching-email linkage needs a policy for unverified or non-authoritative claims, aliases, changed email, tenant-scoped Microsoft subjects and collisions with an existing paid account. Do not relax provider trust globally to force an unsafe same-email merge. Authenticating both identities is a defensible path that preserves the requirement's result; client must confirm the UX interpretation.
2. **University (FA-ERW-05 / deferred FA-ORG-07):** attach a newly authenticated federated subject to the existing account after proof. If the federation does not release the same email—or releases no email—use existing-account sign-in plus explicit linking/recovery. Require uniqueness of the external subject mapping and audited, controlled conflict resolution. A university domain is not a durable personal identifier.
3. **Organization membership (FA-ERW-01/02):** joining an organization changes membership/authorization, not the account ID. Describe personal plan/history and organization entitlement coexistence without silent transfer of privately owned verification content. Vendor tenants/organizations can help authenticate but must not force re-registration or a transfer of the existing provider user to another tenant. Per-organization identity directories often require another login-subject mapping even for the same person.
4. **Leaving an institution / removing a method:** preserve a verified alternative/recovery route before unlinking the last method, and decide how lost institutional access affects membership versus personal account access. Don't let a new holder of a recycled email inherit another person's history. Recovery and merges need audit and abuse protection.
5. **Vendor replacement:** preserve the application account and ownership records; map old/new external identities through proven control or a controlled migration. Export/import capabilities and contractual portability need verification. Changing issuer/tenant/client can change subjects; reauthentication may be unavoidable without being re-registration or loss of data.

No automatic merge based solely on a newly presented email or display name is recommended. A safe same-email policy may differ by provider and signed claim. Issuer/subject, identity-link proofs and email-verification status must stay distinguishable from consent to store history (FA-UEB-11).

## 8 SAML versus actual eduGAIN

**Verified:** DFN-AAI, an eduGAIN member federation, describes eduGAIN as aggregation of metadata from participating federations, not an identity provider that one selects in a dashboard. Participation is two-stage: federation membership and entity opt-in. Its [requirements][dfn-require] require a contract, supported SAML software, signed metadata verification, refresh at least daily, security contacts, rollover and HTTPS endpoints. An SP serving several home institutions must provide discovery and process standard encoded attributes. Its [registration process][dfn-register] requires test-federation participation and functional tests before production; its [eduGAIN guide][dfn-edugain] explains signed aggregate feeds and opt-in.

DFN's published SP agreement is described as **free of charge**, conditional on relevance to participating home organizations and medium-term use by more than one; exceptions need agreement. This is concrete eligibility evidence, not confirmation that Source Taster is accepted. A bilateral campus integration may instead use the institution's local metadata. The commercial service's eligibility, actual SP contract, federation choice and attribute release must be confirmed later. No federation was contacted or joined here.

Generic SAML documentation in Supabase, Auth0, Better Auth, SuperTokens, ZITADEL or Keycloak establishes neither federation admission nor a maintained eduGAIN service. A manual “paste one IdP XML” connection does not demonstrate signed aggregate metadata validation, expiry/refresh, many-IdP discovery, entity categories, certificate rollover, subject stability or institutional attribute release. No reviewed hosted plan is certified here as turnkey eduGAIN-ready.

**Candidate future routes:**

- Use the selected service's documented SAML connection **only after** it proves the required federation metadata/discovery/security behavior and appropriate pricing/region. Bilateral SAML may be reasonable for the first requesting institution; it does not pass the “test federation succeeds” criterion by itself.
- Put a federation-capable SP/broker in front of a stable OIDC/identity interface. DFN explicitly recommends long-supported federation software such as Shibboleth or SimpleSAMLphp. This could isolate eduGAIN metadata/discovery from the TypeScript application, but adds non-TypeScript infrastructure, operations, another security boundary and license/hosting review. It is an option to investigate on trigger, not an approved launch component.
- Buy a managed federation bridge with explicit eduGAIN/national-federation support, EU contract and lifecycle responsibility. No specific bridge supplier, eligibility or price was validated in this research; don't silently label an enterprise-SSO vendor a federation operator.

For the later FA-ORG-07 proof, require an actual test-federation sign-in and retained evidence of registration, metadata trust/freshness, rollover, discovery, signed assertion validation (issuer, destination, audience, time, replay and request correlation), agreed stable identifier/attributes, no-email and changed-email cases, existing-account linking, revocation and authorization. Do not use affiliation claims as payment/seat authorization without the later organization model. Authentication says who signed in; it does not allocate a plan or expose personal history to an institution.

**Launch preparation sufficient for FA-ERW-05 (candidate):** an identity-to-account seam, conflict/linking policy and a described new-method scenario. Implementing a federation bridge, SAML subscription, organization admin area or institution provisioning now is not required by this research. Reassess those when the section 19 organization trigger is met.

## 9 Account deletion and immediate access removal

FA-KTO-04 requires self-service deletion, immediate unavailability of verification data and eight-year blocked billing retention with prior notice. A vendor's delete-user API handles only one part. **Verified vendor primitives:** Supabase admin deletion requires a server-only service role; its user-data guide warns existing JWTs remain valid until expiry after user deletion. Better Auth exposes optional self-delete with verification/fresh-session checks and hooks. Auth0 provides user deletion via management tooling/API; application UI and entitlement cleanup are still required. SuperTokens documents deleting users; ZITADEL documents permission-controlled self-deletion and revocation; Keycloak offers a user-initiated delete action when configured. [Supabase delete][sup-delete] / [user data][sup-users], [Better Auth accounts][ba-account], [Auth0 deletion][a0-delete], [SuperTokens users][st-users], [ZITADEL][zit-delete], [Keycloak][kc-admin]

**Candidate application flow for #21/#23/#22:** verify fresh control and show the required billing-retention notice; atomically mark the application account unavailable to API authorization and revoke its app sessions; make all verification data/report URLs/history inaccessible immediately, stop access through live streams/workers/caches and queue durable deletion across stores; delete provider identities and sessions server-side; keep only the legally required billing record in segregated accounting access. Retry external failures idempotently and reconcile orphan identities. A failed third-party deletion must not restore access to verification data. A provider-account deletion webhook is supplementary reconciliation, not the only self-delete mechanism.

Physical removal from backups, provider event/audit stores, mail logs and restored snapshots is a distinct retention question. Specify tombstones/restore-time deletion replay so deleted accounts cannot reappear after restore. A soft-deleted provider ID, revocation of refresh only or hiding a UI row is not evidence of immediate API unavailability. Verify billing-vendor cancellation/retention separately with #18; do not delete invoices that FA-KTO-04 requires retaining. This report neither executes nor replaces the required legal review.

## 10 Verification gates and downstream decisions

No accounts, servers or extensions were provisioned; no login, email delivery, native-browser, attack or load test passed as a result of this document. Current docs/releases/contract text are sufficient to resolve the research question, with explicit empirical and contractual gaps.

| Decision ticket | Newly precise questions / evidence needed |
|---|---|
| **#23 Authentication and roles** | Select shortlist/provider and credential transport. Is separate sign-in with the same account sufficient under FA-KTO-03? If automatic handoff is wanted, what browser restart/device behavior is required? Choose linking trust, conflict/recovery policy, absolute/idle expiry, persistence, logout scopes and revocation delay. Demonstrate existing email account → Google/Microsoft and → a simulated SAML identity without changed account/plan/history; do not decide the final role/Owner design here. |
| **#13 Owner, Plan and Quota model** | Keep authentication subjects distinct from accounts and Owner assignments. Describe personal account joining/leaving an organization with existing plan/history retained; decide coexistence/transfer semantics without IdP tenancy driving billing or access to personal Checks. Guest web/extension quota linking remains open. |
| **#21 System architecture** | Define API identity resolution and authorization checks, deletion saga/outbox/retries, stream revocation/renewal, session concurrency and fail-closed behavior during IdP outage. Verify local verification of JWTs versus online session/account checks and their latency/security trade-off. |
| **#10 / #22 EU hosting and operations** | Obtain exact EU region/contract, applicable DPA, subprocessor roles/locations, backups/log/mail retention, support access and transfer safeguards. Cost two environments, realistic active users, resend volume, linking, future SSO, observability and recovery—not only the headline free MAU. Prove deliverability and backup deletion replay. |
| **#26 Tech stack** | Choose SDK/server/adapter/plugin versions and scan actual dependency licenses/advisories. Verify code exchange, Authorization-header support and DE/EN accessible shared UI in the bundled Chromium panel and Firefox/ESR sidebar. Include Brave/Opera native behavior rather than extrapolating from Chrome. |
| **#12 Open-core boundary** | Verify imported client/plugin licenses, optional paid-feature terms and separately hosted AGPL infrastructure boundary against proprietary accounts. Do not adopt a beta manual-linking dependency or a pre-1.0 core through an implicit exception. |
| **Later FA-ORG-07 reassessment** | Which first institution/federation, contractual eligibility, trusted metadata/discovery implementation, released stable subject/attributes, selected connection budget, EU storage/processing commitment and managed-versus-operated bridge? Require a test-federation result, not a generic SAML demo. |

Minimum proof before accepting a chosen authentication path: passwordless new/existing user; no account quota before confirmed email; expired/replayed/brute-forced code and delayed mail; two concurrent web/extension sessions with identical account/plan/history; unauthorized linking attempt and same-email collision; renewal race, stolen/revoked session and deleted account; provider/mail outage; native browser callback/permissions and session storage; accessible DE/EN UI/email; data map and signed contract evidence. This is a decision evidence plan, not an implementation backlog or a claim of completed acceptance.

### Candidate requirement clarifications / change requests

No specification edit or new obligation is approved. These candidates go to the client through #23/#21 and the parent map:

- **FA-KTO-03, FA-GLE-01/02:** confirm account equality after sign-in versus automatic web-to-extension session linking. A new automatic-handoff requirement needs explicit acceptance scenarios, including restart and different-browser mail links.
- **FA-KTO-08 / FA-ERW-05:** clarify that same-email linking uses verified/authoritative claims and/or proof of both identities; specify collision/no-email/changed-email recovery. Do not interpret the wording as authorizing takeover-prone merges. Additional confirmation can preserve the required final linkage without changing the account.
- **FA-UEB-13/14, FA-KTO-02:** resolve coverage of ancillary authentication/email/security logs and local extension credential storage; distinguish EU storage from deferred EU-only processing and from a recipient mailbox outside EU. A non-EU service with SCCs cannot silently substitute for EU account storage. Any relaxation needs a new specification version; none is requested as necessary before selecting a service-specific route.
- **FA-KTO-04, FA-UEB-45:** define immediate verification-data unavailability versus physical purge of backups/security-event stores, and prove deletion survives restore while billing stays blocked for eight years. This can first be an acceptance interpretation; no retention relaxation is assumed.
- **FA-ORG-07 / FA-ERW-05:** confirm federation-test scope on trigger and how a returning institutional subject links to an existing account without email matching; distinguish bilateral SAML from eduGAIN interoperability. No university integration is approved for launch.
- **FA-KTO-15/40 and extension research:** guest identity/quota sharing across surfaces remains a separate product interpretation. Do not create registered anonymous vendor accounts or merge guest results as an implicit implementation of deferred FA-KTO-07.

**One-line map gist:** Managed Supabase/Auth0 and self-operated Better Auth form a viable email-passwordless shortlist; preserve application account identity independently of provider subjects, and keep EU ancillary storage, extension session transport, safe linking and real eduGAIN onboarding as explicit downstream decisions.

The supplied English v3.1 requirements are unchanged. The predecessor project was not accessed. Final authentication, roles and Owner choices remain live client decisions.

## Primary source index

All sources below were read on 2026-10-24. Versioned source/release links are preferred where available; living documentation/pricing can change after this research. PDF evidence was read as text, including the Auth0-specific subprocessor table rather than the unrelated Workforce Identity table. Trust-center-only detail and service-specific commitments are marked as gaps above.

[sup-email]: https://supabase.com/docs/guides/auth/auth-email-passwordless
[sup-link]: https://supabase.com/docs/guides/auth/auth-identity-linking
[sup-saml]: https://supabase.com/docs/guides/auth/enterprise-sso/auth-sso-saml
[sup-region]: https://supabase.com/docs/guides/platform/regions
[sup-session]: https://supabase.com/docs/guides/auth/sessions
[sup-price]: https://supabase.com/pricing
[sup-smtp]: https://supabase.com/docs/guides/auth/auth-smtp
[sup-delete]: https://supabase.com/docs/reference/javascript/auth-admin-deleteuser
[sup-users]: https://supabase.com/docs/guides/auth/managing-user-data
[sup-ms]: https://supabase.com/docs/guides/auth/social-sign-in/auth-azure
[sup-dpa]: https://supabase.com/legal/customer-resources/data-processing-addendum
[sup-sub]: https://supabase.com/legal/subprocessor-list/October-12-2026.pdf
[ba-otp]: https://better-auth.com/docs/plugins/email-otp
[ba-magic]: https://better-auth.com/docs/plugins/magic-link
[ba-account]: https://better-auth.com/docs/concepts/users-accounts
[ba-sso]: https://better-auth.com/docs/plugins/sso
[ba-bearer]: https://better-auth.com/docs/plugins/bearer
[ba-session]: https://better-auth.com/docs/concepts/session-management
[ba-google]: https://better-auth.com/docs/authentication/google
[ba-ms]: https://better-auth.com/docs/authentication/microsoft
[ba-license]: https://github.com/better-auth/better-auth/blob/v1.7.12/LICENSE.md
[a0-otp]: https://auth0.com/docs/authenticate/passwordless/authentication-methods/email-otp
[a0-link]: https://auth0.com/docs/manage-users/user-accounts/user-account-linking
[a0-enterprise]: https://auth0.com/docs/authenticate/enterprise-connections
[a0-region]: https://auth0.com/docs/get-started/auth0-overview/create-tenants
[a0-price]: https://auth0.com/pricing
[a0-rotation]: https://auth0.com/docs/secure/tokens/refresh-tokens/refresh-token-rotation
[a0-smtp]: https://auth0.com/docs/customize/email/smtp-email-providers
[a0-magic]: https://auth0.com/docs/authenticate/passwordless/authentication-methods/email-magic-link
[a0-delete]: https://auth0.com/docs/manage-users/user-accounts/delete-users
[a0-dpa]: https://www.okta.com/content/dam/okta---digital/en_us/legal/data-processing-addendum-en-jp-082726.pdf
[a0-sub]: https://www.okta.com/content/dam/okta-www/en_us/legal/subprocessors/OKTA-Sub-processor-Information-Page-2026-05.pdf
[st-email]: https://supertokens.com/docs/authentication/passwordless/introduction
[st-link]: https://supertokens.com/docs/post-authentication/account-linking/introduction
[st-price]: https://supertokens.com/pricing
[st-saml]: https://supertokens.com/docs/authentication/enterprise/saml
[st-header]: https://supertokens.com/docs/post-authentication/session-management/switch-between-cookies-and-header-authentication
[st-security]: https://supertokens.com/docs/post-authentication/session-management/security
[st-users]: https://supertokens.com/docs/post-authentication/user-management/common-actions
[st-self]: https://supertokens.com/docs/deployment/self-host-supertokens
[st-dpa]: https://supertokens.com/legal/dpa
[zit-challenge]: https://github.com/zitadel/zitadel/blob/v4.20.0/proto/zitadel/session/v2/challenge.proto
[zit-policy]: https://github.com/zitadel/zitadel/blob/v4.20.0/proto/zitadel/policy.proto
[zit-link]: https://github.com/zitadel/zitadel/blob/v4.20.0/apps/docs/content/concepts/features/account-linking.mdx
[zit-broker]: https://github.com/zitadel/zitadel/blob/v4.20.0/apps/docs/content/concepts/features/identity-brokering.mdx
[zit-delete]: https://github.com/zitadel/zitadel/blob/v4.20.0/apps/docs/content/guides/manage/user/self-deletion.mdx
[zit-production]: https://github.com/zitadel/zitadel/blob/v4.20.0/apps/docs/content/guides/manage/production-checklist.mdx
[zit-notify]: https://github.com/zitadel/zitadel/blob/v4.20.0/apps/docs/content/guides/manage/customize/notification-providers.mdx
[zit-price]: https://zitadel.com/pricing
[zit-dpa]: https://zitadel.com/docs/legal/data-processing-agreement
[zit-sub]: https://zitadel.com/docs/legal/subprocessors
[kc-admin]: https://www.keycloak.org/docs/latest/server_admin/index.html
[kc-prod]: https://www.keycloak.org/server/configuration-production
[ses-region]: https://docs.aws.amazon.com/ses/latest/dg/regions.html
[ses-price]: https://aws.amazon.com/ses/pricing/
[ses-security]: https://docs.aws.amazon.com/ses/latest/dg/data-protection.html
[aws-dpa]: https://d1.awsstatic.com/legal/aws-gdpr/AWS_GDPR_DPA.pdf
[aws-sub]: https://aws.amazon.com/compliance/sub-processors/
[brevo-policy]: https://www.brevo.com/legal/privacypolicy/
[brevo-dpa]: https://www.brevo.com/legal/termsofuse/#data-processing-agreement
[dfn-require]: https://doku.tid.dfn.de/en:requirements
[dfn-register]: https://doku.tid.dfn.de/en:registration
[dfn-edugain]: https://doku.tid.dfn.de/de:edugain
[owasp-session]: https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html
[owasp-csrf]: https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html
[oauth-bcp]: https://www.rfc-editor.org/rfc/rfc9700.html
[mdn-storage]: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/storage
[chrome-storage]: https://developer.chrome.com/docs/extensions/reference/api/storage
