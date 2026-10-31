// SPDX-License-Identifier: AGPL-3.0-or-later
// #94 release refusal. The release check derives the code version and the
// Scoring rules calibration from the code, recomputes every target from the
// logged outcomes and the private Reference test set, and never trusts what a
// measurement log says about itself. Synthetic, generated population only.
import { spawnSync } from "node:child_process";
import {
  mkdir,
  mkdtemp,
  readFile,
  realpath,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, expect, it } from "vitest";
import { checkRelease } from "../scripts/quality/release.ts";
import type { GateRecord, RecordOutcome } from "../scripts/quality/targets.ts";
import {
  launchSizedRecords,
  syntheticAiConfiguration,
} from "./support/quality-records.ts";
import { passingReport } from "./support/load-reports.ts";

const sha = "a".repeat(40);
let root: string;
beforeEach(async () => {
  root = await realpath(await mkdtemp(join(tmpdir(), "st-94-release-")));
  // ADR-0007: every release needs a passing fifty-Check replay (#117) of the
  // same configuration; this one measures the all-sources-disabled test set.
  calibratedCode.loadReport = join(root, "load-report.json");
  await writeFile(
    calibratedCode.loadReport,
    JSON.stringify(passingReport({ enabledSources: [] })),
  );
});
afterEach(async () => {
  await rm(root, { recursive: true, force: true });
});

const records = launchSizedRecords();
function passingOutcome(r: GateRecord): RecordOutcome {
  const verdict =
    r.class === "real-correct"
      ? "correct"
      : r.class === "real-deviating"
        ? "exists-with-deviations"
        : "not-found";
  return {
    kind: "verdict",
    verdict,
    identifiers: verdict === "correct" ? [`doi:10.5555/${r.id}`] : [],
    failedSources: [],
    reasons: [],
  };
}
async function writeMeasured(
  options: {
    logSha?: string;
    outcomes?: (run: string, r: GateRecord) => RecordOutcome;
    fixtureState?: string;
    fields?: (run: string, r: GateRecord) => unknown[];
    aiConfiguration?: unknown;
    logDirty?: boolean;
  } = {},
) {
  const directory = join(root, "reference-test-set");
  await mkdir(directory, { recursive: true });
  await writeFile(
    join(directory, "manifest.json"),
    JSON.stringify({ kind: "reference-test-set", version: "synthetic-rts-1" }),
  );
  await writeFile(
    join(directory, "records.json"),
    JSON.stringify(
      records.map((r) => ({
        ...r,
        provenance: { reviewedBy: "synthetic", reviewedAt: "2026-10-31" },
      })),
    ),
  );
  await writeFile(
    join(directory, "fixtures.json"),
    JSON.stringify({ recordedAt: "2026-10-31", entries: [] }),
  );
  const { loadDataset } = await import("../scripts/quality/dataset.ts");
  const dataset = await loadDataset(root, "reference-test-set");
  const outcomes =
    options.outcomes ?? ((_: string, r: GateRecord) => passingOutcome(r));
  const runs = ["parser-1", "ai-1", "ai-2", "ai-3"].map((label) => {
    const [path, run] = label.split("-");
    return {
      path,
      run: Number(run),
      valid: true,
      invalidRecords: [],
      replayMisses: 0,
      // A log's own target claims are ignored: they say everything passed.
      targets: [{ target: "correctness", met: true, hits: 1, n: 1 }],
      outcomes: Object.fromEntries(
        records.map((r) => [r.id, outcomes(label, r)]),
      ),
      structuredFields: Object.fromEntries(
        records.map((r) => [
          r.id,
          options.fields ? options.fields(label, r) : [r.expectedFields],
        ]),
      ),
    };
  });
  await mkdir(join(root, "measurement-logs", "synthetic-rts-1"), {
    recursive: true,
  });
  await writeFile(
    join(
      root,
      "measurement-logs",
      "synthetic-rts-1",
      "synthetic-configuration.json",
    ),
    JSON.stringify({
      format: "source-taster-quality-gate/1",
      configurationId: "synthetic-configuration",
      configuration: {
        testSetVersion: "synthetic-rts-1",
        fixtureState: options.fixtureState ?? dataset.fixtureState,
        datasetState: dataset.datasetState,
        codeVersion: {
          sha: options.logSha ?? sha,
          dirty: options.logDirty ?? false,
        },
        aiModel: "synthetic-model",
        aiConfiguration:
          options.aiConfiguration === undefined
            ? syntheticAiConfiguration
            : options.aiConfiguration,
        enabledSources: [],
        comparisonParameters: { lead: 1 },
        searchSettings: null,
        calibration: { record: "synthetic-calibration", selected: { lead: 1 } },
        scoringRules: { calibration: "calibrated" },
      },
      runs,
      decision: { releasable: true, reasons: [] },
    }),
  );
}
const calibratedCode = {
  loadReport: undefined as string | undefined,
  code: { sha, dirty: false },
  runtimeCalibration: "synthetic-calibrated",
  expected: {
    configuration: {
      enabledSources: [] as [],
      comparisonParameters: { lead: 1 },
      calibration: { record: "synthetic-calibration", selected: { lead: 1 } },
    },
    aiModel: "synthetic-model",
    aiConfiguration: syntheticAiConfiguration,
  },
};

