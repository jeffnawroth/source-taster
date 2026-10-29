// SPDX-License-Identifier: AGPL-3.0-or-later
import type {
  BibliographicSource,
  DataSource,
  RetrievedCandidate,
} from "@source-taster/core";
import type { SourceRequest } from "./openalex.ts";
import { z } from "zod";
export function crossrefAdapter(
  request: SourceRequest,
  base: string,
  source: DataSource,
  project: (
    body: unknown,
    origin: RetrievedCandidate["origin"],
    observedAt: string,
  ) => RetrievedCandidate | null,
): BibliographicSource {
  const updates = z.object({
    "updated-by": z.array(z.object({ type: z.string() })).optional(),
  });
  const identified = (c: RetrievedCandidate): RetrievedCandidate => {
    const id = `crossref:${c.id}`;
    const parsed = updates.safeParse(c.raw);
    // updated-by describes notices about this Source. update-to describes
    // the Source a notice updates and does not retract the notice itself.
    const retracted =
      parsed.success &&
      parsed.data["updated-by"]?.some((update) => update.type === "retraction");
    return {
      ...c,
      id,
      ...(retracted
        ? {
            retractionEvidence: {
              source: "crossref",
              candidateId: id,
              observedAt: c.retrievedAt,
            },
          }
        : {}),
    };
  };
  return {
    name: "crossref",
    identifiers: ["doi"],
    async lookup(_kind, value, deadline) {
      const response = await source.lookupDoi(value, deadline);
      return {
        ...response,
        ...(response.candidate
          ? { candidate: identified(response.candidate) }
          : {}),
      };
    },
    async search(reference, kind, deadline) {
      const url = new URL("/works", base);
      const authors = (reference.author ?? [])
        .map((a) => a.literal ?? [a.given, a.family].filter(Boolean).join(" "))
        .join(" ");
      if (kind === "combined")
        url.searchParams.set(
          "query.bibliographic",
          [reference.title, authors, reference.issued?.literal]
            .filter(Boolean)
            .join(" "),
        );
      else if (kind === "title")
        url.searchParams.set("query.title", reference.title!);
      else {
        url.searchParams.set("query.author", authors);
        const year = reference.issued?.literal.match(/\b[12]\d{3}\b/u)?.[0];
        if (year)
          url.searchParams.set(
            "filter",
            `from-pub-date:${year}-01-01,until-pub-date:${year}-12-31`,
          );
      }
      url.searchParams.set("rows", "5");
      const { body, evidence } = await request("crossref", url, deadline, kind);
      const parsed = z
        .object({ message: z.object({ items: z.array(z.unknown()) }) })
        .safeParse(body);
      const candidates = parsed.success
        ? parsed.data.message.items.map((m) =>
            project(m, kind, evidence.observedAt),
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
        candidates: (candidates as RetrievedCandidate[]).map(identified),
        evidence: {
          ...evidence,
          outcome: candidates.length ? "candidate" : "no-record",
          reason: undefined,
        },
      };
    },
  };
}
