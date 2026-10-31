# Issue #89 — isolated PDF and DOCX uploads

Implements the upload acceptance criteria of #89 under #70 and ADR-0011/0015. Continues saved branch `t3/788c5027` at `88e05533529429defec7a367e1a24c78acbcc4d3`; the prepared continuation branch is `t3/issue-89-completion`. The implementation commit is `9255380`, followed by integration merge `a77df15` from `spec/70-launch-integration` at `d81ef18aec263e0eb9cedec136fc2bb581af6700`. The final handoff commit also contains the HTTP request-reader correction described below.

## Delivered behavior

- `POST /v2/document-structurings` accepts exactly one multipart file, recognizes PDF/DOCX from bytes rather than the filename/MIME declaration, extracts text in the restricted area, and returns the same parser Structuring as pasted text. It creates no Check and consumes no Quota. Neither the upload nor extracted text is persisted by this endpoint. The shared clients retain their workflow in memory; Preferences contain no document content.
- The initial file limit is **20 MiB (20,971,520 bytes)**, displayed as **20 MB**. Both PDF and DOCX fixtures at exactly that size pass. Known-length and chunked oversized requests are bounded before multipart parsing; duplicate/additional fields are rejected. The multipart envelope has a separate 65,536-byte allowance. Admission bounds simultaneous upload buffering as well as parser processes.
- `GET /v2/document-settings` returns the current `inputBytes` limit, under current Structuring authority and `no-store`. Both clients read it before sending each file. A changed Operator limit is enforced by the upload reader, supervisor and isolated stdin reader, and is shown in the DE/EN oversized-file message without rebuilding clients. The server remains authoritative if settings change between requests.
- PDF.js is used directly for text, without native canvas, OCR, rendering or PDF scripting. Empty-text PDFs, partial-empty PDFs, encryption, corrupt documents, page/expansion/elapsed/resource ceilings, cancellation and boundary unavailability are distinct outcomes. Only the two appropriate PDF outcomes increment content-free no-text counters; filenames/text do not enter diagnostics.
- The owned JSZip/saxes adapter reads Word paragraphs, namespaces, list numbering and indentation. It validates footnotes separately and excludes them from bibliography input. Every actually inflated byte of every ZIP member, including unused media, consumes the expansion budget; archive size metadata alone is never trusted. DTDs are rejected; relationships are not followed.
- Web and native Chromium extension panels share file selection, extraction/Structuring review, safe localized errors, partial-PDF notices and Reset. Uploading never starts a Check automatically. Starting a Check uses the extracted text through the existing workflow. The merged #83 field-revision/Re-check and Reference-list controls remain intact.
- Public transport source, generated JS/declarations and OpenAPI remain dual-licensed `AGPL-3.0-or-later OR MIT`. Parser/runtime dependencies remain outside the transport package. Generated artifacts were rebuilt from source after integration, with no manual generated-file resolution.

## Restricted execution boundary and configuration

The supported implementation is a **local Docker Linux container with cgroup v2**, exercised on macOS through OrbStack (Docker 29.8.2; kernel `7.2.12-orbstack-00394-gbecdd6130068`). It is not a same-privilege Node child or a Seatbelt/Node-permissions fallback. An absent, invalid or unavailable exact image/boundary fails closed with `document-unavailable`.

Build the isolated image from the repository root:

```sh
node apps/server/scripts/extractor-image.ts
```

The command prints an immutable `sha256:<image-id>` for `SOURCE_TASTER_DOCUMENT_IMAGE`. Its temporary build context contains only the extraction bundle, selected PDF.js modules and retained dependency/project license notices. It never copies the checkout, credentials or environment. The Node 24.14.0 Debian base is pinned by multi-platform digest in `apps/server/extractor.Dockerfile`. The tested extraction image is `sha256:a36fa02bdeea666e023b219e6bafa4f020833cd703ca1e1e069623cb7a061707`; rebuilds/other architectures can yield a different ID and require their own evidence.

Each task runs with network disabled, no host mounts or Docker socket, a read-only root filesystem, UID/GID 65534, all capabilities dropped, no-new-privileges, no shared IPC, 32 PIDs, 64 file descriptors, no core dumps and no container log driver. Only the bounded document on stdin and non-secret limits in argv cross the boundary. The Docker control client belongs to the trusted supervisor; application environment variables are not inherited by the parser.

`SOURCE_TASTER_DOCUMENT_LIMITS` is a strict JSON patch over these defaults:

```json
{"inputBytes":20971520,"pages":2000,"expandedBytes":200000000,"timeoutMs":60000,"cpuSeconds":60,"outputBytes":33554432,"memoryBytes":1610612736,"concurrency":2}
```

