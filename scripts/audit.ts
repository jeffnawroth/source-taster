// SPDX-License-Identifier: AGPL-3.0-or-later
// Offline matching after a separate, public-data-only refresh. Any finding
// blocks this skeleton gate (and therefore every critical finding blocks).
import { readFile, stat, mkdir, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { parseAllDocuments } from "yaml";

const qualification = spawnSync(
  process.execPath,
  ["scripts/website-qualification.ts"],
  { stdio: "inherit" },
);
if (qualification.status !== 0)
  throw new Error(
    "Actual website build/bundle qualification evidence required",
  );
const selectedLock = ".tmp/pagefind/selected.Cargo.lock";
const root = new URL("../", import.meta.url);
const cache = resolve(
  process.env.OSV_SCANNER_LOCAL_DB_CACHE_DIRECTORY ?? ".tmp/osv-db",
);
const database = resolve(cache, "osv-scalibr/npm/all.zip");
const dbStats = await stat(database);
const headers = await readFile(resolve(cache, "headers.txt"), "utf8");
const modified = headers.match(/^last-modified:\s*(.+)$/im)?.[1];
const ageMs = modified ? Date.now() - Date.parse(modified.trim()) : NaN;
// An initial CI ceiling, not a claim of launch security-profile qualification.
const maxAgeMs = Number(process.env.OSV_DB_MAX_AGE_HOURS ?? 48) * 3_600_000;
if (
  !Number.isFinite(maxAgeMs) ||
  maxAgeMs <= 0 ||
  !Number.isFinite(ageMs) ||
  ageMs < -300_000 ||
  ageMs > maxAgeMs ||
  dbStats.size === 0
)
  throw new Error("OSV database missing, empty or stale");
const cratesDatabase = await stat(
  resolve(cache, "osv-scalibr/crates.io/all.zip"),
);
const cratesHeaders = await readFile(
  resolve(cache, "crates-headers.txt"),
  "utf8",
);
const cratesModified = cratesHeaders.match(/^last-modified:\s*(.+)$/im)?.[1];
const cratesAge = cratesModified
  ? Date.now() - Date.parse(cratesModified.trim())
  : NaN;
if (
  !cratesDatabase.size ||
  !Number.isFinite(cratesAge) ||
  cratesAge < -300_000 ||
  cratesAge > maxAgeMs
)
  throw new Error("OSV crates.io database missing, empty or stale");
const nativeLocks = [
  "pagefind-native",
  "pagefind-web",
  "astro-compiler",
  "satteri",
  "rolldown",
].map((name) => `apps/website/qualification/upstream/${name}/Cargo.lock`);
const bundledLock =
  "apps/website/qualification/upstream/pagefind-js/package-lock.json";
await mkdir(new URL("../.tmp/audit", import.meta.url), { recursive: true });
const output = resolve(".tmp/audit/osv.json");
const scanner = process.env.OSV_SCANNER_BIN ?? "osv-scanner";
const version = spawnSync(scanner, ["--version"], { encoding: "utf8" });
if (
  version.status !== 0 ||
  !version.stdout.startsWith("osv-scanner version: 2.7.0\n")
)
  throw new Error("OSV-Scanner 2.7.0 is required");
const scan = spawnSync(
  scanner,
  [
    "scan",
    "source",
    "--offline",
    "--all-packages",
    "--lockfile",
    "pnpm-lock.yaml",
    ...[...nativeLocks, bundledLock, selectedLock].flatMap((file) => [
      "--lockfile",
      file,
    ]),
    "--format",
    "json",
    "--output-file",
    output,
  ],
  {
    cwd: root,
    env: { ...process.env, OSV_SCANNER_LOCAL_DB_CACHE_DIRECTORY: cache },
    encoding: "utf8",
  },
);
process.stderr.write(scan.stderr ?? "");
if (scan.error || (scan.status !== 0 && scan.status !== 1))
  throw new Error(`OSV scan failed: ${scan.error?.message ?? scan.status}`);
interface Package {
  package: { name: string; version: string; ecosystem: string };
  vulnerabilities?: { id: string }[];
}
const report = JSON.parse(await readFile(output, "utf8")) as {
  results?: { source: { path: string }; packages: Package[] }[];
};
const packages = report.results?.flatMap((result) => result.packages) ?? [];
const documents = parseAllDocuments(
  await readFile(new URL("pnpm-lock.yaml", root), "utf8"),
);
if (documents.some((document) => document.errors.length))
  throw new Error("Invalid pnpm lockfile");
const expected = [
  ...new Set(
    documents.flatMap((document) =>
      Object.keys(
        (document.toJS() as { packages: Record<string, unknown> }).packages,
      ),
    ),
  ),
];
const scanned = new Set(
  packages.map(
    (item) =>
      `${item.package.ecosystem}:${item.package.name}@${item.package.version}`,
  ),
);
const required = expected.map((key) => `npm:${key}`);
for (const file of [...nativeLocks, selectedLock]) {
  const content = await readFile(file, "utf8");
  const entries = content.split(/^\[\[package\]\]$/m).slice(1);
  if (!entries.length) throw new Error(`Empty native inventory: ${file}`);
  for (const entry of entries) {
    const name = entry.match(/^name = "([^"]+)"$/m)?.[1];
    const version = entry.match(/^version = "([^"]+)"$/m)?.[1];
    if (!name || !version)
      throw new Error(`Unknown native inventory shape: ${file}`);
    required.push(`crates.io:${name}@${version}`);
  }
}
const bundled = JSON.parse(await readFile(bundledLock, "utf8")) as {
  packages: Record<string, { name?: string; version: string }>;
};
for (const [path, pkg] of Object.entries(bundled.packages)) {
  if (!path) continue; // workspace root is not an npm dependency; retained in the source lock
  const name = pkg.name ?? path.split("node_modules/").at(-1);
  required.push(`npm:${name}@${pkg.version}`);
}
const missing = [...new Set(required)].filter((key) => !scanned.has(key));
if (!expected.length || !packages.length || missing.length)
  throw new Error(
    `Incomplete OSV inventory: ${missing.length} of ${expected.length} packages missing`,
  );
