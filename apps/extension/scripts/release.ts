// SPDX-License-Identifier: AGPL-3.0-or-later
// Reproducible store packages. Builds the store channel of both targets and
// writes one zip per target (the Chromium zip serves Chrome and Edge), a
// SHA256SUMS file and release.json. With `source` it also writes the source
// package AMO reviewers rebuild from. It uploads and signs nothing.
//
//   node scripts/release.ts [build|source|all] [--rehearsal] [--out <dir>]
//
// Real runs need SOURCE_TASTER_EXTENSION_API_URL and _WEBSITE_URL (and
// _SERVICE_URL, _MODE, _ACCOUNT_SIGN_IN for a hosted build) from the owner.
// --rehearsal uses reserved `.invalid` hosts and marks every file name.
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import {
  assertStoreConfig,
  extensionConfig,
  extensionVersion,
  type Target,
} from "../extension-config.ts";
import { filesOf, zip } from "./zip.ts";

const root = new URL("..", import.meta.url).pathname;
const targets: Target[] = ["chromium", "firefox"];
const sha256 = (data: Buffer | string) =>
  createHash("sha256").update(data).digest("hex");

/** The only variables a store build reads. Anything else in the environment
 * stays out, so a stray development value cannot change a release. */
const inputNames = [
  "SOURCE_TASTER_EXTENSION_API_URL",
  "SOURCE_TASTER_EXTENSION_WEBSITE_URL",
  "SOURCE_TASTER_EXTENSION_SERVICE_URL",
  "SOURCE_TASTER_EXTENSION_MODE",
  "SOURCE_TASTER_EXTENSION_ACCOUNT_SIGN_IN",
  "SOURCE_TASTER_EXTENSION_SENSITIVE_ACCOUNT_ACTIONS",
] as const;

export function storeEnv(
  source: Record<string, string | undefined>,
  rehearsal: boolean,
) {
  const env: Record<string, string> = {
    SOURCE_TASTER_EXTENSION_CHANNEL: "store",
  };
  for (const name of inputNames) if (source[name]) env[name] = source[name]!;
  if (rehearsal) env.SOURCE_TASTER_EXTENSION_STORE_REHEARSAL = "1";
  // Fails closed before any build starts.
  assertStoreConfig(env, extensionConfig(env));
  return env;
}

export interface BuiltPackage {
  target: Target;
  file: string;
  bytes: Buffer;
  sha256: string;
  files: { path: string; size: number; sha256: string }[];
}

