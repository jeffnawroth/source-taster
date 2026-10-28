// SPDX-License-Identifier: AGPL-3.0-or-later
import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import { once } from "node:events";
import { startDoiFixtures } from "../test/support/doi-fixtures.ts";
import { startTestService } from "../test/support/service.ts";

const fixtures = await startDoiFixtures();
// Exact development comparison witnesses, served only by the owned HTTP edge.
const comparisonCases = JSON.parse(
  await readFile(
    new URL("../test/fixtures/comparison/ten-cases.json", import.meta.url),
    "utf8",
  ),
) as { doi: string; field: string; metadata: string }[];
for (const c of comparisonCases) {
  fixtures.respond(`/api/handles/${c.doi}`, 200, {
    responseCode: 1,
    handle: c.doi,
  });
  fixtures.respond(`/works/${c.doi}`, 200, {
    message: {
      DOI: c.doi,
      [c.field]: ["title", "container-title"].includes(c.field)
        ? [c.metadata]
        : c.metadata,
    },
  });
}
fixtures.respond("/api/handles/10.5555/browser-authors", 200, {
  responseCode: 1,
  handle: "10.5555/browser-authors",
});
fixtures.respond("/works/10.5555/browser-authors", 200, {
  message: {
    DOI: "10.5555/browser-authors",
    author: [
      { family: "Beta", given: "Ben" },
      { family: "Alpha", given: "Anna" },
      { family: "Gamma", given: "Greta" },
    ],
  },
});
const held = fixtures.hold("/api/handles/10.5555/browser-held");
fixtures.respond("/api/handles/10.5555/browser-unavailable", 503, {});
fixtures.respond("/works/10.5555/browser-invalid", 200, { message: {} });
const service = await startTestService(
  Number(process.env.SOURCE_TASTER_E2E_API_PORT ?? 3102),
  3000,
  { ...fixtures.env, SOURCE_TASTER_CLIENT_LEASE_MS: "1500" },
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
  held.release();
  await fixtures.stop();
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
