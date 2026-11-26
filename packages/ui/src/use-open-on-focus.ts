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
 * The field therefore opens as soon as it is the document's active element,
 * whether or not the document itself is active (`claim`, from the field's ref),
 * and opens on focus otherwise. Focus that arrives while a pointer is down
 * waits for its release. Once open, the field stays open: closing on blur would
 * move the controls below it under the pointer that is pressing one of them,
 * because that press is what takes focus away from the field.
 */
export function useOpenOnFocus() {
  const [open, setOpen] = useState(false);
  const cancel = useRef<() => void>(() => {});
  useEffect(() => () => cancel.current(), []);
  return {
    open,
    /** Ref callback of the field: opens it if it already holds the focus. */
    claim: (field: HTMLElement | null) => {
      if (field && !open && field.ownerDocument.activeElement === field)
        setOpen(true);
    },
    onFocus: () => {
      if (open) return;
      cancel.current();
      cancel.current = afterPress(() => setOpen(true));
    },
  };
}
