// SPDX-License-Identifier: AGPL-3.0-or-later
import { expect, test } from "vitest";
import {
  AccountDeletionResponse,
  FreshProofChallengeResponse,
  EmailChangeChallengeResponse,
  AccountSessionResponse,
} from "@source-taster/contract-service";
import { CheckResponse } from "@source-taster/contract-verification";
import { CheckResponse as CheckResponseV2 } from "@source-taster/contract-verification/v2";
import { readSseFrames } from "@source-taster/contract-verification/client";
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
    const stream = await fetch(b.apiUrl + `/v1/checks/${check.id}/events`, {
      headers: { authorization: `Bearer ${a.token}` },
      signal: AbortSignal.timeout(20000),
    });
    expect(stream.status).toBe(200);
    const frames = readSseFrames(stream.body!)[Symbol.asyncIterator]();
    await frames.next();
    const held = b.holdWork();
    const worker = b.worker();
    await worker.ready;
    await held.arrived;
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
    held.release();
    const closed = await Promise.race([
      (async () => {
        try {
          while (!(await frames.next()).done) {
            /* drain only */
          }
        } catch {
          /* revoked stream */
        }
        return true;
      })(),
      new Promise<boolean>((resolve) =>
        setTimeout(() => resolve(false), 10000),
      ),
    ]);
    expect(closed).toBe(true);
    for (const path of [`/v1/checks/${check.id}/events`, "/v2/history"]) {
      expect(
        (
          await fetch(b.apiUrl + path, {
            headers: { authorization: `Bearer ${a.token}` },
          })
        ).status,
      ).toBe(403);
    }
    expect(
      (
        await fetch(b.apiUrl + `/v2/checks/${check.id}/export`, {
          method: "POST",
          headers: {
            authorization: `Bearer ${a.token}`,
            "content-type": "application/json",
          },
          body: JSON.stringify({ format: "csl-json", mode: "original" }),
        })
      ).status,
    ).toBe(403);
    await worker.stop();
    expect(b.fixtures.requests).toHaveLength(0);
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

test("deleting consented History never transfers content, Preferences or grants to a later registration at the same email", async () => {
  const b = await bothPrograms({ accounts: true });
  try {
    const a = await b.signIn("history-delete@example.invalid");
    const headers = {
      authorization: `Bearer ${a.token}`,
      "content-type": "application/json",
    };
    const history = await fetch(b.apiUrl + "/v2/history", {
      method: "PUT",
      headers,
      body: JSON.stringify({ enabled: true }),
    });
    expect(history.status).toBe(200);
    const created = await fetch(b.apiUrl + "/v2/checks", {
      method: "POST",
      headers,
      body: JSON.stringify({ text: physicsReference }),
    });
    expect(created.status).toBe(201);
    const check = CheckResponseV2.parse(await created.json()).data;
    const stream = await fetch(b.apiUrl + `/v2/checks/${check.id}/events`, {
      headers,
      signal: AbortSignal.timeout(20000),
    });
    for await (const _ of readSseFrames(stream.body!)) {
      /* real completed work */
    }
    const saved = await fetch(b.apiUrl + "/v2/history", { headers });
    expect(saved.status).toBe(200);
    expect(await saved.json()).toMatchObject({
      data: {
        enabled: true,
        entries: [expect.objectContaining({ id: check.id })],
      },
    });
    expect(
      (
        await fetch(b.serviceUrl + "/v1/preferences", {
          method: "PATCH",
          headers: {
            origin: "https://web.test.invalid",
            cookie: a.cookie,
            "content-type": "application/json",
          },
          body: JSON.stringify({ language: "de", citationStyle: "ieee" }),
        })
      ).status,
    ).toBe(200);
    const proof = FreshProofChallengeResponse.parse(
      await (
        await a.call("/v1/account/fresh-proof/challenges", {
          action: "account-deletion",
          language: "en",
        })
      ).json(),
    ).data;
    const code = (await b.mail()).at(-1)!.text.match(/\b[0-9]{6}\b/)![0];
    expect(
      (
        await a.call("/v1/account/fresh-proof/confirm", {
          challengeId: proof.challengeId,
          code,
        })
      ).status,
    ).toBe(200);
    const deleted = await a.call("/v1/account/deletion", {
      billingRetentionAcknowledged: true,
      billingRetentionYears: 8,
    });
    expect(
      AccountDeletionResponse.parse(await deleted.json()).data.status,
    ).toBe("deleted");
    expect((await fetch(b.apiUrl + "/v2/history", { headers })).status).toBe(
      403,
    );
    const replacement = await b.signIn("history-delete@example.invalid");
    expect(replacement.data.accountId).not.toBe(a.data.accountId);
    expect(replacement.data.ownerId).not.toBe(a.data.ownerId);
    const newHeaders = { authorization: `Bearer ${replacement.token}` };
    expect(
      (
        await fetch(b.apiUrl + `/v2/checks/${check.id}`, {
          headers: newHeaders,
        })
      ).status,
    ).toBe(404);
    expect(
      await (
        await fetch(b.apiUrl + "/v2/history", { headers: newHeaders })
      ).json(),
    ).toMatchObject({ data: { enabled: false, entries: [] } });
    expect(
      await (
        await fetch(b.serviceUrl + "/v1/preferences", {
          headers: {
            origin: "https://web.test.invalid",
            cookie: replacement.cookie,
          },
        })
      ).json(),
    ).toMatchObject({ data: { language: "en", citationStyle: "apa" } });
    expect(
      await (
        await fetch(b.apiUrl + "/v2/quota", { headers: newHeaders })
      ).json(),
    ).toMatchObject({ data: { remaining: 100 } });
  } finally {
    await b.stop();
  }
});
