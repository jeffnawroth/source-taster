// SPDX-License-Identifier: AGPL-3.0-or-later
// Browser- and extension-side stand-ins for what a Guest Start needs, for the
// specs that watch WHEN a Guest token and the Quota are requested. Nothing
// here is a Guest identity or a real balance.
import { TextStructuringResponse } from "../../../../packages/contract-verification/src/document.ts";
import { GuestTokenResponse } from "../../../../packages/contract-service/src/index.ts";

export const guestFixtureToken = "guest-fixture";

export function guestTokenReply() {
  return GuestTokenResponse.parse({
    data: {
      accessToken: guestFixtureToken,
      tokenType: "Bearer",
      expiresIn: 300,
      expiresAt: new Date(Date.now() + 300_000).toISOString(),
    },
    quota: null,
  });
}

export const quotaFixture = {
  consumed: 0,
  remaining: 100,
  granted: 100,
  reserved: 0,
  warning: "none" as const,
  grants: [],
  features: [],
};

export function quotaReply() {
  return { data: quotaFixture, quota: quotaFixture };
}

/** One parsed Reference, so that the Start proceeds to its Quota read. */
export function structuringReply(text: string) {
  return TextStructuringResponse.parse({
    data: {
      document: null,
      structuring: {
        references: [
          {
            originalText: text,
            span: { start: 0, end: text.length },
            csl: { title: text },
            fieldSources: {},
            structuring: { path: "parser", version: "fixture" },
          },
        ],
        rejected: [],
        guidance: null,
        quotaConsumed: 0,
        referenceLimit: 50,
      },
      referenceLimitExceeded: false,
    },
    quota: null,
  });
}
