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
