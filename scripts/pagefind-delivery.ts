// SPDX-License-Identifier: AGPL-3.0-or-later
// Prepare the actual source-and-notice offer beside the browser object code.
import {
  readFile,
  writeFile,
  mkdir,
  cp,
  rm,
  readdir,
  stat,
} from "node:fs/promises";
import { resolve, dirname, basename, relative } from "node:path";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { gzipSync } from "node:zlib";
import { sourceAccess } from "../apps/website/src/source-access.ts";
import type { BuildReceipt } from "./website-evidence.ts";
const root = resolve(import.meta.dirname, "..");
const work = resolve(root, ".tmp/pagefind");
const source = resolve(work, "source");
const policy = resolve(root, "apps/website/qualification/controlled");
const hash = (b: Buffer | string) =>
  createHash("sha256").update(b).digest("hex");
interface Package {
  name: string;
  version: string;
  license: string;
  manifestPath: string;
  source: string | null;
}
const receipt = JSON.parse(
  await readFile(resolve(work, "receipt.json"), "utf8"),
) as BuildReceipt;
const graphs = JSON.parse(
  await readFile(resolve(work, "graphs.json"), "utf8"),
) as Record<string, { packages: Package[] }>;
const output = resolve(process.argv[2] ?? "");
if (!process.argv[2]) throw new Error("Expected website output directory");
const verify = spawnSync(
  process.execPath,
  [resolve(root, "scripts/pagefind-source.ts"), "verify"],
  { stdio: "inherit" },
);
if (verify.status !== 0)
  throw new Error("Unverified Pagefind cannot be delivered");
