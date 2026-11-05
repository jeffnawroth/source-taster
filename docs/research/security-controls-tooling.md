# Security controls and tooling: supplementary evidence for decision #40

Retrieved **2026-10-25**. English research artifact; planning only. **Verified** means supported by the cited primary source, not tested in Source Taster. **Proposed/inferred** means engineering advice requiring qualification and, where applicable, client decision. **Unknown/untested** is explicit below. No application implementation, provisioning, assessment, client approval or passed security gate is claimed.

## Project baseline and scope

- Parent baseline: `bf6b3fd229602e867223497d6378258fead6f338`; requirements **v3.3**, FA-UEB-46 and acceptance section 16 govern. [P1]
- Read ADR-0002/0003/0007/0011/0012/0013/0014. Dependabot, OSV-Scanner and a separately chosen license scanner are already accepted; this research does not replace that policy. [P2]
- Decision #40's accepted F1 requires every applicable ASVS L1 criterion; critical findings block release, as do high findings exploitable in the intended deployment. Other residual risks need assessment, accountable owner and deadline; this cannot waive a mandatory criterion. The assessment remains unperformed. [P3]
- Preserve ADR-0011's **20 MiB (20,971,520 bytes) file**, **2,000 PDF pages**, **200 MB uncompressed DOCX content**, **60 s extraction** and post-Structuring **1,000 References** limits. “200 MB” is not reinterpreted as MiB here. [P2]
- ADR-0012's start stage is **one container per program, with web and worker roles in one process**. ADR-0003's eventual separate entrypoints do not mean that isolation already exists. [P2]
- No customer documents, References, History, production exports, credentials or captured production traffic belong in CI or third-party scanner inputs. Use authorized test material only; private Development documents remain subject to their existing access restrictions. [P2]

## 1. ASVS edition, applicability and evidence

**Verified:** OWASP's project README names **5.0.0, May 2025** as its latest stable edition. The named release was published 2025-05-30. `master` is explicitly bleeding edge; the moving `latest` release is therefore unsuitable as an assessment pin, even though GitHub labels it non-prerelease. No later stable edition was demonstrated by these sources. [A1–A2]

Use the English CSV attached to **`v5.0.0_release`**, not a 4.0.3 checklist or an unversioned website export. The tag resolved to commit `5cf9b032440be53ce345ab3c130fda46ba1ce7a2`. OWASP licenses the content CC BY-SA 4.0; preserve attribution/license obligations when deriving a checklist. [A1–A3]

**Derived from the retrieved release asset:** CSV has 345 requirement rows: 70 with `L=1`, 183 with `L=2`, 92 with `L=3`. Its SHA-256 is `6124dba176dc563f66363a11ae0c47f9b86b8a4a84c66a793670bd196ed86cd5`. Reproduce the L1 checklist by selecting **all 70 rows whose `L` equals `1`**, retaining the original text. This is a reproducible checklist basis, not 70 passed controls. [A3]

**Proposed evidence model:** one record per selected row, including non-applicable rows:

- Versioned ID, e.g. `v5.0.0-5.2.1`; original requirement text and pinned checklist checksum. OWASP recommends version-qualified identifiers because IDs can change. [A1]
- Affected program/surface, requirement/ADR mapping, applicability (`applicable` or `not applicable`) and specific rationale; reviewer and date.
- Control owner, implementation/configuration reference, tested commit/build/deployment, environment and relevant tool/rules/database versions.
- Verification method and reproducible procedure; expected/observed outcome; sanitized evidence link; result (`not assessed`, `pass`, `fail`). An untested row stays unassessed.
- Findings and deployment exploitability assessment, remediation owner/deadline, retest evidence and assessor/release decision. Keep severity disposition separate from criterion fulfilment.

**Verified:** OWASP asks reports to identify scope, requirements checked, exceptions, exclusion rationale and methods. Code, configuration, documentation and developer access may be necessary even at L1. Off-the-shelf SAST/DAST cannot fully verify business logic or access control. OWASP does not certify applications or assessors. [A4–A5]

**Applicability proposal for this architecture:** cover both APIs, private service/UI, web app, extension, internal contracts, uploads and generated downloads. Distinguish application checks from the separate hosting/restore/CI evidence; an ASVS exclusion does not cancel an existing project requirement. [A5, P2]

