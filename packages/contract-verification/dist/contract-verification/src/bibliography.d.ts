import { z } from "zod";
import { CitationStyle } from "../../contract-common/src/index.ts";
export { CitationStyle };
export declare const BibliographyRequest: z.ZodObject<{
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
export type BibliographyRequest = z.input<typeof BibliographyRequest>;
export declare const FormattedReference: z.ZodObject<{
    text: z.ZodString;
    rtf: z.ZodString;
    html: z.ZodString;
}, z.core.$strip>;
export declare const Bibliography: z.ZodObject<{
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
export type Bibliography = z.infer<typeof Bibliography>;
export declare const BibliographyResponse: z.ZodObject<{
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
                pro: "pro";
            }>;
            granted: z.ZodNumber;
            remaining: z.ZodNumber;
            expiresAt: z.ZodISODateTime;
        }, z.core.$strip>>;
        features: z.ZodArray<z.ZodString>;
        history: z.ZodOptional<z.ZodObject<{
            extendedUntil: z.ZodNullable<z.ZodISODateTime>;
            authorityVersion: z.ZodNumber;
            settingsVersion: z.ZodOptional<z.ZodNumber>;
            freeHistoryChecks: z.ZodOptional<z.ZodNumber>;
            freeHistoryDays: z.ZodOptional<z.ZodNumber>;
            paidHistoryDays: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>>;
    }, z.core.$strip>, z.ZodObject<{
        status: z.ZodLiteral<"not-implemented">;
    }, z.core.$strict>, z.ZodObject<{
        status: z.ZodLiteral<"unavailable">;
    }, z.core.$strict>, z.ZodNull]>;
}, z.core.$strip>;
