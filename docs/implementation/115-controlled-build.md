# #115 controlled build continuation

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

Final command results and Linux execution state are recorded below after the
last controlled lock rebuild. Earlier diagnostic failures included missing
Rolldown type resolution, unsafe untyped evidence JSON, injected runtime helper
inputs, classic-worker `import.meta`, the unsupported scanner filename and the
real event-listener advisory. They were not treated as qualification successes.
