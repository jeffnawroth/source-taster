# #225: requalified Pagefind 1.6.0

The controlled website build now pins Pagefind **v1.6.0** (commit
`860a4ea87e7a52379520f9eaefd0f8a6b23eb462`, published 2026-11-01) instead of
v1.5.2. The raw upstream lockfiles under `qualification/upstream/` are the 1.6.0
lockfiles, so the Dependabot alerts that were reported against the 1.5.2 copies
no longer have a matching file content. The controlled locks, patch, scripts,
website source offer and license policy follow the new pin.

## Findings

- **`pagefind_microjson` (GPL-3.0) is gone from the browser WASM.** Pagefind 1.6.0
  replaced it with [`hifijson`](https://crates.io/crates/hifijson) 0.5.0 (permissive).
  The `web-de`, `web-en` and `web-unknown` graphs in the receipt each contain 19
  packages and list `hifijson`, no `pagefind_microjson`. Pagefind's CHANGELOG
  mentions microjson only historically. Consequence: the delivered package no
  longer ships `GPL-3.0.txt`, the GPL source-offer text and the
  `copyleftWasm` allowance in `scripts/website-qualification.ts` are removed, and
  the website source-access page (DE/EN) says the closure has no GPL component.
  The legal status stays `BLOCKED` because the AGPL boundary, source offer and
  human legal review are unchanged and pending. No license waiver is added.
- **Newer advisories against the native CLI lock.** With the 1.6.0 locks and the
  advisory database of 2026-11-20, three identities of the controlled native
  Cargo lock matched: `anyhow@1.0.102`, `crossbeam-epoch@0.9.18` and
  `tokio@1.50.0` (RUSTSEC-2026-0386). They were fixed in the controlled
  lock only (precedent: [#221](221-rustix-advisory.md)), see the table.
- **Two new native license identities** (`selectors@0.37.0`, `emojis@0.9.0`) were
  reviewed against their immutable crate archives and added as exact-identity
  entries in `licenses/policy.json` (`selectors@0.33.0` is no longer selected and
  was removed). Both are native build-time crates of the Pagefind CLI only and do
  not enter the browser WASM.

## Controlled lock changes

Only `version` and `checksum` lines change against the raw upstream locks, and
every change is a stable semver-compatible patch bump:

| Crate (controlled native lock) | Raw 1.6.0 upstream | Controlled | Checksum (SHA-256, Cargo registry) |
| ------------------------------ | ------------------ | ---------- | ---------------------------------- |
| `anyhow`                       | 1.0.102            | 1.0.103    | `2a4385e2…`                        |
| `crossbeam-epoch`              | 0.9.18               | 0.9.20     | `2d691404…`                        |
| `tokio`                        | 1.50.0           | 1.51.6     | `a13e32ea…`                        |
| `tokio-macros` | 2.6.1            | 2.7.2      | `78773a2a…` (required by tokio 1.51.6) |

`cargo update` side effects (`errno`, `winapi-util` moving to `windows-sys 0.52`)
were reverted so the controlled locks differ from upstream only by the rows above.
`controlled/lock-changes.diff` is regenerated; applying it with `patch -p0` to a
copy of `qualification/upstream/` reproduces all five `controlled/locks/*.Cargo.lock`
byte for byte (`cmp`). The raw upstream locks stay byte-identical to the tag
(`upstream/provenance.json` binds their SHA-256). `wasm-bindgen` is now `0.2.129`
(the CLI and the crate must match) and the minimal Pagefind patch was rebased on
1.6.0.

The astro-compiler raw lock still names `anyhow@1.0.102` and `tokio@1.52.3`. They
are retained findings with `blocks: false`: the versions are absent from the frozen
controlled closure of the executed artifacts. No advisory is suppressed or excepted.

## Before and after

| Scan                                                  | Packages | Findings | Blocking |
| ----------------------------------------------------- | -------- | -------- | -------- |
| 1.6.0 raw locks, uncorrected controlled locks (macOS) | n/a      | n/a      | 7 occurrences, 3 identities (`anyhow`, `crossbeam-epoch`, `tokio`) |
| This branch (macOS arm64, DB 2026-11-20)              | 2,739    | 43       | 0        |

The graph sizes (macOS arm64) are 151 native Pagefind packages, 156 compiler, 282
Rolldown, 127 Sätteri and 19 in each of the DE/EN/unknown WASM graphs. The Linux
amd64 receipt is produced by the CI `dependencies` job and attached to this PR's
description.

## Dependabot alerts

The 22 alerts open at the start of the task were all in the two 1.5.2 upstream
lockfiles. The 1.6.0 locks carry patched versions for everything except
`minimatch@10.2.6` in `pagefind-js/package-lock.json` (GHSA-g3hv-75wg-m249). That
copy is never installed or executed (the browser JavaScript is bundled by the
controlled Rolldown from pinned sources), so the remaining alert is dismissed as
"vulnerable code is not actually used" with that rationale. Re-check after
Dependabot rescans the merge commit; the disposition and every retained raw finding
is recorded in `.tmp/audit/website-dispositions.json` of the run.

## Validation

Branch `chore/225-pagefind-1.6`. Host: macOS 27.2 arm64, Node 24, pnpm 12.15.0.
OSV-Scanner 2.7.0 (`osv-scanner_darwin_arm64`), offline, advisory database
`Last-Modified` 2026-11-20 (npm 12:33:35 GMT, crates.io 00:48:20 GMT).

| Command                                                          | Result                                                                  |
| ---------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `pnpm pagefind:fetch`                                            | exit 0                                                                  |
| `pnpm pagefind:build`                                            | exit 0, frozen offline build                                            |
| `pnpm pagefind:verify`                                           | exit 0 (also re-run after the controls)                                 |
| `pnpm --filter @source-taster/website build`                     | exit 0                                                                  |
| `pnpm audit:licenses`                                            | exit 0                                                                  |
| `bash scripts/refresh-advisories.sh`                             | exit 0                                                                  |
| `OSV_SCANNER_BIN=.tmp/audit/osv-scanner pnpm audit:dependencies` | exit 0; 2,739 packages, 43 findings, **0 blocking**, 0 license issues   |
| `OSV_SCANNER_BIN=.tmp/audit/osv-scanner node scripts/qualification-controls.ts` | exit 0                                           |

Receipt SHA-256 (macOS arm64 run):

- `.tmp/pagefind/receipt.json` `38194524742afe3cd14bdea992452d123609d497aacdf663aa1d2fafe804a445`
- `.tmp/pagefind/graphs.json` `7faa0bdbab4132fb3fe5141676c5082d8f5707c27fab283f91dd49d735348fa3`
- `.tmp/audit/osv.json` `d340eec783c82d5d099b0cc319e547d044ded08aa1f50909445d9ec5dfc55afb`
- `.tmp/audit/website-dispositions.json` `0608779c10975d9bd3a1ae0a1c14bee9565d699a86d54ff303c514b4ba135240`
- `controlled/locks/native.Cargo.lock` `911062dc5b2d9fcc48b8a2e2c87f46ecdaa4048f4b2c7fdd09b722711452b480`
- `controlled/locks/web.Cargo.lock` `ba79c32b7f728d0788067adc278699505018f869c26d63133c0af213689a2d51`
- `controlled/lock-changes.diff` `040cdd832db3b068868deffecaeb5f2bfa8e0b687d954a0525c8153e8adc0a4a`
- shipped WASM (gzip): unknown `142a480e…feca8df`, de `d4094cd7…6c1b`, en `4c4441aa…43c0`

## Limitations

- `qualification/evidence/macos-arm64/` and `historical/` are **not** regenerated:
  they are retained snapshots of the earlier recipe (as in #221). The current
  receipt is the macOS arm64 run above and the Linux amd64 CI artifact.
- This is technical evidence, not a Linux native build qualification, a cross-host
  byte-equivalence claim or an independent bootstrap-tool source rebuild.
- Human native/license, legal, publication, translation, manual accessibility and
  deployed-environment gates remain in force. The `provenance.json` `verifiedAt`
  date was deliberately not changed because no human re-verification took place.
- `qualification/inventory.json` is a retained snapshot and was not regenerated here.
