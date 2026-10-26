// SPDX-License-Identifier: AGPL-3.0-or-later OR MIT
// Transport conventions shared by every Source Taster API (ADR-0003 "API conventions").
import { z } from "zod";
export const PROBLEM_CONTENT_TYPE = "application/problem+json";
/**
 * RFC 9457 Problem Details with a stable machine `code` and the catalog key
 * (`i18nKey`) under which clients find the user-facing message.
 */
export const ProblemDetails = z
    .object({
    type: z.string(),
    title: z.string(),
    status: z.number().int(),
    detail: z.string().optional(),
    code: z.string(),
    i18nKey: z.string(),
})
    .meta({ id: "ProblemDetails" });
/**
 * Consumption and remaining Quota of the acting Owner (FA-ORG-15).
 * `null` means no Quota applies, as in standalone mode.
 */
export const Quota = z
    .object({
    consumed: z.number().int().nonnegative(),
    remaining: z.number().int().nonnegative(),
})
    .meta({ id: "Quota" });
export const QuotaSlot = Quota.nullable();
/** Every successful response wraps its payload with the Quota slot. */
export function envelope(data) {
    return z.object({ data, quota: QuotaSlot });
}
