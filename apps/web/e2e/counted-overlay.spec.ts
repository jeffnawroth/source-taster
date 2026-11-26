// SPDX-License-Identifier: AGPL-3.0-or-later
import { expect, test } from "@playwright/test";

for (const overlay of ["menu", "help", "reset"] as const) {
  test(`counted ${overlay} survives the Check response and returns focus to the summary`, async ({
    page,
  }) => {
    let release!: () => void;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    await page.route("**/v2/checks", async (route) => {
      if (route.request().method() !== "POST") return route.continue();
      const response = await route.fetch();
      await gate;
      await route.fulfill({ response });
    });
    await page.goto("/");
    await page
      .getByRole("textbox", { name: "Reference", exact: true })
      .fill("Darwin, C. (1859). On the Origin of Species.");
    await page
      .getByRole("button", { name: "Check reference", exact: true })
      .click();
    const stage = page.getByTestId("counted-preview");
    await expect(stage).toBeVisible();
    if (overlay === "help") {
      await stage
        .getByRole("button", { name: "How the check works", exact: true })
        .click();
    } else {
      await stage
        .getByRole("button", { name: "More actions", exact: true })
        .click();
      if (overlay === "reset")
        await page
          .getByRole("menuitem", { name: "Reset", exact: true })
          .click();
    }
    const opened =
      overlay === "menu"
        ? page.getByRole("menu")
        : overlay === "reset"
          ? page.getByRole("alertdialog")
          : page.getByRole("dialog", {
              name: "How the check works",
              exact: true,
            });
    await expect(opened).toBeVisible();
    const response = page.waitForResponse(
      (r) =>
        r.request().method() === "POST" &&
        new URL(r.url()).pathname === "/v2/checks",
    );
    release();
    await response;
    // The server has accepted the Check, but the open interaction keeps its stage.
    await expect(opened).toBeVisible();
    await expect(stage).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(opened).toBeHidden();
    const summary = page.getByRole("region", {
      name: "Check summary",
      exact: true,
    });
    await expect(summary).toBeVisible();
    await expect(
      summary.getByRole("button", { name: "More actions", exact: true }),
    ).toBeFocused();
  });
}
