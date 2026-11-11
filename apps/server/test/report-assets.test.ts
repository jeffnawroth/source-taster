// SPDX-License-Identifier: AGPL-3.0-or-later
// Packaged-asset seam: inspect what the production build actually distributes,
// then run its emitted worker using only the packaged assets.
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { expect, it } from "vitest";
import manifest from "../src/reports/fonts/manifest.json" with { type: "json" };
import { inspectPdf } from "./support/pdf-inspect.ts";
import type { generateReport as ProductionGenerateReport } from "../src/reports/generate.ts";
import { finalSample } from "./support/report-samples.ts";
it("ships every exact local font variant and full OFL notice and generates from packaged assets", async () => {
  execFileSync("pnpm", ["run", "build"], {
    cwd: new URL("..", import.meta.url),
    stdio: "pipe",
  });
  for (const [file, hash] of Object.entries(manifest)) {
    const bytes = await readFile(
      new URL(`../dist/reports/fonts/${file}`, import.meta.url),
    );
    expect(createHash("sha256").update(bytes).digest("hex"), file).toBe(hash);
  }
  // A runtime-computed URL prevents TS from including emitted code in rootDir.
  const { generateReport } = (await import(
    new URL("../dist/reports/generate.js", import.meta.url).href
  )) as { generateReport: typeof ProductionGenerateReport };
  const pdf = await generateReport({
    check: finalSample(),
    language: "de",
    style: "apa",
    capturedAt: "2026-11-05T08:00:00.000Z",
  });
  expect((await inspectPdf(pdf)).text).toContain("Prüfbericht");
  expect(Buffer.from(pdf).toString("latin1")).toContain(
    "AtkinsonHyperlegibleNext",
  );
}, 60_000);
