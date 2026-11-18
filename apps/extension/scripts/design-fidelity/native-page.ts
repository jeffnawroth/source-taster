// SPDX-License-Identifier: AGPL-3.0-or-later
import type { Page } from "@playwright/test";
import type { Panel } from "../../e2e/support/chromium.ts";

/** Read-only Page subset used by shared measure/readShellFixture. It never
 * navigates panel.html in a tab: every operation reaches the SIDE_PANEL CDP
 * session. Unsupported Page methods fail instead of silently using a tab. */
export function measurementPage(panel: Pick<Panel, "evaluate">): Page {
  const locator = (selector: string) => ({
    first() {
      return this;
    },
    count: () =>
      panel.evaluate<number>(
        `document.querySelectorAll(${JSON.stringify(selector)}).length`,
      ),
    isVisible: () =>
      panel.evaluate<boolean>(`(() => {
        const node = document.querySelector(${JSON.stringify(selector)});
        return !!node && node.getClientRects().length > 0 &&
          getComputedStyle(node).visibility !== "hidden";
      })()`),
    evaluate: (fn: (node: Element, arg: unknown) => unknown, arg: unknown) =>
      panel.evaluate(
        `(${fn.toString()})(document.querySelector(${JSON.stringify(selector)}), ${JSON.stringify(arg) ?? "undefined"})`,
      ),
  });
  // This deliberately narrow bridge is only passed to the two shared readers.
  // Source projection uses a genuine Playwright Page, with no adapter.
  return {
    locator,
    evaluate: (fn: (arg: unknown) => unknown, arg: unknown) =>
      panel.evaluate(
        `(${fn.toString()})(${JSON.stringify(arg) ?? "undefined"})`,
      ),
  } as unknown as Page;
}

export interface Viewport {
  width: number;
  height: number;
  deviceScaleFactor: number;
}
export async function nativeViewport(panel: Pick<Panel, "evaluate" | "send">) {
  const read = () =>
    panel.evaluate<Viewport>(`({ width: innerWidth, height: innerHeight,
      deviceScaleFactor: devicePixelRatio })`);
  const initial = await read();
  let error: string | undefined;
  try {
    await panel.send("Emulation.setDeviceMetricsOverride", {
      width: 360,
      height: initial.height,
      deviceScaleFactor: 1,
      mobile: false,
    });
    const observed = await read();
    if (observed.width !== 360 || observed.deviceScaleFactor !== 1)
      throw new Error(`Override ignored: ${JSON.stringify(observed)}`);
    return { requestedWidth: 360, initial, observed, emulated: true };
  } catch (cause) {
    error = String(cause);
    await panel.send("Emulation.clearDeviceMetricsOverride");
  }
  return {
    requestedWidth: 360,
    initial,
    observed: await read(),
    emulated: false,
    error,
  };
}
