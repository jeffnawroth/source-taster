import { z } from "zod";
export * from "./verification.ts";
export * from "../../contract-common/src/index.ts";
/**
 * Shown instead of a Verdict (GLOSSARY "Status", ADR-0005). A Status is never
 * a Verdict.
 */
export declare const ReferenceStatus: z.ZodEnum<{
    cancelled: "cancelled";
    failed: "failed";
    "not-checked": "not-checked";
    running: "running";
}>;
export type ReferenceStatus = z.infer<typeof ReferenceStatus>;
/**
 * Exactly one Status or one immutable Verdict result per Reference slot.
 */
export declare const ReferenceOutcome: z.ZodDiscriminatedUnion<[z.ZodObject<{
    kind: z.ZodLiteral<"status">;
    status: z.ZodEnum<{
        cancelled: "cancelled";
        failed: "failed";
        "not-checked": "not-checked";
        running: "running";
    }>;
}, z.core.$strict>, z.ZodObject<{
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
}, z.core.$strict>], "kind">;
export type ReferenceOutcome = z.infer<typeof ReferenceOutcome>;
export declare const ReferenceProgress: z.ZodEnum<{
    checking: "checking";
    crossref: "crossref";
    "doi.org": "doi.org";
    ended: "ended";
    queued: "queued";
}>;
export type ReferenceProgress = z.infer<typeof ReferenceProgress>;
export declare const CheckEndReason: z.ZodEnum<{
    cancelled: "cancelled";
    completed: "completed";
    "lease-expired": "lease-expired";
}>;
export type CheckEndReason = z.infer<typeof CheckEndReason>;
export declare const ReferenceSlot: z.ZodObject<{
    slot: z.ZodNumber;
    originalText: z.ZodString;
    outcome: z.ZodDiscriminatedUnion<[z.ZodObject<{
        kind: z.ZodLiteral<"status">;
        status: z.ZodEnum<{
            cancelled: "cancelled";
            failed: "failed";
            "not-checked": "not-checked";
            running: "running";
        }>;
    }, z.core.$strict>, z.ZodObject<{
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
    }, z.core.$strict>], "kind">;
    progress: z.ZodEnum<{
        checking: "checking";
        crossref: "crossref";
        "doi.org": "doi.org";
        ended: "ended";
        queued: "queued";
    }>;
}, z.core.$strip>;
export type ReferenceSlot = z.infer<typeof ReferenceSlot>;
/** Pre-start states (Structuring, awaiting start) join when they exist. */
export declare const CheckState: z.ZodEnum<{
    ended: "ended";
    running: "running";
}>;
export type CheckState = z.infer<typeof CheckState>;
export declare const CheckId: z.ZodUUID;
export declare const Check: z.ZodObject<{
    id: z.ZodUUID;
    state: z.ZodEnum<{
        ended: "ended";
        running: "running";
    }>;
    lastEventSeq: z.ZodNumber;
    lastEventCursor: z.ZodString;
    leaseRenewAfterMs: z.ZodNumber;
    endReason: z.ZodNullable<z.ZodEnum<{
        cancelled: "cancelled";
        completed: "completed";
        "lease-expired": "lease-expired";
    }>>;
    references: z.ZodArray<z.ZodObject<{
        slot: z.ZodNumber;
        originalText: z.ZodString;
        outcome: z.ZodDiscriminatedUnion<[z.ZodObject<{
            kind: z.ZodLiteral<"status">;
            status: z.ZodEnum<{
                cancelled: "cancelled";
                failed: "failed";
                "not-checked": "not-checked";
                running: "running";
            }>;
        }, z.core.$strict>, z.ZodObject<{
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
        }, z.core.$strict>], "kind">;
        progress: z.ZodEnum<{
            checking: "checking";
            crossref: "crossref";
            "doi.org": "doi.org";
            ended: "ended";
            queued: "queued";
        }>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type Check = z.infer<typeof Check>;
export declare const CheckResponse: z.ZodObject<{
    data: z.ZodObject<{
        id: z.ZodUUID;
        state: z.ZodEnum<{
            ended: "ended";
            running: "running";
        }>;
        lastEventSeq: z.ZodNumber;
        lastEventCursor: z.ZodString;
        leaseRenewAfterMs: z.ZodNumber;
        endReason: z.ZodNullable<z.ZodEnum<{
            cancelled: "cancelled";
            completed: "completed";
            "lease-expired": "lease-expired";
        }>>;
        references: z.ZodArray<z.ZodObject<{
            slot: z.ZodNumber;
            originalText: z.ZodString;
            outcome: z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodLiteral<"status">;
                status: z.ZodEnum<{
                    cancelled: "cancelled";
                    failed: "failed";
                    "not-checked": "not-checked";
                    running: "running";
                }>;
            }, z.core.$strict>, z.ZodObject<{
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
            }, z.core.$strict>], "kind">;
            progress: z.ZodEnum<{
                checking: "checking";
                crossref: "crossref";
                "doi.org": "doi.org";
                ended: "ended";
                queued: "queued";
            }>;
        }, z.core.$strip>>;
    }, z.core.$strip>;
    quota: z.ZodNullable<z.ZodObject<{
        consumed: z.ZodNumber;
        remaining: z.ZodNumber;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type CheckResponse = z.infer<typeof CheckResponse>;
export declare const CreateCheckRequest: z.ZodUnion<readonly [z.ZodObject<{
    text: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    references: z.ZodArray<z.ZodObject<{
        originalText: z.ZodString;
        fields: z.ZodObject<{
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
        authorsTruncated: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strip>>;
}, z.core.$strip>]>;
export type CreateCheckRequest = z.input<typeof CreateCheckRequest>;
export declare const CheckUpdatedEvent: z.ZodObject<{
    seq: z.ZodNumber;
    checkId: z.ZodUUID;
    type: z.ZodLiteral<"check.updated">;
    state: z.ZodEnum<{
        ended: "ended";
        running: "running";
    }>;
    endReason: z.ZodNullable<z.ZodEnum<{
        cancelled: "cancelled";
        completed: "completed";
        "lease-expired": "lease-expired";
    }>>;
}, z.core.$strip>;
export declare const ReferenceUpdatedEvent: z.ZodObject<{
    seq: z.ZodNumber;
    checkId: z.ZodUUID;
    type: z.ZodLiteral<"reference.updated">;
    reference: z.ZodObject<{
        slot: z.ZodNumber;
        outcome: z.ZodDiscriminatedUnion<[z.ZodObject<{
            kind: z.ZodLiteral<"status">;
            status: z.ZodEnum<{
                cancelled: "cancelled";
                failed: "failed";
                "not-checked": "not-checked";
                running: "running";
            }>;
        }, z.core.$strict>, z.ZodObject<{
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
        }, z.core.$strict>], "kind">;
        progress: z.ZodEnum<{
            checking: "checking";
            crossref: "crossref";
            "doi.org": "doi.org";
            ended: "ended";
            queued: "queued";
        }>;
    }, z.core.$strip>;
}, z.core.$strip>;
/** The `data` of every SSE event on `GET /v1/checks/{id}/events`. */
export declare const CheckEvent: z.ZodDiscriminatedUnion<[z.ZodObject<{
    seq: z.ZodNumber;
    checkId: z.ZodUUID;
    type: z.ZodLiteral<"check.updated">;
    state: z.ZodEnum<{
        ended: "ended";
        running: "running";
    }>;
    endReason: z.ZodNullable<z.ZodEnum<{
        cancelled: "cancelled";
        completed: "completed";
        "lease-expired": "lease-expired";
    }>>;
}, z.core.$strip>, z.ZodObject<{
    seq: z.ZodNumber;
    checkId: z.ZodUUID;
    type: z.ZodLiteral<"reference.updated">;
    reference: z.ZodObject<{
        slot: z.ZodNumber;
        outcome: z.ZodDiscriminatedUnion<[z.ZodObject<{
            kind: z.ZodLiteral<"status">;
            status: z.ZodEnum<{
                cancelled: "cancelled";
                failed: "failed";
                "not-checked": "not-checked";
                running: "running";
            }>;
        }, z.core.$strict>, z.ZodObject<{
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
        }, z.core.$strict>], "kind">;
        progress: z.ZodEnum<{
            checking: "checking";
            crossref: "crossref";
            "doi.org": "doi.org";
            ended: "ended";
            queued: "queued";
        }>;
    }, z.core.$strip>;
}, z.core.$strip>], "type">;
export type CheckEvent = z.infer<typeof CheckEvent>;
/** The stream closes after the event that moves the Check into this state. */
export declare function isFinalEvent(event: CheckEvent): boolean;
export * from "./structuring.ts";
