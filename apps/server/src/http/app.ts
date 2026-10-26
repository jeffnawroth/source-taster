// SPDX-License-Identifier: AGPL-3.0-or-later
// HTTP surface of the web process: the published /v1 contract.

import { OpenAPIHono } from "@hono/zod-openapi";
import { createCheck } from "@source-taster/contract-verification/routes";
import { HTTPException } from "hono/http-exception";
import { splitReferences } from "../checks/structuring.ts";
import type { CheckStore } from "../checks/store.ts";
import type { Entitlements, Permission, Principal } from "../entitlements.ts";
import { fail, problemResponse } from "./problems.ts";

export interface AppDeps {
  entitlements: Entitlements;
  checks: CheckStore;
}

export function createApp({ entitlements, checks }: AppDeps) {
  async function authorize(
    request: Request,
    permission: Permission,
  ): Promise<Principal> {
    const principal = await entitlements.resolve(request);
    if (!principal) fail("unauthenticated");
    if (!principal.can(permission)) fail("forbidden");
    return principal;
  }

  const app = new OpenAPIHono({
    defaultHook: (result) => {
      if (result.success) return;
      const emptyText = result.error.issues.some(
        (issue) => issue.path[0] === "text" && issue.code === "too_small",
      );
      return problemResponse(emptyText ? "input-empty" : "invalid-request");
    },
  });

  app.onError((error) => {
    if (error instanceof HTTPException) return error.getResponse();
    console.error(error);
    return problemResponse("internal");
  });

  app.get("/health", (c) => c.json({ status: "ok" }));

  app.openapi(createCheck, async (c) => {
    const principal = await authorize(c.req.raw, "check:create");
    const { text } = c.req.valid("json");
    const check = await checks.create(principal, splitReferences(text));
    return c.json({ data: check, quota: principal.quota }, 201);
  });

  app.doc31("/v1/openapi.json", {
    openapi: "3.1.0",
    info: { title: "Source Taster verification API", version: "1" },
  });

  return app;
}
