// SPDX-License-Identifier: AGPL-3.0-or-later OR MIT
import { z } from "zod";
import { envelope } from "../../contract-common/src/index.js";
export const CheckPack = z.object({
    version: z.string().regex(/^\d+$/),
    quota: z.number().int().positive(),
    validityDays: z.number().int().positive(),
    grossCents: z.number().int().positive(),
    currency: z.literal("EUR"),
    vatBps: z.number().int().nonnegative(),
});
export const ProOffer = CheckPack.omit({ validityDays: true }).extend({
    period: z.literal("month"),
});
export const CommerceCatalogResponse = envelope(z.object({
    packs: z.array(CheckPack),
    pro: z.array(ProOffer).default([]),
    legal: z.object({
        version: z.string(),
        terms: z.string(),
        consent: z.string(),
        withdrawal: z.string(),
    }),
})).meta({ id: "CommerceCatalogResponse" });
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
export const SubscriptionRequest = CheckPackOrderRequest;
export const SubscriptionOperation = z.strictObject({ operationKey: z.uuid() });
export const SubscriptionConsent = SubscriptionOperation.extend({
    legalVersion: z.string(),
    immediateStart: z.literal(true),
});
export const Subscription = z.object({
    id: z.uuid(),
    status: z.enum([
        "awaiting-payment",
        "pending-activation",
        "active",
        "payment-failed",
        "cancelling",
        "cancelled",
    ]),
    offer: ProOffer,
    taxEvidence: z.record(z.string(), z.unknown()).nullable().optional(),
    orderedAt: z.iso.datetime(),
    activatesAt: z.iso.datetime().nullable(),
    paidUntil: z.iso.datetime().nullable(),
    cancelledAt: z.iso.datetime().nullable(),
    endsAt: z.iso.datetime().nullable(),
    checkoutUrl: z.url().nullable(),
    canConsent: z.boolean(),
    consentLegal: z.object({
        version: z.string(),
        terms: z.string(),
        consent: z.string(),
        withdrawal: z.string(),
    }),
    confirmation: z.string(),
    mailStatus: z.enum(["queued", "sent"]),
    invoices: z.array(z.object({
        id: z.string(),
        startsAt: z.iso.datetime(),
        endsAt: z.iso.datetime(),
    })),
});
export const SubscriptionResponse = envelope(Subscription).meta({
    id: "SubscriptionResponse",
});
export const SubscriptionsResponse = envelope(z.array(Subscription)).meta({
    id: "SubscriptionsResponse",
});
/** Public transport only: legal/provider implementation remains private. */
export const VatValidationRequest = z.strictObject({
    country: z.string().regex(/^[A-Z]{2}$/),
    vatId: z.string().trim().min(3).max(40),
});
export const VatValidationResponse = envelope(z.object({
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
})).meta({ id: "VatValidationResponse" });
export const CommerceInvoicesResponse = envelope(z.array(z.object({
    id: z.string(),
    orderId: z.uuid(),
    issuedAt: z.iso.datetime().nullable(),
    grossCents: z.number().int(),
    currency: z.literal("EUR"),
    formats: z.array(z.enum(["pdf", "ubl"])),
    structuredSha256: z.string().nullable(),
})))
    .extend({ nextCursor: z.string().nullable().optional() })
    .meta({ id: "CommerceInvoicesResponse" });
/** No session or paid permission. The response deliberately does not reveal a match,
 * contract end, mail recipient, provider, or delivery status. */
export const CancellationRequest = z.strictObject({
    operationKey: z.uuid(),
    contractReference: z.uuid(),
    email: z
        .email()
        .max(254)
        .transform((v) => v.trim().toLowerCase()),
    language: z.enum(["de", "en"]),
});
export const CancellationResponse = envelope(z.strictObject({
    operationKey: z.uuid(),
    receivedAt: z.iso.datetime(),
})).meta({ id: "CancellationResponse" });
