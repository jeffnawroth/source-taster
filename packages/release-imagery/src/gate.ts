// SPDX-License-Identifier: AGPL-3.0-or-later
// The final-capture gate. The D rebuild (#243, merged as 0a1c6ac) is the
// Reference detail the evidence story pictures, so final images may only be
// produced from a tree that contains it. The git check is injected so the gate is testable.
//
// The commit is named by its full SHA: an abbreviation can become ambiguous as
// the history grows, and this one gates what may be written as final.
export const detailCommit = "0a1c6ac5cd13abb3f8c9fe818ea8fa708e17cf44";

export interface GateResult {
  ok: boolean;
  reason: string;
}

export async function finalCaptureGate(
  isAncestorOfHead: (commit: string) => Promise<boolean>,
): Promise<GateResult> {
  try {
    if (await isAncestorOfHead(detailCommit))
      return { ok: true, reason: `${detailCommit} is an ancestor of HEAD` };
    return {
      ok: false,
      reason: `${detailCommit} (the D Reference detail) is not an ancestor of HEAD; final images must not be produced`,
    };
  } catch (error) {
    return {
      ok: false,
      reason: `${detailCommit} could not be checked: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}
