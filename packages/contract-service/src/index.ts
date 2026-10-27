// SPDX-License-Identifier: AGPL-3.0-or-later OR MIT
import { z } from "zod";
import { envelope } from "../../contract-common/src/index.ts";
export * from "../../contract-common/src/index.ts";
/** Infrastructure readiness only. This grants no identity, permission or Quota. */
export const ServiceStatusResponse = envelope(
  z.object({
    program: z.literal("service"),
    status: z.literal("ready"),
    authentication: z.literal("unavailable"),
  }),
).meta({ id: "ServiceStatusResponse" });

export const GuestTokenRequest = z.strictObject({
  guestId: z.uuid(),
  client: z.enum(["web", "extension"]),
});
export type GuestTokenRequest = z.infer<typeof GuestTokenRequest>;
export const GuestTokenResponse = envelope(
  z.strictObject({
    accessToken: z.string().min(1).max(4096),
    tokenType: z.literal("Bearer"),
    expiresAt: z.iso.datetime(),
    expiresIn: z.literal(300),
  }),
).meta({ id: "GuestTokenResponse" });
export type GuestTokenResponse = z.infer<typeof GuestTokenResponse>;
