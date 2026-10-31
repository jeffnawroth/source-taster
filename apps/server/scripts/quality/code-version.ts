// SPDX-License-Identifier: AGPL-3.0-or-later
// The code version of a Measured configuration, read from git, never from a log.
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const repository = fileURLToPath(new URL("../../../../", import.meta.url));
export function codeVersion() {
  const git = (...args: string[]) =>
    execFileSync("git", args, { cwd: repository, encoding: "utf8" }).trim();
  return {
    sha: git("rev-parse", "HEAD"),
    dirty: git("status", "--porcelain") !== "",
  };
}
