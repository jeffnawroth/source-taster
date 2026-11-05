# #105 Download an accessible PDF Verification report (public half)

Branch `t3/accessible-pdf-report` (worktree `t3-003ed1a4`), continued from the previous implementer's checkpoint
`5bc1d1e` (`t3/3799420f`, fast-forward merged) on top of `457c3f2`, and merged
with `origin/spec/70-launch-integration` at `5cce0e2`. Implemented under spec #70
with the TDD skill. No push, PR, issue mutation, deployment, real provider,
qualification or release claim is part of this work. Human tickets #116, #136,
#138 and #140 stay open. Decisions follow
[ADR-0017](../adr/0017-accessible-pdf-reports.md).

## Behavior

- **Entitlement.** Reports are included only when the Owner's Quota feature
  scope contains the feature id `verification-report`
  (`reportFeature`, `packages/contract-verification/src/report.ts`). The server
  reads the Quota snapshot outside any store transaction and never invents a
  local entitlement. A standalone program (no Quota port), a Guest and an Owner
  without the feature all fail closed with `403 feature-unavailable`. A
  foreign Owner gets `404`. Authority is re-checked on every download.
- **Routes** (`/v2/checks/{checkId}/reports`): `POST` (202, one active report
  per Owner, otherwise `409 report-busy`), `GET /{id}`, `DELETE /{id}` (cancel),
  `GET /{id}/file` (`application/pdf`; `409 report-not-ready`, `410
  report-expired`, `404 report-not-found`). There is no sharing link.
- **Job.** A separate pg-boss queue and worker job. The Check snapshot is frozen
  when generation starts. A Check that is still running yields an "intermediate
  snapshot" report that says so and is never updated afterwards; a cancelled
  Check yields a final report with the Status "cancelled".
- **Lifetime.** The sealed file lives at most 15 minutes after publication and
  never beyond the Check's deletion deadline
  (`expiresAt = min(from + 15 min, deletionDeadline)`); the sweep purges it.
- **Content, in reading order.** Title (H1), date, snapshot label, optional
  document name (supplied for this report only, kept only with the temporary
  file), an overview (counts, Scoring rules version), then one H2 section per
  Reference: original text, Verdict (manual Verdict plus the original system
  Verdict when overridden), explanation, differing fields, Best match with a
  `doi.org` link, Scoring rules version and the Correction suggestion in the
  chosen citation style. German or English headings and texts; bibliographic
  data is never translated.
- **Engine.** PDFKit 0.20.2 only inside `apps/server/src/reports/pdf.ts`, run in
  a worker thread with a 120 s wall clock, a 512 MB old-generation limit and a
  24 MiB result cap. Fonts: embedded Noto Sans Regular, Bold, Italic (OFL-1.1),
  loaded from the package. A code point missing from the fonts fails the report
  with `unsupported-character` instead of printing a placeholder box. More than
  2,500 pages, the wall clock or the size cap fail with `limit-exceeded`.
- **UI.** One shared `ReportDownload` control (`packages/ui`) under the export
  controls, used by the web app and the native extension panel: language select
  (preselected from the UI language), optional document name, Create, Cancel,
  Download, a polite live status line. Not entitled: it says the report is not
  available for the account (with an upgrade link only when the host supplies
  one). Nothing about a report is stored in the browser or the extension.
  Copy exists in DE and EN (`report_*`, `report_ui_*` messages).

## Accessibility properties proven in tests

Read back from the downloaded bytes with pdf.js (independent of PDFKit) and a
raw catalog reader (`apps/server/test/support/pdf-inspect.ts`):

- `/Lang` on the catalog equals the report language (de, en); `/MarkInfo
  /Marked true`; `/ViewerPreferences /DisplayDocTitle true`; non-empty `Title`;
  `/StructTreeRoot` present.
- Structure roles in order: `Document`, `H1`, `H2`...; German reference sections
  appear as Überblick, Referenz 1, Referenz 2 in that order.
- Text is extractable, including diacritics, the document name, the Scoring
  rules version, the Verdict, the manual/original Verdict pair, the Best match
  identifier and the Correction suggestion heading.
- Link annotations: every link annotation has a `StructParent` and an `OBJR`
  child of a `Link` structure element, with the URI `https://doi.org/...`.
- The page footer ("Seite 1 von ...") sits inside `Artifact` marked content and
  does not occur in the structure tree.
- axe (WCAG 2 A/AA, 2.1 AA, 2.2 AA) over the web page and the native panel with
  the report control rendered, in DE and EN.

### Scope of the automated check against ADR-0017

ADR-0017 asks every build for automated structure checks of tags, reading
order, headings, language, links, table headers and Unicode mapping. The
tests above cover tags, reading order, headings, language, links and
extractable text (pdf.js' text extraction is the proxy for the Unicode
mapping). The report contains no tables, so table headers do not apply.

### veraPDF PDF/UA-1 validation (CI tool, 5 Nov 2026)

