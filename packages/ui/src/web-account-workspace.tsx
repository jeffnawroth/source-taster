import { DpaControls } from "./dpa.tsx";
import type { DpaClient } from "@source-taster/contract-service/client";
// SPDX-License-Identifier: AGPL-3.0-or-later
import { useEffect, useMemo, useState } from "react";
import {
  accountSessionClient,
  GuestTokenError,
} from "@source-taster/contract-service/client";
import type { AccountSession } from "@source-taster/contract-service";
import { m } from "@source-taster/i18n";
import type { VerificationClientOptions } from "@source-taster/contract-verification/client";
import { CheckWorkspace, type SelectionIntake } from "./check-workspace.tsx";
import { useAccountPreferences } from "./account-preferences.ts";
import type { Preferences, PreferenceStorage } from "./preferences.ts";
import { guestCredentials, webGuestIdentityStorage } from "./guest-identity.ts";
import type { OwnerQuota } from "./quota.ts";
import {
  SensitiveAccountActions,
  type DeletionOutcome,
  type SensitiveActions,
} from "./sensitive-account-actions.tsx";
export type SessionClient = Omit<
  ReturnType<typeof accountSessionClient>,
  "session" | "sensitive" | "dpa"
> & {
  session(): Promise<AccountSession | null>;
  subscribe?(changed: () => void): () => void;
  /** Present only where the host enabled #102; absent means no such controls. */
  sensitive?: SensitiveActions;
  dpa?: DpaClient;
};
function errorMessage(error: unknown) {
  return error instanceof GuestTokenError && error.status === 429
    ? m.auth_limited()
    : error instanceof GuestTokenError && error.status === 401
      ? m.auth_invalid()
      : m.auth_unavailable();
}
/** Shared bundled email-code controls. Hosts choose the cookie or extension-local session transport. */
export function AccountControls({
  client,
  account,
  changed,
  language,
  preferences,
  sessionEnded,
  quota = null,
  updated,
  deleted,
}: {
  client: SessionClient;
  account: AccountSession | null;
  changed: (account: AccountSession | null) => void;
  language: "de" | "en";
  preferences: Preferences;
  sessionEnded: () => void;
  quota?: OwnerQuota | null;
  /** Same Account and Owner, new email: Checks stay mounted. */
  updated?: (account: AccountSession) => void;
  deleted?: (outcome: DeletionOutcome) => void;
}) {
  const [open, setOpen] = useState(false),
    [email, setEmail] = useState(""),
    [code, setCode] = useState("");
  const [challenge, setChallenge] = useState<{
    challengeId: string;
    resendAt: number;
  } | null>(null);
  const [pending, setPending] = useState(false),
    [error, setError] = useState<string | null>(null),
    [now, setNow] = useState(Date.now);
  useEffect(() => {
    if (!challenge) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [challenge]);
  async function send() {
    setPending(true);
    setError(null);
    try {
      const issued = await client.challenge({ email, language });
      setChallenge({
        challengeId: issued.challengeId,
        resendAt: Date.now() + issued.resendAfter * 1000,
      });
      setCode("");
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setPending(false);
    }
  }
  async function confirm() {
    if (!challenge) return;
    setPending(true);
    setError(null);
    try {
      const session = await client.confirm({
        challengeId: challenge.challengeId,
        code,
        preferences: {
          language: preferences.language,
          citationStyle: preferences.citationStyle,
        },
      });
      changed(session);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setPending(false);
    }
  }
  async function logout(everywhere: boolean) {
    setPending(true);
    setError(null);
    try {
      await client.signOut(everywhere);
      changed(null);
    } catch (e) {
      if (
        e instanceof GuestTokenError &&
        (e.status === 401 || e.status === 403)
      )
        sessionEnded();
      setError(errorMessage(e));
    } finally {
      setPending(false);
    }
  }
  return (
    <section
      aria-label={m.auth_sign_in()}
      className="mb-8 rounded-xl border border-slate-400 bg-white p-4"
    >
      {account ? (
        <>
          <p>{account.email}</p>
          <div className="mt-3 flex flex-wrap gap-3">
            <button
              className="rounded border border-slate-500 px-3 py-2"
              disabled={pending}
              onClick={() => void logout(false)}
            >
              {m.auth_here()}
            </button>
            <button
              className="rounded border border-slate-500 px-3 py-2"
              disabled={pending}
              onClick={() => void logout(true)}
            >
              {m.auth_everywhere()}
            </button>
          </div>
          {client.dpa && (
            <DpaControls
              key={`${account.accountId}:${language}`}
              client={client.dpa}
              accountId={account.accountId}
              language={language}
            />
          )}
          {client.sensitive && updated && deleted && (
            <SensitiveAccountActions
              actions={client.sensitive}
              account={account}
              language={language}
              quota={quota}
              emailChanged={updated}
              deleted={deleted}
            />
          )}
        </>
      ) : (
        <>
          <p>{m.auth_guest_notice()}</p>
          {!open ? (
            <button
              className="mt-3 rounded border border-slate-500 px-3 py-2"
              onClick={() => setOpen(true)}
            >
              {m.auth_sign_in()}
            </button>
          ) : (
            <form
              className="mt-4 flex max-w-md flex-col gap-3"
              onSubmit={(event) => {
                event.preventDefault();
                void (challenge ? confirm() : send());
              }}
            >
              <label>
                {m.auth_email()}
                <input
                  className="block w-full rounded border border-slate-500 p-2"
                  type="email"
                  autoComplete="email"
                  required
                  maxLength={254}
                  value={email}
                  disabled={pending || !!challenge}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </label>
              {challenge && (
                <>
                  <p role="status">{m.auth_code_sent()}</p>
                  <label>
                    {m.auth_code()}
                    <input
                      className="block w-full rounded border border-slate-500 p-2"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      pattern="[0-9]{6}"
                      minLength={6}
                      maxLength={6}
                      required
                      autoFocus
                      value={code}
                      onChange={(event) => setCode(event.target.value)}
                      disabled={pending}
                    />
                  </label>
                </>
              )}
              <button
                className="rounded bg-blue-700 px-3 py-2 text-white"
                disabled={pending}
              >
                {pending
                  ? m.auth_pending()
                  : challenge
                    ? m.auth_confirm()
                    : m.auth_send_code()}
              </button>
              {challenge && (
                <button
                  type="button"
                  className="rounded border border-slate-500 px-3 py-2"
                  disabled={pending || now < challenge.resendAt}
                  onClick={() => void send()}
                >
                  {m.auth_resend()}
                </button>
              )}
              <button
                type="button"
                className="rounded border border-slate-500 px-3 py-2"
                disabled={pending}
                onClick={() => {
                  setOpen(false);
                  setChallenge(null);
                  setCode("");
                  setError(null);
                }}
              >
                {m.auth_cancel()}
              </button>
            </form>
          )}
        </>
      )}
      {error && (
        <p role="alert" className="mt-3 text-red-800">
          {error}
        </p>
      )}
    </section>
  );
}
/** Web-only cookie composition. Access tokens stay in memory, and failed Account renewal never switches an operation to Guest. */
export function WebAccountWorkspace({
  initial,
  preferenceStorage,
  serviceUrl,
  siteUrl,
  sensitiveActions = false,
}: {
  initial: { preferences: Preferences; citationStyleReset: boolean };
  preferenceStorage: PreferenceStorage;
  serviceUrl: string;
  siteUrl?: string;
  /** Off until the private phase and both-program acceptance of #102 exist. */
  sensitiveActions?: boolean;
}) {
  const client = useMemo(() => {
    const { sensitive, ...wire } = accountSessionClient({
      baseUrl: serviceUrl,
    });
    return {
      ...wire,
      ...(sensitiveActions ? { sensitive } : {}),
      session: async () => {
        try {
          return await wire.session();
        } catch (error) {
          if (error instanceof GuestTokenError && error.status === 401)
            return null;
          throw error;
        }
      },
    };
  }, [serviceUrl, sensitiveActions]);
  const guest = useMemo(
    () =>
      guestCredentials({
        storage: webGuestIdentityStorage(),
        client: "web",
        serviceUrl,
      }),
    [serviceUrl],
  );
  return (
    <AccountWorkspace
      initial={initial}
      preferenceStorage={preferenceStorage}
      client={client}
      guest={guest}
      siteUrl={siteUrl}
      upgradeUrl={`${serviceUrl.replace(/\/$/, "")}/plan`}
    />
  );
}
/** Shared sign-in and Check lifecycle; identity changes remount all content. */
export function AccountWorkspace({
  initial,
  preferenceStorage,
  client,
  guest,
  siteUrl,
  transport: transportOptions = { client: "web/0.0.0" },
  selectionIntake,
  upgradeUrl,
}: {
  initial: { preferences: Preferences; citationStyleReset: boolean };
  preferenceStorage: PreferenceStorage;
  client: SessionClient;
  guest: { credentials(): Promise<string> };
  siteUrl?: string;
  transport?: Omit<VerificationClientOptions, "credentials">;
  selectionIntake?: SelectionIntake;
  upgradeUrl?: string;
}) {
  const [session, setSession] = useState<AccountSession | null | undefined>(
      undefined,
    ),
    [error, setError] = useState(false),
    [generation, setGeneration] = useState(0);
  const [credentialFailure, setCredentialFailure] = useState(false);
  const [sessionRevision, setSessionRevision] = useState(0);
  const accountPreferences = useAccountPreferences(
    initial,
    preferenceStorage,
    client,
    session,
    credentialFailure,
    () => setCredentialFailure(true),
  );
  const preferences = accountPreferences.preferences;
  const localizedUpgradeUrl = upgradeUrl
    ? `${upgradeUrl}?language=${preferences.language}`
    : undefined;
  // #102: set when the Account was removed here. `pending` keeps every request
  // from falling back to Guest while the service is still finishing deletion.
  const [removal, setRemoval] = useState<DeletionOutcome | null>(null);
  useEffect(
    () =>
      client.subscribe?.(() => {
        setSession(undefined);
        setError(false);
        setCredentialFailure(false);
        setGeneration((value) => value + 1);
        setSessionRevision((value) => value + 1);
      }),
    [client],
  );
  useEffect(() => {
    let alive = true;
    void client
      .session()
      .then((account) => {
        if (alive) setSession(account);
      })
      .catch((e) => {
        if (!alive) return;
        if (e instanceof GuestTokenError && e.status === 401) {
          setSession(null);
          setCredentialFailure(true);
        } else setError(true);
      });
    return () => {
      alive = false;
    };
  }, [client, sessionRevision]);
  const transport = useMemo(() => {
    let token: { accessToken: string; expiresAt: string } | undefined;
    let pending: Promise<string> | undefined;
    return {
      ...transportOptions,
      credentials: async () => {
        if (removal === "in-progress")
          throw new Error("account-deletion-in-progress");
        if (credentialFailure) throw new Error("session-revoked");
        if (session === undefined) throw new Error("session-unavailable");
        if (session === null) return guest.credentials();
        if (token && Date.parse(token.expiresAt) > Date.now() + 30000)
          return token.accessToken;
        return (pending ??= (async () => {
          try {
            token = await client.token();
            if (Date.parse(token.expiresAt) <= Date.now())
              throw new Error("expired-account-token");
            return token.accessToken;
          } catch (e) {
            token = undefined;
            if (
              e instanceof GuestTokenError &&
              (e.status === 401 || e.status === 403)
            )
              setCredentialFailure(true);
            throw e;
          } finally {
            pending = undefined;
          }
        })());
      },
    };
  }, [client, session, guest, credentialFailure, removal, transportOptions]);
  useEffect(() => {
    if (!session) return;
    let last = 0;
    const activity = () => {
      if (document.visibilityState !== "visible" || Date.now() - last < 60000)
        return;
      last = Date.now();
      void client.activity().catch((e) => {
        if (e instanceof GuestTokenError && e.status === 401)
          setCredentialFailure(true);
      });
    };
    document.addEventListener("pointerdown", activity);
    document.addEventListener("keydown", activity);
    return () => {
      document.removeEventListener("pointerdown", activity);
      document.removeEventListener("keydown", activity);
    };
  }, [client, session]);
  function changed(account: AccountSession | null) {
    setRemoval(null);
    setSession(account);
    setCredentialFailure(false);
    setGeneration((value) => value + 1);
  }
  /** Only the service's answer ends the Account here. No content or grant moves to Guest. */
  function removed(outcome: DeletionOutcome) {
    accountPreferences.forget();
    setRemoval(outcome);
    setSession(null);
    setCredentialFailure(false);
    setGeneration((value) => value + 1);
  }
  if (error)
    return (
      <main className="p-8">
        <h1>{m.app_title()}</h1>
        <p role="alert">{m.auth_unavailable()}</p>
        <button onClick={() => location.reload()}>{m.auth_retry()}</button>
      </main>
    );
  if (session === undefined || accountPreferences.loading)
    return (
      <main className="p-8">
        <h1>{m.app_title()}</h1>
        <p role="status">{m.auth_pending()}</p>
      </main>
    );
  return (
    <CheckWorkspace
      key={generation}
      accountHistory={!!session && !credentialFailure}
      initial={{ ...initial, preferences }}
      controlledPreferences={accountPreferences}
      preferenceStorage={preferenceStorage}
      transport={transport}
      siteUrl={siteUrl}
      selectionIntake={selectionIntake}
      upgradeUrl={localizedUpgradeUrl}
      deferQuotaRead={removal === "deleted"}
      onPreferencesChange={accountPreferences.change}
      accountControls={(language, quota) => (
        <>
          {upgradeUrl && (
            <a
              href={localizedUpgradeUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {m.commerce_open()}
            </a>
          )}
          {accountPreferences.failure && (
            <p role="alert">
              {m.preferences_unavailable()}{" "}
              <button onClick={() => void accountPreferences.refresh()}>
                {m.auth_retry()}
              </button>
            </p>
          )}
          {credentialFailure && <p role="alert">{m.auth_expired()}</p>}
          {removal && (
            <p role="status">
              {removal === "deleted"
                ? m.sensitive_deleted()
                : m.sensitive_deletion_in_progress()}
            </p>
          )}
          {removal === "in-progress" ? (
            <button onClick={() => location.reload()}>
              {m.sensitive_reload()}
            </button>
          ) : (
            <AccountControls
              key={session?.accountId ?? "guest"}
              language={language}
              preferences={preferences}
              sessionEnded={() => setCredentialFailure(true)}
              client={client}
              account={credentialFailure ? null : session}
              changed={changed}
              quota={quota}
              updated={setSession}
              deleted={removed}
            />
          )}
        </>
      )}
    />
  );
}
