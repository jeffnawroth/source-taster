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
    title,
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
