// SPDX-License-Identifier: AGPL-3.0-or-later
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { checkStatus } from "./check-status.ts";

for (const language of ["en", "de"] as const) {
  test(`pastes a Reference and watches its Status in ${language}, with an accessible page`, async ({
    page,
  }) => {
    await page.goto("/");
    await page
      .getByRole("combobox", { name: /^(Language|Sprache)$/ })
      .selectOption(language);
    const button = page.getByRole("button", {
      name: language === "en" ? "Check reference" : "Referenz prüfen",
      exact: true,
    });
    await expect(button).toBeDisabled();
    const input = page.getByRole("textbox");
    await expect(input).toHaveAttribute("placeholder", /Darwin/);
    await input.fill(" \n  ");
    await expect(button).toBeDisabled();
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
    await input.fill(
      "Darwin, C. (1859). On the Origin of Species. John Murray.",
    );
    await button.click();
    await expect(checkStatus(page, language)).toContainText(
      language === "en" ? "Running" : "Läuft",
    );
    await page
      .getByRole("combobox", {
        name: /^(Preferred citation style|Bevorzugter Zitierstil)$/,
      })
      .selectOption("ieee");
    // Switching language while the stream is open keeps the current Check.
    await page
      .getByRole("combobox", { name: /^(Language|Sprache)$/ })
      .selectOption(language === "en" ? "de" : "en");
    await page
      .getByRole("combobox", { name: /^(Language|Sprache)$/ })
      .selectOption(language);
    await expect(page.locator("html")).toHaveAttribute("lang", language);
    await expect(
      page.getByRole("combobox", {
        name: /^(Preferred citation style|Bevorzugter Zitierstil)$/,
      }),
    ).toHaveValue("ieee");
    await expect(checkStatus(page, language)).toContainText(
      language === "en" ? "Not checked" : "Nicht geprüft",
    );
    await expect(checkStatus(page, language)).toContainText(
      language === "en" ? "Finished" : "Abgeschlossen",
    );
    await expect(checkStatus(page, language)).toContainText("Darwin");
    await page
      .getByRole("grid", {
        name: language === "en" ? "References" : "Referenzen",
        exact: true,
      })
      .getByRole("button")
      .click();
    await expect(
      page.getByRole("region", {
        name: language === "en" ? "Reference detail" : "Referenzdetails",
        exact: true,
      }),
    ).toContainText(
      language === "en"
        ? "Previously unbilled reference slot: the first verdict uses one check of quota. Technical statuses use no quota."
        : "Bisher nicht abgerechneter Referenzplatz: Der erste Befund verbraucht eine Prüfung des Kontingents. Technische Status verbrauchen kein Kontingent.",
    );
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
  });
}

test("resumes a prematurely closed event stream without losing Reference Status updates", async ({
  page,
}) => {
  let interrupted = false;
  await page.route("**/v2/checks/*/events", async (route) => {
    if (interrupted) {
      await route.continue();
      return;
    }
    interrupted = true;
    const response = await route.fetch();
    // Close the transport after its first data frame. The real server retains
    // the remaining events for the client's reconnect with Last-Event-ID.
    const frames = (await response.text()).split("\n\n");
    const firstEvent = frames.find((frame) => frame.includes("data:"));
    await route.fulfill({ response, body: `${firstEvent}\n\n` });
  });
  await page.goto("/");
  await page
    .getByRole("combobox", { name: /^(Language|Sprache)$/ })
    .selectOption("en");
  await page
    .getByRole("textbox")
    .fill(
      "Darwin, C. (1859). On the Origin of Species.\nDarwin, C. (1871). The Descent of Man.",
    );
  await page
    .getByRole("button", { name: "Check reference", exact: true })
    .click();
  await expect(checkStatus(page)).toContainText("Finished", {
    timeout: 15_000,
  });
  await expect(
    page
      .getByRole("grid", { name: "References", exact: true })
      .getByText("Not checked", { exact: true }),
  ).toHaveCount(2);
  await expect(checkStatus(page)).toContainText("The Descent of Man");
});
