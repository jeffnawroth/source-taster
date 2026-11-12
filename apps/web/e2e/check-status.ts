// SPDX-License-Identifier: AGPL-3.0-or-later
import type { Page } from "@playwright/test";

/** The Check status region, named by the "Your check" heading. */
export const checkStatus = (page: Page, language: "en" | "de" = "en") =>
  page.getByRole("status", {
    name: language === "en" ? "Your check" : "Ihre Prüfung",
    exact: true,
  });
