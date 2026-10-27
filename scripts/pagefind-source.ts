// SPDX-License-Identifier: AGPL-3.0-or-later
// Owned third-party build tooling. No global Rust/rustup state is read or changed.
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  readFile,
  writeFile,
  mkdir,
  rm,
  cp,
  readdir,
  lstat,
  readlink,
} from "node:fs/promises";
import { resolve, basename } from "node:path";
import { gzipSync } from "node:zlib";

const root = resolve(import.meta.dirname, "..");
const policy = resolve(root, "apps/website/qualification/controlled");
const work = resolve(root, ".tmp/pagefind");
const source = resolve(work, "source");
const tools = resolve(work, "tools");
const target =
  process.platform === "darwin" && process.arch === "arm64"
    ? "aarch64-apple-darwin"
    : process.platform === "linux" && process.arch === "x64"
      ? "x86_64-unknown-linux-gnu"
      : undefined;
if (!target)
  throw new Error(
    "Only macOS arm64 and Linux amd64 GNU are in qualification scope",
  );
const command = process.argv[2];
if (!["fetch", "build", "verify"].includes(command ?? ""))
  throw new Error("Usage: node scripts/pagefind-source.ts fetch|build|verify");
const hash = (b: Uint8Array | string) =>
  createHash("sha256").update(b).digest("hex");
const json = async (path: string) => JSON.parse(await readFile(path, "utf8"));
interface Input {
  url: string;
  sha256: string;
  target?: string;
  name?: string;
}
const inputs = (await json(resolve(policy, "inputs.json"))) as {
  pagefind: Input & { version: string; commit: string };
  rustPatchDerive: Input;
  compiler: Input;
  rolldown: Input & { version: string; commit: string };
  satteri: Input & { version: string; commit: string };
  wasmBindgen: (Input & { target: string })[];
  // Rolldown's mimalloc v3 C sources are configured by CMake (libmimalloc-sys2).
  cmake: (Input & { target: string; version: string; binary: string })[];
  rustVersion: string;
  vendoredGzip: { path: string; sha256: string };
};
const toolchain = (await json(resolve(policy, "toolchain.json"))) as Input[];
const cmakeInput = inputs.cmake.find((p) => p.target === target);
if (!cmakeInput) throw new Error(`No pinned CMake for ${target}`);
const env = {
  // Do not pass user RUSTFLAGS/CARGO_TARGET_*/RUSTC_WRAPPER or Pagefind config.
  PATH: `${tools}/rust/bin:${process.env.PATH}`,
  HOME: process.env.HOME,
  TMPDIR: process.env.TMPDIR,
  SystemRoot: process.env.SystemRoot,
  CARGO_HOME: resolve(work, "cargo-home"),
  RUSTUP_HOME: resolve(work, "unused-rustup-home"),
  RUSTC: resolve(tools, "rust/bin/rustc"),
  RUSTDOC: resolve(tools, "rust/bin/rustdoc"),
  CARGO_BUILD_JOBS: "4",
  CARGO_PROFILE_RELEASE_STRIP: "none",
  CARGO_INCREMENTAL: "0",
  CARGO_TARGET_DIR: resolve(work, "target"),
  SOURCE_DATE_EPOCH: "1774742400",
  // Paths differ between CI/local; this removes them from Rust object/debug data.
  RUSTFLAGS: `--remap-path-prefix=${work}=/pagefind-build`,
  DO_NOT_TRACK: "1",
  // Pinned CMake from the fetch stage, never a host installation.
  CMAKE: resolve(tools, "cmake", cmakeInput.binary),
  // Fixed deployment target instead of the host OS version (Rust's aarch64 default).
  ...(process.platform === "darwin" ? { MACOSX_DEPLOYMENT_TARGET: "11.0" } : {}),
};
function run(
  bin: string,
  args: string[],
  cwd = source,
  capture = false,
  extraEnv: Record<string, string> = {},
) {
  const result = spawnSync(bin, args, {
    cwd,
    env: { ...env, ...extraEnv },
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
    stdio: capture ? "pipe" : "inherit",
  });
  if (result.status !== 0)
    throw new Error(
      `${bin} ${args.join(" ")}: ${result.error?.message ?? result.stderr ?? result.status}`,
    );
  return result.stdout ?? "";
}
const cargo = (args: string[], cwd = source, capture = false) =>
  run(resolve(tools, "rust/bin/cargo"), args, cwd, capture);