- User-password requirements can have a justified non-applicability finding for the email-code design; do not exclude authentication, session or authorization chapters wholesale. Assess actual setup/recovery credentials too.
- Future federation and unused protocols need individual scope rationales; the Operator bootstrap, fresh proof and recipient-only export are in launch scope. [P2]
- Record coverage for OTP guessing/send-volume/enumeration, cookie/CORS/CSRF, extension credential storage, current authorization beyond JWT validity, cross-Owner access and SSE/worker/delete/restore races. These accepted controls remain necessary even where stricter than L1. [P2–P3]
- Assess uploads and SSRF with application-specific adversarial fixtures and code/configuration review. Preserve ADR-0007's resolved-address/redirect/DNS-rebinding checks, destination exclusions, bounded response/time and no credentials. A green scanner report is not this evidence. [P2, A4]

**Planning consequence:** pinning 5.0.0 is the supported recommendation for the still-open edition choice, not a client decision. An annual assessment plus change-triggered retests and continuous dependency checks are distinct activities; FA-UEB-48's independent-test trigger stays separate. [P1–P3]

## 2. Accepted dependency policy: coverage and ongoing scans

**Verified:** GitHub's dependency graph lists `pnpm-lock.yaml` with static direct/transitive coverage. Dependabot's update ecosystem is `npm`; its separate compatibility table currently lists **pnpm 7, 8, 9 and 10**, not ADR-0002's pnpm 12. Graph recognition, vulnerable-version alerts and successful remediation PRs are different capabilities. [D1–D2]

GitHub documents npm remediation that may update parent dependencies to remove vulnerable subdependencies. This is not proof of every pnpm 12 workspace/peer/override/private-registry case. Dependabot may need access to private dependency sources to resolve an update. [D2–D3]

**Verified:** OSV-Scanner lists `pnpm-lock.yaml` as supported and recommends resolved lockfiles over version-range manifests. Its current OSV-Scalibr extractor enumerates the lockfile's `packages` map, extracting package/version identities, including scoped packages and lockfile-version-specific forms. It is not limited to root `package.json` direct dependencies. Entries without an extractable name/version can be skipped. [D4–D5]

**Inferred coverage boundary:** transitive registry packages recorded there are candidates for advisory matching; local workspace code, omitted/bundled dependencies, custom tarballs/git identities, aliases and patched packages need inventory reconciliation. A supported filename is not proof of complete pnpm 12 coverage or proof that production contains exactly that inventory. The inspected extractor commit is source evidence, not a qualified scanner release. [D4–D5]

**Untested qualification:** pin actual pnpm/Node/scanner releases; compare recognized package identities with the installed workspace, covering a direct and nested vulnerable dependency, peer variants, overrides, optional/dev dependencies, local packages and private dependencies. Record parser errors/skipped entries and known coverage gaps. Keep production/runtime and build/test findings distinguishable; neither class gets silently omitted.

### Unchanged deployments and new advisories

- **Verified:** Dependabot alerts react to new GitHub advisories and dependency-graph changes on the **default branch**. OSV's PR workflow reports newly introduced vulnerabilities; its full workflow supports scheduled scans. A PR-only workflow does not provide the same ongoing coverage. [D6–D7]
- **Proposed:** scan on PR/push/release, plus a **daily full scan** as an initial cadence for decision, with recorded successful-run time and alert ownership. Rescan the exact immutable lockfile/SBOM for **every active deployed release of both programs**, including rollback versions still eligible for activation, against fresh advisory data even when no code changes.
- Default-branch scans alone miss an older deployed dependency set. Preserve deployment-to-commit/inventory provenance; include runtime/base-image components through provider evidence or an appropriate artifact inventory, not a claim that the pnpm lockfile covers Node or the OS.
- **Verified operational caveat:** GitHub scheduled workflows use the latest default-branch commit; jobs can be delayed/dropped under load, and public-repository schedules disable after 60 days without activity. **Proposed:** make the workflow explicitly load deployed inventories and detect stale/missing runs; “cron configured” is not continuous-scanning evidence. [D8]
- Preserve the accepted critical/exploitable-high release rule; distinguish scanner operational failure, an empty inventory, unresolved findings and a completed clean scan. Scanner failure or unsupported lockfile is not success. [P3]

### Remote lookup disclosures and local alternatives

**Verified:** OSV API queries identify packages by **name + ecosystem + version**, or PURL, or commit hash; Git queries can identify repository URLs/tags. Batch queries contain multiple such records. Consequently a remote lookup discloses queried software identities/versions (and applicable commit identities), even without uploading source files or the complete lockfile. [D9]

