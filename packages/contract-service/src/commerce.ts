// SPDX-License-Identifier: AGPL-3.0-or-later OR MIT
import { z } from "zod";
import { envelope } from "../../contract-common/src/index.ts";
export const CheckPack = z.object({
  version: z.string().regex(/^\d+$/),
  quota: z.number().int().positive(),
  validityDays: z.number().int().positive(),
  grossCents: z.number().int().positive(),
  currency: z.literal("EUR"),
  vatBps: z.number().int().nonnegative(),
});
export const CommerceCatalogResponse = envelope(
  z.object({
    packs: z.array(CheckPack),
    legal: z.object({
      version: z.string(),
      terms: z.string(),
      consent: z.string(),
      withdrawal: z.string(),
    }),
  }),
).meta({ id: "CommerceCatalogResponse" });
export const CheckPackOrderRequest = z.strictObject({
  operationKey: z.uuid(),
  catalogVersion: z.string().regex(/^\d+$/),
  legalVersion: z.string().min(1).max(128),
  vatValidationId: z.uuid().optional(),
  acceptTerms: z.literal(true),
  immediateStart: z.boolean(),
  language: z.enum(["de", "en"]),
  billing: z.strictObject({
    name: z.string().trim().min(1).max(200),
    address: z.string().trim().min(1).max(1000),
    country: z.string().regex(/^[A-Z]{2}$/),
    vatId: z.string().trim().max(40).optional(),
  }),
});
export const CheckPackOrder = z.object({
  id: z.uuid(),
  status: z.enum(["awaiting-payment", "paid", "active", "expired"]),
  pack: CheckPack,
  immediateStart: z.boolean(),
  orderedAt: z.iso.datetime(),
  activatesAt: z.iso.datetime().nullable(),
  expiresAt: z.iso.datetime().nullable(),
  checkoutUrl: z.url().nullable(),
  invoiceId: z.string().nullable(),
  taxEvidence: z.record(z.string(), z.unknown()).nullable().optional(),
  confirmation: z.string(),
  mailStatus: z.enum(["queued", "sent"]),
});
export const CheckPackOrderResponse = envelope(CheckPackOrder).meta({
  id: "CheckPackOrderResponse",
});
export const CheckPackOrdersResponse = envelope(z.array(CheckPackOrder)).meta({
  id: "CheckPackOrdersResponse",
});

/** Public transport only: legal/provider implementation remains private. */
export const VatValidationRequest = z.strictObject({
  country: z.string().regex(/^[A-Z]{2}$/),
  vatId: z.string().trim().min(3).max(40),
});
export const VatValidationResponse = envelope(
  z.object({
    id: z.uuid(),
    country: z.string(),
    vatId: z.string(),
    status: z.enum([
      "valid",
      "invalid",
      "unavailable",
      "country-mismatch",
      "superseded",
    ]),
    checkedAt: z.iso.datetime(),
    expiresAt: z.iso.datetime(),
  }),
).meta({ id: "VatValidationResponse" });
export const CommerceInvoicesResponse = envelope(
  z.array(
    z.object({
      id: z.string(),
      orderId: z.uuid(),
      issuedAt: z.iso.datetime(),
      grossCents: z.number().int(),
      currency: z.literal("EUR"),
      formats: z.array(z.enum(["pdf", "ubl"])),
      structuredSha256: z.string().nullable(),
    }),
  ),
).meta({ id: "CommerceInvoicesResponse" });
