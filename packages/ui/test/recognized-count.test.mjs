// SPDX-License-Identifier: AGPL-3.0-or-later
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { rolldown } from "rolldown";

test("the intake count uses the parser subpath without journal data and counts locally", async () => {
  // CI runs this suite before `pnpm build`, so core's dist may not exist yet:
  // bundle the subpath from its source, which is what the dist mirrors.
  const bundle = await rolldown({
    input: new URL("../src/recognized-count.ts", import.meta.url).pathname,
    resolve: {
      alias: {
        "@source-taster/core/structuring": new URL(
          "../../core/src/structuring.ts",
          import.meta.url,
        ).pathname,
      },
    },
  });
  const dir = await mkdtemp(join(tmpdir(), "st-count-"));
  try {
    const { output } = await bundle.generate({ format: "esm" });
    const chunks = output.filter((file) => file.type === "chunk");
    const modules = chunks.flatMap((chunk) => Object.keys(chunk.modules));
    assert.ok(
      !modules.some((name) => /nlm-journals|journal-abbreviation/.test(name)),
      modules.join("\n"),
    );
    const size = chunks.reduce((sum, c) => sum + Buffer.byteLength(c.code), 0);
    assert.ok(size < 200_000, `bundle is ${size} bytes`);
    const file = join(dir, "recognized-count.mjs");
    await writeFile(file, chunks[0].code);
    const { recognizedCount } = await import(pathToFileURL(file).href);
    assert.equal(recognizedCount(""), null);
    assert.equal(recognizedCount("   \n "), null);
    assert.equal(
      recognizedCount(
        "Doe, J. (2020). A first title. Journal of Tests, 1(2), 3–4.\n\nRoe, R. (2019). A second title. Journal of Tests, 5, 6–7.",
      ),
      2,
    );
  } finally {
    await bundle.close();
    await rm(dir, { recursive: true, force: true });
  }
});
