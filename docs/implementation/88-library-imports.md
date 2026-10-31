# Issue #88 — library import and exact round trips

Implements #88 under #70 using the confirmed HTTP/SSE/download and Playwright
seams. Continued on `t3/implement-issue-88` in
`/Users/jeffnawroth/.t3/worktrees/source-taster/t3-e010c6eb`. The saved
`t3/366374aa` checkpoint `4f8f0fa6825b3258486095b975d046d1685cd478` was merged
without losing changes. The predecessor repository was not consulted.

## Behavior

`POST /v2/imports` previews a UTF-8 BibTeX/BibLaTeX or RIS library without
consuming Quota. `POST /v2/checks` accepts the same `library` input. Recognized
References have canonical CSL types, immutable raw records and import provenance;
malformed records have their own raw text and source spans and do not block the
other records. Rejected records are shown separately and are excluded from the
Check and its downloads. Both clients share the DE/EN file control, preview,
unsupported-field display and download controls. Reset clears in-memory input.

BiblioJSON 4.1.0 is behind the owned import port. It interprets fields, names,
TeX and library string macros; our lexical envelope retains exact record bytes,
comments, citation keys, whitespace, line endings and a leading UTF-8 BOM.
Matching accounts for BiblioJSON changing indentation in its purported raw text;
duplicate citation keys remain distinct records. Known library fields outside
our canonical projection, such as editor, abstract and keywords, remain visible
as unsupported fields. Explicit `and others` is author truncation, not a person.
The owned RIS adapter accepts Zotero/Citavi/EndNote tag aliases, indented and
unindented continuation lines, name particles and full dates in DA/Y1 alongside
a year-only PY. CSL types retain the existing article/book/web/outside-coverage
routing; unknown types keep the article fallback.

File controls validate the extension, UTF-8 encoding and 20 MB limit. The API
also counts the limit in UTF-8 bytes (20 MiB), including inside a Check creation
request, and returns a localized limit problem. The configured Reference limit
is enforced without truncation, including on preview.

`imported-format` is the exact-record download option. It returns `.bib` or
`.ris` with the corresponding content type, preserving each retained record
except for committed field edits or explicitly selected Correction suggestions.
Mapped values are patched in their original records; unchanged fields and
unsupported fields retain their original text. Full-date corrections preserve
day precision, and a semantic Source-type correction changes the entry type;
equivalent entry types stay as written. Original mode uses the committed field
revision, including explicit cleared fields. Selected suggestions overlay their
supplied metadata on that revision. Date/author/page aliases are removed when
the corresponding saved field is cleared. Original input, field revisions and
results are never rewritten by export.

CSL-JSON and traditional regenerated BibTeX remain the canonical export options
from #87. They retain its semantics; the separate exact-record option preserves
unsupported fields rather than changing the canonical BibTeX writer's policy.
Canonical BibTeX also retains citation keys when the imported record starts with
a comment or BOM. A generic RIS serializer remains an expansion hook: requesting
`format: "ris"` is rejected. Exact imported RIS download does not enable that
feature for arbitrary References. If membership adds a Reference without an
import record, the complete Check is exported canonically; the UI switches away
from exact-record mode, and the API rejects an exact-record request for such a
mixed Check. Removed References are omitted from all exports.

## Integration and authority

Merged `spec/70-launch-integration` at
`d81ef18aec263e0eb9cedec136fc2bb581af6700`, including #83, #87 and #80. Source
conflicts were additive route/client/catalogue changes and the shared problem
handler. Generated transport conflicts were resolved by taking one side and
regenerating from combined sources, never by editing generated contracts.

#83 preserves import provenance while appending a user revision. Downloads use
its current committed projection, exclude removed membership, reject stale
suggestion tokens and inherit its fixed content deadline. The new regression
covers Save fields only, clearing an imported year, preserved immutable input,
removal of a second record and re-import of the resulting file in both formats.
The UI derives exact-format eligibility from retained slots' first revisions,
not from a stale upload filename. Same-slot Re-check, expiry, current authority
and durable settlement semantics remain those of integration.