**Inferred privacy implication:** dependency names can reveal private package/project information; the remote endpoint necessarily sees connection/request metadata. API shape is not a retention, EU-location or contractual assurance. Do not send customer verification content; explicitly scoped lockfile inputs are preferable to an uncontrolled recursive production-data directory scan. Exact outgoing requests remain untested.

**Verified:** OSV `--offline` uses a previously downloaded local advisory database and promises no project/dependency information is sent; it needs no network and errors if the database is missing. `--offline-vulnerabilities` only localizes vulnerability lookup; other features may still use the network. Commit-level scanning is not supported offline. Database refresh is separate and freshness must be recorded. [D10]

**Proposed options:** (a) explicit lockfile lookup against OSV with documented metadata disclosure, or (b) refresh the public npm database separately and scan locally with `--offline`. Package/ecosystem-level database downloads still contact the database host. This does not provide an offline equivalent of GitHub-hosted Dependabot updates/alerts. [D2, D10]

**Verified cost/license caveats:** OSV-Scanner is Apache-2.0; basic Dependabot alerts apply to user-owned and organization-owned repositories. OSV's reusable action defaults to uploading SARIF but supports `upload-sarif: false`. Private GitHub code-scanning storage is subject to Code Security licensing, distinct from running a scanner CLI and retaining restricted CI artifacts. [D6–D7, T1, T8]

## 3. Conditional complementary shortlist — not a client selection

These complement dependency scanning and assessment. Pin exact binaries/actions/rules, review their licenses independently of application dependencies, and verify findings on the accepted TypeScript/Node stack before adoption. No future compiler/framework compatibility is asserted.

**SAST: choose one initially, conditional on cost and acceptable coverage.**

- **CodeQL** if GitHub integration and its query/dataflow coverage justify the cost. Official support includes JavaScript/TypeScript; the retrieved table lists TypeScript **2.6–7.0**, but that is not a Source Taster qualification result or a promise about 7.1/Hono/Better Auth. CodeQL CLI has its own restrictive terms, not an ordinary permissive OSS license. Public GitHub analysis is free within those terms; proprietary private-repository use requires the appropriate paid entitlement. [T2–T4]
- **Semgrep CE CLI** if local, low-overhead rules with narrower analysis are acceptable. The engine is LGPL-2.1; Semgrep-maintained rules use the separate **Semgrep Rules License 1.0**, permitting internal business use with competitive-product restrictions. Third-party rule licenses vary. CE is not equivalent to paid cross-file analysis; inspect TypeScript syntax/rule coverage on the pinned release. Local rules and `--metrics off` allow avoiding the documented metrics transmission; cloud login/products introduce separate terms/data handling. [T5–T6]

**Secrets: Gitleaks CLI** is a modest local option (MIT), including Git history and files; use redacted reports and revoke/rotate a discovered secret rather than merely deleting the line. Its maintainer now describes it as feature-complete with security patches only: reassess maintenance before adoption. The separate `gitleaks-action` wrapper has a different license and requires an organization license key (its README currently calls the key free); direct CLI execution avoids assuming the action has the CLI's MIT terms. [T7]

**DAST: ZAP Baseline** against a disposable, synthetic-data deployment. ZAP is Apache-2.0. Baseline runs a spider followed by passive scanning, **not active attack scanning**, and reports warnings by default; scoped rules determine failures. Docker image/Java/Python scanner tooling belongs to CI, not a new production parser runtime. Authenticate explicitly for protected surfaces; SPA/extension, business-logic and Owner-isolation coverage still require application-specific tests. Active API/DAST expansion would need a separately scoped plan. [T9]

**GitHub private cost checkpoint:** official list prices retrieved today are **Code Security USD 30** and **Secret Protection USD 19 per active committer/month**. Billing docs require Team/Enterprise for these paid products and count activity over 90 days. Public repositories receive relevant features free; verify account/repository eligibility and current quote before selecting private-service coverage. Running a free CLI does not confer a free private Security-tab entitlement. [T1]

**Recommendation for the planning conversation:** retain Dependabot + OSV; qualify one SAST option, local secret scanning and passive ZAP on synthetic environments. Decide private-repository budget, license acceptability and evidence storage first. Do not add SaaS upload or AI scanning by implication, or treat any shortlist item as approved/provisioned.

## 4. Untrusted extraction: execution versus security boundaries

**Verified Node boundaries:**

