// SPDX-License-Identifier: AGPL-3.0-or-later
// #94 release eligibility. A build is releasable only if the code itself
// reports calibrated Scoring rules, the working tree is clean, and a
// measurement log for exactly this code version and fixture state passes the
// Quality gate. Targets are recomputed from the logged outcomes against the
// private Reference test set; what a log says about itself is never trusted.
import {
  sourceQualification,
  providerQualification,
} from "./source-qualification.ts";
import { measuredConfigurationId } from "./configuration.ts";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { z } from "zod";
import { isDeepStrictEqual } from "node:util";
import { loadDataset } from "./dataset.ts";
import { measureStructuring } from "./structuring.ts";
import { checkLoadReplay } from "../load/release.ts";
import { qualifiedAi, type AiConfiguration } from "./extraction.ts";
import type { GateConfiguration } from "./configuration-types.ts";
import {
  checkComposition,
  decideRelease,
  evaluatePath,
  invalidOutcome,
  type RecordOutcome,
} from "./targets.ts";

const Outcome = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("verdict"),
    verdict: z.enum([
      "correct",
      "exists-with-deviations",
      "mixed-citation",
      "doi-conflict",
      "not-found",
      "not-verifiable",
    ]),
    identifiers: z.array(z.string()),
    failedSources: z.array(z.string()),
    reasons: z.array(z.string()),
  }),
  z.object({ kind: z.literal("status"), status: z.string() }),
  z.object({
    kind: z.literal("unstructured"),
    references: z.number().int().nonnegative(),
  }),
]);
const LoggedRun = z.object({
  path: z.enum(["parser", "ai"]),
  run: z.number().int(),
  valid: z.boolean(),
  invalidRecords: z.array(z.string()),
  replayMisses: z.number().int().nonnegative(),
  outcomes: z.record(z.string(), Outcome),
  structuredFields: z.record(z.string(), z.array(z.unknown())).default({}),
});
const MeasurementLog = z.object({
  configuration: z.object({
    testSetVersion: z.string(),
    fixtureState: z.string(),
    datasetState: z.string(),
    codeVersion: z.object({ sha: z.string(), dirty: z.boolean() }),
    extractionCodeDigest: z.string().nullable().optional(),
    aiModel: z.string().nullable(),
    aiConfiguration: z.unknown().optional(),
    enabledSources: z.array(z.string()),
    comparisonParameters: z.record(z.string(), z.number()),
    searchSettings: z.record(z.string(), z.unknown()).nullable(),
    calibration: z
      .object({
        record: z.string(),
        selected: z.record(z.string(), z.number()),
      })
      .nullable(),
  }),
  runs: z.array(LoggedRun),
});

export interface ReleaseInput {
  /** Private measurement location; undefined when not configured. */
  root: string | undefined;
  configurationDigest?: string;
  now?: number;
  code: { sha: string; dirty: boolean };
  /** The calibration the code's Scoring rules report. */
  runtimeCalibration: string;
  /**
   * Private fifty-Check replay report (#117, ADR-0007: replay on every
   * release); undefined when not configured, which refuses the release. The
   * key is required so no caller can skip the replay by omission.
   */
  loadReport: string | undefined;
  /** The frozen configuration being released/activated, never inferred from a log. */
  expected?: {
    configuration: GateConfiguration;
    extractionCodeDigest?: string;
    aiModel: string | null;
    aiConfiguration: AiConfiguration | null;
  };
}
export interface ReleaseResult {
  releasable: boolean;
  reasons: string[];
  /** Per matching measurement log, its recomputed decision. */
  measurements?: { log: string; releasable: boolean; reasons: string[] }[];
}

