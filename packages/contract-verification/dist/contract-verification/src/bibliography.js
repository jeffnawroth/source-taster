// SPDX-License-Identifier: AGPL-3.0-or-later OR MIT
// Transport only: styles are closed identifiers; rendering policy stays server-owned.
import { z } from "zod";
import { envelope } from "../../contract-common/src/index.js";
import { StructuredCsl } from "./structuring.js";
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
export const BibliographyRequest = z.strictObject({
    style: CitationStyle,
    /** Omit for all suggestions; clients can request just the visible/selected slots. */
    suggestionSlots: z.array(z.number().int().positive()).max(1000).optional(),
    includeBibliography: z.boolean().default(true),
    /** Transient export choices. Never write fields, revisions or results. */
    applySlots: z.array(z.number().int().positive()).max(1000).default([]),
});
export const FormattedReference = z.object({
    text: z.string(),
    rtf: z.string(),
    html: z.string(),
});
export const Bibliography = z.object({
    style: CitationStyle,
    rendererVersion: z.string(),
    entries: z.array(z.object({
        slot: z.number().int().positive(),
        suggestion: FormattedReference.extend({ csl: StructuredCsl }).nullable(),
        applied: z.boolean(),
        /** Opaque result binding for a transient correction selection. */
        resultToken: z
            .string()
            .regex(/^[a-f0-9]{64}$/u)
            .optional(),
    })),
    bibliography: FormattedReference.nullable(),
});
export const BibliographyResponse = envelope(Bibliography);
