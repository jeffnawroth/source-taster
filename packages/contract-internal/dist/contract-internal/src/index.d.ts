import { z } from "zod";
export * from "../../contract-common/src/index.ts";
/** No verification content, recipient, code or arbitrary message crosses this boundary.
 * Diagnostic only: explicitly enabled loopback rehearsal with a fixed .invalid SMTP sink.
 * Hosted entitlement/Quota routes remain unavailable until their signed-token implementation.
 */
export declare const MailRehearsalRequest: z.ZodObject<{
    language: z.ZodEnum<{
        de: "de";
        en: "en";
    }>;
}, z.core.$strict>;
export declare const MailRehearsalResponse: z.ZodObject<{
    data: z.ZodObject<{
        id: z.ZodUUID;
        language: z.ZodEnum<{
            de: "de";
            en: "en";
        }>;
        status: z.ZodEnum<{
            queued: "queued";
            sent: "sent";
        }>;
    }, z.core.$strip>;
    quota: z.ZodNullable<z.ZodObject<{
        consumed: z.ZodNumber;
        remaining: z.ZodNumber;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const MailRehearsalParams: z.ZodObject<{
    id: z.ZodUUID;
}, z.core.$strip>;
