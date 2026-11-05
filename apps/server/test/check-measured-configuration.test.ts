// SPDX-License-Identifier: AGPL-3.0-or-later
// #114 AC3 ("New Checks use the active configuration; results record it").
// Real PostgreSQL + real web/worker processes + the published HTTP contract.
// The active-configuration pointer is a controlled test adapter
// (TEST_CONFIGURATION_POINTER): it exercises the snapshot/recording state
// machine only and is never qualification, calibration or provider evidence.
import { randomUUID } from "node:crypto";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import pg from "pg";
import { afterEach, beforeEach, expect, it } from "vitest";
import { CheckResponse } from "@source-taster/contract-verification/v2";
import { lifecycleService } from "./support/lifecycle-service.ts";

type Service = Awaited<ReturnType<typeof lifecycleService>>;
const port = process.env.SOURCE_TASTER_TEST_MEASURED_RECORD_PORT ?? "5812";
const pointerFor = (letter: string, version: number) => ({
  id: `sha256:${letter.repeat(64)}`,
  evidenceDigest: `sha256:${"e".repeat(64)}`,
  operationId: randomUUID(),
  version,
});
const a = pointerFor("a", 1);
const b = pointerFor("b", 2);
let directory: string;
let pointer: string;
let service: Service | undefined;

beforeEach(async () => {
  directory = await mkdtemp(join(tmpdir(), "st-record-config-"));
  pointer = join(directory, "pointer.json");
});
afterEach(async () => {
  await service?.stop();
  service = undefined;
  await rm(directory, { recursive: true, force: true });
});

const create = async (api: string) => {
  const response = await fetch(api + "/v2/checks", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      references: [{ originalText: "Controlled reference", fields: {} }],
    }),
  });
  expect(response.status).toBe(201);
  return CheckResponse.parse(await response.json()).data;
};
const get = async (api: string, id: string) =>
  CheckResponse.parse(await (await fetch(api + `/v2/checks/${id}`)).json())
    .data;
const stored = async (appUrl: string, checkId: string) => {
  const client = new pg.Client({ connectionString: appUrl });
  await client.connect();
  try {
    return (
      await client.query<{ id: string | null; rules: string | null }>(
        `SELECT measured_configuration_id AS id, scoring_rules_version AS rules
           FROM reference_results WHERE check_id = $1 ORDER BY position, generation`,
        [checkId],
      )
    ).rows;
  } finally {
    await client.end();
  }
};

it("records the active configuration ID on a new Check and on its stored result, and keeps it through restart and a later switch", async () => {
  await writeFile(pointer, JSON.stringify(a));
  service = await lifecycleService(
    { TEST_CONFIGURATION_POINTER: pointer },
    { port },
  );
  const api = service.apiUrl;
  // Creation snapshots the active ID; a stored result does not exist yet.
  const created = await create(api);
  expect(created.measuredConfigurationId).toBe(a.id);
  const worker = service.worker();
  await worker.ready;
  await expect
    .poll(async () => (await get(api, created.id)).state, { timeout: 15_000 })
    .toBe("ended");
  await worker.kill();

  // The stored result exposes the configuration ID through the published API.
  // This controlled run ends in a Status (the unknown local configuration
  // cannot dispatch), so the actual scoring rules version stays the pointer's
  // selected rules identity.
  const ended = await get(api, created.id);
  expect(ended.measuredConfigurationId).toBe(a.id);
  expect(ended.references[0]!.results).toHaveLength(1);
  expect(ended.references[0]!.results[0]).toMatchObject({
    measuredConfigurationId: a.id,
    scoringRulesVersion: "controlled-state-machine-only",
    outcome: { kind: "status", status: "failed" },
  });
  // ...and the same ID is what the database holds, not a response-side value.
  expect(await stored(service.appUrl, created.id)).toEqual([
    { id: a.id, rules: "controlled-state-machine-only" },
  ]);

  // Surviving a web restart and a switch of the active configuration: the old
  // Check and its result keep ID A; only a new Check takes B.
  await writeFile(pointer, JSON.stringify(b));
  await service.restartWeb();
  expect(await get(api, created.id)).toEqual(ended);
  const fresh = await create(api);
  expect(fresh.measuredConfigurationId).toBe(b.id);
  expect(await stored(service.appUrl, created.id)).toEqual([
    { id: a.id, rules: "controlled-state-machine-only" },
  ]);
});

it("does not invent a configuration ID when no configuration is active", async () => {
  service = await lifecycleService({}, { port });
  const api = service.apiUrl;
  const created = await create(api);
  expect(created.measuredConfigurationId).toBeUndefined();
  const worker = service.worker();
  await worker.ready;
  await expect
    .poll(async () => (await get(api, created.id)).state, { timeout: 15_000 })
    .toBe("ended");
  await worker.kill();
  const ended = await get(api, created.id);
  expect(ended.measuredConfigurationId).toBeUndefined();
  for (const result of ended.references[0]!.results)
    expect(result.measuredConfigurationId).toBeUndefined();
  expect(
    (await stored(service.appUrl, created.id)).every((row) => row.id === null),
  ).toBe(true);
});
