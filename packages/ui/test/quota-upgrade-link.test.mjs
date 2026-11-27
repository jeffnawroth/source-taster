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

// SU-QU-06: the quota warning's "Change plan" link opens the plan page in a
// new tab, without handing the opener or the referrer to it; with no plan
// page (a standalone build) there is no link.
test("the quota warning's upgrade link opens the plan page in a new tab", async () => {
  const ui = new URL("../", import.meta.url);
  const i18n = new URL("../../i18n/", import.meta.url).pathname;
  const work = await mkdtemp(join(tmpdir(), "st-quota-upgrade-"));
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
    `import { renderToStaticMarkup } from "react-dom/server";
     import { createElement } from "react";
     import { QuotaBalance, QuotaMeter } from ${JSON.stringify(new URL("src/quota-panel.tsx", ui).pathname)};
     const quota = { granted: 10, remaining: 0, reserved: 0, warning: "exhausted" };
     export const render = (component, upgradeUrl) => renderToStaticMarkup(
       createElement(component === "meter" ? QuotaMeter : QuotaBalance, { quota, upgradeUrl }),
     );`,
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
      `.quota-upgrade-${process.pid}.mjs`,
    );
    await writeFile(file, output[0].code);
    try {
      const { render } = await import(pathToFileURL(file).href);
      for (const component of ["balance", "meter"]) {
        const hosted = render(component, "https://service.example/plan");
        const links = [...hosted.matchAll(/<a\b([^>]*)>([^<]*)<\/a>/gu)];
        assert.equal(links.length, 1, component);
        const [, attributes, text] = links[0];
        assert.equal(text, "Change plan", component);
        assert.match(attributes, /\bhref="https:\/\/service\.example\/plan"/u);
        assert.match(attributes, /\btarget="_blank"/u);
        assert.match(attributes, /\brel="noopener noreferrer"/u);
        assert.match(hosted, /Your quota is used up\./u);
        const standalone = render(component, undefined);
        assert.match(standalone, /Your quota is used up\./u);
        assert.doesNotMatch(standalone, /<a\b/u);
      }
    } finally {
      await rm(file, { force: true });
    }
  } finally {
    await bundle.close();
    await rm(work, { recursive: true, force: true });
  }
});
