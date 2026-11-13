// SPDX-License-Identifier: AGPL-3.0-or-later
import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { openDocumentationSearch } from "./search.ts";

test("the source-download landing keeps the public site navigation and appearance", async ({
  page,
}) => {
  for (const language of ["de", "en"])
    for (const mode of ["light", "dark"] as const) {
      await page.emulateMedia({ colorScheme: mode });
      await page.setViewportSize({ width: 320, height: 800 });
      await page.goto(`/docs/${language}/`);
      await page
        .getByRole("link", {
          name:
            language === "en"
              ? "Search licenses and source"
              : "Suchlizenzen und Quellcode",
          exact: true,
        })
        .click();
      await expect(
        page.getByRole("button", {
          name:
            language === "en"
              ? "Search documentation"
              : "Dokumentation durchsuchen",
          exact: true,
        }),
      ).toBeVisible();
      expect(
        await page.evaluate(
          () => getComputedStyle(document.documentElement).colorScheme,
        ),
      ).toBe(mode);
      expect(
        await page.evaluate(
          () =>
            document.documentElement.scrollWidth <=
            document.documentElement.clientWidth,
        ),
      ).toBe(true);
      await openDocumentationSearch(page);
      await page.getByRole("searchbox").fill("Harvard");
      await page.getByRole("searchbox").press("Enter");
      await page
        .locator("#search-results")
        .getByRole("link", {
          name:
            language === "en"
              ? "Structuring references"
              : "Referenzen strukturieren",
          exact: true,
        })
        .click();
      await expect(page).toHaveURL(
        new RegExp(`/docs/${language}/structuring/$`),
      );
    }
});

test("readers can cite the exact legal draft and switch its immutable language counterpart", async ({
  page,
}) => {
  for (const language of ["de", "en"]) {
    for (const id of ["legal-notice", "terms", "privacy", "withdrawal"]) {
      await page.goto(`/${language}/${id}/`);
      const paragraphs = await page
        .locator("article > p:not(.summary):not(.legal-state)")
        .allTextContents();
      const version = page.getByRole("link", {
        name: "draft-2026-10-26.1",
        exact: true,
      });
      await expect(version).toHaveAttribute(
        "href",
        `/${language}/${id}/versions/draft-2026-10-26.1/`,
      );
      await version.click();
      await expect(
        page.locator("article > p:not(.summary):not(.legal-state)"),
      ).toHaveText(paragraphs);
      if (id === "terms")
        await expect(page.locator("main")).toContainText(
          language === "en" ? "contracting party" : "Vertragspartner",
        );
      const other = language === "de" ? "en" : "de";
      await page
        .getByRole("link", {
          name: other === "de" ? "DE Deutsch" : "EN English",
          exact: true,
        })
        .click();
      await expect(page).toHaveURL(
        new RegExp(`/${other}/${id}/versions/draft-2026-10-26.1/$`),
      );
      await expect(page.locator("html")).toHaveAttribute("lang", other);
    }
    await page.goto(`/${language}/contact/`);
    await expect(page.locator('a[href^="mailto:"]')).toHaveCount(0);
    await expect(page.locator("main")).toContainText(
      language === "en" ? "have not been selected" : "noch nicht ausgewählt",
    );
  }
});

