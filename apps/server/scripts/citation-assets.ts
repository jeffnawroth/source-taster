// SPDX-License-Identifier: AGPL-3.0-or-later
import { cp, readFile } from "node:fs/promises";
import { citationStyles } from "@source-taster/contract-common";
const manifest = JSON.parse(
  await readFile(
    new URL("../src/citations/assets/manifest.json", import.meta.url),
    "utf8",
  ),
) as { styles: Record<string, { locale: string }> };
if (
  Object.keys(manifest.styles).length !== citationStyles.length ||
  citationStyles.some(
    ({ id, locale }) => manifest.styles[id]?.locale !== locale,
  )
) {
  throw new Error(
    "Pinned renderer assets disagree with the public style/locale manifest",
  );
}
// tsc emits code; pinned XML/CSL and license notices travel with the server build.
await cp(
  new URL("../src/citations/assets", import.meta.url),
  new URL("../dist/citations/assets", import.meta.url),
  { recursive: true },
);
