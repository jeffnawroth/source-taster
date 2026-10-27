import { z } from "zod";
export * from "../../contract-common/src/index.ts";
/** Infrastructure readiness only. This grants no identity, permission or Quota. */
export declare const ServiceStatusResponse: z.ZodObject<{
    data: z.ZodObject<{
        program: z.ZodLiteral<"service">;
        status: z.ZodLiteral<"ready">;
        authentication: z.ZodLiteral<"unavailable">;
    }, z.core.$strip>;
    quota: z.ZodUnion<readonly [z.ZodObject<{
        consumed: z.ZodNumber;
        remaining: z.ZodNumber;
    }, z.core.$strip>, z.ZodObject<{
        status: z.ZodLiteral<"not-implemented">;
    }, z.core.$strict>, z.ZodNull]>;
}, z.core.$strip>;
export declare const GuestTokenRequest: z.ZodObject<{
    guestId: z.ZodUUID;
    client: z.ZodEnum<{
        extension: "extension";
        web: "web";
    }>;
}, z.core.$strict>;
export type GuestTokenRequest = z.infer<typeof GuestTokenRequest>;
export declare const GuestTokenResponse: z.ZodObject<{
    data: z.ZodObject<{
        accessToken: z.ZodString;
        tokenType: z.ZodLiteral<"Bearer">;
        expiresAt: z.ZodISODateTime;
        expiresIn: z.ZodLiteral<300>;
    }, z.core.$strict>;
    quota: z.ZodUnion<readonly [z.ZodObject<{
        consumed: z.ZodNumber;
        remaining: z.ZodNumber;
    }, z.core.$strip>, z.ZodObject<{
        status: z.ZodLiteral<"not-implemented">;
    }, z.core.$strict>, z.ZodNull]>;
}, z.core.$strip>;
export type GuestTokenResponse = z.infer<typeof GuestTokenResponse>;
