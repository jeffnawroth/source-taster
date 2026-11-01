// SPDX-License-Identifier: AGPL-3.0-or-later
// #102: email change and Account deletion behind fresh email-code proof. The UI
// only drives and explains the flow. Proof, its five-minute window, session
// revocation and the Owner tombstone are server facts; a UI confirmation proves
// none of them, and a failed call never changes local Account state.
import { useEffect, useState } from "react";
import {
  sensitiveFailure,
  type SensitiveFailure,
  type accountSessionClient,
} from "@source-taster/contract-service/client";
import type {
  AccountSession,
  SensitiveAction,
} from "@source-taster/contract-service";
import { m } from "@source-taster/i18n";
import type { OwnerQuota } from "./quota.ts";

export type SensitiveActions = ReturnType<
  typeof accountSessionClient
>["sensitive"];
/** `deleted` and `in-progress` are the two outcomes in which this client no longer holds an Account. */
export type DeletionOutcome = "deleted" | "in-progress";

type Step =
  | { kind: "idle" }
  | { kind: "proof"; action: SensitiveAction }
  | { kind: "form"; action: SensitiveAction; expiresAt: number };

function failureMessage(failure: SensitiveFailure, action: SensitiveAction) {
  switch (failure) {
    case "proof-required":
      return m.sensitive_proof_required();
    case "proof-invalid":
      return m.sensitive_proof_invalid();
    case "proof-exhausted":
      return m.sensitive_proof_exhausted();
    case "email-code-invalid":
      return m.sensitive_new_email_invalid();
    case "rate-limited":
      return m.sensitive_rate_limited();
    case "session-ended":
      return m.auth_expired();
    case "unavailable":
      return m.sensitive_unavailable();
    case "temporarily-unavailable":
      return action === "account-deletion"
        ? m.sensitive_deletion_failed()
        : m.sensitive_temporarily_unavailable();
    default:
      return action === "account-deletion"
        ? m.sensitive_deletion_failed()
        : m.sensitive_failed();
  }
}
const time = (value: number, language: "de" | "en") =>
  new Intl.DateTimeFormat(language, { timeStyle: "medium" }).format(value);
const field = "block w-full rounded border border-slate-500 p-2";
const secondary = "rounded border border-slate-500 px-3 py-2";

