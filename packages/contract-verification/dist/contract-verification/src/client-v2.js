// SPDX-License-Identifier: AGPL-3.0-or-later OR MIT
import { CheckResponse, CheckEvent, isFinalEvent, ProblemDetails, } from "./v2.js";
import { ApiError, createVerificationClient, watchContractEvents, } from "./client.js";
import { ImportResponse } from "./import.js";
export { ApiError, CheckStreamError, readSseFrames, } from "./client.js";
export function verificationClient(options = {}) {
    const base = createVerificationClient(options, "/v2", CheckResponse);
    async function mutate(checkId, path, input) {
        const response = await (options.fetch ?? globalThis.fetch)(`${options.baseUrl ?? ""}/v2/checks/${encodeURIComponent(checkId)}/${path}`, {
            method: "POST",
            headers: {
                "content-type": "application/json",
                ...(options.client ? { "Source-Taster-Client": options.client } : {}),
                ...(options.credentials
                    ? { Authorization: `Bearer ${await options.credentials()}` }
                    : {}),
            },
            body: JSON.stringify(input),
        });
        const body = await response.json().catch(() => undefined);
        if (!response.ok)
            throw new ApiError(response.status, ProblemDetails.safeParse(body).data);
        return CheckResponse.parse(body).data;
    }
    return {
        ...base,
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
        saveFields: (id, slot, input) => mutate(id, `references/${slot}/revisions`, input),
        recheckReference: (id, slot, input) => mutate(id, `references/${slot}/recheck`, input),
        editReferenceList: (id, input) => mutate(id, "references", input),
    };
}
export function watchCheckEvents(checkId, options) {
    return watchContractEvents(checkId, options, "/v2", CheckEvent, isFinalEvent);
}
