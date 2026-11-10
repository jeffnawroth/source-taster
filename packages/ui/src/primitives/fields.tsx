// SPDX-License-Identifier: AGPL-3.0-or-later
// Adapted from Adobe's RAC Tailwind starter; see ../../NOTICE.md.
import { useCallback, useLayoutEffect, useRef, type ReactNode } from "react";
import * as Aria from "react-aria-components";
import { CircleAlert, Search, X, ChevronDown, Check } from "lucide-react";
import { cx, styles } from "./utils.ts";
import { IconButton } from "./actions.tsx";
import { Popover } from "./overlays.tsx";
import { focusRing } from "../recipes.ts";
export function Label(props: Aria.LabelProps) {
  return (
    <Aria.Label
      {...props}
      className={cx(
        "text-sm font-medium text-text [overflow-wrap:anywhere]",
        props.className,
      )}
    />
  );
}
export function Description(props: Aria.TextProps) {
  return (
    <Aria.Text
      {...props}
      slot="description"
      className={cx(
        "text-xs text-text-secondary [overflow-wrap:anywhere]",
        props.className,
      )}
    />
  );
}
export function FieldError(props: Aria.FieldErrorProps) {
  return (
    <Aria.FieldError
      {...props}
      className={styles(
        props.className,
        "flex items-start gap-1 text-xs text-feedback-danger [overflow-wrap:anywhere]",
      )}
    >
      {Aria.composeRenderProps(
        props.children,
        (children, { validationErrors }) => (
          <>
            <CircleAlert
              aria-hidden="true"
              size={16}
              strokeWidth={1.75}
              className="shrink-0"
            />
            {children ?? validationErrors.join(" ")}
          </>
        ),
      )}
    </Aria.FieldError>
  );
}
export function Input(props: Aria.InputProps) {
  return (
    <Aria.Input
      {...props}
      className={styles(
        props.className,
        `st-input ${focusRing} min-h-9 min-w-0 w-full rounded-md border border-border-emphasis bg-surface px-3 py-1 font-sans text-base text-text placeholder:text-text-muted`,
      )}
    />
  );
}
export type FieldContent = {
  label: string;
  description?: string;
  errorMessage?: string | ((validation: Aria.ValidationResult) => string);
  requiredLabel?: string;
};
type DisabledField =
  | { isDisabled: true; disabledReason: string }
  | { isDisabled?: false; disabledReason?: never };
export type TextFieldProps = Omit<
  Aria.TextFieldProps,
  "children" | "isDisabled"
> &
  FieldContent &
  DisabledField & { placeholder?: string; multiline?: boolean };
export function TextField({
  label,
  description,
  errorMessage,
  requiredLabel,
  disabledReason,
  placeholder,
  multiline,
  ...props
}: TextFieldProps) {
  return (
    <Aria.TextField
      {...props}
      className={styles(
        props.className,
        "st-field flex min-w-0 flex-col gap-1",
      )}
    >
      <Label>
        {label}
        {props.isRequired && ` (${requiredLabel ?? "required"})`}
      </Label>
      {multiline ? (
        <TextArea placeholder={placeholder} />
      ) : (
        <Input placeholder={placeholder} />
      )}
      {(description || disabledReason) && (
        <Description>
          {description}
          {description && disabledReason && " · "}
          {disabledReason}
        </Description>
      )}
      <FieldError>{errorMessage}</FieldError>
    </Aria.TextField>
  );
}
export function TextArea(props: Aria.TextAreaProps) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const resize = useCallback(() => {
    if (ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height = `${Math.min(ref.current.scrollHeight, 320)}px`;
    }
  }, []);
  useLayoutEffect(resize, [resize, props.value, props.defaultValue]);
  return (
    <Aria.TextArea
      {...props}
      ref={ref}
      onChange={(event) => {
        resize();
        props.onChange?.(event);
      }}
      className={styles(
        props.className,
        `st-input st-textarea ${focusRing} min-h-9 w-full min-w-0 rounded-md border border-border-emphasis bg-surface px-3 py-2 font-sans text-base text-text`,
      )}
    />
  );
}
export type SearchFieldProps = Omit<
  Aria.SearchFieldProps,
  "children" | "isDisabled"
> &
  FieldContent &
  DisabledField & { clearLabel: string };
