// SPDX-License-Identifier: AGPL-3.0-or-later
// Firefox smoke: the real toolbar button opens the real sidebar, which completes
// a standalone Check against the actual API. Not the whole Firefox gate.
import { expect, test } from "@playwright/test";
import { buildExtension } from "../e2e/support/build.ts";
import { until } from "../e2e/support/chromium.ts";
import { evidence } from "../e2e/support/evidence.ts";
import { launchFirefox, type NativeFirefox } from "../e2e/support/firefox.ts";
import { standaloneConfig } from "../e2e/support/standalone.ts";
import { labels, witnesses } from "../e2e/support/workspace.ts";

let build: Awaited<ReturnType<typeof buildExtension>>;
test.beforeAll(async () => {
  build = await buildExtension("firefox", standaloneConfig);
});
test.afterAll(async () => {
  await build?.remove();
});

const panelUrl = /^moz-extension:\/\/[0-9a-f-]{36}\/panel\.html$/;
async function opened(firefox: NativeFirefox, open: boolean) {
  return until(
    async () => {
      const sidebar = await firefox.sidebar();
      return (
        sidebar.open === open &&
        (!open || panelUrl.test(sidebar.url ?? "")) &&
        sidebar
      );
    },
    `The sidebar did not ${open ? "open" : "close"}`,
  );
}

test("the toolbar button opens the real Firefox sidebar, which checks a Reference against the actual API", async () => {
  const firefox = await launchFirefox(build.outDir);
  try {
    test.info().annotations.push({
      type: "browser",
      description: `Firefox ${firefox.version}`,
    });
    await firefox.clickToolbarButton();
    await opened(firefox, true);
    const witness = witnesses[0]!;
    const l = labels.en;
    await firefox.click(await firefox.find("entry", l.input));
    await firefox.type(witness.text);
    // Key events reach the extension process asynchronously.
    await until(
      async () => (await firefox.find("entry", l.input)).value === witness.text,
      "The typed Reference did not arrive in the sidebar",
    );
    await firefox.click(await firefox.find("pushbutton", l.check));
    const detail = await until(
      async () => {
        const text = await firefox.text("region", l.detail);
        if (text.includes(witness.marker) && text.includes(l[witness.verdict]))
          return text;
        const open = (await firefox.tree()).find(
          (n) => n.role === "pushbutton" && l.open.test(n.name),
        );
        if (open)
          await firefox.click(await firefox.find("pushbutton", open.name));
        return false;
      },
      `${witness.name} never showed its outcome in the sidebar`,
      30_000,
    );
    expect(detail).toContain(witness.marker);
    // Scores sit in the evidence disclosure, opened as a user would.
    const summary = (await firefox.tree()).find(
      (n) => n.name === l.evidence && n.role !== "text leaf",
    )!;
    await firefox.click(await firefox.find(summary.role, l.evidence));
    const evidenced = await until(async () => {
      const text = await firefox.text("region", l.detail);
      return witness.scores.every((score) => text.includes(score)) && text;
    }, "The evidence disclosure did not show the server Scores");
    expect(evidenced).toContain(l[witness.verdict]);
    await firefox.find("pushbutton", "Back to References");
    await firefox.screenshot(evidence("firefox-sidebar-check.png"));

    // The same button closes the sidebar; reopening starts with empty input.
    await firefox.clickToolbarButton();
    await opened(firefox, false);
    await firefox.clickToolbarButton();
    await opened(firefox, true);
    expect((await firefox.find("entry", l.input)).value).toBe("");
    expect(await firefox.text("region", l.detail)).toBe("");
  } finally {
    await firefox.close();
  }
});
