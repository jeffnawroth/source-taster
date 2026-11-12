// SPDX-License-Identifier: AGPL-3.0-or-later
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { PNG } from "pngjs";
import { headLinks } from "../src/web-head.ts";

const root = new URL("../", import.meta.url);
const read = (path: string) => readFile(new URL(path, root));
const record = JSON.parse(
  (await read("exports/manifest.json")).toString("utf8"),
) as { exports: { file: string; group: string; basis: string }[] };
const published = new Set(
  record.exports
    .filter((entry) => entry.group === "website")
    .map((entry) => entry.file),
);

// Literal hex from docs/design/tokens.md, not from the tokens package: the
// light `bg` role is #f5f8fd and the light `accent` role is #2456d3.
const LIGHT_BG = "#f5f8fd";
const LIGHT_ACCENT = "#2456d3";

await test("the web app manifest names the product and lists the any and maskable icons with their purpose", async () => {
  const manifest: unknown = JSON.parse(
    (await read("exports/manifest.webmanifest")).toString("utf8"),
  );
  assert.deepEqual(manifest, {
    name: "Source Taster",
    // No service worker or start behaviour is selected: the page stays a page.
    display: "browser",
    theme_color: LIGHT_BG,
    background_color: LIGHT_BG,
    icons: [
      ...[192, 512].map((size) => ({
        src: `/web-app-any-${size}.png`,
        sizes: `${size}x${size}`,
        type: "image/png",
        purpose: "any",
      })),
      ...[192, 512].map((size) => ({
        src: `/web-app-maskable-${size}.png`,
        sizes: `${size}x${size}`,
        type: "image/png",
        purpose: "maskable",
      })),
    ],
  });
});

await test("every manifest icon is an exported PNG of exactly the declared size", async () => {
  const manifest = JSON.parse(
    (await read("exports/manifest.webmanifest")).toString("utf8"),
  ) as { icons: { src: string; sizes: string }[] };
  for (const { src, sizes } of manifest.icons) {
    assert.ok(published.has(src.slice(1)), `${src} is a website export`);
    const image = PNG.sync.read(await read(`exports/${src.slice(1)}`));
    assert.equal(`${image.width}x${image.height}`, sizes, src);
  }
});

await test("the head links are the favicons, touch icon, Safari mask icon and manifest, in order", () => {
  assert.deepEqual(headLinks, [
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
    {
      rel: "mask-icon",
      href: "/safari-pinned-tab.svg",
      color: LIGHT_ACCENT,
    },
    { rel: "manifest", href: "/manifest.webmanifest" },
  ]);
});

await test("every head link points at a published website export", () => {
  for (const { href } of headLinks)
    assert.ok(published.has(href.slice(1)), `${href} is a website export`);
});
