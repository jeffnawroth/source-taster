// SPDX-License-Identifier: AGPL-3.0-or-later
import { expect, test } from "vitest";
import { bothPrograms } from "./support/both-programs.ts";
const windowMs = 60000;
const budgets = {
  principal: {
    guest: { limit: 100, windowMs },
    free: { limit: 100, windowMs },
  },
  guest: { limit: 100, windowMs },
  allGuests: { limit: 100, windowMs },
  origin: { limit: 4, windowMs },
};
test("actual verification and private entrances share one origin budget and retain it through process restarts", async () => {
  const b = await bothPrograms({
    accounts: true,
    startWorker: false,
    abuse: {
      epoch: "both-test-abuse-epoch",
      neutralPlanId: "guest",
      policy: {
        version: "both-v1",
        cacheMs: 1000,
        public: { ...budgets, origin: { limit: 100, windowMs } },
        shared: budgets,
      },
      origin: {
        ipv4Prefix: 24,
        ipv6Prefix: 56,
        keys: [
          {
            id: "both",
            secret: "13".repeat(32),
            from: 0,
            until: 9000000000000,
          },
        ],
      },
    },
  });
  try {
    const service = () => fetch(b.serviceUrl + "/v1/unknown");
    const verification = () => fetch(b.apiUrl + "/v1/unknown");
    expect((await verification()).status).toBe(503);
    await b.advance(86400000);
    expect((await service()).status).toBe(404);
    expect((await verification()).status).toBe(404);
    const parallel = await Promise.all([
      service(),
      verification(),
      service(),
      verification(),
    ]);
    expect(parallel.filter((r) => r.status === 404)).toHaveLength(2);
    expect(parallel.filter((r) => r.status === 429)).toHaveLength(2);
    await b.restartService();
    await b.restartWeb();
    expect((await service()).status).toBe(429);
    expect((await verification()).status).toBe(429);
    await b.advance(windowMs);
    expect((await verification()).status).toBe(404);
  } finally {
    await b.stop();
  }
});
