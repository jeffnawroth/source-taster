// SPDX-License-Identifier: AGPL-3.0-or-later
import { m } from "@source-taster/i18n";
import { Button } from "./index.tsx";
import { usedPercent, type OwnerQuota } from "./quota.ts";

function UpgradeLink({ href }: { href?: string }) {
  return href ? (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="ml-2 font-semibold underline"
      data-testid="quota-upgrade"
    >
      {m.quota_upgrade()}
    </a>
  ) : null;
}

/** Balance and consumption, always visible; warns with an upgrade offer at 80 % and 100 %. */
export function QuotaMeter({
  quota,
  upgradeUrl,
}: {
  quota: OwnerQuota;
  upgradeUrl?: string;
}) {
  const used = usedPercent(quota);
  return (
    <section
      aria-label={m.quota_meter_label()}
      data-testid="quota-meter"
      className="mb-6 rounded-xl border border-slate-300 bg-white p-4"
    >
      <p className="font-semibold">{m.quota_meter_label()}</p>
      <progress
        className="my-2 w-full"
        max={Math.max(quota.granted, 1)}
        value={Math.min(quota.consumed + quota.reserved, quota.granted)}
        aria-label={m.quota_meter_label()}
      />
      <p role="status" aria-live="polite" data-testid="quota-summary">
        {m.quota_meter_summary({
          remaining: String(quota.remaining),
          granted: String(quota.granted),
          consumed: String(quota.consumed),
        })}
        {quota.reserved > 0 &&
          ` · ${m.quota_meter_reserved({ reserved: String(quota.reserved) })}`}
        <span className="sr-only"> ({used} %)</span>
      </p>
      {quota.warning !== "none" && (
        <p
          role="alert"
          data-testid={`quota-warning-${quota.warning}`}
          className="mt-3 rounded-lg border border-amber-400 bg-amber-50 p-3 text-amber-950"
        >
          {quota.warning === "exhausted"
            ? m.quota_warning_exhausted()
            : m.quota_warning_eighty()}
          <UpgradeLink href={upgradeUrl} />
        </p>
      )}
    </section>
  );
}

/** The meter's place while the balance is read or cannot be read. Never a number. */
export function QuotaPending({ state }: { state: "loading" | "unavailable" }) {
  return (
    <section
      aria-label={m.quota_meter_label()}
      aria-busy={state === "loading"}
      data-testid="quota-meter"
      className="mb-6 rounded-xl border border-slate-300 bg-white p-4"
    >
      <p className="font-semibold">{m.quota_meter_label()}</p>
      <p data-testid={`quota-${state}`}>
        {state === "loading" ? m.quota_loading() : m.quota_unavailable()}
      </p>
    </section>
  );
}

/** Before a start that does not fit: the first N in input order, or an upgrade. */
export function QuotaChoice({
  required,
  available,
  upgradeUrl,
  onFirst,
  onDismiss,
}: {
  required: number;
  available: number;
  upgradeUrl?: string;
  onFirst: () => void;
  onDismiss: () => void;
}) {
  return (
    <section
      role="alertdialog"
      aria-labelledby="quota-choice-title"
      data-testid="quota-choice"
      className="mt-6 rounded-xl border border-amber-400 bg-amber-50 p-4 text-amber-950"
    >
      <h2 id="quota-choice-title" className="font-semibold">
        {m.quota_choice_heading()}
      </h2>
      <p className="my-2">
        {available > 0
          ? m.quota_choice_body({
              required: String(required),
              available: String(available),
            })
          : m.quota_choice_none({ required: String(required) })}
      </p>
      <div className="flex flex-wrap items-center gap-3">
        {available > 0 && (
          <Button
            type="button"
            onPress={onFirst}
            className="rounded-xl bg-teal-800 px-5 py-3 font-semibold text-white hover:bg-teal-900"
          >
            {m.quota_choice_first({ available: String(available) })}
          </Button>
        )}
        <UpgradeLink href={upgradeUrl} />
        <Button
          type="button"
          onPress={onDismiss}
          className="rounded-xl border border-slate-600 px-5 py-3 font-semibold"
        >
          {m.quota_choice_dismiss()}
        </Button>
      </div>
    </section>
  );
}
