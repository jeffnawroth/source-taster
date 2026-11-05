// SPDX-License-Identifier: AGPL-3.0-or-later
// Synthetic adapter-edge witnesses, never approved provider recordings.
import { once } from "node:events";
import { serve } from "@hono/node-server";
import pg from "pg";
import { afterAll, beforeAll, beforeEach, expect, it } from "vitest";
import { createParser } from "@source-taster/core";
import {
  CheckResponse,
  SelectionPreviewResponse,
} from "@source-taster/contract-verification/v2";
import { TextStructuringResponse } from "@source-taster/contract-verification/document";
import { fail } from "../src/http/problems.ts";
import { createApp } from "../src/http/app.ts";
import { createPrisma } from "../src/db/prisma.ts";
import { createQueue } from "../src/checks/queue.ts";
import { createCheckStore } from "../src/checks/store.ts";
import { listenForEvents } from "../src/checks/events.ts";
import { LOCAL_OWNER } from "../src/entitlements.ts";
import { setupDatabase } from "../scripts/db-setup.ts";
import { startProcess, testDatabase } from "./support/processes.ts";
import { startDoiFixtures } from "./support/doi-fixtures.ts";

const database = testDatabase();
const db = createPrisma(database.appUrl);
let features: string[] | null = null;
let calls = 0;
let reservations = 0;
let guest = false;
let authorityDown = false;
let configured = true;
let configurationIdentity = "controlled-source-a";
let hold: ((signal: AbortSignal) => Promise<unknown>) | undefined;
let responseForInput: ((input: string) => unknown) | undefined;
let responseValue: unknown = { references: [] };
let unavailable = false;
let revoke = false;
const synthetic = {
  model: "synthetic-ai103-v1",
  configuration: {
    mode: "synthetic" as const,
    providerPath: "synthetic-adapter-edge",
    modelId: "synthetic-ai103-v1",
    region: "eu-central-1",
    promptVersion: "span/1",
    schemaVersion: "span/1",
    sampling: { temperature: 0 },
    determinism: "synthetic exact witness",
    chunkSize: 512,
    processingAndStorageCountries: ["DE" as const],
    zeroRetention: true as const,
    qualificationRecord: "unqualified-synthetic",
  },
  extract: () => Promise.resolve([]),
  get extractSpans() {
    return configured
      ? async (input: string, signal: AbortSignal) => {
          calls++;
          if (hold) return hold(signal);
          if (revoke) features = [];
          if (unavailable) throw new Error("synthetic unavailable");
          return responseForInput ? responseForInput(input) : responseValue;
        }
      : undefined;
  },
};

beforeEach(() => {
  features = ["ai-extraction"];
  calls = 0;
  reservations = 0;
  guest = false;
  authorityDown = false;
  configured = true;
  configurationIdentity = "controlled-source-a";
  responseForInput = undefined;
  hold = undefined;
  unavailable = false;
  revoke = false;
  responseValue = {
    references: [
      {
        originalText: "Doe (2020). Exact maps.",
        span: { start: 13, end: 36 },
        csl: {
          title: "Exact maps",
          DOI: "10.5555/INVENTED",
          issued: { literal: "2020" },
        },
        spans: {
          title: { start: 25, end: 35 },
          issued: { start: 18, end: 22 },
        },
      },
    ],
  };
});

