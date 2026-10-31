// SPDX-License-Identifier: AGPL-3.0-or-later OR MIT
// Transport only: persistence, renewal policy and cryptography belong to clients/service.
import {
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
    challenge: async (
      input: import("zod").infer<typeof SignInChallengeRequest>,
    ) =>
      SignInChallengeResponse.parse(
        await call(
          "/v1/sign-in/challenges",
          "POST",
          SignInChallengeRequest.parse(input),
        ),
      ).data,
    confirm: async (input: import("zod").infer<typeof SignInConfirmRequest>) =>
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
  };
}
