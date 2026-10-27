// SPDX-License-Identifier: AGPL-3.0-or-later
// Exact source/scope qualification. This is not a legal or publication receipt.
import { readFile, writeFile, mkdir, rm } from "node:fs/promises";
import { resolve, dirname, basename, relative } from "node:path";
import { createHash } from "node:crypto";
import type { BuildGraph, SourcePackage } from "./website-evidence.ts";

const root = resolve(import.meta.dirname, "..");
const policyDirectory = resolve(root, "apps/website/qualification/licenses");
const hash = (bytes: Buffer | string) =>
  createHash("sha256").update(bytes).digest("hex");
export interface LicenseEntry {
  identity: string;
  expression: string;
  elected: string;
  source: string;
  checksum: string;
  archiveUrl: string;
  graphs: string[];
  files: Record<string, string>;
  noticeFiles: string[];
  obligations: string[];
}
interface LicensePolicy {
  hostTargets: string[];
  scopes: Record<
    string,
    { features: string[]; edges: string[]; target: string }
  >;
  supplementalMplText: { path: string; sha256: string };
  entries: LicenseEntry[];
}
export const policyBytes = await readFile(
  resolve(policyDirectory, "policy.json"),
);
export const nativeLicensePolicy = JSON.parse(
  policyBytes.toString(),
) as LicensePolicy;

/** SPDX expression → elected satisfiable terms. Cargo's legacy slash is OR. */
export function elect(expression: string, allowed: (id: string) => boolean) {
  const tokens = expression
    .replace(/\//g, " OR ")
    .replace(/([()])/g, " $1 ")
    .trim()
    .split(/\s+/);
  let index = 0;
  function or(): string | undefined {
    const options = [and()];
    while (tokens[index] === "OR") {
      index++;
      options.push(and());
    }
    return options.find((option) => option !== undefined);
  }
  function and(): string | undefined {
    const terms = [term()];
    while (tokens[index] === "AND") {
      index++;
      terms.push(term());
    }
    return terms.every((t) => t !== undefined)
      ? terms.join(" AND ")
      : undefined;
  }
  function term(): string | undefined {
    const token = tokens[index++];
    if (token === "(") {
      const inner = or();
      if (tokens[index++] !== ")") throw new Error(`Bad SPDX: ${expression}`);
      return inner;
    }
    if (!token || ["AND", "OR", "WITH", ")"].includes(token))
      throw new Error(`Bad SPDX: ${expression}`);
    let id = token;
    if (tokens[index] === "WITH") {
      const exception = tokens[index + 1];
      if (!exception || ["AND", "OR", "WITH", "(", ")"].includes(exception))
        throw new Error(`Bad SPDX: ${expression}`);
      id += ` WITH ${exception}`;
      index += 2;
    }
    return allowed(id) ? id : undefined;
  }
  const result = or();
  if (index !== tokens.length) throw new Error(`Bad SPDX: ${expression}`);
  return result;
}

export interface LicenseEvidence {
  identity: string;
  source: string;
  checksum: string;
  archiveUrl: string;
  expression: string;
  elected: string;
  graph: string;
  target: string;
  hostTarget: string;
  features: string[];
  edges: string[];
  featureTreeSha256: string;
  files: Record<string, string>;
  obligations: string[];
}

export async function verifyUnicodeNotice(
  notice: string,
  work: string,
  graphs: Record<string, BuildGraph>,
) {
  for (const entry of nativeLicensePolicy.entries.filter(
    (e) => e.elected === "MIT AND Unicode-3.0",
  )) {
    const pkg = Object.entries(graphs)
      .filter(([name]) => name.startsWith("web-"))
      .flatMap(([, g]) => g.packages)
      .find((p) => `${p.name}@${p.version}` === entry.identity);
    if (!pkg) continue;
    const directory = dirname(resolve(work, pkg.manifestPath));
    if (!notice.includes(`${pkg.name} ${pkg.version} — ${entry.expression}`))
      throw new Error(`Missing conjunctive Unicode notice: ${entry.identity}`);
    for (const file of ["LICENSE-MIT", "LICENSE-UNICODE"])
      if (!notice.includes(await readFile(resolve(directory, file), "utf8")))
        throw new Error(
          `Missing conjunctive Unicode notice: ${entry.identity}/${file}`,
        );
  }
}

export async function qualifyNativeLicense(
  pkg: SourcePackage,
  graphName: string,
  graph: BuildGraph,
  hostTarget: string,
  work: string,
): Promise<LicenseEvidence | undefined> {
  const identity = `${pkg.name}@${pkg.version}`;
  const entry = nativeLicensePolicy.entries.find(
    (e) => e.identity === identity,
  );
  if (!entry) return undefined;
  const scope = nativeLicensePolicy.scopes[graphName];
  if (
    !nativeLicensePolicy.hostTargets.includes(hostTarget) ||
    !entry.graphs.includes(graphName) ||
    !scope ||
    graph.target !== (scope.target === "host" ? hostTarget : scope.target) ||
    JSON.stringify(graph.features) !== JSON.stringify(scope.features)
  )
    throw new Error(`Native license scope mismatch: ${identity}/${graphName}`);
  if (
    pkg.source !== entry.source ||
    pkg.checksum !== entry.checksum ||
    pkg.license !== entry.expression
  )
    throw new Error(`Native license identity mismatch: ${identity}`);
  const directory = dirname(resolve(work, pkg.manifestPath));
  const registry = resolve(work, "cargo-home/registry/src");
  if (
    !directory.startsWith(`${registry}/`) ||
    basename(directory) !== `${pkg.name}-${pkg.version}`
  )
    throw new Error(`Native license source path mismatch: ${identity}`);
  const archive = resolve(
    work,
    "cargo-home/registry/cache",
    basename(dirname(directory)),
    `${pkg.name}-${pkg.version}.crate`,
  );
  if (hash(await readFile(archive)) !== entry.checksum)
    throw new Error(`Native license archive mismatch: ${identity}`);
  for (const [file, expected] of Object.entries(entry.files)) {
    if (
      file.startsWith("/") ||
      file.split("/").includes("..") ||
      hash(await readFile(resolve(directory, file))) !== expected
    )
      throw new Error(`Native license text mismatch: ${identity}/${file}`);
  }
  const declared = (
    await readFile(resolve(directory, "Cargo.toml"), "utf8")
  ).match(/^license = "([^"]+)"$/m)?.[1];
  if (
    declared !== entry.expression ||
    elect(entry.expression, (id) =>
      entry.elected.split(" AND ").includes(id),
    ) !== entry.elected
  )
    throw new Error(`Native license election mismatch: ${identity}`);
  return {
    identity,
    source: entry.source,
    checksum: entry.checksum,
    archiveUrl: entry.archiveUrl,
    expression: entry.expression,
    elected: entry.elected,
    graph: graphName,
    target: graph.target,
    hostTarget,
    features: graph.features,
    edges: scope.edges,
    featureTreeSha256: graph.featureTreeSha256,
    files: entry.files,
    obligations: entry.obligations,
  };
}

