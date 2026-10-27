// SPDX-License-Identifier: AGPL-3.0-or-later
// Build evidence is mandatory input to the advisory/license gate, never a suppression list.
import { readFile, writeFile, mkdir, readdir } from "node:fs/promises";
import { resolve, relative } from "node:path";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import type {
  BuildReceipt,
  BuildGraph,
  NativeLoad,
  DistributionManifest,
  WebsiteArtifact,
  SourceProvenance,
} from "./website-evidence.ts";
const root = resolve(import.meta.dirname, "..");
const work = resolve(root, ".tmp/pagefind");
const hash = (b: Buffer | string) =>
  createHash("sha256").update(b).digest("hex");
const json = async <T = unknown>(p: string): Promise<T> =>
  JSON.parse(await readFile(p, "utf8")) as T;
const verify = spawnSync(
  process.execPath,
  [resolve(root, "scripts/pagefind-source.ts"), "verify"],
  { stdio: "inherit" },
);
if (verify.status !== 0)
  throw new Error("Current controlled build evidence required");
const receipt = await json<BuildReceipt>(resolve(work, "receipt.json"));
const graphs = await json<Record<string, BuildGraph>>(
  resolve(work, "graphs.json"),
);
if (
  [
    "native",
    "compiler",
    "rolldown",
    "satteri",
    "web-de",
    "web-en",
    "web-unknown",
  ].some((n) => !graphs[n]?.packages.length)
)
  throw new Error("Missing actual build graph");
const nativeLoads = (
  await readFile(resolve(work, "native-loads.jsonl"), "utf8")
)
  .trim()
  .split("\n")
  .map((l) => JSON.parse(l) as NativeLoad);
// Fail closed: a refused native module or process is never qualified, and each
// native module the website build executes must be its receipt-bound source build.
const controlledModules = ["astro.node", "rolldown.node", "satteri.node"];
const unqualifiedExecutions = nativeLoads.filter((l) => !l.controlled);
if (unqualifiedExecutions.length)
  throw new Error(
    `Uncontrolled website build execution: ${JSON.stringify(unqualifiedExecutions)}`,
  );
