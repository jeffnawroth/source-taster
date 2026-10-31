import { z } from "zod";
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
                    schema: z.ZodUnion<readonly [z.ZodObject<{
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
                                arXiv: z.ZodOptional<z.ZodString>;
                            }, z.core.$strip>;
                            authorsTruncated: z.ZodOptional<z.ZodBoolean>;
                        }, z.core.$strip>>;
                    }, z.core.$strip>]>;
                };
            };
        };
    };
    responses: {
        401: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: z.ZodObject<{
                        type: z.ZodString;
                        title: z.ZodString;
                        status: z.ZodNumber;
                        detail: z.ZodOptional<z.ZodString>;
                        limit: z.ZodOptional<z.ZodNumber>;
                        code: z.ZodString;
                        i18nKey: z.ZodString;
                    }, z.core.$strip>;
                };
            };
        };
        403: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: z.ZodObject<{
                        type: z.ZodString;
                        title: z.ZodString;
                        status: z.ZodNumber;
                        detail: z.ZodOptional<z.ZodString>;
                        limit: z.ZodOptional<z.ZodNumber>;
                        code: z.ZodString;
                        i18nKey: z.ZodString;
                    }, z.core.$strip>;
                };
            };
        };
        503: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: z.ZodObject<{
                        type: z.ZodString;
                        title: z.ZodString;
                        status: z.ZodNumber;
                        detail: z.ZodOptional<z.ZodString>;
                        limit: z.ZodOptional<z.ZodNumber>;
                        code: z.ZodString;
                        i18nKey: z.ZodString;
                    }, z.core.$strip>;
                };
            };
        };
        400: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: z.ZodObject<{
                        type: z.ZodString;
                        title: z.ZodString;
                        status: z.ZodNumber;
                        detail: z.ZodOptional<z.ZodString>;
                        limit: z.ZodOptional<z.ZodNumber>;
                        code: z.ZodString;
                        i18nKey: z.ZodString;
                    }, z.core.$strip>;
                };
            };
        };
        201: {
            description: string;
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        quota: z.ZodUnion<readonly [z.ZodObject<{
                            consumed: z.ZodNumber;
                            remaining: z.ZodNumber;
                        }, z.core.$strip>, z.ZodObject<{
                            status: z.ZodLiteral<"not-implemented">;
                        }, z.core.$strict>, z.ZodNull]>;
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
                                revision: z.ZodNumber;
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
                                    arXiv: z.ZodOptional<z.ZodString>;
                                }, z.core.$strip>;
                                authorsTruncated: z.ZodOptional<z.ZodBoolean>;
                                revisions: z.ZodArray<z.ZodObject<{
                                    revision: z.ZodNumber;
                                    reference: z.ZodObject<{
                                        originalText: z.ZodString;
                                        span: z.ZodObject<{
                                            start: z.ZodNumber;
                                            end: z.ZodNumber;
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
                                    }, z.core.$strip>;
                                    provenance: z.ZodEnum<{
                                        parser: "parser";
                                        user: "user";
                                    }>;
                                    createdAt: z.ZodString;
                                }, z.core.$strip>>;
                                results: z.ZodArray<z.ZodObject<{
                                    id: z.ZodUUID;
                                    revision: z.ZodNumber;
                                    generation: z.ZodNumber;
                                    createdAt: z.ZodString;
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
                                        scoringRules: z.ZodObject<{
                                            version: z.ZodString;
                                            calibration: z.ZodLiteral<"uncalibrated">;
                                            unicode: z.ZodString;
                                            icu: z.ZodString;
                                            profile: z.ZodRecord<z.ZodString, z.ZodNumber>;
                                        }, z.core.$strip>;
                                        searchStrategyVersion: z.ZodString;
                                        searchConfiguration: z.ZodRecord<z.ZodString, z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
                                        bestMatchId: z.ZodNullable<z.ZodString>;
                                        reference: z.ZodObject<{
                                            originalText: z.ZodString;
                                            span: z.ZodObject<{
                                                start: z.ZodNumber;
                                                end: z.ZodNumber;
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
                                        }, z.core.$strip>;
                                        identity: z.ZodObject<{
                                            candidateId: z.ZodOptional<z.ZodString>;
                                            kind: z.ZodEnum<{
                                                "independent-bibliography": "independent-bibliography";
                                                "supplied-doi": "supplied-doi";
                                                "supplied-identifier": "supplied-identifier";
                                                unresolved: "unresolved";
                                            }>;
                                        }, z.core.$strip>;
                                        candidates: z.ZodArray<z.ZodObject<{
                                            id: z.ZodString;
                                            slot: z.ZodNumber;
                                            retrievedAt: z.ZodString;
                                            raw: z.ZodUnknown;
                                            score: z.ZodNullable<z.ZodObject<{
                                                value: z.ZodNumber;
                                                fullAgreement: z.ZodBoolean;
                                            }, z.core.$strip>>;
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
                                                agreement: z.ZodOptional<z.ZodBoolean>;
                                                journalAbbreviation: z.ZodOptional<z.ZodObject<{
                                                    outcome: z.ZodEnum<{
                                                        different: "different";
                                                        match: "match";
                                                        "not-determinable": "not-determinable";
                                                    }>;
                                                    reason: z.ZodEnum<{
                                                        "attested-match": "attested-match";
                                                        "attested-other-journal": "attested-other-journal";
                                                        "no-attestation": "no-attestation";
                                                    }>;
                                                    attestations: z.ZodArray<z.ZodObject<{
                                                        source: z.ZodEnum<{
                                                            crossref: "crossref";
                                                            europepmc: "europepmc";
                                                            nlm: "nlm";
                                                            semanticscholar: "semanticscholar";
                                                        }>;
                                                        role: z.ZodEnum<{
                                                            candidate: "candidate";
                                                            reference: "reference";
                                                        }>;
                                                        journalTitle: z.ZodString;
                                                        abbreviation: z.ZodString;
                                                        nlmId: z.ZodOptional<z.ZodString>;
                                                        snapshotDate: z.ZodOptional<z.ZodString>;
                                                    }, z.core.$strip>>;
                                                }, z.core.$strip>>;
                                            }, z.core.$strip>>;
                                            source: z.ZodEnum<{
                                                arxiv: "arxiv";
                                                crossref: "crossref";
                                                europepmc: "europepmc";
                                                googlebooks: "googlebooks";
                                                openalex: "openalex";
                                                openlibrary: "openlibrary";
                                                semanticscholar: "semanticscholar";
                                            }>;
                                            origin: z.ZodEnum<{
                                                arxiv: "arxiv";
                                                "authors-year": "authors-year";
                                                combined: "combined";
                                                doi: "doi";
                                                isbn: "isbn";
                                                pmcid: "pmcid";
                                                pmid: "pmid";
                                                title: "title";
                                            }>;
                                            identifiers: z.ZodOptional<z.ZodArray<z.ZodString>>;
                                            identityAmbiguous: z.ZodOptional<z.ZodBoolean>;
                                            retractionEvidence: z.ZodOptional<z.ZodObject<{
                                                source: z.ZodEnum<{
                                                    crossref: "crossref";
                                                    europepmc: "europepmc";
                                                    openalex: "openalex";
                                                }>;
                                                candidateId: z.ZodString;
                                                observedAt: z.ZodString;
                                            }, z.core.$strip>>;
                                        }, z.core.$strip>>;
                                        evidence: z.ZodArray<z.ZodObject<{
                                            reason: z.ZodOptional<z.ZodString>;
                                            status: z.ZodOptional<z.ZodNumber>;
                                            durationMs: z.ZodNumber;
                                            attempts: z.ZodNumber;
                                            observedAt: z.ZodString;
                                            raw: z.ZodOptional<z.ZodUnknown>;
                                            source: z.ZodEnum<{
                                                arxiv: "arxiv";
                                                crossref: "crossref";
                                                "doi.org": "doi.org";
                                                europepmc: "europepmc";
                                                googlebooks: "googlebooks";
                                                openalex: "openalex";
                                                openlibrary: "openlibrary";
                                                semanticscholar: "semanticscholar";
                                            }>;
                                            operation: z.ZodEnum<{
                                                arxiv: "arxiv";
                                                "authors-year": "authors-year";
                                                combined: "combined";
                                                doi: "doi";
                                                isbn: "isbn";
                                                pmcid: "pmcid";
                                                pmid: "pmid";
                                                title: "title";
                                            }>;
                                            outcome: z.ZodEnum<{
                                                candidate: "candidate";
                                                disabled: "disabled";
                                                exists: "exists";
                                                "no-record": "no-record";
                                                nonexistent: "nonexistent";
                                                skipped: "skipped";
                                                unavailable: "unavailable";
                                                unsupported: "unsupported";
                                            }>;
                                            skippedDuplicates: z.ZodOptional<z.ZodArray<z.ZodString>>;
                                            unusedSlots: z.ZodOptional<z.ZodNumber>;
                                            identifierAmbiguity: z.ZodOptional<z.ZodArray<z.ZodString>>;
                                        }, z.core.$strip>>;
                                        reasons: z.ZodArray<z.ZodEnum<{
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
                                        failedSources: z.ZodArray<z.ZodEnum<{
                                            arxiv: "arxiv";
                                            crossref: "crossref";
                                            "doi.org": "doi.org";
                                            europepmc: "europepmc";
                                            googlebooks: "googlebooks";
                                            openalex: "openalex";
                                            openlibrary: "openlibrary";
                                            semanticscholar: "semanticscholar";
                                        }>>;
                                        retraction: z.ZodEnum<{
                                            retracted: "retracted";
                                            unknown: "unknown";
                                        }>;
                                        retractionEvidence: z.ZodOptional<z.ZodArray<z.ZodObject<{
                                            source: z.ZodEnum<{
                                                crossref: "crossref";
                                                europepmc: "europepmc";
                                                openalex: "openalex";
                                            }>;
                                            candidateId: z.ZodString;
                                            observedAt: z.ZodString;
                                        }, z.core.$strip>>>;
                                    }, z.core.$strict>], "kind">;
                                    manualOverride: z.ZodNullable<z.ZodObject<{
                                        id: z.ZodUUID;
                                        resultId: z.ZodUUID;
                                        verdict: z.ZodEnum<{
                                            correct: "correct";
                                            "doi-conflict": "doi-conflict";
                                            "exists-with-deviations": "exists-with-deviations";
                                            "mixed-citation": "mixed-citation";
                                            "not-found": "not-found";
                                            "not-verifiable": "not-verifiable";
                                        }>;
                                        createdAt: z.ZodString;
                                    }, z.core.$strip>>;
                                }, z.core.$strip>>;
                                manualOverride: z.ZodNullable<z.ZodObject<{
                                    id: z.ZodUUID;
                                    resultId: z.ZodUUID;
                                    verdict: z.ZodEnum<{
                                        correct: "correct";
                                        "doi-conflict": "doi-conflict";
                                        "exists-with-deviations": "exists-with-deviations";
                                        "mixed-citation": "mixed-citation";
                                        "not-found": "not-found";
                                        "not-verifiable": "not-verifiable";
                                    }>;
                                    createdAt: z.ZodString;
                                }, z.core.$strip>>;
                                manualOverrideReset: z.ZodBoolean;
                                quotaEffect: z.ZodEnum<{
                                    "free-recheck": "free-recheck";
                                    "new-work": "new-work";
                                }>;
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
                                    scoringRules: z.ZodObject<{
                                        version: z.ZodString;
                                        calibration: z.ZodLiteral<"uncalibrated">;
                                        unicode: z.ZodString;
                                        icu: z.ZodString;
                                        profile: z.ZodRecord<z.ZodString, z.ZodNumber>;
                                    }, z.core.$strip>;
                                    searchStrategyVersion: z.ZodString;
                                    searchConfiguration: z.ZodRecord<z.ZodString, z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
                                    bestMatchId: z.ZodNullable<z.ZodString>;
                                    reference: z.ZodObject<{
                                        originalText: z.ZodString;
                                        span: z.ZodObject<{
                                            start: z.ZodNumber;
                                            end: z.ZodNumber;
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
                                    }, z.core.$strip>;
                                    identity: z.ZodObject<{
                                        candidateId: z.ZodOptional<z.ZodString>;
                                        kind: z.ZodEnum<{
                                            "independent-bibliography": "independent-bibliography";
                                            "supplied-doi": "supplied-doi";
                                            "supplied-identifier": "supplied-identifier";
                                            unresolved: "unresolved";
                                        }>;
                                    }, z.core.$strip>;
                                    candidates: z.ZodArray<z.ZodObject<{
                                        id: z.ZodString;
                                        slot: z.ZodNumber;
                                        retrievedAt: z.ZodString;
                                        raw: z.ZodUnknown;
                                        score: z.ZodNullable<z.ZodObject<{
                                            value: z.ZodNumber;
                                            fullAgreement: z.ZodBoolean;
                                        }, z.core.$strip>>;
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
                                            agreement: z.ZodOptional<z.ZodBoolean>;
                                            journalAbbreviation: z.ZodOptional<z.ZodObject<{
                                                outcome: z.ZodEnum<{
                                                    different: "different";
                                                    match: "match";
                                                    "not-determinable": "not-determinable";
                                                }>;
                                                reason: z.ZodEnum<{
                                                    "attested-match": "attested-match";
                                                    "attested-other-journal": "attested-other-journal";
                                                    "no-attestation": "no-attestation";
                                                }>;
                                                attestations: z.ZodArray<z.ZodObject<{
                                                    source: z.ZodEnum<{
                                                        crossref: "crossref";
                                                        europepmc: "europepmc";
                                                        nlm: "nlm";
                                                        semanticscholar: "semanticscholar";
                                                    }>;
                                                    role: z.ZodEnum<{
                                                        candidate: "candidate";
                                                        reference: "reference";
                                                    }>;
                                                    journalTitle: z.ZodString;
                                                    abbreviation: z.ZodString;
                                                    nlmId: z.ZodOptional<z.ZodString>;
                                                    snapshotDate: z.ZodOptional<z.ZodString>;
                                                }, z.core.$strip>>;
                                            }, z.core.$strip>>;
                                        }, z.core.$strip>>;
                                        source: z.ZodEnum<{
                                            arxiv: "arxiv";
                                            crossref: "crossref";
                                            europepmc: "europepmc";
                                            googlebooks: "googlebooks";
                                            openalex: "openalex";
                                            openlibrary: "openlibrary";
                                            semanticscholar: "semanticscholar";
                                        }>;
                                        origin: z.ZodEnum<{
                                            arxiv: "arxiv";
                                            "authors-year": "authors-year";
                                            combined: "combined";
                                            doi: "doi";
                                            isbn: "isbn";
                                            pmcid: "pmcid";
                                            pmid: "pmid";
                                            title: "title";
                                        }>;
                                        identifiers: z.ZodOptional<z.ZodArray<z.ZodString>>;
                                        identityAmbiguous: z.ZodOptional<z.ZodBoolean>;
                                        retractionEvidence: z.ZodOptional<z.ZodObject<{
                                            source: z.ZodEnum<{
                                                crossref: "crossref";
                                                europepmc: "europepmc";
                                                openalex: "openalex";
                                            }>;
                                            candidateId: z.ZodString;
                                            observedAt: z.ZodString;
                                        }, z.core.$strip>>;
                                    }, z.core.$strip>>;
                                    evidence: z.ZodArray<z.ZodObject<{
                                        reason: z.ZodOptional<z.ZodString>;
                                        status: z.ZodOptional<z.ZodNumber>;
                                        durationMs: z.ZodNumber;
                                        attempts: z.ZodNumber;
                                        observedAt: z.ZodString;
                                        raw: z.ZodOptional<z.ZodUnknown>;
                                        source: z.ZodEnum<{
                                            arxiv: "arxiv";
                                            crossref: "crossref";
                                            "doi.org": "doi.org";
                                            europepmc: "europepmc";
                                            googlebooks: "googlebooks";
                                            openalex: "openalex";
                                            openlibrary: "openlibrary";
                                            semanticscholar: "semanticscholar";
                                        }>;
                                        operation: z.ZodEnum<{
                                            arxiv: "arxiv";
                                            "authors-year": "authors-year";
                                            combined: "combined";
                                            doi: "doi";
                                            isbn: "isbn";
                                            pmcid: "pmcid";
                                            pmid: "pmid";
                                            title: "title";
                                        }>;
                                        outcome: z.ZodEnum<{
                                            candidate: "candidate";
                                            disabled: "disabled";
                                            exists: "exists";
                                            "no-record": "no-record";
                                            nonexistent: "nonexistent";
                                            skipped: "skipped";
                                            unavailable: "unavailable";
                                            unsupported: "unsupported";
                                        }>;
                                        skippedDuplicates: z.ZodOptional<z.ZodArray<z.ZodString>>;
                                        unusedSlots: z.ZodOptional<z.ZodNumber>;
                                        identifierAmbiguity: z.ZodOptional<z.ZodArray<z.ZodString>>;
                                    }, z.core.$strip>>;
                                    reasons: z.ZodArray<z.ZodEnum<{
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
                                    failedSources: z.ZodArray<z.ZodEnum<{
                                        arxiv: "arxiv";
                                        crossref: "crossref";
                                        "doi.org": "doi.org";
                                        europepmc: "europepmc";
                                        googlebooks: "googlebooks";
                                        openalex: "openalex";
                                        openlibrary: "openlibrary";
                                        semanticscholar: "semanticscholar";
                                    }>>;
                                    retraction: z.ZodEnum<{
                                        retracted: "retracted";
                                        unknown: "unknown";
                                    }>;
                                    retractionEvidence: z.ZodOptional<z.ZodArray<z.ZodObject<{
                                        source: z.ZodEnum<{
                                            crossref: "crossref";
                                            europepmc: "europepmc";
                                            openalex: "openalex";
                                        }>;
                                        candidateId: z.ZodString;
                                        observedAt: z.ZodString;
                                    }, z.core.$strip>>>;
                                }, z.core.$strict>], "kind">;
                                progress: z.ZodEnum<{
                                    arxiv: "arxiv";
                                    checking: "checking";
                                    crossref: "crossref";
                                    "doi.org": "doi.org";
                                    ended: "ended";
                                    europepmc: "europepmc";
                                    googlebooks: "googlebooks";
                                    openalex: "openalex";
                                    openlibrary: "openlibrary";
                                    queued: "queued";
                                    semanticscholar: "semanticscholar";
                                }>;
                            }, z.core.$strip>>;
                        }, z.core.$strip>;
                    }, z.core.$strip>;
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
        params: z.ZodObject<{
            checkId: z.ZodUUID;
        }, z.core.$strip>;
    };
    path: "/v2/checks/{checkId}";
    responses: {
        401: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: z.ZodObject<{
                        type: z.ZodString;
                        title: z.ZodString;
                        status: z.ZodNumber;
                        detail: z.ZodOptional<z.ZodString>;
                        limit: z.ZodOptional<z.ZodNumber>;
                        code: z.ZodString;
                        i18nKey: z.ZodString;
                    }, z.core.$strip>;
                };
            };
        };
        403: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: z.ZodObject<{
                        type: z.ZodString;
                        title: z.ZodString;
                        status: z.ZodNumber;
                        detail: z.ZodOptional<z.ZodString>;
                        limit: z.ZodOptional<z.ZodNumber>;
                        code: z.ZodString;
                        i18nKey: z.ZodString;
                    }, z.core.$strip>;
                };
            };
        };
        503: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: z.ZodObject<{
                        type: z.ZodString;
                        title: z.ZodString;
                        status: z.ZodNumber;
                        detail: z.ZodOptional<z.ZodString>;
                        limit: z.ZodOptional<z.ZodNumber>;
                        code: z.ZodString;
                        i18nKey: z.ZodString;
                    }, z.core.$strip>;
                };
            };
        };
        400: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: z.ZodObject<{
                        type: z.ZodString;
                        title: z.ZodString;
                        status: z.ZodNumber;
                        detail: z.ZodOptional<z.ZodString>;
                        limit: z.ZodOptional<z.ZodNumber>;
                        code: z.ZodString;
                        i18nKey: z.ZodString;
                    }, z.core.$strip>;
                };
            };
        };
        404: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: z.ZodObject<{
                        type: z.ZodString;
                        title: z.ZodString;
                        status: z.ZodNumber;
                        detail: z.ZodOptional<z.ZodString>;
                        limit: z.ZodOptional<z.ZodNumber>;
                        code: z.ZodString;
                        i18nKey: z.ZodString;
                    }, z.core.$strip>;
                };
            };
        };
        410: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: z.ZodObject<{
                        type: z.ZodString;
                        title: z.ZodString;
                        status: z.ZodNumber;
                        detail: z.ZodOptional<z.ZodString>;
                        limit: z.ZodOptional<z.ZodNumber>;
                        code: z.ZodString;
                        i18nKey: z.ZodString;
                    }, z.core.$strip>;
                };
            };
        };
        200: {
            description: string;
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        quota: z.ZodUnion<readonly [z.ZodObject<{
                            consumed: z.ZodNumber;
                            remaining: z.ZodNumber;
                        }, z.core.$strip>, z.ZodObject<{
                            status: z.ZodLiteral<"not-implemented">;
                        }, z.core.$strict>, z.ZodNull]>;
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
                                revision: z.ZodNumber;
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
                                    arXiv: z.ZodOptional<z.ZodString>;
                                }, z.core.$strip>;
                                authorsTruncated: z.ZodOptional<z.ZodBoolean>;
                                revisions: z.ZodArray<z.ZodObject<{
                                    revision: z.ZodNumber;
                                    reference: z.ZodObject<{
                                        originalText: z.ZodString;
                                        span: z.ZodObject<{
                                            start: z.ZodNumber;
                                            end: z.ZodNumber;
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
                                    }, z.core.$strip>;
                                    provenance: z.ZodEnum<{
                                        parser: "parser";
                                        user: "user";
                                    }>;
                                    createdAt: z.ZodString;
                                }, z.core.$strip>>;
                                results: z.ZodArray<z.ZodObject<{
                                    id: z.ZodUUID;
                                    revision: z.ZodNumber;
                                    generation: z.ZodNumber;
                                    createdAt: z.ZodString;
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
                                        scoringRules: z.ZodObject<{
                                            version: z.ZodString;
                                            calibration: z.ZodLiteral<"uncalibrated">;
                                            unicode: z.ZodString;
                                            icu: z.ZodString;
                                            profile: z.ZodRecord<z.ZodString, z.ZodNumber>;
                                        }, z.core.$strip>;
                                        searchStrategyVersion: z.ZodString;
                                        searchConfiguration: z.ZodRecord<z.ZodString, z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
                                        bestMatchId: z.ZodNullable<z.ZodString>;
                                        reference: z.ZodObject<{
                                            originalText: z.ZodString;
                                            span: z.ZodObject<{
                                                start: z.ZodNumber;
                                                end: z.ZodNumber;
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
                                        }, z.core.$strip>;
                                        identity: z.ZodObject<{
                                            candidateId: z.ZodOptional<z.ZodString>;
                                            kind: z.ZodEnum<{
                                                "independent-bibliography": "independent-bibliography";
                                                "supplied-doi": "supplied-doi";
                                                "supplied-identifier": "supplied-identifier";
                                                unresolved: "unresolved";
                                            }>;
                                        }, z.core.$strip>;
                                        candidates: z.ZodArray<z.ZodObject<{
                                            id: z.ZodString;
                                            slot: z.ZodNumber;
                                            retrievedAt: z.ZodString;
                                            raw: z.ZodUnknown;
                                            score: z.ZodNullable<z.ZodObject<{
                                                value: z.ZodNumber;
                                                fullAgreement: z.ZodBoolean;
                                            }, z.core.$strip>>;
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
                                                agreement: z.ZodOptional<z.ZodBoolean>;
                                                journalAbbreviation: z.ZodOptional<z.ZodObject<{
                                                    outcome: z.ZodEnum<{
                                                        different: "different";
                                                        match: "match";
                                                        "not-determinable": "not-determinable";
                                                    }>;
                                                    reason: z.ZodEnum<{
                                                        "attested-match": "attested-match";
                                                        "attested-other-journal": "attested-other-journal";
                                                        "no-attestation": "no-attestation";
                                                    }>;
                                                    attestations: z.ZodArray<z.ZodObject<{
                                                        source: z.ZodEnum<{
                                                            crossref: "crossref";
                                                            europepmc: "europepmc";
                                                            nlm: "nlm";
                                                            semanticscholar: "semanticscholar";
                                                        }>;
                                                        role: z.ZodEnum<{
                                                            candidate: "candidate";
                                                            reference: "reference";
                                                        }>;
                                                        journalTitle: z.ZodString;
                                                        abbreviation: z.ZodString;
                                                        nlmId: z.ZodOptional<z.ZodString>;
                                                        snapshotDate: z.ZodOptional<z.ZodString>;
                                                    }, z.core.$strip>>;
                                                }, z.core.$strip>>;
                                            }, z.core.$strip>>;
                                            source: z.ZodEnum<{
                                                arxiv: "arxiv";
                                                crossref: "crossref";
                                                europepmc: "europepmc";
                                                googlebooks: "googlebooks";
                                                openalex: "openalex";
                                                openlibrary: "openlibrary";
                                                semanticscholar: "semanticscholar";
                                            }>;
                                            origin: z.ZodEnum<{
                                                arxiv: "arxiv";
                                                "authors-year": "authors-year";
                                                combined: "combined";
                                                doi: "doi";
                                                isbn: "isbn";
                                                pmcid: "pmcid";
                                                pmid: "pmid";
                                                title: "title";
                                            }>;
                                            identifiers: z.ZodOptional<z.ZodArray<z.ZodString>>;
                                            identityAmbiguous: z.ZodOptional<z.ZodBoolean>;
                                            retractionEvidence: z.ZodOptional<z.ZodObject<{
                                                source: z.ZodEnum<{
                                                    crossref: "crossref";
                                                    europepmc: "europepmc";
                                                    openalex: "openalex";
                                                }>;
                                                candidateId: z.ZodString;
                                                observedAt: z.ZodString;
                                            }, z.core.$strip>>;
                                        }, z.core.$strip>>;
                                        evidence: z.ZodArray<z.ZodObject<{
                                            reason: z.ZodOptional<z.ZodString>;
                                            status: z.ZodOptional<z.ZodNumber>;
                                            durationMs: z.ZodNumber;
                                            attempts: z.ZodNumber;
                                            observedAt: z.ZodString;
                                            raw: z.ZodOptional<z.ZodUnknown>;
                                            source: z.ZodEnum<{
                                                arxiv: "arxiv";
                                                crossref: "crossref";
                                                "doi.org": "doi.org";
                                                europepmc: "europepmc";
                                                googlebooks: "googlebooks";
                                                openalex: "openalex";
                                                openlibrary: "openlibrary";
                                                semanticscholar: "semanticscholar";
                                            }>;
                                            operation: z.ZodEnum<{
                                                arxiv: "arxiv";
                                                "authors-year": "authors-year";
                                                combined: "combined";
                                                doi: "doi";
                                                isbn: "isbn";
                                                pmcid: "pmcid";
                                                pmid: "pmid";
                                                title: "title";
                                            }>;
                                            outcome: z.ZodEnum<{
                                                candidate: "candidate";
                                                disabled: "disabled";
                                                exists: "exists";
                                                "no-record": "no-record";
                                                nonexistent: "nonexistent";
                                                skipped: "skipped";
                                                unavailable: "unavailable";
                                                unsupported: "unsupported";
                                            }>;
                                            skippedDuplicates: z.ZodOptional<z.ZodArray<z.ZodString>>;
                                            unusedSlots: z.ZodOptional<z.ZodNumber>;
                                            identifierAmbiguity: z.ZodOptional<z.ZodArray<z.ZodString>>;
                                        }, z.core.$strip>>;
                                        reasons: z.ZodArray<z.ZodEnum<{
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
                                        failedSources: z.ZodArray<z.ZodEnum<{
                                            arxiv: "arxiv";
                                            crossref: "crossref";
                                            "doi.org": "doi.org";
                                            europepmc: "europepmc";
                                            googlebooks: "googlebooks";
                                            openalex: "openalex";
                                            openlibrary: "openlibrary";
                                            semanticscholar: "semanticscholar";
                                        }>>;
                                        retraction: z.ZodEnum<{
                                            retracted: "retracted";
                                            unknown: "unknown";
                                        }>;
                                        retractionEvidence: z.ZodOptional<z.ZodArray<z.ZodObject<{
                                            source: z.ZodEnum<{
                                                crossref: "crossref";
                                                europepmc: "europepmc";
                                                openalex: "openalex";
                                            }>;
                                            candidateId: z.ZodString;
                                            observedAt: z.ZodString;
                                        }, z.core.$strip>>>;
                                    }, z.core.$strict>], "kind">;
                                    manualOverride: z.ZodNullable<z.ZodObject<{
                                        id: z.ZodUUID;
                                        resultId: z.ZodUUID;
                                        verdict: z.ZodEnum<{
                                            correct: "correct";
                                            "doi-conflict": "doi-conflict";
                                            "exists-with-deviations": "exists-with-deviations";
                                            "mixed-citation": "mixed-citation";
                                            "not-found": "not-found";
                                            "not-verifiable": "not-verifiable";
                                        }>;
                                        createdAt: z.ZodString;
                                    }, z.core.$strip>>;
                                }, z.core.$strip>>;
                                manualOverride: z.ZodNullable<z.ZodObject<{
                                    id: z.ZodUUID;
                                    resultId: z.ZodUUID;
                                    verdict: z.ZodEnum<{
                                        correct: "correct";
                                        "doi-conflict": "doi-conflict";
                                        "exists-with-deviations": "exists-with-deviations";
                                        "mixed-citation": "mixed-citation";
                                        "not-found": "not-found";
                                        "not-verifiable": "not-verifiable";
                                    }>;
                                    createdAt: z.ZodString;
                                }, z.core.$strip>>;
                                manualOverrideReset: z.ZodBoolean;
                                quotaEffect: z.ZodEnum<{
                                    "free-recheck": "free-recheck";
                                    "new-work": "new-work";
                                }>;
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
                                    scoringRules: z.ZodObject<{
                                        version: z.ZodString;
                                        calibration: z.ZodLiteral<"uncalibrated">;
                                        unicode: z.ZodString;
                                        icu: z.ZodString;
                                        profile: z.ZodRecord<z.ZodString, z.ZodNumber>;
                                    }, z.core.$strip>;
                                    searchStrategyVersion: z.ZodString;
                                    searchConfiguration: z.ZodRecord<z.ZodString, z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
                                    bestMatchId: z.ZodNullable<z.ZodString>;
                                    reference: z.ZodObject<{
                                        originalText: z.ZodString;
                                        span: z.ZodObject<{
                                            start: z.ZodNumber;
                                            end: z.ZodNumber;
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
                                    }, z.core.$strip>;
                                    identity: z.ZodObject<{
                                        candidateId: z.ZodOptional<z.ZodString>;
                                        kind: z.ZodEnum<{
                                            "independent-bibliography": "independent-bibliography";
                                            "supplied-doi": "supplied-doi";
                                            "supplied-identifier": "supplied-identifier";
                                            unresolved: "unresolved";
                                        }>;
                                    }, z.core.$strip>;
                                    candidates: z.ZodArray<z.ZodObject<{
                                        id: z.ZodString;
                                        slot: z.ZodNumber;
                                        retrievedAt: z.ZodString;
                                        raw: z.ZodUnknown;
                                        score: z.ZodNullable<z.ZodObject<{
                                            value: z.ZodNumber;
                                            fullAgreement: z.ZodBoolean;
                                        }, z.core.$strip>>;
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
                                            agreement: z.ZodOptional<z.ZodBoolean>;
                                            journalAbbreviation: z.ZodOptional<z.ZodObject<{
                                                outcome: z.ZodEnum<{
                                                    different: "different";
                                                    match: "match";
                                                    "not-determinable": "not-determinable";
                                                }>;
                                                reason: z.ZodEnum<{
                                                    "attested-match": "attested-match";
                                                    "attested-other-journal": "attested-other-journal";
                                                    "no-attestation": "no-attestation";
                                                }>;
                                                attestations: z.ZodArray<z.ZodObject<{
                                                    source: z.ZodEnum<{
                                                        crossref: "crossref";
                                                        europepmc: "europepmc";
                                                        nlm: "nlm";
                                                        semanticscholar: "semanticscholar";
                                                    }>;
                                                    role: z.ZodEnum<{
                                                        candidate: "candidate";
                                                        reference: "reference";
                                                    }>;
                                                    journalTitle: z.ZodString;
                                                    abbreviation: z.ZodString;
                                                    nlmId: z.ZodOptional<z.ZodString>;
                                                    snapshotDate: z.ZodOptional<z.ZodString>;
                                                }, z.core.$strip>>;
                                            }, z.core.$strip>>;
                                        }, z.core.$strip>>;
                                        source: z.ZodEnum<{
                                            arxiv: "arxiv";
                                            crossref: "crossref";
                                            europepmc: "europepmc";
                                            googlebooks: "googlebooks";
                                            openalex: "openalex";
                                            openlibrary: "openlibrary";
                                            semanticscholar: "semanticscholar";
                                        }>;
                                        origin: z.ZodEnum<{
                                            arxiv: "arxiv";
                                            "authors-year": "authors-year";
                                            combined: "combined";
                                            doi: "doi";
                                            isbn: "isbn";
                                            pmcid: "pmcid";
                                            pmid: "pmid";
                                            title: "title";
                                        }>;
                                        identifiers: z.ZodOptional<z.ZodArray<z.ZodString>>;
                                        identityAmbiguous: z.ZodOptional<z.ZodBoolean>;
                                        retractionEvidence: z.ZodOptional<z.ZodObject<{
                                            source: z.ZodEnum<{
                                                crossref: "crossref";
                                                europepmc: "europepmc";
                                                openalex: "openalex";
                                            }>;
                                            candidateId: z.ZodString;
                                            observedAt: z.ZodString;
                                        }, z.core.$strip>>;
                                    }, z.core.$strip>>;
                                    evidence: z.ZodArray<z.ZodObject<{
                                        reason: z.ZodOptional<z.ZodString>;
                                        status: z.ZodOptional<z.ZodNumber>;
                                        durationMs: z.ZodNumber;
                                        attempts: z.ZodNumber;
                                        observedAt: z.ZodString;
                                        raw: z.ZodOptional<z.ZodUnknown>;
                                        source: z.ZodEnum<{
                                            arxiv: "arxiv";
                                            crossref: "crossref";
                                            "doi.org": "doi.org";
                                            europepmc: "europepmc";
                                            googlebooks: "googlebooks";
                                            openalex: "openalex";
                                            openlibrary: "openlibrary";
                                            semanticscholar: "semanticscholar";
                                        }>;
                                        operation: z.ZodEnum<{
                                            arxiv: "arxiv";
                                            "authors-year": "authors-year";
                                            combined: "combined";
                                            doi: "doi";
                                            isbn: "isbn";
                                            pmcid: "pmcid";
                                            pmid: "pmid";
                                            title: "title";
                                        }>;
                                        outcome: z.ZodEnum<{
                                            candidate: "candidate";
                                            disabled: "disabled";
                                            exists: "exists";
                                            "no-record": "no-record";
                                            nonexistent: "nonexistent";
                                            skipped: "skipped";
                                            unavailable: "unavailable";
                                            unsupported: "unsupported";
                                        }>;
                                        skippedDuplicates: z.ZodOptional<z.ZodArray<z.ZodString>>;
                                        unusedSlots: z.ZodOptional<z.ZodNumber>;
                                        identifierAmbiguity: z.ZodOptional<z.ZodArray<z.ZodString>>;
                                    }, z.core.$strip>>;
                                    reasons: z.ZodArray<z.ZodEnum<{
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
                                    failedSources: z.ZodArray<z.ZodEnum<{
                                        arxiv: "arxiv";
                                        crossref: "crossref";
                                        "doi.org": "doi.org";
                                        europepmc: "europepmc";
                                        googlebooks: "googlebooks";
                                        openalex: "openalex";
                                        openlibrary: "openlibrary";
                                        semanticscholar: "semanticscholar";
                                    }>>;
                                    retraction: z.ZodEnum<{
                                        retracted: "retracted";
                                        unknown: "unknown";
                                    }>;
                                    retractionEvidence: z.ZodOptional<z.ZodArray<z.ZodObject<{
                                        source: z.ZodEnum<{
                                            crossref: "crossref";
                                            europepmc: "europepmc";
                                            openalex: "openalex";
                                        }>;
                                        candidateId: z.ZodString;
                                        observedAt: z.ZodString;
                                    }, z.core.$strip>>>;
                                }, z.core.$strict>], "kind">;
                                progress: z.ZodEnum<{
                                    arxiv: "arxiv";
                                    checking: "checking";
                                    crossref: "crossref";
                                    "doi.org": "doi.org";
                                    ended: "ended";
                                    europepmc: "europepmc";
                                    googlebooks: "googlebooks";
                                    openalex: "openalex";
                                    openlibrary: "openlibrary";
                                    queued: "queued";
                                    semanticscholar: "semanticscholar";
                                }>;
                            }, z.core.$strip>>;
                        }, z.core.$strip>;
                    }, z.core.$strip>;
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
        params: z.ZodObject<{
            checkId: z.ZodUUID;
        }, z.core.$strip>;
    };
    path: "/v2/checks/{checkId}/cancel";
    responses: {
        503: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: z.ZodObject<{
                        type: z.ZodString;
                        title: z.ZodString;
                        status: z.ZodNumber;
                        detail: z.ZodOptional<z.ZodString>;
                        limit: z.ZodOptional<z.ZodNumber>;
                        code: z.ZodString;
                        i18nKey: z.ZodString;
                    }, z.core.$strip>;
                };
            };
        };
        400: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: z.ZodObject<{
                        type: z.ZodString;
                        title: z.ZodString;
                        status: z.ZodNumber;
                        detail: z.ZodOptional<z.ZodString>;
                        limit: z.ZodOptional<z.ZodNumber>;
                        code: z.ZodString;
                        i18nKey: z.ZodString;
                    }, z.core.$strip>;
                };
            };
        };
        401: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: z.ZodObject<{
                        type: z.ZodString;
                        title: z.ZodString;
                        status: z.ZodNumber;
                        detail: z.ZodOptional<z.ZodString>;
                        limit: z.ZodOptional<z.ZodNumber>;
                        code: z.ZodString;
                        i18nKey: z.ZodString;
                    }, z.core.$strip>;
                };
            };
        };
        403: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: z.ZodObject<{
                        type: z.ZodString;
                        title: z.ZodString;
                        status: z.ZodNumber;
                        detail: z.ZodOptional<z.ZodString>;
                        limit: z.ZodOptional<z.ZodNumber>;
                        code: z.ZodString;
                        i18nKey: z.ZodString;
                    }, z.core.$strip>;
                };
            };
        };
        404: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: z.ZodObject<{
                        type: z.ZodString;
                        title: z.ZodString;
                        status: z.ZodNumber;
                        detail: z.ZodOptional<z.ZodString>;
                        limit: z.ZodOptional<z.ZodNumber>;
                        code: z.ZodString;
                        i18nKey: z.ZodString;
                    }, z.core.$strip>;
                };
            };
        };
        410: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: z.ZodObject<{
                        type: z.ZodString;
                        title: z.ZodString;
                        status: z.ZodNumber;
                        detail: z.ZodOptional<z.ZodString>;
                        limit: z.ZodOptional<z.ZodNumber>;
                        code: z.ZodString;
                        i18nKey: z.ZodString;
                    }, z.core.$strip>;
                };
            };
        };
        200: {
            description: string;
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        quota: z.ZodUnion<readonly [z.ZodObject<{
                            consumed: z.ZodNumber;
                            remaining: z.ZodNumber;
                        }, z.core.$strip>, z.ZodObject<{
                            status: z.ZodLiteral<"not-implemented">;
                        }, z.core.$strict>, z.ZodNull]>;
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
                                revision: z.ZodNumber;
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
                                    arXiv: z.ZodOptional<z.ZodString>;
                                }, z.core.$strip>;
                                authorsTruncated: z.ZodOptional<z.ZodBoolean>;
                                revisions: z.ZodArray<z.ZodObject<{
                                    revision: z.ZodNumber;
                                    reference: z.ZodObject<{
                                        originalText: z.ZodString;
                                        span: z.ZodObject<{
                                            start: z.ZodNumber;
                                            end: z.ZodNumber;
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
                                    }, z.core.$strip>;
                                    provenance: z.ZodEnum<{
                                        parser: "parser";
                                        user: "user";
                                    }>;
                                    createdAt: z.ZodString;
                                }, z.core.$strip>>;
                                results: z.ZodArray<z.ZodObject<{
                                    id: z.ZodUUID;
                                    revision: z.ZodNumber;
                                    generation: z.ZodNumber;
                                    createdAt: z.ZodString;
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
                                        scoringRules: z.ZodObject<{
                                            version: z.ZodString;
                                            calibration: z.ZodLiteral<"uncalibrated">;
                                            unicode: z.ZodString;
                                            icu: z.ZodString;
                                            profile: z.ZodRecord<z.ZodString, z.ZodNumber>;
                                        }, z.core.$strip>;
                                        searchStrategyVersion: z.ZodString;
                                        searchConfiguration: z.ZodRecord<z.ZodString, z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
                                        bestMatchId: z.ZodNullable<z.ZodString>;
                                        reference: z.ZodObject<{
                                            originalText: z.ZodString;
                                            span: z.ZodObject<{
                                                start: z.ZodNumber;
                                                end: z.ZodNumber;
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
                                        }, z.core.$strip>;
                                        identity: z.ZodObject<{
                                            candidateId: z.ZodOptional<z.ZodString>;
                                            kind: z.ZodEnum<{
                                                "independent-bibliography": "independent-bibliography";
                                                "supplied-doi": "supplied-doi";
                                                "supplied-identifier": "supplied-identifier";
                                                unresolved: "unresolved";
                                            }>;
                                        }, z.core.$strip>;
                                        candidates: z.ZodArray<z.ZodObject<{
                                            id: z.ZodString;
                                            slot: z.ZodNumber;
                                            retrievedAt: z.ZodString;
                                            raw: z.ZodUnknown;
                                            score: z.ZodNullable<z.ZodObject<{
                                                value: z.ZodNumber;
                                                fullAgreement: z.ZodBoolean;
                                            }, z.core.$strip>>;
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
                                                agreement: z.ZodOptional<z.ZodBoolean>;
                                                journalAbbreviation: z.ZodOptional<z.ZodObject<{
                                                    outcome: z.ZodEnum<{
                                                        different: "different";
                                                        match: "match";
                                                        "not-determinable": "not-determinable";
                                                    }>;
                                                    reason: z.ZodEnum<{
                                                        "attested-match": "attested-match";
                                                        "attested-other-journal": "attested-other-journal";
                                                        "no-attestation": "no-attestation";
                                                    }>;
                                                    attestations: z.ZodArray<z.ZodObject<{
                                                        source: z.ZodEnum<{
                                                            crossref: "crossref";
                                                            europepmc: "europepmc";
                                                            nlm: "nlm";
                                                            semanticscholar: "semanticscholar";
                                                        }>;
                                                        role: z.ZodEnum<{
                                                            candidate: "candidate";
                                                            reference: "reference";
                                                        }>;
                                                        journalTitle: z.ZodString;
                                                        abbreviation: z.ZodString;
                                                        nlmId: z.ZodOptional<z.ZodString>;
                                                        snapshotDate: z.ZodOptional<z.ZodString>;
                                                    }, z.core.$strip>>;
                                                }, z.core.$strip>>;
                                            }, z.core.$strip>>;
                                            source: z.ZodEnum<{
                                                arxiv: "arxiv";
                                                crossref: "crossref";
                                                europepmc: "europepmc";
                                                googlebooks: "googlebooks";
                                                openalex: "openalex";
                                                openlibrary: "openlibrary";
                                                semanticscholar: "semanticscholar";
                                            }>;
                                            origin: z.ZodEnum<{
                                                arxiv: "arxiv";
                                                "authors-year": "authors-year";
                                                combined: "combined";
                                                doi: "doi";
                                                isbn: "isbn";
                                                pmcid: "pmcid";
                                                pmid: "pmid";
                                                title: "title";
                                            }>;
                                            identifiers: z.ZodOptional<z.ZodArray<z.ZodString>>;
                                            identityAmbiguous: z.ZodOptional<z.ZodBoolean>;
                                            retractionEvidence: z.ZodOptional<z.ZodObject<{
                                                source: z.ZodEnum<{
                                                    crossref: "crossref";
                                                    europepmc: "europepmc";
                                                    openalex: "openalex";
                                                }>;
                                                candidateId: z.ZodString;
                                                observedAt: z.ZodString;
                                            }, z.core.$strip>>;
                                        }, z.core.$strip>>;
                                        evidence: z.ZodArray<z.ZodObject<{
                                            reason: z.ZodOptional<z.ZodString>;
                                            status: z.ZodOptional<z.ZodNumber>;
                                            durationMs: z.ZodNumber;
                                            attempts: z.ZodNumber;
                                            observedAt: z.ZodString;
                                            raw: z.ZodOptional<z.ZodUnknown>;
                                            source: z.ZodEnum<{
                                                arxiv: "arxiv";
                                                crossref: "crossref";
                                                "doi.org": "doi.org";
                                                europepmc: "europepmc";
                                                googlebooks: "googlebooks";
                                                openalex: "openalex";
                                                openlibrary: "openlibrary";
                                                semanticscholar: "semanticscholar";
                                            }>;
                                            operation: z.ZodEnum<{
                                                arxiv: "arxiv";
                                                "authors-year": "authors-year";
                                                combined: "combined";
                                                doi: "doi";
                                                isbn: "isbn";
                                                pmcid: "pmcid";
                                                pmid: "pmid";
                                                title: "title";
                                            }>;
                                            outcome: z.ZodEnum<{
                                                candidate: "candidate";
                                                disabled: "disabled";
                                                exists: "exists";
                                                "no-record": "no-record";
                                                nonexistent: "nonexistent";
                                                skipped: "skipped";
                                                unavailable: "unavailable";
                                                unsupported: "unsupported";
                                            }>;
                                            skippedDuplicates: z.ZodOptional<z.ZodArray<z.ZodString>>;
                                            unusedSlots: z.ZodOptional<z.ZodNumber>;
                                            identifierAmbiguity: z.ZodOptional<z.ZodArray<z.ZodString>>;
                                        }, z.core.$strip>>;
                                        reasons: z.ZodArray<z.ZodEnum<{
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
                                        failedSources: z.ZodArray<z.ZodEnum<{
                                            arxiv: "arxiv";
                                            crossref: "crossref";
                                            "doi.org": "doi.org";
                                            europepmc: "europepmc";
                                            googlebooks: "googlebooks";
                                            openalex: "openalex";
                                            openlibrary: "openlibrary";
                                            semanticscholar: "semanticscholar";
                                        }>>;
                                        retraction: z.ZodEnum<{
                                            retracted: "retracted";
                                            unknown: "unknown";
                                        }>;
                                        retractionEvidence: z.ZodOptional<z.ZodArray<z.ZodObject<{
                                            source: z.ZodEnum<{
                                                crossref: "crossref";
                                                europepmc: "europepmc";
                                                openalex: "openalex";
                                            }>;
                                            candidateId: z.ZodString;
                                            observedAt: z.ZodString;
                                        }, z.core.$strip>>>;
                                    }, z.core.$strict>], "kind">;
                                    manualOverride: z.ZodNullable<z.ZodObject<{
                                        id: z.ZodUUID;
                                        resultId: z.ZodUUID;
                                        verdict: z.ZodEnum<{
                                            correct: "correct";
                                            "doi-conflict": "doi-conflict";
                                            "exists-with-deviations": "exists-with-deviations";
                                            "mixed-citation": "mixed-citation";
                                            "not-found": "not-found";
                                            "not-verifiable": "not-verifiable";
                                        }>;
                                        createdAt: z.ZodString;
                                    }, z.core.$strip>>;
                                }, z.core.$strip>>;
                                manualOverride: z.ZodNullable<z.ZodObject<{
                                    id: z.ZodUUID;
                                    resultId: z.ZodUUID;
                                    verdict: z.ZodEnum<{
                                        correct: "correct";
                                        "doi-conflict": "doi-conflict";
                                        "exists-with-deviations": "exists-with-deviations";
                                        "mixed-citation": "mixed-citation";
                                        "not-found": "not-found";
                                        "not-verifiable": "not-verifiable";
                                    }>;
                                    createdAt: z.ZodString;
                                }, z.core.$strip>>;
                                manualOverrideReset: z.ZodBoolean;
                                quotaEffect: z.ZodEnum<{
                                    "free-recheck": "free-recheck";
                                    "new-work": "new-work";
                                }>;
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
                                    scoringRules: z.ZodObject<{
                                        version: z.ZodString;
                                        calibration: z.ZodLiteral<"uncalibrated">;
                                        unicode: z.ZodString;
                                        icu: z.ZodString;
                                        profile: z.ZodRecord<z.ZodString, z.ZodNumber>;
                                    }, z.core.$strip>;
                                    searchStrategyVersion: z.ZodString;
                                    searchConfiguration: z.ZodRecord<z.ZodString, z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
                                    bestMatchId: z.ZodNullable<z.ZodString>;
                                    reference: z.ZodObject<{
                                        originalText: z.ZodString;
                                        span: z.ZodObject<{
                                            start: z.ZodNumber;
                                            end: z.ZodNumber;
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
                                    }, z.core.$strip>;
                                    identity: z.ZodObject<{
                                        candidateId: z.ZodOptional<z.ZodString>;
                                        kind: z.ZodEnum<{
                                            "independent-bibliography": "independent-bibliography";
                                            "supplied-doi": "supplied-doi";
                                            "supplied-identifier": "supplied-identifier";
                                            unresolved: "unresolved";
                                        }>;
                                    }, z.core.$strip>;
                                    candidates: z.ZodArray<z.ZodObject<{
                                        id: z.ZodString;
                                        slot: z.ZodNumber;
                                        retrievedAt: z.ZodString;
                                        raw: z.ZodUnknown;
                                        score: z.ZodNullable<z.ZodObject<{
                                            value: z.ZodNumber;
                                            fullAgreement: z.ZodBoolean;
                                        }, z.core.$strip>>;
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
                                            agreement: z.ZodOptional<z.ZodBoolean>;
                                            journalAbbreviation: z.ZodOptional<z.ZodObject<{
                                                outcome: z.ZodEnum<{
                                                    different: "different";
                                                    match: "match";
                                                    "not-determinable": "not-determinable";
                                                }>;
                                                reason: z.ZodEnum<{
                                                    "attested-match": "attested-match";
                                                    "attested-other-journal": "attested-other-journal";
                                                    "no-attestation": "no-attestation";
                                                }>;
                                                attestations: z.ZodArray<z.ZodObject<{
                                                    source: z.ZodEnum<{
                                                        crossref: "crossref";
                                                        europepmc: "europepmc";
                                                        nlm: "nlm";
                                                        semanticscholar: "semanticscholar";
                                                    }>;
                                                    role: z.ZodEnum<{
                                                        candidate: "candidate";
                                                        reference: "reference";
                                                    }>;
                                                    journalTitle: z.ZodString;
                                                    abbreviation: z.ZodString;
                                                    nlmId: z.ZodOptional<z.ZodString>;
                                                    snapshotDate: z.ZodOptional<z.ZodString>;
                                                }, z.core.$strip>>;
                                            }, z.core.$strip>>;
                                        }, z.core.$strip>>;
                                        source: z.ZodEnum<{
                                            arxiv: "arxiv";
                                            crossref: "crossref";
                                            europepmc: "europepmc";
                                            googlebooks: "googlebooks";
                                            openalex: "openalex";
                                            openlibrary: "openlibrary";
                                            semanticscholar: "semanticscholar";
                                        }>;
                                        origin: z.ZodEnum<{
                                            arxiv: "arxiv";
                                            "authors-year": "authors-year";
                                            combined: "combined";
                                            doi: "doi";
                                            isbn: "isbn";
                                            pmcid: "pmcid";
                                            pmid: "pmid";
                                            title: "title";
                                        }>;
                                        identifiers: z.ZodOptional<z.ZodArray<z.ZodString>>;
                                        identityAmbiguous: z.ZodOptional<z.ZodBoolean>;
                                        retractionEvidence: z.ZodOptional<z.ZodObject<{
                                            source: z.ZodEnum<{
                                                crossref: "crossref";
                                                europepmc: "europepmc";
                                                openalex: "openalex";
                                            }>;
                                            candidateId: z.ZodString;
                                            observedAt: z.ZodString;
                                        }, z.core.$strip>>;
                                    }, z.core.$strip>>;
                                    evidence: z.ZodArray<z.ZodObject<{
                                        reason: z.ZodOptional<z.ZodString>;
                                        status: z.ZodOptional<z.ZodNumber>;
                                        durationMs: z.ZodNumber;
                                        attempts: z.ZodNumber;
                                        observedAt: z.ZodString;
                                        raw: z.ZodOptional<z.ZodUnknown>;
                                        source: z.ZodEnum<{
                                            arxiv: "arxiv";
                                            crossref: "crossref";
                                            "doi.org": "doi.org";
                                            europepmc: "europepmc";
                                            googlebooks: "googlebooks";
                                            openalex: "openalex";
                                            openlibrary: "openlibrary";
                                            semanticscholar: "semanticscholar";
                                        }>;
                                        operation: z.ZodEnum<{
                                            arxiv: "arxiv";
                                            "authors-year": "authors-year";
                                            combined: "combined";
                                            doi: "doi";
                                            isbn: "isbn";
                                            pmcid: "pmcid";
                                            pmid: "pmid";
                                            title: "title";
                                        }>;
                                        outcome: z.ZodEnum<{
                                            candidate: "candidate";
                                            disabled: "disabled";
                                            exists: "exists";
                                            "no-record": "no-record";
                                            nonexistent: "nonexistent";
                                            skipped: "skipped";
                                            unavailable: "unavailable";
                                            unsupported: "unsupported";
                                        }>;
                                        skippedDuplicates: z.ZodOptional<z.ZodArray<z.ZodString>>;
                                        unusedSlots: z.ZodOptional<z.ZodNumber>;
                                        identifierAmbiguity: z.ZodOptional<z.ZodArray<z.ZodString>>;
                                    }, z.core.$strip>>;
                                    reasons: z.ZodArray<z.ZodEnum<{
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
                                    failedSources: z.ZodArray<z.ZodEnum<{
                                        arxiv: "arxiv";
                                        crossref: "crossref";
                                        "doi.org": "doi.org";
                                        europepmc: "europepmc";
                                        googlebooks: "googlebooks";
                                        openalex: "openalex";
                                        openlibrary: "openlibrary";
                                        semanticscholar: "semanticscholar";
                                    }>>;
                                    retraction: z.ZodEnum<{
                                        retracted: "retracted";
                                        unknown: "unknown";
                                    }>;
                                    retractionEvidence: z.ZodOptional<z.ZodArray<z.ZodObject<{
                                        source: z.ZodEnum<{
                                            crossref: "crossref";
                                            europepmc: "europepmc";
                                            openalex: "openalex";
                                        }>;
                                        candidateId: z.ZodString;
                                        observedAt: z.ZodString;
                                    }, z.core.$strip>>>;
                                }, z.core.$strict>], "kind">;
                                progress: z.ZodEnum<{
                                    arxiv: "arxiv";
                                    checking: "checking";
                                    crossref: "crossref";
                                    "doi.org": "doi.org";
                                    ended: "ended";
                                    europepmc: "europepmc";
                                    googlebooks: "googlebooks";
                                    openalex: "openalex";
                                    openlibrary: "openlibrary";
                                    queued: "queued";
                                    semanticscholar: "semanticscholar";
                                }>;
                            }, z.core.$strip>>;
                        }, z.core.$strip>;
                    }, z.core.$strip>;
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
        params: z.ZodObject<{
            checkId: z.ZodUUID;
        }, z.core.$strip>;
    };
    path: "/v2/checks/{checkId}/lease";
    responses: {
        503: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: z.ZodObject<{
                        type: z.ZodString;
                        title: z.ZodString;
                        status: z.ZodNumber;
                        detail: z.ZodOptional<z.ZodString>;
                        limit: z.ZodOptional<z.ZodNumber>;
                        code: z.ZodString;
                        i18nKey: z.ZodString;
                    }, z.core.$strip>;
                };
            };
        };
        400: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: z.ZodObject<{
                        type: z.ZodString;
                        title: z.ZodString;
                        status: z.ZodNumber;
                        detail: z.ZodOptional<z.ZodString>;
                        limit: z.ZodOptional<z.ZodNumber>;
                        code: z.ZodString;
                        i18nKey: z.ZodString;
                    }, z.core.$strip>;
                };
            };
        };
        401: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: z.ZodObject<{
                        type: z.ZodString;
                        title: z.ZodString;
                        status: z.ZodNumber;
                        detail: z.ZodOptional<z.ZodString>;
                        limit: z.ZodOptional<z.ZodNumber>;
                        code: z.ZodString;
                        i18nKey: z.ZodString;
                    }, z.core.$strip>;
                };
            };
        };
        403: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: z.ZodObject<{
                        type: z.ZodString;
                        title: z.ZodString;
                        status: z.ZodNumber;
                        detail: z.ZodOptional<z.ZodString>;
                        limit: z.ZodOptional<z.ZodNumber>;
                        code: z.ZodString;
                        i18nKey: z.ZodString;
                    }, z.core.$strip>;
                };
            };
        };
        404: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: z.ZodObject<{
                        type: z.ZodString;
                        title: z.ZodString;
                        status: z.ZodNumber;
                        detail: z.ZodOptional<z.ZodString>;
                        limit: z.ZodOptional<z.ZodNumber>;
                        code: z.ZodString;
                        i18nKey: z.ZodString;
                    }, z.core.$strip>;
                };
            };
        };
        410: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: z.ZodObject<{
                        type: z.ZodString;
                        title: z.ZodString;
                        status: z.ZodNumber;
                        detail: z.ZodOptional<z.ZodString>;
                        limit: z.ZodOptional<z.ZodNumber>;
                        code: z.ZodString;
                        i18nKey: z.ZodString;
                    }, z.core.$strip>;
                };
            };
        };
        200: {
            description: string;
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        quota: z.ZodUnion<readonly [z.ZodObject<{
                            consumed: z.ZodNumber;
                            remaining: z.ZodNumber;
                        }, z.core.$strip>, z.ZodObject<{
                            status: z.ZodLiteral<"not-implemented">;
                        }, z.core.$strict>, z.ZodNull]>;
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
                                revision: z.ZodNumber;
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
                                    arXiv: z.ZodOptional<z.ZodString>;
                                }, z.core.$strip>;
                                authorsTruncated: z.ZodOptional<z.ZodBoolean>;
                                revisions: z.ZodArray<z.ZodObject<{
                                    revision: z.ZodNumber;
                                    reference: z.ZodObject<{
                                        originalText: z.ZodString;
                                        span: z.ZodObject<{
                                            start: z.ZodNumber;
                                            end: z.ZodNumber;
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
                                    }, z.core.$strip>;
                                    provenance: z.ZodEnum<{
                                        parser: "parser";
                                        user: "user";
                                    }>;
                                    createdAt: z.ZodString;
                                }, z.core.$strip>>;
                                results: z.ZodArray<z.ZodObject<{
                                    id: z.ZodUUID;
                                    revision: z.ZodNumber;
                                    generation: z.ZodNumber;
                                    createdAt: z.ZodString;
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
                                        scoringRules: z.ZodObject<{
                                            version: z.ZodString;
                                            calibration: z.ZodLiteral<"uncalibrated">;
                                            unicode: z.ZodString;
                                            icu: z.ZodString;
                                            profile: z.ZodRecord<z.ZodString, z.ZodNumber>;
                                        }, z.core.$strip>;
                                        searchStrategyVersion: z.ZodString;
                                        searchConfiguration: z.ZodRecord<z.ZodString, z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
                                        bestMatchId: z.ZodNullable<z.ZodString>;
                                        reference: z.ZodObject<{
                                            originalText: z.ZodString;
                                            span: z.ZodObject<{
                                                start: z.ZodNumber;
                                                end: z.ZodNumber;
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
                                        }, z.core.$strip>;
                                        identity: z.ZodObject<{
                                            candidateId: z.ZodOptional<z.ZodString>;
                                            kind: z.ZodEnum<{
                                                "independent-bibliography": "independent-bibliography";
                                                "supplied-doi": "supplied-doi";
                                                "supplied-identifier": "supplied-identifier";
                                                unresolved: "unresolved";
                                            }>;
                                        }, z.core.$strip>;
                                        candidates: z.ZodArray<z.ZodObject<{
                                            id: z.ZodString;
                                            slot: z.ZodNumber;
                                            retrievedAt: z.ZodString;
                                            raw: z.ZodUnknown;
                                            score: z.ZodNullable<z.ZodObject<{
                                                value: z.ZodNumber;
                                                fullAgreement: z.ZodBoolean;
                                            }, z.core.$strip>>;
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
                                                agreement: z.ZodOptional<z.ZodBoolean>;
                                                journalAbbreviation: z.ZodOptional<z.ZodObject<{
                                                    outcome: z.ZodEnum<{
                                                        different: "different";
                                                        match: "match";
                                                        "not-determinable": "not-determinable";
                                                    }>;
                                                    reason: z.ZodEnum<{
                                                        "attested-match": "attested-match";
                                                        "attested-other-journal": "attested-other-journal";
                                                        "no-attestation": "no-attestation";
                                                    }>;
                                                    attestations: z.ZodArray<z.ZodObject<{
                                                        source: z.ZodEnum<{
                                                            crossref: "crossref";
                                                            europepmc: "europepmc";
                                                            nlm: "nlm";
                                                            semanticscholar: "semanticscholar";
                                                        }>;
                                                        role: z.ZodEnum<{
                                                            candidate: "candidate";
                                                            reference: "reference";
                                                        }>;
                                                        journalTitle: z.ZodString;
                                                        abbreviation: z.ZodString;
                                                        nlmId: z.ZodOptional<z.ZodString>;
                                                        snapshotDate: z.ZodOptional<z.ZodString>;
                                                    }, z.core.$strip>>;
                                                }, z.core.$strip>>;
                                            }, z.core.$strip>>;
                                            source: z.ZodEnum<{
                                                arxiv: "arxiv";
                                                crossref: "crossref";
                                                europepmc: "europepmc";
                                                googlebooks: "googlebooks";
                                                openalex: "openalex";
                                                openlibrary: "openlibrary";
                                                semanticscholar: "semanticscholar";
                                            }>;
                                            origin: z.ZodEnum<{
                                                arxiv: "arxiv";
                                                "authors-year": "authors-year";
                                                combined: "combined";
                                                doi: "doi";
                                                isbn: "isbn";
                                                pmcid: "pmcid";
                                                pmid: "pmid";
                                                title: "title";
                                            }>;
                                            identifiers: z.ZodOptional<z.ZodArray<z.ZodString>>;
                                            identityAmbiguous: z.ZodOptional<z.ZodBoolean>;
                                            retractionEvidence: z.ZodOptional<z.ZodObject<{
                                                source: z.ZodEnum<{
                                                    crossref: "crossref";
                                                    europepmc: "europepmc";
                                                    openalex: "openalex";
                                                }>;
                                                candidateId: z.ZodString;
                                                observedAt: z.ZodString;
                                            }, z.core.$strip>>;
                                        }, z.core.$strip>>;
                                        evidence: z.ZodArray<z.ZodObject<{
                                            reason: z.ZodOptional<z.ZodString>;
                                            status: z.ZodOptional<z.ZodNumber>;
                                            durationMs: z.ZodNumber;
                                            attempts: z.ZodNumber;
                                            observedAt: z.ZodString;
                                            raw: z.ZodOptional<z.ZodUnknown>;
                                            source: z.ZodEnum<{
                                                arxiv: "arxiv";
                                                crossref: "crossref";
                                                "doi.org": "doi.org";
                                                europepmc: "europepmc";
                                                googlebooks: "googlebooks";
                                                openalex: "openalex";
                                                openlibrary: "openlibrary";
                                                semanticscholar: "semanticscholar";
                                            }>;
                                            operation: z.ZodEnum<{
                                                arxiv: "arxiv";
                                                "authors-year": "authors-year";
                                                combined: "combined";
                                                doi: "doi";
                                                isbn: "isbn";
                                                pmcid: "pmcid";
                                                pmid: "pmid";
                                                title: "title";
                                            }>;
                                            outcome: z.ZodEnum<{
                                                candidate: "candidate";
                                                disabled: "disabled";
                                                exists: "exists";
                                                "no-record": "no-record";
                                                nonexistent: "nonexistent";
                                                skipped: "skipped";
                                                unavailable: "unavailable";
                                                unsupported: "unsupported";
                                            }>;
                                            skippedDuplicates: z.ZodOptional<z.ZodArray<z.ZodString>>;
                                            unusedSlots: z.ZodOptional<z.ZodNumber>;
                                            identifierAmbiguity: z.ZodOptional<z.ZodArray<z.ZodString>>;
                                        }, z.core.$strip>>;
                                        reasons: z.ZodArray<z.ZodEnum<{
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
                                        failedSources: z.ZodArray<z.ZodEnum<{
                                            arxiv: "arxiv";
                                            crossref: "crossref";
                                            "doi.org": "doi.org";
                                            europepmc: "europepmc";
                                            googlebooks: "googlebooks";
                                            openalex: "openalex";
                                            openlibrary: "openlibrary";
                                            semanticscholar: "semanticscholar";
                                        }>>;
                                        retraction: z.ZodEnum<{
                                            retracted: "retracted";
                                            unknown: "unknown";
                                        }>;
                                        retractionEvidence: z.ZodOptional<z.ZodArray<z.ZodObject<{
                                            source: z.ZodEnum<{
                                                crossref: "crossref";
                                                europepmc: "europepmc";
                                                openalex: "openalex";
                                            }>;
                                            candidateId: z.ZodString;
                                            observedAt: z.ZodString;
                                        }, z.core.$strip>>>;
                                    }, z.core.$strict>], "kind">;
                                    manualOverride: z.ZodNullable<z.ZodObject<{
                                        id: z.ZodUUID;
                                        resultId: z.ZodUUID;
                                        verdict: z.ZodEnum<{
                                            correct: "correct";
                                            "doi-conflict": "doi-conflict";
                                            "exists-with-deviations": "exists-with-deviations";
                                            "mixed-citation": "mixed-citation";
                                            "not-found": "not-found";
                                            "not-verifiable": "not-verifiable";
                                        }>;
                                        createdAt: z.ZodString;
                                    }, z.core.$strip>>;
                                }, z.core.$strip>>;
                                manualOverride: z.ZodNullable<z.ZodObject<{
                                    id: z.ZodUUID;
                                    resultId: z.ZodUUID;
                                    verdict: z.ZodEnum<{
                                        correct: "correct";
                                        "doi-conflict": "doi-conflict";
                                        "exists-with-deviations": "exists-with-deviations";
                                        "mixed-citation": "mixed-citation";
                                        "not-found": "not-found";
                                        "not-verifiable": "not-verifiable";
                                    }>;
                                    createdAt: z.ZodString;
                                }, z.core.$strip>>;
                                manualOverrideReset: z.ZodBoolean;
                                quotaEffect: z.ZodEnum<{
                                    "free-recheck": "free-recheck";
                                    "new-work": "new-work";
                                }>;
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
                                    scoringRules: z.ZodObject<{
                                        version: z.ZodString;
                                        calibration: z.ZodLiteral<"uncalibrated">;
                                        unicode: z.ZodString;
                                        icu: z.ZodString;
                                        profile: z.ZodRecord<z.ZodString, z.ZodNumber>;
                                    }, z.core.$strip>;
                                    searchStrategyVersion: z.ZodString;
                                    searchConfiguration: z.ZodRecord<z.ZodString, z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
                                    bestMatchId: z.ZodNullable<z.ZodString>;
                                    reference: z.ZodObject<{
                                        originalText: z.ZodString;
                                        span: z.ZodObject<{
                                            start: z.ZodNumber;
                                            end: z.ZodNumber;
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
                                    }, z.core.$strip>;
                                    identity: z.ZodObject<{
                                        candidateId: z.ZodOptional<z.ZodString>;
                                        kind: z.ZodEnum<{
                                            "independent-bibliography": "independent-bibliography";
                                            "supplied-doi": "supplied-doi";
                                            "supplied-identifier": "supplied-identifier";
                                            unresolved: "unresolved";
                                        }>;
                                    }, z.core.$strip>;
                                    candidates: z.ZodArray<z.ZodObject<{
                                        id: z.ZodString;
                                        slot: z.ZodNumber;
                                        retrievedAt: z.ZodString;
                                        raw: z.ZodUnknown;
                                        score: z.ZodNullable<z.ZodObject<{
                                            value: z.ZodNumber;
                                            fullAgreement: z.ZodBoolean;
                                        }, z.core.$strip>>;
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
                                            agreement: z.ZodOptional<z.ZodBoolean>;
                                            journalAbbreviation: z.ZodOptional<z.ZodObject<{
                                                outcome: z.ZodEnum<{
                                                    different: "different";
                                                    match: "match";
                                                    "not-determinable": "not-determinable";
                                                }>;
                                                reason: z.ZodEnum<{
                                                    "attested-match": "attested-match";
                                                    "attested-other-journal": "attested-other-journal";
                                                    "no-attestation": "no-attestation";
                                                }>;
                                                attestations: z.ZodArray<z.ZodObject<{
                                                    source: z.ZodEnum<{
                                                        crossref: "crossref";
                                                        europepmc: "europepmc";
                                                        nlm: "nlm";
                                                        semanticscholar: "semanticscholar";
                                                    }>;
                                                    role: z.ZodEnum<{
                                                        candidate: "candidate";
                                                        reference: "reference";
                                                    }>;
                                                    journalTitle: z.ZodString;
                                                    abbreviation: z.ZodString;
                                                    nlmId: z.ZodOptional<z.ZodString>;
                                                    snapshotDate: z.ZodOptional<z.ZodString>;
                                                }, z.core.$strip>>;
                                            }, z.core.$strip>>;
                                        }, z.core.$strip>>;
                                        source: z.ZodEnum<{
                                            arxiv: "arxiv";
                                            crossref: "crossref";
                                            europepmc: "europepmc";
                                            googlebooks: "googlebooks";
                                            openalex: "openalex";
                                            openlibrary: "openlibrary";
                                            semanticscholar: "semanticscholar";
                                        }>;
                                        origin: z.ZodEnum<{
                                            arxiv: "arxiv";
                                            "authors-year": "authors-year";
                                            combined: "combined";
                                            doi: "doi";
                                            isbn: "isbn";
                                            pmcid: "pmcid";
                                            pmid: "pmid";
                                            title: "title";
                                        }>;
                                        identifiers: z.ZodOptional<z.ZodArray<z.ZodString>>;
                                        identityAmbiguous: z.ZodOptional<z.ZodBoolean>;
                                        retractionEvidence: z.ZodOptional<z.ZodObject<{
                                            source: z.ZodEnum<{
                                                crossref: "crossref";
                                                europepmc: "europepmc";
                                                openalex: "openalex";
                                            }>;
                                            candidateId: z.ZodString;
                                            observedAt: z.ZodString;
                                        }, z.core.$strip>>;
                                    }, z.core.$strip>>;
                                    evidence: z.ZodArray<z.ZodObject<{
                                        reason: z.ZodOptional<z.ZodString>;
                                        status: z.ZodOptional<z.ZodNumber>;
                                        durationMs: z.ZodNumber;
                                        attempts: z.ZodNumber;
                                        observedAt: z.ZodString;
                                        raw: z.ZodOptional<z.ZodUnknown>;
                                        source: z.ZodEnum<{
                                            arxiv: "arxiv";
                                            crossref: "crossref";
                                            "doi.org": "doi.org";
                                            europepmc: "europepmc";
                                            googlebooks: "googlebooks";
                                            openalex: "openalex";
                                            openlibrary: "openlibrary";
                                            semanticscholar: "semanticscholar";
                                        }>;
                                        operation: z.ZodEnum<{
                                            arxiv: "arxiv";
                                            "authors-year": "authors-year";
                                            combined: "combined";
                                            doi: "doi";
                                            isbn: "isbn";
                                            pmcid: "pmcid";
                                            pmid: "pmid";
                                            title: "title";
                                        }>;
                                        outcome: z.ZodEnum<{
                                            candidate: "candidate";
                                            disabled: "disabled";
                                            exists: "exists";
                                            "no-record": "no-record";
                                            nonexistent: "nonexistent";
                                            skipped: "skipped";
                                            unavailable: "unavailable";
                                            unsupported: "unsupported";
                                        }>;
                                        skippedDuplicates: z.ZodOptional<z.ZodArray<z.ZodString>>;
                                        unusedSlots: z.ZodOptional<z.ZodNumber>;
                                        identifierAmbiguity: z.ZodOptional<z.ZodArray<z.ZodString>>;
                                    }, z.core.$strip>>;
                                    reasons: z.ZodArray<z.ZodEnum<{
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
                                    failedSources: z.ZodArray<z.ZodEnum<{
                                        arxiv: "arxiv";
                                        crossref: "crossref";
                                        "doi.org": "doi.org";
                                        europepmc: "europepmc";
                                        googlebooks: "googlebooks";
                                        openalex: "openalex";
                                        openlibrary: "openlibrary";
                                        semanticscholar: "semanticscholar";
                                    }>>;
                                    retraction: z.ZodEnum<{
                                        retracted: "retracted";
                                        unknown: "unknown";
                                    }>;
                                    retractionEvidence: z.ZodOptional<z.ZodArray<z.ZodObject<{
                                        source: z.ZodEnum<{
                                            crossref: "crossref";
                                            europepmc: "europepmc";
                                            openalex: "openalex";
                                        }>;
                                        candidateId: z.ZodString;
                                        observedAt: z.ZodString;
                                    }, z.core.$strip>>>;
                                }, z.core.$strict>], "kind">;
                                progress: z.ZodEnum<{
                                    arxiv: "arxiv";
                                    checking: "checking";
                                    crossref: "crossref";
                                    "doi.org": "doi.org";
                                    ended: "ended";
                                    europepmc: "europepmc";
                                    googlebooks: "googlebooks";
                                    openalex: "openalex";
                                    openlibrary: "openlibrary";
                                    queued: "queued";
                                    semanticscholar: "semanticscholar";
                                }>;
                            }, z.core.$strip>>;
                        }, z.core.$strip>;
                    }, z.core.$strip>;
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
    request: {
        params: z.ZodObject<{
            checkId: z.ZodUUID;
        }, z.core.$strip>;
        headers: z.ZodObject<{
            "last-event-id": z.ZodOptional<z.ZodString>;
        }, z.core.$strip>;
    };
    path: "/v2/checks/{checkId}/events";
    description: string;
    responses: {
        401: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: z.ZodObject<{
                        type: z.ZodString;
                        title: z.ZodString;
                        status: z.ZodNumber;
                        detail: z.ZodOptional<z.ZodString>;
                        limit: z.ZodOptional<z.ZodNumber>;
                        code: z.ZodString;
                        i18nKey: z.ZodString;
                    }, z.core.$strip>;
                };
            };
        };
        403: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: z.ZodObject<{
                        type: z.ZodString;
                        title: z.ZodString;
                        status: z.ZodNumber;
                        detail: z.ZodOptional<z.ZodString>;
                        limit: z.ZodOptional<z.ZodNumber>;
                        code: z.ZodString;
                        i18nKey: z.ZodString;
                    }, z.core.$strip>;
                };
            };
        };
        503: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: z.ZodObject<{
                        type: z.ZodString;
                        title: z.ZodString;
                        status: z.ZodNumber;
                        detail: z.ZodOptional<z.ZodString>;
                        limit: z.ZodOptional<z.ZodNumber>;
                        code: z.ZodString;
                        i18nKey: z.ZodString;
                    }, z.core.$strip>;
                };
            };
        };
        200: {
            description: string;
            content: {
                "text/event-stream": {
                    schema: z.ZodString;
                };
            };
        };
        400: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: z.ZodObject<{
                        type: z.ZodString;
                        title: z.ZodString;
                        status: z.ZodNumber;
                        detail: z.ZodOptional<z.ZodString>;
                        limit: z.ZodOptional<z.ZodNumber>;
                        code: z.ZodString;
                        i18nKey: z.ZodString;
                    }, z.core.$strip>;
                };
            };
        };
        404: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: z.ZodObject<{
                        type: z.ZodString;
                        title: z.ZodString;
                        status: z.ZodNumber;
                        detail: z.ZodOptional<z.ZodString>;
                        limit: z.ZodOptional<z.ZodNumber>;
                        code: z.ZodString;
                        i18nKey: z.ZodString;
                    }, z.core.$strip>;
                };
            };
        };
        410: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: z.ZodObject<{
                        type: z.ZodString;
                        title: z.ZodString;
                        status: z.ZodNumber;
                        detail: z.ZodOptional<z.ZodString>;
                        limit: z.ZodOptional<z.ZodNumber>;
                        code: z.ZodString;
                        i18nKey: z.ZodString;
                    }, z.core.$strip>;
                };
            };
        };
    };
} & {
    getRoutingPath(): "/v2/checks/:checkId/events";
};
export declare const saveFields: {
    method: "post";
    path: "/v2/checks/{checkId}/references/{slot}/revisions";
    summary: string;
    request: {
        params: z.ZodObject<{
            checkId: z.ZodUUID;
            slot: z.ZodCoercedNumber<unknown>;
        }, z.core.$strip>;
        body: {
            required: true;
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        expectedRevision: z.ZodNumber;
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
                            arXiv: z.ZodOptional<z.ZodString>;
                        }, z.core.$strict>;
                        authorsTruncated: z.ZodOptional<z.ZodBoolean>;
                        recheck: z.ZodBoolean;
                    }, z.core.$strict>;
                };
            };
        };
    };
    responses: {
        401: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: z.ZodObject<{
                        type: z.ZodString;
                        title: z.ZodString;
                        status: z.ZodNumber;
                        detail: z.ZodOptional<z.ZodString>;
                        limit: z.ZodOptional<z.ZodNumber>;
                        code: z.ZodString;
                        i18nKey: z.ZodString;
                    }, z.core.$strip>;
                };
            };
        };
        403: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: z.ZodObject<{
                        type: z.ZodString;
                        title: z.ZodString;
                        status: z.ZodNumber;
                        detail: z.ZodOptional<z.ZodString>;
                        limit: z.ZodOptional<z.ZodNumber>;
                        code: z.ZodString;
                        i18nKey: z.ZodString;
                    }, z.core.$strip>;
                };
            };
        };
        503: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: z.ZodObject<{
                        type: z.ZodString;
                        title: z.ZodString;
                        status: z.ZodNumber;
                        detail: z.ZodOptional<z.ZodString>;
                        limit: z.ZodOptional<z.ZodNumber>;
                        code: z.ZodString;
                        i18nKey: z.ZodString;
                    }, z.core.$strip>;
                };
            };
        };
        400: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: z.ZodObject<{
                        type: z.ZodString;
                        title: z.ZodString;
                        status: z.ZodNumber;
                        detail: z.ZodOptional<z.ZodString>;
                        limit: z.ZodOptional<z.ZodNumber>;
                        code: z.ZodString;
                        i18nKey: z.ZodString;
                    }, z.core.$strip>;
                };
            };
        };
        404: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: z.ZodObject<{
                        type: z.ZodString;
                        title: z.ZodString;
                        status: z.ZodNumber;
                        detail: z.ZodOptional<z.ZodString>;
                        limit: z.ZodOptional<z.ZodNumber>;
                        code: z.ZodString;
                        i18nKey: z.ZodString;
                    }, z.core.$strip>;
                };
            };
        };
        200: {
            description: string;
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        quota: z.ZodUnion<readonly [z.ZodObject<{
                            consumed: z.ZodNumber;
                            remaining: z.ZodNumber;
                        }, z.core.$strip>, z.ZodObject<{
                            status: z.ZodLiteral<"not-implemented">;
                        }, z.core.$strict>, z.ZodNull]>;
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
                                revision: z.ZodNumber;
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
                                    arXiv: z.ZodOptional<z.ZodString>;
                                }, z.core.$strip>;
                                authorsTruncated: z.ZodOptional<z.ZodBoolean>;
                                revisions: z.ZodArray<z.ZodObject<{
                                    revision: z.ZodNumber;
                                    reference: z.ZodObject<{
                                        originalText: z.ZodString;
                                        span: z.ZodObject<{
                                            start: z.ZodNumber;
                                            end: z.ZodNumber;
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
                                    }, z.core.$strip>;
                                    provenance: z.ZodEnum<{
                                        parser: "parser";
                                        user: "user";
                                    }>;
                                    createdAt: z.ZodString;
                                }, z.core.$strip>>;
                                results: z.ZodArray<z.ZodObject<{
                                    id: z.ZodUUID;
                                    revision: z.ZodNumber;
                                    generation: z.ZodNumber;
                                    createdAt: z.ZodString;
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
                                        scoringRules: z.ZodObject<{
                                            version: z.ZodString;
                                            calibration: z.ZodLiteral<"uncalibrated">;
                                            unicode: z.ZodString;
                                            icu: z.ZodString;
                                            profile: z.ZodRecord<z.ZodString, z.ZodNumber>;
                                        }, z.core.$strip>;
                                        searchStrategyVersion: z.ZodString;
                                        searchConfiguration: z.ZodRecord<z.ZodString, z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
                                        bestMatchId: z.ZodNullable<z.ZodString>;
                                        reference: z.ZodObject<{
                                            originalText: z.ZodString;
                                            span: z.ZodObject<{
                                                start: z.ZodNumber;
                                                end: z.ZodNumber;
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
                                        }, z.core.$strip>;
                                        identity: z.ZodObject<{
                                            candidateId: z.ZodOptional<z.ZodString>;
                                            kind: z.ZodEnum<{
                                                "independent-bibliography": "independent-bibliography";
                                                "supplied-doi": "supplied-doi";
                                                "supplied-identifier": "supplied-identifier";
                                                unresolved: "unresolved";
                                            }>;
                                        }, z.core.$strip>;
                                        candidates: z.ZodArray<z.ZodObject<{
                                            id: z.ZodString;
                                            slot: z.ZodNumber;
                                            retrievedAt: z.ZodString;
                                            raw: z.ZodUnknown;
                                            score: z.ZodNullable<z.ZodObject<{
                                                value: z.ZodNumber;
                                                fullAgreement: z.ZodBoolean;
                                            }, z.core.$strip>>;
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
                                                agreement: z.ZodOptional<z.ZodBoolean>;
                                                journalAbbreviation: z.ZodOptional<z.ZodObject<{
                                                    outcome: z.ZodEnum<{
                                                        different: "different";
                                                        match: "match";
                                                        "not-determinable": "not-determinable";
                                                    }>;
                                                    reason: z.ZodEnum<{
                                                        "attested-match": "attested-match";
                                                        "attested-other-journal": "attested-other-journal";
                                                        "no-attestation": "no-attestation";
                                                    }>;
                                                    attestations: z.ZodArray<z.ZodObject<{
                                                        source: z.ZodEnum<{
                                                            crossref: "crossref";
                                                            europepmc: "europepmc";
                                                            nlm: "nlm";
                                                            semanticscholar: "semanticscholar";
                                                        }>;
                                                        role: z.ZodEnum<{
                                                            candidate: "candidate";
                                                            reference: "reference";
                                                        }>;
                                                        journalTitle: z.ZodString;
                                                        abbreviation: z.ZodString;
                                                        nlmId: z.ZodOptional<z.ZodString>;
                                                        snapshotDate: z.ZodOptional<z.ZodString>;
                                                    }, z.core.$strip>>;
                                                }, z.core.$strip>>;
                                            }, z.core.$strip>>;
                                            source: z.ZodEnum<{
                                                arxiv: "arxiv";
                                                crossref: "crossref";
                                                europepmc: "europepmc";
                                                googlebooks: "googlebooks";
                                                openalex: "openalex";
                                                openlibrary: "openlibrary";
                                                semanticscholar: "semanticscholar";
                                            }>;
                                            origin: z.ZodEnum<{
                                                arxiv: "arxiv";
                                                "authors-year": "authors-year";
                                                combined: "combined";
                                                doi: "doi";
                                                isbn: "isbn";
                                                pmcid: "pmcid";
                                                pmid: "pmid";
                                                title: "title";
                                            }>;
                                            identifiers: z.ZodOptional<z.ZodArray<z.ZodString>>;
                                            identityAmbiguous: z.ZodOptional<z.ZodBoolean>;
                                            retractionEvidence: z.ZodOptional<z.ZodObject<{
                                                source: z.ZodEnum<{
                                                    crossref: "crossref";
                                                    europepmc: "europepmc";
                                                    openalex: "openalex";
                                                }>;
                                                candidateId: z.ZodString;
                                                observedAt: z.ZodString;
                                            }, z.core.$strip>>;
                                        }, z.core.$strip>>;
                                        evidence: z.ZodArray<z.ZodObject<{
                                            reason: z.ZodOptional<z.ZodString>;
                                            status: z.ZodOptional<z.ZodNumber>;
                                            durationMs: z.ZodNumber;
                                            attempts: z.ZodNumber;
                                            observedAt: z.ZodString;
                                            raw: z.ZodOptional<z.ZodUnknown>;
                                            source: z.ZodEnum<{
                                                arxiv: "arxiv";
                                                crossref: "crossref";
                                                "doi.org": "doi.org";
                                                europepmc: "europepmc";
                                                googlebooks: "googlebooks";
                                                openalex: "openalex";
                                                openlibrary: "openlibrary";
                                                semanticscholar: "semanticscholar";
                                            }>;
                                            operation: z.ZodEnum<{
                                                arxiv: "arxiv";
                                                "authors-year": "authors-year";
                                                combined: "combined";
                                                doi: "doi";
                                                isbn: "isbn";
                                                pmcid: "pmcid";
                                                pmid: "pmid";
                                                title: "title";
                                            }>;
                                            outcome: z.ZodEnum<{
                                                candidate: "candidate";
                                                disabled: "disabled";
                                                exists: "exists";
                                                "no-record": "no-record";
                                                nonexistent: "nonexistent";
                                                skipped: "skipped";
                                                unavailable: "unavailable";
                                                unsupported: "unsupported";
                                            }>;
                                            skippedDuplicates: z.ZodOptional<z.ZodArray<z.ZodString>>;
                                            unusedSlots: z.ZodOptional<z.ZodNumber>;
                                            identifierAmbiguity: z.ZodOptional<z.ZodArray<z.ZodString>>;
                                        }, z.core.$strip>>;
                                        reasons: z.ZodArray<z.ZodEnum<{
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
                                        failedSources: z.ZodArray<z.ZodEnum<{
                                            arxiv: "arxiv";
                                            crossref: "crossref";
                                            "doi.org": "doi.org";
                                            europepmc: "europepmc";
                                            googlebooks: "googlebooks";
                                            openalex: "openalex";
                                            openlibrary: "openlibrary";
                                            semanticscholar: "semanticscholar";
                                        }>>;
                                        retraction: z.ZodEnum<{
                                            retracted: "retracted";
                                            unknown: "unknown";
                                        }>;
                                        retractionEvidence: z.ZodOptional<z.ZodArray<z.ZodObject<{
                                            source: z.ZodEnum<{
                                                crossref: "crossref";
                                                europepmc: "europepmc";
                                                openalex: "openalex";
                                            }>;
                                            candidateId: z.ZodString;
                                            observedAt: z.ZodString;
                                        }, z.core.$strip>>>;
                                    }, z.core.$strict>], "kind">;
                                    manualOverride: z.ZodNullable<z.ZodObject<{
                                        id: z.ZodUUID;
                                        resultId: z.ZodUUID;
                                        verdict: z.ZodEnum<{
                                            correct: "correct";
                                            "doi-conflict": "doi-conflict";
                                            "exists-with-deviations": "exists-with-deviations";
                                            "mixed-citation": "mixed-citation";
                                            "not-found": "not-found";
                                            "not-verifiable": "not-verifiable";
                                        }>;
                                        createdAt: z.ZodString;
                                    }, z.core.$strip>>;
                                }, z.core.$strip>>;
                                manualOverride: z.ZodNullable<z.ZodObject<{
                                    id: z.ZodUUID;
                                    resultId: z.ZodUUID;
                                    verdict: z.ZodEnum<{
                                        correct: "correct";
                                        "doi-conflict": "doi-conflict";
                                        "exists-with-deviations": "exists-with-deviations";
                                        "mixed-citation": "mixed-citation";
                                        "not-found": "not-found";
                                        "not-verifiable": "not-verifiable";
                                    }>;
                                    createdAt: z.ZodString;
                                }, z.core.$strip>>;
                                manualOverrideReset: z.ZodBoolean;
                                quotaEffect: z.ZodEnum<{
                                    "free-recheck": "free-recheck";
                                    "new-work": "new-work";
                                }>;
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
                                    scoringRules: z.ZodObject<{
                                        version: z.ZodString;
                                        calibration: z.ZodLiteral<"uncalibrated">;
                                        unicode: z.ZodString;
                                        icu: z.ZodString;
                                        profile: z.ZodRecord<z.ZodString, z.ZodNumber>;
                                    }, z.core.$strip>;
                                    searchStrategyVersion: z.ZodString;
                                    searchConfiguration: z.ZodRecord<z.ZodString, z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
                                    bestMatchId: z.ZodNullable<z.ZodString>;
                                    reference: z.ZodObject<{
                                        originalText: z.ZodString;
                                        span: z.ZodObject<{
                                            start: z.ZodNumber;
                                            end: z.ZodNumber;
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
                                    }, z.core.$strip>;
                                    identity: z.ZodObject<{
                                        candidateId: z.ZodOptional<z.ZodString>;
                                        kind: z.ZodEnum<{
                                            "independent-bibliography": "independent-bibliography";
                                            "supplied-doi": "supplied-doi";
                                            "supplied-identifier": "supplied-identifier";
                                            unresolved: "unresolved";
                                        }>;
                                    }, z.core.$strip>;
                                    candidates: z.ZodArray<z.ZodObject<{
                                        id: z.ZodString;
                                        slot: z.ZodNumber;
                                        retrievedAt: z.ZodString;
                                        raw: z.ZodUnknown;
                                        score: z.ZodNullable<z.ZodObject<{
                                            value: z.ZodNumber;
                                            fullAgreement: z.ZodBoolean;
                                        }, z.core.$strip>>;
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
                                            agreement: z.ZodOptional<z.ZodBoolean>;
                                            journalAbbreviation: z.ZodOptional<z.ZodObject<{
                                                outcome: z.ZodEnum<{
                                                    different: "different";
                                                    match: "match";
                                                    "not-determinable": "not-determinable";
                                                }>;
                                                reason: z.ZodEnum<{
                                                    "attested-match": "attested-match";
                                                    "attested-other-journal": "attested-other-journal";
                                                    "no-attestation": "no-attestation";
                                                }>;
                                                attestations: z.ZodArray<z.ZodObject<{
                                                    source: z.ZodEnum<{
                                                        crossref: "crossref";
                                                        europepmc: "europepmc";
                                                        nlm: "nlm";
                                                        semanticscholar: "semanticscholar";
                                                    }>;
                                                    role: z.ZodEnum<{
                                                        candidate: "candidate";
                                                        reference: "reference";
                                                    }>;
                                                    journalTitle: z.ZodString;
                                                    abbreviation: z.ZodString;
                                                    nlmId: z.ZodOptional<z.ZodString>;
                                                    snapshotDate: z.ZodOptional<z.ZodString>;
                                                }, z.core.$strip>>;
                                            }, z.core.$strip>>;
                                        }, z.core.$strip>>;
                                        source: z.ZodEnum<{
                                            arxiv: "arxiv";
                                            crossref: "crossref";
                                            europepmc: "europepmc";
                                            googlebooks: "googlebooks";
                                            openalex: "openalex";
                                            openlibrary: "openlibrary";
                                            semanticscholar: "semanticscholar";
                                        }>;
                                        origin: z.ZodEnum<{
                                            arxiv: "arxiv";
                                            "authors-year": "authors-year";
                                            combined: "combined";
                                            doi: "doi";
                                            isbn: "isbn";
                                            pmcid: "pmcid";
                                            pmid: "pmid";
                                            title: "title";
                                        }>;
                                        identifiers: z.ZodOptional<z.ZodArray<z.ZodString>>;
                                        identityAmbiguous: z.ZodOptional<z.ZodBoolean>;
                                        retractionEvidence: z.ZodOptional<z.ZodObject<{
                                            source: z.ZodEnum<{
                                                crossref: "crossref";
                                                europepmc: "europepmc";
                                                openalex: "openalex";
                                            }>;
                                            candidateId: z.ZodString;
                                            observedAt: z.ZodString;
                                        }, z.core.$strip>>;
                                    }, z.core.$strip>>;
                                    evidence: z.ZodArray<z.ZodObject<{
                                        reason: z.ZodOptional<z.ZodString>;
                                        status: z.ZodOptional<z.ZodNumber>;
                                        durationMs: z.ZodNumber;
                                        attempts: z.ZodNumber;
                                        observedAt: z.ZodString;
                                        raw: z.ZodOptional<z.ZodUnknown>;
                                        source: z.ZodEnum<{
                                            arxiv: "arxiv";
                                            crossref: "crossref";
                                            "doi.org": "doi.org";
                                            europepmc: "europepmc";
                                            googlebooks: "googlebooks";
                                            openalex: "openalex";
                                            openlibrary: "openlibrary";
                                            semanticscholar: "semanticscholar";
                                        }>;
                                        operation: z.ZodEnum<{
                                            arxiv: "arxiv";
                                            "authors-year": "authors-year";
                                            combined: "combined";
                                            doi: "doi";
                                            isbn: "isbn";
                                            pmcid: "pmcid";
                                            pmid: "pmid";
                                            title: "title";
                                        }>;
                                        outcome: z.ZodEnum<{
                                            candidate: "candidate";
                                            disabled: "disabled";
                                            exists: "exists";
                                            "no-record": "no-record";
                                            nonexistent: "nonexistent";
                                            skipped: "skipped";
                                            unavailable: "unavailable";
                                            unsupported: "unsupported";
                                        }>;
                                        skippedDuplicates: z.ZodOptional<z.ZodArray<z.ZodString>>;
                                        unusedSlots: z.ZodOptional<z.ZodNumber>;
                                        identifierAmbiguity: z.ZodOptional<z.ZodArray<z.ZodString>>;
                                    }, z.core.$strip>>;
                                    reasons: z.ZodArray<z.ZodEnum<{
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
                                    failedSources: z.ZodArray<z.ZodEnum<{
                                        arxiv: "arxiv";
                                        crossref: "crossref";
                                        "doi.org": "doi.org";
                                        europepmc: "europepmc";
                                        googlebooks: "googlebooks";
                                        openalex: "openalex";
                                        openlibrary: "openlibrary";
                                        semanticscholar: "semanticscholar";
                                    }>>;
                                    retraction: z.ZodEnum<{
                                        retracted: "retracted";
                                        unknown: "unknown";
                                    }>;
                                    retractionEvidence: z.ZodOptional<z.ZodArray<z.ZodObject<{
                                        source: z.ZodEnum<{
                                            crossref: "crossref";
                                            europepmc: "europepmc";
                                            openalex: "openalex";
                                        }>;
                                        candidateId: z.ZodString;
                                        observedAt: z.ZodString;
                                    }, z.core.$strip>>>;
                                }, z.core.$strict>], "kind">;
                                progress: z.ZodEnum<{
                                    arxiv: "arxiv";
                                    checking: "checking";
                                    crossref: "crossref";
                                    "doi.org": "doi.org";
                                    ended: "ended";
                                    europepmc: "europepmc";
                                    googlebooks: "googlebooks";
                                    openalex: "openalex";
                                    openlibrary: "openlibrary";
                                    queued: "queued";
                                    semanticscholar: "semanticscholar";
                                }>;
                            }, z.core.$strip>>;
                        }, z.core.$strip>;
                    }, z.core.$strip>;
                };
            };
        };
        409: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: z.ZodObject<{
                        type: z.ZodString;
                        title: z.ZodString;
                        status: z.ZodNumber;
                        detail: z.ZodOptional<z.ZodString>;
                        limit: z.ZodOptional<z.ZodNumber>;
                        code: z.ZodString;
                        i18nKey: z.ZodString;
                    }, z.core.$strip>;
                };
            };
        };
        410: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: z.ZodObject<{
                        type: z.ZodString;
                        title: z.ZodString;
                        status: z.ZodNumber;
                        detail: z.ZodOptional<z.ZodString>;
                        limit: z.ZodOptional<z.ZodNumber>;
                        code: z.ZodString;
                        i18nKey: z.ZodString;
                    }, z.core.$strip>;
                };
            };
        };
    };
} & {
    getRoutingPath(): "/v2/checks/:checkId/references/:slot/revisions";
};
export declare const recheckReference: {
    method: "post";
    path: "/v2/checks/{checkId}/references/{slot}/recheck";
    summary: string;
    request: {
        params: z.ZodObject<{
            checkId: z.ZodUUID;
            slot: z.ZodCoercedNumber<unknown>;
        }, z.core.$strip>;
        body: {
            required: true;
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        expectedRevision: z.ZodNumber;
                    }, z.core.$strict>;
                };
            };
        };
    };
    responses: {
        401: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: z.ZodObject<{
                        type: z.ZodString;
                        title: z.ZodString;
                        status: z.ZodNumber;
                        detail: z.ZodOptional<z.ZodString>;
                        limit: z.ZodOptional<z.ZodNumber>;
                        code: z.ZodString;
                        i18nKey: z.ZodString;
                    }, z.core.$strip>;
                };
            };
        };
        403: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: z.ZodObject<{
                        type: z.ZodString;
                        title: z.ZodString;
                        status: z.ZodNumber;
                        detail: z.ZodOptional<z.ZodString>;
                        limit: z.ZodOptional<z.ZodNumber>;
                        code: z.ZodString;
                        i18nKey: z.ZodString;
                    }, z.core.$strip>;
                };
            };
        };
        503: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: z.ZodObject<{
                        type: z.ZodString;
                        title: z.ZodString;
                        status: z.ZodNumber;
                        detail: z.ZodOptional<z.ZodString>;
                        limit: z.ZodOptional<z.ZodNumber>;
                        code: z.ZodString;
                        i18nKey: z.ZodString;
                    }, z.core.$strip>;
                };
            };
        };
        400: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: z.ZodObject<{
                        type: z.ZodString;
                        title: z.ZodString;
                        status: z.ZodNumber;
                        detail: z.ZodOptional<z.ZodString>;
                        limit: z.ZodOptional<z.ZodNumber>;
                        code: z.ZodString;
                        i18nKey: z.ZodString;
                    }, z.core.$strip>;
                };
            };
        };
        404: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: z.ZodObject<{
                        type: z.ZodString;
                        title: z.ZodString;
                        status: z.ZodNumber;
                        detail: z.ZodOptional<z.ZodString>;
                        limit: z.ZodOptional<z.ZodNumber>;
                        code: z.ZodString;
                        i18nKey: z.ZodString;
                    }, z.core.$strip>;
                };
            };
        };
        200: {
            description: string;
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        quota: z.ZodUnion<readonly [z.ZodObject<{
                            consumed: z.ZodNumber;
                            remaining: z.ZodNumber;
                        }, z.core.$strip>, z.ZodObject<{
                            status: z.ZodLiteral<"not-implemented">;
                        }, z.core.$strict>, z.ZodNull]>;
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
                                revision: z.ZodNumber;
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
                                    arXiv: z.ZodOptional<z.ZodString>;
                                }, z.core.$strip>;
                                authorsTruncated: z.ZodOptional<z.ZodBoolean>;
                                revisions: z.ZodArray<z.ZodObject<{
                                    revision: z.ZodNumber;
                                    reference: z.ZodObject<{
                                        originalText: z.ZodString;
                                        span: z.ZodObject<{
                                            start: z.ZodNumber;
                                            end: z.ZodNumber;
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
                                    }, z.core.$strip>;
                                    provenance: z.ZodEnum<{
                                        parser: "parser";
                                        user: "user";
                                    }>;
                                    createdAt: z.ZodString;
                                }, z.core.$strip>>;
                                results: z.ZodArray<z.ZodObject<{
                                    id: z.ZodUUID;
                                    revision: z.ZodNumber;
                                    generation: z.ZodNumber;
                                    createdAt: z.ZodString;
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
                                        scoringRules: z.ZodObject<{
                                            version: z.ZodString;
                                            calibration: z.ZodLiteral<"uncalibrated">;
                                            unicode: z.ZodString;
                                            icu: z.ZodString;
                                            profile: z.ZodRecord<z.ZodString, z.ZodNumber>;
                                        }, z.core.$strip>;
                                        searchStrategyVersion: z.ZodString;
                                        searchConfiguration: z.ZodRecord<z.ZodString, z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
                                        bestMatchId: z.ZodNullable<z.ZodString>;
                                        reference: z.ZodObject<{
                                            originalText: z.ZodString;
                                            span: z.ZodObject<{
                                                start: z.ZodNumber;
                                                end: z.ZodNumber;
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
                                        }, z.core.$strip>;
                                        identity: z.ZodObject<{
                                            candidateId: z.ZodOptional<z.ZodString>;
                                            kind: z.ZodEnum<{
                                                "independent-bibliography": "independent-bibliography";
                                                "supplied-doi": "supplied-doi";
                                                "supplied-identifier": "supplied-identifier";
                                                unresolved: "unresolved";
                                            }>;
                                        }, z.core.$strip>;
                                        candidates: z.ZodArray<z.ZodObject<{
                                            id: z.ZodString;
                                            slot: z.ZodNumber;
                                            retrievedAt: z.ZodString;
                                            raw: z.ZodUnknown;
                                            score: z.ZodNullable<z.ZodObject<{
                                                value: z.ZodNumber;
                                                fullAgreement: z.ZodBoolean;
                                            }, z.core.$strip>>;
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
                                                agreement: z.ZodOptional<z.ZodBoolean>;
                                                journalAbbreviation: z.ZodOptional<z.ZodObject<{
                                                    outcome: z.ZodEnum<{
                                                        different: "different";
                                                        match: "match";
                                                        "not-determinable": "not-determinable";
                                                    }>;
                                                    reason: z.ZodEnum<{
                                                        "attested-match": "attested-match";
                                                        "attested-other-journal": "attested-other-journal";
                                                        "no-attestation": "no-attestation";
                                                    }>;
                                                    attestations: z.ZodArray<z.ZodObject<{
                                                        source: z.ZodEnum<{
                                                            crossref: "crossref";
                                                            europepmc: "europepmc";
                                                            nlm: "nlm";
                                                            semanticscholar: "semanticscholar";
                                                        }>;
                                                        role: z.ZodEnum<{
                                                            candidate: "candidate";
                                                            reference: "reference";
                                                        }>;
                                                        journalTitle: z.ZodString;
                                                        abbreviation: z.ZodString;
                                                        nlmId: z.ZodOptional<z.ZodString>;
                                                        snapshotDate: z.ZodOptional<z.ZodString>;
                                                    }, z.core.$strip>>;
                                                }, z.core.$strip>>;
                                            }, z.core.$strip>>;
                                            source: z.ZodEnum<{
                                                arxiv: "arxiv";
                                                crossref: "crossref";
                                                europepmc: "europepmc";
                                                googlebooks: "googlebooks";
                                                openalex: "openalex";
                                                openlibrary: "openlibrary";
                                                semanticscholar: "semanticscholar";
                                            }>;
                                            origin: z.ZodEnum<{
                                                arxiv: "arxiv";
                                                "authors-year": "authors-year";
                                                combined: "combined";
                                                doi: "doi";
                                                isbn: "isbn";
                                                pmcid: "pmcid";
                                                pmid: "pmid";
                                                title: "title";
                                            }>;
                                            identifiers: z.ZodOptional<z.ZodArray<z.ZodString>>;
                                            identityAmbiguous: z.ZodOptional<z.ZodBoolean>;
                                            retractionEvidence: z.ZodOptional<z.ZodObject<{
                                                source: z.ZodEnum<{
                                                    crossref: "crossref";
                                                    europepmc: "europepmc";
                                                    openalex: "openalex";
                                                }>;
                                                candidateId: z.ZodString;
                                                observedAt: z.ZodString;
                                            }, z.core.$strip>>;
                                        }, z.core.$strip>>;
                                        evidence: z.ZodArray<z.ZodObject<{
                                            reason: z.ZodOptional<z.ZodString>;
                                            status: z.ZodOptional<z.ZodNumber>;
                                            durationMs: z.ZodNumber;
                                            attempts: z.ZodNumber;
                                            observedAt: z.ZodString;
                                            raw: z.ZodOptional<z.ZodUnknown>;
                                            source: z.ZodEnum<{
                                                arxiv: "arxiv";
                                                crossref: "crossref";
                                                "doi.org": "doi.org";
                                                europepmc: "europepmc";
                                                googlebooks: "googlebooks";
                                                openalex: "openalex";
                                                openlibrary: "openlibrary";
                                                semanticscholar: "semanticscholar";
                                            }>;
                                            operation: z.ZodEnum<{
                                                arxiv: "arxiv";
                                                "authors-year": "authors-year";
                                                combined: "combined";
                                                doi: "doi";
                                                isbn: "isbn";
                                                pmcid: "pmcid";
                                                pmid: "pmid";
                                                title: "title";
                                            }>;
                                            outcome: z.ZodEnum<{
                                                candidate: "candidate";
                                                disabled: "disabled";
                                                exists: "exists";
                                                "no-record": "no-record";
                                                nonexistent: "nonexistent";
                                                skipped: "skipped";
                                                unavailable: "unavailable";
                                                unsupported: "unsupported";
                                            }>;
                                            skippedDuplicates: z.ZodOptional<z.ZodArray<z.ZodString>>;
                                            unusedSlots: z.ZodOptional<z.ZodNumber>;
                                            identifierAmbiguity: z.ZodOptional<z.ZodArray<z.ZodString>>;
                                        }, z.core.$strip>>;
                                        reasons: z.ZodArray<z.ZodEnum<{
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
                                        failedSources: z.ZodArray<z.ZodEnum<{
                                            arxiv: "arxiv";
                                            crossref: "crossref";
                                            "doi.org": "doi.org";
                                            europepmc: "europepmc";
                                            googlebooks: "googlebooks";
                                            openalex: "openalex";
                                            openlibrary: "openlibrary";
                                            semanticscholar: "semanticscholar";
                                        }>>;
                                        retraction: z.ZodEnum<{
                                            retracted: "retracted";
                                            unknown: "unknown";
                                        }>;
                                        retractionEvidence: z.ZodOptional<z.ZodArray<z.ZodObject<{
                                            source: z.ZodEnum<{
                                                crossref: "crossref";
                                                europepmc: "europepmc";
                                                openalex: "openalex";
                                            }>;
                                            candidateId: z.ZodString;
                                            observedAt: z.ZodString;
                                        }, z.core.$strip>>>;
                                    }, z.core.$strict>], "kind">;
                                    manualOverride: z.ZodNullable<z.ZodObject<{
                                        id: z.ZodUUID;
                                        resultId: z.ZodUUID;
                                        verdict: z.ZodEnum<{
                                            correct: "correct";
                                            "doi-conflict": "doi-conflict";
                                            "exists-with-deviations": "exists-with-deviations";
                                            "mixed-citation": "mixed-citation";
                                            "not-found": "not-found";
                                            "not-verifiable": "not-verifiable";
                                        }>;
                                        createdAt: z.ZodString;
                                    }, z.core.$strip>>;
                                }, z.core.$strip>>;
                                manualOverride: z.ZodNullable<z.ZodObject<{
                                    id: z.ZodUUID;
                                    resultId: z.ZodUUID;
                                    verdict: z.ZodEnum<{
                                        correct: "correct";
                                        "doi-conflict": "doi-conflict";
                                        "exists-with-deviations": "exists-with-deviations";
                                        "mixed-citation": "mixed-citation";
                                        "not-found": "not-found";
                                        "not-verifiable": "not-verifiable";
                                    }>;
                                    createdAt: z.ZodString;
                                }, z.core.$strip>>;
                                manualOverrideReset: z.ZodBoolean;
                                quotaEffect: z.ZodEnum<{
                                    "free-recheck": "free-recheck";
                                    "new-work": "new-work";
                                }>;
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
                                    scoringRules: z.ZodObject<{
                                        version: z.ZodString;
                                        calibration: z.ZodLiteral<"uncalibrated">;
                                        unicode: z.ZodString;
                                        icu: z.ZodString;
                                        profile: z.ZodRecord<z.ZodString, z.ZodNumber>;
                                    }, z.core.$strip>;
                                    searchStrategyVersion: z.ZodString;
                                    searchConfiguration: z.ZodRecord<z.ZodString, z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
                                    bestMatchId: z.ZodNullable<z.ZodString>;
                                    reference: z.ZodObject<{
                                        originalText: z.ZodString;
                                        span: z.ZodObject<{
                                            start: z.ZodNumber;
                                            end: z.ZodNumber;
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
                                    }, z.core.$strip>;
                                    identity: z.ZodObject<{
                                        candidateId: z.ZodOptional<z.ZodString>;
                                        kind: z.ZodEnum<{
                                            "independent-bibliography": "independent-bibliography";
                                            "supplied-doi": "supplied-doi";
                                            "supplied-identifier": "supplied-identifier";
                                            unresolved: "unresolved";
                                        }>;
                                    }, z.core.$strip>;
                                    candidates: z.ZodArray<z.ZodObject<{
                                        id: z.ZodString;
                                        slot: z.ZodNumber;
                                        retrievedAt: z.ZodString;
                                        raw: z.ZodUnknown;
                                        score: z.ZodNullable<z.ZodObject<{
                                            value: z.ZodNumber;
                                            fullAgreement: z.ZodBoolean;
                                        }, z.core.$strip>>;
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
                                            agreement: z.ZodOptional<z.ZodBoolean>;
                                            journalAbbreviation: z.ZodOptional<z.ZodObject<{
                                                outcome: z.ZodEnum<{
                                                    different: "different";
                                                    match: "match";
                                                    "not-determinable": "not-determinable";
                                                }>;
                                                reason: z.ZodEnum<{
                                                    "attested-match": "attested-match";
                                                    "attested-other-journal": "attested-other-journal";
                                                    "no-attestation": "no-attestation";
                                                }>;
                                                attestations: z.ZodArray<z.ZodObject<{
                                                    source: z.ZodEnum<{
                                                        crossref: "crossref";
                                                        europepmc: "europepmc";
                                                        nlm: "nlm";
                                                        semanticscholar: "semanticscholar";
                                                    }>;
                                                    role: z.ZodEnum<{
                                                        candidate: "candidate";
                                                        reference: "reference";
                                                    }>;
                                                    journalTitle: z.ZodString;
                                                    abbreviation: z.ZodString;
                                                    nlmId: z.ZodOptional<z.ZodString>;
                                                    snapshotDate: z.ZodOptional<z.ZodString>;
                                                }, z.core.$strip>>;
                                            }, z.core.$strip>>;
                                        }, z.core.$strip>>;
                                        source: z.ZodEnum<{
                                            arxiv: "arxiv";
                                            crossref: "crossref";
                                            europepmc: "europepmc";
                                            googlebooks: "googlebooks";
                                            openalex: "openalex";
                                            openlibrary: "openlibrary";
                                            semanticscholar: "semanticscholar";
                                        }>;
                                        origin: z.ZodEnum<{
                                            arxiv: "arxiv";
                                            "authors-year": "authors-year";
                                            combined: "combined";
                                            doi: "doi";
                                            isbn: "isbn";
                                            pmcid: "pmcid";
                                            pmid: "pmid";
                                            title: "title";
                                        }>;
                                        identifiers: z.ZodOptional<z.ZodArray<z.ZodString>>;
                                        identityAmbiguous: z.ZodOptional<z.ZodBoolean>;
                                        retractionEvidence: z.ZodOptional<z.ZodObject<{
                                            source: z.ZodEnum<{
                                                crossref: "crossref";
                                                europepmc: "europepmc";
                                                openalex: "openalex";
                                            }>;
                                            candidateId: z.ZodString;
                                            observedAt: z.ZodString;
                                        }, z.core.$strip>>;
                                    }, z.core.$strip>>;
                                    evidence: z.ZodArray<z.ZodObject<{
                                        reason: z.ZodOptional<z.ZodString>;
                                        status: z.ZodOptional<z.ZodNumber>;
                                        durationMs: z.ZodNumber;
                                        attempts: z.ZodNumber;
                                        observedAt: z.ZodString;
                                        raw: z.ZodOptional<z.ZodUnknown>;
                                        source: z.ZodEnum<{
                                            arxiv: "arxiv";
                                            crossref: "crossref";
                                            "doi.org": "doi.org";
                                            europepmc: "europepmc";
                                            googlebooks: "googlebooks";
                                            openalex: "openalex";
                                            openlibrary: "openlibrary";
                                            semanticscholar: "semanticscholar";
                                        }>;
                                        operation: z.ZodEnum<{
                                            arxiv: "arxiv";
                                            "authors-year": "authors-year";
                                            combined: "combined";
                                            doi: "doi";
                                            isbn: "isbn";
                                            pmcid: "pmcid";
                                            pmid: "pmid";
                                            title: "title";
                                        }>;
                                        outcome: z.ZodEnum<{
                                            candidate: "candidate";
                                            disabled: "disabled";
                                            exists: "exists";
                                            "no-record": "no-record";
                                            nonexistent: "nonexistent";
                                            skipped: "skipped";
                                            unavailable: "unavailable";
                                            unsupported: "unsupported";
                                        }>;
                                        skippedDuplicates: z.ZodOptional<z.ZodArray<z.ZodString>>;
                                        unusedSlots: z.ZodOptional<z.ZodNumber>;
                                        identifierAmbiguity: z.ZodOptional<z.ZodArray<z.ZodString>>;
                                    }, z.core.$strip>>;
                                    reasons: z.ZodArray<z.ZodEnum<{
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
                                    failedSources: z.ZodArray<z.ZodEnum<{
                                        arxiv: "arxiv";
                                        crossref: "crossref";
                                        "doi.org": "doi.org";
                                        europepmc: "europepmc";
                                        googlebooks: "googlebooks";
                                        openalex: "openalex";
                                        openlibrary: "openlibrary";
                                        semanticscholar: "semanticscholar";
                                    }>>;
                                    retraction: z.ZodEnum<{
                                        retracted: "retracted";
                                        unknown: "unknown";
                                    }>;
                                    retractionEvidence: z.ZodOptional<z.ZodArray<z.ZodObject<{
                                        source: z.ZodEnum<{
                                            crossref: "crossref";
                                            europepmc: "europepmc";
                                            openalex: "openalex";
                                        }>;
                                        candidateId: z.ZodString;
                                        observedAt: z.ZodString;
                                    }, z.core.$strip>>>;
                                }, z.core.$strict>], "kind">;
                                progress: z.ZodEnum<{
                                    arxiv: "arxiv";
                                    checking: "checking";
                                    crossref: "crossref";
                                    "doi.org": "doi.org";
                                    ended: "ended";
                                    europepmc: "europepmc";
                                    googlebooks: "googlebooks";
                                    openalex: "openalex";
                                    openlibrary: "openlibrary";
                                    queued: "queued";
                                    semanticscholar: "semanticscholar";
                                }>;
                            }, z.core.$strip>>;
                        }, z.core.$strip>;
                    }, z.core.$strip>;
                };
            };
        };
        409: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: z.ZodObject<{
                        type: z.ZodString;
                        title: z.ZodString;
                        status: z.ZodNumber;
                        detail: z.ZodOptional<z.ZodString>;
                        limit: z.ZodOptional<z.ZodNumber>;
                        code: z.ZodString;
                        i18nKey: z.ZodString;
                    }, z.core.$strip>;
                };
            };
        };
        410: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: z.ZodObject<{
                        type: z.ZodString;
                        title: z.ZodString;
                        status: z.ZodNumber;
                        detail: z.ZodOptional<z.ZodString>;
                        limit: z.ZodOptional<z.ZodNumber>;
                        code: z.ZodString;
                        i18nKey: z.ZodString;
                    }, z.core.$strip>;
                };
            };
        };
    };
} & {
    getRoutingPath(): "/v2/checks/:checkId/references/:slot/recheck";
};
export declare const editReferenceList: {
    method: "post";
    path: "/v2/checks/{checkId}/references";
    summary: string;
    request: {
        params: z.ZodObject<{
            checkId: z.ZodUUID;
        }, z.core.$strip>;
        body: {
            required: true;
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        expectedEventSeq: z.ZodNumber;
                        add: z.ZodArray<z.ZodObject<{
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
                                arXiv: z.ZodOptional<z.ZodString>;
                            }, z.core.$strict>;
                            authorsTruncated: z.ZodOptional<z.ZodBoolean>;
                        }, z.core.$strict>>;
                        remove: z.ZodArray<z.ZodNumber>;
                    }, z.core.$strict>;
                };
            };
        };
    };
    responses: {
        401: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: z.ZodObject<{
                        type: z.ZodString;
                        title: z.ZodString;
                        status: z.ZodNumber;
                        detail: z.ZodOptional<z.ZodString>;
                        limit: z.ZodOptional<z.ZodNumber>;
                        code: z.ZodString;
                        i18nKey: z.ZodString;
                    }, z.core.$strip>;
                };
            };
        };
        403: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: z.ZodObject<{
                        type: z.ZodString;
                        title: z.ZodString;
                        status: z.ZodNumber;
                        detail: z.ZodOptional<z.ZodString>;
                        limit: z.ZodOptional<z.ZodNumber>;
                        code: z.ZodString;
                        i18nKey: z.ZodString;
                    }, z.core.$strip>;
                };
            };
        };
        503: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: z.ZodObject<{
                        type: z.ZodString;
                        title: z.ZodString;
                        status: z.ZodNumber;
                        detail: z.ZodOptional<z.ZodString>;
                        limit: z.ZodOptional<z.ZodNumber>;
                        code: z.ZodString;
                        i18nKey: z.ZodString;
                    }, z.core.$strip>;
                };
            };
        };
        400: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: z.ZodObject<{
                        type: z.ZodString;
                        title: z.ZodString;
                        status: z.ZodNumber;
                        detail: z.ZodOptional<z.ZodString>;
                        limit: z.ZodOptional<z.ZodNumber>;
                        code: z.ZodString;
                        i18nKey: z.ZodString;
                    }, z.core.$strip>;
                };
            };
        };
        404: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: z.ZodObject<{
                        type: z.ZodString;
                        title: z.ZodString;
                        status: z.ZodNumber;
                        detail: z.ZodOptional<z.ZodString>;
                        limit: z.ZodOptional<z.ZodNumber>;
                        code: z.ZodString;
                        i18nKey: z.ZodString;
                    }, z.core.$strip>;
                };
            };
        };
        200: {
            description: string;
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        quota: z.ZodUnion<readonly [z.ZodObject<{
                            consumed: z.ZodNumber;
                            remaining: z.ZodNumber;
                        }, z.core.$strip>, z.ZodObject<{
                            status: z.ZodLiteral<"not-implemented">;
                        }, z.core.$strict>, z.ZodNull]>;
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
                                revision: z.ZodNumber;
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
                                    arXiv: z.ZodOptional<z.ZodString>;
                                }, z.core.$strip>;
                                authorsTruncated: z.ZodOptional<z.ZodBoolean>;
                                revisions: z.ZodArray<z.ZodObject<{
                                    revision: z.ZodNumber;
                                    reference: z.ZodObject<{
                                        originalText: z.ZodString;
                                        span: z.ZodObject<{
                                            start: z.ZodNumber;
                                            end: z.ZodNumber;
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
                                    }, z.core.$strip>;
                                    provenance: z.ZodEnum<{
                                        parser: "parser";
                                        user: "user";
                                    }>;
                                    createdAt: z.ZodString;
                                }, z.core.$strip>>;
                                results: z.ZodArray<z.ZodObject<{
                                    id: z.ZodUUID;
                                    revision: z.ZodNumber;
                                    generation: z.ZodNumber;
                                    createdAt: z.ZodString;
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
                                        scoringRules: z.ZodObject<{
                                            version: z.ZodString;
                                            calibration: z.ZodLiteral<"uncalibrated">;
                                            unicode: z.ZodString;
                                            icu: z.ZodString;
                                            profile: z.ZodRecord<z.ZodString, z.ZodNumber>;
                                        }, z.core.$strip>;
                                        searchStrategyVersion: z.ZodString;
                                        searchConfiguration: z.ZodRecord<z.ZodString, z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
                                        bestMatchId: z.ZodNullable<z.ZodString>;
                                        reference: z.ZodObject<{
                                            originalText: z.ZodString;
                                            span: z.ZodObject<{
                                                start: z.ZodNumber;
                                                end: z.ZodNumber;
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
                                        }, z.core.$strip>;
                                        identity: z.ZodObject<{
                                            candidateId: z.ZodOptional<z.ZodString>;
                                            kind: z.ZodEnum<{
                                                "independent-bibliography": "independent-bibliography";
                                                "supplied-doi": "supplied-doi";
                                                "supplied-identifier": "supplied-identifier";
                                                unresolved: "unresolved";
                                            }>;
                                        }, z.core.$strip>;
                                        candidates: z.ZodArray<z.ZodObject<{
                                            id: z.ZodString;
                                            slot: z.ZodNumber;
                                            retrievedAt: z.ZodString;
                                            raw: z.ZodUnknown;
                                            score: z.ZodNullable<z.ZodObject<{
                                                value: z.ZodNumber;
                                                fullAgreement: z.ZodBoolean;
                                            }, z.core.$strip>>;
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
                                                agreement: z.ZodOptional<z.ZodBoolean>;
                                                journalAbbreviation: z.ZodOptional<z.ZodObject<{
                                                    outcome: z.ZodEnum<{
                                                        different: "different";
                                                        match: "match";
                                                        "not-determinable": "not-determinable";
                                                    }>;
                                                    reason: z.ZodEnum<{
                                                        "attested-match": "attested-match";
                                                        "attested-other-journal": "attested-other-journal";
                                                        "no-attestation": "no-attestation";
                                                    }>;
                                                    attestations: z.ZodArray<z.ZodObject<{
                                                        source: z.ZodEnum<{
                                                            crossref: "crossref";
                                                            europepmc: "europepmc";
                                                            nlm: "nlm";
                                                            semanticscholar: "semanticscholar";
                                                        }>;
                                                        role: z.ZodEnum<{
                                                            candidate: "candidate";
                                                            reference: "reference";
                                                        }>;
                                                        journalTitle: z.ZodString;
                                                        abbreviation: z.ZodString;
                                                        nlmId: z.ZodOptional<z.ZodString>;
                                                        snapshotDate: z.ZodOptional<z.ZodString>;
                                                    }, z.core.$strip>>;
                                                }, z.core.$strip>>;
                                            }, z.core.$strip>>;
                                            source: z.ZodEnum<{
                                                arxiv: "arxiv";
                                                crossref: "crossref";
                                                europepmc: "europepmc";
                                                googlebooks: "googlebooks";
                                                openalex: "openalex";
                                                openlibrary: "openlibrary";
                                                semanticscholar: "semanticscholar";
                                            }>;
                                            origin: z.ZodEnum<{
                                                arxiv: "arxiv";
                                                "authors-year": "authors-year";
                                                combined: "combined";
                                                doi: "doi";
                                                isbn: "isbn";
                                                pmcid: "pmcid";
                                                pmid: "pmid";
                                                title: "title";
                                            }>;
                                            identifiers: z.ZodOptional<z.ZodArray<z.ZodString>>;
                                            identityAmbiguous: z.ZodOptional<z.ZodBoolean>;
                                            retractionEvidence: z.ZodOptional<z.ZodObject<{
                                                source: z.ZodEnum<{
                                                    crossref: "crossref";
                                                    europepmc: "europepmc";
                                                    openalex: "openalex";
                                                }>;
                                                candidateId: z.ZodString;
                                                observedAt: z.ZodString;
                                            }, z.core.$strip>>;
                                        }, z.core.$strip>>;
                                        evidence: z.ZodArray<z.ZodObject<{
                                            reason: z.ZodOptional<z.ZodString>;
                                            status: z.ZodOptional<z.ZodNumber>;
                                            durationMs: z.ZodNumber;
                                            attempts: z.ZodNumber;
                                            observedAt: z.ZodString;
                                            raw: z.ZodOptional<z.ZodUnknown>;
                                            source: z.ZodEnum<{
                                                arxiv: "arxiv";
                                                crossref: "crossref";
                                                "doi.org": "doi.org";
                                                europepmc: "europepmc";
                                                googlebooks: "googlebooks";
                                                openalex: "openalex";
                                                openlibrary: "openlibrary";
                                                semanticscholar: "semanticscholar";
                                            }>;
                                            operation: z.ZodEnum<{
                                                arxiv: "arxiv";
                                                "authors-year": "authors-year";
                                                combined: "combined";
                                                doi: "doi";
                                                isbn: "isbn";
                                                pmcid: "pmcid";
                                                pmid: "pmid";
                                                title: "title";
                                            }>;
                                            outcome: z.ZodEnum<{
                                                candidate: "candidate";
                                                disabled: "disabled";
                                                exists: "exists";
                                                "no-record": "no-record";
                                                nonexistent: "nonexistent";
                                                skipped: "skipped";
                                                unavailable: "unavailable";
                                                unsupported: "unsupported";
                                            }>;
                                            skippedDuplicates: z.ZodOptional<z.ZodArray<z.ZodString>>;
                                            unusedSlots: z.ZodOptional<z.ZodNumber>;
                                            identifierAmbiguity: z.ZodOptional<z.ZodArray<z.ZodString>>;
                                        }, z.core.$strip>>;
                                        reasons: z.ZodArray<z.ZodEnum<{
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
                                        failedSources: z.ZodArray<z.ZodEnum<{
                                            arxiv: "arxiv";
                                            crossref: "crossref";
                                            "doi.org": "doi.org";
                                            europepmc: "europepmc";
                                            googlebooks: "googlebooks";
                                            openalex: "openalex";
                                            openlibrary: "openlibrary";
                                            semanticscholar: "semanticscholar";
                                        }>>;
                                        retraction: z.ZodEnum<{
                                            retracted: "retracted";
                                            unknown: "unknown";
                                        }>;
                                        retractionEvidence: z.ZodOptional<z.ZodArray<z.ZodObject<{
                                            source: z.ZodEnum<{
                                                crossref: "crossref";
                                                europepmc: "europepmc";
                                                openalex: "openalex";
                                            }>;
                                            candidateId: z.ZodString;
                                            observedAt: z.ZodString;
                                        }, z.core.$strip>>>;
                                    }, z.core.$strict>], "kind">;
                                    manualOverride: z.ZodNullable<z.ZodObject<{
                                        id: z.ZodUUID;
                                        resultId: z.ZodUUID;
                                        verdict: z.ZodEnum<{
                                            correct: "correct";
                                            "doi-conflict": "doi-conflict";
                                            "exists-with-deviations": "exists-with-deviations";
                                            "mixed-citation": "mixed-citation";
                                            "not-found": "not-found";
                                            "not-verifiable": "not-verifiable";
                                        }>;
                                        createdAt: z.ZodString;
                                    }, z.core.$strip>>;
                                }, z.core.$strip>>;
                                manualOverride: z.ZodNullable<z.ZodObject<{
                                    id: z.ZodUUID;
                                    resultId: z.ZodUUID;
                                    verdict: z.ZodEnum<{
                                        correct: "correct";
                                        "doi-conflict": "doi-conflict";
                                        "exists-with-deviations": "exists-with-deviations";
                                        "mixed-citation": "mixed-citation";
                                        "not-found": "not-found";
                                        "not-verifiable": "not-verifiable";
                                    }>;
                                    createdAt: z.ZodString;
                                }, z.core.$strip>>;
                                manualOverrideReset: z.ZodBoolean;
                                quotaEffect: z.ZodEnum<{
                                    "free-recheck": "free-recheck";
                                    "new-work": "new-work";
                                }>;
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
                                    scoringRules: z.ZodObject<{
                                        version: z.ZodString;
                                        calibration: z.ZodLiteral<"uncalibrated">;
                                        unicode: z.ZodString;
                                        icu: z.ZodString;
                                        profile: z.ZodRecord<z.ZodString, z.ZodNumber>;
                                    }, z.core.$strip>;
                                    searchStrategyVersion: z.ZodString;
                                    searchConfiguration: z.ZodRecord<z.ZodString, z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
                                    bestMatchId: z.ZodNullable<z.ZodString>;
                                    reference: z.ZodObject<{
                                        originalText: z.ZodString;
                                        span: z.ZodObject<{
                                            start: z.ZodNumber;
                                            end: z.ZodNumber;
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
                                    }, z.core.$strip>;
                                    identity: z.ZodObject<{
                                        candidateId: z.ZodOptional<z.ZodString>;
                                        kind: z.ZodEnum<{
                                            "independent-bibliography": "independent-bibliography";
                                            "supplied-doi": "supplied-doi";
                                            "supplied-identifier": "supplied-identifier";
                                            unresolved: "unresolved";
                                        }>;
                                    }, z.core.$strip>;
                                    candidates: z.ZodArray<z.ZodObject<{
                                        id: z.ZodString;
                                        slot: z.ZodNumber;
                                        retrievedAt: z.ZodString;
                                        raw: z.ZodUnknown;
                                        score: z.ZodNullable<z.ZodObject<{
                                            value: z.ZodNumber;
                                            fullAgreement: z.ZodBoolean;
                                        }, z.core.$strip>>;
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
                                            agreement: z.ZodOptional<z.ZodBoolean>;
                                            journalAbbreviation: z.ZodOptional<z.ZodObject<{
                                                outcome: z.ZodEnum<{
                                                    different: "different";
                                                    match: "match";
                                                    "not-determinable": "not-determinable";
                                                }>;
                                                reason: z.ZodEnum<{
                                                    "attested-match": "attested-match";
                                                    "attested-other-journal": "attested-other-journal";
                                                    "no-attestation": "no-attestation";
                                                }>;
                                                attestations: z.ZodArray<z.ZodObject<{
                                                    source: z.ZodEnum<{
                                                        crossref: "crossref";
                                                        europepmc: "europepmc";
                                                        nlm: "nlm";
                                                        semanticscholar: "semanticscholar";
                                                    }>;
                                                    role: z.ZodEnum<{
                                                        candidate: "candidate";
                                                        reference: "reference";
                                                    }>;
                                                    journalTitle: z.ZodString;
                                                    abbreviation: z.ZodString;
                                                    nlmId: z.ZodOptional<z.ZodString>;
                                                    snapshotDate: z.ZodOptional<z.ZodString>;
                                                }, z.core.$strip>>;
                                            }, z.core.$strip>>;
                                        }, z.core.$strip>>;
                                        source: z.ZodEnum<{
                                            arxiv: "arxiv";
                                            crossref: "crossref";
                                            europepmc: "europepmc";
                                            googlebooks: "googlebooks";
                                            openalex: "openalex";
                                            openlibrary: "openlibrary";
                                            semanticscholar: "semanticscholar";
                                        }>;
                                        origin: z.ZodEnum<{
                                            arxiv: "arxiv";
                                            "authors-year": "authors-year";
                                            combined: "combined";
                                            doi: "doi";
                                            isbn: "isbn";
                                            pmcid: "pmcid";
                                            pmid: "pmid";
                                            title: "title";
                                        }>;
                                        identifiers: z.ZodOptional<z.ZodArray<z.ZodString>>;
                                        identityAmbiguous: z.ZodOptional<z.ZodBoolean>;
                                        retractionEvidence: z.ZodOptional<z.ZodObject<{
                                            source: z.ZodEnum<{
                                                crossref: "crossref";
                                                europepmc: "europepmc";
                                                openalex: "openalex";
                                            }>;
                                            candidateId: z.ZodString;
                                            observedAt: z.ZodString;
                                        }, z.core.$strip>>;
                                    }, z.core.$strip>>;
                                    evidence: z.ZodArray<z.ZodObject<{
                                        reason: z.ZodOptional<z.ZodString>;
                                        status: z.ZodOptional<z.ZodNumber>;
                                        durationMs: z.ZodNumber;
                                        attempts: z.ZodNumber;
                                        observedAt: z.ZodString;
                                        raw: z.ZodOptional<z.ZodUnknown>;
                                        source: z.ZodEnum<{
                                            arxiv: "arxiv";
                                            crossref: "crossref";
                                            "doi.org": "doi.org";
                                            europepmc: "europepmc";
                                            googlebooks: "googlebooks";
                                            openalex: "openalex";
                                            openlibrary: "openlibrary";
                                            semanticscholar: "semanticscholar";
                                        }>;
                                        operation: z.ZodEnum<{
                                            arxiv: "arxiv";
                                            "authors-year": "authors-year";
                                            combined: "combined";
                                            doi: "doi";
                                            isbn: "isbn";
                                            pmcid: "pmcid";
                                            pmid: "pmid";
                                            title: "title";
                                        }>;
                                        outcome: z.ZodEnum<{
                                            candidate: "candidate";
                                            disabled: "disabled";
                                            exists: "exists";
                                            "no-record": "no-record";
                                            nonexistent: "nonexistent";
                                            skipped: "skipped";
                                            unavailable: "unavailable";
                                            unsupported: "unsupported";
                                        }>;
                                        skippedDuplicates: z.ZodOptional<z.ZodArray<z.ZodString>>;
                                        unusedSlots: z.ZodOptional<z.ZodNumber>;
                                        identifierAmbiguity: z.ZodOptional<z.ZodArray<z.ZodString>>;
                                    }, z.core.$strip>>;
                                    reasons: z.ZodArray<z.ZodEnum<{
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
                                    failedSources: z.ZodArray<z.ZodEnum<{
                                        arxiv: "arxiv";
                                        crossref: "crossref";
                                        "doi.org": "doi.org";
                                        europepmc: "europepmc";
                                        googlebooks: "googlebooks";
                                        openalex: "openalex";
                                        openlibrary: "openlibrary";
                                        semanticscholar: "semanticscholar";
                                    }>>;
                                    retraction: z.ZodEnum<{
                                        retracted: "retracted";
                                        unknown: "unknown";
                                    }>;
                                    retractionEvidence: z.ZodOptional<z.ZodArray<z.ZodObject<{
                                        source: z.ZodEnum<{
                                            crossref: "crossref";
                                            europepmc: "europepmc";
                                            openalex: "openalex";
                                        }>;
                                        candidateId: z.ZodString;
                                        observedAt: z.ZodString;
                                    }, z.core.$strip>>>;
                                }, z.core.$strict>], "kind">;
                                progress: z.ZodEnum<{
                                    arxiv: "arxiv";
                                    checking: "checking";
                                    crossref: "crossref";
                                    "doi.org": "doi.org";
                                    ended: "ended";
                                    europepmc: "europepmc";
                                    googlebooks: "googlebooks";
                                    openalex: "openalex";
                                    openlibrary: "openlibrary";
                                    queued: "queued";
                                    semanticscholar: "semanticscholar";
                                }>;
                            }, z.core.$strip>>;
                        }, z.core.$strip>;
                    }, z.core.$strip>;
                };
            };
        };
        409: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: z.ZodObject<{
                        type: z.ZodString;
                        title: z.ZodString;
                        status: z.ZodNumber;
                        detail: z.ZodOptional<z.ZodString>;
                        limit: z.ZodOptional<z.ZodNumber>;
                        code: z.ZodString;
                        i18nKey: z.ZodString;
                    }, z.core.$strip>;
                };
            };
        };
        410: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: z.ZodObject<{
                        type: z.ZodString;
                        title: z.ZodString;
                        status: z.ZodNumber;
                        detail: z.ZodOptional<z.ZodString>;
                        limit: z.ZodOptional<z.ZodNumber>;
                        code: z.ZodString;
                        i18nKey: z.ZodString;
                    }, z.core.$strip>;
                };
            };
        };
    };
} & {
    getRoutingPath(): "/v2/checks/:checkId/references";
};
export declare const setManualOverride: {
    method: "post";
    path: "/v2/checks/{checkId}/references/{slot}/manual-override";
    summary: string;
    description: string;
    request: {
        params: z.ZodObject<{
            checkId: z.ZodUUID;
            slot: z.ZodCoercedNumber<unknown>;
        }, z.core.$strip>;
        body: {
            required: true;
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        expectedRevision: z.ZodNumber;
                        resultId: z.ZodUUID;
                        expectedOverrideId: z.ZodNullable<z.ZodUUID>;
                        verdict: z.ZodEnum<{
                            correct: "correct";
                            "doi-conflict": "doi-conflict";
                            "exists-with-deviations": "exists-with-deviations";
                            "mixed-citation": "mixed-citation";
                            "not-found": "not-found";
                            "not-verifiable": "not-verifiable";
                        }>;
                    }, z.core.$strict>;
                };
            };
        };
    };
    responses: {
        401: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: z.ZodObject<{
                        type: z.ZodString;
                        title: z.ZodString;
                        status: z.ZodNumber;
                        detail: z.ZodOptional<z.ZodString>;
                        limit: z.ZodOptional<z.ZodNumber>;
                        code: z.ZodString;
                        i18nKey: z.ZodString;
                    }, z.core.$strip>;
                };
            };
        };
        403: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: z.ZodObject<{
                        type: z.ZodString;
                        title: z.ZodString;
                        status: z.ZodNumber;
                        detail: z.ZodOptional<z.ZodString>;
                        limit: z.ZodOptional<z.ZodNumber>;
                        code: z.ZodString;
                        i18nKey: z.ZodString;
                    }, z.core.$strip>;
                };
            };
        };
        503: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: z.ZodObject<{
                        type: z.ZodString;
                        title: z.ZodString;
                        status: z.ZodNumber;
                        detail: z.ZodOptional<z.ZodString>;
                        limit: z.ZodOptional<z.ZodNumber>;
                        code: z.ZodString;
                        i18nKey: z.ZodString;
                    }, z.core.$strip>;
                };
            };
        };
        400: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: z.ZodObject<{
                        type: z.ZodString;
                        title: z.ZodString;
                        status: z.ZodNumber;
                        detail: z.ZodOptional<z.ZodString>;
                        limit: z.ZodOptional<z.ZodNumber>;
                        code: z.ZodString;
                        i18nKey: z.ZodString;
                    }, z.core.$strip>;
                };
            };
        };
        404: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: z.ZodObject<{
                        type: z.ZodString;
                        title: z.ZodString;
                        status: z.ZodNumber;
                        detail: z.ZodOptional<z.ZodString>;
                        limit: z.ZodOptional<z.ZodNumber>;
                        code: z.ZodString;
                        i18nKey: z.ZodString;
                    }, z.core.$strip>;
                };
            };
        };
        200: {
            description: string;
            content: {
                "application/json": {
                    schema: z.ZodObject<{
                        quota: z.ZodUnion<readonly [z.ZodObject<{
                            consumed: z.ZodNumber;
                            remaining: z.ZodNumber;
                        }, z.core.$strip>, z.ZodObject<{
                            status: z.ZodLiteral<"not-implemented">;
                        }, z.core.$strict>, z.ZodNull]>;
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
                                revision: z.ZodNumber;
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
                                    arXiv: z.ZodOptional<z.ZodString>;
                                }, z.core.$strip>;
                                authorsTruncated: z.ZodOptional<z.ZodBoolean>;
                                revisions: z.ZodArray<z.ZodObject<{
                                    revision: z.ZodNumber;
                                    reference: z.ZodObject<{
                                        originalText: z.ZodString;
                                        span: z.ZodObject<{
                                            start: z.ZodNumber;
                                            end: z.ZodNumber;
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
                                    }, z.core.$strip>;
                                    provenance: z.ZodEnum<{
                                        parser: "parser";
                                        user: "user";
                                    }>;
                                    createdAt: z.ZodString;
                                }, z.core.$strip>>;
                                results: z.ZodArray<z.ZodObject<{
                                    id: z.ZodUUID;
                                    revision: z.ZodNumber;
                                    generation: z.ZodNumber;
                                    createdAt: z.ZodString;
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
                                        scoringRules: z.ZodObject<{
                                            version: z.ZodString;
                                            calibration: z.ZodLiteral<"uncalibrated">;
                                            unicode: z.ZodString;
                                            icu: z.ZodString;
                                            profile: z.ZodRecord<z.ZodString, z.ZodNumber>;
                                        }, z.core.$strip>;
                                        searchStrategyVersion: z.ZodString;
                                        searchConfiguration: z.ZodRecord<z.ZodString, z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
                                        bestMatchId: z.ZodNullable<z.ZodString>;
                                        reference: z.ZodObject<{
                                            originalText: z.ZodString;
                                            span: z.ZodObject<{
                                                start: z.ZodNumber;
                                                end: z.ZodNumber;
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
                                        }, z.core.$strip>;
                                        identity: z.ZodObject<{
                                            candidateId: z.ZodOptional<z.ZodString>;
                                            kind: z.ZodEnum<{
                                                "independent-bibliography": "independent-bibliography";
                                                "supplied-doi": "supplied-doi";
                                                "supplied-identifier": "supplied-identifier";
                                                unresolved: "unresolved";
                                            }>;
                                        }, z.core.$strip>;
                                        candidates: z.ZodArray<z.ZodObject<{
                                            id: z.ZodString;
                                            slot: z.ZodNumber;
                                            retrievedAt: z.ZodString;
                                            raw: z.ZodUnknown;
                                            score: z.ZodNullable<z.ZodObject<{
                                                value: z.ZodNumber;
                                                fullAgreement: z.ZodBoolean;
                                            }, z.core.$strip>>;
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
                                                agreement: z.ZodOptional<z.ZodBoolean>;
                                                journalAbbreviation: z.ZodOptional<z.ZodObject<{
                                                    outcome: z.ZodEnum<{
                                                        different: "different";
                                                        match: "match";
                                                        "not-determinable": "not-determinable";
                                                    }>;
                                                    reason: z.ZodEnum<{
                                                        "attested-match": "attested-match";
                                                        "attested-other-journal": "attested-other-journal";
                                                        "no-attestation": "no-attestation";
                                                    }>;
                                                    attestations: z.ZodArray<z.ZodObject<{
                                                        source: z.ZodEnum<{
                                                            crossref: "crossref";
                                                            europepmc: "europepmc";
                                                            nlm: "nlm";
                                                            semanticscholar: "semanticscholar";
                                                        }>;
                                                        role: z.ZodEnum<{
                                                            candidate: "candidate";
                                                            reference: "reference";
                                                        }>;
                                                        journalTitle: z.ZodString;
                                                        abbreviation: z.ZodString;
                                                        nlmId: z.ZodOptional<z.ZodString>;
                                                        snapshotDate: z.ZodOptional<z.ZodString>;
                                                    }, z.core.$strip>>;
                                                }, z.core.$strip>>;
                                            }, z.core.$strip>>;
                                            source: z.ZodEnum<{
                                                arxiv: "arxiv";
                                                crossref: "crossref";
                                                europepmc: "europepmc";
                                                googlebooks: "googlebooks";
                                                openalex: "openalex";
                                                openlibrary: "openlibrary";
                                                semanticscholar: "semanticscholar";
                                            }>;
                                            origin: z.ZodEnum<{
                                                arxiv: "arxiv";
                                                "authors-year": "authors-year";
                                                combined: "combined";
                                                doi: "doi";
                                                isbn: "isbn";
                                                pmcid: "pmcid";
                                                pmid: "pmid";
                                                title: "title";
                                            }>;
                                            identifiers: z.ZodOptional<z.ZodArray<z.ZodString>>;
                                            identityAmbiguous: z.ZodOptional<z.ZodBoolean>;
                                            retractionEvidence: z.ZodOptional<z.ZodObject<{
                                                source: z.ZodEnum<{
                                                    crossref: "crossref";
                                                    europepmc: "europepmc";
                                                    openalex: "openalex";
                                                }>;
                                                candidateId: z.ZodString;
                                                observedAt: z.ZodString;
                                            }, z.core.$strip>>;
                                        }, z.core.$strip>>;
                                        evidence: z.ZodArray<z.ZodObject<{
                                            reason: z.ZodOptional<z.ZodString>;
                                            status: z.ZodOptional<z.ZodNumber>;
                                            durationMs: z.ZodNumber;
                                            attempts: z.ZodNumber;
                                            observedAt: z.ZodString;
                                            raw: z.ZodOptional<z.ZodUnknown>;
                                            source: z.ZodEnum<{
                                                arxiv: "arxiv";
                                                crossref: "crossref";
                                                "doi.org": "doi.org";
                                                europepmc: "europepmc";
                                                googlebooks: "googlebooks";
                                                openalex: "openalex";
                                                openlibrary: "openlibrary";
                                                semanticscholar: "semanticscholar";
                                            }>;
                                            operation: z.ZodEnum<{
                                                arxiv: "arxiv";
                                                "authors-year": "authors-year";
                                                combined: "combined";
                                                doi: "doi";
                                                isbn: "isbn";
                                                pmcid: "pmcid";
                                                pmid: "pmid";
                                                title: "title";
                                            }>;
                                            outcome: z.ZodEnum<{
                                                candidate: "candidate";
                                                disabled: "disabled";
                                                exists: "exists";
                                                "no-record": "no-record";
                                                nonexistent: "nonexistent";
                                                skipped: "skipped";
                                                unavailable: "unavailable";
                                                unsupported: "unsupported";
                                            }>;
                                            skippedDuplicates: z.ZodOptional<z.ZodArray<z.ZodString>>;
                                            unusedSlots: z.ZodOptional<z.ZodNumber>;
                                            identifierAmbiguity: z.ZodOptional<z.ZodArray<z.ZodString>>;
                                        }, z.core.$strip>>;
                                        reasons: z.ZodArray<z.ZodEnum<{
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
                                        failedSources: z.ZodArray<z.ZodEnum<{
                                            arxiv: "arxiv";
                                            crossref: "crossref";
                                            "doi.org": "doi.org";
                                            europepmc: "europepmc";
                                            googlebooks: "googlebooks";
                                            openalex: "openalex";
                                            openlibrary: "openlibrary";
                                            semanticscholar: "semanticscholar";
                                        }>>;
                                        retraction: z.ZodEnum<{
                                            retracted: "retracted";
                                            unknown: "unknown";
                                        }>;
                                        retractionEvidence: z.ZodOptional<z.ZodArray<z.ZodObject<{
                                            source: z.ZodEnum<{
                                                crossref: "crossref";
                                                europepmc: "europepmc";
                                                openalex: "openalex";
                                            }>;
                                            candidateId: z.ZodString;
                                            observedAt: z.ZodString;
                                        }, z.core.$strip>>>;
                                    }, z.core.$strict>], "kind">;
                                    manualOverride: z.ZodNullable<z.ZodObject<{
                                        id: z.ZodUUID;
                                        resultId: z.ZodUUID;
                                        verdict: z.ZodEnum<{
                                            correct: "correct";
                                            "doi-conflict": "doi-conflict";
                                            "exists-with-deviations": "exists-with-deviations";
                                            "mixed-citation": "mixed-citation";
                                            "not-found": "not-found";
                                            "not-verifiable": "not-verifiable";
                                        }>;
                                        createdAt: z.ZodString;
                                    }, z.core.$strip>>;
                                }, z.core.$strip>>;
                                manualOverride: z.ZodNullable<z.ZodObject<{
                                    id: z.ZodUUID;
                                    resultId: z.ZodUUID;
                                    verdict: z.ZodEnum<{
                                        correct: "correct";
                                        "doi-conflict": "doi-conflict";
                                        "exists-with-deviations": "exists-with-deviations";
                                        "mixed-citation": "mixed-citation";
                                        "not-found": "not-found";
                                        "not-verifiable": "not-verifiable";
                                    }>;
                                    createdAt: z.ZodString;
                                }, z.core.$strip>>;
                                manualOverrideReset: z.ZodBoolean;
                                quotaEffect: z.ZodEnum<{
                                    "free-recheck": "free-recheck";
                                    "new-work": "new-work";
                                }>;
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
                                    scoringRules: z.ZodObject<{
                                        version: z.ZodString;
                                        calibration: z.ZodLiteral<"uncalibrated">;
                                        unicode: z.ZodString;
                                        icu: z.ZodString;
                                        profile: z.ZodRecord<z.ZodString, z.ZodNumber>;
                                    }, z.core.$strip>;
                                    searchStrategyVersion: z.ZodString;
                                    searchConfiguration: z.ZodRecord<z.ZodString, z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
                                    bestMatchId: z.ZodNullable<z.ZodString>;
                                    reference: z.ZodObject<{
                                        originalText: z.ZodString;
                                        span: z.ZodObject<{
                                            start: z.ZodNumber;
                                            end: z.ZodNumber;
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
                                    }, z.core.$strip>;
                                    identity: z.ZodObject<{
                                        candidateId: z.ZodOptional<z.ZodString>;
                                        kind: z.ZodEnum<{
                                            "independent-bibliography": "independent-bibliography";
                                            "supplied-doi": "supplied-doi";
                                            "supplied-identifier": "supplied-identifier";
                                            unresolved: "unresolved";
                                        }>;
                                    }, z.core.$strip>;
                                    candidates: z.ZodArray<z.ZodObject<{
                                        id: z.ZodString;
                                        slot: z.ZodNumber;
                                        retrievedAt: z.ZodString;
                                        raw: z.ZodUnknown;
                                        score: z.ZodNullable<z.ZodObject<{
                                            value: z.ZodNumber;
                                            fullAgreement: z.ZodBoolean;
                                        }, z.core.$strip>>;
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
                                            agreement: z.ZodOptional<z.ZodBoolean>;
                                            journalAbbreviation: z.ZodOptional<z.ZodObject<{
                                                outcome: z.ZodEnum<{
                                                    different: "different";
                                                    match: "match";
                                                    "not-determinable": "not-determinable";
                                                }>;
                                                reason: z.ZodEnum<{
                                                    "attested-match": "attested-match";
                                                    "attested-other-journal": "attested-other-journal";
                                                    "no-attestation": "no-attestation";
                                                }>;
                                                attestations: z.ZodArray<z.ZodObject<{
                                                    source: z.ZodEnum<{
                                                        crossref: "crossref";
                                                        europepmc: "europepmc";
                                                        nlm: "nlm";
                                                        semanticscholar: "semanticscholar";
                                                    }>;
                                                    role: z.ZodEnum<{
                                                        candidate: "candidate";
                                                        reference: "reference";
                                                    }>;
                                                    journalTitle: z.ZodString;
                                                    abbreviation: z.ZodString;
                                                    nlmId: z.ZodOptional<z.ZodString>;
                                                    snapshotDate: z.ZodOptional<z.ZodString>;
                                                }, z.core.$strip>>;
                                            }, z.core.$strip>>;
                                        }, z.core.$strip>>;
                                        source: z.ZodEnum<{
                                            arxiv: "arxiv";
                                            crossref: "crossref";
                                            europepmc: "europepmc";
                                            googlebooks: "googlebooks";
                                            openalex: "openalex";
                                            openlibrary: "openlibrary";
                                            semanticscholar: "semanticscholar";
                                        }>;
                                        origin: z.ZodEnum<{
                                            arxiv: "arxiv";
                                            "authors-year": "authors-year";
                                            combined: "combined";
                                            doi: "doi";
                                            isbn: "isbn";
                                            pmcid: "pmcid";
                                            pmid: "pmid";
                                            title: "title";
                                        }>;
                                        identifiers: z.ZodOptional<z.ZodArray<z.ZodString>>;
                                        identityAmbiguous: z.ZodOptional<z.ZodBoolean>;
                                        retractionEvidence: z.ZodOptional<z.ZodObject<{
                                            source: z.ZodEnum<{
                                                crossref: "crossref";
                                                europepmc: "europepmc";
                                                openalex: "openalex";
                                            }>;
                                            candidateId: z.ZodString;
                                            observedAt: z.ZodString;
                                        }, z.core.$strip>>;
                                    }, z.core.$strip>>;
                                    evidence: z.ZodArray<z.ZodObject<{
                                        reason: z.ZodOptional<z.ZodString>;
                                        status: z.ZodOptional<z.ZodNumber>;
                                        durationMs: z.ZodNumber;
                                        attempts: z.ZodNumber;
                                        observedAt: z.ZodString;
                                        raw: z.ZodOptional<z.ZodUnknown>;
                                        source: z.ZodEnum<{
                                            arxiv: "arxiv";
                                            crossref: "crossref";
                                            "doi.org": "doi.org";
                                            europepmc: "europepmc";
                                            googlebooks: "googlebooks";
                                            openalex: "openalex";
                                            openlibrary: "openlibrary";
                                            semanticscholar: "semanticscholar";
                                        }>;
                                        operation: z.ZodEnum<{
                                            arxiv: "arxiv";
                                            "authors-year": "authors-year";
                                            combined: "combined";
                                            doi: "doi";
                                            isbn: "isbn";
                                            pmcid: "pmcid";
                                            pmid: "pmid";
                                            title: "title";
                                        }>;
                                        outcome: z.ZodEnum<{
                                            candidate: "candidate";
                                            disabled: "disabled";
                                            exists: "exists";
                                            "no-record": "no-record";
                                            nonexistent: "nonexistent";
                                            skipped: "skipped";
                                            unavailable: "unavailable";
                                            unsupported: "unsupported";
                                        }>;
                                        skippedDuplicates: z.ZodOptional<z.ZodArray<z.ZodString>>;
                                        unusedSlots: z.ZodOptional<z.ZodNumber>;
                                        identifierAmbiguity: z.ZodOptional<z.ZodArray<z.ZodString>>;
                                    }, z.core.$strip>>;
                                    reasons: z.ZodArray<z.ZodEnum<{
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
                                    failedSources: z.ZodArray<z.ZodEnum<{
                                        arxiv: "arxiv";
                                        crossref: "crossref";
                                        "doi.org": "doi.org";
                                        europepmc: "europepmc";
                                        googlebooks: "googlebooks";
                                        openalex: "openalex";
                                        openlibrary: "openlibrary";
                                        semanticscholar: "semanticscholar";
                                    }>>;
                                    retraction: z.ZodEnum<{
                                        retracted: "retracted";
                                        unknown: "unknown";
                                    }>;
                                    retractionEvidence: z.ZodOptional<z.ZodArray<z.ZodObject<{
                                        source: z.ZodEnum<{
                                            crossref: "crossref";
                                            europepmc: "europepmc";
                                            openalex: "openalex";
                                        }>;
                                        candidateId: z.ZodString;
                                        observedAt: z.ZodString;
                                    }, z.core.$strip>>>;
                                }, z.core.$strict>], "kind">;
                                progress: z.ZodEnum<{
                                    arxiv: "arxiv";
                                    checking: "checking";
                                    crossref: "crossref";
                                    "doi.org": "doi.org";
                                    ended: "ended";
                                    europepmc: "europepmc";
                                    googlebooks: "googlebooks";
                                    openalex: "openalex";
                                    openlibrary: "openlibrary";
                                    queued: "queued";
                                    semanticscholar: "semanticscholar";
                                }>;
                            }, z.core.$strip>>;
                        }, z.core.$strip>;
                    }, z.core.$strip>;
                };
            };
        };
        409: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: z.ZodObject<{
                        type: z.ZodString;
                        title: z.ZodString;
                        status: z.ZodNumber;
                        detail: z.ZodOptional<z.ZodString>;
                        limit: z.ZodOptional<z.ZodNumber>;
                        code: z.ZodString;
                        i18nKey: z.ZodString;
                    }, z.core.$strip>;
                };
            };
        };
        410: {
            description: string;
            content: {
                "application/problem+json": {
                    schema: z.ZodObject<{
                        type: z.ZodString;
                        title: z.ZodString;
                        status: z.ZodNumber;
                        detail: z.ZodOptional<z.ZodString>;
                        limit: z.ZodOptional<z.ZodNumber>;
                        code: z.ZodString;
                        i18nKey: z.ZodString;
                    }, z.core.$strip>;
                };
            };
        };
    };
} & {
    getRoutingPath(): "/v2/checks/:checkId/references/:slot/manual-override";
};
