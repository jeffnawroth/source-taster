// SPDX-License-Identifier: AGPL-3.0-or-later OR MIT
import { ApiError } from "./client.js";
import { ProblemDetails } from "./index.js";
import { DocumentSettingsResponse, TextStructuringResponse, DocumentStructuringResponse, } from "./document.js";
export function documentClient(options = {}) {
    return async (file, name, signal) => {
        const form = new FormData();
        form.set("file", file, name);
        const response = await (options.fetch ?? globalThis.fetch)(`${options.baseUrl ?? ""}/v2/document-structurings`, {
            method: "POST",
            signal,
            cache: "no-store",
            headers: {
                ...(options.client ? { "Source-Taster-Client": options.client } : {}),
                ...(options.credentials
                    ? { Authorization: `Bearer ${await options.credentials()}` }
                    : {}),
            },
            body: form,
        });
        const body = await response.json().catch(() => undefined);
        if (!response.ok)
            throw new ApiError(response.status, ProblemDetails.safeParse(body).data);
        return DocumentStructuringResponse.parse(body).data;
    };
}
export function documentSettingsClient(options = {}) {
    return async (signal) => {
        const response = await (options.fetch ?? globalThis.fetch)(`${options.baseUrl ?? ""}/v2/document-settings`, {
            signal,
            cache: "no-store",
            headers: {
                ...(options.client ? { "Source-Taster-Client": options.client } : {}),
                ...(options.credentials
                    ? { Authorization: `Bearer ${await options.credentials()}` }
                    : {}),
            },
        });
        const body = await response.json().catch(() => undefined);
        if (!response.ok)
            throw new ApiError(response.status, ProblemDetails.safeParse(body).data);
        return DocumentSettingsResponse.parse(body).data;
    };
}
export function textStructuringClient(options = {}) {
    return async (input, signal) => {
        const response = await (options.fetch ?? globalThis.fetch)(`${options.baseUrl ?? ""}/v2/structurings`, {
            method: "POST", signal, cache: "no-store",
            headers: { "content-type": "application/json", ...(options.client ? { "Source-Taster-Client": options.client } : {}), ...(options.credentials ? { Authorization: `Bearer ${await options.credentials()}` } : {}) },
            body: JSON.stringify(input),
        });
        const body = await response.json().catch(() => undefined);
        if (!response.ok)
            throw new ApiError(response.status, ProblemDetails.safeParse(body).data);
        return TextStructuringResponse.parse(body).data;
    };
}
