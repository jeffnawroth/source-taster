// SPDX-License-Identifier: AGPL-3.0-or-later
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { test } from "node:test";
import { buildExtension, type Target } from "./e2e/support/build.ts";

async function built(target: Target) {
  const build = await buildExtension(target, {});
  try {
    const manifest = JSON.parse(
      await readFile(join(build.outDir, "manifest.json"), "utf8"),
    ) as {
      browser_specific_settings?: { gecko?: unknown };
    };
    const assets = join(build.outDir, "assets");
    const code = (
      await Promise.all(
        (await readdir(assets))
          .filter((name) => name.endsWith(".js"))
          .map((name) => readFile(join(assets, name), "utf8")),
      )
    ).join("\n");
    return { manifest, code };
  } finally {
    await build.remove();
  }
}

await test("the built Firefox manifest requires Firefox 140 and declares exactly the data collection", async () => {
  const { manifest } = await built("firefox");
  // Whole-object equality: any extra, optional or missing entry fails.
  assert.deepEqual(manifest.browser_specific_settings?.gecko, {
    id: "development@source-taster.invalid",
    strict_min_version: "140.0",
    data_collection_permissions: {
      required: [
        "authenticationInfo",
        "personallyIdentifyingInfo",
        "websiteContent",
      ],
      optional: ["technicalAndInteraction"],
    },
  });
});

await test("the built Chromium manifest is unchanged and carries no Firefox-only settings", async () => {
  const { manifest, code } = await built("chromium");
  assert.deepEqual(manifest, {
    manifest_version: 3,
    default_locale: "en",
    name: "Source Taster (development)",
    version: "0.0.0",
    description: "Development build of the Source Taster check workspace.",
    host_permissions: ["http://127.0.0.1:3100/*"],
    content_security_policy: {
      extension_pages: "script-src 'self'; object-src 'self'",
    },
    minimum_chrome_version: "116",
    action: { default_title: "Source Taster" },
    side_panel: { default_path: "panel.html" },
    background: { service_worker: "background.js" },
    permissions: ["sidePanel", "storage", "contextMenus"],
  });
  // The Firefox-only data collection gate must not ship in the Chromium panel.
  assert.equal(code.includes("data_collection"), false);
});
