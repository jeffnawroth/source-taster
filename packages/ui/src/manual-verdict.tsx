// SPDX-License-Identifier: AGPL-3.0-or-later
import { abuseMessage } from "./abuse-message.tsx";
import { useMemo, useState } from "react";
import type {
  Check,
  ReferenceSlot,
  SetManualOverrideRequest,
  Verdict,
} from "@source-taster/contract-verification/v2";
import {
  ApiError,
  verificationClient,
  type VerificationClientOptions,
} from "@source-taster/contract-verification/client-v2";
import { m } from "@source-taster/i18n";
import { verdictLabels } from "./check-summary.tsx";
const action = "rounded border border-slate-600 px-3 py-2 disabled:opacity-50";
export function ManualVerdictActions({
  check,
  reference,
  transport,
  onSnapshot,
}: {
  check: Check;
  reference: ReferenceSlot;
  transport: VerificationClientOptions;
  onSnapshot: (check: Check) => void;
}) {
  const api = useMemo(() => verificationClient(transport), [transport]);
  const [draft, setDraft] = useState<SetManualOverrideRequest | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedResultId, setSavedResultId] = useState<string | null>(null);
  const result = reference.results[0];
  const available =
    reference.outcome.kind === "verdict" &&
    result?.revision === reference.revision;
  function currentRequest(): SetManualOverrideRequest | null {
    return available && reference.outcome.kind === "verdict"
      ? {
          expectedRevision: reference.revision,
          resultId: result.id,
          expectedOverrideId: reference.manualOverride?.id ?? null,
          verdict:
            reference.manualOverride?.verdict ?? reference.outcome.verdict,
        }
      : null;
  }
  async function save(request: SetManualOverrideRequest) {
    setPending(true);
    setError(null);
    setSavedResultId(null);
    try {
      onSnapshot(
        await api.setManualOverride(check.id, reference.slot, request),
      );
      setDraft(null);
      setSavedResultId(request.resultId);
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        try {
          onSnapshot(await api.getCheck(check.id));
        } catch {
          /* Retain original denial and draft. */
        }
      }
      const key =
        error instanceof ApiError ? error.problem?.i18nKey : undefined;
      setError(
        abuseMessage(error) ??
          (error instanceof ApiError && error.status === 409
            ? m.problem_reference_conflict()
            : error instanceof ApiError && error.status === 410
              ? m.problem_check_expired()
              : key && key in m
                ? (m[key as keyof typeof m] as () => string)()
                : m.problem_connection()),
      );
    } finally {
      setPending(false);
    }
  }
  return (
    <section
      aria-label={m.override_actions()}
      className="my-4 min-w-0 space-y-3 rounded border border-indigo-700 bg-indigo-50 p-3"
    >
      {reference.manualOverrideReset && (
        <p role="status">{m.override_reset()}</p>
      )}
      {error && <p role="alert">{error}</p>}
      {savedResultId === result?.id && reference.manualOverride && (
        <p role="status">{m.override_saved()}</p>
      )}
      {available && (
        <>
          <p>{m.override_note()}</p>
          {!draft ? (
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                className={action}
                disabled={pending}
                onClick={() => {
                  const request = currentRequest();
                  if (request && reference.outcome.kind === "verdict")
                    void save({
                      ...request,
                      verdict: reference.outcome.verdict,
                    });
                }}
              >
                {m.override_confirm()}
              </button>
              <button
                type="button"
                className={action}
                disabled={pending}
                onClick={() => {
                  setDraft(currentRequest());
                  setError(null);
                }}
              >
                {m.override_judge()}
              </button>
            </div>
          ) : (
            <form
              className="space-y-3"
              onSubmit={(event) => {
                event.preventDefault();
                void save(draft);
              }}
            >
              <label className="block">
                {m.override_label()}
                <select
                  className="block w-full min-w-0 rounded border border-slate-500 bg-white p-2"
                  disabled={pending}
                  value={draft.verdict}
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      verdict: event.target.value as Verdict,
                    })
                  }
                >
                  {(Object.keys(verdictLabels) as Verdict[]).map((verdict) => (
                    <option key={verdict} value={verdict}>
                      {m[verdictLabels[verdict]]()}
                    </option>
                  ))}
                </select>
              </label>
              <div className="flex flex-wrap gap-3">
                <button className={action} disabled={pending} type="submit">
                  {m.override_save()}
                </button>
                <button
                  className={action}
                  disabled={pending}
                  type="button"
                  onClick={() => {
                    setDraft(null);
                    setError(null);
                  }}
                >
                  {m.override_cancel()}
                </button>
              </div>
            </form>
          )}
        </>
      )}
    </section>
  );
}
