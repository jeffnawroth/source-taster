// SPDX-License-Identifier: AGPL-3.0-or-later
// Operational child_process boundary controls, with observable child output.
import { spawnSync } from "node:child_process";
import { mkdir, writeFile, symlink, rm } from "node:fs/promises";
import { resolve } from "node:path";
const root = resolve(import.meta.dirname, "..");
const work = resolve(root, ".tmp/native-trace-controls");
await mkdir(work, { recursive: true });
const preload = resolve(root, "scripts/website-native-trace.ts");
const env = {
  ...process.env,
  SOURCE_TASTER_CONTROLLED_BIN: resolve(root, ".tmp/pagefind/bin"),
  SOURCE_TASTER_NATIVE_TRACE: resolve(work, "trace.jsonl"),
  NODE_OPTIONS: `--import=${preload}`,
};
const bad =
  "import{spawnSync}from'node:child_process';spawnSync('/usr/bin/true');console.log('ESCAPED');";
const good = "console.log('GUARDED_CHILD');";
await writeFile(resolve(work, "bad.mjs"), bad);
await writeFile(resolve(work, "good.mjs"), good);
export const results: string[] = [];
for (const method of [
  "spawn",
  "spawnSync",
  "execFile",
  "execFileSync",
  "fork",
]) {
  for (const stripped of [true, false]) {
    const file = resolve(work, `${stripped ? "bad" : "good"}.mjs`);
    const options = stripped
      ? "{env:{},execArgv:[]}"
      : "{stdio:'inherit',execArgv:[]}";
    const code =
      method === "fork"
        ? `cp.fork(${JSON.stringify(file)},[],${options});`
        : `const child=cp.${method}(process.execPath,[${JSON.stringify(file)}],${options});if(child?.stdout)${method.endsWith("Sync") ? "process.stdout.write(child.stdout)" : "child.stdout.pipe(process.stdout)"};if(child?.stderr)${method.endsWith("Sync") ? "process.stderr.write(child.stderr)" : "child.stderr.pipe(process.stderr)"};`;
    const run = spawnSync(
      process.execPath,
      [
        "--input-type=module",
        "-e",
        `import cp from 'node:child_process';${code}`,
      ],
      { cwd: root, env, encoding: "utf8" },
    );
    const output = `${run.stdout}${run.stderr}`;
    if (
      stripped
        ? output.includes("ESCAPED") || !output.includes("Refused")
        : run.status !== 0 || !output.includes("GUARDED_CHILD")
    )
      throw new Error(
        `${method} ${stripped ? "stripped descendant" : "guarded child"} control failed: ${output}`,
      );
    results.push(
      `${method}: ${stripped ? "stripped descendant refused" : "guarded child executes"}`,
    );
  }
}
// Parent PATH can name a permitted Node while the child's cwd/PATH names true.
const fake = resolve(work, "node");
await rm(fake, { force: true });
await symlink("/usr/bin/true", fake);
for (const options of [
  { cwd: work, env: { ...env, PATH: "." } },
  { cwd: work },
]) {
  const file = "env" in options ? "node" : "./node";
  const run = spawnSync(
    process.execPath,
    [
      "--input-type=module",
      "-e",
      `import{spawnSync}from'node:child_process';spawnSync(${JSON.stringify(file)},[],${JSON.stringify(options)});console.log('ESCAPED');`,
    ],
    { cwd: root, env, encoding: "utf8" },
  );
  if (
    run.status === 0 ||
    !run.stderr.includes("Refused uncontrolled executable")
  )
    throw new Error(
      `Child executable resolution control failed: ${run.stdout}${run.stderr}`,
    );
  results.push(`Child ${file} resolution refused`);
}
console.log(`Passed descendant process controls: ${results.length}`);
