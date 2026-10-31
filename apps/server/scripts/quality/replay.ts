// SPDX-License-Identifier: AGPL-3.0-or-later
// ADR-0006 replay: every Data source origin is a loopback listener answering
// only recorded responses. An unrecorded request is a replay miss: it is
// answered with 503 (never an empty or 404 answer that could read as "no
// record" and manufacture Not found) and invalidates the run.
import { createServer, type Server } from "node:http";
import { once } from "node:events";
import { setTimeout as sleep } from "node:timers/promises";
import {
  replaySources,
  type FixtureEntry,
  type ReplaySource,
} from "./dataset.ts";

const environment: Record<ReplaySource, string> = {
  "doi.org": "SOURCE_TASTER_DOI_RESOLVER_BASE_URL",
  crossref: "SOURCE_TASTER_CROSSREF_BASE_URL",
  openalex: "SOURCE_TASTER_OPENALEX_BASE_URL",
  europepmc: "SOURCE_TASTER_EUROPEPMC_BASE_URL",
  semanticscholar: "SOURCE_TASTER_SEMANTICSCHOLAR_BASE_URL",
  arxiv: "SOURCE_TASTER_ARXIV_BASE_URL",
  openlibrary: "SOURCE_TASTER_OPENLIBRARY_BASE_URL",
  googlebooks: "SOURCE_TASTER_GOOGLEBOOKS_BASE_URL",
  web: "SOURCE_TASTER_WEB_FIXTURE_BASE_URL",
};
export interface ReplayMiss {
  source: ReplaySource;
  method: string;
  path: string;
}
/** Path plus query with parameters sorted, so parameter order never matters. */
function canonical(path: string) {
  const url = new URL(path, "http://replay");
  url.searchParams.sort();
  return `${url.pathname}?${url.searchParams.toString()}`;
}
const key = (method: string, path: string, body?: string) =>
  JSON.stringify([method.toUpperCase(), canonical(path), body ?? null]);

export async function startReplay(entries: FixtureEntry[]) {
  const misses: ReplayMiss[] = [];
  const servers: Server[] = [];
  const env: Record<string, string> = {};
  for (const source of replaySources) {
    const recorded = new Map<string, FixtureEntry>();
    const withBody = new Set<string>();
    for (const entry of entries.filter((e) => e.source === source)) {
      recorded.set(key(entry.method, entry.path, entry.requestBody), entry);
      if (entry.requestBody !== undefined)
        withBody.add(key(entry.method, entry.path));
    }
    const server = createServer((req, res) => {
      const chunks: Buffer[] = [];
      req.on("data", (chunk: Buffer) => chunks.push(chunk));
      req.on("end", () => {
        const method = req.method ?? "GET";
        const path = req.url ?? "/";
        const body = Buffer.concat(chunks).toString("utf8");
        const entry = recorded.get(
          key(method, path, withBody.has(key(method, path)) ? body : undefined),
        );
        if (!entry) {
          // A bare root request is an outside port probe, never an adapter.
          if (!(method === "GET" && path === "/"))
            misses.push({ source, method, path });
          res.writeHead(503, { "content-type": "application/json" });
          res.end('{"replay":"miss"}');
          return;
        }
        void sleep(entry.delayMs).then(() => {
          res.writeHead(entry.status, entry.headers);
          res.end(entry.body);
        });
      });
    });
    server.listen(0, "127.0.0.1");
    await once(server, "listening");
    const address = server.address();
    if (!address || typeof address === "string")
      throw new Error("Replay listener has no port.");
    env[environment[source]] = `http://127.0.0.1:${address.port}`;
    servers.push(server);
  }
  return {
    env,
    misses: () => [...misses],
    stop: async () => {
      await Promise.all(
        servers.map(async (server) => {
          server.closeAllConnections();
          server.close();
          await once(server, "close");
        }),
      );
    },
  };
}