let stop: () => Promise<void>;
// Exclusive per-run port; the default only matters for an unconfigured run.
const apiPort = Number(process.env.SOURCE_TASTER_TEST_SERVICE_PORT ?? 5002);
const api = `http://127.0.0.1:${apiPort}`;
beforeAll(async () => {
  await setupDatabase(database.adminUrl, database.appUrl);
  const boss = await createQueue(database.appUrl);
  const events = await listenForEvents(database.appUrl);
  const app = createApp({
    structuring: createParser(),
    checks: createCheckStore(db, boss),
    events,
    heartbeatMs: 100,
    referenceLimit: 1000,
    extraction: synthetic,
    // Controlled state-machine identity at the HTTP composition seam; never qualification.
    configuration: {
      identity: () => configurationIdentity,
      extraction: () => synthetic,
      scope: (_request, operation) => operation(),
    },
    entitlements: {
      resolve: () =>
        Promise.resolve({
          ...LOCAL_OWNER,
          ...(guest ? { guestContextId: "synthetic-guest" } : {}),
        }),
      quota: {
        snapshot: () => {
          if (authorityDown) fail("authority-unavailable");
          return Promise.resolve({
            consumed: 0,
            remaining: 100,
            granted: 100,
            reserved: 0,
            warning: "none",
            grants: [],
            features: features ?? [],
          });
        },
        reserve: (_owner, _checkId, _key, slots) => {
          reservations++;
          return Promise.resolve({
            free: [],
            reserved: slots.length,
            quota: {
              consumed: 0,
              remaining: 100 - slots.length,
              granted: 100,
              reserved: slots.length,
              warning: "none",
              grants: [],
              features: features ?? [],
            },
          });
        },
        release: async () => {},
        settle: async () => {},
      },
    },
  });
  const server = serve({
    fetch: app.fetch,
    hostname: "127.0.0.1",
    port: apiPort,
  });
  await once(server, "listening");
  stop = async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    await events.close();
    await boss.stop();
    await db.$disconnect();
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

it("uses the parser with an explicit feature-scope reason and no structuring bill", async () => {
  features = [];
  const response = await fetch(`${api}/v2/structurings`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text: "10.5555/EXACT" }),
  });
  expect(response.status).toBe(200);
  const { data } = TextStructuringResponse.parse(await response.json());
  expect(data.structuring).toMatchObject({
    ai: { reason: "feature-unavailable", upgrade: true },
    quotaConsumed: 0,
    references: [
      { csl: { DOI: "10.5555/EXACT" }, structuring: { path: "parser" } },
    ],
  });
});

async function structure(text: string) {
  return fetch(`${api}/v2/structurings`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text }),
  });
}
it("extracts an embedded Reference using exact spans and isolates ungrounded additions", async () => {
  features = ["ai-extraction"];
  calls = 0;
  const text = "We discussed Doe (2020). Exact maps. yesterday.";
  responseValue = {
    references: [
      {
        originalText: "Doe (2020). Exact maps.",
        span: { start: 13, end: 36 },
        csl: {
          title: "Exact maps",
          DOI: "10.5555/INVENTED",
          issued: { literal: "2020" },
        },
        spans: {
          title: { start: 25, end: 35 },
          issued: { start: 18, end: 22 },
        },
      },
    ],
  };
  const response = await structure(text);
  expect(response.status).toBe(200);
  const { data } = TextStructuringResponse.parse(await response.json());
  expect(data.structuring.references).toMatchObject([
    {
      originalText: "Doe (2020). Exact maps.",
      span: { start: 13, end: 36 },
      csl: { title: "Exact maps", issued: { literal: "2020" } },
      fieldSources: {
        title: { raw: "Exact maps", span: { start: 25, end: 35 } },
      },
      structuring: { path: "ai" },
      ai: {
        notice: "ai-can-be-wrong",
        proposals: [
          { field: "DOI", value: "10.5555/INVENTED", reason: "ungrounded" },
        ],
      },
    },
  ]);
  expect(data.structuring.references[0]?.csl.DOI).toBeUndefined();
  expect(data.structuring.quotaConsumed).toBe(0);
  expect(calls).toBe(1);
});

it("retains a grounded embedded Reference without a parser-recognized year or identifier", async () => {
  const text = "We discussed Doe: Exact maps yesterday.";
  responseValue = {
    references: [
      {
        originalText: "Doe: Exact maps",
        span: { start: 13, end: 28 },
        csl: { title: "Exact maps" },
        spans: { title: { start: 18, end: 28 } },
      },
    ],
  };
  const response = await structure(text);
  expect(response.status).toBe(200);
  const { data } = TextStructuringResponse.parse(await response.json());
  expect(data.structuring.references).toMatchObject([
    {
      originalText: "Doe: Exact maps",
      span: { start: 13, end: 28 },
      csl: { title: "Exact maps" },
      fieldSources: {
        title: { raw: "Exact maps", span: { start: 18, end: 28 } },
      },
      structuring: { path: "ai" },
      ai: { notice: "ai-can-be-wrong" },
    },
  ]);
  expect(data.structuring.ai?.fallbacks).toEqual([]);
});

