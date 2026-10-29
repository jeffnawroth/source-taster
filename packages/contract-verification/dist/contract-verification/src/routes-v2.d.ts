export declare const createCheck: {
    getRoutingPath(): "/v1/checks";
    method: "post";
    summary: string;
    path: "/v2/checks";
    request: {
        body: {
            required: true;
            content: {
                "application/json": {
                    schema: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                        text: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                        references: import("zod").ZodArray<import("zod").ZodObject<{
                            originalText: import("zod").ZodString;
                            fields: import("zod").ZodObject<{
                                type: import("zod").ZodOptional<import("zod").ZodString>;
                                author: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodObject<{
                                    family: import("zod").ZodOptional<import("zod").ZodString>;
                                    "non-dropping-particle": import("zod").ZodOptional<import("zod").ZodString>;
                                    given: import("zod").ZodOptional<import("zod").ZodString>;
                                    literal: import("zod").ZodOptional<import("zod").ZodString>;
                                }, import("zod/v4/core").$strip>>>;
                                issued: import("zod").ZodOptional<import("zod").ZodObject<{
                                    literal: import("zod").ZodString;
                                }, import("zod/v4/core").$strip>>;
                                title: import("zod").ZodOptional<import("zod").ZodString>;
                                "container-title": import("zod").ZodOptional<import("zod").ZodString>;
                                "container-title-short": import("zod").ZodOptional<import("zod").ZodString>;
                                publisher: import("zod").ZodOptional<import("zod").ZodString>;
                                "publisher-place": import("zod").ZodOptional<import("zod").ZodString>;
                                volume: import("zod").ZodOptional<import("zod").ZodString>;
                                issue: import("zod").ZodOptional<import("zod").ZodString>;
                                page: import("zod").ZodOptional<import("zod").ZodString>;
                                "article-number": import("zod").ZodOptional<import("zod").ZodString>;
                                edition: import("zod").ZodOptional<import("zod").ZodString>;
                                DOI: import("zod").ZodOptional<import("zod").ZodString>;
                                URL: import("zod").ZodOptional<import("zod").ZodString>;
                                ISBN: import("zod").ZodOptional<import("zod").ZodString>;
                                ISSN: import("zod").ZodOptional<import("zod").ZodString>;
                                PMID: import("zod").ZodOptional<import("zod").ZodString>;
                                PMCID: import("zod").ZodOptional<import("zod").ZodString>;
                                arXiv: import("zod").ZodOptional<import("zod").ZodString>;
                            }, import("zod/v4/core").$strip>;
                            authorsTruncated: import("zod").ZodOptional<import("zod").ZodBoolean>;
                        }, import("zod/v4/core").$strip>>;
                    }, import("zod/v4/core").$strip>]>;
                };
            };
        };
    };
    responses: {
        401: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        403: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        503: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        400: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        201: {
            description: string;
            content: {
                "application/json": {
                    schema: import("zod").ZodObject<{
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                        data: import("zod").ZodObject<{
                            id: import("zod").ZodUUID;
                            state: import("zod").ZodEnum<{
                                ended: "ended";
                                running: "running";
                            }>;
                            lastEventSeq: import("zod").ZodNumber;
                            lastEventCursor: import("zod").ZodString;
                            leaseRenewAfterMs: import("zod").ZodNumber;
                            endReason: import("zod").ZodNullable<import("zod").ZodEnum<{
                                cancelled: "cancelled";
                                completed: "completed";
                                "lease-expired": "lease-expired";
                            }>>;
                            references: import("zod").ZodArray<import("zod").ZodObject<{
                                slot: import("zod").ZodNumber;
                                originalText: import("zod").ZodString;
                                outcome: import("zod").ZodDiscriminatedUnion<[import("zod").ZodObject<{
                                    kind: import("zod").ZodLiteral<"status">;
                                    status: import("zod").ZodEnum<{
                                        cancelled: "cancelled";
                                        failed: "failed";
                                        "not-checked": "not-checked";
                                        running: "running";
                                    }>;
                                }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                                    kind: import("zod").ZodLiteral<"verdict">;
                                    verdict: import("zod").ZodEnum<{
                                        correct: "correct";
                                        "doi-conflict": "doi-conflict";
                                        "exists-with-deviations": "exists-with-deviations";
                                        "mixed-citation": "mixed-citation";
                                        "not-found": "not-found";
                                        "not-verifiable": "not-verifiable";
                                    }>;
                                    scoringRules: import("zod").ZodObject<{
                                        version: import("zod").ZodString;
                                        calibration: import("zod").ZodLiteral<"uncalibrated">;
                                        unicode: import("zod").ZodString;
                                        icu: import("zod").ZodString;
                                        profile: import("zod").ZodRecord<import("zod").ZodString, import("zod").ZodNumber>;
                                    }, import("zod/v4/core").$strip>;
                                    searchStrategyVersion: import("zod").ZodString;
                                    searchConfiguration: import("zod").ZodRecord<import("zod").ZodString, import("zod").ZodUnion<readonly [import("zod").ZodString, import("zod").ZodNumber]>>;
                                    bestMatchId: import("zod").ZodNullable<import("zod").ZodString>;
                                    reference: import("zod").ZodObject<{
                                        originalText: import("zod").ZodString;
                                        span: import("zod").ZodObject<{
                                            start: import("zod").ZodNumber;
                                            end: import("zod").ZodNumber;
                                        }, import("zod/v4/core").$strip>;
                                        fieldSources: import("zod").ZodRecord<import("zod").ZodString, import("zod").ZodObject<{
                                            raw: import("zod").ZodString;
                                            span: import("zod").ZodOptional<import("zod").ZodObject<{
                                                start: import("zod").ZodNumber;
                                                end: import("zod").ZodNumber;
                                            }, import("zod/v4/core").$strip>>;
                                            normalized: import("zod").ZodOptional<import("zod").ZodString>;
                                        }, import("zod/v4/core").$strip>>;
                                        authorsTruncated: import("zod").ZodOptional<import("zod").ZodBoolean>;
                                        structuring: import("zod").ZodObject<{
                                            path: import("zod").ZodEnum<{
                                                parser: "parser";
                                                user: "user";
                                            }>;
                                            version: import("zod").ZodString;
                                        }, import("zod/v4/core").$strip>;
                                        csl: import("zod").ZodObject<{
                                            type: import("zod").ZodOptional<import("zod").ZodString>;
                                            author: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodObject<{
                                                family: import("zod").ZodOptional<import("zod").ZodString>;
                                                "non-dropping-particle": import("zod").ZodOptional<import("zod").ZodString>;
                                                given: import("zod").ZodOptional<import("zod").ZodString>;
                                                literal: import("zod").ZodOptional<import("zod").ZodString>;
                                            }, import("zod/v4/core").$strip>>>;
                                            issued: import("zod").ZodOptional<import("zod").ZodObject<{
                                                literal: import("zod").ZodString;
                                            }, import("zod/v4/core").$strip>>;
                                            title: import("zod").ZodOptional<import("zod").ZodString>;
                                            "container-title": import("zod").ZodOptional<import("zod").ZodString>;
                                            "container-title-short": import("zod").ZodOptional<import("zod").ZodString>;
                                            publisher: import("zod").ZodOptional<import("zod").ZodString>;
                                            "publisher-place": import("zod").ZodOptional<import("zod").ZodString>;
                                            volume: import("zod").ZodOptional<import("zod").ZodString>;
                                            issue: import("zod").ZodOptional<import("zod").ZodString>;
                                            page: import("zod").ZodOptional<import("zod").ZodString>;
                                            "article-number": import("zod").ZodOptional<import("zod").ZodString>;
                                            edition: import("zod").ZodOptional<import("zod").ZodString>;
                                            DOI: import("zod").ZodOptional<import("zod").ZodString>;
                                            URL: import("zod").ZodOptional<import("zod").ZodString>;
                                            ISBN: import("zod").ZodOptional<import("zod").ZodString>;
                                            ISSN: import("zod").ZodOptional<import("zod").ZodString>;
                                            PMID: import("zod").ZodOptional<import("zod").ZodString>;
                                            PMCID: import("zod").ZodOptional<import("zod").ZodString>;
                                            arXiv: import("zod").ZodOptional<import("zod").ZodString>;
                                        }, import("zod/v4/core").$strip>;
                                    }, import("zod/v4/core").$strip>;
                                    identity: import("zod").ZodObject<{
                                        candidateId: import("zod").ZodOptional<import("zod").ZodString>;
                                        kind: import("zod").ZodEnum<{
                                            "independent-bibliography": "independent-bibliography";
                                            "supplied-doi": "supplied-doi";
                                            "supplied-identifier": "supplied-identifier";
                                            unresolved: "unresolved";
                                        }>;
                                    }, import("zod/v4/core").$strip>;
                                    candidates: import("zod").ZodArray<import("zod").ZodObject<{
                                        id: import("zod").ZodString;
                                        slot: import("zod").ZodNumber;
                                        retrievedAt: import("zod").ZodString;
                                        raw: import("zod").ZodUnknown;
                                        fields: import("zod").ZodArray<import("zod").ZodObject<{
                                            field: import("zod").ZodString;
                                            reference: import("zod").ZodUnknown;
                                            candidate: import("zod").ZodUnknown;
                                            score: import("zod").ZodNullable<import("zod").ZodObject<{
                                                value: import("zod").ZodNumber;
                                                fullAgreement: import("zod").ZodBoolean;
                                            }, import("zod/v4/core").$strip>>;
                                            reason: import("zod").ZodEnum<{
                                                compared: "compared";
                                                "missing-candidate": "missing-candidate";
                                                "missing-reference": "missing-reference";
                                                "not-determinable": "not-determinable";
                                                "resource-limit": "resource-limit";
                                                unweighted: "unweighted";
                                            }>;
                                        }, import("zod/v4/core").$strip>>;
                                        score: import("zod").ZodNullable<import("zod").ZodObject<{
                                            value: import("zod").ZodNumber;
                                            fullAgreement: import("zod").ZodBoolean;
                                        }, import("zod/v4/core").$strip>>;
                                        csl: import("zod").ZodObject<{
                                            type: import("zod").ZodOptional<import("zod").ZodString>;
                                            author: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodObject<{
                                                family: import("zod").ZodOptional<import("zod").ZodString>;
                                                "non-dropping-particle": import("zod").ZodOptional<import("zod").ZodString>;
                                                given: import("zod").ZodOptional<import("zod").ZodString>;
                                                literal: import("zod").ZodOptional<import("zod").ZodString>;
                                            }, import("zod/v4/core").$strip>>>;
                                            issued: import("zod").ZodOptional<import("zod").ZodObject<{
                                                literal: import("zod").ZodString;
                                            }, import("zod/v4/core").$strip>>;
                                            title: import("zod").ZodOptional<import("zod").ZodString>;
                                            "container-title": import("zod").ZodOptional<import("zod").ZodString>;
                                            "container-title-short": import("zod").ZodOptional<import("zod").ZodString>;
                                            publisher: import("zod").ZodOptional<import("zod").ZodString>;
                                            "publisher-place": import("zod").ZodOptional<import("zod").ZodString>;
                                            volume: import("zod").ZodOptional<import("zod").ZodString>;
                                            issue: import("zod").ZodOptional<import("zod").ZodString>;
                                            page: import("zod").ZodOptional<import("zod").ZodString>;
                                            "article-number": import("zod").ZodOptional<import("zod").ZodString>;
                                            edition: import("zod").ZodOptional<import("zod").ZodString>;
                                            DOI: import("zod").ZodOptional<import("zod").ZodString>;
                                            URL: import("zod").ZodOptional<import("zod").ZodString>;
                                            ISBN: import("zod").ZodOptional<import("zod").ZodString>;
                                            ISSN: import("zod").ZodOptional<import("zod").ZodString>;
                                            PMID: import("zod").ZodOptional<import("zod").ZodString>;
                                            PMCID: import("zod").ZodOptional<import("zod").ZodString>;
                                            arXiv: import("zod").ZodOptional<import("zod").ZodString>;
                                        }, import("zod/v4/core").$strip>;
                                        source: import("zod").ZodEnum<{
                                            arxiv: "arxiv";
                                            crossref: "crossref";
                                            europepmc: "europepmc";
                                            openalex: "openalex";
                                            semanticscholar: "semanticscholar";
                                        }>;
                                        origin: import("zod").ZodEnum<{
                                            arxiv: "arxiv";
                                            "authors-year": "authors-year";
                                            combined: "combined";
                                            doi: "doi";
                                            pmcid: "pmcid";
                                            pmid: "pmid";
                                            title: "title";
                                        }>;
                                        identifiers: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString>>;
                                        retractionEvidence: import("zod").ZodOptional<import("zod").ZodObject<{
                                            source: import("zod").ZodEnum<{
                                                crossref: "crossref";
                                                europepmc: "europepmc";
                                                openalex: "openalex";
                                            }>;
                                            candidateId: import("zod").ZodString;
                                            observedAt: import("zod").ZodString;
                                        }, import("zod/v4/core").$strip>>;
                                    }, import("zod/v4/core").$strip>>;
                                    evidence: import("zod").ZodArray<import("zod").ZodObject<{
                                        reason: import("zod").ZodOptional<import("zod").ZodString>;
                                        status: import("zod").ZodOptional<import("zod").ZodNumber>;
                                        durationMs: import("zod").ZodNumber;
                                        attempts: import("zod").ZodNumber;
                                        observedAt: import("zod").ZodString;
                                        raw: import("zod").ZodOptional<import("zod").ZodUnknown>;
                                        source: import("zod").ZodEnum<{
                                            arxiv: "arxiv";
                                            crossref: "crossref";
                                            "doi.org": "doi.org";
                                            europepmc: "europepmc";
                                            openalex: "openalex";
                                            semanticscholar: "semanticscholar";
                                        }>;
                                        operation: import("zod").ZodEnum<{
                                            arxiv: "arxiv";
                                            "authors-year": "authors-year";
                                            combined: "combined";
                                            doi: "doi";
                                            pmcid: "pmcid";
                                            pmid: "pmid";
                                            title: "title";
                                        }>;
                                        outcome: import("zod").ZodEnum<{
                                            candidate: "candidate";
                                            disabled: "disabled";
                                            exists: "exists";
                                            "no-record": "no-record";
                                            nonexistent: "nonexistent";
                                            skipped: "skipped";
                                            unavailable: "unavailable";
                                            unsupported: "unsupported";
                                        }>;
                                        skippedDuplicates: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString>>;
                                        unusedSlots: import("zod").ZodOptional<import("zod").ZodNumber>;
                                    }, import("zod/v4/core").$strip>>;
                                    reasons: import("zod").ZodArray<import("zod").ZodEnum<{
                                        "ambiguous-identity": "ambiguous-identity";
                                        "development-route-incomplete": "development-route-incomplete";
                                        "doi-nonexistent": "doi-nonexistent";
                                        "fields-differ": "fields-differ";
                                        "foreign-doi": "foreign-doi";
                                        identified: "identified";
                                        "identity-unresolved": "identity-unresolved";
                                        "insufficient-search": "insufficient-search";
                                        "mandatory-resolution-incomplete": "mandatory-resolution-incomplete";
                                        "metadata-unavailable": "metadata-unavailable";
                                        "mixed-components": "mixed-components";
                                        "outside-coverage": "outside-coverage";
                                        "search-completed": "search-completed";
                                        "sources-unavailable": "sources-unavailable";
                                        "url-verification-incomplete": "url-verification-incomplete";
                                    }>>;
                                    failedSources: import("zod").ZodArray<import("zod").ZodEnum<{
                                        arxiv: "arxiv";
                                        crossref: "crossref";
                                        "doi.org": "doi.org";
                                        europepmc: "europepmc";
                                        openalex: "openalex";
                                        semanticscholar: "semanticscholar";
                                    }>>;
                                    retraction: import("zod").ZodEnum<{
                                        retracted: "retracted";
                                        unknown: "unknown";
                                    }>;
                                    retractionEvidence: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodObject<{
                                        source: import("zod").ZodEnum<{
                                            crossref: "crossref";
                                            europepmc: "europepmc";
                                            openalex: "openalex";
                                        }>;
                                        candidateId: import("zod").ZodString;
                                        observedAt: import("zod").ZodString;
                                    }, import("zod/v4/core").$strip>>>;
                                }, import("zod/v4/core").$strict>], "kind">;
                                progress: import("zod").ZodEnum<{
                                    arxiv: "arxiv";
                                    checking: "checking";
                                    crossref: "crossref";
                                    "doi.org": "doi.org";
                                    ended: "ended";
                                    europepmc: "europepmc";
                                    openalex: "openalex";
                                    queued: "queued";
                                    semanticscholar: "semanticscholar";
                                }>;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
    };
} & {
    getRoutingPath(): "/v2/checks";
};
export declare const getCheck: {
    getRoutingPath(): "/v1/checks/:checkId";
    method: "get";
    summary: string;
    request: {
        params: import("zod").ZodObject<{
            checkId: import("zod").ZodUUID;
        }, import("zod/v4/core").$strip>;
    };
    path: "/v2/checks/{checkId}";
    responses: {
        401: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        403: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        503: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        400: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        404: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        200: {
            description: string;
            content: {
                "application/json": {
                    schema: import("zod").ZodObject<{
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                        data: import("zod").ZodObject<{
                            id: import("zod").ZodUUID;
                            state: import("zod").ZodEnum<{
                                ended: "ended";
                                running: "running";
                            }>;
                            lastEventSeq: import("zod").ZodNumber;
                            lastEventCursor: import("zod").ZodString;
                            leaseRenewAfterMs: import("zod").ZodNumber;
                            endReason: import("zod").ZodNullable<import("zod").ZodEnum<{
                                cancelled: "cancelled";
                                completed: "completed";
                                "lease-expired": "lease-expired";
                            }>>;
                            references: import("zod").ZodArray<import("zod").ZodObject<{
                                slot: import("zod").ZodNumber;
                                originalText: import("zod").ZodString;
                                outcome: import("zod").ZodDiscriminatedUnion<[import("zod").ZodObject<{
                                    kind: import("zod").ZodLiteral<"status">;
                                    status: import("zod").ZodEnum<{
                                        cancelled: "cancelled";
                                        failed: "failed";
                                        "not-checked": "not-checked";
                                        running: "running";
                                    }>;
                                }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                                    kind: import("zod").ZodLiteral<"verdict">;
                                    verdict: import("zod").ZodEnum<{
                                        correct: "correct";
                                        "doi-conflict": "doi-conflict";
                                        "exists-with-deviations": "exists-with-deviations";
                                        "mixed-citation": "mixed-citation";
                                        "not-found": "not-found";
                                        "not-verifiable": "not-verifiable";
                                    }>;
                                    scoringRules: import("zod").ZodObject<{
                                        version: import("zod").ZodString;
                                        calibration: import("zod").ZodLiteral<"uncalibrated">;
                                        unicode: import("zod").ZodString;
                                        icu: import("zod").ZodString;
                                        profile: import("zod").ZodRecord<import("zod").ZodString, import("zod").ZodNumber>;
                                    }, import("zod/v4/core").$strip>;
                                    searchStrategyVersion: import("zod").ZodString;
                                    searchConfiguration: import("zod").ZodRecord<import("zod").ZodString, import("zod").ZodUnion<readonly [import("zod").ZodString, import("zod").ZodNumber]>>;
                                    bestMatchId: import("zod").ZodNullable<import("zod").ZodString>;
                                    reference: import("zod").ZodObject<{
                                        originalText: import("zod").ZodString;
                                        span: import("zod").ZodObject<{
                                            start: import("zod").ZodNumber;
                                            end: import("zod").ZodNumber;
                                        }, import("zod/v4/core").$strip>;
                                        fieldSources: import("zod").ZodRecord<import("zod").ZodString, import("zod").ZodObject<{
                                            raw: import("zod").ZodString;
                                            span: import("zod").ZodOptional<import("zod").ZodObject<{
                                                start: import("zod").ZodNumber;
                                                end: import("zod").ZodNumber;
                                            }, import("zod/v4/core").$strip>>;
                                            normalized: import("zod").ZodOptional<import("zod").ZodString>;
                                        }, import("zod/v4/core").$strip>>;
                                        authorsTruncated: import("zod").ZodOptional<import("zod").ZodBoolean>;
                                        structuring: import("zod").ZodObject<{
                                            path: import("zod").ZodEnum<{
                                                parser: "parser";
                                                user: "user";
                                            }>;
                                            version: import("zod").ZodString;
                                        }, import("zod/v4/core").$strip>;
                                        csl: import("zod").ZodObject<{
                                            type: import("zod").ZodOptional<import("zod").ZodString>;
                                            author: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodObject<{
                                                family: import("zod").ZodOptional<import("zod").ZodString>;
                                                "non-dropping-particle": import("zod").ZodOptional<import("zod").ZodString>;
                                                given: import("zod").ZodOptional<import("zod").ZodString>;
                                                literal: import("zod").ZodOptional<import("zod").ZodString>;
                                            }, import("zod/v4/core").$strip>>>;
                                            issued: import("zod").ZodOptional<import("zod").ZodObject<{
                                                literal: import("zod").ZodString;
                                            }, import("zod/v4/core").$strip>>;
                                            title: import("zod").ZodOptional<import("zod").ZodString>;
                                            "container-title": import("zod").ZodOptional<import("zod").ZodString>;
                                            "container-title-short": import("zod").ZodOptional<import("zod").ZodString>;
                                            publisher: import("zod").ZodOptional<import("zod").ZodString>;
                                            "publisher-place": import("zod").ZodOptional<import("zod").ZodString>;
                                            volume: import("zod").ZodOptional<import("zod").ZodString>;
                                            issue: import("zod").ZodOptional<import("zod").ZodString>;
                                            page: import("zod").ZodOptional<import("zod").ZodString>;
                                            "article-number": import("zod").ZodOptional<import("zod").ZodString>;
                                            edition: import("zod").ZodOptional<import("zod").ZodString>;
                                            DOI: import("zod").ZodOptional<import("zod").ZodString>;
                                            URL: import("zod").ZodOptional<import("zod").ZodString>;
                                            ISBN: import("zod").ZodOptional<import("zod").ZodString>;
                                            ISSN: import("zod").ZodOptional<import("zod").ZodString>;
                                            PMID: import("zod").ZodOptional<import("zod").ZodString>;
                                            PMCID: import("zod").ZodOptional<import("zod").ZodString>;
                                            arXiv: import("zod").ZodOptional<import("zod").ZodString>;
                                        }, import("zod/v4/core").$strip>;
                                    }, import("zod/v4/core").$strip>;
                                    identity: import("zod").ZodObject<{
                                        candidateId: import("zod").ZodOptional<import("zod").ZodString>;
                                        kind: import("zod").ZodEnum<{
                                            "independent-bibliography": "independent-bibliography";
                                            "supplied-doi": "supplied-doi";
                                            "supplied-identifier": "supplied-identifier";
                                            unresolved: "unresolved";
                                        }>;
                                    }, import("zod/v4/core").$strip>;
                                    candidates: import("zod").ZodArray<import("zod").ZodObject<{
                                        id: import("zod").ZodString;
                                        slot: import("zod").ZodNumber;
                                        retrievedAt: import("zod").ZodString;
                                        raw: import("zod").ZodUnknown;
                                        fields: import("zod").ZodArray<import("zod").ZodObject<{
                                            field: import("zod").ZodString;
                                            reference: import("zod").ZodUnknown;
                                            candidate: import("zod").ZodUnknown;
                                            score: import("zod").ZodNullable<import("zod").ZodObject<{
                                                value: import("zod").ZodNumber;
                                                fullAgreement: import("zod").ZodBoolean;
                                            }, import("zod/v4/core").$strip>>;
                                            reason: import("zod").ZodEnum<{
                                                compared: "compared";
                                                "missing-candidate": "missing-candidate";
                                                "missing-reference": "missing-reference";
                                                "not-determinable": "not-determinable";
                                                "resource-limit": "resource-limit";
                                                unweighted: "unweighted";
                                            }>;
                                        }, import("zod/v4/core").$strip>>;
                                        score: import("zod").ZodNullable<import("zod").ZodObject<{
                                            value: import("zod").ZodNumber;
                                            fullAgreement: import("zod").ZodBoolean;
                                        }, import("zod/v4/core").$strip>>;
                                        csl: import("zod").ZodObject<{
                                            type: import("zod").ZodOptional<import("zod").ZodString>;
                                            author: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodObject<{
                                                family: import("zod").ZodOptional<import("zod").ZodString>;
                                                "non-dropping-particle": import("zod").ZodOptional<import("zod").ZodString>;
                                                given: import("zod").ZodOptional<import("zod").ZodString>;
                                                literal: import("zod").ZodOptional<import("zod").ZodString>;
                                            }, import("zod/v4/core").$strip>>>;
                                            issued: import("zod").ZodOptional<import("zod").ZodObject<{
                                                literal: import("zod").ZodString;
                                            }, import("zod/v4/core").$strip>>;
                                            title: import("zod").ZodOptional<import("zod").ZodString>;
                                            "container-title": import("zod").ZodOptional<import("zod").ZodString>;
                                            "container-title-short": import("zod").ZodOptional<import("zod").ZodString>;
                                            publisher: import("zod").ZodOptional<import("zod").ZodString>;
                                            "publisher-place": import("zod").ZodOptional<import("zod").ZodString>;
                                            volume: import("zod").ZodOptional<import("zod").ZodString>;
                                            issue: import("zod").ZodOptional<import("zod").ZodString>;
                                            page: import("zod").ZodOptional<import("zod").ZodString>;
                                            "article-number": import("zod").ZodOptional<import("zod").ZodString>;
                                            edition: import("zod").ZodOptional<import("zod").ZodString>;
                                            DOI: import("zod").ZodOptional<import("zod").ZodString>;
                                            URL: import("zod").ZodOptional<import("zod").ZodString>;
                                            ISBN: import("zod").ZodOptional<import("zod").ZodString>;
                                            ISSN: import("zod").ZodOptional<import("zod").ZodString>;
                                            PMID: import("zod").ZodOptional<import("zod").ZodString>;
                                            PMCID: import("zod").ZodOptional<import("zod").ZodString>;
                                            arXiv: import("zod").ZodOptional<import("zod").ZodString>;
                                        }, import("zod/v4/core").$strip>;
                                        source: import("zod").ZodEnum<{
                                            arxiv: "arxiv";
                                            crossref: "crossref";
                                            europepmc: "europepmc";
                                            openalex: "openalex";
                                            semanticscholar: "semanticscholar";
                                        }>;
                                        origin: import("zod").ZodEnum<{
                                            arxiv: "arxiv";
                                            "authors-year": "authors-year";
                                            combined: "combined";
                                            doi: "doi";
                                            pmcid: "pmcid";
                                            pmid: "pmid";
                                            title: "title";
                                        }>;
                                        identifiers: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString>>;
                                        retractionEvidence: import("zod").ZodOptional<import("zod").ZodObject<{
                                            source: import("zod").ZodEnum<{
                                                crossref: "crossref";
                                                europepmc: "europepmc";
                                                openalex: "openalex";
                                            }>;
                                            candidateId: import("zod").ZodString;
                                            observedAt: import("zod").ZodString;
                                        }, import("zod/v4/core").$strip>>;
                                    }, import("zod/v4/core").$strip>>;
                                    evidence: import("zod").ZodArray<import("zod").ZodObject<{
                                        reason: import("zod").ZodOptional<import("zod").ZodString>;
                                        status: import("zod").ZodOptional<import("zod").ZodNumber>;
                                        durationMs: import("zod").ZodNumber;
                                        attempts: import("zod").ZodNumber;
                                        observedAt: import("zod").ZodString;
                                        raw: import("zod").ZodOptional<import("zod").ZodUnknown>;
                                        source: import("zod").ZodEnum<{
                                            arxiv: "arxiv";
                                            crossref: "crossref";
                                            "doi.org": "doi.org";
                                            europepmc: "europepmc";
                                            openalex: "openalex";
                                            semanticscholar: "semanticscholar";
                                        }>;
                                        operation: import("zod").ZodEnum<{
                                            arxiv: "arxiv";
                                            "authors-year": "authors-year";
                                            combined: "combined";
                                            doi: "doi";
                                            pmcid: "pmcid";
                                            pmid: "pmid";
                                            title: "title";
                                        }>;
                                        outcome: import("zod").ZodEnum<{
                                            candidate: "candidate";
                                            disabled: "disabled";
                                            exists: "exists";
                                            "no-record": "no-record";
                                            nonexistent: "nonexistent";
                                            skipped: "skipped";
                                            unavailable: "unavailable";
                                            unsupported: "unsupported";
                                        }>;
                                        skippedDuplicates: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString>>;
                                        unusedSlots: import("zod").ZodOptional<import("zod").ZodNumber>;
                                    }, import("zod/v4/core").$strip>>;
                                    reasons: import("zod").ZodArray<import("zod").ZodEnum<{
                                        "ambiguous-identity": "ambiguous-identity";
                                        "development-route-incomplete": "development-route-incomplete";
                                        "doi-nonexistent": "doi-nonexistent";
                                        "fields-differ": "fields-differ";
                                        "foreign-doi": "foreign-doi";
                                        identified: "identified";
                                        "identity-unresolved": "identity-unresolved";
                                        "insufficient-search": "insufficient-search";
                                        "mandatory-resolution-incomplete": "mandatory-resolution-incomplete";
                                        "metadata-unavailable": "metadata-unavailable";
                                        "mixed-components": "mixed-components";
                                        "outside-coverage": "outside-coverage";
                                        "search-completed": "search-completed";
                                        "sources-unavailable": "sources-unavailable";
                                        "url-verification-incomplete": "url-verification-incomplete";
                                    }>>;
                                    failedSources: import("zod").ZodArray<import("zod").ZodEnum<{
                                        arxiv: "arxiv";
                                        crossref: "crossref";
                                        "doi.org": "doi.org";
                                        europepmc: "europepmc";
                                        openalex: "openalex";
                                        semanticscholar: "semanticscholar";
                                    }>>;
                                    retraction: import("zod").ZodEnum<{
                                        retracted: "retracted";
                                        unknown: "unknown";
                                    }>;
                                    retractionEvidence: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodObject<{
                                        source: import("zod").ZodEnum<{
                                            crossref: "crossref";
                                            europepmc: "europepmc";
                                            openalex: "openalex";
                                        }>;
                                        candidateId: import("zod").ZodString;
                                        observedAt: import("zod").ZodString;
                                    }, import("zod/v4/core").$strip>>>;
                                }, import("zod/v4/core").$strict>], "kind">;
                                progress: import("zod").ZodEnum<{
                                    arxiv: "arxiv";
                                    checking: "checking";
                                    crossref: "crossref";
                                    "doi.org": "doi.org";
                                    ended: "ended";
                                    europepmc: "europepmc";
                                    openalex: "openalex";
                                    queued: "queued";
                                    semanticscholar: "semanticscholar";
                                }>;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
    };
} & {
    getRoutingPath(): "/v2/checks/:checkId";
};
export declare const cancelCheck: {
    getRoutingPath(): "/v1/checks/:checkId/cancel";
    method: "post";
    summary: string;
    request: {
        params: import("zod").ZodObject<{
            checkId: import("zod").ZodUUID;
        }, import("zod/v4/core").$strip>;
    };
    path: "/v2/checks/{checkId}/cancel";
    responses: {
        503: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        400: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        401: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        403: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        404: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        200: {
            description: string;
            content: {
                "application/json": {
                    schema: import("zod").ZodObject<{
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                        data: import("zod").ZodObject<{
                            id: import("zod").ZodUUID;
                            state: import("zod").ZodEnum<{
                                ended: "ended";
                                running: "running";
                            }>;
                            lastEventSeq: import("zod").ZodNumber;
                            lastEventCursor: import("zod").ZodString;
                            leaseRenewAfterMs: import("zod").ZodNumber;
                            endReason: import("zod").ZodNullable<import("zod").ZodEnum<{
                                cancelled: "cancelled";
                                completed: "completed";
                                "lease-expired": "lease-expired";
                            }>>;
                            references: import("zod").ZodArray<import("zod").ZodObject<{
                                slot: import("zod").ZodNumber;
                                originalText: import("zod").ZodString;
                                outcome: import("zod").ZodDiscriminatedUnion<[import("zod").ZodObject<{
                                    kind: import("zod").ZodLiteral<"status">;
                                    status: import("zod").ZodEnum<{
                                        cancelled: "cancelled";
                                        failed: "failed";
                                        "not-checked": "not-checked";
                                        running: "running";
                                    }>;
                                }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                                    kind: import("zod").ZodLiteral<"verdict">;
                                    verdict: import("zod").ZodEnum<{
                                        correct: "correct";
                                        "doi-conflict": "doi-conflict";
                                        "exists-with-deviations": "exists-with-deviations";
                                        "mixed-citation": "mixed-citation";
                                        "not-found": "not-found";
                                        "not-verifiable": "not-verifiable";
                                    }>;
                                    scoringRules: import("zod").ZodObject<{
                                        version: import("zod").ZodString;
                                        calibration: import("zod").ZodLiteral<"uncalibrated">;
                                        unicode: import("zod").ZodString;
                                        icu: import("zod").ZodString;
                                        profile: import("zod").ZodRecord<import("zod").ZodString, import("zod").ZodNumber>;
                                    }, import("zod/v4/core").$strip>;
                                    searchStrategyVersion: import("zod").ZodString;
                                    searchConfiguration: import("zod").ZodRecord<import("zod").ZodString, import("zod").ZodUnion<readonly [import("zod").ZodString, import("zod").ZodNumber]>>;
                                    bestMatchId: import("zod").ZodNullable<import("zod").ZodString>;
                                    reference: import("zod").ZodObject<{
                                        originalText: import("zod").ZodString;
                                        span: import("zod").ZodObject<{
                                            start: import("zod").ZodNumber;
                                            end: import("zod").ZodNumber;
                                        }, import("zod/v4/core").$strip>;
                                        fieldSources: import("zod").ZodRecord<import("zod").ZodString, import("zod").ZodObject<{
                                            raw: import("zod").ZodString;
                                            span: import("zod").ZodOptional<import("zod").ZodObject<{
                                                start: import("zod").ZodNumber;
                                                end: import("zod").ZodNumber;
                                            }, import("zod/v4/core").$strip>>;
                                            normalized: import("zod").ZodOptional<import("zod").ZodString>;
                                        }, import("zod/v4/core").$strip>>;
                                        authorsTruncated: import("zod").ZodOptional<import("zod").ZodBoolean>;
                                        structuring: import("zod").ZodObject<{
                                            path: import("zod").ZodEnum<{
                                                parser: "parser";
                                                user: "user";
                                            }>;
                                            version: import("zod").ZodString;
                                        }, import("zod/v4/core").$strip>;
                                        csl: import("zod").ZodObject<{
                                            type: import("zod").ZodOptional<import("zod").ZodString>;
                                            author: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodObject<{
                                                family: import("zod").ZodOptional<import("zod").ZodString>;
                                                "non-dropping-particle": import("zod").ZodOptional<import("zod").ZodString>;
                                                given: import("zod").ZodOptional<import("zod").ZodString>;
                                                literal: import("zod").ZodOptional<import("zod").ZodString>;
                                            }, import("zod/v4/core").$strip>>>;
                                            issued: import("zod").ZodOptional<import("zod").ZodObject<{
                                                literal: import("zod").ZodString;
                                            }, import("zod/v4/core").$strip>>;
                                            title: import("zod").ZodOptional<import("zod").ZodString>;
                                            "container-title": import("zod").ZodOptional<import("zod").ZodString>;
                                            "container-title-short": import("zod").ZodOptional<import("zod").ZodString>;
                                            publisher: import("zod").ZodOptional<import("zod").ZodString>;
                                            "publisher-place": import("zod").ZodOptional<import("zod").ZodString>;
                                            volume: import("zod").ZodOptional<import("zod").ZodString>;
                                            issue: import("zod").ZodOptional<import("zod").ZodString>;
                                            page: import("zod").ZodOptional<import("zod").ZodString>;
                                            "article-number": import("zod").ZodOptional<import("zod").ZodString>;
                                            edition: import("zod").ZodOptional<import("zod").ZodString>;
                                            DOI: import("zod").ZodOptional<import("zod").ZodString>;
                                            URL: import("zod").ZodOptional<import("zod").ZodString>;
                                            ISBN: import("zod").ZodOptional<import("zod").ZodString>;
                                            ISSN: import("zod").ZodOptional<import("zod").ZodString>;
                                            PMID: import("zod").ZodOptional<import("zod").ZodString>;
                                            PMCID: import("zod").ZodOptional<import("zod").ZodString>;
                                            arXiv: import("zod").ZodOptional<import("zod").ZodString>;
                                        }, import("zod/v4/core").$strip>;
                                    }, import("zod/v4/core").$strip>;
                                    identity: import("zod").ZodObject<{
                                        candidateId: import("zod").ZodOptional<import("zod").ZodString>;
                                        kind: import("zod").ZodEnum<{
                                            "independent-bibliography": "independent-bibliography";
                                            "supplied-doi": "supplied-doi";
                                            "supplied-identifier": "supplied-identifier";
                                            unresolved: "unresolved";
                                        }>;
                                    }, import("zod/v4/core").$strip>;
                                    candidates: import("zod").ZodArray<import("zod").ZodObject<{
                                        id: import("zod").ZodString;
                                        slot: import("zod").ZodNumber;
                                        retrievedAt: import("zod").ZodString;
                                        raw: import("zod").ZodUnknown;
                                        fields: import("zod").ZodArray<import("zod").ZodObject<{
                                            field: import("zod").ZodString;
                                            reference: import("zod").ZodUnknown;
                                            candidate: import("zod").ZodUnknown;
                                            score: import("zod").ZodNullable<import("zod").ZodObject<{
                                                value: import("zod").ZodNumber;
                                                fullAgreement: import("zod").ZodBoolean;
                                            }, import("zod/v4/core").$strip>>;
                                            reason: import("zod").ZodEnum<{
                                                compared: "compared";
                                                "missing-candidate": "missing-candidate";
                                                "missing-reference": "missing-reference";
                                                "not-determinable": "not-determinable";
                                                "resource-limit": "resource-limit";
                                                unweighted: "unweighted";
                                            }>;
                                        }, import("zod/v4/core").$strip>>;
                                        score: import("zod").ZodNullable<import("zod").ZodObject<{
                                            value: import("zod").ZodNumber;
                                            fullAgreement: import("zod").ZodBoolean;
                                        }, import("zod/v4/core").$strip>>;
                                        csl: import("zod").ZodObject<{
                                            type: import("zod").ZodOptional<import("zod").ZodString>;
                                            author: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodObject<{
                                                family: import("zod").ZodOptional<import("zod").ZodString>;
                                                "non-dropping-particle": import("zod").ZodOptional<import("zod").ZodString>;
                                                given: import("zod").ZodOptional<import("zod").ZodString>;
                                                literal: import("zod").ZodOptional<import("zod").ZodString>;
                                            }, import("zod/v4/core").$strip>>>;
                                            issued: import("zod").ZodOptional<import("zod").ZodObject<{
                                                literal: import("zod").ZodString;
                                            }, import("zod/v4/core").$strip>>;
                                            title: import("zod").ZodOptional<import("zod").ZodString>;
                                            "container-title": import("zod").ZodOptional<import("zod").ZodString>;
                                            "container-title-short": import("zod").ZodOptional<import("zod").ZodString>;
                                            publisher: import("zod").ZodOptional<import("zod").ZodString>;
                                            "publisher-place": import("zod").ZodOptional<import("zod").ZodString>;
                                            volume: import("zod").ZodOptional<import("zod").ZodString>;
                                            issue: import("zod").ZodOptional<import("zod").ZodString>;
                                            page: import("zod").ZodOptional<import("zod").ZodString>;
                                            "article-number": import("zod").ZodOptional<import("zod").ZodString>;
                                            edition: import("zod").ZodOptional<import("zod").ZodString>;
                                            DOI: import("zod").ZodOptional<import("zod").ZodString>;
                                            URL: import("zod").ZodOptional<import("zod").ZodString>;
                                            ISBN: import("zod").ZodOptional<import("zod").ZodString>;
                                            ISSN: import("zod").ZodOptional<import("zod").ZodString>;
                                            PMID: import("zod").ZodOptional<import("zod").ZodString>;
                                            PMCID: import("zod").ZodOptional<import("zod").ZodString>;
                                            arXiv: import("zod").ZodOptional<import("zod").ZodString>;
                                        }, import("zod/v4/core").$strip>;
                                        source: import("zod").ZodEnum<{
                                            arxiv: "arxiv";
                                            crossref: "crossref";
                                            europepmc: "europepmc";
                                            openalex: "openalex";
                                            semanticscholar: "semanticscholar";
                                        }>;
                                        origin: import("zod").ZodEnum<{
                                            arxiv: "arxiv";
                                            "authors-year": "authors-year";
                                            combined: "combined";
                                            doi: "doi";
                                            pmcid: "pmcid";
                                            pmid: "pmid";
                                            title: "title";
                                        }>;
                                        identifiers: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString>>;
                                        retractionEvidence: import("zod").ZodOptional<import("zod").ZodObject<{
                                            source: import("zod").ZodEnum<{
                                                crossref: "crossref";
                                                europepmc: "europepmc";
                                                openalex: "openalex";
                                            }>;
                                            candidateId: import("zod").ZodString;
                                            observedAt: import("zod").ZodString;
                                        }, import("zod/v4/core").$strip>>;
                                    }, import("zod/v4/core").$strip>>;
                                    evidence: import("zod").ZodArray<import("zod").ZodObject<{
                                        reason: import("zod").ZodOptional<import("zod").ZodString>;
                                        status: import("zod").ZodOptional<import("zod").ZodNumber>;
                                        durationMs: import("zod").ZodNumber;
                                        attempts: import("zod").ZodNumber;
                                        observedAt: import("zod").ZodString;
                                        raw: import("zod").ZodOptional<import("zod").ZodUnknown>;
                                        source: import("zod").ZodEnum<{
                                            arxiv: "arxiv";
                                            crossref: "crossref";
                                            "doi.org": "doi.org";
                                            europepmc: "europepmc";
                                            openalex: "openalex";
                                            semanticscholar: "semanticscholar";
                                        }>;
                                        operation: import("zod").ZodEnum<{
                                            arxiv: "arxiv";
                                            "authors-year": "authors-year";
                                            combined: "combined";
                                            doi: "doi";
                                            pmcid: "pmcid";
                                            pmid: "pmid";
                                            title: "title";
                                        }>;
                                        outcome: import("zod").ZodEnum<{
                                            candidate: "candidate";
                                            disabled: "disabled";
                                            exists: "exists";
                                            "no-record": "no-record";
                                            nonexistent: "nonexistent";
                                            skipped: "skipped";
                                            unavailable: "unavailable";
                                            unsupported: "unsupported";
                                        }>;
                                        skippedDuplicates: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString>>;
                                        unusedSlots: import("zod").ZodOptional<import("zod").ZodNumber>;
                                    }, import("zod/v4/core").$strip>>;
                                    reasons: import("zod").ZodArray<import("zod").ZodEnum<{
                                        "ambiguous-identity": "ambiguous-identity";
                                        "development-route-incomplete": "development-route-incomplete";
                                        "doi-nonexistent": "doi-nonexistent";
                                        "fields-differ": "fields-differ";
                                        "foreign-doi": "foreign-doi";
                                        identified: "identified";
                                        "identity-unresolved": "identity-unresolved";
                                        "insufficient-search": "insufficient-search";
                                        "mandatory-resolution-incomplete": "mandatory-resolution-incomplete";
                                        "metadata-unavailable": "metadata-unavailable";
                                        "mixed-components": "mixed-components";
                                        "outside-coverage": "outside-coverage";
                                        "search-completed": "search-completed";
                                        "sources-unavailable": "sources-unavailable";
                                        "url-verification-incomplete": "url-verification-incomplete";
                                    }>>;
                                    failedSources: import("zod").ZodArray<import("zod").ZodEnum<{
                                        arxiv: "arxiv";
                                        crossref: "crossref";
                                        "doi.org": "doi.org";
                                        europepmc: "europepmc";
                                        openalex: "openalex";
                                        semanticscholar: "semanticscholar";
                                    }>>;
                                    retraction: import("zod").ZodEnum<{
                                        retracted: "retracted";
                                        unknown: "unknown";
                                    }>;
                                    retractionEvidence: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodObject<{
                                        source: import("zod").ZodEnum<{
                                            crossref: "crossref";
                                            europepmc: "europepmc";
                                            openalex: "openalex";
                                        }>;
                                        candidateId: import("zod").ZodString;
                                        observedAt: import("zod").ZodString;
                                    }, import("zod/v4/core").$strip>>>;
                                }, import("zod/v4/core").$strict>], "kind">;
                                progress: import("zod").ZodEnum<{
                                    arxiv: "arxiv";
                                    checking: "checking";
                                    crossref: "crossref";
                                    "doi.org": "doi.org";
                                    ended: "ended";
                                    europepmc: "europepmc";
                                    openalex: "openalex";
                                    queued: "queued";
                                    semanticscholar: "semanticscholar";
                                }>;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
    };
} & {
    getRoutingPath(): "/v2/checks/:checkId/cancel";
};
export declare const renewCheckLease: {
    getRoutingPath(): "/v1/checks/:checkId/lease";
    method: "post";
    summary: string;
    request: {
        params: import("zod").ZodObject<{
            checkId: import("zod").ZodUUID;
        }, import("zod/v4/core").$strip>;
    };
    path: "/v2/checks/{checkId}/lease";
    responses: {
        503: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        400: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        401: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        403: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        404: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        200: {
            description: string;
            content: {
                "application/json": {
                    schema: import("zod").ZodObject<{
                        quota: import("zod").ZodUnion<readonly [import("zod").ZodObject<{
                            consumed: import("zod").ZodNumber;
                            remaining: import("zod").ZodNumber;
                        }, import("zod/v4/core").$strip>, import("zod").ZodObject<{
                            status: import("zod").ZodLiteral<"not-implemented">;
                        }, import("zod/v4/core").$strict>, import("zod").ZodNull]>;
                        data: import("zod").ZodObject<{
                            id: import("zod").ZodUUID;
                            state: import("zod").ZodEnum<{
                                ended: "ended";
                                running: "running";
                            }>;
                            lastEventSeq: import("zod").ZodNumber;
                            lastEventCursor: import("zod").ZodString;
                            leaseRenewAfterMs: import("zod").ZodNumber;
                            endReason: import("zod").ZodNullable<import("zod").ZodEnum<{
                                cancelled: "cancelled";
                                completed: "completed";
                                "lease-expired": "lease-expired";
                            }>>;
                            references: import("zod").ZodArray<import("zod").ZodObject<{
                                slot: import("zod").ZodNumber;
                                originalText: import("zod").ZodString;
                                outcome: import("zod").ZodDiscriminatedUnion<[import("zod").ZodObject<{
                                    kind: import("zod").ZodLiteral<"status">;
                                    status: import("zod").ZodEnum<{
                                        cancelled: "cancelled";
                                        failed: "failed";
                                        "not-checked": "not-checked";
                                        running: "running";
                                    }>;
                                }, import("zod/v4/core").$strict>, import("zod").ZodObject<{
                                    kind: import("zod").ZodLiteral<"verdict">;
                                    verdict: import("zod").ZodEnum<{
                                        correct: "correct";
                                        "doi-conflict": "doi-conflict";
                                        "exists-with-deviations": "exists-with-deviations";
                                        "mixed-citation": "mixed-citation";
                                        "not-found": "not-found";
                                        "not-verifiable": "not-verifiable";
                                    }>;
                                    scoringRules: import("zod").ZodObject<{
                                        version: import("zod").ZodString;
                                        calibration: import("zod").ZodLiteral<"uncalibrated">;
                                        unicode: import("zod").ZodString;
                                        icu: import("zod").ZodString;
                                        profile: import("zod").ZodRecord<import("zod").ZodString, import("zod").ZodNumber>;
                                    }, import("zod/v4/core").$strip>;
                                    searchStrategyVersion: import("zod").ZodString;
                                    searchConfiguration: import("zod").ZodRecord<import("zod").ZodString, import("zod").ZodUnion<readonly [import("zod").ZodString, import("zod").ZodNumber]>>;
                                    bestMatchId: import("zod").ZodNullable<import("zod").ZodString>;
                                    reference: import("zod").ZodObject<{
                                        originalText: import("zod").ZodString;
                                        span: import("zod").ZodObject<{
                                            start: import("zod").ZodNumber;
                                            end: import("zod").ZodNumber;
                                        }, import("zod/v4/core").$strip>;
                                        fieldSources: import("zod").ZodRecord<import("zod").ZodString, import("zod").ZodObject<{
                                            raw: import("zod").ZodString;
                                            span: import("zod").ZodOptional<import("zod").ZodObject<{
                                                start: import("zod").ZodNumber;
                                                end: import("zod").ZodNumber;
                                            }, import("zod/v4/core").$strip>>;
                                            normalized: import("zod").ZodOptional<import("zod").ZodString>;
                                        }, import("zod/v4/core").$strip>>;
                                        authorsTruncated: import("zod").ZodOptional<import("zod").ZodBoolean>;
                                        structuring: import("zod").ZodObject<{
                                            path: import("zod").ZodEnum<{
                                                parser: "parser";
                                                user: "user";
                                            }>;
                                            version: import("zod").ZodString;
                                        }, import("zod/v4/core").$strip>;
                                        csl: import("zod").ZodObject<{
                                            type: import("zod").ZodOptional<import("zod").ZodString>;
                                            author: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodObject<{
                                                family: import("zod").ZodOptional<import("zod").ZodString>;
                                                "non-dropping-particle": import("zod").ZodOptional<import("zod").ZodString>;
                                                given: import("zod").ZodOptional<import("zod").ZodString>;
                                                literal: import("zod").ZodOptional<import("zod").ZodString>;
                                            }, import("zod/v4/core").$strip>>>;
                                            issued: import("zod").ZodOptional<import("zod").ZodObject<{
                                                literal: import("zod").ZodString;
                                            }, import("zod/v4/core").$strip>>;
                                            title: import("zod").ZodOptional<import("zod").ZodString>;
                                            "container-title": import("zod").ZodOptional<import("zod").ZodString>;
                                            "container-title-short": import("zod").ZodOptional<import("zod").ZodString>;
                                            publisher: import("zod").ZodOptional<import("zod").ZodString>;
                                            "publisher-place": import("zod").ZodOptional<import("zod").ZodString>;
                                            volume: import("zod").ZodOptional<import("zod").ZodString>;
                                            issue: import("zod").ZodOptional<import("zod").ZodString>;
                                            page: import("zod").ZodOptional<import("zod").ZodString>;
                                            "article-number": import("zod").ZodOptional<import("zod").ZodString>;
                                            edition: import("zod").ZodOptional<import("zod").ZodString>;
                                            DOI: import("zod").ZodOptional<import("zod").ZodString>;
                                            URL: import("zod").ZodOptional<import("zod").ZodString>;
                                            ISBN: import("zod").ZodOptional<import("zod").ZodString>;
                                            ISSN: import("zod").ZodOptional<import("zod").ZodString>;
                                            PMID: import("zod").ZodOptional<import("zod").ZodString>;
                                            PMCID: import("zod").ZodOptional<import("zod").ZodString>;
                                            arXiv: import("zod").ZodOptional<import("zod").ZodString>;
                                        }, import("zod/v4/core").$strip>;
                                    }, import("zod/v4/core").$strip>;
                                    identity: import("zod").ZodObject<{
                                        candidateId: import("zod").ZodOptional<import("zod").ZodString>;
                                        kind: import("zod").ZodEnum<{
                                            "independent-bibliography": "independent-bibliography";
                                            "supplied-doi": "supplied-doi";
                                            "supplied-identifier": "supplied-identifier";
                                            unresolved: "unresolved";
                                        }>;
                                    }, import("zod/v4/core").$strip>;
                                    candidates: import("zod").ZodArray<import("zod").ZodObject<{
                                        id: import("zod").ZodString;
                                        slot: import("zod").ZodNumber;
                                        retrievedAt: import("zod").ZodString;
                                        raw: import("zod").ZodUnknown;
                                        fields: import("zod").ZodArray<import("zod").ZodObject<{
                                            field: import("zod").ZodString;
                                            reference: import("zod").ZodUnknown;
                                            candidate: import("zod").ZodUnknown;
                                            score: import("zod").ZodNullable<import("zod").ZodObject<{
                                                value: import("zod").ZodNumber;
                                                fullAgreement: import("zod").ZodBoolean;
                                            }, import("zod/v4/core").$strip>>;
                                            reason: import("zod").ZodEnum<{
                                                compared: "compared";
                                                "missing-candidate": "missing-candidate";
                                                "missing-reference": "missing-reference";
                                                "not-determinable": "not-determinable";
                                                "resource-limit": "resource-limit";
                                                unweighted: "unweighted";
                                            }>;
                                        }, import("zod/v4/core").$strip>>;
                                        score: import("zod").ZodNullable<import("zod").ZodObject<{
                                            value: import("zod").ZodNumber;
                                            fullAgreement: import("zod").ZodBoolean;
                                        }, import("zod/v4/core").$strip>>;
                                        csl: import("zod").ZodObject<{
                                            type: import("zod").ZodOptional<import("zod").ZodString>;
                                            author: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodObject<{
                                                family: import("zod").ZodOptional<import("zod").ZodString>;
                                                "non-dropping-particle": import("zod").ZodOptional<import("zod").ZodString>;
                                                given: import("zod").ZodOptional<import("zod").ZodString>;
                                                literal: import("zod").ZodOptional<import("zod").ZodString>;
                                            }, import("zod/v4/core").$strip>>>;
                                            issued: import("zod").ZodOptional<import("zod").ZodObject<{
                                                literal: import("zod").ZodString;
                                            }, import("zod/v4/core").$strip>>;
                                            title: import("zod").ZodOptional<import("zod").ZodString>;
                                            "container-title": import("zod").ZodOptional<import("zod").ZodString>;
                                            "container-title-short": import("zod").ZodOptional<import("zod").ZodString>;
                                            publisher: import("zod").ZodOptional<import("zod").ZodString>;
                                            "publisher-place": import("zod").ZodOptional<import("zod").ZodString>;
                                            volume: import("zod").ZodOptional<import("zod").ZodString>;
                                            issue: import("zod").ZodOptional<import("zod").ZodString>;
                                            page: import("zod").ZodOptional<import("zod").ZodString>;
                                            "article-number": import("zod").ZodOptional<import("zod").ZodString>;
                                            edition: import("zod").ZodOptional<import("zod").ZodString>;
                                            DOI: import("zod").ZodOptional<import("zod").ZodString>;
                                            URL: import("zod").ZodOptional<import("zod").ZodString>;
                                            ISBN: import("zod").ZodOptional<import("zod").ZodString>;
                                            ISSN: import("zod").ZodOptional<import("zod").ZodString>;
                                            PMID: import("zod").ZodOptional<import("zod").ZodString>;
                                            PMCID: import("zod").ZodOptional<import("zod").ZodString>;
                                            arXiv: import("zod").ZodOptional<import("zod").ZodString>;
                                        }, import("zod/v4/core").$strip>;
                                        source: import("zod").ZodEnum<{
                                            arxiv: "arxiv";
                                            crossref: "crossref";
                                            europepmc: "europepmc";
                                            openalex: "openalex";
                                            semanticscholar: "semanticscholar";
                                        }>;
                                        origin: import("zod").ZodEnum<{
                                            arxiv: "arxiv";
                                            "authors-year": "authors-year";
                                            combined: "combined";
                                            doi: "doi";
                                            pmcid: "pmcid";
                                            pmid: "pmid";
                                            title: "title";
                                        }>;
                                        identifiers: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString>>;
                                        retractionEvidence: import("zod").ZodOptional<import("zod").ZodObject<{
                                            source: import("zod").ZodEnum<{
                                                crossref: "crossref";
                                                europepmc: "europepmc";
                                                openalex: "openalex";
                                            }>;
                                            candidateId: import("zod").ZodString;
                                            observedAt: import("zod").ZodString;
                                        }, import("zod/v4/core").$strip>>;
                                    }, import("zod/v4/core").$strip>>;
                                    evidence: import("zod").ZodArray<import("zod").ZodObject<{
                                        reason: import("zod").ZodOptional<import("zod").ZodString>;
                                        status: import("zod").ZodOptional<import("zod").ZodNumber>;
                                        durationMs: import("zod").ZodNumber;
                                        attempts: import("zod").ZodNumber;
                                        observedAt: import("zod").ZodString;
                                        raw: import("zod").ZodOptional<import("zod").ZodUnknown>;
                                        source: import("zod").ZodEnum<{
                                            arxiv: "arxiv";
                                            crossref: "crossref";
                                            "doi.org": "doi.org";
                                            europepmc: "europepmc";
                                            openalex: "openalex";
                                            semanticscholar: "semanticscholar";
                                        }>;
                                        operation: import("zod").ZodEnum<{
                                            arxiv: "arxiv";
                                            "authors-year": "authors-year";
                                            combined: "combined";
                                            doi: "doi";
                                            pmcid: "pmcid";
                                            pmid: "pmid";
                                            title: "title";
                                        }>;
                                        outcome: import("zod").ZodEnum<{
                                            candidate: "candidate";
                                            disabled: "disabled";
                                            exists: "exists";
                                            "no-record": "no-record";
                                            nonexistent: "nonexistent";
                                            skipped: "skipped";
                                            unavailable: "unavailable";
                                            unsupported: "unsupported";
                                        }>;
                                        skippedDuplicates: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString>>;
                                        unusedSlots: import("zod").ZodOptional<import("zod").ZodNumber>;
                                    }, import("zod/v4/core").$strip>>;
                                    reasons: import("zod").ZodArray<import("zod").ZodEnum<{
                                        "ambiguous-identity": "ambiguous-identity";
                                        "development-route-incomplete": "development-route-incomplete";
                                        "doi-nonexistent": "doi-nonexistent";
                                        "fields-differ": "fields-differ";
                                        "foreign-doi": "foreign-doi";
                                        identified: "identified";
                                        "identity-unresolved": "identity-unresolved";
                                        "insufficient-search": "insufficient-search";
                                        "mandatory-resolution-incomplete": "mandatory-resolution-incomplete";
                                        "metadata-unavailable": "metadata-unavailable";
                                        "mixed-components": "mixed-components";
                                        "outside-coverage": "outside-coverage";
                                        "search-completed": "search-completed";
                                        "sources-unavailable": "sources-unavailable";
                                        "url-verification-incomplete": "url-verification-incomplete";
                                    }>>;
                                    failedSources: import("zod").ZodArray<import("zod").ZodEnum<{
                                        arxiv: "arxiv";
                                        crossref: "crossref";
                                        "doi.org": "doi.org";
                                        europepmc: "europepmc";
                                        openalex: "openalex";
                                        semanticscholar: "semanticscholar";
                                    }>>;
                                    retraction: import("zod").ZodEnum<{
                                        retracted: "retracted";
                                        unknown: "unknown";
                                    }>;
                                    retractionEvidence: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodObject<{
                                        source: import("zod").ZodEnum<{
                                            crossref: "crossref";
                                            europepmc: "europepmc";
                                            openalex: "openalex";
                                        }>;
                                        candidateId: import("zod").ZodString;
                                        observedAt: import("zod").ZodString;
                                    }, import("zod/v4/core").$strip>>>;
                                }, import("zod/v4/core").$strict>], "kind">;
                                progress: import("zod").ZodEnum<{
                                    arxiv: "arxiv";
                                    checking: "checking";
                                    crossref: "crossref";
                                    "doi.org": "doi.org";
                                    ended: "ended";
                                    europepmc: "europepmc";
                                    openalex: "openalex";
                                    queued: "queued";
                                    semanticscholar: "semanticscholar";
                                }>;
                            }, import("zod/v4/core").$strip>>;
                        }, import("zod/v4/core").$strip>;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
    };
} & {
    getRoutingPath(): "/v2/checks/:checkId/lease";
};
export declare const streamCheckEvents: {
    getRoutingPath(): "/v1/checks/:checkId/events";
    method: "get";
    summary: string;
    description: string;
    request: {
        params: import("zod").ZodObject<{
            checkId: import("zod").ZodUUID;
        }, import("zod/v4/core").$strip>;
        headers: import("zod").ZodObject<{
            "last-event-id": import("zod").ZodOptional<import("zod").ZodString>;
        }, import("zod/v4/core").$strip>;
    };
    responses: {
        401: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        403: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        503: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        200: {
            description: string;
            content: {
                "text/event-stream": {
                    schema: import("zod").ZodString;
                };
            };
        };
        400: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
        404: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: import("zod").ZodObject<{
                        type: import("zod").ZodString;
                        title: import("zod").ZodString;
                        status: import("zod").ZodNumber;
                        detail: import("zod").ZodOptional<import("zod").ZodString>;
                        limit: import("zod").ZodOptional<import("zod").ZodNumber>;
                        code: import("zod").ZodString;
                        i18nKey: import("zod").ZodString;
                    }, import("zod/v4/core").$strip>;
                };
            };
        };
    };
    path: "/v2/checks/{checkId}/events";
} & {
    getRoutingPath(): "/v2/checks/:checkId/events";
};
