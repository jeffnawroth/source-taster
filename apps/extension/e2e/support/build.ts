// SPDX-License-Identifier: AGPL-3.0-or-later
import { spawnSync } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

export type Target = "chromium" | "firefox";
const root = new URL("../..", import.meta.url).pathname;

/** Runs the real target build with explicit development configuration into a
 * test-owned directory. The directory path fixes the unpacked extension ID. */
export async function buildExtension(
  target: Target,
  config: Record<string, string>,
) {
  const directory = await mkdtemp(join(tmpdir(), `st92-${target}-`));
  const outDir = join(directory, "extension");
  const result = spawnSync(
    process.execPath,
    [join(root, "node_modules/vite/bin/vite.js"), "build", "--mode", target],
    {
      cwd: root,
      env: {
        PATH: process.env.PATH,
        ...config,
        SOURCE_TASTER_EXTENSION_OUT_DIR: outDir,
      },
      encoding: "utf8",
    },
  );
  if (result.status !== 0)
    throw new Error(
      `Extension build failed:\n${result.stdout}${result.stderr}`,
    );
  return {
    directory,
    outDir,
    remove: () => rm(directory, { recursive: true, force: true }),
  };
}
