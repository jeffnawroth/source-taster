// SPDX-License-Identifier: AGPL-3.0-or-later
// ADR-0005/0012 content lifetimes. HTTP/SSE only, real PostgreSQL and processes;
// the owned test composition controls the domain clock.
import { afterEach, beforeEach, expect, it } from "vitest";
import { CheckResponse } from "@source-taster/contract-verification/v2";
import { lifecycleService } from "./support/lifecycle-service.ts";
import { startDoiFixtures } from "./support/doi-fixtures.ts";
import { backup } from "./support/backup.ts";

const HOUR = 60 * 60 * 1000;
// Restored copies are served one at a time on the ticket's spare port.
const restoredPort = process.env.SOURCE_TASTER_TEST_RESTORED_PORT ?? "5311";
let fixtures: Awaited<ReturnType<typeof startDoiFixtures>>;
let service: Awaited<ReturnType<typeof lifecycleService>>;
beforeEach(async () => {
  fixtures = await startDoiFixtures();
  service = await lifecycleService(fixtures.env);
});
afterEach(async () => {
  await service?.stop();
  await fixtures?.stop();
});
function request(version: 1 | 2, path: string, init: RequestInit = {}) {
  return fetch(`${service.apiUrl}/v${version}/checks${path}`, {
    ...init,
    headers: { "content-type": "application/json", ...init.headers },
  });
}
async function create(version: 1 | 2 = 2, dois = ["10.1038/nphys1170"]) {
  const res = await request(version, "", {
    method: "POST",
    body: JSON.stringify({
      references: dois.map((DOI) => ({ originalText: DOI, fields: { DOI } })),
    }),
  });
  expect(res.status).toBe(201);
  return CheckResponse.parse(await res.json()).data;
}

it("expires a Check that never started 24 hours after creation, however late its lease expiry is noticed", async () => {
  const v2 = await create(2);
  const v1 = await create(1);
  await service.advance(23 * HOUR);
  // Noticing the lease expiry this late must not move the deadline.
  expect((await request(2, `/${v2.id}`)).status).toBe(200);
  expect((await request(1, `/${v1.id}`)).status).toBe(200);
  await service.advance(1 * HOUR);
  const expired = await request(2, `/${v2.id}`);
  expect(expired.status).toBe(410);
  expect(await expired.json()).toMatchObject({ code: "check-expired" });
  expect((await request(1, `/${v1.id}`)).status).toBe(404);
});

it("counts a started Check's deadline from its lease expiry, not from when the expiry is noticed", async () => {
  const gate = fixtures.hold("/api/handles/10.5555/retention-lease");
  const worker = service.worker();
  await worker.ready;
  const check = await create(2, ["10.5555/retention-lease"]);
  await gate.arrived;
  await worker.kill();
  gate.release();
  await service.advance(23 * HOUR);
  const noticed = await request(2, `/${check.id}`);
  expect(noticed.status).toBe(200);
  expect(CheckResponse.parse(await noticed.json()).data).toMatchObject({
    state: "ended",
    endReason: "lease-expired",
  });
  await service.advance(2 * HOUR);
  expect((await request(2, `/${check.id}`)).status).toBe(410);
});

async function restoredService(
  dump: Awaited<ReturnType<typeof backup>>,
  now: number,
) {
  return lifecycleService(fixtures.env, {
    database: await dump.restore(),
    port: restoredPort,
    now,
  });
}

it("deletes the content and event log at the deadline, so even a later full backup cannot serve it", async () => {
  const sentinel = `Retention sentinel ${crypto.randomUUID()}`;
  const worker = service.worker();
  await worker.ready;
  const res = await request(2, "", {
    method: "POST",
    body: JSON.stringify({
      references: [
        { originalText: sentinel, fields: { DOI: "10.1038/nphys1170" } },
      ],
    }),
  });
  const check = CheckResponse.parse(await res.json()).data;
  await expect
    .poll(async () => {
      const current = await request(2, `/${check.id}`);
      return CheckResponse.parse(await current.json()).data.state;
    })
    .toBe("ended");
  await service.advance(1 * HOUR);
  const liveAt = service.now();

  // Positive control: the same backup and restore path does carry live content.
  const before = await backup(service.adminUrl, service.appUrl, {
    unloggedData: true,
  });
  try {
    const restored = await restoredService(before, liveAt);
    try {
      const served = await fetch(`${restored.apiUrl}/v2/checks/${check.id}`);
      expect(served.status).toBe(200);
      expect(await served.text()).toContain(sentinel);
    } finally {
      await restored.stop();
    }
  } finally {
    await before.discard();
  }

  await service.advance(24 * HOUR);
  await worker.kill();
  // Startup expiry work completes before the web process serves again.
  await service.restartWeb();
  const after = await backup(service.adminUrl, service.appUrl, {
    unloggedData: true,
  });
  try {
    // Boolean only: a failing diff must not print backup contents.
    expect((await after.text()).includes(sentinel)).toBe(false);
    // Even with the clock turned back, the restored copy has nothing to serve.
    const restored = await restoredService(after, liveAt);
    try {
      const read = await fetch(`${restored.apiUrl}/v2/checks/${check.id}`);
      expect(read.status).toBe(410);
      expect(await read.text()).not.toContain(sentinel);
      const replay = await fetch(
        `${restored.apiUrl}/v2/checks/${check.id}/events`,
        { headers: { "last-event-id": `${check.id}:0` } },
      );
      expect(replay.status).toBe(410);
    } finally {
      await restored.stop();
    }
  } finally {
    await after.discard();
  }
}, 120_000);
