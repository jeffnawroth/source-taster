// SPDX-License-Identifier: AGPL-3.0-or-later
// Operational acceptance controls at the build/scanner CLI boundaries. Run
// sequentially against a completed build; every temporary mutation is restored.
import { spawnSync } from "node:child_process";
import { readFile, writeFile, mkdir, rm, chmod } from "node:fs/promises";
import { resolve, basename, dirname } from "node:path";
import { createHash } from "node:crypto";
import type { BuildReceipt, BuildGraph } from "./website-evidence.ts";
import {
  elect,
  qualifyNativeLicense,
  verifyUnicodeNotice,
} from "./website-native-licenses.ts";
const root = resolve(import.meta.dirname, "..");
const work = resolve(root, ".tmp/pagefind");
const control = resolve(root, ".tmp/qualification-controls");
await mkdir(control, { recursive: true });
const results: string[] = [];
const hash = (b: Buffer) => createHash("sha256").update(b).digest("hex");
function run(args: string[], env: NodeJS.ProcessEnv = process.env) {
  const result = spawnSync(process.execPath, args, {
    cwd: root,
    env,
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
  });
  return {
    status: result.status,
    output: `${result.stdout ?? ""}${result.stderr ?? ""}`,
  };
}
function requireResult(
  result: ReturnType<typeof run>,
  success: boolean,
  message: string,
) {
  if ((result.status === 0) !== success || !result.output.includes(message))
    throw new Error(`Control failed (${message}): ${result.output}`);
  results.push(message);
  console.log(`Passed: ${message}`);
}
const verify = ["scripts/pagefind-source.ts", "verify"];
requireResult(run(verify), true, "Verified controlled Pagefind");
for (const [path, error] of [
  ["bin/pagefind", "Controlled Pagefind artifact changed"],
  ["source/pagefind_web/src/lib.rs", "Pinned source/tool changed"],
] as const) {
  const file = resolve(work, path);
  const original = await readFile(file);
  try {
    await writeFile(
      file,
      Buffer.concat([
        original,
        Buffer.from("\nqualification-negative-control\n"),
      ]),
    );
    requireResult(run(verify), false, error);
  } finally {
    await writeFile(file, original);
  }
}
const unknownInput = resolve(work, "source/unexpected-build-input");
try {
  await writeFile(unknownInput, "qualification-negative-control");
  requireResult(run(verify), false, "Pinned source/tool changed");
} finally {
  await rm(unknownInput, { force: true });
}
const noticeFile = resolve(
  root,
  "apps/website/dist-preview/third-party/pagefind/NOTICE.txt",
);
const originalNotice = await readFile(noticeFile);
try {
  await writeFile(
    noticeFile,
    Buffer.concat([originalNotice, Buffer.from("\nchanged notice\n")]),
  );
  requireResult(
    run(["scripts/website-qualification.ts"]),
    false,
    "Website artifact changed",
  );
} finally {
  await writeFile(noticeFile, originalNotice);
}
// Exercise the same source/scope qualifier used by the actual gate. No fake
// scanner result or license-name recognition can satisfy these identity checks.
const graphs = JSON.parse(
  await readFile(resolve(work, "graphs.json"), "utf8"),
) as Record<string, BuildGraph>;
const hostTarget = (
  JSON.parse(
    await readFile(resolve(work, "receipt.json"), "utf8"),
  ) as BuildReceipt
).target;
async function licenseControl(
  name: string,
  action: () => unknown,
  error?: string,
) {
  let failure: unknown;
  try {
    await action();
  } catch (caught) {
    failure = caught;
  }
  if (
    error
      ? !(failure instanceof Error && failure.message.includes(error))
      : failure !== undefined
  )
    throw new Error(`License control failed: ${name}: ${String(failure)}`);
  results.push(name);
  console.log(`Passed: ${name}`);
}
const compiler = graphs.compiler;
const mpl = compiler.packages.find((p) => p.name === "cssparser")!;
const qualify = (
  pkg = mpl,
  name = "compiler",
  graph = compiler,
  target = hostTarget,
) => qualifyNativeLicense(pkg, name, graph, target, work);
await licenseControl("Exact MPL source/build scope qualifies", async () => {
  if ((await qualify())?.elected !== "MPL-2.0")
    throw new Error("Missing qualification");
});
await licenseControl(
  "MPL browser scope refused",
  () => qualify(mpl, "web-en", graphs["web-en"]),
  "Native license scope mismatch",
);
await licenseControl(
  "Unqualified host target refused",
  () => qualify(mpl, "compiler", compiler, "unknown-target"),
  "Native license scope mismatch",
);
await licenseControl(
  "Expanded build features refused",
  () =>
    qualify(mpl, "compiler", {
      ...compiler,
      features: [...compiler.features, "--all-features"],
    }),
  "Native license scope mismatch",
);
await licenseControl(
  "Changed crate checksum refused",
  () => qualify({ ...mpl, checksum: "0".repeat(64) }),
  "Native license identity mismatch",
);
await licenseControl(
  "Changed crate source refused",
  () => qualify({ ...mpl, source: "registry+https://example.invalid/index" }),
  "Native license identity mismatch",
);
await licenseControl(
  "Changed license expression refused",
  () => qualify({ ...mpl, license: "MIT" }),
  "Native license identity mismatch",
);
await licenseControl("Unknown MPL version remains unqualified", async () => {
  if (await qualify({ ...mpl, version: "999.0.0" }))
    throw new Error("Unknown version qualified");
  if (elect("MPL-2.0", (id) => id === "MIT"))
    throw new Error("Unexpected baseline permission");
});
await licenseControl("Unicode election retains conjunctive term", () => {
  if (
    elect("(MIT OR Apache-2.0) AND Unicode-3.0", (id) =>
      ["MIT", "Unicode-3.0"].includes(id),
    ) !== "MIT AND Unicode-3.0"
  )
    throw new Error("Unicode dropped");
  if (
    elect("(MIT OR Apache-2.0) AND Unicode-3.0", (id) => id === "MIT") !==
    undefined
  )
    throw new Error("Unicode term waived");
});
await licenseControl("Unknown license remains unqualified", () => {
  if (elect("LicenseRef-Unknown", (id) => id === "MIT"))
    throw new Error("Unknown license qualified");
});
await licenseControl(
  "Malformed SPDX refused",
  () => elect("MIT OR (Apache-2.0 AND)", () => true),
  "Bad SPDX",
);
const mplDirectory = dirname(resolve(work, mpl.manifestPath));
const mplArchive = resolve(
  work,
  "cargo-home/registry/cache",
  basename(dirname(mplDirectory)),
  `${mpl.name}-${mpl.version}.crate`,
);
for (const [file, name, error] of [
  [
    mplArchive,
    "Corrupt exact crate archive refused",
    "Native license archive mismatch",
  ],
  [
    resolve(mplDirectory, "LICENSE"),
    "Corrupt exact license text refused",
    "Native license text mismatch",
  ],
] as const) {
  const original = await readFile(file);
  try {
    await writeFile(
      file,
      Buffer.concat([original, Buffer.from("\nlicense-control\n")]),
    );
    await licenseControl(name, () => qualify(), error);
  } finally {
    await writeFile(file, original);
  }
}
const unicode = graphs["web-en"]!.packages.find(
  (p) => p.name === "unicode-ident",
)!;
const unicodeText = await readFile(
  resolve(dirname(resolve(work, unicode.manifestPath)), "LICENSE-UNICODE"),
  "utf8",
);
await licenseControl(
  "Dropped Unicode delivery term refused",
  () =>
    verifyUnicodeNotice(
      originalNotice.toString().replace(unicodeText, ""),
      work,
      graphs,
    ),
  "Missing conjunctive Unicode notice",
);
const guardEnv = {
  ...process.env,
  SOURCE_TASTER_CONTROLLED_BIN: resolve(work, "bin"),
  SOURCE_TASTER_NATIVE_TRACE: resolve(control, "refused.jsonl"),
};
for (const [script, error] of [
  [
    "import {spawnSync} from 'node:child_process'; spawnSync('/usr/bin/true');",
    "Refused uncontrolled executable",
  ],
  [
    `process.dlopen({}, ${JSON.stringify(resolve(work, "bin/astro.node"))});`,
    "Refused uncontrolled native module",
  ],
])
  requireResult(
    run(
      [
        "--import=./scripts/website-native-trace.ts",
        "--input-type=module",
        "-e",
        script!,
      ],
      guardEnv,
    ),
    false,
    error!,
  );

