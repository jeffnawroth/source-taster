// SPDX-License-Identifier: AGPL-3.0-or-later
import { abuseMessage } from "./abuse-message.tsx";
import { AiProvenance } from "./ai-provenance.tsx";
import { ManualVerdictActions } from "./manual-verdict.tsx";
import { CheckSelectionActions } from "./bibliography-selection.tsx";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
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
import { AlertDialog, Modal } from "./primitives/overlays.tsx";
import {
  CorrectionSuggestion,
  referenceBinding,
  type Rendered,
} from "./correction-suggestions.tsx";
import { fieldLabels, ReferenceOutcomeView } from "./reference-outcome.tsx";

const control =
  "w-full min-w-0 rounded border border-border-emphasis bg-surface p-2 disabled:bg-surface-sunken";
const action =
  "rounded border border-border-emphasis px-3 py-2 disabled:opacity-50";
function availability(disabled: boolean) {
  return disabled
    ? { isDisabled: true as const, disabledReason: m.revision_busy() }
    : { isDisabled: false as const };
}
function errorMessage(error: unknown) {
  const limited = abuseMessage(error);
  if (limited) return limited;
  if (error instanceof ApiError && error.status === 409)
    return m.problem_reference_conflict();
  if (error instanceof ApiError && error.status === 410)
    return m.problem_check_expired();
  const key = error instanceof ApiError ? error.problem?.i18nKey : undefined;
  if (key && key in m) return (m[key as keyof typeof m] as () => string)();
  return m.problem_connection();
}
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
            {(
              ["family", "given", "literal", "non-dropping-particle"] as const
            ).map((key) => (
              <label className="block" key={key}>
                {m[
                  (
                    {
                      family: "revision_family",
                      given: "revision_given",
                      literal: "revision_literal",
                      "non-dropping-particle": "revision_particle",
                    } as const
                  )[key]
                ]()}
                <input
                  className={control}
                  value={author[key] ?? ""}
                  onChange={(event) => {
                    const next = { ...author };
                    if (event.target.value) next[key] = event.target.value;
                    else delete next[key];
                    onChange({
                      ...fields,
                      author: fields.author!.map((item, i) =>
                        i === index ? next : item,
                      ),
                    });
                  }}
                />
              </label>
            ))}
            <Button
              type="button"
              className={action}
              onPress={() =>
                onChange({
                  ...fields,
                  author: fields.author!.filter((_, i) => i !== index),
                })
              }
            >
              {m.revision_remove_author()}
            </Button>
          </fieldset>
        ))}
        <Button
          type="button"
          className={action}
          onPress={() =>
            onChange({ ...fields, author: [...(fields.author ?? []), {}] })
          }
        >
          {m.revision_add_author()}
        </Button>
        <label className="block">
          <input
            type="checkbox"
            checked={truncated}
            onChange={(event) => onTruncated(event.target.checked)}
          />{" "}
          {m.revision_truncated()}
        </label>
      </fieldset>
    </fieldset>
  );
}
export function ReferenceActions({
  check,
  reference,
  transport,
  onSnapshot,
  rendered,
}: {
  rendered: Rendered;
  check: Check;
  reference: ReferenceSlot;
  transport: VerificationClientOptions;
  onSnapshot: (check: Check) => void;
}) {
  const api = useMemo(() => verificationClient(transport), [transport]);
  const [editing, setEditing] = useState(false);
  const [fields, setFields] = useState(reference.fields);
  const [truncated, setTruncated] = useState(
    reference.authorsTruncated ?? false,
  );
  const [expectedRevision, setExpectedRevision] = useState(reference.revision);
  const binding = referenceBinding(check.id, reference);
  const [draftBinding, setDraftBinding] = useState(binding);
  const [baseline, setBaseline] = useState(
    JSON.stringify([reference.fields, reference.authorsTruncated ?? false]),
  );
  const [replacement, setReplacement] = useState<{
    binding: string;
    token: string;
  } | null>(null);
  const busy = useRef(false);
  const live = useRef<{ check: Check; binding: string } | null>(null);
  useLayoutEffect(() => {
    live.current = { check, binding };
    return () => {
      live.current = null;
    };
  }, [check, binding]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const running =
    reference.outcome.kind === "status" &&
    reference.outcome.status === "running";
  const stale = editing && draftBinding !== binding;
  const dirty = editing && baseline !== JSON.stringify([fields, truncated]);
  const entry = rendered.data?.entries.find(
    (entry) => entry.slot === reference.slot,
  );
  const current =
    reference.outcome.kind === "verdict" &&
    reference.results[0]?.revision === reference.revision &&
    !!reference.results[0]?.id;
  const unavailable =
    running || pending
      ? m.correction_fields_busy()
      : !current || (rendered.data && !entry?.suggestion)
        ? m.correction_fields_unavailable()
        : rendered.pending || rendered.failed || !entry?.resultToken
          ? m.correction_fields_loading()
          : null;
  const eligible = unavailable === null && !!entry?.suggestion;
  function applySuggestion(expected: { binding: string; token: string }) {
    if (
      !eligible ||
      busy.current ||
      expected.binding !== binding ||
      expected.token !== entry?.resultToken ||
      !entry?.suggestion
    )
      return;
    // Overlay only the proven suggestion values. Committed fields the
    // suggestion does not supply stay as committed; nothing is inferred.
    setFields({
      ...reference.fields,
      ...structuredClone(entry.suggestion.csl),
    });
    setTruncated(reference.authorsTruncated ?? false);
    setExpectedRevision(reference.revision);
    setDraftBinding(binding);
    setBaseline(
      JSON.stringify([reference.fields, reference.authorsTruncated ?? false]),
    );
    setEditing(true);
    setError(null);
    setReplacement(null);
  }
  function apply() {
    if (!eligible || busy.current || !entry?.resultToken) return;
    const expected = { binding, token: entry.resultToken };
    if (dirty || stale) setReplacement(expected);
    else applySuggestion(expected);
  }
  // Only current, monotonic snapshots may affect this mounted Check. In
  // particular, a late HTTP response cannot roll back a newer stream event.
  function accept(snapshot: Check) {
    const current = live.current;
    if (
      !current ||
      current.check.id !== snapshot.id ||
      snapshot.lastEventSeq < current.check.lastEventSeq
    )
      return false;
    onSnapshot(snapshot);
    return true;
  }
  async function submit(recheck: boolean, save: boolean) {
    if (busy.current || running || (save && stale)) return;
    busy.current = true;
    setPending(true);
    setError(null);
    const started = binding;
    try {
      const snapshot = save
        ? await api.saveFields(check.id, reference.slot, {
            expectedRevision,
            fields,
            authorsTruncated: truncated,
            recheck,
          })
        : await api.recheckReference(check.id, reference.slot, {
            expectedRevision: reference.revision,
          });
      // The commit succeeded even when a newer stream event already
      // superseded this reply; the draft is no longer unsaved either way.
      accept(snapshot);
      if (live.current?.check.id === snapshot.id) setEditing(false);
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        try {
          accept(await api.getCheck(check.id));
        } catch {
          /* Keep the draft and original denial. */
        }
      }
      if (
        live.current &&
        (live.current.binding === started ||
          (error instanceof ApiError && error.status === 409))
      )
        setError(errorMessage(error));
    } finally {
      busy.current = false;
      if (live.current) setPending(false);
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
              if (busy.current || running || pending) return;
              busy.current = true;
              setPending(true);
              setError(null);
              try {
                accept(
                  await api.saveFields(check.id, reference.slot, {
                    expectedRevision: reference.revision,
                    fields: { ...reference.fields, [field]: value },
                    authorsTruncated: reference.authorsTruncated,
                    recheck: false,
                  }),
                );
              } catch (error) {
                setError(errorMessage(error));
              } finally {
                busy.current = false;
                if (live.current) setPending(false);
              }
            }}
          />
        )}
      <CorrectionSuggestion
        slot={reference.slot}
        rendered={rendered}
        originalText={reference.originalText}
        onApply={apply}
        unavailable={unavailable}
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
      {!editing ? (
        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            className={`${action} border-border-emphasis bg-surface-sunken`}
            {...availability(running || pending)}
            onPress={() => {
              setFields(reference.fields);
              setTruncated(reference.authorsTruncated ?? false);
              setExpectedRevision(reference.revision);
              setDraftBinding(binding);
              setBaseline(
                JSON.stringify([
                  reference.fields,
                  reference.authorsTruncated ?? false,
                ]),
              );
              setEditing(true);
              setError(null);
            }}
          >
            {m.revision_edit()}
          </Button>
          <Button
            type="button"
            className={`${action} bg-surface text-text`}
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
            fields={fields}
            onChange={setFields}
            truncated={truncated}
            onTruncated={setTruncated}
            disabled={running || pending || stale}
          />
          <div className="flex flex-wrap gap-3">
            <Button
              className={`${action} bg-surface text-text`}
              type="submit"
              {...availability(running || pending || stale)}
            >
              {m.revision_save_recheck()}
            </Button>
            <Button
              className={action}
              type="button"
              {...availability(running || pending || stale)}
              onPress={() => {
                void submit(false, true);
              }}
            >
              {m.revision_save()}
            </Button>
            <Button
              className={action}
              type="button"
              {...availability(pending)}
              onPress={() => setEditing(false)}
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
        onSnapshot={onSnapshot}
        disabled={pending}
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
