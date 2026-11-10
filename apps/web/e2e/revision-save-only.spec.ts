// SPDX-License-Identifier: AGPL-3.0-or-later
import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";

for (const language of ["en", "de"] as const)
  test(`saving fields keeps earlier evidence historical until an explicit Re-check in ${language}`, async ({
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
    const list = page.getByRole("list", {
      name: language === "en" ? "References" : "Referenzen",
      exact: true,
    });
    await expect(list).toContainText(
      language === "en" ? "Correct" : "Korrekt",
      { timeout: 15000 },
    );
    await list.getByRole("button").click();
    const detail = page.getByRole("region", {
      name: language === "en" ? "Reference detail" : "Referenzdetails",
      exact: true,
    });
    const edit = detail.getByRole("button", {
      name: language === "en" ? "Edit fields" : "Felder bearbeiten",
      exact: true,
    });
    const title = detail.getByRole("textbox", {
      name: language === "en" ? "Title" : "Titel",
      exact: true,
    });
    const mutations: string[] = [];
    page.on("request", (request) => {
      if (
        request.method() === "POST" &&
        /\/(revisions|recheck)$/.test(request.url())
      )
        mutations.push(request.url());
    });
    await edit.click();
    await title.fill("Discard this draft");
    await detail
      .getByRole("button", {
        name: language === "en" ? "Discard draft" : "Entwurf verwerfen",
        exact: true,
      })
      .click();
    await edit.click();
    await expect(title).toHaveValue("Measured measurement");
    expect(mutations).toHaveLength(0);
    await title.fill("Measured measurment");
    await detail
      .getByRole("button", {
        name: language === "en" ? "Save fields only" : "Nur Felder speichern",
        exact: true,
      })
      .click();
    await expect(
      detail.getByText(
        language === "en" ? "Field revision 2" : "Feldrevision 2",
        { exact: true },
      ),
    ).toBeVisible();
    await expect(
      detail.getByText(language === "en" ? "Not checked" : "Nicht geprüft", {
        exact: true,
      }),
    ).toBeVisible();
    await expect(detail).toContainText(original);
    expect(mutations).toHaveLength(1);
    // The RTF download uses committed fields even before they have a new result.
    const downloaded = page.waitForEvent("download");
    await page
      .getByRole("button", {
        name:
          language === "en"
            ? "Download formatted bibliography (RTF)"
            : "Formatiertes Literaturverzeichnis herunterladen (RTF)",
        exact: true,
      })
      .click();
    expect(await readFile(await (await downloaded).path(), "utf8")).toContain(
      "Measured measurment",
    );
    await detail
      .getByText(
        language === "en"
          ? "Previous results (historical)"
          : "Frühere Ergebnisse (historisch)",
        { exact: true },
      )
      .click();
    const historical = detail.getByRole("region", {
      name: language === "en" ? "Historical result" : "Historisches Ergebnis",
      exact: true,
    });
    await expect(historical).toContainText(
      language === "en" ? "Correct" : "Korrekt",
    );
    await detail
      .getByRole("button", {
        name:
          language === "en"
            ? "Re-check this reference"
            : "Diese Referenz erneut prüfen",
        exact: true,
      })
      .click();
    await expect(
      detail.getByText(
        language === "en"
          ? "Exists, with deviations"
          : "Existiert, mit Abweichungen",
        { exact: true },
      ),
    ).toBeVisible({ timeout: 15000 });
    await expect(
      detail.getByText(
        language === "en" ? "Field revision 2" : "Feldrevision 2",
        { exact: true },
      ),
    ).toBeVisible();
    await expect(historical).toContainText(
      language === "en" ? "Correct" : "Korrekt",
    );
    expect(mutations.map((url) => url.split("/").at(-1))).toEqual([
      "revisions",
      "recheck",
    ]);
  });
