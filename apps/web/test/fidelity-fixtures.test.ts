// SPDX-License-Identifier: AGPL-3.0-or-later
import { test } from "node:test";
import assert from "node:assert/strict";
import { AiReference } from "@source-taster/contract-verification/ai";
import { projectStructuredReference } from "../scripts/design-fidelity/fixtures.ts";

await test("pre-search source projection keeps recognized input and cannot inherit prototype findings", () => {
  const originalText = "A corporate reference with no known publication year.";
  const reference = AiReference.parse({
    originalText,
    span: { start: 0, end: originalText.length },
    csl: { author: [{ literal: "Research Council" }] },
    fieldSources: {},
    structuring: { path: "parser", version: "fixture-parser" },
  });
  const projected = projectStructuredReference(reference, 2);
  assert.equal(projected.id, 2);
  assert.equal(projected.title, originalText);
  assert.equal(projected.au, "Research Council");
  assert.equal(projected.yr, "");
  assert.equal(projected.verdict, null);
  assert.equal(projected.sysVerdict, null);
  assert.equal(projected.override, null);
  assert.deepEqual(projected.srcs, []);
  assert.deepEqual(projected.candidates, []);
  assert.equal(
    projected.trail.every(([, labels]) =>
      labels.every((label) => label === ""),
    ),
    true,
  );
});
