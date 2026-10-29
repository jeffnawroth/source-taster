// SPDX-License-Identifier: AGPL-3.0-or-later
// Source HTTP edge only. Recorded metadata plus explicitly synthetic witnesses.
import { createServer } from "node:http";
import { once } from "node:events";
import { readFile } from "node:fs/promises";
export async function startBibliographicFixtures() {
  const recorded: unknown = JSON.parse(
    await readFile(
      new URL(
        "../fixtures/bibliographic/openalex-nphys1170.json",
        import.meta.url,
      ),
      "utf8",
    ),
  );
  const server = createServer((req, res) => {
    const url = new URL(req.url ?? "/", "http://fixture");
    res.setHeader("content-type", "application/json");
    if (url.pathname !== "/works") {
      res.writeHead(404);
      res.end("{}");
      return;
    }
    const filters = url.searchParams.get("filter") ?? "";
    const authorOnly = !filters.includes("title.search:");
    let results: unknown[] = [];
    if (
      filters.includes("Measured measurement") ||
      filters.includes("Aspelmeyer")
    )
      results = [recorded];
    if (authorOnly && filters.includes("Beta"))
      results = [
        {
          id: "https://openalex.org/W77001",
          title: "ZZZZZZZZZZZZZZZZZ",
          publication_year: 2009,
          authorships: [{ author: { display_name: "B Beta" } }],
        },
      ];
    if (filters.includes("ambiguous"))
      results = [
        filters.includes("raw_author_name")
          ? {
              id: "https://openalex.org/W77002",
              title: "Synthetic ambiguous article",
              doi: "10.5555/ambiguous-one",
            }
          : {
              id: "https://openalex.org/W77003",
              title: "Synthetic ambiguous article",
              doi: "10.5555/ambiguous-two",
              publication_year: 2021,
              authorships: [{ author: { display_name: "A Alpha" } }],
            },
      ];
    if (filters.includes("Synthetic retracted article"))
      results = [
        {
          id: "https://openalex.org/W77901",
          title: "Synthetic retracted article",
          publication_year: 2021,
          authorships: [{ author: { display_name: "A Alpha" } }],
          is_retracted: true,
        },
      ];
    if (filters.includes("Source link witness"))
      results = [
        {
          id: "https://openalex.org/W77902",
          title: "Source link witness",
          publication_year: 2021,
          authorships: [{ author: { display_name: "A Alpha" } }],
        },
      ];
    if (
      filters.includes("Workspace tied article") ||
      (authorOnly && filters.includes("WorkspaceTie"))
    )
      results = [
        {
          id: authorOnly
            ? "https://openalex.org/W82002"
            : "https://openalex.org/W82001",
          title: "Workspace tied article",
          publication_year: 2021,
          doi: "10.5555/workspace-tied",
          ...(authorOnly
            ? { authorships: [{ author: { display_name: "A WorkspaceTie" } }] }
            : {}),
        },
      ];
    if (
      filters.includes("Workspace ranked article") ||
      (authorOnly && filters.includes("WorkspaceRanked"))
    )
      results = [
        {
          id: "https://openalex.org/W82011",
          title: "ZZZZZZZZZZZZZZZZZZZZZZZZ",
          publication_year: 2021,
          authorships: [{ author: { display_name: "Z Zed" } }],
        },
        {
          id: "https://openalex.org/W82012",
          title: "Workspace ranked article",
          publication_year: 2021,
          authorships: [{ author: { display_name: "Z Zed" } }],
        },
        {
          id: "https://openalex.org/W82013",
          title: "Workspace ranked article",
          publication_year: 2021,
          authorships: [{ author: { display_name: "R WorkspaceRanked" } }],
        },
      ];
    res.end(JSON.stringify({ results }));
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  if (!address || typeof address === "string")
    throw new Error("fixture-address");
  return {
    env: {
      SOURCE_TASTER_BIBLIOGRAPHIC_PREVIEW: "uncalibrated",
      SOURCE_TASTER_OPENALEX_ENABLED: "true",
      SOURCE_TASTER_OPENALEX_BASE_URL: `http://127.0.0.1:${address.port}`,
    },
    stop: () =>
      new Promise<void>((resolve, reject) => {
        server.close((e) => (e ? reject(e) : resolve()));
        server.closeAllConnections();
      }),
  };
}
