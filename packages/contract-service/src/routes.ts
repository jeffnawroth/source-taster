// SPDX-License-Identifier: AGPL-3.0-or-later OR MIT
import { createRoute } from "@hono/zod-openapi";
import {
  SignInChallengeRequest,
  SignInChallengeResponse,
  SignInConfirmRequest,
  AccountSessionResponse,
  AccountTokenResponse,
  SignOutRequest,
  SignOutResponse,
  GuestTokenRequest,
  GuestTokenResponse,
  PublicJwks,
  ProblemDetails,
  ServiceStatusResponse,
} from "./index.ts";
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
function post(
  path: string,
  summary: string,
  input:
    | typeof SignInChallengeRequest
    | typeof SignInConfirmRequest
    | typeof SignOutRequest,
  output:
    | typeof SignInChallengeResponse
    | typeof AccountSessionResponse
    | typeof SignOutResponse,
) {
  return createRoute({
    method: "post",
    path,
    summary,
    request: {
      body: {
        required: true,
        content: { "application/json": { schema: input } },
      },
    },
    responses: {
      200: {
        description: "Success",
        content: { "application/json": { schema: output } },
      },
      400: problem,
      401: problem,
      403: problem,
      429: problem,
      503: problem,
    },
  });
}
export const requestSignIn = post(
  "/v1/sign-in/challenges",
  "Request a transaction-bound email code",
  SignInChallengeRequest,
  SignInChallengeResponse,
);
export const confirmSignIn = post(
  "/v1/sign-in/confirm",
  "Confirm email and create a host-scoped web session",
  SignInConfirmRequest,
  AccountSessionResponse,
);
export const signOut = post(
  "/v1/sign-out",
  "Revoke this session or every Account session",
  SignOutRequest,
  SignOutResponse,
);
export const getAccountSession = createRoute({
  method: "get",
  path: "/v1/session",
  summary: "Read the current web session (does not extend idle expiry)",
  responses: {
    200: {
      description: "Current Account",
      content: { "application/json": { schema: AccountSessionResponse } },
    },
    401: problem,
    503: problem,
  },
});
export const recordSessionActivity = createRoute({
  method: "post",
  path: "/v1/session/activity",
  summary:
    "Record foreground user activity; background token renewal does not extend idle expiry",
  responses: {
    200: {
      description: "Current Account",
      content: { "application/json": { schema: AccountSessionResponse } },
    },
    401: problem,
    403: problem,
    503: problem,
  },
});
export const issueAccountToken = createRoute({
  method: "post",
  path: "/v1/account-tokens",
  summary:
    "Issue a five-minute Account access token from a current web session",
  responses: {
    200: {
      description: "Verification token",
      content: { "application/json": { schema: AccountTokenResponse } },
    },
    401: problem,
    403: problem,
    503: problem,
  },
});
export const routes = [
  getServiceStatus,
  issueGuestToken,
  getGuestJwks,
  requestSignIn,
  confirmSignIn,
  getAccountSession,
  issueAccountToken,
  recordSessionActivity,
  signOut,
];
