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
import {
  inspectPdf,
  rawCatalog,
  rawLinks,
  roles,
} from "./support/pdf-inspect.ts";

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
  body: unknown = {
    language: "en",
    style: "apa",
    documentName: "Thesis chapter 3.docx",
  },
) =>
  fetch(`${api}/v2/checks/${checkId}/reports`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
async function ready(checkId: string, reportId: string) {
  for (let attempt = 0; attempt < 100; attempt++) {
    const status = ReportResponse.parse(
      await (
        await fetch(`${api}/v2/checks/${checkId}/reports/${reportId}`)
      ).json(),
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
  const bytes = new Uint8Array(await response.arrayBuffer());
  const pdf = await inspectPdf(bytes);
  expect(rawCatalog(bytes)).toEqual({
    language: "en",
    marked: true,
    displayDocTitle: true,
    hasStructTree: true,
  });
  expect(pdf.title).toContain("Thesis chapter 3.docx");
  expect(roles(pdf.pages[0]!.tree).slice(0, 3)).toEqual([
    "Document",
    "H1",
    "P",
  ]);
  expect(pdf.text).toContain("Thesis chapter 3.docx");
  expect(pdf.text).toContain(originalText);
  // The report is a separate job: no Quota is reserved or consumed for it.
  expect(reservations).toBe(before);
});

it("refuses Owners without the reports feature, Guests and foreign Owners without creating anything", async () => {
  const check = await checked();
  features = [];
  const denied = await create(check.id);
  expect(denied.status).toBe(403);
  expect((await denied.json()).type).toContain("feature-unavailable");
  features = ["verification-report"];
  guest = true;
  expect((await create(check.id)).status).toBe(403);
  guest = false;
  const created = ReportResponse.parse(
    await (await create(check.id)).json(),
  ).data;
  expect((await ready(check.id, created.id)).state).toBe("ready");
  owner = ownerB;
  expect((await create(check.id)).status).toBe(404);
  expect(
    (await fetch(`${api}/v2/checks/${check.id}/reports/${created.id}`)).status,
  ).toBe(404);
  expect((await file(check.id, created.id)).status).toBe(404);
  owner = ownerA;
  // Entitlement is re-checked on every download.
  features = [];
  expect((await file(check.id, created.id)).status).toBe(403);
  features = ["verification-report"];
  expect((await file(check.id, created.id)).status).toBe(200);
});

it("allows one active report per Owner, cancels it, and keeps only the newest report of a Check", async () => {
  const check = await checked();
  const first = ReportResponse.parse(
    await (await create(check.id)).json(),
  ).data;
  const second = await create(check.id);
  expect(second.status).toBe(409);
  expect((await second.json()).type).toContain("report-busy");
  const cancelled = await fetch(
    `${api}/v2/checks/${check.id}/reports/${first.id}`,
    { method: "DELETE" },
  );
  expect(cancelled.status).toBe(200);
  expect((await ready(check.id, first.id)).state).toBe("cancelled");
  expect((await file(check.id, first.id)).status).toBe(409);
});

it("fails a report whose text no embedded font can show, with a clear failure and no file", async () => {
  const response = await fetch(`${api}/v2/checks`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      references: [{ originalText: "東京の研究 (2020)", fields }],
    }),
  });
  const check = CheckResponse.parse(await response.json()).data;
  for await (const frame of readSseFrames(
    (await fetch(`${api}/v2/checks/${check.id}/events`)).body!,
  ))
    void frame;
  const job = ReportResponse.parse(await (await create(check.id)).json()).data;
  const finished = await ready(check.id, job.id);
  expect(finished.state).toBe("failed");
  expect(finished.failure).toBe("unsupported-character");
  expect((await file(check.id, job.id)).status).toBe(409);
});

async function checkedWith(
  references: { originalText: string; fields: object }[],
) {
  const response = await fetch(`${api}/v2/checks`, {
    method: "POST",
    headers,
    body: JSON.stringify({ references }),
  });
  const check = CheckResponse.parse(await response.json()).data;
  for await (const frame of readSseFrames(
    (await fetch(`${api}/v2/checks/${check.id}/events`)).body!,
  ))
    void frame;
  return CheckResponse.parse(
    await (await fetch(`${api}/v2/checks/${check.id}`)).json(),
  ).data;
}
async function download(checkId: string, body: unknown) {
  const job = ReportResponse.parse(
    await (await create(checkId, body)).json(),
  ).data;
  expect((await ready(checkId, job.id)).state).toBe("ready");
  const bytes = new Uint8Array(
    await (await file(checkId, job.id)).arrayBuffer(),
  );
  return { bytes, pdf: await inspectPdf(bytes) };
}

