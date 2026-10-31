// SPDX-License-Identifier: AGPL-3.0-or-later
// RFC 9457 problem responses. `code` is stable for clients; `i18nKey` names the
// catalog message (packages/i18n) that clients show.

import {
  PROBLEM_CONTENT_TYPE,
  type ProblemDetails,
} from "@source-taster/contract-common";
import { HTTPException } from "hono/http-exception";
import type { ContentfulStatusCode } from "hono/utils/http-status";

const problems = {
  "abuse-limit": {
    status: 429,
    title: "Too many requests.",
    i18nKey: "problem_abuse_limit",
  },
  "abuse-unavailable": {
    status: 503,
    title: "Request policy is unavailable.",
    i18nKey: "problem_abuse_unavailable",
  },
  "library-size": {
    status: 400,
    title: "The library file exceeds 20 MB.",
    i18nKey: "problem_library_size",
  },
  "reference-limit": {
    status: 400,
    title: "The Reference limit was exceeded.",
    i18nKey: "problem_reference_limit",
  },
  "input-empty": {
    status: 400,
    title: "The input is empty.",
    i18nKey: "problem_input_empty",
  },
  "invalid-request": {
    status: 400,
    title: "The request is invalid.",
    i18nKey: "problem_invalid_request",
  },
  "check-not-found": {
    status: 404,
    title: "The Check does not exist.",
    i18nKey: "problem_check_not_found",
  },
  forbidden: {
    status: 403,
    title: "Not permitted.",
    i18nKey: "problem_forbidden",
  },
  unauthenticated: {
    status: 401,
    title: "Sign-in required.",
    i18nKey: "problem_unauthenticated",
  },
  "authority-unavailable": {
    status: 503,
    title: "Current authority is unavailable.",
    i18nKey: "problem_authority_unavailable",
  },
  "formatting-unavailable": {
    status: 503,
    title: "Formatting is temporarily unavailable.",
    i18nKey: "correction_unavailable",
  },
  "document-size-limit": {
    status: 413,
    title: "The document exceeds the 20 MB limit.",
    i18nKey: "problem_document_size_limit",
  },
  "document-unsupported": {
    status: 415,
    title: "Upload a PDF or DOCX document.",
    i18nKey: "problem_document_unsupported",
  },
  "document-no-text": {
    status: 422,
    title: "The document contains no extractable text.",
    i18nKey: "problem_document_no_text",
  },
  "document-encrypted": {
    status: 422,
    title: "The document is encrypted.",
    i18nKey: "problem_document_encrypted",
  },
  "document-unreadable": {
    status: 422,
    title: "The document could not be read.",
    i18nKey: "problem_document_unreadable",
  },
  "document-page-limit": {
    status: 422,
    title: "The PDF page limit was exceeded.",
    i18nKey: "problem_document_page_limit",
  },
  "document-expansion-limit": {
    status: 422,
    title: "The expanded DOCX size limit was exceeded.",
    i18nKey: "problem_document_expansion_limit",
  },
  "document-time-limit": {
    status: 422,
    title: "Document extraction exceeded its time limit.",
    i18nKey: "problem_document_time_limit",
  },
  "document-resource-limit": {
    status: 422,
    title: "Document extraction exceeded its resource limit.",
    i18nKey: "problem_document_resource_limit",
  },
  "document-aborted": {
    status: 422,
    title: "Document extraction was stopped.",
    i18nKey: "problem_document_aborted",
  },
  "document-unavailable": {
    status: 503,
    title: "The restricted extraction area is unavailable.",
    i18nKey: "problem_document_unavailable",
  },
  "reference-conflict": {
    status: 409,
    title: "The Reference changed or is running.",
    i18nKey: "problem_reference_conflict",
  },
  "check-expired": {
    status: 410,
    title: "The Check expired.",
    i18nKey: "problem_check_expired",
  },
  internal: {
    status: 500,
    title: "Something went wrong on our side.",
    i18nKey: "problem_internal",
  },
} as const satisfies Record<
  string,
  { status: number; title: string; i18nKey: string }
>;

export type ProblemCode = keyof typeof problems;

export function problemResponse(
  code: ProblemCode,
  detail?: string,
  limit?: number,
): Response {
  const { status, title, i18nKey } = problems[code];
  const body: ProblemDetails = {
    type: `urn:source-taster:problem:${code}`,
    title:
      code === "document-size-limit" && limit !== undefined
        ? `The document exceeds the ${Number((limit / 1_048_576).toPrecision(3))} MB limit.`
        : title,
    status,
    code,
    i18nKey,
    ...(detail ? { detail } : {}),
    ...(limit === undefined ? {} : { limit }),
  };
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": PROBLEM_CONTENT_TYPE },
  });
}

/** Aborts the request with a problem response (rendered by the app's onError). */
export function fail(
  code: ProblemCode,
  detail?: string,
  limit?: number,
): never {
  const res = problemResponse(code, detail, limit);
  throw new HTTPException(res.status as ContentfulStatusCode, { res });
}
