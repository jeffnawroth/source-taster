// SPDX-License-Identifier: AGPL-3.0-or-later OR MIT
import { createRoute } from "@hono/zod-openapi";
import { z } from "zod";
import { ProblemDetails } from "./index.ts";
const problem = {
  description: "Current recipient authority, expiry or snapshot failure",
  content: { "application/problem+json": { schema: ProblemDetails } },
};
/** Recipient access only. This route does not initiate requests or expose an
 * Operator preview. Retained fields are exported without a lossy citation schema. */
export const downloadDataSubject = createRoute({
  method: "get",
  path: "/v1/data-subject/{id}/download",
  summary:
    "Download this program's retained Account data directly as the verified recipient",
  request: {
    params: z.object({ id: z.uuid() }),
    query: z.object({
      parts: z.literal("1").optional(),
      cursor: z.string().max(2048).optional(),
      restart: z.uuid().optional(),
    }),
    headers: z.object({
      authorization: z.string().regex(/^Bearer [A-Za-z0-9_-]{43}$/),
    }),
  },
  responses: {
    200: {
      description:
        "Machine-readable verification part; no-store, fixed attachment name, bounded by original retention",
      headers: {
        "Cache-Control": { schema: { type: "string", const: "no-store" } },
        "Content-Disposition": { schema: { type: "string" } },
      },
      content: {
        "application/x-ndjson": {
          schema: z
            .string()
            .describe(
              "Ordered bounded base64 part frames followed by a complete manifest with part/byte counts, per-part and whole SHA-256, chain, recipient completion token and signed resume cursor. Concatenate decoded part bytes in sequence to recover the complete JSON document. No final manifest means interrupted delivery.",
            ),
        },
        "application/json": {
          schema: z
            .object({
              format: z.literal("source-taster-verification-data-subject-v1"),
              accountId: z.uuid(),
              ownerId: z.uuid(),
              generatedAt: z.iso.datetime(),
              checks: z.array(z.record(z.string(), z.unknown())),
              reports: z.array(z.record(z.string(), z.unknown())),
            })
            .passthrough(),
        },
      },
    },
    400: problem,
    401: problem,
    403: problem,
    404: problem,
    413: problem,
    503: problem,
  },
});

/** A recipient acknowledgement follows complete consumption of this part's bytes;
 * serving headers or accepting SMTP is not a delivery receipt. */
export const acknowledgeDataSubject = createRoute({
  method: "post",
  path: "/v1/data-subject/{id}/received",
  summary: "Verified recipient confirms receiving the verification part",
  request: {
    params: z.object({ id: z.uuid() }),
    body: {
      required: true,
      content: {
        "application/json": {
          schema: z.object({
            completionToken: z.string().regex(/^[A-Za-z0-9_-]{43}$/),
          }),
        },
      },
    },
    headers: z.object({
      authorization: z.string().regex(/^Bearer [A-Za-z0-9_-]{43}$/),
    }),
  },
  responses: {
    200: {
      description: "Idempotent recipient receipt, with current authority",
      content: {
        "application/json": {
          schema: z.object({
            requestId: z.uuid(),
            part: z.literal("verification"),
            received: z.literal(true),
          }),
        },
      },
    },
    400: problem,
    401: problem,
    403: problem,
    503: problem,
  },
});
