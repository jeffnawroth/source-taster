// SPDX-License-Identifier: AGPL-3.0-or-later
import { expect, test } from "@playwright/test";
import { spawnSync } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";

test("the publication review fingerprint binds local fonts and shared rendered inputs", async () => {
  const fingerprint = () => {
    const result = spawnSync(
      process.execPath,
      ["scripts/publication-check.ts", "--digest"],
      { encoding: "utf8" },
    );
    expect(result.status).toBe(0);
    expect(result.stdout).toMatch(/^[a-f0-9]{64}\n$/);
    return result.stdout;
  };
  const before = fingerprint();
  for (const input of [
    "public/fonts/AtkinsonHyperlegibleNext.woff2",
    "../../packages/ui/src/recipes.ts",
    "../../packages/design-tokens/theme.css",
    "../../packages/ui/src/reference-outcome.tsx",
    "../../packages/ui/src/outcome-badges.tsx",
    "../../packages/i18n/messages/de.json",
  ]) {
    const original = await readFile(input);
    try {
      await writeFile(input, Buffer.concat([original, Buffer.from("\n")]));
      expect(
        fingerprint(),
        `changed ${input} must invalidate the review`,
      ).not.toBe(before);
    } finally {
      await writeFile(input, original);
    }
    expect(fingerprint()).toBe(before);
  }
});
