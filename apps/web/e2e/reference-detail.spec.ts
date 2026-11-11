// SPDX-License-Identifier: AGPL-3.0-or-later
// Real browser, real shared UI and real server with fixture sources. The
// structured suggestion comes from the server's proven candidate record.
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { CheckResponse } from "@source-taster/contract-verification/v2";

const deviating =
  "Aspelmeyer, M. (2008). Measured measurement. Nature Physics, 5, 11–12. https://doi.org/10.1038/nphys1170";
const correct =
  "Aspelmeyer, M. (2009). Measured measurement. Nature Physics, 5, 11–12. https://doi.org/10.1038/nphys1170";
const unchecked = "Darwin, C. (1859). On the Origin of Species.";
const held = "Doe, J. (2020). Held Reference. doi:10.5555/browser-held";
const api = `http://127.0.0.1:${process.env.SOURCE_TASTER_E2E_API_PORT ?? "3102"}`;

const copy = {
  en: {
    language: "en",
    check: "Check reference",
    grid: "References",
    detail: "Reference detail",
    deviations: "Exists, with deviations",
    correct: "Correct",
    apply: "Apply to fields",
    date: "Publication date",
    publisher: "Publisher",
    discard: "Discard draft",
    edit: "Edit fields",
    keep: "Keep draft",
    replace: "Replace draft",
    save: "Save and re-check",
    debited:
      "Already debited reference slot: a re-check uses no additional quota.",
    unbilled:
      "Previously unbilled reference slot: the first verdict uses one check of quota. Technical statuses use no quota.",
    unavailable:
      "Apply to fields is unavailable until proven structured values for the current result are ready.",
    deleted: "Deleted",
    inserted: "Inserted",
  },
  de: {
    language: "de",
    check: "Referenz prüfen",
    grid: "Referenzen",
    detail: "Referenzdetails",
    deviations: "Existiert, mit Abweichungen",
    correct: "Korrekt",
    apply: "In Felder übernehmen",
    date: "Veröffentlichungsdatum",
    publisher: "Verlag",
    discard: "Entwurf verwerfen",
    edit: "Felder bearbeiten",
    keep: "Entwurf behalten",
    replace: "Entwurf ersetzen",
    save: "Speichern und erneut prüfen",
    debited:
      "Bereits abgerechneter Referenzplatz: Eine erneute Prüfung verbraucht kein weiteres Kontingent.",
    unbilled:
      "Bisher nicht abgerechneter Referenzplatz: Der erste Befund verbraucht eine Prüfung des Kontingents. Technische Status verbrauchen kein Kontingent.",
    unavailable:
      "In Felder übernehmen ist erst verfügbar, wenn belegte strukturierte Werte für das aktuelle Ergebnis vorliegen.",
    deleted: "Gelöscht",
    inserted: "Eingefügt",
  },
} as const;

/** Starts a real Check and returns its API URL plus the grid and detail regions. */
async function start(page: Page, text: string, language: "en" | "de" = "en") {
  const t = copy[language];
  await page.goto("/");
  await page
    .getByRole("combobox", { name: /^(Language|Sprache)$/u })
    .selectOption(t.language);
  const creation = page.waitForResponse(
    (response) =>
      /\/v2\/checks$/u.test(response.url()) &&
      response.request().method() === "POST",
  );
  await page.getByRole("textbox").fill(text);
  await page.getByRole("button", { name: t.check, exact: true }).click();
  const created = CheckResponse.parse(await (await creation).json()).data;
  const url = `${api}/v2/checks/${created.id}`;
  return {
    url,
    snapshot: async () =>
      CheckResponse.parse(await (await page.request.get(url)).json()).data,
    grid: page.getByRole("grid", { name: t.grid, exact: true }),
    detail: page.getByRole("region", { name: t.detail, exact: true }),
  };
}

