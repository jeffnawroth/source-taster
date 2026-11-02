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
        receipt: z.ZodOptional<z.ZodObject<{
            expiresAt: z.ZodNumber;
            signature: z.ZodString;
        }, z.core.$strip>>;
        references: z.ZodArray<z.ZodObject<{
            originalText: z.ZodString;
            span: z.ZodObject<{
                start: z.ZodNumber;
                end: z.ZodNumber;
            }, z.core.$strip>;
            authorsTruncated: z.ZodOptional<z.ZodBoolean>;
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
                arXiv: z.ZodOptional<z.ZodString>;
            }, z.core.$strip>;
            fieldSources: z.ZodRecord<z.ZodString, z.ZodObject<{
                raw: z.ZodString;
                span: z.ZodOptional<z.ZodObject<{
                    start: z.ZodNumber;
                    end: z.ZodNumber;
                }, z.core.$strip>>;
                normalized: z.ZodOptional<z.ZodString>;
                provenance: z.ZodOptional<z.ZodEnum<{
                    ai: "ai";
                    parser: "parser";
                    user: "user";
                }>>;
            }, z.core.$strip>>;
            structuring: z.ZodObject<{
                path: z.ZodEnum<{
                    ai: "ai";
                    parser: "parser";
                    user: "user";
                }>;
                version: z.ZodString;
            }, z.core.$strip>;
            ai: z.ZodOptional<z.ZodObject<{
                configuration: z.ZodString;
                notice: z.ZodLiteral<"ai-can-be-wrong">;
                proposals: z.ZodArray<z.ZodObject<{
                    field: z.ZodString;
                    value: z.ZodUnknown;
                    reason: z.ZodLiteral<"ungrounded">;
                }, z.core.$strip>>;
                changedFields: z.ZodArray<z.ZodString>;
            }, z.core.$strip>>;
        }, z.core.$strip>>;
        ai: z.ZodOptional<z.ZodObject<{
            reason: z.ZodNullable<z.ZodEnum<{
                "configuration-unavailable": "configuration-unavailable";
                "feature-unavailable": "feature-unavailable";
                guest: "guest";
            }>>;
            upgrade: z.ZodBoolean;
            fallbacks: z.ZodArray<z.ZodObject<{
                span: z.ZodObject<{
                    start: z.ZodNumber;
                    end: z.ZodNumber;
                }, z.core.$strip>;
                reason: z.ZodEnum<{
                    "invalid-output": "invalid-output";
                    "provider-unavailable": "provider-unavailable";
                    timeout: "timeout";
                }>;
            }, z.core.$strip>>;
        }, z.core.$strip>>;
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
            receipt: z.ZodOptional<z.ZodObject<{
                expiresAt: z.ZodNumber;
                signature: z.ZodString;
            }, z.core.$strip>>;
            references: z.ZodArray<z.ZodObject<{
                originalText: z.ZodString;
                span: z.ZodObject<{
                    start: z.ZodNumber;
                    end: z.ZodNumber;
                }, z.core.$strip>;
                authorsTruncated: z.ZodOptional<z.ZodBoolean>;
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
                    arXiv: z.ZodOptional<z.ZodString>;
                }, z.core.$strip>;
                fieldSources: z.ZodRecord<z.ZodString, z.ZodObject<{
                    raw: z.ZodString;
                    span: z.ZodOptional<z.ZodObject<{
                        start: z.ZodNumber;
                        end: z.ZodNumber;
                    }, z.core.$strip>>;
                    normalized: z.ZodOptional<z.ZodString>;
                    provenance: z.ZodOptional<z.ZodEnum<{
                        ai: "ai";
                        parser: "parser";
                        user: "user";
                    }>>;
                }, z.core.$strip>>;
                structuring: z.ZodObject<{
                    path: z.ZodEnum<{
                        ai: "ai";
                        parser: "parser";
                        user: "user";
                    }>;
                    version: z.ZodString;
                }, z.core.$strip>;
                ai: z.ZodOptional<z.ZodObject<{
                    configuration: z.ZodString;
                    notice: z.ZodLiteral<"ai-can-be-wrong">;
                    proposals: z.ZodArray<z.ZodObject<{
                        field: z.ZodString;
                        value: z.ZodUnknown;
                        reason: z.ZodLiteral<"ungrounded">;
                    }, z.core.$strip>>;
                    changedFields: z.ZodArray<z.ZodString>;
                }, z.core.$strip>>;
            }, z.core.$strip>>;
            ai: z.ZodOptional<z.ZodObject<{
                reason: z.ZodNullable<z.ZodEnum<{
                    "configuration-unavailable": "configuration-unavailable";
                    "feature-unavailable": "feature-unavailable";
                    guest: "guest";
                }>>;
                upgrade: z.ZodBoolean;
                fallbacks: z.ZodArray<z.ZodObject<{
                    span: z.ZodObject<{
                        start: z.ZodNumber;
                        end: z.ZodNumber;
                    }, z.core.$strip>;
                    reason: z.ZodEnum<{
                        "invalid-output": "invalid-output";
                        "provider-unavailable": "provider-unavailable";
                        timeout: "timeout";
                    }>;
                }, z.core.$strip>>;
            }, z.core.$strip>>;
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
        }, z.core.$strip>>;
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
        }, z.core.$strip>>;
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
            receipt: z.ZodOptional<z.ZodObject<{
                expiresAt: z.ZodNumber;
                signature: z.ZodString;
            }, z.core.$strip>>;
            references: z.ZodArray<z.ZodObject<{
                originalText: z.ZodString;
                span: z.ZodObject<{
                    start: z.ZodNumber;
                    end: z.ZodNumber;
                }, z.core.$strip>;
                authorsTruncated: z.ZodOptional<z.ZodBoolean>;
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
                    arXiv: z.ZodOptional<z.ZodString>;
                }, z.core.$strip>;
                fieldSources: z.ZodRecord<z.ZodString, z.ZodObject<{
                    raw: z.ZodString;
                    span: z.ZodOptional<z.ZodObject<{
                        start: z.ZodNumber;
                        end: z.ZodNumber;
                    }, z.core.$strip>>;
                    normalized: z.ZodOptional<z.ZodString>;
                    provenance: z.ZodOptional<z.ZodEnum<{
                        ai: "ai";
                        parser: "parser";
                        user: "user";
                    }>>;
                }, z.core.$strip>>;
                structuring: z.ZodObject<{
                    path: z.ZodEnum<{
                        ai: "ai";
                        parser: "parser";
                        user: "user";
                    }>;
                    version: z.ZodString;
                }, z.core.$strip>;
                ai: z.ZodOptional<z.ZodObject<{
                    configuration: z.ZodString;
                    notice: z.ZodLiteral<"ai-can-be-wrong">;
                    proposals: z.ZodArray<z.ZodObject<{
                        field: z.ZodString;
                        value: z.ZodUnknown;
                        reason: z.ZodLiteral<"ungrounded">;
                    }, z.core.$strip>>;
                    changedFields: z.ZodArray<z.ZodString>;
                }, z.core.$strip>>;
            }, z.core.$strip>>;
            ai: z.ZodOptional<z.ZodObject<{
                reason: z.ZodNullable<z.ZodEnum<{
                    "configuration-unavailable": "configuration-unavailable";
                    "feature-unavailable": "feature-unavailable";
                    guest: "guest";
                }>>;
                upgrade: z.ZodBoolean;
                fallbacks: z.ZodArray<z.ZodObject<{
                    span: z.ZodObject<{
                        start: z.ZodNumber;
                        end: z.ZodNumber;
                    }, z.core.$strip>;
                    reason: z.ZodEnum<{
                        "invalid-output": "invalid-output";
                        "provider-unavailable": "provider-unavailable";
                        timeout: "timeout";
                    }>;
                }, z.core.$strip>>;
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
        }, z.core.$strip>>;
    }, z.core.$strip>, z.ZodObject<{
        status: z.ZodLiteral<"not-implemented">;
    }, z.core.$strict>, z.ZodObject<{
        status: z.ZodLiteral<"unavailable">;
    }, z.core.$strict>, z.ZodNull]>;
}, z.core.$strip>;
