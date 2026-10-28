// SPDX-License-Identifier: AGPL-3.0-or-later
// ADR-0025 integer-exact comparison. Development profiles remain uncalibrated.
import { decodeHTML } from "entities";
import type { Csl, Name, StructuredReference } from "./structuring.ts";
export const comparisonLimits = Object.freeze({
  comparisonMaxCells: 2000000,
  optimalReferenceNames: 100,
  assignmentMaxSteps: 30000000,
  assignmentMaxPairs: 1000000,
  authorComparisonMaxWork: 30000000,
});
class ComparisonResourceLimit extends Error {}
export interface Score {
  value: number;
  fullAgreement: boolean;
}
export interface FieldComparison {
  field: string;
  reference: unknown;
  candidate: unknown;
  score: Score | null;
  reason:
    | "compared"
    | "missing-reference"
    | "missing-candidate"
    | "not-determinable"
    | "unweighted"
    | "resource-limit";
}
// Synthetic development placeholders, never calibrated or releasable. Date
// weights are expressed relative to the fixed year basis, in exact integers.
const developmentParameters = {
  surnameWeight: 3,
  givenWeight: 1,
  minimumName: 50000000,
  orderPenalty: 100000000,
  monthWeight: 12500000,
  dayWeight: 12500000,
  overallScore: 85000000,
  strongField: 95000000,
  counterevidence: 50000000,
  lead: 5000000,
  mixedComponent: 95000000,
  contradiction: 50000000,
};
export type ComparisonParameters = typeof developmentParameters;
export type ComparisonProfile = Readonly<
  ComparisonParameters & { yearWeight: number }
