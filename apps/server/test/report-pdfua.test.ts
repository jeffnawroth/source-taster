// SPDX-License-Identifier: AGPL-3.0-or-later
// The PDF/UA harness decides pass or fail from veraPDF's JSON alone, so its
// verdict logic is held by synthetic reports: it must fail closed.
import { describe, expect, it } from "vitest";
import { problems } from "../scripts/report-pdfua.ts";

type Report = Parameters<typeof problems>[0];
const identification = {
  clause: "5",
  testNumber: 1,
  description: "PDF/UA identification schema",
  failedChecks: 1,
};
const job = (name: string, over: Record<string, unknown> = {}) => ({
  itemDetails: { name: `/x/${name}` },
  validationResult: [
    {
      compliant: false,
      jobEndStatus: "normal",
      profileName: "PDF/UA-1 validation profile",
      details: {
        passedRules: 105,
        failedRules: 1,
        ruleSummaries: [identification],
      },
      ...over,
    },
  ],
});
const report = (jobs: unknown[], version = "1.30.3"): Report =>
  ({
    report: {
      buildInformation: { releaseDetails: [{ id: "core", version }] },
      jobs,
    },
  }) as Report;
const files = ["a.pdf", "b.pdf"];

describe("PDF/UA harness verdict", () => {
  it("fails when a sample declares PDF/UA identification without a decision", () => {
    const declared = job("a.pdf", {
      compliant: true,
      details: { passedRules: 106, failedRules: 0, ruleSummaries: [] },
    });
    expect(problems(report([declared, job("b.pdf")]), files)).toEqual([
      expect.stringContaining(
        "a.pdf: rule 5-1 (PDF/UA identification) did not fail",
      ),
    ]);
  });
  it("passes only when every file fails nothing but the undeclared identification", () => {
    expect(problems(report(files.map((f) => job(f))), files)).toEqual([]);
  });
  it("fails on a wrong veraPDF version", () => {
    expect(
      problems(
        report(
          files.map((f) => job(f)),
          "1.28.1",
        ),
        files,
      ),
    ).toEqual([expect.stringContaining("expected 1.30.3")]);
  });
  it("fails when a sample was not validated", () => {
    expect(problems(report([job("a.pdf")]), files)).toEqual(
      expect.arrayContaining(["b.pdf: not validated"]),
    );
  });
  it("fails on another profile or an abnormal job end", () => {
    const out = problems(
      report([
        job("a.pdf", { profileName: "PDF/A-1B validation profile" }),
        job("b.pdf", { jobEndStatus: "timeout" }),
      ]),
      files,
    );
    expect(out.join("\n")).toContain("PDF/A-1B");
    expect(out.join("\n")).toContain("job ended timeout");
  });
  it("reports each failed rule with its clause and test number", () => {
    const out = problems(
      report([
        job("a.pdf", {
          compliant: false,
          details: {
            passedRules: 104,
            failedRules: 2,
            ruleSummaries: [
              identification,
              {
                clause: "7.1",
                testNumber: 3,
                description: "untagged content",
                failedChecks: 2,
                checks: [{ context: "root/page[0]" }],
              },
            ],
          },
        }),
        job("b.pdf"),
      ]),
      files,
    );
    expect(out).toEqual([
      "a.pdf: rule 7.1-3 failed 2x: untagged content [root/page[0]]",
    ]);
  });
});
