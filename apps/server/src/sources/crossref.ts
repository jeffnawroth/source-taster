// SPDX-License-Identifier: AGPL-3.0-or-later
import { issuedYear } from "@source-taster/core";
import type {
  BibliographicSource,
  DataSource,
  RetrievedCandidate,
} from "@source-taster/core";
import { searchResult, type SourceRequest } from "./shared.ts";
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
        const year = issuedYear(reference);
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
      const page = searchResult(evidence, parsed.data?.message.items, (m) =>
        project(m, kind, evidence.observedAt),
      );
      return { ...page, candidates: page.candidates.map(identified) };
    },
  };
}
