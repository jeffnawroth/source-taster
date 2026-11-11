// SPDX-License-Identifier: AGPL-3.0-or-later
import { spawnSync } from "node:child_process";
import { rm, writeFile, readdir, readFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { createRequire } from "node:module";
import { checkPublication, digest } from "./publication.ts";
import "./content-check.ts";
import { assertPreviewAllowed, languages } from "../src/metadata.ts";
import type { NativeLoad } from "../../../scripts/website-evidence.ts";
const preview = process.argv.includes("--preview");
assertPreviewAllowed(preview ? "preview" : "publication");
if (!preview && !process.argv.includes("--publication"))
  throw new Error("Choose --preview or --publication explicitly");
const output = preview ? "dist-preview" : "dist";
// Remove old publish output on any failed/rejected publication attempt as well.
await rm(output, { recursive: true, force: true });
const review = preview ? null : await checkPublication();
const project = resolve(import.meta.dirname, "../../..");
const verify = spawnSync(
  process.execPath,
  [resolve(project, "scripts/pagefind-source.ts"), "verify"],
  { stdio: "inherit" },
);
if (verify.status !== 0)
  throw new Error("A current controlled Pagefind source build is required");
const buildEnvironment = {
  ...process.env,
  ASTRO_TELEMETRY_DISABLED: "1",
  DO_NOT_TRACK: "1",
  SOURCE_TASTER_CONTROLLED_BIN: resolve(project, ".tmp/pagefind/bin"),
  SOURCE_TASTER_NATIVE_TRACE: resolve(
    project,
    ".tmp/pagefind/native-loads.jsonl",
  ),
  // Every Node process of the build (Astro and any Node children) loads the guard.
  NODE_OPTIONS: `--import=${JSON.stringify(pathToFileURL(resolve(project, "scripts/website-native-trace.ts")).href)}`,
  SOURCE_TASTER_WEBSITE_PREVIEW: preview ? "1" : "0",
  SOURCE_TASTER_WEBSITE_OUTPUT: `./${output}`,
};
await rm(buildEnvironment.SOURCE_TASTER_NATIVE_TRACE, { force: true });
// Node runs Astro's CLI directly: no package-manager shim or shell is executed.
const astroCli = resolve(
  createRequire(import.meta.url).resolve("astro/package.json"),
  "../bin/astro.mjs",
);
const astro = spawnSync(process.execPath, [astroCli, "build"], {
  stdio: "inherit",
  env: buildEnvironment,
});
if (astro.status !== 0) process.exit(astro.status ?? 1);
const loads = (
  await readFile(buildEnvironment.SOURCE_TASTER_NATIVE_TRACE, "utf8")
)
  .trim()
  .split("\n")
  .map((line) => JSON.parse(line) as NativeLoad);
const receipt = JSON.parse(
  await readFile(resolve(project, ".tmp/pagefind/receipt.json"), "utf8"),
) as { files: Record<string, string> };
// Fail closed: any refused native module or process, and every executed
// controlled module must be the receipt-bound source build.
const refused = loads.filter((load) => !load.controlled);
if (refused.length)
  throw new Error(`Uncontrolled build execution: ${JSON.stringify(refused)}`);
// This site's Astro pages require compiler + bundler. Sätteri is lazy Markdown
// tooling: its controlled replacement is checked if loaded, never forced to run.
for (const load of loads.filter((load) => load.kind === "native")) {
  const module = load.path?.split("/").at(-1);
  if (!module || load.sha256 !== receipt.files[`bin/${module}`])
    throw new Error(`Unexpected native execution: ${JSON.stringify(load)}`);
}
for (const module of ["astro.node", "rolldown.node"]) {
  const expected = receipt.files[`bin/${module}`];
  if (
    !expected ||
    !loads.some(
      (load) =>
        load.kind === "native" &&
        load.path === resolve(project, ".tmp/pagefind/bin", module) &&
        load.sha256 === expected,
    )
  )
    throw new Error(
      `Controlled ${module} execution evidence missing or changed`,
    );
}
for (const language of languages) {
  const result = spawnSync(
    resolve(project, ".tmp/pagefind/bin/pagefind"),
    [
      "--site",
      output,
      "--glob",
      `docs/${language}/**/*.html`,
      "--output-path",
      `${output}/pagefind/${language}`,
      "--force-language",
      language,
    ],
    {
      stdio: "inherit",
      // Ambient PAGEFIND_* variables cannot activate another surface/configuration.
      env: Object.fromEntries(
        Object.entries(buildEnvironment).filter(
          ([key]) => !key.startsWith("PAGEFIND_"),
        ),
      ),
    },
  );
  if (result.status !== 0) process.exit(result.status ?? 1);
}

// The controlled source-delivery tool owns the actual archives/notices and
// provides standalone fallback landings. This host supplies its own static
// Astro landings, with the same public downloads in the common site shell.
const landingPaths = [
  "third-party/pagefind/index.html",
  ...languages.map((language) => `third-party/pagefind/${language}/index.html`),
];
const sourceLandings = await Promise.all(
  landingPaths.map(async (path) => ({
    path,
    html: await readFile(resolve(output, path)),
  })),
);
const sourceDelivery = spawnSync(
  process.execPath,
  [resolve(project, "scripts/pagefind-delivery.ts"), resolve(output)],
  { stdio: "inherit" },
);
if (sourceDelivery.status !== 0)
  throw new Error("Browser source/notice delivery failed");
for (const { path, html } of sourceLandings)
  await writeFile(resolve(output, path), html);
// Retain the complete grants for the compiled static recipes and local fonts.
// React renders the illustrative product markup only during this build; its
// grant is also retained here, without shipping React to the browser.
const uiRequire = createRequire(resolve(project, "packages/ui/package.json"));
const noticeInputs = [
  ["Source Taster UI provenance", resolve(project, "packages/ui/NOTICE.md")],
  [
    "Adobe starter — Apache-2.0",
    resolve(project, "packages/ui/notices/react-spectrum-LICENSE"),
  ],
  [
    "Lucide / Feather — ISC and MIT",
    resolve(project, "packages/ui/notices/lucide-LICENSE"),
  ],
  ...["tailwindcss", "tailwind-variants", "react", "react-dom"].map((name) => [
    name,
    resolve(uiRequire.resolve(`${name}/package.json`), "../LICENSE"),
  ]),
  [
    "Atkinson Hyperlegible Next — OFL-1.1",
    resolve("public/fonts/atkinsonhyperlegiblenext-OFL.txt"),
  ],
  ["IBM Plex Mono — OFL-1.1", resolve("public/fonts/ibmplexmono-OFL.txt")],
];
const notices = await Promise.all(
  noticeInputs.map(
    async ([name, path]) =>
      `${name}\n${"=".repeat(72)}\n${await readFile(path!, "utf8")}\n`,
  ),
);
await mkdir(resolve(output, "third-party/ui"), { recursive: true });
await writeFile(
  resolve(output, "third-party/ui/NOTICE.txt"),
  "Source Taster public interface — retained upstream notices.\nProject source: https://github.com/jeffnawroth/source-taster\nProject software: AGPL-3.0-or-later; upstream grants below retain their own scope.\nNo brand distribution or specialist legal clearance is asserted.\n\n" +
    notices.join("\n"),
);
const files: Record<string, string> = {};
async function inventory(dir: string) {
  for (const entry of await readdir(resolve(output, dir), {
    withFileTypes: true,
  })) {
    const path = dir ? `${dir}/${entry.name}` : entry.name;
    if (entry.isDirectory()) await inventory(path);
    else files[path] = digest(await readFile(resolve(output, path)));
  }
}
await inventory("");
await writeFile(
  `${output}/website-artifact.json`,
  JSON.stringify(
    {
      mode: preview ? "preview" : "publication",
      controlledBuild: {
        receiptSha256: digest(
          await readFile(resolve(project, ".tmp/pagefind/receipt.json")),
        ),
        nativeTraceSha256: digest(
          await readFile(buildEnvironment.SOURCE_TASTER_NATIVE_TRACE),
        ),
        indexer: {
          sha256: receipt.files["bin/pagefind"],
          languages,
          features: [],
        },
      },
      contentSha256: review?.contentSha256,
      files,
    },
    null,
    2,
  ),
);
