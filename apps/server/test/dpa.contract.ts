// SPDX-License-Identifier: AGPL-3.0-or-later
import { randomUUID } from "node:crypto";
import { expect, test } from "vitest";
import { DpaOperationResponse } from "@source-taster/contract-service";
import { bothPrograms } from "./support/both-programs.ts";
import { physicsReference } from "./support/doi-fixtures.ts";

test("a subprocessor notice drains stale processing authority across both programs while preserving legal retrieval", async () => {
  const b = await bothPrograms({ accounts: true, startWorker: false });
  try {
    const account = await b.signIn(),
      operationId = randomUUID();
    const packet = {
      version: "review-v1",
      language: "en",
      documents: ["agreement", "processing", "toms", "subprocessors"].map(
        (kind) => ({
          kind,
          version: "review-v1",
          title: kind,
          text: "PLACEHOLDER: human legal review required.",
        }),
      ),
    };
    await b.service().command({ dpa: { publish: packet } });
    expect(
      (
        await account.call("/v1/dpa/challenges", {
          operationId,
          packetVersion: packet.version,
          language: "en",
          party: {
            name: "Example",
            address: "Example Street 1",
            representative: "Alex",
          },
          partyRevision: 0,
          authorityAccepted: true,
          businessUse: true,
        })
      ).status,
    ).toBe(200);
    const code = (await b.mail()).at(-1)!.text.match(/\b[0-9]{6}\b/)![0];
    const agreement = DpaOperationResponse.parse(
      await (
        await account.call("/v1/dpa/conclude", { operationId, code })
      ).json(),
    ).data.agreement!;
    // Entry check, History sync, then the create's own decision: the one guard
    // that authorises the create and its response (#171).
    const held = b.trap("check:create", "request", 2);
    const create = fetch(b.apiUrl + "/v1/checks", {
      method: "POST",
      headers: {
        authorization: `Bearer ${account.token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ text: physicsReference }),
    });
    await held.arrived;
    await b.service().command({
      dpa: {
        notify: {
          id: randomUUID(),
          agreementId: agreement.id,
          version: "notice-review-v1",
          change: {
            en: "Intended example supplier change",
            de: "Geplanter Beispielanbieterwechsel",
          },
          intendedEffectiveAt: new Date(b.now() + 30 * 86400000).toISOString(),
          objectionDeadline: new Date(b.now() + 20 * 86400000).toISOString(),
          objectionRoute: "https://service.test.invalid/support",
        },
      },
    });
    held.release();
    expect((await create).status).toBe(403);
    const download = await fetch(
      b.serviceUrl + `/v1/dpa/agreements/${agreement.id}/download`,
      {
        headers: { origin: "https://web.test.invalid", cookie: account.cookie },
      },
    );
    expect(download.status).toBe(200);
    expect(JSON.parse(await download.text())).toEqual(agreement);
  } finally {
    await b.stop();
  }
});
