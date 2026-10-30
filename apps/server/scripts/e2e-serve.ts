// SPDX-License-Identifier: AGPL-3.0-or-later
import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import { once } from "node:events";
import { startBibliographicFixtures } from "../test/support/bibliographic-fixtures.ts";
import { startDoiFixtures } from "../test/support/doi-fixtures.ts";
import { startTestService } from "../test/support/service.ts";

const fixtures = await startDoiFixtures();
const bibliographic =
  process.env.SOURCE_TASTER_E2E_BIBLIOGRAPHIC === "true"
    ? await startBibliographicFixtures()
    : undefined;
if (bibliographic) fixtures.respond("/works", 200, { message: { items: [] } });
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
fixtures.respond("/api/handles/10.5555/browser-journal", 200, {
  responseCode: 1,
  handle: "10.5555/browser-journal",
});
fixtures.respond("/works/10.5555/browser-journal", 200, {
  message: {
    DOI: "10.5555/browser-journal",
    title: ["Synthetic journal evidence"],
    author: [{ family: "Smith", given: "Anna" }],
    "container-title": ["The Journal of biological chemistry"],
    published: { "date-parts": [[2021]] },
    volume: "1",
    page: "1-2",
  },
});
const held = fixtures.hold("/api/handles/10.5555/browser-held");
fixtures.respond("/api/handles/10.5555/browser-unavailable", 503, {});
fixtures.respond("/works/10.5555/browser-invalid", 200, { message: {} });
fixtures.respond("/api/handles/10.5555/workspace-nonexistent", 404, {
  responseCode: 100,
  handle: "10.5555/workspace-nonexistent",
});
fixtures.respond("/works/10.5555/workspace-nonexistent", 404, {});
// Independently authored web protocol witnesses; no provider recordings.
const webFixtures = process.env.SOURCE_TASTER_E2E_WEB_FIXTURES === "true";
if (webFixtures) {
  fixtures.respond("/web80-dead", 410, {});
  fixtures.respond("/wayback/available", 200, {
    archived_snapshots: {
      closest: {
        available: true,
        status: "200",
        timestamp: "20260102030405",
        url: "https://web.archive.org/web/20260102030405/https://example.com/web80-dead",
      },
    },
  });
  fixtures.route((url) =>
    url.pathname === "/web/20260102030405id_/https://example.com/web80-dead"
      ? {
          status: 200,
          contentType: "text/html",
          body: "<title>Web route witness</title><p>Evidence</p>",
        }
      : undefined,
  );
}
const service = await startTestService(
  Number(process.env.SOURCE_TASTER_E2E_API_PORT ?? 3102),
  3000,
  {
    ...fixtures.env,
    ...bibliographic?.env,
    ...(webFixtures
      ? {
          SOURCE_TASTER_BIBLIOGRAPHIC_PREVIEW: "uncalibrated",
          SOURCE_TASTER_URL_ENABLED: "true",
          SOURCE_TASTER_INTERNETARCHIVE_ENABLED: "true",
          SOURCE_TASTER_WEB_FIXTURE_BASE_URL:
            fixtures.env.SOURCE_TASTER_CROSSREF_BASE_URL,
        }
      : {}),
    SOURCE_TASTER_CLIENT_LEASE_MS: "1500",
  },
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
