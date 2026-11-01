import { z } from "zod";
export declare const renderBibliography: {
    method: "post";
    path: "/v2/checks/{checkId}/bibliography";
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
                        suggestionSlots: z.ZodOptional<z.ZodArray<z.ZodNumber>>;
                        includeBibliography: z.ZodDefault<z.ZodBoolean>;
                        applySlots: z.ZodDefault<z.ZodArray<z.ZodNumber>>;
                    }, z.core.$strict>;
                };
            };
        };
    };
    responses: {
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
                            rendererVersion: z.ZodString;
                            entries: z.ZodArray<z.ZodObject<{
                                slot: z.ZodNumber;
                                suggestion: z.ZodNullable<z.ZodObject<{
                                    text: z.ZodString;
                                    rtf: z.ZodString;
                                    html: z.ZodString;
                                    csl: z.ZodObject<{
                                        type: z.ZodOptional<z.ZodString>;
                                        author: z.ZodOptional<z.ZodArray<z.ZodObject<{
                                            family: z.ZodOptional<z.ZodString>;
                                            "non-dropping-particle": z.ZodOptional<z.ZodString>;
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
                                }, z.core.$strip>>;
                                applied: z.ZodBoolean;
                                resultToken: z.ZodOptional<z.ZodString>;
                            }, z.core.$strip>>;
                            bibliography: z.ZodNullable<z.ZodObject<{
                                text: z.ZodString;
                                rtf: z.ZodString;
                                html: z.ZodString;
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
                                }>;
                                granted: z.ZodNumber;
                                remaining: z.ZodNumber;
                                expiresAt: z.ZodISODateTime;
                            }, z.core.$strip>>;
                            features: z.ZodArray<z.ZodString>;
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
    };
} & {
    getRoutingPath(): "/v2/checks/:checkId/bibliography";
};
