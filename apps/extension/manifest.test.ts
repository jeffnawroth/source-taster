// SPDX-License-Identifier: AGPL-3.0-or-later
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { test } from "node:test";
import { buildExtension, type Target } from "./e2e/support/build.ts";

async function built(target: Target) {
  const build = await buildExtension(target, {});
  try {
    const manifest = JSON.parse(
      await readFile(join(build.outDir, "manifest.json"), "utf8"),
    ) as Record<string, unknown> & {
      browser_specific_settings?: { gecko?: unknown };
    };
    // Every packaged file, with the bytes of each packaged icon.
    const packaged = (
      await readdir(build.outDir, { recursive: true, withFileTypes: true })
    )
      .filter((entry) => entry.isFile())
      .map((entry) =>
        join(entry.parentPath, entry.name).slice(build.outDir.length + 1),
      )
      .sort();
    const icons = Object.fromEntries(
      await Promise.all(
        packaged
          .filter((path) => path.startsWith("icons/"))
          .map(
            async (path) =>
              [path, await readFile(join(build.outDir, path))] as const,
          ),
      ),
    );
    const brandNotice = await readFile(
      join(build.outDir, "notices/brand/NOTICE.md"),
      "utf8",
    ).catch(() => undefined);
    const assets = join(build.outDir, "assets");
    const code = (
      await Promise.all(
        (await readdir(assets))
          .filter((name) => name.endsWith(".js"))
          .map((name) => readFile(join(assets, name), "utf8")),
      )
    ).join("\n");
    const files = await readdir(assets);
    const fonts = await Promise.all(
      files
        .filter((name) => name.endsWith(".ttf"))
        .map(async (name) =>
          createHash("sha256")
            .update(await readFile(join(assets, name)))
            .digest("hex"),
        ),
    );
    const css = (
      await Promise.all(
        files
          .filter((name) => name.endsWith(".css"))
          .map((name) => readFile(join(assets, name), "utf8")),
      )
    ).join("\n");
    const notices = await Promise.all(
      ["atkinsonhyperlegiblenext", "ibmplexmono"].map((family) =>
        readFile(join(build.outDir, `notices/fonts/${family}-OFL.txt`), "utf8"),
      ),
    );
    const lucide = await readFile(
      join(build.outDir, "notices/ui/lucide-LICENSE"),
      "utf8",
    );
    const adobe = await readFile(
      join(build.outDir, "notices/ui/react-spectrum-LICENSE"),
      "utf8",
    );
    return {
      manifest,
      code,
      fonts,
      css,
      notices,
      lucide,
      adobe,
      packaged,
      icons,
      brandNotice,
    };
  } finally {
    await build.remove();
  }
}

const brandExport = (file: string) =>
  readFile(new URL(`../../packages/brand/exports/${file}`, import.meta.url));
const sizes = (prefix: string, list: number[]) =>
  Object.fromEntries(list.map((size) => [size, `icons/${prefix}-${size}.png`]));
const packageIcons = sizes("extension", [16, 24, 32, 48, 64, 96, 128]);
const toolbarSizes = [16, 24, 32, 48, 64];

await test("the built Firefox manifest keeps its permissions and CSP and maps theme icons by theme text", async () => {
  const { manifest } = await built("firefox");
  assert.deepEqual(manifest, {
    manifest_version: 3,
    default_locale: "en",
    name: "Source Taster (development)",
    version: "0.0.0",
    description: "Development build of the Source Taster check workspace.",
    host_permissions: ["http://127.0.0.1/*"],
    content_security_policy: {
      extension_pages: "script-src 'self'; object-src 'self'",
    },
    icons: packageIcons,
    browser_specific_settings: manifest.browser_specific_settings,
    action: {
      default_title: "Source Taster",
      default_area: "navbar",
      default_icon: sizes("toolbar-default", toolbarSizes),
      // `dark` is for themes with dark text, i.e. light toolbars, so it gets
      // the on-light artwork; `light` gets the on-dark artwork.
      theme_icons: toolbarSizes.map((size) => ({
        dark: `icons/toolbar-on-light-${size}.png`,
        light: `icons/toolbar-on-dark-${size}.png`,
        size,
      })),
    },
    sidebar_action: {
      default_title: "Source Taster",
      default_panel: "panel.html",
      open_at_install: false,
    },
    background: { scripts: ["background.js"] },
    permissions: ["storage", "menus"],
  });
});

await test("the built Firefox manifest requires Firefox 140 and declares exactly the data collection", async () => {
  const { manifest } = await built("firefox");
  // Whole-object equality: any extra, optional or missing entry fails.
  assert.deepEqual(manifest.browser_specific_settings?.gecko, {
    id: "development@source-taster.invalid",
    strict_min_version: "140.0",
    data_collection_permissions: {
      required: [
        "authenticationInfo",
        "personallyIdentifyingInfo",
        "websiteContent",
      ],
      optional: ["technicalAndInteraction"],
    },
  });
});

