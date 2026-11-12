// SPDX-License-Identifier: AGPL-3.0-or-later
/**
 * A press is a pointer down and up on the same control. Content that arrives
 * late (a response that inserts a section above the control) moves the control
 * between the two, and the press is lost. `afterPress` runs a render-affecting
 * update at once when no pointer is down, otherwise as soon as the pointer is
 * released or cancelled, so late content never moves a control under a pointer
 * that is still down.
 *
 * The deferral is bound to the pointer: it ends once a press has been released
 * or cancelled, or when the window loses focus (a release outside the window
 * can go unreported). A control that moves before the pointer goes down is not
 * covered; nothing can know that the press is coming.
 */
let down = 0;
let installed = false;
const waiting = new Set<() => void>();
function flush() {
  down = 0;
  const run = [...waiting];
  waiting.clear();
  for (const update of run) update();
}
function install() {
  if (installed || typeof window === "undefined") return;
  installed = true;
  // Only the primary button presses a control. A secondary press opens a
  // context menu, which can swallow its own release.
  window.addEventListener(
    "pointerdown",
    (event) => {
      if (event.button === 0) down += 1;
    },
    true,
  );
  // The press completes in the task that dispatches pointerup, mouseup and
  // click. Flush after it, so the update cannot move the control between the
  // pointer events of the same press.
  const later = () => void setTimeout(flush, 0);
  window.addEventListener("pointerup", later, true);
  window.addEventListener("pointercancel", later, true);
  window.addEventListener("dragend", later, true);
  window.addEventListener("blur", flush);
}
// Listen from the first import, so a press that starts before the first late
// update is already known.
install();
/** Returns a cancel function for an update that is still waiting. */
export function afterPress(update: () => void): () => void {
  install();
  if (down === 0) {
    update();
    return () => {};
  }
  waiting.add(update);
  return () => {
    waiting.delete(update);
  };
}
