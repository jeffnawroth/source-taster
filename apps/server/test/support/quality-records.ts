// SPDX-License-Identifier: AGPL-3.0-or-later
// Synthetic Quality gate records generated in code: counting witnesses sized
// to the ADR-0006 floors, never dataset content.
import type { GateRecord } from "../../scripts/quality/targets.ts";
import type { AiConfiguration } from "../../scripts/quality/extraction.ts";

/** Schema witness only: these strings are never real qualification evidence. */
export const syntheticAiConfiguration: AiConfiguration = {
  mode: "live",
  providerPath: "synthetic-only",
  modelId: "synthetic-model",
  region: "synthetic-eu",
  promptVersion: "synthetic-prompt-1",
  schemaVersion: "synthetic-schema-1",
  sampling: { temperature: 0 },
  determinism: "synthetic declaration",
  chunkSize: 1,
  processingAndStorageCountries: ["DE"],
  zeroRetention: true,
  qualificationRecord: "synthetic-only-not-a-provider-approval",
};

export function record(
  id: string,
  overrides: Partial<GateRecord> = {},
): GateRecord {
  return {
    id,
    input: `Synthetic record ${id}`,
    style: "apa",
    language: "en",
    sourceType: "article",
    class: "real-correct",
    acceptedIdentifiers: [{ type: "doi", value: `10.5555/${id}` }],
    expectedFields: { title: `Synthetic record ${id}` },
    ...overrides,
  };
}
const styles = [
  "apa",
  "mla",
  "chicago",
  "ieee",
  "vancouver",
  "harvard",
  "acs",
  "ama",
  "oxford",
  "springer",
  "din-iso-690",
];
/** A synthetic population sized exactly to the ADR-0006 launch floors. */
export function launchSizedRecords(): GateRecord[] {
  // APA: 110 records, 100 correctly cited; other styles: 40, 30 correct.
  // Every tenth-group: 3 German, 2 books, 1 web page (30 %, 20 %, 10 %).
  const real = styles.flatMap((style) =>
    Array.from({ length: style === "apa" ? 110 : 40 }, (_, i) =>
      record(`${style}-${i}`, {
        style,
        language: i % 10 < 3 ? "de" : "en",
        sourceType: i % 10 < 2 ? "book" : i % 10 === 2 ? "webpage" : "article",
        class:
          i < (style === "apa" ? 100 : 30) ? "real-correct" : "real-deviating",
      }),
    ),
  );
  const generators = [
    { model: "synthetic-model-a", provider: "provider-one" },
    { model: "synthetic-model-b", provider: "provider-one" },
    { model: "synthetic-model-c", provider: "provider-two" },
  ];
  const fake = Array.from({ length: 150 }, (_, i) =>
    record(`fake-${i}`, {
      class: i < 75 ? "invented" : "falsified",
      acceptedIdentifiers: [],
      generator: generators[i % 3]!,
    }),
  );
  return [...real, ...fake];
}
