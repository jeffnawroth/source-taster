// SPDX-License-Identifier: AGPL-3.0-or-later
// External monitor process. No business credentials, customer payload or mail.
import { createServer } from "node:http";
import { readFile, writeFile, rename } from "node:fs/promises";
import { randomBytes } from "node:crypto";
async function json(file) {
  return JSON.parse(await readFile(file, "utf8"));
}
async function atomic(file, value) {
  const temp = file + "." + randomBytes(8).toString("hex");
  await writeFile(temp, JSON.stringify(value) + "\n", {
    mode: 0o600,
    flag: "wx",
  });
  await rename(temp, file);
}
function endpoint(value, heartbeat = false) {
  const u = new URL(value);
  const local =
    process.env.OPS_LOOPBACK_FIXTURES === "1" &&
    u.hostname === "127.0.0.1" &&
    u.protocol === "http:";
  if (
    (!local && u.protocol !== "https:") ||
    u.username ||
    u.password ||
    u.search ||
    u.hash
  )
    throw Error("status-endpoint");
  if (
    heartbeat &&
    !local &&
    (u.hostname !== "uptime.betterstack.com" ||
      !/^\/api\/v1\/heartbeat\/[A-Za-z0-9_-]+$/.test(u.pathname))
  )
    throw Error("status-provider");
  return u.toString().replace(/\/$/, "");
}
async function main() {
  const c = await json(process.env.OPS_STATUS_CONFIG);
  new Intl.DateTimeFormat("en", { timeZone: c.timeZone }).format();
  if (
    !Number.isInteger(c.port) ||
    c.port < 1024 ||
    c.port > 65535 ||
    !["127.0.0.1", "0.0.0.0"].includes(c.host) ||
    !c.stateFile ||
    !c.maintenanceFile ||
    !Number.isInteger(c.intervalMs) ||
    c.intervalMs < (process.env.OPS_LOOPBACK_FIXTURES === "1" ? 100 : 30000)
  )
    throw Error("status-config");
  const command = process.argv[2];
  if (command === "announce" || command === "withdraw") {
    const m = await json(c.maintenanceFile),
      now = Date.now();
    if (
      command === "announce" &&
      (!Number.isFinite(Date.parse(m.startsAt)) ||
        Date.parse(m.startsAt) - now < 48 * 3600000 ||
        Date.parse(m.endsAt) <= Date.parse(m.startsAt) ||
        !Number.isFinite(Date.parse(m.endsAt)))
    )
      throw Error("maintenance-notice");
    await atomic(c.maintenanceFile, {
      startsAt: m.startsAt,
      endsAt: m.endsAt,
      timeZone: c.timeZone,
      state: command === "announce" ? "announced" : "withdrawn",
      announcedAt:
        command === "announce" ? new Date(now).toISOString() : m.announcedAt,
      updatedAt: new Date(now).toISOString(),
      de:
        command === "announce"
          ? "Geplante Wartung. Während der Wartung kann der Dienst nicht verfügbar sein."
          : "Die geplante Wartung wurde zurückgezogen.",
      en:
        command === "announce"
          ? "Planned maintenance. The service may be unavailable during maintenance."
          : "The planned maintenance has been withdrawn.",
    });
    return;
  }
  if (command !== "serve") throw Error("status-command");
  const names = ["verification", "service", "synthetic", "signin"];
  const probes = names.map((name) => [name, endpoint(c.probes[name])]);
  const heartbeat = endpoint(c.heartbeat, true);
  let state = {
      status: "unknown",
      checkedAt: null,
      probes: Object.fromEntries(names.map((n) => [n, "unknown"])),
    },
    busy = false;
  let previous;
  try {
    previous = await json(c.stateFile);
  } catch {
    previous = {};
  }
  async function tick() {
    if (busy) return;
    busy = true;
    try {
      const results = await Promise.all(
        probes.map(async ([name, url]) => {
          try {
            const r = await fetch(url, {
              redirect: "error",
              signal: AbortSignal.timeout(5000),
            }); // Never retain/echo response bodies.
            await r.body?.cancel();
            return [name, r.ok ? "ready" : "outage"];
          } catch {
            return [name, "unknown"];
          }
        }),
      );
      const status = results.every(([, s]) => s === "ready")
        ? "operational"
        : results.some(([, s]) => s === "outage")
          ? "outage"
          : "unknown";
      state = {
        status,
        checkedAt: new Date().toISOString(),
        probes: Object.fromEntries(results),
      };
      // Failure transitions are idempotent; successful heartbeats continue so monitor detects process loss.
      if (status === "operational" || previous.status !== status) {
        const r = await fetch(
          heartbeat + (status === "operational" ? "" : "/fail"),
          {
            method: "GET",
            redirect: "error",
            signal: AbortSignal.timeout(5000),
          },
        );
        await r.body?.cancel();
        if (!r.ok) throw Error("alert-transport");
        previous = { status };
        await atomic(c.stateFile, previous);
      }
    } catch {
      state = { ...state, status: "unknown" };
    } finally {
      busy = false;
    }
  }
  const server = createServer(async (req, res) => {
    res.setHeader("Cache-Control", "no-store");
    if (req.method !== "GET") {
      res.writeHead(405);
      return res.end();
    }
    if (req.url === "/metrics") {
      res.setHeader("Content-Type", "text/plain");
      return res.end(
        `source_taster_available ${state.status === "operational" ? 1 : 0}\n`,
      );
    }
    if (req.url !== "/health" && req.url !== "/status.json") {
      res.writeHead(404);
      return res.end();
    }
    let maintenance = null;
    try {
      const m = await json(c.maintenanceFile);
      if (["announced", "withdrawn"].includes(m.state))
        maintenance = {
          state: m.state,
          startsAt: m.startsAt,
          endsAt: m.endsAt,
          timeZone: c.timeZone,
          de: m.de,
          en: m.en,
        };
    } catch {
      /* Unavailable optional state. */
    }
    res.setHeader("Content-Type", "application/json");
    if (req.url === "/health" && state.status !== "operational")
      res.statusCode = 503;
    res.end(JSON.stringify({ ...state, maintenance }));
  });
  await tick();
  const timer = setInterval(() => void tick(), c.intervalMs);
  server.listen(c.port, c.host);
  const stop = () => {
    clearInterval(timer);
    server.close(() => process.exit(0));
  };
  process.once("SIGTERM", stop);
  process.once("SIGINT", stop);
}
if (import.meta.main) {
  process.umask(0o077);
  try {
    await main();
  } catch {
    console.error(JSON.stringify({ code: "status-refused" }));
    process.exitCode = 78;
  }
}
