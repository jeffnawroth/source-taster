// SPDX-License-Identifier: AGPL-3.0-or-later OR MIT
import { createRoute } from "@hono/zod-openapi";
import { z } from "zod";
import { ProblemDetails } from "../../contract-common/src/index.ts";
import { DpaLanguage, DpaStateResponse } from "./dpa.ts";
const problem = {description: "Denied, stale or unavailable", content: {"application/problem+json": {schema: ProblemDetails}}};
export const dpaRoutes = (extension: boolean) => {
  const prefix = extension ? "/v1/extension/dpa" : "/v1/dpa";
  return { state: createRoute({
    method: "get", path: `${prefix}/{language}`, summary: "Inspect offered packet and retained agreements without extending session expiry",
    request: {params: z.object({language: DpaLanguage})},
    responses: {200: {description: "DPA state", content: {"application/json": {schema: DpaStateResponse}}}, 400: problem, 401: problem, 403: problem, 503: problem},
  })};
};
export const webDpaRoutes = dpaRoutes(false);
export const extensionDpaRoutes = dpaRoutes(true);
