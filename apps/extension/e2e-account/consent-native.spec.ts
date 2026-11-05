// SPDX-License-Identifier: AGPL-3.0-or-later
// Native Firefox: the real sidebar, the real optional data collection prompt
// and the browser's own permission store. Only the private session service is
// replaced at its HTTP edge. A Firefox profile starts with no grant.
import { expect, test } from "@playwright/test";
import { buildExtension } from "../e2e/support/build.ts";
import { until } from "../e2e/support/chromium.ts";
import { launchFirefox, type NativeFirefox } from "../e2e/support/firefox.ts";
import { startService } from "../e2e/support/preference-service.ts";

const dataType = "technicalAndInteraction";

async function signedInFirefox() {
  const service = await startService();
  const build = await buildExtension("firefox", {
    SOURCE_TASTER_EXTENSION_MODE: "hosted",
    SOURCE_TASTER_EXTENSION_SERVICE_URL: service.url,
    SOURCE_TASTER_EXTENSION_ACCOUNT_SIGN_IN: "enabled",
  });
  const firefox = await launchFirefox(build.outDir);
  try {
    test.info().annotations.push({
      type: "browser",
      description: `Firefox ${firefox.version}`,
    });
    await firefox.clickToolbarButton();
    await until(async () => {
      const sidebar = await firefox.sidebar();
      return sidebar.open && sidebar.url;
    }, "Firefox sidebar did not open");
    await firefox.click(await firefox.find("pushbutton", "Sign in"));
    await firefox.click(await firefox.find("entry", "Email address"));
    await firefox.type("reader@example.org");
    await firefox.click(await firefox.find("pushbutton", "Send code"));
    await firefox.click(await firefox.find("entry", "Six-digit code"));
    await firefox.type("123456");
    await firefox.click(await firefox.find("pushbutton", "Confirm code"));
    await firefox.find("pushbutton", "Sign out here");
  } catch (error) {
    await firefox.close();
    await build.remove();
    await service.close();
    throw error;
  }
  return {
    firefox,
    service,
    close: async () => {
      await firefox.close();
      await build.remove();
      await service.close();
    },
  };
}

/** Waits for visible text in the sidebar's accessible tree. */
const sees = (firefox: NativeFirefox, text: RegExp) =>
  until(
    async () =>
      (await firefox.tree()).some(
        (node) => node.role === "text leaf" && text.test(node.name),
      ),
    `The sidebar does not show ${String(text)}`,
  );

const allow = (firefox: NativeFirefox) =>
  firefox.find("pushbutton", "Allow Preferences sync");

test("a fresh profile keeps Preferences local, and the visible control opens the real prompt", async () => {
  const { firefox, service, close } = await signedInFirefox();
  try {
    expect(await firefox.grantedDataCollection()).toEqual([]);
    const confirm = service.requests.find(
      (r) => r.path === "/v1/extension/sign-in/confirm",
    );
    expect(Object.keys(confirm!.body as object)).not.toContain("preferences");
    expect(service.preferenceRequests()).toEqual([]);

    // Denying the browser's prompt leaves sync off and the control in place.
    await firefox.click(await allow(firefox));
    await firefox.answerPermissionPrompt(false);
    await sees(firefox, /was not allowed/);
    expect(await firefox.grantedDataCollection()).toEqual([]);
    expect(service.preferenceRequests()).toEqual([]);
  } finally {
    await close();
  }
});

test("allowing the prompt starts sync, and withdrawing the grant in Firefox's permission store stops it", async () => {
  const { firefox, service, close } = await signedInFirefox();
  try {
    await firefox.click(await allow(firefox));
    await firefox.answerPermissionPrompt(true);
    await until(
      () => service.preferenceRequests().length > 0,
      "No Preferences request after the grant",
    );
    expect(await firefox.grantedDataCollection()).toEqual([dataType]);
    expect(service.preferenceRequests().map((r) => r.method)).toEqual(["GET"]);
    await sees(firefox, /Preferences sync is on/);

    // Revocation: the control returns and nothing further is sent.
    await firefox.revokeDataCollection(dataType);
    await allow(firefox);
    expect(await firefox.grantedDataCollection()).toEqual([]);
    const sent = service.requests.length;
    await firefox.clickToolbarButton();
    await firefox.clickToolbarButton();
    await allow(firefox);
    expect(
      service.requests
        .slice(sent)
        .filter((r) => r.path === "/v1/extension/preferences"),
    ).toEqual([]);
  } finally {
    await close();
  }
});
