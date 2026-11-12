// SPDX-License-Identifier: AGPL-3.0-or-later
// The final-capture gate. The #212 review fix changes the Reference detail the
// evidence story pictures, so final images may only be produced from a tree
// that contains it. The git check is injected so the gate is testable.
export const requiredCommit = "b588c9c";

export interface GateResult {
  ok: boolean;
  reason: string;
}

export async function finalCaptureGate(
  isAncestorOfHead: (commit: string) => Promise<boolean>,
): Promise<GateResult> {
  try {
    if (await isAncestorOfHead(requiredCommit))
      return { ok: true, reason: `${requiredCommit} is an ancestor of HEAD` };
    return {
      ok: false,
      reason: `${requiredCommit} (the #212 review fix) is not an ancestor of HEAD; final images must not be produced`,
    };
  } catch (error) {
    return {
      ok: false,
      reason: `${requiredCommit} could not be checked: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}
