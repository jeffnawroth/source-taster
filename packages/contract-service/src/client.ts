// SPDX-License-Identifier: AGPL-3.0-or-later OR MIT
// Transport only: persistence, renewal policy and cryptography belong to clients/service.
import type { z } from "zod";
import {
  ExtensionCredential,
  ExtensionSignInChallengeResponse,
  ExtensionSignInConfirmRequest,
  ExtensionSignInConfirmResponse,
  SignInChallengeRequest,
  SignInChallengeResponse,
  SignInConfirmRequest,
  AccountSessionResponse,
  AccountTokenResponse,
  SignOutResponse,
  SignOutRequest,
  GuestTokenRequest,
  GuestTokenResponse,
  ProblemDetails,
  AccountDeletionRequest,
  AccountDeletionResponse,
  EmailChangeChallengeRequest,
  EmailChangeChallengeResponse,
  EmailChangeConfirmRequest,
  FreshProofChallengeRequest,
  FreshProofChallengeResponse,
  FreshProofConfirmRequest,
  FreshProofResponse,
} from "./index.ts";
export class GuestTokenError extends Error {
  readonly status: number;
  readonly problem: ProblemDetails | undefined;
  constructor(status: number, problem?: ProblemDetails) {
    super(problem?.title ?? "Guest token unavailable");
    this.status = status;
    this.problem = problem;
  }
}
/** What a UI can do with a failed sensitive-action call. Anything the private
 * service has not implemented (404/501) is `unavailable`, never a success. */
export type SensitiveFailure =
  | "proof-required"
  | "proof-invalid"
  | "proof-exhausted"
  | "email-code-invalid"
  | "rate-limited"
  | "session-ended"
  | "unavailable"
  | "temporarily-unavailable"
  | "unknown";
export function sensitiveFailure(error: unknown): SensitiveFailure {
  if (!(error instanceof GuestTokenError)) return "unknown";
  const code = error.problem?.code;
  if (error.status === 401) return "session-ended";
  if (error.status === 404 || error.status === 501) return "unavailable";
  if (error.status === 503) return "temporarily-unavailable";
  if (error.status === 403)
    return code === "fresh-proof-required" ? "proof-required" : "session-ended";
  if (error.status === 429)
    return code === "fresh-proof-exhausted"
      ? "proof-exhausted"
      : "rate-limited";
  if (error.status === 400 && code === "fresh-proof-invalid")
    return "proof-invalid";
  if (error.status === 400 && code === "email-change-invalid")
    return "email-code-invalid";
  return "unknown";
}
export function guestTokenClient(options: {
  baseUrl: string;
  fetch?: typeof fetch;
}) {
  return async (input: GuestTokenRequest) => {
    const response = await (options.fetch ?? fetch)(
      `${options.baseUrl}/v1/guest-tokens`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(GuestTokenRequest.parse(input)),
        credentials: "omit",
        redirect: "error",
        cache: "no-store",
      },
    );
    const body: unknown = await response.json().catch(() => undefined);
    if (!response.ok)
      throw new GuestTokenError(
        response.status,
        ProblemDetails.safeParse(body).data,
      );
    return GuestTokenResponse.parse(body).data;
  };
}

/** Web transport only. The browser owns Secure HttpOnly cookies; no credential is returned or stored here. */
export function accountSessionClient(options: {
  baseUrl: string;
  fetch?: typeof fetch;
}) {
  async function call(path: string, method = "GET", body?: unknown) {
    const response = await (options.fetch ?? fetch)(
      `${options.baseUrl}${path}`,
      {
        method,
        credentials: "include",
        redirect: "error",
        cache: "no-store",
        headers:
          body === undefined ? {} : { "content-type": "application/json" },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      },
    );
    const value: unknown = await response.json().catch(() => undefined);
    if (!response.ok)
      throw new GuestTokenError(
        response.status,
        ProblemDetails.safeParse(value).data,
      );
    return value;
  }
  return {
    session: async () =>
      AccountSessionResponse.parse(await call("/v1/session")).data,
    challenge: async (input: z.infer<typeof SignInChallengeRequest>) =>
      SignInChallengeResponse.parse(
        await call(
          "/v1/sign-in/challenges",
          "POST",
          SignInChallengeRequest.parse(input),
        ),
      ).data,
    confirm: async (input: z.infer<typeof SignInConfirmRequest>) =>
      AccountSessionResponse.parse(
        await call(
          "/v1/sign-in/confirm",
          "POST",
          SignInConfirmRequest.parse(input),
        ),
      ).data,
    token: async () =>
      AccountTokenResponse.parse(await call("/v1/account-tokens", "POST")).data,
    activity: async () =>
      AccountSessionResponse.parse(await call("/v1/session/activity", "POST"))
        .data,
    signOut: async (everywhere: boolean) =>
      SignOutResponse.parse(
        await call(
          "/v1/sign-out",
          "POST",
          SignOutRequest.parse({ everywhere }),
        ),
      ).data,
    sensitive: {
      freshProofChallenge: async (
        input: z.infer<typeof FreshProofChallengeRequest>,
      ) =>
        FreshProofChallengeResponse.parse(
          await call(
            "/v1/account/fresh-proof/challenges",
            "POST",
            FreshProofChallengeRequest.parse(input),
          ),
        ).data,
      freshProofConfirm: async (
        input: z.infer<typeof FreshProofConfirmRequest>,
      ) =>
        FreshProofResponse.parse(
          await call(
            "/v1/account/fresh-proof/confirm",
            "POST",
            FreshProofConfirmRequest.parse(input),
          ),
        ).data,
      emailChangeChallenge: async (
        input: z.infer<typeof EmailChangeChallengeRequest>,
      ) =>
        EmailChangeChallengeResponse.parse(
          await call(
            "/v1/account/email-change/challenges",
            "POST",
            EmailChangeChallengeRequest.parse(input),
          ),
        ).data,
      emailChangeConfirm: async (
        input: z.infer<typeof EmailChangeConfirmRequest>,
      ) =>
        AccountSessionResponse.parse(
          await call(
            "/v1/account/email-change/confirm",
            "POST",
            EmailChangeConfirmRequest.parse(input),
          ),
        ).data,
      deleteAccount: async (input: z.infer<typeof AccountDeletionRequest>) =>
        AccountDeletionResponse.parse(
          await call(
            "/v1/account/deletion",
            "POST",
            AccountDeletionRequest.parse(input),
          ),
        ).data,
    },
  };
}

