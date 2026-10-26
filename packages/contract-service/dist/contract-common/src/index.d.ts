import { z } from "zod";
export declare const PROBLEM_CONTENT_TYPE = "application/problem+json";
/**
 * RFC 9457 Problem Details with a stable machine `code` and the catalog key
 * (`i18nKey`) under which clients find the user-facing message.
 */
export declare const ProblemDetails: z.ZodObject<{
    type: z.ZodString;
    title: z.ZodString;
    status: z.ZodNumber;
    detail: z.ZodOptional<z.ZodString>;
    limit: z.ZodOptional<z.ZodNumber>;
    code: z.ZodString;
    i18nKey: z.ZodString;
}, z.core.$strip>;
export type ProblemDetails = z.infer<typeof ProblemDetails>;
/**
 * Consumption and remaining Quota of the acting Owner (FA-ORG-15).
 * `null` means no Quota applies, as in standalone mode.
 */
export declare const Quota: z.ZodObject<{
    consumed: z.ZodNumber;
    remaining: z.ZodNumber;
}, z.core.$strip>;
export type Quota = z.infer<typeof Quota>;
export declare const QuotaSlot: z.ZodNullable<z.ZodObject<{
    consumed: z.ZodNumber;
    remaining: z.ZodNumber;
}, z.core.$strip>>;
export type QuotaSlot = z.infer<typeof QuotaSlot>;
/** Every successful response wraps its payload with the Quota slot. */
export declare function envelope<T extends z.ZodType>(data: T): z.ZodObject<{
    data: T;
    quota: z.ZodNullable<z.ZodObject<{
        consumed: z.ZodNumber;
        remaining: z.ZodNumber;
    }, z.core.$strip>>;
}, z.core.$strip>;
