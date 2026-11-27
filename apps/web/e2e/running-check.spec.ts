// SPDX-License-Identifier: AGPL-3.0-or-later
// What a person sees while a Check runs: the live connection state, the step
// each running Reference reports and the warning when a cancel cannot be
// confirmed. The held DOI never finishes, so a run stays open until the test
// has asserted it. Transient states are held at the route seam, never raced.
import { expect, test, type Page } from "@playwright/test";
import { fulfillProblem, message, type Language } from "./support/catalog.ts";
import { choosePreferences, newCheck } from "./support/workspace.ts";

const held = "Doe, J. (2020). Held Reference. doi:10.5555/browser-held";

async function startHeldCheck(page: Page, language: Language) {
  await page.goto("/");
  await choosePreferences(page, { language });
  await page.getByRole("textbox").fill(held);
  await page
    .getByRole("button", {
      name: language === "en" ? "Check reference" : "Referenz prüfen",
      exact: true,
    })
    .click();
}

/** The announcement of the live connection while the Check runs. */
const announced = (page: Page, text: string) =>
  page.getByRole("status").getByText(text, { exact: true });

for (const language of ["en", "de"] as const) {
  test(`announces connecting, then connected live updates (${language})`, async ({
    page,
  }) => {
    let release!: () => void;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    await page.route("**/v2/checks/*/events", async (route) => {
      await gate;
      await route.continue();
    });
    await startHeldCheck(page, language);
    const connecting = announced(page, message(language, "shell_connecting"));
    await expect(connecting).toHaveCount(1);
    release();
    await expect(
      announced(page, message(language, "shell_connected")),
    ).toHaveCount(1);
    await expect(connecting).toHaveCount(0);
  });

  test(`shows a Reconnecting banner while the stream is down and drops it once it is back (${language})`, async ({
    page,
  }) => {
    let restored = false;
    await page.route("**/v2/checks/*/events", (route) =>
      restored ? route.continue() : route.abort("connectionfailed"),
    );
    await startHeldCheck(page, language);
    const banner = page.getByText(message(language, "shell_reconnecting"), {
      exact: true,
    });
    await expect(banner).toBeVisible();
    // The failed connection is not a Problem: no alert, no Reconnect button.
    await expect(page.getByRole("alert")).toHaveCount(0);
    restored = true;
    await expect(banner).toBeHidden();
    await expect(
      announced(page, message(language, "shell_connected")),
    ).toHaveCount(1);
  });

  test(`warns that cleanup is pending when a cancel is not confirmed (${language})`, async ({
    page,
  }) => {
    let cancels = 0;
    await page.route("**/v2/checks/*/cancel", (route) => {
      cancels++;
      return fulfillProblem(route, {
        code: "authority-unavailable",
        status: 503,
        i18nKey: "problem_authority_unavailable",
      });
    });
    await startHeldCheck(page, language);
    const cancel = page.getByRole("button", {
      name: language === "en" ? "Cancel check" : "Prüfung abbrechen",
      exact: true,
    });
    await cancel.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("alert")).toContainText(
      message(language, "check_cleanup_pending"),
    );
    expect(cancels).toBe(1);
  });

  test(`each running Reference names its step: queued, asking a source, checking (${language})`, async ({
    page,
  }) => {
    let progress = "queued";
    // The live stream would replace the step with the real one (doi.org), so
    // it stays pending: the page shows the step the Check was started with.
    await page.route("**/v2/checks/*/events", () => new Promise(() => {}));
    await page.route("**/v2/checks", async (route) => {
      if (route.request().method() !== "POST") return route.continue();
      const response = await route.fetch();
      const body = (await response.json()) as {
        data: { references: { progress: string }[] };
      };
      for (const slot of body.data.references) slot.progress = progress;
      await route.fulfill({ response, json: body });
    });
    await startHeldCheck(page, language);
    const steps = [
      ["queued", message(language, "reference_queued")],
      [
        "crossref",
        message(language, "reference_source", { source: "Crossref" }),
      ],
      ["checking", message(language, "reference_checking")],
    ] as const;
    for (const [index, [state, text]] of steps.entries()) {
      await test.step(state, async () => {
        if (index > 0) {
          progress = state;
          await newCheck(page);
          await page.getByRole("textbox").fill(held);
          await page
            .getByRole("button", {
              name: language === "en" ? "Check reference" : "Referenz prüfen",
              exact: true,
            })
            .click();
        }
        await expect(page.getByText(text, { exact: true })).toBeVisible();
      });
    }
  });
}
