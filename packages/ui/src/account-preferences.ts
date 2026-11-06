// SPDX-License-Identifier: AGPL-3.0-or-later
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { GuestTokenError } from "@source-taster/contract-service/client";
import type {
  AccountPreferencesPatch,
  AccountSession,
} from "@source-taster/contract-service";
import type { SessionClient } from "./web-account-workspace.tsx";
import {
  forgetMirroredPreferences,
  isCitationStyle,
  mirrorSyncedPreferences,
  saveGuestPreferences,
  type Preferences,
  type PreferenceStorage,
} from "./preferences.ts";
import { setLocale } from "@source-taster/i18n/runtime";

/** The user's consent for Account Preferences to leave the device. Hosts with
 * no such requirement use `alwaysGranted`; Firefox supplies one backed by its
 * data collection permission. */
export interface PreferenceSyncConsent {
  /** Whether the host shows a control to obtain the grant. */
  requiresGrant: boolean;
  granted: () => boolean;
  /** Must be called from a user-activated handler, before any await. */
  request: () => Promise<boolean>;
  subscribe: (listener: () => void) => () => void;
}

const noSubscription = () => {};
/** The default consent: nothing to ask, so Preferences always sync. A single
 * instance, so subscriptions made through it are stable across renders. */
export const alwaysGranted: PreferenceSyncConsent = {
  requiresGrant: false,
  granted: () => true,
  request: () => Promise.resolve(true),
  subscribe: () => noSubscription,
};

/** One lifecycle for both hosts. Session secrets stay in the host transport.
 * Requests are fenced by session, read order and per-field local edit versions.
 * Writes serialize so transport latency cannot reverse this client's last write. */
