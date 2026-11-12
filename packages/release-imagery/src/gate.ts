// SPDX-License-Identifier: AGPL-3.0-or-later
// The final-capture gate. The #212 review fix changes the Reference detail the
// evidence story pictures, so final images may only be produced from a tree
// that contains it. The git check is injected so the gate is testable.
//
// The commit is named by its full SHA: an abbreviation can become ambiguous as
// the history grows, and this one gates what may be written as final.
export const reviewFixCommit = "b588c9c847401fb3be49231f58680188694e5ed0";

export interface GateResult {
  ok: boolean;
  reason: string;
}

export async function finalCaptureGate(
  isAncestorOfHead: (commit: string) => Promise<boolean>,
): Promise<GateResult> {
  try {
    if (await isAncestorOfHead(reviewFixCommit))
      return { ok: true, reason: `${reviewFixCommit} is an ancestor of HEAD` };
    return {
      ok: false,
      reason: `${reviewFixCommit} (the #212 review fix) is not an ancestor of HEAD; final images must not be produced`,
    };
  } catch (error) {
    return {
      ok: false,
      reason: `${reviewFixCommit} could not be checked: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}