const patches = (await readdir(resolve(policy, "patches"))).sort();
const recipeFiles = [
  "inputs.json",
  "toolchain.json",
  ...patches.map((p) => `patches/${p}`),
  "locks/native.Cargo.lock",
  "locks/web.Cargo.lock",
  "locks/compiler.Cargo.lock",
  "locks/rolldown.Cargo.lock",
  "locks/satteri.Cargo.lock",
];
const recipe: Record<string, string> = {};
for (const file of recipeFiles)
  recipe[file] = hash(await readFile(resolve(policy, file)));
for (const script of [
  "pagefind-source.ts",
  "pagefind-bundle.ts",
  "website-native-trace.ts",
])
  recipe[`scripts/${script}`] = hash(
    await readFile(resolve(root, "scripts", script)),
  );
recipe["pnpm-lock.yaml"] = hash(
  await readFile(resolve(root, "pnpm-lock.yaml")),
);
const recipeSha256 = hash(JSON.stringify(recipe));
await mkdir(work, { recursive: true });
async function fetchInput(input: Input, name: string) {
  const path = resolve(work, "downloads", name);
  await mkdir(resolve(work, "downloads"), { recursive: true });
  let bytes: Buffer;
  try {
    bytes = await readFile(path);
  } catch {
    const response = await fetch(input.url);
    if (!response.ok) throw new Error(`${input.url}: HTTP ${response.status}`);
    bytes = Buffer.from(await response.arrayBuffer());
    await writeFile(path, bytes);
  }
  if (hash(bytes) !== input.sha256)
    throw new Error(`Source/tool checksum mismatch: ${name}`);
  return path;
}
// Upstream test fixtures contain symlinks (including a deliberate loop): pin the link text.
async function fingerprint(file: string) {
  const link = await lstat(file);
  return link.isSymbolicLink()
    ? `symlink:${await readlink(file)}`
    : hash(await readFile(file));
}
async function snapshot(directory: string): Promise<Record<string, string>> {
  const files: Record<string, string> = {};
  async function visit(path: string) {
    for (const entry of await readdir(path, { withFileTypes: true })) {
      if (
        ["target", "vendor", "pkg", "node_modules", ".git"].includes(entry.name)
      )
        continue;
      const file = resolve(path, entry.name);
      if (entry.isDirectory()) await visit(file);
      else files[file.slice(work.length + 1)] = await fingerprint(file);
    }
  }
  await visit(directory);
  return files;
}
if (command === "fetch") {
  // Only this stage contacts public source/registry servers. No private repo or data.
  await rm(source, { recursive: true, force: true });
  await mkdir(source, { recursive: true });
  run(
    "tar",
    [
      "-xzf",
      await fetchInput(inputs.pagefind, "pagefind.tar.gz"),
      "-C",
      source,
      "--strip-components=1",
    ],
    work,
  );
  run(
    "tar",
    [
      "-xzf",
      await fetchInput(inputs.rustPatchDerive, "rust-patch-derive.crate"),
      "-C",
      source,
    ],
    work,
  );
  for (const patch of patches)
    run("git", ["apply", "--check", resolve(policy, "patches", patch)]);
  for (const patch of patches)
    run("git", ["apply", resolve(policy, "patches", patch)]);
  await cp(
    resolve(policy, "locks/native.Cargo.lock"),
    resolve(source, "Cargo.lock"),
  );
  await cp(
    resolve(policy, "locks/web.Cargo.lock"),
    resolve(source, "pagefind_web/Cargo.lock"),
  );
  for (const input of toolchain.filter(
    (p) => p.target === target || p.target === "wasm32-unknown-unknown",
  )) {
    const file = await fetchInput(input, basename(input.url));
    run("tar", ["-xJf", file, "-C", work], work);
    run(
      "sh",
      [
        resolve(
          work,
          basename(input.url).replace(/\.tar\.xz$/, ""),
          "install.sh",
        ),
        `--prefix=${tools}/rust`,
        "--disable-ldconfig",
      ],
      work,
    );
  }
  const bindgen = inputs.wasmBindgen.find((p) => p.target === target)!;
  await mkdir(tools, { recursive: true });
  run(
    "tar",
    ["-xzf", await fetchInput(bindgen, "wasm-bindgen.tar.gz"), "-C", tools],
    work,
  );
  await rm(resolve(tools, "cmake"), { recursive: true, force: true });
  await mkdir(resolve(tools, "cmake"), { recursive: true });
  run(
    "tar",
    [
      "-xzf",
      await fetchInput(cmakeInput, basename(cmakeInput.url)),
      "-C",
      resolve(tools, "cmake"),
      "--strip-components=1",
    ],
    work,
  );
  // Native modules Astro/Vite execute during the website build: exact npm-release tags.
  const nativeSources = [
    [inputs.compiler, "compiler"],
    [inputs.rolldown, "rolldown"],
    [inputs.satteri, "satteri"],
  ] as const;
  for (const [input, name] of nativeSources) {
    const directory = resolve(work, name);
    await rm(directory, { recursive: true, force: true });
    await mkdir(directory, { recursive: true });
    run(
      "tar",
      [
        "-xzf",
        await fetchInput(input, `${name}.tar.gz`),
        "-C",
        directory,
        "--strip-components=1",
      ],
      work,
    );
    await cp(
      resolve(policy, `locks/${name}.Cargo.lock`),
      resolve(directory, "Cargo.lock"),
    );
    cargo(["fetch", "--locked"], directory);
  }
  // Fetch all locked alternatives so Cargo vendor/source delivery never needs a network build.
  cargo(["fetch", "--locked"]);
  cargo(["fetch", "--locked", "--manifest-path", "pagefind_web/Cargo.toml"]);
  await writeFile(
    resolve(work, "fetched.json"),
    JSON.stringify(
      {
        target,
        recipeSha256,
        sourceFiles: {
          ...(await snapshot(source)),
          ...(await snapshot(resolve(work, "compiler"))),
          ...(await snapshot(resolve(work, "rolldown"))),
          ...(await snapshot(resolve(work, "satteri"))),
          ...(await snapshot(tools)),
        },
      },
      null,
      2,
    ),
  );
  console.log(`Pinned source fetch complete: ${target}`);
  process.exit(0);
}
const fetched = await json(resolve(work, "fetched.json"));
if (fetched.recipeSha256 !== recipeSha256 || fetched.target !== target)
  throw new Error("Source recipe changed or missing; run pagefind:fetch");
