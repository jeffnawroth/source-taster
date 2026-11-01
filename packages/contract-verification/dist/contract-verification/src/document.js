// SPDX-License-Identifier: AGPL-3.0-or-later OR MIT
// Transport only. Text extraction and its restricted execution area belong to
// the server (ADR-0011, ADR-0015).
import { z } from "zod";
import { envelope } from "../../contract-common/src/index.js";
import { SourceSpan } from "./structuring.js";
import { AiStructuringResult as StructuringResult } from "./ai.js";
export const BibliographySelection = z.object({
    version: z.string(),
    regions: z.array(SourceSpan).max(1000),
});
export const BibliographyDocument = z.object({
    text: z.string(),
    selection: BibliographySelection,
});
/** ADR-0011: "20 MB" means 20 MiB; the message states "20 MB". */
export const documentSizeLimit = 20_971_520;
export const DocumentFormat = z.enum(["pdf", "docx"]);
export const DocumentStructuringRequest = z.object({
    file: z
        .any()
        .meta({ type: "string", format: "binary" })
        .describe("One PDF or DOCX file within the current configured limit (initially 20 MB / 20,971,520 bytes)."),
});
export const ExtractedDocument = z
    .object({
    format: DocumentFormat,
    /** The extracted text exactly as it was structured. */
    text: z.string(),
    /** ADR-0011: some PDF pages contain no text. */
    notice: z.literal("partial-no-text").nullable(),
})
    .meta({ id: "ExtractedDocument" });
export const DocumentStructuringResult = z
    .object({
    document: ExtractedDocument,
    /** The same parser result as for pasted text; never reserves Quota. */
    structuring: StructuringResult,
    selection: BibliographySelection,
    referenceLimitExceeded: z.boolean(),
})
    .meta({ id: "DocumentStructuringResult" });
export const DocumentStructuringResponse = envelope(DocumentStructuringResult).meta({ id: "DocumentStructuringResponse" });
/** Current Operator-configured upload limit, shared by web and extension. */
export const DocumentSettingsResponse = envelope(z.object({ inputBytes: z.number().int().positive() })).meta({ id: "DocumentSettingsResponse" });
export const TextStructuringRequest = z.strictObject({
    text: z.string().min(1),
    /** Uploaded text stays a document even without a detected heading. */
    document: z.boolean().optional(),
    regions: z.array(SourceSpan).max(1000).optional(),
});
export const TextStructuringResponse = envelope(z.object({
    document: BibliographyDocument.nullable(),
    structuring: StructuringResult,
    referenceLimitExceeded: z.boolean(),
}));
