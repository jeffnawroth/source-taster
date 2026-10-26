import { CheckEvent, ProblemDetails } from "./index.ts";
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
export interface VerificationClientOptions {
    baseUrl?: string;
    client?: string;
    fetch?: typeof globalThis.fetch;
}
/** Transport-only API client: schemas and Problems are shared by both clients. */
export declare function verificationClient(options?: VerificationClientOptions): {
    createCheck: (text: string) => Promise<{
        id: string;
        state: "ended" | "running";
        lastEventSeq: number;
        references: {
            slot: number;
            originalText: string;
            outcome: {
                kind: "status";
                status: "cancelled" | "failed" | "not-checked" | "running";
            };
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
                author?: {
                    family?: string | undefined;
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
                span: {
                    start: number;
                    end: number;
                };
                normalized?: string | undefined;
            }>;
            authorsTruncated?: boolean | undefined;
            structuring: {
                path: "parser";
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
export interface WatchCheckOptions {
    /** Called once per event, in sequence order, without duplicates. */
    onEvent: (event: CheckEvent) => void;
    /** Origin of the API; defaults to same-origin relative URLs. */
    baseUrl?: string;
    /** Resume after this sequence number, e.g. a snapshot's lastEventSeq. */
    lastEventSeq?: number;
    signal?: AbortSignal;
    /** Delay before reconnecting after a dropped connection. */
    retryDelayMs?: number;
    fetch?: typeof globalThis.fetch;
}
/**
 * Follows a Check's events until the Check ends. Reconnects with
 * Last-Event-ID after dropped connections, so no event is lost or repeated.
 * Resolves after the final event; rejects with CheckStreamError on 4xx.
 */
export declare function watchCheckEvents(checkId: string, options: WatchCheckOptions): Promise<void>;
