# #293: requalified Rolldown 1.2.19 with Vite 8.3.8

The controlled website build now pins Rolldown **v1.2.19** (commit
`b9c75ddc8bd50f2c1a4c7be0b548bdab5cba85ab`, released 2026-11-11). Before this
change it pinned v1.2.15. The apps use **Vite 8.3.8** (also 2026-11-11), which
requires Rolldown `~1.2.18`. Vite and the controlled build therefore resolve one
Rolldown version, `1.2.19`. The only other copy in the workspace is the `1.3.3`
that Astro 7.4.7 depends on directly.

## Why

- **Vulnerable versions.** [GHSA-p4f5-76q4-ffq7](https://github.com/vitejs/vite/security/advisories/GHSA-p4f5-76q4-ffq7)
  (critical, published 2026-11-10):
  - remote code execution through the dev server's `__vite-browser-external`
    and `__vite-optional-peer-dep` virtual modules;
  - affects Vite `>=8.3.0 <=8.3.6`;
  - the vulnerable code is in the Rolldown binary, and the fix shipped in
    Rolldown 1.2.17 (Vite 8.3.7).

  Main ran Vite 8.3.5 with Rolldown 1.2.15.
- **Exposure.** The advisory needs a dev server reachable from the network. Every
  Vite dev server here binds `127.0.0.1`:
  - `apps/web` (its `dev` script and `vite.config.ts`);
  - `apps/web/e2e-sensitive`;
  - the `packages/ui` gallery.

  The extension only runs `vite build`. The website uses the Astro default
  (localhost). So the condition was not met, but the vulnerable versions are
  removed anyway.
- **Audit gap.** `audit:dependencies` passed on the vulnerable versions. The
  advisory exists only as a vitejs/vite repository advisory: OSV and the global
  GitHub Advisory Database both return 404 for it, and the offline audit can only
  match what those databases contain.
- **Version choice.** Vite 8.3.8 and Rolldown 1.2.19 are the newest releases
  inside pnpm's release-age window. Vite 8.4.0 (Rolldown `~1.3.2`) was published
  on 2026-11-26. pnpm would add a `minimumReleaseAgeExclude` entry for it, and this
  repository does not add exclusions. Dependabot #286 (root Rolldown 1.3.3) would
  put Vite and the controlled build on different Rolldown versions, so this
  change supersedes it. It also supersedes #285 (Vite 8.3.8 only), which could
  not pass the Rolldown pin on its own.

## What changed

- **Pins.**
  - The root `package.json` now pins `rolldown` to `1.2.19`.
  - `scripts/pagefind-bundle.ts` checks `rolldown.VERSION`, and
    `scripts/pagefind-source.ts` records the pinned version.
  - The pin is also named in the `scripts/audit.ts` and
    `scripts/pagefind-delivery.ts` messages and in `controlled/README.md`.
  - `apps/web`, `apps/extension` and `packages/ui` declare `vite` `8.3.8`.
- **Inputs.**
  - The `rolldown` block of `controlled/inputs.json` names tag `v1.2.19`, commit
    `b9c75ddc…` and the codeload archive. The archive SHA-256 is
    `43b03063f86d0010194ac9d77d40e39c5c819839b5066758f1ee5f37fc38b549`.
  - `upstream/provenance.json` binds the raw v1.2.19 `Cargo.lock` with SHA-256
    `53b61b7076839e2c9c4d906eeeee4d49509be6b93d6ce93a6d1388a467b81657`. That is
    the same file as `Cargo.lock` in the tagged archive.
- **Raw upstream lock.** `upstream/rolldown/Cargo.lock` is the v1.2.19 lock,
  byte-identical to the tag. The other six upstream snapshots are unchanged.
- **Controlled lock.** `controlled/locks/rolldown.Cargo.lock` is the v1.2.19
  lock plus the security updates in the table below. Unlike the 1.2.15
  controlled lock, it keeps the upstream `windows-sys` entries.
- **Lock diff.** The rolldown section of `controlled/lock-changes.diff` was
  regenerated. The other four sections are unchanged.

Applying `lock-changes.diff` with `patch -p0` to a copy of `qualification/upstream/`
reproduces all five `controlled/locks/*.Cargo.lock` byte for byte (`cmp`).
`cargo metadata --locked` accepts the controlled lock.

## Controlled lock changes

Stable, semver-compatible updates on top of the raw v1.2.19 lock. Each one carries
an earlier controlled fix forward ([#221](221-rustix-advisory.md), #288/#290) or
replaces a version that has an advisory.

| Crate (controlled rolldown lock) | Raw 1.2.19 upstream | Controlled | Advisory fixed      | Checksum (SHA-256, Cargo registry) |
| -------------------------------- | ------------------- | ---------- | ------------------- | ---------------------------------- |
| `event-listener`                 | 5.4.1               | 5.4.2      | RUSTSEC-2026-0221   | `5a23add4…`                        |
| `form_urlencoded`                | 1.2.2               | 1.2.3      | required by `url`   | `afa48919…`                        |
| `rustix`                         | 1.1.4               | 1.1.6      | RUSTSEC-2026-0486   | `e5e76742…`                        |
| `url`                            | 2.5.8               | 2.5.9      | RUSTSEC-2026-0592   | `f00cd240…`                        |

The controlled lock lists `parking` and `pin-project-lite` as the dependencies
of `event-listener` 5.4.2. They are the only dependencies its crate manifest enables
by default on non-WASM targets (`std` enables `parking`), so `concurrent-queue`
drops out of that entry.

The raw v1.2.19 lock still names `event-listener@5.4.1`, `rustix@1.1.4`,
`url@2.5.8` and `generator@0.1.0`. They are retained findings with
`blocks: false`, because those versions are absent from the frozen controlled
closure of the executed artifacts. No advisory is suppressed or excepted.

## Before and after

| Scan                                     | Packages | Findings | Blocking |
| ---------------------------------------- | -------- | -------- | -------- |
| Main 47c0bec (Vite 8.3.5, Rolldown 1.2.15) | n/a    | n/a      | 0 (GHSA-p4f5-76q4-ffq7 is not in OSV, see above) |
| Branch at 270d8da (macOS arm64, DB 2026-11-26) | 2,755    | 45       | 0        |

Graph sizes on macOS arm64:

| Graph                        | Packages                    |
| ---------------------------- | --------------------------- |
| Rolldown                     | 286 (was 282 with 1.2.15)   |
| native Pagefind              | 151                         |
| compiler                     | 156                         |
| Sätteri                      | 127                         |
| DE, EN and unknown WASM      | 19 each                     |

`audit:licenses` and the native license check in `audit:dependencies` report no
license issue. The new crates in the Rolldown graph resolve to entries already in
`licenses/policy.json`, so the policy is unchanged.

The Linux amd64 receipt comes from the CI `dependencies` job of the merged head; the
PR description links that run.

## Build output of the apps

Vite 8.3.8 changes how the web app and the extension are bundled. Both apps were
built on main 47c0bec and on this branch, and the results compared:

- **Identical:** the CSS (`index-CeSj-8kd.css`), the fonts, and every other asset
  except the entry chunks. The web `index.html` and the extension `panel.html`
  differ only in the chunk hash.
- **Entry chunks:** the web `index-*.js` and the Chromium and Firefox
  `panel-*.js` differ in four places each. In every place the minifier writes a
  discarded `!a && b` as `a || b`:
  - two Zod regex checks;
  - the react-aria `pointerup` cleanup;
  - react-aria `disallowEmptySelection`.

  All four are expression statements whose value is unused, so behaviour is
  the same.

The built UI is therefore visually unchanged.

## Validation

Branch `chore/293-rolldown-1.2.19` at `270d8da` (base main `47c0bec`), before main was
merged in. Later merges from main did not touch the Rolldown pin or the controlled
recipe. Host: macOS 27.2 arm64, Node 24, pnpm 12.15.0.
The scan used OSV-Scanner 2.7.0 (`osv-scanner_darwin_arm64`, SHA-256
`d4926ef8…f70b`, as listed in the release `SHA256SUMS`), offline. Advisory
database `Last-Modified`: npm 2026-11-26 13:33:21 GMT, crates.io 2026-11-26
08:18:18 GMT.

| Command                                                          | Result                                                                |
| ---------------------------------------------------------------- | --------------------------------------------------------------------- |
| `pnpm install --frozen-lockfile`                                 | exit 0                                                                |
| `pnpm pagefind:fetch`                                            | exit 0                                                                |
| `pnpm pagefind:build`                                            | exit 0, frozen offline build, Rolldown 1.2.19 compiled from the pinned archive |
| `pnpm pagefind:verify`                                           | exit 0                                                                |
| `pnpm --filter @source-taster/website build`                     | exit 0                                                                |
| `pnpm audit:licenses`                                            | exit 0, 568 installed package licenses reviewed                       |
| `bash scripts/refresh-advisories.sh`                             | exit 0                                                                |
| `OSV_SCANNER_BIN=.tmp/audit/osv-scanner pnpm audit:dependencies` | exit 0; 2,755 packages, 45 findings, **0 blocking**, 0 license issues |
| `OSV_SCANNER_BIN=.tmp/audit/osv-scanner node scripts/qualification-controls.ts` | exit 0, all refusal controls passed; delivered source reproduces the three shipped WASM objects |
| `pnpm pagefind:verify` (after the controls)                      | exit 0                                                                |

Receipt SHA-256 (macOS arm64 run):

- `.tmp/pagefind/receipt.json`: `e52bef64b360da57e07d6865b97436616a152d9069fe8a5f876a9d6ba1915a09`
- `.tmp/pagefind/graphs.json`: `a3d1e761428cf61e058a7e2af19a334edbb12c2c04ca2ca12e987e0a2de1baf5`
- `.tmp/audit/osv.json`: `423e0e838508645996f05b056b6480c148660710c9a6315bc4455d174885ca4e`
- `.tmp/audit/website-dispositions.json`: `1cac91bd0b7b9e854e08acc594169abc06737efe2fc443fc15f5d40039b25f05`
- `controlled/locks/rolldown.Cargo.lock`: `22ee688b4b39c04a965a374989eee60a4bdbb777679e5976e33c6a2be792a221`
- `controlled/lock-changes.diff`: `16c4fb21a46af71ebaf6ea40da68dd3da99e2138b2052df353a0f79c2b7c4f39`

## Limitations

- **Retained snapshots.**
  - `qualification/evidence/macos-arm64/`, `historical/` and
    `qualification/inventory.json` are **not** regenerated. They are retained
    snapshots of the earlier recipe, as in [#225](225-pagefind-1-6.md) and #221.
  - The current receipts are the macOS arm64 run above and the Linux amd64 CI
    artifact.
  - The #293 decision comment planned to move the current evidence set to
    `historical/`; this change follows the #225 precedent instead.
- **Scope of the evidence.** This is technical evidence. It does not qualify a
  Linux native build, claim cross-host byte equivalence, or rebuild the
  bootstrap tools independently from source.
- **Human gates.**
  - The native/license, legal, publication, translation, manual accessibility
    and deployed-environment gates remain in force.
  - `provenance.json` `verifiedAt` was deliberately left unchanged, because no
    human re-verification took place.
- **Other Rolldown copies.** Astro's own Rolldown 1.3.3 is outside the controlled
  recipe and unchanged by this PR.
