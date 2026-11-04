// SPDX-License-Identifier: AGPL-3.0-or-later
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
const cli = new URL("../../ops/status.mjs", import.meta.url).pathname;
test(
  "external status receives outage/recovery without content and maintenance enforces 48h",
  { timeout: 20000 },
  async () => {
    const dir = await mkdtemp(join(tmpdir(), "st116-status-"));
    let healthy = true;
    const alerts = [];
    const fixture = createServer((req, res) => {
      if (req.url.startsWith("/heartbeat")) {
        alerts.push(req.url);
        return res.end();
      }
      res.setHeader("Content-Type", "application/json");
      res.statusCode = healthy ? 200 : 503;
      res.end(
        JSON.stringify({
          status: healthy ? "ready" : "failed",
          email: "DO-NOT-PUBLISH",
          ownerId: "SECRET-OWNER",
        }),
      );
    });
    await new Promise((r) => fixture.listen(0, "127.0.0.1", r));
    const port = fixture.address().port,
      base = `http://127.0.0.1:${port}`;
    await writeFile(
      join(dir, "config"),
      JSON.stringify({
        port: 5502,
        host: "127.0.0.1",
        intervalMs: 100,
        timeZone: "Europe/Berlin",
        probes: {
          verification: base + "/verification",
          service: base + "/service",
          synthetic: base + "/synthetic",
          signin: base + "/signin",
        },
        heartbeat: base + "/heartbeat",
        stateFile: join(dir, "state"),
        maintenanceFile: join(dir, "maintenance"),
      }),
    );
    const env = {
      ...process.env,
      OPS_STATUS_CONFIG: join(dir, "config"),
      OPS_LOOPBACK_FIXTURES: "1",
    };
    const p = spawn(process.execPath, [cli, "serve"], {
      env,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let output = "";
    p.stderr.on("data", (b) => (output += b));
    async function waitFor(check) {
      const end = Date.now() + 5000;
      while (Date.now() < end) {
        try {
          if (await check()) return;
        } catch {
          /* Unavailable optional state. */
        }
        await new Promise((r) => setTimeout(r, 50));
      }
      throw Error("status did not converge " + output);
    }
    const invoke = async (command) => {
      const child = spawn(process.execPath, [cli, command], {
        env,
        stdio: "ignore",
      });
      return new Promise((r) => child.on("exit", r));
    };
    try {
      await waitFor(
        async () => (await fetch("http://127.0.0.1:5502/health")).ok,
      );
      healthy = false;
      await waitFor(
        async () =>
          !(await fetch("http://127.0.0.1:5502/health")).ok &&
          alerts.includes("/heartbeat/fail"),
      );
      const feed = await (
        await fetch("http://127.0.0.1:5502/status.json")
      ).text();
      assert.ok(!feed.includes("DO-NOT-PUBLISH"));
      assert.ok(!feed.includes("SECRET-OWNER"));
      assert.equal(JSON.parse(feed).status, "outage");
      const count = alerts.filter((x) => x === "/heartbeat/fail").length;
      await new Promise((r) => setTimeout(r, 300));
      assert.equal(alerts.filter((x) => x === "/heartbeat/fail").length, count);
      healthy = true;
      await waitFor(
        async () =>
          (await fetch("http://127.0.0.1:5502/health")).ok &&
          alerts.at(-1) === "/heartbeat",
      );
      await writeFile(
        join(dir, "maintenance"),
        JSON.stringify({
          startsAt: new Date(Date.now() + 3600000).toISOString(),
          endsAt: new Date(Date.now() + 7200000).toISOString(),
        }),
      );
      assert.equal(await invoke("announce"), 78);
      await writeFile(
        join(dir, "maintenance"),
        JSON.stringify({
          startsAt: new Date(Date.now() + 49 * 3600000).toISOString(),
          endsAt: new Date(Date.now() + 50 * 3600000).toISOString(),
        }),
      );
      assert.equal(await invoke("announce"), 0);
      const scheduled = await (
        await fetch("http://127.0.0.1:5502/status.json")
      ).json();
      assert.equal(scheduled.maintenance.state, "announced");
      assert.ok(scheduled.maintenance.de);
      assert.ok(scheduled.maintenance.en);
      assert.equal(await invoke("withdraw"), 0);
    } finally {
      p.kill();
      await new Promise((r) => p.on("exit", r));
      await new Promise((r) => fixture.close(r));
      await rm(dir, { recursive: true, force: true });
    }
  },
);
