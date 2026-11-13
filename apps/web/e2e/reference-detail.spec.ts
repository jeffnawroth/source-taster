// SPDX-License-Identifier: AGPL-3.0-or-later
// Real browser, real shared UI and real server with fixture sources. The
// structured suggestion comes from the server's proven candidate record.
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Locator, type Page } from "@playwright/test";
import { choosePreferences, newCheck } from "./support/workspace.ts";
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
    noSuggestion:
      "There is no correction suggestion with proven values for the current result. You can still edit the fields.",
    deleted: "Deleted",
    inserted: "Inserted",
    marker: "Unsaved draft",
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
    noSuggestion:
      "Für das aktuelle Ergebnis gibt es keinen Korrekturvorschlag mit belegten Werten. Sie können die Felder weiterhin bearbeiten.",
    deleted: "Gelöscht",
    inserted: "Eingefügt",
    marker: "Entwurf nicht gespeichert",
  },
} as const;

/** Starts a real Check and returns its API URL plus the grid and detail regions. */
async function start(page: Page, text: string, language: "en" | "de" = "en") {
  const t = copy[language];
  await page.goto("/");
  await choosePreferences(page, { language: t.language });
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
    // A replacement reads as deletion, then insertion.
    await expect(suggestion).toContainText(
      `${t.deleted}: (2008).${t.inserted}: (2009). Measured measurement.`,
    );
    await expect(detail).toContainText(t.debited);
    const apply = detail.getByRole("button", { name: t.apply, exact: true });
    await apply.click();
    const date = detail.getByRole("textbox", { name: t.date, exact: true });
    await expect(date).toHaveValue("2009-01");
    // Apply neither saves, re-checks nor debits anything.
    expect(requests).toEqual([]);
    await detail.getByRole("button", { name: t.discard, exact: true }).click();
    // Discard unmounts the pressed control; focus returns to its opener.
    const edit = detail.getByRole("button", { name: t.edit, exact: true });
    await expect(edit).toBeFocused();
    await edit.click();
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

test("narrow Back restores the filter and focus after opening a filtered Reference", async ({
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
  await correctFilter.click();
  await expect(grid.getByRole("row")).toHaveCount(1);
  await grid.getByRole("button").click();
  await expect(detail).toContainText(correct);
  await expect(grid).toBeHidden();
  await page
    .getByRole("button", { name: "Back to references", exact: true })
    .click();
  await expect(correctFilter).toHaveAttribute("aria-pressed", "true");
  await expect(grid.getByRole("row")).toHaveCount(1);
  await expect(grid.getByRole("row")).toBeFocused();
});

/**
 * Holds the response of the next suggestion rendering that includes the given
 * Reference until `release` is called; other renderings pass.
 */
async function holdNextBibliography(page: Page) {
  let release!: () => void;
  let arrived!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  const entered = new Promise<void>((resolve) => {
    arrived = resolve;
  });
  let holding: number | null = null;
  await page.route("**/bibliography", async (route) => {
    const response = await route.fetch();
    const body = route.request().postDataJSON() as {
      suggestionSlots: number[];
    };
    if (holding !== null && body.suggestionSlots.includes(holding)) {
      holding = null;
      arrived();
      await gate;
    }
    await route.fulfill({ response });
  });
  return {
    /** Arms the hold for the rendering of this Reference's suggestion. */
    arm: (slot: number) => {
      holding = slot;
    },
    entered,
    release,
  };
}

/**
 * Presses Back as a click finds it, with the held response released between
 * press and release, and asserts that Back did not move under the pointer.
 */
async function pressBackAcrossHeldResponse(
  page: Page,
  panel: Locator,
  release: () => void,
) {
  const back = page.getByRole("button", {
    name: "Back to references",
    exact: true,
  });
  // As a click lands when Back is already in view: the panel above shows
  // through the top of the viewport and Back sits low.
  await page.evaluate(() => {
    const top = [...document.querySelectorAll("button")]
      .find((b) => b.textContent?.trim() === "Back to references")!
      .getBoundingClientRect().top;
    scrollBy(0, top - (innerHeight - 220));
  });
  await expect(panel).toBeInViewport();
  const before = (await back.boundingBox())!;
  const centre = {
    x: before.x + before.width / 2,
    y: before.y + before.height / 2,
  };
  await page.mouse.move(centre.x, centre.y);
  await page.mouse.down();
  const delivered = page.waitForResponse((response) =>
    /\/bibliography$/u.test(response.url()),
  );
  release();
  await delivered;
  await page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      ),
  );
  const pressed = (await back.boundingBox())!;
  expect(
    Math.abs(pressed.y + pressed.height / 2 - centre.y),
    "Back did not move under the pointer",
  ).toBeLessThanOrEqual(1);
  await page.mouse.up();
}

