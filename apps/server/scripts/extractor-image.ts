// SPDX-License-Identifier: AGPL-3.0-or-later
// Build a content-addressed local extraction image. Only this bounded build
// context enters Docker: never a repository checkout, environment or secret.
import { build } from "rolldown";
import {
  cp,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const context = await mkdtemp(join(tmpdir(), "source-taster-extractor-build-"));
try {
  await build({
    input: fileURLToPath(
      new URL("../src/documents/extractor-main.ts", import.meta.url),
    ),
    platform: "node",
    external: ["pdfjs-dist/legacy/build/pdf.mjs"],
    output: {
      file: join(context, "extractor.mjs"),
      format: "esm",
      paths: { "pdfjs-dist/legacy/build/pdf.mjs": "./pdf.mjs" },
    },
  });
  const pdfRoot = new URL("../node_modules/pdfjs-dist/", import.meta.url);
  for (const name of ["pdf.mjs", "pdf.worker.mjs"])
    await cp(new URL(`legacy/build/${name}`, pdfRoot), join(context, name));
  const notices = join(context, "notices");
  await mkdir(notices);
  const seen = new Set<string>();
  async function retainNotices(name: string, parent: string) {
    const require = createRequire(parent);
    const path = require.resolve(`${name}/package.json`);
    if (seen.has(path)) return;
    seen.add(path);
    const pkg = JSON.parse(await readFile(path, "utf8")) as {
      name: string;
      version: string;
      dependencies?: Record<string, string>;
    };
    const directory = join(
      notices,
      `${pkg.name.replaceAll("/", "-")}-${pkg.version}`,
    );
    await mkdir(directory);
    await cp(path, join(directory, "package.json"));
    for (const file of await readdir(dirname(path)))
      if (/^(?:licen[cs]e|notice|copying)/i.test(file))
        await cp(join(dirname(path), file), join(directory, file), {
          recursive: true,
        });
    for (const dependency of Object.keys(pkg.dependencies ?? {}))
      await retainNotices(dependency, path);
  }
  for (const name of ["pdfjs-dist", "jszip", "saxes"])
    await retainNotices(
      name,
      fileURLToPath(new URL("../package.json", import.meta.url)),
    );
  await cp(
    new URL("../../../LICENSE", import.meta.url),
    join(notices, "Source-Taster-AGPL"),
  );
  await writeFile(
    join(context, "Dockerfile"),
    await readFile(new URL("../extractor.Dockerfile", import.meta.url)),
  );
  const result = spawnSync("docker", ["build", "--quiet", context], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "inherit"],
  });
  if (result.status !== 0) throw new Error("Extraction image build failed");
  const image = result.stdout.trim();
  if (!/^sha256:[a-f0-9]{64}$/.test(image))
    throw new Error("No exact image identity returned");
  console.log(image);
} finally {
  await rm(context, { recursive: true, force: true });
}