The DOCX expansion limit is **200,000,000 bytes**, not 200 MiB. CPU bandwidth is additionally limited to one core, memory plus swap equals the memory ceiling, and actual CPU seconds are OS-limited. The supervisor bounds elapsed time/stdout, validates the complete response, kills/removes containers on cancellation/ceiling violations and drains active tasks on web shutdown. An abort occurring during container creation is checked before accepting work/output. Failed removal quarantines capacity rather than admitting replacement tasks over a possibly live one. Docker control-plane outages still require Operator recovery; the parser retains its OS resource/network restrictions.

A hostile parser image is used only at the extraction adapter edge in HTTP tests. Its returned public response proves denied credentials, host files/socket, writes, database/internet access and privilege, actual cgroup memory/swap/CPU values, and actual process exhaustion. Separate malicious modes exercise CPU/memory/output abuse, malformed output, elapsed timeout and cancellation, followed by successful clean tasks.

The HTTP upload reader uses a non-destructive native IncomingMessage iterator. Cancelling a wrapped Web-stream reader left the HTTP adapter's internal reader paused, producing delayed keep-alive socket failures. Closing the connection immediately also raced with an in-progress large client write. Releasing the native iterator lets the HTTP adapter perform its bounded wire cleanup without retaining oversized application input; the full upload/parser suite verifies subsequent requests.

## Validation and red/green evidence

Confirmed #70 seams were retained: published HTTP/download contracts with disposable real PostgreSQL, external fixtures only at adapter edges, and Playwright/native-panel behavior. No internal parser mocks, database-table assertions, broad concurrent database runs, real customer documents or private evaluation material were added.

Preserved logs are in `/tmp/source-taster-70/89-*`. Representative actual red → green evidence:

| Slice | Red evidence | Green evidence |
| --- | --- | --- |
| DOCX upload/paste parity | `89-red-docx.log`: missing route, 404 instead of 200 | `89-green-docx.log` |
| PDF text/partial-empty notice | `89-red-pdf.log`: unsupported, 415 instead of 200 | `89-green-pdf.log` |
| Word numbering | `89-red-word-list.log`: missing `[1]`/`[2]` text | `89-green-word-list.log` |
| CPU ceiling classification | `89-red-cpu.log`: elapsed failure instead of resource failure | isolation suite below |
| Cancellation during creation | `89-red-cancellation-real.log`: slot remained unavailable | `89-green-cancellation.log`, final isolation suite |
| Upload-buffer admission | `89-red-upload-buffer.log`: admitted another upload while one remained incomplete | `89-green-upload-buffer.log`, final isolation suite |
| Shared upload UI | `89-red-browser.log`: missing upload action | `89-green-browser.log`, final browser suites |
| Current upload settings | `89-red-settings.log`: 404 | `89-green-settings.log` |
| Operator-changed server limit | `89-red-configured-limit.log`: advertised the old 20 MiB limit | `89-green-configured-limit.log`: 6 cases |
| Operator-changed client limit | `89-red-configured-browser.log`: failed to show the configured 1 MB limit | `89-green-configured-browser.log`: 6 DE/EN cases |

An early cancellation fixture exited because an unresolved Node top-level await had no live handle; that fixture was corrected before the real cancellation evidence above. Initial browser startup also required the website preview artifact. This worktree uses a copied, ignored preview build from the integration checkout for the information links; no website qualification/build receipt is claimed.

Final post-integration validation used Node **24.14.0**, pnpm **12.15.0**, the image above, API **3601**, auxiliary API **3602** and browser **5275**. PostgreSQL suites ran serially against owned disposable databases/roles. Passed:

| Check | Actual result | Evidence |
| --- | --- | --- |
| Upload and pasted-text HTTP | 59 cases: 13 document + 46 parser | `89-final-primary-native-reader.log` |
| Resource/isolation/configured-limit HTTP | 14 cases: 8 isolation + 6 limit cases | `89-complete-isolation-limits.log` |
| Integrated revision/export HTTP/downloads | 12 cases | `89-post-integration-revision-export-retry.log` |
| Web DE/EN uploads/settings, parser and revision/list regressions | 13 cases across the initial 11 passing cases and the 2 narrow-layout retries | `89-post-integration-web.log`, `89-post-integration-narrow-workspace.log` |
| Real native Chromium panel DE/EN uploads/no-text/accessibility | 2 cases | `89-post-integration-panel.log` |
| Server/UI/web/extension/contract typechecks; root scripts typecheck | passed | `89-complete-typecheck-*.log`, `89-post-integration-typecheck-{web,extension}.log` |
| Server/UI/web/extension/contract ESLint; changed-file formatting and diff checks | passed | `89-complete-lint-{server,ui}.log`, `89-post-integration-lint-*.log`, `89-complete-format.log` |
| Server, web, Chromium and Firefox builds | passed | `89-complete-build-*.log` |
| DE/EN catalog parity | 291 messages | `89-post-integration-i18n.log` |
| Committed transport/OpenAPI reproducibility | 38 artifacts reproduced byte-for-byte | `89-generated-reproducibility.log`, `89-generated-sha256.json` |
| Installed-package license gate | 543 package records, 85 runtime packages | `89-final-licenses.log` |
| Offline npm advisory scan + independent inventory reconciliation | 704/704 locked identities, 0 missing, 0 vulnerable | `89-advisories.log`, `89-advisory-reconciliation.json` |
| Existing release gate | expected refusal, exit 78: #94 calibration/qualification required | `89-post-integration-release-gate.log` |

