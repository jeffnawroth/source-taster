// SPDX-License-Identifier: AGPL-3.0-or-later
// Replay edge of the load harness (#117, ADR-0007). Data source responses and
// their latencies are replayed only here, at the HTTP edge of the adapters: the
// real web and worker processes, their limiter, clock, waiting and retry code
// all run unmodified against it. All source base URLs point at this one server
// (they must be bare origins), so requests are routed by shape.
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { once } from "node:events";
import { createServer } from "node:http";
import { z } from "zod";

export type ReplaySource =
  | "openalex"
  | "crossref"
  | "doi.org"
  | "europepmc"
  | "semanticscholar"
  | "arxiv"
  | "openlibrary"
  | "googlebooks"
  | "unknown";

/** Which Data source an adapter request belongs to, by its path and query. */
export function classify(url: URL): ReplaySource {
  const path = url.pathname;
  if (path.startsWith("/api/handles/")) return "doi.org";
  if (path.startsWith("/europepmc/")) return "europepmc";
  if (path.startsWith("/graph/v1/")) return "semanticscholar";
  if (path === "/api/query") return "arxiv";
  if (path === "/api/books" || path === "/search.json") return "openlibrary";
  if (path.startsWith("/books/v1/")) return "googlebooks";
  if (path === "/works") {
    const crossref = [...url.searchParams.keys()].some((key) =>
      key.startsWith("query."),
    );
    return crossref || !url.searchParams.has("filter")
      ? "crossref"
      : "openalex";
  }
  if (path.startsWith("/works/")) {
    const id = decodeURIComponent(path.slice("/works/".length));
    return /^(?:doi|pmid|pmcid|mag):/iu.test(id) ? "openalex" : "crossref";
  }
  return "unknown";
}

/** Canonical identity of a request: parameter order and encoding do not matter. */
export function requestKey(
  source: ReplaySource,
  url: URL,
  body?: unknown,
): string {
  const query = [...url.searchParams]
    .map(([key, value]) => `${key}=${value}`)
    .sort()
    .join("&");
  const suffix =
    body === undefined
      ? ""
      : `#${createHash("sha256").update(JSON.stringify(body)).digest("hex").slice(0, 16)}`;
  return `${source} ${decodeURIComponent(url.pathname)}?${query}${suffix}`;
}

export interface ReplayRequest {
  source: ReplaySource;
  url: URL;
  method: string;
  body?: unknown;
}
export interface ReplayAnswer {
  status: number;
  headers?: Record<string, string>;
  /** Objects are sent as JSON, strings verbatim. */
  body: unknown;
  /** Waited for real before the answer is sent. */
  latencyMs: number;
}
/** Returns the answer for a request, or undefined when nothing was recorded. */
export type ReplayPolicy = (request: ReplayRequest) => ReplayAnswer | undefined;

