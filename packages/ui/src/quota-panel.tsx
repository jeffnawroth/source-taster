// SPDX-License-Identifier: AGPL-3.0-or-later
import { m } from "@source-taster/i18n";
import { Button, LinkButton } from "./primitives/index.ts";
import { Shield } from "lucide-react";
import { List } from "./workspace-icons.tsx";
import { usedPercent, type OwnerQuota } from "./quota.ts";

export function UpgradeLink({ href }: { href?: string }) {
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

/** #194 D intake/feed use one informational balance row; the popover owns the meter. */
export function QuotaBalance({
  quota,
  upgradeUrl,
  consumed,
}: {
  quota: OwnerQuota;
  upgradeUrl?: string;
  /** #194 D feed .foot: the open Check's billed References lead the line. */
  consumed?: number;
}) {
  return (
    <div data-testid="quota-meter" data-warning={quota.warning}>
      <p className="note-row">
        {consumed === undefined ? (
          <Shield aria-hidden="true" size={16} />
        ) : (
          <List aria-hidden="true" size={16} />
        )}
        <span role="status" aria-live="polite" data-testid="quota-summary">
          {consumed === undefined
            ? `${m.quota_meter_label()}: `
            : `${m.feed_consumed({ count: String(consumed) })} · `}
          {m.quota_meter_summary({
            remaining: String(quota.remaining),
            granted: String(quota.granted),
          })}
          {quota.reserved > 0 &&
            ` · ${m.quota_meter_reserved({ reserved: String(quota.reserved) })}`}
        </span>
      </p>
      {quota.warning !== "none" && (
        <p
          role="alert"
          className="note-row"
          data-testid={`quota-warning-${quota.warning}`}
        >
          <span>
            {quota.warning === "exhausted"
              ? m.quota_warning_exhausted()
              : m.quota_warning_eighty()}
            <UpgradeLink href={upgradeUrl} />
          </span>
        </p>
      )}
    </div>
  );
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
      data-warning={quota.warning}
      className="mb-6 rounded-xl border border-border-emphasis bg-surface p-4"
    >
      <p className="font-semibold">{m.quota_meter_label()}</p>
      <progress
        className="my-2 w-full"
        max={Math.max(quota.granted, 1)}
        value={Math.max(0, Math.min(quota.remaining, quota.granted))}
        aria-label={m.quota_meter_label()}
        aria-valuetext={m.quota_meter_summary({
          remaining: String(quota.remaining),
          granted: String(quota.granted),
        })}
      />
      <p role="status" aria-live="polite" data-testid="quota-summary">
        {m.quota_meter_summary({
          remaining: String(quota.remaining),
          granted: String(quota.granted),
        })}
        {quota.reserved > 0 &&
          ` · ${m.quota_meter_reserved({ reserved: String(quota.reserved) })}`}
        <span className="sr-only"> ({used} %)</span>
      </p>
      {quota.warning !== "none" && (
        <p
          role="alert"
          data-testid={`quota-warning-${quota.warning}`}
          className="mt-3 rounded-lg border border-border-emphasis bg-surface-sunken p-3 text-text"
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
      className="mb-6 rounded-xl border border-border-emphasis bg-surface p-4"
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
  pending = false,
  layout = "panel",
}: {
  required: number;
  available: number;
  upgradeUrl?: string;
  onFirst: () => void;
  onDismiss: () => void;
  pending?: boolean;
  /** Counted strip supplies the description alongside its recognized count. */
  layout?: "panel" | "strip";
}) {
  return (
    <section
      role="alertdialog"
      aria-labelledby="quota-choice-title"
      aria-describedby={layout === "strip" ? "counted-consumption" : undefined}
      data-testid="quota-choice"
      className="mt-6 rounded-xl border border-border-emphasis bg-surface-sunken p-4 text-text"
    >
      <h2
        id="quota-choice-title"
        className={layout === "strip" ? "sr-only" : "font-semibold"}
      >
        {m.quota_choice_heading()}
      </h2>
      {layout !== "strip" && (
        <p className="my-2">
          {available > 0
            ? m.quota_choice_body({
                required: String(required),
                available: String(available),
              })
            : m.quota_choice_none({ required: String(required) })}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-3">
        {available > 0 && (
          <Button
            type="button"
            variant="primary"
            onPress={onFirst}
            isPending={pending}
          >
            {m.quota_choice_first({ available: String(available) })}
          </Button>
        )}
        {/* #194 D short choice: Change plan is a small secondary button. */}
        {upgradeUrl && (
          <LinkButton
            href={upgradeUrl}
            target="_blank"
            newTabLabel={m.shell_new_tab()}
            size="sm"
            data-testid="quota-upgrade"
          >
            {m.quota_upgrade()}
          </LinkButton>
        )}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onPress={onDismiss}
          {...(pending
            ? { isDisabled: true as const, disabledReason: m.check_starting() }
            : { isDisabled: false as const })}
        >
          {m.quota_choice_dismiss()}
        </Button>
      </div>
    </section>
  );
}
