// SPDX-License-Identifier: AGPL-3.0-or-later
// Detects the capture glitch in which Chromium returns the panel as a grid of
// tiles: the top-left part of the panel repeated, with a period of 3/8 of the
// image width. A clean capture never repeats that strip pixel for pixel.
export interface Rgba {
  width: number;
  height: number;
  /** RGBA, row by row. */
  data: Uint8Array;
}

export function isTiledCapture(image: Rgba): boolean {
  const period = Math.round((image.width * 3) / 8);
  const strip = period - 20;
  const rows = Math.min(image.height, Math.round(image.height * 0.31));
  if (period + strip > image.width || rows < 1) return false;
  for (let y = 0; y < rows; y++)
    for (let x = 0; x < strip; x++) {
      const a = (y * image.width + x) * 4;
      const b = (y * image.width + x + period) * 4;
      if (
        image.data[a] !== image.data[b] ||
        image.data[a + 1] !== image.data[b + 1] ||
        image.data[a + 2] !== image.data[b + 2]
      )
        return false;
    }
  return true;
}
