// SPDX-License-Identifier: AGPL-3.0-or-later
import { expect, test } from "@playwright/test";
for (const [language, announcement, withdrawal] of [
  ["en", "Planned maintenance:", "The planned maintenance has been withdrawn."],
  ["de", "Geplante Wartung:", "Die geplante Wartung wurde zurückgezogen."],
] as const) {
  test.describe(`maintenance notice ${language}`, () => {
    test.use({ locale: language });
    test("shows the content-free schedule and withdrawal in the selected language", async ({
      page,
    }) => {
      let state = "announced";
      await page.route("**/health/maintenance", (route) =>
        route.fulfill({
          json: {
            state,
            startsAt: "2026-11-07T10:00:00.000Z",
            endsAt: "2026-11-07T11:00:00.000Z",
            timeZone: "Europe/Berlin",
          },
        }),
      );
      await page.goto("/");
      await expect(
        page.getByText(announcement, { exact: false }),
      ).toBeVisible();
      await expect(
        page.getByText(announcement, { exact: false }),
      ).toContainText("Europe/Berlin");
      state = "withdrawn";
      await page.reload();
      await expect(page.getByText(withdrawal, { exact: true })).toBeVisible();
      await expect(page.getByText(announcement, { exact: false })).toHaveCount(
        0,
      );
    });
  });
}
