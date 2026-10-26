// SPDX-License-Identifier: AGPL-3.0-or-later
import { describe, expect, it } from "vitest";
import { createCheck, readEvents } from "./support/api.ts";

const notChecked = { kind: "status", status: "not-checked" } as const;

describe("GET /v1/checks/{checkId}/events", () => {
  it("streams the Check in order until it ends, with a Status for every Reference", async () => {
    const check = await createCheck();

    const { events, closedByServer } = await readEvents(check.id);

    expect(closedByServer).toBe(true);
    expect(events.map((e) => e.event)).toEqual([
      { seq: 1, checkId: check.id, type: "check.updated", state: "running" },
      {
        seq: 2,
        checkId: check.id,
        type: "reference.updated",
        reference: { slot: 1, outcome: notChecked },
      },
      {
        seq: 3,
        checkId: check.id,
        type: "reference.updated",
        reference: { slot: 2, outcome: notChecked },
      },
      { seq: 4, checkId: check.id, type: "check.updated", state: "ended" },
    ]);
    for (const { id, type, event } of events) {
      expect(id).toBe(String(event.seq));
      expect(type).toBe(event.type);
    }
  });

  it("replays only the missed events to a client resuming with Last-Event-ID", async () => {
    const check = await createCheck();
    const first = await readEvents(check.id, { stopAfter: 2 });
    expect(first.closedByServer).toBe(false);

    const resumed = await readEvents(check.id, {
      lastEventId: first.events.at(-1)!.id,
    });

    expect(resumed.closedByServer).toBe(true);
    expect(resumed.events.map((e) => e.event.seq)).toEqual([3, 4]);
  });

  it("closes at once for a client that already has the final event", async () => {
    const check = await createCheck();
    await readEvents(check.id);

    const started = Date.now();
    const resumed = await readEvents(check.id, { lastEventId: "4" });

    expect(resumed).toEqual({ events: [], closedByServer: true });
    expect(Date.now() - started).toBeLessThan(2_000);
  });
});
