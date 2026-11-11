// SPDX-License-Identifier: AGPL-3.0-or-later
import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
for (const language of ["en", "de"] as const) {
  test(`field drafts, slot-only Re-check and historical evidence remain distinct in ${language}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 360, height: 720 });
    await page.goto("/");
    await page
      .getByRole("combobox", { name: /^(Language|Sprache)$/ })
      .selectOption(language);
    const original =
      "Aspelmeyer, M. (2009). Measured measurement. Nature Physics, 5, 11–12. https://doi.org/10.1038/nphys1170";
    await page.getByRole("textbox").fill(original);
    await page
      .getByRole("button", {
        name: language === "en" ? "Check reference" : "Referenz prüfen",
        exact: true,
      })
      .click();
    const list = page.getByRole("grid", {
      name: language === "en" ? "References" : "Referenzen",
      exact: true,
    });
    await expect(list).toContainText(
      language === "en" ? "Correct" : "Korrekt",
      { timeout: 15000 },
    );
    await list.getByRole("button").click();
    await page
      .getByRole("button", {
        name: language === "en" ? "Edit fields" : "Felder bearbeiten",
        exact: true,
      })
      .click();
    const title = page.getByRole("textbox", {
      name: language === "en" ? "Title" : "Titel",
      exact: true,
    });
    await title.fill("Measured measurment");
    const mutations: string[] = [];
    page.on("request", (req) => {
      if (req.url().includes("/revisions")) mutations.push(req.url());
    });
    await expect(title).toHaveValue("Measured measurment");
    expect(mutations).toEqual([]);
    await page
      .getByRole("button", {
        name:
          language === "en"
            ? "Save and re-check"
            : "Speichern und erneut prüfen",
        exact: true,
      })
      .click();
    await expect(
      page.getByText(
        language === "en" ? "Field revision 2" : "Feldrevision 2",
        { exact: true },
      ),
    ).toBeVisible();
    const detail = page.getByRole("region", {
      name: language === "en" ? "Reference detail" : "Referenzdetails",
      exact: true,
    });
    await expect(detail).toContainText(
      language === "en"
        ? "Already debited reference slot: a re-check uses no additional quota."
        : "Bereits abgerechneter Referenzplatz: Eine erneute Prüfung verbraucht kein weiteres Kontingent.",
    );
    await expect(detail).toContainText(original);
    await expect(detail).toContainText(
      language === "en"
        ? "Previous results (historical)"
        : "Frühere Ergebnisse (historisch)",
    );
    await expect(
      detail.getByText(
        language === "en"
          ? "Exists, with deviations"
          : "Existiert, mit Abweichungen",
        { exact: true },
      ),
    ).toBeVisible({ timeout: 15000 });
    await page
      .getByText(
        language === "en"
          ? "Previous results (historical)"
          : "Frühere Ergebnisse (historisch)",
        { exact: true },
      )
      .click();
    await expect(detail).toContainText(
      language === "en" ? "Field revision 1" : "Feldrevision 1",
    );
    expect(mutations).toHaveLength(1);
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });
}
for (const language of ["en", "de"] as const)
  test(`Reference list changes are previewed as new work before applying in ${language}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 360, height: 720 });
    await page.goto("/");
    await page
      .getByRole("combobox", { name: /^(Language|Sprache)$/ })
      .selectOption(language);
    await page
      .getByRole("textbox")
      .fill(
        "Aspelmeyer, M. (2009). Measured measurement. Nature Physics, 5, 11–12. https://doi.org/10.1038/nphys1170",
      );
    await page
      .getByRole("button", {
        name: language === "en" ? "Check reference" : "Referenz prüfen",
        exact: true,
      })
      .click();
    const edit = page.getByRole("button", {
      name:
        language === "en" ? "Edit reference list" : "Referenzliste bearbeiten",
      exact: true,
    });
    await expect(edit).toBeEnabled({ timeout: 15000 });
    await edit.click();
    await page
      .getByRole("checkbox", { name: /1\. Measured measurement/ })
      .check();
    await page
      .getByRole("textbox", {
        name:
          language === "en"
            ? "Original input for the new reference"
            : "Originaleingabe für die neue Referenz",
        exact: true,
      })
      .fill("A Reference added by hand");
    await page
      .getByRole("textbox", {
        name: language === "en" ? "Title" : "Titel",
        exact: true,
      })
      .fill("Added title");
    await page
      .getByRole("textbox", { name: "DOI", exact: true })
      .fill("10.1038/nphys1170");
    const changes: string[] = [];
    page.on("request", (req) => {
      if (req.method() === "POST" && req.url().endsWith("/references"))
        changes.push(req.url());
    });
    await page
      .getByRole("button", {
        name:
          language === "en"
            ? "Preview list changes"
            : "Listenänderungen vorschauen",
        exact: true,
      })
      .click();
    const preview = page.getByRole("region", {
      name:
        language === "en"
          ? "Preview list changes"
          : "Listenänderungen vorschauen",
      exact: true,
    });
    await expect(preview).toContainText(
      language === "en"
        ? "Add 1, remove 1. Resulting references: 1. Additional quota on first verdicts: 1."
        : "Hinzufügen: 1, entfernen: 1. Verbleibende Referenzen: 1. Zusätzliches Kontingent bei ersten Befunden: 1.",
    );
    expect(changes).toEqual([]);
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
    await page
      .getByRole("button", {
        name:
          language === "en"
            ? "Apply list changes"
            : "Listenänderungen anwenden",
        exact: true,
      })
      .click();
    const list = page.getByRole("grid", {
      name: language === "en" ? "References" : "Referenzen",
      exact: true,
    });
    await expect(list.getByRole("row")).toHaveCount(1);
    await expect(list.getByRole("button")).toHaveText(
      language === "en"
        ? "Open reference 2: Added title"
        : "Referenz 2 öffnen: Added title",
    );
    expect(changes).toHaveLength(1);
  });
