// SPDX-License-Identifier: AGPL-3.0-or-later
import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
for (const language of ["en", "de"] as const) {
  test(`manual Verdicts filter and reset while preserving historical evidence in ${language}`, async ({ page }) => {
    const en = language === "en";
    await page.setViewportSize({ width: 360, height: 780 });
    await page.goto("/");
    await page.getByRole("combobox", { name: /^(Language|Sprache)$/ }).selectOption(language);
    await page.getByRole("textbox").fill("Aspelmeyer, M. (2009). Measured measurement. Nature Physics, 5, 11–12. https://doi.org/10.1038/nphys1170");
    await page.getByRole("button", { name: en ? "Check Reference" : "Referenz prüfen", exact: true }).click();
    const list = page.getByRole("list", { name: en ? "References" : "Referenzen", exact: true });
    await expect(list).toContainText(en ? "Correct" : "Korrekt", { timeout: 15000 });
    await list.getByRole("button").click();
    const detail = page.getByRole("region", { name: en ? "Reference detail" : "Referenzdetails", exact: true });
    await detail.getByRole("button", { name: en ? "Confirm Verdict" : "Urteil bestätigen", exact: true }).click();
    await expect(detail).toContainText(en ? "Manual Verdict: Correct" : "Manuelles Urteil: Korrekt");
    await expect(detail).toContainText(en ? "Original system Verdict: Correct" : "Ursprüngliches Systemurteil: Korrekt");
    await detail.getByRole("button", { name: en ? "Judge manually" : "Manuell beurteilen", exact: true }).click();
    await detail.getByRole("combobox", { name: en ? "Manual Verdict" : "Manuelles Urteil", exact: true }).selectOption("not-found");
    await detail.getByRole("button", { name: en ? "Save manual Verdict" : "Manuelles Urteil speichern", exact: true }).click();
    await expect(detail).toContainText(en ? "Manual Verdict: Not found" : "Manuelles Urteil: Nicht gefunden");
    const summary = page.getByRole("region", { name: en ? "Check summary" : "Prüfungsübersicht", exact: true });
    await expect(summary.getByRole("button", { name: en ? /^Not found: 1/ : /^Nicht gefunden: 1/ })).toContainText(en ? "Manual: 1" : "Manuell: 1");
    await detail.getByRole("button", { name: en ? "Back to References" : "Zurück zu Referenzen", exact: true }).click();
    await expect(list).toContainText(en ? "Manual Verdict: Not found" : "Manuelles Urteil: Nicht gefunden");
    const filter = summary.getByRole("button", { name: en ? /^Not found: 1/ : /^Nicht gefunden: 1/ });
    await filter.click();
    await expect(filter).toHaveAttribute("aria-pressed", "true");
    await expect(list.getByRole("listitem")).toHaveCount(1);
    await list.getByRole("button").click();
    // Return to all before Re-check so the running Status stays visible.
    await summary.getByRole("button", { name: en ? /^All References:/ : /^Alle Referenzen:/ }).click();
    await list.getByRole("button").click();
    await detail.getByRole("button", { name: en ? "Re-check this Reference" : "Diese Referenz erneut prüfen", exact: true }).click();
    await expect(detail.getByRole("status")).toContainText(en ? "reset by the Re-check" : "durch die erneute Prüfung zurückgesetzt");
    await expect(detail.getByRole("button", { name: en ? "Confirm Verdict" : "Urteil bestätigen", exact: true })).toBeVisible({ timeout: 15000 });
    await expect(summary.getByRole("button", { name: en ? /^Correct: 1/ : /^Korrekt: 1/ })).not.toContainText(en ? "Manual:" : "Manuell:");
    await detail.getByText(en ? "Previous results (historical)" : "Frühere Ergebnisse (historisch)", { exact: true }).click();
    const history = detail.getByRole("region", { name: en ? "Historical result" : "Historisches Ergebnis", exact: true });
    await expect(history).toContainText(en ? "Manual Verdict: Not found" : "Manuelles Urteil: Nicht gefunden");
    await expect(history).toContainText(en ? "Original system Verdict: Correct" : "Ursprüngliches Systemurteil: Korrekt");
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}
