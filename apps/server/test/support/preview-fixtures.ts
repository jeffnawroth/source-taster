// SPDX-License-Identifier: AGPL-3.0-or-later
// The loopback Data-source fixtures shared by the standalone browser/preview
// composition (`scripts/e2e-serve.ts`) and the hosted preview
// (`scripts/e2e-serve-hosted.ts`), so both answer the same References alike.
import { readFile } from "node:fs/promises";
import type { startBibliographicFixtures } from "./bibliographic-fixtures.ts";
import type { startDoiFixtures } from "./doi-fixtures.ts";

type DoiFixtures = Awaited<ReturnType<typeof startDoiFixtures>>;
type BibliographicFixtures = Awaited<
  ReturnType<typeof startBibliographicFixtures>
>;

/**
 * Registers the preview routes on already started DOI fixtures. The caller
 * owns (starts and stops) both fixture servers; this returns the extra
 * environment the verification program needs for web-page checks and a
 * `release` for the held route.
 */
export async function registerPreviewFixtures(
  fixtures: DoiFixtures,
  options: { bibliographic: BibliographicFixtures | undefined; web: boolean },
) {
  if (options.bibliographic)
    fixtures.respond("/works", 200, { message: { items: [] } });
  // Exact development comparison witnesses, served only by the owned HTTP edge.
  const comparisonCases = JSON.parse(
    await readFile(
      new URL("../fixtures/comparison/ten-cases.json", import.meta.url),
      "utf8",
    ),
  ) as { doi: string; field: string; metadata: string }[];
  for (const c of comparisonCases) {
    fixtures.respond(`/api/handles/${c.doi}`, 200, {
      responseCode: 1,
      handle: c.doi,
    });
    fixtures.respond(`/works/${c.doi}`, 200, {
      message: {
        DOI: c.doi,
        [c.field]: ["title", "container-title"].includes(c.field)
          ? [c.metadata]
          : c.metadata,
      },
    });
  }
  fixtures.respond("/api/handles/10.5555/browser-authors", 200, {
    responseCode: 1,
    handle: "10.5555/browser-authors",
  });
  fixtures.respond("/works/10.5555/browser-authors", 200, {
    message: {
      DOI: "10.5555/browser-authors",
      author: [
        { family: "Beta", given: "Ben" },
        { family: "Alpha", given: "Anna" },
        { family: "Gamma", given: "Greta" },
      ],
    },
  });
  fixtures.respond("/api/handles/10.5555/browser-journal", 200, {
    responseCode: 1,
    handle: "10.5555/browser-journal",
  });
  fixtures.respond("/works/10.5555/browser-journal", 200, {
    message: {
      DOI: "10.5555/browser-journal",
      title: ["Synthetic journal evidence"],
      author: [{ family: "Smith", given: "Anna" }],
      "container-title": ["The Journal of biological chemistry"],
      published: { "date-parts": [[2021]] },
      volume: "1",
      page: "1-2",
    },
  });
  const held = fixtures.hold("/api/handles/10.5555/browser-held");
  fixtures.respond("/api/handles/10.5555/browser-unavailable", 503, {});
  fixtures.respond("/works/10.5555/browser-invalid", 200, { message: {} });
  fixtures.respond("/api/handles/10.5555/workspace-nonexistent", 404, {
    responseCode: 100,
    handle: "10.5555/workspace-nonexistent",
  });
  fixtures.respond("/works/10.5555/workspace-nonexistent", 404, {});
  // Independently authored web protocol witnesses; no provider recordings.
  if (options.web) {
    fixtures.respond("/web80-dead", 410, {});
    fixtures.respond("/wayback/available", 200, {
      archived_snapshots: {
        closest: {
          available: true,
          status: "200",
          timestamp: "20260102030405",
          url: "https://web.archive.org/web/20260102030405/https://example.com/web80-dead",
        },
      },
    });
    fixtures.route((url) =>
      url.pathname === "/web/20260102030405id_/https://example.com/web80-dead"
        ? {
            status: 200,
            contentType: "text/html",
            body: "<title>Web route witness</title><p>Evidence</p>",
          }
        : undefined,
    );
  }
  return {
    env: {
      ...(options.web
        ? {
            SOURCE_TASTER_BIBLIOGRAPHIC_PREVIEW: "uncalibrated",
            SOURCE_TASTER_URL_ENABLED: "true",
            SOURCE_TASTER_INTERNETARCHIVE_ENABLED: "true",
            SOURCE_TASTER_WEB_FIXTURE_BASE_URL:
              fixtures.env.SOURCE_TASTER_CROSSREF_BASE_URL,
          }
        : {}),
    } as Record<string, string>,
    release: () => held.release(),
  };
}
