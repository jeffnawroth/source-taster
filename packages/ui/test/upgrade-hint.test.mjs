// SPDX-License-Identifier: AGPL-3.0-or-later
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { rolldown } from "rolldown";

// Standalone builds sell no plan: the server may still flag a guest reason
// as upgradeable, but the offer only renders with a hosted upgrade link.
test("the AI upgrade offer renders only with an upgrade link", async () => {
  const ui = new URL("../", import.meta.url);
  const i18n = new URL("../../i18n/", import.meta.url).pathname;
  const work = await mkdtemp(join(tmpdir(), "st-upgrade-"));
  // CI runs this suite before `pnpm build`, so the generated messages may not
  // exist yet: compile the catalogs into the temp dir, as the build would.
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
    `import { renderToStaticMarkup } from "react-dom/server";
     import { createElement } from "react";
     import { StructuringResults } from ${JSON.stringify(new URL("src/structuring-results.tsx", ui).pathname)};
     export const render = (upgradeUrl) => renderToStaticMarkup(createElement(StructuringResults, {
       result: { references: [], rejected: [], guidance: "no-references", ai: { reason: "guest", upgrade: true, fallbacks: [] } },
       upgradeUrl,
     }));`,
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
      `.upgrade-${process.pid}.mjs`,
    );
    await writeFile(file, output[0].code);
    try {
      const { render } = await import(pathToFileURL(file).href);
      const standalone = render(undefined);
      assert.match(standalone, /The parser was used\./u);
      assert.doesNotMatch(standalone, /paid plan/u);
      assert.doesNotMatch(standalone, /<a\b/u);
      const hosted = render("https://service.example/plan");
      assert.match(hosted, /Upgrade to a paid plan for AI extraction\./u);
      assert.match(hosted, /href="https:\/\/service\.example\/plan"/u);
    } finally {
      await rm(file, { force: true });
    }
  } finally {
    await bundle.close();
    await rm(work, { recursive: true, force: true });
  }
});
