// SPDX-License-Identifier: AGPL-3.0-or-later
// Performance and load harness for the launch targets (#117, FA-UEB-40–43).
//
//   DATABASE_ADMIN_URL=postgres://… node scripts/load-test.ts [options]
//
// Starts real web and worker processes against an owned PostgreSQL database,
// replays Data source answers and latencies at the adapters' HTTP edge, runs
// Checks concurrently and writes a machine-readable report. Exit codes:
//   0 all launch targets measured and met      1 a target missed / invalid evidence
//   3 reduced scope, nothing missed             78 configuration error
import { parseArgs } from "node:util";
import {
  exitCodeFor,
  SHIPPED_PLACEHOLDER_DELAY_MS,
  type DurationBasis,
} from "../src/load/analysis.ts";
import { HARNESS_SOURCES, runLoad } from "./load/run.ts";
import { parseSearchSettings } from "../src/config.ts";
import { readConfigurationFile } from "./quality/configuration.ts";
import {
  loadRecording,
  recordedPolicy,
  syntheticPolicy,
  syntheticWorkload,
  type WorkloadReference,
} from "./load/replay.ts";

class UsageError extends Error {}

const { values } = (() => {
  try {
    return parseArgs({
      options: {
        checks: { type: "string", default: "50" },
        references: { type: "string", default: "100" },
        "not-findable-share": { type: "string", default: "0.2" },
        workers: { type: "string", default: "1" },
        "placeholder-delay-ms": { type: "string" },
        settings: { type: "string" },
        configuration: { type: "string" },
        "duration-basis": { type: "string", default: "check-start" },
        report: { type: "string" },
        "max-run-seconds": { type: "string", default: "900" },
        recording: { type: "string" },
        "synthetic-findable-ms": { type: "string", default: "150" },
        "synthetic-not-findable-ms": { type: "string", default: "300" },
        "api-port": { type: "string", default: "4501" },
        "replay-port": { type: "string", default: "4502" },
        release: { type: "boolean", default: false },
      },
    });
  } catch (error) {
    console.error(`load-test: ${(error as Error).message}`);
    process.exit(78);
  }
})();

function integer(name: string, raw: string, minimum: number) {
  const value = Number(raw);
  if (!Number.isInteger(value) || value < minimum)
    throw new UsageError(
      `--${name} must be an integer of at least ${minimum}.`,
    );
  return value;
}