test("a visitor sees an honest product example and finds help by question", async ({
  page,
}) => {
  for (const [language, example, question, title] of [
    [
      "en",
      "Illustrative example · not a live check",
      "What does a verdict tell me?",
      "How the check works",
    ],
    [
      "de",
      "Beispielansicht · keine laufende Prüfung",
      "Was sagt ein Befund aus?",
      "So funktioniert die Prüfung",
    ],
  ] as const) {
    await page.goto(`/${language}/`);
    await expect(page.getByRole("figure", { name: example })).toBeVisible();
    await expect(page.locator("main")).toContainText(
      language === "en"
        ? "not a public checking service"
        : "kein öffentlicher Prüfdienst",
    );
    await page
      .locator("main")
      .getByRole("link", {
        name:
          language === "en" ? "Read the documentation" : "Dokumentation lesen",
        exact: true,
      })
      .click();
    await expect(page).toHaveURL(new RegExp(`/docs/${language}/$`));
    // The guide card is one link whose name starts with its number and question.
    await page.getByRole("link", { name: question }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
    const chapters = page.getByRole("navigation", {
      name: language === "en" ? "Chapters" : "Kapitel",
      exact: true,
    });
    await expect(
      chapters.getByRole("link", { name: title, exact: true }),
    ).toHaveAttribute("aria-current", "page");
    await page
      .getByRole("navigation", {
        name: language === "en" ? "On this page" : "Auf dieser Seite",
        exact: true,
      })
      .getByRole("link")
      .nth(1)
      .click();
    await expect(page).toHaveURL(/#section-2$/);
    await expect(page.locator("#section-2")).toBeInViewport();
  }
});

for (const language of ["de", "en"] as const)
  for (const mode of ["light", "dark"] as const) {
    test(`${language} ${mode}: narrow readers use the chapter disclosure and local typography`, async ({
      page,
      request,
    }, testInfo) => {
      await page.emulateMedia({ colorScheme: mode, reducedMotion: "reduce" });
      await page.setViewportSize({ width: 320, height: 800 });
      await page.goto(`/docs/${language}/how-the-check-works/`);
      const chapters = language === "en" ? "Chapters" : "Kapitel";
      const choose = language === "en" ? "Choose a chapter" : "Kapitel wählen";
      // Native summary has no implicit ARIA role in the HTML-AAM mapping used
      // by the locator engine; address its semantic element and visible name.
      const disclosure = page
        .locator("summary")
        .filter({ hasText: new RegExp(`^${choose}$`) });
      await expect(disclosure).toBeVisible();
      await disclosure.focus();
      await disclosure.press("Enter");
      await disclosure.press("Tab");
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");
      const nextGuide = page
        .getByRole("navigation", { name: chapters, exact: true })
        .getByRole("link", {
          name:
            language === "en"
              ? "Structuring references"
              : "Referenzen strukturieren",
          exact: true,
        });
      await expect(nextGuide).toBeFocused();
      await nextGuide.press("Enter");
      await expect(page).toHaveURL(
        new RegExp(`/docs/${language}/structuring/$`),
      );
      for (const width of [320, 1280]) {
        await page.setViewportSize({ width, height: 800 });
        for (const route of [
          `/${language}/`,
          `/docs/${language}/`,
          `/docs/${language}/structuring/`,
        ]) {
          await page.goto(route);
          await page.evaluate(() => document.fonts.ready);
          expect(
            await page.evaluate(
              () =>
                document.documentElement.scrollWidth <=
                document.documentElement.clientWidth,
            ),
            `${route} reflow at ${width}`,
          ).toBe(true);
          expect(
            await page.evaluate(
              () => getComputedStyle(document.documentElement).colorScheme,
            ),
          ).toBe(mode);
          expect(
            await page.evaluate(() =>
              [...document.fonts]
                .filter(
                  (font) =>
                    font.family.replaceAll('"', "") ===
                    "Atkinson Hyperlegible Next",
                )
                .map((font) => font.status),
            ),
          ).toContain("loaded");
          const { violations } = await new AxeBuilder({ page })
            .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
            .analyze();
          expect(
            violations.map(
              (v) =>
                `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`,
            ),
          ).toEqual([]);
          await page.screenshot({
            path: testInfo.outputPath(
              `${width}-${route.includes("structuring") ? "article" : route.includes("docs") ? "docs" : "home"}.png`,
            ),
            fullPage: true,
          });
        }
      }
      for (const font of [
        "AtkinsonHyperlegibleNext.woff2",
        "IBMPlexMono-Regular.woff2",
      ]) {
        const response = await request.get(`/fonts/${font}`);
        expect(response.status()).toBe(200);
        expect(response.headers()["content-type"]).toBe("font/woff2");
        expect((await response.body()).subarray(0, 4).toString()).toBe("wOF2");
      }
    });
  }

test("search opens from any public page, recovers a real index failure and returns keyboard focus", async ({
  page,
  context,
  baseURL,
}) => {
  const requests: string[] = [];
  page.on("request", (request) => requests.push(request.url()));
  for (const [
    language,
    label,
    failure,
    retry,
    loading,
    empty,
    found,
    title,
  ] of [
    [
      "en",
      "Search documentation",
      "Try again or use the documentation links. Search could not load.",
      "Retry search",
      "Searching…",
      "No matching pages. Try another word.",
      "1 page found.",
      "Structuring references",
    ],
    [
      "de",
      "Dokumentation durchsuchen",
      "Versuchen Sie es erneut oder nutzen Sie die Dokumentationslinks. Die Suche konnte nicht geladen werden.",
      "Suche erneut versuchen",
      "Suche läuft …",
      "Keine passenden Seiten. Versuchen Sie ein anderes Wort.",
      "1 Seite gefunden.",
      "Referenzen strukturieren",
    ],
  ] as const) {
    await page.goto(`/${language}/contact/`);
    const trigger = page.getByRole("button", { name: label, exact: true });
    await trigger.focus();
    await trigger.press("Enter");
    const dialog = page.getByRole("dialog", { name: label, exact: true });
    const query = dialog.getByRole("searchbox", { name: label, exact: true });
    await expect(query).toBeFocused();
    await page.route("**/pagefind/**", (route) => route.abort());
    await query.fill("Harvard");
    await query.press("Enter");
    await expect(dialog.getByRole("status")).toHaveText(failure);
    await page.unroute("**/pagefind/**");
    const loadingGate = Promise.withResolvers<void>();
    await page.route("**/pagefind/**", async (route) => {
      await loadingGate.promise;
      await route.continue();
    });
    try {
      await dialog.getByRole("button", { name: retry, exact: true }).click();
      await expect(dialog.getByRole("status")).toHaveText(loading);
      await expect(dialog.locator("#search-results")).toHaveAttribute(
        "aria-busy",
        "true",
      );
      await expect(query).toBeFocused();
    } finally {
      loadingGate.resolve();
    }
    const result = dialog.getByRole("link", { name: title, exact: true });
    await expect(result).toHaveAttribute(
      "href",
      `/docs/${language}/structuring/`,
    );
    await expect(dialog.getByRole("status")).toHaveText(found);
    await page.unroute("**/pagefind/**");
    await query.press("Escape");
    await expect(dialog).not.toBeVisible();
    await expect(trigger).toBeFocused();
    await page.keyboard.press("Control+k");
    await expect(query).toBeFocused();
    await expect(query).toHaveValue("");
    await query.fill("zzzzuniquenomatch");
    await query.press("Enter");
    await expect(dialog.getByRole("status")).toHaveText(empty);
    await query.fill("Harvard");
    await query.press("Enter");
    await expect(result).toBeVisible();
    await query.press("Tab");
    await page.keyboard.press("Tab");
    await expect(result).toBeFocused();
    await result.press("Enter");
    await expect(page).toHaveURL(new RegExp(`/docs/${language}/structuring/$`));
  }
  expect(
    requests.every((url) => new URL(url).origin === new URL(baseURL!).origin),
  ).toBe(true);
  expect(requests.some((url) => /Harvard|zzzzunique/.test(url))).toBe(false);
  expect(await context.cookies()).toEqual([]);
  expect(
    await page.evaluate(async () => ({
      local: Object.keys(localStorage),
      session: Object.keys(sessionStorage),
      databases: await indexedDB.databases(),
      caches: await caches.keys(),
      workers: (await navigator.serviceWorker.getRegistrations()).length,
    })),
  ).toEqual({ local: [], session: [], databases: [], caches: [], workers: 0 });
});
