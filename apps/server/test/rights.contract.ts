// SPDX-License-Identifier: AGPL-3.0-or-later
import { createHash, randomUUID } from "node:crypto";
import { writeFile } from "node:fs/promises";
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
  }
});
