import { z } from "zod";
export declare const createReport: {
    method: "post";
    path: "/v2/checks/{checkId}/reports";
    summary: string;
    description: string;
    request: {
        params: z.ZodObject<{
            checkId: z.ZodUUID;
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
                        style: z.ZodEnum<{
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
                        documentName: z.ZodOptional<z.ZodString>;
                    }, z.core.$strict>;
                };
            };
        };
    };
    responses: {
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
        410: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: z.ZodObject<{
                        type: z.ZodString;
                        title: z.ZodString;
                        status: z.ZodNumber;
                        detail: z.ZodOptional<z.ZodString>;
                        limit: z.ZodOptional<z.ZodNumber>;
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
        429: {
            description: string;
            headers: z.ZodObject<{
                "Retry-After": z.ZodString;
            }, z.core.$strip>;
            content: {
                "application/problem+json": {
                    schema: z.ZodObject<{
                        type: z.ZodString;
                        title: z.ZodString;
                        detail: z.ZodOptional<z.ZodString>;
                        limit: z.ZodOptional<z.ZodNumber>;
                        available: z.ZodOptional<z.ZodNumber>;
                        required: z.ZodOptional<z.ZodNumber>;
                        status: z.ZodLiteral<429>;
                        code: z.ZodLiteral<"abuse-limit">;
                        i18nKey: z.ZodLiteral<"problem_abuse_limit">;
                        retryAt: z.ZodISODateTime;
                    }, z.core.$strip>;
                };
            };
        };
        202: {
            description: string;
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        data: z.ZodObject<{
                            id: z.ZodUUID;
                            checkId: z.ZodUUID;
                            language: z.ZodEnum<{
                                de: "de";
                                en: "en";
                            }>;
                            state: z.ZodEnum<{
                                cancelled: "cancelled";
                                failed: "failed";
                                generating: "generating";
                                queued: "queued";
                                ready: "ready";
                            }>;
                            failure: z.ZodOptional<z.ZodEnum<{
                                "limit-exceeded": "limit-exceeded";
                                unavailable: "unavailable";
                                "unsupported-character": "unsupported-character";
                            }>>;
                            intermediate: z.ZodOptional<z.ZodBoolean>;
                            expiresAt: z.ZodString;
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
    };
} & {
    getRoutingPath(): "/v2/checks/:checkId/reports";
};
export declare const getReport: {
    method: "get";
    path: "/v2/checks/{checkId}/reports/{reportId}";
    summary: string;
    request: {
        params: z.ZodObject<{
            checkId: z.ZodUUID;
            reportId: z.ZodUUID;
        }, z.core.$strip>;
    };
    responses: {
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
        410: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: z.ZodObject<{
                        type: z.ZodString;
                        title: z.ZodString;
                        status: z.ZodNumber;
                        detail: z.ZodOptional<z.ZodString>;
                        limit: z.ZodOptional<z.ZodNumber>;
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
        429: {
            description: string;
            headers: z.ZodObject<{
                "Retry-After": z.ZodString;
            }, z.core.$strip>;
            content: {
                "application/problem+json": {
                    schema: z.ZodObject<{
                        type: z.ZodString;
                        title: z.ZodString;
                        detail: z.ZodOptional<z.ZodString>;
                        limit: z.ZodOptional<z.ZodNumber>;
                        available: z.ZodOptional<z.ZodNumber>;
                        required: z.ZodOptional<z.ZodNumber>;
                        status: z.ZodLiteral<429>;
                        code: z.ZodLiteral<"abuse-limit">;
                        i18nKey: z.ZodLiteral<"problem_abuse_limit">;
                        retryAt: z.ZodISODateTime;
                    }, z.core.$strip>;
                };
            };
        };
        200: {
            description: string;
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        data: z.ZodObject<{
                            id: z.ZodUUID;
                            checkId: z.ZodUUID;
                            language: z.ZodEnum<{
                                de: "de";
                                en: "en";
                            }>;
                            state: z.ZodEnum<{
                                cancelled: "cancelled";
                                failed: "failed";
                                generating: "generating";
                                queued: "queued";
                                ready: "ready";
                            }>;
                            failure: z.ZodOptional<z.ZodEnum<{
                                "limit-exceeded": "limit-exceeded";
                                unavailable: "unavailable";
                                "unsupported-character": "unsupported-character";
                            }>>;
                            intermediate: z.ZodOptional<z.ZodBoolean>;
                            expiresAt: z.ZodString;
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
    };
} & {
    getRoutingPath(): "/v2/checks/:checkId/reports/:reportId";
};
export declare const downloadReport: {
    method: "get";
    path: "/v2/checks/{checkId}/reports/{reportId}/file";
    summary: string;
    description: string;
    request: {
        params: z.ZodObject<{
            checkId: z.ZodUUID;
            reportId: z.ZodUUID;
        }, z.core.$strip>;
    };
    responses: {
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
        410: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: z.ZodObject<{
                        type: z.ZodString;
                        title: z.ZodString;
                        status: z.ZodNumber;
                        detail: z.ZodOptional<z.ZodString>;
                        limit: z.ZodOptional<z.ZodNumber>;
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
        429: {
            description: string;
            headers: z.ZodObject<{
                "Retry-After": z.ZodString;
            }, z.core.$strip>;
            content: {
                "application/problem+json": {
                    schema: z.ZodObject<{
                        type: z.ZodString;
                        title: z.ZodString;
                        detail: z.ZodOptional<z.ZodString>;
                        limit: z.ZodOptional<z.ZodNumber>;
                        available: z.ZodOptional<z.ZodNumber>;
                        required: z.ZodOptional<z.ZodNumber>;
                        status: z.ZodLiteral<429>;
                        code: z.ZodLiteral<"abuse-limit">;
                        i18nKey: z.ZodLiteral<"problem_abuse_limit">;
                        retryAt: z.ZodISODateTime;
                    }, z.core.$strip>;
                };
            };
        };
        200: {
            description: string;
            content: {
                "application/pdf": {
                    schema: z.ZodString;
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
    };
} & {
    getRoutingPath(): "/v2/checks/:checkId/reports/:reportId/file";
};
export declare const cancelReport: {
    method: "delete";
    path: "/v2/checks/{checkId}/reports/{reportId}";
    summary: string;
    description: string;
    request: {
        params: z.ZodObject<{
            checkId: z.ZodUUID;
            reportId: z.ZodUUID;
        }, z.core.$strip>;
    };
    responses: {
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
        410: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: z.ZodObject<{
                        type: z.ZodString;
                        title: z.ZodString;
                        status: z.ZodNumber;
                        detail: z.ZodOptional<z.ZodString>;
                        limit: z.ZodOptional<z.ZodNumber>;
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
        429: {
            description: string;
            headers: z.ZodObject<{
                "Retry-After": z.ZodString;
            }, z.core.$strip>;
            content: {
                "application/problem+json": {
                    schema: z.ZodObject<{
                        type: z.ZodString;
                        title: z.ZodString;
                        detail: z.ZodOptional<z.ZodString>;
                        limit: z.ZodOptional<z.ZodNumber>;
                        available: z.ZodOptional<z.ZodNumber>;
                        required: z.ZodOptional<z.ZodNumber>;
                        status: z.ZodLiteral<429>;
                        code: z.ZodLiteral<"abuse-limit">;
                        i18nKey: z.ZodLiteral<"problem_abuse_limit">;
                        retryAt: z.ZodISODateTime;
                    }, z.core.$strip>;
                };
            };
        };
        200: {
            description: string;
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        data: z.ZodObject<{
                            id: z.ZodUUID;
                            checkId: z.ZodUUID;
                            language: z.ZodEnum<{
                                de: "de";
                                en: "en";
                            }>;
                            state: z.ZodEnum<{
                                cancelled: "cancelled";
                                failed: "failed";
                                generating: "generating";
                                queued: "queued";
                                ready: "ready";
                            }>;
                            failure: z.ZodOptional<z.ZodEnum<{
                                "limit-exceeded": "limit-exceeded";
                                unavailable: "unavailable";
                                "unsupported-character": "unsupported-character";
                            }>>;
                            intermediate: z.ZodOptional<z.ZodBoolean>;
                            expiresAt: z.ZodString;
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
    };
} & {
    getRoutingPath(): "/v2/checks/:checkId/reports/:reportId";
};