export function useAccountPreferences(
  initial: { preferences: Preferences; citationStyleReset: boolean },
  storage: PreferenceStorage,
  client: SessionClient,
  session: AccountSession | null | undefined,
  expired: boolean,
  expire: () => void,
  /** Read again before every request. Without a grant, signed-in Preferences
   * stay local: nothing is read from or written to the service. */
  consent: PreferenceSyncConsent = alwaysGranted,
) {
  const syncAllowed = consent.granted;
  const open = useSyncExternalStore(consent.subscribe, consent.granted);
  const syncedAccount = useRef<string | null>(null);
  const [state, setState] = useState(initial);
  const [failure, setFailure] = useState(false);
  const [loadedAccount, setLoadedAccount] = useState<string | null>(null);
  const displayed = useRef(initial);
  const epoch = useRef(0);
  const versions = useRef({ language: 0, citationStyle: 0 });
  const readOrder = useRef(0);
  const writes = useRef(Promise.resolve());
  const previousAccount = useRef<string | null>(null);
  const current = useRef({ session, expired });
  // Mirror writes run in order, so a deletion's forget always lands last.
  const mirrorWrites = useRef(Promise.resolve());
  const mirrored = useRef(false);
  useEffect(() => {
    current.current = { session, expired };
  }, [session, expired]);
  function display(next: typeof initial) {
    displayed.current = next;
    // Where sync needs a grant, the device always holds what the user last saw
    // from the Account, so a grant withdrawn while no panel is open needs no event.
    const authority = current.current;
    if (authority.session && !authority.expired)
      mirrorWrites.current = mirrorWrites.current
        .then(() => mirrorSyncedPreferences(storage, consent, next.preferences))
        .then((wrote) => {
          if (wrote) mirrored.current = true;
        })
        .catch(() => {});
    void setLocale(next.preferences.language, { reload: false });
    document.documentElement.lang = next.preferences.language;
    setState(next);
  }
  function failed(error: unknown) {
    setFailure(true);
    if (
      error instanceof GuestTokenError &&
      (error.status === 401 || error.status === 403)
    ) {
      epoch.current++;
      expire();
    }
  }
  async function refresh() {
    if (!current.current.session || current.current.expired || !syncAllowed())
      return;
    const fence = epoch.current;
    const accountId = current.current.session.accountId;
    const order = ++readOrder.current;
    const edits = { ...versions.current };
    try {
      // A refocus never replaces an immediate local edit with a pre-write snapshot.
      await writes.current;
      if (fence !== epoch.current || !syncAllowed()) return;
      const saved = await client.preferences();
      if (
        fence !== epoch.current ||
        order !== readOrder.current ||
        !syncAllowed()
      )
        return;
      const next = { ...displayed.current.preferences };
      let reset = displayed.current.citationStyleReset;
      if (edits.language === versions.current.language)
        next.language = saved.language;
      if (edits.citationStyle === versions.current.citationStyle) {
        reset = !isCitationStyle(saved.citationStyle);
        next.citationStyle = isCitationStyle(saved.citationStyle)
          ? saved.citationStyle
          : "apa";
      }
      display({ preferences: next, citationStyleReset: reset });
      setFailure(false);
    } catch (error) {
      if (fence === epoch.current && order === readOrder.current) failed(error);
    } finally {
      if (fence === epoch.current && order === readOrder.current)
        setLoadedAccount(accountId);
    }
  }
  const sessionPending = session === undefined;
  useEffect(() => {
    const fence = ++epoch.current;
    writes.current = Promise.resolve();
    const accountId = !expired && session ? session.accountId : null;
    const withdrawn =
      !!accountId && !open && syncedAccount.current === accountId;
    syncedAccount.current = accountId && open ? accountId : null;
    if (accountId && !open) {
      // No grant: the displayed values stand and the service is not contacted.
      // A later grant re-runs this effect and reads the Account. When the grant
      // was withdrawn during this session, ADR-0023's session-end rule applies:
      // the last displayed values become the local ones.
      previousAccount.current = accountId;
      if (withdrawn)
        void saveGuestPreferences(storage, displayed.current.preferences);
      void Promise.resolve().then(() => {
        if (epoch.current === fence) {
          setLoadedAccount(accountId);
          setFailure(false);
        }
      });
    } else if (accountId) {
      previousAccount.current = accountId;
      void refresh();
    } else if ((session === null || expired) && previousAccount.current) {
      // ADR-0023: keep the last displayed values, never restore pre-sign-in Guest values.
      previousAccount.current = null;
      void saveGuestPreferences(storage, displayed.current.preferences);
      void Promise.resolve().then(() => {
        if (epoch.current === fence) {
          setLoadedAccount(null);
          setFailure(false);
        }
      });
    }
    return () => {
      epoch.current = fence + 1;
    };
    // Session identity/expiry is the authority boundary; ordinary renders are not.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.accountId, sessionPending, expired, client, storage, open]);
  useEffect(() => {
    const focus = () => {
      void refresh();
    };
    const visible = () => {
      if (document.visibilityState === "visible") focus();
    };
    window.addEventListener("focus", focus);
    document.addEventListener("visibilitychange", visible);
    return () => {
      window.removeEventListener("focus", focus);
      document.removeEventListener("visibilitychange", visible);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client]);
  /** #102 Account deletion: ADR-0023 deletes Preferences with the Account, so
   * unlike sign-out or expiry nothing is copied into the local Guest store and
   * pending reads/writes are fenced off. Displayed values stay in memory only.
   * A copy mirrored onto this device while sync was granted (#174) is
   * forgotten too; Guest values the mirror never touched stay as they were. */
  function forget() {
    previousAccount.current = null;
    epoch.current++;
    writes.current = Promise.resolve();
    mirrorWrites.current = mirrorWrites.current
      .then(async () => {
        if (!mirrored.current) return;
        mirrored.current = false;
        await forgetMirroredPreferences(storage);
      })
      .catch(() => {});
    setFailure(false);
  }
  function change(patch: AccountPreferencesPatch) {
    const next = { ...displayed.current.preferences, ...patch };
    display({
      preferences: next,
      citationStyleReset: patch.citationStyle
        ? false
        : displayed.current.citationStyleReset,
    });
    const authority = current.current;
    if (authority.session === null || authority.expired || !syncAllowed()) {
      void saveGuestPreferences(storage, next);
      return;
    }
    if (!authority.session || authority.expired) return;
    const fence = epoch.current;
    const edited = { ...versions.current };
    for (const field of ["language", "citationStyle"] as const) {
      if (patch[field] !== undefined) edited[field] = ++versions.current[field];
    }
    writes.current = writes.current.then(async () => {
      if (fence !== epoch.current) return;
      if (!syncAllowed()) {
        // Consent was withdrawn while this write waited: keep it on the device.
        void saveGuestPreferences(storage, displayed.current.preferences);
        return;
      }
      try {
        const saved = await client.updatePreferences(patch);
        if (fence !== epoch.current) return;
        const values = { ...displayed.current.preferences };
        let reset = displayed.current.citationStyleReset;
        if (
          patch.language !== undefined &&
          edited.language === versions.current.language
        )
          values.language = saved.language;
        if (
          patch.citationStyle !== undefined &&
          edited.citationStyle === versions.current.citationStyle
        ) {
          reset = !isCitationStyle(saved.citationStyle);
          values.citationStyle = isCitationStyle(saved.citationStyle)
            ? saved.citationStyle
            : "apa";
        }
        display({ preferences: values, citationStyleReset: reset });
        setFailure(false);
      } catch (error) {
        if (fence === epoch.current) failed(error);
      }
    });
  }
  return {
    ...state,
    change,
    refresh,
    forget,
    failure,
    loading:
      !!session && !expired && open && loadedAccount !== session.accountId,
  };
}
