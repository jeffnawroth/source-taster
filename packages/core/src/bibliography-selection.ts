// SPDX-License-Identifier: AGPL-3.0-or-later
// Owned deterministic detection; never consults a model or provider.
import {
  ReferenceLimitExceeded,
  type Span,
  type Structuring,
  type StructuringResult,
} from "./structuring.ts";
export const bibliographyRulesVersion = "bibliography-rules/1";
export interface BibliographySelection {
  version: string;
  regions: Span[];
}
export interface BibliographyDocument {
  text: string;
  selection: BibliographySelection;
}
const bibliographyHeading =
  /^(?:(?:\d+(?:\.\d+)*[.)]?|[IVX]+[.)]?)\s+)?(?:references|bibliography|works cited|literatur(?:verzeichnis)?|quellen(?:verzeichnis)?|bibliographie)\s*:?$/iu;
const sectionHeading =
  /^(?:(?:\d+(?:\.\d+)*[.)]?|[IVX]+[.)]?)\s+)?(?:chapter|kapitel|appendix|appendices|anhang|acknowledg(?:e)?ments|danksagung|conclusion|discussion|summary|abstract|introduction|contents|inhaltsverzeichnis|footnotes|endnotes|fußnoten|anmerkungen|notes)\b/iu;
function entryStart(line: string) {
  return (
    /^(?:\[\d+\]|\(\d+\)|\d+[.)])\s+\S/u.test(line) ||
    /^[\p{L}\p{M}’' -]+,\s*(?:\p{Lu}\.|[\p{L}\p{M}’' -]+[,.])/u.test(line) ||
    /^(?:\p{Lu}\.\s*)+[\p{L}\p{M}’' -]+,/u.test(line) ||
    /^[\p{L}\p{M}’' -]+ \p{Lu}{1,4}[.,]/u.test(line)
  );
}
type Line = { text: string; start: number; end: number; indented: boolean };
function continues(line: Line) {
  return (
    line.indented ||
    /^(?:https?:\/\/|doi:|In:|Journal\b|Proceedings\b|pp?\.|S\.)/iu.test(
      line.text,
    )
  );
}
/** Entry lines from `from`, until the first line that neither starts nor continues an entry. */
function entryRun(lines: Line[], from: number) {
  let region: Span | undefined;
  let next = from;
  for (; next < lines.length; next++) {
    const line = lines[next]!;
    if (bibliographyHeading.test(line.text) || sectionHeading.test(line.text))
      break;
    if (!entryStart(line.text) && !(region && continues(line))) break;
    region ??= { start: line.start, end: line.end };
    region.end = line.end;
  }
  return { region, next };
}
/**
 * Headed bibliographies in any chapter. With `list`, an uploaded document
 * that consists only of entries is itself the bibliography.
 */
export function detectBibliography(
  text: string,
  options: { list?: boolean } = {},
): BibliographySelection {
  const lines: Line[] = [...text.matchAll(/[^\r\n]+/gu)]
    .map((m) => ({
      text: m[0].trim(),
      start: m.index + m[0].search(/\S/u),
      end: m.index + m[0].trimEnd().length,
      indented: /^\s+\S/u.test(m[0]),
    }))
    .filter((line) => line.text);
  const regions: Span[] = [];
  for (let i = 0; i < lines.length; i++) {
    if (!bibliographyHeading.test(lines[i]!.text)) continue;
    const { region } = entryRun(lines, i + 1);
    if (region) regions.push(region);
  }
  if (!regions.length && options.list) {
    const { region, next } = entryRun(lines, 0);
    if (region && next === lines.length) regions.push(region);
  }
  return { version: bibliographyRulesVersion, regions };
}
export class InvalidBibliographySelection extends Error {}
/** Canonical disjoint regions. Adjacent regions merge so a boundary cannot split one entry twice. */
export function selectionRegions(text: string, regions: Span[]): Span[] {
  if (
    regions.length > 1000 ||
    regions.some(
      (r) =>
        !Number.isInteger(r.start) ||
        !Number.isInteger(r.end) ||
        r.start < 0 ||
        r.end <= r.start ||
        r.end > text.length,
    )
  )
    throw new InvalidBibliographySelection();
  const sorted = regions
    .map((r) => ({ ...r }))
    .sort((a, b) => a.start - b.start);
  const result: Span[] = [];
  for (const span of sorted) {
    const previous = result.at(-1);
    if (previous && previous.end > span.start)
      throw new InvalidBibliographySelection();
    if (previous && previous.end === span.start) previous.end = span.end;
    else result.push(span);
  }
  return result;
}
export function structureSelection(
  parser: Structuring,
  text: string,
  regions: Span[],
  referenceLimit: number,
): StructuringResult {
  const result: StructuringResult = {
    references: [],
    rejected: [],
    guidance: "no-references",
    quotaConsumed: 0,
    referenceLimit,
  };
  for (const region of selectionRegions(text, regions)) {
    const parsed = parser.structure(text.slice(region.start, region.end));
    for (const reference of parsed.references) {
      reference.span = {
        start: reference.span.start + region.start,
        end: reference.span.end + region.start,
      };
      for (const field of Object.values(reference.fieldSources))
        if (field.span)
          field.span = {
            start: field.span.start + region.start,
            end: field.span.end + region.start,
          };
      result.references.push(reference);
      if (result.references.length > referenceLimit)
        throw new ReferenceLimitExceeded(referenceLimit);
    }
    result.rejected.push(
      ...parsed.rejected.map((r) => ({
        ...r,
        span: {
          start: r.span.start + region.start,
          end: r.span.end + region.start,
        },
      })),
    );
  }
  result.guidance = result.references.length ? null : "no-references";
  return result;
}

/** Newly selected text plus the selected remnants of cut entries. */
export function selectionWork(
  regions: Span[],
  oldRegions: Span[],
  cut: Span[],
): Span[] {
  const subtract = (input: Span[], excluded: Span[]) =>
    input.flatMap((region) => {
      let pieces = [region];
      for (const span of excluded)
        pieces = pieces.flatMap((piece) => {
          if (span.end <= piece.start || span.start >= piece.end)
            return [piece];
          return [
            ...(piece.start < span.start
              ? [{ start: piece.start, end: span.start }]
              : []),
            ...(piece.end > span.end
              ? [{ start: span.end, end: piece.end }]
              : []),
          ];
        });
      return pieces;
    });
  const pieces = [
    ...subtract(regions, oldRegions),
    ...regions.flatMap((region) =>
      cut.flatMap((span) => {
        const start = Math.max(region.start, span.start),
          end = Math.min(region.end, span.end);
        return start < end ? [{ start, end }] : [];
      }),
    ),
  ].sort((a, b) => a.start - b.start);
  const merged: Span[] = [];
  for (const span of pieces) {
    const previous = merged.at(-1);
    if (previous && previous.end >= span.start)
      previous.end = Math.max(previous.end, span.end);
    else merged.push({ ...span });
  }
  return merged;
}
