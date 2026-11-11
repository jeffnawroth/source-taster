import { openPanelAccount } from "../e2e/support/account-entry.ts";
// SPDX-License-Identifier: AGPL-3.0-or-later
import { test, expect } from "@playwright/test";
import { mkdtemp, readFile, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { buildExtension } from "../e2e/support/build.ts";
import { launchChromium, until } from "../e2e/support/chromium.ts";
import { bothPrograms } from "../../server/test/support/both-programs.ts";

test("signed-in native panel opens actual web Plan management without forwarding its credential", async () => {
  const b = await bothPrograms({ accounts: true });
  const profile = await mkdtemp(join(tmpdir(), "st107-native-"));
  let build: Awaited<ReturnType<typeof buildExtension>> | undefined;
  let browser: Awaited<ReturnType<typeof launchChromium>> | undefined;
  try {
    build = await buildExtension("chromium", {
      SOURCE_TASTER_EXTENSION_MODE: "hosted",
      SOURCE_TASTER_EXTENSION_API_URL: b.apiUrl,
      SOURCE_TASTER_EXTENSION_SERVICE_URL: b.serviceUrl,
      SOURCE_TASTER_EXTENSION_WEBSITE_URL: b.apiUrl,
      SOURCE_TASTER_EXTENSION_ACCOUNT_SIGN_IN: "enabled",
    });
    browser = await launchChromium(build.outDir, profile);
    const config = JSON.parse(
      await readFile(b.accountConfigPath, "utf8"),
    ) as Record<string, unknown>;
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
    await panel.click("button", "Sign in");
    await panel.fill(
      "textbox",
      "Email address",
      "native-commerce@example.invalid",
    );
    await panel.click("button", "Send code");
    const code = await until(
      async () => (await b.mail()).at(-1)?.text.match(/\b[0-9]{6}\b/)?.[0],
      "Captured sign-in code did not arrive",
    );
    await panel.fill("textbox", "Six-digit code", code);
    await panel.click("button", "Confirm code");
    await openPanelAccount(panel);
    await panel.find("button", "Sign out here");
    expect(
      (await browser.storage())["source-taster-extension-session-v1"],
    ).toBeTruthy();
    const label = "Plans and check packs on the web";
    const link = await panel.find("link", label);
    expect(
      await panel.call(
        link,
        "function() { return {href:this.href,target:this.target,rel:this.rel}; }",
      ),
    ).toMatchObject({
      href: `${b.serviceUrl}/plan?language=en`,
      target: "_blank",
      rel: "noopener noreferrer",
    });
    const requests: Record<string, string>[] = [];
    browser.context.on("request", (request) => {
      if (
        request.isNavigationRequest() &&
        request.url() === `${b.serviceUrl}/plan?language=en`
      )
        requests.push(request.headers());
    });
    const opened = browser.context.waitForEvent("page");
    await panel.click("link", label);
    const page = await opened;
    await page.waitForURL(`${b.serviceUrl}/plan?language=en`);
    await expect(
      page.getByRole("heading", { name: "Monthly Pro", exact: true }),
    ).toBeVisible();
    expect(requests).toHaveLength(1);
    expect(requests[0]?.authorization).toBeUndefined();
    expect(requests[0]?.cookie).toBeUndefined();
    expect(
      panel.requests.filter((request) => request.url.includes("/v1/commerce")),
    ).toEqual([]);
    test.info().annotations.push({
      type: "browser",
      description: `${browser.version}; actual programs; commerce remains configuration-gated`,
    });
  } finally {
    await browser?.close();
    await build?.remove();
    await rm(profile, { recursive: true, force: true });
    await b.stop();
  }
});
