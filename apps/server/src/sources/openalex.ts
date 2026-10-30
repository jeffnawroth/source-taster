// SPDX-License-Identifier: AGPL-3.0-or-later
import { normalizePmcid, normalizePmid } from "@source-taster/core";
import type {
  BibliographicSource,
  Csl,
  Evidence,
  RetrievedCandidate,
} from "@source-taster/core";
import { z } from "zod";
import { projectDisplayName } from "./names.ts";
export type SourceRequest = (
  source: Evidence["source"],
  url: URL,
  deadline: number,
  operation?: Evidence["operation"],
) => Promise<{ body?: unknown; evidence: Evidence }>;
const record = z.object({
  id: z.string().regex(/^https:\/\/openalex\.org\/W\d+$/u),
  title: z.string().nullable().optional(),
  type: z.string().optional(),
  doi: z.string().nullable().optional(),
  is_retracted: z.boolean().nullable().optional(),
  publication_year: z.number().int().nullable().optional(),
  publication_date: z.string().nullable().optional(),
  ids: z
    .object({
      pmid: z.string().nullable().optional(),
      pmcid: z.string().nullable().optional(),
    })
    .optional(),
  authorships: z
    .array(z.object({ author: z.object({ display_name: z.string() }) }))
    .optional(),
  primary_location: z
    .object({
      source: z
        .object({ display_name: z.string().nullable().optional() })
        .nullable()
        .optional(),
    })
    .nullable()
    .optional(),
  biblio: z
    .object({
      volume: z.string().nullable().optional(),
      issue: z.string().nullable().optional(),
      first_page: z.string().nullable().optional(),
      last_page: z.string().nullable().optional(),
    })
    .optional(),
});
// Filter values cannot inject OpenAlex's comma/pipe/colon query operators.
const terms = (text: string) =>
  text
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/gu, " ")
    .trim();
function project(
  body: unknown,
  origin: RetrievedCandidate["origin"],
  retrievedAt: string,
  bookMetadata = false,
): RetrievedCandidate | undefined {
  const parsed = record.safeParse(body);
  if (!parsed.success) return;
  const m = parsed.data;
  return {
    id: m.id,
    source: "openalex",
    origin,
    retrievedAt,
    raw: body,
    ...(m.is_retracted === true
      ? {
          retractionEvidence: {
            source: "openalex" as const,
            candidateId: m.id,
            observedAt: retrievedAt,
          },
        }
      : {}),
    csl: {
      ...(bookMetadata && m.type
        ? {
            type:
              m.type === "book-chapter"
                ? "chapter"
                : m.type === "article"
                  ? "article-journal"
                  : m.type,
          }
        : {}),
      ...(m.title ? { title: m.title } : {}),
      ...(m.doi ? { DOI: m.doi.replace(/^https?:\/\/doi\.org\//iu, "") } : {}),
      ...(m.ids?.pmid ? { PMID: normalizePmid(m.ids.pmid) } : {}),
      ...(m.ids?.pmcid ? { PMCID: normalizePmcid(m.ids.pmcid) } : {}),
      ...(m.authorships
        ? {
            author: m.authorships.map((a) =>
              projectDisplayName(a.author.display_name),
            ),
          }
        : {}),
      ...(m.primary_location?.source?.display_name
        ? { "container-title": m.primary_location.source.display_name }
        : {}),
      ...(m.publication_date || m.publication_year
        ? {
            issued: {
              literal: m.publication_date ?? String(m.publication_year),
            },
          }
        : {}),
      ...(m.biblio?.volume ? { volume: m.biblio.volume } : {}),
      ...(m.biblio?.issue ? { issue: m.biblio.issue } : {}),
      ...(m.biblio?.first_page
        ? {
            page: [m.biblio.first_page, m.biblio.last_page]
              .filter(Boolean)
              .join("–"),
          }
        : {}),
    },
  };
}
export function openalexAdapter(
  request: SourceRequest,
  base: string,
  bookMetadata = false,
): BibliographicSource {
  return {
    name: "openalex",
    identifiers: ["doi", "pmid"],
    async lookup(kind, value, deadline) {
      if (kind !== "doi" && kind !== "pmid")
        return {
          evidence: {
            source: "openalex",
            operation: kind,
            outcome: "unsupported",
            reason: "identifier-capability-unavailable",
            durationMs: 0,
            attempts: 0,
            observedAt: new Date().toISOString(),
          },
        };
      const { body, evidence } = await request(
        "openalex",
        new URL(`/works/${encodeURIComponent(`${kind}:${value}`)}`, base),
        deadline,
        kind,
      );
      if (evidence.reason === "response" && evidence.status === 404)
        return {
          evidence: { ...evidence, outcome: "no-record", reason: undefined },
        };
      const candidate = project(body, kind, evidence.observedAt, bookMetadata);
      const key = kind === "doi" ? "DOI" : kind === "pmid" ? "PMID" : "PMCID";
      if (
        evidence.reason !== "response" ||
        evidence.status !== 200 ||
        !candidate
      )
        return {
          evidence: {
            ...evidence,
            reason:
              evidence.reason === "response"
                ? "invalid-metadata"
                : evidence.reason,
          },
        };
      if (candidate.csl[key]?.toLowerCase() !== value.toLowerCase())
        return { evidence: { ...evidence, reason: "identifier-mismatch" } };
      return {
        candidate,
        evidence: { ...evidence, outcome: "candidate", reason: undefined },
      };
    },
    async search(reference: Csl, kind, deadline) {
      const url = new URL("/works", base);
      const filters = [];
      if (kind !== "authors-year" && reference.title)
        filters.push(`title.search:${terms(reference.title)}`);
      if (kind !== "title" && reference.author?.length)
        filters.push(
          `raw_author_name.search:${terms(reference.author.map((a) => a.literal ?? [a.given, a.family].filter(Boolean).join(" ")).join(" "))}`,
        );
      const year = reference.issued?.literal.match(/\b[12]\d{3}\b/u)?.[0];
      if (kind !== "title" && year) filters.push(`publication_year:${year}`);
      url.searchParams.set("filter", filters.join(","));
      url.searchParams.set("per_page", "5");
      const { body, evidence } = await request("openalex", url, deadline, kind);
      const parsed = z
        .object({ results: z.array(z.unknown()) })
        .safeParse(body);
      const candidates = parsed.success
        ? parsed.data.results.map((m) =>
            project(m, kind, evidence.observedAt, bookMetadata),
          )
        : [];
      if (
        evidence.reason !== "response" ||
        evidence.status !== 200 ||
        !parsed.success ||
        candidates.some((c) => !c)
      )
        return {
          candidates: [],
          evidence: {
            ...evidence,
            reason:
              evidence.reason === "response"
                ? "invalid-metadata"
                : evidence.reason,
          },
        };
      return {
        candidates: candidates as RetrievedCandidate[],
        evidence: {
          ...evidence,
          outcome: candidates.length ? "candidate" : "no-record",
          reason: undefined,
        },
      };
    },
  };
}
