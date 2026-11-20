// SPDX-License-Identifier: AGPL-3.0-or-later
import assert from "node:assert/strict";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import { measure } from "../../../web/scripts/design-fidelity/measurements.ts";
import {
  measurementPage,
  nativeViewport,
  type Viewport,
} from "./native-page.ts";

await test("shared measurements read geometry and styles through the native CDP bridge", async () => {
  const node = {
    getClientRects: () => [1],
    getBoundingClientRect: () => ({ x: 12, y: 24, width: 300, height: 36 }),
  };
  const panel = {
    evaluate<T>(expression: string): Promise<T> {
      const value: unknown = runInNewContext(expression, {
        document: {
          querySelector: (selector: string) =>
            selector === ".present" ? node : null,
          querySelectorAll: (selector: string) =>
            selector === ".present" ? [node] : [],
        },
        getComputedStyle: () => ({
          visibility: "visible",
          getPropertyValue: () => "14px",
        }),
      });
      return Promise.resolve(value as T);
    },
  };
  const measurements = await measure(
    measurementPage(panel),
    [
      {
        name: "present",
        prototype: ".unused",
        built: ".present",
        styles: ["font-size"],
      },
      { name: "missing", prototype: ".unused", built: ".missing" },
    ],
    false,
  );
  // Serialize cross-realm values before strict comparison.
  assert.equal(
    JSON.stringify(measurements),
    JSON.stringify({
      present: {
        box: { x: 12, y: 24, width: 300, height: 36 },
        styles: { "font-size": "14px" },
      },
      missing: null,
    }),
  );
});

for (const behavior of ["supported", "rejected", "ignored"] as const)
  await test(`native viewport records actual dimensions when metrics are ${behavior}`, async () => {
    const initial: Viewport = { width: 326, height: 585, deviceScaleFactor: 1 };
    let observed = { ...initial };
    const methods: string[] = [];
    const panel = {
      evaluate<T>(): Promise<T> {
        return Promise.resolve({ ...observed } as T);
      },
      send<T>(method: string): Promise<T> {
        methods.push(method);
        if (method === "Emulation.setDeviceMetricsOverride") {
          if (behavior === "rejected")
            return Promise.reject(new Error("Unsupported target"));
          if (behavior === "supported") observed = { ...initial, width: 360 };
        }
        if (method === "Emulation.clearDeviceMetricsOverride")
          observed = { ...initial };
        return Promise.resolve({} as T);
      },
    };
    const result = await nativeViewport(panel);
    assert.equal(result.requestedWidth, 360);
    assert.deepEqual(result.initial, initial);
    assert.equal(result.emulated, behavior === "supported");
    assert.equal(result.observed.width, behavior === "supported" ? 360 : 326);
    assert.equal(result.observed.height, 585);
    assert.equal(
      methods.includes("Emulation.clearDeviceMetricsOverride"),
      behavior !== "supported",
    );
    if (behavior !== "supported") assert.ok(result.error);
  });
