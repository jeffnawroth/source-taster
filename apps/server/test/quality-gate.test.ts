// SPDX-License-Identifier: AGPL-3.0-or-later
// #94 Quality gate end to end: the real web and worker processes measure a
// synthetic Reference test set generated into a temporary private location.
// Data sources answer only from replay entries; the AI extraction port is a
// fake at the edge. No dataset content, recording or provider call is used.
import {
  chmod,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  realpath,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, expect, it } from "vitest";
import {
  calibrate,
  measureConfiguration,
  type ExtractionPort,
} from "../scripts/quality/runner.ts";

const port = 4202;
let root: string;
beforeEach(async () => {
  root = await realpath(await mkdtemp(join(tmpdir(), "st-94-gate-")));
});
afterEach(async () => {
  await chmod(join(root, "reference-test-set"), 0o755).catch(() => {});
  await rm(root, { recursive: true, force: true });
});

const correct = {
  id: "synthetic-correct",
  input:
    "Alpha, A. (2021). Synthetic witness of a correct citation. Journal of Synthetic Tests, 7, 11–12. https://doi.org/10.5555/st94-correct",
  fields: {
    type: "article-journal",
    author: [{ family: "Alpha", given: "A." }],
    issued: { literal: "2021" },
    title: "Synthetic witness of a correct citation",
    "container-title": "Journal of Synthetic Tests",
    volume: "7",
    page: "11–12",
    DOI: "10.5555/st94-correct",
  },
};
const invented = {
  id: "synthetic-invented",
  input:
    "Omega, O. (2022). An entirely invented work. Journal of Synthetic Tests, 8, 1–9. https://doi.org/10.5555/st94-invented",
  fields: {
    type: "article-journal",
    author: [{ family: "Omega", given: "O." }],
    issued: { literal: "2022" },
    title: "An entirely invented work",
    "container-title": "Journal of Synthetic Tests",
    volume: "8",
    page: "1–9",
    DOI: "10.5555/st94-invented",
  },
};
const json = (value: unknown) => JSON.stringify(value);
const fixtures = [
  {
    source: "doi.org",
    path: "/api/handles/10.5555%2Fst94-correct",
    status: 200,
    body: json({ responseCode: 1, handle: "10.5555/st94-correct" }),
    license: "synthetic",
  },
  {
    source: "crossref",
    path: "/works/10.5555%2Fst94-correct",
    status: 200,
    body: json({
      message: {
        DOI: "10.5555/st94-correct",
        type: "journal-article",
        title: ["Synthetic witness of a correct citation"],
        author: [{ family: "Alpha", given: "A." }],
        "container-title": ["Journal of Synthetic Tests"],
        published: { "date-parts": [[2021]] },
        volume: "7",
        page: "11-12",
      },
    }),
    license: "synthetic",
  },
  {
    source: "doi.org",
    path: "/api/handles/10.5555%2Fst94-invented",
    status: 404,
    body: json({ responseCode: 100, handle: "10.5555/st94-invented" }),
    license: "synthetic",
  },
  {
    source: "crossref",
    path: "/works/10.5555%2Fst94-invented",
    status: 404,
    body: "Resource not found.",
    license: "synthetic",
  },
];

const provenance = { reviewedBy: "synthetic", reviewedAt: "2026-10-31" };
async function writeReferenceTestSet(
  extraRecords: object[] = [],
  extraFixtures: object[] = [],
  kind: "reference-test-set" | "development-set" = "reference-test-set",
) {
  const directory = join(root, kind);
  await mkdir(directory, { recursive: true });
  await writeFile(
    join(directory, "manifest.json"),
    json({
      kind,
      version:
        kind === "reference-test-set" ? "synthetic-rts-1" : "synthetic-dev-1",
    }),
  );
  await writeFile(
    join(directory, "records.json"),
    json([
      {
        id: correct.id,
        input: correct.input,
        style: "apa",
        language: "en",
        sourceType: "article",
        class: "real-correct",
        acceptedIdentifiers: [{ type: "doi", value: "10.5555/ST94-CORRECT" }],
        provenance,
      },
      {
        id: invented.id,
        input: invented.input,
        style: "apa",
        language: "en",
        sourceType: "article",
        class: "invented",
        generator: { model: "synthetic-generator", provider: "synthetic" },
        provenance,
      },
      ...extraRecords,
    ]),
  );
  await writeFile(
    join(directory, "fixtures.json"),
    json({
      recordedAt: "2026-10-31",
      entries: [...fixtures, ...extraFixtures],
    }),
  );
}

