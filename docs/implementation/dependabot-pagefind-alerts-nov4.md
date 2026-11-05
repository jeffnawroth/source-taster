# Dependabot alerts on the Pagefind upstream locks (4 Nov 2026)

Read-only analysis. No alert was dismissed or modified, no lockfile was edited,
and no Pagefind bump was made. Everything here is derived from public sources.

## Summary

All 32 open alerts sit in two **verbatim upstream snapshots** under
`apps/website/qualification/upstream/`:

- `pagefind-js/package-lock.json` (20 alerts: brace-expansion, tar, js-yaml, minimatch, glob, esbuild; every alert has scope `development`)
- `pagefind-native/Cargo.lock` (12 alerts: rustls, rustls-webpki, quinn-proto, actix-http, tar, rand)

Neither file is installed, resolved by a build, or shipped. They are audit and
provenance inputs only. By the recorded macOS arm64 build evidence, none of the
vulnerable crate/package versions is in the compiled Pagefind CLI or the
browser WASM. The upstream npm lock is not installed. The project's own
`pnpm-lock.yaml` does contain `brace-expansion@5.0.12` and `minimatch@11.0.3`,
both at or above the fixed versions of the matching alerts, and none of the
other four alerted npm packages. The `dependencies` job on the latest `main` CI run
(run 41908432843, head `d40e3ea`, 4 Nov 2026) passed `Match all lockfile
packages offline`, so the OSV gate reported no finding in the selected Linux graph
or in `pnpm-lock.yaml`. I found no runtime exposure in the website, web app,
extension or server, and no build-time exposure in the selected graph.
(That run's overall conclusion was a failure from `server-tests (4/4)` and
`checks`, which are unrelated to this analysis.)

Recommendation: **dismiss the 32 alerts (human action, per group, with an
evidence-citing comment)**. A Pagefind bump (option a) is worth doing later for
its own reasons. Excluding the paths in `dependabot.yml` (option b) would not
close any alert, so I made no config change.

## 1. What the directories are and how they are used

- `upstream/*/` hold byte-for-byte copies of lockfiles from Pagefind v1.5.2
  (commit `bf17396`), compiler-rs, Sätteri and Rolldown. `provenance.json`
  pins tag, commit and SHA-256 of each file.
- Consumers are `scripts/audit.ts` (the OSV scan behind `pnpm audit:dependencies`,
  which runs in CI), `scripts/website-inventory.ts` and
  `scripts/website-qualification.ts`. They read these files as data. They
  need the exact paths and hashes.
- `pnpm pagefind:fetch|build|verify` (`scripts/pagefind-source.ts`, run in CI and
  in `deploy-scalingo.yml`) downloads the checksum-pinned Pagefind 1.5.2 source
  tarball, applies `controlled/patches/minimal-pagefind.patch`, **replaces its
  lockfiles with `controlled/locks/native.Cargo.lock` and `web.Cargo.lock`**,
  then builds offline with the pinned Rust toolchain. Nothing reads
  `upstream/pagefind-native/Cargo.lock` during the build. Nothing runs
  `npm install` or `npm ci` against `pagefind-js/package-lock.json`. The
  browser JS is bundled by the pinned Rolldown 1.2.15 binding straight from
  `pagefind_web_js/lib` sources (`bundle.json` lists every module).
- Policy: ADR-0020 (controlled minimal Pagefind source build, owned maintenance,
  raw upstream findings preserved with dispositions), `docs/dependency-policy.md`,
  `docs/validation-115.md`, `docs/research/website-dependency-qualification.md`,
  `docs/implementation/115-controlled-build.md`.
- The repo's own gate already holds the raw findings. `audit.ts` records each
  one in `website-dispositions.json` with `blocks: false` for raw-upstream
  sources. It **blocks on any finding in the selected build graph or in
  `pnpm-lock.yaml`**. The latest macOS evidence has 79 raw findings, 0 blocking
  (`qualification/evidence/macos-arm64/advisory-dispositions.json`).
- The `upstream/` files are not copied into the served site, the server, the web
  app or the extension.

## 2. What is compiled into what we ship or run

