// SPDX-License-Identifier: AGPL-3.0-or-later
// The provider installs the frozen graph; it must serve the already reviewed
// artifact, never silently rebuild the publication as a preview.
import { readFile, stat } from "node:fs/promises";
import { spawnSync } from "node:child_process";
try {
  const git = spawnSync("git", ["status", "--porcelain"], { encoding: "utf8" });
  if (git.status !== 0 || git.stdout.trim() !== "")
    throw Error("platform-source");
  const site = JSON.parse(
    await readFile("apps/website/dist/website-artifact.json", "utf8"),
  );
  if (site.mode !== "publication") throw Error("platform-publication");
  for (const file of [
    "apps/server/dist/web.js",
    "apps/server/dist/worker.js",
    "apps/web/dist/index.html",
  ])
    if (!(await stat(file)).isFile()) throw Error("platform-build");
  console.log(JSON.stringify({ program: "verification", artifact: "present" }));
} catch {
  console.error(JSON.stringify({ code: "platform-artifact-refused" }));
  process.exitCode = 78;
}
