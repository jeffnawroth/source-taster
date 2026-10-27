// SPDX-License-Identifier: AGPL-3.0-or-later
// Exact source/notice/scope refusals through the license inspection CLI.
import { spawnSync } from "node:child_process";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve, dirname, basename } from "node:path";
import type { BuildGraph, BuildReceipt } from "./website-evidence.ts";
const root = resolve(import.meta.dirname, "..");
const work = resolve(root, ".tmp/pagefind");
const control = resolve(root, ".tmp/license-controls");
await mkdir(control, {recursive:true});
const graphs = JSON.parse(await readFile(resolve(work,"graphs.json"),"utf8")) as Record<string, BuildGraph>;
const receipt = JSON.parse(await readFile(resolve(work,"receipt.json"),"utf8")) as BuildReceipt;
const compiler = graphs.compiler!;
const mpl = compiler.packages.find((p) => p.name === "cssparser")!;
let passed=0;
async function check(name:string, candidate:Record<string,BuildGraph>, target=receipt.target, error?:string, notice?:string) {
  const file=resolve(control,"graphs.json");
  await writeFile(file,JSON.stringify(candidate));
  const run=spawnSync(process.execPath,["scripts/website-native-licenses.ts","verify-exact",file,target,work,...(notice?[notice]:[])],{cwd:root,encoding:"utf8"});
  const output=`${run.stdout}${run.stderr}`;
  if(error ? run.status===0 || !output.includes(error) : run.status!==0) throw new Error(`${name}: ${output}`);
  passed++;
  console.log(`Passed: ${name}`);
  return output;
}
const exact = {compiler:{...compiler,packages:[mpl]}};
await check("Exact MPL source/build scope qualifies",exact);
await check("MPL browser scope refused",{"web-en":{...graphs["web-en"]!,packages:[mpl]}},receipt.target,"Native license scope mismatch");
await check("Unqualified host target refused",exact,"unknown-target","Native license scope mismatch");
await check("Expanded features refused",{compiler:{...compiler,packages:[mpl],features:[...compiler.features,"--all-features"]}},receipt.target,"Native license scope mismatch");
for (const [name,pkg,error] of [
  ["Changed checksum refused",{...mpl,checksum:"0".repeat(64)},"Native license identity mismatch"],
  ["Changed source refused",{...mpl,source:"registry+https://example.invalid/index"},"Native license identity mismatch"],
  ["Changed expression refused",{...mpl,license:"MIT"},"Native license identity mismatch"],
  ["Unknown MPL identity refused",{...mpl,version:"999.0.0"},"Unknown exact native license qualification"],
  ["Unknown license refused",{...mpl,name:"unknown-component",license:"LicenseRef-Unknown"},"Unknown exact native license qualification"],
] as const) await check(name,{compiler:{...compiler,packages:[pkg]}},receipt.target,error);
const directory = dirname(resolve(work,mpl.manifestPath));
const archive=resolve(work,"cargo-home/registry/cache",basename(dirname(directory)),`${mpl.name}-${mpl.version}.crate`);
for (const [file,error] of [[archive,"Native license archive mismatch"],[resolve(directory,"LICENSE"),"Native license text mismatch"]]) {
  const original=await readFile(file!);
  try {
    await writeFile(file!,Buffer.concat([original,Buffer.from("\ncorrupt license control\n")]));
    await check(error!,exact,receipt.target,error);
  } finally { await writeFile(file!,original); }
}
const unicode=graphs["web-en"]!.packages.find((p)=>p.name==="unicode-ident")!;
const unicodeGraph={"web-en":{...graphs["web-en"]!,packages:[unicode]}};
const notice=resolve(root,"apps/website/dist-preview/third-party/pagefind/NOTICE.txt");
const elected=await check("Conjunctive Unicode election and delivered texts retained",unicodeGraph,receipt.target,undefined,notice);
if (!elected.includes('"license":"MIT AND Unicode-3.0"')) throw new Error("Unicode election lost conjunction");
const originalNotice=await readFile(notice,"utf8");
const unicodeText=await readFile(resolve(dirname(resolve(work,unicode.manifestPath)),"LICENSE-UNICODE"),"utf8");
const dropped=resolve(control,"dropped-unicode.txt");
await writeFile(dropped,originalNotice.replaceAll(unicodeText,""));
await check("Dropped Unicode delivery term refused",unicodeGraph,receipt.target,"Missing conjunctive Unicode notice",dropped);
console.log(`Passed exact native license controls: ${passed}`);
