// SPDX-License-Identifier: AGPL-3.0-or-later OR MIT
// Transport only: parser rules and decisions live in the AGPL core.
import { z } from "zod";
import { envelope } from "../../contract-common/src/index.ts";

/** Half-open UTF-16 offsets into the exact submitted text (String.slice). */
export const SourceSpan = z.object({
  start: z.number().int().nonnegative(),
  end: z.number().int().nonnegative(),
});
export const CslName = z.object({
  family: z.string().optional(),
  given: z.string().optional(),
  literal: z.string().optional(),
});
/** Absent fields are unknown; no source type is inferred from punctuation. */
export const StructuredCsl = z.object({
  author: z.array(CslName).optional(),
  issued: z.object({ literal: z.string() }).optional(),
  title: z.string().optional(),
  "container-title": z.string().optional(),
  "container-title-short": z.string().optional(),
  publisher: z.string().optional(),
  "publisher-place": z.string().optional(),
  volume: z.string().optional(),
  issue: z.string().optional(),
  page: z.string().optional(),
  "article-number": z.string().optional(),
  edition: z.string().optional(),
  DOI: z.string().optional(),
  URL: z.string().optional(),
  ISBN: z.string().optional(),
  ISSN: z.string().optional(),
  PMID: z.string().optional(),
  PMCID: z.string().optional(),
});
export const FieldSource = z.object({
  raw: z.string(),
  span: SourceSpan,
  /** Separate from the as-written CSL value, never substituted for it. */
  normalized: z.string().optional(),
});
export const StructuredReference = z.object({
  originalText: z.string(),
  span: SourceSpan,
  csl: StructuredCsl,
  /** CSL field paths, including author.0.family / author.0.given. */
  fieldSources: z.record(z.string(), FieldSource),
  authorsTruncated: z.boolean().optional(),
  structuring: z.object({ path: z.literal("parser"), version: z.string() }),
});
export const StructuringResult = z.object({
  references: z.array(StructuredReference),
  rejected: z.array(
    z.object({
      originalText: z.string(),
      span: SourceSpan,
      reason: z.literal("no-reference-features"),
    }),
  ),
  guidance: z.literal("no-references").nullable(),
  /** Structuring never reserves or consumes Quota. */
  quotaConsumed: z.literal(0),
  referenceLimit: z.number().int().positive(),
});
export const StructureRequest = z.object({
  text: z
    .string()
    .min(1)
    .refine((text) => text.trim().length > 0, { message: "input-empty" }),
});
export const StructuringResponse = envelope(StructuringResult).meta({
  id: "StructuringResponse",
});
export type StructuringResult = z.infer<typeof StructuringResult>;
