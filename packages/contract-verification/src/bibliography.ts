// SPDX-License-Identifier: AGPL-3.0-or-later OR MIT
// Transport only: styles are closed identifiers; rendering policy stays server-owned.
import { z } from "zod";
import { envelope } from "../../contract-common/src/index.ts";
import { StructuredCsl } from "./structuring.ts";
export const CitationStyle = z.enum([
  "apa",
  "mla",
  "chicago",
  "ieee",
  "vancouver",
  "harvard",
  "acs",
  "ama",
  "oxford",
  "springer",
  "din-iso-690",
]);
export type CitationStyle = z.infer<typeof CitationStyle>;
export const BibliographyRequest = z.strictObject({
  style: CitationStyle,
  /** Transient export choices. Never write fields, revisions or results. */
  applySlots: z.array(z.number().int().positive()).max(1000).default([]),
});
export type BibliographyRequest = z.input<typeof BibliographyRequest>;
export const FormattedReference = z.object({
  text: z.string(),
  rtf: z.string(),
  html: z.string(),
});
export const Bibliography = z.object({
  style: CitationStyle,
  rendererVersion: z.string(),
  entries: z.array(
    z.object({
      slot: z.number().int().positive(),
      suggestion: FormattedReference.extend({ csl: StructuredCsl }).nullable(),
      applied: z.boolean(),
    }),
  ),
  bibliography: FormattedReference,
});
export type Bibliography = z.infer<typeof Bibliography>;
export const BibliographyResponse = envelope(Bibliography);
