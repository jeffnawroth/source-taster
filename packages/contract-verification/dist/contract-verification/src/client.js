// SPDX-License-Identifier: AGPL-3.0-or-later OR MIT
// Browser and Node client for the Check event stream. Uses fetch rather than
// EventSource so it can resume with an explicit Last-Event-ID.
import { ZodError } from "zod";
import { CheckEvent, CheckResponse, StructuringResponse, isFinalEvent, ProblemDetails, } from "./index.js";
/** Splits a text/event-stream body into frames (WHATWG HTML §9.2). */
export async function* readSseFrames(body) {
    const reader = body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let frame = { data: "" };
    let hasData = false;
    try {
        for (;;) {
            const { value, done } = await reader.read();
            if (done)
                return;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";
            for (const rawLine of lines) {
                const line = rawLine.endsWith("\r") ? rawLine.slice(0, -1) : rawLine;
                if (line === "") {
                    if (hasData)
                        yield frame;
                    frame = { data: "" };
                    hasData = false;
                    continue;
                }
                if (line.startsWith(":"))
                    continue;
                const colon = line.indexOf(":");
                const field = colon === -1 ? line : line.slice(0, colon);
                let value = colon === -1 ? "" : line.slice(colon + 1);
                if (value.startsWith(" "))
                    value = value.slice(1);
                if (field === "data") {
                    frame.data = hasData ? `${frame.data}\n${value}` : value;
                    hasData = true;
                }
                else if (field === "id") {
                    frame.id = value;
                }
                else if (field === "event") {
                    frame.event = value;
                }
            }
        }
    }
    finally {
        reader.releaseLock();
    }
}
/** A response the server will not change its mind about; do not retry. */
export class CheckStreamError extends Error {
    status;
    problem;
    constructor(status, problem) {
        super(problem?.title ?? `Check stream failed with HTTP ${status}`);
        this.name = "CheckStreamError";
        this.status = status;
        this.problem = problem;
    }
}
/** Failed HTTP response, including a parsed Problem when the server supplied one. */
export class ApiError extends Error {
    status;
    problem;
    constructor(status, problem) {
        super(problem?.title ?? `API request failed with HTTP ${status}`);
        this.name = "ApiError";
        this.status = status;
        this.problem = problem;
    }
}
/** Transport-only API client: schemas and Problems are shared by both clients. */
export function verificationClient(options = {}) {
    return createVerificationClient(options, "/v1", CheckResponse);
}
/** Shared transport across majors; policies and verification remain server-owned. */
export function createVerificationClient(options, prefix, responseSchema) {
    async function headers() {
        return {
            ...(options.client ? { "Source-Taster-Client": options.client } : {}),
            ...(options.credentials
                ? { Authorization: `Bearer ${await options.credentials()}` }
                : {}),
        };
    }
    async function post(path, requestBody, schema) {
        const response = await (options.fetch ?? globalThis.fetch)(`${options.baseUrl ?? ""}${path}`, {
            method: "POST",
            headers: {
                "content-type": "application/json",
                ...(await headers()),
            },
            body: JSON.stringify(requestBody),
        });
        const body = await response.json().catch(() => undefined);
        if (!response.ok)
            throw new ApiError(response.status, ProblemDetails.safeParse(body).data);
        return schema.parse(body);
    }
    return {
        createCheck: async (input) => (await post(`${prefix}/checks`, typeof input === "string" ? { text: input } : input, responseSchema)).data,
        cancelCheck: async (checkId) => (await post(`${prefix}/checks/${encodeURIComponent(checkId)}/cancel`, undefined, responseSchema)).data,
        renewCheckLease: async (checkId) => (await post(`${prefix}/checks/${encodeURIComponent(checkId)}/lease`, undefined, responseSchema)).data,
        getCheck: async (checkId) => {
            const response = await (options.fetch ?? globalThis.fetch)(`${options.baseUrl ?? ""}${prefix}/checks/${encodeURIComponent(checkId)}`, {
                headers: await headers(),
            });
            const body = await response.json().catch(() => undefined);
            if (!response.ok)
                throw new ApiError(response.status, ProblemDetails.safeParse(body).data);
            return responseSchema.parse(body).data;
        },
        structureReferences: async (text) => (await post("/v1/structurings", { text }, StructuringResponse)).data,
    };
}
/**
 * Follows a Check's events until the Check ends. Reconnects with
 * Last-Event-ID after dropped connections, so no event is lost or repeated.
 * Resolves after the final event; rejects with CheckStreamError on 4xx.
 */
export async function watchCheckEvents(checkId, options) {
    return watchContractEvents(checkId, options, "/v1", CheckEvent, isFinalEvent);
}
/** Shared cursor/reconnect transport, with a major-specific event schema. */
export async function watchContractEvents(checkId, options, prefix, schema, final) {
    const doFetch = options.fetch ?? globalThis.fetch;
    const url = `${options.baseUrl ?? ""}${prefix}/checks/${encodeURIComponent(checkId)}/events`;
    let lastSeq = options.lastEventSeq ?? 0;
    let retryDelayMs = options.retryDelayMs ?? 1000;
    for (;;) {
        options.signal?.throwIfAborted();
        try {
            const headers = { accept: "text/event-stream" };
            if (options.credentials)
                headers.authorization = `Bearer ${await options.credentials()}`;
            if (options.client)
                headers["Source-Taster-Client"] = options.client;
            headers["last-event-id"] = `${checkId}:${lastSeq}`;
            const response = await doFetch(url, { headers, signal: options.signal });
            if ((response.status >= 400 && response.status < 500) ||
                response.status === 503) {
                const body = await response.json().catch(() => undefined);
                const problem = ProblemDetails.safeParse(body);
                throw new CheckStreamError(response.status, problem.data);
            }
            if (response.ok && response.body) {
                for await (const frame of readSseFrames(response.body)) {
                    const event = schema.parse(JSON.parse(frame.data));
                    if (event.checkId !== checkId ||
                        frame.id !== `${checkId}:${event.seq}`)
                        throw new SyntaxError("Invalid Check event cursor");
                    if (event.seq <= lastSeq)
                        continue;
                    if (event.seq !== lastSeq + 1)
                        throw new SyntaxError("Check event sequence gap");
                    lastSeq = event.seq;
                    options.onEvent(event);
                    if (final(event))
                        return;
                }
            }
        }
        catch (error) {
            if (error instanceof CheckStreamError)
                throw error;
            options.signal?.throwIfAborted();
            // A malformed event is a contract violation, not a transient failure.
            if (error instanceof SyntaxError || error instanceof ZodError)
                throw error;
        }
        await sleep(retryDelayMs, options.signal);
        retryDelayMs = Math.min(retryDelayMs * 2, 30_000);
    }
}
function sleep(ms, signal) {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(done, ms);
        function done() {
            signal?.removeEventListener("abort", abort);
            resolve();
        }
        function abort() {
            clearTimeout(timer);
            reject(new DOMException("The watch was aborted.", "AbortError"));
        }
        signal?.addEventListener("abort", abort, { once: true });
    });
}