for (const [file, expected] of Object.entries(
  fetched.sourceFiles as Record<string, string>,
)) {
  if ((await fingerprint(resolve(work, file))) !== expected)
    throw new Error(`Pinned source/tool changed: ${file}`);
}
if (command === "verify") {
  const receipt = await json(resolve(work, "receipt.json"));
  if (receipt.recipeSha256 !== recipeSha256 || receipt.target !== target)
    throw new Error("Controlled Pagefind build is stale; run pagefind:build");
  for (const [file, expected] of Object.entries(receipt.files)) {
    if (hash(await readFile(resolve(work, file))) !== expected)
      throw new Error(`Controlled Pagefind artifact changed: ${file}`);
  }
  console.log(
    `Verified controlled Pagefind ${inputs.pagefind.version}: ${target}`,
  );
  process.exit(0);
}
const rustc = run(env.RUSTC, ["--version", "--verbose"], source, true);
if (!rustc.startsWith(`rustc ${inputs.rustVersion} `))
  throw new Error("Unexpected Rust compiler");
if (
  !run(env.CMAKE, ["--version"], work, true).startsWith(
    `cmake version ${cmakeInput.version}\n`,
  )
)
  throw new Error("Unexpected CMake");
const bindgenFolder = basename(
  inputs.wasmBindgen.find((p) => p.target === target)!.url,
).replace(/\.tar\.gz$/, "");
const bindgen = resolve(tools, bindgenFolder, "wasm-bindgen");
if (run(bindgen, ["--version"], source, true).trim() !== "wasm-bindgen 0.2.117")
  throw new Error("Unexpected wasm-bindgen");
if (
  hash(await readFile(resolve(source, inputs.vendoredGzip.path))) !==
  inputs.vendoredGzip.sha256
)
  throw new Error("Vendored gzip source changed");
