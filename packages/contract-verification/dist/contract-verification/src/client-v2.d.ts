import { CheckEvent } from "./v2.ts";
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
            outcome: {
                kind: "status";
                status: "cancelled" | "failed" | "not-checked" | "running";
            } | {
                kind: "verdict";
                verdict: "correct" | "doi-conflict" | "exists-with-deviations" | "mixed-citation" | "not-found" | "not-verifiable";
                reference: {
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
                };
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
                retraction: "unknown";
                identity: {
                    candidateId?: string | undefined;
                    kind: "independent-bibliography" | "supplied-doi" | "supplied-identifier" | "unresolved";
                };
                candidates: {
                    id: string;
                    slot: number;
                    retrievedAt: string;
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
                    raw: unknown;
                    fields: {
                        field: string;
                        reference: unknown;
                        candidate: unknown;
                        score: {
                            value: number;
                            fullAgreement: boolean;
                        } | null;
                        reason: "compared" | "missing-candidate" | "missing-reference" | "not-determinable" | "resource-limit" | "unweighted";
                    }[];
                    score: {
                        value: number;
                        fullAgreement: boolean;
                    } | null;
                    source: "crossref" | "openalex";
                    origin: "authors-year" | "combined" | "doi" | "pmcid" | "pmid" | "title";
                    identifiers?: string[] | undefined;
                }[];
                evidence: {
                    reason?: string | undefined;
                    status?: number | undefined;
                    durationMs: number;
                    attempts: number;
                    observedAt: string;
                    raw?: unknown;
                    source: "crossref" | "doi.org" | "openalex";
                    operation: "authors-year" | "combined" | "doi" | "pmcid" | "pmid" | "title";
                    outcome: "candidate" | "disabled" | "exists" | "no-record" | "nonexistent" | "skipped" | "unavailable" | "unsupported";
                    skippedDuplicates?: string[] | undefined;
                    unusedSlots?: number | undefined;
                }[];
                reasons: ("ambiguous-identity" | "development-route-incomplete" | "doi-nonexistent" | "fields-differ" | "foreign-doi" | "identified" | "identity-unresolved" | "insufficient-search" | "mandatory-resolution-incomplete" | "metadata-unavailable" | "mixed-components" | "outside-coverage" | "search-completed" | "url-verification-incomplete")[];
                failedSources: ("crossref" | "doi.org" | "openalex")[];
            };
            progress: "checking" | "crossref" | "doi.org" | "ended" | "openalex" | "queued";
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
            outcome: {
                kind: "status";
                status: "cancelled" | "failed" | "not-checked" | "running";
            } | {
                kind: "verdict";
                verdict: "correct" | "doi-conflict" | "exists-with-deviations" | "mixed-citation" | "not-found" | "not-verifiable";
                reference: {
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
                };
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
                retraction: "unknown";
                identity: {
                    candidateId?: string | undefined;
                    kind: "independent-bibliography" | "supplied-doi" | "supplied-identifier" | "unresolved";
                };
                candidates: {
                    id: string;
                    slot: number;
                    retrievedAt: string;
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
                    raw: unknown;
                    fields: {
                        field: string;
                        reference: unknown;
                        candidate: unknown;
                        score: {
                            value: number;
                            fullAgreement: boolean;
                        } | null;
                        reason: "compared" | "missing-candidate" | "missing-reference" | "not-determinable" | "resource-limit" | "unweighted";
                    }[];
                    score: {
                        value: number;
                        fullAgreement: boolean;
                    } | null;
                    source: "crossref" | "openalex";
                    origin: "authors-year" | "combined" | "doi" | "pmcid" | "pmid" | "title";
                    identifiers?: string[] | undefined;
                }[];
                evidence: {
                    reason?: string | undefined;
                    status?: number | undefined;
                    durationMs: number;
                    attempts: number;
                    observedAt: string;
                    raw?: unknown;
                    source: "crossref" | "doi.org" | "openalex";
                    operation: "authors-year" | "combined" | "doi" | "pmcid" | "pmid" | "title";
                    outcome: "candidate" | "disabled" | "exists" | "no-record" | "nonexistent" | "skipped" | "unavailable" | "unsupported";
                    skippedDuplicates?: string[] | undefined;
                    unusedSlots?: number | undefined;
                }[];
                reasons: ("ambiguous-identity" | "development-route-incomplete" | "doi-nonexistent" | "fields-differ" | "foreign-doi" | "identified" | "identity-unresolved" | "insufficient-search" | "mandatory-resolution-incomplete" | "metadata-unavailable" | "mixed-components" | "outside-coverage" | "search-completed" | "url-verification-incomplete")[];
                failedSources: ("crossref" | "doi.org" | "openalex")[];
            };
            progress: "checking" | "crossref" | "doi.org" | "ended" | "openalex" | "queued";
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
            outcome: {
                kind: "status";
                status: "cancelled" | "failed" | "not-checked" | "running";
            } | {
                kind: "verdict";
                verdict: "correct" | "doi-conflict" | "exists-with-deviations" | "mixed-citation" | "not-found" | "not-verifiable";
                reference: {
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
                };
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
                retraction: "unknown";
                identity: {
                    candidateId?: string | undefined;
                    kind: "independent-bibliography" | "supplied-doi" | "supplied-identifier" | "unresolved";
                };
                candidates: {
                    id: string;
                    slot: number;
                    retrievedAt: string;
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
                    raw: unknown;
                    fields: {
                        field: string;
                        reference: unknown;
                        candidate: unknown;
                        score: {
                            value: number;
                            fullAgreement: boolean;
                        } | null;
                        reason: "compared" | "missing-candidate" | "missing-reference" | "not-determinable" | "resource-limit" | "unweighted";
                    }[];
                    score: {
                        value: number;
                        fullAgreement: boolean;
                    } | null;
                    source: "crossref" | "openalex";
                    origin: "authors-year" | "combined" | "doi" | "pmcid" | "pmid" | "title";
                    identifiers?: string[] | undefined;
                }[];
                evidence: {
                    reason?: string | undefined;
                    status?: number | undefined;
                    durationMs: number;
                    attempts: number;
                    observedAt: string;
                    raw?: unknown;
                    source: "crossref" | "doi.org" | "openalex";
                    operation: "authors-year" | "combined" | "doi" | "pmcid" | "pmid" | "title";
                    outcome: "candidate" | "disabled" | "exists" | "no-record" | "nonexistent" | "skipped" | "unavailable" | "unsupported";
                    skippedDuplicates?: string[] | undefined;
                    unusedSlots?: number | undefined;
                }[];
                reasons: ("ambiguous-identity" | "development-route-incomplete" | "doi-nonexistent" | "fields-differ" | "foreign-doi" | "identified" | "identity-unresolved" | "insufficient-search" | "mandatory-resolution-incomplete" | "metadata-unavailable" | "mixed-components" | "outside-coverage" | "search-completed" | "url-verification-incomplete")[];
                failedSources: ("crossref" | "doi.org" | "openalex")[];
            };
            progress: "checking" | "crossref" | "doi.org" | "ended" | "openalex" | "queued";
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
            outcome: {
                kind: "status";
                status: "cancelled" | "failed" | "not-checked" | "running";
            } | {
                kind: "verdict";
                verdict: "correct" | "doi-conflict" | "exists-with-deviations" | "mixed-citation" | "not-found" | "not-verifiable";
                reference: {
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
                };
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
                retraction: "unknown";
                identity: {
                    candidateId?: string | undefined;
                    kind: "independent-bibliography" | "supplied-doi" | "supplied-identifier" | "unresolved";
                };
                candidates: {
                    id: string;
                    slot: number;
                    retrievedAt: string;
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
                    raw: unknown;
                    fields: {
                        field: string;
                        reference: unknown;
                        candidate: unknown;
                        score: {
                            value: number;
                            fullAgreement: boolean;
                        } | null;
                        reason: "compared" | "missing-candidate" | "missing-reference" | "not-determinable" | "resource-limit" | "unweighted";
                    }[];
                    score: {
                        value: number;
                        fullAgreement: boolean;
                    } | null;
                    source: "crossref" | "openalex";
                    origin: "authors-year" | "combined" | "doi" | "pmcid" | "pmid" | "title";
                    identifiers?: string[] | undefined;
                }[];
                evidence: {
                    reason?: string | undefined;
                    status?: number | undefined;
                    durationMs: number;
                    attempts: number;
                    observedAt: string;
                    raw?: unknown;
                    source: "crossref" | "doi.org" | "openalex";
                    operation: "authors-year" | "combined" | "doi" | "pmcid" | "pmid" | "title";
                    outcome: "candidate" | "disabled" | "exists" | "no-record" | "nonexistent" | "skipped" | "unavailable" | "unsupported";
                    skippedDuplicates?: string[] | undefined;
                    unusedSlots?: number | undefined;
                }[];
                reasons: ("ambiguous-identity" | "development-route-incomplete" | "doi-nonexistent" | "fields-differ" | "foreign-doi" | "identified" | "identity-unresolved" | "insufficient-search" | "mandatory-resolution-incomplete" | "metadata-unavailable" | "mixed-components" | "outside-coverage" | "search-completed" | "url-verification-incomplete")[];
                failedSources: ("crossref" | "doi.org" | "openalex")[];
            };
            progress: "checking" | "crossref" | "doi.org" | "ended" | "openalex" | "queued";
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
};
export declare function watchCheckEvents(checkId: string, options: WatchCheckOptions): Promise<void>;
