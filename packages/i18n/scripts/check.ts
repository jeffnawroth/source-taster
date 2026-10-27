// SPDX-License-Identifier: AGPL-3.0-or-later
import { readFile } from "node:fs/promises";
const catalogs = await Promise.all(
  ["en", "de"].map(
    async (locale) =>
      JSON.parse(
        await readFile(
          new URL(`../messages/${locale}.json`, import.meta.url),
          "utf8",
        ),
      ) as Record<string, unknown>,
  ),
);
const keys = new Set(catalogs.flatMap((catalog) => Object.keys(catalog)));
for (const key of keys) {
  for (const [index, catalog] of catalogs.entries()) {
    const message = catalog[key];
    if (typeof message !== "string" || !message.trim())
      throw new Error(
        `Missing or empty ${["en", "de"][index]} message: ${key}`,
      );
  }
}
console.log(`Validated ${keys.size} messages in DE and EN`);
