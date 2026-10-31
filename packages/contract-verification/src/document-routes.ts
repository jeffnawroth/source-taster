import { TextStructuringRequest, TextStructuringResponse } from "./document.ts";
// SPDX-License-Identifier: AGPL-3.0-or-later OR MIT
import { createRoute } from "@hono/zod-openapi";
import { ProblemDetails, PROBLEM_CONTENT_TYPE } from "./index.ts";
import {
  DocumentSettingsResponse,
  DocumentStructuringRequest,
  DocumentStructuringResponse,
} from "./document.ts";
const problem = (description: string) => ({
  description,
  content: { [PROBLEM_CONTENT_TYPE]: { schema: ProblemDetails } },
});
export const structureDocument = createRoute({
  method: "post",
  path: "/v2/document-structurings",
  summary: "Extract the text of a PDF or DOCX and structure it with the parser",
  description:
    "The file is read in an isolated, restricted extraction area and is not stored. Only the detected Bibliography selection is structured. No detection leaves an empty selection for manual marking. Structuring never reserves or consumes Quota.",
  request: {
    body: {
      required: true,
      content: {
        "multipart/form-data": { schema: DocumentStructuringRequest },
      },
    },
  },
  responses: {
    200: {
      description: "Extracted text and its parser Structuring",
      content: { "application/json": { schema: DocumentStructuringResponse } },
    },
    400: problem(
      "Invalid upload, or the Reference limit was exceeded after Structuring.",
    ),
    401: problem("A valid verification access token is required."),
    403: problem("Current authority denies Structuring."),
    413: problem(
      "The file exceeds the configured limit (initially 20 MB; limit in bytes).",
    ),
    415: problem("The file is neither a PDF nor a DOCX document."),
    422: problem(
      "No extractable text, an encrypted or broken file, or an exceeded page, expansion or time ceiling.",
    ),
    503: problem("Document extraction or current authority is unavailable."),
  },
});

export const getDocumentSettings = createRoute({
  method: "get",
  path: "/v2/document-settings",
  summary: "Read the current document upload limit",
  responses: {
    200: {
      description: "Operator-configured document input limit in bytes",
      content: { "application/json": { schema: DocumentSettingsResponse } },
    },
    401: problem("A valid verification access token is required."),
    403: problem("Current authority denies Structuring."),
    503: problem("Current authority is unavailable."),
  },
});

export const structureText = createRoute({
  method: "post",
  path: "/v2/structurings",
  summary: "Detect a pasted document or structure a list; explicit regions structure only selected text",
  request: {body:{required:true,content:{"application/json":{schema:TextStructuringRequest}}}},
  responses: {
    200: {description:"Selected document text or list; over-limit documents retain movable regions without truncated References.",content:{"application/json":{schema:TextStructuringResponse}}},
    400: problem("Invalid selection or Reference limit."),
    401: problem("Authentication required."),
    403: problem("Current authority denied."),
  },
});
