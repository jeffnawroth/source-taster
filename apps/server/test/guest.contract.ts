// SPDX-License-Identifier: AGPL-3.0-or-later
import { once } from "node:events";
import { afterEach, expect, test } from "vitest";
import {
  CheckResponse,
  type Check,
} from "@source-taster/contract-verification";
import { readSseFrames } from "@source-taster/contract-verification/client";
import { bothPrograms } from "./support/both-programs.ts";
import { physicsReference } from "./support/doi-fixtures.ts";
const cleanup: (() => Promise<void>)[] = [];
afterEach(async () => {
  await Promise.all(cleanup.splice(0).map((f) => f()));
});
test("real Guest authority permits its own real DOI Check and denies foreign Guests", async () => {
  const both = await bothPrograms();
  cleanup.push(both.stop);
  const guest = await both.issue();
  const response = await fetch(`${both.apiUrl}/v1/checks`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${guest.token}`,
    },
    body: JSON.stringify({ text: physicsReference }),
  });
  expect(response.status).toBe(201);
  const check = CheckResponse.parse(await response.json()).data;
  expect(check.references[0]?.originalText).toBe(physicsReference);
  const stream = await fetch(`${both.apiUrl}/v1/checks/${check.id}/events`, {
    headers: { authorization: `Bearer ${guest.token}` },
    signal: AbortSignal.timeout(15000),
  });
  const events: unknown[] = [];
  for await (const frame of readSseFrames(stream.body!))
    events.push(JSON.parse(frame.data));
  const snapshot = CheckResponse.parse(
    await (
      await fetch(`${both.apiUrl}/v1/checks/${check.id}`, {
        headers: { authorization: `Bearer ${guest.token}` },
      })
    ).json(),
  ).data;
  expect(snapshot.references[0]?.outcome).toMatchObject({
    kind: "verdict",
    verdict: "correct",
    scoringRules: { calibration: "uncalibrated" },
  });
  expect(events.length).toBeGreaterThan(1);
  const foreign = await both.issue();
  expect(
    (
      await fetch(`${both.apiUrl}/v1/checks/${check.id}`, {
        headers: { authorization: `Bearer ${foreign.token}` },
      })
    ).status,
  ).toBe(404);
});
test("a still-signed Guest token loses protected access immediately after current revocation", async () => {
  const both = await bothPrograms({ startWorker: false });
  cleanup.push(both.stop);
  const guest = await both.issue();
  const headers = {
    "content-type": "application/json",
    authorization: `Bearer ${guest.token}`,
  };
  const created = CheckResponse.parse(
    await (
      await fetch(`${both.apiUrl}/v1/checks`, {
        method: "POST",
        headers,
        body: JSON.stringify({ text: physicsReference }),
      })
    ).json(),
  ).data;
  const command = await both.change(guest.guestId, { revoke: true });
  expect(command).toMatchObject({ completed: true });
  const response = await fetch(`${both.apiUrl}/v1/structurings`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${guest.token}`,
    },
    body: JSON.stringify({ text: physicsReference }),
  });
  expect(response.status).toBe(403);
  for (const [path, method] of [
    [`/v1/checks/${created.id}`, "GET"],
    [`/v1/checks/${created.id}/events`, "GET"],
    [`/v1/checks/${created.id}/cancel`, "POST"],
    [`/v1/checks/${created.id}/lease`, "POST"],
    ["/v1/checks", "POST"],
  ]) {
    const denied = await fetch(`${both.apiUrl}${path}`, {
      method,
      headers,
      ...(path === "/v1/checks"
        ? { body: JSON.stringify({ text: physicsReference }) }
        : {}),
    });
    expect(denied.status, path).toBe(403);
  }
});
test("held old online allow cannot publish a snapshot after a drained revocation", async () => {
  const both = await bothPrograms({ startWorker: false });
  cleanup.push(both.stop);
  const guest = await both.issue();
  const headers = {
    authorization: `Bearer ${guest.token}`,
    "content-type": "application/json",
  };
  const created = CheckResponse.parse(
    await (
      await fetch(`${both.apiUrl}/v1/checks`, {
        method: "POST",
        headers,
        body: JSON.stringify({ text: physicsReference }),
      })
    ).json(),
  ).data;
  const held = both.trap("check:read", "request", 2);
  const pending = fetch(`${both.apiUrl}/v1/checks/${created.id}`, { headers });
  await held.arrived;
  expect(await both.change(guest.guestId, { revoke: true })).toMatchObject({
    completed: true,
  });
  held.release();
  const response = await pending;
  expect(response.status).toBe(403);
  expect(await response.text()).not.toContain("Aspelmeyer");
  await both.restartWeb();
  expect(
    (await fetch(`${both.apiUrl}/v1/checks/${created.id}`, { headers })).status,
  ).toBe(403);
});
test("extension-local capability keeps a separate persistent identity and uses actual service tokens", async () => {
  const { extensionGuestIdentityStorage, guestCredentials } =
    await import("../../../packages/ui/src/guest-identity.ts");
  const both = await bothPrograms({ startWorker: false });
  cleanup.push(both.stop);
  const values: Record<string, unknown> = {};
  const local = {
    get: (key: string) => Promise.resolve({ [key]: values[key] }),
    set: (items: Record<string, unknown>) => {
      Object.assign(values, items);
      return Promise.resolve();
    },
  };
  let serial = Promise.resolve();
  const exclusive = <T>(operation: () => Promise<T>) => {
    const result = serial.then(operation);
    serial = result.then(
      () => {},
      () => {},
    );
    return result;
  };
  const storage = extensionGuestIdentityStorage(local, exclusive);
  const first = guestCredentials({
    storage,
    client: "extension",
    serviceUrl: both.serviceUrl,
  });
  const [a, b] = await Promise.all([first.credentials(), first.credentials()]);
  expect(a).toBe(b);
  const id = await storage.identity();
  const reopened = guestCredentials({
    storage: extensionGuestIdentityStorage(local, exclusive),
    client: "extension",
    serviceUrl: both.serviceUrl,
  });
  const next = await reopened.credentials();
  const claims = (token: string) =>
    JSON.parse(Buffer.from(token.split(".")[1]!, "base64url").toString()) as {
      guestId: string;
      sub: string;
      client: string;
    };
  expect(claims(next)).toMatchObject({
    guestId: id,
    sub: claims(a).sub,
    client: "extension",
  });
  const web = await both.issue();
  expect(claims(web.token).guestId).not.toBe(id);
  expect(JSON.stringify(values)).not.toContain(a);
  expect(Object.keys(values)).toEqual(["source-taster-guest-id-v1"]);
  const response = await fetch(`${both.apiUrl}/v1/structurings`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${next}`,
    },
    body: JSON.stringify({ text: physicsReference }),
  });
  expect(response.status).toBe(200);
});
test("actual 300-second expiry denies while authority allows; single-flight renewal preserves the Guest", async () => {
  const { guestCredentials, extensionGuestIdentityStorage } =
    await import("../../../packages/ui/src/guest-identity.ts");
  const both = await bothPrograms({ startWorker: false });
  cleanup.push(both.stop);
  const guest = await both.issue();
  const headers = {
    authorization: `Bearer ${guest.token}`,
    "content-type": "application/json",
  };
  await both.advance(300_000);
  const input = {
    method: "POST",
    headers,
    body: JSON.stringify({ text: physicsReference }),
  };
  expect((await fetch(`${both.apiUrl}/v1/structurings`, input)).status).toBe(
    401,
  );
  const renewed = await both.issue(guest.guestId);
  const claim = (t: string) =>
    JSON.parse(Buffer.from(t.split(".")[1]!, "base64url").toString()) as {
      sub: string;
      ownerId: string;
      guestContextId: string;
    };
  expect(claim(renewed.token)).toMatchObject({
    sub: claim(guest.token).sub,
    ownerId: claim(guest.token).ownerId,
    guestContextId: claim(guest.token).guestContextId,
  });
  expect(
    (
      await fetch(`${both.apiUrl}/v1/structurings`, {
        ...input,
        headers: { ...headers, authorization: `Bearer ${renewed.token}` },
      })
    ).status,
  ).toBe(200);
  const stored: Record<string, unknown> = {
    "source-taster-guest-id-v1": guest.guestId,
  };
  let serial = Promise.resolve();
  const storage = extensionGuestIdentityStorage(
    {
      get: (key) => Promise.resolve({ [key]: stored[key] }),
      set: (data) => {
        Object.assign(stored, data);
        return Promise.resolve();
      },
    },
    (operation) => {
      const result = serial.then(operation);
      serial = result.then(
        () => {},
        () => {},
      );
      return result;
    },
  );
  const supplier = guestCredentials({
    storage,
    client: "web",
    serviceUrl: both.serviceUrl,
    now: both.now,
  });
  const issued = await Promise.all([
    supplier.credentials(),
    supplier.credentials(),
    supplier.credentials(),
  ]);
  expect(issued.every((t) => t === issued[0])).toBe(true);
});
test("strict local JWT validation rejects malformed, substituted, wrong-purpose and invalid-time tokens", async () => {
  const { sign, createPrivateKey, generateKeyPairSync, randomUUID } =
    await import("node:crypto");
  const both = await bothPrograms({ startWorker: false });
  cleanup.push(both.stop);
  const guest = await both.issue();
  const original = JSON.parse(
    Buffer.from(guest.token.split(".")[1]!, "base64url").toString(),
  ) as Record<string, unknown>;
  const wrong = generateKeyPairSync("ed25519").privateKey;
  const signed = (
    claims: Record<string, unknown>,
    header: object = { typ: "at+jwt", alg: "EdDSA", kid: "access-1" },
    key = createPrivateKey(both.access.key.pem),
  ) => {
    const a = Buffer.from(JSON.stringify(header)).toString("base64url"),
      b = Buffer.from(JSON.stringify(claims)).toString("base64url");
    return `${a}.${b}.${sign(null, Buffer.from(`${a}.${b}`), key).toString("base64url")}`;
  };
  for (const [name, token] of [
    ["malformed", "bad.token"],
    ["signature", signed(original, undefined, wrong)],
    ["issuer", signed({ ...original, iss: "https://wrong.invalid" })],
    ["audience", signed({ ...original, aud: "https://wrong.invalid" })],
    [
      "algorithm",
      signed(original, { typ: "at+jwt", alg: "HS256", kid: "access-1" }),
    ],
    ["purpose", signed({ ...original, purpose: "authority-invalidation" })],
    [
      "expired",
      signed({
        ...original,
        iat: Number(original.iat) - 301,
        nbf: Number(original.iat) - 301,
        exp: Number(original.exp) - 301,
      }),
    ],
    [
      "future",
      signed({
        ...original,
        iat: Number(original.iat) + 10,
        nbf: Number(original.iat) + 10,
        exp: Number(original.exp) + 10,
      }),
    ],
    ["binding", signed({ ...original, sub: randomUUID() })],
    ["key", signed(original, { typ: "at+jwt", alg: "EdDSA", kid: "unknown" })],
  ]) {
    const response = await fetch(`${both.apiUrl}/v1/structurings`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ text: physicsReference }),
    });
    expect(response.status, name).toBe(name === "binding" ? 403 : 401);
  }
});
test("access-key rotation is bounded and refresh outage fails closed", async () => {
  const { generateKeyPairSync } = await import("node:crypto");
  const both = await bothPrograms({ startWorker: false });
  cleanup.push(both.stop);
  const guest = await both.issue();
  const call = (token: string) =>
    fetch(`${both.apiUrl}/v1/structurings`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ text: physicsReference }),
    });
  expect((await call(guest.token)).status).toBe(200);
  const key = generateKeyPairSync("ed25519");
  await both.service().command({
    accessKey: {
      kid: "access-2",
      pem: key.privateKey.export({ format: "pem", type: "pkcs8" }).toString(),
    },
  });
  await both.advance(1100);
  const rotated = await both.issue(guest.guestId);
  expect((await call(rotated.token)).status).toBe(200);
  expect((await call(guest.token)).status).toBe(401);
  await both.advance(30_001);
  await both.service().stop();
  expect((await call(rotated.token)).status).toBe(503);
});
test("program assertions cannot be replaced by access JWTs or cross-purpose/body/audience assertions", async () => {
  const { createHash, createPrivateKey, sign, randomUUID } =
    await import("node:crypto");
  const both = await bothPrograms({ startWorker: false });
  cleanup.push(both.stop);
  const guest = await both.issue();
  const guestClaims = JSON.parse(
    Buffer.from(guest.token.split(".")[1]!, "base64url").toString(),
  ) as { sub: string; ownerId: string; guestContextId: string };
  const body = JSON.stringify({
    ownerId: guestClaims.ownerId,
    actorId: guestClaims.sub,
    guestContextId: guestClaims.guestContextId,
    permission: "check:read",
    kind: "request",
  });
  const iat = Math.floor(both.now() / 1000);
  const base = {
    iss: both.serviceConfig.verificationIssuer,
    aud: both.serviceConfig.issuer,
    purpose: "guest-authority",
    iat,
    nbf: iat,
    exp: iat + 30,
    jti: randomUUID(),
    method: "POST",
    path: "/internal/guest-authority",
    bodyHash: createHash("sha256").update(body).digest("base64url"),
  };
  const assertion = (claims: object, typ = "service+jwt") => {
    const a = Buffer.from(
        JSON.stringify({
          alg: "EdDSA",
          typ,
          kid: both.verificationInternal.key.kid,
        }),
      ).toString("base64url"),
      b = Buffer.from(JSON.stringify(claims)).toString("base64url");
    return `${a}.${b}.${sign(null, Buffer.from(`${a}.${b}`), createPrivateKey(both.verificationInternal.key.pem)).toString("base64url")}`;
  };
  const call = (token: string) =>
    fetch(`${both.serviceUrl}/internal/guest-authority`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body,
    });
  expect((await call(assertion(base))).status).toBe(200);
  for (const token of [
    guest.token,
    assertion({ ...base, aud: "verification" }),
    assertion({ ...base, iss: "https://wrong.invalid" }),
    assertion({ ...base, purpose: "authority-invalidation" }),
    assertion({ ...base, bodyHash: "wrong" }),
    assertion({ ...base, exp: iat }),
    assertion({ ...base, iat: iat + 1, nbf: iat + 1, exp: iat + 31 }),
    assertion(base, "at+jwt"),
  ])
    expect((await call(token)).status).toBe(401);
  expect(
    (
      await fetch(`${both.apiUrl}/internal/guest-authority/invalidate`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${guest.token}`,
        },
        body: JSON.stringify({
          ownerId: guestClaims.ownerId,
          actorId: guestClaims.sub,
          guestContextId: guestClaims.guestContextId,
          version: 2,
          cancelWork: true,
        }),
      })
    ).status,
  ).toBe(401);
});
test("service outage before worker admission starts no work or progress publication", async () => {
  const both = await bothPrograms({ startWorker: false });
  cleanup.push(both.stop);
  const guest = await both.issue();
  const headers = {
    authorization: `Bearer ${guest.token}`,
    "content-type": "application/json",
  };
  const created = CheckResponse.parse(
    await (
      await fetch(`${both.apiUrl}/v1/checks`, {
        method: "POST",
        headers,
        body: JSON.stringify({ text: physicsReference }),
      })
    ).json(),
  ).data;
  await both.service().stop();
  const worker = both.worker();
  await worker.ready;
  await new Promise((resolve) => setTimeout(resolve, 1000));
  await worker.stop();
  await both.restartService();
  const snapshot = CheckResponse.parse(
    await (
      await fetch(`${both.apiUrl}/v1/checks/${created.id}`, { headers })
    ).json(),
  ).data;
  expect(snapshot.lastEventSeq).toBe(created.lastEventSeq);
  expect(both.fixtures.requests).toHaveLength(0);
});
test("revocation between prefetched SSE frames drains output and reconnect is denied", async () => {
  const both = await bothPrograms();
  cleanup.push(both.stop);
  const guest = await both.issue();
  const headers = {
    authorization: `Bearer ${guest.token}`,
    "content-type": "application/json",
  };
  const created = CheckResponse.parse(
    await (
      await fetch(`${both.apiUrl}/v1/checks`, {
        method: "POST",
        headers,
        body: JSON.stringify({ text: physicsReference }),
      })
    ).json(),
  ).data;
  const { eventually } = await import("./support/both-programs.ts");
  await eventually(
    async () =>
      CheckResponse.parse(
        await (
          await fetch(`${both.apiUrl}/v1/checks/${created.id}`, { headers })
        ).json(),
      ).data.state === "ended",
  );
  const held = both.trap("check:read", "request", 4);
  const events: unknown[] = [];
  const consume = (async () => {
    const response = await fetch(
      `${both.apiUrl}/v1/checks/${created.id}/events`,
      { headers },
    );
    for await (const frame of readSseFrames(response.body!))
      events.push(JSON.parse(frame.data));
  })();
  await held.arrived;
  await eventually(() => events.length === 1);
  expect(await both.change(guest.guestId, { revoke: true })).toMatchObject({
    completed: true,
  });
  held.release();
  await consume;
  expect(events).toHaveLength(1);
  expect(
    (await fetch(`${both.apiUrl}/v1/checks/${created.id}/events`, { headers }))
      .status,
  ).toBe(403);
});
test("post-source old authority cannot commit a late Verdict across invalidation and restart", async () => {
  const both = await bothPrograms();
  cleanup.push(both.stop);
  const guest = await both.issue();
  const headers = {
    authorization: `Bearer ${guest.token}`,
    "content-type": "application/json",
  };
  const source = both.fixtures.hold("/works/10.1038/nphys1170");
  const created = CheckResponse.parse(
    await (
      await fetch(`${both.apiUrl}/v1/checks`, {
        method: "POST",
        headers,
        body: JSON.stringify({ text: physicsReference }),
      })
    ).json(),
  ).data;
  await source.arrived;
  const held = both.trap("check:create", "work");
  source.release();
  await held.arrived;
  const { Permission } = await import("@source-taster/contract-internal");
  expect(
    await both.change(guest.guestId, {
      permissions: Permission.options.filter((p) => p !== "check:create"),
    }),
  ).toMatchObject({ completed: true });
  held.release();
  await both.restartWeb();
  await both.restartService();
  const snapshot = CheckResponse.parse(
    await (
      await fetch(`${both.apiUrl}/v1/checks/${created.id}`, { headers })
    ).json(),
  ).data;
  expect(snapshot.state).toBe("ended");
  expect(snapshot.references[0]?.outcome).toEqual({
    kind: "status",
    status: "cancelled",
  });
  const cursor = snapshot.lastEventCursor;
  const replay = await fetch(`${both.apiUrl}/v1/checks/${created.id}/events`, {
    headers: { ...headers, "last-event-id": cursor },
  });
  expect(await replay.text()).toBe("");
  expect(
    (
      await fetch(`${both.apiUrl}/v1/checks`, {
        method: "POST",
        headers,
        body: JSON.stringify({ text: physicsReference }),
      })
    ).status,
  ).toBe(403);
});
test("invalidation remains durably denied while callback is unavailable and retries after restart", async () => {
  const both = await bothPrograms({ startWorker: false });
  cleanup.push(both.stop);
  const guest = await both.issue();
  const headers = {
    authorization: `Bearer ${guest.token}`,
    "content-type": "application/json",
  };
  const created = CheckResponse.parse(
    await (
      await fetch(`${both.apiUrl}/v1/checks`, {
        method: "POST",
        headers,
        body: JSON.stringify({ text: physicsReference }),
      })
    ).json(),
  ).data;
  await both.web().stop();
  expect(
    await both.change(
      guest.guestId,
      { permissions: ["check:read", "check:renew"] },
      false,
    ),
  ).toMatchObject({ completed: false });
  await both.restartService();
  await both.restartWeb();
  const { eventually } = await import("./support/both-programs.ts");
  await eventually(
    async () =>
      (await fetch(`${both.apiUrl}/v1/checks/${created.id}`, { headers }))
        .status === 200,
  );
  const snapshot = CheckResponse.parse(
    await (
      await fetch(`${both.apiUrl}/v1/checks/${created.id}`, { headers })
    ).json(),
  ).data;
  expect(snapshot.references[0]?.outcome).toEqual({
    kind: "status",
    status: "cancelled",
  });
});
test("permission removal while a real provider permit is occupied prevents the waiting dispatch", async () => {
  const both = await bothPrograms();
  cleanup.push(both.stop);
  const a = await both.issue(),
    b = await both.issue();
  const create = async (token: string) =>
    CheckResponse.parse(
      await (
        await fetch(`${both.apiUrl}/v1/checks`, {
          method: "POST",
          headers: {
            authorization: `Bearer ${token}`,
            "content-type": "application/json",
          },
          body: JSON.stringify({ text: physicsReference }),
        })
      ).json(),
    ).data;
  const held = both.fixtures.hold("/works/10.1038/nphys1170");
  await create(a.token);
  await held.arrived;
  const waiting = await create(b.token);
  const { eventually } = await import("./support/both-programs.ts");
  await eventually(
    () =>
      both.fixtures.requests.filter((r) => r.path.startsWith("/api/handles/"))
        .length === 2,
  );
  const { Permission } = await import("@source-taster/contract-internal");
  await both.change(b.guestId, {
    permissions: Permission.options.filter((p) => p !== "check:create"),
  });
  held.release();
  await new Promise((resolve) => setTimeout(resolve, 400));
  expect(
    both.fixtures.requests.filter((r) => r.path.startsWith("/works/")),
  ).toHaveLength(1);
  const snapshot = CheckResponse.parse(
    await (
      await fetch(`${both.apiUrl}/v1/checks/${waiting.id}`, {
        headers: { authorization: `Bearer ${b.token}` },
      })
    ).json(),
  ).data;
  expect(snapshot.references[0]?.outcome).toEqual({
    kind: "status",
    status: "cancelled",
  });
});
test("service failure during a provider Retry-After wait prevents retry and a late Verdict", async () => {
  const both = await bothPrograms();
  cleanup.push(both.stop);
  const guest = await both.issue();
  both.fixtures.respond(
    "/works/10.1038/nphys1170",
    429,
    {},
    { "retry-after": "1" },
  );
  const response = await fetch(`${both.apiUrl}/v1/checks`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${guest.token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({ text: physicsReference }),
  });
  const created = CheckResponse.parse(await response.json()).data;
  const { eventually } = await import("./support/both-programs.ts");
  await eventually(() =>
    both.fixtures.requests.some((r) => r.path.startsWith("/works/")),
  );
  await both.service().stop();
  await new Promise((resolve) => setTimeout(resolve, 1400));
  expect(
    both.fixtures.requests.filter((r) => r.path.startsWith("/works/")),
  ).toHaveLength(1);
  await both.restartService();
  const snapshot = CheckResponse.parse(
    await (
      await fetch(`${both.apiUrl}/v1/checks/${created.id}`, {
        headers: { authorization: `Bearer ${guest.token}` },
      })
    ).json(),
  ).data;
  expect(snapshot.references[0]?.outcome.kind).toBe("status");
  // A recovered authority outage is a technical failure, never a zero-attempt
  // billable source Verdict after the original Reference deadline.
  await both.advance(45001);
  const { eventually: recovered } = await import("./support/both-programs.ts");
  let terminal = snapshot;
  await recovered(async () => {
    terminal = CheckResponse.parse(
      await (
        await fetch(`${both.apiUrl}/v1/checks/${created.id}`, {
          headers: { authorization: `Bearer ${guest.token}` },
        })
      ).json(),
    ).data;
    return terminal.state === "ended";
  });
  expect(terminal.references[0]?.outcome).toEqual({
    kind: "status",
    status: "failed",
  });
});
test("idle stream closes on current permission loss, stops lease renewal, and refuses reconnect", async () => {
  const both = await bothPrograms({ startWorker: false });
  cleanup.push(both.stop);
  const guest = await both.issue();
  const headers = {
    authorization: `Bearer ${guest.token}`,
    "content-type": "application/json",
  };
  const created = CheckResponse.parse(
    await (
      await fetch(`${both.apiUrl}/v1/checks`, {
        method: "POST",
        headers,
        body: JSON.stringify({ text: physicsReference }),
      })
    ).json(),
  ).data;
  const response = await fetch(
    `${both.apiUrl}/v1/checks/${created.id}/events`,
    { headers },
  );
  const reader = response.body!.getReader();
  const first = await reader.read();
  expect(new TextDecoder().decode(first.value)).toContain("check.updated");
  await both.change(guest.guestId, {
    permissions: [
      "check:create",
      "check:cancel",
      "check:renew",
      "structuring:create",
    ],
  });
  const next = await reader.read();
  expect(next.done).toBe(true);
  expect(
    (await fetch(`${both.apiUrl}/v1/checks/${created.id}/events`, { headers }))
      .status,
  ).toBe(403);
  // No stream-originated keepalive can prolong #81's client acknowledgement lease.
  await both.advance(76000);
  await both.change(guest.guestId, {
    permissions: [
      "check:create",
      "check:read",
      "check:cancel",
      "check:renew",
      "structuring:create",
    ],
  });
  const snapshot = CheckResponse.parse(
    await (
      await fetch(`${both.apiUrl}/v1/checks/${created.id}`, { headers })
    ).json(),
  ).data;
  expect(snapshot.endReason).toBe("lease-expired");
});
test("reachable authority and valid Guests cannot activate the deployable unmeasured hosted program", async () => {
  const { spawn } = await import("node:child_process");
  const both = await bothPrograms({ startWorker: false });
  cleanup.push(both.stop);
  const guest = await both.issue();
  expect(
    (
      await fetch(`${both.apiUrl}/v1/structurings`, {
        method: "POST",
        headers: {
          authorization: `Bearer ${guest.token}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({ text: physicsReference }),
      })
    ).status,
  ).toBe(200);
  for (const entry of [
    "src/web.ts",
    "src/worker.ts",
    "dist/web.js",
    "dist/worker.js",
  ]) {
    const child = spawn(process.execPath, [entry], {
      cwd: new URL("..", import.meta.url),
      env: {
        PATH: process.env.PATH,
        NODE_ENV: "test",
        ...both.venv,
        SOURCE_TASTER_MODE: "hosted",
      },
      stdio: ["ignore", "pipe", "pipe"],
    });
    let output = "";
    child.stdout.on("data", (b) => {
      output += String(b);
    });
    child.stderr.on("data", (b) => {
      output += String(b);
    });
    const [code] = (await once(child, "exit")) as [
      number | null,
      NodeJS.Signals | null,
    ];
    expect(code, entry).toBe(78);
    expect(output, entry).toContain("Measured configuration");
  }
});
for (const failure of ["outage", "expiry"] as const)
  test(`idle SSE ${failure} closes without another frame or heartbeat`, async () => {
    const both = await bothPrograms({ startWorker: false });
    cleanup.push(both.stop);
    const guest = await both.issue();
    const headers = {
      authorization: `Bearer ${guest.token}`,
      "content-type": "application/json",
    };
    const created = CheckResponse.parse(
      await (
        await fetch(`${both.apiUrl}/v1/checks`, {
          method: "POST",
          headers,
          body: JSON.stringify({ text: physicsReference }),
        })
      ).json(),
    ).data;
    const response = await fetch(
      `${both.apiUrl}/v1/checks/${created.id}/events`,
      { headers },
    );
    const reader = response.body!.getReader();
    expect(new TextDecoder().decode((await reader.read()).value)).toContain(
      "check.updated",
    );
    if (failure === "outage") await both.service().stop();
    else await both.advance(300_000);
    expect((await reader.read()).done).toBe(true);
    expect(
      (
        await fetch(`${both.apiUrl}/v1/checks/${created.id}/events`, {
          headers,
        })
      ).status,
    ).toBe(failure === "outage" ? 503 : 401);
  });
test("service loss before snapshot output denies protected content", async () => {
  const both = await bothPrograms({ startWorker: false });
  cleanup.push(both.stop);
  const guest = await both.issue();
  const headers = {
    authorization: `Bearer ${guest.token}`,
    "content-type": "application/json",
  };
  const created = CheckResponse.parse(
    await (
      await fetch(`${both.apiUrl}/v1/checks`, {
        method: "POST",
        headers,
        body: JSON.stringify({ text: physicsReference }),
      })
    ).json(),
  ).data;
  const held = both.trap("check:read", "request");
  const pending = fetch(`${both.apiUrl}/v1/checks/${created.id}`, { headers });
  await held.arrived;
  await both.service().stop();
  held.release();
  const response = await pending;
  expect(response.status).toBe(503);
  expect((await response.text()).includes("Aspelmeyer")).toBe(false);
});
test("internal trust rotation removes old keys immediately and unknown keys never acquire authority", async () => {
  const {
    createHash,
    createPrivateKey,
    generateKeyPairSync,
    sign,
    randomUUID,
  } = await import("node:crypto");
  const { writeFile } = await import("node:fs/promises");
  const both = await bothPrograms({ startWorker: false });
  cleanup.push(both.stop);
  const guest = await both.issue();
  const claims = JSON.parse(
    Buffer.from(guest.token.split(".")[1]!, "base64url").toString(),
  ) as { sub: string; ownerId: string; guestContextId: string };
  const body = JSON.stringify({
    actorId: claims.sub,
    ownerId: claims.ownerId,
    guestContextId: claims.guestContextId,
    permission: "check:read",
    kind: "request",
  });
  const rotated = generateKeyPairSync("ed25519"),
    newKey = {
      kid: "verification-internal-2",
      pem: rotated.privateKey
        .export({ format: "pem", type: "pkcs8" })
        .toString(),
    };
  function signed(key: { kid: string; pem: string }) {
    const iat = Math.floor(both.now() / 1000);
    const a = Buffer.from(
        JSON.stringify({ alg: "EdDSA", typ: "service+jwt", kid: key.kid }),
      ).toString("base64url"),
      b = Buffer.from(
        JSON.stringify({
          iss: both.serviceConfig.verificationIssuer,
          aud: both.serviceConfig.issuer,
          purpose: "guest-authority",
          iat,
          nbf: iat,
          exp: iat + 30,
          jti: randomUUID(),
          method: "POST",
          path: "/internal/guest-authority",
          bodyHash: createHash("sha256").update(body).digest("base64url"),
        }),
      ).toString("base64url");
    return `${a}.${b}.${sign(null, Buffer.from(`${a}.${b}`), createPrivateKey(key.pem)).toString("base64url")}`;
  }
  const call = (key: { kid: string; pem: string }) =>
    fetch(`${both.serviceUrl}/internal/guest-authority`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${signed(key)}`,
      },
      body,
    });
  expect((await call(newKey)).status).toBe(401);
  expect((await call(both.verificationInternal.key)).status).toBe(200);
  await writeFile(
    both.serviceConfigPath,
    JSON.stringify({
      ...both.serviceConfig,
      verificationJwks: {
        keys: [
          {
            ...rotated.publicKey.export({ format: "jwk" }),
            kid: newKey.kid,
            alg: "EdDSA",
            use: "sig",
          },
        ],
      },
    }),
  );
  expect((await call(both.verificationInternal.key)).status).toBe(401);
  expect((await call(newKey)).status).toBe(200);
});
test.each(["verification", "service-access", "service-internal"] as const)(
  "%s rejects equivalent own-key JWK aliases at trust reload and startup",
  async (receiver) => {
    const { createHash, createPrivateKey, sign, randomUUID } =
      await import("node:crypto");
    const { readFile, writeFile } = await import("node:fs/promises");
    const both = await bothPrograms({ startWorker: false });
    cleanup.push(both.stop);
    const guest = await both.issue();
    const claims = JSON.parse(
      Buffer.from(guest.token.split(".")[1]!, "base64url").toString(),
    ) as { sub: string; ownerId: string; guestContextId: string };
    const verification = receiver === "verification";
    const own = verification
      ? both.verificationInternal
      : receiver === "service-access"
        ? both.access
        : both.serviceInternal;
    const peer = verification
      ? both.serviceInternal
      : both.verificationInternal;
    const path = verification
      ? "/internal/guest-authority/invalidate"
      : "/internal/guest-authority";
    const body = JSON.stringify({
      actorId: claims.sub,
      ownerId: claims.ownerId,
      guestContextId: claims.guestContextId,
      ...(verification
        ? { version: 1, cancelWork: false }
        : { permission: "check:read", kind: "request" }),
    });
    const iat = Math.floor(both.now() / 1000);
    const call = (key: { pem: string; kid: string }) => {
      const header = Buffer.from(
        JSON.stringify({ alg: "EdDSA", typ: "service+jwt", kid: key.kid }),
      ).toString("base64url");
      const payload = Buffer.from(
        JSON.stringify({
          iss: verification
            ? both.serviceConfig.issuer
            : both.serviceConfig.verificationIssuer,
          aud: verification
            ? both.serviceConfig.verificationAudience
            : both.serviceConfig.issuer,
          purpose: verification ? "authority-invalidation" : "guest-authority",
          iat,
          nbf: iat,
          exp: iat + 30,
          jti: randomUUID(),
          method: "POST",
          path,
          bodyHash: createHash("sha256").update(body).digest("base64url"),
        }),
      ).toString("base64url");
      const message = `${header}.${payload}`;
      const token = `${message}.${sign(null, Buffer.from(message), createPrivateKey(key.pem)).toString("base64url")}`;
      return fetch(`${verification ? both.apiUrl : both.serviceUrl}${path}`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body,
      });
    };
    expect((await call(peer.key)).status).toBe(200);
    // An Ed25519 x has two unused low bits in its final base64url character.
    // Changing one preserves the decoded public key and signature verification.
    const alphabet =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
    const x = own.jwk.x!;
    const alias = `${x.slice(0, -1)}${alphabet[alphabet.indexOf(x.at(-1)!) | 1]}`;
    const configPath = verification
      ? both.venv.SOURCE_TASTER_AUTH_CONFIG
      : both.serviceConfigPath;
    const config = JSON.parse(await readFile(configPath, "utf8")) as object;
    await writeFile(
      configPath,
      JSON.stringify({
        ...config,
        [verification ? "serviceInternalJwks" : "verificationJwks"]: {
          keys: [{ ...own.jwk, x: alias, kid: "peer-alias" }],
        },
      }),
    );
    expect((await call({ ...own.key, kid: "peer-alias" })).status).toBe(401);
    await expect(
      verification ? both.restartWeb() : both.restartService(),
    ).rejects.toThrow();
  },
);
test("fetch SSE renews an expired token for the same Guest and reconnects with its cursor and client version", async () => {
  const { verificationClient, watchCheckEvents } =
    await import("@source-taster/contract-verification/client");
  const { guestCredentials, extensionGuestIdentityStorage } =
    await import("../../../packages/ui/src/guest-identity.ts");
  const both = await bothPrograms({
    startWorker: false,
    clientLeaseMs: 600000,
  });
  cleanup.push(both.stop);
  const values: Record<string, unknown> = {};
  const storage = extensionGuestIdentityStorage(
    {
      get: (key) => Promise.resolve({ [key]: values[key] }),
      set: (items) => {
        Object.assign(values, items);
        return Promise.resolve();
      },
    },
    (operation) => operation(),
  );
  const supplier = guestCredentials({
    storage,
    client: "web",
    serviceUrl: both.serviceUrl,
    now: both.now,
  });
  const api = verificationClient({
    baseUrl: both.apiUrl,
    client: "web/0.0.0",
    credentials: supplier.credentials,
  });
  const created = await api.createCheck(physicsReference);
  const seen: {
    cursor: string | null;
    client: string | null;
    token: string | null;
  }[] = [];
  const fetchEdge: typeof fetch = async (input, init) => {
    const response = await fetch(input, init);
    const headers = new Headers(init?.headers);
    seen.push({
      cursor: headers.get("last-event-id"),
      client: headers.get("source-taster-client"),
      token: headers.get("authorization"),
    });
    return response;
  };
  const abort = new AbortController();
  const watched = watchCheckEvents(created.id, {
    baseUrl: both.apiUrl,
    client: "web/0.0.0",
    credentials: supplier.credentials,
    lastEventSeq: created.lastEventSeq,
    signal: abort.signal,
    retryDelayMs: 10,
    fetch: fetchEdge,
    onEvent: () => {},
  });
  try {
    const { eventually } = await import("./support/both-programs.ts");
    await eventually(() => seen.length === 1);
    const id = await storage.identity();
    await both.advance(300000);
    await eventually(() => seen.length >= 2);
    expect(seen[1]?.cursor).toBe(created.lastEventCursor);
    expect(seen[1]?.client).toBe("web/0.0.0");
    expect(seen[1]?.token !== seen[0]?.token).toBe(true);
    expect((await storage.identity()) === id).toBe(true);
    await api.cancelCheck(created.id);
    await watched;
  } finally {
    abort.abort();
    await watched.catch(() => {});
  }
});
test("removing lease permission denies renewal while preserving independently authorized reads and replay", async () => {
  const both = await bothPrograms({ startWorker: false });
  cleanup.push(both.stop);
  const guest = await both.issue();
  const headers = {
    authorization: `Bearer ${guest.token}`,
    "content-type": "application/json",
  };
  const created = CheckResponse.parse(
    await (
      await fetch(`${both.apiUrl}/v1/checks`, {
        method: "POST",
        headers,
        body: JSON.stringify({ text: physicsReference }),
      })
    ).json(),
  ).data;
  await both.change(guest.guestId, {
    permissions: [
      "check:create",
      "check:read",
      "check:cancel",
      "structuring:create",
    ],
  });
  expect(
    (
      await fetch(`${both.apiUrl}/v1/checks/${created.id}/lease`, {
        method: "POST",
        headers,
      })
    ).status,
  ).toBe(403);
  expect(
    (await fetch(`${both.apiUrl}/v1/checks/${created.id}`, { headers })).status,
  ).toBe(200);
  const response = await fetch(
    `${both.apiUrl}/v1/checks/${created.id}/events`,
    { headers },
  );
  expect(response.status).toBe(200);
  const reader = response.body!.getReader();
  expect(new TextDecoder().decode((await reader.read()).value)).toContain(
    "check.updated",
  );
  await reader.cancel();
});

test("source timeouts retain real attempts and publish incomplete evidence before the Reference deadline", async () => {
  const both = await bothPrograms();
  cleanup.push(both.stop);
  const guest = await both.issue();
  both.fixtures.hold("/api/handles/10.1038/nphys1170");
  both.fixtures.hold("/works/10.1038/nphys1170");
  const headers = {
    authorization: `Bearer ${guest.token}`,
    "content-type": "application/json",
  };
  const created = CheckResponse.parse(
    await (
      await fetch(`${both.apiUrl}/v1/checks`, {
        method: "POST",
        headers,
        body: JSON.stringify({ text: physicsReference }),
      })
    ).json(),
  ).data;
  const began = Date.now();
  const { eventually } = await import("./support/both-programs.ts");
  let snapshot = created;
  await eventually(async () => {
    snapshot = CheckResponse.parse(
      await (
        await fetch(`${both.apiUrl}/v1/checks/${created.id}`, { headers })
      ).json(),
    ).data;
    return snapshot.state === "ended";
  }, 28000);
  expect(Date.now() - began).toBeLessThan(30000);
  expect(snapshot.references[0]?.outcome).toMatchObject({
    kind: "verdict",
    verdict: "not-verifiable",
    evidence: [
      {
        source: "doi.org",
        outcome: "unavailable",
        attempts: 2,
        reason: "request-unavailable",
      },
      {
        source: "crossref",
        outcome: "unavailable",
        attempts: 2,
        reason: "request-unavailable",
      },
    ],
  });
  expect(
    both.fixtures.requests.filter((r) => r.path.startsWith("/api/handles/")),
  ).toHaveLength(2);
  expect(
    both.fixtures.requests.filter((r) => r.path.startsWith("/works/")),
  ).toHaveLength(2);
}, 40000);

test("delayed current authority cannot expire a held provider reservation or compress actual dispatch pacing", async () => {
  const both = await bothPrograms({ startWorker: false });
  cleanup.push(both.stop);
  const guest = await both.issue();
  const headers = {
    authorization: `Bearer ${guest.token}`,
    "content-type": "application/json",
  };
  const path = "/works/10.1038/nphys1170";
  const held = both.fixtures.hold(path, true);
  for (let i = 0; i < 2; i++)
    expect(
      (
        await fetch(`${both.apiUrl}/v1/checks`, {
          method: "POST",
          headers,
          body: JSON.stringify({ text: physicsReference }),
        })
      ).status,
    ).toBe(201);
  both.delayWork(850);
  await Promise.all([both.worker().ready, both.worker().ready]);
  await held.arrived;
  both.delayWork(0);
  const { eventually } = await import("./support/both-programs.ts");
  await eventually(
    () => both.fixtures.requests.filter((r) => r.path === path).length >= 2,
    26000,
  );
  const sent = both.fixtures.requests.filter((r) => r.path === path);
  expect(sent[0]?.completedAt).toBeDefined();
  expect(sent[1]!.at).toBeGreaterThanOrEqual(sent[0]!.completedAt!);
  expect(sent[1]!.at - sent[0]!.at).toBeGreaterThanOrEqual(200);
}, 40000);

test("hosted concurrent workers revalidate the global turn before admitting either eligible Check", async () => {
  const both = await bothPrograms({ startWorker: false });
  cleanup.push(both.stop);
  const guest = await both.issue();
  const headers = {
    authorization: `Bearer ${guest.token}`,
    "content-type": "application/json",
  };
  const checks: Check[] = [];
  for (const name of ["a", "b"]) {
    // Two Checks of ten fit the Guest's 20 per day; the fairness assertion
    // below concerns the shared admission turn, not a larger batch.
    const references = Array.from({ length: 10 }, (_, i) => {
      const DOI = `10.5555/hosted-fair-${name}${i}`;
      both.fixtures.hold(`/api/handles/${DOI}`);
      return { originalText: DOI, fields: { DOI } };
    });
    checks.push(
      CheckResponse.parse(
        await (
          await fetch(`${both.apiUrl}/v1/checks`, {
            method: "POST",
            headers,
            body: JSON.stringify({ references }),
          })
        ).json(),
      ).data,
    );
  }
  const admission = both.holdWork();
  both.delayWork(500);
  await Promise.all([both.worker().ready, both.worker().ready]);
  await admission.arrived;
  await new Promise((resolve) => setTimeout(resolve, 350));
  admission.release();
  const { eventually } = await import("./support/both-programs.ts");
  let admitted: number[] = [];
  await eventually(async () => {
    admitted = await Promise.all(
      checks.map(async (check) => {
        const snapshot = CheckResponse.parse(
          await (
            await fetch(`${both.apiUrl}/v1/checks/${check.id}`, { headers })
          ).json(),
        ).data;
        return snapshot.references.filter((r) => r.progress !== "queued")
          .length;
      }),
    );
    return admitted.reduce((a, b) => a + b, 0) >= 10;
  });
  expect(admitted, "first admission wave must share the global turns").toEqual([
    5, 5,
  ]);
  both.delayWork(0);
  // A stale-turn loser must not consume the last wake-up or stall the next turn.
  await eventually(async () =>
    (
      await Promise.all(
        checks.map(
          async (check) =>
            CheckResponse.parse(
              await (
                await fetch(`${both.apiUrl}/v1/checks/${check.id}`, { headers })
              ).json(),
            ).data.references.filter((r) => r.progress !== "queued").length,
        ),
      )
    ).every((n) => n === 10),
  );
  for (const check of checks)
    expect(
      (
        await fetch(`${both.apiUrl}/v1/checks/${check.id}/cancel`, {
          method: "POST",
          headers,
        })
      ).status,
    ).toBe(200);
}, 40000);

test("v2 bibliographic execution retains current Guest authority through source waits and late body cancellation", async () => {
  const { CheckResponse: V2 } =
    await import("@source-taster/contract-verification/v2");
  const { startDoiFixtures } = await import("./support/doi-fixtures.ts");
  const oa = await startDoiFixtures();
  const held = oa.hold("/works", true);
  oa.respond("/works", 200, {
    results: [
      {
        id: "https://openalex.org/W77",
        title: "Synthetic article",
        authorships: [{ author: { display_name: "Alpha" } }],
      },
    ],
  });
  const both = await bothPrograms({
    verificationEnv: {
      SOURCE_TASTER_BIBLIOGRAPHIC_PREVIEW: "uncalibrated",
      SOURCE_TASTER_OPENALEX_ENABLED: "true",
      SOURCE_TASTER_OPENALEX_BASE_URL: oa.env.SOURCE_TASTER_CROSSREF_BASE_URL,
    },
  });
  cleanup.push(async () => {
    held.release();
    await both.stop();
    await oa.stop();
  });
  const guest = await both.issue();
  const headers = {
    authorization: `Bearer ${guest.token}`,
    "content-type": "application/json",
  };
  const created = V2.parse(
    await (
      await fetch(`${both.apiUrl}/v2/checks`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          references: [
            {
              originalText: "Synthetic article",
              fields: {
                title: "Synthetic article",
                author: [{ family: "Alpha" }],
              },
            },
          ],
        }),
      })
    ).json(),
  ).data;
  await held.arrived;
  await both.change(guest.guestId, { revoke: true });
  held.release();
  for (const [suffix, method] of [
    ["", "GET"],
    ["/events", "GET"],
    ["/cancel", "POST"],
    ["/lease", "POST"],
  ])
    expect(
      (
        await fetch(`${both.apiUrl}/v2/checks/${created.id}${suffix}`, {
          method,
          headers,
        })
      ).status,
    ).toBe(403);
  expect(oa.requests).toHaveLength(1);
  expect(both.fixtures.requests).toHaveLength(0);
});

