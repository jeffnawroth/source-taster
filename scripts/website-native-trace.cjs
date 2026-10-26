// SPDX-License-Identifier: AGPL-3.0-or-later
// Build-only native-load evidence; redirect only Astro's compiler binding.
const { appendFileSync, readFileSync, realpathSync } = require("node:fs");
const { createHash } = require("node:crypto");
const original = process.dlopen;
process.dlopen = function (module, filename, ...args) {
  const requested = realpathSync(filename);
  const controlled =
    /\/\@astrojs\/compiler-binding-[^/]+\/astro\.[^/]+\.node$/.test(requested);
  const path = controlled
    ? realpathSync(process.env.SOURCE_TASTER_COMPILER_PATH)
    : requested;
  const result = Reflect.apply(original, this, [module, path, ...args]);
  appendFileSync(
    process.env.SOURCE_TASTER_NATIVE_TRACE,
    JSON.stringify({
      requested,
      path,
      controlled,
      sha256: createHash("sha256").update(readFileSync(path)).digest("hex"),
      loaded: true,
    }) + "\n",
  );
  return result;
};
