import { z } from "zod";
export declare const createMailRehearsal: {
    method: "post";
    path: "/internal/mail-rehearsals";
    summary: string;
    request: {
        headers: z.ZodObject<{
            "idempotency-key": z.ZodString;
        }, z.core.$strip>;
        body: {
            required: true;
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        language: z.ZodEnum<{
                            de: "de";
                            en: "en";
                        }>;
                    }, z.core.$strict>;
                };
            };
        };
    };
    responses: {
        201: {
            description: string;
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        data: z.ZodObject<{
                            id: z.ZodUUID;
                            language: z.ZodEnum<{
                                de: "de";
                                en: "en";
                            }>;
                            status: z.ZodEnum<{
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
                        code: z.ZodString;
                        i18nKey: z.ZodString;
                    }, z.core.$strip>;
                };
            };
        };
    };
} & {
    getRoutingPath(): "/internal/mail-rehearsals";
};
export declare const getMailRehearsal: {
    method: "get";
    path: "/internal/mail-rehearsals/{id}";
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
                            id: z.ZodUUID;
                            language: z.ZodEnum<{
                                de: "de";
                                en: "en";
                            }>;
                            status: z.ZodEnum<{
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
                        code: z.ZodString;
                        i18nKey: z.ZodString;
                    }, z.core.$strip>;
                };
            };
        };
    };
} & {
    getRoutingPath(): "/internal/mail-rehearsals/:id";
};
export declare const authorizeGuest: {
    method: "post";
    path: "/internal/guest-authority";
    summary: string;
    request: {
        body: {
            required: true;
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        guestContextId: z.ZodUUID;
                        ownerId: z.ZodUUID;
                        actorId: z.ZodUUID;
                        permission: z.ZodEnum<{
                            "check:cancel": "check:cancel";
                            "check:create": "check:create";
                            "check:read": "check:read";
                            "check:renew": "check:renew";
                            "structuring:create": "structuring:create";
                        }>;
                        kind: z.ZodEnum<{
                            request: "request";
                            work: "work";
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
                    schema: z.ZodDiscriminatedUnion<[z.ZodObject<{
                        allowed: z.ZodLiteral<true>;
                        version: z.ZodNumber;
                    }, z.core.$strict>, z.ZodObject<{
                        allowed: z.ZodLiteral<false>;
                        reason: z.ZodEnum<{
                            forbidden: "forbidden";
                            revoked: "revoked";
                            unknown: "unknown";
                        }>;
                    }, z.core.$strict>], "allowed">;
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
                        code: z.ZodString;
                        i18nKey: z.ZodString;
                    }, z.core.$strip>;
                };
            };
        };
    };
} & {
    getRoutingPath(): "/internal/guest-authority";
};
export declare const invalidateGuest: {
    method: "post";
    path: "/internal/guest-authority/invalidate";
    summary: string;
    request: {
        body: {
            required: true;
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        guestContextId: z.ZodOptional<z.ZodUUID>;
                        ownerId: z.ZodUUID;
                        actorId: z.ZodUUID;
                        version: z.ZodNumber;
                        cancelWork: z.ZodBoolean;
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
                        ownerId: z.ZodUUID;
                        version: z.ZodNumber;
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
                        code: z.ZodString;
                        i18nKey: z.ZodString;
                    }, z.core.$strip>;
                };
            };
        };
    };
} & {
    getRoutingPath(): "/internal/guest-authority/invalidate";
};
export declare const authorizeAccount: {
    method: "post";
    path: "/internal/account-authority";
    summary: string;
    request: {
        body: {
            required: true;
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        actorId: z.ZodUUID;
                        ownerId: z.ZodUUID;
                        sessionId: z.ZodOptional<z.ZodUUID>;
                        permission: z.ZodEnum<{
                            "check:cancel": "check:cancel";
                            "check:create": "check:create";
                            "check:read": "check:read";
                            "check:renew": "check:renew";
                            "structuring:create": "structuring:create";
                        }>;
                        kind: z.ZodEnum<{
                            request: "request";
                            work: "work";
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
                    schema: z.ZodDiscriminatedUnion<[z.ZodObject<{
                        allowed: z.ZodLiteral<true>;
                        version: z.ZodNumber;
                    }, z.core.$strict>, z.ZodObject<{
                        allowed: z.ZodLiteral<false>;
                        reason: z.ZodEnum<{
                            forbidden: "forbidden";
                            revoked: "revoked";
                            unknown: "unknown";
                        }>;
                    }, z.core.$strict>], "allowed">;
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
                        code: z.ZodString;
                        i18nKey: z.ZodString;
                    }, z.core.$strip>;
                };
            };
        };
    };
} & {
    getRoutingPath(): "/internal/account-authority";
};
export declare const quotaSnapshot: {
    method: "post";
    path: `/internal/quota/${string}`;
    summary: string;
    request: {
        body: {
            required: true;
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        ownerId: z.ZodUUID;
                        actorId: z.ZodUUID;
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
                    schema: z.ZodDiscriminatedUnion<[z.ZodObject<{
                        outcome: z.ZodLiteral<"granted">;
                        quota: z.ZodObject<{
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
                        }, z.core.$strip>;
                    }, z.core.$strict>, z.ZodObject<{
                        outcome: z.ZodLiteral<"denied">;
                        reason: z.ZodEnum<{
                            forbidden: "forbidden";
                            revoked: "revoked";
                            unknown: "unknown";
                        }>;
                    }, z.core.$strict>], "outcome">;
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
                        code: z.ZodString;
                        i18nKey: z.ZodString;
                    }, z.core.$strip>;
                };
            };
        };
    };
} & {
    getRoutingPath(): `/internal/quota/${string}`;
};
export declare const quotaReserve: {
    method: "post";
    path: `/internal/quota/${string}`;
    summary: string;
    request: {
        body: {
            required: true;
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        ownerId: z.ZodUUID;
                        actorId: z.ZodUUID;
                        checkId: z.ZodUUID;
                        key: z.ZodString;
                        slots: z.ZodArray<z.ZodObject<{
                            position: z.ZodNumber;
                            generation: z.ZodNumber;
                        }, z.core.$strict>>;
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
                    schema: z.ZodDiscriminatedUnion<[z.ZodObject<{
                        outcome: z.ZodLiteral<"reserved">;
                        free: z.ZodArray<z.ZodNumber>;
                        reserved: z.ZodNumber;
                        quota: z.ZodObject<{
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
                        }, z.core.$strip>;
                    }, z.core.$strict>, z.ZodObject<{
                        outcome: z.ZodLiteral<"insufficient">;
                        available: z.ZodNumber;
                        required: z.ZodNumber;
                        quota: z.ZodObject<{
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
                        }, z.core.$strip>;
                    }, z.core.$strict>, z.ZodObject<{
                        outcome: z.ZodLiteral<"denied">;
                        reason: z.ZodEnum<{
                            forbidden: "forbidden";
                            revoked: "revoked";
                            unknown: "unknown";
                        }>;
                    }, z.core.$strict>], "outcome">;
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
                        code: z.ZodString;
                        i18nKey: z.ZodString;
                    }, z.core.$strip>;
                };
            };
        };
    };
} & {
    getRoutingPath(): `/internal/quota/${string}`;
};
export declare const quotaSettle: {
    method: "post";
    path: `/internal/quota/${string}`;
    summary: string;
    request: {
        body: {
            required: true;
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        ownerId: z.ZodUUID;
                        actorId: z.ZodUUID;
                        checkId: z.ZodUUID;
                        position: z.ZodNumber;
                        generation: z.ZodNumber;
                        outcome: z.ZodEnum<{
                            release: "release";
                            verdict: "verdict";
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
                        outcome: z.ZodEnum<{
                            debited: "debited";
                            forgiven: "forgiven";
                            free: "free";
                            ignored: "ignored";
                            released: "released";
                        }>;
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
                        code: z.ZodString;
                        i18nKey: z.ZodString;
                    }, z.core.$strip>;
                };
            };
        };
    };
} & {
    getRoutingPath(): `/internal/quota/${string}`;
};
export declare const quotaRelease: {
    method: "post";
    path: `/internal/quota/${string}`;
    summary: string;
    request: {
        body: {
            required: true;
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        ownerId: z.ZodUUID;
                        actorId: z.ZodUUID;
                        checkId: z.ZodUUID;
                        key: z.ZodString;
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
                        released: z.ZodNumber;
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
                        code: z.ZodString;
                        i18nKey: z.ZodString;
                    }, z.core.$strip>;
                };
            };
        };
    };
} & {
    getRoutingPath(): `/internal/quota/${string}`;
};
export declare const routes: (({
    method: "post";
    path: "/internal/mail-rehearsals";
    summary: string;
    request: {
        headers: z.ZodObject<{
            "idempotency-key": z.ZodString;
        }, z.core.$strip>;
        body: {
            required: true;
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        language: z.ZodEnum<{
                            de: "de";
                            en: "en";
                        }>;
                    }, z.core.$strict>;
                };
            };
        };
    };
    responses: {
        201: {
            description: string;
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        data: z.ZodObject<{
                            id: z.ZodUUID;
                            language: z.ZodEnum<{
                                de: "de";
                                en: "en";
                            }>;
                            status: z.ZodEnum<{
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
                        code: z.ZodString;
                        i18nKey: z.ZodString;
                    }, z.core.$strip>;
                };
            };
        };
    };
} & {
    getRoutingPath(): "/internal/mail-rehearsals";
}) | ({
    method: "get";
    path: "/internal/mail-rehearsals/{id}";
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
                            id: z.ZodUUID;
                            language: z.ZodEnum<{
                                de: "de";
                                en: "en";
                            }>;
                            status: z.ZodEnum<{
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
                        code: z.ZodString;
                        i18nKey: z.ZodString;
                    }, z.core.$strip>;
                };
            };
        };
    };
} & {
    getRoutingPath(): "/internal/mail-rehearsals/:id";
}) | ({
    method: "post";
    path: "/internal/guest-authority";
    summary: string;
    request: {
        body: {
            required: true;
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        guestContextId: z.ZodUUID;
                        ownerId: z.ZodUUID;
                        actorId: z.ZodUUID;
                        permission: z.ZodEnum<{
                            "check:cancel": "check:cancel";
                            "check:create": "check:create";
                            "check:read": "check:read";
                            "check:renew": "check:renew";
                            "structuring:create": "structuring:create";
                        }>;
                        kind: z.ZodEnum<{
                            request: "request";
                            work: "work";
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
                    schema: z.ZodDiscriminatedUnion<[z.ZodObject<{
                        allowed: z.ZodLiteral<true>;
                        version: z.ZodNumber;
                    }, z.core.$strict>, z.ZodObject<{
                        allowed: z.ZodLiteral<false>;
                        reason: z.ZodEnum<{
                            forbidden: "forbidden";
                            revoked: "revoked";
                            unknown: "unknown";
                        }>;
                    }, z.core.$strict>], "allowed">;
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
                        code: z.ZodString;
                        i18nKey: z.ZodString;
                    }, z.core.$strip>;
                };
            };
        };
    };
} & {
    getRoutingPath(): "/internal/guest-authority";
}) | ({
    method: "post";
    path: "/internal/guest-authority/invalidate";
    summary: string;
    request: {
        body: {
            required: true;
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        guestContextId: z.ZodOptional<z.ZodUUID>;
                        ownerId: z.ZodUUID;
                        actorId: z.ZodUUID;
                        version: z.ZodNumber;
                        cancelWork: z.ZodBoolean;
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
                        ownerId: z.ZodUUID;
                        version: z.ZodNumber;
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
                        code: z.ZodString;
                        i18nKey: z.ZodString;
                    }, z.core.$strip>;
                };
            };
        };
    };
} & {
    getRoutingPath(): "/internal/guest-authority/invalidate";
}) | ({
    method: "post";
    path: "/internal/account-authority";
    summary: string;
    request: {
        body: {
            required: true;
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        actorId: z.ZodUUID;
                        ownerId: z.ZodUUID;
                        sessionId: z.ZodOptional<z.ZodUUID>;
                        permission: z.ZodEnum<{
                            "check:cancel": "check:cancel";
                            "check:create": "check:create";
                            "check:read": "check:read";
                            "check:renew": "check:renew";
                            "structuring:create": "structuring:create";
                        }>;
                        kind: z.ZodEnum<{
                            request: "request";
                            work: "work";
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
                    schema: z.ZodDiscriminatedUnion<[z.ZodObject<{
                        allowed: z.ZodLiteral<true>;
                        version: z.ZodNumber;
                    }, z.core.$strict>, z.ZodObject<{
                        allowed: z.ZodLiteral<false>;
                        reason: z.ZodEnum<{
                            forbidden: "forbidden";
                            revoked: "revoked";
                            unknown: "unknown";
                        }>;
                    }, z.core.$strict>], "allowed">;
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
                        code: z.ZodString;
                        i18nKey: z.ZodString;
                    }, z.core.$strip>;
                };
            };
        };
    };
} & {
    getRoutingPath(): "/internal/account-authority";
}) | ({
    method: "post";
    path: `/internal/quota/${string}`;
    summary: string;
    request: {
        body: {
            required: true;
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        ownerId: z.ZodUUID;
                        actorId: z.ZodUUID;
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
                    schema: z.ZodDiscriminatedUnion<[z.ZodObject<{
                        outcome: z.ZodLiteral<"granted">;
                        quota: z.ZodObject<{
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
                        }, z.core.$strip>;
                    }, z.core.$strict>, z.ZodObject<{
                        outcome: z.ZodLiteral<"denied">;
                        reason: z.ZodEnum<{
                            forbidden: "forbidden";
                            revoked: "revoked";
                            unknown: "unknown";
                        }>;
                    }, z.core.$strict>], "outcome">;
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
                        code: z.ZodString;
                        i18nKey: z.ZodString;
                    }, z.core.$strip>;
                };
            };
        };
    };
} & {
    getRoutingPath(): `/internal/quota/${string}`;
}) | ({
    method: "post";
    path: `/internal/quota/${string}`;
    summary: string;
    request: {
        body: {
            required: true;
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        ownerId: z.ZodUUID;
                        actorId: z.ZodUUID;
                        checkId: z.ZodUUID;
                        key: z.ZodString;
                        slots: z.ZodArray<z.ZodObject<{
                            position: z.ZodNumber;
                            generation: z.ZodNumber;
                        }, z.core.$strict>>;
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
                    schema: z.ZodDiscriminatedUnion<[z.ZodObject<{
                        outcome: z.ZodLiteral<"reserved">;
                        free: z.ZodArray<z.ZodNumber>;
                        reserved: z.ZodNumber;
                        quota: z.ZodObject<{
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
                        }, z.core.$strip>;
                    }, z.core.$strict>, z.ZodObject<{
                        outcome: z.ZodLiteral<"insufficient">;
                        available: z.ZodNumber;
                        required: z.ZodNumber;
                        quota: z.ZodObject<{
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
                        }, z.core.$strip>;
                    }, z.core.$strict>, z.ZodObject<{
                        outcome: z.ZodLiteral<"denied">;
                        reason: z.ZodEnum<{
                            forbidden: "forbidden";
                            revoked: "revoked";
                            unknown: "unknown";
                        }>;
                    }, z.core.$strict>], "outcome">;
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
                        code: z.ZodString;
                        i18nKey: z.ZodString;
                    }, z.core.$strip>;
                };
            };
        };
    };
} & {
    getRoutingPath(): `/internal/quota/${string}`;
}) | ({
    method: "post";
    path: `/internal/quota/${string}`;
    summary: string;
    request: {
        body: {
            required: true;
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        ownerId: z.ZodUUID;
                        actorId: z.ZodUUID;
                        checkId: z.ZodUUID;
                        position: z.ZodNumber;
                        generation: z.ZodNumber;
                        outcome: z.ZodEnum<{
                            release: "release";
                            verdict: "verdict";
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
                        outcome: z.ZodEnum<{
                            debited: "debited";
                            forgiven: "forgiven";
                            free: "free";
                            ignored: "ignored";
                            released: "released";
                        }>;
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
                        code: z.ZodString;
                        i18nKey: z.ZodString;
                    }, z.core.$strip>;
                };
            };
        };
    };
} & {
    getRoutingPath(): `/internal/quota/${string}`;
}) | ({
    method: "post";
    path: `/internal/quota/${string}`;
    summary: string;
    request: {
        body: {
            required: true;
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        ownerId: z.ZodUUID;
                        actorId: z.ZodUUID;
                        checkId: z.ZodUUID;
                        key: z.ZodString;
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
                        released: z.ZodNumber;
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
                        code: z.ZodString;
                        i18nKey: z.ZodString;
                    }, z.core.$strip>;
                };
            };
        };
    };
} & {
    getRoutingPath(): `/internal/quota/${string}`;
}))[];
