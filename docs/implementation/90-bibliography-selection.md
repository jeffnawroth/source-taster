# Issue #90 — Bibliography selection

Implements #90 under #70 and ADR-0011/0016. Continues the saved implementation
`t3/d6c86068` at `65c4f7f18511397f4d9beeeb2667c5c64037c96d`, including the
earlier `2356ff4` checkpoint. This worktree started exactly at local integration
tip `1e14d63dfa85d19ce6a98e2713a5aa480bc4b10f`; merge `55d36c1` incorporated
the WIP without discarding the integrated Manual overrides or sign-in work.

## Behavior

- An owned deterministic module detects DE/EN bibliography headings and several
  chapter regions, stops at subsequent sections, and retains document-relative
  UTF-16 source spans. Uploaded reference-only lists are supported. Headed pasted
  documents receive the same selection workflow; ordinary pasted lists retain
  their parser workflow. No AI/provider call is introduced.
- Both clients highlight the selection on the extracted text, show the exact
  original text, let users move each region's start/end or deselect it, and let
  users mark text to add a region. Nothing detected means an explicit message
  and manual selection; Check is disabled while no region is selected. Invalid
  or overlapping regions are rejected by the API as well as the editor.
- Only selected text reaches Structuring or Check creation. Rejected headings
  and other rejected text stay in the v2 Structuring review and receive no slot.
  The existing v1 intake behavior remains intact. Over-limit documents keep
  their text and movable selection, show the configured Reference limit and
  create no truncated Check.
- Selection edits on an inactive Check preview added/cut and dropped References
  and additional Quota before applying. Fully retained spans keep their slots,
  corrections and results. Dropped slots are removed; cut/new text receives new
  slots and the existing first-run policy. Unchanged text is not restructured.
  Stale event sequences and edits during active work are rejected. Preview
  starts no work. Selection changes use the existing ownership, current
  permission and fixed Check-content deadline guards.
- Raw uploads remain ephemeral. The exact extracted/pasted document and current
  selection are held with the Check for later boundary changes, under its
  existing content lifetime and access controls. Client content stays in memory;
  no new device-storage or Preferences content is introduced. #91 owns the
  separate encryption/deletion implementation; this ticket does not qualify it.
- Public schemas/client/OpenAPI remain dual-licensed transport only; detection
  and parser implementation stay in the AGPL core/server. No dependency was
  added.

## TDD continuation and conflicts

The already confirmed #70 seams were used: published HTTP/SSE/download contracts
with real disposable PostgreSQL, external fixtures only at adapter edges, and
Playwright with a real native Chromium panel. No nested agents or predecessor
code were used.

Earlier red/green evidence remains in `/tmp/source-taster-70/90-*.log`, including
`90-red-detection.log` → `90-green-detection.log`,
`90-red-manual-paste.log` → `90-green-manual-paste.log`,
`90-red-difference.log` → `90-green-difference.log`, and the Claude detection/list
and browser logs. Finished slices were continued rather than recreated.

New actual red/green slices:

| Slice | Red evidence | Green evidence |
| --- | --- | --- |
| Preview newly added/cut References | `90-resume-red-preview.log`: missing added References | `90-resume-green-preview.log` |
| Display those References before applying | `90-resume-red-preview-browser.log`: empty preview list in DE/EN | `90-resume-green-preview-browser.log`, `90-resume-selection-browser-final.log` |
| Ignore rejected text when starting selected References | `90-resume-red-rejected.log`: 400 instead of 201 | `90-resume-green-rejected.log`, `90-resume-primary-final.log` |
| Disable Check without a selected region | `90-resume-web-final.log`: enabled button | `90-resume-selection-browser-final.log`: manual-region case passes at 360 px |

Source merge conflicts were limited to `apps/server/src/http/app.ts` (preserved
both Manual override and selection routes) and
`packages/ui/src/reference-actions.tsx` (preserved both imports/actions).
Conflicted generated declarations/routes were taken from one side, then the
entire verification contract was regenerated from source. No generated artifact
was hand-merged. The final integration merge reported already up to date.

## Exact validation

Node **24.14.0**, pnpm **12.15.0**. Extraction used the existing #89 immutable
image, checked with `docker image inspect`; see
[the extraction boundary documentation](89-isolated-document-uploads.md).
Shared PostgreSQL on 5433 initially refused startup with `53300`; no unrelated
process, database, role or container was stopped. Subsequent validation used an
owned, disposable PostgreSQL 18 container on **55590**. API/auxiliary/browser
ports remained **4001/4002/5300**. All HTTP test files ran with file parallelism
disabled; each service used its own database/role.

```sh
docker run -d --rm --name st90-selection-pg-caf1069f \
  -e POSTGRES_PASSWORD=postgres -p 127.0.0.1:55590:5432 postgres:18
export DATABASE_ADMIN_URL=postgres://postgres:postgres@127.0.0.1:55590/postgres
export DATABASE_TEST_URL=postgres://verification_test:verification_test@127.0.0.1:55590/source_taster_test
export SOURCE_TASTER_DOCUMENT_IMAGE=sha256:a36fa02bdeea666e023b219e6bafa4f020833cd703ca1e1e069623cb7a061707
export SOURCE_TASTER_TEST_API_PORT=4001
export SOURCE_TASTER_E2E_API_PORT=4002
export SOURCE_TASTER_E2E_WEB_PORT=5300

pnpm install --frozen-lockfile
pnpm --filter @source-taster/core build
pnpm --filter @source-taster/i18n build
pnpm --filter @source-taster/contract-verification build
pnpm --filter @source-taster/server generate

pnpm --filter @source-taster/server exec vitest run \
  test/bibliography-selection.test.ts test/documents.test.ts test/structuring.test.ts
```