/** Extension transport only. These endpoints never consume web cookies.
 * The host owns trusted extension-local persistence and in-memory API tokens. */
export function extensionSessionClient(options: {
  baseUrl: string;
  fetch?: typeof fetch;
}) {
  async function call(
    path: string,
    method: string,
    credential?: string,
    body?: unknown,
  ) {
    const response = await (options.fetch ?? fetch)(
      `${options.baseUrl}/v1/extension${path}`,
      {
        method,
        credentials: "omit",
        redirect: "error",
        cache: "no-store",
        headers: {
          ...(credential === undefined
            ? {}
            : {
                authorization: `Bearer ${ExtensionCredential.parse(credential)}`,
              }),
          ...(body === undefined ? {} : { "content-type": "application/json" }),
        },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      },
    );
    const value: unknown = await response.json().catch(() => undefined);
    if (!response.ok)
      throw new GuestTokenError(
        response.status,
        ProblemDetails.safeParse(value).data,
      );
    return value;
  }
  return {
    challenge: async (input: z.infer<typeof SignInChallengeRequest>) =>
      ExtensionSignInChallengeResponse.parse(
        await call(
          "/sign-in/challenges",
          "POST",
          undefined,
          SignInChallengeRequest.parse(input),
        ),
      ).data,
    confirm: async (input: z.infer<typeof ExtensionSignInConfirmRequest>) =>
      ExtensionSignInConfirmResponse.parse(
        await call(
          "/sign-in/confirm",
          "POST",
          undefined,
          ExtensionSignInConfirmRequest.parse(input),
        ),
      ).data,
    session: async (credential: string) =>
      AccountSessionResponse.parse(await call("/session", "GET", credential))
        .data,
    token: async (credential: string) =>
      AccountTokenResponse.parse(
        await call("/account-tokens", "POST", credential),
      ).data,
    activity: async (credential: string) =>
      AccountSessionResponse.parse(
        await call("/session/activity", "POST", credential),
      ).data,
    signOut: async (credential: string, everywhere: boolean) =>
      SignOutResponse.parse(
        await call(
          "/sign-out",
          "POST",
          credential,
          SignOutRequest.parse({ everywhere }),
        ),
      ).data,
    sensitive: {
      freshProofChallenge: async (
        credential: string,
        input: z.infer<typeof FreshProofChallengeRequest>,
      ) =>
        FreshProofChallengeResponse.parse(
          await call(
            "/account/fresh-proof/challenges",
            "POST",
            credential,
            FreshProofChallengeRequest.parse(input),
          ),
        ).data,
      freshProofConfirm: async (
        credential: string,
        input: z.infer<typeof FreshProofConfirmRequest>,
      ) =>
        FreshProofResponse.parse(
          await call(
            "/account/fresh-proof/confirm",
            "POST",
            credential,
            FreshProofConfirmRequest.parse(input),
          ),
        ).data,
      emailChangeChallenge: async (
        credential: string,
        input: z.infer<typeof EmailChangeChallengeRequest>,
      ) =>
        EmailChangeChallengeResponse.parse(
          await call(
            "/account/email-change/challenges",
            "POST",
            credential,
            EmailChangeChallengeRequest.parse(input),
          ),
        ).data,
      emailChangeConfirm: async (
        credential: string,
        input: z.infer<typeof EmailChangeConfirmRequest>,
      ) =>
        AccountSessionResponse.parse(
          await call(
            "/account/email-change/confirm",
            "POST",
            credential,
            EmailChangeConfirmRequest.parse(input),
          ),
        ).data,
      deleteAccount: async (
        credential: string,
        input: z.infer<typeof AccountDeletionRequest>,
      ) =>
        AccountDeletionResponse.parse(
          await call(
            "/account/deletion",
            "POST",
            credential,
            AccountDeletionRequest.parse(input),
          ),
        ).data,
    },
  };
}
