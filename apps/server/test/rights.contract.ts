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

interface ExportFrame {
  type: string;
  snapshotId: string;
  program: string;
  sequence: number;
  cursor: string;
  base64: string;
  sha256: string;
  completionToken: string;
  parts: number;
  bytes: number;
  complete: boolean;
  records: Record<string, string>;
}
interface RetainedExport {
  checks: { references: { originalText: string }[] }[];
  invoices: { id: string; pdf: { base64: string; sha256: string } }[];
}
const parseFrame = (line: string) => JSON.parse(line) as ExportFrame;
const parseExport = (bytes: string) => JSON.parse(bytes) as RetainedExport;
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
    await expect
      .poll(
        async () =>
          CheckResponse.parse(
            await (
              await fetch(`${both.apiUrl}/v1/checks/${check.id}`, { headers })
            ).json(),
          ).data.state,
        { timeout: 15000 },
      )
      .toBe("ended");
    const guest = await both.issue();
    const guestCreated = await fetch(both.apiUrl + "/v1/checks", {
      method: "POST",
      headers: {
        authorization: `Bearer ${guest.token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        text: `Guest-only content 113 ${physicsReference}`,
      }),
    });
    expect(guestCreated.status).toBe(201);
    const guestCheck = CheckResponse.parse(await guestCreated.json()).data;
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
    expect(payload.checks.some((c) => c.id === guestCheck.id)).toBe(false);
    expect(JSON.stringify(payload)).not.toContain("Guest-only content 113");
    expect(
      payload.checks.find((c) => c.id === check.id)?.references[0]
        ?.originalText,
    ).toBe(physicsReference);
    const service = await download(both.serviceUrl);
    expect(service.status).toBe(200);
    expect(JSON.stringify(await service.json())).not.toContain(
      physicsReference,
    );
    const beforeReceipt = await call(
      `/v1/operator/data-subject/${command.operationId}`,
      undefined,
      operator,
    );
    expect(await beforeReceipt.json()).toMatchObject({
      data: {
        status: "verified",
        parts: { service: "pending", verification: "pending" },
      },
    });
    for (const origin of [both.serviceUrl, both.apiUrl]) {
      const delivered = await fetch(origin + path + "/download?parts=1", {
        headers: { authorization: `Bearer ${grant.accessToken}` },
      });
      expect(delivered.status).toBe(200);
      const manifest = (await delivered.text())
        .trim()
        .split("\n")
        .map((line) => parseFrame(line))
        .at(-1)!;
      const acknowledge = () =>
        fetch(origin + path + "/received", {
          method: "POST",
          headers: {
            authorization: `Bearer ${grant.accessToken}`,
            "content-type": "application/json",
          },
          body: JSON.stringify({ completionToken: manifest.completionToken }),
        });
      expect((await acknowledge()).status).toBe(200);
      expect((await acknowledge()).status).toBe(200);
    }
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
    // Pin the deletion interleaving at the real authority HTTP boundary. The
    // sweep changes the tombstone metadata after snapshot capture, so the
    // existing version fence must abort this stream rather than mix versions.
    await both.stopVerificationWorker();
    await both.advance(86370000);
    const boundary = both.trap(
      undefined,
      undefined,
      2,
      "/internal/data-subject-authority",
    );
    const pendingExpiry = download(both.apiUrl);
    await boundary.arrived;
    try {
      await both.maintain();
    } finally {
      boundary.release();
    }
    const interruptedExpiry = await pendingExpiry;
    expect(interruptedExpiry.status).toBe(200);
    await expect(interruptedExpiry.json()).rejects.toThrow();

    // A separately requested fresh snapshot after the completed sweep contains
    // no expired content. This is explicit recovery, never a blind retry.
    const afterContentExpiry = await download(both.apiUrl);
    expect(afterContentExpiry.status).toBe(200);
    expect(await afterContentExpiry.json()).toMatchObject({
      checks: [],
      reports: [],
    });
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
    const check = CheckResponse.parse(await created.json()).data;
    await expect
      .poll(
        async () =>
          CheckResponse.parse(
            await (
              await fetch(b.apiUrl + `/v1/checks/${check.id}`, {
                headers: { authorization: `Bearer ${a.token}` },
              })
            ).json(),
          ).data.state,
        { timeout: 15000 },
      )
      .toBe("ended");
    const id = await b.initiate(a.data.accountId);
    const token = await b.verify(id, a.cookie);
    const initial = await b.download(id, token);
    expect(initial.status).toBe(200);
    expect(((await initial.json()) as RetainedExport).checks).toHaveLength(1);
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

test("large retained exports stream bounded resumable parts from BOTH programs without truncating a single large record", async () => {
  const b = await bothRights(1024);
  try {
    const a = await b.signIn("large-dsr@example.invalid");
    const expected: string[] = [];
    for (let i = 0; i < 3; i++) {
      const originalText = `Retained ${i}: ` + "📖 large record ".repeat(120);
      expected.push(originalText);
      const response = await fetch(b.apiUrl + "/v2/checks", {
        method: "POST",
        headers: {
          authorization: `Bearer ${a.token}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          references: [{ originalText, fields: { DOI: "10.1038/nphys1170" } }],
        }),
      });
      expect(response.status).toBe(201);
      const check = V2CheckResponse.parse(await response.json()).data;
      await expect
        .poll(
          async () =>
            V2CheckResponse.parse(
              await (
                await fetch(b.apiUrl + `/v2/checks/${check.id}`, {
                  headers: { authorization: `Bearer ${a.token}` },
                })
              ).json(),
            ).data.state,
          { timeout: 15000 },
        )
        .toBe("ended");
    }
    const sql = new pg.Client({ connectionString: b.urls[1] });
    await sql.connect();
    const pdf = Buffer.from(
      "%PDF-exact-large-archive" + "invoice-bytes".repeat(600),
    );
    try {
      for (let i = 0; i < 3; i++)
        await sql.query(
          `INSERT INTO service.commerce_invoices(id,"orderId","ownerId",pdf,ubl,structured,"retainUntil") VALUES($1,$2,$3,$4,$5,$6,'2035-01-01')`,
          [
            `large-${i}`,
            randomUUID(),
            a.data.ownerId,
            pdf,
            Buffer.from("<Invoice>exact</Invoice>"),
            { index: i },
          ],
        );
    } finally {
      await sql.end();
    }
    const id = await b.initiate(a.data.accountId);
    const token = await b.verify(id, a.cookie);
    for (const [program, origin] of [
      ["verification", b.apiUrl],
      ["service", b.serviceUrl],
    ] as const) {
      const url = origin + `/v1/data-subject/${id}/download?parts=1`;
      const headers = { authorization: `Bearer ${token}` };
      const response = await fetch(url, { headers });
      expect(response.status, b.web().output() + b.service().output()).toBe(
        200,
      );
      expect(response.headers.get("content-type")).toContain(
        "application/x-ndjson",
      );
      const lines = (await response.text())
        .trim()
        .split("\n")
        .map((line) => parseFrame(line));
      const manifest = lines.pop()!;
      expect(manifest).toMatchObject({
        type: "manifest",
        requestId: id,
        program,
        parts: lines.length,
        complete: true,
      });
      expect(lines.length).toBeGreaterThan(5);
      expect(
        (
          await fetch(origin + `/v1/data-subject/${id}/received`, {
            method: "POST",
            headers,
          })
        ).status,
      ).toBe(403);

      for (const [index, part] of lines.entries()) {
        const bytes = Buffer.from(part.base64, "base64");
        expect(bytes.length).toBeLessThanOrEqual(1024);
        expect(part.sequence).toBe(index);
        expect(part.sha256).toBe(
          createHash("sha256").update(bytes).digest("hex"),
        );
      }
      const bytes = Buffer.concat(
        lines.map((part) => Buffer.from(part.base64, "base64")),
      );
      expect(manifest.sha256).toBe(
        createHash("sha256").update(bytes).digest("hex"),
      );
      const data = parseExport(bytes.toString());
      if (program === "verification")
        expect(
          data.checks
            .map(
              (c: { references: { originalText: string }[] }) =>
                c.references[0]!.originalText,
            )
            .sort(),
        ).toEqual(expected.sort());
      else {
        expect(data.invoices.map((invoice) => invoice.id).sort()).toEqual([
          "large-0",
          "large-1",
          "large-2",
        ]);
        for (const invoice of data.invoices)
          expect(Buffer.from(invoice.pdf.base64, "base64")).toEqual(pdf);
        expect(bytes.toString()).not.toContain("Retained 0:");
      }
      const resumed = await fetch(
        url + `&cursor=${encodeURIComponent(lines[1]!.cursor)}`,
        { headers },
      );
      const remainder = (await resumed.text())
        .trim()
        .split("\n")
        .map((line) => parseFrame(line));
      expect(remainder.slice(0, -1)).toEqual(lines.slice(2));
      expect(remainder.at(-1)).toEqual(manifest);
      expect(
        (
          await fetch(
            url + `&cursor=${encodeURIComponent(lines[1]!.cursor + "bad")}`,
            { headers },
          )
        ).status,
      ).toBe(403);
      expect(
        (
          await fetch(origin + `/v1/data-subject/${id}/received`, {
            method: "POST",
            headers: { ...headers, "content-type": "application/json" },
            body: JSON.stringify({ completionToken: manifest.completionToken }),
          })
        ).status,
      ).toBe(200);
    }
    await a.call("/v1/sign-out", { everywhere: false });
    for (const origin of [b.apiUrl, b.serviceUrl])
      expect(
        (
          await fetch(origin + `/v1/data-subject/${id}/download?parts=1`, {
            headers: { authorization: `Bearer ${token}` },
          })
        ).status,
      ).toBe(403);
  } finally {
    await b.cleanup();
  }
});

