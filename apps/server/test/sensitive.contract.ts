// SPDX-License-Identifier: AGPL-3.0-or-later
import { expect, test } from "vitest";
import {
  AccountDeletionResponse,
  FreshProofChallengeResponse,
  EmailChangeChallengeResponse,
  AccountSessionResponse,
} from "@source-taster/contract-service";
import { CheckResponse } from "@source-taster/contract-verification";
import { bothPrograms } from "./support/both-programs.ts";
import { physicsReference } from "./support/doi-fixtures.ts";

test("real private proof changes email, then tombstones and purges stored Checks and Quota without reviving sessions on restart", async () => {
  const b = await bothPrograms({ accounts: true, startWorker: false });
  try {
    const a = await b.signIn("sensitive-both@example.invalid");
    const call = a.call;
    const proof = async (action: string) => {
      const r = await call("/v1/account/fresh-proof/challenges", {
        action,
        language: "en",
      });
      expect(r.status).toBe(200);
      const p = FreshProofChallengeResponse.parse(await r.json()).data;
      const code = (await b.mail()).at(-1)!.text.match(/\b[0-9]{6}\b/)![0];
      expect(
        (
          await call("/v1/account/fresh-proof/confirm", {
            challengeId: p.challengeId,
            code,
          })
        ).status,
      ).toBe(200);
    };
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
    await proof("email-change");
    const replacement = await call("/v1/account/email-change/challenges", {
      newEmail: "replacement-both@example.invalid",
      language: "de",
    });
    const p = EmailChangeChallengeResponse.parse(await replacement.json()).data;
    const code = (await b.mail()).at(-1)!.text.match(/\b[0-9]{6}\b/)![0];
    const changed = await call("/v1/account/email-change/confirm", {
      challengeId: p.challengeId,
      code,
    });
    expect(changed.status).toBe(200);
    expect(
      AccountSessionResponse.parse(await changed.json()).data,
    ).toMatchObject({ ...a.data, email: "replacement-both@example.invalid" });
    await proof("account-deletion");
    const deleted = await call("/v1/account/deletion", {
      billingRetentionAcknowledged: true,
      billingRetentionYears: 8,
    });
    expect(deleted.status).toBe(200);
    expect(
      AccountDeletionResponse.parse(await deleted.json()).data.status,
    ).toBe("deleted");
    expect((await call("/v1/account-tokens", {})).status).toBe(401);
    expect(
      (
        await fetch(b.apiUrl + `/v1/checks/${check.id}`, {
          headers: { authorization: `Bearer ${a.token}` },
        })
      ).status,
    ).toBe(403);
    await b.restartService();
    expect((await call("/v1/account-tokens", {})).status).toBe(401);
  } finally {
    await b.stop();
  }
});
