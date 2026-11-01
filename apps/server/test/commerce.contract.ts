// SPDX-License-Identifier: AGPL-3.0-or-later
// Both real programs. The private test process owns the fake payment protocol.
import { spawn } from "node:child_process";
import { once } from "node:events";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { expect, test } from "vitest";
import {
  CheckPackOrderResponse,
  CommerceCatalogResponse,
} from "@source-taster/contract-service";
import {
  QuotaResponse,
  CheckResponse,
} from "@source-taster/contract-verification/v2";
import { bothPrograms, eventually } from "./support/both-programs.ts";
import { physicsReference } from "./support/doi-fixtures.ts";
test("a web-paid Check pack is visible and consumed through the verification API's existing Quota seam", async () => {
  const privatePath = process.env.SOURCE_TASTER_SERVICE_WORKTREE;
  if (!privatePath)
    throw new Error("SOURCE_TASTER_SERVICE_WORKTREE is required");
  const fake = spawn(process.execPath, ["test/commerce-provider-process.ts"], {
    cwd: join(privatePath, "apps/server"),
    env: { PATH: process.env.PATH, NODE_ENV: "test" },
    stdio: ["ignore", "pipe", "pipe", "ipc"],
  });
  let output = "";
  fake.stderr!.on("data", (b) => {
    output += String(b);
  });
  const ready = await new Promise<{ config: string }>((resolve, reject) => {
    fake.once("message", (m) => resolve(m as { config: string }));
    fake.once("exit", () => reject(new Error(output)));
  });
  let both: Awaited<ReturnType<typeof bothPrograms>> | undefined;
  try {
    both = await bothPrograms({
      accounts: true,
      serviceEnv: { SERVICE_COMMERCE_CONFIG: ready.config },
    });
    await both.service().command({ commerceSeed: true });
    const a = await both.signIn("commerce@example.invalid");
    const quota = async () => {
      const r = await fetch(both!.apiUrl + "/v2/quota", {
        headers: { authorization: `Bearer ${a.token}` },
      });
      expect(r.status).toBe(200);
      return QuotaResponse.parse(await r.json()).data;
    };
    expect(await quota()).toMatchObject({ remaining: 100 });
    const catalog = CommerceCatalogResponse.parse(
      await (await fetch(both.serviceUrl + "/v1/commerce/catalog")).json(),
    ).data;
    const r = await a.call("/v1/commerce/orders", {
      operationKey: randomUUID(),
      catalogVersion: catalog.packs[0]!.version,
      legalVersion: catalog.legal.version,
      acceptTerms: true,
      immediateStart: true,
      language: "en",
      billing: { name: "Buyer", address: "Example street 1", country: "DE" },
    });
    expect(r.status).toBe(200);
    const order = CheckPackOrderResponse.parse(await r.json()).data;
    expect(await quota()).toMatchObject({ remaining: 100 });
    const paid = once(fake, "message");
    fake.send({
      id: 1,
      orderId: order.id,
      now: both.now(),
      url: both.serviceUrl,
    });
    await paid;
    await eventually(async () => {
      const q = await quota();
      return !!q && "remaining" in q && q.remaining === 400;
    });
    expect(await quota()).toMatchObject({
      remaining: 400,
      features: ["ai-extraction", "check", "history", "verification-report"],
    });
    const created = await fetch(both.apiUrl + "/v2/checks", {
      method: "POST",
      headers: {
        authorization: `Bearer ${a.token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ text: physicsReference }),
    });
    expect(created.status).toBe(201);
    const check = CheckResponse.parse(await created.json()).data;
    await eventually(async () => {
      const r = await fetch(both!.apiUrl + `/v2/checks/${check.id}`, {
        headers: { authorization: `Bearer ${a.token}` },
      });
      return CheckResponse.parse(await r.json()).data.state === "ended";
    }, 30000);
    await eventually(async () => {
      const q = await quota();
      return !!q && "remaining" in q && q.remaining === 399 && q.consumed === 1;
    });
    expect(await quota()).toMatchObject({ consumed: 1, remaining: 399 });
  } finally {
    await both?.stop();
    if (fake.exitCode === null) {
      const exited = once(fake, "exit");
      fake.kill("SIGTERM");
      await exited;
    }
  }
}, 60000);
