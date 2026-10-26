// SPDX-License-Identifier: AGPL-3.0-or-later
import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("Guest language and citation style persist independently without losing input", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("combobox", { name: "Language", exact: true })
    .selectOption("en");
  const style = page.getByRole("combobox", {
    name: "Preferred citation style",
    exact: true,
  });
  await expect(style).toHaveValue("apa");
  await expect(style.getByRole("option")).toHaveCount(11);
  await style.selectOption("ieee");
  await page.getByRole("textbox").fill("My unfinished bibliography");
  await page
    .getByRole("combobox", { name: "Language", exact: true })
    .selectOption("de");
  await expect(page.locator("html")).toHaveAttribute("lang", "de");
  await expect(page.getByRole("textbox")).toHaveValue(
    "My unfinished bibliography",
  );
  await expect(
    page.getByRole("combobox", { name: "Bevorzugter Zitierstil", exact: true }),
  ).toHaveValue("ieee");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "de");
  await expect(
    page.getByRole("combobox", { name: "Bevorzugter Zitierstil", exact: true }),
  ).toHaveValue("ieee");
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
});

for (const { languages, expected } of [
  { languages: ["de-DE", "en-GB"], expected: "de" },
  { languages: ["fr-FR", "de-AT", "en-US"], expected: "de" },
  { languages: ["en-GB", "de-DE"], expected: "en" },
  { languages: ["fr-FR", "it-IT"], expected: "en" },
]) {
  test(`first use respects browser languages ${languages.join(", ")}`, async ({
    page,
  }) => {
    await page.addInitScript((value) => {
      Object.defineProperty(navigator, "languages", { get: () => value });
    }, languages);
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("lang", expected);
    await expect(
      page.getByRole("combobox", { name: /^(Language|Sprache)$/ }),
    ).toHaveValue(expected);
    await expect(
      page.getByRole("combobox", {
        name: /^(Preferred citation style|Bevorzugter Zitierstil)$/,
      }),
    ).toHaveValue("apa");
  });
}

test("a removed stored style falls back to APA with a translated notice", async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      "source-taster-guest-preferences-v1",
      JSON.stringify({
        language: "en",
        citationStyle: "retired-style",
        theme: "system",
      }),
    );
  });
  await page.goto("/");
  await expect(
    page.getByRole("combobox", {
      name: "Preferred citation style",
      exact: true,
    }),
  ).toHaveValue("apa");
  await expect(page.getByRole("status")).toContainText(
    "Your saved citation style is no longer available.",
  );
  await page
    .getByRole("combobox", { name: "Language", exact: true })
    .selectOption("de");
  await expect(page.getByRole("status")).toContainText(
    "Ihr gespeicherter Zitierstil ist nicht mehr verfügbar.",
  );
  await page
    .getByRole("combobox", { name: "Bevorzugter Zitierstil", exact: true })
    .selectOption("vancouver");
  await expect(page.getByRole("status")).toHaveCount(0);
});

test("disabled browser storage still allows Preferences and a Check", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      get: () => {
        throw new DOMException("Storage disabled", "SecurityError");
      },
    });
  });
  await page.goto("/");
  await page
    .getByRole("combobox", { name: /^(Language|Sprache)$/ })
    .selectOption("en");
  await page
    .getByRole("combobox", { name: "Preferred citation style", exact: true })
    .selectOption("oxford");
  await page
    .getByRole("textbox")
    .fill("Darwin, C. (1859). On the Origin of Species.");
  await page
    .getByRole("button", { name: "Check Reference", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("Finished");
  await expect(
    page.getByRole("combobox", {
      name: "Preferred citation style",
      exact: true,
    }),
  ).toHaveValue("oxford");
});
