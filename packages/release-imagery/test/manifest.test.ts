// SPDX-License-Identifier: AGPL-3.0-or-later
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
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
  assert.match(problems, /x-de-1200x600\.png.*missing/u);
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

await test("every image that pictures or states product behaviour carries the development-preview notice, and the promo tiles say why they cannot", () => {
  const manifest = build("dry-run");
  // The catalogue is read independently of the code under test.
  const catalogue = (locale: "en" | "de") =>
    (
      JSON.parse(
        readFileSync(
          new URL(`../../i18n/messages/${locale}.json`, import.meta.url),
          "utf8",
        ),
      ) as Record<string, string>
    ).skeleton_notice;
  for (const image of manifest.images) {
    const spec = imageSpecs.find((s) => s.file === image.file)!;
    if (spec.role.startsWith("promo")) {
      assert.equal(image.devPreviewNotice.carried, false, image.file);
      assert.match(
        (image.devPreviewNotice as { reason: string }).reason,
        /mark and name only/u,
        image.file,
      );
    } else {
      assert.deepEqual(
        image.devPreviewNotice,
        {
          carried: true,
          locale: spec.locale,
          text: catalogue(spec.locale as "en" | "de"),
        },
        image.file,
      );
    }
  }
});

await test("a manifest that drops, rewrites or leaves unexplained the notice is reported", () => {
  const manifest = build("dry-run");
  const store = manifest.images.find(
    (i) => i.file === "cws-en-2-overview.png",
  )!;
  store.devPreviewNotice = { carried: false, reason: "no room" };
  const promo = manifest.images.find(
    (i) => i.file === "promo-small-440x280.png",
  )!;
  promo.devPreviewNotice = { carried: false, reason: "" };
  const social = manifest.images.find(
    (i) => i.file === "social-de-1200x630.png",
  )!;
  social.devPreviewNotice = { carried: true, locale: "de", text: "edited" };
  const problems = manifestProblems(manifest).join("\n");
  assert.match(problems, /cws-en-2-overview\.png.*development-preview notice/u);
  assert.match(problems, /promo-small-440x280\.png.*reason/u);
  assert.match(problems, /social-de-1200x630\.png.*notice text/u);
});

await test("an X card carries the notice like the social files, and the manifest names the one AMO set to upload", () => {
  const manifest = build("dry-run");
  const x = manifest.images.find((i) => i.file === "x-en-1200x600.png")!;
  assert.equal(x.role, "x-card");
  assert.equal(x.devPreviewNotice.carried, true);
  assert.deepEqual(
    manifest.images
      .filter((i) => i.role === "store-amo")
      .map((i) => [i.file, i.amoUpload]),
    [
      ["amo-en-1-workspace.png", true],
      ["amo-en-2-overview.png", true],
      ["amo-en-3-evidence.png", true],
      ["amo-de-1-workspace.png", false],
      ["amo-de-2-overview.png", false],
      ["amo-de-3-evidence.png", false],
    ],
  );
  assert.ok(
    manifest.images
      .filter((i) => i.role !== "store-amo")
      .every((i) => !("amoUpload" in i)),
  );
  const tampered = build("dry-run");
  tampered.images.find((i) => i.file === "amo-de-1-workspace.png")!.amoUpload =
    true;
  delete tampered.images.find((i) => i.file === "amo-en-1-workspace.png")!
    .amoUpload;
  const problems = manifestProblems(tampered).join("\n");
  assert.match(problems, /amo-de-1-workspace\.png: amoUpload is true/);
  assert.match(problems, /amo-en-1-workspace\.png: amoUpload is undefined/);
});
