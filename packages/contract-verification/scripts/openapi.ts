// SPDX-License-Identifier: AGPL-3.0-or-later OR MIT
import { writeFile } from "node:fs/promises";
import { OpenAPIHono } from "@hono/zod-openapi";
import {
  cancelCheck,
  renewCheckLease,
  createCheck,
  getCheck,
  streamCheckEvents,
  structureReferences,
} from "../src/routes.ts";
const app = new OpenAPIHono();
for (const route of [
  cancelCheck,
  renewCheckLease,
  createCheck,
  getCheck,
  streamCheckEvents,
  structureReferences,
])
  app.openAPIRegistry.registerPath(route);
const document = app.getOpenAPI31Document({
  openapi: "3.1.0",
  info: { title: "Source Taster verification API", version: "1" },
});
await writeFile(
  new URL("../openapi.json", import.meta.url),
  JSON.stringify(document, null, 2) + "\n",
);

const v2 = await import("../src/routes-v2.ts");
const next = new OpenAPIHono();
const { exportReferences } = await import("../src/export-routes.ts");
const { renderBibliography } = await import("../src/bibliography-routes.ts");
for (const route of [
  renderBibliography,
  exportReferences,
  v2.importReferences,
  v2.cancelCheck,
  v2.renewCheckLease,
  v2.createCheck,
  v2.getCheck,
  v2.streamCheckEvents,
])
  next.openAPIRegistry.registerPath(route);
await writeFile(
  new URL("../openapi-v2.json", import.meta.url),
  JSON.stringify(
    next.getOpenAPI31Document({
      openapi: "3.1.0",
      info: { title: "Source Taster verification API", version: "2" },
    }),
    null,
    2,
  ) + "\n",
);
