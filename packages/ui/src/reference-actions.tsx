// SPDX-License-Identifier: AGPL-3.0-or-later
import { AiProvenance } from "./ai-provenance.tsx";
import { ManualVerdictActions } from "./manual-verdict.tsx";
import { useMemo, useRef, useState } from "react";
import type {
  Check,
  ReferenceSlot,
} from "@source-taster/contract-verification/v2";
import {
  ApiError,
  verificationClient,
  type VerificationClientOptions,
} from "@source-taster/contract-verification/client-v2";
import { m } from "@source-taster/i18n";
import { Button } from "./primitives/actions.tsx";
import { Form } from "./primitives/fields.tsx";
import { AlertDialog, Modal } from "./primitives/overlays.tsx";
import {
  CorrectionSuggestion,
  type Rendered,
} from "./correction-suggestions.tsx";
import { availability, Fields } from "./reference-fields.tsx";
import { fieldLabels, ReferenceOutcomeView } from "./reference-outcome.tsx";
import {
  committedDraft,
  errorMessage,
  isDirty,
  resultBinding,
  sameValue,
  type SlotWork,
  type SnapshotGate,
} from "./reference-work.ts";

export function ReferenceActions({
  check,
  reference,
  transport,
  bibliography,
  work,
  gate,
}: {
  bibliography: Rendered;
  check: Check;
  reference: ReferenceSlot;
  transport: VerificationClientOptions;
  /** This slot's draft and in-flight operation, kept across navigation. */
  work: SlotWork;
  gate: SnapshotGate;
}) {
  const api = useMemo(() => verificationClient(transport), [transport]);
  const { draft, pending } = work;
  const binding = resultBinding(check.id, reference);
  const [replacement, setReplacement] = useState<{
    binding: string;
    token: string;
  } | null>(null);
  const editButton = useRef<HTMLButtonElement>(null);
  const [error, setError] = useState<string | null>(null);
  const running =
    reference.outcome.kind === "status" &&
    reference.outcome.status === "running";
  // A save, re-check or verdict change is in flight, or the Reference itself
  // is still running: there is no current result to act on.
  const operationRunning = running || pending;
  const stale = !!draft && draft.binding !== binding;
  const dirty = !!draft && isDirty(draft);
  const entry = bibliography.data?.entries.find(
    (entry) => entry.slot === reference.slot,
  );
  const hasCurrentResult =
    reference.outcome.kind === "verdict" &&
    reference.results[0]?.revision === reference.revision &&
    !!reference.results[0]?.id;
  const suggestedFields = entry?.suggestion
    ? { ...reference.fields, ...structuredClone(entry.suggestion.csl) }
    : null;
  const unavailableReason = operationRunning
    ? m.correction_fields_busy()
    : !hasCurrentResult || (bibliography.data && !entry?.suggestion)
      ? m.correction_fields_unavailable()
      : bibliography.pending || bibliography.failed || !entry?.resultToken
        ? m.correction_fields_loading()
        : // Empty or already committed values would make a no-op draft.
          !suggestedFields || sameValue(suggestedFields, reference.fields)
          ? m.correction_fields_unchanged()
          : null;
  /** Overlays the proven suggestion onto a local draft; nothing is sent. */
  function applyToDraft(expected: { binding: string; token: string }) {
    if (
      unavailableReason ||
      !suggestedFields ||
      expected.binding !== binding ||
      expected.token !== entry?.resultToken
    )
      return;
    // Overlay only the proven suggestion values. Committed fields the
    // suggestion does not supply stay as committed; nothing is inferred.
    work.setDraft(committedDraft(check.id, reference, suggestedFields));
    setError(null);
    setReplacement(null);
  }
  /** Applies at once, or asks first when it would replace an unsaved draft. */
  function requestApplyToFields() {
    if (unavailableReason || !entry?.resultToken) return;
    const expected = { binding, token: entry.resultToken };
    if (dirty || stale) setReplacement(expected);
    else applyToDraft(expected);
  }
  /** Shows an error only while it still concerns the result it was sent for. */
  function report(error: unknown, started: string) {
    const now = gate
      .current()
      ?.references.find((item) => item.slot === reference.slot);
    if (
      now &&
      (resultBinding(check.id, now) === started ||
        (error instanceof ApiError && error.status === 409))
    )
      setError(errorMessage(error));
  }
  async function submit(recheck: boolean, save: boolean) {
    if (running || (save && (stale || !draft)) || !work.begin()) return;
    setError(null);
    const started = binding;
    try {
      const snapshot =
        save && draft
          ? await api.saveFields(check.id, reference.slot, {
              expectedRevision: draft.expectedRevision,
              fields: draft.fields,
              authorsTruncated: draft.authorsTruncated,
              recheck,
            })
          : await api.recheckReference(check.id, reference.slot, {
              expectedRevision: reference.revision,
            });
      // The commit succeeded even when a newer stream event already
      // superseded this reply; the draft is no longer unsaved either way.
      gate.accept(snapshot);
      if (save && gate.current()?.id === snapshot.id) work.setDraft(null);
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        try {
          gate.accept(await api.getCheck(check.id));
        } catch {
          /* Keep the draft and original denial. */
        }
      }
      report(error, started);
    } finally {
      work.end();
    }
  }
  const previous = reference.results.filter(
    (result) =>
      running ||
      result.revision !== reference.revision ||
      result.id !== reference.results[0]?.id,
  );
  return (
    <section
      aria-label={m.revision_actions()}
      className="my-4 min-w-0 space-y-3"
    >
      <p className="font-semibold">
        {m.revision_number({ revision: reference.revision })}
      </p>
      <p>
        {reference.quotaEffect === "free-recheck"
          ? m.revision_free()
          : m.revision_new_work()}
      </p>
      {reference.revisions.at(-1)?.reference.ai &&
        (reference.revisions.at(-1)?.provenance === "ai" ||
          reference.revisions.at(-1)!.reference.ai!.proposals.length > 0) && (
          <AiProvenance
            extracted={reference.revisions.at(-1)?.provenance === "ai"}
            ai={reference.revisions.at(-1)!.reference.ai!}
            {...availability(operationRunning)}
            onAdopt={async (field, value) => {
              if (running || !work.begin()) return;
              setError(null);
              const started = binding;
              try {
                gate.accept(
                  await api.saveFields(check.id, reference.slot, {
                    expectedRevision: reference.revision,
                    fields: { ...reference.fields, [field]: value },
                    authorsTruncated: reference.authorsTruncated,
                    recheck: false,
                  }),
                );
              } catch (error) {
                report(error, started);
              } finally {
                work.end();
              }
            }}
          />
        )}
      <CorrectionSuggestion
        slot={reference.slot}
        rendered={bibliography}
        originalText={reference.originalText}
        onApplyToFields={requestApplyToFields}
        unavailableReason={unavailableReason}
        operationRunning={operationRunning}
      />
      <Modal
        isOpen={replacement !== null}
        onOpenChange={(open) => {
          if (!open) setReplacement(null);
        }}
      >
        <AlertDialog
          title={m.correction_replace_title()}
          cancelLabel={m.correction_keep()}
          actionLabel={m.correction_replace()}
          onAction={() => {
            if (replacement) applyToDraft(replacement);
            setReplacement(null);
          }}
        >
          {m.correction_replace_note()}
        </AlertDialog>
      </Modal>
      {error && <p role="alert">{error}</p>}
      {!draft ? (
        <div className="flex flex-wrap gap-3">
          <Button
            ref={editButton}
            {...availability(operationRunning)}
            onPress={() => {
              work.setDraft(committedDraft(check.id, reference));
              setError(null);
            }}
          >
            {m.revision_edit()}
          </Button>
          <Button
            {...availability(operationRunning)}
            onPress={() => {
              void submit(true, false);
            }}
          >
            {m.revision_recheck()}
          </Button>
        </div>
      ) : (
        <Form
          className="space-y-3 rounded border-2 border-border-emphasis bg-surface-sunken p-3"
          onSubmit={(event) => {
            event.preventDefault();
            void submit(true, true);
          }}
        >
          <p role="status">
            {stale ? m.revision_stale_draft() : m.revision_draft()}
          </p>
          <Fields
            fields={draft.fields}
            onChange={(fields) =>
              work.setDraft((draft) => ({ ...draft, fields }))
            }
            truncated={draft.authorsTruncated}
            onTruncated={(authorsTruncated) =>
              work.setDraft((draft) => ({ ...draft, authorsTruncated }))
            }
            disabled={operationRunning || stale}
          />
          <div className="flex flex-wrap gap-3">
            <Button
              variant="primary"
              type="submit"
              {...availability(operationRunning || stale)}
            >
              {m.revision_save_recheck()}
            </Button>
            <Button
              {...availability(operationRunning || stale)}
              onPress={() => {
                void submit(false, true);
              }}
            >
              {m.revision_save()}
            </Button>
            <Button
              variant="ghost"
              {...availability(pending)}
              onPress={() => {
                work.setDraft(null);
                // The pressed control unmounts; focus returns to its opener.
                requestAnimationFrame(() => editButton.current?.focus());
              }}
            >
              {m.revision_discard()}
            </Button>
          </div>
        </Form>
      )}
      <ManualVerdictActions
        check={check}
        reference={reference}
        transport={transport}
        work={work}
        gate={gate}
      />
      {!!previous.length && (
        <details>
          <summary className="cursor-pointer py-2 font-semibold">
            {m.revision_history()}
          </summary>
          {previous.map((result) => (
            <section
              aria-label={
                previous.length === 1
                  ? m.revision_historical()
                  : `${m.revision_historical()} · ${m.override_run({ run: result.generation + 1 })}`
              }
              className="my-3 rounded border border-border-emphasis bg-surface-sunken p-3"
              key={result.id}
            >
              <p>
                {m.revision_historical()} ·{" "}
                {m.revision_number({ revision: result.revision })} ·{" "}
                {result.createdAt}
              </p>
              <ReferenceOutcomeView
                outcome={result.outcome}
                manualOverride={result.manualOverride}
                contextLabel={`${m.revision_historical()} · ${m.override_run({ run: result.generation + 1 })}`}
              />
            </section>
          ))}
        </details>
      )}
      <details>
        <summary className="cursor-pointer py-2">
          {m.revision_field_history()}
        </summary>
        {reference.revisions.map((revision) => (
          <section className="my-3 break-words" key={revision.revision}>
            <p>
              {m.revision_number({ revision: revision.revision })} ·{" "}
              {revision.provenance === "user"
                ? m.revision_user()
                : revision.provenance === "ai"
                  ? m.ai_extracted()
                  : m.revision_parser()}
            </p>
            <dl>
              {Object.entries(revision.reference.csl).map(([key, value]) => (
                <div key={key}>
                  <dt className="font-semibold">
                    {key in fieldLabels
                      ? m[fieldLabels[key as keyof typeof fieldLabels]]()
                      : key}
                  </dt>
                  <dd>
                    {typeof value === "string"
                      ? value
                      : key === "issued"
                        ? revision.reference.csl.issued?.literal
                        : revision.reference.csl.author
                            ?.map(
                              (name) =>
                                name.literal ??
                                [
                                  name.given,
                                  name["non-dropping-particle"],
                                  name.family,
                                ]
                                  .filter(Boolean)
                                  .join(" "),
                            )
                            .join("; ")}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </details>
    </section>
  );
}