it("allows a release only for a clean, calibrated code version with an eligible measurement", async () => {
  await writeMeasured();
  await expect(
    checkRelease({ root, ...calibratedCode }),
  ).resolves.toMatchObject({
    releasable: true,
    reasons: [],
  });
});

it("refuses while the code reports uncalibrated Scoring rules, whatever the log claims", async () => {
  await writeMeasured();
  const result = await checkRelease({
    root,
    ...calibratedCode,
    runtimeCalibration: "uncalibrated",
  });
  expect(result.releasable).toBe(false);
  expect(result.reasons).toContain("uncalibrated");
});

it("refuses a dirty working tree even when the log records a clean one", async () => {
  await writeMeasured();
  const result = await checkRelease({
    root,
    ...calibratedCode,
    code: { sha, dirty: true },
  });
  expect(result.reasons).toContain("code-version-dirty");
});

it("refuses a measurement made from a dirty code version even after the working tree becomes clean", async () => {
  await writeMeasured({ logDirty: true });
  const result = await checkRelease({ root, ...calibratedCode });
  expect(result.releasable).toBe(false);
  expect(result.reasons).toContain("code-version-dirty");
});

it("recomputes targets from logged outcomes instead of the log's own claims", async () => {
  // AI run 2 raises ten red Verdicts on correctly cited records: 10/330 > 1 %.
  await writeMeasured({
    outcomes: (run, r) =>
      run === "ai-2" && /^apa-[0-9]$/.test(r.id)
        ? {
            kind: "verdict",
            verdict: "not-found",
            identifiers: [],
            failedSources: [],
            reasons: [],
          }
        : passingOutcome(r),
  });
  const result = await checkRelease({ root, ...calibratedCode });
  expect(result.releasable).toBe(false);
  expect(result.reasons).toContain("target-missed:ai-2:false-alarms");
});

it("refuses without a measurement for this exact code version and fixture state", async () => {
  await writeMeasured({ logSha: "b".repeat(40) });
  expect((await checkRelease({ root, ...calibratedCode })).reasons).toContain(
    "no-measurement-log",
  );
  await rm(join(root, "measurement-logs"), { recursive: true });
  await writeMeasured({ fixtureState: "sha256:stale" });
  expect((await checkRelease({ root, ...calibratedCode })).reasons).toContain(
    "no-measurement-log",
  );
});

it("refuses without a private measurement location", async () => {
  const result = await checkRelease({ root: undefined, ...calibratedCode });
  expect(result).toEqual({
    releasable: false,
    reasons: ["no-measurement-location"],
  });
});

it("refuses when Reference test set bytes change without a new version", async () => {
  await writeMeasured();
  const file = join(root, "reference-test-set", "records.json");
  const changed = JSON.parse(await readFile(file, "utf8")) as GateRecord[];
  changed[0]!.input = "Changed synthetic input under the same version";
  await writeFile(file, JSON.stringify(changed));
  const result = await checkRelease({ root, ...calibratedCode });
  expect(result.releasable).toBe(false);
  expect(result.reasons).toContain("no-measurement-log");
});

it("does not reuse a measurement for different active sources or thresholds", async () => {
  await writeMeasured();
  const result = await checkRelease({
    root,
    ...calibratedCode,
    expected: {
      ...calibratedCode.expected,
      configuration: {
        ...calibratedCode.expected.configuration,
        comparisonParameters: { lead: 2 },
      },
    },
  });
  expect(result.releasable).toBe(false);
  expect(result.reasons).toContain("no-measurement-log");
});

it("refuses AI measurements without the live EU-only configuration declaration", async () => {
  await writeMeasured({ aiConfiguration: null });
  const result = await checkRelease({
    root,
    ...calibratedCode,
    expected: { ...calibratedCode.expected, aiConfiguration: null },
  });
  expect(result.releasable).toBe(false);
  expect(result.reasons).toContain("ai-evidence-unqualified");
});

