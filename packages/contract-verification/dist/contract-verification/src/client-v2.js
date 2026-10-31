// SPDX-License-Identifier: AGPL-3.0-or-later OR MIT
import { CheckResponse, CheckEvent, isFinalEvent, ProblemDetails, SelectionPreviewResponse, } from "./v2.js";
import { ApiError, createVerificationClient, watchContractEvents, } from "./client.js";
export { ApiError, CheckStreamError, readSseFrames, } from "./client.js";
export function verificationClient(options = {}) {
    const base = createVerificationClient(options, "/v2", CheckResponse);
    async function send(path, input) {
        const response = await (options.fetch ?? globalThis.fetch)(`${options.baseUrl ?? ""}/v2/checks${path}`, {
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
        return body;
    }
    const mutate = async (id, path, input) => CheckResponse.parse(await send(`/${encodeURIComponent(id)}/${path}`, input)).data;
    return {
        ...base,
        createCheck: async (input) => CheckResponse.parse(await send("", typeof input === "string" ? { text: input } : input)).data,
        editSelection: (id, input) => mutate(id, "selection", input),
        previewSelection: async (id, input) => SelectionPreviewResponse.parse(await send(`/${encodeURIComponent(id)}/selection/preview`, input)).data,
        saveFields: (id, slot, input) => mutate(id, `references/${slot}/revisions`, input),
        recheckReference: (id, slot, input) => mutate(id, `references/${slot}/recheck`, input),
        editReferenceList: (id, input) => mutate(id, "references", input),
    };
}
export function watchCheckEvents(checkId, options) {
    return watchContractEvents(checkId, options, "/v2", CheckEvent, isFinalEvent);
}
