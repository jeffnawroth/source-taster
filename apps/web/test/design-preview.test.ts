// SPDX-License-Identifier: AGPL-3.0-or-later
import { test } from "node:test";
import assert from "node:assert/strict";
import { comparisonFile } from "../design-preview.ts";

await test("local evidence routes accept generated files and reject repo/private path traversal", () => {
  assert.match(
    comparisonFile(
      "/__design/comparisons/standalone/app-intake-web-light-en.diff.png",
    )!,
    /test-results\/design-fidelity\/app-intake-web-light-en.diff.png$/,
  );
  assert.match(
    comparisonFile("/__design/comparisons/hosted/index.html")!,
    /design-fidelity-hosted\/index.html$/,
  );
  assert.match(
    comparisonFile("/__design/comparisons/extension/index.html")!,
    /apps\/extension\/test-results\/design-fidelity\/index.html$/,
  );
  for (const path of [
    "/__design/comparisons/private/index.html",
    "/__design/comparisons/standalone/../../package.json",
    "/__design/comparisons/standalone/%2e%2e%2fpackage.json",
    "/__design/comparisons/standalone/source.ts",
    "/etc/passwd",
  ])
    assert.equal(comparisonFile(path), undefined);
});
