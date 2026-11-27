// SPDX-License-Identifier: AGPL-3.0-or-later
// The store channel and the release packages (#259). Real Vite builds in
// rehearsal mode; no store, account or network is involved.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { inflateRawSync } from "node:zlib";
import { test } from "node:test";
import {
  assertStoreConfig,
  extensionConfig,
  extensionVersion,
  hostPermissions,
  storeGeckoId,
} from "../extension-config.ts";
import {
  maxManifestDescription,
  storeListing,
  storeLocales,
} from "../store-listing.ts";
import { buildPackage, sourcePackage, storeEnv } from "./release.ts";
import { zip } from "./zip.ts";

/** A reader independent of the writer: it follows the central directory. */
function unzip(bytes: Buffer) {
  const end = bytes.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]));
  const count = bytes.readUInt16LE(end + 10);
  let cursor = bytes.readUInt32LE(end + 16);
  const entries = new Map<string, Buffer>();
  for (let i = 0; i < count; i++) {
    assert.equal(bytes.readUInt32LE(cursor), 0x02014b50);
    const method = bytes.readUInt16LE(cursor + 10);
    const size = bytes.readUInt32LE(cursor + 20);
    const nameLength = bytes.readUInt16LE(cursor + 28);
    const local = bytes.readUInt32LE(cursor + 42);
    const name = bytes.toString("utf8", cursor + 46, cursor + 46 + nameLength);
    // The local header repeats the name and may carry its own extra field.
    const start =
      local +
      30 +
      bytes.readUInt16LE(local + 26) +
      bytes.readUInt16LE(local + 28);
    const body = bytes.subarray(start, start + size);
    entries.set(name, method === 8 ? inflateRawSync(body) : Buffer.from(body));
    cursor +=
      46 +
      nameLength +
      bytes.readUInt16LE(cursor + 30) +
      bytes.readUInt16LE(cursor + 32);
  }
  return entries;
}

const rehearsal = {
  SOURCE_TASTER_EXTENSION_API_URL: "https://api.example.invalid",
  SOURCE_TASTER_EXTENSION_WEBSITE_URL: "https://www.example.invalid",
};

await test("the zip writer is deterministic, sorted and readable by an independent reader", () => {
  const files = [
    { name: "b/two.txt", data: Buffer.from("two ".repeat(100)) },
    { name: "a.txt", data: Buffer.from("one") },
    { name: "empty", data: Buffer.alloc(0) },
  ];
  const first = zip(files);
  assert.deepEqual(first, zip([...files].reverse()));
  const read = unzip(first);
  assert.deepEqual([...read.keys()], ["a.txt", "b/two.txt", "empty"]);
  assert.equal(read.get("b/two.txt")!.toString(), "two ".repeat(100));
  assert.throws(() => zip([{ name: "../x", data: Buffer.alloc(0) }]), /Unsafe/);
  assert.throws(
    () =>
      zip([
        { name: "x", data: Buffer.alloc(0) },
        { name: "x", data: Buffer.alloc(0) },
      ]),
    /Duplicate/,
  );
});

await test("the store channel fails closed on missing, insecure and reserved origins", () => {
  const check = (env: Record<string, string>) =>
    assertStoreConfig(env, extensionConfig(env));
  // No development default may leak into a store build.
  assert.throws(() => check({}), /needs SOURCE_TASTER_EXTENSION_API_URL/);
  assert.throws(
    () =>
      check({
        SOURCE_TASTER_EXTENSION_API_URL: "https://api.source-taster.app",
      }),
    /needs SOURCE_TASTER_EXTENSION_WEBSITE_URL/,
  );
  assert.throws(
    () =>
      check({
        SOURCE_TASTER_EXTENSION_API_URL: "http://127.0.0.1:3100",
        SOURCE_TASTER_EXTENSION_WEBSITE_URL: "https://www.example.invalid",
      }),
    /must be HTTPS/,
  );
  // A real run refuses reserved hosts, a rehearsal refuses real ones.
  assert.throws(() => check(rehearsal), /reserved host/);
  assert.throws(
    () =>
      check({
        ...rehearsal,
        SOURCE_TASTER_EXTENSION_STORE_REHEARSAL: "1",
        SOURCE_TASTER_EXTENSION_API_URL: "https://api.source-taster.app",
      }),
    /real host/,
  );
  assert.throws(
    () => storeEnv(rehearsal, false),
    /reserved host/,
    "the release script refuses a rehearsal-only origin",
  );
  assert.doesNotThrow(() => storeEnv(rehearsal, true));
});

await test("a hosted store build still asks for host access to the API origin only", () => {
  const env = {
    ...rehearsal,
    SOURCE_TASTER_EXTENSION_STORE_REHEARSAL: "1",
    SOURCE_TASTER_EXTENSION_MODE: "hosted",
    SOURCE_TASTER_EXTENSION_SERVICE_URL: "https://service.example.invalid",
    SOURCE_TASTER_EXTENSION_ACCOUNT_SIGN_IN: "enabled",
  };
  const config = extensionConfig(env);
  assert.doesNotThrow(() => assertStoreConfig(env, config));
  for (const target of ["chromium", "firefox"] as const)
    assert.deepEqual(hostPermissions(target, config), [
      "https://api.example.invalid/*",
    ]);
});

await test("the store listing text fits the store limits and says what the product is", () => {
  for (const locale of storeLocales) {
    const { name, description } = storeListing[locale];
    assert.equal(name, "Source Taster");
    assert.ok(description.length <= maxManifestDescription, locale);
    assert.match(description, /Development preview|Entwicklungsvorschau/);
  }
});

const sizes = (prefix: string, list: number[]) =>
  Object.fromEntries(list.map((size) => [size, `icons/${prefix}-${size}.png`]));
