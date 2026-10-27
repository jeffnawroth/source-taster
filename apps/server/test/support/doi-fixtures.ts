// SPDX-License-Identifier: AGPL-3.0-or-later
// External HTTP edge only. Never connects to a live provider during tests.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { once } from "node:events";

export const physicsReference =
  "Aspelmeyer, M. (2009). Measured measurement. Nature Physics, 5, 11–12. https://doi.org/10.1038/nphys1170";
export async function startDoiFixtures() {
  const crossref = await readFile(
    new URL("../fixtures/doi/crossref-nphys1170.json", import.meta.url),
    "utf8",
  );
  const handle = await readFile(
    new URL("../fixtures/doi/handle-nphys1170.json", import.meta.url),
    "utf8",
  );
  const responses = new Map<
    string,
    { status: number; body: unknown; headers?: Record<string, string> }
  >();
  const requests: { path: string; at: number }[] = [];
  const holds = new Map<
    string,
    { entered: () => void; release: Promise<void> }
  >();
  const server = createServer((req, res) => {
    void (async () => {
      requests.push({
        path: decodeURIComponent(req.url ?? ""),
        at: Date.now(),
      });
      const hold = holds.get(decodeURIComponent(req.url ?? ""));
      if (hold) {
        hold.entered();
        await hold.release;
      }
      res.setHeader("content-type", "application/json");
      const override =
        responses.get(decodeURIComponent(req.url ?? "")) ??
        responses.get(new URL(req.url ?? "/", "http://fixture").pathname);
      if (override) {
        res.writeHead(override.status, override.headers);
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
    hold(path: string) {
      let entered!: () => void;
      let release!: () => void;
      const arrived = new Promise<void>((resolve) => {
        entered = resolve;
      });
      const gate = new Promise<void>((resolve) => {
        release = resolve;
      });
      holds.set(path, { entered, release: gate });
      return { arrived, release };
    },
    reset: () => responses.clear(),
    respond: (
      path: string,
      status: number,
      body: unknown,
      headers?: Record<string, string>,
    ) => responses.set(path, { status, body, headers }),
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
