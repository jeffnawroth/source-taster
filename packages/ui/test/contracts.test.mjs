// SPDX-License-Identifier: AGPL-3.0-or-later
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { rolldown } from "rolldown";
const root = new URL("../", import.meta.url);

test("static recipe entry imports and bundles without React, RAC, icons or client directives", async () => {
  const script = `import {registerHooks} from 'node:module';
    registerHooks({resolve(specifier,context,next) { if (/^(react|react-dom|react-aria|lucide)/.test(specifier)) throw Error('Client dependency: '+specifier); return next(specifier,context); }});
    const recipes = await import('@source-taster/ui/recipes');
    for (const name of ['buttonRecipe','linkRecipe','badgeRecipe','bannerRecipe','kbdRecipe']) {
      if (typeof recipes[name]() !== 'string' || !recipes[name]()) throw Error(name);
    }`;
  const result = spawnSync(
    process.execPath,
    ["--input-type=module", "-e", script],
    { cwd: root, encoding: "utf8" },
  );
  assert.equal(result.status, 0, result.stderr);
  const bundle = await rolldown({
    input: new URL("../src/recipes.ts", import.meta.url).pathname,
  });
  try {
    const { output } = await bundle.generate({ format: "esm", minify: true });
    const chunks = output.filter((file) => file.type === "chunk");
    assert.ok(chunks.length);
    const modules = chunks.flatMap((chunk) => Object.keys(chunk.modules));
    assert.ok(modules.some((name) => name.includes("tailwind-variants")));
    assert.ok(
      !modules.some((name) =>
        /(?:react(?:-dom|-aria|-stately)?|lucide)/.test(name),
      ),
      modules.join("\n"),
    );
    assert.ok(
      !chunks.some((chunk) =>
        /use client|react\/jsx-runtime|hydrateRoot|createRoot/.test(chunk.code),
      ),
    );
    assert.ok(
      chunks.reduce((sum, chunk) => sum + Buffer.byteLength(chunk.code), 0) <
        30_000,
    );
  } finally {
    await bundle.close();
  }
});

test("bounded Toast shim pins stable RAC and fails when its stable exit becomes available", async () => {
  const pkg = JSON.parse(await readFile(new URL("package.json", root), "utf8"));
  assert.equal(pkg.dependencies["react-aria-components"], "1.22.1");
  const rac = await import("react-aria-components");
  assert.equal(typeof rac.UNSTABLE_Toast, "object");
  assert.equal(typeof rac.UNSTABLE_ToastRegion, "object");
  assert.ok(
    !("Toast" in rac) && !("ToastRegion" in rac),
    "Stable exports exist: remove the unstable shim and update keyboard/live-region tests.",
  );
  const dir = new URL("src/primitives/", root);
  for (const name of await readdir(dir)) {
    const source = await readFile(new URL(name, dir), "utf8");
    const imports = source.match(/\bUNSTABLE_\w+/g) ?? [];
    assert.deepEqual(
      imports.sort(),
      name === "toast.tsx" ? ["UNSTABLE_Toast", "UNSTABLE_ToastRegion"] : [],
      name,
    );
    assert.ok(
      !/(?:bg|text|border)-(?:blue|red|green|gray|neutral|white|black)-?\d*\b|\bdark:|#(?:[a-f\d]{3}){1,2}\b|--st-prim-/.test(
        source,
      ),
      name,
    );
  }
});

test("reference editing surfaces use the shared primitives, not raw controls or local control classes", async () => {
  for (const name of [
    "reference-actions.tsx",
    "reference-list-actions.tsx",
    "reference-fields.tsx",
    "correction-suggestions.tsx",
  ]) {
    const source = await readFile(new URL(`src/${name}`, root), "utf8");
    assert.ok(
      !/<(?:button|input|textarea|select)\b/u.test(source),
      `${name} renders a raw form control instead of Button, TextField, Checkbox or Form`,
    );
    assert.ok(
      !/^const (?:control|action|buttonClass)\b/mu.test(source),
      `${name} keeps a local control class`,
    );
  }
});