>;
export function createDevelopmentProfile(
  overrides: unknown = {},
): ComparisonProfile {
  if (!overrides || typeof overrides !== "object" || Array.isArray(overrides))
    throw new Error("Comparison parameters must be an object.");
  const keys = Object.keys(developmentParameters);
  for (const [key, value] of Object.entries(overrides)) {
    if (
      !keys.includes(key) ||
      !Number.isSafeInteger(value) ||
      (value as number) < 0
    )
      throw new Error(
        "Only declared nonnegative integer comparison parameters are configurable.",
      );
  }
  const p = { ...developmentParameters, ...overrides };
  if (
    p.minimumName === 0 ||
    p.orderPenalty === 0 ||
    p.surnameWeight <= p.givenWeight ||
    !Number.isSafeInteger(p.surnameWeight + p.givenWeight) ||
    p.monthWeight >= 100000000 ||
    p.dayWeight >= 100000000 ||
    Object.entries(p).some(
      ([key, value]) =>
        !["surnameWeight", "givenWeight"].includes(key) && value > 100000000,
    )
  )
    throw new Error("Comparison parameters violate ADR-0025 constraints.");
  return Object.freeze({ ...p, yearWeight: 100000000 });
}
export const developmentProfile = createDevelopmentProfile();
const unit = 100000000n;
function rounded(n: bigint, d: bigint) {
  return (2n * n + d) / (2n * d);
}
export function score(n: bigint, d: bigint, full = n === d): Score {
  return {
    value: Number(full ? unit : min(99999999n, rounded(n * unit, d))),
    fullAgreement: full,
  };
}
function min(a: bigint, b: bigint) {
  return a < b ? a : b;
}
function clean(raw: string, journal = false) {
  let value = decodeHTML(raw.replace(/<[^>]*>/gu, ""));
  // Inspect the case-preserved token after provider cleanup, before folding.
  if (journal)
    value = value.replace(/\s*(?:\([A-Z0-9]{2,}\)|\[[A-Z0-9]{2,}\])\s*$/u, "");
  // Recognized mojibake only; fatal decoding refuses incomplete/invalid repair.
  if (/[\u00c2-\u00f4]/u.test(value)) {
    const windows: Record<string, number> = {
      "€": 128,
      "‚": 130,
      ƒ: 131,
      "„": 132,
      "…": 133,
      "†": 134,
      "‡": 135,
      ˆ: 136,
      "‰": 137,
      Š: 138,
      "‹": 139,
      Œ: 140,
      Ž: 142,
      "‘": 145,
      "’": 146,
      "“": 147,
      "”": 148,
      "•": 149,
      "–": 150,
      "—": 151,
      "˜": 152,
      "™": 153,
      š: 154,
      "›": 155,
      œ: 156,
      ž: 158,
      Ÿ: 159,
    };
    const chars = [...value];
    let repaired = "";
    for (let i = 0; i < chars.length; i++) {
      const first = chars[i]!;
      const byte = first.codePointAt(0)!;
      const count =
        byte >= 0xc2 && byte <= 0xdf
          ? 2
          : byte >= 0xe0 && byte <= 0xef
            ? 3
            : byte >= 0xf0 && byte <= 0xf4
              ? 4
              : 0;
      if (count && i + count <= chars.length) {
        const bytes = chars
          .slice(i, i + count)
          .map((c) => windows[c] ?? c.codePointAt(0)!);
        if (bytes.every((byte) => byte <= 255)) {
          try {
            repaired += decodeURIComponent(
              bytes
                .map((byte) => "%" + byte.toString(16).padStart(2, "0"))
                .join(""),
            );
            i += count - 1;
            continue;
          } catch {
            /* Invalid sequences stay raw. */
          }
        }
      }
      repaired += first;
    }
    value = repaired;
  }
  value = value
    .normalize("NFKC")
    .replace(/[‐‑‒–—−]/gu, "-")
    .replace(/[‘’‚‛]/gu, "'")
    .replace(/[“”„‟]/gu, '"');
  return [...value]
    .map((c) => (c === "ı" ? c : c.toUpperCase().toLowerCase()))
    .join("")
    .replaceAll("ß", "ss")
    .replaceAll("ς", "σ");
}
function fold(raw: string, extended: boolean) {
  return foldClean(clean(raw), extended);
}
/** Steps 5–6 on text that already passed exactly once through steps 1–4. */
function foldClean(value: string, extended: boolean) {
  return value
    .replace(
      /[äöü]/gu,
      (c) =>
        ({
          ä: extended ? "ae" : "a",
          ö: extended ? "oe" : "o",
          ü: extended ? "ue" : "u",
        })[c]!,
    )
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^\p{L}\p{N}]/gu, " ")
    .replace(/\s+/gu, " ")
    .trim();
}
export function normalizeDoi(raw: string) {
  return raw
    .trim()
    .replace(/^(?:https?:\/\/(?:dx\.)?doi\.org\/|doi:\s*)/iu, "")
    .toLowerCase();
}
interface Rational {
  n: bigint;
  d: bigint;
}
function add(a: Rational, b: Rational): Rational {
  const n = a.n * b.d + b.n * a.d,
    d = a.d * b.d;
  const g = gcd(n, d);
  return { n: n / g, d: d / g };
}
function gcd(a: bigint, b: bigint): bigint {
  while (b) {
    const r = a % b;
    a = b;
    b = r;
  }
  return a || 1n;
}
const particlePrefix = /^(?:(?:van|von|de|del|der)\s+)+/u;
function textAgreement(
  a: string,
  b: string,
  withoutParticles = false,
  work?: (amount: number) => void,
): Rational {
  return textAgreementClean(clean(a), clean(b), withoutParticles, work);
}
function textAgreementClean(
  a: string,
  b: string,
  withoutParticles = false,
  work?: (amount: number) => void,
): Rational {
  let best: Rational = { n: 0n, d: 1n };
  for (const extended of [false, true]) {
    const normalized = (prepared: string) => {
      const value = foldClean(prepared, extended);
      return withoutParticles ? value.replace(particlePrefix, "") : value;
    };
    const x = [...normalized(a)],
      y = [...normalized(b)];
    work?.(x.length + y.length);
    if (x.length === 0 && y.length === 0) return { n: 1n, d: 1n };
    if (x.length === 0 || y.length === 0) return { n: 0n, d: 1n };
    if (x.length === y.length && x.every((c, i) => c === y[i]))
      return { n: 1n, d: 1n };
    if (x.length * y.length > comparisonLimits.comparisonMaxCells)
      throw new ComparisonResourceLimit();
    work?.(x.length * y.length);
    const rows: number[][] = Array.from(
      { length: 3 },
      () => Array(y.length + 1).fill(0) as number[],
    );
    for (let j = 0; j <= y.length; j++) rows[0]![j] = j;
    for (let i = 1; i <= x.length; i++) {
      const row = rows[i % 3]!,
        previous = rows[(i - 1) % 3]!,
        before = rows[(i + 1) % 3]!;
      row[0] = i;
      for (let j = 1; j <= y.length; j++) {
        row[j] = Math.min(
          previous[j]! + 1,
          row[j - 1]! + 1,
          previous[j - 1]! + (x[i - 1] === y[j - 1] ? 0 : 1),
        );
        if (i > 1 && j > 1 && x[i - 1] === y[j - 2] && x[i - 2] === y[j - 1])
          row[j] = Math.min(row[j]!, before[j - 2]! + 1);
      }
    }
    const length = BigInt(Math.max(x.length, y.length));
    const result = {
      n: length - BigInt(rows[x.length % 3]![y.length]!),
      d: length,
    };
    if (result.n * best.d > best.n * result.d) best = result;
  }
  return best;
}
export function textScore(a: string, b: string): Score {
  const r = textAgreement(a, b);
  return score(r.n, r.d);
}
function binary(equal: boolean) {
  return score(equal ? 1n : 0n, 1n);
}
function nameAgreement(
  a: Name,
  b: Name,
  profile: ComparisonProfile,
  work: (amount: number) => void,
): Rational {
  work(
    [
      a.literal,
      a.family,
      a.given,
      a["non-dropping-particle"],
      b.literal,
      b.family,
      b.given,
      b["non-dropping-particle"],
    ].reduce((sum, v) => sum + (v?.length ?? 0), 0),
  );
  if (a.literal !== undefined || b.literal !== undefined)
    return a.literal !== undefined && b.literal !== undefined
      ? textAgreement(a.literal, b.literal, false, work)
      : { n: 0n, d: 1n };
  const surname = (n: Name, particle: boolean) =>
    [particle ? n["non-dropping-particle"] : undefined, n.family]
      .filter(Boolean)
      .join(" ");
  let family = textAgreement(surname(a, true), surname(b, true), false, work);
  if (
    a["non-dropping-particle"] ||
    b["non-dropping-particle"] ||
    particlePrefix.test(fold(a.family ?? "", false)) ||
    particlePrefix.test(fold(b.family ?? "", false))
  ) {
    const alternative = textAgreement(
      surname(a, false),
      surname(b, false),
      true,
      work,
    );
    if (alternative.n * family.d > family.n * alternative.d)
      family = alternative;
  }
  if (!a.given || !b.given) return family;
  const aa = clean(a.given)
      .split(/[^\p{L}\p{M}\p{N}]+/u)
      .filter(Boolean),
    bb = clean(b.given)
      .split(/[^\p{L}\p{M}\p{N}]+/u)
      .filter(Boolean);
  const parts = aa
    .slice(0, Math.min(aa.length, bb.length))
    .map((s, i): Rational => {
      work(1);
      if (
        [...foldClean(s, false)].length === 1 ||
        [...foldClean(bb[i]!, false)].length === 1
      ) {
        const r = textAgreementClean([...s][0]!, [...bb[i]!][0]!, false, work);
        return { n: r.n === r.d ? 1n : 0n, d: 1n };
      }
      return textAgreementClean(s, bb[i]!, false, work);
    });
  if (!parts.length) return family;
  const sum = parts.reduce(add, { n: 0n, d: 1n });
  const mean = { n: sum.n, d: sum.d * BigInt(parts.length) };
  const weighted = add(
    { n: family.n * BigInt(profile.surnameWeight), d: family.d },
    { n: mean.n * BigInt(profile.givenWeight), d: mean.d },
  );
  return {
    n: weighted.n,
    d: weighted.d * BigInt(profile.surnameWeight + profile.givenWeight),
  };
}
/**
 * Rectangular Hungarian maximum-weight assignment, with private zero-weight
 * columns for omissions. Pair weights share an exact BigInt denominator; no
 * pair is rounded before assignment or before the author Field score.
 */