// Scanner adapter failure controls: never mistake version success, malformed
// output, an incomplete inventory or a positive advisory match for a clear scan.
const reports = ["osv.json", "summary.json", "website-dispositions.json"];
const originalReports = await Promise.all(
  reports.map((p) => readFile(resolve(root, ".tmp/audit", p))),
);
const scanner = resolve(control, "scanner.mjs");
const report = JSON.parse(originalReports[0]!.toString()) as {
  results: {
    source: { path: string };
    packages: { vulnerabilities?: { id: string }[] }[];
  }[];
};
const selected = report.results.find((r: { source: { path: string } }) =>
  r.source.path.endsWith("/.tmp/pagefind/selected/Cargo.lock"),
);
if (!selected?.packages.length)
  throw new Error("A real complete scan must precede controls");
selected.packages[0]!.vulnerabilities = [
  { id: "QUALIFICATION-CONTROL-ADVISORY" },
];
await writeFile(resolve(control, "positive.json"), JSON.stringify(report));
await writeFile(
  resolve(control, "omitted-source.json"),
  JSON.stringify({
    results: report.results.filter(
      (r) => !r.source.path.includes("/upstream/astro-compiler/"),
    ),
  }),
);
try {
  for (const [body, error] of [
    ["process.exit(2);", "OSV scan failed"],
    ["writeFileSync(output, '{');", "JSON"],
    ["writeFileSync(output, JSON.stringify({results: []}));", "Incomplete OSV"],
    [
      `writeFileSync(output, readFileSync(${JSON.stringify(resolve(control, "omitted-source.json"))})); process.exit(1);`,
      "Incomplete OSV source inventory",
    ],
    [
      `writeFileSync(output, readFileSync(${JSON.stringify(resolve(control, "positive.json"))})); process.exit(1);`,
      "Actual selected dependency advisory found",
    ],
  ]) {
    await writeFile(
      scanner,
      `#!/usr/bin/env node\nimport {writeFileSync,readFileSync} from 'node:fs'; if(process.argv.includes('--version')) { console.log('osv-scanner version: 2.7.0'); process.exit(0); } const output=process.argv[process.argv.indexOf('--output-file')+1]; ${body}\n`,
    );
    await chmod(scanner, 0o755);
    requireResult(
      run(["scripts/audit.ts"], { ...process.env, OSV_SCANNER_BIN: scanner }),
      false,
      error!,
    );
  }
} finally {
  await Promise.all(
    reports.map((p, i) =>
      writeFile(resolve(root, ".tmp/audit", p), originalReports[i]!),
    ),
  );
}