test("multipart cursors survive BOTH program restarts, reject substitutions, exclude late writes, and restart explicitly", async () => {
  const b = await bothRights(1024);
  try {
    const a = await b.signIn("restart-dsr@example.invalid");
    const id = await b.initiate(a.data.accountId),
      token = await b.verify(id, a.cookie);
    const headers = { authorization: `Bearer ${token}` };
    for (const [program, origin] of [
      ["verification", b.apiUrl],
      ["service", b.serviceUrl],
    ] as const) {
      const url = origin + `/v1/data-subject/${id}/download?parts=1`;
      const initial = await fetch(url, { headers });
      expect(initial.status).toBe(200);
      const all = (await initial.text())
        .trim()
        .split("\n")
        .map((line) => parseFrame(line));
      const manifest = all.at(-1)!;
      const first = all[0]!;
      expect(first.type).toBe("part");
      if (program === "verification") await b.restartWeb();
      else await b.restartService();
      const resumed = await fetch(
        url + "&cursor=" + encodeURIComponent(first.cursor),
        { headers },
      );
      expect(resumed.status).toBe(200);
      expect(
        (await resumed.text())
          .trim()
          .split("\n")
          .map((line) => parseFrame(line)),
      ).toEqual(all.slice(1));
      const otherOrigin = program === "verification" ? b.serviceUrl : b.apiUrl;
      expect(
        (
          await fetch(
            otherOrigin +
              `/v1/data-subject/${id}/download?parts=1&cursor=${encodeURIComponent(first.cursor)}`,
            { headers },
          )
        ).status,
      ).toBe(403);
      const sql = new pg.Client({
        connectionString: b.urls[program === "verification" ? 0 : 1],
      });
      await sql.connect();
      try {
        if (program === "verification")
          await sql.query(
            `INSERT INTO verification.checks(id,owner_id,actor_id,state,content_expires_at,deleted_at) VALUES($1,$2,$3,'ended',now(),now())`,
            [randomUUID(), a.data.ownerId, a.data.accountId],
          );
        else
          await sql.query(
            `INSERT INTO service.commerce_invoices(id,"orderId","ownerId",pdf,structured,"retainUntil") VALUES('late-snapshot',$1,$2,$3,'{}','2035-01-01')`,
            [randomUUID(), a.data.ownerId, Buffer.from("%PDF-late")],
          );
      } finally {
        await sql.end();
      }
      const stable = await fetch(
        url + "&cursor=" + encodeURIComponent(first.cursor),
        { headers },
      );
      expect(stable.status).toBe(200);
      expect(
        (await stable.text())
          .trim()
          .split("\n")
          .map((line) => parseFrame(line))
          .at(-1),
      ).toEqual(manifest);
      const fresh = await fetch(url + "&restart=" + randomUUID(), { headers });
      expect(fresh.status).toBe(200);
      const refreshed = (await fresh.text())
        .trim()
        .split("\n")
        .map((line) => parseFrame(line));
      expect(refreshed.at(-1)!.snapshotId).not.toBe(manifest.snapshotId);
      if (program === "service")
        expect(
          parseExport(
            Buffer.concat(
              refreshed
                .slice(0, -1)
                .map((frame) => Buffer.from(frame.base64, "base64")),
            ).toString(),
          ).invoices,
        ).toHaveLength(1);
    }
    const wrong = await b.signIn("other-recipient-dsr@example.invalid");
    const wrongRequest = await b.initiate(wrong.data.accountId),
      wrongToken = await b.verify(wrongRequest, wrong.cookie);
    for (const origin of [b.apiUrl, b.serviceUrl])
      expect(
        (
          await fetch(origin + `/v1/data-subject/${id}/download?parts=1`, {
            headers: { authorization: `Bearer ${wrongToken}` },
          })
        ).status,
      ).toBe(403);
    const actor = (
      (await (
        await b.call("/v1/operator/session", undefined, b.operator)
      ).json()) as { data: { accountId: string } }
    ).data.accountId;
    const revoked = new pg.Client({ connectionString: b.urls[1] });
    await revoked.connect();
    try {
      await revoked.query(
        `UPDATE service."OperatorRole" SET permissions=array_remove(permissions,'exports:write') WHERE "accountId"=$1`,
        [actor],
      );
    } finally {
      await revoked.end();
    }
    for (const origin of [b.apiUrl, b.serviceUrl])
      expect(
        (
          await fetch(origin + `/v1/data-subject/${id}/download?parts=1`, {
            headers,
          })
        ).status,
      ).toBe(403);
  } finally {
    await b.cleanup();
  }
});

