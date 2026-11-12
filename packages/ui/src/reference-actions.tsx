// SPDX-License-Identifier: AGPL-3.0-or-later
import { AiProvenance } from "./ai-provenance.tsx";
import { ManualVerdictActions } from "./manual-verdict.tsx";
import { CheckSelectionActions } from "./bibliography-selection.tsx";
import { useMemo, useRef, useState } from "react";
import type {
  Check,
  ReferenceSlot,
  StructuredCsl,
  EditReferenceListRequest,
} from "@source-taster/contract-verification/v2";
import {
  ApiError,
  verificationClient,
  type VerificationClientOptions,
} from "@source-taster/contract-verification/client-v2";
import { m } from "@source-taster/i18n";
import { Button } from "./primitives/actions.tsx";
import { Form, TextField } from "./primitives/fields.tsx";
import { Checkbox } from "./primitives/selection.tsx";
import { AlertDialog, Modal } from "./primitives/overlays.tsx";
import {
  CorrectionSuggestion,
  type Rendered,
} from "./correction-suggestions.tsx";
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

const control =
  "w-full min-w-0 rounded border border-border-emphasis bg-surface p-2 disabled:bg-surface-sunken";
const action =
  "rounded border border-border-emphasis px-3 py-2 disabled:opacity-50";
