// SPDX-License-Identifier: AGPL-3.0-or-later
// Published HTTP/download seam of the PDF Verification report (#105). Real
// PostgreSQL, a real worker process and recorded external adapters; the
// Quota feature scope comes from an in-process fake of the private Quota port.
import { once } from "node:events";
import { serve } from "@hono/node-server";
import pg from "pg";
import { afterAll, beforeAll, beforeEach, expect, it } from "vitest";
import { createParser } from "@source-taster/core";
import { CheckResponse } from "@source-taster/contract-verification/v2";
import { ReportResponse } from "@source-taster/contract-verification/report";
import { readSseFrames } from "@source-taster/contract-verification/client";
import { createApp } from "../src/http/app.ts";
import { createPrisma } from "../src/db/prisma.ts";
import { createQueue } from "../src/checks/queue.ts";
import { createCheckStore } from "../src/checks/store.ts";
import { listenForEvents } from "../src/checks/events.ts";
import { LOCAL_OWNER } from "../src/entitlements.ts";
import { setupDatabase } from "../scripts/db-setup.ts";
import { startProcess, testDatabase } from "./support/processes.ts";
import { startDoiFixtures } from "./support/doi-fixtures.ts";
import { inspectPdf, roles } from "./support/pdf-inspect.ts";

const database = testDatabase();
const db = createPrisma(database.appUrl);
const ownerA = "11111111-1111-4111-8111-111111111111";
const ownerB = "22222222-2222-4222-8222-222222222222";
let owner = ownerA;
let features: string[] = [];
let guest = false;
let reservations = 0;
let fixtures: Awaited<ReturnType<typeof startDoiFixtures>>;
let worker: ReturnType<typeof startProcess>;
let stop: () => Promise<void>;
const port = Number(process.env.SOURCE_TASTER_TEST_REPORTS_PORT ?? 5101);
const api = `http://127.0.0.1:${port}`;
const headers = { "content-type": "application/json" };
const fields = {
  type: "article-journal",
  title: "Measured measurement",
  author: [{ family: "Aspelmeyer", given: "M." }],
  issued: { literal: "2008" },
  "container-title": "Nature Physics",
  volume: "5",
  page: "12",
  DOI: "10.1038/nphys1170",
};
const originalText = "My immutable Reference as written (2008), page 12";

beforeEach(() => {
  owner = ownerA;
  features = ["verification-report"];
  guest = false;
  reservations = 0;
});
beforeAll(async () => {
  fixtures = await startDoiFixtures();
  await setupDatabase(database.adminUrl, database.appUrl);
  worker = startProcess("worker", {
    NODE_ENV: "test",
    SOURCE_TASTER_MODE: "standalone",
    DATABASE_URL: database.appUrl,
    SOURCE_TASTER_PLACEHOLDER_DELAY_MS: "0",
    ...fixtures.env,
  });
  const boss = await createQueue(database.appUrl);
  const events = await listenForEvents(database.appUrl);
  const quota = (remaining: number) => ({
    consumed: 0,
    remaining,
    granted: 100,
    reserved: 100 - remaining,
    warning: "none" as const,
    grants: [],
    features,
  });
  const app = createApp({
    structuring: createParser(),
    checks: createCheckStore(db, boss),
    events,
    heartbeatMs: 100,
    referenceLimit: 1000,
    entitlements: {
      resolve: () =>
        Promise.resolve({
          ...LOCAL_OWNER,
          ownerId: owner,
          actorId: owner,
          ...(guest ? { guestContextId: "synthetic-guest" } : {}),
        }),
      quota: {
        snapshot: () => Promise.resolve(quota(100)),
        reserve: (_owner, _checkId, _key, slots) => {
          reservations++;
          return Promise.resolve({
            free: [],
            reserved: slots.length,
            quota: quota(100 - slots.length),
          });
        },
        release: async () => {},
        settle: async () => {},
      },
    },
  });
  const server = serve({ fetch: app.fetch, hostname: "127.0.0.1", port });
  await once(server, "listening");
  stop = async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    await events.close();
    await boss.stop();
    await db.$disconnect();
    await worker.stop();
    await fixtures.stop();
    const admin = new pg.Client({ connectionString: database.adminUrl });
    await admin.connect();
    const owned = new URL(database.appUrl);
    await admin.query(
      `DROP DATABASE ${admin.escapeIdentifier(owned.pathname.slice(1))} WITH (FORCE)`,
    );
    await admin.query(`DROP ROLE ${admin.escapeIdentifier(owned.username)}`);
    await admin.end();
  };
});
afterAll(async () => {
  await stop?.();
});

async function checked() {
  const response = await fetch(`${api}/v2/checks`, {
    method: "POST",
    headers,
    body: JSON.stringify({ references: [{ originalText, fields }] }),
  });
  const check = CheckResponse.parse(await response.json()).data;
  const stream = await fetch(`${api}/v2/checks/${check.id}/events`);
  for await (const frame of readSseFrames(stream.body!)) void frame;
  return CheckResponse.parse(
    await (await fetch(`${api}/v2/checks/${check.id}`)).json(),
  ).data;
}
const create = (
  checkId: string,
  body: unknown = { language: "en", documentName: "Thesis chapter 3.docx" },
) =>
  fetch(`${api}/v2/checks/${checkId}/reports`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
async function ready(checkId: string, reportId: string) {
  for (let attempt = 0; attempt < 100; attempt++) {
    const status = ReportResponse.parse(
      await (await fetch(`${api}/v2/checks/${checkId}/reports/${reportId}`)).json(),
    ).data;
    if (status.state !== "queued" && status.state !== "generating")
      return status;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error("report never finished");
}
const file = (checkId: string, reportId: string) =>
  fetch(`${api}/v2/checks/${checkId}/reports/${reportId}/file`);

it("lets an Owner whose scope includes reports download a tagged PDF with the Check's content", async () => {
  const check = await checked();
  const before = reservations;
  const created = await create(check.id);
  expect(created.status).toBe(202);
  const job = ReportResponse.parse(await created.json()).data;
  expect(job.language).toBe("en");
  const finished = await ready(check.id, job.id);
  expect(finished.state).toBe("ready");
  const response = await file(check.id, job.id);
  expect(response.status).toBe(200);
  expect(response.headers.get("content-type")).toBe("application/pdf");
  expect(response.headers.get("content-disposition")).toBe(
    'attachment; filename="source-taster-report.pdf"',
  );
  expect(response.headers.get("cache-control")).toBe("no-store");
  expect(response.headers.get("x-content-type-options")).toBe("nosniff");
  const pdf = await inspectPdf(new Uint8Array(await response.arrayBuffer()));
  expect(pdf.markInfo).toMatchObject({ Marked: true });
  expect(pdf.language).toBe("en");
  expect(pdf.title).toContain("Thesis chapter 3.docx");
  expect(pdf.viewerPreferences).toMatchObject({ DisplayDocTitle: true });
  expect(roles(pdf.pages[0]!.tree).slice(0, 3)).toEqual(["Document", "H1", "P"]);
  expect(pdf.text).toContain("Thesis chapter 3.docx");
  expect(pdf.text).toContain(originalText);
  // The report is a separate job: no Quota is reserved or consumed for it.
  expect(reservations).toBe(before);
});
