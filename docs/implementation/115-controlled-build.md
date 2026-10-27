# #115 controlled build continuation

Historical continuation evidence for `cb04e23`. The later license qualification and
four review fixes are recorded in [the consolidated handoff](115-consolidated-qualification.md).
The old receipts are preserved under `qualification/evidence/historical/cb04e23/`
and do not qualify that later recipe.

Continuation on 2026-10-27 in an isolated worktree based on parent integration
`f3be5dd`. The clean preserved `t3/pagefind-source-qualification` tip `20f18ba`
was fast-forwarded into this branch, preserving #115, the first-wave review
fixes, research and both interrupted native build passes. The predecessor and
private service were not accessed. No other implementer or subagent was used.

## Recovered behavior and build path

The controlled pipeline now builds Pagefind's DE/EN/unknown WASM, compiler-rs,
Rolldown, Sätteri, Pagefind browser JS and the minimal CLI. It preserves the
existing bilingual content, publication refusals, shared help/legal UI and
#71/#72/#85 fixes. No framework, production service or launch capability was
added. `controlled/README.md` documents the runnable commands and ownership.

Important corrections in this continuation:

- Added the exact existing Rolldown 1.2.15 build dependency so its API/types are
  available to the owned bundler. Its dependency graph was already in the frozen
  website lock; this adds no alternative bundler.
- Browser bundles preserve ES2022 class fields, avoiding extra OXC runtime
  helpers. The classic worker uses Pagefind's explicit base-path fallback in
  place of unavailable `import.meta.url`. Every bundled module is recorded and
  must come from the checksum-pinned Pagefind source.
- Native execution checks validate every actual load against its source-build
  receipt. Compiler and bundler execution are required; optional parsers are not
  artificially invoked. The actual current Astro trace loads controlled
  Rolldown, Sätteri and the compiler. Installed publisher binaries are recorded
  separately and do not execute in the guarded website build.
- Reused task cache archives are checked against controlled Cargo locks and
  extracted anew; Git sources are checked against immutable revisions and
  source/tool files are fingerprinted. Ambient Rust/C/Cargo build flags are
  excluded. No user-global Rust or toolchain was changed.
- Website builds bypass Turbo caching so a cached site cannot skip controlled
  input/artifact verification. The website artifact binds its receipt, native
  load trace and indexer hash to the search/source output.
- Corresponding Source includes actual browser sources, dependency archives,
  licenses, tool pins and offline reconstruction scripts. Source files are
  checked before reproduction. ustar/gzip metadata is normalized; delivered WASM
  is compared to the exact compressed bytes served by the CLI.
- OSV's selected projection now uses the supported `selected/Cargo.lock` name.
  Coverage is reconciled independently for every supplied lock, including raw
  source locks. Missing/failed/malformed scans never become clear scans. License
  refusal does not prevent producing advisory evidence; it still fails the gate.
- The first complete actual-target scan found `event-listener@5.4.1`
  (RUSTSEC-2026-0221) in Rolldown. The controlled lock is updated to stable
  5.4.2, the advisory's fixed version. The raw upstream lock remains untouched.

- The browser run exposed duplicate concurrent website builds in Turbo and
  Playwright, which collided in source-delivery staging. Turbo now owns the
  single build; Playwright serves that artifact. The notice page's WCAG target
  sizes were also corrected. Source and notice access includes Rust standard
  library copyright/license material as well as explicit Cargo dependencies.
- Relocating the delivered source changed Cargo's identities for the two local
  path crates. Fresh-build probes established that these salts changed root and
  stem symbols and link output. The owned, shipped `pagefind-rustc.ts` replaces
  only those salts with exact name/version/feature identities, preserving all
  other arguments. Clean WASM target directories prevent stale wrapper results.
  The full delivered-source control now reproduces all three shipped compressed
  WASM objects exactly; no stripping or weaker comparison masks differences.
- Linux CI compiled the native modules but exposed a loader-hook bug: supplying
  an explicit undefined third `dlopen` argument changes Linux behavior. The hook
  now preserves omitted arguments. CI retains failed build logs as artifacts.

## Evidence boundaries and remaining decisions

