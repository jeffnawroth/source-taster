// SPDX-License-Identifier: AGPL-3.0-or-later
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import {
  compareMeasurements,
  compareQuotaProportion,
  probesFor,
  type Measurement,
  type Probe,
} from "../scripts/design-fidelity/measurements.ts";
const probe: Probe = {
  name: "control",
  prototype: ".source",
  built: ".built",
  geometry: ["x", "width"],
  styles: ["border-top-left-radius", "font-size"],
};
const source: Measurement = {
  box: { x: 100, y: 0, width: 620, height: 42 },
  styles: { "border-top-left-radius": "999px", "font-size": "16px" },
};
await test("Quota fidelity measures both rounded track and fill and rejects a used-balance inversion", () => {
  const probes = probesFor("hosted-guest-account-web-light-en");
  for (const name of ["quota-track", "quota-fill"]) {
    const meter = probes.find((probe) => probe.name === name)!;
    assert.ok(meter.styles?.includes("border-top-left-radius"));
    assert.ok(meter.styles?.includes("overflow-x"));
    assert.ok(meter.geometry?.includes("height"));
  }
  const quota = { remaining: 15, granted: 20 };
  assert.deepEqual(compareQuotaProportion(quota, 300, 225), []);
  assert.match(compareQuotaProportion(quota, 300, 75)[0]!, /requires 225px/);
  assert.deepEqual(
    compareQuotaProportion({ remaining: 0, granted: 20 }, 300, 0),
    [],
  );
});
await test("fidelity CLI rejects missing values and zero app or PDF selections before browser work", () => {
  const script = fileURLToPath(
    new URL("../scripts/design-fidelity.ts", import.meta.url),
  );
  for (const args of [
    ["--only"],
    ["--url", "--list"],
    ["--out"],
    ["--mail"],
    ["--only", "nonexistent", "--list"],
    ["--only", "pdf-nonexistent", "--list"],
  ]) {
    const result = spawnSync(process.execPath, [script, ...args], {
      encoding: "utf8",
    });
    assert.notEqual(result.status, 0, args.join(" "));
    assert.match(result.stderr, /Missing value|No fidelity states match/);
  }
});
await test("fidelity gate rejects missing states, square corners and misalignment", () => {
  assert.match(
    compareMeasurements([probe], { control: source }, {})[0]!,
    /missing built/,
  );
  const changed = structuredClone(source);
  changed.box.x += 2;
  changed.styles["border-top-left-radius"] = "0px";
  const failures = compareMeasurements(
    [probe],
    { control: source },
    { control: changed },
  );
  assert.equal(failures.length, 2);
  assert.match(failures.join("\n"), /control.x/);
  assert.match(failures.join("\n"), /border-top-left-radius/);
});
await test("fidelity gate allows only the declared subpixel geometry tolerance", () => {
  const changed = structuredClone(source);
  changed.box.x += 0.75;
  assert.deepEqual(
    compareMeasurements([probe], { control: source }, { control: changed }),
    [],
  );
  changed.styles["font-size"] = "17px";
  assert.equal(
    compareMeasurements([probe], { control: source }, { control: changed })
      .length,
    1,
  );
});

await test("equivalent overflowing pill radii pass but square corners still fail", () => {
  const changed = structuredClone(source);
  changed.styles["border-top-left-radius"] = "9999px";
  assert.deepEqual(
    compareMeasurements([probe], { control: source }, { control: changed }),
    [],
  );
  changed.styles["border-top-left-radius"] = "0px";
  assert.equal(
    compareMeasurements([probe], { control: source }, { control: changed })
      .length,
    1,
  );
});
