// SPDX-License-Identifier: AGPL-3.0-or-later
import { test } from "node:test";
import assert from "node:assert/strict";
import { startTestService } from "../support/service.ts";
test(
  "real web and worker expose content-free readiness after database migration",
  { timeout: 60000 },
  async () => {
    const service = await startTestService(5501);
    try {
      let response;
      for (let i = 0; i < 50; i++) {
        response = await fetch(service.apiUrl + "/health/ready");
        if (response.ok) break;
        await new Promise((r) => setTimeout(r, 100));
      }
      assert.equal(response.status, 200);
      assert.deepEqual(await response.json(), { status: "ready" });
      assert.deepEqual(
        await (await fetch(service.apiUrl + "/health/live")).json(),
        { status: "alive" },
      );
    } finally {
      await service.stop();
    }
  },
);
