// SPDX-License-Identifier: AGPL-3.0-or-later
import { abuseMessage } from "./abuse-message.tsx";
import { AiProvenance } from "./ai-provenance.tsx";
import { ManualVerdictActions } from "./manual-verdict.tsx";
import { CheckSelectionActions } from "./bibliography-selection.tsx";
import { useMemo, useState } from "react";
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
import { fieldLabels, ReferenceOutcomeView } from "./reference-outcome.tsx";

const control =
  "w-full min-w-0 rounded border border-border-emphasis bg-surface p-2 disabled:bg-surface-sunken";
const action =
  "rounded border border-border-emphasis px-3 py-2 disabled:opacity-50";
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
          <label key={key} className="block min-w-0">
            {m[fieldLabels[key]]()}
            <input
              className={control}
              value={
                key === "issued"
                  ? (fields.issued?.literal ?? "")
                  : (fields[key] ?? "")
              }
              onChange={(event) => scalar(key, event.target.value)}
            />
          </label>
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
            <button
              type="button"
              className={action}
              onClick={() =>
                onChange({
                  ...fields,
                  author: fields.author!.filter((_, i) => i !== index),
                })
              }
            >
              {m.revision_remove_author()}
            </button>
          </fieldset>
        ))}
        <button
          type="button"
          className={action}
          onClick={() =>
            onChange({ ...fields, author: [...(fields.author ?? []), {}] })
          }
        >
          {m.revision_add_author()}
        </button>
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
}: {
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
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const running =
    reference.outcome.kind === "status" &&
    reference.outcome.status === "running";
  async function submit(recheck: boolean, save: boolean) {
    setPending(true);
    setError(null);
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
      onSnapshot(snapshot);
      setEditing(false);
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
            disabled={running || pending}
            onAdopt={async (field, value) => {
              setPending(true);
              setError(null);
              try {
                onSnapshot(
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
                setPending(false);
              }
            }}
          />
        )}
      {error && <p role="alert">{error}</p>}
      <ManualVerdictActions
        check={check}
        reference={reference}
        transport={transport}
        onSnapshot={onSnapshot}
      />
      {!editing ? (
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className={`${action} border-border-emphasis bg-surface-sunken`}
            disabled={running || pending}
            onClick={() => {
              setFields(reference.fields);
              setTruncated(reference.authorsTruncated ?? false);
              setExpectedRevision(reference.revision);
              setEditing(true);
              setError(null);
            }}
          >
            {m.revision_edit()}
          </button>
          <button
            type="button"
            className={`${action} bg-surface text-text`}
            disabled={running || pending}
            onClick={() => {
              void submit(true, false);
            }}
          >
            {m.revision_recheck()}
          </button>
        </div>
      ) : (
        <form
          className="space-y-3 rounded border-2 border-border-emphasis bg-surface-sunken p-3"
          onSubmit={(event) => {
            event.preventDefault();
            void submit(true, true);
          }}
        >
          <p>{m.revision_draft()}</p>
          <Fields
            fields={fields}
            onChange={setFields}
            truncated={truncated}
            onTruncated={setTruncated}
            disabled={running || pending}
          />
          <div className="flex flex-wrap gap-3">
            <button
              className={`${action} bg-surface text-text`}
              type="submit"
              disabled={running || pending}
            >
              {m.revision_save_recheck()}
            </button>
            <button
              className={action}
              type="button"
              disabled={running || pending}
              onClick={() => {
                void submit(false, true);
              }}
            >
              {m.revision_save()}
            </button>
            <button
              className={action}
              type="button"
              disabled={pending}
              onClick={() => setEditing(false)}
            >
              {m.revision_discard()}
            </button>
          </div>
        </form>
      )}
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