interface LogFile {
  configuration: { fixtureState: string; codeVersion: { sha: string } };
  runs: {
    path: string;
    run: number;
    valid: boolean;
    misses: unknown[];
    replayMisses: number;
    reruns: string[];
    invalidRecords: string[];
    targets: { target: string; hits: number; n: number }[];
    strata: unknown[];
    regressions: unknown[];
  }[];
  decision: { releasable: boolean; reasons: string[] };
}
interface CalibrationFile {
  grid: unknown;
  developmentSetVersion: string;
  scoringRules: { version: string };
  results: {
    parameters: object;
    observedProfile: { overallScore: number };
    runs: { path: string }[];
  }[];
  selected: unknown;
}
const readJson = async <T>(path: string) =>
  JSON.parse(await readFile(path, "utf8")) as T;

/** Fake AI extraction at the edge: fixed fields per input, calls counted. */
function fakeExtraction() {
  const calls: string[] = [];
  const port: ExtractionPort = {
    model: "synthetic-model",
    extract: (input) => {
      calls.push(input);
      return Promise.resolve([
        input === correct.input ? correct.fields : invented.fields,
      ]);
    },
  };
  return { port, calls };
}

it("measures the parser path once and AI extraction three times, logs the configuration and refuses release while uncalibrated", async () => {
  await writeReferenceTestSet();
  const extraction = fakeExtraction();
  const result = await measureConfiguration({
    root,
    configuration: { enabledSources: [] },
    extraction: extraction.port,
    port,
  });

  expect(extraction.calls).toHaveLength(6);
  const logs = await readdir(join(root, "measurement-logs", "synthetic-rts-1"));
  expect(logs).toHaveLength(1);
  const log = await readJson<LogFile>(
    join(root, "measurement-logs", "synthetic-rts-1", logs[0]!),
  );
  expect(result.logPath).toBe(
    join(root, "measurement-logs", "synthetic-rts-1", logs[0]!),
  );
  expect(log.configuration).toMatchObject({
    aiModel: "synthetic-model",
    testSetVersion: "synthetic-rts-1",
    enabledSources: [],
    scoringRules: { calibration: "uncalibrated" },
  });
  expect(log.configuration.fixtureState).toMatch(/^sha256:/);
  expect(log.configuration.codeVersion.sha).toMatch(/^[0-9a-f]{40}$/);
  expect(log.runs.map((r) => `${r.path}-${r.run}`)).toEqual([
    "parser-1",
    "ai-1",
    "ai-2",
    "ai-3",
  ]);
  for (const run of log.runs) {
    expect(run.valid).toBe(true);
    expect(run.misses).toEqual([]);
    expect(run.replayMisses).toBe(0);
    expect(
      Object.fromEntries(run.targets.map((t) => [t.target, [t.hits, t.n]])),
    ).toEqual({
      correctness: [1, 1],
      "false-alarms": [0, 1],
      detection: [1, 1],
      "invented-detection": [1, 1],
    });
  }
  // Informational per-stratum values; strata below 30 are too small.
  expect(log.runs[0]!.strata).toContainEqual(
    expect.objectContaining({
      dimension: "language",
      value: "en",
      target: "detection",
      status: "too-small",
    }),
  );
  expect(log.runs[0]!.regressions).toEqual([]);
  expect(log.decision.releasable).toBe(false);
  expect(log.decision.reasons).toContain("uncalibrated");
  expect(result.decision).toEqual(log.decision);
  // Write-once (FA-UEB-31 hook): the same configuration is refused before
  // any work, and the preserved log stays untouched.
  await expect(
    measureConfiguration({
      root,
      configuration: { enabledSources: [] },
      extraction: extraction.port,
      port,
    }),
  ).rejects.toThrow(/already exists/);
  expect(extraction.calls).toHaveLength(6);
  expect(await readJson<LogFile>(result.logPath)).toEqual(log);
}, 120_000);

const withDoi = (id: string, doi: string) => ({
  id,
  input: `Beta, B. (2020). Synthetic reference ${id}. Journal of Synthetic Tests, 3, 5–6. https://doi.org/${doi}`,
  style: "apa",
  language: "en",
  sourceType: "article",
  class: "real-correct",
  acceptedIdentifiers: [{ type: "doi", value: doi }],
  provenance,
});

