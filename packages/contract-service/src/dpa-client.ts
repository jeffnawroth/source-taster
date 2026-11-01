// SPDX-License-Identifier: AGPL-3.0-or-later OR MIT
import {
  DpaChallengeRequest,
  DpaConcludeRequest,
  DpaObjectionRequest,
  DpaOperationResponse,
  DpaStateResponse,
} from "./dpa.ts";
import { ProblemDetails } from "../../contract-common/src/index.ts";
import { GuestTokenError } from "./client.ts";
/** Transport only. Opaque extension credentials never become download URLs. */
export function dpaClient(options: {
  baseUrl: string;
  fetch?: typeof fetch;
  credential?: string;
}) {
  const prefix = options.credential ? "/v1/extension/dpa" : "/v1/dpa";
  async function call(path: string, body?: unknown) {
    const response = await (options.fetch ?? fetch)(
      options.baseUrl + prefix + path,
      {
        method: body === undefined ? "GET" : "POST",
        credentials: options.credential ? "omit" : "include",
        redirect: "error",
        cache: "no-store",
        headers: {
          ...(options.credential
            ? { authorization: `Bearer ${options.credential}` }
            : {}),
          ...(body === undefined ? {} : { "content-type": "application/json" }),
        },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      },
    );
    if (!response.ok)
      throw new GuestTokenError(
        response.status,
        ProblemDetails.safeParse(await response.json().catch(() => undefined))
          .data,
      );
    return response;
  }
  return {
    state: async (language: "de" | "en") =>
      DpaStateResponse.parse(await (await call(`/${language}`)).json()).data,
    challenge: async (input: DpaChallengeRequest) =>
      DpaOperationResponse.parse(
        await (
          await call("/challenges", DpaChallengeRequest.parse(input))
        ).json(),
      ).data,
    conclude: async (input: DpaConcludeRequest) =>
      DpaOperationResponse.parse(
        await (await call("/conclude", DpaConcludeRequest.parse(input))).json(),
      ).data,
    operation: async (id: string) =>
      DpaOperationResponse.parse(
        await (await call(`/operations/${encodeURIComponent(id)}`)).json(),
      ).data,
    download: async (id: string) =>
      (await call(`/agreements/${encodeURIComponent(id)}/download`)).blob(),
    object: async (input: { noticeId: string; reason: string }) => {
      await call("/objections", DpaObjectionRequest.parse(input));
    },
  };
}
export type DpaClient = ReturnType<typeof dpaClient>;
