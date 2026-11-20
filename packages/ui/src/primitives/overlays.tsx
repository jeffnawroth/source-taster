// SPDX-License-Identifier: AGPL-3.0-or-later
// Adapted from Adobe's RAC Tailwind starter; see ../../NOTICE.md.
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type ReactNode,
} from "react";
import * as Aria from "react-aria-components";
import { X } from "lucide-react";
import { Button, IconButton } from "./actions.tsx";
import { cx, styles } from "./utils.ts";
const ModalityContext = createContext(false);

export function Tooltip(props: Aria.TooltipProps) {
  return (
    <Aria.Tooltip
      {...props}
      className={styles(
        props.className,
        "st-tooltip rounded-md border border-border bg-surface px-3 py-2 font-sans text-xs text-text shadow-raised",
      )}
    />
  );
}
export function Popover(props: Aria.PopoverProps) {
  return (
    <Aria.Popover
      {...props}
      isNonModal
      children={Aria.composeRenderProps(props.children, (content) => (
        <ModalityContext.Provider value={false}>
          {content}
        </ModalityContext.Provider>
      ))}
      className={styles(
        props.className,
        "st-popover st-enter rounded-lg border border-border bg-surface p-1 font-sans text-base text-text shadow-lifted",
      )}
    />
  );
}
/**
 * How long a closing modal may stay mounted. The exit transition lasts
 * `--st-duration-fast` (160 ms); this is the safety margin after which it is
 * removed regardless (see the cancelled-animation spec in test/primitives.spec.ts).
 */
const exitGraceMs = 600;

export function Modal({
  children,
  sheet,
  material = "dialog",
  ...props
}: Aria.ModalOverlayProps & {
  sheet?: "left" | "right";
  material?: "surface" | "dialog" | "command-palette";
}) {
  // react-aria unmounts a closing modal only after every animation it collected
  // at the start of the exit has *finished*. If one is cancelled instead (WebKit
  // can replace the running entry transition when `data-exiting` retargets it),
  // the modal stays mounted, invisible but modal, in `data-exiting` for good.
  // A closing modal therefore gets a bounded exit: past `exitGraceMs` it is
  // removed, which also restores focus to its trigger.
  const triggerState = useContext(Aria.OverlayTriggerStateContext);
  const open = props.isOpen ?? triggerState?.isOpen;
  const [abandoned, setAbandoned] = useState(false);
  const abandon = useCallback(() => setAbandoned(true), []);
  if (abandoned && open) setAbandoned(false);
  if (abandoned) return null;
  return (
    <Aria.ModalOverlay
      {...props}
      isDismissable={props.isDismissable ?? true}
      className={styles(
        props.className,
        cx(
          "st-modal-overlay",
          material === "command-palette" && "st-command-overlay",
        ),
      )}
    >
      {({ state }) => (
        <ModalFrame
          close={() => state.close()}
          closing={!state.isOpen}
          abandon={abandon}
          keyboardDismissDisabled={props.isKeyboardDismissDisabled}
          sheet={sheet}
          material={material}
        >
          {children}
        </ModalFrame>
      )}
    </Aria.ModalOverlay>
  );
}
function ModalFrame({
  close,
  closing,
  abandon,
  keyboardDismissDisabled,
  sheet,
  material,
  children,
}: {
  close: () => void;
  /** The modal has been asked to close and is playing its exit. */
  closing: boolean;
  /** Removes the modal now; used when its exit never ends. */
  abandon: () => void;
  keyboardDismissDisabled?: boolean;
  sheet?: "left" | "right";
  material: "surface" | "dialog" | "command-palette";
  children: Aria.ModalOverlayProps["children"];
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!closing) return;
    const timer = setTimeout(abandon, exitGraceMs);
    return () => clearTimeout(timer);
  }, [closing, abandon]);
  useEffect(() => {
    // Tooltip's document-capture listener consumes Escape on focused icon controls.
    // Close this modal first in that case; leave nested menus/selects to RAC.
    function onKeyDown(event: KeyboardEvent) {
      if (
        event.key !== "Escape" ||
        keyboardDismissDisabled ||
        !(event.target instanceof Element)
      )
        return;
      if (
        event.target.closest(".st-icon-button") &&
        event.target.closest(".st-modal") === ref.current
      ) {
        event.preventDefault();
        event.stopPropagation();
        close();
      }
    }
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [close, keyboardDismissDisabled]);
  return (
    <Aria.Modal
      ref={ref}
      data-st-glass={
        material === "command-palette"
          ? "glass-overlay"
          : material === "dialog"
            ? "glass"
            : undefined
      }
      data-st-layer={material === "command-palette" ? material : undefined}
      className={cx(
        "st-modal st-enter font-sans text-text",
        material !== "surface" ? "st-glass" : "bg-surface shadow-lifted",
        sheet && `st-sheet st-sheet-${sheet}`,
      )}
    >
      {Aria.composeRenderProps(children, (content) => (
        <ModalityContext.Provider value={true}>
          {content}
        </ModalityContext.Provider>
      ))}
    </Aria.Modal>
  );
}