function availability(disabled: boolean) {
  return disabled
    ? { isDisabled: true as const, disabledReason: m.revision_busy() }
    : { isDisabled: false as const };
}
const authorLabels = {
  family: "revision_family",
  given: "revision_given",
  literal: "revision_literal",
  "non-dropping-particle": "revision_particle",
} as const;
/** Author names stay structured; users never need to edit transport JSON. */
function Fields({
  fields,
  onChange,
  disabled,
  truncated,
  onTruncated,
}: {
  fields: StructuredCsl;
  onChange: (fields: StructuredCsl) => void;
  disabled: boolean;
  truncated: boolean;
  onTruncated: (value: boolean) => void;
}) {
  function scalar(key: keyof StructuredCsl, value: string) {
    const next = { ...fields };
    if (!value.trim()) delete next[key];
    else if (key === "issued") next.issued = { literal: value };
    else Object.assign(next, { [key]: value });
    onChange(next);
  }
  // A disabled draft is read-only: the native fieldset disables its inputs,
  // and actions that cannot run are not offered.
  return (
    <fieldset disabled={disabled} className="min-w-0 space-y-3">
      <legend className="font-semibold">{m.revision_fields()}</legend>
      {(Object.keys(fieldLabels) as (keyof typeof fieldLabels)[])
        .filter((key) => key !== "author")
        .map((key) => (
          <TextField
            key={key}
            label={m[fieldLabels[key]]()}
            value={
              key === "issued"
                ? (fields.issued?.literal ?? "")
                : (fields[key] ?? "")
            }
            onChange={(value) => scalar(key, value)}
          />
        ))}
      <fieldset className="min-w-0 space-y-3">
        <legend>{m.field_author()}</legend>
        {(fields.author ?? []).map((author, index) => (
          <fieldset
            className="min-w-0 space-y-2 rounded border border-border-emphasis p-2"
            key={index}
          >
            <legend>{m.revision_author_number({ number: index + 1 })}</legend>
            {(Object.keys(authorLabels) as (keyof typeof authorLabels)[]).map(
              (key) => (
                <TextField
                  key={key}
                  label={m[authorLabels[key]]()}
                  value={author[key] ?? ""}
                  onChange={(value) => {
                    const next = { ...author };
                    if (value) next[key] = value;
                    else delete next[key];
                    onChange({
                      ...fields,
                      author: fields.author!.map((item, i) =>
                        i === index ? next : item,
                      ),
                    });
                  }}
                />
              ),
            )}
            {!disabled && (
              <Button
                onPress={() =>
                  onChange({
                    ...fields,
                    author: fields.author!.filter((_, i) => i !== index),
                  })
                }
              >
                {m.revision_remove_author()}
              </Button>
            )}
          </fieldset>
        ))}
        {!disabled && (
          <Button
            onPress={() =>
              onChange({ ...fields, author: [...(fields.author ?? []), {}] })
            }
          >
            {m.revision_add_author()}
          </Button>
        )}
        <Checkbox
          isSelected={truncated}
          onChange={onTruncated}
          {...availability(disabled)}
        >
          {m.revision_truncated()}
        </Checkbox>
      </fieldset>
    </fieldset>
  );
}
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
  const stale = !!draft && draft.binding !== binding;
  const dirty = !!draft && isDirty(draft);
  const entry = bibliography.data?.entries.find(
    (entry) => entry.slot === reference.slot,
  );
  const hasCurrentResult =
    reference.outcome.kind === "verdict" &&
    reference.results[0]?.revision === reference.revision &&
    !!reference.results[0]?.id;
  const suggested = entry?.suggestion
    ? { ...reference.fields, ...structuredClone(entry.suggestion.csl) }
    : null;
  const unavailableReason =
    running || pending
      ? m.correction_fields_busy()
      : !hasCurrentResult || (bibliography.data && !entry?.suggestion)
        ? m.correction_fields_unavailable()
        : bibliography.pending || bibliography.failed || !entry?.resultToken
          ? m.correction_fields_loading()
          : // Empty or already committed values would make a no-op draft.
            !suggested || sameValue(suggested, reference.fields)
            ? m.correction_fields_unchanged()
            : null;
  function applySuggestion(expected: { binding: string; token: string }) {
    if (
      unavailableReason ||
      !suggested ||
      expected.binding !== binding ||
      expected.token !== entry?.resultToken
    )
      return;
    // Overlay only the proven suggestion values. Committed fields the
    // suggestion does not supply stay as committed; nothing is inferred.
    work.setDraft(committedDraft(check.id, reference, suggested));
    setError(null);
    setReplacement(null);
  }
  function apply() {
    if (unavailableReason || !entry?.resultToken) return;
    const expected = { binding, token: entry.resultToken };
    if (dirty || stale) setReplacement(expected);
    else applySuggestion(expected);
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
            {...availability(running || pending)}
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
        onApply={apply}
        unavailableReason={unavailableReason}
        busy={running || pending}
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
            if (replacement) applySuggestion(replacement);
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
            {...availability(running || pending)}
            onPress={() => {
              work.setDraft(committedDraft(check.id, reference));
              setError(null);
            }}
          >
            {m.revision_edit()}
          </Button>
          <Button
            {...availability(running || pending)}
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
            disabled={running || pending || stale}
          />
          <div className="flex flex-wrap gap-3">
            <Button
              variant="primary"
              type="submit"
              {...availability(running || pending || stale)}
            >
              {m.revision_save_recheck()}
            </Button>
            <Button
              {...availability(running || pending || stale)}
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
export function ReferenceListActions({
  check,
  transport,
  onSnapshot,
}: {
  check: Check;
  transport: VerificationClientOptions;
  onSnapshot: (check: Check) => void;
}) {
  const api = useMemo(() => verificationClient(transport), [transport]);
  const [draft, setDraft] = useState<EditReferenceListRequest | null>(null);
  const [text, setText] = useState("");
  const [fields, setFields] = useState<StructuredCsl>({});
  const [truncated, setTruncated] = useState(false);
  const [preview, setPreview] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const active = check.references.some(
    (r) => r.outcome.kind === "status" && r.outcome.status === "running",
  );
  function close() {
    setDraft(null);
    setText("");
    setFields({});
    setPreview(false);
    setError(null);
    setTruncated(false);
  }
  const addition =
    draft && text.trim()
      ? [{ originalText: text, fields, authorsTruncated: truncated }]
      : [];
  async function apply() {
    if (!draft) return;
    setPending(true);
    setError(null);
    try {
      onSnapshot(
        await api.editReferenceList(check.id, { ...draft, add: addition }),
      );
      close();
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        try {
          onSnapshot(await api.getCheck(check.id));
        } catch {
          /* Keep the draft and original denial. */
        }
      }
      setError(errorMessage(error));
    } finally {
      setPending(false);
    }
  }
  return (
    <section
      aria-label={m.revision_list()}
      className="my-4 rounded border-2 border-border-emphasis bg-surface-sunken p-3"
    >
      <button
        type="button"
        className={action}
        disabled={active || pending}
        onClick={() => {
          setDraft({
            expectedEventSeq: check.lastEventSeq,
            add: [],
            remove: [],
          });
          setPreview(false);
        }}
      >
        {m.revision_list()}
      </button>
      <p className="mt-2">{m.revision_membership_note()}</p>
      {error && <p role="alert">{error}</p>}
      {draft && check.document && (
        <CheckSelectionActions
          key={`${check.id}:${draft.expectedEventSeq}`}
          check={check}
          transport={transport}
          onSnapshot={onSnapshot}
        />
      )}
      {draft && (
        <form
          className="mt-3 space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            setPreview(true);
          }}
        >
          {!preview ? (
            <>
              <fieldset disabled={active || pending}>
                <legend>{m.revision_remove()}</legend>
                {check.references.map((reference) => (
                  <label key={reference.slot} className="block break-words">
                    <input
                      type="checkbox"
                      checked={draft.remove.includes(reference.slot)}
                      onChange={(event) =>
                        setDraft({
                          ...draft,
                          remove: event.target.checked
                            ? [...draft.remove, reference.slot]
                            : draft.remove.filter(
                                (slot) => slot !== reference.slot,
                              ),
                        })
                      }
                    />{" "}
                    {reference.slot}.{" "}
                    {reference.fields.title ?? reference.originalText}
                  </label>
                ))}
              </fieldset>
              <fieldset
                disabled={active || pending}
                className="min-w-0 space-y-3"
              >
                <legend className="font-semibold">{m.revision_add()}</legend>
                <label className="block">
                  {m.revision_original()}
                  <textarea
                    className={control}
                    value={text}
                    onChange={(event) => setText(event.target.value)}
                  />
                </label>
                <Fields
                  fields={fields}
                  onChange={setFields}
                  truncated={truncated}
                  onTruncated={setTruncated}
                  disabled={active || pending}
                />
              </fieldset>
              <button
                className={action}
                type="submit"
                disabled={
                  active || pending || (!draft.remove.length && !text.trim())
                }
              >
                {m.revision_preview()}
              </button>
            </>
          ) : (
            <section aria-label={m.revision_preview()} className="space-y-3">
              <p>
                {m.revision_preview_counts({
                  added: addition.length,
                  removed: draft.remove.length,
                  total:
                    check.references.length -
                    draft.remove.length +
                    addition.length,
                  quota: addition.length,
                })}
              </p>
              <ul>
                {draft.remove.map((slot) => (
                  <li key={slot}>
                    {m.revision_remove()}: {slot}.{" "}
                    {
                      check.references.find((r) => r.slot === slot)
                        ?.originalText
                    }
                  </li>
                ))}
                {addition.map((reference, i) => (
                  <li key={i}>
                    {m.revision_add()}: {reference.originalText}
                  </li>
                ))}
              </ul>
              <p>{m.revision_no_refund()}</p>
              <button
                className={`${action} bg-surface text-text`}
                type="button"
                disabled={active || pending}
                onClick={() => {
                  void apply();
                }}
              >
                {m.revision_apply()}
              </button>
              <button
                className={action}
                type="button"
                disabled={pending}
                onClick={() => setPreview(false)}
              >
                {m.revision_back()}
              </button>
            </section>
          )}
          <button
            className={action}
            type="button"
            disabled={pending}
            onClick={close}
          >
            {m.revision_discard()}
          </button>
        </form>
      )}
    </section>
  );
}
