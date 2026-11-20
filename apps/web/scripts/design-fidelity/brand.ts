// SPDX-License-Identifier: AGPL-3.0-or-later
import { execFileSync } from "node:child_process";
import type { Page } from "@playwright/test";

/** #199's later accepted final artwork supersedes #194's embedded identity sketch. */
export async function normalizeBrand(
  page: Page,
  root: string,
  target: "web" | "extension",
) {
  const pin = "9e846bdd966f98010efeac1dbcdc985d9393ee82";
  const path = `apps/extension/prototype/brand/${target === "extension" ? "exports/extension-64.png" : "masters/favicon.svg"}`;
  const bytes = execFileSync("git", ["show", `${pin}:${path}`], { cwd: root });
  await page.evaluate(
    ({ data, type }) => {
      const original = document.querySelector(".v-D .brand > svg");
      if (!original) throw new Error("Original brand sketch is absent");
      const artwork = document.createElement("img");
      artwork.src = `data:${type};base64,${data}`;
      artwork.alt = "";
      artwork.width = artwork.height = 28;
      original.replaceWith(artwork);
      return artwork.decode();
    },
    {
      data: bytes.toString("base64"),
      type: target === "extension" ? "image/png" : "image/svg+xml",
    },
  );
  return {
    field: "brand.final-artwork",
    reason:
      "Later accepted #199 final brand export; sources.md specifies its masters for final optical/color application. Original #194 layout and dimensions are retained.",
    pin,
    path,
  };
}
