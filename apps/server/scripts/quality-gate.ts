// SPDX-License-Identifier: AGPL-3.0-or-later
// Quality gate operator entry (#94, ADR-0006/0025). Reads the private dataset
// location, replays recorded Data source responses, writes a write-once
// measurement log or calibration record there and publishes nothing.
//
//   pnpm quality:gate measure --root <private> --configuration <file.json> [--extraction <module>] [--port 4202]
//   pnpm quality:gate calibrate --root <private> --grid <file.json> [--configuration <file.json>] [--extraction <module>] [--port 4202]
import { readFile } from "node:fs/promises";
import { parseArgs } from "node:util";

const usage = [
  "Usage: pnpm quality:gate measure --root <private-location> --configuration <file.json> [--extraction <module>] [--port <port>]",
  "       pnpm quality:gate calibrate --root <private-location> --grid <file.json> [--configuration <file.json>] [--extraction <module>] [--port <port>]",
].join("\n");

function refuse(message?: string): never {
  console.error([message, usage].filter(Boolean).join("\n"));
  process.exit(64);
}

let parsed;
try {
  parsed = parseArgs({
    allowPositionals: true,
    options: {
      root: { type: "string" },
      configuration: { type: "string" },
      grid: { type: "string" },
      extraction: { type: "string" },
      port: { type: "string", default: "4202" },
    },
  });
} catch (error) {
  refuse((error as Error).message);
}
const { positionals, values } = parsed;
const [command] = positionals;
if (
  positionals.length !== 1 ||
  (command !== "measure" && command !== "calibrate")
)
  refuse();
if (!values.root) refuse("--root is required.");
if (command === "measure" && !values.configuration)
  refuse("--configuration is required.");
if (command === "calibrate" && !values.grid) refuse("--grid is required.");
const port = Number(values.port);
if (!Number.isInteger(port) || port <= 0 || port > 65535)
  refuse("--port must be a TCP port.");

const { loadExtraction, resolveConfiguration } =
  await import("./quality/configuration.ts");
const { calibrate, measureConfiguration } = await import("./quality/runner.ts");
const extraction = values.extraction
  ? await loadExtraction(values.extraction)
  : undefined;

if (command === "measure") {
  const configuration = await resolveConfiguration(
    values.configuration!,
    extraction?.model ?? null,
  );
  const result = await measureConfiguration({
    root: values.root,
    configuration,
    extraction,
    port,
  });
  console.log(JSON.stringify(result, null, 2));
} else {
  const grid = JSON.parse(await readFile(values.grid!, "utf8")) as {
    axes: Record<string, number[]>;
  };
  const configuration = values.configuration
    ? await resolveConfiguration(
        values.configuration,
        extraction?.model ?? null,
      )
    : undefined;
  if (configuration?.calibration)
    refuse("A calibration configuration must not name a calibration record.");
  const result = await calibrate({
    root: values.root,
    grid,
    configuration,
    extraction,
    port,
  });
  console.log(JSON.stringify(result, null, 2));
}