Source: `evidence/macos-arm64/graphs.json` and `*.tree.txt` (selected normal+build
closures from `cargo tree`, target `aarch64-apple-darwin`). That evidence was
captured at implementation commit `eb23649` (27 Oct 2026), and the recipe files
(`controlled/`, `pagefind-source.ts`, `website-recipe.ts`) have not changed since
(last touched in `eb23649`). The Linux amd64 evidence in `evidence/historical/`
predates the current recipe; the live CI `dependencies` job above is the
current Linux check. I did not re-derive the closures; this is a read of the
recorded evidence.

| Artifact | Features | Packages | actix-http / rustls / rustls-webpki / quinn-proto / tar / rand |
| --- | --- | --- | --- |
| Pagefind CLI (native) | `--package pagefind --no-default-features` | 151 | none present |
| Pagefind WASM (de, en, unknown) | `--no-default-features` + language | 19 each | none present |
| Astro compiler (`astro_napi`) | `--no-default-features` | 156 | `rand 0.8.6` only, which is a fixed version and has no alert |
| Rolldown / Sätteri | release selection | 282 / 127 | none present |

Why: `actix-http` arrives only via the `serve` feature (default upstream). The
patch makes it `default = []` and the CLI additionally refuses
`--serve/--service/--write-playground`. `rustls`/`webpki` come from `reqwest`
in the dictionary build for the `extended` tokenizer, which is not selected
(`reqwest/http3`, hence `quinn-proto`, is absent even from the full tree, as
the research doc notes). I did not establish where the `tar` crate enters
upstream; it is absent from the selected tree either way. The unmodified lock
still lists all of these versions, because a lockfile lists every feature
combination. Listing is why Dependabot matches them.

## 3. Per-alert assessment

"Runtime" means a shipped artifact or server code path. "Build" means a build or CI
step on our side. I have not analysed each advisory's exploit mechanics in depth.
The conclusions rest on the package not being installed or compiled, and on
there being no attacker-controlled input to the upstream tooling.

| Group (alerts) | Advisories | Runtime | Build | Exploitable with inputs we control? |
| --- | --- | --- | --- | --- |
| **tar (npm)** #3, #7, #8, **#9 critical**, #10, #11 | GHSA-vmf3-w455-68vh, -gvwx-54wh-qm9j, -8x88-c5mf-7j5w, **-23hp-3jrh-7fpw**, -w8wr-v893-vjvp, -r292-9mhp-454m | No | No. Dev-tooling ancestry in Pagefind's JS test setup (the research doc ties it to AVA), never installed. | No. Nothing extracts archives with it. |
| brace-expansion #1, #5, #12, #13, #16, #17, #18 | GHSA-jxxr-4gwj-5jf2, -3jxr-9vmj-r5cp, -mh99-v99m-4gvg, -rgw5-rvv9-x895, -6j4f-fj2g-mc7p, -qhr7-859c-m2p7, -q2hr-2g5m-vwhr | No | No (not installed) | No |
| js-yaml #4, #6, #14, #15 | GHSA-h67p-54hq-rp68, -52cp-r559-cp3m, -5p4m-2wfm-xmqj, -2883-xcg3-v3hh | No | No | No |
| minimatch #32, glob #31 | GHSA-g3hv-75wg-m249, GHSA-3g3m-2fjr-6pw4 | No | No | No |
| esbuild #2 (low) | GHSA-g7r4-m6w7-qqqr | No | No. The JS build uses Rolldown, not this esbuild. | No |
| actix-http #21 | GHSA-xhj4-vrgc-hr34 | No | No (`serve` removed and refused) | No. A web server is never started. |
| quinn-proto #26 | GHSA-4w2j-m93h-cj5j | No | No (not in any selected tree) | No. No QUIC. |
| rustls #27, #28, #29, #30; rustls-webpki #19, #20, #24 (high) | GHSA-2mjx-qc3c-rqvc, -h2v8-394m-p7vv, -c8m5-c952-6cm4, -w44r-93j7-qv28; GHSA-965h-392x-2mh5, -xgp8-3hg3-c2mh, -82j2-j2ch-gfr8 | No | No (extended-tokenizer dictionary download path, not selected) | No. No TLS client in the shipped CLI/WASM. |
| tar (crate) #25 | GHSA-3pv8-6f4r-ffg2 | No | No (absent from the selected tree) | No |
| rand #22, #23 (low) | GHSA-cq8v-f236-94qc | No | No (only the fixed 0.8.6 in the compiler) | No |

