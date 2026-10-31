// SPDX-License-Identifier: AGPL-3.0-or-later
// ADR-0006 FA-STR-02: every field as written, with no invented fields.
import { isDeepStrictEqual } from "node:util";
import { citationStyles, passes, type GateRecord } from "./targets.ts";

export interface StructuringResult {
  style: string;
  hits: number;
  n: number;
  met: boolean | null;
}

function normalize(value: unknown): unknown {
  if (typeof value === "string")
    return value
      .normalize("NFC")
      .replace(/[\u2010-\u2015\u2212]/gu, "-")
      .replace(/\s+/gu, " ")
      .trim();
  if (Array.isArray(value)) return value.map(normalize);
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, normalize(item)]),
    );
  return value;
}

export function measureStructuring(
  records: GateRecord[],
  fields: Record<string, unknown[]>,
): StructuringResult[] {
  return citationStyles.map((style) => {
    const real = records.filter(
      (r) =>
        r.style === style &&
        (r.class === "real-correct" || r.class === "real-deviating"),
    );
    const hits = real.filter(
      (r) =>
        r.expectedFields !== undefined &&
        fields[r.id]?.length === 1 &&
        isDeepStrictEqual(
          normalize(fields[r.id]![0]),
          normalize(r.expectedFields),
        ),
    ).length;
    return {
      style,
      hits,
      n: real.length,
      met: passes({ op: ">=", basisPoints: 9000 }, hits, real.length),
    };
  });
}