const selectedReport = report.results?.filter((r) =>
  r.source.path.endsWith("/.tmp/pagefind/selected.Cargo.lock"),
);
if (selectedReport?.length !== 1)
  throw new Error("Selected build inventory not scanned");
const selected = new Set(
  selectedReport[0]!.packages.map(
    (p) => `${p.package.ecosystem}:${p.package.name}@${p.package.version}`,
  ),
);
const dispositions = [];
let findings = 0;
let blockingFindings = 0;
for (const result of report.results ?? []) {
  const path = result.source.path;
  const raw = [...nativeLocks, bundledLock].find((lock) =>
    path.endsWith(`/${lock}`),
  );
  const actual =
    path.endsWith("/pnpm-lock.yaml") || path.endsWith(`/${selectedLock}`);
  if (!raw && !actual) throw new Error(`Unknown scan scope: ${path}`);
  for (const item of result.packages)
    for (const vulnerability of item.vulnerabilities ?? []) {
      findings++;
      const identity = `${item.package.ecosystem}:${item.package.name}@${item.package.version}`;
      const blocks = actual || selected.has(identity);
      if (blocks) blockingFindings++;
      dispositions.push({
        source: raw ?? path.slice(path.lastIndexOf("/.tmp/") + 1),
        identity,
        advisory: vulnerability.id,
        blocks,
        disposition: blocks
          ? "actual selected/installed project graph: unresolved and blocking"
          : raw?.includes("pagefind-js")
            ? "upstream npm tooling never installed or executed; browser bundles built from pinned pagefind_web_js/lib sources only by the controlled Rolldown 1.2.15 binding (module list in bundle.json)"
            : identity === "crates.io:pagefind@0.0.0"
              ? "upstream placeholder corrected to controlled 1.5.2 release identity; actual JS built from pinned fixed source"
              : "absent version/component from the frozen controlled normal+build target/feature closure of the executed native/WASM artifacts; removal or stable replacement verified in the exact artifact recipe",
        evidence: ".tmp/pagefind/evidence/qualification.json",
      });
    }
}
await writeFile(
  resolve(".tmp/audit/website-dispositions.json"),
  JSON.stringify(dispositions, null, 2) + "\n",
);
const evidence = {
  tool: "OSV-Scanner 2.7.0",
  matchedOffline: true,
  databaseLastModified: modified?.trim(),
  packages: packages.length,
  lockfilePackages: expected.length,
  nativeAndBundledExpected: new Set(required).size - expected.length,
  nativeDatabaseLastModified: cratesModified?.trim(),
  findings,
  blockingFindings,
  rawFindingsPreserved: dispositions.filter((d) => !d.blocks).length,
  qualificationEvidence: ".tmp/pagefind/evidence/qualification.json",
  legalReview: "pending; publication remains blocked",
};
await writeFile(
  resolve(".tmp/audit/summary.json"),
  JSON.stringify(evidence, null, 2) + "\n",
);
console.log(JSON.stringify(evidence));
if (blockingFindings)
  throw new Error(
    "Actual selected dependency advisory found; all actual findings (including critical) block CI",
  );
