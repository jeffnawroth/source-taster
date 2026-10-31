// SPDX-License-Identifier: AGPL-3.0-or-later OR MIT
import { createRoute } from "@hono/zod-openapi";
import { z } from "zod";
import { CheckId, ProblemDetails, PROBLEM_CONTENT_TYPE } from "./index.js";
import { ExportRequest } from "./export.js";
const problem = (description) => ({
    description,
    content: { [PROBLEM_CONTENT_TYPE]: { schema: ProblemDetails } },
});
export const exportReferences = createRoute({
    method: "post",
    path: "/v2/checks/{checkId}/export",
    summary: "Download current References as CSL-JSON or traditional BibTeX",
    description: "Owner-authorized, no-store download. Original mode uses current committed fields; selected corrections replace fields for this export only. No evidence or Quota is changed. RIS is not available at launch.",
    request: {
        params: z.object({ checkId: CheckId }),
        body: {
            required: true,
            content: { "application/json": { schema: ExportRequest } },
        },
    },
    responses: {
        200: {
            description: "UTF-8 attachment. CSL-JSON retains immutable original input in custom.originalText.",
            content: {
                "application/vnd.citationstyles.csl+json": {
                    schema: z.array(z.record(z.string(), z.unknown())),
                },
                "application/x-bibtex": { schema: z.string() },
            },
        },
        400: problem("Invalid format or correction selection."),
        401: problem("A valid verification access token is required."),
        403: problem("Current authority denies Check reading."),
        404: problem("No such Check for this Owner."),
        410: problem("The Check expired."),
        503: problem("Current authority is unavailable."),
    },
});
