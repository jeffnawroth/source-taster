// SPDX-License-Identifier: AGPL-3.0-or-later OR MIT
// Version 2 AI provenance. Version 1 structuring contracts stay frozen.
import { z } from "zod";
import { StructuredReference, StructuringResult, SourceSpan, StructuredCsl, FieldSource, } from "./structuring.js";
export const AiReference = StructuredReference.extend({
    csl: StructuredCsl.extend({ arXiv: z.string().optional() }),
    fieldSources: z.record(z.string(), FieldSource.extend({
        provenance: z.enum(["parser", "user", "ai"]).optional(),
    })),
    structuring: z.object({
        path: z.enum(["parser", "user", "ai"]),
        version: z.string(),
    }),
    ai: z
        .object({
        configuration: z.string(),
        notice: z.literal("ai-can-be-wrong"),
        proposals: z.array(z.object({
            field: z.string(),
            value: z.unknown(),
            reason: z.literal("ungrounded"),
        })),
        changedFields: z.array(z.string()),
    })
        .optional(),
});
export const AiStructuringResult = StructuringResult.extend({
    receipt: z
        .object({
        expiresAt: z.number().int(),
        signature: z.string().regex(/^[a-f0-9]{64}$/u),
    })
        .optional(),
    references: z.array(AiReference),
    ai: z
        .object({
        reason: z
            .enum(["guest", "feature-unavailable", "configuration-unavailable"])
            .nullable(),
        upgrade: z.boolean(),
        fallbacks: z.array(z.object({
            span: SourceSpan,
            reason: z.enum(["timeout", "invalid-output", "provider-unavailable"]),
        })),
    })
        .optional(),
});
/** Flat bounded adapter response; offsets are UTF-16 into the exact chunk. */
export const AiOutput = z.strictObject({
    references: z
        .array(z.strictObject({
        originalText: z.string().min(1),
        span: SourceSpan,
        csl: StructuredCsl.extend({ arXiv: z.string().optional() }).strict(),
        spans: z.record(z.string(), SourceSpan),
    }))
        .max(1000),
});
