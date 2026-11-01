// SPDX-License-Identifier: AGPL-3.0-or-later
import { test, expect } from "@playwright/test";
import { mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { buildExtension } from "../e2e/support/build.ts";
import { launchChromium } from "../e2e/support/chromium.ts";
import { bothPrograms, allowOrigins } from "../e2e/support/hosted.ts";
import { physicsReference } from "../../server/test/support/doi-fixtures.ts";
test("native panel shows real Guest Quota and persisted consumption after reopening", async () => {
  const b = await bothPrograms();
  const profile = await mkdtemp(join(tmpdir(), "st100-quota-"));
  const build = await buildExtension("chromium", {
    SOURCE_TASTER_EXTENSION_MODE: "hosted",
    SOURCE_TASTER_EXTENSION_API_URL: b.apiUrl,
    SOURCE_TASTER_EXTENSION_SERVICE_URL: b.serviceUrl,
    SOURCE_TASTER_EXTENSION_WEBSITE_URL: b.apiUrl,
  });
  const browser = await launchChromium(build.outDir, profile);
  try {
    await allowOrigins(b, [browser.origin]);
    let panel = await browser.openPanel();
    await panel.waitForText("main", undefined, "20 of 20 checks left");
    await panel.fill("textbox", /^(Reference|Referenz)$/, physicsReference);
    await panel.click("button", "Check Reference");
    await panel.waitForText("main", undefined, "19 of 20 checks left", 30000);
    const guestId = (await browser.storage())["source-taster-guest-id-v1"];
    expect(guestId).toBeTruthy();
    panel.detach();
    panel = await browser.openPanel();
    await panel.waitForText("main", undefined, "19 of 20 checks left");
    expect((await browser.storage())["source-taster-guest-id-v1"]).toBe(
      guestId,
    );
    panel.detach();
  } finally {
    await browser.close();
    await build.remove();
    await rm(profile, { recursive: true, force: true });
    await b.stop();
  }
});
