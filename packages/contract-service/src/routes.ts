// SPDX-License-Identifier: AGPL-3.0-or-later OR MIT
import { createRoute } from "@hono/zod-openapi";
import { ServiceStatusResponse } from "./index.ts";
export const getServiceStatus = createRoute({
  method: "get",
  path: "/v1/status",
  summary: "Read infrastructure readiness; authentication is not implemented",
  responses: {
    200: {
      description: "Ready; no authorization or Quota is granted",
      content: { "application/json": { schema: ServiceStatusResponse } },
    },
  },
});
export const routes = [getServiceStatus];