export async function checkRelease(
  input: ReleaseInput,
): Promise<ReleaseResult> {
  // The replay must measure exactly the configuration the Quality gate does.
  const replay = await checkLoadReplay({
    path: input.loadReport,
    code: input.code,
    expected: input.expected && {
      configurationDigest: input.configurationDigest,
      enabledSources: input.expected.configuration.enabledSources,
      searchSettings: input.expected.configuration.searchSettings ?? null,
    },
  });
  const configurationId =
    input.expected && input.configurationDigest
      ? measuredConfigurationId(
          input.code,
          input.configurationDigest,
          input.expected.configuration,
          input.expected.aiModel,
          input.expected.aiConfiguration,
          input.expected.extractionCodeDigest ?? null,
        )
      : undefined;
  const codeReasons = [
    ...(await providerQualification({
      root: input.root,
      configurationDigest: input.configurationDigest,
      configurationId,
      aiModel: input.expected?.aiModel ?? null,
      aiConfiguration: input.expected?.aiConfiguration,
      codeVersion: input.code.sha,
      now: input.now,
    })),
    ...(await sourceQualification({
      root: input.root,
      configurationId,
      comparisonParameters: input.expected?.configuration.comparisonParameters,
      sources: input.expected?.configuration.enabledSources ?? [],
      codeVersion: input.code.sha,
      configurationDigest: input.configurationDigest,
      now: input.now,
    })),
    ...replay.reasons,
    ...(input.runtimeCalibration === "uncalibrated" ? ["uncalibrated"] : []),
    ...(input.code.dirty ? ["code-version-dirty"] : []),
    ...(!input.expected ? ["no-measured-configuration"] : []),
  ];
  const refuse = (
    reasons: string[],
    measurements?: ReleaseResult["measurements"],
  ) => ({
    releasable: false,
    reasons: [...new Set([...codeReasons, ...reasons])],
    ...(measurements ? { measurements } : {}),
  });
  if (!input.root) return refuse(["no-measurement-location"]);
  let dataset;
  try {
    dataset = await loadDataset(input.root, "reference-test-set");
  } catch (error) {
    return refuse([
      `reference-test-set-unavailable: ${(error as Error).message}`,
    ]);
  }
  const directory = join(input.root, "measurement-logs", dataset.version);
  const files = (await readdir(directory).catch(() => [] as string[]))
    .filter((f) => f.endsWith(".json"))
    .sort();
  const measurements: NonNullable<ReleaseResult["measurements"]> = [];
  for (const file of files) {
    let value: unknown;
    try {
      value = JSON.parse(await readFile(join(directory, file), "utf8"));
    } catch {
      measurements.push({
        log: file,
        releasable: false,
        reasons: ["invalid-log"],
      });
      continue;
    }
    const parsed = MeasurementLog.safeParse(value);
    if (!parsed.success) {
      measurements.push({
        log: file,
        releasable: false,
        reasons: ["invalid-log"],
      });
      continue;
    }
    const log = parsed.data;
    // Only a measurement of this exact code version and fixture state counts.
    if (
      log.configuration.codeVersion.sha !== input.code.sha ||
      log.configuration.testSetVersion !== dataset.version ||
      log.configuration.fixtureState !== dataset.fixtureState ||
      log.configuration.datasetState !== dataset.datasetState
    )
      continue;
    if (!input.expected) continue;
    const wanted = input.expected;
    if (
      !isDeepStrictEqual(
        {
          enabledSources: [...log.configuration.enabledSources].sort(),
          comparisonParameters: log.configuration.comparisonParameters,
          searchSettings: log.configuration.searchSettings,
          calibration: log.configuration.calibration,
          extractionCodeDigest: log.configuration.extractionCodeDigest ?? null,
          aiModel: log.configuration.aiModel,
          aiConfiguration: log.configuration.aiConfiguration ?? null,
        },
        {
          enabledSources: [...wanted.configuration.enabledSources].sort(),
          comparisonParameters: wanted.configuration.comparisonParameters ?? {},
          searchSettings: wanted.configuration.searchSettings ?? null,
          calibration: wanted.configuration.calibration ?? null,
          extractionCodeDigest: wanted.extractionCodeDigest ?? null,
          aiModel: wanted.aiModel,
          aiConfiguration: wanted.aiConfiguration,
        },
      )
    )
      continue;
    const runs = log.runs.map((run) => {
      const outcomes = new Map(
        Object.entries(run.outcomes) as [string, RecordOutcome][],
      );
      return {
        path: run.path,
        run: run.run,
        valid:
          run.valid &&
          dataset.records.every((r) => !invalidOutcome(outcomes.get(r.id))),
        invalidRecords: dataset.records
          .filter((r) => invalidOutcome(outcomes.get(r.id)))
          .map((r) => r.id),
        replayMisses: run.replayMisses,
        targets: evaluatePath(dataset.records, outcomes, run.path).targets,
        structuring: measureStructuring(dataset.records, run.structuredFields),
      };
    });
    const decision = decideRelease({
      configuration: {
        aiModel: log.configuration.aiModel,
        aiQualified: qualifiedAi(
          log.configuration.aiModel,
          log.configuration.aiConfiguration,
        ),
        calibration: log.configuration.calibration,
        runtimeCalibration: input.runtimeCalibration,
        codeVersion: {
          ...input.code,
          dirty: input.code.dirty || log.configuration.codeVersion.dirty,
        },
      },
      composition: checkComposition(dataset.records),
      runs,
    });
    measurements.push({ log: file, ...decision });
  }
  if (measurements.some((m) => m.releasable) && codeReasons.length === 0)
    return { releasable: true, reasons: [], measurements };
  if (!measurements.length) return refuse(["no-measurement-log"]);
  return refuse(
    measurements.flatMap((m) => m.reasons),
    measurements,
  );
}
