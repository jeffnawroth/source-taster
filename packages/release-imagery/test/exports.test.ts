// SPDX-License-Identifier: AGPL-3.0-or-later
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import type { Manifest } from "../src/manifest.ts";
import { imageSpecs } from "../src/specs.ts";
import { manifestProblems, validateImages } from "../src/validate.ts";

const exportsDir = join(
  fileURLToPath(new URL("..", import.meta.url)),
  "exports",
);
const manifestPath = join(exportsDir, "manifest.json");

// Only final captures are committed. Until the gate passes there is no
// exports/ directory and nothing to check; a dry run never lands here.
await test("committed exports are a complete, final and consistent image set", async (t) => {
  if (!existsSync(manifestPath)) {
    t.skip("no final capture committed");
    return;
  }
  const manifest = JSON.parse(await readFile(manifestPath, "utf8")) as Manifest;
  assert.equal(manifest.status, "final");
  assert.equal(manifest.releaseQualified, false);
  assert.deepEqual(manifestProblems(manifest), []);
  assert.deepEqual(await validateImages(exportsDir, manifest), []);
  assert.deepEqual(
    manifest.images.map((i) => i.file),
    imageSpecs.map((s) => s.file),
  );
  for (const capture of manifest.captures)
    assert.ok(existsSync(join(exportsDir, capture.file)), capture.file);
});
