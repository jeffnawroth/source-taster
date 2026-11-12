// SPDX-License-Identifier: AGPL-3.0-or-later
import { websiteRecipe } from "../../../scripts/website-recipe.ts";
import { createHash } from "node:crypto";
import { readFile, readdir, stat } from "node:fs/promises";
import { resolve, relative } from "node:path";
import type { LegalDocument } from "../src/legal.ts";
import { languages, legalIds, type Review } from "../src/metadata.ts";
export interface Publication {
  schemaVersion: number;
  domain: string | null;
  supportAddress: string | null;
  seller: Record<
    "name" | "address" | "country" | "legalDetails",
    string | null
  >;
  legalVersions: Record<string, Record<string, string>>;
  reviews: Record<string, Review | null>;
}
export const digest = (text: string | Buffer) =>
  createHash("sha256").update(text).digest("hex");
export const legalDigest = (doc: LegalDocument) =>
  digest(JSON.stringify({ ...doc, approval: null }));
const valid = (value: unknown): value is string =>
  typeof value === "string" &&
  value.trim().length > 2 &&
  !/draft|pending|placeholder|example|localhost|todo|tbd|<|>/i.test(value);
/** Bind every review to this exact content, toolchain, policy and deployment identity. */
/**
 * Every file of the website group of the committed brand export manifest
 * (#214): favicons, touch icon, web app manifest and its icons, and the Safari
 * pinned-tab mask. `basis` records the platform mandate, not publication, so
 * the "optional" web-app and pinned-tab files are published and digested too.
 * Extension, toolbar and store files belong to other groups and are never
 * published by the website.
 */
export async function websiteBrandFiles(project: string): Promise<string[]> {
  const record = JSON.parse(
    await readFile(
      resolve(project, "packages/brand/exports/manifest.json"),
      "utf8",
    ),
  ) as { exports: { file: string; group: string }[] };
  return record.exports
    .filter((entry) => entry.group === "website")
    .map((entry) => entry.file);
}
export async function reviewDigest(root: string): Promise<string> {
  const files: string[] = [];
  async function collect(dir: string) {
    for (const entry of await readdir(resolve(root, dir), {
      withFileTypes: true,
    })) {
      const path = `${dir}/${entry.name}`;
      if (entry.isDirectory()) await collect(path);
      else files.push(path);
    }
  }
  for (const dir of ["src", "content", "scripts", "qualification", "public"])
    await collect(dir);
  files.push(
    "astro.config.mjs",
    "hosting.ts",
    "package.json",
    "claims.json",
    "publication.json",
  );
  const inputs: [string, string][] = Object.entries(
    await websiteRecipe(resolve(root, "../..")),
  );
  // Shared static recipes, typography roles and build-rendered product markup
  // now contribute to the distributed site. A review of an earlier version of
  // any of these inputs must not approve changed output implicitly.
  for (const file of [
    "design-tokens/theme.css",
    "design-tokens/package.json",
    "ui/package.json",
    "ui/src/recipes.ts",
    "ui/src/reference-outcome.tsx",
    "ui/src/outcome-badges.tsx",
    "ui/src/journal-abbreviation.tsx",
    "ui/NOTICE.md",
    "ui/notices/react-spectrum-LICENSE",
    "ui/notices/lucide-LICENSE",
    "i18n/package.json",
    "i18n/project.inlang/settings.json",
    "i18n/messages/de.json",
    "i18n/messages/en.json",
    // Brand artwork and its draft notice are published as favicons (#214).
    "brand/NOTICE.md",
    "brand/exports/manifest.json",
    // The head links and manifest colours Page.astro renders.
    "brand/src/web-head.ts",
    ...(await websiteBrandFiles(resolve(root, "../.."))).map(
      (file) => `brand/exports/${file}`,
    ),
  ]) {
    const path = `../../packages/${file}`;
    inputs.push([path, digest(await readFile(resolve(root, path)))]);
  }
  for (const file of files.sort()) {
    if (file === "publication.json") {
      const config = JSON.parse(
        await readFile(resolve(root, file), "utf8"),
      ) as Publication;
      inputs.push([file, JSON.stringify({ ...config, reviews: {} })]);
    } else inputs.push([file, digest(await readFile(resolve(root, file)))]);
  }
  return digest(JSON.stringify(inputs));
}
export async function checkPublication(
  root = process.cwd(),
): Promise<{ contentSha256: string; config: Publication }> {
  const config = JSON.parse(
    await readFile(resolve(root, "publication.json"), "utf8"),
  ) as Publication;
  const errors: string[] = [];
  if (config.schemaVersion !== 1) errors.push("schema version");
  let domain: URL | undefined;
  try {
    domain = new URL(config.domain ?? "");
  } catch {
    /* fail below */
  }
  if (
    !domain ||
    domain.protocol !== "https:" ||
    domain.pathname !== "/" ||
    domain.port ||
    domain.username ||
    domain.password ||
    domain.search ||
    domain.hash ||
    !valid(domain.hostname) ||
    !domain.hostname.includes(".") ||
    /\.(test|invalid|local)$/.test(domain.hostname)
  )
    errors.push("real HTTPS domain");
  if (
    !valid(config.supportAddress) ||
    config.supportAddress !== `support@${domain?.hostname}`
  )
    errors.push("monitored support address");
  for (const field of ["name", "address", "country", "legalDetails"] as const)
    if (!valid(config.seller?.[field])) errors.push(`seller ${field}`);
  for (const language of languages)
    for (const id of legalIds) {
      const version = config.legalVersions?.[language]?.[id];
      if (!version || !/^[a-zA-Z0-9.-]+$/.test(version)) {
        errors.push(`${language}/${id}: version missing`);
        continue;
      }
      try {
        const doc = JSON.parse(
          await readFile(
            resolve(root, `content/legal/${language}/${id}/${version}.json`),
            "utf8",
          ),
        ) as LegalDocument;
        if (
          doc.language !== language ||
          doc.id !== id ||
          doc.version !== version ||
          doc.status !== "approved" ||
          !doc.paragraphs?.length ||
          doc.paragraphs.some((text) => !valid(text)) ||
          !valid(doc.title) ||
          !doc.approval ||
          !valid(doc.approval.reviewer) ||
          !valid(doc.approval.date) ||
          doc.approval.sha256 !== legalDigest(doc)
        )
          errors.push(`${language}/${id}: approved legal version required`);
        else await evidence(root, doc.approval.evidence);
      } catch {
        errors.push(`${language}/${id}: legal document or evidence missing`);
      }
    }
  const contentSha256 = await reviewDigest(root);
  for (const kind of [
    "legal",
    "claims",
    "dependencies",
    "accessibility",
    "translation",
  ]) {
    const review = config.reviews?.[kind];
    if (
      !review ||
      !valid(review.reviewer) ||
      !/^\d{4}-\d{2}-\d{2}$/.test(review.date) ||
      review.sha256 !== contentSha256
    ) {
      errors.push(`${kind}: current release review required`);
      continue;
    }
    try {
      await evidence(root, review.evidence);
    } catch {
      errors.push(`${kind}: review evidence missing`);
    }
  }
  if (errors.length)
    throw new Error(`Publication blocked:\n- ${errors.join("\n- ")}`);
  return { contentSha256, config };
}
async function evidence(root: string, path: string) {
  if (
    !valid(path) ||
    relative(root, resolve(root, path)).startsWith("..") ||
    !(await stat(resolve(root, path))).isFile() ||
    (await stat(resolve(root, path))).size === 0
  )
    throw new Error("Review evidence must be a nonempty local file");
}
