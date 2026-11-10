# Front all verification with the open API and run Checks as PostgreSQL-backed jobs

The client accepted this decision on 24 October 2026 in [System architecture](https://github.com/jeffnawroth/source-taster/issues/21). It refines the program separation of [ADR-0001](0001-open-core-boundary.md) and builds on the stack of [ADR-0002](0002-tech-stack.md). The open verification program is the only business API that the web app and the extension use. It consults the private service through a narrow entitlement interface. Each program runs as long-lived `web` and `worker` processes on its own PostgreSQL schema with pg-boss, and streams Check progress over SSE. This keeps operations minimal and the open/proprietary boundary explicit, at the cost of coupling Check availability to the service.

This ADR fixes mechanisms and seams only. The meaning of cancellation, failure and billing belongs to [Check and Reference model and lifecycle](https://github.com/jeffnawroth/source-taster/issues/14), and the shape of Owner, Plan and Quota belongs to [Owner, Plan and Quota model](https://github.com/jeffnawroth/source-taster/issues/13).

## Programs and boundaries

- **Front door.** The verification API (open) serves every business function (FA-ERW-04): Structuring, Checks, Re-checks, History and Verification reports. Clients call the service API (private) directly only for sign-in, account management and the Plan/Quota display. The future third-party API (FA-ORG-13) is the same verification API.
- **Entitlement interface.** The verification program asks the service for identity, permissions and Quota through a narrow internal interface.
  - **Hosted mode fails closed.** It refuses to start without a configured service and denies business actions while the service is unreachable.
  - **Standalone mode** is the same build, activated only by explicit configuration. A local adapter supplies a single local Owner with all permissions and no Quota. The developer supplies their own data-source and AI-provider credentials through environment variables. There is no Guest mode, Plan display or purchasing. Because hosted authorization runs on the Operator's servers, standalone use does not bypass it (ADR-0001).
- **All verification runs on the server**: Structuring including PDF/DOCX reading, search, scoring, Verdict and Correction suggestion. The web app and the extension are thin clients built from the same UI packages and API client. Default settings come from the API, so FA-GLE-03 holds by construction.
- **Privacy boundary.**
  - The service never receives verification content, only IDs, counts and roles.
  - The verification program stores no account personal data, only the opaque Owner ID.
  - Logs, errors, URLs and traces are content-free (see Observability).
- **Data.** Each program has its own PostgreSQL schema, its own database role and its own pg-boss queues. There is no cross-schema access, query or foreign key; the only link is the opaque Owner ID. Whether both schemas share one managed instance or use two is decided by [Hosting and operations](https://github.com/jeffnawroth/source-taster/issues/22), and switching is a configuration change.
- **Internal communication.** Endpoints between the programs live under `/internal`, separate from `/v1`. They are described by a separate internal contract package. Calls carry signed service tokens: each program has its own key pair, the other knows only its public key, and keys rotate without a shared secret.
- **Contract packages.** The verification contract, the service contract and the internal contract live in the open repository, under `AGPL-3.0-or-later OR MIT`. In the implementation hand-off for [#70](https://github.com/jeffnawroth/source-taster/issues/70), the client refined distribution on 26 October 2026: the private service consumes them as Git subdirectory dependencies pinned to a full reviewed commit SHA, with no registry publication or service-side vendored copy. This supersedes the original public-npm distribution choice. Packages carry committed JavaScript, declarations and generated OpenAPI artifacts; CI rebuilds and checks those artifacts. Only the transport package and its dual-licensed shared transport code may enter the dependency, never AGPL-only implementation. The service selects the MIT license branch; the exception's scope remains ADR-0001's transport boundary.
- **Private UI.** The account, checkout and Operator web pages form a separate, small private UI on the same third-party libraries (React Aria, Tailwind). They use the payment provider's hosted checkout and customer portal as far as possible. ADR-0001's contract exception is not widened to UI code.

### Open repository layout

```text
apps/server                    # one codebase, two entrypoints: web, worker
apps/web                       # SPA
apps/extension                 # Vite extension build
packages/core                  # pure domain logic (Structuring, search, scoring) behind ports
packages/contract-verification # AGPL-3.0-or-later OR MIT
packages/contract-service      # AGPL-3.0-or-later OR MIT
packages/contract-internal     # AGPL-3.0-or-later OR MIT
packages/ui
packages/i18n
```

`core` depends only on ports: Data sources, AI provider, clock and persistence. The private repository follows the same `server`/`web` pattern without an extension or `core`.

## Identity, entitlement and Quota

- **Access tokens.** The service issues short-lived signed access tokens, about five minutes, with the verification API as audience. The verification API verifies them locally against the service's JWKS. Guests receive a Guest token the same way, bound to a random, browser-held Guest ID, so the verification API has one path. Every call sends `Authorization: Bearer`. Progress is read with a fetch-based SSE reader, because `EventSource` cannot send headers. In the extension, the reader runs in the side panel page, not in the service worker.
- **Current session authorization.** [ADR-0013](0013-authentication-roles.md) refines the local-JWT model: every protected request, including reads and further stream output, also checks current session, Account/Owner and permission state with the service. Failed checks deny access; revocation is not delayed until JWT expiry. The existing JWKS validation and five-minute token layer remain.
- **Online entitlement checks.** Before every entitlement-relevant action, the verification API asks the service online for current permissions and Quota. These actions are: start Structuring, start a Check, start a Re-check and create a Verification report. The answer is not cached per Check. This deliberately couples Check availability to the service.
- **Quota protocol.** The internal service API offers:
  - `reserve`: Check ID, Owner, count and idempotency key;
  - `commit`: the actual count;
  - `release`: the remainder.

  Reservations expire. A reconciliation job on each side corrects stale reservations, including after a restore.
- **Account deletion (FA-KTO-04).** The service drives the flow:
  1. It synchronously calls `DELETE /internal/owners/{id}` on the verification program. That deletes all content and writes an Owner tombstone in the same transaction; from then on every still-valid token of that Owner is refused, including for reads such as History.
  2. Only then does the service delete the account data. Billing data are blocked and kept for eight years.

  If the verification program is unreachable, the account is blocked immediately and deletion is retried durably until confirmed; the user sees that deletion is in progress. Tombstones hold IDs only and are re-applied after a backup restore. The verification program enforces History retention itself with scheduled jobs.
- **Organization preparation (FA-ERW-01 to 03).** The verification program knows only an opaque Owner ID, an actor ID (who acted) and the permissions in the token.
  - Functions check permission names such as `check:create` or `report:create`. The mapping from roles to permissions lives in the service, so a new role needs no change to existing functions.
  - Every Check stores Owner and actor separately. An Owner can later be an organization and the actor a member, without data migration.
  - API keys (FA-ORG-10 to 12) later become another token type, resolved by the service. Bulk jobs (FA-ORG-16) reuse the pg-boss infrastructure.

## Check execution and progress

- **Processes.** Each program runs two long-lived process types: `web` (Hono API and SSE) and `worker` (pg-boss consumer). There is no Redis and no workflow service.
- **Uploads (FA-ERF-02, FA-ERF-12).** PDF and DOCX files go to the verification API as multipart. A request over the configured limit (initial value 20 MB) is aborted while reading. The file is held briefly in a PostgreSQL table; there is no object storage. The Structuring job stores the recognized References and deletes the raw file in the same transaction. For a PDF without text, only a counter is incremented, with no content.
- **Jobs.**
  - Structuring is one job per Check: bibliography detection, Parsing or AI extraction.
  - Search and scoring are one job per Reference. A Re-check after a correction is a single Reference job.
  - A worker writes the result and its progress event in the same transaction.
  - The worker enforces fairness between concurrent Checks (FA-UEB-43) and global rate budgets per Data source. The budgets themselves belong to [Search strategy and latency budget](https://github.com/jeffnawroth/source-taster/issues/16).
- **Progress.** Each Check has an ordered event log in the database with a sequence number.
  - `GET /v1/checks/{id}/events` streams it over SSE, with replay from `Last-Event-ID`.
  - PostgreSQL `LISTEN/NOTIFY` wakes the `web` instances.
  - A heartbeat is sent every 25 seconds, within the hosting proxy limits.
  - `GET /v1/checks/{id}` always returns the complete current state. A reopened panel loads this snapshot and then attaches to the stream.
  - The event log follows the same retention rules as the content, at most 24 hours for Guests (FA-UEB-10).
- **Cancellation and lease.** Cancellation happens only through an explicit `POST /v1/checks/{id}/cancel`; a dropped stream triggers nothing. A client lease is extended by the open stream or a renew call. When it expires after a grace period, a separate "lease expired" event is raised. Whether the Check is then cancelled or kept is decided by Check and Reference model and lifecycle. This does not introduce background checks (FA-ERF-09 stays deferred).

## API conventions and compatibility

- **Conventions.** REST under `/v1`, additive-only within a major version. Errors are RFC 9457 Problem Details with a stable `code` and an i18n key. Creates take an `Idempotency-Key` header, limits answer with `Retry-After`, and pagination is uniform. Every response has a prepared slot for consumption and remaining Quota (FA-ORG-15). These conventions live in a shared contract package.
- **Request limits (FA-BTR-04).** Both APIs enforce limits at their entrance with PostgreSQL counters: per principal, per Guest ID, for all Guests in total, and per origin through a hashed, truncated IP prefix. Plain IP addresses are not stored. The Operator maintains the values in the service (FA-BTR-02), and the verification program caches them briefly. An exceeded limit answers `429` with Problem Details and `Retry-After`. Bot detection and disposable-address checks (FA-KTO-41 to 43) stay deferred.
- **Versions and store compatibility.**
  - The web app and the extension carry the same version number from the open repository.
  - Clients send their version as `Source-Taster-Client: extension/1.4.0`.
  - The API serves every version from a configured minimum. Below it, it answers `400` with code `client-update-required`; `426` is not used because RFC 9110 ties it to an `Upgrade` header naming a protocol.
  - A breaking change means `/v2`. `/v1` keeps running until the store builds of all browsers are released and spread, at least six months.
  - New features ship disabled behind server-side feature flags and are enabled in both environments at once when all store builds are live (FA-GLE-05).

## Observability

Both programs write structured JSON logs, OpenTelemetry traces and metrics. Only allow-listed attributes are recorded: IDs, counts, durations, status codes, Data source names and Problem `code`. Request bodies, Reference text, file names and search queries are never logged, and error reports are scrubbed before sending. The same metrics measure FA-UEB-40 to 45 and feed the section 19 trigger counters, such as the share of PDFs without text. The tool and vendor are chosen by Hosting and operations.

## Release validation

- **Automated in CI:**
  - the web app with Playwright in Chromium, Firefox and WebKit, each with axe;
  - extension end-to-end tests in Chromium with Playwright;
  - Firefox and ESR extension smoke tests with `web-ext` and Selenium/geckodriver;
  - the FA-GLE-03 parity test: 50 References from the Reference test set through the web app and the extension against the same API.
- **Manual checklist per release** on Windows 11 and the current macOS, recorded in the release issue:
  - real Safari in its two latest major versions;
  - side panel and context menu in Brave, Opera and Edge.

## Considered options

- **Client-side verification in the extension or web app**, rejected because parity, Quota enforcement and content-free logging would depend on every client.
- **The service as the front door, proxying the verification API**, rejected because verification content would pass through proprietary code (ADR-0001 privacy and license boundary).
- **Request-driven containers or bounded jobs** for Check execution, rejected because a queue consumer must run continuously.
- **Redis or a workflow service** for jobs and progress, rejected for a second stateful service.
- **One shared schema with foreign keys** between the programs, rejected because it ties the proprietary and open data models together.
- **Object storage for uploads**, rejected for one more service, credential set and deletion point.
- **Disconnect implies cancellation**, rejected because a reload or a network change would silently end a Check.

## Consequences

- **Availability coupling.** No Check starts while the service is unreachable. Hosting and operations must size both programs for FA-UEB-44 together.
- **Handed-off interfaces:**
  - [Authentication and roles](https://github.com/jeffnawroth/source-taster/issues/23): how a client obtains and renews access tokens (cookie session or refresh token); session concurrency; behavior during an identity-provider outage; future SAML or university sign-in without changing accounts (FA-ERW-05); and how open SSE streams and queued jobs of a tombstoned or blocked Owner are revoked within the token lifetime.
  - [Check and Reference model and lifecycle](https://github.com/jeffnawroth/source-taster/issues/14): billing on cancellation, failure and Data source outage; the reaction to an expired lease, including closing the panel.
  - [Owner, Plan and Quota model](https://github.com/jeffnawroth/source-taster/issues/13): the shape of Owner and Guest, and reservation expiry values.
  - [Search strategy and latency budget](https://github.com/jeffnawroth/source-taster/issues/16): rate budgets per Data source and concurrency per Check.
  - [Hosting and operations](https://github.com/jeffnawroth/source-taster/issues/22): physical database placement and correlated-failure boundaries; backup lifetime of content; reconciliation of Quota, payment webhooks and e-mail after a restore; the observability tool; the release checklist in the release process.
  - [Reference test set and release quality gate](https://github.com/jeffnawroth/source-taster/issues/15): the 50-Reference parity set for FA-GLE-03.
- **Legal review.** The concrete program communication and contract packages remain subject to the review required by FA-UEB-23 (ADR-0001).

## Proposed design-system refinement — ADR-0027

Prepared for joint owner acceptance under #206; this addition is not effective while ADR-0027 remains proposed. The exact wording was agreed in #189.

**Addition to “Contract packages”:** The design-token package is distributed the same way, pinned to the same reviewed commit SHA as the contracts. The service selects the MIT licence branch.

This exception is limited to the value-only package described in [ADR-0027](0027-design-system.md). Private components remain independent; no `@source-taster/ui` or `@source-taster/i18n` implementation crosses repositories. The existing program/API/content and legal-review boundaries remain.
