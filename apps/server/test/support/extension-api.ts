// SPDX-License-Identifier: AGPL-3.0-or-later
// Public #98 phase: real verification HTTP/PostgreSQL with the PRIVATE service
// replaced only at its external HTTP boundary. This is not both-program proof.
import { generateKeyPairSync, sign, randomUUID } from "node:crypto";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import pg from "pg";
import { setupDatabase } from "../../scripts/db-setup.ts";
import { testDatabase } from "./processes.ts";
import { Quota } from "@source-taster/contract-common";
import {
  QuotaReleaseRequest,
  QuotaReleaseResponse,
  QuotaReserveRequest,
  QuotaReserveResponse,
  QuotaSettleRequest,
  QuotaSettleResponse,
  QuotaSnapshotRequest,
  QuotaSnapshotResponse,
} from "@source-taster/contract-internal";
const fixtureNow = Date.now();
const issuer = `http://127.0.0.1:${process.env.SOURCE_TASTER_ACCOUNT_TEST_SERVICE_PORT ?? "4602"}`;
const audience = `http://127.0.0.1:${process.env.SOURCE_TASTER_ACCOUNT_TEST_API_PORT ?? "4601"}`;
const access = generateKeyPairSync("ed25519");
export const extensionFixtureJwks = {
  keys: [
    {
      ...access.publicKey.export({ format: "jwk" }),
      kid: "st98-access",
      alg: "EdDSA",
      use: "sig",
    },
  ],
};
export function extensionFixtureToken(account: {
  accountId: string;
  ownerId: string;
}) {
  const now = Math.floor(fixtureNow / 1000);
  const header = Buffer.from(
    JSON.stringify({ alg: "EdDSA", typ: "at+jwt", kid: "st98-access" }),
  ).toString("base64url");
  const payload = Buffer.from(
    JSON.stringify({
      iat: now,
      nbf: now,
      exp: now + 300,
      iss: issuer,
      aud: audience,
      purpose: "account-access",
      sub: account.accountId,
      ownerId: account.ownerId,
      sessionId: "55555555-5555-4555-8555-555555555555",
      jti: randomUUID(),
    }),
  ).toString("base64url");
  const message = `${header}.${payload}`;
  return `${message}.${sign(null, Buffer.from(message), access.privateKey).toString("base64url")}`;
}
export async function startExtensionVerificationApi() {
  if (!process.env.DATABASE_ADMIN_URL || !process.env.DATABASE_TEST_URL)
    throw new Error("#98 needs its explicitly owned PostgreSQL URLs");
  const { adminUrl, appUrl } = testDatabase();
  const owned = new URL(appUrl);
  const directory = await mkdtemp(join(tmpdir(), "st98-api-"));
  const own = generateKeyPairSync("ed25519");
  const peer = generateKeyPairSync("ed25519");
  const auth = join(directory, "authority.json");
  await writeFile(
    auth,
    JSON.stringify({
      serviceOrigin: issuer,
      serviceIssuer: issuer,
      verificationAudience: audience,
      assertionIssuer: audience,
      internalKey: {
        kid: "st98-verification",
        pem: own.privateKey.export({ format: "pem", type: "pkcs8" }).toString(),
      },
      serviceInternalJwks: {
        keys: [
          {
            ...peer.publicKey.export({ format: "jwk" }),
            kid: "st98-service-internal",
            alg: "EdDSA",
            use: "sig",
          },
        ],
      },
    }),
    { mode: 0o600 },
  );
  let child: ReturnType<typeof spawn> | undefined;
  const stopChild = async () => {
    if (child && child.exitCode === null && child.signalCode === null) {
      const exited = once(child, "exit");
      child.kill("SIGTERM");
      await exited;
    }
  };
  const stop = async () => {
    await stopChild();
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
  const launch = async () => {
    child = spawn(process.execPath, ["test/support/guest-process.ts"], {
      cwd: new URL("../..", import.meta.url),
      env: {
        PATH: process.env.PATH,
        NODE_ENV: "test",
        TEST_CLOCK: String(fixtureNow),
        DATABASE_URL: appUrl,
        SOURCE_TASTER_PORT:
          process.env.SOURCE_TASTER_ACCOUNT_TEST_API_PORT ?? "4601",
        SOURCE_TASTER_AUTH_CONFIG: auth,
      },
      stdio: ["ignore", "pipe", "pipe", "ipc"],
    });
    let output = "";
    child.stdout!.on("data", (b) => (output += String(b)));
    child.stderr!.on("data", (b) => (output += String(b)));
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(
        () => reject(new Error(`Verification startup timeout: ${output}`)),
        30000,
      );
      child!.once("exit", () => {
        clearTimeout(timer);
        reject(new Error(output));
      });
      child!.on("message", (m: { ready?: boolean }) => {
        if (m.ready) {
          clearTimeout(timer);
          resolve();
        }
      });
    });
  };
  try {
    await setupDatabase(adminUrl, appUrl);
    await launch();
    return {
      stop,
      restart: async () => {
        await stopChild();
        await launch();
      },
    };
  } catch (error) {
    await stop();
    throw error;
  }
}
/**
 * The PRIVATE Quota protocol answered at its HTTP boundary (#99), parsed
 * through the shared contract so this fake cannot drift from the real
 * service. One Free grant of 100 per fixture Owner; `allowed` mirrors the
 * fixture's current authority. Not both-program proof: real journal behavior is
 * covered by `test/quota.contract.ts` against the real service.
 */
