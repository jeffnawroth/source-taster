// SPDX-License-Identifier: AGPL-3.0-or-later OR MIT
import {
  CheckResponse,
  CheckEvent,
  isFinalEvent,
  ProblemDetails,
  type SaveFieldsRequest,
  type RecheckRequest,
  type EditReferenceListRequest,
  type EditSelectionRequest, type CreateCheckRequest, SelectionPreviewResponse,
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
  async function send(path: string, input: unknown) {
    const response = await (options.fetch ?? globalThis.fetch)(
      `${options.baseUrl ?? ""}/v2/checks${path}`,
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
    return body;
  }
  const mutate = async (id:string,path:string,input:unknown) => CheckResponse.parse(await send(`/${encodeURIComponent(id)}/${path}`,input)).data;
  return {
    ...base,
    createCheck: async (input:string | CreateCheckRequest) => CheckResponse.parse(await send("",typeof input === "string" ? {text:input} : input)).data,
    editSelection: (id:string,input:EditSelectionRequest) => mutate(id,"selection",input),
    previewSelection: async (id:string,input:EditSelectionRequest) => SelectionPreviewResponse.parse(await send(`/${encodeURIComponent(id)}/selection/preview`,input)).data,
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
