// SPDX-License-Identifier: AGPL-3.0-or-later
// Development-only loopback preview; production is the existing web process.
import { createServer } from "node:http";
import { checkPublication } from "./publication.ts";
import { openWebsite } from "../hosting.ts";
import { assertPreviewAllowed } from "../src/metadata.ts";
const preview = process.argv.includes("--preview");
if (!preview) await checkPublication();
assertPreviewAllowed(preview ? "preview" : "publication");
if (!preview)
  throw new Error(
    "Draft preview is local-only; production serving belongs to the existing verification web process",
  );
const serveWebsite = await openWebsite("dist-preview", "preview");
const port = Number(process.argv[process.argv.indexOf("--port") + 1] ?? 53115);
createServer((req, res) => {
  void (async () => {
    const response = await serveWebsite(
      new Request(`http://127.0.0.1:${port}${req.url ?? "/"}`, {
        method: req.method,
        headers: Object.entries(req.headers).flatMap<[string, string]>(
          ([name, value]) =>
            value === undefined
              ? []
              : [[name, Array.isArray(value) ? value.join(", ") : value]],
        ),
      }),
    );
    res.writeHead(response.status, Object.fromEntries(response.headers));
    res.end(Buffer.from(await response.arrayBuffer()));
  })().catch(() => {
    res.writeHead(500);
    res.end();
  });
}).listen(port, "127.0.0.1");
