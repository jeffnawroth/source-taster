// SPDX-License-Identifier: AGPL-3.0-or-later
import { afterEach, expect, test } from "vitest";
import { ProblemDetails } from "@source-taster/contract-common";
import { abuseService } from "./support/abuse-service.ts";
let service: Awaited<ReturnType<typeof abuseService>> | undefined;
afterEach(async () => {
  await service?.stop();
  service = undefined;
});
test("public instances atomically share a principal allowance and return a continuation time", async () => {
  service = await abuseService();
  const responses = await Promise.all(
    Array.from({ length: 12 }, () => service!.request()),
  );
  expect(responses.filter((r) => r.status === 200)).toHaveLength(2);
  expect(responses.filter((r) => r.status === 429)).toHaveLength(10);
  expect(
    service.quotaRequests.filter((path) => path.endsWith("/reserve")),
  ).toHaveLength(0);
  const denied = responses.find((r) => r.status === 429)!;
  expect(denied.headers.get("retry-after")).toBe("60");
  expect(ProblemDetails.parse(await denied.json())).toMatchObject({
    code: "abuse-limit",
    status: 429,
    retryAt: "2026-10-31T12:01:00.000Z",
  });
  service.advance(60000);
  expect((await service.request()).status).toBe(200);
});

test("invalid and missing credentials still consume origin entrance budget before validation", async () => {
  service = await abuseService();
  service.policy.public.origin.limit = 2;
  const attempt = (authorization: string) =>
    service!.request("ignored", { headers: { authorization } });
  expect((await attempt("Bearer invalid")).status).toBe(401);
  expect((await attempt("")).status).toBe(401);
  expect((await service.request("new-guest")).status).toBe(429);
});

test("Guest ID budget survives renewed authority bindings independently of principal and Quota", async () => {
  service = await abuseService();
  service.policy.public.principal.free.limit = 100;
  service.policy.public.guest.limit = 1;
  expect((await service.request()).status).toBe(200);
  service.rebindGuest("one");
  expect((await service.request()).status).toBe(429);
  expect((await service.request("another")).status).toBe(200);
});

test("a combined-service denial is not cached and still counts the public entrance attempt", async () => {
  service = await abuseService();
  service.policy.public.principal.free.limit = 1;
  service.decisions.push({
    allowed: false,
    planId: "free",
    policyVersion: service.policy.version,
    retryAt: "2026-10-31T12:00:05.000Z",
  });
  const first = await service.request();
  expect(first.status).toBe(429);
  expect(first.headers.get("retry-after")).toBe("5");
  expect((await service.request()).status).toBe(429);
  expect(service.bodies).toHaveLength(2);
});

test("new Guests, sign-in and spoofed forwarding/Origin cannot reset the same network budget", async () => {
  service = await abuseService();
  service.policy.public.origin.limit = 2;
  expect(
    (
      await service.request("first", {
        headers: {
          "x-forwarded-for": "203.0.113.10",
          origin: "https://one.invalid",
        },
      })
    ).status,
  ).toBe(200);
  expect(
    (
      await service.request("second", {
        headers: {
          forwarded: "for=198.51.100.20",
          "x-real-ip": "198.51.100.20",
        },
      })
    ).status,
  ).toBe(200);
  const denied = await service.request("signed-in", {
    guest: false,
    headers: { "x-forwarded-for": "192.0.2.99", origin: "https://two.invalid" },
  });
  expect(denied.status).toBe(429);
  const serialized = JSON.stringify(service.bodies);
  expect(serialized).not.toMatch(
    /127\.0\.0\.1|203\.0\.113|198\.51\.100|192\.0\.2|https:\/\/two/,
  );
  const hashes = service.bodies.map(
    (body) => (body as { origins: { hash: string }[] }).origins[0]!.hash,
  );
  expect(new Set(hashes).size).toBe(1);
  service.advance(60000);
  expect((await service.request("signed-in", { guest: false })).status).toBe(
    200,
  );
});

test("all-Guest allowance spans different Guest IDs while an Account uses its current Plan", async () => {
  service = await abuseService();
  service.policy.public.allGuests.limit = 1;
  expect((await service.request("first")).status).toBe(200);
  expect((await service.request("second")).status).toBe(429);
  // Plan comes only from the service, not a token or request header.
  service.decisions.push({
    allowed: true,
    policyVersion: service.policy.version,
    planId: "pro",
  });
  expect((await service.request("account", { guest: false })).status).toBe(200);
});

test("rotation preserves live origin windows and replacement keys fail closed", async () => {
  service = await abuseService();
  service.policy.public.origin.limit = 1;
  service.originSettings.keys[0]!.until = service.now() + 30000;
  service.originSettings.keys.push({
    id: "next",
    secret: "b".repeat(64),
    from: service.now() + 30000,
    until: service.now() + 172800000,
  });
  expect((await service.request()).status).toBe(200);
  service.advance(45000);
  expect((await service.request("new")).status).toBe(429);
  service.originSettings.keys[0]!.secret = "c".repeat(64);
  expect((await service.request("another")).status).toBe(503);
  service.advance(15000);
  service.originSettings.keys.shift();
  expect((await service.request("next-window")).status).toBe(200);
});

