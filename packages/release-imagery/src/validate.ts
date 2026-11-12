// SPDX-License-Identifier: AGPL-3.0-or-later
import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import type { Manifest } from "./manifest.ts";

export interface PngInfo {
  width: number;
  height: number;
  bitDepth: number;
  colorType: number;
}

const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

/** Reads size, bit depth and colour type from the IHDR chunk. */
export function readPngInfo(bytes: Buffer): PngInfo {
  if (
    bytes.length < 33 ||
    !bytes.subarray(0, 8).equals(signature) ||
    bytes.toString("latin1", 12, 16) !== "IHDR"
  )
    throw new Error("not a PNG file");
  return {
    width: bytes.readUInt32BE(16),
    height: bytes.readUInt32BE(20),
    bitDepth: bytes[24] as number,
    colorType: bytes[25] as number,
  };
}

/**
 * Checks every manifest image against the files in `dir`: exact size, opaque
 * 8-bit RGB (the chosen policy, a recommendation rather than a store
 * requirement), the recorded hash, and no unlisted PNG next to them.
 */
export async function validateImages(
  dir: string,
  manifest: Manifest,
): Promise<string[]> {
  const problems: string[] = [];
  for (const image of manifest.images) {
    let bytes: Buffer;
    try {
      bytes = await readFile(join(dir, image.file));
    } catch {
      problems.push(`${image.file}: file is missing`);
      continue;
    }
    let info: PngInfo;
    try {
      info = readPngInfo(bytes);
    } catch (error) {
      problems.push(
        `${image.file}: ${error instanceof Error ? error.message : String(error)}`,
      );
      continue;
    }
    if (info.width !== image.width || info.height !== image.height)
      problems.push(
        `${image.file}: expected ${image.width}x${image.height}, found ${info.width}x${info.height}`,
      );
    if (info.colorType !== 2 || info.bitDepth !== 8)
      problems.push(
        `${image.file}: expected opaque RGB 8-bit PNG, found colour type ${info.colorType} at ${info.bitDepth} bit`,
      );
    const hash = createHash("sha256").update(bytes).digest("hex");
    if (hash !== image.sha256)
      problems.push(`${image.file}: sha256 differs from the manifest`);
  }
  const listed = new Set(manifest.images.map((image) => image.file));
  for (const name of await readdir(dir))
    if (name.endsWith(".png") && !listed.has(name))
      problems.push(`${name}: PNG is not listed in the manifest`);
  return problems;
}
