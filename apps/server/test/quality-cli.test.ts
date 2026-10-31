// SPDX-License-Identifier: AGPL-3.0-or-later
// #94 operator entry: `pnpm quality:gate measure|calibrate`. A measured
// configuration takes its comparison parameters only from an ADR-0025
// calibration record that selected a point for the same sources, settings and
// AI model. Synthetic records and modules only; no service is started here.
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdtemp, realpath, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, expect, it } from "vitest";
import {
  loadExtraction,
  resolveConfiguration,
} from "../scripts/quality/configuration.ts";

let root: string;
beforeEach(async () => {
  root = await realpath(await mkdtemp(join(tmpdir(), "st-94-cli-")));
});
afterEach(async () => {
  await rm(root, { recursive: true, force: true });
});

const record = (overrides: Record<string, unknown> = {}) => ({
  format: "source-taster-calibration/1",
  developmentSetVersion: "synthetic-dev-1",
  aiModel: "synthetic-model",
  enabledSources: ["openalex"],
  searchSettings: null,
  selected: {
    index: 1,
    parameters: { overallScore: 90000000 },
    minimumMargin: { numerator: 1, denominator: 100 },
  },
  ...overrides,
});
async function files(
  calibration: unknown,
  configuration: Record<string, unknown> = {},
) {
  const recordText = JSON.stringify(calibration);
  await writeFile(join(root, "calibration.json"), recordText);
  await writeFile(
    join(root, "configuration.json"),
    JSON.stringify({
      enabledSources: ["openalex"],
      calibrationRecord: "calibration.json",
      ...configuration,
    }),
  );
  return join(root, "configuration.json");
}

it("measures the selected point of a calibration record and names that record by its digest", async () => {
  const configuration = await resolveConfiguration(
    await files(record()),
    "synthetic-model",
  );
  const bytes = JSON.stringify(record());
  expect(configuration).toEqual({
    enabledSources: ["openalex"],
    comparisonParameters: { overallScore: 90000000 },
    calibration: {
      record: `sha256:${createHash("sha256").update(bytes).digest("hex")}`,
      selected: { overallScore: 90000000 },
    },
  });
});

it("measures without comparison parameters when no calibration record is named", async () => {
  await writeFile(
    join(root, "configuration.json"),
    JSON.stringify({ enabledSources: [] }),
  );
  await expect(
    resolveConfiguration(join(root, "configuration.json"), null),
  ).resolves.toEqual({
    enabledSources: [],
  });
});

it("refuses a record that selected nothing or was calibrated for another configuration", async () => {
  await expect(
    resolveConfiguration(
      await files(record({ selected: null })),
      "synthetic-model",
    ),
  ).rejects.toThrow(/selected no grid point/);
  await expect(
    resolveConfiguration(await files(record()), "another-model"),
  ).rejects.toThrow(
    /calibrated for aiModel "synthetic-model", not "another-model"/,
  );
  await expect(
    resolveConfiguration(
      await files(record(), { enabledSources: [] }),
      "synthetic-model",
    ),
  ).rejects.toThrow(/calibrated for enabledSources/);
  await expect(
    resolveConfiguration(
      await files(record(), { comparisonParameters: { lead: 1 } }),
      "synthetic-model",
    ),
  ).rejects.toThrow(/configuration\.json is invalid/);
});

it("loads an extraction module only when its default export is an extraction port", async () => {
  await writeFile(
    join(root, "port.mjs"),
    "export default { model: 'synthetic-model', extract: async () => [] };",
  );
  await writeFile(
    join(root, "broken.mjs"),
    "export default { extract: async () => [] };",
  );
  await expect(loadExtraction(join(root, "port.mjs"))).resolves.toMatchObject({
    model: "synthetic-model",
  });
  await expect(loadExtraction(join(root, "broken.mjs"))).rejects.toThrow(
    /default export must be an extraction port/,
  );
});

it("prints usage and exits 64 for an incomplete command line", () => {
  const server = fileURLToPath(new URL("..", import.meta.url));
  for (const args of [
    [],
    ["measure"],
    ["calibrate", "--root", root],
    ["publish"],
  ]) {
    const result = spawnSync(
      process.execPath,
      ["scripts/quality-gate.ts", ...args],
      {
        cwd: server,
        env: { PATH: process.env.PATH },
        encoding: "utf8",
      },
    );
    expect(result.status).toBe(64);
    expect(result.stderr).toMatch(/^Usage: pnpm quality:gate measure/m);
  }
});