export function SensitiveAccountActions({
  actions,
  account,
  language,
  quota,
  emailChanged,
  deleted,
}: {
  actions: SensitiveActions;
  account: AccountSession;
  language: "de" | "en";
  quota: OwnerQuota | null;
  emailChanged: (account: AccountSession) => void;
  deleted: (outcome: DeletionOutcome) => void;
}) {
  const [step, setStep] = useState<Step>({ kind: "idle" });
  const [challenge, setChallenge] = useState<{
    id: string;
    resendAt: number;
  } | null>(null);
  const [newEmail, setNewEmail] = useState("");
  const [replacement, setReplacement] = useState<{
    id: string;
    resendAt: number;
  } | null>(null);
  const [code, setCode] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const [now, setNow] = useState(Date.now);
  const running = step.kind !== "idle";
  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [running]);
  // The window is displayed here but enforced by the service on every call.
  const expiresAt = step.kind === "form" ? step.expiresAt : undefined;
  const action = step.kind === "form" ? step.action : undefined;
  useEffect(() => {
    if (expiresAt === undefined || action === undefined) return;
    const timer = setTimeout(
      () => {
        reset();
        setStep({ kind: "proof", action });
        setError(m.sensitive_proof_expired());
      },
      Math.max(0, expiresAt - Date.now()),
    );
    return () => clearTimeout(timer);
  }, [expiresAt, action]);
  function reset() {
    setChallenge(null);
    setReplacement(null);
    setNewEmail("");
    setCode("");
    setAcknowledged(false);
    setError(null);
  }
  function close() {
    reset();
    setStep({ kind: "idle" });
  }
  function begin(action: SensitiveAction) {
    reset();
    setNotice(null);
    setStep({ kind: "proof", action });
  }
  async function attempt(
    action: SensitiveAction,
    operation: () => Promise<void>,
  ) {
    setPending(true);
    setError(null);
    try {
      await operation();
    } catch (e) {
      const failure = sensitiveFailure(e);
      if (failure === "unavailable") setUnavailable(true);
      // A stale or missing proof sends the user back to proving, keeping nothing.
      if (failure === "proof-required") {
        reset();
        setStep({ kind: "proof", action });
      }
      setError(failureMessage(failure, action));
    } finally {
      setPending(false);
    }
  }
  const sendProof = (action: SensitiveAction) =>
    attempt(action, async () => {
      const issued = await actions.freshProofChallenge({ action, language });
      setChallenge({
        id: issued.challengeId,
        resendAt: Date.now() + issued.resendAfter * 1000,
      });
      setCode("");
    });
  const confirmProof = (action: SensitiveAction) =>
    attempt(action, async () => {
      if (!challenge) return;
      const proof = await actions.freshProofConfirm({
        challengeId: challenge.id,
        code,
      });
      setChallenge(null);
      setCode("");
      setStep({
        kind: "form",
        action,
        expiresAt: Math.min(
          Date.parse(proof.expiresAt),
          Date.now() + proof.expiresIn * 1000,
        ),
      });
    });
  const sendReplacement = () =>
    attempt("email-change", async () => {
      const issued = await actions.emailChangeChallenge({
        newEmail,
        language,
      });
      setReplacement({
        id: issued.challengeId,
        resendAt: Date.now() + issued.resendAfter * 1000,
      });
      setCode("");
    });
  const confirmReplacement = () =>
    attempt("email-change", async () => {
      if (!replacement) return;
      const session = await actions.emailChangeConfirm({
        challengeId: replacement.id,
        code,
      });
      close();
      emailChanged(session);
      setNotice(m.sensitive_email_changed({ email: session.email }));
    });
  const remove = () =>
    attempt("account-deletion", async () => {
      const result = await actions.deleteAccount({
        billingRetentionAcknowledged: true,
        billingRetentionYears: 8,
      });
      deleted(result.status);
    });

  return (
    <div className="mt-4 border-t border-slate-300 pt-4">
      <h2 className="text-base font-semibold">{m.sensitive_heading()}</h2>
      {notice && (
        <p role="status" className="mt-2">
          {notice}
        </p>
      )}
      {step.kind === "idle" && !unavailable && (
        <div className="mt-3 flex flex-wrap gap-3">
          <button className={secondary} onClick={() => begin("email-change")}>
            {m.sensitive_change_email()}
          </button>
          <button
            className={secondary}
            onClick={() => begin("account-deletion")}
          >
            {m.sensitive_delete()}
          </button>
        </div>
      )}
      {step.kind === "proof" && (
        <form
          className="mt-3 flex max-w-md flex-col gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            void (challenge
              ? confirmProof(step.action)
              : sendProof(step.action));
          }}
        >
          <p>{m.sensitive_proof_intro({ email: account.email })}</p>
          {challenge && (
            <>
              <p role="status">{m.sensitive_proof_code_sent()}</p>
              <label>
                {m.auth_code()}
                <input
                  className={field}
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]{6}"
                  minLength={6}
                  maxLength={6}
                  required
                  autoFocus
                  value={code}
                  disabled={pending}
                  onChange={(event) => setCode(event.target.value)}
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
                ? m.sensitive_proof_confirm()
                : m.sensitive_proof_send()}
          </button>
          {challenge && (
            <button
              type="button"
              className={secondary}
              disabled={pending || now < challenge.resendAt}
              onClick={() => void sendProof(step.action)}
            >
              {m.auth_resend()}
            </button>
          )}
          <button
            type="button"
            className={secondary}
            disabled={pending}
            onClick={close}
          >
            {m.sensitive_cancel()}
          </button>
        </form>
      )}
      {step.kind === "form" && (
        <div className="mt-3 flex max-w-md flex-col gap-3">
          <p role="status">
            {m.sensitive_proof_valid({ time: time(step.expiresAt, language) })}
          </p>
          {step.action === "email-change" ? (
            <form
              className="flex flex-col gap-3"
              onSubmit={(event) => {
                event.preventDefault();
                void (replacement ? confirmReplacement() : sendReplacement());
              }}
            >
              <label>
                {m.sensitive_new_email()}
                <input
                  className={field}
                  type="email"
                  autoComplete="email"
                  required
                  maxLength={254}
                  value={newEmail}
                  disabled={pending || !!replacement}
                  onChange={(event) => setNewEmail(event.target.value)}
                />
              </label>
              {replacement && (
                <>
                  <p role="status">{m.sensitive_new_email_sent()}</p>
                  <label>
                    {m.sensitive_new_email_code()}
                    <input
                      className={field}
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      pattern="[0-9]{6}"
                      minLength={6}
                      maxLength={6}
                      required
                      autoFocus
                      value={code}
                      disabled={pending}
                      onChange={(event) => setCode(event.target.value)}
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
                  : replacement
                    ? m.sensitive_new_email_confirm()
                    : m.sensitive_new_email_send()}
              </button>
              {replacement && (
                <button
                  type="button"
                  className={secondary}
                  disabled={pending || now < replacement.resendAt}
                  onClick={() => void sendReplacement()}
                >
                  {m.auth_resend()}
                </button>
              )}
            </form>
          ) : (
            <form
              className="flex flex-col gap-3"
              aria-labelledby="sensitive-delete-heading"
              onSubmit={(event) => {
                event.preventDefault();
                if (acknowledged) void remove();
              }}
            >
              <h3
                id="sensitive-delete-heading"
                className="font-semibold text-red-800"
              >
                {m.sensitive_delete_heading()}
              </h3>
              <ul className="list-disc pl-5" data-testid="deletion-notice">
                <li>{m.sensitive_delete_notice_content()}</li>
                <li>{m.sensitive_delete_notice_retention()}</li>
                <li>
                  {quota
                    ? m.sensitive_delete_notice_quota({
                        remaining: String(quota.remaining),
                      })
                    : m.sensitive_delete_notice_quota_unknown()}
                </li>
              </ul>
              <label className="flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={acknowledged}
                  disabled={pending}
                  onChange={(event) => setAcknowledged(event.target.checked)}
                />
                <span>{m.sensitive_delete_ack()}</span>
              </label>
              <button
                className="rounded bg-red-800 px-3 py-2 text-white disabled:opacity-60"
                disabled={pending || !acknowledged}
              >
                {pending
                  ? m.sensitive_deleting()
                  : m.sensitive_delete_confirm()}
              </button>
            </form>
          )}
          <button
            type="button"
            className={secondary}
            disabled={pending}
            onClick={close}
          >
            {m.sensitive_cancel()}
          </button>
        </div>
      )}
      {unavailable && step.kind === "idle" && (
        <p role="alert" className="mt-3">
          {m.sensitive_unavailable()}
        </p>
      )}
      {error && (
        <p role="alert" className="mt-3 text-red-800">
          {error}
        </p>
      )}
    </div>
  );
}