it("preserves the reviewed extraction as immutable evidence and only adopts a proposal by a user revision", async () => {
  const preview = TextStructuringResponse.parse(
    await (
      await structure("We discussed Doe (2020). Exact maps. yesterday.")
    ).json(),
  ).data.structuring;
  const response = await fetch(`${api}/v2/checks`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      extraction: {
        text: "We discussed Doe (2020). Exact maps. yesterday.",
        result: preview,
      },
    }),
  });
  expect(response.status).toBe(201);
  const check = CheckResponse.parse(await response.json()).data;
  expect(check.references[0]!.revisions[0]!.reference).toMatchObject({
    structuring: { path: "ai" },
    span: { start: 13, end: 36 },
  });
  expect(check.references[0]!.fields.DOI).toBeUndefined();
  const canceled = await fetch(`${api}/v2/checks/${check.id}/cancel`, {
    method: "POST",
  });
  expect(canceled.status).toBe(200);
  const saved = await fetch(
    `${api}/v2/checks/${check.id}/references/1/revisions`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        expectedRevision: 1,
        fields: { ...check.references[0]!.fields, DOI: "10.5555/INVENTED" },
        recheck: false,
      }),
    },
  );
  expect(saved.status).toBe(200);
  const adopted = CheckResponse.parse(await saved.json()).data.references[0]!;
  expect(adopted.revision).toBe(2);
  expect(adopted.fields.DOI).toBe("10.5555/INVENTED");
  expect(adopted.revisions[0]!.reference.structuring.path).toBe("ai");
  expect(adopted.revisions[1]!.reference.structuring.path).toBe("user");
});

it("retries a failed chunk once, then visibly falls back without losing its passage", async () => {
  features = ["ai-extraction"];
  unavailable = true;
  calls = 0;
  const { data } = TextStructuringResponse.parse(
    await (await structure("10.5555/EXACT")).json(),
  );
  expect(calls).toBe(2);
  expect(data.structuring).toMatchObject({
    references: [
      {
        originalText: "10.5555/EXACT",
        csl: { DOI: "10.5555/EXACT" },
        structuring: { path: "parser" },
      },
    ],
    ai: {
      fallbacks: [
        { span: { start: 0, end: 13 }, reason: "provider-unavailable" },
      ],
    },
  });
  unavailable = false;
});
it("rejects invalid offsets with one retry rather than accepting a field outside its original Reference", async () => {
  calls = 0;
  responseValue = {
    references: [
      {
        originalText: "10.5555/EXACT",
        span: { start: 0, end: 13 },
        csl: { DOI: "10.5555/EXACT" },
        spans: { DOI: { start: -1, end: 13 } },
      },
    ],
  };
  const { data } = TextStructuringResponse.parse(
    await (await structure("10.5555/EXACT")).json(),
  );
  expect(calls).toBe(2);
  expect(data.structuring.ai?.fallbacks).toEqual([
    { span: { start: 0, end: 13 }, reason: "invalid-output" },
  ]);
});
it("denies an in-flight feature revocation before publishing rather than masking it as parser fallback", async () => {
  revoke = true;
  calls = 0;
  const response = await structure("10.5555/EXACT");
  expect(response.status).toBe(403);
  expect(calls).toBe(1);
  revoke = false;
});
it("does not dispatch for Free feature scope", async () => {
  features = [];
  calls = 0;
  const { data } = TextStructuringResponse.parse(
    await (await structure("10.5555/EXACT")).json(),
  );
  expect(calls).toBe(0);
  expect(data.structuring.ai).toMatchObject({
    reason: "feature-unavailable",
    upgrade: true,
  });
});

it("keeps document offsets and drops AI slots when their Bibliography selection is removed", async () => {
  features = ["ai-extraction"];
  responseValue = {
    references: [
      {
        originalText: "10.5555/EXACT",
        span: { start: 0, end: 13 },
        csl: { DOI: "10.5555/EXACT" },
        spans: { DOI: { start: 0, end: 13 } },
      },
    ],
  };
  const text = "Outside\n\n10.5555/EXACT";
  const regions = [{ start: 9, end: 22 }];
  const previewResponse = await fetch(`${api}/v2/structurings`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text, document: true, regions }),
  });
  const preview = TextStructuringResponse.parse(
    await previewResponse.json(),
  ).data;
  expect(preview.structuring.references[0]).toMatchObject({
    span: { start: 9, end: 22 },
    fieldSources: { DOI: { span: { start: 9, end: 22 } } },
  });
  const response = await fetch(`${api}/v2/checks`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      extraction: { text, regions, result: preview.structuring },
    }),
  });
  expect(response.status).toBe(201);
  const check = CheckResponse.parse(await response.json()).data;
  const canceled = CheckResponse.parse(
    await (
      await fetch(`${api}/v2/checks/${check.id}/cancel`, { method: "POST" })
    ).json(),
  ).data;
  const diff = await fetch(`${api}/v2/checks/${check.id}/selection/preview`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      expectedEventSeq: canceled.lastEventSeq,
      regions: [],
    }),
  });
  expect(diff.status).toBe(200);
  expect(SelectionPreviewResponse.parse(await diff.json()).data).toMatchObject({
    removed: [1],
    unchanged: [],
    total: 0,
  });
});

