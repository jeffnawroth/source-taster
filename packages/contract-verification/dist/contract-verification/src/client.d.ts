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
