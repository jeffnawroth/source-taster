// SPDX-License-Identifier: AGPL-3.0-or-later
import { test, expect } from "@playwright/test";
import { mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { buildExtension } from "../e2e/support/build.ts";
import { launchChromium, until, type Panel } from "../e2e/support/chromium.ts";
import { bothPrograms, allowOrigins } from "../e2e/support/hosted.ts";
import { physicsReference } from "../../server/test/support/doi-fixtures.ts";
async function expectGuestQuota(panel: Panel, remaining: number) {
  await panel.click("button", "Account: Guest");
  await until(
    async () => {
      const value = await panel.call<{ remaining: string; granted: string }>(
        await panel.find("meter", /^quota$/i),
        "function () { return { remaining: this.getAttribute('aria-valuenow'), granted: this.getAttribute('aria-valuemax') }; }",
      );
      return value.remaining === String(remaining) && value.granted === "20";
    },
    `Guest Quota did not settle at ${remaining} of 20`,
    30000,
  );
  for (const type of ["keyDown", "keyUp"])
    await panel.send("Input.dispatchKeyEvent", {
      type,
      key: "Escape",
      code: "Escape",
      windowsVirtualKeyCode: 27,
    });
  await panel.gone("dialog", "Account");
}
test("native panel shows real Guest Quota and persisted consumption after reopening", async () => {
  const b = await bothPrograms({ accounts: true });
  const profile = await mkdtemp(join(tmpdir(), "st100-quota-"));
  const build = await buildExtension("chromium", {
    SOURCE_TASTER_EXTENSION_MODE: "hosted",
    SOURCE_TASTER_EXTENSION_API_URL: b.apiUrl,
    SOURCE_TASTER_EXTENSION_SERVICE_URL: b.serviceUrl,
    SOURCE_TASTER_EXTENSION_WEBSITE_URL: b.apiUrl,
    SOURCE_TASTER_EXTENSION_ACCOUNT_SIGN_IN: "enabled",
  });
  let browser = await launchChromium(build.outDir, profile);
  try {
    await allowOrigins(b, [browser.origin]);
    let panel = await browser.openPanel();
    await expectGuestQuota(panel, 20);
    await panel.fill("textbox", /^(Reference|Referenz)$/, physicsReference);
    await panel.click("button", "Check reference");
    await expectGuestQuota(panel, 19);
    const guestId = (await browser.storage())["source-taster-guest-id-v1"];
    expect(guestId).toBeTruthy();
    panel.detach();
    await browser.close();
    browser = await launchChromium(build.outDir, profile);
    panel = await browser.openPanel();
    await expectGuestQuota(panel, 19);
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