/** Opens the single deviating Reference once its proven suggestion is ready. */
async function openDeviating(page: Page, language: "en" | "de" = "en") {
  const t = copy[language];
  const check = await start(page, deviating, language);
  await expect(check.grid).toContainText(t.deviations, { timeout: 15000 });
  await check.grid.getByRole("button").click();
  await expect(
    check.detail.getByRole("button", { name: t.apply, exact: true }),
  ).toBeEnabled();
  return check;
}

function nonGetRequests(page: Page) {
  const requests: string[] = [];
  page.on("request", (request) => {
    if (request.method() !== "GET")
      requests.push(new URL(request.url()).pathname);
  });
  return requests;
}

for (const language of ["en", "de"] as const)
  test(`Apply creates a local editable draft, Discard restores committed fields and explicit Save re-checks once in ${language}`, async ({
    page,
  }) => {
    const t = copy[language];
    await page.setViewportSize({ width: 320, height: 800 });
    const { detail } = await openDeviating(page, language);
    const requests = nonGetRequests(page);
    // Neutral tracked change against the immutable original, word by word.
    const suggestion = detail.locator(".tracked-change");
    await expect(suggestion.locator("del")).toHaveText([
      `${t.deleted}: (2008).`,
      `${t.deleted}: 5,`,
    ]);
    await expect(suggestion.locator("ins")).toHaveText([
      `${t.inserted}: (2009).`,
      `${t.inserted}: 5(1),`,
    ]);
    await expect(suggestion).toContainText("Measured measurement.");
    await expect(detail).toContainText(t.debited);
    const apply = detail.getByRole("button", { name: t.apply, exact: true });
    await apply.click();
    const date = detail.getByRole("textbox", { name: t.date, exact: true });
    await expect(date).toHaveValue("2009-01");
    // Apply neither saves, re-checks nor debits anything.
    expect(requests).toEqual([]);
    await detail.getByRole("button", { name: t.discard, exact: true }).click();
    await detail.getByRole("button", { name: t.edit, exact: true }).click();
    await expect(date).toHaveValue("2008");
    await date.fill("2006");
    await apply.click();
    const dialog = page.getByRole("alertdialog");
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", { name: t.keep, exact: true }).click();
    await expect(date).toHaveValue("2006");
    await apply.click();
    await dialog.getByRole("button", { name: t.replace, exact: true }).click();
    await expect(date).toHaveValue("2009-01");
    expect(requests).toEqual([]);
    await detail.getByRole("button", { name: t.save, exact: true }).click();
    await expect(detail.getByRole("heading", { level: 3 }).first()).toHaveText(
      t.correct,
      { timeout: 15000 },
    );
    expect(
      requests.filter((path) => /\/(revisions|recheck)$/u.test(path)),
    ).toHaveLength(1);
    await expect(detail).toContainText(deviating);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
  });

test("Apply overlays proven values and keeps committed fields the suggestion does not contain", async ({
  page,
}) => {
  const { detail, snapshot } = await openDeviating(page);
  await detail
    .getByRole("button", { name: "Edit fields", exact: true })
    .click();
  await detail
    .getByRole("textbox", { name: "Publisher", exact: true })
    .fill("Nature Publishing Group");
  await detail
    .getByRole("button", { name: "Save and re-check", exact: true })
    .click();
  const apply = detail.getByRole("button", {
    name: "Apply to fields",
    exact: true,
  });
  await expect(apply).toBeEnabled({ timeout: 15000 });
  await apply.click();
  await expect(
    detail.getByRole("textbox", { name: "Publication date", exact: true }),
  ).toHaveValue("2009-01");
  await expect(
    detail.getByRole("textbox", { name: "Publisher", exact: true }),
  ).toHaveValue("Nature Publishing Group");
  await detail
    .getByRole("button", { name: "Save fields only", exact: true })
    .click();
  await expect
    .poll(async () => (await snapshot()).references[0]!.revision)
    .toBe(3);
  const fields = (await snapshot()).references[0]!.fields;
  expect(fields.publisher).toBe("Nature Publishing Group");
  expect(fields.issued).toEqual({ literal: "2009-01" });
  expect(fields.issue).toBe("1");
  expect((await snapshot()).references[0]!.originalText).toBe(deviating);
});

