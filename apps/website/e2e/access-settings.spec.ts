// SPDX-License-Identifier: AGPL-3.0-or-later
import { expect, test } from "@playwright/test";

test("every guide remains usable at 320px with JavaScript disabled", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    baseURL,
    javaScriptEnabled: false,
    viewport: { width: 320, height: 800 },
  });
  try {
    const page = await context.newPage();
    for (const language of ["de", "en"]) {
      await page.goto(`/docs/${language}/`);
      await page
        .getByRole("link", {
          name:
            language === "en"
              ? "What does a verdict tell me?"
              : "Was sagt ein Befund aus?",
        })
        .click();
      await expect(page).toHaveURL(
        new RegExp(`/docs/${language}/how-the-check-works/$`),
      );
      const summary = page.locator("details.chapter-disclosure > summary");
      await summary.focus();
      await summary.press("Enter");
      const chapters = page.getByRole("navigation", {
        name: language === "en" ? "Chapters" : "Kapitel",
        exact: true,
      });
      const links = await chapters.getByRole("link").all();
      expect(links).toHaveLength(6);
      for (const link of links)
        expect(
          (
            await context.request.get((await link.getAttribute("href"))!)
          ).status(),
        ).toBe(200);
      await expect(
        page.getByRole("button", {
          name:
            language === "en"
              ? "Search documentation"
              : "Dokumentation durchsuchen",
          exact: true,
        }),
      ).toHaveCount(0);
      expect(
        await page.evaluate(
          () =>
            document.documentElement.scrollWidth <=
            document.documentElement.clientWidth,
        ),
      ).toBe(true);
    }
    expect(await context.cookies()).toEqual([]);
  } finally {
    await context.close();
  }
});

for (const language of ["de", "en"] as const)
  for (const mode of ["light", "dark"] as const) {
    test(`${language} ${mode}: search traps and returns focus under forced colors and reduced settings`, async ({
      page,
      browserName,
    }) => {
      await page.setViewportSize({ width: 320, height: 800 });
      await page.emulateMedia({
        colorScheme: mode,
        forcedColors: "active",
        reducedMotion: "reduce",
      });
      if (browserName === "chromium") {
        const cdp = await page.context().newCDPSession(page);
        await cdp.send("Emulation.setEmulatedMedia", {
          features: [
            { name: "prefers-color-scheme", value: mode },
            { name: "forced-colors", value: "active" },
            { name: "prefers-reduced-motion", value: "reduce" },
            { name: "prefers-reduced-transparency", value: "reduce" },
          ],
        });
      }
      await page.goto(`/${language}/contact/`);
      const trigger = page.getByRole("button", {
        name:
          language === "en"
            ? "Search documentation"
            : "Dokumentation durchsuchen",
        exact: true,
      });
      await trigger.focus();
      const focus = await trigger.evaluate((element) => ({
        style: getComputedStyle(element).outlineStyle,
        width: getComputedStyle(element).outlineWidth,
      }));
      expect(focus.style).toBe("solid");
      expect(parseFloat(focus.width)).toBeGreaterThanOrEqual(2);
      await trigger.press("Enter");
      const dialog = page.getByRole("dialog");
      const query = dialog.getByRole("searchbox");
      await expect(query).toBeFocused();
      await query.press("Shift+Tab");
      const close = dialog.getByRole("button", {
        name: language === "en" ? "Close search" : "Suche schließen",
        exact: true,
      });
      await expect(close).toBeFocused();
      await close.press("Shift+Tab");
      await expect(
        dialog.getByRole("button", {
          name: language === "en" ? "Search" : "Suchen",
          exact: true,
        }),
      ).toBeFocused();
      await page.keyboard.press("Tab");
      await expect(close).toBeFocused();
      expect(
        await dialog.evaluate(
          (element) => getComputedStyle(element).backdropFilter,
        ),
      ).toBe("none");
      expect(
        await page.evaluate(
          () =>
            document.documentElement.scrollWidth <=
            document.documentElement.clientWidth,
        ),
      ).toBe(true);
      await close.press("Escape");
      await expect(trigger).toBeFocused();
      await expect(dialog).not.toBeVisible();
    });
  }
