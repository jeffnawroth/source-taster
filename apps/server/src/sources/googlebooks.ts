// SPDX-License-Identifier: AGPL-3.0-or-later
import {
  normalizeIsbn,
  type BibliographicSource,
  type RetrievedCandidate,
  type QueryKind,
  type Csl,
} from "@source-taster/core";
import { z } from "zod";
import { projectDisplayName } from "./names.ts";
import type { SourceRequest } from "./openalex.ts";
const volume = z.object({
  id: z.string().regex(/^[\w-]+$/u),
  volumeInfo: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    authors: z.array(z.string()).optional(),
    publishedDate: z.string().optional(),
    publisher: z.string().optional(),
    industryIdentifiers: z
      .array(z.object({ type: z.string(), identifier: z.string() }))
      .optional(),
  }),
});
const response = z.object({
  totalItems: z.number().int().nonnegative(),
  items: z.array(volume).optional(),
});
function project(
  m: z.infer<typeof volume>,
  origin: RetrievedCandidate["origin"],
  retrievedAt: string,
  exactIsbn?: string,
): RetrievedCandidate {
  const v = m.volumeInfo;
  const isbns = (v.industryIdentifiers ?? [])
    .filter((i) => ["ISBN_10", "ISBN_13"].includes(i.type))
    .map((i) => normalizeIsbn(i.identifier))
    .filter((i): i is string => !!i);
  const isbn = exactIsbn ?? (new Set(isbns).size === 1 ? isbns[0] : undefined);
  return {
    id: `googlebooks:${m.id}`,
    source: "googlebooks",
    origin,
    retrievedAt,
    raw: m,
    csl: {
      type: "book",
      title: [v.title, v.subtitle].filter(Boolean).join(": "),
      ...(v.authors
        ? {
            author: v.authors.map(projectDisplayName),
          }
        : {}),
      ...(v.publishedDate ? { issued: { literal: v.publishedDate } } : {}),
      ...(v.publisher ? { publisher: v.publisher } : {}),
      ...(isbn ? { ISBN: isbn } : {}),
    },
  };
}
// Quoted Google terms cannot introduce another field/operator into the query.
const quoted = (value: string) => `"${value.replace(/["\\]/gu, " ")}"`;
export function googlebooksAdapter(
  request: SourceRequest,
  base: string,
): BibliographicSource {
  async function retrieve(
    query: string,
    kind: QueryKind | "isbn",
    deadline: number,
  ) {
    const url = new URL("/books/v1/volumes", base);
    url.searchParams.set("q", query);
    url.searchParams.set("maxResults", "5");
    url.searchParams.set("printType", "books");
    const { body, evidence } = await request(
      "googlebooks",
      url,
      deadline,
      kind,
    );
    const parsed = response.safeParse(body);
    if (
      evidence.reason !== "response" ||
      evidence.status !== 200 ||
      !parsed.success ||
      (parsed.data.totalItems > 0 && !parsed.data.items?.length)
    )
      return {
        items: [],
        evidence: {
          ...evidence,
          reason:
            evidence.reason === "response"
              ? "invalid-metadata"
              : evidence.reason,
        },
      };
    return {
      items: (parsed.data.items ?? []).slice(0, 5),
      evidence: {
        ...evidence,
        outcome: parsed.data.items?.length
          ? ("candidate" as const)
          : ("no-record" as const),
        reason: undefined,
      },
    };
  }
  return {
    name: "googlebooks",
    identifiers: ["isbn"],
    async lookup(_kind, value, deadline) {
      const { items, evidence } = await retrieve(
        `isbn:${value}`,
        "isbn",
        deadline,
      );
      if (evidence.outcome !== "candidate") return { evidence };
      const exact = items.filter((m) =>
        m.volumeInfo.industryIdentifiers?.some(
          (i) =>
            ["ISBN_10", "ISBN_13"].includes(i.type) &&
            normalizeIsbn(i.identifier) === value,
        ),
      );
      if (!exact.length)
        return {
          evidence: {
            ...evidence,
            outcome: "unavailable",
            reason: "identifier-mismatch",
          },
        };
      const candidate = project(exact[0]!, "isbn", evidence.observedAt, value);
      const alternatives = [...new Set(exact.map((m) => m.id))].slice(1);
      if (alternatives.length) candidate.identityAmbiguous = true;
      return {
        candidate,
        evidence: {
          ...evidence,
          ...(alternatives.length
            ? {
                identifierAmbiguity: alternatives.map(
                  (id) => `googlebooks:${id}`,
                ),
              }
            : {}),
        },
      };
    },
    async search(reference: Csl, kind, deadline) {
      const terms = [];
      if (kind !== "authors-year" && reference.title)
        terms.push(`intitle:${quoted(reference.title)}`);
      if (kind !== "title") {
        for (const a of reference.author ?? [])
          terms.push(
            `inauthor:${quoted(a.literal ?? [a.given, a.family].filter(Boolean).join(" "))}`,
          );
        // Google Books has no publication-year filter: include a plain query term.
        const year = reference.issued?.literal.match(/\b[12]\d{3}\b/u)?.[0];
        if (year) terms.push(year);
      }
      const { items, evidence } = await retrieve(
        terms.join(" "),
        kind,
        deadline,
      );
      return {
        candidates:
          evidence.outcome === "candidate"
            ? items.map((m) => project(m, kind, evidence.observedAt))
            : [],
        evidence,
      };
    },
  };
}