The importer is server-only. Public schemas, clients and regenerated
JavaScript/declarations/OpenAPI retain AGPL-3.0-or-later OR MIT. The exact-pinned,
unmodified LGPL BiblioJSON dependency is explicitly selected by ADR-0011; its
narrow license-inventory entry and distribution notice are recorded. No general
license/dependency exception, source activation or qualification gate was added.

## TDD evidence

Logs are local under `/tmp/source-taster-70/`; these are synthetic implementation
witnesses, not the private qualification corpus.

- `88-codex-resume-red.log`: reproduced the three saved failures (BibTeX/RIS
  selected corrections and accepting exact-format export on non-imported input).
  `88-codex-roundtrip-green.log` passed all seven resumed cases after wiring the
  patchers, correcting library record matching and mapping article issue numbers.
- `88-codex-client-red.log` failed on the missing upload control.
  `88-codex-client-matrix.log` passed both formats in DE/EN, including rejected
  records, visible unsupported fields, exact downloads, reset and axe checks.
- `88-codex-unmapped-red.log` showed known-but-unmapped library fields missing;
  `88-codex-unmapped-green.log` passed eight cases.
- `88-codex-limit-red.log` returned 500 rather than the Reference-limit problem;
  `88-codex-limit-green.log` passed nine cases.
- `88-codex-comment-red.log` treated an example record in a header comment as a
  rejected record; `88-codex-comment-green.log` passed ten cases.
- `88-codex-full-correction-red.log` lost the corrected Source type, day and
  article number; `88-codex-full-correction-green.log` passed eleven cases.
- `88-codex-bytes-red.log` was an infrastructure failure before tests, not red
  evidence. With byte validation absent, `88-codex-bytes-confirmed-red.log`
  received 200 for an oversized Unicode library; restoring validation gave
  twelve passing cases in `88-codex-imports-final.log`.
- `88-merged-revisions-red.log` retained a cleared year in the download.
  `88-merged-revisions-targeted.log` passed the integrated revision/removal case
  for BibTeX and RIS, including re-import without a date.
- `88-merged-membership-ui-red2.log` kept the stale exact-format selection after
  a manual addition; `88-merged-membership-ui-green.log` passed with a complete
  two-Reference CSL-JSON download.
- `88-merged-truncation-red.log` exposed `others` as an author; the final API
  run includes its green regression.
- `88-canonical-key-red.log` lost an imported key after a header comment;
  `88-canonical-key-green.log` passed after fixing key recognition.

## Validation and limits

Node 24.14.0, pnpm 12.15.0, real disposable PostgreSQL on :5433. Suites own their
databases and roles. API/browser runs were serial on port 3401; 3402 is the
assigned auxiliary port and Vite uses 5273. The focused Vitest configuration
avoids starting an unused global database/service. No unrelated process,
database or PostgreSQL setting was altered.

- `SOURCE_TASTER_TEST_IMPORTS_PORT=3401 SOURCE_TASTER_TEST_EXPORTS_PORT=3401 SOURCE_TASTER_TEST_CORRECTIONS_PORT=3401 pnpm --filter @source-taster/server exec vitest run --config imports.vitest.config.ts`:
  **32 passed**, three suites, 51.79 s (`88-final-api.log`). The additional
  canonical-key assertion passed separately in `88-canonical-key-green.log`.
- `SOURCE_TASTER_E2E_API_PORT=3401 SOURCE_TASTER_E2E_WEB_PORT=5273 pnpm --filter @source-taster/web exec playwright test e2e/imports.spec.ts e2e/exports.spec.ts e2e/revision-save-only.spec.ts`:
  **9 passed**, 52.6 s (`88-final-web.log`). Both languages and formats,
  correction downloads, saved revisions and mixed membership; axe checks pass.
