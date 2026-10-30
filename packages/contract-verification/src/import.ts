// SPDX-License-Identifier: AGPL-3.0-or-later OR MIT
// Transport only; library adapters and round-trip decisions stay in the server.
import { z } from "zod";
import { envelope } from "../../contract-common/src/index.ts";
import { LibraryInput, StructuredReference } from "./v2.ts";
export { LibraryInput };
export const ImportResult = z
  .object({
    references: z.array(StructuredReference),
    /** Malformed records are listed with their raw text; the rest still import. */
    rejected: z.array(
      z.object({
        originalText: z.string(),
        span: z.object({ start: z.number(), end: z.number() }),
        reason: z.literal("malformed-record"),
      }),
    ),
    quotaConsumed: z.literal(0),
    referenceLimit: z.number(),
  })
  .meta({ id: "ImportResultV2" });
export type ImportResult = z.infer<typeof ImportResult>;
export const ImportResponse = envelope(ImportResult);
