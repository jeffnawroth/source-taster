// SPDX-License-Identifier: AGPL-3.0-or-later
// #103 web-process activation. Loading an eligible adapter is not release
// qualification (ADR-0010); every refusal must leave AI extraction unavailable
// without dispatching a request or warming the provider. Synthetic adapter
// modules only; nothing here contacts or qualifies a provider.
import { mkdtemp, realpath, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { activeExtraction } from "../src/ai/activation.ts";

const keys = [
  "SOURCE_TASTER_AI_EXTRACTION",
  "SOURCE_TASTER_QUALITY_CONFIGURATION",
  "SOURCE_TASTER_QUALITY_EXTRACTION",
  "SOURCE_TASTER_QUALITY_ROOT",
  "SOURCE_TASTER_LOAD_REPORT",
] as const;
const saved = new Map<string, string | undefined>();
let root: string;
const warmups = "__st103Warmups";
const counter = globalThis as unknown as Record<string, number | undefined>;
beforeEach(async () => {
  for (const key of keys) {
    saved.set(key, process.env[key]);
    delete process.env[key];
  }
  root = await realpath(await mkdtemp(join(tmpdir(), "st-103-activation-")));
  counter[warmups] = 0;
});
afterEach(async () => {
  for (const key of keys) {
    const value = saved.get(key);
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  delete counter[warmups];
  vi.restoreAllMocks();
  await rm(root, { recursive: true, force: true });
});

const configuration = (mode: "live" | "synthetic") => ({
  mode,
  providerPath: "synthetic-adapter-edge",
  modelId: "synthetic-103",
  region: "eu-central-1",
  promptVersion: "p/1",
  schemaVersion: "s/1",
  sampling: { temperature: 0 },
  determinism: "synthetic declaration",
  chunkSize: 512,
  processingAndStorageCountries: ["DE"],
  zeroRetention: true,
  qualificationRecord: "synthetic-not-provider-evidence",
});
async function adapter(name: string, mode: "live" | "synthetic") {
  const file = join(root, name);
  await writeFile(
    file,
    `export default {
  model: "synthetic-103",
  configuration: ${JSON.stringify(configuration(mode))},
  extract: async () => [],
  extractSpans: async () => ({ references: [] }),
  warmup: async () => { globalThis.${warmups} = (globalThis.${warmups} ?? 0) + 1; },
};
`,
  );
  return file;
}

it("stays off when no AI adapter is configured", async () => {
  expect(await activeExtraction()).toBeUndefined();
});

it("never activates a synthetic-mode adapter", async () => {
  process.env.SOURCE_TASTER_AI_EXTRACTION = await adapter("a.mjs", "synthetic");
  expect(await activeExtraction()).toBeUndefined();
  expect(counter[warmups]).toBe(0);
});

it("refuses a live adapter without the measured configuration and warms nothing", async () => {
  process.env.SOURCE_TASTER_AI_EXTRACTION = await adapter("a.mjs", "live");
  expect(await activeExtraction()).toBeUndefined();
  expect(counter[warmups]).toBe(0);
});

it("refuses a live adapter whose release check fails (uncalibrated, unmeasured, no #117 load report) and warms nothing", async () => {
  const module = await adapter("a.mjs", "live");
  const configurationFile = join(root, "configuration.json");
  await writeFile(configurationFile, JSON.stringify({ enabledSources: [] }));
  process.env.SOURCE_TASTER_AI_EXTRACTION = module;
  process.env.SOURCE_TASTER_QUALITY_EXTRACTION = module;
  process.env.SOURCE_TASTER_QUALITY_CONFIGURATION = configurationFile;
  process.env.SOURCE_TASTER_QUALITY_ROOT = join(root, "measurements");
  expect(await activeExtraction()).toBeUndefined();
  expect(counter[warmups]).toBe(0);
});

it("reports a fixed content-free diagnostic when the adapter cannot be loaded", async () => {
  const error = vi.spyOn(console, "error").mockImplementation(() => {});
  process.env.SOURCE_TASTER_AI_EXTRACTION = join(
    root,
    "secret-path-missing.mjs",
  );
  expect(await activeExtraction()).toBeUndefined();
  expect(error).toHaveBeenCalledOnce();
  expect(error).toHaveBeenCalledWith(
    JSON.stringify({ code: "ai-configuration-unavailable" }),
  );
});
