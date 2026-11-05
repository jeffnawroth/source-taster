// SPDX-License-Identifier: AGPL-3.0-or-later
// Structure properties that the PDF/UA-1 reference validator also checks, held
// by an independent parser (pdf.js + the raw file) on the production worker
// output: every visible character is tagged or an Artifact, and every link
// annotation carries a description. No database or service is involved.
import { beforeAll, describe, expect, it } from "vitest";
import {
  inspectPdf,
  rawLinks,
  roles,
  untaggedText,
} from "./support/pdf-inspect.ts";
import { generateSamples, type Sample } from "./support/report-samples.ts";

let samples: Sample[];
beforeAll(async () => {
  samples = await generateSamples();
}, 60_000);

describe("report PDF structure", () => {
  it("produces DE and EN samples, including a multi-page one", async () => {
    expect(samples.map((s) => s.name).sort()).toEqual([
      "report-final-de",
      "report-final-en",
      "report-intermediate-de",
      "report-intermediate-en",
      "report-long-de",
      "report-long-en",
    ]);
    for (const sample of samples.filter((s) => s.name.includes("long")))
      expect((await inspectPdf(sample.pdf)).pageCount).toBeGreaterThan(3);
  });

  it("tags every visible character or marks it as an Artifact", async () => {
    for (const sample of samples) {
      const inspected = await inspectPdf(sample.pdf);
      for (const page of inspected.pages)
        expect(untaggedText(page), sample.name).toEqual([]);
    }
  });

  it("gives every link annotation a non-empty description", () => {
    for (const sample of samples) {
      const links = rawLinks(sample.pdf);
      expect(links.withoutContents, sample.name).toBe(0);
      expect(links.withStructParent, sample.name).toBe(links.annotations);
      expect(links.objectReferences, sample.name).toBe(links.annotations);
    }
  });

  it("keeps a heading, paragraph, list and link structure on every page break", async () => {
    for (const sample of samples) {
      const inspected = await inspectPdf(sample.pdf);
      const all = inspected.pages.flatMap((page) => roles(page.tree));
      for (const role of ["H1", "H2", "P", "L", "LI", "Lbl", "LBody", "Link"])
        expect(all, `${sample.name} ${role}`).toContain(role);
      // Every page of a multi-page report carries structure, so content that
      // continues onto the next page is reachable from the tree there.
      for (const [index, page] of inspected.pages.entries())
        expect(
          roles(page.tree).length,
          `${sample.name} page ${index + 1}`,
        ).toBeGreaterThan(0);
    }
  });
});
