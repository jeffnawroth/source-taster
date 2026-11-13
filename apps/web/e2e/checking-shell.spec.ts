// SPDX-License-Identifier: AGPL-3.0-or-later
import { expect, test } from "@playwright/test";
import { chooseFileSource, choosePreferences } from "./support/workspace.ts";

test("streamed feed has one keyboard entry, keeps slot order and returns focus from detail", async ({
  page,
}) => {
  await page.goto("/");
  await choosePreferences(page, { language: "en" });
  await page
    .getByRole("textbox", { name: "Reference", exact: true })
    .fill(
      "Doe, J. (2020). Held Reference. doi:10.5555/browser-held\nDarwin, C. (1859). On the Origin of Species.\nAspelmeyer, M. (2009). Measured measurement. Nature Physics, 5, 11–12. https://doi.org/10.1038/nphys1170",
    );
  await page
    .getByRole("button", { name: "Check reference", exact: true })
    .click();
  const feed = page.getByRole("grid", { name: "References", exact: true });
  const rows = feed.getByRole("row");
  await expect(rows).toHaveCount(3);
  await rows.first().focus();
  await page.keyboard.press("ArrowDown");
  await expect(rows.nth(1)).toBeFocused();
  await expect(
    page.getByRole("button", { name: "Correct: 1", exact: true }),
  ).toBeVisible({ timeout: 15000 });
  await expect(rows.nth(1)).toBeFocused();
  await expect(rows.nth(0)).toContainText("Held Reference");
  await expect(rows.nth(1)).toContainText("On the Origin of Species");
  await expect(rows.nth(2)).toContainText("Measured measurement");
  expect(
    await rows.evaluateAll(
      (items) =>
        items.filter((item) => item.getAttribute("tabindex") === "0").length,
    ),
  ).toBe(1);
  await page.setViewportSize({ width: 360, height: 640 });
  await page.keyboard.press("Enter");
  const detail = page.getByRole("region", {
    name: "Reference detail",
    exact: true,
  });
  await expect(detail).toContainText(
    "Darwin, C. (1859). On the Origin of Species.",
  );
  await expect(feed).toBeHidden();
  await page
    .getByRole("button", { name: "Back to references", exact: true })
    .click();
  await expect(rows.nth(1)).toBeFocused();
  await page.keyboard.press("ArrowUp");
  await expect(rows.first()).toBeFocused();
});

for (const language of ["en", "de"] as const)
  test(`compact summary keeps all six findings, status and keyboard filters usable at 320px (${language})`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 700 });
    await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
    await page.goto("/");
    await choosePreferences(page, { language: language });
    const en = language === "en";
    await page
      .getByRole("textbox", {
        name: en ? "Reference" : "Referenz",
        exact: true,
      })
      .fill(
        "Darwin, C. (1859). On the Origin of Species.\nAspelmeyer, M. (2009). Measured measurement. Nature Physics, 5, 11–12. https://doi.org/10.1038/nphys1170",
      );
    await page
      .getByRole("button", {
        name: en ? "Check reference" : "Referenz prüfen",
        exact: true,
      })
      .click();
    const summary = page.getByRole("region", {
      name: en ? "Check summary" : "Prüfungsübersicht",
    });
    const toolbar = summary.getByRole("toolbar");
    const correct = toolbar.getByRole("button", {
      name: en ? "Correct: 1" : "Korrekt: 1",
      exact: true,
    });
    await expect(correct).toBeVisible({ timeout: 15000 });
    const controls = toolbar.getByRole("button");
    expect(await controls.count()).toBe(8);
    for (const button of await controls.all()) {
      const box = await button.boundingBox();
      expect(box!.width).toBeGreaterThanOrEqual(24);
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width).toBeLessThanOrEqual(320);
    }
    const emptyCounter = toolbar.getByRole("button", {
      name: en ? "Not found: 0" : "Nicht gefunden: 0",
      exact: true,
    });
    await expect(emptyCounter).toBeDisabled();
    await emptyCounter.focus();
    await page.keyboard.press("Enter");
    await expect(summary.locator(".active-filter")).toHaveCount(0);
    const shapes = await toolbar
      .locator("svg[data-verdict] > :first-child")
      .evaluateAll((elements) => elements.map((element) => element.outerHTML));
    expect(new Set(shapes).size).toBe(6);
    // Arrow keys skip the disabled zero counters to the next live control.
    const status = toolbar.getByRole("button", {
      name: en
        ? "Technical status: 1 Not checked"
        : "Technischer Status: 1 Nicht geprüft",
      exact: true,
    });
    await correct.focus();
    await page.keyboard.press("ArrowRight");
    await expect(status).toBeFocused();
    await page.keyboard.press("ArrowLeft");
    await expect(correct).toBeFocused();
    await correct.click();
    await expect(
      summary.getByRole("button", {
        name: en ? "Remove filter: Correct" : "Filter entfernen: Korrekt",
        exact: true,
      }),
    ).toBeVisible();
    const feed = page.getByRole("grid", {
      name: en ? "References" : "Referenzen",
      exact: true,
    });
    await expect(feed.getByRole("row")).toHaveCount(1);
    await summary
      .getByRole("button", {
        name: en ? "Remove filter: Correct" : "Filter entfernen: Korrekt",
        exact: true,
      })
      .click();
    await expect(feed.getByRole("row")).toHaveCount(2);
    // "Show all labels" moved into the ⋯ Menu (#194 D).
    const more = summary.getByRole("button", {
      name: en ? "More actions" : "Weitere Aktionen",
      exact: true,
    });
    await more.click();
    await page
      .getByRole("menuitem", {
        name: en ? "Show all labels" : "Alle Labels zeigen",
        exact: true,
      })
      .click();
    await expect(
      summary
        .getByRole("toolbar", {
          name: en ? "Outcome filters" : "Ergebnisfilter",
          exact: true,
        })
        .getByText(en ? "Deviations" : "Abweichungen", { exact: true }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await more.click();
    await page
      .getByRole("menuitem", {
        name: en ? "Compact labels" : "Kompakte Labels",
        exact: true,
      })
      .click();
    await status.click();
    await page
      .getByRole("menuitem", {
        name: en ? "Not checked: 1" : "Nicht geprüft: 1",
        exact: true,
      })
      .click();
    await expect(feed.getByRole("row")).toHaveCount(1);
    await expect(feed).toContainText("On the Origin of Species");
  });

