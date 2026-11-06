// PROTOTYPE (#191): run with `node --experimental-strip-types check-contrast.ts`
import { checks, surfaces, type Variant, type Theme } from "./tokens.ts";
let fails = 0;
for (const v of Object.keys(surfaces) as Variant[])
  for (const t of ["light", "dark"] as Theme[])
    for (const r of checks(v, t))
      if (r.ratio < r.min) {
        fails++;
        console.log(`FAIL ${v} ${t} ${r.name}: ${r.ratio.toFixed(2)} < ${r.min}`);
      }
console.log(fails ? `${fails} failing` : "all pass");
