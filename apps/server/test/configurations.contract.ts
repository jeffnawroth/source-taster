import { z } from "zod";
import {
  ConfigurationInspectionResponse,
  ActiveConfiguration,
} from "@source-taster/contract-internal";
// SPDX-License-Identifier: AGPL-3.0-or-later
// Actual programs and real owned PostgreSQL. No qualified/activated production state.
import { mkdtemp, writeFile, mkdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHash, randomUUID, sign, createPrivateKey } from "node:crypto";
import { expect, test } from "vitest";
import { bothPrograms } from "./support/both-programs.ts";
test("two programs expose truthful missing gates and refuse forged, stale, replayed or unavailable configuration authority", async () => {
  const directory = await mkdtemp(join(tmpdir(), "st114-both-"));
  const setup = join(directory, "setup.json"),
    registry = join(directory, "registry.json"),
    file = join(directory, "configuration.json");
  await writeFile(
    file,
    JSON.stringify({
      enabledSources: [
        "openlibrary",
        "googlebooks",
        "url",
        "internetarchive",
        "semanticscholar",
      ],
    }),
  );
  await writeFile(
    registry,
    JSON.stringify([{ configuration: file, root: directory }]),
  );
  const both = await bothPrograms({
    accounts: true,
    startWorker: false,
    apiPort: 5801,
    servicePort: 5803,
    verificationEnv: { SOURCE_TASTER_MEASURED_CONFIGURATIONS: registry },
    serviceEnv: {
      SERVICE_OPERATOR_SETUP: setup,
      SERVICE_OPERATOR_SESSION_EPOCH: "114-independent-test-operator-epoch",
      SERVICE_OPERATOR_ORIGINS: JSON.stringify(["https://web.test.invalid"]),
    },
  });
  const call = (path: string, body?: unknown, cookie?: string) =>
    fetch(both.serviceUrl + path, {
      method: body === undefined ? "GET" : "POST",
      headers: {
        origin: "https://web.test.invalid",
        ...(body === undefined ? {} : { "content-type": "application/json" }),
        ...(cookie ? { cookie } : {}),
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
  try {
    const operator = await both.signIn("operator@example.invalid");
    await writeFile(
      setup,
      JSON.stringify({
        accountId: operator.data.accountId,
        codeHash: createHash("sha256").update("114-setup").digest("hex"),
        completionFile: join(directory, "completed"),
      }),
    );
    expect(
      (
        await call(
          "/v1/operator/bootstrap",
          { setupCode: "114-setup" },
          operator.cookie,
        )
      ).status,
    ).toBe(200);
    await both.advance(61000);
    const signed = await both.signIn("operator@example.invalid");
    const login = await call("/v1/operator/session", {}, signed.cookie);
    const cookie = login.headers.get("set-cookie")!.split(";")[0]!;
    expect((await call("/v1/operator/configurations")).status).toBe(401);
    const listing = await call(
      "/v1/operator/configurations",
      undefined,
      cookie,
    );
    expect(listing.status).toBe(200);
    const data = z
      .object({
        data: z.object({
          configurations: ConfigurationInspectionResponse.shape.configurations,
          active: ActiveConfiguration.nullable(),
        }),
      })
      .parse(await listing.json()).data;
    expect(data.active).toBeNull();
    expect(data.configurations).toHaveLength(1);
    const config = data.configurations[0]!;
    expect(config.eligible).toBe(false);
    expect(config.reasons).toEqual(
      expect.arrayContaining([
        "uncalibrated",
        "no-load-report",
        "reference-test-set-unavailable",
        ...config.sources.map(
          (s: string) => `source-qualification-missing:${s}`,
        ),
      ]),
    );
    // Unrelated configuration approvals/logs neither change this identity nor
    // invalidate its evidence binding. Private paths never cross the protocol.
    expect(config.reasons.join(" ")).not.toContain(directory);
    await mkdir(join(directory, "qualifications", "unrelated"), {
      recursive: true,
    });
    await writeFile(
      join(directory, "qualifications", "unrelated", "provider-approval.json"),
      JSON.stringify({ controlled: "unrelated" }),
    );
    const refreshed = z
      .object({
        data: z.object({
          configurations: ConfigurationInspectionResponse.shape.configurations,
        }),
      })
      .parse(
        await (
          await call("/v1/operator/configurations", undefined, cookie)
        ).json(),
      ).data.configurations[0]!;
    expect(refreshed.id).toBe(config.id);
    expect(refreshed.evidenceDigest).toBe(config.evidenceDigest);
    const invalidFile = join(directory, "invalid-configuration.json");
    await writeFile(
      invalidFile,
      JSON.stringify({ enabledSources: [], passed: true }),
    );
    const alternate = join(directory, "alternate-evidence");
    await mkdir(join(alternate, "reference-test-set"), { recursive: true });
    await writeFile(
      join(alternate, "reference-test-set", "manifest.json"),
      JSON.stringify({
        kind: "reference-test-set",
        version: "controlled-other-version",
      }),
    );
    await writeFile(
      registry,
      JSON.stringify([
        { configuration: invalidFile, root: directory },
        { configuration: file, root: alternate },
        { configuration: file, root: directory },
      ]),
    );
    const isolated = await call(
      "/v1/operator/configurations",
      undefined,
      cookie,
    );
    expect(isolated.status).toBe(200);
    const isolatedConfigs = z
      .object({
        data: z.object({
          configurations: ConfigurationInspectionResponse.shape.configurations,
        }),
      })
      .parse(await isolated.json()).data.configurations;
    expect(isolatedConfigs).toHaveLength(3);
    expect(isolatedConfigs[0]!.eligible).toBe(false);
    expect(isolatedConfigs[0]!.reasons).toContain("configuration-invalid");
    expect(isolatedConfigs[1]!.id).toBe(config.id);
    expect(isolatedConfigs[1]!.evidenceDigest).not.toBe(config.evidenceDigest);
    expect(isolatedConfigs[2]!.id).toBe(config.id);
    const command = {
      operationId: randomUUID(),
      accountId: operator.data.accountId,
      action: "activate-configuration",
      reason: "correction",
      configurationId: config.id,
      evidenceDigest: config.evidenceDigest,
      expectedVersion: 0,
    };
    await both.advance(61000);
    const fresh = await both.signIn("operator@example.invalid");
    expect(
      (
        await call(
          "/v1/operator/fresh-proof",
          command,
          `${cookie}; ${fresh.cookie}`,
        )
      ).status,
    ).toBe(200);
    expect(
      (await call("/v1/operator/operations", command, cookie)).status,
    ).toBe(403);
    const request = () =>
      fetch(both.apiUrl + "/v2/checks", {
        method: "POST",
        headers: {
          authorization: `Bearer ${signed.token}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          references: [
            { originalText: "Controlled source-only input", fields: {} },
          ],
        }),
      });
    expect((await request()).status).toBe(503); // no active configuration, no silent default
    const body = JSON.stringify({
        action: "validate",
        id: config.id,
        evidenceDigest: config.evidenceDigest,
      }),
      path = "/internal/configuration/inspect",
      iat = Math.floor(both.now() / 1000);
    const header = Buffer.from(
      JSON.stringify({
        alg: "EdDSA",
        typ: "service+jwt",
        kid: both.serviceInternal.key.kid,
      }),
    ).toString("base64url");
    const claims = Buffer.from(
      JSON.stringify({
        iss: both.serviceConfig.issuer,
        aud: both.serviceConfig.verificationAudience,
        purpose: "configuration-authority",
        iat,
        nbf: iat,
        exp: iat + 30,
        jti: randomUUID(),
        method: "POST",
        path,
        bodyHash: createHash("sha256").update(body).digest("base64url"),
      }),
    ).toString("base64url");
    const message = `${header}.${claims}`;
    const token = `${message}.${sign(null, Buffer.from(message), createPrivateKey(both.serviceInternal.key.pem)).toString("base64url")}`;
    const inspect = (payload = body) =>
      fetch(both.apiUrl + path, {
        method: "POST",
        headers: {
          authorization: `Bearer ${token}`,
          "content-type": "application/json",
        },
        body: payload,
      });
    expect(
      (await inspect(JSON.stringify({ action: "validate", id: config.id })))
        .status,
    ).toBe(401);
    const matching = await inspect();
    expect(matching.status).toBe(200);
    expect(
      ConfigurationInspectionResponse.parse(await matching.json())
        .configurations[0]!.evidenceDigest,
    ).toBe(config.evidenceDigest);
    expect((await inspect()).status).toBe(401);
    await both.restartWeb();
    expect((await inspect()).status).toBe(401);
    await both.service().stop();
    expect((await request()).status).toBe(503);
  } finally {
    await both.stop();
    await rm(directory, { recursive: true, force: true });
  }
});

test("controlled source-only Check state machine snapshots the pointer once across activation, concurrent starts and restart", async () => {
  const { lifecycleService } = await import("./support/lifecycle-service.ts");
  const { CheckResponse } =
    await import("@source-taster/contract-verification/v2");
  const directory = await mkdtemp(join(tmpdir(), "st114-snapshot-")),
    pointer = join(directory, "pointer.json");
  const a = {
    id: `sha256:${"a".repeat(64)}`,
    evidenceDigest: `sha256:${"b".repeat(64)}`,
    operationId: randomUUID(),
    version: 1,
  };
  const b = {
    ...a,
    id: `sha256:${"c".repeat(64)}`,
    operationId: randomUUID(),
    version: 2,
  };
  await writeFile(pointer, JSON.stringify(a));
  const service = await lifecycleService(
    { TEST_CONFIGURATION_POINTER: pointer },
    { port: "5802" },
  );
  const create = async () => {
    const response = await fetch(service.apiUrl + "/v2/checks", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        references: [
          { originalText: "Controlled state-machine reference", fields: {} },
        ],
      }),
    });
    expect(response.status).toBe(201);
    return CheckResponse.parse(await response.json()).data;
  };
  const get = async (id: string) =>
    CheckResponse.parse(
      await (await fetch(service.apiUrl + `/v2/checks/${id}`)).json(),
    ).data;
  try {
    const old = await create();
    expect(old.measuredConfigurationId).toBe(a.id);
    const worker = service.worker();
    await worker.ready;
    await expect.poll(async () => (await get(old.id)).state).toBe("ended");
    await worker.kill();
    const endedOld = await get(old.id);
    expect(endedOld.references[0]!.results[0]).toMatchObject({
      measuredConfigurationId: a.id,
      scoringRulesVersion: "controlled-state-machine-only",
      outcome: { kind: "status", status: "failed" },
    });
    // Unknown local configurations cannot dispatch the current defaults. The
    // failed immutable result remains evidence, never a qualifying Verdict.
    await writeFile(pointer, JSON.stringify(b));
    const fresh = await Promise.all([create(), create()]);
    expect(fresh.map((c) => c.measuredConfigurationId)).toEqual([b.id, b.id]);
    expect(await get(old.id)).toEqual(endedOld);
    await service.restartWeb();
    expect((await get(old.id)).measuredConfigurationId).toBe(a.id);
    expect((await create()).measuredConfigurationId).toBe(b.id);
    await fetch(service.apiUrl + `/v2/checks/${old.id}/cancel`, {
      method: "POST",
    });
    expect((await get(old.id)).measuredConfigurationId).toBe(a.id);
  } finally {
    await service.stop();
    await rm(directory, { recursive: true, force: true });
  }
});
