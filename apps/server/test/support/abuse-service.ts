// SPDX-License-Identifier: AGPL-3.0-or-later
// Source-only composition; only the unavailable private HTTP edge is faked.
import { once } from "node:events";
import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
} from "node:http";
import {
  createHash,
  generateKeyPairSync,
  randomUUID,
  sign,
  verify,
} from "node:crypto";
import { serve } from "@hono/node-server";
import { createParser } from "@source-taster/core";
import pg from "pg";
import { setupDatabase } from "../../scripts/db-setup.ts";
import { testDatabase } from "./processes.ts";
import { createPrisma } from "../../src/db/prisma.ts";
import { createQueue } from "../../src/checks/queue.ts";
import { createCheckStore } from "../../src/checks/store.ts";
import { listenForEvents } from "../../src/checks/events.ts";
import { hostedAuthority } from "../../src/authority/hosted.ts";
import { createApp } from "../../src/http/app.ts";
import { createAbuseLimiter } from "../../src/abuse/limiter.ts";
import type { HostedSettings } from "../../src/authority/crypto.ts";
export async function abuseService() {
  const database = testDatabase();
  await setupDatabase(database.adminUrl, database.appUrl);
  let now = Date.parse("2026-10-31T12:00:00Z");
  const clock = { now: () => now };
  const access = generateKeyPairSync("ed25519"),
    internal = generateKeyPairSync("ed25519");
  const jwks = {
    keys: [
      {
        ...access.publicKey.export({ format: "jwk" }),
        kid: "access",
        alg: "EdDSA",
        use: "sig",
      },
    ],
  };
  const rule = (limit: number) => ({ limit, windowMs: 60000 });
  const policy = {
    version: "test-policy-1",
    cacheMs: 1000,
    public: {
      principal: { free: rule(2), pro: rule(5) },
      guest: rule(100),
      allGuests: rule(100),
      origin: rule(100),
    },
    shared: {
      principal: { free: rule(1000), pro: rule(1000) },
      guest: rule(1000),
      allGuests: rule(1000),
      origin: rule(1000),
    },
  };
  let outage = false,
    requests = 0;
  const bodies: unknown[] = [];
  const decisions: unknown[] = [];
  const quotaRequests: string[] = [];
  async function handlePrivate(req: IncomingMessage, res: ServerResponse) {
    let raw = "";
    for await (const part of req) raw += String(part);
    if (outage) {
      res.writeHead(503).end();
      return;
    }
    res.setHeader("content-type", "application/json");
    if (req.url === "/.well-known/jwks.json") {
      res.end(JSON.stringify(jwks));
      return;
    }
    if (req.url?.endsWith("authority")) {
      res.end(JSON.stringify({ allowed: true, version: 1 }));
      return;
    }
    if (req.url?.startsWith("/internal/quota/")) {
      quotaRequests.push(req.url);
      const quota = {
        consumed: 0,
        remaining: 100,
        granted: 100,
        reserved: 0,
        warning: "none",
        grants: [
          {
            kind: "guest",
            granted: 100,
            remaining: 100,
            expiresAt: new Date(now + 86400000).toISOString(),
          },
        ],
        features: [],
      };
      const input = JSON.parse(raw) as { slots?: unknown[] };
      const value = req.url.endsWith("/snapshot")
        ? { outcome: "granted", quota }
        : req.url.endsWith("/reserve")
          ? {
              outcome: "reserved",
              free: [],
              reserved: input.slots?.length ?? 0,
              quota,
            }
          : req.url.endsWith("/release")
            ? { released: 0 }
            : { outcome: "released" };
      res.end(JSON.stringify(value));
      return;
    }
    if (req.url?.startsWith("/internal/abuse/")) {
      const assertion = req.headers.authorization?.slice(7).split(".");
      try {
        if (!assertion || assertion.length !== 3) throw new Error();
        const claims = JSON.parse(
          Buffer.from(assertion[1]!, "base64url").toString(),
        ) as Record<string, unknown>;
        if (
          !verify(
            null,
            Buffer.from(`${assertion[0]}.${assertion[1]}`),
            internal.publicKey,
            Buffer.from(assertion[2]!, "base64url"),
          ) ||
          claims.purpose !== "abuse-entrance" ||
          claims.path !== req.url ||
          claims.method !== "POST" ||
          claims.iss !== "https://verification.invalid" ||
          claims.aud !== "https://service.invalid" ||
          claims.bodyHash !==
            createHash("sha256").update(raw).digest("base64url")
        )
          throw new Error();
      } catch {
        res.writeHead(401).end();
        return;
      }
    }
    if (req.url === "/internal/abuse/policy") {
      requests++;
      res.end(JSON.stringify(policy));
      return;
    }
    if (req.url === "/internal/abuse/entrances") {
      bodies.push(JSON.parse(raw));
      res.end(
        JSON.stringify(
          decisions.shift() ?? {
            allowed: true,
            planId: "free",
            policyVersion: policy.version,
          },
        ),
      );
      return;
    }
    res.writeHead(404).end();
  }
  const edge = createServer((req, res) => {
    void handlePrivate(req, res).catch(() => {
      res.writeHead(503).end();
    });
  });
  edge.listen(4702, "127.0.0.1");
  await once(edge, "listening");
  const settings: HostedSettings = {
    serviceOrigin: "http://127.0.0.1:4702",
    serviceIssuer: "https://service.invalid",
    verificationAudience: "verification",
    assertionIssuer: "https://verification.invalid",
    internalKey: {
      kid: "verification",
      pem: internal.privateKey
        .export({ format: "pem", type: "pkcs8" })
        .toString(),
    },
    serviceInternalJwks: { keys: [] },
    peerKeys: () => ({ keys: [] }),
  };
  const db = createPrisma(database.appUrl),
    boss = await createQueue(database.appUrl),
    events = await listenForEvents(database.appUrl);
  const checks = createCheckStore(db, boss, { clock });
  const originSettings = {
    ipv4Prefix: 24,
    ipv6Prefix: 56,
    keys: [
      { id: "old", secret: "a".repeat(64), from: 0, until: now + 86400000 },
    ],
  };
  const instances = [0, 1].map(() => {
    const authority = hostedAuthority(settings, database.appUrl, checks, clock);
    const limiter = createAbuseLimiter(
      settings,
      database.appUrl,
      originSettings,
      clock,
    );
    const app = createApp({
      structuring: createParser({ referenceLimit: 1000 }),
      checks,
      events,
      heartbeatMs: 100,
      referenceLimit: 1000,
      clock,
      entitlements: authority.entitlements,
      ...{ entrance: limiter },
    });
    return { app, authority, limiter };
  });
  let turn = 0;
  const server = serve({
    hostname: "127.0.0.1",
    port: 4701,
    fetch: (request, env) => instances[turn++ % 2]!.app.fetch(request, env),
  });
  await once(server, "listening");
  const identities = new Map<
    string,
    {
      sub: string;
      ownerId: string;
      guestContextId: string;
      guestId: string;
      sessionId: string;
    }
  >();
  function token(identity = "one", guest = true) {
    let binding = identities.get(identity);
    if (!binding) {
      binding = {
        sub: randomUUID(),
        ownerId: randomUUID(),
        guestContextId: randomUUID(),
        guestId: randomUUID(),
        sessionId: randomUUID(),
      };
      identities.set(identity, binding);
    }
    const iat = Math.floor(now / 1000);
    const claims = {
      iat,
      nbf: iat,
      exp: iat + 300,
      iss: settings.serviceIssuer,
      aud: settings.verificationAudience,
      purpose: guest ? "guest-access" : "account-access",
      sub: binding.sub,
      ownerId: binding.ownerId,
      ...(guest
        ? {
            guestContextId: binding.guestContextId,
            guestId: binding.guestId,
            client: "web",
          }
        : { sessionId: binding.sessionId }),
      jti: randomUUID(),
    };
    const h = Buffer.from(
        JSON.stringify({ alg: "EdDSA", typ: "at+jwt", kid: "access" }),
      ).toString("base64url"),
      b = Buffer.from(JSON.stringify(claims)).toString("base64url");
    return `${h}.${b}.${sign(null, Buffer.from(`${h}.${b}`), access.privateKey).toString("base64url")}`;
  }
  return {
    rebindGuest(identity: string) {
      const old = identities.get(identity)!;
      identities.set(identity, {
        ...old,
        sub: randomUUID(),
        ownerId: randomUUID(),
        guestContextId: randomUUID(),
      });
    },
    database,
    policy,
    originSettings,
    token,
    bodies,
    decisions,
    quotaRequests,
    policyRequests: () => requests,
    outage: (value: boolean) => {
      outage = value;
    },
    advance: (ms: number) => {
      now += ms;
    },
    now: () => now,
    async request(
      identity = "one",
      options: {
        guest?: boolean;
        headers?: Record<string, string>;
        path?: string;
        body?: string;
      } = {},
    ) {
      return fetch(
        `http://127.0.0.1:4701${options.path ?? "/v1/structurings"}`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            authorization: `Bearer ${token(identity, options.guest ?? true)}`,
            ...options.headers,
          },
          body:
            options.body ??
            JSON.stringify({ text: "Doe, J. (2020). A study." }),
        },
      );
    },
    async stop() {
      if ("closeAllConnections" in server) server.closeAllConnections();
      await new Promise<void>((resolve) => server.close(() => resolve()));
      edge.closeAllConnections();
      await new Promise<void>((resolve) => edge.close(() => resolve()));
      await Promise.all(
        instances.flatMap((i) => [i.authority.close(), i.limiter.close()]),
      );
      await events.close();
      await boss.stop();
      await db.$disconnect();
      const admin = new pg.Client({ connectionString: database.adminUrl });
      await admin.connect();
      const owned = new URL(database.appUrl);
      await admin.query(
        `DROP DATABASE ${admin.escapeIdentifier(owned.pathname.slice(1))} WITH (FORCE)`,
      );
      await admin.query(`DROP ROLE ${admin.escapeIdentifier(owned.username)}`);
      await admin.end();
    },
  };
}
