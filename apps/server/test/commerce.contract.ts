// SPDX-License-Identifier: AGPL-3.0-or-later
// Both real programs. The private test process owns the fake payment protocol.
import { spawn } from "node:child_process";
import { once } from "node:events";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { expect, test } from "vitest";
import {
  CancellationResponse,
  CheckPackOrderResponse,
  SubscriptionResponse,
  CommerceCatalogResponse,
} from "@source-taster/contract-service";
import {
  QuotaResponse,
  CheckResponse,
} from "@source-taster/contract-verification/v2";
import { bothPrograms, eventually } from "./support/both-programs.ts";
import { physicsReference } from "./support/doi-fixtures.ts";
test.each(["check-pack", "pro"])(
  "a web-paid %s is visible and consumed through the verification API Quota seam",
  async (plan) => {
    const available = plan === "pro" ? 1000 : 400;
    const privatePath = process.env.SOURCE_TASTER_SERVICE_WORKTREE;
    if (!privatePath)
      throw new Error("SOURCE_TASTER_SERVICE_WORKTREE is required");
    const fake = spawn(
      process.execPath,
      ["test/commerce-provider-process.ts"],
      {
        cwd: join(privatePath, "apps/server"),
        env: {
          PATH: process.env.PATH,
          NODE_ENV: "test",
          SERVICE_TEST_EN16931_CONFIG: process.env.SERVICE_TEST_EN16931_CONFIG,
        },
        stdio: ["ignore", "pipe", "pipe", "ipc"],
      },
    );
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
      const proofResponse = await a.call("/v1/commerce/vat-validations", {
        country: "DE",
        vatId: "DE123456789",
      });
      expect(proofResponse.status).toBe(200);
      const proof = (await proofResponse.json()) as {
        data: { id: string; status: string };
      };
      expect(proof.data.status).toBe("valid");
      const r = await a.call(
        plan === "pro" ? "/v1/commerce/subscriptions" : "/v1/commerce/orders",
        {
          vatValidationId: proof.data.id,
          operationKey: randomUUID(),
          catalogVersion: (plan === "pro" ? catalog.pro[0]! : catalog.packs[0]!)
            .version,
          legalVersion: catalog.legal.version,
          acceptTerms: true,
          immediateStart: true,
          language: "en",
          billing: {
            name: "Buyer",
            address: "Example street 1",
            country: "DE",
            vatId: "DE123456789",
          },
        },
      );
      expect(r.status).toBe(200);
      const order = (
        plan === "pro" ? SubscriptionResponse : CheckPackOrderResponse
      ).parse(await r.json()).data;
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
        return !!q && "remaining" in q && q.remaining === available;
      });
      expect(await quota()).toMatchObject({
        remaining: available,
        features: expect.arrayContaining([
          "ai-extraction",
          "check",
          "history",
          "verification-report",
        ]) as unknown,
      });
      const read = (path: string) =>
        fetch(both!.serviceUrl + path, { headers: { cookie: a.cookie } });
      const invoices = await read("/v1/commerce/invoices");
      expect(invoices.status).toBe(200);
      const listed = (await invoices.json()) as {
        data: { id: string; formats: string[] }[];
      };
      expect(listed.data).toHaveLength(1);
      expect(listed.data[0]!.formats).toEqual(["pdf", "ubl"]);
      const xml = await read(`/v1/commerce/invoices/${listed.data[0]!.id}/ubl`);
      expect(xml.status).toBe(200);
      expect(await xml.text()).toContain("urn:cen.eu:en16931:2017");
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
        return (
          !!q &&
          "remaining" in q &&
          q.remaining === available - 1 &&
          q.consumed === 1
        );
      });
      expect(await quota()).toMatchObject({
        consumed: 1,
        remaining: available - 1,
      });
      if (plan === "pro") {
        const down = once(fake, "message");
        fake.send({
          id: 2,
          providerDown: true,
          now: both.now(),
          url: both.serviceUrl,
        });
        await down;
        const input = {
          operationKey: randomUUID(),
          contractReference: order.id,
          email: "commerce@example.invalid",
          language: "de",
        };
        const cancellation = await fetch(
          both.serviceUrl + "/v1/commerce/cancellations",
          {
            method: "POST",
            headers: {
              origin: "https://web.test.invalid",
              "content-type": "application/json",
            },
            body: JSON.stringify(input),
          },
        );
        expect(cancellation.status).toBe(200);
        expect(
          CancellationResponse.parse(await cancellation.json()).data.receivedAt,
        ).toBe(new Date(both.now()).toISOString());
        const receipts = (await both.mail()).filter(
          (m) => m.subject === "Kündigung des Abonnements erhalten",
        );
        expect(receipts).toHaveLength(1);
        expect(receipts[0]!.text).toContain(new Date(both.now()).toISOString());
        expect(await quota()).toMatchObject({ consumed: 1, remaining: 999 });
      }
    } finally {
      await both?.stop();
      if (fake.exitCode === null) {
        const exited = once(fake, "exit");
        fake.kill("SIGTERM");
        await exited;
      }
    }
  },
  60000,
);
