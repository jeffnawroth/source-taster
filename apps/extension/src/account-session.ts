// SPDX-License-Identifier: AGPL-3.0-or-later
import {
  extensionSessionClient,
  GuestTokenError,
} from "@source-taster/contract-service/client";
import { ExtensionCredential } from "@source-taster/contract-service";
import type { SessionClient } from "@source-taster/ui/web-account-workspace";
import type { ExtensionLocalCapability } from "@source-taster/ui/guest-identity";

const sessionKey = "source-taster-extension-session-v1";
/** Trusted panel only. No sync/page storage, background proxy or Check content.
 * Cross-panel mutations and requests serialize on the extension-origin lock. */
export function extensionAccountSession(
  serviceUrl: string,
  local: ExtensionLocalCapability & { remove(key: string): Promise<void> },
  changes: {
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
  },
  locks: LockManager = navigator.locks,
): SessionClient {
  const wire = extensionSessionClient({ baseUrl: serviceUrl });
  let observed: unknown;
  let transaction: { challengeId: string; credential: string } | undefined;
  const exclusive = <T>(operation: () => Promise<T>) => {
    if (!locks) return Promise.reject(new Error("session-storage-unavailable"));
    return locks.request(sessionKey, operation);
  };
  async function read() {
    const value = (await local.get(sessionKey))[sessionKey];
    return value === undefined ? undefined : ExtensionCredential.parse(value);
  }
  async function authenticated<T>(call: (credential: string) => Promise<T>) {
    return exclusive(async () => {
      const credential = await read();
      if (!credential || credential !== observed)
        throw new GuestTokenError(401);
      return call(credential);
    });
  }
  return {
    subscribe: (changed) => {
      const listener = (
        values: Record<string, { newValue?: unknown }>,
        area: string,
      ) => {
        if (
          area === "local" &&
          sessionKey in values &&
          values[sessionKey]?.newValue !== observed
        ) {
          observed = values[sessionKey]?.newValue;
          changed();
        }
      };
      changes.addListener(listener);
      return () => changes.removeListener(listener);
    },
    session: () =>
      exclusive(async () => {
        const credential = await read();
        observed = credential;
        return credential ? wire.session(credential) : null;
      }),
    challenge: async (input) => {
      transaction = undefined;
      const issued = await wire.challenge(input);
      transaction = {
        challengeId: issued.challengeId,
        credential: issued.transactionCredential,
      };
      return issued;
    },
    confirm: (input) =>
      exclusive(async () => {
        if (!transaction || transaction.challengeId !== input.challengeId)
          throw new GuestTokenError(401);
        const confirmed = await wire.confirm({
          ...input,
          transactionCredential: transaction.credential,
        });
        transaction = undefined;
        observed = confirmed.sessionCredential;
        try {
          await local.set({ [sessionKey]: confirmed.sessionCredential });
        } catch (error) {
          // Confirmation without durable trusted storage is not a successful sign-in.
          // Best-effort revoke the orphan; never expose an authenticated workspace.
          await wire
            .signOut(confirmed.sessionCredential, false)
            .catch(() => undefined);
          throw error;
        }
        return confirmed.session;
      }),
    token: () => authenticated(wire.token),
    activity: () => authenticated(wire.activity),
    signOut: (everywhere) =>
      authenticated(async (credential) => {
        const result = await wire.signOut(credential, everywhere);
        observed = undefined;
        await local.remove(sessionKey);
        return result;
      }),
  };
}
