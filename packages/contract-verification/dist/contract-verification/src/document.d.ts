import { z } from "zod";
export declare const BibliographySelection: z.ZodObject<{
    version: z.ZodString;
    regions: z.ZodArray<z.ZodObject<{
        start: z.ZodNumber;
        end: z.ZodNumber;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const BibliographyDocument: z.ZodObject<{
    text: z.ZodString;
    selection: z.ZodObject<{
        version: z.ZodString;
        regions: z.ZodArray<z.ZodObject<{
            start: z.ZodNumber;
            end: z.ZodNumber;
        }, z.core.$strip>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export type BibliographyDocument = z.infer<typeof BibliographyDocument>;
/** ADR-0011: "20 MB" means 20 MiB; the message states "20 MB". */
export declare const documentSizeLimit = 20971520;
export declare const DocumentFormat: z.ZodEnum<{
    docx: "docx";
    pdf: "pdf";
}>;
export type DocumentFormat = z.infer<typeof DocumentFormat>;
export declare const DocumentStructuringRequest: z.ZodObject<{
    file: z.ZodAny;
}, z.core.$strip>;
export declare const ExtractedDocument: z.ZodObject<{
    format: z.ZodEnum<{
        docx: "docx";
        pdf: "pdf";
    }>;
    text: z.ZodString;
    notice: z.ZodNullable<z.ZodLiteral<"partial-no-text">>;
}, z.core.$strip>;
export declare const DocumentStructuringResult: z.ZodObject<{
    document: z.ZodObject<{
        format: z.ZodEnum<{
            docx: "docx";
            pdf: "pdf";
        }>;
        text: z.ZodString;
        notice: z.ZodNullable<z.ZodLiteral<"partial-no-text">>;
    }, z.core.$strip>;
    structuring: z.ZodObject<{
        references: z.ZodArray<z.ZodObject<{
            originalText: z.ZodString;
            span: z.ZodObject<{
                start: z.ZodNumber;
                end: z.ZodNumber;
            }, z.core.$strip>;
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
            fieldSources: z.ZodRecord<z.ZodString, z.ZodObject<{
                raw: z.ZodString;
                span: z.ZodOptional<z.ZodObject<{
                    start: z.ZodNumber;
                    end: z.ZodNumber;
                }, z.core.$strip>>;
                normalized: z.ZodOptional<z.ZodString>;
            }, z.core.$strip>>;
            authorsTruncated: z.ZodOptional<z.ZodBoolean>;
            structuring: z.ZodObject<{
                path: z.ZodEnum<{
                    parser: "parser";
                    user: "user";
                }>;
                version: z.ZodString;
            }, z.core.$strip>;
        }, z.core.$strip>>;
        rejected: z.ZodArray<z.ZodObject<{
            originalText: z.ZodString;
            span: z.ZodObject<{
                start: z.ZodNumber;
                end: z.ZodNumber;
            }, z.core.$strip>;
            reason: z.ZodLiteral<"no-reference-features">;
        }, z.core.$strip>>;
        guidance: z.ZodNullable<z.ZodLiteral<"no-references">>;
        quotaConsumed: z.ZodLiteral<0>;
        referenceLimit: z.ZodNumber;
    }, z.core.$strip>;
    selection: z.ZodObject<{
        version: z.ZodString;
        regions: z.ZodArray<z.ZodObject<{
            start: z.ZodNumber;
            end: z.ZodNumber;
        }, z.core.$strip>>;
    }, z.core.$strip>;
    referenceLimitExceeded: z.ZodBoolean;
}, z.core.$strip>;
export type DocumentStructuringResult = z.infer<typeof DocumentStructuringResult>;
export declare const DocumentStructuringResponse: z.ZodObject<{
    data: z.ZodObject<{
        document: z.ZodObject<{
            format: z.ZodEnum<{
                docx: "docx";
                pdf: "pdf";
            }>;
            text: z.ZodString;
            notice: z.ZodNullable<z.ZodLiteral<"partial-no-text">>;
        }, z.core.$strip>;
        structuring: z.ZodObject<{
            references: z.ZodArray<z.ZodObject<{
                originalText: z.ZodString;
                span: z.ZodObject<{
                    start: z.ZodNumber;
                    end: z.ZodNumber;
                }, z.core.$strip>;
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
                fieldSources: z.ZodRecord<z.ZodString, z.ZodObject<{
                    raw: z.ZodString;
                    span: z.ZodOptional<z.ZodObject<{
                        start: z.ZodNumber;
                        end: z.ZodNumber;
                    }, z.core.$strip>>;
                    normalized: z.ZodOptional<z.ZodString>;
                }, z.core.$strip>>;
                authorsTruncated: z.ZodOptional<z.ZodBoolean>;
                structuring: z.ZodObject<{
                    path: z.ZodEnum<{
                        parser: "parser";
                        user: "user";
                    }>;
                    version: z.ZodString;
                }, z.core.$strip>;
            }, z.core.$strip>>;
            rejected: z.ZodArray<z.ZodObject<{
                originalText: z.ZodString;
                span: z.ZodObject<{
                    start: z.ZodNumber;
                    end: z.ZodNumber;
                }, z.core.$strip>;
                reason: z.ZodLiteral<"no-reference-features">;
            }, z.core.$strip>>;
            guidance: z.ZodNullable<z.ZodLiteral<"no-references">>;
            quotaConsumed: z.ZodLiteral<0>;
            referenceLimit: z.ZodNumber;
        }, z.core.$strip>;
        selection: z.ZodObject<{
            version: z.ZodString;
            regions: z.ZodArray<z.ZodObject<{
                start: z.ZodNumber;
                end: z.ZodNumber;
            }, z.core.$strip>>;
        }, z.core.$strip>;
        referenceLimitExceeded: z.ZodBoolean;
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
                credit: "credit";
                free: "free";
                guest: "guest";
            }>;
            granted: z.ZodNumber;
            remaining: z.ZodNumber;
            expiresAt: z.ZodISODateTime;
        }, z.core.$strip>>;
        features: z.ZodArray<z.ZodString>;
    }, z.core.$strip>, z.ZodObject<{
        status: z.ZodLiteral<"not-implemented">;
    }, z.core.$strict>, z.ZodObject<{
        status: z.ZodLiteral<"unavailable">;
    }, z.core.$strict>, z.ZodNull]>;
}, z.core.$strip>;
/** Current Operator-configured upload limit, shared by web and extension. */
export declare const DocumentSettingsResponse: z.ZodObject<{
    data: z.ZodObject<{
        inputBytes: z.ZodNumber;
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
                credit: "credit";
                free: "free";
                guest: "guest";
            }>;
            granted: z.ZodNumber;
            remaining: z.ZodNumber;
            expiresAt: z.ZodISODateTime;
        }, z.core.$strip>>;
        features: z.ZodArray<z.ZodString>;
    }, z.core.$strip>, z.ZodObject<{
        status: z.ZodLiteral<"not-implemented">;
    }, z.core.$strict>, z.ZodObject<{
        status: z.ZodLiteral<"unavailable">;
    }, z.core.$strict>, z.ZodNull]>;
}, z.core.$strip>;
export declare const TextStructuringRequest: z.ZodObject<{
    text: z.ZodString;
    document: z.ZodOptional<z.ZodBoolean>;
    regions: z.ZodOptional<z.ZodArray<z.ZodObject<{
        start: z.ZodNumber;
        end: z.ZodNumber;
    }, z.core.$strip>>>;
}, z.core.$strict>;
export type TextStructuringRequest = z.infer<typeof TextStructuringRequest>;
export declare const TextStructuringResponse: z.ZodObject<{
    data: z.ZodObject<{
        document: z.ZodNullable<z.ZodObject<{
            text: z.ZodString;
            selection: z.ZodObject<{
                version: z.ZodString;
                regions: z.ZodArray<z.ZodObject<{
                    start: z.ZodNumber;
                    end: z.ZodNumber;
                }, z.core.$strip>>;
            }, z.core.$strip>;
        }, z.core.$strip>>;
        structuring: z.ZodObject<{
            references: z.ZodArray<z.ZodObject<{
                originalText: z.ZodString;
                span: z.ZodObject<{
                    start: z.ZodNumber;
                    end: z.ZodNumber;
                }, z.core.$strip>;
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
                fieldSources: z.ZodRecord<z.ZodString, z.ZodObject<{
                    raw: z.ZodString;
                    span: z.ZodOptional<z.ZodObject<{
                        start: z.ZodNumber;
                        end: z.ZodNumber;
                    }, z.core.$strip>>;
                    normalized: z.ZodOptional<z.ZodString>;
                }, z.core.$strip>>;
                authorsTruncated: z.ZodOptional<z.ZodBoolean>;
                structuring: z.ZodObject<{
                    path: z.ZodEnum<{
                        parser: "parser";
                        user: "user";
                    }>;
                    version: z.ZodString;
                }, z.core.$strip>;
            }, z.core.$strip>>;
            rejected: z.ZodArray<z.ZodObject<{
                originalText: z.ZodString;
                span: z.ZodObject<{
                    start: z.ZodNumber;
                    end: z.ZodNumber;
                }, z.core.$strip>;
                reason: z.ZodLiteral<"no-reference-features">;
            }, z.core.$strip>>;
            guidance: z.ZodNullable<z.ZodLiteral<"no-references">>;
            quotaConsumed: z.ZodLiteral<0>;
            referenceLimit: z.ZodNumber;
        }, z.core.$strip>;
        referenceLimitExceeded: z.ZodBoolean;
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
                credit: "credit";
                free: "free";
                guest: "guest";
            }>;
            granted: z.ZodNumber;
            remaining: z.ZodNumber;
            expiresAt: z.ZodISODateTime;
        }, z.core.$strip>>;
        features: z.ZodArray<z.ZodString>;
    }, z.core.$strip>, z.ZodObject<{
        status: z.ZodLiteral<"not-implemented">;
    }, z.core.$strict>, z.ZodObject<{
        status: z.ZodLiteral<"unavailable">;
    }, z.core.$strict>, z.ZodNull]>;
}, z.core.$strip>;
