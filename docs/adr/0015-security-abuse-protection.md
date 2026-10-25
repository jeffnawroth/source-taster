---
status: accepted
---

# Require evidenced security controls, privacy-limited abuse protection and OS-enforced document isolation

The client accepted this design on 25 October 2026 in [Security and abuse protection](https://github.com/jeffnawroth/source-taster/issues/40), through [F1–F3](https://github.com/jeffnawroth/source-taster/issues/40#issuecomment-6396198787), [F4–F6](https://github.com/jeffnawroth/source-taster/issues/40#issuecomment-6396300846), [F7–F9](https://github.com/jeffnawroth/source-taster/issues/40#issuecomment-6396321953) and [F10–F12](https://github.com/jeffnawroth/source-taster/issues/40#issuecomment-6396346870). Combine a versioned OWASP assessment, automated component/code checks, server-enforced abuse controls and a real isolation boundary for hostile documents. This costs more qualification and potentially another container, but avoids treating scanner output or a Node child process as proof of security.

The approved baseline is [requirements v3.3](../requirements-specification.md). This ADR records technical and operating policies; it does not amend that specification or introduce new specification Initial values. The [supplementary research](https://github.com/jeffnawroth/source-taster/blob/6b687bc0042022b97fe96f0705dde52e81d51755/docs/research/security-controls-tooling.md) is dated evidence, not a passed assessment or provider confirmation. Runtime implementation, provisioning, legal/privacy qualification and actual acceptance tests remain separate work.

## Assessment and release authority

Use **OWASP ASVS 5.0.0**, pinned to the [named release](https://github.com/OWASP/ASVS/releases/tag/v5.0.0_release), not a moving checklist. Its English CSV has **70 L1 rows**. The research records the release commit and asset checksum; retain version-qualified requirement IDs and OWASP attribution/license terms when deriving the assessment record.

For every L1 row, record applicability and rationale, affected surfaces, control owner, assessor/date, tested build/configuration, method, sanitized evidence, result and findings. A justified exclusion remains visible; unassessed is not passed. Cover both programs/APIs, public and private web surfaces, the extension, internal contracts, uploads, streams and downloads. Email-code sign-in does not justify excluding authentication/session controls wholesale.

The Operator owns release approval. Assess before launch and annually; security-relevant changes require retesting the affected controls in addition to the annual assessment. Preserve application-specific controls from ADR-0003/0005/0007/0013/0014 even where they exceed L1. Scanner results do not replace authorization, business-logic or configuration evidence.

- Every applicable L1 criterion and mandatory project requirement must be satisfied.
- **Critical findings always block release.** A critical finding cannot be waived by a risk acceptance.
- **High findings block when exploitable in the intended deployment.** Document severity and deployment reachability separately; an unresolved exploitability question is not evidence that a finding is safe.
- Other residual risks require a documented assessment, accountable owner, remediation deadline and review/expiry. This cannot waive an applicable criterion or must requirement. An expired disposition prevents release until resolved/reassessed.
- Missing isolation evidence, incomplete assessments or failed/incomplete required scans prevent release. No release receipt can claim success solely because a scanner returned no rows.

## Versioned security profile

Record the exact operating values, code/build and deployment enforcement in a versioned security profile before launch. Values not fixed below are qualification work, not permission to ship with missing or unbounded controls.

| Control | Accepted policy / value |
| --- | --- |
| Email code and challenge | ADR-0013: six digits, five minutes, one use, three failed entries, at least 60 s between resends; replacement invalidates the prior code |
| Address send budget | Initially at most **five code emails per address per hour**, across sign-in transactions |
| Further abuse budgets | Explicit cross-transaction guessing windows/caps, per-Guest, Account/Plan, network-origin, Guest-total and total mail limits; qualify numeric values before launch |
| Origin derivation | Trusted ingress address, truncated IP prefix and keyed hash; qualify IPv4/IPv6 prefix lengths, rotation and window behavior |
| Limiter counters | Delete within **24 hours** |
| Security-event records | Initially **30 days**, content-free and access-restricted |
| Untrusted web retrieval | HTTP/HTTPS only; at most **five redirects**, **5 MiB** response reads on the wire and after decompression; existing ADR-0007 timeouts/deadlines remain |
| Document limits | ADR-0011: **20 MiB** input, **2,000 PDF pages**, **200 MB** uncompressed DOCX, **60 s** extraction; **1,000 References** counted after Structuring |
| Parser resources | Explicit OS-enforced memory/CPU/concurrency and bounded input/output/cleanup; exact deployment values require measurement |
| Assessment and dependency cadence | Annual ASVS assessment plus affected-control retests; dependency scans on changes and **daily** for all still-deployed versions |

Do not silently reinterpret the existing 200 MB expansion limit as MiB or reduce mandatory file acceptance to fit an undersized container. Qualify limits against abuse, normal shared-network use, the preserved structuring-time targets and the live fifty-Check acceptance protocol. Settings capable of changing evidence, failure classification or Verdicts are also part of the exact Measured configuration under ADR-0006/0007. Calling a setting operational does not exempt it.

## Sign-in and Guest abuse controls

Keep PostgreSQL-backed limits at both API entrances under [ADR-0003](0003-system-architecture.md). Counters and atomic decisions must combine across instances/entrances where the budget is shared; a new Guest ID or sign-in transaction must not reset its network/aggregate allowance. Limits on requests, paid Quota and upstream Data source budgets are distinct.

Bound guessing across replacement challenges, code-send attempts and origins, not just three entries on one challenge. Prove concurrent attempts/resends, mail failures and delayed/superseded codes cannot bypass the limits or issue duplicate authority. The address budget does not replace network/global mail controls. Return uniform Account-existence-neutral responses; do not expose existence through differing response data or obvious processing paths. Existing sessions must not be revoked by someone else's bad code attempts; do not permanently suspend an Account because an attacker exhausts a login budget.

Over-limit requests receive the existing `429`/Problem Details/`Retry-After` behavior with a comprehensible continuation time. A shared university/company network alone is not proof that its Accounts are abusive. Prove fair handling and recovery from temporary throttling; no fingerprinting is introduced. CAPTCHA/human-use challenges, disposable-email rejection and anomaly-report features retain their deferred triggers and FA-EIN-02 reassessment.

“Network origin” means the hashed, truncated IP-prefix concept from ADR-0003, not the HTTP `Origin` header. Accept forwarded addresses only through a verified provider/proxy trust chain; client-supplied forwarding headers are not authority. Use a keyed hash with regularly rotated secrets; document the key/window transition so rotation does not erase still-live budgets or extend counter retention. Store no plain IP addresses. Verify provider-side access logs and error/telemetry defaults as well as application logs during the data-location/minimization review.

## Browser, extension and authorization boundaries

Use explicit allowed web origins, qualified extension access, CSRF protection for browser credential flows and a restrictive Content Security Policy. Qualify exact cookie/SameSite/CORS/credential/trusted-origin settings in the actual deployment and supported browsers; neither wildcard credential sharing nor an arbitrary extension-origin claim grants access. Origin checks do not replace current authentication, named permissions and Owner checks. Do not solve Firefox/Chromium differences by trusting a caller-provided extension ID.

All document text, Candidate metadata and AI output are untrusted data. Render through safe text/validated formatting, never unchecked HTML or executable content. Keep extension code/assets bundled and credentials out of ordinary pages/content scripts, sync, URLs and diagnostics. Constrain extension messages to expected senders, schemas, operations and targets; the privileged side must not become a general credential-bearing fetch proxy for a page.

Preserve [ADR-0013](0013-authentication-roles.md): five-minute API tokens in memory, protected web cookie/separate extension-local session credential, 30-day absolute/seven-day idle session bounds and current service authorization beyond JWT validity. Check protected reads, SSE output/replay, downloads and worker dispatch/commit against current authority. Unknown/revoked state denies access; current Owner checks and deletion/cancellation serialization remain mandatory. A fresh origin check does not revive an expired/revoked token.

The assessment explicitly exercises Owner/Account substitution, stale role/token claims, credential renewal/logout races, stream replay after revocation, queued/in-flight work, deletion/restore and partial service outages. Include ADR-0014's one-time bootstrap/replay protection, fresh-proof critical actions, idempotent operations, recipient-only exports and blocked/deleted-recipient purpose limits. Operator authority never becomes general permission to read verification content.

## Untrusted document execution boundary

PDF/DOCX extraction uses the existing open-program extraction port, PDF.js and owned JSZip/saxes adapter, without OCR, external converters or another-language runtime. Uploads still enter only the verification program, abort oversized reads, use its temporary persistence and follow ADR-0003/0005 deletion. No private backend or third-party content-scanning service receives the document.

Require an **OS-enforced restricted execution boundary**. A compromised parser must not obtain database credentials/access, service keys or unrestricted network access. A Node child process, worker thread, heap flag or Permission Model alone is not that boundary. The trusted verification-side supervisor retains authorization, persistence, queue and Data source/AI duties; pass only the bounded task input and validate the bounded extraction response. Keep secrets, inherited environment/files/descriptors and content-bearing diagnostics out of the parser boundary.

Prove actual enforcement of privileges, filesystem/process access, network policy and resource limits in the selected host. Enforce expanded DOCX bytes while extracting, rather than trusting archive metadata or checking after unlimited expansion. Bound real memory/output/concurrency as well as elapsed time; confirm forced termination, descendants, cancellation, deletion and late-output cleanup. Aborting extraction is a distinct error, not a successful empty bibliography or a PDF-without-text counter.

**Explicit refinement of ADR-0012:** its web and queue-worker roles may remain colocated in the small stage, but their original single process/container description is not a complete security topology for document processing. An additional restricted execution area/container may be mandatory from launch, rather than waiting for revenue/capacity triggers. The client accepted the possible extra cost under the existing **€650/month infrastructure ceiling**. The original €50–80 estimate does not establish the price of a qualified isolated layout.

Scalingo's published container isolation does not prove the required per-parser controls. Obtain provider-supported capability evidence and deployment tests; merely adding another same-privilege process/container with secrets or open networking is insufficient. If the selected placement cannot enforce the boundary or meet capacity/cost targets, return the concrete architecture/hosting choice to the client before launch. No unproven sandbox, provider switch or weakened isolation is approved by this ADR.

## Untrusted web retrieval

Refine [ADR-0007](0007-search-strategy-latency.md) with the profile's five-redirect and 5 MiB response ceilings. Bound streaming reads both before and after decompression and keep the existing five-second URL request timeout and thirty-second Reference deadline; redirects/retries do not reset the Reference clock. Qualify the complete redirect/connection timing and total resource behavior rather than assuming a per-hop limit alone bounds a route.

For arbitrary cited URLs/redirects, permit only HTTP/HTTPS, send no ambient credentials and reject embedded credential forwarding. Validate destinations for every connection and redirect, including all resolved address forms; exclude private, loopback, link-local and infrastructure/metadata destinations and defend against DNS rebinding and mixed public/private answers. The address actually connected to must satisfy the check, not only an earlier DNS response. Credentials for named responsible Data source adapters retain their separate trusted-provider scope and must never follow an arbitrary redirect.

Preserve ADR-0008's URL/archive/DOI/coverage precedence and strict early termination. A safety refusal, oversized response, exhausted redirect budget or incomplete request is not successful negative evidence. Record the limitation in Check evidence and apply the existing incomplete-verification/Not verifiable rules; do not turn it into Not found or invent a new Verdict. Internal execution faults remain Status failed. No new source is queried after an unambiguous match just to compensate for these limits.

## Automated checks and evidence storage

Run in GitHub Actions under ADR-0012 using authorized synthetic/test material, never customer documents, production traffic, exports or secrets. Keep private evaluation material and sensitive sanitized findings restricted. Pin and review tool binaries, actions and rule sets independently of runtime-library licenses; no additional analysis SaaS or paid private GitHub Security product is selected.

| Tool | Purpose and required qualification |
| --- | --- |
| Dependabot | Existing dependency alerts/update policy; prove actual update behavior on the selected pnpm workspace, not only lockfile recognition |
| OSV-Scanner | Local advisory matching against a separately refreshed database; use the qualified fully offline scan mode, record database freshness and reconcile direct/transitive inventory coverage |
| Semgrep CE | Selected license-reviewed local rules; disable unintended telemetry/cloud integration and qualify actual TypeScript/framework coverage |
| Gitleaks CLI | Redacted secret scanning, including relevant history; qualify maintenance and exact CLI license separately from any action wrapper |
| ZAP Baseline | Passive web checks on a disposable synthetic-data deployment; it is not an active attack suite, extension test or full authorization assessment |

Scan dependencies on PR/change/release and daily against every active deployed program version. Preserve deployment-to-lockfile/inventory provenance so a clean default branch cannot hide a vulnerable running release. Keep build/test dependencies distinguishable from runtime components without silently excluding them; runtime/base-image components need their own inventory/provider evidence. Qualify pnpm 12 direct/transitive/peer/override/private-package handling and Dependabot's documented support gap before relying on it. No silent downgrade of the accepted toolchain is authorized.

Record successful runs, scan scope, tool/rule/advisory versions, errors/skipped inventory, findings and triage. A stale/missing advisory database, unsupported lockfile, empty inventory or failed scheduled job is not a pass. Include alert ownership and overdue/missing-run detection in the profile; configuring a GitHub schedule is not evidence that it ran. Exact freshness tolerances are qualified profile values, not invented guarantees here. OSV offline matching does not make GitHub-hosted Dependabot offline.

The assessment must still demonstrate cross-Owner authorization, OTP/CSRF/session controls, SSRF, hostile-file limits and race handling with targeted tests and configuration/code review. No scanner's unsupported language path or missing authenticated surface can be declared a justified ASVS exclusion solely to obtain a green report.

## Security records and incidents

Retain content-free security events for **30 days** with operational access controls; use allow-listed event codes, IDs, time, outcome and minimized network/rate context. No request bodies, document/Reference text, filenames, search queries, codes, tokens, keys or full IP addresses. Limiter counters remain a separate **24-hour maximum**, not reconstructed indefinitely from security logs. Security processing is not permission to collect unconsented product analytics.

Keep ADR-0014's **12-month** general administrative audit and separate financial retention schedules distinct. Incident evidence retained beyond ordinary expiry needs a specific purpose, authorized access, documented reason and bounded expiry/review. This never extends verification-content deletion or authorizes recovering erased content from backups. Legal/privacy qualification must confirm the final retention allocation and provider/log/support data map before launch.

The Operator and named deputy use a short runbook: identify affected scope, pause those functions where necessary, revoke compromised sessions/keys, preserve minimized evidence, investigate and remediate, retest and authorize re-enablement. Maintain current measured-configuration eligibility, cancellation/reservation/billing and deletion rules. Do not pause the statutory sign-in-independent cancellation route merely because new purchases are paused. Assess statutory notification duties explicitly rather than assuming a technical fix ends the incident.

A security incident fires the existing FA-UEB-48 independent-test trigger for reassessment under FA-EIN-02; it is neither silently waived nor treated as already performed. Product MFA and other deferred safeguards retain their specified triggers; if the assessment recommends MFA, return it for client reassessment. Mailbox-control and extension-local-storage risks from ADR-0013 stay explicit.

## Launch evidence and consequences

Release requires the completed ASVS record and current security profile, successful qualified scans with current inventories, no critical/exploitable-high findings, valid residual-risk dispositions and deployment-specific proof. In particular:

- Exercise concurrent/replaced/replayed codes, cross-transaction guessing/send limits, new Guest IDs, spoofed proxy headers, prefix/key rotation and shared-network use without permanent Account suspension.
- Prove OS-enforced parser restrictions, real expanded-byte/memory/concurrency ceilings, hostile-file termination and no database/key/network escape; measure normal extraction and live fifty-Check performance with that topology.
- Exercise public-to-private redirects, DNS changes, alternate IP forms, oversized/compressed responses, cancellation and incomplete evidence without false Not found results.
- Demonstrate exact-origin/CSRF/CSP/message restrictions, native supported browser/extension behavior, current permissions and Owner isolation through reads/streams/downloads and destructive races.
- Test scanner inventory/compatibility/failure paths, scans of an unchanged deployed version, missed-run alerts and sanitized evidence access/expiry; a deliberately failing test control must not be reported passed.
- Demonstrate bootstrap, deputy recovery, export-recipient purpose checks, incident pause/revocation/retest and retention/deletion without creating a content archive.

These are required evidence, not completed checks or an implementation backlog. Stronger release rules and parser isolation are accepted technical policies; the approved requirements and other legal/tax amendment candidates remain unchanged. The extra runtime topology, provider capabilities, price, exact security-profile values and live performance still need qualification. If that evidence exposes a new design trade-off, reopen it explicitly rather than silently relaxing the accepted boundary.

## Rejected alternatives

- Scanner output alone as the ASVS assessment, or default-branch/PR-only scans as ongoing coverage of all deployed versions.
- Node threads/child processes/Permission Model alone as an adversarial parser sandbox.
- Disclosing customer documents to malware/scanning SaaS or letting arbitrary URLs borrow Data source credentials.
- Permanent Account suspension based only on a shared network, fingerprinting or silently pulling deferred challenges/features into launch.
- Keeping security events forever, reusing them as product analytics or waiving critical findings through an exception.
