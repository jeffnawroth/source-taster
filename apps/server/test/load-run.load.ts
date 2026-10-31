// SPDX-License-Identifier: AGPL-3.0-or-later
// End-to-end failure path of the load harness (#117): real web and worker
// processes, an owned PostgreSQL database, the HTTP/SSE contract and the
// replay edge. A deliberately paced OpenAlex budget makes the findable mean
// exceed 3 s without touching any target; the run must fail and say so in a
// machine-readable report. Serial: ports 4501 (API) and 4502 (replay edge).
import { spawn } from "node:child_process";
import { once } from "node:events";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, expect, it } from "vitest";
import { LoadReport } from "../scripts/load/analysis.ts";

const serverDir = fileURLToPath(new URL("..", import.meta.url));
let directory: string | undefined;
afterEach(async () => {
  if (directory) await rm(directory, { recursive: true, force: true });
  directory = undefined;
});

async function cli(args: string[], env: Record<string, string> = {}) {
  const child = spawn(
    process.execPath,
    [
      "scripts/load-test.ts",
      "--api-port",
      process.env.SOURCE_TASTER_TEST_API_PORT ?? "4501",
      "--replay-port",
      process.env.SOURCE_TASTER_TEST_SERVICE_PORT ?? "4502",
      ...args,
    ],
    {
      cwd: serverDir,
      env: {
        ...env,
        PATH: process.env.PATH,
        DATABASE_ADMIN_URL: process.env.DATABASE_ADMIN_URL,
        DATABASE_TEST_URL: process.env.DATABASE_TEST_URL,
      },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  let output = "";
  child.stdout.on("data", (chunk) => (output += String(chunk)));
  child.stderr.on("data", (chunk) => (output += String(chunk)));
  const [code] = (await once(child, "exit")) as [number | null];
  return { code, output };
}

it("fails and reports when the findable mean exceeds 3 s under paced Data source budget", async () => {
  directory = await mkdtemp(join(tmpdir(), "st-load-e2e-"));
  const reportPath = join(directory, "report.json");
  // Six findable References, one OpenAlex send per 1.5 s: the n-th waits
  // 1.5·n s, so the mean is at least 3.75 s whatever else the system adds.
  const { code, output } = await cli([
    "--checks",
    "3",
    "--references",
    "2",
    "--not-findable-share",
    "0",
    "--placeholder-delay-ms",
    "0",
    "--settings",
    JSON.stringify({ sources: { openalex: { intervalMs: 1500 } } }),
    "--synthetic-findable-ms",
    "50",
    "--max-run-seconds",
    "90",
    "--report",
    reportPath,
  ]);
  expect(code, output).toBe(1);
  const report = LoadReport.parse(
    JSON.parse(await readFile(reportPath, "utf8")),
  );
  expect(report.outcome).toBe("failed");
  const findable = report.targets.find((t) => t.id === "FA-UEB-40")!;
  expect(findable.status).toBe("missed");
  expect(findable.measured).toBeGreaterThan(3000);
  // Nothing was loosened and nothing was left unreplayed.
  expect(report.evidence.unmatchedRequests).toBe(0);
  expect(report.invalidEvidence).toEqual([]);
  expect(report.qualifying).toBe(false);
  expect(report.evidence.provenance).toBe("synthetic-witness");
  expect(report.limitations).toContain(
    "Synthetic latency witnesses are not recorded latencies and give no qualification.",
  );
}, 120_000);

it("refuses a release run without authorized recordings", async () => {
  const { code, output } = await cli(["--release", "--checks", "1"]);
  expect(code, output).toBe(78);
  expect(output).toMatch(/recording/iu);
}, 30_000);

it("refuses a release run with eased budgets or measurement", async () => {
  for (const eased of [
    ["--settings", '{"sources":{"openalex":{"intervalMs":0}}}'],
    ["--duration-basis", "slot-eligible"],
    ["--placeholder-delay-ms", "0"],
  ]) {
    const { code, output } = await cli(["--release", ...eased]);
    expect(code, output).toBe(78);
    expect(output).toContain(eased[0]);
  }
}, 30_000);

// ---------------------------------------------------------------------------
// ADR-0007 release binding: the replay measures the reviewed production
// configuration (#94 file format) and nothing else.
// ---------------------------------------------------------------------------

async function writeFiles(configuration: unknown) {
  directory = await mkdtemp(join(tmpdir(), "st-load-release-"));
  const configurationPath = join(directory, "configuration.json");
  await writeFile(configurationPath, JSON.stringify(configuration));
  const recordingPath = join(directory, "recording.json");
  await writeFile(
    recordingPath,
    JSON.stringify({
      authorization: "synthetic-test-authorization",
      entries: [],
      workload: [
        {
          id: "ref",
          category: "findable",
          originalText: "Synthetic Reference",
          fields: { title: "Synthetic" },
        },
      ],
    }),
  );
  return {
    configurationPath,
    recordingPath,
    reportPath: join(directory, "report.json"),
  };
}

it("refuses a release replay that is not bound to a reviewed configuration and a report location", async () => {
  const files = await writeFiles({ enabledSources: ["europepmc", "openalex"] });
  const missingConfiguration = await cli([
    "--release",
    "--recording",
    files.recordingPath,
    "--report",
    files.reportPath,
  ]);
  expect(missingConfiguration.code, missingConfiguration.output).toBe(78);
  expect(missingConfiguration.output).toMatch(/--configuration/u);
  const missingReport = await cli([
    "--release",
    "--recording",
    files.recordingPath,
    "--configuration",
    files.configurationPath,
  ]);
  expect(missingReport.code, missingReport.output).toBe(78);
  expect(missingReport.output).toMatch(/--report|SOURCE_TASTER_LOAD_REPORT/u);
  // The Quality gate's own configuration variable supplies the file.
  const shared = await cli(["--release", "--recording", files.recordingPath], {
    SOURCE_TASTER_QUALITY_CONFIGURATION: files.configurationPath,
  });
  expect(shared.code, shared.output).toBe(78);
  expect(shared.output).not.toMatch(/--configuration/u);
  expect(shared.output).toMatch(/SOURCE_TASTER_LOAD_REPORT/u);
}, 30_000);

it("refuses configurations the harness cannot replay or that conflict with ad hoc settings", async () => {
  const files = await writeFiles({
    enabledSources: ["europepmc", "openalex", "semanticscholar"],
  });
  const unreplayed = await cli(["--configuration", files.configurationPath]);
  expect(unreplayed.code, unreplayed.output).toBe(78);
  expect(unreplayed.output).toContain("semanticscholar");
  const conflicting = await writeFiles({
    enabledSources: ["europepmc", "openalex"],
  });
  const both = await cli([
    "--configuration",
    conflicting.configurationPath,
    "--settings",
    "{}",
  ]);
  expect(both.code, both.output).toBe(78);
  expect(both.output).toMatch(/--settings/u);
  const invalid = await writeFiles({
    enabledSources: ["europepmc", "openalex"],
    searchSettings: { maxRetries: 9 },
  });
  const rejected = await cli(["--configuration", invalid.configurationPath]);
  expect(rejected.code, rejected.output).toBe(78);
}, 30_000);

it("measures exactly the reviewed configuration and records its identity", async () => {
  const configuration = {
    enabledSources: ["europepmc", "openalex"],
    searchSettings: { sources: { openalex: { intervalMs: 40 } } },
  };
  const files = await writeFiles(configuration);
  const { code, output } = await cli([
    "--checks",
    "2",
    "--references",
    "2",
    "--not-findable-share",
    "0",
    "--synthetic-findable-ms",
    "20",
    "--max-run-seconds",
    "60",
    "--configuration",
    files.configurationPath,
    "--report",
    files.reportPath,
  ]);
  // Reduced scope never passes; nothing was relaxed to get here.
  expect([1, 3], output).toContain(code);
  const report = LoadReport.parse(
    JSON.parse(await readFile(files.reportPath, "utf8")),
  );
  const digest = `sha256:${createHash("sha256")
    .update(await readFile(files.configurationPath))
    .digest("hex")}`;
  expect(report.configuration.reviewed).toEqual({ digest });
  expect(report.configuration.enabledSources).toEqual([
    "europepmc",
    "openalex",
  ]);
  expect(
    (
      report.configuration.searchSettings as {
        sources: { openalex: { intervalMs: number; maxWaitMs: number } };
      }
    ).sources.openalex,
  ).toMatchObject({ intervalMs: 40, maxWaitMs: 10_000 });
  const head = execFileSync("git", ["rev-parse", "HEAD"], {
    cwd: serverDir,
    encoding: "utf8",
  }).trim();
  expect(report.codeVersion?.sha).toBe(head);
  expect(report.qualifying).toBe(false);
  expect(report.evidence.provenance).toBe("synthetic-witness");
}, 120_000);
