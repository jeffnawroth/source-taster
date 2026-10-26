// SPDX-License-Identifier: AGPL-3.0-or-later OR MIT
import { z } from "zod";
import { envelope } from "../../contract-common/src/index.js";
export * from "../../contract-common/src/index.js";
/** No verification content, recipient, code or arbitrary message crosses this boundary.
 * Diagnostic only: explicitly enabled loopback rehearsal with a fixed .invalid SMTP sink.
 * Hosted entitlement/Quota routes remain unavailable until their signed-token implementation.
 */
export const MailRehearsalRequest = z.strictObject({ language: z.enum(["de", "en"]) }).meta({ id: "MailRehearsalRequest" });
export const MailRehearsalResponse = envelope(z.object({
    id: z.uuid(), language: z.enum(["de", "en"]), status: z.enum(["queued", "sent"])
})).meta({ id: "MailRehearsalResponse" });
export const MailRehearsalParams = z.object({ id: z.uuid() });
