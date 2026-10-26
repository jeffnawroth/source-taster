// SPDX-License-Identifier: AGPL-3.0-or-later OR MIT
import { writeFile } from "node:fs/promises";
import { OpenAPIHono } from "@hono/zod-openapi";
import { routes } from "../src/routes.ts";
const app = new OpenAPIHono();
for (const route of routes) app.openAPIRegistry.registerPath(route);
await writeFile(
  new URL("../openapi.json", import.meta.url),
  JSON.stringify(
    app.getOpenAPI31Document({
      openapi: "3.1.0",
      info: { title: "Source Taster service API", version: "1" },
    }),
    null,
    2,
  ) + "\n",
);
