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
const fixtureNow = Date.now();
const issuer = "http://127.0.0.1:4602";
const audience = "http://127.0.0.1:4601";
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
        SOURCE_TASTER_PORT: "4601",
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
