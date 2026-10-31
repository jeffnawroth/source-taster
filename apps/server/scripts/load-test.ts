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
import { exitCodeFor, type DurationBasis } from "./load/analysis.ts";
import { runLoad } from "./load/run.ts";
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
        "duration-basis": { type: "string", default: "slot-eligible" },
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
    throw new UsageError("--duration-basis is slot-eligible or check-start.");
  let patch: object | undefined;
  if (values.settings) {
    try {
      patch = JSON.parse(values.settings) as object;
    } catch {
      throw new UsageError("--settings must be a JSON object.");
    }
  }

  const recordingPath =
    values.recording ?? process.env.SOURCE_TASTER_LOAD_RECORDING;
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
    // Unset keeps the service's own development default (500 ms), disclosed in the report.
    placeholderDelayMs:
      values["placeholder-delay-ms"] === undefined
        ? 500
        : integer("placeholder-delay-ms", values["placeholder-delay-ms"], 0),
    workers: integer("workers", values.workers, 1),
    durationBasis: basis,
    maxRunMs: integer("max-run-seconds", values["max-run-seconds"], 1) * 1000,
    reportPath: values.report,
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
  if (values.report) console.log(`report: ${values.report}`);
  process.exitCode = exitCodeFor(report);
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
