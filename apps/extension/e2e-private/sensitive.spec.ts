// SPDX-License-Identifier: AGPL-3.0-or-later
import { test, expect } from "@playwright/test";
import { readFile, writeFile } from "node:fs/promises";
import { buildExtension } from "../e2e/support/build.ts";
import { launchChromium } from "../e2e/support/chromium.ts";
import { bothPrograms } from "../../server/test/support/both-programs.ts";

test("native panel deletes through actual captured-mail proof and defers Guest Quota until Start", async () => {
  const b = await bothPrograms({ accounts: true, startWorker: false });
  let build: Awaited<ReturnType<typeof buildExtension>> | undefined;
  let browser: Awaited<ReturnType<typeof launchChromium>> | undefined;
  try {
    build = await buildExtension("chromium", {
      SOURCE_TASTER_EXTENSION_MODE: "hosted",
      SOURCE_TASTER_EXTENSION_API_URL: b.apiUrl,
      SOURCE_TASTER_EXTENSION_SERVICE_URL: b.serviceUrl,
      SOURCE_TASTER_EXTENSION_WEBSITE_URL: b.apiUrl,
      SOURCE_TASTER_EXTENSION_ACCOUNT_SIGN_IN: "enabled",
      SOURCE_TASTER_EXTENSION_SENSITIVE_ACCOUNT_ACTIONS: "enabled",
    });
    browser = await launchChromium(build.outDir, "");
    const config = JSON.parse(
      await readFile(b.accountConfigPath, "utf8"),
    ) as object;
    await writeFile(
      b.accountConfigPath,
      JSON.stringify({ ...config, extensionOrigins: [browser.origin] }),
    );
    b.serviceConfig.allowedOrigins = [
      browser.origin,
      "https://web.test.invalid",
    ];
    await writeFile(b.serviceConfigPath, JSON.stringify(b.serviceConfig));
    await b.restartService();
    const panel = await browser.openPanel();
    await panel.waitForText("main", undefined, "20 of 20 checks left");
    const code = async () =>
      (await b.mail()).at(-1)!.text.match(/\b[0-9]{6}\b/)![0];
    await panel.click("button", "Sign in");
    await panel.fill(
      "textbox",
      "Email address",
      "native-delete@example.invalid",
    );
    await panel.click("button", "Send code");
    await panel.find("textbox", "Six-digit code");
    await panel.fill("textbox", "Six-digit code", await code());
    await panel.click("button", "Confirm code");
    await panel.find("button", "Sign out here");
    const guestId = (await browser.storage())["source-taster-guest-id-v1"];
    await panel.click("button", "Delete Account");
    await panel.click("button", "Send confirmation code");
    await panel.find("textbox", "Six-digit code");
    await panel.fill("textbox", "Six-digit code", await code());
    await panel.click("button", "Confirm");
    await panel.click("checkbox", /billing records are kept for eight years/);
    const before = panel.requests.length;
    await panel.click("button", "Delete Account permanently");
    await panel.waitForText("main", undefined, "Your Account was deleted");
    expect(
      (await browser.storage())["source-taster-extension-session-v1"],
    ).toBeUndefined();
    expect(
      (await browser.storage())["source-taster-guest-preferences-v1"],
    ).toBeUndefined();
    expect((await browser.storage())["source-taster-guest-id-v1"]).toBe(
      guestId,
    );
    expect(
      panel.requests
        .slice(before)
        .filter((r) => /guest-tokens|\/v2\/quota/.test(r.url)),
    ).toEqual([]);
    await panel.fill("textbox", "Reference", "Planck 1901");
    await panel.click("button", "Check Reference");
    await expect
      .poll(
        () =>
          panel.requests.slice(before).filter((r) => /\/v2\/quota/.test(r.url))
            .length,
      )
      .toBe(1);
    expect((await browser.storage())["source-taster-guest-id-v1"]).toBe(
      guestId,
    );
    panel.detach();
  } finally {
    await browser?.close();
    await build?.remove();
    await b.stop();
  }
});
