// SPDX-License-Identifier: AGPL-3.0-or-later
import type { AiStructuringResult } from "@source-taster/contract-verification/ai";
import { m } from "@source-taster/i18n";
import { fieldLabels } from "./reference-outcome.tsx";
type Ai = NonNullable<AiStructuringResult["references"][number]["ai"]>;
function label(field: string) {
  return field in fieldLabels
    ? m[fieldLabels[field as keyof typeof fieldLabels]]()
    : field;
}
function display(value: unknown): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(display).join("; ");
  if (value && typeof value === "object")
    return Object.values(value).map(display).join(" ");
  return "";
}
export function AiProvenance({
  ai,
  onAdopt,
  disabled,
  extracted = true,
}: {
  ai: Ai;
  extracted?: boolean;
  onAdopt?: (field: string, value: unknown) => void | Promise<void>;
  disabled?: boolean;
}) {
  return (
    <div className="my-3 space-y-2 rounded border border-amber-500 bg-amber-50 p-3">
      <p data-testid="ai-uncertainty">{m.ai_uncertainty()}</p>
      {extracted && <p>{m.ai_extracted()}</p>}
      {extracted && ai.changedFields.length > 0 && (
        <p data-testid="ai-changed">
          {m.ai_changed()}: {ai.changedFields.map(label).join(", ")}
        </p>
      )}
      {ai.proposals.length > 0 && (
        <section data-testid="ai-proposals" aria-label={m.ai_proposals()}>
          <h4 className="font-semibold">{m.ai_proposals()}</h4>
          <p>{m.ai_excluded()}</p>
          <ul>
            {ai.proposals.map((p) => (
              <li className="my-2 break-words" key={p.field}>
                {label(p.field)}: {display(p.value)}
                {onAdopt && (
                  <button
                    className="ml-2 rounded border border-slate-600 px-3 py-2 disabled:opacity-50"
                    disabled={disabled}
                    type="button"
                    onClick={() => {
                      void onAdopt(p.field, p.value);
                    }}
                  >
                    {m.ai_adopt()}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
