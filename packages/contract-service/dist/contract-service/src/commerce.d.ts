import { z } from "zod";
export declare const CheckPack: z.ZodObject<{
    version: z.ZodString;
    quota: z.ZodNumber;
    validityDays: z.ZodNumber;
    grossCents: z.ZodNumber;
    currency: z.ZodLiteral<"EUR">;
    vatBps: z.ZodNumber;
}, z.core.$strip>;
export declare const ProOffer: z.ZodObject<{
    version: z.ZodString;
    quota: z.ZodNumber;
    grossCents: z.ZodNumber;
    currency: z.ZodLiteral<"EUR">;
    vatBps: z.ZodNumber;
    period: z.ZodLiteral<"month">;
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
        pro: z.ZodDefault<z.ZodArray<z.ZodObject<{
            version: z.ZodString;
            quota: z.ZodNumber;
            grossCents: z.ZodNumber;
            currency: z.ZodLiteral<"EUR">;
            vatBps: z.ZodNumber;
            period: z.ZodLiteral<"month">;
        }, z.core.$strip>>>;
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
                pro: "pro";
            }>;
            granted: z.ZodNumber;
            remaining: z.ZodNumber;
            expiresAt: z.ZodISODateTime;
        }, z.core.$strip>>;
        features: z.ZodArray<z.ZodString>;
        history: z.ZodOptional<z.ZodObject<{
            extendedUntil: z.ZodNullable<z.ZodISODateTime>;
            authorityVersion: z.ZodNumber;
            settingsVersion: z.ZodOptional<z.ZodNumber>;
            freeHistoryChecks: z.ZodOptional<z.ZodNumber>;
            freeHistoryDays: z.ZodOptional<z.ZodNumber>;
            paidHistoryDays: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>>;
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
    vatValidationId: z.ZodOptional<z.ZodUUID>;
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
    taxEvidence: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
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
        taxEvidence: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
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
                pro: "pro";
            }>;
            granted: z.ZodNumber;
            remaining: z.ZodNumber;
            expiresAt: z.ZodISODateTime;
        }, z.core.$strip>>;
        features: z.ZodArray<z.ZodString>;
        history: z.ZodOptional<z.ZodObject<{
            extendedUntil: z.ZodNullable<z.ZodISODateTime>;
            authorityVersion: z.ZodNumber;
            settingsVersion: z.ZodOptional<z.ZodNumber>;
            freeHistoryChecks: z.ZodOptional<z.ZodNumber>;
            freeHistoryDays: z.ZodOptional<z.ZodNumber>;
            paidHistoryDays: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>>;
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
        taxEvidence: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
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
                pro: "pro";
            }>;
            granted: z.ZodNumber;
            remaining: z.ZodNumber;
            expiresAt: z.ZodISODateTime;
        }, z.core.$strip>>;
        features: z.ZodArray<z.ZodString>;
        history: z.ZodOptional<z.ZodObject<{
            extendedUntil: z.ZodNullable<z.ZodISODateTime>;
            authorityVersion: z.ZodNumber;
            settingsVersion: z.ZodOptional<z.ZodNumber>;
            freeHistoryChecks: z.ZodOptional<z.ZodNumber>;
            freeHistoryDays: z.ZodOptional<z.ZodNumber>;
            paidHistoryDays: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>>;
    }, z.core.$strip>, z.ZodObject<{
        status: z.ZodLiteral<"not-implemented">;
    }, z.core.$strict>, z.ZodObject<{
        status: z.ZodLiteral<"unavailable">;
    }, z.core.$strict>, z.ZodNull]>;
}, z.core.$strip>;
export declare const SubscriptionRequest: z.ZodObject<{
    operationKey: z.ZodUUID;
    catalogVersion: z.ZodString;
    legalVersion: z.ZodString;
    vatValidationId: z.ZodOptional<z.ZodUUID>;
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
export declare const SubscriptionOperation: z.ZodObject<{
    operationKey: z.ZodUUID;
}, z.core.$strict>;
export declare const SubscriptionConsent: z.ZodObject<{
    operationKey: z.ZodUUID;
    legalVersion: z.ZodString;
    immediateStart: z.ZodLiteral<true>;
}, z.core.$strict>;
export declare const Subscription: z.ZodObject<{
    id: z.ZodUUID;
    status: z.ZodEnum<{
        active: "active";
        "awaiting-payment": "awaiting-payment";
        cancelled: "cancelled";
        cancelling: "cancelling";
        "payment-failed": "payment-failed";
        "pending-activation": "pending-activation";
    }>;
    offer: z.ZodObject<{
        version: z.ZodString;
        quota: z.ZodNumber;
        grossCents: z.ZodNumber;
        currency: z.ZodLiteral<"EUR">;
        vatBps: z.ZodNumber;
        period: z.ZodLiteral<"month">;
    }, z.core.$strip>;
    taxEvidence: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
    orderedAt: z.ZodISODateTime;
    activatesAt: z.ZodNullable<z.ZodISODateTime>;
    paidUntil: z.ZodNullable<z.ZodISODateTime>;
    cancelledAt: z.ZodNullable<z.ZodISODateTime>;
    endsAt: z.ZodNullable<z.ZodISODateTime>;
    checkoutUrl: z.ZodNullable<z.ZodURL>;
    canConsent: z.ZodBoolean;
    consentLegal: z.ZodObject<{
        version: z.ZodString;
        terms: z.ZodString;
        consent: z.ZodString;
        withdrawal: z.ZodString;
    }, z.core.$strip>;
    confirmation: z.ZodString;
    mailStatus: z.ZodEnum<{
        queued: "queued";
        sent: "sent";
    }>;
    invoices: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        startsAt: z.ZodISODateTime;
        endsAt: z.ZodISODateTime;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const SubscriptionResponse: z.ZodObject<{
    data: z.ZodObject<{
        id: z.ZodUUID;
        status: z.ZodEnum<{
            active: "active";
            "awaiting-payment": "awaiting-payment";
            cancelled: "cancelled";
            cancelling: "cancelling";
            "payment-failed": "payment-failed";
            "pending-activation": "pending-activation";
        }>;
        offer: z.ZodObject<{
            version: z.ZodString;
            quota: z.ZodNumber;
            grossCents: z.ZodNumber;
            currency: z.ZodLiteral<"EUR">;
            vatBps: z.ZodNumber;
            period: z.ZodLiteral<"month">;
        }, z.core.$strip>;
        taxEvidence: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
        orderedAt: z.ZodISODateTime;
        activatesAt: z.ZodNullable<z.ZodISODateTime>;
        paidUntil: z.ZodNullable<z.ZodISODateTime>;
        cancelledAt: z.ZodNullable<z.ZodISODateTime>;
        endsAt: z.ZodNullable<z.ZodISODateTime>;
        checkoutUrl: z.ZodNullable<z.ZodURL>;
        canConsent: z.ZodBoolean;
        consentLegal: z.ZodObject<{
            version: z.ZodString;
            terms: z.ZodString;
            consent: z.ZodString;
            withdrawal: z.ZodString;
        }, z.core.$strip>;
        confirmation: z.ZodString;
        mailStatus: z.ZodEnum<{
            queued: "queued";
            sent: "sent";
        }>;
        invoices: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            startsAt: z.ZodISODateTime;
            endsAt: z.ZodISODateTime;
        }, z.core.$strip>>;
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
                pro: "pro";
            }>;
            granted: z.ZodNumber;
            remaining: z.ZodNumber;
            expiresAt: z.ZodISODateTime;
        }, z.core.$strip>>;
        features: z.ZodArray<z.ZodString>;
        history: z.ZodOptional<z.ZodObject<{
            extendedUntil: z.ZodNullable<z.ZodISODateTime>;
            authorityVersion: z.ZodNumber;
            settingsVersion: z.ZodOptional<z.ZodNumber>;
            freeHistoryChecks: z.ZodOptional<z.ZodNumber>;
            freeHistoryDays: z.ZodOptional<z.ZodNumber>;
            paidHistoryDays: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>>;
    }, z.core.$strip>, z.ZodObject<{
        status: z.ZodLiteral<"not-implemented">;
    }, z.core.$strict>, z.ZodObject<{
        status: z.ZodLiteral<"unavailable">;
    }, z.core.$strict>, z.ZodNull]>;
}, z.core.$strip>;
export declare const SubscriptionsResponse: z.ZodObject<{
    data: z.ZodArray<z.ZodObject<{
        id: z.ZodUUID;
        status: z.ZodEnum<{
            active: "active";
            "awaiting-payment": "awaiting-payment";
            cancelled: "cancelled";
            cancelling: "cancelling";
            "payment-failed": "payment-failed";
            "pending-activation": "pending-activation";
        }>;
        offer: z.ZodObject<{
            version: z.ZodString;
            quota: z.ZodNumber;
            grossCents: z.ZodNumber;
            currency: z.ZodLiteral<"EUR">;
            vatBps: z.ZodNumber;
            period: z.ZodLiteral<"month">;
        }, z.core.$strip>;
        taxEvidence: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
        orderedAt: z.ZodISODateTime;
        activatesAt: z.ZodNullable<z.ZodISODateTime>;
        paidUntil: z.ZodNullable<z.ZodISODateTime>;
        cancelledAt: z.ZodNullable<z.ZodISODateTime>;
        endsAt: z.ZodNullable<z.ZodISODateTime>;
        checkoutUrl: z.ZodNullable<z.ZodURL>;
        canConsent: z.ZodBoolean;
        consentLegal: z.ZodObject<{
            version: z.ZodString;
            terms: z.ZodString;
            consent: z.ZodString;
            withdrawal: z.ZodString;
        }, z.core.$strip>;
        confirmation: z.ZodString;
        mailStatus: z.ZodEnum<{
            queued: "queued";
            sent: "sent";
        }>;
        invoices: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            startsAt: z.ZodISODateTime;
            endsAt: z.ZodISODateTime;
        }, z.core.$strip>>;
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
                pro: "pro";
            }>;
            granted: z.ZodNumber;
            remaining: z.ZodNumber;
            expiresAt: z.ZodISODateTime;
        }, z.core.$strip>>;
        features: z.ZodArray<z.ZodString>;
        history: z.ZodOptional<z.ZodObject<{
            extendedUntil: z.ZodNullable<z.ZodISODateTime>;
            authorityVersion: z.ZodNumber;
            settingsVersion: z.ZodOptional<z.ZodNumber>;
            freeHistoryChecks: z.ZodOptional<z.ZodNumber>;
            freeHistoryDays: z.ZodOptional<z.ZodNumber>;
            paidHistoryDays: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>>;
    }, z.core.$strip>, z.ZodObject<{
        status: z.ZodLiteral<"not-implemented">;
    }, z.core.$strict>, z.ZodObject<{
        status: z.ZodLiteral<"unavailable">;
    }, z.core.$strict>, z.ZodNull]>;
}, z.core.$strip>;
/** Public transport only: legal/provider implementation remains private. */
export declare const VatValidationRequest: z.ZodObject<{
    country: z.ZodString;
    vatId: z.ZodString;
}, z.core.$strict>;
export declare const VatValidationResponse: z.ZodObject<{
    data: z.ZodObject<{
        id: z.ZodUUID;
        country: z.ZodString;
        vatId: z.ZodString;
        status: z.ZodEnum<{
            "country-mismatch": "country-mismatch";
            invalid: "invalid";
            superseded: "superseded";
            unavailable: "unavailable";
            valid: "valid";
        }>;
        checkedAt: z.ZodISODateTime;
        expiresAt: z.ZodISODateTime;
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
                pro: "pro";
            }>;
            granted: z.ZodNumber;
            remaining: z.ZodNumber;
            expiresAt: z.ZodISODateTime;
        }, z.core.$strip>>;
        features: z.ZodArray<z.ZodString>;
        history: z.ZodOptional<z.ZodObject<{
            extendedUntil: z.ZodNullable<z.ZodISODateTime>;
            authorityVersion: z.ZodNumber;
            settingsVersion: z.ZodOptional<z.ZodNumber>;
            freeHistoryChecks: z.ZodOptional<z.ZodNumber>;
            freeHistoryDays: z.ZodOptional<z.ZodNumber>;
            paidHistoryDays: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>>;
    }, z.core.$strip>, z.ZodObject<{
        status: z.ZodLiteral<"not-implemented">;
    }, z.core.$strict>, z.ZodObject<{
        status: z.ZodLiteral<"unavailable">;
    }, z.core.$strict>, z.ZodNull]>;
}, z.core.$strip>;
export declare const CommerceInvoicesResponse: z.ZodObject<{
    data: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        orderId: z.ZodUUID;
        issuedAt: z.ZodNullable<z.ZodISODateTime>;
        grossCents: z.ZodNumber;
        currency: z.ZodLiteral<"EUR">;
        formats: z.ZodArray<z.ZodEnum<{
            pdf: "pdf";
            ubl: "ubl";
        }>>;
        structuredSha256: z.ZodNullable<z.ZodString>;
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
                pro: "pro";
            }>;
            granted: z.ZodNumber;
            remaining: z.ZodNumber;
            expiresAt: z.ZodISODateTime;
        }, z.core.$strip>>;
        features: z.ZodArray<z.ZodString>;
        history: z.ZodOptional<z.ZodObject<{
            extendedUntil: z.ZodNullable<z.ZodISODateTime>;
            authorityVersion: z.ZodNumber;
            settingsVersion: z.ZodOptional<z.ZodNumber>;
            freeHistoryChecks: z.ZodOptional<z.ZodNumber>;
            freeHistoryDays: z.ZodOptional<z.ZodNumber>;
            paidHistoryDays: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>>;
    }, z.core.$strip>, z.ZodObject<{
        status: z.ZodLiteral<"not-implemented">;
    }, z.core.$strict>, z.ZodObject<{
        status: z.ZodLiteral<"unavailable">;
    }, z.core.$strict>, z.ZodNull]>;
    nextCursor: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
