// SPDX-License-Identifier: AGPL-3.0-or-later
import { spawn, type ChildProcess } from "node:child_process";
import { once } from "node:events";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, test } from "@playwright/test";
import { abuseService } from "../../server/test/support/abuse-service.ts";
import { buildExtension } from "../../extension/e2e/support/build.ts";
import { launchChromium, until } from "../../extension/e2e/support/chromium.ts";
const apiUrl = `http://127.0.0.1:${process.env.SOURCE_TASTER_TEST_API_PORT ?? 4701}`;
const webUrl = `http://127.0.0.1:${process.env.SOURCE_TASTER_TEST_WEB_PORT ?? 5371}`;
let service: Awaited<ReturnType<typeof abuseService>>, vite: ChildProcess;
test.beforeAll(async () => {
  service = await abuseService();
  service.policy.public.origin.limit = 1;
  vite = spawn(
    process.execPath,
    [
      new URL("../node_modules/vite/bin/vite.js", import.meta.url).pathname,
      "--config",
      "abuse.vite.config.ts",
    ],
    {
      cwd: new URL("..", import.meta.url),
      env: {
        PATH: process.env.PATH,
        SOURCE_TASTER_TEST_API_PORT: process.env.SOURCE_TASTER_TEST_API_PORT,
        SOURCE_TASTER_TEST_WEB_PORT: process.env.SOURCE_TASTER_TEST_WEB_PORT,
      },
      stdio: "ignore",
    },
  );
  await until(async () => {
    try {
      return (await fetch(webUrl)).ok;
    } catch {
      return false;
    }
  }, "Vite did not start");
});
test.afterAll(async () => {
  if (vite?.exitCode === null) {
    const exited = once(vite, "exit");
    vite.kill("SIGTERM");
    await exited;
  }
  await service?.stop();
});
for (const language of ["en", "de"] as const) {
  test(`web shows the real entrance continuation time in ${language}`, async ({
    page,
  }) => {
    service.advance(60000);
    await service.request("consume");
    await page.setExtraHTTPHeaders({
      authorization: `Bearer ${service.token("web")}`,
    });
    await page.goto(webUrl);
    await page
      .getByRole("combobox", { name: /^(Language|Sprache)$/ })
      .selectOption(language);
    await page.getByRole("textbox").fill("Doe, J. (2020). A study.");
    await page
      .getByRole("button", {
        name:
          language === "en"
            ? "Structure references"
            : "Referenzen strukturieren",
        exact: true,
      })
      .click();
    const alert = page.getByRole("alert");
    await expect(alert).toContainText(
      language === "en" ? "Too many requests" : "Zu viele Anfragen",
    );
    await expect(alert.locator("time")).toHaveAttribute(
      "datetime",
      new Date(service.now() + 60000).toISOString(),
    );
    await expect(alert).toContainText(
      language === "en" ? "Continue at" : "Weiter ab",
    );
  });
  test(`native extension panel shows the same real continuation time in ${language}`, async () => {
    service.advance(60000);
    await service.request("consume");
    const build = await buildExtension("chromium", {
      SOURCE_TASTER_EXTENSION_API_URL: apiUrl,
      SOURCE_TASTER_EXTENSION_WEBSITE_URL: webUrl,
    });
    const profile = await mkdtemp(join(tmpdir(), "st100-panel-"));
    const browser = await launchChromium(
      build.outDir,
      profile,
      language === "en" ? "en-GB" : "de-DE",
    );
    try {
      const panel = await browser.openPanel();
      await panel.send("Network.setExtraHTTPHeaders", {
        headers: { authorization: `Bearer ${service.token("panel")}` },
      });
      await panel.select("combobox", /^(Language|Sprache)$/, language);
      await panel.fill("textbox", undefined, "Doe, J. (2020). A study.");
      await panel.click(
        "button",
        language === "en" ? "Structure references" : "Referenzen strukturieren",
      );
      await panel.waitForText(
        "alert",
        undefined,
        language === "en" ? "Too many requests" : "Zu viele Anfragen",
      );
      expect(
        await panel.evaluate<string>(
          "document.querySelector('[role=alert] time')?.dateTime",
        ),
      ).toBe(new Date(service.now() + 60000).toISOString());
      expect(await panel.text("alert")).toContain(
        language === "en" ? "Continue at" : "Weiter ab",
      );
    } finally {
      await browser.close();
      await rm(profile, { recursive: true, force: true });
      await build.remove();
    }
  });
}
