// SPDX-License-Identifier: AGPL-3.0-or-later
import type { Page } from "@playwright/test";
const more = (page: Page) =>
  page
    .getByRole("button", { name: /^(More actions|Weitere Aktionen)$/ })
    .click();
const sourceMore = (page: Page) => page.locator('[data-k="menubtn"]').click();
/** Product Verdict to D's fixture key (fixtures.ts projects the same mapping). */
const sourceVerdict: Record<string, string> = {
  correct: "correct",
  "exists-with-deviations": "deviations",
  "mixed-citation": "mixed",
  "doi-conflict": "doi-conflict",
  "not-found": "not-found",
  "not-verifiable": "not-verifiable",
};
// The built side runs first; the source then filters by the same Verdict.
let filtered: string | undefined;
/** A driver without a Playwright page (the native panel) records it here. */
export function recordFiltered(verdict: string | undefined) {
  filtered = verdict;
}
export const interactions: {
  id: string;
  builtStage: "done" | "detail";
  sourceStage: "done" | "detail";
  /** Restricts the interaction to one frame where the source offers it. */
  frame?: "web" | "360";
  built: (page: Page) => Promise<void>;
  prototype: (page: Page) => Promise<void>;
  /** Element both sides scroll to the viewport centre before capture. */
  centre?: { built: string; prototype: string };
}[] = [
  {
    id: "filter",
    builtStage: "done",
    sourceStage: "done",
    built: async (page) => {
      filtered = undefined;
      const counter = page
        .locator(
          ".summary-section button.summary-counter[data-verdict]:not([disabled])",
        )
        .first();
      filtered = (await counter.getAttribute("data-verdict")) ?? undefined;
      await counter.click();
    },
    prototype: async (page) => {
      const key = filtered && sourceVerdict[filtered];
      if (!key) throw new Error("Built filter Verdict was not recorded");
      await page.locator(`.v-D [data-act="filter:${key}"]`).first().click();
    },
  },
  {
    id: "labels",
    builtStage: "done",
    sourceStage: "done",
    frame: "360",
    built: async (page) => {
      await more(page);
      await page
        .getByRole("menuitem", {
          name: /^(Show all labels|Alle Labels zeigen)$/,
        })
        .click();
    },
    prototype: async (page) => {
      await sourceMore(page);
      await page.locator('.menu [data-act="labels"]').click();
    },
  },
  {
    id: "report",
    builtStage: "done",
    sourceStage: "done",
    built: async (page) => {
      await more(page);
      await page
        .getByRole("menuitem", { name: /^(PDF report|PDF-Bericht)$/ })
        .click();
    },
    prototype: async (page) => {
      await sourceMore(page);
      await page.locator('[data-act="dlg:report"]').click();
    },
  },
  {
    id: "reset",
    builtStage: "done",
    sourceStage: "done",
    built: async (page) => {
      await more(page);
      await page
        .getByRole("menuitem", { name: /^(Reset|Zurücksetzen)$/ })
        .click();
    },
    prototype: async (page) => {
      await sourceMore(page);
      await page.locator('.menu [data-act="reset"]').click();
    },
  },
  {
    id: "edit-list",
    builtStage: "done",
    sourceStage: "done",
    built: async (page) => {
      await more(page);
      await page
        .getByRole("menuitem", {
          name: /^(Edit reference list|Referenzliste bearbeiten)$/,
        })
        .click();
    },
    prototype: async (page) => {
      await sourceMore(page);
      await page.locator('[data-act="dlg:editlist"]').click();
    },
  },
  {
    id: "detail-edit",
    builtStage: "detail",
    sourceStage: "detail",
    built: async (page) => {
      await page
        .getByRole("button", { name: /^(Edit fields|Felder bearbeiten)$/ })
        .first()
        .click();
    },
    prototype: async (page) => {
      await page.locator('.v-D .detail [data-act^="edit:"]').first().click();
    },
  },
  {
    id: "detail-manual",
    builtStage: "detail",
    sourceStage: "detail",
    // D re-renders on the click and restores its remembered scroll offset,
    // so its form opens below the fold; the built form stays where it was
    // clicked. After normalisation both sides centre the opened choice grid.
    centre: {
      built: ".check-detail .manual-verdict-grid",
      prototype: ".v-D .detail .jg",
    },
    built: async (page) => {
      await page
        .getByRole("button", { name: /^(Judge manually|Manuell beurteilen)$/ })
        .click();
    },
    prototype: async (page) => {
      await page.locator('.v-D .detail [data-act^="judge:"]').click();
    },
  },
  {
    id: "menu-hover",
    builtStage: "done",
    sourceStage: "done",
    built: async (page) => {
      await more(page);
      await page
        .getByRole("menuitem", { name: /^(Export|Exportieren)$/ })
        .hover();
    },
    prototype: async (page) => {
      await sourceMore(page);
      await page.locator('[data-act="dlg:export"]').hover();
    },
  },
];
