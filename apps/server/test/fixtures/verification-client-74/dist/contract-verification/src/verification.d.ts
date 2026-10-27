import { z } from "zod";
export declare const Verdict: z.ZodEnum<{
    correct: "correct";
    "doi-conflict": "doi-conflict";
    "exists-with-deviations": "exists-with-deviations";
    "mixed-citation": "mixed-citation";
    "not-found": "not-found";
    "not-verifiable": "not-verifiable";
}>;
export declare const Score: z.ZodObject<{
    value: z.ZodNumber;
    fullAgreement: z.ZodBoolean;
}, z.core.$strip>;
export type Score = z.infer<typeof Score>;
export declare const FieldComparison: z.ZodObject<{
    field: z.ZodString;
    reference: z.ZodUnknown;
    candidate: z.ZodUnknown;
    score: z.ZodNullable<z.ZodObject<{
        value: z.ZodNumber;
        fullAgreement: z.ZodBoolean;
    }, z.core.$strip>>;
    reason: z.ZodEnum<{
        compared: "compared";
        "missing-candidate": "missing-candidate";
        "missing-reference": "missing-reference";
        "not-determinable": "not-determinable";
        "resource-limit": "resource-limit";
        unweighted: "unweighted";
    }>;
}, z.core.$strip>;
export declare const Candidate: z.ZodObject<{
    id: z.ZodString;
    source: z.ZodLiteral<"crossref">;
    origin: z.ZodEnum<{
        "authors-year": "authors-year";
        combined: "combined";
        doi: "doi";
        title: "title";
    }>;
    slot: z.ZodNumber;
    retrievedAt: z.ZodString;
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
    raw: z.ZodUnknown;
    fields: z.ZodArray<z.ZodObject<{
        field: z.ZodString;
        reference: z.ZodUnknown;
        candidate: z.ZodUnknown;
        score: z.ZodNullable<z.ZodObject<{
            value: z.ZodNumber;
            fullAgreement: z.ZodBoolean;
        }, z.core.$strip>>;
        reason: z.ZodEnum<{
            compared: "compared";
            "missing-candidate": "missing-candidate";
            "missing-reference": "missing-reference";
            "not-determinable": "not-determinable";
            "resource-limit": "resource-limit";
            unweighted: "unweighted";
        }>;
    }, z.core.$strip>>;
    score: z.ZodNullable<z.ZodObject<{
        value: z.ZodNumber;
        fullAgreement: z.ZodBoolean;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const SourceEvidence: z.ZodObject<{
    source: z.ZodEnum<{
        crossref: "crossref";
        "doi.org": "doi.org";
    }>;
    operation: z.ZodEnum<{
        "authors-year": "authors-year";
        combined: "combined";
        doi: "doi";
        title: "title";
    }>;
    outcome: z.ZodEnum<{
        candidate: "candidate";
        exists: "exists";
        "no-record": "no-record";
        nonexistent: "nonexistent";
        unavailable: "unavailable";
    }>;
    reason: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodNumber>;
    durationMs: z.ZodNumber;
    attempts: z.ZodNumber;
    observedAt: z.ZodString;
    raw: z.ZodOptional<z.ZodUnknown>;
}, z.core.$strip>;
export declare const VerdictResult: z.ZodObject<{
    kind: z.ZodLiteral<"verdict">;
    verdict: z.ZodEnum<{
        correct: "correct";
        "doi-conflict": "doi-conflict";
        "exists-with-deviations": "exists-with-deviations";
        "mixed-citation": "mixed-citation";
        "not-found": "not-found";
        "not-verifiable": "not-verifiable";
    }>;
    reference: z.ZodObject<{
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
    }, z.core.$strip>;
    scoringRules: z.ZodObject<{
        version: z.ZodString;
        calibration: z.ZodLiteral<"uncalibrated">;
        unicode: z.ZodString;
        icu: z.ZodString;
        profile: z.ZodRecord<z.ZodString, z.ZodNumber>;
    }, z.core.$strip>;
    searchStrategyVersion: z.ZodString;
    searchConfiguration: z.ZodRecord<z.ZodString, z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
    identity: z.ZodObject<{
        kind: z.ZodEnum<{
            "independent-bibliography": "independent-bibliography";
            "supplied-doi": "supplied-doi";
            unresolved: "unresolved";
        }>;
        candidateId: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
    bestMatchId: z.ZodNullable<z.ZodString>;
    candidates: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        source: z.ZodLiteral<"crossref">;
        origin: z.ZodEnum<{
            "authors-year": "authors-year";
            combined: "combined";
            doi: "doi";
            title: "title";
        }>;
        slot: z.ZodNumber;
        retrievedAt: z.ZodString;
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
        raw: z.ZodUnknown;
        fields: z.ZodArray<z.ZodObject<{
            field: z.ZodString;
            reference: z.ZodUnknown;
            candidate: z.ZodUnknown;
            score: z.ZodNullable<z.ZodObject<{
                value: z.ZodNumber;
                fullAgreement: z.ZodBoolean;
            }, z.core.$strip>>;
            reason: z.ZodEnum<{
                compared: "compared";
                "missing-candidate": "missing-candidate";
                "missing-reference": "missing-reference";
                "not-determinable": "not-determinable";
                "resource-limit": "resource-limit";
                unweighted: "unweighted";
            }>;
        }, z.core.$strip>>;
        score: z.ZodNullable<z.ZodObject<{
            value: z.ZodNumber;
            fullAgreement: z.ZodBoolean;
        }, z.core.$strip>>;
    }, z.core.$strip>>;
    evidence: z.ZodArray<z.ZodObject<{
        source: z.ZodEnum<{
            crossref: "crossref";
            "doi.org": "doi.org";
        }>;
        operation: z.ZodEnum<{
            "authors-year": "authors-year";
            combined: "combined";
            doi: "doi";
            title: "title";
        }>;
        outcome: z.ZodEnum<{
            candidate: "candidate";
            exists: "exists";
            "no-record": "no-record";
            nonexistent: "nonexistent";
            unavailable: "unavailable";
        }>;
        reason: z.ZodOptional<z.ZodString>;
        status: z.ZodOptional<z.ZodNumber>;
        durationMs: z.ZodNumber;
        attempts: z.ZodNumber;
        observedAt: z.ZodString;
        raw: z.ZodOptional<z.ZodUnknown>;
    }, z.core.$strip>>;
    reasons: z.ZodArray<z.ZodEnum<{
        "development-route-incomplete": "development-route-incomplete";
        "doi-nonexistent": "doi-nonexistent";
        "fields-differ": "fields-differ";
        "foreign-doi": "foreign-doi";
        identified: "identified";
        "identity-unresolved": "identity-unresolved";
        "mandatory-resolution-incomplete": "mandatory-resolution-incomplete";
        "metadata-unavailable": "metadata-unavailable";
        "outside-coverage": "outside-coverage";
        "url-verification-incomplete": "url-verification-incomplete";
    }>>;
    failedSources: z.ZodArray<z.ZodEnum<{
        crossref: "crossref";
        "doi.org": "doi.org";
    }>>;
    retraction: z.ZodLiteral<"unknown">;
}, z.core.$strip>;
export type VerdictResult = z.infer<typeof VerdictResult>;
export type Candidate = z.infer<typeof Candidate>;
export type Verdict = z.infer<typeof Verdict>;
export type SourceEvidence = z.infer<typeof SourceEvidence>;
