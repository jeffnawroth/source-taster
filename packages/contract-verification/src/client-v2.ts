// SPDX-License-Identifier: AGPL-3.0-or-later OR MIT
import {
  CheckResponse,
  CheckEvent,
  isFinalEvent,
  type Check,
  type CreateCheckRequest,
} from "./v2.ts";
import {
  createVerificationClient,
  watchContractEvents,
  type VerificationClientOptions,
  type WatchOptions,
} from "./client.ts";
import { ImportResponse, type LibraryInput } from "./import.ts";
import { ApiError } from "./client.ts";
import { ProblemDetails } from "./index.ts";
export {
  ApiError,
  CheckStreamError,
  readSseFrames,
  type CredentialSupplier,
  type VerificationClientOptions,
} from "./client.ts";
export type WatchCheckOptions = WatchOptions<CheckEvent>;
export function verificationClient(options: VerificationClientOptions = {}) {
  return {
    ...createVerificationClient<Check, CreateCheckRequest>(
      options,
      "/v2",
      CheckResponse,
    ),
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
  };
}
export function watchCheckEvents(checkId: string, options: WatchCheckOptions) {
  return watchContractEvents(checkId, options, "/v2", CheckEvent, isFinalEvent);
}