// Reproduce WASM using only the source package delivered to website readers.
const staleCache = resolve(control, "stale-db");
await mkdir(resolve(staleCache, "osv-scalibr/npm"), { recursive: true });
await writeFile(
  resolve(staleCache, "osv-scalibr/npm/all.zip"),
  "not an advisory database",
);
await writeFile(
  resolve(staleCache, "headers.txt"),
  "last-modified: Thu, 01 Jan 1970 00:00:00 GMT\n",
);
requireResult(
  run(["scripts/audit.ts"], {
    ...process.env,
    OSV_SCANNER_LOCAL_DB_CACHE_DIRECTORY: staleCache,
  }),
  false,
  "OSV database missing, empty or stale",
);
const archive = resolve(
  root,
  "apps/website/dist-preview/third-party/pagefind/corresponding-source.tar.gz",
);
const firstArchive = hash(await readFile(archive));
requireResult(
  run(["scripts/pagefind-delivery.ts", "apps/website/dist-preview"]),
  true,
  "Delivered hash-bound browser source/notice package",
);
if (hash(await readFile(archive)) !== firstArchive)
  throw new Error("Source delivery is not reproducible from identical inputs");
results.push("Source delivery is reproducible from identical inputs");
const reproduction = resolve(control, "source");
await rm(reproduction, { force: true, recursive: true });
await mkdir(reproduction, { recursive: true });
const extracted = spawnSync("tar", ["-xzf", archive, "-C", reproduction], {
  encoding: "utf8",
});
if (extracted.status !== 0) throw new Error(extracted.stderr);
const inputs = JSON.parse(
  await readFile(
    resolve(root, "apps/website/qualification/controlled/inputs.json"),
    "utf8",
  ),
) as { wasmBindgen: { target: string; url: string }[] };
const receipt = JSON.parse(
  await readFile(resolve(work, "receipt.json"), "utf8"),
) as BuildReceipt;
const bindgen = inputs.wasmBindgen.find(
  (p: { target: string }) => p.target === receipt.target,
);
if (!bindgen) throw new Error("Missing bindgen input");
const rebuild = () =>
  spawnSync("bash", ["build-wasm.sh"], {
    cwd: reproduction,
    env: {
      PATH: process.env.PATH,
      HOME: process.env.HOME,
      PAGEFIND_RUST_BIN: resolve(work, "tools/rust/bin"),
      PAGEFIND_BINDGEN: resolve(
        work,
        "tools",
        basename(bindgen.url).replace(/\.tar\.gz$/, ""),
        "wasm-bindgen",
      ),
    },
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
  });
