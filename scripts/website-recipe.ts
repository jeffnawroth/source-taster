// SPDX-License-Identifier: AGPL-3.0-or-later
// One complete input definition for controlled builds and publication reviews.
import { readFile, readdir } from "node:fs/promises";
import { resolve } from "node:path";
import { createHash } from "node:crypto";
export async function websiteRecipe(
  root: string,
): Promise<Record<string, string>> {
  const files = [
    ".nvmrc",
    "pnpm-lock.yaml",
    "pnpm-workspace.yaml",
    "package.json",
    "docs/dependency-policy.md",
    "docs/research/115-native-license-terms.md",
    "apps/website/src/source-access.ts",
    ...[
      "website-recipe.ts",
      "pagefind-source.ts",
      "pagefind-bundle.ts",
      "pagefind-rustc.ts",
      "pagefind-delivery.ts",
      "website-native-trace.ts",
      "website-native-licenses.ts",
      "website-evidence.ts",
      "website-qualification.ts",
      "website-inventory.ts",
      "audit.ts",
      "refresh-advisories.sh",
      "licenses.ts",
      "qualification-controls.ts",
      "native-trace-controls.ts",
      "license-qualification-controls.ts",
      "publication-recipe-controls.ts",
    ].map((file) => `scripts/${file}`),
  ];
  async function collect(dir: string) {
    for (const entry of await readdir(resolve(root, dir), {
      withFileTypes: true,
    })) {
      const path = `${dir}/${entry.name}`;
      if (entry.isDirectory()) await collect(path);
      else if (entry.isFile()) files.push(path);
      else throw new Error(`Unexpected recipe input: ${path}`);
    }
  }
  for (const dir of ["controlled", "licenses"])
    await collect(`apps/website/qualification/${dir}`);
  const recipe: Record<string, string> = {};
  for (const file of files.sort())
    recipe[file] = createHash("sha256")
      .update(await readFile(resolve(root, file)))
      .digest("hex");
  return recipe;
}
