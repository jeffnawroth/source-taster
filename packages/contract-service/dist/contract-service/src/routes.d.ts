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
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
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
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
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
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
    };
} & {
    getRoutingPath(): "/.well-known/jwks.json";
}))[];