export function extensionFixtureQuota() {
  const ledgers = new Map<
    string,
    { reserved: Map<string, number>; consumed: number }
  >();
  const view = (ownerId: string) => {
    const ledger = ledgers.get(ownerId) ?? {
      reserved: new Map<string, number>(),
      consumed: 0,
    };
    ledgers.set(ownerId, ledger);
    const reserved = [...ledger.reserved.values()].reduce((a, b) => a + b, 0);
    const remaining = Math.max(0, 100 - ledger.consumed - reserved);
    return {
      ledger,
      quota: Quota.parse({
        consumed: ledger.consumed,
        remaining,
        granted: 100,
        reserved,
        warning:
          remaining === 0 ? "exhausted" : remaining <= 20 ? "eighty" : "none",
        grants: [
          {
            kind: "free",
            granted: 100,
            remaining,
            expiresAt: new Date(fixtureNow + 30 * 86400000).toISOString(),
          },
        ],
        features: ["check", "history"],
      }),
    };
  };
  const denied = { outcome: "denied", reason: "forbidden" } as const;
  return (path: string, body: string, allowed: boolean): unknown => {
    if (path === "/internal/quota/snapshot") {
      const input = QuotaSnapshotRequest.parse(JSON.parse(body));
      return QuotaSnapshotResponse.parse(
        allowed
          ? { outcome: "granted", quota: view(input.ownerId).quota }
          : denied,
      );
    }
    if (path === "/internal/quota/reserve") {
      const input = QuotaReserveRequest.parse(JSON.parse(body));
      if (!allowed) return QuotaReserveResponse.parse(denied);
      const { ledger } = view(input.ownerId);
      ledger.reserved.set(`${input.checkId}:${input.key}`, input.slots.length);
      return QuotaReserveResponse.parse({
        outcome: "reserved",
        free: [],
        reserved: input.slots.length,
        quota: view(input.ownerId).quota,
      });
    }
    if (path === "/internal/quota/settle") {
      const input = QuotaSettleRequest.parse(JSON.parse(body));
      const { ledger } = view(input.ownerId);
      for (const [key, count] of ledger.reserved)
        if (key.startsWith(`${input.checkId}:`) && count > 0) {
          ledger.reserved.set(key, count - 1);
          break;
        }
      if (input.outcome === "verdict") ledger.consumed++;
      return QuotaSettleResponse.parse({
        outcome: input.outcome === "verdict" ? "debited" : "released",
      });
    }
    if (path === "/internal/quota/release") {
      const input = QuotaReleaseRequest.parse(JSON.parse(body));
      const { ledger } = view(input.ownerId);
      const key = `${input.checkId}:${input.key}`;
      const released = ledger.reserved.get(key) ?? 0;
      ledger.reserved.delete(key);
      return QuotaReleaseResponse.parse({ released });
    }
    return undefined;
  };
}
