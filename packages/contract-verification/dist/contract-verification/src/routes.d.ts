import { z } from "zod";
export declare const createCheck: {
    method: "post";
    path: "/v1/checks";
    summary: string;
    request: {
        body: {
            required: true;
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        text: z.ZodString;
                    }, z.core.$strip>;
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
                            state: z.ZodEnum<{
                                ended: "ended";
                                running: "running";
                            }>;
                            lastEventSeq: z.ZodNumber;
                            references: z.ZodArray<z.ZodObject<{
                                slot: z.ZodNumber;
                                originalText: z.ZodString;
                                outcome: z.ZodDiscriminatedUnion<[z.ZodObject<{
                                    kind: z.ZodLiteral<"status">;
                                    status: z.ZodEnum<{
                                        cancelled: "cancelled";
                                        failed: "failed";
                                        "not-checked": "not-checked";
                                        running: "running";
                                    }>;
                                }, z.core.$strip>], "kind">;
                            }, z.core.$strip>>;
                        }, z.core.$strip>;
                        quota: z.ZodNullable<z.ZodObject<{
                            consumed: z.ZodNumber;
                            remaining: z.ZodNumber;
                        }, z.core.$strip>>;
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
                        code: z.ZodString;
                        i18nKey: z.ZodString;
                    }, z.core.$strip>;
                };
            };
        };
    };
} & {
    getRoutingPath(): "/v1/checks";
};
export declare const getCheck: {
    method: "get";
    path: "/v1/checks/{checkId}";
    summary: string;
    request: {
        params: z.ZodObject<{
            checkId: z.ZodUUID;
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
                            state: z.ZodEnum<{
                                ended: "ended";
                                running: "running";
                            }>;
                            lastEventSeq: z.ZodNumber;
                            references: z.ZodArray<z.ZodObject<{
                                slot: z.ZodNumber;
                                originalText: z.ZodString;
                                outcome: z.ZodDiscriminatedUnion<[z.ZodObject<{
                                    kind: z.ZodLiteral<"status">;
                                    status: z.ZodEnum<{
                                        cancelled: "cancelled";
                                        failed: "failed";
                                        "not-checked": "not-checked";
                                        running: "running";
                                    }>;
                                }, z.core.$strip>], "kind">;
                            }, z.core.$strip>>;
                        }, z.core.$strip>;
                        quota: z.ZodNullable<z.ZodObject<{
                            consumed: z.ZodNumber;
                            remaining: z.ZodNumber;
                        }, z.core.$strip>>;
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
                        code: z.ZodString;
                        i18nKey: z.ZodString;
                    }, z.core.$strip>;
                };
            };
        };
    };
} & {
    getRoutingPath(): "/v1/checks/:checkId";
};
export declare const streamCheckEvents: {
    method: "get";
    path: "/v1/checks/{checkId}/events";
    summary: string;
    description: string;
    request: {
        params: z.ZodObject<{
            checkId: z.ZodUUID;
        }, z.core.$strip>;
        headers: z.ZodObject<{
            "last-event-id": z.ZodOptional<z.ZodString>;
        }, z.core.$strip>;
    };
    responses: {
        200: {
            description: string;
            content: {
                "text/event-stream": {
                    schema: z.ZodString;
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
                        code: z.ZodString;
                        i18nKey: z.ZodString;
                    }, z.core.$strip>;
                };
            };
        };
    };
} & {
    getRoutingPath(): "/v1/checks/:checkId/events";
};
/** Stateless Structuring preview, independent of placeholder Checks. */
export declare const structureReferences: {
    method: "post";
    path: "/v1/structurings";
    summary: string;
    request: {
        body: {
            required: true;
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        text: z.ZodString;
                    }, z.core.$strip>;
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
                            references: z.ZodArray<z.ZodObject<{
                                originalText: z.ZodString;
                                span: z.ZodObject<{
                                    start: z.ZodNumber;
                                    end: z.ZodNumber;
                                }, z.core.$strip>;
                                csl: z.ZodObject<{
                                    author: z.ZodOptional<z.ZodArray<z.ZodObject<{
                                        family: z.ZodOptional<z.ZodString>;
                                        given: z.ZodOptional<z.ZodString>;
                                        literal: z.ZodOptional<z.ZodString>;
                                    }, z.core.$strip>>>;
                                    issued: z.ZodOptional<z.ZodObject<{
                                        literal: z.ZodString;
                                    }, z.core.$strip>>;
                                    title: z.ZodOptional<z.ZodString>;
                                    "container-title": z.ZodOptional<z.ZodString>;
                                    "container-title-short": z.ZodOptional<z.ZodString>;
                                    publisher: z.ZodOptional<z.ZodString>;
                                    "publisher-place": z.ZodOptional<z.ZodString>;
                                    volume: z.ZodOptional<z.ZodString>;
                                    issue: z.ZodOptional<z.ZodString>;
                                    page: z.ZodOptional<z.ZodString>;
                                    "article-number": z.ZodOptional<z.ZodString>;
                                    edition: z.ZodOptional<z.ZodString>;
                                    DOI: z.ZodOptional<z.ZodString>;
                                    URL: z.ZodOptional<z.ZodString>;
                                    ISBN: z.ZodOptional<z.ZodString>;
                                    ISSN: z.ZodOptional<z.ZodString>;
                                    PMID: z.ZodOptional<z.ZodString>;
                                    PMCID: z.ZodOptional<z.ZodString>;
                                }, z.core.$strip>;
                                fieldSources: z.ZodRecord<z.ZodString, z.ZodObject<{
                                    raw: z.ZodString;
                                    span: z.ZodObject<{
                                        start: z.ZodNumber;
                                        end: z.ZodNumber;
                                    }, z.core.$strip>;
                                    normalized: z.ZodOptional<z.ZodString>;
                                }, z.core.$strip>>;
                                authorsTruncated: z.ZodOptional<z.ZodBoolean>;
                                structuring: z.ZodObject<{
                                    path: z.ZodLiteral<"parser">;
                                    version: z.ZodString;
                                }, z.core.$strip>;
                            }, z.core.$strip>>;
                            rejected: z.ZodArray<z.ZodObject<{
                                originalText: z.ZodString;
                                span: z.ZodObject<{
                                    start: z.ZodNumber;
                                    end: z.ZodNumber;
                                }, z.core.$strip>;
                                reason: z.ZodLiteral<"no-reference-features">;
                            }, z.core.$strip>>;
                            guidance: z.ZodNullable<z.ZodLiteral<"no-references">>;
                            quotaConsumed: z.ZodLiteral<0>;
                            referenceLimit: z.ZodNumber;
                        }, z.core.$strip>;
                        quota: z.ZodNullable<z.ZodObject<{
                            consumed: z.ZodNumber;
                            remaining: z.ZodNumber;
                        }, z.core.$strip>>;
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
                        code: z.ZodString;
                        i18nKey: z.ZodString;
                    }, z.core.$strip>;
                };
            };
        };
    };
} & {
    getRoutingPath(): "/v1/structurings";
};