test("detail leads with the effective Verdict in the documented section order and Escape restores feed focus", async ({
  page,
}) => {
  const { detail, grid } = await openDeviating(page);
  const order = [
    detail.getByRole("heading", { level: 3 }).first(),
    detail.getByRole("navigation", { name: "Reference navigation" }),
    detail.getByRole("heading", { name: "Original text", exact: true }),
    detail.getByRole("table", { name: "Reference and best match" }),
    detail.getByText("Explanation and source evidence", { exact: true }),
    detail.getByRole("region", { name: "Correction suggestion", exact: true }),
    detail.getByRole("button", { name: "Edit fields", exact: true }),
    detail.getByRole("region", { name: "Manual judgment", exact: true }),
  ];
  await expect(order[0]!).toHaveText("Exists, with deviations");
  // Document order (not layout) follows the detail anatomy.
  for (let index = 1; index < order.length; index++) {
    const before = await order[index - 1]!.elementHandle();
    const after = await order[index]!.elementHandle();
    expect(
      await page.evaluate(
        ([a, b]) =>
          !!(a!.compareDocumentPosition(b!) & Node.DOCUMENT_POSITION_FOLLOWING),
        [before, after],
      ),
    ).toBe(true);
  }
  await detail
    .getByRole("heading", { name: "Reference detail", exact: true })
    .focus();
  await page.keyboard.press("Escape");
  await expect(detail).toBeHidden();
  await expect(grid.getByRole("row")).toBeFocused();
});

test("Escape in the replacement dialog keeps the dirty draft and the open detail", async ({
  page,
}) => {
  const { detail } = await openDeviating(page);
  const apply = detail.getByRole("button", {
    name: "Apply to fields",
    exact: true,
  });
  await apply.click();
  const title = detail.getByRole("textbox", { name: "Title", exact: true });
  await title.fill("Unsaved title");
  await apply.click();
  await expect(page.getByRole("alertdialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("alertdialog")).toBeHidden();
  await expect(detail).toBeVisible();
  await expect(title).toHaveValue("Unsaved title");
  await expect(apply).toBeFocused();
});

test("the Pager stays within the filter and narrow Back restores filter and focus", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 780 });
  const { grid, detail } = await start(
    page,
    `${correct}\n${unchecked}\n${deviating}`,
  );
  const summary = page.getByRole("region", { name: "Check summary" });
  const correctFilter = summary.getByRole("button", {
    name: "Correct: 1",
    exact: true,
  });
  await expect(correctFilter).toBeVisible({ timeout: 15000 });
  await expect(
    summary.getByRole("button", {
      name: "Exists, with deviations: 1",
      exact: true,
    }),
  ).toBeVisible({ timeout: 15000 });
  await grid.getByRole("row").first().getByRole("button").click();
  const pager = detail.getByRole("navigation", {
    name: "Reference navigation",
  });
  await expect(pager).toContainText("1 of 3");
  await pager
    .getByRole("button", { name: "Next reference", exact: true })
    .click();
  await expect(pager).toContainText("2 of 3");
  await expect(detail).toContainText(unchecked);
  await page
    .getByRole("button", { name: "Back to references", exact: true })
    .click();
  await correctFilter.click();
  await expect(grid.getByRole("row")).toHaveCount(1);
  await grid.getByRole("button").click();
  await expect(pager).toContainText("1 of 1");
  await expect(
    pager.getByRole("button", { name: "Next reference", exact: true }),
  ).toBeDisabled();
  await expect(grid).toBeHidden();
  await page
    .getByRole("button", { name: "Back to references", exact: true })
    .click();
  await expect(correctFilter).toHaveAttribute("aria-pressed", "true");
  await expect(grid.getByRole("row")).toHaveCount(1);
  await expect(grid.getByRole("row")).toBeFocused();
});

