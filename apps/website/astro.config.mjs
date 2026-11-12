// SPDX-License-Identifier: AGPL-3.0-or-later
import { defineConfig } from "astro/config";
import { readFile } from "node:fs/promises";
import { compile } from "tailwindcss";
import {
  buttonRecipe,
  linkRecipe,
  badgeRecipe,
  bannerRecipe,
  kbdRecipe,
} from "@source-taster/ui/recipes";

// Compile only the statically used recipes with Tailwind's pure JS API. The
// site's controlled native build remains unchanged; no Oxide scanner or CSS
// native plugin is needed for this finite class set.
const recipeStyles = {
  name: "website-static-recipes",
  resolveId(id) {
    if (id === "virtual:website-recipes.css") return `\0${id}`;
  },
  async load(id) {
    if (id !== "\0virtual:website-recipes.css") return;
    const css = await Promise.all([
      readFile(new URL(import.meta.resolve("tailwindcss/theme.css")), "utf8"),
      readFile(
        new URL(import.meta.resolve("tailwindcss/preflight.css")),
        "utf8",
      ),
      readFile(
        new URL("../../packages/design-tokens/theme.css", import.meta.url),
        "utf8",
      ),
    ]);
    const compiler = await compile(
      `@layer theme, base, components, utilities;\n@layer theme {${css[0]}}\n@layer base {${css[1]}}\n${css[2]}\n@tailwind utilities;`,
    );
    const classes = [
      buttonRecipe(),
      buttonRecipe({ variant: "primary" }),
      buttonRecipe({ variant: "ghost", size: "sm" }),
      linkRecipe(),
      badgeRecipe(),
      bannerRecipe({ tone: "warning" }),
      kbdRecipe(),
    ];
    return compiler.build([...new Set(classes.join(" ").split(/\s+/))]);
  },
};
export default defineConfig({
  output: "static",
  outDir: process.env.SOURCE_TASTER_WEBSITE_OUTPUT ?? "./dist-preview",
  trailingSlash: "always",
  build: { inlineStylesheets: "never" },
  vite: {
    plugins: [recipeStyles],
    // No optional native CSS tooling (Lightning CSS) and no esbuild: PostCSS
    // transforms, CSS stays unminified (#115).
    css: { transformer: "postcss" },
    build: {
      cssMinify: false,
      assetsInlineLimit: 0,
      // Route-derived names such as "_..css" from [...route] would be refused
      // by the hosting boundary's ".." guard; content hashes are enough.
      rollupOptions: {
        output: {
          assetFileNames: "_astro/[hash][extname]",
          chunkFileNames: "_astro/[hash].js",
          entryFileNames: "_astro/[hash].js",
        },
      },
    },
  },
});
