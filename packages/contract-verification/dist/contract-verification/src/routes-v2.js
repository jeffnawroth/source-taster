// SPDX-License-Identifier: AGPL-3.0-or-later OR MIT
// Same lifecycle/authority protocol, with an explicitly versioned result schema.
import { LibraryInput, ImportResponse } from "./import.js";
import { z } from "zod";
import { SetManualOverrideRequest, SaveFieldsRequest, RecheckRequest, EditReferenceListRequest, EditSelectionRequest, SelectionPreviewResponse, } from "./v2.js";
import { ProblemDetails, PROBLEM_CONTENT_TYPE } from "./index.js";
import { entranceLimitResponse } from "../../contract-common/src/index.js";
import { createRoute } from "@hono/zod-openapi";
import * as v1 from "./routes.js";
import { CheckResponse, CreateCheckRequest, MaxReferences, QuotaResponse, } from "./v2.js";
const expiredResponse = {
    description: "The Check's fixed content deadline has passed.",
    content: { [PROBLEM_CONTENT_TYPE]: { schema: ProblemDetails } },
};
const insufficientResponse = {
    description: "Not enough Quota for the new work; the problem names the available and required slots so the client can offer the first N or an upgrade.",
    content: { [PROBLEM_CONTENT_TYPE]: { schema: ProblemDetails } },
};
export const createCheck = createRoute({
    ...v1.createCheck,
    path: "/v2/checks",
    request: {
        query: z.object({
            maxReferences: MaxReferences.optional().meta({
                description: "Start only the first N References in input order; the rest end as not-checked. Hosted Quota only.",
            }),
        }),
        body: {
            required: true,
            content: { "application/json": { schema: CreateCheckRequest } },
        },
    },
    responses: {
        ...v1.createCheck.responses,
        402: insufficientResponse,
        201: {
            description: "Check created. Article search in OpenAlex, Crossref, Europe PMC and Semantic Scholar, with identifier-only arXiv access, is an explicitly enabled, uncalibrated development profile. Operator-disabled sources are recorded, never reported as failed.",
            content: { "application/json": { schema: CheckResponse } },
        },
    },
});
export const getQuota = createRoute({
    method: "get",
    path: "/v2/quota",
    summary: "Current Quota of the acting Owner: balance, consumption, grants and warning level",
    responses: {
        200: {
            description: "Current Quota; null when no Quota applies.",
            content: { "application/json": { schema: QuotaResponse } },
        },
        401: v1.createCheck.responses[401],
        403: v1.createCheck.responses[403],
        503: v1.createCheck.responses[503],
    },
});
export const getCheck = createRoute({
    ...v1.getCheck,
    path: "/v2/checks/{checkId}",
    responses: {
        ...v1.getCheck.responses,
        410: expiredResponse,
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
        410: expiredResponse,
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
        410: expiredResponse,
        200: {
            ...v1.renewCheckLease.responses[200],
            content: { "application/json": { schema: CheckResponse } },
        },
    },
});
export const streamCheckEvents = createRoute({
    ...v1.streamCheckEvents,
    path: "/v2/checks/{checkId}/events",
    description: "The X-Source-Taster-Replay-Through header gives the snapshot cursor: historical ended events below it do not finish a client replay. Ordered, replayable Check and Reference events. Ended Checks can have active slot-only Re-checks; the stream stays open until all current Reference runs finish. Last-Event-ID and current-authority rules are unchanged. Reference events include immutable revisions/results; removed=true removes that slot from the visible list.",
    responses: {
        ...v1.streamCheckEvents.responses,
        410: expiredResponse,
    },
});
const referenceParams = z.object({
    checkId: z.uuid(),
    slot: z.coerce.number().int().positive(),
});
const mutationResponses = {
    ...getCheck.responses,
    402: insufficientResponse,
    409: {
        description: "Stale revision or active Reference work; refresh before retrying.",
        content: { [PROBLEM_CONTENT_TYPE]: { schema: ProblemDetails } },
    },
    410: {
        description: "The Check expired.",
        content: { [PROBLEM_CONTENT_TYPE]: { schema: ProblemDetails } },
    },
};
export const saveFields = createRoute({
    method: "post",
    path: "/v2/checks/{checkId}/references/{slot}/revisions",
    summary: "Append a user field revision, optionally re-checking only this slot",
    request: {
        params: referenceParams,
        body: {
            required: true,
            content: { "application/json": { schema: SaveFieldsRequest } },
        },
    },
    responses: mutationResponses,
});
export const recheckReference = createRoute({
    method: "post",
    path: "/v2/checks/{checkId}/references/{slot}/recheck",
    summary: "Run only this Reference; already billed slots are free, first Verdicts are new work",
    request: {
        params: referenceParams,
        body: {
            required: true,
            content: { "application/json": { schema: RecheckRequest } },
        },
    },
    responses: mutationResponses,
});
export const editReferenceList = createRoute({
    method: "post",
    path: "/v2/checks/{checkId}/references",
    summary: "Apply a previewed Reference list change while all slots are idle; new slots start as new work",
    request: {
        params: z.object({ checkId: z.uuid() }),
        body: {
            required: true,
            content: { "application/json": { schema: EditReferenceListRequest } },
        },
    },
    responses: mutationResponses,
});
export const setManualOverride = createRoute({
    method: "post",
    path: "/v2/checks/{checkId}/references/{slot}/manual-override",
    summary: "Confirm or choose a manual Verdict for exactly the current immutable result",
    description: "Requires the current field revision, result ID and previous override ID (null for first judgment). Stale, running or unverified fields reject with 409. System evidence and suggestion eligibility stay unchanged.",
    request: {
        params: referenceParams,
        body: {
            required: true,
            content: { "application/json": { schema: SetManualOverrideRequest } },
        },
    },
    responses: mutationResponses,
});
export const importReferences = createRoute({
    method: "post",
    path: "/v2/imports",
    summary: "Import BibTeX or RIS without consuming Quota",
    request: {
        body: {
            required: true,
            content: { "application/json": { schema: LibraryInput } },
        },
    },
    responses: {
        429: entranceLimitResponse,
        200: {
            description: "Recognized References and separately rejected records; unchanged raw input is retained.",
            content: { "application/json": { schema: ImportResponse } },
        },
        400: v1.createCheck.responses[400],
        401: v1.createCheck.responses[401],
        403: v1.createCheck.responses[403],
    },
});
export const editSelection = createRoute({
    method: "post",
    path: "/v2/checks/{checkId}/selection",
    summary: "Apply a previewed Bibliography selection difference, preserving unchanged slots and the fixed deadline",
    request: {
        params: z.object({ checkId: z.uuid() }),
        body: {
            required: true,
            content: { "application/json": { schema: EditSelectionRequest } },
        },
    },
    responses: mutationResponses,
});
export const previewSelection = createRoute({
    ...editSelection,
    path: "/v2/checks/{checkId}/selection/preview",
    summary: "Preview added, cut and dropped References and additional Quota without running work",
    responses: {
        ...mutationResponses,
        200: {
            description: "Selection difference; no work started and no Quota consumed.",
            content: { "application/json": { schema: SelectionPreviewResponse } },
        },
    },
});
