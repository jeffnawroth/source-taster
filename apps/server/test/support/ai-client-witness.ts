// SPDX-License-Identifier: AGPL-3.0-or-later
// Synthetic HTTP contract witness for client-only DE/EN parity, never an AI recording.
import { randomUUID } from "node:crypto";
import { AiStructuringResult } from "@source-taster/contract-verification/ai";
import { CheckResponse } from "@source-taster/contract-verification/v2";
export function aiClientWitness() {
  const reference = {
    originalText: "Doe (2020). Exact maps.",
    span: { start: 0, end: 23 },
    csl: { title: "Exact maps" },
    fieldSources: {
      title: {
        raw: "Exact maps",
        span: { start: 12, end: 22 },
        provenance: "ai",
      },
    },
    structuring: { path: "ai", version: "synthetic" },
    ai: {
      configuration: "synthetic",
      notice: "ai-can-be-wrong",
      changedFields: ["title"],
      proposals: [
        { field: "DOI", value: "10.5555/PROPOSED", reason: "ungrounded" },
      ],
    },
  };
  const structuring = AiStructuringResult.parse({
    references: [reference],
    rejected: [],
    guidance: null,
    quotaConsumed: 0,
    referenceLimit: 1000,
    ai: { reason: null, upgrade: false, fallbacks: [] },
    receipt: { expiresAt: Date.now() + 300000, signature: "a".repeat(64) },
  });
  const id = randomUUID();
  let check = CheckResponse.parse({
    quota: null,
    data: {
      id,
      state: "ended",
      lastEventSeq: 2,
      lastEventCursor: `${id}:2`,
      leaseRenewAfterMs: 1000,
      endReason: "cancelled",
      document: null,
      references: [
        {
          slot: 1,
          originalText: reference.originalText,
          outcome: { kind: "status", status: "cancelled" },
          progress: "ended",
          revision: 1,
          fields: reference.csl,
          revisions: [
            {
              revision: 1,
              reference,
              provenance: "ai",
              createdAt: new Date().toISOString(),
            },
          ],
          results: [],
          manualOverride: null,
          manualOverrideReset: false,
          quotaEffect: "new-work",
        },
      ],
    },
  });
  const requests: { path: string; body: unknown }[] = [];
  return {
    requests,
    structuring,
    respond(path: string, method: string, body?: unknown): unknown {
      if (method === "POST") requests.push({ path, body });
      if (path.endsWith("/structurings"))
        return {
          quota: null,
          data: { document: null, referenceLimitExceeded: false, structuring },
        };
      if (path.endsWith("/quota")) return { quota: null, data: null };
      if (path.endsWith("/document-settings"))
        return { quota: null, data: { inputBytes: 20971520 } };
      if (path.endsWith("/revisions")) {
        const request = body as { fields: { title: string; DOI: string } };
        const next = structuredClone(check);
        const slot = next.data.references[0]!;
        slot.revision = 2;
        slot.fields = request.fields;
        slot.revisions.push({
          revision: 2,
          provenance: "user",
          createdAt: new Date().toISOString(),
          reference: {
            ...slot.revisions[0]!.reference,
            ai: undefined,
            csl: request.fields,
            structuring: { path: "user", version: "user-fields-1" },
          },
        });
        check = next;
      }
      return check;
    },
  };
}