The product owner approved veraPDF as a **CI-only check tool** on 5 Nov 2026
(scope decision in `docs/dependency-policy.md`). `pnpm reports:pdfua`
(`apps/server/scripts/report-pdfua.ts`) generates six samples through the
production worker path (final and intermediate Checks and a 28-Reference,
multi-page Check; DE and EN each, `apps/server/test/support/report-samples.ts`)
and runs `verapdf --flavour ua1`. The CI job `pdfua` installs the checksum-pinned
veraPDF 1.30.3 CLI and is part of the `checks` gate; it keeps the PDFs and
veraPDF's JSON report as the `pdfua-evidence` artifact.

Result of the local run (veraPDF 1.30.3, OpenJDK 27.0.1, macOS arm64):

- Before the fixes in this change, every sample failed PDF/UA-1 rules **7.1-3**
  (page content that is neither tagged nor an Artifact: the continuation of a
  paragraph, heading or list item that wrapped onto the next page was not
  reachable from the structure tree), **7.18.5-2** (link annotations without a
  non-empty `Contents`) and **5-1**.
- After the fixes, 7.1-3 and 7.18.5-2 pass. Rule 5-1 still fails on all six
  samples. 5-1 requires the XMP metadata to contain the PDF/UA identification
  (`pdfuaid:part`); writing it makes every report declare itself PDF/UA-1. That
  declaration needs the PDF/UA checks a validator cannot make (manual review),
  so on 5 November 2026 the product owner's decision was: **the reports do not
  declare PDF/UA.** In the local run (veraPDF 1.30.3 on OpenJDK 27) every other rule passed; CI runs it on Temurin 21.
- The harness (`apps/server/scripts/report-pdfua.ts`) therefore accepts exactly
  one failed rule, 5-1, and fails on any other failed rule. It also fails if 5-1
  stops failing, so a conformance declaration cannot be added without a new
  decision and an update of the harness and this note. Its verdict logic is held
  by `test/report-pdfua.test.ts`.
- Evidence for a future declaration: with PDFKit's `subset: "PDF/UA"` set locally
  (not committed), 5-1 passes and a different rule, **7.21.4.2-2** (CIDSet of an
  embedded subset font does not list every CID in the font program), fails on all
  six samples. Declaring PDF/UA later therefore also needs that CIDSet fixed.

No other rule was disabled or filtered. The statement that can be made today is:
veraPDF 1.30.3 PDF/UA-1 validation of the DE and EN samples passes every rule
except the deliberately unset identification (5-1). This is not a PDF/UA
conformance claim; the manual screen reader review stays open. #105's criterion
"An automated PDF accessibility check passes for DE and EN samples" is read,
under that decision, as this check passing; the identification rule is the one
documented exception.

The independent tests (`pnpm --filter @source-taster/server test:report-structure`,
no database) also check that every visible character is tagged or an Artifact
(via marked-content ids read with pdf.js) and that each link annotation has a
non-empty `Contents`, on the same samples.

### Not machine-verified (honest limits)

- Screen reader behavior (NVDA/JAWS on Windows 11, VoiceOver on macOS), keyboard
  review of the viewer and the DE/EN reading experience are **not** machine
  verified; ADR-0017 reserves them for the human reviews. **No PDF/UA
  conformance or certification is claimed.** veraPDF checks only the rules it
  can test mechanically; the manual review remains open for a human.
- Bibliographic spans are not language-tagged individually. Link annotations
  carry the alternate description both on the `Link` element and in `Contents`.
- Fonts cover Latin, Greek and Cyrillic. Other scripts (e.g. CJK) fail the
  report with `unsupported-character` by design (tested).
- No 1,000-Reference load or memory evidence was produced; only the limits above
  are enforced and the small samples are tested.
- Not tested end to end: Check deletion and entitlement revocation *while the
  job runs* (there is no v2 Check delete route; the worker re-checks the
  feature only when it has a Quota port). Revocation between request and
  download is tested. There is no second Quota snapshot between the entitlement
  check and the byte stream of one download.
- Test composition: the real feature grant belongs to the private service, so
  the web, native and lifecycle tests run a test-only composition
  (`apps/server/test/support/report-web.ts`, selected by
  `SOURCE_TASTER_E2E_REPORTS=granted` / `TEST_REPORT_FEATURE`) whose fake Quota
  grants `verification-report`. `bothPrograms` against the real private service
  was not usable for this feature.

## Dependency gate (ADR-0017 / ADR-0013)

`pdfkit` is exact-pinned at 0.20.2 in `apps/server`; the lockfile resolves
the ADR-0017 graph (fontkit 2.0.4, @swc/helpers 0.5.23, base64-js 0.0.8, fflate
0.8.3 and pako 0.2.9 installed but not reached). Recorded in
`docs/dependency-policy.md` and `apps/server/src/reports/NOTICE.md`.

