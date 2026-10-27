// SPDX-License-Identifier: AGPL-3.0-or-later
// Publication review fingerprints are an operational review boundary. No human
// review is invented: compare the actual digest before/after changing inputs.
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
const root = resolve(import.meta.dirname, "..");
const website = resolve(root, "apps/website");
function fingerprint() {
  const result = spawnSync(
    process.execPath,
    [
      "apps/website/scripts/publication-check.ts",
      "--root",
      website,
      "--digest",
    ],
    { cwd: root, encoding: "utf8" },
  );
  if (result.status !== 0 || !/^[a-f0-9]{64}\n$/.test(result.stdout))
    throw new Error(
      `Review fingerprint failed: ${result.stdout}${result.stderr}`,
    );
  return result.stdout;
}
const before = fingerprint();
for (const script of [
  "pagefind-bundle.ts",
  "pagefind-rustc.ts",
  "website-native-trace.ts",
]) {
  const path = resolve(root, "scripts", script);
  const original = await readFile(path);
  try {
    await writeFile(
      path,
      Buffer.concat([original, Buffer.from("\n// review negative control\n")]),
    );
    if (fingerprint() === before)
      throw new Error(`Existing publication review survives changed ${script}`);
    console.log(`Passed: changed ${script} invalidates publication reviews`);
  } finally {
    await writeFile(path, original);
  }
}

console.log("Passed publication recipe controls: 3");