await test("the built Chromium manifest keeps its permissions and CSP, adds only icons and carries no Firefox-only settings", async () => {
  const { manifest, code } = await built("chromium");
  assert.deepEqual(manifest, {
    manifest_version: 3,
    default_locale: "en",
    name: "Source Taster (development)",
    version: "0.0.0",
    description: "Development build of the Source Taster check workspace.",
    host_permissions: ["http://127.0.0.1:3100/*"],
    content_security_policy: {
      extension_pages: "script-src 'self'; object-src 'self'",
    },
    icons: packageIcons,
    minimum_chrome_version: "116",
    action: {
      default_title: "Source Taster",
      default_icon: sizes("toolbar-default", toolbarSizes),
    },
    side_panel: { default_path: "panel.html" },
    background: { service_worker: "background.js" },
    permissions: ["sidePanel", "storage", "contextMenus"],
  });
  // The Firefox-only data collection gate must not ship in the Chromium panel.
  assert.equal(code.includes("data_collection"), false);
});

await test("both packaged targets contain local original fonts and complete applicable notices", async () => {
  const provenance = JSON.parse(
    await readFile(
      new URL(
        "../../packages/ui/public/fonts/provenance.json",
        import.meta.url,
      ),
      "utf8",
    ),
  ) as Record<string, { sha256: string }>;
  const expected = Object.entries(provenance)
    .filter(([name]) => name.endsWith(".ttf"))
    .map(([, entry]) => entry.sha256)
    .sort();
  assert.equal(expected.length, 6);
  for (const target of ["chromium", "firefox"] as const) {
    const builtOutput = await built(target);
    assert.deepEqual(builtOutput.fonts.sort(), expected);
    assert.equal((builtOutput.css.match(/@font-face/g) ?? []).length, 6);
    assert.doesNotMatch(builtOutput.css, /fonts\.googleapis|fonts\.gstatic/);
    assert.match(
      builtOutput.notices[0]!,
      /Copyright 2020-2024 The Atkinson Hyperlegible Next Project Authors/,
    );
    assert.match(builtOutput.notices[1]!, /Reserved Font Name "Plex"/);
    for (const notice of builtOutput.notices)
      assert.match(notice, /SIL OPEN FONT LICENSE Version 1\.1/);
    assert.match(builtOutput.lucide, /Cole Bemis/);
    assert.match(builtOutput.lucide, /ISC License/);
    assert.match(builtOutput.adobe, /Apache License/);
  }
});

await test("both packages carry exactly the referenced icons, byte-equal to the brand exports", async () => {
  for (const target of ["chromium", "firefox"] as const) {
    const { manifest, icons, packaged } = await built(target);
    const action = manifest.action as {
      default_icon: Record<string, string>;
      theme_icons?: { dark: string; light: string }[];
    };
    const referenced = new Set([
      ...Object.values(manifest.icons as Record<string, string>),
      ...Object.values(action.default_icon),
      ...(action.theme_icons ?? []).flatMap(({ dark, light }) => [dark, light]),
    ]);
    // No store, optional, maskable, website or Safari file enters a package,
    // and Chromium carries no Firefox-only theme cuts.
    assert.deepEqual(Object.keys(icons).sort(), [...referenced].sort(), target);
    assert.deepEqual(
      packaged.filter((path) => /\.(png|ico|svg)$/.test(path)),
      [...referenced].sort(),
      target,
    );
    for (const [path, bytes] of Object.entries(icons))
      assert.deepEqual(
        bytes,
        await brandExport(path.slice("icons/".length)),
        path,
      );
    assert.equal(
      [...referenced].some((path) => path.includes("toolbar-on-")),
      target === "firefox",
    );
  }
});

await test("both packages carry the draft brand notice beside the unchanged upstream notices", async () => {
  const source = await readFile(
    new URL("../../packages/brand/NOTICE.md", import.meta.url),
    "utf8",
  );
  for (const target of ["chromium", "firefox"] as const) {
    const { brandNotice, packaged } = await built(target);
    assert.equal(brandNotice, source, target);
    assert.match(brandNotice, /not (yet )?legally reviewed/i);
    for (const notice of [
      "notices/fonts/atkinsonhyperlegiblenext-OFL.txt",
      "notices/fonts/ibmplexmono-OFL.txt",
      "notices/fonts/provenance.json",
      "notices/ui/lucide-LICENSE",
      "notices/ui/react-spectrum-LICENSE",
    ])
      assert.ok(packaged.includes(notice), `${target} ${notice}`);
  }
});
