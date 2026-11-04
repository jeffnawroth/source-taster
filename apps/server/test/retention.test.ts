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
  service = await lifecycleService(fixtures.env, {
    now: Date.UTC(2026, 9, 31, 12),
  });
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
      expect(served.status, served.ok ? undefined : await served.text()).toBe(
        200,
      );
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

it("operator exports contain no plaintext and cannot restore transient content without daily keys", async () => {
  const sentinel = `Private reference ${crypto.randomUUID()}`;
  const res = await request(2, "", {
    method: "POST",
    body: JSON.stringify({
      references: [{ originalText: sentinel, fields: { title: sentinel } }],
    }),
  });
  const check = CheckResponse.parse(await res.json()).data;
  const dump = await backup(service.adminUrl, service.appUrl, {
    unloggedData: false,
  });
  try {
    expect((await dump.text()).includes(sentinel)).toBe(false);
    const restored = await restoredService(dump, service.now());
    try {
      for (const path of ["", "/events"]) {
        const response = await fetch(
          `${restored.apiUrl}/v2/checks/${check.id}${path}`,
        );
        expect(response.status).toBe(410);
      }
    } finally {
      await restored.stop();
    }
  } finally {
    await dump.discard();
  }
}, 120_000);

it("Re-checks, revisions, membership edits, reconnect and downloads keep the original end deadline", async () => {
  const check = await create();
  await service.advance(5_000);
  const worker = service.worker();
  await worker.ready;
  await expect
    .poll(
      async () =>
        CheckResponse.parse(await (await request(2, `/${check.id}`)).json())
          .data.state,
    )
    .toBe("ended");
  await service.advance(23 * HOUR);
  const edit = await request(2, `/${check.id}/references/1/revisions`, {
    method: "POST",
    body: JSON.stringify({
      expectedRevision: 1,
      fields: { DOI: "10.1038/nphys1170", title: "User correction" },
      recheck: true,
    }),
  });
  expect(edit.status).toBe(200);
  await expect
    .poll(async () => {
      const current = CheckResponse.parse(
        await (await request(2, `/${check.id}`)).json(),
      ).data;
      return current.references[0]?.results.length;
    })
    .toBe(2);
  const current = CheckResponse.parse(
    await (await request(2, `/${check.id}`)).json(),
  ).data;
  const list = await request(2, `/${check.id}/references`, {
    method: "POST",
    body: JSON.stringify({
      expectedEventSeq: current.lastEventSeq,
      remove: [],
      add: [
        {
          originalText: "Added reference",
          fields: { DOI: "10.1038/nphys1170" },
          authorsTruncated: false,
        },
      ],
    }),
  });
  expect(list.status).toBe(200);
  expect(
    (await request(2, `/${check.id}/lease`, { method: "POST" })).status,
  ).toBe(200);
  const download = () =>
    request(2, `/${check.id}/export`, {
      method: "POST",
      body: JSON.stringify({ format: "csl-json", mode: "original" }),
    });
  expect((await download()).status).toBe(200);
  await service.advance(HOUR - 5_000);
  expect((await download()).status).toBe(200);
  await service.advance(5_000);
  for (const path of ["", "/events"])
    expect((await request(2, `/${check.id}${path}`)).status).toBe(410);
  expect((await download()).status).toBe(410);
  const recheck = await request(2, `/${check.id}/references/1/recheck`, {
    method: "POST",
    body: JSON.stringify({ expectedRevision: 2 }),
  });
  expect(recheck.status).toBe(410);
}, 60_000);

it("a full restore with an expired daily key fails closed before traffic, while live maintenance preserves the Check", async () => {
  const check = await create();
  const dump = await backup(service.adminUrl, service.appUrl, {
    unloggedData: true,
  });
  try {
    await service.advance(13 * HOUR); // crosses UTC midnight, before Check expiry
    expect((await request(2, `/${check.id}`)).status).toBe(200);
    const restored = await restoredService(dump, service.now());
    try {
      expect(
        (await fetch(`${restored.apiUrl}/v2/checks/${check.id}`)).status,
      ).toBe(410);
    } finally {
      await restored.stop();
    }
  } finally {
    await dump.discard();
  }
}, 120_000);

