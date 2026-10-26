import { defineConfig } from "astro/config";
export default defineConfig({
  output: "static",
  outDir: process.env.SOURCE_TASTER_WEBSITE_OUTPUT ?? "./dist-preview",
  trailingSlash: "always",
  build: { inlineStylesheets: "never" },
  vite: { build: { assetsInlineLimit: 0 } },
});