export function Sheet(
  props: Aria.ModalOverlayProps & { side?: "left" | "right" },
) {
  const { side = "left", ...rest } = props;
  // Prototype 194 D .hist is .st-glass.quiet, the calm strong glass of floating layers.
  return <Modal {...rest} material="dialog" sheet={side} />;
}
export function Dialog(props: Aria.DialogProps) {
  const isModal = useContext(ModalityContext);
  return (
    <Aria.Dialog
      {...props}
      render={(domProps) => (
        <section {...domProps} aria-modal={isModal || undefined} />
      )}
      className={cx("st-dialog st-focus", props.className)}
    />
  );
}
export function DialogHeading(props: Aria.HeadingProps) {
  return (
    <Aria.Heading
      {...props}
      slot="title"
      className={cx("m-0 text-lg font-semibold", props.className)}
    />
  );
}
export function DialogContent({
  title,
  closeLabel,
  children,
}: {
  title: string;
  closeLabel: string;
  children: ReactNode;
}) {
  return (
    <Dialog>
      {({ close }) => (
        <>
          <div className="flex items-start justify-between gap-3">
            <DialogHeading>{title}</DialogHeading>
            <IconButton label={closeLabel} onPress={close}>
              <X aria-hidden="true" size={20} strokeWidth={1.75} />
            </IconButton>
          </div>
          {children}
        </>
      )}
    </Dialog>
  );
}
export function AlertDialog({
  title,
  children,
  cancelLabel,
  actionLabel,
  actionIcon,
  onAction,
}: {
  title: string;
  children: ReactNode;
  cancelLabel: string;
  actionLabel: string;
  actionIcon?: ReactNode;
  onAction: () => void;
}) {
  return (
    <Dialog role="alertdialog" className="st-alert-dialog">
      {({ close }) => (
        <>
          <DialogHeading>{title}</DialogHeading>
          <p>{children}</p>
          <div className="st-actions">
            <Button autoFocus variant="ghost" onPress={close}>
              {cancelLabel}
            </Button>
            <Button
              variant="danger"
              icon={actionIcon}
              onPress={() => {
                onAction();
                close();
              }}
            >
              {actionLabel}
            </Button>
          </div>
        </>
      )}
    </Dialog>
  );
}
export type GlassLayer =
  "topbar" | "summary-strip" | "detail-header" | "command-palette";
export function GlassSurface({
  layer,
  ...props
}: ComponentPropsWithRef<"div"> & { layer: GlassLayer }) {
  return (
    <div
      {...props}
      data-st-glass={layer === "command-palette" ? "glass-overlay" : "glass"}
      data-st-layer={layer}
      className={cx("st-glass text-text", props.className)}
    />
  );
}
export {
  DialogTrigger,
  MenuTrigger,
  TooltipTrigger,
} from "react-aria-components";
