// SPDX-License-Identifier: AGPL-3.0-or-later
import { describe, expect, it } from "vitest";
import { createCheck, readEvents } from "./support/api.ts";

describe("GET /v1/checks/{checkId}/events", () => {
  it("streams ordered progress and exactly one terminal Status per Reference", async () => {
    const check = await createCheck();
    const { events, closedByServer } = await readEvents(check.id);
    expect(closedByServer).toBe(true);
    expect(events[0]!.event).toMatchObject({
      checkId: check.id,
      type: "check.updated",
      state: "running",
      endReason: null,
    });
    expect(events.at(-1)!.event).toMatchObject({
      type: "check.updated",
      state: "ended",
      endReason: "completed",
    });
    const finished = events
      .map((e) => e.event)
      .filter(
        (e) =>
          e.type === "reference.updated" && e.reference.progress === "ended",
      );
    expect(finished).toHaveLength(2);
    expect(finished).toEqual(
      expect.arrayContaining(
        [1, 2].map(
          (slot) =>
            expect.objectContaining({
              type: "reference.updated",
              reference: {
                slot,
                progress: "ended",
                outcome: { kind: "status", status: "not-checked" },
              },
            }) as unknown,
        ),
      ),
    );
    events.forEach(({ id, type, event }, index) => {
      expect(event.seq).toBe(index + 1);
      expect(id).toBe(`${check.id}:${event.seq}`);
      expect(type).toBe(event.type);
    });
  });
  it("replays only missed events after disconnect and closes at the terminal cursor", async () => {
    const check = await createCheck();
    const first = await readEvents(check.id, { stopAfter: 2 });
    const resumed = await readEvents(check.id, {
      lastEventId: first.events.at(-1)!.id,
    });
    expect(first.closedByServer).toBe(false);
    expect(resumed.closedByServer).toBe(true);
    expect(resumed.events[0]!.event.seq).toBe(3);
    const all = [...first.events, ...resumed.events];
    expect(all.map((e) => e.event.seq)).toEqual(
      Array.from({ length: all.length }, (_, i) => i + 1),
    );
    expect(await readEvents(check.id, { lastEventId: all.at(-1)!.id })).toEqual(
      { events: [], closedByServer: true },
    );
  });
});
