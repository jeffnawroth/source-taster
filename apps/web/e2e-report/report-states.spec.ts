// SPDX-License-Identifier: AGPL-3.0-or-later
// The report Dialog's states and failures. The real server (with the fake
// report grant of this config) runs the Check and grants the feature; the
// report jobs are answered at the route seam, because a failed, cancelled or
// expired report cannot be produced on demand from the local services.
import { expect, test, type Page, type Route } from "@playwright/test";
import {
  fulfillProblem,
  message,
  type Language,
} from "../e2e/support/catalog.ts";
import { choosePreferences, openReport } from "../e2e/support/workspace.ts";

const reference =
  "Aspelmeyer, M. (2008). Measured measurement. Nature Physics, 5, 11–12. https://doi.org/10.1038/nphys1170";
const checkId = "11111111-1111-4111-8111-111111111111";
const reportId = "22222222-2222-4222-8222-222222222222";

type State = "queued" | "generating" | "ready" | "failed" | "cancelled";
function report(
  language: Language,
  state: State,
  failure?: "unsupported-character" | "limit-exceeded" | "unavailable",
) {
  return {
    quota: null,
    data: {
      id: reportId,
      checkId,
      language,
      state,
      ...(failure ? { failure } : {}),
      expiresAt: new Date(Date.now() + 15 * 60_000).toISOString(),
    },
  };
}

async function openReportDialog(page: Page, language: Language) {
  await page.goto("/");
  await choosePreferences(page, { language });
  await page.getByRole("textbox").fill(reference);
  await page
    .getByRole("button", {
      name: language === "en" ? "Check reference" : "Referenz prüfen",
      exact: true,
    })
    .click();
  const dialog = await openReport(page);
  const region = dialog.getByRole("region", {
    name: message(language, "report_ui_heading"),
    exact: true,
  });
  await expect(
    region.getByRole("button", {
      name: message(language, "report_ui_create"),
      exact: true,
    }),
  ).toBeVisible({ timeout: 20_000 });
  return region;
}

for (const language of ["en", "de"] as const) {
  test(`shows working, cancelled, ready and expired report states (${language})`, async ({
    page,
  }) => {
    let create: (route: Route) => Promise<void> | void = () => undefined;
    await page.route("**/v2/checks/*/reports", (route) =>
      route.request().method() === "POST" ? create(route) : route.continue(),
    );
    // A job that never finishes, until it is cancelled.
    await page.route("**/v2/checks/*/reports/*", (route) => {
      const method = route.request().method();
      if (method === "DELETE")
        return route.fulfill({ json: report(language, "cancelled") });
      return route.fulfill({ json: report(language, "generating") });
    });
    const region = await openReportDialog(page, language);
    const status = region.getByRole("status");
    const createButton = region.getByRole("button", {
      name: message(language, "report_ui_create"),
      exact: true,
    });

    await test.step("working, then cancelled", async () => {
      create = (route) =>
        route.fulfill({ status: 202, json: report(language, "queued") });
      await createButton.click();
      await expect(status).toHaveText(message(language, "report_ui_working"));
      await expect(createButton).toBeDisabled();
      await region
        .getByRole("button", {
          name: message(language, "report_ui_cancel"),
          exact: true,
        })
        .click();
      await expect(status).toHaveText(message(language, "report_ui_cancelled"));
      await expect(createButton).toBeEnabled();
    });

    await test.step("ready, then expired when the file is gone", async () => {
      create = (route) =>
        route.fulfill({ status: 201, json: report(language, "ready") });
      await page.route("**/v2/checks/*/reports/*/file", (route) =>
        fulfillProblem(route, {
          code: "report-expired",
          status: 410,
          i18nKey: "problem_report_expired",
        }),
      );
      await createButton.click();
      const [ready] = message(language, "report_ui_ready", {
        time: "\u0000",
      }).split("\u0000");
      await expect(status).toContainText(ready!.trim());
      await region
        .getByRole("button", {
          name: message(language, "report_ui_download"),
          exact: true,
        })
        .click();
      await expect(status).toHaveText(message(language, "report_ui_expired"));
    });
  });

  for (const [failure, key] of [
    ["unsupported-character", "report_ui_failed_unsupported"],
    ["limit-exceeded", "report_ui_failed_limit"],
    ["unavailable", "report_ui_failed_unavailable"],
  ] as const)
    test(`states why a report failed: ${failure} (${language})`, async ({
      page,
    }) => {
      await page.route("**/v2/checks/*/reports", (route) =>
        route.request().method() === "POST"
          ? route.fulfill({
              status: 201,
              json: report(language, "failed", failure),
            })
          : route.continue(),
      );
      const region = await openReportDialog(page, language);
      await region
        .getByRole("button", {
          name: message(language, "report_ui_create"),
          exact: true,
        })
        .click();
      await expect(region.getByRole("status")).toHaveText(
        message(language, key),
      );
      await expect(
        region.getByRole("button", {
          name: message(language, "report_ui_download"),
        }),
      ).toHaveCount(0);
    });

  // The Dialog maps a refused request to a person-readable state; the
  // server's own report problem keys are not rendered here.
  for (const [code, status, key, text] of [
    ["report-not-found", 404, "problem_report_not_found", "report_ui_expired"],
    ["report-expired", 410, "problem_report_expired", "report_ui_expired"],
    ["report-busy", 409, "problem_report_busy", "report_ui_error"],
    ["report-not-ready", 409, "problem_report_not_ready", "report_ui_error"],
    [
      "feature-unavailable",
      403,
      "problem_feature_unavailable",
      "report_ui_unavailable",
    ],
    ["internal", 500, "problem_internal", "report_ui_error"],
  ] as const)
    test(`a refused report request reads as ${text}: ${code} (${language})`, async ({
      page,
    }) => {
      await page.route("**/v2/checks/*/reports", (route) =>
        route.request().method() === "POST"
          ? fulfillProblem(route, { code, status, i18nKey: key })
          : route.continue(),
      );
      const region = await openReportDialog(page, language);
      await region
        .getByRole("button", {
          name: message(language, "report_ui_create"),
          exact: true,
        })
        .click();
      await expect(region.getByRole("status")).toHaveText(
        message(language, text),
      );
    });
}
