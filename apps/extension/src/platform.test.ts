// SPDX-License-Identifier: AGPL-3.0-or-later
// The panel only trusts the extension's own page with extension storage.
import assert from "node:assert/strict";
import { test } from "node:test";
import { trustedExtensionPage } from "./platform.ts";

const scope = globalThis as Record<string, unknown>;
const origin = "chrome-extension://abcdefghijklmnop";
const message = /trusted extension page/u;

function namespace(
  overrides: { id?: string | undefined; storage?: unknown } = {},
) {
  return {
    runtime: {
      id: "id" in overrides ? overrides.id : "extension-id",
      getURL: () => `${origin}/`,
    },
    storage: "storage" in overrides ? overrides.storage : { local: {} },
  };
}
/** Runs a body against a page at `at` that exposes the given namespaces. */
function onPage(
  at: string | null,
  api: { chrome?: unknown; browser?: unknown },
  body: () => void,
) {
  if (at !== null) scope.location = { origin: at };
  scope.chrome = api.chrome;
  scope.browser = api.browser;
  try {
    body();
  } finally {
    delete scope.location;
    delete scope.chrome;
    delete scope.browser;
  }
}

await test("trustedExtensionPage returns the namespace on the extension's own origin", () => {
  const api = namespace();
  onPage(origin, { chrome: api }, () => {
    assert.equal(trustedExtensionPage(), api);
  });
});

await test("trustedExtensionPage prefers the promise-based browser namespace over chrome", () => {
  const api = namespace();
  onPage(origin, { chrome: namespace(), browser: api }, () => {
    assert.equal(trustedExtensionPage(), api);
  });
});

await test("trustedExtensionPage refuses a web page that only sees a lookalike namespace", () => {
  onPage("https://example.com", { chrome: namespace() }, () => {
    assert.throws(() => trustedExtensionPage(), message);
  });
});

await test("trustedExtensionPage refuses an origin that merely starts with the extension's", () => {
  onPage(`${origin}.evil.example`, { chrome: namespace() }, () => {
    assert.throws(() => trustedExtensionPage(), message);
  });
});

await test("trustedExtensionPage refuses a page without an extension runtime id", () => {
  onPage(origin, { chrome: namespace({ id: undefined }) }, () => {
    assert.throws(() => trustedExtensionPage(), message);
  });
});

await test("trustedExtensionPage refuses a page without extension-local storage", () => {
  onPage(origin, { chrome: namespace({ storage: {} }) }, () => {
    assert.throws(() => trustedExtensionPage(), message);
  });
});

await test("trustedExtensionPage refuses a page with no extension API at all", () => {
  onPage(origin, {}, () => {
    assert.throws(() => trustedExtensionPage(), message);
  });
});
