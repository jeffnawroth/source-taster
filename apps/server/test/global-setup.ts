// SPDX-License-Identifier: AGPL-3.0-or-later
import type { TestProject } from "vitest/node";
import { startTestService } from "./support/service.ts";

declare module "vitest" {
  export interface ProvidedContext {
    apiUrl: string;
  }
}
export default async function setup(project: TestProject) {
  const service = await startTestService(3101);
  project.provide("apiUrl", service.apiUrl);
  return service.stop;
}