const vendor = resolve(source, "pagefind/vendor");
await rm(vendor, { recursive: true, force: true });
await mkdir(resolve(vendor, "wasm"), { recursive: true });
for (const language of ["unknown", "de", "en"]) {
  const web = resolve(source, "pagefind_web");
  cargo(
    [
      "build",
      "--release",
      "--frozen",
      "--offline",
      "--target",
      "wasm32-unknown-unknown",
      "--no-default-features",
      ...(language === "unknown" ? [] : ["--features", language]),
    ],
    web,
  );
  run(
    bindgen,
    [
      "--target",
      "no-modules",
      "--out-dir",
      "pkg",
      "--out-name",
      "pagefind_web",
      resolve(work, "target/wasm32-unknown-unknown/release/pagefind_web.wasm"),
    ],
    web,
  );
  const bytes = await readFile(resolve(web, "pkg/pagefind_web_bg.wasm"));
  await writeFile(
    resolve(vendor, `wasm/pagefind_web_bg.${language}.1.5.2.wasm.gz`),
    gzipSync(Buffer.concat([Buffer.from("pagefind_dcd"), bytes]), { level: 9 }),
  );
  const js = (
    await readFile(resolve(web, "pkg/pagefind_web.js"), "utf8")
  ).replace(/document\..?currentScript\..?src/, '"UNHANDLED"');
  if (language === "unknown")
    await writeFile(resolve(vendor, "pagefind_web.1.5.2.js"), js);
  else if (
    js !== (await readFile(resolve(vendor, "pagefind_web.1.5.2.js"), "utf8"))
  )
    throw new Error("Language bindings differ");
}
// Native Node-API modules executed by Astro/Vite, built from their npm-release tags.
// Astro compiler: default system allocator (no optional mimalloc/CMake build).
// Rolldown/Sätteri: upstream release features; Rolldown's mimalloc C sources are
// compiled by the host C compiler recorded in the receipt.
await rm(resolve(work, "bin"), { recursive: true, force: true });
await mkdir(resolve(work, "bin"), { recursive: true });
const nativeModules = [
  ["compiler", "astro_napi", ["--no-default-features"], "astro_napi", "astro.node"],
  ["rolldown", "rolldown_binding", [], "rolldown_binding", "rolldown.node"],
  ["satteri", "satteri-napi", [], "satteri_napi", "satteri.node"],
] as const;
for (const [directory, pkg, features, library, output] of nativeModules) {
  cargo(
    [
      "build",
      "--package",
      pkg,
      ...features,
      "--release",
      "--frozen",
      "--offline",
      "--target",
      target,
    ],
    resolve(work, directory),
  );
  await cp(
    resolve(
      work,
      `target/${target}/release/lib${library}.${process.platform === "darwin" ? "dylib" : "so"}`,
    ),
    resolve(work, "bin", output),
  );
}
const cc = run(
  process.platform === "darwin" ? "cc" : "gcc",
  ["--version"],
  work,
  true,
)
  .split("\n")[0]!
  .trim();
// Browser JS: Rolldown JS API, executing only the controlled Rolldown binding.
const bundleTrace = resolve(work, "bundle-loads.jsonl");
await rm(bundleTrace, { force: true });
run(
  process.execPath,
  [
    `--import=${resolve(root, "scripts/website-native-trace.ts")}`,
    resolve(root, "scripts/pagefind-bundle.ts"),
    source,
    vendor,
    resolve(work, "bundle.json"),
  ],
  root,
  false,
  {
    SOURCE_TASTER_CONTROLLED_BIN: resolve(work, "bin"),
    SOURCE_TASTER_NATIVE_TRACE: bundleTrace,
  },
);
const rolldownBinding = hash(await readFile(resolve(work, "bin/rolldown.node")));
const bundleLoads = (await readFile(bundleTrace, "utf8"))
  .trim()
  .split("\n")
  .map((line) => JSON.parse(line));
if (
  !bundleLoads.some((l) => l.sha256 === rolldownBinding) ||
  bundleLoads.some((l) => !l.controlled)
)
  throw new Error("Browser JS was not bundled by the controlled Rolldown");
