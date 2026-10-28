// SPDX-License-Identifier: AGPL-3.0-or-later
import { expect, it } from "vitest";
import { api, createCheck, readEvents } from "./support/api.ts";
import {
  watchCheckEvents as legacyWatch,
  readSseFrames,
} from "./fixtures/verification-client-74/dist/contract-verification/src/client.js";

it("preserves numeric nonzero /v1 replay and numeric output IDs for the actual previous client", async () => {
  const check = await createCheck();
  const events: { seq: number }[] = [];
  await legacyWatch(check.id, {
    baseUrl: api,
    lastEventSeq: check.lastEventSeq,
    signal: AbortSignal.timeout(10000),
    onEvent: (event: { seq: number }) => events.push(event),
  });
  expect(events[0]?.seq).toBe(check.lastEventSeq + 1);
  const response = await fetch(`${api}/v1/checks/${check.id}/events`, {
    headers: { "last-event-id": "0001" },
  });
  expect(response.status).toBe(200);
  const ids: string[] = [];
  for await (const frame of readSseFrames(response.body!)) ids.push(frame.id!);
  expect(ids[0]).toBe("2");
  expect(ids.every((id) => /^[1-9]\d*$/.test(id))).toBe(true);
  const modern = await readEvents(check.id, { lastEventId: `${check.id}:1` });
  expect(modern.events[0]?.id).toBe(`${check.id}:2`);
  expect(modern.events.map((e) => e.event.seq)).toEqual(ids.map(Number));
});
