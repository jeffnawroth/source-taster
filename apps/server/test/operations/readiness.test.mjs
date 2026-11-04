// SPDX-License-Identifier: AGPL-3.0-or-later
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { startTestService } from "../support/service.ts";
test(
  "real web and worker expose content-free readiness after database migration",
  { timeout: 60000 },
  async () => {
    const dir = await mkdtemp(join(tmpdir(), "st116-maintenance-"));
    const file = join(dir, "notice.json");
    const now = Date.now();
    await writeFile(
      file,
      JSON.stringify({
        state: "announced",
        announcedAt: new Date(now).toISOString(),
        startsAt: new Date(now + 49 * 3600000).toISOString(),
        endsAt: new Date(now + 50 * 3600000).toISOString(),
        timeZone: "Europe/Berlin",
        de: "SECRET-CONTENT",
        en: "SECRET-CONTENT",
      }),
    );
    const service = await startTestService(5501, 50, {
      SOURCE_TASTER_MAINTENANCE_FILE: file,
    });
    try {
      let response;
      for (let i = 0; i < 50; i++) {
        response = await fetch(service.apiUrl + "/health/ready");
        if (response.ok) break;
        await new Promise((r) => setTimeout(r, 100));
      }
      const maintenance = await (
        await fetch(service.apiUrl + "/health/maintenance")
      ).text();
      assert.equal(JSON.parse(maintenance).state, "announced");
      assert.ok(!maintenance.includes("SECRET-CONTENT"));
      await writeFile(
        file,
        JSON.stringify({
          state: "announced",
          startsAt: new Date(now + 3600000).toISOString(),
        }),
      );
      assert.equal(
        (await fetch(service.apiUrl + "/health/maintenance")).status,
        503,
      );
      assert.equal(response.status, 200);
      assert.deepEqual(await response.json(), { status: "ready" });
      assert.deepEqual(
        await (await fetch(service.apiUrl + "/health/live")).json(),
        { status: "alive" },
      );
    } finally {
      await service.stop();
      await rm(dir, { recursive: true, force: true });
    }
  },
);
