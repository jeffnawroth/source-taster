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

The gate fails if any exception becomes a runtime dependency. These are tool-use scope decisions, not relicensing or a legal-review receipt. Distribution still requires retaining upstream notices and the launch legal/license review of ADR-0002.

## Further launch qualification

Dependabot is configured daily, but its pnpm 12 update behavior still needs live evidence; lockfile recognition alone is not proof. ADR-0015's full ASVS assessment, deployed-version inventory/alert ownership, scanner failure controls, Semgrep, Gitleaks, ZAP and parser isolation are release work beyond #71. Stable selected libraries include pinned 0.x transitive dependencies (for example the Hono validator, React store, React Aria helpers and Paraglide SDK tooling); this gate inventories them and does not silently declare the unresolved maturity-rule interpretation approved. No excluded pre-1.0 library takes a new application core role here.