function authorScore(
  a: Name[],
  b: Name[],
  truncated: boolean,
  profile: ComparisonProfile,
): Score {
  let steps = 0;
  const step = () => {
    if (++steps > comparisonLimits.assignmentMaxSteps)
      throw new ComparisonResourceLimit();
  };
  let textWork = 0;
  const work = (amount: number) => {
    textWork += amount;
    if (textWork > comparisonLimits.authorComparisonMaxWork)
      throw new ComparisonResourceLimit();
  };
  const pair = (name: Name, other: Name): Rational => {
    step();
    const r = nameAgreement(name, other, profile, work);
    return r.n * unit < BigInt(profile.minimumName) * r.d
      ? { n: 0n, d: 1n }
      : r;
  };
  let assigned: { i: number; j: number; r: Rational }[];
  if (a.length > comparisonLimits.optimalReferenceNames) {
    assigned = a.flatMap((name, i) => {
      if (!b[i]) return [];
      const r = pair(name, b[i]);
      return r.n ? [{ i, j: i, r }] : [];
    });
  } else {
    // Refuse before allocating the exact graph, rather than risking OOM or
    // silently changing the assignment algorithm for a long Candidate list.
    if (a.length * b.length > comparisonLimits.assignmentMaxPairs)
      throw new ComparisonResourceLimit();
    const pairs = a.map((name) => b.map((other) => pair(name, other)));
    let denominator = 1n;
    for (const row of pairs)
      for (const r of row)
        denominator = (denominator / gcd(denominator, r.d)) * r.d;
    const weights = pairs.map((row) =>
      row.map((r) => r.n * (denominator / r.d)),
    );
    const assignment = optimalAssignment(weights, step);
    assigned = assignment.flatMap((j, i) =>
      j < 0 ? [] : [{ i, j, r: pairs[i]![j]! }],
    );
  }
  let discordant = 0n;
  // Positional pairs are inherently ordered, even above 100 Reference names.
  if (a.length <= comparisonLimits.optimalReferenceNames)
    for (let i = 0; i < assigned.length; i++)
      for (let j = i + 1; j < assigned.length; j++) {
        step();
        if (assigned[i]!.j > assigned[j]!.j) discordant++;
      }
  const count = BigInt(assigned.length);
  const orderDenominator = count < 2n ? 1n : (count * (count - 1n)) / 2n;
  const last = assigned.reduce((last, pair) => Math.max(last, pair.j), -1);
  const n = truncated
    ? a.length + last + 1 - assigned.length
    : Math.max(a.length, b.length);
  const sum = assigned.reduce((s, pair) => add(s, pair.r), { n: 0n, d: 1n });
  const full =
    assigned.length === a.length &&
    (truncated ? n === a.length : assigned.length === b.length) &&
    discordant === 0n &&
    assigned.every((p) => p.r.n === p.r.d);
  return score(
    sum.n *
      (unit * orderDenominator - BigInt(profile.orderPenalty) * discordant),
    sum.d * BigInt(n) * unit * orderDenominator,
    full,
  );
}

