// SPDX-License-Identifier: AGPL-3.0-or-later
import assert from "node:assert/strict";
import { test } from "node:test";
import { claims } from "../src/claims.ts";
import { captureReferences } from "../src/fixtures.ts";
import { copy, imageAlt, imageClaims } from "../src/copy.ts";
import { imageSpecs } from "../src/specs.ts";

const locales = ["en", "de"] as const;
const allStrings = () =>
  Object.values(copy).flatMap((entry) =>
    locales.flatMap((l) => [entry.headline[l], entry.caption[l]]),
  );

await test("every image has alt text in both languages and its claims exist", () => {
  const known = new Set(claims.map((c) => c.id));
  for (const spec of imageSpecs) {
    const alt = imageAlt(spec);
    assert.ok(alt.en.length > 20 && alt.de.length > 20, spec.file);
    assert.notEqual(alt.en, alt.de, spec.file);
    for (const id of imageClaims(spec))
      assert.ok(known.has(id), `${spec.file}: ${id}`);
  }
});

await test("store screenshots and social previews carry at least one claim; promo tiles carry only the product line", () => {
  for (const spec of imageSpecs.filter(
    (s) => s.role.startsWith("store") || s.role === "social",
  ))
    assert.ok(imageClaims(spec).length >= 1, spec.file);
});

await test("copy follows the voice guide: calm, no hype words, no exclamation marks, formal German", () => {
  const hype =
    /\b(AI-powered|instantly|smart|magic|KI-gestützt|sofort|magisch)\b/iu;
  const informal = /\b(du|dein|deine|dir|dich)\b/iu;
  for (const text of allStrings()) {
    assert.doesNotMatch(text, /!/u, text);
    assert.doesNotMatch(text, hype, text);
  }
  for (const entry of Object.values(copy)) {
    assert.doesNotMatch(entry.headline.de, informal);
    assert.doesNotMatch(entry.caption.de, informal);
  }
});

await test("the decision stays with the person wherever Verdicts are summarised", () => {
  assert.match(copy.social.caption.en, /decision|you decide|person/iu);
  assert.match(copy.social.caption.de, /Entscheidung|entscheiden/iu);
});

await test("headline and caption fit the layout budget", () => {
  for (const entry of Object.values(copy))
    for (const l of locales) {
      assert.ok(entry.headline[l].length <= 48, entry.headline[l]);
      assert.ok(entry.caption[l].length <= 120, entry.caption[l]);
    }
});

await test("alt texts name Verdicts with their exact labels and follow the voice guide", () => {
  const byId = Object.fromEntries(
    captureReferences.map((r) => [r.id, r.verdict]),
  );
  const overview = imageSpecs.find((s) => s.story === "overview")!;
  const evidence = imageSpecs.find((s) => s.story === "evidence")!;
  for (const l of locales) {
    for (const r of captureReferences)
      assert.ok(imageAlt(overview)[l].includes(r.verdict[l]), `${l} ${r.id}`);
    assert.ok(imageAlt(evidence)[l].includes(byId.deviating![l]));
  }
  for (const spec of imageSpecs)
    for (const l of locales) {
      const text = imageAlt(spec)[l];
      assert.doesNotMatch(text, /!/u);
      assert.doesNotMatch(
        text,
        /\b(AI-powered|instantly|smart|magic|KI-gestützt|sofort|magisch)\b/iu,
      );
    }
});

await test("English copy, alt text and claims use sentence case: domain nouns are lower case mid-sentence, labels stay exact (voice-and-tone Terminology 5)", () => {
  // Verdict labels and the button label are shown as labels and stay exact.
  const labels = [
    ...captureReferences.map((r) => r.verdict.en),
    "Mixed citation",
    "Not found",
    "Not verifiable",
    "Check reference",
  ];
  const nouns =
    /\b(References?|Verdicts?|Statuses|Status|Best match|Original text|Checks?|Evidence|Candidates?)\b/u;
  const strings = [
    ...Object.values(copy).flatMap((e) => [e.headline.en, e.caption.en]),
    ...imageSpecs.map((s) => imageAlt(s).en),
    ...claims.map((c) => c.text.en),
  ];
  for (const raw of strings) {
    let text = raw;
    for (const label of labels) text = text.split(label).join("§");
    for (const sentence of text.split(/(?<=[.!?])\s+/u)) {
      const rest = sentence.replace(/^\S+\s*/u, "");
      assert.doesNotMatch(rest, nouns, raw);
    }
  }
});
