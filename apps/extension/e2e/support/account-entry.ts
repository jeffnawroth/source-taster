// SPDX-License-Identifier: AGPL-3.0-or-later
import type { Page } from "@playwright/test";
import type { Panel } from "./chromium.ts";
import type { NativeFirefox } from "./firefox.ts";
/** Explicit user navigation to the existing signed-in Account controls. */
export async function openPanelAccount(panel: Panel, language?: "en" | "de") {
  const label = language
    ? language === "de"
      ? "Konto"
      : "Account"
    : /^(Account|Konto)$/;
  await panel.find("button", /^(Account|Konto):/);
  if (!(await panel.query("dialog", label)).length)
    await panel.click(
      "button",
      language
        ? language === "de"
          ? /^Konto:/
          : /^Account:/
        : /^(Account|Konto):/,
    );
}
export async function openFirefoxAccount(
  browser: NativeFirefox,
  language?: "en" | "de",
) {
  const label = language
    ? language === "de"
      ? "Konto"
      : "Account"
    : /^(Account|Konto)$/;
  if (
    !(await browser.tree()).some(
      (node) =>
        node.role === "dialog" &&
        (typeof label === "string"
          ? node.name === label
          : label.test(node.name)),
    )
  )
    await browser.click(
      await browser.find(
        "pushbutton",
        language
          ? language === "de"
            ? /^Konto:/
            : /^Account:/
          : /^(Account|Konto):/,
      ),
    );
}
export async function openWebAccount(page: Page, language?: "en" | "de") {
  await page
    .getByRole("button", { name: /^(Account|Konto):/ })
    .waitFor({ state: "visible" });
  if (
    !(await page
      .getByRole("dialog", {
        name: language
          ? language === "de"
            ? "Konto"
            : "Account"
          : /^(Account|Konto)$/,
        exact: true,
      })
      .isVisible())
  )
    await page
      .getByRole("button", {
        name: language
          ? language === "de"
            ? /^Konto:/
            : /^Account:/
          : /^(Account|Konto):/,
      })
      .click();
}

export function panelAccountName(email: string) {
  return new RegExp(
    `^(Account|Konto): ${email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
  );
}
