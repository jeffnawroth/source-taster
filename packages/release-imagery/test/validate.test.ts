// SPDX-License-Identifier: AGPL-3.0-or-later
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { PNG } from "pngjs";
import { readPngInfo, validateImages, xCardProblems } from "../src/validate.ts";
import type { Manifest } from "../src/manifest.ts";

const sha = (bytes: Buffer) => createHash("sha256").update(bytes).digest("hex");
const png = (width: number, height: number, colorType: 2 | 6 = 2) => {
  const image = new PNG({ width, height });
  image.data.fill(255);
  return PNG.sync.write(image, { colorType });
};
const entry = (file: string, bytes: Buffer, width: number, height: number) =>
  ({
    file,
    role: "promo-small",
    width,
    height,
    format: "png",
    sha256: sha(bytes),
    claims: [],
    alt: { en: "alt", de: "alt" },
    devPreviewNotice: { carried: false, reason: "test tile" },
    sources: { captures: [], compose: "x" },
  }) as Manifest["images"][number];
async function directory(
  files: Record<string, Buffer>,
  images: Manifest["images"],
) {
  const dir = await mkdtemp(join(tmpdir(), "st215-validate-"));
  for (const [name, bytes] of Object.entries(files))
    await writeFile(join(dir, name), bytes);
  return {
    dir,
    manifest: { status: "dry-run", images } as unknown as Manifest,
    remove: () => rm(dir, { recursive: true, force: true }),
  };
}

await test("the IHDR reader reports size, depth and colour type, and rejects non-PNG bytes", () => {
  assert.deepEqual(readPngInfo(png(7, 5)), {
    width: 7,
    height: 5,
    bitDepth: 8,
    colorType: 2,
  });
  assert.deepEqual(readPngInfo(png(7, 5, 6)).colorType, 6);
  assert.throws(() => readPngInfo(Buffer.from("\xff\xd8\xffJFIF", "latin1")));
});

await test("a matching opaque PNG with a recorded hash passes", async () => {
  const bytes = png(440, 280);
  const d = await directory({ "a.png": bytes }, [
    entry("a.png", bytes, 440, 280),
  ]);
  try {
    assert.deepEqual(await validateImages(d.dir, d.manifest), []);
  } finally {
    await d.remove();
  }
});

await test("wrong dimensions, alpha, a changed file, a missing file and an unlisted file are each reported", async () => {
  const wrongSize = png(441, 280);
  const alpha = png(440, 280, 6);
  const original = png(440, 280);
  const d = await directory(
    {
      "size.png": wrongSize,
      "alpha.png": alpha,
      "changed.png": png(440, 281),
      "extra.png": original,
    },
    [
      entry("size.png", wrongSize, 440, 280),
      entry("alpha.png", alpha, 440, 280),
      entry("changed.png", original, 440, 280),
      entry("missing.png", original, 440, 280),
    ],
  );
  try {
    const problems = (await validateImages(d.dir, d.manifest)).join("\n");
    assert.match(problems, /size\.png: expected 440x280, found 441x280/);
    assert.match(problems, /alpha\.png: .*opaque RGB/);
    assert.match(problems, /changed\.png: .*sha256/);
    assert.match(problems, /missing\.png: .*missing/);
    assert.match(problems, /extra\.png: .*not listed/);
  } finally {
    await d.remove();
  }
});

await test("an X card must be 2:1, within X's size limits and under 5 MB", async () => {
  const ok = png(1200, 600);
  const askew = png(1200, 630);
  const d = await directory({ "ok.png": ok, "askew.png": askew }, [
    { ...entry("ok.png", ok, 1200, 600), role: "x-card" },
    { ...entry("askew.png", askew, 1200, 630), role: "x-card" },
  ]);
  try {
    const problems = (await validateImages(d.dir, d.manifest)).join("\n");
    assert.doesNotMatch(problems, /ok\.png/);
    assert.match(problems, /askew\.png: X card ratio must be 2:1/);
  } finally {
    await d.remove();
  }
  const info = (width: number, height: number) => ({
    width,
    height,
    bitDepth: 8,
    colorType: 2,
  });
  assert.deepEqual(xCardProblems("a", info(1200, 600), 1024), []);
  assert.deepEqual(xCardProblems("a", info(4096, 2048), 1024), []);
  assert.match(xCardProblems("a", info(298, 149), 1)[0] ?? "", /300x157/);
  assert.match(xCardProblems("a", info(8192, 4096), 1)[0] ?? "", /4096x4096/);
  assert.match(
    xCardProblems("a", info(1200, 600), 5_000_000).join(),
    /less than 5 MB/,
  );
});
