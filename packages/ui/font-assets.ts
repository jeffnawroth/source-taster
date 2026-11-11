// SPDX-License-Identifier: AGPL-3.0-or-later
import { readFileSync } from "node:fs";
import type { Plugin } from "vite";
/** Preserve the fonts' actual notices alongside hashed Vite font assets. */
export function fontNotices(): Plugin {
  return {
    name: "source-taster-font-notices",
    generateBundle() {
      for (const family of ["atkinsonhyperlegiblenext", "ibmplexmono"]) {
        this.emitFile({
          type: "asset",
          fileName: `notices/fonts/${family}-OFL.txt`,
          source: readFileSync(
            new URL(`./public/fonts/${family}/OFL.txt`, import.meta.url),
          ),
        });
      }
      this.emitFile({
        type: "asset",
        fileName: "notices/fonts/provenance.json",
        source: readFileSync(
          new URL("./public/fonts/provenance.json", import.meta.url),
        ),
      });
    },
  };
}
