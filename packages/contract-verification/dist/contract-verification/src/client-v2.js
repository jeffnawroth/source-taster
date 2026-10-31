// SPDX-License-Identifier: AGPL-3.0-or-later OR MIT
import { CheckResponse, CheckEvent, isFinalEvent, ProblemDetails, SelectionPreviewResponse, QuotaResponse, } from "./v2.js";
import { ApiError, createVerificationClient, watchContractEvents, } from "./client.js";
import { ImportResponse } from "./import.js";
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
    const mutate = async (checkId, path, input) => CheckResponse.parse(await send(`/${encodeURIComponent(checkId)}/${path}`, input)).data;
    const headers = async () => ({
        ...(options.client ? { "Source-Taster-Client": options.client } : {}),
        ...(options.credentials
            ? { Authorization: `Bearer ${await options.credentials()}` }
            : {}),
    });
    return {
        ...base,
        /** `maxReferences` starts only the first N References in input order (Quota choice). */
        createCheck: async (input, choice = {}) => CheckResponse.parse(await send(choice.maxReferences === undefined
            ? ""
            : `?maxReferences=${choice.maxReferences}`, typeof input === "string" ? { text: input } : input)).data,
        /** The acting Owner's Quota; `null` when no Quota applies. */
        getQuota: async () => {
            const response = await (options.fetch ?? globalThis.fetch)(`${options.baseUrl ?? ""}/v2/quota`, { headers: await headers() });
            const body = await response.json().catch(() => undefined);
            if (!response.ok)
                throw new ApiError(response.status, ProblemDetails.safeParse(body).data);
            return QuotaResponse.parse(body).data;
        },
        setManualOverride: (id, slot, input) => mutate(id, `references/${slot}/manual-override`, input),
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
        editSelection: (checkId, input) => mutate(checkId, "selection", input),
        previewSelection: async (checkId, input) => SelectionPreviewResponse.parse(await send(`/${encodeURIComponent(checkId)}/selection/preview`, input)).data,
        saveFields: (id, slot, input) => mutate(id, `references/${slot}/revisions`, input),
        recheckReference: (id, slot, input) => mutate(id, `references/${slot}/recheck`, input),
        editReferenceList: (id, input) => mutate(id, "references", input),
    };
}
export function watchCheckEvents(checkId, options) {
    return watchContractEvents(checkId, options, "/v2", CheckEvent, isFinalEvent);
}