// The native CLI embeds the browser bundles above (include_str!), so it builds last.
cargo([
  "build",
  "--release",
  "--frozen",
  "--offline",
  "--target",
  target,
  "--package",
  "pagefind",
  "--no-default-features",
]);
await cp(
  resolve(work, `target/${target}/release/pagefind`),
  resolve(work, "bin/pagefind"),
);
// Selected normal/build closures come from Cargo's feature-aware trees, never metadata closure alone.
const graphs: Record<string, unknown> = {};
const web = resolve(source, "pagefind_web");
const wasm = "wasm32-unknown-unknown";
for (const [name, cwd, graphTarget, features] of [
  ["native", source, target, ["--package", "pagefind", "--no-default-features"]],
  ["compiler", resolve(work, "compiler"), target, ["--package", "astro_napi", "--no-default-features"]],
  ["rolldown", resolve(work, "rolldown"), target, ["--package", "rolldown_binding"]],
  ["satteri", resolve(work, "satteri"), target, ["--package", "satteri-napi"]],
  ["web-de", web, wasm, ["--no-default-features", "--features", "de"]],
  ["web-en", web, wasm, ["--no-default-features", "--features", "en"]],
  ["web-unknown", web, wasm, ["--no-default-features"]],
] as [string, string, string, string[]][]) {
  const args = [
    "tree",
    "--frozen",
    "--offline",
    "--target",
    graphTarget,
    "--edges",
    "normal,build",
    ...features,
  ];
  const tree = cargo(
    [...args, "--prefix", "none", "--format", "{p}"],
    cwd,
    true,
  );
  const identities = [
    ...new Set(
      tree
        .trim()
        .split("\n")
        .filter(Boolean)
        .map((l) => l.replace(/ \(.*$/, "").replace(" v", "@")),
    ),
  ].sort();
  if (
    identities.some((p) =>
      /^(actix|h2@|zstd|charabia|lindera|yaml-rust|proc-macro-error@|proc-macro-error2@|bincode@|unsafe-libyaml|core2@|encoding@)/.test(
        p,
      ),
    )
  )
    throw new Error(`Excluded component in ${name}`);
  const featureTree = cargo(
    [...args, "--edges", "normal,build,features"],
    cwd,
    true,
  );
  await writeFile(resolve(work, `${name}.tree.txt`), featureTree);
  const metadata = JSON.parse(
    cargo(
      [
        "metadata",
        "--frozen",
        "--offline",
        "--format-version",
        "1",
        "--filter-platform",
        graphTarget,
        // Superset for license/source lookup; the selected set is the feature-aware tree.
        "--all-features",
      ],
      cwd,
      true,
    ),
  );
  const lock = await readFile(resolve(cwd, "Cargo.lock"), "utf8");
  const checksums = new Map(
    lock
      .split(/^\[\[package\]\]$/m)
      .slice(1)
      .map((entry) => [
        `${entry.match(/^name = "([^"]+)"$/m)?.[1]}@${entry.match(/^version = "([^"]+)"$/m)?.[1]}`,
        entry.match(/^checksum = "([^"]+)"$/m)?.[1],
      ]),
  );
  const packages = metadata.packages
    .filter((p: { name: string; version: string }) =>
      identities.includes(`${p.name}@${p.version}`),
    )
    .map(
      (p: {
        name: string;
        version: string;
        license: string;
        source: string | null;
        manifest_path: string;
      }) => ({
        name: p.name,
        version: p.version,
        license: p.license,
        source: p.source,
        checksum: checksums.get(`${p.name}@${p.version}`),
        manifestPath: p.manifest_path
          .replace(source, "source")
          .replace(work, "."),
      }),
    );
  if (packages.length !== identities.length || !packages.length)
    throw new Error(`Incomplete ${name} inventory`);
  graphs[name] = {
    target: graphTarget,
    features,
    packages,
    featureTreeSha256: hash(featureTree),
  };
}
await writeFile(resolve(work, "graphs.json"), JSON.stringify(graphs, null, 2));
const files: Record<string, string> = {};
for (const file of [
  "bin/pagefind",
  "bin/astro.node",
  "bin/rolldown.node",
  "bin/satteri.node",
  "bundle.json",
  "graphs.json",
  ...Object.keys(graphs).map((n) => `${n}.tree.txt`),
  ...(await readdir(vendor).then((a) =>
    a
      .filter((f) => f.endsWith(".js"))
      .map((f) => `source/pagefind/vendor/${f}`),
  )),
  ...["unknown", "de", "en"].map(
    (l) => `source/pagefind/vendor/wasm/pagefind_web_bg.${l}.1.5.2.wasm.gz`,
  ),
])
  files[file] = hash(await readFile(resolve(work, file)));
await writeFile(
  resolve(work, "receipt.json"),
  JSON.stringify(
    {
      schemaVersion: 1,
      target,
      version: inputs.pagefind.version,
      recipeSha256,
      recipe,
      rustc,
      cc,
      cmake: cmakeInput.version,
      rolldown: "1.2.15",
      nativeFeatures: [],
      wasmFeatures: ["de", "en"],
      files,
    },
    null,
    2,
  ),
);
console.log(`Built controlled Pagefind: ${target}`);