it("expires suggestions and a running replay, rejecting late Re-check work and worker recovery", async () => {
  const worker = service.worker();
  await worker.ready;
  const check = await create();
  await expect
    .poll(
      async () =>
        CheckResponse.parse(await (await request(2, `/${check.id}`)).json())
          .data.state,
    )
    .toBe("ended");
  await service.advance(23 * HOUR);
  const gate = fixtures.hold("/api/handles/10.5555/retention-late");
  try {
    const revision = await request(2, `/${check.id}/references/1/revisions`, {
      method: "POST",
      body: JSON.stringify({
        expectedRevision: 1,
        fields: { DOI: "10.5555/retention-late" },
        recheck: true,
      }),
    });
    expect(revision.status).toBe(200);
    await gate.arrived;
    const running = CheckResponse.parse(await revision.json()).data;
    const replay = await request(2, `/${check.id}/events`, {
      headers: { "last-event-id": running.lastEventCursor },
      signal: AbortSignal.timeout(15_000),
    });
    expect(replay.status).toBe(200);
    const drained = replay.text();
    await service.advance(HOUR);
    gate.release();
    await drained;
    const recoveredWorker = service.worker();
    await recoveredWorker.ready;
    for (const path of ["", "/events"])
      expect((await request(2, `/${check.id}${path}`)).status).toBe(410);
    const suggestion = await request(2, `/${check.id}/bibliography`, {
      method: "POST",
      body: JSON.stringify({ style: "apa" }),
    });
    expect(suggestion.status).toBe(410);
    const otherOwner = await request(2, `/${check.id}`, {
      headers: { "Test-Owner": "other-owner" },
    });
    expect(otherOwner.status).toBe(404);
  } finally {
    gate.release();
  }
}, 60_000);

it("starts the 24-hour deadline at the first end, even when a renewed Check runs longer than a day", async () => {
  await service.stop();
  service = await lifecycleService(
    {
      ...fixtures.env,
      TEST_CLIENT_LEASE_MS: String(48 * HOUR),
      TEST_WORKER_CLAIM_MS: String(48 * HOUR),
    },
    { now: Date.UTC(2026, 9, 31, 12) },
  );
  const gate = fixtures.hold("/api/handles/10.5555/retention-long-run");
  try {
    const worker = service.worker();
    await worker.ready;
    const check = await create(2, ["10.5555/retention-long-run"]);
    await gate.arrived;
    await service.advance(24 * HOUR);
    expect((await request(2, `/${check.id}`)).status).toBe(200);
    expect(
      (await request(2, `/${check.id}/cancel`, { method: "POST" })).status,
    ).toBe(200);
    gate.release();
    await service.advance(23 * HOUR);
    expect((await request(2, `/${check.id}`)).status).toBe(200);
    await service.advance(HOUR);
    expect((await request(2, `/${check.id}`)).status).toBe(410);
  } finally {
    gate.release();
  }
}, 60_000);

it("encrypts the complete bibliography document in operator exports and preserves selection through daily rollover", async () => {
  const sentinel = `Unselected document ${crypto.randomUUID()}`;
  const reference = "Doe, J. (2020). Signal maps. Example Press.";
  const text = `${sentinel}\nReferences\n${reference}`;
  const res = await request(2, "", {
    method: "POST",
    body: JSON.stringify({
      document: {
        text,
        regions: [{ start: text.indexOf(reference), end: text.length }],
      },
    }),
  });
  expect(res.status).toBe(201);
  const check = CheckResponse.parse(await res.json()).data;
  expect(check.document?.text).toBe(text);
  const dump = await backup(service.adminUrl, service.appUrl, {
    unloggedData: false,
  });
  try {
    expect((await dump.text()).includes(sentinel)).toBe(false);
    const restored = await restoredService(dump, service.now());
    try {
      expect(
        (await fetch(`${restored.apiUrl}/v2/checks/${check.id}`)).status,
      ).toBe(410);
    } finally {
      await restored.stop();
    }
  } finally {
    await dump.discard();
  }
  await service.advance(13 * HOUR);
  const current = await request(2, `/${check.id}`);
  expect(current.status).toBe(200);
  expect(CheckResponse.parse(await current.json()).data.document).toEqual(
    check.document,
  );
  await service.advance(12 * HOUR);
  expect((await request(2, `/${check.id}`)).status).toBe(410);
  const expired = await backup(service.adminUrl, service.appUrl, {
    unloggedData: true,
  });
  try {
    const exported = await expired.text();
    expect(exported.includes(sentinel)).toBe(false);
    // No encrypted document survives on the content-free tombstone either.
    expect(exported.includes('"sealed"')).toBe(false);
  } finally {
    await expired.discard();
  }
}, 120_000);