const toolbarSizes = [16, 24, 32, 48, 64];

const built = Object.fromEntries(
  (["chromium", "firefox"] as const).map((target) => [
    target,
    buildPackage(target, storeEnv(rehearsal, true), true),
  ]),
) as Record<"chromium" | "firefox", ReturnType<typeof buildPackage>>;

const parse = (pkg: ReturnType<typeof buildPackage>) => {
  const entries = unzip(pkg.bytes);
  return {
    entries,
    manifest: JSON.parse(entries.get("manifest.json")!.toString()) as Record<
      string,
      unknown
    >,
  };
};

await test("a rebuild gives byte-identical packages", () => {
  for (const target of ["chromium", "firefox"] as const) {
    const again = buildPackage(target, storeEnv(rehearsal, true), true);
    assert.equal(again.sha256, built[target].sha256, target);
    assert.equal(
      again.file,
      `source-taster-${extensionVersion}-${target}-rehearsal.zip`,
    );
  }
});

await test("the Chromium store package carries localised name and description and no development value", () => {
  const { manifest, entries } = parse(built.chromium);
  assert.deepEqual(manifest, {
    manifest_version: 3,
    default_locale: "en",
    name: "__MSG_extensionName__",
    version: extensionVersion,
    description: "__MSG_extensionDescription__",
    host_permissions: ["https://api.example.invalid/*"],
    content_security_policy: {
      extension_pages: "script-src 'self'; object-src 'self'",
    },
    icons: sizes("extension", [16, 24, 32, 48, 64, 96, 128]),
    minimum_chrome_version: "116",
    action: {
      default_title: "Source Taster",
      default_icon: sizes("toolbar-default", toolbarSizes),
    },
    side_panel: { default_path: "panel.html" },
    background: { service_worker: "background.js" },
    permissions: ["sidePanel", "storage", "contextMenus"],
  });
  for (const locale of storeLocales) {
    const messages = JSON.parse(
      entries.get(`_locales/${locale}/messages.json`)!.toString(),
    ) as Record<string, { message: string }>;
    assert.equal(messages.extensionName!.message, storeListing[locale].name);
    assert.equal(
      messages.extensionDescription!.message,
      storeListing[locale].description,
    );
    assert.ok(messages.check_selected_text!.message.length > 0);
  }
});

await test("the Firefox store package has the permanent add-on ID and the declared data collection", () => {
  const { manifest } = parse(built.firefox);
  assert.equal(manifest.name, "__MSG_extensionName__");
  assert.equal(manifest.version, extensionVersion);
  assert.deepEqual(manifest.permissions, ["storage", "menus"]);
  assert.deepEqual(manifest.browser_specific_settings, {
    gecko: {
      id: storeGeckoId,
      strict_min_version: "140.0",
      data_collection_permissions: {
        required: [
          "authenticationInfo",
          "personallyIdentifyingInfo",
          "websiteContent",
        ],
        optional: ["technicalAndInteraction"],
      },
    },
  });
  assert.match(storeGeckoId, /^\{[0-9a-f-]{36}\}$/);
});

await test("no store package holds loopback addresses, source maps, secrets or the old version", () => {
  for (const target of ["chromium", "firefox"] as const) {
    const { entries } = parse(built[target]);
    for (const [name, data] of entries) {
      assert.doesNotMatch(name, /\.map$|(^|\/)\.env|\.pem$|\.key$/, name);
      if (!/\.(js|html|json|css)$/.test(name)) continue;
      const text = data.toString("utf8");
      assert.doesNotMatch(text, /127\.0\.0\.1|localhost/, `${target} ${name}`);
      assert.doesNotMatch(text, /development@source-taster/, name);
    }
    const code = [...entries]
      .filter(([name]) => name.endsWith(".js"))
      .map(([, data]) => data.toString("utf8"))
      .join("\n");
    // The Check client string reads the single version source.
    assert.ok(code.includes(`extension/${extensionVersion}`), target);
    assert.equal(code.includes("extension/0.0.0"), false, target);
  }
});

await test("the checklist quotes the listing text it submits, word for word", () => {
  const doc = readFileSync(
    new URL(
      "../../../docs/implementation/259-store-submission.md",
      import.meta.url,
    ),
    "utf8",
  );
  for (const locale of storeLocales)
    assert.ok(doc.includes(storeListing[locale].description), locale);
  assert.ok(doc.includes(storeGeckoId));
  assert.ok(doc.includes(`source-taster-${extensionVersion}-`));
});

const clean =
  spawnSync("git", ["status", "--porcelain"], {
    cwd: new URL("..", import.meta.url).pathname,
    encoding: "utf8",
  }).stdout?.trim() === "";
await test(
  "the source package is a git archive of HEAD with the reviewer README and the build inputs",
  { skip: clean ? false : "needs a clean git checkout" },
  () => {
    const env = storeEnv(rehearsal, true);
    const first = sourcePackage(env, true);
    assert.equal(sourcePackage(env, true).sha256, first.sha256);
    const entries = unzip(first.bytes);
    assert.ok(entries.has("README-AMO-REVIEWERS.md"));
    assert.ok(entries.has("pnpm-lock.yaml"));
    assert.ok(entries.has("apps/extension/extension-config.ts"));
    assert.match(
      entries.get("BUILD-INPUTS.env")!.toString(),
      /SOURCE_TASTER_EXTENSION_API_URL=https:\/\/api\.example\.invalid/,
    );
    assert.ok(
      ![...entries.keys()].some(
        (name) => /\.env$|\.git\//.test(name) && name !== "BUILD-INPUTS.env",
      ),
    );
  },
);
