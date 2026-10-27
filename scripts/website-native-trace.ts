// SPDX-License-Identifier: AGPL-3.0-or-later
// Build-only execution guard, preloaded with `node --import`. Every native
// Node-API module must map to a controlled source-built binary, and every child
// process must be Node itself or a controlled executable. Anything else is
// refused before it runs and recorded as evidence. Not a sandbox: it covers
// Node's module loader and child_process API, which is how the build executes
// third-party native code.
import childProcess from "node:child_process";
import { createHash } from "node:crypto";
import { appendFileSync, readFileSync, realpathSync } from "node:fs";
import { syncBuiltinESMExports } from "node:module";
import { resolve } from "node:path";

const bin = process.env.SOURCE_TASTER_CONTROLLED_BIN;
const trace = process.env.SOURCE_TASTER_NATIVE_TRACE;
if (!bin || !trace)
  throw new Error("Native trace requires controlled bin and trace paths");

/** Installed prebuilt Node-API module → controlled replacement in `bin`. */
export const controlledModules: [RegExp, string][] = [
  [/\/@astrojs\/compiler-binding-[^/]+\/astro\.[^/]+\.node$/, "astro.node"],
  [
    /\/@rolldown\/binding-[^/]+\/rolldown-binding\.[^/]+\.node$/,
    "rolldown.node",
  ],
  [/\/@bruits\/satteri-[^/]+\/satteri_napi\.[^/]+\.node$/, "satteri.node"],
];
// The Pagefind CLI is absent while its own browser bundles are built.
const controlledExecutables = new Set(
  [process.execPath, resolve(bin, "pagefind")].flatMap((path) => {
    try {
      return [realpathSync(path)];
    } catch {
      return [];
    }
  }),
);
const sha256 = (path: string) =>
  createHash("sha256").update(readFileSync(path)).digest("hex");
const record = (entry: Record<string, unknown>) =>
  appendFileSync(trace, JSON.stringify({ pid: process.pid, ...entry }) + "\n");

const dlopen = process.dlopen.bind(process);
process.dlopen = function (
  this: NodeJS.Process,
  module: object,
  filename: string,
  flags?: number,
) {
  const requested = realpathSync(filename);
  const match = controlledModules.find(([pattern]) => pattern.test(requested));
  if (!match) {
    record({ kind: "native", requested, controlled: false, loaded: false });
    throw new Error(`Refused uncontrolled native module: ${requested}`);
  }
  const path = realpathSync(resolve(bin, match[1]));
  // Linux distinguishes an omitted flags argument from an explicit undefined.
  // Preserve the loader's argument count when redirecting the binary.
  if (arguments.length > 2) dlopen(module, path, flags);
  else dlopen(module, path);
  record({
    kind: "native",
    requested,
    path,
    controlled: true,
    sha256: sha256(path),
    loaded: true,
  });
};

function locate(name: string): string | undefined {
  const candidates = name.includes("/")
    ? [resolve(name)]
    : (process.env.PATH ?? "").split(":").map((dir) => resolve(dir, name));
  for (const candidate of candidates)
    try {
      return realpathSync(candidate);
    } catch {
      continue;
    }
  return undefined;
}
function guard(file: unknown, shell: unknown) {
  const requested = String(file);
  const path = locate(requested);
  const controlled =
    !shell && path !== undefined && controlledExecutables.has(path);
  record({
    kind: "process",
    requested,
    path,
    shell: Boolean(shell),
    controlled,
  });
  if (!controlled)
    throw new Error(
      `Refused uncontrolled executable during build: ${requested}`,
    );
}
type Options = { shell?: unknown } | undefined;
const optionsOf = (args: unknown[]): Options =>
  args.find(
    (value): value is { shell?: unknown } =>
      typeof value === "object" && value !== null && !Array.isArray(value),
  );
for (const method of [
  "spawn",
  "spawnSync",
  "execFile",
  "execFileSync",
] as const) {
  const original = childProcess[method] as (...args: unknown[]) => unknown;
  (childProcess as Record<string, unknown>)[method] = function (
    this: unknown,
    file: unknown,
    ...args: unknown[]
  ) {
    guard(file, optionsOf(args)?.shell);
    return Reflect.apply(original, this, [file, ...args]);
  };
}
const fork = childProcess.fork;
childProcess.fork = function (this: unknown, ...args: unknown[]) {
  const options = optionsOf(args) as { execPath?: string } | undefined;
  guard(options?.execPath ?? process.execPath, false);
  return Reflect.apply(fork, this, args) as ReturnType<
    typeof childProcess.fork
  >;
};
for (const method of ["exec", "execSync"] as const)
  (childProcess as Record<string, unknown>)[method] = (command: unknown) => {
    record({ kind: "process", requested: String(command), controlled: false });
    throw new Error(`Refused shell command during build: ${String(command)}`);
  };
syncBuiltinESMExports();