const delivery = resolve(output, "third-party/pagefind");
const staging = resolve(work, "corresponding-source");
await rm(staging, { force: true, recursive: true });
await mkdir(staging, { recursive: true });
await mkdir(delivery, { recursive: true });
// Full upstream source (including native minifier/generator), plus reviewable modifications.
await cp(
  resolve(work, "downloads/pagefind.tar.gz"),
  resolve(staging, "upstream-pagefind.tar.gz"),
);
await cp(policy, resolve(staging, "controlled"), { recursive: true });
await cp(
  resolve(root, "scripts/pagefind-source.ts"),
  resolve(staging, "pagefind-source.ts"),
);
await cp(
  resolve(root, "scripts/pagefind-bundle.ts"),
  resolve(staging, "pagefind-bundle.ts"),
);
await cp(
  resolve(root, "scripts/pagefind-rustc.ts"),
  resolve(staging, "pagefind-rustc.ts"),
);
await cp(
  resolve(root, "scripts/website-native-trace.ts"),
  resolve(staging, "website-native-trace.ts"),
);
await cp(resolve(root, "pnpm-lock.yaml"), resolve(staging, "pnpm-lock.yaml"));
await cp(resolve(work, "bundle.json"), resolve(staging, "bundle.json"));
await cp(
  resolve(root, "scripts/website-recipe.ts"),
  resolve(staging, "website-recipe.ts"),
);
await cp(import.meta.filename, resolve(staging, "pagefind-delivery.ts"));
await cp(resolve(work, "receipt.json"), resolve(staging, "build-receipt.json"));
// Ship the complete input set actually fingerprinted by the shared recipe,
// including qualification scripts/policies needed to inspect this build.
for (const [file, expected] of Object.entries(receipt.recipe)) {
  if (file.startsWith("/") || file.split("/").includes(".."))
    throw new Error(`Unsafe recipe path: ${file}`);
  const bytes = await readFile(resolve(root, file));
  if (hash(bytes) !== expected)
    throw new Error(`Recipe input changed during delivery: ${file}`);
  const destination = resolve(staging, "build-recipe", file);
  await mkdir(dirname(destination), { recursive: true });
  await writeFile(destination, bytes);
}
// Rust's standard library is linked into the WASM too. Preserve its publisher
// copyright report and license catalogue, alongside the explicit Cargo crates.
const rustNotices = resolve(work, "tools/rust/share/doc/rust");
await cp(
  resolve(rustNotices, "COPYRIGHT-library.html"),
  resolve(delivery, "RUST-COPYRIGHT-library.txt"),
);
await mkdir(resolve(staging, "rust-stdlib"), { recursive: true });
await cp(
  resolve(rustNotices, "COPYRIGHT-library.html"),
  resolve(staging, "rust-stdlib/COPYRIGHT-library.html"),
);
await cp(
  resolve(rustNotices, "licenses"),
  resolve(staging, "rust-stdlib/licenses"),
  { recursive: true },
);
for (const directory of ["pagefind_web", "pagefind_stem", "pagefind_web_js"]) {
  for (const name of await readdir(resolve(source, directory))) {
    if (["target", "pkg", "node_modules"].includes(name)) continue;
    await cp(
      resolve(source, directory, name),
      resolve(staging, directory, name),
      { recursive: true, dereference: true },
    );
  }
}
const packages = [
  ...new Map(
    ["web-de", "web-en", "web-unknown"]
      .flatMap((n) => graphs[n]!.packages)
      .map((p) => [`${p.name}@${p.version}`, p]),
  ).values(),
];
await mkdir(resolve(staging, "vendor"), { recursive: true });
await mkdir(resolve(staging, "depSources"), { recursive: true });
const vendoring = spawnSync(
  resolve(work, "tools/rust/bin/cargo"),
  [
    "vendor",
    "--offline",
    "--locked",
    "--versioned-dirs",
    "--manifest-path",
    resolve(source, "pagefind_web/Cargo.toml"),
    resolve(staging, "vendor"),
  ],
  {
    encoding: "utf8",
    env: {
      PATH: `${work}/tools/rust/bin:${process.env.PATH}`,
      HOME: process.env.HOME,
      CARGO_HOME: resolve(work, "cargo-home"),
    },
  },
);
if (vendoring.status !== 0) throw new Error(vendoring.stderr);
const dependencies = [];
let notice = `Source Taster controlled Pagefind 1.5.2 build\n\nModified on 2026-10-26: minimal CLI without serve/extended; YAML configuration and unused UI/highlight/playground distribution removed; stable lock fixes and owned proc-macro diagnostics. Browser WASM built from source on stable Rust 1.99.1 (no nightly/build-std or wasm-opt).\n\nPagefind's own code: MIT. Linked pagefind_microjson 0.1.4: GPL-3.0-only (conservative manifest classification; source header says GPLv3-or-later). Legal interpretation and concrete distribution review remain pending; this preview is not publication approval.\n\n`;
notice += await readFile(resolve(source, "LICENSE"), "utf8");
notice +=
  "\nRust 1.99.1 standard library (MIT OR Apache-2.0), compiler commit 58cf8f9c35b355199727627d07ae34a4e2846d67. The publisher's full library copyright report and license catalogue are included in rust-stdlib/ in Corresponding Source; RUST-COPYRIGHT-library.txt is available beside this notice. Standard library source: https://github.com/rust-lang/rust/tree/58cf8f9c35b355199727627d07ae34a4e2846d67/library . This does not assert that every component of the publisher's general catalogue is linked into these WASM objects.\n";
for (const name of ["MIT", "Apache-2.0"])
  notice += `\nRust ${name}:\n${await readFile(resolve(rustNotices, "licenses", `${name}.txt`), "utf8")}\n`;
notice +=
  "\nVendored fflate-derived gz.js (no independently identified release version):\n";
