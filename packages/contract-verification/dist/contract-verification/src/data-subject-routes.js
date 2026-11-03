// SPDX-License-Identifier: AGPL-3.0-or-later OR MIT
import { createRoute } from "@hono/zod-openapi";
import { z } from "zod";
import { ProblemDetails } from "./index.js";
const problem = {
    description: "Current recipient authority, expiry or size failure",
    content: { "application/problem+json": { schema: ProblemDetails } },
};
/** Recipient access only. This route does not initiate requests or expose an
 * Operator preview. Retained fields are exported without a lossy citation schema. */
export const downloadDataSubject = createRoute({
    method: "get",
    path: "/v1/data-subject/{id}/download",
    summary: "Download this program's retained Account data directly as the verified recipient",
    request: {
        params: z.object({ id: z.uuid() }),
        headers: z.object({
            authorization: z.string().regex(/^Bearer [A-Za-z0-9_-]{43}$/),
        }),
    },
    responses: {
        200: {
            description: "Machine-readable verification part; no-store, fixed attachment name, bounded by original retention",
            headers: {
                "Cache-Control": { schema: { type: "string", const: "no-store" } },
                "Content-Disposition": { schema: { type: "string" } },
            },
            content: {
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
