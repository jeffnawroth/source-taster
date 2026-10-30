// SPDX-License-Identifier: AGPL-3.0-or-later
// ADR-0007 identifier batching: collection, bounds, demultiplexing and the
// independence of each member's cancellation and deadline.
import { expect, it } from "vitest";
import type { Evidence } from "@source-taster/core";
import { identifierBatches, type BatchCarrier } from "../src/sources/batch.ts";
import { systemSourceClock } from "../src/sources/doi.ts";
import { batchableArxiv } from "../src/sources/shared.ts";
const clock = systemSourceClock;
const window = { size: 500, windowMs: 50, untilSend: false };
const answer = (): Evidence => ({
  source: "semanticscholar",
  operation: "arxiv",
  outcome: "unavailable",
  reason: "response",
  status: 200,
  durationMs: 1,
  attempts: 1,
  observedAt: new Date().toISOString(),
  raw: ["every", "record"],
});
/** A carrier that records the identifiers it sent. */
function recorder(gate?: Promise<void>) {
  const sent: string[][] = [];
  const carry: BatchCarrier = async (ids) => {
    await gate;
    sent.push(ids());
    return { body: "batch", evidence: answer() };
  };
  return { sent, carry };
}
const join = (
  batches: ReturnType<typeof identifierBatches>,
  value: string,
  carry: BatchCarrier,
  options: { deadline?: number; signal?: AbortSignal } = {},
  policy = window,
) =>
  batches.join("semanticscholar", policy, {
    value,
    operation: "arxiv",
    deadline: options.deadline ?? Date.now() + 5000,
    carry,
    clock,
    ...(options.signal ? { signal: options.signal } : {}),
  });

it("sends the lookups collected in one window as one request", async () => {
  const batches = identifierBatches();
  const { sent, carry } = recorder();
  const results = await Promise.all(
    ["1706.03762", "1810.04805", "1706.03762"].map((id) =>
      join(batches, id, carry),
    ),
  );
  expect(sent).toEqual([["1706.03762", "1810.04805"]]);
  for (const result of results) {
    expect(result.ids).toEqual(["1706.03762", "1810.04805"]);
    // Each run records its own wait and never the batch's raw response.
    expect(result.evidence).not.toHaveProperty("raw");
    expect(result.evidence.operation).toBe("arxiv");
  }
});

it("bounds a batch by its size", async () => {
  const batches = identifierBatches();
  const { sent, carry } = recorder();
  await Promise.all(
    ["a", "b", "c"].map((id) =>
      join(batches, id, carry, {}, { ...window, size: 2 }),
    ),
  );
  expect(sent).toEqual([["a", "b"], ["c"]]);
});

it("closes a window batch when its window ends", async () => {
  const batches = identifierBatches();
  let open!: () => void;
  const { sent, carry } = recorder(new Promise((r) => (open = r)));
  const first = join(batches, "a", carry);
  await clock.sleep(100);
  const second = join(batches, "b", carry);
  open();
  await Promise.all([first, second]);
  expect(sent).toEqual([["a"], ["b"]]);
});

it("collects until the permit is granted when the batch waits for it", async () => {
  const batches = identifierBatches();
  let grant!: () => void;
  const { sent, carry } = recorder(new Promise((r) => (grant = r)));
  const policy = { size: 100, windowMs: 0, untilSend: true };
  const first = join(batches, "a", carry, {}, policy);
  await clock.sleep(100);
  const second = join(batches, "b", carry, {}, policy);
  grant();
  await Promise.all([first, second]);
  expect(sent).toEqual([["a", "b"]]);
});

it("lets a member leave at its deadline without the others", async () => {
  const batches = identifierBatches();
  let grant!: () => void;
  const { sent, carry } = recorder(new Promise((r) => (grant = r)));
  const policy = { size: 100, windowMs: 0, untilSend: true };
  const early = join(
    batches,
    "a",
    carry,
    { deadline: Date.now() + 50 },
    policy,
  );
  const late = join(batches, "b", carry, {}, policy);
  expect((await early).evidence).toMatchObject({
    outcome: "unavailable",
    reason: "deadline",
    attempts: 0,
  });
  grant();
  expect((await late).ids).toEqual(["b"]);
  // A member that left is not sent.
  expect(sent).toEqual([["b"]]);
});

it("sends again for the others when the carrying run is cancelled", async () => {
  const batches = identifierBatches();
  const cancelled = new AbortController();
  const sent: string[][] = [];
  const carriers: string[] = [];
  const carrier =
    (name: string, signal?: AbortSignal): BatchCarrier =>
    async (ids) => {
      carriers.push(name);
      const chosen = ids();
      // The cancelled run's request ends with its own abort.
      await clock.sleep(50, signal);
      sent.push(chosen);
      return { body: "batch", evidence: answer() };
    };
  // The carrier is the member with the latest deadline.
  const leaving = join(batches, "a", carrier("a", cancelled.signal), {
    deadline: Date.now() + 9000,
    signal: cancelled.signal,
  });
  const staying = join(batches, "b", carrier("b"));
  await clock.sleep(70);
  cancelled.abort(new Error("cancelled"));
  await expect(leaving).rejects.toThrow("cancelled");
  expect((await staying).ids).toEqual(["b"]);
  expect(carriers).toEqual(["a", "b"]);
  expect(sent).toEqual([["b"]]);
});

