// SPDX-License-Identifier: AGPL-3.0-or-later
// Drives one Check through the shared workspace in the native panel or on web.
import { readFile } from "node:fs/promises";
import { expect, type Page } from "@playwright/test";
import { until, type Panel } from "./chromium.ts";

export type Language = "en" | "de";
export const labels = {
  en: {
    input: "Reference",
    check: "Check reference",
    open: /^Open reference 1:/,
    detail: "Reference detail",
    evidence: "Explanation and source evidence",
    correct: "Correct",
    exists: "Exists, with deviations",
    best: "Best match by Score",
    library: "Import BibTeX or RIS",
  },
  de: {
    input: "Referenz",
    check: "Referenz prüfen",
    open: /^Referenz 1 öffnen:/,
    detail: "Referenzdetails",
    evidence: "Erklärung und Quellenbelege",
    correct: "Korrekt",
    exists: "Existiert, mit Abweichungen",
    best: "Bester Treffer nach Score",
    library: "BibTeX oder RIS importieren",
  },
} as const;

export interface Witness {
  name: string;
  text: string;
  /** Text identifying this Check's own outcome, so a prior result never counts. */
  marker: string;
  verdict: "correct" | "exists";
  scores: string[];
  bestMatch?: string;
}
const cases = JSON.parse(
  await readFile(
    new URL(
      "../../../server/test/fixtures/comparison/ten-cases.json",
      import.meta.url,
    ),
    "utf8",
  ),
) as {
  id: number;
  doi: string;
  value: number;
  scoreDisplay: string;
  text: string;
}[];
/** Synthetic development witnesses, independent of either client's code.
 * Not the frozen 50-Reference release parity set. */
export const witnesses: Witness[] = [
  ...cases.map((c) => ({
    name: `comparison case ${c.id}`,
    text: c.text,
    marker: c.doi,
    verdict: c.value === 100000000 ? ("correct" as const) : ("exists" as const),
    scores: [c.scoreDisplay],
  })),
  {
    name: "ranked Candidates",
    text: "WorkspaceRanked, R. (2021). Workspace ranked article. Journal of Testing, 1, 1–2.",
    marker: "https://openalex.org/W82013",
    verdict: "correct",
    scores: ["100.00 %", "64.29 %", "21.43 %"],
    bestMatch: "https://openalex.org/W82013",
  },
  {
    name: "tied Candidates",
    text: "WorkspaceTie, A. (2021). Workspace tied article. Journal of Testing, 1, 1–2.",
    marker: "https://openalex.org/W82002",
    verdict: "correct",
    scores: ["100.00 %", "100.00 %"],
    bestMatch: "https://openalex.org/W82002",
  },
];

const detailReady = (language: Language, marker: string) => (text: string) =>
  text.includes(marker) &&
  [labels[language].correct, labels[language].exists].some((v) =>
    text.includes(v),
  );
/** The rendered detail and each evidenced Candidate block, read the same way on both hosts. */
const outcome = `(() => {
  const detail = document.getElementById("reference-detail");
  return {
    text: detail.innerText,
    candidates: [...detail.querySelectorAll("details h3")].map((h) => h.parentElement.innerText),
  };
})()`;
export type Outcome = { text: string; candidates: string[] };
/** Two Checks differ only in server observation times; everything else must match. */
export function comparable(value: Outcome): Outcome {
  const stamp = (text: string) =>
    text.replaceAll(
      /\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d+)?Z/g,
      "<observed-at>",
    );
  return { text: stamp(value.text), candidates: value.candidates.map(stamp) };
}

/** At panel width the detail pane opens from the Reference list, as a user would. */
export async function checkInPanel(
  panel: Panel,
  language: Language,
  witness: Witness,
): Promise<Outcome> {
  const l = labels[language];
  await panel.fill("textbox", l.input, witness.text);
  await panel.click("button", l.check);
  const ready = detailReady(language, witness.marker);
  await until(
    async () => {
      const [detail] = await panel.query("region", l.detail);
      if (detail !== undefined) {
        const text = await panel.call<string>(
          detail,
          "function () { return this.innerText; }",
        );
        if (ready(text)) return true;
      }
      const [open] = await panel.query("button", l.open);
      if (open !== undefined) await panel.clickNode(open);
      return false;
    },
    `${witness.name} never showed its outcome in the side panel`,
    20_000,
  );
  // Field revisions are also a disclosure; open the evidence one by its label.
  const evidence = `[...document.querySelectorAll("#reference-detail details > summary")].find((s) => s.textContent.includes(${JSON.stringify(l.evidence)}))`;
  const summary = await panel
    .locate(
      `(${evidence})?.parentElement.open ? undefined : ${evidence}`,
      1_000,
    )
    .catch(() => undefined);
  if (summary) await panel.clickNode(summary);
  await panel.locate(
    `${evidence}?.parentElement.open ? ${evidence} : undefined`,
  );
  return panel.evaluate<Outcome>(outcome);
}

export async function checkInWeb(
  page: Page,
  language: Language,
  witness: Witness,
): Promise<Outcome> {
  const l = labels[language];
  await page.getByRole("textbox").fill(witness.text);
  await page.getByRole("button", { name: l.check, exact: true }).click();
  const detail = page.getByRole("region", { name: l.detail, exact: true });
  const ready = detailReady(language, witness.marker);
  await expect
    .poll(
      async () => {
        if ((await detail.isVisible()) && ready(await detail.innerText()))
          return true;
        const open = page.getByRole("button", { name: l.open });
        if (await open.isVisible()) await open.click();
        return false;
      },
      { timeout: 20_000, intervals: [100] },
    )
    .toBe(true);
  const details = detail
    .locator("details")
    .filter({ has: page.locator("summary", { hasText: l.evidence }) });
  if (!(await details.evaluate((d: HTMLDetailsElement) => d.open)))
    await details.locator("summary").click();
  await expect(details).toHaveAttribute("open", "");
  return page.evaluate<Outcome>(outcome);
}

/** Expected values come from fixtures and specifications, not from either client. */
export function expectWitness(
  outcome: Outcome,
  language: Language,
  witness: Witness,
) {
  const l = labels[language];
  expect(outcome.text).toContain(l[witness.verdict]);
  for (const score of witness.scores) expect(outcome.text).toContain(score);
  if (witness.bestMatch) {
    // Server Candidate order and Scores are kept; exactly the server-selected
    // Best match carries the label.
    expect(outcome.candidates).toHaveLength(witness.scores.length);
    witness.scores.forEach((score, index) =>
      expect(outcome.candidates[index]).toContain(score),
    );
    const labelled = outcome.candidates.filter((c) => c.includes(l.best));
    expect(labelled).toHaveLength(1);
    expect(labelled[0]).toContain(witness.bestMatch);
  }
}
