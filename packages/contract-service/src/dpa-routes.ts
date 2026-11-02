// SPDX-License-Identifier: AGPL-3.0-or-later OR MIT
import { createRoute } from "@hono/zod-openapi";
import { z } from "zod";
import { ProblemDetails } from "../../contract-common/src/index.ts";
import {
  DpaLanguage,
  DpaStateResponse,
  DpaChallengeRequest,
  DpaConcludeRequest,
  DpaOperationResponse,
  DpaAgreement,
  DpaObjectionRequest,
} from "./dpa.ts";
const problem = {
  description: "Denied, stale or unavailable",
  content: { "application/problem+json": { schema: ProblemDetails } },
};
export const dpaRoutes = (extension: boolean) => {
  const security = extension ? { security: [{ ExtensionSession: [] }] } : {};
  const prefix = extension ? "/v1/extension/dpa" : "/v1/dpa";
  const responses = {
    200: {
      description: "Recoverable operation status",
      content: { "application/json": { schema: DpaOperationResponse } },
    },
    400: problem,
    401: problem,
    403: problem,
    404: problem,
    409: problem,
    429: problem,
    503: problem,
  };
  return {
    objection: createRoute({
      ...security,
      method: "post",
      path: `${prefix}/objections`,
      summary:
        "Keep a supplier objection open; never infer consent from silence",
      request: {
        body: {
          required: true,
          content: { "application/json": { schema: DpaObjectionRequest } },
        },
      },
      responses: {
        200: {
          description: "Objection recorded",
          content: {
            "application/json": {
              schema: z.object({
                data: z.object({ recorded: z.literal(true) }),
                quota: z.null(),
              }),
            },
          },
        },
        400: problem,
        401: problem,
        403: problem,
        404: problem,
        409: problem,
        503: problem,
      },
    }),
    challenge: createRoute({
      ...security,
      method: "post",
      path: `${prefix}/challenges`,
      summary:
        "Freeze packet and party revision; email fresh session/action-bound proof",
      request: {
        body: {
          required: true,
          content: { "application/json": { schema: DpaChallengeRequest } },
        },
      },
      responses,
    }),
    conclude: createRoute({
      ...security,
      method: "post",
      path: `${prefix}/conclude`,
      summary:
        "Atomically conclude once per operation ID with proof no older than five minutes",
      request: {
        body: {
          required: true,
          content: { "application/json": { schema: DpaConcludeRequest } },
        },
      },
      responses,
    }),
    operation: createRoute({
      ...security,
      method: "get",
      path: `${prefix}/operations/{id}`,
      summary: "Recover authoritative completion after timeout or restart",
      request: { params: z.object({ id: z.uuid() }) },
      responses,
    }),
    download: createRoute({
      ...security,
      method: "get",
      path: `${prefix}/agreements/{id}/download`,
      summary:
        "Download the exact immutable concluded JSON packet and acceptance representation",
      request: { params: z.object({ id: z.uuid() }) },
      responses: {
        200: {
          description: "Exact retained download; attachment",
          content: { "application/json": { schema: DpaAgreement } },
        },
        400: problem,
        401: problem,
        403: problem,
        404: problem,
        503: problem,
      },
    }),
    state: createRoute({
      ...security,
      method: "get",
      path: `${prefix}/{language}`,
      summary:
        "Inspect offered packet and retained agreements without extending session expiry",
      request: { params: z.object({ language: DpaLanguage }) },
      responses: {
        200: {
          description: "DPA state",
          content: { "application/json": { schema: DpaStateResponse } },
        },
        400: problem,
        401: problem,
        403: problem,
        503: problem,
      },
    }),
  };
};
export const webDpaRoutes = dpaRoutes(false);
export const extensionDpaRoutes = dpaRoutes(true);