- `pnpm audit:licenses`: pass, no new exception (561 installed, 105 runtime).
- `pnpm audit --prod` (server): no known vulnerabilities. This is a supplementary
  registry query. **The ADR-0015 OSV scan was not run**: its checksum-pinned
  binary and refreshed database exist only in CI, so `pnpm audit:dependencies`
  stopped at the missing OSV database (its website qualification step passed).
  The exception must not be treated as in effect until CI shows that scan.
- Open notice items (inventoried, need human license review): brotli's Apache
  headers, missing standalone license files for fontkit/brotli/dfa, the
  unattributed base64 decoder ("Based on ... base64-arraybuffer") in fontkit's
  published `dist` builds and the HarfBuzz-derived shapers inside fontkit.
- `pdfjs-dist` (used only by the test inspector) was already an exact-pinned
  dependency of `apps/server`; this ticket added `pdfkit` as the only dependency.

## Commands

Prepared with `. /tmp/st105.env`-style variables: PostgreSQL 18 container on
`127.0.0.1:5411` (`DATABASE_TEST_URL`, `DATABASE_ADMIN_URL`),
`SOURCE_TASTER_TEST_API_PORT=5101`, `SOURCE_TASTER_TEST_REPORTS_PORT=5102`,
`SOURCE_TASTER_DOCUMENT_IMAGE=sha256:a36fa02bdeea666e023b219e6bafa4f020833cd703ca1e1e069623cb7a061707`.
The website/Pagefind build must exist for the browser suites
(`pnpm pagefind:fetch && pnpm pagefind:build && pnpm --filter @source-taster/website build`).

```sh
# server HTTP seam (real PostgreSQL, real web+worker processes)
cd apps/server
pnpm exec vitest run test/reports.test.ts                 # 8 tests
SOURCE_TASTER_TEST_LIFECYCLE_PORT=5101 \
  pnpm exec vitest run test/report-lifecycle.test.ts      # 2 tests, clocked processes

# web seam
export SOURCE_TASTER_E2E_WEB_PORT=5102 SOURCE_TASTER_E2E_API_PORT=5101
cd apps/web
pnpm exec playwright test --config report.playwright.config.ts   # granted, EN+DE
pnpm exec playwright test e2e/report-unavailable.spec.ts          # default config, EN+DE

# native extension seam (real Chromium side panel, CDP download)
cd apps/extension
pnpm test:native-report                                           # EN+DE
```

Static: `pnpm -r --if-present run typecheck`, `pnpm -r --if-present run
i18n:check` (471 messages), eslint and prettier over the touched files.
`pnpm --filter @source-taster/server run build` currently fails on the base
(`src/quality/release.ts` imports `scripts/load/release.ts` outside `rootDir`,
from #117, present in `457c3f2`); this ticket did not touch it. The report
fonts copy step (`node scripts/citation-assets.ts`) was run directly and copies
the fonts and `OFL.txt` to `dist/reports/fonts`.

## Evidence after the final integration merge

- Server: `reports.test.ts` 8/8; `report-lifecycle.test.ts`, `checks`,
  `retention`, `lifecycle`, `lifecycle-recovery`, `service-port`,
  `check-events`, `snapshot`, `exports` together 48/48 (9 files).
- Web (after the last UI change): report granted 2/2; `report-unavailable` and
  `workspace` specs 12/12. Earlier, before that change, `exports`,
  `corrections`, `manual-overrides` and `workspace` ran 19/20; the one failure
  ("Back retains an active Verdict filter ... in de") passed 4/4 when repeated
  alone and 12/12 in the later full `workspace` run, so it looks load-flaky; it
  was not investigated further.
- Native (after the last UI change): report 2/2; `e2e/panel.spec.ts` 8/8.
- A final run of `reports.test.ts` left the number of `source_taster_test_*`
  databases unchanged (11 before and after); the 11 pre-date this session's last
  run and were left alone, like the PostgreSQL container `st105-report-pg`, which
  also existed before this session.

## Red/green record

- The first server test failed red with `expected 404 to be 202` (route missing)
  before the routes existed, then went green.
- The Link test went red (`withStructParent` 0, expected 1: visible link
  annotations without a structure association) and went green after the link
  was created inside a `Link` structure element.
- Other server slices (access refusal, one active report, German structure,
  intermediate/cancelled snapshots, lifetime cap) went green on the first run
  after their implementation or were written together with it.
- The web and native specs were written before the control, but their first run
  failed on missing build infrastructure (Pagefind output), not on behavior, so
  **no clean behavioral red was observed for the UI slices**; they went green
  after the control existed.

## Private follow-up (exact handoff)

1. Add the feature id `verification-report` to the `features` of every Plan or
   grant that includes reports (the public side reads `Quota.features` from the
   snapshot of `POST /internal/quota/snapshot`, unchanged protocol; no new
   endpoint). Until then hosted Owners see "not available".
2. Decide which launch Plans carry it; public code makes no assumption.
3. Keep Guests without the feature; the public side already fails closed.
4. Add a hosted (real private service) browser check of the granted path once
   the grant exists; this ticket could only test it with a fake Quota.