The selected normal/build graphs, features, exact package licenses, immutable
registry checksums/Git revisions and source-lock dispositions are retained in
`apps/website/qualification/evidence/`. Raw upstream locks and the original
73-occurrence ledger in `docs/research/website-dependency-qualification.md`
remain intact. Added Rolldown coverage produces additional raw findings; those
are retained too. An absent package/version disposition refers to the actual
frozen feature-aware graphs, not an exploitability waiver.

**The native license gate remains closed.** It reports 19 exact selected package
expressions outside the existing policy: Zlib (`const_format`, its proc macro,
both `foldhash` versions and `zlib-rs`), Unicode-3.0 AND terms (`unicode-ident`,
`unicode-id-start`), CC0-1.0 (`rolldown-notify`), BSL-1.0 (`xxhash-rust`), and
MPL-2.0 CSS dependencies (`cssparser` and macros at both selected versions,
`cssparser-color`, `dtoa-short`, `selectors`, `parcel_selectors`, `static-self`
and its derive). The existing allowlist names Lightning CSS/derive itself,
not those additional crates. This continuation grants no further license
exception, even for permissive licenses. The exact versions and elected/failed
expressions are in the qualification JSON. No unapproved selected prerelease
was observed; the two compiler prereleases remain the exact approved versions.

Bootstrap tools are a separate, explicit evidence boundary. Rust 1.99.1,
wasm-bindgen 0.2.117 and CMake 4.4.4 are publisher tools pinned by archive digest
and target. Host compiler/SDK identity is recorded. This is not an independent
source rebuild or complete transitive binary SBOM of those bootstrap tools or
the OS SDK. Cargo package advisories do not establish that broader clearance.
Build reproducibility is qualified for the recorded environment; Linux evidence
must come from its own run. Neither source archive access nor GPL/AGPL combination
permission constitutes human legal clearance.

**Publication remains refused:** domain, monitored support address, seller
information, approved legal document versions, legal/dependency/claim review,
manual accessibility and translation approvals are still absent. The legal
documents remain marked versioned drafts. The browser extension's use of the
shared information component remains #92's handoff. No approval was invented.

## Validation

macOS arm64, Node 24.14.0, pnpm 12.15.0, Rust 1.99.1, Chromium and real
PostgreSQL 18 on port 5433:

| Command | Result |
| --- | --- |
| `pnpm install --frozen-lockfile` | Pass |
| `pnpm pagefind:fetch`, `pnpm pagefind:build`, `pnpm pagefind:verify` | Pass; current recipe/receipt and all selected source graphs retained |
| `pnpm typecheck` | Pass; final modified build tooling also passes `pnpm exec tsc -p scripts/tsconfig.json` |
| `pnpm lint` | Pass; final modified scripts/configs also pass focused ESLint and repository formatting |
| `pnpm i18n:check` | Pass; 73 app messages, 10 paired information pages, four paired legal documents, 28 paired website UI texts |
| `pnpm build` | Pass; controlled website build repeated after final WASM identity fix |
| `git diff --exit-code --` committed contract dist/OpenAPI paths | Pass |
| `SOURCE_TASTER_TEST_API_PORT=53171 SOURCE_TASTER_TEST_WEBSITE_PORT=53173 pnpm test` | Pass: 35 HTTP/SSE tests |
| `SOURCE_TASTER_E2E_API_PORT=60272 SOURCE_TASTER_E2E_WEB_PORT=60274 SOURCE_TASTER_WEBSITE_E2E_PORT=60275 pnpm test:e2e` | Pass: 14 app + 87 website browser tests after the matrix split |
| `SOURCE_TASTER_WEBSITE_E2E_PORT=60275 pnpm --filter @source-taster/website test:e2e` after final WASM rebuild | Pass: 14 website tests, including DE/EN search, every route at 320/1280 px, privacy, source/notices and publication refusal |
| `pnpm audit:licenses` | Pass: 526 installed npm licenses; 67 runtime packages. This does not clear native Rust licenses. |
| `bash scripts/refresh-advisories.sh` | Pass; public npm/crates.io database dates retained in evidence |
| `OSV_SCANNER_BIN=.tmp/audit/osv-scanner pnpm audit:dependencies` | **Fails closed** on 19 native license expressions. Complete scan covers 2,746 occurrences, 687 npm lock identities and 539 selected Rust identities. Zero actual advisory findings; all 79 raw upstream findings retained with dispositions. |
| `node scripts/website-qualification.ts` | **Fails closed** on the same license expressions; source/target/feature/load/delivery evidence is still emitted |
| `node scripts/qualification-controls.ts` | Pass: 17 recorded outcomes, including corruption/additional-input/served-notice refusals, unknown process/native refusals, failed/malformed/empty/omitted-source/positive/stale scans, deterministic source packaging, source-integrity refusal and exact three-language WASM reproduction |
| `pnpm --filter @source-taster/website publication:check` | Refuses missing inputs/approvals as expected; browser and HTTP suites also confirm production preview refusal |
| `git diff --check` | Pass |