test("an unbilled technical Status explains why Apply to fields is unavailable", async ({
  page,
}) => {
  for (const language of ["en", "de"] as const) {
    const t = copy[language];
    const { grid, detail } = await start(page, unchecked, language);
    await expect(grid).toContainText(
      language === "en" ? "Not checked" : "Nicht geprüft",
      { timeout: 15000 },
    );
    await grid.getByRole("button").click();
    await expect(detail).toContainText(t.unbilled);
    await expect(detail).toContainText(t.unavailable);
    await expect(
      detail.getByRole("button", { name: t.apply, exact: true }),
    ).toHaveCount(0);
  }
});

test("export and formatted bibliography use committed fields, never an Apply draft", async ({
  page,
}) => {
  const { detail } = await openDeviating(page);
  await detail
    .getByRole("button", { name: "Apply to fields", exact: true })
    .click();
  await detail
    .getByRole("textbox", { name: "Title", exact: true })
    .fill("UNSAVED APPLY DRAFT");
  const exports = page.getByRole("region", {
    name: "Export references",
    exact: true,
  });
  for (const [kind, extension] of [
    ["csl-json", "json"],
    ["bibtex", "bib"],
  ] as const) {
    await exports
      .getByRole("combobox", { name: "Export format", exact: true })
      .selectOption(kind);
    await exports
      .getByRole("combobox", { name: "Export content", exact: true })
      .selectOption("original");
    const download = page.waitForEvent("download");
    await exports
      .getByRole("button", { name: "Download references", exact: true })
      .click();
    const file = await download;
    expect(file.suggestedFilename()).toBe(
      `source-taster-references.${extension}`,
    );
    const content = await readFile(await file.path(), "utf8");
    expect(content).toContain("Measured measurement");
    expect(content).not.toContain("UNSAVED APPLY DRAFT");
    expect(content).not.toContain("2009");
  }
  const rtf = page.waitForEvent("download");
  await page
    .getByRole("button", {
      name: "Download formatted bibliography (RTF)",
      exact: true,
    })
    .click();
  const formatted = await readFile(await (await rtf).path(), "utf8");
  expect(formatted).toContain("Aspelmeyer, M. (2008). Measured measurement.");
  expect(formatted).not.toContain("UNSAVED APPLY DRAFT");
});

test("Save and re-check after Apply resets the current manual verdict and keeps it on the historical result", async ({
  page,
}) => {
  const { detail, snapshot } = await openDeviating(page);
  await detail
    .getByRole("button", { name: "Confirm verdict", exact: true })
    .click();
  await expect(detail).toContainText("Manual verdict: Exists, with deviations");
  await detail
    .getByRole("button", { name: "Apply to fields", exact: true })
    .click();
  await detail
    .getByRole("button", { name: "Save and re-check", exact: true })
    .click();
  await expect(detail.getByRole("heading", { level: 3 }).first()).toHaveText(
    "Correct",
    { timeout: 15000 },
  );
  await expect(detail).toContainText(
    "The manual verdict was reset by the re-check. The previous judgment remains with its historical result.",
  );
  const [reference] = (await snapshot()).references;
  expect(reference!.manualOverride).toBeNull();
  expect(reference!.results).toHaveLength(2);
  expect(reference!.results[1]!.manualOverride?.verdict).toBe(
    "exists-with-deviations",
  );
});

test("while a saved Apply draft re-checks, the earlier Verdict is not counted as current", async ({
  page,
}) => {
  const { detail } = await openDeviating(page);
  await detail
    .getByRole("button", { name: "Apply to fields", exact: true })
    .click();
  await detail
    .getByRole("textbox", { name: "DOI", exact: true })
    .fill("10.5555/browser-held");
  await detail
    .getByRole("button", { name: "Save and re-check", exact: true })
    .click();
  const summary = page.getByRole("region", { name: "Check summary" });
  await expect(
    summary.getByRole("button", {
      name: "Exists, with deviations: 0",
      exact: true,
    }),
  ).toBeVisible({ timeout: 15000 });
  await expect(
    summary.getByRole("button", { name: "Correct: 0", exact: true }),
  ).toBeVisible();
  await expect(detail.getByRole("heading", { level: 3 }).first()).toHaveText(
    "Running",
  );
  await expect(
    detail.getByRole("button", { name: "Apply to fields", exact: true }),
  ).toHaveCount(0);
});

