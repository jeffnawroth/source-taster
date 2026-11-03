// SPDX-License-Identifier: AGPL-3.0-or-later
// Two actual programs, signed transport, owned PostgreSQL; no deployment gate receipt.
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomUUID, createHash } from "node:crypto";
import { z } from "zod";
import { AbusePolicy } from "@source-taster/contract-internal";
import { expect, test } from "vitest";
import { bothPrograms } from "./support/both-programs.ts";

const CatalogSnapshot = z.object({
  data: z.object({
    version: z.string(),
    plans: z.array(
      z.object({
        plan: z.string(),
        amount: z.number(),
        period: z.string(),
        features: z.array(z.string()),
        grossCents: z.number().nullable(),
        vatBps: z.number().nullable(),
        validityDays: z.number().nullable(),
      }),
    ),
    initial: z.object({
      freeHistoryDays: z.number(),
      paidHistoryDays: z.number(),
      freeHistoryChecks: z.number(),
      referenceLimit: z.number(),
      uploadBytes: z.number(),
    }),
    limits: AbusePolicy.omit({ version: true, initial: true }),
  }),
});
test("Operator limits and Initial values reach two real verification instances without minting fresh counters", async () => {
  const directory = await mkdtemp(join(tmpdir(), "st112-both-"));
  const setup = join(directory, "setup.json");
  const budget = { limit: 100000, windowMs: 600000 };
  const budgets = {
    principal: { guest: budget, free: budget, pro: budget },
    guest: budget,
    allGuests: budget,
    origin: budget,
  };
  const both = await bothPrograms({
    accounts: true,
    startWorker: false,
    apiPort: 5801,
    servicePort: 5803,
    serviceEnv: {
      SERVICE_OPERATOR_SETUP: setup,
      SERVICE_OPERATOR_SESSION_EPOCH: "112-independent-test-operator-epoch",
      SERVICE_OPERATOR_ORIGINS: JSON.stringify(["https://web.test.invalid"]),
    },
    abuse: {
      epoch: "112-ledger-epoch-fixed",
      neutralPlanId: "guest",
      policy: {
        version: "112-seed",
        cacheMs: 30000,
        public: budgets,
        shared: budgets,
      },
      origin: {
        ipv4Prefix: 24,
        ipv6Prefix: 56,
        keys: [
          { id: "112", secret: "12".repeat(32), from: 0, until: 9000000000000 },
        ],
      },
    },
  });
  try {
    await both.advance(86400000);
    const operator = await both.signIn("operator@example.invalid");
    await writeFile(
      setup,
      JSON.stringify({
        accountId: operator.data.accountId,
        codeHash: createHash("sha256").update("test-112-setup").digest("hex"),
        completionFile: join(directory, "completed"),
      }),
    );
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
    expect(
      (
        await call(
          "/v1/operator/bootstrap",
          { setupCode: "test-112-setup" },
          operator.cookie,
        )
      ).status,
    ).toBe(200);
    await both.advance(61000);
    const signed = await both.signIn("operator@example.invalid");
    const login = await call("/v1/operator/session", {}, signed.cookie);
    expect(login.status).toBe(200);
    const cookie = login.headers.get("set-cookie")!.split(";")[0]!;
    const account = await both.signIn("consumer@example.invalid");
    const second = await both.additionalWeb(5802);
    const request = (origin = both.apiUrl) =>
      fetch(origin + "/v2/checks", {
        method: "POST",
        headers: {
          authorization: `Bearer ${account.token}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          references: [
            { originalText: "Synthetic one", fields: {} },
            { originalText: "Synthetic two", fields: {} },
          ],
        }),
      });
    expect((await request()).status).toBe(201);
    expect((await request(second.url)).status).toBe(201);
    const current = CatalogSnapshot.parse(
      await (await call("/v1/operator/catalog", undefined, cookie)).json(),
    ).data;
    const draft = {
      operationId: randomUUID(),
      expectedVersion: current.version,
      effectiveFrom: new Date(both.now() + 120000).toISOString(),
      reason: "correction",
      plans: current.plans.map((p) => ({
        ...p,
        amount: p.plan === "guest" ? 23 : 113,
      })),
      initial: {
        ...current.initial,
        referenceLimit: 1,
        freeHistoryDays: 19,
        freeHistoryChecks: 7,
        paidHistoryDays: 71,
      },
      limits: {
        ...current.limits,
        public: { ...current.limits.public, origin: { ...budget, limit: 1 } },
      },
    };
    expect(
      (await call("/v1/operator/catalog/drafts", draft, cookie)).status,
    ).toBe(200);
    const command = {
      operationId: randomUUID(),
      accountId: operator.data.accountId,
      action: "activate-catalog",
      reason: "correction",
      draftId: draft.operationId,
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
    ).toBe(200);
    await both.advance(58000); // warm each old cache just before the effective instant
    expect((await request()).status).toBe(201);
    expect((await request(second.url)).status).toBe(201);
    await both.advance(1000);
    expect((await request()).status).toBe(503); // stale policy cannot become an allowance
    expect((await request(second.url)).status).toBe(503);
    await both.advance(30000);
    expect((await request()).status).toBe(429);
    expect((await request(second.url)).status).toBe(429);
    await both.restartWeb();
    expect((await request()).status).toBe(429);
    await both.restartService();
    expect((await request()).status).toBe(429);
    // Next version lifts the same-window cap. All old counters remain; input policy is independently observed.
    const latest = CatalogSnapshot.parse(
      await (await call("/v1/operator/catalog", undefined, cookie)).json(),
    ).data;
    const next = {
      ...draft,
      operationId: randomUUID(),
      expectedVersion: latest.version,
      effectiveFrom: new Date(both.now() + 120000).toISOString(),
      limits: { ...draft.limits, public: budgets },
    };
    expect(
      (await call("/v1/operator/catalog/drafts", next, cookie)).status,
    ).toBe(200);
    const activation = {
      ...command,
      operationId: randomUUID(),
      draftId: next.operationId,
    };
    await both.advance(61000);
    const proof = await both.signIn("operator@example.invalid");
    expect(
      (
        await call(
          "/v1/operator/fresh-proof",
          activation,
          `${cookie}; ${proof.cookie}`,
        )
      ).status,
    ).toBe(200);
    expect(
      (await call("/v1/operator/operations", activation, cookie)).status,
    ).toBe(200);
    await both.advance(60000);
    const limited = await request();
    expect(limited.status).toBe(400);
    expect(await limited.json()).toMatchObject({
      code: "reference-limit",
      limit: 1,
    });
    const quota = await fetch(both.apiUrl + "/v2/quota", {
      headers: { authorization: `Bearer ${account.token}` },
    });
    expect(quota.status).toBe(200);
    expect(await quota.json()).toMatchObject({
      data: {
        history: {
          freeHistoryDays: 19,
          freeHistoryChecks: 7,
          paidHistoryDays: 71,
          settingsVersion: 2,
        },
      },
    });
    const state = CatalogSnapshot.parse(
      await (await call("/v1/operator/catalog", undefined, cookie)).json(),
    ).data;
    const narrow = structuredClone(budgets);
    for (const plan of Object.values(narrow.principal)) plan.windowMs = 300000;
    const change = {
      ...next,
      operationId: randomUUID(),
      expectedVersion: state.version,
      effectiveFrom: new Date(both.now() + 120000).toISOString(),
      limits: { ...next.limits, public: narrow },
    };
    expect(
      (await call("/v1/operator/catalog/drafts", change, cookie)).status,
    ).toBe(200);
    const windowActivation = {
      ...command,
      operationId: randomUUID(),
      draftId: change.operationId,
    };
    await both.advance(61000);
    const windowProof = await both.signIn("operator@example.invalid");
    expect(
      (
        await call(
          "/v1/operator/fresh-proof",
          windowActivation,
          `${cookie}; ${windowProof.cookie}`,
        )
      ).status,
    ).toBe(200);
    expect(
      (await call("/v1/operator/operations", windowActivation, cookie)).status,
    ).toBe(200);
    await both.advance(60000);
    const anonymous = (origin = both.apiUrl) =>
      fetch(origin + "/v1/structurings", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: "Synthetic reference" }),
      });
    expect((await anonymous()).status).toBe(503);
    expect((await anonymous(second.url)).status).toBe(503);
    await both.restartService();
    expect((await anonymous()).status).toBe(503);
    await both.advance(86400000);
    const guest = await both.issue();
    const guestQuota = await fetch(both.apiUrl + "/v2/quota", {
      headers: { authorization: `Bearer ${guest.token}` },
    });
    expect(guestQuota.status).toBe(200);
    expect(await guestQuota.json()).toMatchObject({
      data: { granted: 23, remaining: 23 },
    });
    const at = new Date(both.now());
    await both.advance(
      Date.UTC(at.getUTCFullYear(), at.getUTCMonth() + 1, 1, 2) - both.now(),
    );
    const renewed = await both.signIn("consumer@example.invalid");
    const freeQuota = await fetch(both.apiUrl + "/v2/quota", {
      headers: { authorization: `Bearer ${renewed.token}` },
    });
    expect(freeQuota.status).toBe(200);
    expect(await freeQuota.json()).toMatchObject({
      data: { granted: 113, remaining: 113 },
    });
    await both.service().stop();
    expect((await anonymous()).status).toBe(503);
  } finally {
    await both.stop();
    await rm(directory, { recursive: true, force: true });
  }
});
