// SPDX-License-Identifier: AGPL-3.0-or-later
// Hosted preview for a developer machine: the public verification API and
// worker, the private service (web + worker) from a prepared worktree and the
// web app in hosted mode, all on loopback. It is the test harness's own
// composition (`bothPrograms`, the same one the `apps/web/e2e-*` suites use);
// this file only adds what a person at a browser needs on top of it:
//   - a page and terminal lines that show captured mail, i.e. sign-in codes;
//   - a loopback tap in front of the service that "pays" a fake order through
//     the harness's payment fake as soon as the browser places it;
//   - a real-time clock for the harness's otherwise frozen one;
//   - seeded Operator and demo Accounts and the DPA placeholder packets.
// Started by `pnpm dev:local --hosted` (scripts/dev-local.ts), which owns the
// database container and the signal handling. See docs/local-preview.md.
import { spawn, type ChildProcess } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
import { once } from "node:events";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { createServer, request as httpRequest, type Server } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import pg from "pg";
import { startBibliographicFixtures } from "../test/support/bibliographic-fixtures.ts";
import { bothPrograms } from "../test/support/both-programs.ts";
import { physicsReference } from "../test/support/doi-fixtures.ts";
import { registerPreviewFixtures } from "../test/support/preview-fixtures.ts";

