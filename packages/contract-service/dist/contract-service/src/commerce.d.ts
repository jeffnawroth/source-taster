import { z } from "zod";
export declare const CheckPack: z.ZodObject<{
    version: z.ZodString;
    quota: z.ZodNumber;
    validityDays: z.ZodNumber;
    grossCents: z.ZodNumber;
    currency: z.ZodLiteral<"EUR">;
    vatBps: z.ZodNumber;
}, z.core.$strip>;
export declare const CommerceCatalogResponse: z.ZodObject<{
    data: z.ZodObject<{
        packs: z.ZodArray<z.ZodObject<{
            version: z.ZodString;
            quota: z.ZodNumber;
            validityDays: z.ZodNumber;
            grossCents: z.ZodNumber;
            currency: z.ZodLiteral<"EUR">;
            vatBps: z.ZodNumber;
        }, z.core.$strip>>;
        legal: z.ZodObject<{
            version: z.ZodString;
            terms: z.ZodString;
            consent: z.ZodString;
            withdrawal: z.ZodString;
        }, z.core.$strip>;
    }, z.core.$strip>;
    quota: z.ZodUnion<readonly [z.ZodObject<{
        consumed: z.ZodNumber;
        remaining: z.ZodNumber;
        granted: z.ZodNumber;
        reserved: z.ZodNumber;
        warning: z.ZodEnum<{
            eighty: "eighty";
            exhausted: "exhausted";
            none: "none";
        }>;
        grants: z.ZodArray<z.ZodObject<{
            kind: z.ZodEnum<{
                "check-pack": "check-pack";
                credit: "credit";
                free: "free";
                guest: "guest";
            }>;
            granted: z.ZodNumber;
            remaining: z.ZodNumber;
            expiresAt: z.ZodISODateTime;
        }, z.core.$strip>>;
        features: z.ZodArray<z.ZodString>;
    }, z.core.$strip>, z.ZodObject<{
        status: z.ZodLiteral<"not-implemented">;
    }, z.core.$strict>, z.ZodObject<{
        status: z.ZodLiteral<"unavailable">;
    }, z.core.$strict>, z.ZodNull]>;
}, z.core.$strip>;
export declare const CheckPackOrderRequest: z.ZodObject<{
    operationKey: z.ZodUUID;
    catalogVersion: z.ZodString;
    legalVersion: z.ZodString;
    acceptTerms: z.ZodLiteral<true>;
    immediateStart: z.ZodBoolean;
    language: z.ZodEnum<{
        de: "de";
        en: "en";
    }>;
    billing: z.ZodObject<{
        name: z.ZodString;
        address: z.ZodString;
        country: z.ZodString;
        vatId: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>;
}, z.core.$strict>;
export declare const CheckPackOrder: z.ZodObject<{
    id: z.ZodUUID;
    status: z.ZodEnum<{
        active: "active";
        "awaiting-payment": "awaiting-payment";
        expired: "expired";
        paid: "paid";
    }>;
    pack: z.ZodObject<{
        version: z.ZodString;
        quota: z.ZodNumber;
        validityDays: z.ZodNumber;
        grossCents: z.ZodNumber;
        currency: z.ZodLiteral<"EUR">;
        vatBps: z.ZodNumber;
    }, z.core.$strip>;
    immediateStart: z.ZodBoolean;
    orderedAt: z.ZodISODateTime;
    activatesAt: z.ZodNullable<z.ZodISODateTime>;
    expiresAt: z.ZodNullable<z.ZodISODateTime>;
    checkoutUrl: z.ZodNullable<z.ZodURL>;
    invoiceId: z.ZodNullable<z.ZodString>;
    confirmation: z.ZodString;
    mailStatus: z.ZodEnum<{
        queued: "queued";
        sent: "sent";
    }>;
}, z.core.$strip>;
export declare const CheckPackOrderResponse: z.ZodObject<{
    data: z.ZodObject<{
        id: z.ZodUUID;
        status: z.ZodEnum<{
            active: "active";
            "awaiting-payment": "awaiting-payment";
            expired: "expired";
            paid: "paid";
        }>;
        pack: z.ZodObject<{
            version: z.ZodString;
            quota: z.ZodNumber;
            validityDays: z.ZodNumber;
            grossCents: z.ZodNumber;
            currency: z.ZodLiteral<"EUR">;
            vatBps: z.ZodNumber;
        }, z.core.$strip>;
        immediateStart: z.ZodBoolean;
        orderedAt: z.ZodISODateTime;
        activatesAt: z.ZodNullable<z.ZodISODateTime>;
        expiresAt: z.ZodNullable<z.ZodISODateTime>;
        checkoutUrl: z.ZodNullable<z.ZodURL>;
        invoiceId: z.ZodNullable<z.ZodString>;
        confirmation: z.ZodString;
        mailStatus: z.ZodEnum<{
            queued: "queued";
            sent: "sent";
        }>;
    }, z.core.$strip>;
    quota: z.ZodUnion<readonly [z.ZodObject<{
        consumed: z.ZodNumber;
        remaining: z.ZodNumber;
        granted: z.ZodNumber;
        reserved: z.ZodNumber;
        warning: z.ZodEnum<{
            eighty: "eighty";
            exhausted: "exhausted";
            none: "none";
        }>;
        grants: z.ZodArray<z.ZodObject<{
            kind: z.ZodEnum<{
                "check-pack": "check-pack";
                credit: "credit";
                free: "free";
                guest: "guest";
            }>;
            granted: z.ZodNumber;
            remaining: z.ZodNumber;
            expiresAt: z.ZodISODateTime;
        }, z.core.$strip>>;
        features: z.ZodArray<z.ZodString>;
    }, z.core.$strip>, z.ZodObject<{
        status: z.ZodLiteral<"not-implemented">;
    }, z.core.$strict>, z.ZodObject<{
        status: z.ZodLiteral<"unavailable">;
    }, z.core.$strict>, z.ZodNull]>;
}, z.core.$strip>;
export declare const CheckPackOrdersResponse: z.ZodObject<{
    data: z.ZodArray<z.ZodObject<{
        id: z.ZodUUID;
        status: z.ZodEnum<{
            active: "active";
            "awaiting-payment": "awaiting-payment";
            expired: "expired";
            paid: "paid";
        }>;
        pack: z.ZodObject<{
            version: z.ZodString;
            quota: z.ZodNumber;
            validityDays: z.ZodNumber;
            grossCents: z.ZodNumber;
            currency: z.ZodLiteral<"EUR">;
            vatBps: z.ZodNumber;
        }, z.core.$strip>;
        immediateStart: z.ZodBoolean;
        orderedAt: z.ZodISODateTime;
        activatesAt: z.ZodNullable<z.ZodISODateTime>;
        expiresAt: z.ZodNullable<z.ZodISODateTime>;
        checkoutUrl: z.ZodNullable<z.ZodURL>;
        invoiceId: z.ZodNullable<z.ZodString>;
        confirmation: z.ZodString;
        mailStatus: z.ZodEnum<{
            queued: "queued";
            sent: "sent";
        }>;
    }, z.core.$strip>>;
    quota: z.ZodUnion<readonly [z.ZodObject<{
        consumed: z.ZodNumber;
        remaining: z.ZodNumber;
        granted: z.ZodNumber;
        reserved: z.ZodNumber;
        warning: z.ZodEnum<{
            eighty: "eighty";
            exhausted: "exhausted";
            none: "none";
        }>;
        grants: z.ZodArray<z.ZodObject<{
            kind: z.ZodEnum<{
                "check-pack": "check-pack";
                credit: "credit";
                free: "free";
                guest: "guest";
            }>;
            granted: z.ZodNumber;
            remaining: z.ZodNumber;
            expiresAt: z.ZodISODateTime;
        }, z.core.$strip>>;
        features: z.ZodArray<z.ZodString>;
    }, z.core.$strip>, z.ZodObject<{
        status: z.ZodLiteral<"not-implemented">;
    }, z.core.$strict>, z.ZodObject<{
        status: z.ZodLiteral<"unavailable">;
    }, z.core.$strict>, z.ZodNull]>;
}, z.core.$strip>;