/** No session or paid permission. The response deliberately does not reveal a match,
 * contract end, mail recipient, provider, or delivery status. */
export declare const CancellationRequest: z.ZodObject<{
    operationKey: z.ZodUUID;
    contractReference: z.ZodUUID;
    email: z.ZodPipe<z.ZodEmail, z.ZodTransform<string, string>>;
    language: z.ZodEnum<{
        de: "de";
        en: "en";
    }>;
}, z.core.$strict>;
export declare const CancellationResponse: z.ZodObject<{
    data: z.ZodObject<{
        operationKey: z.ZodUUID;
        receivedAt: z.ZodISODateTime;
    }, z.core.$strict>;
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
                pro: "pro";
            }>;
            granted: z.ZodNumber;
            remaining: z.ZodNumber;
            expiresAt: z.ZodISODateTime;
        }, z.core.$strip>>;
        features: z.ZodArray<z.ZodString>;
        history: z.ZodOptional<z.ZodObject<{
            extendedUntil: z.ZodNullable<z.ZodISODateTime>;
            authorityVersion: z.ZodNumber;
            settingsVersion: z.ZodOptional<z.ZodNumber>;
            freeHistoryChecks: z.ZodOptional<z.ZodNumber>;
            freeHistoryDays: z.ZodOptional<z.ZodNumber>;
            paidHistoryDays: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>>;
    }, z.core.$strip>, z.ZodObject<{
        status: z.ZodLiteral<"not-implemented">;
    }, z.core.$strict>, z.ZodObject<{
        status: z.ZodLiteral<"unavailable">;
    }, z.core.$strict>, z.ZodNull]>;
}, z.core.$strip>;
