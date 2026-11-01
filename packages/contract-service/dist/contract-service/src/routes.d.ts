export declare const getServiceStatus: {
    method: "get";
    path: "/v1/status";
    summary: string;
    responses: {
        200: {
            description: string;
            content: {
                "application/json": {
                    schema: import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            program: import("zod").ZodLiteral<"service">;
                            status: import("zod").ZodLiteral<"ready">;
                            authentication: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strip>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip>;
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
                    schema: import("zod").ZodObject<{
                        guestId: import("zod").ZodUUID;
                        client: import("zod").ZodEnum<{
                            extension: "extension";
                            web: "web";
                        }>;
                    }, import("zod/v4/core").$strict>;
                };
            };
        };
    };
    responses: {
        200: {
            description: string;
            content: {
                "application/json": {
                    schema: import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            accessToken: import("zod").ZodString;
                            tokenType: import("zod").ZodLiteral<"Bearer">;
                            expiresAt: import("zod").ZodISODateTime;
                            expiresIn: import("zod").ZodLiteral<300>;
                        }, import("zod/v4/core").$strict>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        400: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        403: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        503: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
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
                    schema: import("zod").ZodObject<{
                        keys: import("zod").ZodArray<import("zod").ZodObject<{
                            kty: import("zod").ZodLiteral<"OKP">;
                            crv: import("zod").ZodLiteral<"Ed25519">;
                            x: import("zod").ZodString;
                            kid: import("zod").ZodString;
                            alg: import("zod").ZodLiteral<"EdDSA">;
                            use: import("zod").ZodLiteral<"sig">;
                        }, import("zod/v4/core").$strict>>;
                    }, import("zod/v4/core").$strict>;
                };
            };
        };
        503: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
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
                    schema: import("zod").ZodObject<{
                        email: import("zod").ZodEmail;
                        language: import("zod").ZodEnum<{
                            de: "de";
                            en: "en";
                        }>;
                    }, import("zod/v4/core").$strict> | import("zod").ZodObject<{
                        challengeId: import("zod").ZodUUID;
                        code: import("zod").ZodString;
                        preferences: import("zod").ZodOptional<import("zod").ZodObject<{
                            language: import("zod").ZodEnum<{
                                de: "de";
                                en: "en";
                            }>;
                            citationStyle: import("zod").ZodEnum<{
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
                        }, import("zod/v4/core").$strict>>;
                    }, import("zod/v4/core").$strict> | import("zod").ZodObject<{
                        everywhere: import("zod").ZodBoolean;
                    }, import("zod/v4/core").$strict>;
                };
            };
        };
    };
    responses: {
        200: {
            description: string;
            content: {
                "application/json": {
                    schema: import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            challengeId: import("zod").ZodUUID;
                            expiresIn: import("zod").ZodNumber;
                            resendAfter: import("zod").ZodNumber;
                        }, import("zod/v4/core").$strict>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip> | import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            accountId: import("zod").ZodUUID;
                            ownerId: import("zod").ZodUUID;
                            email: import("zod").ZodEmail;
                        }, import("zod/v4/core").$strict>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip> | import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            signedOut: import("zod").ZodLiteral<true>;
                        }, import("zod/v4/core").$strict>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        400: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        401: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        403: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        429: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        503: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
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
                    schema: import("zod").ZodObject<{
                        email: import("zod").ZodEmail;
                        language: import("zod").ZodEnum<{
                            de: "de";
                            en: "en";
                        }>;
                    }, import("zod/v4/core").$strict> | import("zod").ZodObject<{
                        challengeId: import("zod").ZodUUID;
                        code: import("zod").ZodString;
                        preferences: import("zod").ZodOptional<import("zod").ZodObject<{
                            language: import("zod").ZodEnum<{
                                de: "de";
                                en: "en";
                            }>;
                            citationStyle: import("zod").ZodEnum<{
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
                        }, import("zod/v4/core").$strict>>;
                    }, import("zod/v4/core").$strict> | import("zod").ZodObject<{
                        everywhere: import("zod").ZodBoolean;
                    }, import("zod/v4/core").$strict>;
                };
            };
        };
    };
    responses: {
        200: {
            description: string;
            content: {
                "application/json": {
                    schema: import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            challengeId: import("zod").ZodUUID;
                            expiresIn: import("zod").ZodNumber;
                            resendAfter: import("zod").ZodNumber;
                        }, import("zod/v4/core").$strict>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip> | import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            accountId: import("zod").ZodUUID;
                            ownerId: import("zod").ZodUUID;
                            email: import("zod").ZodEmail;
                        }, import("zod/v4/core").$strict>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip> | import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            signedOut: import("zod").ZodLiteral<true>;
                        }, import("zod/v4/core").$strict>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        400: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        401: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        403: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        429: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        503: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
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
                    schema: import("zod").ZodObject<{
                        email: import("zod").ZodEmail;
                        language: import("zod").ZodEnum<{
                            de: "de";
                            en: "en";
                        }>;
                    }, import("zod/v4/core").$strict> | import("zod").ZodObject<{
                        challengeId: import("zod").ZodUUID;
                        code: import("zod").ZodString;
                        preferences: import("zod").ZodOptional<import("zod").ZodObject<{
                            language: import("zod").ZodEnum<{
                                de: "de";
                                en: "en";
                            }>;
                            citationStyle: import("zod").ZodEnum<{
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
                        }, import("zod/v4/core").$strict>>;
                    }, import("zod/v4/core").$strict> | import("zod").ZodObject<{
                        everywhere: import("zod").ZodBoolean;
                    }, import("zod/v4/core").$strict>;
                };
            };
        };
    };
    responses: {
        200: {
            description: string;
            content: {
                "application/json": {
                    schema: import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            challengeId: import("zod").ZodUUID;
                            expiresIn: import("zod").ZodNumber;
                            resendAfter: import("zod").ZodNumber;
                        }, import("zod/v4/core").$strict>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip> | import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            accountId: import("zod").ZodUUID;
                            ownerId: import("zod").ZodUUID;
                            email: import("zod").ZodEmail;
                        }, import("zod/v4/core").$strict>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip> | import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            signedOut: import("zod").ZodLiteral<true>;
                        }, import("zod/v4/core").$strict>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        400: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        401: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        403: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        429: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        503: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
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
                    schema: import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            accountId: import("zod").ZodUUID;
                            ownerId: import("zod").ZodUUID;
                            email: import("zod").ZodEmail;
                        }, import("zod/v4/core").$strict>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        401: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        503: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
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
                    schema: import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            accountId: import("zod").ZodUUID;
                            ownerId: import("zod").ZodUUID;
                            email: import("zod").ZodEmail;
                        }, import("zod/v4/core").$strict>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        401: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        403: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        503: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
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
                    schema: import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            accessToken: import("zod").ZodString;
                            tokenType: import("zod").ZodLiteral<"Bearer">;
                            expiresAt: import("zod").ZodISODateTime;
                            expiresIn: import("zod").ZodLiteral<300>;
                        }, import("zod/v4/core").$strict>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        401: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        403: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        503: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
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
                    schema: import("zod").ZodObject<{
                        email: import("zod").ZodEmail;
                        language: import("zod").ZodEnum<{
                            de: "de";
                            en: "en";
                        }>;
                    }, import("zod/v4/core").$strict> | import("zod").ZodObject<{
                        everywhere: import("zod").ZodBoolean;
                    }, import("zod/v4/core").$strict> | import("zod").ZodObject<{
                        challengeId: import("zod").ZodUUID;
                        code: import("zod").ZodString;
                        preferences: import("zod").ZodOptional<import("zod").ZodObject<{
                            language: import("zod").ZodEnum<{
                                de: "de";
                                en: "en";
                            }>;
                            citationStyle: import("zod").ZodEnum<{
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
                        }, import("zod/v4/core").$strict>>;
                        transactionCredential: import("zod").ZodString;
                    }, import("zod/v4/core").$strict>;
                };
            };
        };
    } | undefined;
    responses: {
        200: {
            description: string;
            content: {
                "application/json": {
                    schema: import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            accessToken: import("zod").ZodString;
                            tokenType: import("zod").ZodLiteral<"Bearer">;
                            expiresAt: import("zod").ZodISODateTime;
                            expiresIn: import("zod").ZodLiteral<300>;
                        }, import("zod/v4/core").$strict>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip> | import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            accountId: import("zod").ZodUUID;
                            ownerId: import("zod").ZodUUID;
                            email: import("zod").ZodEmail;
                        }, import("zod/v4/core").$strict>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip> | import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            signedOut: import("zod").ZodLiteral<true>;
                        }, import("zod/v4/core").$strict>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip> | import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            challengeId: import("zod").ZodUUID;
                            expiresIn: import("zod").ZodNumber;
                            resendAfter: import("zod").ZodNumber;
                            transactionCredential: import("zod").ZodString;
                        }, import("zod/v4/core").$strict>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip> | import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            session: import("zod").ZodObject<{
                                accountId: import("zod").ZodUUID;
                                ownerId: import("zod").ZodUUID;
                                email: import("zod").ZodEmail;
                            }, import("zod/v4/core").$strict>;
                            sessionCredential: import("zod").ZodString;
                        }, import("zod/v4/core").$strict>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        400: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        401: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        403: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        429: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        503: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
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
                    schema: import("zod").ZodObject<{
                        email: import("zod").ZodEmail;
                        language: import("zod").ZodEnum<{
                            de: "de";
                            en: "en";
                        }>;
                    }, import("zod/v4/core").$strict> | import("zod").ZodObject<{
                        everywhere: import("zod").ZodBoolean;
                    }, import("zod/v4/core").$strict> | import("zod").ZodObject<{
                        challengeId: import("zod").ZodUUID;
                        code: import("zod").ZodString;
                        preferences: import("zod").ZodOptional<import("zod").ZodObject<{
                            language: import("zod").ZodEnum<{
                                de: "de";
                                en: "en";
                            }>;
                            citationStyle: import("zod").ZodEnum<{
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
                        }, import("zod/v4/core").$strict>>;
                        transactionCredential: import("zod").ZodString;
                    }, import("zod/v4/core").$strict>;
                };
            };
        };
    } | undefined;
    responses: {
        200: {
            description: string;
            content: {
                "application/json": {
                    schema: import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            accessToken: import("zod").ZodString;
                            tokenType: import("zod").ZodLiteral<"Bearer">;
                            expiresAt: import("zod").ZodISODateTime;
                            expiresIn: import("zod").ZodLiteral<300>;
                        }, import("zod/v4/core").$strict>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip> | import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            accountId: import("zod").ZodUUID;
                            ownerId: import("zod").ZodUUID;
                            email: import("zod").ZodEmail;
                        }, import("zod/v4/core").$strict>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip> | import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            signedOut: import("zod").ZodLiteral<true>;
                        }, import("zod/v4/core").$strict>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip> | import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            challengeId: import("zod").ZodUUID;
                            expiresIn: import("zod").ZodNumber;
                            resendAfter: import("zod").ZodNumber;
                            transactionCredential: import("zod").ZodString;
                        }, import("zod/v4/core").$strict>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip> | import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            session: import("zod").ZodObject<{
                                accountId: import("zod").ZodUUID;
                                ownerId: import("zod").ZodUUID;
                                email: import("zod").ZodEmail;
                            }, import("zod/v4/core").$strict>;
                            sessionCredential: import("zod").ZodString;
                        }, import("zod/v4/core").$strict>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        400: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        401: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        403: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        429: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        503: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
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
                    schema: import("zod").ZodObject<{
                        email: import("zod").ZodEmail;
                        language: import("zod").ZodEnum<{
                            de: "de";
                            en: "en";
                        }>;
                    }, import("zod/v4/core").$strict> | import("zod").ZodObject<{
                        everywhere: import("zod").ZodBoolean;
                    }, import("zod/v4/core").$strict> | import("zod").ZodObject<{
                        challengeId: import("zod").ZodUUID;
                        code: import("zod").ZodString;
                        preferences: import("zod").ZodOptional<import("zod").ZodObject<{
                            language: import("zod").ZodEnum<{
                                de: "de";
                                en: "en";
                            }>;
                            citationStyle: import("zod").ZodEnum<{
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
                        }, import("zod/v4/core").$strict>>;
                        transactionCredential: import("zod").ZodString;
                    }, import("zod/v4/core").$strict>;
                };
            };
        };
    } | undefined;
    responses: {
        200: {
            description: string;
            content: {
                "application/json": {
                    schema: import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            accessToken: import("zod").ZodString;
                            tokenType: import("zod").ZodLiteral<"Bearer">;
                            expiresAt: import("zod").ZodISODateTime;
                            expiresIn: import("zod").ZodLiteral<300>;
                        }, import("zod/v4/core").$strict>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip> | import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            accountId: import("zod").ZodUUID;
                            ownerId: import("zod").ZodUUID;
                            email: import("zod").ZodEmail;
                        }, import("zod/v4/core").$strict>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip> | import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            signedOut: import("zod").ZodLiteral<true>;
                        }, import("zod/v4/core").$strict>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip> | import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            challengeId: import("zod").ZodUUID;
                            expiresIn: import("zod").ZodNumber;
                            resendAfter: import("zod").ZodNumber;
                            transactionCredential: import("zod").ZodString;
                        }, import("zod/v4/core").$strict>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip> | import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            session: import("zod").ZodObject<{
                                accountId: import("zod").ZodUUID;
                                ownerId: import("zod").ZodUUID;
                                email: import("zod").ZodEmail;
                            }, import("zod/v4/core").$strict>;
                            sessionCredential: import("zod").ZodString;
                        }, import("zod/v4/core").$strict>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        400: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        401: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        403: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        429: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        503: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
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
                    schema: import("zod").ZodObject<{
                        email: import("zod").ZodEmail;
                        language: import("zod").ZodEnum<{
                            de: "de";
                            en: "en";
                        }>;
                    }, import("zod/v4/core").$strict> | import("zod").ZodObject<{
                        everywhere: import("zod").ZodBoolean;
                    }, import("zod/v4/core").$strict> | import("zod").ZodObject<{
                        challengeId: import("zod").ZodUUID;
                        code: import("zod").ZodString;
                        preferences: import("zod").ZodOptional<import("zod").ZodObject<{
                            language: import("zod").ZodEnum<{
                                de: "de";
                                en: "en";
                            }>;
                            citationStyle: import("zod").ZodEnum<{
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
                        }, import("zod/v4/core").$strict>>;
                        transactionCredential: import("zod").ZodString;
                    }, import("zod/v4/core").$strict>;
                };
            };
        };
    } | undefined;
    responses: {
        200: {
            description: string;
            content: {
                "application/json": {
                    schema: import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            accessToken: import("zod").ZodString;
                            tokenType: import("zod").ZodLiteral<"Bearer">;
                            expiresAt: import("zod").ZodISODateTime;
                            expiresIn: import("zod").ZodLiteral<300>;
                        }, import("zod/v4/core").$strict>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip> | import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            accountId: import("zod").ZodUUID;
                            ownerId: import("zod").ZodUUID;
                            email: import("zod").ZodEmail;
                        }, import("zod/v4/core").$strict>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip> | import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            signedOut: import("zod").ZodLiteral<true>;
                        }, import("zod/v4/core").$strict>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip> | import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            challengeId: import("zod").ZodUUID;
                            expiresIn: import("zod").ZodNumber;
                            resendAfter: import("zod").ZodNumber;
                            transactionCredential: import("zod").ZodString;
                        }, import("zod/v4/core").$strict>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip> | import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            session: import("zod").ZodObject<{
                                accountId: import("zod").ZodUUID;
                                ownerId: import("zod").ZodUUID;
                                email: import("zod").ZodEmail;
                            }, import("zod/v4/core").$strict>;
                            sessionCredential: import("zod").ZodString;
                        }, import("zod/v4/core").$strict>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        400: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        401: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        403: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        429: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        503: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
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
                    schema: import("zod").ZodObject<{
                        email: import("zod").ZodEmail;
                        language: import("zod").ZodEnum<{
                            de: "de";
                            en: "en";
                        }>;
                    }, import("zod/v4/core").$strict> | import("zod").ZodObject<{
                        everywhere: import("zod").ZodBoolean;
                    }, import("zod/v4/core").$strict> | import("zod").ZodObject<{
                        challengeId: import("zod").ZodUUID;
                        code: import("zod").ZodString;
                        preferences: import("zod").ZodOptional<import("zod").ZodObject<{
                            language: import("zod").ZodEnum<{
                                de: "de";
                                en: "en";
                            }>;
                            citationStyle: import("zod").ZodEnum<{
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
                        }, import("zod/v4/core").$strict>>;
                        transactionCredential: import("zod").ZodString;
                    }, import("zod/v4/core").$strict>;
                };
            };
        };
    } | undefined;
    responses: {
        200: {
            description: string;
            content: {
                "application/json": {
                    schema: import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            accessToken: import("zod").ZodString;
                            tokenType: import("zod").ZodLiteral<"Bearer">;
                            expiresAt: import("zod").ZodISODateTime;
                            expiresIn: import("zod").ZodLiteral<300>;
                        }, import("zod/v4/core").$strict>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip> | import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            accountId: import("zod").ZodUUID;
                            ownerId: import("zod").ZodUUID;
                            email: import("zod").ZodEmail;
                        }, import("zod/v4/core").$strict>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip> | import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            signedOut: import("zod").ZodLiteral<true>;
                        }, import("zod/v4/core").$strict>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip> | import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            challengeId: import("zod").ZodUUID;
                            expiresIn: import("zod").ZodNumber;
                            resendAfter: import("zod").ZodNumber;
                            transactionCredential: import("zod").ZodString;
                        }, import("zod/v4/core").$strict>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip> | import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            session: import("zod").ZodObject<{
                                accountId: import("zod").ZodUUID;
                                ownerId: import("zod").ZodUUID;
                                email: import("zod").ZodEmail;
                            }, import("zod/v4/core").$strict>;
                            sessionCredential: import("zod").ZodString;
                        }, import("zod/v4/core").$strict>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        400: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        401: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        403: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        429: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        503: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
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
                    schema: import("zod").ZodObject<{
                        email: import("zod").ZodEmail;
                        language: import("zod").ZodEnum<{
                            de: "de";
                            en: "en";
                        }>;
                    }, import("zod/v4/core").$strict> | import("zod").ZodObject<{
                        everywhere: import("zod").ZodBoolean;
                    }, import("zod/v4/core").$strict> | import("zod").ZodObject<{
                        challengeId: import("zod").ZodUUID;
                        code: import("zod").ZodString;
                        preferences: import("zod").ZodOptional<import("zod").ZodObject<{
                            language: import("zod").ZodEnum<{
                                de: "de";
                                en: "en";
                            }>;
                            citationStyle: import("zod").ZodEnum<{
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
                        }, import("zod/v4/core").$strict>>;
                        transactionCredential: import("zod").ZodString;
                    }, import("zod/v4/core").$strict>;
                };
            };
        };
    } | undefined;
    responses: {
        200: {
            description: string;
            content: {
                "application/json": {
                    schema: import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            accessToken: import("zod").ZodString;
                            tokenType: import("zod").ZodLiteral<"Bearer">;
                            expiresAt: import("zod").ZodISODateTime;
                            expiresIn: import("zod").ZodLiteral<300>;
                        }, import("zod/v4/core").$strict>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip> | import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            accountId: import("zod").ZodUUID;
                            ownerId: import("zod").ZodUUID;
                            email: import("zod").ZodEmail;
                        }, import("zod/v4/core").$strict>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip> | import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            signedOut: import("zod").ZodLiteral<true>;
                        }, import("zod/v4/core").$strict>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip> | import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            challengeId: import("zod").ZodUUID;
                            expiresIn: import("zod").ZodNumber;
                            resendAfter: import("zod").ZodNumber;
                            transactionCredential: import("zod").ZodString;
                        }, import("zod/v4/core").$strict>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip> | import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            session: import("zod").ZodObject<{
                                accountId: import("zod").ZodUUID;
                                ownerId: import("zod").ZodUUID;
                                email: import("zod").ZodEmail;
                            }, import("zod/v4/core").$strict>;
                            sessionCredential: import("zod").ZodString;
                        }, import("zod/v4/core").$strict>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        400: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        401: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        403: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        429: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        503: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
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
                    schema: import("zod").ZodObject<{
                        language: import("zod").ZodOptional<import("zod").ZodEnum<{
                            de: "de";
                            en: "en";
                        }>>;
                        citationStyle: import("zod").ZodOptional<import("zod").ZodEnum<{
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
                    }, import("zod/v4/core").$strict>;
                };
            };
        };
    } | undefined;
    responses: {
        200: {
            description: string;
            content: {
                "application/json": {
                    schema: import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            language: import("zod").ZodEnum<{
                                de: "de";
                                en: "en";
                            }>;
                            citationStyle: import("zod").ZodString;
                        }, import("zod/v4/core").$strict>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        400: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        401: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        403: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        429: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        503: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
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
                    schema: import("zod").ZodObject<{
                        language: import("zod").ZodOptional<import("zod").ZodEnum<{
                            de: "de";
                            en: "en";
                        }>>;
                        citationStyle: import("zod").ZodOptional<import("zod").ZodEnum<{
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
                    }, import("zod/v4/core").$strict>;
                };
            };
        };
    } | undefined;
    responses: {
        200: {
            description: string;
            content: {
                "application/json": {
                    schema: import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            language: import("zod").ZodEnum<{
                                de: "de";
                                en: "en";
                            }>;
                            citationStyle: import("zod").ZodString;
                        }, import("zod/v4/core").$strict>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        400: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        401: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        403: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        429: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        503: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
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
                    schema: import("zod").ZodObject<{
                        language: import("zod").ZodOptional<import("zod").ZodEnum<{
                            de: "de";
                            en: "en";
                        }>>;
                        citationStyle: import("zod").ZodOptional<import("zod").ZodEnum<{
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
                    }, import("zod/v4/core").$strict>;
                };
            };
        };
    } | undefined;
    responses: {
        200: {
            description: string;
            content: {
                "application/json": {
                    schema: import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            language: import("zod").ZodEnum<{
                                de: "de";
                                en: "en";
                            }>;
                            citationStyle: import("zod").ZodString;
                        }, import("zod/v4/core").$strict>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        400: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        401: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        403: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        429: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        503: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
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
                    schema: import("zod").ZodObject<{
                        language: import("zod").ZodOptional<import("zod").ZodEnum<{
                            de: "de";
                            en: "en";
                        }>>;
                        citationStyle: import("zod").ZodOptional<import("zod").ZodEnum<{
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
                    }, import("zod/v4/core").$strict>;
                };
            };
        };
    } | undefined;
    responses: {
        200: {
            description: string;
            content: {
                "application/json": {
                    schema: import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            language: import("zod").ZodEnum<{
                                de: "de";
                                en: "en";
                            }>;
                            citationStyle: import("zod").ZodString;
                        }, import("zod/v4/core").$strict>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        400: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        401: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        403: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        429: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        503: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
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
                    schema: import("zod").ZodObject<{
                        challengeId: import("zod").ZodUUID;
                        code: import("zod").ZodString;
                        preferences: import("zod").ZodOptional<import("zod").ZodObject<{
                            language: import("zod").ZodEnum<{
                                de: "de";
                                en: "en";
                            }>;
                            citationStyle: import("zod").ZodEnum<{
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
                        }, import("zod/v4/core").$strict>>;
                    }, import("zod/v4/core").$strict> | import("zod").ZodObject<{
                        action: import("zod").ZodEnum<{
                            "account-deletion": "account-deletion";
                            "email-change": "email-change";
                        }>;
                        language: import("zod").ZodEnum<{
                            de: "de";
                            en: "en";
                        }>;
                    }, import("zod/v4/core").$strict> | import("zod").ZodObject<{
                        newEmail: import("zod").ZodEmail;
                        language: import("zod").ZodEnum<{
                            de: "de";
                            en: "en";
                        }>;
                    }, import("zod/v4/core").$strict> | import("zod").ZodObject<{
                        billingRetentionAcknowledged: import("zod").ZodLiteral<true>;
                        billingRetentionYears: import("zod").ZodLiteral<8>;
                    }, import("zod/v4/core").$strict>;
                };
            };
        };
    };
    responses: {
        200: {
            description: string;
            content: {
                "application/json": {
                    schema: import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            challengeId: import("zod").ZodUUID;
                            expiresIn: import("zod").ZodNumber;
                            resendAfter: import("zod").ZodNumber;
                        }, import("zod/v4/core").$strict>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip> | import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            accountId: import("zod").ZodUUID;
                            ownerId: import("zod").ZodUUID;
                            email: import("zod").ZodEmail;
                        }, import("zod/v4/core").$strict>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip> | import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            challengeId: import("zod").ZodUUID;
                            action: import("zod").ZodEnum<{
                                "account-deletion": "account-deletion";
                                "email-change": "email-change";
                            }>;
                            expiresIn: import("zod").ZodNumber;
                            resendAfter: import("zod").ZodNumber;
                        }, import("zod/v4/core").$strict>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip> | import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            action: import("zod").ZodEnum<{
                                "account-deletion": "account-deletion";
                                "email-change": "email-change";
                            }>;
                            expiresAt: import("zod").ZodISODateTime;
                            expiresIn: import("zod").ZodNumber;
                        }, import("zod/v4/core").$strict>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip> | import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            status: import("zod").ZodEnum<{
                                deleted: "deleted";
                                "in-progress": "in-progress";
                            }>;
                        }, import("zod/v4/core").$strict>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        400: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        401: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        403: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        429: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        501: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        503: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
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
                    schema: import("zod").ZodObject<{
                        challengeId: import("zod").ZodUUID;
                        code: import("zod").ZodString;
                        preferences: import("zod").ZodOptional<import("zod").ZodObject<{
                            language: import("zod").ZodEnum<{
                                de: "de";
                                en: "en";
                            }>;
                            citationStyle: import("zod").ZodEnum<{
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
                        }, import("zod/v4/core").$strict>>;
                    }, import("zod/v4/core").$strict> | import("zod").ZodObject<{
                        action: import("zod").ZodEnum<{
                            "account-deletion": "account-deletion";
                            "email-change": "email-change";
                        }>;
                        language: import("zod").ZodEnum<{
                            de: "de";
                            en: "en";
                        }>;
                    }, import("zod/v4/core").$strict> | import("zod").ZodObject<{
                        newEmail: import("zod").ZodEmail;
                        language: import("zod").ZodEnum<{
                            de: "de";
                            en: "en";
                        }>;
                    }, import("zod/v4/core").$strict> | import("zod").ZodObject<{
                        billingRetentionAcknowledged: import("zod").ZodLiteral<true>;
                        billingRetentionYears: import("zod").ZodLiteral<8>;
                    }, import("zod/v4/core").$strict>;
                };
            };
        };
    };
    responses: {
        200: {
            description: string;
            content: {
                "application/json": {
                    schema: import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            challengeId: import("zod").ZodUUID;
                            expiresIn: import("zod").ZodNumber;
                            resendAfter: import("zod").ZodNumber;
                        }, import("zod/v4/core").$strict>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip> | import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            accountId: import("zod").ZodUUID;
                            ownerId: import("zod").ZodUUID;
                            email: import("zod").ZodEmail;
                        }, import("zod/v4/core").$strict>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip> | import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            challengeId: import("zod").ZodUUID;
                            action: import("zod").ZodEnum<{
                                "account-deletion": "account-deletion";
                                "email-change": "email-change";
                            }>;
                            expiresIn: import("zod").ZodNumber;
                            resendAfter: import("zod").ZodNumber;
                        }, import("zod/v4/core").$strict>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip> | import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            action: import("zod").ZodEnum<{
                                "account-deletion": "account-deletion";
                                "email-change": "email-change";
                            }>;
                            expiresAt: import("zod").ZodISODateTime;
                            expiresIn: import("zod").ZodNumber;
                        }, import("zod/v4/core").$strict>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip> | import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            status: import("zod").ZodEnum<{
                                deleted: "deleted";
                                "in-progress": "in-progress";
                            }>;
                        }, import("zod/v4/core").$strict>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        400: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        401: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        403: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        429: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        501: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        503: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
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
                    schema: import("zod").ZodObject<{
                        challengeId: import("zod").ZodUUID;
                        code: import("zod").ZodString;
                        preferences: import("zod").ZodOptional<import("zod").ZodObject<{
                            language: import("zod").ZodEnum<{
                                de: "de";
                                en: "en";
                            }>;
                            citationStyle: import("zod").ZodEnum<{
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
                        }, import("zod/v4/core").$strict>>;
                    }, import("zod/v4/core").$strict> | import("zod").ZodObject<{
                        action: import("zod").ZodEnum<{
                            "account-deletion": "account-deletion";
                            "email-change": "email-change";
                        }>;
                        language: import("zod").ZodEnum<{
                            de: "de";
                            en: "en";
                        }>;
                    }, import("zod/v4/core").$strict> | import("zod").ZodObject<{
                        newEmail: import("zod").ZodEmail;
                        language: import("zod").ZodEnum<{
                            de: "de";
                            en: "en";
                        }>;
                    }, import("zod/v4/core").$strict> | import("zod").ZodObject<{
                        billingRetentionAcknowledged: import("zod").ZodLiteral<true>;
                        billingRetentionYears: import("zod").ZodLiteral<8>;
                    }, import("zod/v4/core").$strict>;
                };
            };
        };
    };
    responses: {
        200: {
            description: string;
            content: {
                "application/json": {
                    schema: import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            challengeId: import("zod").ZodUUID;
                            expiresIn: import("zod").ZodNumber;
                            resendAfter: import("zod").ZodNumber;
                        }, import("zod/v4/core").$strict>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip> | import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            accountId: import("zod").ZodUUID;
                            ownerId: import("zod").ZodUUID;
                            email: import("zod").ZodEmail;
                        }, import("zod/v4/core").$strict>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip> | import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            challengeId: import("zod").ZodUUID;
                            action: import("zod").ZodEnum<{
                                "account-deletion": "account-deletion";
                                "email-change": "email-change";
                            }>;
                            expiresIn: import("zod").ZodNumber;
                            resendAfter: import("zod").ZodNumber;
                        }, import("zod/v4/core").$strict>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip> | import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            action: import("zod").ZodEnum<{
                                "account-deletion": "account-deletion";
                                "email-change": "email-change";
                            }>;
                            expiresAt: import("zod").ZodISODateTime;
                            expiresIn: import("zod").ZodNumber;
                        }, import("zod/v4/core").$strict>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip> | import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            status: import("zod").ZodEnum<{
                                deleted: "deleted";
                                "in-progress": "in-progress";
                            }>;
                        }, import("zod/v4/core").$strict>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        400: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        401: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        403: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        429: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        501: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        503: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
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
                    schema: import("zod").ZodObject<{
                        challengeId: import("zod").ZodUUID;
                        code: import("zod").ZodString;
                        preferences: import("zod").ZodOptional<import("zod").ZodObject<{
                            language: import("zod").ZodEnum<{
                                de: "de";
                                en: "en";
                            }>;
                            citationStyle: import("zod").ZodEnum<{
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
                        }, import("zod/v4/core").$strict>>;
                    }, import("zod/v4/core").$strict> | import("zod").ZodObject<{
                        action: import("zod").ZodEnum<{
                            "account-deletion": "account-deletion";
                            "email-change": "email-change";
                        }>;
                        language: import("zod").ZodEnum<{
                            de: "de";
                            en: "en";
                        }>;
                    }, import("zod/v4/core").$strict> | import("zod").ZodObject<{
                        newEmail: import("zod").ZodEmail;
                        language: import("zod").ZodEnum<{
                            de: "de";
                            en: "en";
                        }>;
                    }, import("zod/v4/core").$strict> | import("zod").ZodObject<{
                        billingRetentionAcknowledged: import("zod").ZodLiteral<true>;
                        billingRetentionYears: import("zod").ZodLiteral<8>;
                    }, import("zod/v4/core").$strict>;
                };
            };
        };
    };
    responses: {
        200: {
            description: string;
            content: {
                "application/json": {
                    schema: import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            challengeId: import("zod").ZodUUID;
                            expiresIn: import("zod").ZodNumber;
                            resendAfter: import("zod").ZodNumber;
                        }, import("zod/v4/core").$strict>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip> | import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            accountId: import("zod").ZodUUID;
                            ownerId: import("zod").ZodUUID;
                            email: import("zod").ZodEmail;
                        }, import("zod/v4/core").$strict>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip> | import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            challengeId: import("zod").ZodUUID;
                            action: import("zod").ZodEnum<{
                                "account-deletion": "account-deletion";
                                "email-change": "email-change";
                            }>;
                            expiresIn: import("zod").ZodNumber;
                            resendAfter: import("zod").ZodNumber;
                        }, import("zod/v4/core").$strict>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip> | import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            action: import("zod").ZodEnum<{
                                "account-deletion": "account-deletion";
                                "email-change": "email-change";
                            }>;
                            expiresAt: import("zod").ZodISODateTime;
                            expiresIn: import("zod").ZodNumber;
                        }, import("zod/v4/core").$strict>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip> | import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            status: import("zod").ZodEnum<{
                                deleted: "deleted";
                                "in-progress": "in-progress";
                            }>;
                        }, import("zod/v4/core").$strict>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        400: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        401: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        403: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        429: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        501: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        503: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
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
                    schema: import("zod").ZodObject<{
                        challengeId: import("zod").ZodUUID;
                        code: import("zod").ZodString;
                        preferences: import("zod").ZodOptional<import("zod").ZodObject<{
                            language: import("zod").ZodEnum<{
                                de: "de";
                                en: "en";
                            }>;
                            citationStyle: import("zod").ZodEnum<{
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
                        }, import("zod/v4/core").$strict>>;
                    }, import("zod/v4/core").$strict> | import("zod").ZodObject<{
                        action: import("zod").ZodEnum<{
                            "account-deletion": "account-deletion";
                            "email-change": "email-change";
                        }>;
                        language: import("zod").ZodEnum<{
                            de: "de";
                            en: "en";
                        }>;
                    }, import("zod/v4/core").$strict> | import("zod").ZodObject<{
                        newEmail: import("zod").ZodEmail;
                        language: import("zod").ZodEnum<{
                            de: "de";
                            en: "en";
                        }>;
                    }, import("zod/v4/core").$strict> | import("zod").ZodObject<{
                        billingRetentionAcknowledged: import("zod").ZodLiteral<true>;
                        billingRetentionYears: import("zod").ZodLiteral<8>;
                    }, import("zod/v4/core").$strict>;
                };
            };
        };
    };
    responses: {
        200: {
            description: string;
            content: {
                "application/json": {
                    schema: import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            challengeId: import("zod").ZodUUID;
                            expiresIn: import("zod").ZodNumber;
                            resendAfter: import("zod").ZodNumber;
                        }, import("zod/v4/core").$strict>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip> | import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            accountId: import("zod").ZodUUID;
                            ownerId: import("zod").ZodUUID;
                            email: import("zod").ZodEmail;
                        }, import("zod/v4/core").$strict>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip> | import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            challengeId: import("zod").ZodUUID;
                            action: import("zod").ZodEnum<{
                                "account-deletion": "account-deletion";
                                "email-change": "email-change";
                            }>;
                            expiresIn: import("zod").ZodNumber;
                            resendAfter: import("zod").ZodNumber;
                        }, import("zod/v4/core").$strict>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip> | import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            action: import("zod").ZodEnum<{
                                "account-deletion": "account-deletion";
                                "email-change": "email-change";
                            }>;
                            expiresAt: import("zod").ZodISODateTime;
                            expiresIn: import("zod").ZodNumber;
                        }, import("zod/v4/core").$strict>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip> | import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            status: import("zod").ZodEnum<{
                                deleted: "deleted";
                                "in-progress": "in-progress";
                            }>;
                        }, import("zod/v4/core").$strict>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        400: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        401: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        403: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        429: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        501: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        503: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
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
                    schema: import("zod").ZodObject<{
                        challengeId: import("zod").ZodUUID;
                        code: import("zod").ZodString;
                        preferences: import("zod").ZodOptional<import("zod").ZodObject<{
                            language: import("zod").ZodEnum<{
                                de: "de";
                                en: "en";
                            }>;
                            citationStyle: import("zod").ZodEnum<{
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
                        }, import("zod/v4/core").$strict>>;
                    }, import("zod/v4/core").$strict> | import("zod").ZodObject<{
                        action: import("zod").ZodEnum<{
                            "account-deletion": "account-deletion";
                            "email-change": "email-change";
                        }>;
                        language: import("zod").ZodEnum<{
                            de: "de";
                            en: "en";
                        }>;
                    }, import("zod/v4/core").$strict> | import("zod").ZodObject<{
                        newEmail: import("zod").ZodEmail;
                        language: import("zod").ZodEnum<{
                            de: "de";
                            en: "en";
                        }>;
                    }, import("zod/v4/core").$strict> | import("zod").ZodObject<{
                        billingRetentionAcknowledged: import("zod").ZodLiteral<true>;
                        billingRetentionYears: import("zod").ZodLiteral<8>;
                    }, import("zod/v4/core").$strict>;
                };
            };
        };
    };
    responses: {
        200: {
            description: string;
            content: {
                "application/json": {
                    schema: import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            challengeId: import("zod").ZodUUID;
                            expiresIn: import("zod").ZodNumber;
                            resendAfter: import("zod").ZodNumber;
                        }, import("zod/v4/core").$strict>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip> | import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            accountId: import("zod").ZodUUID;
                            ownerId: import("zod").ZodUUID;
                            email: import("zod").ZodEmail;
                        }, import("zod/v4/core").$strict>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip> | import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            challengeId: import("zod").ZodUUID;
                            action: import("zod").ZodEnum<{
                                "account-deletion": "account-deletion";
                                "email-change": "email-change";
                            }>;
                            expiresIn: import("zod").ZodNumber;
                            resendAfter: import("zod").ZodNumber;
                        }, import("zod/v4/core").$strict>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip> | import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            action: import("zod").ZodEnum<{
                                "account-deletion": "account-deletion";
                                "email-change": "email-change";
                            }>;
                            expiresAt: import("zod").ZodISODateTime;
                            expiresIn: import("zod").ZodNumber;
                        }, import("zod/v4/core").$strict>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip> | import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            status: import("zod").ZodEnum<{
                                deleted: "deleted";
                                "in-progress": "in-progress";
                            }>;
                        }, import("zod/v4/core").$strict>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        400: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        401: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        403: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        429: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        501: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        503: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
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
                    schema: import("zod").ZodObject<{
                        challengeId: import("zod").ZodUUID;
                        code: import("zod").ZodString;
                        preferences: import("zod").ZodOptional<import("zod").ZodObject<{
                            language: import("zod").ZodEnum<{
                                de: "de";
                                en: "en";
                            }>;
                            citationStyle: import("zod").ZodEnum<{
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
                        }, import("zod/v4/core").$strict>>;
                    }, import("zod/v4/core").$strict> | import("zod").ZodObject<{
                        action: import("zod").ZodEnum<{
                            "account-deletion": "account-deletion";
                            "email-change": "email-change";
                        }>;
                        language: import("zod").ZodEnum<{
                            de: "de";
                            en: "en";
                        }>;
                    }, import("zod/v4/core").$strict> | import("zod").ZodObject<{
                        newEmail: import("zod").ZodEmail;
                        language: import("zod").ZodEnum<{
                            de: "de";
                            en: "en";
                        }>;
                    }, import("zod/v4/core").$strict> | import("zod").ZodObject<{
                        billingRetentionAcknowledged: import("zod").ZodLiteral<true>;
                        billingRetentionYears: import("zod").ZodLiteral<8>;
                    }, import("zod/v4/core").$strict>;
                };
            };
        };
    };
    responses: {
        200: {
            description: string;
            content: {
                "application/json": {
                    schema: import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            challengeId: import("zod").ZodUUID;
                            expiresIn: import("zod").ZodNumber;
                            resendAfter: import("zod").ZodNumber;
                        }, import("zod/v4/core").$strict>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip> | import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            accountId: import("zod").ZodUUID;
                            ownerId: import("zod").ZodUUID;
                            email: import("zod").ZodEmail;
                        }, import("zod/v4/core").$strict>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip> | import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            challengeId: import("zod").ZodUUID;
                            action: import("zod").ZodEnum<{
                                "account-deletion": "account-deletion";
                                "email-change": "email-change";
                            }>;
                            expiresIn: import("zod").ZodNumber;
                            resendAfter: import("zod").ZodNumber;
                        }, import("zod/v4/core").$strict>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip> | import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            action: import("zod").ZodEnum<{
                                "account-deletion": "account-deletion";
                                "email-change": "email-change";
                            }>;
                            expiresAt: import("zod").ZodISODateTime;
                            expiresIn: import("zod").ZodNumber;
                        }, import("zod/v4/core").$strict>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip> | import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            status: import("zod").ZodEnum<{
                                deleted: "deleted";
                                "in-progress": "in-progress";
                            }>;
                        }, import("zod/v4/core").$strict>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        400: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        401: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        403: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        429: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        501: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        503: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
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
                    schema: import("zod").ZodObject<{
                        challengeId: import("zod").ZodUUID;
                        code: import("zod").ZodString;
                        preferences: import("zod").ZodOptional<import("zod").ZodObject<{
                            language: import("zod").ZodEnum<{
                                de: "de";
                                en: "en";
                            }>;
                            citationStyle: import("zod").ZodEnum<{
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
                        }, import("zod/v4/core").$strict>>;
                    }, import("zod/v4/core").$strict> | import("zod").ZodObject<{
                        action: import("zod").ZodEnum<{
                            "account-deletion": "account-deletion";
                            "email-change": "email-change";
                        }>;
                        language: import("zod").ZodEnum<{
                            de: "de";
                            en: "en";
                        }>;
                    }, import("zod/v4/core").$strict> | import("zod").ZodObject<{
                        newEmail: import("zod").ZodEmail;
                        language: import("zod").ZodEnum<{
                            de: "de";
                            en: "en";
                        }>;
                    }, import("zod/v4/core").$strict> | import("zod").ZodObject<{
                        billingRetentionAcknowledged: import("zod").ZodLiteral<true>;
                        billingRetentionYears: import("zod").ZodLiteral<8>;
                    }, import("zod/v4/core").$strict>;
                };
            };
        };
    };
    responses: {
        200: {
            description: string;
            content: {
                "application/json": {
                    schema: import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            challengeId: import("zod").ZodUUID;
                            expiresIn: import("zod").ZodNumber;
                            resendAfter: import("zod").ZodNumber;
                        }, import("zod/v4/core").$strict>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip> | import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            accountId: import("zod").ZodUUID;
                            ownerId: import("zod").ZodUUID;
                            email: import("zod").ZodEmail;
                        }, import("zod/v4/core").$strict>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip> | import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            challengeId: import("zod").ZodUUID;
                            action: import("zod").ZodEnum<{
                                "account-deletion": "account-deletion";
                                "email-change": "email-change";
                            }>;
                            expiresIn: import("zod").ZodNumber;
                            resendAfter: import("zod").ZodNumber;
                        }, import("zod/v4/core").$strict>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip> | import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            action: import("zod").ZodEnum<{
                                "account-deletion": "account-deletion";
                                "email-change": "email-change";
                            }>;
                            expiresAt: import("zod").ZodISODateTime;
                            expiresIn: import("zod").ZodNumber;
                        }, import("zod/v4/core").$strict>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip> | import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            status: import("zod").ZodEnum<{
                                deleted: "deleted";
                                "in-progress": "in-progress";
                            }>;
                        }, import("zod/v4/core").$strict>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        400: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        401: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        403: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        429: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        501: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        503: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
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
                    schema: import("zod").ZodObject<{
                        challengeId: import("zod").ZodUUID;
                        code: import("zod").ZodString;
                        preferences: import("zod").ZodOptional<import("zod").ZodObject<{
                            language: import("zod").ZodEnum<{
                                de: "de";
                                en: "en";
                            }>;
                            citationStyle: import("zod").ZodEnum<{
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
                        }, import("zod/v4/core").$strict>>;
                    }, import("zod/v4/core").$strict> | import("zod").ZodObject<{
                        action: import("zod").ZodEnum<{
                            "account-deletion": "account-deletion";
                            "email-change": "email-change";
                        }>;
                        language: import("zod").ZodEnum<{
                            de: "de";
                            en: "en";
                        }>;
                    }, import("zod/v4/core").$strict> | import("zod").ZodObject<{
                        newEmail: import("zod").ZodEmail;
                        language: import("zod").ZodEnum<{
                            de: "de";
                            en: "en";
                        }>;
                    }, import("zod/v4/core").$strict> | import("zod").ZodObject<{
                        billingRetentionAcknowledged: import("zod").ZodLiteral<true>;
                        billingRetentionYears: import("zod").ZodLiteral<8>;
                    }, import("zod/v4/core").$strict>;
                };
            };
        };
    };
    responses: {
        200: {
            description: string;
            content: {
                "application/json": {
                    schema: import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            challengeId: import("zod").ZodUUID;
                            expiresIn: import("zod").ZodNumber;
                            resendAfter: import("zod").ZodNumber;
                        }, import("zod/v4/core").$strict>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip> | import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            accountId: import("zod").ZodUUID;
                            ownerId: import("zod").ZodUUID;
                            email: import("zod").ZodEmail;
                        }, import("zod/v4/core").$strict>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip> | import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            challengeId: import("zod").ZodUUID;
                            action: import("zod").ZodEnum<{
                                "account-deletion": "account-deletion";
                                "email-change": "email-change";
                            }>;
                            expiresIn: import("zod").ZodNumber;
                            resendAfter: import("zod").ZodNumber;
                        }, import("zod/v4/core").$strict>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip> | import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            action: import("zod").ZodEnum<{
                                "account-deletion": "account-deletion";
                                "email-change": "email-change";
                            }>;
                            expiresAt: import("zod").ZodISODateTime;
                            expiresIn: import("zod").ZodNumber;
                        }, import("zod/v4/core").$strict>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip> | import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            status: import("zod").ZodEnum<{
                                deleted: "deleted";
                                "in-progress": "in-progress";
                            }>;
                        }, import("zod/v4/core").$strict>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        400: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        401: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        403: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        429: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        501: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        503: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
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
                    schema: import("zod").ZodObject<{
                        challengeId: import("zod").ZodUUID;
                        code: import("zod").ZodString;
                        preferences: import("zod").ZodOptional<import("zod").ZodObject<{
                            language: import("zod").ZodEnum<{
                                de: "de";
                                en: "en";
                            }>;
                            citationStyle: import("zod").ZodEnum<{
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
                        }, import("zod/v4/core").$strict>>;
                    }, import("zod/v4/core").$strict> | import("zod").ZodObject<{
                        action: import("zod").ZodEnum<{
                            "account-deletion": "account-deletion";
                            "email-change": "email-change";
                        }>;
                        language: import("zod").ZodEnum<{
                            de: "de";
                            en: "en";
                        }>;
                    }, import("zod/v4/core").$strict> | import("zod").ZodObject<{
                        newEmail: import("zod").ZodEmail;
                        language: import("zod").ZodEnum<{
                            de: "de";
                            en: "en";
                        }>;
                    }, import("zod/v4/core").$strict> | import("zod").ZodObject<{
                        billingRetentionAcknowledged: import("zod").ZodLiteral<true>;
                        billingRetentionYears: import("zod").ZodLiteral<8>;
                    }, import("zod/v4/core").$strict>;
                };
            };
        };
    };
    responses: {
        200: {
            description: string;
            content: {
                "application/json": {
                    schema: import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            challengeId: import("zod").ZodUUID;
                            expiresIn: import("zod").ZodNumber;
                            resendAfter: import("zod").ZodNumber;
                        }, import("zod/v4/core").$strict>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip> | import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            accountId: import("zod").ZodUUID;
                            ownerId: import("zod").ZodUUID;
                            email: import("zod").ZodEmail;
                        }, import("zod/v4/core").$strict>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip> | import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            challengeId: import("zod").ZodUUID;
                            action: import("zod").ZodEnum<{
                                "account-deletion": "account-deletion";
                                "email-change": "email-change";
                            }>;
                            expiresIn: import("zod").ZodNumber;
                            resendAfter: import("zod").ZodNumber;
                        }, import("zod/v4/core").$strict>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip> | import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            action: import("zod").ZodEnum<{
                                "account-deletion": "account-deletion";
                                "email-change": "email-change";
                            }>;
                            expiresAt: import("zod").ZodISODateTime;
                            expiresIn: import("zod").ZodNumber;
                        }, import("zod/v4/core").$strict>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip> | import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            status: import("zod").ZodEnum<{
                                deleted: "deleted";
                                "in-progress": "in-progress";
                            }>;
                        }, import("zod/v4/core").$strict>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        400: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        401: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        403: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        429: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        501: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        503: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
    };
} & {
    getRoutingPath(): `/v1/account${string}` | `/v1/extension/account${string}`;
}];
export declare const routes: (({
    method: "get";
    path: "/v1/status";
    summary: string;
    responses: {
        200: {
            description: string;
            content: {
                "application/json": {
                    schema: import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            program: import("zod").ZodLiteral<"service">;
                            status: import("zod").ZodLiteral<"ready">;
                            authentication: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strip>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip>;
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
                    schema: import("zod").ZodObject<{
                        guestId: import("zod").ZodUUID;
                        client: import("zod").ZodEnum<{
                            extension: "extension";
                            web: "web";
                        }>;
                    }, import("zod/v4/core").$strict>;
                };
            };
        };
    };
    responses: {
        200: {
            description: string;
            content: {
                "application/json": {
                    schema: import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            accessToken: import("zod").ZodString;
                            tokenType: import("zod").ZodLiteral<"Bearer">;
                            expiresAt: import("zod").ZodISODateTime;
                            expiresIn: import("zod").ZodLiteral<300>;
                        }, import("zod/v4/core").$strict>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        400: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        403: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        503: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
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
                    schema: import("zod").ZodObject<{
                        keys: import("zod").ZodArray<import("zod").ZodObject<{
                            kty: import("zod").ZodLiteral<"OKP">;
                            crv: import("zod").ZodLiteral<"Ed25519">;
                            x: import("zod").ZodString;
                            kid: import("zod").ZodString;
                            alg: import("zod").ZodLiteral<"EdDSA">;
                            use: import("zod").ZodLiteral<"sig">;
                        }, import("zod/v4/core").$strict>>;
                    }, import("zod/v4/core").$strict>;
                };
            };
        };
        503: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
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
                    schema: import("zod").ZodObject<{
                        email: import("zod").ZodEmail;
                        language: import("zod").ZodEnum<{
                            de: "de";
                            en: "en";
                        }>;
                    }, import("zod/v4/core").$strict> | import("zod").ZodObject<{
                        challengeId: import("zod").ZodUUID;
                        code: import("zod").ZodString;
                        preferences: import("zod").ZodOptional<import("zod").ZodObject<{
                            language: import("zod").ZodEnum<{
                                de: "de";
                                en: "en";
                            }>;
                            citationStyle: import("zod").ZodEnum<{
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
                        }, import("zod/v4/core").$strict>>;
                    }, import("zod/v4/core").$strict> | import("zod").ZodObject<{
                        everywhere: import("zod").ZodBoolean;
                    }, import("zod/v4/core").$strict>;
                };
            };
        };
    };
    responses: {
        200: {
            description: string;
            content: {
                "application/json": {
                    schema: import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            challengeId: import("zod").ZodUUID;
                            expiresIn: import("zod").ZodNumber;
                            resendAfter: import("zod").ZodNumber;
                        }, import("zod/v4/core").$strict>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip> | import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            accountId: import("zod").ZodUUID;
                            ownerId: import("zod").ZodUUID;
                            email: import("zod").ZodEmail;
                        }, import("zod/v4/core").$strict>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip> | import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            signedOut: import("zod").ZodLiteral<true>;
                        }, import("zod/v4/core").$strict>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        400: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        401: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        403: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        429: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        503: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
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
                    schema: import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            accountId: import("zod").ZodUUID;
                            ownerId: import("zod").ZodUUID;
                            email: import("zod").ZodEmail;
                        }, import("zod/v4/core").$strict>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        401: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        503: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
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
                    schema: import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            accountId: import("zod").ZodUUID;
                            ownerId: import("zod").ZodUUID;
                            email: import("zod").ZodEmail;
                        }, import("zod/v4/core").$strict>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        401: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        403: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        503: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
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
                    schema: import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            accessToken: import("zod").ZodString;
                            tokenType: import("zod").ZodLiteral<"Bearer">;
                            expiresAt: import("zod").ZodISODateTime;
                            expiresIn: import("zod").ZodLiteral<300>;
                        }, import("zod/v4/core").$strict>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        401: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        403: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        503: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
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
                    schema: import("zod").ZodObject<{
                        email: import("zod").ZodEmail;
                        language: import("zod").ZodEnum<{
                            de: "de";
                            en: "en";
                        }>;
                    }, import("zod/v4/core").$strict> | import("zod").ZodObject<{
                        everywhere: import("zod").ZodBoolean;
                    }, import("zod/v4/core").$strict> | import("zod").ZodObject<{
                        challengeId: import("zod").ZodUUID;
                        code: import("zod").ZodString;
                        preferences: import("zod").ZodOptional<import("zod").ZodObject<{
                            language: import("zod").ZodEnum<{
                                de: "de";
                                en: "en";
                            }>;
                            citationStyle: import("zod").ZodEnum<{
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
                        }, import("zod/v4/core").$strict>>;
                        transactionCredential: import("zod").ZodString;
                    }, import("zod/v4/core").$strict>;
                };
            };
        };
    } | undefined;
    responses: {
        200: {
            description: string;
            content: {
                "application/json": {
                    schema: import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            accessToken: import("zod").ZodString;
                            tokenType: import("zod").ZodLiteral<"Bearer">;
                            expiresAt: import("zod").ZodISODateTime;
                            expiresIn: import("zod").ZodLiteral<300>;
                        }, import("zod/v4/core").$strict>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip> | import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            accountId: import("zod").ZodUUID;
                            ownerId: import("zod").ZodUUID;
                            email: import("zod").ZodEmail;
                        }, import("zod/v4/core").$strict>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip> | import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            signedOut: import("zod").ZodLiteral<true>;
                        }, import("zod/v4/core").$strict>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip> | import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            challengeId: import("zod").ZodUUID;
                            expiresIn: import("zod").ZodNumber;
                            resendAfter: import("zod").ZodNumber;
                            transactionCredential: import("zod").ZodString;
                        }, import("zod/v4/core").$strict>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip> | import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            session: import("zod").ZodObject<{
                                accountId: import("zod").ZodUUID;
                                ownerId: import("zod").ZodUUID;
                                email: import("zod").ZodEmail;
                            }, import("zod/v4/core").$strict>;
                            sessionCredential: import("zod").ZodString;
                        }, import("zod/v4/core").$strict>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        400: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        401: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        403: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        429: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        503: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
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
                    schema: import("zod").ZodObject<{
                        language: import("zod").ZodOptional<import("zod").ZodEnum<{
                            de: "de";
                            en: "en";
                        }>>;
                        citationStyle: import("zod").ZodOptional<import("zod").ZodEnum<{
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
                    }, import("zod/v4/core").$strict>;
                };
            };
        };
    } | undefined;
    responses: {
        200: {
            description: string;
            content: {
                "application/json": {
                    schema: import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            language: import("zod").ZodEnum<{
                                de: "de";
                                en: "en";
                            }>;
                            citationStyle: import("zod").ZodString;
                        }, import("zod/v4/core").$strict>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        400: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        401: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        403: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        429: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        503: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
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
                    schema: import("zod").ZodObject<{
                        challengeId: import("zod").ZodUUID;
                        code: import("zod").ZodString;
                        preferences: import("zod").ZodOptional<import("zod").ZodObject<{
                            language: import("zod").ZodEnum<{
                                de: "de";
                                en: "en";
                            }>;
                            citationStyle: import("zod").ZodEnum<{
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
                        }, import("zod/v4/core").$strict>>;
                    }, import("zod/v4/core").$strict> | import("zod").ZodObject<{
                        action: import("zod").ZodEnum<{
                            "account-deletion": "account-deletion";
                            "email-change": "email-change";
                        }>;
                        language: import("zod").ZodEnum<{
                            de: "de";
                            en: "en";
                        }>;
                    }, import("zod/v4/core").$strict> | import("zod").ZodObject<{
                        newEmail: import("zod").ZodEmail;
                        language: import("zod").ZodEnum<{
                            de: "de";
                            en: "en";
                        }>;
                    }, import("zod/v4/core").$strict> | import("zod").ZodObject<{
                        billingRetentionAcknowledged: import("zod").ZodLiteral<true>;
                        billingRetentionYears: import("zod").ZodLiteral<8>;
                    }, import("zod/v4/core").$strict>;
                };
            };
        };
    };
    responses: {
        200: {
            description: string;
            content: {
                "application/json": {
                    schema: import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            challengeId: import("zod").ZodUUID;
                            expiresIn: import("zod").ZodNumber;
                            resendAfter: import("zod").ZodNumber;
                        }, import("zod/v4/core").$strict>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip> | import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            accountId: import("zod").ZodUUID;
                            ownerId: import("zod").ZodUUID;
                            email: import("zod").ZodEmail;
                        }, import("zod/v4/core").$strict>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip> | import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            challengeId: import("zod").ZodUUID;
                            action: import("zod").ZodEnum<{
                                "account-deletion": "account-deletion";
                                "email-change": "email-change";
                            }>;
                            expiresIn: import("zod").ZodNumber;
                            resendAfter: import("zod").ZodNumber;
                        }, import("zod/v4/core").$strict>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip> | import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            action: import("zod").ZodEnum<{
                                "account-deletion": "account-deletion";
                                "email-change": "email-change";
                            }>;
                            expiresAt: import("zod").ZodISODateTime;
                            expiresIn: import("zod").ZodNumber;
                        }, import("zod/v4/core").$strict>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip> | import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            status: import("zod").ZodEnum<{
                                deleted: "deleted";
                                "in-progress": "in-progress";
                            }>;
                        }, import("zod/v4/core").$strict>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                            granted: import("zod").ZodNumber;
                            reserved: import("zod").ZodNumber;
                            warning: import("zod").ZodEnum<{
                                eighty: "eighty";
                                exhausted: "exhausted";
                                none: "none";
                            }>;
                            grants: import("zod").ZodArray<import("zod").ZodObject<{
                                kind: import("zod").ZodEnum<{
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
                            history: import("zod").ZodOptional<import("zod").ZodObject<{
                                extendedUntil: import("zod").ZodNullable<import("zod").ZodISODateTime>;
                                authorityVersion: import("zod").ZodNumber;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"unavailable">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        400: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        401: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        403: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        429: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        501: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        503: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        retryAt: import("zod").ZodOptional<import("zod").ZodISODateTime>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
    };
} & {
    getRoutingPath(): `/v1/account${string}` | `/v1/extension/account${string}`;
}))[];
