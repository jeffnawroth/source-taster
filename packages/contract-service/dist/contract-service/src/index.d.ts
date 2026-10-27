import { z } from "zod";
export * from "../../contract-common/src/index.ts";
/** Infrastructure readiness only. This grants no identity, permission or Quota. */
export declare const ServiceStatusResponse: z.ZodObject<{
    data: z.ZodObject<{
        program: z.ZodLiteral<"service">;
        status: z.ZodLiteral<"ready">;
        authentication: z.ZodLiteral<"unavailable">;
    }, z.core.$strip>;
    quota: z.ZodNullable<z.ZodObject<{
        consumed: z.ZodNumber;
        remaining: z.ZodNumber;
    }, z.core.$strip>>;
}, z.core.$strip>;
