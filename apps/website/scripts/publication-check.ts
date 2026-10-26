// SPDX-License-Identifier: AGPL-3.0-or-later
import { resolve } from "node:path";
import { checkPublication, reviewDigest } from "./publication.ts";
const rootArg = process.argv.indexOf("--root");
const root = rootArg >= 0 ? resolve(process.argv[rootArg + 1]!) : process.cwd();
if (process.argv.includes("--digest")) console.log(await reviewDigest(root));
else {
  await checkPublication(root);
  console.log("Publication reviews complete");
}
