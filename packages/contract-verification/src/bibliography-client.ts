// SPDX-License-Identifier: AGPL-3.0-or-later OR MIT
import {
  BibliographyResponse,
  type BibliographyRequest,
} from "./bibliography.ts";
import { ApiError, type VerificationClientOptions } from "./client.ts";
import { ProblemDetails } from "./index.ts";
export function bibliographyClient(options: VerificationClientOptions = {}) {
  return async (checkId: string, request: BibliographyRequest) => {
    const response = await (options.fetch ?? globalThis.fetch)(
      `${options.baseUrl ?? ""}/v2/checks/${encodeURIComponent(checkId)}/bibliography`,
      {
        method: "POST",
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
    const body: unknown = await response.json().catch(() => undefined);
    if (!response.ok)
      throw new ApiError(response.status, ProblemDetails.safeParse(body).data);
    return BibliographyResponse.parse(body).data;
  };
}
