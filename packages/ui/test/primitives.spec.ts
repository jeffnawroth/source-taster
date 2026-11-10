// SPDX-License-Identifier: AGPL-3.0-or-later
import { expect, test, type Locator, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { PNG } from "pngjs";

async function open(page: Page, lang = "en", theme = "light") {
  await page.goto(`/?lang=${lang}&theme=${theme}`);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
}

test("buttons retain width and label while pending; disabled reason is visible and associated", async ({
  page,
}) => {
  await open(page);
  const icon = page
    .getByRole("button", { name: "Settings", exact: true })
    .first();
  expect((await icon.boundingBox())!.width).toBe(36);
  expect((await icon.boundingBox())!.height).toBe(36);
  expect(
    (await page
      .getByRole("button", { name: "Continue", exact: true })
      .boundingBox())!.height,
  ).toBe(28);
  const button = page.getByTestId("pending");
  const width = (await button.boundingBox())!.width;
  await button.click();
  await expect(button).toHaveAttribute("aria-busy", "true");
  await expect(icon).toHaveAttribute("aria-busy", "true");
  await expect(icon.locator(".st-spinner")).toBeVisible();
  await expect(button).toHaveText("Prepare report");
  expect((await button.boundingBox())!.width).toBeCloseTo(width, 1);
  const disabled = page.getByRole("button", {
    name: "Start check",
    exact: true,
  });
  await expect(disabled).toBeDisabled();
  await expect(disabled).toHaveAccessibleDescription(
    "Add at least one reference first.",
  );
  await expect(
    page.getByText("Add at least one reference first.").first(),
  ).toBeVisible();
  await page
    .getByRole("button", {
      name: "Start a new check from the selected references",
    })
    .click();
  await expect(page.getByTestId("count")).toHaveText("1");
});

test("fields validate on blur/submit, clear with Escape and filter diacritics", async ({
  page,
}) => {
  await open(page);
  const title = page.getByRole("textbox", {
    name: "Document title (required)",
  });
  await title.focus();
  await expect(page.getByText("Enter a document title.")).toHaveCount(0);
  await page.getByRole("button", { name: "Save example" }).click();
  await expect(title).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByText("Enter a document title.")).toBeVisible();
  await title.fill("An example");
  await title.press("Tab");
  await expect(title).not.toHaveAttribute("aria-invalid", "true");
  await page.getByRole("button", { name: "Save example" }).click();
  await expect(page.getByTestId("count")).toHaveText("1");
  const notes = page.getByRole("textbox", { name: "Notes", exact: true });
  await notes.fill(
    Array.from({ length: 40 }, () => "A wrapping line of notes").join("\n"),
  );
  expect((await notes.boundingBox())!.height).toBeLessThanOrEqual(320);
  expect(await notes.evaluate((el) => el.scrollHeight > el.clientHeight)).toBe(
    true,
  );
  const search = page.getByRole("searchbox");
  await search.fill("reference");
  await search.press("Escape");
  await expect(search).toHaveValue("");
  const combo = page.getByRole("combobox", { name: "Citation style" });
  await combo.click();
  await combo.fill("ecole");
  await expect(
    page.getByRole("option", { name: "École française" }),
  ).toBeVisible();
  await expect(
    page.getByRole("option", { name: "APA", exact: true }),
  ).toHaveCount(0);
  await page.keyboard.press("ArrowDown");
  await expect(combo).toHaveAttribute("aria-activedescendant", /option-ecole$/);
  await page.keyboard.press("Enter");
  await expect(combo).toHaveValue("École française");
});

