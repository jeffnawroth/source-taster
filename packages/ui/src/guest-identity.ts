// SPDX-License-Identifier: AGPL-3.0-or-later
// Identity and renewal policy are implementation, outside the contract exception.
import {
  guestTokenClient,
  GuestTokenError,
} from "@source-taster/contract-service/client";
const identityKey = "source-taster-guest-id-v1";
const uuid =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export class GuestIdentityError extends Error {}
export interface GuestIdentityStorage {
  identity(): Promise<string>;
}
export type Exclusive = <T>(operation: () => Promise<T>) => Promise<T>;
function identityStore(
  read: () => Promise<unknown>,
  write: (value: string) => Promise<void>,
  exclusive: Exclusive,
): GuestIdentityStorage {
  let pending: Promise<string> | undefined;
  return {
    identity: () =>
      (pending ??= Promise.resolve()
        .then(() =>
          exclusive(async () => {
            const stored = await read();
            if (typeof stored === "string" && uuid.test(stored)) return stored;
            // Corrupt identity is not silently replaced: it may bind existing content.
            if (stored !== undefined && stored !== null)
              throw new GuestIdentityError("Guest identity storage is invalid");
            const id = crypto.randomUUID();
            await write(id);
            return id;
          }),
        )
        .catch((error) => {
          pending = undefined;
          throw error instanceof GuestIdentityError
            ? error
            : new GuestIdentityError("Guest identity storage is unavailable");
        })),
  };
}
/** Uses origin-local storage and the browser's cross-tab lock. Storage/lock
 * failure is explicit; never fall back to a newly generated identity per fetch. */
export function webGuestIdentityStorage(
  storage?: Storage,
  locks?: LockManager,
): GuestIdentityStorage {
  return identityStore(
    () =>
      Promise.resolve(
        (storage ?? globalThis.localStorage).getItem(identityKey),
      ),
    (id) => {
      (storage ?? globalThis.localStorage).setItem(identityKey, id);
      return Promise.resolve();
    },
    (operation) => {
      const manager = locks ?? globalThis.navigator?.locks;
      if (!manager)
        return Promise.reject(
          new GuestIdentityError(
            "Guest identity persistence needs browser locks",
          ),
        );
      return manager.request(identityKey, operation);
    },
  );
}
/** Actual browser.storage.local API shape. Only a trusted extension UI may
 * inject this capability and an extension-origin exclusive lock; never sync,
 * page messaging, Preferences or a general credential-bearing fetch bridge.
 * #92 owns manifest/access restrictions and native panel composition. */
export interface ExtensionLocalCapability {
  get(key: string): Promise<Record<string, unknown>>;
  set(values: Record<string, unknown>): Promise<void>;
}
export function extensionGuestIdentityStorage(
  local: ExtensionLocalCapability,
  exclusive: Exclusive,
): GuestIdentityStorage {
  return identityStore(
    async () => (await local.get(identityKey))[identityKey],
    (id) => local.set({ [identityKey]: id }),
    exclusive,
  );
}
export function guestCredentials(options: {
  storage: GuestIdentityStorage;
  client: "web" | "extension";
  serviceUrl: string;
  now?: () => number;
  fetch?: typeof fetch;
}) {
  const now = options.now ?? Date.now;
  const issue = guestTokenClient({
    baseUrl: options.serviceUrl,
    fetch: options.fetch,
  });
  let token: { value: string; expiresAt: number } | undefined;
  let flight: Promise<string> | undefined;
  let denied: GuestTokenError | undefined;
  return {
    credentials: async (): Promise<string> => {
      if (denied) throw denied;
      if (token && token.expiresAt - now() > 30_000) return token.value;
      if (flight) return flight;
      flight = (async () => {
        const guestId = await options.storage.identity();
        try {
          const issued = await issue({ guestId, client: options.client });
          const expiresAt = Date.parse(issued.expiresAt);
          if (expiresAt <= now())
            throw new Error("Expired Guest token response");
          token = { value: issued.accessToken, expiresAt };
          return token.value;
        } catch (error) {
          token = undefined;
          if (error instanceof GuestTokenError && error.status === 403)
            denied = error;
          throw error;
        }
      })().finally(() => {
        flight = undefined;
      });
      return flight;
    },
  };
}
