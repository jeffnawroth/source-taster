// SPDX-License-Identifier: AGPL-3.0-or-later
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";

// Only Chromium can grant clipboard permissions and read the clipboard back;
// Firefox and WebKit assert the visible outcome of the same copy gesture.
const readableClipboard = (browserName: string) => browserName === "chromium";

test("copies a Correction suggestion and applies it only to the formatted export", async ({
  page,
  context,
  browserName,
}) => {
  if (readableClipboard(browserName))
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/");
  await page
    .getByRole("combobox", { name: /^(Language|Sprache)$/u })
    .selectOption("en");
  await page
    .getByRole("textbox")
    .fill(
      "Aspelmeyer, M. (2008). Measured measurement. Nature Physics, 5, 11–12. https://doi.org/10.1038/nphys1170\nAspelmeyer, M. (2007). Measured measurement. Nature Physics, 5, 11–12. https://doi.org/10.1038/nphys1170",
    );
  await page
    .getByRole("button", { name: "Check reference", exact: true })
    .click();
  const suggestion = page.getByRole("region", {
    name: "Correction suggestion",
    exact: true,
  });
  await expect(suggestion.locator("ins").first()).toContainText("(2009).", {
    timeout: 15000,
  });
  await suggestion
    .getByRole("button", { name: "Copy suggestion", exact: true })
    .click();
  await expect(suggestion.getByRole("status")).toHaveText("Copied.");
  if (readableClipboard(browserName))
    expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(
      "Aspelmeyer, M. (2009).",
    );
  await suggestion
    .getByRole("checkbox", { name: "Apply for export only" })
    .check();
  await expect(suggestion.getByRole("checkbox")).toBeChecked();
  await page
    .getByRole("grid", { name: "References", exact: true })
    .getByRole("button")
    .nth(1)
    .click();
  await suggestion
    .getByRole("checkbox", { name: "Apply for export only" })
    .check();
  const exportPreview = page.getByRole("region", {
    name: "Formatted bibliography",
    exact: true,
  });
  await expect(exportPreview.getByRole("listitem")).toHaveCount(2);
  await expect(exportPreview).toContainText(
    "Reference 1: Aspelmeyer, M. (2009).",
  );
  await expect(exportPreview).toContainText(
    "Reference 2: Aspelmeyer, M. (2009).",
  );
  await expect(exportPreview).toContainText(
    "Format: RTF · Citation style: APA",
  );
  const downloadEvent = page.waitForEvent("download");
  await page
    .getByRole("button", {
      name: "Download formatted bibliography (RTF)",
      exact: true,
    })
    .click();
  const download = await downloadEvent;
  const content = await readFile(await download.path(), "utf8");
  expect(content).toContain("\\rtf1");
  expect(content).toContain("2009");
  expect(content).not.toContain("2008");
  await expect(page.getByRole("textbox")).toContainText("2008");
  await expect(
    page.getByRole("region", { name: "Reference detail", exact: true }),
  ).toContainText("Exists, with deviations");
});

for (const language of ["en", "de"] as const)
  test(`re-renders the chosen style without changing its locale or Verdict in ${language}`, async ({
    page,
    context,
    browserName,
  }) => {
    if (readableClipboard(browserName))
      await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("/");
    await page
      .getByRole("combobox", { name: /^(Language|Sprache)$/u })
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
    const suggestion = page.getByRole("region", {
      name: language === "en" ? "Correction suggestion" : "Korrekturvorschlag",
      exact: true,
    });
    await expect(suggestion.locator("ins").first()).toContainText("(2009).", {
      timeout: 15000,
    });
    await page
      .getByRole("combobox", {
        name:
          language === "en"
            ? "Preferred citation style"
            : "Bevorzugter Zitierstil",
        exact: true,
      })
      .selectOption("ieee");
    await expect(suggestion).toContainText("M. Aspelmeyer");
    await expect(suggestion).not.toContainText("[1]");
    const formatted = await suggestion.locator("p").first().textContent();
    await page
      .getByRole("combobox", { name: /^(Language|Sprache)$/u })
      .selectOption(language === "en" ? "de" : "en");
    await expect(
      page
        .getByRole("region", {
          name:
            language === "en" ? "Korrekturvorschlag" : "Correction suggestion",
          exact: true,
        })
        .locator("p")
        .first(),
    ).toHaveText(formatted!);
    await page
      .getByRole("button", {
        name:
          language === "en"
            ? "Formatiertes Literaturverzeichnis kopieren"
            : "Copy formatted bibliography",
        exact: true,
      })
      .click();
    await expect(
      page
        .getByRole("region", {
          name:
            language === "en"
              ? "Formatiertes Literaturverzeichnis"
              : "Formatted bibliography",
          exact: true,
        })
        .getByRole("status"),
    ).toHaveText(language === "en" ? "Kopiert." : "Copied.");
    if (readableClipboard(browserName)) {
      const html = await page.evaluate(async () => {
        const items = await navigator.clipboard.read();
        const value = items.find((item) => item.types.includes("text/html"));
        return value ? (await value.getType("text/html")).text() : "";
      });
      expect(html).toContain("Nature Physics");
      expect(html).toMatch(/<(?:i|em)\b/u);
    }
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
    await expect(
      page.getByRole("region", {
        name: language === "en" ? "Referenzdetails" : "Reference detail",
        exact: true,
      }),
    ).toContainText(language === "en" ? "Korrekt" : "Correct");
  });
