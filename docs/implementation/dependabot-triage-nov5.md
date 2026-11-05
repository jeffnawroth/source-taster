# Dependabot triage, 2026-11-05

Scope: the 22 open Dependabot alerts of `jeffnawroth/source-taster` (alert numbers 2–32, queried read-only with `gh api .../dependabot/alerts`). Advisory titles are the public GHSA summaries. No alert was dismissed or commented on through the API.

## Result

**No dependency update is possible or needed. No `package.json`, `pnpm-workspace.yaml`, override or `pnpm-lock.yaml` change was made.** All 22 alerts concern one of two kinds of manifest, neither of which is part of the product's installed or shipped dependency graph:

1. `apps/website/qualification/upstream/pagefind-js/package-lock.json` (11 alerts) and `.../pagefind-native/Cargo.lock` (11 alerts) are **byte-pinned copies of Pagefind v1.5.2's own lockfiles**. They are fetched from upstream, bound to a SHA-256 in `upstream/provenance.json` and re-checked by `scripts/website-qualification.ts` ("Raw upstream lock changed"). They are evidence inputs for the #115 advisory scan, not manifests that anything installs. Editing them would break the provenance check and would not change what is built.
2. The pnpm graph (`pnpm-lock.yaml`) is clean. `pnpm audit` reports no known vulnerabilities. `pnpm why -r tar js-yaml esbuild` finds none of them. `brace-expansion` is at 5.0.12 and `minimatch` at 11.0.3, both at or above every patched version below.

The actual fix for the Rust alerts is upstream: a Pagefind release whose lockfile carries the patched crates. Pagefind **v1.6.0** was published on 2026-11-01. It was not evaluated here. Adopting it means re-pinning `provenance.json`, regenerating the controlled locks and re-running full #115 requalification, which is a separate task (see [Follow-ups](#follow-ups)).

## Evidence for "not reachable"

