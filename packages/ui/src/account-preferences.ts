// SPDX-License-Identifier: AGPL-3.0-or-later
import { useEffect, useRef, useState } from "react";
import { GuestTokenError } from "@source-taster/contract-service/client";
import type {
  AccountPreferencesPatch,
  AccountSession,
} from "@source-taster/contract-service";
import type { SessionClient } from "./web-account-workspace.tsx";
import {
  isCitationStyle,
  saveGuestPreferences,
  type Preferences,
  type PreferenceStorage,
} from "./preferences.ts";
import { setLocale } from "@source-taster/i18n/runtime";

/** A host that needs the user's consent before Account Preferences leave the
 * device (Firefox data collection permissions). Hosts without one pass none. */
export interface PreferenceSyncConsent {
  granted: () => boolean;
  /** Must be called from a user-activated handler, before any await. */
  request: () => Promise<boolean>;
  subscribe: (listener: () => void) => () => void;
}

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
  /** Live answer, read again before every request. Without consent, signed-in
   * Preferences stay local: nothing is read from or written to the service. */
  syncAllowed: () => boolean = () => true,
) {
  const open = syncAllowed();
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
  useEffect(() => {
    current.current = { session, expired };
  }, [session, expired]);
  function display(next: typeof initial) {
    displayed.current = next;
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
  useEffect(() => {
    const fence = ++epoch.current;
    writes.current = Promise.resolve();
    const accountId = !expired && session ? session.accountId : null;
    if (accountId && !open) {
      // No consent yet: the displayed local values stand and the service is
      // not contacted. A later grant re-runs this effect and reads the Account.
      previousAccount.current = accountId;
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
  }, [
    session?.accountId,
    session === undefined,
    expired,
    client,
    storage,
    open,
  ]);
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
   * pending reads/writes are fenced off. Displayed values stay in memory only. */
  function forget() {
    previousAccount.current = null;
    epoch.current++;
    writes.current = Promise.resolve();
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
