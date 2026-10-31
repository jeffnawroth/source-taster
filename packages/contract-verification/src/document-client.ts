// SPDX-License-Identifier: AGPL-3.0-or-later OR MIT
import { ApiError, type VerificationClientOptions } from "./client.ts";
import { ProblemDetails } from "./index.ts";
import {
  DocumentSettingsResponse,
  TextStructuringResponse, type TextStructuringRequest,
  DocumentStructuringResponse,
} from "./document.ts";
export function documentClient(options: VerificationClientOptions = {}) {
  return async (file: Blob, name: string, signal?: AbortSignal) => {
    const form = new FormData();
    form.set("file", file, name);
    const response = await (options.fetch ?? globalThis.fetch)(
      `${options.baseUrl ?? ""}/v2/document-structurings`,
      {
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
      },
    );
    const body: unknown = await response.json().catch(() => undefined);
    if (!response.ok)
      throw new ApiError(response.status, ProblemDetails.safeParse(body).data);
    return DocumentStructuringResponse.parse(body).data;
  };
}

export function documentSettingsClient(
  options: VerificationClientOptions = {},
) {
  return async (signal?: AbortSignal) => {
    const response = await (options.fetch ?? globalThis.fetch)(
      `${options.baseUrl ?? ""}/v2/document-settings`,
      {
        signal,
        cache: "no-store",
        headers: {
          ...(options.client ? { "Source-Taster-Client": options.client } : {}),
          ...(options.credentials
            ? { Authorization: `Bearer ${await options.credentials()}` }
            : {}),
        },
      },
    );
    const body: unknown = await response.json().catch(() => undefined);
    if (!response.ok)
      throw new ApiError(response.status, ProblemDetails.safeParse(body).data);
    return DocumentSettingsResponse.parse(body).data;
  };
}

export function textStructuringClient(options: VerificationClientOptions = {}) {
  return async (input: TextStructuringRequest, signal?:AbortSignal) => {
    const response = await (options.fetch ?? globalThis.fetch)(`${options.baseUrl ?? ""}/v2/structurings`, {
      method:"POST",signal,cache:"no-store",
      headers:{"content-type":"application/json",...(options.client ? {"Source-Taster-Client":options.client}:{}),...(options.credentials ? {Authorization:`Bearer ${await options.credentials()}`}:{})},
      body:JSON.stringify(input),
    });
    const body:unknown = await response.json().catch(() => undefined);
    if (!response.ok) throw new ApiError(response.status,ProblemDetails.safeParse(body).data);
    return TextStructuringResponse.parse(body).data;
  };
}