test("v2 output cannot publish a prefetched bibliographic snapshot after drained authority invalidation", async () => {
  const { CheckResponse: V2 } =
    await import("@source-taster/contract-verification/v2");
  const both = await bothPrograms({ startWorker: false });
  cleanup.push(both.stop);
  const guest = await both.issue();
  const headers = {
    authorization: `Bearer ${guest.token}`,
    "content-type": "application/json",
  };
  const created = V2.parse(
    await (
      await fetch(`${both.apiUrl}/v2/checks`, {
        method: "POST",
        headers,
        body: JSON.stringify({ text: physicsReference }),
      })
    ).json(),
  ).data;
  const held = both.trap("check:read", "request", 2);
  const pending = fetch(`${both.apiUrl}/v2/checks/${created.id}`, { headers });
  await held.arrived;
  await both.change(guest.guestId, { revoke: true });
  held.release();
  const response = await pending;
  expect(response.status).toBe(403);
  expect(await response.text()).not.toContain("Aspelmeyer");
});

test("v2 completed OpenAlex evidence cannot commit through a stale precommit authority decision", async () => {
  const { CheckResponse: V2 } =
    await import("@source-taster/contract-verification/v2");
  const { startDoiFixtures } = await import("./support/doi-fixtures.ts");
  const { Permission } = await import("@source-taster/contract-internal");
  const oa = await startDoiFixtures();
  const source = oa.hold("/works");
  oa.respond("/works", 200, {
    results: [
      {
        id: "https://openalex.org/W77",
        title: "Synthetic article",
        authorships: [{ author: { display_name: "Alpha" } }],
      },
    ],
  });
  const both = await bothPrograms({
    verificationEnv: {
      SOURCE_TASTER_BIBLIOGRAPHIC_PREVIEW: "uncalibrated",
      SOURCE_TASTER_OPENALEX_ENABLED: "true",
      SOURCE_TASTER_OPENALEX_BASE_URL: oa.env.SOURCE_TASTER_CROSSREF_BASE_URL,
    },
  });
  cleanup.push(async () => {
    source.release();
    await both.stop();
    await oa.stop();
  });
  const guest = await both.issue();
  const headers = {
    authorization: `Bearer ${guest.token}`,
    "content-type": "application/json",
  };
  const created = V2.parse(
    await (
      await fetch(`${both.apiUrl}/v2/checks`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          references: [
            {
              originalText: "Synthetic article",
              fields: {
                title: "Synthetic article",
                author: [{ family: "Alpha" }],
              },
            },
          ],
        }),
      })
    ).json(),
  ).data;
  await source.arrived;
  const held = both.trap("check:create", "work");
  source.release();
  await held.arrived;
  expect(
    await both.change(guest.guestId, {
      permissions: Permission.options.filter((p) => p !== "check:create"),
    }),
  ).toMatchObject({ completed: true });
  held.release();
  await both.restartWeb();
  const snapshot = V2.parse(
    await (
      await fetch(`${both.apiUrl}/v2/checks/${created.id}`, { headers })
    ).json(),
  ).data;
  expect(snapshot.references[0]!.outcome).toEqual({
    kind: "status",
    status: "cancelled",
  });
  const replay = await fetch(`${both.apiUrl}/v2/checks/${created.id}/events`, {
    headers: { ...headers, "last-event-id": snapshot.lastEventCursor },
  });
  expect(await replay.text()).toBe("");
  expect(oa.requests).toHaveLength(1);
});

