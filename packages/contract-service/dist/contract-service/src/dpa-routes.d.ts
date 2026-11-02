import { z } from "zod";
export declare const dpaRoutes: (extension: boolean) => {
    objection: ({
        security: {
            ExtensionSession: never[];
        }[];
        method: "post";
        path: "/v1/dpa/objections" | "/v1/extension/dpa/objections";
        summary: string;
        request: {
            body: {
                required: true;
                content: {
                    "application/json": {
                        schema: z.ZodObject<{
                            noticeId: z.ZodUUID;
                            reason: z.ZodString;
                        }, z.core.$strict>;
                    };
                };
            };
        };
        responses: {
            200: {
                description: string;
                content: {
                    "application/json": {
                        schema: z.ZodObject<{
                            data: z.ZodObject<{
                                recorded: z.ZodLiteral<true>;
                            }, z.core.$strip>;
                            quota: z.ZodNull;
                        }, z.core.$strip>;
                    };
                };
            };
            400: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            401: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            403: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            404: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            409: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            503: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
        };
    } | {
        security?: undefined;
        method: "post";
        path: "/v1/dpa/objections" | "/v1/extension/dpa/objections";
        summary: string;
        request: {
            body: {
                required: true;
                content: {
                    "application/json": {
                        schema: z.ZodObject<{
                            noticeId: z.ZodUUID;
                            reason: z.ZodString;
                        }, z.core.$strict>;
                    };
                };
            };
        };
        responses: {
            200: {
                description: string;
                content: {
                    "application/json": {
                        schema: z.ZodObject<{
                            data: z.ZodObject<{
                                recorded: z.ZodLiteral<true>;
                            }, z.core.$strip>;
                            quota: z.ZodNull;
                        }, z.core.$strip>;
                    };
                };
            };
            400: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            401: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            403: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            404: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            409: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            503: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
        };
    }) & {
        getRoutingPath(): "/v1/dpa/objections" | "/v1/extension/dpa/objections";
    };
    challenge: ({
        security: {
            ExtensionSession: never[];
        }[];
        method: "post";
        path: "/v1/dpa/challenges" | "/v1/extension/dpa/challenges";
        summary: string;
        request: {
            body: {
                required: true;
                content: {
                    "application/json": {
                        schema: z.ZodObject<{
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
                    };
                };
            };
        };
        responses: {
            200: {
                description: string;
                content: {
                    "application/json": {
                        schema: z.ZodObject<{
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
                    };
                };
            };
            400: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            401: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            403: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            404: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            409: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            429: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            503: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
        };
    } | {
        security?: undefined;
        method: "post";
        path: "/v1/dpa/challenges" | "/v1/extension/dpa/challenges";
        summary: string;
        request: {
            body: {
                required: true;
                content: {
                    "application/json": {
                        schema: z.ZodObject<{
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
                    };
                };
            };
        };
        responses: {
            200: {
                description: string;
                content: {
                    "application/json": {
                        schema: z.ZodObject<{
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
                    };
                };
            };
            400: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            401: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            403: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            404: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            409: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            429: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            503: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
        };
    }) & {
        getRoutingPath(): "/v1/dpa/challenges" | "/v1/extension/dpa/challenges";
    };
    conclude: ({
        security: {
            ExtensionSession: never[];
        }[];
        method: "post";
        path: "/v1/dpa/conclude" | "/v1/extension/dpa/conclude";
        summary: string;
        request: {
            body: {
                required: true;
                content: {
                    "application/json": {
                        schema: z.ZodObject<{
                            operationId: z.ZodUUID;
                            code: z.ZodString;
                        }, z.core.$strict>;
                    };
                };
            };
        };
        responses: {
            200: {
                description: string;
                content: {
                    "application/json": {
                        schema: z.ZodObject<{
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
                    };
                };
            };
            400: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            401: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            403: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            404: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            409: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            429: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            503: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
        };
    } | {
        security?: undefined;
        method: "post";
        path: "/v1/dpa/conclude" | "/v1/extension/dpa/conclude";
        summary: string;
        request: {
            body: {
                required: true;
                content: {
                    "application/json": {
                        schema: z.ZodObject<{
                            operationId: z.ZodUUID;
                            code: z.ZodString;
                        }, z.core.$strict>;
                    };
                };
            };
        };
        responses: {
            200: {
                description: string;
                content: {
                    "application/json": {
                        schema: z.ZodObject<{
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
                    };
                };
            };
            400: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            401: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            403: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            404: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            409: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            429: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            503: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
        };
    }) & {
        getRoutingPath(): "/v1/dpa/conclude" | "/v1/extension/dpa/conclude";
    };
    operation: ({
        security: {
            ExtensionSession: never[];
        }[];
        method: "get";
        path: "/v1/dpa/operations/{id}" | "/v1/extension/dpa/operations/{id}";
        summary: string;
        request: {
            params: z.ZodObject<{
                id: z.ZodUUID;
            }, z.core.$strip>;
        };
        responses: {
            200: {
                description: string;
                content: {
                    "application/json": {
                        schema: z.ZodObject<{
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
                    };
                };
            };
            400: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            401: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            403: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            404: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            409: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            429: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            503: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
        };
    } | {
        security?: undefined;
        method: "get";
        path: "/v1/dpa/operations/{id}" | "/v1/extension/dpa/operations/{id}";
        summary: string;
        request: {
            params: z.ZodObject<{
                id: z.ZodUUID;
            }, z.core.$strip>;
        };
        responses: {
            200: {
                description: string;
                content: {
                    "application/json": {
                        schema: z.ZodObject<{
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
                    };
                };
            };
            400: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            401: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            403: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            404: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            409: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            429: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            503: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
        };
    }) & {
        getRoutingPath(): "/v1/dpa/operations/:id" | "/v1/extension/dpa/operations/:id";
    };
    download: ({
        security: {
            ExtensionSession: never[];
        }[];
        method: "get";
        path: "/v1/dpa/agreements/{id}/download" | "/v1/extension/dpa/agreements/{id}/download";
        summary: string;
        request: {
            params: z.ZodObject<{
                id: z.ZodUUID;
            }, z.core.$strip>;
        };
        responses: {
            200: {
                description: string;
                content: {
                    "application/json": {
                        schema: z.ZodObject<{
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
                    };
                };
            };
            400: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            401: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            403: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            404: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            503: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
        };
    } | {
        security?: undefined;
        method: "get";
        path: "/v1/dpa/agreements/{id}/download" | "/v1/extension/dpa/agreements/{id}/download";
        summary: string;
        request: {
            params: z.ZodObject<{
                id: z.ZodUUID;
            }, z.core.$strip>;
        };
        responses: {
            200: {
                description: string;
                content: {
                    "application/json": {
                        schema: z.ZodObject<{
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
                    };
                };
            };
            400: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            401: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            403: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            404: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            503: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
        };
    }) & {
        getRoutingPath(): "/v1/dpa/agreements/:id/download" | "/v1/extension/dpa/agreements/:id/download";
    };
    state: ({
        security: {
            ExtensionSession: never[];
        }[];
        method: "get";
        path: "/v1/dpa/{language}" | "/v1/extension/dpa/{language}";
        summary: string;
        request: {
            params: z.ZodObject<{
                language: z.ZodEnum<{
                    de: "de";
                    en: "en";
                }>;
            }, z.core.$strip>;
        };
        responses: {
            200: {
                description: string;
                content: {
                    "application/json": {
                        schema: z.ZodObject<{
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
                    };
                };
            };
            400: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            401: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            403: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            503: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
        };
    } | {
        security?: undefined;
        method: "get";
        path: "/v1/dpa/{language}" | "/v1/extension/dpa/{language}";
        summary: string;
        request: {
            params: z.ZodObject<{
                language: z.ZodEnum<{
                    de: "de";
                    en: "en";
                }>;
            }, z.core.$strip>;
        };
        responses: {
            200: {
                description: string;
                content: {
                    "application/json": {
                        schema: z.ZodObject<{
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
                    };
                };
            };
            400: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            401: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            403: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            503: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
        };
    }) & {
        getRoutingPath(): "/v1/dpa/:language" | "/v1/extension/dpa/:language";
    };
};
export declare const webDpaRoutes: {
    objection: ({
        security: {
            ExtensionSession: never[];
        }[];
        method: "post";
        path: "/v1/dpa/objections" | "/v1/extension/dpa/objections";
        summary: string;
        request: {
            body: {
                required: true;
                content: {
                    "application/json": {
                        schema: z.ZodObject<{
                            noticeId: z.ZodUUID;
                            reason: z.ZodString;
                        }, z.core.$strict>;
                    };
                };
            };
        };
        responses: {
            200: {
                description: string;
                content: {
                    "application/json": {
                        schema: z.ZodObject<{
                            data: z.ZodObject<{
                                recorded: z.ZodLiteral<true>;
                            }, z.core.$strip>;
                            quota: z.ZodNull;
                        }, z.core.$strip>;
                    };
                };
            };
            400: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            401: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            403: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            404: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            409: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            503: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
        };
    } | {
        security?: undefined;
        method: "post";
        path: "/v1/dpa/objections" | "/v1/extension/dpa/objections";
        summary: string;
        request: {
            body: {
                required: true;
                content: {
                    "application/json": {
                        schema: z.ZodObject<{
                            noticeId: z.ZodUUID;
                            reason: z.ZodString;
                        }, z.core.$strict>;
                    };
                };
            };
        };
        responses: {
            200: {
                description: string;
                content: {
                    "application/json": {
                        schema: z.ZodObject<{
                            data: z.ZodObject<{
                                recorded: z.ZodLiteral<true>;
                            }, z.core.$strip>;
                            quota: z.ZodNull;
                        }, z.core.$strip>;
                    };
                };
            };
            400: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            401: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            403: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            404: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            409: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            503: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
        };
    }) & {
        getRoutingPath(): "/v1/dpa/objections" | "/v1/extension/dpa/objections";
    };
    challenge: ({
        security: {
            ExtensionSession: never[];
        }[];
        method: "post";
        path: "/v1/dpa/challenges" | "/v1/extension/dpa/challenges";
        summary: string;
        request: {
            body: {
                required: true;
                content: {
                    "application/json": {
                        schema: z.ZodObject<{
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
                    };
                };
            };
        };
        responses: {
            200: {
                description: string;
                content: {
                    "application/json": {
                        schema: z.ZodObject<{
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
                    };
                };
            };
            400: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            401: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            403: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            404: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            409: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            429: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            503: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
        };
    } | {
        security?: undefined;
        method: "post";
        path: "/v1/dpa/challenges" | "/v1/extension/dpa/challenges";
        summary: string;
        request: {
            body: {
                required: true;
                content: {
                    "application/json": {
                        schema: z.ZodObject<{
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
                    };
                };
            };
        };
        responses: {
            200: {
                description: string;
                content: {
                    "application/json": {
                        schema: z.ZodObject<{
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
                    };
                };
            };
            400: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            401: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            403: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            404: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            409: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            429: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            503: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
        };
    }) & {
        getRoutingPath(): "/v1/dpa/challenges" | "/v1/extension/dpa/challenges";
    };
    conclude: ({
        security: {
            ExtensionSession: never[];
        }[];
        method: "post";
        path: "/v1/dpa/conclude" | "/v1/extension/dpa/conclude";
        summary: string;
        request: {
            body: {
                required: true;
                content: {
                    "application/json": {
                        schema: z.ZodObject<{
                            operationId: z.ZodUUID;
                            code: z.ZodString;
                        }, z.core.$strict>;
                    };
                };
            };
        };
        responses: {
            200: {
                description: string;
                content: {
                    "application/json": {
                        schema: z.ZodObject<{
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
                    };
                };
            };
            400: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            401: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            403: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            404: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            409: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            429: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            503: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
        };
    } | {
        security?: undefined;
        method: "post";
        path: "/v1/dpa/conclude" | "/v1/extension/dpa/conclude";
        summary: string;
        request: {
            body: {
                required: true;
                content: {
                    "application/json": {
                        schema: z.ZodObject<{
                            operationId: z.ZodUUID;
                            code: z.ZodString;
                        }, z.core.$strict>;
                    };
                };
            };
        };
        responses: {
            200: {
                description: string;
                content: {
                    "application/json": {
                        schema: z.ZodObject<{
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
                    };
                };
            };
            400: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            401: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            403: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            404: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            409: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            429: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            503: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
        };
    }) & {
        getRoutingPath(): "/v1/dpa/conclude" | "/v1/extension/dpa/conclude";
    };
    operation: ({
        security: {
            ExtensionSession: never[];
        }[];
        method: "get";
        path: "/v1/dpa/operations/{id}" | "/v1/extension/dpa/operations/{id}";
        summary: string;
        request: {
            params: z.ZodObject<{
                id: z.ZodUUID;
            }, z.core.$strip>;
        };
        responses: {
            200: {
                description: string;
                content: {
                    "application/json": {
                        schema: z.ZodObject<{
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
                    };
                };
            };
            400: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            401: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            403: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            404: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            409: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            429: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            503: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
        };
    } | {
        security?: undefined;
        method: "get";
        path: "/v1/dpa/operations/{id}" | "/v1/extension/dpa/operations/{id}";
        summary: string;
        request: {
            params: z.ZodObject<{
                id: z.ZodUUID;
            }, z.core.$strip>;
        };
        responses: {
            200: {
                description: string;
                content: {
                    "application/json": {
                        schema: z.ZodObject<{
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
                    };
                };
            };
            400: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            401: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            403: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            404: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            409: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            429: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            503: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
        };
    }) & {
        getRoutingPath(): "/v1/dpa/operations/:id" | "/v1/extension/dpa/operations/:id";
    };
    download: ({
        security: {
            ExtensionSession: never[];
        }[];
        method: "get";
        path: "/v1/dpa/agreements/{id}/download" | "/v1/extension/dpa/agreements/{id}/download";
        summary: string;
        request: {
            params: z.ZodObject<{
                id: z.ZodUUID;
            }, z.core.$strip>;
        };
        responses: {
            200: {
                description: string;
                content: {
                    "application/json": {
                        schema: z.ZodObject<{
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
                    };
                };
            };
            400: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            401: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            403: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            404: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            503: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
        };
    } | {
        security?: undefined;
        method: "get";
        path: "/v1/dpa/agreements/{id}/download" | "/v1/extension/dpa/agreements/{id}/download";
        summary: string;
        request: {
            params: z.ZodObject<{
                id: z.ZodUUID;
            }, z.core.$strip>;
        };
        responses: {
            200: {
                description: string;
                content: {
                    "application/json": {
                        schema: z.ZodObject<{
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
                    };
                };
            };
            400: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            401: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            403: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            404: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            503: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
        };
    }) & {
        getRoutingPath(): "/v1/dpa/agreements/:id/download" | "/v1/extension/dpa/agreements/:id/download";
    };
    state: ({
        security: {
            ExtensionSession: never[];
        }[];
        method: "get";
        path: "/v1/dpa/{language}" | "/v1/extension/dpa/{language}";
        summary: string;
        request: {
            params: z.ZodObject<{
                language: z.ZodEnum<{
                    de: "de";
                    en: "en";
                }>;
            }, z.core.$strip>;
        };
        responses: {
            200: {
                description: string;
                content: {
                    "application/json": {
                        schema: z.ZodObject<{
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
                    };
                };
            };
            400: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            401: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            403: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            503: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
        };
    } | {
        security?: undefined;
        method: "get";
        path: "/v1/dpa/{language}" | "/v1/extension/dpa/{language}";
        summary: string;
        request: {
            params: z.ZodObject<{
                language: z.ZodEnum<{
                    de: "de";
                    en: "en";
                }>;
            }, z.core.$strip>;
        };
        responses: {
            200: {
                description: string;
                content: {
                    "application/json": {
                        schema: z.ZodObject<{
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
                    };
                };
            };
            400: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            401: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            403: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            503: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
        };
    }) & {
        getRoutingPath(): "/v1/dpa/:language" | "/v1/extension/dpa/:language";
    };
};
export declare const extensionDpaRoutes: {
    objection: ({
        security: {
            ExtensionSession: never[];
        }[];
        method: "post";
        path: "/v1/dpa/objections" | "/v1/extension/dpa/objections";
        summary: string;
        request: {
            body: {
                required: true;
                content: {
                    "application/json": {
                        schema: z.ZodObject<{
                            noticeId: z.ZodUUID;
                            reason: z.ZodString;
                        }, z.core.$strict>;
                    };
                };
            };
        };
        responses: {
            200: {
                description: string;
                content: {
                    "application/json": {
                        schema: z.ZodObject<{
                            data: z.ZodObject<{
                                recorded: z.ZodLiteral<true>;
                            }, z.core.$strip>;
                            quota: z.ZodNull;
                        }, z.core.$strip>;
                    };
                };
            };
            400: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            401: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            403: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            404: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            409: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            503: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
        };
    } | {
        security?: undefined;
        method: "post";
        path: "/v1/dpa/objections" | "/v1/extension/dpa/objections";
        summary: string;
        request: {
            body: {
                required: true;
                content: {
                    "application/json": {
                        schema: z.ZodObject<{
                            noticeId: z.ZodUUID;
                            reason: z.ZodString;
                        }, z.core.$strict>;
                    };
                };
            };
        };
        responses: {
            200: {
                description: string;
                content: {
                    "application/json": {
                        schema: z.ZodObject<{
                            data: z.ZodObject<{
                                recorded: z.ZodLiteral<true>;
                            }, z.core.$strip>;
                            quota: z.ZodNull;
                        }, z.core.$strip>;
                    };
                };
            };
            400: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            401: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            403: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            404: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            409: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            503: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
        };
    }) & {
        getRoutingPath(): "/v1/dpa/objections" | "/v1/extension/dpa/objections";
    };
    challenge: ({
        security: {
            ExtensionSession: never[];
        }[];
        method: "post";
        path: "/v1/dpa/challenges" | "/v1/extension/dpa/challenges";
        summary: string;
        request: {
            body: {
                required: true;
                content: {
                    "application/json": {
                        schema: z.ZodObject<{
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
                    };
                };
            };
        };
        responses: {
            200: {
                description: string;
                content: {
                    "application/json": {
                        schema: z.ZodObject<{
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
                    };
                };
            };
            400: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            401: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            403: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            404: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            409: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            429: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            503: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
        };
    } | {
        security?: undefined;
        method: "post";
        path: "/v1/dpa/challenges" | "/v1/extension/dpa/challenges";
        summary: string;
        request: {
            body: {
                required: true;
                content: {
                    "application/json": {
                        schema: z.ZodObject<{
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
                    };
                };
            };
        };
        responses: {
            200: {
                description: string;
                content: {
                    "application/json": {
                        schema: z.ZodObject<{
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
                    };
                };
            };
            400: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            401: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            403: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            404: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            409: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            429: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            503: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
        };
    }) & {
        getRoutingPath(): "/v1/dpa/challenges" | "/v1/extension/dpa/challenges";
    };
    conclude: ({
        security: {
            ExtensionSession: never[];
        }[];
        method: "post";
        path: "/v1/dpa/conclude" | "/v1/extension/dpa/conclude";
        summary: string;
        request: {
            body: {
                required: true;
                content: {
                    "application/json": {
                        schema: z.ZodObject<{
                            operationId: z.ZodUUID;
                            code: z.ZodString;
                        }, z.core.$strict>;
                    };
                };
            };
        };
        responses: {
            200: {
                description: string;
                content: {
                    "application/json": {
                        schema: z.ZodObject<{
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
                    };
                };
            };
            400: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            401: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            403: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            404: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            409: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            429: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            503: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
        };
    } | {
        security?: undefined;
        method: "post";
        path: "/v1/dpa/conclude" | "/v1/extension/dpa/conclude";
        summary: string;
        request: {
            body: {
                required: true;
                content: {
                    "application/json": {
                        schema: z.ZodObject<{
                            operationId: z.ZodUUID;
                            code: z.ZodString;
                        }, z.core.$strict>;
                    };
                };
            };
        };
        responses: {
            200: {
                description: string;
                content: {
                    "application/json": {
                        schema: z.ZodObject<{
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
                    };
                };
            };
            400: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            401: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            403: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            404: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            409: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            429: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            503: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
        };
    }) & {
        getRoutingPath(): "/v1/dpa/conclude" | "/v1/extension/dpa/conclude";
    };
    operation: ({
        security: {
            ExtensionSession: never[];
        }[];
        method: "get";
        path: "/v1/dpa/operations/{id}" | "/v1/extension/dpa/operations/{id}";
        summary: string;
        request: {
            params: z.ZodObject<{
                id: z.ZodUUID;
            }, z.core.$strip>;
        };
        responses: {
            200: {
                description: string;
                content: {
                    "application/json": {
                        schema: z.ZodObject<{
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
                    };
                };
            };
            400: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            401: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            403: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            404: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            409: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            429: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            503: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
        };
    } | {
        security?: undefined;
        method: "get";
        path: "/v1/dpa/operations/{id}" | "/v1/extension/dpa/operations/{id}";
        summary: string;
        request: {
            params: z.ZodObject<{
                id: z.ZodUUID;
            }, z.core.$strip>;
        };
        responses: {
            200: {
                description: string;
                content: {
                    "application/json": {
                        schema: z.ZodObject<{
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
                    };
                };
            };
            400: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            401: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            403: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            404: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            409: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            429: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            503: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
        };
    }) & {
        getRoutingPath(): "/v1/dpa/operations/:id" | "/v1/extension/dpa/operations/:id";
    };
    download: ({
        security: {
            ExtensionSession: never[];
        }[];
        method: "get";
        path: "/v1/dpa/agreements/{id}/download" | "/v1/extension/dpa/agreements/{id}/download";
        summary: string;
        request: {
            params: z.ZodObject<{
                id: z.ZodUUID;
            }, z.core.$strip>;
        };
        responses: {
            200: {
                description: string;
                content: {
                    "application/json": {
                        schema: z.ZodObject<{
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
                    };
                };
            };
            400: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            401: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            403: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            404: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            503: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
        };
    } | {
        security?: undefined;
        method: "get";
        path: "/v1/dpa/agreements/{id}/download" | "/v1/extension/dpa/agreements/{id}/download";
        summary: string;
        request: {
            params: z.ZodObject<{
                id: z.ZodUUID;
            }, z.core.$strip>;
        };
        responses: {
            200: {
                description: string;
                content: {
                    "application/json": {
                        schema: z.ZodObject<{
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
                    };
                };
            };
            400: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            401: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            403: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            404: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            503: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
        };
    }) & {
        getRoutingPath(): "/v1/dpa/agreements/:id/download" | "/v1/extension/dpa/agreements/:id/download";
    };
    state: ({
        security: {
            ExtensionSession: never[];
        }[];
        method: "get";
        path: "/v1/dpa/{language}" | "/v1/extension/dpa/{language}";
        summary: string;
        request: {
            params: z.ZodObject<{
                language: z.ZodEnum<{
                    de: "de";
                    en: "en";
                }>;
            }, z.core.$strip>;
        };
        responses: {
            200: {
                description: string;
                content: {
                    "application/json": {
                        schema: z.ZodObject<{
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
                    };
                };
            };
            400: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            401: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            403: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            503: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
        };
    } | {
        security?: undefined;
        method: "get";
        path: "/v1/dpa/{language}" | "/v1/extension/dpa/{language}";
        summary: string;
        request: {
            params: z.ZodObject<{
                language: z.ZodEnum<{
                    de: "de";
                    en: "en";
                }>;
            }, z.core.$strip>;
        };
        responses: {
            200: {
                description: string;
                content: {
                    "application/json": {
                        schema: z.ZodObject<{
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
                    };
                };
            };
            400: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            401: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            403: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
            503: {
                description: string;
                content: {
                    "application/problem+json": {
                        schema: z.ZodObject<{
                            type: z.ZodString;
                            title: z.ZodString;
                            status: z.ZodNumber;
                            detail: z.ZodOptional<z.ZodString>;
                            limit: z.ZodOptional<z.ZodNumber>;
                            available: z.ZodOptional<z.ZodNumber>;
                            required: z.ZodOptional<z.ZodNumber>;
                            retryAt: z.ZodOptional<z.ZodISODateTime>;
                            code: z.ZodString;
                            i18nKey: z.ZodString;
                        }, z.core.$strip>;
                    };
                };
            };
        };
    }) & {
        getRoutingPath(): "/v1/dpa/:language" | "/v1/extension/dpa/:language";
    };
};
