// SPDX-License-Identifier: AGPL-3.0-or-later
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { test } from "node:test";
import { buildExtension, type Target } from "./e2e/support/build.ts";

async function builtManifest(target: Target) {
  const build = await buildExtension(target, {});
  try {
    return JSON.parse(
      await readFile(join(build.outDir, "manifest.json"), "utf8"),
    ) as {
      browser_specific_settings?: {
        gecko?: { data_collection_permissions?: unknown };
      };
    };
  } finally {
    await build.remove();
  }
}

await test("the built Firefox manifest declares exactly the required data collection", async () => {
  const manifest = await builtManifest("firefox");
  // Whole-object equality: any extra, optional or missing entry fails.
  assert.deepEqual(manifest.browser_specific_settings?.gecko, {
    id: "development@source-taster.invalid",
    strict_min_version: "128.0",
    data_collection_permissions: {
      required: [
        "authenticationInfo",
        "personallyIdentifyingInfo",
        "websiteContent",
      ],
    },
  });
});

await test("the built Chromium manifest carries no Firefox-only settings", async () => {
  const manifest = await builtManifest("chromium");
  assert.equal(manifest.browser_specific_settings, undefined);
});
