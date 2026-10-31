// SPDX-License-Identifier: AGPL-3.0-or-later
// #94 release refusal. The release check derives the code version and the
// Scoring rules calibration from the code, recomputes every target from the
// logged outcomes and the private Reference test set, and never trusts what a
// measurement log says about itself. Synthetic, generated population only.
import { spawnSync } from "node:child_process";
import { mkdir, mkdtemp, realpath, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, expect, it } from "vitest";
import { checkRelease } from "../scripts/quality/release.ts";
import type { GateRecord, RecordOutcome } from "../scripts/quality/targets.ts";
import { launchSizedRecords } from "./support/quality-records.ts";

const sha = "a".repeat(40);
let root: string;
beforeEach(async () => {
  root = await realpath(await mkdtemp(join(tmpdir(), "st-94-release-")));
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
        codeVersion: { sha: options.logSha ?? sha, dirty: false },
        aiModel: "synthetic-model",
        calibration: { record: "synthetic-calibration", selected: { lead: 1 } },
        scoringRules: { calibration: "calibrated" },
      },
      runs,
      decision: { releasable: true, reasons: [] },
    }),
  );
}
const calibratedCode = {
  code: { sha, dirty: false },
  runtimeCalibration: "synthetic-calibrated",
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
