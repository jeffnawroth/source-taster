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
    candidates: /^All candidates \(\d+\)$/,
    suggestionLoading:
      "Apply to fields becomes available once the suggestion for the current result has loaded.",
    correct: "Correct",
    exists: "Exists, with deviations",
    best: "Best match by score",
    library: "Import BibTeX or RIS",
  },
  de: {
    input: "Referenz",
    check: "Referenz prüfen",
    open: /^Referenz 1 öffnen:/,
    detail: "Referenzdetails",
    candidates: /^Alle Kandidaten \(\d+\)$/,
    suggestionLoading:
      "In Felder übernehmen wird verfügbar, sobald der Vorschlag für das aktuelle Ergebnis geladen ist.",
    correct: "Korrekt",
    exists: "Existiert, mit Abweichungen",
    best: "Bester Treffer nach Score",
    library: "BibTeX oder RIS importieren",
  },
} as const;

/** Runs a launcher command on the web page by its accessible name. */
export async function runCommandOnWeb(page: Page, name: string | RegExp) {
  const launcher = /^(Search or command|Suchen oder Befehl) …$/u;
  await page.getByRole("button", { name: launcher }).click();
  const palette = page.getByRole("dialog", { name: /^(Commands|Aktionen)$/u });
  await palette
    .getByRole("menuitem", {
      name,
      ...(typeof name === "string" ? { exact: true } : {}),
    })
    .click();
  await expect(palette).toBeHidden();
}

/**
 * Language and citation style on the web workspace, set in the Preferences
 * Dialog that the launcher opens (#194 D, ADR-0023).
 */
export async function choosePreferencesOnWeb(
  page: Page,
  choice: { language?: string; citationStyle?: string },
) {
  const launcher = /^(Search or command|Suchen oder Befehl) …$/u;
  await page.getByRole("button", { name: launcher }).click();
  await page
    .getByRole("dialog", { name: /^(Commands|Aktionen)$/u })
    .getByRole("menuitem", { name: /^(Preferences|Einstellungen)$/u })
    .click();
  const dialog = page.getByRole("dialog", {
    name: /^(Preferences|Einstellungen)$/u,
  });
  if (choice.language)
    await dialog
      .getByRole("combobox", { name: /^(Language|Sprache)$/u })
      .selectOption(choice.language);
  if (choice.citationStyle)
    await dialog
      .getByRole("combobox", {
        name: /^(Preferred citation style|Bevorzugter Zitierstil)$/u,
      })
      .selectOption(choice.citationStyle);
  await dialog.getByRole("button", { name: /^(Close|Schließen)$/u }).click();
  await expect(dialog).toBeHidden();
}

/**
 * Asserts the displayed Preferences: opens the Dialog, waits for each value,
 * and closes it again so the page behind is usable.
 */
export async function expectPreferencesOnWeb(
  page: Page,
  expected: { language?: string; citationStyle?: string },
) {
  await runCommandOnWeb(page, /^(Preferences|Einstellungen)$/u);
  const dialog = page.getByRole("dialog", {
    name: /^(Preferences|Einstellungen)$/u,
  });
  await expect(dialog).toBeVisible();
  if (expected.language)
    await expect(
      dialog.getByRole("combobox", { name: /^(Language|Sprache)$/u }),
    ).toHaveValue(expected.language);
  if (expected.citationStyle)
    await expect(
      dialog.getByRole("combobox", {
        name: /^(Preferred citation style|Bevorzugter Zitierstil)$/u,
      }),
    ).toHaveValue(expected.citationStyle);
  await dialog.getByRole("button", { name: /^(Close|Schließen)$/u }).click();
  await expect(dialog).toBeHidden();
}

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

/**
 * A Verdict label as a whole word: "Korrekt" must not match
 * "Korrekturvorschlag". The labels are plain words, commas and spaces.
 */
const hasLabel = (text: string, label: string) =>
  new RegExp(`(?<!\\p{L})${label}(?!\\p{L})`, "u").test(text);
// The detail is read once its Correction suggestion has settled, so both
// hosts are compared in the same state.
const detailReady = (language: Language, marker: string) => (text: string) =>
  text.includes(marker) &&
  !text.includes(labels[language].suggestionLoading) &&
  [labels[language].correct, labels[language].exists].some((v) =>
    hasLabel(text, v),
  );
/** The rendered detail and each evidenced Candidate block, read the same way on both hosts. */
const outcome = `(() => {
  const detail = document.getElementById("reference-detail");
  return {
    text: detail.innerText,
    candidates: [...detail.querySelectorAll("li.detail-cand")].map((c) => c.innerText),
  };
})()`;
/** Opens the Candidates toggle and every Disclosure in the detail, nested ones included. */
const openDisclosures = `(() => {
  for (const d of document.querySelectorAll("#reference-detail details")) d.open = true;
})()`;
export type Outcome = { text: string; candidates: string[] };
/** Two Checks differ only in server observation times; everything else must match. */
export function comparable(value: Outcome): Outcome {
  const stamp = (text: string) =>
    text
      .replaceAll(/\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d+)?Z/g, "<observed-at>")
      // The evidence trail shows each observation as a local time of day.
      .replaceAll(/\b\d{1,2}:\d\d:\d\d(?:\s?[AP]M)?/g, "<observed-at>");
  return { text: stamp(value.text), candidates: value.candidates.map(stamp) };
}

/** At panel width the detail pane opens from the Reference list, as a user would. */
export async function checkInPanel(
  panel: Panel,
  language: Language,
  witness: Witness,
): Promise<Outcome> {
  const l = labels[language];
  // Results replace the intake (#194 D): a later witness starts a new Check.
  if ((await panel.query("textbox", l.input)).length === 0)
    await panel.newCheck();
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
  // The Candidates toggle and every Disclosure start closed; read them open.
  await panel.evaluate(openDisclosures);
  return panel.evaluate<Outcome>(outcome);
}

export async function checkInWeb(
  page: Page,
  language: Language,
  witness: Witness,
): Promise<Outcome> {
  const l = labels[language];
  // Results replace the intake (#194 D): a later witness starts a new Check.
  if (!(await page.getByRole("textbox").isVisible()))
    await runCommandOnWeb(page, /^(New check|Neue Prüfung)$/u);
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
  await page.evaluate(openDisclosures);
  await expect(detail.locator("details:not([open])")).toHaveCount(0);
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
