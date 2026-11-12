// SPDX-License-Identifier: AGPL-3.0-or-later
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import { test } from "node:test";
import { PNG } from "pngjs";

const root = new URL("../", import.meta.url);
const read = (path: string) => readFile(new URL(path, root));
const sha256 = (bytes: Buffer) =>
  createHash("sha256").update(bytes).digest("hex");

interface Export {
  file: string;
  group: string;
  basis: "mandatory" | "chosen" | "optional";
  size?: number;
  master?: string;
  masterSha256?: string;
  entries?: number[];
  sha256: string;
}
const record = JSON.parse(
  (await read("exports/manifest.json")).toString("utf8"),
) as { masters: Record<string, string>; exports: Export[] };
const byFile = new Map(record.exports.map((entry) => [entry.file, entry]));
const png = async (file: string) =>
  PNG.sync.read(await read(`exports/${file}`));

/** Painted bounds: the smallest box holding every pixel with alpha > floor. */
function alphaBounds(image: PNG, floor = 0) {
  let [minX, minY, maxX, maxY] = [image.width, image.height, -1, -1];
  let minAlpha = 255;
  for (let y = 0; y < image.height; y++)
    for (let x = 0; x < image.width; x++) {
      const alpha = image.data[(y * image.width + x) * 4 + 3]!;
      minAlpha = Math.min(minAlpha, alpha);
      if (alpha <= floor) continue;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  return { box: [minX, minY, maxX, maxY], minAlpha };
}

const sizes = (
  prefix: string,
  list: number[],
  rest: Omit<Export, "file" | "sha256">,
) => list.map((size) => ({ file: `${prefix}-${size}.png`, size, ...rest }));

await test("the export set is the accepted #199 icon family, each file marked mandatory, chosen or optional", () => {
  // Expected set and bases from docs/design/brand-assets.md and
  // docs/research/brand-asset-requirements.md, not from the exporter.
  const expected = [
    { file: "favicon.svg", group: "website", basis: "chosen" },
    {
      file: "favicon.ico",
      group: "website",
      basis: "chosen",
      entries: [16, 32, 48],
    },
    ...sizes("favicon", [16, 32, 48, 96], {
      group: "website",
      basis: "chosen",
    }),
    {
      file: "apple-touch-icon.png",
      size: 180,
      group: "website",
      basis: "chosen",
    },
    ...sizes("web-app-any", [192, 512], {
      group: "website",
      basis: "optional",
    }),
    ...sizes("web-app-maskable", [192, 512], {
      group: "website",
      basis: "optional",
    }),
    { file: "safari-pinned-tab.svg", group: "website", basis: "optional" },
    // The web app manifest is a chosen file (#214); it selects no PWA behaviour.
    { file: "manifest.webmanifest", group: "website", basis: "chosen" },
    ...sizes("extension", [16, 24, 32, 48, 64, 96], {
      group: "extension",
      basis: "chosen",
    }),
    // The Chrome Web Store requires a 128 PNG icon inside the package.
    {
      file: "extension-128.png",
      size: 128,
      group: "extension",
      basis: "mandatory",
    },
    ...["default", "on-light", "on-dark"].flatMap((cut) =>
      sizes(`toolbar-${cut}`, [16, 24, 32, 48, 64], {
        group: "toolbar",
        basis: "chosen",
      }),
    ),
    {
      file: "store-cws-128.png",
      size: 128,
      group: "store",
      basis: "mandatory",
    },
    { file: "store-amo-128.png", size: 128, group: "store", basis: "chosen" },
    {
      file: "store-edge-300.png",
      size: 300,
      group: "store",
      basis: "optional",
    },
  ];
  assert.deepEqual(
    record.exports.map(({ file, group, basis, size, entries }) => ({
      file,
      group,
      basis,
      ...(size ? { size } : {}),
      ...(entries ? { entries } : {}),
    })),
    expected,
  );
});

await test("every export is on disk with its recorded hash, made from the current master", async () => {
  assert.deepEqual(
    (await readdir(new URL("exports/", root))).sort(),
    [...byFile.keys(), "manifest.json"].sort(),
  );
  for (const [name, hash] of Object.entries(record.masters))
    assert.equal(sha256(await read(`masters/${name}`)), hash, name);
  for (const entry of record.exports) {
    assert.equal(
      sha256(await read(`exports/${entry.file}`)),
      entry.sha256,
      entry.file,
    );
    if (entry.master)
      assert.equal(
        entry.masterSha256,
        record.masters[entry.master],
        entry.file,
      );
  }
  // The SVG exports are the masters themselves, byte for byte.
  assert.deepEqual(
    await read("exports/favicon.svg"),
    await read("masters/mark-optical.svg"),
  );
  assert.deepEqual(
    await read("exports/safari-pinned-tab.svg"),
    await read("masters/safari-pinned-tab.svg"),
  );
});

await test("every PNG has a PNG signature, its square size and 8-bit RGBA", async () => {
  for (const entry of record.exports.filter((e) => e.file.endsWith(".png"))) {
    const bytes = await read(`exports/${entry.file}`);
    assert.deepEqual(
      bytes.subarray(0, 8),
      Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
      entry.file,
    );
    assert.equal(bytes.toString("latin1", 12, 16), "IHDR", entry.file);
    assert.equal(bytes.readUInt32BE(16), entry.size, entry.file);
    assert.equal(bytes.readUInt32BE(20), entry.size, entry.file);
    assert.equal(bytes[24], 8, `${entry.file} bit depth`);
    assert.equal(bytes[25], 6, `${entry.file} colour type RGBA`);
  }
});

await test("the 16–32 px cuts use the optical master and 48 px and above the full artwork", () => {
  for (const entry of record.exports.filter((e) => e.size)) {
    const small = entry.size! <= 32;
    const expected = entry.file.startsWith("toolbar-on-")
      ? `mark-mono-${small ? "optical-" : ""}${entry.file.split("-").slice(1, 3).join("-")}.svg`
      : /^(favicon|extension|toolbar-default|web-app-any)-/.test(entry.file)
        ? small
          ? "mark-optical.svg"
          : entry.file === "extension-128.png"
            ? "mark-cws-128.svg"
            : "mark.svg"
        : undefined;
    if (expected) assert.equal(entry.master, expected, entry.file);
  }
});

await test("store icons keep their painted bounds: CWS 96 in 128, AMO 8 px inset, Edge 20 px inset", async () => {
  // The mandatory CWS icon: exactly 96 px of painted artwork, no pixel of
  // any alpha in the 16 px margins.
  for (const file of ["store-cws-128.png", "extension-128.png"])
    assert.deepEqual(
      alphaBounds(await png(file)).box,
      [16, 16, 111, 111],
      file,
    );
  // The chosen insets, ignoring under-3 % antialiasing at curve joins.
  for (const [file, box] of [
    ["store-amo-128.png", [8, 8, 119, 119]],
    ["store-edge-300.png", [20, 20, 279, 279]],
  ] as const)
    assert.deepEqual(alphaBounds(await png(file), 8).box, box, file);
});

await test("touch and maskable art is opaque; transparent icons keep transparent corners", async () => {
  for (const file of [
    "apple-touch-icon.png",
    "web-app-maskable-192.png",
    "web-app-maskable-512.png",
  ])
    assert.equal(alphaBounds(await png(file)).minAlpha, 255, file);
  for (const entry of record.exports.filter(
    (e) =>
      e.file.endsWith(".png") &&
      e.basis !== "optional" &&
      e.file !== "apple-touch-icon.png",
  )) {
    const image = await png(entry.file);
    assert.equal(image.data[3], 0, `${entry.file} top-left corner`);
    assert.ok(
      alphaBounds(image).box[2]! >= 0,
      `${entry.file} paints something`,
    );
  }
});

await test("monochrome toolbar cuts paint only their chosen ink", async () => {
  for (const [cut, ink] of [
    ["on-light", [0x0e, 0x16, 0x26]],
    ["on-dark", [0xf4, 0xf5, 0xf8]],
  ] as const)
    for (const size of [16, 24, 32, 48, 64]) {
      const image = await png(`toolbar-${cut}-${size}.png`);
      let opaque = 0;
      for (let i = 0; i < image.data.length; i += 4)
        if (image.data[i + 3] === 255) {
          opaque++;
          assert.deepEqual(
            [...image.data.subarray(i, i + 3)],
            ink,
            `${cut}-${size}`,
          );
        }
      assert.ok(opaque > 0, `${cut}-${size} has solid ink`);
    }
});

await test("maskable essentials stay inside the W3C safe circle (radius 40%)", async () => {
  for (const size of [192, 512]) {
    const image = await png(`web-app-maskable-${size}.png`);
    const field = [...image.data.subarray(0, 3)];
    assert.deepEqual(field, [0x24, 0x56, 0xd3]);
    let essential = 0;
    for (let y = 0; y < size; y++)
      for (let x = 0; x < size; x++) {
        const i = (y * size + x) * 4;
        if ([...image.data.subarray(i, i + 3)].every((v, c) => v === field[c]))
          continue;
        essential++;
        assert.ok(
          Math.hypot(x + 0.5 - size / 2, y + 0.5 - size / 2) <= size * 0.4,
          `maskable-${size} pixel ${x},${y} is outside the safe circle`,
        );
      }
    assert.ok(essential > 0);
  }
});

await test("favicon.ico holds exactly the 16, 32 and 48 PNG favicons as entries", async () => {
  const ico = await read("exports/favicon.ico");
  assert.equal(ico.readUInt16LE(0), 0, "reserved");
  assert.equal(ico.readUInt16LE(2), 1, "type icon");
  assert.equal(ico.readUInt16LE(4), 3, "entry count");
  for (const [index, size] of [16, 32, 48].entries()) {
    const at = 6 + index * 16;
    assert.equal(ico[at], size, "width");
    assert.equal(ico[at + 1], size, "height");
    assert.equal(ico.readUInt16LE(at + 4), 1, "planes");
    assert.equal(ico.readUInt16LE(at + 6), 32, "bits per pixel");
    const length = ico.readUInt32LE(at + 8);
    const offset = ico.readUInt32LE(at + 12);
    assert.deepEqual(
      ico.subarray(offset, offset + length),
      await read(`exports/favicon-${size}.png`),
      `entry ${size}`,
    );
    if (index === 2)
      assert.equal(offset + length, ico.length, "no trailing data");
  }
});
