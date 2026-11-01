// SPDX-License-Identifier: AGPL-3.0-or-later OR MIT
import { ApiError, type VerificationClientOptions } from "./client.ts";
import { ProblemDetails } from "./index.ts";
import { ReportResponse, type ReportRequest } from "./report.ts";

export function reportClient(options: VerificationClientOptions = {}) {
  const send = async (
    path: string,
    init: { method: string; body?: unknown; signal?: AbortSignal },
  ) => {
    const response = await (options.fetch ?? globalThis.fetch)(
      `${options.baseUrl ?? ""}${path}`,
      {
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
      },
    );
    if (!response.ok) {
      const body: unknown = await response.json().catch(() => undefined);
      throw new ApiError(response.status, ProblemDetails.safeParse(body).data);
    }
    return response;
  };
  const base = (checkId: string) =>
    `/v2/checks/${encodeURIComponent(checkId)}/reports`;
  const status = async (response: Response) =>
    ReportResponse.parse(await response.json()).data;
  return {
    create: async (
      checkId: string,
      request: ReportRequest,
      signal?: AbortSignal,
    ) =>
      status(
        await send(base(checkId), { method: "POST", body: request, signal }),
      ),
    status: async (checkId: string, reportId: string, signal?: AbortSignal) =>
      status(
        await send(`${base(checkId)}/${encodeURIComponent(reportId)}`, {
          method: "GET",
          signal,
        }),
      ),
    cancel: async (checkId: string, reportId: string, signal?: AbortSignal) =>
      status(
        await send(`${base(checkId)}/${encodeURIComponent(reportId)}`, {
          method: "DELETE",
          signal,
        }),
      ),
    download: async (
      checkId: string,
      reportId: string,
      signal?: AbortSignal,
    ) => {
      const response = await send(
        `${base(checkId)}/${encodeURIComponent(reportId)}/file`,
        { method: "GET", signal },
      );
      return {
        blob: await response.blob(),
        filename: "source-taster-report.pdf",
      };
    },
  };
}
