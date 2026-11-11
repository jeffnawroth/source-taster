// SPDX-License-Identifier: AGPL-3.0-or-later
import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";

const brandExport = (file: string) =>
  readFile(new URL(`../../../packages/brand/exports/${file}`, import.meta.url));

// The chosen website set from docs/design/brand-assets.md. `sizes` must name
// only sizes actually present in each file (HTML rel=icon).
const links = [
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
];

test("every page links the packaged favicons and touch icon, served byte-equal from the site", async ({
  page,
  request,
}) => {
  for (const path of ["/en/", "/de/", "/docs/en/"]) {
    await page.goto(path);
    const head = await page.$$eval(
      'link[rel="icon"], link[rel="apple-touch-icon"], link[rel="manifest"], link[rel="mask-icon"]',
      (elements) =>
        elements.map((element) => ({
          rel: element.getAttribute("rel"),
          href: element.getAttribute("href"),
          sizes: element.getAttribute("sizes"),
          type: element.getAttribute("type"),
        })),
    );
    expect(head, path).toEqual(links);
  }
  for (const { href, type } of links) {
    const response = await request.get(href);
    expect(response.status(), href).toBe(200);
    expect(response.headers()["content-type"], href).toBe(type);
    expect(
      Buffer.compare(await response.body(), await brandExport(href.slice(1))),
      href,
    ).toBe(0);
  }
});

test("optional and store artwork is not published by the website", async ({
  request,
}) => {
  for (const file of [
    "web-app-any-512.png",
    "web-app-maskable-512.png",
    "safari-pinned-tab.svg",
    "store-cws-128.png",
    "extension-128.png",
    "manifest.json",
  ])
    expect((await request.get(`/${file}`)).status(), file).toBe(404);
});

test("the interface notice carries the draft brand notice beside the font and UI grants", async ({
  request,
}) => {
  const notice = await (await request.get("/third-party/ui/NOTICE.txt")).text();
  expect(notice).toContain("DRAFT notice, not legally reviewed");
  expect(notice).toContain("[verified rights holder]");
  for (const grant of [
    "SIL OPEN FONT LICENSE",
    "Apache License",
    "ISC License",
  ])
    expect(notice).toContain(grant);
});
