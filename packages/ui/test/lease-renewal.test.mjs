// SPDX-License-Identifier: AGPL-3.0-or-later
import { test } from "node:test";
import assert from "node:assert/strict";
import { renewWithRetry } from "../src/lease-renewal.ts";

const failure = (status) =>
  Object.assign(new Error(`HTTP ${status}`), { status });
/** A clock the fake sleep advances, so the budget is exercised without waiting. */
function harness(outcomes, { latency = 0 } = {}) {
  let clock = 0;
  const waits = [];
  let calls = 0;
  const options = {
    renewAfterMs: 1000,
    signal: new AbortController().signal,
    now: () => clock,
    sleep: async (ms) => {
      waits.push(ms);
      clock += ms;
    },
  };
  const renew = async () => {
    const outcome = outcomes[Math.min(calls++, outcomes.length - 1)];
    clock += latency;
    if (outcome instanceof Error) throw outcome;
    return outcome;
  };
  return { options, renew, waits, calls: () => calls };
}

test("one failed renewal is retried inside the remaining lease and then succeeds", async () => {
  const run = harness([failure(500), "renewed"]);
  assert.equal(await renewWithRetry(run.renew, run.options), "renewed");
  assert.deepEqual(run.waits, [250]);
  assert.equal(run.calls(), 2);
});

test("a network failure is retried like a server failure", async () => {
  const run = harness([new TypeError("fetch failed"), "renewed"]);
  assert.equal(await renewWithRetry(run.renew, run.options), "renewed");
  assert.equal(run.calls(), 2);
});

test("retries back off and are bounded: three retries, then the failure is final", async () => {
  const run = harness([failure(503)]);
  await assert.rejects(renewWithRetry(run.renew, run.options), {
    status: 503,
  });
  assert.deepEqual(run.waits, [250, 500, 500]);
  assert.equal(run.calls(), 4);
});

test("a definitive answer is not retried", async () => {
  for (const status of [400, 401, 403, 404, 409, 410]) {
    const run = harness([failure(status)]);
    await assert.rejects(renewWithRetry(run.renew, run.options), { status });
    assert.equal(run.calls(), 1, `HTTP ${status}`);
  }
});

test("throttling and timeouts are retried", async () => {
  for (const status of [408, 429]) {
    const run = harness([failure(status), "renewed"]);
    assert.equal(await renewWithRetry(run.renew, run.options), "renewed");
    assert.equal(run.calls(), 2, `HTTP ${status}`);
  }
});

test("slow failures spend the budget: no retry starts later than 1.5 intervals after the first attempt", async () => {
  // Each attempt takes 600 ms to fail. Attempt 2 starts at 850, attempt 3 at
  // 1950 would exceed 1500, so the second retry is not made.
  const run = harness([failure(500)], { latency: 600 });
  await assert.rejects(renewWithRetry(run.renew, run.options), {
    status: 500,
  });
  assert.equal(run.calls(), 2);
});

test("an aborted workspace stops retrying", async () => {
  const controller = new AbortController();
  const run = harness([failure(500)]);
  const attempt = renewWithRetry(run.renew, {
    ...run.options,
    signal: controller.signal,
    sleep: async () => controller.abort(),
  });
  await assert.rejects(attempt, { status: 500 });
  assert.equal(run.calls(), 1);
});