test.each([2, 3])(
  "citation downloads require current Owner authority through publication guard %s",
  async (skip) => {
    const { CheckResponse: V2 } =
      await import("@source-taster/contract-verification/v2");
    const both = await bothPrograms({ startWorker: false });
    cleanup.push(both.stop);
    const guest = await both.issue();
    const headers = {
      authorization: `Bearer ${guest.token}`,
      "content-type": "application/json",
    };
    const created = V2.parse(
      await (
        await fetch(`${both.apiUrl}/v2/checks`, {
          method: "POST",
          headers,
          body: JSON.stringify({ text: physicsReference }),
        })
      ).json(),
    ).data;
    const url = `${both.apiUrl}/v2/checks/${created.id}/export`;
    const body = JSON.stringify({ format: "csl-json", mode: "original" });
    expect(
      (
        await fetch(url, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body,
        })
      ).status,
    ).toBe(401);
    const foreign = await both.issue();
    expect(
      (
        await fetch(url, {
          method: "POST",
          headers: { ...headers, authorization: `Bearer ${foreign.token}` },
          body,
        })
      ).status,
    ).toBe(404);
    const allowed = await fetch(url, { method: "POST", headers, body });
    expect(allowed.status).toBe(200);
    expect(await allowed.text()).toContain("Measured measurement");
    // First request authorizes; second decision guards snapshot read; third is
    // after serialization, immediately before headers and the guarded body write.
    const held = both.trap("check:read", "request", skip);
    const pending = fetch(url, { method: "POST", headers, body });
    await held.arrived;
    expect(await both.change(guest.guestId, { revoke: true })).toMatchObject({
      completed: true,
    });
    held.release();
    const denied = await pending;
    expect(denied.status).toBe(skip === 2 ? 403 : 200);
    expect(await denied.text().catch(() => "aborted")).not.toContain(
      "Aspelmeyer",
    );
    expect((await fetch(url, { method: "POST", headers, body })).status).toBe(
      403,
    );
  },
);
