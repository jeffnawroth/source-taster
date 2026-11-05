// SPDX-License-Identifier: AGPL-3.0-or-later
// One codebase, two explicit targets: `vite build --mode chromium|firefox`.
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { readFileSync } from "node:fs";
import {
  extensionConfig,
  manifest,
  parseTarget,
  type ExtensionConfig,
  type Target,
} from "./extension-config.ts";

function extensionPackage(target: Target, config: ExtensionConfig): Plugin {
  return {
    name: "source-taster-extension",
    generateBundle(_, bundle) {
      for (const output of Object.values(bundle)) {
        // The background must load alone; panel code never shares its chunk.
        if (
          output.type === "chunk" &&
          output.fileName === "background.js" &&
          (output.imports.length || output.dynamicImports.length)
        )
          throw new Error("The background script must not import chunks");
        // All executable code ships in the package; nothing is fetched at runtime.
        if (
          output.type === "chunk" &&
          /\bimport\(\s*["']https?:|<script[^>]+src=["']https?:/.test(
            output.code,
          )
        )
          throw new Error(`Remote code reference in ${output.fileName}`);
      }
      this.emitFile({
        type: "asset",
        fileName: "manifest.json",
        source: `${JSON.stringify(manifest(target, config), null, 2)}\n`,
      });
      for (const locale of ["de", "en"]) {
        const catalog = JSON.parse(
          readFileSync(
            new URL(
              `../../packages/i18n/messages/${locale}.json`,
              import.meta.url,
            ),
            "utf8",
          ),
        ) as Record<string, string>;
        this.emitFile({
          type: "asset",
          fileName: `_locales/${locale}/messages.json`,
          source: JSON.stringify({
            check_selected_text: { message: catalog.selection_menu },
          }),
        });
      }
    },
  };
}

export default defineConfig(({ mode }) => {
  const target = parseTarget(mode);
  const config = extensionConfig(process.env);
  return {
    base: "./",
    plugins: [react(), tailwindcss(), extensionPackage(target, config)],
    define: {
      __SOURCE_TASTER_EXTENSION__: JSON.stringify(config),
      // A bare constant, so the other target's code is removed from the bundle.
      __SOURCE_TASTER_TARGET__: JSON.stringify(target),
    },
    build: {
      outDir: process.env.SOURCE_TASTER_EXTENSION_OUT_DIR ?? `dist/${target}`,
      emptyOutDir: true,
      // Extension pages allow only packaged 'self' scripts, never inline ones.
      modulePreload: { polyfill: false },
      assetsInlineLimit: 0,
      rolldownOptions: {
        input: { panel: "panel.html", background: "src/background.ts" },
        output: {
          entryFileNames: (chunk) =>
            chunk.name === "background"
              ? "background.js"
              : "assets/[name]-[hash].js",
        },
      },
    },
  };
});
