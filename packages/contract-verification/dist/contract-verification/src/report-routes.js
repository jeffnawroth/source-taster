// SPDX-License-Identifier: AGPL-3.0-or-later OR MIT
import { entranceLimitResponse } from "../../contract-common/src/index.js";
import { createRoute } from "@hono/zod-openapi";
import { z } from "zod";
import { CheckId, ProblemDetails, PROBLEM_CONTENT_TYPE } from "./index.js";
import { ReportId, ReportRequest, ReportResponse } from "./report.js";
const problem = (description) => ({
    description,
    content: { [PROBLEM_CONTENT_TYPE]: { schema: ProblemDetails } },
});
const params = z.object({ checkId: CheckId, reportId: ReportId });
const errors = {
    401: problem("A valid verification access token is required."),
    403: problem("Current authority denies reading the Check, or the Owner's Quota scope does not include verification reports."),
    404: problem("No such Check or report for this Owner."),
    410: problem("The Check or the temporary report file expired."),
    503: problem("Current authority is unavailable."),
};
export const createReport = createRoute({
    method: "post",
    path: "/v2/checks/{checkId}/reports",
    summary: "Create an accessible PDF Verification report",
    description: "A separate job: it consumes no Quota and does not affect the Check. The Check's content is frozen when generation begins. The finished file is temporary (at most 15 minutes, never beyond the Check's deletion deadline) and is not shared.",
    request: {
        params: z.object({ checkId: CheckId }),
        body: {
            required: true,
            content: { "application/json": { schema: ReportRequest } },
        },
    },
    responses: {
        429: entranceLimitResponse,
        202: {
            description: "The report job was accepted.",
            content: { "application/json": { schema: ReportResponse } },
        },
        400: problem("Invalid request."),
        409: problem("Another report job of this Owner is still running."),
        ...errors,
    },
});
export const getReport = createRoute({
    method: "get",
    path: "/v2/checks/{checkId}/reports/{reportId}",
    summary: "Read the status of a report job",
    request: { params },
    responses: {
        429: entranceLimitResponse,
        200: {
            description: "The current job status.",
            content: { "application/json": { schema: ReportResponse } },
        },
        ...errors,
    },
});
export const downloadReport = createRoute({
    method: "get",
    path: "/v2/checks/{checkId}/reports/{reportId}/file",
    summary: "Download the finished PDF report",
    description: "Owner-authorized no-store attachment. Authority, the Quota scope and the Check's liveness are rechecked on every download.",
    request: { params },
    responses: {
        429: entranceLimitResponse,
        200: {
            description: "The accessible tagged PDF.",
            content: {
                "application/pdf": { schema: z.string().meta({ format: "binary" }) },
            },
        },
        409: problem("The report is not finished or failed."),
        ...errors,
    },
});
export const cancelReport = createRoute({
    method: "delete",
    path: "/v2/checks/{checkId}/reports/{reportId}",
    summary: "Cancel a report job or discard its finished file",
    description: "Never affects the Check or its Quota.",
    request: { params },
    responses: {
        429: entranceLimitResponse,
        200: {
            description: "The job is cancelled and any file is gone.",
            content: { "application/json": { schema: ReportResponse } },
        },
        ...errors,
    },
});
