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
                        quota: import("zod").ZodNullable<import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                        }, import("zod/v4/core").$strip>>;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
    };
} & {
    getRoutingPath(): "/v1/status";
};
export declare const routes: ({
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
                        quota: import("zod").ZodNullable<import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                        }, import("zod/v4/core").$strip>>;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
    };
} & {
    getRoutingPath(): "/v1/status";
})[];
