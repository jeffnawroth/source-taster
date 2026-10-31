// SPDX-License-Identifier: AGPL-3.0-or-later
import type { ReferenceSlot } from "@source-taster/contract-verification/v2";
/** Status always wins. Manual judgment never changes the system outcome. */
export function effectiveVerdict(reference: ReferenceSlot) {
  return reference.outcome.kind === "verdict"
    ? (reference.manualOverride?.verdict ?? reference.outcome.verdict)
    : null;
}
