# #221: fixed Rustix in the controlled website build

The controlled Rolldown lock selects stable `rustix` **1.1.6** instead of
**1.1.4**. No application code, npm dependency, target, feature selection,
qualification assertion, license policy, font or contract changes.

## Advisory and immutable source

- [RUSTSEC-2026-0486](https://rustsec.org/advisories/RUSTSEC-2026-0486.html),
  alias `GHSA-jh2m-fhpj-3vr7`, identifies unsound zero-length extended-attribute
  buffer handling in `>=1.0.0, <1.1.6`. The primary
  [advisory source](https://github.com/rustsec/advisory-db/blob/main/crates/rustix/RUSTSEC-2026-0486.md)
  names `>=1.1.6` as patched; no severity or exploitability exception is used.
- The [upstream fix](https://github.com/bytecodealliance/rustix/commit/8e6aaa6713d2bb64b1fdd8c472e3a32a10a76d70)
  returns zero initialized bytes for an empty buffer and adds explicit size-query
  functions. The immutable
  [1.1.6 crate](https://static.crates.io/crates/rustix/rustix-1.1.6.crate)
  contains that handling. Its `.cargo_vcs_info.json` identifies
  `4a563ad698b2c20ff848515821023d2265a788d0`; GitHub's primary comparison reports
  it one commit ahead of the fix, with zero commits behind.
- Crate SHA-256: `e5e76742e5294153d4dde1207dbec5bdd81eef6fabdc0d2118babadabfd858aa`.
  Cargo's registry checksum and the independently downloaded archive agree.
  The manifest retains `Apache-2.0 WITH LLVM-exception OR Apache-2.0 OR MIT`.

Against `136748f`, the committed `rolldown.Cargo.lock` diff changes only
Rustix's `version` and `checksum` lines. `pagefind:fetch` accepts it under
`--locked`; Cargo lock resolution covers all targets, so the same lock serves
the Linux build. The regenerated `controlled/lock-changes.diff` reconstructs all five
controlled locks from unmodified upstream snapshots. Other controlled locks
retain their unselected identities; raw upstream locks and every existing
historical evidence file remain byte-for-byte unchanged.

## Before and after

The red is the real, complete offline scan from
[CI 42996901562](https://github.com/jeffnawroth/source-taster/actions/runs/42996901562)
(Linux amd64 GNU, head `3c8247b`). Its `dependency-evidence` artifact, freshly
re-downloaded with `gh run download` and byte-compared (`cmp`) with the copy used
in this work (`summary.json` SHA-256
`62792694c998143f20d7fe1715ef7d91994c1862ecb7093346050a08e362d720`), reports
2,797 package occurrences, 734 npm lock identities, 94 findings and **five
blocking occurrences**: selected `crates.io:rustix@1.1.4` plus its four raw
upstream-lock appearances (Pagefind native, Astro compiler, Rolldown and
Sätteri). There are zero license issues. In that Linux `graphs.json`, the only
selected `rustix` is `rolldown` package 226 at 1.1.4. No other controlled closure
selects it, so the Rolldown lock is the whole fix. No code seam exists for a
unit test: that CI scan is the red, and the local scan below is the green. No
constant or simulated scan stands in for either.

Like-for-like macOS arm64 graphs (before: the same recipe built at the
integration base; after: this branch) keep every target and feature selection:
151 native Pagefind packages, 156 compiler, 282 Rolldown, 127 Sätteri and 19 in
each of the DE/EN/unknown WASM graphs. The only identity change is
`rustix@1.1.4` → `rustix@1.1.6` in Rolldown. Rustix stays build-only, and no
graph surface is relabeled.

| Scan                    | Host         | Packages | Findings | Blocking |
| ----------------------- | ------------ | -------- | -------- | -------- |
| CI 42996901562 (before) | Linux amd64  | 2,797    | 94       | 5        |
| This branch (after)     | macOS arm64  | 2,793    | 93       | 0        |

The package and finding counts differ across hosts (different native target
closures and a newer advisory database), not because of the pin. Only the
blocking count and the selected-identity change are comparable. After the fix,
the four raw-upstream `rustix@1.1.4` findings are still retained, with
`blocks: false`: the version is absent from the frozen controlled closure of the
executed artifacts. The selected `rustix@1.1.6` matches no advisory. No
advisory is suppressed or excepted.

## Validation

Branch `fix/221-rustix`, based on integration commit `136748f`
(`git merge-base --is-ancestor 136748f HEAD` passes). Host: macOS 27.2 arm64,
Apple clang 21.0.0, Node 24.14.0, pnpm 12.15.0. The only reused input was
`.tmp/pagefind/downloads/`, which `fetch` re-hashes against `inputs.json`.
Toolchains, Cargo home, sources, targets, graphs and evidence were all rebuilt
in this worktree.

| Command                                                                   | Result                                                                                                       |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `pnpm install --frozen-lockfile`                                          | exit 0                                                                                                       |
| `pnpm pagefind:fetch`                                                     | exit 0; `Pinned source fetch complete: aarch64-apple-darwin`                                                 |
| `pnpm pagefind:build`                                                     | exit 0; frozen offline build; `Built controlled Pagefind: aarch64-apple-darwin`                              |
| `pnpm pagefind:verify`                                                    | exit 0; `Verified controlled Pagefind 1.5.2`, also re-run after the controls                                  |
| `pnpm --filter @source-taster/website build`                              | exit 0; `Delivered hash-bound browser source/notice package: 17 registry source packages`                    |
| `pnpm audit:licenses`                                                     | exit 0; 570 installed package licenses, 108 runtime packages                                                 |
| `bash scripts/refresh-advisories.sh`                                      | exit 0; npm DB `Last-Modified` 15:33:06 GMT, crates.io 12:47:47 GMT (2026-11-11)                             |
| `OSV_SCANNER_BIN=.tmp/audit/osv-scanner pnpm audit:dependencies`          | exit 0; offline, 2,793 packages, 93 findings, **0 blocking**, 93 raw findings preserved, 0 license issues    |
| `OSV_SCANNER_BIN=.tmp/audit/osv-scanner node scripts/qualification-controls.ts` | exit 0; all 23 result entries pass (below)                                                                  |

OSV-Scanner was the v2.7.0 `osv-scanner_darwin_arm64` release binary. Its SHA-256
`d4926ef8da134332543be276dff157e4c170f99ad91fc48e89448a8816bdf70b` matches the
release's `osv-scanner_SHA256SUMS` (CI pins the `linux_amd64` binary instead).

Qualification controls: 12 descendant-process and 3 publication-recipe controls
pass. The controls refuse changed Pagefind artifacts, pinned sources/tools and
website artifacts; uncontrolled executables and native modules; failed, missing,
malformed or incomplete OSV reports and source inventories; an actual selected
dependency advisory; a missing, empty or stale OSV database; and a source
checksum mismatch. Source delivery reproduces from identical inputs, and the
delivered source rebuilds all three shipped WASM objects:

- unknown `57d4fe27f3ffba60b6746b3de22a5b62e73b660163591f3fc68801f4d4d0f020`
- de `9be38f1840da3e66a1ca52851ca8a8cff2da8965a02b56ac50eb478980c77754`
- en `888b8a2cdf0d030ca5539f78110147c692d446ef6fb4b93ef9aeba948ac3e9fe`

Afterwards, `git status` was clean.

Further checks:

- A fresh download of `rustix-1.1.6.crate` hashes to the lock checksum
  `e5e76742…858aa`. Its `.cargo_vcs_info.json` names `4a563ad`, and its manifest
  license is `Apache-2.0 WITH LLVM-exception OR Apache-2.0 OR MIT`.
- Applying `controlled/lock-changes.diff` with `patch -p0` to a copy of
  `qualification/upstream/` reproduces all five `controlled/locks/*.Cargo.lock`
  byte for byte (`cmp`).
- `git diff 136748f -- apps/website/qualification/upstream apps/website/qualification/evidence`
  is empty.

Receipt SHA-256 (macOS arm64 run):

- `.tmp/pagefind/receipt.json` `6d23689c0f01e64d3980fbb6842f862868cf714cf15a5ce9d08486596485c1aa`
- `.tmp/pagefind/graphs.json` `7f61e5b2d67ddc2f6179b02c727cc5adb85208f0745d2d67ffaa97ba3fb42c5b`
- `.tmp/audit/osv.json` `0b0f3951985f5847ede70c69ed1c4acfc6885a16ffe0145cb0aa7b1e1d0d0796`
- `.tmp/audit/website-dispositions.json` `a1e47c4872a0de25745f6dd1a18fe4d7ebd1e8a0b3a82528942b5630d9494028`
- `controlled/locks/rolldown.Cargo.lock` `054947186341e3158c4da32bb9d8b292d0002b538b952623cec906d58f9a5528`
- `controlled/lock-changes.diff` `d1494bb5f657dc99f3772ea3ef5ee545ca0cf38b4efeafd2271e53f121ef5e72`
- `dist-preview/third-party/pagefind/manifest.json` `bd66eac8b37173283d608dc86d8c92c0fa9924bab50f9ce458845e628b461014`

## Limitations

This is macOS arm64 technical evidence. It is not a Linux native build
qualification, a cross-host byte-equivalence claim, or an independent
bootstrap-tool source rebuild. The Linux amd64 GNU result needs its own `verify`
and `dependencies` CI run on the integration PR. Human native/license, legal,
publication, translation, manual accessibility and deployed-environment gates
remain in force. This task includes no private service activation, publication,
PR, push or issue closure.
