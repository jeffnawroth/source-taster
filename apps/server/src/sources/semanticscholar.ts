// SPDX-License-Identifier: AGPL-3.0-or-later
// Semantic Scholar Academic Graph (ADR-0007): the indexed arXiv lookup and the
// last bibliographic search source. Its records carry no retraction field.
import {
  issuedYear,
  normalizeArxiv,
  normalizePmcid,
  normalizePmid,
} from "@source-taster/core";
import type {
  BibliographicSource,
  Csl,
  RetrievedCandidate,
} from "@source-taster/core";
import { z } from "zod";
import {
  displayName,
  lookupResult,
  noRecord,
  queryTerms,
  searchResult,
  type SourceRequest,
} from "./shared.ts";
const fields = "title,authors,year,venue,externalIds,publicationDate,journal";
const record = z.object({
  paperId: z.string().min(1),
  title: z.string().nullable().optional(),
  externalIds: z
    .object({
      ArXiv: z.string().nullable().optional(),
      DOI: z.string().nullable().optional(),
      PubMed: z.string().nullable().optional(),
      PubMedCentral: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
  authors: z
    .array(z.object({ name: z.string().nullable().optional() }))
    .nullable()
    .optional(),
  year: z.number().int().nullable().optional(),
  venue: z.string().nullable().optional(),
  publicationDate: z.string().nullable().optional(),
  journal: z
    .object({
      name: z.string().nullable().optional(),
      volume: z.string().nullable().optional(),
      pages: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
});
function project(
  body: unknown,
  origin: RetrievedCandidate["origin"],
  retrievedAt: string,
): RetrievedCandidate | undefined {
  const parsed = record.safeParse(body);
  if (!parsed.success) return;
  const m = parsed.data;
  const ids = m.externalIds ?? {};
  const container = m.journal?.name ?? m.venue;
  return {
    id: `S2:${m.paperId}`,
    source: "semanticscholar",
    origin,
    retrievedAt,
    raw: body,
    csl: {
      ...(m.title ? { title: m.title } : {}),
      ...(ids.DOI ? { DOI: ids.DOI } : {}),
      ...(ids.PubMed ? { PMID: normalizePmid(ids.PubMed) } : {}),
      ...(ids.PubMedCentral
        ? {
            PMCID: normalizePmcid(
              `PMC${ids.PubMedCentral.replace(/^PMC/iu, "")}`,
            ),
          }
        : {}),
      ...(ids.ArXiv ? { arXiv: normalizeArxiv(ids.ArXiv) } : {}),
      ...(m.authors
        ? {
            // Unlike OpenAlex, empty author names are dropped.
            author: m.authors.flatMap((a) =>
              a.name?.trim() ? [displayName(a.name)] : [],
            ),
          }
        : {}),
      ...(container ? { "container-title": container } : {}),
      ...(m.publicationDate || m.year
        ? { issued: { literal: m.publicationDate ?? String(m.year) } }
        : {}),
      ...(m.journal?.volume ? { volume: m.journal.volume.trim() } : {}),
      ...(m.journal?.pages
        ? { page: m.journal.pages.trim().replace(/\s*-\s*/u, "–") }
        : {}),
    },
  };
}
export function semanticscholarAdapter(
  request: SourceRequest,
  base: string,
): BibliographicSource {
  return {
    name: "semanticscholar",
    identifiers: ["arxiv"],
    async lookup(kind, value, deadline) {
      const url = new URL(
        `/graph/v1/paper/ARXIV:${encodeURIComponent(value)}`,
        base,
      );
      url.searchParams.set("fields", fields);
      const { body, evidence } = await request(
        "semanticscholar",
        url,
        deadline,
        kind,
      );
      if (evidence.reason === "response" && evidence.status === 404)
        return noRecord(evidence);
      return lookupResult(
        evidence,
        project(body, kind, evidence.observedAt),
        (c) => c.csl.arXiv === value,
      );
    },
    async search(reference: Csl, kind, deadline) {
      // Query text cannot carry the search syntax (+ | - " * ( ) ~).
      const parts = [];
      if (kind !== "authors-year" && reference.title)
        parts.push(queryTerms(reference.title));
      if (kind !== "title")
        parts.push(
          ...(reference.author ?? [])
            .slice(0, 3)
            .map((a) => queryTerms(a.family ?? a.literal ?? "")),
        );
      const url = new URL("/graph/v1/paper/search", base);
      url.searchParams.set("query", parts.filter(Boolean).join(" "));
      const year = issuedYear(reference);
      if (kind !== "title" && year) url.searchParams.set("year", year);
      url.searchParams.set("limit", "5");
      url.searchParams.set("fields", fields);
      const { body, evidence } = await request(
        "semanticscholar",
        url,
        deadline,
        kind,
      );
      const parsed = z
        .object({ data: z.array(z.unknown()).optional() })
        .safeParse(body);
      // A page without data is a completed empty result.
      return searchResult(
        evidence,
        parsed.success ? (parsed.data.data ?? []).slice(0, 5) : undefined,
        (m) => project(m, kind, evidence.observedAt),
      );
    },
  };
}