for (const load of nativeLoads.filter((l) => l.kind === "native")) {
  if (!load.path) throw new Error("Missing native module path");
  const module = relative(resolve(work, "bin"), load.path);
  if (
    !controlledModules.includes(module) ||
    !load.loaded ||
    load.sha256 !== receipt.files[`bin/${module}`]
  )
    throw new Error(`Unexpected native execution evidence: ${load.path}`);
}
for (const module of ["astro.node", "rolldown.node"])
  if (!nativeLoads.some((l) => l.path === resolve(work, "bin", module)))
    throw new Error(`Missing ${module} execution evidence`);
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
// Exactly the permissive families of docs/dependency-policy.md. Anything else
// (including permissive licenses the policy does not name) is reported, not admitted.
const policyLicenses = new Set([
  "MIT",
  "Apache-2.0",
  "Apache-2.0 WITH LLVM-exception",
  "ISC",
  "BSD-2-Clause",
  "BSD-3-Clause",
  "0BSD",
  "Unlicense",
  "BlueOak-1.0.0",
  "CC-BY-4.0",
]);
// MPL-2.0 build tooling the policy and ADR-0002/0020 name: exactly Lightning CSS.
const mplBuildTooling = new Set(["lightningcss", "lightningcss-derive"]);
// GPL browser WASM component of the selected Pagefind route (ADR-0020): delivered
// with Corresponding Source and notices; legal review remains pending.
const copyleftWasm = new Set(["pagefind_microjson"]);
/** SPDX expression → an elected satisfiable license, or undefined. "/" is Cargo's legacy OR. */
function elect(expression: string, allowed: (id: string) => boolean) {
  const tokens = expression
    .replace(/\//g, " OR ")
    .replace(/([()])/g, " $1 ")
    .trim()
    .split(/\s+/);
  let index = 0;
  function or(): string | undefined {
    const options = [and()];
    while (tokens[index] === "OR") {
      index++;
      options.push(and());
    }
    return options.find((option) => option !== undefined);
  }
  function and(): string | undefined {
    const terms = [term()];
    while (tokens[index] === "AND") {
      index++;
      terms.push(term());
    }
    return terms.every((t) => t !== undefined)
      ? terms.join(" AND ")
      : undefined;
  }
  function term(): string | undefined {
    const token = tokens[index++];
    if (token === "(") {
      const inner = or();
      if (tokens[index++] !== ")") throw new Error(`Bad SPDX: ${expression}`);
      return inner;
    }
    if (!token || ["AND", "OR", "WITH", ")"].includes(token))
      throw new Error(`Bad SPDX: ${expression}`);
    let id = token;
    if (tokens[index] === "WITH") id += ` WITH ${tokens[(index += 2) - 1]}`;
    return allowed(id) ? id : undefined;
  }
  const result = or();
  if (index !== tokens.length) throw new Error(`Bad SPDX: ${expression}`);
  return result;
}
const licenseIssues: string[] = [];
const electedLicenses: Record<string, string> = {};
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
  const identity = `${pkg.name}@${pkg.version}`;
  const elected = pkg.license
    ? elect(
        pkg.license,
        (id) =>
          policyLicenses.has(id) ||
          (id === "MPL-2.0" && mplBuildTooling.has(pkg.name)) ||
          (id === "GPL-3.0-only" && copyleftWasm.has(pkg.name)),
      )
    : undefined;
  if (elected) electedLicenses[identity] = elected;
  else
    licenseIssues.push(
      `${identity}: ${pkg.license ?? "missing license"} (not satisfiable under docs/dependency-policy.md)`,
    );
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
await mkdir(resolve(work, "selected"), { recursive: true });
await writeFile(resolve(work, "selected/Cargo.lock"), scanLock);
const artifact = await json<WebsiteArtifact>(
  resolve(root, "apps/website/dist-preview/website-artifact.json"),
);
if (
  artifact.controlledBuild?.receiptSha256 !==
    hash(await readFile(resolve(work, "receipt.json"))) ||
  artifact.controlledBuild?.nativeTraceSha256 !==
    hash(await readFile(resolve(work, "native-loads.jsonl"))) ||
  artifact.controlledBuild?.indexer.sha256 !== receipt.files["bin/pagefind"]
)
  throw new Error("Website execution receipt changed or missing");
const manifest = await json<DistributionManifest>(
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
  const scope = directory.match(
    /^@(astrojs|bruits|rolldown)\+(?:compiler-binding|satteri|binding)-/,
  )?.[1];
  if (!scope) continue;
  const parts = resolve(
    root,
    "node_modules/.pnpm",
    directory,
    "node_modules",
    `@${scope}`,
  );
  for (const pkg of await readdir(parts)) {
    const folder = resolve(parts, pkg);
    for (const name of await readdir(folder))
      if (name.endsWith(".node"))
        installedNative.push({
          path: relative(root, resolve(folder, name)),
          sha256: hash(await readFile(resolve(folder, name))),
          execution:
            "installed prebuilt binary; the guarded website build redirects it to the controlled source build or refuses it",
        });
  }
}
const proof = {
  schemaVersion: 1,
  target: receipt.target,
  recipeSha256: receipt.recipeSha256,
  graphs,
  nativeLoads: nativeLoads.map((l) => ({
    ...l,
    path: l.path && relative(root, l.path),
    requested: l.requested?.startsWith(root)
      ? relative(root, l.requested)
      : l.requested,
  })),
  graphSurfaces: Object.fromEntries(
    Object.keys(graphs).map((name) => [
      name,
      {
        built: true,
        executedDuringWebsiteBuild:
          name === "native" ||
          nativeLoads.some(
            (l) =>
              l.path ===
              resolve(
                work,
                "bin",
                `${name === "compiler" ? "astro" : name}.node`,
              ),
          ),
        distributed: name.startsWith("web-"),
        note: name.startsWith("web-")
          ? "browser WASM and its host build dependencies; browser execution is demonstrated separately by DE/EN search tests"
          : "build-only native graph; never served to readers",
      },
    ]),
  ),
  controlledBuild: artifact.controlledBuild,
  toolchainInputs: {
    sourceInputs: await json(
      resolve(root, "apps/website/qualification/controlled/inputs.json"),
    ),
    rustDistributions: await json(
      resolve(root, "apps/website/qualification/controlled/toolchain.json"),
    ),
    trustBoundary:
      "Pinned publisher Rust/CMake/wasm-bindgen tools are bootstrap tools, not website modules or distributed client code. Their archive hashes and targets are recorded. Transitive binary SBOMs and independent source-rebuild attestations for those publisher tools are not established by Cargo graph scans; see the qualification limitations.",
  },
  installedNative,
  sourceDelivery: manifest,
  unqualifiedExecutions,
  electedLicenses,
  scanLockSha256: hash(scanLock),
  licenseIssues,
  legalStatus:
    "BLOCKED: concrete GPL/AGPL boundaries, microjson manifest/header interpretation, source offer and human legal review remain pending; no license waiver",
  sourceLocks: await json<SourceProvenance>(
    resolve(root, "apps/website/qualification/upstream/provenance.json"),
  ),
  inventoriedPlatforms: [receipt.target],
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
