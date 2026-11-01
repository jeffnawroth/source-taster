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
export const DpaPacket = z.strictObject({
  version: z.string().regex(/^[A-Za-z0-9._-]{1,80}$/),
  language: DpaLanguage,
  documents: z.array(z.strictObject({
    kind: z.enum(["agreement", "processing", "toms", "subprocessors", "annex"]),
    version: z.string().min(1).max(80),
    title: z.string().min(1).max(200),
    text: z.string().min(1).max(100000),
  })).min(4).max(20),
}).refine(p => ["agreement", "processing", "toms", "subprocessors"].every(kind => p.documents.some(d => d.kind === kind)));
export type DpaPacket = z.infer<typeof DpaPacket>;
export const DpaAgreement = z.strictObject({
  id: z.uuid(), operationId: z.uuid(), accountId: z.uuid(),
  concludedAt: z.iso.datetime(), party: DpaParty,
  partyRevision: z.number().int().positive(), packet: DpaPacket,
  authorityAccepted: z.literal(true), businessUse: z.literal(true),
});
export type DpaAgreement = z.infer<typeof DpaAgreement>;
export const DpaStateResponse = envelope(z.strictObject({
  packet: DpaPacket.nullable(), party: DpaParty.nullable(),
  partyRevision: z.number().int().nonnegative(), agreements: z.array(DpaAgreement),
})).meta({id: "DpaStateResponse"});
