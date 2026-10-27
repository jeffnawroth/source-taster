#!/usr/bin/env node
// SPDX-License-Identifier: AGPL-3.0-or-later
// Cargo salts local-package crate identities with their filesystem location.
// Stabilize only the two owned Pagefind WASM path packages; registry identities,
// compiler options, features and source paths retain their normal handling.
import { spawnSync } from "node:child_process";
const [rustc, ...args] = process.argv.slice(2);
if (!rustc) throw new Error("Expected Cargo's pinned rustc invocation");
const name = args[args.indexOf("--crate-name") + 1];
const versions: Record<string, string> = {
  pagefind_web: "1.5.2",
  pagefind_stem: "1.0.0",
};
let forwarded = args;
if (name && Object.hasOwn(versions, name)) {
  if (!args.includes("wasm32-unknown-unknown"))
    throw new Error("WASM identity wrapper used for a native build");
  forwarded = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "-C" && args[i + 1]?.startsWith("metadata=")) {
      i++;
      continue;
    }
    if (args[i]?.startsWith("-Cmetadata=")) continue;
    forwarded.push(args[i]!);
  }
  const features = args
    .flatMap((arg, i) =>
      arg === "--cfg" && args[i + 1]?.startsWith("feature=")
        ? [args[i + 1]!]
        : [],
    )
    .sort();
  forwarded.push(
    "-C",
    `metadata=source-taster-${name}-${versions[name]}-${features.join(",")}`,
  );
}
const result = spawnSync(rustc, forwarded, { stdio: "inherit" });
if (result.error) throw result.error;
process.exit(result.status ?? 1);
