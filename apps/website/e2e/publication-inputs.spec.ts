// SPDX-License-Identifier: AGPL-3.0-or-later
import { expect, test } from "@playwright/test";
import { spawnSync } from "node:child_process";
import { cp, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, relative, resolve } from "node:path";

// The inputs are changed in a copy of the tree, never in place. Other suites
// run dev servers on the same checkout: the web app's Vite config imports
// `brand/src/web-head.ts`, so an in-place edit restarts that server and reloads
// a page another test is driving (#220).
async function inputTree() {
  const repo = resolve("../..");
  const copy = await mkdtemp(join(tmpdir(), "publication-inputs-"));
  const generated =
    /(?:^|\/)(?:node_modules|dist|dist-preview|\.astro|\.turbo|test-results)(?:\/|$)/;
  for (const path of [
    ".nvmrc",
    "package.json",
    "pnpm-lock.yaml",
    "pnpm-workspace.yaml",
    "docs/dependency-policy.md",
    "docs/research/115-native-license-terms.md",
    "scripts",
    "apps/website",
    "packages/brand",
    "packages/design-tokens",
    "packages/i18n",
    "packages/ui",
  ])
    await cp(join(repo, path), join(copy, path), {
      recursive: true,
      filter: (source) => !generated.test(relative(repo, source)),
    });
  const root = join(copy, "apps/website");
  const digest = (...args: string[]) => {
    const result = spawnSync(
      process.execPath,
      ["scripts/publication-check.ts", "--digest", ...args],
      { encoding: "utf8" },
    );
    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout).toMatch(/^[a-f0-9]{64}\n$/);
    return result.stdout;
  };
  const fingerprint = () => digest("--root", root);
  // Reading the checkout is safe; only edits must stay in the copy. Equal
  // digests show the copy holds every input the review reads.
  expect(fingerprint(), "the copy must hold every review input").toBe(digest());
  return {
    fingerprint,
    path: (input: string) => resolve(root, input),
    remove: () => rm(copy, { recursive: true, force: true }),
  };
}

test("the publication review fingerprint binds local fonts and shared rendered inputs", async () => {
  const tree = await inputTree();
  const { fingerprint } = tree;
  const before = fingerprint();
  for (const input of [
    "public/fonts/AtkinsonHyperlegibleNext.woff2",
    "../../packages/ui/src/recipes.ts",
    "../../packages/design-tokens/theme.css",
    "../../packages/ui/src/reference-outcome.tsx",
    "../../packages/ui/src/outcome-badges.tsx",
    "../../packages/i18n/messages/de.json",
    "../../packages/brand/exports/favicon.ico",
    "../../packages/brand/exports/apple-touch-icon.png",
    // The manifest, its icons, the pinned-tab mask and the shared head list
    // are published too, so a change to any of them needs a new review.
    "../../packages/brand/exports/manifest.webmanifest",
    "../../packages/brand/exports/web-app-any-512.png",
    "../../packages/brand/exports/web-app-maskable-192.png",
    "../../packages/brand/exports/safari-pinned-tab.svg",
    "../../packages/brand/src/web-head.ts",
    "../../packages/brand/NOTICE.md",
  ]) {
    const file = tree.path(input);
    const original = await readFile(file);
    try {
      await writeFile(file, Buffer.concat([original, Buffer.from("\n")]));
      expect(
        fingerprint(),
        `changed ${input} must invalidate the review`,
      ).not.toBe(before);
    } finally {
      await writeFile(file, original);
    }
    expect(fingerprint()).toBe(before);
  }
  await tree.remove();
});

test("unpublished store and extension artwork is not a review input", async () => {
  const tree = await inputTree();
  const { fingerprint } = tree;
  const before = fingerprint();
  for (const input of [
    "../../packages/brand/exports/store-edge-300.png",
    "../../packages/brand/exports/extension-128.png",
  ]) {
    const file = tree.path(input);
    const original = await readFile(file);
    try {
      await writeFile(file, Buffer.concat([original, Buffer.from("\n")]));
      expect(fingerprint(), `${input} is not published by the website`).toBe(
        before,
      );
    } finally {
      await writeFile(file, original);
    }
  }
  await tree.remove();
});
