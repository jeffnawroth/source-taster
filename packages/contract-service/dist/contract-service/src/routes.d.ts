import { z } from "zod";
import { webDpaRoutes, extensionDpaRoutes } from "./dpa-routes.ts";
export { webDpaRoutes, extensionDpaRoutes };
export declare const getServiceStatus: {
    method: "get";
    path: "/v1/status";
    summary: string;
    responses: {
        200: {
            description: string;
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        data: z.ZodObject<{
                            program: z.ZodLiteral<"service">;
                            status: z.ZodLiteral<"ready">;
                            authentication: z.ZodLiteral<"unavailable">;
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
                };
            };
        };
    };
} & {
    getRoutingPath(): "/v1/status";
};
export declare const issueGuestToken: {
    method: "post";
    path: "/v1/guest-tokens";
    summary: string;
    request: {
        body: {
            required: true;
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        guestId: z.ZodUUID;
                        client: z.ZodEnum<{
                            extension: "extension";
                            web: "web";
                        }>;
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
                            accessToken: z.ZodString;
                            tokenType: z.ZodLiteral<"Bearer">;
                            expiresAt: z.ZodISODateTime;
                            expiresIn: z.ZodLiteral<300>;
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
} & {
    getRoutingPath(): "/v1/guest-tokens";
};
export declare const getGuestJwks: {
    method: "get";
    path: "/.well-known/jwks.json";
    summary: string;
    responses: {
        200: {
            description: string;
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        keys: z.ZodArray<z.ZodObject<{
                            kty: z.ZodLiteral<"OKP">;
                            crv: z.ZodLiteral<"Ed25519">;
                            x: z.ZodString;
                            kid: z.ZodString;
                            alg: z.ZodLiteral<"EdDSA">;
                            use: z.ZodLiteral<"sig">;
                        }, z.core.$strict>>;
                    }, z.core.$strict>;
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
} & {
    getRoutingPath(): "/.well-known/jwks.json";
};
export declare const requestSignIn: {
    method: "post";
    path: string;
    summary: string;
    request: {
        body: {
            required: true;
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        email: z.ZodEmail;
                        language: z.ZodEnum<{
                            de: "de";
                            en: "en";
                        }>;
                    }, z.core.$strict> | z.ZodObject<{
                        challengeId: z.ZodUUID;
                        code: z.ZodString;
                        preferences: z.ZodOptional<z.ZodObject<{
                            language: z.ZodEnum<{
                                de: "de";
                                en: "en";
                            }>;
                            citationStyle: z.ZodEnum<{
                                acs: "acs";
                                ama: "ama";
                                apa: "apa";
                                chicago: "chicago";
                                "din-iso-690": "din-iso-690";
                                harvard: "harvard";
                                ieee: "ieee";
                                mla: "mla";
                                oxford: "oxford";
                                springer: "springer";
                                vancouver: "vancouver";
                            }>;
                        }, z.core.$strict>>;
                    }, z.core.$strict> | z.ZodObject<{
                        everywhere: z.ZodBoolean;
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
                            accountId: z.ZodUUID;
                            ownerId: z.ZodUUID;
                            email: z.ZodEmail;
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
                    }, z.core.$strip> | z.ZodObject<{
                        data: z.ZodObject<{
                            challengeId: z.ZodUUID;
                            expiresIn: z.ZodNumber;
                            resendAfter: z.ZodNumber;
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
                    }, z.core.$strip> | z.ZodObject<{
                        data: z.ZodObject<{
                            signedOut: z.ZodLiteral<true>;
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
} & {
    getRoutingPath(): string;
};
export declare const confirmSignIn: {
    method: "post";
    path: string;
    summary: string;
    request: {
        body: {
            required: true;
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        email: z.ZodEmail;
                        language: z.ZodEnum<{
                            de: "de";
                            en: "en";
                        }>;
                    }, z.core.$strict> | z.ZodObject<{
                        challengeId: z.ZodUUID;
                        code: z.ZodString;
                        preferences: z.ZodOptional<z.ZodObject<{
                            language: z.ZodEnum<{
                                de: "de";
                                en: "en";
                            }>;
                            citationStyle: z.ZodEnum<{
                                acs: "acs";
                                ama: "ama";
                                apa: "apa";
                                chicago: "chicago";
                                "din-iso-690": "din-iso-690";
                                harvard: "harvard";
                                ieee: "ieee";
                                mla: "mla";
                                oxford: "oxford";
                                springer: "springer";
                                vancouver: "vancouver";
                            }>;
                        }, z.core.$strict>>;
                    }, z.core.$strict> | z.ZodObject<{
                        everywhere: z.ZodBoolean;
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
                            accountId: z.ZodUUID;
                            ownerId: z.ZodUUID;
                            email: z.ZodEmail;
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
                    }, z.core.$strip> | z.ZodObject<{
                        data: z.ZodObject<{
                            challengeId: z.ZodUUID;
                            expiresIn: z.ZodNumber;
                            resendAfter: z.ZodNumber;
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
                    }, z.core.$strip> | z.ZodObject<{
                        data: z.ZodObject<{
                            signedOut: z.ZodLiteral<true>;
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
} & {
    getRoutingPath(): string;
};
export declare const signOut: {
    method: "post";
    path: string;
    summary: string;
    request: {
        body: {
            required: true;
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        email: z.ZodEmail;
                        language: z.ZodEnum<{
                            de: "de";
                            en: "en";
                        }>;
                    }, z.core.$strict> | z.ZodObject<{
                        challengeId: z.ZodUUID;
                        code: z.ZodString;
                        preferences: z.ZodOptional<z.ZodObject<{
                            language: z.ZodEnum<{
                                de: "de";
                                en: "en";
                            }>;
                            citationStyle: z.ZodEnum<{
                                acs: "acs";
                                ama: "ama";
                                apa: "apa";
                                chicago: "chicago";
                                "din-iso-690": "din-iso-690";
                                harvard: "harvard";
                                ieee: "ieee";
                                mla: "mla";
                                oxford: "oxford";
                                springer: "springer";
                                vancouver: "vancouver";
                            }>;
                        }, z.core.$strict>>;
                    }, z.core.$strict> | z.ZodObject<{
                        everywhere: z.ZodBoolean;
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
                            accountId: z.ZodUUID;
                            ownerId: z.ZodUUID;
                            email: z.ZodEmail;
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
                    }, z.core.$strip> | z.ZodObject<{
                        data: z.ZodObject<{
                            challengeId: z.ZodUUID;
                            expiresIn: z.ZodNumber;
                            resendAfter: z.ZodNumber;
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
                    }, z.core.$strip> | z.ZodObject<{
                        data: z.ZodObject<{
                            signedOut: z.ZodLiteral<true>;
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
} & {
    getRoutingPath(): string;
};
export declare const getAccountSession: {
    method: "get";
    path: "/v1/session";
    summary: string;
    responses: {
        200: {
            description: string;
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        data: z.ZodObject<{
                            accountId: z.ZodUUID;
                            ownerId: z.ZodUUID;
                            email: z.ZodEmail;
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
} & {
    getRoutingPath(): "/v1/session";
};
export declare const recordSessionActivity: {
    method: "post";
    path: "/v1/session/activity";
    summary: string;
    responses: {
        200: {
            description: string;
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        data: z.ZodObject<{
                            accountId: z.ZodUUID;
                            ownerId: z.ZodUUID;
                            email: z.ZodEmail;
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
} & {
    getRoutingPath(): "/v1/session/activity";
};
export declare const issueAccountToken: {
    method: "post";
    path: "/v1/account-tokens";
    summary: string;
    responses: {
        200: {
            description: string;
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        data: z.ZodObject<{
                            accessToken: z.ZodString;
                            tokenType: z.ZodLiteral<"Bearer">;
                            expiresAt: z.ZodISODateTime;
                            expiresIn: z.ZodLiteral<300>;
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
} & {
    getRoutingPath(): "/v1/account-tokens";
};
/** Extension endpoints deliberately separate from host-cookie web endpoints.
 * Origins must be deployment-qualified; a claimed extension ID grants nothing. */
declare const extensionBearer: {
    readonly type: "http";
    readonly scheme: "bearer";
    readonly description: "Opaque extension session credential; never a web cookie or verification JWT";
};
export { extensionBearer };
export declare const requestExtensionSignIn: {
    method: "get" | "post";
    path: `/v1/extension${string}`;
    summary: string;
    security?: {
        ExtensionSession: never[];
    }[] | undefined;
    request?: {
        body: {
            required: true;
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        email: z.ZodEmail;
                        language: z.ZodEnum<{
                            de: "de";
                            en: "en";
                        }>;
                    }, z.core.$strict> | z.ZodObject<{
                        everywhere: z.ZodBoolean;
                    }, z.core.$strict> | z.ZodObject<{
                        challengeId: z.ZodUUID;
                        code: z.ZodString;
                        preferences: z.ZodOptional<z.ZodObject<{
                            language: z.ZodEnum<{
                                de: "de";
                                en: "en";
                            }>;
                            citationStyle: z.ZodEnum<{
                                acs: "acs";
                                ama: "ama";
                                apa: "apa";
                                chicago: "chicago";
                                "din-iso-690": "din-iso-690";
                                harvard: "harvard";
                                ieee: "ieee";
                                mla: "mla";
                                oxford: "oxford";
                                springer: "springer";
                                vancouver: "vancouver";
                            }>;
                        }, z.core.$strict>>;
                        transactionCredential: z.ZodString;
                    }, z.core.$strict>;
                };
            };
        };
    } | undefined;
    responses: {
        200: {
            description: string;
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        data: z.ZodObject<{
                            accessToken: z.ZodString;
                            tokenType: z.ZodLiteral<"Bearer">;
                            expiresAt: z.ZodISODateTime;
                            expiresIn: z.ZodLiteral<300>;
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
                    }, z.core.$strip> | z.ZodObject<{
                        data: z.ZodObject<{
                            accountId: z.ZodUUID;
                            ownerId: z.ZodUUID;
                            email: z.ZodEmail;
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
                    }, z.core.$strip> | z.ZodObject<{
                        data: z.ZodObject<{
                            signedOut: z.ZodLiteral<true>;
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
                    }, z.core.$strip> | z.ZodObject<{
                        data: z.ZodObject<{
                            challengeId: z.ZodUUID;
                            expiresIn: z.ZodNumber;
                            resendAfter: z.ZodNumber;
                            transactionCredential: z.ZodString;
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
                    }, z.core.$strip> | z.ZodObject<{
                        data: z.ZodObject<{
                            session: z.ZodObject<{
                                accountId: z.ZodUUID;
                                ownerId: z.ZodUUID;
                                email: z.ZodEmail;
                            }, z.core.$strict>;
                            sessionCredential: z.ZodString;
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
} & {
    getRoutingPath(): `/v1/extension${string}`;
};
export declare const confirmExtensionSignIn: {
    method: "get" | "post";
    path: `/v1/extension${string}`;
    summary: string;
    security?: {
        ExtensionSession: never[];
    }[] | undefined;
    request?: {
        body: {
            required: true;
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        email: z.ZodEmail;
                        language: z.ZodEnum<{
                            de: "de";
                            en: "en";
                        }>;
                    }, z.core.$strict> | z.ZodObject<{
                        everywhere: z.ZodBoolean;
                    }, z.core.$strict> | z.ZodObject<{
                        challengeId: z.ZodUUID;
                        code: z.ZodString;
                        preferences: z.ZodOptional<z.ZodObject<{
                            language: z.ZodEnum<{
                                de: "de";
                                en: "en";
                            }>;
                            citationStyle: z.ZodEnum<{
                                acs: "acs";
                                ama: "ama";
                                apa: "apa";
                                chicago: "chicago";
                                "din-iso-690": "din-iso-690";
                                harvard: "harvard";
                                ieee: "ieee";
                                mla: "mla";
                                oxford: "oxford";
                                springer: "springer";
                                vancouver: "vancouver";
                            }>;
                        }, z.core.$strict>>;
                        transactionCredential: z.ZodString;
                    }, z.core.$strict>;
                };
            };
        };
    } | undefined;
    responses: {
        200: {
            description: string;
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        data: z.ZodObject<{
                            accessToken: z.ZodString;
                            tokenType: z.ZodLiteral<"Bearer">;
                            expiresAt: z.ZodISODateTime;
                            expiresIn: z.ZodLiteral<300>;
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
                    }, z.core.$strip> | z.ZodObject<{
                        data: z.ZodObject<{
                            accountId: z.ZodUUID;
                            ownerId: z.ZodUUID;
                            email: z.ZodEmail;
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
                    }, z.core.$strip> | z.ZodObject<{
                        data: z.ZodObject<{
                            signedOut: z.ZodLiteral<true>;
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
                    }, z.core.$strip> | z.ZodObject<{
                        data: z.ZodObject<{
                            challengeId: z.ZodUUID;
                            expiresIn: z.ZodNumber;
                            resendAfter: z.ZodNumber;
                            transactionCredential: z.ZodString;
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
                    }, z.core.$strip> | z.ZodObject<{
                        data: z.ZodObject<{
                            session: z.ZodObject<{
                                accountId: z.ZodUUID;
                                ownerId: z.ZodUUID;
                                email: z.ZodEmail;
                            }, z.core.$strict>;
                            sessionCredential: z.ZodString;
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
} & {
    getRoutingPath(): `/v1/extension${string}`;
};
export declare const getExtensionSession: {
    method: "get" | "post";
    path: `/v1/extension${string}`;
    summary: string;
    security?: {
        ExtensionSession: never[];
    }[] | undefined;
    request?: {
        body: {
            required: true;
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        email: z.ZodEmail;
                        language: z.ZodEnum<{
                            de: "de";
                            en: "en";
                        }>;
                    }, z.core.$strict> | z.ZodObject<{
                        everywhere: z.ZodBoolean;
                    }, z.core.$strict> | z.ZodObject<{
                        challengeId: z.ZodUUID;
                        code: z.ZodString;
                        preferences: z.ZodOptional<z.ZodObject<{
                            language: z.ZodEnum<{
                                de: "de";
                                en: "en";
                            }>;
                            citationStyle: z.ZodEnum<{
                                acs: "acs";
                                ama: "ama";
                                apa: "apa";
                                chicago: "chicago";
                                "din-iso-690": "din-iso-690";
                                harvard: "harvard";
                                ieee: "ieee";
                                mla: "mla";
                                oxford: "oxford";
                                springer: "springer";
                                vancouver: "vancouver";
                            }>;
                        }, z.core.$strict>>;
                        transactionCredential: z.ZodString;
                    }, z.core.$strict>;
                };
            };
        };
    } | undefined;
    responses: {
        200: {
            description: string;
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        data: z.ZodObject<{
                            accessToken: z.ZodString;
                            tokenType: z.ZodLiteral<"Bearer">;
                            expiresAt: z.ZodISODateTime;
                            expiresIn: z.ZodLiteral<300>;
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
                    }, z.core.$strip> | z.ZodObject<{
                        data: z.ZodObject<{
                            accountId: z.ZodUUID;
                            ownerId: z.ZodUUID;
                            email: z.ZodEmail;
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
                    }, z.core.$strip> | z.ZodObject<{
                        data: z.ZodObject<{
                            signedOut: z.ZodLiteral<true>;
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
                    }, z.core.$strip> | z.ZodObject<{
                        data: z.ZodObject<{
                            challengeId: z.ZodUUID;
                            expiresIn: z.ZodNumber;
                            resendAfter: z.ZodNumber;
                            transactionCredential: z.ZodString;
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
                    }, z.core.$strip> | z.ZodObject<{
                        data: z.ZodObject<{
                            session: z.ZodObject<{
                                accountId: z.ZodUUID;
                                ownerId: z.ZodUUID;
                                email: z.ZodEmail;
                            }, z.core.$strict>;
                            sessionCredential: z.ZodString;
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
} & {
    getRoutingPath(): `/v1/extension${string}`;
};
export declare const issueExtensionAccountToken: {
    method: "get" | "post";
    path: `/v1/extension${string}`;
    summary: string;
    security?: {
        ExtensionSession: never[];
    }[] | undefined;
    request?: {
        body: {
            required: true;
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        email: z.ZodEmail;
                        language: z.ZodEnum<{
                            de: "de";
                            en: "en";
                        }>;
                    }, z.core.$strict> | z.ZodObject<{
                        everywhere: z.ZodBoolean;
                    }, z.core.$strict> | z.ZodObject<{
                        challengeId: z.ZodUUID;
                        code: z.ZodString;
                        preferences: z.ZodOptional<z.ZodObject<{
                            language: z.ZodEnum<{
                                de: "de";
                                en: "en";
                            }>;
                            citationStyle: z.ZodEnum<{
                                acs: "acs";
                                ama: "ama";
                                apa: "apa";
                                chicago: "chicago";
                                "din-iso-690": "din-iso-690";
                                harvard: "harvard";
                                ieee: "ieee";
                                mla: "mla";
                                oxford: "oxford";
                                springer: "springer";
                                vancouver: "vancouver";
                            }>;
                        }, z.core.$strict>>;
                        transactionCredential: z.ZodString;
                    }, z.core.$strict>;
                };
            };
        };
    } | undefined;
    responses: {
        200: {
            description: string;
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        data: z.ZodObject<{
                            accessToken: z.ZodString;
                            tokenType: z.ZodLiteral<"Bearer">;
                            expiresAt: z.ZodISODateTime;
                            expiresIn: z.ZodLiteral<300>;
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
                    }, z.core.$strip> | z.ZodObject<{
                        data: z.ZodObject<{
                            accountId: z.ZodUUID;
                            ownerId: z.ZodUUID;
                            email: z.ZodEmail;
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
                    }, z.core.$strip> | z.ZodObject<{
                        data: z.ZodObject<{
                            signedOut: z.ZodLiteral<true>;
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
                    }, z.core.$strip> | z.ZodObject<{
                        data: z.ZodObject<{
                            challengeId: z.ZodUUID;
                            expiresIn: z.ZodNumber;
                            resendAfter: z.ZodNumber;
                            transactionCredential: z.ZodString;
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
                    }, z.core.$strip> | z.ZodObject<{
                        data: z.ZodObject<{
                            session: z.ZodObject<{
                                accountId: z.ZodUUID;
                                ownerId: z.ZodUUID;
                                email: z.ZodEmail;
                            }, z.core.$strict>;
                            sessionCredential: z.ZodString;
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
} & {
    getRoutingPath(): `/v1/extension${string}`;
};
export declare const recordExtensionSessionActivity: {
    method: "get" | "post";
    path: `/v1/extension${string}`;
    summary: string;
    security?: {
        ExtensionSession: never[];
    }[] | undefined;
    request?: {
        body: {
            required: true;
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        email: z.ZodEmail;
                        language: z.ZodEnum<{
                            de: "de";
                            en: "en";
                        }>;
                    }, z.core.$strict> | z.ZodObject<{
                        everywhere: z.ZodBoolean;
                    }, z.core.$strict> | z.ZodObject<{
                        challengeId: z.ZodUUID;
                        code: z.ZodString;
                        preferences: z.ZodOptional<z.ZodObject<{
                            language: z.ZodEnum<{
                                de: "de";
                                en: "en";
                            }>;
                            citationStyle: z.ZodEnum<{
                                acs: "acs";
                                ama: "ama";
                                apa: "apa";
                                chicago: "chicago";
                                "din-iso-690": "din-iso-690";
                                harvard: "harvard";
                                ieee: "ieee";
                                mla: "mla";
                                oxford: "oxford";
                                springer: "springer";
                                vancouver: "vancouver";
                            }>;
                        }, z.core.$strict>>;
                        transactionCredential: z.ZodString;
                    }, z.core.$strict>;
                };
            };
        };
    } | undefined;
    responses: {
        200: {
            description: string;
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        data: z.ZodObject<{
                            accessToken: z.ZodString;
                            tokenType: z.ZodLiteral<"Bearer">;
                            expiresAt: z.ZodISODateTime;
                            expiresIn: z.ZodLiteral<300>;
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
                    }, z.core.$strip> | z.ZodObject<{
                        data: z.ZodObject<{
                            accountId: z.ZodUUID;
                            ownerId: z.ZodUUID;
                            email: z.ZodEmail;
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
                    }, z.core.$strip> | z.ZodObject<{
                        data: z.ZodObject<{
                            signedOut: z.ZodLiteral<true>;
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
                    }, z.core.$strip> | z.ZodObject<{
                        data: z.ZodObject<{
                            challengeId: z.ZodUUID;
                            expiresIn: z.ZodNumber;
                            resendAfter: z.ZodNumber;
                            transactionCredential: z.ZodString;
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
                    }, z.core.$strip> | z.ZodObject<{
                        data: z.ZodObject<{
                            session: z.ZodObject<{
                                accountId: z.ZodUUID;
                                ownerId: z.ZodUUID;
                                email: z.ZodEmail;
                            }, z.core.$strict>;
                            sessionCredential: z.ZodString;
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
} & {
    getRoutingPath(): `/v1/extension${string}`;
};
export declare const signOutExtension: {
    method: "get" | "post";
    path: `/v1/extension${string}`;
    summary: string;
    security?: {
        ExtensionSession: never[];
    }[] | undefined;
    request?: {
        body: {
            required: true;
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        email: z.ZodEmail;
                        language: z.ZodEnum<{
                            de: "de";
                            en: "en";
                        }>;
                    }, z.core.$strict> | z.ZodObject<{
                        everywhere: z.ZodBoolean;
                    }, z.core.$strict> | z.ZodObject<{
                        challengeId: z.ZodUUID;
                        code: z.ZodString;
                        preferences: z.ZodOptional<z.ZodObject<{
                            language: z.ZodEnum<{
                                de: "de";
                                en: "en";
                            }>;
                            citationStyle: z.ZodEnum<{
                                acs: "acs";
                                ama: "ama";
                                apa: "apa";
                                chicago: "chicago";
                                "din-iso-690": "din-iso-690";
                                harvard: "harvard";
                                ieee: "ieee";
                                mla: "mla";
                                oxford: "oxford";
                                springer: "springer";
                                vancouver: "vancouver";
                            }>;
                        }, z.core.$strict>>;
                        transactionCredential: z.ZodString;
                    }, z.core.$strict>;
                };
            };
        };
    } | undefined;
    responses: {
        200: {
            description: string;
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        data: z.ZodObject<{
                            accessToken: z.ZodString;
                            tokenType: z.ZodLiteral<"Bearer">;
                            expiresAt: z.ZodISODateTime;
                            expiresIn: z.ZodLiteral<300>;
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
                    }, z.core.$strip> | z.ZodObject<{
                        data: z.ZodObject<{
                            accountId: z.ZodUUID;
                            ownerId: z.ZodUUID;
                            email: z.ZodEmail;
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
                    }, z.core.$strip> | z.ZodObject<{
                        data: z.ZodObject<{
                            signedOut: z.ZodLiteral<true>;
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
                    }, z.core.$strip> | z.ZodObject<{
                        data: z.ZodObject<{
                            challengeId: z.ZodUUID;
                            expiresIn: z.ZodNumber;
                            resendAfter: z.ZodNumber;
                            transactionCredential: z.ZodString;
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
                    }, z.core.$strip> | z.ZodObject<{
                        data: z.ZodObject<{
                            session: z.ZodObject<{
                                accountId: z.ZodUUID;
                                ownerId: z.ZodUUID;
                                email: z.ZodEmail;
                            }, z.core.$strict>;
                            sessionCredential: z.ZodString;
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
} & {
    getRoutingPath(): `/v1/extension${string}`;
};
export declare const getAccountPreferences: {
    method: "get" | "patch";
    path: "/v1/extension/preferences" | "/v1/preferences";
    summary: string;
    security?: {
        ExtensionSession: never[];
    }[] | undefined;
    request?: {
        body: {
            required: true;
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        language: z.ZodOptional<z.ZodEnum<{
                            de: "de";
                            en: "en";
                        }>>;
                        citationStyle: z.ZodOptional<z.ZodEnum<{
                            acs: "acs";
                            ama: "ama";
                            apa: "apa";
                            chicago: "chicago";
                            "din-iso-690": "din-iso-690";
                            harvard: "harvard";
                            ieee: "ieee";
                            mla: "mla";
                            oxford: "oxford";
                            springer: "springer";
                            vancouver: "vancouver";
                        }>>;
                    }, z.core.$strict>;
                };
            };
        };
    } | undefined;
    responses: {
        200: {
            description: string;
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        data: z.ZodObject<{
                            language: z.ZodEnum<{
                                de: "de";
                                en: "en";
                            }>;
                            citationStyle: z.ZodString;
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
} & {
    getRoutingPath(): "/v1/extension/preferences" | "/v1/preferences";
};
export declare const patchAccountPreferences: {
    method: "get" | "patch";
    path: "/v1/extension/preferences" | "/v1/preferences";
    summary: string;
    security?: {
        ExtensionSession: never[];
    }[] | undefined;
    request?: {
        body: {
            required: true;
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        language: z.ZodOptional<z.ZodEnum<{
                            de: "de";
                            en: "en";
                        }>>;
                        citationStyle: z.ZodOptional<z.ZodEnum<{
                            acs: "acs";
                            ama: "ama";
                            apa: "apa";
                            chicago: "chicago";
                            "din-iso-690": "din-iso-690";
                            harvard: "harvard";
                            ieee: "ieee";
                            mla: "mla";
                            oxford: "oxford";
                            springer: "springer";
                            vancouver: "vancouver";
                        }>>;
                    }, z.core.$strict>;
                };
            };
        };
    } | undefined;
    responses: {
        200: {
            description: string;
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        data: z.ZodObject<{
                            language: z.ZodEnum<{
                                de: "de";
                                en: "en";
                            }>;
                            citationStyle: z.ZodString;
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
} & {
    getRoutingPath(): "/v1/extension/preferences" | "/v1/preferences";
};
export declare const getExtensionPreferences: {
    method: "get" | "patch";
    path: "/v1/extension/preferences" | "/v1/preferences";
    summary: string;
    security?: {
        ExtensionSession: never[];
    }[] | undefined;
    request?: {
        body: {
            required: true;
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        language: z.ZodOptional<z.ZodEnum<{
                            de: "de";
                            en: "en";
                        }>>;
                        citationStyle: z.ZodOptional<z.ZodEnum<{
                            acs: "acs";
                            ama: "ama";
                            apa: "apa";
                            chicago: "chicago";
                            "din-iso-690": "din-iso-690";
                            harvard: "harvard";
                            ieee: "ieee";
                            mla: "mla";
                            oxford: "oxford";
                            springer: "springer";
                            vancouver: "vancouver";
                        }>>;
                    }, z.core.$strict>;
                };
            };
        };
    } | undefined;
    responses: {
        200: {
            description: string;
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        data: z.ZodObject<{
                            language: z.ZodEnum<{
                                de: "de";
                                en: "en";
                            }>;
                            citationStyle: z.ZodString;
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
} & {
    getRoutingPath(): "/v1/extension/preferences" | "/v1/preferences";
};
export declare const patchExtensionPreferences: {
    method: "get" | "patch";
    path: "/v1/extension/preferences" | "/v1/preferences";
    summary: string;
    security?: {
        ExtensionSession: never[];
    }[] | undefined;
    request?: {
        body: {
            required: true;
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        language: z.ZodOptional<z.ZodEnum<{
                            de: "de";
                            en: "en";
                        }>>;
                        citationStyle: z.ZodOptional<z.ZodEnum<{
                            acs: "acs";
                            ama: "ama";
                            apa: "apa";
                            chicago: "chicago";
                            "din-iso-690": "din-iso-690";
                            harvard: "harvard";
                            ieee: "ieee";
                            mla: "mla";
                            oxford: "oxford";
                            springer: "springer";
                            vancouver: "vancouver";
                        }>>;
                    }, z.core.$strict>;
                };
            };
        };
    } | undefined;
    responses: {
        200: {
            description: string;
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        data: z.ZodObject<{
                            language: z.ZodEnum<{
                                de: "de";
                                en: "en";
                            }>;
                            citationStyle: z.ZodString;
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
} & {
    getRoutingPath(): "/v1/extension/preferences" | "/v1/preferences";
};
export declare const webSensitiveRoutes: readonly [{
    method: "post";
    path: `/v1/account${string}` | `/v1/extension/account${string}`;
    summary: string;
    security?: {
        ExtensionSession: never[];
    }[] | undefined;
    request: {
        body: {
            required: true;
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        challengeId: z.ZodUUID;
                        code: z.ZodString;
                        preferences: z.ZodOptional<z.ZodObject<{
                            language: z.ZodEnum<{
                                de: "de";
                                en: "en";
                            }>;
                            citationStyle: z.ZodEnum<{
                                acs: "acs";
                                ama: "ama";
                                apa: "apa";
                                chicago: "chicago";
                                "din-iso-690": "din-iso-690";
                                harvard: "harvard";
                                ieee: "ieee";
                                mla: "mla";
                                oxford: "oxford";
                                springer: "springer";
                                vancouver: "vancouver";
                            }>;
                        }, z.core.$strict>>;
                    }, z.core.$strict> | z.ZodObject<{
                        action: z.ZodEnum<{
                            "account-deletion": "account-deletion";
                            "email-change": "email-change";
                        }>;
                        language: z.ZodEnum<{
                            de: "de";
                            en: "en";
                        }>;
                    }, z.core.$strict> | z.ZodObject<{
                        newEmail: z.ZodEmail;
                        language: z.ZodEnum<{
                            de: "de";
                            en: "en";
                        }>;
                    }, z.core.$strict> | z.ZodObject<{
                        billingRetentionAcknowledged: z.ZodLiteral<true>;
                        billingRetentionYears: z.ZodLiteral<8>;
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
                            accountId: z.ZodUUID;
                            ownerId: z.ZodUUID;
                            email: z.ZodEmail;
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
                    }, z.core.$strip> | z.ZodObject<{
                        data: z.ZodObject<{
                            challengeId: z.ZodUUID;
                            expiresIn: z.ZodNumber;
                            resendAfter: z.ZodNumber;
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
                    }, z.core.$strip> | z.ZodObject<{
                        data: z.ZodObject<{
                            challengeId: z.ZodUUID;
                            action: z.ZodEnum<{
                                "account-deletion": "account-deletion";
                                "email-change": "email-change";
                            }>;
                            expiresIn: z.ZodNumber;
                            resendAfter: z.ZodNumber;
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
                    }, z.core.$strip> | z.ZodObject<{
                        data: z.ZodObject<{
                            action: z.ZodEnum<{
                                "account-deletion": "account-deletion";
                                "email-change": "email-change";
                            }>;
                            expiresAt: z.ZodISODateTime;
                            expiresIn: z.ZodNumber;
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
                    }, z.core.$strip> | z.ZodObject<{
                        data: z.ZodObject<{
                            status: z.ZodEnum<{
                                deleted: "deleted";
                                "in-progress": "in-progress";
                            }>;
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
        501: {
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
} & {
    getRoutingPath(): `/v1/account${string}` | `/v1/extension/account${string}`;
}, {
    method: "post";
    path: `/v1/account${string}` | `/v1/extension/account${string}`;
    summary: string;
    security?: {
        ExtensionSession: never[];
    }[] | undefined;
    request: {
        body: {
            required: true;
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        challengeId: z.ZodUUID;
                        code: z.ZodString;
                        preferences: z.ZodOptional<z.ZodObject<{
                            language: z.ZodEnum<{
                                de: "de";
                                en: "en";
                            }>;
                            citationStyle: z.ZodEnum<{
                                acs: "acs";
                                ama: "ama";
                                apa: "apa";
                                chicago: "chicago";
                                "din-iso-690": "din-iso-690";
                                harvard: "harvard";
                                ieee: "ieee";
                                mla: "mla";
                                oxford: "oxford";
                                springer: "springer";
                                vancouver: "vancouver";
                            }>;
                        }, z.core.$strict>>;
                    }, z.core.$strict> | z.ZodObject<{
                        action: z.ZodEnum<{
                            "account-deletion": "account-deletion";
                            "email-change": "email-change";
                        }>;
                        language: z.ZodEnum<{
                            de: "de";
                            en: "en";
                        }>;
                    }, z.core.$strict> | z.ZodObject<{
                        newEmail: z.ZodEmail;
                        language: z.ZodEnum<{
                            de: "de";
                            en: "en";
                        }>;
                    }, z.core.$strict> | z.ZodObject<{
                        billingRetentionAcknowledged: z.ZodLiteral<true>;
                        billingRetentionYears: z.ZodLiteral<8>;
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
                            accountId: z.ZodUUID;
                            ownerId: z.ZodUUID;
                            email: z.ZodEmail;
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
                    }, z.core.$strip> | z.ZodObject<{
                        data: z.ZodObject<{
                            challengeId: z.ZodUUID;
                            expiresIn: z.ZodNumber;
                            resendAfter: z.ZodNumber;
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
                    }, z.core.$strip> | z.ZodObject<{
                        data: z.ZodObject<{
                            challengeId: z.ZodUUID;
                            action: z.ZodEnum<{
                                "account-deletion": "account-deletion";
                                "email-change": "email-change";
                            }>;
                            expiresIn: z.ZodNumber;
                            resendAfter: z.ZodNumber;
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
                    }, z.core.$strip> | z.ZodObject<{
                        data: z.ZodObject<{
                            action: z.ZodEnum<{
                                "account-deletion": "account-deletion";
                                "email-change": "email-change";
                            }>;
                            expiresAt: z.ZodISODateTime;
                            expiresIn: z.ZodNumber;
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
                    }, z.core.$strip> | z.ZodObject<{
                        data: z.ZodObject<{
                            status: z.ZodEnum<{
                                deleted: "deleted";
                                "in-progress": "in-progress";
                            }>;
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
        501: {
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
} & {
    getRoutingPath(): `/v1/account${string}` | `/v1/extension/account${string}`;
}, {
    method: "post";
    path: `/v1/account${string}` | `/v1/extension/account${string}`;
    summary: string;
    security?: {
        ExtensionSession: never[];
    }[] | undefined;
    request: {
        body: {
            required: true;
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        challengeId: z.ZodUUID;
                        code: z.ZodString;
                        preferences: z.ZodOptional<z.ZodObject<{
                            language: z.ZodEnum<{
                                de: "de";
                                en: "en";
                            }>;
                            citationStyle: z.ZodEnum<{
                                acs: "acs";
                                ama: "ama";
                                apa: "apa";
                                chicago: "chicago";
                                "din-iso-690": "din-iso-690";
                                harvard: "harvard";
                                ieee: "ieee";
                                mla: "mla";
                                oxford: "oxford";
                                springer: "springer";
                                vancouver: "vancouver";
                            }>;
                        }, z.core.$strict>>;
                    }, z.core.$strict> | z.ZodObject<{
                        action: z.ZodEnum<{
                            "account-deletion": "account-deletion";
                            "email-change": "email-change";
                        }>;
                        language: z.ZodEnum<{
                            de: "de";
                            en: "en";
                        }>;
                    }, z.core.$strict> | z.ZodObject<{
                        newEmail: z.ZodEmail;
                        language: z.ZodEnum<{
                            de: "de";
                            en: "en";
                        }>;
                    }, z.core.$strict> | z.ZodObject<{
                        billingRetentionAcknowledged: z.ZodLiteral<true>;
                        billingRetentionYears: z.ZodLiteral<8>;
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
                            accountId: z.ZodUUID;
                            ownerId: z.ZodUUID;
                            email: z.ZodEmail;
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
                    }, z.core.$strip> | z.ZodObject<{
                        data: z.ZodObject<{
                            challengeId: z.ZodUUID;
                            expiresIn: z.ZodNumber;
                            resendAfter: z.ZodNumber;
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
                    }, z.core.$strip> | z.ZodObject<{
                        data: z.ZodObject<{
                            challengeId: z.ZodUUID;
                            action: z.ZodEnum<{
                                "account-deletion": "account-deletion";
                                "email-change": "email-change";
                            }>;
                            expiresIn: z.ZodNumber;
                            resendAfter: z.ZodNumber;
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
                    }, z.core.$strip> | z.ZodObject<{
                        data: z.ZodObject<{
                            action: z.ZodEnum<{
                                "account-deletion": "account-deletion";
                                "email-change": "email-change";
                            }>;
                            expiresAt: z.ZodISODateTime;
                            expiresIn: z.ZodNumber;
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
                    }, z.core.$strip> | z.ZodObject<{
                        data: z.ZodObject<{
                            status: z.ZodEnum<{
                                deleted: "deleted";
                                "in-progress": "in-progress";
                            }>;
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
        501: {
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
} & {
    getRoutingPath(): `/v1/account${string}` | `/v1/extension/account${string}`;
}, {
    method: "post";
    path: `/v1/account${string}` | `/v1/extension/account${string}`;
    summary: string;
    security?: {
        ExtensionSession: never[];
    }[] | undefined;
    request: {
        body: {
            required: true;
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        challengeId: z.ZodUUID;
                        code: z.ZodString;
                        preferences: z.ZodOptional<z.ZodObject<{
                            language: z.ZodEnum<{
                                de: "de";
                                en: "en";
                            }>;
                            citationStyle: z.ZodEnum<{
                                acs: "acs";
                                ama: "ama";
                                apa: "apa";
                                chicago: "chicago";
                                "din-iso-690": "din-iso-690";
                                harvard: "harvard";
                                ieee: "ieee";
                                mla: "mla";
                                oxford: "oxford";
                                springer: "springer";
                                vancouver: "vancouver";
                            }>;
                        }, z.core.$strict>>;
                    }, z.core.$strict> | z.ZodObject<{
                        action: z.ZodEnum<{
                            "account-deletion": "account-deletion";
                            "email-change": "email-change";
                        }>;
                        language: z.ZodEnum<{
                            de: "de";
                            en: "en";
                        }>;
                    }, z.core.$strict> | z.ZodObject<{
                        newEmail: z.ZodEmail;
                        language: z.ZodEnum<{
                            de: "de";
                            en: "en";
                        }>;
                    }, z.core.$strict> | z.ZodObject<{
                        billingRetentionAcknowledged: z.ZodLiteral<true>;
                        billingRetentionYears: z.ZodLiteral<8>;
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
                            accountId: z.ZodUUID;
                            ownerId: z.ZodUUID;
                            email: z.ZodEmail;
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
                    }, z.core.$strip> | z.ZodObject<{
                        data: z.ZodObject<{
                            challengeId: z.ZodUUID;
                            expiresIn: z.ZodNumber;
                            resendAfter: z.ZodNumber;
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
                    }, z.core.$strip> | z.ZodObject<{
                        data: z.ZodObject<{
                            challengeId: z.ZodUUID;
                            action: z.ZodEnum<{
                                "account-deletion": "account-deletion";
                                "email-change": "email-change";
                            }>;
                            expiresIn: z.ZodNumber;
                            resendAfter: z.ZodNumber;
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
                    }, z.core.$strip> | z.ZodObject<{
                        data: z.ZodObject<{
                            action: z.ZodEnum<{
                                "account-deletion": "account-deletion";
                                "email-change": "email-change";
                            }>;
                            expiresAt: z.ZodISODateTime;
                            expiresIn: z.ZodNumber;
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
                    }, z.core.$strip> | z.ZodObject<{
                        data: z.ZodObject<{
                            status: z.ZodEnum<{
                                deleted: "deleted";
                                "in-progress": "in-progress";
                            }>;
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
        501: {
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
} & {
    getRoutingPath(): `/v1/account${string}` | `/v1/extension/account${string}`;
}, {
    method: "post";
    path: `/v1/account${string}` | `/v1/extension/account${string}`;
    summary: string;
    security?: {
        ExtensionSession: never[];
    }[] | undefined;
    request: {
        body: {
            required: true;
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        challengeId: z.ZodUUID;
                        code: z.ZodString;
                        preferences: z.ZodOptional<z.ZodObject<{
                            language: z.ZodEnum<{
                                de: "de";
                                en: "en";
                            }>;
                            citationStyle: z.ZodEnum<{
                                acs: "acs";
                                ama: "ama";
                                apa: "apa";
                                chicago: "chicago";
                                "din-iso-690": "din-iso-690";
                                harvard: "harvard";
                                ieee: "ieee";
                                mla: "mla";
                                oxford: "oxford";
                                springer: "springer";
                                vancouver: "vancouver";
                            }>;
                        }, z.core.$strict>>;
                    }, z.core.$strict> | z.ZodObject<{
                        action: z.ZodEnum<{
                            "account-deletion": "account-deletion";
                            "email-change": "email-change";
                        }>;
                        language: z.ZodEnum<{
                            de: "de";
                            en: "en";
                        }>;
                    }, z.core.$strict> | z.ZodObject<{
                        newEmail: z.ZodEmail;
                        language: z.ZodEnum<{
                            de: "de";
                            en: "en";
                        }>;
                    }, z.core.$strict> | z.ZodObject<{
                        billingRetentionAcknowledged: z.ZodLiteral<true>;
                        billingRetentionYears: z.ZodLiteral<8>;
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
                            accountId: z.ZodUUID;
                            ownerId: z.ZodUUID;
                            email: z.ZodEmail;
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
                    }, z.core.$strip> | z.ZodObject<{
                        data: z.ZodObject<{
                            challengeId: z.ZodUUID;
                            expiresIn: z.ZodNumber;
                            resendAfter: z.ZodNumber;
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
                    }, z.core.$strip> | z.ZodObject<{
                        data: z.ZodObject<{
                            challengeId: z.ZodUUID;
                            action: z.ZodEnum<{
                                "account-deletion": "account-deletion";
                                "email-change": "email-change";
                            }>;
                            expiresIn: z.ZodNumber;
                            resendAfter: z.ZodNumber;
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
                    }, z.core.$strip> | z.ZodObject<{
                        data: z.ZodObject<{
                            action: z.ZodEnum<{
                                "account-deletion": "account-deletion";
                                "email-change": "email-change";
                            }>;
                            expiresAt: z.ZodISODateTime;
                            expiresIn: z.ZodNumber;
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
                    }, z.core.$strip> | z.ZodObject<{
                        data: z.ZodObject<{
                            status: z.ZodEnum<{
                                deleted: "deleted";
                                "in-progress": "in-progress";
                            }>;
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
        501: {
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
} & {
    getRoutingPath(): `/v1/account${string}` | `/v1/extension/account${string}`;
}];
export declare const extensionSensitiveRoutes: readonly [{
    method: "post";
    path: `/v1/account${string}` | `/v1/extension/account${string}`;
    summary: string;
    security?: {
        ExtensionSession: never[];
    }[] | undefined;
    request: {
        body: {
            required: true;
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        challengeId: z.ZodUUID;
                        code: z.ZodString;
                        preferences: z.ZodOptional<z.ZodObject<{
                            language: z.ZodEnum<{
                                de: "de";
                                en: "en";
                            }>;
                            citationStyle: z.ZodEnum<{
                                acs: "acs";
                                ama: "ama";
                                apa: "apa";
                                chicago: "chicago";
                                "din-iso-690": "din-iso-690";
                                harvard: "harvard";
                                ieee: "ieee";
                                mla: "mla";
                                oxford: "oxford";
                                springer: "springer";
                                vancouver: "vancouver";
                            }>;
                        }, z.core.$strict>>;
                    }, z.core.$strict> | z.ZodObject<{
                        action: z.ZodEnum<{
                            "account-deletion": "account-deletion";
                            "email-change": "email-change";
                        }>;
                        language: z.ZodEnum<{
                            de: "de";
                            en: "en";
                        }>;
                    }, z.core.$strict> | z.ZodObject<{
                        newEmail: z.ZodEmail;
                        language: z.ZodEnum<{
                            de: "de";
                            en: "en";
                        }>;
                    }, z.core.$strict> | z.ZodObject<{
                        billingRetentionAcknowledged: z.ZodLiteral<true>;
                        billingRetentionYears: z.ZodLiteral<8>;
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
                            accountId: z.ZodUUID;
                            ownerId: z.ZodUUID;
                            email: z.ZodEmail;
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
                    }, z.core.$strip> | z.ZodObject<{
                        data: z.ZodObject<{
                            challengeId: z.ZodUUID;
                            expiresIn: z.ZodNumber;
                            resendAfter: z.ZodNumber;
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
                    }, z.core.$strip> | z.ZodObject<{
                        data: z.ZodObject<{
                            challengeId: z.ZodUUID;
                            action: z.ZodEnum<{
                                "account-deletion": "account-deletion";
                                "email-change": "email-change";
                            }>;
                            expiresIn: z.ZodNumber;
                            resendAfter: z.ZodNumber;
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
                    }, z.core.$strip> | z.ZodObject<{
                        data: z.ZodObject<{
                            action: z.ZodEnum<{
                                "account-deletion": "account-deletion";
                                "email-change": "email-change";
                            }>;
                            expiresAt: z.ZodISODateTime;
                            expiresIn: z.ZodNumber;
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
                    }, z.core.$strip> | z.ZodObject<{
                        data: z.ZodObject<{
                            status: z.ZodEnum<{
                                deleted: "deleted";
                                "in-progress": "in-progress";
                            }>;
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
        501: {
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
} & {
    getRoutingPath(): `/v1/account${string}` | `/v1/extension/account${string}`;
}, {
    method: "post";
    path: `/v1/account${string}` | `/v1/extension/account${string}`;
    summary: string;
    security?: {
        ExtensionSession: never[];
    }[] | undefined;
    request: {
        body: {
            required: true;
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        challengeId: z.ZodUUID;
                        code: z.ZodString;
                        preferences: z.ZodOptional<z.ZodObject<{
                            language: z.ZodEnum<{
                                de: "de";
                                en: "en";
                            }>;
                            citationStyle: z.ZodEnum<{
                                acs: "acs";
                                ama: "ama";
                                apa: "apa";
                                chicago: "chicago";
                                "din-iso-690": "din-iso-690";
                                harvard: "harvard";
                                ieee: "ieee";
                                mla: "mla";
                                oxford: "oxford";
                                springer: "springer";
                                vancouver: "vancouver";
                            }>;
                        }, z.core.$strict>>;
                    }, z.core.$strict> | z.ZodObject<{
                        action: z.ZodEnum<{
                            "account-deletion": "account-deletion";
                            "email-change": "email-change";
                        }>;
                        language: z.ZodEnum<{
                            de: "de";
                            en: "en";
                        }>;
                    }, z.core.$strict> | z.ZodObject<{
                        newEmail: z.ZodEmail;
                        language: z.ZodEnum<{
                            de: "de";
                            en: "en";
                        }>;
                    }, z.core.$strict> | z.ZodObject<{
                        billingRetentionAcknowledged: z.ZodLiteral<true>;
                        billingRetentionYears: z.ZodLiteral<8>;
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
                            accountId: z.ZodUUID;
                            ownerId: z.ZodUUID;
                            email: z.ZodEmail;
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
                    }, z.core.$strip> | z.ZodObject<{
                        data: z.ZodObject<{
                            challengeId: z.ZodUUID;
                            expiresIn: z.ZodNumber;
                            resendAfter: z.ZodNumber;
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
                    }, z.core.$strip> | z.ZodObject<{
                        data: z.ZodObject<{
                            challengeId: z.ZodUUID;
                            action: z.ZodEnum<{
                                "account-deletion": "account-deletion";
                                "email-change": "email-change";
                            }>;
                            expiresIn: z.ZodNumber;
                            resendAfter: z.ZodNumber;
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
                    }, z.core.$strip> | z.ZodObject<{
                        data: z.ZodObject<{
                            action: z.ZodEnum<{
                                "account-deletion": "account-deletion";
                                "email-change": "email-change";
                            }>;
                            expiresAt: z.ZodISODateTime;
                            expiresIn: z.ZodNumber;
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
                    }, z.core.$strip> | z.ZodObject<{
                        data: z.ZodObject<{
                            status: z.ZodEnum<{
                                deleted: "deleted";
                                "in-progress": "in-progress";
                            }>;
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
        501: {
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
} & {
    getRoutingPath(): `/v1/account${string}` | `/v1/extension/account${string}`;
}, {
    method: "post";
    path: `/v1/account${string}` | `/v1/extension/account${string}`;
    summary: string;
    security?: {
        ExtensionSession: never[];
    }[] | undefined;
    request: {
        body: {
            required: true;
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        challengeId: z.ZodUUID;
                        code: z.ZodString;
                        preferences: z.ZodOptional<z.ZodObject<{
                            language: z.ZodEnum<{
                                de: "de";
                                en: "en";
                            }>;
                            citationStyle: z.ZodEnum<{
                                acs: "acs";
                                ama: "ama";
                                apa: "apa";
                                chicago: "chicago";
                                "din-iso-690": "din-iso-690";
                                harvard: "harvard";
                                ieee: "ieee";
                                mla: "mla";
                                oxford: "oxford";
                                springer: "springer";
                                vancouver: "vancouver";
                            }>;
                        }, z.core.$strict>>;
                    }, z.core.$strict> | z.ZodObject<{
                        action: z.ZodEnum<{
                            "account-deletion": "account-deletion";
                            "email-change": "email-change";
                        }>;
                        language: z.ZodEnum<{
                            de: "de";
                            en: "en";
                        }>;
                    }, z.core.$strict> | z.ZodObject<{
                        newEmail: z.ZodEmail;
                        language: z.ZodEnum<{
                            de: "de";
                            en: "en";
                        }>;
                    }, z.core.$strict> | z.ZodObject<{
                        billingRetentionAcknowledged: z.ZodLiteral<true>;
                        billingRetentionYears: z.ZodLiteral<8>;
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
                            accountId: z.ZodUUID;
                            ownerId: z.ZodUUID;
                            email: z.ZodEmail;
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
                    }, z.core.$strip> | z.ZodObject<{
                        data: z.ZodObject<{
                            challengeId: z.ZodUUID;
                            expiresIn: z.ZodNumber;
                            resendAfter: z.ZodNumber;
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
                    }, z.core.$strip> | z.ZodObject<{
                        data: z.ZodObject<{
                            challengeId: z.ZodUUID;
                            action: z.ZodEnum<{
                                "account-deletion": "account-deletion";
                                "email-change": "email-change";
                            }>;
                            expiresIn: z.ZodNumber;
                            resendAfter: z.ZodNumber;
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
                    }, z.core.$strip> | z.ZodObject<{
                        data: z.ZodObject<{
                            action: z.ZodEnum<{
                                "account-deletion": "account-deletion";
                                "email-change": "email-change";
                            }>;
                            expiresAt: z.ZodISODateTime;
                            expiresIn: z.ZodNumber;
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
                    }, z.core.$strip> | z.ZodObject<{
                        data: z.ZodObject<{
                            status: z.ZodEnum<{
                                deleted: "deleted";
                                "in-progress": "in-progress";
                            }>;
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
        501: {
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
} & {
    getRoutingPath(): `/v1/account${string}` | `/v1/extension/account${string}`;
}, {
    method: "post";
    path: `/v1/account${string}` | `/v1/extension/account${string}`;
    summary: string;
    security?: {
        ExtensionSession: never[];
    }[] | undefined;
    request: {
        body: {
            required: true;
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        challengeId: z.ZodUUID;
                        code: z.ZodString;
                        preferences: z.ZodOptional<z.ZodObject<{
                            language: z.ZodEnum<{
                                de: "de";
                                en: "en";
                            }>;
                            citationStyle: z.ZodEnum<{
                                acs: "acs";
                                ama: "ama";
                                apa: "apa";
                                chicago: "chicago";
                                "din-iso-690": "din-iso-690";
                                harvard: "harvard";
                                ieee: "ieee";
                                mla: "mla";
                                oxford: "oxford";
                                springer: "springer";
                                vancouver: "vancouver";
                            }>;
                        }, z.core.$strict>>;
                    }, z.core.$strict> | z.ZodObject<{
                        action: z.ZodEnum<{
                            "account-deletion": "account-deletion";
                            "email-change": "email-change";
                        }>;
                        language: z.ZodEnum<{
                            de: "de";
                            en: "en";
                        }>;
                    }, z.core.$strict> | z.ZodObject<{
                        newEmail: z.ZodEmail;
                        language: z.ZodEnum<{
                            de: "de";
                            en: "en";
                        }>;
                    }, z.core.$strict> | z.ZodObject<{
                        billingRetentionAcknowledged: z.ZodLiteral<true>;
                        billingRetentionYears: z.ZodLiteral<8>;
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
                            accountId: z.ZodUUID;
                            ownerId: z.ZodUUID;
                            email: z.ZodEmail;
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
                    }, z.core.$strip> | z.ZodObject<{
                        data: z.ZodObject<{
                            challengeId: z.ZodUUID;
                            expiresIn: z.ZodNumber;
                            resendAfter: z.ZodNumber;
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
                    }, z.core.$strip> | z.ZodObject<{
                        data: z.ZodObject<{
                            challengeId: z.ZodUUID;
                            action: z.ZodEnum<{
                                "account-deletion": "account-deletion";
                                "email-change": "email-change";
                            }>;
                            expiresIn: z.ZodNumber;
                            resendAfter: z.ZodNumber;
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
                    }, z.core.$strip> | z.ZodObject<{
                        data: z.ZodObject<{
                            action: z.ZodEnum<{
                                "account-deletion": "account-deletion";
                                "email-change": "email-change";
                            }>;
                            expiresAt: z.ZodISODateTime;
                            expiresIn: z.ZodNumber;
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
                    }, z.core.$strip> | z.ZodObject<{
                        data: z.ZodObject<{
                            status: z.ZodEnum<{
                                deleted: "deleted";
                                "in-progress": "in-progress";
                            }>;
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
        501: {
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
} & {
    getRoutingPath(): `/v1/account${string}` | `/v1/extension/account${string}`;
}, {
    method: "post";
    path: `/v1/account${string}` | `/v1/extension/account${string}`;
    summary: string;
    security?: {
        ExtensionSession: never[];
    }[] | undefined;
    request: {
        body: {
            required: true;
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        challengeId: z.ZodUUID;
                        code: z.ZodString;
                        preferences: z.ZodOptional<z.ZodObject<{
                            language: z.ZodEnum<{
                                de: "de";
                                en: "en";
                            }>;
                            citationStyle: z.ZodEnum<{
                                acs: "acs";
                                ama: "ama";
                                apa: "apa";
                                chicago: "chicago";
                                "din-iso-690": "din-iso-690";
                                harvard: "harvard";
                                ieee: "ieee";
                                mla: "mla";
                                oxford: "oxford";
                                springer: "springer";
                                vancouver: "vancouver";
                            }>;
                        }, z.core.$strict>>;
                    }, z.core.$strict> | z.ZodObject<{
                        action: z.ZodEnum<{
                            "account-deletion": "account-deletion";
                            "email-change": "email-change";
                        }>;
                        language: z.ZodEnum<{
                            de: "de";
                            en: "en";
                        }>;
                    }, z.core.$strict> | z.ZodObject<{
                        newEmail: z.ZodEmail;
                        language: z.ZodEnum<{
                            de: "de";
                            en: "en";
                        }>;
                    }, z.core.$strict> | z.ZodObject<{
                        billingRetentionAcknowledged: z.ZodLiteral<true>;
                        billingRetentionYears: z.ZodLiteral<8>;
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
                            accountId: z.ZodUUID;
                            ownerId: z.ZodUUID;
                            email: z.ZodEmail;
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
                    }, z.core.$strip> | z.ZodObject<{
                        data: z.ZodObject<{
                            challengeId: z.ZodUUID;
                            expiresIn: z.ZodNumber;
                            resendAfter: z.ZodNumber;
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
                    }, z.core.$strip> | z.ZodObject<{
                        data: z.ZodObject<{
                            challengeId: z.ZodUUID;
                            action: z.ZodEnum<{
                                "account-deletion": "account-deletion";
                                "email-change": "email-change";
                            }>;
                            expiresIn: z.ZodNumber;
                            resendAfter: z.ZodNumber;
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
                    }, z.core.$strip> | z.ZodObject<{
                        data: z.ZodObject<{
                            action: z.ZodEnum<{
                                "account-deletion": "account-deletion";
                                "email-change": "email-change";
                            }>;
                            expiresAt: z.ZodISODateTime;
                            expiresIn: z.ZodNumber;
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
                    }, z.core.$strip> | z.ZodObject<{
                        data: z.ZodObject<{
                            status: z.ZodEnum<{
                                deleted: "deleted";
                                "in-progress": "in-progress";
                            }>;
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
        501: {
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
} & {
    getRoutingPath(): `/v1/account${string}` | `/v1/extension/account${string}`;
}];
export declare const getCommerceCatalog: {
    method: "get";
    path: "/v1/commerce/catalog";
    summary: string;
    responses: {
        200: {
            description: string;
            content: {
                "application/json": {
                    schema: z.ZodObject<{
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
} & {
    getRoutingPath(): "/v1/commerce/catalog";
};
export declare const createCheckPackOrder: {
    method: "post";
    path: "/v1/commerce/orders";
    summary: string;
    request: {
        body: {
            required: true;
            content: {
                "application/json": {
                    schema: z.ZodObject<{
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
} & {
    getRoutingPath(): "/v1/commerce/orders";
};
export declare const getCheckPackOrders: {
    method: "get";
    path: "/v1/commerce/orders";
    summary: string;
    responses: {
        200: {
            description: string;
            content: {
                "application/json": {
                    schema: z.ZodObject<{
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
} & {
    getRoutingPath(): "/v1/commerce/orders";
};
export declare const getCommerceInvoice: {
    method: "get";
    path: "/v1/commerce/invoices/{id}";
    summary: string;
    request: {
        params: z.ZodObject<{
            id: z.ZodString;
        }, z.core.$strip>;
    };
    responses: {
        200: {
            description: string;
            content: {
                "application/pdf": {
                    schema: z.ZodString;
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
} & {
    getRoutingPath(): "/v1/commerce/invoices/:id";
};
export declare const createSubscription: {
    method: "post";
    path: "/v1/commerce/subscriptions";
    summary: string;
    request: {
        body: {
            required: true;
            content: {
                "application/json": {
                    schema: z.ZodObject<{
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
} & {
    getRoutingPath(): "/v1/commerce/subscriptions";
};
export declare const getSubscriptions: {
    method: "get";
    path: "/v1/commerce/subscriptions";
    summary: string;
    responses: {
        200: {
            description: string;
            content: {
                "application/json": {
                    schema: z.ZodObject<{
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
} & {
    getRoutingPath(): "/v1/commerce/subscriptions";
};
export declare const cancelSubscription: {
    method: "post";
    path: "/v1/commerce/subscriptions/{id}/cancel";
    summary: string;
    request: {
        params: z.ZodObject<{
            id: z.ZodUUID;
        }, z.core.$strip>;
        body: {
            required: true;
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        operationKey: z.ZodUUID;
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
} & {
    getRoutingPath(): "/v1/commerce/subscriptions/:id/cancel";
};
export declare const consentSubscription: {
    method: "post";
    path: "/v1/commerce/subscriptions/{id}/consent";
    summary: string;
    request: {
        params: z.ZodObject<{
            id: z.ZodUUID;
        }, z.core.$strip>;
        body: {
            required: true;
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        operationKey: z.ZodUUID;
                        legalVersion: z.ZodString;
                        immediateStart: z.ZodLiteral<true>;
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
} & {
    getRoutingPath(): "/v1/commerce/subscriptions/:id/consent";
};
export declare const validateCommerceVat: {
    method: "post";
    path: "/v1/commerce/vat-validations";
    summary: string;
    request: {
        body: {
            required: true;
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        country: z.ZodString;
                        vatId: z.ZodString;
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
} & {
    getRoutingPath(): "/v1/commerce/vat-validations";
};
export declare const getCommerceInvoices: {
    method: "get";
    path: "/v1/commerce/invoices";
    summary: string;
    request: {
        query: z.ZodObject<{
            after: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>;
    };
    responses: {
        200: {
            description: string;
            content: {
                "application/json": {
                    schema: z.ZodObject<{
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
} & {
    getRoutingPath(): "/v1/commerce/invoices";
};
export declare const getCommerceStructuredInvoice: {
    method: "get";
    path: "/v1/commerce/invoices/{id}/ubl";
    summary: string;
    request: {
        params: z.ZodObject<{
            id: z.ZodString;
        }, z.core.$strip>;
    };
    responses: {
        200: {
            description: string;
            content: {
                "application/xml": {
                    schema: z.ZodString;
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
} & {
    getRoutingPath(): "/v1/commerce/invoices/:id/ubl";
};
export declare const extensionCommerceInvoices: {
    getRoutingPath(): "/v1/commerce/invoices";
    method: "get";
    summary: string;
    request: {
        query: z.ZodObject<{
            after: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>;
    };
    responses: {
        200: {
            description: string;
            content: {
                "application/json": {
                    schema: z.ZodObject<{
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
    path: "/v1/extension/commerce/invoices";
} & {
    getRoutingPath(): "/v1/extension/commerce/invoices";
};
export declare const extensionCommerceInvoice: {
    getRoutingPath(): "/v1/commerce/invoices/:id";
    method: "get";
    summary: string;
    request: {
        params: z.ZodObject<{
            id: z.ZodString;
        }, z.core.$strip>;
    };
    responses: {
        200: {
            description: string;
            content: {
                "application/pdf": {
                    schema: z.ZodString;
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
    path: "/v1/extension/commerce/invoices/{id}";
} & {
    getRoutingPath(): "/v1/extension/commerce/invoices/:id";
};
export declare const extensionCommerceStructuredInvoice: {
    getRoutingPath(): "/v1/commerce/invoices/:id/ubl";
    method: "get";
    summary: string;
    request: {
        params: z.ZodObject<{
            id: z.ZodString;
        }, z.core.$strip>;
    };
    responses: {
        200: {
            description: string;
            content: {
                "application/xml": {
                    schema: z.ZodString;
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
    path: "/v1/extension/commerce/invoices/{id}/ubl";
} & {
    getRoutingPath(): "/v1/extension/commerce/invoices/:id/ubl";
};
export declare const routes: ((({
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
}) | (({
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
}) | (({
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
}) | (({
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
}) | (({
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
}) | (({
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
}) | ({
    method: "get";
    path: "/v1/status";
    summary: string;
    responses: {
        200: {
            description: string;
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        data: z.ZodObject<{
                            program: z.ZodLiteral<"service">;
                            status: z.ZodLiteral<"ready">;
                            authentication: z.ZodLiteral<"unavailable">;
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
                };
            };
        };
    };
} & {
    getRoutingPath(): "/v1/status";
}) | ({
    method: "post";
    path: "/v1/guest-tokens";
    summary: string;
    request: {
        body: {
            required: true;
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        guestId: z.ZodUUID;
                        client: z.ZodEnum<{
                            extension: "extension";
                            web: "web";
                        }>;
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
                            accessToken: z.ZodString;
                            tokenType: z.ZodLiteral<"Bearer">;
                            expiresAt: z.ZodISODateTime;
                            expiresIn: z.ZodLiteral<300>;
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
} & {
    getRoutingPath(): "/v1/guest-tokens";
}) | ({
    method: "get";
    path: "/.well-known/jwks.json";
    summary: string;
    responses: {
        200: {
            description: string;
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        keys: z.ZodArray<z.ZodObject<{
                            kty: z.ZodLiteral<"OKP">;
                            crv: z.ZodLiteral<"Ed25519">;
                            x: z.ZodString;
                            kid: z.ZodString;
                            alg: z.ZodLiteral<"EdDSA">;
                            use: z.ZodLiteral<"sig">;
                        }, z.core.$strict>>;
                    }, z.core.$strict>;
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
} & {
    getRoutingPath(): "/.well-known/jwks.json";
}) | ({
    method: "post";
    path: string;
    summary: string;
    request: {
        body: {
            required: true;
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        email: z.ZodEmail;
                        language: z.ZodEnum<{
                            de: "de";
                            en: "en";
                        }>;
                    }, z.core.$strict> | z.ZodObject<{
                        challengeId: z.ZodUUID;
                        code: z.ZodString;
                        preferences: z.ZodOptional<z.ZodObject<{
                            language: z.ZodEnum<{
                                de: "de";
                                en: "en";
                            }>;
                            citationStyle: z.ZodEnum<{
                                acs: "acs";
                                ama: "ama";
                                apa: "apa";
                                chicago: "chicago";
                                "din-iso-690": "din-iso-690";
                                harvard: "harvard";
                                ieee: "ieee";
                                mla: "mla";
                                oxford: "oxford";
                                springer: "springer";
                                vancouver: "vancouver";
                            }>;
                        }, z.core.$strict>>;
                    }, z.core.$strict> | z.ZodObject<{
                        everywhere: z.ZodBoolean;
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
                            accountId: z.ZodUUID;
                            ownerId: z.ZodUUID;
                            email: z.ZodEmail;
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
                    }, z.core.$strip> | z.ZodObject<{
                        data: z.ZodObject<{
                            challengeId: z.ZodUUID;
                            expiresIn: z.ZodNumber;
                            resendAfter: z.ZodNumber;
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
                    }, z.core.$strip> | z.ZodObject<{
                        data: z.ZodObject<{
                            signedOut: z.ZodLiteral<true>;
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
} & {
    getRoutingPath(): string;
}) | ({
    method: "get";
    path: "/v1/session";
    summary: string;
    responses: {
        200: {
            description: string;
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        data: z.ZodObject<{
                            accountId: z.ZodUUID;
                            ownerId: z.ZodUUID;
                            email: z.ZodEmail;
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
} & {
    getRoutingPath(): "/v1/session";
}) | ({
    method: "post";
    path: "/v1/session/activity";
    summary: string;
    responses: {
        200: {
            description: string;
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        data: z.ZodObject<{
                            accountId: z.ZodUUID;
                            ownerId: z.ZodUUID;
                            email: z.ZodEmail;
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
} & {
    getRoutingPath(): "/v1/session/activity";
}) | ({
    method: "post";
    path: "/v1/account-tokens";
    summary: string;
    responses: {
        200: {
            description: string;
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        data: z.ZodObject<{
                            accessToken: z.ZodString;
                            tokenType: z.ZodLiteral<"Bearer">;
                            expiresAt: z.ZodISODateTime;
                            expiresIn: z.ZodLiteral<300>;
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
} & {
    getRoutingPath(): "/v1/account-tokens";
}) | ({
    method: "get" | "post";
    path: `/v1/extension${string}`;
    summary: string;
    security?: {
        ExtensionSession: never[];
    }[] | undefined;
    request?: {
        body: {
            required: true;
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        email: z.ZodEmail;
                        language: z.ZodEnum<{
                            de: "de";
                            en: "en";
                        }>;
                    }, z.core.$strict> | z.ZodObject<{
                        everywhere: z.ZodBoolean;
                    }, z.core.$strict> | z.ZodObject<{
                        challengeId: z.ZodUUID;
                        code: z.ZodString;
                        preferences: z.ZodOptional<z.ZodObject<{
                            language: z.ZodEnum<{
                                de: "de";
                                en: "en";
                            }>;
                            citationStyle: z.ZodEnum<{
                                acs: "acs";
                                ama: "ama";
                                apa: "apa";
                                chicago: "chicago";
                                "din-iso-690": "din-iso-690";
                                harvard: "harvard";
                                ieee: "ieee";
                                mla: "mla";
                                oxford: "oxford";
                                springer: "springer";
                                vancouver: "vancouver";
                            }>;
                        }, z.core.$strict>>;
                        transactionCredential: z.ZodString;
                    }, z.core.$strict>;
                };
            };
        };
    } | undefined;
    responses: {
        200: {
            description: string;
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        data: z.ZodObject<{
                            accessToken: z.ZodString;
                            tokenType: z.ZodLiteral<"Bearer">;
                            expiresAt: z.ZodISODateTime;
                            expiresIn: z.ZodLiteral<300>;
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
                    }, z.core.$strip> | z.ZodObject<{
                        data: z.ZodObject<{
                            accountId: z.ZodUUID;
                            ownerId: z.ZodUUID;
                            email: z.ZodEmail;
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
                    }, z.core.$strip> | z.ZodObject<{
                        data: z.ZodObject<{
                            signedOut: z.ZodLiteral<true>;
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
                    }, z.core.$strip> | z.ZodObject<{
                        data: z.ZodObject<{
                            challengeId: z.ZodUUID;
                            expiresIn: z.ZodNumber;
                            resendAfter: z.ZodNumber;
                            transactionCredential: z.ZodString;
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
                    }, z.core.$strip> | z.ZodObject<{
                        data: z.ZodObject<{
                            session: z.ZodObject<{
                                accountId: z.ZodUUID;
                                ownerId: z.ZodUUID;
                                email: z.ZodEmail;
                            }, z.core.$strict>;
                            sessionCredential: z.ZodString;
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
} & {
    getRoutingPath(): `/v1/extension${string}`;
}) | ({
    method: "get" | "patch";
    path: "/v1/extension/preferences" | "/v1/preferences";
    summary: string;
    security?: {
        ExtensionSession: never[];
    }[] | undefined;
    request?: {
        body: {
            required: true;
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        language: z.ZodOptional<z.ZodEnum<{
                            de: "de";
                            en: "en";
                        }>>;
                        citationStyle: z.ZodOptional<z.ZodEnum<{
                            acs: "acs";
                            ama: "ama";
                            apa: "apa";
                            chicago: "chicago";
                            "din-iso-690": "din-iso-690";
                            harvard: "harvard";
                            ieee: "ieee";
                            mla: "mla";
                            oxford: "oxford";
                            springer: "springer";
                            vancouver: "vancouver";
                        }>>;
                    }, z.core.$strict>;
                };
            };
        };
    } | undefined;
    responses: {
        200: {
            description: string;
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        data: z.ZodObject<{
                            language: z.ZodEnum<{
                                de: "de";
                                en: "en";
                            }>;
                            citationStyle: z.ZodString;
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
} & {
    getRoutingPath(): "/v1/extension/preferences" | "/v1/preferences";
}) | ({
    method: "post";
    path: `/v1/account${string}` | `/v1/extension/account${string}`;
    summary: string;
    security?: {
        ExtensionSession: never[];
    }[] | undefined;
    request: {
        body: {
            required: true;
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        challengeId: z.ZodUUID;
                        code: z.ZodString;
                        preferences: z.ZodOptional<z.ZodObject<{
                            language: z.ZodEnum<{
                                de: "de";
                                en: "en";
                            }>;
                            citationStyle: z.ZodEnum<{
                                acs: "acs";
                                ama: "ama";
                                apa: "apa";
                                chicago: "chicago";
                                "din-iso-690": "din-iso-690";
                                harvard: "harvard";
                                ieee: "ieee";
                                mla: "mla";
                                oxford: "oxford";
                                springer: "springer";
                                vancouver: "vancouver";
                            }>;
                        }, z.core.$strict>>;
                    }, z.core.$strict> | z.ZodObject<{
                        action: z.ZodEnum<{
                            "account-deletion": "account-deletion";
                            "email-change": "email-change";
                        }>;
                        language: z.ZodEnum<{
                            de: "de";
                            en: "en";
                        }>;
                    }, z.core.$strict> | z.ZodObject<{
                        newEmail: z.ZodEmail;
                        language: z.ZodEnum<{
                            de: "de";
                            en: "en";
                        }>;
                    }, z.core.$strict> | z.ZodObject<{
                        billingRetentionAcknowledged: z.ZodLiteral<true>;
                        billingRetentionYears: z.ZodLiteral<8>;
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
                            accountId: z.ZodUUID;
                            ownerId: z.ZodUUID;
                            email: z.ZodEmail;
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
                    }, z.core.$strip> | z.ZodObject<{
                        data: z.ZodObject<{
                            challengeId: z.ZodUUID;
                            expiresIn: z.ZodNumber;
                            resendAfter: z.ZodNumber;
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
                    }, z.core.$strip> | z.ZodObject<{
                        data: z.ZodObject<{
                            challengeId: z.ZodUUID;
                            action: z.ZodEnum<{
                                "account-deletion": "account-deletion";
                                "email-change": "email-change";
                            }>;
                            expiresIn: z.ZodNumber;
                            resendAfter: z.ZodNumber;
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
                    }, z.core.$strip> | z.ZodObject<{
                        data: z.ZodObject<{
                            action: z.ZodEnum<{
                                "account-deletion": "account-deletion";
                                "email-change": "email-change";
                            }>;
                            expiresAt: z.ZodISODateTime;
                            expiresIn: z.ZodNumber;
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
                    }, z.core.$strip> | z.ZodObject<{
                        data: z.ZodObject<{
                            status: z.ZodEnum<{
                                deleted: "deleted";
                                "in-progress": "in-progress";
                            }>;
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
        501: {
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
} & {
    getRoutingPath(): `/v1/account${string}` | `/v1/extension/account${string}`;
}) | ({
    method: "get";
    path: "/v1/commerce/catalog";
    summary: string;
    responses: {
        200: {
            description: string;
            content: {
                "application/json": {
                    schema: z.ZodObject<{
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
} & {
    getRoutingPath(): "/v1/commerce/catalog";
}) | ({
    method: "post";
    path: "/v1/commerce/orders";
    summary: string;
    request: {
        body: {
            required: true;
            content: {
                "application/json": {
                    schema: z.ZodObject<{
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
} & {
    getRoutingPath(): "/v1/commerce/orders";
}) | ({
    method: "get";
    path: "/v1/commerce/orders";
    summary: string;
    responses: {
        200: {
            description: string;
            content: {
                "application/json": {
                    schema: z.ZodObject<{
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
} & {
    getRoutingPath(): "/v1/commerce/orders";
}) | ({
    method: "get";
    path: "/v1/commerce/invoices/{id}";
    summary: string;
    request: {
        params: z.ZodObject<{
            id: z.ZodString;
        }, z.core.$strip>;
    };
    responses: {
        200: {
            description: string;
            content: {
                "application/pdf": {
                    schema: z.ZodString;
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
} & {
    getRoutingPath(): "/v1/commerce/invoices/:id";
}) | ({
    method: "post";
    path: "/v1/commerce/subscriptions";
    summary: string;
    request: {
        body: {
            required: true;
            content: {
                "application/json": {
                    schema: z.ZodObject<{
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
} & {
    getRoutingPath(): "/v1/commerce/subscriptions";
}) | ({
    method: "get";
    path: "/v1/commerce/subscriptions";
    summary: string;
    responses: {
        200: {
            description: string;
            content: {
                "application/json": {
                    schema: z.ZodObject<{
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
} & {
    getRoutingPath(): "/v1/commerce/subscriptions";
}) | ({
    method: "post";
    path: "/v1/commerce/subscriptions/{id}/cancel";
    summary: string;
    request: {
        params: z.ZodObject<{
            id: z.ZodUUID;
        }, z.core.$strip>;
        body: {
            required: true;
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        operationKey: z.ZodUUID;
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
} & {
    getRoutingPath(): "/v1/commerce/subscriptions/:id/cancel";
}) | ({
    method: "post";
    path: "/v1/commerce/subscriptions/{id}/consent";
    summary: string;
    request: {
        params: z.ZodObject<{
            id: z.ZodUUID;
        }, z.core.$strip>;
        body: {
            required: true;
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        operationKey: z.ZodUUID;
                        legalVersion: z.ZodString;
                        immediateStart: z.ZodLiteral<true>;
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
} & {
    getRoutingPath(): "/v1/commerce/subscriptions/:id/consent";
}) | ({
    method: "post";
    path: "/v1/commerce/vat-validations";
    summary: string;
    request: {
        body: {
            required: true;
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        country: z.ZodString;
                        vatId: z.ZodString;
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
} & {
    getRoutingPath(): "/v1/commerce/vat-validations";
}) | ({
    method: "get";
    path: "/v1/commerce/invoices";
    summary: string;
    request: {
        query: z.ZodObject<{
            after: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>;
    };
    responses: {
        200: {
            description: string;
            content: {
                "application/json": {
                    schema: z.ZodObject<{
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
} & {
    getRoutingPath(): "/v1/commerce/invoices";
}) | ({
    method: "get";
    path: "/v1/commerce/invoices/{id}/ubl";
    summary: string;
    request: {
        params: z.ZodObject<{
            id: z.ZodString;
        }, z.core.$strip>;
    };
    responses: {
        200: {
            description: string;
            content: {
                "application/xml": {
                    schema: z.ZodString;
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
} & {
    getRoutingPath(): "/v1/commerce/invoices/:id/ubl";
}) | ({
    getRoutingPath(): "/v1/commerce/invoices";
    method: "get";
    summary: string;
    request: {
        query: z.ZodObject<{
            after: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>;
    };
    responses: {
        200: {
            description: string;
            content: {
                "application/json": {
                    schema: z.ZodObject<{
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
    path: "/v1/extension/commerce/invoices";
} & {
    getRoutingPath(): "/v1/extension/commerce/invoices";
}) | ({
    getRoutingPath(): "/v1/commerce/invoices/:id";
    method: "get";
    summary: string;
    request: {
        params: z.ZodObject<{
            id: z.ZodString;
        }, z.core.$strip>;
    };
    responses: {
        200: {
            description: string;
            content: {
                "application/pdf": {
                    schema: z.ZodString;
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
    path: "/v1/extension/commerce/invoices/{id}";
} & {
    getRoutingPath(): "/v1/extension/commerce/invoices/:id";
}) | ({
    getRoutingPath(): "/v1/commerce/invoices/:id/ubl";
    method: "get";
    summary: string;
    request: {
        params: z.ZodObject<{
            id: z.ZodString;
        }, z.core.$strip>;
    };
    responses: {
        200: {
            description: string;
            content: {
                "application/xml": {
                    schema: z.ZodString;
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
    path: "/v1/extension/commerce/invoices/{id}/ubl";
} & {
    getRoutingPath(): "/v1/extension/commerce/invoices/:id/ubl";
}))[];
