// SPDX-License-Identifier: AGPL-3.0-or-later OR MIT
// OpenAPI route definitions of the verification API. Kept in their own subpath
// so browser clients can import the schemas without pulling in Hono.
import { createRoute } from "@hono/zod-openapi";
import { z } from "zod";
import { CheckId, CheckResponse, CreateCheckRequest, PROBLEM_CONTENT_TYPE, ProblemDetails, } from "./index.js";
const problem = (description) => ({
    description,
    content: { [PROBLEM_CONTENT_TYPE]: { schema: ProblemDetails } },
});
export const createCheck = createRoute({
    method: "post",
    path: "/v1/checks",
    summary: "Paste References and start a Check",
    request: {
        body: {
            required: true,
            content: { "application/json": { schema: CreateCheckRequest } },
        },
    },
    responses: {
        201: {
            description: "Check created; one Reference slot per pasted Reference.",
            content: { "application/json": { schema: CheckResponse } },
        },
        400: problem("The input is empty or malformed."),
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
        "Send `Last-Event-ID` to receive only events after that sequence. " +
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