test("brief policy caching never becomes an allowance during service outage or malformed policy", async () => {
  service = await abuseService();
  expect((await service.request()).status).toBe(200);
  expect((await service.request("two")).status).toBe(200);
  expect(service.policyRequests()).toBe(2); // one cache per instance
  service.outage(true);
  expect((await service.request("three")).status).toBe(503);
  service.advance(1001);
  expect((await service.request("four")).status).toBe(503);
  service.outage(false);
  service.policy.public.origin.windowMs = 86400001;
  expect((await service.request("five")).status).toBe(503);
});

test("current Plan changes never erase already counted principal attempts", async () => {
  service = await abuseService();
  const decision = (planId: string) => ({
    allowed: true,
    policyVersion: service!.policy.version,
    planId,
  });
  for (let i = 0; i < 5; i++) {
    service.decisions.push(decision("pro"));
    expect(
      (
        await service.request("account", {
          guest: false,
          headers: { "source-taster-plan": "unlimited" },
        })
      ).status,
    ).toBe(200);
  }
  service.decisions.push(decision("free"));
  expect((await service.request("account", { guest: false })).status).toBe(429);
  service.decisions.push(decision("pro"));
  expect((await service.request("account", { guest: false })).status).toBe(429);
});

test("routine database exports do not archive short-lived Guest accounting identifiers", async () => {
  const { backup } = await import("./support/backup.ts");
  service = await abuseService();
  await service.request();
  const claims = JSON.parse(
    Buffer.from(service.token().split(".")[1]!, "base64url").toString(),
  ) as { guestId: string };
  const exported = await backup(
    service.database.adminUrl,
    service.database.appUrl,
    { unloggedData: false },
  );
  try {
    expect((await exported.text()).includes(claims.guestId)).toBe(false);
  } finally {
    await exported.discard();
  }
});

test("a full-day window has a fixed expiry, rounded retry seconds and no key-retirement reset", async () => {
  service = await abuseService();
  service.advance(-12 * 60 * 60 * 1000);
  for (const budget of [
    service.policy.public.principal.free,
    service.policy.public.principal.pro,
    service.policy.public.guest,
    service.policy.public.allGuests,
    service.policy.public.origin,
    service.policy.shared.origin,
  ])
    budget.windowMs = 86400000;
  service.policy.public.origin.limit = 1;
  service.originSettings.keys[0]!.until = service.now() + 86400000;
  service.originSettings.keys.push({
    id: "tomorrow",
    secret: "d".repeat(64),
    from: service.now() + 86400000,
    until: service.now() + 172800000,
  });
  expect((await service.request()).status).toBe(200);
  service.advance(1);
  const denied = await service.request("different");
  expect(denied.status).toBe(429);
  expect(denied.headers.get("retry-after")).toBe("86400");
  expect(ProblemDetails.parse(await denied.json()).retryAt).toBe(
    "2026-11-01T00:00:00.000Z",
  );
  service.advance(86399999);
  service.originSettings.keys.shift();
  expect((await service.request("tomorrow")).status).toBe(200);
});

test("continuation time is the latest exceeded budget and malformed shared decisions grant nothing", async () => {
  service = await abuseService();
  service.policy.public.principal.free.limit = 1;
  service.policy.public.origin = { limit: 1, windowMs: 120000 };
  expect((await service.request()).status).toBe(200);
  const denied = await service.request();
  expect(denied.headers.get("retry-after")).toBe("120");
  expect(ProblemDetails.parse(await denied.json()).retryAt).toBe(
    "2026-10-31T12:02:00.000Z",
  );
  service.decisions.push({
    allowed: true,
    policyVersion: "wrong",
    planId: "pro",
  });
  expect((await service.request()).status).toBe(503);
  service.decisions.push({
    allowed: true,
    policyVersion: service.policy.version,
    planId: "unlimited",
  });
  expect((await service.request()).status).toBe(503);
});

test("SSE admission counts once per connection and its shared client stops on typed 429", async () => {
  const { CheckResponse } =
    await import("@source-taster/contract-verification/v2");
  const { readSseFrames, watchCheckEvents } =
    await import("@source-taster/contract-verification/client-v2");
  service = await abuseService();
  const created = await service.request("stream", { path: "/v2/checks" });
  expect(created.status).toBe(201);
  const check = CheckResponse.parse(await created.json()).data;
  const controller = new AbortController();
  const stream = await fetch(
    `http://127.0.0.1:4701/v2/checks/${check.id}/events`,
    {
      headers: {
        authorization: `Bearer ${service.token("stream")}`,
        "last-event-id": `${check.id}:0`,
      },
      signal: controller.signal,
    },
  );
  expect(stream.status).toBe(200);
  try {
    for await (const frame of readSseFrames(stream.body!)) {
      expect(frame.id).toBe(`${check.id}:1`);
      break;
    }
  } finally {
    controller.abort();
  }
  await expect(
    watchCheckEvents(check.id, {
      baseUrl: "http://127.0.0.1:4701",
      credentials: () => Promise.resolve(service!.token("stream")),
      onEvent: () => {
        throw new Error("Denied stream published a frame");
      },
      signal: AbortSignal.timeout(3000),
      retryDelayMs: 1,
    }),
  ).rejects.toMatchObject({
    status: 429,
    problem: { code: "abuse-limit", retryAt: "2026-10-31T12:01:00.000Z" },
  });
});

test("inconsistent Plan windows fail closed instead of creating a Plan-switch reset", async () => {
  service = await abuseService();
  service.policy.public.principal.pro.windowMs = 120000;
  expect((await service.request()).status).toBe(503);
});