const gz = await readFile(resolve(source, "pagefind_web_js/lib/gz.js"), "utf8");
notice += gz.slice(0, gz.indexOf("*/") + 2) + "\n";
for (const pkg of packages) {
  const location = dirname(resolve(work, pkg.manifestPath));
  if (!pkg.source) continue; // the local Pagefind/stem source is copied in full above
  if (!pkg.source.startsWith("registry+"))
    throw new Error(`Unknown source delivery input: ${pkg.name}`);
  const packageId = `${pkg.name}-${pkg.version}`;
  const archive = resolve(
    dirname(dirname(dirname(location))),
    "cache",
    basename(dirname(location)),
    `${packageId}.crate`,
  );
  const bytes = await readFile(archive);
  const checksum = (
    JSON.parse(
      await readFile(
        resolve(staging, "vendor", packageId, ".cargo-checksum.json"),
        "utf8",
      ),
    ) as { package: string }
  ).package;
  if (!checksum || hash(bytes) !== checksum)
    throw new Error(`Dependency archive drift: ${packageId}`);
  await writeFile(resolve(staging, "depSources", `${packageId}.crate`), bytes);
  dependencies.push({
    name: pkg.name,
    version: pkg.version,
    license: pkg.license,
    sha256: checksum,
  });
  notice += `\n${pkg.name} ${pkg.version} — ${pkg.license}\n`;
  for (const file of await readdir(location)) {
    if (
      /^(licen[cs]e|notice|copying|copyright)(\.|$|-)/i.test(file) &&
      (await stat(resolve(location, file))).isFile()
    )
      notice += `\n${file}:\n${await readFile(resolve(location, file), "utf8")}\n`;
  }
}
const microjson = packages.find((p) => p.name === "pagefind_microjson");
if (!microjson || microjson.license !== "GPL-3.0-only")
  throw new Error("GPL component identity changed");
