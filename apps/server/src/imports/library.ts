// SPDX-License-Identifier: AGPL-3.0-or-later
import type { Csl, Name } from "@source-taster/core";
import type {
  ImportResult,
  LibraryInput,
} from "@source-taster/contract-verification/import";
import { bibtexImporter } from "./bibtex.ts";
import { risImporter } from "./ris.ts";
/** One edit of a record's raw text; offsets are relative to the record. */
export interface TextEdit {
  start: number;
  end: number;
  text: string;
}
/**
 * Application-owned import port (ADR-0011). Library objects never cross
 * transport or persistence; each record keeps its raw text unchanged.
 */
export interface LibraryImporter {
  parse(text: string, referenceLimit: number): ImportResult;
  /** Rewrites only the given changed fields inside one raw record. */
  patch(originalText: string, changes: Csl, fields: Csl): string;
}
const importers = { bibtex: bibtexImporter, ris: risImporter } as const;
export function importLibrary(
  input: LibraryInput,
  referenceLimit: number,
): ImportResult {
  return importers[input.format].parse(input.text, referenceLimit);
}
/** Applies non-overlapping edits; inserts at one offset keep their order. */
export function applyEdits(text: string, edits: readonly TextEdit[]): string {
  return edits
    .map((edit, index) => ({ ...edit, index }))
    .sort((a, b) => b.start - a.start || b.index - a.index)
    .reduce(
      (result, edit) =>
        result.slice(0, edit.start) + edit.text + result.slice(edit.end),
      text,
    );
}
function nameKey(name: Name): string {
  return JSON.stringify([
    name.literal ?? null,
    name["non-dropping-particle"] ?? null,
    name.family ?? null,
    name.given ?? null,
  ]);
}
function same(key: keyof Csl, before: unknown, after: unknown): boolean {
  if (key === "DOI" && typeof before === "string" && typeof after === "string")
    return before.toLowerCase() === after.toLowerCase();
  if (key === "author" && Array.isArray(before) && Array.isArray(after))
    return (
      before.length === after.length &&
      before.every(
        (name, i) => nameKey(name as Name) === nameKey(after[i] as Name),
      )
    );
  return JSON.stringify(before) === JSON.stringify(after);
}
/**
 * Corrections are the export fields that differ from the immutable import
 * projection. A field a correction does not supply is not a correction: the
 * imported value stays. Equivalent entry types are kept as written.
 */
export function corrections(imported: Csl, fields: Csl): Csl {
  const changed: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(fields) as [keyof Csl, unknown][])
    if (value !== undefined && value !== "" && !same(key, imported[key], value))
      changed[key] = value;
  return changed;
}
/** The imported record, exactly, except for the applied corrections. */
export function roundTrip(reference: {
  originalText: string;
  fields: Csl;
  imported: { format: LibraryInput["format"]; fields: Csl };
}): string {
  const changes = corrections(reference.imported.fields, reference.fields);
  return Object.keys(changes).length
    ? importers[reference.imported.format].patch(
        reference.originalText,
        changes,
        reference.imported.fields,
      )
    : reference.originalText;
}