it("structures only newly selected document text and applies the exact reviewed AI preview", async () => {
  responseForInput = (input: string) => ({
    references: [
      {
        originalText: input,
        span: { start: 0, end: input.length },
        csl: { DOI: input },
        spans: { DOI: { start: 0, end: input.length } },
      },
    ],
  });
  const text = "10.5555/FIRST\n\n10.5555/SECOND";
  const regions = [{ start: 0, end: 13 }];
  const preview = TextStructuringResponse.parse(
    await (
      await fetch(`${api}/v2/structurings`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text, document: true, regions }),
      })
    ).json(),
  ).data.structuring;
  const response = await fetch(`${api}/v2/checks`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ extraction: { text, regions, result: preview } }),
  });
  const check = CheckResponse.parse(await response.json()).data;
  const canceled = CheckResponse.parse(
    await (
      await fetch(`${api}/v2/checks/${check.id}/cancel`, { method: "POST" })
    ).json(),
  ).data;
  calls = 0;
  const request = {
    expectedEventSeq: canceled.lastEventSeq,
    regions: [{ start: 0, end: text.length }],
  };
  const diff = await fetch(`${api}/v2/checks/${check.id}/selection/preview`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(request),
  });
  expect(diff.status).toBe(200);
  const reviewed = SelectionPreviewResponse.parse(await diff.json()).data;
  expect(reviewed.addedReferences).toMatchObject([
    { structuring: { path: "ai" }, span: { start: 15, end: 29 } },
  ]);
  expect(calls).toBe(1);
  const applied = await fetch(`${api}/v2/checks/${check.id}/selection`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ...request, prepared: reviewed.prepared }),
  });
  expect(applied.status).toBe(200);
  const updated = CheckResponse.parse(await applied.json()).data;
  expect(updated.references[0]!.revision).toBe(1);
  expect(updated.references[1]!.revisions[0]!.reference.structuring.path).toBe(
    "ai",
  );
  expect(calls).toBe(1);
});

it("explains the parser path to Guests and does not invent a paid grant", async () => {
  guest = true;
  const { data } = TextStructuringResponse.parse(
    await (await structure("10.5555/EXACT")).json(),
  );
  expect(data.structuring.ai).toMatchObject({ reason: "guest", upgrade: true });
  expect(calls).toBe(0);
  expect(reservations).toBe(0);
});
it("returns explicit unavailable configuration for an eligible Owner without dispatch", async () => {
  configured = false;
  const { data } = TextStructuringResponse.parse(
    await (await structure("10.5555/EXACT")).json(),
  );
  expect(data.structuring.ai).toMatchObject({
    reason: "configuration-unavailable",
    upgrade: false,
  });
  expect(calls).toBe(0);
  expect(reservations).toBe(0);
});
it("fails closed before dispatch when current feature authority is unavailable", async () => {
  authorityDown = true;
  expect((await structure("10.5555/EXACT")).status).toBe(503);
  expect(calls).toBe(0);
  expect(reservations).toBe(0);
});
it("rejects tampered previews and paid-scope revocation before creating a Check", async () => {
  const text = "We discussed Doe (2020). Exact maps. yesterday.";
  const result = TextStructuringResponse.parse(
    await (await structure(text)).json(),
  ).data.structuring;
  expect(reservations).toBe(0);
  const tampered = structuredClone(result);
  tampered.references[0]!.csl.DOI = "10.5555/INVENTED";
  const create = (reviewed: unknown) =>
    fetch(`${api}/v2/checks`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ extraction: { text, result: reviewed } }),
    });
  expect((await create(tampered)).status).toBe(400);
  features = [];
  expect((await create(result)).status).toBe(403);
  expect(reservations).toBe(0);
});
it("cancels a provider request when the client cancels Structuring, without retry or billing", async () => {
  let started!: () => void;
  const dispatched = new Promise<void>((r) => {
    started = r;
  });
  let canceled!: () => void;
  const observed = new Promise<void>((r) => {
    canceled = r;
  });
  hold = (signal) =>
    new Promise((_, reject) => {
      signal.addEventListener(
        "abort",
        () => {
          canceled();
          reject(new Error("synthetic-canceled"));
        },
        { once: true },
      );
      started();
    });
  const controller = new AbortController();
  const pending = fetch(`${api}/v2/structurings`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text: "10.5555/EXACT" }),
    signal: controller.signal,
  });
  const rejected = expect(pending).rejects.toThrow();
  await dispatched;
  controller.abort();
  await rejected;
  await Promise.race([
    observed,
    new Promise((_, reject) =>
      setTimeout(
        () =>
          reject(
            new Error(
              "provider cancellation did not follow client cancellation",
            ),
          ),
        1000,
      ),
    ),
  ]);
  expect(calls).toBe(1);
  expect(reservations).toBe(0);
});