const gpl = await readFile(
  resolve(dirname(resolve(work, microjson.manifestPath)), "LICENCE"),
);
await writeFile(resolve(delivery, "GPL-3.0.txt"), gpl);
await writeFile(resolve(delivery, "NOTICE.txt"), notice);
await writeFile(resolve(staging, "NOTICE.txt"), notice);
await writeFile(resolve(staging, "GPL-3.0.txt"), gpl);
await mkdir(resolve(staging, ".cargo"), { recursive: true });
await writeFile(
  resolve(staging, ".cargo/config.toml"),
  '[source.crates-io]\nreplace-with = "vendored-sources"\n[source.vendored-sources]\ndirectory = "vendor"\n',
);
await writeFile(
  resolve(staging, "build-wasm.sh"),
  `#!/usr/bin/env bash
set -eo pipefail
cd "$(dirname "$0")"
node --input-type=module -e 'import{readFileSync}from"node:fs";import{createHash}from"node:crypto";for(const[path,expected]of Object.entries(JSON.parse(readFileSync("source-files.json","utf8"))))if(createHash("sha256").update(readFileSync(path)).digest("hex")!==expected)throw new Error("Source checksum mismatch: "+path);'
: "\u0024{PAGEFIND_RUST_BIN:?Set to the bin directory of pinned stable Rust 1.99.1 with wasm32-unknown-unknown std}"
: "\u0024{PAGEFIND_BINDGEN:?Set to checksum-pinned wasm-bindgen 0.2.117 executable}"
export PATH="$PAGEFIND_RUST_BIN:$PATH"
export CARGO_HOME="$PWD/.offline-cargo-home"
export CARGO_TARGET_DIR="$PWD/target"
unset CARGO_ENCODED_RUSTFLAGS RUSTC_WORKSPACE_WRAPPER
export RUSTC_WRAPPER="$PWD/pagefind-rustc.ts"
chmod +x "$RUSTC_WRAPPER"
rm -rf "$CARGO_TARGET_DIR"
export CARGO_PROFILE_RELEASE_STRIP=none
export RUSTFLAGS="--remap-path-prefix=$PWD=/pagefind-build/source --remap-path-prefix=$PWD/vendor=/pagefind-build/cargo-home/registry/src/index.crates.io-1949cf8c6b5b557f"
rustc --version | grep -Eq '^rustc 1\\.99\\.1 '
"$PAGEFIND_BINDGEN" --version | grep -Eq '^wasm-bindgen 0\\.2\\.117$'
mkdir -p rebuilt
for language in unknown de en; do
  feature=()
  if [ "$language" != unknown ]; then feature=(--features "$language"); fi
  cargo build --manifest-path pagefind_web/Cargo.toml --target wasm32-unknown-unknown --no-default-features --release --offline --frozen "\u0024{feature[@]}"
  "$PAGEFIND_BINDGEN" --target no-modules --out-name pagefind_web --out-dir "rebuilt/$language" target/wasm32-unknown-unknown/release/pagefind_web.wasm
done
node pack-wasm.mjs
`,
);
await writeFile(
  resolve(staging, "pack-wasm.mjs"),
  `import{readFileSync,writeFileSync}from'node:fs';import{gzipSync}from'node:zlib';for(const l of ['unknown','de','en'])writeFileSync('rebuilt/wasm.'+l+'.pagefind',gzipSync(Buffer.concat([Buffer.from('pagefind_dcd'),readFileSync('rebuilt/'+l+'/pagefind_web_bg.wasm')]),{level:9}));\n`,
);
await writeFile(
  resolve(staging, "README.txt"),
  `Corresponding Source delivery candidate for the browser Pagefind WASM/JS listed in distribution-manifest.json.\n\nOffline WASM reproduction: use build-wasm.sh with the exact Rust 1.99.1 and wasm-bindgen 0.2.117 tools listed in controlled/{inputs,toolchain}.json. Dependency sources and original checksum-bound crate archives are included. The pagefind_stem path patch refers to included source. No nightly, remote dictionary, wasm-pack, wasm-opt or AVA is used. All dependency licenses/notices are retained in vendor/ and NOTICE.txt; microjson's GPL manifest/header discrepancy is retained.\n\nFor JS/native generation: upstream-pagefind.tar.gz contains the complete source. controlled/patches and controlled/locks show the changes. pagefind-source.ts is the actual generator and pagefind-bundle.ts the browser JS bundler; their recipe, Rust target/features and the exact Rolldown 1.2.15 pin are in build-receipt.json, and bundle.json lists every bundled module. The complete fingerprinted build/qualification inputs are included in build-recipe/ in their repository layout; build-receipt.json records their hashes. For full native generation, run those tools in the public project checkout with its frozen workspace install. The offline WASM script below is self-contained apart from the pinned bootstrap tools. JS entries import only included Pagefind code (pagefind_web_js/lib), including the fflate-derived gz.js; Rolldown is a generally available build tool, not bundled client code. The site's custom UI source is public AGPL project code; this package does not pretend to determine legal combination boundaries.\n\nThis artifact provides actual local source access; concrete license/legal review and project publication gates remain pending. Build-system qualification covers only Linux amd64 GNU and macOS arm64 when their individual receipts/checks pass. Other targets are not qualified.\n`,
);
const objects: Record<string, string> = {};
for (const language of ["de", "en"]) {
  const dir = resolve(output, "pagefind", language);
  for (const name of await readdir(dir))
    if (/\.(js|pagefind)$/.test(name))
      objects[`pagefind/${language}/${name}`] = hash(
        await readFile(resolve(dir, name)),
      );
  for (const wasmLanguage of ["unknown", language]) {
    const path = `pagefind/${language}/wasm.${wasmLanguage}.pagefind`;
    const expected =
      receipt.files[
        `source/pagefind/vendor/wasm/pagefind_web_bg.${wasmLanguage}.1.5.2.wasm.gz`
      ];
    if (!expected || objects[path] !== expected)
      throw new Error(`Distributed WASM differs from built source: ${path}`);
  }
}
await writeFile(
  resolve(staging, "distribution-manifest.json"),
  JSON.stringify(
    { objects, dependencies, recipeSha256: receipt.recipeSha256 },
    null,
    2,
  ),
);
const sourceFiles: Record<string, string> = {};
async function collect(dir: string) {
  for (const file of (await readdir(dir, { withFileTypes: true })).sort(
    (a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0),
  )) {
    const path = resolve(dir, file.name);
    if (file.isDirectory()) await collect(path);
    else if (file.isFile())
      sourceFiles[relative(staging, path)] = hash(await readFile(path));
    else throw new Error("Unexpected source archive entry");
  }
}
await collect(staging);
await writeFile(
  resolve(staging, "source-files.json"),
  JSON.stringify(sourceFiles, null, 2),
);
const archive = resolve(delivery, "corresponding-source.tar.gz");
// POSIX ustar with fixed metadata, stable ordering and gzip mtime=0. Host tar
// implementations otherwise embed file/directory timestamps and user IDs.
const tarBlocks: Buffer[] = [];
for (const path of [...Object.keys(sourceFiles), "source-files.json"].sort()) {
  const bytes = await readFile(resolve(staging, path));
  const header = Buffer.alloc(512);
  const split = path.length <= 100 ? -1 : path.lastIndexOf("/");
  const name = split < 0 ? path : path.slice(split + 1);
  const prefix = split < 0 ? "" : path.slice(0, split);
  if (Buffer.byteLength(name) > 100 || Buffer.byteLength(prefix) > 155)
    throw new Error(`Source path exceeds ustar bounds: ${path}`);
  header.write(name, 0, 100);
  const octal = (value: number, offset: number, length: number) => {
    const valueText = value.toString(8).padStart(length - 1, "0") + "\0";
    if (valueText.length !== length)
      throw new Error("Source archive field overflow");
    header.write(valueText, offset, length);
  };
  octal(path.endsWith(".sh") ? 0o755 : 0o644, 100, 8);
  octal(0, 108, 8);
  octal(0, 116, 8);
  octal(bytes.length, 124, 12);
  octal(1774742400, 136, 12);
  header.fill(32, 148, 156);
  header.write("0", 156);
  header.write("ustar\0", 257);
  header.write("00", 263);
  header.write(prefix, 345, 155);
  const checksum = header.reduce((sum, byte) => sum + byte, 0);
  header.write(checksum.toString(8).padStart(6, "0") + "\0 ", 148, 8);
  tarBlocks.push(
    header,
    bytes,
    Buffer.alloc((512 - (bytes.length % 512)) % 512),
  );
}
tarBlocks.push(Buffer.alloc(1024));
await writeFile(archive, gzipSync(Buffer.concat(tarBlocks), { level: 9 }));
const manifest = {
  schemaVersion: 1,
  version: "1.5.2",
  modified: "2026-10-26",
  target: receipt.target,
  objects,
  dependencies,
  recipeSha256: receipt.recipeSha256,
  licenses: { pagefind: "MIT", microjson: "GPL-3.0-only", gzJs: "MIT" },
  legalReview: "pending; no publication approval",
  source: {
    path: "corresponding-source.tar.gz",
    sha256: hash(await readFile(archive)),
  },
};
await writeFile(
  resolve(delivery, "manifest.json"),
  JSON.stringify(manifest, null, 2),
);
await writeFile(
  resolve(delivery, "style.css"),
  "*{box-sizing:border-box}body{font:1rem/1.5 system-ui,sans-serif;color:#181818;background:#fff;margin:auto;padding:1rem;max-width:70ch;overflow-wrap:anywhere}a{display:inline-block;min-height:24px;padding:.5rem 0}li{margin:.25rem 0}.languages{display:flex;gap:1.5rem}a:focus-visible{outline:3px solid #1559b7;outline-offset:3px}\n",
);
for (const language of ["de", "en"] as const) {
  const t = sourceAccess[language];
  const other = language === "de" ? "en" : "de";
  const links = [
    ["corresponding-source.tar.gz", t.source],
    ["GPL-3.0.txt", t.gpl],
    ["NOTICE.txt", t.notice],
    ["RUST-COPYRIGHT-library.txt", t.rust],
    ["manifest.json", t.manifest],
  ];
  const html = `<!doctype html><html lang="${language}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><meta name="description" content="${t.description}"><meta name="robots" content="noindex, nofollow"><title>${t.title} · Source Taster</title><link rel="alternate" hreflang="${other}" href="/third-party/pagefind/${other}/"><link rel="stylesheet" href="/third-party/pagefind/style.css"></head><body><main><h1>${t.title}</h1><p>${t.summary}</p><ul>${links.map(([file, label]) => `<li><a href="/third-party/pagefind/${file}">${label}</a></li>`).join("")}</ul><p class="languages"><a href="/third-party/pagefind/en/" lang="en" hreflang="en">English</a><a href="/third-party/pagefind/de/" lang="de" hreflang="de">Deutsch</a></p></main></body></html>`;
  await mkdir(resolve(delivery, language), { recursive: true });
  await writeFile(resolve(delivery, language, "index.html"), html);
  // Keep the original download landing URL useful, with counterpart navigation.
  if (language === "en") await writeFile(resolve(delivery, "index.html"), html);
}
console.log(
  `Delivered hash-bound browser source/notice package: ${dependencies.length} registry source packages`,
);
