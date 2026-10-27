// SPDX-License-Identifier: AGPL-3.0-or-later OR MIT
// OpenAPI route definitions of the verification API. Kept in their own subpath
// so browser clients can import the schemas without pulling in Hono.
import { createRoute } from "@hono/zod-openapi";
import { z } from "zod";
import { StructureRequest, StructuringResponse, CheckId, CheckResponse, CreateCheckRequest, PROBLEM_CONTENT_TYPE, ProblemDetails, } from "./index.js";
const problem = (description) => ({
    description,
    content: { [PROBLEM_CONTENT_TYPE]: { schema: ProblemDetails } },
});
export const createCheck = createRoute({
    method: "post",
    path: "/v1/checks",
    summary: "Start a Check from pasted or explicitly structured References",
    request: {
        body: {
            required: true,
            content: { "application/json": { schema: CreateCheckRequest } },
        },
    },
    responses: {
        201: {
            description: "Check created; one stable slot per recognized Reference. Explicit fields have user provenance. DOI verification is an opt-in uncalibrated local development preview.",
            content: { "application/json": { schema: CheckResponse } },
        },
        400: problem("The input is empty, malformed, or exceeds the configured Reference limit."),
    },
});
const CheckParams = z.object({ checkId: CheckId });
export const getCheck = createRoute({
    method: "get",
    path: "/v1/checks/{checkId}",
    summary: "Read the current snapshot of a Check",
    request: { params: CheckParams },
    responses: {
        200: {
            description: "Current snapshot, including the newest event sequence.",
            content: { "application/json": { schema: CheckResponse } },
        },
        400: problem("The Check id is malformed."),
        404: problem("No such Check for this Owner."),
    },
});
export const streamCheckEvents = createRoute({
    method: "get",
    path: "/v1/checks/{checkId}/events",
    summary: "Stream Check events (Server-Sent Events)",
    description: "Every event carries its sequence number as SSE `id` and a CheckEvent as JSON `data`. " +
        "Send the Check-bound `Last-Event-ID` cursor to receive only later events. " +
        "The stream closes after the event that ends the Check.",
    request: {
        params: CheckParams,
        headers: z.object({ "last-event-id": z.string().optional() }),
    },
    responses: {
        200: {
            description: "text/event-stream of CheckEvent",
            content: { "text/event-stream": { schema: z.string() } },
        },
        400: problem("The Check id or Last-Event-ID is malformed."),
        404: problem("No such Check for this Owner."),
    },
});
/** Stateless Structuring preview, independent of placeholder Checks. */
export const structureReferences = createRoute({
    method: "post",
    path: "/v1/structurings",
    summary: "Structure pasted References without starting a Check or consuming Quota",
    request: {
        body: {
            required: true,
            content: { "application/json": { schema: StructureRequest } },
        },
    },
    responses: {
        200: {
            description: "Recognized References, field provenance and rejected text.",
            content: { "application/json": { schema: StructuringResponse } },
        },
        400: problem("The input is empty, malformed, or exceeds the Reference limit."),
        401: problem("Sign-in required."),
        403: problem("Not permitted."),
    },
});
export const cancelCheck = createRoute({
    method: "post",
    path: "/v1/checks/{checkId}/cancel",
    summary: "Idempotently cancel a whole Check, retaining finished Verdicts",
    request: { params: CheckParams },
    responses: {
        200: {
            description: "Authoritative snapshot after cancellation",
            content: { "application/json": { schema: CheckResponse } },
        },
        400: problem("Invalid Check id"),
        401: problem("Sign-in required"),
        403: problem("Not permitted"),
        404: problem("No such Check for this Owner"),
    },
});
export const renewCheckLease = createRoute({
    method: "post",
    path: "/v1/checks/{checkId}/lease",
    summary: "Renew the whole Check client lease; never revive ended work",
    request: { params: CheckParams },
    responses: {
        200: {
            description: "Authoritative snapshot; an expired lease ends the Check",
            content: { "application/json": { schema: CheckResponse } },
        },
        400: problem("Invalid Check id"),
        401: problem("Sign-in required"),
        403: problem("Not permitted"),
        404: problem("No such Check for this Owner"),
    },
});
