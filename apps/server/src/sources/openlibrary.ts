// SPDX-License-Identifier: AGPL-3.0-or-later
import {
  issuedYear,
  normalizeIsbn,
  type BibliographicSource,
  type Csl,
  type RetrievedCandidate,
} from "@source-taster/core";
import { z } from "zod";
import {
  answered,
  displayName,
  mismatch,
  noRecord,
  unreadable,
  type SourceRequest,
} from "./shared.ts";
const edition = z.object({
  key: z.string().regex(/^\/books\/OL\d+M$/u),
  title: z.string(),
  authors: z.array(z.object({ name: z.string() })).optional(),
  identifiers: z
    .object({
      isbn_10: z.array(z.string()).optional(),
      isbn_13: z.array(z.string()).optional(),
    })
    .optional(),
  publish_date: z.string().optional(),
  publishers: z.array(z.object({ name: z.string() })).optional(),
  publish_places: z.array(z.object({ name: z.string() })).optional(),
});
const work = z.object({
  key: z.string().regex(/^\/works\/OL\d+W$/u),
  title: z.string(),
  author_name: z.array(z.string()).optional(),
  publish_year: z.array(z.number().int()).optional(),
});
export function openlibraryAdapter(
  request: SourceRequest,
  base: string,
): BibliographicSource {
  return {
    name: "openlibrary",
    identifiers: ["isbn"],
    async lookup(_kind, value, deadline) {
      const url = new URL("/api/books", base);
      url.searchParams.set("bibkeys", `ISBN:${value}`);
      url.searchParams.set("format", "json");
      url.searchParams.set("jscmd", "data");
      const { body, evidence } = await request(
        "openlibrary",
        url,
        deadline,
        "isbn",
      );
      const response = z.record(z.string(), z.unknown()).safeParse(body);
      const raw = response.success ? response.data[`ISBN:${value}`] : undefined;
      const parsed = edition.safeParse(raw);
      if (answered(evidence) && response.success && raw === undefined)
        return noRecord(evidence);
      if (!answered(evidence) || !parsed.success)
        return { evidence: unreadable(evidence) };
      const m = parsed.data;
      if (
        ![
          ...(m.identifiers?.isbn_10 ?? []),
          ...(m.identifiers?.isbn_13 ?? []),
        ].some((isbn) => normalizeIsbn(isbn) === value)
      )
        return mismatch(evidence);
      const csl: Csl = {
        type: "book",
        title: m.title,
        ISBN: value,
        ...(m.authors
          ? { author: m.authors.map((a) => displayName(a.name)) }
          : {}),
        ...(m.publish_date ? { issued: { literal: m.publish_date } } : {}),
        ...(m.publishers?.[0] ? { publisher: m.publishers[0].name } : {}),
        ...(m.publish_places?.[0]
          ? { "publisher-place": m.publish_places[0].name }
          : {}),
      };
      return {
        candidate: {
          id: `openlibrary:${m.key}`,
          source: "openlibrary",
          origin: "isbn",
          retrievedAt: evidence.observedAt,
          csl,
          raw,
        },
        evidence: { ...evidence, outcome: "candidate", reason: undefined },
      };
    },
    async search(reference, kind, deadline) {
      const url = new URL("/search.json", base);
      if (kind !== "authors-year" && reference.title)
        url.searchParams.set("title", reference.title);
      if (kind !== "title" && reference.author?.length)
        url.searchParams.set(
          "author",
          reference.author
            .map(
              (a) => a.literal ?? [a.given, a.family].filter(Boolean).join(" "),
            )
            .join(" "),
        );
      const year = issuedYear(reference);
      if (kind !== "title" && year) url.searchParams.set("publish_year", year);
      url.searchParams.set("limit", "5");
      url.searchParams.set("fields", "key,title,author_name,publish_year");
      const { body, evidence } = await request(
        "openlibrary",
        url,
        deadline,
        kind,
      );
      const parsed = z.object({ docs: z.array(work) }).safeParse(body);
      if (!answered(evidence) || !parsed.success)
        return { candidates: [], evidence: unreadable(evidence) };
      const candidates: RetrievedCandidate[] = parsed.data.docs
        .slice(0, 5)
        .map((m) => ({
          id: `openlibrary:${m.key}`,
          source: "openlibrary",
          origin: kind,
          retrievedAt: evidence.observedAt,
          raw: m,
          ...((m.publish_year?.length ?? 0) > 1 || reference.edition
            ? { identityAmbiguous: true }
            : {}),
          csl: {
            type: "book",
            title: m.title,
            ...(m.author_name
              ? { author: m.author_name.map(displayName) }
              : {}),
            ...(m.publish_year?.length === 1
              ? { issued: { literal: String(m.publish_year[0]) } }
              : {}),
          },
        }));
      return {
        candidates,
        evidence: {
          ...evidence,
          outcome: candidates.length ? "candidate" : "no-record",
          reason: undefined,
        },
      };
    },
  };
}
