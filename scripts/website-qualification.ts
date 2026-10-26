// SPDX-License-Identifier: AGPL-3.0-or-later
// Build evidence is mandatory input to the advisory/license gate, never a suppression list.
import { readFile, writeFile, mkdir, readdir } from "node:fs/promises";
import { resolve, relative } from "node:path";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
const root = resolve(import.meta.dirname, "..");
const work = resolve(root, ".tmp/pagefind");
const hash = (b: Buffer | string) =>
  createHash("sha256").update(b).digest("hex");
const json = async (p: string) => JSON.parse(await readFile(p, "utf8"));
const verify = spawnSync(
  process.execPath,
  [resolve(root, "scripts/pagefind-source.ts"), "verify"],
  { stdio: "inherit" },
);
if (verify.status !== 0)
  throw new Error("Current controlled build evidence required");
interface Package {
  name: string;
  version: string;
  license: string;
  source: string | null;
  checksum?: string;
  manifestPath: string;
}
const receipt = await json(resolve(work, "receipt.json"));
const graphs = (await json(resolve(work, "graphs.json"))) as Record<
  string,
  {
    packages: Package[];
    target: string;
    features: string[];
    featureTreeSha256: string;
  }
>;
if (
  ["native", "compiler", "web-de", "web-en", "web-unknown"].some(
    (n) => !graphs[n]?.packages.length,
  )
)
  throw new Error("Missing actual build graph");
const nativeLoads = (
  await readFile(resolve(work, "native-loads.jsonl"), "utf8")
)
  .trim()
  .split("\n")
  .map((l) => JSON.parse(l));
if (
  !nativeLoads.length ||
  nativeLoads
    .filter((l) => l.controlled)
    .some((l) => !l.loaded || l.sha256 !== receipt.files["bin/astro.node"])
)
  throw new Error("Unexpected/missing Astro execution evidence");
const packages = [
  ...new Map(
    Object.values(graphs)
      .flatMap((g) => g.packages)
      .map((p) => [`${p.name}@${p.version}`, p]),
  ).values(),
];
const permittedPrereleases = new Set([
  "lightningcss@1.0.0-alpha.72",
  "lightningcss-derive@1.0.0-alpha.43",
]);
const allowedLicenseAtoms = new Set([
  "MIT",
  "Apache-2.0",
  "BSD-2-Clause",
  "BSD-3-Clause",
  "ISC",
  "0BSD",
  "Unlicense",
  "Zlib",
  "Unicode-3.0",
  "CC0-1.0",
  "MPL-2.0",
  "GPL-3.0-only",
]);
const licenseIssues: string[] = [];
for (const pkg of packages) {
  if (
    /^\d+\.\d+\.\d+-/.test(pkg.version) &&
    !permittedPrereleases.has(`${pkg.name}@${pkg.version}`)
  )
    throw new Error(`Unapproved prerelease: ${pkg.name}@${pkg.version}`);
  if (
    pkg.source?.startsWith("registry+") &&
    !/^[a-f0-9]{64}$/.test(pkg.checksum ?? "")
  )
    throw new Error(`Unknown crate checksum: ${pkg.name}`);
  const atoms = pkg.license
    ?.replace(/[()]/g, "")
    .split(/\s+(?:OR|AND)\s+|\//)
    .map((a) => a.trim());
  if (!atoms?.length || atoms.some((a) => !allowedLicenseAtoms.has(a)))
    licenseIssues.push(`${pkg.name}@${pkg.version}: ${pkg.license}`);
  if (pkg.license?.includes("GPL") && pkg.name !== "pagefind_microjson")
    licenseIssues.push(`Unreviewed copyleft component: ${pkg.name}`);
  if (
    pkg.license === "MPL-2.0" &&
    ![
      "lightningcss",
      "lightningcss-derive",
      "cssparser",
      "cssparser-macros",
      "selectors",
    ].includes(pkg.name)
  )
    licenseIssues.push(`Unreviewed MPL build component: ${pkg.name}`);
}
// Source-lock scan projection only. Frozen build locks remain intact in controlled/locks.
const scanLock =
  "version = 4\n\n" +
  packages
    .map(
      (p) =>
        `[[package]]\nname = ${JSON.stringify(p.name)}\nversion = ${JSON.stringify(p.version)}\n`,
    )
    .join("\n");
await writeFile(resolve(work, "selected.Cargo.lock"), scanLock);
const artifact = await json(
  resolve(root, "apps/website/dist-preview/website-artifact.json"),
);
const manifest = await json(
  resolve(root, "apps/website/dist-preview/third-party/pagefind/manifest.json"),
);
for (const [path, expected] of Object.entries(manifest.objects)) {
  if (
    artifact.files[path] !== expected ||
    hash(await readFile(resolve(root, "apps/website/dist-preview", path))) !==
      expected
  )
    throw new Error(`Distributed search drift: ${path}`);
}
if (
  manifest.recipeSha256 !== receipt.recipeSha256 ||
  hash(
    await readFile(
      resolve(
        root,
        "apps/website/dist-preview/third-party/pagefind/corresponding-source.tar.gz",
      ),
    ),
  ) !== manifest.source.sha256
)
  throw new Error("Source delivery drift");
const installedNative = [];
for (const directory of await readdir(resolve(root, "node_modules/.pnpm"))) {
  if (!/^@(astrojs\+compiler-binding|bruits\+satteri)-/.test(directory))
    continue;
  const parts = resolve(
    root,
    "node_modules/.pnpm",
    directory,
    "node_modules",
    directory.startsWith("@bruits") ? "@bruits" : "@astrojs",
  );
  for (const pkg of await readdir(parts)) {
    const folder = resolve(parts, pkg);
    for (const name of await readdir(folder))
      if (name.endsWith(".node"))
        installedNative.push({
          path: relative(root, resolve(folder, name)),
          sha256: hash(await readFile(resolve(folder, name))),
          execution:
            "not loaded by traced site build; controlled compiler override only",
        });
  }
}
const proof = {
  schemaVersion: 1,
  target: receipt.target,
  recipeSha256: receipt.recipeSha256,
  graphs,
  nativeLoads: nativeLoads.map((l) => ({ ...l, path: relative(root, l.path) })),
  installedNative,
  sourceDelivery: manifest,
  unqualifiedNativeLoads: nativeLoads.filter((l) => !l.controlled),
  scanLockSha256: hash(scanLock),
  licenseIssues,
  legalStatus:
    "BLOCKED: concrete GPL/AGPL boundaries, microjson manifest/header interpretation, source offer and human legal review remain pending; no license waiver",
  sourceLocks: await json(
    resolve(root, "apps/website/qualification/upstream/provenance.json"),
  ),
  qualifiedPlatforms: [receipt.target],
};
for (const source of proof.sourceLocks.sources)
  if (
    hash(
      await readFile(
        resolve(
          root,
          "apps/website/qualification/upstream",
          source.folder,
          source.file,
        ),
      ),
    ) !== source.sha256
  )
    throw new Error("Raw upstream lock changed");
await mkdir(resolve(work, "evidence"), { recursive: true });
await writeFile(
  resolve(work, "evidence/qualification.json"),
  JSON.stringify(proof, null, 2) + "\n",
);
console.log(
  JSON.stringify({
    target: receipt.target,
    packages: packages.length,
    licenseIssues,
    legalStatus: proof.legalStatus,
  }),
);
if (licenseIssues.length)
  throw new Error("Unknown/unreviewed actual source license");