test("selection, tags, file trigger and navigation retain keyboard semantics", async ({
  page,
}) => {
  await open(page);
  const checkbox = page.getByRole("checkbox", {
    name: "Crossref",
    exact: true,
  });
  await checkbox.focus();
  await checkbox.press("Space");
  await expect(checkbox).toBeChecked();
  const radio = page.locator("input[type=radio][value=text]");
  await radio.focus();
  await radio.press("ArrowDown");
  await expect(page.locator("input[type=radio][value=file]")).toBeChecked();
  const toggle = page.getByRole("switch").first();
  await toggle.focus();
  await toggle.press("Space");
  await expect(toggle).toBeChecked();
  const segment = page
    .locator(".st-segmented")
    .getByRole("radio", { name: "Text", exact: true });
  await segment.focus();
  await segment.press("ArrowRight");
  await page.keyboard.press("Space");
  await expect(
    page
      .locator(".st-segmented")
      .getByRole("radio", { name: "PDF / DOCX", exact: true }),
  ).toHaveAttribute("aria-checked", "true");
  await page
    .getByRole("button", { name: "Remove selected references" })
    .click();
  await expect(
    page.getByText("Selected references", { exact: true }),
  ).toHaveCount(0);
  const chooser = page.waitForEvent("filechooser");
  await page.getByRole("button", { name: "Choose file" }).click();
  await (
    await chooser
  ).setFiles({
    name: "sample.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("%PDF-1.7"),
  });
  await expect(page.getByTestId("count")).toHaveText("1");
  const firstTab = page.getByRole("tab", { name: "References", exact: true });
  await firstTab.focus();
  await firstTab.press("ArrowRight");
  await expect(
    page.getByRole("tab", { name: "Evidence", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  await page.getByRole("button", { name: "How this works" }).click();
  await expect(
    page.getByRole("button", { name: "How this works" }),
  ).toHaveAttribute("aria-expanded", "true");
});

test("modal and sheet trap focus, Escape returns it, destructive confirmation starts safely", async ({
  page,
}) => {
  await open(page);
  for (const name of [
    "Show details",
    "Open history sheet",
    "Remove document",
  ]) {
    const trigger = page.getByRole("button", { name, exact: true });
    await trigger.click();
    const dialog = page.getByRole(
      name === "Remove document" ? "alertdialog" : "dialog",
    );
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute("aria-modal", "true");
    if (name === "Remove document")
      await expect(
        dialog.getByRole("button", { name: "Keep document" }),
      ).toBeFocused();
    for (let n = 0; n < 5; n++) {
      await page.keyboard.press("Tab");
      expect(
        await dialog.evaluate((el) => el.contains(document.activeElement)),
      ).toBe(true);
    }
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();
  }
});

test("menu and non-modal popover restore focus and icon tooltip matches its name", async ({
  page,
}) => {
  await open(page);
  const icon = page
    .getByRole("button", { name: "Settings", exact: true })
    .first();
  await icon.focus();
  await expect(page.getByRole("tooltip")).toHaveText("Settings");
  const menu = page.getByRole("button", { name: "Actions menu" });
  await menu.click();
  await expect(page.getByRole("menu")).toBeVisible();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Escape");
  await expect(menu).toBeFocused();
  const popover = page
    .getByRole("button", { name: "Settings", exact: true })
    .last();
  await popover.click();
  await expect(page.getByRole("dialog", { name: "Settings" })).toBeVisible();
  await expect(
    page.getByRole("dialog", { name: "Settings" }),
  ).not.toHaveAttribute("aria-modal", "true");
  await page.keyboard.press("Escape");
  await expect(popover).toBeFocused();
});

test("table exposes sort direction, selection and bounded horizontal overflow", async ({
  page,
}) => {
  await open(page);
  const header = page.getByRole("columnheader", {
    name: "Document",
    exact: true,
  });
  await expect(header).toHaveAttribute("aria-sort", "ascending");
  await header.click();
  await expect(header).toHaveAttribute("aria-sort", "descending");
  await page
    .getByRole("row")
    .filter({ has: page.getByRole("checkbox", { name: /^Selection 1/ }) })
    .locator(".st-checkbox")
    .click();
  await expect(
    page
      .getByRole("row")
      .filter({ has: page.getByRole("checkbox", { name: /^Selection 1/ }) }),
  ).toHaveAttribute("aria-selected", "true");
  await page.setViewportSize({ width: 320, height: 800 });
  const container = page.locator(".st-table-container");
  expect(
    await container.evaluate((el) => el.scrollWidth > el.clientWidth),
  ).toBe(true);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("toast contract: polite/error live regions, F6 return, action persistence, timer pause and queue bound", async ({
  page,
}) => {
  await open(page);
  await page.clock.install();
  const actionTrigger = page.getByRole("button", {
    name: "Show action notification",
    exact: true,
  });
  await actionTrigger.click();
  const region = page.getByRole("region", { name: "Notifications" });
  await expect(region).toBeVisible();
  await expect(region.getByRole("status")).toHaveAttribute(
    "aria-live",
    "polite",
  );
  await page.clock.fastForward(6000);
  await expect(region.getByRole("button", { name: "Undo" })).toBeVisible();
  await actionTrigger.focus();
  await page.keyboard.press("F6");
  expect(
    await region.evaluate((el) => el.contains(document.activeElement)),
  ).toBe(true);
  await page.keyboard.press("F6");
  await expect(actionTrigger).toBeFocused();
  await region.getByRole("button", { name: "Undo" }).click();
  await expect(page.getByTestId("count")).toHaveText("1");
  const plain = page.getByRole("button", {
    name: "Show notification",
    exact: true,
  });
  await plain.click();
  await region.hover();
  await page.clock.fastForward(6000);
  await expect(region).toBeVisible();
  await plain.hover();
  await plain.focus();
  await page.clock.fastForward(5100);
  await expect(region).toHaveCount(0);
  await plain.click();
  await region.getByRole("button", { name: "Close" }).focus();
  await page.clock.fastForward(6000);
  await expect(region).toBeVisible();
  await plain.focus();
  await page.clock.fastForward(5100);
  await expect(region).toHaveCount(0);
  await page.getByRole("button", { name: "Show error notification" }).click();
  await expect(region.getByRole("alert")).toHaveAttribute(
    "aria-live",
    "assertive",
  );
  await region.getByRole("button", { name: "Close" }).click();
  for (let n = 0; n < 4; n++) await actionTrigger.click();
  await expect(region.getByRole("alertdialog")).toHaveCount(3);
  await region.getByRole("button", { name: "Close" }).first().click();
  await expect(region.getByRole("alertdialog")).toHaveCount(3);
});

for (const lang of ["de", "en"])
  for (const theme of ["light", "dark"]) {
    test(`${lang}/${theme}: axe, wrapping, 320px reflow and 200% layout zoom`, async ({
      page,
    }) => {
      await open(page, lang, theme);
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
      await page.setViewportSize({ width: 320, height: 900 });
      await page.reload();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      const primary = page
        .locator("section")
        .first()
        .getByRole("button")
        .first();
      const box = (await primary.boundingBox())!;
      expect(box.width).toBeLessThanOrEqual(254);
      expect(box.height).toBeGreaterThanOrEqual(36);
      expect(
        await primary.evaluate((el) => el.scrollWidth <= el.clientWidth),
      ).toBe(true);
      await page.locator(".st-segmented-container").evaluate((el) => {
        (el as HTMLElement).style.width = "100px";
      });
      await expect(page.locator(".st-segmented")).toHaveCount(0);
      // CSS zoom exercises twice-sized content at the same CSS viewport in all engines.
      await page.setViewportSize({ width: 640, height: 900 });
      await page.evaluate(() => {
        document.documentElement.style.zoom = "2";
      });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    });
  }

test("reduced motion/transparency and forced colors preserve final state and focus", async ({
  page,
  browserName,
}) => {
  await open(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  const skeleton = page.locator(".st-skeleton");
  await expect(skeleton).toHaveCSS("animation-name", "none");
  await expect(page.locator(".st-spinner").first()).toHaveCSS(
    "animation-name",
    "st-pulse",
  );
  await page.getByRole("button", { name: "Show labels", exact: true }).focus();
  const focus = page.locator("[data-focus-visible]").first();
  await expect(focus).toHaveCSS("outline-width", "2px");
  if (browserName === "chromium") {
    const session = await page.context().newCDPSession(page);
    await session.send("Emulation.setEmulatedMedia", {
      features: [{ name: "prefers-reduced-transparency", value: "reduce" }],
    });
    await expect(page.getByTestId("glass")).toHaveCSS(
      "backdrop-filter",
      "none",
    );
    const bg = await page
      .getByTestId("glass")
      .evaluate((el) => getComputedStyle(el).backgroundColor);
    const surface = await page.evaluate(() => {
      const el = document.createElement("div");
      el.style.background = "var(--st-surface)";
      document.body.append(el);
      const value = getComputedStyle(el).backgroundColor;
      el.remove();
      return value;
    });
    expect(bg).toBe(surface);
    await session.detach();
  }
  await page.emulateMedia({ forcedColors: "active" });
  await page.getByRole("button", { name: "Show labels", exact: true }).focus();
  await expect(page.getByTestId("glass")).toHaveCSS("backdrop-filter", "none");
  const colors = await page
    .getByRole("button", { name: "Show labels", exact: true })
    .evaluate((el) => {
      const probe = document.createElement("div");
      probe.style.color = "Highlight";
      document.body.append(probe);
      const expected = getComputedStyle(probe).color;
      probe.remove();
      return { actual: getComputedStyle(el).outlineColor, expected };
    });
  expect(colors.actual).toBe(colors.expected);
});

function luminance(rgb: number[]) {
  const [r = 0, g = 0, b = 0] = rgb.map((v) => {
    const s = v / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function ratio(a: number[], b: number[]) {
  const x = luminance(a),
    y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
async function renderedText(locator: Locator) {
  const rgb = await locator.evaluate((el) => {
    const ctx = document.createElement("canvas").getContext("2d")!;
    ctx.fillStyle = getComputedStyle(el).color;
    ctx.fillRect(0, 0, 1, 1);
    return [...ctx.getImageData(0, 0, 1, 1).data].slice(0, 3);
  });
  const normal = PNG.sync.read(
    await locator.screenshot({ animations: "disabled" }),
  );
  await locator.evaluate((el) => {
    (el as HTMLElement).style.setProperty("color", "transparent", "important");
  });
  const transparent = PNG.sync.read(
    await locator.screenshot({ animations: "disabled" }),
  );
  await locator.evaluate((el) => {
    (el as HTMLElement).style.removeProperty("color");
  });
  const ratios: number[] = [];
  for (let n = 0; n < normal.data.length; n += 4) {
    const pixel = [...normal.data.subarray(n, n + 3)];
    const bg = [...transparent.data.subarray(n, n + 3)];
    if (
      pixel.every((value, i) => Math.abs(value - rgb[i]!) < 8) &&
      pixel.some((value, i) => Math.abs(value - bg[i]!) > 20)
    )
      ratios.push(ratio(pixel, bg));
  }
  expect(
    ratios.length,
    "fully painted glyph pixels must be present",
  ).toBeGreaterThan(5);
  expect(Math.min(...ratios)).toBeGreaterThanOrEqual(4.5);
}
for (const theme of ["light", "dark"])
  test(`${theme}: actual glass glyph pixels and field boundaries meet contrast`, async ({
    page,
  }) => {
    await open(page, "de", theme);
    for (const backdrop of ["bg", "surface", "surface-sunken"]) {
      await page.locator(".glass-backdrop").evaluate((el, role) => {
        (el as HTMLElement).style.background = `var(--st-${role})`;
      }, backdrop);
      for (const target of ["text", "secondary"])
        await renderedText(page.locator(`[data-contrast="${target}"]`));
    }
    const input = page.getByRole("textbox", {
      name: "Dokumenttitel (Pflichtfeld)",
    });
    await input.scrollIntoViewIfNeeded();
    const shot = PNG.sync.read(await input.screenshot());
    const at = (x: number, y: number) => [
      ...shot.data.subarray(
        (y * shot.width + x) * 4,
        (y * shot.width + x) * 4 + 3,
      ),
    ];
    expect(
      ratio(
        at(Math.floor(shot.width / 2), 0),
        at(Math.floor(shot.width / 2), shot.height - 5),
      ),
    ).toBeGreaterThanOrEqual(3);
    await page
      .getByRole("button", { name: "Material der Befehlspalette", exact: true })
      .click();
    const dialog = page.getByRole("dialog", {
      name: "Material der Befehlspalette",
    });
    await renderedText(dialog.getByRole("heading"));
    await renderedText(dialog.locator("p"));
  });
