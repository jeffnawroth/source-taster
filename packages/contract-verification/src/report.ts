// SPDX-License-Identifier: AGPL-3.0-or-later OR MIT
// Transport only. Report content, layout and the PDF adapter belong to the server.
import { z } from "zod";
import { CitationStyle, envelope } from "../../contract-common/src/index.ts";

export const ReportLanguage = z.enum(["de", "en"]);
export type ReportLanguage = z.infer<typeof ReportLanguage>;
export const ReportId = z.uuid();
/**
 * The document name is supplied for this one report: the Check stores no file
 * name, and the server keeps the name only for the life of the temporary file.
 */
export const ReportRequest = z.strictObject({
  /** Headings, explanations and Status texts. Bibliographic content is never translated. */
  language: ReportLanguage,
  /** Citation style of the Correction suggestions (with its pinned locale). */
  style: CitationStyle,
  documentName: z.string().trim().min(1).max(200).optional(),
});
export type ReportRequest = z.input<typeof ReportRequest>;
/**
 * queued: waiting for a generator; generating: the snapshot is frozen;
 * ready: the finished file never changes; failed/cancelled: nothing to download.
 */
export const ReportState = z.enum([
  "queued",
  "generating",
  "ready",
  "failed",
  "cancelled",
]);
export const ReportFailure = z.enum([
  "unsupported-character",
  "limit-exceeded",
  "unavailable",
]);
export type ReportFailure = z.infer<typeof ReportFailure>;
export const Report = z
  .object({
    id: ReportId,
    checkId: z.uuid(),
    language: ReportLanguage,
    state: ReportState,
    failure: ReportFailure.optional(),
    /** Set once the snapshot is frozen: some Reference was still being checked. */
    intermediate: z.boolean().optional(),
    /**
     * While the job runs: 15 minutes after creation. Once the file exists: 15
     * minutes after publication. Never later than the Check's deletion deadline.
     */
    expiresAt: z.string(),
  })
  .meta({ id: "Report" });
export type Report = z.infer<typeof Report>;
export const ReportResponse = envelope(Report).meta({ id: "ReportResponse" });
export type ReportResponse = z.infer<typeof ReportResponse>;
