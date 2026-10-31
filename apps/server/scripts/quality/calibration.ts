// SPDX-License-Identifier: AGPL-3.0-or-later
// ADR-0025 calibration: a grid declared over the free comparison parameters
// before the search, a deterministic search on the Development set, and the
// point meeting every §14.4 target with the largest minimum margin (ties to
// the first declared point). Margins are exact fractions, never floats.
import { createDevelopmentProfile } from "@source-taster/core";
import type { PathRun, TargetResult } from "./targets.ts";

/** ADR-0025 free parameters; everything else is fixed and never calibrated. */
export const freeParameters = [
  "surnameWeight",
  "givenWeight",
  "minimumName",
  "orderPenalty",
  "monthWeight",
  "dayWeight",
  "overallScore",
  "strongField",
  "lead",
  "mixedComponent",
  "contradiction",
  "counterevidence",
] as const;
export interface CalibrationGrid {
  /** Declared order: first axis outermost, values in their listed order. */
  axes: Record<string, number[]>;
}
export type GridPoint = Record<string, number>;

export function expandGrid(grid: CalibrationGrid): GridPoint[] {
  const axes = Object.entries(grid.axes);
  if (axes.length === 0) throw new Error("The calibration grid declares no parameters.");
  for (const [name, values] of axes) {
    if (!(freeParameters as readonly string[]).includes(name))
      throw new Error(`${name} is not a free ADR-0025 parameter.`);
    if (!Array.isArray(values) || values.length === 0)
      throw new Error(`${name} declares no values.`);
  }
  let points: GridPoint[] = [{}];
  for (const [name, values] of axes)
    points = points.flatMap((point) => values.map((value) => ({ ...point, [name]: value })));
  for (const point of points) {
    try {
      createDevelopmentProfile(point);
    } catch {
      throw new Error(`Grid point ${JSON.stringify(point)} violates the ADR-0025 constraints.`);
    }
  }
  return points;
}

interface Fraction {
  n: bigint;
  d: bigint;
}
const gcd = (a: bigint, b: bigint): bigint => (b === 0n ? (a < 0n ? -a : a) : gcd(b, a % b));
/** Signed distance of a share to its target; positive means met. */
function margin(t: TargetResult): Fraction {
  const scaled = BigInt(t.hits) * 10000n - BigInt(t.threshold.basisPoints) * BigInt(t.n);
  const n = t.threshold.op === ">=" ? scaled : -scaled;
  const d = 10000n * BigInt(t.n);
  const g = gcd(n, d) || 1n;
  return { n: n / g, d: d / g };
}
const less = (a: Fraction, b: Fraction) => a.n * b.d < b.n * a.d;

/** Index of the selected point, or null when no point meets every target. */
export function selectPoint(points: PathRun[][]) {
  let best: { index: number; minimum: Fraction } | null = null;
  points.forEach((runs, index) => {
    const targets = runs.flatMap((r) => r.targets);
    const meets =
      runs.length > 0 &&
      runs.every((r) => r.valid && r.replayMisses === 0) &&
      targets.length > 0 &&
      targets.every((t) => t.met === true);
    if (!meets) return;
    const minimum = targets.map(margin).reduce((a, b) => (less(b, a) ? b : a));
    // Strictly larger only: ties stay with the first declared point.
    if (!best || less(best.minimum, minimum)) best = { index, minimum };
  });
  if (!best) return null;
  const { index, minimum } = best as { index: number; minimum: Fraction };
  return {
    index,
    minimumMargin: { numerator: Number(minimum.n), denominator: Number(minimum.d) },
  };
}
