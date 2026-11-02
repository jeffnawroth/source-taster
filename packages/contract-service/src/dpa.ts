// SPDX-License-Identifier: AGPL-3.0-or-later OR MIT
import { z } from "zod";
import { envelope } from "../../contract-common/src/index.ts";
export const DpaLanguage = z.enum(["de", "en"]);
export const DpaParty = z.strictObject({
  name: z.string().trim().min(1).max(200),
  address: z.string().trim().min(1).max(1000),
  representative: z.string().trim().min(1).max(200),
});
export type DpaParty = z.infer<typeof DpaParty>;
export const DpaPacket = z
  .strictObject({
    version: z.string().regex(/^[A-Za-z0-9._-]{1,80}$/),
    language: DpaLanguage,
    documents: z
      .array(
        z.strictObject({
          kind: z.enum([
            "agreement",
            "processing",
            "toms",
            "subprocessors",
            "annex",
          ]),
          version: z.string().min(1).max(80),
          title: z.string().min(1).max(200),
          text: z.string().min(1).max(100000),
        }),
      )
      .min(4)
      .max(20),
  })
  .refine((p) =>
    ["agreement", "processing", "toms", "subprocessors"].every((kind) =>
      p.documents.some((d) => d.kind === kind),
    ),
  );
export type DpaPacket = z.infer<typeof DpaPacket>;
export const DpaAgreement = z.strictObject({
  id: z.uuid(),
  operationId: z.uuid(),
  accountId: z.uuid(),
  concludedAt: z.iso.datetime(),
  party: DpaParty,
  partyRevision: z.number().int().positive(),
  packet: DpaPacket,
  authorityAccepted: z.literal(true),
  businessUse: z.literal(true),
});
export type DpaAgreement = z.infer<typeof DpaAgreement>;
export const DpaNotice = z.strictObject({
  id: z.uuid(),
  agreementId: z.uuid(),
  version: z.string().min(1).max(80),
  change: z.string().min(1).max(4000),
  intendedEffectiveAt: z.iso.datetime(),
  objectionDeadline: z.iso.datetime(),
  objectionRoute: z.url(),
  delivery: z.enum(["queued", "sent"]),
  objection: z.string().nullable(),
  resolved: z.boolean(),
});
export type DpaNotice = z.infer<typeof DpaNotice>;
export const DpaObjectionRequest = z.strictObject({
  noticeId: z.uuid(),
  reason: z.string().trim().min(1).max(2000),
});
export const DpaStateResponse = envelope(
  z.strictObject({
    packet: DpaPacket.nullable(),
    party: DpaParty.nullable(),
    partyRevision: z.number().int().nonnegative(),
    agreements: z.array(DpaAgreement),
    notices: z.array(DpaNotice),
  }),
).meta({ id: "DpaStateResponse" });
/** Operation ID survives timeout/reconnect; the exact request is frozen at challenge time. */
export const DpaChallengeRequest = z.strictObject({
  operationId: z.uuid(),
  packetVersion: z.string().min(1).max(80),
  language: DpaLanguage,
  party: DpaParty,
  partyRevision: z.number().int().nonnegative(),
  authorityAccepted: z.literal(true),
  businessUse: z.literal(true),
});
export type DpaChallengeRequest = z.infer<typeof DpaChallengeRequest>;
export const DpaConcludeRequest = z.strictObject({
  operationId: z.uuid(),
  code: z.string().regex(/^[0-9]{6}$/),
});
export type DpaConcludeRequest = z.infer<typeof DpaConcludeRequest>;
export const DpaOperationResponse = envelope(
  z.strictObject({
    operationId: z.uuid(),
    status: z.enum(["pending", "expired", "concluded"]),
    expiresAt: z.iso.datetime(),
    agreement: DpaAgreement.nullable(),
  }),
).meta({ id: "DpaOperationResponse" });