The initial concurrent browser attempt failed on duplicate build staging; a
subsequent chosen port was occupied by T3 Code and was left untouched. The final
run used free task ports 60272/60274/60275. The notice page initially failed WCAG
2.2 target size; the corrected full browser run passed. Ports 8000 and 4567 and
unrelated containers/files were untouched.

The original diagnostic failures (type resolution, untyped evidence JSON,
injected JS helpers, worker import.meta, scanner filename, actual event-listener
advisory and source reproduction) were corrected and rerun at their relevant
seams. No failed attempt was counted as qualification success.

### Linux amd64 CI

Ubuntu 24.04 GNU Actions uses the same frozen install and pinned fetch/offline
build/verify pipeline, followed by application/browser and advisory/license
controls. Each run records its own target graphs and receipts; there is no
claim of cross-platform native binary equality.

The first run at `b0cb97dd83e98731738db4017b73eb9d00fc7392`,
https://github.com/jeffnawroth/source-taster/actions/runs/40450909307,
**failed** after successful Rust native compilation when the trace hook supplied
undefined dlopen flags on Linux. It produced no completed build receipt. The
subsequent source reproduction and loader fixes were pushed at
`bdde8340130fa523c77956f1d7ca7b646d902407` and started
https://github.com/jeffnawroth/source-taster/actions/runs/40452770746.
Its dependency job completed the controlled native/WASM build, verification,
website/search/source generation and all 16 then-current operational/source
reproduction controls. Its only failing step was the audit's intentional
refusal of the same 19 license-policy expressions. The downloaded artifact is
retained under `qualification/evidence/linux-amd64/`, tied to the run, job,
commit and original/normalized file hashes. It covers 543 selected Rust
identities, 2,750 scan occurrences, all 79 raw upstream findings and zero actual
advisory findings. The application job passed install, source build/verify, typecheck, lint,
catalog, product build, committed artifacts and HTTP/SSE tests. Its browser
step failed only because the single 74-page/viewport axe loop exceeded its
30-second aggregate test budget; the other 13 website tests passed. Turbo then
interrupted the app suite after 10 passes. The final branch splits that matrix
into 74 independent browser cases, preserving every assertion and the default
per-case timeout; the full local rerun passed 87 website plus 14 app tests.
A final-head branch CI run is triggered by the handoff push; its completion is
not claimed by this older artifact.

Mac and Linux use different pinned host compiler archives. Their WASM hashes
also differ; each source archive reproduces the exact bytes for its own
receipt/toolchain target. Use the tool archives matching `build-receipt.json`;
no cross-host byte-equivalence or interchangeable receipt is claimed. Both
receipts have the same recipe-file digest and explicitly record their host.
The final served-notice corruption check and broader installed Node-API file
inventory were subsequently demonstrated on macOS; the Linux artifact records
the preceding 16-control revision, not a fabricated 17-control run.

No PR checks were watched or polled, no PR was created, and no integration merge
or issue closure was made. `spec/70-launch-product` and its fetched remote remain
at `f3be5dd2c5951ca4b38861d2ad9316de84eb02ee`; both were merged into this
implementation branch (already up to date). Ancestry includes that tip and the
entire preserved `20f18ba` branch.
