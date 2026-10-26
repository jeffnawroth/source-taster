// SPDX-License-Identifier: AGPL-3.0-or-later
import { randomUUID } from "node:crypto";
import {
  CheckResponse,
  ProblemDetails,
} from "@source-taster/contract-verification";
import { describe, expect, it } from "vitest";
import { api, createCheck, readEvents } from "./support/api.ts";

describe("Check snapshots and replay validation", () => {
  it("reopens a finished Check with the same References and final sequence", async () => {
    const created = await createCheck();
    await readEvents(created.id);
    const response = await fetch(`${api}/v1/checks/${created.id}`);
    expect(response.status).toBe(200);
    const snapshot = CheckResponse.parse(await response.json());
    expect(snapshot.quota).toBeNull();
    expect(snapshot.data).toEqual({
      ...created,
      state: "ended",
      lastEventSeq: 4,
      references: created.references.map((reference) => ({
        ...reference,
        outcome: { kind: "status", status: "not-checked" },
      })),
    });
  });

  it.each(["-1", "1.5", "NaN", "9007199254740993", "999"])(
    "rejects an invalid replay cursor %s",
    async (lastEventId) => {
      const created = await createCheck();
      const response = await fetch(`${api}/v1/checks/${created.id}/events`, {
        headers: { "Last-Event-ID": lastEventId },
      });
      expect(response.status).toBe(400);
      expect(ProblemDetails.parse(await response.json()).code).toBe(
        "invalid-request",
      );
    },
  );

  it.each(["", "/events"])(
    "reports an unknown Check as Problem Details on %s",
    async (suffix) => {
      const response = await fetch(`${api}/v1/checks/${randomUUID()}${suffix}`);
      expect(response.status).toBe(404);
      expect(ProblemDetails.parse(await response.json()).code).toBe(
        "check-not-found",
      );
    },
  );
});
