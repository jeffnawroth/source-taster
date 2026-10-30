// SPDX-License-Identifier: AGPL-3.0-or-later OR MIT
// Transport only. Export projection and adapters belong to the server.
import { z } from "zod";
export const ExportFormat = z.enum(["csl-json", "bibtex", "imported-format"]);
export type ExportFormat = z.infer<typeof ExportFormat>;
export const ExportRequest = z.strictObject({
  format: ExportFormat,
  mode: z.enum(["original", "selected-corrections"]),
  corrections: z
    .array(
      z.strictObject({
        slot: z.number().int().positive(),
        resultToken: z.string().regex(/^[a-f0-9]{64}$/u),
      }),
    )
    .max(1000)
    .default([]),
});
export type ExportRequest = z.input<typeof ExportRequest>;
