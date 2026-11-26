// SPDX-License-Identifier: AGPL-3.0-or-later
// Native Firefox: the layout of a freshly opened sidebar must not move when
// its document activates. A sidebar document is inactive until the first press
// into it, and the intake field that asked for focus on mount only receives
// focus then. If the field grew on focus, the controls below it would move
// between the harness (or a person) aiming at one and the press landing, and
// the press would hit whatever moved underneath (#295).
import { expect, test } from "@playwright/test";
import { buildExtension } from "../e2e/support/build.ts";
import { until } from "../e2e/support/chromium.ts";
import { launchFirefox } from "../e2e/support/firefox.ts";
import { startService } from "../e2e/support/preference-service.ts";

test("the first press into a fresh sidebar does not move the controls below the intake field", async () => {
  const service = await startService();
  const build = await buildExtension("firefox", {
    SOURCE_TASTER_EXTENSION_MODE: "hosted",
    SOURCE_TASTER_EXTENSION_SERVICE_URL: service.url,
    SOURCE_TASTER_EXTENSION_ACCOUNT_SIGN_IN: "enabled",
  });
  const firefox = await launchFirefox(build.outDir);
  try {
    await firefox.clickToolbarButton();
    await until(async () => {
      const sidebar = await firefox.sidebar();
      return sidebar.open && sidebar.url;
    }, "Firefox sidebar did not open");
    const before = await firefox.find("pushbutton", "Sign in");
    // Pressing into the field is the first interaction: it activates the
    // document and gives the field focus, the focus it asked for on mount.
    const field = await firefox.find("entry", "Reference");
    await firefox.click(field);
    // The accessibility bounds of an activating document read 0 until the
    // activation has laid out, so wait for a real position.
    const after = await until(async () => {
      const node = await firefox.find("pushbutton", "Sign in", 1_000);
      return node.y > 0 && node;
    }, "Sign in had no position after the sidebar activated");
    expect(after.y).toBe(before.y);
    await firefox.click(after);
    await firefox.find("entry", "Email address", 5_000);
  } finally {
    await firefox.close();
    await build.remove();
    await service.close();
  }
});
