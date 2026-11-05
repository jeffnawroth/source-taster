// SPDX-License-Identifier: AGPL-3.0-or-later
// Test isolation for the Check work queue (#150).
//
// A queued job is only a wake-up: a worker claims whatever Reference slot is
// runnable in the database, whichever Check or test that slot belongs to. So a
// test that ends with runnable work (a slot still `running`, usually with a
// queued job) hands that work to the next worker the file starts, and the next
// test then sees source requests it never caused. Two helpers cover the two
// kinds of test file:
//
//  - files with a running worker call `guardWorkIsolation({ mode: "serve" })`:
//    each test must finish all of its work, and no worker may touch a Check
//    that an earlier test created;
//  - files that start a worker only inside one test call it with
//    `mode: "discard"`: leftover work is neutralised after every test, and the
//    worker-spawning test asserts `expectNoRunnableWork` first.
import pg from "pg";
import { afterEach, beforeEach, expect } from "vitest";
import { BOSS_SCHEMA, PRISMA_SCHEMA } from "../../src/db/schemas.ts";

const LIVE_JOB_STATES = "('created','retry','active')";

async function query<T extends pg.QueryResultRow>(
  appUrl: string,
  sql: string,
  values: unknown[] = [],
) {
  const client = new pg.Client({ connectionString: appUrl });
  await client.connect();
  try {
    return (await client.query<T>(sql, values)).rows;
  } finally {
    await client.end();
  }
}

/** The database's own clock (microseconds): never the skewed test-process clock. */
export async function boundary(appUrl: string) {
  const [row] = await query<{ now: string }>(
    appUrl,
    "SELECT clock_timestamp()::text AS now",
  );
  return row!.now;
}

export interface Leftover {
  /** Slots still `running`: runnable by any worker. */
  runningSlots: { checkId: string; slot: number; claimed: boolean }[];
  /** pg-boss jobs that are queued, retrying or in flight. */
  liveJobs: { id: string; queue: string; state: string; checkId?: string }[];
}

export async function leftoverWork(appUrl: string): Promise<Leftover> {
  const runningSlots = await query<{
    checkId: string;
    slot: number;
    claimed: boolean;
  }>(
    appUrl,
    `SELECT check_id AS "checkId", position AS slot, claim_until IS NOT NULL AS claimed
       FROM ${PRISMA_SCHEMA}.reference_slots WHERE status = 'running' ORDER BY 1, 2`,
  );
  const liveJobs = await query<Leftover["liveJobs"][number]>(
    appUrl,
    `SELECT id::text, name AS queue, state::text, data->>'checkId' AS "checkId"
       FROM ${BOSS_SCHEMA}.job WHERE state IN ${LIVE_JOB_STATES} ORDER BY created_on`,
  );
  return { runningSlots, liveJobs };
}

export const isIdle = (work: Leftover) =>
  work.runningSlots.length === 0 && work.liveJobs.length === 0;

/** Waits until every Check has finished its work and the queue is drained. */
export async function settle(appUrl: string, timeoutMs = 15_000) {
  const deadline = Date.now() + timeoutMs;
  let work = await leftoverWork(appUrl);
  while (!isIdle(work) && Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    work = await leftoverWork(appUrl);
  }
  return work;
}

/**
 * Worker claims, since `since`, of Checks that were created before `since`:
 * a worker serving another test's work. (Only a claim writes `progress:
 * "checking"`; the API never does.)
 */
export async function foreignClaims(appUrl: string, since: string) {
  return query<{ checkId: string; slot: number }>(
    appUrl,
    `SELECT DISTINCT e.check_id AS "checkId", (e.payload->'reference'->>'slot')::int AS slot
       FROM ${PRISMA_SCHEMA}.check_events e
       JOIN ${PRISMA_SCHEMA}.checks c ON c.id = e.check_id
      WHERE c.created_at < $1::timestamptz
        AND e.created_at >= $1::timestamptz
        AND e.payload->'reference'->>'progress' = 'checking'
      ORDER BY 1, 2`,
    [since],
  );
}

/** Cancels every runnable slot and drops every live job. */
export async function discardWork(appUrl: string) {
  const client = new pg.Client({ connectionString: appUrl });
  await client.connect();
  try {
    await client.query("BEGIN");
    await client.query(
      `UPDATE ${PRISMA_SCHEMA}.reference_slots
          SET status = 'cancelled', claim_until = NULL WHERE status = 'running'`,
    );
    await client.query(
      `DELETE FROM ${BOSS_SCHEMA}.job WHERE state IN ${LIVE_JOB_STATES}`,
    );
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    await client.end();
  }
}

const idle: Leftover = { runningSlots: [], liveJobs: [] };

/** Fails when work an earlier test left behind could still reach a worker. */
export async function expectNoRunnableWork(appUrl: string) {
  expect(
    await leftoverWork(appUrl),
    "an earlier test left runnable work that this worker would serve",
  ).toEqual(idle);
}

/**
 * Registers the per-test isolation hooks for the current test file.
 * `appUrl` is the database the file's tests share (its owned application URL).
 */
export function guardWorkIsolation(options: {
  appUrl: () => string;
  mode: "serve" | "discard";
}) {
  let since = "";
  beforeEach(async () => {
    since = await boundary(options.appUrl());
  });
  afterEach(async () => {
    const appUrl = options.appUrl();
    if (options.mode === "discard") {
      await discardWork(appUrl);
      return;
    }
    const left = await settle(appUrl);
    expect(
      await foreignClaims(appUrl, since),
      "a worker served a Check that an earlier test created",
    ).toEqual([]);
    expect(left, "the test ended with work still queued or running").toEqual(
      idle,
    );
  });
}
