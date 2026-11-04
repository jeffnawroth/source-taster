// SPDX-License-Identifier: AGPL-3.0-or-later
// ADR-0017 report lifetime: at most 15 minutes after publication and never
// beyond the Check's own deletion deadline. HTTP only, real PostgreSQL and
// processes; the owned test composition controls the domain clock.
import { afterEach, beforeEach, expect, it } from "vitest";
import { CheckResponse } from "@source-taster/contract-verification/v2";
import { ReportResponse } from "@source-taster/contract-verification/report";
import { lifecycleService } from "./support/lifecycle-service.ts";
import { startDoiFixtures } from "./support/doi-fixtures.ts";

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
let fixtures: Awaited<ReturnType<typeof startDoiFixtures>>;
let service: Awaited<ReturnType<typeof lifecycleService>>;
beforeEach(async () => {
  fixtures = await startDoiFixtures();
  service = await lifecycleService(
    // Exercise real generation beyond expect.poll's one-second default.
    {
      ...fixtures.env,
      TEST_REPORT_FEATURE: "1",
      TEST_REPORT_RENDER_DELAY_MS: "1500",
    },
    { now: Date.UTC(2026, 9, 31, 12) },
  );
  await service.worker().ready;
});
afterEach(async () => {
  await service?.stop();
  await fixtures?.stop();
});
const request = (path: string, init: RequestInit = {}) =>
  fetch(`${service.apiUrl}/v2/checks${path}`, {
    ...init,
    headers: { "content-type": "application/json", ...init.headers },
  });
async function endedCheck() {
  const created = await request("", {
    method: "POST",
    body: JSON.stringify({
      references: [{ originalText: "x", fields: { DOI: "10.1038/nphys1170" } }],
    }),
  });
  const check = CheckResponse.parse(await created.json()).data;
  await expect
    .poll(
      async () =>
        CheckResponse.parse(await (await request(`/${check.id}`)).json()).data
          .state,
    )
    .toBe("ended");
  return check;
}
async function report(checkId: string) {
  const created = await request(`/${checkId}/reports`, {
    method: "POST",
    body: JSON.stringify({ language: "en", style: "apa" }),
  });
  expect(created.status).toBe(202);
  const job = ReportResponse.parse(await created.json()).data;
  await expect
    .poll(
      async () =>
        ReportResponse.parse(
          await (await request(`/${checkId}/reports/${job.id}`)).json(),
        ).data.state,
      { timeout: 10_000 },
    )
    .toBe("ready");
  return job;
}

it("serves a report for 15 minutes after publication and not beyond", async () => {
  const check = await endedCheck();
  const job = await report(check.id);
  const path = `/${check.id}/reports/${job.id}`;
  await service.advance(14 * MINUTE);
  expect((await request(`${path}/file`)).status).toBe(200);
  await service.advance(2 * MINUTE);
  const gone = await request(`${path}/file`);
  expect([404, 410]).toContain(gone.status);
  expect((await request(path)).status).toBe(gone.status);
  // The Check itself is untouched by the report's expiry.
  expect((await request(`/${check.id}`)).status).toBe(200);
});

it("never lets a report outlive its Check's deletion deadline", async () => {
  const check = await endedCheck();
  await service.advance(23 * HOUR + 50 * MINUTE);
  const created = await request(`/${check.id}/reports`, {
    method: "POST",
    body: JSON.stringify({ language: "en", style: "apa" }),
  });
  expect(created.status).toBe(202);
  const job = ReportResponse.parse(await created.json()).data;
  // 10 minutes remain of the Check's 24 hours: the report gets exactly those.
  expect(Date.parse(job.expiresAt) - service.now()).toBe(10 * MINUTE);
  await expect
    .poll(
      async () =>
        ReportResponse.parse(
          await (await request(`/${check.id}/reports/${job.id}`)).json(),
        ).data.state,
      { timeout: 10_000 },
    )
    .toBe("ready");
  const ready = ReportResponse.parse(
    await (await request(`/${check.id}/reports/${job.id}`)).json(),
  ).data;
  expect(Date.parse(ready.expiresAt) - service.now()).toBeLessThanOrEqual(
    10 * MINUTE,
  );
  await service.advance(11 * MINUTE);
  expect(
    (await request(`/${check.id}/reports/${job.id}/file`)).status,
  ).not.toBe(200);
});