export function buildPackage(
  target: Target,
  env: Record<string, string>,
  rehearsal: boolean,
): BuiltPackage {
  const scratch = mkdtempSync(join(tmpdir(), `st259-${target}-`));
  try {
    const outDir = join(scratch, "extension");
    const result = spawnSync(
      process.execPath,
      [join(root, "node_modules/vite/bin/vite.js"), "build", "--mode", target],
      {
        cwd: root,
        env: {
          PATH: process.env.PATH,
          ...env,
          SOURCE_TASTER_EXTENSION_OUT_DIR: outDir,
        },
        encoding: "utf8",
      },
    );
    if (result.status !== 0)
      throw new Error(
        `${target} build failed:\n${result.stdout}${result.stderr}`,
      );
    const files = filesOf(outDir);
    const bytes = zip(files);
    return {
      target,
      file: `source-taster-${extensionVersion}-${target}${rehearsal ? "-rehearsal" : ""}.zip`,
      bytes,
      sha256: sha256(bytes),
      files: files
        .map(({ name, data }) => ({
          path: name,
          size: data.length,
          sha256: sha256(data),
        }))
        .sort((a, b) => (a.path < b.path ? -1 : 1)),
    };
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
}

function git(args: string[], cwd = root) {
  const result = spawnSync("git", args, { cwd, encoding: "utf8" });
  return result.status === 0 ? result.stdout.trim() : undefined;
}

/** `git archive` of HEAD plus the reviewer README and the exact build inputs,
 * both at the archive root. Entry times come from the commit, so the same
 * commit and inputs give the same bytes. */
export function sourcePackage(env: Record<string, string>, rehearsal: boolean) {
  const top = git(["rev-parse", "--show-toplevel"]);
  if (!top) throw new Error("The source package needs a git checkout");
  if (git(["status", "--porcelain"], top))
    throw new Error(
      "The source package archives HEAD; commit or discard local changes first",
    );
  const scratch = mkdtempSync(join(tmpdir(), "st259-source-"));
  try {
    const inputs = join(scratch, "BUILD-INPUTS.env");
    writeFileSync(
      inputs,
      `${[
        "# Exact build inputs of this submission (public origins, no secrets).",
        ...Object.entries(env)
          .filter(([name]) => name !== "SOURCE_TASTER_EXTENSION_CHANNEL")
          .sort(([a], [b]) => (a < b ? -1 : 1))
          .map(([name, value]) => `${name}=${value}`),
      ].join("\n")}\n`,
    );
    const readme = join(root, "store/README-AMO-REVIEWERS.md");
    const file = `source-taster-${extensionVersion}-source${rehearsal ? "-rehearsal" : ""}.zip`;
    const output = join(scratch, file);
    const result = spawnSync(
      "git",
      [
        "archive",
        "--format=zip",
        "-9",
        `--add-file=${readme}`,
        `--add-file=${inputs}`,
        "-o",
        output,
        "HEAD",
      ],
      { cwd: top, encoding: "utf8" },
    );
    if (result.status !== 0)
      throw new Error(`git archive failed: ${result.stderr}`);
    const bytes = readFileSync(output);
    return {
      file,
      bytes,
      sha256: sha256(bytes),
      commit: git(["rev-parse", "HEAD"], top)!,
    };
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
}

function main(argv: string[]) {
  const rehearsal = argv.includes("--rehearsal");
  const outIndex = argv.indexOf("--out");
  const out = resolve(
    outIndex >= 0 ? argv[outIndex + 1]! : join(root, "dist/release"),
  );
  const mode =
    argv.find((arg) => ["build", "source", "all"].includes(arg)) ?? "build";
  const env = storeEnv(process.env, rehearsal);
  mkdirSync(out, { recursive: true });
  const sums: string[] = [];
  const record: Record<string, unknown> = {
    version: extensionVersion,
    rehearsal,
    commit: git(["rev-parse", "HEAD"]) ?? null,
    inputs: Object.fromEntries(
      Object.entries(env).filter(([name]) =>
        name.startsWith("SOURCE_TASTER_EXTENSION_"),
      ),
    ),
  };
  if (mode !== "source") {
    const packages = targets.map((target) =>
      buildPackage(target, env, rehearsal),
    );
    for (const pkg of packages) {
      writeFileSync(join(out, pkg.file), pkg.bytes);
      sums.push(`${pkg.sha256}  ${pkg.file}`);
      console.log(`${pkg.file}  ${pkg.bytes.length} bytes  ${pkg.sha256}`);
    }
    record.packages = Object.fromEntries(
      packages.map((pkg) => [
        pkg.target,
        { file: pkg.file, sha256: pkg.sha256, files: pkg.files },
      ]),
    );
  }
  if (mode !== "build") {
    const source = sourcePackage(env, rehearsal);
    writeFileSync(join(out, source.file), source.bytes);
    sums.push(`${source.sha256}  ${source.file}`);
    record.source = {
      file: source.file,
      sha256: source.sha256,
      commit: source.commit,
    };
    console.log(
      `${source.file}  ${source.bytes.length} bytes  ${source.sha256}`,
    );
  }
  writeFileSync(join(out, "SHA256SUMS"), `${sums.sort().join("\n")}\n`);
  writeFileSync(
    join(out, "release.json"),
    `${JSON.stringify(record, null, 2)}\n`,
  );
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === new URL(import.meta.url).pathname
)
  main(process.argv.slice(2));
