// SPDX-License-Identifier: AGPL-3.0-or-later
// Offline matching after a separate, public-data-only refresh. Any finding
// blocks this skeleton gate (and therefore every critical finding blocks).
import { readFile, stat, mkdir, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { parseAllDocuments } from "yaml";

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
  vulnerabilities?: unknown[];
}
const report = JSON.parse(await readFile(output, "utf8")) as {
  results?: { packages: Package[] }[];
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
  packages.map((item) => `${item.package.name}@${item.package.version}`),
);
const missing = expected.filter((key) => !scanned.has(key));
if (!expected.length || !packages.length || missing.length)
  throw new Error(
    `Incomplete OSV inventory: ${missing.length} of ${expected.length} packages missing`,
  );
const findings = packages.reduce(
  (sum, item) => sum + (item.vulnerabilities?.length ?? 0),
  0,
);
const evidence = {
  tool: "OSV-Scanner 2.7.0",
  matchedOffline: true,
  databaseLastModified: modified?.trim(),
  packages: packages.length,
  lockfilePackages: expected.length,
  findings,
};
await writeFile(
  resolve(".tmp/audit/summary.json"),
  JSON.stringify(evidence, null, 2) + "\n",
);
console.log(JSON.stringify(evidence));
if (findings || scan.status !== 0)
  throw new Error(
    "Dependency advisory found; all findings (including critical) block CI",
  );
