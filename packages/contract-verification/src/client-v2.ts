// SPDX-License-Identifier: AGPL-3.0-or-later OR MIT
import {
  CheckResponse,
  CheckEvent,
  isFinalEvent,
  ProblemDetails,
  type SetManualOverrideRequest,
  type Check,
  type CreateCheckRequest,
  type SaveFieldsRequest,
  type RecheckRequest,
  type EditReferenceListRequest,
  type EditSelectionRequest,
  SelectionPreviewResponse,
  QuotaResponse,
  HistoryResponse,
} from "./v2.ts";
import {
  ApiError,
  createVerificationClient,
  watchContractEvents,
  type VerificationClientOptions,
  type WatchOptions,
} from "./client.ts";
import { ImportResponse, type LibraryInput } from "./import.ts";
export {
  ApiError,
  CheckStreamError,
  readSseFrames,
  type CredentialSupplier,
  type VerificationClientOptions,
} from "./client.ts";
export type WatchCheckOptions = WatchOptions<CheckEvent>;
export function verificationClient(options: VerificationClientOptions = {}) {
  const base = createVerificationClient<Check, CreateCheckRequest>(
    options,
    "/v2",
    CheckResponse,
  );
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
  const mutate = async (checkId: string, path: string, input: unknown) =>
    CheckResponse.parse(
      await send(`/${encodeURIComponent(checkId)}/${path}`, input),
    ).data;
  const headers = async () => ({
    ...(options.client ? { "Source-Taster-Client": options.client } : {}),
    ...(options.credentials
      ? { Authorization: `Bearer ${await options.credentials()}` }
      : {}),
  });
  async function historyRequest(path = "", method = "GET", body?: unknown) {
    const response = await (options.fetch ?? globalThis.fetch)(
      `${options.baseUrl ?? ""}/v2/history${path}`,
      {
        method,
        headers: {
          ...(await headers()),
          ...(body ? { "content-type": "application/json" } : {}),
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
      },
    );
    const result: unknown = await response.json().catch(() => undefined);
    if (!response.ok)
      throw new ApiError(
        response.status,
        ProblemDetails.safeParse(result).data,
      );
    return result;
  }
  return {
    ...base,
    getHistory: async () => HistoryResponse.parse(await historyRequest()).data,
    setHistory: async (enabled: boolean) =>
      HistoryResponse.parse(await historyRequest("", "PUT", { enabled })).data,
    deleteHistory: async (id: string) =>
      HistoryResponse.parse(
        await historyRequest(`/${encodeURIComponent(id)}`, "DELETE"),
      ).data,
    restartHistory: async (id: string, maxReferences?: number) =>
      CheckResponse.parse(
        await historyRequest(
          `/${encodeURIComponent(id)}/restart${maxReferences === undefined ? "" : `?maxReferences=${maxReferences}`}`,
          "POST",
        ),
      ).data,
    /** `maxReferences` starts only the first N References in input order (Quota choice). */
    createCheck: async (
      input: string | CreateCheckRequest,
      choice: { maxReferences?: number } = {},
    ) =>
      CheckResponse.parse(
        await send(
          choice.maxReferences === undefined
            ? ""
            : `?maxReferences=${choice.maxReferences}`,
          typeof input === "string" ? { text: input } : input,
        ),
      ).data,
    /** The acting Owner's Quota; `null` when no Quota applies. */
    getQuota: async () => {
      const response = await (options.fetch ?? globalThis.fetch)(
        `${options.baseUrl ?? ""}/v2/quota`,
        { headers: await headers() },
      );
      const body: unknown = await response.json().catch(() => undefined);
      if (!response.ok)
        throw new ApiError(
          response.status,
          ProblemDetails.safeParse(body).data,
        );
      return QuotaResponse.parse(body).data;
    },
    setManualOverride: (
      id: string,
      slot: number,
      input: SetManualOverrideRequest,
    ) => mutate(id, `references/${slot}/manual-override`, input),
    importLibrary: async (input: LibraryInput) => {
      const response = await (options.fetch ?? globalThis.fetch)(
        `${options.baseUrl ?? ""}/v2/imports`,
        {
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
        },
      );
      const body: unknown = await response.json().catch(() => undefined);
      if (!response.ok)
        throw new ApiError(
          response.status,
          ProblemDetails.safeParse(body).data,
        );
      return ImportResponse.parse(body).data;
    },
    editSelection: (checkId: string, input: EditSelectionRequest) =>
      mutate(checkId, "selection", input),
    previewSelection: async (checkId: string, input: EditSelectionRequest) =>
      SelectionPreviewResponse.parse(
        await send(`/${encodeURIComponent(checkId)}/selection/preview`, input),
      ).data,
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
