// SPDX-License-Identifier: AGPL-3.0-or-later OR MIT
// Same lifecycle/authority protocol, with an explicitly versioned result schema.
import { LibraryInput, ImportResponse } from "./import.js";
import { createRoute } from "@hono/zod-openapi";
import * as v1 from "./routes.js";
import { CheckResponse, CreateCheckRequest } from "./v2.js";
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
            description: "Check created. Article search in OpenAlex, Crossref, Europe PMC and Semantic Scholar, with identifier-only arXiv access, is an explicitly enabled, uncalibrated development profile. Operator-disabled sources are recorded, never reported as failed.",
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
export const importReferences = createRoute({
    method: "post", path: "/v2/imports", summary: "Import BibTeX or RIS without consuming Quota",
    request: { body: { required: true, content: { "application/json": { schema: LibraryInput } } } },
    responses: { 200: { description: "Recognized References and separately rejected records; unchanged raw input is retained.", content: { "application/json": { schema: ImportResponse } } }, 400: v1.createCheck.responses[400], 401: v1.createCheck.responses[401], 403: v1.createCheck.responses[403] },
});