- Native Chromium panel validation and final reproducibility are recorded below.
- All 11 workspaces' direct typechecks passed (`88-final-types.log`). Repository
  ESLint passed (`88-final-lint.log`). DE/EN checks passed with 285 messages;
  website content checks retain their explicit human-review limitation
  (`88-final-i18n.log`). Server, web and Chromium/Firefox extension builds passed
  (`88-final-server-build.log`, `88-final-web-build.log`,
  `88-final-extension-build.log`).
- License inventory passed: 531 installed packages / 73 runtime packages
  (`88-final-licenses.log`). The production pnpm advisory scan reported no
  vulnerabilities (`88-final-pnpm-audit.json`); this is not the full controlled
  website/native dependency qualification.
- Server `release:check` still refuses uncalibrated rules with process exit 78
  (`88-final-release-gate.log`). No measured configuration was released.

Some resumed attempts encountered shared PostgreSQL connection exhaustion;
one post-merge multi-case attempt also had transient creation/suggestion
failures. Those attempts are not claimed green. The targeted integrated
revision case and the later complete 32-case run passed. Earlier native driver
attempts missed detail opening or export readiness; the test now waits for the
visible outcome before selecting its correction. Initial browser runs used a
copy of the existing unchanged controlled website preview artifact; this ticket
did not bypass or modify the website build/publication gates.

Native reference-manager re-import and the real 50-record exports per vendor,
Safari/Firefox/ESR qualification, the frozen release parity set, human
translation/accessibility/security review and ADR-0006 Quality gates remain
qualification work. #80's synthetic implementation acceptance is approved;
private approved page/archive recordings and replay remain mandatory under #140
before source activation, blocking #114 alongside the existing provider gates.
#99 owns the real Quota journal, #91 actual deletion, and #104 consented History.
No private corpus/provider approval is claimed. No push, PR, new worktree,
nested delegation or issue closure was performed.

Final native and artifact verification (31 October 2026):

- `SOURCE_TASTER_E2E_API_PORT=3401 SOURCE_TASTER_E2E_WEB_PORT=5273 pnpm --filter @source-taster/extension exec playwright test -g 'native panel imports and round trips'`:
  **2 passed**, 23.0 s (`88-final-native-retry.log`). The real Chromium side
  panel imported both formats, downloaded original and selected-correction
  records in DE/EN, retained no Reference text in extension storage, and passed
  axe. The preceding run passed EN but missed the DE detail/checkbox; it is
  recorded as one pass/one failure in `88-final-native.log`, not as green. The
  driver now waits for the actual visible outcome rather than relying on a
  single click while streamed content changes.
- A clean contract rebuild reproduced SHA-256 hashes of every generated
  transport file and `openapi-v2.json` (`88-contract-before.txt`,
  `88-contract-after.txt`, `88-final-contract-rebuild.log`). The newly generated
  import JavaScript/declaration files are force-added under the repository's
  existing ignored-dist policy; sources and artifacts are committed together.

After the last citation-key and native-driver fixes:

- `SOURCE_TASTER_TEST_IMPORTS_PORT=3401 SOURCE_TASTER_TEST_EXPORTS_PORT=3401 pnpm --filter @source-taster/server exec vitest run --config imports.vitest.config.ts test/imports.test.ts test/exports.test.ts`:
  **21 passed**, 11.27 s (`88-final-import-export.log`). The earlier complete
  32-case run includes the unchanged correction suite; the final 21-case run
  validates the final import/export source and canonical-key regression.
- All workspace typechecks, repository ESLint, full-repository Prettier and
  server build passed again (`88-final-types-last.log`, `88-final-lint-last.log`,
  `88-final-prettier-last.log`, `88-final-server-build-last.log`).
- Exact-record patches use the owned interchange field mappings. Arbitrary
  unsupported original fields remain raw, visible data, not editable canonical
  fields; CSL-JSON is the complete canonical metadata export. No general RIS
  serializer or native reference-manager compatibility qualification is claimed.

## Integration with document uploads (#89), 31 October 2026

