// SPDX-License-Identifier: AGPL-3.0-or-later OR MIT
import { DpaChallengeRequest, DpaConcludeRequest, DpaObjectionRequest, DpaOperationResponse, DpaStateResponse, } from "./dpa.js";
import { ProblemDetails } from "../../contract-common/src/index.js";
import { GuestTokenError } from "./client.js";
/** Transport only. Opaque extension credentials never become download URLs. */
export function dpaClient(options) {
    const prefix = options.credential ? "/v1/extension/dpa" : "/v1/dpa";
    async function call(path, body) {
        const response = await (options.fetch ?? fetch)(options.baseUrl + prefix + path, {
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
        });
        if (!response.ok)
            throw new GuestTokenError(response.status, ProblemDetails.safeParse(await response.json().catch(() => undefined))
                .data);
        return response;
    }
    return {
        state: async (language) => DpaStateResponse.parse(await (await call(`/${language}`)).json()).data,
        challenge: async (input) => DpaOperationResponse.parse(await (await call("/challenges", DpaChallengeRequest.parse(input))).json()).data,
        conclude: async (input) => DpaOperationResponse.parse(await (await call("/conclude", DpaConcludeRequest.parse(input))).json()).data,
        operation: async (id) => DpaOperationResponse.parse(await (await call(`/operations/${encodeURIComponent(id)}`)).json()).data,
        download: async (id) => (await call(`/agreements/${encodeURIComponent(id)}/download`)).blob(),
        object: async (input) => {
            await call("/objections", DpaObjectionRequest.parse(input));
        },
    };
}
