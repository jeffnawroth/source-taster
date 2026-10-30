// SPDX-License-Identifier: AGPL-3.0-or-later OR MIT
// Transport only; library adapters and round-trip decisions stay in the server.
import { z } from "zod";
import { envelope } from "../../contract-common/src/index.ts";
import { StructuredReference } from "./v2.ts";
export const LibraryInput = z.strictObject({
  format: z.enum(["bibtex", "ris"]),
  text: z.string().min(1).max(20 * 1024 * 1024),
});
export type LibraryInput = z.infer<typeof LibraryInput>;
export const ImportResult = z.object({
  references: z.array(StructuredReference),
  rejected: z.array(z.object({ originalText: z.string(), span: z.object({start:z.number(),end:z.number()}), reason: z.literal("malformed-record") })),
  quotaConsumed: z.literal(0),
  referenceLimit: z.number(),
});
export type ImportResult = z.infer<typeof ImportResult>;
export const ImportResponse = envelope(ImportResult);