const deliveredLib = resolve(reproduction, "pagefind_web/src/lib.rs");
const originalLib = await readFile(deliveredLib);
try {
  await writeFile(
    deliveredLib,
    Buffer.concat([originalLib, Buffer.from("\nchanged source\n")]),
  );
  const rejected = rebuild();
  requireResult(
    {
      status: rejected.status,
      output: `${rejected.stdout}\n${rejected.stderr}`,
    },
    false,
    "Source checksum mismatch",
  );
} finally {
  await writeFile(deliveredLib, originalLib);
}
const rebuilt = rebuild();
await writeFile(
  resolve(control, "reproduction.log"),
  `${rebuilt.stdout}\n${rebuilt.stderr}`,
);
if (rebuilt.status !== 0)
  throw new Error(`Delivered source rebuild failed: ${rebuilt.stderr}`);
const wasm: Record<string, string> = {};
for (const language of ["unknown", "de", "en"]) {
  const actual = hash(
    await readFile(resolve(reproduction, `rebuilt/wasm.${language}.pagefind`)),
  );
  if (
    actual !==
    receipt.files[
      `source/pagefind/vendor/wasm/pagefind_web_bg.${language}.1.5.2.wasm.gz`
    ]
  )
    throw new Error(
      `Delivered source does not reproduce shipped ${language} WASM`,
    );
  wasm[language] = actual;
}
results.push("Delivered source reproduces all three shipped WASM objects");
await mkdir(resolve(work, "evidence"), { recursive: true });
await writeFile(
  resolve(work, "evidence/controls.json"),
  JSON.stringify(
    {
      target: receipt.target,
      recipeSha256: receipt.recipeSha256,
      results,
      wasm,
    },
    null,
    2,
  ) + "\n",
);
console.log(JSON.stringify({ results, wasm }));
