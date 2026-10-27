// SPDX-License-Identifier: AGPL-3.0-or-later
import { doiTracerLimits } from "@source-taster/core";
import type {
  DataSource,
  DoiResolver,
  Evidence,
  RetrievedCandidate,
} from "@source-taster/core";
import { z } from "zod";
export interface SourceBudget {
  acquire: (
    source: "doi.org" | "crossref",
    operation: "doi" | "combined",
    deadline: number,
  ) => Promise<(() => Promise<void>) | null>;
  defer: (source: "doi.org" | "crossref", delayMs: number) => Promise<void>;
}
const crossrefRecord = z.object({
  DOI: z.string(),
  title: z.array(z.string()).optional(),
  author: z
    .array(
      z.object({
        family: z.string().optional(),
        given: z.string().optional(),
        name: z.string().optional(),
      }),
    )
    .optional(),
  "container-title": z.array(z.string()).optional(),
  "short-container-title": z.array(z.string()).optional(),
  published: z
    .object({ "date-parts": z.array(z.array(z.number().int())) })
    .optional(),
  volume: z.string().optional(),
  issue: z.string().optional(),
  page: z.string().optional(),
  "article-number": z.string().optional(),
  type: z.string().optional(),
  URL: z.string().optional(),
});
export interface SourceClock {
  now: () => number;
  sleep: (ms: number, signal?: AbortSignal) => Promise<void>;
}
export const systemSourceClock: SourceClock = {
  now: Date.now,
  sleep: (ms, signal) =>
    new Promise((resolve, reject) => {
      signal?.throwIfAborted();
      const timer = setTimeout(() => {
        signal?.removeEventListener("abort", abort);
        resolve();
      }, ms);
      function abort() {
        clearTimeout(timer);
        reject(new Error("source-operation-aborted"));
      }
      signal?.addEventListener("abort", abort, { once: true });
    }),
};
export function createDoiAdapters(options: {
  resolverBase: string;
  crossrefBase: string;
  budget: SourceBudget;
  clock?: SourceClock;
  signal?: AbortSignal;
  dispatch?: (send: () => Promise<Response>) => Promise<Response>;
  beforeRequest?: (source: "doi.org" | "crossref") => Promise<void>;
}) {
  const clock = options.clock ?? systemSourceClock;
  async function request(
    source: "doi.org" | "crossref",
    url: URL,
    deadline: number,
    operation: "doi" | "combined" = "doi",
  ): Promise<{ body?: unknown; evidence: Evidence }> {
    const began = clock.now();
    let attempts = 0,
      status: number | undefined,
      body: unknown,
      reason = "deadline";
    for (let attempt = 0; attempt <= doiTracerLimits.maxRetries; attempt++) {
      options.signal?.throwIfAborted();
      if (clock.now() >= deadline) break;
      await options.beforeRequest?.(source);
      options.signal?.throwIfAborted();
      const release = await options.budget.acquire(source, operation, deadline);
      if (!release) {
        reason = "rate-budget";
        break;
      }
      let retry = false,
        delay = 0;
      try {
        if (clock.now() >= deadline) {
          reason = "deadline";
          break;
        }
        options.signal?.throwIfAborted();
        await options.beforeRequest?.(source);
        attempts++;
        const send = () =>
          fetch(url, {
            headers: {
              accept: "application/json",
              "user-agent":
                "Source-Taster/0.0.0 (uncalibrated development preview)",
            },
            redirect: "error",
            signal: AbortSignal.any([
              AbortSignal.timeout(
                Math.max(
                  1,
                  Math.min(
                    doiTracerLimits.requestTimeoutMs,
                    deadline - clock.now(),
                  ),
                ),
              ),
              ...(options.signal ? [options.signal] : []),
            ]),
          });
        const response = await (options.dispatch
          ? options.dispatch(send)
          : send());
        status = response.status;
        // Bound streaming bytes after decompression as well as the declared wire size.
        if (
          Number(response.headers.get("content-length") ?? 0) >
          doiTracerLimits.maxResponseBytes
        ) {
          await response.body?.cancel();
          reason = "response-size";
          break;
        }
        const reader = response.body?.getReader();
        const chunks: Uint8Array[] = [];
        let length = 0;
        if (reader)
          for (;;) {
            const next = await reader.read();
            if (next.done) break;
            length += next.value.length;
            if (length > doiTracerLimits.maxResponseBytes) {
              await reader.cancel();
              throw new Error("response-size");
            }
            chunks.push(next.value);
          }
        const bytes = new Uint8Array(length);
        let offset = 0;
        for (const chunk of chunks) {
          bytes.set(chunk, offset);
          offset += chunk.length;
        }
        if (clock.now() >= deadline) {
          body = undefined;
          reason = "deadline";
          break;
        }
        options.signal?.throwIfAborted();
        try {
          body = JSON.parse(new TextDecoder().decode(bytes));
        } catch {
          body = undefined;
        }
        if (response.ok || response.status === 404) {
          reason = "response";
          break;
        }
        const after = response.headers.get("retry-after");
        if ((response.status === 429 || response.status >= 500) && after) {
          const seconds = Number(after);
          delay = /^\d+(?:\.\d+)?$/u.test(after)
            ? Math.ceil(seconds * 1000)
            : Math.max(0, Date.parse(after) - clock.now());
          if (Number.isFinite(delay)) await options.budget.defer(source, delay);
          retry = Number.isFinite(delay) && delay <= 2000;
        } else if (response.status >= 500) retry = true;
        reason = response.status === 429 ? "rate-budget" : "http-error";
      } catch (error) {
        options.signal?.throwIfAborted();
        reason =
          error instanceof Error && error.message === "response-size"
            ? "response-size"
            : "request-unavailable";
        retry = error instanceof Error && error.name === "TimeoutError";
      } finally {
        await release();
      }
      if (
        !retry ||
        attempt === doiTracerLimits.maxRetries ||
        clock.now() + delay >= deadline
      )
        break;
      if (delay) {
        await clock.sleep(delay, options.signal);
      }
    }
    return {
      body,
      evidence: {
        source,
        operation,
        outcome: "unavailable",
        reason,
        ...(status === undefined ? {} : { status }),
        durationMs: clock.now() - began,
        attempts,
        observedAt: new Date(clock.now()).toISOString(),
        ...(body === undefined ? {} : { raw: body }),
      },
    };
  }
  const resolver: DoiResolver = {
    resolve: async (doi, deadline) => {
      const { body, evidence } = await request(
        "doi.org",
        new URL(
          `/api/handles/${encodeURIComponent(doi)}`,
          options.resolverBase,
        ),
        deadline,
      );
      const parsed = z
        .object({
          responseCode: z.number().int(),
          handle: z.string().optional(),
        })
        .safeParse(body);
      if (
        parsed.success &&
        parsed.data.responseCode === 1 &&
        evidence.status === 200 &&
        parsed.data.handle?.toLowerCase() === doi
      )
        return { ...evidence, outcome: "exists", reason: undefined };
      if (
        parsed.success &&
        parsed.data.responseCode === 100 &&
        parsed.data.handle?.toLowerCase() === doi &&
        (evidence.status === 200 || evidence.status === 404)
      )
        return { ...evidence, outcome: "nonexistent", reason: undefined };
      return {
        ...evidence,
        reason:
          evidence.reason === "response"
            ? "invalid-resolver-response"
            : evidence.reason,
      };
    },
  };
  function project(
    body: unknown,
    origin: "doi" | "combined",
    observedAt: string,
  ): RetrievedCandidate | null {
    const parsed = crossrefRecord.safeParse(body);
    if (!parsed.success) return null;
    const m = parsed.data;
    const date = m.published?.["date-parts"][0];
    return {
      id: m.DOI.toLowerCase(),
      source: "crossref",
      origin,
      retrievedAt: observedAt,
      raw: body,
      csl: {
        DOI: m.DOI,
        ...(m.title?.[0] ? { title: m.title[0] } : {}),
        ...(m.author
          ? {
              author: m.author.map((a) =>
                a.name
                  ? { literal: a.name }
                  : { family: a.family, given: a.given },
              ),
            }
          : {}),
        ...(m["container-title"]?.[0]
          ? { "container-title": m["container-title"][0] }
          : {}),
        ...(m["short-container-title"]?.[0]
          ? { "container-title-short": m["short-container-title"][0] }
          : {}),
        ...(date?.[0]
          ? {
              issued: {
                literal: date
                  .map((p, i) => (i ? String(p).padStart(2, "0") : String(p)))
                  .join("-"),
              },
            }
          : {}),
        ...(m.volume ? { volume: m.volume } : {}),
        ...(m.issue ? { issue: m.issue } : {}),
        ...(m.page ? { page: m.page } : {}),
        ...(m["article-number"]
          ? { "article-number": m["article-number"] }
          : {}),
        ...(m.URL ? { URL: m.URL } : {}),
      },
    };
  }
  const source: DataSource = {
    lookupDoi: async (doi, deadline) => {
      const { body, evidence } = await request(
        "crossref",
        new URL(`/works/${encodeURIComponent(doi)}`, options.crossrefBase),
        deadline,
      );
      if (evidence.status === 404)
        return {
          evidence: {
            ...evidence,
            outcome: "no-record",
            reason: "not-in-crossref",
          },
        };
      const parsed = z.object({ message: z.unknown() }).safeParse(body);
      const candidate = parsed.success
        ? project(parsed.data.message, "doi", evidence.observedAt)
        : null;
      if (evidence.status !== 200 || !candidate)
        return {
          evidence: {
            ...evidence,
            reason:
              evidence.reason === "response"
                ? "invalid-metadata"
                : evidence.reason,
          },
        };
      if (candidate.id !== doi)
        return {
          evidence: {
            ...evidence,
            outcome: "unavailable",
            reason: "identifier-mismatch",
          },
        };
      return {
        candidate,
        evidence: { ...evidence, outcome: "candidate", reason: undefined },
      };
    },
    findIntended: async (reference, deadline) => {
      const url = new URL("/works", options.crossrefBase);
      url.searchParams.set(
        "query.bibliographic",
        [
          reference.title,
          ...(reference.author ?? []).map(
            (a) => a.literal ?? [a.given, a.family].filter(Boolean).join(" "),
          ),
          reference.issued?.literal,
        ]
          .filter(Boolean)
          .join(" "),
      );
      url.searchParams.set("rows", "5");
      const { body, evidence } = await request(
        "crossref",
        url,
        deadline,
        "combined",
      );
      const parsed = z
        .object({ message: z.object({ items: z.array(z.unknown()) }) })
        .safeParse(body);
      if (evidence.status !== 200 || !parsed.success)
        return {
          candidates: [],
          evidence: { ...evidence, reason: "probe-unavailable" },
        };
      // Exactly the first provider-ranked combined Candidate is evaluated. No
      // pagination, refill request or unbounded search in the DOI tracer.
      const first = parsed.data.message.items[0];
      const candidate =
        first === undefined
          ? null
          : project(first, "combined", evidence.observedAt);
      if (first !== undefined && !candidate)
        return {
          candidates: [],
          evidence: { ...evidence, reason: "invalid-metadata" },
        };
      return {
        candidates: candidate ? [candidate] : [],
        evidence: {
          ...evidence,
          outcome: candidate ? "candidate" : "no-record",
          reason: undefined,
        },
      };
    },
  };
  return { resolver, source };
}
