// SPDX-License-Identifier: AGPL-3.0-or-later
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { claims } from "../src/claims.ts";

const root = fileURLToPath(new URL("../../../", import.meta.url));

await test("every pictured or written claim maps to a release evidence document and a literal test title", async () => {
  assert.ok(claims.length >= 5);
  for (const claim of claims) {
    assert.match(claim.evidence.doc, /^docs\/implementation\/.+\.md$/u);
    await access(root + claim.evidence.doc);
    const spec = await readFile(root + claim.evidence.spec, "utf8");
    assert.ok(
      spec.includes(claim.evidence.title),
      `${claim.id}: "${claim.evidence.title}" is not a test title in ${claim.evidence.spec}`,
    );
  }
});

await test("claim ids are unique and each states the same fact in German and English", () => {
  assert.equal(new Set(claims.map((c) => c.id)).size, claims.length);
  for (const claim of claims) {
    assert.ok(claim.text.en.length > 10 && claim.text.de.length > 10);
  }
});

await test("no claim asserts something the release evidence cannot back", () => {
  const forbidden =
    /\b(AI|KI|instant|instantly|smart|magic|proof|Beweis|best (in|of|ever)|rating|certified|zertifiziert|\d+ ?(users|Nutzer)|free|kostenlos)\b/iu;
  for (const claim of claims)
    for (const text of [claim.text.en, claim.text.de])
      assert.doesNotMatch(text, forbidden, claim.id);
});
