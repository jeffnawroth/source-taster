import { z } from "zod";
export declare const exportReferences: {
    method: "post";
    path: "/v2/checks/{checkId}/export";
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
                        format: z.ZodEnum<{
                            bibtex: "bibtex";
                            "csl-json": "csl-json";
                            "imported-format": "imported-format";
                        }>;
                        mode: z.ZodEnum<{
                            original: "original";
                            "selected-corrections": "selected-corrections";
                        }>;
                        corrections: z.ZodDefault<z.ZodArray<z.ZodObject<{
                            slot: z.ZodNumber;
                            resultToken: z.ZodString;
                        }, z.core.$strict>>>;
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
                "application/vnd.citationstyles.csl+json": {
                    schema: z.ZodArray<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
                };
                "application/x-bibtex": {
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
                        retryAt: z.ZodOptional<z.ZodISODateTime>;
                        code: z.ZodString;
                        i18nKey: z.ZodString;
                    }, z.core.$strip>;
                };
            };
        };
    };
} & {
    getRoutingPath(): "/v2/checks/:checkId/export";
};