test("Cancel with an open Apply draft keeps the draft local and unsaved", async ({
  page,
}) => {
  const { grid, detail, snapshot } = await start(page, `${deviating}\n${held}`);
  await expect(grid.getByRole("row").first()).toContainText(
    "Exists, with deviations",
    { timeout: 15000 },
  );
  await grid.getByRole("row").first().getByRole("button").click();
  await detail
    .getByRole("button", { name: "Apply to fields", exact: true })
    .click();
  const date = detail.getByRole("textbox", {
    name: "Publication date",
    exact: true,
  });
  await expect(date).toHaveValue("2009-01");
  await page.getByRole("button", { name: "Cancel check", exact: true }).click();
  await expect(page.getByText("Cancelled", { exact: true })).toBeVisible();
  await expect(date).toHaveValue("2009-01");
  const [reference] = (await snapshot()).references;
  expect(reference!.revision).toBe(1);
  expect(reference!.fields.issued).toEqual({ literal: "2008" });
});

test("a dirty Apply draft stays local when another client saves a newer revision; a 409 retains it", async ({
  page,
}) => {
  const { detail, url, snapshot } = await openDeviating(page);
  await detail
    .getByRole("button", { name: "Apply to fields", exact: true })
    .click();
  const title = detail.getByRole("textbox", { name: "Title", exact: true });
  await title.fill("Retain this unsaved draft");
  const before = await snapshot();
  const changed = await page.request.post(`${url}/references/1/revisions`, {
    data: {
      expectedRevision: 1,
      fields: {
        ...before.references[0]!.fields,
        title: "Concurrent committed title",
      },
      recheck: false,
    },
  });
  expect(changed.ok()).toBe(true);
  await detail
    .getByRole("button", { name: "Save and re-check", exact: true })
    .click();
  await expect(detail.getByRole("alert")).toContainText("changed");
  await expect(title).toHaveValue("Retain this unsaved draft");
  await expect(
    detail.getByRole("button", { name: "Save and re-check", exact: true }),
  ).toBeDisabled();
  await expect(detail).toContainText("earlier revision or result");
  const [current] = (await snapshot()).references;
  expect(current!.revision).toBe(2);
  expect(current!.fields.title).toBe("Concurrent committed title");
  expect(current!.originalText).toBe(deviating);
});

test("same-revision Re-check invalidates the draft and export choice even when the fields repeat", async ({
  page,
}) => {
  const { detail, url, snapshot } = await openDeviating(page);
  const before = await snapshot();
  await detail
    .getByRole("checkbox", { name: "Apply for export only", exact: true })
    .check();
  await detail
    .getByRole("button", { name: "Apply to fields", exact: true })
    .click();
  const title = detail.getByRole("textbox", { name: "Title", exact: true });
  await title.fill("Keep until deliberate replacement");
  expect(
    (
      await page.request.post(`${url}/references/1/recheck`, {
        data: { expectedRevision: 1 },
      })
    ).ok(),
  ).toBe(true);
  await expect
    .poll(async () => (await snapshot()).references[0]!.results.length)
    .toBe(2);
  const after = await snapshot();
  expect(after.references[0]!.fields).toEqual(before.references[0]!.fields);
  expect(after.references[0]!.results[0]!.id).not.toBe(
    before.references[0]!.results[0]!.id,
  );
  // A stale manual operation refreshes the actual current snapshot on 409.
  await detail
    .getByRole("button", { name: "Confirm verdict", exact: true })
    .click();
  await expect(
    detail.getByRole("button", { name: "Save and re-check", exact: true }),
  ).toBeDisabled();
  await expect(title).toHaveValue("Keep until deliberate replacement");
  await expect(detail).toContainText("earlier revision or result");
  // The earlier export choice is bound to the replaced result and is dropped.
  await expect(
    page.getByRole("region", { name: "Formatted bibliography", exact: true }),
  ).toContainText("No corrections selected.");
  // Without a current proven suggestion only Discard leaves the stale draft.
  await detail
    .getByRole("button", { name: "Discard draft", exact: true })
    .click();
  await detail
    .getByRole("button", { name: "Edit fields", exact: true })
    .click();
  await expect(title).toHaveValue("Measured measurement");
  await expect(
    detail.getByRole("button", { name: "Save and re-check", exact: true }),
  ).toBeEnabled();
});