CI and local builds do run a Rust toolchain and the pinned binaries, but only on
public pinned sources. They run no code from the vulnerable crates and
npm packages above.

## 4. Options

**(a) Bump the upstream pin to a fixed Pagefind release.**
v1.6.0 was released 2026-11-01. Its tag's lockfiles (checked against the vulnerable ranges
in the alerts, not rescanned for new advisories) contain: actix-http 3.12.1,
tar 7.5.22, brace-expansion 5.0.12, js-yaml 3.15.2, esbuild 0.28.1, rand
0.8.6/0.10.1, and no rustls, rustls-webpki, quinn-proto or tar crate. That
would clear 30 of 32 alerts. **minimatch 10.2.6 (#32) and glob 13.0.6 (#31)
remain vulnerable** there (fixed in 11.0.1 and 14.0.2), and v1.6.0 may bring
alerts of its own.
Cost: it is a requalification, not a lockfile swap. It touches
`provenance.json` hashes, `controlled/inputs.json`, the patch (written against
1.5.2 sources), the controlled locks, the WASM source-reproduction controls,
the license gate and fresh evidence receipts. The shipped artifacts are
unaffected by the alert versions, so it buys alert hygiene, not risk reduction.
Do this when the project wants 1.6.0 for its own reasons.

**(b) Exclude the paths via `.github/dependabot.yml`.** Not effective.
`exclude-paths` is a version-update scan option, and GitHub's docs say
`dependabot.yml` settings do not interact with Dependabot alerts, which come
from the full dependency graph
([Dependabot options reference](https://docs.github.com/en/code-security/reference/supply-chain-security/dependabot-options-reference),
[security updates](https://docs.github.com/en/code-security/concepts/supply-chain-security/dependabot-security-updates)).
The current config also only covers `npm` at `/` and `github-actions`, so these
directories are already outside version updates. No open Dependabot PR touches
them. I made no config change.
Renaming or moving the lockfiles to dodge graph detection would break the
SHA-256 provenance and the `audit.ts`/OSV path expectations. I do not
recommend it.

**(c) Dismiss as "vulnerable code is not actually used"** (human action).
Pros: accurate per sections 2 and 3, immediate, and the real control (OSV gate
on the selected graph, blocking at 0 findings) stays in force. Cons: dismissals
are per alert, so new advisories on the same snapshot will re-alert until the
pin moves. Dismissals also hide a later change in the selected graph from the
Dependabot view, though not from the OSV gate.

**(d) Patch the snapshots.** Rejected. It destroys the byte-for-byte provenance
that the audit gate relies on ("raw upstream locks remain unchanged", ADR-0020).
A fix would also not change what is compiled, because the controlled locks are
separate files.

## 5. Recommendation

1. Dismiss all 32 alerts as "vulnerable code is not actually used", grouped by
   package. Each comment should link this report and
   `apps/website/qualification/evidence/macos-arm64/advisory-dispositions.json`.
   The comment should state "raw upstream snapshot, not installed or compiled;
   selected-graph OSV gate stays at 0".
   This is a human action; I did not take it.
2. Keep the existing OSV gate as the real control. Re-check the selected graph
   (`graphs.json`) whenever the Pagefind recipe changes.
3. Plan the Pagefind 1.6.0 requalification as a separate ticket. Expect 2
   remaining dev-only alerts (minimatch, glob), which would be dismissed the same way.
   Re-verify the 1.6.0 locks and check for new alerts when that work starts.
4. Optional follow-up: look at GitHub's Dependabot alert rules for a rule scoped
   to these manifest paths. I could not confirm from the docs whether rules can
   filter by manifest path.

## Limits

- Closure evidence is the recorded macOS arm64 qualification, plus the Linux CI
  `dependencies` job result for the OSV outcome. I did not re-run the closures.
- Prettier does not apply here (`docs/` is in `.prettierignore`).
- I read advisory titles, ranges and patched versions from the alert API, not each
  advisory's full text.
- The v1.6.0 comparison is lockfile versions against the alerts' vulnerable ranges only.
