// SPDX-License-Identifier: AGPL-3.0-or-later
import { defineConfig } from "astro/config";
export default defineConfig({
  output: "static",
  outDir: process.env.SOURCE_TASTER_WEBSITE_OUTPUT ?? "./dist-preview",
  trailingSlash: "always",
  build: { inlineStylesheets: "never" },
  vite: {
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
