// SPDX-License-Identifier: AGPL-3.0-or-later
// Adapted from Adobe's RAC Tailwind starter; see ../../NOTICE.md.
import { useId, type ReactNode } from "react";
import * as Aria from "react-aria-components";
import { ArrowUpRight } from "lucide-react";
import { buttonRecipe, linkRecipe } from "../recipes.ts";
import { cx, describedBy, styles } from "./utils.ts";
import { Spinner } from "./display.tsx";
import { Tooltip } from "./overlays.tsx";

export type Availability =
  | { isDisabled: true; disabledReason: string }
  | { isDisabled?: false; disabledReason?: never };
type ButtonBase = Omit<Aria.ButtonProps, "isDisabled" | "render"> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "md" | "sm";
};
export type ButtonProps = ButtonBase & Availability;
export function Button({
  variant,
  size,
  disabledReason,
  children,
  ...props
}: ButtonProps) {
  const reasonId = useId();
  const button = (
    <Aria.Button
      {...props}
      render={(domProps, state) => (
        <button {...domProps} aria-busy={state.isPending || undefined} />
      )}
      aria-describedby={describedBy(
        props["aria-describedby"],
        disabledReason && reasonId,
      )}
      className={Aria.composeRenderProps(props.className, (className, state) =>
        cx(
          buttonRecipe({ variant, size, isDisabled: state.isDisabled }),
          className,
        ),
      )}
    >
      {Aria.composeRenderProps(children, (label, { isPending }) => (
        <>
          <span className="st-loading-slot" aria-hidden="true">
            {isPending && <Spinner size={size === "sm" ? 16 : 20} />}
          </span>
          {label}
        </>
      ))}
    </Aria.Button>
  );
  return disabledReason ? (
    <span className="st-disabled-control">
      {button}
      <span id={reasonId} className="text-xs text-text-secondary">
        {disabledReason}
      </span>
    </span>
  ) : (
    button
  );
}
export type IconButtonProps = Omit<
  ButtonBase,
  "children" | "variant" | "aria-label"
> &
  Availability & {
    label: string;
    children: ReactNode;
    variant?: "ghost" | "secondary";
  };
export function IconButton({
  label,
  children,
  size = "md",
  variant = "ghost",
  ...props
}: IconButtonProps) {
  return (
    <Aria.TooltipTrigger delay={600}>
      <Button
        {...props}
        size={size}
        variant={variant}
        aria-label={label}
        className={styles(
          props.className,
          `st-icon-button ${size === "sm" ? "size-7" : "size-9"} shrink-0 p-0`,
        )}
      >
        {children}
      </Button>
      <Tooltip>{label}</Tooltip>
    </Aria.TooltipTrigger>
  );
}
export function ToggleButton({
  size = "md",
  disabledReason,
  ...props
}: Omit<Aria.ToggleButtonProps, "isDisabled"> &
  Availability & { size?: "md" | "sm" }) {
  const reasonId = useId();
  const button = (
    <Aria.ToggleButton
      {...props}
      aria-describedby={describedBy(
        props["aria-describedby"],
        disabledReason && reasonId,
      )}
      className={styles(
        props.className,
        `${buttonRecipe({ size, isDisabled: props.isDisabled })} st-toggle`,
      )}
    />
  );
  return disabledReason ? (
    <span className="st-disabled-control">
      {button}
      <span id={reasonId} className="text-xs text-text-secondary">
        {disabledReason}
      </span>
    </span>
  ) : (
    button
  );
}
export type LinkProps = Aria.LinkProps & { newTabLabel?: string };
export function Link({ children, newTabLabel, ...props }: LinkProps) {
  if (props.target === "_blank" && !newTabLabel)
    throw new Error("External links require a localized newTabLabel.");
  return (
    <Aria.Link
      {...props}
      rel={props.target === "_blank" ? "noopener noreferrer" : props.rel}
      className={styles(props.className, linkRecipe())}
    >
      {Aria.composeRenderProps(children, (label) => (
        <>
          {label}
          {props.target === "_blank" && (
            <>
              <ArrowUpRight aria-hidden="true" size={16} strokeWidth={1.75} />
              <span className="sr-only"> ({newTabLabel})</span>
            </>
          )}
        </>
      ))}
    </Aria.Link>
  );
}
export { FileTrigger } from "react-aria-components";
