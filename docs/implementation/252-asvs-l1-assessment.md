# ASVS 5.0.0 Level 1 assessment (Q07, #252)

Part of #70. This is the first assessment of the repositories against OWASP ASVS 5.0.0 Level 1, as ADR-0015 requires before a launch candidate. It is a self-assessment by the implementation agent from code review and the existing tests. It is not an independent assessment and it is not owner sign-off; both stay human gates (see Sign-off).

## Assessment record

| Field | Value |
| --- | --- |
| Standard | OWASP Application Security Verification Standard 5.0.0, Level 1 |
| Release | `v5.0.0_release`, published 2025-05-30; tag object `5cf9b032440be53ce345ab3c130fda46ba1ce7a2` |
| Source file | `OWASP_Application_Security_Verification_Standard_5.0.0_en.csv`, SHA-256 `6124dba176dc563f66363a11ae0c47f9b86b8a4a84c66a793670bd196ed86cd5` |
| Companion | `OWASP_Application_Security_Verification_Standard_5.0.0_en.flat.json`, SHA-256 `8201b20eec2908c3380ac600c91c8ba746346fbb808859366abb232027532311` |
| Rows in the file | 345 (L1 = 70, L2 = 183, L3 = 92); this note covers the 70 L1 rows |
| Assessed build | public repository `jeffnawroth/source-taster` at `origin/main` commit `0536aa6`; private repository `jeffnawroth/source-taster-service` read-only, shallow clone of its default branch on 2026-11-20 |
| Assessor | implementation agent (self-assessment), 2026-11-20 |
| Row owner | the repository owner for every row; Account and Quota rows are implemented in the private repository |
| Method | Code review (CR) of the paths cited per row, plus the existing automated tests named where they exist. No dynamic testing and no hosted-environment checks were run. |
| Regeneration | `docs/implementation/252-asvs-l1-assessment.md` was generated from the CSV above; the 70 L1 row IDs and wording come from the file unchanged |

