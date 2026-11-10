// SPDX-License-Identifier: AGPL-3.0-or-later
// Adapted from Adobe's RAC Tailwind starter; see ../../NOTICE.md.
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import * as Aria from "react-aria-components";
import { Check, Minus } from "lucide-react";
import { cx, describedBy, styles } from "./utils.ts";
import {
  Label,
  Description,
  FieldError,
  Select,
  ListBoxItem,
} from "./fields.tsx";
import { focusRing, buttonRecipe } from "../recipes.ts";
import { IconButton, type Availability } from "./actions.tsx";
import { X } from "lucide-react";
const choice = `${focusRing} st-choice flex min-h-9 min-w-6 items-start gap-2 text-base text-text [overflow-wrap:anywhere]`;
export function Checkbox({
  disabledReason,
  ...props
}: Omit<Aria.CheckboxProps, "isDisabled"> & Availability) {
  const reasonId = useId();
  return (
    <Aria.Checkbox
      {...props}
      aria-describedby={describedBy(
        props["aria-describedby"],
        disabledReason && reasonId,
      )}
      className={styles(props.className, `${choice} st-checkbox`)}
    >
      {Aria.composeRenderProps(
        props.children,
        (children, { isIndeterminate, isSelected }) => (
          <>
            <span className="st-choice-mark" aria-hidden="true">
              {isIndeterminate ? (
                <Minus size={16} strokeWidth={1.75} />
              ) : (
                isSelected && <Check size={16} strokeWidth={1.75} />
              )}
            </span>
            <span>
              {children}
              {disabledReason && (
                <span
                  id={reasonId}
                  className="block text-xs text-text-secondary"
                >
                  {disabledReason}
                </span>
              )}
            </span>
          </>
        ),
      )}
    </Aria.Checkbox>
  );
}
export function CheckboxGroup({
  label,
  description,
  errorMessage,
  children,
  ...props
}: Omit<Aria.CheckboxGroupProps, "children"> & {
  label: string;
  description?: string;
  errorMessage?: string;
  children: ReactNode;
}) {
  return (
    <Aria.CheckboxGroup
      {...props}
      className={styles(
        props.className,
        "st-field flex min-w-0 flex-col gap-2",
      )}
    >
      <Label>{label}</Label>
      {children}
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
    </Aria.CheckboxGroup>
  );
}
export function RadioGroup({
  label,
  description,
  errorMessage,
  children,
  ...props
}: Omit<Aria.RadioGroupProps, "children"> & {
  label: string;
  description?: string;
  errorMessage?: string;
  children: ReactNode;
}) {
  return (
    <Aria.RadioGroup
      {...props}
      className={styles(
        props.className,
        "st-field flex min-w-0 flex-col gap-2",
      )}
    >
      <Label>{label}</Label>
      {children}
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
    </Aria.RadioGroup>
  );
}
export function Radio({
  disabledReason,
  ...props
}: Omit<Aria.RadioProps, "isDisabled"> & Availability) {
  const reasonId = useId();
  return (
    <Aria.Radio
      {...props}
      aria-describedby={describedBy(
        props["aria-describedby"],
        disabledReason && reasonId,
      )}
      className={styles(props.className, `${choice} st-radio`)}
    >
      {Aria.composeRenderProps(props.children, (children) => (
        <>
          <span className="st-choice-mark" aria-hidden="true" />
          <span>
            {children}
            {disabledReason && (
              <span id={reasonId} className="block text-xs text-text-secondary">
                {disabledReason}
              </span>
            )}
          </span>
        </>
      ))}
    </Aria.Radio>
  );
}
export function Switch({
  disabledReason,
  ...props
}: Omit<Aria.SwitchProps, "isDisabled"> & Availability) {
  const reasonId = useId();
  return (
    <Aria.Switch
      {...props}
      aria-describedby={describedBy(
        props["aria-describedby"],
        disabledReason && reasonId,
      )}
      className={styles(props.className, `${choice} st-switch`)}
    >
      {Aria.composeRenderProps(props.children, (children) => (
        <>
          <span className="st-switch-track" aria-hidden="true">
            <span />
          </span>
          <span>
            {children}
            {disabledReason && (
              <span id={reasonId} className="block text-xs text-text-secondary">
                {disabledReason}
              </span>
            )}
          </span>
        </>
      ))}
    </Aria.Switch>
  );
}
export type Segment = { id: string; label: string };
// Measure translated labels: an overflowing segmented group becomes a Select.
export function SegmentedControl({
  label,
  items,
  value,
  onChange,
  compact,
}: {
  label: string;
  items: Segment[];
  value: string;
  onChange: (value: string) => void;
  compact?: boolean;
}) {
  const container = useRef<HTMLDivElement>(null);
  const probe = useRef<HTMLDivElement>(null);
  const [doesNotFit, setDoesNotFit] = useState(false);
  useEffect(() => {
    const measure = () => {
      if (container.current && probe.current)
        setDoesNotFit(
          probe.current.scrollWidth > container.current.clientWidth,
        );
    };
    const observer = new ResizeObserver(measure);
    if (container.current) observer.observe(container.current);
    if (probe.current) observer.observe(probe.current);
    const frame = requestAnimationFrame(measure);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [items]);
  return (
    <div
      ref={container}
      className="st-segmented-container relative min-w-0 max-w-full"
    >
      <div
        className="pointer-events-none invisible absolute h-0 w-full overflow-hidden"
        aria-hidden="true"
      >
        <div ref={probe} className="flex w-max gap-1 p-1">
          {items.map((item) => (
            <span
              key={item.id}
              className={`${buttonRecipe()} whitespace-nowrap`}
            >
              {item.label}
            </span>
          ))}
        </div>
      </div>
      {(compact ?? doesNotFit) ? (
        <Select
          label={label}
          selectedKey={value}
          onSelectionChange={(key) => {
            if (key != null) onChange(String(key));
          }}
        >
          {items.map((item) => (
            <ListBoxItem id={item.id} key={item.id}>
              {item.label}
            </ListBoxItem>
          ))}
        </Select>
      ) : (
        <Aria.ToggleButtonGroup
          aria-label={label}
          selectionMode="single"
          disallowEmptySelection
          selectedKeys={[value]}
          onSelectionChange={(keys) => {
            const key = [...keys][0];
            if (key != null) onChange(String(key));
          }}
          className="st-segmented flex max-w-full gap-1 rounded-full bg-surface-sunken p-1"
        >
          {items.map((item) => (
            <Aria.ToggleButton
              id={item.id}
              key={item.id}
              className={`${buttonRecipe()} st-segment relative border-transparent bg-transparent`}
            >
              <Aria.SelectionIndicator className="st-selection-indicator absolute inset-0 rounded-full bg-surface shadow-raised" />
              <span className="relative">{item.label}</span>
            </Aria.ToggleButton>
          ))}
        </Aria.ToggleButtonGroup>
      )}
    </div>
  );
}

export function TagGroup<T extends object>({
  label,
  children,
  items,
  ...props
}: Omit<Aria.TagGroupProps, "children"> & {
  label: string;
  children: ReactNode | ((item: T) => ReactNode);
} & { items?: Iterable<T> }) {
  return (
    <Aria.TagGroup
      {...props}
      className={cx("flex min-w-0 flex-col gap-1", props.className)}
    >
      <Label>{label}</Label>
      <Aria.TagList items={items} className="flex flex-wrap gap-2">
        {children}
      </Aria.TagList>
    </Aria.TagGroup>
  );
}
export function Tag({
  label,
  removeLabel,
  ...props
}: Omit<Aria.TagProps, "children"> & { label: string; removeLabel: string }) {
  return (
    <Aria.Tag
      {...props}
      textValue={label}
      className={styles(
        props.className,
        `${focusRing} inline-flex min-h-7 max-w-full items-center gap-1 rounded-full border border-border bg-surface px-2 text-sm text-text [overflow-wrap:anywhere]`,
      )}
    >
      {({ allowsRemoving }) => (
        <>
          <span>{label}</span>
          {allowsRemoving && (
            <IconButton slot="remove" label={removeLabel} size="sm">
              <X aria-hidden="true" size={16} strokeWidth={1.75} />
            </IconButton>
          )}
        </>
      )}
    </Aria.Tag>
  );
}
