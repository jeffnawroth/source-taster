// SPDX-License-Identifier: AGPL-3.0-or-later OR MIT
import { type ExportRequest } from "./export.ts";
import { ApiError, type VerificationClientOptions } from "./client.ts";
import { ProblemDetails } from "./index.ts";
export function exportClient(options: VerificationClientOptions = {}) {
  return async (
    checkId: string,
    request: ExportRequest,
    signal?: AbortSignal,
  ) => {
    const response = await (options.fetch ?? globalThis.fetch)(
      `${options.baseUrl ?? ""}/v2/checks/${encodeURIComponent(checkId)}/export`,
      {
        method: "POST",
        signal,
        cache: "no-store",
        headers: {
          "content-type": "application/json",
          ...(options.client ? { "Source-Taster-Client": options.client } : {}),
          ...(options.credentials
            ? { Authorization: `Bearer ${await options.credentials()}` }
            : {}),
        },
        body: JSON.stringify(request),
      },
    );
    if (!response.ok) {
      const body: unknown = await response.json().catch(() => undefined);
      throw new ApiError(response.status, ProblemDetails.safeParse(body).data);
    }
    return {
      blob: await response.blob(),
      filename: `source-taster-references.${request.format === "csl-json" ? "json" : request.format === "imported-format" && response.headers.get("content-type")?.startsWith("application/x-research-info-systems") ? "ris" : "bib"}`,
    };
  };
}
