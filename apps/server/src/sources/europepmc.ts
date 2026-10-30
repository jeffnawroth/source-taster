// SPDX-License-Identifier: AGPL-3.0-or-later
// Europe PMC REST search (ADR-0007): responsible PMCID source, PMID fallback
// after OpenAlex, and the third bibliographic search source.
import { issuedYear, normalizePmcid, normalizePmid } from "@source-taster/core";
import type {
  BibliographicSource,
  Csl,
  Evidence,
  RetrievedCandidate,
} from "@source-taster/core";
import { z } from "zod";
import {
  mismatch,
  queryTerms,
  searchResult,
  type SourceRequest,
} from "./shared.ts";
const record = z.object({
  id: z.string(),
  source: z.string(),
  pmid: z.string().optional(),
  pmcid: z.string().optional(),
  doi: z.string().optional(),
  title: z.string().optional(),
  pubYear: z.string().optional(),
  pageInfo: z.string().optional(),
  authorList: z
    .object({
      author: z.array(
        z.object({
          lastName: z.string().optional(),
          firstName: z.string().optional(),
          collectiveName: z.string().optional(),
          fullName: z.string().optional(),
        }),
      ),
    })
    .optional(),
  journalInfo: z
    .object({
      volume: z.string().optional(),
      issue: z.string().optional(),
      journal: z.object({ title: z.string().optional() }).optional(),
    })
    .optional(),
  pubTypeList: z.object({ pubType: z.array(z.string()) }).optional(),
});
const page = z.object({
  hitCount: z.number().int().nonnegative(),
  resultList: z.object({ result: z.array(z.unknown()) }),
});
// Phrase values cannot carry Europe PMC query operators or quotes.
const phrase = (text: string) => `"${queryTerms(text)}"`;
function project(
  body: unknown,
  origin: RetrievedCandidate["origin"],
  retrievedAt: string,
): RetrievedCandidate | undefined {
  const parsed = record.safeParse(body);
  if (!parsed.success) return;
  const m = parsed.data;
  const id = `${m.source}:${m.id}`;
  return {
    id,
    source: "europepmc",
    origin,
    retrievedAt,
    raw: body,
    // MEDLINE publication type; absence is unknown, never a verified negative.
    ...(m.pubTypeList?.pubType.some(
      (type) => type.toLowerCase() === "retracted publication",
    )
      ? {
          retractionEvidence: {
            source: "europepmc" as const,
            candidateId: id,
            observedAt: retrievedAt,
          },
        }
      : {}),
    csl: {
      ...(m.title ? { title: m.title.replace(/\.$/u, "") } : {}),
      ...(m.doi ? { DOI: m.doi } : {}),
      ...(m.pmid ? { PMID: normalizePmid(m.pmid) } : {}),
      ...(m.pmcid ? { PMCID: normalizePmcid(m.pmcid) } : {}),
      ...(m.authorList
        ? {
            author: m.authorList.author.map((a) =>
              a.lastName
                ? {
                    family: a.lastName,
                    ...(a.firstName ? { given: a.firstName } : {}),
                  }
                : { literal: a.collectiveName ?? a.fullName ?? "" },
            ),
          }
        : {}),
      ...(m.journalInfo?.journal?.title
        ? { "container-title": m.journalInfo.journal.title }
        : {}),
      ...(m.pubYear ? { issued: { literal: m.pubYear } } : {}),
      ...(m.journalInfo?.volume ? { volume: m.journalInfo.volume } : {}),
      ...(m.journalInfo?.issue ? { issue: m.journalInfo.issue } : {}),
      ...(m.pageInfo ? { page: m.pageInfo } : {}),
    },
  };
}
export function europepmcAdapter(
  request: SourceRequest,
  base: string,
): BibliographicSource {
  async function query(
    text: string,
    size: number,
    operation: Evidence["operation"],
    deadline: number,
  ) {
    const url = new URL("/europepmc/webservices/rest/search", base);
    url.searchParams.set("query", text);
    url.searchParams.set("resultType", "core");
    url.searchParams.set("format", "json");
    url.searchParams.set("pageSize", String(size));
    const { body, evidence } = await request(
      "europepmc",
      url,
      deadline,
      operation,
    );
    return searchResult(
      evidence,
      page.safeParse(body).data?.resultList.result.slice(0, size),
      (m) => project(m, operation, evidence.observedAt),
    );
  }
  return {
    name: "europepmc",
    identifiers: ["pmid", "pmcid"],
    async lookup(kind, value, deadline) {
      const { candidates, evidence } = await query(
        kind === "pmid"
          ? `EXT_ID:${value.replace(/\D/gu, "")} AND SRC:MED`
          : `PMCID:${value.replace(/[^\dA-Z]/gu, "")}`,
        1,
        kind,
        deadline,
      );
      const candidate = candidates[0];
      if (!candidate) return { evidence };
      const key = kind === "pmid" ? "PMID" : "PMCID";
      if (candidate.csl[key]?.toUpperCase() !== value.toUpperCase())
        return mismatch(evidence);
      return { candidate, evidence };
    },
    search(reference: Csl, kind, deadline) {
      const parts = [];
      if (kind !== "authors-year" && reference.title)
        parts.push(`TITLE:${phrase(reference.title)}`);
      if (kind !== "title")
        for (const a of (reference.author ?? []).slice(0, 3)) {
          const name = a.family ?? a.literal;
          if (name) parts.push(`AUTH:${phrase(name)}`);
        }
      const year = issuedYear(reference);
      if (kind !== "title" && year) parts.push(`PUB_YEAR:${year}`);
      return query(parts.join(" AND "), 5, kind, deadline);
    },
  };
}
