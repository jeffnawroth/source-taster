// SPDX-License-Identifier: AGPL-3.0-or-later
// Public upstream metadata refresh only. Advisory matching remains offline.
import { readFile, writeFile, readdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { parseAllDocuments } from "yaml";
const base = "apps/website/qualification";
const documents = parseAllDocuments(await readFile("pnpm-lock.yaml", "utf8"));
const lock = Object.fromEntries(
  ["importers", "packages", "snapshots"].map((key) => [
    key,
    Object.assign({}, ...documents.map((d) => d.toJS()[key] ?? {})),
  ]),
);
const visited = new Set();
function visit(name, version) {
  // Workspace packages are first-party; their own graphs are audited elsewhere.
  if (version.startsWith("link:")) return;
  const key = `${name}@${version}`;
  if (visited.has(key)) return;
  const node = lock.snapshots[key];
  if (!node) throw new Error(`Unresolved website graph edge: ${key}`);
  visited.add(key);
  for (const [dep, version] of Object.entries({
    ...node.dependencies,
    ...node.optionalDependencies,
  }))
    visit(dep, version);
}
const importer = lock.importers["apps/website"];
for (const [name, spec] of Object.entries({
  ...importer.dependencies,
  ...importer.devDependencies,
}))
  visit(name, spec.version);
const npm = [...new Set([...visited].map((key) => key.replace(/\(.*/, "")))]
  .sort()
  .map((key) => {
    const at = key.lastIndexOf("@");
    return {
      ecosystem: "npm",
      name: key.slice(0, at),
      version: key.slice(at + 1),
      scope: "website build/test and platform alternatives",
      ...lock.packages[key],
    };
  });
const cargo = [];
const upstreamNpm = [];
for (const folder of (
  await readdir(`${base}/upstream`, { withFileTypes: true })
)
  .filter((e) => e.isDirectory())
  .map((e) => e.name)) {
  if (folder === "pagefind-js") {
    const js = JSON.parse(
      await readFile(`${base}/upstream/${folder}/package-lock.json`, "utf8"),
    );
    for (const [path, pkg] of Object.entries(js.packages)) {
      if (!path) continue;
      upstreamNpm.push({
        ecosystem: "npm",
        name: pkg.name ?? path.split("node_modules/").at(-1),
        version: pkg.version,
        license: pkg.license,
        integrity: pkg.integrity,
        dev: pkg.dev ?? false,
        scope:
          "Pagefind bundled JS source-lock upper bound (build/test entries retained)",
      });
    }
    continue;
  }
  const text = await readFile(`${base}/upstream/${folder}/Cargo.lock`, "utf8");
  // Cargo-generated lock entries have quoted scalar identity fields. Fail closed
  // on an unfamiliar shape instead of silently dropping a package.
  for (const table of text.split(/^\[\[package\]\]$/m).slice(1)) {
    const field = (name) =>
      table.match(new RegExp(`^${name} = "([^"]+)"$`, "m"))?.[1];
    const name = field("name"),
      version = field("version"),
      source = field("source"),
      checksum = field("checksum");
    if (!name || !version || (source?.startsWith("registry+") && !checksum))
      throw new Error(`Unpinned Cargo entry in ${folder}`);
    cargo.push({
      ecosystem: "crates.io",
      name,
      version,
      source: source ?? `local:${folder}`,
      checksum,
      scope: folder,
      inventoryBasis:
        "upstream full source lock; platform/feature/dev alternatives retained",
    });
  }
}
const all = [...npm, ...upstreamNpm, ...cargo];
const metadataCache = new Map();
async function metadata(pkg) {
  if (pkg.source?.startsWith("local:") || pkg.source?.startsWith("git+"))
    return {
      license: "MIT",
      metadataStatus: "upstream workspace; source revision recorded separately",
    };
  const key = `${pkg.ecosystem}:${pkg.name}@${pkg.version}`;
  if (!metadataCache.has(key))
    metadataCache.set(
      key,
      (async () => {
        const system = pkg.ecosystem === "npm" ? "npm" : "cargo";
        const response = await fetch(
          `https://api.deps.dev/v3alpha/systems/${system}/packages/${encodeURIComponent(pkg.name)}/versions/${encodeURIComponent(pkg.version)}`,
        );
        if (!response.ok)
          return {
            metadataStatus: `unresolved HTTP ${response.status}`,
            license: "NOASSERTION",
          };
        const data = await response.json();
        return {
          license: data.licenses.join(" OR ") || "NOASSERTION",
          publishedAt: data.publishedAt,
          deprecated: data.isDeprecated,
          repository: data.links?.find((l) => l.label === "SOURCE_REPO")?.url,
          metadataStatus:
            "public version metadata; individual notice/source clearance still required",
        };
      })(),
    );
  return metadataCache.get(key);
}
let cursor = 0;
await Promise.all(
  Array.from({ length: 6 }, async () => {
    while (cursor < all.length) {
      const pkg = all[cursor++];
      Object.assign(pkg, await metadata(pkg));
    }
  }),
);
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
const binaries = [];
for (const [path, component] of [
  [
    "node_modules/.pnpm/@pagefind+darwin-arm64@1.5.2/node_modules/@pagefind/darwin-arm64/bin/pagefind",
    "Pagefind native indexer",
  ],
  [
    "node_modules/.pnpm/@astrojs+compiler-binding-darwin-arm64@0.5.2/node_modules/@astrojs/compiler-binding-darwin-arm64/astro.darwin-arm64.node",
    "Astro native compiler",
  ],
]) {
  try {
    const bytes = await readFile(path);
    binaries.push({
      path,
      component,
      sha256: hash(bytes),
      bytes: bytes.length,
    });
  } catch {
    binaries.push({
      path,
      component,
      status: "not installed on this platform; lock pins retained",
    });
  }
}
const artifact = JSON.parse(
  await readFile("apps/website/dist-preview/website-artifact.json", "utf8"),
);
for (const [path, sha256] of Object.entries(artifact.files))
  if (path.startsWith("pagefind/"))
    binaries.push({
      path,
      sha256,
      component:
        "locally served Pagefind output (JS/WASM/index/UI alternatives retained)",
    });
// Upstream source locks are pinned to tags and checked byte-for-byte.
const provenance = JSON.parse(
  await readFile(`${base}/upstream/provenance.json`, "utf8"),
);
for (const source of provenance.sources) {
  const actual = hash(
    await readFile(`${base}/upstream/${source.folder}/${source.file}`),
  );
  if (actual !== source.sha256)
    throw new Error(`Upstream lock drifted: ${source.folder}/${source.file}`);
}
const report = {
  schemaVersion: 1,
  date: "2026-10-26",
  qualification:
    "BLOCKED — unapproved compiler prereleases and unresolved native security/license/source evidence",
  npm,
  upstreamNpm,
  cargo,
  binaries,
  provenance: provenance.sources,
  unapprovedPrereleases: all.filter(
    (p) =>
      /^\d+\.\d+\.\d+-/.test(p.version) &&
      !(p.name === "get-tsconfig" && p.version === "5.0.0-beta.6"),
  ),
};
await writeFile(
  `${base}/inventory.json`,
  JSON.stringify(report, null, 2) + "\n",
);
console.log(
  JSON.stringify({
    npm: npm.length,
    bundledNpm: upstreamNpm.length,
    cargo: cargo.length,
    unapprovedPrereleases: report.unapprovedPrereleases.map(
      (p) => `${p.name}@${p.version}`,
    ),
    unknownLicenses: all.filter((p) => p.license === "NOASSERTION").length,
  }),
);
