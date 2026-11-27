// SPDX-License-Identifier: AGPL-3.0-or-later
// The page chrome every visitor meets: the skip link, the brand link, the
// no-JavaScript note and the footer's cancellation handoff.
import { expect, test } from "@playwright/test";

const copy = {
  en: {
    skip: "Skip to content",
    noScript:
      "Search needs JavaScript. Use the documentation links to read every guide.",
    docs: "/docs/en/how-the-check-works/",
    home: "/en/",
    legal: "Legal information",
  },
  de: {
    skip: "Zum Inhalt",
    noScript:
      "Die Suche benötigt JavaScript. Über die Dokumentationslinks erreichen Sie jede Anleitung.",
    docs: "/docs/de/how-the-check-works/",
    home: "/de/",
    legal: "Rechtliche Informationen",
  },
} as const;

for (const language of ["en", "de"] as const) {
  const t = copy[language];

  test(`the skip link is the first tab stop and moves focus to the content (${language})`, async ({
    page,
  }) => {
    await page.goto(t.docs);
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: t.skip, exact: true });
    await expect(skip).toBeFocused();
    await expect(skip).toBeVisible();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#content$/u);
    // The target is the focusable main landmark: the next Tab starts inside it.
    const content = page.locator("main#content");
    await expect(content).toBeFocused();
  });

  test(`the header brand link goes to the home page in the same language (${language})`, async ({
    page,
  }) => {
    await page.goto(t.docs);
    const brand = page.locator("a.brand");
    await expect(brand).toHaveAttribute("href", t.home);
    await brand.click();
    await expect(page).toHaveURL(new RegExp(`${t.home}$`, "u"));
    await expect(page.locator("html")).toHaveAttribute("lang", language);
  });

  test(`documentation pages say that search needs JavaScript only when scripts are off (${language})`, async ({
    browser,
    page,
  }) => {
    const note = (target: typeof page) =>
      target.getByText(t.noScript, { exact: true });
    // With scripts on, the note stays out of the page.
    await page.goto(t.docs);
    await expect(page.locator("main#content")).toBeVisible();
    await expect(note(page)).toBeHidden();
    const context = await browser.newContext({ javaScriptEnabled: false });
    const plain = await context.newPage();
    for (const path of [t.docs, `/docs/${language}/`]) {
      await plain.goto(path);
      await expect(note(plain)).toBeVisible();
    }
    await context.close();
  });

  test(`the footer links no cancellation service while none is configured (${language})`, async ({
    page,
  }) => {
    // The preview build has no configured origin; a publication build fails
    // without one (see Page.astro), which a second build would be needed to show.
    await page.goto(t.home);
    const legal = page.getByRole("navigation", { name: t.legal });
    await expect(legal.getByRole("link").first()).toBeVisible();
    await expect(page.locator('a[href*="/cancel"]')).toHaveCount(0);
  });
}