for (const language of ["en", "de"] as const)
  test(`existing-action launcher opens intake and restores keyboard focus without account UI in standalone (${language})`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto("/");
    await choosePreferences(page, { language: language });
    const en = language === "en";
    const launcher = page.getByRole("button", {
      name: en ? "Search or command …" : "Suchen oder Befehl …",
      exact: true,
    });
    await launcher.focus();
    await page.keyboard.press("Control+k");
    const dialog = page.getByRole("dialog", {
      name: en ? "Commands" : "Aktionen",
      exact: true,
    });
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute("aria-modal", "true");
    await expect(
      dialog.getByRole("menuitem", {
        name: en ? "New check" : "Neue Prüfung",
        exact: true,
      }),
    ).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(launcher).toBeFocused();
    await launcher.click();
    await dialog.getByRole("searchbox").fill(en ? "reference" : "Referenz");
    await dialog
      .getByRole("menuitem", {
        name: en ? "Enter references" : "Referenzen eingeben",
        exact: true,
      })
      .click();
    await expect(dialog).toBeHidden();
    const input = page.getByRole("textbox", {
      name: en ? "Reference" : "Referenz",
      exact: true,
    });
    await expect(input).toBeFocused();
    await input.fill("Darwin, C. (1859). On the Origin of Species.");
    await expect(page.getByRole("grid")).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: en ? "Account" : "Konto", exact: true }),
    ).toHaveCount(0);
    await expect(page.getByTestId("quota-meter")).toHaveCount(0);
    await expect(
      page.getByRole("button", {
        name: en ? "History" : "Verlauf",
        exact: true,
      }),
    ).toHaveCount(0);
    await chooseFileSource(page);
    await expect(
      page.getByLabel(
        en ? "Import BibTeX or RIS" : "BibTeX oder RIS importieren",
        { exact: true },
      ),
    ).toBeVisible();
    await expect(
      page.getByLabel(en ? "PDF or Word document" : "PDF- oder Word-Dokument", {
        exact: true,
      }),
    ).toBeVisible();
  });

test("both interface families load from owned local font assets without external requests", async ({
  page,
  baseURL,
}) => {
  const external: string[] = [];
  page.on("request", (request) => {
    if (new URL(request.url()).origin !== new URL(baseURL!).origin)
      external.push(request.url());
  });
  await page.goto("/");
  const loaded = await page.evaluate(async () => {
    const sans = await document.fonts.load(
      '600 15px "Atkinson Hyperlegible Next"',
      "Prüfung übereinstimmen",
    );
    const mono = await document.fonts.load(
      '400 14px "IBM Plex Mono"',
      "10.1038/nphys1170",
    );
    return { sans: sans.length, mono: mono.length };
  });
  expect(loaded.sans).toBeGreaterThan(0);
  expect(loaded.mono).toBeGreaterThan(0);
  expect(external).toEqual([]);
});