// On a narrow viewport the bibliography panel sits above the detail. Opening a
// Reference renders its suggestion; with no correction selected the panel does
// not depend on that rendering, so it must not change height and move Back
// from under a press.
test("narrow Back stays under the pointer while the opened Reference's suggestion loads", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 780 });
  const hold = await holdNextBibliography(page);
  // A single Reference opens its detail on its own; three keep the list.
  const { grid, detail } = await start(
    page,
    `${correct}\n${unchecked}\n${deviating}`,
  );
  const summary = page.getByRole("region", { name: "Check summary" });
  for (const name of ["Correct: 1", "Exists, with deviations: 1"])
    await expect(
      summary.getByRole("button", { name, exact: true }),
    ).toBeVisible({ timeout: 15000 });
  const panel = page.getByRole("region", {
    name: "Formatted bibliography",
    exact: true,
  });
  await expect(panel).toContainText(
    "No corrections selected. The export uses the current fields.",
  );
  // Opening another Reference renders that Reference's suggestion.
  hold.arm(3);
  const open = grid.getByRole("button", { name: /^Open reference 3:/u });
  await open.click();
  await expect(detail).toContainText(deviating);
  await hold.entered;
  await pressBackAcrossHeldResponse(page, panel, hold.release);
  await expect(grid).toBeVisible();
  await expect(
    grid.getByRole("row").filter({
      has: page.getByRole("button", { name: /^Open reference 3:/u }),
    }),
  ).toBeFocused();
  await page.unrouteAll({ behavior: "ignoreErrors" });
});

// With a correction applied the export panels list it. Opening another
// Reference changes only the suggestion that is rendered, so neither panel may
// blank, show Formatting… or change height while that rendering is pending.
test("narrow Back stays under the pointer while another Reference's suggestion loads with a correction applied", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 780 });
  const hold = await holdNextBibliography(page);
  const { grid, detail } = await start(
    page,
    `${correct}\n${unchecked}\n${deviating}`,
  );
  const summary = page.getByRole("region", { name: "Check summary" });
  for (const name of ["Correct: 1", "Exists, with deviations: 1"])
    await expect(
      summary.getByRole("button", { name, exact: true }),
    ).toBeVisible({ timeout: 15000 });
  const panel = page.getByRole("region", {
    name: "Formatted bibliography",
    exact: true,
  });
  const exports = page.getByRole("region", {
    name: "Export references",
    exact: true,
  });
  await exports
    .getByRole("combobox", { name: "Export content", exact: true })
    .selectOption("selected-corrections");
  // Apply the deviating Reference's suggestion to the export.
  await grid.getByRole("button", { name: /^Open reference 3:/u }).click();
  await expect(detail).toContainText(deviating);
  await detail
    .getByRole("region", { name: "Correction suggestion", exact: true })
    .getByText("Apply for export only", { exact: true })
    .click();
  for (const region of [panel, exports])
    await expect(region.getByRole("listitem")).toHaveCount(1);
  await expect(panel.getByRole("button", { name: /^Copy/u })).toBeEnabled();
  await page
    .getByRole("button", { name: "Back to references", exact: true })
    .click();
  await expect(grid).toBeVisible();
  await expect(panel.getByRole("listitem")).toHaveCount(1);
  const heights = async () => [
    (await panel.boundingBox())!.height,
    (await exports.boundingBox())!.height,
  ];
  const settled = await heights();
  // Opening another Reference renders that Reference's suggestion.
  hold.arm(1);
  await grid.getByRole("button", { name: /^Open reference 1:/u }).click();
  await expect(detail).toContainText(correct);
  await hold.entered;
  // Soft, so a failure shows every panel that changed.
  for (const region of [exports, panel])
    await expect.soft(region.getByRole("listitem")).toHaveCount(1);
  await expect.soft(panel).not.toContainText("Formatting");
  await expect
    .soft(panel.getByRole("button", { name: /^Copy/u }))
    .toBeEnabled();
  await expect
    .soft(panel.getByRole("button", { name: /^Download/u }))
    .toBeEnabled();
  await expect
    .soft(exports.getByRole("button", { name: "Download references" }))
    .toBeEnabled();
  expect.soft(await heights(), "the panels kept their height").toEqual(settled);
  await pressBackAcrossHeldResponse(page, panel, hold.release);
  await expect(grid).toBeVisible();
  await expect(
    grid.getByRole("row").filter({
      has: page.getByRole("button", { name: /^Open reference 1:/u }),
    }),
  ).toBeFocused();
  await page.unrouteAll({ behavior: "ignoreErrors" });
});

test("an unsaved draft survives selecting another Reference, keyboard selection, a filter change and Escape", async ({
  page,
}) => {
  const { grid, detail } = await start(page, `${deviating}\n${correct}`);
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
  const rows = grid.getByRole("row");
  await rows.first().getByRole("button").click();
  await detail
    .getByRole("button", { name: "Apply to fields", exact: true })
    .click();
  const title = detail.getByRole("textbox", { name: "Title", exact: true });
  await title.fill("Unsaved across navigation");
  // Another feed row shows that Reference without the draft …
  await rows.nth(1).getByRole("button").click();
  await expect(detail).toContainText(correct);
  await expect(title).toHaveCount(0);
  // … and returning shows the same unsaved draft.
  await rows.first().getByRole("button").click();
  await expect(title).toHaveValue("Unsaved across navigation");
  // Keyboard selection follows focus in the feed.
  await rows.first().focus();
  await page.keyboard.press("ArrowDown");
  await expect(detail).toContainText(correct);
  await page.keyboard.press("ArrowUp");
  await expect(title).toHaveValue("Unsaved across navigation");
  // A filter that hides the Reference does not discard its draft.
  await correctFilter.click();
  await expect(rows).toHaveCount(1);
  await correctFilter.click();
  await expect(rows).toHaveCount(2);
  await rows.first().getByRole("button").click();
  await expect(title).toHaveValue("Unsaved across navigation");
  // Escape closes the detail; reopening restores the draft.
  await title.press("Escape");
  await expect(detail).toBeHidden();
  await rows.first().getByRole("button").click();
  await expect(title).toHaveValue("Unsaved across navigation");
  await expect(
    detail.getByRole("button", { name: "Save and re-check", exact: true }),
  ).toBeEnabled();
});

for (const language of ["en", "de"] as const)
  test(`a feed row with an unsaved draft says so in text and in its accessible name in ${language}`, async ({
    page,
  }) => {
    const t = copy[language];
    const { grid, detail } = await start(
      page,
      `${deviating}\n${correct}`,
      language,
    );
    await expect(grid.getByRole("row")).toHaveCount(2);
    await expect(grid).toContainText(t.correct, { timeout: 15000 });
    await expect(grid).toContainText(t.deviations, { timeout: 15000 });
    const rows = grid.getByRole("row");
    const first = rows.first();
    const second = rows.nth(1);
    await first.getByRole("button").click();
    // Opening the editor without changing anything is not an unsaved draft.
    await detail.getByRole("button", { name: t.edit, exact: true }).click();
    await expect(first).not.toContainText(t.marker);
    const title = detail.getByRole("textbox", {
      name: language === "en" ? "Title" : "Titel",
      exact: true,
    });
    await title.fill("Unsaved in the feed");
    // The marker is text, not colour, and part of the row's accessible name.
    await expect(first).toContainText(t.marker);
    await expect(first).toHaveAccessibleName(new RegExp(t.marker, "u"));
    await expect(second).not.toContainText(t.marker);
    // It stays while another Reference is open.
    await second.getByRole("button").click();
    await expect(first).toContainText(t.marker);
    // Discarding ends it.
    await first.getByRole("button").click();
    await detail.getByRole("button", { name: t.discard, exact: true }).click();
    await expect(first).not.toContainText(t.marker);
    await expect(first).not.toHaveAccessibleName(new RegExp(t.marker, "u"));
  });

test("a control scrolled into view from under the sticky verdict header ends up clear of it", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 520 });
  const t = copy.en;
  const { detail } = await openDeviating(page);
  await detail.getByRole("button", { name: t.apply, exact: true }).click();
  await expect(detail.locator(".detail-verdict-header")).toBeVisible();
  const covered = await page.evaluate(() => {
    const pane = document.querySelector<HTMLElement>(".check-detail")!;
    const head = document.querySelector<HTMLElement>(".detail-verdict-header")!;
    const controls = [
      ...pane.querySelectorAll<HTMLElement>(
        "button:not([disabled]), input:not([type=hidden]), textarea, summary",
      ),
    ].filter(
      (control) =>
        !head.contains(control) &&
        control.getBoundingClientRect().top >=
          head.getBoundingClientRect().top - 1,
    );
    const found: string[] = [];
    for (const control of controls) {
      // Park the control half under the stuck header, as a scrolled page does.
      const parked = control.getBoundingClientRect();
      pane.scrollTop +=
        parked.top - head.getBoundingClientRect().bottom + parked.height / 2;
      if (pane.scrollTop === 0) continue;
      // What a press-and-scroll-into-view does: the nearest edge.
      control.scrollIntoView({ block: "nearest" });
      const box = control.getBoundingClientRect();
      const overlap = head.getBoundingClientRect().bottom - box.top;
      if (overlap > 0)
        found.push(
          `${(control.getAttribute("aria-label") ?? control.textContent ?? control.tagName).trim().slice(0, 40)}: ${Math.round(overlap)}px`,
        );
    }
    return found;
  });
  expect(covered).toEqual([]);
});

test("an unbilled technical Status says no suggestion is available and offers no Apply to fields", async ({
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
    await expect(detail).toContainText(t.noSuggestion);
    await expect(
      detail.getByRole("button", { name: t.apply, exact: true }),
    ).toHaveCount(0);
  }
});

test("a running Reference names the running check instead of claiming no suggestion", async ({
  page,
}) => {
  const t = copy.en;
  const rendered = page.waitForResponse((response) =>
    /\/v2\/checks\/[^/]+\/bibliography$/u.test(response.url()),
  );
  const { grid, detail } = await start(page, held);
  await expect(grid).toContainText("Running", { timeout: 15000 });
  await grid.getByRole("button").click();
  // The suggestions have loaded; the slot still has no current result.
  expect((await rendered).ok()).toBe(true);
  await expect(
    detail.getByText(
      "Apply to fields is unavailable while a save, re-check or verdict change is running.",
      { exact: true },
    ),
  ).toBeVisible();
  await expect(detail.getByText(t.noSuggestion, { exact: true })).toHaveCount(
    0,
  );
});

test("a previously unbilled slot shows its first debit once the first Verdict arrives", async ({
  page,
}) => {
  const t = copy.en;
  const { grid, detail } = await start(page, unchecked);
  await expect(grid).toContainText("Not checked", { timeout: 15000 });
  await grid.getByRole("button").click();
  await expect(detail).toContainText(t.unbilled);
  await detail.getByRole("button", { name: t.edit, exact: true }).click();
  await detail
    .getByRole("textbox", { name: "DOI", exact: true })
    .fill("10.1038/nphys1170");
  await detail.getByRole("button", { name: t.save, exact: true }).click();
  await expect(grid).not.toContainText("Not checked", { timeout: 15000 });
  await expect(detail).toContainText(t.debited, { timeout: 15000 });
  await expect(detail).not.toContainText(t.unbilled);
});

test("once the committed fields carry the suggestion, Apply to fields is not offered as a no-op", async ({
  page,
}) => {
  const t = copy.en;
  const { detail } = await openDeviating(page);
  await detail.getByRole("button", { name: t.apply, exact: true }).click();
  await detail.getByRole("button", { name: t.save, exact: true }).click();
  await expect(detail.getByRole("heading", { level: 3 }).first()).toHaveText(
    t.correct,
    { timeout: 15000 },
  );
  const apply = detail.getByRole("button", { name: t.apply, exact: true });
  await expect(apply).toBeDisabled();
  await expect(detail).toContainText(
    "Apply to fields is unavailable because the suggestion has no proven values that differ from the committed fields.",
  );
  await expect(
    detail.getByRole("button", { name: t.edit, exact: true }),
  ).toBeEnabled();
});

test("an update that keeps the same result leaves an Apply draft current", async ({
  page,
}) => {
  const t = copy.en;
  const { detail } = await openDeviating(page);
  await detail.getByRole("button", { name: t.apply, exact: true }).click();
  const title = detail.getByRole("textbox", { name: "Title", exact: true });
  await title.fill("Draft through a manual verdict");
  await detail
    .getByRole("button", { name: "Confirm verdict", exact: true })
    .click();
  await expect(detail).toContainText("Manual verdict: Exists, with deviations");
  await expect(title).toHaveValue("Draft through a manual verdict");
  await expect(detail).not.toContainText("earlier revision or result");
  await expect(
    detail.getByRole("button", { name: t.save, exact: true }),
  ).toBeEnabled();
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
  await detail.getByText("Apply for export only", { exact: true }).click();
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
  holding = true;
  await choosePreferences(page, { citationStyle: "ieee" });
  await entered;
  await expect(
    detail.getByRole("button", { name: "Apply to fields", exact: true }),
  ).toHaveCount(0);
  await expect(detail).toContainText(
    "Apply to fields becomes available once the suggestion for the current result has loaded.",
  );
  holding = false;
  await choosePreferences(page, { citationStyle: "apa" });
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
  await newCheck(page);
  release();
  await expect(
    page.getByRole("textbox", { name: "Reference", exact: true }),
  ).toHaveValue("");
  await expect(detail).toHaveCount(0);
  await page.unrouteAll({ behavior: "ignoreErrors" });
});

test("on two panes a filter keeps the open detail only while its Reference still matches", async ({
  page,
}) => {
  const { grid, detail } = await start(page, `${correct}\n${deviating}`);
  const summary = page.getByRole("region", { name: "Check summary" });
  const deviations = summary.getByRole("button", {
    name: "Exists, with deviations: 1",
    exact: true,
  });
  await expect(deviations).toBeVisible({ timeout: 15000 });
  await grid.getByRole("row").first().getByRole("button").click();
  await expect(detail).toContainText(correct);
  await summary
    .getByRole("button", { name: "Correct: 1", exact: true })
    .click();
  await expect(detail).toBeVisible();
  await expect(detail).toContainText(correct);
  await deviations.click();
  await expect(detail).toBeHidden();
  await expect(grid.getByRole("row")).toHaveCount(1);
});
