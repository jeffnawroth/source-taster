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
                                references: import("zod").ZodArray<import("zod").ZodObject<{
                                    originalText: import("zod").ZodString;
                                    span: import("zod").ZodObject<{
                                        start: import("zod").ZodNumber;
                                        end: import("zod").ZodNumber;
                                    }, import("zod/v4/core").$strip>;
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
                                    }, import("zod/v4/core").$strip>;
                                    fieldSources: import("zod").ZodRecord<import("zod").ZodString, import("zod").ZodObject<{
                                        raw: import("zod").ZodString;
                                        span: import("zod").ZodOptional<import("zod").ZodObject<{
                                            start: import("zod").ZodNumber;
                                            end: import("zod").ZodNumber;
                                        }, import("zod/v4/core").$strip>>;
                                        normalized: import("zod").ZodOptional<import("zod").ZodString>;
                                    }, import("zod/v4/core").$strip>>;
                                    authorsTruncated: import("zod").ZodOptional<import("zod").ZodBoolean>;
                                    structuring: import("zod").ZodObject<{
                                        path: import("zod").ZodEnum<{
                                            parser: "parser";
                                            user: "user";
                                        }>;
                                        version: import("zod").ZodString;
                                    }, import("zod/v4/core").$strip>;
                                }, import("zod/v4/core").$strip>>;
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
                            }, import("zod/v4/core").$strip>;
                        }, import("zod/v4/core").$strip>;
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
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
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
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
