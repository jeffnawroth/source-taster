// SPDX-License-Identifier: AGPL-3.0-or-later
import type { TestProject } from "vitest/node";
import { documentImageProblem } from "./support/document-image.ts";
import { startTestService } from "./support/service.ts";

declare module "vitest" {
  export interface ProvidedContext {
    apiUrl: string;
  }
}
export default async function setup(project: TestProject) {
  // A warning, not a failure: most suites do not need the extractor image.
  const problem = documentImageProblem(
    process.env.SOURCE_TASTER_DOCUMENT_IMAGE,
  );
  if (problem) console.warn(`\n[test setup] ${problem}\n`);
  const service = await startTestService(
    Number(process.env.SOURCE_TASTER_TEST_API_PORT ?? 3101),
  );
  project.provide("apiUrl", service.apiUrl);
  return service.stop;
}
