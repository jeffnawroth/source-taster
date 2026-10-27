// SPDX-License-Identifier: AGPL-3.0-or-later
// Bundle Pagefind's browser JS from pinned source with the project's Rolldown
// 1.2.15 JS API. Run only by pagefind-source.ts under website-native-trace.ts,
// so the Rolldown native binding executed here is the controlled source build.
import { writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const [source, vendor, evidence] = process.argv.slice(2);
if (!source || !vendor || !evidence)
  throw new Error("Usage: pagefind-bundle.ts <source> <vendor> <evidence>");
const root = resolve(import.meta.dirname, "..");
// Rolldown resolves exactly as Astro's Vite does for the website in the frozen lock.
const resolveFrom = (from: string, id: string) => createRequire(from).resolve(id);
const astro = resolveFrom(resolve(root, "apps/website/package.json"), "astro/package.json");
const vite = resolveFrom(astro, "vite/package.json");
const rolldownPackage = resolveFrom(vite, "rolldown/package.json");
const rolldown = (await import(
  pathToFileURL(resolve(rolldownPackage, "../dist/index.mjs")).href
)) as typeof import("rolldown");
if (rolldown.VERSION !== "1.2.15") throw new Error("Rolldown 1.2.15 required");
const modules: Record<string, string[]> = {};
for (const [entry, format, name] of [
  ["public_search_api", "esm", "pagefind_public_search_api.1.5.2.js"],
  ["pagefind_worker", "iife", "pagefind_worker.1.5.2.js"],
] as const) {
  const result = await rolldown.build({
    input: resolve(source, `pagefind_web_js/lib/${entry}.ts`),
    cwd: resolve(source, "pagefind_web_js"),
    tsconfig: false,
    resolve: { extensionAlias: { ".js": [".ts", ".js"] } },
    transform: { target: "es2020" },
    // An unresolved import is an error, never an external runtime fetch.
    onLog(level, log) {
      throw new Error(`${level}: ${log.message}`);
    },
    output: { format, file: resolve(vendor, name), codeSplitting: false },
  });
  const ids = result.output.flatMap((chunk) =>
    chunk.type === "chunk" ? chunk.moduleIds : [],
  );
  if (
    result.output.length !== 1 ||
    !ids.length ||
    ids.some((id) => !id.startsWith(resolve(source, "pagefind_web_js/lib/")))
  )
    throw new Error(`Unexpected browser input for ${entry}: ${ids.join(", ")}`);
  modules[entry] = ids.map((id) => id.slice(source.length + 1)).sort();
}
await writeFile(
  evidence,
  JSON.stringify({ rolldown: rolldown.VERSION, modules }, null, 2) + "\n",
);
