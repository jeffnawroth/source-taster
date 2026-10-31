// SPDX-License-Identifier: AGPL-3.0-or-later OR MIT
import { CheckResponse, CheckEvent, isFinalEvent, } from "./v2.js";
import { createVerificationClient, watchContractEvents, } from "./client.js";
import { ImportResponse } from "./import.js";
import { ApiError } from "./client.js";
import { ProblemDetails } from "./index.js";
export { ApiError, CheckStreamError, readSseFrames, } from "./client.js";
export function verificationClient(options = {}) {
    return {
        ...createVerificationClient(options, "/v2", CheckResponse),
        importLibrary: async (input) => {
            const response = await (options.fetch ?? globalThis.fetch)(`${options.baseUrl ?? ""}/v2/imports`, {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                    ...(options.client
                        ? { "Source-Taster-Client": options.client }
                        : {}),
                    ...(options.credentials
                        ? { Authorization: `Bearer ${await options.credentials()}` }
                        : {}),
                },
                body: JSON.stringify(input),
            });
            const body = await response.json().catch(() => undefined);
            if (!response.ok)
                throw new ApiError(response.status, ProblemDetails.safeParse(body).data);
            return ImportResponse.parse(body).data;
        },
    };
}
export function watchCheckEvents(checkId, options) {
    return watchContractEvents(checkId, options, "/v2", CheckEvent, isFinalEvent);
}
