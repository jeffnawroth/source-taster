// SPDX-License-Identifier: AGPL-3.0-or-later
import { execFileSync } from "node:child_process";
import type { Page } from "@playwright/test";

/** Owner's Theme amendment uses the accepted website button, not product CSS. */
export async function normalizeAppUtilities(
  page: Page,
  root: string,
  id: string,
  theme: string,
  lang: string,
) {
  const pin = "b6dfa14909b7ec8ed4f8a7057d4bc0ea94f14022";
  const path = "apps/website/prototype/website/prototype-198.html";
  const source = execFileSync("git", ["show", `${pin}:${path}`], {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 8 * 1024 * 1024,
  });
  const recipe = (selector: string) => {
    const start = source.indexOf(`${selector}{`);
    if (start < 0)
      throw new Error(`Accepted website recipe missing: ${selector}`);
    return source.slice(
      start + selector.length + 1,
      source.indexOf("}", start),
    );
  };
  const roles: Record<string, string> = {
    line: "border-strong",
    surface: "surface",
    text: "text",
    accent: "accent",
  };
  const map = (css: string) =>
    css.replace(
      /var\(--(line|surface|text|accent)\)/g,
      (_, role: string) => `var(--st-${roles[role]})`,
    );
  await page.addStyleTag({
    content: `.v-D .owner-utilities{display:flex;align-items:center;justify-self:end;gap:6px}.v-D .owner-utility{${map(recipe(".btn"))};${recipe(".btn.icon")}}.v-D .owner-utility:hover{${map(recipe(".btn:hover"))}}.v-D .owner-utility:focus-visible{outline:3px solid var(--st-accent);outline-offset:3px}.v-D .owner-utility .ico{${recipe(".ico")};width:20px;height:20px}.v-D .owner-preferences{display:grid;place-items:center;width:36px;height:36px;color:var(--st-text-secondary)}`,
  });
  const iconId = theme === "dark" ? "i-swatch" : "i-moon";
  const symbol = source.match(
    new RegExp(`<symbol id="${iconId}"[\\s\\S]*?</symbol>`),
  )?.[0];
  if (!symbol)
    throw new Error(`Accepted website theme glyph missing: ${iconId}`);
  const icon = symbol
    .replace(/<symbol id="[^"]+"/, '<svg class="ico"')
    .replace("</symbol>", "</svg>");
  await page.evaluate(
    ({ lang, icon }) => {
      const ST = (window as unknown as { ST: { ico(id: string): string } }).ST;
      const top = document.querySelector(".v-D .top")!;
      const utilities = document.createElement("div");
      utilities.className = "owner-utilities";
      const help = document.createElement("a");
      help.className = "owner-utility owner-help";
      help.href = `/docs/${lang}/`;
      help.setAttribute("aria-label", lang === "de" ? "Hilfe" : "Help");
      help.innerHTML = ST.ico("i-help");
      const button = document.createElement("button");
      button.className = "owner-utility owner-theme";
      button.setAttribute("aria-label", "Theme");
      button.innerHTML = icon;
      const preferences = document.createElement("button");
      preferences.className = "owner-preferences";
      preferences.setAttribute("aria-label", "Preferences");
      preferences.innerHTML = ST.ico("i-gear");
      // Hosted: Preferences live in the Account popover, so the cluster ends with the Account chip.
      const account = top.querySelector(".acct");
      if (account) utilities.append(help, button, account);
      else utilities.append(help, button, preferences);
      top.append(utilities);
    },
    { theme, lang, icon },
  );
  // A keyboard modality event precedes focus, matching the real RAC control.
  if (id.includes("theme-focus")) {
    await page.keyboard.press("Tab");
    await page.locator(".owner-theme").focus();
  }
  if (id.includes("theme-hover")) await page.locator(".owner-theme").hover();
  return {
    field: "topbar.owner-utilities",
    pin,
    path,
    reason:
      "Owner 17 November Theme amendment: accepted website .btn/.btn.icon/.btn:hover and keyboard focus recipe, mapped to shared semantic roles. Direct localized Help (FA-UEB-02) uses the original icon recipe. Standalone appends the existing Preferences control; hosted moves the original Account chip into the cluster because Preferences live in the Account popover. No product styles, masks or dimensions are read.",
    roles,
    state: id.includes("theme-focus")
      ? "focus"
      : id.includes("theme-hover")
        ? "hover"
        : "rest",
  };
}
