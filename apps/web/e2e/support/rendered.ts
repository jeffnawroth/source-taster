// SPDX-License-Identifier: AGPL-3.0-or-later
// Measurements on what the browser actually painted (#216). The numerical token
// gate (packages/design-tokens) checks resolved colours; these helpers check the
// pixels a person sees, including glass over moving content. They need no image
// library: a screenshot is decoded inside the page.
import type { Locator, Page } from "@playwright/test";

export interface Painted {
  /** Lowest WCAG contrast of any fully painted pixel against what lies behind it. */
  min: number;
  /** Fully painted pixels that were measured. */
  count: number;
}

type Mode = "text" | "shape";

/**
 * Screenshots the element with and without its own paint. Pixels equal to the
 * element's computed colour are the fully painted ones (anti-aliased edges are
 * not claimed); each is compared with the pixel behind it from the unpainted
 * capture, which on glass includes the blurred content scrolled underneath.
 */
export async function paintedContrast(
  locator: Locator,
  mode: Mode = "text",
): Promise<Painted> {
  const page = locator.page();
  const hide = (value: boolean) =>
    locator.evaluate(
      (element, args) => {
        const el = element;
        const property = args.mode === "text" ? "color" : "opacity";
        if (args.on) {
          el.dataset.stRestore = el.style.getPropertyValue(property);
          el.style.setProperty(
            property,
            args.mode === "text" ? "transparent" : "0",
            "important",
          );
        } else {
          el.style.setProperty(property, el.dataset.stRestore ?? "");
          delete el.dataset.stRestore;
        }
      },
      { on: value, mode },
    );
  const painted = (
    await locator.screenshot({ animations: "disabled" })
  ).toString("base64");
  await hide(true);
  let behind: string;
  try {
    behind = (await locator.screenshot({ animations: "disabled" })).toString(
      "base64",
    );
  } finally {
    await hide(false);
  }
  const color = await locator.evaluate(
    (element) => getComputedStyle(element).color,
  );
  return page.evaluate(
    async ({ painted, behind, color }) => {
      const decode = async (b64: string) => {
        const blob = new Blob(
          [Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))],
          { type: "image/png" },
        );
        const bitmap = await createImageBitmap(blob);
        const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(bitmap, 0, 0);
        return ctx.getImageData(0, 0, bitmap.width, bitmap.height).data;
      };
      const probe = new OffscreenCanvas(1, 1).getContext("2d")!;
      probe.fillStyle = color;
      probe.fillRect(0, 0, 1, 1);
      const want = [...probe.getImageData(0, 0, 1, 1).data].slice(0, 3);
      const luminance = (rgb: number[]) => {
        const [r = 0, g = 0, b = 0] = rgb.map((v) => {
          const s = v / 255;
          return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
        });
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
      };
      const ratio = (a: number[], b: number[]) => {
        const x = luminance(a);
        const y = luminance(b);
        return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
      };
      const a = await decode(painted);
      const b = await decode(behind);
      let min = Infinity;
      let count = 0;
      for (let n = 0; n < a.length; n += 4) {
        const pixel = [a[n]!, a[n + 1]!, a[n + 2]!];
        const back = [b[n]!, b[n + 1]!, b[n + 2]!];
        const solid = pixel.every((v, i) => Math.abs(v - want[i]!) < 8);
        const differs = pixel.some((v, i) => Math.abs(v - back[i]!) > 2);
        if (!solid || !differs) continue;
        count += 1;
        min = Math.min(min, ratio(pixel, back));
      }
      return { min: count === 0 ? 0 : min, count };
    },
    { painted, behind, color },
  );
}