- A **worker thread** executes JavaScript in the same process; memory can be shared/transferred. `resourceLimits` constrain the JS engine, not external data such as ArrayBuffers; a global out-of-memory condition can still abort the process. Therefore a worker is useful for scheduling/termination, not an OS security boundary. [N1]
- A **Node child process** has separate memory/V8 and IPC. It can keep parser CPU/blocking work off the parent event loop and permit independent termination. It defaults to the parent's environment; `uid`/`gid` options exist, but require OS permissions. A child alone does not establish a separate user, filesystem, network namespace or cgroup. [N2]
- The **Node Permission Model is explicitly not a sandbox against malicious code**: Node calls it a “seat belt” for trusted code and says malicious code can bypass it. Stable status does not change that threat model. Retrieved Node 24 documentation does not list network access among its restricted permissions, whereas Node 26 documents network controls: qualify the exact release/fallback rather than copying flags between them. Neither is a hard isolation guarantee. [N3]

**Verified parser caveats:** PDF.js's inspected source explicitly force-disables its own workers in Node; a `PDFWorker` abstraction is not proof of a real Node worker thread or child process. This is a source snapshot, not compatibility proof for the future pinned `pdfjs-dist`. JSZip's asynchronous full-result APIs retain results in memory; “async” does not establish an expansion/RSS limit. `saxes` documents no limit on chunks delivered to event handlers and warns not to trust parsing events after errors. [N4–N6]

**Proposed extraction seam, untested:** run only the PDF.js/JSZip/saxes adapter in a bounded asynchronous Node child, with an owned IPC protocol for input bytes and extracted text/structure. Parent retains authorization, queue, persistence and external Data source/AI access. Do not pass database/service/API keys; launch without a shell, explicit arguments, minimal environment and narrowly controlled file descriptors. Validate IPC messages/output size and reject content-bearing diagnostics. These measures reduce accidental exposure; same-UID compromise may still reach sibling processes/resources. [N2–N3, P2]

Enforce existing ceilings on **actual** input/pages/decompressed bytes and parent-observed elapsed time; archive metadata alone cannot prove expansion stays within 200 MB. Avoid first materializing an unlimited expansion and checking afterwards. A responsive parent can enforce the existing 60 s deadline and confirm termination/cleanup; test forced kill, descendant cleanup, malformed files and cancellation/deletion/late-result races. A V8 heap flag is not a process RSS cap. Concurrency/output/memory budgets require measurement and decision; none is invented here. [N1–N2, N5–N6, P2]

**What changes at the start stage (inferred):** the program gains a parser subprocess and supervision/IPC while web+queue worker remain together in their existing parent process/container. This is neither ADR-0012's target-stage web/worker split nor a separate parser host. It adds startup, memory/copying and PID pressure. It may contain ordinary parser crashes and keep the web event loop responsive, but shared container OOM/CPU exhaustion, same-user privileges and platform restart can still affect the parent. Rerun extraction p95, live 50-Check, cancellation and recovery evidence; do not call the proposed seam proven isolation. [P2, N1–N2]

### Scalingo: public facts versus unanswered host questions

**Verified public documentation:** application containers are isolated from other containers/the host; Scalingo publishes **container-level** memory, CPU priority, PID and file-descriptor limits. For example, M lists 512 MB memory and 256 PIDs; this example does not select a Source Taster size. PID is explicitly the maximum number of processes the container can spawn. CPU priority is a share under contention, not a parser-specific CPU budget. [H1–H2]

Scalingo documents outbound egress and a **20 MB/s per-container bandwidth limit**, not a parser-specific deny-all policy. Platform firewalls/DDoS measures do not demonstrate per-child egress restriction or application-level Guest abuse protection. During container replacement, the started process gets SIGTERM, then SIGKILL after 30 s if still alive. Child lifecycle/signal propagation needs testing. [H3–H5]

**Unknown from the reviewed public pages:** permitted child-process privileges and hard per-child memory/CPU enforcement; ability to create users/namespaces/cgroups, install seccomp/AppArmor profiles, use capabilities or enforce a child-only network denial. No provider confirmation or Scalingo execution probe was performed. Published PID capacity supports the existence of subprocesses generally, **not** approval of the proposed sandbox mechanism. Do not assume root, nested containers or per-parser OS sandbox support. [H1–H5]

**Conditional conclusion:** a supervised child is a candidate scheduling/fault-containment improvement. A hard boundary against a compromised parser needs separately enforced OS/container privileges, filesystem, network and resource isolation. Ask Scalingo to confirm supported controls and then demonstrate them. If unavailable, return the architecture/hosting trade-off to the client; do not silently change hosts, add a parser service or weaken the accepted limits. [N1–N3, H1–H5, P2]

