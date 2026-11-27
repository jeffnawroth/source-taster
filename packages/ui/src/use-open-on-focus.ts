// SPDX-License-Identifier: AGPL-3.0-or-later
import { useEffect, useRef, useState } from "react";
import { afterPress } from "./after-press.ts";

/**
 * Whether a field that opens for focus is open.
 *
 * The browser decides when focus reaches the page, not the page. A field that
 * asks for focus on mount holds it from then on, but a document that is not
 * active yet (a freshly opened browser sidebar) reports no focus, and delivers
 * it with the first press into the document. That focus can reach the page just
 * before the pointer goes down, so a field that grew on `:focus-within` would
 * move the controls below it away from the pointer, and the press would land on
 * whatever moved underneath.
 *
 * Three rules keep the field from moving under a pointer:
 *
 * - It opens as soon as it is the document's active element, whether or not
 *   the document itself is active (`claim`, from the field's ref).
 * - A change after that (the field gains or loses focus) waits for a pointer
 *   that is down, and is decided once the press has ended, from where focus is
 *   then. Pressing a control below the field takes focus away from it, and
 *   closing at that moment would move the control away from the press.
 * - Focus that leaves the window while the field is still the active element
 *   does not close it: the field closes when focus lands somewhere else in
 *   the document, not when the window loses the pointer or the keyboard.
 */
export function useOpenOnFocus() {
  const [open, setOpen] = useState(false);
  const wrapper = useRef<HTMLElement | null>(null);
  const cancel = useRef<() => void>(() => {});
  useEffect(() => () => cancel.current(), []);
  const holdsFocus = () => {
    const element = wrapper.current;
    return !!element && element.contains(element.ownerDocument.activeElement);
  };
  // The active element is only settled once the focus change that fired the
  // event has finished, so read it on the next task.
  const settle = () => {
    cancel.current();
    // The task runs first, so a press that began in between is seen by
    // afterPress and holds the change until it ends. Both stay cancellable.
    let cancelPress = () => {};
    const timer = setTimeout(() => {
      cancelPress = afterPress(() => setOpen(holdsFocus()));
    }, 0);
    cancel.current = () => {
      clearTimeout(timer);
      cancelPress();
    };
  };
  return {
    open,
    /** Ref callback of the wrapper: opens it if the field already holds focus. */
    claim: (element: HTMLElement | null) => {
      wrapper.current = element;
      if (element && !open && holdsFocus()) setOpen(true);
    },
    onFocus: settle,
    onBlur: settle,
  };
}
