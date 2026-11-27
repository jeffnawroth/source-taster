// SPDX-License-Identifier: AGPL-3.0-or-later
// #308: content operations wait behind the content sweep's exclusive lock.
// The sweep may hold that lock for up to 30 s, so a waiting read must not
// expire after Prisma's 5 s interactive-transaction default and answer 500.
import pg from "pg";
import { afterAll, beforeAll, expect, it, vi } from "vitest";
import { CheckResponse } from "@source-taster/contract-verification";
import { startTestService } from "./support/service.ts";

vi.setConfig({ testTimeout: 60_000 });

const holdMs = 7_000;
let service: Awaited<ReturnType<typeof startTestService>>;
let db: pg.Client;

beforeAll(async () => {
  service = await startTestService(
    Number(process.env.SOURCE_TASTER_TEST_CONTENT_LOCK_PORT ?? 3611),
  );
  const owned = new URL(service.adminUrl);
  owned.pathname = new URL(service.appUrl).pathname;
  db = new pg.Client({ connectionString: owned.toString() });
  await db.connect();
});
afterAll(async () => {
  await db?.end();
  await service?.stop();
});

it("a Check read waits out a content-lock hold longer than 5 s instead of failing", async () => {
  const created = await fetch(`${service.apiUrl}/v1/checks`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text: "Doe, J. (2020). A study of things." }),
  });
  expect(created.status).toBe(201);
  const { id } = CheckResponse.parse(await created.json()).data;

  // The same exclusive lock the content sweep takes (store.ts `sweep`).
  await db.query("BEGIN");
  await db.query("SELECT pg_advisory_xact_lock(910012)::text");
  const started = Date.now();
  const read = fetch(`${service.apiUrl}/v1/checks/${id}`);
  await new Promise((resolve) => setTimeout(resolve, holdMs));
  await db.query("COMMIT");
  const response = await read;

  expect(response.status).toBe(200);
  expect(Date.now() - started).toBeGreaterThanOrEqual(holdMs);
  expect(CheckResponse.parse(await response.json()).data.id).toBe(id);
});
