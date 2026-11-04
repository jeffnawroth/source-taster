// SPDX-License-Identifier: AGPL-3.0-or-later
// Maximum-size cancellation over real HTTP/SSE + PostgreSQL, with controlled
// transport latency. No worker runs: every queued Reference must be cancelled.
import { expect, it } from "vitest";
import {
  CheckResponse,
  CheckEvent,
} from "@source-taster/contract-verification";
import {
  CheckResponse as NextCheckResponse,
  CheckEvent as NextCheckEvent,
} from "@source-taster/contract-verification/v2";
import { readSseFrames } from "@source-taster/contract-verification/client";
import { lifecycleService } from "./support/lifecycle-service.ts";
import { testDatabase } from "./support/processes.ts";
import { postgresLatency } from "./support/postgres-latency.ts";
import { setupDatabase } from "../scripts/db-setup.ts";

it.each([1, 2])(
  "can cancel the configured maximum v%i Check without stranding queued References over a delayed database connection",
  async (version) => {
    const ResponseSchema = version === 1 ? CheckResponse : NextCheckResponse;
    const EventSchema = version === 1 ? CheckEvent : NextCheckEvent;
    const database = testDatabase();
    await setupDatabase(database.adminUrl, database.appUrl);
    const transport = await postgresLatency(database.appUrl);
    let service: Awaited<ReturnType<typeof lifecycleService>> | undefined;
    const request = (path: string, init: RequestInit = {}) =>
      fetch(`${service!.apiUrl}/v${version}/checks${path}`, {
        ...init,
        headers: { "content-type": "application/json" },
      });
    try {
      service = await lifecycleService(
        {},
        {
          database: { ...database, appUrl: transport.url },
        },
      );
      const createdResponse = await request("", {
        method: "POST",
        body: JSON.stringify({
          references: Array.from({ length: 1000 }, (_, i) => ({
            originalText: `10.5555/bounded-${i}`,
            fields: { DOI: `10.5555/bounded-${i}` },
          })),
        }),
      });
      expect(createdResponse.status).toBe(201);
      const created = ResponseSchema.parse(await createdResponse.json()).data;
      transport.delay(1);
      const response = await request(`/${created.id}/cancel`, {
        method: "POST",
      });
      expect(response.status).toBe(200);
      const cancelled = ResponseSchema.parse(await response.json()).data;
      expect(cancelled).toMatchObject({
        state: "ended",
        endReason: "cancelled",
      });
      expect(cancelled.references).toHaveLength(1000);
      expect(
        cancelled.references.every(
          (reference) =>
            reference.outcome.kind === "status" &&
            reference.outcome.status === "cancelled",
        ),
      ).toBe(true);
      transport.delay(0);
      expect(
        ResponseSchema.parse(
          await (
            await request(`/${created.id}/cancel`, { method: "POST" })
          ).json(),
        ).data,
      ).toEqual(cancelled);
      const events = await request(`/${created.id}/events`);
      const updates = [];
      for await (const frame of readSseFrames(events.body!)) {
        const event = EventSchema.parse(JSON.parse(frame.data));
        if (event.type === "reference.updated") updates.push(event);
      }
      expect(updates).toHaveLength(1000);
      expect(updates.map((event) => event.reference.slot)).toEqual(
        Array.from({ length: 1000 }, (_, i) => i + 1),
      );
      expect(
        updates.every(
          (event) =>
            event.reference.outcome.kind === "status" &&
            event.reference.outcome.status === "cancelled",
        ),
      ).toBe(true);
    } finally {
      try {
        await service?.stop();
      } finally {
        await transport.stop();
      }
    }
  },
  40_000,
);
