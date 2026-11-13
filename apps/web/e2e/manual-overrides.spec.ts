// SPDX-License-Identifier: AGPL-3.0-or-later
import { expect, test, type Page } from "@playwright/test";
import { choosePreferences } from "./support/workspace.ts";
import AxeBuilder from "@axe-core/playwright";
import { CheckResponse } from "@source-taster/contract-verification/v2";
for (const language of ["en", "de"] as const) {
  test(`manual verdicts filter and reset while preserving historical evidence in ${language}`, async ({
    page,
  }) => {
    const en = language === "en";
    await page.setViewportSize({ width: 360, height: 780 });
    await page.goto("/");
    await choosePreferences(page, { language: language });
    await page
      .getByRole("textbox")
      .fill(
        "Aspelmeyer, M. (2009). Measured measurement. Nature Physics, 5, 11–12. https://doi.org/10.1038/nphys1170",
      );
    await page
      .getByRole("button", {
        name: en ? "Check reference" : "Referenz prüfen",
        exact: true,
      })
      .click();
    const list = page.getByRole("grid", {
      name: en ? "References" : "Referenzen",
      exact: true,
    });
    await expect(list).toContainText(en ? "Correct" : "Korrekt", {
      timeout: 15000,
    });
    await list.getByRole("button").click();
    const detail = page.getByRole("region", {
      name: en ? "Reference detail" : "Referenzdetails",
      exact: true,
    });
    await detail
      .getByRole("button", {
        name: en ? "Confirm verdict" : "Befund bestätigen",
        exact: true,
      })
      .click();
    await expect(detail).toContainText(
      en ? "Manual verdict: Correct" : "Manueller Befund: Korrekt",
    );
    await expect(detail).toContainText(
      en
        ? "Original system verdict: Correct"
        : "Ursprünglicher Systembefund: Korrekt",
    );
    await detail
      .getByRole("button", {
        name: en ? "Judge manually" : "Manuell beurteilen",
        exact: true,
      })
      .click();
    await detail
      .getByRole("radiogroup", {
        name: en ? "Manual verdict" : "Manueller Befund",
        exact: true,
      })
      .getByText(en ? "Not found" : "Nicht gefunden", { exact: true })
      .click();
    await detail
      .getByRole("button", {
        name: en ? "Save manual verdict" : "Manuellen Befund speichern",
        exact: true,
      })
      .click();
    await expect(detail).toContainText(
      en ? "Manual verdict: Not found" : "Manueller Befund: Nicht gefunden",
    );
    const summary = page.getByRole("region", {
      name: en ? "Check summary" : "Prüfungsübersicht",
      exact: true,
    });
    await detail
      .getByRole("button", {
        name: en ? "Back to references" : "Zurück zu Referenzen",
        exact: true,
      })
      .click();
    // D (#194): at 360 px the detail replaces the feed and its strip, so the
    // strip's count is read once Back has returned to the feed.
    await expect(
      summary.getByRole("button", {
        name: en ? /^Not found: 1/ : /^Nicht gefunden: 1/,
      }),
    ).toContainText(en ? "Manual: 1" : "Manuell: 1");
    await expect(list).toContainText(
      en ? "Manual verdict: Not found" : "Manueller Befund: Nicht gefunden",
    );
    const filter = summary.getByRole("button", {
      name: en ? /^Not found: 1/ : /^Nicht gefunden: 1/,
    });
    await filter.click();
    await expect(filter).toHaveAttribute("aria-pressed", "true");
    await expect(list.getByRole("row")).toHaveCount(1);
    await list.getByRole("button").click();
    // D (#194): at 360 px the open detail covers the strip, so Back returns to
    // the feed before the filter is removed.
    await detail
      .getByRole("button", {
        name: en ? "Back to references" : "Zurück zu Referenzen",
        exact: true,
      })
      .click();
    // Return to all before Re-check so the running Status stays visible.
    await summary
      .getByRole("button", {
        name: en
          ? "Remove filter: Not found"
          : "Filter entfernen: Nicht gefunden",
        exact: true,
      })
      .click();
    await list.getByRole("button").click();
    await detail
      .getByRole("button", {
        name: en ? "Re-check this reference" : "Diese Referenz erneut prüfen",
        exact: true,
      })
      .click();
    await expect(detail.getByRole("status")).toContainText(
      en ? "reset by the re-check" : "durch die erneute Prüfung zurückgesetzt",
    );
    await expect(
      detail.getByRole("button", {
        name: en ? "Confirm verdict" : "Befund bestätigen",
        exact: true,
      }),
    ).toBeVisible({ timeout: 15000 });
    await detail
      .getByText(
        en
          ? "Previous results (historical)"
          : "Frühere Ergebnisse (historisch)",
        { exact: true },
      )
      .click();
    const history = detail.getByRole("region", {
      name: en ? "Historical result" : "Historisches Ergebnis",
      exact: true,
    });
    await expect(history).toContainText(
      en ? "Manual verdict: Not found" : "Manueller Befund: Nicht gefunden",
    );
    await expect(history).toContainText(
      en
        ? "Original system verdict: Correct"
        : "Ursprünglicher Systembefund: Korrekt",
    );
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    // D (#194): the strip shows again once Back returns to the feed.
    await detail
      .getByRole("button", {
        name: en ? "Back to references" : "Zurück zu Referenzen",
        exact: true,
      })
      .click();
    await expect(
      summary.getByRole("button", { name: en ? /^Correct: 1/ : /^Korrekt: 1/ }),
    ).not.toContainText(en ? "Manual:" : "Manuell:");
  });
}
// Visually hidden text (the correction diff's "Deleted:"/"Inserted:" labels) is
// absolutely positioned. When the scrolling detail is not its containing block
// it escapes the detail's clip and adds phantom scrollable overflow to the
// page. Layout changes inside the detail then move the window scroll, and a
// press that straddles such a change is lost (manual verdict "Save" on a narrow
// viewport).
async function openManualJudgment(page: Page) {
  await page.setViewportSize({ width: 360, height: 780 });
  await page.goto("/");
  await choosePreferences(page, { language: "en" });
  await page
    .getByRole("textbox")
    .fill(
      "Aspelmeyer, M. (2009). Measured measurement. Nature Physics, 5, 11–12. https://doi.org/10.1038/nphys1170",
    );
  await page
    .getByRole("button", { name: "Check reference", exact: true })
    .click();
  const list = page.getByRole("grid", { name: "References", exact: true });
  await expect(list).toContainText("Correct", { timeout: 15000 });
  await list.getByRole("button").click();
  const detail = page.getByRole("region", {
    name: "Reference detail",
    exact: true,
  });
  await detail
    .getByRole("button", { name: "Confirm verdict", exact: true })
    .click();
  await expect(detail).toContainText("Manual verdict: Correct");
  await detail
    .getByRole("button", { name: "Judge manually", exact: true })
    .click();
  const group = detail.getByRole("radiogroup", {
    name: "Manual verdict",
    exact: true,
  });
  await expect(group).toBeVisible();
  // The scenarios are only meaningful while the hidden diff labels are present.
  await expect(detail.locator(".sr-only").first()).toBeAttached();
  return { detail, group };
}
test("the scrolling reference detail does not extend the page's scroll range", async ({
  page,
}) => {
  await openManualJudgment(page);
  const range = () =>
    page.evaluate(() => ({
      document: document.documentElement.scrollHeight,
      app: Math.ceil(
        document.getElementById("root")!.getBoundingClientRect().bottom +
          scrollY,
      ),
    }));
  await expect
    .poll(async () => (await range()).document)
    .toBeLessThanOrEqual((await range()).app);
});
test("a layout change in the detail during a Save press does not lose the press", async ({
  page,
}) => {
  const { detail, group } = await openManualJudgment(page);
  await group.getByText("Not found", { exact: true }).click();
  const save = detail.getByRole("button", {
    name: "Save manual verdict",
    exact: true,
  });
  await save.scrollIntoViewIfNeeded();
  // The press must not depend on where the page happened to come to rest. Put
  // the window where it only sometimes rests: Save fully in view, the detail
  // running on past the bottom edge.
  // D (#194): at 360 px the detail is no scroller of its own; the window is
  // the only one, so it anchors inside the detail. D's lower detail (sources,
  // Candidates, trail) runs on well past Save, so Save is centred in the
  // window; anchoring on the detail's end would push Save under the sticky
  // detail head.
  await page.evaluate(() => {
    const save = [...document.querySelectorAll(".check-detail button")]
      .find((b) => b.textContent?.trim() === "Save manual verdict")!
      .getBoundingClientRect();
    scrollTo(0, scrollY + save.top + save.height / 2 - innerHeight / 2);
  });
  const placement = await page.evaluate(() => {
    const pane = document
      .querySelector(".check-detail")!
      .getBoundingClientRect();
    const button = [...document.querySelectorAll(".check-detail button")]
      .find((b) => b.textContent?.trim() === "Save manual verdict")!
      .getBoundingClientRect();
    const hit = document.elementFromPoint(
      (button.left + button.right) / 2,
      (button.top + button.bottom) / 2,
    );
    return {
      clear: !!hit
        ?.closest("button")
        ?.textContent?.includes("Save manual verdict"),
      paneBottom: pane.bottom,
      buttonTop: button.top,
      buttonBottom: button.bottom,
      viewport: innerHeight,
      scrollMax: document.documentElement.scrollHeight - innerHeight,
      scrollY,
    };
  });
  expect(
    placement.paneBottom,
    "the detail runs past the viewport",
  ).toBeGreaterThan(placement.viewport);
  expect(placement.buttonTop, "Save is fully in view").toBeGreaterThan(0);
  expect(placement.clear, "nothing sticky covers Save").toBe(true);
  expect(placement.buttonBottom, "Save is fully in view").toBeLessThan(
    placement.viewport,
  );
  expect(placement.scrollY, "the window is not at its maximum").toBeLessThan(
    placement.scrollMax,
  );
  const before = (await save.boundingBox())!;
  const scrollBefore = placement.scrollY;
  await page.mouse.move(
    before.x + before.width / 2,
    before.y + before.height / 2,
  );
  await page.mouse.down();
  // Late content above the pressed control, as when suggestions render while
  // the pointer is down.
  await page.evaluate(() => {
    const block = document.createElement("div");
    block.style.height = "300px";
    const detail = document.querySelector(".check-detail")!;
    detail.insertBefore(block, detail.firstElementChild);
  });
  // The control stays under the pointer until the press ends. Its centre is
  // compared, because the press motion scales the box around that centre.
  const pressed = (await save.boundingBox())!;
  expect(
    {
      x: pressed.x + pressed.width / 2,
      y: pressed.y + pressed.height / 2,
    },
    "Save did not move under the pointer",
  ).toEqual({
    x: expect.closeTo(before.x + before.width / 2, 0),
    y: expect.closeTo(before.y + before.height / 2, 0),
  });
  // With one scroller there is one compensation: the window moves by exactly
  // the inserted height while the pointer is down, never twice or not at all.
  // (Before D the detail was the scroller, so the window had to stay put.)
  expect(
    (await page.evaluate(() => scrollY)) - scrollBefore,
    "the window compensated once for the late content during the press",
  ).toBe(300);
  await page.mouse.up();
  await expect(detail).toContainText("Manual verdict: Not found");
});
test("a manual draft cannot silently move to a newer same-revision result", async ({
  page,
}) => {
  await page.goto("/");
  await choosePreferences(page, { language: "en" });
  const apiPort = process.env.SOURCE_TASTER_E2E_API_PORT ?? "3102";
  let checkId = "";
  page.on("response", async (response) => {
    if (
      response.request().method() === "POST" &&
      /\/v2\/checks$/.test(response.url()) &&
      response.status() === 201
    )
      checkId = CheckResponse.parse(await response.json()).data.id;
  });
  await page
    .getByRole("textbox")
    .fill(
      "Aspelmeyer, M. (2009). Measured measurement. Nature Physics, 5, 11–12. https://doi.org/10.1038/nphys1170",
    );
  await page
    .getByRole("button", { name: "Check reference", exact: true })
    .click();
  const list = page.getByRole("grid", { name: "References", exact: true });
  await expect(list).toContainText("Correct", { timeout: 15000 });
  await list.getByRole("button").click();
  const detail = page.getByRole("region", {
    name: "Reference detail",
    exact: true,
  });
  await detail
    .getByRole("button", { name: "Judge manually", exact: true })
    .click();
  await detail
    .getByRole("radiogroup", { name: "Manual verdict", exact: true })
    .getByText("Not found", { exact: true })
    .click();
  const url = `http://127.0.0.1:${apiPort}/v2/checks/${checkId}`;
  // Another client runs the same field revision, producing a different immutable result ID.
  expect(
    (
      await page.request.post(`${url}/references/1/recheck`, {
        data: { expectedRevision: 1 },
      })
    ).status(),
  ).toBe(200);
  const snapshot = async () =>
    CheckResponse.parse(await (await page.request.get(url)).json()).data;
  await expect
    .poll(async () => (await snapshot()).references[0]!.results.length)
    .toBe(2);
  await detail
    .getByRole("button", { name: "Save manual verdict", exact: true })
    .click();
  await expect(detail.getByRole("alert")).toContainText("changed");
  await expect(detail).not.toContainText("Manual verdict: Not found");
  const [reference] = (await snapshot()).references;
  expect(reference!.manualOverride).toBeNull();
  expect(
    reference!.results.every((result) => result.manualOverride === null),
  ).toBe(true);
});
