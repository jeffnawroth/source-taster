// SPDX-License-Identifier: AGPL-3.0-or-later OR MIT
// Same lifecycle/authority protocol, with an explicitly versioned result schema.
import { createRoute } from "@hono/zod-openapi";
import * as v1 from "./routes.ts";
import { CheckResponse, CreateCheckRequest } from "./v2.ts";
export const createCheck = createRoute({
  ...v1.createCheck,
  path: "/v2/checks",
  request: {
    body: {
      required: true,
      content: { "application/json": { schema: CreateCheckRequest } },
    },
  },
  responses: {
    ...v1.createCheck.responses,
    201: {
      description:
        "Check created. Article search in OpenAlex, Crossref, Europe PMC and Semantic Scholar, with identifier-only arXiv access, is an explicitly enabled, uncalibrated development profile. Operator-disabled sources are recorded, never reported as failed.",
      content: { "application/json": { schema: CheckResponse } },
    },
  },
});
export const getCheck = createRoute({
  ...v1.getCheck,
  path: "/v2/checks/{checkId}",
  responses: {
    ...v1.getCheck.responses,
    200: {
      ...v1.getCheck.responses[200],
      content: { "application/json": { schema: CheckResponse } },
    },
  },
});
export const cancelCheck = createRoute({
  ...v1.cancelCheck,
  path: "/v2/checks/{checkId}/cancel",
  responses: {
    ...v1.cancelCheck.responses,
    200: {
      ...v1.cancelCheck.responses[200],
      content: { "application/json": { schema: CheckResponse } },
    },
  },
});
export const renewCheckLease = createRoute({
  ...v1.renewCheckLease,
  path: "/v2/checks/{checkId}/lease",
  responses: {
    ...v1.renewCheckLease.responses,
    200: {
      ...v1.renewCheckLease.responses[200],
      content: { "application/json": { schema: CheckResponse } },
    },
  },
});
export const streamCheckEvents = createRoute({
  ...v1.streamCheckEvents,
  path: "/v2/checks/{checkId}/events",
});