// Retain unmodified checksum-bound source archives and complete texts for build
// tool recipients. These tools are not served as browser/application runtime.
export async function retainNativeLicenseSources(
  work: string,
  graphs: Record<string, BuildGraph>,
  evidence: LicenseEvidence[],
) {
  const directory = resolve(work, "license-sources");
  await rm(directory, { recursive: true, force: true });
  await mkdir(directory, { recursive: true });
  const mpl = await readFile(
    resolve(policyDirectory, nativeLicensePolicy.supplementalMplText.path),
  );
  if (hash(mpl) !== nativeLicensePolicy.supplementalMplText.sha256)
    throw new Error("Supplemental MPL text mismatch");
  await writeFile(resolve(directory, "MPL-2.0.txt"), mpl);
  await writeFile(resolve(directory, "policy.json"), policyBytes);
  let notice =
    "#115 exact native license technical qualification\n\nBuild tools only; no human legal/publication approval. The .crate files beside this notice are complete, unmodified upstream source archives, including original notices/manifests. MPL-covered build-tool source is available locally from these archives under MPL-2.0; see MPL-2.0.txt. These files must accompany any distribution of the covered build executable. No MPL secondary-license election or private/domain runtime use is approved. Browser Unicode notices and source are also delivered separately with Pagefind.\n\n";
  const sources: Record<string, string> = {};
  for (const entry of nativeLicensePolicy.entries) {
    const selections = evidence.filter((e) => e.identity === entry.identity);
    if (!selections.length) continue;
    const pkg = Object.values(graphs)
      .flatMap((g) => g.packages)
      .find((p) => `${p.name}@${p.version}` === entry.identity)!;
    const location = dirname(resolve(work, pkg.manifestPath));
    const name = `${pkg.name}-${pkg.version}.crate`;
    const bytes = await readFile(
      resolve(
        work,
        "cargo-home/registry/cache",
        basename(dirname(location)),
        name,
      ),
    );
    if (hash(bytes) !== entry.checksum)
      throw new Error(`Native license archive mismatch: ${entry.identity}`);
    await writeFile(resolve(directory, name), bytes);
    sources[name] = entry.checksum;
    notice += `\n${entry.identity}\nSource: ${entry.archiveUrl}\nSHA-256: ${entry.checksum}\nDeclared: ${entry.expression}\nElected: ${entry.elected}\nScopes: ${selections.map((e) => `${e.graph}/${e.target}/normal+build`).join(", ")}\nObligations:\n${entry.obligations.map((o) => `- ${o}`).join("\n")}\n`;
    for (const file of entry.noticeFiles)
      notice += `\n${file}:\n${await readFile(resolve(location, file), "utf8")}\n`;
    if (!entry.noticeFiles.length)
      notice +=
        "\nThe immutable manifest declares MPL-2.0; this crate omits a standalone license file. The complete MPL text is supplied as MPL-2.0.txt. Original manifests and any per-file notices remain in the source archive.\n";
  }
  await writeFile(resolve(directory, "NOTICE.txt"), notice);
  sources["NOTICE.txt"] = hash(notice);
  sources["MPL-2.0.txt"] = hash(mpl);
  sources["policy.json"] = hash(policyBytes);
  await writeFile(
    resolve(directory, "manifest.json"),
    JSON.stringify(
      {
        policySha256: hash(policyBytes),
        evidence,
        files: sources,
        legalStatus: "Pending human legal review; publication remains blocked",
      },
      null,
      2,
    ) + "\n",
  );
  return {
    directory: relative(root, directory),
    policySha256: hash(policyBytes),
    files: sources,
  };
}
