// SPDX-License-Identifier: AGPL-3.0-or-later
import { InvoiceControls } from "./invoices.tsx";
import type { InvoiceClient } from "@source-taster/contract-service/client";
import { DpaControls } from "./dpa.tsx";
import type { DpaClient } from "@source-taster/contract-service/client";
import {
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { X } from "lucide-react";
import { AccountPopoverCloseContext } from "./checking-top-bar.tsx";
import { User } from "./workspace-icons.tsx";
import {
  accountSessionClient,
  GuestTokenError,
} from "@source-taster/contract-service/client";
import type { AccountSession } from "@source-taster/contract-service";
import { m } from "@source-taster/i18n";
import {
  Meter,
  Button,
  Dialog,
  DialogHeading,
  Modal,
  IconButton,
  Form,
  TextFieldRoot,
  Label,
  Input,
} from "./primitives/index.ts";
import type { VerificationClientOptions } from "@source-taster/contract-verification/client";
import { CheckWorkspace, type SelectionIntake } from "./check-workspace.tsx";
import {
  alwaysGranted,
  useAccountPreferences,
  type PreferenceSyncConsent,
} from "./account-preferences.ts";
import {
  isInterfaceLanguage,
  isTheme,
  type Preferences,
  type PreferenceStorage,
} from "./preferences.ts";
import { guestCredentials, webGuestIdentityStorage } from "./guest-identity.ts";
import {
  AccountManagementLink,
  type SensitiveActions,
} from "./sensitive-account-actions.tsx";
export type SessionClient = Omit<
  ReturnType<typeof accountSessionClient>,
  "session" | "sensitive" | "dpa" | "invoices"
> & {
  session(): Promise<AccountSession | null>;
  subscribe?(changed: () => void): () => void;
  /** Present only where the host enabled #102; absent means no such controls. */
  sensitive?: SensitiveActions;
  dpa?: DpaClient;
  invoices?: InvoiceClient;
};
function errorMessage(error: unknown) {
  return error instanceof GuestTokenError && error.status === 429
    ? m.auth_limited()
    : error instanceof GuestTokenError && error.status === 401
      ? m.auth_invalid()
      : m.auth_unavailable();
}
/** Shared bundled email-code controls. Hosts choose the cookie or extension-local session transport. */
function SignInDialog({
  isOpen,
  onOpenChange,
  onPreferencesChange,
  client,
  changed,
  language,
  preferences,
  sendPreferences = alwaysGranted.granted,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onPreferencesChange: (patch: Partial<Preferences>) => void;
  client: SessionClient;
  changed: (account: AccountSession | null) => void;
  language: "de" | "en";
  preferences: Preferences;
  /** Read when the sign-in is confirmed, not at render: false while the host
   * lacks consent to send Preferences to the service. */
  sendPreferences?: () => boolean;
}) {
  const [email, setEmail] = useState(""),
    [code, setCode] = useState("");
  const [challenge, setChallenge] = useState<{
    challengeId: string;
    resendAt: number;
  } | null>(null);
  const [pending, setPending] = useState(false),
    [error, setError] = useState<string | null>(null),
    [now, setNow] = useState(Date.now);
  const [transactionClient, setTransactionClient] = useState(client);
  // A replacement transport starts a new transaction; hiding Modal does not.
  if (transactionClient !== client) {
    setTransactionClient(client);
    setEmail("");
    setCode("");
    setChallenge(null);
    setPending(false);
    setError(null);
  }
  // Fence completions by mounted identity/transport, never modal visibility.
  const lifecycle = useRef<object | null>(null);
  useLayoutEffect(() => {
    lifecycle.current = {};
    return () => {
      lifecycle.current = null;
    };
  }, [client]);
  useEffect(() => {
    if (!challenge) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [challenge]);
  async function send() {
    const requestLifecycle = lifecycle.current;
    setPending(true);
    setError(null);
    try {
      const issued = await client.challenge({ email, language });
      if (lifecycle.current !== requestLifecycle) return;
      setChallenge({
        challengeId: issued.challengeId,
        resendAt: Date.now() + issued.resendAfter * 1000,
      });
      setCode("");
    } catch (e) {
      if (lifecycle.current === requestLifecycle) setError(errorMessage(e));
    } finally {
      if (lifecycle.current === requestLifecycle) setPending(false);
    }
  }
  async function confirm() {
    if (!challenge) return;
    const requestLifecycle = lifecycle.current;
    setPending(true);
    setError(null);
    try {
      const session = await client.confirm({
        challengeId: challenge.challengeId,
        code,
        ...(sendPreferences()
          ? {
              preferences: {
                language: preferences.language,
                citationStyle: preferences.citationStyle,
                theme: preferences.theme,
              },
            }
          : {}),
      });
      if (lifecycle.current === requestLifecycle) changed(session);
    } catch (e) {
      if (lifecycle.current === requestLifecycle) setError(errorMessage(e));
    } finally {
      if (lifecycle.current === requestLifecycle) setPending(false);
    }
  }
  // The dialog owns the transaction outside Modal's transient children. Closing
  // only hides it; Cancel and an identity change deliberately discard it.
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <Dialog className="account-dialog" aria-label={m.auth_sign_in()}>
        <div className="account-dialog-header">
          <DialogHeading>{m.auth_sign_in()}</DialogHeading>
          <IconButton
            label={m.shell_close()}
            onPress={() => onOpenChange(false)}
          >
            <X aria-hidden="true" size={20} />
          </IconButton>
        </div>
        <div className="account-sign-in">
          <p>{m.auth_guest_notice()}</p>
          <Form
            className="account-sign-in-form"
            onSubmit={(event) => {
              event.preventDefault();
              void (challenge ? confirm() : send());
            }}
          >
            <TextFieldRoot
              type="email"
              isRequired
              value={email}
              onChange={setEmail}
              isDisabled={pending || !!challenge}
            >
              <Label>{m.auth_email()}</Label>
              <Input
                type="email"
                autoComplete="email"
                required
                maxLength={254}
                autoFocus
              />
            </TextFieldRoot>
            {challenge && (
              <>
                <p role="status">{m.auth_code_sent()}</p>
                <TextFieldRoot
                  isRequired
                  value={code}
                  onChange={setCode}
                  isDisabled={pending}
                >
                  <Label>{m.auth_code()}</Label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    pattern="[0-9]{6}"
                    minLength={6}
                    maxLength={6}
                    required
                    autoFocus
                  />
                </TextFieldRoot>
              </>
            )}
            <Button type="submit" variant="primary" isPending={pending}>
              {pending
                ? m.auth_pending()
                : challenge
                  ? m.auth_confirm()
                  : m.auth_send_code()}
            </Button>
            {challenge && (
              <Button
                type="button"
                {...(pending || now < challenge.resendAt
                  ? {
                      isDisabled: true as const,
                      disabledReason: m.auth_code_sent(),
                    }
                  : { isDisabled: false as const })}
                onPress={() => void send()}
              >
                {m.auth_resend()}
              </Button>
            )}
            <Button
              type="button"
              slot="close"
              {...(pending
                ? {
                    isDisabled: true as const,
                    disabledReason: m.auth_pending(),
                  }
                : { isDisabled: false as const })}
              onPress={() => {
                setChallenge(null);
                setCode("");
                setError(null);
              }}
            >
              {m.auth_cancel()}
            </Button>
          </Form>
          {error && (
            <p role="alert" className="mt-3 text-text">
              {error}
            </p>
          )}
        </div>
        <div className="workspace-preferences">
          <label className="workspace-select">
            {m.language_label()}
            <select
              value={preferences.language}
              onChange={(event) => {
                if (isInterfaceLanguage(event.target.value))
                  onPreferencesChange({ language: event.target.value });
              }}
            >
              <option value="de">{m.language_de()}</option>
              <option value="en">{m.language_en()}</option>
            </select>
          </label>
          <label className="workspace-select">
            {m.theme_label()}
            <select
              value={preferences.theme}
              onChange={(event) => {
                if (isTheme(event.target.value))
                  onPreferencesChange({ theme: event.target.value });
              }}
            >
              <option value="system">{m.theme_system()}</option>
              <option value="light">{m.theme_light()}</option>
              <option value="dark">{m.theme_dark()}</option>
            </select>
          </label>
        </div>
      </Dialog>
    </Modal>
  );
}

/** Sign-out is available in the compact entry and the owned Account dialog. */
function SignOutControls({
  client,
  changed,
  sessionEnded,
}: {
  client: SessionClient;
  changed: (account: AccountSession | null) => void;
  sessionEnded: () => void;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
    <div className="account-sign-out">
      <div className="account-entry-actions">
        <Button
          size="sm"
          variant="ghost"
          isPending={pending}
          onPress={() => void logout(false)}
        >
          {m.auth_here()}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          isPending={pending}
          onPress={() => void logout(true)}
        >
          {m.auth_everywhere()}
        </Button>
      </div>
      {error && <p role="alert">{error}</p>}
    </div>
  );
}

function AccountEntryAction({
  signedIn,
  onOpen,
}: {
  signedIn: boolean;
  onOpen: () => void;
}) {
  const close = useContext(AccountPopoverCloseContext);
  return (
    <Button
      variant={signedIn ? "ghost" : "primary"}
      size="sm"
      icon={signedIn ? undefined : <User />}
      onPress={() => {
        close();
        requestAnimationFrame(onOpen);
      }}
    >
      {signedIn ? m.shell_account() : m.auth_sign_in()}
    </Button>
  );
}
/** The visible, user-initiated control for the host's consent. The request is
 * the first thing the click handler does: no await, lock or state update
 * before it, so the browser still sees the user action. */
function PreferenceSyncControl({
  consent,
}: {
  consent: PreferenceSyncConsent;
}) {
  const granted = useSyncExternalStore(consent.subscribe, consent.granted);
  const [declined, setDeclined] = useState(false);
  return (
    <section
      aria-label={m.preferences_sync_title()}
      className="mb-8 rounded-xl border border-border-emphasis bg-surface p-4"
    >
      {granted ? (
        <p role="status">{m.preferences_sync_on()}</p>
      ) : (
        <>
          <p>{m.preferences_sync_off()}</p>
          <Button
            className="mt-3"
            onPress={() => {
              void consent.request().then((answer) => setDeclined(!answer));
            }}
          >
            {m.preferences_sync_allow()}
          </Button>
          {declined && <p role="status">{m.preferences_sync_declined()}</p>}
        </>
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
  brandMark,
}: {
  /** The host's brand mark URL for the top bar; the hosts ship it already. */
  brandMark?: string;

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
      brandMark={brandMark}
      accountUrl={
        sensitiveActions
          ? `${serviceUrl.replace(/\/$/, "")}/account`
          : undefined
      }
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
  accountUrl,
  preferenceSync = alwaysGranted,
  brandMark,
}: {
  /** The host's brand mark URL for the top bar; the hosts ship it already. */
  brandMark?: string;

  initial: { preferences: Preferences; citationStyleReset: boolean };
  preferenceStorage: PreferenceStorage;
  client: SessionClient;
  guest: { credentials(): Promise<string> };
  siteUrl?: string;
  transport?: Omit<VerificationClientOptions, "credentials">;
  selectionIntake?: SelectionIntake;
  upgradeUrl?: string;
  accountUrl?: string;
  /** Where the host needs consent before Preferences are synced. */
  preferenceSync?: PreferenceSyncConsent;
}) {
  const [session, setSession] = useState<AccountSession | null | undefined>(
      undefined,
    ),
    [error, setError] = useState(false),
    [generation, setGeneration] = useState(0);
  const [credentialFailure, setCredentialFailure] = useState(false);
  // A concluded DPA's link (#dpa/<id>) lands in the Account dialog that holds it.
  const [accountDialog, setAccountDialog] = useState<
    "sign-in" | "account" | null
  >(() =>
    typeof location !== "undefined" &&
    /^#dpa\/[0-9a-f-]{36}$/.test(location.hash)
      ? "account"
      : null,
  );
  const openSignIn = () => setAccountDialog("sign-in");
  const [sessionRevision, setSessionRevision] = useState(0);
  const accountPreferences = useAccountPreferences(
    initial,
    preferenceStorage,
    client,
    session,
    credentialFailure,
    () => setCredentialFailure(true),
    preferenceSync,
  );
  const preferences = accountPreferences.preferences;
  const localizedUpgradeUrl = upgradeUrl
    ? `${upgradeUrl}?language=${preferences.language}`
    : undefined;
  useEffect(
    () =>
      client.subscribe?.(() => {
        setAccountDialog(null);
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
  }, [client, session, guest, credentialFailure, transportOptions]);
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
    setAccountDialog(null);
    setSession(account);
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
    <>
      <CheckWorkspace
        key={generation}
        onSignIn={!session || credentialFailure ? openSignIn : undefined}
        accountHistory={!!session && !credentialFailure}
        accountLabel={session && !credentialFailure ? session.email : undefined}
        accountNotice={
          <>
            {accountPreferences.failure && (
              <p role="alert">
                {m.preferences_unavailable()}{" "}
                <button onClick={() => void accountPreferences.refresh()}>
                  {m.auth_retry()}
                </button>
              </p>
            )}
            {credentialFailure && <p role="alert">{m.auth_expired()}</p>}
          </>
        }
        initial={{ ...initial, preferences }}
        controlledPreferences={accountPreferences}
        preferenceStorage={preferenceStorage}
        transport={transport}
        siteUrl={siteUrl}
        brandMark={brandMark}
        selectionIntake={selectionIntake}
        upgradeUrl={localizedUpgradeUrl}
        onPreferencesChange={accountPreferences.change}
        accountControls={(language, quota, storage) => {
          const signedIn = !!session && !credentialFailure;
          const summary =
            quota &&
            m.quota_meter_summary({
              remaining: String(quota.remaining),
              granted: String(quota.granted),
            });
          return (
            <>
              {session && signedIn ? (
                <div className="account-entry-row">
                  <span className="account-avatar" aria-hidden="true">
                    {session.email[0]?.toLocaleUpperCase()}
                  </span>
                  <div>
                    <b className="account-entry-identity">{session.email}</b>
                  </div>
                </div>
              ) : (
                <>
                  <p>{m.auth_guest_notice()}</p>
                  <div className="account-entry-actions">
                    <AccountEntryAction signedIn={false} onOpen={openSignIn} />
                  </div>
                </>
              )}
              {signedIn && quota && (
                <div className="account-entry-row">
                  <span className="account-entry-eyebrow">
                    {m.account_plan()}
                  </span>
                  <span className="account-plan-tag">
                    {quota.grants.some((grant) => grant.kind === "pro")
                      ? m.account_plan_pro()
                      : m.account_plan_free()}
                  </span>
                </div>
              )}
              {quota && summary && (
                <Meter
                  label={m.quota_meter_label()}
                  valueLabel={summary}
                  aria-valuetext={summary}
                  warning={
                    quota.warning === "none"
                      ? undefined
                      : quota.warning === "exhausted"
                        ? m.quota_warning_exhausted()
                        : m.quota_warning_eighty()
                  }
                  value={quota.remaining}
                  maxValue={Math.max(1, quota.granted)}
                />
              )}
              {storage}
              {upgradeUrl && (
                <>
                  <p>{m.quota_upgrade()}</p>
                  <div className="account-entry-actions">
                    <a
                      className="account-entry-pill"
                      href={localizedUpgradeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {m.account_change_plan()}
                    </a>
                  </div>
                </>
              )}
              {signedIn && (
                <div className="account-entry-actions account-entry-more">
                  <AccountEntryAction
                    signedIn
                    onOpen={() => setAccountDialog("account")}
                  />
                  {accountUrl && (
                    <AccountManagementLink
                      url={accountUrl}
                      language={language}
                    />
                  )}
                </div>
              )}
              {signedIn && (
                <SignOutControls
                  client={client}
                  changed={changed}
                  sessionEnded={() => setCredentialFailure(true)}
                />
              )}
            </>
          );
        }}
      />
      <Modal
        key={`account-dialog:${generation}`}
        isOpen={accountDialog === "account" && !!session && !credentialFailure}
        onOpenChange={(open) => {
          if (!open) setAccountDialog(null);
        }}
      >
        <Dialog
          className="account-dialog"
          aria-label={
            accountDialog === "account" && session
              ? `${m.shell_account()}: ${session.email}`
              : m.auth_sign_in()
          }
        >
          {({ close }) => (
            <>
              <div className="account-dialog-header">
                <DialogHeading>
                  {accountDialog === "account"
                    ? m.shell_account()
                    : m.auth_sign_in()}
                </DialogHeading>
                <IconButton label={m.shell_close()} onPress={close}>
                  <X aria-hidden="true" size={20} />
                </IconButton>
              </div>
              {session && !credentialFailure && (
                <>
                  <div>
                    <b className="account-entry-identity">{session.email}</b>
                  </div>
                  {localizedUpgradeUrl && (
                    <a
                      href={localizedUpgradeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {m.commerce_open()}
                    </a>
                  )}
                  {accountUrl && (
                    <AccountManagementLink
                      url={accountUrl}
                      language={preferences.language}
                    />
                  )}
                  {client.dpa && (
                    <DpaControls
                      key={`${session.accountId}:${preferences.language}`}
                      client={client.dpa}
                      accountId={session.accountId}
                      language={preferences.language}
                    />
                  )}
                  {client.invoices && (
                    <InvoiceControls
                      key={session.accountId}
                      client={client.invoices}
                      language={preferences.language}
                    />
                  )}
                  {preferenceSync.requiresGrant && (
                    <PreferenceSyncControl consent={preferenceSync} />
                  )}
                  <SignOutControls
                    client={client}
                    changed={changed}
                    sessionEnded={() => setCredentialFailure(true)}
                  />
                </>
              )}
            </>
          )}
        </Dialog>
      </Modal>
      {(!session || credentialFailure) && (
        <SignInDialog
          key={`sign-in:${generation}`}
          isOpen={accountDialog === "sign-in"}
          onOpenChange={(open) => setAccountDialog(open ? "sign-in" : null)}
          onPreferencesChange={accountPreferences.change}
          language={preferences.language}
          preferences={preferences}
          client={client}
          sendPreferences={preferenceSync.granted}
          changed={changed}
        />
      )}
    </>
  );
}