it("retries and falls back when overlapping AI spans would duplicate a billable Reference", async () => {
  const text = "Doe (2020). 10.5555/EXACT";
  responseValue = {
    references: [
      {
        originalText: text,
        span: { start: 0, end: 25 },
        csl: { DOI: "10.5555/EXACT" },
        spans: { DOI: { start: 12, end: 25 } },
      },
      {
        originalText: "10.5555/EXACT",
        span: { start: 12, end: 25 },
        csl: { DOI: "10.5555/EXACT" },
        spans: { DOI: { start: 12, end: 25 } },
      },
    ],
  };
  const { data } = TextStructuringResponse.parse(
    await (await structure(text)).json(),
  );
  expect(calls).toBe(2);
  expect(data.structuring.references).toHaveLength(1);
  expect(data.structuring.references[0]?.structuring.path).toBe("parser");
});

it("retries only the timed-out chunk and keeps the successful chunk's grounded AI provenance", async () => {
  const first = "10.5555/FIRST " + "x".repeat(300);
  const second = "10.5555/SECOND " + "y".repeat(300);
  responseForInput = (input) => {
    if (input.includes("FIRST"))
      throw new DOMException("synthetic provider timeout", "TimeoutError");
    return {
      references: [
        {
          originalText: "10.5555/SECOND",
          span: { start: 0, end: 14 },
          csl: { DOI: "10.5555/SECOND" },
          spans: { DOI: { start: 0, end: 14 } },
        },
      ],
    };
  };
  const { data } = TextStructuringResponse.parse(
    await (await structure(`${first}\n\n${second}`)).json(),
  );
  expect(calls).toBe(3);
  expect(data.structuring.references.map((r) => r.structuring.path)).toEqual([
    "parser",
    "ai",
  ]);
  expect(data.structuring.references[1]?.span).toEqual({
    start: 316,
    end: 330,
  });
  expect(data.structuring.ai?.fallbacks).toEqual([
    { span: { start: 0, end: 314 }, reason: "timeout" },
  ]);
  expect(reservations).toBe(0);
});

it("uses the same authorized grounded path for direct v2 Check intake", async () => {
  const response = await fetch(`${api}/v2/checks`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      text: "We discussed Doe (2020). Exact maps. yesterday.",
    }),
  });
  expect(response.status).toBe(201);
  const check = CheckResponse.parse(await response.json()).data;
  expect(check.references[0]?.revisions[0]?.provenance).toBe("ai");
  expect(check.references[0]?.fields.DOI).toBeUndefined();
  expect(calls).toBe(1);
  expect(reservations).toBe(1);
  await fetch(`${api}/v2/checks/${check.id}/cancel`, { method: "POST" });
});

it("retains exact name-part and native arXiv provenance through the signed preview contract", async () => {
  const text = "Doe, Jane (2020). 2401.00001";
  responseValue = {
    references: [
      {
        originalText: text,
        span: { start: 0, end: 28 },
        csl: {
          author: [{ family: "Doe", given: "Jane" }],
          title: "Doe",
          arXiv: "2401.00001",
        },
        spans: {
          "author.0.family": { start: 0, end: 3 },
          "author.0.given": { start: 5, end: 9 },
          title: { start: 0, end: 3 },
          arXiv: { start: 18, end: 28 },
        },
      },
    ],
  };
  const result = TextStructuringResponse.parse(
    await (await structure(text)).json(),
  ).data.structuring;
  expect(result.references[0]?.csl.arXiv).toBe("2401.00001");
  expect(result.references[0]?.fieldSources["author.0.given"]).toMatchObject({
    raw: "Jane",
    span: { start: 5, end: 9 },
    provenance: "ai",
  });
  expect(result.references[0]?.ai?.changedFields).toContain("title");
  const response = await fetch(`${api}/v2/checks`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ extraction: { text, result } }),
  });
  expect(response.status).toBe(201);
  const check = CheckResponse.parse(await response.json()).data;
  expect(check.references[0]?.fields.arXiv).toBe("2401.00001");
  await fetch(`${api}/v2/checks/${check.id}/cancel`, { method: "POST" });
});

