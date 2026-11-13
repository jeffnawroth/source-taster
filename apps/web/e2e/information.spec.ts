// SPDX-License-Identifier: AGPL-3.0-or-later
// #115: Help, contact and legal pages are linked from the web client through
// the shared UI seam that the browser extension will reuse.
import { expect, test } from "@playwright/test";
import { choosePreferences } from "./support/workspace.ts";

test("help, contact and legal links follow the interface language and carry no input", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("textbox").fill("Private draft bibliography, 2026.");
  for (const [language, navigation, links] of [
    [
      "en",
      "Help and legal information",
      [
        ["Help", "/docs/en/"],
        ["Contact", "/en/contact/"],
        ["Legal notice", "/en/legal-notice/"],
        ["Terms", "/en/terms/"],
        ["Privacy policy", "/en/privacy/"],
        ["Withdrawal instructions", "/en/withdrawal/"],
      ],
    ],
    [
      "de",
      "Hilfe und Rechtliches",
      [
        ["Hilfe", "/docs/de/"],
        ["Kontakt", "/de/contact/"],
        ["Impressum", "/de/legal-notice/"],
        ["Nutzungsbedingungen", "/de/terms/"],
        ["Datenschutz", "/de/privacy/"],
        ["Widerruf", "/de/withdrawal/"],
      ],
    ],
  ] as const) {
    await choosePreferences(page, { language: language });
    const nav = page.getByRole("navigation", { name: navigation, exact: true });
    await expect(nav.getByRole("link")).toHaveCount(links.length);
    for (const [name, path] of links) {
      const link = nav.getByRole("link", { name, exact: true });
      // Without VITE_SOURCE_TASTER_WEBSITE_URL the site shares the app origin.
      await expect(link).toHaveAttribute("href", path);
      await expect(link).toHaveAttribute("rel", "noopener noreferrer");
      const opened = page.waitForEvent("popup");
      await link.click();
      const destination = await opened;
      await destination.waitForLoadState();
      await expect(destination.locator("html")).toHaveAttribute(
        "lang",
        language,
      );
      await expect(destination.locator("main h1")).toHaveCount(1);
      await expect(destination.locator(".draft")).toBeVisible();
      await expect(
        destination.getByRole("textbox", { name: /References|Referenzen/ }),
      ).toHaveCount(0);
      await destination.close();
    }
  }
});
