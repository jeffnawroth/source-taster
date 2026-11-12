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
  const placeholders = catalogs.map((catalog) =>
    [...(catalog[key] as string).matchAll(/\{(\w+)\}/gu)]
      .map((match) => match[1])
      .sort(),
  );
  if (JSON.stringify(placeholders[0]) !== JSON.stringify(placeholders[1]))
    throw new Error(`DE/EN placeholder mismatch: ${key}`);
}
console.log(`Validated ${keys.size} messages in DE and EN`);
