// SPDX-License-Identifier: AGPL-3.0-or-later OR MIT
import { createRoute } from "@hono/zod-openapi";
import { z } from "zod";
import { CheckId, ProblemDetails, PROBLEM_CONTENT_TYPE } from "./index.ts";
import { BibliographyRequest, BibliographyResponse } from "./bibliography.ts";
const problem = (description: string) => ({
  description,
  content: { [PROBLEM_CONTENT_TYPE]: { schema: ProblemDetails } },
});
export const renderBibliography = createRoute({
  method: "post",
  path: "/v2/checks/{checkId}/bibliography",
  summary:
    "Render Correction suggestions and a formatted bibliography from an authorized snapshot",
  description:
    "Read-only rendering. applySlots selects eligible suggestions for this export only. No fields, evidence, results or Quota are changed. Style locales are pinned independently of interface language. suggestionSlots limits the suggestion preview; includeBibliography=false omits the full document.",
  request: {
    params: z.object({ checkId: CheckId }),
    body: {
      required: true,
      content: { "application/json": { schema: BibliographyRequest } },
    },
  },
  responses: {
    200: {
      description:
        "Requested suggestions and, by default, a complete RTF document rendered locally on the server.",
      content: { "application/json": { schema: BibliographyResponse } },
    },
    400: problem("Invalid style or slot selection."),
    401: problem("A valid verification access token is required."),
    403: problem("Current authority denies Check reading."),
    404: problem("No such Check for this Owner."),
    410: problem("The Check expired."),
    503: problem(
      "Current authority or bounded formatting capacity is unavailable.",
    ),
  },
});
