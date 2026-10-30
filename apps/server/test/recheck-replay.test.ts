// SPDX-License-Identifier: AGPL-3.0-or-later
import { afterAll, beforeAll, expect, it } from "vitest";
import {
  verificationClient,
  watchCheckEvents,
} from "@source-taster/contract-verification/client-v2";
import type { CheckEvent } from "@source-taster/contract-verification/v2";
import { startTestService } from "./support/service.ts";
import { startDoiFixtures, physicsReference } from "./support/doi-fixtures.ts";
let fixtures: Awaited<ReturnType<typeof startDoiFixtures>>;
let service: Awaited<ReturnType<typeof startTestService>>;
beforeAll(async () => {
  fixtures = await startDoiFixtures();
  service = await startTestService(55384, 0, fixtures.env);
});
afterAll(async () => {
  await service?.stop();
  await fixtures?.stop();
});
it("the published v2 watcher replays past the original Check end to the current Re-check", async () => {
  const api = verificationClient({ baseUrl: service.apiUrl });
  const check = await api.createCheck(physicsReference);
  await expect
    .poll(async () => (await api.getCheck(check.id)).state)
    .toBe("ended");
  const gate = fixtures.hold("/api/handles/10.1038/nphys1170");
  let release: ReturnType<typeof setTimeout> | undefined;
  try {
    await api.recheckReference(check.id, 1, { expectedRevision: 1 });
    await gate.arrived;
    const events: CheckEvent[] = [];
    await watchCheckEvents(check.id, {
      baseUrl: service.apiUrl,
      lastEventSeq: 0,
      signal: AbortSignal.timeout(8000),
      onEvent: (event) => {
        events.push(event);
        if (event.type === "check.updated" && event.state === "ended")
          release = setTimeout(gate.release, 20);
      },
    });
    expect(
      events.some(
        (event) =>
          event.type === "reference.updated" &&
          event.reference.results?.length === 2,
      ),
    ).toBe(true);
    expect(events.at(-1)?.seq).toBe(
      (await api.getCheck(check.id)).lastEventSeq,
    );
  } finally {
    clearTimeout(release);
    gate.release();
  }
});