export function SearchField({
  label,
  description,
  errorMessage,
  requiredLabel,
  disabledReason,
  clearLabel,
  ...props
}: SearchFieldProps) {
  return (
    <Aria.SearchField
      {...props}
      className={styles(
        props.className,
        "st-field st-search flex min-w-0 flex-col gap-1",
      )}
    >
      <Label>
        {label}
        {props.isRequired && ` (${requiredLabel ?? "required"})`}
      </Label>
      <div className="st-search-control">
        <Search aria-hidden="true" size={20} strokeWidth={1.75} />
        <Input />
        <IconButton slot="clear" label={clearLabel} size="sm">
          <X aria-hidden="true" size={16} strokeWidth={1.75} />
        </IconButton>
      </div>
      {(description || disabledReason) && (
        <Description>
          {description}
          {description && disabledReason && " · "}
          {disabledReason}
        </Description>
      )}
      <FieldError>{errorMessage}</FieldError>
    </Aria.SearchField>
  );
}
export function Select<T extends object>({
  label,
  description,
  errorMessage,
  requiredLabel,
  disabledReason,
  children,
  items,
  ...props
}: Omit<Aria.SelectProps<T>, "children" | "isDisabled"> &
  FieldContent &
  DisabledField & {
    items?: Iterable<T>;
    children: ReactNode | ((item: T) => ReactNode);
  }) {
  return (
    <Aria.Select
      {...props}
      className={styles(
        props.className,
        "st-field flex min-w-0 flex-col gap-1",
      )}
    >
      <Label>
        {label}
        {props.isRequired && ` (${requiredLabel ?? "required"})`}
      </Label>
      <Aria.Button
        className={`st-input ${focusRing} flex min-h-9 w-full items-center gap-2 rounded-md border border-border-emphasis bg-surface px-3 py-1 text-start text-base text-text`}
      >
        <Aria.SelectValue className="min-w-0 flex-1 truncate">
          {({ selectedText, defaultChildren }) => (
            <span title={selectedText}>{selectedText || defaultChildren}</span>
          )}
        </Aria.SelectValue>
        <ChevronDown
          aria-hidden="true"
          size={20}
          strokeWidth={1.75}
          className="shrink-0"
        />
      </Aria.Button>
      {(description || disabledReason) && (
        <Description>
          {description}
          {description && disabledReason && " · "}
          {disabledReason}
        </Description>
      )}
      <FieldError>{errorMessage}</FieldError>
      <Popover className="st-select-popover">
        <Aria.ListBox items={items} className="st-listbox">
          {children}
        </Aria.ListBox>
      </Popover>
    </Aria.Select>
  );
}
export function ComboBox<T extends object>({
  label,
  description,
  errorMessage,
  requiredLabel,
  disabledReason,
  children,
  ...props
}: Omit<Aria.ComboBoxProps<T>, "children" | "isDisabled"> &
  FieldContent &
  DisabledField & { children: ReactNode | ((item: T) => ReactNode) }) {
  const { contains } = Aria.useFilter({ sensitivity: "base" });
  return (
    <Aria.ComboBox
      {...props}
      defaultFilter={contains}
      className={styles(
        props.className,
        "st-field flex min-w-0 flex-col gap-1",
      )}
    >
      <Label>
        {label}
        {props.isRequired && ` (${requiredLabel ?? "required"})`}
      </Label>
      <Aria.Group className="st-combobox-control">
        <Input />
        <Aria.Button
          aria-label={label}
          className={`${focusRing} flex size-9 shrink-0 items-center justify-center rounded-full text-text`}
        >
          <ChevronDown aria-hidden="true" size={20} strokeWidth={1.75} />
        </Aria.Button>
      </Aria.Group>
      {(description || disabledReason) && (
        <Description>
          {description}
          {description && disabledReason && " · "}
          {disabledReason}
        </Description>
      )}
      <FieldError>{errorMessage}</FieldError>
      <Popover className="st-select-popover">
        <Aria.ListBox className="st-listbox">{children}</Aria.ListBox>
      </Popover>
    </Aria.ComboBox>
  );
}
export function ListBoxItem(props: Aria.ListBoxItemProps) {
  return (
    <Aria.ListBoxItem
      {...props}
      textValue={
        props.textValue ??
        (typeof props.children === "string" ? props.children : undefined)
      }
      className={styles(props.className, `st-option ${focusRing}`)}
    >
      {Aria.composeRenderProps(props.children, (children, { isSelected }) => (
        <>
          <span className="min-w-0 flex-1">{children}</span>
          {isSelected && (
            <Check aria-hidden="true" size={16} strokeWidth={1.75} />
          )}
        </>
      ))}
    </Aria.ListBoxItem>
  );
}
export function Form(props: Aria.FormProps) {
  return (
    <Aria.Form
      {...props}
      className={cx("flex min-w-0 flex-col gap-4", props.className)}
    />
  );
}
export function DropZone(props: Aria.DropZoneProps) {
  return (
    <Aria.DropZone
      {...props}
      className={styles(
        props.className,
        "st-dropzone rounded-lg border border-dashed border-border-emphasis bg-surface p-4 text-text",
      )}
    />
  );
}
