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

test("real concurrent entrances share the all-Guest budget across new identities and retain failure CORS and retry deadlines", async () => {
  const shared = {
    ...budgets,
    origin: { limit: 1000, windowMs },
    allGuests: { limit: 3, windowMs },
  };
  const b = await bothPrograms({
    accounts: true,
    startWorker: false,
    abuse: {
      epoch: "both-all-guests-abuse-epoch",
      neutralPlanId: "guest",
      policy: {
        version: "both-v1",
        cacheMs: 1000,
        public: { ...shared, allGuests: { limit: 1000, windowMs } },
        shared,
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
    await b.advance(86400000);
    const responses = await Promise.all(
      Array.from({ length: 10 }, (_, i) =>
        fetch((i % 2 ? b.apiUrl : b.serviceUrl) + "/v1/unknown", {
          headers: {
            origin: "https://web.test.invalid",
            "x-forwarded-for": `203.0.113.${i}`,
          },
        }),
      ),
    );
    expect(responses.filter((r) => r.status === 404)).toHaveLength(3);
    const denied = responses.filter((r) => r.status === 429);
    expect(denied).toHaveLength(7);
    for (const response of denied) {
      const problem = (await response.json()) as {
        code: string;
        retryAt: string;
      };
      expect(problem.code).toBe("abuse-limit");
      expect(response.headers.get("retry-after")).toBe(
        String(
          Math.max(
            1,
            Math.ceil((Date.parse(problem.retryAt) - b.now()) / 1000),
          ),
        ),
      );
      // The private API is cross-origin. Verification remains same-origin
      // (web proxy) or extension-privileged; it adds no public CORS policy.
      expect(response.headers.get("access-control-allow-origin")).toBe(
        response.url.startsWith(b.serviceUrl)
          ? "https://web.test.invalid"
          : null,
      );
      expect(response.headers.get("cache-control")).toBe("no-store");
    }
    await b.restartService();
    expect((await fetch(b.apiUrl + "/v1/unknown")).status).toBe(429);
    await b.advance(windowMs);
    expect((await fetch(b.apiUrl + "/v1/unknown")).status).toBe(404);
  } finally {
    await b.stop();
  }
});

for (const dimension of ["principal", "guest"] as const) {
  test(`real both-program ${dimension} attempts share a budget without spending billing Quota`, async () => {
    const shared = {
      principal: {
        guest: { limit: 1000, windowMs },
        free: { limit: dimension === "principal" ? 4 : 1000, windowMs },
      },
      guest: { limit: dimension === "guest" ? 4 : 1000, windowMs },
      allGuests: { limit: 1000, windowMs },
      origin: { limit: 1000, windowMs },
    };
    const b = await bothPrograms({
      accounts: true,
      startWorker: false,
      abuse: {
        epoch: `both-${dimension}-abuse-epoch`,
        neutralPlanId: "guest",
        policy: {
          version: "both-v1",
          cacheMs: 1000,
          public: {
            ...shared,
            principal: {
              guest: { limit: 1000, windowMs },
              free: { limit: 1000, windowMs },
            },
            guest: { limit: 1000, windowMs },
          },
          shared,
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
      await b.advance(86400000);
      const account =
        dimension === "principal"
          ? await b.signIn("budget-real@example.invalid")
          : undefined;
      const guest = account ? undefined : await b.issue();
      const token = account?.token ?? guest!.token;
      await b.advance(windowMs);
      const verification = () =>
        fetch(b.apiUrl + "/v2/quota", {
          headers: { authorization: `Bearer ${token}` },
        });
      const service = () =>
        account
          ? fetch(b.serviceUrl + "/v1/preferences", {
              headers: {
                origin: "https://web.test.invalid",
                cookie: account.cookie,
              },
            })
          : fetch(b.serviceUrl + "/v1/guest-tokens", {
              method: "POST",
              headers: {
                "content-type": "application/json",
                origin: "https://web.test.invalid",
              },
              body: JSON.stringify({ guestId: guest!.guestId, client: "web" }),
            });
      const responses = await Promise.all(
        Array.from({ length: 10 }, (_, i) =>
          i % 2 ? service() : verification(),
        ),
      );
      expect(responses.filter((r) => r.status === 200)).toHaveLength(4);
      expect(responses.filter((r) => r.status === 429)).toHaveLength(6);
      await b.advance(windowMs);
      const quota = await verification();
      expect(quota.status).toBe(200);
      expect(await quota.json()).toMatchObject({
        data: { remaining: dimension === "principal" ? 100 : 20 },
      });
    } finally {
      await b.stop();
    }
  });
}
