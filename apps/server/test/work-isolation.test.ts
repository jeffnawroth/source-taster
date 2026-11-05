// SPDX-License-Identifier: AGPL-3.0-or-later
// The guard behind #150: work an earlier test left behind must be detected,
// and a worker serving another test's Check must be reported. Owned database
// and queue, no worker process: the guard reads state, it never needs a run.
import { randomUUID } from "node:crypto";
import pg from "pg";
import type { PgBoss } from "pg-boss";
import { afterAll, beforeAll, expect, it } from "vitest";
import { setupDatabase } from "../scripts/db-setup.ts";
import { createQueue, REFERENCE_QUEUE } from "../src/checks/queue.ts";
import { testDatabase } from "./support/processes.ts";
import {
  boundary,
  discardWork,
  expectNoRunnableWork,
  foreignClaims,
  leftoverWork,
  settle,
} from "./support/work-isolation.ts";

const database = testDatabase();
let boss: PgBoss;
let client: pg.Client;

beforeAll(async () => {
  await setupDatabase(database.adminUrl, database.appUrl);
  boss = await createQueue(database.appUrl);
  client = new pg.Client({ connectionString: database.appUrl });
  await client.connect();
});
afterAll(async () => {
  await client?.end();
  await boss?.stop();
  const admin = new pg.Client({ connectionString: database.adminUrl });
  await admin.connect();
  const owned = new URL(database.appUrl);
  await admin.query(
    `DROP DATABASE IF EXISTS ${admin.escapeIdentifier(owned.pathname.slice(1))} WITH (FORCE)`,
  );
  await admin.query(
    `DROP ROLE IF EXISTS ${admin.escapeIdentifier(owned.username)}`,
  );
  await admin.end();
});

async function seedCheck(status: string) {
  const id = randomUUID();
  await client.query(
    `INSERT INTO verification.checks (id, owner_id, actor_id, state, content_expires_at)
     VALUES ($1, 'owner', 'owner', 'running', now() + interval '1 day')`,
    [id],
  );
  await client.query(
    `INSERT INTO verification.reference_slots (check_id, position, original_text, status)
     VALUES ($1, 1, 'x', $2)`,
    [id, status],
  );
  return id;
}
const claim = (checkId: string, progress: string) =>
  client.query(
    `INSERT INTO verification.check_events (check_id, seq, type, payload)
     VALUES ($1, (SELECT coalesce(max(seq), 0) + 1 FROM verification.check_events WHERE check_id = $1), 'reference.updated', $2)`,
    [checkId, { type: "reference.updated", reference: { slot: 1, progress } }],
  );

it("reports a runnable slot and a queued job that a test left behind, and accepts the queue once discarded", async () => {
  await expectNoRunnableWork(database.appUrl);
  const checkId = await seedCheck("running");
  await boss.send(REFERENCE_QUEUE, { checkId, slot: 1 });
  expect(await leftoverWork(database.appUrl)).toMatchObject({
    runningSlots: [{ checkId, slot: 1, claimed: false }],
    liveJobs: [{ queue: REFERENCE_QUEUE, state: "created", checkId }],
  });
  await expect(expectNoRunnableWork(database.appUrl)).rejects.toThrow(
    "left runnable work",
  );
  // Unserved work never settles on its own: a worker-less test cannot pass it.
  expect((await settle(database.appUrl, 300)).runningSlots).toHaveLength(1);
  await discardWork(database.appUrl);
  await expectNoRunnableWork(database.appUrl);
});

it("reports a worker claim on a Check an earlier test created, and nothing else", async () => {
  const earlier = await seedCheck("running");
  const since = await boundary(database.appUrl);
  const own = await seedCheck("running");
  await claim(own, "checking");
  await claim(earlier, "queued");
  expect(await foreignClaims(database.appUrl, since)).toEqual([]);
  await claim(earlier, "checking");
  expect(await foreignClaims(database.appUrl, since)).toEqual([
    { checkId: earlier, slot: 1 },
  ]);
  await discardWork(database.appUrl);
});