**67 passed**: 8 selection + 13 upload + 46 parser cases
(`90-resume-primary-final.log`). All new selection responses are parsed through
the published schemas.

For suites which own a service, the ignored local
`apps/server/.tmp/90-owned-service.vitest.config.ts` contains:

```ts
import base from "../vitest.config.ts";
export default { ...base, test: { ...base.test, globalSetup: [] } };
```

This only removes the unused global service; real PostgreSQL/web/worker fixtures
are retained. Run:

```sh
SOURCE_TASTER_TEST_AUX_PORT=4001 \
SOURCE_TASTER_TEST_REVISIONS_PORT=4001 \
SOURCE_TASTER_TEST_EXPORTS_PORT=4001 \
SOURCE_TASTER_TEST_OVERRIDES_PORT=4001 \
SOURCE_TASTER_TEST_LIFECYCLE_PORT=4001 \
pnpm --filter @source-taster/server exec vitest run \
  --config .tmp/90-owned-service.vitest.config.ts \
  test/documents-limits.test.ts test/reference-revisions.test.ts test/exports.test.ts \
  test/manual-overrides.test.ts test/revision-lifecycle.test.ts

pnpm --filter @source-taster/web exec playwright test \
  e2e/bibliography-selection.spec.ts e2e/structuring.spec.ts e2e/documents.spec.ts \
  e2e/revisions.spec.ts e2e/manual-overrides.spec.ts
pnpm --filter @source-taster/web exec playwright test \
  e2e/bibliography-selection.spec.ts e2e/revisions.spec.ts \
  --grep 'undetected document|field drafts.*de'
pnpm --filter @source-taster/web exec playwright test e2e/bibliography-selection.spec.ts
pnpm --filter @source-taster/extension exec playwright test \
  e2e/bibliography-selection.spec.ts e2e/documents.spec.ts
```

- **29 HTTP regression cases passed**, `90-resume-http-regressions.log`.
- **19 distinct web cases passed across focused runs**, including DE/EN and
  WCAG checks, `90-resume-web-final.log`, `90-resume-web-retry.log` and
  `90-resume-selection-browser-final.log`. The first sweep had 17 passes and
  two failures. The empty-selection control was fixed test-first. A contract
  rebuild concurrently removed imports during the German revision case; its
  focused retry passed. Both selection languages and the manual-region case
  then passed together (3/3). Intermediate manual-selection driver failures
  are preserved; the final driver uses Playwright `selectText`, then a keyboard
  event and the public boundary controls. No extra product event handlers were
  needed.
- **4 real native-panel cases passed**, including DE/EN boundary movement,
  deselection, selected-only Check creation, upload/no-text and absence of
  document content in extension storage (`90-resume-native-complete.log`).
  Earlier native failures were stale test labels/selectors after the new editor
  replaced the plain Reference textbox. Tests now use the exact localized
  original-document label and the document file input.

The Vite information-link harness requires `apps/website/dist-preview`. This
worktree copied the ignored preview artifact from the saved WIP worktree, as
#89's harness allows. An attempted local website build failed on missing
controlled Pagefind receipts (`90-resume-website.log`); no website build or
publication qualification is claimed.

The following exact commands also passed:

```sh
pnpm --filter @source-taster/core typecheck
pnpm --filter @source-taster/server typecheck
pnpm --filter @source-taster/ui typecheck
pnpm --filter @source-taster/contract-verification typecheck
pnpm --filter @source-taster/web typecheck
pnpm --filter @source-taster/extension typecheck
pnpm --filter @source-taster/core lint
pnpm --filter @source-taster/server lint
pnpm --filter @source-taster/ui lint
pnpm --filter @source-taster/contract-verification lint
pnpm --filter @source-taster/web lint
pnpm --filter @source-taster/extension lint
pnpm --filter @source-taster/server build
pnpm --filter @source-taster/web build
pnpm --filter @source-taster/extension build
pnpm i18n:check
pnpm audit:licenses
git diff --check
```

DE/EN parity: **346 messages**. License gate: **547 installed packages / 89
runtime packages**. Scoped Prettier validation passed for all changed supported
source/config/document files. A subsequent contract build reproduced all **40**
tracked JS/declaration/OpenAPI artifacts byte-for-byte; hashes are in
`/tmp/source-taster-70/90-resume-generated-hashes.json`. A concurrent initial
ESLint run also saw the temporary missing generated imports; its clean retry
passed. Rebuild contracts before starting dependent lint/browser checks.

`node apps/server/scripts/release-check.ts` still refuses release with **78**:
the configuration remains uncalibrated and requires #94/ADR-0006/0025 evidence.
After validation the owned PostgreSQL container is stopped; no unrelated
resources, integration checkout, private repository, push, PR or ticket state
were changed.

## Limits and remaining gates

Synthetic regression witnesses prove implementation behavior, not the held-out
19/20 detection target, a 60-document Development corpus, parser-quality targets,
latency p95, release qualification or source activation. Those measurements,
approved private documents/recordings, hosting/isolation/security/legal gates,
and real Safari/Firefox qualification remain separate. No full repository or
private-service/Quota qualification suite was run. Standalone preview counts do
not prove a private-service Quota journal debit. The approved #80 synthetic
implementation split and mandatory #140 → #114 source-activation gate remain
intact, as does the selected Better Auth release gate from #97.

## Shared-root integration continuation

See [the combined integration handoff](70-integration-90-93-137.md) for the
#90/#91 retention composition, selected-text draft compatibility, scoped #80
browser-fixture default, current validation and unchanged qualification gates.
Earlier temporary logs named above disappeared during the interruption; new
continuation evidence lives in `.tmp/spec-70-orchestration/` in the integration
checkout.
