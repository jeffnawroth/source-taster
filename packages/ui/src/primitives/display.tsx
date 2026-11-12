// SPDX-License-Identifier: AGPL-3.0-or-later
// Adapted from Adobe's RAC Tailwind starter; see ../../NOTICE.md.
import type { HTMLAttributes, ReactNode } from "react";
import * as Aria from "react-aria-components";
import { CircleAlert, CircleCheck, Info, TriangleAlert } from "lucide-react";
import { badgeRecipe, bannerRecipe, kbdRecipe } from "../recipes.ts";
import { cx, styles } from "./utils.ts";
export type Tone = "info" | "success" | "warning" | "danger";
export function FeedbackIcon({ tone = "info" }: { tone?: Tone }) {
  const Icon = {
    info: Info,
    success: CircleCheck,
    warning: TriangleAlert,
    danger: CircleAlert,
  }[tone];
  return (
    <Icon
      aria-hidden="true"
      size={20}
      strokeWidth={1.75}
      className={`st-feedback-icon st-${tone} shrink-0`}
    />
  );
}
export function Badge(props: HTMLAttributes<HTMLSpanElement>) {
  return <span {...props} className={cx(badgeRecipe(), props.className)} />;
}
export function Kbd({
  modifier,
  ...props
}: HTMLAttributes<HTMLElement> & { modifier?: "apple" | "other" }) {
  return (
    <kbd {...props} className={cx(kbdRecipe(), props.className)}>
      {modifier && (modifier === "apple" ? "⌘" : "Ctrl+")}
      {props.children}
    </kbd>
  );
}
export function Banner({
  tone = "info",
  action,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & { tone?: Tone; action?: ReactNode }) {
  return (
    <div
      {...props}
      role={tone === "danger" ? "alert" : "status"}
      className={cx(bannerRecipe({ tone }), props.className)}
    >
      <FeedbackIcon tone={tone} />
      <div className="min-w-0 flex-1">{children}</div>
      {action}
    </div>
  );
}
export function Spinner({
  size = 20,
  label,
}: {
  size?: 16 | 20;
  label?: string;
}) {
  return (
    <svg
      className="st-spinner shrink-0"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      role={label ? "status" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        fill="none"
        stroke="var(--st-border-emphasis)"
        strokeWidth="2"
      />
      <circle
        className="st-spinner-arc"
        cx="12"
        cy="12"
        r="9"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray="36 64"
        pathLength="100"
      />
    </svg>
  );
}
export function Skeleton(props: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      aria-hidden="true"
      className={cx(
        "st-skeleton rounded-md bg-surface-sunken",
        props.className,
      )}
    />
  );
}
export function ProgressBar({
  label,
  ...props
}: Omit<Aria.ProgressBarProps, "isIndeterminate"> & { label: string }) {
  return (
    <Aria.ProgressBar
      {...props}
      className={styles(
        props.className,
        "st-progress flex flex-col gap-1 text-sm text-text",
      )}
    >
      {({ percentage, valueText }) => (
        <>
          <Aria.Label>{label}</Aria.Label>
          <span className="text-xs text-text-secondary">{valueText}</span>
          <div className="st-track">
            <div className="st-fill" style={{ width: `${percentage ?? 0}%` }} />
          </div>
        </>
      )}
    </Aria.ProgressBar>
  );
}
export function Meter({
  label,
  warning,
  ...props
}: Aria.MeterProps & { label: string; warning?: string }) {
  return (
    <Aria.Meter
      {...props}
      className={styles(
        props.className,
        "st-progress flex flex-col gap-1 text-sm text-text",
      )}
    >
      {({ percentage, valueText }) => (
        <>
          <Aria.Label>{label}</Aria.Label>
          <span>{valueText}</span>
          <div className="st-track">
            <div
              className={cx("st-fill", warning && "st-warning-fill")}
              style={{ width: `${percentage ?? 0}%` }}
            />
          </div>
          {warning && (
            <span className="flex gap-1">
              <FeedbackIcon tone="warning" />
              {warning}
            </span>
          )}
        </>
      )}
    </Aria.Meter>
  );
}
export function Separator(props: Aria.SeparatorProps) {
  return (
    <Aria.Separator
      {...props}
      className={cx("st-separator border-border", props.className)}
    />
  );
}
