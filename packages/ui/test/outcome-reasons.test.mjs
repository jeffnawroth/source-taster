// SPDX-License-Identifier: AGPL-3.0-or-later
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { rolldown } from "rolldown";

// SU-RE-13: every Verdict reason the service can send is explained in plain
// words, in the person's language, never as the raw identifier.
const keys = {
  "url-unavailable": "reason_url_unavailable",
  "web-original-unavailable": "reason_web_original_unavailable",
  "outside-coverage": "reason_outside_coverage",
  "doi-nonexistent": "reason_doi_nonexistent",
  "foreign-doi": "reason_foreign_doi",
  "mandatory-resolution-incomplete": "reason_resolution_incomplete",
  "metadata-unavailable": "reason_metadata_unavailable",
  "url-verification-incomplete": "reason_url_incomplete",
  "identity-unresolved": "reason_identity_unresolved",
  "development-route-incomplete": "reason_route_incomplete",
  identified: "reason_identified",
  "fields-differ": "reason_fields_differ",
  "mixed-components": "reason_mixed_components",
  "search-completed": "reason_search_completed",
  "ambiguous-identity": "reason_ambiguous_identity",
  "insufficient-search": "reason_insufficient_search",
  "sources-unavailable": "reason_sources_unavailable",
};

test("the reasons list explains each Verdict reason in English and German", async () => {
  const ui = new URL("../", import.meta.url);
  const i18n = new URL("../../i18n/", import.meta.url).pathname;
  const work = await mkdtemp(join(tmpdir(), "st-reasons-"));
  // CI runs this suite before `pnpm build`: compile the catalogs into the
  // temp dir, as the build would.
  const messages = join(work, "paraglide");
  await promisify(execFile)(
    join(i18n, "node_modules", ".bin", "paraglide-js"),
    [
      "compile",
      "--project",
      "./project.inlang",
      "--outdir",
      messages,
      "--strategy",
      "globalVariable",
      "baseLocale",
    ],
    { cwd: i18n },
  );
  const entry = join(work, "entry.tsx");
  await writeFile(
    entry,
    `export { outcomeReasons } from ${JSON.stringify(new URL("src/reference-outcome.tsx", ui).pathname)};
     export { setLocale } from "@source-taster/i18n/runtime";`,
  );
  const bundle = await rolldown({
    input: entry,
    cwd: new URL(".", ui).pathname,
    resolve: {
      alias: {
        "@source-taster/i18n/runtime": join(messages, "runtime.js"),
        "@source-taster/i18n": join(messages, "messages.js"),
      },
    },
    external: (id) => /^(react|react-dom)(\/|$)/u.test(id),
  });
  try {
    const { output } = await bundle.generate({ format: "esm" });
    const file = join(
      new URL(".", ui).pathname,
      "test",
      `.reasons-${process.pid}.mjs`,
    );
    await writeFile(file, output[0].code);
    try {
      const { outcomeReasons, setLocale } = await import(
        pathToFileURL(file).href
      );
      const catalogs = {};
      for (const locale of ["en", "de"])
        catalogs[locale] = JSON.parse(
          await readFile(join(i18n, "messages", `${locale}.json`), "utf8"),
        );
      const seen = new Set();
      for (const locale of ["en", "de"]) {
        setLocale(locale, { reload: false });
        for (const [reason, key] of Object.entries(keys)) {
          const [text] = outcomeReasons({ kind: "verdict", reasons: [reason] });
          assert.equal(text, catalogs[locale][key], `${locale} ${reason}`);
          assert.ok(text.length > 20, `${locale} ${reason} is a sentence`);
          assert.notEqual(text, reason);
          seen.add(`${locale}:${text}`);
        }
      }
      // 17 reasons, each distinct, in two languages.
      assert.equal(seen.size, Object.keys(keys).length * 2);
      // A reason list keeps the service's order, and a Status has none.
      setLocale("en", { reload: false });
      assert.deepEqual(
        outcomeReasons({
          kind: "verdict",
          reasons: ["fields-differ", "identified"],
        }),
        [catalogs.en.reason_fields_differ, catalogs.en.reason_identified],
      );
      assert.deepEqual(
        outcomeReasons({ kind: "status", status: "unchecked" }),
        [],
      );
    } finally {
      await rm(file, { force: true });
    }
  } finally {
    await bundle.close();
    await rm(work, { recursive: true, force: true });
  }
});
