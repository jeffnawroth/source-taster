// SPDX-License-Identifier: AGPL-3.0-or-later
// #94 release eligibility. A build is releasable only if the code itself
// reports calibrated Scoring rules, the working tree is clean, and a
// measurement log for exactly this code version and fixture state passes the
// Quality gate. Targets are recomputed from the logged outcomes against the
// private Reference test set; what a log says about itself is never trusted.
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { z } from "zod";
import { loadDataset } from "./dataset.ts";
import {
  checkComposition,
  decideRelease,
  evaluatePath,
  type RecordOutcome,
} from "./targets.ts";

const LoggedRun = z.object({
  path: z.enum(["parser", "ai"]),
  run: z.number().int(),
  valid: z.boolean(),
  invalidRecords: z.array(z.string()),
  replayMisses: z.number().int().nonnegative(),
  outcomes: z.record(z.string(), z.unknown()),
});
const MeasurementLog = z.object({
  configuration: z.object({
    testSetVersion: z.string(),
    fixtureState: z.string(),
    codeVersion: z.object({ sha: z.string() }),
    aiModel: z.string().nullable(),
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
  code: { sha: string; dirty: boolean };
  /** The calibration the code's Scoring rules report. */
  runtimeCalibration: string;
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
  const codeReasons = [
    ...(input.runtimeCalibration === "uncalibrated" ? ["uncalibrated"] : []),
    ...(input.code.dirty ? ["code-version-dirty"] : []),
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
    const parsed = MeasurementLog.safeParse(
      JSON.parse(await readFile(join(directory, file), "utf8")),
    );
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
      log.configuration.fixtureState !== dataset.fixtureState
    )
      continue;
    const runs = log.runs.map((run) => {
      const outcomes = new Map(
        Object.entries(run.outcomes) as [string, RecordOutcome][],
      );
      return {
        path: run.path,
        run: run.run,
        valid: run.valid,
        invalidRecords: run.invalidRecords,
        replayMisses: run.replayMisses,
        targets: evaluatePath(dataset.records, outcomes, run.path).targets,
      };
    });
    const decision = decideRelease({
      configuration: {
        aiModel: log.configuration.aiModel,
        calibration: log.configuration.calibration,
        runtimeCalibration: input.runtimeCalibration,
        codeVersion: input.code,
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
