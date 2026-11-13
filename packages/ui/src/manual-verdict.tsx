// SPDX-License-Identifier: AGPL-3.0-or-later
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
import { verdictLabels, VerdictGlyph } from "./outcome-badges.tsx";
import { Button } from "./primitives/actions.tsx";
import { Check as CheckIcon, PencilLine } from "lucide-react";
import { DetailSection } from "./reference-outcome.tsx";
import { Form } from "./primitives/fields.tsx";
import { Radio, RadioGroup } from "./primitives/selection.tsx";
import {
  errorMessage,
  type SlotWork,
  type SnapshotGate,
} from "./reference-work.ts";

export function ManualVerdictActions({
  check,
  reference,
  transport,
  work,
  gate,
}: {
  check: Check;
  reference: ReferenceSlot;
  transport: VerificationClientOptions;
  /** Shared with the field actions: one request per slot at a time. */
  work: SlotWork;
  gate: SnapshotGate;
}) {
  const api = useMemo(() => verificationClient(transport), [transport]);
  const [draft, setDraft] = useState<SetManualOverrideRequest | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedResultId, setSavedResultId] = useState<string | null>(null);
  const result = reference.results[0];
  const running =
    reference.outcome.kind === "status" &&
    reference.outcome.status === "running";
  const blocked = running || work.pending;
  const busy = blocked
    ? { isDisabled: true as const, disabledReason: m.revision_busy() }
    : { isDisabled: false as const };
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
    if (blocked || !work.begin()) return;
    setError(null);
    setSavedResultId(null);
    try {
      gate.accept(
        await api.setManualOverride(check.id, reference.slot, request),
      );
      if (gate.current()) {
        setDraft(null);
        setSavedResultId(request.resultId);
      }
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        try {
          gate.accept(await api.getCheck(check.id));
        } catch {
          /* Retain original denial and draft. */
        }
      }
      setError(errorMessage(error));
    } finally {
      work.end();
    }
  }
  return (
    <DetailSection title={m.override_actions()} label={m.override_actions()}>
      {reference.manualOverrideReset && (
        <p role="status">{m.override_reset()}</p>
      )}
      {error && <p role="alert">{error}</p>}
      {savedResultId === result?.id && reference.manualOverride && (
        <p role="status">{m.override_saved()}</p>
      )}
      {available && (
        <>
          <p className="detail-note">{m.override_note()}</p>
          {!draft ? (
            <div className="detail-row">
              <Button
                size="sm"
                icon={<CheckIcon aria-hidden="true" size={16} />}
                {...busy}
                onPress={() => {
                  const request = currentRequest();
                  if (request && reference.outcome.kind === "verdict")
                    void save({
                      ...request,
                      verdict: reference.outcome.verdict,
                    });
                }}
              >
                {m.override_confirm()}
              </Button>
              <Button
                size="sm"
                icon={<PencilLine aria-hidden="true" size={16} />}
                {...busy}
                onPress={() => {
                  setDraft(currentRequest());
                  setError(null);
                }}
              >
                {m.override_judge()}
              </Button>
            </div>
          ) : (
            <Form
              className="space-y-3"
              onSubmit={(event) => {
                event.preventDefault();
                void save(draft);
              }}
            >
              <RadioGroup
                label={m.override_label()}
                value={draft.verdict}
                isDisabled={blocked}
                onChange={(verdict) =>
                  setDraft({ ...draft, verdict: verdict as Verdict })
                }
              >
                {(Object.keys(verdictLabels) as Verdict[]).map((verdict) => (
                  <Radio key={verdict} value={verdict}>
                    <span className="inline-flex items-start gap-2">
                      <VerdictGlyph verdict={verdict} />
                      {m[verdictLabels[verdict]]()}
                    </span>
                  </Radio>
                ))}
              </RadioGroup>
              <div className="flex flex-wrap gap-3">
                <Button variant="primary" type="submit" {...busy}>
                  {m.override_save()}
                </Button>
                <Button
                  variant="ghost"
                  {...busy}
                  onPress={() => {
                    setDraft(null);
                    setError(null);
                  }}
                >
                  {m.override_cancel()}
                </Button>
              </div>
            </Form>
          )}
        </>
      )}
    </DetailSection>
  );
}
