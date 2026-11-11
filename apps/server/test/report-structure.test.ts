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
import { generateReport } from "../src/reports/generate.ts";
import { finalSample } from "./support/report-samples.ts";

let samples: Sample[];
beforeAll(async () => {
  samples = await generateSamples();
}, 60_000);

describe("report PDF structure", () => {
  it("reports the checked revision and exact result separately from immutable input, with per-result rule versions", async () => {
    for (const language of ["de", "en"] as const) {
      const check = finalSample();
      const reference = check.references[0]!;
      if (reference.outcome.kind !== "verdict")
        throw new Error("expected Verdict");
      reference.originalText = "Immutable original input";
      reference.fields = { title: "Not the checked evidence" };
      reference.revision = 2;
      reference.outcome.reference.csl = {
        title: "Committed checked title",
        DOI: "10.1038/nphys1170",
        page: "11-12",
      };
      reference.revisions = [
        {
          revision: 2,
          reference: reference.outcome.reference,
          provenance: "user",
          createdAt: "2026-11-05T07:30:00.000Z",
        },
      ];
      reference.results = [
        {
          id: "00000000-0000-4000-8000-000000000042",
          revision: 2,
          generation: 1,
          createdAt: "2026-11-05T08:00:00.000Z",
          outcome: reference.outcome,
          manualOverride: null,
        },
      ];
      const second = check.references[1]!;
      if (second.outcome.kind !== "verdict")
        throw new Error("expected Verdict");
      second.outcome.scoringRules = {
        ...second.outcome.scoringRules,
        version: "different-rules-2",
      };
      const pdf = await generateReport({
        check,
        language,
        style: "apa",
        capturedAt: "2026-11-05T08:01:00.000Z",
      });
      const { text } = await inspectPdf(pdf);
      expect(text).toContain("Immutable original input");
      expect(text).toContain("Committed checked title");
      expect(text).not.toContain("Not the checked evidence");
      expect(text.replace(/\s/gu, "")).toContain(
        "00000000-0000-4000-8000-000000000042",
      );
      expect(text).toContain(
        language === "de" ? "Feldrevision: 2" : "Field revision: 2",
      );
      expect(text).toContain(
        language === "de"
          ? "Herkunft: Manuell bearbeitet"
          : "Origin: Edited by user",
      );
      const sections = text.split(
        language === "de" ? /Referenz \d/gu : /Reference \d/gu,
      );
      expect(sections[1]).toContain("scoring-rules-2026.1+sample");
      expect(sections[1]).not.toContain("different-rules-2");
      expect(sections[2]).toContain("different-rules-2");
    }
  });
  it("embeds the local text and metadata families and aligns record values in a stable second column", async () => {
    const sample = samples.find((s) => s.name === "report-final-en")!;
    const raw = Buffer.from(sample.pdf).toString("latin1");
    expect(raw).toContain("AtkinsonHyperlegibleNext-Regular");
    expect(raw).toContain("AtkinsonHyperlegibleNext-Bold");
    expect(raw).toContain("AtkinsonHyperlegibleNext-Italic");
    expect(raw).toContain("IBMPlexMono");
    const pdf = await inspectPdf(sample.pdf);
    const items = pdf.pages.flatMap((p) => p.items).filter((i) => "str" in i);
    const original = items.find(
      (i) => "str" in i && i.str.startsWith("Aspelmeyer"),
    )!;
    const verdict = items.find((i) => "str" in i && i.str === "Verdict:")!;
    expect("transform" in original && original.transform[4]).toBeGreaterThan(
      190,
    );
    expect("transform" in verdict && verdict.transform[4]).toBe(56);
  });
  it("uses a mapped Noto fallback run without changing bibliographic Unicode and refuses impossible output", async () => {
    const check = finalSample();
    check.references[0]!.originalText =
      "Latin, Ελληνικά, Кириллица, ə, ǂ, ᵹ (2020).";
    const input = {
      check,
      language: "en" as const,
      style: "apa" as const,
      capturedAt: "2026-11-05T08:00:00.000Z",
    };
    const bytes = await generateReport(input);
    expect((await inspectPdf(bytes)).text).toContain(
      check.references[0]!.originalText,
    );
    expect(Buffer.from(bytes).toString("latin1")).toContain("NotoSans");
    check.references[0]!.originalText = "東京";
    await expect(generateReport(input)).rejects.toMatchObject({
      failure: "unsupported-character",
    });
  });
  it("names all six Verdict counts, including zero, before a separate Status count group", async () => {
    for (const language of ["en", "de"] as const) {
      const sample = samples.find(
        (s) => s.name === `report-final-${language}`,
      )!;
      const { text } = await inspectPdf(sample.pdf);
      const overview = text.slice(
        text.indexOf(language === "de" ? "Überblick" : "Overview"),
        text.indexOf(language === "de" ? "Referenz 1" : "Reference 1"),
      );
      const labels =
        language === "de"
          ? [
              "Korrekt: 2",
              "Existiert, mit Abweichungen: 0",
              "Gemischte Referenz: 0",
              "DOI-Konflikt: 0",
              "Nicht gefunden: 1",
              "Nicht verifizierbar: 0",
              "Statusanzahlen",
              "Abgebrochen: 1",
              "Technischer Fehler: 1",
            ]
          : [
              "Correct: 2",
              "Exists, with deviations: 0",
              "Mixed citation: 0",
              "DOI conflict: 0",
              "Not found: 1",
              "Not verifiable: 0",
              "Status counts",
              "Cancelled: 1",
              "Technical error: 1",
            ];
      for (const label of labels) expect(overview).toContain(label);
      const positions = labels.map((label) => overview.indexOf(label));
      expect(positions).toEqual([...positions].sort((a, b) => a - b));
    }
  });
  it("explains human responsibility beside the summary and keeps technical statuses distinct from verdicts", async () => {
    for (const language of ["en", "de"] as const) {
      const final = samples.find((s) => s.name === `report-final-${language}`)!;
      const { text } = await inspectPdf(final.pdf);
      expect(text).toContain(
        language === "de"
          ? "Ein Befund ist kein Beweis für Täuschung. Die Entscheidung trifft ein Mensch."
          : "A verdict is not proof of deception. A human makes the decision.",
      );
      expect(text).toContain(
        language === "de"
          ? "Manueller Befund: Korrekt"
          : "Manual verdict: Correct",
      );
      expect(text).toContain(
        language === "de"
          ? "Ursprünglicher Systembefund: Existiert, mit Abweichungen"
          : "Original system verdict: Exists, with deviations",
      );
      expect(text).toContain(
        language === "de"
          ? "Status: Technischer Fehler"
          : "Status: Technical error",
      );
      expect(text).not.toContain(
        language === "de"
          ? "Befund: Technischer Fehler"
          : "Verdict: Technical error",
      );
    }
  });
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
