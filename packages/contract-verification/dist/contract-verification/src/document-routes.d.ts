export declare const structureDocument: {
    method: "post";
    path: "/v2/document-structurings";
    summary: string;
    description: string;
    request: {
        body: {
            required: true;
            content: {
                "multipart/form-data": {
                    schema: import("zod").ZodObject<{
                        file: import("zod").ZodAny;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
    };
    responses: {
        429: {
            description: string;
            headers: import("zod").ZodObject<{
                "Retry-After": import("zod").ZodString;
            }, import("zod/v4/core").$strip>;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        status: import("zod").ZodLiteral<429>;
                        code: import("zod").ZodLiteral<"abuse-limit">;
                        i18nKey: import("zod").ZodLiteral<"problem_abuse_limit">;
                        retryAt: import("zod").ZodISODateTime;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        200: {
            description: string;
            content: {
                "application/json": {
                    schema: import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            document: import("zod").ZodObject<{
                                format: import("zod").ZodEnum<{
                                    docx: "docx";
                                    pdf: "pdf";
                                }>;
                                text: import("zod").ZodString;
                                notice: import("zod").ZodNullable<import("zod").ZodLiteral<"partial-no-text">>;
                            }, import("zod/v4/core").$strip>;
                            structuring: import("zod").ZodObject<{
                                rejected: import("zod").ZodArray<import("zod").ZodObject<{
                                    originalText: import("zod").ZodString;
                                    span: import("zod").ZodObject<{
                                        start: import("zod").ZodNumber;
                                        end: import("zod").ZodNumber;
                                    }, import("zod/v4/core").$strip>;
                                    reason: import("zod").ZodLiteral<"no-reference-features">;
                                }, import("zod/v4/core").$strip>>;
                                guidance: import("zod").ZodNullable<import("zod").ZodLiteral<"no-references">>;
                                quotaConsumed: import("zod").ZodLiteral<0>;
                                referenceLimit: import("zod").ZodNumber;
                                receipt: import("zod").ZodOptional<import("zod").ZodObject<{
                                    expiresAt: import("zod").ZodNumber;
                                    signature: import("zod").ZodString;
                                }, import("zod/v4/core").$strip>>;
                                references: import("zod").ZodArray<import("zod").ZodObject<{
                                    originalText: import("zod").ZodString;
                                    span: import("zod").ZodObject<{
                                        start: import("zod").ZodNumber;
                                        end: import("zod").ZodNumber;
                                    }, import("zod/v4/core").$strip>;
                                    authorsTruncated: import("zod").ZodOptional<import("zod").ZodBoolean>;
                                    csl: import("zod").ZodObject<{
                                        type: import("zod").ZodOptional<import("zod").ZodString>;
                                        author: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodObject<{
                                            family: import("zod").ZodOptional<import("zod").ZodString>;
                                            "non-dropping-particle": import("zod").ZodOptional<import("zod").ZodString>;
                                            given: import("zod").ZodOptional<import("zod").ZodString>;
                                            literal: import("zod").ZodOptional<import("zod").ZodString>;
                                        }, import("zod/v4/core").$strip>>>;
                                        issued: import("zod").ZodOptional<import("zod").ZodObject<{
                                            literal: import("zod").ZodString;
                                        }, import("zod/v4/core").$strip>>;
                                        title: import("zod").ZodOptional<import("zod").ZodString>;
                                        "container-title": import("zod").ZodOptional<import("zod").ZodString>;
                                        "container-title-short": import("zod").ZodOptional<import("zod").ZodString>;
                                        publisher: import("zod").ZodOptional<import("zod").ZodString>;
                                        "publisher-place": import("zod").ZodOptional<import("zod").ZodString>;
                                        volume: import("zod").ZodOptional<import("zod").ZodString>;
                                        issue: import("zod").ZodOptional<import("zod").ZodString>;
                                        page: import("zod").ZodOptional<import("zod").ZodString>;
                                        "article-number": import("zod").ZodOptional<import("zod").ZodString>;
                                        edition: import("zod").ZodOptional<import("zod").ZodString>;
                                        DOI: import("zod").ZodOptional<import("zod").ZodString>;
                                        URL: import("zod").ZodOptional<import("zod").ZodString>;
                                        ISBN: import("zod").ZodOptional<import("zod").ZodString>;
                                        ISSN: import("zod").ZodOptional<import("zod").ZodString>;
                                        PMID: import("zod").ZodOptional<import("zod").ZodString>;
                                        PMCID: import("zod").ZodOptional<import("zod").ZodString>;
                                        arXiv: import("zod").ZodOptional<import("zod").ZodString>;
                                    }, import("zod/v4/core").$strip>;
                                    fieldSources: import("zod").ZodRecord<import("zod").ZodString, import("zod").ZodObject<{
                                        raw: import("zod").ZodString;
                                        span: import("zod").ZodOptional<import("zod").ZodObject<{
                                            start: import("zod").ZodNumber;
                                            end: import("zod").ZodNumber;
                                        }, import("zod/v4/core").$strip>>;
                                        normalized: import("zod").ZodOptional<import("zod").ZodString>;
                                        provenance: import("zod").ZodOptional<import("zod").ZodEnum<{
                                            ai: "ai";
                                            parser: "parser";
                                            user: "user";
                                        }>>;
                                    }, import("zod/v4/core").$strip>>;
                                    structuring: import("zod").ZodObject<{
                                        path: import("zod").ZodEnum<{
                                            ai: "ai";
                                            parser: "parser";
                                            user: "user";
                                        }>;
                                        version: import("zod").ZodString;
                                    }, import("zod/v4/core").$strip>;
                                    ai: import("zod").ZodOptional<import("zod").ZodObject<{
                                        configuration: import("zod").ZodString;
                                        notice: import("zod").ZodLiteral<"ai-can-be-wrong">;
                                        proposals: import("zod").ZodArray<import("zod").ZodObject<{
                                            field: import("zod").ZodString;
                                            value: import("zod").ZodUnknown;
                                            reason: import("zod").ZodLiteral<"ungrounded">;
                                        }, import("zod/v4/core").$strip>>;
                                        changedFields: import("zod").ZodArray<import("zod").ZodString>;
                                    }, import("zod/v4/core").$strip>>;
                                }, import("zod/v4/core").$strip>>;
                                ai: import("zod").ZodOptional<import("zod").ZodObject<{
                                    reason: import("zod").ZodNullable<import("zod").ZodEnum<{
                                        "configuration-unavailable": "configuration-unavailable";
                                        "feature-unavailable": "feature-unavailable";
                                        guest: "guest";
                                    }>>;
                                    upgrade: import("zod").ZodBoolean;
                                    fallbacks: import("zod").ZodArray<import("zod").ZodObject<{
                                        span: import("zod").ZodObject<{
                                            start: import("zod").ZodNumber;
                                            end: import("zod").ZodNumber;
                                        }, import("zod/v4/core").$strip>;
                                        reason: import("zod").ZodEnum<{
                                            "invalid-output": "invalid-output";
                                            "provider-unavailable": "provider-unavailable";
                                            timeout: "timeout";
                                        }>;
                                    }, import("zod/v4/core").$strip>>;
                                }, import("zod/v4/core").$strip>>;
                            }, import("zod/v4/core").$strip>;
                            selection: import("zod").ZodObject<{
                                version: import("zod").ZodString;
                                regions: import("zod").ZodArray<import("zod").ZodObject<{
                                    start: import("zod").ZodNumber;
                                    end: import("zod").ZodNumber;
                                }, import("zod/v4/core").$strip>>;
                            }, import("zod/v4/core").$strip>;
                            referenceLimitExceeded: import("zod").ZodBoolean;
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
                                    "check-pack": "check-pack";
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
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
        413: {
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
        415: {
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
        422: {
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
    getRoutingPath(): "/v2/document-structurings";
};
export declare const getDocumentSettings: {
    method: "get";
    path: "/v2/document-settings";
    summary: string;
    responses: {
        429: {
            description: string;
            headers: import("zod").ZodObject<{
                "Retry-After": import("zod").ZodString;
            }, import("zod/v4/core").$strip>;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        status: import("zod").ZodLiteral<429>;
                        code: import("zod").ZodLiteral<"abuse-limit">;
                        i18nKey: import("zod").ZodLiteral<"problem_abuse_limit">;
                        retryAt: import("zod").ZodISODateTime;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        200: {
            description: string;
            content: {
                "application/json": {
                    schema: import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            inputBytes: import("zod").ZodNumber;
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
                                    "check-pack": "check-pack";
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
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
    getRoutingPath(): "/v2/document-settings";
};
export declare const structureText: {
    method: "post";
    path: "/v2/structurings";
    summary: string;
    request: {
        body: {
            required: true;
            content: {
                "application/json": {
                    schema: import("zod").ZodObject<{
                        text: import("zod").ZodString;
                        document: import("zod").ZodOptional<import("zod").ZodBoolean>;
                        regions: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodObject<{
                            start: import("zod").ZodNumber;
                            end: import("zod").ZodNumber;
                        }, import("zod/v4/core").$strip>>>;
                    }, import("zod/v4/core").$strict>;
                };
            };
        };
    };
    responses: {
        429: {
            description: string;
            headers: import("zod").ZodObject<{
                "Retry-After": import("zod").ZodString;
            }, import("zod/v4/core").$strip>;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        available: import("zod").ZodOptional<import("zod").ZodNumber>;
                        required: import("zod").ZodOptional<import("zod").ZodNumber>;
                        status: import("zod").ZodLiteral<429>;
                        code: import("zod").ZodLiteral<"abuse-limit">;
                        i18nKey: import("zod").ZodLiteral<"problem_abuse_limit">;
                        retryAt: import("zod").ZodISODateTime;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        200: {
            description: string;
            content: {
                "application/json": {
                    schema: import("zod").ZodObject<{
                        data: import("zod").ZodObject<{
                            document: import("zod").ZodNullable<import("zod").ZodObject<{
                                text: import("zod").ZodString;
                                selection: import("zod").ZodObject<{
                                    version: import("zod").ZodString;
                                    regions: import("zod").ZodArray<import("zod").ZodObject<{
                                        start: import("zod").ZodNumber;
                                        end: import("zod").ZodNumber;
                                    }, import("zod/v4/core").$strip>>;
                                }, import("zod/v4/core").$strip>;
                            }, import("zod/v4/core").$strip>>;
                            structuring: import("zod").ZodObject<{
                                rejected: import("zod").ZodArray<import("zod").ZodObject<{
                                    originalText: import("zod").ZodString;
                                    span: import("zod").ZodObject<{
                                        start: import("zod").ZodNumber;
                                        end: import("zod").ZodNumber;
                                    }, import("zod/v4/core").$strip>;
                                    reason: import("zod").ZodLiteral<"no-reference-features">;
                                }, import("zod/v4/core").$strip>>;
                                guidance: import("zod").ZodNullable<import("zod").ZodLiteral<"no-references">>;
                                quotaConsumed: import("zod").ZodLiteral<0>;
                                referenceLimit: import("zod").ZodNumber;
                                receipt: import("zod").ZodOptional<import("zod").ZodObject<{
                                    expiresAt: import("zod").ZodNumber;
                                    signature: import("zod").ZodString;
                                }, import("zod/v4/core").$strip>>;
                                references: import("zod").ZodArray<import("zod").ZodObject<{
                                    originalText: import("zod").ZodString;
                                    span: import("zod").ZodObject<{
                                        start: import("zod").ZodNumber;
                                        end: import("zod").ZodNumber;
                                    }, import("zod/v4/core").$strip>;
                                    authorsTruncated: import("zod").ZodOptional<import("zod").ZodBoolean>;
                                    csl: import("zod").ZodObject<{
                                        type: import("zod").ZodOptional<import("zod").ZodString>;
                                        author: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodObject<{
                                            family: import("zod").ZodOptional<import("zod").ZodString>;
                                            "non-dropping-particle": import("zod").ZodOptional<import("zod").ZodString>;
                                            given: import("zod").ZodOptional<import("zod").ZodString>;
                                            literal: import("zod").ZodOptional<import("zod").ZodString>;
                                        }, import("zod/v4/core").$strip>>>;
                                        issued: import("zod").ZodOptional<import("zod").ZodObject<{
                                            literal: import("zod").ZodString;
                                        }, import("zod/v4/core").$strip>>;
                                        title: import("zod").ZodOptional<import("zod").ZodString>;
                                        "container-title": import("zod").ZodOptional<import("zod").ZodString>;
                                        "container-title-short": import("zod").ZodOptional<import("zod").ZodString>;
                                        publisher: import("zod").ZodOptional<import("zod").ZodString>;
                                        "publisher-place": import("zod").ZodOptional<import("zod").ZodString>;
                                        volume: import("zod").ZodOptional<import("zod").ZodString>;
                                        issue: import("zod").ZodOptional<import("zod").ZodString>;
                                        page: import("zod").ZodOptional<import("zod").ZodString>;
                                        "article-number": import("zod").ZodOptional<import("zod").ZodString>;
                                        edition: import("zod").ZodOptional<import("zod").ZodString>;
                                        DOI: import("zod").ZodOptional<import("zod").ZodString>;
                                        URL: import("zod").ZodOptional<import("zod").ZodString>;
                                        ISBN: import("zod").ZodOptional<import("zod").ZodString>;
                                        ISSN: import("zod").ZodOptional<import("zod").ZodString>;
                                        PMID: import("zod").ZodOptional<import("zod").ZodString>;
                                        PMCID: import("zod").ZodOptional<import("zod").ZodString>;
                                        arXiv: import("zod").ZodOptional<import("zod").ZodString>;
                                    }, import("zod/v4/core").$strip>;
                                    fieldSources: import("zod").ZodRecord<import("zod").ZodString, import("zod").ZodObject<{
                                        raw: import("zod").ZodString;
                                        span: import("zod").ZodOptional<import("zod").ZodObject<{
                                            start: import("zod").ZodNumber;
                                            end: import("zod").ZodNumber;
                                        }, import("zod/v4/core").$strip>>;
                                        normalized: import("zod").ZodOptional<import("zod").ZodString>;
                                        provenance: import("zod").ZodOptional<import("zod").ZodEnum<{
                                            ai: "ai";
                                            parser: "parser";
                                            user: "user";
                                        }>>;
                                    }, import("zod/v4/core").$strip>>;
                                    structuring: import("zod").ZodObject<{
                                        path: import("zod").ZodEnum<{
                                            ai: "ai";
                                            parser: "parser";
                                            user: "user";
                                        }>;
                                        version: import("zod").ZodString;
                                    }, import("zod/v4/core").$strip>;
                                    ai: import("zod").ZodOptional<import("zod").ZodObject<{
                                        configuration: import("zod").ZodString;
                                        notice: import("zod").ZodLiteral<"ai-can-be-wrong">;
                                        proposals: import("zod").ZodArray<import("zod").ZodObject<{
                                            field: import("zod").ZodString;
                                            value: import("zod").ZodUnknown;
                                            reason: import("zod").ZodLiteral<"ungrounded">;
                                        }, import("zod/v4/core").$strip>>;
                                        changedFields: import("zod").ZodArray<import("zod").ZodString>;
                                    }, import("zod/v4/core").$strip>>;
                                }, import("zod/v4/core").$strip>>;
                                ai: import("zod").ZodOptional<import("zod").ZodObject<{
                                    reason: import("zod").ZodNullable<import("zod").ZodEnum<{
                                        "configuration-unavailable": "configuration-unavailable";
                                        "feature-unavailable": "feature-unavailable";
                                        guest: "guest";
                                    }>>;
                                    upgrade: import("zod").ZodBoolean;
                                    fallbacks: import("zod").ZodArray<import("zod").ZodObject<{
                                        span: import("zod").ZodObject<{
                                            start: import("zod").ZodNumber;
                                            end: import("zod").ZodNumber;
                                        }, import("zod/v4/core").$strip>;
                                        reason: import("zod").ZodEnum<{
                                            "invalid-output": "invalid-output";
                                            "provider-unavailable": "provider-unavailable";
                                            timeout: "timeout";
                                        }>;
                                    }, import("zod/v4/core").$strip>>;
                                }, import("zod/v4/core").$strip>>;
                            }, import("zod/v4/core").$strip>;
                            referenceLimitExceeded: import("zod").ZodBoolean;
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
                                    "check-pack": "check-pack";
                                    credit: "credit";
                                    free: "free";
                                    guest: "guest";
                                }>;
                                granted: import("zod").ZodNumber;
                                remaining: import("zod").ZodNumber;
                                expiresAt: import("zod").ZodISODateTime;
                            }, import("zod/v4/core").$strip>>;
                            features: import("zod").ZodArray<import("zod").ZodString>;
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
    };
} & {
    getRoutingPath(): "/v2/structurings";
};
