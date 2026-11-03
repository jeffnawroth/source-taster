// SPDX-License-Identifier: AGPL-3.0-or-later
import pg from "pg";
import { bothRights } from "./support/rights-fixture.ts";
import { CheckResponse as V2CheckResponse } from "@source-taster/contract-verification/v2";
import { createHash, randomUUID } from "node:crypto";
import { writeFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { test, expect } from "vitest";
import { CheckResponse } from "@source-taster/contract-verification";
import { bothPrograms } from "./support/both-programs.ts";
import { physicsReference } from "./support/doi-fixtures.ts";

test("both actual programs deliver separate retained data only with independently verified recipient access", async () => {
  const setup = join(
    process.env.SOURCE_TASTER_113_EVIDENCE!,
    `setup-${randomUUID()}.json`,
  );
  const both = await bothPrograms({
    accounts: true,
    serviceEnv: {
      SERVICE_OPERATOR_SETUP: setup,
      SERVICE_OPERATOR_SESSION_EPOCH:
        "113-owned-operator-epoch-at-least-32-characters",
      SERVICE_OPERATOR_ORIGINS: JSON.stringify(["https://web.test.invalid"]),
    },
  });
  try {
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
    const o = await both.signIn("operator113@example.invalid");
    await writeFile(
      setup,
      JSON.stringify({
        accountId: o.data.accountId,
        codeHash: createHash("sha256").update("setup113").digest("hex"),
        completionFile: setup + ".done",
      }),
    );
    expect(
      (
        await call(
          "/v1/operator/bootstrap",
          { setupCode: "setup113" },
          o.cookie,
        )
      ).status,
    ).toBe(200);
    await both.advance(61000);
    const signed = await both.signIn("operator113@example.invalid");
    const login = await call("/v1/operator/session", {}, signed.cookie);
    const operator = login.headers.get("set-cookie")!.split(";")[0]!;
    const a = await both.signIn("recipient113@example.invalid");
    const headers = {
      authorization: `Bearer ${a.token}`,
      "content-type": "application/json",
    };
    const created = await fetch(both.apiUrl + "/v1/checks", {
      method: "POST",
      headers,
      body: JSON.stringify({ text: physicsReference }),
    });
    const check = CheckResponse.parse(await created.json()).data;
    const command = {
      operationId: randomUUID(),
      accountId: a.data.accountId,
      action: "data-subject-request",
      reason: "support-case",
    };
    await both.advance(61000);
    const fresh = await both.signIn("operator113@example.invalid");
    expect(
      (
        await call(
          "/v1/operator/fresh-proof",
          command,
          `${operator}; ${fresh.cookie}`,
        )
      ).status,
    ).toBe(200);
    const initiated = await call(
      "/v1/operator/data-subject",
      command,
      operator,
    );
    expect(initiated.status).toBe(200);
    expect(JSON.stringify(await initiated.json())).not.toContain(
      physicsReference,
    );
    const path = `/v1/data-subject/${command.operationId}`;
    expect(
      (
        await fetch(both.apiUrl + path + "/download", {
          headers: { cookie: operator },
        })
      ).status,
    ).toBe(401);
    const challenge = await call(path + "/challenge", {}, a.cookie);
    expect(challenge.status).toBe(200);
    const binding = challenge.headers.get("set-cookie")!.split(";")[0]!;
    const mail = await both.mail();
    const code = mail.at(-1)!.text.match(/\b\d{6}\b/)![0];
    const confirmed = await call(
      path + "/confirm",
      { code },
      `${a.cookie}; ${binding}`,
    );
    expect(confirmed.status).toBe(200);
    const { data: grant } = (await confirmed.json()) as {
      data: { accessToken: string };
    };
    const download = (url: string) =>
      fetch(url + path + "/download", {
        headers: { authorization: `Bearer ${grant.accessToken}` },
      });
    const verification = await download(both.apiUrl);
    expect(verification.status).toBe(200);
    expect(verification.headers.get("content-disposition")).toContain(
      "verification-data.json",
    );
    const payload = (await verification.json()) as {
      checks: { id: string; references: { originalText: string }[] }[];
    };
    expect(
      payload.checks.find((c) => c.id === check.id)?.references[0]
        ?.originalText,
    ).toBe(physicsReference);
    const service = await download(both.serviceUrl);
    expect(service.status).toBe(200);
    expect(JSON.stringify(await service.json())).not.toContain(
      physicsReference,
    );
    const status = await call(
      `/v1/operator/data-subject/${command.operationId}`,
      undefined,
      operator,
    );
    expect(await status.json()).toMatchObject({
      data: {
        status: "delivered",
        parts: { service: "downloaded", verification: "downloaded" },
      },
    });
    expect(
      (
        await fetch(both.apiUrl + `/v1/data-subject/${randomUUID()}/download`, {
          headers: { authorization: `Bearer ${grant.accessToken}` },
        })
      ).status,
    ).not.toBe(200);
    await a.call("/v1/sign-out", { everywhere: false });
    expect((await download(both.apiUrl)).status).toBe(403);
    expect((await download(both.serviceUrl)).status).toBe(403);
  } finally {
    await both.stop();
    await Promise.all(
      [setup, setup + ".done"].map((p) => rm(p, { force: true })),
    );
  }
});

test("DSR includes locked History, revisions, immutable results and Manual overrides without extending expiry", async () => {
  const b = await bothRights();
  try {
    const a = await b.signIn("history-dsr@example.invalid");

    const request = (path: string, method = "GET", body?: unknown) =>
      fetch(b.apiUrl + "/v2/" + path, {
        method,
        headers: {
          authorization: `Bearer ${a.token}`,
          "content-type": "application/json",
        },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      });
    expect((await request("history", "PUT", { enabled: true })).status).toBe(
      200,
    );
    const ids: string[] = [];
    for (let i = 0; i < 1; i++) {
      const r = await request("checks", "POST", {
        references: [
          {
            originalText: `Retained original ${i}`,
            fields: { DOI: "10.1038/nphys1170" },
          },
        ],
      });
      expect(r.status).toBe(201);
      const c = V2CheckResponse.parse(await r.json()).data;
      ids.push(c.id);
      await expect
        .poll(
          async () =>
            V2CheckResponse.parse(
              await (await request(`checks/${c.id}`)).json(),
            ).data.state,
          { timeout: 15000 },
        )
        .toBe("ended");
      await b.advance(1);
    }
    const first = V2CheckResponse.parse(
      await (await request(`checks/${ids[0]}`)).json(),
    ).data;
    expect(
      (
        await request(`checks/${ids[0]}/references/1/manual-override`, "POST", {
          expectedRevision: 1,
          resultId: first.references[0]!.results[0]!.id,
          expectedOverrideId: null,
          verdict: "correct",
        })
      ).status,
    ).toBe(200);
    expect(
      (
        await request(`checks/${ids[0]}/references/1/revisions`, "POST", {
          expectedRevision: 1,
          fields: {
            ...first.references[0]!.fields,
            title: "Recipient correction",
          },
          recheck: false,
        })
      ).status,
    ).toBe(200);
    const history = await request("history");
    expect(history.status).toBe(200);
    const h = (await history.json()) as {
      data: { entries: { id: string; locked: boolean; expiresAt: string }[] };
    };
    // Imported retained lock state is fixture setup, not proof of paid-Plan grant
    // qualification (the existing #104 service grant handoff belongs downstream).
    // The actual two programs still own authorization, codec, retention and delivery.
    const fixtureDb = new pg.Client({ connectionString: b.urls[0] });
    await fixtureDb.connect();
    try {
      await fixtureDb.query(
        "UPDATE verification.checks SET history_locked=true WHERE id=$1",
        [ids[0]],
      );
    } finally {
      await fixtureDb.end();
    }
    const id = await b.initiate(a.data.accountId);
    const token = await b.verify(id, a.cookie);
    const response = await b.download(id, token);
    expect(response.status).toBe(200);
    const payload = (await response.json()) as {
      checks: {
        id: string;
        historyLocked: boolean;
        contentExpiresAt: string;
        references: {
          originalText: string;
          revisions: unknown[];
          results: { manualOverride: unknown }[];
        }[];
      }[];
    };
    expect(payload.checks).toHaveLength(1);
    const retained = payload.checks.find((c) => c.id === ids[0])!;
    expect(retained.historyLocked).toBe(true);
    expect(retained.contentExpiresAt).toBe(
      h.data.entries.find((c) => c.id === ids[0])!.expiresAt,
    );
    expect(retained.references[0]).toMatchObject({
      originalText: "Retained original 0",
      revisions: [expect.anything(), expect.anything()],
      results: [{ manualOverride: { verdict: "correct" } }],
    });
    await b.advance(86400000);
    expect((await b.download(id, token)).status).toBe(403);
  } finally {
    await b.cleanup();
  }
});

test("reviewed deleted-Account delivery cannot resurrect Checks or transfer old grants to re-registration", async () => {
  const b = await bothRights();
  try {
    const a = await b.signIn("deleted-dsr@example.invalid");
    const created = await fetch(b.apiUrl + "/v1/checks", {
      method: "POST",
      headers: {
        authorization: `Bearer ${a.token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ text: physicsReference }),
    });
    expect(created.status).toBe(201);
    const id = await b.initiate(a.data.accountId);
    const token = await b.verify(id, a.cookie);
    expect((await b.download(id, token)).status).toBe(200);
    await b.service().command({ accountId: a.data.accountId, deleted: true });
    expect((await b.download(id, token)).status).toBe(403);
    await writeFile(
      b.reviews,
      JSON.stringify([
        {
          requestId: id,
          accountId: a.data.accountId,
          ownerId: a.data.ownerId,
          recipient: "reviewed-dsr@example.invalid",
          language: "en",
          verifiedAt: new Date(b.now()).toISOString(),
          expiresAt: new Date(b.now() + 3600000).toISOString(),
          evidenceReference: "reviewed-case-113",
          epoch: "initial-auth-epoch",
        },
      ]),
    );
    await b.advance(61000);
    const reviewed = await b.verify(id);
    const v = await b.download(id, reviewed);
    expect(v.status).toBe(200);
    expect(await v.json()).toMatchObject({ checks: [], reports: [] });
    const service = await b.download(id, reviewed, b.serviceUrl);
    expect(service.status).toBe(200);
    expect(await service.json()).toMatchObject({
      account: null,
      sessions: [],
      quotaGrants: [],
    });
    await b.advance(61000);
    const fresh = await b.signIn("deleted-dsr@example.invalid");
    expect(fresh.data.accountId).not.toBe(a.data.accountId);
    expect(fresh.data.ownerId).not.toBe(a.data.ownerId);
    expect(
      (await b.call(`/v1/data-subject/${id}/challenge`, {}, fresh.cookie))
        .status,
    ).toBe(403);
  } finally {
    await b.cleanup();
  }
});
