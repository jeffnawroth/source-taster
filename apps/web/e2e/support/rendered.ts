// SPDX-License-Identifier: AGPL-3.0-or-later
// Measurements on what the browser actually painted (#216). The numerical token
// gate (packages/design-tokens) checks resolved colours; these helpers check the
// pixels a person sees, including glass over moving content. They need no image
// library: a screenshot is decoded inside the page.
import type { Locator, Page } from "@playwright/test";

export interface Painted {
  /** Lowest WCAG contrast of the element's colour against the backdrop of any pixel it covers. */
  min: number;
  /** Covered pixels that were measured. */
  count: number;
  /** The pixel with the lowest contrast: its position, coverage and backdrop. */
  worst: { x: number; y: number; coverage: number; back: number[] } | null;
}

type Mode = "text" | "shape";

/** What the in-page measurements share: PNG decoding, colour parsing and WCAG contrast. */
interface Kit {
  decode(
    b64: string,
    size?: number,
  ): Promise<{ data: Uint8ClampedArray; width: number; height: number }>;
  rgb(color: string): number[];
  ratio(a: number[], b: number[]): number;
}
declare global {
  interface Window {
    __stKit?: Kit;
  }
}

/**
 * Installs the shared helpers into the page once. A function passed to
 * `page.evaluate` is serialised and cannot see Node closures, so the helpers
 * live in one installed object instead of being copied into every measurement.
 */
async function useKit(page: Page): Promise<void> {
  await page.evaluate(() => {
    if (window.__stKit) return;
    const luminance = (rgb: number[]) => {
      const [r = 0, g = 0, b = 0] = rgb.map((v) => {
        const s = v / 255;
        return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    window.__stKit = {
      async decode(b64, size) {
        const blob = new Blob(
          [Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))],
          { type: "image/png" },
        );
        const bitmap = await createImageBitmap(blob);
        const width = size ?? bitmap.width;
        const height = size ?? bitmap.height;
        const ctx = new OffscreenCanvas(width, height).getContext("2d")!;
        ctx.drawImage(bitmap, 0, 0, width, height);
        return {
          data: ctx.getImageData(0, 0, width, height).data,
          width,
          height,
        };
      },
      rgb(color) {
        const ctx = new OffscreenCanvas(1, 1).getContext("2d")!;
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, 1, 1);
        return [...ctx.getImageData(0, 0, 1, 1).data].slice(0, 3);
      },
      ratio(a, b) {
        const x = luminance(a);
        const y = luminance(b);
        return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
      },
    };
  });
}

/**
 * Waits until the element stands still and nothing the page animates is moving,
 * so the computed colour and both captures describe the same frame. A smooth
 * scroll that is still running moves a sticky element between the two
 * screenshots, which then no longer line up pixel for pixel. Infinite
 * animations are ignored: they never finish and are not a state to wait for.
 */
async function settle(locator: Locator): Promise<void> {
  await locator.evaluate(async (element) => {
    await Promise.all(
      document
        .getAnimations()
        .filter((a) => a.effect?.getComputedTiming().iterations !== Infinity)
        .map((a) => a.finished.catch(() => undefined)),
    );
    const key = () => {
      const r = element.getBoundingClientRect();
      return `${r.x},${r.y},${r.width},${r.height},${scrollX},${scrollY}`;
    };
    // The same position on five consecutive frames, or give up after two seconds.
    const until = performance.now() + 2000;
    let last = key();
    let same = 0;
    while (same < 5 && performance.now() < until) {
      await new Promise((done) => requestAnimationFrame(done));
      const now = key();
      same = now === last ? same + 1 : 0;
      last = now;
    }
  });
}

/**
 * Screenshots the element with and without its own paint. Pixels the element
 * covers by at least 60 % (estimated from where the painted pixel lies between
 * the backdrop and the element's computed colour, so thin anti-aliased strokes
 * still count) are compared with the pixel behind them from the unpainted
 * capture, which on glass includes the blurred content scrolled underneath.
 */
export async function paintedContrast(
  locator: Locator,
  mode: Mode = "text",
): Promise<Painted> {
  const page = locator.page();
  await settle(locator);
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
  await useKit(page);
  return page.evaluate(
    async ({ painted, behind, color }) => {
      const kit = window.__stKit!;
      const want = kit.rgb(color);
      const { data: a } = await kit.decode(painted);
      const { data: b } = await kit.decode(behind);
      let min = Infinity;
      let count = 0;
      let worst: Painted["worst"] = null;
      const { width } = await kit.decode(painted);
      for (let n = 0; n < a.length; n += 4) {
        const pixel = [a[n]!, a[n + 1]!, a[n + 2]!];
        const back = [b[n]!, b[n + 1]!, b[n + 2]!];
        // How much of this pixel the element covers: where the painted pixel
        // lies between the backdrop and the element's own colour. Thin strokes
        // at a fractional position never reach the full colour, so requiring
        // exact-colour pixels would measure nothing on a small "1".
        const channels = want
          .map((w, i) => ({ w, i, span: w - back[i]! }))
          .filter(({ span }) => Math.abs(span) > 24);
        if (channels.length === 0) continue;
        const coverage =
          channels.reduce(
            (sum, { i, span }) => sum + (pixel[i]! - back[i]!) / span,
            0,
          ) / channels.length;
        if (coverage < 0.6) continue;
        count += 1;
        // Contrast of the element's colour against what lies behind the pixel.
        const ratio = kit.ratio(want, back);
        if (ratio < min) {
          min = ratio;
          worst = {
            x: (n / 4) % width,
            y: Math.floor(n / 4 / width),
            coverage,
            back,
          };
        }
      }
      return { min: count === 0 ? 0 : min, count, worst };
    },
    { painted, behind, color },
  );
}

/** The 2 px focus outline and other borders: colour of the outline against the pixel outside it. */
export async function outlineContrast(locator: Locator): Promise<number> {
  const page = locator.page();
  await settle(locator);
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
  await useKit(page);
  return page.evaluate(
    async ({ shot, color }) => {
      const kit = window.__stKit!;
      const { data, width, height } = await kit.decode(shot);
      const want = kit.rgb(color);
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
      return found === 0 ? 0 : kit.ratio(want, outside);
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
  await settle(locator);
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
    await useKit(page);
    return await page.evaluate(
      async ({ shot, behind, size }) => {
        const kit = window.__stKit!;
        const { data: a } = await kit.decode(shot, size);
        const { data: b } = await kit.decode(behind, size);
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
