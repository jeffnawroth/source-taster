// SPDX-License-Identifier: AGPL-3.0-or-later
import type { StructuredCsl } from "@source-taster/contract-verification/v2";
import { m } from "@source-taster/i18n";
import { Button } from "./primitives/actions.tsx";
import { TextField } from "./primitives/fields.tsx";
import { Checkbox } from "./primitives/selection.tsx";
import { fieldLabels } from "./reference-outcome.tsx";

/** Disables a primitive and says why; the default reason is a busy field editor. */
export function availability(
  disabled: boolean,
  reason: () => string = m.revision_busy,
) {
  return disabled
    ? { isDisabled: true as const, disabledReason: reason() }
    : { isDisabled: false as const };
}
const authorLabels = {
  family: "revision_family",
  given: "revision_given",
  literal: "revision_literal",
  "non-dropping-particle": "revision_particle",
} as const;
/** Author names stay structured; users never need to edit transport JSON. */
export function Fields({
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