for (const program of ["verification", "service"] as const)
  test(`${program} stream aborts on current retention expiry and cannot acknowledge a partial body`, async () => {
    const b = await bothRights(512);
    try {
      const a = await b.signIn("expiry-large@example.invalid");
      if (program === "verification") {
        const created = await fetch(b.apiUrl + "/v1/checks", {
          method: "POST",
          headers: {
            authorization: `Bearer ${a.token}`,
            "content-type": "application/json",
          },
          body: JSON.stringify({ text: physicsReference }),
        });
        const check = CheckResponse.parse(await created.json()).data;
        await expect
          .poll(
            async () =>
              CheckResponse.parse(
                await (
                  await fetch(b.apiUrl + `/v1/checks/${check.id}`, {
                    headers: { authorization: `Bearer ${a.token}` },
                  })
                ).json(),
              ).data.state,
            { timeout: 15000 },
          )
          .toBe("ended");
      } else {
        const sql = new pg.Client({ connectionString: b.urls[1] });
        await sql.connect();
        try {
          await sql.query(
            `INSERT INTO service.commerce_invoices(id,"orderId","ownerId",pdf,structured,"retainUntil") VALUES('expiring-large',$1,$2,$3,'{}',$4)`,
            [
              randomUUID(),
              a.data.ownerId,
              Buffer.from("exact".repeat(10000)),
              new Date(b.now() + 600000),
            ],
          );
        } finally {
          await sql.end();
        }
      }
      const id = await b.initiate(a.data.accountId),
        token = await b.verify(id, a.cookie);
      const origin = program === "verification" ? b.apiUrl : b.serviceUrl;
      const headers = { authorization: `Bearer ${token}` };
      const response = await fetch(
        origin + `/v1/data-subject/${id}/download?parts=1`,
        { headers },
      );
      expect(response.status).toBe(200);
      const reader = response.body!.getReader();
      const first = await reader.read();
      expect(first.done).toBe(false);
      await b.advance(program === "verification" ? 86350000 : 600001);
      let completed = false,
        sawManifest = Buffer.from(first.value!)
          .toString()
          .includes('"type":"manifest"');
      try {
        for (;;) {
          const row = await reader.read();
          if (row.done) {
            completed = true;
            break;
          }
          sawManifest ||= Buffer.from(row.value)
            .toString()
            .includes('"type":"manifest"');
        }
      } catch {
        /* The HTTP body is deliberately interrupted on expiry. */
      } finally {
        await reader.cancel().catch(() => {});
      }
      expect(completed).toBe(false);
      expect(sawManifest).toBe(false);
      expect(
        (
          await fetch(origin + `/v1/data-subject/${id}/received`, {
            method: "POST",
            headers: { ...headers, "content-type": "application/json" },
            body: JSON.stringify({ completionToken: "a".repeat(43) }),
          })
        ).status,
      ).toBe(403);
    } finally {
      await b.cleanup();
    }
  });