it("refuses malformed measurement JSON with a release decision instead of crashing", async () => {
  await writeMeasured();
  await writeFile(
    join(
      root,
      "measurement-logs",
      "synthetic-rts-1",
      "synthetic-configuration.json",
    ),
    "{broken",
  );
  await expect(
    checkRelease({ root, ...calibratedCode }),
  ).resolves.toMatchObject({
    releasable: false,
    reasons: ["invalid-log"],
  });
});

it("recomputes per-style AI Structuring quality and rejects invented fields despite passing Verdicts", async () => {
  await writeMeasured({
    fields: (run, r) => [
      run === "ai-2" && r.style === "apa"
        ? {
            ...r.expectedFields,
            publisher: "Invented by the synthetic adapter",
          }
        : r.expectedFields,
    ],
  });
  const result = await checkRelease({ root, ...calibratedCode });
  expect(result.releasable).toBe(false);
  expect(result.reasons).toContain("structuring-missed:ai-2:apa");
});

it("recomputes validity from every outcome even when a log claims the run was valid", async () => {
  const failedId = records.find((r) => r.class === "real-deviating")!.id;
  await writeMeasured({
    outcomes: (_, r) =>
      r.id === failedId
        ? { kind: "status", status: "failed" }
        : passingOutcome(r),
  });
  const result = await checkRelease({ root, ...calibratedCode });
  expect(result.releasable).toBe(false);
  expect(result.reasons).toContain("invalid-run:parser-1");
});

it("exits 78 from the release check and names every blocking reason", async () => {
  await writeMeasured();
  const server = fileURLToPath(new URL("..", import.meta.url));
  for (const env of [{}, { SOURCE_TASTER_QUALITY_ROOT: root }]) {
    const result = spawnSync(process.execPath, ["scripts/release-check.ts"], {
      cwd: server,
      env: { PATH: process.env.PATH, ...env },
      encoding: "utf8",
    });
    expect(result.status).toBe(78);
    expect(result.stderr).toMatch(/^Release refused/m);
    expect(result.stderr).toMatch(/^- uncalibrated$/m);
    if (!("SOURCE_TASTER_QUALITY_ROOT" in env))
      expect(result.stderr).toMatch(/^- no-measurement-location$/m);
    else expect(result.stderr).toMatch(/^- no-measurement-log$/m);
  }
});

it("refuses a release without a passing fifty-Check replay of the exact configuration", async () => {
  await writeMeasured();
  const withoutReport = await checkRelease({
    root,
    ...calibratedCode,
    loadReport: undefined,
  });
  expect(withoutReport.releasable).toBe(false);
  expect(withoutReport.reasons).toContain("no-load-report");

  const synthetic = join(root, "synthetic.json");
  await writeFile(
    synthetic,
    JSON.stringify(
      passingReport({
        enabledSources: [],
        evidence: {
          provenance: "synthetic-witness",
          unmatchedRequests: 0,
          requests: {},
        },
      }),
    ),
  );
  const refused = await checkRelease({
    root,
    ...calibratedCode,
    loadReport: synthetic,
  });
  expect(refused.releasable).toBe(false);
  expect(refused.reasons).toContain("load-synthetic-evidence");

  // A passing replay of a different configuration is not this release's replay.
  const other = join(root, "other.json");
  await writeFile(
    other,
    JSON.stringify(passingReport({ enabledSources: ["openalex"] })),
  );
  const mismatched = await checkRelease({
    root,
    ...calibratedCode,
    loadReport: other,
  });
  expect(mismatched.releasable).toBe(false);
  expect(mismatched.reasons).toContain("load-sources-mismatch");
  // The Quality gate's own reasons are still all reported.
  const uncalibrated = await checkRelease({
    root,
    ...calibratedCode,
    runtimeCalibration: "uncalibrated",
    loadReport: other,
  });
  expect(uncalibrated.reasons).toEqual(
    expect.arrayContaining(["uncalibrated", "load-sources-mismatch"]),
  );
});

it("names the missing replay when the release check runs without it", () => {
  const server = fileURLToPath(new URL("..", import.meta.url));
  const result = spawnSync(process.execPath, ["scripts/release-check.ts"], {
    cwd: server,
    env: { PATH: process.env.PATH, SOURCE_TASTER_QUALITY_ROOT: root },
    encoding: "utf8",
  });
  expect(result.status).toBe(78);
  expect(result.stderr).toMatch(/^- no-load-report$/m);
  const unreadable = spawnSync(process.execPath, ["scripts/release-check.ts"], {
    cwd: server,
    env: {
      PATH: process.env.PATH,
      SOURCE_TASTER_LOAD_REPORT: join(root, "absent.json"),
    },
    encoding: "utf8",
  });
  expect(unreadable.status).toBe(78);
  expect(unreadable.stderr).toMatch(/^- load-report-unreadable$/m);
});
