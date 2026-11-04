// SPDX-License-Identifier: AGPL-3.0-or-later
// #94 ADR-0025 calibration: only the declared grid over the free parameters,
// deterministic selection by the largest minimum margin, ties to the first
// declared point. Synthetic target results only.
import { expect, it } from "vitest";
import { expandGrid, selectPoint } from "../scripts/quality/calibration.ts";
import type { PathRun, TargetResult } from "../scripts/quality/targets.ts";

it("expands the declared grid in declared order, first axis outermost", () => {
  expect(
    expandGrid({
      axes: { overallScore: [80000000, 90000000], lead: [1000000, 2000000] },
    }),
  ).toEqual([
    { overallScore: 80000000, lead: 1000000 },
    { overallScore: 80000000, lead: 2000000 },
    { overallScore: 90000000, lead: 1000000 },
    { overallScore: 90000000, lead: 2000000 },
  ]);
});

it("refuses fixed or undeclared parameters and points outside the ADR-0025 constraints", () => {
  expect(() => expandGrid({ axes: { yearWeight: [1] } })).toThrow(
    /yearWeight is not a free ADR-0025 parameter/,
  );
  expect(() => expandGrid({ axes: { pageRule: [1] } })).toThrow(
    /pageRule is not a free ADR-0025 parameter/,
  );
  // Surname weight must stay above given weight (default given weight 1).
  expect(() => expandGrid({ axes: { surnameWeight: [3, 1] } })).toThrow(
    /\{"surnameWeight":1\} violates the ADR-0025 constraints/,
  );
  expect(() => expandGrid({ axes: { lead: [] } })).toThrow(
    /lead declares no values/,
  );
  expect(() => expandGrid({ axes: {} })).toThrow(/declares no parameters/);
});

const target = (
  name: TargetResult["target"],
  op: ">=" | "<=",
  basisPoints: number,
  hits: number,
  n: number,
): TargetResult => ({
  target: name,
  path: "parser",
  threshold: { op, basisPoints },
  hits,
  n,
  met:
    n === 0
      ? null
      : op === ">="
        ? hits * 10000 >= basisPoints * n
        : hits * 10000 <= basisPoints * n,
  wilson: null,
});
const run = (targets: TargetResult[], valid = true): PathRun => ({
  path: "parser",
  run: 1,
  valid,
  invalidRecords: [],
  replayMisses: 0,
  targets,
});

it("selects the point with the largest minimum margin and reports it as an exact reduced fraction", () => {
  const points = [
    // margins 0.80-0.77 = 3/100 and 0.03-0.02 = 1/100: minimum 1/100
    [
      run([
        target("correctness", ">=", 7700, 80, 100),
        target("false-alarms", "<=", 300, 2, 100),
      ]),
    ],
    // margins 0.79-0.77 = 2/100 and 0.03-0.00 = 3/100: minimum 2/100
    [
      run([
        target("correctness", ">=", 7700, 79, 100),
        target("false-alarms", "<=", 300, 0, 100),
      ]),
    ],
  ];
  expect(selectPoint(points)).toEqual({
    index: 1,
    minimumMargin: { numerator: 1, denominator: 50 },
  });
});

it("sends ties to the first declared point", () => {
  const same = [run([target("correctness", ">=", 7700, 80, 100)])];
  expect(selectPoint([same, same])?.index).toBe(0);
});

it("never selects a point that misses a target, is unmeasured or invalid", () => {
  expect(
    selectPoint([[run([target("correctness", ">=", 7700, 76, 100)])]]),
  ).toBeNull();
  expect(
    selectPoint([[run([target("detection", ">=", 9800, 0, 0)])]]),
  ).toBeNull();
  expect(
    selectPoint([[run([target("correctness", ">=", 7700, 99, 100)], false)]]),
  ).toBeNull();
});