function optimalAssignment(weights: bigint[][], step: () => void): number[] {
  const n = weights.length,
    realColumns = weights[0]!.length,
    m = realColumns + n;
  const u = Array<bigint>(n + 1).fill(0n),
    v = Array<bigint>(m + 1).fill(0n);
  const owner = Array<number>(m + 1).fill(0),
    way = Array<number>(m + 1).fill(0);
  const cost = (i: number, j: number) =>
    j <= realColumns ? -weights[i - 1]![j - 1]! : 0n;
  for (let i = 1; i <= n; i++) {
    owner[0] = i;
    let j0 = 0;
    const distance: (bigint | null)[] = Array<bigint | null>(m + 1).fill(null);
    const used = Array<boolean>(m + 1).fill(false);
    do {
      used[j0] = true;
      const i0 = owner[j0]!;
      let delta: bigint | null = null,
        j1 = 0;
      for (let j = 1; j <= m; j++) {
        step();
        if (used[j]) continue;
        const current = cost(i0, j) - u[i0]! - v[j]!;
        if (distance[j] === null || current < distance[j]!) {
          distance[j] = current;
          way[j] = j0;
        }
        if (delta === null || distance[j]! < delta) {
          delta = distance[j]!;
          j1 = j;
        }
      }
      for (let j = 0; j <= m; j++) {
        if (used[j]) {
          u[owner[j]!]! += delta!;
          v[j]! -= delta!;
        } else if (distance[j] !== null) distance[j]! -= delta!;
      }
      j0 = j1;
    } while (owner[j0] !== 0);
    do {
      const j1 = way[j0]!;
      owner[j0] = owner[j1]!;
      j0 = j1;
    } while (j0);
  }
  const first = Array<number>(n).fill(-1);
  for (let j = 1; j <= realColumns; j++)
    if (owner[j] && weights[owner[j]! - 1]![j - 1]! > 0n)
      first[owner[j]! - 1] = j - 1;
  const target = first.reduce(
    (s, j, i) => s + (j < 0 ? 0n : weights[i]![j]!),
    0n,
  );
  const maximumPair = weights.reduce(
    (best, row) => row.reduce((best, w) => max(best, w), best),
    0n,
  );
  // Tight edges contain every primary optimum. Enumerate only those edges to
  // resolve the non-additive Kendall tie exactly. Never use a distance proxy.
  const edges = weights.map((row, i) =>
    row.flatMap((w, j) =>
      w > 0n && cost(i + 1, j + 1) === u[i + 1]! + v[j + 1]! ? [j] : [],
    ),
  );
  const omission = weights.map((_, i) => u[i + 1] === 0n);
  const suffix = Array<bigint>(n + 1).fill(0n);
  for (let i = n - 1; i >= 0; i--)
    suffix[i] =
      suffix[i + 1]! + edges[i]!.reduce((s, j) => max(s, weights[i]![j]!), 0n);
  const quality = (assignment: number[]) => {
    const positions = assignment.flatMap((j, i) => (j < 0 ? [] : [i]));
    let inversions = 0n;
    for (let i = 0; i < n; i++)
      if (assignment[i]! >= 0)
        for (let k = i + 1; k < n; k++) {
          step();
          if (assignment[k]! >= 0 && assignment[i]! > assignment[k]!)
            inversions++;
        }
    const count = BigInt(positions.length);
    return {
      inversions,
      denominator: max(1n, (count * (count - 1n)) / 2n),
      positions,
    };
  };
  let best = first,
    bestQuality = quality(first),
    done = false;
  const used = new Set<number>(),
    current = Array<number>(n).fill(-1);
  const lexLess = (x: number[], y: number[]) => {
    for (let i = 0; i < Math.min(x.length, y.length); i++)
      if (x[i] !== y[i]) return x[i]! < y[i]!;
    return x.length < y.length;
  };
  const visit = (i: number, sum: bigint, inversions: bigint, count: number) => {
    step();
    if (done || sum + suffix[i]! < target) return;
    const maxCount = BigInt(Math.min(n, realColumns));
    // Even assigning all remaining names cannot erase an existing inversion.
    if (
      inversions * bestQuality.denominator >
      bestQuality.inversions * max(1n, (maxCount * (maxCount - 1n)) / 2n)
    )
      return;
    if (i === n) {
      if (sum !== target) return;
      const q = quality(current);
      const delta =
        q.inversions * bestQuality.denominator -
        bestQuality.inversions * q.denominator;
      if (
        delta < 0n ||
        (delta === 0n &&
          (lexLess(q.positions, bestQuality.positions) ||
            (q.positions.join() === bestQuality.positions.join() &&
              lexLess(current, best))))
      ) {
        best = [...current];
        bestQuality = q;
      }
      // Zero discordance and every possible Reference position assigned in its
      // earliest prefix proves the secondary objectives optimal only when
      // the primary sum also proves that no smaller assignment can tie.
      if (
        q.inversions === 0n &&
        count === Math.min(n, realColumns) &&
        target > BigInt(count - 1) * maximumPair &&
        q.positions.every((p, k) => p === k)
      ) {
        best = [...current];
        done = true;
      }
      return;
    }
    for (const j of edges[i]!) {
      step();
      if (!used.has(j)) {
        current[i] = j;
        used.add(j);
        let extra = 0n;
        for (let k = 0; k < i; k++) {
          step();
          if (current[k]! > j) extra++;
        }
        visit(i + 1, sum + weights[i]![j]!, inversions + extra, count + 1);
        used.delete(j);
        if (done) return;
      }
    }
    current[i] = -1;
    if (omission[i]) visit(i + 1, sum, inversions, count);
  };
  visit(0, 0n, 0n, 0);
  return best;
}