it("reruns a record whose Data source failed and marks the run invalid when the failure persists", async () => {
  await writeReferenceTestSet(
    [withDoi("synthetic-unavailable", "10.5555/st94-unavailable")],
    [
      {
        source: "doi.org",
        path: "/api/handles/10.5555%2Fst94-unavailable",
        status: 200,
        body: json({ responseCode: 1, handle: "10.5555/st94-unavailable" }),
        license: "synthetic",
      },
      {
        source: "crossref",
        path: "/works/10.5555%2Fst94-unavailable",
        status: 503,
        body: "",
        license: "synthetic",
      },
    ],
  );
  const result = await measureConfiguration({
    root,
    configuration: { enabledSources: [] },
    port,
  });
  const log = await readJson<LogFile>(result.logPath);
  expect(log.runs).toHaveLength(1);
  const run = log.runs[0]!;
  expect(run.misses).toEqual([]);
  expect(run.reruns).toEqual(["synthetic-unavailable"]);
  expect(run.invalidRecords).toEqual(["synthetic-unavailable"]);
  expect(run.valid).toBe(false);
  expect(result.decision.reasons).toContain("invalid-run:parser-1");
  // No record is excluded: the failed record stays in the denominator.
  expect(run.targets.find((t) => t.target === "false-alarms")!.n).toBe(2);
}, 120_000);

it("marks a run invalid when a Data source request has no recorded response", async () => {
  await writeReferenceTestSet([
    withDoi("synthetic-unrecorded", "10.5555/st94-unrecorded"),
  ]);
  const result = await measureConfiguration({
    root,
    configuration: { enabledSources: [] },
    port,
  });
  const log = await readJson<LogFile>(result.logPath);
  const run = log.runs[0]!;
  expect(run.replayMisses).toBeGreaterThan(0);
  expect(run.misses[0]).toMatchObject({
    source: "doi.org",
    path: "/api/handles/10.5555%2Fst94-unrecorded",
  });
  expect(run.valid).toBe(false);
  expect(result.decision.reasons).toContain("invalid-run:parser-1");
}, 120_000);

it("calibrates on the Development set over the declared grid only, without reading the Reference test set", async () => {
  await writeReferenceTestSet([], [], "development-set");
  await mkdir(join(root, "reference-test-set"));
  await chmod(join(root, "reference-test-set"), 0o000);
  const extraction = fakeExtraction();
  const grid = { axes: { overallScore: [85000000, 90000000] } };
  const result = await calibrate({
    root,
    grid,
    extraction: extraction.port,
    port,
  });

  // AI extraction runs three times once; every grid point reuses it.
  expect(extraction.calls).toHaveLength(6);
  const record = await readJson<CalibrationFile>(result.recordPath);
  expect(
    result.recordPath.startsWith(join(root, "calibration", "synthetic-dev-1")),
  ).toBe(true);
  expect(record.grid).toEqual(grid);
  expect(record.developmentSetVersion).toBe("synthetic-dev-1");
  expect(record.scoringRules.version).toEqual(expect.any(String));
  expect(record.results.map((r) => r.parameters)).toEqual([
    { overallScore: 85000000 },
    { overallScore: 90000000 },
  ]);
  // Each point was measured by a service restarted with that point.
  expect(record.results.map((r) => r.observedProfile.overallScore)).toEqual([
    85000000, 90000000,
  ]);
  for (const point of record.results)
    expect(point.runs.map((r) => r.path)).toEqual(["parser", "ai", "ai", "ai"]);
  // Both points meet every target with equal margins: the first one wins.
  // Smallest margin: AI false alarms 0/1 against <= 1 %, i.e. 1/100.
  expect(record.selected).toEqual({
    index: 0,
    parameters: { overallScore: 85000000 },
    minimumMargin: { numerator: 1, denominator: 100 },
  });
  await expect(
    calibrate({ root, grid, extraction: extraction.port, port }),
  ).rejects.toThrow(/already exists/);
  expect(extraction.calls).toHaveLength(6);
}, 180_000);

it("refuses an undeclared grid parameter before any service starts", async () => {
  await writeReferenceTestSet([], [], "development-set");
  await expect(
    calibrate({ root, grid: { axes: { yearWeight: [1] } }, port }),
  ).rejects.toThrow(/yearWeight is not a free ADR-0025 parameter/);
  await expect(readdir(join(root, "calibration"))).rejects.toThrow(/ENOENT/);
});
