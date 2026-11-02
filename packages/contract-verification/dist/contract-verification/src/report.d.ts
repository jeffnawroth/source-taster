import { z } from "zod";
/**
 * The Quota feature id that entitles an Owner to Verification reports. The
 * private service grants it in `Quota.features`; this program only reads it.
 */
export declare const reportFeature = "verification-report";
export declare const ReportLanguage: z.ZodEnum<{
    de: "de";
    en: "en";
}>;
export type ReportLanguage = z.infer<typeof ReportLanguage>;
export declare const ReportId: z.ZodUUID;
/**
 * The document name is supplied for this one report: the Check stores no file
 * name, and the server keeps the name only for the life of the temporary file.
 */
export declare const ReportRequest: z.ZodObject<{
    language: z.ZodEnum<{
        de: "de";
        en: "en";
    }>;
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
    documentName: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export type ReportRequest = z.input<typeof ReportRequest>;
/**
 * queued: waiting for a generator; generating: the snapshot is frozen;
 * ready: the finished file never changes; failed/cancelled: nothing to download.
 */
export declare const ReportState: z.ZodEnum<{
    cancelled: "cancelled";
    failed: "failed";
    generating: "generating";
    queued: "queued";
    ready: "ready";
}>;
export declare const ReportFailure: z.ZodEnum<{
    "limit-exceeded": "limit-exceeded";
    unavailable: "unavailable";
    "unsupported-character": "unsupported-character";
}>;
export type ReportFailure = z.infer<typeof ReportFailure>;
export declare const Report: z.ZodObject<{
    id: z.ZodUUID;
    checkId: z.ZodUUID;
    language: z.ZodEnum<{
        de: "de";
        en: "en";
    }>;
    state: z.ZodEnum<{
        cancelled: "cancelled";
        failed: "failed";
        generating: "generating";
        queued: "queued";
        ready: "ready";
    }>;
    failure: z.ZodOptional<z.ZodEnum<{
        "limit-exceeded": "limit-exceeded";
        unavailable: "unavailable";
        "unsupported-character": "unsupported-character";
    }>>;
    intermediate: z.ZodOptional<z.ZodBoolean>;
    expiresAt: z.ZodString;
}, z.core.$strip>;
export type Report = z.infer<typeof Report>;
export declare const ReportResponse: z.ZodObject<{
    data: z.ZodObject<{
        id: z.ZodUUID;
        checkId: z.ZodUUID;
        language: z.ZodEnum<{
            de: "de";
            en: "en";
        }>;
        state: z.ZodEnum<{
            cancelled: "cancelled";
            failed: "failed";
            generating: "generating";
            queued: "queued";
            ready: "ready";
        }>;
        failure: z.ZodOptional<z.ZodEnum<{
            "limit-exceeded": "limit-exceeded";
            unavailable: "unavailable";
            "unsupported-character": "unsupported-character";
        }>>;
        intermediate: z.ZodOptional<z.ZodBoolean>;
        expiresAt: z.ZodString;
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
        history: z.ZodOptional<z.ZodObject<{
            extendedUntil: z.ZodNullable<z.ZodISODateTime>;
            authorityVersion: z.ZodNumber;
        }, z.core.$strip>>;
    }, z.core.$strip>, z.ZodObject<{
        status: z.ZodLiteral<"not-implemented">;
    }, z.core.$strict>, z.ZodObject<{
        status: z.ZodLiteral<"unavailable">;
    }, z.core.$strict>, z.ZodNull]>;
}, z.core.$strip>;
export type ReportResponse = z.infer<typeof ReportResponse>;
