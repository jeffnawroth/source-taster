// SPDX-License-Identifier: AGPL-3.0-or-later
import { CheckResponse } from "@source-taster/contract-verification";
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { e2eClientLeaseMs } from "../../server/test/support/e2e-lease.ts";
import { checkStatus } from "./check-status.ts";
for (const language of ["en", "de"] as const) {
  test(`Cancel preserves a committed Verdict and one-action Reset clears the workspace in ${language}`, async ({
    page,
  }) => {
    await page.goto("/");
    await page
      .getByRole("combobox", { name: /^(Language|Sprache)$/ })
      .selectOption(language);
    await page
      .getByRole("textbox")
      .fill(
        "Aspelmeyer, M. (2009). Measured measurement. Nature Physics, 5, 11–12. https://doi.org/10.1038/nphys1170\nDoe, J. (2020). Held Reference. doi:10.5555/browser-held",
      );
    const creation = page.waitForResponse(
      (response) =>
        response.url().endsWith("/v2/checks") &&
        response.request().method() === "POST",
    );
    await page
      .getByRole("button", {
        name: language === "en" ? "Check reference" : "Referenz prüfen",
        exact: true,
      })
      .click();
    const created = CheckResponse.parse(await (await creation).json()).data;
    await expect(
      page
        .getByRole("grid", {
          name: language === "en" ? "References" : "Referenzen",
          exact: true,
        })
        .getByText(language === "en" ? "Correct" : "Korrekt", {
          exact: true,
        }),
    ).toBeVisible();
    const cancel = page.getByRole("button", {
      name: language === "en" ? "Cancel check" : "Prüfung abbrechen",
      exact: true,
    });
    await cancel.focus();
    await page.keyboard.press("Enter");
    await expect(
      page.getByText(language === "en" ? "Cancelled" : "Abgebrochen", {
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      page
        .getByRole("grid", {
          name: language === "en" ? "References" : "Referenzen",
          exact: true,
        })
        .getByText(language === "en" ? "Correct" : "Korrekt", {
          exact: true,
        }),
    ).toBeVisible();
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
    const reset = page.getByRole("button", {
      name: language === "en" ? "Reset" : "Zurücksetzen",
      exact: true,
    });
    await reset.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("textbox")).toHaveValue("");
    await expect(page.getByRole("textbox")).toBeFocused();
    await expect(page.locator("#results-title")).toHaveCount(0);
    const retained = CheckResponse.parse(
      await (await page.request.get(`/v2/checks/${created.id}`)).json(),
    ).data;
    expect(retained.references[0]!.outcome).toMatchObject({
      kind: "verdict",
      verdict: "correct",
    });
    expect(retained.references[1]!.outcome).toEqual({
      kind: "status",
      status: "cancelled",
    });
    expect(
      await page.evaluate(() => JSON.stringify([localStorage, sessionStorage])),
    ).not.toContain("Aspelmeyer");
  });
}
for (const operation of ["checks", "structurings"] as const) {
  test(`Reset fences a delayed ${operation} response and cancels a late-created Check`, async ({
    page,
    request,
  }) => {
    let release!: () => void;
    let entered!: () => void;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    const arrived = new Promise<void>((resolve) => {
      entered = resolve;
    });
    let checkId: string | undefined;
    await page.route(`**/v2/${operation}`, async (route) => {
      const response = await route.fetch();
      if (operation === "checks")
        checkId = CheckResponse.parse(await response.json()).data.id;
      entered();
      await gate;
      await route.fulfill({ response });
    });
    await page.goto("/");
    await page
      .getByRole("combobox", { name: /^(Language|Sprache)$/ })
      .selectOption("en");
    await page
      .getByRole("textbox")
      .fill("Darwin, C. (1859). On the Origin of Species.");
    await page
      .getByRole("button", {
        name:
          operation === "checks" ? "Check reference" : "Structure references",
        exact: true,
      })
      .click();
    await arrived;
    await page.getByRole("button", { name: "Reset", exact: true }).click();
    release();
    await expect(page.getByRole("textbox")).toHaveValue("");
    await expect(page.locator("#results-title")).toHaveCount(0);
    if (checkId)
      await expect
        .poll(
          async () =>
            CheckResponse.parse(
              await (await request.get(`/v2/checks/${checkId}`)).json(),
            ).data.endReason,
        )
        .toBe("cancelled");
    await page.waitForTimeout(200);
    await expect(page.getByRole("textbox")).toHaveValue("");
    await expect(
      page.getByText("On the Origin of Species.", { exact: false }),
    ).toHaveCount(0);
  });
}
test("late stream frames after Reset cannot replace a newer Check", async ({
  page,
}) => {
  let release!: () => void, entered!: () => void, delivered!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  const arrived = new Promise<void>((resolve) => {
    entered = resolve;
  });
  const done = new Promise<void>((resolve) => {
    delivered = resolve;
  });
  let first = true;
  await page.route("**/v2/checks/*/events", async (route) => {
    if (!first) {
      await route.continue();
      return;
    }
    first = false;
    entered();
    const response = await route.fetch();
    await gate;
    try {
      await route.fulfill({ response });
    } catch {
      /* Reset aborted this transport. */
    }
    delivered();
  });
  await page.goto("/");
  await page
    .getByRole("combobox", { name: /^(Language|Sprache)$/ })
    .selectOption("en");
  await page
    .getByRole("textbox")
    .fill("Darwin, C. (1859). On the Origin of Species.");
  await page
    .getByRole("button", { name: "Check reference", exact: true })
    .click();
  await arrived;
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await page.getByRole("textbox").fill("Doe, J. (2020). A newer Reference.");
  await page
    .getByRole("button", { name: "Check reference", exact: true })
    .click();
  release();
  await done;
  await expect(checkStatus(page)).toContainText("Finished");
  await expect(checkStatus(page)).toContainText("A newer Reference.");
  await expect(checkStatus(page)).not.toContainText("Darwin");
  await expect(page.getByRole("alert")).toHaveCount(0);
});
// #220: under a loaded machine a lease renewal answered in about 0.8 s, and the
// harness's 1.5 s lease (renewed every 500 ms) lapsed, so a running Check ended
// Cancelled before any verdict. Each renewal here is held for 1.1 s, slower than
// that, at the route seam: the lease the harness grants must outlast it.
test("a Check keeps running while every lease renewal is answered slowly", async ({
  page,
}) => {
  const slowMs = 1100;
  let answered = 0;
  let third!: () => void;
  const enough = new Promise<void>((resolve) => {
    third = resolve;
  });
  await page.route("**/v2/checks/*/lease", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, slowMs));
    await route.continue();
    if (++answered === 3) third();
  });
  await page.goto("/");
  await page
    .getByRole("combobox", { name: /^(Language|Sprache)$/ })
    .selectOption("en");
  await page
    .getByRole("textbox")
    .fill("Doe, J. (2020). Held Reference. doi:10.5555/browser-held");
  await page
    .getByRole("button", { name: "Check reference", exact: true })
    .click();
  const lapsed = page
    .getByText("The connection was not renewed in time", { exact: false })
    .waitFor()
    .then(
      () => "lapsed",
      () => "page closed",
    );
  expect(
    await Promise.race([enough.then(() => "renewed three times"), lapsed]),
    "the Check outlived three slowly answered renewals",
  ).toBe("renewed three times");
  await expect(
    page.getByRole("button", { name: "Cancel check", exact: true }),
  ).toBeVisible();
  await page.unrouteAll({ behavior: "ignoreErrors" });
});
test("an unconfirmed Cancel reports uncertainty and stops this workspace renewing the lease", async ({
  page,
}) => {
  await page.route("**/v2/checks/*/cancel", (route) =>
    route.fulfill({ status: 503, contentType: "application/json", body: "{}" }),
  );
  await page.goto("/");
  await page
    .getByRole("combobox", { name: /^(Language|Sprache)$/ })
    .selectOption("en");
  await page
    .getByRole("textbox")
    .fill("Doe, J. (2020). Held Reference. doi:10.5555/browser-held");
  await page
    .getByRole("button", { name: "Check reference", exact: true })
    .click();
  await page.getByRole("button", { name: "Cancel check", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("could not be confirmed");
  await expect(
    page
      .getByRole("grid", { name: "References", exact: true })
      .getByText("Cancelled", { exact: true }),
  ).toBeVisible({ timeout: e2eClientLeaseMs + 2500 });
});
