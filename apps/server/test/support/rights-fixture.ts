// SPDX-License-Identifier: AGPL-3.0-or-later
import { createHash, randomUUID } from "node:crypto";
import { writeFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { expect } from "vitest";
import { bothPrograms } from "./both-programs.ts";
export async function bothRights(partBytes?: number) {
  const setup = join(
      process.env.SOURCE_TASTER_113_EVIDENCE!,
      `rights-fixture-${randomUUID()}.json`,
    ),
    reviews = setup + ".reviews";
  await writeFile(reviews, "[]");
  const both = await bothPrograms({
    accounts: true,
    verificationEnv: partBytes
      ? { SOURCE_TASTER_EXPORT_PART_BYTES: String(partBytes) }
      : {},
    serviceEnv: {
      ...(partBytes ? { SERVICE_EXPORT_PART_BYTES: String(partBytes) } : {}),
      SERVICE_OPERATOR_SETUP: setup,
      SERVICE_RIGHTS_REVIEWS: reviews,
      SERVICE_OPERATOR_SESSION_EPOCH:
        "113-owned-operator-epoch-at-least-32-characters",
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
  const root = await both.signIn("rights-operator@example.invalid");
  await writeFile(
    setup,
    JSON.stringify({
      accountId: root.data.accountId,
      codeHash: createHash("sha256").update("setup113").digest("hex"),
      completionFile: setup + ".done",
    }),
  );
  expect(
    (
      await call(
        "/v1/operator/bootstrap",
        { setupCode: "setup113" },
        root.cookie,
      )
    ).status,
  ).toBe(200);
  await both.advance(61000);
  const rootLogin = await both.signIn("rights-operator@example.invalid");
  const session = await call("/v1/operator/session", {}, rootLogin.cookie);
  const operator = session.headers.get("set-cookie")!.split(";")[0]!;
  async function initiate(accountId: string) {
    await both.advance(61000);
    const command = {
      operationId: randomUUID(),
      accountId,
      action: "data-subject-request",
      reason: "support-case",
    };
    const fresh = await both.signIn("rights-operator@example.invalid");
    expect(
      (
        await call(
          "/v1/operator/fresh-proof",
          command,
          `${operator}; ${fresh.cookie}`,
        )
      ).status,
    ).toBe(200);
    expect(
      (await call("/v1/operator/data-subject", command, operator)).status,
    ).toBe(200);
    return command.operationId;
  }
  async function verify(id: string, cookie?: string) {
    const path = `/v1/data-subject/${id}`;
    const response = await call(path + "/challenge", {}, cookie);
    expect(response.status).toBe(200);
    const binding = response.headers.get("set-cookie")!.split(";")[0]!;
    const code = (await both.mail())
      .filter((m) => /\b\d{6}\b/.test(m.text))
      .at(-1)!
      .text.match(/\b\d{6}\b/)![0];
    const confirmed = await call(
      path + "/confirm",
      { code },
      `${cookie ?? ""}; ${binding}`,
    );
    expect(confirmed.status).toBe(200);
    return ((await confirmed.json()) as { data: { accessToken: string } }).data
      .accessToken;
  }
  const download = (id: string, token: string, origin = both.apiUrl) =>
    fetch(`${origin}/v1/data-subject/${id}/download`, {
      headers: { authorization: `Bearer ${token}` },
    });
  return {
    ...both,
    call,
    operator,
    initiate,
    verify,
    download,
    reviews,
    cleanup: async () => {
      await both.stop();
      await Promise.all(
        [setup, setup + ".done", reviews].map((p) => rm(p, { force: true })),
      );
    },
  };
}

/** Authorized fixture setup; assertions still observe the real HTTP/download seams. */
export async function seedRightsInvoices(
  databaseUrl: string,
  ownerId: string,
  prefix: string,
  count = 3,
) {
  const { default: pg } = await import("pg");
  const db = new pg.Client({ connectionString: databaseUrl });
  await db.connect();
  try {
    for (let i = 0; i < count; i++)
      await db.query(
        `INSERT INTO service.commerce_invoices(id,"orderId","ownerId",pdf,ubl,structured,accounting,"issuedAt","grossCents","retainUntil") VALUES($1,$2,$3,$4,$5,'{}',$6,'2026-11-01',1190,'2035-01-01')`,
        [
          prefix + i,
          randomUUID(),
          ownerId,
          Buffer.from("%PDF-retained-" + i + " exact bytes ".repeat(50)),
          Buffer.from("<Invoice>exact</Invoice>"),
          {
            version: 1,
            country: "DE",
            currency: "EUR",
            vatBps: 1900,
            netCents: 1000,
            taxCents: 190,
            grossCents: 1190,
            invoiceNumber: prefix + i,
            issuedAt: "2026-11-01T00:00:00.000Z",
            paidAt: "2026-11-01T00:00:00.000Z",
            providerInvoiceId: prefix + i,
            taxRateIds: ["retained"],
            catalog: { version: "retained" },
            taxEvidence: { policy: "retained" },
          },
        ],
      );
  } finally {
    await db.end();
  }
}