- Current build evidence is `apps/website/qualification/evidence/macos-arm64/`, which covers **macOS arm64 only**. Linux amd64 evidence is the older `evidence/historical/cb04e23/linux-amd64/` receipt, which belongs to an earlier recipe and does not qualify the current one. Both show the same result for the crates below.
- For each target, `graphs.json` and `*.tree.txt` record the exact normal and build closure of the executed native and WASM artifacts. Positive check: `native` has 151 packages and no `rustls`, `rustls-webpki`, `quinn-proto`, `actix-http`, `tar` or `rand`. `web-de`/`web-en`/`web-unknown` (the WASM that ships) has 19 packages with none of them. `rolldown` and `satteri` have none of them either. The Astro compiler closure contains `rand` **0.8.6**, which is the patched version.
- The Rust alerts exist because the raw upstream `Cargo.lock` is the *full* workspace lock, covering every optional feature and platform alternative. The controlled build compiles the native CLI with no default/serve/extended features (`controlled/README.md`), and the recorded closure simply does not contain these crates. Which upstream feature pulls each one in was inferred from the lock's dependency edges (actix-web, reqwest/quinn/hyper-rustls, lindera-dictionary, portpicker) and was not separately verified per feature.
- The `pagefind-js` npm lock belongs to Pagefind's own JS tooling (ava, tsx, esbuild). It is never installed or executed here. The shipped JS is bundled from the pinned `pagefind_web_js/lib` sources by the Rolldown 1.2.15 binding (module list in `evidence/macos-arm64/bundle.json`).
- Caveat: the committed `advisory-dispositions.json` does not list every currently open GHSA (for example, by GHSA id, it has no entries for #28–#30; they may appear there under RUSTSEC aliases). The reachability argument above rests on closure membership, not on that file. Refreshing it is part of the Pagefind follow-up.

## Alerts

"Runtime?" is by product role, not Dependabot's scope field. The Pagefind CLI is website *build tooling*. Only the WASM/JS it produces ships to readers. "Direct?" is relative to the manifest, derived from the lock's dependency edges, because Dependabot reports `unknown` for Cargo.

### npm — `apps/website/qualification/upstream/pagefind-js/package-lock.json`

Locked versions there: tar 7.5.13, js-yaml 3.14.2, brace-expansion 5.0.5, minimatch 10.2.5, esbuild 0.28.0 (plus 0.27.7 nested under `tsx`). All dev-only in that lock.

| # | Package | Severity | GHSA | Direct? | Runtime? | Reachable? | Action |
|---|---|---|---|---|---|---|---|
| 2 | esbuild | low | GHSA-g7r4-m6w7-qqqr | direct (dev) | build tool, never installed | no: not in pnpm graph, Windows dev-server only | dismissed-rationale (not used / inaccurate), no change |
| 3 | tar | medium | GHSA-vmf3-w455-68vh | transitive | no | no: not in pnpm graph, upstream tooling never run | dismissed-rationale, no change |
| 4 | js-yaml | medium | GHSA-h67p-54hq-rp68 | transitive | no | no | dismissed-rationale, no change |
| 5 | brace-expansion | high | GHSA-3jxr-9vmj-r5cp | transitive | no | no: pnpm graph has 5.0.12 (patched ≥ 5.0.7) | dismissed-rationale, no change |
| 6 | js-yaml | high | GHSA-52cp-r559-cp3m | transitive | no | no | dismissed-rationale, no change |
| 10 | tar | medium | GHSA-w8wr-v893-vjvp | transitive | no | no | dismissed-rationale, no change |
| 14 | js-yaml | high | GHSA-5p4m-2wfm-xmqj | transitive | no | no | dismissed-rationale, no change |
| 15 | js-yaml | high | GHSA-2883-xcg3-v3hh | transitive | no | no | dismissed-rationale, no change |
| 18 | brace-expansion | medium | GHSA-q2hr-2g5m-vwhr | transitive | no | no: pnpm graph has 5.0.12 (patched ≥ 5.0.12) | dismissed-rationale, no change |
| 32 | minimatch | medium | GHSA-g3hv-75wg-m249 | transitive | no | no: concerns the raw lock's 10.2.5. The repo graph is at 11.0.3 (≥ patched 11.0.1) | dismissed-rationale. **minimatch 11.0.3 override intentionally untouched** |

The nested `esbuild` 0.27.7 copy under `tsx` in that lock falls under the same rationale as #2.

### Rust — `apps/website/qualification/upstream/pagefind-native/Cargo.lock`

Locked versions there: rustls 0.23.37, rustls-webpki 0.103.10, quinn-proto 0.11.14, actix-http 3.12.0, tar 0.4.45, rand 0.8.5 and 0.9.2. All are **transitive** of `pagefind` (via actix-web/actix-files, reqwest/quinn/hyper-rustls, lindera-dictionary, portpicker).

| # | Package | Severity | GHSA | Direct? | Runtime? | Reachable? | Action |
|---|---|---|---|---|---|---|---|
| 19 | rustls-webpki | low | GHSA-965h-392x-2mh5 | transitive (via rustls) | build tooling only | no: absent from controlled native and WASM closures | dismissed-rationale, no change. Fixed upstream in 0.103.12 |
| 20 | rustls-webpki | low | GHSA-xgp8-3hg3-c2mh | transitive | same | no | dismissed-rationale, no change |
| 24 | rustls-webpki | high | GHSA-82j2-j2ch-gfr8 | transitive | same | no | dismissed-rationale, no change. Fixed upstream in 0.103.13 |
| 27 | rustls | medium | GHSA-2mjx-qc3c-rqvc | transitive (hyper-rustls, quinn, reqwest) | same | no | dismissed-rationale, no change. Fixed upstream in 0.23.45 |
| 28 | rustls | low | GHSA-h2v8-394m-p7vv | transitive | same | no | dismissed-rationale, no change. Fixed upstream in 0.23.46 |
| 29 | rustls | medium | GHSA-c8m5-c952-6cm4 | transitive | same | no | dismissed-rationale, no change |
| 30 | rustls | low | GHSA-w44r-93j7-qv28 | transitive | same | no | dismissed-rationale, no change |
| 26 | quinn-proto | high | GHSA-4w2j-m93h-cj5j | transitive (via quinn) | same | no: absent from every selected closure | dismissed-rationale, no change. Fixed upstream in 0.11.15 |
| 21 | actix-http | medium | GHSA-xhj4-vrgc-hr34 | transitive (via actix-web/actix-files) | same | no: absent from every selected closure; no Pagefind server is built or run | dismissed-rationale, no change. Fixed upstream in 3.12.1 |
| 25 | tar | medium | GHSA-3pv8-6f4r-ffg2 | transitive (via lindera-dictionary) | same | no: absent from every selected closure | dismissed-rationale, no change. Fixed upstream in 0.4.46 |
| 22 | rand 0.9.2 | low | GHSA-cq8v-f236-94qc | transitive (via quinn-proto) | same | no | dismissed-rationale, no change. Fixed upstream in 0.9.3 |
| 23 | rand 0.8.5 | low | GHSA-cq8v-f236-94qc | transitive (via actix-http, lindera-dictionary, portpicker) | same | no: the only `rand` in a selected closure is Astro compiler's 0.8.6, already patched | dismissed-rationale, no change |

## Suggested dismissal reasons (for the maintainer to apply)

The alert state was not touched. If the maintainer chooses to dismiss:

- #2–#6, #10, #14, #15, #18, #32 (npm, `pagefind-js` lock): GitHub reason "Vulnerable code is not actually used" — the lock is an unmodified upstream evidence copy; the packages are not installed, and the pnpm graph is clean.
- #19–#30 (Rust, `pagefind-native` lock): GitHub reason "Vulnerable code is not actually used" — crate absent from the controlled native, WASM, Rolldown, Sätteri and Astro-compiler closures. It exists only in the raw full upstream workspace lock. Evidence: `evidence/macos-arm64/graphs.json`. This was checked on macOS arm64 only. Linux rests on the historical receipt.

Dismissal removes the alerts from view, but the alert source will recur whenever Dependabot re-reads these files. Excluding `apps/website/qualification/upstream/**` from Dependabot would need a `.github/dependabot.yml` decision the maintainer has not made. Dependabot's npm update there is also not feasible: the file must stay byte-equal to upstream.

## Constraints respected

- `better-auth` stays at exactly 1.7.14 and the minimatch 11.0.3 override stays. No alert concerned `better-auth`. #32 concerns minimatch only in the raw upstream lock.
- No new override, so `docs/dependency-policy.md` needs no new entry.
- No major bump was considered.

## Follow-ups

1. Evaluate Pagefind **v1.6.0** (published 2026-11-01): re-pin `upstream/provenance.json` and the controlled locks, rebuild, regenerate the evidence and advisory dispositions. This should clear most Rust alerts at source.
2. Linux amd64 evidence for the current recipe is still pending (see `evidence/README.md`).
3. Decide whether Dependabot should ignore `apps/website/qualification/upstream/**`.

## Verification

Baseline had no dependency changes, so verification confirms the tree is unchanged and healthy:

- `pnpm install --frozen-lockfile`: passes, lockfile up to date.
- `pnpm audit`: no known vulnerabilities.
- `pnpm turbo run lint typecheck --continue`: 30 of 31 tasks pass. The one failure is `@source-taster/website#build`, which needs the controlled Pagefind source build (`.tmp/pagefind/fetched.json`, produced by network-dependent `pnpm pagefind:fetch`/`pagefind:build`). It does not run in this worktree and is unrelated to dependencies.
- `pnpm test:scripts`: 9/9 pass. The server test suite needs PostgreSQL and was not run, because nothing in the server's dependency graph changed.