## Questions for the driving planning decision

1. Adopt ASVS **5.0.0** as the assessment pin, and who owns applicability, evidence review, severity/exploitability triage and annual/change retests?
2. How will pnpm 12 dependency inventories and actual Dependabot remediation be qualified against the documented support gap without silently changing ADR-0002?
3. Approve which remote package-metadata disclosures, or require fully offline OSV matching? Who refreshes databases and detects overdue scans of every active deployed release?
4. Which single SAST option/private-GitHub budget and scanner/rule licenses are acceptable? Where will restricted, sanitized findings live?
5. Is supervised parser fault containment sufficient for the assessed threat, or is an OS-enforced boundary required? Which exact controls will Scalingo confirm and a deployment test prove?
6. Who will qualify resource/concurrency/termination behavior at the preserved limits and start-stage load, including the same-UID, container-OOM and network-access residual risks?

## Primary sources

All sources below were retrieved **2026-10-25**; mutable documentation describes only that retrieval. Source inspection and CSV counting are the only derived checks performed; no product/toolchain/security tests were run.

- **P1:** [Approved requirements v3.3, immutable baseline](https://github.com/jeffnawroth/source-taster/blob/bf6b3fd229602e867223497d6378258fead6f338/docs/requirements-specification.md).
- **P2:** Accepted ADRs at that baseline: [0002](https://github.com/jeffnawroth/source-taster/blob/bf6b3fd229602e867223497d6378258fead6f338/docs/adr/0002-tech-stack.md), [0003](https://github.com/jeffnawroth/source-taster/blob/bf6b3fd229602e867223497d6378258fead6f338/docs/adr/0003-system-architecture.md), [0007](https://github.com/jeffnawroth/source-taster/blob/bf6b3fd229602e867223497d6378258fead6f338/docs/adr/0007-search-strategy-latency.md), [0011](https://github.com/jeffnawroth/source-taster/blob/bf6b3fd229602e867223497d6378258fead6f338/docs/adr/0011-non-ai-structuring.md), [0012](https://github.com/jeffnawroth/source-taster/blob/bf6b3fd229602e867223497d6378258fead6f338/docs/adr/0012-hosting-operations.md), [0013](https://github.com/jeffnawroth/source-taster/blob/bf6b3fd229602e867223497d6378258fead6f338/docs/adr/0013-authentication-roles.md), [0014](https://github.com/jeffnawroth/source-taster/blob/bf6b3fd229602e867223497d6378258fead6f338/docs/adr/0014-operator-administration.md).
- **P3:** [Decision #40](https://github.com/jeffnawroth/source-taster/issues/40), [accepted F1–F3](https://github.com/jeffnawroth/source-taster/issues/40#issuecomment-6396198787).
- **A1:** [OWASP ASVS: latest stable edition and requirement identifiers](https://github.com/OWASP/ASVS/blob/master/README.md).
- **A2:** [Named 5.0.0 release](https://github.com/OWASP/ASVS/releases/tag/v5.0.0_release), [release list](https://api.github.com/repos/OWASP/ASVS/releases), [tag resolution](https://api.github.com/repos/OWASP/ASVS/git/ref/tags/v5.0.0_release).
- **A3:** [Official version-pinned English CSV](https://github.com/OWASP/ASVS/releases/download/v5.0.0_release/OWASP_Application_Security_Verification_Standard_5.0.0_en.csv).
- **A4:** [ASVS 5.0.0 assessment/reporting/automation](https://github.com/OWASP/ASVS/blob/5cf9b032440be53ce345ab3c130fda46ba1ce7a2/5.0/en/0x04-Assessment_and_Certification.md).
- **A5:** [ASVS 5.0.0 scope, levels and tailoring](https://github.com/OWASP/ASVS/blob/5cf9b032440be53ce345ab3c130fda46ba1ce7a2/5.0/en/0x03-What-is-the-ASVS.md).
- **D1:** [GitHub dependency-graph ecosystem/transitive support](https://docs.github.com/en/code-security/reference/supply-chain-security/dependency-graph-supported-package-ecosystems).
- **D2:** [Dependabot supported ecosystems/versions/private sources](https://docs.github.com/en/code-security/reference/supply-chain-security/supported-ecosystems-and-repositories).
- **D3:** [Dependabot security-update remediation](https://docs.github.com/en/code-security/concepts/supply-chain-security/dependabot-security-updates).
- **D4:** [OSV-Scanner supported lockfiles and inventory limitations](https://google.github.io/osv-scanner/supported-languages-and-lockfiles/), [source scanning](https://google.github.io/osv-scanner/usage/scan-source).
- **D5:** [OSV-Scalibr pnpm extractor, inspected commit](https://github.com/google/osv-scalibr/blob/4fcac7e65177879cd6e1afbcbec7bd1239aecf69/extractor/filesystem/language/javascript/pnpmlock/pnpmlock.go).
- **D6:** [Dependabot alert triggers and availability](https://docs.github.com/en/code-security/concepts/supply-chain-security/about-dependabot-alerts).
- **D7:** [OSV GitHub workflows, schedules and SARIF controls](https://google.github.io/osv-scanner/github-action/).
- **D8:** [GitHub scheduled-workflow limitations](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule).
- **D9:** [OSV query parameters](https://google.github.io/osv.dev/post-v1-query/), [batch query](https://google.github.io/osv.dev/post-v1-querybatch/).
- **D10:** [OSV offline modes, download and limitations](https://google.github.io/osv-scanner/usage/offline-mode/).
- **T1:** [GitHub security product prices](https://github.com/security/advanced-security), [license billing/eligibility](https://docs.github.com/en/billing/concepts/product-billing/github-advanced-security).
- **T2:** [CodeQL languages](https://docs.github.com/en/code-security/concepts/code-scanning/codeql/codeql-code-scanning).
- **T3:** [CodeQL language/version coverage](https://codeql.github.com/docs/codeql-overview/supported-languages-and-frameworks/).
- **T4:** [CodeQL CLI terms](https://github.com/github/codeql-cli-binaries/blob/main/LICENSE.md).
- **T5:** [Semgrep engine/rules/platform licensing](https://docs.semgrep.dev/licensing), [CE limitations](https://github.com/semgrep/semgrep/blob/develop/README.md).
- **T6:** [Semgrep metrics/local-rule controls](https://docs.semgrep.dev/metrics), [local CLI scans](https://docs.semgrep.dev/for-developers/cli.md).
- **T7:** [Gitleaks maintenance/CLI](https://github.com/gitleaks/gitleaks/blob/master/README.md), [MIT license](https://github.com/gitleaks/gitleaks/blob/master/LICENSE), [separate action license/key caveat](https://github.com/gitleaks/gitleaks-action/blob/master/README.md).
- **T8:** [OSV-Scanner Apache-2.0 license](https://github.com/google/osv-scanner/blob/main/LICENSE).
- **T9:** [ZAP Baseline behavior/Docker/tooling](https://www.zaproxy.org/docs/docker/baseline-scan/), [Apache-2.0 license](https://github.com/zaproxy/zaproxy/blob/main/LICENSE).
- **N1:** [Node 26.12.1 worker memory/resource limits](https://nodejs.org/download/release/v26.12.1/docs/api/worker_threads.html).
- **N2:** [Node 26.12.1 child processes/options/signals](https://nodejs.org/download/release/v26.12.1/docs/api/child_process.html).
- **N3:** [Node 26.12.1 Permission Model/threat boundary](https://nodejs.org/download/release/v26.12.1/docs/api/permissions.html), [24.22.1 fallback documentation](https://nodejs.org/download/release/v24.22.1/docs/api/permissions.html).
- **N4:** [PDF.js Node worker handling, inspected commit](https://github.com/mozilla/pdf.js/blob/e2a5e1d34517b7e544f234d54eec3aa37df0b846/src/display/api.js).
- **N5:** [JSZip memory/format limitations](https://stuk.github.io/jszip/documentation/limitations.html).
- **N6:** [saxes chunk limits/error handling](https://github.com/lddubeau/saxes/blob/master/README.md).
- **H1:** [Scalingo application/container isolation](https://doc.scalingo.com/security/overview/application-security).
- **H2:** [Scalingo memory/CPU/PID/FD limits](https://doc.scalingo.com/platform/internals/container-sizes).
- **H3:** [Scalingo egress/bandwidth](https://doc.scalingo.com/platform/networking/public/egress).
- **H4:** [Scalingo platform firewalls/DDoS scope](https://doc.scalingo.com/security/overview/network-security).
- **H5:** [Scalingo container startup/shutdown](https://doc.scalingo.com/platform/internals/container-management).
