// SPDX-License-Identifier: AGPL-3.0-or-later
// pnpm's installed-package license inventory, with separate runtime scope.
import { spawnSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
interface Package {
  name: string;
  versions: string[];
  license: string;
  paths: string[];
}
function inventory(prod: boolean): Record<string, Package[]> {
  const result = spawnSync(
    "pnpm",
    [
      "-r",
      "--include-workspace-root",
      "licenses",
      "list",
      "--json",
      ...(prod ? ["--prod"] : []),
    ],
    { encoding: "utf8" },
  );
  if (result.status !== 0)
    throw new Error(`License inventory failed: ${result.stderr}`);
  return JSON.parse(result.stdout) as Record<string, Package[]>;
}
const all = inventory(false);
const runtime = inventory(true);
const runtimeNames = new Set(
  Object.values(runtime)
    .flat()
    .map((pkg) => pkg.name),
);
const permissive = new Set([
  "MIT",
  "Apache-2.0",
  "ISC",
  "BSD-2-Clause",
  "BSD-3-Clause",
  "0BSD",
  "Unlicense",
  "BlueOak-1.0.0",
  "CC-BY-4.0",
  "MIT and ISC",
  "(MIT OR CC0-1.0)",
  "(Apache-2.0 WITH LLVM-exception)",
]);
const devExceptions = new Set([
  "@axe-core/playwright",
  "axe-core",
  "lightningcss",
  "lightningcss-linux-x64-gnu",
  "lightningcss-linux-x64-musl",
  "lightningcss-darwin-arm64",
  "elkjs",
  "mdn-data",
]);
const packages = Object.values(all).flat();
if (!packages.length || !runtimeNames.size)
  throw new Error("Empty license inventory");
for (const pkg of packages) {
  if (permissive.has(pkg.license)) continue;
  // ADR-0011 selects citeproc-js under AGPL-3.0-or-later. Its package metadata
  // incorrectly says AGPL-1.0; the pinned LICENSE explicitly grants 3 or later.
  // See apps/server/src/citations/assets/NOTICE.md; no CPAL option is used.
  if (pkg.name === "citeproc" && pkg.versions.every(version => version === "2.4.63") && pkg.license === "CPAL-1.0 OR AGPL-1.0") continue;
  // ADR-0011 explicitly selects BiblioJSON for the server import adapter.
  // It remains a replaceable, unmodified LGPL library, outside transport.
  if (pkg.name === "bibliojson" && pkg.versions.every(version => version === "4.1.0") && pkg.license === "LGPL-3.0") continue;
  if (
    devExceptions.has(pkg.name) &&
    !runtimeNames.has(pkg.name) &&
    ["MPL-2.0", "EPL-2.0", "CC0-1.0"].includes(pkg.license)
  )
    continue;
  throw new Error(`Unreviewed license: ${pkg.name} ${pkg.license}`);
}
await mkdir(".tmp/audit", { recursive: true });
const evidence = packages.map((pkg) => ({
  name: pkg.name,
  versions: pkg.versions,
  license: pkg.license,
  scope: runtimeNames.has(pkg.name) ? "runtime" : "development",
}));
await writeFile(
  ".tmp/audit/licenses.json",
  JSON.stringify(evidence, null, 2) + "\n",
);
console.log(
  `Reviewed ${packages.length} installed package licenses; ${runtimeNames.size} runtime packages`,
);
