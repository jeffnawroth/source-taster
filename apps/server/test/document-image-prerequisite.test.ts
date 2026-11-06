// SPDX-License-Identifier: AGPL-3.0-or-later
// The document-upload suites need the isolated extractor image; without it the
// service fails closed with HTTP 503. The warning must say so and how to fix it.
import { expect, it } from "vitest";
import { documentImageProblem } from "./support/document-image.ts";

const image = `sha256:${"a".repeat(64)}`;

it("is silent when the configured image exists", () => {
  expect(documentImageProblem(image, () => true)).toBeUndefined();
});

it("names the missing variable and the build command when no image is set", () => {
  for (const value of [undefined, ""]) {
    const problem = documentImageProblem(value, () => true);
    expect(problem).toContain("SOURCE_TASTER_DOCUMENT_IMAGE");
    expect(problem).toContain("503");
    expect(problem).toContain("node apps/server/scripts/extractor-image.ts");
  }
});

it("names the image when Docker does not have it", () => {
  const problem = documentImageProblem(image, () => false);
  expect(problem).toContain(image);
  expect(problem).toContain("Docker");
  expect(problem).toContain("node apps/server/scripts/extractor-image.ts");
});