const loopback = "127.0.0.1";
const setting = (name: string) => {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required (set by pnpm dev:local).`);
  return value;
};
const port = (name: string) => Number(setting(name));
const ports = {
  api: port("SOURCE_TASTER_E2E_API_PORT"),
  web: port("SOURCE_TASTER_E2E_WEB_PORT"),
  service: port("SOURCE_TASTER_E2E_SERVICE_PORT"),
  servicePublic: port("SOURCE_TASTER_E2E_SERVICE_PUBLIC_PORT"),
  mail: port("SOURCE_TASTER_E2E_MAIL_PORT"),
};
const origin = (value: number) => `http://${loopback}:${value}`;
const webUrl = origin(ports.web);
const tapUrl = origin(ports.servicePublic);
const mailUrl = origin(ports.mail);
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// This process creates and drops databases and roles. It does so only in the
// preview container that scripts/dev-local.ts created for it.
const adminUrl = new URL(setting("DATABASE_ADMIN_URL"));
if (
  adminUrl.hostname !== loopback ||
  adminUrl.port !== setting("SOURCE_TASTER_E2E_POSTGRES_PORT")
)
  throw new Error("Refusing to use a database outside the preview container.");

/** A hard kill of an earlier run leaves its harness database behind. */
async function sweepStaleDatabases() {
  const admin = new pg.Client({ connectionString: adminUrl.toString() });
  await admin.connect();
  try {
    const databases = await admin.query<{ datname: string }>(
      "SELECT datname FROM pg_database WHERE datname LIKE 'guest96\\_%'",
    );
    for (const { datname } of databases.rows)
      await admin.query(
        `DROP DATABASE ${admin.escapeIdentifier(datname)} WITH (FORCE)`,
      );
    const roles = await admin.query<{ rolname: string }>(
      "SELECT rolname FROM pg_roles WHERE rolname ~ '^(v|s)96_'",
    );
    for (const { rolname } of roles.rows)
      await admin.query(`DROP ROLE ${admin.escapeIdentifier(rolname)}`);
  } finally {
    await admin.end();
  }
}

const dpaPacket = (language: "en" | "de") => ({
  version: "review-v1",
  language,
  documents: ["agreement", "processing", "toms", "subprocessors"].map(
    (kind) => ({
      kind,
      version: "review-v1",
      title: kind,
      text: `PLACEHOLDER ${kind}; human legal review required.`,
    }),
  ),
});

interface Captured {
  to: string | string[];
  subject: string;
  text: string;
}
const codeOf = (text: string) => text.match(/\b[0-9]{6}\b/)?.[0];
const escapeHtml = (value: string) =>
  value.replace(
    /[&<>"]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!,
  );

const stoppers: (() => Promise<void> | void)[] = [];
let stopping = false;
async function shutdown(code: number) {
  if (stopping) return;
  stopping = true;
  // Reverse order of start; every step must survive the others being gone,
  // because the launcher signals the whole process group at once.
  for (const stop of stoppers.reverse())
    try {
      await stop();
    } catch {
      // keep going: the database drop below matters most
    }
  process.exit(code);
}
for (const signal of ["SIGINT", "SIGTERM", "SIGHUP"] as const)
  process.once(signal, () => {
    void shutdown(0);
  });

async function terminate(child: ChildProcess) {
  if (child.exitCode !== null || child.signalCode !== null) return;
  const exited = once(child, "exit");
  child.kill("SIGTERM");
  await Promise.race([exited, sleep(5000)]);
  if (child.exitCode === null && child.signalCode === null) {
    child.kill("SIGKILL");
    await exited;
  }
}

async function main() {
  await sweepStaleDatabases();
  const privatePath = setting("SOURCE_TASTER_SERVICE_WORKTREE");

  // Payment fake: the harness's own provider process (a Stripe look-alike on
  // loopback). Only available when the private worktree has the tooling
  // for it prepared; otherwise Check pack and Pro cannot be ordered.
  let commerce: { child: ChildProcess; config: string } | undefined;
  if (process.env.SERVICE_TEST_EN16931_CONFIG) {
    const child = spawn(
      process.execPath,
      ["test/commerce-provider-process.ts"],
      {
        cwd: join(privatePath, "apps/server"),
        // Nothing from the shell: no real provider key can reach the fake.
        env: {
          PATH: process.env.PATH,
          NODE_ENV: "test",
          SERVICE_TEST_EN16931_CONFIG: process.env.SERVICE_TEST_EN16931_CONFIG,
        },
        stdio: ["ignore", "pipe", "pipe", "ipc"],
      },
    );
    stoppers.push(() => terminate(child));
    let output = "";
    child.stderr!.on("data", (b) => {
      output += String(b);
    });
    const ready = await new Promise<{ config: string }>((resolve, reject) => {
      child.once("message", (m) => resolve(m as { config: string }));
      child.once("exit", () =>
        reject(new Error(`The payment fake exited: ${output}`)),
      );
    });
    const config = JSON.parse(await readFile(ready.config, "utf8")) as {
      publicOrigin: string;
      allowedOrigins: string[];
    };
    config.publicOrigin = tapUrl;
    config.allowedOrigins.push(webUrl, tapUrl);
    await writeFile(ready.config, JSON.stringify(config));
    commerce = { child, config: ready.config };
  }

  const bibliographic =
    process.env.SOURCE_TASTER_E2E_BIBLIOGRAPHIC === "true"
      ? await startBibliographicFixtures()
      : undefined;
  if (bibliographic) stoppers.push(() => bibliographic.stop());

  const scratch = await mkdtemp(join(tmpdir(), "st-preview-"));
  stoppers.push(() => rm(scratch, { recursive: true, force: true }));
  const operatorSetup = join(scratch, "operator-setup.json");
  const both = await bothPrograms({
    accounts: true,
    apiPort: ports.api,
    servicePort: ports.service,
    // https://web.test.invalid is the origin the harness's own sign-in helper
    // presents; the other two are the browser's (web app and service tap).
    serviceAllowedOrigins: [
      "https://web.test.invalid",
      webUrl,
      tapUrl,
      origin(ports.service),
    ],
    verificationEnv: { ...bibliographic?.env },
    serviceEnv: {
      ...(commerce ? { SERVICE_COMMERCE_CONFIG: commerce.config } : {}),
      SERVICE_OPERATOR_SETUP: operatorSetup,
      SERVICE_OPERATOR_SESSION_EPOCH: `preview-${randomUUID()}-operator-epoch`,
      SERVICE_OPERATOR_ORIGINS: JSON.stringify([
        "https://web.test.invalid",
        tapUrl,
      ]),
    },
  });
  stoppers.push(() => both.stop());
  const preview = await registerPreviewFixtures(both.fixtures, {
    bibliographic,
    web: false,
  });
  stoppers.push(() => preview.release());

  // Real time for the harness's frozen clock, so leases, expiries and the
  // per-address sign-in throttle behave. Never goes backwards, never overlaps.
  let ticker = true;
  void (async () => {
    while (ticker) {
      await sleep(1000);
      const delta = Date.now() - both.now();
      if (ticker && delta > 0) await both.advance(delta).catch(() => undefined);
    }
  })();
  stoppers.push(() => {
    ticker = false;
  });

  if (commerce) await both.service().command({ commerceSeed: true });
  for (const language of ["en", "de"] as const)
    await both.service().command({ dpa: { publish: dpaPacket(language) } });

  // Operator: the same bootstrap the rights suite performs, through the public
  // HTTP surface (setup file + one-time code).
  const operatorEmail = "operator@example.invalid";
  const setupCode = randomUUID();
  const operator = await both.signIn(operatorEmail);
  await writeFile(
    operatorSetup,
    JSON.stringify({
      accountId: operator.data.accountId,
      codeHash: createHash("sha256").update(setupCode).digest("hex"),
      completionFile: operatorSetup + ".done",
    }),
  );
  const bootstrapped = await operator.call("/v1/operator/bootstrap", {
    setupCode,
  });
  if (!bootstrapped.ok)
    throw new Error(`Operator bootstrap answered ${bootstrapped.status}`);

  // Demo Account with paid-plan features, so History etc. are there at once.
  const demoEmail = "demo@example.invalid";
  const demo = await both.signIn(demoEmail);
  await both.service().command({
    operator: {
      credit: {
        ownerId: demo.data.ownerId,
        amount: 1000,
        validityDays: 90,
        features: ["check", "history", "ai-extraction", "verification-report"],
        key: "preview-demo-credit",
      },
    },
  });
  // The sign-in throttle is per address; step over it for the seeded ones.
  await both.advance(61_000);

  const baseline = ((await both.mail()) as Captured[]).length;

  // Mail capture: terminal lines and a page. Sign-in codes are the point.
  let mails: Captured[] = [];
  let announced = baseline;
  const refreshMail = async () => {
    if (stopping) return;
    mails = (await both.mail().catch(() => mails)) as Captured[];
    for (const mail of mails.slice(announced)) {
      const code = codeOf(mail.text);
      console.log(
        `  ✉  ${[mail.to].flat().join(", ")} — ${mail.subject}${code ? `   CODE ${code}` : ""}`,
      );
    }
    announced = mails.length;
  };
  const mailTimer = setInterval(() => void refreshMail(), 1000);
  stoppers.push(() => clearInterval(mailTimer));
  const mailServer = createServer((request, response) => {
    void (async () => {
      await refreshMail();
      const visible = mails.slice(baseline).reverse();
      if (request.url === "/mail.json") {
        response.writeHead(200, { "content-type": "application/json" });
        response.end(
          JSON.stringify(
            visible.map(({ to, subject, text }) => ({
              to,
              subject,
              text,
              code: codeOf(text) ?? null,
            })),
          ),
        );
        return;
      }
      response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
      response.end(`<!doctype html><meta charset="utf-8"><meta http-equiv="refresh" content="3">
<title>Captured mail</title>
<style>body{font:15px system-ui;max-width:46rem;margin:2rem auto;padding:0 1rem}
article{border:1px solid #8884;border-radius:8px;padding:.75rem 1rem;margin:1rem 0}
.code{font:700 2rem ui-monospace,monospace;letter-spacing:.2em}pre{white-space:pre-wrap;color:#666}</style>
<h1>Captured mail (local, nothing is sent)</h1>
<p>Newest first. Sign-in codes are shown large. This page refreshes every 3 seconds.</p>
${visible.length ? "" : "<p>No mail yet.</p>"}
${visible
  .map((mail) => {
    const code = codeOf(mail.text);
    return `<article><strong>${escapeHtml(mail.subject)}</strong><br>to ${escapeHtml([mail.to].flat().join(", "))}
${code ? `<div class="code">${code}</div>` : ""}<pre>${escapeHtml(mail.text)}</pre></article>`;
  })
  .join("")}`);
    })().catch(() => response.destroy());
  });
  mailServer.listen(ports.mail, loopback);
  await once(mailServer, "listening");
  stoppers.push(() => closeServer(mailServer));

  // Tap in front of the service. Transparent except that a successful order
  // (`POST /v1/commerce/orders` or `/subscriptions`) is paid once through the
  // payment fake, which then calls the service's webhook like a provider would.
  const paid = new Set<string>();
  let messageId = 0;
  const pay = async (orderId: string) => {
    if (!commerce || paid.has(orderId)) return;
    paid.add(orderId);
    const id = ++messageId;
    const answered = new Promise<void>((resolve) => {
      const receive = (m: { id?: number }) => {
        if (m.id !== id) return;
        commerce.child.off("message", receive);
        resolve();
      };
      commerce.child.on("message", receive);
    });
    commerce.child.send({
      id,
      orderId,
      now: both.now(),
      url: both.serviceUrl,
    });
    await Promise.race([answered, sleep(10_000)]);
    console.log(`  💳  fake payment confirmed for order ${orderId}`);
  };
  const tap = createServer((request, response) => {
    const path = new URL(request.url ?? "/", "http://tap.invalid").pathname;
    const watch =
      request.method === "POST" &&
      /^\/v1\/commerce\/(?:orders|subscriptions)$/.test(path);
    const upstream = httpRequest(
      {
        host: loopback,
        port: ports.service,
        method: request.method,
        path: request.url,
        headers: { ...request.headers, host: `${loopback}:${ports.service}` },
      },
      (answer) => {
        response.writeHead(answer.statusCode ?? 502, answer.headers);
        const chunks: Buffer[] = [];
        answer.on("data", (chunk: Buffer) => {
          response.write(chunk);
          if (watch) chunks.push(chunk);
        });
        answer.on("end", () => {
          response.end();
          if (!watch || (answer.statusCode ?? 500) >= 300) return;
          try {
            const parsed = JSON.parse(Buffer.concat(chunks).toString()) as {
              data?: { id?: string };
            };
            if (parsed.data?.id) void pay(parsed.data.id);
          } catch {
            // not an order answer; nothing to pay
          }
        });
      },
    );
    upstream.on("error", () => {
      if (!response.headersSent) response.writeHead(502);
      response.end();
    });
    request.pipe(upstream);
  });
  tap.listen(ports.servicePublic, loopback);
  await once(tap, "listening");
  stoppers.push(() => closeServer(tap));

  // Same Vite the browser suites use, in hosted mode against the tap.
  const vite = spawn(
    process.execPath,
    [
      new URL("../../web/node_modules/vite/bin/vite.js", import.meta.url)
        .pathname,
      "--host",
      loopback,
      "--port",
      String(ports.web),
      "--strictPort",
    ],
    {
      cwd: new URL("../../web", import.meta.url),
      env: {
        PATH: process.env.PATH,
        NODE_ENV: "test",
        SOURCE_TASTER_API_URL: both.apiUrl,
        VITE_SOURCE_TASTER_MODE: "hosted",
        VITE_SOURCE_TASTER_SERVICE_URL: tapUrl,
      },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  stoppers.push(() => terminate(vite));
  let viteOutput = "";
  for (const stream of [vite.stdout, vite.stderr])
    stream.on("data", (b) => {
      viteOutput += String(b);
    });
  const deadline = Date.now() + 120_000;
  for (;;) {
    if (vite.exitCode !== null) throw new Error(`Vite exited:\n${viteOutput}`);
    if (
      await fetch(webUrl).then(
        (r) => r.ok,
        () => false,
      )
    )
      break;
    if (Date.now() > deadline) throw new Error("Vite did not answer in time.");
    await sleep(300);
  }

  const smoke =
    process.env.SOURCE_TASTER_E2E_NO_SMOKE === "true"
      ? undefined
      : await smokeCheck(both);

  console.log(`
Source Taster HOSTED local preview is running (fake mail, fake payments, local fixtures only).

  Web app (hosted)    ${webUrl}/            use Chromium/Chrome (the session cookie is Secure)
  Captured mail       ${mailUrl}/        sign-in codes; also printed below as they arrive
  Private service     ${tapUrl}/            Operator: ${tapUrl}/operator
  Public API health   ${origin(ports.api)}/health
${smoke ? `  Smoke Check         as a Guest, through API, worker and fixtures: ${smoke.join(", ")}\n` : ""}
  Accounts            ${demoEmail}       Account with Check pack-level features (History, report)
                      ${operatorEmail}   Operator (sign in at ${tapUrl}/operator)
                      any other address  a new Free Account
  Payments            ${commerce ? "Check pack and Pro orders are paid automatically by a fake provider" : "NOT available (tooling not prepared in the private worktree, see docs/local-preview.md): Check pack and Pro cannot be ordered"}
  Clock               real time (the harness clock is advanced once a second)

Press Ctrl-C to stop. The databases of this run are dropped on exit.
Run \`pnpm dev:local:down\` to remove the stpreview-pg container.
`);

  // Everything above is up; end when told to, or when a child dies for good.
  await Promise.race([
    once(vite, "exit"),
    ...(commerce ? [once(commerce.child, "exit")] : []),
  ]);
  if (!stopping) throw new Error("A preview part exited unexpectedly.");
}

function closeServer(server: Server) {
  server.closeAllConnections();
  return new Promise<void>((resolve) => server.close(() => resolve()));
}

/** One real Check as a Guest: proves hosted API, authority, worker and fixtures talk. */
async function smokeCheck(both: Awaited<ReturnType<typeof bothPrograms>>) {
  const guest = await both.issue();
  const headers = {
    authorization: `Bearer ${guest.token}`,
    "content-type": "application/json",
  };
  interface Snapshot {
    id: string;
    state: string;
    references: {
      results: { outcome: { kind: string; verdict?: string } }[];
    }[];
  }
  const created = await fetch(`${both.apiUrl}/v1/checks`, {
    method: "POST",
    headers,
    body: JSON.stringify({ text: physicsReference }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!created.ok) throw new Error(`Smoke Check answered ${created.status}`);
  let check = ((await created.json()) as { data: Snapshot }).data;
  for (let attempt = 0; check.state !== "ended"; attempt++) {
    if (attempt > 100) throw new Error("Smoke Check did not finish in 40 s.");
    await sleep(400);
    const polled = await fetch(`${both.apiUrl}/v1/checks/${check.id}`, {
      headers,
    });
    check = ((await polled.json()) as { data: Snapshot }).data;
  }
  return check.references.map((reference) => {
    const outcome = reference.results.at(-1)?.outcome;
    return outcome?.verdict ?? outcome?.kind ?? "no result";
  });
}

main().catch(async (error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  await shutdown(1);
});