OSV-Scanner is checksum-verified **2.7.0** (`osv-scanner_darwin_arm64`, SHA-256 `d4926ef8da134332543be276dff157e4c170f99ad91fc48e89448a8816bdf70b`). The npm database was separately refreshed from the public OSV bucket, last modified **2026-10-30 17:34:03 UTC**, under the 48-hour freshness ceiling at validation. The reconciliation unions both pnpm 12 YAML documents. This is the npm scope only; the full controlled-native/website and base-image/deployed-version gates were not claimed as run here.

The first combined post-merge run encountered PostgreSQL `53300` / reserved-connection errors. The focused retries removed the unused global fixture for tests that already own a service. A separate genuine keep-alive failure and early-close EPIPE are retained in `89-post-integration-primary-retry.log` and `89-final-primary.log`; the native-reader correction passed all 59 primary cases. Narrow-screen revision tests exposed the upload fieldset's intrinsic minimum width; `min-w-0` corrected both DE/EN cases without hiding overflow. Final task cleanup left no `source-taster-extract-*` containers.

Reproduce the two primary HTTP files with:

```sh
SOURCE_TASTER_TEST_API_PORT=3601 pnpm --filter @source-taster/server exec vitest run test/documents.test.ts test/structuring.test.ts
```

Set `SOURCE_TASTER_DOCUMENT_IMAGE` to the built exact image ID first. For owned-service suites, the ignored local config `apps/server/.tmp/89-owned-service.vitest.config.ts` contains:

```ts
import base from "../vitest.config.ts";
export default { ...base, test: { ...base.test, globalSetup: [] } };
```

Run the limit/isolation pair with `SOURCE_TASTER_TEST_AUX_PORT=3602` and `vitest run --config .tmp/89-owned-service.vitest.config.ts test/documents-limits.test.ts test/documents-isolation.test.ts`. Run the revision/export pair separately with `SOURCE_TASTER_TEST_REVISIONS_PORT=3602 SOURCE_TASTER_TEST_EXPORTS_PORT=3602` and the same config, targeting `test/reference-revisions.test.ts test/exports.test.ts`.

For clients, set `SOURCE_TASTER_E2E_API_PORT=3602 SOURCE_TASTER_E2E_WEB_PORT=5275` and run the web package's Playwright targets `e2e/documents.spec.ts e2e/structuring.spec.ts e2e/revisions.spec.ts`, then the extension package's `e2e/documents.spec.ts`. The website preview artifact is required by the existing dev harness. No whole-repository database suite, hosted private-service suite, live Safari/Firefox qualification or launch performance/quality qualification was run.

## Integration and release limits

Source conflicts were additive in `.env.example`, server configuration/Problem Details, DE/EN catalogs and the shared workspace (`upload` alongside #83's `follow`). Both sides were preserved and transport artifacts regenerated. No integration checkout, private repository, branch push, PR or issue state was changed.

This is implementation evidence, **not launch isolation/security/hosting or quality qualification**. Scalingo capability evidence, deployment-specific enforcement, capacity/cost measurements, ASVS/required security scans, hard-layout/rights-cleared document measurements, performance p95 targets, base-image/runtime inventory and human license/legal approval remain required. The local numeric memory/output/concurrency values are operating defaults, not qualified capacity receipts. No provider switch or weaker fallback is authorized. Bibliography selection/editing and retention/History work remain with their own tickets; this upload endpoint stores no raw file.

The dependency graph adds exact stable PDF.js 6.4.299, JSZip 3.10.2 and saxes 6.0.0, with native canvas excluded. The license gate elects JSZip's MIT option and retains pako's MIT/Zlib notices; no maturity exception or human legal approval is granted. The npm advisory check does not substitute for the repository's broader controlled-native and base-image/deployed-version gates.

The existing release check still refuses uncalibrated configurations with exit 78 under #94. #80's approved synthetic implementation acceptance is preserved; approved private web recordings/replay remain mandatory before source activation through #140, which blocks #114. Other existing legal, dependency, quality and release gates remain intact.
