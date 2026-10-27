# Walking-skeleton dependency gate (#71)

Direct dependencies are exact-pinned on the ADR-0002 lines. The pnpm lockfile records transitive, peer, optional/native, and package-manager dependencies. Node 24.14 LTS is the validated fallback; Node 26 must be qualified after its 2026-10-28 LTS transition. Prisma CLI, client and adapter stay together on 7.10.1; Dependabot excludes the 8.0 prerelease line.

## Vulnerability inventory

OSV-Scanner **2.7.0**, installed from checksum-pinned upstream release binaries, scans `pnpm-lock.yaml` using `--offline --all-packages`. An independent refresh downloads the public npm advisory database, without sending project data. Its response headers supply the database's last-modified date. The initial CI freshness ceiling is 48 hours, configurable with `OSV_DB_MAX_AGE_HOURS`; missing/empty/stale data fails. This operational gate is not launch security-profile qualification.

pnpm 12 emits a YAML stream containing both package-manager and application inventories. The gate unions the package keys from **every** document and reconciles each name/version against OSV's actual output. Empty, incomplete, malformed or failed scans fail. The initial locked graph has **522** OSV packages, including optional platform binaries and the package-manager graph. All advisory findings block this gate, which includes every critical finding. JSON inventory and summary are retained as CI artifacts. No suppression or critical-risk waiver exists.

## License inventory

The selected scanner is **pnpm's native `licenses list`**, recursively including the root and workspace projects. `scripts/licenses.ts` separately inventories runtime and development dependencies, rejects empty inventories and unknown license expressions, and writes a content-free package/version/license/scope report. It scans packages installed for the current platform; the Linux CI inventory and local macOS inventory cover their respective native packages. The OSV lockfile scan independently covers all locked platforms. This does not claim license qualification of every foreign-platform binary.

Permissive MIT, Apache-2.0 (including LLVM exception), ISC, BSD, 0BSD, Unlicense, BlueOak, CC-BY-4.0 and the observed MIT/CC0 alternatives are allowed with their notices. The limited development-only allowlist is:

- `@axe-core/playwright`, `axe-core`: MPL-2.0 accessibility tools, never in the application runtime.
- `lightningcss` and the explicitly named macOS/Linux native variants in the script: MPL-2.0 CSS build tooling, never in the runtime.
- `elkjs`: EPL-2.0, pulled into Paraglide's build tools; never combined into the distributed runtime.
- `mdn-data`: CC0-1.0 CSS reference data used by the Astro website build (#115); never in the application runtime.

The website build excludes Astro's optional `sharp` image service (`ignoredOptionalDependencies`), so the LGPL-3.0 libvips binaries are not installed. The site ships no raster images. Native Rust and bundled WASM components of Astro/Pagefind are not npm packages and are inventoried separately in `apps/website/qualification/` (see `docs/validation-115.md`).

The gate fails if any exception becomes a runtime dependency. These are tool-use scope decisions, not relicensing or a legal-review receipt. Distribution still requires retaining upstream notices and the launch legal/license review of ADR-0002.

### Exact controlled website source qualifications (#115)

The native gate additionally uses
[`qualification/licenses/policy.json`](../apps/website/qualification/licenses/policy.json)
for these **19 exact registry identities**, after inspection of their immutable
crate archives, original/normalized manifests, license files and source headers.
This records technical compatibility within the already selected ADR-0020 build,
not a blanket license exception or a legal opinion. The primary texts, obligations
and compatibility reasoning are in
[`115-native-license-terms.md`](research/115-native-license-terms.md).

- **Zlib:** `const_format@0.2.35`, `const_format_proc_macros@0.2.34`,
  `foldhash@0.1.5`, `foldhash@0.2.0`, `zlib-rs@0.6.6`.
- **MIT AND Unicode-3.0:** `unicode-ident@1.0.24`, `unicode-id-start@1.4.0`.
  Their declared `(MIT OR Apache-2.0) AND Unicode-3.0` permits electing MIT
  instead of Apache; Unicode remains mandatory. Preserve both complete notices,
  including in Pagefind's browser source/notices where `unicode-ident` appears
  in the selected normal/build closure.
- **CC0-1.0:** `rolldown-notify@11.0.0`; preserve the actual upstream text,
  including its formatting markers. No patent/trademark grant is inferred.
- **BSL-1.0:** `xxhash-rust@0.8.19`; this is the Boost Software License.
- **MPL-2.0 build tooling:** `cssparser@0.36.0` / `0.37.0`,
  `cssparser-macros@0.6.1` / `0.7.0`, `cssparser-color@0.5.0`,
  `dtoa-short@0.3.5`, `selectors@0.33.0`, `parcel_selectors@0.28.3`,
  `static-self@0.1.2`, `static-self-derive@0.1.1`.
  These are selected Pagefind native or Astro compiler dependencies. None is
  in the selected browser graphs. No MPL secondary-license election is used.

Every entry binds the exact crates.io source/checksum, manifest and license/source
file hashes, upstream repository/VCS identity, elected expression, permitted graph,
host target, feature selection and normal/build edges. Only macOS arm64 and Linux
amd64 GNU host builds qualify; browser build scopes are separately named and permit
only the exact Unicode entry above. A changed expression, source/checksum, feature
scope or target fails closed. Unknown identities receive no additional permission.
This adds no runtime MPL acceptance, private-service permission or use in
verification/domain programs, and changes no maturity, prerelease or advisory rule.

`website-native-licenses.ts` retains the complete, unmodified 19 crate archives,
full notices, exact per-scope evidence and supplemental MPL text in
`.tmp/pagefind/license-sources/`. CI includes these in `dependency-evidence`.
The `selectors` and `static-self` crates omit a standalone license file; their
immutable manifests declare MPL-2.0, source headers are retained where present,
and the full MPL text is supplied separately without altering upstream archives.
Retain source notices and mark any future modifications. Any distribution of a
covered native build executable must include the corresponding covered source,
MPL terms and source-access information under MPL 3.1/3.2/3.4; the source archive
and notice package is for those build-tool recipients. It is not served as a
new website runtime. Changed covered sources require renewed qualification.
The browser delivery independently retains the conjunctive Unicode texts in
`NOTICE.txt` and complete vendored source. Missing Unicode text fails the gate.

Human legal review of actual program/distribution boundaries, GPL/AGPL source
delivery and market-launch publication remains required. A passing technical
license/advisory gate cannot satisfy or bypass those separate approvals.

## Further launch qualification

Dependabot is configured daily, but its pnpm 12 update behavior still needs live evidence; lockfile recognition alone is not proof. ADR-0015's full ASVS assessment, deployed-version inventory/alert ownership, scanner failure controls, Semgrep, Gitleaks, ZAP and parser isolation are release work beyond #71. Stable selected libraries include pinned 0.x transitive dependencies (for example the Hono validator, React store, React Aria helpers and Paraglide SDK tooling); this gate inventories them and does not silently declare the unresolved maturity-rule interpretation approved. No excluded pre-1.0 library takes a new application core role here.