it("does not pass an unsent carrier's failure to members that joined later", async () => {
  const batches = identifierBatches();
  const policy = { size: 100, windowMs: 0, untilSend: true };
  const sent: string[][] = [];
  let calls = 0;
  const carry: BatchCarrier = async (ids) => {
    // The first carrier's permit wait ends without a send (rate budget).
    if (calls++ === 0) {
      await clock.sleep(50);
      return { evidence: { ...answer(), reason: "rate-budget", attempts: 0 } };
    }
    sent.push(ids());
    return { body: "batch", evidence: answer() };
  };
  const first = join(
    batches,
    "a",
    carry,
    { deadline: Date.now() + 9000 },
    policy,
  );
  await clock.sleep(20);
  const second = join(batches, "b", carry, {}, policy);
  expect((await first).evidence.reason).toBe("rate-budget");
  expect((await second).ids).toEqual(["b"]);
  expect(sent).toEqual([["b"]]);
});

/**
 * A carrier modelled on one source call: it waits for its permit (which a
 * handover ends before the send), then its request takes `takesMs` within the
 * deadline it was given, or times out at that deadline.
 */
function permitted(grant: Promise<void>, takesMs: number) {
  const sent: string[][] = [];
  const carry: BatchCarrier = async (ids, deadline, handover) => {
    const waited = new AbortController();
    const waiting = clock.sleep(
      60_000,
      AbortSignal.any([handover, waited.signal]),
    );
    waiting.catch(() => {});
    await Promise.race([grant, waiting]).finally(() => waited.abort());
    const chosen = ids();
    sent.push(chosen);
    const left = deadline - Date.now();
    await clock.sleep(Math.min(takesMs, Math.max(0, left)));
    return takesMs <= left
      ? { body: "batch", evidence: answer() }
      : { evidence: { ...answer(), reason: "timeout" } };
  };
  return { sent, carry };
}

it("gives the request the latest deadline among the members at send", async () => {
  const batches = identifierBatches();
  let grant!: () => void;
  const { sent, carry } = permitted(new Promise((r) => (grant = r)), 400);
  const policy = { size: 100, windowMs: 0, untilSend: true };
  const early = join(
    batches,
    "a",
    carry,
    { deadline: Date.now() + 300 },
    policy,
  );
  await clock.sleep(50);
  const late = join(batches, "b", carry, {}, policy);
  await clock.sleep(50);
  grant();
  expect((await early).evidence.reason).toBe("deadline");
  // The request ran within the later member's deadline, not the first's.
  expect((await late).evidence.reason).toBe("response");
  expect(sent).toEqual([["a", "b"]]);
});

it("sends a burst of later members once", async () => {
  const batches = identifierBatches();
  let grant!: () => void;
  const { sent, carry } = permitted(new Promise((r) => (grant = r)), 10);
  const policy = { size: 100, windowMs: 0, untilSend: true };
  const joined = [];
  for (const [index, id] of ["a", "b", "c", "d"].entries()) {
    joined.push(
      join(
        batches,
        id,
        carry,
        { deadline: Date.now() + 1000 * (index + 1) },
        policy,
      ),
    );
    await clock.sleep(20);
  }
  grant();
  for (const result of await Promise.all(joined))
    expect(result.evidence.reason).toBe("response");
  expect(sent).toEqual([["a", "b", "c", "d"]]);
});

// arXiv answers a whole request with an error for one malformed identifier;
// the new scheme began with 0704 (four digits) and 1501 (five digits).
it.each([
  ["0704.0001", true],
  ["1412.9999", true],
  ["1501.00001", true],
  ["1706.03762", true],
  ["hep-th/9901001", true],
  ["hep-th/9108001", true],
  ["math/0309136", true],
  ["cond-mat/0703001", true],
  ["0701.1234", false],
  ["0703.0001", false],
  ["1501.0001", false],
  ["1412.00001", false],
  ["1713.03762", false],
  ["hep-th/990100", false],
  // Old-scheme identifiers: a known archive in lower case, 9108 to 0703.
  // A subject class is not part of the record identifier arXiv returns.
  ["math.GT/0309136", false],
  ["HEP-TH/9901001", false],
  ["foo/9913001", false],
  ["hep-th/9913001", false],
  ["hep-th/9107001", false],
  ["hep-th/0704001", false],
])("batches arXiv identifier %s: %s", (id, batchable) => {
  expect(batchableArxiv(id)).toBe(batchable);
});
