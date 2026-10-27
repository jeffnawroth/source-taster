// SPDX-License-Identifier: AGPL-3.0-or-later
// ADR-0025 integer-exact comparison. This DOI tracer is deliberately uncalibrated.
import { decodeHTML } from "entities";
import type { Csl, Name, StructuredReference } from "./structuring.ts";
export const comparisonLimits = Object.freeze({ comparisonMaxCells: 2000000 });
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
export const developmentProfile = Object.freeze({
  surnameWeight: 3,
  givenWeight: 1,
  minimumName: 50000000,
  orderPenalty: 100000000,
  yearWeight: 8,
  monthWeight: 1,
  dayWeight: 1,
  strongField: 95000000,
  counterevidence: 50000000,
  lead: 5000000,
});
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
function clean(raw: string) {
  let value = decodeHTML(raw.replace(/<[^>]*>/gu, ""));
  // Recognized mojibake only; fatal decoding refuses incomplete/invalid repair.
  if (/[ÃÂâð]/u.test(value)) {
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
      const count =
        first === "Ã" || first === "Â"
          ? 2
          : first === "â"
            ? 3
            : first === "ð"
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
  return clean(raw)
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
function textAgreement(a: string, b: string): Rational {
  let best: Rational = { n: 0n, d: 1n };
  for (const extended of [false, true]) {
    const x = [...fold(a, extended)],
      y = [...fold(b, extended)];
    if (x.length === 0 && y.length === 0) return { n: 1n, d: 1n };
    if (x.length === 0 || y.length === 0) return { n: 0n, d: 1n };
    if (x.length === y.length && x.every((c, i) => c === y[i]))
      return { n: 1n, d: 1n };
    if (x.length * y.length > comparisonLimits.comparisonMaxCells)
      throw new ComparisonResourceLimit();
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
function nameScore(a: Name, b: Name): Score {
  if (a.literal !== undefined || b.literal !== undefined)
    return a.literal !== undefined && b.literal !== undefined
      ? textScore(a.literal, b.literal)
      : binary(false);
  const surname = (n: Name, particle: boolean) =>
    [particle ? n["non-dropping-particle"] : undefined, n.family]
      .filter(Boolean)
      .join(" ");
  let family = textAgreement(surname(a, true), surname(b, true));
  if (
    a["non-dropping-particle"] ||
    b["non-dropping-particle"] ||
    /^(?:van der|von|van|de|del|der) /iu.test(a.family ?? "") ||
    /^(?:van der|von|van|de|del|der) /iu.test(b.family ?? "")
  ) {
    const stripped = (n: Name) =>
      surname(n, false).replace(/^(?:van der|von|van|de|del|der) /iu, "");
    const alternative = textAgreement(stripped(a), stripped(b));
    if (alternative.n * family.d > family.n * alternative.d)
      family = alternative;
  }
  if (!a.given || !b.given) return score(family.n, family.d);
  const aa = clean(a.given)
      .split(/[\s.-]+/u)
      .filter(Boolean),
    bb = clean(b.given)
      .split(/[\s.-]+/u)
      .filter(Boolean);
  const parts = aa
    .slice(0, Math.min(aa.length, bb.length))
    .map((s, i): Rational =>
      [...s].length === 1 || [...bb[i]!].length === 1
        ? {
            n: textScore([...s][0]!, [...bb[i]!][0]!).fullAgreement ? 1n : 0n,
            d: 1n,
          }
        : textAgreement(s, bb[i]!),
    );
  if (!parts.length) return score(family.n, family.d);
  const sum = parts.reduce(add, { n: 0n, d: 1n });
  const mean = { n: sum.n, d: sum.d * BigInt(parts.length) };
  const weighted = add(
    { n: family.n * BigInt(developmentProfile.surnameWeight), d: family.d },
    { n: mean.n * BigInt(developmentProfile.givenWeight), d: mean.d },
  );
  return score(
    weighted.n,
    weighted.d *
      BigInt(developmentProfile.surnameWeight + developmentProfile.givenWeight),
  );
}
function rawString(value: unknown): string {
  return typeof value === "string" ? value : "";
}
export function compare(
  reference: StructuredReference,
  candidate: Csl,
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
        const strip = (s: string) =>
          s.replace(/\s*[([][A-Z0-9]{2,}[)\]]\s*$/u, "");
        if (a["container-title-short"]) {
          const attested = b["container-title-short"];
          if (
            attested &&
            !textScore(strip(attested), strip(rawString(bv))).fullAgreement &&
            textScore(
              strip(rawString(av)).replace(/[.\s]/gu, ""),
              strip(attested).replace(/[.\s]/gu, ""),
            ).fullAgreement
          )
            result = binary(true);
        } else result = textScore(strip(rawString(av)), strip(rawString(bv)));
      } else if (field === "volume") {
        const volume = (v: unknown) =>
          /^(?:Vol\.\s*)?(\d+)\b/iu.exec(String(v))?.[1];
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
            const w = i === 1 ? 8n : 1n;
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
        const aa = a.author!,
          bb = b.author!;
        // Exact ordered agreement is sufficient for the identifier tracer. More
        // complex assignment is explicitly excluded until the #75 comparison seam.
        const pairs = aa.map((name, i) =>
          bb[i] ? nameScore(name, bb[i]) : binary(false),
        );
        if (
          pairs.every((s) => s.fullAgreement) &&
          (aa.length === bb.length ||
            (reference.authorsTruncated && aa.length <= bb.length))
        )
          result = binary(true);
        else if (aa.length === 1 && bb.length === 1)
          result =
            pairs[0]!.value < developmentProfile.minimumName
              ? binary(false)
              : pairs[0]!;
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
  const month =
    /\b(january|february|march|april|may|june|july|august|september|october|november|december|januar|februar|märz|mai|juni|juli|oktober|dezember)\b(?:\s+(\d{1,2}))?/iu.exec(
      value,
    );
  if (month) {
    const token = month[1]!.toLowerCase();
    const index =
      months.indexOf(token) >= 0
        ? months.indexOf(token)
        : german.indexOf(token);
    return ["", year[1], String(index + 1), month[2]];
  }
  return ["", year[1]];
}