export interface ReplayStats {
  requests: Record<string, number>;
  unmatched: number;
}
export async function startReplay(options: {
  port: number;
  policy: ReplayPolicy;
}) {
  const requests: Record<string, number> = {};
  let unmatched = 0;
  const timers = new Set<NodeJS.Timeout>();
  const server = createServer((req, res) => {
    void (async () => {
      const url = new URL(req.url ?? "/", "http://replay");
      // No adapter requests the root; a bare "/" is an outside probe.
      if (url.pathname === "/" && url.search === "") {
        res.statusCode = 404;
        res.end("{}");
        return;
      }
      let body: unknown;
      if (req.method === "POST") {
        const chunks: Buffer[] = [];
        for await (const chunk of req) chunks.push(chunk as Buffer);
        try {
          body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
        } catch {
          body = undefined;
        }
      }
      const source = classify(url);
      requests[source] = (requests[source] ?? 0) + 1;
      const answer = options.policy({
        source,
        url,
        method: req.method ?? "GET",
        body,
      });
      if (!answer) {
        unmatched += 1;
        res.statusCode = 404;
        res.setHeader("content-type", "application/json");
        res.end("{}");
        return;
      }
      // The recorded latency is waited for real so that the adapters' own
      // timeout, the limiter and the Reference deadline see it.
      if (answer.latencyMs > 0)
        await new Promise<void>((resolve) => {
          const timer = setTimeout(() => {
            timers.delete(timer);
            resolve();
          }, answer.latencyMs);
          timers.add(timer);
          res.once("close", () => {
            clearTimeout(timer);
            timers.delete(timer);
            resolve();
          });
        });
      if (res.destroyed) return;
      res.writeHead(answer.status, {
        "content-type": "application/json",
        ...answer.headers,
      });
      res.end(
        typeof answer.body === "string"
          ? answer.body
          : JSON.stringify(answer.body),
      );
    })().catch(() => res.destroy());
  });
  server.listen(options.port, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  if (!address || typeof address === "string")
    throw new Error("replay-address");
  return {
    url: `http://127.0.0.1:${address.port}`,
    /** Counts only; never request text, which may be recorded private data. */
    stats: (): ReplayStats => ({ requests: { ...requests }, unmatched }),
    stop: async () => {
      for (const timer of timers) clearTimeout(timer);
      server.closeAllConnections();
      server.close();
      await once(server, "close");
    },
  };
}

// ---------------------------------------------------------------------------
// Workload
// ---------------------------------------------------------------------------

export interface WorkloadReference {
  /** Opaque identifier used in reports; never the Reference text. */
  id: string;
  category: "findable" | "not-findable" | "degraded";
  originalText: string;
  fields: { title: string } & Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Recorded replay (authorized recordings, kept in a private location)
// ---------------------------------------------------------------------------

const Recording = z.object({
  /** Who authorized the use of this recording for load qualification. */
  authorization: z.string().min(1),
  entries: z.array(
    z.object({
      source: z.string(),
      key: z.string(),
      status: z.number().int(),
      headers: z.record(z.string(), z.string()).optional(),
      body: z.unknown(),
      latencyMs: z.number().nonnegative(),
    }),
  ),
  workload: z
    .array(
      z.object({
        id: z.string().min(1),
        category: z.enum(["findable", "not-findable", "degraded"]),
        originalText: z.string(),
        fields: z.object({ title: z.string() }).catchall(z.unknown()),
      }),
    )
    .default([]),
});
export type Recording = z.input<typeof Recording>;

export async function loadRecording(path: string) {
  const bytes = await readFile(path);
  let json: unknown;
  try {
    json = JSON.parse(bytes.toString("utf8"));
  } catch {
    throw new Error("The recording is not valid JSON.");
  }
  const parsed = Recording.safeParse(json);
  if (!parsed.success)
    throw new Error(
      `Invalid recording (${[...new Set(parsed.error.issues.map((i) => i.path.join(".")))].join(", ")}); authorization metadata and entries are required.`,
    );
  return {
    recording: parsed.data,
    digest: `sha256:${createHash("sha256").update(bytes).digest("hex")}`,
  };
}

export function recordedPolicy(recording: Recording): ReplayPolicy {
  const entries = new Map(recording.entries.map((e) => [e.key, e]));
  return (request) => {
    const entry = entries.get(
      requestKey(request.source, request.url, request.body),
    );
    return entry && entry.source === request.source
      ? {
          status: entry.status,
          headers: entry.headers,
          body: entry.body,
          latencyMs: entry.latencyMs,
        }
      : undefined;
  };
}

// ---------------------------------------------------------------------------
// Synthetic latency witness (never recorded evidence)
// ---------------------------------------------------------------------------

/**
 * Deterministic synthetic lists: unique titles per Reference, a fixed share of
 * which no Data source knows. Synthetic text only; no private data.
 */
export function syntheticWorkload(options: {
  checks: number;
  referencesPerCheck: number;
  notFindableShare: number;
}): (WorkloadReference & { fields: SyntheticFields })[][] {
  const missing = Math.round(
    options.referencesPerCheck * options.notFindableShare,
  );
  return Array.from({ length: options.checks }, (_, check) =>
    Array.from({ length: options.referencesPerCheck }, (_, slot) => {
      // Spread the not-findable References evenly through the list.
      const absent =
        missing > 0 &&
        Math.floor(((slot + 1) * missing) / options.referencesPerCheck) >
          Math.floor((slot * missing) / options.referencesPerCheck);
      const category = absent ? "not-findable" : "findable";
      const title = `Witness ${absent ? "absent" : "present"} c${check} r${slot}`;
      return {
        id: `c${check}-r${slot}`,
        category,
        originalText: `Alpha, A. (2021). ${title}. Synthetic Journal.`,
        fields: {
          title,
          author: [{ family: "Alpha", given: "Ada" }],
          issued: { literal: "2021" },
        },
      } as const;
    }),
  ) as (WorkloadReference & { fields: SyntheticFields })[][];
}
interface SyntheticFields extends Record<string, unknown> {
  title: string;
  author: { family: string; given: string }[];
  issued: { literal: string };
}

const emptyBodies: Partial<Record<ReplaySource, unknown>> = {
  openalex: { results: [] },
  crossref: { status: "ok", message: { items: [] } },
  europepmc: { hitCount: 0, resultList: { result: [] } },
};

/**
 * Answers a Reference that is "present" from the first OpenAlex query that
 * names its title, and every other query with an empty result. The latencies
 * are chosen by the caller and are witnesses, not recorded values.
 */
export function syntheticPolicy(latency: {
  findableLatencyMs: number;
  notFindableLatencyMs: number;
}): ReplayPolicy {
  return (request) => {
    const empty = emptyBodies[request.source];
    if (empty === undefined) return undefined;
    const filter = request.url.searchParams.get("filter") ?? "";
    const title = /title\.search:([^,]*)/u.exec(filter)?.[1]?.trim();
    if (request.source === "openalex" && title && /present/u.test(title)) {
      const number = Number.parseInt(
        createHash("sha256").update(title).digest("hex").slice(0, 8),
        16,
      );
      return {
        status: 200,
        latencyMs: latency.findableLatencyMs,
        body: {
          results: [
            {
              id: `https://openalex.org/W${number}`,
              title,
              publication_year: 2021,
              authorships: [{ author: { display_name: "Ada Alpha" } }],
              ids: {},
            },
          ],
        },
      };
    }
    return {
      status: 200,
      latencyMs: latency.notFindableLatencyMs,
      body: empty,
    };
  };
}