it("keeps an ungrounded DOI proposal out of search and scoring until a user revision adopts it", async () => {
  // Synthetic adapter-edge output; the DOI is only a probe for which values the
  // real worker sends to the (fixture) Crossref and handle sources.
  const probe = "10.5555/ai103-probe";
  // The probe Reference has no grounded identifier, so the worker rightly
  // makes no source request for it. A second, grounded DOI in the same Check
  // gives the worker a request that is provably this Check's own.
  const sibling = "10.1038/nphys1170";
  const text = `We discussed Doe (2020). Exact maps. yesterday. Also ${sibling}.`;
  const siblingStart = text.indexOf(sibling);
  responseValue = {
    references: [
      {
        originalText: "Doe (2020). Exact maps.",
        span: { start: 13, end: 36 },
        csl: { title: "Exact maps", DOI: probe },
        spans: { title: { start: 25, end: 35 } },
      },
      {
        originalText: sibling,
        span: { start: siblingStart, end: siblingStart + sibling.length },
        csl: { DOI: sibling },
        spans: {
          DOI: { start: siblingStart, end: siblingStart + sibling.length },
        },
      },
    ],
  };
  const preview = TextStructuringResponse.parse(
    await (await structure(text)).json(),
  ).data.structuring;
  expect(preview.references[0]?.ai?.proposals).toMatchObject([
    { field: "DOI", value: probe },
  ]);
  const fixtures = await startDoiFixtures();
  const worker = startProcess("worker", {
    NODE_ENV: "test",
    SOURCE_TASTER_MODE: "standalone",
    DATABASE_URL: database.appUrl,
    SOURCE_TASTER_PLACEHOLDER_DELAY_MS: "0",
    ...fixtures.env,
  });
  const queried = () =>
    fixtures.requests.filter((r) => r.path.includes(probe)).length;
  const snapshot = async (id: string) =>
    CheckResponse.parse(await (await fetch(`${api}/v2/checks/${id}`)).json())
      .data;
  try {
    const created = await fetch(`${api}/v2/checks`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ extraction: { text, result: preview } }),
    });
    expect(created.status).toBe(201);
    const check = CheckResponse.parse(await created.json()).data;
    await expect
      .poll(async () => (await snapshot(check.id)).state, { timeout: 15_000 })
      .toBe("ended");
    // This Check's worker really ran against the fixture sources: its grounded
    // sibling DOI was searched. A bare request count would be no witness, as
    // another Check's queued job may be served by this worker.
    expect(
      fixtures.requests.some((r) => r.path.toLowerCase().includes(sibling)),
    ).toBe(true);
    // ...but never searched or scored with the quarantined value.
    expect(queried()).toBe(0);
    const ended = await snapshot(check.id);
    expect(ended.references[1]?.outcome.kind).toBe("verdict");
    expect(ended.references[0]?.fields.DOI).toBeUndefined();
    expect(JSON.stringify(ended.references[0]?.results)).not.toContain(probe);
    // Explicit adoption is a legitimate field revision; only then is it used.
    const adopted = await fetch(
      `${api}/v2/checks/${check.id}/references/1/revisions`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          expectedRevision: 1,
          fields: { ...ended.references[0]!.fields, DOI: probe },
          recheck: true,
        }),
      },
    );
    expect(adopted.status).toBe(200);
    await expect.poll(queried, { timeout: 15_000 }).toBeGreaterThan(0);
  } finally {
    await worker.stop();
    await fixtures.stop();
  }
});

it("binds an AI preview to its selected configuration and rejects it after a controlled configuration switch", async () => {
  const text = "We discussed Doe (2020). Exact maps. yesterday.";
  const preview = TextStructuringResponse.parse(
    await (await structure(text)).json(),
  ).data.structuring;
  configurationIdentity = "controlled-source-b";
  const create = (result: unknown) =>
    fetch(`${api}/v2/checks`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ extraction: { text, result } }),
    });
  expect((await create(preview)).status).toBe(400);
  expect(reservations).toBe(0);
  const current = TextStructuringResponse.parse(
    await (await structure(text)).json(),
  ).data.structuring;
  expect((await create(current)).status).toBe(201);
});
