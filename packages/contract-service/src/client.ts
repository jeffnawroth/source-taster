// SPDX-License-Identifier: AGPL-3.0-or-later OR MIT
// Transport only: persistence, renewal policy and cryptography belong to clients/service.
import {
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
