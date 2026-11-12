// SPDX-License-Identifier: AGPL-3.0-or-later
// Manual entry point: `pnpm --filter @source-taster/release-imagery imagery:capture`.
//   --out <dir>   dry run into a directory outside version control
//   --final       write the committed set; refused unless the gate is open
// Neither mode uploads, publishes or registers anything.
import { execFileSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { captureAll } from "./capture.ts";
import { composeAll } from "./compose.ts";
import { buildManifest } from "../src/manifest.ts";
import { manifestProblems, validateImages } from "../src/validate.ts";
import { finalCaptureGate } from "../src/gate.ts";
import { imageSpecs } from "../src/specs.ts";

const args = process.argv.slice(2);
const final = args.includes("--final");
const outIndex = args.indexOf("--out");
const out = resolve(
  final
    ? new URL("../exports", import.meta.url).pathname
    : (args[outIndex + 1] ?? new URL("../.dry-run", import.meta.url).pathname),
);

const git = (...a: string[]) =>
  execFileSync("git", a, { encoding: "utf8" }).trim();
const gate = await finalCaptureGate((commit) => {
  try {
    git("merge-base", "--is-ancestor", commit, "HEAD");
    return Promise.resolve(true);
  } catch {
    return Promise.resolve(false);
  }
});
if (final && !gate.ok) {
  console.error(`Refusing final output: ${gate.reason}`);
  process.exit(1);
}
await mkdir(out, { recursive: true });
const port = Number(process.env.SOURCE_TASTER_E2E_API_PORT ?? "7192");
const captures = await captureAll(out, port);
await composeAll(out);
const hashes = new Map<string, string>();
for (const image of imageSpecs)
  hashes.set(
    image.file,
    createHash("sha256")
      .update(await readFile(resolve(out, image.file)))
      .digest("hex"),
  );
const manifest = buildManifest({
  status: final ? "final" : "dry-run",
  commit: git("rev-parse", "--short", "HEAD"),
  gate,
  captures,
  sha256: (file) => hashes.get(file) as string,
});
const problems = [
  ...manifestProblems(manifest),
  ...(await validateImages(out, manifest)),
];
await writeFile(
  resolve(out, "manifest.json"),
  `${JSON.stringify(manifest, null, 2)}\n`,
);
if (problems.length > 0) {
  console.error(problems.join("\n"));
  process.exit(1);
}
console.log(
  `Wrote ${manifest.images.length} images and manifest.json to ${out} (${manifest.status})`,
);
