// SPDX-License-Identifier: AGPL-3.0-or-later
import { useMemo, useState } from "react";
import type {
  Check,
  EditReferenceListRequest,
  StructuredCsl,
} from "@source-taster/contract-verification/v2";
import {
  ApiError,
  verificationClient,
  type VerificationClientOptions,
} from "@source-taster/contract-verification/client-v2";
import { m } from "@source-taster/i18n";
import { CheckSelectionActions } from "./bibliography-selection.tsx";
import { Button } from "./primitives/actions.tsx";
import { Form, TextField } from "./primitives/fields.tsx";
import { Checkbox, CheckboxGroup } from "./primitives/selection.tsx";
import { availability, Fields } from "./reference-fields.tsx";
import { errorMessage } from "./reference-work.ts";

/** Edits which References a Check contains: remove some, add one, then apply. */
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
  const referenceRunning = check.references.some(
    (r) => r.outcome.kind === "status" && r.outcome.status === "running",
  );
  const listBusy = referenceRunning || pending;
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
  async function applyListChanges() {
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
      <Button
        {...availability(listBusy, m.revision_list_busy)}
        onPress={() => {
          setDraft({
            expectedEventSeq: check.lastEventSeq,
            add: [],
            remove: [],
          });
          setPreview(false);
        }}
      >
        {m.revision_list()}
      </Button>
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
        <Form
          className="mt-3 space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            setPreview(true);
          }}
        >
          {!preview ? (
            <>
              <CheckboxGroup
                label={m.revision_remove()}
                isDisabled={listBusy}
                value={draft.remove.map(String)}
                onChange={(slots) =>
                  setDraft({ ...draft, remove: slots.map(Number) })
                }
              >
                {check.references.map((reference) => (
                  <Checkbox key={reference.slot} value={String(reference.slot)}>
                    {reference.slot}.{" "}
                    {reference.fields.title ?? reference.originalText}
                  </Checkbox>
                ))}
              </CheckboxGroup>
              <fieldset disabled={listBusy} className="min-w-0 space-y-3">
                <legend className="font-semibold">{m.revision_add()}</legend>
                <TextField
                  multiline
                  label={m.revision_original()}
                  value={text}
                  onChange={setText}
                />
                <Fields
                  fields={fields}
                  onChange={setFields}
                  truncated={truncated}
                  onTruncated={setTruncated}
                  disabled={listBusy}
                />
              </fieldset>
              <Button
                variant="primary"
                type="submit"
                {...availability(
                  listBusy || (!draft.remove.length && !text.trim()),
                  listBusy ? m.revision_list_busy : m.revision_preview_empty,
                )}
              >
                {m.revision_preview()}
              </Button>
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
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="primary"
                  {...availability(listBusy, m.revision_list_busy)}
                  onPress={() => {
                    void applyListChanges();
                  }}
                >
                  {m.revision_apply()}
                </Button>
                <Button
                  {...availability(pending, m.revision_list_busy)}
                  onPress={() => setPreview(false)}
                >
                  {m.revision_back()}
                </Button>
              </div>
            </section>
          )}
          <Button
            variant="ghost"
            {...availability(pending, m.revision_list_busy)}
            onPress={close}
          >
            {m.revision_discard()}
          </Button>
        </Form>
      )}
    </section>
  );
}
