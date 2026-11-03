export type JsonInput = unknown;
export declare class JsonFragment {
    source: AsyncIterable<string>;
    constructor(source: AsyncIterable<string>);
}
/** Encode lazy collections and split even a single long string without building
 * a complete serialized record or document. Callers own bounded persistence reads. */
export declare function jsonTokens(value: JsonInput): AsyncGenerator<string>;
export interface DeliveryContext {
    snapshotId: string;
    requestId: string;
    program: "service" | "verification" | "accounting";
    generatedAt: string;
    expiresAt: string;
    credentialHash: string;
    records?: Record<string, string>;
}
export declare function partLimit(input: string | undefined): number;
export declare function deliveryCursor(secret: string, context: DeliveryContext, cursor?: string): {
    sequence: number;
    prefix: string;
} | {
    context: DeliveryContext;
    sequence: number;
    prefix: string;
};
/** Backpressure follows ReadableStream.pull. A cancelled response closes its
 * iterator. Resume replays and authenticates the prefix without retaining it. */
export declare function deliveryBody(options: {
    source: AsyncIterable<string>;
    context: DeliveryContext;
    secret: string;
    partBytes: number;
    multipart: boolean;
    cursor?: string;
    validate(): Promise<void>;
    completed(verifier: string): Promise<void>;
}): ReadableStream<Uint8Array<ArrayBufferLike>>;
