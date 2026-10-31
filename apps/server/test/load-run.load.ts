// SPDX-License-Identifier: AGPL-3.0-or-later
// End-to-end failure path of the load harness (#117): real web and worker
// processes, an owned PostgreSQL database, the HTTP/SSE contract and the
// replay edge. A deliberately paced OpenAlex budget makes the findable mean
// exceed 3 s without touching any target; the run must fail and say so in a
// machine-readable report. Serial: ports 4501 (API) and 4502 (replay edge).
import { spawn } from "node:child_process";
import { once } from "node:events";
import { mkdtemp, readFile, rm } from "node:fs/promises";
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

async function cli(args: string[]) {
  const child = spawn(process.execPath, ["scripts/load-test.ts", ...args], {
    cwd: serverDir,
    env: {
      PATH: process.env.PATH,
      DATABASE_ADMIN_URL: process.env.DATABASE_ADMIN_URL,
      DATABASE_TEST_URL: process.env.DATABASE_TEST_URL,
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
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
