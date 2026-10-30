// SPDX-License-Identifier: AGPL-3.0-or-later
// #78 fairness operating settings. Real workers, PG and public HTTP only; the
// OpenAlex PMID route is a loopback fixture and Owners come from Test-Owner.
import { afterEach, beforeEach, expect, it } from "vitest";
import { CheckResponse } from "@source-taster/contract-verification/v2";
import { lifecycleService } from "./support/lifecycle-service.ts";
import { startDoiFixtures } from "./support/doi-fixtures.ts";
let openalex: Awaited<ReturnType<typeof startDoiFixtures>>;
let crossref: Awaited<ReturnType<typeof startDoiFixtures>>;
let service: Awaited<ReturnType<typeof lifecycleService>> | undefined;
beforeEach(async () => {
  openalex = await startDoiFixtures();
  crossref = await startDoiFixtures();
  // Every Reference is identified by its first OpenAlex query (its own title).
  openalex.route((url) => {
    const n = /title\.search:Synthetic article (\d+)/u.exec(
      url.searchParams.get("filter") ?? "",
    )?.[1];
    return n
      ? {
          status: 200,
          body: {
            results: [
              {
                id: `https://openalex.org/W${n}`,
                title: `Synthetic article ${n}`,
                publication_year: 2021,
                authorships: [{ author: { display_name: "Alpha" } }],
                ids: {},
              },
            ],
          },
        }
      : undefined;
  });
});
afterEach(async () => {
  await service?.stop();
  service = undefined;
  await openalex?.stop();
  await crossref?.stop();
});
const start = async (settings: object) =>
  (service = await lifecycleService({
    ...crossref.env,
    SOURCE_TASTER_BIBLIOGRAPHIC_PREVIEW: "uncalibrated",
    SOURCE_TASTER_OPENALEX_ENABLED: "true",
    SOURCE_TASTER_OPENALEX_BASE_URL:
      openalex.env.SOURCE_TASTER_CROSSREF_BASE_URL,
    SOURCE_TASTER_SEARCH_SETTINGS: JSON.stringify(settings),
    TEST_CLIENT_LEASE_MS: "75000",
    TEST_WORKER_CLAIM_MS: "45000",
  }));
async function create(owner: string, numbers: number[]) {
  const response = await fetch(`${service!.apiUrl}/v2/checks`, {
    method: "POST",
    headers: { "content-type": "application/json", "Test-Owner": owner },
    body: JSON.stringify({
      references: numbers.map((n) => ({
        originalText: `Synthetic fairness witness ${n}`,
        fields: {
          title: `Synthetic article ${n}`,
          author: [{ family: "Alpha" }],
          issued: { literal: "2021" },
        },
      })),
    }),
  });
  expect(response.status).toBe(201);
  return CheckResponse.parse(await response.json()).data;
}
const state = async (owner: string, id: string) =>
  CheckResponse.parse(
    await (
      await fetch(`${service!.apiUrl}/v2/checks/${id}`, {
        headers: { "Test-Owner": owner },
      })
    ).json(),
  ).data.state;
const order = () =>
  openalex.requests.flatMap((r) => {
    const n = /title\.search:Synthetic\+article\+(\d+)/u.exec(r.path)?.[1];
    return n ? [Number(n)] : [];
  });

it("alternates between Owners before alternating between one Owner's Checks", async () => {
  await start({
    workerConcurrency: 1,
    sources: { openalex: { intervalMs: 0 } },
  });
  const checks = [
    ["owner-a", await create("owner-a", [11, 12, 13])],
    ["owner-a", await create("owner-a", [21, 22, 23])],
    ["owner-a", await create("owner-a", [31, 32, 33])],
    ["owner-b", await create("owner-b", [41, 42, 43])],
  ] as const;
  await service!.worker().ready;
  for (const [owner, check] of checks)
    await expect
      .poll(() => state(owner, check.id), { timeout: 15000 })
      .toBe("ended");
  // Check-only round robin would give owner-a three of every four dispatches.
  expect(order()).toEqual([11, 41, 21, 42, 31, 43, 12, 22, 32, 13, 23, 33]);
});

it("caps running References per Check at the configured setting", async () => {
  await start({
    activeReferencesPerCheck: 1,
    workerConcurrency: 4,
    sources: { openalex: { intervalMs: 0, concurrency: 4 } },
  });
  const held = openalex.hold(
    "/works?filter=title.search:Synthetic+article+51,raw_author_name.search:Alpha,publication_year:2021&per_page=5",
  );
  const busy = await create("owner-a", [51, 52]);
  const other = await create("owner-a", [61]);
  await service!.worker().ready;
  try {
    await held.arrived;
    // The other Check proceeds while this Check's second Reference waits.
    await expect
      .poll(() => state("owner-a", other.id), { timeout: 15000 })
      .toBe("ended");
    expect(order().slice(0, 2)).toEqual([51, 61]);
    // Without the cap a worker poll (0.5 s) claims 52 well inside this window,
    // which stays below the 3 s request timeout of the held Reference.
    await new Promise((resolve) => setTimeout(resolve, 1500));
    expect(order()).toEqual([51, 61]);
  } finally {
    held.release();
  }
  await expect
    .poll(() => state("owner-a", busy.id), { timeout: 15000 })
    .toBe("ended");
  expect(order()).toContain(52);
});
