// SPDX-License-Identifier: AGPL-3.0-or-later
import type { Page } from "@playwright/test";
import type { Panel } from "./chromium.ts";
import type { NativeFirefox } from "./firefox.ts";
const signedInAccount = /^(?:Account: (?!Guest$)|Konto: (?!Gast$))/;
const accountLabel = (language?: "en" | "de") =>
  language ? (language === "de" ? "Konto" : "Account") : /^(Account|Konto)$/;

/** Explicit navigation through the compact entry to the owned Account dialog. */
export async function openPanelAccount(panel: Panel, language?: "en" | "de") {
  if ((await panel.query("dialog", signedInAccount)).length) return;
  await panel.find("button", signedInAccount);
  const label = accountLabel(language);
  if (!(await panel.query("dialog", label)).length)
    await panel.click("button", signedInAccount);
  // The first Quota reply can move the compact entry after pointer coordinates
  // are measured. Exercise its accessible keyboard action with trusted CDP
  // input, so this navigation does not race that asynchronous layout change.
  await panel.send("DOM.focus", {
    backendNodeId: await panel.find("button", label),
  });
  for (const type of ["keyDown", "keyUp"])
    await panel.send("Input.dispatchKeyEvent", {
      type,
      key: "Enter",
      code: "Enter",
      windowsVirtualKeyCode: 13,
    });
  await panel.find("dialog", signedInAccount);
}

export async function openFirefoxAccount(
  browser: NativeFirefox,
  language?: "en" | "de",
) {
  const tree = await browser.tree();
  if (
    tree.some(
      (node) => node.role === "dialog" && signedInAccount.test(node.name),
    )
  )
    return;
  // An already-open modal hides the chip; inspect it before waiting for the chip.
  await browser.find("pushbutton", signedInAccount);
  const label = accountLabel(language);
  if (
    !tree.some(
      (node) =>
        node.role === "dialog" &&
        (typeof label === "string"
          ? node.name === label
          : label.test(node.name)),
    )
  )
    await browser.click(await browser.find("pushbutton", signedInAccount));
  await browser.click(await browser.find("pushbutton", label));
  await browser.find("dialog", signedInAccount);
}

export async function openWebAccount(page: Page, language?: "en" | "de") {
  const dialog = page.getByRole("dialog", { name: signedInAccount });
  if (await dialog.isVisible()) return;
  await page
    .getByRole("button", { name: signedInAccount })
    .waitFor({ state: "visible" });
  const label = accountLabel(language);
  const entry = page.getByRole("dialog", { name: label, exact: true });
  if (!(await entry.isVisible()))
    await page.getByRole("button", { name: signedInAccount }).click();
  await entry.getByRole("button", { name: label, exact: true }).click();
  await dialog.waitFor({ state: "visible" });
  // RAC keeps the outgoing compact entry mounted during its exit transition.
  await entry.waitFor({ state: "hidden" });
}

/** Guest identity opens a compact entry; sign-in itself lives in a modal. */
export async function openWebSignIn(page: Page) {
  const dialog = page.getByRole("dialog", { name: /^(Sign in|Anmelden)$/ });
  if (await dialog.isVisible()) return;
  const entry = page.locator(".account-entry");
  if (!(await entry.isVisible()))
    await page
      .getByRole("button", { name: /^(Account: Guest|Konto: Gast)$/ })
      .click();
  await entry.getByRole("button", { name: /^(Sign in|Anmelden)$/ }).click();
  await dialog.waitFor({ state: "visible" });
}

export async function openPanelSignIn(panel: Panel) {
  if ((await panel.query("dialog", /^(Sign in|Anmelden)$/)).length) return;
  if (!(await panel.query("dialog", /^(Account|Konto)$/)).length)
    await panel.click("button", /^(Account: Guest|Konto: Gast)$/);
  await panel.click("button", /^(Sign in|Anmelden)$/);
  await panel.find("dialog", /^(Sign in|Anmelden)$/);
}

export async function openFirefoxSignIn(browser: NativeFirefox) {
  const tree = await browser.tree();
  if (
    tree.some(
      (node) =>
        node.role === "dialog" && /^(Sign in|Anmelden)$/.test(node.name),
    )
  )
    return;
  if (
    !tree.some(
      (node) => node.role === "dialog" && /^(Account|Konto)$/.test(node.name),
    )
  )
    await browser.click(
      await browser.find("pushbutton", /^(Account: Guest|Konto: Gast)$/),
    );
  await browser.click(await browser.find("pushbutton", /^(Sign in|Anmelden)$/));
  await browser.find("dialog", /^(Sign in|Anmelden)$/);
}

export function panelAccountName(email: string) {
  return new RegExp(
    `^(Account|Konto): ${email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
  );
}
