// SPDX-License-Identifier: AGPL-3.0-or-later
import { spawnSync } from "node:child_process";
import { rm, writeFile, readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { checkPublication, digest } from "./publication.ts";
import "./content-check.ts";
const preview = process.argv.includes("--preview");
if (preview && process.env.NODE_ENV === "production")
  throw new Error("Draft preview is local-only");
if (!preview && !process.argv.includes("--publication"))
  throw new Error("Choose --preview or --publication explicitly");
const output = preview ? "dist-preview" : "dist";
// Remove old publish output on any failed/rejected publication attempt as well.
await rm(output, { recursive: true, force: true });
const review = preview ? null : await checkPublication();
for (const args of [
  ["exec", "astro", "build"],
  ...["de", "en"].map((language) => [
    "exec",
    "pagefind",
    "--site",
    output,
    "--glob",
    `docs/${language}/**/*.html`,
    "--output-path",
    `${output}/pagefind/${language}`,
    "--force-language",
    language,
  ]),
]) {
  const result = spawnSync("pnpm", args, {
    stdio: "inherit",
    env: {
      ...process.env,
      ASTRO_TELEMETRY_DISABLED: "1",
      DO_NOT_TRACK: "1",
      SOURCE_TASTER_WEBSITE_PREVIEW: preview ? "1" : "0",
      SOURCE_TASTER_WEBSITE_OUTPUT: `./${output}`,
    },
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
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
      contentSha256: review?.contentSha256,
      files,
    },
    null,
    2,
  ),
);
