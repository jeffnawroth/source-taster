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
  const requests: { path: string; at: number; completedAt?: number }[] = [];
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
      };
      requests.push(request);
      res.once("close", () => {
        request.completedAt = Date.now();
      });
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
      const override =
        sequence && (sequence.length > 1 ? sequence.shift() : sequence[0]);
      if (override) {
        res.writeHead(override.status, override.headers);
        if (override.incompleteBody) {
          res.flushHeaders();
          res.write(" ");
          return;
        }
        res.end(JSON.stringify(override.body));
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
    reset: () => responses.clear(),
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
