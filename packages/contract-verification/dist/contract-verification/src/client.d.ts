import { CheckEvent, ProblemDetails, type CreateCheckRequest } from "./index.ts";
export interface SseFrame {
    id?: string;
    event?: string;
    data: string;
}
/** Splits a text/event-stream body into frames (WHATWG HTML §9.2). */
export declare function readSseFrames(body: ReadableStream<Uint8Array>): AsyncGenerator<SseFrame>;
/** A response the server will not change its mind about; do not retry. */
export declare class CheckStreamError extends Error {
    readonly status: number;
    readonly problem: ProblemDetails | undefined;
    constructor(status: number, problem: ProblemDetails | undefined);
}
/** Failed HTTP response, including a parsed Problem when the server supplied one. */
export declare class ApiError extends Error {
    readonly status: number;
    readonly problem: ProblemDetails | undefined;
    constructor(status: number, problem: ProblemDetails | undefined);
}
/** Called for every fetch/reconnect. Tokens must stay in memory. */
export type CredentialSupplier = () => Promise<string>;
export interface VerificationClientOptions {
    credentials?: CredentialSupplier;
    baseUrl?: string;
    client?: string;
    fetch?: typeof globalThis.fetch;
}
/** Transport-only API client: schemas and Problems are shared by both clients. */
export declare function verificationClient(options?: VerificationClientOptions): {
    createCheck: (input: string | {
        text: string;
    } | {
        references: {
            originalText: string;
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
            };
            authorsTruncated?: boolean | undefined;
        }[];
    }) => Promise<{
        measuredConfigurationId?: string | undefined;
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
                measuredConfigurationId?: string | undefined;
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
                identity: {
                    kind: "independent-bibliography" | "supplied-doi" | "unresolved";
                    candidateId?: string | undefined;
                };
                bestMatchId: string | null;
                candidates: {
                    id: string;
                    source: "crossref";
                    origin: "authors-year" | "combined" | "doi" | "title";
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
                }[];
                evidence: {
                    source: "crossref" | "doi.org";
                    operation: "authors-year" | "combined" | "doi" | "title";
                    outcome: "candidate" | "exists" | "no-record" | "nonexistent" | "unavailable";
                    reason?: string | undefined;
                    status?: number | undefined;
                    durationMs: number;
                    attempts: number;
                    observedAt: string;
                    raw?: unknown;
                }[];
                reasons: ("development-route-incomplete" | "doi-nonexistent" | "fields-differ" | "foreign-doi" | "identified" | "identity-unresolved" | "mandatory-resolution-incomplete" | "metadata-unavailable" | "outside-coverage" | "url-verification-incomplete")[];
                failedSources: ("crossref" | "doi.org")[];
                retraction: "unknown";
            };
            progress: "checking" | "crossref" | "doi.org" | "ended" | "queued";
        }[];
    }>;
    cancelCheck: (checkId: string) => Promise<{
        measuredConfigurationId?: string | undefined;
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
                measuredConfigurationId?: string | undefined;
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
                identity: {
                    kind: "independent-bibliography" | "supplied-doi" | "unresolved";
                    candidateId?: string | undefined;
                };
                bestMatchId: string | null;
                candidates: {
                    id: string;
                    source: "crossref";
                    origin: "authors-year" | "combined" | "doi" | "title";
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
                }[];
                evidence: {
                    source: "crossref" | "doi.org";
                    operation: "authors-year" | "combined" | "doi" | "title";
                    outcome: "candidate" | "exists" | "no-record" | "nonexistent" | "unavailable";
                    reason?: string | undefined;
                    status?: number | undefined;
                    durationMs: number;
                    attempts: number;
                    observedAt: string;
                    raw?: unknown;
                }[];
                reasons: ("development-route-incomplete" | "doi-nonexistent" | "fields-differ" | "foreign-doi" | "identified" | "identity-unresolved" | "mandatory-resolution-incomplete" | "metadata-unavailable" | "outside-coverage" | "url-verification-incomplete")[];
                failedSources: ("crossref" | "doi.org")[];
                retraction: "unknown";
            };
            progress: "checking" | "crossref" | "doi.org" | "ended" | "queued";
        }[];
    }>;
    renewCheckLease: (checkId: string) => Promise<{
        measuredConfigurationId?: string | undefined;
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
                measuredConfigurationId?: string | undefined;
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
                identity: {
                    kind: "independent-bibliography" | "supplied-doi" | "unresolved";
                    candidateId?: string | undefined;
                };
                bestMatchId: string | null;
                candidates: {
                    id: string;
                    source: "crossref";
                    origin: "authors-year" | "combined" | "doi" | "title";
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
                }[];
                evidence: {
                    source: "crossref" | "doi.org";
                    operation: "authors-year" | "combined" | "doi" | "title";
                    outcome: "candidate" | "exists" | "no-record" | "nonexistent" | "unavailable";
                    reason?: string | undefined;
                    status?: number | undefined;
                    durationMs: number;
                    attempts: number;
                    observedAt: string;
                    raw?: unknown;
                }[];
                reasons: ("development-route-incomplete" | "doi-nonexistent" | "fields-differ" | "foreign-doi" | "identified" | "identity-unresolved" | "mandatory-resolution-incomplete" | "metadata-unavailable" | "outside-coverage" | "url-verification-incomplete")[];
                failedSources: ("crossref" | "doi.org")[];
                retraction: "unknown";
            };
            progress: "checking" | "crossref" | "doi.org" | "ended" | "queued";
        }[];
    }>;
    getCheck: (checkId: string) => Promise<{
        measuredConfigurationId?: string | undefined;
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
                measuredConfigurationId?: string | undefined;
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
                identity: {
                    kind: "independent-bibliography" | "supplied-doi" | "unresolved";
                    candidateId?: string | undefined;
                };
                bestMatchId: string | null;
                candidates: {
                    id: string;
                    source: "crossref";
                    origin: "authors-year" | "combined" | "doi" | "title";
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
                }[];
                evidence: {
                    source: "crossref" | "doi.org";
                    operation: "authors-year" | "combined" | "doi" | "title";
                    outcome: "candidate" | "exists" | "no-record" | "nonexistent" | "unavailable";
                    reason?: string | undefined;
                    status?: number | undefined;
                    durationMs: number;
                    attempts: number;
                    observedAt: string;
                    raw?: unknown;
                }[];
                reasons: ("development-route-incomplete" | "doi-nonexistent" | "fields-differ" | "foreign-doi" | "identified" | "identity-unresolved" | "mandatory-resolution-incomplete" | "metadata-unavailable" | "outside-coverage" | "url-verification-incomplete")[];
                failedSources: ("crossref" | "doi.org")[];
                retraction: "unknown";
            };
            progress: "checking" | "crossref" | "doi.org" | "ended" | "queued";
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
/** Shared transport across majors; policies and verification remain server-owned. */
export declare function createVerificationClient<T, Input = CreateCheckRequest>(options: VerificationClientOptions, prefix: string, responseSchema: {
    parse(input: unknown): {
        data: T;
    };
}): {
    createCheck: (input: string | Input) => Promise<T>;
    cancelCheck: (checkId: string) => Promise<T>;
    renewCheckLease: (checkId: string) => Promise<T>;
    getCheck: (checkId: string) => Promise<T>;
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
export interface WatchOptions<Event> {
    credentials?: CredentialSupplier;
    client?: string;
    /** Called once per event, in sequence order, without duplicates. */
    onEvent: (event: Event) => void;
    /** Origin of the API; defaults to same-origin relative URLs. */
    baseUrl?: string;
    /** Resume after this sequence number, e.g. a snapshot's lastEventSeq. */
    lastEventSeq?: number;
    signal?: AbortSignal;
    /** Delay before reconnecting after a dropped connection. */
    retryDelayMs?: number;
    fetch?: typeof globalThis.fetch;
}
export type WatchCheckOptions = WatchOptions<CheckEvent>;
/**
 * Follows a Check's events until the Check ends. Reconnects with
 * Last-Event-ID after dropped connections, so no event is lost or repeated.
 * Resolves after the final event; rejects with CheckStreamError on 4xx.
 */
export declare function watchCheckEvents(checkId: string, options: WatchCheckOptions): Promise<void>;
/** Shared cursor/reconnect transport, with a major-specific event schema. */
export declare function watchContractEvents<Event extends {
    checkId: string;
    seq: number;
}>(checkId: string, options: WatchOptions<Event>, prefix: string, schema: {
    parse(input: unknown): Event;
}, final: (event: Event) => boolean): Promise<void>;
