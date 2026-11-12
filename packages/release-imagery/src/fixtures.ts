// SPDX-License-Identifier: AGPL-3.0-or-later
// The controlled public capture fixtures. Every Reference below is invented:
// the DOIs use Crossref's 10.5555 test prefix, the author and journal names do
// not denote a real person or publication, and the Data-source answers are
// served by the capture pipeline's own loopback HTTP edge, never recorded from
// a live provider.
import { createHash } from "node:crypto";

export interface CaptureReference {
  id: "correct" | "deviating" | "conflict";
  /** The pasted Reference text exactly as the capture types it. */
  input: string;
  doi: string;
  /** The Crossref work the loopback edge serves; absent when no source answers the DOI. */
  work?: Record<string, unknown>;
  /** The Verdict the real verification program is expected to reach (en/de). */
  verdict: { en: string; de: string };
}

const journal = "Journal of Synthetic Examples";
const work = (year: number, title: string, doi: string) => ({
  DOI: doi,
  type: "journal-article",
  title: [title],
  author: [{ family: "Nordmark", given: "Elin K.", sequence: "first" }],
  "container-title": [journal],
  published: { "date-parts": [[year]] },
  volume: "12",
  issue: "3",
  page: "45-58",
});

export const captureReferences: readonly CaptureReference[] = [
  {
    id: "correct",
    doi: "10.5555/imagery-correct",
    input:
      "Nordmark, E. K. (2021). A controlled example of citation matching. Journal of Synthetic Examples, 12(3), 45–58. https://doi.org/10.5555/imagery-correct",
    work: work(
      2021,
      "A controlled example of citation matching",
      "10.5555/imagery-correct",
    ),
    verdict: { en: "Correct", de: "Korrekt" },
  },
  {
    id: "deviating",
    doi: "10.5555/imagery-deviating",
    input:
      "Nordmark, E. K. (2019). A worked example of field comparison. Journal of Synthetic Examples, 12(3), 45–58. https://doi.org/10.5555/imagery-deviating",
    work: work(
      2021,
      "A worked example of field comparison",
      "10.5555/imagery-deviating",
    ),
    verdict: {
      en: "Exists, with deviations",
      de: "Existiert, mit Abweichungen",
    },
  },
  {
    id: "conflict",
    doi: "10.5555/imagery-unmatched",
    input:
      "Nordmark, E. K. (2020). An example that no source can match. Journal of Synthetic Examples, 11(1), 1–9. https://doi.org/10.5555/imagery-unmatched",
    verdict: { en: "DOI conflict", de: "DOI-Konflikt" },
  },
];

/** The text a person pastes: one Reference per line. */
export const captureInput = captureReferences.map((r) => r.input).join("\n");

/** Hash of the complete fixture definition, recorded in every provenance. */
export const fixtureSha256 = createHash("sha256")
  .update(JSON.stringify(captureReferences))
  .digest("hex");
