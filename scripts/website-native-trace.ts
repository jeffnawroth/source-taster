// SPDX-License-Identifier: AGPL-3.0-or-later
// Build-only execution guard, preloaded with `node --import`. Every native
// Node-API module must map to a controlled source-built binary, and every child
// process must be Node itself or a controlled executable. Anything else is
// refused before it runs and recorded as evidence. Not a sandbox: it covers
// Node's module loader and child_process API, which is how the build executes
// third-party native code.
import childProcess from "node:child_process";
import { createHash } from "node:crypto";
import {
  appendFileSync,
  readFileSync,
  realpathSync,
  accessSync,
  constants,
} from "node:fs";
import { syncBuiltinESMExports } from "node:module";
import { resolve, delimiter } from "node:path";
import { fileURLToPath } from "node:url";

const configuredBin = process.env.SOURCE_TASTER_CONTROLLED_BIN;
const configuredTrace = process.env.SOURCE_TASTER_NATIVE_TRACE;
if (!configuredBin || !configuredTrace)
  throw new Error("Native trace requires controlled bin and trace paths");
const bin = realpathSync(configuredBin);
const trace = resolve(configuredTrace);

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

type Options = {
  shell?: unknown;
  cwd?: string | URL;
  env?: NodeJS.ProcessEnv;
  execPath?: string;
};
function locate(name: string, options: Options): string | undefined {
  const cwd =
    options.cwd instanceof URL
      ? fileURLToPath(options.cwd)
      : resolve(options.cwd ?? process.cwd());
  const childEnv = options.env ?? process.env;
  const candidates = name.includes("/")
    ? [resolve(cwd, name)]
    : (childEnv.PATH ?? "/usr/bin:/bin")
        .split(delimiter)
        .map((dir) => resolve(cwd, dir, name));
  for (const candidate of candidates)
    try {
      accessSync(candidate, constants.X_OK);
      return realpathSync(candidate);
    } catch {
      continue;
    }
  return undefined;
}
function guard(file: unknown, options: Options): string {
  const requested = String(file);
  const path = locate(requested, options);
  const controlled =
    !options.shell && path !== undefined && controlledExecutables.has(path);
  record({
    kind: "process",
    requested,
    path,
    shell: Boolean(options.shell),
    controlled,
  });
  if (!controlled || !path)
    throw new Error(
      `Refused uncontrolled executable during build: ${requested}`,
    );
  return path;
}
// Capture configuration at preload time. A child may deliberately use a clean
// env, but it must still load this guard and record against the same receipt.
const preload = import.meta.url;
function guardedOptions(options: Options): Options {
  const env = { ...(options.env ?? process.env) };
  env.SOURCE_TASTER_CONTROLLED_BIN = bin;
  env.SOURCE_TASTER_NATIVE_TRACE = trace;
  env.NODE_OPTIONS = `${env.NODE_OPTIONS ?? ""} --import=${JSON.stringify(preload)}`;
  return { ...options, env };
}
const optionsIndex = (args: unknown[]) =>
  args.findIndex(
    (value) =>
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
    const index = optionsIndex(args);
    const options = (index < 0 ? {} : args[index]) as Options;
    const path = guard(file, options);
    const guarded = guardedOptions(options);
    if (index < 0) args.splice(Array.isArray(args[0]) ? 1 : 0, 0, guarded);
    else args[index] = guarded;
    // Execute the exact resolved path, never a second PATH lookup in the child.
    return Reflect.apply(original, this, [path, ...args]);
  };
}
const fork = childProcess.fork;
childProcess.fork = function (this: unknown, ...args: unknown[]) {
  const relativeIndex = optionsIndex(args.slice(1));
  const index = relativeIndex < 0 ? -1 : relativeIndex + 1;
  const options = (index < 0 ? {} : args[index]) as Options;
  const execPath = guard(options.execPath ?? process.execPath, options);
  const guarded = { ...guardedOptions(options), execPath };
  if (index < 0) args.push(guarded);
  else args[index] = guarded;
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
