// SPDX-License-Identifier: AGPL-3.0-or-later
// Test provisioner only; private implementation stays in its own worktree.
import { spawn, spawnSync, type ChildProcess } from "node:child_process";
import { randomUUID, generateKeyPairSync } from "node:crypto";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { once } from "node:events";
import { createServer } from "node:http";
import pg from "pg";
import { GuestTokenResponse } from "@source-taster/contract-service";
import { startDoiFixtures } from "./doi-fixtures.ts";
export async function freePort() {
  const server = createServer();
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const port = (server.address() as { port: number }).port;
  await new Promise<void>((resolve) => server.close(() => resolve()));
  return port;
}
export async function eventually(
  check: () => Promise<boolean> | boolean,
  ms = 15000,
) {
  const deadline = Date.now() + ms;
  while (!(await check())) {
    if (Date.now() > deadline)
      throw new Error("Public observable did not arrive");
    await new Promise((r) => setTimeout(r, 25));
  }
}
export async function bothPrograms(
  options: {
    startWorker?: boolean;
    clientLeaseMs?: number;
    verificationEnv?: Record<string, string>;
  } = {},
) {
  const privatePath = process.env.SOURCE_TASTER_SERVICE_WORKTREE;
  if (!privatePath)
    throw new Error(
      "Set SOURCE_TASTER_SERVICE_WORKTREE to the prepared private worktree",
    );
  const serverPath = new URL("../..", import.meta.url).pathname;
  const directory = await mkdtemp(join(tmpdir(), "st96-both-"));
  const suffix = randomUUID().replaceAll("-", "").slice(0, 16);
  const database = `guest96_${suffix}`;
  const roles = [`v96_${suffix}`, `s96_${suffix}`];
  const adminUrl =
    process.env.DATABASE_ADMIN_URL ??
    "postgres://postgres:postgres@localhost:5433/postgres";
  const admin = new pg.Client({ connectionString: adminUrl });
  await admin.connect();
  const passwords = [randomUUID(), randomUUID()];
  await admin.query(`CREATE DATABASE ${admin.escapeIdentifier(database)}`);
  await admin.query(
    `REVOKE ALL ON DATABASE ${admin.escapeIdentifier(database)} FROM PUBLIC`,
  );
  const target = new URL(adminUrl);
  target.pathname = `/${database}`;
  const setup = new pg.Client({ connectionString: target.toString() });
  await setup.connect();
  await setup.query("REVOKE ALL ON SCHEMA public FROM PUBLIC");
  const urls: string[] = [];
  for (let index = 0; index < 2; index++) {
    const role = roles[index]!,
      schema = index === 0 ? "verification" : "service";
    await admin.query(
      `CREATE ROLE ${admin.escapeIdentifier(role)} LOGIN NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS PASSWORD ${admin.escapeLiteral(passwords[index]!)}`,
    );
    await admin.query(
      `GRANT CONNECT ON DATABASE ${admin.escapeIdentifier(database)} TO ${admin.escapeIdentifier(role)}`,
    );
    for (const name of [schema, `${schema}_boss`]) {
      await setup.query(
        `CREATE SCHEMA ${setup.escapeIdentifier(name)} AUTHORIZATION ${setup.escapeIdentifier(role)}`,
      );
      await setup.query(
        `REVOKE ALL ON SCHEMA ${setup.escapeIdentifier(name)} FROM PUBLIC`,
      );
    }
    await admin.query(
      `ALTER ROLE ${admin.escapeIdentifier(role)} IN DATABASE ${admin.escapeIdentifier(database)} SET search_path=${schema}`,
    );
    const url = new URL(target);
    url.username = role;
    url.password = passwords[index]!;
    urls.push(url.toString());
    const migration = new URL(url);
    migration.searchParams.set("schema", schema);
    const result = spawnSync("pnpm", ["exec", "prisma", "migrate", "deploy"], {
      cwd: index === 0 ? serverPath : join(privatePath, "apps/server"),
      env: { PATH: process.env.PATH, DATABASE_URL: migration.toString() },
      encoding: "utf8",
    });
    if (result.status !== 0)
      throw new Error(`Fixture migration failed: ${result.stderr}`);
  }
  await setup.end();
  await admin.end();
  let now = Date.now(),
    seq = 0;
  const processes: {
    child: ChildProcess;
    output(): string;
    command(message: object): Promise<unknown>;
    stop(): Promise<void>;
    ready: Promise<void>;
  }[] = [];
  function launch(
    cwd: string,
    entry: string,
    args: string[],
    env: Record<string, string>,
  ) {
    const child = spawn(process.execPath, [entry, ...args], {
      cwd,
      env: {
        PATH: process.env.PATH,
        NODE_ENV: "test",
        TEST_CLOCK: String(now),
        ...env,
      },
      stdio: ["ignore", "pipe", "pipe", "ipc"],
    });
    let output = "";
    child.stdout!.on("data", (b) => {
      output += String(b);
    });
    child.stderr!.on("data", (b) => {
      output += String(b);
    });
    const exited = once(child, "exit");
    const ready = new Promise<void>((resolve, reject) => {
      child.on("message", (m: { ready?: boolean }) => {
        if (m.ready) resolve();
      });
      child.once("exit", () => reject(new Error(output)));
    });
    const item = {
      child,
      output: () => output,
      ready,
      command: async (message: object) => {
        const id = ++seq;
        return new Promise<unknown>((resolve, reject) => {
          const timer = setTimeout(() => {
            child.off("message", receive);
            reject(new Error("Fixture control timeout"));
          }, 10000);
          function receive(m: {
            id: number;
            result?: unknown;
            error?: string;
          }) {
            if (m.id !== id) return;
            clearTimeout(timer);
            child.off("message", receive);
            if (m.error) reject(new Error(m.error));
            else resolve(m.result);
          }
          child.on("message", receive);
          child.send({ ...message, id });
        });
      },
      stop: async () => {
        if (child.exitCode !== null || child.signalCode !== null) return;
        child.kill("SIGKILL");
        await exited;
      },
    };
    processes.push(item);
    return item;
  }
  const [apiPort, servicePort, proxyPort] = await Promise.all([
    freePort(),
    freePort(),
    freePort(),
  ]);
  const apiUrl = `http://127.0.0.1:${apiPort}`,
    serviceUrl = `http://127.0.0.1:${servicePort}`;
  // Adapter-edge transport barrier: forwards to the REAL service, then can hold
  // one authentic response. No authority return value is manufactured here.
  let workDelayMs = 0;
  let workGate: { arrived(): void; wait: Promise<void> } | undefined;
  let trap:
    | undefined
    | {
        permission?: string;
        kind?: string;
        skip: number;
        hit: () => void;
        wait: Promise<void>;
      };
  const proxy = createServer((req, res) => {
    void (async () => {
      const chunks: Buffer[] = [];
      for await (const c of req as AsyncIterable<Uint8Array>)
        chunks.push(Buffer.from(c));
      const body = Buffer.concat(chunks).toString();
      try {
        const response = await fetch(`${serviceUrl}${req.url}`, {
          method: req.method,
          headers: {
            "content-type": "application/json",
            ...(req.headers.authorization
              ? { authorization: req.headers.authorization }
              : {}),
          },
          ...(req.method === "POST" ? { body } : {}),
          signal: AbortSignal.timeout(5000),
        });
        const data = await response.text();
        const input = body
          ? (JSON.parse(body) as { permission?: string; kind?: string })
          : {};
        if (input.kind === "work" && workGate) {
          workGate.arrived();
          await workGate.wait;
        }
        if (input.kind === "work" && workDelayMs)
          await new Promise((resolve) => setTimeout(resolve, workDelayMs));
        if (
          trap &&
          req.url === "/internal/guest-authority" &&
          (!trap.permission || trap.permission === input.permission) &&
          (!trap.kind || trap.kind === input.kind)
        ) {
          if (trap.skip > 0) trap.skip--;
          else {
            const held = trap;
            trap = undefined;
            held.hit();
            await held.wait;
          }
        }
        res.writeHead(response.status, {
          "content-type":
            response.headers.get("content-type") ?? "application/json",
        });
        res.end(data);
      } catch {
        res.writeHead(503);
        res.end();
      }
    })().catch(() => res.destroy());
  });
  proxy.listen(proxyPort, "127.0.0.1");
  await once(proxy, "listening");
  function keys(kid: string) {
    const pair = generateKeyPairSync("ed25519");
    return {
      key: {
        kid,
        pem: pair.privateKey
          .export({ format: "pem", type: "pkcs8" })
          .toString(),
      },
      jwk: {
        ...pair.publicKey.export({ format: "jwk" }),
        kid,
        alg: "EdDSA",
        use: "sig",
      },
    };
  }
  const access = keys("access-1"),
    serviceInternal = keys("service-internal-1"),
    verificationInternal = keys("verification-internal-1");
  const serviceConfig = {
    issuer: "https://service.test.invalid",
    verificationAudience: "https://verification.test.invalid",
    verificationIssuer: "https://verification.test.invalid",
    verificationOrigin: apiUrl,
    accessKey: access.key,
    internalKey: serviceInternal.key,
    verificationJwks: { keys: [verificationInternal.jwk] },
    allowedOrigins: [] as string[],
  };
  const serviceConfigPath = join(directory, "service.json"),
    verificationConfigPath = join(directory, "verification.json");
  await writeFile(serviceConfigPath, JSON.stringify(serviceConfig), {
    mode: 0o600,
  });
  await writeFile(
    verificationConfigPath,
    JSON.stringify({
      serviceOrigin: `http://127.0.0.1:${proxyPort}`,
      serviceIssuer: serviceConfig.issuer,
      verificationAudience: serviceConfig.verificationAudience,
      assertionIssuer: serviceConfig.verificationIssuer,
      internalKey: verificationInternal.key,
      serviceInternalJwks: { keys: [serviceInternal.jwk] },
    }),
    { mode: 0o600 },
  );
  const fixtures = await startDoiFixtures();
  const venv = {
    DATABASE_URL: urls[0]!,
    SOURCE_TASTER_PORT: String(apiPort),
    SOURCE_TASTER_AUTH_CONFIG: verificationConfigPath,
    SOURCE_TASTER_MODE: "standalone",
    SOURCE_TASTER_PLACEHOLDER_DELAY_MS: "0",
    SOURCE_TASTER_CLIENT_LEASE_MS: String(options.clientLeaseMs ?? 75000),
    ...fixtures.env,
    ...options.verificationEnv,
  };
  const senv = {
    DATABASE_URL: urls[1]!,
    SERVICE_PORT: String(servicePort),
    SERVICE_GUEST_AUTH_CONFIG: serviceConfigPath,
  };
  let service = launch(
    join(privatePath, "apps/server"),
    "test/authority-process.ts",
    [],
    senv,
  );
  await service.ready;
  let serviceWorker = launch(
    join(privatePath, "apps/server"),
    "test/authority-worker.ts",
    [],
    senv,
  );
  await serviceWorker.ready;
  let web = launch(serverPath, "test/support/guest-process.ts", [], venv);
  await web.ready;
  const worker = () =>
    launch(serverPath, "test/support/guest-process.ts", ["worker"], venv);
  if (options.startWorker !== false) await worker().ready;
  return {
    now: () => now,
    apiUrl,
    serviceUrl,
    fixtures,
    access,
    serviceInternal,
    verificationInternal,
    serviceConfig,
    serviceConfigPath,
    venv,
    senv,
    urls,
    privatePath,
    directory,
    web: () => web,
    service: () => service,
    worker,
    restartWeb: async () => {
      await web.stop();
      web = launch(serverPath, "test/support/guest-process.ts", [], venv);
      await web.ready;
    },
    restartService: async () => {
      await service.stop();
      await serviceWorker.stop();
      service = launch(
        join(privatePath, "apps/server"),
        "test/authority-process.ts",
        [],
        senv,
      );
      await service.ready;
      serviceWorker = launch(
        join(privatePath, "apps/server"),
        "test/authority-worker.ts",
        [],
        senv,
      );
      await serviceWorker.ready;
    },
    advance: async (ms: number) => {
      now += ms;
      await Promise.all(
        processes
          .filter(
            (p) => p.child.exitCode === null && p.child.signalCode === null,
          )
          .map((p) => p.command({ now })),
      );
    },
    change: async (guestId: string, change: object, wait = true) => {
      let result = (await service.command({ guestId, ...change })) as {
        completed: boolean;
        version: number;
      };
      if (wait && !result.completed)
        await eventually(async () => {
          result = (await service.command({
            guestId,
            status: true,
            // Completion is per Guest and client, like the change itself.
            client: (change as { client?: string }).client,
          })) as typeof result;
          return result.completed;
        }, 5000);
      return result;
    },
    holdWork: () => {
      let arrived!: () => void, release!: () => void;
      const gate = {
        arrived: () => arrived(),
        wait: new Promise<void>((r) => {
          release = r;
        }),
      };
      const waiting = new Promise<void>((r) => {
        arrived = r;
      });
      workGate = gate;
      return {
        arrived: waiting,
        release: () => {
          workGate = undefined;
          release();
        },
      };
    },
    delayWork: (ms: number) => {
      workDelayMs = ms;
    },
    trap: (permission?: string, kind?: string, skip = 0) => {
      let hit!: () => void, release!: () => void;
      const arrived = new Promise<void>((r) => {
        hit = r;
      });
      const wait = new Promise<void>((r) => {
        release = r;
      });
      trap = { permission, kind, skip, hit, wait };
      return { arrived, release };
    },
    issue: async (
      guestId = randomUUID(),
      client: "web" | "extension" = "web",
    ) => {
      const response = await fetch(`${serviceUrl}/v1/guest-tokens`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ guestId, client }),
      });
      if (!response.ok) throw new Error(`Guest issuance: ${response.status}`);
      return {
        guestId,
        token: GuestTokenResponse.parse(await response.json()).data.accessToken,
      };
    },
    stop: async () => {
      await Promise.all(processes.map((p) => p.stop()));
      proxy.closeAllConnections();
      await new Promise<void>((r) => proxy.close(() => r()));
      await fixtures.stop();
      const cleanup = new pg.Client({ connectionString: adminUrl });
      await cleanup.connect();
      try {
        await cleanup.query(
          `DROP DATABASE ${cleanup.escapeIdentifier(database)} WITH (FORCE)`,
        );
        for (const role of roles)
          await cleanup.query(`DROP ROLE ${cleanup.escapeIdentifier(role)}`);
      } finally {
        await cleanup.end();
        await rm(directory, { recursive: true, force: true });
      }
    },
  };
}
