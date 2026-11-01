// SPDX-License-Identifier: AGPL-3.0-or-later
// Public #102 phase: the real verification web/worker processes on owned real
// PostgreSQL with the PRIVATE service replaced only at its external HTTP edge
// (JWKS, current Account authority, Quota journal) and a signer that plays the
// private service's Owner-deletion call. This is not both-program proof.
import {
  createHash,
  generateKeyPairSync,
  randomUUID,
  sign,
  type KeyObject,
} from "node:crypto";
import { spawn, type ChildProcess } from "node:child_process";
import { once } from "node:events";
import { createServer, type Server } from "node:http";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import pg from "pg";
import { setupDatabase } from "../../scripts/db-setup.ts";
import { startDoiFixtures } from "./doi-fixtures.ts";
import { testDatabase } from "./processes.ts";

export const apiPort = Number(process.env.SOURCE_TASTER_TEST_API_PORT ?? 4901);
export const servicePort = Number(
  process.env.SOURCE_TASTER_TEST_SERVICE_PORT ?? 4902,
);
const quota = {
  consumed: 0,
  remaining: 20,
  granted: 20,
  reserved: 0,
  warning: "none",
  grants: [],
  features: ["check"],
};
const b64 = (value: unknown) =>
  Buffer.from(JSON.stringify(value)).toString("base64url");

export interface AccountIdentity {
  accountId: string;
  ownerId: string;
  sessionId: string;
}
export function newAccount(): AccountIdentity {
  return {
    accountId: randomUUID(),
    ownerId: randomUUID(),
    sessionId: randomUUID(),
  };
}

