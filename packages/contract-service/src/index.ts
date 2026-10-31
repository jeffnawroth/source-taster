// SPDX-License-Identifier: AGPL-3.0-or-later OR MIT
import { z } from "zod";
import { CitationStyle, envelope } from "../../contract-common/src/index.ts";
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

/** Account data only: never Check content, Guest identity or theme/onboarding hooks. */
export const AccountPreferences = z.strictObject({
  language: z.enum(["de", "en"]),
  citationStyle: CitationStyle,
});
export type AccountPreferences = z.infer<typeof AccountPreferences>;
export const AccountPreferencesPatch = AccountPreferences.partial().refine(
  (patch) => Object.values(patch).some((value) => value !== undefined),
  { message: "At least one Preference is required" },
);
export type AccountPreferencesPatch = z.infer<typeof AccountPreferencesPatch>;
// Reads tolerate a removed style so clients can display the required APA fallback notice.
export const AccountPreferencesResponse = envelope(
  AccountPreferences.extend({ citationStyle: z.string().min(1).max(128) }),
).meta({ id: "AccountPreferencesResponse" });

/** Browser session credentials are cookies, never fields in these responses. */
export const SignInChallengeRequest = z.strictObject({
  email: z.email().max(254),
  language: z.enum(["de", "en"]),
});
export const SignInChallengeResponse = envelope(
  z.strictObject({
    challengeId: z.uuid(),
    expiresIn: z.number().int().positive().max(300),
    resendAfter: z.number().int().min(60),
  }),
).meta({ id: "SignInChallengeResponse" });
export const SignInConfirmRequest = z.strictObject({
  challengeId: z.uuid(),
  code: z.string().regex(/^[0-9]{6}$/),
  /** Adopt only when creating an Account; existing Accounts ignore these values. */
  preferences: AccountPreferences.optional(),
});
export const AccountSessionResponse = envelope(
  z.strictObject({ accountId: z.uuid(), ownerId: z.uuid(), email: z.email() }),
).meta({ id: "AccountSessionResponse" });
export type AccountSession = z.infer<typeof AccountSessionResponse>["data"];
export const AccountTokenResponse = GuestTokenResponse.meta({
  id: "AccountTokenResponse",
});
export const SignOutRequest = z.strictObject({ everywhere: z.boolean() });
export const SignOutResponse = envelope(
  z.strictObject({ signedOut: z.literal(true) }),
).meta({ id: "SignOutResponse" });

/** Separate opaque bearer secrets, never verification-API access tokens.
 * Transaction secrets live only until confirmation; session secrets may live
 * only in trusted extension-local storage (ADR-0013/0015). */
export const ExtensionCredential = z.string().regex(/^[A-Za-z0-9_-]{32,512}$/);
export const ExtensionSignInChallengeResponse = envelope(
  SignInChallengeResponse.shape.data.extend({
    transactionCredential: ExtensionCredential,
  }),
).meta({ id: "ExtensionSignInChallengeResponse" });
export const ExtensionSignInConfirmRequest = SignInConfirmRequest.extend({
  transactionCredential: ExtensionCredential,
});
export const ExtensionSignInConfirmResponse = envelope(
  z.strictObject({
    session: AccountSessionResponse.shape.data,
    sessionCredential: ExtensionCredential,
  }),
).meta({ id: "ExtensionSignInConfirmResponse" });
