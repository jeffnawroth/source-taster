// SPDX-License-Identifier: AGPL-3.0-or-later
import { spawn } from "node:child_process";
import { once } from "node:events";
import { startBibliographicFixtures } from "../test/support/bibliographic-fixtures.ts";
import { registerPreviewFixtures } from "../test/support/preview-fixtures.ts";
import { startDoiFixtures } from "../test/support/doi-fixtures.ts";
import { e2eClientLeaseMs } from "../test/support/e2e-lease.ts";
import { startTestService } from "../test/support/service.ts";

const fixtures = await startDoiFixtures();
const bibliographic =
  process.env.SOURCE_TASTER_E2E_BIBLIOGRAPHIC === "true"
    ? await startBibliographicFixtures()
    : undefined;
const preview = await registerPreviewFixtures(fixtures, {
  bibliographic,
  web: process.env.SOURCE_TASTER_E2E_WEB_FIXTURES === "true",
});
const reports = process.env.SOURCE_TASTER_E2E_REPORTS;
const service = await startTestService(
  Number(process.env.SOURCE_TASTER_E2E_API_PORT ?? 3102),
  3000,
  {
    ...fixtures.env,
    ...bibliographic?.env,
    ...preview.env,
    SOURCE_TASTER_CLIENT_LEASE_MS: String(e2eClientLeaseMs),
    // Test composition with a fake Quota, because the real report feature
    // grant belongs to the private service (see test/support/report-web.ts).
    ...(reports ? { TEST_REPORT_FEATURE: reports } : {}),
  },
  reports ? { webScript: "test/support/report-web.ts" } : {},
);
const webPort = process.env.SOURCE_TASTER_E2E_WEB_PORT ?? "5174";
const vite = spawn(
  "pnpm",
  ["--filter", "@source-taster/web", "dev", "--port", webPort, "--strictPort"],
  {
    cwd: new URL("../../..", import.meta.url),
    env: { PATH: process.env.PATH, SOURCE_TASTER_API_URL: service.apiUrl },
    stdio: "inherit",
  },
);
let stopping = false;
async function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  vite.kill("SIGTERM");
  await service.stop();
  preview.release();
  await fixtures.stop();
  await bibliographic?.stop();
  process.exit(code);
}
process.once("SIGTERM", () => {
  void stop();
});
process.once("SIGINT", () => {
  void stop();
});
const [code] = (await once(vite, "exit")) as [number | null];
await stop(code ?? 1);
