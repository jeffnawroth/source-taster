// SPDX-License-Identifier: AGPL-3.0-or-later
// The owned seam over the browser extension namespace. Panel code uses only
// these capabilities; no other module touches `browser` or `chrome`.
import type { PreferenceStorage } from "@source-taster/ui/preferences";
import type { PreferenceSyncConsent } from "@source-taster/ui/web-account-workspace";
import type { SelectionIntake } from "@source-taster/ui/check-workspace";
import { selectionPort, type SelectionPort } from "./selection-protocol.ts";
import {
  extensionGuestIdentityStorage,
  GuestIdentityError,
  type ExtensionLocalCapability,
} from "@source-taster/ui/guest-identity";

/** The Firefox data collection permission set. Chromium has no such key. */
interface DataCollectionPermissions {
  data_collection?: string[];
}
interface PermissionsNamespace {
  getAll(): Promise<DataCollectionPermissions>;
  request(request: { data_collection: string[] }): Promise<boolean>;
  onAdded: {
    addListener(listener: (granted: DataCollectionPermissions) => void): void;
    removeListener(
      listener: (granted: DataCollectionPermissions) => void,
    ): void;
  };
  onRemoved: {
    addListener(listener: (removed: DataCollectionPermissions) => void): void;
    removeListener(
      listener: (removed: DataCollectionPermissions) => void,
    ): void;
  };
}

interface ExtensionNamespace {
  permissions?: PermissionsNamespace;
  runtime: {
    id: string;
    getURL(path: string): string;
    connect(options: { name: string }): SelectionPort;
  };
  windows: { getCurrent(): Promise<{ id: number }> };
  storage: {
    local: ExtensionLocalCapability & { remove(key: string): Promise<void> };
    onChanged: {
      addListener(
        listener: (
          changes: Record<string, { newValue?: unknown }>,
          area: string,
        ) => void,
      ): void;
      removeListener(
        listener: (
          changes: Record<string, { newValue?: unknown }>,
          area: string,
        ) => void,
      ): void;
    };
  };
}

const syncDataType = "technicalAndInteraction";

/** Firefox only: Account Preferences are "extension usage and settings data",
 * which Mozilla files under `technicalAndInteraction`, an optional-only data
 * collection type. Sync to the service runs only while it is granted. The
 * grant is requested by `request()`, which must run inside a user-activated
 * handler, so it calls the browser before any await. Revocation, also from the
 * add-on settings, is observed through `permissions.onRemoved`. */
export async function firefoxPreferenceSyncConsent(
  api: Pick<ExtensionNamespace, "permissions">,
): Promise<PreferenceSyncConsent> {
  const permissions = api.permissions;
  const listeners = new Set<() => void>();
  let granted = false;
  let reads = 0;
  const set = (value: boolean) => {
    if (granted === value) return;
    granted = value;
    for (const listener of [...listeners]) listener();
  };
  const read = async () => {
    const read = ++reads;
    try {
      const all = await permissions?.getAll();
      // A newer event or read supersedes this answer.
      if (read === reads) set(!!all?.data_collection?.includes(syncDataType));
    } catch {
      if (read === reads) set(false);
    }
  };
  await read();
  const named = (change: DataCollectionPermissions) =>
    !!change.data_collection?.includes(syncDataType);
  // An event that does not name the type is reconciled with the browser's own
  // answer rather than trusted or ignored.
  permissions?.onAdded.addListener((change) => {
    if (!named(change)) return void read();
    reads++;
    set(true);
  });
  permissions?.onRemoved.addListener((change) => {
    if (!named(change)) return void read();
    reads++;
    set(false);
  });
  return {
    granted: () => granted,
    request() {
      // No await before the browser call: the user-input window is transient.
      let asked: Promise<boolean>;
      try {
        asked = permissions
          ? permissions.request({ data_collection: [syncDataType] })
          : Promise.resolve(false);
      } catch {
        asked = Promise.resolve(false);
      }
      return asked.then(
        (answer) => {
          if (answer) {
            reads++;
            set(true);
          }
          return answer;
        },
        () => false,
      );
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

/** A live trusted-panel connection, with no storage or web-page bridge. */
export function extensionSelectionIntake(
  api: ExtensionNamespace,
): SelectionIntake {
  return {
    subscribe(receive) {
      let active = true;
      let current: SelectionPort | undefined;
      let retry: ReturnType<typeof setTimeout> | undefined;
      const listener = (message: unknown) => {
        const selection = message as {
          text?: unknown;
          possiblyShortened?: unknown;
        } | null;
        if (
          typeof selection?.text === "string" &&
          typeof selection.possiblyShortened === "boolean"
        )
          receive({
            text: selection.text,
            possiblyShortened: selection.possiblyShortened,
          });
      };
      const reconnect = () => {
        if (active) retry = setTimeout(connect, 250);
      };
      const connect = () => {
        if (!active) return;
        try {
          const port = api.runtime.connect({ name: selectionPort });
          current = port;
          port.onMessage.addListener(listener);
          port.onDisconnect.addListener(() => {
            port.onMessage.removeListener(listener);
            if (current === port) {
              current = undefined;
              reconnect();
            }
          });
          void api.windows
            .getCurrent()
            .then(({ id }) => {
              if (active && current === port)
                port.postMessage({ windowId: id });
            })
            .catch(() => port.disconnect());
        } catch {
          reconnect();
        }
      };
      connect();
      return () => {
        active = false;
        clearTimeout(retry);
        current?.onMessage.removeListener(listener);
        current?.disconnect();
      };
    },
  };
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