it("writes a German report in reading order with overview first, one numbered section per Reference, and the manual judgment beside the unchanged system Verdict", async () => {
  const check = await checkedWith([
    { originalText: originalText, fields },
    {
      originalText: "Zweite Referenz: Größe & Maß (2010)",
      fields: { ...fields, issued: { literal: "2010" } },
    },
  ]);
  const second = check.references[1]!;
  const override = await fetch(
    `${api}/v2/checks/${check.id}/references/2/manual-override`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        expectedRevision: second.revisions.length,
        resultId: second.results[0]!.id,
        expectedOverrideId: null,
        verdict: "correct",
      }),
    },
  );
  expect(override.status).toBe(200);
  const { bytes, pdf } = await download(check.id, {
    language: "de",
    style: "apa",
    documentName: "Bachelorarbeit Größe.docx",
  });
  expect(rawCatalog(bytes).language).toBe("de");
  expect(pdf.title).toBe("Prüfbericht – Bachelorarbeit Größe.docx");
  const headings = pdf.pages.flatMap((page) =>
    roles(page.tree).filter((role) => /^H\d$/u.test(role)),
  );
  expect(headings).toEqual(["H1", "H2", "H2", "H2"]);
  const text = pdf.text;
  const order = ["Prüfbericht", "Überblick", "Referenz 1", "Referenz 2"].map(
    (heading) => text.indexOf(heading),
  );
  expect(order.every((at) => at >= 0)).toBe(true);
  expect(order).toEqual([...order].sort((a, b) => a - b));
  // Diacritics survive the Unicode mapping, so they are extractable.
  expect(text).toContain("Zweite Referenz: Größe & Maß (2010)");
  expect(text).toContain("Manuelles Urteil: Korrekt");
  expect(text).toContain(
    `Ursprüngliches Systemurteil: ${second.outcome.kind === "verdict" ? "Existiert, mit Abweichungen" : "?"}`,
  );
  expect(text).toContain("Version der Bewertungsregeln");
  // A long version identifier may wrap; its characters must all be there.
  const outcome = check.references[0]!.outcome;
  if (outcome.kind !== "verdict") throw new Error("expected a Verdict");
  expect(text.replace(/\s+/gu, "")).toContain(outcome.scoringRules.version);
  expect(text).toContain("Bester Treffer: 10.1038/nphys1170");
  expect(text).toContain("https://doi.org/10.1038/nphys1170");
  expect(text).toContain("Seite 1 von");
});

it("exposes each link to assistive technology as a Link element that owns its annotation", async () => {
  const check = await checked();
  const { bytes } = await download(check.id, { language: "en", style: "apa" });
  const links = rawLinks(bytes);
  expect(links.uris).toEqual(["https://doi.org/10.1038/nphys1170"]);
  expect(links.annotations).toBeGreaterThan(0);
  expect(links.withStructParent).toBe(links.annotations);
  expect(links.objectReferences).toBe(links.annotations);
  expect(links.linkElements).toBe(1);
});

async function running() {
  const held = fixtures.hold("/api/handles/10.5555/report-held");
  const response = await fetch(`${api}/v2/checks`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      references: [
        { originalText, fields },
        {
          originalText: "Still being checked (2020)",
          fields: { ...fields, DOI: "10.5555/report-held" },
        },
      ],
    }),
  });
  const check = CheckResponse.parse(await response.json()).data;
  await held.arrived;
  await expect
    .poll(async () => {
      const current = CheckResponse.parse(
        await (await fetch(`${api}/v2/checks/${check.id}`)).json(),
      ).data;
      return current.references[0]!.outcome.kind;
    })
    .toBe("verdict");
  return { check, held };
}

it("labels a running Check's report as an intermediate snapshot, keeps unfinished Status, and never changes the file afterwards", async () => {
  const { check, held } = await running();
  try {
    const created = ReportResponse.parse(
      await (await create(check.id, { language: "en", style: "apa" })).json(),
    ).data;
    const finished = await ready(check.id, created.id);
    expect(finished.intermediate).toBe(true);
    const first = new Uint8Array(
      await (await file(check.id, created.id)).arrayBuffer(),
    );
    const { text } = await inspectPdf(first);
    expect(text).toContain("Intermediate snapshot as of");
    expect(text).toContain("Check state: Running");
    expect(text).toContain("Status: Running");
    // The later result of the running Reference is not in this report.
    held.release();
    await expect
      .poll(
        async () =>
          CheckResponse.parse(
            await (await fetch(`${api}/v2/checks/${check.id}`)).json(),
          ).data.state,
      )
      .toBe("ended");
    const again = new Uint8Array(
      await (await file(check.id, created.id)).arrayBuffer(),
    );
    expect(Buffer.from(again).equals(Buffer.from(first))).toBe(true);
  } finally {
    held.release();
  }
});

it("keeps the Status of cancelled References in a final report", async () => {
  const { check, held } = await running();
  try {
    const cancel = await fetch(`${api}/v2/checks/${check.id}/cancel`, {
      method: "POST",
    });
    expect(cancel.status).toBe(200);
    const { pdf } = await download(check.id, { language: "de", style: "apa" });
    expect(pdf.text).toContain("Endstand vom");
    expect(pdf.text).toContain("Status: Abgebrochen");
    expect(pdf.text).not.toContain("Zwischenstand");
  } finally {
    held.release();
  }
});
