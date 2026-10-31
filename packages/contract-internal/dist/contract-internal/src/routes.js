// SPDX-License-Identifier: AGPL-3.0-or-later OR MIT
import { createRoute } from "@hono/zod-openapi";
import { z } from "zod";
import { AbusePolicy, AbuseEntrance, AbuseDecision, AccountAuthorityRequest, AuthorityRequest, AuthorityResponse, AuthorityInvalidation, AuthorityInvalidationAck, MailRehearsalRequest, MailRehearsalResponse, MailRehearsalParams, ProblemDetails, } from "./index.js";
const problem = {
    description: "Problem Details; the local diagnostic is unavailable by default",
    content: { "application/problem+json": { schema: ProblemDetails } },
};
export const createMailRehearsal = createRoute({
    method: "post",
    path: "/internal/mail-rehearsals",
    summary: "Local SMTP rehearsal; fixed sink only, never an Account sign-in",
    request: {
        headers: z.object({ "idempotency-key": z.string().min(1).max(128) }),
        body: {
            required: true,
            content: { "application/json": { schema: MailRehearsalRequest } },
        },
    },
    responses: {
        201: {
            description: "Durable local rehearsal receipt",
            content: { "application/json": { schema: MailRehearsalResponse } },
        },
        400: problem,
        404: problem,
        409: problem,
    },
});
export const getMailRehearsal = createRoute({
    method: "get",
    path: "/internal/mail-rehearsals/{id}",
    summary: "Read local rehearsal delivery status",
    request: { params: MailRehearsalParams },
    responses: {
        200: {
            description: "Local rehearsal status",
            content: { "application/json": { schema: MailRehearsalResponse } },
        },
        400: problem,
        404: problem,
    },
});
export const authorizeGuest = createRoute({
    method: "post",
    path: "/internal/guest-authority",
    summary: "Check current Guest binding and named permission (signed verification assertion)",
    request: {
        body: {
            required: true,
            content: { "application/json": { schema: AuthorityRequest } },
        },
    },
    responses: {
        200: {
            description: "Current authority, never a cacheable allowance",
            content: { "application/json": { schema: AuthorityResponse } },
        },
        400: problem,
        401: problem,
        503: problem,
    },
});
export const invalidateGuest = createRoute({
    method: "post",
    path: "/internal/guest-authority/invalidate",
    summary: "Install/drain a versioned Owner fence (signed service assertion)",
    request: {
        body: {
            required: true,
            content: { "application/json": { schema: AuthorityInvalidation } },
        },
    },
    responses: {
        200: {
            description: "Durable drained fence acknowledgement",
            content: { "application/json": { schema: AuthorityInvalidationAck } },
        },
        400: problem,
        401: problem,
        503: problem,
    },
});
export const authorizeAccount = createRoute({
    method: "post",
    path: "/internal/account-authority",
    summary: "Check current Account/Owner authority and current session for requests",
    request: {
        body: {
            required: true,
            content: { "application/json": { schema: AccountAuthorityRequest } },
        },
    },
    responses: {
        200: {
            description: "Current authority",
            content: { "application/json": { schema: AuthorityResponse } },
        },
        400: problem,
        401: problem,
        503: problem,
    },
});
export const getAbusePolicy = createRoute({
    method: "post", path: "/internal/abuse/policy",
    summary: "Operator-maintained entrance budgets; signed abuse-entrance assertion, briefly cached settings only",
    request: { body: { required: true, content: { "application/json": { schema: z.strictObject({}) } } } },
    responses: { 200: { description: "Current public and combined-service budgets", content: { "application/json": { schema: AbusePolicy } } }, 401: problem, 503: problem },
});
export const countAbuseEntrance = createRoute({
    method: "post", path: "/internal/abuse/entrances",
    summary: "Atomically count combined budgets across both programs; current Plan, no cached allowance",
    description: "Service owns one PostgreSQL transaction for all shared dimensions and both entrances, deduplicated by requestId. It validates current binding and ingress hash/window/key context. Only IDs/counts and minimized hashes cross; no IPs/content/credentials. Stale policy, unknown binding or outage fails closed. Private bootstrap/cancellation remain Account-existence neutral. Every attempt counts, including a denial; maximum retryAt across exceeded budgets. Idempotency expires within 24h.",
    request: { body: { required: true, content: { "application/json": { schema: AbuseEntrance } } } },
    responses: { 200: { description: "One non-cacheable combined decision and current Plan", content: { "application/json": { schema: AbuseDecision } } }, 400: problem, 401: problem, 503: problem },
});
export const routes = [
    getAbusePolicy,
    countAbuseEntrance,
    authorizeAccount,
    createMailRehearsal,
    getMailRehearsal,
    authorizeGuest,
    invalidateGuest,
];