function rawString(value: unknown): string {
  return typeof value === "string" ? value : "";
}
export function compare(
  reference: StructuredReference,
  candidate: Csl,
  profile: ComparisonProfile = developmentProfile,
): { fields: FieldComparison[]; score: Score | null } {
  const fields: FieldComparison[] = [];
  const weights: Record<string, number> = {
    title: 30,
    author: 25,
    issued: 15,
    "container-title": 15,
    DOI: 10,
    volume: 3,
    page: 2,
  };
  const a = reference.csl,
    b = candidate;
  for (const field of Object.keys(weights)) {
    let av: unknown = a[field as keyof Csl],
      bv: unknown = b[field as keyof Csl];
    if (field === "container-title" && a["container-title-short"])
      av = a["container-title-short"];
    if (field === "page") {
      av = a["article-number"] ?? a.page;
      bv = b["article-number"] ?? b.page;
    }
    let result: Score | null = null,
      reason: FieldComparison["reason"] = "compared";
    try {
      if (av === undefined || av === "" || (Array.isArray(av) && !av.length))
        reason = "missing-reference";
      else if (
        bv === undefined ||
        bv === "" ||
        (Array.isArray(bv) && !bv.length)
      )
        reason = "missing-candidate";
      else if (field === "DOI")
        result = binary(
          normalizeDoi(rawString(av)) === normalizeDoi(rawString(bv)),
        );
      else if (field === "title")
        result = textScore(rawString(av), rawString(bv));
      else if (field === "container-title") {
        const supplied = clean(rawString(av), true),
          full = clean(rawString(bv), true);
        const equal = (x: string, y: string) => {
          const r = textAgreementClean(x, y);
          return r.n === r.d;
        };
        if (a["container-title-short"]) {
          const attested = b["container-title-short"];
          if (attested) {
            const short = clean(attested, true);
            const abbreviationEqual = (x: string, y: string) =>
              [false, true].some(
                (extended) =>
                  foldClean(x, extended).replace(/\s/gu, "") ===
                  foldClean(y, extended).replace(/\s/gu, ""),
              );
            const qualified = (s: string) => {
              const match = /\s*(?:\(([^()]*)\)|\[([^[\]]*)\])\s*$/u.exec(s);
              return {
                base: match ? s.slice(0, match.index) : s,
                qualifier: match?.[1] ?? match?.[2],
              };
            };
            const r = qualified(supplied),
              t = qualified(short),
              canonical = qualified(full);
            const qualifiersAgree = [r.qualifier, t.qualifier].every(
              (q) =>
                q === undefined ||
                canonical.qualifier === undefined ||
                equal(q, canonical.qualifier),
            );
            // A short title must differ from the full title. Omitting a
            // distinguishing qualifier needs this exact canonical journal proof.
            const provenQualifier =
              canonical.qualifier !== undefined &&
              (r.qualifier !== undefined || t.qualifier !== undefined);
            if (
              !equal(short, full) &&
              qualifiersAgree &&
              (abbreviationEqual(supplied, short) ||
                (provenQualifier && abbreviationEqual(r.base, t.base)))
            )
              result = binary(true);
          }
        } else {
          const r = textAgreementClean(supplied, full);
          result = score(r.n, r.d);
        }
      } else if (field === "volume") {
        const volume = (v: unknown) =>
          /^(?:Vol\.\s*)?(\d+)\b/iu.exec(clean(String(v)))?.[1];
        const x = volume(av),
          y = volume(bv);
        result =
          x && y
            ? binary(BigInt(x) === BigInt(y))
            : binary(textScore(rawString(av), rawString(bv)).fullAgreement);
      } else if (field === "issued") {
        const x = dateParts(a.issued!.literal),
          y = dateParts(b.issued!.literal);
        if (x && y) {
          let n = 0n,
            d = 0n,
            full = true;
          for (let i = 1; i <= 3; i++) {
            if (!x[i] || !y[i] || (i === 3 && (!x[2] || !y[2]))) continue;
            const delta = BigInt(x[i]!) - BigInt(y[i]!);
            const v =
              delta === 0n
                ? 2n
                : i === 1 && (delta === 1n || delta === -1n)
                  ? 1n
                  : 0n;
            const w = BigInt(
              i === 1
                ? profile.yearWeight
                : i === 2
                  ? profile.monthWeight
                  : profile.dayWeight,
            );
            n += v * w;
            d += 2n * w;
            full &&= v === 2n;
          }
          result = score(n, d, full);
        }
      } else if (field === "page") {
        if (Boolean(a["article-number"]) !== Boolean(b["article-number"]))
          result = null;
        else if (a["article-number"])
          result = binary(
            textScore(rawString(av), rawString(bv)).fullAgreement,
          );
        else {
          const x = pages(rawString(av)),
            y = pages(rawString(bv));
          if (
            x &&
            y &&
            x.kind === y.kind &&
            Boolean(x.prefix) === Boolean(y.prefix)
          ) {
            if (x.prefix !== y.prefix) result = binary(false);
            else {
              const inside = max(
                0n,
                min(x.end, y.end) - max(x.start, y.start) + 1n,
              );
              result = score(inside, x.end - x.start + 1n);
            }
          } else if (textScore(rawString(av), rawString(bv)).fullAgreement)
            result = binary(true);
        }
      } else if (field === "author") {
        result = authorScore(
          a.author!,
          b.author!,
          Boolean(reference.authorsTruncated),
          profile,
        );
      }
    } catch (error) {
      if (!(error instanceof ComparisonResourceLimit)) throw error;
      result = null;
      reason = "resource-limit";
    }
    if (reason === "compared" && !result) reason = "not-determinable";
    fields.push({
      field,
      reference: av ?? null,
      candidate: bv ?? null,
      score: result,
      reason,
    });
  }
  for (const field of ["issue", "ISBN", "PMID", "PMCID", "URL"] as const)
    if (a[field] || b[field])
      fields.push({
        field,
        reference: a[field] ?? null,
        candidate: b[field] ?? null,
        score: null,
        reason: "unweighted",
      });
  const compared = fields.filter((f) => f.score);
  const denominator = compared.reduce(
    (sum, f) => sum + BigInt(weights[f.field]!),
    0n,
  );
  const overall = denominator
    ? score(
        compared.reduce(
          (sum, f) => sum + BigInt(weights[f.field]!) * BigInt(f.score!.value),
          0n,
        ),
        denominator * unit,
        compared.every((f) => f.score!.fullAgreement),
      )
    : null;
  return { fields, score: overall };
}
function max(a: bigint, b: bigint) {
  return a > b ? a : b;
}
function pages(
  value: string,
): { start: bigint; end: bigint; prefix: string; kind: string } | null {
  value = clean(value).trim();
  const numeric = /^([A-Za-z]*)(\d+)\s*[-–—]?\s*([A-Za-z]*)(\d+)?$/u.exec(
    value.trim(),
  );
  if (numeric) {
    const start = BigInt(numeric[2]!);
    let ending = numeric[4] ?? numeric[2]!;
    if (numeric[4] && ending.length < numeric[2]!.length) {
      ending = numeric[2]!.slice(0, -ending.length) + ending;
      if (BigInt(ending) < start)
        ending = String(BigInt(ending) + 10n ** BigInt(numeric[4].length));
    }
    const end = BigInt(ending);
    if (end < start || (numeric[3] && numeric[3] !== numeric[1])) return null;
    return { start, end, prefix: numeric[1]!.toLowerCase(), kind: "arabic" };
  }
  const roman = /^([ivxlcdm]+)(?:\s*[-–—]\s*([ivxlcdm]+))?$/iu.exec(
    value.trim(),
  );
  if (roman) {
    const convert = (s: string) => {
      const values: Record<string, bigint> = {
        i: 1n,
        v: 5n,
        x: 10n,
        l: 50n,
        c: 100n,
        d: 500n,
        m: 1000n,
      };
      const chars = [...s.toLowerCase()];
      return chars.reduce(
        (sum, c, i) =>
          sum +
          (values[c]! < (values[chars[i + 1] ?? ""] ?? 0n)
            ? -values[c]!
            : values[c]!),
        0n,
      );
    };
    const start = convert(roman[1]!),
      end = convert(roman[2] ?? roman[1]!);
    if (start > 0n && end >= start)
      return { start, end, prefix: "", kind: "roman" };
  }
  return null;
}