/** The 2 px focus outline and other borders: colour of the outline against the pixel outside it. */
export async function outlineContrast(locator: Locator): Promise<number> {
  const page = locator.page();
  const box = (await locator.boundingBox())!;
  const style = await locator.evaluate((element) => {
    const css = getComputedStyle(element);
    return {
      color: css.outlineColor,
      width: Number.parseFloat(css.outlineWidth),
      offset: Number.parseFloat(css.outlineOffset),
    };
  });
  const reach = style.width + Math.max(style.offset, 0) + 3;
  const shot = (
    await page.screenshot({
      animations: "disabled",
      clip: {
        x: Math.max(box.x - reach, 0),
        y: Math.max(box.y - reach, 0),
        width: box.width + reach * 2,
        height: box.height + reach * 2,
      },
    })
  ).toString("base64");
  return page.evaluate(
    async ({ shot, color }) => {
      const blob = new Blob(
        [Uint8Array.from(atob(shot), (c) => c.charCodeAt(0))],
        { type: "image/png" },
      );
      const bitmap = await createImageBitmap(blob);
      const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(bitmap, 0, 0);
      const { data, width, height } = ctx.getImageData(
        0,
        0,
        bitmap.width,
        bitmap.height,
      );
      const probe = new OffscreenCanvas(1, 1).getContext("2d")!;
      probe.fillStyle = color;
      probe.fillRect(0, 0, 1, 1);
      const want = [...probe.getImageData(0, 0, 1, 1).data].slice(0, 3);
      const luminance = (rgb: number[]) => {
        const [r = 0, g = 0, b = 0] = rgb.map((v) => {
          const s = v / 255;
          return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
        });
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
      };
      const ratio = (a: number[], b: number[]) => {
        const x = luminance(a);
        const y = luminance(b);
        return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
      };
      // The outer-most row of the capture is outside the outline.
      const outside = [data[0]!, data[1]!, data[2]!];
      let found = 0;
      for (let y = 0; y < height; y++)
        for (let x = 0; x < width; x++) {
          const n = (y * width + x) * 4;
          if (
            [data[n]!, data[n + 1]!, data[n + 2]!].every(
              (v, i) => Math.abs(v - want[i]!) < 8,
            )
          )
            found += 1;
        }
      return found === 0 ? 0 : ratio(want, outside);
    },
    { shot, color: style.color },
  );
}

/** Black-and-white mask of the painted glyph, as 0/1 flags on a fixed grid. */
export async function greyscaleMask(
  page: Page,
  locator: Locator,
  size = 24,
): Promise<number[]> {
  await page.evaluate(() => {
    const style = document.createElement("style");
    style.id = "st-greyscale";
    style.textContent = "html { filter: grayscale(1) !important; }";
    document.head.append(style);
  });
  try {
    const shot = (
      await locator.screenshot({ animations: "disabled" })
    ).toString("base64");
    await locator.evaluate((element) => {
      (element as SVGElement).style.setProperty("opacity", "0", "important");
    });
    const behind = (
      await locator.screenshot({ animations: "disabled" })
    ).toString("base64");
    await locator.evaluate((element) => {
      (element as SVGElement).style.removeProperty("opacity");
    });
    return await page.evaluate(
      async ({ shot, behind, size }) => {
        const decode = async (b64: string) => {
          const blob = new Blob(
            [Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))],
            { type: "image/png" },
          );
          const bitmap = await createImageBitmap(blob);
          const canvas = new OffscreenCanvas(size, size);
          const ctx = canvas.getContext("2d")!;
          ctx.drawImage(bitmap, 0, 0, size, size);
          return ctx.getImageData(0, 0, size, size).data;
        };
        const a = await decode(shot);
        const b = await decode(behind);
        const mask: number[] = [];
        for (let n = 0; n < a.length; n += 4) {
          const diff =
            Math.abs(a[n]! - b[n]!) +
            Math.abs(a[n + 1]! - b[n + 1]!) +
            Math.abs(a[n + 2]! - b[n + 2]!);
          mask.push(diff > 150 ? 1 : 0);
        }
        return mask;
      },
      { shot, behind, size },
    );
  } finally {
    await page.evaluate(() =>
      document.getElementById("st-greyscale")?.remove(),
    );
  }
}

/** Intersection over union of two masks; 1 means the same silhouette. */
export function overlap(a: number[], b: number[]): number {
  let both = 0;
  let either = 0;
  for (let n = 0; n < a.length; n++) {
    if (a[n] && b[n]) both += 1;
    if (a[n] || b[n]) either += 1;
  }
  return either === 0 ? 1 : both / either;
}

export const ratioFloor = { text: 4.5, nonText: 3 } as const;