export interface ServiceRequest {
  method: string;
  url: string;
  headers: Record<string, string | string[] | undefined>;
  body: Record<string, unknown>;
}
export interface ServiceReply {
  status: number;
  headers?: Record<string, string | string[]>;
  body?: unknown;
}
export async function startAccountApi(
  options: {
    worker?: boolean;
    database?: { adminUrl: string; appUrl: string };
    maintainOnStart?: boolean;
    /** Extra private-service behavior at the HTTP edge; consulted before the built-ins. */
    service?: (
      request: ServiceRequest,
      api: { token(account: AccountIdentity): string },
    ) => Promise<ServiceReply | undefined> | ServiceReply | undefined;
  } = {},
) {
  if (!process.env.DATABASE_ADMIN_URL || !process.env.DATABASE_TEST_URL)
    throw new Error("#102 needs its explicitly owned PostgreSQL URLs");
  const { adminUrl, appUrl } = options.database ?? testDatabase();
  const owned = new URL(appUrl);
  const directory = await mkdtemp(join(tmpdir(), "st102-api-"));
  const issuer = `http://127.0.0.1:${servicePort}`;
  const audience = `http://127.0.0.1:${apiPort}`;
  let now = Date.now();
  const access = generateKeyPairSync("ed25519");
  const peer = generateKeyPairSync("ed25519");
  const own = generateKeyPairSync("ed25519");
  const jwk = (key: KeyObject, kid: string) => ({
    ...key.export({ format: "jwk" }),
    kid,
    alg: "EdDSA",
    use: "sig",
  });
  const authPath = join(directory, "authority.json");
  await writeFile(
    authPath,
    JSON.stringify({
      serviceOrigin: issuer,
      serviceIssuer: issuer,
      verificationAudience: audience,
      assertionIssuer: audience,
      internalKey: {
        kid: "st102-verification",
        pem: own.privateKey.export({ format: "pem", type: "pkcs8" }).toString(),
      },
      serviceInternalJwks: { keys: [jwk(peer.publicKey, "st102-service")] },
    }),
    { mode: 0o600 },
  );

  // --- the private service, at its HTTP edge only -----------------------------
  const state = {
    /** What the (fake) private service answers for current Account authority. */
    allowed: true,
    authorityVersion: 1,
    authorityCalls: [] as { kind: string; permission: string }[],
    quota: {
      ...quota,
      history: { extendedUntil: null as string | null, authorityVersion: 1 },
    },
    quotaCalls: [] as { path: string; body: Record<string, unknown> }[],
  };
  let hold: { kind: string; arrived(): void; wait: Promise<void> } | undefined;
  const signed = (
    claims: Record<string, unknown>,
    typ: string,
    key: KeyObject,
    kid: string,
  ) => {
    const message = `${b64({ alg: "EdDSA", typ, kid })}.${b64(claims)}`;
    return `${message}.${sign(null, Buffer.from(message), key).toString("base64url")}`;
  };
  const tokenFor = (account: AccountIdentity) =>
    signed(
      {
        iat: Math.floor(now / 1000),
        nbf: Math.floor(now / 1000),
        exp: Math.floor(now / 1000) + 300,
        iss: issuer,
        aud: audience,
        purpose: "account-access",
        sub: account.accountId,
        ownerId: account.ownerId,
        sessionId: account.sessionId,
        jti: randomUUID(),
      },
      "at+jwt",
      access.privateKey,
      "st102-access",
    );
  const service: Server = createServer((req, res) => {
    void (async () => {
      let text = "";
      for await (const chunk of req) text += String(chunk);
      const body = text ? (JSON.parse(text) as Record<string, unknown>) : {};
      const extra = await options.service?.(
        {
          method: req.method ?? "GET",
          url: req.url ?? "/",
          headers: req.headers,
          body,
        },
        { token: (account) => tokenFor(account) },
      );
      if (extra) {
        for (const [name, value] of Object.entries(extra.headers ?? {}))
          res.setHeader(name, value);
        res.statusCode = extra.status;
        return void res.end(
          extra.body === undefined ? "" : JSON.stringify(extra.body),
        );
      }
      res.setHeader("content-type", "application/json");
      if (req.url === "/.well-known/jwks.json")
        return void res.end(
          JSON.stringify({ keys: [jwk(access.publicKey, "st102-access")] }),
        );
      if (req.url === "/internal/account-authority") {
        state.authorityCalls.push({
          kind: String(body.kind),
          permission: String(body.permission),
        });
        if (hold && body.kind === hold.kind) {
          const held = hold;
          hold = undefined;
          held.arrived();
          await held.wait;
        }
        return void res.end(
          JSON.stringify(
            state.allowed
              ? { allowed: true, version: state.authorityVersion }
              : { allowed: false, reason: "revoked" },
          ),
        );
      }
      if (req.url?.startsWith("/internal/quota/")) {
        state.quotaCalls.push({ path: req.url, body });
        const slots = (body.slots as unknown[] | undefined)?.length ?? 0;
        if (req.url.endsWith("/reserve") && slots > state.quota.remaining)
          return void res.end(
            JSON.stringify({
              outcome: "insufficient",
              available: state.quota.remaining,
              required: slots,
              quota: state.quota,
            }),
          );
        return void res.end(
          JSON.stringify(
            req.url.endsWith("/snapshot")
              ? { outcome: "granted", quota: state.quota }
              : req.url.endsWith("/reserve")
                ? {
                    outcome: "reserved",
                    free: [],
                    reserved: slots,
                    quota: state.quota,
                  }
                : req.url.endsWith("/settle")
                  ? { outcome: "debited" }
                  : { released: 0 },
          ),
        );
      }
      res.statusCode = 404;
      res.end("{}");
    })().catch(() => {
      res.statusCode = 500;
      res.end("{}");
    });
  });
  service.listen(servicePort, "127.0.0.1");
  await once(service, "listening");

  const fixtures = await startDoiFixtures();
  const children: ChildProcess[] = [];
  const stopChild = async (child: ChildProcess) => {
    if (child.exitCode === null && child.signalCode === null) {
      const exited = once(child, "exit");
      child.kill("SIGTERM");
      await exited;
    }
  };
  async function launch(args: string[] = []) {
    const child = spawn(
      process.execPath,
      ["test/support/guest-process.ts", ...args],
      {
        cwd: new URL("../..", import.meta.url),
        env: {
          PATH: process.env.PATH,
          NODE_ENV: "test",
          TEST_CLOCK: String(now),
          DATABASE_URL: appUrl,
          SOURCE_TASTER_PORT: String(apiPort),
          SOURCE_TASTER_AUTH_CONFIG: authPath,
          ...(options.maintainOnStart
            ? { SOURCE_TASTER_TEST_MAINTAIN_ON_START: "1" }
            : {}),
          ...fixtures.env,
        },
        stdio: ["ignore", "pipe", "pipe", "ipc"],
      },
    );
    children.push(child);
    let output = "";
    child.stdout!.on("data", (b) => (output += String(b)));
    child.stderr!.on("data", (b) => (output += String(b)));
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(
        () => reject(new Error(`Verification startup timeout: ${output}`)),
        30000,
      );
      child.once("exit", () => {
        clearTimeout(timer);
        reject(new Error(output));
      });
      child.on("message", (m: { ready?: boolean }) => {
        if (m.ready) {
          clearTimeout(timer);
          resolve();
        }
      });
    });
    return child;
  }
  let web: ChildProcess | undefined;
  let worker: ChildProcess | undefined;
  const stop = async () => {
    await Promise.all(children.map(stopChild));
    service.closeAllConnections();
    await new Promise<void>((r) => service.close(() => r()));
    await fixtures.stop();
    const admin = new pg.Client({ connectionString: adminUrl });
    await admin.connect();
    try {
      await admin.query(
        `DROP DATABASE IF EXISTS ${admin.escapeIdentifier(owned.pathname.slice(1))} WITH (FORCE)`,
      );
      await admin.query(
        `DROP ROLE IF EXISTS ${admin.escapeIdentifier(owned.username)}`,
      );
    } finally {
      await admin.end();
      await rm(directory, { recursive: true, force: true });
    }
  };
  try {
    if (!options.database) await setupDatabase(adminUrl, appUrl);
    web = await launch();
    if (options.worker) worker = await launch(["worker"]);
  } catch (error) {
    await stop();
    throw error;
  }

  const apiUrl = audience;
  return {
    apiUrl,
    now: () => now,
    adminUrl,
    appUrl,
    advance: async (ms: number) => {
      const target = now + ms;
      while (now < target) {
        const rollover =
          (Math.floor((now + 30_000) / 86_400_000) + 1) * 86_400_000 - 30_000;
        now = Math.min(target, rollover);
        await Promise.all(
          children
            .filter((c) => c.exitCode === null && c.signalCode === null)
            .map(
              (child) =>
                new Promise<void>((resolve, reject) => {
                  const id = Math.random();
                  const receive = (message: {
                    id?: number;
                    error?: boolean;
                  }) => {
                    if (message.id === id) {
                      child.off("message", receive);
                      if (message.error)
                        reject(new Error("clock-maintenance-failed"));
                      else resolve();
                    }
                  };
                  child.on("message", receive);
                  child.send({ now, id, maintain: true });
                }),
            ),
        );
      }
    },
    serviceUrl: issuer,
    state,
    fixtures,
    /** A five-minute Account access token the way the private service issues it. */
    token: tokenFor,
    /** The private service's signed `DELETE /internal/owners/{id}` assertion. */
    deleteOwner: (
      ownerId: string,
      override: {
        purpose?: string;
        path?: string;
        method?: string;
        unsigned?: boolean;
      } = {},
    ) => {
      const path = `/internal/owners/${ownerId}`;
      const seconds = Math.floor(now / 1000);
      const claims = {
        iss: issuer,
        aud: audience,
        purpose: override.purpose ?? "owner-deletion",
        iat: seconds,
        nbf: seconds,
        exp: seconds + 30,
        jti: randomUUID(),
        method: override.method ?? "DELETE",
        path: override.path ?? path,
        bodyHash: createHash("sha256").update("").digest("base64url"),
      };
      return fetch(`${apiUrl}${path}`, {
        method: "DELETE",
        headers: override.unsigned
          ? {}
          : {
              authorization: `Bearer ${signed(claims, "service+jwt", peer.privateKey, "st102-service")}`,
            },
      });
    },
    /** Signed private-service invalidation; Account/Plan versions share this Owner fence. */
    invalidateOwner: (account: AccountIdentity, version: number) => {
      state.authorityVersion = version;
      const path = "/internal/guest-authority/invalidate";
      const body = JSON.stringify({
        ownerId: account.ownerId,
        actorId: account.accountId,
        version,
        cancelWork: false,
      });
      const seconds = Math.floor(now / 1000);
      const claims = {
        iss: issuer,
        aud: audience,
        purpose: "authority-invalidation",
        iat: seconds,
        nbf: seconds,
        exp: seconds + 30,
        jti: randomUUID(),
        method: "POST",
        path,
        bodyHash: createHash("sha256").update(body).digest("base64url"),
      };
      return fetch(`${apiUrl}${path}`, {
        method: "POST",
        headers: {
          authorization: `Bearer ${signed(claims, "service+jwt", peer.privateKey, "st102-service")}`,
          "content-type": "application/json",
        },
        body,
      });
    },
    /** Hold the next Account authority call of this kind until released. */
    holdAuthority: (kind: "request" | "work") => {
      let arrived!: () => void, release!: () => void;
      const arrival = new Promise<void>((r) => (arrived = r));
      const wait = new Promise<void>((r) => (release = r));
      hold = { kind, arrived, wait };
      return { arrived: arrival, release };
    },
    startWorker: async () => {
      worker ??= await launch(["worker"]);
    },
    restartWeb: async () => {
      if (web) await stopChild(web);
      web = await launch();
    },
    /** Owned database connection for storage-level evidence only. */
    database: async () => {
      const client = new pg.Client({ connectionString: appUrl });
      await client.connect();
      return client;
    },
    stop,
  };
}
