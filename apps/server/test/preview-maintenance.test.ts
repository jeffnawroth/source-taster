// SPDX-License-Identifier: AGPL-3.0-or-later
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { startTestService } from "./support/service.ts";

// #249: `pnpm dev:local` serves the report test composition (fake Quota)
// instead of `src/web.ts`. The maintenance banner polls `/health/maintenance`
// every minute, so that composition must answer it like production does.
describe("local preview maintenance health", () => {
  let directory: string;
  let service: Awaited<ReturnType<typeof startTestService>>;

  beforeAll(async () => {
    directory = await mkdtemp(join(tmpdir(), "st249-maintenance-"));
    service = await startTestService(
      Number(process.env.SOURCE_TASTER_TEST_PREVIEW_PORT ?? 3146),
      50,
      {
        TEST_REPORT_FEATURE: "all",
        SOURCE_TASTER_MAINTENANCE_FILE: join(directory, "notice.json"),
      },
      { webScript: "test/support/report-web.ts" },
    );
  });
  afterAll(async () => {
    await service?.stop();
    await rm(directory, { recursive: true, force: true });
  });

  it("answers a missing notice file as production does: 503 unknown", async () => {
    const response = await fetch(`${service.apiUrl}/health/maintenance`);
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ state: "unknown" });
  });

  it("serves a valid announced notice from the maintenance file", async () => {
    const now = Date.now();
    await writeFile(
      join(directory, "notice.json"),
      JSON.stringify({
        state: "announced",
        announcedAt: new Date(now).toISOString(),
        startsAt: new Date(now + 49 * 3_600_000).toISOString(),
        endsAt: new Date(now + 50 * 3_600_000).toISOString(),
        timeZone: "Europe/Berlin",
      }),
    );
    const response = await fetch(`${service.apiUrl}/health/maintenance`);
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.json()).toMatchObject({ state: "announced" });
  });
});

describe("local preview maintenance health without a notice file", () => {
  let service: Awaited<ReturnType<typeof startTestService>>;
  beforeAll(async () => {
    service = await startTestService(
      Number(process.env.SOURCE_TASTER_TEST_PREVIEW_PORT ?? 3146),
      50,
      { TEST_REPORT_FEATURE: "all" },
      { webScript: "test/support/report-web.ts" },
    );
  });
  afterAll(async () => {
    await service?.stop();
  });

  it("answers { state: 'none' }", async () => {
    const response = await fetch(`${service.apiUrl}/health/maintenance`);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ state: "none" });
  });
});