function dateParts(value: string): (string | undefined)[] | null {
  value = clean(value).trim();
  if (/\b(?:in press|n\.\s*d\.|no date|o\.\s*j\.)/iu.test(value)) return null;
  const iso = /^([12]\d{3})(?:-(\d{1,2})(?:-(\d{1,2}))?)?$/u.exec(value.trim());
  if (iso) return iso;
  const year = /\b([12]\d{3})[a-z]?\b/iu.exec(value);
  if (!year) return null;
  if (
    /(?:spring|summer|autumn|fall|winter|frühling|sommer|herbst|[12]\d{3}\s*[-–/])/iu.test(
      value,
    )
  )
    return ["", year[1]];
  const months = [
    "january",
    "february",
    "march",
    "april",
    "may",
    "june",
    "july",
    "august",
    "september",
    "october",
    "november",
    "december",
  ];
  const german = [
    "januar",
    "februar",
    "märz",
    "april",
    "mai",
    "juni",
    "juli",
    "august",
    "september",
    "oktober",
    "november",
    "dezember",
  ];
  const monthNames = [...new Set([...months, ...german])].join("|");
  const monthMatches = [
    ...value.matchAll(
      new RegExp(`\\b(${monthNames})\\b(?:\\s+(\\d{1,2})\\b)?`, "giu"),
    ),
  ];
  // A range has no single month/day to compare. Recognize it before selecting
  // the first named month; the exact ISO single-date form was handled above.
  if (
    /\b\d{1,2}\.?\s*(?:[-/]|to\b|bis\b)\s*\d{1,2}\b/iu.test(value) ||
    /\s[-/]\s|\b(?:to|bis)\b/iu.test(value) ||
    (monthMatches.length > 1 && /[-/]/u.test(value))
  )
    return ["", year[1]];
  const month = monthMatches[0];
  if (month) {
    const token = month[1]!.toLowerCase();
    const index =
      months.indexOf(token) >= 0
        ? months.indexOf(token)
        : german.indexOf(token);
    const precedingDay = /\b(\d{1,2})\.?\s*$/u.exec(
      value.slice(0, month.index),
    )?.[1];
    return ["", year[1], String(index + 1), precedingDay ?? month[2]];
  }
  return ["", year[1]];
}
