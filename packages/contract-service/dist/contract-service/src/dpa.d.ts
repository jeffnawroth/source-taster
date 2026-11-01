import { z } from "zod";
export declare const DpaLanguage: z.ZodEnum<{
    de: "de";
    en: "en";
}>;
export declare const DpaParty: z.ZodObject<{
    name: z.ZodString;
    address: z.ZodString;
    representative: z.ZodString;
}, z.core.$strict>;
export type DpaParty = z.infer<typeof DpaParty>;
export declare const DpaPacket: z.ZodObject<{
    version: z.ZodString;
    language: z.ZodEnum<{
        de: "de";
        en: "en";
    }>;
    documents: z.ZodArray<z.ZodObject<{
        kind: z.ZodEnum<{
            agreement: "agreement";
            annex: "annex";
            processing: "processing";
            subprocessors: "subprocessors";
            toms: "toms";
        }>;
        version: z.ZodString;
        title: z.ZodString;
        text: z.ZodString;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type DpaPacket = z.infer<typeof DpaPacket>;
export declare const DpaAgreement: z.ZodObject<{
    id: z.ZodUUID;
    operationId: z.ZodUUID;
    accountId: z.ZodUUID;
    concludedAt: z.ZodISODateTime;
    party: z.ZodObject<{
        name: z.ZodString;
        address: z.ZodString;
        representative: z.ZodString;
    }, z.core.$strict>;
    partyRevision: z.ZodNumber;
    packet: z.ZodObject<{
        version: z.ZodString;
        language: z.ZodEnum<{
            de: "de";
            en: "en";
        }>;
        documents: z.ZodArray<z.ZodObject<{
            kind: z.ZodEnum<{
                agreement: "agreement";
                annex: "annex";
                processing: "processing";
                subprocessors: "subprocessors";
                toms: "toms";
            }>;
            version: z.ZodString;
            title: z.ZodString;
            text: z.ZodString;
        }, z.core.$strict>>;
    }, z.core.$strict>;
    authorityAccepted: z.ZodLiteral<true>;
    businessUse: z.ZodLiteral<true>;
}, z.core.$strict>;
export type DpaAgreement = z.infer<typeof DpaAgreement>;
export declare const DpaNotice: z.ZodObject<{
    id: z.ZodUUID;
    agreementId: z.ZodUUID;
    version: z.ZodString;
    change: z.ZodString;
    intendedEffectiveAt: z.ZodISODateTime;
    objectionDeadline: z.ZodISODateTime;
    objectionRoute: z.ZodURL;
    delivery: z.ZodEnum<{
        queued: "queued";
        sent: "sent";
    }>;
    objection: z.ZodNullable<z.ZodString>;
    resolved: z.ZodBoolean;
}, z.core.$strict>;
export type DpaNotice = z.infer<typeof DpaNotice>;
export declare const DpaObjectionRequest: z.ZodObject<{
    noticeId: z.ZodUUID;
    reason: z.ZodString;
}, z.core.$strict>;
export declare const DpaStateResponse: z.ZodObject<{
    data: z.ZodObject<{
        packet: z.ZodNullable<z.ZodObject<{
            version: z.ZodString;
            language: z.ZodEnum<{
                de: "de";
                en: "en";
            }>;
            documents: z.ZodArray<z.ZodObject<{
                kind: z.ZodEnum<{
                    agreement: "agreement";
                    annex: "annex";
                    processing: "processing";
                    subprocessors: "subprocessors";
                    toms: "toms";
                }>;
                version: z.ZodString;
                title: z.ZodString;
                text: z.ZodString;
            }, z.core.$strict>>;
        }, z.core.$strict>>;
        party: z.ZodNullable<z.ZodObject<{
            name: z.ZodString;
            address: z.ZodString;
            representative: z.ZodString;
        }, z.core.$strict>>;
        partyRevision: z.ZodNumber;
        agreements: z.ZodArray<z.ZodObject<{
            id: z.ZodUUID;
            operationId: z.ZodUUID;
            accountId: z.ZodUUID;
            concludedAt: z.ZodISODateTime;
            party: z.ZodObject<{
                name: z.ZodString;
                address: z.ZodString;
                representative: z.ZodString;
            }, z.core.$strict>;
            partyRevision: z.ZodNumber;
            packet: z.ZodObject<{
                version: z.ZodString;
                language: z.ZodEnum<{
                    de: "de";
                    en: "en";
                }>;
                documents: z.ZodArray<z.ZodObject<{
                    kind: z.ZodEnum<{
                        agreement: "agreement";
                        annex: "annex";
                        processing: "processing";
                        subprocessors: "subprocessors";
                        toms: "toms";
                    }>;
                    version: z.ZodString;
                    title: z.ZodString;
                    text: z.ZodString;
                }, z.core.$strict>>;
            }, z.core.$strict>;
            authorityAccepted: z.ZodLiteral<true>;
            businessUse: z.ZodLiteral<true>;
        }, z.core.$strict>>;
        notices: z.ZodArray<z.ZodObject<{
            id: z.ZodUUID;
            agreementId: z.ZodUUID;
            version: z.ZodString;
            change: z.ZodString;
            intendedEffectiveAt: z.ZodISODateTime;
            objectionDeadline: z.ZodISODateTime;
            objectionRoute: z.ZodURL;
            delivery: z.ZodEnum<{
                queued: "queued";
                sent: "sent";
            }>;
            objection: z.ZodNullable<z.ZodString>;
            resolved: z.ZodBoolean;
        }, z.core.$strict>>;
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
                credit: "credit";
                free: "free";
                guest: "guest";
            }>;
            granted: z.ZodNumber;
            remaining: z.ZodNumber;
            expiresAt: z.ZodISODateTime;
        }, z.core.$strip>>;
        features: z.ZodArray<z.ZodString>;
        history: z.ZodOptional<z.ZodObject<{
            extendedUntil: z.ZodNullable<z.ZodISODateTime>;
            authorityVersion: z.ZodNumber;
        }, z.core.$strip>>;
    }, z.core.$strip>, z.ZodObject<{
        status: z.ZodLiteral<"not-implemented">;
    }, z.core.$strict>, z.ZodObject<{
        status: z.ZodLiteral<"unavailable">;
    }, z.core.$strict>, z.ZodNull]>;
}, z.core.$strip>;
/** Operation ID survives timeout/reconnect; the exact request is frozen at challenge time. */
export declare const DpaChallengeRequest: z.ZodObject<{
    operationId: z.ZodUUID;
    packetVersion: z.ZodString;
    language: z.ZodEnum<{
        de: "de";
        en: "en";
    }>;
    party: z.ZodObject<{
        name: z.ZodString;
        address: z.ZodString;
        representative: z.ZodString;
    }, z.core.$strict>;
    partyRevision: z.ZodNumber;
    authorityAccepted: z.ZodLiteral<true>;
    businessUse: z.ZodLiteral<true>;
}, z.core.$strict>;
export type DpaChallengeRequest = z.infer<typeof DpaChallengeRequest>;
export declare const DpaConcludeRequest: z.ZodObject<{
    operationId: z.ZodUUID;
    code: z.ZodString;
}, z.core.$strict>;
export type DpaConcludeRequest = z.infer<typeof DpaConcludeRequest>;
export declare const DpaOperationResponse: z.ZodObject<{
    data: z.ZodObject<{
        operationId: z.ZodUUID;
        status: z.ZodEnum<{
            concluded: "concluded";
            expired: "expired";
            pending: "pending";
        }>;
        expiresAt: z.ZodISODateTime;
        agreement: z.ZodNullable<z.ZodObject<{
            id: z.ZodUUID;
            operationId: z.ZodUUID;
            accountId: z.ZodUUID;
            concludedAt: z.ZodISODateTime;
            party: z.ZodObject<{
                name: z.ZodString;
                address: z.ZodString;
                representative: z.ZodString;
            }, z.core.$strict>;
            partyRevision: z.ZodNumber;
            packet: z.ZodObject<{
                version: z.ZodString;
                language: z.ZodEnum<{
                    de: "de";
                    en: "en";
                }>;
                documents: z.ZodArray<z.ZodObject<{
                    kind: z.ZodEnum<{
                        agreement: "agreement";
                        annex: "annex";
                        processing: "processing";
                        subprocessors: "subprocessors";
                        toms: "toms";
                    }>;
                    version: z.ZodString;
                    title: z.ZodString;
                    text: z.ZodString;
                }, z.core.$strict>>;
            }, z.core.$strict>;
            authorityAccepted: z.ZodLiteral<true>;
            businessUse: z.ZodLiteral<true>;
        }, z.core.$strict>>;
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
                credit: "credit";
                free: "free";
                guest: "guest";
            }>;
            granted: z.ZodNumber;
            remaining: z.ZodNumber;
            expiresAt: z.ZodISODateTime;
        }, z.core.$strip>>;
        features: z.ZodArray<z.ZodString>;
        history: z.ZodOptional<z.ZodObject<{
            extendedUntil: z.ZodNullable<z.ZodISODateTime>;
            authorityVersion: z.ZodNumber;
        }, z.core.$strip>>;
    }, z.core.$strip>, z.ZodObject<{
        status: z.ZodLiteral<"not-implemented">;
    }, z.core.$strict>, z.ZodObject<{
        status: z.ZodLiteral<"unavailable">;
    }, z.core.$strict>, z.ZodNull]>;
}, z.core.$strip>;
