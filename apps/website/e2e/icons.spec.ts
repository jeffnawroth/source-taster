// SPDX-License-Identifier: AGPL-3.0-or-later
import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";

const brandExport = (file: string) =>
  readFile(new URL(`../../../packages/brand/exports/${file}`, import.meta.url));

// The chosen website set from docs/design/brand-assets.md. `sizes` must name
// only sizes actually present in each file (HTML rel=icon). Attributes a link
// does not carry are absent, not null.
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
  // Archived Safari pinned tab; its tint is the light `accent` token, #2456d3
  // in docs/design/tokens.md.
  { rel: "mask-icon", href: "/safari-pinned-tab.svg", color: "#2456d3" },
  { rel: "manifest", href: "/manifest.webmanifest" },
];

// Served files beyond the head links: the manifest's own icons.
const served = [
  ...links.map(({ href }) => href!),
  ...[192, 512].flatMap((size) => [
    `/web-app-any-${size}.png`,
    `/web-app-maskable-${size}.png`,
  ]),
];
const contentTypes: Record<string, string> = {
  ico: "image/x-icon",
  svg: "image/svg+xml",
  png: "image/png",
  webmanifest: "application/manifest+json",
};

test("every page links the packaged icons, mask icon and manifest in order", async ({
  page,
}) => {
  for (const path of ["/en/", "/de/", "/docs/en/"]) {
    await page.goto(path);
    const head = await page.$$eval(
      'link[rel="icon"], link[rel="apple-touch-icon"], link[rel="manifest"], link[rel="mask-icon"]',
      (elements) =>
        elements.map((element) => {
          const attributes: Record<string, string> = {};
          for (const name of ["rel", "href", "sizes", "type", "color"]) {
            const value = element.getAttribute(name);
            if (value !== null) attributes[name] = value;
          }
          return attributes;
        }),
    );
    expect(head, path).toEqual(links);
  }
});

test("every linked and manifest-listed file is served with its type and the exact bytes", async ({
  request,
}) => {
  for (const href of served) {
    const response = await request.get(href);
    expect(response.status(), href).toBe(200);
    expect(response.headers()["content-type"], href).toBe(
      contentTypes[href.split(".").at(-1)!],
    );
    expect(
      Buffer.compare(await response.body(), await brandExport(href.slice(1))),
      href,
    ).toBe(0);
  }
});

test("the browser accepts the manifest under the site's content security policy", async ({
  page,
}) => {
  // A request check cannot see a CSP block: ask the browser for the manifest
  // it actually parsed (Chromium only; the head and bytes are checked above).
  test.skip(
    test.info().project.use.browserName !== undefined &&
      test.info().project.use.browserName !== "chromium",
    "Page.getAppManifest is a Chromium DevTools command",
  );
  await page.goto("/en/");
  const session = await page.context().newCDPSession(page);
  const result = (await session.send("Page.getAppManifest")) as {
    url: string;
    errors: unknown[];
    data?: string;
  };
  expect(result.errors).toEqual([]);
  expect(new URL(result.url).pathname).toBe("/manifest.webmanifest");
  const manifest = JSON.parse(result.data!) as {
    name: string;
    icons: { src: string; purpose: string }[];
  };
  expect(manifest.name).toBe("Source Taster");
  expect(manifest.icons.map(({ src, purpose }) => [src, purpose])).toEqual([
    ["/web-app-any-192.png", "any"],
    ["/web-app-any-512.png", "any"],
    ["/web-app-maskable-192.png", "maskable"],
    ["/web-app-maskable-512.png", "maskable"],
  ]);
});

test("store and extension artwork is not published by the website", async ({
  request,
}) => {
  for (const file of [
    "store-cws-128.png",
    "store-amo-128.png",
    "store-edge-300.png",
    "extension-128.png",
    "toolbar-default-16.png",
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
