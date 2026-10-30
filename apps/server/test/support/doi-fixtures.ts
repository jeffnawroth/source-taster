// SPDX-License-Identifier: AGPL-3.0-or-later
// External HTTP edge only. Never connects to a live provider during tests.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { once } from "node:events";

export const physicsReference =
  "Aspelmeyer, M. (2009). Measured measurement. Nature Physics, 5, 11–12. https://doi.org/10.1038/nphys1170";
interface FixtureResponse {
  status: number;
  body: unknown;
  headers?: Record<string, string>;
  incompleteBody?: boolean;
  /** A string body sent verbatim with its own content type, e.g. Atom XML. */
  contentType?: string;
}
export async function startDoiFixtures() {
  const crossref = await readFile(
    new URL("../fixtures/doi/crossref-nphys1170.json", import.meta.url),
    "utf8",
  );
  const handle = await readFile(
    new URL("../fixtures/doi/handle-nphys1170.json", import.meta.url),
    "utf8",
  );
  const responses = new Map<string, FixtureResponse[]>();
  // Query-aware routes for providers that keep one path for several operations.
  const routes: ((url: URL, body?: unknown) => FixtureResponse | undefined)[] =
    [];
  const requests: {
    path: string;
    at: number;
    completedAt?: number;
    method?: string;
    body?: unknown;
  }[] = [];
  const holds = new Map<
    string,
    { entered: () => void; release: Promise<void>; body: boolean }
  >();
  const server = createServer((req, res) => {
    void (async () => {
      const request = {
        path: decodeURIComponent(req.url ?? ""),
        at: Date.now(),
        completedAt: undefined as number | undefined,
        method: req.method,
        body: undefined as unknown,
      };
      // No source adapter requests the root; a bare "/" is an outside port
      // probe (such as an editor's port detection), not a source request.
      if (req.url !== "/") requests.push(request);
      res.once("close", () => {
        request.completedAt = Date.now();
      });
      // JSON request bodies (Semantic Scholar batch lookups) are recorded.
      if (req.method === "POST") {
        const chunks: Buffer[] = [];
        for await (const chunk of req) chunks.push(chunk as Buffer);
        request.body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
      }
      const hold =
        holds.get(decodeURIComponent(req.url ?? "")) ??
        holds.get(new URL(req.url ?? "/", "http://fixture").pathname);
      if (hold) {
        if (hold.body) {
          res.setHeader("content-type", "application/json");
          res.flushHeaders();
          res.write(" ");
        }
        hold.entered();
        await hold.release;
      }
      res.setHeader("content-type", "application/json");
      const sequence =
        responses.get(decodeURIComponent(req.url ?? "")) ??
        responses.get(new URL(req.url ?? "/", "http://fixture").pathname);
      const routed = routes
        .map((route) =>
          route(new URL(req.url ?? "/", "http://fixture"), request.body),
        )
        .find(Boolean);
      const override =
        routed ??
        (sequence && (sequence.length > 1 ? sequence.shift() : sequence[0]));
      if (override) {
        if (override.contentType)
          res.setHeader("content-type", override.contentType);
        res.writeHead(override.status, override.headers);
        if (override.incompleteBody) {
          res.flushHeaders();
          res.write(" ");
          return;
        }
        res.end(
          Buffer.isBuffer(override.body)
            ? override.body
            : override.contentType && typeof override.body === "string"
              ? override.body
              : JSON.stringify(override.body),
        );
        return;
      }
      if (req.url?.startsWith("/api/handles/")) res.end(handle);
      else if (req.url?.startsWith("/works/")) res.end(crossref);
      else {
        res.statusCode = 404;
        res.end("{}");
      }
    })().catch(() => res.destroy());
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  if (!address || typeof address === "string")
    throw new Error("fixture-address");
  const base = `http://127.0.0.1:${address.port}`;
  return {
    requests,
    hold(path: string, body = false) {
      let entered!: () => void;
      let release!: () => void;
      const arrived = new Promise<void>((resolve) => {
        entered = resolve;
      });
      const gate = new Promise<void>((resolve) => {
        release = resolve;
      });
      holds.set(path, { entered, release: gate, body });
      return { arrived, release };
    },
    reset: () => {
      responses.clear();
      routes.length = 0;
      holds.clear();
    },
    route: (
      handler: (url: URL, body?: unknown) => FixtureResponse | undefined,
    ) => routes.push(handler),
    respondSequence: (path: string, sequence: FixtureResponse[]) =>
      responses.set(path, [...sequence]),
    respond: (
      path: string,
      status: number,
      body: unknown,
      headers?: Record<string, string>,
    ) => responses.set(path, [{ status, body, headers }]),
    env: {
      SOURCE_TASTER_DOI_PREVIEW: "uncalibrated",
      SOURCE_TASTER_CROSSREF_BASE_URL: base,
      SOURCE_TASTER_DOI_RESOLVER_BASE_URL: base,
    },
    stop: () =>
      new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
        server.closeAllConnections();
      }),
  };
}
