# #115 consolidated qualification and review fixes

This continuation starts at parent integration `f3be5dd` and fast-forwards the
preserved `edf6ac3` branch, including controlled pipeline `cb04e23` and the first
review fixes. It does not reset or reimplement the preserved work. The private
service and predecessor remain out of scope. No PR is created and no integration
merge is performed. Parent review and integration into #118 remain separate.

## Changes and qualification boundaries

The exact technical license registry now has a primary-source review in
`docs/research/115-native-license-terms.md`: 19 freshly downloaded immutable crate
archives, all 140 pinned text/manifest/source files and 19 VCS records verified.
Zlib, Boost and CC0 handling preserves actual upstream notices. Unicode elects
`MIT AND Unicode-3.0`, retaining both conjuncts. Exact MPL normal/build scopes
retain unmodified covered source archives, MPL text and source-access notices
for build-tool recipients. There is no general runtime MPL permission, private
service permission, new prerelease exception or human legal approval.

The Node preload resolves executables using the child's cwd and PATH, executes
the resolved absolute path, and carries captured preload/bin/trace configuration
into Node descendants even with a replaced environment. Operational controls
cover spawn/spawnSync/execFile/execFileSync/fork, guarded legitimate children and
child cwd/PATH refusal. This is known-build execution evidence, not an adversarial
or OS sandbox.

`website-recipe.ts` defines one fingerprinted input set consumed by both native
receipts and publication reviews. It includes native build, delivery, inventory,
audit, license and control scripts plus policy/text inputs. Changing any of the
three omitted bundle/rustc/native-trace scripts invalidates existing review
hashes through the real publication fingerprint command. No fabricated reviewer,
domain, seller, legal text or approval is committed.

Source access has paired DE/EN pages, same-page language switches, translated
visible content/title/description and language-specific footer links. A paired
catalog completeness check covers these texts. Authentic license texts, source
archives and object hashes remain separately downloadable without translation.

The scanner clears prior output before invoking OSV, including derived summaries.
Missing current output is refused for both accepted scanner statuses 0 and 1.
Controls preseed a complete clean report and then run a scanner that writes
nothing, independently of native license failures. Existing failed, malformed,
empty, incomplete-source, positive-advisory and stale-database controls remain.

## Current validation

The final complete regression ran after all source/policy changes on macOS arm64,
Node 24.14.0, pnpm 12.15.0 and the pinned Rust 1.99.1 tools. Frozen install,
fetch/build/verify, typecheck, lint, catalog completeness, product build and
committed transport-artifact checks pass. `pnpm test` passes **35 HTTP/SSE tests**;
`pnpm test:e2e` passes **14 app + 92 website Chromium tests**, including DE/EN
source-page navigation, all five download paths, WCAG 2.2 AA axe and reflow at
320/1280 px. Existing search/privacy/claim/legal draft tests remain green.
The catalog reports 73 app messages, 10 paired information pages, four paired
legal documents, 29 paired website UI texts and eight paired source-access texts.

`pnpm audit:licenses` passes the installed npm license inventory. The real
`OSV_SCANNER_BIN=.tmp/audit/osv-scanner pnpm audit:dependencies` now **passes**,
with **539 selected Rust identities**, **2,746 scanned occurrences**, **687 npm
lock identities**, **zero native license issues**, **zero actual-target advisory
findings**, and **all 79 raw upstream occurrences retained**. Raw upstream locks
and the source-lock research ledger are unchanged. The npm database is dated
2026-10-27 08:48:32 UTC; crates.io is dated 2026-10-26 14:18:55 UTC. The reused
macOS scanner's SHA-256 `d4926ef8da134332543be276dff157e4c170f99ad91fc48e89448a8816bdf70b`
matches the publisher's v2.7.0 darwin_arm64 release digest; version is checked
again by the adapter. Cache sources/tools were copied locally and validated;
no old worktree or global Rust toolchain was modified.

`node scripts/qualification-controls.ts` passes **23 top-level outcomes**, which
include **12 descendant-process**, **3 publication fingerprint** and **13 exact
native-license** subcontrols. All controls use the process/scanner/review CLI or
browser boundary; none asserts private calls or database table state. The
retained control log covers artifact/source/notice changes, unknown execution,
exact identity/scope/archive/text/Unicode refusals, scanner error/no-write/empty/
malformed/incomplete/positive/stale cases, deterministic source packaging,
source-integrity refusal, and exact reproduction of DE/EN/unknown served WASM.
A post-control source/artifact verification passes, confirming temporary
mutations were restored. Publication check exits 1 as expected on the original
missing deployment/legal/review inputs; it is not counted as publication approval.

Focused red/green evidence is retained: the original descendant spawn control
printed `ESCAPED`; the original publication digest survived the bundle-script
change; the German source-page footer opened the English-only landing page; and
exit 1/no-write reused a complete clean report, returned success and reported
zero findings with zero license issues. After the fixes, the controls pass,
source-page navigation succeeds and both scanner statuses 0/1 refuse missing
current output. The final missing-output control is independent of license
failure. One refreshed-input attempt named a nonexistent `.npmrc`; it failed
closed, that nonexistent input was removed from the definition, and the full
fetch/build/verify and final regression passed afterward.

Current recipe SHA-256:
`f8ce06b5c8937c0e5a4e98122bcaa65a7810b02858b0c272419d8494ed99b5c7`.
Current evidence is in `qualification/evidence/macos-arm64/`, with original and
retained hashes, the implementation commit, actual receipt/graphs, advisory
ledger, license source/notice manifest and exact command/control logs. The
complete source artifact includes all fingerprinted recipe inputs as well as
authentic browser source, notices and immutable dependency archives. Native
build-tool source archives remain available in `.tmp/pagefind/license-sources/`
and the configured CI dependency artifact; these do not create a website runtime.

The old macOS/Linux evidence is retained under
`qualification/evidence/historical/cb04e23/`; it does not qualify the new recipe.
All 79 raw advisory occurrences and upstream source locks remain visible.
Publication remains closed on missing real deployment identity, versioned legal
approval and current human legal/dependency/claim/accessibility/translation reviews.


Test processes used fresh per-run database/role identities on the existing
PostgreSQL 18 service (5433), HTTP ports 61321/61323 and browser ports
61322/61324/61325. Focused browser controls used 61315. Ports 8000/4567 and
unrelated containers/files were left untouched. No private repository work,
issue closure, PR creation, integration merge or check polling occurred.

The final push targets `t3/website-qualification-consolidated`, matching the
existing narrowly scoped CI trigger. Its Linux run is pending at handoff;
older Linux results are historical and do not qualify this recipe. Each platform
must reproduce its own exact served WASM; cross-platform byte equality is not
claimed. Bootstrap binary SBOM/source-rebuild limits and all human legal,
publication, manual accessibility and translation approvals remain explicit.
