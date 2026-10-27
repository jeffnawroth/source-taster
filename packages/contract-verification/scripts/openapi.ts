// SPDX-License-Identifier: AGPL-3.0-or-later OR MIT
import { writeFile } from "node:fs/promises";
import { OpenAPIHono } from "@hono/zod-openapi";
import {
  createCheck,
  getCheck,
  streamCheckEvents,
  structureReferences,
} from "../src/routes.ts";
const app = new OpenAPIHono();
for (const route of [
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