async function main() {
  const adminUrl = process.env.DATABASE_ADMIN_URL;
  if (!adminUrl)
    throw new UsageError(
      "DATABASE_ADMIN_URL is required; the harness provisions and drops its own database and role.",
    );
  const checks = integer("checks", values.checks, 1);
  const references = integer("references", values.references, 1);
  const share = Number(values["not-findable-share"]);
  if (!(share >= 0 && share < 1))
    throw new UsageError("--not-findable-share must be in [0, 1).");
  const basis = values["duration-basis"] as DurationBasis;
  if (basis !== "slot-eligible" && basis !== "check-start")
    throw new UsageError(
      "--duration-basis is check-start (default, literal) or slot-eligible (diagnostic).",
    );
  let patch: object | undefined;
  if (values.settings) {
    try {
      patch = JSON.parse(values.settings) as object;
    } catch {
      throw new UsageError("--settings must be a JSON object.");
    }
  }

  // The reviewed production configuration (the #94 Measured configuration file)
  // supplies the optional Data sources and the search-settings patch. This is
  // how the replay is bound to the configuration the release guard compares
  // (ADR-0007: Operator budgets are part of the measured configuration).
  // Release runs default to the file release-check receives, so the Quality
  // gate and the replay cannot silently be pointed at different configurations.
  const configurationPath =
    values.configuration ??
    (values.release
      ? process.env.SOURCE_TASTER_QUALITY_CONFIGURATION || undefined
      : undefined);
  let reviewed: { digest: string } | undefined;
  if (configurationPath) {
    if (patch)
      throw new UsageError(
        "--configuration supplies the search settings; remove --settings.",
      );
    let file;
    try {
      file = await readConfigurationFile(configurationPath);
      patch = file.searchSettings ?? undefined;
      parseSearchSettings(JSON.stringify(patch ?? {}));
    } catch (error) {
      throw new UsageError(
        `--configuration is invalid: ${(error as Error).message}`,
      );
    }
    const replayed = new Set<string>(HARNESS_SOURCES);
    const unreplayed = file.enabledSources.filter((s) => !replayed.has(s));
    const missing = HARNESS_SOURCES.filter(
      (s) => !file.enabledSources.includes(s),
    );
    if (unreplayed.length || missing.length)
      throw new UsageError(
        `The replay harness enables and replays exactly ${HARNESS_SOURCES.join(", ")}; the configuration ${unreplayed.length ? `enables ${unreplayed.join(", ")}` : `lacks ${missing.join(", ")}`}. It cannot be load-qualified until the harness replays that source set.`,
      );
    reviewed = { digest: file.digest };
  }

  const recordingPath =
    values.recording ?? process.env.SOURCE_TASTER_LOAD_RECORDING;
  // The release flow writes the report where the release guard reads it.
  const reportPath =
    values.report ??
    (values.release ? process.env.SOURCE_TASTER_LOAD_REPORT : undefined);
  if (values.release) {
    const eased = [
      basis !== "check-start" && "--duration-basis",
      values.settings && "--settings",
      values["placeholder-delay-ms"] !== undefined &&
        Number(values["placeholder-delay-ms"]) < SHIPPED_PLACEHOLDER_DELAY_MS &&
        "--placeholder-delay-ms",
    ].filter(Boolean);
    if (eased.length)
      throw new UsageError(
        `--release measures the reviewed configuration on the literal Check-start clock; remove ${eased.join(", ")}.`,
      );
    const missing = [
      !recordingPath &&
        "authorized recordings (--recording or SOURCE_TASTER_LOAD_RECORDING; synthetic latency witnesses are no qualification)",
      !configurationPath &&
        "--configuration <file> or SOURCE_TASTER_QUALITY_CONFIGURATION (the reviewed production configuration that the release guard compares)",
      !reportPath &&
        "--report <file> or SOURCE_TASTER_LOAD_REPORT (where the release guard reads the result)",
    ].filter(Boolean);
    if (missing.length)
      throw new UsageError(`--release needs ${missing.join("; ")}.`);
  }
  let workload: WorkloadReference[][];
  let replay: Parameters<typeof runLoad>[0]["replay"];
  if (recordingPath) {
    const { recording, digest } = await loadRecording(recordingPath);
    if (!recording.workload.length)
      throw new UsageError("The recording contains no workload.");
    workload = Array.from({ length: checks }, (_, c) =>
      Array.from({ length: references }, (_, r) => {
        const entry =
          recording.workload[(c * 7 + r) % recording.workload.length]!;
        return { ...entry, id: `${entry.id}#${c}.${r}` };
      }),
    );
    replay = {
      policy: recordedPolicy(recording),
      provenance: "recorded",
      recordingDigest: digest,
      authorization: recording.authorization,
    };
  } else {
    if (values.release)
      throw new UsageError(
        "--release needs authorized recordings (--recording or SOURCE_TASTER_LOAD_RECORDING); synthetic latency witnesses are no qualification.",
      );
    workload = syntheticWorkload({
      checks,
      referencesPerCheck: references,
      notFindableShare: share,
    });
    replay = {
      policy: syntheticPolicy({
        findableLatencyMs: integer(
          "synthetic-findable-ms",
          values["synthetic-findable-ms"],
          0,
        ),
        notFindableLatencyMs: integer(
          "synthetic-not-findable-ms",
          values["synthetic-not-findable-ms"],
          0,
        ),
      }),
      provenance: "synthetic-witness",
    };
  }

  const report = await runLoad({
    workload,
    replay,
    adminUrl,
    apiPort: integer("api-port", values["api-port"], 1),
    replayPort: integer("replay-port", values["replay-port"], 1),
    searchSettingsPatch: patch,
    reviewedConfiguration: reviewed,
    // Unset keeps the service's own development default (500 ms), disclosed in the report.
    placeholderDelayMs:
      values["placeholder-delay-ms"] === undefined
        ? SHIPPED_PLACEHOLDER_DELAY_MS
        : integer("placeholder-delay-ms", values["placeholder-delay-ms"], 0),
    workers: integer("workers", values.workers, 1),
    durationBasis: basis,
    maxRunMs: integer("max-run-seconds", values["max-run-seconds"], 1) * 1000,
    reportPath,
    log: (line) => console.error(`load-test: ${line}`),
  });

  console.log(
    `${report.outcome.toUpperCase()}  qualifying=${report.qualifying}  provenance=${report.evidence.provenance}  basis=${report.durationBasis}`,
  );
  for (const t of report.targets)
    console.log(
      `  ${t.status.padEnd(16)} ${t.id.padEnd(24)} measured=${t.measured === null ? "-" : Math.round(t.measured)} ${t.comparison === "at-most" ? "<=" : ">="} ${t.limit} ${t.unit}  (n=${t.samples})`,
    );
  console.log(`  outcomes: ${JSON.stringify(report.diagnostics.outcomes)}`);
  console.log(
    `  unavailable reasons: ${JSON.stringify(report.diagnostics.unavailableReasons)}  requests: ${JSON.stringify(report.evidence.requests)}`,
  );
  for (const e of report.invalidEvidence)
    console.log(`  invalid evidence: ${e.code} x${e.count}`);
  for (const line of report.limitations) console.log(`  limitation: ${line}`);
  if (reportPath) console.log(`report: ${reportPath}`);
  // A release run offers qualification evidence: a pass that cannot qualify is not one.
  process.exitCode =
    values.release && report.outcome === "passed" && !report.qualifying
      ? 1
      : exitCodeFor(report);
}

main().catch((error: unknown) => {
  if (error instanceof UsageError) {
    console.error(`load-test: ${error.message}`);
    process.exitCode = 78;
  } else {
    console.error(error);
    process.exitCode = 70;
  }
});
