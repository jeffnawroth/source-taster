// SPDX-License-Identifier: AGPL-3.0-or-later
import { execFileSync } from "node:child_process";

export const appFontSource = {
  commit: "2e6828455032b79e1374e7c2247875e730219e12",
  upstream: "google/fonts@5bb28733cec313b63fbd415b574b5ae35c8aa8b8",
  provenance: "packages/ui/public/fonts/provenance.json",
  limitation:
    "The prototype requests Google Fonts by family and weight but archives no response bytes. These unmodified upstream binaries are pinned independently of the current product; they do not establish the historical response bytes.",
};
const cache = new Map<string, string>();
/** Freeze the source-requested font families/weights, independent of current product asset changes. */
export function appFontFaces(root: string) {
  const face = (family: string, weight: string, path: string) => {
    const key = `${root}:${path}`;
    let bytes = cache.get(key);
    if (!bytes) {
      bytes = execFileSync(
        "git",
        ["show", `${appFontSource.commit}:packages/ui/public/fonts/${path}`],
        { cwd: root, maxBuffer: 8 * 1024 * 1024 },
      ).toString("base64");
      cache.set(key, bytes);
    }
    return `@font-face{font-family:"${family}";font-style:normal;font-weight:${weight};src:url(data:font/ttf;base64,${bytes})}`;
  };
  return [
    face(
      "Atkinson Hyperlegible Next",
      "200 800",
      "atkinsonhyperlegiblenext/AtkinsonHyperlegibleNext[wght].ttf",
    ),
    face("IBM Plex Mono", "400", "ibmplexmono/IBMPlexMono-Regular.ttf"),
    face("IBM Plex Mono", "500", "ibmplexmono/IBMPlexMono-Medium.ttf"),
    face("IBM Plex Mono", "600", "ibmplexmono/IBMPlexMono-SemiBold.ttf"),
  ].join("\n");
}
