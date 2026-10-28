// SPDX-License-Identifier: AGPL-3.0-or-later OR MIT
import { createRoute } from "@hono/zod-openapi";
import { GuestTokenRequest, GuestTokenResponse, PublicJwks, ProblemDetails, ServiceStatusResponse, } from "./index.js";
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
const problem = {
    description: "Denied or unavailable",
    content: { "application/problem+json": { schema: ProblemDetails } },
};
export const issueGuestToken = createRoute({
    method: "post",
    path: "/v1/guest-tokens",
    summary: "Issue or renew a five-minute Guest access token; no Quota grant",
    request: {
        body: {
            required: true,
            content: { "application/json": { schema: GuestTokenRequest } },
        },
    },
    responses: {
        200: {
            description: "Guest verification access token",
            content: { "application/json": { schema: GuestTokenResponse } },
        },
        400: problem,
        403: problem,
        503: problem,
    },
});
export const getGuestJwks = createRoute({
    method: "get",
    path: "/.well-known/jwks.json",
    summary: "Current public access-token keys",
    responses: {
        200: {
            description: "Ed25519 JWKS",
            content: { "application/json": { schema: PublicJwks } },
        },
        503: problem,
    },
});
export const routes = [getServiceStatus, issueGuestToken, getGuestJwks];
