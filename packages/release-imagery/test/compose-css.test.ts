// SPDX-License-Identifier: AGPL-3.0-or-later
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { composeCss } from "../src/compose-css.ts";

const themeCss = await readFile(
  new URL("../../design-tokens/theme.css", import.meta.url),
  "utf8",
);

await test("the composition takes every colour and the shadow from the design tokens", () => {
  // Strip the token stylesheet itself; what remains is the composition's own CSS.
  const own = composeCss(themeCss, "file:///fonts/").replace(themeCss, "");
  assert.ok(own.length > 200, "composition CSS is present");
  assert.doesNotMatch(own, /#[0-9a-f]{3,8}\b/iu, "no hard-coded hex colour");
  assert.doesNotMatch(
    own,
    /\b(?:rgba?|hsla?|oklch|oklab|lab|lch|color)\(/iu,
    "no hard-coded colour function",
  );
  assert.doesNotMatch(own, /box-shadow:\s*\d/u, "no hard-coded shadow");
  assert.match(own, /box-shadow:\s*var\(--st-shadow-raised\)/u);
});

await test("every token the composition references exists in the token stylesheet", () => {
  const own = composeCss(themeCss, "file:///fonts/").replace(themeCss, "");
  const used = [...own.matchAll(/var\((--st-[\w-]+)\)/gu)].map((m) => m[1]!);
  assert.ok(used.length >= 5, used.join());
  for (const name of new Set(used))
    assert.match(themeCss, new RegExp(`^\\s*${name}:`, "mu"), name);
});
