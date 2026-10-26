// SPDX-License-Identifier: AGPL-3.0-or-later
// Development-only loopback preview; production is the existing web process.
import { createServer } from "node:http";
import { checkPublication } from "./publication.ts";
import { openWebsite } from "../hosting.ts";
const preview = process.argv.includes('--preview');
if (!preview) await checkPublication();
if (!preview || process.env.NODE_ENV === 'production') throw new Error('Draft preview is local-only; production serving belongs to the existing verification web process');
const fetch = await openWebsite('dist-preview','preview');
const port = Number(process.argv[process.argv.indexOf("--port") + 1] ?? 53115);
createServer((req,res) => {
 void (async () => {
  const response = await fetch(new Request(`http://127.0.0.1:${port}${req.url ?? '/'}`, {method:req.method}));
  res.writeHead(response.status, Object.fromEntries(response.headers));
  res.end(Buffer.from(await response.arrayBuffer()));
 })().catch(() => { res.writeHead(500); res.end(); });
}).listen(port,"127.0.0.1");
