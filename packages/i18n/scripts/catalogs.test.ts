// SPDX-License-Identifier: AGPL-3.0-or-later
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const catalogs: Record<string, Record<string, string>> = Object.fromEntries(
  await Promise.all(
    ["de", "en"].map(
      async (locale) =>
        [
          locale,
          JSON.parse(
            await readFile(
              new URL(`../messages/${locale}.json`, import.meta.url),
              "utf8",
            ),
          ) as Record<string, string>,
        ] as const,
    ),
  ),
);

await test("German product messages use formal address and the accepted domain vocabulary", () => {
  const outdated =
    /\b(?:du|dich|dir|dein\w*|Urteil\w*|Systemurteil\w*|Checks?|Quota|Plans|Prüfkontingent\w*)\b|Autor\/in/iu;
  assert.deepEqual(
    Object.entries(catalogs.de!).filter(([, value]) =>
      outdated.test(value.replace(/\{\w+\}/gu, "")),
    ),
    [],
  );
  assert.equal(catalogs.de!.report_verdict, "Befund");
  assert.match(catalogs.de!.commerce_open!, /Pläne und Prüfpakete/u);
});

await test("English product prose uses sentence case instead of capitalized domain nouns", () => {
  const capitalized =
    /\b(?:References?|Checks?|Quota|Verdicts?|Status(?:es)?|Sources?(?! Taster)|Candidates?|Scores?|Accounts?|Plans?|Preferences|History|Correction suggestions?|Best match|Data sources?|Contracting party|Bibliography selection|Verification reports?|Field scores?|Re-check)\b/gu;
  const violations: string[] = [];
  for (const [key, message] of Object.entries(catalogs.en!)) {
    for (const match of message.matchAll(capitalized)) {
      if (
        match.index !== 0 &&
        !/[.!?]\s*$/u.test(message.slice(0, match.index))
      )
        violations.push(`${key}: ${match[0]}`);
    }
  }
  assert.deepEqual(violations, []);
  assert.match(catalogs.en!.preferences_sync_off!, /Source Taster/u);
});

await test("completed searches state their scope and do not turn missing evidence into nonexistence", () => {
  assert.match(catalogs.en!.reason_search_completed!, /enabled data sources/u);
  assert.match(
    catalogs.en!.reason_search_completed!,
    /does not prove.*does not exist/u,
  );
  assert.match(
    catalogs.de!.reason_search_completed!,
    /aktivierten Datenquellen/u,
  );
  assert.match(
    catalogs.de!.reason_search_completed!,
    /kein Beleg.*nicht existiert/u,
  );
});

await test("the six verdict labels stay exact and separate from the four technical statuses", () => {
  for (const [locale, verdicts, statuses] of [
    [
      "en",
      [
        "Correct",
        "Exists, with deviations",
        "Mixed citation",
        "DOI conflict",
        "Not found",
        "Not verifiable",
      ],
      ["Running", "Not checked", "Cancelled", "Technical error"],
    ],
    [
      "de",
      [
        "Korrekt",
        "Existiert, mit Abweichungen",
        "Gemischte Referenz",
        "DOI-Konflikt",
        "Nicht gefunden",
        "Nicht verifizierbar",
      ],
      ["Läuft", "Nicht geprüft", "Abgebrochen", "Technischer Fehler"],
    ],
  ] as const) {
    const catalog = catalogs[locale]!;
    assert.deepEqual(
      [
        "correct",
        "exists",
        "mixed",
        "doi_conflict",
        "not_found",
        "not_verifiable",
      ].map((key) => catalog[`verdict_${key}`]),
      verdicts,
    );
    assert.deepEqual(
      ["running", "not_checked", "cancelled", "failed"].map(
        (key) => catalog[`status_${key}`],
      ),
      statuses,
    );
  }
  // Fixed statutory action copy is outside editorial voice changes.
  assert.equal(catalogs.de!.cancellation_button, "Verträge hier kündigen");
  assert.equal(catalogs.en!.cancellation_button, "Cancel contracts here");
});

await test("DE and EN keep the same messages and interpolation parameters", () => {
  const de = catalogs.de!;
  const en = catalogs.en!;
  assert.deepEqual(Object.keys(de).sort(), Object.keys(en).sort());
  for (const key of Object.keys(en)) {
    assert.ok(de[key]?.trim(), key);
    assert.ok(en[key]?.trim(), key);
    const parameters = (value: string) =>
      [...value.matchAll(/\{(\w+)\}/gu)].map((match) => match[1]).sort();
    assert.deepEqual(parameters(de[key]!), parameters(en[key]!), key);
  }
});