Merged source `150699de7b52e047d8a00330aee674a2d65c5d31` into
`spec/70-launch-integration` at `bc451917725c021fec07d00bb3dfd32e915e9aa3`,
using merge commit `3a86e961f3c0d6e758f9debf96ecba4a5d1cef62`.
Additive conflicts affected HTTP route registration, transport package exports,
DE/EN catalogs, dependency/lockfile entries, license inventory and shared intake
controls. Both features were retained. Generated transport/OpenAPI conflicts were
discarded and regenerated from the combined sources.

The two file controls now have separate refs. Switching to library import clears
the previous document selection/notice; uploading a document clears the previous
library input and errors. A new browser regression demonstrated the integration
failure before the latter cleanup: after uploading a DOCX, Check creation still
used the earlier imported `@patent{Library,...}` rather than the document's
Reference. Restoring the alternate-input cleanup passed the regression, including
the reverse document-to-library transition. The #89 `min-w-0` fieldset correction
is retained. These changes affect only the in-memory intake workflow, not stored
evidence or export semantics.

Merge validation used Node 24.14.0, pnpm 12.15.0, the documented exact Docker
extraction image and real disposable PostgreSQL services. Database/browser suites
ran serially on API/auxiliary ports 3701/3702 and browser port 5370; no unrelated
resources were stopped. All logs below are under `/tmp/source-taster-70/`:

- Frozen installation, core/i18n/contract builds, Prisma generation and
  contract/server/UI/web typechecks passed (`88-merge-install.log`,
  `88-merge-{core,i18n-build,contract,prisma,type-*}.log`).
- `SOURCE_TASTER_TEST_IMPORTS_PORT=3702 SOURCE_TASTER_TEST_EXPORTS_PORT=3702 SOURCE_TASTER_TEST_REVISIONS_PORT=3702 pnpm --filter @source-taster/server exec vitest run --config .tmp/88-merge-owned.vitest.config.ts`:
  **26 cases passed** across import/export/revision suites
  (`88-merge-imports-exports-revisions.log`). The ignored local config extends
  `imports.vitest.config.ts`, selects those three owned-service suites and keeps
  `fileParallelism: false`; no unused global service is started.
- `SOURCE_TASTER_DOCUMENT_IMAGE=<the #89 exact image> SOURCE_TASTER_TEST_API_PORT=3701 pnpm --filter @source-taster/server exec vitest run test/documents.test.ts --fileParallelism=false`:
  **13 upload cases passed** (`88-merge-documents.log`). The image is
  `sha256:a36fa02bdeea666e023b219e6bafa4f020833cd703ca1e1e069623cb7a061707`;
  its local ID was checked before use. Isolation still fails closed.
- `SOURCE_TASTER_DOCUMENT_IMAGE=<same image> SOURCE_TASTER_E2E_API_PORT=3701 SOURCE_TASTER_E2E_WEB_PORT=5370 pnpm --filter @source-taster/web exec playwright test e2e/intake-composition.spec.ts e2e/imports.spec.ts e2e/documents.spec.ts -g 'switches between|imports a bibtex library|uploads and structures a DOCX'`:
  **5 cases passed**: DE/EN import round trips, DE/EN document uploads and
  bidirectional input switching (`88-merge-green-browser.log`). The meaningful
  pre-fix failure is retained in `88-merge-red-intake-switch.log`. The existing
  controlled website preview artifact was reused without a publication claim.
- A second contract build reproduced all **40** tracked generated
  JavaScript/declaration/OpenAPI artifacts byte-for-byte
  (`88-merge-contract-rebuild.log`, `88-merge-generated-{before,after}.json`).
- ESLint, scoped formatting, diff checks and DE/EN validation of **301 messages**
  passed. License inventory passed for **547 installed / 89 runtime packages**
  (`88-merge-{lint,format,i18n,licenses}.log`).

This adds no native reference-manager, full native-browser, security, hosting,
performance, legal or Quality-gate qualification claim. The accepted #80
implementation/activation split and mandatory #140/#114 prerequisite remain.
No push, PR edit, issue closure or worktree creation/removal was performed.
