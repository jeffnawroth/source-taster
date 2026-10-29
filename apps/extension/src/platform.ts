// SPDX-License-Identifier: AGPL-3.0-or-later
// The owned seam over the browser extension namespace. Panel code uses only
// these capabilities; no other module touches `browser` or `chrome`.
import type { PreferenceStorage } from "@source-taster/ui/preferences";
import {
  extensionGuestIdentityStorage,
  GuestIdentityError,
  type ExtensionLocalCapability,
} from "@source-taster/ui/guest-identity";

interface ExtensionNamespace {
  runtime: { id: string; getURL(path: string): string };
  storage: { local: ExtensionLocalCapability };
}
const identityLock = "source-taster-guest-id-v1";

/** Only the extension's own pages are trusted with extension storage. */
export function trustedExtensionPage(): ExtensionNamespace {
  const scope = globalThis as {
    browser?: ExtensionNamespace;
    chrome?: ExtensionNamespace;
  };
  const api = scope.browser ?? scope.chrome;
  if (
    !api?.runtime?.id ||
    !api.storage?.local ||
    `${location.origin}/` !== api.runtime.getURL("/")
  )
    throw new Error("The panel must run as a trusted extension page");
  return api;
}

/** Same failure policy as web: unavailable storage never blocks a Check. */
export function extensionPreferenceStorage(
  local: ExtensionLocalCapability,
): PreferenceStorage {
  return {
    read: async (key) => {
      try {
        return (await local.get(key))[key] ?? null;
      } catch {
        return null;
      }
    },
    write: async (key, value) => {
      try {
        await local.set({ [key]: value });
      } catch {
        // The open panel still applies the setting.
      }
    },
  };
}

/** Guest ID in extension-local storage, serialized by an extension-origin lock.
 * Missing locks or storage fail explicitly; there is no web or new-ID fallback. */
export function extensionGuestIdentity(
  local: ExtensionLocalCapability,
  locks: LockManager | undefined = navigator.locks,
) {
  return extensionGuestIdentityStorage(local, (operation) =>
    locks
      ? locks.request(identityLock, { mode: "exclusive" }, operation)
      : Promise.reject(
          new GuestIdentityError(
            "Guest identity persistence needs browser locks",
          ),
        ),
  );
}
