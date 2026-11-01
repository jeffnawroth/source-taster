import { CheckEvent, type SetManualOverrideRequest, type CreateCheckRequest, type SaveFieldsRequest, type RecheckRequest, type EditReferenceListRequest, type EditSelectionRequest } from "./v2.ts";
import { type VerificationClientOptions, type WatchOptions } from "./client.ts";
import { type LibraryInput } from "./import.ts";
export { ApiError, CheckStreamError, readSseFrames, type CredentialSupplier, type VerificationClientOptions, } from "./client.ts";
export type WatchCheckOptions = WatchOptions<CheckEvent>;
export declare function verificationClient(options?: VerificationClientOptions): {
    cancelCheck: (checkId: string) => Promise<{
        id: string;
        state: "ended" | "running";
        lastEventSeq: number;
        lastEventCursor: string;
        leaseRenewAfterMs: number;
        endReason: "cancelled" | "completed" | "lease-expired" | null;
        document?: {
            text: string;
            selection: {
                version: string;
                regions: {
                    start: number;
                    end: number;
                }[];
            };
        } | null | undefined;
        references: {
            slot: number;
            originalText: string;
            revision: number;
            fields: {
                type?: string | undefined;
                author?: {
                    family?: string | undefined;
                    "non-dropping-particle"?: string | undefined;
                    given?: string | undefined;
                    literal?: string | undefined;
                }[] | undefined;
                issued?: {
                    literal: string;
                } | undefined;
                title?: string | undefined;
                "container-title"?: string | undefined;
                "container-title-short"?: string | undefined;
                publisher?: string | undefined;
                "publisher-place"?: string | undefined;
                volume?: string | undefined;
                issue?: string | undefined;
                page?: string | undefined;
                "article-number"?: string | undefined;
                edition?: string | undefined;
                DOI?: string | undefined;
                URL?: string | undefined;
                ISBN?: string | undefined;
                ISSN?: string | undefined;
                PMID?: string | undefined;
                PMCID?: string | undefined;
                arXiv?: string | undefined;
            };
            authorsTruncated?: boolean | undefined;
            revisions: {
                revision: number;
                reference: {
                    originalText: string;
                    span: {
                        start: number;
                        end: number;
                    };
                    authorsTruncated?: boolean | undefined;
                    fieldSources: Record<string, {
                        raw: string;
                        span?: {
                            start: number;
                            end: number;
                        } | undefined;
                        normalized?: string | undefined;
                        provenance?: "ai" | "parser" | "user" | undefined;
                    }>;
                    structuring: {
                        path: "ai" | "parser" | "user";
                        version: string;
                    };
                    ai?: {
                        configuration: string;
                        notice: "ai-can-be-wrong";
                        proposals: {
                            field: string;
                            value: unknown;
                            reason: "ungrounded";
                        }[];
                        changedFields: string[];
                    } | undefined;
                    csl: {
                        type?: string | undefined;
                        author?: {
                            family?: string | undefined;
                            "non-dropping-particle"?: string | undefined;
                            given?: string | undefined;
                            literal?: string | undefined;
                        }[] | undefined;
                        issued?: {
                            literal: string;
                        } | undefined;
                        title?: string | undefined;
                        "container-title"?: string | undefined;
                        "container-title-short"?: string | undefined;
                        publisher?: string | undefined;
                        "publisher-place"?: string | undefined;
                        volume?: string | undefined;
                        issue?: string | undefined;
                        page?: string | undefined;
                        "article-number"?: string | undefined;
                        edition?: string | undefined;
                        DOI?: string | undefined;
                        URL?: string | undefined;
                        ISBN?: string | undefined;
                        ISSN?: string | undefined;
                        PMID?: string | undefined;
                        PMCID?: string | undefined;
                        arXiv?: string | undefined;
                    };
                    imported?: {
                        format: "bibtex" | "ris";
                        unsupported: {
                            name: string;
                            value: string;
                        }[];
                        fields: {
                            type?: string | undefined;
                            author?: {
                                family?: string | undefined;
                                "non-dropping-particle"?: string | undefined;
                                given?: string | undefined;
                                literal?: string | undefined;
                            }[] | undefined;
                            issued?: {
                                literal: string;
                            } | undefined;
                            title?: string | undefined;
                            "container-title"?: string | undefined;
                            "container-title-short"?: string | undefined;
                            publisher?: string | undefined;
                            "publisher-place"?: string | undefined;
                            volume?: string | undefined;
                            issue?: string | undefined;
                            page?: string | undefined;
                            "article-number"?: string | undefined;
                            edition?: string | undefined;
                            DOI?: string | undefined;
                            URL?: string | undefined;
                            ISBN?: string | undefined;
                            ISSN?: string | undefined;
                            PMID?: string | undefined;
                            PMCID?: string | undefined;
                            arXiv?: string | undefined;
                        };
                    } | undefined;
                };
                provenance: "ai" | "parser" | "user";
                createdAt: string;
            }[];
            results: {
                id: string;
                revision: number;
                generation: number;
                createdAt: string;
                outcome: {
                    kind: "status";
                    status: "cancelled" | "failed" | "not-checked" | "running";
                } | {
                    kind: "verdict";
                    verdict: "correct" | "doi-conflict" | "exists-with-deviations" | "mixed-citation" | "not-found" | "not-verifiable";
                    scoringRules: {
                        version: string;
                        calibration: "uncalibrated";
                        unicode: string;
                        icu: string;
                        profile: Record<string, number>;
                    };
                    searchStrategyVersion: string;
                    searchConfiguration: Record<string, string | number>;
                    bestMatchId: string | null;
                    reference: {
                        originalText: string;
                        span: {
                            start: number;
                            end: number;
                        };
                        authorsTruncated?: boolean | undefined;
                        fieldSources: Record<string, {
                            raw: string;
                            span?: {
                                start: number;
                                end: number;
                            } | undefined;
                            normalized?: string | undefined;
                            provenance?: "ai" | "parser" | "user" | undefined;
                        }>;
                        structuring: {
                            path: "ai" | "parser" | "user";
                            version: string;
                        };
                        ai?: {
                            configuration: string;
                            notice: "ai-can-be-wrong";
                            proposals: {
                                field: string;
                                value: unknown;
                                reason: "ungrounded";
                            }[];
                            changedFields: string[];
                        } | undefined;
                        csl: {
                            type?: string | undefined;
                            author?: {
                                family?: string | undefined;
                                "non-dropping-particle"?: string | undefined;
                                given?: string | undefined;
                                literal?: string | undefined;
                            }[] | undefined;
                            issued?: {
                                literal: string;
                            } | undefined;
                            title?: string | undefined;
                            "container-title"?: string | undefined;
                            "container-title-short"?: string | undefined;
                            publisher?: string | undefined;
                            "publisher-place"?: string | undefined;
                            volume?: string | undefined;
                            issue?: string | undefined;
                            page?: string | undefined;
                            "article-number"?: string | undefined;
                            edition?: string | undefined;
                            DOI?: string | undefined;
                            URL?: string | undefined;
                            ISBN?: string | undefined;
                            ISSN?: string | undefined;
                            PMID?: string | undefined;
                            PMCID?: string | undefined;
                            arXiv?: string | undefined;
                        };
                        imported?: {
                            format: "bibtex" | "ris";
                            unsupported: {
                                name: string;
                                value: string;
                            }[];
                            fields: {
                                type?: string | undefined;
                                author?: {
                                    family?: string | undefined;
                                    "non-dropping-particle"?: string | undefined;
                                    given?: string | undefined;
                                    literal?: string | undefined;
                                }[] | undefined;
                                issued?: {
                                    literal: string;
                                } | undefined;
                                title?: string | undefined;
                                "container-title"?: string | undefined;
                                "container-title-short"?: string | undefined;
                                publisher?: string | undefined;
                                "publisher-place"?: string | undefined;
                                volume?: string | undefined;
                                issue?: string | undefined;
                                page?: string | undefined;
                                "article-number"?: string | undefined;
                                edition?: string | undefined;
                                DOI?: string | undefined;
                                URL?: string | undefined;
                                ISBN?: string | undefined;
                                ISSN?: string | undefined;
                                PMID?: string | undefined;
                                PMCID?: string | undefined;
                                arXiv?: string | undefined;
                            };
                        } | undefined;
                    };
                    identity: {
                        candidateId?: string | undefined;
                        kind: "independent-bibliography" | "supplied-doi" | "supplied-identifier" | "unresolved" | "web-archive" | "web-url";
                    };
                    candidates: {
                        id: string;
                        slot: number;
                        retrievedAt: string;
                        raw: unknown;
                        score: {
                            value: number;
                            fullAgreement: boolean;
                        } | null;
                        csl: {
                            type?: string | undefined;
                            author?: {
                                family?: string | undefined;
                                "non-dropping-particle"?: string | undefined;
                                given?: string | undefined;
                                literal?: string | undefined;
                            }[] | undefined;
                            issued?: {
                                literal: string;
                            } | undefined;
                            title?: string | undefined;
                            "container-title"?: string | undefined;
                            "container-title-short"?: string | undefined;
                            publisher?: string | undefined;
                            "publisher-place"?: string | undefined;
                            volume?: string | undefined;
                            issue?: string | undefined;
                            page?: string | undefined;
                            "article-number"?: string | undefined;
                            edition?: string | undefined;
                            DOI?: string | undefined;
                            URL?: string | undefined;
                            ISBN?: string | undefined;
                            ISSN?: string | undefined;
                            PMID?: string | undefined;
                            PMCID?: string | undefined;
                            arXiv?: string | undefined;
                        };
                        fields: {
                            field: string;
                            reference: unknown;
                            candidate: unknown;
                            score: {
                                value: number;
                                fullAgreement: boolean;
                            } | null;
                            reason: "compared" | "missing-candidate" | "missing-reference" | "not-determinable" | "resource-limit" | "unweighted";
                            agreement?: boolean | undefined;
                            journalAbbreviation?: {
                                outcome: "different" | "match" | "not-determinable";
                                reason: "attested-match" | "attested-other-journal" | "no-attestation";
                                attestations: {
                                    source: "crossref" | "europepmc" | "nlm" | "semanticscholar";
                                    role: "candidate" | "reference";
                                    journalTitle: string;
                                    abbreviation: string;
                                    nlmId?: string | undefined;
                                    snapshotDate?: string | undefined;
                                }[];
                            } | undefined;
                        }[];
                        source: "arxiv" | "crossref" | "europepmc" | "googlebooks" | "internetarchive" | "openalex" | "openlibrary" | "semanticscholar" | "url";
                        origin: "archive" | "arxiv" | "authors-year" | "combined" | "doi" | "isbn" | "pmcid" | "pmid" | "title" | "url";
                        identifiers?: string[] | undefined;
                        identityAmbiguous?: boolean | undefined;
                        retractionEvidence?: {
                            source: "crossref" | "europepmc" | "openalex";
                            candidateId: string;
                            observedAt: string;
                        } | undefined;
                    }[];
                    evidence: {
                        reason?: string | undefined;
                        status?: number | undefined;
                        durationMs: number;
                        attempts: number;
                        observedAt: string;
                        raw?: unknown;
                        source: "arxiv" | "crossref" | "doi.org" | "europepmc" | "googlebooks" | "internetarchive" | "openalex" | "openlibrary" | "semanticscholar" | "url";
                        operation: "archive" | "arxiv" | "authors-year" | "combined" | "doi" | "isbn" | "pmcid" | "pmid" | "title" | "url";
                        outcome: "candidate" | "disabled" | "exists" | "no-record" | "nonexistent" | "redirect" | "skipped" | "unavailable" | "unsupported";
                        web?: {
                            originalUrl: string;
                            finalUrl: string;
                            status: number;
                            title?: string | undefined;
                            redirectTarget?: string | undefined;
                            archiveUrl?: string | undefined;
                            timestamp?: string | undefined;
                        } | undefined;
                        skippedDuplicates?: string[] | undefined;
                        unusedSlots?: number | undefined;
                        identifierAmbiguity?: string[] | undefined;
                    }[];
                    reasons: ("ambiguous-identity" | "development-route-incomplete" | "doi-nonexistent" | "fields-differ" | "foreign-doi" | "identified" | "identity-unresolved" | "insufficient-search" | "mandatory-resolution-incomplete" | "metadata-unavailable" | "mixed-components" | "outside-coverage" | "search-completed" | "sources-unavailable" | "url-unavailable" | "url-verification-incomplete" | "web-original-unavailable")[];
                    failedSources: ("arxiv" | "crossref" | "doi.org" | "europepmc" | "googlebooks" | "internetarchive" | "openalex" | "openlibrary" | "semanticscholar" | "url")[];
                    retraction: "retracted" | "unknown";
                    retractionEvidence?: {
                        source: "crossref" | "europepmc" | "openalex";
                        candidateId: string;
                        observedAt: string;
                    }[] | undefined;
                };
                manualOverride: {
                    id: string;
                    resultId: string;
                    verdict: "correct" | "doi-conflict" | "exists-with-deviations" | "mixed-citation" | "not-found" | "not-verifiable";
                    createdAt: string;
                } | null;
            }[];
            manualOverride: {
                id: string;
                resultId: string;
                verdict: "correct" | "doi-conflict" | "exists-with-deviations" | "mixed-citation" | "not-found" | "not-verifiable";
                createdAt: string;
            } | null;
            manualOverrideReset: boolean;
            quotaEffect: "free-recheck" | "new-work";
            outcome: {
                kind: "status";
                status: "cancelled" | "failed" | "not-checked" | "running";
            } | {
                kind: "verdict";
                verdict: "correct" | "doi-conflict" | "exists-with-deviations" | "mixed-citation" | "not-found" | "not-verifiable";
                scoringRules: {
                    version: string;
                    calibration: "uncalibrated";
                    unicode: string;
                    icu: string;
                    profile: Record<string, number>;
                };
                searchStrategyVersion: string;
                searchConfiguration: Record<string, string | number>;
                bestMatchId: string | null;
                reference: {
                    originalText: string;
                    span: {
                        start: number;
                        end: number;
                    };
                    authorsTruncated?: boolean | undefined;
                    fieldSources: Record<string, {
                        raw: string;
                        span?: {
                            start: number;
                            end: number;
                        } | undefined;
                        normalized?: string | undefined;
                        provenance?: "ai" | "parser" | "user" | undefined;
                    }>;
                    structuring: {
                        path: "ai" | "parser" | "user";
                        version: string;
                    };
                    ai?: {
                        configuration: string;
                        notice: "ai-can-be-wrong";
                        proposals: {
                            field: string;
                            value: unknown;
                            reason: "ungrounded";
                        }[];
                        changedFields: string[];
                    } | undefined;
                    csl: {
                        type?: string | undefined;
                        author?: {
                            family?: string | undefined;
                            "non-dropping-particle"?: string | undefined;
                            given?: string | undefined;
                            literal?: string | undefined;
                        }[] | undefined;
                        issued?: {
                            literal: string;
                        } | undefined;
                        title?: string | undefined;
                        "container-title"?: string | undefined;
                        "container-title-short"?: string | undefined;
                        publisher?: string | undefined;
                        "publisher-place"?: string | undefined;
                        volume?: string | undefined;
                        issue?: string | undefined;
                        page?: string | undefined;
                        "article-number"?: string | undefined;
                        edition?: string | undefined;
                        DOI?: string | undefined;
                        URL?: string | undefined;
                        ISBN?: string | undefined;
                        ISSN?: string | undefined;
                        PMID?: string | undefined;
                        PMCID?: string | undefined;
                        arXiv?: string | undefined;
                    };
                    imported?: {
                        format: "bibtex" | "ris";
                        unsupported: {
                            name: string;
                            value: string;
                        }[];
                        fields: {
                            type?: string | undefined;
                            author?: {
                                family?: string | undefined;
                                "non-dropping-particle"?: string | undefined;
                                given?: string | undefined;
                                literal?: string | undefined;
                            }[] | undefined;
                            issued?: {
                                literal: string;
                            } | undefined;
                            title?: string | undefined;
                            "container-title"?: string | undefined;
                            "container-title-short"?: string | undefined;
                            publisher?: string | undefined;
                            "publisher-place"?: string | undefined;
                            volume?: string | undefined;
                            issue?: string | undefined;
                            page?: string | undefined;
                            "article-number"?: string | undefined;
                            edition?: string | undefined;
                            DOI?: string | undefined;
                            URL?: string | undefined;
                            ISBN?: string | undefined;
                            ISSN?: string | undefined;
                            PMID?: string | undefined;
                            PMCID?: string | undefined;
                            arXiv?: string | undefined;
                        };
                    } | undefined;
                };
                identity: {
                    candidateId?: string | undefined;
                    kind: "independent-bibliography" | "supplied-doi" | "supplied-identifier" | "unresolved" | "web-archive" | "web-url";
                };
                candidates: {
                    id: string;
                    slot: number;
                    retrievedAt: string;
                    raw: unknown;
                    score: {
                        value: number;
                        fullAgreement: boolean;
                    } | null;
                    csl: {
                        type?: string | undefined;
                        author?: {
                            family?: string | undefined;
                            "non-dropping-particle"?: string | undefined;
                            given?: string | undefined;
                            literal?: string | undefined;
                        }[] | undefined;
                        issued?: {
                            literal: string;
                        } | undefined;
                        title?: string | undefined;
                        "container-title"?: string | undefined;
                        "container-title-short"?: string | undefined;
                        publisher?: string | undefined;
                        "publisher-place"?: string | undefined;
                        volume?: string | undefined;
                        issue?: string | undefined;
                        page?: string | undefined;
                        "article-number"?: string | undefined;
                        edition?: string | undefined;
                        DOI?: string | undefined;
                        URL?: string | undefined;
                        ISBN?: string | undefined;
                        ISSN?: string | undefined;
                        PMID?: string | undefined;
                        PMCID?: string | undefined;
                        arXiv?: string | undefined;
                    };
                    fields: {
                        field: string;
                        reference: unknown;
                        candidate: unknown;
                        score: {
                            value: number;
                            fullAgreement: boolean;
                        } | null;
                        reason: "compared" | "missing-candidate" | "missing-reference" | "not-determinable" | "resource-limit" | "unweighted";
                        agreement?: boolean | undefined;
                        journalAbbreviation?: {
                            outcome: "different" | "match" | "not-determinable";
                            reason: "attested-match" | "attested-other-journal" | "no-attestation";
                            attestations: {
                                source: "crossref" | "europepmc" | "nlm" | "semanticscholar";
                                role: "candidate" | "reference";
                                journalTitle: string;
                                abbreviation: string;
                                nlmId?: string | undefined;
                                snapshotDate?: string | undefined;
                            }[];
                        } | undefined;
                    }[];
                    source: "arxiv" | "crossref" | "europepmc" | "googlebooks" | "internetarchive" | "openalex" | "openlibrary" | "semanticscholar" | "url";
                    origin: "archive" | "arxiv" | "authors-year" | "combined" | "doi" | "isbn" | "pmcid" | "pmid" | "title" | "url";
                    identifiers?: string[] | undefined;
                    identityAmbiguous?: boolean | undefined;
                    retractionEvidence?: {
                        source: "crossref" | "europepmc" | "openalex";
                        candidateId: string;
                        observedAt: string;
                    } | undefined;
                }[];
                evidence: {
                    reason?: string | undefined;
                    status?: number | undefined;
                    durationMs: number;
                    attempts: number;
                    observedAt: string;
                    raw?: unknown;
                    source: "arxiv" | "crossref" | "doi.org" | "europepmc" | "googlebooks" | "internetarchive" | "openalex" | "openlibrary" | "semanticscholar" | "url";
                    operation: "archive" | "arxiv" | "authors-year" | "combined" | "doi" | "isbn" | "pmcid" | "pmid" | "title" | "url";
                    outcome: "candidate" | "disabled" | "exists" | "no-record" | "nonexistent" | "redirect" | "skipped" | "unavailable" | "unsupported";
                    web?: {
                        originalUrl: string;
                        finalUrl: string;
                        status: number;
                        title?: string | undefined;
                        redirectTarget?: string | undefined;
                        archiveUrl?: string | undefined;
                        timestamp?: string | undefined;
                    } | undefined;
                    skippedDuplicates?: string[] | undefined;
                    unusedSlots?: number | undefined;
                    identifierAmbiguity?: string[] | undefined;
                }[];
                reasons: ("ambiguous-identity" | "development-route-incomplete" | "doi-nonexistent" | "fields-differ" | "foreign-doi" | "identified" | "identity-unresolved" | "insufficient-search" | "mandatory-resolution-incomplete" | "metadata-unavailable" | "mixed-components" | "outside-coverage" | "search-completed" | "sources-unavailable" | "url-unavailable" | "url-verification-incomplete" | "web-original-unavailable")[];
                failedSources: ("arxiv" | "crossref" | "doi.org" | "europepmc" | "googlebooks" | "internetarchive" | "openalex" | "openlibrary" | "semanticscholar" | "url")[];
                retraction: "retracted" | "unknown";
                retractionEvidence?: {
                    source: "crossref" | "europepmc" | "openalex";
                    candidateId: string;
                    observedAt: string;
                }[] | undefined;
            };
            progress: "arxiv" | "checking" | "crossref" | "doi.org" | "ended" | "europepmc" | "googlebooks" | "internetarchive" | "openalex" | "openlibrary" | "queued" | "semanticscholar" | "url";
        }[];
    }>;
    renewCheckLease: (checkId: string) => Promise<{
        id: string;
        state: "ended" | "running";
        lastEventSeq: number;
        lastEventCursor: string;
        leaseRenewAfterMs: number;
        endReason: "cancelled" | "completed" | "lease-expired" | null;
        document?: {
            text: string;
            selection: {
                version: string;
                regions: {
                    start: number;
                    end: number;
                }[];
            };
        } | null | undefined;
        references: {
            slot: number;
            originalText: string;
            revision: number;
            fields: {
                type?: string | undefined;
                author?: {
                    family?: string | undefined;
                    "non-dropping-particle"?: string | undefined;
                    given?: string | undefined;
                    literal?: string | undefined;
                }[] | undefined;
                issued?: {
                    literal: string;
                } | undefined;
                title?: string | undefined;
                "container-title"?: string | undefined;
                "container-title-short"?: string | undefined;
                publisher?: string | undefined;
                "publisher-place"?: string | undefined;
                volume?: string | undefined;
                issue?: string | undefined;
                page?: string | undefined;
                "article-number"?: string | undefined;
                edition?: string | undefined;
                DOI?: string | undefined;
                URL?: string | undefined;
                ISBN?: string | undefined;
                ISSN?: string | undefined;
                PMID?: string | undefined;
                PMCID?: string | undefined;
                arXiv?: string | undefined;
            };
            authorsTruncated?: boolean | undefined;
            revisions: {
                revision: number;
                reference: {
                    originalText: string;
                    span: {
                        start: number;
                        end: number;
                    };
                    authorsTruncated?: boolean | undefined;
                    fieldSources: Record<string, {
                        raw: string;
                        span?: {
                            start: number;
                            end: number;
                        } | undefined;
                        normalized?: string | undefined;
                        provenance?: "ai" | "parser" | "user" | undefined;
                    }>;
                    structuring: {
                        path: "ai" | "parser" | "user";
                        version: string;
                    };
                    ai?: {
                        configuration: string;
                        notice: "ai-can-be-wrong";
                        proposals: {
                            field: string;
                            value: unknown;
                            reason: "ungrounded";
                        }[];
                        changedFields: string[];
                    } | undefined;
                    csl: {
                        type?: string | undefined;
                        author?: {
                            family?: string | undefined;
                            "non-dropping-particle"?: string | undefined;
                            given?: string | undefined;
                            literal?: string | undefined;
                        }[] | undefined;
                        issued?: {
                            literal: string;
                        } | undefined;
                        title?: string | undefined;
                        "container-title"?: string | undefined;
                        "container-title-short"?: string | undefined;
                        publisher?: string | undefined;
                        "publisher-place"?: string | undefined;
                        volume?: string | undefined;
                        issue?: string | undefined;
                        page?: string | undefined;
                        "article-number"?: string | undefined;
                        edition?: string | undefined;
                        DOI?: string | undefined;
                        URL?: string | undefined;
                        ISBN?: string | undefined;
                        ISSN?: string | undefined;
                        PMID?: string | undefined;
                        PMCID?: string | undefined;
                        arXiv?: string | undefined;
                    };
                    imported?: {
                        format: "bibtex" | "ris";
                        unsupported: {
                            name: string;
                            value: string;
                        }[];
                        fields: {
                            type?: string | undefined;
                            author?: {
                                family?: string | undefined;
                                "non-dropping-particle"?: string | undefined;
                                given?: string | undefined;
                                literal?: string | undefined;
                            }[] | undefined;
                            issued?: {
                                literal: string;
                            } | undefined;
                            title?: string | undefined;
                            "container-title"?: string | undefined;
                            "container-title-short"?: string | undefined;
                            publisher?: string | undefined;
                            "publisher-place"?: string | undefined;
                            volume?: string | undefined;
                            issue?: string | undefined;
                            page?: string | undefined;
                            "article-number"?: string | undefined;
                            edition?: string | undefined;
                            DOI?: string | undefined;
                            URL?: string | undefined;
                            ISBN?: string | undefined;
                            ISSN?: string | undefined;
                            PMID?: string | undefined;
                            PMCID?: string | undefined;
                            arXiv?: string | undefined;
                        };
                    } | undefined;
                };
                provenance: "ai" | "parser" | "user";
                createdAt: string;
            }[];
            results: {
                id: string;
                revision: number;
                generation: number;
                createdAt: string;
                outcome: {
                    kind: "status";
                    status: "cancelled" | "failed" | "not-checked" | "running";
                } | {
                    kind: "verdict";
                    verdict: "correct" | "doi-conflict" | "exists-with-deviations" | "mixed-citation" | "not-found" | "not-verifiable";
                    scoringRules: {
                        version: string;
                        calibration: "uncalibrated";
                        unicode: string;
                        icu: string;
                        profile: Record<string, number>;
                    };
                    searchStrategyVersion: string;
                    searchConfiguration: Record<string, string | number>;
                    bestMatchId: string | null;
                    reference: {
                        originalText: string;
                        span: {
                            start: number;
                            end: number;
                        };
                        authorsTruncated?: boolean | undefined;
                        fieldSources: Record<string, {
                            raw: string;
                            span?: {
                                start: number;
                                end: number;
                            } | undefined;
                            normalized?: string | undefined;
                            provenance?: "ai" | "parser" | "user" | undefined;
                        }>;
                        structuring: {
                            path: "ai" | "parser" | "user";
                            version: string;
                        };
                        ai?: {
                            configuration: string;
                            notice: "ai-can-be-wrong";
                            proposals: {
                                field: string;
                                value: unknown;
                                reason: "ungrounded";
                            }[];
                            changedFields: string[];
                        } | undefined;
                        csl: {
                            type?: string | undefined;
                            author?: {
                                family?: string | undefined;
                                "non-dropping-particle"?: string | undefined;
                                given?: string | undefined;
                                literal?: string | undefined;
                            }[] | undefined;
                            issued?: {
                                literal: string;
                            } | undefined;
                            title?: string | undefined;
                            "container-title"?: string | undefined;
                            "container-title-short"?: string | undefined;
                            publisher?: string | undefined;
                            "publisher-place"?: string | undefined;
                            volume?: string | undefined;
                            issue?: string | undefined;
                            page?: string | undefined;
                            "article-number"?: string | undefined;
                            edition?: string | undefined;
                            DOI?: string | undefined;
                            URL?: string | undefined;
                            ISBN?: string | undefined;
                            ISSN?: string | undefined;
                            PMID?: string | undefined;
                            PMCID?: string | undefined;
                            arXiv?: string | undefined;
                        };
                        imported?: {
                            format: "bibtex" | "ris";
                            unsupported: {
                                name: string;
                                value: string;
                            }[];
                            fields: {
                                type?: string | undefined;
                                author?: {
                                    family?: string | undefined;
                                    "non-dropping-particle"?: string | undefined;
                                    given?: string | undefined;
                                    literal?: string | undefined;
                                }[] | undefined;
                                issued?: {
                                    literal: string;
                                } | undefined;
                                title?: string | undefined;
                                "container-title"?: string | undefined;
                                "container-title-short"?: string | undefined;
                                publisher?: string | undefined;
                                "publisher-place"?: string | undefined;
                                volume?: string | undefined;
                                issue?: string | undefined;
                                page?: string | undefined;
                                "article-number"?: string | undefined;
                                edition?: string | undefined;
                                DOI?: string | undefined;
                                URL?: string | undefined;
                                ISBN?: string | undefined;
                                ISSN?: string | undefined;
                                PMID?: string | undefined;
                                PMCID?: string | undefined;
                                arXiv?: string | undefined;
                            };
                        } | undefined;
                    };
                    identity: {
                        candidateId?: string | undefined;
                        kind: "independent-bibliography" | "supplied-doi" | "supplied-identifier" | "unresolved" | "web-archive" | "web-url";
                    };
                    candidates: {
                        id: string;
                        slot: number;
                        retrievedAt: string;
                        raw: unknown;
                        score: {
                            value: number;
                            fullAgreement: boolean;
                        } | null;
                        csl: {
                            type?: string | undefined;
                            author?: {
                                family?: string | undefined;
                                "non-dropping-particle"?: string | undefined;
                                given?: string | undefined;
                                literal?: string | undefined;
                            }[] | undefined;
                            issued?: {
                                literal: string;
                            } | undefined;
                            title?: string | undefined;
                            "container-title"?: string | undefined;
                            "container-title-short"?: string | undefined;
                            publisher?: string | undefined;
                            "publisher-place"?: string | undefined;
                            volume?: string | undefined;
                            issue?: string | undefined;
                            page?: string | undefined;
                            "article-number"?: string | undefined;
                            edition?: string | undefined;
                            DOI?: string | undefined;
                            URL?: string | undefined;
                            ISBN?: string | undefined;
                            ISSN?: string | undefined;
                            PMID?: string | undefined;
                            PMCID?: string | undefined;
                            arXiv?: string | undefined;
                        };
                        fields: {
                            field: string;
                            reference: unknown;
                            candidate: unknown;
                            score: {
                                value: number;
                                fullAgreement: boolean;
                            } | null;
                            reason: "compared" | "missing-candidate" | "missing-reference" | "not-determinable" | "resource-limit" | "unweighted";
                            agreement?: boolean | undefined;
                            journalAbbreviation?: {
                                outcome: "different" | "match" | "not-determinable";
                                reason: "attested-match" | "attested-other-journal" | "no-attestation";
                                attestations: {
                                    source: "crossref" | "europepmc" | "nlm" | "semanticscholar";
                                    role: "candidate" | "reference";
                                    journalTitle: string;
                                    abbreviation: string;
                                    nlmId?: string | undefined;
                                    snapshotDate?: string | undefined;
                                }[];
                            } | undefined;
                        }[];
                        source: "arxiv" | "crossref" | "europepmc" | "googlebooks" | "internetarchive" | "openalex" | "openlibrary" | "semanticscholar" | "url";
                        origin: "archive" | "arxiv" | "authors-year" | "combined" | "doi" | "isbn" | "pmcid" | "pmid" | "title" | "url";
                        identifiers?: string[] | undefined;
                        identityAmbiguous?: boolean | undefined;
                        retractionEvidence?: {
                            source: "crossref" | "europepmc" | "openalex";
                            candidateId: string;
                            observedAt: string;
                        } | undefined;
                    }[];
                    evidence: {
                        reason?: string | undefined;
                        status?: number | undefined;
                        durationMs: number;
                        attempts: number;
                        observedAt: string;
                        raw?: unknown;
                        source: "arxiv" | "crossref" | "doi.org" | "europepmc" | "googlebooks" | "internetarchive" | "openalex" | "openlibrary" | "semanticscholar" | "url";
                        operation: "archive" | "arxiv" | "authors-year" | "combined" | "doi" | "isbn" | "pmcid" | "pmid" | "title" | "url";
                        outcome: "candidate" | "disabled" | "exists" | "no-record" | "nonexistent" | "redirect" | "skipped" | "unavailable" | "unsupported";
                        web?: {
                            originalUrl: string;
                            finalUrl: string;
                            status: number;
                            title?: string | undefined;
                            redirectTarget?: string | undefined;
                            archiveUrl?: string | undefined;
                            timestamp?: string | undefined;
                        } | undefined;
                        skippedDuplicates?: string[] | undefined;
                        unusedSlots?: number | undefined;
                        identifierAmbiguity?: string[] | undefined;
                    }[];
                    reasons: ("ambiguous-identity" | "development-route-incomplete" | "doi-nonexistent" | "fields-differ" | "foreign-doi" | "identified" | "identity-unresolved" | "insufficient-search" | "mandatory-resolution-incomplete" | "metadata-unavailable" | "mixed-components" | "outside-coverage" | "search-completed" | "sources-unavailable" | "url-unavailable" | "url-verification-incomplete" | "web-original-unavailable")[];
                    failedSources: ("arxiv" | "crossref" | "doi.org" | "europepmc" | "googlebooks" | "internetarchive" | "openalex" | "openlibrary" | "semanticscholar" | "url")[];
                    retraction: "retracted" | "unknown";
                    retractionEvidence?: {
                        source: "crossref" | "europepmc" | "openalex";
                        candidateId: string;
                        observedAt: string;
                    }[] | undefined;
                };
                manualOverride: {
                    id: string;
                    resultId: string;
                    verdict: "correct" | "doi-conflict" | "exists-with-deviations" | "mixed-citation" | "not-found" | "not-verifiable";
                    createdAt: string;
                } | null;
            }[];
            manualOverride: {
                id: string;
                resultId: string;
                verdict: "correct" | "doi-conflict" | "exists-with-deviations" | "mixed-citation" | "not-found" | "not-verifiable";
                createdAt: string;
            } | null;
            manualOverrideReset: boolean;
            quotaEffect: "free-recheck" | "new-work";
            outcome: {
                kind: "status";
                status: "cancelled" | "failed" | "not-checked" | "running";
            } | {
                kind: "verdict";
                verdict: "correct" | "doi-conflict" | "exists-with-deviations" | "mixed-citation" | "not-found" | "not-verifiable";
                scoringRules: {
                    version: string;
                    calibration: "uncalibrated";
                    unicode: string;
                    icu: string;
                    profile: Record<string, number>;
                };
                searchStrategyVersion: string;
                searchConfiguration: Record<string, string | number>;
                bestMatchId: string | null;
                reference: {
                    originalText: string;
                    span: {
                        start: number;
                        end: number;
                    };
                    authorsTruncated?: boolean | undefined;
                    fieldSources: Record<string, {
                        raw: string;
                        span?: {
                            start: number;
                            end: number;
                        } | undefined;
                        normalized?: string | undefined;
                        provenance?: "ai" | "parser" | "user" | undefined;
                    }>;
                    structuring: {
                        path: "ai" | "parser" | "user";
                        version: string;
                    };
                    ai?: {
                        configuration: string;
                        notice: "ai-can-be-wrong";
                        proposals: {
                            field: string;
                            value: unknown;
                            reason: "ungrounded";
                        }[];
                        changedFields: string[];
                    } | undefined;
                    csl: {
                        type?: string | undefined;
                        author?: {
                            family?: string | undefined;
                            "non-dropping-particle"?: string | undefined;
                            given?: string | undefined;
                            literal?: string | undefined;
                        }[] | undefined;
                        issued?: {
                            literal: string;
                        } | undefined;
                        title?: string | undefined;
                        "container-title"?: string | undefined;
                        "container-title-short"?: string | undefined;
                        publisher?: string | undefined;
                        "publisher-place"?: string | undefined;
                        volume?: string | undefined;
                        issue?: string | undefined;
                        page?: string | undefined;
                        "article-number"?: string | undefined;
                        edition?: string | undefined;
                        DOI?: string | undefined;
                        URL?: string | undefined;
                        ISBN?: string | undefined;
                        ISSN?: string | undefined;
                        PMID?: string | undefined;
                        PMCID?: string | undefined;
                        arXiv?: string | undefined;
                    };
                    imported?: {
                        format: "bibtex" | "ris";
                        unsupported: {
                            name: string;
                            value: string;
                        }[];
                        fields: {
                            type?: string | undefined;
                            author?: {
                                family?: string | undefined;
                                "non-dropping-particle"?: string | undefined;
                                given?: string | undefined;
                                literal?: string | undefined;
                            }[] | undefined;
                            issued?: {
                                literal: string;
                            } | undefined;
                            title?: string | undefined;
                            "container-title"?: string | undefined;
                            "container-title-short"?: string | undefined;
                            publisher?: string | undefined;
                            "publisher-place"?: string | undefined;
                            volume?: string | undefined;
                            issue?: string | undefined;
                            page?: string | undefined;
                            "article-number"?: string | undefined;
                            edition?: string | undefined;
                            DOI?: string | undefined;
                            URL?: string | undefined;
                            ISBN?: string | undefined;
                            ISSN?: string | undefined;
                            PMID?: string | undefined;
                            PMCID?: string | undefined;
                            arXiv?: string | undefined;
                        };
                    } | undefined;
                };
                identity: {
                    candidateId?: string | undefined;
                    kind: "independent-bibliography" | "supplied-doi" | "supplied-identifier" | "unresolved" | "web-archive" | "web-url";
                };
                candidates: {
                    id: string;
                    slot: number;
                    retrievedAt: string;
                    raw: unknown;
                    score: {
                        value: number;
                        fullAgreement: boolean;
                    } | null;
                    csl: {
                        type?: string | undefined;
                        author?: {
                            family?: string | undefined;
                            "non-dropping-particle"?: string | undefined;
                            given?: string | undefined;
                            literal?: string | undefined;
                        }[] | undefined;
                        issued?: {
                            literal: string;
                        } | undefined;
                        title?: string | undefined;
                        "container-title"?: string | undefined;
                        "container-title-short"?: string | undefined;
                        publisher?: string | undefined;
                        "publisher-place"?: string | undefined;
                        volume?: string | undefined;
                        issue?: string | undefined;
                        page?: string | undefined;
                        "article-number"?: string | undefined;
                        edition?: string | undefined;
                        DOI?: string | undefined;
                        URL?: string | undefined;
                        ISBN?: string | undefined;
                        ISSN?: string | undefined;
                        PMID?: string | undefined;
                        PMCID?: string | undefined;
                        arXiv?: string | undefined;
                    };
                    fields: {
                        field: string;
                        reference: unknown;
                        candidate: unknown;
                        score: {
                            value: number;
                            fullAgreement: boolean;
                        } | null;
                        reason: "compared" | "missing-candidate" | "missing-reference" | "not-determinable" | "resource-limit" | "unweighted";
                        agreement?: boolean | undefined;
                        journalAbbreviation?: {
                            outcome: "different" | "match" | "not-determinable";
                            reason: "attested-match" | "attested-other-journal" | "no-attestation";
                            attestations: {
                                source: "crossref" | "europepmc" | "nlm" | "semanticscholar";
                                role: "candidate" | "reference";
                                journalTitle: string;
                                abbreviation: string;
                                nlmId?: string | undefined;
                                snapshotDate?: string | undefined;
                            }[];
                        } | undefined;
                    }[];
                    source: "arxiv" | "crossref" | "europepmc" | "googlebooks" | "internetarchive" | "openalex" | "openlibrary" | "semanticscholar" | "url";
                    origin: "archive" | "arxiv" | "authors-year" | "combined" | "doi" | "isbn" | "pmcid" | "pmid" | "title" | "url";
                    identifiers?: string[] | undefined;
                    identityAmbiguous?: boolean | undefined;
                    retractionEvidence?: {
                        source: "crossref" | "europepmc" | "openalex";
                        candidateId: string;
                        observedAt: string;
                    } | undefined;
                }[];
                evidence: {
                    reason?: string | undefined;
                    status?: number | undefined;
                    durationMs: number;
                    attempts: number;
                    observedAt: string;
                    raw?: unknown;
                    source: "arxiv" | "crossref" | "doi.org" | "europepmc" | "googlebooks" | "internetarchive" | "openalex" | "openlibrary" | "semanticscholar" | "url";
                    operation: "archive" | "arxiv" | "authors-year" | "combined" | "doi" | "isbn" | "pmcid" | "pmid" | "title" | "url";
                    outcome: "candidate" | "disabled" | "exists" | "no-record" | "nonexistent" | "redirect" | "skipped" | "unavailable" | "unsupported";
                    web?: {
                        originalUrl: string;
                        finalUrl: string;
                        status: number;
                        title?: string | undefined;
                        redirectTarget?: string | undefined;
                        archiveUrl?: string | undefined;
                        timestamp?: string | undefined;
                    } | undefined;
                    skippedDuplicates?: string[] | undefined;
                    unusedSlots?: number | undefined;
                    identifierAmbiguity?: string[] | undefined;
                }[];
                reasons: ("ambiguous-identity" | "development-route-incomplete" | "doi-nonexistent" | "fields-differ" | "foreign-doi" | "identified" | "identity-unresolved" | "insufficient-search" | "mandatory-resolution-incomplete" | "metadata-unavailable" | "mixed-components" | "outside-coverage" | "search-completed" | "sources-unavailable" | "url-unavailable" | "url-verification-incomplete" | "web-original-unavailable")[];
                failedSources: ("arxiv" | "crossref" | "doi.org" | "europepmc" | "googlebooks" | "internetarchive" | "openalex" | "openlibrary" | "semanticscholar" | "url")[];
                retraction: "retracted" | "unknown";
                retractionEvidence?: {
                    source: "crossref" | "europepmc" | "openalex";
                    candidateId: string;
                    observedAt: string;
                }[] | undefined;
            };
            progress: "arxiv" | "checking" | "crossref" | "doi.org" | "ended" | "europepmc" | "googlebooks" | "internetarchive" | "openalex" | "openlibrary" | "queued" | "semanticscholar" | "url";
        }[];
    }>;
    getCheck: (checkId: string) => Promise<{
        id: string;
        state: "ended" | "running";
        lastEventSeq: number;
        lastEventCursor: string;
        leaseRenewAfterMs: number;
        endReason: "cancelled" | "completed" | "lease-expired" | null;
        document?: {
            text: string;
            selection: {
                version: string;
                regions: {
                    start: number;
                    end: number;
                }[];
            };
        } | null | undefined;
        references: {
            slot: number;
            originalText: string;
            revision: number;
            fields: {
                type?: string | undefined;
                author?: {
                    family?: string | undefined;
                    "non-dropping-particle"?: string | undefined;
                    given?: string | undefined;
                    literal?: string | undefined;
                }[] | undefined;
                issued?: {
                    literal: string;
                } | undefined;
                title?: string | undefined;
                "container-title"?: string | undefined;
                "container-title-short"?: string | undefined;
                publisher?: string | undefined;
                "publisher-place"?: string | undefined;
                volume?: string | undefined;
                issue?: string | undefined;
                page?: string | undefined;
                "article-number"?: string | undefined;
                edition?: string | undefined;
                DOI?: string | undefined;
                URL?: string | undefined;
                ISBN?: string | undefined;
                ISSN?: string | undefined;
                PMID?: string | undefined;
                PMCID?: string | undefined;
                arXiv?: string | undefined;
            };
            authorsTruncated?: boolean | undefined;
            revisions: {
                revision: number;
                reference: {
                    originalText: string;
                    span: {
                        start: number;
                        end: number;
                    };
                    authorsTruncated?: boolean | undefined;
                    fieldSources: Record<string, {
                        raw: string;
                        span?: {
                            start: number;
                            end: number;
                        } | undefined;
                        normalized?: string | undefined;
                        provenance?: "ai" | "parser" | "user" | undefined;
                    }>;
                    structuring: {
                        path: "ai" | "parser" | "user";
                        version: string;
                    };
                    ai?: {
                        configuration: string;
                        notice: "ai-can-be-wrong";
                        proposals: {
                            field: string;
                            value: unknown;
                            reason: "ungrounded";
                        }[];
                        changedFields: string[];
                    } | undefined;
                    csl: {
                        type?: string | undefined;
                        author?: {
                            family?: string | undefined;
                            "non-dropping-particle"?: string | undefined;
                            given?: string | undefined;
                            literal?: string | undefined;
                        }[] | undefined;
                        issued?: {
                            literal: string;
                        } | undefined;
                        title?: string | undefined;
                        "container-title"?: string | undefined;
                        "container-title-short"?: string | undefined;
                        publisher?: string | undefined;
                        "publisher-place"?: string | undefined;
                        volume?: string | undefined;
                        issue?: string | undefined;
                        page?: string | undefined;
                        "article-number"?: string | undefined;
                        edition?: string | undefined;
                        DOI?: string | undefined;
                        URL?: string | undefined;
                        ISBN?: string | undefined;
                        ISSN?: string | undefined;
                        PMID?: string | undefined;
                        PMCID?: string | undefined;
                        arXiv?: string | undefined;
                    };
                    imported?: {
                        format: "bibtex" | "ris";
                        unsupported: {
                            name: string;
                            value: string;
                        }[];
                        fields: {
                            type?: string | undefined;
                            author?: {
                                family?: string | undefined;
                                "non-dropping-particle"?: string | undefined;
                                given?: string | undefined;
                                literal?: string | undefined;
                            }[] | undefined;
                            issued?: {
                                literal: string;
                            } | undefined;
                            title?: string | undefined;
                            "container-title"?: string | undefined;
                            "container-title-short"?: string | undefined;
                            publisher?: string | undefined;
                            "publisher-place"?: string | undefined;
                            volume?: string | undefined;
                            issue?: string | undefined;
                            page?: string | undefined;
                            "article-number"?: string | undefined;
                            edition?: string | undefined;
                            DOI?: string | undefined;
                            URL?: string | undefined;
                            ISBN?: string | undefined;
                            ISSN?: string | undefined;
                            PMID?: string | undefined;
                            PMCID?: string | undefined;
                            arXiv?: string | undefined;
                        };
                    } | undefined;
                };
                provenance: "ai" | "parser" | "user";
                createdAt: string;
            }[];
            results: {
                id: string;
                revision: number;
                generation: number;
                createdAt: string;
                outcome: {
                    kind: "status";
                    status: "cancelled" | "failed" | "not-checked" | "running";
                } | {
                    kind: "verdict";
                    verdict: "correct" | "doi-conflict" | "exists-with-deviations" | "mixed-citation" | "not-found" | "not-verifiable";
                    scoringRules: {
                        version: string;
                        calibration: "uncalibrated";
                        unicode: string;
                        icu: string;
                        profile: Record<string, number>;
                    };
                    searchStrategyVersion: string;
                    searchConfiguration: Record<string, string | number>;
                    bestMatchId: string | null;
                    reference: {
                        originalText: string;
                        span: {
                            start: number;
                            end: number;
                        };
                        authorsTruncated?: boolean | undefined;
                        fieldSources: Record<string, {
                            raw: string;
                            span?: {
                                start: number;
                                end: number;
                            } | undefined;
                            normalized?: string | undefined;
                            provenance?: "ai" | "parser" | "user" | undefined;
                        }>;
                        structuring: {
                            path: "ai" | "parser" | "user";
                            version: string;
                        };
                        ai?: {
                            configuration: string;
                            notice: "ai-can-be-wrong";
                            proposals: {
                                field: string;
                                value: unknown;
                                reason: "ungrounded";
                            }[];
                            changedFields: string[];
                        } | undefined;
                        csl: {
                            type?: string | undefined;
                            author?: {
                                family?: string | undefined;
                                "non-dropping-particle"?: string | undefined;
                                given?: string | undefined;
                                literal?: string | undefined;
                            }[] | undefined;
                            issued?: {
                                literal: string;
                            } | undefined;
                            title?: string | undefined;
                            "container-title"?: string | undefined;
                            "container-title-short"?: string | undefined;
                            publisher?: string | undefined;
                            "publisher-place"?: string | undefined;
                            volume?: string | undefined;
                            issue?: string | undefined;
                            page?: string | undefined;
                            "article-number"?: string | undefined;
                            edition?: string | undefined;
                            DOI?: string | undefined;
                            URL?: string | undefined;
                            ISBN?: string | undefined;
                            ISSN?: string | undefined;
                            PMID?: string | undefined;
                            PMCID?: string | undefined;
                            arXiv?: string | undefined;
                        };
                        imported?: {
                            format: "bibtex" | "ris";
                            unsupported: {
                                name: string;
                                value: string;
                            }[];
                            fields: {
                                type?: string | undefined;
                                author?: {
                                    family?: string | undefined;
                                    "non-dropping-particle"?: string | undefined;
                                    given?: string | undefined;
                                    literal?: string | undefined;
                                }[] | undefined;
                                issued?: {
                                    literal: string;
                                } | undefined;
                                title?: string | undefined;
                                "container-title"?: string | undefined;
                                "container-title-short"?: string | undefined;
                                publisher?: string | undefined;
                                "publisher-place"?: string | undefined;
                                volume?: string | undefined;
                                issue?: string | undefined;
                                page?: string | undefined;
                                "article-number"?: string | undefined;
                                edition?: string | undefined;
                                DOI?: string | undefined;
                                URL?: string | undefined;
                                ISBN?: string | undefined;
                                ISSN?: string | undefined;
                                PMID?: string | undefined;
                                PMCID?: string | undefined;
                                arXiv?: string | undefined;
                            };
                        } | undefined;
                    };
                    identity: {
                        candidateId?: string | undefined;
                        kind: "independent-bibliography" | "supplied-doi" | "supplied-identifier" | "unresolved" | "web-archive" | "web-url";
                    };
                    candidates: {
                        id: string;
                        slot: number;
                        retrievedAt: string;
                        raw: unknown;
                        score: {
                            value: number;
                            fullAgreement: boolean;
                        } | null;
                        csl: {
                            type?: string | undefined;
                            author?: {
                                family?: string | undefined;
                                "non-dropping-particle"?: string | undefined;
                                given?: string | undefined;
                                literal?: string | undefined;
                            }[] | undefined;
                            issued?: {
                                literal: string;
                            } | undefined;
                            title?: string | undefined;
                            "container-title"?: string | undefined;
                            "container-title-short"?: string | undefined;
                            publisher?: string | undefined;
                            "publisher-place"?: string | undefined;
                            volume?: string | undefined;
                            issue?: string | undefined;
                            page?: string | undefined;
                            "article-number"?: string | undefined;
                            edition?: string | undefined;
                            DOI?: string | undefined;
                            URL?: string | undefined;
                            ISBN?: string | undefined;
                            ISSN?: string | undefined;
                            PMID?: string | undefined;
                            PMCID?: string | undefined;
                            arXiv?: string | undefined;
                        };
                        fields: {
                            field: string;
                            reference: unknown;
                            candidate: unknown;
                            score: {
                                value: number;
                                fullAgreement: boolean;
                            } | null;
                            reason: "compared" | "missing-candidate" | "missing-reference" | "not-determinable" | "resource-limit" | "unweighted";
                            agreement?: boolean | undefined;
                            journalAbbreviation?: {
                                outcome: "different" | "match" | "not-determinable";
                                reason: "attested-match" | "attested-other-journal" | "no-attestation";
                                attestations: {
                                    source: "crossref" | "europepmc" | "nlm" | "semanticscholar";
                                    role: "candidate" | "reference";
                                    journalTitle: string;
                                    abbreviation: string;
                                    nlmId?: string | undefined;
                                    snapshotDate?: string | undefined;
                                }[];
                            } | undefined;
                        }[];
                        source: "arxiv" | "crossref" | "europepmc" | "googlebooks" | "internetarchive" | "openalex" | "openlibrary" | "semanticscholar" | "url";
                        origin: "archive" | "arxiv" | "authors-year" | "combined" | "doi" | "isbn" | "pmcid" | "pmid" | "title" | "url";
                        identifiers?: string[] | undefined;
                        identityAmbiguous?: boolean | undefined;
                        retractionEvidence?: {
                            source: "crossref" | "europepmc" | "openalex";
                            candidateId: string;
                            observedAt: string;
                        } | undefined;
                    }[];
                    evidence: {
                        reason?: string | undefined;
                        status?: number | undefined;
                        durationMs: number;
                        attempts: number;
                        observedAt: string;
                        raw?: unknown;
                        source: "arxiv" | "crossref" | "doi.org" | "europepmc" | "googlebooks" | "internetarchive" | "openalex" | "openlibrary" | "semanticscholar" | "url";
                        operation: "archive" | "arxiv" | "authors-year" | "combined" | "doi" | "isbn" | "pmcid" | "pmid" | "title" | "url";
                        outcome: "candidate" | "disabled" | "exists" | "no-record" | "nonexistent" | "redirect" | "skipped" | "unavailable" | "unsupported";
                        web?: {
                            originalUrl: string;
                            finalUrl: string;
                            status: number;
                            title?: string | undefined;
                            redirectTarget?: string | undefined;
                            archiveUrl?: string | undefined;
                            timestamp?: string | undefined;
                        } | undefined;
                        skippedDuplicates?: string[] | undefined;
                        unusedSlots?: number | undefined;
                        identifierAmbiguity?: string[] | undefined;
                    }[];
                    reasons: ("ambiguous-identity" | "development-route-incomplete" | "doi-nonexistent" | "fields-differ" | "foreign-doi" | "identified" | "identity-unresolved" | "insufficient-search" | "mandatory-resolution-incomplete" | "metadata-unavailable" | "mixed-components" | "outside-coverage" | "search-completed" | "sources-unavailable" | "url-unavailable" | "url-verification-incomplete" | "web-original-unavailable")[];
                    failedSources: ("arxiv" | "crossref" | "doi.org" | "europepmc" | "googlebooks" | "internetarchive" | "openalex" | "openlibrary" | "semanticscholar" | "url")[];
                    retraction: "retracted" | "unknown";
                    retractionEvidence?: {
                        source: "crossref" | "europepmc" | "openalex";
                        candidateId: string;
                        observedAt: string;
                    }[] | undefined;
                };
                manualOverride: {
                    id: string;
                    resultId: string;
                    verdict: "correct" | "doi-conflict" | "exists-with-deviations" | "mixed-citation" | "not-found" | "not-verifiable";
                    createdAt: string;
                } | null;
            }[];
            manualOverride: {
                id: string;
                resultId: string;
                verdict: "correct" | "doi-conflict" | "exists-with-deviations" | "mixed-citation" | "not-found" | "not-verifiable";
                createdAt: string;
            } | null;
            manualOverrideReset: boolean;
            quotaEffect: "free-recheck" | "new-work";
            outcome: {
                kind: "status";
                status: "cancelled" | "failed" | "not-checked" | "running";
            } | {
                kind: "verdict";
                verdict: "correct" | "doi-conflict" | "exists-with-deviations" | "mixed-citation" | "not-found" | "not-verifiable";
                scoringRules: {
                    version: string;
                    calibration: "uncalibrated";
                    unicode: string;
                    icu: string;
                    profile: Record<string, number>;
                };
                searchStrategyVersion: string;
                searchConfiguration: Record<string, string | number>;
                bestMatchId: string | null;
                reference: {
                    originalText: string;
                    span: {
                        start: number;
                        end: number;
                    };
                    authorsTruncated?: boolean | undefined;
                    fieldSources: Record<string, {
                        raw: string;
                        span?: {
                            start: number;
                            end: number;
                        } | undefined;
                        normalized?: string | undefined;
                        provenance?: "ai" | "parser" | "user" | undefined;
                    }>;
                    structuring: {
                        path: "ai" | "parser" | "user";
                        version: string;
                    };
                    ai?: {
                        configuration: string;
                        notice: "ai-can-be-wrong";
                        proposals: {
                            field: string;
                            value: unknown;
                            reason: "ungrounded";
                        }[];
                        changedFields: string[];
                    } | undefined;
                    csl: {
                        type?: string | undefined;
                        author?: {
                            family?: string | undefined;
                            "non-dropping-particle"?: string | undefined;
                            given?: string | undefined;
                            literal?: string | undefined;
                        }[] | undefined;
                        issued?: {
                            literal: string;
                        } | undefined;
                        title?: string | undefined;
                        "container-title"?: string | undefined;
                        "container-title-short"?: string | undefined;
                        publisher?: string | undefined;
                        "publisher-place"?: string | undefined;
                        volume?: string | undefined;
                        issue?: string | undefined;
                        page?: string | undefined;
                        "article-number"?: string | undefined;
                        edition?: string | undefined;
                        DOI?: string | undefined;
                        URL?: string | undefined;
                        ISBN?: string | undefined;
                        ISSN?: string | undefined;
                        PMID?: string | undefined;
                        PMCID?: string | undefined;
                        arXiv?: string | undefined;
                    };
                    imported?: {
                        format: "bibtex" | "ris";
                        unsupported: {
                            name: string;
                            value: string;
                        }[];
                        fields: {
                            type?: string | undefined;
                            author?: {
                                family?: string | undefined;
                                "non-dropping-particle"?: string | undefined;
                                given?: string | undefined;
                                literal?: string | undefined;
                            }[] | undefined;
                            issued?: {
                                literal: string;
                            } | undefined;
                            title?: string | undefined;
                            "container-title"?: string | undefined;
                            "container-title-short"?: string | undefined;
                            publisher?: string | undefined;
                            "publisher-place"?: string | undefined;
                            volume?: string | undefined;
                            issue?: string | undefined;
                            page?: string | undefined;
                            "article-number"?: string | undefined;
                            edition?: string | undefined;
                            DOI?: string | undefined;
                            URL?: string | undefined;
                            ISBN?: string | undefined;
                            ISSN?: string | undefined;
                            PMID?: string | undefined;
                            PMCID?: string | undefined;
                            arXiv?: string | undefined;
                        };
                    } | undefined;
                };
                identity: {
                    candidateId?: string | undefined;
                    kind: "independent-bibliography" | "supplied-doi" | "supplied-identifier" | "unresolved" | "web-archive" | "web-url";
                };
                candidates: {
                    id: string;
                    slot: number;
                    retrievedAt: string;
                    raw: unknown;
                    score: {
                        value: number;
                        fullAgreement: boolean;
                    } | null;
                    csl: {
                        type?: string | undefined;
                        author?: {
                            family?: string | undefined;
                            "non-dropping-particle"?: string | undefined;
                            given?: string | undefined;
                            literal?: string | undefined;
                        }[] | undefined;
                        issued?: {
                            literal: string;
                        } | undefined;
                        title?: string | undefined;
                        "container-title"?: string | undefined;
                        "container-title-short"?: string | undefined;
                        publisher?: string | undefined;
                        "publisher-place"?: string | undefined;
                        volume?: string | undefined;
                        issue?: string | undefined;
                        page?: string | undefined;
                        "article-number"?: string | undefined;
                        edition?: string | undefined;
                        DOI?: string | undefined;
                        URL?: string | undefined;
                        ISBN?: string | undefined;
                        ISSN?: string | undefined;
                        PMID?: string | undefined;
                        PMCID?: string | undefined;
                        arXiv?: string | undefined;
                    };
                    fields: {
                        field: string;
                        reference: unknown;
                        candidate: unknown;
                        score: {
                            value: number;
                            fullAgreement: boolean;
                        } | null;
                        reason: "compared" | "missing-candidate" | "missing-reference" | "not-determinable" | "resource-limit" | "unweighted";
                        agreement?: boolean | undefined;
                        journalAbbreviation?: {
                            outcome: "different" | "match" | "not-determinable";
                            reason: "attested-match" | "attested-other-journal" | "no-attestation";
                            attestations: {
                                source: "crossref" | "europepmc" | "nlm" | "semanticscholar";
                                role: "candidate" | "reference";
                                journalTitle: string;
                                abbreviation: string;
                                nlmId?: string | undefined;
                                snapshotDate?: string | undefined;
                            }[];
                        } | undefined;
                    }[];
                    source: "arxiv" | "crossref" | "europepmc" | "googlebooks" | "internetarchive" | "openalex" | "openlibrary" | "semanticscholar" | "url";
                    origin: "archive" | "arxiv" | "authors-year" | "combined" | "doi" | "isbn" | "pmcid" | "pmid" | "title" | "url";
                    identifiers?: string[] | undefined;
                    identityAmbiguous?: boolean | undefined;
                    retractionEvidence?: {
                        source: "crossref" | "europepmc" | "openalex";
                        candidateId: string;
                        observedAt: string;
                    } | undefined;
                }[];
                evidence: {
                    reason?: string | undefined;
                    status?: number | undefined;
                    durationMs: number;
                    attempts: number;
                    observedAt: string;
                    raw?: unknown;
                    source: "arxiv" | "crossref" | "doi.org" | "europepmc" | "googlebooks" | "internetarchive" | "openalex" | "openlibrary" | "semanticscholar" | "url";
                    operation: "archive" | "arxiv" | "authors-year" | "combined" | "doi" | "isbn" | "pmcid" | "pmid" | "title" | "url";
                    outcome: "candidate" | "disabled" | "exists" | "no-record" | "nonexistent" | "redirect" | "skipped" | "unavailable" | "unsupported";
                    web?: {
                        originalUrl: string;
                        finalUrl: string;
                        status: number;
                        title?: string | undefined;
                        redirectTarget?: string | undefined;
                        archiveUrl?: string | undefined;
                        timestamp?: string | undefined;
                    } | undefined;
                    skippedDuplicates?: string[] | undefined;
                    unusedSlots?: number | undefined;
                    identifierAmbiguity?: string[] | undefined;
                }[];
                reasons: ("ambiguous-identity" | "development-route-incomplete" | "doi-nonexistent" | "fields-differ" | "foreign-doi" | "identified" | "identity-unresolved" | "insufficient-search" | "mandatory-resolution-incomplete" | "metadata-unavailable" | "mixed-components" | "outside-coverage" | "search-completed" | "sources-unavailable" | "url-unavailable" | "url-verification-incomplete" | "web-original-unavailable")[];
                failedSources: ("arxiv" | "crossref" | "doi.org" | "europepmc" | "googlebooks" | "internetarchive" | "openalex" | "openlibrary" | "semanticscholar" | "url")[];
                retraction: "retracted" | "unknown";
                retractionEvidence?: {
                    source: "crossref" | "europepmc" | "openalex";
                    candidateId: string;
                    observedAt: string;
                }[] | undefined;
            };
            progress: "arxiv" | "checking" | "crossref" | "doi.org" | "ended" | "europepmc" | "googlebooks" | "internetarchive" | "openalex" | "openlibrary" | "queued" | "semanticscholar" | "url";
        }[];
    }>;
    structureReferences: (text: string) => Promise<{
        references: {
            originalText: string;
            span: {
                start: number;
                end: number;
            };
            csl: {
                type?: string | undefined;
                author?: {
                    family?: string | undefined;
                    "non-dropping-particle"?: string | undefined;
                    given?: string | undefined;
                    literal?: string | undefined;
                }[] | undefined;
                issued?: {
                    literal: string;
                } | undefined;
                title?: string | undefined;
                "container-title"?: string | undefined;
                "container-title-short"?: string | undefined;
                publisher?: string | undefined;
                "publisher-place"?: string | undefined;
                volume?: string | undefined;
                issue?: string | undefined;
                page?: string | undefined;
                "article-number"?: string | undefined;
                edition?: string | undefined;
                DOI?: string | undefined;
                URL?: string | undefined;
                ISBN?: string | undefined;
                ISSN?: string | undefined;
                PMID?: string | undefined;
                PMCID?: string | undefined;
            };
            fieldSources: Record<string, {
                raw: string;
                span?: {
                    start: number;
                    end: number;
                } | undefined;
                normalized?: string | undefined;
            }>;
            authorsTruncated?: boolean | undefined;
            structuring: {
                path: "parser" | "user";
                version: string;
            };
        }[];
        rejected: {
            originalText: string;
            span: {
                start: number;
                end: number;
            };
            reason: "no-reference-features";
        }[];
        guidance: "no-references" | null;
        quotaConsumed: 0;
        referenceLimit: number;
    }>;
    /** `maxReferences` starts only the first N References in input order (Quota choice). */
    createCheck: (input: string | CreateCheckRequest, choice?: {
        maxReferences?: number;
    }) => Promise<{
        id: string;
        state: "ended" | "running";
        lastEventSeq: number;
        lastEventCursor: string;
        leaseRenewAfterMs: number;
        endReason: "cancelled" | "completed" | "lease-expired" | null;
        document?: {
            text: string;
            selection: {
                version: string;
                regions: {
                    start: number;
                    end: number;
                }[];
            };
        } | null | undefined;
        references: {
            slot: number;
            originalText: string;
            revision: number;
            fields: {
                type?: string | undefined;
                author?: {
                    family?: string | undefined;
                    "non-dropping-particle"?: string | undefined;
                    given?: string | undefined;
                    literal?: string | undefined;
                }[] | undefined;
                issued?: {
                    literal: string;
                } | undefined;
                title?: string | undefined;
                "container-title"?: string | undefined;
                "container-title-short"?: string | undefined;
                publisher?: string | undefined;
                "publisher-place"?: string | undefined;
                volume?: string | undefined;
                issue?: string | undefined;
                page?: string | undefined;
                "article-number"?: string | undefined;
                edition?: string | undefined;
                DOI?: string | undefined;
                URL?: string | undefined;
                ISBN?: string | undefined;
                ISSN?: string | undefined;
                PMID?: string | undefined;
                PMCID?: string | undefined;
                arXiv?: string | undefined;
            };
            authorsTruncated?: boolean | undefined;
            revisions: {
                revision: number;
                reference: {
                    originalText: string;
                    span: {
                        start: number;
                        end: number;
                    };
                    authorsTruncated?: boolean | undefined;
                    fieldSources: Record<string, {
                        raw: string;
                        span?: {
                            start: number;
                            end: number;
                        } | undefined;
                        normalized?: string | undefined;
                        provenance?: "ai" | "parser" | "user" | undefined;
                    }>;
                    structuring: {
                        path: "ai" | "parser" | "user";
                        version: string;
                    };
                    ai?: {
                        configuration: string;
                        notice: "ai-can-be-wrong";
                        proposals: {
                            field: string;
                            value: unknown;
                            reason: "ungrounded";
                        }[];
                        changedFields: string[];
                    } | undefined;
                    csl: {
                        type?: string | undefined;
                        author?: {
                            family?: string | undefined;
                            "non-dropping-particle"?: string | undefined;
                            given?: string | undefined;
                            literal?: string | undefined;
                        }[] | undefined;
                        issued?: {
                            literal: string;
                        } | undefined;
                        title?: string | undefined;
                        "container-title"?: string | undefined;
                        "container-title-short"?: string | undefined;
                        publisher?: string | undefined;
                        "publisher-place"?: string | undefined;
                        volume?: string | undefined;
                        issue?: string | undefined;
                        page?: string | undefined;
                        "article-number"?: string | undefined;
                        edition?: string | undefined;
                        DOI?: string | undefined;
                        URL?: string | undefined;
                        ISBN?: string | undefined;
                        ISSN?: string | undefined;
                        PMID?: string | undefined;
                        PMCID?: string | undefined;
                        arXiv?: string | undefined;
                    };
                    imported?: {
                        format: "bibtex" | "ris";
                        unsupported: {
                            name: string;
                            value: string;
                        }[];
                        fields: {
                            type?: string | undefined;
                            author?: {
                                family?: string | undefined;
                                "non-dropping-particle"?: string | undefined;
                                given?: string | undefined;
                                literal?: string | undefined;
                            }[] | undefined;
                            issued?: {
                                literal: string;
                            } | undefined;
                            title?: string | undefined;
                            "container-title"?: string | undefined;
                            "container-title-short"?: string | undefined;
                            publisher?: string | undefined;
                            "publisher-place"?: string | undefined;
                            volume?: string | undefined;
                            issue?: string | undefined;
                            page?: string | undefined;
                            "article-number"?: string | undefined;
                            edition?: string | undefined;
                            DOI?: string | undefined;
                            URL?: string | undefined;
                            ISBN?: string | undefined;
                            ISSN?: string | undefined;
                            PMID?: string | undefined;
                            PMCID?: string | undefined;
                            arXiv?: string | undefined;
                        };
                    } | undefined;
                };
                provenance: "ai" | "parser" | "user";
                createdAt: string;
            }[];
            results: {
                id: string;
                revision: number;
                generation: number;
                createdAt: string;
                outcome: {
                    kind: "status";
                    status: "cancelled" | "failed" | "not-checked" | "running";
                } | {
                    kind: "verdict";
                    verdict: "correct" | "doi-conflict" | "exists-with-deviations" | "mixed-citation" | "not-found" | "not-verifiable";
                    scoringRules: {
                        version: string;
                        calibration: "uncalibrated";
                        unicode: string;
                        icu: string;
                        profile: Record<string, number>;
                    };
                    searchStrategyVersion: string;
                    searchConfiguration: Record<string, string | number>;
                    bestMatchId: string | null;
                    reference: {
                        originalText: string;
                        span: {
                            start: number;
                            end: number;
                        };
                        authorsTruncated?: boolean | undefined;
                        fieldSources: Record<string, {
                            raw: string;
                            span?: {
                                start: number;
                                end: number;
                            } | undefined;
                            normalized?: string | undefined;
                            provenance?: "ai" | "parser" | "user" | undefined;
                        }>;
                        structuring: {
                            path: "ai" | "parser" | "user";
                            version: string;
                        };
                        ai?: {
                            configuration: string;
                            notice: "ai-can-be-wrong";
                            proposals: {
                                field: string;
                                value: unknown;
                                reason: "ungrounded";
                            }[];
                            changedFields: string[];
                        } | undefined;
                        csl: {
                            type?: string | undefined;
                            author?: {
                                family?: string | undefined;
                                "non-dropping-particle"?: string | undefined;
                                given?: string | undefined;
                                literal?: string | undefined;
                            }[] | undefined;
                            issued?: {
                                literal: string;
                            } | undefined;
                            title?: string | undefined;
                            "container-title"?: string | undefined;
                            "container-title-short"?: string | undefined;
                            publisher?: string | undefined;
                            "publisher-place"?: string | undefined;
                            volume?: string | undefined;
                            issue?: string | undefined;
                            page?: string | undefined;
                            "article-number"?: string | undefined;
                            edition?: string | undefined;
                            DOI?: string | undefined;
                            URL?: string | undefined;
                            ISBN?: string | undefined;
                            ISSN?: string | undefined;
                            PMID?: string | undefined;
                            PMCID?: string | undefined;
                            arXiv?: string | undefined;
                        };
                        imported?: {
                            format: "bibtex" | "ris";
                            unsupported: {
                                name: string;
                                value: string;
                            }[];
                            fields: {
                                type?: string | undefined;
                                author?: {
                                    family?: string | undefined;
                                    "non-dropping-particle"?: string | undefined;
                                    given?: string | undefined;
                                    literal?: string | undefined;
                                }[] | undefined;
                                issued?: {
                                    literal: string;
                                } | undefined;
                                title?: string | undefined;
                                "container-title"?: string | undefined;
                                "container-title-short"?: string | undefined;
                                publisher?: string | undefined;
                                "publisher-place"?: string | undefined;
                                volume?: string | undefined;
                                issue?: string | undefined;
                                page?: string | undefined;
                                "article-number"?: string | undefined;
                                edition?: string | undefined;
                                DOI?: string | undefined;
                                URL?: string | undefined;
                                ISBN?: string | undefined;
                                ISSN?: string | undefined;
                                PMID?: string | undefined;
                                PMCID?: string | undefined;
                                arXiv?: string | undefined;
                            };
                        } | undefined;
                    };
                    identity: {
                        candidateId?: string | undefined;
                        kind: "independent-bibliography" | "supplied-doi" | "supplied-identifier" | "unresolved" | "web-archive" | "web-url";
                    };
                    candidates: {
                        id: string;
                        slot: number;
                        retrievedAt: string;
                        raw: unknown;
                        score: {
                            value: number;
                            fullAgreement: boolean;
                        } | null;
                        csl: {
                            type?: string | undefined;
                            author?: {
                                family?: string | undefined;
                                "non-dropping-particle"?: string | undefined;
                                given?: string | undefined;
                                literal?: string | undefined;
                            }[] | undefined;
                            issued?: {
                                literal: string;
                            } | undefined;
                            title?: string | undefined;
                            "container-title"?: string | undefined;
                            "container-title-short"?: string | undefined;
                            publisher?: string | undefined;
                            "publisher-place"?: string | undefined;
                            volume?: string | undefined;
                            issue?: string | undefined;
                            page?: string | undefined;
                            "article-number"?: string | undefined;
                            edition?: string | undefined;
                            DOI?: string | undefined;
                            URL?: string | undefined;
                            ISBN?: string | undefined;
                            ISSN?: string | undefined;
                            PMID?: string | undefined;
                            PMCID?: string | undefined;
                            arXiv?: string | undefined;
                        };
                        fields: {
                            field: string;
                            reference: unknown;
                            candidate: unknown;
                            score: {
                                value: number;
                                fullAgreement: boolean;
                            } | null;
                            reason: "compared" | "missing-candidate" | "missing-reference" | "not-determinable" | "resource-limit" | "unweighted";
                            agreement?: boolean | undefined;
                            journalAbbreviation?: {
                                outcome: "different" | "match" | "not-determinable";
                                reason: "attested-match" | "attested-other-journal" | "no-attestation";
                                attestations: {
                                    source: "crossref" | "europepmc" | "nlm" | "semanticscholar";
                                    role: "candidate" | "reference";
                                    journalTitle: string;
                                    abbreviation: string;
                                    nlmId?: string | undefined;
                                    snapshotDate?: string | undefined;
                                }[];
                            } | undefined;
                        }[];
                        source: "arxiv" | "crossref" | "europepmc" | "googlebooks" | "internetarchive" | "openalex" | "openlibrary" | "semanticscholar" | "url";
                        origin: "archive" | "arxiv" | "authors-year" | "combined" | "doi" | "isbn" | "pmcid" | "pmid" | "title" | "url";
                        identifiers?: string[] | undefined;
                        identityAmbiguous?: boolean | undefined;
                        retractionEvidence?: {
                            source: "crossref" | "europepmc" | "openalex";
                            candidateId: string;
                            observedAt: string;
                        } | undefined;
                    }[];
                    evidence: {
                        reason?: string | undefined;
                        status?: number | undefined;
                        durationMs: number;
                        attempts: number;
                        observedAt: string;
                        raw?: unknown;
                        source: "arxiv" | "crossref" | "doi.org" | "europepmc" | "googlebooks" | "internetarchive" | "openalex" | "openlibrary" | "semanticscholar" | "url";
                        operation: "archive" | "arxiv" | "authors-year" | "combined" | "doi" | "isbn" | "pmcid" | "pmid" | "title" | "url";
                        outcome: "candidate" | "disabled" | "exists" | "no-record" | "nonexistent" | "redirect" | "skipped" | "unavailable" | "unsupported";
                        web?: {
                            originalUrl: string;
                            finalUrl: string;
                            status: number;
                            title?: string | undefined;
                            redirectTarget?: string | undefined;
                            archiveUrl?: string | undefined;
                            timestamp?: string | undefined;
                        } | undefined;
                        skippedDuplicates?: string[] | undefined;
                        unusedSlots?: number | undefined;
                        identifierAmbiguity?: string[] | undefined;
                    }[];
                    reasons: ("ambiguous-identity" | "development-route-incomplete" | "doi-nonexistent" | "fields-differ" | "foreign-doi" | "identified" | "identity-unresolved" | "insufficient-search" | "mandatory-resolution-incomplete" | "metadata-unavailable" | "mixed-components" | "outside-coverage" | "search-completed" | "sources-unavailable" | "url-unavailable" | "url-verification-incomplete" | "web-original-unavailable")[];
                    failedSources: ("arxiv" | "crossref" | "doi.org" | "europepmc" | "googlebooks" | "internetarchive" | "openalex" | "openlibrary" | "semanticscholar" | "url")[];
                    retraction: "retracted" | "unknown";
                    retractionEvidence?: {
                        source: "crossref" | "europepmc" | "openalex";
                        candidateId: string;
                        observedAt: string;
                    }[] | undefined;
                };
                manualOverride: {
                    id: string;
                    resultId: string;
                    verdict: "correct" | "doi-conflict" | "exists-with-deviations" | "mixed-citation" | "not-found" | "not-verifiable";
                    createdAt: string;
                } | null;
            }[];
            manualOverride: {
                id: string;
                resultId: string;
                verdict: "correct" | "doi-conflict" | "exists-with-deviations" | "mixed-citation" | "not-found" | "not-verifiable";
                createdAt: string;
            } | null;
            manualOverrideReset: boolean;
            quotaEffect: "free-recheck" | "new-work";
            outcome: {
                kind: "status";
                status: "cancelled" | "failed" | "not-checked" | "running";
            } | {
                kind: "verdict";
                verdict: "correct" | "doi-conflict" | "exists-with-deviations" | "mixed-citation" | "not-found" | "not-verifiable";
                scoringRules: {
                    version: string;
                    calibration: "uncalibrated";
                    unicode: string;
                    icu: string;
                    profile: Record<string, number>;
                };
                searchStrategyVersion: string;
                searchConfiguration: Record<string, string | number>;
                bestMatchId: string | null;
                reference: {
                    originalText: string;
                    span: {
                        start: number;
                        end: number;
                    };
                    authorsTruncated?: boolean | undefined;
                    fieldSources: Record<string, {
                        raw: string;
                        span?: {
                            start: number;
                            end: number;
                        } | undefined;
                        normalized?: string | undefined;
                        provenance?: "ai" | "parser" | "user" | undefined;
                    }>;
                    structuring: {
                        path: "ai" | "parser" | "user";
                        version: string;
                    };
                    ai?: {
                        configuration: string;
                        notice: "ai-can-be-wrong";
                        proposals: {
                            field: string;
                            value: unknown;
                            reason: "ungrounded";
                        }[];
                        changedFields: string[];
                    } | undefined;
                    csl: {
                        type?: string | undefined;
                        author?: {
                            family?: string | undefined;
                            "non-dropping-particle"?: string | undefined;
                            given?: string | undefined;
                            literal?: string | undefined;
                        }[] | undefined;
                        issued?: {
                            literal: string;
                        } | undefined;
                        title?: string | undefined;
                        "container-title"?: string | undefined;
                        "container-title-short"?: string | undefined;
                        publisher?: string | undefined;
                        "publisher-place"?: string | undefined;
                        volume?: string | undefined;
                        issue?: string | undefined;
                        page?: string | undefined;
                        "article-number"?: string | undefined;
                        edition?: string | undefined;
                        DOI?: string | undefined;
                        URL?: string | undefined;
                        ISBN?: string | undefined;
                        ISSN?: string | undefined;
                        PMID?: string | undefined;
                        PMCID?: string | undefined;
                        arXiv?: string | undefined;
                    };
                    imported?: {
                        format: "bibtex" | "ris";
                        unsupported: {
                            name: string;
                            value: string;
                        }[];
                        fields: {
                            type?: string | undefined;
                            author?: {
                                family?: string | undefined;
                                "non-dropping-particle"?: string | undefined;
                                given?: string | undefined;
                                literal?: string | undefined;
                            }[] | undefined;
                            issued?: {
                                literal: string;
                            } | undefined;
                            title?: string | undefined;
                            "container-title"?: string | undefined;
                            "container-title-short"?: string | undefined;
                            publisher?: string | undefined;
                            "publisher-place"?: string | undefined;
                            volume?: string | undefined;
                            issue?: string | undefined;
                            page?: string | undefined;
                            "article-number"?: string | undefined;
                            edition?: string | undefined;
                            DOI?: string | undefined;
                            URL?: string | undefined;
                            ISBN?: string | undefined;
                            ISSN?: string | undefined;
                            PMID?: string | undefined;
                            PMCID?: string | undefined;
                            arXiv?: string | undefined;
                        };
                    } | undefined;
                };
                identity: {
                    candidateId?: string | undefined;
                    kind: "independent-bibliography" | "supplied-doi" | "supplied-identifier" | "unresolved" | "web-archive" | "web-url";
                };
                candidates: {
                    id: string;
                    slot: number;
                    retrievedAt: string;
                    raw: unknown;
                    score: {
                        value: number;
                        fullAgreement: boolean;
                    } | null;
                    csl: {
                        type?: string | undefined;
                        author?: {
                            family?: string | undefined;
                            "non-dropping-particle"?: string | undefined;
                            given?: string | undefined;
                            literal?: string | undefined;
                        }[] | undefined;
                        issued?: {
                            literal: string;
                        } | undefined;
                        title?: string | undefined;
                        "container-title"?: string | undefined;
                        "container-title-short"?: string | undefined;
                        publisher?: string | undefined;
                        "publisher-place"?: string | undefined;
                        volume?: string | undefined;
                        issue?: string | undefined;
                        page?: string | undefined;
                        "article-number"?: string | undefined;
                        edition?: string | undefined;
                        DOI?: string | undefined;
                        URL?: string | undefined;
                        ISBN?: string | undefined;
                        ISSN?: string | undefined;
                        PMID?: string | undefined;
                        PMCID?: string | undefined;
                        arXiv?: string | undefined;
                    };
                    fields: {
                        field: string;
                        reference: unknown;
                        candidate: unknown;
                        score: {
                            value: number;
                            fullAgreement: boolean;
                        } | null;
                        reason: "compared" | "missing-candidate" | "missing-reference" | "not-determinable" | "resource-limit" | "unweighted";
                        agreement?: boolean | undefined;
                        journalAbbreviation?: {
                            outcome: "different" | "match" | "not-determinable";
                            reason: "attested-match" | "attested-other-journal" | "no-attestation";
                            attestations: {
                                source: "crossref" | "europepmc" | "nlm" | "semanticscholar";
                                role: "candidate" | "reference";
                                journalTitle: string;
                                abbreviation: string;
                                nlmId?: string | undefined;
                                snapshotDate?: string | undefined;
                            }[];
                        } | undefined;
                    }[];
                    source: "arxiv" | "crossref" | "europepmc" | "googlebooks" | "internetarchive" | "openalex" | "openlibrary" | "semanticscholar" | "url";
                    origin: "archive" | "arxiv" | "authors-year" | "combined" | "doi" | "isbn" | "pmcid" | "pmid" | "title" | "url";
                    identifiers?: string[] | undefined;
                    identityAmbiguous?: boolean | undefined;
                    retractionEvidence?: {
                        source: "crossref" | "europepmc" | "openalex";
                        candidateId: string;
                        observedAt: string;
                    } | undefined;
                }[];
                evidence: {
                    reason?: string | undefined;
                    status?: number | undefined;
                    durationMs: number;
                    attempts: number;
                    observedAt: string;
                    raw?: unknown;
                    source: "arxiv" | "crossref" | "doi.org" | "europepmc" | "googlebooks" | "internetarchive" | "openalex" | "openlibrary" | "semanticscholar" | "url";
                    operation: "archive" | "arxiv" | "authors-year" | "combined" | "doi" | "isbn" | "pmcid" | "pmid" | "title" | "url";
                    outcome: "candidate" | "disabled" | "exists" | "no-record" | "nonexistent" | "redirect" | "skipped" | "unavailable" | "unsupported";
                    web?: {
                        originalUrl: string;
                        finalUrl: string;
                        status: number;
                        title?: string | undefined;
                        redirectTarget?: string | undefined;
                        archiveUrl?: string | undefined;
                        timestamp?: string | undefined;
                    } | undefined;
                    skippedDuplicates?: string[] | undefined;
                    unusedSlots?: number | undefined;
                    identifierAmbiguity?: string[] | undefined;
                }[];
                reasons: ("ambiguous-identity" | "development-route-incomplete" | "doi-nonexistent" | "fields-differ" | "foreign-doi" | "identified" | "identity-unresolved" | "insufficient-search" | "mandatory-resolution-incomplete" | "metadata-unavailable" | "mixed-components" | "outside-coverage" | "search-completed" | "sources-unavailable" | "url-unavailable" | "url-verification-incomplete" | "web-original-unavailable")[];
                failedSources: ("arxiv" | "crossref" | "doi.org" | "europepmc" | "googlebooks" | "internetarchive" | "openalex" | "openlibrary" | "semanticscholar" | "url")[];
                retraction: "retracted" | "unknown";
                retractionEvidence?: {
                    source: "crossref" | "europepmc" | "openalex";
                    candidateId: string;
                    observedAt: string;
                }[] | undefined;
            };
            progress: "arxiv" | "checking" | "crossref" | "doi.org" | "ended" | "europepmc" | "googlebooks" | "internetarchive" | "openalex" | "openlibrary" | "queued" | "semanticscholar" | "url";
        }[];
    }>;
    /** The acting Owner's Quota; `null` when no Quota applies. */
    getQuota: () => Promise<{
        consumed: number;
        remaining: number;
        granted: number;
        reserved: number;
        warning: "eighty" | "exhausted" | "none";
        grants: {
            kind: "check-pack" | "credit" | "free" | "guest";
            granted: number;
            remaining: number;
            expiresAt: string;
        }[];
        features: string[];
    } | {
        status: "not-implemented";
    } | {
        status: "unavailable";
    } | null>;
    setManualOverride: (id: string, slot: number, input: SetManualOverrideRequest) => Promise<{
        id: string;
        state: "ended" | "running";
        lastEventSeq: number;
        lastEventCursor: string;
        leaseRenewAfterMs: number;
        endReason: "cancelled" | "completed" | "lease-expired" | null;
        document?: {
            text: string;
            selection: {
                version: string;
                regions: {
                    start: number;
                    end: number;
                }[];
            };
        } | null | undefined;
        references: {
            slot: number;
            originalText: string;
            revision: number;
            fields: {
                type?: string | undefined;
                author?: {
                    family?: string | undefined;
                    "non-dropping-particle"?: string | undefined;
                    given?: string | undefined;
                    literal?: string | undefined;
                }[] | undefined;
                issued?: {
                    literal: string;
                } | undefined;
                title?: string | undefined;
                "container-title"?: string | undefined;
                "container-title-short"?: string | undefined;
                publisher?: string | undefined;
                "publisher-place"?: string | undefined;
                volume?: string | undefined;
                issue?: string | undefined;
                page?: string | undefined;
                "article-number"?: string | undefined;
                edition?: string | undefined;
                DOI?: string | undefined;
                URL?: string | undefined;
                ISBN?: string | undefined;
                ISSN?: string | undefined;
                PMID?: string | undefined;
                PMCID?: string | undefined;
                arXiv?: string | undefined;
            };
            authorsTruncated?: boolean | undefined;
            revisions: {
                revision: number;
                reference: {
                    originalText: string;
                    span: {
                        start: number;
                        end: number;
                    };
                    authorsTruncated?: boolean | undefined;
                    fieldSources: Record<string, {
                        raw: string;
                        span?: {
                            start: number;
                            end: number;
                        } | undefined;
                        normalized?: string | undefined;
                        provenance?: "ai" | "parser" | "user" | undefined;
                    }>;
                    structuring: {
                        path: "ai" | "parser" | "user";
                        version: string;
                    };
                    ai?: {
                        configuration: string;
                        notice: "ai-can-be-wrong";
                        proposals: {
                            field: string;
                            value: unknown;
                            reason: "ungrounded";
                        }[];
                        changedFields: string[];
                    } | undefined;
                    csl: {
                        type?: string | undefined;
                        author?: {
                            family?: string | undefined;
                            "non-dropping-particle"?: string | undefined;
                            given?: string | undefined;
                            literal?: string | undefined;
                        }[] | undefined;
                        issued?: {
                            literal: string;
                        } | undefined;
                        title?: string | undefined;
                        "container-title"?: string | undefined;
                        "container-title-short"?: string | undefined;
                        publisher?: string | undefined;
                        "publisher-place"?: string | undefined;
                        volume?: string | undefined;
                        issue?: string | undefined;
                        page?: string | undefined;
                        "article-number"?: string | undefined;
                        edition?: string | undefined;
                        DOI?: string | undefined;
                        URL?: string | undefined;
                        ISBN?: string | undefined;
                        ISSN?: string | undefined;
                        PMID?: string | undefined;
                        PMCID?: string | undefined;
                        arXiv?: string | undefined;
                    };
                    imported?: {
                        format: "bibtex" | "ris";
                        unsupported: {
                            name: string;
                            value: string;
                        }[];
                        fields: {
                            type?: string | undefined;
                            author?: {
                                family?: string | undefined;
                                "non-dropping-particle"?: string | undefined;
                                given?: string | undefined;
                                literal?: string | undefined;
                            }[] | undefined;
                            issued?: {
                                literal: string;
                            } | undefined;
                            title?: string | undefined;
                            "container-title"?: string | undefined;
                            "container-title-short"?: string | undefined;
                            publisher?: string | undefined;
                            "publisher-place"?: string | undefined;
                            volume?: string | undefined;
                            issue?: string | undefined;
                            page?: string | undefined;
                            "article-number"?: string | undefined;
                            edition?: string | undefined;
                            DOI?: string | undefined;
                            URL?: string | undefined;
                            ISBN?: string | undefined;
                            ISSN?: string | undefined;
                            PMID?: string | undefined;
                            PMCID?: string | undefined;
                            arXiv?: string | undefined;
                        };
                    } | undefined;
                };
                provenance: "ai" | "parser" | "user";
                createdAt: string;
            }[];
            results: {
                id: string;
                revision: number;
                generation: number;
                createdAt: string;
                outcome: {
                    kind: "status";
                    status: "cancelled" | "failed" | "not-checked" | "running";
                } | {
                    kind: "verdict";
                    verdict: "correct" | "doi-conflict" | "exists-with-deviations" | "mixed-citation" | "not-found" | "not-verifiable";
                    scoringRules: {
                        version: string;
                        calibration: "uncalibrated";
                        unicode: string;
                        icu: string;
                        profile: Record<string, number>;
                    };
                    searchStrategyVersion: string;
                    searchConfiguration: Record<string, string | number>;
                    bestMatchId: string | null;
                    reference: {
                        originalText: string;
                        span: {
                            start: number;
                            end: number;
                        };
                        authorsTruncated?: boolean | undefined;
                        fieldSources: Record<string, {
                            raw: string;
                            span?: {
                                start: number;
                                end: number;
                            } | undefined;
                            normalized?: string | undefined;
                            provenance?: "ai" | "parser" | "user" | undefined;
                        }>;
                        structuring: {
                            path: "ai" | "parser" | "user";
                            version: string;
                        };
                        ai?: {
                            configuration: string;
                            notice: "ai-can-be-wrong";
                            proposals: {
                                field: string;
                                value: unknown;
                                reason: "ungrounded";
                            }[];
                            changedFields: string[];
                        } | undefined;
                        csl: {
                            type?: string | undefined;
                            author?: {
                                family?: string | undefined;
                                "non-dropping-particle"?: string | undefined;
                                given?: string | undefined;
                                literal?: string | undefined;
                            }[] | undefined;
                            issued?: {
                                literal: string;
                            } | undefined;
                            title?: string | undefined;
                            "container-title"?: string | undefined;
                            "container-title-short"?: string | undefined;
                            publisher?: string | undefined;
                            "publisher-place"?: string | undefined;
                            volume?: string | undefined;
                            issue?: string | undefined;
                            page?: string | undefined;
                            "article-number"?: string | undefined;
                            edition?: string | undefined;
                            DOI?: string | undefined;
                            URL?: string | undefined;
                            ISBN?: string | undefined;
                            ISSN?: string | undefined;
                            PMID?: string | undefined;
                            PMCID?: string | undefined;
                            arXiv?: string | undefined;
                        };
                        imported?: {
                            format: "bibtex" | "ris";
                            unsupported: {
                                name: string;
                                value: string;
                            }[];
                            fields: {
                                type?: string | undefined;
                                author?: {
                                    family?: string | undefined;
                                    "non-dropping-particle"?: string | undefined;
                                    given?: string | undefined;
                                    literal?: string | undefined;
                                }[] | undefined;
                                issued?: {
                                    literal: string;
                                } | undefined;
                                title?: string | undefined;
                                "container-title"?: string | undefined;
                                "container-title-short"?: string | undefined;
                                publisher?: string | undefined;
                                "publisher-place"?: string | undefined;
                                volume?: string | undefined;
                                issue?: string | undefined;
                                page?: string | undefined;
                                "article-number"?: string | undefined;
                                edition?: string | undefined;
                                DOI?: string | undefined;
                                URL?: string | undefined;
                                ISBN?: string | undefined;
                                ISSN?: string | undefined;
                                PMID?: string | undefined;
                                PMCID?: string | undefined;
                                arXiv?: string | undefined;
                            };
                        } | undefined;
                    };
                    identity: {
                        candidateId?: string | undefined;
                        kind: "independent-bibliography" | "supplied-doi" | "supplied-identifier" | "unresolved" | "web-archive" | "web-url";
                    };
                    candidates: {
                        id: string;
                        slot: number;
                        retrievedAt: string;
                        raw: unknown;
                        score: {
                            value: number;
                            fullAgreement: boolean;
                        } | null;
                        csl: {
                            type?: string | undefined;
                            author?: {
                                family?: string | undefined;
                                "non-dropping-particle"?: string | undefined;
                                given?: string | undefined;
                                literal?: string | undefined;
                            }[] | undefined;
                            issued?: {
                                literal: string;
                            } | undefined;
                            title?: string | undefined;
                            "container-title"?: string | undefined;
                            "container-title-short"?: string | undefined;
                            publisher?: string | undefined;
                            "publisher-place"?: string | undefined;
                            volume?: string | undefined;
                            issue?: string | undefined;
                            page?: string | undefined;
                            "article-number"?: string | undefined;
                            edition?: string | undefined;
                            DOI?: string | undefined;
                            URL?: string | undefined;
                            ISBN?: string | undefined;
                            ISSN?: string | undefined;
                            PMID?: string | undefined;
                            PMCID?: string | undefined;
                            arXiv?: string | undefined;
                        };
                        fields: {
                            field: string;
                            reference: unknown;
                            candidate: unknown;
                            score: {
                                value: number;
                                fullAgreement: boolean;
                            } | null;
                            reason: "compared" | "missing-candidate" | "missing-reference" | "not-determinable" | "resource-limit" | "unweighted";
                            agreement?: boolean | undefined;
                            journalAbbreviation?: {
                                outcome: "different" | "match" | "not-determinable";
                                reason: "attested-match" | "attested-other-journal" | "no-attestation";
                                attestations: {
                                    source: "crossref" | "europepmc" | "nlm" | "semanticscholar";
                                    role: "candidate" | "reference";
                                    journalTitle: string;
                                    abbreviation: string;
                                    nlmId?: string | undefined;
                                    snapshotDate?: string | undefined;
                                }[];
                            } | undefined;
                        }[];
                        source: "arxiv" | "crossref" | "europepmc" | "googlebooks" | "internetarchive" | "openalex" | "openlibrary" | "semanticscholar" | "url";
                        origin: "archive" | "arxiv" | "authors-year" | "combined" | "doi" | "isbn" | "pmcid" | "pmid" | "title" | "url";
                        identifiers?: string[] | undefined;
                        identityAmbiguous?: boolean | undefined;
                        retractionEvidence?: {
                            source: "crossref" | "europepmc" | "openalex";
                            candidateId: string;
                            observedAt: string;
                        } | undefined;
                    }[];
                    evidence: {
                        reason?: string | undefined;
                        status?: number | undefined;
                        durationMs: number;
                        attempts: number;
                        observedAt: string;
                        raw?: unknown;
                        source: "arxiv" | "crossref" | "doi.org" | "europepmc" | "googlebooks" | "internetarchive" | "openalex" | "openlibrary" | "semanticscholar" | "url";
                        operation: "archive" | "arxiv" | "authors-year" | "combined" | "doi" | "isbn" | "pmcid" | "pmid" | "title" | "url";
                        outcome: "candidate" | "disabled" | "exists" | "no-record" | "nonexistent" | "redirect" | "skipped" | "unavailable" | "unsupported";
                        web?: {
                            originalUrl: string;
                            finalUrl: string;
                            status: number;
                            title?: string | undefined;
                            redirectTarget?: string | undefined;
                            archiveUrl?: string | undefined;
                            timestamp?: string | undefined;
                        } | undefined;
                        skippedDuplicates?: string[] | undefined;
                        unusedSlots?: number | undefined;
                        identifierAmbiguity?: string[] | undefined;
                    }[];
                    reasons: ("ambiguous-identity" | "development-route-incomplete" | "doi-nonexistent" | "fields-differ" | "foreign-doi" | "identified" | "identity-unresolved" | "insufficient-search" | "mandatory-resolution-incomplete" | "metadata-unavailable" | "mixed-components" | "outside-coverage" | "search-completed" | "sources-unavailable" | "url-unavailable" | "url-verification-incomplete" | "web-original-unavailable")[];
                    failedSources: ("arxiv" | "crossref" | "doi.org" | "europepmc" | "googlebooks" | "internetarchive" | "openalex" | "openlibrary" | "semanticscholar" | "url")[];
                    retraction: "retracted" | "unknown";
                    retractionEvidence?: {
                        source: "crossref" | "europepmc" | "openalex";
                        candidateId: string;
                        observedAt: string;
                    }[] | undefined;
                };
                manualOverride: {
                    id: string;
                    resultId: string;
                    verdict: "correct" | "doi-conflict" | "exists-with-deviations" | "mixed-citation" | "not-found" | "not-verifiable";
                    createdAt: string;
                } | null;
            }[];
            manualOverride: {
                id: string;
                resultId: string;
                verdict: "correct" | "doi-conflict" | "exists-with-deviations" | "mixed-citation" | "not-found" | "not-verifiable";
                createdAt: string;
            } | null;
            manualOverrideReset: boolean;
            quotaEffect: "free-recheck" | "new-work";
            outcome: {
                kind: "status";
                status: "cancelled" | "failed" | "not-checked" | "running";
            } | {
                kind: "verdict";
                verdict: "correct" | "doi-conflict" | "exists-with-deviations" | "mixed-citation" | "not-found" | "not-verifiable";
                scoringRules: {
                    version: string;
                    calibration: "uncalibrated";
                    unicode: string;
                    icu: string;
                    profile: Record<string, number>;
                };
                searchStrategyVersion: string;
                searchConfiguration: Record<string, string | number>;
                bestMatchId: string | null;
                reference: {
                    originalText: string;
                    span: {
                        start: number;
                        end: number;
                    };
                    authorsTruncated?: boolean | undefined;
                    fieldSources: Record<string, {
                        raw: string;
                        span?: {
                            start: number;
                            end: number;
                        } | undefined;
                        normalized?: string | undefined;
                        provenance?: "ai" | "parser" | "user" | undefined;
                    }>;
                    structuring: {
                        path: "ai" | "parser" | "user";
                        version: string;
                    };
                    ai?: {
                        configuration: string;
                        notice: "ai-can-be-wrong";
                        proposals: {
                            field: string;
                            value: unknown;
                            reason: "ungrounded";
                        }[];
                        changedFields: string[];
                    } | undefined;
                    csl: {
                        type?: string | undefined;
                        author?: {
                            family?: string | undefined;
                            "non-dropping-particle"?: string | undefined;
                            given?: string | undefined;
                            literal?: string | undefined;
                        }[] | undefined;
                        issued?: {
                            literal: string;
                        } | undefined;
                        title?: string | undefined;
                        "container-title"?: string | undefined;
                        "container-title-short"?: string | undefined;
                        publisher?: string | undefined;
                        "publisher-place"?: string | undefined;
                        volume?: string | undefined;
                        issue?: string | undefined;
                        page?: string | undefined;
                        "article-number"?: string | undefined;
                        edition?: string | undefined;
                        DOI?: string | undefined;
                        URL?: string | undefined;
                        ISBN?: string | undefined;
                        ISSN?: string | undefined;
                        PMID?: string | undefined;
                        PMCID?: string | undefined;
                        arXiv?: string | undefined;
                    };
                    imported?: {
                        format: "bibtex" | "ris";
                        unsupported: {
                            name: string;
                            value: string;
                        }[];
                        fields: {
                            type?: string | undefined;
                            author?: {
                                family?: string | undefined;
                                "non-dropping-particle"?: string | undefined;
                                given?: string | undefined;
                                literal?: string | undefined;
                            }[] | undefined;
                            issued?: {
                                literal: string;
                            } | undefined;
                            title?: string | undefined;
                            "container-title"?: string | undefined;
                            "container-title-short"?: string | undefined;
                            publisher?: string | undefined;
                            "publisher-place"?: string | undefined;
                            volume?: string | undefined;
                            issue?: string | undefined;
                            page?: string | undefined;
                            "article-number"?: string | undefined;
                            edition?: string | undefined;
                            DOI?: string | undefined;
                            URL?: string | undefined;
                            ISBN?: string | undefined;
                            ISSN?: string | undefined;
                            PMID?: string | undefined;
                            PMCID?: string | undefined;
                            arXiv?: string | undefined;
                        };
                    } | undefined;
                };
                identity: {
                    candidateId?: string | undefined;
                    kind: "independent-bibliography" | "supplied-doi" | "supplied-identifier" | "unresolved" | "web-archive" | "web-url";
                };
                candidates: {
                    id: string;
                    slot: number;
                    retrievedAt: string;
                    raw: unknown;
                    score: {
                        value: number;
                        fullAgreement: boolean;
                    } | null;
                    csl: {
                        type?: string | undefined;
                        author?: {
                            family?: string | undefined;
                            "non-dropping-particle"?: string | undefined;
                            given?: string | undefined;
                            literal?: string | undefined;
                        }[] | undefined;
                        issued?: {
                            literal: string;
                        } | undefined;
                        title?: string | undefined;
                        "container-title"?: string | undefined;
                        "container-title-short"?: string | undefined;
                        publisher?: string | undefined;
                        "publisher-place"?: string | undefined;
                        volume?: string | undefined;
                        issue?: string | undefined;
                        page?: string | undefined;
                        "article-number"?: string | undefined;
                        edition?: string | undefined;
                        DOI?: string | undefined;
                        URL?: string | undefined;
                        ISBN?: string | undefined;
                        ISSN?: string | undefined;
                        PMID?: string | undefined;
                        PMCID?: string | undefined;
                        arXiv?: string | undefined;
                    };
                    fields: {
                        field: string;
                        reference: unknown;
                        candidate: unknown;
                        score: {
                            value: number;
                            fullAgreement: boolean;
                        } | null;
                        reason: "compared" | "missing-candidate" | "missing-reference" | "not-determinable" | "resource-limit" | "unweighted";
                        agreement?: boolean | undefined;
                        journalAbbreviation?: {
                            outcome: "different" | "match" | "not-determinable";
                            reason: "attested-match" | "attested-other-journal" | "no-attestation";
                            attestations: {
                                source: "crossref" | "europepmc" | "nlm" | "semanticscholar";
                                role: "candidate" | "reference";
                                journalTitle: string;
                                abbreviation: string;
                                nlmId?: string | undefined;
                                snapshotDate?: string | undefined;
                            }[];
                        } | undefined;
                    }[];
                    source: "arxiv" | "crossref" | "europepmc" | "googlebooks" | "internetarchive" | "openalex" | "openlibrary" | "semanticscholar" | "url";
                    origin: "archive" | "arxiv" | "authors-year" | "combined" | "doi" | "isbn" | "pmcid" | "pmid" | "title" | "url";
                    identifiers?: string[] | undefined;
                    identityAmbiguous?: boolean | undefined;
                    retractionEvidence?: {
                        source: "crossref" | "europepmc" | "openalex";
                        candidateId: string;
                        observedAt: string;
                    } | undefined;
                }[];
                evidence: {
                    reason?: string | undefined;
                    status?: number | undefined;
                    durationMs: number;
                    attempts: number;
                    observedAt: string;
                    raw?: unknown;
                    source: "arxiv" | "crossref" | "doi.org" | "europepmc" | "googlebooks" | "internetarchive" | "openalex" | "openlibrary" | "semanticscholar" | "url";
                    operation: "archive" | "arxiv" | "authors-year" | "combined" | "doi" | "isbn" | "pmcid" | "pmid" | "title" | "url";
                    outcome: "candidate" | "disabled" | "exists" | "no-record" | "nonexistent" | "redirect" | "skipped" | "unavailable" | "unsupported";
                    web?: {
                        originalUrl: string;
                        finalUrl: string;
                        status: number;
                        title?: string | undefined;
                        redirectTarget?: string | undefined;
                        archiveUrl?: string | undefined;
                        timestamp?: string | undefined;
                    } | undefined;
                    skippedDuplicates?: string[] | undefined;
                    unusedSlots?: number | undefined;
                    identifierAmbiguity?: string[] | undefined;
                }[];
                reasons: ("ambiguous-identity" | "development-route-incomplete" | "doi-nonexistent" | "fields-differ" | "foreign-doi" | "identified" | "identity-unresolved" | "insufficient-search" | "mandatory-resolution-incomplete" | "metadata-unavailable" | "mixed-components" | "outside-coverage" | "search-completed" | "sources-unavailable" | "url-unavailable" | "url-verification-incomplete" | "web-original-unavailable")[];
                failedSources: ("arxiv" | "crossref" | "doi.org" | "europepmc" | "googlebooks" | "internetarchive" | "openalex" | "openlibrary" | "semanticscholar" | "url")[];
                retraction: "retracted" | "unknown";
                retractionEvidence?: {
                    source: "crossref" | "europepmc" | "openalex";
                    candidateId: string;
                    observedAt: string;
                }[] | undefined;
            };
            progress: "arxiv" | "checking" | "crossref" | "doi.org" | "ended" | "europepmc" | "googlebooks" | "internetarchive" | "openalex" | "openlibrary" | "queued" | "semanticscholar" | "url";
        }[];
    }>;
    importLibrary: (input: LibraryInput) => Promise<{
        references: {
            originalText: string;
            span: {
                start: number;
                end: number;
            };
            authorsTruncated?: boolean | undefined;
            fieldSources: Record<string, {
                raw: string;
                span?: {
                    start: number;
                    end: number;
                } | undefined;
                normalized?: string | undefined;
                provenance?: "ai" | "parser" | "user" | undefined;
            }>;
            structuring: {
                path: "ai" | "parser" | "user";
                version: string;
            };
            ai?: {
                configuration: string;
                notice: "ai-can-be-wrong";
                proposals: {
                    field: string;
                    value: unknown;
                    reason: "ungrounded";
                }[];
                changedFields: string[];
            } | undefined;
            csl: {
                type?: string | undefined;
                author?: {
                    family?: string | undefined;
                    "non-dropping-particle"?: string | undefined;
                    given?: string | undefined;
                    literal?: string | undefined;
                }[] | undefined;
                issued?: {
                    literal: string;
                } | undefined;
                title?: string | undefined;
                "container-title"?: string | undefined;
                "container-title-short"?: string | undefined;
                publisher?: string | undefined;
                "publisher-place"?: string | undefined;
                volume?: string | undefined;
                issue?: string | undefined;
                page?: string | undefined;
                "article-number"?: string | undefined;
                edition?: string | undefined;
                DOI?: string | undefined;
                URL?: string | undefined;
                ISBN?: string | undefined;
                ISSN?: string | undefined;
                PMID?: string | undefined;
                PMCID?: string | undefined;
                arXiv?: string | undefined;
            };
            imported?: {
                format: "bibtex" | "ris";
                unsupported: {
                    name: string;
                    value: string;
                }[];
                fields: {
                    type?: string | undefined;
                    author?: {
                        family?: string | undefined;
                        "non-dropping-particle"?: string | undefined;
                        given?: string | undefined;
                        literal?: string | undefined;
                    }[] | undefined;
                    issued?: {
                        literal: string;
                    } | undefined;
                    title?: string | undefined;
                    "container-title"?: string | undefined;
                    "container-title-short"?: string | undefined;
                    publisher?: string | undefined;
                    "publisher-place"?: string | undefined;
                    volume?: string | undefined;
                    issue?: string | undefined;
                    page?: string | undefined;
                    "article-number"?: string | undefined;
                    edition?: string | undefined;
                    DOI?: string | undefined;
                    URL?: string | undefined;
                    ISBN?: string | undefined;
                    ISSN?: string | undefined;
                    PMID?: string | undefined;
                    PMCID?: string | undefined;
                    arXiv?: string | undefined;
                };
            } | undefined;
        }[];
        rejected: {
            originalText: string;
            span: {
                start: number;
                end: number;
            };
            reason: "malformed-record";
        }[];
        quotaConsumed: 0;
        referenceLimit: number;
    }>;
    editSelection: (checkId: string, input: EditSelectionRequest) => Promise<{
        id: string;
        state: "ended" | "running";
        lastEventSeq: number;
        lastEventCursor: string;
        leaseRenewAfterMs: number;
        endReason: "cancelled" | "completed" | "lease-expired" | null;
        document?: {
            text: string;
            selection: {
                version: string;
                regions: {
                    start: number;
                    end: number;
                }[];
            };
        } | null | undefined;
        references: {
            slot: number;
            originalText: string;
            revision: number;
            fields: {
                type?: string | undefined;
                author?: {
                    family?: string | undefined;
                    "non-dropping-particle"?: string | undefined;
                    given?: string | undefined;
                    literal?: string | undefined;
                }[] | undefined;
                issued?: {
                    literal: string;
                } | undefined;
                title?: string | undefined;
                "container-title"?: string | undefined;
                "container-title-short"?: string | undefined;
                publisher?: string | undefined;
                "publisher-place"?: string | undefined;
                volume?: string | undefined;
                issue?: string | undefined;
                page?: string | undefined;
                "article-number"?: string | undefined;
                edition?: string | undefined;
                DOI?: string | undefined;
                URL?: string | undefined;
                ISBN?: string | undefined;
                ISSN?: string | undefined;
                PMID?: string | undefined;
                PMCID?: string | undefined;
                arXiv?: string | undefined;
            };
            authorsTruncated?: boolean | undefined;
            revisions: {
                revision: number;
                reference: {
                    originalText: string;
                    span: {
                        start: number;
                        end: number;
                    };
                    authorsTruncated?: boolean | undefined;
                    fieldSources: Record<string, {
                        raw: string;
                        span?: {
                            start: number;
                            end: number;
                        } | undefined;
                        normalized?: string | undefined;
                        provenance?: "ai" | "parser" | "user" | undefined;
                    }>;
                    structuring: {
                        path: "ai" | "parser" | "user";
                        version: string;
                    };
                    ai?: {
                        configuration: string;
                        notice: "ai-can-be-wrong";
                        proposals: {
                            field: string;
                            value: unknown;
                            reason: "ungrounded";
                        }[];
                        changedFields: string[];
                    } | undefined;
                    csl: {
                        type?: string | undefined;
                        author?: {
                            family?: string | undefined;
                            "non-dropping-particle"?: string | undefined;
                            given?: string | undefined;
                            literal?: string | undefined;
                        }[] | undefined;
                        issued?: {
                            literal: string;
                        } | undefined;
                        title?: string | undefined;
                        "container-title"?: string | undefined;
                        "container-title-short"?: string | undefined;
                        publisher?: string | undefined;
                        "publisher-place"?: string | undefined;
                        volume?: string | undefined;
                        issue?: string | undefined;
                        page?: string | undefined;
                        "article-number"?: string | undefined;
                        edition?: string | undefined;
                        DOI?: string | undefined;
                        URL?: string | undefined;
                        ISBN?: string | undefined;
                        ISSN?: string | undefined;
                        PMID?: string | undefined;
                        PMCID?: string | undefined;
                        arXiv?: string | undefined;
                    };
                    imported?: {
                        format: "bibtex" | "ris";
                        unsupported: {
                            name: string;
                            value: string;
                        }[];
                        fields: {
                            type?: string | undefined;
                            author?: {
                                family?: string | undefined;
                                "non-dropping-particle"?: string | undefined;
                                given?: string | undefined;
                                literal?: string | undefined;
                            }[] | undefined;
                            issued?: {
                                literal: string;
                            } | undefined;
                            title?: string | undefined;
                            "container-title"?: string | undefined;
                            "container-title-short"?: string | undefined;
                            publisher?: string | undefined;
                            "publisher-place"?: string | undefined;
                            volume?: string | undefined;
                            issue?: string | undefined;
                            page?: string | undefined;
                            "article-number"?: string | undefined;
                            edition?: string | undefined;
                            DOI?: string | undefined;
                            URL?: string | undefined;
                            ISBN?: string | undefined;
                            ISSN?: string | undefined;
                            PMID?: string | undefined;
                            PMCID?: string | undefined;
                            arXiv?: string | undefined;
                        };
                    } | undefined;
                };
                provenance: "ai" | "parser" | "user";
                createdAt: string;
            }[];
            results: {
                id: string;
                revision: number;
                generation: number;
                createdAt: string;
                outcome: {
                    kind: "status";
                    status: "cancelled" | "failed" | "not-checked" | "running";
                } | {
                    kind: "verdict";
                    verdict: "correct" | "doi-conflict" | "exists-with-deviations" | "mixed-citation" | "not-found" | "not-verifiable";
                    scoringRules: {
                        version: string;
                        calibration: "uncalibrated";
                        unicode: string;
                        icu: string;
                        profile: Record<string, number>;
                    };
                    searchStrategyVersion: string;
                    searchConfiguration: Record<string, string | number>;
                    bestMatchId: string | null;
                    reference: {
                        originalText: string;
                        span: {
                            start: number;
                            end: number;
                        };
                        authorsTruncated?: boolean | undefined;
                        fieldSources: Record<string, {
                            raw: string;
                            span?: {
                                start: number;
                                end: number;
                            } | undefined;
                            normalized?: string | undefined;
                            provenance?: "ai" | "parser" | "user" | undefined;
                        }>;
                        structuring: {
                            path: "ai" | "parser" | "user";
                            version: string;
                        };
                        ai?: {
                            configuration: string;
                            notice: "ai-can-be-wrong";
                            proposals: {
                                field: string;
                                value: unknown;
                                reason: "ungrounded";
                            }[];
                            changedFields: string[];
                        } | undefined;
                        csl: {
                            type?: string | undefined;
                            author?: {
                                family?: string | undefined;
                                "non-dropping-particle"?: string | undefined;
                                given?: string | undefined;
                                literal?: string | undefined;
                            }[] | undefined;
                            issued?: {
                                literal: string;
                            } | undefined;
                            title?: string | undefined;
                            "container-title"?: string | undefined;
                            "container-title-short"?: string | undefined;
                            publisher?: string | undefined;
                            "publisher-place"?: string | undefined;
                            volume?: string | undefined;
                            issue?: string | undefined;
                            page?: string | undefined;
                            "article-number"?: string | undefined;
                            edition?: string | undefined;
                            DOI?: string | undefined;
                            URL?: string | undefined;
                            ISBN?: string | undefined;
                            ISSN?: string | undefined;
                            PMID?: string | undefined;
                            PMCID?: string | undefined;
                            arXiv?: string | undefined;
                        };
                        imported?: {
                            format: "bibtex" | "ris";
                            unsupported: {
                                name: string;
                                value: string;
                            }[];
                            fields: {
                                type?: string | undefined;
                                author?: {
                                    family?: string | undefined;
                                    "non-dropping-particle"?: string | undefined;
                                    given?: string | undefined;
                                    literal?: string | undefined;
                                }[] | undefined;
                                issued?: {
                                    literal: string;
                                } | undefined;
                                title?: string | undefined;
                                "container-title"?: string | undefined;
                                "container-title-short"?: string | undefined;
                                publisher?: string | undefined;
                                "publisher-place"?: string | undefined;
                                volume?: string | undefined;
                                issue?: string | undefined;
                                page?: string | undefined;
                                "article-number"?: string | undefined;
                                edition?: string | undefined;
                                DOI?: string | undefined;
                                URL?: string | undefined;
                                ISBN?: string | undefined;
                                ISSN?: string | undefined;
                                PMID?: string | undefined;
                                PMCID?: string | undefined;
                                arXiv?: string | undefined;
                            };
                        } | undefined;
                    };
                    identity: {
                        candidateId?: string | undefined;
                        kind: "independent-bibliography" | "supplied-doi" | "supplied-identifier" | "unresolved" | "web-archive" | "web-url";
                    };
                    candidates: {
                        id: string;
                        slot: number;
                        retrievedAt: string;
                        raw: unknown;
                        score: {
                            value: number;
                            fullAgreement: boolean;
                        } | null;
                        csl: {
                            type?: string | undefined;
                            author?: {
                                family?: string | undefined;
                                "non-dropping-particle"?: string | undefined;
                                given?: string | undefined;
                                literal?: string | undefined;
                            }[] | undefined;
                            issued?: {
                                literal: string;
                            } | undefined;
                            title?: string | undefined;
                            "container-title"?: string | undefined;
                            "container-title-short"?: string | undefined;
                            publisher?: string | undefined;
                            "publisher-place"?: string | undefined;
                            volume?: string | undefined;
                            issue?: string | undefined;
                            page?: string | undefined;
                            "article-number"?: string | undefined;
                            edition?: string | undefined;
                            DOI?: string | undefined;
                            URL?: string | undefined;
                            ISBN?: string | undefined;
                            ISSN?: string | undefined;
                            PMID?: string | undefined;
                            PMCID?: string | undefined;
                            arXiv?: string | undefined;
                        };
                        fields: {
                            field: string;
                            reference: unknown;
                            candidate: unknown;
                            score: {
                                value: number;
                                fullAgreement: boolean;
                            } | null;
                            reason: "compared" | "missing-candidate" | "missing-reference" | "not-determinable" | "resource-limit" | "unweighted";
                            agreement?: boolean | undefined;
                            journalAbbreviation?: {
                                outcome: "different" | "match" | "not-determinable";
                                reason: "attested-match" | "attested-other-journal" | "no-attestation";
                                attestations: {
                                    source: "crossref" | "europepmc" | "nlm" | "semanticscholar";
                                    role: "candidate" | "reference";
                                    journalTitle: string;
                                    abbreviation: string;
                                    nlmId?: string | undefined;
                                    snapshotDate?: string | undefined;
                                }[];
                            } | undefined;
                        }[];
                        source: "arxiv" | "crossref" | "europepmc" | "googlebooks" | "internetarchive" | "openalex" | "openlibrary" | "semanticscholar" | "url";
                        origin: "archive" | "arxiv" | "authors-year" | "combined" | "doi" | "isbn" | "pmcid" | "pmid" | "title" | "url";
                        identifiers?: string[] | undefined;
                        identityAmbiguous?: boolean | undefined;
                        retractionEvidence?: {
                            source: "crossref" | "europepmc" | "openalex";
                            candidateId: string;
                            observedAt: string;
                        } | undefined;
                    }[];
                    evidence: {
                        reason?: string | undefined;
                        status?: number | undefined;
                        durationMs: number;
                        attempts: number;
                        observedAt: string;
                        raw?: unknown;
                        source: "arxiv" | "crossref" | "doi.org" | "europepmc" | "googlebooks" | "internetarchive" | "openalex" | "openlibrary" | "semanticscholar" | "url";
                        operation: "archive" | "arxiv" | "authors-year" | "combined" | "doi" | "isbn" | "pmcid" | "pmid" | "title" | "url";
                        outcome: "candidate" | "disabled" | "exists" | "no-record" | "nonexistent" | "redirect" | "skipped" | "unavailable" | "unsupported";
                        web?: {
                            originalUrl: string;
                            finalUrl: string;
                            status: number;
                            title?: string | undefined;
                            redirectTarget?: string | undefined;
                            archiveUrl?: string | undefined;
                            timestamp?: string | undefined;
                        } | undefined;
                        skippedDuplicates?: string[] | undefined;
                        unusedSlots?: number | undefined;
                        identifierAmbiguity?: string[] | undefined;
                    }[];
                    reasons: ("ambiguous-identity" | "development-route-incomplete" | "doi-nonexistent" | "fields-differ" | "foreign-doi" | "identified" | "identity-unresolved" | "insufficient-search" | "mandatory-resolution-incomplete" | "metadata-unavailable" | "mixed-components" | "outside-coverage" | "search-completed" | "sources-unavailable" | "url-unavailable" | "url-verification-incomplete" | "web-original-unavailable")[];
                    failedSources: ("arxiv" | "crossref" | "doi.org" | "europepmc" | "googlebooks" | "internetarchive" | "openalex" | "openlibrary" | "semanticscholar" | "url")[];
                    retraction: "retracted" | "unknown";
                    retractionEvidence?: {
                        source: "crossref" | "europepmc" | "openalex";
                        candidateId: string;
                        observedAt: string;
                    }[] | undefined;
                };
                manualOverride: {
                    id: string;
                    resultId: string;
                    verdict: "correct" | "doi-conflict" | "exists-with-deviations" | "mixed-citation" | "not-found" | "not-verifiable";
                    createdAt: string;
                } | null;
            }[];
            manualOverride: {
                id: string;
                resultId: string;
                verdict: "correct" | "doi-conflict" | "exists-with-deviations" | "mixed-citation" | "not-found" | "not-verifiable";
                createdAt: string;
            } | null;
            manualOverrideReset: boolean;
            quotaEffect: "free-recheck" | "new-work";
            outcome: {
                kind: "status";
                status: "cancelled" | "failed" | "not-checked" | "running";
            } | {
                kind: "verdict";
                verdict: "correct" | "doi-conflict" | "exists-with-deviations" | "mixed-citation" | "not-found" | "not-verifiable";
                scoringRules: {
                    version: string;
                    calibration: "uncalibrated";
                    unicode: string;
                    icu: string;
                    profile: Record<string, number>;
                };
                searchStrategyVersion: string;
                searchConfiguration: Record<string, string | number>;
                bestMatchId: string | null;
                reference: {
                    originalText: string;
                    span: {
                        start: number;
                        end: number;
                    };
                    authorsTruncated?: boolean | undefined;
                    fieldSources: Record<string, {
                        raw: string;
                        span?: {
                            start: number;
                            end: number;
                        } | undefined;
                        normalized?: string | undefined;
                        provenance?: "ai" | "parser" | "user" | undefined;
                    }>;
                    structuring: {
                        path: "ai" | "parser" | "user";
                        version: string;
                    };
                    ai?: {
                        configuration: string;
                        notice: "ai-can-be-wrong";
                        proposals: {
                            field: string;
                            value: unknown;
                            reason: "ungrounded";
                        }[];
                        changedFields: string[];
                    } | undefined;
                    csl: {
                        type?: string | undefined;
                        author?: {
                            family?: string | undefined;
                            "non-dropping-particle"?: string | undefined;
                            given?: string | undefined;
                            literal?: string | undefined;
                        }[] | undefined;
                        issued?: {
                            literal: string;
                        } | undefined;
                        title?: string | undefined;
                        "container-title"?: string | undefined;
                        "container-title-short"?: string | undefined;
                        publisher?: string | undefined;
                        "publisher-place"?: string | undefined;
                        volume?: string | undefined;
                        issue?: string | undefined;
                        page?: string | undefined;
                        "article-number"?: string | undefined;
                        edition?: string | undefined;
                        DOI?: string | undefined;
                        URL?: string | undefined;
                        ISBN?: string | undefined;
                        ISSN?: string | undefined;
                        PMID?: string | undefined;
                        PMCID?: string | undefined;
                        arXiv?: string | undefined;
                    };
                    imported?: {
                        format: "bibtex" | "ris";
                        unsupported: {
                            name: string;
                            value: string;
                        }[];
                        fields: {
                            type?: string | undefined;
                            author?: {
                                family?: string | undefined;
                                "non-dropping-particle"?: string | undefined;
                                given?: string | undefined;
                                literal?: string | undefined;
                            }[] | undefined;
                            issued?: {
                                literal: string;
                            } | undefined;
                            title?: string | undefined;
                            "container-title"?: string | undefined;
                            "container-title-short"?: string | undefined;
                            publisher?: string | undefined;
                            "publisher-place"?: string | undefined;
                            volume?: string | undefined;
                            issue?: string | undefined;
                            page?: string | undefined;
                            "article-number"?: string | undefined;
                            edition?: string | undefined;
                            DOI?: string | undefined;
                            URL?: string | undefined;
                            ISBN?: string | undefined;
                            ISSN?: string | undefined;
                            PMID?: string | undefined;
                            PMCID?: string | undefined;
                            arXiv?: string | undefined;
                        };
                    } | undefined;
                };
                identity: {
                    candidateId?: string | undefined;
                    kind: "independent-bibliography" | "supplied-doi" | "supplied-identifier" | "unresolved" | "web-archive" | "web-url";
                };
                candidates: {
                    id: string;
                    slot: number;
                    retrievedAt: string;
                    raw: unknown;
                    score: {
                        value: number;
                        fullAgreement: boolean;
                    } | null;
                    csl: {
                        type?: string | undefined;
                        author?: {
                            family?: string | undefined;
                            "non-dropping-particle"?: string | undefined;
                            given?: string | undefined;
                            literal?: string | undefined;
                        }[] | undefined;
                        issued?: {
                            literal: string;
                        } | undefined;
                        title?: string | undefined;
                        "container-title"?: string | undefined;
                        "container-title-short"?: string | undefined;
                        publisher?: string | undefined;
                        "publisher-place"?: string | undefined;
                        volume?: string | undefined;
                        issue?: string | undefined;
                        page?: string | undefined;
                        "article-number"?: string | undefined;
                        edition?: string | undefined;
                        DOI?: string | undefined;
                        URL?: string | undefined;
                        ISBN?: string | undefined;
                        ISSN?: string | undefined;
                        PMID?: string | undefined;
                        PMCID?: string | undefined;
                        arXiv?: string | undefined;
                    };
                    fields: {
                        field: string;
                        reference: unknown;
                        candidate: unknown;
                        score: {
                            value: number;
                            fullAgreement: boolean;
                        } | null;
                        reason: "compared" | "missing-candidate" | "missing-reference" | "not-determinable" | "resource-limit" | "unweighted";
                        agreement?: boolean | undefined;
                        journalAbbreviation?: {
                            outcome: "different" | "match" | "not-determinable";
                            reason: "attested-match" | "attested-other-journal" | "no-attestation";
                            attestations: {
                                source: "crossref" | "europepmc" | "nlm" | "semanticscholar";
                                role: "candidate" | "reference";
                                journalTitle: string;
                                abbreviation: string;
                                nlmId?: string | undefined;
                                snapshotDate?: string | undefined;
                            }[];
                        } | undefined;
                    }[];
                    source: "arxiv" | "crossref" | "europepmc" | "googlebooks" | "internetarchive" | "openalex" | "openlibrary" | "semanticscholar" | "url";
                    origin: "archive" | "arxiv" | "authors-year" | "combined" | "doi" | "isbn" | "pmcid" | "pmid" | "title" | "url";
                    identifiers?: string[] | undefined;
                    identityAmbiguous?: boolean | undefined;
                    retractionEvidence?: {
                        source: "crossref" | "europepmc" | "openalex";
                        candidateId: string;
                        observedAt: string;
                    } | undefined;
                }[];
                evidence: {
                    reason?: string | undefined;
                    status?: number | undefined;
                    durationMs: number;
                    attempts: number;
                    observedAt: string;
                    raw?: unknown;
                    source: "arxiv" | "crossref" | "doi.org" | "europepmc" | "googlebooks" | "internetarchive" | "openalex" | "openlibrary" | "semanticscholar" | "url";
                    operation: "archive" | "arxiv" | "authors-year" | "combined" | "doi" | "isbn" | "pmcid" | "pmid" | "title" | "url";
                    outcome: "candidate" | "disabled" | "exists" | "no-record" | "nonexistent" | "redirect" | "skipped" | "unavailable" | "unsupported";
                    web?: {
                        originalUrl: string;
                        finalUrl: string;
                        status: number;
                        title?: string | undefined;
                        redirectTarget?: string | undefined;
                        archiveUrl?: string | undefined;
                        timestamp?: string | undefined;
                    } | undefined;
                    skippedDuplicates?: string[] | undefined;
                    unusedSlots?: number | undefined;
                    identifierAmbiguity?: string[] | undefined;
                }[];
                reasons: ("ambiguous-identity" | "development-route-incomplete" | "doi-nonexistent" | "fields-differ" | "foreign-doi" | "identified" | "identity-unresolved" | "insufficient-search" | "mandatory-resolution-incomplete" | "metadata-unavailable" | "mixed-components" | "outside-coverage" | "search-completed" | "sources-unavailable" | "url-unavailable" | "url-verification-incomplete" | "web-original-unavailable")[];
                failedSources: ("arxiv" | "crossref" | "doi.org" | "europepmc" | "googlebooks" | "internetarchive" | "openalex" | "openlibrary" | "semanticscholar" | "url")[];
                retraction: "retracted" | "unknown";
                retractionEvidence?: {
                    source: "crossref" | "europepmc" | "openalex";
                    candidateId: string;
                    observedAt: string;
                }[] | undefined;
            };
            progress: "arxiv" | "checking" | "crossref" | "doi.org" | "ended" | "europepmc" | "googlebooks" | "internetarchive" | "openalex" | "openlibrary" | "queued" | "semanticscholar" | "url";
        }[];
    }>;
    previewSelection: (checkId: string, input: EditSelectionRequest) => Promise<{
        prepared?: {
            text: string;
            result: {
                rejected: {
                    originalText: string;
                    span: {
                        start: number;
                        end: number;
                    };
                    reason: "no-reference-features";
                }[];
                guidance: "no-references" | null;
                quotaConsumed: 0;
                referenceLimit: number;
                receipt?: {
                    expiresAt: number;
                    signature: string;
                } | undefined;
                references: {
                    originalText: string;
                    span: {
                        start: number;
                        end: number;
                    };
                    authorsTruncated?: boolean | undefined;
                    csl: {
                        type?: string | undefined;
                        author?: {
                            family?: string | undefined;
                            "non-dropping-particle"?: string | undefined;
                            given?: string | undefined;
                            literal?: string | undefined;
                        }[] | undefined;
                        issued?: {
                            literal: string;
                        } | undefined;
                        title?: string | undefined;
                        "container-title"?: string | undefined;
                        "container-title-short"?: string | undefined;
                        publisher?: string | undefined;
                        "publisher-place"?: string | undefined;
                        volume?: string | undefined;
                        issue?: string | undefined;
                        page?: string | undefined;
                        "article-number"?: string | undefined;
                        edition?: string | undefined;
                        DOI?: string | undefined;
                        URL?: string | undefined;
                        ISBN?: string | undefined;
                        ISSN?: string | undefined;
                        PMID?: string | undefined;
                        PMCID?: string | undefined;
                        arXiv?: string | undefined;
                    };
                    fieldSources: Record<string, {
                        raw: string;
                        span?: {
                            start: number;
                            end: number;
                        } | undefined;
                        normalized?: string | undefined;
                        provenance?: "ai" | "parser" | "user" | undefined;
                    }>;
                    structuring: {
                        path: "ai" | "parser" | "user";
                        version: string;
                    };
                    ai?: {
                        configuration: string;
                        notice: "ai-can-be-wrong";
                        proposals: {
                            field: string;
                            value: unknown;
                            reason: "ungrounded";
                        }[];
                        changedFields: string[];
                    } | undefined;
                }[];
                ai?: {
                    reason: "configuration-unavailable" | "feature-unavailable" | "guest" | null;
                    upgrade: boolean;
                    fallbacks: {
                        span: {
                            start: number;
                            end: number;
                        };
                        reason: "invalid-output" | "provider-unavailable" | "timeout";
                    }[];
                } | undefined;
            };
        }[] | undefined;
        expectedEventSeq: number;
        regions: {
            start: number;
            end: number;
        }[];
        unchanged: number[];
        removed: number[];
        added: number;
        addedReferences: {
            originalText: string;
            span: {
                start: number;
                end: number;
            };
            authorsTruncated?: boolean | undefined;
            fieldSources: Record<string, {
                raw: string;
                span?: {
                    start: number;
                    end: number;
                } | undefined;
                normalized?: string | undefined;
                provenance?: "ai" | "parser" | "user" | undefined;
            }>;
            structuring: {
                path: "ai" | "parser" | "user";
                version: string;
            };
            ai?: {
                configuration: string;
                notice: "ai-can-be-wrong";
                proposals: {
                    field: string;
                    value: unknown;
                    reason: "ungrounded";
                }[];
                changedFields: string[];
            } | undefined;
            csl: {
                type?: string | undefined;
                author?: {
                    family?: string | undefined;
                    "non-dropping-particle"?: string | undefined;
                    given?: string | undefined;
                    literal?: string | undefined;
                }[] | undefined;
                issued?: {
                    literal: string;
                } | undefined;
                title?: string | undefined;
                "container-title"?: string | undefined;
                "container-title-short"?: string | undefined;
                publisher?: string | undefined;
                "publisher-place"?: string | undefined;
                volume?: string | undefined;
                issue?: string | undefined;
                page?: string | undefined;
                "article-number"?: string | undefined;
                edition?: string | undefined;
                DOI?: string | undefined;
                URL?: string | undefined;
                ISBN?: string | undefined;
                ISSN?: string | undefined;
                PMID?: string | undefined;
                PMCID?: string | undefined;
                arXiv?: string | undefined;
            };
            imported?: {
                format: "bibtex" | "ris";
                unsupported: {
                    name: string;
                    value: string;
                }[];
                fields: {
                    type?: string | undefined;
                    author?: {
                        family?: string | undefined;
                        "non-dropping-particle"?: string | undefined;
                        given?: string | undefined;
                        literal?: string | undefined;
                    }[] | undefined;
                    issued?: {
                        literal: string;
                    } | undefined;
                    title?: string | undefined;
                    "container-title"?: string | undefined;
                    "container-title-short"?: string | undefined;
                    publisher?: string | undefined;
                    "publisher-place"?: string | undefined;
                    volume?: string | undefined;
                    issue?: string | undefined;
                    page?: string | undefined;
                    "article-number"?: string | undefined;
                    edition?: string | undefined;
                    DOI?: string | undefined;
                    URL?: string | undefined;
                    ISBN?: string | undefined;
                    ISSN?: string | undefined;
                    PMID?: string | undefined;
                    PMCID?: string | undefined;
                    arXiv?: string | undefined;
                };
            } | undefined;
        }[];
        total: number;
        additionalQuota: number;
        rejected: {
            originalText: string;
            span: {
                start: number;
                end: number;
            };
            reason: "no-reference-features";
        }[];
    }>;
    saveFields: (id: string, slot: number, input: SaveFieldsRequest) => Promise<{
        id: string;
        state: "ended" | "running";
        lastEventSeq: number;
        lastEventCursor: string;
        leaseRenewAfterMs: number;
        endReason: "cancelled" | "completed" | "lease-expired" | null;
        document?: {
            text: string;
            selection: {
                version: string;
                regions: {
                    start: number;
                    end: number;
                }[];
            };
        } | null | undefined;
        references: {
            slot: number;
            originalText: string;
            revision: number;
            fields: {
                type?: string | undefined;
                author?: {
                    family?: string | undefined;
                    "non-dropping-particle"?: string | undefined;
                    given?: string | undefined;
                    literal?: string | undefined;
                }[] | undefined;
                issued?: {
                    literal: string;
                } | undefined;
                title?: string | undefined;
                "container-title"?: string | undefined;
                "container-title-short"?: string | undefined;
                publisher?: string | undefined;
                "publisher-place"?: string | undefined;
                volume?: string | undefined;
                issue?: string | undefined;
                page?: string | undefined;
                "article-number"?: string | undefined;
                edition?: string | undefined;
                DOI?: string | undefined;
                URL?: string | undefined;
                ISBN?: string | undefined;
                ISSN?: string | undefined;
                PMID?: string | undefined;
                PMCID?: string | undefined;
                arXiv?: string | undefined;
            };
            authorsTruncated?: boolean | undefined;
            revisions: {
                revision: number;
                reference: {
                    originalText: string;
                    span: {
                        start: number;
                        end: number;
                    };
                    authorsTruncated?: boolean | undefined;
                    fieldSources: Record<string, {
                        raw: string;
                        span?: {
                            start: number;
                            end: number;
                        } | undefined;
                        normalized?: string | undefined;
                        provenance?: "ai" | "parser" | "user" | undefined;
                    }>;
                    structuring: {
                        path: "ai" | "parser" | "user";
                        version: string;
                    };
                    ai?: {
                        configuration: string;
                        notice: "ai-can-be-wrong";
                        proposals: {
                            field: string;
                            value: unknown;
                            reason: "ungrounded";
                        }[];
                        changedFields: string[];
                    } | undefined;
                    csl: {
                        type?: string | undefined;
                        author?: {
                            family?: string | undefined;
                            "non-dropping-particle"?: string | undefined;
                            given?: string | undefined;
                            literal?: string | undefined;
                        }[] | undefined;
                        issued?: {
                            literal: string;
                        } | undefined;
                        title?: string | undefined;
                        "container-title"?: string | undefined;
                        "container-title-short"?: string | undefined;
                        publisher?: string | undefined;
                        "publisher-place"?: string | undefined;
                        volume?: string | undefined;
                        issue?: string | undefined;
                        page?: string | undefined;
                        "article-number"?: string | undefined;
                        edition?: string | undefined;
                        DOI?: string | undefined;
                        URL?: string | undefined;
                        ISBN?: string | undefined;
                        ISSN?: string | undefined;
                        PMID?: string | undefined;
                        PMCID?: string | undefined;
                        arXiv?: string | undefined;
                    };
                    imported?: {
                        format: "bibtex" | "ris";
                        unsupported: {
                            name: string;
                            value: string;
                        }[];
                        fields: {
                            type?: string | undefined;
                            author?: {
                                family?: string | undefined;
                                "non-dropping-particle"?: string | undefined;
                                given?: string | undefined;
                                literal?: string | undefined;
                            }[] | undefined;
                            issued?: {
                                literal: string;
                            } | undefined;
                            title?: string | undefined;
                            "container-title"?: string | undefined;
                            "container-title-short"?: string | undefined;
                            publisher?: string | undefined;
                            "publisher-place"?: string | undefined;
                            volume?: string | undefined;
                            issue?: string | undefined;
                            page?: string | undefined;
                            "article-number"?: string | undefined;
                            edition?: string | undefined;
                            DOI?: string | undefined;
                            URL?: string | undefined;
                            ISBN?: string | undefined;
                            ISSN?: string | undefined;
                            PMID?: string | undefined;
                            PMCID?: string | undefined;
                            arXiv?: string | undefined;
                        };
                    } | undefined;
                };
                provenance: "ai" | "parser" | "user";
                createdAt: string;
            }[];
            results: {
                id: string;
                revision: number;
                generation: number;
                createdAt: string;
                outcome: {
                    kind: "status";
                    status: "cancelled" | "failed" | "not-checked" | "running";
                } | {
                    kind: "verdict";
                    verdict: "correct" | "doi-conflict" | "exists-with-deviations" | "mixed-citation" | "not-found" | "not-verifiable";
                    scoringRules: {
                        version: string;
                        calibration: "uncalibrated";
                        unicode: string;
                        icu: string;
                        profile: Record<string, number>;
                    };
                    searchStrategyVersion: string;
                    searchConfiguration: Record<string, string | number>;
                    bestMatchId: string | null;
                    reference: {
                        originalText: string;
                        span: {
                            start: number;
                            end: number;
                        };
                        authorsTruncated?: boolean | undefined;
                        fieldSources: Record<string, {
                            raw: string;
                            span?: {
                                start: number;
                                end: number;
                            } | undefined;
                            normalized?: string | undefined;
                            provenance?: "ai" | "parser" | "user" | undefined;
                        }>;
                        structuring: {
                            path: "ai" | "parser" | "user";
                            version: string;
                        };
                        ai?: {
                            configuration: string;
                            notice: "ai-can-be-wrong";
                            proposals: {
                                field: string;
                                value: unknown;
                                reason: "ungrounded";
                            }[];
                            changedFields: string[];
                        } | undefined;
                        csl: {
                            type?: string | undefined;
                            author?: {
                                family?: string | undefined;
                                "non-dropping-particle"?: string | undefined;
                                given?: string | undefined;
                                literal?: string | undefined;
                            }[] | undefined;
                            issued?: {
                                literal: string;
                            } | undefined;
                            title?: string | undefined;
                            "container-title"?: string | undefined;
                            "container-title-short"?: string | undefined;
                            publisher?: string | undefined;
                            "publisher-place"?: string | undefined;
                            volume?: string | undefined;
                            issue?: string | undefined;
                            page?: string | undefined;
                            "article-number"?: string | undefined;
                            edition?: string | undefined;
                            DOI?: string | undefined;
                            URL?: string | undefined;
                            ISBN?: string | undefined;
                            ISSN?: string | undefined;
                            PMID?: string | undefined;
                            PMCID?: string | undefined;
                            arXiv?: string | undefined;
                        };
                        imported?: {
                            format: "bibtex" | "ris";
                            unsupported: {
                                name: string;
                                value: string;
                            }[];
                            fields: {
                                type?: string | undefined;
                                author?: {
                                    family?: string | undefined;
                                    "non-dropping-particle"?: string | undefined;
                                    given?: string | undefined;
                                    literal?: string | undefined;
                                }[] | undefined;
                                issued?: {
                                    literal: string;
                                } | undefined;
                                title?: string | undefined;
                                "container-title"?: string | undefined;
                                "container-title-short"?: string | undefined;
                                publisher?: string | undefined;
                                "publisher-place"?: string | undefined;
                                volume?: string | undefined;
                                issue?: string | undefined;
                                page?: string | undefined;
                                "article-number"?: string | undefined;
                                edition?: string | undefined;
                                DOI?: string | undefined;
                                URL?: string | undefined;
                                ISBN?: string | undefined;
                                ISSN?: string | undefined;
                                PMID?: string | undefined;
                                PMCID?: string | undefined;
                                arXiv?: string | undefined;
                            };
                        } | undefined;
                    };
                    identity: {
                        candidateId?: string | undefined;
                        kind: "independent-bibliography" | "supplied-doi" | "supplied-identifier" | "unresolved" | "web-archive" | "web-url";
                    };
                    candidates: {
                        id: string;
                        slot: number;
                        retrievedAt: string;
                        raw: unknown;
                        score: {
                            value: number;
                            fullAgreement: boolean;
                        } | null;
                        csl: {
                            type?: string | undefined;
                            author?: {
                                family?: string | undefined;
                                "non-dropping-particle"?: string | undefined;
                                given?: string | undefined;
                                literal?: string | undefined;
                            }[] | undefined;
                            issued?: {
                                literal: string;
                            } | undefined;
                            title?: string | undefined;
                            "container-title"?: string | undefined;
                            "container-title-short"?: string | undefined;
                            publisher?: string | undefined;
                            "publisher-place"?: string | undefined;
                            volume?: string | undefined;
                            issue?: string | undefined;
                            page?: string | undefined;
                            "article-number"?: string | undefined;
                            edition?: string | undefined;
                            DOI?: string | undefined;
                            URL?: string | undefined;
                            ISBN?: string | undefined;
                            ISSN?: string | undefined;
                            PMID?: string | undefined;
                            PMCID?: string | undefined;
                            arXiv?: string | undefined;
                        };
                        fields: {
                            field: string;
                            reference: unknown;
                            candidate: unknown;
                            score: {
                                value: number;
                                fullAgreement: boolean;
                            } | null;
                            reason: "compared" | "missing-candidate" | "missing-reference" | "not-determinable" | "resource-limit" | "unweighted";
                            agreement?: boolean | undefined;
                            journalAbbreviation?: {
                                outcome: "different" | "match" | "not-determinable";
                                reason: "attested-match" | "attested-other-journal" | "no-attestation";
                                attestations: {
                                    source: "crossref" | "europepmc" | "nlm" | "semanticscholar";
                                    role: "candidate" | "reference";
                                    journalTitle: string;
                                    abbreviation: string;
                                    nlmId?: string | undefined;
                                    snapshotDate?: string | undefined;
                                }[];
                            } | undefined;
                        }[];
                        source: "arxiv" | "crossref" | "europepmc" | "googlebooks" | "internetarchive" | "openalex" | "openlibrary" | "semanticscholar" | "url";
                        origin: "archive" | "arxiv" | "authors-year" | "combined" | "doi" | "isbn" | "pmcid" | "pmid" | "title" | "url";
                        identifiers?: string[] | undefined;
                        identityAmbiguous?: boolean | undefined;
                        retractionEvidence?: {
                            source: "crossref" | "europepmc" | "openalex";
                            candidateId: string;
                            observedAt: string;
                        } | undefined;
                    }[];
                    evidence: {
                        reason?: string | undefined;
                        status?: number | undefined;
                        durationMs: number;
                        attempts: number;
                        observedAt: string;
                        raw?: unknown;
                        source: "arxiv" | "crossref" | "doi.org" | "europepmc" | "googlebooks" | "internetarchive" | "openalex" | "openlibrary" | "semanticscholar" | "url";
                        operation: "archive" | "arxiv" | "authors-year" | "combined" | "doi" | "isbn" | "pmcid" | "pmid" | "title" | "url";
                        outcome: "candidate" | "disabled" | "exists" | "no-record" | "nonexistent" | "redirect" | "skipped" | "unavailable" | "unsupported";
                        web?: {
                            originalUrl: string;
                            finalUrl: string;
                            status: number;
                            title?: string | undefined;
                            redirectTarget?: string | undefined;
                            archiveUrl?: string | undefined;
                            timestamp?: string | undefined;
                        } | undefined;
                        skippedDuplicates?: string[] | undefined;
                        unusedSlots?: number | undefined;
                        identifierAmbiguity?: string[] | undefined;
                    }[];
                    reasons: ("ambiguous-identity" | "development-route-incomplete" | "doi-nonexistent" | "fields-differ" | "foreign-doi" | "identified" | "identity-unresolved" | "insufficient-search" | "mandatory-resolution-incomplete" | "metadata-unavailable" | "mixed-components" | "outside-coverage" | "search-completed" | "sources-unavailable" | "url-unavailable" | "url-verification-incomplete" | "web-original-unavailable")[];
                    failedSources: ("arxiv" | "crossref" | "doi.org" | "europepmc" | "googlebooks" | "internetarchive" | "openalex" | "openlibrary" | "semanticscholar" | "url")[];
                    retraction: "retracted" | "unknown";
                    retractionEvidence?: {
                        source: "crossref" | "europepmc" | "openalex";
                        candidateId: string;
                        observedAt: string;
                    }[] | undefined;
                };
                manualOverride: {
                    id: string;
                    resultId: string;
                    verdict: "correct" | "doi-conflict" | "exists-with-deviations" | "mixed-citation" | "not-found" | "not-verifiable";
                    createdAt: string;
                } | null;
            }[];
            manualOverride: {
                id: string;
                resultId: string;
                verdict: "correct" | "doi-conflict" | "exists-with-deviations" | "mixed-citation" | "not-found" | "not-verifiable";
                createdAt: string;
            } | null;
            manualOverrideReset: boolean;
            quotaEffect: "free-recheck" | "new-work";
            outcome: {
                kind: "status";
                status: "cancelled" | "failed" | "not-checked" | "running";
            } | {
                kind: "verdict";
                verdict: "correct" | "doi-conflict" | "exists-with-deviations" | "mixed-citation" | "not-found" | "not-verifiable";
                scoringRules: {
                    version: string;
                    calibration: "uncalibrated";
                    unicode: string;
                    icu: string;
                    profile: Record<string, number>;
                };
                searchStrategyVersion: string;
                searchConfiguration: Record<string, string | number>;
                bestMatchId: string | null;
                reference: {
                    originalText: string;
                    span: {
                        start: number;
                        end: number;
                    };
                    authorsTruncated?: boolean | undefined;
                    fieldSources: Record<string, {
                        raw: string;
                        span?: {
                            start: number;
                            end: number;
                        } | undefined;
                        normalized?: string | undefined;
                        provenance?: "ai" | "parser" | "user" | undefined;
                    }>;
                    structuring: {
                        path: "ai" | "parser" | "user";
                        version: string;
                    };
                    ai?: {
                        configuration: string;
                        notice: "ai-can-be-wrong";
                        proposals: {
                            field: string;
                            value: unknown;
                            reason: "ungrounded";
                        }[];
                        changedFields: string[];
                    } | undefined;
                    csl: {
                        type?: string | undefined;
                        author?: {
                            family?: string | undefined;
                            "non-dropping-particle"?: string | undefined;
                            given?: string | undefined;
                            literal?: string | undefined;
                        }[] | undefined;
                        issued?: {
                            literal: string;
                        } | undefined;
                        title?: string | undefined;
                        "container-title"?: string | undefined;
                        "container-title-short"?: string | undefined;
                        publisher?: string | undefined;
                        "publisher-place"?: string | undefined;
                        volume?: string | undefined;
                        issue?: string | undefined;
                        page?: string | undefined;
                        "article-number"?: string | undefined;
                        edition?: string | undefined;
                        DOI?: string | undefined;
                        URL?: string | undefined;
                        ISBN?: string | undefined;
                        ISSN?: string | undefined;
                        PMID?: string | undefined;
                        PMCID?: string | undefined;
                        arXiv?: string | undefined;
                    };
                    imported?: {
                        format: "bibtex" | "ris";
                        unsupported: {
                            name: string;
                            value: string;
                        }[];
                        fields: {
                            type?: string | undefined;
                            author?: {
                                family?: string | undefined;
                                "non-dropping-particle"?: string | undefined;
                                given?: string | undefined;
                                literal?: string | undefined;
                            }[] | undefined;
                            issued?: {
                                literal: string;
                            } | undefined;
                            title?: string | undefined;
                            "container-title"?: string | undefined;
                            "container-title-short"?: string | undefined;
                            publisher?: string | undefined;
                            "publisher-place"?: string | undefined;
                            volume?: string | undefined;
                            issue?: string | undefined;
                            page?: string | undefined;
                            "article-number"?: string | undefined;
                            edition?: string | undefined;
                            DOI?: string | undefined;
                            URL?: string | undefined;
                            ISBN?: string | undefined;
                            ISSN?: string | undefined;
                            PMID?: string | undefined;
                            PMCID?: string | undefined;
                            arXiv?: string | undefined;
                        };
                    } | undefined;
                };
                identity: {
                    candidateId?: string | undefined;
                    kind: "independent-bibliography" | "supplied-doi" | "supplied-identifier" | "unresolved" | "web-archive" | "web-url";
                };
                candidates: {
                    id: string;
                    slot: number;
                    retrievedAt: string;
                    raw: unknown;
                    score: {
                        value: number;
                        fullAgreement: boolean;
                    } | null;
                    csl: {
                        type?: string | undefined;
                        author?: {
                            family?: string | undefined;
                            "non-dropping-particle"?: string | undefined;
                            given?: string | undefined;
                            literal?: string | undefined;
                        }[] | undefined;
                        issued?: {
                            literal: string;
                        } | undefined;
                        title?: string | undefined;
                        "container-title"?: string | undefined;
                        "container-title-short"?: string | undefined;
                        publisher?: string | undefined;
                        "publisher-place"?: string | undefined;
                        volume?: string | undefined;
                        issue?: string | undefined;
                        page?: string | undefined;
                        "article-number"?: string | undefined;
                        edition?: string | undefined;
                        DOI?: string | undefined;
                        URL?: string | undefined;
                        ISBN?: string | undefined;
                        ISSN?: string | undefined;
                        PMID?: string | undefined;
                        PMCID?: string | undefined;
                        arXiv?: string | undefined;
                    };
                    fields: {
                        field: string;
                        reference: unknown;
                        candidate: unknown;
                        score: {
                            value: number;
                            fullAgreement: boolean;
                        } | null;
                        reason: "compared" | "missing-candidate" | "missing-reference" | "not-determinable" | "resource-limit" | "unweighted";
                        agreement?: boolean | undefined;
                        journalAbbreviation?: {
                            outcome: "different" | "match" | "not-determinable";
                            reason: "attested-match" | "attested-other-journal" | "no-attestation";
                            attestations: {
                                source: "crossref" | "europepmc" | "nlm" | "semanticscholar";
                                role: "candidate" | "reference";
                                journalTitle: string;
                                abbreviation: string;
                                nlmId?: string | undefined;
                                snapshotDate?: string | undefined;
                            }[];
                        } | undefined;
                    }[];
                    source: "arxiv" | "crossref" | "europepmc" | "googlebooks" | "internetarchive" | "openalex" | "openlibrary" | "semanticscholar" | "url";
                    origin: "archive" | "arxiv" | "authors-year" | "combined" | "doi" | "isbn" | "pmcid" | "pmid" | "title" | "url";
                    identifiers?: string[] | undefined;
                    identityAmbiguous?: boolean | undefined;
                    retractionEvidence?: {
                        source: "crossref" | "europepmc" | "openalex";
                        candidateId: string;
                        observedAt: string;
                    } | undefined;
                }[];
                evidence: {
                    reason?: string | undefined;
                    status?: number | undefined;
                    durationMs: number;
                    attempts: number;
                    observedAt: string;
                    raw?: unknown;
                    source: "arxiv" | "crossref" | "doi.org" | "europepmc" | "googlebooks" | "internetarchive" | "openalex" | "openlibrary" | "semanticscholar" | "url";
                    operation: "archive" | "arxiv" | "authors-year" | "combined" | "doi" | "isbn" | "pmcid" | "pmid" | "title" | "url";
                    outcome: "candidate" | "disabled" | "exists" | "no-record" | "nonexistent" | "redirect" | "skipped" | "unavailable" | "unsupported";
                    web?: {
                        originalUrl: string;
                        finalUrl: string;
                        status: number;
                        title?: string | undefined;
                        redirectTarget?: string | undefined;
                        archiveUrl?: string | undefined;
                        timestamp?: string | undefined;
                    } | undefined;
                    skippedDuplicates?: string[] | undefined;
                    unusedSlots?: number | undefined;
                    identifierAmbiguity?: string[] | undefined;
                }[];
                reasons: ("ambiguous-identity" | "development-route-incomplete" | "doi-nonexistent" | "fields-differ" | "foreign-doi" | "identified" | "identity-unresolved" | "insufficient-search" | "mandatory-resolution-incomplete" | "metadata-unavailable" | "mixed-components" | "outside-coverage" | "search-completed" | "sources-unavailable" | "url-unavailable" | "url-verification-incomplete" | "web-original-unavailable")[];
                failedSources: ("arxiv" | "crossref" | "doi.org" | "europepmc" | "googlebooks" | "internetarchive" | "openalex" | "openlibrary" | "semanticscholar" | "url")[];
                retraction: "retracted" | "unknown";
                retractionEvidence?: {
                    source: "crossref" | "europepmc" | "openalex";
                    candidateId: string;
                    observedAt: string;
                }[] | undefined;
            };
            progress: "arxiv" | "checking" | "crossref" | "doi.org" | "ended" | "europepmc" | "googlebooks" | "internetarchive" | "openalex" | "openlibrary" | "queued" | "semanticscholar" | "url";
        }[];
    }>;
    recheckReference: (id: string, slot: number, input: RecheckRequest) => Promise<{
        id: string;
        state: "ended" | "running";
        lastEventSeq: number;
        lastEventCursor: string;
        leaseRenewAfterMs: number;
        endReason: "cancelled" | "completed" | "lease-expired" | null;
        document?: {
            text: string;
            selection: {
                version: string;
                regions: {
                    start: number;
                    end: number;
                }[];
            };
        } | null | undefined;
        references: {
            slot: number;
            originalText: string;
            revision: number;
            fields: {
                type?: string | undefined;
                author?: {
                    family?: string | undefined;
                    "non-dropping-particle"?: string | undefined;
                    given?: string | undefined;
                    literal?: string | undefined;
                }[] | undefined;
                issued?: {
                    literal: string;
                } | undefined;
                title?: string | undefined;
                "container-title"?: string | undefined;
                "container-title-short"?: string | undefined;
                publisher?: string | undefined;
                "publisher-place"?: string | undefined;
                volume?: string | undefined;
                issue?: string | undefined;
                page?: string | undefined;
                "article-number"?: string | undefined;
                edition?: string | undefined;
                DOI?: string | undefined;
                URL?: string | undefined;
                ISBN?: string | undefined;
                ISSN?: string | undefined;
                PMID?: string | undefined;
                PMCID?: string | undefined;
                arXiv?: string | undefined;
            };
            authorsTruncated?: boolean | undefined;
            revisions: {
                revision: number;
                reference: {
                    originalText: string;
                    span: {
                        start: number;
                        end: number;
                    };
                    authorsTruncated?: boolean | undefined;
                    fieldSources: Record<string, {
                        raw: string;
                        span?: {
                            start: number;
                            end: number;
                        } | undefined;
                        normalized?: string | undefined;
                        provenance?: "ai" | "parser" | "user" | undefined;
                    }>;
                    structuring: {
                        path: "ai" | "parser" | "user";
                        version: string;
                    };
                    ai?: {
                        configuration: string;
                        notice: "ai-can-be-wrong";
                        proposals: {
                            field: string;
                            value: unknown;
                            reason: "ungrounded";
                        }[];
                        changedFields: string[];
                    } | undefined;
                    csl: {
                        type?: string | undefined;
                        author?: {
                            family?: string | undefined;
                            "non-dropping-particle"?: string | undefined;
                            given?: string | undefined;
                            literal?: string | undefined;
                        }[] | undefined;
                        issued?: {
                            literal: string;
                        } | undefined;
                        title?: string | undefined;
                        "container-title"?: string | undefined;
                        "container-title-short"?: string | undefined;
                        publisher?: string | undefined;
                        "publisher-place"?: string | undefined;
                        volume?: string | undefined;
                        issue?: string | undefined;
                        page?: string | undefined;
                        "article-number"?: string | undefined;
                        edition?: string | undefined;
                        DOI?: string | undefined;
                        URL?: string | undefined;
                        ISBN?: string | undefined;
                        ISSN?: string | undefined;
                        PMID?: string | undefined;
                        PMCID?: string | undefined;
                        arXiv?: string | undefined;
                    };
                    imported?: {
                        format: "bibtex" | "ris";
                        unsupported: {
                            name: string;
                            value: string;
                        }[];
                        fields: {
                            type?: string | undefined;
                            author?: {
                                family?: string | undefined;
                                "non-dropping-particle"?: string | undefined;
                                given?: string | undefined;
                                literal?: string | undefined;
                            }[] | undefined;
                            issued?: {
                                literal: string;
                            } | undefined;
                            title?: string | undefined;
                            "container-title"?: string | undefined;
                            "container-title-short"?: string | undefined;
                            publisher?: string | undefined;
                            "publisher-place"?: string | undefined;
                            volume?: string | undefined;
                            issue?: string | undefined;
                            page?: string | undefined;
                            "article-number"?: string | undefined;
                            edition?: string | undefined;
                            DOI?: string | undefined;
                            URL?: string | undefined;
                            ISBN?: string | undefined;
                            ISSN?: string | undefined;
                            PMID?: string | undefined;
                            PMCID?: string | undefined;
                            arXiv?: string | undefined;
                        };
                    } | undefined;
                };
                provenance: "ai" | "parser" | "user";
                createdAt: string;
            }[];
            results: {
                id: string;
                revision: number;
                generation: number;
                createdAt: string;
                outcome: {
                    kind: "status";
                    status: "cancelled" | "failed" | "not-checked" | "running";
                } | {
                    kind: "verdict";
                    verdict: "correct" | "doi-conflict" | "exists-with-deviations" | "mixed-citation" | "not-found" | "not-verifiable";
                    scoringRules: {
                        version: string;
                        calibration: "uncalibrated";
                        unicode: string;
                        icu: string;
                        profile: Record<string, number>;
                    };
                    searchStrategyVersion: string;
                    searchConfiguration: Record<string, string | number>;
                    bestMatchId: string | null;
                    reference: {
                        originalText: string;
                        span: {
                            start: number;
                            end: number;
                        };
                        authorsTruncated?: boolean | undefined;
                        fieldSources: Record<string, {
                            raw: string;
                            span?: {
                                start: number;
                                end: number;
                            } | undefined;
                            normalized?: string | undefined;
                            provenance?: "ai" | "parser" | "user" | undefined;
                        }>;
                        structuring: {
                            path: "ai" | "parser" | "user";
                            version: string;
                        };
                        ai?: {
                            configuration: string;
                            notice: "ai-can-be-wrong";
                            proposals: {
                                field: string;
                                value: unknown;
                                reason: "ungrounded";
                            }[];
                            changedFields: string[];
                        } | undefined;
                        csl: {
                            type?: string | undefined;
                            author?: {
                                family?: string | undefined;
                                "non-dropping-particle"?: string | undefined;
                                given?: string | undefined;
                                literal?: string | undefined;
                            }[] | undefined;
                            issued?: {
                                literal: string;
                            } | undefined;
                            title?: string | undefined;
                            "container-title"?: string | undefined;
                            "container-title-short"?: string | undefined;
                            publisher?: string | undefined;
                            "publisher-place"?: string | undefined;
                            volume?: string | undefined;
                            issue?: string | undefined;
                            page?: string | undefined;
                            "article-number"?: string | undefined;
                            edition?: string | undefined;
                            DOI?: string | undefined;
                            URL?: string | undefined;
                            ISBN?: string | undefined;
                            ISSN?: string | undefined;
                            PMID?: string | undefined;
                            PMCID?: string | undefined;
                            arXiv?: string | undefined;
                        };
                        imported?: {
                            format: "bibtex" | "ris";
                            unsupported: {
                                name: string;
                                value: string;
                            }[];
                            fields: {
                                type?: string | undefined;
                                author?: {
                                    family?: string | undefined;
                                    "non-dropping-particle"?: string | undefined;
                                    given?: string | undefined;
                                    literal?: string | undefined;
                                }[] | undefined;
                                issued?: {
                                    literal: string;
                                } | undefined;
                                title?: string | undefined;
                                "container-title"?: string | undefined;
                                "container-title-short"?: string | undefined;
                                publisher?: string | undefined;
                                "publisher-place"?: string | undefined;
                                volume?: string | undefined;
                                issue?: string | undefined;
                                page?: string | undefined;
                                "article-number"?: string | undefined;
                                edition?: string | undefined;
                                DOI?: string | undefined;
                                URL?: string | undefined;
                                ISBN?: string | undefined;
                                ISSN?: string | undefined;
                                PMID?: string | undefined;
                                PMCID?: string | undefined;
                                arXiv?: string | undefined;
                            };
                        } | undefined;
                    };
                    identity: {
                        candidateId?: string | undefined;
                        kind: "independent-bibliography" | "supplied-doi" | "supplied-identifier" | "unresolved" | "web-archive" | "web-url";
                    };
                    candidates: {
                        id: string;
                        slot: number;
                        retrievedAt: string;
                        raw: unknown;
                        score: {
                            value: number;
                            fullAgreement: boolean;
                        } | null;
                        csl: {
                            type?: string | undefined;
                            author?: {
                                family?: string | undefined;
                                "non-dropping-particle"?: string | undefined;
                                given?: string | undefined;
                                literal?: string | undefined;
                            }[] | undefined;
                            issued?: {
                                literal: string;
                            } | undefined;
                            title?: string | undefined;
                            "container-title"?: string | undefined;
                            "container-title-short"?: string | undefined;
                            publisher?: string | undefined;
                            "publisher-place"?: string | undefined;
                            volume?: string | undefined;
                            issue?: string | undefined;
                            page?: string | undefined;
                            "article-number"?: string | undefined;
                            edition?: string | undefined;
                            DOI?: string | undefined;
                            URL?: string | undefined;
                            ISBN?: string | undefined;
                            ISSN?: string | undefined;
                            PMID?: string | undefined;
                            PMCID?: string | undefined;
                            arXiv?: string | undefined;
                        };
                        fields: {
                            field: string;
                            reference: unknown;
                            candidate: unknown;
                            score: {
                                value: number;
                                fullAgreement: boolean;
                            } | null;
                            reason: "compared" | "missing-candidate" | "missing-reference" | "not-determinable" | "resource-limit" | "unweighted";
                            agreement?: boolean | undefined;
                            journalAbbreviation?: {
                                outcome: "different" | "match" | "not-determinable";
                                reason: "attested-match" | "attested-other-journal" | "no-attestation";
                                attestations: {
                                    source: "crossref" | "europepmc" | "nlm" | "semanticscholar";
                                    role: "candidate" | "reference";
                                    journalTitle: string;
                                    abbreviation: string;
                                    nlmId?: string | undefined;
                                    snapshotDate?: string | undefined;
                                }[];
                            } | undefined;
                        }[];
                        source: "arxiv" | "crossref" | "europepmc" | "googlebooks" | "internetarchive" | "openalex" | "openlibrary" | "semanticscholar" | "url";
                        origin: "archive" | "arxiv" | "authors-year" | "combined" | "doi" | "isbn" | "pmcid" | "pmid" | "title" | "url";
                        identifiers?: string[] | undefined;
                        identityAmbiguous?: boolean | undefined;
                        retractionEvidence?: {
                            source: "crossref" | "europepmc" | "openalex";
                            candidateId: string;
                            observedAt: string;
                        } | undefined;
                    }[];
                    evidence: {
                        reason?: string | undefined;
                        status?: number | undefined;
                        durationMs: number;
                        attempts: number;
                        observedAt: string;
                        raw?: unknown;
                        source: "arxiv" | "crossref" | "doi.org" | "europepmc" | "googlebooks" | "internetarchive" | "openalex" | "openlibrary" | "semanticscholar" | "url";
                        operation: "archive" | "arxiv" | "authors-year" | "combined" | "doi" | "isbn" | "pmcid" | "pmid" | "title" | "url";
                        outcome: "candidate" | "disabled" | "exists" | "no-record" | "nonexistent" | "redirect" | "skipped" | "unavailable" | "unsupported";
                        web?: {
                            originalUrl: string;
                            finalUrl: string;
                            status: number;
                            title?: string | undefined;
                            redirectTarget?: string | undefined;
                            archiveUrl?: string | undefined;
                            timestamp?: string | undefined;
                        } | undefined;
                        skippedDuplicates?: string[] | undefined;
                        unusedSlots?: number | undefined;
                        identifierAmbiguity?: string[] | undefined;
                    }[];
                    reasons: ("ambiguous-identity" | "development-route-incomplete" | "doi-nonexistent" | "fields-differ" | "foreign-doi" | "identified" | "identity-unresolved" | "insufficient-search" | "mandatory-resolution-incomplete" | "metadata-unavailable" | "mixed-components" | "outside-coverage" | "search-completed" | "sources-unavailable" | "url-unavailable" | "url-verification-incomplete" | "web-original-unavailable")[];
                    failedSources: ("arxiv" | "crossref" | "doi.org" | "europepmc" | "googlebooks" | "internetarchive" | "openalex" | "openlibrary" | "semanticscholar" | "url")[];
                    retraction: "retracted" | "unknown";
                    retractionEvidence?: {
                        source: "crossref" | "europepmc" | "openalex";
                        candidateId: string;
                        observedAt: string;
                    }[] | undefined;
                };
                manualOverride: {
                    id: string;
                    resultId: string;
                    verdict: "correct" | "doi-conflict" | "exists-with-deviations" | "mixed-citation" | "not-found" | "not-verifiable";
                    createdAt: string;
                } | null;
            }[];
            manualOverride: {
                id: string;
                resultId: string;
                verdict: "correct" | "doi-conflict" | "exists-with-deviations" | "mixed-citation" | "not-found" | "not-verifiable";
                createdAt: string;
            } | null;
            manualOverrideReset: boolean;
            quotaEffect: "free-recheck" | "new-work";
            outcome: {
                kind: "status";
                status: "cancelled" | "failed" | "not-checked" | "running";
            } | {
                kind: "verdict";
                verdict: "correct" | "doi-conflict" | "exists-with-deviations" | "mixed-citation" | "not-found" | "not-verifiable";
                scoringRules: {
                    version: string;
                    calibration: "uncalibrated";
                    unicode: string;
                    icu: string;
                    profile: Record<string, number>;
                };
                searchStrategyVersion: string;
                searchConfiguration: Record<string, string | number>;
                bestMatchId: string | null;
                reference: {
                    originalText: string;
                    span: {
                        start: number;
                        end: number;
                    };
                    authorsTruncated?: boolean | undefined;
                    fieldSources: Record<string, {
                        raw: string;
                        span?: {
                            start: number;
                            end: number;
                        } | undefined;
                        normalized?: string | undefined;
                        provenance?: "ai" | "parser" | "user" | undefined;
                    }>;
                    structuring: {
                        path: "ai" | "parser" | "user";
                        version: string;
                    };
                    ai?: {
                        configuration: string;
                        notice: "ai-can-be-wrong";
                        proposals: {
                            field: string;
                            value: unknown;
                            reason: "ungrounded";
                        }[];
                        changedFields: string[];
                    } | undefined;
                    csl: {
                        type?: string | undefined;
                        author?: {
                            family?: string | undefined;
                            "non-dropping-particle"?: string | undefined;
                            given?: string | undefined;
                            literal?: string | undefined;
                        }[] | undefined;
                        issued?: {
                            literal: string;
                        } | undefined;
                        title?: string | undefined;
                        "container-title"?: string | undefined;
                        "container-title-short"?: string | undefined;
                        publisher?: string | undefined;
                        "publisher-place"?: string | undefined;
                        volume?: string | undefined;
                        issue?: string | undefined;
                        page?: string | undefined;
                        "article-number"?: string | undefined;
                        edition?: string | undefined;
                        DOI?: string | undefined;
                        URL?: string | undefined;
                        ISBN?: string | undefined;
                        ISSN?: string | undefined;
                        PMID?: string | undefined;
                        PMCID?: string | undefined;
                        arXiv?: string | undefined;
                    };
                    imported?: {
                        format: "bibtex" | "ris";
                        unsupported: {
                            name: string;
                            value: string;
                        }[];
                        fields: {
                            type?: string | undefined;
                            author?: {
                                family?: string | undefined;
                                "non-dropping-particle"?: string | undefined;
                                given?: string | undefined;
                                literal?: string | undefined;
                            }[] | undefined;
                            issued?: {
                                literal: string;
                            } | undefined;
                            title?: string | undefined;
                            "container-title"?: string | undefined;
                            "container-title-short"?: string | undefined;
                            publisher?: string | undefined;
                            "publisher-place"?: string | undefined;
                            volume?: string | undefined;
                            issue?: string | undefined;
                            page?: string | undefined;
                            "article-number"?: string | undefined;
                            edition?: string | undefined;
                            DOI?: string | undefined;
                            URL?: string | undefined;
                            ISBN?: string | undefined;
                            ISSN?: string | undefined;
                            PMID?: string | undefined;
                            PMCID?: string | undefined;
                            arXiv?: string | undefined;
                        };
                    } | undefined;
                };
                identity: {
                    candidateId?: string | undefined;
                    kind: "independent-bibliography" | "supplied-doi" | "supplied-identifier" | "unresolved" | "web-archive" | "web-url";
                };
                candidates: {
                    id: string;
                    slot: number;
                    retrievedAt: string;
                    raw: unknown;
                    score: {
                        value: number;
                        fullAgreement: boolean;
                    } | null;
                    csl: {
                        type?: string | undefined;
                        author?: {
                            family?: string | undefined;
                            "non-dropping-particle"?: string | undefined;
                            given?: string | undefined;
                            literal?: string | undefined;
                        }[] | undefined;
                        issued?: {
                            literal: string;
                        } | undefined;
                        title?: string | undefined;
                        "container-title"?: string | undefined;
                        "container-title-short"?: string | undefined;
                        publisher?: string | undefined;
                        "publisher-place"?: string | undefined;
                        volume?: string | undefined;
                        issue?: string | undefined;
                        page?: string | undefined;
                        "article-number"?: string | undefined;
                        edition?: string | undefined;
                        DOI?: string | undefined;
                        URL?: string | undefined;
                        ISBN?: string | undefined;
                        ISSN?: string | undefined;
                        PMID?: string | undefined;
                        PMCID?: string | undefined;
                        arXiv?: string | undefined;
                    };
                    fields: {
                        field: string;
                        reference: unknown;
                        candidate: unknown;
                        score: {
                            value: number;
                            fullAgreement: boolean;
                        } | null;
                        reason: "compared" | "missing-candidate" | "missing-reference" | "not-determinable" | "resource-limit" | "unweighted";
                        agreement?: boolean | undefined;
                        journalAbbreviation?: {
                            outcome: "different" | "match" | "not-determinable";
                            reason: "attested-match" | "attested-other-journal" | "no-attestation";
                            attestations: {
                                source: "crossref" | "europepmc" | "nlm" | "semanticscholar";
                                role: "candidate" | "reference";
                                journalTitle: string;
                                abbreviation: string;
                                nlmId?: string | undefined;
                                snapshotDate?: string | undefined;
                            }[];
                        } | undefined;
                    }[];
                    source: "arxiv" | "crossref" | "europepmc" | "googlebooks" | "internetarchive" | "openalex" | "openlibrary" | "semanticscholar" | "url";
                    origin: "archive" | "arxiv" | "authors-year" | "combined" | "doi" | "isbn" | "pmcid" | "pmid" | "title" | "url";
                    identifiers?: string[] | undefined;
                    identityAmbiguous?: boolean | undefined;
                    retractionEvidence?: {
                        source: "crossref" | "europepmc" | "openalex";
                        candidateId: string;
                        observedAt: string;
                    } | undefined;
                }[];
                evidence: {
                    reason?: string | undefined;
                    status?: number | undefined;
                    durationMs: number;
                    attempts: number;
                    observedAt: string;
                    raw?: unknown;
                    source: "arxiv" | "crossref" | "doi.org" | "europepmc" | "googlebooks" | "internetarchive" | "openalex" | "openlibrary" | "semanticscholar" | "url";
                    operation: "archive" | "arxiv" | "authors-year" | "combined" | "doi" | "isbn" | "pmcid" | "pmid" | "title" | "url";
                    outcome: "candidate" | "disabled" | "exists" | "no-record" | "nonexistent" | "redirect" | "skipped" | "unavailable" | "unsupported";
                    web?: {
                        originalUrl: string;
                        finalUrl: string;
                        status: number;
                        title?: string | undefined;
                        redirectTarget?: string | undefined;
                        archiveUrl?: string | undefined;
                        timestamp?: string | undefined;
                    } | undefined;
                    skippedDuplicates?: string[] | undefined;
                    unusedSlots?: number | undefined;
                    identifierAmbiguity?: string[] | undefined;
                }[];
                reasons: ("ambiguous-identity" | "development-route-incomplete" | "doi-nonexistent" | "fields-differ" | "foreign-doi" | "identified" | "identity-unresolved" | "insufficient-search" | "mandatory-resolution-incomplete" | "metadata-unavailable" | "mixed-components" | "outside-coverage" | "search-completed" | "sources-unavailable" | "url-unavailable" | "url-verification-incomplete" | "web-original-unavailable")[];
                failedSources: ("arxiv" | "crossref" | "doi.org" | "europepmc" | "googlebooks" | "internetarchive" | "openalex" | "openlibrary" | "semanticscholar" | "url")[];
                retraction: "retracted" | "unknown";
                retractionEvidence?: {
                    source: "crossref" | "europepmc" | "openalex";
                    candidateId: string;
                    observedAt: string;
                }[] | undefined;
            };
            progress: "arxiv" | "checking" | "crossref" | "doi.org" | "ended" | "europepmc" | "googlebooks" | "internetarchive" | "openalex" | "openlibrary" | "queued" | "semanticscholar" | "url";
        }[];
    }>;
    editReferenceList: (id: string, input: EditReferenceListRequest) => Promise<{
        id: string;
        state: "ended" | "running";
        lastEventSeq: number;
        lastEventCursor: string;
        leaseRenewAfterMs: number;
        endReason: "cancelled" | "completed" | "lease-expired" | null;
        document?: {
            text: string;
            selection: {
                version: string;
                regions: {
                    start: number;
                    end: number;
                }[];
            };
        } | null | undefined;
        references: {
            slot: number;
            originalText: string;
            revision: number;
            fields: {
                type?: string | undefined;
                author?: {
                    family?: string | undefined;
                    "non-dropping-particle"?: string | undefined;
                    given?: string | undefined;
                    literal?: string | undefined;
                }[] | undefined;
                issued?: {
                    literal: string;
                } | undefined;
                title?: string | undefined;
                "container-title"?: string | undefined;
                "container-title-short"?: string | undefined;
                publisher?: string | undefined;
                "publisher-place"?: string | undefined;
                volume?: string | undefined;
                issue?: string | undefined;
                page?: string | undefined;
                "article-number"?: string | undefined;
                edition?: string | undefined;
                DOI?: string | undefined;
                URL?: string | undefined;
                ISBN?: string | undefined;
                ISSN?: string | undefined;
                PMID?: string | undefined;
                PMCID?: string | undefined;
                arXiv?: string | undefined;
            };
            authorsTruncated?: boolean | undefined;
            revisions: {
                revision: number;
                reference: {
                    originalText: string;
                    span: {
                        start: number;
                        end: number;
                    };
                    authorsTruncated?: boolean | undefined;
                    fieldSources: Record<string, {
                        raw: string;
                        span?: {
                            start: number;
                            end: number;
                        } | undefined;
                        normalized?: string | undefined;
                        provenance?: "ai" | "parser" | "user" | undefined;
                    }>;
                    structuring: {
                        path: "ai" | "parser" | "user";
                        version: string;
                    };
                    ai?: {
                        configuration: string;
                        notice: "ai-can-be-wrong";
                        proposals: {
                            field: string;
                            value: unknown;
                            reason: "ungrounded";
                        }[];
                        changedFields: string[];
                    } | undefined;
                    csl: {
                        type?: string | undefined;
                        author?: {
                            family?: string | undefined;
                            "non-dropping-particle"?: string | undefined;
                            given?: string | undefined;
                            literal?: string | undefined;
                        }[] | undefined;
                        issued?: {
                            literal: string;
                        } | undefined;
                        title?: string | undefined;
                        "container-title"?: string | undefined;
                        "container-title-short"?: string | undefined;
                        publisher?: string | undefined;
                        "publisher-place"?: string | undefined;
                        volume?: string | undefined;
                        issue?: string | undefined;
                        page?: string | undefined;
                        "article-number"?: string | undefined;
                        edition?: string | undefined;
                        DOI?: string | undefined;
                        URL?: string | undefined;
                        ISBN?: string | undefined;
                        ISSN?: string | undefined;
                        PMID?: string | undefined;
                        PMCID?: string | undefined;
                        arXiv?: string | undefined;
                    };
                    imported?: {
                        format: "bibtex" | "ris";
                        unsupported: {
                            name: string;
                            value: string;
                        }[];
                        fields: {
                            type?: string | undefined;
                            author?: {
                                family?: string | undefined;
                                "non-dropping-particle"?: string | undefined;
                                given?: string | undefined;
                                literal?: string | undefined;
                            }[] | undefined;
                            issued?: {
                                literal: string;
                            } | undefined;
                            title?: string | undefined;
                            "container-title"?: string | undefined;
                            "container-title-short"?: string | undefined;
                            publisher?: string | undefined;
                            "publisher-place"?: string | undefined;
                            volume?: string | undefined;
                            issue?: string | undefined;
                            page?: string | undefined;
                            "article-number"?: string | undefined;
                            edition?: string | undefined;
                            DOI?: string | undefined;
                            URL?: string | undefined;
                            ISBN?: string | undefined;
                            ISSN?: string | undefined;
                            PMID?: string | undefined;
                            PMCID?: string | undefined;
                            arXiv?: string | undefined;
                        };
                    } | undefined;
                };
                provenance: "ai" | "parser" | "user";
                createdAt: string;
            }[];
            results: {
                id: string;
                revision: number;
                generation: number;
                createdAt: string;
                outcome: {
                    kind: "status";
                    status: "cancelled" | "failed" | "not-checked" | "running";
                } | {
                    kind: "verdict";
                    verdict: "correct" | "doi-conflict" | "exists-with-deviations" | "mixed-citation" | "not-found" | "not-verifiable";
                    scoringRules: {
                        version: string;
                        calibration: "uncalibrated";
                        unicode: string;
                        icu: string;
                        profile: Record<string, number>;
                    };
                    searchStrategyVersion: string;
                    searchConfiguration: Record<string, string | number>;
                    bestMatchId: string | null;
                    reference: {
                        originalText: string;
                        span: {
                            start: number;
                            end: number;
                        };
                        authorsTruncated?: boolean | undefined;
                        fieldSources: Record<string, {
                            raw: string;
                            span?: {
                                start: number;
                                end: number;
                            } | undefined;
                            normalized?: string | undefined;
                            provenance?: "ai" | "parser" | "user" | undefined;
                        }>;
                        structuring: {
                            path: "ai" | "parser" | "user";
                            version: string;
                        };
                        ai?: {
                            configuration: string;
                            notice: "ai-can-be-wrong";
                            proposals: {
                                field: string;
                                value: unknown;
                                reason: "ungrounded";
                            }[];
                            changedFields: string[];
                        } | undefined;
                        csl: {
                            type?: string | undefined;
                            author?: {
                                family?: string | undefined;
                                "non-dropping-particle"?: string | undefined;
                                given?: string | undefined;
                                literal?: string | undefined;
                            }[] | undefined;
                            issued?: {
                                literal: string;
                            } | undefined;
                            title?: string | undefined;
                            "container-title"?: string | undefined;
                            "container-title-short"?: string | undefined;
                            publisher?: string | undefined;
                            "publisher-place"?: string | undefined;
                            volume?: string | undefined;
                            issue?: string | undefined;
                            page?: string | undefined;
                            "article-number"?: string | undefined;
                            edition?: string | undefined;
                            DOI?: string | undefined;
                            URL?: string | undefined;
                            ISBN?: string | undefined;
                            ISSN?: string | undefined;
                            PMID?: string | undefined;
                            PMCID?: string | undefined;
                            arXiv?: string | undefined;
                        };
                        imported?: {
                            format: "bibtex" | "ris";
                            unsupported: {
                                name: string;
                                value: string;
                            }[];
                            fields: {
                                type?: string | undefined;
                                author?: {
                                    family?: string | undefined;
                                    "non-dropping-particle"?: string | undefined;
                                    given?: string | undefined;
                                    literal?: string | undefined;
                                }[] | undefined;
                                issued?: {
                                    literal: string;
                                } | undefined;
                                title?: string | undefined;
                                "container-title"?: string | undefined;
                                "container-title-short"?: string | undefined;
                                publisher?: string | undefined;
                                "publisher-place"?: string | undefined;
                                volume?: string | undefined;
                                issue?: string | undefined;
                                page?: string | undefined;
                                "article-number"?: string | undefined;
                                edition?: string | undefined;
                                DOI?: string | undefined;
                                URL?: string | undefined;
                                ISBN?: string | undefined;
                                ISSN?: string | undefined;
                                PMID?: string | undefined;
                                PMCID?: string | undefined;
                                arXiv?: string | undefined;
                            };
                        } | undefined;
                    };
                    identity: {
                        candidateId?: string | undefined;
                        kind: "independent-bibliography" | "supplied-doi" | "supplied-identifier" | "unresolved" | "web-archive" | "web-url";
                    };
                    candidates: {
                        id: string;
                        slot: number;
                        retrievedAt: string;
                        raw: unknown;
                        score: {
                            value: number;
                            fullAgreement: boolean;
                        } | null;
                        csl: {
                            type?: string | undefined;
                            author?: {
                                family?: string | undefined;
                                "non-dropping-particle"?: string | undefined;
                                given?: string | undefined;
                                literal?: string | undefined;
                            }[] | undefined;
                            issued?: {
                                literal: string;
                            } | undefined;
                            title?: string | undefined;
                            "container-title"?: string | undefined;
                            "container-title-short"?: string | undefined;
                            publisher?: string | undefined;
                            "publisher-place"?: string | undefined;
                            volume?: string | undefined;
                            issue?: string | undefined;
                            page?: string | undefined;
                            "article-number"?: string | undefined;
                            edition?: string | undefined;
                            DOI?: string | undefined;
                            URL?: string | undefined;
                            ISBN?: string | undefined;
                            ISSN?: string | undefined;
                            PMID?: string | undefined;
                            PMCID?: string | undefined;
                            arXiv?: string | undefined;
                        };
                        fields: {
                            field: string;
                            reference: unknown;
                            candidate: unknown;
                            score: {
                                value: number;
                                fullAgreement: boolean;
                            } | null;
                            reason: "compared" | "missing-candidate" | "missing-reference" | "not-determinable" | "resource-limit" | "unweighted";
                            agreement?: boolean | undefined;
                            journalAbbreviation?: {
                                outcome: "different" | "match" | "not-determinable";
                                reason: "attested-match" | "attested-other-journal" | "no-attestation";
                                attestations: {
                                    source: "crossref" | "europepmc" | "nlm" | "semanticscholar";
                                    role: "candidate" | "reference";
                                    journalTitle: string;
                                    abbreviation: string;
                                    nlmId?: string | undefined;
                                    snapshotDate?: string | undefined;
                                }[];
                            } | undefined;
                        }[];
                        source: "arxiv" | "crossref" | "europepmc" | "googlebooks" | "internetarchive" | "openalex" | "openlibrary" | "semanticscholar" | "url";
                        origin: "archive" | "arxiv" | "authors-year" | "combined" | "doi" | "isbn" | "pmcid" | "pmid" | "title" | "url";
                        identifiers?: string[] | undefined;
                        identityAmbiguous?: boolean | undefined;
                        retractionEvidence?: {
                            source: "crossref" | "europepmc" | "openalex";
                            candidateId: string;
                            observedAt: string;
                        } | undefined;
                    }[];
                    evidence: {
                        reason?: string | undefined;
                        status?: number | undefined;
                        durationMs: number;
                        attempts: number;
                        observedAt: string;
                        raw?: unknown;
                        source: "arxiv" | "crossref" | "doi.org" | "europepmc" | "googlebooks" | "internetarchive" | "openalex" | "openlibrary" | "semanticscholar" | "url";
                        operation: "archive" | "arxiv" | "authors-year" | "combined" | "doi" | "isbn" | "pmcid" | "pmid" | "title" | "url";
                        outcome: "candidate" | "disabled" | "exists" | "no-record" | "nonexistent" | "redirect" | "skipped" | "unavailable" | "unsupported";
                        web?: {
                            originalUrl: string;
                            finalUrl: string;
                            status: number;
                            title?: string | undefined;
                            redirectTarget?: string | undefined;
                            archiveUrl?: string | undefined;
                            timestamp?: string | undefined;
                        } | undefined;
                        skippedDuplicates?: string[] | undefined;
                        unusedSlots?: number | undefined;
                        identifierAmbiguity?: string[] | undefined;
                    }[];
                    reasons: ("ambiguous-identity" | "development-route-incomplete" | "doi-nonexistent" | "fields-differ" | "foreign-doi" | "identified" | "identity-unresolved" | "insufficient-search" | "mandatory-resolution-incomplete" | "metadata-unavailable" | "mixed-components" | "outside-coverage" | "search-completed" | "sources-unavailable" | "url-unavailable" | "url-verification-incomplete" | "web-original-unavailable")[];
                    failedSources: ("arxiv" | "crossref" | "doi.org" | "europepmc" | "googlebooks" | "internetarchive" | "openalex" | "openlibrary" | "semanticscholar" | "url")[];
                    retraction: "retracted" | "unknown";
                    retractionEvidence?: {
                        source: "crossref" | "europepmc" | "openalex";
                        candidateId: string;
                        observedAt: string;
                    }[] | undefined;
                };
                manualOverride: {
                    id: string;
                    resultId: string;
                    verdict: "correct" | "doi-conflict" | "exists-with-deviations" | "mixed-citation" | "not-found" | "not-verifiable";
                    createdAt: string;
                } | null;
            }[];
            manualOverride: {
                id: string;
                resultId: string;
                verdict: "correct" | "doi-conflict" | "exists-with-deviations" | "mixed-citation" | "not-found" | "not-verifiable";
                createdAt: string;
            } | null;
            manualOverrideReset: boolean;
            quotaEffect: "free-recheck" | "new-work";
            outcome: {
                kind: "status";
                status: "cancelled" | "failed" | "not-checked" | "running";
            } | {
                kind: "verdict";
                verdict: "correct" | "doi-conflict" | "exists-with-deviations" | "mixed-citation" | "not-found" | "not-verifiable";
                scoringRules: {
                    version: string;
                    calibration: "uncalibrated";
                    unicode: string;
                    icu: string;
                    profile: Record<string, number>;
                };
                searchStrategyVersion: string;
                searchConfiguration: Record<string, string | number>;
                bestMatchId: string | null;
                reference: {
                    originalText: string;
                    span: {
                        start: number;
                        end: number;
                    };
                    authorsTruncated?: boolean | undefined;
                    fieldSources: Record<string, {
                        raw: string;
                        span?: {
                            start: number;
                            end: number;
                        } | undefined;
                        normalized?: string | undefined;
                        provenance?: "ai" | "parser" | "user" | undefined;
                    }>;
                    structuring: {
                        path: "ai" | "parser" | "user";
                        version: string;
                    };
                    ai?: {
                        configuration: string;
                        notice: "ai-can-be-wrong";
                        proposals: {
                            field: string;
                            value: unknown;
                            reason: "ungrounded";
                        }[];
                        changedFields: string[];
                    } | undefined;
                    csl: {
                        type?: string | undefined;
                        author?: {
                            family?: string | undefined;
                            "non-dropping-particle"?: string | undefined;
                            given?: string | undefined;
                            literal?: string | undefined;
                        }[] | undefined;
                        issued?: {
                            literal: string;
                        } | undefined;
                        title?: string | undefined;
                        "container-title"?: string | undefined;
                        "container-title-short"?: string | undefined;
                        publisher?: string | undefined;
                        "publisher-place"?: string | undefined;
                        volume?: string | undefined;
                        issue?: string | undefined;
                        page?: string | undefined;
                        "article-number"?: string | undefined;
                        edition?: string | undefined;
                        DOI?: string | undefined;
                        URL?: string | undefined;
                        ISBN?: string | undefined;
                        ISSN?: string | undefined;
                        PMID?: string | undefined;
                        PMCID?: string | undefined;
                        arXiv?: string | undefined;
                    };
                    imported?: {
                        format: "bibtex" | "ris";
                        unsupported: {
                            name: string;
                            value: string;
                        }[];
                        fields: {
                            type?: string | undefined;
                            author?: {
                                family?: string | undefined;
                                "non-dropping-particle"?: string | undefined;
                                given?: string | undefined;
                                literal?: string | undefined;
                            }[] | undefined;
                            issued?: {
                                literal: string;
                            } | undefined;
                            title?: string | undefined;
                            "container-title"?: string | undefined;
                            "container-title-short"?: string | undefined;
                            publisher?: string | undefined;
                            "publisher-place"?: string | undefined;
                            volume?: string | undefined;
                            issue?: string | undefined;
                            page?: string | undefined;
                            "article-number"?: string | undefined;
                            edition?: string | undefined;
                            DOI?: string | undefined;
                            URL?: string | undefined;
                            ISBN?: string | undefined;
                            ISSN?: string | undefined;
                            PMID?: string | undefined;
                            PMCID?: string | undefined;
                            arXiv?: string | undefined;
                        };
                    } | undefined;
                };
                identity: {
                    candidateId?: string | undefined;
                    kind: "independent-bibliography" | "supplied-doi" | "supplied-identifier" | "unresolved" | "web-archive" | "web-url";
                };
                candidates: {
                    id: string;
                    slot: number;
                    retrievedAt: string;
                    raw: unknown;
                    score: {
                        value: number;
                        fullAgreement: boolean;
                    } | null;
                    csl: {
                        type?: string | undefined;
                        author?: {
                            family?: string | undefined;
                            "non-dropping-particle"?: string | undefined;
                            given?: string | undefined;
                            literal?: string | undefined;
                        }[] | undefined;
                        issued?: {
                            literal: string;
                        } | undefined;
                        title?: string | undefined;
                        "container-title"?: string | undefined;
                        "container-title-short"?: string | undefined;
                        publisher?: string | undefined;
                        "publisher-place"?: string | undefined;
                        volume?: string | undefined;
                        issue?: string | undefined;
                        page?: string | undefined;
                        "article-number"?: string | undefined;
                        edition?: string | undefined;
                        DOI?: string | undefined;
                        URL?: string | undefined;
                        ISBN?: string | undefined;
                        ISSN?: string | undefined;
                        PMID?: string | undefined;
                        PMCID?: string | undefined;
                        arXiv?: string | undefined;
                    };
                    fields: {
                        field: string;
                        reference: unknown;
                        candidate: unknown;
                        score: {
                            value: number;
                            fullAgreement: boolean;
                        } | null;
                        reason: "compared" | "missing-candidate" | "missing-reference" | "not-determinable" | "resource-limit" | "unweighted";
                        agreement?: boolean | undefined;
                        journalAbbreviation?: {
                            outcome: "different" | "match" | "not-determinable";
                            reason: "attested-match" | "attested-other-journal" | "no-attestation";
                            attestations: {
                                source: "crossref" | "europepmc" | "nlm" | "semanticscholar";
                                role: "candidate" | "reference";
                                journalTitle: string;
                                abbreviation: string;
                                nlmId?: string | undefined;
                                snapshotDate?: string | undefined;
                            }[];
                        } | undefined;
                    }[];
                    source: "arxiv" | "crossref" | "europepmc" | "googlebooks" | "internetarchive" | "openalex" | "openlibrary" | "semanticscholar" | "url";
                    origin: "archive" | "arxiv" | "authors-year" | "combined" | "doi" | "isbn" | "pmcid" | "pmid" | "title" | "url";
                    identifiers?: string[] | undefined;
                    identityAmbiguous?: boolean | undefined;
                    retractionEvidence?: {
                        source: "crossref" | "europepmc" | "openalex";
                        candidateId: string;
                        observedAt: string;
                    } | undefined;
                }[];
                evidence: {
                    reason?: string | undefined;
                    status?: number | undefined;
                    durationMs: number;
                    attempts: number;
                    observedAt: string;
                    raw?: unknown;
                    source: "arxiv" | "crossref" | "doi.org" | "europepmc" | "googlebooks" | "internetarchive" | "openalex" | "openlibrary" | "semanticscholar" | "url";
                    operation: "archive" | "arxiv" | "authors-year" | "combined" | "doi" | "isbn" | "pmcid" | "pmid" | "title" | "url";
                    outcome: "candidate" | "disabled" | "exists" | "no-record" | "nonexistent" | "redirect" | "skipped" | "unavailable" | "unsupported";
                    web?: {
                        originalUrl: string;
                        finalUrl: string;
                        status: number;
                        title?: string | undefined;
                        redirectTarget?: string | undefined;
                        archiveUrl?: string | undefined;
                        timestamp?: string | undefined;
                    } | undefined;
                    skippedDuplicates?: string[] | undefined;
                    unusedSlots?: number | undefined;
                    identifierAmbiguity?: string[] | undefined;
                }[];
                reasons: ("ambiguous-identity" | "development-route-incomplete" | "doi-nonexistent" | "fields-differ" | "foreign-doi" | "identified" | "identity-unresolved" | "insufficient-search" | "mandatory-resolution-incomplete" | "metadata-unavailable" | "mixed-components" | "outside-coverage" | "search-completed" | "sources-unavailable" | "url-unavailable" | "url-verification-incomplete" | "web-original-unavailable")[];
                failedSources: ("arxiv" | "crossref" | "doi.org" | "europepmc" | "googlebooks" | "internetarchive" | "openalex" | "openlibrary" | "semanticscholar" | "url")[];
                retraction: "retracted" | "unknown";
                retractionEvidence?: {
                    source: "crossref" | "europepmc" | "openalex";
                    candidateId: string;
                    observedAt: string;
                }[] | undefined;
            };
            progress: "arxiv" | "checking" | "crossref" | "doi.org" | "ended" | "europepmc" | "googlebooks" | "internetarchive" | "openalex" | "openlibrary" | "queued" | "semanticscholar" | "url";
        }[];
    }>;
};
export declare function watchCheckEvents(checkId: string, options: WatchCheckOptions): Promise<void>;
