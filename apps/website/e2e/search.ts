// SPDX-License-Identifier: AGPL-3.0-or-later
import type { Page } from "@playwright/test";

export async function openDocumentationSearch(page: Page) {
  await page
    .getByRole("button", {
      name: /^(Search documentation|Dokumentation durchsuchen)$/,
    })
    .first()
    .click();
}
