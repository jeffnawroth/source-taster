// SPDX-License-Identifier: AGPL-3.0-or-later
// #214: the web app's own HTML head carries the same icon links as the
// website, and the dev server forwards every linked file to the website build.
import assert from "node:assert/strict";
import { test } from "node:test";
import { brandHead, websitePaths } from "../brand-head.ts";

// Literals from docs/design/brand-assets.md and docs/design/tokens.md: the mask
// icon is tinted with the light `accent` role, #2456d3.
const links: Record<string, string>[] = [
  {
    rel: "icon",
    href: "/favicon.ico",
    sizes: "16x16 32x32 48x48",
    type: "image/x-icon",
  },
  { rel: "icon", href: "/favicon.svg", sizes: "any", type: "image/svg+xml" },
  ...[16, 32, 48, 96].map((size) => ({
    rel: "icon",
    href: `/favicon-${size}.png`,
    sizes: `${size}x${size}`,
    type: "image/png",
  })),
  {
    rel: "apple-touch-icon",
    href: "/apple-touch-icon.png",
    sizes: "180x180",
    type: "image/png",
  },
  { rel: "mask-icon", href: "/safari-pinned-tab.svg", color: "#2456d3" },
  { rel: "manifest", href: "/manifest.webmanifest" },
];

await test("the app head gets the brand links, in order, injected into <head>", () => {
  const plugin = brandHead();
  const hook = plugin.transformIndexHtml as () => unknown;
  assert.deepEqual(
    hook(),
    links.map((attrs) => ({ tag: "link", attrs, injectTo: "head" })),
  );
});

await test("the dev server forwards the documentation site and every linked brand file, nothing of the app or API", () => {
  for (const path of [
    "/docs/en/",
    "/de/privacy/",
    "/en/",
    "/pagefind/en/pagefind.js",
    "/_astro/app.css",
    ...links.map(({ href }) => href!),
    "/web-app-any-512.png",
    "/web-app-maskable-192.png",
  ])
    assert.match(path, websitePaths, path);
  for (const path of [
    "/",
    "/v1/checks",
    "/v2/checks",
    "/health",
    "/assets/index.js",
    "/favicon.ico.map",
    "/favicon-16.png/extra",
    "/store-edge-300.png",
    "/extension-128.png",
  ])
    assert.doesNotMatch(path, websitePaths, path);
});
