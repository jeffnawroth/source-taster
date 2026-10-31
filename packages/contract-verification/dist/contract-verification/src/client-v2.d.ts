import { CheckEvent, type SetManualOverrideRequest, type SaveFieldsRequest, type RecheckRequest, type EditReferenceListRequest } from "./v2.ts";
import { type VerificationClientOptions, type WatchOptions } from "./client.ts";
export { ApiError, CheckStreamError, readSseFrames, type CredentialSupplier, type VerificationClientOptions, } from "./client.ts";
export type WatchCheckOptions = WatchOptions<CheckEvent>;
export declare function verificationClient(options?: VerificationClientOptions): {
    createCheck: (input: string | import("./index.ts").CreateCheckRequest) => Promise<{
        id: string;
        state: "ended" | "running";
        lastEventSeq: number;
        lastEventCursor: string;
        leaseRenewAfterMs: number;
        endReason: "cancelled" | "completed" | "lease-expired" | null;
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
                };
                provenance: "parser" | "user";
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
    cancelCheck: (checkId: string) => Promise<{
        id: string;
        state: "ended" | "running";
        lastEventSeq: number;
        lastEventCursor: string;
        leaseRenewAfterMs: number;
        endReason: "cancelled" | "completed" | "lease-expired" | null;
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
                };
                provenance: "parser" | "user";
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
                };
                provenance: "parser" | "user";
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
                };
                provenance: "parser" | "user";
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
    setManualOverride: (id: string, slot: number, input: SetManualOverrideRequest) => Promise<{
        id: string;
        state: "ended" | "running";
        lastEventSeq: number;
        lastEventCursor: string;
        leaseRenewAfterMs: number;
        endReason: "cancelled" | "completed" | "lease-expired" | null;
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
                };
                provenance: "parser" | "user";
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
                    };
                    identity: {
                        candidateId?: string | undefined;
                        kind: "independent-bibliography" | "supplied-doi" | "supplied-identifier" | "unresolved";
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
                        source: "arxiv" | "crossref" | "europepmc" | "googlebooks" | "openalex" | "openlibrary" | "semanticscholar";
                        origin: "arxiv" | "authors-year" | "combined" | "doi" | "isbn" | "pmcid" | "pmid" | "title";
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
                        source: "arxiv" | "crossref" | "doi.org" | "europepmc" | "googlebooks" | "openalex" | "openlibrary" | "semanticscholar";
                        operation: "arxiv" | "authors-year" | "combined" | "doi" | "isbn" | "pmcid" | "pmid" | "title";
                        outcome: "candidate" | "disabled" | "exists" | "no-record" | "nonexistent" | "skipped" | "unavailable" | "unsupported";
                        skippedDuplicates?: string[] | undefined;
                        unusedSlots?: number | undefined;
                        identifierAmbiguity?: string[] | undefined;
                    }[];
                    reasons: ("ambiguous-identity" | "development-route-incomplete" | "doi-nonexistent" | "fields-differ" | "foreign-doi" | "identified" | "identity-unresolved" | "insufficient-search" | "mandatory-resolution-incomplete" | "metadata-unavailable" | "mixed-components" | "outside-coverage" | "search-completed" | "sources-unavailable" | "url-verification-incomplete")[];
                    failedSources: ("arxiv" | "crossref" | "doi.org" | "europepmc" | "googlebooks" | "openalex" | "openlibrary" | "semanticscholar")[];
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
                };
                identity: {
                    candidateId?: string | undefined;
                    kind: "independent-bibliography" | "supplied-doi" | "supplied-identifier" | "unresolved";
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
                    source: "arxiv" | "crossref" | "europepmc" | "googlebooks" | "openalex" | "openlibrary" | "semanticscholar";
                    origin: "arxiv" | "authors-year" | "combined" | "doi" | "isbn" | "pmcid" | "pmid" | "title";
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
                    source: "arxiv" | "crossref" | "doi.org" | "europepmc" | "googlebooks" | "openalex" | "openlibrary" | "semanticscholar";
                    operation: "arxiv" | "authors-year" | "combined" | "doi" | "isbn" | "pmcid" | "pmid" | "title";
                    outcome: "candidate" | "disabled" | "exists" | "no-record" | "nonexistent" | "skipped" | "unavailable" | "unsupported";
                    skippedDuplicates?: string[] | undefined;
                    unusedSlots?: number | undefined;
                    identifierAmbiguity?: string[] | undefined;
                }[];
                reasons: ("ambiguous-identity" | "development-route-incomplete" | "doi-nonexistent" | "fields-differ" | "foreign-doi" | "identified" | "identity-unresolved" | "insufficient-search" | "mandatory-resolution-incomplete" | "metadata-unavailable" | "mixed-components" | "outside-coverage" | "search-completed" | "sources-unavailable" | "url-verification-incomplete")[];
                failedSources: ("arxiv" | "crossref" | "doi.org" | "europepmc" | "googlebooks" | "openalex" | "openlibrary" | "semanticscholar")[];
                retraction: "retracted" | "unknown";
                retractionEvidence?: {
                    source: "crossref" | "europepmc" | "openalex";
                    candidateId: string;
                    observedAt: string;
                }[] | undefined;
            };
            progress: "arxiv" | "checking" | "crossref" | "doi.org" | "ended" | "europepmc" | "googlebooks" | "openalex" | "openlibrary" | "queued" | "semanticscholar";
        }[];
    }>;
    saveFields: (id: string, slot: number, input: SaveFieldsRequest) => Promise<{
        id: string;
        state: "ended" | "running";
        lastEventSeq: number;
        lastEventCursor: string;
        leaseRenewAfterMs: number;
        endReason: "cancelled" | "completed" | "lease-expired" | null;
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
                };
                provenance: "parser" | "user";
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
                };
                provenance: "parser" | "user";
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
                };
                provenance: "parser" | "user";
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