for (const language of ["en", "de"] as const)
  test(`reconnect reads the same check after a stream outage without starting new work (${language})`, async ({
    page,
  }) => {
    const en = language === "en";
    let creations = 0;
    page.on("request", (request) => {
      if (
        request.method() === "POST" &&
        new URL(request.url()).pathname === "/v2/checks"
      )
        creations++;
    });
    await page.route("**/v2/checks/*/events", (route) =>
      route.fulfill({
        status: 503,
        contentType: "application/problem+json",
        body: JSON.stringify({
          type: "about:blank",
          status: 503,
          title: "Unavailable",
          code: "internal",
          i18nKey: "problem_internal",
        }),
      }),
    );
    await page.goto("/");
    await choosePreferences(page, { language: language });
    await page
      .getByRole("textbox", {
        name: en ? "Reference" : "Referenz",
        exact: true,
      })
      .fill("Doe, J. (2020). Held Reference. doi:10.5555/browser-held");
    await page
      .getByRole("button", {
        name: en ? "Check reference" : "Referenz prüfen",
        exact: true,
      })
      .click();
    const reconnect = page.getByRole("button", {
      name: en ? "Reconnect" : "Verbindung wiederherstellen",
      exact: true,
    });
    await expect(reconnect).toBeVisible();
    await page.unroute("**/v2/checks/*/events");
    const snapshot = page.waitForResponse(
      (response) =>
        /\/v2\/checks\/[^/]+$/.test(new URL(response.url()).pathname) &&
        response.request().method() === "GET",
    );
    await reconnect.focus();
    await page.keyboard.press("Enter");
    expect((await snapshot).status()).toBe(200);
    await expect(page.getByRole("alert")).toHaveCount(0);
    const feed = page.getByRole("grid", {
      name: en ? "References" : "Referenzen",
      exact: true,
    });
    await expect(feed.getByRole("row")).toHaveCount(1);
    await expect(feed).toContainText(
      en ? "Not verifiable" : "Nicht verifizierbar",
      { timeout: 15000 },
    );
    expect(creations).toBe(1);
  });

for (const language of ["en", "de"] as const)
  test(`compact shell stays opaque and keyboard usable with reduced transparency and forced colors (${language})`, async ({
    page,
    browserName,
  }) => {
    test.skip(
      browserName !== "chromium",
      "This test uses Chromium CDP media emulation; native qualification remains separate.",
    );
    await page.setViewportSize({ width: 320, height: 700 });
    const cdp = await page.context().newCDPSession(page);
    await cdp.send("Emulation.setEmulatedMedia", {
      features: [
        { name: "prefers-reduced-transparency", value: "reduce" },
        { name: "prefers-reduced-motion", value: "reduce" },
        { name: "forced-colors", value: "active" },
      ],
    });
    await page.goto("/");
    await choosePreferences(page, { language: language });
    const en = language === "en";
    await page
      .getByRole("textbox", {
        name: en ? "Reference" : "Referenz",
        exact: true,
      })
      .fill("Darwin, C. (1859). On the Origin of Species.");
    await page
      .getByRole("button", {
        name: en ? "Check reference" : "Referenz prüfen",
        exact: true,
      })
      .click();
    const summary = page.getByRole("region", {
      name: en ? "Check summary" : "Prüfungsübersicht",
      exact: true,
    });
    await expect(summary).toBeVisible();
    expect(
      await summary
        .locator(".summary-strip")
        .evaluate((element) => getComputedStyle(element).backdropFilter),
    ).toBe("none");
    const glyphs = summary.locator("svg[data-verdict]");
    expect(
      new Set(
        await glyphs.evaluateAll((elements) =>
          elements.map((element) => getComputedStyle(element).color),
        ),
      ).size,
    ).toBe(1);
    const question = glyphs
      .locator("..")
      .locator('svg[data-verdict="not-verifiable"]');
    const questionColors = await question.evaluate((element) => ({
      mark: getComputedStyle(element).color,
      question: getComputedStyle(element.querySelector("path")!).stroke,
    }));
    expect(questionColors.question).toBe(questionColors.mark);
    const feed = page.getByRole("grid", {
      name: en ? "References" : "Referenzen",
      exact: true,
    });
    await feed.getByRole("row").focus();
    await page.keyboard.press("Enter");
    await page
      .getByRole("button", {
        name: en ? "Back to references" : "Zurück zu Referenzen",
        exact: true,
      })
      .click();
    await expect(feed.getByRole("row")).toBeFocused();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });
