// SPDX-License-Identifier: AGPL-3.0-or-later OR MIT
import {
  CheckResponse,
  CheckEvent,
  isFinalEvent,
  ProblemDetails,
  type SaveFieldsRequest,
  type RecheckRequest,
  type EditReferenceListRequest,
} from "./v2.ts";
import {
  ApiError,
  createVerificationClient,
  watchContractEvents,
  type VerificationClientOptions,
  type WatchOptions,
} from "./client.ts";
export {
  ApiError,
  CheckStreamError,
  readSseFrames,
  type CredentialSupplier,
  type VerificationClientOptions,
} from "./client.ts";
export type WatchCheckOptions = WatchOptions<CheckEvent>;
export function verificationClient(options: VerificationClientOptions = {}) {
  const base = createVerificationClient(options, "/v2", CheckResponse);
  async function mutate(checkId: string, path: string, input: unknown) {
    const response = await (options.fetch ?? globalThis.fetch)(
      `${options.baseUrl ?? ""}/v2/checks/${encodeURIComponent(checkId)}/${path}`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(options.client ? { "Source-Taster-Client": options.client } : {}),
          ...(options.credentials
            ? { Authorization: `Bearer ${await options.credentials()}` }
            : {}),
        },
        body: JSON.stringify(input),
      },
    );
    const body: unknown = await response.json().catch(() => undefined);
    if (!response.ok)
      throw new ApiError(response.status, ProblemDetails.safeParse(body).data);
    return CheckResponse.parse(body).data;
  }
  return {
    ...base,
    saveFields: (id: string, slot: number, input: SaveFieldsRequest) =>
      mutate(id, `references/${slot}/revisions`, input),
    recheckReference: (id: string, slot: number, input: RecheckRequest) =>
      mutate(id, `references/${slot}/recheck`, input),
    editReferenceList: (id: string, input: EditReferenceListRequest) =>
      mutate(id, "references", input),
  };
}
export function watchCheckEvents(checkId: string, options: WatchCheckOptions) {
  return watchContractEvents(checkId, options, "/v2", CheckEvent, isFinalEvent);
}
