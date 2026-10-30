// SPDX-License-Identifier: AGPL-3.0-or-later
// The arXiv adapter's reading of a feed. Absence is no-record only when the
// identifier is in arXiv's record form and the feed is a complete answer to
// the identifiers sent; otherwise the lookup is unavailable, never Not found.
// Feeds are recorded (fixtures/article-sources/README.md) unless cut here to
// witness a partial response.
import { readFile } from "node:fs/promises";
import { expect, it } from "vitest";
import type { Evidence } from "@source-taster/core";
import { arxivAdapter } from "../src/sources/arxiv.ts";
import type { SourceBatch, SourceRequest } from "../src/sources/shared.ts";
const fixture = (name: string) =>
  readFile(
    new URL(`fixtures/article-sources/${name}`, import.meta.url),
    "utf8",
  );
const answered = (): Evidence => ({
  source: "arxiv",
  operation: "arxiv",
  outcome: "unavailable",
  reason: "response",
  status: 200,
  durationMs: 1,
  attempts: 1,
  observedAt: "2026-10-30T09:22:00.000Z",
});
/** An adapter whose single request and batch both answer with `body`. */
function answering(body: string, sent: string[]) {
  const request: SourceRequest = () =>
    Promise.resolve({ body, evidence: answered() });
  const batched: SourceBatch = (_s, _o, _v, _d, _u, target) => {
    target(sent);
    return Promise.resolve({ body, evidence: answered(), ids: sent });
  };
  return arxivAdapter(request, batched, "http://arxiv.fixture");
}
const lookup = (body: string, value: string, sent = [value]) =>
  answering(body, sent).lookup("arxiv", value, Date.now() + 5000);
// The recorded batch's request order; arXiv answers in another order.
const oldScheme = ["hep-th/9901001", "math/0309136", "hep-ph/9601001"];

it("reads old-scheme records from a complete batch and their absence", async () => {
  const feed = await fixture("arxiv-oldscheme-batch.xml");
  for (const id of ["hep-th/9901001", "math/0309136"]) {
    const result = await lookup(feed, id, oldScheme);
    expect(result.evidence.outcome).toBe("candidate");
    expect(result.candidate).toMatchObject({
      id: `arXiv:${id}`,
      csl: { arXiv: id },
    });
  }
  // The complete answer to the identifiers sent omits this one.
  expect((await lookup(feed, "hep-ph/9601001", oldScheme)).evidence).toEqual(
    expect.objectContaining({ outcome: "no-record" }),
  );
});

it.each([
  ["arxiv-math.GT-0309136.xml", "math.GT/0309136"],
  ["arxiv-HEP-TH-9901001.xml", "HEP-TH/9901001"],
])("does not read %s's empty answer as no record", async (name, value) => {
  // arXiv omits these forms, though math/0309136 and hep-th/9901001 exist.
  const result = await lookup(await fixture(name), value);
  expect(result.candidate).toBeUndefined();
  expect(result.evidence).toMatchObject({
    outcome: "unavailable",
    reason: "invalid-metadata",
  });
});

it("does not read a member missing from an incomplete feed as no record", async () => {
  const recorded = await fixture("arxiv-oldscheme-batch.xml");
  const first = recorded.indexOf("</entry>") + "</entry>".length;
  const feeds = {
    // Cut after the first entry, without the closing feed.
    truncated: recorded.slice(0, first),
    // Closed, but one of the two results is missing.
    partial: `${recorded.slice(0, first)}\n</feed>\n`,
    // No result count.
    uncounted: recorded.replace(/<opensearch:totalResults>.*\n/u, ""),
    // An entry that was not requested.
    foreign: recorded.replace("math/0309136v1</id>", "math/0309137v1</id>"),
    empty: "",
  };
  for (const [kind, feed] of Object.entries(feeds))
    // Not listed by any of these feeds; the complete one shows no record.
    expect(
      (await lookup(feed, "hep-ph/9601001", oldScheme)).evidence,
      kind,
    ).toMatchObject({ outcome: "unavailable", reason: "invalid-metadata" });
  // Cut from the truncated and partial feeds, though it has a record.
  for (const feed of [feeds.truncated, feeds.partial])
    expect(
      (await lookup(feed, "hep-th/9901001", oldScheme)).evidence,
    ).toMatchObject({ outcome: "unavailable", reason: "invalid-metadata" });
  // A complete entry in a truncated feed is still that record.
  expect(
    (await lookup(feeds.truncated, "math/0309136", oldScheme)).evidence.outcome,
  ).toBe("candidate");
});
