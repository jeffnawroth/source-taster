// SPDX-License-Identifier: AGPL-3.0-or-later
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { test } from "@playwright/test";
/** Native screenshots go to an explicit evidence directory when requested. */
export function evidence(name: string) {
  const directory = process.env.SOURCE_TASTER_NATIVE_EVIDENCE_DIR;
  if (!directory) return test.info().outputPath(name);
  mkdirSync(directory, { recursive: true });
  return join(directory, name);
}
