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
