// SPDX-License-Identifier: AGPL-3.0-or-later
import assert from "node:assert/strict";
import { test } from "node:test";
import { imageAlt, imageClaims } from "../src/copy.ts";
import { fixtureSha256 } from "../src/fixtures.ts";
import { buildManifest } from "../src/manifest.ts";
import { imageSpecs } from "../src/specs.ts";
import { manifestProblems } from "../src/validate.ts";

const hash = "a".repeat(64);
const captures = (["en", "de"] as const).flatMap((language) =>
  (["workspace", "overview", "evidence"] as const).map((story) => ({
    file: `captures/${language}-${story}.png`,
    sha256: hash,
    language,
    story,
    devPreviewNoticeInViewport: story === "workspace",
    verdictsRead: ["x"],
  })),
);
const gateOk = { ok: true, reason: "b588c9c is an ancestor of HEAD" };
const build = (status: "dry-run" | "final", gate = gateOk) =>
  buildManifest({
    status,
    commit: "313b678",
    gate,
    captures,
    sha256: () => hash,
  });

await test("a manifest lists exactly the image set with its claims, alt text and provenance", () => {
  const manifest = build("dry-run");
  assert.deepEqual(manifestProblems(manifest), []);
  assert.deepEqual(
    manifest.images.map((i) => i.file),
    imageSpecs.map((s) => s.file),
  );
  assert.equal(manifest.fixtureSha256, fixtureSha256);
  assert.equal(manifest.releaseQualified, false);
  const spec = imageSpecs.find((s) => s.file === "cws-en-2-overview.png")!;
  const overview = manifest.images.find((i) => i.file === spec.file)!;
  assert.deepEqual(overview.claims, [
    "verdict-per-reference",
    "summary-counts",
    "doi-conflict",
  ]);
  assert.deepEqual(overview.alt, imageAlt(spec));
  assert.deepEqual(imageClaims(spec), overview.claims);
});

await test("final status needs an open gate and each tampering is reported", () => {
  const closed = build("final", { ok: false, reason: "b588c9c missing" });
  assert.match(manifestProblems(closed).join("\n"), /final.*gate/u);
  const manifest = build("dry-run");
  manifest.images[0]!.claims = ["invented-claim"];
  manifest.images[1]!.alt.en = "";
  manifest.images.pop();
  manifest.fixtureSha256 = "0".repeat(64);
  (manifest as { releaseQualified: boolean }).releaseQualified = true;
  const problems = manifestProblems(manifest).join("\n");
  assert.match(problems, /invented-claim/u);
  assert.match(problems, /alt/u);
  assert.match(problems, /social-de-1200x630\.png.*missing/u);
  assert.match(problems, /fixtureSha256/u);
  assert.match(problems, /releaseQualified/u);
});

await test("every store screenshot names the captures it is composed from", () => {
  const manifest = build("dry-run");
  const evidence = manifest.images.find(
    (i) => i.file === "cws-de-3-evidence.png",
  )!;
  assert.deepEqual(evidence.sources.captures, ["captures/de-evidence.png"]);
  const promo = manifest.images.find(
    (i) => i.file === "promo-small-440x280.png",
  )!;
  assert.deepEqual(promo.sources.captures, []);
});