test("late suggestion responses cannot attach to a newer citation style", async ({
  page,
}) => {
  let release!: () => void;
  let arrived!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  const entered = new Promise<void>((resolve) => {
    arrived = resolve;
  });
  let holding = false;
  await page.route("**/bibliography", async (route) => {
    const response = await route.fetch();
    if (holding) {
      arrived();
      await gate;
    }
    await route.fulfill({ response });
  });
  const { detail } = await openDeviating(page);
  const style = page.getByRole("combobox", {
    name: "Preferred citation style",
    exact: true,
  });
  holding = true;
  await style.selectOption("ieee");
  await entered;
  await expect(
    detail.getByRole("button", { name: "Apply to fields", exact: true }),
  ).toHaveCount(0);
  await expect(detail).toContainText(
    "Apply to fields becomes available once the suggestion for the current result has loaded.",
  );
  holding = false;
  await style.selectOption("apa");
  await expect(
    detail.getByRole("button", { name: "Apply to fields", exact: true }),
  ).toBeEnabled();
  release();
  await expect(
    detail.getByRole("region", { name: "Correction suggestion", exact: true }),
  ).toContainText("(2009).");
  await detail
    .getByRole("button", { name: "Apply to fields", exact: true })
    .click();
  await expect(
    detail.getByRole("textbox", { name: "Publication date", exact: true }),
  ).toHaveValue("2009-01");
  await page.unrouteAll({ behavior: "ignoreErrors" });
});

test("pending Save sends once, failures retain the draft and a late reply cannot revive Reset", async ({
  page,
}) => {
  const { detail } = await openDeviating(page);
  await detail
    .getByRole("button", { name: "Apply to fields", exact: true })
    .click();
  const title = detail.getByRole("textbox", { name: "Title", exact: true });
  await title.fill("Retained after network failure");
  await page.route(
    "**/references/1/revisions",
    (route) => route.abort("failed"),
    {
      times: 1,
    },
  );
  await detail
    .getByRole("button", { name: "Save fields only", exact: true })
    .click();
  await expect(detail.getByRole("alert")).toBeVisible();
  await expect(title).toHaveValue("Retained after network failure");
  let release!: () => void;
  let arrived!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  const entered = new Promise<void>((resolve) => {
    arrived = resolve;
  });
  let count = 0;
  await page.route("**/references/1/revisions", async (route) => {
    count++;
    const response = await route.fetch();
    arrived();
    await gate;
    await route.fulfill({ response });
  });
  await detail
    .getByRole("button", { name: "Save and re-check", exact: true })
    .click();
  await entered;
  await expect(
    detail.getByRole("button", { name: "Save and re-check", exact: true }),
  ).toBeDisabled();
  await expect(
    detail.getByRole("button", { name: "Save fields only", exact: true }),
  ).toBeDisabled();
  expect(count).toBe(1);
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  release();
  await expect(
    page.getByRole("textbox", { name: "Reference", exact: true }),
  ).toHaveValue("");
  await expect(detail).toHaveCount(0);
  await page.unrouteAll({ behavior: "ignoreErrors" });
});
