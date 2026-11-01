// SPDX-License-Identifier: AGPL-3.0-or-later OR MIT
import { ApiError } from "./client.js";
import { ProblemDetails } from "./index.js";
import { ReportResponse } from "./report.js";
export function reportClient(options = {}) {
    const send = async (path, init) => {
        const response = await (options.fetch ?? globalThis.fetch)(`${options.baseUrl ?? ""}${path}`, {
            method: init.method,
            signal: init.signal,
            cache: "no-store",
            headers: {
                ...(init.body ? { "content-type": "application/json" } : {}),
                ...(options.client ? { "Source-Taster-Client": options.client } : {}),
                ...(options.credentials
                    ? { Authorization: `Bearer ${await options.credentials()}` }
                    : {}),
            },
            body: init.body ? JSON.stringify(init.body) : undefined,
        });
        if (!response.ok) {
            const body = await response.json().catch(() => undefined);
            throw new ApiError(response.status, ProblemDetails.safeParse(body).data);
        }
        return response;
    };
    const base = (checkId) => `/v2/checks/${encodeURIComponent(checkId)}/reports`;
    const status = async (response) => ReportResponse.parse(await response.json()).data;
    return {
        create: async (checkId, request, signal) => status(await send(base(checkId), { method: "POST", body: request, signal })),
        status: async (checkId, reportId, signal) => status(await send(`${base(checkId)}/${encodeURIComponent(reportId)}`, {
            method: "GET",
            signal,
        })),
        cancel: async (checkId, reportId, signal) => status(await send(`${base(checkId)}/${encodeURIComponent(reportId)}`, {
            method: "DELETE",
            signal,
        })),
        download: async (checkId, reportId, signal) => {
            const response = await send(`${base(checkId)}/${encodeURIComponent(reportId)}/file`, { method: "GET", signal });
            return {
                blob: await response.blob(),
                filename: "source-taster-report.pdf",
            };
        },
    };
}
