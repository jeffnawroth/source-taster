// SPDX-License-Identifier: AGPL-3.0-or-later
// The owned seam over the browser extension namespace. Panel code uses only
// these capabilities; no other module touches `browser` or `chrome`.
import type { PreferenceStorage } from "@source-taster/ui/preferences";
import type { PreferenceSyncConsent } from "@source-taster/ui/account-preferences";
import type { SelectionIntake } from "@source-taster/ui/check-workspace";
import { selectionPort, type SelectionPort } from "./selection-protocol.ts";
import {
  extensionGuestIdentityStorage,
  GuestIdentityError,
  type ExtensionLocalCapability,
} from "@source-taster/ui/guest-identity";

/** Mozilla's data collection types (Firefox built-in data consent). The
 * granted set can hold any of them, not only the one this extension requests. */
export type DataCollectionType =
  | "personallyIdentifyingInfo"
  | "healthInfo"
  | "financialAndPaymentInfo"
  | "authenticationInfo"
  | "personalCommunications"
  | "locationInfo"
  | "browsingActivity"
  | "websiteContent"
  | "websiteActivity"
  | "searchTerms"
  | "bookmarksInfo"
  | "technicalAndInteraction";
/** The Firefox data collection permission set. Chromium has no such key. */
interface DataCollectionPermissions {
  data_collection?: DataCollectionType[];
}
interface PermissionChange {
  addListener(listener: (change: DataCollectionPermissions) => void): void;
}
interface PermissionsNamespace {
  getAll(): Promise<DataCollectionPermissions>;
  request(request: { data_collection: DataCollectionType[] }): Promise<boolean>;
  onAdded: PermissionChange;
  onRemoved: PermissionChange;
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

const syncDataType = "technicalAndInteraction" satisfies DataCollectionType;

/** Firefox only: Account Preferences are "extension usage and settings data",
 * which Mozilla files under `technicalAndInteraction`, an optional-only data
 * collection type. Sync to the service runs only while it is granted. The
 * seam is usable at once and starts without a grant; the browser's answer to
 * `permissions.getAll()` arrives later and may never arrive, and the panel
 * does not wait for it. `request()` must run inside a user-activated handler,
 * so it calls the browser before any await. Revocation, also from the add-on
 * settings, is observed through `permissions.onRemoved`. */
export function firefoxPreferenceSyncConsent(
  api: Pick<ExtensionNamespace, "permissions">,
): PreferenceSyncConsent {
  const permissions = api.permissions;
  const listeners = new Set<() => void>();
  let granted = false;
  // Every event, grant and lookup takes a ticket; only the newest lookup counts.
  let ticket = 0;
  const set = (value: boolean) => {
    if (granted === value) return;
    granted = value;
    for (const listener of [...listeners]) listener();
  };
  const lookup = async () => {
    const mine = ++ticket;
    try {
      const all = await permissions?.getAll();
      if (mine === ticket) set(!!all?.data_collection?.includes(syncDataType));
    } catch {
      if (mine === ticket) set(false);
    }
  };
  const named = (change: DataCollectionPermissions) =>
    !!change.data_collection?.includes(syncDataType);
  // An event that does not name the type is reconciled with the browser's own
  // answer rather than trusted or ignored.
  const observe = (value: boolean) => (change: DataCollectionPermissions) => {
    if (!named(change)) return void lookup();
    ticket++;
    set(value);
  };
  permissions?.onAdded.addListener(observe(true));
  permissions?.onRemoved.addListener(observe(false));
  void lookup();
  return {
    requiresGrant: true,
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
            ticket++;
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