Requirement text is quoted from OWASP ASVS 5.0.0, which is licensed under CC BY-SA 4.0 (https://creativecommons.org/licenses/by-sa/4.0/). This note is distributed under the same licence terms for the quoted text; the assessments are the repository's own.

## Results

| Result | Meaning | Rows |
| --- | --- | ---: |
| Pass | Met by code or design as reviewed; no hosted evidence needed | 44 |
| Pass, hosted evidence pending | Met by design or code; needs evidence from the real hostnames (#116 `hosting` and `isolation` gates) | 5 |
| Partial | Partly met; follow-up tracked in #267 | 3 |
| Fail | Not met; finding issue filed | 2 |
| N/A | Does not apply; rationale given | 16 |
| Total | | 70 |

ADR-0015 says critical findings block release. Of the findings below, the missing HSTS header (#264) and the missing CSP and baseline headers on the web-app shell (#265) are the only `Fail` rows. Both are L1 non-conformances; whether they block the launch candidate is the owner's call under ADR-0015, and the issues are filed `ready-for-agent` so they can be fixed first. #266 (Semgrep CE, Gitleaks, ZAP Baseline in CI) is an ADR-0015 process gap and is not a row result.

## Findings and follow-ups

| Row | Result | Issue |
| --- | --- | --- |
| V3.2.1 | Fail | #265 (private counterpart `jeffnawroth/source-taster-service`#35) |
| V3.4.1 | Fail | #264 (private counterpart `jeffnawroth/source-taster-service`#35) |
| V6.3.2 | Partial | #267 |
| V7.2.4 | Partial | #267 |
| V11.4.1 | Pass | #267 (optional, informational) |
| V14.3.1 | Partial | #267 |
| ADR-0015 tooling | Process gap | #266 |
| Hosted-only rows | Pass, hosted evidence pending | #116 (`hosting`, `isolation`) |

## ADR-0015 named evidence

ADR-0015 names evidence that the assessment must show. Where the row text is too coarse, this section is the answer.

| ADR-0015 item | Where it is met | Rows |
| --- | --- | --- |
| Cookies | The public program and Website set none. Account uses `__Host-` prefixed `Secure`, `HttpOnly`, `SameSite=Strict` cookies, web only; the Extension uses a bearer credential in extension-local storage restricted to trusted contexts. | V3.3.1, V7.2.3, V14.3.1 |
| CORS | One exact-origin route on the public API (`/v2/history/consent`), exact-string allowlists on Account, no wildcard or reflection. | V3.4.2 |
| CSRF | The public API has no ambient credential (bearer only). Account checks `Origin` against an allowlist and uses `SameSite=Strict`. | V3.5.1-V3.5.3 |
| CSP | Website and Extension pages have one; the web-app shell and API responses do not. | V3.2.1 Fail (#265) |
| Extension message trust | Only the extension's own `panel.html` may open the selection port; sender id and URL are checked; no generic message intake; no `externally_connectable`. | `apps/extension/src/background.ts` (`onConnect`), V3.5.1 |
| OTP budgets | 6 digits, 5 minutes, 3 attempts, 60 s resend, HMAC-hashed, per-address advisory lock, separate budget for unsolicited requests. | V6.1.1, V6.3.1, V6.4.1 |
| Guest/Owner boundary | Guest tokens are 5-minute EdDSA JWTs verified against the service's keys; Owner authority comes from the service on every guarded call; another principal's Check is `check-not-found`. | V7.2.1, V8.2.1, V8.2.2, V9.1.x |
| Current authority on reads, streams and downloads | Reads call the guard; export and report downloads guard before streaming and again inside the stream callback; the event stream is bounded by the token expiry (`principal.expiresAt`) and handles authority loss inside its loop. | V8.2.2, V9.2.1 |
| Current authority on background jobs | Not assessed in this pass. | #267 |
| Isolation of the document parser | OS-enforced container with a fixed non-root user; hosted proof is the `isolation` gate. | V1.2.5, V5.2.1, #116 |

## Surfaces

- **API**: the verification program's HTTP API (`apps/server`, public, AGPL-3.0-or-later).
- **Web**: the web app (`apps/web`, `packages/ui`) served by the same process.
- **Extension**: the browser extension (`apps/extension`).
- **Website**: the static Astro site (`apps/website`).
- **SVC**: the private service (Account, Quota, Orders, Operator); cited by repository and path only, no private code or evidence is reproduced here.
- **Repository**: CI, Dependabot and documentation.

## Rows

### V1.2.1 - Pass

> Verify that output encoding for an HTTP response, HTML document, or XML document is relevant for the context required, such as encoding the relevant characters for HTML elements, HTML attributes, HTML comments, CSS, or HTTP header fields, to avoid changing the message or document structure.

- **Section:** V1 Encoding and Sanitization, V1.2 Injection Prevention
- **Applicability and rationale:** Applicable. Every surface emits HTML or headers.
- **Surfaces:** Web, Extension, Website, API
- **Method:** code review
- **Evidence:** Web and Extension are React 19: text children are escaped by the framework. `git grep` for `innerHTML`, `dangerouslySetInnerHTML`, `insertAdjacentHTML` and `document.write` over `apps/*/src` and `packages/*/src` finds nothing. The Website is static Astro output with a strict CSP (`apps/website/hosting.ts`). The API returns JSON, `application/problem+json`, PDF and export bodies; download file names are server-fixed (`exporter.filename`, `source-taster-report.pdf`, `apps/server/src/http/app.ts`), so no untrusted value reaches a header.
- **Result:** Pass
- **Findings:** None

### V1.2.2 - Pass

> Verify that when dynamically building URLs, untrusted data is encoded according to its context (e.g., URL encoding or base64url encoding for query or path parameters). Ensure that only safe URL protocols are permitted (e.g., disallow javascript: or data:).

- **Section:** V1 Encoding and Sanitization, V1.2 Injection Prevention
- **Applicability and rationale:** Applicable. The API builds outbound source URLs; the UI renders links from source data.
- **Surfaces:** API, Web, Extension
- **Method:** code review
- **Evidence:** All source adapters (`apps/server/src/sources/{arxiv,crossref,doi,europepmc,googlebooks,openalex,openlibrary,semanticscholar}.ts`) build URLs with `new URL(...)`, `searchParams.set` or `encodeURIComponent`. `sources/safe-http.ts` admits only `http:`/`https:` and public addresses and validates redirects. `packages/ui/src/reference-outcome.tsx` (`sourceLink`) renders only `http(s)` links without credentials, DOI links are `encodeURIComponent`-encoded; `sensitive-account-actions.tsx` applies the same protocol filter.
- **Result:** Pass
- **Findings:** None

### V1.2.3 - Pass

> Verify that output encoding or escaping is used when dynamically building JavaScript content (including JSON), to avoid changing the message or document structure (to avoid JavaScript and JSON injection).

- **Section:** V1 Encoding and Sanitization, V1.2 Injection Prevention
- **Applicability and rationale:** Applicable. JSON is produced by the server and consumed by the UI.
- **Surfaces:** API, Web, Extension
- **Method:** code review
- **Evidence:** Bodies are serialized with `JSON.stringify` or the framework serializer (`apps/server/src/authority/hosted.ts`, Hono `c.json`). No string-built JSON or script content; no `eval` or `new Function` (see V1.3.2). The CSP of the Extension pages is `script-src 'self'; object-src 'self'` (`apps/extension/extension-config.ts`).
- **Result:** Pass
- **Findings:** None

### V1.2.4 - Pass

> Verify that data selection or database queries (e.g., SQL, HQL, NoSQL, Cypher) use parameterized queries, ORMs, entity frameworks, or are otherwise protected from SQL Injection and other database injection attacks. This is also relevant when writing stored procedures.

- **Section:** V1 Encoding and Sanitization, V1.2 Injection Prevention
- **Applicability and rationale:** Applicable. PostgreSQL via `pg` and Prisma 7.
- **Surfaces:** API, SVC
- **Method:** code review (private repository read-only)
- **Evidence:** `pg` calls in `apps/server/src/abuse/limiter.ts` and `authority/hosted.ts` use `$1` placeholders or fixed statements. `apps/server/src/checks/store.ts` uses Prisma tagged-template raw queries (`$queryRaw`, `$executeRaw`), which bind interpolations as parameters. The only `$queryRawUnsafe` calls (`checks/store.ts`, the pg-boss `executeSql` adapters) forward pg-boss's own statements together with their value arrays; no request data enters the SQL text. `scripts/db-setup.ts` and `scripts/e2e-serve-hosted.ts` build identifiers with `ident`/`escapeIdentifier` from operator-supplied settings, not from requests. Private service: Prisma tagged templates in `jeffnawroth/source-taster-service` `apps/server/src/account-auth.ts`.
- **Result:** Pass
- **Findings:** None

### V1.2.5 - Pass

> Verify that the application protects against OS command injection and that operating system calls use parameterized OS queries or use contextual command line output encoding.

- **Section:** V1 Encoding and Sanitization, V1.2 Injection Prevention
- **Applicability and rationale:** Applicable. The document-parser supervisor starts processes.
- **Surfaces:** API
- **Method:** code review
- **Evidence:** `child_process` is used only in `apps/server/src/documents/supervisor.ts` (`execFile`, `spawn`), always with an argument array and no shell; the arguments are fixed or internally generated (container name), never request data. The parser itself runs in an OS-enforced container (`apps/server/extractor.Dockerfile`, user 65534).
- **Result:** Pass
- **Findings:** None

### V1.3.1 - N/A

> Verify that all untrusted HTML input from WYSIWYG editors or similar is sanitized using a well-known and secure HTML sanitization library or framework feature.

- **Section:** V1 Encoding and Sanitization, V1.3 Sanitization
- **Applicability and rationale:** Not applicable. No surface accepts HTML from a WYSIWYG editor; reference text is plain text rendered by React.
- **Surfaces:** -
- **Method:** code review
- **Evidence:** No rich-text input exists in `apps/web`, `apps/extension` or `packages/ui`.
- **Result:** N/A
- **Findings:** None

### V1.3.2 - Pass

> Verify that the application avoids the use of eval() or other dynamic code execution features such as Spring Expression Language (SpEL). Where there is no alternative, any user input being included must be sanitized before being executed.

- **Section:** V1 Encoding and Sanitization, V1.3 Sanitization
- **Applicability and rationale:** Applicable.
- **Surfaces:** API, Web, Extension
- **Method:** code review
- **Evidence:** `git grep` for `eval(`, `new Function(` and `vm.runIn` over `apps/*/src` and `packages/*/src` finds nothing. The Extension CSP forbids `unsafe-eval`.
- **Result:** Pass
- **Findings:** None

### V1.5.1 - Pass

> Verify that the application configures XML parsers to use a restrictive configuration and that unsafe features such as resolving external entities are disabled to prevent XML eXternal Entity (XXE) attacks.

- **Section:** V1 Encoding and Sanitization, V1.5 Safe Deserialization
- **Applicability and rationale:** Applicable. DOCX upload is OOXML (XML in ZIP); CSL styles are XML.
- **Surfaces:** API
- **Method:** code review
- **Evidence:** `apps/server/src/documents/docx.ts` parses with `saxes` and rejects every DOCTYPE (`parser.on("doctype", ...)`), so no entity or external-subset resolution exists; relationships are never followed; expansion is budgeted. CSL styles are bundled, trusted files (`apps/server/src/citations/assets/`).
- **Result:** Pass
- **Findings:** None

### V2.1.1 - Pass

> Verify that the application's documentation defines input validation rules for how to check the validity of data items against an expected structure. This could be common data formats such as credit card numbers, email addresses, telephone numbers, or it could be an internal data format.

- **Section:** V2 Validation and Business Logic, V2.1 Validation and Business Logic Documentation
- **Applicability and rationale:** Applicable.
- **Surfaces:** API
- **Method:** code review
- **Evidence:** Validation rules are defined as Zod schemas in the contract packages (`packages/contract-verification`, `contract-common`) that also generate the OpenAPI document; field limits are in `docs/technical-concept.md`. Document upload limits are documented with ADR-0011.
- **Result:** Pass
- **Findings:** None

### V2.2.1 - Pass

> Verify that input is validated to enforce business or functional expectations for that input. This should either use positive validation against an allow list of values, patterns, and ranges, or be based on comparing the input to an expected structure and logical limits according to predefined rules. For L1, this can focus on input which is used to make specific business or security decisions. For L2 and up, this should apply to all input.

- **Section:** V2 Validation and Business Logic, V2.2 Input Validation
- **Applicability and rationale:** Applicable.
- **Surfaces:** API
- **Method:** code review
- **Evidence:** Routes are declared with `app.openapi(...)` against the contract schemas (`packages/contract-verification/src/routes-v2.ts`), so bodies, params and queries are validated positively before handlers run; unknown shapes yield `invalid-request` problems (`apps/server/src/http/problems.ts`). Identifiers in paths are matched with strict patterns (for example the 36-character check id in the global middleware).
- **Result:** Pass
- **Findings:** None

### V2.2.2 - Pass

> Verify that the application is designed to enforce input validation at a trusted service layer. While client-side validation improves usability and should be encouraged, it must not be relied upon as a security control.

- **Section:** V2 Validation and Business Logic, V2.2 Input Validation
- **Applicability and rationale:** Applicable.
- **Surfaces:** API, Web, Extension
- **Method:** code review
- **Evidence:** Validation runs in the API process (contract schemas, upload limits, `readUpload`). The Web and Extension validate only for usability; the server rejects the same inputs independently.
- **Result:** Pass
- **Findings:** None

### V2.3.1 - Pass

> Verify that the application will only process business logic flows for the same user in the expected sequential step order and without skipping steps.

- **Section:** V2 Validation and Business Logic, V2.3 Business Logic Security
- **Applicability and rationale:** Applicable. A Check has a lifecycle (start, references, end, report).
- **Surfaces:** API
- **Method:** code review
- **Evidence:** State is held server-side in `verification.checks` and enforced under row locks (`apps/server/src/checks/store.ts`, `SELECT ... FOR UPDATE`); out-of-order calls produce `report-not-ready`, `report-busy`, `check-expired`, `history-locked` problems (`http/app.ts` `onError`). The client cannot skip or reorder steps by sending requests.
- **Result:** Pass
- **Findings:** None

### V3.2.1 - Fail

> Verify that security controls are in place to prevent browsers from rendering content or functionality in HTTP responses in an incorrect context (e.g., when an API, a user-uploaded file or other resource is requested directly). Possible controls could include: not serving the content unless HTTP request header fields (such as Sec-Fetch-\*) indicate it is the correct context, using the sandbox directive of the Content-Security-Policy header field or using the attachment disposition type in the Content-Disposition header field.

- **Section:** V3 Web Frontend Security, V3.2 Unintended Content Interpretation
- **Applicability and rationale:** Applicable. The API serves JSON, PDF and export files; the Web shell is served by the same process.
- **Surfaces:** API, Web
- **Method:** code review
- **Evidence:** Export and report-PDF downloads use `Content-Disposition: attachment`, a fixed `Content-Type`, `Cache-Control: no-store` and `X-Content-Type-Options: nosniff` (`apps/server/src/http/app.ts`). Ordinary JSON and problem responses, and the web-app shell and assets (`apps/server/src/web.ts`, `serveStatic`), carry no `nosniff` and the shell has no CSP. The Website already has a CSP. A JSON response is not a rendering risk for a browser that honours `Content-Type`, but the control is absent and ADR-0015 requires CSP evidence.
- **Result:** Fail
- **Findings:** #265 (private counterpart `jeffnawroth/source-taster-service`#35)

### V3.2.2 - Pass

> Verify that content intended to be displayed as text, rather than rendered as HTML, is handled using safe rendering functions (such as createTextNode or textContent) to prevent unintended execution of content such as HTML or JavaScript.

- **Section:** V3 Web Frontend Security, V3.2 Unintended Content Interpretation
- **Applicability and rationale:** Applicable.
- **Surfaces:** Web, Extension
- **Method:** code review
- **Evidence:** Text is rendered through React text nodes; no raw-HTML sink exists (see V1.2.1).
- **Result:** Pass
- **Findings:** None

### V3.3.1 - Pass

> Verify that cookies have the 'Secure' attribute set, and if the '\__Host-' prefix is not used for the cookie name, the '__Secure-' prefix must be used for the cookie name.

- **Section:** V3 Web Frontend Security, V3.3 Cookie Setup
- **Applicability and rationale:** Applicable to the Account session only. The public program and the Website set no cookies.
- **Surfaces:** SVC (Account), API, Website
- **Method:** code review (private repository read-only)
- **Evidence:** `git grep` for `set-cookie`/`setCookie`/`document.cookie` over `apps/*/src` and `packages/*/src` finds nothing; `apps/server/test/website.test.ts` asserts that the Website sets no cookie. Account's session and sign-in binding cookies are `__Host-st-session` and `__Host-st-signin`, `Secure`, `HttpOnly`, `SameSite=Strict` (`jeffnawroth/source-taster-service` `apps/server/src/account-auth.ts`, `cookieOptions`). Account refuses a non-HTTPS public origin at start-up. Hosted `Set-Cookie` evidence from the real hostname is collected under #116.
- **Result:** Pass
- **Findings:** None

### V3.4.1 - Fail

> Verify that a Strict-Transport-Security header field is included on all responses to enforce an HTTP Strict Transport Security (HSTS) policy. A maximum age of at least 1 year must be defined, and for L2 and up, the policy must apply to all subdomains as well.

- **Section:** V3 Web Frontend Security, V3.4 Browser Security Mechanism Headers
- **Applicability and rationale:** Applicable. Both programs terminate TLS at the platform edge.
- **Surfaces:** API, Web, Website, SVC
- **Method:** code review (private repository read-only)
- **Evidence:** No `Strict-Transport-Security` header is set by `apps/server/src/http/app.ts`, `apps/server/src/web.ts` or `apps/website/hosting.ts`, or by the private service. Whether the Scalingo edge adds it is unproven.
- **Result:** Fail
- **Findings:** #264 (private counterpart `jeffnawroth/source-taster-service`#35)

### V3.4.2 - Pass

> Verify that the Cross-Origin Resource Sharing (CORS) Access-Control-Allow-Origin header field is a fixed value by the application, or if the Origin HTTP request header field value is used, it is validated against an allowlist of trusted origins. When 'Access-Control-Allow-Origin: *' needs to be used, verify that the response does not include any sensitive information.

- **Section:** V3 Web Frontend Security, V3.4 Browser Security Mechanism Headers
- **Applicability and rationale:** Applicable.
- **Surfaces:** API, SVC
- **Method:** code review (private repository read-only)
- **Evidence:** The public API emits `Access-Control-Allow-Origin` only on `/v2/history/consent`, and only when the request `Origin` equals the configured `historyConsentOrigin`; any other origin gets a `forbidden` problem (`apps/server/src/http/app.ts`, with `Vary: Origin`). Everything else sends no CORS headers. The private service matches `Origin` against exact-string allowlists (`extensionOrigins`, `authority.allowedOrigins`, `jeffnawroth/source-taster-service` `apps/server/src/account-auth.ts`). No wildcard or reflected origin.
- **Result:** Pass
- **Findings:** None

### V3.5.1 - Pass

> Verify that, if the application does not rely on the CORS preflight mechanism to prevent disallowed cross-origin requests to use sensitive functionality, these requests are validated to ensure they originate from the application itself. This may be done by using and validating anti-forgery tokens or requiring extra HTTP header fields that are not CORS-safelisted request-header fields. This is to defend against browser-based request forgery attacks, commonly known as cross-site request forgery (CSRF).

- **Section:** V3 Web Frontend Security, V3.5 Browser Origin Separation
- **Applicability and rationale:** Applicable to the cookie-authenticated Account endpoints; the public API has no ambient credential.
- **Surfaces:** API, SVC
- **Method:** code review (private repository read-only)
- **Evidence:** The public API authenticates only with an `Authorization: Bearer` credential; cookies never authenticate it (comment and code in `apps/server/src/http/app.ts` around the consent route). A forged cross-site request therefore carries no credential. Account's cookie endpoints reject requests whose `Origin` is not on the exact allowlist (`origin-required` profile; the `firefox-originless-get` profile exists for session reads only and is configuration-gated), `jeffnawroth/source-taster-service` `apps/server/src/account-auth.ts`.
- **Result:** Pass
- **Findings:** None

### V3.5.2 - Pass

> Verify that, if the application relies on the CORS preflight mechanism to prevent disallowed cross-origin use of sensitive functionality, it is not possible to call the functionality with a request which does not trigger a CORS-preflight request. This may require checking the values of the 'Origin' and 'Content-Type' request header fields or using an extra header field that is not a CORS-safelisted header-field.

- **Section:** V3 Web Frontend Security, V3.5 Browser Origin Separation
- **Applicability and rationale:** Applicable.
- **Surfaces:** API
- **Method:** code review
- **Evidence:** The API does not rely on preflight alone: state-changing calls need the bearer credential (a non-safelisted header) and JSON or multipart bodies; the consent route rejects foreign `Origin` values outright (see V3.4.2).
- **Result:** Pass
- **Findings:** None

### V3.5.3 - Pass

> Verify that HTTP requests to sensitive functionality use appropriate HTTP methods such as POST, PUT, PATCH, or DELETE, and not methods defined by the HTTP specification as "safe" such as HEAD, OPTIONS, or GET. Alternatively, strict validation of the Sec-Fetch-* request header fields can be used to ensure that the request did not originate from an inappropriate cross-origin call, a navigation request, or a resource load (such as an image source) where this is not expected.

- **Section:** V3 Web Frontend Security, V3.5 Browser Origin Separation
- **Applicability and rationale:** Applicable.
- **Surfaces:** API, SVC
- **Method:** code review (private repository read-only)
- **Evidence:** State changes use POST, PUT, PATCH or DELETE (for example `PUT /v2/history/consent`); GET routes only read (results, event stream, downloads). Consume-once or mutating operations never ride on GET.
- **Result:** Pass
- **Findings:** None

### V4.1.1 - Pass, hosted evidence pending

> Verify that every HTTP response with a message body contains a Content-Type header field that matches the actual content of the response, including the charset parameter to specify safe character encoding (e.g., UTF-8, ISO-8859-1) according to IANA Media Types, such as "text/", "/+xml" and "/xml".

- **Section:** V4 API and Web Service, V4.1 Generic Web Service Security
- **Applicability and rationale:** Applicable.
- **Surfaces:** API, Website
- **Method:** code review
- **Evidence:** API responses set explicit types: `application/json`, `application/problem+json`, `application/pdf`, export `contentType`, `text/event-stream` (Hono `streamSSE`); the one `text/*` type the API emits, `text/event-stream`, is UTF-8 by definition and carries no charset parameter; this is recorded as a deviation for the owner's acceptance. The Website static handler (`apps/website/hosting.ts`) serves HTML and text assets; their actual `Content-Type` with charset on the hosted domain is checked under #116 `hosting`.
- **Result:** Pass, hosted evidence pending
- **Findings:** None

### V4.4.1 - N/A

> Verify that WebSocket over TLS (WSS) is used for all WebSocket connections.

- **Section:** V4 API and Web Service, V4.4 WebSocket
- **Applicability and rationale:** Not applicable. No WebSocket endpoint exists; live updates use Server-Sent Events over HTTPS.
- **Surfaces:** -
- **Method:** code review
- **Evidence:** `git grep -i websocket` over `apps/*/src` finds nothing; the event stream is `streamSSE` in `apps/server/src/http/app.ts`.
- **Result:** N/A
- **Findings:** None

### V5.2.1 - Pass

> Verify that the application will only accept files of a size which it can process without causing a loss of performance or a denial of service attack.

- **Section:** V5 File Handling, V5.2 File Upload and Content
- **Applicability and rationale:** Applicable. DOCX/PDF/text uploads.
- **Surfaces:** API
- **Method:** code review
- **Evidence:** `apps/server/src/documents/upload.ts` counts bytes on the wire (chunked bodies too) against the configured input limit plus a bounded multipart envelope and rejects with `document-size-limit`; `docx.ts` enforces a per-member decompression budget (`expansion-limit`); the extractor runs with a capped heap (`--max-old-space-size=1024`).
- **Result:** Pass
- **Findings:** None

### V5.2.2 - Pass

> Verify that when the application accepts a file, either on its own or within an archive such as a zip file, it checks if the file extension matches an expected file extension and validates that the contents correspond to the type represented by the extension. This includes, but is not limited to, checking the initial 'magic bytes', performing image re-writing, and using specialized libraries for file content validation. For L1, this can focus just on files which are used to make specific business or security decisions. For L2 and up, this must apply to all files being accepted.

- **Section:** V5 File Handling, V5.2 File Upload and Content
- **Applicability and rationale:** Applicable.
- **Surfaces:** API
- **Method:** code review
- **Evidence:** The content type is decided from the bytes, not the name: DOCX is recognised by parsing it as ZIP/OOXML, and unreadable content is rejected (`documents/docx.ts`, `documents/extraction.ts`); the parse happens in the isolated extractor.
- **Result:** Pass
- **Findings:** None

### V5.3.1 - Pass

> Verify that files uploaded or generated by untrusted input and stored in a public folder, are not executed as server-side program code when accessed directly with an HTTP request.

- **Section:** V5 File Handling, V5.3 File Storage
- **Applicability and rationale:** Applicable.
- **Surfaces:** API
- **Method:** code review
- **Evidence:** Uploaded documents are processed in memory and in the extractor and are never written to a served directory; there is no upload folder. Exports are generated server-side and delivered as attachments.
- **Result:** Pass
- **Findings:** None

### V5.3.2 - Pass

> Verify that when the application creates file paths for file operations, instead of user-submitted filenames, it uses internally generated or trusted data, or if user-submitted filenames or file metadata must be used, strict validation and sanitization must be applied. This is to protect against path traversal, local or remote file inclusion (LFI, RFI), and server-side request forgery (SSRF) attacks.

- **Section:** V5 File Handling, V5.3 File Storage
- **Applicability and rationale:** Applicable.
- **Surfaces:** API
- **Method:** code review
- **Evidence:** No user-submitted file name is used to build a path: the API reads upload bytes only and the extractor receives them over its process interface. Download names are fixed by the server.
- **Result:** Pass
- **Findings:** None

### V6.1.1 - Pass

> Verify that application documentation defines how controls such as rate limiting, anti-automation, and adaptive response, are used to defend against attacks such as credential stuffing and password brute force. The documentation must make clear how these controls are configured and prevent malicious account lockout.

- **Section:** V6 Authentication, V6.1 Authentication Documentation
- **Applicability and rationale:** Applicable to the email-code sign-in; there are no passwords.
- **Surfaces:** SVC (Account), API
- **Method:** code review (private repository read-only)
- **Evidence:** ADR-0013 documents the sign-in code (6 digits, 5 minutes, 3 attempts, 60 s resend, hashed) and its budgets; ADR-0015 documents limiter windows and retention (counters up to 24 h). Lock-out abuse is bounded because the attempt budget belongs to one challenge, and unsolicited requests to an address use a separate budget that does not block the owner's own sign-in (`jeffnawroth/source-taster-service` `apps/server/src/account-auth.ts`).
- **Result:** Pass
- **Findings:** None

### V6.2.1 - N/A

> Verify that user set passwords are at least 8 characters in length although a minimum of 15 characters is strongly recommended.

- **Section:** V6 Authentication, V6.2 Password Security
- **Applicability and rationale:** Not applicable. Source Taster has no passwords: Accounts sign in with a one-time email code (ADR-0013), and Guests have no credential entry.
- **Surfaces:** -
- **Method:** code review
- **Evidence:** No password field, hash or policy exists in either program (`git grep -i password` over `apps/*/src` and `packages/*/src` finds nothing). If ADR-0013 ever adds passwords, rows V6.2.1-V6.2.8 become applicable and this note must be redone.
- **Result:** N/A
- **Findings:** None

### V6.2.2 - N/A

> Verify that users can change their password.

- **Section:** V6 Authentication, V6.2 Password Security
- **Applicability and rationale:** Not applicable. Source Taster has no passwords: Accounts sign in with a one-time email code (ADR-0013), and Guests have no credential entry.
- **Surfaces:** -
- **Method:** code review
- **Evidence:** No password field, hash or policy exists in either program (`git grep -i password` over `apps/*/src` and `packages/*/src` finds nothing). If ADR-0013 ever adds passwords, rows V6.2.1-V6.2.8 become applicable and this note must be redone.
- **Result:** N/A
- **Findings:** None

### V6.2.3 - N/A

> Verify that password change functionality requires the user's current and new password.

- **Section:** V6 Authentication, V6.2 Password Security
- **Applicability and rationale:** Not applicable. Source Taster has no passwords: Accounts sign in with a one-time email code (ADR-0013), and Guests have no credential entry.
- **Surfaces:** -
- **Method:** code review
- **Evidence:** No password field, hash or policy exists in either program (`git grep -i password` over `apps/*/src` and `packages/*/src` finds nothing). If ADR-0013 ever adds passwords, rows V6.2.1-V6.2.8 become applicable and this note must be redone.
- **Result:** N/A
- **Findings:** None

### V6.2.4 - N/A

> Verify that passwords submitted during account registration or password change are checked against an available set of, at least, the top 3000 passwords which match the application's password policy, e.g. minimum length.

- **Section:** V6 Authentication, V6.2 Password Security
- **Applicability and rationale:** Not applicable. Source Taster has no passwords: Accounts sign in with a one-time email code (ADR-0013), and Guests have no credential entry.
- **Surfaces:** -
- **Method:** code review
- **Evidence:** No password field, hash or policy exists in either program (`git grep -i password` over `apps/*/src` and `packages/*/src` finds nothing). If ADR-0013 ever adds passwords, rows V6.2.1-V6.2.8 become applicable and this note must be redone.
- **Result:** N/A
- **Findings:** None

### V6.2.5 - N/A

> Verify that passwords of any composition can be used, without rules limiting the type of characters permitted. There must be no requirement for a minimum number of upper or lower case characters, numbers, or special characters.

- **Section:** V6 Authentication, V6.2 Password Security
- **Applicability and rationale:** Not applicable. Source Taster has no passwords: Accounts sign in with a one-time email code (ADR-0013), and Guests have no credential entry.
- **Surfaces:** -
- **Method:** code review
- **Evidence:** No password field, hash or policy exists in either program (`git grep -i password` over `apps/*/src` and `packages/*/src` finds nothing). If ADR-0013 ever adds passwords, rows V6.2.1-V6.2.8 become applicable and this note must be redone.
- **Result:** N/A
- **Findings:** None

### V6.2.6 - N/A

> Verify that password input fields use type=password to mask the entry. Applications may allow the user to temporarily view the entire masked password, or the last typed character of the password.

- **Section:** V6 Authentication, V6.2 Password Security
- **Applicability and rationale:** Not applicable. Source Taster has no passwords: Accounts sign in with a one-time email code (ADR-0013), and Guests have no credential entry.
- **Surfaces:** -
- **Method:** code review
- **Evidence:** No password field, hash or policy exists in either program (`git grep -i password` over `apps/*/src` and `packages/*/src` finds nothing). If ADR-0013 ever adds passwords, rows V6.2.1-V6.2.8 become applicable and this note must be redone.
- **Result:** N/A
- **Findings:** None

### V6.2.7 - N/A

> Verify that "paste" functionality, browser password helpers, and external password managers are permitted.

- **Section:** V6 Authentication, V6.2 Password Security
- **Applicability and rationale:** Not applicable. Source Taster has no passwords: Accounts sign in with a one-time email code (ADR-0013), and Guests have no credential entry.
- **Surfaces:** -
- **Method:** code review
- **Evidence:** No password field, hash or policy exists in either program (`git grep -i password` over `apps/*/src` and `packages/*/src` finds nothing). If ADR-0013 ever adds passwords, rows V6.2.1-V6.2.8 become applicable and this note must be redone.
- **Result:** N/A
- **Findings:** None

### V6.2.8 - N/A

> Verify that the application verifies the user's password exactly as received from the user, without any modifications such as truncation or case transformation.

- **Section:** V6 Authentication, V6.2 Password Security
- **Applicability and rationale:** Not applicable. Source Taster has no passwords: Accounts sign in with a one-time email code (ADR-0013), and Guests have no credential entry.
- **Surfaces:** -
- **Method:** code review
- **Evidence:** No password field, hash or policy exists in either program (`git grep -i password` over `apps/*/src` and `packages/*/src` finds nothing). If ADR-0013 ever adds passwords, rows V6.2.1-V6.2.8 become applicable and this note must be redone.
- **Result:** N/A
- **Findings:** None

### V6.3.1 - Pass

> Verify that controls to prevent attacks such as credential stuffing and password brute force are implemented according to the application's security documentation.

- **Section:** V6 Authentication, V6.3 General Authentication Security
- **Applicability and rationale:** Applicable to the sign-in code.
- **Surfaces:** SVC (Account)
- **Method:** code review (private repository read-only)
- **Evidence:** Challenges allow at most 3 attempts (`attempts` schema max 3), expire after 5 minutes, rotate on resend, store only an HMAC-SHA256 of the code, and requests are serialized per address with an advisory lock; excess requests fail `rate-limited` (`jeffnawroth/source-taster-service` `apps/server/src/account-auth.ts`). The public API additionally applies an origin limiter before routing (`apps/server/src/abuse/origin.ts`, `abuse/limiter.ts`).
- **Result:** Pass
- **Findings:** None

### V6.3.2 - Partial

> Verify that default user accounts (e.g., "root", "admin", or "sa") are not present in the application or are disabled.

- **Section:** V6 Authentication, V6.3 General Authentication Security
- **Applicability and rationale:** Applicable. The private service has Operator accounts.
- **Surfaces:** SVC
- **Method:** code review (private repository read-only)
- **Evidence:** No seeded or default account was found in the Account sign-in path. Operator creation goes through an explicit bootstrap route (`jeffnawroth/source-taster-service` `apps/server/src/operators.ts`) that was not reviewed for one-time secret handling in this pass.
- **Result:** Partial
- **Findings:** #267

### V6.4.1 - Pass

> Verify that system generated initial passwords or activation codes are securely randomly generated, follow the existing password policy, and expire after a short period of time or after they are initially used. These initial secrets must not be permitted to become the long term password.

- **Section:** V6 Authentication, V6.4 Authentication Factor Lifecycle and Recovery
- **Applicability and rationale:** Applicable to the system-generated sign-in code (no initial passwords exist).
- **Surfaces:** SVC (Account)
- **Method:** code review (private repository read-only)
- **Evidence:** The code comes from `crypto.randomInt` (CSPRNG), is single-use (`consumed`), expires in 5 minutes and is stored only as a keyed hash (`jeffnawroth/source-taster-service` `apps/server/src/account-auth.ts`).
- **Result:** Pass
- **Findings:** None

### V6.4.2 - N/A

> Verify that password hints or knowledge-based authentication (so-called "secret questions") are not present.

- **Section:** V6 Authentication, V6.4 Authentication Factor Lifecycle and Recovery
- **Applicability and rationale:** Not applicable. There are no password hints or knowledge-based questions.
- **Surfaces:** -
- **Method:** code review
- **Evidence:** No such feature exists in either program.
- **Result:** N/A
- **Findings:** None

### V7.2.1 - Pass

> Verify that the application performs all session token verification using a trusted, backend service.

- **Section:** V7 Session Management, V7.2 Fundamental Session Management Security
- **Applicability and rationale:** Applicable.
- **Surfaces:** API, SVC
- **Method:** code review (private repository read-only)
- **Evidence:** Guest and Owner access tokens are verified by the verification program itself with the service's public keys; sessions are verified by the private service against its database. No verification trusts a client-side claim (`apps/server/src/authority/crypto.ts`, `authority/hosted.ts`).
- **Result:** Pass
- **Findings:** None

### V7.2.2 - Pass

> Verify that the application uses either self-contained or reference tokens that are dynamically generated for session management, i.e. not using static API secrets and keys.

- **Section:** V7 Session Management, V7.2 Fundamental Session Management Security
- **Applicability and rationale:** Applicable.
- **Surfaces:** API, SVC, Extension
- **Method:** code review (private repository read-only)
- **Evidence:** Tokens are generated per session or per request: a 5-minute EdDSA JWT for the API, a random session credential for Account, a random bearer credential for the Extension (ADR-0013). No static API secret authenticates a user; the only static secrets are service-to-service Ed25519 keys (`authority/crypto.ts`).
- **Result:** Pass
- **Findings:** None

### V7.2.3 - Pass

> Verify that if reference tokens are used to represent user sessions, they are unique and generated using a cryptographically secure pseudo-random number generator (CSPRNG) and possess at least 128 bits of entropy.

- **Section:** V7 Session Management, V7.2 Fundamental Session Management Security
- **Applicability and rationale:** Applicable. Account sessions and Extension credentials are reference tokens.
- **Surfaces:** SVC
- **Method:** code review (private repository read-only)
- **Evidence:** `randomBytes(32)` (256 bits) from the Node CSPRNG; only a keyed SHA-256 verifier is stored (`secretHash("session", credential)`, `jeffnawroth/source-taster-service` `apps/server/src/account-auth.ts`).
- **Result:** Pass
- **Findings:** None

### V7.2.4 - Partial

> Verify that the application generates a new session token on user authentication, including re-authentication, and terminates the current session token.

- **Section:** V7 Session Management, V7.2 Fundamental Session Management Security
- **Applicability and rationale:** Applicable.
- **Surfaces:** SVC
- **Method:** code review (private repository read-only)
- **Evidence:** Every sign-in creates a new session credential and consumes the challenge. The fresh-proof step-up (ADR-0013, 5-minute proof) is a separate challenge and does not rotate the session credential, which the requirement reads as re-authentication.
- **Result:** Partial
- **Findings:** #267

### V7.4.1 - Pass

> Verify that when session termination is triggered (such as logout or expiration), the application disallows any further use of the session. For reference tokens or stateful sessions, this means invalidating the session data at the application backend. Applications using self-contained tokens will need a solution such as maintaining a list of terminated tokens, disallowing tokens produced before a per-user date and time or rotating a per-user signing key.

- **Section:** V7 Session Management, V7.4 Session Termination
- **Applicability and rationale:** Applicable.
- **Surfaces:** SVC, API
- **Method:** code review (private repository read-only)
- **Evidence:** Sign-out and expiry set the session to revoked or past its idle and absolute limits (7 days idle, 30 days absolute), checked on every use (`jeffnawroth/source-taster-service` `apps/server/src/account-auth.ts`, session validation near the idle/absolute checks). API access tokens live 5 minutes and are rejected after `exp` (`authority/crypto.ts`).
- **Result:** Pass
- **Findings:** None

### V7.4.2 - Pass

> Verify that the application terminates all active sessions when a user account is disabled or deleted (such as an employee leaving the company).

- **Section:** V7 Session Management, V7.4 Session Termination
- **Applicability and rationale:** Applicable.
- **Surfaces:** SVC
- **Method:** code review (private repository read-only)
- **Evidence:** Blocked or deleted accounts cannot start or keep a session; deletion and restore fencing set all sessions to revoked in the same transaction (`jeffnawroth/source-taster-service` `apps/server/src/account-auth.ts`). The API consults the Account's current authority and invalidation (`authority/hosted.ts`, `verifyInvalidation`, `verifyOwnerDeletion`).
- **Result:** Pass
- **Findings:** None

### V8.1.1 - Pass

> Verify that authorization documentation defines rules for restricting function-level and data-specific access based on consumer permissions and resource attributes.

- **Section:** V8 Authorization, V8.1 Authorization Documentation
- **Applicability and rationale:** Applicable.
- **Surfaces:** API, SVC
- **Method:** code review (private repository read-only)
- **Evidence:** Rules are documented: ADR-0003 and ADR-0013 (Guest vs Owner authority), `docs/technical-concept.md` Q07, `docs/private-service-contracts.md`, and the `Permission` model in `apps/server/src/entitlements.ts`.
- **Result:** Pass
- **Findings:** None

### V8.2.1 - Pass

> Verify that the application ensures that function-level access is restricted to consumers with explicit permissions.

- **Section:** V8 Authorization, V8.2 General Authorization Design
- **Applicability and rationale:** Applicable.
- **Surfaces:** API, SVC
- **Method:** code review (private repository read-only)
- **Evidence:** Each route names its permission (`check:read`, history permissions, and so on) and calls the guard before acting (`authority/hosted.ts` `guard`, `guarded(...)` in `http/app.ts`). Operator routes need an Operator session (`jeffnawroth/source-taster-service` `apps/server/src/operators.ts`).
- **Result:** Pass
- **Findings:** None

### V8.2.2 - Pass

> Verify that the application ensures that data-specific access is restricted to consumers with explicit permissions to specific data items to mitigate insecure direct object reference (IDOR) and broken object level authorization (BOLA).

- **Section:** V8 Authorization, V8.2 General Authorization Design
- **Applicability and rationale:** Applicable. Checks, reports and history belong to a Guest or an Owner.
- **Surfaces:** API
- **Method:** code review
- **Evidence:** Resource access is scoped to the principal: the guard binds the principal to the Check, every read, stream, export and report download re-guards (`checks.publish(principal, ...)` inside the stream callbacks in `http/app.ts`), and history is bound to the Owner's authority. Another principal receives `check-not-found`.
- **Result:** Pass
- **Findings:** None

### V8.3.1 - Pass

> Verify that the application enforces authorization rules at a trusted service layer and doesn't rely on controls that an untrusted consumer could manipulate, such as client-side JavaScript.

- **Section:** V8 Authorization, V8.3 Operation Level Authorization
- **Applicability and rationale:** Applicable.
- **Surfaces:** API, SVC
- **Method:** code review (private repository read-only)
- **Evidence:** Authorization is decided server-side from verified tokens and the Account's authority; the Web and Extension carry no authorization logic that the server trusts.
- **Result:** Pass
- **Findings:** None

### V9.1.1 - Pass

> Verify that self-contained tokens are validated using their digital signature or MAC to protect against tampering before accepting the token's contents.

- **Section:** V9 Self-contained Tokens, V9.1 Token source and integrity
- **Applicability and rationale:** Applicable. Guest tokens and internal assertions are JWTs.
- **Surfaces:** API, SVC
- **Method:** code review (private repository read-only)
- **Evidence:** Signatures are verified before any claim is used (`apps/server/src/authority/crypto.ts`, `guestAccessTokens.verify`; request assertions bind `bodyHash`).
- **Result:** Pass
- **Findings:** None

### V9.1.2 - Pass

> Verify that only algorithms on an allowlist can be used to create and verify self-contained tokens, for a given context. The allowlist must include the permitted algorithms, ideally only either symmetric or asymmetric algorithms, and must not include the 'None' algorithm. If both symmetric and asymmetric must be supported, additional controls will be needed to prevent key confusion.

- **Section:** V9 Self-contained Tokens, V9.1 Token source and integrity
- **Applicability and rationale:** Applicable.
- **Surfaces:** API, SVC
- **Method:** code review (private repository read-only)
- **Evidence:** The verification header schema is `alg: z.literal("EdDSA")` only (`authority/crypto.ts`); keys must be Ed25519 (`asymmetricKeyType !== "ed25519"` throws). No `none`, no HMAC fallback.
- **Result:** Pass
- **Findings:** None

### V9.1.3 - Pass

> Verify that key material that is used to validate self-contained tokens is from trusted pre-configured sources for the token issuer, preventing attackers from specifying untrusted sources and keys. For JWTs and other JWS structures, headers such as 'jku', 'x5u', and 'jwk' must be validated against an allowlist of trusted sources.

- **Section:** V9 Self-contained Tokens, V9.1 Token source and integrity
- **Applicability and rationale:** Applicable.
- **Surfaces:** API, SVC
- **Method:** code review (private repository read-only)
- **Evidence:** Keys come from the configured service origin (`serviceOrigin/.well-known/jwks.json`) or pre-configured internal JWKS; `iss` and `aud` are fixed to the configured values. The file header states that no token chooses its JWKS URL.
- **Result:** Pass
- **Findings:** None

### V9.2.1 - Pass

> Verify that, if a validity time span is present in the token data, the token and its content are accepted only if the verification time is within this validity time span. For example, for JWTs, the claims 'nbf' and 'exp' must be verified.

- **Section:** V9 Self-contained Tokens, V9.2 Token content
- **Applicability and rationale:** Applicable.
- **Surfaces:** API, SVC
- **Method:** code review (private repository read-only)
- **Evidence:** `iat`, `nbf` and `exp` are required; the verifier checks `nbf <= now < exp` and that the lifetime equals the configured value (`authority/crypto.ts`, the lifetime check near `claims.exp - claims.iat === lifetime`).
- **Result:** Pass
- **Findings:** None

### V10.4.1 - N/A

> Verify that the authorization server validates redirect URIs based on a client-specific allowlist of pre-registered URIs using exact string comparison.

- **Section:** V10 OAuth and OIDC, V10.4 OAuth Authorization Server
- **Applicability and rationale:** Not applicable. Source Taster is not an OAuth/OIDC authorization server and uses none: Account sign-in is an email code and the Extension receives a service-issued bearer credential (ADR-0013).
- **Surfaces:** -
- **Method:** code review
- **Evidence:** No authorization endpoint, authorization code, redirect URI or refresh-token route exists in either program.
- **Result:** N/A
- **Findings:** None

### V10.4.2 - N/A

> Verify that, if the authorization server returns the authorization code in the authorization response, it can be used only once for a token request. For the second valid request with an authorization code that has already been used to issue an access token, the authorization server must reject a token request and revoke any issued tokens related to the authorization code.

- **Section:** V10 OAuth and OIDC, V10.4 OAuth Authorization Server
- **Applicability and rationale:** Not applicable. Source Taster is not an OAuth/OIDC authorization server and uses none: Account sign-in is an email code and the Extension receives a service-issued bearer credential (ADR-0013).
- **Surfaces:** -
- **Method:** code review
- **Evidence:** No authorization endpoint, authorization code, redirect URI or refresh-token route exists in either program.
- **Result:** N/A
- **Findings:** None

### V10.4.3 - N/A

> Verify that the authorization code is short-lived. The maximum lifetime can be up to 10 minutes for L1 and L2 applications and up to 1 minute for L3 applications.

- **Section:** V10 OAuth and OIDC, V10.4 OAuth Authorization Server
- **Applicability and rationale:** Not applicable. Source Taster is not an OAuth/OIDC authorization server and uses none: Account sign-in is an email code and the Extension receives a service-issued bearer credential (ADR-0013).
- **Surfaces:** -
- **Method:** code review
- **Evidence:** No authorization endpoint, authorization code, redirect URI or refresh-token route exists in either program.
- **Result:** N/A
- **Findings:** None

### V10.4.4 - N/A

> Verify that for a given client, the authorization server only allows the usage of grants that this client needs to use. Note that the grants 'token' (Implicit flow) and 'password' (Resource Owner Password Credentials flow) must no longer be used.

- **Section:** V10 OAuth and OIDC, V10.4 OAuth Authorization Server
- **Applicability and rationale:** Not applicable. Source Taster is not an OAuth/OIDC authorization server and uses none: Account sign-in is an email code and the Extension receives a service-issued bearer credential (ADR-0013).
- **Surfaces:** -
- **Method:** code review
- **Evidence:** No authorization endpoint, authorization code, redirect URI or refresh-token route exists in either program.
- **Result:** N/A
- **Findings:** None

### V10.4.5 - N/A

> Verify that the authorization server mitigates refresh token replay attacks for public clients, preferably using sender-constrained refresh tokens, i.e., Demonstrating Proof of Possession (DPoP) or Certificate-Bound Access Tokens using mutual TLS (mTLS). For L1 and L2 applications, refresh token rotation may be used. If refresh token rotation is used, the authorization server must invalidate the refresh token after usage, and revoke all refresh tokens for that authorization if an already used and invalidated refresh token is provided.

- **Section:** V10 OAuth and OIDC, V10.4 OAuth Authorization Server
- **Applicability and rationale:** Not applicable. Source Taster is not an OAuth/OIDC authorization server and uses none: Account sign-in is an email code and the Extension receives a service-issued bearer credential (ADR-0013).
- **Surfaces:** -
- **Method:** code review
- **Evidence:** No authorization endpoint, authorization code, redirect URI or refresh-token route exists in either program.
- **Result:** N/A
- **Findings:** None

### V11.3.1 - Pass

> Verify that insecure block modes (e.g., ECB) and weak padding schemes (e.g., PKCS#1 v1.5) are not used.

- **Section:** V11 Cryptography, V11.3 Encryption Algorithms
- **Applicability and rationale:** Applicable.
- **Surfaces:** API, SVC
- **Method:** code review (private repository read-only)
- **Evidence:** Only AES-256-GCM is used for encryption (`apps/server/src/checks/content.ts`; `jeffnawroth/source-taster-service` `account-auth.ts`, `dpa.ts`). No ECB, no PKCS#1 v1.5.
- **Result:** Pass
- **Findings:** None

### V11.3.2 - Pass

> Verify that only approved ciphers and modes such as AES with GCM are used.

- **Section:** V11 Cryptography, V11.3 Encryption Algorithms
- **Applicability and rationale:** Applicable.
- **Surfaces:** API, SVC
- **Method:** code review (private repository read-only)
- **Evidence:** AES-256-GCM with random 12-byte IVs and Ed25519 signatures only; `git grep` for other `createCipheriv` algorithms finds none.
- **Result:** Pass
- **Findings:** None

### V11.4.1 - Pass

> Verify that only approved hash functions are used for general cryptographic use cases, including digital signatures, HMAC, KDF, and random bit generation. Disallowed hash functions, such as MD5, must not be used for any cryptographic purpose.

- **Section:** V11 Cryptography, V11.4 Hashing and Hash-based Functions
- **Applicability and rationale:** Applicable.
- **Surfaces:** API, SVC
- **Method:** code review (private repository read-only)
- **Evidence:** Only SHA-256, HMAC-SHA256 and Ed25519 are used for hashing, MAC and signatures. One MD5 use exists in `jeffnawroth/source-taster-service` `apps/server/src/commerce/invoice-archive.ts` as the `Content-MD5` integrity header of the object-storage request; it is a transport checksum mandated by the S3 API and is not a security control. Preferring `x-amz-checksum-sha256` is tracked in #267.
- **Result:** Pass
- **Findings:** #267 (optional, informational)

### V12.1.1 - Pass, hosted evidence pending

> Verify that only the latest recommended versions of the TLS protocol are enabled, such as TLS 1.2 and TLS 1.3. The latest version of the TLS protocol must be the preferred option.

- **Section:** V12 Secure Communication, V12.1 General TLS Security Guidance
- **Applicability and rationale:** Applicable. TLS terminates at the platform edge (ADR-0012).
- **Surfaces:** API, Web, Website, SVC
- **Method:** code review (private repository read-only)
- **Evidence:** Neither program terminates TLS itself; the Scalingo edge decides protocol versions. Hosted evidence (TLS 1.2/1.3 only, 1.3 preferred) is a `hosting` gate item of #116.
- **Result:** Pass, hosted evidence pending
- **Findings:** None

### V12.2.1 - Pass, hosted evidence pending

> Verify that TLS is used for all connectivity between a client and external facing, HTTP-based services, and does not fall back to insecure or unencrypted communications.

- **Section:** V12 Secure Communication, V12.2 HTTPS Communication with External Facing Services
- **Applicability and rationale:** Applicable.
- **Surfaces:** API, Web, Website, SVC, Extension
- **Method:** code review (private repository read-only)
- **Evidence:** Account refuses to start with a non-HTTPS public origin (`jeffnawroth/source-taster-service` `apps/server/src/account-auth.ts`). HTTP-to-HTTPS behaviour of the hosted domains is a `hosting` gate item of #116, together with HSTS (#264).
- **Result:** Pass, hosted evidence pending
- **Findings:** None

### V12.2.2 - Pass, hosted evidence pending

> Verify that external facing services use publicly trusted TLS certificates.

- **Section:** V12 Secure Communication, V12.2 HTTPS Communication with External Facing Services
- **Applicability and rationale:** Applicable.
- **Surfaces:** API, Web, Website, SVC
- **Method:** code review (private repository read-only)
- **Evidence:** Certificates are issued by the platform for the custom domain. The domain does not exist yet (owner decision, #258); evidence follows with the hosted verification under #116.
- **Result:** Pass, hosted evidence pending
- **Findings:** None

### V13.4.1 - Pass, hosted evidence pending

> Verify that the application is deployed either without any source control metadata, including the .git or .svn folders, or in a way that these folders are inaccessible both externally and to the application itself.

- **Section:** V13 Configuration, V13.4 Unintended Information Leakage
- **Applicability and rationale:** Applicable.
- **Surfaces:** API, Web, Website
- **Method:** code review
- **Evidence:** Deploys build from a controlled artifact (`.github/workflows/deploy-scalingo.yml`, #116); `.git` is not part of any served directory and the static handlers serve only the built output. Hosted check that `/.git/` returns 404 is a `hosting` gate item.
- **Result:** Pass, hosted evidence pending
- **Findings:** None

### V14.2.1 - Pass

> Verify that sensitive data is only sent to the server in the HTTP message body or header fields, and that the URL and query string do not contain sensitive information, such as an API key or session token.

- **Section:** V14 Data Protection, V14.2 General Data Protection
- **Applicability and rationale:** Applicable.
- **Surfaces:** API, Web, Extension, SVC
- **Method:** code review (private repository read-only)
- **Evidence:** Credentials travel in the `Authorization` header or a host-scoped cookie, never in URLs or query strings (`git grep` for `?token=`/`access_token` finds nothing); check identifiers in URLs are random UUIDs and not secrets. The sign-in code is posted in a request body.
- **Result:** Pass
- **Findings:** None

### V14.3.1 - Partial

> Verify that authenticated data is cleared from client storage, such as the browser DOM, after the client or session is terminated. The 'Clear-Site-Data' HTTP response header field may be able to help with this but the client-side should also be able to clear up if the server connection is not available when the session is terminated.

- **Section:** V14 Data Protection, V14.3 Client-side Data Protection
- **Applicability and rationale:** Applicable. The Extension keeps its bearer credential in extension-local storage; the Web shows check results.
- **Surfaces:** Web, Extension
- **Method:** code review
- **Evidence:** The Extension restricts its storage to trusted contexts (`api.storage.local.setAccessLevel({ accessLevel: "TRUSTED_CONTEXTS" })`, `apps/extension/src/background.ts`). No test asserts that results and credential are gone after sign-out with the service unreachable.
- **Result:** Partial
- **Findings:** #267

### V15.1.1 - Pass

> Verify that application documentation defines risk based remediation time frames for 3rd party component versions with vulnerabilities and for updating libraries in general, to minimize the risk from these components.

- **Section:** V15 Secure Coding and Architecture, V15.1 Secure Coding and Architecture Documentation
- **Applicability and rationale:** Applicable.
- **Surfaces:** Repository
- **Method:** code review
- **Evidence:** ADR-0015 and `docs/dependency-policy.md` define remediation: every OSV advisory blocks the gate, critical findings block release, others need an owner, deadline and expiry; Dependabot cadence is in `.github/dependabot.yml`.
- **Result:** Pass
- **Findings:** None

### V15.2.1 - Pass

> Verify that the application only contains components which have not breached the documented update and remediation time frames.

- **Section:** V15 Secure Coding and Architecture, V15.2 Security Architecture and Dependencies
- **Applicability and rationale:** Applicable.
- **Surfaces:** Repository
- **Method:** code review
- **Evidence:** CI runs a checksum-pinned OSV-Scanner 2.7.0 over `pnpm-lock.yaml` with an independent database-freshness check (48 h ceiling); empty, stale or failed scans fail the build (`.github/workflows/ci.yml`). Semgrep CE, Gitleaks and ZAP Baseline are missing, which does not affect this row but ADR-0015's wider set (#266).
- **Result:** Pass
- **Findings:** None

### V15.3.1 - Pass

> Verify that the application only returns the required subset of fields from a data object. For example, it should not return an entire data object, as some individual fields should not be accessible to users.

- **Section:** V15 Secure Coding and Architecture, V15.3 Defensive Coding
- **Applicability and rationale:** Applicable.
- **Surfaces:** API
- **Method:** code review
- **Evidence:** Responses are built from contract schemas that list the returned fields (`packages/contract-verification`), parsed with `.parse(...)` before sending (for example `FreshProofChallengeResponse.parse` in the private service); The consent route returns a content-free summary; problem responses carry codes only, and internal errors log only `{ code: "internal" }`.
- **Result:** Pass
- **Findings:** None

## Sign-off

- Independent assessor and date: none yet. A person other than the author of the code should repeat the code review and the hosted checks before launch.
- Owner acceptance of the result and the deviations: pending. Owner-only.
- Hosted evidence (TLS, headers, cookies, isolation): collected under #116 after the domain and accounts exist (#258).
