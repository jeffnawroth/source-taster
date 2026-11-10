// SPDX-License-Identifier: AGPL-3.0-or-later
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import {
  cp,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve as pathResolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { compile } from "tailwindcss";
import { parse, wcagContrast } from "culori";
import { colors, opaque, correctionLayers } from "../dist/index.js";
import { color, over, resolve } from "../scripts/colors.ts";
import { assertContrast, contrastPairs } from "../scripts/contrast.ts";

const root = fileURLToPath(new URL("..", import.meta.url));
const workspace = pathResolve(root, "../..");
const run = (args: string[], cwd = root) =>
  execFileSync("pnpm", args, { cwd, encoding: "utf8" });

void test("the accepted 158 named WCAG pairs retain their published ratios", async () => {
  const pairs = assertContrast(resolve());
  const document = await readFile(
    join(workspace, "docs/design/tokens-check/contrast-evidence.md"),
    "utf8",
  );
  const rows = document
    .split("\n")
    .filter(
      (line) => /^\| (light|dark) \|/.test(line) && !line.includes("| info |"),
    );
  assert.equal(rows.length, 158);
  const published = rows.map((row) =>
    row
      .split("|")
      .slice(1, -1)
      .map((cell) => cell.trim().replaceAll("`", "")),
  );
  for (const p of pairs) {
    const found = published.find(
      ([mode, fg, bg]) =>
        mode === p.mode && fg === p.foreground && bg === p.background,
    );
    assert.ok(found, `Missing baseline pair: ${JSON.stringify(p)}`);
    assert.equal(p.ratio.toFixed(2), found[4]);
  }
  assert.throws(() => color([0.8, 0.4, 262]), /Outside sRGB/);
  assert.throws(() => color([0.5, 0, 0], -0.1), /Invalid/);
  const bad = resolve();
  bad.light.text = bad.light.surface;
  assert.throws(() => assertContrast(bad), /WCAG failures/);
});

void test("insertion contrast measures the actual alpha line over its alpha background", () => {
  const palette = resolve();
  for (const mode of ["light", "dark"] as const) {
    const t = palette[mode];
    const bg = over(t["correction-insert-bg"], t.surface);
    const pair = contrastPairs(palette).find(
      (p) =>
        p.mode === mode &&
        p.foreground === "correction-insert-line (composited)",
    );
    assert.ok(pair);
    assert.equal(
      pair.ratio,
      wcagContrast(over(t["correction-insert-line"], bg), bg),
    );
    assert.notEqual(pair.ratio, wcagContrast(t["correction-insert-line"], bg));
    assert.deepEqual(
      colors[mode]["correction-insert-bg"],
      colors[mode]["correction-delete-bg"],
    );
    assert.deepEqual(
      colors[mode]["correction-insert-line"],
      colors[mode]["correction-delete-line"],
    );
  }
});

void test("medium constants use six-digit hex and preserve source alpha on named backdrops", () => {
  assert.deepEqual(colors.light.border, { color: "#1d2842", alpha: 0.11 });
  assert.deepEqual(colors.dark.accent, { color: "#8bb4fe", alpha: 1 });
  assert.equal(opaque.white.border, "#e6e7ea");
  assert.equal(opaque["light-canvas"].border, "#dde1e8");
  // Independent integer-channel witness, including the correction background.
  const composite = (top: string, bottom: string, alpha: number) =>
    "#" +
    [1, 3, 5]
      .map((i) =>
        Math.round(
          parseInt(top.slice(i, i + 2), 16) * alpha +
            parseInt(bottom.slice(i, i + 2), 16) * (1 - alpha),
        )
          .toString(16)
          .padStart(2, "0"),
      )
      .join("");
  assert.equal(
    composite("#404858", "#f2f2f3", 0.9),
    correctionLayers.white.insert.line,
  );
  const palettes: Readonly<Record<string, { color: string; alpha: number }>>[] =
    [colors.light, colors.dark];
  for (const mode of palettes)
    for (const value of Object.values(mode))
      assert.match(value.color, /^#[0-9a-f]{6}$/);
  for (const backdrop of Object.values(opaque))
    for (const value of Object.values(backdrop))
      assert.match(value, /^#[0-9a-f]{6}$/);
  assert.equal(correctionLayers.white.insert.background, "#f2f2f3");
  assert.equal(correctionLayers.white.insert.line, "#525968");
  assert.notEqual(
    correctionLayers.white.insert.line,
    opaque.white["correction-insert-line"],
  );
  assert.ok(parse(opaque.white.text));
});

void test("Tailwind 4 compiles semantic utilities and removes replaced defaults and primitives", async () => {
  const compiler = await compile(
    '@import "tailwindcss/theme.css" layer(theme);\n@import "@source-taster/design-tokens/theme.css";\n@tailwind utilities;',
    {
      loadStylesheet: async (id) => ({
        path: id,
        base: root,
        content: await readFile(
          id === "tailwindcss/theme.css"
            ? join(root, "node_modules/tailwindcss/theme.css")
            : join(root, "theme.css"),
          "utf8",
        ),
      }),
    },
  );
  const valid = [
    "bg-surface",
    "text-text-muted",
    "border-border-strong",
    "fill-verdict-not-found-mark",
    "font-sans",
    "font-mono",
    "text-base",
    "rounded-xl",
    "shadow-glass",
    "ease-spring",
    "p-4",
  ];
  const invalid = [
    "bg-blue-500",
    "bg-neutral-925",
    "bg-prim-neutral-925",
    "font-serif",
    "text-9xl",
    "rounded-4xl",
    "shadow-2xl",
    "ease-in-out",
  ];
  const css = compiler.build([...valid, ...invalid]);
  for (const name of valid)
    assert.ok(css.includes(`.${name} {`), `Missing ${name}`);
  for (const name of invalid)
    assert.ok(!css.includes(`.${name} {`), `Leaked ${name}`);
  assert.match(css, /background-color: var\(--st-surface\)/);
  assert.match(css, /font-size: var\(--st-text-base\)/);
  assert.match(css, /:root:not\(\[data-theme="light"\]\)/);
  assert.match(css, /:root\[data-theme="dark"\]/);
  assert.match(css, /prefers-color-scheme: dark/);
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.match(css, /--st-duration-spring: 0ms/);
});

void test("regeneration is byte-stable and the CLI refuses drift, gamut and contrast failures", async () => {
  run(["check"]);
  run(["tokens:generate"]);
  run(["check"]);
  const temp = await mkdtemp(join(tmpdir(), "st-token-drift-"));
  try {
    for (const name of ["src", "scripts", "dist", "theme.css", "package.json"])
      await cp(join(root, name), join(temp, name), { recursive: true });
    await symlink(
      join(root, "node_modules"),
      join(temp, "node_modules"),
      "dir",
    );
    const file = join(temp, "theme.css");
    await writeFile(file, "/* stale */\n");
    const result = spawnSync(
      process.execPath,
      ["scripts/generate.ts", "--check"],
      { cwd: temp, encoding: "utf8" },
    );
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /Generated token drift: theme.css/);
    assert.equal(await readFile(file, "utf8"), "/* stale */\n");
    await cp(join(root, "theme.css"), file);
    const sourcePath = join(temp, "src/tokens.ts");
    const source = await readFile(sourcePath, "utf8");
    const controls = [
      {
        before: '"neutral-1000": [1, 0, 0]',
        after: '"neutral-1000": [1, 0.4, 0]',
        error: /Outside sRGB/,
      },
      {
        before: 'text: ["neutral-200"]',
        after: 'text: ["neutral-1000"]',
        error: /WCAG failures/,
      },
    ];
    for (const control of controls) {
      assert.ok(source.includes(control.before));
      await writeFile(
        sourcePath,
        source.replace(control.before, control.after),
      );
      const rejected = spawnSync(
        process.execPath,
        ["scripts/generate.ts", "--check"],
        { cwd: temp, encoding: "utf8" },
      );
      assert.notEqual(rejected.status, 0);
      assert.match(rejected.stderr, control.error);
    }
  } finally {
    await rm(temp, { recursive: true, force: true });
  }
});

void test("the packed package imports without development tools and exposes only values/CSS", async () => {
  const temp = await mkdtemp(join(tmpdir(), "st-token-pack-"));
  try {
    run(["pack", "--out", join(temp, "tokens.tgz")]);
    const files = execFileSync("tar", ["-tzf", join(temp, "tokens.tgz")], {
      encoding: "utf8",
    })
      .trim()
      .split("\n")
      .sort();
    assert.deepEqual(
      files,
      [
        "LICENSE",
        "LICENSE-AGPL",
        "LICENSE-MIT",
        "NOTICE.md",
        "README.md",
        "dist/index.d.ts",
        "dist/index.js",
        "package.json",
        "theme.css",
      ]
        .map((n) => `package/${n}`)
        .sort(),
    );
    execFileSync("tar", ["-xzf", join(temp, "tokens.tgz"), "-C", temp]);
    const manifest = JSON.parse(
      await readFile(join(temp, "package/package.json"), "utf8"),
    ) as Record<string, unknown>;
    for (const field of [
      "dependencies",
      "peerDependencies",
      "optionalDependencies",
      "bundledDependencies",
      "bundleDependencies",
    ])
      assert.ok(!(field in manifest), `Forbidden runtime graph: ${field}`);
    assert.equal(manifest.license, "AGPL-3.0-or-later OR MIT");
    assert.deepEqual(Object.keys(manifest.exports as object).sort(), [
      ".",
      "./theme.css",
    ]);
    const js = await readFile(join(temp, "package/dist/index.js"), "utf8");
    assert.doesNotMatch(
      js,
      /\b(import|require|function|class|localStorage|sessionStorage)\b|=>/,
    );
    // Resolve imports through the actual package exports in an isolated consumer.
    await mkdir(join(temp, "node_modules/@source-taster"), { recursive: true });
    await symlink(
      join(temp, "package"),
      join(temp, "node_modules/@source-taster/design-tokens"),
      "dir",
    );
    execFileSync(
      process.execPath,
      [
        "--input-type=module",
        "-e",
        'import {colors, opaque} from "@source-taster/design-tokens"; import {readFileSync} from "node:fs"; if(colors.light.text.color !== opaque.white.text) process.exit(1); readFileSync(new URL(import.meta.resolve("@source-taster/design-tokens/theme.css")));',
      ],
      { cwd: temp },
    );
    await writeFile(
      join(temp, "consumer.mts"),
      'import { colors, opaque } from "@source-taster/design-tokens"; import type {Role, Mode, Backdrop} from "@source-taster/design-tokens"; const role: Role = "correction-insert-line"; const mode: Mode = "dark"; const bg: Backdrop = "white"; colors[mode][role].alpha; opaque[bg][role];\n// @ts-expect-error roles are readonly\ncolors.light.text.color = "#000000";\n// @ts-expect-error historical role was removed\ncolors.light["chart-track"];\n',
    );
    await writeFile(
      join(temp, "tsconfig.json"),
      JSON.stringify({
        compilerOptions: {
          noEmit: true,
          strict: true,
          module: "nodenext",
          target: "es2024",
          types: [],
        },
        files: ["consumer.mts"],
      }),
    );
    run(["exec", "tsc", "-p", join(temp, "tsconfig.json")], workspace);
  } finally {
    await rm(temp, { recursive: true, force: true });
  }
});
