// SPDX-License-Identifier: AGPL-3.0-or-later
// Package the exact reviewed source plus independent Linux build outputs.
// Real Git identity is retained: runtime quality must never use a supplied SHA.
import { spawnSync } from "node:child_process";
import {
  mkdtemp,
  rm,
  mkdir,
  cp,
  readFile,
  writeFile,
  stat,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
function git(args, cwd = process.cwd()) {
  const r = spawnSync("git", args, {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  });
  if (r.status !== 0) throw Error("package-git");
  return r.stdout.trim();
}
function tool(command, args) {
  if (spawnSync(command, args, { stdio: "ignore" }).status !== 0)
    throw Error("package-tool");
}
try {
  if (process.argv.length !== 3 || git(["status", "--porcelain"]) !== "")
    throw Error("package-unclean");
  const target = resolve(process.argv[2]),
    head = git(["rev-parse", "HEAD"]);
  const publication = JSON.parse(
    await readFile("apps/website/dist/website-artifact.json", "utf8"),
  );
  if (publication.mode !== "publication")
    throw Error("package-unpublished-website");
  const dir = await mkdtemp(join(tmpdir(), "st116-package-"));
  try {
    const root = join(dir, "release");
    await mkdir(root);
    git([
      "archive",
      "--format=tar",
      "--output=" + join(dir, "source.tar"),
      "HEAD",
    ]);
    tool("tar", ["-xf", join(dir, "source.tar"), "-C", root]);
    git(["bundle", "create", join(dir, "source.bundle"), "HEAD"]);
    git(["init", "--initial-branch=deployment", root]);
    git(["fetch", "--no-tags", join(dir, "source.bundle"), "HEAD"], root);
    git(["update-ref", "HEAD", head], root);
    git(["read-tree", "HEAD"], root);
    await rm(join(root, ".git", "FETCH_HEAD"), { force: true });
    await rm(join(root, ".git", "hooks"), { recursive: true, force: true });
    for (const path of [
      "apps/server/dist",
      "apps/web/dist",
      "apps/website/dist",
      "packages/core/dist",
      "packages/i18n/src/paraglide",
    ]) {
      if (!(await stat(path)).isDirectory())
        throw Error("package-build-missing");
      await mkdir(resolve(root, path, ".."), { recursive: true });
      await cp(path, join(root, path), { recursive: true });
    }
    if (
      git(["status", "--porcelain"], root) !== "" ||
      git(["rev-parse", "HEAD"], root) !== head
    )
      throw Error("package-source-identity");
    await writeFile(join(root, ".git", "info", "exclude"), "node_modules/\n", {
      flag: "a",
    });
    tool("tar", ["-czf", target, "-C", root, "."]);
    console.log(
      JSON.stringify({ program: "verification", commit: head, complete: true }),
    );
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
} catch {
  console.error(JSON.stringify({ code: "package-refused" }));
  process.exitCode = 78;
}
