# Controlled website build

This is the owned #115 build recipe, based on Pagefind 1.5.2. Repository
maintainers own patch updates, daily advisory checks and target qualification.
It is a local draft preview pipeline, not a publication or legal approval.

Run from the repository root with Node 24.14.0 and pnpm 12.15.0:

```sh
pnpm install --frozen-lockfile
pnpm pagefind:fetch
pnpm pagefind:build
pnpm pagefind:verify
pnpm --filter @source-taster/website build
pnpm audit:licenses
bash scripts/refresh-advisories.sh
OSV_SCANNER_BIN=.tmp/audit/osv-scanner pnpm audit:dependencies
node scripts/qualification-controls.ts
```

Use checksum-pinned OSV-Scanner 2.7.0 (installation commands are in CI).
The dependency command retains advisory evidence even when license qualification
refuses the graph, and exits unsuccessfully for either refusal. Controls can run
after that completed scan. They restore their temporary source, binary and scanner
report mutations, reject failed/malformed/incomplete/positive scans, and rebuild
all three WASM objects from the source archive actually served to readers.

`fetch` is the network stage. It validates source/tool archives, applies checked
patches, installs Rust under `.tmp/pagefind/tools`, fetches frozen Cargo locks,
checks registry archive digests, reconstructs extracted registry sources and
checks immutable Git checkouts. It fingerprints source and tool files. `build`
and `verify` reject changed inputs; Rust builds use frozen offline resolution.
No global Rust/rustup installation is read or changed. Ambient Rust/C/Cargo flags
and Pagefind configuration variables are excluded from the controlled commands.
The host C compiler, linker and SDK remain bootstrap prerequisites; their
environment is recorded rather than represented as cross-platform identical.

The two native targets are macOS arm64 and Linux amd64 GNU. The selected browser
target is `wasm32-unknown-unknown`, separately built with no default features,
German, and English. The native Pagefind CLI has no default/serve/extended
features, rejects service/playground/YAML modes, and ships only the search API,
worker and required language/index assets. Its version identity is 1.5.2.
The compiler uses `astro_napi --no-default-features`; Rolldown and Sätteri use
their upstream release feature selection. Every selected normal/build closure
and feature tree is recorded in `.tmp/pagefind/graphs.json` and `*.tree.txt`.

WASM uses a clean target directory and the owned `pagefind-rustc.ts` wrapper.
Cargo otherwise salts the two local path-crate identities with their filesystem
locations, changing symbol identity and linked bytes when readers extract the
source elsewhere. The wrapper replaces only Cargo's metadata salt for
`pagefind_web` 1.5.2 and `pagefind_stem` 1.0.0 with their name, version and exact
selected feature list; it preserves every other compiler argument. Registry
crates and all native builds keep their normal handling. The same wrapper is
included and used by the delivered offline reproduction script.

Pagefind JS is bundled through the frozen Rolldown 1.2.15 API and its controlled
binding. ES2022 preserves class fields without injected runtime helpers; the
classic worker explicitly uses the existing base-path fallback. Module lists
must contain only the pinned Pagefind inputs. The preload hook records native
loads and child processes and refuses unknown execution. Installed publisher
binaries remain inventoried separately. An unused module is never invoked to
satisfy a trace assertion; the actual current Astro trace does load Sätteri.
The hook is instrumentation for these known build APIs, not an OS sandbox.

Raw upstream locks and the research ledger remain unchanged. `lock-changes.diff`
shows the controlled lock modifications; the committed locks and their hashes
are authoritative. Advisory matching covers the entire npm lock, every raw
upstream lock and the union of actual target/feature closures. Each source is
reconciled independently. Actual findings and unapproved prereleases, licenses
or unknown components fail closed. Source-only dispositions are not waivers.

The browser source package contains the upstream archive, modified WASM/JS
sources, exact dependency archives, vendored sources/licenses, patches, locks,
tool pins, build scripts, receipt and an object-to-source manifest. Its ustar/gzip
metadata is normalized. Offline `build-wasm.sh` checks its source file hashes and
reproduces the delivered language WASM bytes. Pagefind/microjson notices and GPL
text are directly accessible under `/third-party/pagefind/` from both languages.

See `docs/implementation/115-controlled-build.md` and `qualification/evidence/`
for dated command results and limitations. The pinned publisher Rust, CMake and
wasm-bindgen bootstrap tools have archive provenance, not independently rebuilt
transitive binary SBOMs. Their trust boundary remains explicit. The current
native license registry is qualified separately by exact source identity and
normal/build scope in `../licenses/policy.json`, with notices and immutable
source archives retained in `.tmp/pagefind/license-sources/` and CI artifacts.
See the dependency policy and primary-source license note. Human legal and
publication gates remain closed; this recipe grants no security or prerelease
exception or general runtime license permission.
