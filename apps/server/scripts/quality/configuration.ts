// SPDX-License-Identifier: AGPL-3.0-or-later
// #94 operator inputs for the Quality gate CLI. A Measured configuration gets
// its comparison parameters only from an ADR-0025 calibration record that
// selected a grid point for the same AI model, sources and search settings;
// the record is named by the digest of its exact bytes in the measurement log.
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { isDeepStrictEqual } from "node:util";
import { pathToFileURL } from "node:url";
import { z } from "zod";
import { AiConfiguration } from "./extraction.ts";
import {
  optionalSources,
  type ExtractionPort,
  type GateConfiguration,
} from "./runner.ts";

const ConfigurationFile = z.strictObject({
  enabledSources: z.array(z.enum(optionalSources)),
  searchSettings: z.record(z.string(), z.unknown()).optional(),
  /** Path to the calibration record, relative to the configuration file. */
  calibrationRecord: z.string().min(1).optional(),
});
const CalibrationRecord = z.object({
  format: z.literal("source-taster-calibration/1"),
  aiModel: z.string().nullable(),
  aiConfiguration: z.unknown().optional(),
  enabledSources: z.array(z.string()),
  searchSettings: z.record(z.string(), z.unknown()).nullable(),
  selected: z
    .object({ parameters: z.record(z.string(), z.number()) })
    .nullable(),
});

async function parse<T>(file: string, schema: z.ZodType<T>, name: string) {
  const bytes = await readFile(file);
  let value: unknown;
  try {
    value = JSON.parse(bytes.toString("utf8"));
  } catch (error) {
    throw new Error(`${name} is invalid: ${(error as Error).message}`, {
      cause: error,
    });
  }
  const parsed = schema.safeParse(value);
  if (!parsed.success)
    throw new Error(`${name} is invalid: ${parsed.error.message}`);
  return { value: parsed.data, bytes };
}

/**
 * The reviewed Measured configuration file as the load replay needs it
 * (#117): active optional Data sources and the search-settings patch, plus the
 * digest of the file's exact bytes. Calibration and AI identity do not affect
 * the replay, so neither is resolved here.
 */
export async function readConfigurationFile(file: string) {
  const { value, bytes } = await parse(
    file,
    ConfigurationFile,
    "configuration.json",
  );
  return {
    enabledSources: value.enabledSources as string[],
    searchSettings: value.searchSettings ?? null,
    digest: `sha256:${createHash("sha256").update(bytes).digest("hex")}`,
  };
}

export async function resolveConfiguration(
  file: string,
  aiModel: string | null,
  aiConfiguration: AiConfiguration | null = null,
): Promise<GateConfiguration> {
  const { value } = await parse(file, ConfigurationFile, "configuration.json");
  const configuration: GateConfiguration = {
    enabledSources: value.enabledSources,
  };
  if (value.searchSettings) configuration.searchSettings = value.searchSettings;
  if (!value.calibrationRecord) return configuration;
  const { value: record, bytes } = await parse(
    resolve(dirname(file), value.calibrationRecord),
    CalibrationRecord,
    value.calibrationRecord,
  );
  if (!record.selected)
    throw new Error(
      `${value.calibrationRecord} selected no grid point; the configuration stays uncalibrated (ADR-0025).`,
    );
  const expected = {
    aiModel,
    aiConfiguration,
    enabledSources: [...value.enabledSources].sort(),
    searchSettings: value.searchSettings ?? null,
  };
  for (const [key, wanted] of Object.entries(expected)) {
    const actual = record[key as keyof typeof expected] ?? null;
    if (!isDeepStrictEqual(actual, wanted))
      throw new Error(
        `${value.calibrationRecord} was calibrated for ${key} ${JSON.stringify(actual)}, not ${JSON.stringify(wanted)}.`,
      );
  }
  return {
    ...configuration,
    comparisonParameters: record.selected.parameters,
    calibration: {
      record: `sha256:${createHash("sha256").update(bytes).digest("hex")}`,
      selected: record.selected.parameters,
    },
  };
}

/** Imports an operator-provided AI extraction adapter (the ExtractionPort). */
export async function loadExtraction(module: string): Promise<ExtractionPort> {
  const port = (
    (await import(pathToFileURL(resolve(module)).href)) as { default?: unknown }
  ).default as Partial<ExtractionPort> | undefined;
  if (
    !port ||
    typeof port.model !== "string" ||
    port.model === "" ||
    typeof port.extract !== "function"
  )
    throw new Error(
      `${module}: the default export must be an extraction port ({ model, extract(input) }).`,
    );
  if (port.configuration !== undefined) {
    const parsed = AiConfiguration.safeParse(port.configuration);
    if (!parsed.success || parsed.data.modelId !== port.model)
      throw new Error(
        `${module}: AI configuration is invalid; supply the exact ADR-0010 identity and EU-only, zero-retention qualification declaration.`,
      );
  }
  return port as ExtractionPort;
}
